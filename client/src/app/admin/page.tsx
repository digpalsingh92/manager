"use client";

import React, { useEffect, useState } from "react";
import { useIsAdmin } from "@/hooks/usePermission";
import { userService } from "@/services/user.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/types";
import { Shield, Users } from "lucide-react";

export default function AdminPage() {
  const isAdmin = useIsAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await userService.getUsers({ limit: 50 });
        setUsers((res.data as User[]) || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Shield className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">
            Access Denied
          </h2>
          <p className="text-sm text-neutral-500">
            You don&#39;t have permission to view this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">Admin Panel</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Manage users and roles
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-2 p-4 border-b border-neutral-100">
            <Users className="h-4 w-4 text-neutral-400" />
            <h2 className="text-sm font-semibold text-neutral-900">
              Users ({users.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-50 transition-colors"
                >
                  <Avatar
                    fallback={`${user.firstName[0]}${user.lastName[0]}`}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.roles?.map((role) => (
                      <Badge
                        key={role}
                        variant={role === "admin" ? "default" : "secondary"}
                      >
                        {role}
                      </Badge>
                    ))}
                    <Badge variant={user.isActive ? "success" : "destructive"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
