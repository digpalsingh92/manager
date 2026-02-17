"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

const schema = z
  .object({
    email: z.string().email("Invalid email address"),
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

type FormData = z.infer<typeof schema>;

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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const newPassword = watch("newPassword");
  const strength = newPassword ? getPasswordStrength(newPassword) : null;

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      await authService.resetPassword(data);
      setSuccess(true);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to reset password.";
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Password Reset Successfully
            </h1>
            <p className="text-sm text-neutral-500">
              Your password has been changed. You can now sign in with your new
              password.
            </p>
          </div>
        </div>

        <Button onClick={() => router.push("/login")} className="w-full gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 lg:hidden mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900">
            <span className="text-xs font-bold text-white">PM</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            ProManage
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Reset Password
        </h1>
        <p className="text-sm text-neutral-500">
          Enter your email to set a new password
        </p>
      </div>

      {/* Error */}
      {apiError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              New Password
            </span>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
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
            <p className="text-xs text-red-500">{errors.newPassword.message}</p>
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
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
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

        <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Resetting...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Reset Password
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-neutral-500">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-900 hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
