"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  PlusCircle,
  Users,
  ExternalLink,
  Edit3,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import { CloseJobButton } from "@/components/mitra/CloseJobButton";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  EDUCATION_LABEL,
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";
import { useLanguage } from "@/lib/i18n";

export interface MitraLowonganItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  work_mode: string;
  job_type: string;
  education_min: string | null;
  experience_min_years: number;
  review_note?: string | null;
  created_at: string;
  deadline?: string | null;
  applicantCount: number;
}

interface MitraLowonganViewProps {
  jobs: MitraLowonganItem[];
  filterStatus?: string;
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

export function MitraLowonganView({
  jobs,
  filterStatus = "",
}: MitraLowonganViewProps) {
  const { t, language } = useLanguage();
  const locale = language === "en" ? "en-US" : "id-ID";

  const FILTER_TABS = [
    { label: t("Semua", "All"), value: "" },
    { label: t("Tayang", "Live"), value: "open" },
    { label: t("Menunggu ACC", "Pending Approval"), value: "pending" },
    { label: t("Draft", "Draft"), value: "draft" },
    { label: t("Ditutup", "Closed"), value: "closed" },
    { label: t("Ditolak", "Rejected"), value: "rejected" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return {
          label: t("Tayang (Open)", "Live (Open)"),
          className: "bg-emerald-50 text-emerald-800 border-emerald-200",
          icon: CheckCircle2,
        };
      case "pending":
        return {
          label: t("Menunggu ACC", "Pending Approval"),
          className: "bg-amber-50 text-amber-900 border-amber-300",
          icon: Clock,
        };
      case "draft":
        return {
          label: t("Draft", "Draft"),
          className: "bg-slate-100 text-slate-800 border-slate-300",
          icon: FileText,
        };
      case "rejected":
        return {
          label: t("Ditolak", "Rejected"),
          className: "bg-red-50 text-red-800 border-red-200",
          icon: XCircle,
        };
      case "closed":
        return {
          label: t("Ditutup", "Closed"),
          className: "bg-slate-100 text-slate-600 border-slate-200",
          icon: Briefcase,
        };
      case "removed":
        return {
          label: t("Ditakedown", "Taken Down"),
          className: "bg-red-100 text-red-900 border-red-300",
          icon: AlertTriangle,
        };
      default:
        return {
          label: status,
          className: "bg-slate-100 text-slate-700 border-slate-200",
          icon: Briefcase,
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {t("Kelola Lowongan Perusahaan", "Manage Company Vacancies")}
          </h1>
          <p className="text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
            {t(
              "Pantau status verifikasi, periksa jumlah kandidat pelamar, dan perbarui rincian lowongan kerja Anda.",
              "Monitor verification status, inspect candidate count, and update your job vacancy details."
            )}
          </p>
        </div>

        <Link
          href="/mitra/lowongan/tambah"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-sm shadow-2xs hover:shadow transition shrink-0 min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>{t("Pasang Lowongan Baru", "Post New Job")}</span>
        </Link>
      </div>

      {/* Baris Tab Filter Status */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
        aria-label={t("Filter status lowongan", "Filter job vacancy status")}
      >
        {FILTER_TABS.map((tab) => {
          const isActive =
            (!filterStatus && tab.value === "") || filterStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={tab.value ? `/mitra/lowongan?status=${tab.value}` : "/mitra/lowongan"}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition min-h-[44px] flex items-center justify-center ${
                isActive
                  ? "bg-black text-white shadow-2xs"
                  : "bg-white text-slate-700 hover:text-black border border-black/[0.08] hover:bg-black/[0.03]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Konten Daftar Lowongan */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-black/[0.08] p-8 sm:p-14 text-center shadow-card space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center mx-auto text-black shadow-2xs">
            <Briefcase className="w-7 h-7" aria-hidden="true" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-black text-black">
              {filterStatus
                ? t("Tidak ada lowongan dengan status ini", "No vacancies found with this status")
                : t("Kamu belum punya lowongan", "You don't have any job vacancies yet")}
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {filterStatus
                ? t(
                    "Belum ada lowongan yang sesuai dengan filter yang Anda pilih. Coba pilih status lain atau tampilkan seluruh lowongan.",
                    "No vacancies match your selected filter. Try selecting another status or view all vacancies."
                  )
                : t(
                    "Pasang lowongan pekerjaan pertama Anda untuk mulai menerima lamaran dan menemukan kandidat terbaik.",
                    "Post your first vacancy to start receiving applications and find the best candidates."
                  )}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {filterStatus ? (
              <Link
                href="/mitra/lowongan"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-black text-white font-bold text-xs sm:text-sm shadow-2xs transition min-h-[44px]"
              >
                {t("Tampilkan Semua Lowongan", "Show All Vacancies")}
              </Link>
            ) : (
              <Link
                href="/mitra/lowongan/tambah"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-xs sm:text-sm shadow-2xs transition min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                <span>{t("Pasang Lowongan Pertama", "Post Your First Job")}</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const badge = getStatusBadge(job.status);
            const count = job.applicantCount;
            const typeLabel =
              JOB_TYPE_LABEL[job.job_type as JobType] || job.job_type;
            const modeLabel =
              WORK_MODE_LABEL[job.work_mode as WorkMode] || job.work_mode;
            const eduLabel =
              EDUCATION_LABEL[job.education_min as EducationMin] || job.education_min;
            const BadgeIcon = badge.icon;

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4 hover:border-black/[0.15] transition"
              >
                {/* Baris Atas: Badge Status & Tanggal */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.className}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {t("Diajukan", "Submitted")} {formatDate(job.created_at, locale)}
                    </span>
                  </div>

                  {job.status === "open" && (
                    <Link
                      href={`/lowongan/${job.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-black transition min-h-[44px]"
                    >
                      <span>{t("Lihat Halaman Publik", "View Public Page")}</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>

                {/* Judul Lowongan & Kriteria Utama */}
                <div className="space-y-2">
                  <h2 className="text-lg sm:text-xl font-black text-black">
                    {job.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF8F0] border border-black/[0.06] text-black font-bold">
                      {t(typeLabel, typeLabel)}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF8F0] border border-black/[0.06] text-black font-bold">
                      {t(modeLabel, modeLabel)}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF8F0] border border-black/[0.06] text-slate-700">
                      {t("Pendidikan", "Education")}: {t(eduLabel, eduLabel)}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#FAF8F0] border border-black/[0.06] text-slate-700">
                      {t("Pengalaman", "Experience")}: {job.experience_min_years}{" "}
                      {language === "en" ? "yrs" : "thn"}
                    </span>
                  </div>
                </div>

                {/* Peringatan jika lowongan ditolak admin */}
                {job.status === "rejected" && job.review_note && (
                  <div
                    role="alert"
                    className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-3 font-medium"
                  >
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
                    <div className="space-y-0.5">
                      <span className="font-bold block">
                        {t("Catatan Penolakan dari Admin:", "Rejection Note from Admin:")}
                      </span>
                      <p className="leading-relaxed">{job.review_note}</p>
                    </div>
                  </div>
                )}

                {/* Baris Bawah: Pelamar & Tombol Aksi */}
                <div className="pt-3 border-t border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-500" aria-hidden="true" />
                    <span className="font-medium text-slate-600">
                      {t("Pelamar Masuk:", "Received Applicants:")}
                    </span>
                    <span className="font-black text-black">
                      {count} {language === "en" ? "candidates" : "orang"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    <Link
                      href={`/mitra/lowongan/${job.id}/pelamar`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF8F0] hover:bg-[#F3EEDD] text-black text-xs font-bold border border-black/[0.08] transition min-h-[44px]"
                    >
                      <span>
                        {t("Lihat Pelamar", "View Applicants")} ({count})
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>

                    <Link
                      href={`/mitra/lowongan/${job.id}/edit`}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full hover:bg-black/[0.05] text-black text-xs font-bold border border-black/[0.08] transition min-h-[44px]"
                    >
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t("Edit Lowongan", "Edit Job")}</span>
                    </Link>

                    {job.status === "open" && (
                      <CloseJobButton jobId={job.id} jobTitle={job.title} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
