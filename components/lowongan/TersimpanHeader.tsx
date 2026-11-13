"use client";

import React from "react";
import { Bookmark } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface TersimpanHeaderProps {
  count: number;
}

export function TersimpanHeader({ count }: TersimpanHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
            <Bookmark className="w-3.5 h-3.5 fill-[#FFDD00] text-amber-800" aria-hidden="true" />
            <span>{t("Bookmark Pelamar", "Applicant Bookmarks")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
            {t("Lowongan Tersimpan", "Saved Jobs")}
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            {t(
              "Koleksi peluang karir yang Anda tandai. Buka detail posisi dan ajukan berkas lamaran Anda sebelum batas waktu berakhir.",
              "Collection of career opportunities you bookmarked. Open position details and submit your application before the deadline passes."
            )}
          </p>
        </div>

        {count > 0 && (
          <div className="self-start sm:self-center px-4 py-2 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
            <span>
              {count} {t("Lowongan Tersimpan", "Saved Jobs")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

