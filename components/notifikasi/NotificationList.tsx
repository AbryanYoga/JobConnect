"use client";

import React, { useEffect, useState, useTransition } from "react";
import { BellOff, CheckCheck, Loader2 } from "lucide-react";
import {
  NotificationItem,
  type NotificationData,
} from "./NotificationItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
} from "@/app/actions/notifikasi";

interface NotificationListProps {
  initialNotifications: NotificationData[];
  hasError?: boolean;
}

export function NotificationList({
  initialNotifications,
  hasError = false,
}: NotificationListProps) {
  const { t } = useLanguage();
  const [notifications, setNotifications] =
    useState<NotificationData[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

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

  const handleMarkAsRead = (id: number) => {
    // Pembaruan optimistik
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read_at: new Date().toISOString() } : item
      )
    );

    startTransition(async () => {
      await markNotificationAsReadAction(id);
    });
  };

  const handleMarkAllAsRead = () => {
    // Pembaruan optimistik untuk seluruh notifikasi
    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        read_at: item.read_at || new Date().toISOString(),
      }))
    );

    startTransition(async () => {
      await markAllNotificationsAsReadAction();
    });
  };

  const unreadCount = notifications.filter((item) => !item.read_at).length;
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((item) => !item.read_at)
      : notifications;

  return (
    <div className="space-y-6">
      {/* Header Halaman Notifikasi */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
          {t("Notifikasi", "Notifications")}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1">
          {t(
            "Pantau pemberitahuan terkini seputar lamaran, panggilan wawancara, dan pembaruan lowongan Anda.",
            "Track latest updates on applications, interview calls, and job alerts."
          )}
        </p>
      </div>

      {hasError && (
        <ErrorState
          title={t("Gagal Memuat Notifikasi", "Failed to Load Notifications")}
          message={t(
            "Terjadi kendala saat mengambil data notifikasi Anda. Silakan coba muat ulang.",
            "An issue occurred while retrieving your notifications. Please reload."
          )}
          actionHref="/notifikasi"
          actionLabel={t("Muat Ulang Halaman", "Reload Page")}
        />
      )}

      {/* Tab Filter Notifikasi, Status Realtime, & Tombol Tandai Semua Dibaca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div
          role="tablist"
          aria-label={t("Filter notifikasi", "Filter notifications")}
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
            <span>{t("Semua", "All")}</span>
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
            <span>{t("Belum Dibaca", "Unread")}</span>
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

        <div className="flex items-center gap-3 self-start sm:self-center">
          {/* Tombol Tandai Semua Dibaca */}
          {unreadCount > 0 && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-navy-900 hover:text-navy-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-navy-700" aria-hidden="true" />
              ) : (
                <CheckCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              )}
              <span>{t("Tandai Semua Dibaca", "Mark All as Read")}</span>
            </button>
          )}

          {/* Indikator Pembaruan Realtime */}
          {isRealtimeConnected && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500 bg-slate-50 rounded-full border border-slate-200">
              <span
                className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                aria-hidden="true"
              />
              <span>{t("Pembaruan realtime aktif", "Realtime updates active")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Daftar Notifikasi */}
      {filteredNotifications.length === 0 ? (
        filter === "unread" ? (
          <EmptyState
            title={t("Semua Notifikasi Telah Dibaca", "All Notifications Read")}
            description={t(
              "Tidak ada pemberitahuan baru yang belum dibaca saat ini.",
              "No new unread notifications at this time."
            )}
            icon={<CheckCheck className="w-6 h-6 text-emerald-600" />}
            action={{
              label: t("Lihat Semua Notifikasi", "View All Notifications"),
              onClick: () => setFilter("all"),
            }}
          />
        ) : (
          <EmptyState
            title={t("Belum Ada Notifikasi", "No Notifications Yet")}
            description={t(
              "Pemberitahuan aktivitas seputar status lamaran, panggilan wawancara, dan lowongan Anda akan tampil di sini.",
              "Activity updates regarding your applications, interview invites, and jobs will appear here."
            )}
            icon={<BellOff className="w-6 h-6 text-slate-400" />}
            action={{
              label: t("Jelajahi Lowongan", "Explore Jobs"),
              href: "/lowongan",
            }}
          />
        )
      ) : (
        <div className="space-y-3" role="feed" aria-label={t("Daftar notifikasi", "Notifications list")}>
          {filteredNotifications.map((item) => (
            <NotificationItem
              key={item.id}
              notification={item}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
