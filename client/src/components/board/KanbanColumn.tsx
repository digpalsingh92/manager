"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import type { Task, TaskStatus } from "@/types";

const columnConfig: Record<TaskStatus, { label: string; color: string }> = {
  TODO: { label: "To Do", color: "bg-neutral-400" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-500" },
  REVIEW: { label: "In Review", color: "bg-amber-500" },
  DONE: { label: "Done", color: "bg-emerald-500" },
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = columnConfig[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col min-w-[280px] w-[280px] lg:flex-1 lg:w-auto rounded-xl bg-neutral-50 border border-neutral-200 transition-colors",
        isOver && "border-neutral-400 bg-neutral-100/50",
      )}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 p-3 border-b border-neutral-200">
        <div className={cn("h-2 w-2 rounded-full", config.color)} />
        <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
          {config.label}
        </span>
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-neutral-200 px-1.5 text-[10px] font-semibold text-neutral-600">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-neutral-400">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
