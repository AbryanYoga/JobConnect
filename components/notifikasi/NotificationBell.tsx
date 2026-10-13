"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";
import type { Database } from "@/lib/supabase/types";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

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
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function init() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !isMounted) return;

        // Ambil hitungan awal notifikasi belum dibaca
        const { count, error } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .is("read_at", null);

        if (!error && typeof count === "number" && isMounted) {
          setUnreadCount(count);
        }

        // Langganan pembaruan realtime Supabase
        channel = supabase
          .channel(`notifications-bell-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (!isMounted) return;
              const newRow = payload.new as NotificationRow;
              if (!newRow.read_at) {
                setUnreadCount((prev) => prev + 1);
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${user.id}`,
            },
            (payload) => {
              if (!isMounted) return;
              const newRow = payload.new as NotificationRow;
              const oldRow = payload.old as Partial<NotificationRow>;
              if (!oldRow.read_at && newRow.read_at) {
                setUnreadCount((prev) => Math.max(0, prev - 1));
              } else if (oldRow.read_at && !newRow.read_at) {
                setUnreadCount((prev) => prev + 1);
              }
            }
          )
          .subscribe();
      } catch {
        // Lewati kesalahan koneksi realtime sementara
      }
    }

    init();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
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
