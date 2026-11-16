import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type ApplicationStatus } from "@/components/ui/StatusBadge";
import { MitraPelamarHeader } from "@/components/mitra/MitraPelamarHeader";
import { MitraPelamarViewSwitcher } from "@/components/mitra/MitraPelamarViewSwitcher";
import { type PortfolioItem } from "@/lib/validation/profil";

export const metadata: Metadata = {
  title: "Daftar Pelamar - Dashboard Mitra",
  description: "Kelola dan seleksi daftar kandidat pelamar kerja pada lowongan resmi perusahaan mitra.",
};

interface PelamarPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    status?: string;
    sort?: string;
  }>;
}

type AppItem = {
  id: number;
  job_id: number;
  user_id: string;
  status: ApplicationStatus;
  ai_consent: boolean;
  created_at: string;
  profiles: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    headline: string | null;
    avatar_url?: string | null;
    province_id?: number | null;
    city_id?: number | null;
    birth_date?: string | null;
    education_level?: string | null;
    linkedin_url?: string | null;
    portfolio_url?: string | null;
    portfolios?: PortfolioItem[] | null;
  } | null;
};

export default async function PelamarPage({
  params,
}: PelamarPageProps) {
  const { id } = await params;
  const jobId = Number(id);

  if (isNaN(jobId) || jobId <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/mitra/lowongan/${jobId}/pelamar`);
  }

  // Ambil profil perusahaan pemilik akun
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect("/mitra/profil-perusahaan");
  }

  // Ambil detail lowongan dan pastikan milik perusahaan ini
  const { data: job } = await supabase
    .from("jobs")
    .select("id, title, slug, status, created_at, company_id")
    .eq("id", jobId)
    .eq("company_id", company.id)
    .maybeSingle();

  if (!job) {
    notFound();
  }

  // Ambil seluruh pelamar pada lowongan ini
  let rawApplications: unknown = null;
  const { data: fullApps, error: fullAppsError } = await supabase
    .from("applications")
    .select(`
      id,
      job_id,
      user_id,
      status,
      ai_consent,
      created_at,
      updated_at,
      profiles:user_id (
        id,
        name,
        email,
        phone,
        headline,
        avatar_url,
        province_id,
        city_id,
        birth_date,
        education_level,
        linkedin_url,
        portfolio_url,
        portfolios
      )
    `)
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (fullAppsError || !fullApps) {
    const { data: basicApps } = await supabase
      .from("applications")
      .select(`
        id,
        job_id,
        user_id,
        status,
        ai_consent,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          name,
          email,
          phone,
          headline
        )
      `)
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });
    rawApplications = basicApps;
  } else {
    rawApplications = fullApps;
  }

  const applications: AppItem[] = (rawApplications as unknown as AppItem[]) || [];

  return (
    <div className="space-y-8">
      {/* Header Lowongan & Metrik Pelamar Bilingual */}
      <MitraPelamarHeader
        job={{
          id: job.id,
          title: job.title,
          slug: job.slug,
          status: job.status,
          created_at: job.created_at,
        }}
        totalApplications={applications.length}
      />

      {/* Pengalih Tampilan & Papan Kanban ATS Pelamar */}
      <MitraPelamarViewSwitcher
        initialApplications={applications}
        job={{
          id: job.id,
          title: job.title,
          slug: job.slug,
          companyName: company.name,
        }}
      />
    </div>
  );
}
