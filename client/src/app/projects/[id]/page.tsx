"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchProject } from "@/redux/slices/projectSlice";
import { fetchTasks } from "@/redux/slices/taskSlice";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { TaskModal } from "@/components/forms/TaskModal";
import { CreateTaskModal } from "@/components/forms/CreateTaskModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/hooks/usePermission";
import { ArrowLeft, Plus, Users, Settings } from "lucide-react";
import { setCreateTaskModalOpen } from "@/redux/slices/uiSlice";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const projectId = params.id as string;

  const { currentProject, isLoading: projectLoading } = useAppSelector(
    (state) => state.projects,
  );
  const { isLoading: tasksLoading } = useAppSelector((state) => state.tasks);
  const canCreateTask = usePermission("create_task");

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProject(projectId));
      dispatch(fetchTasks({ projectId, params: { limit: 100 } }));
    }
  }, [dispatch, projectId]);

  if (projectLoading || !currentProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/projects")}
            className="rounded-lg p-2 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {currentProject.name}
              </h1>
              <Badge variant="secondary">
                {currentProject._count?.tasks || 0} tasks
              </Badge>
            </div>
            {currentProject.description && (
              <p className="text-sm text-neutral-500 mt-1 max-w-xl">
                {currentProject.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Member Avatars */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {currentProject.members?.slice(0, 5).map((m) => (
                <Avatar
                  key={m.user.id}
                  fallback={`${m.user.firstName[0]}${m.user.lastName[0]}`}
                  size="sm"
                  className="border-2 border-white"
                />
              ))}
            </div>
            <span className="text-xs text-neutral-500 hidden sm:block">
              <Users className="h-3 w-3 inline mr-1" />
              {currentProject.members?.length || 0}
            </span>
          </div>

          {canCreateTask && (
            <Button
              size="sm"
              onClick={() => dispatch(setCreateTaskModalOpen(true))}
            >
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard />

      {/* Modals */}
      <TaskModal />
      <CreateTaskModal projectId={projectId} />
    </div>
  );
}
