import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "destructive"
    | "success"
    | "warning"
    | "info";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: "border-transparent bg-neutral-900 text-white",
    secondary: "border-transparent bg-neutral-100 text-neutral-600",
    outline: "border-neutral-200 text-neutral-600",
    destructive: "border-transparent bg-red-50 text-red-600",
    success: "border-transparent bg-emerald-50 text-emerald-600",
    warning: "border-transparent bg-amber-50 text-amber-700",
    info: "border-transparent bg-blue-50 text-blue-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
