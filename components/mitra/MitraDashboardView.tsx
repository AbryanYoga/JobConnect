"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  Users,
  FileCheck,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { getCompanyInitials } from "@/lib/company-logo";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  type JobType,
  type WorkMode,
} from "@/lib/labels";

export interface MitraDashboardRecentJob {
  id: number;
  title: string;
  slug: string;
  status: string;
  job_type: string;
  work_mode: string;
  created_at: string;
  applicantCount: number;
}

interface MitraDashboardViewProps {
  companyName: string;
  companyLogoUrl?: string | null;
  openJobsCount: number;
  pendingJobsCount: number;
  totalApplicationsCount: number;
  pendingReviewCount: number;
  totalJobsCount: number;
  recentJobs: MitraDashboardRecentJob[];
}

function formatDate(dateStr: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function MitraDashboardView({
  companyName,
  companyLogoUrl,
  openJobsCount,
  pendingJobsCount,
  totalApplicationsCount,
  pendingReviewCount,
  totalJobsCount,
  recentJobs,
}: MitraDashboardViewProps) {
  const [imageError, setImageError] = useState(false);
  const { t, language } = useLanguage();
  const locale = language === "en" ? "en-US" : "id-ID";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return {
          label: t("Tayang (Open)", "Live (Open)"),
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      case "pending":
        return {
          label: t("Menunggu ACC", "Pending Approval"),
          className: "bg-amber-50 text-amber-900 border-amber-300",
        };
      case "draft":
        return {
          label: t("Draft", "Draft"),
          className: "bg-slate-100 text-slate-800 border-slate-300",
        };
      case "rejected":
        return {
          label: t("Ditolak", "Rejected"),
          className: "bg-red-50 text-red-800 border-red-200",
        };
      case "closed":
        return {
          label: t("Ditutup", "Closed"),
          className: "bg-slate-100 text-slate-600 border-slate-200",
        };
      case "removed":
        return {
          label: t("Ditakedown", "Taken Down"),
          className: "bg-red-100 text-red-900 border-red-300",
        };
      default:
        return {
          label: status,
          className: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner Sapaan Ramah Mitra */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
            {companyLogoUrl && !imageError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={companyLogoUrl}
                alt={`Logo ${companyName}`}
                className="w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="font-black text-lg text-slate-800 select-none">
                {getCompanyInitials(companyName)}
              </span>
            )}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>{t("Mitra Resmi Terverifikasi", "Verified Official Partner")}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight truncate">
              {companyName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
              {t(
                "Kelola lowongan kerja resmi, pantau proses peninjauan admin, dan seleksi kandidat pelamar secara transparan tanpa pungutan liar.",
                "Manage official job postings, track admin review progress, and screen applicant candidates transparently without unauthorized fees."
              )}
            </p>
          </div>
        </div>

        <Link
          href="/mitra/lowongan/tambah"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-sm shadow-2xs hover:shadow transition shrink-0 min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>{t("Pasang Lowongan Baru", "Post New Job")}</span>
        </Link>
      </div>

      {/* Grid Statistik 4 Kolom */}
      <section aria-label={t("Ringkasan Statistik Rekrutmen", "Recruitment Statistics Summary")}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Kartu 1: Lowongan Tayang */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("Lowongan Tayang", "Live Vacancies")}
              </span>
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Briefcase className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-black">
              {openJobsCount}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {t("Aktif dapat dilamar publik", "Active and open for public applications")}
            </p>
          </div>

          {/* Kartu 2: Menunggu ACC Admin */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("Menunggu ACC", "Pending Approval")}
              </span>
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-black">
              {pendingJobsCount}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {t("Sedang diverifikasi admin", "Awaiting admin verification")}
            </p>
          </div>

          {/* Kartu 3: Total Pelamar Masuk */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("Total Pelamar", "Total Applicants")}
              </span>
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-black">
              {totalApplicationsCount}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {t("Berkas lamaran diterima", "Applications received")}
            </p>
          </div>

          {/* Kartu 4: Perlu Ditinjau */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("Perlu Ditinjau", "Needs Review")}
              </span>
              <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
                <FileCheck className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-black">
              {pendingReviewCount}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {t("Status dikirim atau ditinjau", "Status submitted or under review")}
            </p>
          </div>
        </div>
      </section>

      {/* Bagian Lowongan Terbaru */}
      <section aria-label={t("Daftar Lowongan Terbaru", "Recent Job Listings")} className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
              {t("Aktivitas Lowongan Terbaru", "Recent Job Activities")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {t(
                "Lowongan pekerjaan yang baru saja diajukan atau dikelola perusahaan Anda.",
                "Job postings recently submitted or managed by your company."
              )}
            </p>
          </div>

          {totalJobsCount > 0 && (
            <Link
              href="/mitra/lowongan"
              className="inline-flex items-center gap-1 text-xs font-bold text-black hover:underline min-h-[44px]"
            >
              <span>{t("Lihat Semua", "View All")} ({totalJobsCount})</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        {recentJobs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/[0.08] p-8 sm:p-12 text-center shadow-card space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center mx-auto text-black shadow-2xs">
              <Briefcase className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-black text-black">
                {t("Kamu belum punya lowongan", "You don't have any job vacancies yet")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {t(
                  "Pasang lowongan pertamamu untuk mulai menjangkau pencari kerja terverifikasi dari seluruh 38 provinsi di Indonesia.",
                  "Post your first vacancy to start reaching verified job seekers across all 38 provinces in Indonesia."
                )}
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/mitra/lowongan/tambah"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-xs sm:text-sm shadow-2xs transition min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                <span>{t("Pasang Lowongan Pertama", "Post Your First Job")}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-card divide-y divide-black/[0.06] overflow-hidden">
            {recentJobs.map((job) => {
              const badge = getStatusBadge(job.status);
              const typeLabel =
                JOB_TYPE_LABEL[job.job_type as JobType] || job.job_type;
              const modeLabel =
                WORK_MODE_LABEL[job.work_mode as WorkMode] || job.work_mode;

              return (
                <div
                  key={job.id}
                  className="p-5 sm:p-6 hover:bg-black/[0.01] transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        {t("Diajukan pada", "Submitted on")} {formatDate(job.created_at, locale)}
                      </span>
                    </div>

                    <Link
                      href={`/mitra/lowongan/${job.id}/pelamar`}
                      className="block font-black text-base sm:text-lg text-black hover:underline tracking-tight truncate"
                    >
                      {job.title}
                    </Link>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
                      <span>{t(typeLabel, typeLabel)}</span>
                      <span>•</span>
                      <span>{t(modeLabel, modeLabel)}</span>
                      <span>•</span>
                      <span className="text-black font-bold">
                        {job.applicantCount} {t("Pelamar", "Applicants")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
                    <Link
                      href={`/mitra/lowongan/${job.id}/pelamar`}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#FAF8F0] hover:bg-[#F2EED9] text-black font-bold text-xs transition border border-black/[0.08] min-h-[44px]"
                    >
                      <span>{t("Lihat Pelamar", "View Applicants")}</span>
                    </Link>
                    <Link
                      href={`/mitra/lowongan/${job.id}/edit`}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 rounded-full hover:bg-black/[0.05] text-slate-700 hover:text-black font-bold text-xs transition min-h-[44px]"
                    >
                      <span>{t("Kelola", "Manage")}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Banner Komitmen Rekrutmen Bersih */}
      <div className="bg-[#FAF8F0] rounded-3xl border border-black/[0.08] p-6 shadow-2xs flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-black text-[#FFDD00] flex items-center justify-center shrink-0 shadow-2xs">
          <ShieldAlert className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-black">
            {t("Komitmen Rekrutmen Bersih JobConnect", "JobConnect Clean Recruitment Commitment")}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {t(
              "JobConnect menjamin seluruh proses seleksi berjalan adil, transparan, dan bebas calo. Dilarang memungut biaya apa pun dari pelamar kerja.",
              "JobConnect ensures all selection processes are fair, transparent, and broker-free. Charging any fees to job seekers is strictly prohibited."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
