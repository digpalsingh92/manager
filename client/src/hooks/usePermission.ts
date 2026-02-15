"use client";

import { useAppSelector } from "./useRedux";

export function usePermission(permission: string): boolean {
  const user = useAppSelector((state) => state.auth.user);
  if (!user?.permissions) return false;
  return user.permissions.includes(permission);
}

export function useHasRole(role: string): boolean {
  const user = useAppSelector((state) => state.auth.user);
  if (!user?.roles) return false;
  return user.roles.includes(role);
}

export function useIsAdmin(): boolean {
  return useHasRole("ADMIN");
}
