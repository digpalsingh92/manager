"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { hydrateAuth, getProfile } from "@/redux/slices/authSlice";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { CreateProjectModal } from "@/components/forms/CreateProjectModal";
import { CreateTaskModal } from "@/components/forms/CreateTaskModal";
import { TaskModal } from "@/components/forms/TaskModal";
import { ToastContainer } from "@/components/ui/toast";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, isLoading, isHydrated } = useAppSelector(
    (state) => state.auth,
  );

  // Hydrate auth from localStorage on client mount
  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  // After hydration, check auth and fetch profile
  useEffect(() => {
    if (!isHydrated) return;
    if (token && !isAuthenticated) {
      dispatch(getProfile());
    } else if (!token) {
      router.push("/login");
    }
  }, [isHydrated, token, isAuthenticated, dispatch, router]);

  // Render nothing until hydrated (avoids SSR mismatch)
  if (!isHydrated) return null;

  if (!token) return null;

  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-neutral-200 border-t-neutral-900 animate-spin" />
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50/50">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>
      </div>

      {/* Global Modals */}
      <CreateProjectModal />
      <CreateTaskModal />
      <TaskModal />
      <ToastContainer />
    </div>
  );
}
