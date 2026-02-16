import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Task, TaskStatus, CreateTaskPayload, UpdateTaskPayload } from "@/types";
import { taskService } from "@/services/task.service";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
};

export const fetchTasksByProject = createAsyncThunk(
  "tasks/fetchByProject",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const res = await taskService.getTasksByProject(projectId, { limit: 100 });
      return res.data || [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch tasks");
    }
  },
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (data: CreateTaskPayload, { rejectWithValue }) => {
    try {
      return await taskService.createTask(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create task");
    }
  },
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, data }: { id: string; data: UpdateTaskPayload }, { rejectWithValue }) => {
    try {
      return await taskService.updateTask(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update task");
    }
  },
);

export const moveTask = createAsyncThunk(
  "tasks/move",
  async ({ id, status }: { id: string; status: TaskStatus }, { rejectWithValue }) => {
    try {
      return await taskService.moveTask(id, status);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to move task");
    }
  },
);

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete task");
    }
  },
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.tasks = [];
    },
    optimisticMoveTask: (state, action) => {
      const { id, status } = action.payload;
      const task = state.tasks.find((t) => t.id === id);
      if (task) task.status = status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasksByProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasksByProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearTasks, optimisticMoveTask } = taskSlice.actions;
export default taskSlice.reducer;
