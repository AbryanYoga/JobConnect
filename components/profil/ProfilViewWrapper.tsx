"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  GraduationCap,
  FileText,
  Globe,
  ExternalLink,
  PencilLine,
  ArrowLeft,
  CheckCircle2,
  FolderGit2,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/LinkedinIcon";
import { useLanguage } from "@/lib/i18n";
import { ProfilHeader } from "./ProfilHeader";
import { ProfilForm } from "@/app/profil/ProfilForm";
import type { PortfolioItem, ProfilPelamarInput } from "@/lib/validation/profil";
import { calculateAge, EDUCATION_LEVEL_OPTIONS } from "@/lib/validation/profil";

export interface ProfilData {
  name: string;
  email: string;
  phone?: string | null;
  headline?: string | null;
  avatarUrl?: string | null;
  provinceId?: number | null;
  cityId?: number | null;
  birthDate?: string | null;
  educationLevel?: string | null;
  educationInstitution?: string | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  portfolios?: PortfolioItem[];
  emailNotifications?: boolean;
  createdAtRaw?: string | null;
}

interface ProfilViewWrapperProps {
  initialData: ProfilData;
  provinces: { id: number; name: string; slug: string }[];
  cities: { id: number; name: string; province_id: number; type: string }[];
  isOnboarding?: boolean;
  initialIsEditing?: boolean;
  avatarUploadComponent: React.ReactNode;
  onSave: (data: ProfilPelamarInput) => Promise<{
    success: boolean;
    error?: string;
    warning?: string;
  }>;
}

