"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/hooks/usePermission";
import { useAppSelector } from "@/hooks/useRedux";
import { userService } from "@/services/user.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Shield, Users, Search, Edit, Key } from "lucide-react";
import type { User, Role } from "@/types";

export default function AdminPage() {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isAdmin, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const [usersRes, rolesData] = await Promise.all([
          userService.getUsers({ limit: 100 }),
          userService.getRoles(),
        ]);
        setUsers(usersRes.data || []);
        setRoles(rolesData);
      } catch {
        // handle silently
      } finally {
        setIsLoading(false);
      }
    }
    if (isAdmin) loadData();
  }, [isAdmin]);

  const handleEditRoles = (user: User) => {
    setEditingUser(user);
    setSelectedRoles(user.roles || []);
  };

  const handleSaveRoles = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await userService.updateUserRole(editingUser.id, selectedRoles);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, roles: selectedRoles } : u,
        ),
      );
      setEditingUser(null);
    } catch {
      // handle silently
    } finally {
      setIsSaving(false);
    }
  };

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName],
    );
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-neutral-500">Access denied</p>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage users, roles, and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                <Users className="h-5 w-5 text-neutral-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-neutral-500">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                <Shield className="h-5 w-5 text-neutral-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">{roles.length}</p>
                <p className="text-xs text-neutral-500">Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                <Key className="h-5 w-5 text-neutral-700" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.isActive).length}
                </p>
                <p className="text-xs text-neutral-500">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">User Management</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      fallback={`${user.firstName[0]}${user.lastName[0]}`}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-neutral-400">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {user.roles?.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {role}
                        </Badge>
                      ))}
                    </div>
                    <Badge
                      variant={user.isActive ? "success" : "secondary"}
                      className="text-[10px]"
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditRoles(user)}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Roles & Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-lg border border-neutral-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">{role.name}</h4>
                  <Badge variant="secondary" className="text-[10px]">
                    {role.permissions?.length || 0} permissions
                  </Badge>
                </div>
                {role.description && (
                  <p className="text-xs text-neutral-500 mb-3">
                    {role.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {role.permissions?.map((perm) => (
                    <Badge
                      key={perm}
                      variant="outline"
                      className="text-[9px] px-1.5 py-0"
                    >
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent
          className="max-w-sm"
          onClose={() => setEditingUser(null)}
        >
          <DialogHeader>
            <DialogTitle>
              Edit Roles — {editingUser?.firstName} {editingUser?.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {roles.map((role) => (
              <label
                key={role.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 cursor-pointer hover:bg-neutral-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.name)}
                  onChange={() => toggleRole(role.name)}
                  className="rounded accent-neutral-900"
                />
                <div>
                  <p className="text-sm font-medium">{role.name}</p>
                  {role.description && (
                    <p className="text-xs text-neutral-400">
                      {role.description}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRoles} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Roles"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
