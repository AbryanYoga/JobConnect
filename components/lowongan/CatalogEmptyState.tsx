"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function CatalogEmptyState() {
  const { t } = useLanguage();

  return (
    <div className="rounded-[28px] border border-dashed border-black/15 p-8 sm:p-12 text-center bg-white shadow-2xs space-y-3">
      <Briefcase className="w-10 h-10 text-slate-400 mx-auto" aria-hidden="true" />
      <h3 className="text-lg font-bold text-black">
        {t("Tidak ada lowongan yang cocok")}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
        {t("Tidak ditemukan lowongan pekerjaan aktif dengan kriteria pencarian yang Anda masukkan.")}
      </p>
      <div className="pt-2">
        <Link
          href="/lowongan"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-black text-white text-xs sm:text-sm font-bold hover:bg-black/80 transition-all min-h-[44px]"
        >
          {t("Hapus Semua Filter")}
        </Link>
      </div>
    </div>
  );
}
