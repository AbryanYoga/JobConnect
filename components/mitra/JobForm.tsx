"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  MapPin,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  EDUCATION_LABEL,
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";
import { JOB_LIMITS } from "@/lib/validation/lowongan";
import {
  saveJobDraftAction,
  submitJobAction,
} from "@/app/actions/mitra";

export interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export interface ProvinceOption {
  id: number;
  name: string;
}

export interface CityOption {
  id: number;
  province_id: number;
  name: string;
  type?: string;
}

export interface JobFormData {
  id?: number;
  title: string;
  summary: string;
  categoryId: number | "" | "custom";
  customCategoryName?: string;
  workMode: WorkMode;
  jobType: JobType;
  educationMin: EducationMin;
  experienceMinYears: number;
  skills: string[];
  responsibilities: string[];
  niceToHave: string[];
  benefits: string[];
  salaryMin: number | "";
  salaryMax: number | "";
  deadline: string;
  aiScreening?: boolean;
  provinceId?: number | "";
  cityId?: number | "";
  locationDetail?: string;
  [key: string]: unknown;
}

interface JobFormProps {
  categories: CategoryOption[];
  provinces?: ProvinceOption[];
  cities?: CityOption[];
  initialData?: Partial<JobFormData>;
  isEditing?: boolean;
  onSubmitDraft?: (data: JobFormData) => Promise<void>;
  onSubmitPending?: (data: JobFormData) => Promise<void>;
  showHeader?: boolean;
}

function CharCounter({
  current,
  min,
  max,
}: {
  current: number;
  min?: number;
  max: number;
}) {
  const isTooShort = min !== undefined && current > 0 && current < min;
  const isAtLimit = current >= max;
  return (
    <span
      className={`text-xs font-semibold tabular-nums ${
        isTooShort
          ? "text-amber-600"
          : isAtLimit
          ? "text-red-600 font-bold"
          : "text-slate-400"
      }`}
      aria-live="polite"
    >
      {current}/{max}
      {min !== undefined && current < min && (
        <span className="ml-1 text-[11px] font-normal">(min. {min})</span>
      )}
    </span>
  );
}

function formatNumberWithDots(val: number | string | ""): string {
  if (val === "" || val === null || val === undefined) return "";
  const numeric = typeof val === "number" ? val : parseInt(String(val).replace(/\D/g, ""), 10);
  if (isNaN(numeric)) return "";
  return new Intl.NumberFormat("id-ID").format(numeric);
}

function parseNumberFromDots(val: string): number | "" {
  const digitsOnly = val.replace(/\D/g, "");
  if (!digitsOnly) return "";
  const parsed = parseInt(digitsOnly, 10);
  return isNaN(parsed) ? "" : parsed;
}

