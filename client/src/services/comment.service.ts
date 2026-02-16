import api from "./axios";
import type { ApiResponse, Comment } from "@/types";

export const commentService = {
  async getCommentsByTask(taskId: string) {
    const res = await api.get<ApiResponse<Comment[]>>(`/comments/task/${taskId}`);
    return res.data.data!;
  },

  async createComment(data: { taskId: string; content: string }) {
    const res = await api.post<ApiResponse<Comment>>("/comments", data);
    return res.data.data!;
  },

  async deleteComment(id: string) {
    await api.delete(`/comments/${id}`);
  },
};
