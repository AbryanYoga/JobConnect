"use client";

import React from "react";
import Link from "next/link";
import {
  FileCheck2,
  Clock,
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Banknote,
  Search,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApproveJobModal } from "@/components/admin/ApproveJobModal";
import { RejectJobModal } from "@/components/admin/RejectJobModal";
import { TakedownJobModal } from "@/components/admin/TakedownJobModal";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  EDUCATION_LABEL,
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";
import { useLanguage } from "@/lib/i18n";

export interface AdminLowonganJobItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  work_mode: string;
  job_type: string;
  education_min: string | null;
  experience_min_years: number;
  skills: string[] | null;
  summary: string | null;
  responsibilities: string[] | null;
  nice_to_have: string[] | null;
  benefits: string[] | null;
  salary_min: number | null;
  salary_max: number | null;
  created_at: string;
  reviewed_at: string | null;
  review_note: string | null;
  deadline: string | null;
  companyName: string;
  companyIndustry?: string | null;
  categoryName: string;
  cityName?: string | null;
  provinceName?: string | null;
}

interface AdminLowonganViewProps {
  jobs: AdminLowonganJobItem[];
  pendingCount: number;
  openCount: number;
  rejectedCount: number;
  removedCount: number;
  currentTab: string;
  searchQuery?: string;
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

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AdminLowonganView({
  jobs,
  pendingCount,
  openCount,
  rejectedCount,
  removedCount,
  currentTab,
  searchQuery = "",
}: AdminLowonganViewProps) {
  const { t, language } = useLanguage();
  const locale = language === "en" ? "en-US" : "id-ID";

  const tabs = [
    {
      key: "pending",
      label: t("Menunggu Review", "Pending Review"),
      count: pendingCount,
    },
    {
      key: "open",
      label: t("Lowongan Aktif", "Active Vacancies"),
      count: openCount,
    },
    {
      key: "rejected_or_removed",
      label: t("Ditolak / Takedown", "Rejected / Taken Down"),
      count: rejectedCount + removedCount,
    },
    {
      key: "all",
      label: t("Semua", "All"),
      count: null,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-slate-900 text-[#FFDD00] flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              {t("Antrean Moderasi Lowongan", "Job Moderation Queue")}
            </h1>
          </div>
          <p className="text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
            {t(
              "Periksa kriteria, kelayakan tanggung jawab, dan standar transparansi informasi sebelum menyetujui publikasi lowongan.",
              "Verify criteria, responsibility eligibility, and information transparency standards before approving job publication."
            )}
          </p>
        </div>

        {/* Pencarian Judul */}
        <form method="get" className="w-full sm:w-72">
          {currentTab && <input type="hidden" name="status" value={currentTab} />}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder={t("Cari judul lowongan...", "Search job title...")}
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FAF8F0] border border-black/[0.08] text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[44px]"
            />
          </div>
        </form>
      </div>

      {/* Baris Tab Filter Status */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="tablist"
        aria-label={t("Tab antrean moderasi", "Moderation queue tabs")}
      >
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/admin/lowongan?status=${tab.key}${
                searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""
              }`}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition min-h-[44px] shrink-0 ${
                isActive
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:text-black border border-black/[0.08] hover:bg-[#FAF8F0]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                    isActive
                      ? "bg-[#FFDD00] text-black"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Daftar Kartu Antrean Lowongan */}
      {jobs.length === 0 ? (
        <EmptyState
          title={
            currentTab === "pending"
              ? t("Tidak Ada Lowongan Menunggu Review", "No Vacancies Awaiting Review")
              : t("Tidak Ada Lowongan Ditemukan", "No Vacancies Found")
          }
          description={
            currentTab === "pending"
              ? t(
                  "Seluruh pengajuan lowongan dari mitra perusahaan telah selesai dimoderasi. Kerja bagus!",
                  "All job submissions from partner companies have been moderated. Great work!"
                )
              : t(
                  "Tidak ada data lowongan yang sesuai dengan kriteria filter atau pencarian Anda saat ini.",
                  "No job listings matched your current filter or search criteria."
                )
          }
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          action={{
            label: t("Kembali ke Ringkasan", "Back to Overview"),
            href: "/admin",
          }}
        />
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => {
            const typeLabel =
              JOB_TYPE_LABEL[job.job_type as JobType] || job.job_type;
            const modeLabel =
              WORK_MODE_LABEL[job.work_mode as WorkMode] || job.work_mode;
            const eduLabel =
              job.education_min && EDUCATION_LABEL[job.education_min as EducationMin]
                ? EDUCATION_LABEL[job.education_min as EducationMin]
                : job.education_min || t("Tidak ditentukan", "Not specified");

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6"
              >
                {/* Header Kartu: Status, Judul, Perusahaan */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                        {job.companyName}
                      </span>
                      {job.companyIndustry && (
                        <span className="text-slate-500 font-medium">
                          ({job.companyIndustry})
                        </span>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium">
                        {t("Kategori:", "Category:")} <strong className="text-black">{job.categoryName}</strong>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                      {job.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        job.status === "pending"
                          ? "bg-amber-50 text-amber-900 border-amber-300"
                          : job.status === "open"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : job.status === "rejected"
                          ? "bg-red-50 text-red-800 border-red-200"
                          : job.status === "removed"
                          ? "bg-rose-100 text-rose-900 border-rose-300"
                          : "bg-slate-100 text-slate-800 border-slate-300"
                      }`}
                    >
                      {job.status === "pending" && t("Menunggu Review", "Pending Review")}
                      {job.status === "open" && t("Aktif (Open)", "Active (Open)")}
                      {job.status === "rejected" && t("Ditolak", "Rejected")}
                      {job.status === "removed" && t("Takedown (Removed)", "Taken Down")}
                      {job.status === "closed" && t("Ditutup", "Closed")}
                      {job.status === "draft" && t("Draft", "Draft")}
                    </span>
                  </div>
                </div>

                {/* Kriteria Utama Grid Chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-bold text-black">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>{t(typeLabel)}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-bold text-black">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>{t(modeLabel)}</span>
                    {job.cityName && <span className="font-normal text-slate-600">({job.cityName})</span>}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>{t("Pendidikan:", "Education:")} <strong className="text-black">{t(eduLabel)}</strong></span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>
                      {t("Pengalaman Min:", "Min Experience:")}{" "}
                      <strong className="text-black">
                        {job.experience_min_years} {t("tahun", "years")}
                      </strong>
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>
                      {t("Batas Lamaran:", "Deadline:")}{" "}
                      <strong className="text-black">
                        {job.deadline ? formatDate(job.deadline, locale) : t("Tidak ditentukan", "Not specified")}
                      </strong>
                    </span>
                  </span>
                </div>

                {/* Gaji & Lokasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-slate-700 shrink-0">
                      <Banknote className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-slate-500 block">{t("Rentang Gaji yang Ditawarkan:", "Offered Salary Range:")}</span>
                      <strong className="text-black font-black text-sm">
                        {job.salary_min && job.salary_max
                          ? `${formatRupiah(job.salary_min)} - ${formatRupiah(job.salary_max)}`
                          : job.salary_min
                          ? `${t("Mulai", "Starting from")} ${formatRupiah(job.salary_min)}`
                          : t("Dirahasiakan oleh perusahaan", "Confidential / Undisclosed")}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-slate-700 shrink-0">
                      <MapPin className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-slate-500 block">{t("Penempatan Lokasi Kerja:", "Work Location:")}</span>
                      <strong className="text-black font-black text-sm">
                        {job.work_mode === "remote"
                          ? t("Bekerja Jarak Jauh (Remote)", "Remote Work")
                          : job.cityName && job.provinceName
                          ? `${job.cityName}, ${job.provinceName}`
                          : job.cityName || t("Lokasi Ditentukan Perusahaan", "Company Determined")}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Ringkasan Lowongan */}
                {job.summary && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t("Ringkasan Lowongan:", "Job Summary:")}
                    </h3>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed bg-white rounded-2xl p-4 border border-black/[0.06]">
                      {job.summary}
                    </p>
                  </div>
                )}

                {/* Tanggung Jawab & Keahlian */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Tanggung Jawab */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-500 uppercase tracking-wider">
                      {t("Tanggung Jawab Utama", "Main Responsibilities")} ({job.responsibilities?.length || 0}):
                    </h3>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700 font-medium bg-white rounded-2xl p-4 border border-black/[0.06]">
                      {(job.responsibilities || []).map((resp: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Keahlian yang Dibutuhkan */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-500 uppercase tracking-wider">
                      {t("Keahlian yang Dibutuhkan", "Required Skills")} ({job.skills?.length || 0}):
                    </h3>
                    <div className="flex flex-wrap gap-1.5 bg-white rounded-2xl p-4 border border-black/[0.06]">
                      {(job.skills || []).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-[#FAF8F0] border border-black/[0.08] text-black font-semibold text-[11px]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Catatan Review Jika Ada */}
                {job.review_note && (
                  <div
                    role="alert"
                    className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 text-xs space-y-1"
                  >
                    <span className="font-bold block text-black">
                      {t("Catatan Moderator Sebelumnya", "Previous Moderator Note")} ({job.reviewed_at ? formatDate(job.reviewed_at, locale) : t("Review Terakhir", "Last Review")}):
                    </span>
                    <p className="font-medium leading-relaxed">{job.review_note}</p>
                  </div>
                )}

                {/* Baris Bawah: Waktu Pengajuan & Aksi */}
                <div className="pt-4 border-t border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 font-medium">
                    {t("Diajukan oleh mitra pada:", "Submitted by partner on:")}{" "}
                    <strong>{formatDate(job.created_at, locale)}</strong>
                  </span>

                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    {job.status === "open" && (
                      <>
                        {job.slug && (
                          <Link
                            href={`/lowongan/${job.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full hover:bg-black/[0.05] text-slate-700 hover:text-black font-bold border border-black/[0.08] transition min-h-[44px]"
                          >
                            <span>{t("Lihat Tampilan Publik", "View Public Page")}</span>
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          </Link>
                        )}
                        <TakedownJobModal
                          jobId={job.id}
                          jobTitle={job.title}
                          companyName={job.companyName}
                        />
                      </>
                    )}

                    {job.status === "pending" && (
                      <>
                        <ApproveJobModal
                          jobId={job.id}
                          jobTitle={job.title}
                          companyName={job.companyName}
                        />
                        <RejectJobModal
                          jobId={job.id}
                          jobTitle={job.title}
                          companyName={job.companyName}
                        />
                      </>
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
