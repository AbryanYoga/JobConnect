import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { MainCriteriaCard } from "@/components/lowongan/MainCriteriaCard";
import {
  MapPin,
  Building2,
  Calendar,
  CheckCircle2,
  Gift,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { FormLamaran } from "@/components/lowongan/FormLamaran";

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

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    userRole = profile?.role || "user";

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
  const categoryData = Array.isArray(job.category) ? job.category[0] : job.category;

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Navigasi Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Beranda", href: "/" },
            { label: "Lowongan", href: "/lowongan" },
            ...(categoryData?.name
              ? [{ label: categoryData.name, href: `/lowongan?kategori=${categoryData.slug}` }]
              : []),
            { label: job.title },
          ]}
        />

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

        {/* Kartu Header Utama Lowongan */}
        <section className="bg-white rounded-card border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
              {/* Logo Perusahaan */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={`Logo ${companyName}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
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
                      isOpen
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    {isOpen ? "Lowongan Dibuka" : "Lowongan Ditutup"}
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

            {/* Tombol CTA Lamar di Header */}
            <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {isOpen ? (
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
                  Lowongan Sudah Ditutup
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
              <section className="bg-white rounded-card border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-3">
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
              <section className="bg-white rounded-card border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-4">
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
              <section className="bg-white rounded-card border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-4">
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
              <section className="bg-white rounded-card border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-4">
                <h2 className="text-lg font-bold text-navy-950 tracking-tight border-b border-slate-100 pb-2">
                  Fasilitas & Keuntungan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {job.benefits.map((benefit: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 p-3 rounded-md bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800"
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
              <section className="bg-white rounded-card border border-slate-200 p-6 sm:p-7 shadow-2xs space-y-3">
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
              isOpen={isOpen}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
