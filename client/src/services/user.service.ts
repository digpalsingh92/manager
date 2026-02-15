import api from "./axios";
import type { ApiResponse, User, Role, Permission } from "@/types";

export const userService = {
  async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    const res = await api.get<ApiResponse<User[]>>("/users", { params });
    return res.data;
  },

  async updateUserRole(id: string, roleNames: string[]) {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}/role`, { roleNames });
    return res.data.data!;
  },

  async getRoles() {
    const res = await api.get<ApiResponse<Role[]>>("/roles");
    return res.data.data!;
  },

  async getPermissions() {
    const res = await api.get<ApiResponse<Permission[]>>("/permissions");
    return res.data.data!;
  },
};
