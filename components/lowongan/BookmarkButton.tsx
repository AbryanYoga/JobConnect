"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bookmark, Loader2 } from "lucide-react";
import { toggleBookmarkAction } from "@/app/actions/bookmark";
import { useLanguage } from "@/lib/i18n";

interface BookmarkButtonProps {
  jobId: number;
  initialIsBookmarked?: boolean;
  variant?: "icon" | "button";
  className?: string;
  onBookmarkToggle?: (newStatus: boolean) => void;
}

export function BookmarkButton({
  jobId,
  initialIsBookmarked = false,
  variant = "icon",
  className = "",
  onBookmarkToggle,
}: BookmarkButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialIsBookmarked);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    const nextState = !isBookmarked;
    // Optimistic update
    setIsBookmarked(nextState);
    if (onBookmarkToggle) {
      onBookmarkToggle(nextState);
    }

    startTransition(async () => {
      const result = await toggleBookmarkAction(jobId);

      if (!result.success) {
        // Rollback state jika gagal
        setIsBookmarked(!nextState);
        if (onBookmarkToggle) {
          onBookmarkToggle(!nextState);
        }

        if (result.error === "AUTH_REQUIRED") {
          const redirectUrl = `/login?redirectTo=${encodeURIComponent(pathname || "/lowongan")}`;
          router.push(redirectUrl);
        }
      } else if (result.isBookmarked !== undefined) {
        setIsBookmarked(result.isBookmarked);
      }
    });
  };

  const labelText = isBookmarked
    ? t("Tersimpan", "Saved")
    : t("Simpan Lowongan", "Save Vacancy");

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={labelText}
        aria-pressed={isBookmarked}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-xs transition min-h-[44px] shadow-2xs ${
          isBookmarked
            ? "bg-[#FAF8F0] hover:bg-amber-100/60 text-navy-950 border border-amber-300 ring-1 ring-amber-300"
            : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
        } ${className}`}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" aria-hidden="true" />
        ) : (
          <Bookmark
            className={`w-4 h-4 transition-colors ${
              isBookmarked
                ? "fill-[#FFDD00] text-amber-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
            aria-hidden="true"
          />
        )}
        <span>{labelText}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={labelText}
      aria-pressed={isBookmarked}
      className={`relative inline-flex items-center justify-center w-11 h-11 rounded-full transition-all duration-150 border focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-600 ${
        isBookmarked
          ? "bg-[#FAF8F0] border-amber-300 text-amber-900 shadow-2xs hover:bg-amber-100"
          : "bg-white/90 border-slate-200/90 text-slate-400 hover:text-navy-900 hover:border-slate-300 shadow-2xs hover:bg-white"
      } ${className}`}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" aria-hidden="true" />
      ) : (
        <Bookmark
          className={`w-4 h-4 transition-transform active:scale-90 ${
            isBookmarked
              ? "fill-[#FFDD00] text-amber-900"
              : "text-slate-400 hover:text-navy-900"
          }`}
          aria-hidden="true"
        />
      )}
    </button>
  );
}
