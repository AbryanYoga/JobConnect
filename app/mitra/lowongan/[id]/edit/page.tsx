import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { JobForm, type JobFormData } from "@/components/mitra/JobForm";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Edit3,
} from "lucide-react";
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
    <div className="space-y-8">
      {/* Breadcrumb Navigasi */}
      <Breadcrumb
        items={[
          { label: "Beranda", href: "/" },
          { label: "Mitra", href: "/mitra" },
          { label: "Kelola Lowongan", href: "/mitra/lowongan" },
          { label: `Edit: ${job.title}` },
        ]}
      />

      {/* Header Halaman Edit */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shadow-2xs">
              <Edit3 className="w-4 h-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Edit Lowongan Kerja
            </h1>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              job.status === "open"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : job.status === "pending"
                ? "bg-amber-50 text-amber-900 border-amber-300"
                : job.status === "rejected"
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-slate-100 text-slate-800 border-slate-300"
            }`}
          >
            Status Saat Ini: {job.status.toUpperCase()}
          </span>
        </div>

        <p className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
          Perbarui kriteria atau detail lowongan. Anda dapat menyimpannya kembali sebagai draft atau mengajukannya langsung ke admin moderator.
        </p>

        {/* Peringatan jika status rejected */}
        {job.status === "rejected" && job.review_note && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-3 font-medium mt-3"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <span className="font-bold block">Alasan Penolakan oleh Admin Sebelumnya:</span>
              <p className="leading-relaxed">{job.review_note}</p>
              <p className="text-xs text-red-700 pt-1">
                Silakan sesuaikan kriteria di bawah ini sesuai masukan admin, lalu klik &quot;Ajukan Lowongan&quot; untuk meninjau ulang.
              </p>
            </div>
          </div>
        )}

        {/* Info jika status pending */}
        {job.status === "pending" && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm flex items-start gap-3 font-medium mt-3"
          >
            <Clock className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <span className="font-bold block">Lowongan Sedang Dalam Antrean Review Admin:</span>
              <p className="leading-relaxed">
                Menyimpan perubahan saat ini akan memperbarui berkas yang ditinjau oleh tim moderator platform.
              </p>
            </div>
          </div>
        )}

        {/* Info jika status open */}
        {job.status === "open" && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm flex items-start gap-3 font-medium mt-3"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-700 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <span className="font-bold block">Lowongan Sedang Tayang Aktif:</span>
              <p className="leading-relaxed">
                Anda dapat memperbarui batas waktu lamaran, ringkasan, atau benefit pekerjaan ini.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Formulir Edit Lowongan */}
      <JobForm
        categories={categories}
        provinces={provinces}
        cities={cities}
        initialData={initialData}
        isEditing={true}
      />
    </div>
  );
}
