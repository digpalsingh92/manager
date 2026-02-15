"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchProjects } from "@/redux/slices/projectSlice";
import { setCreateProjectModalOpen } from "@/redux/slices/uiSlice";
import { CreateProjectModal } from "@/components/forms/CreateProjectModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { usePermission } from "@/hooks/usePermission";
import {
  Plus,
  FolderKanban,
  ArrowRight,
  Users,
  CheckSquare,
} from "lucide-react";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { projects, isLoading } = useAppSelector((state) => state.projects);
  const canCreateProject = usePermission("create_project");

  useEffect(() => {
    dispatch(fetchProjects({ limit: 10 }));
  }, [dispatch]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.firstName}{" "}
            <span className="inline-block animate-[wave_1.5s_ease-in-out_infinite]">
              👋
            </span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Here&apos;s what&apos;s happening across your projects
          </p>
        </div>
        {canCreateProject && (
          <Button onClick={() => dispatch(setCreateProjectModalOpen(true))}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                <FolderKanban className="h-5 w-5 text-neutral-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-neutral-500">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                <CheckSquare className="h-5 w-5 text-neutral-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {projects.reduce((a, p) => a + (p._count?.tasks || 0), 0)}
                </p>
                <p className="text-xs text-neutral-500">Total Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                <Users className="h-5 w-5 text-neutral-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {projects.reduce((a, p) => a + (p._count?.members || 0), 0)}
                </p>
                <p className="text-xs text-neutral-500">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Projects</h2>
          <Link
            href="/projects"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <FolderKanban className="h-7 w-7 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No projects yet</h3>
              <p className="text-sm text-neutral-500 mb-4">
                Create your first project to get started
              </p>
              {canCreateProject && (
                <Button
                  onClick={() => dispatch(setCreateProjectModalOpen(true))}
                >
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full hover:border-neutral-300 transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base group-hover:text-neutral-700 transition-colors">
                        {project.name}
                      </CardTitle>
                      <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {project.description && (
                      <p className="text-sm text-neutral-500 line-clamp-2 mb-4">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1.5">
                        {project.members?.slice(0, 4).map((m) => (
                          <Avatar
                            key={m.user.id}
                            fallback={`${m.user.firstName[0]}${m.user.lastName[0]}`}
                            size="sm"
                            className="border-2 border-white"
                          />
                        ))}
                        {(project.members?.length || 0) > 4 && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 border-2 border-white text-[10px] font-medium text-neutral-500">
                            +{project.members!.length - 4}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {project._count?.tasks || 0} tasks
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <CreateProjectModal />
    </div>
  );
}
