import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { type JobFormData } from "@/components/mitra/JobForm";
import { MitraEditJobView } from "@/components/mitra/MitraEditJobView";
import type { WorkMode, JobType, EducationMin } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Edit Lowongan - Dashboard Mitra",
  description: "Perbarui kriteria dan informasi lowongan kerja perusahaan mitra JobConnect.",
};

interface EditLowonganPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditLowonganPage({
  params,
}: EditLowonganPageProps) {
  const { id } = await params;
  const jobId = Number(id);

  if (!jobId || isNaN(jobId)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/mitra/lowongan/${jobId}/edit`);
  }

  // Cek peran perusahaan
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "company") {
    redirect("/403");
  }

  // Ambil data perusahaan
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect("/mitra");
  }

  // Ambil data lowongan
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      summary,
      category_id,
      city_id,
      location_detail,
      work_mode,
      job_type,
      education_min,
      experience_min_years,
      skills,
      responsibilities,
      nice_to_have,
      benefits,
      salary_min,
      salary_max,
      deadline,
      ai_screening,
      status,
      review_note,
      city:cities (
        id,
        province_id
      )
    `
    )
    .eq("id", jobId)
    .eq("company_id", company.id)
    .maybeSingle();

  if (jobError || !job) {
    notFound();
  }

  // Ambil daftar kategori, provinsi, dan kota
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const { data: provincesData } = await supabase
    .from("provinces")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: citiesData } = await supabase
    .from("cities")
    .select("id, province_id, name, type")
    .order("name", { ascending: true });

  const categories = categoriesData || [];
  const provinces = provincesData || [];
  const cities = citiesData || [];

  // Tentukan provinceId berdasarkan kota lowongan jika ada
  let initialProvinceId: number | "" = "";
  const cityData = Array.isArray(job.city) ? job.city[0] : job.city;
  if (cityData?.province_id) {
    initialProvinceId = cityData.province_id;
  }

  const initialData: Partial<JobFormData> = {
    id: job.id,
    title: job.title,
    summary: job.summary || "",
    categoryId: job.category_id || "",
    provinceId: initialProvinceId,
    cityId: job.city_id || "",
    locationDetail: job.location_detail || "",
    workMode: job.work_mode as WorkMode,
    jobType: job.job_type as JobType,
    educationMin: job.education_min as EducationMin,
    experienceMinYears: job.experience_min_years,
    skills: job.skills || [],
    responsibilities: job.responsibilities || [],
    niceToHave: job.nice_to_have || [],
    benefits: job.benefits || [],
    salaryMin: job.salary_min ?? "",
    salaryMax: job.salary_max ?? "",
    deadline: job.deadline || "",
    aiScreening: job.ai_screening,
  };

  return (
    <MitraEditJobView
      job={{
        id: job.id,
        title: job.title,
        status: job.status,
        review_note: job.review_note,
      }}
      categories={categories}
      provinces={provinces}
      cities={cities}
      initialData={initialData}
    />
  );
}
