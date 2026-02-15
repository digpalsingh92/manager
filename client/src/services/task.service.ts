import api from "./axios";
import type {
  ApiResponse,
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskStatus,
} from "@/types";

export const taskService = {
  async getTasksByProject(
    projectId: string,
    params?: { page?: number; limit?: number; status?: string; priority?: string }
  ) {
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
    const res = await api.delete<ApiResponse>(`/tasks/${id}`);
    return res.data;
  },

  async moveTask(id: string, status: TaskStatus) {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}/move`, { status });
    return res.data.data!;
  },

  async assignTask(id: string, assigneeId: string | null) {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}/assign`, { assigneeId });
    return res.data.data!;
  },
};
