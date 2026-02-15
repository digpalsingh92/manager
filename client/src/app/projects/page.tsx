"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchProjects } from "@/redux/slices/projectSlice";
import { setCreateProjectModalOpen } from "@/redux/slices/uiSlice";
import { CreateProjectModal } from "@/components/forms/CreateProjectModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { usePermission } from "@/hooks/usePermission";
import { Plus, Search, FolderKanban, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { projects, isLoading } = useAppSelector((state) => state.projects);
  const canCreateProject = usePermission("create_project");
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchProjects({ limit: 50 }));
  }, [dispatch]);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage and organize your team&apos;s projects
          </p>
        </div>
        {canCreateProject && (
          <Button onClick={() => dispatch(setCreateProjectModalOpen(true))}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <FolderKanban className="h-7 w-7 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {search ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-sm text-neutral-500">
              {search
                ? "Try adjusting your search"
                : "Create your first project to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full hover:border-neutral-300 transition-all cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  {project.description && (
                    <p className="text-sm text-neutral-500 line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        {project.members?.slice(0, 3).map((m) => (
                          <Avatar
                            key={m.user.id}
                            fallback={`${m.user.firstName[0]}${m.user.lastName[0]}`}
                            size="sm"
                            className="border-2 border-white"
                          />
                        ))}
                      </div>
                      {(project._count?.members || 0) > 0 && (
                        <span className="text-xs text-neutral-400">
                          {project._count?.members} member
                          {(project._count?.members || 0) !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {project._count?.tasks || 0} tasks
                    </Badge>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-3">
                    Created {format(new Date(project.createdAt), "MMM d, yyyy")}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateProjectModal />
    </div>
  );
}
