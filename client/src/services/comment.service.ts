import api from "./axios";
import type { ApiResponse, Comment, CreateCommentPayload } from "@/types";

export const commentService = {
  async getCommentsByTask(
    taskId: string,
    params?: { page?: number; limit?: number }
  ) {
    const res = await api.get<ApiResponse<Comment[]>>(`/comments/task/${taskId}`, { params });
    return res.data;
  },

  async createComment(data: CreateCommentPayload) {
    const res = await api.post<ApiResponse<Comment>>("/comments", data);
    return res.data.data!;
  },

  async deleteComment(id: string) {
    const res = await api.delete<ApiResponse>(`/comments/${id}`);
    return res.data;
  },
};
