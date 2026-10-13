"use client";

import React, { useEffect, useState } from "react";
import { BellOff, CheckCheck, Radio } from "lucide-react";
import {
  NotificationItem,
  type NotificationData,
} from "./NotificationItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";

interface NotificationListProps {
  initialNotifications: NotificationData[];
}

export function NotificationList({
  initialNotifications,
}: NotificationListProps) {
  const [notifications, setNotifications] =
    useState<NotificationData[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function setupRealtime() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !isMounted) return;

        channel = supabase
          .channel(`notifications-list-${user.id}`)
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
              const newRow = payload.new as NotificationData;
              setNotifications((prev) => {
                if (prev.some((item) => item.id === newRow.id)) return prev;
                return [newRow, ...prev];
              });
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
              const updatedRow = payload.new as NotificationData;
              setNotifications((prev) =>
                prev.map((item) =>
                  item.id === updatedRow.id ? updatedRow : item
                )
              );
            }
          )
          .subscribe((status) => {
            if (isMounted && status === "SUBSCRIBED") {
              setIsRealtimeConnected(true);
            }
          });
      } catch {
        // Lewati kesalahan koneksi realtime sementara
      }
    }

    setupRealtime();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.read_at).length;
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((item) => !item.read_at)
      : notifications;

  return (
    <div className="space-y-6">
      {/* Tab Filter Notifikasi & Status Realtime */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div
          role="tablist"
          aria-label="Filter notifikasi"
          className="inline-flex p-1 bg-slate-100 rounded-lg gap-1 self-start"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors min-h-[44px] flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 ${
              filter === "all"
                ? "bg-white text-navy-950 shadow-2xs"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            <span>Semua</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                filter === "all"
                  ? "bg-navy-100 text-navy-900"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {notifications.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === "unread"}
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors min-h-[44px] flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 ${
              filter === "unread"
                ? "bg-white text-navy-950 shadow-2xs"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            <span>Belum Dibaca</span>
            {unreadCount > 0 ? (
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-200 text-amber-950 font-bold">
                {unreadCount}
              </span>
            ) : (
              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-200 text-slate-700">
                0
              </span>
            )}
          </button>
        </div>

        {/* Indikator Pembaruan Realtime */}
        {isRealtimeConnected && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500 bg-slate-50 rounded-full border border-slate-200 self-start sm:self-center">
            <span
              className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
              aria-hidden="true"
            />
            <span>Pembaruan realtime aktif</span>
          </div>
        )}
      </div>

      {/* Daftar Notifikasi */}
      {filteredNotifications.length === 0 ? (
        filter === "unread" ? (
          <EmptyState
            title="Semua Notifikasi Telah Dibaca"
            description="Tidak ada pemberitahuan baru yang belum dibaca saat ini."
            icon={<CheckCheck className="w-6 h-6 text-emerald-600" />}
            action={{
              label: "Lihat Semua Notifikasi",
              onClick: () => setFilter("all"),
            }}
          />
        ) : (
          <EmptyState
            title="Belum Ada Notifikasi"
            description="Pemberitahuan aktivitas seputar status lamaran, panggilan wawancara, dan lowongan Anda akan tampil di sini."
            icon={<BellOff className="w-6 h-6 text-slate-400" />}
            action={{
              label: "Jelajahi Lowongan",
              href: "/lowongan",
            }}
          />
        )
      ) : (
        <div className="space-y-3" role="feed" aria-label="Daftar notifikasi">
          {filteredNotifications.map((item) => (
            <NotificationItem key={item.id} notification={item} />
          ))}
        </div>
      )}
    </div>
  );
}
