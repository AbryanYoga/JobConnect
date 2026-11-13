import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ErrorState } from "@/components/ui/ErrorState";
import { NotificationList } from "@/components/notifikasi/NotificationList";

export const metadata: Metadata = {
  title: "Notifikasi",
  description:
    "Pantau pemberitahuan aktivitas seputar status lamaran, wawancara, dan info lowongan Anda di JobConnect.",
};

export default async function NotifikasiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/notifikasi");
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#FAF8F0] py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-8 shadow-card">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
              Notifikasi
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Pantau pemberitahuan terkini seputar lamaran, panggilan wawancara, dan pembaruan lowongan Anda.
            </p>
          </div>

          {error ? (
            <ErrorState
              title="Gagal Memuat Notifikasi"
              message="Terjadi kendala saat mengambil data notifikasi Anda. Silakan coba muat ulang."
              actionHref="/notifikasi"
              actionLabel="Muat Ulang Halaman"
            />
          ) : (
            <NotificationList
              initialNotifications={notifications || []}
            />
          )}
        </div>
      </div>
    </div>
  );
}
