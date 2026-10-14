import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JobCard, type JobCardData } from "@/components/lowongan/JobCard";
import {
  Building2,
  MapPin,
  Globe,
  Users,
  Briefcase,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import {
  COMPANY_SIZE_OPTIONS,
  type CompanySize,
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";

interface CompanyProfilePageProps {
  params: Promise<{
    slug: string;
  }>;
}

import { getCompanyLogo, getCompanyInitials } from "@/lib/company-logo";

export async function generateMetadata({
  params,
}: CompanyProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("name, description, industry")
    .eq("slug", slug)
    .single();

  if (!company) {
    return {
      title: "Perusahaan Tidak Ditemukan - JobConnect",
    };
  }

  return {
    title: `${company.name} - Profil Perusahaan Mitra di JobConnect`,
    description:
      company.description?.slice(0, 160) ||
      `Profil resmi dan daftar lowongan kerja aktif dari ${company.name} di JobConnect.`,
  };
}

export default async function CompanyProfilePage({
  params,
}: CompanyProfilePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Ambil data profil perusahaan
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select(
      `
      id,
      name,
      slug,
      logo_path,
      website,
      industry,
      size,
      address_note,
      description,
      created_at,
      city:cities(
        name,
        province:provinces(name)
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (companyError || !company) {
    notFound();
  }

  // 2. Ambil logo jika ada di Storage
  let logoUrl: string | null = null;
  if (company.logo_path) {
    const { data: publicUrlData } = supabase.storage
      .from("company-logos")
      .getPublicUrl(company.logo_path);
    logoUrl = publicUrlData.publicUrl;
  }

  const cityData = company.city
    ? Array.isArray(company.city)
      ? company.city[0]
      : company.city
    : null;

  const provinceData = cityData?.province
    ? Array.isArray(cityData.province)
      ? cityData.province[0]
      : cityData.province
    : null;

  const locationText = [cityData?.name, provinceData?.name]
    .filter(Boolean)
    .join(", ") || "Indonesia";

  // 3. Ambil daftar lowongan aktif milik perusahaan ini
  let jobsQuery = supabase
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
      created_at
    `
    )
    .eq("company_id", company.id)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (process.env.NEXT_PUBLIC_SHOW_DEMO !== "true") {
    jobsQuery = jobsQuery.eq("is_demo", false);
  }

  const { data: rawJobs } = await jobsQuery;

  // Format data lowongan untuk JobCard
  const formattedJobs: JobCardData[] = (rawJobs || []).map((j) => ({
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
    company: {
      id: company.id,
      name: company.name,
      slug: company.slug,
      logoUrl,
      cityName: cityData?.name || null,
      provinceName: provinceData?.name || null,
    },
  }));

  const companyInitials = getCompanyInitials(company.name);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigasi Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Beranda", href: "/" },
            { label: "Lowongan", href: "/lowongan" },
            { label: company.name },
          ]}
        />

        {/* Tombol Navigasi Kembali */}
        <div>
          <Link
            href="/lowongan"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-900 transition min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Katalog Lowongan</span>
          </Link>
        </div>

        {/* Header Profil Perusahaan */}
        <section className="bg-white rounded-card border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
            {/* Logo Perusahaan */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-slate-200/90 bg-white p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {logoUrl || getCompanyLogo(company.name) ? (
                <Image
                  src={logoUrl || getCompanyLogo(company.name)!}
                  alt={`Logo ${company.name}`}
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="font-black text-2xl text-navy-800 select-none">
                  {companyInitials}
                </span>
              )}
            </div>

            {/* Detail Info Perusahaan */}
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
                  {company.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-bold bg-navy-50 text-navy-800 border border-navy-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
                  <span>Mitra Terverifikasi</span>
                </span>
              </div>

              {/* Meta Chips: Industri, Skala, Lokasi, Situs */}
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600 pt-1">
                {company.industry && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>{company.industry}</span>
                  </span>
                )}

                {company.size && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>
                      {COMPANY_SIZE_OPTIONS[company.size as CompanySize] || company.size}
                    </span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>{locationText}</span>
                </span>

                {company.website && (
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-navy-800 hover:text-navy-950 underline underline-offset-2 min-h-[44px]"
                  >
                    <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Kunjungi Situs Resmi</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Tata Letak Dua Kolom: Uraian Perusahaan & Lowongan Aktif */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Kolom Kiri: Tentang Perusahaan & Alamat */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Kartu Ringkasan Tentang Perusahaan */}
            <div className="bg-white rounded-card border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
              <h2 className="text-xs font-bold text-navy-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                Profil Perusahaan
              </h2>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {company.description || "Perusahaan ini belum menyertakan deskripsi lengkap."}
              </p>

              {company.address_note && (
                <div className="pt-3 border-t border-slate-100 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block">
                    Alamat Kantor
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {company.address_note}
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Kolom Kanan: Daftar Lowongan Kerja Aktif */}
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-navy-800" aria-hidden="true" />
                <h2 className="text-lg font-bold text-navy-950 tracking-tight">
                  Lowongan Aktif ({formattedJobs.length})
                </h2>
              </div>
            </div>

            {formattedJobs.length === 0 ? (
              <div className="rounded-card border border-dashed border-slate-300 p-8 sm:p-12 text-center bg-white space-y-3">
                <Briefcase className="w-10 h-10 text-slate-400 mx-auto" aria-hidden="true" />
                <h3 className="text-base font-bold text-navy-950">
                  Belum Ada Lowongan Aktif
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                  Saat ini {company.name} belum membuka posisi pekerjaan baru. Silakan cek kembali di lain waktu atau jelajahi lowongan mitra lainnya.
                </p>
                <div className="pt-2">
                  <Link
                    href="/lowongan"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-navy-900 hover:bg-navy-950 text-white text-xs sm:text-sm font-semibold transition min-h-[44px]"
                  >
                    Lihat Lowongan Lainnya
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {formattedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