export function JobForm({
  categories,
  provinces = [],
  cities = [],
  initialData,
  isEditing = false,
  showHeader = true,
}: JobFormProps) {
  const { t, language } = useLanguage();

  // Field-field utama kriteria terstruktur
  const [title, setTitle] = useState(initialData?.title || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [categoryId, setCategoryId] = useState<number | "" | "custom">(
    initialData?.categoryId ?? (categories[0]?.id || "")
  );
  const [customCategoryName, setCustomCategoryName] = useState(
    initialData?.customCategoryName || ""
  );
  const [workMode, setWorkMode] = useState<WorkMode>(
    initialData?.workMode || "onsite"
  );
  const [jobType, setJobType] = useState<JobType>(
    initialData?.jobType || "full_time"
  );
  const [educationMin, setEducationMin] = useState<EducationMin>(
    initialData?.educationMin || "sma_smk"
  );
  const [experienceMinYears, setExperienceMinYears] = useState<number>(
    initialData?.experienceMinYears ?? 0
  );

  // Lokasi penempatan kerja (Provinsi dan Kota berjenjang)
  const [provinceId, setProvinceId] = useState<number | "">(
    initialData?.provinceId ?? ""
  );
  const [cityId, setCityId] = useState<number | "">(
    initialData?.cityId ?? ""
  );
  const [locationDetail, setLocationDetail] = useState(
    initialData?.locationDetail || ""
  );

  const availableCities = cities.filter(
    (city) => city.province_id === Number(provinceId)
  );

  const handleProvinceChange = (newProvId: number | "") => {
    setProvinceId(newProvId);
    setCityId("");
  };

  // Array kriteria terstruktur
  const [skills, setSkills] = useState<string[]>(
    initialData?.skills?.length ? initialData.skills : [""]
  );
  const [currentSkillInput, setCurrentSkillInput] = useState("");

  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialData?.responsibilities?.length
      ? initialData.responsibilities
      : ["", "", ""]
  );

  const [niceToHave, setNiceToHave] = useState<string[]>(
    initialData?.niceToHave || []
  );

  const [benefits, setBenefits] = useState<string[]>(
    initialData?.benefits || []
  );

  // Kompensasi & Batas Waktu
  const [salaryMin, setSalaryMin] = useState<number | "">(
    initialData?.salaryMin ?? ""
  );
  const [salaryMax, setSalaryMax] = useState<number | "">(
    initialData?.salaryMax ?? ""
  );
  const [deadline, setDeadline] = useState(initialData?.deadline || "");

  const router = useRouter();
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const getJobPayload = (cleanSkills?: string[], cleanResp?: string[]): JobFormData => ({
    id: initialData?.id,
    title,
    summary,
    categoryId,
    customCategoryName: categoryId === "custom" ? customCategoryName.trim() : undefined,
    provinceId,
    cityId,
    locationDetail,
    workMode,
    jobType,
    educationMin,
    experienceMinYears,
    skills: cleanSkills ?? skills,
    responsibilities: cleanResp ?? responsibilities,
    niceToHave,
    benefits,
    salaryMin,
    salaryMax,
    deadline,
    aiScreening: false,
  });

  const handleSaveDraft = async () => {
    setFormError(null);
    setFormSuccess(null);
    setIsSavingDraft(true);
    try {
      const res = await saveJobDraftAction(getJobPayload());
      if (!res.success) {
        setFormError(res.error || "Gagal menyimpan draft lowongan.");
      } else {
        setFormSuccess(res.message || "Draft berhasil disimpan!");
        router.push("/mitra/lowongan");
      }
    } catch {
      setFormError("Terjadi kesalahan teknis saat menyimpan draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    setFormError(null);
    setFormSuccess(null);

    if (!title.trim() || title.trim().length < JOB_LIMITS.title.min) {
      setFormError(`Judul lowongan minimal ${JOB_LIMITS.title.min} karakter.`);
      return;
    }
    if (!summary.trim() || summary.trim().length < JOB_LIMITS.summary.min) {
      setFormError(`Ringkasan pekerjaan minimal ${JOB_LIMITS.summary.min} karakter.`);
      return;
    }
    const validSkills = skills.filter(Boolean);
    if (validSkills.length < 1) {
      setFormError("Keahlian wajib minimal 1 item.");
      return;
    }
    const validResp = responsibilities.filter(Boolean);
    if (validResp.length < 3) {
      setFormError("Tanggung jawab utama wajib diisi minimal 3 poin.");
      return;
    }
    if (workMode !== "remote" && !cityId) {
      setFormError("Kota penempatan wajib dipilih untuk mode kerja Onsite atau Hybrid.");
      return;
    }
    if (!deadline.trim()) {
      setFormError("Batas waktu lamaran (deadline) wajib diisi untuk pengajuan lowongan.");
      return;
    }
    if (categoryId === "custom" && (!customCategoryName.trim() || customCategoryName.trim().length < 2)) {
      setFormError("Nama kategori kustom baru wajib diisi minimal 2 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitJobAction(getJobPayload(validSkills, validResp));
      if (!res.success) {
        setFormError(res.error || "Gagal mengajukan lowongan.");
      } else {
        setFormSuccess(res.message || "Lowongan berhasil diajukan!");
        router.push("/mitra/lowongan");
      }
    } catch {
      setFormError("Terjadi kesalahan teknis saat mengajukan lowongan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number, val: string) => {
    setter((prev) => {
      const updated = [...prev];
      updated[idx] = val;
      return updated;
    });
  };
  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, max: number) => {
    setter((prev) => (prev.length < max ? [...prev, ""] : prev));
  };
  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number, min: number = 0) => {
    setter((prev) => (prev.length > min ? prev.filter((_, i) => i !== idx) : prev));
  };

  const handleAddSkill = () => {
    const trimmed = currentSkillInput.trim();
    if (trimmed && skills.filter(Boolean).length < JOB_LIMITS.skills.max && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev.filter(Boolean), trimmed]);
    }
    setCurrentSkillInput("");
  };
  const handleRemoveSkill = (index: number) => setSkills((prev) => prev.filter((_, i) => i !== index));

  const handleResponsibilityChange = (i: number, v: string) => updateItem(setResponsibilities, i, v);
  const handleAddResponsibility = () => addItem(setResponsibilities, JOB_LIMITS.responsibilities.max);
  const handleRemoveResponsibility = (i: number) => removeItem(setResponsibilities, i, JOB_LIMITS.responsibilities.min);

  const handleNiceToHaveChange = (i: number, v: string) => updateItem(setNiceToHave, i, v);
  const handleAddNiceToHave = () => addItem(setNiceToHave, JOB_LIMITS.niceToHave.max);
  const handleRemoveNiceToHave = (i: number) => removeItem(setNiceToHave, i);

  const handleBenefitChange = (i: number, v: string) => updateItem(setBenefits, i, v);
  const handleAddBenefit = () => addItem(setBenefits, JOB_LIMITS.benefits.max);
  const handleRemoveBenefit = (i: number) => removeItem(setBenefits, i);

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      {/* Header Formulir Pengajuan (jika diminta oleh halaman dan bukan mode edit) */}
      {showHeader && !isEditing && (
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
            <span>{t("Verifikasi Moderasi Admin", "Admin Moderation Verification")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            {t("Pasang Lowongan Pekerjaan Baru", "Post New Job Vacancy")}
          </h1>
          <p className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
            {t(
              "Tentukan kualifikasi yang jelas dan terstruktur. Setelah diajukan, lowongan akan ditinjau oleh admin JobConnect sebelum ditayangkan ke publik demi menjamin platform bebas dari calo dan penipuan.",
              "Define clear and structured qualifications. Once submitted, the vacancy will be reviewed by JobConnect administrators before publishing to ensure the platform is free from brokers and fraud."
            )}
          </p>
        </div>
      )}

      {/* Alert Error / Sukses */}
      {formError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3 font-medium"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-bold block">{t("Terdapat kesalahan isian:", "Input errors occurred:")}</span>
            <span>{formError}</span>
          </div>
        </div>
      )}

      {formSuccess && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3 font-medium"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" aria-hidden="true" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* 1. Informasi Dasar Posisi */}
      <section className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-black/[0.06]">
          <div className="w-9 h-9 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shadow-2xs">
            <Briefcase className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-black text-black">
              {t("1. Identitas Posisi & Ringkasan", "1. Position Identity & Summary")}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t("Judul pekerjaan dan gambaran ringkas peran ini.", "Job title and concise summary of this role.")}
            </p>
          </div>
        </div>

        {/* Input Judul Lowongan */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="title" className="block text-sm font-bold text-black">
              {t("Judul Lowongan", "Job Title")} <span className="text-red-500">*</span>
            </label>
            <CharCounter
              current={title.length}
              min={JOB_LIMITS.title.min}
              max={JOB_LIMITS.title.max}
            />
          </div>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={JOB_LIMITS.title.max}
            placeholder={language === "en" ? "e.g. Frontend Engineer, Warehouse Administrator" : "Contoh: Frontend Engineer, Staff Administrasi Gudang"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
          />
          <p className="text-xs text-slate-500 font-medium">
            {language === "en"
              ? `Minimum ${JOB_LIMITS.title.min} characters, maximum ${JOB_LIMITS.title.max} characters.`
              : `Minimal ${JOB_LIMITS.title.min} karakter, maksimal ${JOB_LIMITS.title.max} karakter.`}
          </p>
        </div>

        {/* Pilihan Kategori */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="category" className="block text-sm font-bold text-black">
              {t("Kategori Pekerjaan", "Job Category")} <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-slate-500 font-medium">
              {t("Tidak menemukan kategori yang sesuai? Pilih kustom di bawah", "Can't find a matching category? Select custom below")}
            </span>
          </div>
          <select
            id="category"
            name="category"
            required
            value={categoryId}
            onChange={(e) => {
              const val = e.target.value;
              setCategoryId(val === "custom" ? "custom" : Number(val));
            }}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {t(cat.name, cat.name)}
              </option>
            ))}
            <option value="custom">
              {t("+ Kategori Lainnya (Tentukan Kategori Baru)", "+ Other Category (Specify New Category)")}
            </option>
          </select>

          {/* Kolom Input Kategori Kustom Baru Jika Belum Tersedia */}
          {categoryId === "custom" && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2 animate-in fade-in duration-200">
              <label htmlFor="custom-category" className="block text-xs font-bold text-amber-950">
                {t("Nama Kategori Baru Perusahaan Anda", "Your Company New Category Name")} <span className="text-red-500">*</span>
              </label>
              <input
                id="custom-category"
                type="text"
                placeholder={language === "en" ? "e.g. Information Technology, Logistics & Warehousing, Hospitality" : "Contoh: Teknologi Informasi, Logistik & Pergudangan, Perhotelan"}
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                maxLength={60}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-amber-300 focus:border-black text-sm font-medium text-black focus:outline-none transition shadow-2xs"
              />
              <p className="text-[11px] text-amber-800 font-medium">
                {t(
                  "Kategori ini akan otomatis didaftarkan dan dapat ditinjau oleh admin saat moderasi lowongan.",
                  "This category will be automatically registered and reviewed by admin during moderation."
                )}
              </p>
            </div>
          )}
        </div>

        {/* Ringkasan Satu Paragraf */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="summary" className="block text-sm font-bold text-black">
              {t("Ringkasan Pekerjaan", "Job Summary")} <span className="text-red-500">*</span>
            </label>
            <CharCounter
              current={summary.length}
              min={JOB_LIMITS.summary.min}
              max={JOB_LIMITS.summary.max}
            />
          </div>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            required
            maxLength={JOB_LIMITS.summary.max}
            placeholder={
              language === "en"
                ? "Write 1 concise paragraph about this role and key candidate duties."
                : "Tuliskan 1 paragraf ringkas tentang peran ini dan apa yang akan dikerjakan kandidat."
            }
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
          />
          <p className="text-xs text-slate-500 font-medium">
            {language === "en"
              ? `Minimum ${JOB_LIMITS.summary.min} characters, maximum ${JOB_LIMITS.summary.max} characters.`
              : `Minimal ${JOB_LIMITS.summary.min} karakter, maksimal ${JOB_LIMITS.summary.max} karakter.`}
          </p>
        </div>
      </section>

      {/* 2. Kriteria Utama Terstruktur */}
      <section className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-black/[0.06]">
          <div className="w-9 h-9 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shadow-2xs">
            <GraduationCap className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-black text-black">
              {t("2. Kriteria Utama Terstruktur", "2. Structured Key Criteria")}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t(
                "Mode kerja, tipe kontrak, syarat pendidikan, dan pengalaman.",
                "Work mode, contract type, education requirement, and experience."
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Mode Kerja */}
          <div className="space-y-2">
            <label htmlFor="workMode" className="block text-sm font-bold text-black">
              {t("Mode Kerja", "Work Mode")} <span className="text-red-500">*</span>
            </label>
            <select
              id="workMode"
              name="workMode"
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value as WorkMode)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            >
              {(Object.keys(WORK_MODE_LABEL) as WorkMode[]).map((mode) => (
                <option key={mode} value={mode}>
                  {t(WORK_MODE_LABEL[mode], WORK_MODE_LABEL[mode])}
                </option>
              ))}
            </select>
          </div>

          {/* Tipe Pekerjaan */}
          <div className="space-y-2">
            <label htmlFor="jobType" className="block text-sm font-bold text-black">
              {t("Tipe Pekerjaan", "Job Type")} <span className="text-red-500">*</span>
            </label>
            <select
              id="jobType"
              name="jobType"
              value={jobType}
              onChange={(e) => setJobType(e.target.value as JobType)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            >
              {(Object.keys(JOB_TYPE_LABEL) as JobType[]).map((type) => (
                <option key={type} value={type}>
                  {t(JOB_TYPE_LABEL[type], JOB_TYPE_LABEL[type])}
                </option>
              ))}
            </select>
          </div>

          {/* Pendidikan Minimal */}
          <div className="space-y-2">
            <label htmlFor="educationMin" className="block text-sm font-bold text-black">
              {t("Pendidikan Minimal", "Minimum Education")} <span className="text-red-500">*</span>
            </label>
            <select
              id="educationMin"
              name="educationMin"
              value={educationMin}
              onChange={(e) => setEducationMin(e.target.value as EducationMin)}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            >
              {(Object.keys(EDUCATION_LABEL) as EducationMin[]).map((edu) => (
                <option key={edu} value={edu}>
                  {t(EDUCATION_LABEL[edu], EDUCATION_LABEL[edu])}
                </option>
              ))}
            </select>
          </div>

          {/* Pengalaman Minimal (Tahun) */}
          <div className="space-y-2">
            <label htmlFor="experienceMin" className="block text-sm font-bold text-black">
              {t("Pengalaman Minimal (Tahun)", "Minimum Experience (Years)")} <span className="text-red-500">*</span>
            </label>
            <input
              id="experienceMin"
              name="experienceMin"
              type="number"
              min={0}
              max={20}
              value={experienceMinYears}
              onChange={(e) => setExperienceMinYears(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            />
            <p className="text-xs text-slate-500 font-medium">
              {t("Isi 0 jika posisi terbuka bagi lulusan baru (fresh graduate).", "Enter 0 if the position is open for fresh graduates.")}
            </p>
          </div>
        </div>

        {/* Tag Input Keahlian Wajib (Skills) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-black">
              {language === "en"
                ? `Required Skills (${skills.filter(Boolean).length} of max. ${JOB_LIMITS.skills.max})`
                : `Keahlian Wajib (${skills.filter(Boolean).length} dari maks. ${JOB_LIMITS.skills.max})`} <span className="text-red-500">*</span>
            </label>
            <CharCounter
              current={currentSkillInput.length}
              max={JOB_LIMITS.skills.itemMax}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={JOB_LIMITS.skills.itemMax}
              placeholder={language === "en" ? "e.g. React, Microsoft Excel, Graphic Design" : "Contoh: React, Microsoft Excel, Desain Grafis"}
              value={currentSkillInput}
              onChange={(e) => setCurrentSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              className="flex-1 px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-5 py-3 rounded-2xl bg-black text-white hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 shrink-0 min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t("Tambah", "Add")}</span>
            </button>
          </div>

          {/* Chip List Skills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {skills.filter(Boolean).map((skill, index) => (
              <span
                key={`${skill}-${index}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.08] text-black text-xs font-bold"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center transition cursor-pointer"
                  aria-label={language === "en" ? `Remove ${skill}` : `Hapus ${skill}`}
                >
                  <Trash2 className="w-3 h-3 text-slate-500 hover:text-red-600" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Lokasi & Penempatan Kerja */}
      <section className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-black/[0.06]">
          <div className="w-9 h-9 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shadow-2xs">
            <MapPin className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-black text-black">
              {t("3. Lokasi & Penempatan Kerja", "3. Location & Placement")}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t(
                "Provinsi dan kota penempatan kerja (berjenjang sesuai Kemendagri).",
                "Work placement province and city (aligned with official administrative boundaries)."
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Dropdown Provinsi */}
          <div className="space-y-2">
            <label htmlFor="province" className="block text-sm font-bold text-black">
              {t("Provinsi Penempatan", "Placement Province")} {workMode !== "remote" && <span className="text-red-500">*</span>}
            </label>
            <select
              id="province"
              name="province"
              value={provinceId}
              onChange={(e) => handleProvinceChange(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            >
              <option value="">{t("-- Pilih Provinsi --", "-- Select Province --")}</option>
              {provinces.map((prov) => (
                <option key={prov.id} value={prov.id}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown Kota / Kabupaten Berjenjang */}
          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-bold text-black">
              {t("Kota / Kabupaten Penempatan", "Placement City / Regency")} {workMode !== "remote" && <span className="text-red-500">*</span>}
            </label>
            <select
              id="city"
              name="city"
              disabled={!provinceId}
              value={cityId}
              onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : "")}
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
          </div>
        </div>

        {/* Catatan Area / Alamat Singkat */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="locationDetail" className="block text-sm font-bold text-black">
              {t("Area atau Alamat Singkat Kantor (Opsional)", "Office Area or Brief Address (Optional)")}
            </label>
            <CharCounter
              current={locationDetail.length}
              max={JOB_LIMITS.locationDetail.max}
            />
          </div>
          <input
            id="locationDetail"
            name="locationDetail"
            type="text"
            maxLength={JOB_LIMITS.locationDetail.max}
            placeholder={
              language === "en"
                ? "e.g. Near Pasteur Toll, Jababeka Industrial Area, or building name"
                : "Contoh: Dekat Tol Pasteur, Kawasan Industri Jababeka, atau nama gedung"
            }
            value={locationDetail}
            onChange={(e) => setLocationDetail(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
          />
          {workMode === "remote" ? (
            <p className="text-xs text-emerald-700 font-medium">
              {t(
                "Mode kerja Remote: pemilihan lokasi bersifat opsional jika posisi dapat dikerjakan sepenuhnya dari mana saja.",
                "Remote work mode: location selection is optional if the position can be performed completely from anywhere."
              )}
            </p>
          ) : (
            <p className="text-xs text-slate-500 font-medium">
              {t(
                "Kota dan provinsi wajib dipilih untuk lowongan Onsite atau Hybrid.",
                "City and province must be selected for Onsite or Hybrid vacancies."
              )}
            </p>
          )}
        </div>
      </section>

      {/* 4. Rincian Tanggung Jawab & Benefit */}
      <section className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-black/[0.06]">
          <div className="w-9 h-9 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shadow-2xs">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-black text-black">
              {t("4. Rincian Tanggung Jawab & Benefit", "4. Responsibilities & Benefits")}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t("Poin tugas utama, nilai tambah, dan fasilitas yang didapatkan.", "Core duties, value-add criteria, and provided benefits.")}
            </p>
          </div>
        </div>

        {/* Poin Tanggung Jawab (Wajib 3-6) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-black">
              {t("Tanggung Jawab Utama (3 hingga 6 Poin)", "Core Responsibilities (3 to 6 Points)")} <span className="text-red-500">*</span>
            </label>
            {responsibilities.length < JOB_LIMITS.responsibilities.max && (
              <button
                type="button"
                onClick={handleAddResponsibility}
                className="text-xs font-bold text-black hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("Tambah Poin", "Add Point")}</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {responsibilities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-center text-xs font-black text-slate-400">
                  {idx + 1}.
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={JOB_LIMITS.responsibilities.itemMax}
                    placeholder={language === "en" ? `Core duty #${idx + 1}` : `Tugas pokok ke-${idx + 1}`}
                    value={item}
                    onChange={(e) => handleResponsibilityChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
                  />
                  <CharCounter
                    current={item.length}
                    max={JOB_LIMITS.responsibilities.itemMax}
                  />
                </div>
                {responsibilities.length > JOB_LIMITS.responsibilities.min && (
                  <button
                    type="button"
                    onClick={() => handleRemoveResponsibility(idx)}
                    className="p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
                    aria-label={t("Hapus baris tanggung jawab", "Remove responsibility row")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Nilai Tambah (Nice to have, Opsional) */}
        <div className="space-y-3 pt-3 border-t border-black/[0.06]">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-black">
              {t("Nilai Tambah / Nice to Have (Opsional, Maks 5 Poin)", "Nice to Have / Value Add (Optional, Max 5 Points)")}
            </label>
            {niceToHave.length < JOB_LIMITS.niceToHave.max && (
              <button
                type="button"
                onClick={handleAddNiceToHave}
                className="text-xs font-bold text-black hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("Tambah Nilai Tambah", "Add Nice to Have")}</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {niceToHave.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-center text-xs font-black text-slate-400">
                  +
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={JOB_LIMITS.niceToHave.itemMax}
                    placeholder={language === "en" ? "Preferred additional qualification" : "Kriteria nilai tambah yang disukai"}
                    value={item}
                    onChange={(e) => handleNiceToHaveChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
                  />
                  <CharCounter
                    current={item.length}
                    max={JOB_LIMITS.niceToHave.itemMax}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveNiceToHave(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
                  aria-label={t("Hapus baris nilai tambah", "Remove nice-to-have row")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Fasilitas & Benefit (Opsional) */}
        <div className="space-y-3 pt-3 border-t border-black/[0.06]">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-black">
              {t("Fasilitas & Benefit (Opsional, Maks 6 Poin)", "Facilities & Benefits (Optional, Max 6 Points)")}
            </label>
            {benefits.length < JOB_LIMITS.benefits.max && (
              <button
                type="button"
                onClick={handleAddBenefit}
                className="text-xs font-bold text-black hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("Tambah Benefit", "Add Benefit")}</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {benefits.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-center text-xs font-black text-slate-400">
                  •
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={JOB_LIMITS.benefits.itemMax}
                    placeholder={language === "en" ? "e.g. Health Insurance, Meal Allowance, Company Laptop" : "Contoh: BPJS Kesehatan, Tunjangan Makan, Laptop Perusahaan"}
                    value={item}
                    onChange={(e) => handleBenefitChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
                  />
                  <CharCounter
                    current={item.length}
                    max={JOB_LIMITS.benefits.itemMax}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 transition cursor-pointer"
                  aria-label={t("Hapus baris benefit", "Remove benefit row")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Kompensasi & Batas Waktu */}
      <section className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-black/[0.06]">
          <div className="w-9 h-9 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shadow-2xs">
            <Briefcase className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-black text-black">
              {t("5. Kompensasi & Penutupan", "5. Compensation & Closing")}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t("Rentang gaji bulanan dan tanggal batas akhir lamaran.", "Monthly salary range and application closing date.")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="salaryMin" className="block text-sm font-bold text-black">
              {t("Gaji Minimal (Rp, Opsional)", "Minimum Salary (IDR, Optional)")}
            </label>
            <input
              id="salaryMin"
              name="salaryMin"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Contoh: 5.000.000"
              value={formatNumberWithDots(salaryMin)}
              onChange={(e) =>
                setSalaryMin(parseNumberFromDots(e.target.value))
              }
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="salaryMax" className="block text-sm font-bold text-black">
              {t("Gaji Maksimal (Rp, Opsional)", "Maximum Salary (IDR, Optional)")}
            </label>
            <input
              id="salaryMax"
              name="salaryMax"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Contoh: 8.000.000"
              value={formatNumberWithDots(salaryMax)}
              onChange={(e) =>
                setSalaryMax(parseNumberFromDots(e.target.value))
              }
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="deadline" className="block text-sm font-bold text-black">
            {t("Batas Akhir Lamaran (Opsional)", "Application Deadline (Optional)")}
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full sm:w-72 px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
          />
        </div>
      </section>

      {/* Navigasi & Tombol Aksi Simpan Draft / Submit */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-black/[0.08]">
        <Link
          href="/mitra/lowongan"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full hover:bg-black/[0.05] text-black font-bold text-sm transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEditing ? t("Batal Perubahan", "Cancel Changes") : t("Batal", "Cancel")}</span>
        </Link>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            disabled={isSavingDraft || isSubmitting}
            onClick={handleSaveDraft}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-black/[0.04] text-black font-bold text-sm border border-black/[0.12] transition min-h-[44px] disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingDraft ? t("Menyimpan Draft...", "Saving Draft...") : t("Simpan sebagai Draft", "Save as Draft")}</span>
          </button>

          <button
            type="button"
            disabled={isSavingDraft || isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] active:scale-95 text-black font-black text-sm shadow-2xs hover:shadow transition min-h-[44px] disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2.2]" />
            <span>{isSubmitting ? t("Mengajukan...", "Submitting...") : t("Ajukan Lowongan", "Submit Vacancy")}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
