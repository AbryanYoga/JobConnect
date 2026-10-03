import React from "react";

export type ApplicationStatus =
  | "dikirim"
  | "ditinjau"
  | "shortlist"
  | "wawancara"
  | "ditawari"
  | "diterima"
  | "ditolak"
  | "ditarik";

export type JobStatus =
  | "draft"
  | "pending"
  | "open"
  | "rejected"
  | "closed"
  | "removed";

interface StatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  StatusConfig
> = {
  dikirim: {
    label: "Dikirim",
    badgeClass: "bg-status-gray-bg text-status-gray-fg border-slate-200",
    dotClass: "bg-slate-400",
  },
  ditinjau: {
    label: "Ditinjau",
    badgeClass: "bg-status-yellow-bg text-status-yellow-fg border-yellow-200",
    dotClass: "bg-yellow-500",
  },
  shortlist: {
    label: "Shortlist",
    badgeClass: "bg-status-blue-bg text-status-blue-fg border-blue-200",
    dotClass: "bg-blue-600",
  },
  wawancara: {
    label: "Wawancara",
    badgeClass: "bg-status-blue-bg text-status-blue-fg border-blue-200",
    dotClass: "bg-blue-600",
  },
  ditawari: {
    label: "Ditawari",
    badgeClass: "bg-status-green-bg text-status-green-fg border-green-200",
    dotClass: "bg-green-600",
  },
  diterima: {
    label: "Diterima",
    badgeClass: "bg-status-green-bg text-status-green-fg border-green-200",
    dotClass: "bg-green-600",
  },
  ditolak: {
    label: "Ditolak",
    badgeClass: "bg-status-red-bg text-status-red-fg border-red-200",
    dotClass: "bg-red-500",
  },
  ditarik: {
    label: "Ditarik",
    badgeClass: "bg-status-gray-bg text-status-gray-fg border-slate-200",
    dotClass: "bg-slate-400",
  },
};

export const JOB_STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  draft: {
    label: "Draf",
    badgeClass: "bg-status-gray-bg text-status-gray-fg border-slate-200",
    dotClass: "bg-slate-400",
  },
  pending: {
    label: "Menunggu ACC",
    badgeClass: "bg-status-yellow-bg text-status-yellow-fg border-yellow-200",
    dotClass: "bg-yellow-500",
  },
  open: {
    label: "Tayang",
    badgeClass: "bg-status-green-bg text-status-green-fg border-green-200",
    dotClass: "bg-green-600",
  },
  rejected: {
    label: "Ditolak",
    badgeClass: "bg-status-red-bg text-status-red-fg border-red-200",
    dotClass: "bg-red-500",
  },
  closed: {
    label: "Ditutup",
    badgeClass: "bg-status-gray-bg text-status-gray-fg border-slate-200",
    dotClass: "bg-slate-400",
  },
  removed: {
    label: "Diturunkan",
    badgeClass: "bg-status-red-bg text-status-red-fg border-red-200",
    dotClass: "bg-red-500",
  },
};

export interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
  withDot?: boolean;
}

export function StatusBadge({
  status,
  className = "",
  withDot = true,
}: StatusBadgeProps) {
  const config = APPLICATION_STATUS_CONFIG[status] || {
    label: status,
    badgeClass: "bg-status-gray-bg text-status-gray-fg border-slate-200",
    dotClass: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none ${config.badgeClass} ${className}`.trim()}
    >
      {withDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}

export function JobStatusBadge({
  status,
  className = "",
  withDot = true,
}: {
  status: JobStatus;
  className?: string;
  withDot?: boolean;
}) {
  const config = JOB_STATUS_CONFIG[status] || {
    label: status,
    badgeClass: "bg-status-gray-bg text-status-gray-fg border-slate-200",
    dotClass: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none ${config.badgeClass} ${className}`.trim()}
    >
      {withDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotClass}`}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
