import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Project, CreateProjectPayload } from "@/types";
import { projectService } from "@/services/project.service";
import { projectStatusService, type ProjectStatus } from "@/services/project-status.service";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  currentProjectStatuses: ProjectStatus[];
  isLoading: boolean;
  error: string | null;
  total: number;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  currentProjectStatuses: [],
  isLoading: false,
  error: null,
  total: 0,
};

export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const res = await projectService.getProjects(params);
      return { projects: res.data || [], pagination: res.meta?.pagination };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch projects");
    }
  },
);

export const fetchProjectById = createAsyncThunk(
  "projects/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await projectService.getProjectById(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch project");
    }
  },
);

export const fetchProjectStatuses = createAsyncThunk(
  "projects/fetchStatuses",
  async (projectId: string, { rejectWithValue }) => {
    try {
      return await projectStatusService.getStatuses(projectId);
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch project statuses",
      );
    }
  },
);

export const createProject = createAsyncThunk(
  "projects/create",
  async (data: CreateProjectPayload, { rejectWithValue }) => {
    try {
      return await projectService.createProject(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create project");
    }
  },
);

export const deleteProject = createAsyncThunk(
  "projects/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete project");
    }
  },
);

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.currentProjectStatuses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.projects;
        state.total = action.payload.pagination?.total || action.payload.projects.length;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter((p) => p.id !== action.payload);
      })
      .addCase(fetchProjectStatuses.fulfilled, (state, action) => {
        state.currentProjectStatuses = action.payload;
      });
  },
});

export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
