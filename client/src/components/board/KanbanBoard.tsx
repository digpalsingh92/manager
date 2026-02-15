"use client";

import React, { useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  setSelectedTask,
  optimisticMoveTask,
  revertMoveTask,
  moveTask,
} from "@/redux/slices/taskSlice";
import {
  setTaskModalOpen,
  setCreateTaskModalOpen,
} from "@/redux/slices/uiSlice";
import { TaskStatus, type Task } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const COLUMNS: TaskStatus[] = [
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.REVIEW,
  TaskStatus.DONE,
];

export function KanbanBoard() {
  const dispatch = useAppDispatch();
  const { tasks, isLoading } = useAppSelector((state) => state.tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as string;
      const newStatus = over.id as TaskStatus;
      const task = tasks.find((t) => t.id === taskId);

      if (!task || task.status === newStatus) return;

      const oldStatus = task.status;

      // Optimistic update
      dispatch(optimisticMoveTask({ taskId, newStatus }));

      // API call
      dispatch(moveTask({ id: taskId, status: newStatus }))
        .unwrap()
        .catch(() => {
          // Revert on failure
          dispatch(revertMoveTask({ taskId, oldStatus }));
        });
    },
    [dispatch, tasks],
  );

  const handleTaskClick = (task: Task) => {
    dispatch(setSelectedTask(task));
    dispatch(setTaskModalOpen(true));
  };

  const handleAddTask = () => {
    dispatch(setCreateTaskModalOpen(true));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div key={col} className="space-y-3 p-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-28 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pb-4">
        {COLUMNS.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          return (
            <KanbanColumn
              key={status}
              status={status}
              tasks={columnTasks}
              onTaskClick={handleTaskClick}
              onAddTask={status === TaskStatus.TODO ? handleAddTask : undefined}
            />
          );
        })}
      </div>
    </DndContext>
  );
}
