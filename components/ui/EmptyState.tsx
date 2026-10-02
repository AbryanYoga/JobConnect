import React from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
  className = "",
}: EmptyStateProps) {
  const linkPrimaryClass =
    "min-h-[44px] px-4 py-2.5 rounded-control text-sm font-medium text-white bg-navy-700 hover:bg-navy-800 active:bg-navy-900 transition-colors shadow-xs inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 w-full sm:w-auto";

  const linkOutlineClass =
    "min-h-[44px] px-4 py-2.5 rounded-control text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-navy-700 hover:border-slate-400 active:bg-slate-100 transition-colors inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 w-full sm:w-auto";

  return (
    <div
      className={`py-12 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto rounded-card border border-dashed border-slate-300 bg-white/50 ${className}`.trim()}
    >
      <div
        className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-4 shrink-0"
        aria-hidden="true"
      >
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {actionLabel && actionHref && (
            <Link href={actionHref} className={linkPrimaryClass}>
              {actionLabel}
            </Link>
          )}

          {actionLabel && !actionHref && onAction && (
            <Button
              onClick={onAction}
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
            >
              {actionLabel}
            </Button>
          )}

          {secondaryActionLabel && secondaryActionHref && (
            <Link href={secondaryActionHref} className={linkOutlineClass}>
              {secondaryActionLabel}
            </Link>
          )}

          {secondaryActionLabel && !secondaryActionHref && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              size="md"
              className="w-full sm:w-auto"
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
