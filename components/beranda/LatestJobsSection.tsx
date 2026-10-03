import React from "react";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Banknote,
  GraduationCap,
  ArrowRight,
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

function getCompanyInitials(name: string): string {
  if (!name) return "CO";
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => !["pt", "cv", "tbk", "ud"].includes(w.toLowerCase()));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function LatestJobsSection({ jobs }: LatestJobsSectionProps) {
  return (
    <section
      aria-labelledby="latest-jobs-heading"
      className="py-14 sm:py-20 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs font-bold text-navy-800 uppercase tracking-wider bg-navy-50 px-2.5 py-1 rounded-full border border-navy-100 inline-block">
              Peluang Kerja Terkini
            </span>
            <h2
              id="latest-jobs-heading"
              className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight"
            >
              Lowongan Pekerjaan Terbaru
            </h2>
            <p className="text-sm text-slate-600">
              Lowongan resmi berstatus aktif yang siap menerima pengajuan lamaran Anda.
            </p>
          </div>

          <Link
            href="/lowongan"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700 hover:text-navy-900 transition-colors shrink-0 group focus-visible:outline-2 focus-visible:outline-navy-600 rounded-xs"
          >
            <span>Lihat Semua Lowongan</span>
            <ArrowRight
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Daftar Kartu Lowongan Terbaru */}
        {jobs.length === 0 ? (
          <div className="rounded-card border border-dashed border-slate-300 p-8 sm:p-12 text-center bg-slate-50/50">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-base font-bold text-slate-800">
              Belum ada lowongan pekerjaan aktif
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Saat ini belum ada lowongan baru yang dipublikasikan. Silakan periksa kembali dalam beberapa saat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
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
                  className="rounded-card border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-navy-300 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Header Kartu: Logo & Identitas */}
                    <div className="flex items-start gap-4">
                      {/* Logo / Inisial Perusahaan */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-card bg-slate-50 border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden">
                        {job.company?.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={job.company.logoUrl}
                            alt={`Logo ${companyName}`}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full bg-navy-800 text-white font-bold text-sm sm:text-base flex items-center justify-center">
                            {getCompanyInitials(companyName)}
                          </div>
                        )}
                      </div>

                      {/* Judul & Perusahaan */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/lowongan/${job.slug}`}
                            className="text-base sm:text-lg font-bold text-navy-950 group-hover:text-navy-800 transition-colors tracking-tight focus-visible:outline-2 focus-visible:outline-navy-600 rounded-xs"
                          >
                            {job.title}
                          </Link>
                          {job.isDemo && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                              Data contoh
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-slate-600 truncate">
                          {companyName}
                        </p>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                          <span className="truncate">{locationText}</span>
                        </div>
                      </div>
                    </div>

                    {/* Lencana Atribut Pekerjaan */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {/* Tipe Kerja */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        <Briefcase className="w-3 h-3 text-slate-500" aria-hidden="true" />
                        <span>{JOB_TYPE_LABEL[job.jobType] || job.jobType}</span>
                      </span>

                      {/* Mode Kerja */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-navy-50 text-navy-800 border border-navy-100">
                        <span>{WORK_MODE_LABEL[job.workMode] || job.workMode}</span>
                      </span>

                      {/* Pendidikan Minimal */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
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
                            className="px-2 py-0.5 rounded-xs text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200"
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
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800">
                      <Banknote className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                      <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                    </div>

                    <Link
                      href={`/lowongan/${job.slug}`}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-control bg-navy-50 hover:bg-navy-700 text-navy-800 hover:text-white font-medium text-xs sm:text-sm transition-colors border border-navy-200 hover:border-navy-700 shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-navy-600"
                    >
                      <span>Lihat Detail</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Banner Ajakan Komunitas (Dual CTA - MotionSites Inspirasi) */}
        <div className="pt-6 sm:pt-8 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Kartu untuk Pencari Kerja */}
          <div className="rounded-card bg-navy-900 text-white p-6 sm:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <div className="w-10 h-10 rounded-control bg-white/10 flex items-center justify-center text-amber-400 mb-3">
                <UserCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Siap Melangkah ke Karier Berikutnya?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
                Lamar berbagai peluang kerja terverifikasi tanpa biaya tersembunyi dan pantau status seleksi secara transparan.
              </p>
            </div>

            <div className="relative z-10 pt-2">
              <Link
                href="/lowongan"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-sm transition-colors min-h-[44px] shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
              >
                <span>Cari Semua Lowongan</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Kartu untuk Perusahaan Mitra */}
          <div className="rounded-card bg-slate-100 border border-slate-200/90 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-control bg-navy-100 text-navy-800 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-navy-950">
                Mencari Talenta Tepat untuk Perusahaan?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
                Pasang lowongan resmi Anda dan jangkau kandidat kompeten dari 38 provinsi di seluruh Indonesia.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-navy-700 hover:bg-navy-800 text-white font-medium text-sm transition-colors min-h-[44px] shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600"
              >
                <span>Daftar Sebagai Perusahaan</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
