"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  LayoutList,
  Columns3,
  Calendar,
  ChevronRight,
  Mail,
  Phone,
  ArrowUpDown,
  FolderGit2,
  ArrowRight,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/LinkedinIcon";
import { StatusBadge, type ApplicationStatus } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CopyJobLinkButton } from "@/components/mitra/CopyJobLinkButton";
import { updateApplicationStatusAction } from "@/app/actions/mitra";
import {
  calculateAge,
  EDUCATION_LEVEL_OPTIONS,
  type PortfolioItem,
} from "@/lib/validation/profil";

export type AppItem = {
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
};

interface MitraPelamarViewSwitcherProps {
  initialApplications: AppItem[];
  job: {
    id: number;
    title: string;
    slug: string;
    companyName: string;
  };
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

const KANBAN_STAGES: { status: ApplicationStatus; label: string; bgClass: string; badgeClass: string }[] = [
  { status: "dikirim", label: "Masuk Baru", bgClass: "bg-slate-50/70 border-slate-200", badgeClass: "bg-slate-200 text-slate-800" },
  { status: "ditinjau", label: "Ditinjau", bgClass: "bg-amber-50/50 border-amber-200", badgeClass: "bg-amber-100 text-amber-900" },
  { status: "shortlist", label: "Shortlist", bgClass: "bg-purple-50/50 border-purple-200", badgeClass: "bg-purple-100 text-purple-900" },
  { status: "wawancara", label: "Wawancara", bgClass: "bg-blue-50/50 border-blue-200", badgeClass: "bg-blue-100 text-blue-900" },
  { status: "ditawari", label: "Offering", bgClass: "bg-emerald-50/50 border-emerald-200", badgeClass: "bg-emerald-100 text-emerald-900" },
  { status: "diterima", label: "Diterima", bgClass: "bg-green-50/60 border-green-200", badgeClass: "bg-green-100 text-green-950" },
  { status: "ditolak", label: "Ditolak", bgClass: "bg-red-50/40 border-red-200", badgeClass: "bg-red-100 text-red-900" },
];

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

export function MitraPelamarViewSwitcher({
  initialApplications,
  job,
}: MitraPelamarViewSwitcherProps) {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [applications, setApplications] = useState<AppItem[]>(initialApplications);
  const [activeTab, setActiveTab] = useState<string>("semua");
  const [activeSort, setActiveSort] = useState<string>("terbaru");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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

  // Handler update status cepat (untuk Kanban & List)
  const handleQuickStatusChange = async (appId: number, newStatus: ApplicationStatus) => {
    setUpdatingId(appId);
    // Optimistic update
    setApplications((prev) =>
      prev.map((item) => (item.id === appId ? { ...item, status: newStatus } : item))
    );

    try {
      await updateApplicationStatusAction({
        applicationId: appId,
        toStatus: newStatus,
      });
    } catch {
      // Revert if error
      setApplications(initialApplications);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter daftar pelamar sesuai status tab
  let filteredApplications = [...applications];
  if (activeTab !== "semua") {
    filteredApplications = filteredApplications.filter((app) => app.status === activeTab);
  }

  // Pengurutan daftar pelamar
  filteredApplications.sort((a, b) => {
    if (activeSort === "nama_asc") {
      const nameA = a.profiles?.name?.toLowerCase() || "";
      const nameB = b.profiles?.name?.toLowerCase() || "";
      return nameA.localeCompare(nameB);
    }
    if (activeSort === "nama_desc") {
      const nameA = a.profiles?.name?.toLowerCase() || "";
      const nameB = b.profiles?.name?.toLowerCase() || "";
      return nameB.localeCompare(nameA);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Pengalih Mode Tampilan (Daftar vs Papan Kanban ATS) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white rounded-3xl border border-black/[0.08] p-4 sm:p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700">Tampilan Seleksi:</span>
          <div className="inline-flex rounded-full bg-[#FAF8F0] p-1 border border-black/[0.06]">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition min-h-[38px] cursor-pointer ${
                viewMode === "list"
                  ? "bg-black text-[#FFDD00] shadow-2xs"
                  : "text-slate-600 hover:text-black"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Daftar Rinci</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black transition min-h-[38px] cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-black text-[#FFDD00] shadow-2xs"
                  : "text-slate-600 hover:text-black"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Papan Kanban ATS</span>
            </button>
          </div>
        </div>

        <div className="text-xs sm:text-sm font-bold text-slate-700 self-start sm:self-center">
          Total Terdaftar: <span className="text-black font-black">{applications.length}</span> kandidat
        </div>
      </div>

      {/* ========================================================
          MODE 1: PAPAN KANBAN ATS (DRAG / QUICK STAGE PIPELINE)
          ======================================================== */}
      {viewMode === "kanban" ? (
        <div className="space-y-4">
          <div className="overflow-x-auto pb-6 scrollbar-thin">
            <div className="flex items-start gap-4 min-w-[1300px]">
              {KANBAN_STAGES.map((col) => {
                const colApplications = applications.filter((app) => app.status === col.status);

                return (
                  <div
                    key={col.status}
                    className={`w-80 rounded-3xl border p-4 shadow-2xs space-y-3 shrink-0 ${col.bgClass}`}
                  >
                    {/* Header Kolom Tahapan */}
                    <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-navy-950 uppercase tracking-wider">
                          {col.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${col.badgeClass}`}>
                          {colApplications.length}
                        </span>
                      </div>
                    </div>

                    {/* Daftar Kartu Pelamar di Kolom Ini */}
                    <div className="space-y-3 min-h-[300px]">
                      {colApplications.length === 0 ? (
                        <div className="p-6 rounded-2xl border border-dashed border-black/10 text-center text-xs text-slate-400 font-medium">
                          Belum ada kandidat di tahap ini
                        </div>
                      ) : (
                        colApplications.map((app) => {
                          const profile = app.profiles;
                          const applicantName = profile?.name || "Kandidat Pelamar";
                          const headline = profile?.headline || "Pencari Kerja";
                          const initials = getInitials(applicantName);
                          const age = calculateAge(profile?.birth_date);
                          const isUpdating = updatingId === app.id;

                          return (
                            <div
                              key={app.id}
                              className={`bg-white rounded-2xl border border-black/[0.08] p-4 shadow-card space-y-3 transition hover:shadow-card-md ${
                                isUpdating ? "opacity-50 pointer-events-none" : ""
                              }`}
                            >
                              {/* Profil Header Kartu */}
                              <div className="flex items-start gap-3">
                                {profile?.avatar_url ? (
                                  <Image
                                    src={profile.avatar_url}
                                    alt={`Foto ${applicantName}`}
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 rounded-xl object-cover shrink-0 border border-black/10"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F0] border border-black/[0.08] text-black font-black text-xs flex items-center justify-center shrink-0">
                                    {initials}
                                  </div>
                                )}
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <Link
                                    href={`/mitra/pelamar/${app.id}`}
                                    className="text-xs sm:text-sm font-black text-black hover:text-blue-700 transition line-clamp-1"
                                  >
                                    {applicantName}
                                  </Link>
                                  <p className="text-[11px] text-slate-500 font-medium line-clamp-1">
                                    {headline}
                                  </p>
                                  {age !== null && (
                                    <span className="inline-block text-[10px] text-slate-600 font-bold">
                                      Usia {age} tahun
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Pengubah Tahap Status Cepat */}
                              <div className="pt-2 border-t border-black/[0.06] space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                  Pindahkan Status:
                                </label>
                                <select
                                  value={app.status}
                                  onChange={(e) =>
                                    handleQuickStatusChange(app.id, e.target.value as ApplicationStatus)
                                  }
                                  className="w-full text-xs font-bold rounded-xl bg-[#FAF8F0] border border-black/10 px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-black cursor-pointer"
                                >
                                  <option value="dikirim">Masuk Baru</option>
                                  <option value="ditinjau">Ditinjau</option>
                                  <option value="shortlist">Shortlist</option>
                                  <option value="wawancara">Wawancara</option>
                                  <option value="ditawari">Offering</option>
                                  <option value="diterima">Diterima</option>
                                  <option value="ditolak">Ditolak</option>
                                </select>
                              </div>

                              {/* Tautan Cepat Tinjau Detail */}
                              <div className="pt-1 flex items-center justify-between text-xs">
                                <Link
                                  href={`/mitra/pelamar/${app.id}`}
                                  className="inline-flex items-center gap-1 font-black text-black hover:underline"
                                >
                                  <span>Tinjau Detail</span>
                                  <ArrowRight className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
                                </Link>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================
            MODE 2: TAMPILAN DAFTAR RINCI (LIST VIEW)
            ======================================================== */
        <div className="space-y-6">
          {/* Tab Filter Status Pelamar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              const count = statusCounts[tab.value] ?? 0;

              return (
                <button
                  type="button"
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition min-h-[44px] cursor-pointer ${
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
                </button>
              );
            })}
          </div>

          {/* Bilah Ringkasan dan Pengurutan Pelamar */}
          <div className="bg-white rounded-3xl border border-black/[0.08] p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs sm:text-sm font-bold text-slate-700">
              Menampilkan <span className="text-black font-black">{filteredApplications.length}</span> pelamar
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span>Urutkan:</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: "Terbaru", value: "terbaru" },
                  { label: "Nama (A-Z)", value: "nama_asc" },
                  { label: "Nama (Z-A)", value: "nama_desc" },
                ].map((sortOpt) => {
                  const isActive = activeSort === sortOpt.value;

                  return (
                    <button
                      type="button"
                      key={sortOpt.value}
                      onClick={() => setActiveSort(sortOpt.value)}
                      className={`px-3 py-2 rounded-full text-xs font-bold transition min-h-[40px] inline-flex items-center cursor-pointer ${
                        isActive
                          ? "bg-black text-[#FFDD00] shadow-2xs"
                          : "bg-[#FAF8F0] text-slate-700 hover:text-black border border-black/[0.06]"
                      }`}
                    >
                      {sortOpt.label}
                    </button>
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
                  Tidak ditemukan pelamar dengan status yang Anda pilih.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("semua")}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-black text-white font-bold text-xs transition min-h-[44px] cursor-pointer"
                >
                  Reset Semua Filter
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const profile = app.profiles;
                const applicantName = profile?.name || "Kandidat Pelamar";
                const headline = profile?.headline || "Pencari Kerja JobConnect";
                const initials = getInitials(applicantName);
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

                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.06] text-slate-600 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                          <span>{formatDateIndo(app.created_at)}</span>
                        </span>
                      </div>
                    </div>

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
      )}
    </div>
  );
}
