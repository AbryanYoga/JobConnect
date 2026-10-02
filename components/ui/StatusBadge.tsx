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
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
  },
  ditinjau: {
    label: "Ditinjau",
    badgeClass: "bg-yellow-50 text-yellow-800 border-yellow-200",
    dotClass: "bg-yellow-500",
  },
  shortlist: {
    label: "Shortlist",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    dotClass: "bg-blue-500",
  },
  wawancara: {
    label: "Wawancara",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    dotClass: "bg-purple-500",
  },
  ditawari: {
    label: "Ditawari",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotClass: "bg-amber-500",
  },
  diterima: {
    label: "Diterima",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dotClass: "bg-emerald-600",
  },
  ditolak: {
    label: "Ditolak",
    badgeClass: "bg-red-50 text-red-800 border-red-200",
    dotClass: "bg-red-500",
  },
  ditarik: {
    label: "Ditarik",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    dotClass: "bg-slate-400",
  },
};

export const JOB_STATUS_CONFIG: Record<JobStatus, StatusConfig> = {
  draft: {
    label: "Draf",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    dotClass: "bg-slate-400",
  },
  pending: {
    label: "Menunggu ACC",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotClass: "bg-amber-500",
  },
  open: {
    label: "Tayang",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dotClass: "bg-emerald-600",
  },
  rejected: {
    label: "Ditolak",
    badgeClass: "bg-red-50 text-red-800 border-red-200",
    dotClass: "bg-red-500",
  },
  closed: {
    label: "Ditutup",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
    dotClass: "bg-slate-400",
  },
  removed: {
    label: "Diturunkan",
    badgeClass: "bg-red-50 text-red-800 border-red-200",
    dotClass: "bg-red-600",
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
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
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
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
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
