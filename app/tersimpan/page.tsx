import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { JobCard, type JobCardData } from "@/components/lowongan/JobCard";
import type { JobType, WorkMode, EducationMin } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Lowongan Tersimpan - JobConnect",
  description:
    "Daftar lowongan pekerjaan yang Anda simpan untuk referensi dan pengajuan lamaran di JobConnect.",
};

export default async function TersimpanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/tersimpan");
  }

  // Mengambil seluruh lowongan tersimpan milik pengguna yang sedang login
  const { data: savedRows, error } = await supabase
    .from("saved_jobs")
    .select(`
      job_id,
      created_at,
      job:jobs (
        id,
        title,
        slug,
        job_type,
        work_mode,
        education_min,
        experience_min_years,
        skills,
        summary,
        salary_min,
        salary_max,
        status,
        is_demo,
        created_at,
        company:companies (
          id,
          name,
          slug,
          logo_path,
          city:cities (
            name,
            province:provinces (name)
          )
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F0] py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <ErrorState
            title="Gagal Memuat Lowongan Tersimpan"
            message={
              error.message ||
              "Terjadi gangguan koneksi saat mengambil daftar lowongan tersimpan Anda."
            }
            actionLabel="Muat Ulang Halaman"
            actionHref="/tersimpan"
          />
        </div>
      </div>
    );
  }

  // Filter baris yang memiliki objek lowongan valid (mengabaikan jika lowongan telah dihapus)
  const validSavedItems = (savedRows || []).filter(
    (row) => row.job !== null && typeof row.job === "object"
  );

  // Transformasi data relasi menjadi format JobCardData
  const jobCards: JobCardData[] = validSavedItems.map((row) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawJob = row.job as any;
    const rawCompany = Array.isArray(rawJob.company)
      ? rawJob.company[0]
      : rawJob.company;
    const rawCity = rawCompany?.city
      ? Array.isArray(rawCompany.city)
        ? rawCompany.city[0]
        : rawCompany.city
      : null;
    const rawProvince = rawCity?.province
      ? Array.isArray(rawCity.province)
        ? rawCity.province[0]
        : rawCity.province
      : null;

    let logoUrl: string | null = null;
    if (rawCompany?.logo_path) {
      const { data: publicUrlData } = supabase.storage
        .from("company-logos")
        .getPublicUrl(rawCompany.logo_path);
      logoUrl = publicUrlData.publicUrl;
    }

    return {
      id: rawJob.id,
      title: rawJob.title,
      slug: rawJob.slug,
      workMode: rawJob.work_mode as WorkMode,
      jobType: rawJob.job_type as JobType,
      educationMin: rawJob.education_min as EducationMin,
      experienceMinYears: rawJob.experience_min_years,
      skills: rawJob.skills || [],
      summary: rawJob.summary,
      salaryMin: rawJob.salary_min,
      salaryMax: rawJob.salary_max,
      isDemo: rawJob.is_demo,
      createdAt: rawJob.created_at,
      company: rawCompany
        ? {
            id: rawCompany.id,
            name: rawCompany.name,
            slug: rawCompany.slug,
            logoUrl,
            cityName: rawCity?.name || null,
            provinceName: rawProvince?.name || null,
          }
        : null,
    };
  });

  return (
    <div className="min-h-screen bg-[#FAF8F0] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header Halaman */}

        {/* Header Halaman */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                <Bookmark className="w-3.5 h-3.5 fill-[#FFDD00] text-amber-800" aria-hidden="true" />
                <span>Bookmark Pelamar</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
                Lowongan Tersimpan
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                Koleksi peluang karir yang Anda tandai. Buka detail posisi dan ajukan berkas lamaran Anda sebelum batas waktu berakhir.
              </p>
            </div>

            {jobCards.length > 0 && (
              <div className="self-start sm:self-center px-4 py-2 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                <span>{jobCards.length} Lowongan Tersimpan</span>
              </div>
            )}
          </div>
        </div>

        {/* Konten Utama */}
        {jobCards.length === 0 ? (
          <div className="bg-white rounded-card border border-slate-200 p-8 sm:p-12 shadow-2xs">
            <EmptyState
              title="Belum ada lowongan tersimpan."
              description="Simpan lowongan pekerjaan yang menarik minat Anda agar mudah ditemukan dan diajukan kapan saja."
              icon={<Bookmark className="w-6 h-6 text-slate-400" />}
              action={{
                label: "Cari Lowongan",
                href: "/lowongan",
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobCards.map((job) => (
              <JobCard key={job.id} job={job} isBookmarked={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
