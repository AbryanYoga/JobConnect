"use client";

import Link from "next/link";
import { ArrowLeft, Briefcase, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { CopyJobLinkButton } from "@/components/mitra/CopyJobLinkButton";

interface MitraPelamarHeaderProps {
  job: {
    id: number;
    title: string;
    slug: string;
    status: string;
    created_at: string;
  };
  totalApplications: number;
}

export function MitraPelamarHeader({ job, totalApplications }: MitraPelamarHeaderProps) {
  const { t, language } = useLanguage();

  const formattedDate = new Intl.DateTimeFormat(language === "en" ? "en-US" : "id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(job.created_at));

  return (
    <div className="space-y-4">
      {/* Tombol Kembali ke Daftar Lowongan */}
      <div>
        <Link
          href="/mitra/lowongan"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-black transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>{t("Kembali ke Kelola Lowongan", "Back to Job Management")}</span>
        </Link>
      </div>

      {/* Header Lowongan & Metrik Pelamar */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F0] border border-black/[0.06] text-xs font-bold text-slate-800">
            <Briefcase className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            <span>{t("Kandidat Pelamar Lowongan", "Job Vacancy Applicants")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {job.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {language === "en"
              ? `Submitted on ${formattedDate} • Total ${totalApplications} applicants registered`
              : `Diajukan pada ${formattedDate} • Total ${totalApplications} pelamar terdaftar`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <CopyJobLinkButton jobSlug={job.slug} />

          {job.status === "open" && (
            <Link
              href={`/lowongan/${job.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-black/[0.08] hover:bg-black/[0.04] text-black font-bold text-xs sm:text-sm transition min-h-[44px]"
            >
              <span>{t("Lihat Tayangan", "View Live Job")}</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
