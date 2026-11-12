"use client";

import React from "react";
import Link from "next/link";
import {
  FileCheck2,
  Briefcase,
  Building2,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FolderTree,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  type JobType,
  type WorkMode,
} from "@/lib/labels";
import { useLanguage } from "@/lib/i18n";

interface AdminDashboardViewProps {
  pendingCount: number;
  openCount: number;
  companiesCount: number;
  applicationsCount: number;
  pendingJobs: {
    id: number;
    title: string;
    slug: string;
    work_mode: string;
    job_type: string;
    created_at: string;
    company: {
      name: string;
      city?: {
        name: string;
        province?: {
          name: string;
        } | null;
      } | null;
    } | null;
  }[];
}

function formatDateIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function AdminDashboardView({
  pendingCount,
  openCount,
  companiesCount,
  applicationsCount,
  pendingJobs,
}: AdminDashboardViewProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Header Dashboard */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-[#FFDD00] text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("Pusat Kendali Moderator", "Moderator Control Center")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {t("Ringkasan Platform JobConnect", "JobConnect Platform Overview")}
          </h1>
          <p className="text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
            {t(
              "Pantau data statistik, tangani antrean review lowongan kerja, dan verifikasi entitas perusahaan mitra.",
              "Monitor platform statistics, process job vacancy review queues, and verify partner company entities."
            )}
          </p>
        </div>

        <Link
          href="/admin/lowongan"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-sm shadow-2xs hover:shadow transition shrink-0 min-h-[44px]"
        >
          <FileCheck2 className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>{t("Buka Antrean Review", "Open Review Queue")}</span>
        </Link>
      </div>

      {/* Banner Peringatan Antrean Pending */}
      {pendingCount > 0 && (
        <div
          role="region"
          aria-label={t("Pemberitahuan antrean review", "Review queue notification")}
          className="bg-amber-50 rounded-3xl border border-amber-300 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-black mt-0.5">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black text-amber-950">
                {t(
                  `Terdapat ${pendingCount} Lowongan Menunggu Peninjauan`,
                  `There are ${pendingCount} Vacancies Awaiting Review`
                )}
              </h2>
              <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
                {t(
                  "Pengajuan dari mitra perusahaan membutuhkan verifikasi kelayakan kriteria sebelum dipublikasikan ke pencari kerja.",
                  "Submissions from partner companies require criteria verification before being published to job seekers."
                )}
              </p>
            </div>
          </div>

          <Link
            href="/admin/lowongan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition shrink-0 min-h-[44px]"
          >
            <span>{t("Tinjau Sekarang", "Review Now")}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Grid Metrik Utama Platform */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Antrean Pending */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t("Antrean Review", "Review Queue")}
            </span>
            <span className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-black text-black tracking-tight">
            {pendingCount}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {t("Memerlukan persetujuan moderator", "Requires moderator approval")}
          </p>
        </div>

        {/* Lowongan Aktif */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t("Lowongan Aktif", "Active Vacancies")}
            </span>
            <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <Briefcase className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-black text-black tracking-tight">
            {openCount}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {t("Tampil di halaman pencarian publik", "Live on public search")}
          </p>
        </div>

        {/* Perusahaan Terdaftar */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t("Mitra Perusahaan", "Partner Companies")}
            </span>
            <span className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
              <Building2 className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-black text-black tracking-tight">
            {companiesCount}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {t("Perusahaan pemberi kerja terdaftar", "Registered employer companies")}
          </p>
        </div>

        {/* Total Lamaran */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t("Total Berkas Masuk", "Total Submissions")}
            </span>
            <span className="w-9 h-9 rounded-2xl bg-[#FAF8F0] text-slate-800 border border-black/[0.08] flex items-center justify-center">
              <Users className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-black text-black tracking-tight">
            {applicationsCount}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {t("Lamaran dikirim oleh pencari kerja", "Applications submitted by job seekers")}
          </p>
        </div>
      </div>

      {/* Bagian Daftar Antrean Review Terkini */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-black tracking-tight">
              {t("Antrean Review Terbaru", "Latest Review Queue")}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t(
                "Pengajuan lowongan terdepan yang belum ditinjau oleh tim moderator.",
                "Upcoming vacancy submissions awaiting moderator review."
              )}
            </p>
          </div>

          <Link
            href="/admin/lowongan"
            className="text-xs font-bold text-slate-600 hover:text-black inline-flex items-center gap-1 transition"
          >
            <span>{t("Lihat Semua Antrean", "View All in Queue")}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {pendingJobs.length === 0 ? (
          <EmptyState
            title={t("Antrean Review Kosong", "Review Queue is Empty")}
            description={t(
              "Tidak ada lowongan baru yang membutuhkan moderasi saat ini. Semua pengajuan telah diproses.",
              "No new vacancies require moderation right now. All submissions have been processed."
            )}
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
            action={{
              label: t("Kelola Kategori Platform", "Manage Platform Categories"),
              href: "/admin/kategori",
            }}
          />
        ) : (
          <div className="space-y-3">
            {pendingJobs.map((job) => {
              const comp = job.company;
              const cityName = comp?.city?.name;
              const provinceName = comp?.city?.province?.name;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs hover:shadow-card transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-black">
                        {job.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                        {t("Pending", "Pending")}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                      <span>{comp?.name || t("Perusahaan Mitra", "Partner Company")}</span>
                      <span>•</span>
                      <span>
                        {job.work_mode === "remote"
                          ? t("Remote", "Remote")
                          : cityName && provinceName
                          ? `${cityName}, ${provinceName}`
                          : cityName || t("Lokasi Ditentukan", "Location Specified")}
                      </span>
                      <span>•</span>
                      <span>
                        {t(
                          JOB_TYPE_LABEL[job.job_type as JobType] || job.job_type
                        )}
                      </span>
                      <span>•</span>
                      <span>{t(WORK_MODE_LABEL[job.work_mode as WorkMode] || job.work_mode)}</span>
                      <span>•</span>
                      <span>{formatDateIndo(job.created_at)}</span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/lowongan?status=pending`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition shadow-2xs shrink-0 self-start sm:self-auto min-h-[40px]"
                  >
                    <span>{t("Tinjau Lowongan", "Review Vacancy")}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Akses Cepat Alat Kurasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/kategori"
          className="bg-white rounded-2xl p-5 border border-black/[0.08] shadow-2xs hover:shadow-card transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0 group-hover:bg-[#FFDD00] transition">
              <FolderTree className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-bold text-sm text-black block">
                {t("Kelola Kategori Industri", "Manage Industry Categories")}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t(
                  "Tambah, ubah, atau susun taksonomi bidang profesi.",
                  "Add, edit, or organize job profession taxonomy."
                )}
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-black group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          href="/admin/perusahaan"
          className="bg-white rounded-2xl p-5 border border-black/[0.08] shadow-2xs hover:shadow-card transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0 group-hover:bg-[#FFDD00] transition">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-bold text-sm text-black block">
                {t("Manajemen Perusahaan Mitra", "Partner Companies Management")}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {t(
                  "Periksa profil perusahaan, kontak penanggung jawab, dan kelengkapan identitas institusi.",
                  "Inspect company profiles, contact persons, and institutional credentials."
                )}
              </span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-black group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
}

