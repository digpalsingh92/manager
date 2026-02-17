"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/hooks/useRedux";
import { openTaskDetail } from "@/redux/slices/uiSlice";
import { moveTask, deleteTask } from "@/redux/slices/taskSlice";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import type { Task, TaskPriority, TaskStatus } from "@/types";
import { Calendar, MessageSquare, GripVertical, MoreVertical, Pencil, ArrowRightLeft, Trash2, Eye } from "lucide-react";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
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

  const handleCardClick = () => {
    if (menuOpen) return;
    dispatch(openTaskDetail(task.id));
  };

  const handleMove = (status: TaskStatus) => {
    if (status === task.status) return;
    setMenuOpen(false);
    void dispatch(moveTask({ id: task.id, status }));
  };

  const handleDelete = () => {
    setMenuOpen(false);
    void dispatch(deleteTask(task.id));
  };

  // Close menu on scroll or resize so a fixed-position popout doesn't get misaligned
  useEffect(() => {
    if (!menuOpen) return;
    const handleGlobalClose = () => setMenuOpen(false);
    window.addEventListener("scroll", handleGlobalClose, true);
    window.addEventListener("resize", handleGlobalClose);
    return () => {
      window.removeEventListener("scroll", handleGlobalClose, true);
      window.removeEventListener("resize", handleGlobalClose);
    };
  }, [menuOpen]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative bg-white rounded-lg border border-neutral-200 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group",
        isDragging && "opacity-50 shadow-lg rotate-2",
      )}
      onClick={handleCardClick}
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
        <div className="relative z-20 flex flex-col items-end gap-1">
          {task.assignee && (
            <Avatar
              fallback={`${task.assignee.firstName[0]}${task.assignee.lastName[0]}`}
              size="sm"
              className="shrink-0"
            />
          )}
          <button
            type="button"
            ref={actionButtonRef}
            className="p-1 rounded-md text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              if (menuOpen) {
                setMenuOpen(false);
                return;
              }
              if (actionButtonRef.current) {
                const rect = actionButtonRef.current.getBoundingClientRect();
                const estimatedWidth = 180;
                const viewportWidth = window.innerWidth;
                const top = rect.bottom + 4;
                let left = rect.right - estimatedWidth;
                if (left < 8) left = 8;
                if (left + estimatedWidth > viewportWidth - 8) {
                  left = viewportWidth - estimatedWidth - 8;
                }
                setMenuPosition({ top, left });
              }
              setMenuOpen(true);
            }}
            aria-label="Task actions"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {menuOpen && menuPosition && (
        <div
          className="fixed z-50 w-44 rounded-md border border-neutral-200 bg-white shadow-lg text-xs py-1"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <button
            type="button"
            className="flex w-full items-center gap-1.5 px-2 py-1.5 hover:bg-neutral-50 text-neutral-700"
            onClick={() => {
              setMenuOpen(false);
              dispatch(openTaskDetail(task.id));
            }}
          >
            <Eye className="h-3.5 w-3.5" />
            View / Edit card
          </button>
          <div className="border-t border-neutral-100 my-1" />
          <div className="px-2 py-1">
            <div className="flex items-center gap-1 text-[10px] text-neutral-400 mb-1">
              <ArrowRightLeft className="h-3 w-3" />
              Move card to
            </div>
            <div className="flex flex-wrap gap-1">
              {(["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as TaskStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    className={cn(
                      "px-1.5 py-0.5 rounded-full border text-[10px] transition-colors",
                      status === task.status
                        ? "border-neutral-300 bg-neutral-100 text-neutral-500 cursor-default"
                        : "border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-600",
                    )}
                    disabled={status === task.status}
                    onClick={() => handleMove(status)}
                  >
                    {status === "TODO" && "To Do"}
                    {status === "IN_PROGRESS" && "In Progress"}
                    {status === "REVIEW" && "Review"}
                    {status === "DONE" && "Done"}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="border-t border-neutral-100 my-1" />
          <button
            type="button"
            className="flex w-full items-center gap-1.5 px-2 py-1.5 text-red-600 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete card
          </button>
        </div>
      )}
    </div>
  );
}
