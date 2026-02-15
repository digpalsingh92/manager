import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authService } from "@/services/auth.service";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

// ─── Thunks ──────────────────────────────────
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data: LoginPayload, { rejectWithValue }) => {
    try {
      const result = await authService.login(data);
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      return result;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data: RegisterPayload, { rejectWithValue }) => {
    try {
      const result = await authService.register(data);
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
      return result;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getProfile();
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

// ─── Slice ───────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    clearError(state) {
      state.error = null;
    },
    hydrateAuth(state) {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (token && userStr) {
          try {
            state.user = JSON.parse(userStr);
            state.token = token;
            state.isAuthenticated = true;
          } catch {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearError, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;
