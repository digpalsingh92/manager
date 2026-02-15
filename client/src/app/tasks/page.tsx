"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchProjects } from "@/redux/slices/projectSlice";
import { fetchTasks, setSelectedTask } from "@/redux/slices/taskSlice";
import { setTaskModalOpen } from "@/redux/slices/uiSlice";
import { TaskModal } from "@/components/forms/TaskModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Select, SelectOption } from "@/components/ui/select";
import { format } from "date-fns";
import { CheckSquare, Flag, Calendar, ArrowRight } from "lucide-react";
import type { Task, TaskPriority, TaskStatus } from "@/types";

const priorityConfig: Record<
  TaskPriority,
  { label: string; variant: "destructive" | "warning" | "info" }
> = {
  HIGH: { label: "High", variant: "destructive" },
  MEDIUM: { label: "Medium", variant: "warning" },
  LOW: { label: "Low", variant: "info" },
};

const statusConfig: Record<
  TaskStatus,
  { label: string; variant: "default" | "info" | "warning" | "success" }
> = {
  TODO: { label: "To Do", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  REVIEW: { label: "Review", variant: "warning" },
  DONE: { label: "Done", variant: "success" },
};

export default function MyTasksPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { projects } = useAppSelector((state) => state.projects);
  const { tasks, isLoading } = useAppSelector((state) => state.tasks);
  const [selectedProject, setSelectedProject] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(fetchProjects({ limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    if (projects.length > 0) {
      const projectId = selectedProject || projects[0]?.id;
      if (projectId) {
        dispatch(fetchTasks({ projectId, params: { limit: 100 } }));
      }
    }
  }, [dispatch, projects, selectedProject]);

  // Filter tasks assigned to current user
  const myTasks = tasks.filter(
    (t) =>
      t.assignee?.id === user?.id &&
      (statusFilter ? t.status === statusFilter : true),
  );

  const handleTaskClick = (task: Task) => {
    dispatch(setSelectedTask(task));
    dispatch(setTaskModalOpen(true));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Tasks</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Tasks assigned to you across projects
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={selectedProject}
          onValueChange={setSelectedProject}
          className="w-full sm:w-48"
          placeholder="Select project"
        >
          {projects.map((p) => (
            <SelectOption key={p.id} value={p.id}>
              {p.name}
            </SelectOption>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="w-full sm:w-40"
          placeholder="All statuses"
        >
          <SelectOption value="">All Statuses</SelectOption>
          <SelectOption value="TODO">To Do</SelectOption>
          <SelectOption value="IN_PROGRESS">In Progress</SelectOption>
          <SelectOption value="REVIEW">Review</SelectOption>
          <SelectOption value="DONE">Done</SelectOption>
        </Select>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : myTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <CheckSquare className="h-7 w-7 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No tasks assigned</h3>
            <p className="text-sm text-neutral-500">
              Tasks assigned to you will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {myTasks.map((task) => {
            const priority = priorityConfig[task.priority];
            const status = statusConfig[task.status];
            return (
              <Card
                key={task.id}
                className="cursor-pointer hover:border-neutral-300 transition-all group"
                onClick={() => handleTaskClick(task)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-sm font-medium truncate">
                        {task.title}
                      </span>
                      {task.project?.name && (
                        <span className="text-xs text-neutral-400">
                          {task.project.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={status.variant} className="text-[10px]">
                      {status.label}
                    </Badge>
                    <Badge variant={priority.variant} className="text-[10px]">
                      <Flag className="h-2.5 w-2.5 mr-0.5" />
                      {priority.label}
                    </Badge>
                    {task.dueDate && (
                      <span className="text-[11px] text-neutral-400 hidden sm:flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.dueDate), "MMM d")}
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TaskModal />
    </div>
  );
}
