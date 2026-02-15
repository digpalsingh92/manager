"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical, MessageSquare, Calendar, Flag } from "lucide-react";
import { format } from "date-fns";
import type { Task, TaskPriority } from "@/types";

const priorityConfig: Record<
  TaskPriority,
  { label: string; variant: "destructive" | "warning" | "info" }
> = {
  HIGH: { label: "High", variant: "destructive" },
  MEDIUM: { label: "Medium", variant: "warning" },
  LOW: { label: "Low", variant: "info" },
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const priority = priorityConfig[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border border-neutral-200 bg-white p-3.5 shadow-sm transition-all duration-150 hover:shadow-md cursor-pointer",
        isDragging && "opacity-50 shadow-lg rotate-2 scale-105 z-50",
      )}
      onClick={onClick}
    >
      {/* Drag Handle + Priority */}
      <div className="flex items-center justify-between mb-2">
        <Badge variant={priority.variant} className="text-[10px]">
          <Flag className="h-2.5 w-2.5 mr-1" />
          {priority.label}
        </Badge>
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 rounded hover:bg-neutral-100"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-neutral-400" />
        </button>
      </div>

      {/* Title */}
      <h4 className="text-sm font-medium text-neutral-900 mb-1 line-clamp-2">
        {task.title}
      </h4>

      {/* Description Preview */}
      {task.description && (
        <p className="text-xs text-neutral-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[11px] text-neutral-400">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), "MMM d")}
            </span>
          )}
          {task._count?.comments !== undefined && task._count.comments > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-neutral-400">
              <MessageSquare className="h-3 w-3" />
              {task._count.comments}
            </span>
          )}
        </div>

        {task.assignee && (
          <Avatar
            fallback={`${task.assignee.firstName[0]}${task.assignee.lastName[0]}`}
            size="sm"
          />
        )}
      </div>
    </div>
  );
}
