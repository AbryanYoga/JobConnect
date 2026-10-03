import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProfilForm } from "./ProfilForm";

export const metadata: Metadata = {
  title: "Profil Saya",
  description:
    "Kelola data pribadi, nomor kontak, headline profesional, dan notifikasi akun pelamar di JobConnect.",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDateIndo(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export default async function ProfilPage() {
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      redirect("/login?redirectTo=/profil");
    }

    user = authUser;

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, name, email, phone, headline, role, email_notifications, created_at")
      .eq("id", user.id)
      .single();

    profile = profileData;
  } catch (err: unknown) {
    // Jika redirect next/navigation terpanggil, teruskan throw agar redirect bekerja
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }

    // Jika env belum diatur (misal saat proses build statis)
    profile = null;
  }

  const name = profile?.name || "Pelamar JobConnect";
  const email = profile?.email || user?.email || "pelamar@jobconnect.id";
  const phone = profile?.phone || null;
  const headline = profile?.headline || null;
  const emailNotifications = profile?.email_notifications ?? true;
  const createdAt = profile?.created_at
    ? formatDateIndo(profile.created_at)
    : "Terbaru";

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Profil */}
        <div className="bg-white rounded-card border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-navy-700 text-white font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-xs border-2 border-white ring-2 ring-navy-100">
                {getInitials(name)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-navy-950 tracking-tight">
                    {name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-800 text-xs font-medium border border-navy-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
                    <span>Pelamar Terverifikasi</span>
                  </span>
                </div>
                <p className="text-sm text-slate-600">{email}</p>
                {headline && (
                  <p className="text-sm font-medium text-slate-800 pt-0.5">
                    {headline}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3.5 py-2 rounded-control border border-slate-200 shrink-0">
              <Calendar className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span>Bergabung {createdAt}</span>
            </div>
          </div>
        </div>

        {/* Formulir Profil */}
        <ProfilForm
          initialData={{
            name,
            email,
            phone,
            headline,
            emailNotifications,
          }}
        />
      </div>
    </div>
  );
}
