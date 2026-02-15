"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { TaskCard } from "./TaskCard";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/types";

const columnConfig: Record<
  TaskStatus,
  { title: string; color: string; dotColor: string }
> = {
  TODO: { title: "To Do", color: "bg-neutral-50", dotColor: "bg-neutral-400" },
  IN_PROGRESS: {
    title: "In Progress",
    color: "bg-blue-50/50",
    dotColor: "bg-blue-500",
  },
  REVIEW: {
    title: "Review",
    color: "bg-amber-50/50",
    dotColor: "bg-amber-500",
  },
  DONE: {
    title: "Done",
    color: "bg-emerald-50/50",
    dotColor: "bg-emerald-500",
  },
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: () => void;
}

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
    data: { status },
  });

  const config = columnConfig[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border border-neutral-200 min-h-[500px] w-full min-w-[280px] transition-colors duration-200",
        config.color,
        isOver &&
          "border-neutral-400 ring-2 ring-neutral-200 bg-neutral-100/50",
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <div className={cn("h-2.5 w-2.5 rounded-full", config.dotColor)} />
          <h3 className="text-sm font-semibold text-neutral-700">
            {config.title}
          </h3>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {tasks.length}
          </Badge>
        </div>
        {onAddTask && (
          <button
            onClick={onAddTask}
            className="rounded-md p-1 text-neutral-400 hover:text-neutral-900 hover:bg-white transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 space-y-2.5 p-3 pt-1 overflow-y-auto">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-10 w-10 rounded-full bg-neutral-200/50 flex items-center justify-center mb-2">
              <Plus className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-400">No tasks yet</p>
          </div>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  );
}
