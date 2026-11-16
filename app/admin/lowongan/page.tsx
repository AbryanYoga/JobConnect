import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  AdminLowonganView,
  type AdminLowonganJobItem,
} from "@/components/admin/AdminLowonganView";

export const metadata: Metadata = {
  title: "Antrean Review Lowongan",
  description:
    "Daftar antrean verifikasi dan moderasi lowongan kerja oleh admin platform JobConnect.",
};

interface AdminLowonganPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}

export default async function AdminLowonganPage({
  searchParams,
}: AdminLowonganPageProps) {
  const { status: rawStatus, q: searchQuery } = await searchParams;
  const currentTab = rawStatus || "pending";

  const supabase = await createClient();

  // Hitung jumlah data per status untuk tab badge
  const [
    { count: pendingCount },
    { count: openCount },
    { count: rejectedCount },
    { count: removedCount },
  ] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "removed"),
  ]);

  // Query lowongan
  let query = supabase
    .from("jobs")
    .select(`
      id,
      title,
      slug,
      status,
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
      review_note,
      reviewed_at,
      created_at,
      company:companies (
        id,
        name,
        slug,
        industry
      ),
      category:categories (
        id,
        name
      ),
      city:cities (
        id,
        name,
        type,
        province:provinces (
          name
        )
      )
    `)
    .order("created_at", { ascending: currentTab === "pending" }); // Pending: tertua dulu agar adil (FIFO)

  if (currentTab !== "all") {
    if (currentTab === "rejected_or_removed") {
      query = query.in("status", ["rejected", "removed"]);
    } else {
      query = query.eq("status", currentTab);
    }
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery.trim()}%`);
  }

  const { data: jobsData } = await query;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedJobs: AdminLowonganJobItem[] = (jobsData || []).map((j: any) => {
    const rawCompany = Array.isArray(j.company) ? j.company[0] : j.company;
    const rawCategory = Array.isArray(j.category) ? j.category[0] : j.category;
    const rawCity = Array.isArray(j.city) ? j.city[0] : j.city;
    const rawProvince = Array.isArray(rawCity?.province)
      ? rawCity?.province[0]
      : rawCity?.province;

    return {
      id: j.id,
      title: j.title,
      slug: j.slug,
      status: j.status,
      work_mode: j.work_mode,
      job_type: j.job_type,
      education_min: j.education_min,
      experience_min_years: j.experience_min_years,
      skills: j.skills,
      summary: j.summary,
      responsibilities: j.responsibilities,
      nice_to_have: j.nice_to_have,
      benefits: j.benefits,
      salary_min: j.salary_min,
      salary_max: j.salary_max,
      created_at: j.created_at,
      reviewed_at: j.reviewed_at,
      review_note: j.review_note,
      deadline: j.deadline,
      companyName: rawCompany?.name || "Perusahaan",
      companyIndustry: rawCompany?.industry,
      categoryName: rawCategory?.name || "Umum",
      cityName: rawCity?.name,
      provinceName: rawProvince?.name,
    };
  });

  return (
    <AdminLowonganView
      jobs={formattedJobs}
      pendingCount={pendingCount ?? 0}
      openCount={openCount ?? 0}
      rejectedCount={rejectedCount ?? 0}
      removedCount={removedCount ?? 0}
      currentTab={currentTab}
      searchQuery={searchQuery}
    />
  );
}
