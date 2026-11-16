import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Building2,
  ArrowRight,
} from "lucide-react";
import { checkCompanyVerification } from "@/lib/validation/profil";
import { getCompanyLogo } from "@/lib/company-logo";
import {
  MitraDashboardView,
  type MitraDashboardRecentJob,
} from "@/components/mitra/MitraDashboardView";

export const metadata: Metadata = {
  title: "Dashboard Mitra - Ringkasan",
  description: "Pantau lowongan kerja aktif, status persetujuan admin, dan lamaran kandidat masuk.",
};

export default async function MitraDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/mitra");
  }

  // Ambil profil akun
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "company") {
    redirect("/403");
  }

  // Ambil data profil perusahaan lengkap
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, city_id, logo_path, industry, size, website, address_note, description")
    .eq("owner_id", user.id)
    .maybeSingle();

  // Jika belum ada data perusahaan sama sekali, arahkan ke pembuatan profil
  if (!company) {
    redirect("/mitra/profil-perusahaan?onboarding=true");
  }

  const fallbackLogo = company.name ? getCompanyLogo(company.name) : null;
  let companyLogoUrl: string | null = null;
  if (company.logo_path) {
    if (
      company.logo_path.startsWith("http://") ||
      company.logo_path.startsWith("https://") ||
      company.logo_path.startsWith("/")
    ) {
      companyLogoUrl = company.logo_path;
    } else {
      const { data: publicUrlData } = supabase.storage
        .from("company-logos")
        .getPublicUrl(company.logo_path);
      companyLogoUrl = publicUrlData?.publicUrl || null;
    }
  } else if (fallbackLogo) {
    companyLogoUrl = fallbackLogo;
  }

  // Cek apakah profil perusahaan sudah memenuhi bukti nyata dan logo
  const verification = checkCompanyVerification({
    ...company,
    logoUrl: companyLogoUrl || company.logo_path,
  });

  // Jika belum lengkap, kunci dashboard dan wajibkan pengisian profil
  if (!verification.isComplete) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-300">
            <span>Verifikasi Profil Wajib Dilengkapi</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Lengkapi Bukti Perusahaan Nyata & Logo
            </h1>
            <p className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              Demi melindungi pelamar dari lowongan penipuan dan calo, JobConnect mewajibkan setiap mitra melengkapi seluruh data profil usaha dan logo resmi sebelum dapat memasang lowongan.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] space-y-3">
            <h2 className="text-sm font-bold text-black flex items-center gap-2">
              <Building2 className="w-4 h-4 text-black" aria-hidden="true" />
              <span>Persyaratan yang Masih Perlu Dilengkapi:</span>
            </h2>
            <ul className="text-xs sm:text-sm text-slate-700 space-y-2 font-medium list-disc list-inside">
              {verification.missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <Link
              href="/mitra/profil-perusahaan"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-sm shadow-2xs hover:shadow transition min-h-[44px]"
            >
              <span>Lengkapi Profil & Unggah Logo Sekarang</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ambil metrik ringkasan dari database jika sudah terverifikasi
  const companyId = company.id;

  // 1. Ambil seluruh lowongan milik perusahaan ini
  const { data: jobsData } = await supabase
    .from("jobs")
    .select("id, title, slug, status, job_type, work_mode, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  const jobs = jobsData || [];
  const openJobsCount = jobs.filter((j) => j.status === "open").length;
  const pendingJobsCount = jobs.filter((j) => j.status === "pending").length;
  const jobIds = jobs.map((j) => j.id);

  // 2. Ambil total lamaran dan yang perlu ditinjau
  let totalApplicationsCount = 0;
  let pendingReviewCount = 0;
  const applicationCountsByJob: Record<number, number> = {};

  if (jobIds.length > 0) {
    const { data: appsData } = await supabase
      .from("applications")
      .select("id, job_id, status")
      .in("job_id", jobIds);

    if (appsData) {
      totalApplicationsCount = appsData.length;
      pendingReviewCount = appsData.filter(
        (a) => a.status === "dikirim" || a.status === "ditinjau"
      ).length;

      // Hitung per lowongan
      appsData.forEach((app) => {
        applicationCountsByJob[app.job_id] = (applicationCountsByJob[app.job_id] || 0) + 1;
      });
    }
  }

  const recentJobs: MitraDashboardRecentJob[] = jobs.slice(0, 5).map((j) => ({
    id: j.id,
    title: j.title,
    slug: j.slug,
    status: j.status,
    job_type: j.job_type,
    work_mode: j.work_mode,
    created_at: j.created_at,
    applicantCount: applicationCountsByJob[j.id] || 0,
  }));

  return (
    <MitraDashboardView
      companyName={company.name}
      companyLogoUrl={companyLogoUrl}
      openJobsCount={openJobsCount}
      pendingJobsCount={pendingJobsCount}
      totalApplicationsCount={totalApplicationsCount}
      pendingReviewCount={pendingReviewCount}
      totalJobsCount={jobs.length}
      recentJobs={recentJobs}
    />
  );
}
