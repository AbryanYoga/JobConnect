"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface LamaranHeaderProps {
  hasApplications: boolean;
}

export function LamaranHeader({ hasApplications }: LamaranHeaderProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10 shadow-2xs">
        <Briefcase className="w-3.5 h-3.5 text-black" aria-hidden="true" />
        <span>{t("Portofolio Lamaran Kerja", "Job Application Portfolio")}</span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
            {t("Riwayat Lamaran Saya", "My Applications History")}
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            {t(
              "Pantau progres peninjauan berkas, undangan wawancara, dan keputusan resmi dari perusahaan mitra.",
              "Track the progress of your application review, interview invitations, and official decisions from partner companies."
            )}
          </p>
        </div>
        {hasApplications && (
          <Link
            href="/lowongan"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F2D200] text-black font-bold text-xs transition border border-black/10 shadow-2xs self-start sm:self-auto min-h-[44px]"
          >
            <span>{t("Cari Lowongan Lain", "Explore More Jobs")}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
