import { useAppSelector } from "./useRedux";

export function usePermission(permission: string): boolean {
  const user = useAppSelector((state) => state.auth.user);
  if (!user) return false;
  return user.permissions?.includes(permission) || false;
}

export function useIsAdmin(): boolean {
  const user = useAppSelector((state) => state.auth.user);
  if (!user) return false;
  const roles = user.roles || [];
  return roles.some((role) => role.toUpperCase() === "ADMIN");
}
