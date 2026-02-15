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
import { Select, SelectOption } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setCreateTaskModalOpen } from "@/redux/slices/uiSlice";
import { createTask } from "@/redux/slices/taskSlice";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional(),
});

type CreateTaskForm = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  projectId: string;
}

export function CreateTaskModal({ projectId }: CreateTaskModalProps) {
  const dispatch = useAppDispatch();
  const { createTaskModalOpen } = useAppSelector((state) => state.ui);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskForm>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: "MEDIUM",
    },
  });

  const priorityValue = watch("priority");

  const handleClose = () => {
    dispatch(setCreateTaskModalOpen(false));
    reset();
  };

  const onSubmit = async (data: CreateTaskForm) => {
    await dispatch(
      createTask({
        title: data.title,
        description: data.description,
        priority: data.priority as any,
        projectId,
        dueDate: data.dueDate || undefined,
      }),
    );
    handleClose();
  };

  return (
    <Dialog open={createTaskModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a description..."
              {...register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priorityValue}
                onValueChange={(v) => setValue("priority", v as any)}
              >
                <SelectOption value="LOW">Low</SelectOption>
                <SelectOption value="MEDIUM">Medium</SelectOption>
                <SelectOption value="HIGH">High</SelectOption>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
