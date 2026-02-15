import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  sidebarOpen: boolean;
  taskModalOpen: boolean;
  createTaskModalOpen: boolean;
  createProjectModalOpen: boolean;
}

const initialState: UiState = {
  sidebarOpen: true,
  taskModalOpen: false,
  createTaskModalOpen: false,
  createProjectModalOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setTaskModalOpen(state, action: PayloadAction<boolean>) {
      state.taskModalOpen = action.payload;
    },
    setCreateTaskModalOpen(state, action: PayloadAction<boolean>) {
      state.createTaskModalOpen = action.payload;
    },
    setCreateProjectModalOpen(state, action: PayloadAction<boolean>) {
      state.createProjectModalOpen = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTaskModalOpen,
  setCreateTaskModalOpen,
  setCreateProjectModalOpen,
} = uiSlice.actions;
export default uiSlice.reducer;
