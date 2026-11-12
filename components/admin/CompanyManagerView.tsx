"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  Globe,
  Mail,
  Phone,
  User,
  ExternalLink,
  Briefcase,
  AlertCircle,
  Clock,
  ShieldCheck,
  Calendar,
  X,
} from "lucide-react";
import { FreezeCompanyModal } from "@/components/admin/FreezeCompanyModal";
import { getCompanyLogo, getCompanyInitials } from "@/lib/company-logo";
import { useLanguage } from "@/lib/i18n";

export interface CompanyItem {
  id: number;
  name: string;
  slug: string;
  logo_path: string | null;
  website: string | null;
  industry: string | null;
  size: string | null;
  address_note: string | null;
  created_at: string;
  cities: {
    id: number;
    name: string;
    provinces: {
      id: number;
      name: string;
    } | null;
  } | null;
  profiles: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
  jobs: {
    id: number;
    status: string;
  }[];
}

interface CompanyManagerViewProps {
  companies: CompanyItem[];
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

export function CompanyManagerView({ companies }: CompanyManagerViewProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusTab, setStatusTab] = useState<"semua" | "aktif" | "pending" | "tanpa_lowongan">("semua");

  const totalCount = companies.length;
  const activeCount = companies.filter((c) =>
    (c.jobs || []).some((j) => j.status === "open")
  ).length;
  const pendingCount = companies.filter((c) =>
    (c.jobs || []).some((j) => j.status === "pending")
  ).length;
  const noJobsCount = companies.filter(
    (c) => !(c.jobs || []).some((j) => j.status === "open" || j.status === "pending")
  ).length;

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      // 1. Status filter
      if (statusTab === "aktif") {
        const hasOpen = (company.jobs || []).some((j) => j.status === "open");
        if (!hasOpen) return false;
      } else if (statusTab === "pending") {
        const hasPending = (company.jobs || []).some((j) => j.status === "pending");
        if (!hasPending) return false;
      } else if (statusTab === "tanpa_lowongan") {
        const hasActiveOrPending = (company.jobs || []).some(
          (j) => j.status === "open" || j.status === "pending"
        );
        if (hasActiveOrPending) return false;
      }

      // 2. Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = company.name?.toLowerCase().includes(q);
        const industryMatch = company.industry?.toLowerCase().includes(q);
        const cityName = company.cities?.name?.toLowerCase() || "";
        const cityMatch = cityName.includes(q);
        const ownerEmail = company.profiles?.email?.toLowerCase() || "";
        const ownerName = company.profiles?.name?.toLowerCase() || "";
        const ownerMatch = ownerEmail.includes(q) || ownerName.includes(q);

