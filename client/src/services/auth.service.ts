import api from "./axios";
import type { ApiResponse, AuthResponse, LoginPayload, RegisterPayload, User } from "@/types";

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
};
