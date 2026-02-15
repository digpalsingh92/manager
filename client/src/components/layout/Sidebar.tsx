"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { useIsAdmin } from "@/hooks/usePermission";
import { toggleSidebar } from "@/redux/slices/uiSlice";
import { logout } from "@/redux/slices/authSlice";
import { Avatar } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "My Tasks", icon: CheckSquare },
];

const adminItems = [{ href: "/admin", label: "Admin Panel", icon: Shield }];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = useIsAdmin();

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-neutral-200 bg-white transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-16",
          "lg:relative lg:z-auto",
          !sidebarOpen && "max-lg:-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-100 px-4">
          {sidebarOpen && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
                <span className="text-sm font-bold text-white">PM</span>
              </div>
              <span className="text-lg font-bold tracking-tight">
                ProManage
              </span>
            </Link>
          )}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="rounded-md p-1.5 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          <div className={cn("mb-2", sidebarOpen && "px-2")}>
            {sidebarOpen && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Menu
              </span>
            )}
          </div>

          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                  !sidebarOpen && "justify-center px-2",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className={cn("mt-6 mb-2", sidebarOpen && "px-2")}>
                {sidebarOpen && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Administration
                  </span>
                )}
              </div>
              {adminItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-neutral-900 text-white shadow-sm"
                        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                      !sidebarOpen && "justify-center px-2",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-neutral-100 p-3">
          {user && (
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg p-2",
                !sidebarOpen && "justify-center",
              )}
            >
              <Avatar
                fallback={`${user.firstName[0]}${user.lastName[0]}`}
                size="sm"
              />
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-neutral-400 truncate">
                    {user.email}
                  </p>
                </div>
              )}
              {sidebarOpen && (
                <button
                  onClick={handleLogout}
                  className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
