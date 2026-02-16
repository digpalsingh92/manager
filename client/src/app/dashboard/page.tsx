"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { usePermission } from "@/hooks/usePermission";
import { fetchProjects } from "@/redux/slices/projectSlice";
import { setCreateProjectModalOpen } from "@/redux/slices/uiSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import {
  FolderKanban,
  CheckSquare,
  Users,
  Plus,
  ArrowRight,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { projects, isLoading } = useAppSelector((state) => state.projects);
  const canCreateProject = usePermission("create_project");

  useEffect(() => {
    dispatch(fetchProjects({ limit: 5 }));
  }, [dispatch]);

  const totalProjects = projects.length;
  const totalTasks = projects.reduce(
    (sum, p) => sum + (p._count?.tasks || 0),
    0,
  );
  const totalMembers = projects.reduce(
    (sum, p) => sum + (p._count?.members || 0),
    0,
  );

  const stats = [
    {
      label: "Active Projects",
      value: totalProjects,
      icon: FolderKanban,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: CheckSquare,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Team Members",
      value: totalMembers,
      icon: Users,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Welcome back, {user?.firstName} 👋
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Here&#39;s what&#39;s happening across your projects
          </p>
        </div>
        {canCreateProject && (
          <Button
            onClick={() => dispatch(setCreateProjectModalOpen(true))}
            className="w-fit"
          >
            <Plus className="h-4 w-4" /> New Project
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">
                  {stat.value}
                </p>
                <p className="text-xs text-neutral-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-neutral-900 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ...(canCreateProject
                ? [
                    {
                      label: "New Project",
                      icon: FolderKanban,
                      action: () => dispatch(setCreateProjectModalOpen(true)),
                    },
                  ]
                : []),
              { label: "View Projects", icon: TrendingUp, href: "/projects" },
              { label: "My Tasks", icon: CheckSquare, href: "/tasks" },
              { label: "Recent Activity", icon: Clock, href: "/dashboard" },
            ].map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all"
                >
                  <item.icon className="h-4 w-4 text-neutral-400" />
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer text-left"
                >
                  <item.icon className="h-4 w-4 text-neutral-400" />
                  {item.label}
                </button>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-900">
            Recent Projects
          </h2>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to get started"
            actionLabel="Create Project"
            onAction={() => dispatch(setCreateProjectModalOpen(true))}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
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
        )}
      </div>
    </div>
  );
}
