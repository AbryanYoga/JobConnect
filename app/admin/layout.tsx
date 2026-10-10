import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: {
    template: "%s - Admin Moderator JobConnect",
    default: "Dashboard Admin Moderator - JobConnect",
  },
  description: "Area kerja administrator moderator untuk moderasi lowongan, verifikasi mitra, dan kurasi platform JobConnect.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=/admin");
  }

  // Periksa peran akun di profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/403");
  }

  // Hitung jumlah lowongan pending untuk indikator antrean
  const { count: pendingCount } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return (
    <div className="min-h-screen bg-[#FAF8F0] text-slate-800 antialiased py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-8">
        <AdminSidebar
          adminName={profile?.name || "Admin"}
          adminEmail={profile?.email || user.email || ""}
          pendingJobsCount={pendingCount || 0}
        />

        <main className="flex-1 w-full min-w-0" id="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
