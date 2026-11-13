import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SearchBar } from "@/components/lowongan/SearchBar";
import { FilterPanel } from "@/components/lowongan/FilterPanel";
import { JobCard } from "@/components/lowongan/JobCard";
import { Pagination } from "@/components/ui/Pagination";
import { CatalogHeader, CatalogMetaCount } from "@/components/lowongan/CatalogHeader";
import { CatalogEmptyState } from "@/components/lowongan/CatalogEmptyState";
import {
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";

export const metadata: Metadata = {
  title: "Cari Lowongan Kerja Terverifikasi di Indonesia - JobConnect",
  description:
    "Jelajahi dan lamar lowongan kerja resmi terverifikasi dari berbagai perusahaan mitra di 38 provinsi di Indonesia.",
};

interface LowonganPageProps {
  searchParams: Promise<{
    q?: string;
    kategori?: string;
    tipe?: string;
    mode?: string;
    wilayah?: string;
    kota?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 10;

export default async function LowonganPage({ searchParams }: LowonganPageProps) {
  const {
    q: searchQuery,
    kategori: categorySlug,
    tipe: jobTypeParam,
    mode: workModeParam,
    wilayah: provinceSlug,
    kota: citySlug,
    page: pageParam,
  } = await searchParams;

  const currentPage = Math.max(1, parseInt(pageParam || "1", 10) || 1);
  const supabase = await createClient();

  // Cek apakah pengguna yang sedang masuk adalah mitra perusahaan atau admin
  let isCompanyOrAdmin = false;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      isCompanyOrAdmin =
        profile?.role === "company" || profile?.role === "admin";
    }
  } catch {
    // tamu
  }

  // 1. Ambil seluruh kategori dan provinsi untuk filter
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const { data: provinces } = await supabase
    .from("provinces")
    .select("id, name, slug")
    .order("name", { ascending: true });

  // 2. Ambil data kota jika provinsi dipilih
  let cities: { id: number; name: string; slug: string }[] = [];
  let foundProv: { id: number; name: string; slug: string } | null = null;

  if (provinceSlug && provinces) {
    foundProv = provinces.find((p) => p.slug === provinceSlug) || null;
    if (foundProv) {
      const { data: citiesData } = await supabase
        .from("cities")
        .select("id, name, slug")
        .eq("province_id", foundProv.id)
        .order("name", { ascending: true });
      if (citiesData) {
        cities = citiesData;
      }
    }
  }

  // 3. Resolve filter ID
  let selectedCategoryId: number | null = null;
  if (categorySlug && categories) {
    const foundCat = categories.find((c) => c.slug === categorySlug);
    if (foundCat) {
      selectedCategoryId = foundCat.id;
    }
  }

  let selectedCityId: number | null = null;
  if (citySlug && cities.length > 0) {
    const foundCity = cities.find((c) => c.slug === citySlug);
    if (foundCity) {
      selectedCityId = foundCity.id;
    }
  }

  // 4. Query lowongan dengan filter aktif
  let baseQuery = supabase
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
      city:cities(
        name,
        province:provinces(name)
      ),
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
    `,
      { count: "exact" }
    )
    .eq("status", "open");

  if (process.env.NEXT_PUBLIC_SHOW_DEMO !== "true") {
    baseQuery = baseQuery.eq("is_demo", false);
  }

  if (searchQuery) {
    baseQuery = baseQuery.ilike("title", `%${searchQuery.trim()}%`);
  }

  if (selectedCategoryId) {
    baseQuery = baseQuery.eq("category_id", selectedCategoryId);
  }

  if (jobTypeParam) {
    baseQuery = baseQuery.eq("job_type", jobTypeParam);
  }

  if (workModeParam) {
    baseQuery = baseQuery.eq("work_mode", workModeParam);
  }

  if (selectedCityId) {
    baseQuery = baseQuery.eq("city_id", selectedCityId);
  } else if (foundProv) {
    const provinceCityIds = cities.map((c) => c.id);
    if (provinceCityIds.length > 0) {
      baseQuery = baseQuery.in("city_id", provinceCityIds);
    } else {
      // Provinsi tidak memiliki data kota di database
      baseQuery = baseQuery.eq("city_id", -1);
    }
  } else if (provinceSlug) {
    // Slug provinsi tidak ditemukan dalam master data
    baseQuery = baseQuery.eq("city_id", -1);
  }

  const fromIndex = (currentPage - 1) * PAGE_SIZE;
  const toIndex = fromIndex + PAGE_SIZE - 1;

  const { data: rawJobs, count: totalJobs } = await baseQuery
    .order("created_at", { ascending: false })
    .range(fromIndex, toIndex);

  const totalCount = totalJobs || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;

  // Format data lowongan
  const jobs = (rawJobs || []).map((j) => {
    const companyData = Array.isArray(j.company) ? j.company[0] : j.company;
    let logoUrl: string | null = null;

    if (companyData?.logo_path) {
      const { data: publicUrlData } = supabase.storage
        .from("company-logos")
        .getPublicUrl(companyData.logo_path);
      logoUrl = publicUrlData.publicUrl;
    }

    const jobCity = j.city
      ? Array.isArray(j.city)
        ? j.city[0]
        : j.city
      : null;

    const jobProvince = jobCity?.province
      ? Array.isArray(jobCity.province)
        ? jobCity.province[0]
        : jobCity.province
      : null;

    const companyCity = companyData?.city
      ? Array.isArray(companyData.city)
        ? companyData.city[0]
        : companyData.city
      : null;

    const companyProvince = companyCity?.province
      ? Array.isArray(companyCity.province)
        ? companyCity.province[0]
        : companyCity.province
      : null;

    const resolvedCityName = jobCity?.name || companyCity?.name || null;
    const resolvedProvinceName = jobProvince?.name || companyProvince?.name || null;

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
            logoUrl,
            cityName: resolvedCityName,
            provinceName: resolvedProvinceName,
          }
        : null,
    };
  });

  return (
    <div className="min-h-screen bg-[#FAF8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Halaman */}
        <CatalogHeader totalCount={totalCount} />

        {/* Tata Letak Dua Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Kolom Kiri: Sidebar Filter */}
          <div className="lg:col-span-1">
            <FilterPanel
              categories={categories || []}
              provinces={provinces || []}
              cities={cities || []}
              selectedCategory={categorySlug}
              selectedJobType={jobTypeParam}
              selectedWorkMode={workModeParam}
              selectedProvince={provinceSlug}
              selectedCity={citySlug}
            />
          </div>

          {/* Kolom Kanan: Katalog Lowongan */}
          <div className="lg:col-span-3 space-y-6">
            <SearchBar placeholder="Cari posisi kerja, keahlian, atau profesi..." />

            <div className="flex items-center justify-between gap-4 border-b border-black/[0.08] pb-3">
              <CatalogMetaCount currentCount={jobs.length} totalCount={totalCount} />
            </div>

            {jobs.length === 0 ? (
              <CatalogEmptyState
                provinceName={foundProv?.name}
                cityName={selectedCityId ? cities.find((c) => c.id === selectedCityId)?.name : undefined}
              />
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    hideBookmark={isCompanyOrAdmin}
                  />
                ))}

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  pageSize={PAGE_SIZE}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
