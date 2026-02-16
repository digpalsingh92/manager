import api from "./axios";
import type { ApiResponse, Project, CreateProjectPayload, ProjectMember } from "@/types";

export const projectService = {
  async getProjects(params?: { page?: number; limit?: number; search?: string }) {
    const res = await api.get<ApiResponse<Project[]>>("/projects", { params });
    return res.data;
  },

  async getProjectById(id: string) {
    const res = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data.data!;
  },

  async createProject(data: CreateProjectPayload) {
    const res = await api.post<ApiResponse<Project>>("/projects", data);
    return res.data.data!;
  },

  async updateProject(id: string, data: Partial<CreateProjectPayload>) {
    const res = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return res.data.data!;
  },

  async deleteProject(id: string) {
    await api.delete(`/projects/${id}`);
  },

  async addMember(projectId: string, userId: string) {
    const res = await api.post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, { userId });
    return res.data.data!;
  },
};
