import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  MitraLowonganView,
  type MitraLowonganItem,
} from "@/components/mitra/MitraLowonganView";

export const metadata: Metadata = {
  title: "Kelola Lowongan - Dashboard Mitra",
  description: "Daftar dan status seluruh lowongan kerja milik perusahaan mitra JobConnect.",
};

interface MitraLowonganPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function MitraLowonganPage({
  searchParams,
}: MitraLowonganPageProps) {
  const { status: filterStatus } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/mitra/lowongan");
  }

  // Ambil profil akun
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "company") {
    redirect("/403");
  }

  // Ambil perusahaan
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, city_id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company || !company.city_id) {
    redirect("/mitra");
  }

  // Ambil daftar lowongan milik perusahaan
  let query = supabase
    .from("jobs")
    .select(
      "id, title, slug, status, work_mode, job_type, education_min, experience_min_years, review_note, created_at, deadline"
    )
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  if (filterStatus) {
    query = query.eq("status", filterStatus);
  }

  const { data: jobsData } = await query;
  const jobs = jobsData || [];

  // Ambil jumlah pelamar per lowongan
  const jobIds = jobs.map((j) => j.id);
  const applicantCounts: Record<number, number> = {};

  if (jobIds.length > 0) {
    const { data: appsData } = await supabase
      .from("applications")
      .select("id, job_id")
      .in("job_id", jobIds);

    if (appsData) {
      appsData.forEach((app) => {
        applicantCounts[app.job_id] = (applicantCounts[app.job_id] || 0) + 1;
      });
    }
  }

  const formattedJobs: MitraLowonganItem[] = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    slug: j.slug,
    status: j.status,
    work_mode: j.work_mode,
    job_type: j.job_type,
    education_min: j.education_min,
    experience_min_years: j.experience_min_years,
    review_note: j.review_note,
    created_at: j.created_at,
    deadline: j.deadline,
    applicantCount: applicantCounts[j.id] || 0,
  }));

  return (
    <MitraLowonganView jobs={formattedJobs} filterStatus={filterStatus || ""} />
  );
}
