"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Briefcase, GraduationCap, Clock } from "lucide-react";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  EDUCATION_LABEL,
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";
import { useLanguage } from "@/lib/i18n";

export interface JobCardData {
  id: number;
  title: string;
  slug: string;
  workMode: WorkMode;
  jobType: JobType;
  educationMin: EducationMin;
  experienceMinYears?: number;
  skills?: string[];
  summary?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  isDemo?: boolean;
  createdAt?: string;
  company: {
    id: number;
    name: string;
    slug?: string;
    logoUrl?: string | null;
    cityName?: string | null;
    provinceName?: string | null;
  } | null;
}

interface JobCardProps {
  job: JobCardData;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatSalary(min?: number | null, max?: number | null, t?: (id: string, en?: string) => string): string {
  if (min && max) {
    return `${formatRupiah(min)} - ${formatRupiah(max)}`;
  }
  if (min) {
    return `${t ? t("Mulai", "From") : "Mulai"} ${formatRupiah(min)}`;
  }
  if (max) {
    return `${t ? t("Hingga", "Up to") : "Hingga"} ${formatRupiah(max)}`;
  }
  return t ? t("Gaji dapat dinegosiasikan", "Salary negotiable") : "Gaji dapat dinegosiasikan";
}

import { getCompanyLogo, getCompanyInitials } from "@/lib/company-logo";

export function JobCard({ job }: JobCardProps) {
  const { t } = useLanguage();
  const companyName = job.company?.name || "Perusahaan Mitra";
  const companyInitials = getCompanyInitials(companyName);
  const companyLogo = getCompanyLogo(companyName);
  const locationText = [job.company?.cityName, job.company?.provinceName]
    .filter(Boolean)
    .join(", ") || (job.workMode === "remote" ? t("Remote (Bekerja dari mana saja)", "Remote (Work from anywhere)") : t("Lokasi tidak disebutkan", "Location not specified"));

  return (
    <article className="group bg-white rounded-[24px] border border-black/[0.08] hover:border-black/20 p-5 sm:p-6 transition-all duration-200 shadow-card hover:shadow-card-md hover:-translate-y-1 focus-within:ring-2 focus-within:ring-navy-600 focus-within:border-transparent flex flex-col justify-between gap-4">
      {/* Bagian Atas: Info Perusahaan, Judul, dan Lencana Demo */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Logo Perusahaan atau Inisial Avatar */}
          <div className="w-12 h-12 rounded-2xl border border-slate-200/90 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            {job.company?.logoUrl ? (
              <Image
                src={job.company.logoUrl}
                alt={`Logo ${companyName}`}
                width={48}
                height={48}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : companyLogo ? (
              <Image
                src={companyLogo}
                alt={`Logo ${companyName}`}
                width={48}
                height={48}
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              <span className="font-bold text-sm text-navy-800 select-none">
                {companyInitials}
              </span>
            )}
          </div>

          {/* Judul Lowongan dan Nama Perusahaan */}
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/lowongan/${job.slug}`}
                className="text-base sm:text-lg font-bold text-navy-950 group-hover:text-navy-800 transition-colors tracking-tight focus:outline-none focus:underline"
              >
                {job.title}
              </Link>

              {/* Lencana Demo resmi sesuai PRD */}
              {job.isDemo && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                  {t("Lowongan Demo", "Demo Vacancy")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 flex-wrap">
              {job.company?.slug ? (
                <Link
                  href={`/perusahaan/${job.company.slug}`}
                  className="font-medium text-navy-900 hover:text-navy-700 hover:underline"
                >
                  {companyName}
                </Link>
              ) : (
                <span className="font-medium text-slate-800">{companyName}</span>
              )}

              <span className="text-slate-300" aria-hidden="true">•</span>

              <div className="inline-flex items-center gap-1 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="truncate">{locationText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informasi Gaji di Layar Sedang/Besar */}
        <div className="hidden sm:block text-right shrink-0">
          <span className="text-xs text-slate-500 block">{t("Kisaran Gaji", "Salary Range")}</span>
          <span className="text-sm font-bold text-navy-950">
            {formatSalary(job.salaryMin, job.salaryMax, t)}
          </span>
        </div>
      </div>

      {/* Ringkasan Singkat Posisi (bila ada) */}
      {job.summary && (
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {job.summary}
        </p>
      )}

      {/* Keahlian yang Diperlukan (Skills Chips) */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {job.skills.slice(0, 5).map((skill, index) => (
            <span
              key={index}
              className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm border border-slate-200"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="text-[11px] text-slate-500 font-medium">
              +{job.skills.length - 5} {t("lainnya", "more")}
            </span>
          )}
        </div>
      )}

      {/* Bagian Bawah: Badges Kriteria dan Tombol Aksi */}
      <div className="pt-3 border-t border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Kriteria Inti */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF8F0] text-black border border-black/[0.08]">
            <Briefcase className="w-3 h-3 text-slate-500" aria-hidden="true" />
            <span>{t(JOB_TYPE_LABEL[job.jobType] || job.jobType)}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#FFDD00] text-black border border-black/10">
            <span>{t(WORK_MODE_LABEL[job.workMode] || job.workMode)}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF8F0] text-black border border-black/[0.08]">
            <GraduationCap className="w-3 h-3 text-slate-500" aria-hidden="true" />
            <span>{t("Min.")} {t(EDUCATION_LABEL[job.educationMin] || job.educationMin)}</span>
          </span>

          {job.experienceMinYears !== undefined && job.experienceMinYears > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF8F0] text-black border border-black/[0.08]">
              <Clock className="w-3 h-3 text-slate-500" aria-hidden="true" />
              <span>{job.experienceMinYears} {t("thn exp", "yrs exp")}</span>
            </span>
          )}
        </div>

        {/* Informasi Gaji di Layar Kecil dan Tombol Detail */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/[0.06]">
          <div className="sm:hidden">
            <span className="text-[11px] text-slate-500 block">{t("Kisaran Gaji", "Salary Range")}</span>
            <span className="text-xs font-bold text-black">
              {formatSalary(job.salaryMin, job.salaryMax, t)}
            </span>
          </div>

          <Link
            href={`/lowongan/${job.slug}`}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] text-black font-bold text-xs transition-all shrink-0 min-h-[44px] shadow-2xs hover:scale-105"
          >
            {t("Detail Lowongan", "Job Details")}
          </Link>
        </div>
      </div>
    </article>
  );
}
