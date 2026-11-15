"use client";

import React from "react";
import { ShieldCheck, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { ReportJobModal } from "./ReportJobModal";
import { CareerGlossaryTrigger } from "@/components/ui/CareerGlossaryModal";

interface JobTrustSidebarProps {
  jobId: number;
  jobTitle: string;
  jobSlug: string;
}

export function JobTrustSidebar({
  jobId,
  jobTitle,
  jobSlug,
}: JobTrustSidebarProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-5">
      {/* Jaminan Bebas Calo & Pungutan */}
      <div className="bg-white rounded-[24px] border border-black/[0.08] p-5 shadow-card space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-navy-950">
              {t("Jaminan Bebas Calo & Pungli", "Zero Broker & Fee Guarantee")}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {t(
                "JobConnect 100% gratis untuk pelamar. Instansi ini telah melalui verifikasi identitas resmi dan domisili kantor fisik.",
                "JobConnect is 100% free for applicants. This company is officially verified with legitimate business credentials."
              )}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <ReportJobModal
            jobId={jobId}
            jobTitle={jobTitle}
            jobSlug={jobSlug}
          />
        </div>
      </div>

      {/* Komitmen Anti-Ghosting */}
      <div className="bg-[#FAF8F0] rounded-[24px] border border-black/[0.08] p-5 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-navy-950 font-bold text-xs">
          <Clock className="w-4 h-4 text-amber-600" aria-hidden="true" />
          <span>{t("Komitmen Responsif JobConnect", "JobConnect Responsive SLA")}</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {t(
            "Mitra memiliki batas evaluasi maksimal 14 hari kerja. Pelamar berhak memantau linimasa progres seleksi secara transparan tanpa digantung.",
            "Partners have a maximum 14-working-day review limit. Applicants track real-time selection timeline without ghosting."
          )}
        </p>
      </div>

      {/* Kamus Istilah Karir */}
      <div className="bg-white rounded-[24px] border border-black/[0.08] p-4 shadow-card flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-600">
          {t("Bingung arti istilah kerja?", "Confused by recruitment terms?")}
        </span>
        <CareerGlossaryTrigger />
      </div>
    </div>
  );
}
