"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setSidebarOpen } from "@/redux/slices/uiSlice";
import { Avatar } from "@/components/ui/avatar";
import { Bell, Search, Menu } from "lucide-react";

export function Header() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-neutral-200 bg-white/80 backdrop-blur-md px-4 sm:px-6">
      {/* Mobile menu toggle */}
      <button
        onClick={() => dispatch(setSidebarOpen(true))}
        className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="w-full h-9 rounded-lg bg-neutral-50 border border-neutral-200 pl-9 pr-4 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1 transition-colors"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 ml-auto">
        <button className="relative p-2 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
        <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-neutral-200 ml-1">
          <Avatar
            fallback={user ? `${user.firstName[0]}${user.lastName[0]}` : "U"}
            size="sm"
          />
          <div className="hidden md:block">
            <p className="text-xs font-medium text-neutral-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-neutral-400">
              {user?.roles?.[0] || "Member"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
