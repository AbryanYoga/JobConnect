import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";

export const metadata: Metadata = {
  title: "Ringkasan Platform",
  description: "Statistik platform, metrik lowongan kerja, dan antrean review moderator JobConnect.",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Ambil metrik riil dari database
  const [
    { count: pendingCount },
    { count: openCount },
    { count: companiesCount },
    { count: applicationsCount },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("companies")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true }),
  ]);

  // Ambil hingga 5 lowongan pending tertua yang membutuhkan tinjauan
  const { data: pendingJobsData } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      slug,
      created_at,
      deadline,
      work_mode,
      job_type,
      company:companies (
        id,
        name,
        slug
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(5);

  const pendingJobs = (pendingJobsData as unknown as {
    id: number;
    title: string;
    slug: string;
    work_mode: string;
    job_type: string;
    created_at: string;
    company: {
      name: string;
      city?: {
        name: string;
        province?: {
          name: string;
        } | null;
      } | null;
    } | null;
  }[]) || [];

  return (
    <AdminDashboardView
      pendingCount={pendingCount ?? 0}
      openCount={openCount ?? 0}
      companiesCount={companiesCount ?? 0}
      applicationsCount={applicationsCount ?? 0}
      pendingJobs={pendingJobs}
    />
  );
}
