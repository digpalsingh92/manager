import api from "./axios";
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, ChangePasswordPayload, ResetPasswordPayload, User } from "@/types";

export const authService = {
  async login(data: LoginPayload) {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
    return res.data.data!;
  },

  async register(data: RegisterPayload) {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", data);
    return res.data.data!;
  },

  async getProfile() {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data!;
  },

  async changePassword(data: ChangePasswordPayload) {
    const res = await api.put<ApiResponse<{ message: string }>>("/auth/change-password", data);
    return res.data;
  },

  async resetPassword(data: ResetPasswordPayload) {
    const res = await api.post<ApiResponse<{ message: string }>>("/auth/reset-password", data);
    return res.data;
  },
};
