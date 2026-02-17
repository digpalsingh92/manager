import api from "./axios";
import type { ApiResponse, User } from "@/types";

export const userService = {
  async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    const res = await api.get<ApiResponse<User[]>>("/users", { params });
    return res.data;
  },

  // Search users by name or email for project membership (Admin & PM via `manage_members`)
  async searchUsers(params: { page?: number; limit?: number; search?: string }) {
    const res = await api.get<ApiResponse<User[]>>("/users/search", { params });
    return res.data;
  },

  async updateUserRole(userId: string, roleNames: string[]) {
    const res = await api.patch<ApiResponse<User>>(`/users/${userId}/role`, {
      roleNames,
    });
    return res.data.data!;
  },
};
