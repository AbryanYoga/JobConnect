"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  Sparkles,
  Bell,
  Check,
  Loader2,
  MapPin,
  GraduationCap,
  FileText,
  Globe,
  Briefcase,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/LinkedinIcon";
import { Input } from "@/components/ui/Input";
import {
  profilPelamarSchema,
  HEADLINE_MAX,
  NAME_MIN,
  NAME_MAX,
  EDUCATION_LEVEL_OPTIONS,
  calculateAge,
  type PortfolioItem,
  type ProfilPelamarInput,
} from "@/lib/validation/profil";
import { fieldErrors } from "@/lib/validation/helpers";
import { hasProfanity } from "@/lib/validation/profanity";
import { PortfolioManager } from "@/components/profil/PortfolioManager";
import { useLanguage } from "@/lib/i18n";

interface ProfilFormProps {
  initialData: {
    name: string;
    email: string;
    phone: string | null;
    headline: string | null;
    provinceId?: number | null;
    cityId?: number | null;
    birthDate?: string | null;
    educationLevel?: string | null;
    educationInstitution?: string | null;
    bio?: string | null;
    linkedinUrl?: string | null;
    portfolioUrl?: string | null;
    portfolios?: PortfolioItem[];
    emailNotifications: boolean;
  };
  provinces?: { id: number; name: string; slug: string }[];
  cities?: { id: number; name: string; province_id: number; type: string }[];
  avatarUploadComponent?: React.ReactNode;
  hasDefaultCv?: boolean;
  avatarUrl?: string | null;
  isOnboarding?: boolean;
  onSave?: (
    data: ProfilPelamarInput
  ) => Promise<{ success: boolean; warning?: string; error?: string }>;
}

