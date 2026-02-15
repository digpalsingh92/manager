"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { hydrateAuth, fetchProfile } from "@/redux/slices/authSlice";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    dispatch(hydrateAuth());
    setIsHydrated(true);
  }, [dispatch]);

  useEffect(() => {
    if (isHydrated) {
      const localToken = localStorage.getItem("token");
      if (!localToken) {
        router.push("/login");
      } else {
        dispatch(fetchProfile());
      }
    }
  }, [isHydrated, dispatch, router]);

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
          <p className="text-sm text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
