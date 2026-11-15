import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  calculateAge,
  EDUCATION_LEVEL_OPTIONS,
  type PortfolioItem,
} from "@/lib/validation/profil";
import { PrintCvClient } from "./PrintCvClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cetak CV Profil Resmi - JobConnect",
  description:
    "Cetak atau unduh dokumen resume PDF terstandarisasi ATS dari data profil pelamar JobConnect.",
};

export default async function CetakCvPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/profil/cetak-cv");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      email,
      phone,
      headline,
      birth_date,
      education_level,
      education_institution,
      bio,
      linkedin_url,
      portfolio_url,
      portfolios,
      city_id,
      province_id
    `)
    .eq("id", user.id)
    .single();

  let locationText: string | null = null;
  if (profile?.city_id) {
    const { data: cityData } = await supabase
      .from("cities")
      .select("name, type, provinces:province_id(name)")
      .eq("id", profile.city_id)
      .maybeSingle();
    if (cityData) {
      const typeStr = cityData.type === "kota" ? "Kota" : "Kab.";
      const provName = (cityData.provinces as { name: string } | null)?.name;
      locationText = `${typeStr} ${cityData.name}${provName ? `, ${provName}` : ""}`;
    }
  } else if (profile?.province_id) {
    const { data: provData } = await supabase
      .from("provinces")
      .select("name")
      .eq("id", profile.province_id)
      .maybeSingle();
    if (provData) {
      locationText = provData.name;
    }
  }

  const eduLabel =
    EDUCATION_LEVEL_OPTIONS.find((e) => e.value === profile?.education_level)?.label ||
    profile?.education_level ||
    null;

  const age = calculateAge(profile?.birth_date);

  return (
    <PrintCvClient
      profile={{
        name: profile?.name || "Pelamar JobConnect",
        email: profile?.email || user.email || "",
        phone: profile?.phone || null,
        headline: profile?.headline || null,
        birthDate: profile?.birth_date || null,
        age,
        educationLevel: eduLabel,
        educationInstitution: profile?.education_institution || null,
        locationText,
        bio: profile?.bio || null,
        linkedinUrl: profile?.linkedin_url || null,
        portfolioUrl: profile?.portfolio_url || null,
        portfolios: ((profile?.portfolios as PortfolioItem[]) || []).filter(Boolean),
      }}
    />
  );
}