function formatBirthDate(dateStr: string | null | undefined, locale: string): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function ProfilViewWrapper({
  initialData,
  provinces,
  cities,
  isOnboarding = false,
  initialIsEditing = false,
  avatarUploadComponent,
  onSave,
}: ProfilViewWrapperProps) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const locale = language === "en" ? "en-US" : "id-ID";

  const [isEditing, setIsEditing] = useState<boolean>(initialIsEditing || isOnboarding);
  const [profileData, setProfileData] = useState<ProfilData>(initialData);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [warningBanner, setWarningBanner] = useState<string | null>(null);

  // Cari nama kota dan provinsi yang dipilih
  const selectedCity = cities.find((c) => c.id === profileData.cityId);
  const selectedProvince = provinces.find((p) => p.id === profileData.provinceId);
  
  let cityTypePrefix = "";
  let cleanCityName = "";
  if (selectedCity) {
    cleanCityName = selectedCity.name.replace(/^(Kabupaten|Kota|Kab\.|Kota)\s+/i, "");
    cityTypePrefix =
      selectedCity.type === "kota"
        ? language === "en"
          ? "City of "
          : "Kota "
        : language === "en"
        ? "Regency of "
        : "Kab. ";
  }

  const domicileString = selectedCity
    ? `${cityTypePrefix}${cleanCityName}${
        selectedProvince ? `, ${selectedProvince.name}` : ""
      }`
    : selectedProvince?.name || null;

  // Tanggal lahir & umur
  const formattedBirthDate = formatBirthDate(profileData.birthDate, locale);
  const age = calculateAge(profileData.birthDate);

  // Label jenjang pendidikan
  const rawEduLevel =
    EDUCATION_LEVEL_OPTIONS.find((opt) => opt.value === profileData.educationLevel)?.label ||
    profileData.educationLevel ||
    null;
  const eduLevelLabel = rawEduLevel ? t(rawEduLevel) : null;

  const handleStartEdit = () => {
    setSuccessBanner(null);
    setWarningBanner(null);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveWrapper = async (data: ProfilPelamarInput) => {
    const res = await onSave(data);
    if (res.success) {
      setProfileData((prev) => ({
        ...prev,
        name: data.name,
        phone: data.phone,
        headline: data.headline,
        provinceId: data.provinceId,
        cityId: data.cityId,
        birthDate: data.birthDate,
        educationLevel: data.educationLevel,
        educationInstitution: data.educationInstitution,
        bio: data.bio,
        linkedinUrl: data.linkedinUrl,
        portfolioUrl: data.portfolioUrl,
        portfolios: data.portfolios,
        emailNotifications: data.emailNotifications,
      }));

      setSuccessBanner(
        t(
          "Biodata dan profil akun berhasil disimpan.",
          "Your profile and biodata were updated successfully."
        )
      );

      if (res.warning) {
        setWarningBanner(res.warning);
      } else {
        setWarningBanner(null);
      }

      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      router.refresh();
    }
    return res;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Utama Profil */}
      <ProfilHeader
        name={profileData.name}
        email={profileData.email}
        headline={profileData.headline}
        domicileString={domicileString}
        avatarUrl={profileData.avatarUrl}
        createdAtRaw={profileData.createdAtRaw}
        onEdit={handleStartEdit}
        isEditing={isEditing}
      />

      {/* Banner Pesan Sukses atau Peringatan */}
      {successBanner && !isEditing && (
        <div
          role="alert"
          className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-green-50 border border-green-200 text-green-900 flex items-start gap-3 shadow-2xs"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-bold text-sm text-green-950">{successBanner}</p>
            {warningBanner && (
              <p className="text-xs sm:text-sm text-amber-900 font-medium">
                {warningBanner}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TAMPILAN VIEW PROFILE (Ringkasan Profil) */}
      {!isEditing ? (
        <div className="space-y-6 sm:space-y-8">
          {/* Baris 1: Identitas Diri & Pendidikan + Tautan (Seimbang Tanpa Void) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            {/* Kartu 1: Identitas Diri & Kontak */}
            <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                      <User className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-navy-950">
                      {t("Identitas Diri & Kontak", "Personal Identity & Contact")}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="text-xs font-bold text-navy-700 hover:text-navy-950 hover:underline inline-flex items-center gap-1 min-h-[44px] px-2"
                  >
                    <span>{t("Ubah", "Edit")}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-semibold text-slate-500">
                      {t("Nama Lengkap", "Full Name")}
                    </p>
                    <p className="text-sm font-bold text-navy-950 truncate" title={profileData.name}>
                      {profileData.name}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-semibold text-slate-500">
                      {t("Alamat Email Akun", "Account Email")}
                    </p>
                    <p className="text-sm font-bold text-navy-950 truncate" title={profileData.email}>
                      {profileData.email}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-semibold text-slate-500">
                      {t("Nomor WhatsApp / Telepon", "WhatsApp / Phone Number")}
                    </p>
                    <p className="text-sm font-bold text-navy-950 truncate">
                      {profileData.phone || (
                        <span className="text-slate-400 font-normal italic">
                          {t("Belum ditambahkan", "Not added yet")}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-semibold text-slate-500">
                      {t("Tanggal Lahir (Umur)", "Date of Birth (Age)")}
                    </p>
                    <p className="text-sm font-bold text-navy-950 truncate">
                      {formattedBirthDate ? (
                        <>
                          {formattedBirthDate}
                          {age !== null && (
                            <span className="ml-2 font-semibold text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                              {age} {t("tahun", "years old")}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 font-normal italic">
                          {t("Belum ditambahkan", "Not added yet")}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-semibold text-slate-500">
                      {t("Domisili Penempatan Kerja", "Placement Domicile")}
                    </p>
                    <p className="text-sm font-bold text-navy-950 break-words">
                      {domicileString || (
                        <span className="text-slate-400 font-normal italic">
                          {t("Belum memilih provinsi / kota", "Province or city not selected")}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kartu 2: Riwayat Pendidikan & Tautan Profesional */}
            <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-navy-950">
                      {t("Pendidikan & Tautan Profesional", "Education & Professional Links")}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="text-xs font-bold text-navy-700 hover:text-navy-950 hover:underline inline-flex items-center gap-1 min-h-[44px] px-2"
                  >
                    <span>{t("Ubah", "Edit")}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-semibold text-slate-500">
                      {t("Jenjang Pendidikan", "Education Level")}
                    </p>
                    <p className="text-sm font-bold text-navy-950 truncate">
                      {eduLevelLabel || (
                        <span className="text-slate-400 font-normal italic">
                          {t("Belum ditentukan", "Not specified")}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-semibold text-slate-500">
                      {t("Nama Sekolah / Kampus / Institusi", "School / University / Institution")}
                    </p>
                    <p className="text-sm font-bold text-navy-950 truncate" title={profileData.educationInstitution || ""}>
                      {profileData.educationInstitution || (
                        <span className="text-slate-400 font-normal italic">
                          {t("Belum ditambahkan", "Not added yet")}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <LinkedinIcon className="w-3.5 h-3.5 text-[#0077b5] shrink-0" />
                      <span>LinkedIn</span>
                    </p>
                    {profileData.linkedinUrl ? (
                      <a
                        href={profileData.linkedinUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center justify-between gap-1.5 w-full min-w-0 overflow-hidden text-sm font-bold text-navy-800 hover:text-navy-950 hover:underline"
                        title={profileData.linkedinUrl}
                      >
                        <span className="truncate min-w-0">{profileData.linkedinUrl}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                      </a>
                    ) : (
                      <p className="text-sm text-slate-400 italic">
                        {t("Belum ditambahkan", "Not added yet")}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1 min-w-0 overflow-hidden">
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
                      <span className="truncate">{t("Website / Portofolio Utama", "Website / Main Portfolio")}</span>
                    </p>
                    {profileData.portfolioUrl ? (
                      <a
                        href={profileData.portfolioUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center justify-between gap-1.5 w-full min-w-0 overflow-hidden text-sm font-bold text-navy-800 hover:text-navy-950 hover:underline"
                        title={profileData.portfolioUrl}
                      >
                        <span className="truncate min-w-0">{profileData.portfolioUrl}</span>
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
            </div>
          </div>

          {/* Baris 2: Tentang Saya (Bio Lengkap) */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" aria-hidden="true" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-navy-950">
                  {t("Tentang Saya", "About Me")}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleStartEdit}
                className="text-xs font-bold text-navy-700 hover:text-navy-950 hover:underline inline-flex items-center gap-1 min-h-[44px] px-2"
              >
                <span>{t("Ubah", "Edit")}</span>
              </button>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.04]">
              {profileData.bio ? (
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                  {profileData.bio}
                </p>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  {t(
                    "Belum menambahkan bio ringkasan diri. Ceritakan keahlian, pengalaman, atau minat karier Anda agar perusahaan mitra lebih mengenal Anda.",
                    "No bio added yet. Describe your skills, experience, or career aspirations to help employer partners know you better."
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Kartu 5: Karya Nyata & Portofolio Proyek (Full Width) */}
          <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FolderGit2 className="w-4 h-4" aria-hidden="true" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-navy-950">
                  {t("Karya Nyata & Portofolio Proyek", "Real Works & Project Portfolio")}
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

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t("Daftar Karya & Proyek Mandiri", "List of Projects")}
              </p>

              {profileData.portfolios && profileData.portfolios.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profileData.portfolios.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-2.5 flex flex-col justify-between min-w-0 overflow-hidden"
                    >
                      <div className="space-y-2 min-w-0 overflow-hidden">
                        {item.imageUrl && (
                          <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-black/[0.06] mb-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <h4 className="text-sm font-bold text-navy-950 leading-snug break-words min-w-0">
                            {item.title}
                          </h4>
                          {item.year && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 shrink-0">
                              {item.year}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-600 leading-relaxed break-words">
                            {item.description}
                          </p>
                        )}
                        {item.skills && item.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1 min-w-0">
                            {item.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-black/[0.08] text-slate-700 truncate max-w-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {item.url && (
                        <div className="pt-2 min-w-0 overflow-hidden">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-800 hover:text-navy-950 hover:underline max-w-full"
                            title={item.url}
                          >
                            <span className="truncate">{t("Lihat Karya / Demo", "View Project / Demo")}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#FAF8F0] border border-dashed border-black/[0.12] text-center space-y-2">
                  <p className="text-sm text-slate-500 font-medium">
                    {t(
                      "Belum menambahkan karya proyek nyata.",
                      "No project portfolio items added yet."
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-800 hover:text-navy-950 hover:underline"
                  >
                    <span>+ {t("Tambah Portofolio Karya", "Add Portfolio Projects")}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tombol Aksi di Bawah */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] active:scale-98 text-black font-black text-sm transition-all shadow-2xs border border-black/10 min-h-[48px] cursor-pointer"
            >
              <PencilLine className="w-4 h-4 text-black" aria-hidden="true" />
              <span>{t("Edit Biodata & Profil Akun", "Edit Biodata & Profile")}</span>
            </button>
          </div>
        </div>
      ) : (
        /* TAMPILAN FORM EDIT PROFILE */
        <div className="space-y-6">
          {/* Bar Navigasi Kembali dari Mode Edit */}
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
              {t("Mode Pengeditan Profil", "Profile Editing Mode")}
            </span>
          </div>

          <ProfilForm
            initialData={{
              name: profileData.name,
              email: profileData.email,
              phone: profileData.phone || null,
              headline: profileData.headline || null,
              provinceId: profileData.provinceId ?? null,
              cityId: profileData.cityId ?? null,
              birthDate: profileData.birthDate || null,
              educationLevel: profileData.educationLevel || null,
              educationInstitution: profileData.educationInstitution || null,
              bio: profileData.bio || null,
              linkedinUrl: profileData.linkedinUrl || null,
              portfolioUrl: profileData.portfolioUrl || null,
              portfolios: profileData.portfolios || [],
              emailNotifications: profileData.emailNotifications ?? true,
            }}
            provinces={provinces}
            cities={cities}
            isOnboarding={isOnboarding}
            avatarUploadComponent={avatarUploadComponent}
            onSave={handleSaveWrapper}
          />
        </div>
      )}
    </div>
  );
}
