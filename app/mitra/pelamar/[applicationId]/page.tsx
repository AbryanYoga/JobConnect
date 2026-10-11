import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Briefcase,
  FileText,
  ExternalLink,
  History,
} from "lucide-react";
import { StatusBadge, type ApplicationStatus } from "@/components/ui/StatusBadge";
import { ViewCvButton } from "@/components/mitra/ViewCvButton";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  type JobType,
  type WorkMode,
} from "@/lib/labels";

export const metadata: Metadata = {
  title: "Detail Kandidat Pelamar - Dashboard Mitra",
  description: "Tinjau data pelamar, riwayat lamaran, dan proses seleksi kandidat kerja.",
};

interface DetailPelamarPageProps {
  params: Promise<{
    applicationId: string;
  }>;
}

function formatDateIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default async function DetailPelamarPage({
  params,
}: DetailPelamarPageProps) {
  const { applicationId } = await params;
  const appId = Number(applicationId);

  if (isNaN(appId) || appId <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/mitra/pelamar/${appId}`);
  }

  // Ambil data profil perusahaan mitra yang login
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect("/mitra/profil-perusahaan");
  }

  // Ambil detail lamaran beserta data profil pelamar dan lowongan terkait
  const { data: rawApplication } = await supabase
    .from("applications")
    .select(`
      id,
      job_id,
      user_id,
      cv_path,
      cover_letter,
      ai_consent,
      status,
      message_to_applicant,
      interview_at,
      interview_place,
      decided_at,
      created_at,
      updated_at,
      profiles:user_id (
        id,
        name,
        email,
        phone,
        headline
      ),
      jobs:job_id (
        id,
        title,
        slug,
        status,
        job_type,
        work_mode,
        company_id
      )
    `)
    .eq("id", appId)
    .maybeSingle();

  type RawApp = {
    id: number;
    job_id: number;
    user_id: string;
    cv_path: string;
    cover_letter: string | null;
    ai_consent: boolean;
    status: ApplicationStatus;
    message_to_applicant: string | null;
    interview_at: string | null;
    interview_place: string | null;
    decided_at: string | null;
    created_at: string;
    updated_at: string;
    profiles: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
      headline: string | null;
    } | null;
    jobs: {
      id: number;
      title: string;
      slug: string;
      status: string;
      job_type: string;
      work_mode: string;
      company_id: number;
    } | null;
  };

  const application = rawApplication as unknown as RawApp | null;

  if (!application || !application.jobs || application.jobs.company_id !== company.id) {
    notFound();
  }

  // Ambil riwayat pembaruan status lamaran
  const { data: rawHistory } = await supabase
    .from("application_status_history")
    .select("id, from_status, to_status, note, created_at")
    .eq("application_id", appId)
    .order("created_at", { ascending: false });

  type HistoryItem = {
    id: number;
    from_status: string | null;
    to_status: ApplicationStatus;
    note: string | null;
    created_at: string;
  };

  const statusHistory = (rawHistory as unknown as HistoryItem[]) || [];

  const applicant = application.profiles;
  const applicantName = applicant?.name || "Kandidat Pelamar";
  const headline = applicant?.headline || "Pencari Kerja JobConnect";
  const initials = getInitials(applicantName);

  const job = application.jobs;
  const jobTypeLabel = JOB_TYPE_LABEL[job.job_type as JobType] || job.job_type;
  const workModeLabel = WORK_MODE_LABEL[job.work_mode as WorkMode] || job.work_mode;

  // Siapkan signed URL awal (berlaku 5 menit) untuk berkas CV privat
  let initialSignedCvUrl: string | null = null;
  if (application.cv_path) {
    try {
      const { data: signedData } = await supabase.storage
        .from("cvs")
        .createSignedUrl(application.cv_path, 300);
      initialSignedCvUrl = signedData?.signedUrl || null;
    } catch {
      initialSignedCvUrl = null;
    }
  }

  return (
    <div className="space-y-8">
      {/* Navigasi Kembali */}
      <div>
        <Link
          href={`/mitra/lowongan/${application.job_id}/pelamar`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-black transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Daftar Pelamar ({job.title})</span>
        </Link>
      </div>

      {/* Kartu Profil Utama Kandidat */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-black font-black text-xl flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-black">
                  {applicantName}
                </h1>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {headline}
              </p>
            </div>
          </div>

          {/* Tag Pilihan AI */}
          <div className="flex items-center gap-2">
            {application.ai_consent ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                <span>Analisis AI Disetujui</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
                <span>Tanpa Analisis AI</span>
              </span>
            )}
          </div>
        </div>

        {/* Informasi Kontak & Tanggal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-black/[0.06] text-xs font-medium text-slate-700">
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.04]">
            <Mail className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            <span className="truncate">{applicant?.email || "Email tidak tercantum"}</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.04]">
            <Phone className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            <span className="truncate">{applicant?.phone || "Telepon tidak dicantumkan"}</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.04]">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
            <span>Melamar {formatDateIndo(application.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Grid Dua Kolom: Detail Lamaran & Riwayat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Surat Lamaran & Info Lowongan */}
        <div className="lg:col-span-2 space-y-6">
          {/* Posisi Lowongan yang Dilamar */}
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-black" aria-hidden="true" />
                <h2 className="text-base sm:text-lg font-black text-black">
                  Posisi Pekerjaan yang Dilamar
                </h2>
              </div>
              {job.status === "open" && (
                <Link
                  href={`/lowongan/${job.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-black transition"
                >
                  <span>Lihat Lowongan</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-2">
              <h3 className="text-base font-black text-black">
                {job.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-white border border-black/[0.06] font-bold text-black">
                  {jobTypeLabel}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-white border border-black/[0.06] font-bold text-black">
                  {workModeLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Surat Lamaran (Cover Letter) */}
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-black" aria-hidden="true" />
              <h2 className="text-base sm:text-lg font-black text-black">
                Surat Lamaran (Cover Letter)
              </h2>
            </div>

            {application.cover_letter ? (
              <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                {application.cover_letter}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm text-slate-500 font-medium italic">
                Kandidat tidak menyertakan surat lamaran tertulis khusus saat mengirimkan lamaran ini.
              </div>
            )}
          </div>

          {/* Berkas Curriculum Vitae (CV) */}
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-black" aria-hidden="true" />
              <h2 className="text-base sm:text-lg font-black text-black">
                Berkas Curriculum Vitae (CV)
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Berkas CV pelamar disimpan dalam ruang penyimpanan privat terenkripsi. Tautan akses dibuat menggunakan signed URL aman yang berlaku selama 5 menit untuk menjaga kerahasiaan data pelamar.
            </p>

            <div className="pt-2">
              <ViewCvButton
                applicationId={application.id}
                initialSignedUrl={initialSignedCvUrl}
              />
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Timeline Riwayat Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-5">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-black" aria-hidden="true" />
              <h2 className="text-base sm:text-lg font-black text-black">
                Riwayat Status Lamaran
              </h2>
            </div>

            {statusHistory.length === 0 ? (
              <div className="text-xs text-slate-500 font-medium p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06]">
                Belum ada catatan perubahan status lanjutan.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-black/[0.08]">
                {statusHistory.map((item) => (
                  <div key={item.id} className="relative space-y-1">
                    <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-black" />
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={item.to_status} />
                      <span className="text-[11px] text-slate-500 font-medium">
                        {formatDateIndo(item.created_at)}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-slate-600 font-medium pt-1">
                        {item.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
