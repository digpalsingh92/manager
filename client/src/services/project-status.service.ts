import api from "./axios";
import type { ApiResponse } from "@/types";

export interface ProjectStatus {
  id: string;
  projectId: string;
  key: string;
  label: string;
  position: number;
}

export const projectStatusService = {
  async getStatuses(projectId: string) {
    const res = await api.get<ApiResponse<ProjectStatus[]>>(
      `/projects/${projectId}/statuses`,
    );
    return res.data.data || [];
  },

  async createStatus(projectId: string, payload: { label: string; key?: string }) {
    const res = await api.post<ApiResponse<ProjectStatus>>(
      `/projects/${projectId}/statuses`,
      payload,
    );
    return res.data.data!;
  },
};

