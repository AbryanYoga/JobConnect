"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";

interface NotificationBellProps {
  initialCount?: number;
  className?: string;
}

export function NotificationBell({
  initialCount = 0,
  className = "",
}: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState<number>(initialCount);
  const { t } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    async function fetchUnreadCount() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !isMounted) return;

        const { count, error } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .is("read_at", null);

        if (!error && typeof count === "number" && isMounted) {
          setUnreadCount(count);
        }
      } catch {
        // Lewati kesalahan jaringan sementara
      }
    }

    fetchUnreadCount();

    return () => {
      isMounted = false;
    };
  }, []);

  const ariaLabel =
    unreadCount > 0
      ? t(
          `Notifikasi (${unreadCount} belum dibaca)`,
          `Notifications (${unreadCount} unread)`
        )
      : t("Notifikasi", "Notifications");

  return (
    <Link
      href="/notifikasi"
      aria-label={ariaLabel}
      className={`relative inline-flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-full text-slate-700 hover:text-navy-950 hover:bg-black/[0.05] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 ${className}`}
    >
      <Bell className="w-5 h-5" aria-hidden="true" />
      {unreadCount > 0 && (
        <span
          className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-extrabold text-white bg-red-600 rounded-full border-2 border-white ring-1 ring-red-600/20 tabular-nums animate-in fade-in"
          aria-hidden="true"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
