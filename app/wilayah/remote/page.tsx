import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import {
  Globe,
  Briefcase,
  Banknote,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
} from "lucide-react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  EDUCATION_LABEL,
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";

export const metadata: Metadata = {
  title: "Lowongan Kerja Remote (Bebas Lokasi) di Indonesia - JobConnect",
  description:
    "Daftar lowongan kerja jarak jauh (remote) resmi terverifikasi dari berbagai perusahaan mitra yang dapat dilamar tanpa batasan domisili.",
};

interface RemotePageProps {
  searchParams: Promise<{ kategori?: string; tipe?: string; page?: string }>;
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

const PAGE_SIZE = 10;

export default async function RemoteJobsPage({ searchParams }: RemotePageProps) {
  const { kategori: categorySlug, tipe: jobTypeParam, page: pageParam } =
    await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const supabase = await createClient();

  // 1. Ambil seluruh kategori untuk filter
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  let selectedCategoryId: number | null = null;
  if (categorySlug && categories) {
    const foundCat = categories.find((c) => c.slug === categorySlug);
    if (foundCat) {
      selectedCategoryId = foundCat.id;
    }
  }

  // 2. Query lowongan khusus mode remote
  let baseQuery = supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      slug,
      work_mode,
      job_type,
      education_min,
      experience_min_years,
      skills,
      summary,
      salary_min,
      salary_max,
      is_demo,
      created_at,
      company:companies(
        id,
        name,
        logo_path
      )
    `,
      { count: "exact" }
    )
    .eq("work_mode", "remote")
    .eq("status", "open");

  if (process.env.NEXT_PUBLIC_SHOW_DEMO !== "true") {
    baseQuery = baseQuery.eq("is_demo", false);
  }

  if (selectedCategoryId) {
    baseQuery = baseQuery.eq("category_id", selectedCategoryId);
  }

  if (jobTypeParam) {
    baseQuery = baseQuery.eq("job_type", jobTypeParam);
  }

  const fromIndex = (currentPage - 1) * PAGE_SIZE;
  const toIndex = fromIndex + PAGE_SIZE - 1;

  const { data: rawJobs, count: totalJobs } = await baseQuery
    .order("created_at", { ascending: false })
    .range(fromIndex, toIndex);

  const totalCount = totalJobs || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  const jobs = (rawJobs || []).map((j) => {
    const companyData = Array.isArray(j.company) ? j.company[0] : j.company;
    let logoUrl: string | null = null;

    if (companyData?.logo_path) {
      const { data: publicUrlData } = supabase.storage
        .from("company-logos")
        .getPublicUrl(companyData.logo_path);
      logoUrl = publicUrlData.publicUrl;
    }

    return {
      id: j.id,
      title: j.title,
      slug: j.slug,
      workMode: j.work_mode as WorkMode,
      jobType: j.job_type as JobType,
      educationMin: j.education_min as EducationMin,
      experienceMinYears: j.experience_min_years,
      skills: j.skills,
      summary: j.summary,
      salaryMin: j.salary_min,
      salaryMax: j.salary_max,
      isDemo: j.is_demo,
      createdAt: j.created_at,
      company: companyData
        ? {
            id: companyData.id,
            name: companyData.name,
            logoUrl,
          }
        : null,
    };
  });

  const createFilterUrl = (newParams: {
    kategori?: string;
    tipe?: string;
    page?: number;
  }) => {
    const currentParams = new URLSearchParams();
    const finalCat =
      newParams.kategori !== undefined ? newParams.kategori : categorySlug;
    const finalType =
      newParams.tipe !== undefined ? newParams.tipe : jobTypeParam;
    const finalPage = newParams.page !== undefined ? newParams.page : 1;

    if (finalCat) currentParams.set("kategori", finalCat);
    if (finalType) currentParams.set("tipe", finalType);
    if (finalPage > 1) currentParams.set("page", finalPage.toString());

    const qs = currentParams.toString();
    return `/wilayah/remote${qs ? `?${qs}` : ""}`;
  };

  const jobTypes: JobType[] = [
    "full_time",
    "part_time",
    "kontrak",
    "magang",
    "freelance",
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Breadcrumb Navigasi */}
        <Breadcrumb
          items={[
            { label: "Beranda", href: "/" },
            { label: "Wilayah", href: "/wilayah" },
            { label: "Kerja Remote" },
          ]}
        />

        {/* Header Remote */}
        <div className="space-y-3 pb-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDD00] text-black border border-black/10 text-xs font-bold shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>Peluang Jarak Jauh</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
            Lowongan Kerja Remote (Bebas Lokasi)
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed font-medium">
            Pekerjaan resmi berstatus aktif yang dapat dikerjakan dari mana saja di seluruh Indonesia
            tanpa kewajiban hadir fisik di kantor. Terdapat {totalCount} lowongan yang tersedia.
          </p>
        </div>

        {/* Filter Bar Kategori dan Tipe Kerja */}
        <div className="rounded-[28px] border border-black/[0.08] bg-white p-4 sm:p-6 shadow-card space-y-3.5">
          <div className="flex items-center gap-2 text-xs font-bold text-black uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>Filter Lowongan Remote</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
            <span className="text-slate-500 font-bold">Tipe:</span>
            <Link
              href={createFilterUrl({ tipe: "" })}
              className={`px-3.5 py-2 rounded-full border transition-all min-h-[44px] inline-flex items-center font-bold ${
                !jobTypeParam
                  ? "bg-black text-white border-black shadow-2xs"
                  : "bg-[#FAF8F0] text-slate-700 border-black/[0.08] hover:bg-black/5"
              }`}
            >
              Semua
            </Link>
            {jobTypes.map((type) => (
              <Link
                key={type}
                href={createFilterUrl({ tipe: type })}
                className={`px-3.5 py-2 rounded-full border transition-all min-h-[44px] inline-flex items-center font-bold ${
                  jobTypeParam === type
                    ? "bg-black text-white border-black shadow-2xs"
                    : "bg-[#FAF8F0] text-slate-700 border-black/[0.08] hover:bg-black/5"
                }`}
              >
                {JOB_TYPE_LABEL[type]}
              </Link>
            ))}

            {(categorySlug || jobTypeParam) && (
              <Link
                href="/wilayah/remote"
                className="ml-auto text-xs font-bold text-rose-700 hover:underline min-h-[44px] inline-flex items-center"
              >
                Reset Filter
              </Link>
            )}
          </div>
        </div>

        {/* Daftar Lowongan Remote */}
        {jobs.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-black/15 p-8 sm:p-12 text-center bg-white shadow-2xs space-y-3">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto" aria-hidden="true" />
            <h2 className="text-lg font-bold text-black">
              Belum ada lowongan remote yang sesuai
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Saat ini belum ada lowongan kerja jarak jauh yang cocok dengan kriteria pencarian Anda.
              Anda juga dapat menjelajahi lowongan berdasarkan wilayah provinsi.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/wilayah/remote"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-black text-xs sm:text-sm font-bold transition-all min-h-[44px]"
              >
                Hapus Filter
              </Link>
              <Link
                href="/wilayah"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] text-black text-xs sm:text-sm font-bold transition-all shadow-2xs min-h-[44px]"
              >
                Jelajah 38 Provinsi
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {jobs.map((job) => {
                const companyName = job.company?.name || "Perusahaan Mitra";
                const companyLogo = getCompanyLogo(companyName);

                return (
                  <div
                    key={job.id}
                    className="rounded-[24px] border border-black/[0.08] hover:border-black/20 bg-white p-5 sm:p-6 shadow-card hover:shadow-card-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-3.5">
                      {/* Header Kartu: Logo & Identitas */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] shrink-0 flex items-center justify-center overflow-hidden shadow-2xs p-1">
                          {job.company?.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={job.company.logoUrl}
                              alt={`Logo ${companyName}`}
                              className="w-full h-full object-contain p-1"
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
                            <div className="w-full h-full bg-[#222222] text-[#FFDD00] font-bold text-sm flex items-center justify-center rounded-xl">
                              {getCompanyInitials(companyName)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/lowongan/${job.slug}`}
                              className="text-base font-bold text-black group-hover:text-black transition-colors tracking-tight focus-visible:outline-2 focus-visible:outline-black rounded-xs"
                            >
                              {job.title}
                            </Link>
                            {job.isDemo && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                Data contoh
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-slate-700 truncate mt-0.5 font-medium">
                            {companyName}
                          </p>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                            <span>Kerja Remote (Bebas Domisili)</span>
                          </div>
                        </div>
                      </div>

                      {/* Lencana Atribut Pekerjaan */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF8F0] text-black border border-black/[0.08]">
                          <Briefcase className="w-3 h-3 text-slate-500" aria-hidden="true" />
                          <span>{JOB_TYPE_LABEL[job.jobType] || job.jobType}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFDD00] text-black border border-black/10">
                          <span>{WORK_MODE_LABEL[job.workMode] || job.workMode}</span>
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF8F0] text-black border border-black/[0.08]">
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
                              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF8F0] text-slate-700 border border-black/[0.06]"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              +{job.skills.length - 3} lainnya
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Kartu: Gaji & Tombol Aksi */}
                    <div className="mt-5 pt-4 border-t border-black/[0.08] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-black">
                        <Banknote className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                        <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                      </div>

                      <Link
                        href={`/lowongan/${job.slug}`}
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] text-black font-bold text-xs sm:text-sm transition-all shadow-2xs shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-black"
                      >
                        <span>Detail Lowongan</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginasi 10 Data Per Halaman */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-black/[0.08] flex items-center justify-between gap-4">
                <span className="text-xs text-slate-600 font-medium">
                  Halaman {currentPage} dari {totalPages} ({totalCount} lowongan remote)
                </span>

                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link
                      href={createFilterUrl({ page: currentPage - 1 })}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-black/[0.08] bg-white hover:bg-black/5 text-xs font-bold text-black transition-all min-h-[44px]"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Sebelumnya</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-black/[0.04] bg-white/50 text-xs font-bold text-slate-300 cursor-not-allowed min-h-[44px]">
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      <span>Sebelumnya</span>
                    </span>
                  )}

                  {currentPage < totalPages ? (
                    <Link
                      href={createFilterUrl({ page: currentPage + 1 })}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-black/[0.08] bg-white hover:bg-black/5 text-xs font-bold text-black transition-all min-h-[44px]"
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full border border-black/[0.04] bg-white/50 text-xs font-bold text-slate-300 cursor-not-allowed min-h-[44px]">
                      <span>Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tautan Navigasi Bawah */}
        <div className="pt-6 border-t border-black/[0.08] flex items-center justify-between gap-4 flex-wrap text-xs">
          <Link
            href="/wilayah"
            className="text-black font-bold hover:underline inline-flex items-center gap-1 min-h-[44px]"
          >
            Kembali ke Indeks 38 Wilayah
          </Link>
          <Link
            href="/lowongan"
            className="text-slate-600 hover:text-black font-medium inline-flex items-center gap-1 min-h-[44px]"
          >
            <Briefcase className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Lihat Seluruh Lowongan Indonesia</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
