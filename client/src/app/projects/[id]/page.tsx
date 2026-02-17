"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchProjectById, fetchProjectStatuses } from "@/redux/slices/projectSlice";
import { fetchTasksByProject } from "@/redux/slices/taskSlice";
import { setCreateTaskModalOpen } from "@/redux/slices/uiSlice";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, Calendar, UserPlus } from "lucide-react";
import { AddProjectMemberModal } from "@/components/forms/AddProjectMemberModal";
import { usePermission } from "@/hooks/usePermission";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const dispatch = useAppDispatch();
  const { currentProject, isLoading } = useAppSelector(
    (state) => state.projects,
  );
  const { tasks } = useAppSelector((state) => state.tasks);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const canManageMembers = usePermission("manage_members");

  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchProjectStatuses(id));
      dispatch(fetchTasksByProject(id));
    }
  }, [id, dispatch]);

  if (isLoading || !currentProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-96 w-72" />
          ))}
        </div>
      </div>
    );
  }

  const taskStats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "DONE").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            {currentProject.name}
          </h1>
          {currentProject.description && (
            <p className="text-sm text-neutral-500 mt-1 max-w-lg">
              {currentProject.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Calendar className="h-3.5 w-3.5" />
              Created {new Date(currentProject.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <Users className="h-3.5 w-3.5" />
              {currentProject._count?.members ||
                currentProject.members?.length ||
                0}{" "}
              members
            </div>
            <Badge variant="secondary">{taskStats.total} tasks</Badge>
            {taskStats.total > 0 && (
              <Badge variant="success">
                {Math.round((taskStats.done / taskStats.total) * 100)}% complete
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {canManageMembers && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setAddMemberOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              Add Members
            </Button>
          )}
          <Button
            onClick={() => dispatch(setCreateTaskModalOpen(true))}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Task
          </Button>
        </div>
      </div>

      {/* Members */}
      {currentProject.members && currentProject.members.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 mr-1">Team:</span>
          <div className="flex -space-x-1.5">
            {currentProject.members.slice(0, 8).map((m) => (
              <Avatar
                key={m.id}
                fallback={`${m.user.firstName[0]}${m.user.lastName[0]}`}
                size="sm"
                className="border-2 border-white"
              />
            ))}
          </div>
        </div>
      )}

      {canManageMembers && (
        <AddProjectMemberModal
          projectId={id}
          open={addMemberOpen}
          onOpenChange={setAddMemberOpen}
          existingMembers={currentProject.members}
        />
      )}

      {/* Kanban Board */}
      <KanbanBoard />
    </div>
  );
}
