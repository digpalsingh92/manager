"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { updateTask, deleteTask } from "@/redux/slices/taskSlice";
import { closeTaskDetail } from "@/redux/slices/uiSlice";
import { commentService } from "@/services/comment.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { Comment, TaskStatus, TaskPriority } from "@/types";
import { Calendar, MessageSquare, Trash2, Send } from "lucide-react";

const statusStyles: Record<
  TaskStatus,
  { label: string; variant: "default" | "info" | "warning" | "success" }
> = {
  TODO: { label: "To Do", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  REVIEW: { label: "Review", variant: "warning" },
  DONE: { label: "Done", variant: "success" },
};

const priorityStyles: Record<
  TaskPriority,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  LOW: { label: "Low", variant: "success" },
  MEDIUM: { label: "Medium", variant: "warning" },
  HIGH: { label: "High", variant: "destructive" },
};

export function TaskModal() {
  const dispatch = useAppDispatch();
  const { taskDetailModalOpen, selectedTaskId } = useAppSelector(
    (state) => state.ui,
  );
  const task = useAppSelector((state) =>
    state.tasks.tasks.find((t) => t.id === selectedTaskId),
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (selectedTaskId && taskDetailModalOpen) {
      setLoadingComments(true);
      commentService
        .getCommentsByTask(selectedTaskId)
        .then(setComments)
        .catch(() => setComments([]))
        .finally(() => setLoadingComments(false));
    }
  }, [selectedTaskId, taskDetailModalOpen]);

  const handleClose = () => dispatch(closeTaskDetail());

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTaskId) return;
    try {
      const comment = await commentService.createComment({
        taskId: selectedTaskId,
        content: newComment,
      });
      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch {
      /* silently fail */
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      await commentService.deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      /* silently fail */
    }
  };

  const handleDelete = async () => {
    if (!selectedTaskId) return;
    await dispatch(deleteTask(selectedTaskId));
    handleClose();
  };

  if (!task) return null;

  return (
    <Dialog open={taskDetailModalOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-lg max-h-[85vh] overflow-y-auto"
        onClose={handleClose}
      >
        <DialogHeader>
          <DialogTitle className="pr-8">{task.title}</DialogTitle>
        </DialogHeader>

        {/* Status & Priority */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Badge variant={statusStyles[task.status].variant}>
            {statusStyles[task.status].label}
          </Badge>
          <Badge variant={priorityStyles[task.priority].variant}>
            {priorityStyles[task.priority].label}
          </Badge>
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-neutral-500">
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div className="mb-4">
            <p className="text-sm text-neutral-600 leading-relaxed">
              {task.description}
            </p>
          </div>
        )}

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center gap-2 mb-5 pb-5 border-b border-neutral-100">
            <span className="text-xs text-neutral-400">Assigned to</span>
            <Avatar
              fallback={`${task.assignee.firstName[0]}${task.assignee.lastName[0]}`}
              size="sm"
            />
            <span className="text-xs font-medium text-neutral-700">
              {task.assignee.firstName} {task.assignee.lastName}
            </span>
          </div>
        )}

        {/* Comments */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-700">
              Comments ({comments.length})
            </span>
          </div>

          <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5 group">
                <Avatar
                  fallback={`${c.user.firstName[0]}${c.user.lastName[0]}`}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-700">
                      {c.user.firstName} {c.user.lastName}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
            {loadingComments && (
              <p className="text-xs text-neutral-400">Loading comments...</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="text-xs h-8"
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <Button
              type="button"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={handleAddComment}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-5 pt-5 border-t border-neutral-100">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-3.5 w-3.5" /> Delete Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
