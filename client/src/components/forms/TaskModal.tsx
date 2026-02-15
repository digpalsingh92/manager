"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setTaskModalOpen } from "@/redux/slices/uiSlice";
import { setSelectedTask, deleteTask } from "@/redux/slices/taskSlice";
import { commentService } from "@/services/comment.service";
import { usePermission } from "@/hooks/usePermission";
import { format } from "date-fns";
import {
  Calendar,
  Flag,
  User,
  MessageSquare,
  Trash2,
  Send,
  Clock,
} from "lucide-react";
import type { Comment, TaskPriority, TaskStatus } from "@/types";

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

export function TaskModal() {
  const dispatch = useAppDispatch();
  const { taskModalOpen } = useAppSelector((state) => state.ui);
  const { selectedTask } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);
  const canDelete = usePermission("delete_task");
  const canComment = usePermission("comment_task");

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedTask?.id) {
      commentService
        .getCommentsByTask(selectedTask.id)
        .then((res) => setComments(res.data || []))
        .catch(() => {});
    }
  }, [selectedTask?.id]);

  const handleClose = () => {
    dispatch(setTaskModalOpen(false));
    dispatch(setSelectedTask(null));
    setComments([]);
    setNewComment("");
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    await dispatch(deleteTask(selectedTask.id));
    handleClose();
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;
    setIsSubmitting(true);
    try {
      const comment = await commentService.createComment({
        content: newComment.trim(),
        taskId: selectedTask.id,
      });
      setComments((prev) => [comment, ...prev]);
      setNewComment("");
    } catch (e) {
      // handle silently
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedTask) return null;

  const priority = priorityConfig[selectedTask.priority];
  const status = statusConfig[selectedTask.status];

  return (
    <Dialog open={taskModalOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-y-auto"
        onClose={handleClose}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={status.variant}>{status.label}</Badge>
            <Badge variant={priority.variant}>
              <Flag className="h-2.5 w-2.5 mr-1" />
              {priority.label}
            </Badge>
          </div>
          <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
          {selectedTask.description && (
            <DialogDescription className="text-neutral-600 whitespace-pre-wrap">
              {selectedTask.description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-100">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-500">Assignee:</span>
            {selectedTask.assignee ? (
              <span className="font-medium">
                {selectedTask.assignee.firstName}{" "}
                {selectedTask.assignee.lastName}
              </span>
            ) : (
              <span className="text-neutral-400">Unassigned</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-500">Due:</span>
            <span className="font-medium">
              {selectedTask.dueDate
                ? format(new Date(selectedTask.dueDate), "MMM d, yyyy")
                : "No due date"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-500">Created:</span>
            <span className="font-medium">
              {format(new Date(selectedTask.createdAt), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-neutral-400" />
            <span className="text-neutral-500">By:</span>
            <span className="font-medium">
              {selectedTask.createdBy.firstName}{" "}
              {selectedTask.createdBy.lastName}
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-neutral-400" />
            <h4 className="text-sm font-semibold">
              Comments ({comments.length})
            </h4>
          </div>

          {/* Add Comment */}
          {canComment && (
            <div className="flex gap-2 mb-4">
              <Avatar
                fallback={
                  user ? `${user.firstName[0]}${user.lastName[0]}` : "?"
                }
                size="sm"
              />
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[40px] text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Comment List */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.length === 0 && (
              <p className="text-xs text-neutral-400 text-center py-4">
                No comments yet
              </p>
            )}
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <Avatar
                  fallback={`${comment.user.firstName[0]}${comment.user.lastName[0]}`}
                  size="sm"
                />
                <div className="flex-1 rounded-lg bg-neutral-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">
                      {comment.user.firstName} {comment.user.lastName}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-700 mt-1">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {canDelete && (
          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete Task
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
