import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MainCriteriaCard } from "@/components/lowongan/MainCriteriaCard";
import {
  MapPin,
  Building2,
  Calendar,
  CheckCircle2,
  Gift,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { FormLamaran } from "@/components/lowongan/FormLamaran";
import { StatusBadge, type ApplicationStatus } from "@/components/ui/StatusBadge";
import { BookmarkButton } from "@/components/lowongan/BookmarkButton";

interface JobDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function formatDateIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function checkIsExpired(deadline?: string | null): boolean {
  if (!deadline) return false;
  const today = new Date().toISOString().slice(0, 10);
  return deadline < today;
}

import { getCompanyLogo, getCompanyInitials } from "@/lib/company-logo";

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: job } = await supabase
    .from("jobs")
    .select("title, summary, company:companies(name)")
    .eq("slug", slug)
    .single();

  if (!job) {
    return {
      title: "Lowongan Tidak Ditemukan - JobConnect",
    };
  }

  const companyData = Array.isArray(job.company) ? job.company[0] : job.company;
  const companyName = companyData?.name || "Perusahaan";

  return {
    title: `${job.title} di ${companyName} - JobConnect`,
    description:
      job.summary ||
      `Lamar lowongan kerja ${job.title} di ${companyName} resmi terverifikasi melalui JobConnect.`,
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: job, error } = await supabase
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
      responsibilities,
      nice_to_have,
      benefits,
      salary_min,
      salary_max,
      deadline,
      status,
      is_demo,
      location_detail,
      created_at,
      category:categories(id, name, slug),
      company:companies(
        id,
        name,
        slug,
        logo_path,
        industry,
        size,
        website,
        description,
        city:cities(
          name,
          province:provinces(name)
        )
      )
    `
    )
    .eq("slug", slug)
    .single();

  if (error || !job) {
    notFound();
  }

  // Jika lowongan demo disembunyikan oleh sistem
  if (process.env.NEXT_PUBLIC_SHOW_DEMO !== "true" && job.is_demo) {
    notFound();
  }

  // Ambil sesi pengguna yang sedang masuk untuk formulir lamaran
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: string | null = null;
  let existingApplication: { id: number; status: string; created_at: string } | null = null;
  let isBookmarked = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    userRole = profile?.role || "user";

    // Cek apakah lowongan disimpan oleh pelamar
    const { data: savedData } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("job_id", job.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (savedData) {
      isBookmarked = true;
    }

    // Cek apakah pengguna sudah pernah melamar ke lowongan ini
    const { data: appData } = await supabase
      .from("applications")
      .select("id, status, created_at")
      .eq("job_id", job.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (appData) {
      existingApplication = appData;
    }
  }

  const companyData = Array.isArray(job.company) ? job.company[0] : job.company;

  let logoUrl: string | null = null;
  if (companyData?.logo_path) {
    const { data: publicUrlData } = supabase.storage
      .from("company-logos")
      .getPublicUrl(companyData.logo_path);
    logoUrl = publicUrlData.publicUrl;
  }

  const cityData = companyData?.city
    ? Array.isArray(companyData.city)
      ? companyData.city[0]
      : companyData.city
    : null;

  const provinceData = cityData?.province
    ? Array.isArray(cityData.province)
      ? cityData.province[0]
      : cityData.province
    : null;

  const companyName = companyData?.name || "Perusahaan Mitra";
  const companyInitials = getCompanyInitials(companyName);
  const locationText = [cityData?.name, provinceData?.name].filter(Boolean).join(", ") ||
    (job.work_mode === "remote" ? "Kerja Remote" : "Indonesia");

  const isOpen = job.status === "open";
  const isExpired = checkIsExpired(job.deadline);
  const isApplyAllowed = isOpen && !isExpired;

  return (
    <div className="min-h-screen bg-[#FAF8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Tombol Kembali ke Daftar Lowongan */}
        <div>
          <Link
            href="/lowongan"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-900 transition min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Katalog Lowongan</span>
          </Link>
        </div>

        {/* Banner Status Pelamar Sudah Melamar */}
        {existingApplication && (
          <aside
            aria-label="Status Lamaran Anda"
            className="rounded-[24px] bg-blue-50/90 border border-blue-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 text-blue-700">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">
                    Anda Telah Melamar Posisi Ini
                  </span>
                  <StatusBadge
                    status={existingApplication.status as ApplicationStatus}
                  />
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Lamaran dikirimkan pada {formatDateIndo(existingApplication.created_at)}. Anda dapat memantau proses seleksi melalui timeline lamaran.
                </p>
              </div>
            </div>
            <Link
              href={`/lamaran-saya/${existingApplication.id}`}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-navy-950 font-bold text-xs transition border border-black/10 shadow-2xs shrink-0 min-h-[44px]"
            >
              <span>Lihat Detail Lamaran</span>
              <ArrowRight className="w-3.5 h-3.5 text-navy-800" aria-hidden="true" />
            </Link>
          </aside>
        )}

        {/* Kartu Header Utama Lowongan */}
        <section className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
              {/* Logo Perusahaan */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-slate-200/90 bg-white p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                {logoUrl || getCompanyLogo(companyName) ? (
                  <Image
                    src={logoUrl || getCompanyLogo(companyName)!}
                    alt={`Logo ${companyName}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="font-extrabold text-xl text-navy-800 select-none">
                    {companyInitials}
                  </span>
                )}
              </div>

              {/* Judul & Meta Perusahaan */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-black text-navy-950 tracking-tight">
                    {job.title}
                  </h1>
                  {job.is_demo && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      Lowongan Demo
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-bold border ${
                      isApplyAllowed
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    {isApplyAllowed
                      ? "Lowongan Dibuka"
                      : isExpired
                      ? "Batas Waktu Berakhir"
                      : "Lowongan Ditutup"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 flex-wrap">
                  {companyData?.slug ? (
                    <Link
                      href={`/perusahaan/${companyData.slug}`}
                      className="font-bold text-navy-900 hover:text-navy-700 hover:underline flex items-center gap-1"
                    >
                      <Building2 className="w-4 h-4 text-navy-700" aria-hidden="true" />
                      <span>{companyName}</span>
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <span>{companyName}</span>
                    </span>
                  )}

                  <span className="text-slate-300" aria-hidden="true">•</span>

                  <div className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>{locationText}</span>
                  </div>

                  <span className="text-slate-300" aria-hidden="true">•</span>

                  <div className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>Dipasang {formatDateIndo(job.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol CTA Lamar dan Simpan di Header */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <BookmarkButton
                jobId={job.id}
                initialIsBookmarked={isBookmarked}
                variant="button"
              />

              {existingApplication ? (
                <Link
                  href={`/lamaran-saya/${existingApplication.id}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-2xs min-h-[44px]"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  <span>Sudah Melamar (Lihat Status)</span>
                </Link>
              ) : userRole === "company" ? (
                <div className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80 font-bold text-xs min-h-[44px]">
                  <Building2 className="w-4 h-4 text-amber-700" aria-hidden="true" />
                  <span>Mode Mitra Perusahaan</span>
                </div>
              ) : userRole === "admin" ? (
                <div className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs min-h-[44px]">
                  <span>Mode Administrator</span>
                </div>
              ) : isApplyAllowed ? (
                <a
                  href="#formulir-lamaran"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-navy-900 hover:bg-navy-950 text-white font-bold text-sm transition shadow-2xs min-h-[44px]"
                >
                  Lamar Sekarang
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-slate-200 text-slate-500 font-semibold text-sm cursor-not-allowed min-h-[44px]"
                >
                  {isExpired ? "Batas Waktu Berakhir" : "Lowongan Sudah Ditutup"}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Tata Letak Dua Kolom: Konten Deskripsi & Sidebar Kriteria */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Kolom Kiri: Uraian Lengkap Pekerjaan */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Ringkasan Posisi */}
            {job.summary && (
              <section className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-3">
                <h2 className="text-lg font-bold text-navy-950 tracking-tight border-b border-slate-100 pb-2">
                  Ringkasan Posisi
                </h2>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {job.summary}
                </p>
              </section>
            )}

            {/* 2. Tanggung Jawab Utama */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <section className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
                <h2 className="text-lg font-bold text-navy-950 tracking-tight border-b border-slate-100 pb-2">
                  Tanggung Jawab Pekerjaan
                </h2>
                <ul className="space-y-2.5 list-none m-0 p-0">
                  {job.responsibilities.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-navy-700 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 3. Kualifikasi Tambahan / Nilai Plus */}
            {job.nice_to_have && job.nice_to_have.length > 0 && (
              <section className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
                <h2 className="text-lg font-bold text-navy-950 tracking-tight border-b border-slate-100 pb-2">
                  Kualifikasi Tambahan (Nilai Plus)
                </h2>
                <ul className="space-y-2.5 list-none m-0 p-0">
                  {job.nice_to_have.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700">
                      <span className="w-2 h-2 rounded-full bg-navy-600 shrink-0 mt-2" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 4. Fasilitas dan Keuntungan */}
            {job.benefits && job.benefits.length > 0 && (
              <section className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
                <h2 className="text-lg font-bold text-navy-950 tracking-tight border-b border-slate-100 pb-2">
                  Fasilitas & Keuntungan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {job.benefits.map((benefit: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm font-semibold text-slate-800"
                    >
                      <Gift className="w-4 h-4 text-navy-700 shrink-0" aria-hidden="true" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 5. Tentang Perusahaan */}
            {companyData?.description && (
              <section className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-lg font-bold text-navy-950 tracking-tight">
                    Tentang {companyName}
                  </h2>
                  {companyData.slug && (
                    <Link
                      href={`/perusahaan/${companyData.slug}`}
                      className="text-xs font-semibold text-navy-800 hover:text-navy-950 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Lihat Profil Lengkap</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {companyData.description}
                </p>
              </section>
            )}

            {/* 6. Formulir Pengajuan Lamaran Pekerjaan */}
            <FormLamaran
              jobId={job.id}
              jobTitle={job.title}
              jobSlug={job.slug}
              companyName={companyName}
              isOpen={isOpen}
              isExpired={isExpired}
              deadline={job.deadline}
              isLoggedIn={Boolean(user)}
              userRole={userRole}
              hasApplied={Boolean(existingApplication)}
              existingApplicationId={existingApplication?.id}
            />
          </div>

          {/* Kolom Kanan: Sidebar Kriteria Utama */}
          <aside className="lg:col-span-1 space-y-6">
            <MainCriteriaCard
              salaryMin={job.salary_min}
              salaryMax={job.salary_max}
              educationMin={job.education_min}
              experienceMinYears={job.experience_min_years}
              jobType={job.job_type}
              workMode={job.work_mode}
              deadline={job.deadline}
              skills={job.skills}
              locationText={locationText}
              locationDetail={job.location_detail}
              isOpen={isApplyAllowed}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
