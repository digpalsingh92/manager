"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { addToast } from "@/redux/slices/uiSlice";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  User,
  KeyRound,
  Mail,
  Calendar,
} from "lucide-react";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password must not exceed 128 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score <= 3) return { score: 3, label: "Good", color: "bg-blue-500" };
  if (score <= 4) return { score: 4, label: "Strong", color: "bg-emerald-500" };
  return { score: 5, label: "Very Strong", color: "bg-emerald-600" };
}

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = watch("newPassword");
  const strength = newPassword ? getPasswordStrength(newPassword) : null;

  const onSubmit = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      await authService.changePassword(data);
      dispatch(
        addToast({
          type: "success",
          message: "Password changed successfully!",
        }),
      );
      reset();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to change password.";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your profile and account preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ─── Profile Card ─────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <Avatar
                fallback={
                  user ? `${user.firstName[0]}${user.lastName[0]}` : "U"
                }
                size="lg"
              />
              <h2 className="mt-4 text-lg font-semibold text-neutral-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                {user?.roles?.[0] || "Member"}
              </p>

              <div className="w-full mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                    <Mail className="h-4 w-4 text-neutral-500" />
                  </div>
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                    <User className="h-4 w-4 text-neutral-500" />
                  </div>
                  <span>{user?.isActive ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                  </div>
                  <span>
                    Joined{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Change Password ──────────────────────── */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            {/* Card Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900">
                <KeyRound className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  Change Password
                </h2>
                <p className="text-xs text-neutral-500">
                  Update your password to keep your account secure
                </p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {/* API Error */}
              {apiError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in mb-5">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5 max-w-md"
              >
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="settings-currentPassword">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="settings-currentPassword"
                      type={showCurrent ? "text" : "password"}
                      placeholder="Enter current password"
                      {...register("currentPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                    >
                      {showCurrent ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-xs text-red-500">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="settings-newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="settings-newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="Enter new password"
                      {...register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                    >
                      {showNew ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-500">
                      {errors.newPassword.message}
                    </p>
                  )}

                  {/* Password Strength */}
                  {strength && (
                    <div className="space-y-1.5 animate-fade-in">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              level <= strength.score
                                ? strength.color
                                : "bg-neutral-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p
                        className={`text-[11px] font-medium ${
                          strength.score <= 1
                            ? "text-red-500"
                            : strength.score <= 2
                              ? "text-amber-500"
                              : strength.score <= 3
                                ? "text-blue-500"
                                : "text-emerald-600"
                        }`}
                      >
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="settings-confirmPassword">
                    Confirm New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="settings-confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
