import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Building2, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  ProfilPerusahaanForm,
  type ProfilPerusahaanData,
  type ProvinceOption,
  type CityOption,
} from "./ProfilPerusahaanForm";

export const metadata: Metadata = {
  title: "Profil Perusahaan",
  description:
    "Kelola identitas, bidang industri, domisili kantor, dan profil perusahaan mitra di JobConnect.",
};

export default async function ProfilPerusahaanPage() {
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

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Navigasi Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link
            href="/mitra"
            className="hover:text-navy-900 transition-colors focus-visible:outline-2 focus-visible:outline-navy-600 rounded-xs"
          >
            Dashboard Mitra
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span className="text-slate-800 font-medium" aria-current="page">
            Profil Perusahaan
          </span>
        </nav>

        {/* Header Profil Perusahaan */}
        <div className="bg-white rounded-card border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-card bg-navy-700 text-white font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-xs border-2 border-white ring-2 ring-navy-100">
                <Building2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-navy-950 tracking-tight">
                    {companyData.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-800 text-xs font-medium border border-navy-100">
                    <ShieldCheck className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
                    <span>Mitra Perusahaan</span>
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  {companyData.industry || "Bidang industri belum ditentukan"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulir Profil Perusahaan */}
        <ProfilPerusahaanForm
          initialData={companyData}
          provinces={provinces}
          cities={cities}
        />
      </div>
    </div>
  );
}
