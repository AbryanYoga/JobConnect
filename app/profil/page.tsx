import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Calendar, ShieldCheck, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  updateProfilPelamarAction,
  uploadAvatarAction,
  deleteAvatarAction,
} from "@/app/actions/profil";
import { AvatarUpload } from "@/components/profil/AvatarUpload";
import { ProfilForm } from "./ProfilForm";
import type { PortfolioItem } from "@/lib/validation/profil";

export const metadata: Metadata = {
  title: "Profil & Biodata Saya",
  description:
    "Kelola data pribadi, domisili, umur, riwayat pendidikan, bio, LinkedIn, dan portofolio proyek akun pelamar di JobConnect.",
};

interface ProfilPageProps {
  searchParams?: Promise<{
    onboarding?: string;
  }>;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDateIndo(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export default async function ProfilPage({ searchParams }: ProfilPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isOnboarding = resolvedSearchParams.onboarding === "true";

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
  const createdAt = profile?.created_at
    ? formatDateIndo(profile.created_at)
    : "Terbaru";

  // Nama domisili untuk kartu header jika sudah dipilih
  const selectedCity = cities.find((c) => c.id === cityId);
  const selectedProvince = provinces.find((p) => p.id === provinceId);
  const domicileString = selectedCity
    ? `${selectedCity.type === "kota" ? "Kota" : "Kab."} ${selectedCity.name}${
        selectedProvince ? `, ${selectedProvince.name}` : ""
      }`
    : selectedProvince?.name || null;

  return (
    <div className="min-h-screen bg-[#FAF8F0] py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Header Profil (Gaya Landing Page BMC) */}
        <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={`Foto profil ${name}`}
                  width={80}
                  height={80}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0 shadow-xs border-2 border-black/10"
                  unoptimized
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0D0C23] text-white font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-xs border-2 border-black/10 select-none">
                  {getInitials(name)}
                </div>
              )}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-black text-black tracking-tight">
                    {name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FFDD00] text-black text-xs font-bold border border-black/10 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-black" aria-hidden="true" />
                    <span>Akun Pelamar</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">{email}</p>
                {headline && (
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 pt-0.5">
                    {headline}
                  </p>
                )}
                {domicileString && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>{domicileString}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600 bg-[#FAF8F0] px-3.5 py-1.5 rounded-full border border-black/[0.08] shrink-0 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span>Bergabung {createdAt}</span>
            </div>
          </div>
        </div>

        {/* Formulir Lengkap Profil, Biodata, Domisili & Portofolio */}
        <ProfilForm
          initialData={{
            name,
            email,
            phone,
            headline,
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
          }}
          provinces={provinces}
          cities={cities}
          isOnboarding={isOnboarding}
          avatarUploadComponent={
            <AvatarUpload
              initialAvatarUrl={avatarUrl}
              name={name}
              onUploadAction={uploadAvatarAction}
              onDeleteAction={deleteAvatarAction}
            />
          }
          onSave={updateProfilPelamarAction}
        />
      </div>
    </div>
  );
}
