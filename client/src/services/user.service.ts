import api from "./axios";
import type { ApiResponse, User } from "@/types";

export const userService = {
  async getUsers(params?: { page?: number; limit?: number }) {
    const res = await api.get<ApiResponse<User[]>>("/users", { params });
    return res.data;
  },

  async updateUserRole(userId: string, roleId: string) {
    const res = await api.patch<ApiResponse<User>>(`/users/${userId}/role`, { roleId });
    return res.data.data!;
  },
};
