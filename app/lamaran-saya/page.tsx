import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  Building2,
  MapPin,
  Calendar,
  ArrowRight,
  Briefcase,
  Clock,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  StatusBadge,
  type ApplicationStatus,
} from "@/components/ui/StatusBadge";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  type JobType,
  type WorkMode,
} from "@/lib/labels";

export const metadata: Metadata = {
  title: "Lamaran Saya",
  description:
    "Pantau status pengajuan berkas, riwayat lamaran, dan pembaruan seleksi kerja Anda di JobConnect.",
};

function formatDateIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatDateTimeIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getCompanyInitials(name: string): string {
  if (!name) return "CO";
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => !["pt", "cv", "tbk", "ud"].includes(w.toLowerCase()));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default async function LamaranSayaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/lamaran-saya");
  }

  const { data: applications, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      job_id,
      cv_path,
      cover_letter,
      status,
      ai_consent,
      message_to_applicant,
      interview_at,
      interview_place,
      created_at,
      updated_at,
      job:jobs (
        id,
        title,
        slug,
        job_type,
        work_mode,
        company:companies (
          id,
          name,
          slug,
          logo_path,
          city:cities (
            name,
            province:provinces (name)
          )
        )
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F0]/40 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Breadcrumb
            items={[{ label: "Beranda", href: "/" }, { label: "Lamaran Saya" }]}
          />
          <ErrorState
            title="Gagal Memuat Riwayat Lamaran"
            message={
              error.message ||
              "Terjadi gangguan saat memuat data lamaran. Silakan coba kembali."
            }
          />
        </div>
      </div>
    );
  }

  const applicationList = applications || [];

  return (
    <div className="min-h-screen bg-[#FAF8F0]/40 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigasi Breadcrumb */}
        <Breadcrumb
          items={[{ label: "Beranda", href: "/" }, { label: "Lamaran Saya" }]}
        />

        {/* Header Halaman */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10">
            <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Portofolio Lamaran Kerja</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
                Riwayat Lamaran Saya
              </h1>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Pantau progres peninjauan berkas, undangan wawancara, dan keputusan resmi dari perusahaan mitra.
              </p>
            </div>
            {applicationList.length > 0 && (
              <Link
                href="/lowongan"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F2D200] text-black font-bold text-xs transition border border-black/10 shadow-2xs self-start sm:self-auto min-h-[44px]"
              >
                <span>Cari Lowongan Lain</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {/* Daftar Lamaran atau State Kosong */}
        {applicationList.length === 0 ? (
          <div className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-12 shadow-card">
            <EmptyState
              title="Kamu belum melamar pekerjaan."
              description="Temukan berbagai peluang kerja terverifikasi dari mitra perusahaan dan kirimkan CV terbaikmu sekarang."
              action={{
                label: "Cari Lowongan",
                href: "/lowongan",
              }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {applicationList.map((app) => {
              const jobData = Array.isArray(app.job) ? app.job[0] : app.job;
              const companyData = jobData?.company
                ? Array.isArray(jobData.company)
                  ? jobData.company[0]
                  : jobData.company
                : null;
              const cityData = companyData?.city
                ? Array.isArray(companyData.city)
                  ? companyData.city[0]
                  : companyData.city
                : null;
              const provinceData = cityData?.province
                ? Array.isArray(cityData.province)
                  ? cityData.province[0]
                  : cityData.province
                : null;

              const companyName = companyData?.name || "Perusahaan Mitra";
              const companyInitials = getCompanyInitials(companyName);
              const jobTitle = jobData?.title || "Posisi Pekerjaan";
              const locationText =
                [cityData?.name, provinceData?.name].filter(Boolean).join(", ") ||
                (jobData?.work_mode === "remote" ? "Kerja Remote" : "Indonesia");

              let logoUrl: string | null = null;
              if (companyData?.logo_path) {
                const { data: publicUrlData } = supabase.storage
                  .from("company-logos")
                  .getPublicUrl(companyData.logo_path);
                logoUrl = publicUrlData.publicUrl;
              }

              return (
                <article
                  key={app.id}
                  className="bg-white rounded-[24px] sm:rounded-[28px] border border-black/[0.08] p-5 sm:p-7 shadow-card hover:border-black/[0.16] transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Info Perusahaan & Posisi */}
                    <div className="flex items-start gap-3.5 sm:gap-4 min-w-0 flex-1">
                      {/* Logo Perusahaan */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-black/[0.08] bg-[#FAF8F0] flex items-center justify-center shrink-0 overflow-hidden">
                        {logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt={`Logo ${companyName}`}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-black text-sm text-black select-none">
                            {companyInitials}
                          </span>
                        )}
                      </div>

                      {/* Judul & Meta */}
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/lamaran-saya/${app.id}`}
                            className="text-base sm:text-lg font-black text-black hover:text-blue-700 transition tracking-tight"
                          >
                            {jobTitle}
                          </Link>
                          {jobData?.job_type && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                              {JOB_TYPE_LABEL[jobData.job_type as JobType] || jobData.job_type}
                            </span>
                          )}
                          {jobData?.work_mode && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                              {WORK_MODE_LABEL[jobData.work_mode as WorkMode] || jobData.work_mode}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap font-medium">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                            <span>{companyName}</span>
                          </span>
                          <span className="text-slate-300" aria-hidden="true">•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                            <span>{locationText}</span>
                          </span>
                          <span className="text-slate-300" aria-hidden="true">•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                            <span>Dilamar {formatDateIndo(app.created_at)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="self-start sm:self-center shrink-0">
                      <StatusBadge status={app.status as ApplicationStatus} />
                    </div>
                  </div>

                  {/* Keterangan Tambahan untuk Status Wawancara */}
                  {app.status === "wawancara" && app.interview_at && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900 font-medium">
                      <Video className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
                      <div>
                        <span className="font-bold">Undangan Wawancara: </span>
                        <span>{formatDateTimeIndo(app.interview_at)}</span>
                        {app.interview_place && (
                          <span className="block mt-0.5 text-blue-800">
                            Lokasi/Tautan: {app.interview_place}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Catatan Pesan Penolakan jika Ditolak */}
                  {app.status === "ditolak" && app.message_to_applicant && (
                    <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200/80 text-xs text-red-900 font-medium">
                      <span className="font-bold">Pesan dari Perusahaan: </span>
                      <span>{app.message_to_applicant}</span>
                    </div>
                  )}

                  {/* Footer Kartu & Aksi */}
                  <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Terakhir diperbarui {formatDateIndo(app.updated_at || app.created_at)}</span>
                    </span>
                    <Link
                      href={`/lamaran-saya/${app.id}`}
                      className="inline-flex items-center gap-1.5 font-bold text-black hover:text-blue-700 transition min-h-[44px]"
                    >
                      <span>Lihat Detail & Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
