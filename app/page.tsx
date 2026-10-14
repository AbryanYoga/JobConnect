import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BmcLandingPage } from "@/components/beranda/BmcLandingPage";
import {
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";

import { getCompanyLogo } from "@/lib/company-logo";

export const metadata: Metadata = {
  title: "JobConnect - Portal Lowongan Kerja Terverifikasi 38 Provinsi",
  description:
    "Cari dan lamar lowongan kerja resmi terverifikasi dari mitra di 38 provinsi di Indonesia. Bebas penipuan dan calo, gaji transparan, dan kriteria terstruktur.",
};

export default async function HomePage() {
  let provinces: { id: number; name: string; slug: string }[] = [];
  let categoriesWithCount: { id: number; name: string; slug: string; jobCount: number }[] = [];
  let latestJobs: {
    id: number;
    title: string;
    slug: string;
    workMode: WorkMode;
    jobType: JobType;
    educationMin: EducationMin;
    experienceMinYears?: number;
    skills?: string[];
    summary?: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    isDemo?: boolean;
    createdAt?: string;
    company: {
      id: number;
      name: string;
      slug?: string;
      logoUrl?: string | null;
      cityName?: string | null;
      provinceName?: string | null;
    } | null;
  }[] = [];
  let totalJobs = 0;

  try {
    const supabase = await createClient();

    // 1. Ambil daftar provinsi untuk filter wilayah
    const { data: provincesData } = await supabase
      .from("provinces")
      .select("id, name, slug")
      .order("name");

    if (provincesData) {
      provinces = provincesData;
    }

    // 2. Ambil daftar kategori dan hitung jumlah lowongan berstatus open
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

    // 3. Ambil total jumlah lowongan open
    const { count: totalCount } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "open");

    if (totalCount !== null) {
      totalJobs = totalCount;
    }

    // 4. Ambil 6 lowongan terbaru berstatus open
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
          slug,
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
          company: companyData
            ? {
                id: companyData.id,
                name: companyData.name,
                slug: companyData.slug,
                logoUrl: logoUrl || getCompanyLogo(companyData.name),
                cityName: cityData?.name || null,
                provinceName: provinceData?.name || null,
              }
            : null,
        };
      });
    }
  } catch {
    // Fallback jika database belum terhubung
  }

  return (
    <BmcLandingPage
      provinces={provinces}
      categories={categoriesWithCount}
      latestJobs={latestJobs}
      totalJobsCount={totalJobs || latestJobs.length}
    />
  );
}
