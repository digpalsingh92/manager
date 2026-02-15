import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { projectService } from "@/services/project.service";
import type { Project, CreateProjectPayload, UpdateProjectPayload, Pagination } from "@/types";

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  pagination: null,
  isLoading: false,
  error: null,
};

// ─── Thunks ──────────────────────────────────
export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (params: { page?: number; limit?: number; search?: string } = {}, { rejectWithValue }) => {
    try {
      const res = await projectService.getProjects(params);
      return { projects: res.data!, pagination: res.meta?.pagination };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch projects");
    }
  }
);

export const fetchProject = createAsyncThunk(
  "projects/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      return await projectService.getProject(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch project");
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/create",
  async (data: CreateProjectPayload, { rejectWithValue }) => {
    try {
      return await projectService.createProject(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create project");
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/update",
  async ({ id, data }: { id: string; data: UpdateProjectPayload }, { rejectWithValue }) => {
    try {
      return await projectService.updateProject(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update project");
    }
  }
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
  }
);

// ─── Slice ───────────────────────────────────
const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearCurrentProject(state) {
      state.currentProject = null;
    },
    clearProjectError(state) {
      state.error = null;
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
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(createProject.fulfilled, (state, action) => {
      state.projects.unshift(action.payload);
    });

    builder.addCase(updateProject.fulfilled, (state, action) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) state.projects[index] = action.payload;
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload;
      }
    });

    builder.addCase(deleteProject.fulfilled, (state, action) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
    });
  },
});

export const { clearCurrentProject, clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
