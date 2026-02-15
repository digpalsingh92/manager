import api from "./axios";
import type {
  ApiResponse,
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
} from "@/types";

export const projectService = {
  async getProjects(params?: { page?: number; limit?: number; search?: string }) {
    const res = await api.get<ApiResponse<Project[]>>("/projects", { params });
    return res.data;
  },

  async getProject(id: string) {
    const res = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data.data!;
  },

  async createProject(data: CreateProjectPayload) {
    const res = await api.post<ApiResponse<Project>>("/projects", data);
    return res.data.data!;
  },

  async updateProject(id: string, data: UpdateProjectPayload) {
    const res = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return res.data.data!;
  },

  async deleteProject(id: string) {
    const res = await api.delete<ApiResponse>(`/projects/${id}`);
    return res.data;
  },

  async addMember(projectId: string, userId: string) {
    const res = await api.post<ApiResponse>(`/projects/${projectId}/members`, { userId });
    return res.data;
  },
};
