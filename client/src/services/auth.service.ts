import api from "./axios";
import type {
  ApiResponse,
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "@/types";

export const authService = {
  async login(data: LoginPayload): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/login", data);
    return res.data.data!;
  },

  async register(data: RegisterPayload): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/register", data);
    return res.data.data!;
  },

  async getProfile(): Promise<AuthUser> {
    const res = await api.get<ApiResponse<AuthUser>>("/auth/me");
    return res.data.data!;
  },
};
