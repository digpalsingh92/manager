import api from "./axios";
import type { ApiResponse, Task, TaskStatus, CreateTaskPayload, UpdateTaskPayload } from "@/types";

export const taskService = {
  async getTasksByProject(projectId: string, params?: { page?: number; limit?: number }) {
    const res = await api.get<ApiResponse<Task[]>>(`/tasks/project/${projectId}`, { params });
    return res.data;
  },

  async createTask(data: CreateTaskPayload) {
    const res = await api.post<ApiResponse<Task>>("/tasks", data);
    return res.data.data!;
  },

  async updateTask(id: string, data: UpdateTaskPayload) {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data.data!;
  },

  async deleteTask(id: string) {
    await api.delete(`/tasks/${id}`);
  },

  async moveTask(id: string, status: TaskStatus) {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}/move`, { status });
    return res.data.data!;
  },

  async assignTask(id: string, assigneeId: string) {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}/assign`, { assigneeId });
    return res.data.data!;
  },
};
