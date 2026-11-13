"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  MapPin,
  PencilLine,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  ProfilPerusahaanForm,
  type ProfilPerusahaanData,
  type ProvinceOption,
  type CityOption,
} from "./ProfilPerusahaanForm";
import { LogoUpload } from "./LogoUpload";
import { checkCompanyVerification } from "@/lib/validation/profil";
import { COMPANY_SIZE_OPTIONS } from "@/lib/labels";

interface ProfilPerusahaanViewWrapperProps {
  initialData: ProfilPerusahaanData;
  provinces: ProvinceOption[];
  cities: CityOption[];
  initialLogoUrl?: string | null;
  isOnboarding?: boolean;
  isRequiredWarning?: boolean;
  onSave: (
    data: ProfilPerusahaanData
  ) => Promise<{ success: boolean; error?: string }>;
  logoUploadComponent?: React.ReactNode;
  onUploadLogoAction?: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string; publicUrl?: string }>;
  onDeleteLogoAction?: () => Promise<{ success: boolean; error?: string }>;
}

export function ProfilPerusahaanViewWrapper({
  initialData,
  provinces,
  cities,
  initialLogoUrl,
  isOnboarding = false,
  isRequiredWarning = false,
  onSave,
  logoUploadComponent,
  onUploadLogoAction,
  onDeleteLogoAction,
}: ProfilPerusahaanViewWrapperProps) {
  const router = useRouter();
  const { t } = useLanguage();

  const isDataIncomplete =
    !initialData.industry || !initialData.description || !initialData.cityId;

  const [isEditing, setIsEditing] = useState<boolean>(
    isOnboarding || isDataIncomplete
  );
  const [companyData, setCompanyData] = useState<ProfilPerusahaanData>(initialData);
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl || null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Cari domisili kota & provinsi
  const selectedCity = cities.find((c) => c.id === companyData.cityId);
  const selectedProvince = provinces.find((p) => p.id === companyData.provinceId);
  const domicileString = selectedCity
    ? `${selectedCity.type === "kota" ? "Kota" : "Kab."} ${selectedCity.name}${
        selectedProvince ? `, ${selectedProvince.name}` : ""
      }`
    : selectedProvince?.name || null;

  // Ukuran tim
  const sizeLabel = companyData.size
    ? COMPANY_SIZE_OPTIONS[companyData.size] || companyData.size
    : null;

  // Hitung status verifikasi perusahaan
  const verification = checkCompanyVerification({
    ...companyData,
    logoUrl,
  });

  const handleStartEdit = () => {
    setSuccessBanner(null);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveWrapper = async (data: ProfilPerusahaanData) => {
    const res = await onSave(data);
    if (res.success) {
      setCompanyData(data);
      setSuccessBanner(
        t(
          "Profil dan data verifikasi perusahaan berhasil disimpan.",
          "Company profile and verification details were saved successfully."
        )
      );
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.refresh();
    }
    return res;
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl">
      {/* Banner Onboarding untuk Mitra Baru */}
      {isOnboarding && (
        <div className="p-6 rounded-3xl bg-navy-950 text-white border border-navy-800 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-navy-950 text-xs font-bold">
            <span>{t("Langkah Pertama Mitra Perusahaan", "First Step for Employer Partner")}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {t("Selamat Datang di Portal Mitra JobConnect", "Welcome to JobConnect Partner Portal")}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {t(
              "Untuk melindungi pencari kerja dari lowongan fiktif dan calo liar, JobConnect menerapkan standar verifikasi ketat. Setiap perusahaan mitra wajib mengisi data operasional nyata serta mengunggah logo resmi perusahaan sebelum dapat memasang lowongan.",
              "To protect job seekers from fake listings and unauthorized brokers, JobConnect requires strict verification. Every employer partner must fill valid operational data and upload an official company logo before publishing jobs."
            )}
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
              {t("Akses Pasang Lowongan Terkunci Sementara", "Job Posting Access Temporarily Locked")}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            {t(
              "Anda belum dapat mempublikasikan lowongan pekerjaan baru. Harap lengkapi seluruh profil data perusahaan nyata dan pastikan logo resmi perusahaan telah diunggah.",
              "You cannot publish new jobs yet. Please complete all real company profile information and ensure your official company logo is uploaded."
            )}
          </p>
        </div>
      )}

      {/* Pesan Sukses Simpan */}
      {successBanner && !isEditing && (
        <div
          role="alert"
          className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-green-50 border border-green-200 text-green-900 flex items-start gap-3 shadow-2xs"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="font-bold text-sm text-green-950">{successBanner}</p>
        </div>
      )}

      {/* ========================================================
          TAMPILAN 1: MODE RINGKASAN PROFIL PERUSAHAAN (VIEW MODE)
         ======================================================== */}
      {!isEditing ? (
        <div className="space-y-6">
          {/* Header Profil Perusahaan & Status Verifikasi */}
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-navy-900 font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-xs border-2 border-slate-200 overflow-hidden p-1.5">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrl}
                      alt={`Logo ${companyData.name}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-slate-400" aria-hidden="true" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
                      {companyData.name}
                    </h1>
                    {verification.isComplete ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                        <span>{t("Terverifikasi Resmi", "Officially Verified")}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                        <span>{t("Wajib Lengkapi Bukti & Logo", "Verification Required")}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {companyData.industry || t("Bidang industri belum ditentukan", "Industry not specified")}
                  </p>
                  {domicileString && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      <span>{domicileString}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tombol Aksi Header: Edit Profil & Pasang Lowongan */}
              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] active:scale-98 text-black font-black text-xs sm:text-sm transition-all shadow-2xs border border-black/10 min-h-[44px] cursor-pointer"
                >
                  <PencilLine className="w-4 h-4 text-black" aria-hidden="true" />
                  <span>{t("Edit Profil Perusahaan", "Edit Company Profile")}</span>
                </button>

                {verification.isComplete && (
                  <Link
                    href="/mitra/lowongan/tambah"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-navy-900 text-white hover:bg-navy-800 text-xs sm:text-sm font-bold transition shadow-xs min-h-[44px]"
                  >
                    <span>{t("Pasang Lowongan", "Post Job")}</span>
                    <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>

            {/* Indikator Kelayakan Verifikasi Perusahaan Nyata */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>{t("Kelengkapan Bukti Perusahaan Nyata", "Real Company Verification Progress")}</span>
                <span className={verification.isComplete ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                  {verification.completedCount} {t("dari", "of")} {verification.totalRequired} {t("Persyaratan Terpenuhi", "Requirements Met")}
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
                  <span className="font-semibold text-slate-800">{t("Perlu dilengkapi:", "Needs completion:")} </span>
                  <span>{verification.missingFields.join(", ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Baris 1: Identitas Usaha & Alamat Operasional */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Kartu 1: Informasi Dasar & Identitas */}
            <div className="bg-white rounded-3xl border border-black/[0.08] shadow-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-navy-950">
                    {t("Identitas & Informasi Usaha", "Identity & Business Information")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="text-xs font-bold text-navy-700 hover:text-navy-950 hover:underline inline-flex items-center gap-1"
                >
                  <span>{t("Ubah", "Edit")}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1">
                  <p className="text-xs font-semibold text-slate-500">
                    {t("Nama Resmi Perusahaan", "Official Company Name")}
                  </p>
                  <p className="text-sm font-bold text-navy-950">
                    {companyData.name}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1">
                  <p className="text-xs font-semibold text-slate-500">
                    {t("Bidang Industri", "Industry")}
                  </p>
                  <p className="text-sm font-bold text-navy-950">
                    {companyData.industry || (
                      <span className="text-slate-400 font-normal italic">
                        {t("Belum ditentukan", "Not specified")}
                      </span>
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1">
                  <p className="text-xs font-semibold text-slate-500">
                    {t("Ukuran Tim / Karyawan", "Company Size")}
                  </p>
                  <p className="text-sm font-bold text-navy-950">
                    {sizeLabel || (
                      <span className="text-slate-400 font-normal italic">
                        {t("Belum ditentukan", "Not specified")}
                      </span>
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1">
                  <p className="text-xs font-semibold text-slate-500">
                    {t("Website Resmi", "Official Website")}
                  </p>
                  {companyData.website ? (
                    <a
                      href={companyData.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm font-bold text-navy-800 hover:text-navy-950 hover:underline inline-flex items-center gap-1.5 break-all"
                    >
                      <span>{companyData.website}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400 italic">
                      {t("Belum ditambahkan", "Not added yet")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Kartu 2: Domisili & Alamat Kantor Operasional */}
            <div className="bg-white rounded-3xl border border-black/[0.08] shadow-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-navy-950">
                    {t("Domisili & Alamat Kantor Operasional", "Domicile & Office Address")}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="text-xs font-bold text-navy-700 hover:text-navy-950 hover:underline inline-flex items-center gap-1"
                >
                  <span>{t("Ubah", "Edit")}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1">
                  <p className="text-xs font-semibold text-slate-500">
                    {t("Kota / Kabupaten Domisili", "City / Regency")}
                  </p>
                  <p className="text-sm font-bold text-navy-950">
                    {domicileString || (
                      <span className="text-slate-400 font-normal italic">
                        {t("Belum ditentukan", "Not specified")}
                      </span>
                    )}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1">
                  <p className="text-xs font-semibold text-slate-500">
                    {t("Catatan Alamat Fisik Kantor", "Full Office Address")}
                  </p>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed">
                    {companyData.addressNote || (
                      <span className="text-slate-400 font-normal italic">
                        {t("Belum ditambahkan", "Not added yet")}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kartu 3: Tentang Perusahaan (Deskripsi Bisnis) */}
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-card p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-navy-950">
                  {t("Tentang Perusahaan", "About Company")}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleStartEdit}
                className="text-xs font-bold text-navy-700 hover:text-navy-950 hover:underline inline-flex items-center gap-1"
              >
                <span>{t("Ubah", "Edit")}</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.04]">
              {companyData.description ? (
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                  {companyData.description}
                </p>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  {t(
                    "Belum ada deskripsi profil bisnis perusahaan. Klik Edit Profil Perusahaan untuk menambahkan latar belakang dan visi perusahaan Anda.",
                    "No business description added yet. Click Edit Company Profile to add your company background and vision."
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Tombol Aksi Bawah */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] active:scale-98 text-black font-black text-sm transition-all shadow-2xs border border-black/10 min-h-[48px] cursor-pointer"
            >
              <PencilLine className="w-4 h-4 text-black" aria-hidden="true" />
              <span>{t("Edit Profil Perusahaan", "Edit Company Profile")}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================
            TAMPILAN 2: MODE FORMULIR EDIT PROFIL PERUSAHAAN
           ======================================================== */
        <div className="space-y-6">
          {/* Bar Navigasi Kembali dari Mode Edit */}
          {!isDataIncomplete && (
            <div className="flex items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-black/[0.08] shadow-xs">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors min-h-[40px] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-700" aria-hidden="true" />
                <span>{t("Batal & Kembali ke Profil", "Cancel & Return to Profile")}</span>
              </button>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                {t("Mode Pengeditan Profil Perusahaan", "Company Profile Editing Mode")}
              </span>
            </div>
          )}

          <ProfilPerusahaanForm
            initialData={companyData}
            provinces={provinces}
            cities={cities}
            onSave={handleSaveWrapper}
            logoUploadComponent={
              logoUploadComponent ||
              (onUploadLogoAction && onDeleteLogoAction ? (
                <LogoUpload
                  key="company-logo-upload"
                  initialLogoUrl={logoUrl}
                  companyName={companyData.name}
                  onUploadAction={onUploadLogoAction}
                  onDeleteAction={onDeleteLogoAction}
                  onSuccess={(newUrl) => {
                    setLogoUrl(newUrl);
                  }}
                />
              ) : undefined)
            }
          />
        </div>
      )}
    </div>
  );
}
