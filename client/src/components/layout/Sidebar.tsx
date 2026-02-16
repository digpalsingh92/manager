"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { usePermission } from "@/hooks/usePermission";
import {
  toggleSidebar,
  setSidebarOpen,
  setCreateProjectModalOpen,
} from "@/redux/slices/uiSlice";
import { logout } from "@/redux/slices/authSlice";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Shield,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "My Tasks", href: "/tasks", icon: CheckSquare },
];

const adminItems = [
  { label: "Admin", href: "/admin", icon: Shield, permission: "manage_users" },
];

const bottomItems = [{ label: "Settings", href: "/settings", icon: Settings }];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const canManageUsers = usePermission("manage_users");
  const canCreateProject = usePermission("create_project");

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen flex flex-col bg-white border-r border-neutral-200 transition-all duration-300 lg:relative",
          sidebarOpen
            ? "w-64 translate-x-0"
            : "w-0 -translate-x-full lg:w-[72px] lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo + Toggle */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-neutral-100 shrink-0">
            {sidebarOpen ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
                    <span className="text-xs font-bold text-white">PM</span>
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-neutral-900">
                    ProManage
                  </span>
                </Link>
                <button
                  onClick={() => dispatch(toggleSidebar())}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer hidden lg:flex"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </button>
                <button
                  onClick={() => dispatch(setSidebarOpen(false))}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer lg:hidden"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="mx-auto p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer hidden lg:flex"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* New Project Button */}
          {canCreateProject && (
            <div className="px-3 py-3 shrink-0">
              {sidebarOpen ? (
                <Button
                  onClick={() => dispatch(setCreateProjectModalOpen(true))}
                  className="w-full justify-start gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              ) : (
                <Button
                  onClick={() => dispatch(setCreateProjectModalOpen(true))}
                  size="icon"
                  className="mx-auto flex"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 space-y-1">
            <div
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2",
                sidebarOpen ? "px-2" : "text-center",
              )}
            >
              {sidebarOpen ? "Menu" : "·"}
            </div>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024)
                      dispatch(setSidebarOpen(false));
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                    !sidebarOpen && "justify-center px-2",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isActive ? "text-white" : "text-neutral-400",
                    )}
                  />
                  {sidebarOpen && item.label}
                </Link>
              );
            })}

            {/* Admin section */}
            {canManageUsers && (
              <>
                <div
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mt-6 mb-2",
                    sidebarOpen ? "px-2" : "text-center",
                  )}
                >
                  {sidebarOpen ? "Admin" : "·"}
                </div>
                {adminItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024)
                          dispatch(setSidebarOpen(false));
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
                        !sidebarOpen && "justify-center px-2",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-white" : "text-neutral-400",
                        )}
                      />
                      {sidebarOpen && item.label}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-neutral-100 p-3 space-y-1 shrink-0">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-neutral-100 text-neutral-900"
                      : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
                    !sidebarOpen && "justify-center px-2",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && item.label}
                </Link>
              );
            })}

            {/* User info + Logout */}
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-2 py-2 mt-2",
                !sidebarOpen && "justify-center",
              )}
            >
              <Avatar
                fallback={
                  user ? `${user.firstName[0]}${user.lastName[0]}` : "U"
                }
                size="sm"
              />
              {sidebarOpen && user && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate">
                    {user.email}
                  </p>
                </div>
              )}
              {sidebarOpen && (
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-md text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
