"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  Calendar,
  ArrowRight,
  Clock,
  Video,
  Search,
} from "lucide-react";
import {
  StatusBadge,
  type ApplicationStatus,
} from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  type JobType,
  type WorkMode,
} from "@/lib/labels";
import { getCompanyLogo, getCompanyInitials } from "@/lib/company-logo";
import { useLanguage } from "@/lib/i18n";

function formatDateWithLocale(dateStr: string, locale: string = "id-ID"): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatDateTimeWithLocale(dateStr: string, locale: string = "id-ID"): string {
  try {
    return new Intl.DateTimeFormat(locale, {
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

export interface ApplicationItem {
  id: number;
  job_id: number;
  status: string;
  ai_consent?: boolean;
  message_to_applicant: string | null;
  interview_at: string | null;
  interview_place: string | null;
  created_at: string;
  updated_at: string;
  logoUrl: string | null;
  aiStatus?: string | null;
  job: {
    id: number;
    title: string;
    slug: string;
    job_type: string;
    work_mode: string;
    company: {
      id: number;
      name: string;
      slug: string;
      logo_path: string | null;
      city?: {
        name: string;
        province?: {
          name: string;
        };
      };
    };
  };
}

interface LamaranListWithTabsProps {
  applications: ApplicationItem[];
}

type TabKey = "semua" | "menunggu" | "seleksi" | "selesai";

export function LamaranListWithTabs({ applications }: LamaranListWithTabsProps) {
  const { language, t } = useLanguage();
  const locale = language === "en" ? "en-US" : "id-ID";
  const [activeTab, setActiveTab] = useState<TabKey>("semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Kategori tab status
  const counts = useMemo(() => {
    return {
      semua: applications.length,
      menunggu: applications.filter((a) =>
        ["dikirim", "ditinjau"].includes(a.status)
      ).length,
      seleksi: applications.filter((a) =>
        ["shortlist", "wawancara", "penawaran"].includes(a.status)
      ).length,
      selesai: applications.filter((a) =>
        ["diterima", "ditolak", "ditarik"].includes(a.status)
      ).length,
    };
  }, [applications]);

  // Filter lamaran berdasarkan tab aktif dan pencarian
  const filteredApplications = useMemo(() => {
    let result = applications;

    if (activeTab === "menunggu") {
      result = result.filter((a) => ["dikirim", "ditinjau"].includes(a.status));
    } else if (activeTab === "seleksi") {
      result = result.filter((a) =>
        ["shortlist", "wawancara", "penawaran"].includes(a.status)
      );
    } else if (activeTab === "selesai") {
      result = result.filter((a) =>
        ["diterima", "ditolak", "ditarik"].includes(a.status)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.job.title.toLowerCase().includes(q) ||
          a.job.company.name.toLowerCase().includes(q)
      );
    }

    return result;
  }, [applications, activeTab, searchQuery]);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "semua", label: t("Semua", "All"), count: counts.semua },
    { key: "menunggu", label: t("Menunggu Konfirmasi", "Awaiting Confirmation"), count: counts.menunggu },
    { key: "seleksi", label: t("Tahap Seleksi", "Selection Stage"), count: counts.seleksi },
    { key: "selesai", label: t("Selesai", "Completed"), count: counts.selesai },
  ];

  return (
    <div className="space-y-6">
      {/* Baris Tab Filter Status & Pencarian */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-[24px] border border-black/[0.08] shadow-2xs">
        {/* Navigasi Tab Status */}
        <div
          role="tablist"
          aria-label={t("Filter status lamaran", "Application status filter")}
          className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap min-h-[40px] cursor-pointer ${
                  isActive
                    ? "bg-[#FFDD00] text-black border border-black/10 shadow-2xs font-black"
                    : "text-slate-600 hover:text-black hover:bg-black/[0.04]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                    isActive
                      ? "bg-white text-black border border-black/10"
                      : "bg-black/[0.06] text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Input Pencarian Cepat di Dalam Lamaran */}
        {applications.length > 3 && (
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              placeholder={t("Cari lowongan atau perusahaan...", "Search jobs or companies...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-full bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white focus:outline-none transition-all"
            />
          </div>
        )}
      </div>

      {/* Konten Daftar Lamaran */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-[28px] border border-black/[0.08] p-8 sm:p-12 text-center shadow-card">
          <EmptyState
            title={
              activeTab === "menunggu"
                ? t("Tidak ada lamaran yang menunggu konfirmasi.", "No applications awaiting confirmation.")
                : activeTab === "seleksi"
                ? t("Belum ada lamaran dalam tahap seleksi atau wawancara.", "No applications in selection or interview stage.")
                : activeTab === "selesai"
                ? t("Belum ada riwayat lamaran yang selesai.", "No completed application history.")
                : t("Tidak ada lamaran yang cocok.", "No matching applications.")
            }
            description={
              activeTab === "menunggu"
                ? t("Lamaran yang baru dikirim atau sedang ditinjau HRD akan muncul di tab ini.", "Applications recently submitted or under HR review will appear here.")
                : activeTab === "seleksi"
                ? t("Undangan wawancara dan tahapan seleksi lanjutan dari perusahaan mitra akan tertera di sini.", "Interview invites and advanced selection stages will appear here.")
                : t("Semua lamaran yang diterima, ditolak, atau ditarik akan dicatat di bagian ini.", "All accepted, rejected, or withdrawn applications will be recorded here.")
            }
            action={
              activeTab !== "semua"
                ? {
                    label: t("Lihat Semua Lamaran", "View All Applications"),
                    href: "#",
                    onClick: () => setActiveTab("semua"),
                  }
                : {
                    label: t("Cari Lowongan Pekerjaan", "Search Job Vacancies"),
                    href: "/lowongan",
                  }
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const companyName = app.job.company.name || "Perusahaan Mitra";
            const companyInitials = getCompanyInitials(companyName);
            const jobTitle = app.job.title;
            const locationText =
              [app.job.company.city?.name, app.job.company.city?.province?.name]
                .filter(Boolean)
                .join(", ") ||
              (app.job.work_mode === "remote" ? "Kerja Remote" : "Indonesia");

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
                      {app.logoUrl || getCompanyLogo(companyName) ? (
                        <Image
                          src={app.logoUrl || getCompanyLogo(companyName)!}
                          alt={`Logo ${companyName}`}
                          width={56}
                          height={56}
                          className="w-full h-full object-contain p-1"
                          unoptimized
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
                        {app.job.job_type && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                            {t(JOB_TYPE_LABEL[app.job.job_type as JobType] || app.job.job_type)}
                          </span>
                        )}
                        {app.job.work_mode && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                            {t(WORK_MODE_LABEL[app.job.work_mode as WorkMode] || app.job.work_mode)}
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
                          <span>{t("Dilamar", "Applied")} {formatDateWithLocale(app.created_at, locale)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="self-start sm:self-center shrink-0 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <StatusBadge status={app.status as ApplicationStatus} />
                  </div>
                </div>

                {/* Keterangan Tambahan untuk Status Wawancara */}
                {app.status === "wawancara" && app.interview_at && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-900 font-medium">
                    <Video className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <div>
                      <span className="font-bold">{t("Undangan Wawancara:", "Interview Invitation:")} </span>
                      <span>{formatDateTimeWithLocale(app.interview_at, locale)}</span>
                      {app.interview_place && (
                        <span className="block mt-0.5 text-blue-800">
                          {t("Lokasi/Tautan:", "Location/Link:")} {app.interview_place}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Catatan Pesan Penolakan jika Ditolak */}
                {app.status === "ditolak" && app.message_to_applicant && (
                  <div className="p-3.5 rounded-2xl bg-red-50/80 border border-red-200/80 text-xs text-red-900 font-medium">
                    <span className="font-bold">{t("Pesan dari Perusahaan:", "Message from Company:")} </span>
                    <span>{app.message_to_applicant}</span>
                  </div>
                )}

                {/* Footer Kartu & Aksi */}
                <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t("Terakhir diperbarui", "Last updated")} {formatDateWithLocale(app.updated_at || app.created_at, locale)}</span>
                  </span>
                  <Link
                    href={`/lamaran-saya/${app.id}`}
                    className="inline-flex items-center gap-1.5 font-bold text-black hover:text-blue-700 transition min-h-[44px]"
                  >
                    <span>{t("Lihat Detail & Timeline", "View Details & Timeline")}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

