import React from "react";

export type BadgeVariant =
  | "neutral"
  | "navy"
  | "amber"
  | "green"
  | "blue"
  | "purple";

export type WorkType = "full_time" | "part_time" | "magang" | "kontrak";
export type WorkMode = "wfo" | "remote" | "hybrid";

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
    navy: "bg-navy-50 text-navy-700 border-navy-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    green: "bg-green-50 text-green-800 border-green-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none ${variantStyles[variant]} ${className}`.trim()}
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

export const WORK_TYPE_CONFIG: Record<
  WorkType,
  { label: string; variant: BadgeVariant }
> = {
  full_time: { label: "Full-time", variant: "navy" },
  part_time: { label: "Part-time", variant: "amber" },
  magang: { label: "Magang", variant: "purple" },
  kontrak: { label: "Kontrak", variant: "neutral" },
};

export const WORK_MODE_CONFIG: Record<
  WorkMode,
  { label: string; variant: BadgeVariant }
> = {
  wfo: { label: "WFO", variant: "neutral" },
  remote: { label: "Remote", variant: "green" },
  hybrid: { label: "Hybrid", variant: "blue" },
};

export function WorkTypeBadge({
  type,
  className = "",
}: {
  type: WorkType;
  className?: string;
}) {
  const config = WORK_TYPE_CONFIG[type] || {
    label: type,
    variant: "neutral",
  };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
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
  const config = WORK_MODE_CONFIG[mode] || {
    label: mode,
    variant: "neutral",
  };
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
