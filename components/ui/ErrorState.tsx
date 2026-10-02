import React from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Gagal memuat data. Silakan periksa koneksi internet Anda dan coba lagi.",
  onRetry,
  retryLabel = "Coba Lagi",
  actionHref,
  actionLabel,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`py-10 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto rounded-card border border-red-200 bg-red-50/30 ${className}`.trim()}
    >
      <div
        className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 shrink-0"
        aria-hidden="true"
      >
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1 tracking-tight">
        {title}
      </h3>

      <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-sm">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="primary"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            {retryLabel}
          </Button>
        )}

        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="min-h-[44px] px-4 py-2.5 rounded-control text-sm font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-navy-700 hover:border-slate-400 active:bg-slate-100 transition-colors inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 w-full sm:w-auto"
          >
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