        return nameMatch || industryMatch || cityMatch || ownerMatch;
      }

      return true;
    });
  }, [companies, statusTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-[#FFDD00] text-xs font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("Moderasi Entitas", "Entity Moderation")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {t("Perusahaan Mitra Terdaftar", "Registered Partner Companies")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            {t(
              "Pantau profil instansi, verifikasi kontak penanggung jawab HR, dan kelola status lowongan untuk mencegah penipuan atau lowongan fiktif.",
              "Monitor entity profiles, verify HR contacts, and manage vacancy status to prevent fraud or fake listings."
            )}
          </p>
        </div>

        <Link
          href="/admin/lowongan"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-black/[0.08] transition shadow-2xs self-start sm:self-auto min-h-[44px]"
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>{t("Buka Antrean Review Lowongan", "Open Job Review Queue")}</span>
        </Link>
      </div>

      {/* 4 Kartu Metrik Ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.08] shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t("Total Mitra", "Total Partners")}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-black block">
            {totalCount}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">
            {t("Perusahaan terdaftar", "Registered companies")}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.08] shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t("Mitra Aktif", "Active Partners")}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 block">
            {activeCount}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">
            {t("Memiliki lowongan tayang", "Has active vacancies")}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.08] shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t("Ada Antrean Review", "Pending Review")}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 block">
            {pendingCount}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">
            {t("Menunggu verifikasi admin", "Awaiting admin verification")}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-black/[0.08] shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t("Tanpa Lowongan", "No Vacancies")}
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-600 block">
            {noJobsCount}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block">
            {t("Belum atau selesai rekrutmen", "No active recruitment")}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Kolom Pencarian */}
      <div className="bg-white rounded-2xl border border-black/[0.08] shadow-2xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs Filter Status */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              {
                key: "semua" as const,
                labelId: "Semua Mitra",
                labelEn: "All Partners",
                count: totalCount,
              },
              {
                key: "aktif" as const,
                labelId: "Lowongan Aktif",
                labelEn: "Active Vacancies",
                count: activeCount,
              },
              {
                key: "pending" as const,
                labelId: "Ada Antrean",
                labelEn: "Pending Queue",
                count: pendingCount,
              },
              {
                key: "tanpa_lowongan" as const,
                labelId: "Tanpa Lowongan",
                labelEn: "No Vacancies",
                count: noJobsCount,
              },
            ].map((tab) => {
              const isActive = statusTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition min-h-[40px] cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-[#FAF8F0] hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <span>{t(tab.labelId, tab.labelEn)}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-black/[0.06] text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Input Pencarian */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Cari perusahaan, HR, kota...", "Search company, HR, city...")}
              className="w-full pl-9.5 pr-8 py-2 rounded-xl border border-black/[0.12] text-xs sm:text-sm font-medium text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[40px]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-black"
                aria-label={t("Hapus kata kunci pencarian", "Clear search query")}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Daftar Perusahaan Mitra */}
      {filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-black/[0.08] p-10 text-center space-y-3">
          <h3 className="text-base font-bold text-black">
            {t("Tidak Ada Perusahaan Mitra Ditemukan", "No Partner Companies Found")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? t(
                  `Tidak ditemukan perusahaan mitra dengan kata kunci "${searchQuery}".`,
                  `No partner companies found matching "${searchQuery}".`
                )
              : t("Belum ada data perusahaan mitra untuk filter ini.", "No partner companies for this filter.")}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusTab("semua");
            }}
            className="px-4 py-2 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-black transition min-h-[40px] cursor-pointer"
          >
            {t("Reset Filter", "Reset Filters")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCompanies.map((company) => {
            const logoSrc = getCompanyLogo(company.name);
            const initials = getCompanyInitials(company.name);

            const cityName = company.cities?.name || "";
            const provinceName = company.cities?.provinces?.name || "";

            const jobsList = company.jobs || [];
            const openJobsCount = jobsList.filter((j) => j.status === "open").length;
            const pendingJobsCount = jobsList.filter((j) => j.status === "pending").length;
            const removedJobsCount = jobsList.filter((j) => j.status === "removed" || j.status === "rejected").length;
            const totalActiveAndPending = openJobsCount + pendingJobsCount;

            return (
              <div
                key={company.id}
                className="bg-white rounded-2xl border border-black/[0.08] shadow-2xs hover:shadow-card transition p-5 sm:p-6 space-y-4"
              >
                {/* Baris Atas: Profil Perusahaan & Status Lowongan */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Logo Perusahaan */}
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
                      {logoSrc ? (
                        <Image
                          src={logoSrc}
                          alt={company.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="font-black text-sm text-[#0D0C23]">
                          {initials}
                        </span>
                      )}
                    </div>

                    {/* Informasi Utama */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base sm:text-lg font-black text-black">
                          {company.name}
                        </h2>
                        {company.industry && (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                            {company.industry}
                          </span>
                        )}
                        {company.size && (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {company.size}
                          </span>
                        )}
                      </div>

                      {/* Lokasi & Website */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                        {(cityName || provinceName) && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {cityName && provinceName
                                ? `${cityName}, ${provinceName}`
                                : cityName || provinceName}
                            </span>
                          </span>
                        )}

                        {company.website && (
                          <a
                            href={
                              company.website.startsWith("http")
                                ? company.website
                                : `https://${company.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-navy-700 hover:text-black font-semibold underline underline-offset-2"
                          >
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate max-w-[200px]">
                              {company.website.replace(/^https?:\/\//, "")}
                            </span>
                          </a>
                        )}

                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{t("Bergabung", "Joined")}: {formatDateIndo(company.created_at)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ringkasan Chip Status Lowongan */}
                  <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                    {openJobsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        <Briefcase className="w-3 h-3 text-emerald-600" />
                        <span>{openJobsCount} {t("Lowongan Aktif", "Active Vacancies")}</span>
                      </span>
                    )}

                    {pendingJobsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{pendingJobsCount} {t("Antrean Review", "Review Queue")}</span>
                      </span>
                    )}

                    {removedJobsCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        <span>{removedJobsCount} {t("Takedown/Ditolak", "Taken Down/Rejected")}</span>
                      </span>
                    )}

                    {jobsList.length === 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                        {t("Belum Pernah Memasang Lowongan", "No Vacancies Posted Yet")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Baris Tengah: Kontak Penanggung Jawab Akun HR */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F0] border border-black/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block">
                      {t("Kontak Penanggung Jawab:", "Contact Person:")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-black font-bold">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{company.profiles?.name || t("Nama Belum Diatur", "Name Not Set")}</span>
                    </span>
                    {company.profiles?.email && (
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{company.profiles.email}</span>
                      </span>
                    )}
                    {company.profiles?.phone && (
                      <span className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{company.profiles.phone}</span>
                      </span>
                    )}
                  </div>

                  {company.address_note && (
                    <span className="text-[11px] text-slate-500 italic max-w-sm truncate">
                      {t("Alamat", "Address")}: {company.address_note}
                    </span>
                  )}
                </div>

                {/* Baris Bawah: Aksi Cepat Admin */}
                <div className="pt-2 border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/perusahaan/${company.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full hover:bg-black/[0.05] text-slate-700 hover:text-black text-xs font-bold border border-black/[0.08] transition min-h-[40px]"
                    >
                      <span>{t("Lihat Profil Publik", "View Public Profile")}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </Link>

                    <Link
                      href={`/admin/lowongan?q=${encodeURIComponent(company.name)}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full hover:bg-slate-100 text-slate-800 text-xs font-bold border border-black/[0.08] transition min-h-[40px]"
                    >
                      <Briefcase className="w-3 h-3 text-slate-500" />
                      <span>
                        {t("Lihat Riwayat Lowongan", "View Job History")} ({jobsList.length})
                      </span>
                    </Link>
                  </div>

                  {/* Tombol Bekukan Seluruh Lowongan jika terindikasi bodong */}
                  {totalActiveAndPending > 0 ? (
                    <FreezeCompanyModal
                      companyId={company.id}
                      companyName={company.name}
                      activeJobsCount={totalActiveAndPending}
                    />
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium italic">
                      {t(
                        "Tidak ada lowongan aktif yang perlu dibekukan",
                        "No active vacancies need to be frozen"
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
