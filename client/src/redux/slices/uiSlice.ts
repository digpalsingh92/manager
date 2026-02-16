import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

interface UiState {
  sidebarOpen: boolean;
  createProjectModalOpen: boolean;
  createTaskModalOpen: boolean;
  taskDetailModalOpen: boolean;
  selectedTaskId: string | null;
  toasts: Toast[];
}

const initialState: UiState = {
  sidebarOpen: true,
  createProjectModalOpen: false,
  createTaskModalOpen: false,
  taskDetailModalOpen: false,
  selectedTaskId: null,
  toasts: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setCreateProjectModalOpen: (state, action) => {
      state.createProjectModalOpen = action.payload;
    },
    setCreateTaskModalOpen: (state, action) => {
      state.createTaskModalOpen = action.payload;
    },
    openTaskDetail: (state, action) => {
      state.selectedTaskId = action.payload;
      state.taskDetailModalOpen = true;
    },
    closeTaskDetail: (state) => {
      state.taskDetailModalOpen = false;
      state.selectedTaskId = null;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      state.toasts.push({ ...action.payload, id: Date.now().toString() + Math.random().toString(36).slice(2) });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setCreateProjectModalOpen,
  setCreateTaskModalOpen,
  openTaskDetail,
  closeTaskDetail,
  addToast,
  removeToast,
} = uiSlice.actions;
export default uiSlice.reducer;

