"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { usePermission } from "@/hooks/usePermission";
import { fetchProjects } from "@/redux/slices/projectSlice";
import { setCreateProjectModalOpen } from "@/redux/slices/uiSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Plus, Search, FolderKanban, Grid3X3, List } from "lucide-react";

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { projects, isLoading } = useAppSelector((state) => state.projects);
  const canCreateProject = usePermission("create_project");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    dispatch(fetchProjects({}));
  }, [dispatch]);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Projects</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            {projects.length} projects total
          </p>
        </div>
        {canCreateProject && (
          <Button onClick={() => dispatch(setCreateProjectModalOpen(true))}>
            <Plus className="h-4 w-4" /> New Project
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setView("grid")}
            className={`p-2 transition-colors cursor-pointer ${view === "grid" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-600"}`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 transition-colors cursor-pointer ${view === "list" ? "bg-neutral-900 text-white" : "text-neutral-400 hover:text-neutral-600"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={search ? "No projects found" : "No projects yet"}
          description={
            search
              ? "Try adjusting your search"
              : "Create your first project to get started"
          }
          actionLabel={search ? undefined : "Create Project"}
          onAction={
            search ? undefined : () => dispatch(setCreateProjectModalOpen(true))
          }
        />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1">
                      {project.name}
                    </h3>
                    <Badge variant="secondary" className="shrink-0 ml-2">
                      {project._count?.tasks || 0} tasks
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2 mb-4 leading-relaxed">
                    {project.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {project.members?.slice(0, 3).map((m) => (
                        <Avatar
                          key={m.id}
                          fallback={`${m.user.firstName[0]}${m.user.lastName[0]}`}
                          size="sm"
                          className="border-2 border-white"
                        />
                      ))}
                      {(project._count?.members || 0) > 3 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-[10px] font-medium text-neutral-500 border-2 border-white">
                          +{(project._count?.members || 0) - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 shrink-0">
                    <FolderKanban className="h-5 w-5 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-neutral-900 truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-neutral-500 truncate">
                      {project.description || "No description"}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {project._count?.tasks || 0} tasks
                  </Badge>
                  <div className="flex -space-x-1.5 hidden sm:flex">
                    {project.members?.slice(0, 3).map((m) => (
                      <Avatar
                        key={m.id}
                        fallback={`${m.user.firstName[0]}${m.user.lastName[0]}`}
                        size="sm"
                        className="border-2 border-white"
                      />
                    ))}
                  </div>
                  <span className="text-xs text-neutral-400 hidden md:block">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
