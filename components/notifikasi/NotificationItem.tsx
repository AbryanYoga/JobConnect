"use client";

import React from "react";
import Link from "next/link";
import {
  Bell,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Sparkles,
  Undo2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { Database } from "@/lib/supabase/types";

export type NotificationData = Database["public"]["Tables"]["notifications"]["Row"];

interface NotificationItemProps {
  notification: NotificationData;
  onMarkAsRead?: (id: number) => void;
  onClick?: (notification: NotificationData) => void;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "lamaran_baru":
      return {
        icon: <Briefcase className="w-5 h-5 text-navy-700" />,
        bg: "bg-navy-50",
      };
    case "lamaran_ditarik":
      return {
        icon: <Undo2 className="w-5 h-5 text-slate-600" />,
        bg: "bg-slate-100",
      };
    case "wawancara_dijadwalkan":
      return {
        icon: <Calendar className="w-5 h-5 text-amber-600" />,
        bg: "bg-amber-50",
      };
    case "status_lamaran":
    case "lowongan_disetujui":
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        bg: "bg-emerald-50",
      };
    case "ai_review_selesai":
      return {
        icon: <Sparkles className="w-5 h-5 text-purple-600" />,
        bg: "bg-purple-50",
      };
    case "lowongan_pending":
      return {
        icon: <Clock className="w-5 h-5 text-blue-600" />,
        bg: "bg-blue-50",
      };
    case "lowongan_ditolak":
      return {
        icon: <XCircle className="w-5 h-5 text-red-600" />,
        bg: "bg-red-50",
      };
    default:
      return {
        icon: <Bell className="w-5 h-5 text-slate-600" />,
        bg: "bg-slate-100",
      };
  }
}

function formatNotificationTime(
  isoString: string,
  t: (id: string, en?: string) => string,
  locale: string
): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return t("Baru saja", "Just now");
    if (diffMinutes < 60) return `${diffMinutes} ${t("menit yang lalu", "minutes ago")}`;
    if (diffHours < 24) return `${diffHours} ${t("jam yang lalu", "hours ago")}`;
    if (diffDays === 1) return t("Kemarin", "Yesterday");
    if (diffDays < 7) return `${diffDays} ${t("hari yang lalu", "days ago")}`;

    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoString;
  }
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const { language, t } = useLanguage();
  const locale = language === "en" ? "en-US" : "id-ID";
  const isUnread = !notification.read_at;
  const { icon, bg } = getNotificationIcon(notification.type);
  const timeFormatted = formatNotificationTime(notification.created_at, t, locale);

  const handleItemClick = () => {
    if (isUnread && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  const handleMarkAsReadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMarkAsRead?.(notification.id);
  };

  const content = (
    <div
      className={`group relative flex items-start gap-4 p-4 sm:p-5 rounded-card border transition-all ${
        isUnread
          ? "bg-amber-50/40 border-amber-200/80 shadow-2xs hover:bg-amber-50/70"
          : "bg-white border-slate-200 hover:bg-slate-50/80"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}
        aria-hidden="true"
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h3
              className={`text-sm sm:text-base font-semibold truncate ${
                isUnread ? "text-navy-950 font-bold" : "text-slate-800"
              }`}
            >
              {notification.title}
            </h3>
            {isUnread && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                {t("Baru", "New")}
              </span>
            )}
          </div>

          {isUnread && onMarkAsRead && (
            <button
              type="button"
              onClick={handleMarkAsReadClick}
              title={t("Tandai telah dibaca", "Mark as read")}
              aria-label={t("Tandai notifikasi ini telah dibaca", "Mark this notification as read")}
              className="inline-flex items-center justify-center p-2 min-w-[44px] min-h-[44px] -my-2 -mr-2 rounded-full text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {notification.body && (
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-2">
            {notification.body}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-slate-500">
          <time dateTime={notification.created_at}>{timeFormatted}</time>
          {notification.link && (
            <span className="inline-flex items-center gap-1 text-navy-800 font-medium group-hover:underline">
              {t("Lihat detail", "View details")}
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link
        href={notification.link}
        onClick={handleItemClick}
        className="block rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 min-h-[44px]"
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      onClick={handleItemClick}
      className="min-h-[44px]"
    >
      {content}
    </div>
  );
}
