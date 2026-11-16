import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { JobForm } from "@/components/mitra/JobForm";
import { checkCompanyVerification } from "@/lib/validation/profil";
import { getCompanyLogo } from "@/lib/company-logo";

export const metadata: Metadata = {
  title: "Pasang Lowongan Baru - Dashboard Mitra",
  description: "Formulir pengajuan lowongan pekerjaan resmi terstruktur mitra JobConnect.",
};

export default async function TambahLowonganPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/mitra/lowongan/tambah");
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

  // Cek kelengkapan bukti perusahaan nyata dan logo
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, city_id, logo_path, industry, size, website, address_note, description")
    .eq("owner_id", user.id)
    .maybeSingle();

  const fallbackLogo = company?.name ? getCompanyLogo(company.name) : null;
  const effectiveLogo = company?.logo_path || fallbackLogo;

  const verification = checkCompanyVerification({
    ...company,
    logoUrl: effectiveLogo,
  });

  if (!verification.isComplete) {
    redirect("/mitra/profil-perusahaan?required=verification");
  }

  // Ambil daftar kategori dari database
  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const categories = categoriesData || [];

  // Ambil daftar provinsi dan kota resmi untuk dropdown berjenjang
  const { data: provincesData } = await supabase
    .from("provinces")
    .select("id, name")
    .order("name", { ascending: true });

  const { data: citiesData } = await supabase
    .from("cities")
    .select("id, province_id, name, type")
    .order("name", { ascending: true });

  const provinces = provincesData || [];
  const cities = citiesData || [];

  return (
    <div className="space-y-8">
      {/* Form Kriteria Terstruktur dengan Lokasi Berjenjang & Header Bilingual */}
      <JobForm categories={categories} provinces={provinces} cities={cities} showHeader={true} />
    </div>
  );
}
