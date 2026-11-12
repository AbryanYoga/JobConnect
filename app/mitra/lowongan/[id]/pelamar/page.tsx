import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Users,
  ArrowLeft,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  Briefcase,
  SlidersHorizontal,
  ArrowUpDown,
  Clock,
  AlertTriangle,
  FolderGit2,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/LinkedinIcon";
import { StatusBadge, type ApplicationStatus } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CopyJobLinkButton } from "@/components/mitra/CopyJobLinkButton";
import {
  calculateAge,
  EDUCATION_LEVEL_OPTIONS,
  type PortfolioItem,
} from "@/lib/validation/profil";

export const metadata: Metadata = {
  title: "Daftar Pelamar - Dashboard Mitra",
  description: "Kelola dan seleksi daftar kandidat pelamar kerja pada lowongan resmi perusahaan mitra.",
};

interface PelamarPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    status?: string;
    ai?: string;
    sort?: string;
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

const FILTER_TABS: { label: string; value: string }[] = [
  { label: "Semua", value: "semua" },
  { label: "Dikirim", value: "dikirim" },
  { label: "Ditinjau", value: "ditinjau" },
  { label: "Shortlist", value: "shortlist" },
  { label: "Wawancara", value: "wawancara" },
  { label: "Ditawari", value: "ditawari" },
  { label: "Diterima", value: "diterima" },
  { label: "Ditolak", value: "ditolak" },
];

const AI_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "Semua Hasil AI", value: "semua" },
  { label: "Kesesuaian Tinggi", value: "tinggi" },
  { label: "Kesesuaian Sedang", value: "sedang" },
  { label: "Kesesuaian Rendah", value: "rendah" },
  { label: "Tanpa Analisis AI", value: "tanpa_analisis" },
];

const SORT_OPTIONS: { label: string; value: string }[] = [
  { label: "Terbaru", value: "terbaru" },
  { label: "Skor AI Tertinggi", value: "skor_desc" },
  { label: "Skor AI Terendah", value: "skor_asc" },
  { label: "Nama (A-Z)", value: "nama_asc" },
];

type AiReviewSummary = {
  id: number;
  status: "pending" | "processing" | "done" | "failed" | "skipped";
  score: number | null;
  level: "tinggi" | "sedang" | "rendah" | null;
  suspicious: boolean;
};

type AppItem = {
  id: number;
  job_id: number;
  user_id: string;
  status: ApplicationStatus;
  ai_consent: boolean;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    headline: string | null;
    avatar_url?: string | null;
    province_id?: number | null;
    city_id?: number | null;
    birth_date?: string | null;
    education_level?: string | null;
    linkedin_url?: string | null;
    portfolio_url?: string | null;
    portfolios?: PortfolioItem[] | null;
  } | null;
  application_ai_reviews: AiReviewSummary | AiReviewSummary[] | null;
};

