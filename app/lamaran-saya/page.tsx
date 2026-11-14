import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  LamaranListWithTabs,
  type ApplicationItem,
} from "@/components/lamaran/LamaranListWithTabs";
import { calculateSlaStatus } from "@/lib/sla";

export const metadata: Metadata = {
  title: "Lamaran Saya",
  description:
    "Pantau status pengajuan berkas, riwayat lamaran, dan pembaruan seleksi kerja Anda di JobConnect.",
};

export default async function LamaranSayaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/lamaran-saya");
  }

  const { data: applications, error } = await supabase
    .from("applications")
    .select(
      `
      id,
      job_id,
      cv_path,
      cover_letter,
      status,
      ai_consent,
      message_to_applicant,
      interview_at,
      interview_place,
      created_at,
      updated_at,
      job:jobs (
        id,
        title,
        slug,
        job_type,
        work_mode,
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
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F0] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <ErrorState
            title="Gagal Memuat Riwayat Lamaran"
            message={
              error.message ||
              "Terjadi gangguan saat memuat data lamaran. Silakan coba kembali."
            }
          />
        </div>
      </div>
    );
  }

  const applicationList = applications || [];

  // Format data aplikasi dengan url logo
  const processedApplications: ApplicationItem[] = applicationList.map((app) => {
    const jobData = Array.isArray(app.job) ? app.job[0] : app.job;
    const companyData = jobData?.company
      ? Array.isArray(jobData.company)
        ? jobData.company[0]
        : jobData.company
      : null;
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

    let logoUrl: string | null = null;
    if (companyData?.logo_path) {
      const { data: publicUrlData } = supabase.storage
        .from("company-logos")
        .getPublicUrl(companyData.logo_path);
      logoUrl = publicUrlData.publicUrl;
    }

    const { remainingDays: slaRemainingDays } = calculateSlaStatus(app.created_at);

    return {
      id: app.id,
      job_id: app.job_id,
      status: app.status,
      ai_consent: app.ai_consent,
      message_to_applicant: app.message_to_applicant,
      interview_at: app.interview_at,
      interview_place: app.interview_place,
      created_at: app.created_at,
      updated_at: app.updated_at,
      logoUrl,
      slaRemainingDays,
      job: {
        id: jobData?.id || 0,
        title: jobData?.title || "Lowongan Pekerjaan",
        slug: jobData?.slug || "",
        job_type: jobData?.job_type || "",
        work_mode: jobData?.work_mode || "",
        company: {
          id: companyData?.id || 0,
          name: companyData?.name || "Perusahaan Mitra",
          slug: companyData?.slug || "",
          logo_path: companyData?.logo_path || null,
          city: cityData
            ? {
                name: cityData.name,
                province: provinceData ? { name: provinceData.name } : undefined,
              }
            : undefined,
        },
      },
    };
  });

  return (
    <div className="min-h-screen bg-[#FAF8F0] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Halaman */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10 shadow-2xs">
            <Briefcase className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>Portofolio Lamaran Kerja</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
                Riwayat Lamaran Saya
              </h1>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Pantau progres peninjauan berkas, undangan wawancara, dan keputusan resmi dari perusahaan mitra.
              </p>
            </div>
            {processedApplications.length > 0 && (
              <Link
                href="/lowongan"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F2D200] text-black font-bold text-xs transition border border-black/10 shadow-2xs self-start sm:self-auto min-h-[44px]"
              >
                <span>Cari Lowongan Lain</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>

        {/* Komponen Daftar Lamaran dengan Tab Status Bersih */}
        <LamaranListWithTabs applications={processedApplications} />
      </div>
    </div>
  );
}
