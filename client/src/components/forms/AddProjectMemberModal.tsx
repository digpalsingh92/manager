"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import { userService } from "@/services/user.service";
import { projectService } from "@/services/project.service";
import type { ProjectMember, User } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { addToast } from "@/redux/slices/uiSlice";
import { fetchProjectById } from "@/redux/slices/projectSlice";

interface AddProjectMemberModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingMembers?: ProjectMember[];
}

export function AddProjectMemberModal({
  projectId,
  open,
  onOpenChange,
  existingMembers = [],
}: AddProjectMemberModalProps) {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      const res = await userService.searchUsers({ search: query.trim(), limit: 10, page: 1 });
      const users = res.data || [];

      // Filter out users already in the project
      const memberIds = new Set(existingMembers.map((m) => m.userId));
      setResults(users.filter((u) => !memberIds.has(u.id)));
    } catch (err: any) {
      dispatch(
        addToast({
          type: "error",
          message: err?.response?.data?.message || "Failed to search users",
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (user: User) => {
    try {
      await projectService.addMember(projectId, user.id);
      dispatch(
        addToast({
          type: "success",
          message: `${user.firstName} ${user.lastName} added to project`,
        }),
      );
      // Refresh project to update members list
      dispatch(fetchProjectById(projectId));
      // Remove from local results to avoid duplicate adds
      setResults((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err: any) {
      dispatch(
        addToast({
          type: "error",
          message: err?.response?.data?.message || "Failed to add member",
        }),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Add Project Members</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="space-y-1.5">
            <p className="text-xs text-neutral-500">
              Search users by name or email to add them to this project.
            </p>
            <Input
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </DialogFooter>
        </form>

        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {results.length === 0 && query && !isLoading && (
            <p className="text-xs text-neutral-400">No users found or all are already members.</p>
          )}
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Avatar
                  size="sm"
                  fallback={`${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}` || user.email[0]}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-neutral-900">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-neutral-500">{user.email}</span>
                </div>
              </div>
              <Button size="sm" onClick={() => handleAddMember(user)}>
                Add
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

