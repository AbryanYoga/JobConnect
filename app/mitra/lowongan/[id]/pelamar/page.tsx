import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, ExternalLink, Briefcase } from "lucide-react";
import { type ApplicationStatus } from "@/components/ui/StatusBadge";
import { CopyJobLinkButton } from "@/components/mitra/CopyJobLinkButton";
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
    ai?: string;
    sort?: string;
  }>;
}

function formatDateIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
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
      {/* Tombol Kembali ke Daftar Lowongan */}
      <div>
        <Link
          href="/mitra/lowongan"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-black transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Kelola Lowongan</span>
        </Link>
      </div>

      {/* Header Lowongan & Metrik Pelamar */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F0] border border-black/[0.06] text-xs font-bold text-slate-800">
            <Briefcase className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
            <span>Kandidat Pelamar Lowongan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {job.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Diajukan pada {formatDateIndo(job.created_at)} • Total {applications.length} pelamar terdaftar
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
              <span>Lihat Tayangan</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

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
