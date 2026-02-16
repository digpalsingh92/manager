"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/hooks/useRedux";
import { openTaskDetail } from "@/redux/slices/uiSlice";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { Task, TaskPriority } from "@/types";
import { Calendar, MessageSquare, GripVertical } from "lucide-react";

const priorityConfig: Record<
  TaskPriority,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  LOW: { label: "Low", variant: "success" },
  MEDIUM: { label: "Medium", variant: "warning" },
  HIGH: { label: "High", variant: "destructive" },
};

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const dispatch = useAppDispatch();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const pConfig = priorityConfig[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white rounded-lg border border-neutral-200 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group",
        isDragging && "opacity-50 shadow-lg rotate-2",
      )}
      onClick={() => dispatch(openTaskDetail(task.id))}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-0.5 opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-neutral-500 transition-all cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-medium text-neutral-900 line-clamp-2 leading-relaxed">
            {task.title}
          </h4>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge
              variant={pConfig.variant}
              className="text-[10px] px-1.5 py-0"
            >
              {pConfig.label}
            </Badge>
            {task.dueDate && (
              <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
                <Calendar className="h-2.5 w-2.5" />
                {new Date(task.dueDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            {task._count?.comments ? (
              <span className="flex items-center gap-0.5 text-[10px] text-neutral-400">
                <MessageSquare className="h-2.5 w-2.5" />
                {task._count.comments}
              </span>
            ) : null}
          </div>
        </div>
        {task.assignee && (
          <Avatar
            fallback={`${task.assignee.firstName[0]}${task.assignee.lastName[0]}`}
            size="sm"
            className="shrink-0"
          />
        )}
      </div>
    </div>
  );
}
