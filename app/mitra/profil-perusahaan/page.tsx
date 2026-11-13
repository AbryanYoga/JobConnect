import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  updateProfilPerusahaanAction,
  uploadCompanyLogoAction,
  deleteCompanyLogoAction,
} from "@/app/actions/mitra";
import {
  type ProfilPerusahaanData,
  type ProvinceOption,
  type CityOption,
} from "./ProfilPerusahaanForm";
import { ProfilPerusahaanViewWrapper } from "./ProfilPerusahaanViewWrapper";
import { getCompanyLogo } from "@/lib/company-logo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Profil Perusahaan & Verifikasi Mitra",
  description:
    "Lengkapi identitas, bukti eksistensi nyata, domisili operasional, dan logo resmi perusahaan mitra di JobConnect.",
};

interface ProfilPerusahaanPageProps {
  searchParams?: Promise<{
    onboarding?: string;
    required?: string;
  }>;
}

export default async function ProfilPerusahaanPage({
  searchParams,
}: ProfilPerusahaanPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const isOnboarding = resolvedParams.onboarding === "true";
  const isRequiredWarning = resolvedParams.required === "verification";

  let user = null;
  let companyData: ProfilPerusahaanData = {
    name: "Perusahaan Mitra",
    website: null,
    industry: null,
    size: null,
    provinceId: null,
    cityId: null,
    addressNote: null,
    description: null,
    logoPath: null,
  };
  let provinces: ProvinceOption[] = [];
  let cities: CityOption[] = [];
  let logoUrl: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      redirect("/login?redirectTo=/mitra/profil-perusahaan");
    }

    user = authUser;

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "company") {
      redirect("/profil");
    }

    // Ambil data perusahaan jika sudah ada
    const { data: company } = await supabase
      .from("companies")
      .select("id, name, website, industry, size, city_id, address_note, description, logo_path")
      .eq("owner_id", user.id)
      .maybeSingle();

    // Ambil daftar provinsi dan kota untuk dropdown berjenjang
    const { data: provincesData } = await supabase
      .from("provinces")
      .select("id, name")
      .order("name");

    const { data: citiesData } = await supabase
      .from("cities")
      .select("id, province_id, name, type")
      .order("name");

    if (provincesData) provinces = provincesData;
    if (citiesData) cities = citiesData;

    if (company) {
      const currentCity = cities.find((c) => c.id === company.city_id);
      if (company.logo_path) {
        const { data: publicUrlData } = supabase.storage
          .from("company-logos")
          .getPublicUrl(company.logo_path);
        logoUrl = publicUrlData.publicUrl;
      }

      companyData = {
        name: company.name || profile.name || "",
        website: company.website,
        industry: company.industry,
        size: company.size as ProfilPerusahaanData["size"],
        provinceId: currentCity?.province_id || null,
        cityId: company.city_id,
        addressNote: company.address_note,
        description: company.description,
        logoPath: company.logo_path,
      };
    } else {
      companyData.name = profile.name || "Perusahaan Mitra";
    }
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "digest" in err &&
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }
  }

  const fallbackLogo = getCompanyLogo(companyData.name);
  const effectiveLogo = logoUrl || fallbackLogo;

  return (
    <ProfilPerusahaanViewWrapper
      key={`${companyData.name}-${effectiveLogo || ""}`}
      initialData={companyData}
      provinces={provinces}
      cities={cities}
      initialLogoUrl={effectiveLogo}
      isOnboarding={isOnboarding}
      isRequiredWarning={isRequiredWarning}
      onSave={updateProfilPerusahaanAction}
      onUploadLogoAction={uploadCompanyLogoAction}
      onDeleteLogoAction={deleteCompanyLogoAction}
    />
  );
}