export default async function PelamarPage({
  params,
  searchParams,
}: PelamarPageProps) {
  const { id } = await params;
  const jobId = Number(id);

  if (isNaN(jobId) || jobId <= 0) {
    notFound();
  }

  const {
    status: statusFilter,
    ai: aiFilter,
    sort: sortOption,
  } = await searchParams;

  const activeTab = statusFilter || "semua";
  const activeAiFilter = aiFilter || "semua";
  const activeSort = sortOption || "terbaru";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/mitra/lowongan/${jobId}/pelamar`);
  }

  // Ambil profil perusahaan pemilik akun
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect("/mitra/profil-perusahaan");
  }

  // Ambil detail lowongan dan pastikan milik perusahaan ini
  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, slug, status, created_at, company_id")
    .eq("id", jobId)
    .eq("company_id", company.id)
    .maybeSingle();

  if (!job) {
    notFound();
  }

  // Ambil seluruh pelamar pada lowongan ini beserta hasil evaluasi AI dan data profil akun
  let rawApplications: unknown = null;
  const { data: fullApps, error: fullAppsError } = await supabase
    .from("applications")
    .select(`
      id,
      job_id,
      user_id,
      status,
      ai_consent,
      created_at,
      updated_at,
      profiles:user_id (
        id,
        name,
        email,
        phone,
        headline,
        avatar_url,
        province_id,
        city_id,
        birth_date,
        education_level,
        linkedin_url,
        portfolio_url,
        portfolios
      ),
      application_ai_reviews (
        id,
        status,
        score,
        level,
        suspicious
      )
    `)
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (fullAppsError || !fullApps) {
    const { data: basicApps } = await supabase
      .from("applications")
      .select(`
        id,
        job_id,
        user_id,
        status,
        ai_consent,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          name,
          email,
          phone,
          headline
        ),
        application_ai_reviews (
          id,
          status,
          score,
          level,
          suspicious
        )
      `)
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    rawApplications = basicApps;
  } else {
    rawApplications = fullApps;
  }

  const applications: AppItem[] = (rawApplications as unknown as AppItem[]) || [];

  const getAiReview = (app: AppItem): AiReviewSummary | null => {
    if (!app.application_ai_reviews) return null;
    if (Array.isArray(app.application_ai_reviews)) {
      return app.application_ai_reviews[0] || null;
    }
    return app.application_ai_reviews;
  };

  // Hitung jumlah pelamar per status
  const statusCounts: Record<string, number> = {
    semua: applications.length,
    dikirim: 0,
    ditinjau: 0,
    shortlist: 0,
    wawancara: 0,
    ditawari: 0,
    diterima: 0,
    ditolak: 0,
  };

  applications.forEach((app) => {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status] += 1;
    }
  });

  // Hitung jumlah pelamar per filter AI
  const aiCounts: Record<string, number> = {
    semua: applications.length,
    tinggi: 0,
    sedang: 0,
    rendah: 0,
    tanpa_analisis: 0,
  };

  applications.forEach((app) => {
    if (!app.ai_consent) {
      aiCounts.tanpa_analisis += 1;
    } else {
      const rev = getAiReview(app);
      if (
        rev?.status === "done" &&
        rev.level &&
        aiCounts[rev.level] !== undefined
      ) {
        aiCounts[rev.level] += 1;
      }
    }
  });

  // Filter daftar pelamar sesuai status tab dan kriteria AI
  let filteredApplications = [...applications];

  if (activeTab !== "semua") {
    filteredApplications = filteredApplications.filter(
      (app) => app.status === activeTab
    );
  }

  if (activeAiFilter === "tanpa_analisis") {
    filteredApplications = filteredApplications.filter((app) => !app.ai_consent);
  } else if (activeAiFilter === "tinggi") {
    filteredApplications = filteredApplications.filter((app) => {
      const rev = getAiReview(app);
      return app.ai_consent && rev?.status === "done" && rev.level === "tinggi";
    });
  } else if (activeAiFilter === "sedang") {
    filteredApplications = filteredApplications.filter((app) => {
      const rev = getAiReview(app);
      return app.ai_consent && rev?.status === "done" && rev.level === "sedang";
    });
  } else if (activeAiFilter === "rendah") {
    filteredApplications = filteredApplications.filter((app) => {
      const rev = getAiReview(app);
      return app.ai_consent && rev?.status === "done" && rev.level === "rendah";
    });
  }

  // Pengurutan daftar pelamar
  filteredApplications.sort((a, b) => {
    if (activeSort === "skor_desc") {
      const scoreA = getAiReview(a)?.score ?? -1;
      const scoreB = getAiReview(b)?.score ?? -1;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (activeSort === "skor_asc") {
      const scoreA = getAiReview(a)?.score ?? 999;
      const scoreB = getAiReview(b)?.score ?? 999;
      if (scoreA !== scoreB) return scoreA - scoreB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (activeSort === "nama_asc") {
      const nameA = a.profiles?.name?.toLowerCase() || "";
      const nameB = b.profiles?.name?.toLowerCase() || "";
      return nameA.localeCompare(nameB);
    }
    // Default terbaru berdasarkan created_at
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Helper pembuat URL filter dan sorting
  const buildFilterUrl = (newParams: {
    status?: string;
    ai?: string;
    sort?: string;
  }) => {
    const paramsMap = new URLSearchParams();
    const finalStatus =
      newParams.status !== undefined ? newParams.status : activeTab;
    const finalAi = newParams.ai !== undefined ? newParams.ai : activeAiFilter;
    const finalSort =
      newParams.sort !== undefined ? newParams.sort : activeSort;

    if (finalStatus && finalStatus !== "semua")
      paramsMap.set("status", finalStatus);
    if (finalAi && finalAi !== "semua") paramsMap.set("ai", finalAi);
    if (finalSort && finalSort !== "terbaru")
      paramsMap.set("sort", finalSort);

    const queryString = paramsMap.toString();
    return `/mitra/lowongan/${job.id}/pelamar${
      queryString ? `?${queryString}` : ""
    }`;
  };

  return (
    <div className="space-y-8">
      {/* Tombol Kembali ke Daftar Lowongan */}
      <div>
        <Link
          href="/mitra/lowongan"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-black transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Kelola Lowongan</span>
        </Link>
      </div>

      {/* Header Lowongan & Metrik Pelamar */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F0] border border-black/[0.06] text-xs font-bold text-slate-800">
            <Briefcase className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            <span>Kandidat Pelamar Lowongan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {job.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Diajukan pada {formatDateIndo(job.created_at)} • Total {applications.length} pelamar terdaftar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <CopyJobLinkButton jobSlug={job.slug} />

          {job.status === "open" && (
            <Link
              href={`/lowongan/${job.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-black/[0.08] hover:bg-black/[0.04] text-black font-bold text-xs sm:text-sm transition min-h-[44px]"
            >
              <span>Lihat Tayangan</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {/* Tab Filter Status Pelamar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count = statusCounts[tab.value] ?? 0;

          return (
            <Link
              key={tab.value}
              href={buildFilterUrl({ status: tab.value })}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition min-h-[44px] ${
                isActive
                  ? "bg-black text-white shadow-2xs"
                  : "bg-white hover:bg-black/[0.05] text-slate-700 border border-black/[0.08]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-black/[0.06] text-black"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Bilah Filter AI dan Pengurutan */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-4 sm:p-5 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Chip Filter Kategori AI */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 shrink-0 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>Kategori AI:</span>
          </div>

          {AI_FILTER_OPTIONS.map((opt) => {
            const isActive = activeAiFilter === opt.value;
            const count = aiCounts[opt.value];

            return (
              <Link
                key={opt.value}
                href={buildFilterUrl({ ai: opt.value })}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition min-h-[44px] ${
                  isActive
                    ? "bg-[#0D0C23] text-[#FFDD00] shadow-2xs"
                    : "bg-[#FAF8F0] text-slate-700 border border-black/[0.06] hover:bg-black/[0.05]"
                }`}
              >
                <span>{opt.label}</span>
                {count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-black/[0.08] text-black"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Kontrol Pengurutan Pelamar */}
        <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-black/[0.06]">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>Urutkan:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {SORT_OPTIONS.map((sortOpt) => {
              const isActive = activeSort === sortOpt.value;

              return (
                <Link
                  key={sortOpt.value}
                  href={buildFilterUrl({ sort: sortOpt.value })}
                  className={`px-3 py-2 rounded-full text-xs font-bold transition min-h-[44px] inline-flex items-center ${
                    isActive
                      ? "bg-black text-[#FFDD00] shadow-2xs"
                      : "bg-[#FAF8F0] text-slate-700 hover:text-black border border-black/[0.06]"
                  }`}
                >
                  {sortOpt.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daftar Kandidat Pelamar */}
      {applications.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            title="Belum ada yang melamar"
            description="Belum ada pencari kerja yang mengirimkan lamaran untuk posisi ini. Bagikan tautan lowongan agar kandidat potensial dapat menemukan dan melamar pekerjaan Anda."
            action={{
              label: "Kembali ke Kelola Lowongan",
              href: "/mitra/lowongan",
            }}
          />
          <div className="flex justify-center pt-2">
            <CopyJobLinkButton jobSlug={job.slug} />
          </div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/[0.08] p-8 sm:p-12 text-center shadow-card space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] flex items-center justify-center mx-auto text-slate-500">
            <Users className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h2 className="text-lg font-black text-black">
              Tidak ada kandidat sesuai kriteria
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Tidak ditemukan pelamar yang memenuhi kombinasi status dan filter AI yang Anda pilih.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/mitra/lowongan/${job.id}/pelamar`}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-black text-white font-bold text-xs transition min-h-[44px]"
            >
              Reset Semua Filter
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const profile = app.profiles;
            const applicantName = profile?.name || "Kandidat Pelamar";
            const headline = profile?.headline || "Pencari Kerja JobConnect";
            const initials = getInitials(applicantName);
            const aiReview = getAiReview(app);
            const age = calculateAge(profile?.birth_date);
            const eduLabel =
              EDUCATION_LEVEL_OPTIONS.find((e) => e.value === profile?.education_level)?.label ||
              profile?.education_level;
            const hasPortfolio = Boolean(
              (Array.isArray(profile?.portfolios) && profile.portfolios.length > 0) ||
                profile?.portfolio_url
            );

            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-5 hover:border-black/[0.15] transition"
              >
                {/* Baris Atas: Informasi Kandidat & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={`Foto ${applicantName}`}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-2xs border border-black/10"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] text-black font-black text-sm flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-lg font-black text-black">
                          {applicantName}
                        </h2>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        {headline}
                      </p>

                      {/* Lencana Biodata Cepat */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
                        {age !== null && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            Usia {age} th
                          </span>
                        )}
                        {eduLabel && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FAF8F0] text-slate-700 border border-black/[0.06]">
                            {eduLabel}
                          </span>
                        )}
                        {hasPortfolio && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                            <FolderGit2 className="w-3 h-3 text-emerald-700" aria-hidden="true" />
                            <span>Ada Portofolio</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Lencana Evaluasi AI & Tanggal Melamar */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {!app.ai_consent ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                        <span>Tanpa Analisis AI</span>
                      </span>
                    ) : aiReview?.status === "done" ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {aiReview.level === "tinggi" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold text-[11px]">
                            Kesesuaian Tinggi
                          </span>
                        )}
                        {aiReview.level === "sedang" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-[11px]">
                            Kesesuaian Sedang
                          </span>
                        )}
                        {aiReview.level === "rendah" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-950 border border-rose-300 font-extrabold text-[11px]">
                            Kesesuaian Rendah
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFDD00] text-[#0D0C23] border border-black/[0.1] font-black text-[11px] shadow-2xs">
                          <Sparkles className="w-3 h-3 text-black" aria-hidden="true" />
                          <span>Skor {aiReview.score ?? 0}</span>
                        </span>
                      </div>
                    ) : aiReview?.status === "processing" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                        <span>Memproses AI</span>
                      </span>
                    ) : aiReview?.status === "failed" ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-900 border border-rose-200 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-700" aria-hidden="true" />
                        <span>AI Gagal</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
                        <span>Menunggu AI</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF8F0] border border-black/[0.06] text-slate-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                      <span>{formatDateIndo(app.created_at)}</span>
                    </span>
                  </div>
                </div>

                {/* Baris Bawah: Kontak & Tombol Aksi Tinjau */}
                <div className="pt-4 border-t border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
                    {profile?.email && (
                      <div className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="inline-flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile?.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#0A66C2] font-bold hover:underline"
                        title="Lihat Profil LinkedIn Pelamar"
                      >
                        <LinkedinIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/mitra/pelamar/${app.id}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-xs sm:text-sm shadow-2xs hover:shadow transition min-h-[44px] w-full sm:w-auto"
                  >
                    <span>Tinjau Kandidat</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
