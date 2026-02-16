"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchProjects } from "@/redux/slices/projectSlice";
import { openTaskDetail } from "@/redux/slices/uiSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectOption } from "@/components/ui/select";
import { taskService } from "@/services/task.service";
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { CheckSquare, Calendar, Filter } from "lucide-react";

const statusConfig: Record<
  TaskStatus,
  { label: string; variant: "default" | "info" | "warning" | "success" }
> = {
  TODO: { label: "To Do", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  REVIEW: { label: "Review", variant: "warning" },
  DONE: { label: "Done", variant: "success" },
};

const priorityConfig: Record<
  TaskPriority,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  LOW: { label: "Low", variant: "success" },
  MEDIUM: { label: "Medium", variant: "warning" },
  HIGH: { label: "High", variant: "destructive" },
};

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector((state) => state.projects);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");

  useEffect(() => {
    dispatch(fetchProjects({}));
  }, [dispatch]);

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(
          projects.map((p) =>
            taskService.getTasksByProject(p.id, { limit: 100 }),
          ),
        );
        const tasks = results.flatMap((r) => r.data || []);
        setAllTasks(tasks);
      } catch {
        setAllTasks([]);
      } finally {
        setLoading(false);
      }
    };
    if (projects.length > 0) loadTasks();
    else setLoading(false);
  }, [projects]);

  const filtered = allTasks.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900">My Tasks</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          {allTasks.length} tasks across all projects
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Filter className="h-3.5 w-3.5" /> Filters:
        </div>
        <Select
          value={filterStatus}
          onValueChange={setFilterStatus}
          className="w-36"
        >
          <SelectOption value="">All Status</SelectOption>
          <SelectOption value="TODO">To Do</SelectOption>
          <SelectOption value="IN_PROGRESS">In Progress</SelectOption>
          <SelectOption value="REVIEW">Review</SelectOption>
          <SelectOption value="DONE">Done</SelectOption>
        </Select>
        <Select
          value={filterPriority}
          onValueChange={setFilterPriority}
          className="w-36"
        >
          <SelectOption value="">All Priority</SelectOption>
          <SelectOption value="LOW">Low</SelectOption>
          <SelectOption value="MEDIUM">Medium</SelectOption>
          <SelectOption value="HIGH">High</SelectOption>
        </Select>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={
            allTasks.length > 0
              ? "Try adjusting your filters"
              : "Tasks will appear here when assigned to you"
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <Card
              key={task.id}
              className="hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer"
              onClick={() => dispatch(openTaskDetail(task.id))}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-neutral-900 truncate">
                    {task.title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">
                    {task.project?.name || "Unknown project"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <Badge variant={statusConfig[task.status].variant}>
                    {statusConfig[task.status].label}
                  </Badge>
                  <Badge variant={priorityConfig[task.priority].variant}>
                    {priorityConfig[task.priority].label}
                  </Badge>
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-[10px] text-neutral-400 hidden sm:flex">
                      <Calendar className="h-3 w-3" />
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  {task.assignee && (
                    <Avatar
                      fallback={`${task.assignee.firstName[0]}${task.assignee.lastName[0]}`}
                      size="sm"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
