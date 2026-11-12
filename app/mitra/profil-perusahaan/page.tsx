import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Building2, ShieldCheck, ChevronRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  updateProfilPerusahaanAction,
  uploadCompanyLogoAction,
  deleteCompanyLogoAction,
} from "@/app/actions/mitra";
import { LogoUpload } from "./LogoUpload";
import {
  ProfilPerusahaanForm,
  type ProfilPerusahaanData,
  type ProvinceOption,
  type CityOption,
} from "./ProfilPerusahaanForm";
import { checkCompanyVerification } from "@/lib/validation/profil";
import { getCompanyLogo } from "@/lib/company-logo";

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
  const verification = checkCompanyVerification({
    ...companyData,
    logoUrl: effectiveLogo,
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl">
      {/* Banner Onboarding untuk Mitra Baru */}
      {isOnboarding && (
        <div className="p-6 rounded-3xl bg-navy-950 text-white border border-navy-800 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-navy-950 text-xs font-bold">
            <span>Langkah Pertama Mitra Perusahaan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Selamat Datang di Portal Mitra JobConnect
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            Untuk melindungi pencari kerja dari lowongan fiktif dan calo liar, JobConnect menerapkan standar verifikasi ketat.
            Setiap perusahaan mitra <strong>wajib mengisi data operasional nyata</strong> serta <strong>mengunggah logo resmi perusahaan</strong> sebelum dapat memasang lowongan.
          </p>
        </div>
      )}

      {/* Banner Peringatan jika dialihkan karena mencoba pasang lowongan sebelum verifikasi */}
      {isRequiredWarning && !verification.isComplete && (
        <div
          role="alert"
          className="p-5 rounded-3xl bg-amber-50 border border-amber-300 text-amber-950 shadow-xs space-y-2"
        >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" aria-hidden="true" />
              <h2 className="text-sm font-bold">
                Akses Pasang Lowongan Terkunci Sementara
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              Anda belum dapat mempublikasikan lowongan pekerjaan baru. Harap lengkapi seluruh profil data perusahaan nyata dan pastikan logo resmi perusahaan telah diunggah di bawah ini.
            </p>
          </div>
        )}

        {/* Header Profil Perusahaan & Status Verifikasi */}
        <div className="bg-white rounded-3xl border border-black/[0.08] shadow-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-card bg-white text-navy-900 font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-xs border-2 border-slate-200 overflow-hidden">
                {effectiveLogo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={effectiveLogo}
                    alt={`Logo ${companyData.name}`}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" aria-hidden="true" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-navy-950 tracking-tight">
                    {companyData.name}
                  </h1>
                  {verification.isComplete ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                      <span>Terverifikasi Resmi</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                      <span>Wajib Lengkapi Bukti & Logo</span>
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  {companyData.industry || "Bidang industri belum ditentukan"}
                </p>
              </div>
            </div>

            {/* Quick Action ke Dashboard jika sudah terverifikasi */}
            {verification.isComplete && (
              <Link
                href="/mitra/lowongan/tambah"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-control bg-navy-900 text-white hover:bg-navy-800 text-xs font-bold transition shadow-xs"
              >
                <span>Pasang Lowongan Baru</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>

          {/* Indikator Kelayakan Verifikasi Perusahaan Nyata */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
              <span>Kelengkapan Bukti Perusahaan Nyata</span>
              <span className={verification.isComplete ? "text-emerald-700 font-bold" : "text-amber-700"}>
                {verification.completedCount} dari {verification.totalRequired} Persyaratan Terpenuhi
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  verification.isComplete ? "bg-emerald-600" : "bg-amber-500"
                }`}
                style={{
                  width: `${(verification.completedCount / verification.totalRequired) * 100}%`,
                }}
              />
            </div>

            {!verification.isComplete && (
              <div className="mt-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Perlu dilengkapi: </span>
                <span>{verification.missingFields.join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Formulir Profil Perusahaan */}
        <ProfilPerusahaanForm
          initialData={companyData}
          provinces={provinces}
          cities={cities}
          onSave={updateProfilPerusahaanAction}
          logoUploadComponent={
            <LogoUpload
              initialLogoUrl={effectiveLogo}
              companyName={companyData.name}
              onUploadAction={uploadCompanyLogoAction}
              onDeleteAction={deleteCompanyLogoAction}
            />
          }
        />
      </div>
  );
}

