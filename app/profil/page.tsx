import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  updateProfilPelamarAction,
  uploadAvatarAction,
  deleteAvatarAction,
  uploadDefaultCvAction,
  deleteDefaultCvAction,
} from "@/app/actions/profil";
import { AvatarUpload } from "@/components/profil/AvatarUpload";
import { DefaultCvManager } from "@/components/profil/DefaultCvManager";
import { ProfilViewWrapper } from "@/components/profil/ProfilViewWrapper";
import type { PortfolioItem } from "@/lib/validation/profil";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Profil & Biodata Saya",
  description:
    "Kelola data pribadi, domisili, umur, riwayat pendidikan, bio, LinkedIn, dan portofolio proyek akun pelamar di JobConnect.",
};

interface ProfilPageProps {
  searchParams?: Promise<{
    onboarding?: string;
    edit?: string;
  }>;
}

export default async function ProfilPage({ searchParams }: ProfilPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isOnboarding = resolvedSearchParams.onboarding === "true";
  const isEditMode = isOnboarding || resolvedSearchParams.edit === "true";

  let user = null;
  let profile = null;
  let provinces: { id: number; name: string; slug: string }[] = [];
  let cities: { id: number; name: string; province_id: number; type: string }[] = [];

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      redirect("/login?redirectTo=/profil");
    }

    user = authUser;

    // Ambil daftar provinsi dan kota/kabupaten secara paralel
    const [provincesRes, citiesRes] = await Promise.all([
      supabase.from("provinces").select("id, name, slug").order("name"),
      supabase.from("cities").select("id, name, province_id, type").order("name"),
    ]);

    provinces = (provincesRes.data as { id: number; name: string; slug: string }[]) || [];
    cities = (citiesRes.data as { id: number; name: string; province_id: number; type: string }[]) || [];

    // Coba ambil seluruh data kolom profil termasuk biodata & portofolio baru
    const { data: fullProfileData, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id,
        name,
        email,
        phone,
        headline,
        role,
        avatar_url,
        province_id,
        city_id,
        birth_date,
        education_level,
        education_institution,
        bio,
        linkedin_url,
        portfolio_url,
        portfolios,
        email_notifications,
        created_at
      `)
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !fullProfileData) {
      // Fallback untuk schema dasar jika migration baru belum dieksekusi di database
      const { data: basicProfileData } = await supabase
        .from("profiles")
        .select("id, name, email, phone, headline, role, avatar_url, email_notifications, created_at")
        .eq("id", user.id)
        .maybeSingle();
      profile = basicProfileData;
    } else {
      profile = fullProfileData;
    }
  } catch (err: unknown) {
    // Jika redirect next/navigation terpanggil, teruskan throw agar redirect bekerja
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }

    profile = null;
  }

  const name = profile?.name || "Pelamar JobConnect";
  const email = profile?.email || user?.email || "pelamar@jobconnect.id";
  const phone = profile?.phone || null;
  const headline = profile?.headline || null;
  const avatarUrl = profile?.avatar_url || null;
  const provinceId = (profile as { province_id?: number | null })?.province_id ?? null;
  const cityId = (profile as { city_id?: number | null })?.city_id ?? null;
  const birthDate = (profile as { birth_date?: string | null })?.birth_date ?? null;
  const educationLevel = (profile as { education_level?: string | null })?.education_level ?? null;
  const educationInstitution = (profile as { education_institution?: string | null })?.education_institution ?? null;
  const bio = (profile as { bio?: string | null })?.bio ?? null;
  const linkedinUrl = (profile as { linkedin_url?: string | null })?.linkedin_url ?? null;
  const portfolioUrl = (profile as { portfolio_url?: string | null })?.portfolio_url ?? null;
  const portfolios = ((profile as { portfolios?: PortfolioItem[] | null })?.portfolios as PortfolioItem[]) || [];
  const emailNotifications = profile?.email_notifications ?? true;

  // Cek keberadaan berkas CV utama pada storage privat pelamar
  let defaultCvUrl: string | null = null;
  let defaultCvUpdatedAt: string | null = null;
  if (user) {
    try {
      const supabase = await createClient();
      const { data: cvFiles } = await supabase.storage.from("cvs").list(user.id, {
        search: "default-cv.pdf",
      });
      const file = cvFiles?.find((f) => f.name === "default-cv.pdf");
      if (file) {
        const { data: signedData } = await supabase.storage
          .from("cvs")
          .createSignedUrl(`${user.id}/default-cv.pdf`, 3600);
        defaultCvUrl = signedData?.signedUrl || null;
        defaultCvUpdatedAt = file.updated_at || file.created_at || null;
      }
    } catch {
      // Fallback diam jika storage belum siap
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F0] py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ProfilViewWrapper
          initialData={{
            name,
            email,
            phone,
            headline,
            avatarUrl,
            provinceId,
            cityId,
            birthDate,
            educationLevel,
            educationInstitution,
            bio,
            linkedinUrl,
            portfolioUrl,
            portfolios,
            emailNotifications,
            createdAtRaw: profile?.created_at || null,
          }}
          provinces={provinces}
          cities={cities}
          isOnboarding={isOnboarding}
          initialIsEditing={isEditMode}
          avatarUploadComponent={
            <AvatarUpload
              key="applicant-avatar-upload"
              initialAvatarUrl={avatarUrl}
              name={name}
              onUploadAction={uploadAvatarAction}
              onDeleteAction={deleteAvatarAction}
            />
          }
          defaultCvManagerComponent={
            <DefaultCvManager
              key="applicant-default-cv"
              initialCvUrl={defaultCvUrl}
              initialUpdatedAt={defaultCvUpdatedAt}
              onUploadAction={uploadDefaultCvAction}
              onDeleteAction={deleteDefaultCvAction}
            />
          }
          onSave={updateProfilPelamarAction}
        />
      </div>
    </div>
  );
}
