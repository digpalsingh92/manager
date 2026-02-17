"use client";

import React, { useState } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addToast } from "@/redux/slices/uiSlice";
import { projectStatusService } from "@/services/project-status.service";
import { fetchProjectStatuses } from "@/redux/slices/projectSlice";

interface AddProjectStatusModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProjectStatusModal({
  projectId,
  open,
  onOpenChange,
}: AddProjectStatusModalProps) {
  const dispatch = useAppDispatch();
  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    setLabel("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    try {
      setIsSubmitting(true);
      await projectStatusService.createStatus(projectId, { label: label.trim() });
      dispatch(fetchProjectStatuses(projectId));
      dispatch(
        addToast({
          type: "success",
          message: "New column added to project",
        }),
      );
      handleClose();
    } catch (err: any) {
      dispatch(
        addToast({
          type: "error",
          message:
            err?.response?.data?.message ||
            "Failed to create column. Ensure the name is unique.",
        }),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Add Column</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="column-name">Column name *</Label>
            <Input
              id="column-name"
              placeholder="e.g. Code Review"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <p className="text-[10px] text-neutral-400">
              Default workflow columns already exist. Use this to add extra steps like
              Code Review or Testing.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !label.trim()}>
              {isSubmitting ? "Adding..." : "Add Column"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

