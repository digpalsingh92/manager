"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setCreateProjectModalOpen } from "@/redux/slices/uiSlice";
import { createProject } from "@/redux/slices/projectSlice";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().max(1000).optional(),
});

type CreateProjectForm = z.infer<typeof createProjectSchema>;

export function CreateProjectModal() {
  const dispatch = useAppDispatch();
  const { createProjectModalOpen } = useAppSelector((state) => state.ui);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
  });

  const handleClose = () => {
    dispatch(setCreateProjectModalOpen(false));
    reset();
  };

  const onSubmit = async (data: CreateProjectForm) => {
    await dispatch(createProject(data));
    handleClose();
  };

  return (
    <Dialog open={createProjectModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              placeholder="Enter project name..."
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this project about?"
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