export function ProfilForm({
  initialData,
  provinces = [],
  cities = [],
  avatarUploadComponent,
  hasDefaultCv = false,
  avatarUrl = null,
  isOnboarding = false,
  onSave,
}: ProfilFormProps) {
  const router = useRouter();
  const { t, language } = useLanguage();

  // State identitas dasar & kontak
  const [name, setName] = useState(initialData.name || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [birthDate, setBirthDate] = useState(initialData.birthDate || "");

  // State domisili
  const [provinceId, setProvinceId] = useState<number | "">(
    initialData.provinceId ?? ""
  );
  const [cityId, setCityId] = useState<number | "">(initialData.cityId ?? "");

  // State pendidikan & profesi
  const [headline, setHeadline] = useState(initialData.headline || "");
  const [educationLevel, setEducationLevel] = useState(
    initialData.educationLevel || ""
  );
  const [educationInstitution, setEducationInstitution] = useState(
    initialData.educationInstitution || ""
  );

  // State bio & media sosial
  const [bio, setBio] = useState(initialData.bio || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialData.linkedinUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialData.portfolioUrl || "");

  // State galeri portofolio karya
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>(
    initialData.portfolios || []
  );

  // Preferensi notifikasi
  const [emailNotifications, setEmailNotifications] = useState(
    initialData.emailNotifications ?? true
  );

  // Feedback form
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Daftar kota yang tersaring berdasarkan provinsi
  const availableCities = useMemo(() => {
    if (!provinceId) return [];
    return cities.filter((c) => c.province_id === Number(provinceId));
  }, [cities, provinceId]);

  const handleProvinceChange = (newProvId: number | "") => {
    setProvinceId(newProvId);
    setCityId("");
    if (errors.provinceId) setErrors((prev) => ({ ...prev, provinceId: "" }));
  };

  // Kalkulasi usia otomatis berdasarkan tanggal lahir
  const calculatedAge = useMemo(() => {
    return calculateAge(birthDate);
  }, [birthDate]);

  // Kalkulasi skor kelengkapan biodata akun (0 - 100%)
  // Fokus mutlak pada elemen inti: Nama & Kontak, Usia/Umur, Domisili, Pendidikan, CV, dan Foto Wajah Asli.
  // LinkedIn, GitHub, dan Portofolio bersifat opsional dan tidak memotong skor kelengkapan 100%.
  const completeness = useMemo(() => {
    let score = 0;
    // 1. Nama & Kontak (20%)
    if (name.trim() && phone.trim()) score += 20;
    // 2. Usia & Tanggal Lahir (20%)
    if (birthDate.trim() && calculatedAge !== null) score += 20;
    // 3. Domisili Provinsi & Kota (20%)
    if (provinceId && cityId) score += 20;
    // 4. Pendidikan Terakhir (20%)
    if (educationLevel) score += 20;
    // 5. Berkas CV & Foto Profil Wajah Asli (masing-masing 10% = 20%)
    if (hasDefaultCv) score += 10;
    if (avatarUrl) score += 10;
    return Math.min(100, score);
  }, [
    name,
    phone,
    birthDate,
    calculatedAge,
    provinceId,
    cityId,
    educationLevel,
    hasDefaultCv,
    avatarUrl,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setWarningMessage(null);

    const validationResult = profilPelamarSchema.safeParse({
      name,
      phone: phone || null,
      headline: headline || null,
      provinceId: provinceId ? Number(provinceId) : null,
      cityId: cityId ? Number(cityId) : null,
      birthDate: birthDate || null,
      educationLevel: educationLevel || null,
      educationInstitution: educationInstitution || null,
      bio: bio || null,
      linkedinUrl: linkedinUrl || null,
      portfolioUrl: portfolioUrl || null,
      portfolios,
      emailNotifications,
    });

    if (!validationResult.success) {
      const errs = fieldErrors(validationResult.error);
      setErrors(errs);
      const fieldIdMap: Record<string, string> = {
        name: "profil-name",
        birthDate: "profil-birthdate",
        phone: "profil-phone",
        provinceId: "profil-province",
        cityId: "profil-city",
        headline: "profil-headline",
        educationLevel: "profil-edu-level",
        educationInstitution: "profil-edu-inst",
        bio: "profil-bio",
        linkedinUrl: "profil-linkedin",
        portfolioUrl: "profil-web-portfolio",
      };
      const firstKey = Object.keys(errs)[0];
      const targetId = fieldIdMap[firstKey];
      if (targetId) {
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            try {
              el.focus({ preventScroll: true });
            } catch {}
          } else {
            window.scrollTo({ top: 120, behavior: "smooth" });
          }
        }, 50);
      } else {
        window.scrollTo({ top: 120, behavior: "smooth" });
      }
      return;
    }

    setErrors({});

    if (onSave) {
      setIsSubmitting(true);
      const res = await onSave(validationResult.data);
      setIsSubmitting(false);

      if (res.success) {
        setSuccessMessage(
          t(
            "Biodata dan profil akun Anda berhasil disimpan.",
            "Your account biodata and profile were saved successfully."
          )
        );
        if (res.warning) {
          setWarningMessage(res.warning);
        }
        router.refresh();
      } else if (res.error) {
        setErrors({ general: res.error });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Banner Onboarding (Tampil saat pengguna baru saja register atau diminta melengkapi profil) */}
      {(isOnboarding || completeness < 80) && (
        <div className="p-6 sm:p-7 rounded-[28px] sm:rounded-[36px] bg-white border border-[#222222]/15 shadow-card relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#FFDD00]/25 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFDD00] text-black font-black text-xs shadow-2xs border border-black/10">
                <Sparkles className="w-3.5 h-3.5 text-black" aria-hidden="true" />
                <span>
                  {isOnboarding
                    ? t("Langkah Awal Pelamar", "First Step for Applicants")
                    : t("Tingkatkan Peluang Karir", "Boost Your Career Opportunities")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600">
                  {t("Kelengkapan Profil:", "Profile Completeness:")}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-[#FFDD00] text-xs font-black">
                  {completeness}%
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                {isOnboarding
                  ? t(
                      "Selamat Datang! Lengkapi Biodata & Profil Akun Anda",
                      "Welcome! Complete Your Biodata & Profile"
                    )
                  : t(
                      "Lengkapi Biodata Akun untuk Dapatkan Perhatian HRD",
                      "Complete Your Profile to Attract HR Recruiters"
                    )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-medium">
                {t(
                  "Perusahaan mitra mengutamakan kelengkapan berkas utama: nama, usia, domisili, pendidikan, foto wajah asli, dan berkas CV. Portofolio & tautan LinkedIn bersifat opsional.",
                  "Partner companies prioritize key information: name, age, location, education, real face photo, and CV document. Portfolio & LinkedIn links are optional."
                )}
              </p>
            </div>

            {/* Bar Progres Visual */}
            <div className="space-y-2 pt-1">
              <div className="w-full h-2.5 bg-[#FAF8F0] rounded-full overflow-hidden border border-black/[0.08]">
                <div
                  className="h-full bg-[#FFDD00] transition-all duration-500 rounded-full"
                  style={{ width: `${completeness}%` }}
                />
              </div>

              {/* Indikator Check List Sederhana */}
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-600 pt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                    name.trim() && phone.trim()
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" /> {t("Nama & Kontak", "Contact")}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                    birthDate.trim() && calculatedAge !== null
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" /> {t("Usia & Umur", "Age")}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                    provinceId && cityId
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" /> {t("Domisili", "Location")}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                    educationLevel
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" /> {t("Pendidikan", "Education")}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                    hasDefaultCv
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" /> {t("Berkas CV", "CV Document")}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${
                    avatarUrl
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" /> {t("Foto Wajah Asli", "Real Face Photo")}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
                  {t("LinkedIn & Portofolio (Opsional)", "LinkedIn & Portfolio (Optional)")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifikasi Status Berhasil */}
      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 font-medium"
        >
          <Check className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Peringatan Migrasi Jika Kolom Belum Dieksekusi */}
      {warningMessage && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" aria-hidden="true" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Pesan Kesalahan Umum */}
      {errors.general && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Kartu 1: Foto Profil Resmi */}
      {avatarUploadComponent && (
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-4 xs:p-5 sm:p-8">
          <div className="mb-4">
            <h3 className="text-lg font-black text-black tracking-tight">
              {t("Foto Profil Pelamar", "Applicant Profile Photo")}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t(
                "Gunakan foto formal atau semi-formal yang jelas untuk kartu identitas pelamar Anda.",
                "Use a clear formal or semi-formal photo for your applicant identity card."
              )}
            </p>
          </div>
          <div>{avatarUploadComponent}</div>
        </div>
      )}

      {/* Kartu 2: Identitas Diri, Umur & Kontak */}
      <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-4 xs:p-5 sm:p-8 space-y-5">
        <div>
          <h3 className="text-lg font-black text-black tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 text-black" aria-hidden="true" />
            <span>{t("Identitas Diri & Kontak Pelamar", "Applicant Identity & Contact")}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {t(
              "Informasi dasar ini ditampilkan ke perusahaan mitra yang menerima berkas lamaran Anda.",
              "This basic information is displayed to partner companies reviewing your applications."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nama Lengkap */}
          <Input
            id="profil-name"
            label={t("Nama Lengkap", "Full Name")}
            required
            type="text"
            placeholder={language === "en" ? "e.g. Alex Pratama" : "Contoh: Nama Lengkap Anda"}
            leftIcon={<User className="w-4 h-4 text-slate-400" />}
            value={name}
            onChange={(e) => {
              const val = e.target.value;
              setName(val);
              if (hasProfanity(val)) {
                setErrors((prev) => ({
                  ...prev,
                  name: t(
                    "Nama terdeteksi mengandung kata yang tidak pantas. Harap gunakan nama asli yang sopan.",
                    "Name contains inappropriate words. Please use a respectful, real name."
                  ),
                }));
              } else if (errors.name) {
                setErrors((prev) => ({ ...prev, name: "" }));
              }
            }}
            helperText={
              language === "en"
                ? `Name length must be between ${NAME_MIN} and ${NAME_MAX} characters.`
                : `Panjang nama antara ${NAME_MIN} sampai ${NAME_MAX} karakter.`
            }
            error={errors.name}
            className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-3 font-medium transition-all"
          />

          {/* Tanggal Lahir & Hitung Umur Otomatis */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="profil-birthdate" className="block text-sm font-bold text-black">
                {t("Tanggal Lahir (Umur)", "Birth Date (Age)")} <span className="text-red-500">*</span>
              </label>
              {calculatedAge !== null && (
                <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>{t("Usia:", "Age:")} {calculatedAge} {t("tahun", "years old")}</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="profil-birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  if (errors.birthDate) setErrors((prev) => ({ ...prev, birthDate: "" }));
                }}
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition-all text-slate-900"
              />
            </div>
            {errors.birthDate ? (
              <p className="text-xs text-red-600 font-medium">{errors.birthDate}</p>
            ) : (
              <p className="text-xs text-slate-500">
                {t(
                  "Usia dihitung otomatis untuk memenuhi kriteria persyaratan lowongan.",
                  "Age is automatically calculated to meet vacancy criteria."
                )}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nomor Telepon / WhatsApp */}
          <Input
            id="profil-phone"
            label={t("Nomor WhatsApp / Telepon", "WhatsApp / Phone Number")}
            required
            type="tel"
            placeholder={language === "en" ? "e.g. 081234567890" : "Contoh: 081234567890"}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
            }}
            helperText={t(
              "Gunakan nomor aktif untuk kemudahan panggilan wawancara oleh HRD.",
              "Use an active phone number for HR recruiters to call for interviews."
            )}
            error={errors.phone}
            className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-3 font-medium transition-all"
          />

          {/* Alamat Email (Read-Only) */}
          <Input
            id="profil-email"
            label={t("Alamat Email Akun", "Account Email Address")}
            type="email"
            value={initialData.email}
            disabled
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            helperText={t("Email terhubung dengan autentikasi akun Anda.", "Email is linked to your account authentication.")}
            className="rounded-2xl bg-slate-100 border-black/[0.08] text-sm py-3 font-medium opacity-75"
          />
        </div>
      </div>

      {/* Kartu 3: Domisili Pelamar (Provinsi & Kota/Kabupaten) */}
      <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-4 xs:p-5 sm:p-8 space-y-5">
        <div>
          <h3 className="text-lg font-black text-black tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-black" aria-hidden="true" />
            <span>{t("Domisili & Wilayah Tempat Tinggal", "Domicile & Residence Region")}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {t(
              "Perusahaan mitra memprioritaskan pelamar dengan domisili terdekat untuk penempatan kerja onsite maupun hybrid.",
              "Partner companies prioritize candidates residing nearby for onsite and hybrid job placements."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Dropdown Provinsi */}
          <div className="space-y-2">
            <label htmlFor="profil-province" className="block text-sm font-bold text-black">
              {t("Provinsi Domisili", "Home Province")} <span className="text-red-500">*</span>
            </label>
            <select
              id="profil-province"
              value={provinceId}
              onChange={(e) =>
                handleProvinceChange(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            >
              <option value="">{t("-- Pilih Provinsi --", "-- Select Province --")}</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
            {errors.provinceId && (
              <p className="text-xs text-red-600 font-medium">{errors.provinceId}</p>
            )}
          </div>

          {/* Dropdown Kota / Kabupaten Berjenjang */}
          <div className="space-y-2">
            <label htmlFor="profil-city" className="block text-sm font-bold text-black">
              {t("Kota / Kabupaten Domisili", "Home City / Regency")} <span className="text-red-500">*</span>
            </label>
            <select
              id="profil-city"
              disabled={!provinceId}
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value ? Number(e.target.value) : "");
                if (errors.cityId) setErrors((prev) => ({ ...prev, cityId: "" }));
              }}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black disabled:opacity-50"
            >
              <option value="">
                {!provinceId
                  ? t("-- Pilih Provinsi Terlebih Dahulu --", "-- Select Province First --")
                  : t("-- Pilih Kota / Kabupaten --", "-- Select City / Regency --")}
              </option>
              {availableCities.map((city) => {
                const cleanName = city.name
                  .replace(/^(kabupaten|kota|kab\.)\s*/gi, "")
                  .replace(/^(kabupaten|kota|kab\.)\s*/gi, "")
                  .trim();
                const displayName =
                  city.type === "kota"
                    ? `Kota ${cleanName}`
                    : `Kabupaten ${cleanName}`;
                return (
                  <option key={city.id} value={city.id}>
                    {displayName}
                  </option>
                );
              })}
            </select>
            {errors.cityId && (
              <p className="text-xs text-red-600 font-medium">{errors.cityId}</p>
            )}
          </div>
        </div>
      </div>

      {/* Kartu 4: Pendidikan Terakhir & Headline Profesional */}
      <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-4 xs:p-5 sm:p-8 space-y-5">
        <div>
          <h3 className="text-lg font-black text-black tracking-tight flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-black" aria-hidden="true" />
            <span>{t("Pendidikan Terakhir & Headline Karir", "Latest Education & Career Headline")}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {t(
              "Tentukan jenjang pendidikan dan ringkasan keahlian utama Anda.",
              "Specify your education level and summary of your core skills."
            )}
          </p>
        </div>

        {/* Headline Profesional */}
        <div>
          <Input
            id="profil-headline"
            label={t("Headline Profesional", "Professional Headline")}
            type="text"
            placeholder={
              language === "en"
                ? "e.g. Fresh Graduate | Web Developer React & Next.js"
                : "Contoh: Fresh Graduate SMK RPL | Web Developer React & Next.js"
            }
            leftIcon={<Sparkles className="w-4 h-4 text-slate-400" />}
            value={headline}
            onChange={(e) => {
              setHeadline(e.target.value);
              if (errors.headline) setErrors((prev) => ({ ...prev, headline: "" }));
            }}
            helperText={
              language === "en"
                ? `Brief summary of your profession or career interest (maximum ${HEADLINE_MAX} characters).`
                : `Ringkasan singkat profesi atau minat kerja Anda (maksimal ${HEADLINE_MAX} karakter).`
            }
            error={errors.headline}
            className="rounded-2xl bg-[#FAF8F0] border-black/[0.08] focus:border-black focus:bg-white text-sm py-3 font-medium transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Jenjang Pendidikan */}
          <div className="space-y-2">
            <label htmlFor="profil-edu-level" className="block text-sm font-bold text-black">
              {t("Jenjang Pendidikan Terakhir", "Latest Education Level")}
            </label>
            <select
              id="profil-edu-level"
              value={educationLevel}
              onChange={(e) => setEducationLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            >
              <option value="">{t("-- Pilih Jenjang Pendidikan --", "-- Select Education Level --")}</option>
              {EDUCATION_LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nama Institusi / Sekolah */}
          <div className="space-y-2">
            <label htmlFor="profil-edu-inst" className="block text-sm font-bold text-black">
              {t("Nama Sekolah / Kampus & Jurusan", "School / University & Major")}
            </label>
            <input
              id="profil-edu-inst"
              type="text"
              placeholder={
                language === "en"
                  ? "e.g. Vocational High School (Software Eng), Univ. of Indonesia (CS)"
                  : "Contoh: SMKN 1 Jakarta (RPL), Univ. Indonesia (TI)"
              }
              value={educationInstitution}
              onChange={(e) => setEducationInstitution(e.target.value)}
              maxLength={150}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            />
          </div>
        </div>
      </div>

      {/* Kartu 5: Bio Diri & Tautan Profil Profesional (LinkedIn & Portofolio Web) */}
      <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-4 xs:p-5 sm:p-8 space-y-5">
        <div>
          <h3 className="text-lg font-black text-black tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-black" aria-hidden="true" />
            <span>{t("Bio Profil & Tautan Eksternal (Opsional)", "Profile Bio & External Links (Optional)")}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {t(
              "Bagian ini bersifat opsional. Jika Anda memiliki tautan LinkedIn, website pribadi, atau profil GitHub, Anda dapat menautkannya di sini.",
              "This section is optional. If you have LinkedIn, personal website, or GitHub profile, you can link them here."
            )}
          </p>
        </div>

        {/* Bio / Tentang Saya */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="profil-bio" className="block text-sm font-bold text-black">
              {t("Bio / Ringkasan Tentang Saya (Opsional)", "Bio / Summary About Me (Optional)")}
            </label>
            <span className="text-[11px] font-semibold text-slate-400">
              {bio.length}/1500 {t("karakter", "characters")}
            </span>
          </div>
          <textarea
            id="profil-bio"
            rows={4}
            placeholder={
              language === "en"
                ? "Tell about your background, key skills, past projects, and career goals you want to achieve..."
                : "Ceritakan latar belakang Anda, keterampilan unggulan, proyek yang pernah Anda kerjakan, serta tujuan karier yang ingin Anda capai..."
            }
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              if (errors.bio) setErrors((prev) => ({ ...prev, bio: "" }));
            }}
            maxLength={1500}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black resize-none"
          />
          {errors.bio && (
            <p className="text-xs text-red-600 font-medium">{errors.bio}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Tautan LinkedIn */}
          <div className="space-y-1.5">
            <label htmlFor="profil-linkedin" className="block text-sm font-bold text-black">
              {t("Tautan Profil LinkedIn (Opsional)", "LinkedIn Profile URL (Optional)")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                <LinkedinIcon className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="profil-linkedin"
                type="url"
                placeholder="https://www.linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => {
                  setLinkedinUrl(e.target.value);
                  if (errors.linkedinUrl)
                    setErrors((prev) => ({ ...prev, linkedinUrl: "" }));
                }}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
              />
            </div>
            {errors.linkedinUrl ? (
              <p className="text-xs text-red-600 font-medium">{errors.linkedinUrl}</p>
            ) : (
              <p className="text-[11px] text-slate-500">
                {t(
                  "Opsional, memudahkan tim rekruter meninjau jejaring dan rekam jejak profesional Anda.",
                  "Optional, makes it easy for recruiters to review your professional network."
                )}
              </p>
            )}
          </div>

          {/* Tautan Website Portofolio / GitHub */}
          <div className="space-y-1.5">
            <label htmlFor="profil-web-portfolio" className="block text-sm font-bold text-black">
              {t("Tautan Website / GitHub / Portofolio (Opsional)", "Website / GitHub / Portfolio URL (Optional)")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="profil-web-portfolio"
                type="url"
                placeholder="https://github.com/username atau https://portofolio.me"
                value={portfolioUrl}
                onChange={(e) => {
                  setPortfolioUrl(e.target.value);
                  if (errors.portfolioUrl)
                    setErrors((prev) => ({ ...prev, portfolioUrl: "" }));
                }}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
              />
            </div>
            {errors.portfolioUrl ? (
              <p className="text-xs text-red-600 font-medium">{errors.portfolioUrl}</p>
            ) : (
              <p className="text-[11px] text-slate-500">
                {t(
                  "Opsional, tautkan laman portofolio online, repository kode GitHub, atau Behance/Dribbble.",
                  "Optional, link your online portfolio page, GitHub code repository, or Behance/Dribbble."
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Kartu 6: Galeri Showcase Portofolio Proyek (Project Showcase) */}
      <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-4 xs:p-5 sm:p-8 space-y-4">
        <div>
          <h3 className="text-lg font-black text-black tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-black" aria-hidden="true" />
            <span>{t("Showcase Karya & Proyek Nyata (Opsional)", "Work Showcase & Real Projects (Optional)")}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {t(
              "Bagian portofolio proyek ini bersifat opsional, bermanfaat bagi pelamar yang ingin memamerkan hasil karya nyata atau proyek mandiri.",
              "This project portfolio section is optional, beneficial for applicants who wish to showcase real works or personal projects."
            )}
          </p>
        </div>

        <PortfolioManager items={portfolios} onChange={setPortfolios} />
      </div>

      {/* Kartu 7: Preferensi Pemberitahuan */}
      <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] shadow-card p-4 xs:p-5 sm:p-8 space-y-4">
        <div>
          <h3 className="text-lg font-black text-black tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-black" aria-hidden="true" />
            <span>{t("Preferensi Notifikasi", "Notification Preferences")}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            {t(
              "Atur bagaimana platform mengirimkan informasi pembaruan penting kepada Anda.",
              "Configure how the platform sends important updates to you."
            )}
          </p>
        </div>

        <label
          htmlFor="notifikasi-email"
          className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAF8F0]/60 border border-black/[0.08] hover:border-black/20 transition-colors cursor-pointer select-none"
        >
          <input
            id="notifikasi-email"
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded-sm border-black/20 text-black focus:ring-black focus:ring-offset-1 accent-[#0D0C23]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-black">
                {t("Notifikasi Email Status Lamaran", "Email Notifications for Application Status")}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
              {t(
                "Dapatkan pemberitahuan otomatis ke email saat perusahaan memperbarui status lamaran Anda (misalnya saat dijadwalkan wawancara atau lolos seleksi).",
                "Receive automatic email notifications when a company updates your application status (e.g. interview scheduled or accepted)."
              )}
            </p>
          </div>
        </label>
      </div>

      {/* Tombol Simpan Terpadu */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D500] active:scale-98 text-black font-black text-sm transition-all shadow-2xs hover:shadow flex items-center justify-center gap-2 min-h-[48px] cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>{t("Menyimpan Biodata & Profil...", "Saving Biodata & Profile...")}</span>
            </>
          ) : (
            <span>{t("Simpan Biodata & Profil", "Save Biodata & Profile")}</span>
          )}
        </button>
      </div>
    </form>
  );
}
