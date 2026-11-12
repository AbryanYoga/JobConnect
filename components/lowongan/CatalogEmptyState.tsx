"use client";

import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface CatalogEmptyStateProps {
  provinceName?: string;
  cityName?: string;
}

export function CatalogEmptyState({ provinceName, cityName }: CatalogEmptyStateProps) {
  const { t, language } = useLanguage();

  const isLocationFiltered = Boolean(provinceName || cityName);
  const locationLabel = [cityName, provinceName].filter(Boolean).join(", ");

  return (
    <div className="rounded-[28px] border border-dashed border-black/15 p-8 sm:p-12 text-center bg-white shadow-2xs space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center mx-auto text-slate-400">
        {isLocationFiltered ? (
          <MapPin className="w-7 h-7 text-slate-500" aria-hidden="true" />
        ) : (
          <Briefcase className="w-7 h-7 text-slate-500" aria-hidden="true" />
        )}
      </div>

      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-lg sm:text-xl font-bold text-black">
          {isLocationFiltered
            ? language === "en"
              ? `No Job Vacancies in ${locationLabel}`
              : `Belum Ada Lowongan di ${locationLabel}`
            : t("Tidak ada lowongan yang cocok", "No matching jobs found")}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
          {isLocationFiltered
            ? language === "en"
              ? `Currently there are no active job vacancies in ${locationLabel}. Try removing the location filter or explore jobs across other regions in Indonesia.`
              : `Saat ini belum ada lowongan pekerjaan aktif yang terdaftar di wilayah ${locationLabel}. Silakan hapus filter wilayah atau jelajahi lowongan di wilayah lain di Indonesia.`
            : t(
                "Tidak ditemukan lowongan pekerjaan aktif dengan kriteria pencarian yang Anda masukkan.",
                "No active job vacancies were found matching your search criteria."
              )}
        </p>
      </div>

      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/lowongan"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-black text-white text-xs sm:text-sm font-bold hover:bg-black/80 transition-all min-h-[44px] shadow-2xs cursor-pointer"
        >
          {isLocationFiltered ? t("Jelajahi Seluruh Wilayah", "Explore All Regions") : t("Hapus Semua Filter", "Clear All Filters")}
        </Link>
        {isLocationFiltered && (
          <Link
            href="/wilayah"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold transition-all min-h-[44px] cursor-pointer"
          >
            {t("Lihat Daftar 38 Wilayah", "View All 38 Regions")}
          </Link>
        )}
      </div>
    </div>
  );
}
