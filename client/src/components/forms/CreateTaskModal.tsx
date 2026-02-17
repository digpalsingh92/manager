"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { createTask } from "@/redux/slices/taskSlice";
import { setCreateTaskModalOpen } from "@/redux/slices/uiSlice";
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

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  dueDate: z.string().optional(),
  assigneeId: z.string().uuid().optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
});

type FormData = z.infer<typeof schema>;

export function CreateTaskModal() {
  const dispatch = useAppDispatch();
  const { createTaskModalOpen } = useAppSelector((state) => state.ui);
  const { currentProject } = useAppSelector((state) => state.projects);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any, 
    defaultValues: { priority: "MEDIUM" },
  });

  const priority = watch("priority");

  const handleClose = () => {
    dispatch(setCreateTaskModalOpen(false));
    reset();
  };

  const onSubmit = async (data: FormData) => {
    if (!currentProject) return;
    await dispatch(
      createTask({
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate,
        projectId: currentProject.id,
        assigneeId: data.assigneeId,
      }),
    ).unwrap();
    handleClose();
  };

  return (
    <Dialog open={createTaskModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" onClose={handleClose}>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
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
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the task..."
              rows={3}
              {...register("description")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) =>
                  setValue("priority", v as FormData["priority"])
                }
              >
                <SelectOption value="LOW">Low</SelectOption>
                <SelectOption value="MEDIUM">Medium</SelectOption>
                <SelectOption value="HIGH">High</SelectOption>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>
          </div>
          {currentProject && currentProject.members && currentProject.members.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="assignee">Assign To</Label>
              <Select
                value={watch("assigneeId") || ""}
                onValueChange={(v) => setValue("assigneeId", v)}
              >
                <SelectOption value="">Unassigned</SelectOption>
                {currentProject.members.map((m) => (
                  <SelectOption key={m.id} value={m.userId}>
                    {m.user.firstName} {m.user.lastName} ({m.user.email})
                  </SelectOption>
                ))}
              </Select>
              <p className="text-[10px] text-neutral-400">
                You can assign this task to a single project member.
              </p>
            </div>
          )}
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
