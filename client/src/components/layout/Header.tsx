"use client";

import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { toggleSidebar } from "@/redux/slices/uiSlice";
import { Menu, Bell } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

export function Header() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-neutral-200 bg-white/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-md p-2 hover:bg-neutral-100 transition-colors lg:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-md p-2 hover:bg-neutral-100 transition-colors cursor-pointer">
          <Bell className="h-5 w-5 text-neutral-600" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-neutral-900" />
        </button>

        {user && (
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
            <Avatar
              fallback={`${user.firstName[0]}${user.lastName[0]}`}
              size="sm"
            />
            <span className="hidden text-sm font-medium sm:block">
              {user.firstName}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
