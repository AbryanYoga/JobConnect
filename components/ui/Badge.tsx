import React from "react";
import {
  JOB_TYPE_LABEL,
  JobType,
  WORK_MODE_LABEL,
  WorkMode,
} from "@/lib/labels";

export type BadgeVariant = "neutral" | "navy" | "accent";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  className = "",
  variant = "neutral",
  icon,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    navy: "bg-navy-50 text-navy-800 border-navy-200",
    accent: "bg-accent-100 text-accent-900 border-accent-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border select-none ${variantStyles[variant]} ${className}`.trim()}
      {...props}
    >
      {icon && (
        <span className="shrink-0 inline-flex items-center" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}

export function WorkTypeBadge({
  type,
  className = "",
}: {
  type: JobType;
  className?: string;
}) {
  const label = JOB_TYPE_LABEL[type] || type;
  return (
    <Badge variant="neutral" className={className}>
      {label}
    </Badge>
  );
}

export function WorkModeBadge({
  mode,
  className = "",
}: {
  mode: WorkMode;
  className?: string;
}) {
  const label = WORK_MODE_LABEL[mode] || mode;
  const variant: BadgeVariant = mode === "remote" ? "navy" : "neutral";
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
