"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { optimisticMoveTask, moveTask } from "@/redux/slices/taskSlice";
import { KanbanColumn } from "./KanbanColumn";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/hooks/usePermission";
import { AddProjectStatusModal } from "@/components/forms/AddProjectStatusModal";

type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";

type ProjectStatus = {
  id: string;
  projectId: string;
  key: string;
  label: string;
  position: number;
};

export function KanbanBoard() {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((state) => state.tasks);
  const { currentProjectStatuses } = useAppSelector((state) => state.projects);
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const canUpdateProject = usePermission("update_project");

  const columns: ProjectStatus[] = currentProjectStatuses.length
    ? currentProjectStatuses
    : [
        { id: "TODO", projectId: "", key: "TODO", label: "To Do", position: 1 },
        {
          id: "IN_PROGRESS",
          projectId: "",
          key: "IN_PROGRESS",
          label: "In Progress",
          position: 2,
        },
        {
          id: "REVIEW",
          projectId: "",
          key: "REVIEW",
          label: "In Review",
          position: 3,
        },
        {
          id: "DONE",
          projectId: "",
          key: "DONE",
          label: "Done",
          position: 4,
        },
      ];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const columnId = over.id as string;

    const column = columns.find((c) => c.id === columnId);
    if (!column) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // If we already have this statusId, no-op (use any to avoid type drift)
    if ((task as any).statusId === column.id) return;

    dispatch(
      optimisticMoveTask({
        id: taskId,
        status: (column.key as TaskStatus) || task.status,
      }),
    );
    dispatch(
      moveTask({
        id: taskId,
        status: column.key as TaskStatus,
        // statusId is understood by backend; cast to any for TS
        statusId: column.id,
      } as any),
    );
  };

  const projectId = useAppSelector((state) => state.projects.currentProject?.id);

  const handleOpenAddColumn = () => {
    if (!projectId) return;
    setAddColumnOpen(true);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-center justify-between pb-2">
          <div className="text-xs text-neutral-400">
            Board columns are configurable per project.
          </div>
          {canUpdateProject && projectId && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleOpenAddColumn}
            >
              + Add Column
            </Button>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((status) => (
            <KanbanColumn
              key={status.id}
              status={status}
              tasks={tasks.filter((t) => {
                const tAny = t as any;
                if (tAny.statusId) return tAny.statusId === status.id;
                // Fallback for legacy tasks without statusId
                return t.status === (status.key as TaskStatus);
              })}
            />
          ))}
        </div>
      </DndContext>

      {canUpdateProject && projectId && (
        <AddProjectStatusModal
          projectId={projectId}
          open={addColumnOpen}
          onOpenChange={setAddColumnOpen}
        />
      )}
    </>
  );
}
