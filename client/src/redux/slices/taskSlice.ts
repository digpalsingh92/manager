import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { taskService } from "@/services/task.service";
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskStatus, Pagination } from "@/types";

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  selectedTask: null,
  pagination: null,
  isLoading: false,
  error: null,
};

// ─── Thunks ──────────────────────────────────
export const fetchTasks = createAsyncThunk(
  "tasks/fetchByProject",
  async (
    { projectId, params }: { projectId: string; params?: Record<string, any> },
    { rejectWithValue }
  ) => {
    try {
      const res = await taskService.getTasksByProject(projectId, params);
      return { tasks: res.data!, pagination: res.meta?.pagination };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch tasks");
    }
  }
);

export const createTask = createAsyncThunk(
  "tasks/create",
  async (data: CreateTaskPayload, { rejectWithValue }) => {
    try {
      return await taskService.createTask(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create task");
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update",
  async ({ id, data }: { id: string; data: UpdateTaskPayload }, { rejectWithValue }) => {
    try {
      return await taskService.updateTask(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update task");
    }
  }
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
  }
);

export const moveTask = createAsyncThunk(
  "tasks/move",
  async ({ id, status }: { id: string; status: TaskStatus }, { rejectWithValue }) => {
    try {
      return await taskService.moveTask(id, status);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to move task");
    }
  }
);

export const assignTask = createAsyncThunk(
  "tasks/assign",
  async ({ id, assigneeId }: { id: string; assigneeId: string | null }, { rejectWithValue }) => {
    try {
      return await taskService.assignTask(id, assigneeId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to assign task");
    }
  }
);

// ─── Slice ───────────────────────────────────
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setSelectedTask(state, action: PayloadAction<Task | null>) {
      state.selectedTask = action.payload;
    },
    clearTasks(state) {
      state.tasks = [];
      state.selectedTask = null;
    },
    clearTaskError(state) {
      state.error = null;
    },
    // Optimistic move for drag & drop
    optimisticMoveTask(
      state,
      action: PayloadAction<{ taskId: string; newStatus: TaskStatus }>
    ) {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.newStatus;
      }
    },
    // Revert optimistic move
    revertMoveTask(
      state,
      action: PayloadAction<{ taskId: string; oldStatus: TaskStatus }>
    ) {
      const task = state.tasks.find((t) => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.oldStatus;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(createTask.fulfilled, (state, action) => {
      state.tasks.unshift(action.payload);
    });

    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.tasks[index] = action.payload;
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask = action.payload;
      }
    });

    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
    });

    builder.addCase(moveTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.tasks[index] = action.payload;
    });

    builder.addCase(assignTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.tasks[index] = action.payload;
      if (state.selectedTask?.id === action.payload.id) {
        state.selectedTask = action.payload;
      }
    });
  },
});

export const {
  setSelectedTask,
  clearTasks,
  clearTaskError,
  optimisticMoveTask,
  revertMoveTask,
} = taskSlice.actions;
export default taskSlice.reducer;
