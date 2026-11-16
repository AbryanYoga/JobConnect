"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Globe, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export interface ProvinceWithCount {
  id: number;
  name: string;
  slug: string;
  jobCount: number;
}

interface ProvinceIndexViewProps {
  provinces: ProvinceWithCount[];
  remoteCount: number;
  totalOpenJobs: number;
}

export function ProvinceIndexView({
  provinces,
  remoteCount,
  totalOpenJobs,
}: ProvinceIndexViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active">("all");
  const { t, language } = useLanguage();

  const filteredProvinces = useMemo(() => {
    let result = provinces;

    if (filterMode === "active") {
      result = result.filter((p) => p.jobCount > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    return result;
  }, [provinces, filterMode, searchQuery]);

  const activeProvincesCount = useMemo(() => {
    return provinces.filter((p) => p.jobCount > 0).length;
  }, [provinces]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header Halaman */}
      <div className="space-y-3 pb-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDD00] text-black border border-black/10 text-xs font-bold shadow-2xs">
          <MapPin className="w-3.5 h-3.5 text-black" aria-hidden="true" />
          <span>{t("Jelajah 38 Provinsi Nusantara", "Explore 38 Provinces of Indonesia")}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
          {t("Jelajah Lowongan Berdasarkan Wilayah", "Explore Jobs by Region")}
        </h1>
        <p className="text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed font-medium">
          {language === "en"
            ? `Find official job vacancies spread across 38 provinces in Indonesia and remote options. There are ${totalOpenJobs} active vacancies in ${activeProvincesCount} provinces.`
            : `Temukan lowongan kerja resmi yang tersebar di 38 provinsi di Indonesia serta opsi kerja jarak jauh (remote). Terdapat ${totalOpenJobs} lowongan aktif di ${activeProvincesCount} provinsi.`}
        </p>
      </div>

      {/* Kartu Khusus Lowongan Remote (Gaya Buy Me a Coffee) */}
      <div className="rounded-[28px] sm:rounded-[36px] bg-[#222222] text-white p-6 sm:p-8 shadow-card border border-black/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFDD00] text-black flex items-center justify-center shrink-0 shadow-md">
            <Globe className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {t("Kerja Remote (Bebas Lokasi)", "Remote Work (Location Free)")}
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-[#FFDD00] border border-white/15">
                {remoteCount > 0
                  ? (language === "en" ? `${remoteCount} active vacancies` : `${remoteCount} lowongan aktif`)
                  : t("Belum ada lowongan", "No vacancies yet")}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              {t(
                "Peluang karier yang dapat dikerjakan dari mana saja tanpa batasan domisili atau kewajiban hadir di kantor fisik.",
                "Career opportunities that can be done from anywhere without domicile restrictions or physical office requirements."
              )}
            </p>
          </div>
        </div>

        <Link
          href="/wilayah/remote"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] active:scale-95 text-black font-bold text-xs sm:text-sm transition-all shadow-md shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFDD00]"
        >
          {t("Lihat Lowongan Remote", "View Remote Jobs")}
        </Link>
      </div>

      {/* Bar Pencarian & Filter Provinsi */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Input Pencarian Nama Provinsi */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("Cari nama provinsi (misal: Jawa, Bali, Papua)...", "Search province (e.g. Java, Bali, Papua)...")}
            className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-black/[0.08] rounded-full focus:outline-none focus:border-black focus:ring-2 focus:ring-black/5 shadow-2xs min-h-[44px] font-medium"
            aria-label={t("Cari nama provinsi", "Search province name")}
          />
        </div>

        {/* Filter Tombol Pil */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0 w-full sm:w-auto" role="group" aria-label={t("Filter status lowongan", "Job status filter")}>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all min-h-[44px] border text-center justify-center inline-flex items-center ${
              filterMode === "all"
                ? "bg-black text-white border-black shadow-2xs"
                : "bg-white text-slate-700 border-black/[0.08] hover:bg-black/5"
            }`}
          >
            {t("Semua", "All")} ({provinces.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("active")}
            className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all min-h-[44px] border text-center justify-center inline-flex items-center ${
              filterMode === "active"
                ? "bg-black text-white border-black shadow-2xs"
                : "bg-white text-slate-700 border-black/[0.08] hover:bg-black/5"
            }`}
          >
            {t("Ada Lowongan", "Has Vacancies")} ({activeProvincesCount})
          </button>
        </div>
      </div>

      {/* Grid 38 Provinsi */}
      {filteredProvinces.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-black/15 p-8 sm:p-12 text-center bg-white shadow-2xs">
          <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden="true" />
          <h3 className="text-base font-bold text-black">
            {t("Provinsi tidak ditemukan", "Province not found")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === "en"
              ? `No provinces found matching "${searchQuery}".`
              : `Tidak ada provinsi yang cocok dengan kata kunci "${searchQuery}".`}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterMode("all");
            }}
            className="mt-4 px-5 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-black/80 transition-all min-h-[44px] inline-flex items-center"
          >
            {t("Reset Pencarian", "Reset Search")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
          {filteredProvinces.map((province) => {
            const hasJobs = province.jobCount > 0;

            return (
              <Link
                key={province.id}
                href={`/wilayah/${province.slug}`}
                className={`p-4 sm:p-5 rounded-[22px] border transition-all duration-200 flex items-center justify-between gap-3 min-h-[68px] group focus-visible:outline-2 focus-visible:outline-black ${
                  hasJobs
                    ? "bg-white border-black/[0.08] hover:border-black/20 hover:shadow-card hover:-translate-y-1 shadow-2xs"
                    : "bg-white/60 border-black/[0.04] hover:border-black/10 opacity-70"
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <h3
                    className={`text-sm font-bold truncate transition-colors ${
                      hasJobs
                        ? "text-black group-hover:text-black"
                        : "text-slate-600"
                    }`}
                  >
                    {province.name}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        hasJobs
                          ? "bg-[#FAF8F0] text-black border border-black/[0.08]"
                          : "text-slate-400"
                      }`}
                    >
                      {hasJobs
                        ? `${province.jobCount} ${t("lowongan", "vacancies")}`
                        : `0 ${t("lowongan", "vacancies")}`}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-1 ${
                    hasJobs ? "bg-[#FAF8F0] text-black group-hover:bg-[#FFDD00]" : "text-slate-300"
                  }`}
                  aria-hidden="true"
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
