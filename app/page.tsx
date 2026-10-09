import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/beranda/HeroSection";
import { ProvinceChipsBar } from "@/components/beranda/ProvinceChipsBar";
import {
  CategorySection,
  type CategoryWithCount,
} from "@/components/beranda/CategorySection";
import {
  LatestJobsSection,
  type LatestJobItem,
} from "@/components/beranda/LatestJobsSection";

export const metadata: Metadata = {
  title: "JobConnect - Portal Lowongan Kerja Terverifikasi 38 Provinsi",
  description:
    "Cari dan lamar lowongan kerja terverifikasi di 38 provinsi dan 514 kota se-Indonesia. Bebas penipuan, bebas ghosting, dengan transparansi alur lamaran.",
};

export default async function HomePage() {
  let provinces: { id: number; name: string; slug: string }[] = [];
  let categoriesWithCount: CategoryWithCount[] = [];
  let latestJobs: LatestJobItem[] = [];

  try {
    const supabase = await createClient();

    // 1. Ambil daftar provinsi untuk bar chip
    const { data: provincesData } = await supabase
      .from("provinces")
      .select("id, name, slug")
      .order("name");

    if (provincesData) {
      provinces = provincesData;
    }

    // 2. Ambil daftar kategori dan hitung jumlah lowongan berstatus open dari database
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name");

    const { data: openJobsData } = await supabase
      .from("jobs")
      .select("category_id")
      .eq("status", "open");

    if (categoriesData) {
      const countsMap = new Map<number, number>();
      if (openJobsData) {
        for (const job of openJobsData) {
          if (job.category_id !== null && job.category_id !== undefined) {
            countsMap.set(
              job.category_id,
              (countsMap.get(job.category_id) || 0) + 1
            );
          }
        }
      }

      categoriesWithCount = categoriesData.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        jobCount: countsMap.get(cat.id) || 0,
      }));
    }

    // 3. Ambil lowongan terbaru berstatus open
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
        created_at,
        company:companies(
          id,
          name,
          logo_path,
          city:cities(
            name,
            province:provinces(name)
          )
        )
      `
      )
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(6);

    if (process.env.NEXT_PUBLIC_SHOW_DEMO !== "true") {
      jobsQuery = jobsQuery.eq("is_demo", false);
    }

    const { data: rawJobs } = await jobsQuery;

    if (rawJobs) {
      latestJobs = rawJobs.map((j) => {
        let logoUrl: string | null = null;
        const companyData = Array.isArray(j.company) ? j.company[0] : j.company;

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

        return {
          id: j.id,
          title: j.title,
          slug: j.slug,
          workMode: j.work_mode as LatestJobItem["workMode"],
          jobType: j.job_type as LatestJobItem["jobType"],
          educationMin: j.education_min as LatestJobItem["educationMin"],
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
                logoPath: companyData.logo_path,
                logoUrl,
                cityName: cityData?.name || null,
                provinceName: provinceData?.name || null,
              }
            : null,
        };
      });
    }
  } catch {
    // Graceful fallback bila database belum terhubung
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <HeroSection provinces={provinces} />
      <ProvinceChipsBar provinces={provinces} />
      <CategorySection categories={categoriesWithCount} />
      <LatestJobsSection jobs={latestJobs} />
    </div>
  );
}
