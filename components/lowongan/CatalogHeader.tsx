"use client";

import { Briefcase } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function CatalogHeader({ totalCount }: { totalCount: number }) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-3 pb-2">
      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDD00] text-black border border-black/10 text-xs font-bold shadow-2xs">
        <Briefcase className="w-3.5 h-3.5 text-black" aria-hidden="true" />
        <span>{t("Katalog Resmi")}</span>
      </div>
      <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
        {t("Eksplorasi Lowongan Pekerjaan")}
      </h1>
      <p className="text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed font-medium">
        {language === "en"
          ? `Discover verified career opportunities from partner companies approved by administrators. There are ${totalCount} active vacancies ready to apply.`
          : `Temukan kesempatan berkarier dari perusahaan mitra yang telah diverifikasi oleh admin. Tersedia ${totalCount} lowongan aktif yang siap dilamar.`}
      </p>
    </div>
  );
}

export function CatalogMetaCount({
  currentCount,
  totalCount,
}: {
  currentCount: number;
  totalCount: number;
}) {
  const { language } = useLanguage();

  return (
    <span className="text-xs font-bold text-slate-700">
      {language === "en"
        ? `Showing ${currentCount} of ${totalCount} job vacancies`
        : `Menampilkan ${currentCount} dari ${totalCount} lowongan kerja`}
    </span>
  );
}
