import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DetailLamaranView } from "@/components/lamaran/DetailLamaranView";
import { getCompanyInitials } from "@/lib/company-logo";

interface DetailLamaranPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: DetailLamaranPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Detail Lamaran #${id}`,
    description: "Detail informasi status, berkas, dan timeline proses lamaran kerja di JobConnect.",
  };
}

export default async function DetailLamaranPage({ params }: DetailLamaranPageProps) {
  const { id } = await params;
  const applicationId = Number(id);

  if (!applicationId || isNaN(applicationId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/lamaran-saya/${id}`);
  }

  // 1. Ambil data detail lamaran
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select(
      `
      id,
      job_id,
      user_id,
      cv_path,
      cover_letter,
      status,
      ai_consent,
      message_to_applicant,
      interview_at,
      interview_place,
      decided_at,
      created_at,
      updated_at,
      job:jobs (
        id,
        title,
        slug,
        job_type,
        work_mode,
        education_min,
        experience_min_years,
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
    .eq("id", applicationId)
    .single();

  if (appError || !application) {
    notFound();
  }

  // Keamanan: hanya pemilik lamaran yang boleh melihat halaman ini
  if (application.user_id !== user.id) {
    notFound();
  }

  // 2. Ambil riwayat timeline perubahan status
  const { data: statusHistory } = await supabase
    .from("application_status_history")
    .select("id, from_status, to_status, note, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  const jobData = Array.isArray(application.job) ? application.job[0] : application.job;
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

  const companyName = companyData?.name || "Perusahaan Mitra";
  const companyInitials = getCompanyInitials(companyName);
  const locationText =
    [cityData?.name, provinceData?.name].filter(Boolean).join(", ") ||
    (jobData?.work_mode === "remote" ? "Kerja Remote" : "Indonesia");

  let logoUrl: string | null = null;
  if (companyData?.logo_path) {
    const { data: publicUrlData } = supabase.storage
      .from("company-logos")
      .getPublicUrl(companyData.logo_path);
    logoUrl = publicUrlData.publicUrl;
  }

  const historyList = statusHistory || [];

  return (
    <div className="min-h-screen bg-[#FAF8F0] py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <DetailLamaranView
          application={{
            id: application.id,
            status: application.status,
            created_at: application.created_at,
            interview_at: application.interview_at,
            interview_place: application.interview_place,
            message_to_applicant: application.message_to_applicant,
            ai_consent: application.ai_consent,
            cover_letter: application.cover_letter,
          }}
          jobData={
            jobData
              ? {
                  title: jobData.title,
                  slug: jobData.slug,
                }
              : null
          }
          companyName={companyName}
          companyInitials={companyInitials}
          locationText={locationText}
          logoUrl={logoUrl}
          historyList={historyList}
          companySlug={companyData?.slug || null}
        />
      </div>
    </div>
  );
}
