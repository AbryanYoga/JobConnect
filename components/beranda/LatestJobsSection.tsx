import React from "react";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Banknote,
  GraduationCap,
  Building2,
  UserCheck,
} from "lucide-react";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  EDUCATION_LABEL,
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";

export interface LatestJobItem {
  id: number;
  title: string;
  slug: string;
  workMode: WorkMode;
  jobType: JobType;
  educationMin: EducationMin;
  experienceMinYears: number;
  skills: string[] | null;
  summary: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  isDemo: boolean;
  createdAt: string;
  company: {
    id: number;
    name: string;
    logoPath: string | null;
    logoUrl?: string | null;
    cityName: string | null;
    provinceName: string | null;
  } | null;
}

interface LatestJobsSectionProps {
  jobs: LatestJobItem[];
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatSalary(min: number | null, max: number | null): string {
  if (min && max) {
    return `${formatRupiah(min)} - ${formatRupiah(max)}`;
  }
  if (min) {
    return `Mulai ${formatRupiah(min)}`;
  }
  if (max) {
    return `Hingga ${formatRupiah(max)}`;
  }
  return "Gaji dapat dinegosiasikan";
}

import { getCompanyLogo, getCompanyInitials } from "@/lib/company-logo";

export function LatestJobsSection({ jobs }: LatestJobsSectionProps) {
  return (
    <section
      aria-labelledby="latest-jobs-heading"
      className="py-12 sm:py-16 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2
              id="latest-jobs-heading"
              className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight"
            >
              Lowongan Pekerjaan Terbaru
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Daftar lowongan resmi yang telah diverifikasi dan siap menerima pengajuan berkas Anda.
            </p>
          </div>

          <Link
            href="/lowongan"
            className="text-sm font-semibold text-navy-800 hover:text-navy-950 underline underline-offset-4 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-navy-700 rounded-xs"
          >
            Lihat Semua Lowongan
          </Link>
        </div>

        {/* Daftar Kartu Lowongan Terbaru */}
        {jobs.length === 0 ? (
          <div className="rounded-card border border-dashed border-slate-300 p-8 sm:p-12 text-center bg-slate-50">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-base font-bold text-navy-950">
              Belum ada lowongan pekerjaan aktif
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Saat ini belum ada lowongan baru yang dipublikasikan. Silakan periksa kembali dalam beberapa saat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {jobs.map((job) => {
              const companyName = job.company?.name || "Perusahaan Mitra";
              const locationText =
                job.workMode === "remote"
                  ? "Kerja Remote"
                  : job.company?.cityName
                  ? `${job.company.cityName}, ${job.company.provinceName || ""}`
                  : "Indonesia";

              return (
                <div
                  key={job.id}
                  className="rounded-card border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs hover:border-navy-300 transition-colors flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    {/* Header Kartu: Logo & Identitas */}
                    <div className="flex items-start gap-3.5">
                      {/* Logo / Inisial Perusahaan */}
                      <div className="w-12 h-12 rounded-sm bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                        {job.company?.logoUrl || getCompanyLogo(companyName) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={job.company?.logoUrl || getCompanyLogo(companyName)!}
                            alt={`Logo ${companyName}`}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full bg-navy-800 text-white font-bold text-sm flex items-center justify-center">
                            {getCompanyInitials(companyName)}
                          </div>
                        )}
                      </div>

                      {/* Judul & Perusahaan */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/lowongan/${job.slug}`}
                            className="text-base sm:text-lg font-bold text-navy-950 group-hover:text-navy-800 transition-colors tracking-tight focus-visible:outline-2 focus-visible:outline-navy-700 rounded-xs"
                          >
                            {job.title}
                          </Link>
                          {job.isDemo && (
                            <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                              Data contoh
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-700 truncate mt-0.5">
                          {companyName}
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                          <span className="truncate">{locationText}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lencana Atribut Pekerjaan */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {/* Tipe Kerja */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <Briefcase className="w-3 h-3 text-slate-500" aria-hidden="true" />
                        <span>{JOB_TYPE_LABEL[job.jobType] || job.jobType}</span>
                      </span>

                      {/* Mode Kerja */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium bg-navy-50 text-navy-800 border border-navy-100">
                        <span>{WORK_MODE_LABEL[job.workMode] || job.workMode}</span>
                      </span>

                      {/* Pendidikan Minimal */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <GraduationCap className="w-3 h-3 text-slate-500" aria-hidden="true" />
                        <span>Min. {EDUCATION_LABEL[job.educationMin] || job.educationMin}</span>
                      </span>
                    </div>

                    {/* Tag Keahlian Wajib */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {job.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-sm text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="text-[11px] text-slate-400">
                            +{job.skills.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Kartu: Gaji & Tombol Aksi */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-navy-950">
                      <Banknote className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>

                    <Link
                      href={`/lowongan/${job.slug}`}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-control bg-slate-100 hover:bg-navy-800 text-slate-800 hover:text-white font-medium text-xs sm:text-sm transition-colors border border-slate-200 hover:border-navy-800 shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-navy-700"
                    >
                      <span>Detail Lowongan</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Panel Informasi Terpadu Pencari Kerja dan Perusahaan */}
        <div className="mt-8 rounded-card border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            {/* Kolom Pencari Kerja */}
            <div className="space-y-4 md:pr-8">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-sm bg-navy-100 text-navy-800 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-navy-950">
                  Untuk Pencari Kerja
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Lamar berbagai lowongan resmi yang dimoderasi admin tanpa biaya tersembunyi.
                Pantau langsung seluruh tahapan seleksi secara transparan.
              </p>
              <div>
                <Link
                  href="/lowongan"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-control bg-navy-800 hover:bg-navy-900 active:bg-navy-950 text-white font-medium text-sm transition-colors min-h-[44px] shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
                >
                  Jelajah Lowongan Kerja
                </Link>
              </div>
            </div>

            {/* Kolom Perusahaan Mitra */}
            <div className="space-y-4 pt-6 md:pt-0 md:pl-8">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-sm bg-navy-100 text-navy-800 flex items-center justify-center">
                  <Building2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-navy-950">
                  Untuk Perusahaan Pemberi Kerja
                </h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Publikasikan informasi lowongan kerja resmi dan jangkau kandidat kompeten
                dari 38 provinsi di seluruh Indonesia.
              </p>
              <div>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-control bg-white hover:bg-slate-100 active:bg-slate-200 text-navy-950 font-medium text-sm transition-colors border border-slate-300 min-h-[44px] shadow-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
                >
                  Pasang Lowongan Perusahaan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
