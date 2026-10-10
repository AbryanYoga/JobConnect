"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Bot,
} from "lucide-react";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  EDUCATION_LABEL,
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";
import { JOB_LIMITS } from "@/lib/validation/lowongan";

export interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export interface JobFormData {
  title: string;
  summary: string;
  categoryId: number | "";
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
  aiScreening: boolean;
  provinceId?: number | "";
  cityId?: number | "";
  locationDetail?: string;
}

interface JobFormProps {
  categories: CategoryOption[];
  initialData?: Partial<JobFormData>;
  isEditing?: boolean;
  onSubmitDraft?: (data: JobFormData) => Promise<void>;
  onSubmitPending?: (data: JobFormData) => Promise<void>;
}

export function JobForm({
  categories,
  initialData,
  isEditing = false,
}: JobFormProps) {
  // Field-field utama kriteria terstruktur
  const [title, setTitle] = useState(initialData?.title || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [categoryId, setCategoryId] = useState<number | "">(
    initialData?.categoryId ?? (categories[0]?.id || "")
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
  const [aiScreening, setAiScreening] = useState(
    initialData?.aiScreening ?? true
  );

  // Helper tambah skill
  const handleAddSkill = () => {
    const trimmed = currentSkillInput.trim();
    if (!trimmed) return;
    if (skills.filter(Boolean).length >= JOB_LIMITS.skills.max) return;
    if (!skills.includes(trimmed)) {
      setSkills((prev) => [...prev.filter(Boolean), trimmed]);
    }
    setCurrentSkillInput("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper tambah/ubah responsibility
  const handleResponsibilityChange = (index: number, val: string) => {
    setResponsibilities((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleAddResponsibility = () => {
    if (responsibilities.length < JOB_LIMITS.responsibilities.max) {
      setResponsibilities((prev) => [...prev, ""]);
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    if (responsibilities.length > JOB_LIMITS.responsibilities.min) {
      setResponsibilities((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Helper nilai tambah (nice to have)
  const handleNiceToHaveChange = (index: number, val: string) => {
    setNiceToHave((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleAddNiceToHave = () => {
    if (niceToHave.length < JOB_LIMITS.niceToHave.max) {
      setNiceToHave((prev) => [...prev, ""]);
    }
  };

  const handleRemoveNiceToHave = (index: number) => {
    setNiceToHave((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper benefit
  const handleBenefitChange = (index: number, val: string) => {
    setBenefits((prev) => {
      const updated = [...prev];
      updated[index] = val;
      return updated;
    });
  };

  const handleAddBenefit = () => {
    if (benefits.length < JOB_LIMITS.benefits.max) {
      setBenefits((prev) => [...prev, ""]);
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
      {/* 1. Informasi Dasar Posisi */}
      <section className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-black/[0.06]">
          <div className="w-9 h-9 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shadow-2xs">
            <Briefcase className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-black text-black">
              1. Identitas Posisi & Ringkasan
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Judul pekerjaan dan gambaran ringkas peran ini.
            </p>
          </div>
        </div>

        {/* Input Judul Lowongan */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-bold text-black">
            Judul Lowongan <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            maxLength={JOB_LIMITS.title.max}
            placeholder="Contoh: Frontend Engineer, Staff Administrasi Gudang"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
          />
          <p className="text-xs text-slate-500 font-medium">
            Minimal {JOB_LIMITS.title.min} karakter, maksimal {JOB_LIMITS.title.max} karakter.
          </p>
        </div>

        {/* Pilihan Kategori */}
        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-bold text-black">
            Kategori Pekerjaan <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ringkasan Satu Paragraf */}
        <div className="space-y-2">
          <label htmlFor="summary" className="block text-sm font-bold text-black">
            Ringkasan Pekerjaan <span className="text-red-500">*</span>
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={3}
            required
            maxLength={JOB_LIMITS.summary.max}
            placeholder="Tuliskan 1 paragraf ringkas tentang peran ini dan apa yang akan dikerjakan kandidat."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
          />
          <p className="text-xs text-slate-500 font-medium">
            Minimal {JOB_LIMITS.summary.min} karakter, maksimal {JOB_LIMITS.summary.max} karakter.
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
              2. Kriteria Utama Terstruktur
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Mode kerja, tipe kontrak, syarat pendidikan, dan pengalaman.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Mode Kerja */}
          <div className="space-y-2">
            <label htmlFor="workMode" className="block text-sm font-bold text-black">
              Mode Kerja <span className="text-red-500">*</span>
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
                  {WORK_MODE_LABEL[mode]}
                </option>
              ))}
            </select>
          </div>

          {/* Tipe Pekerjaan */}
          <div className="space-y-2">
            <label htmlFor="jobType" className="block text-sm font-bold text-black">
              Tipe Pekerjaan <span className="text-red-500">*</span>
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
                  {JOB_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </div>

          {/* Pendidikan Minimal */}
          <div className="space-y-2">
            <label htmlFor="educationMin" className="block text-sm font-bold text-black">
              Pendidikan Minimal <span className="text-red-500">*</span>
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
                  {EDUCATION_LABEL[edu]}
                </option>
              ))}
            </select>
          </div>

          {/* Pengalaman Minimal (Tahun) */}
          <div className="space-y-2">
            <label htmlFor="experienceMin" className="block text-sm font-bold text-black">
              Pengalaman Minimal (Tahun) <span className="text-red-500">*</span>
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
              Isi 0 jika posisi terbuka bagi lulusan baru (fresh graduate).
            </p>
          </div>
        </div>

        {/* Tag Input Keahlian Wajib (Skills) */}
        <div className="space-y-3 pt-2">
          <label className="block text-sm font-bold text-black">
            Keahlian Wajib (1 hingga 8 Keahlian) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={JOB_LIMITS.skills.itemMax}
              placeholder="Contoh: React, Microsoft Excel, Desain Grafis"
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
              className="px-5 py-3 rounded-2xl bg-black text-white hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 shrink-0 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah</span>
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
                  className="w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center transition"
                  aria-label={`Hapus ${skill}`}
                >
                  <Trash2 className="w-3 h-3 text-slate-500 hover:text-red-600" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Tugas Utama & Fasilitas */}
      <section className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-black/[0.06]">
          <div className="w-9 h-9 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shadow-2xs">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-black text-black">
              3. Rincian Tanggung Jawab & Benefit
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Poin tugas utama, nilai tambah, dan fasilitas yang didapatkan.
            </p>
          </div>
        </div>

        {/* Poin Tanggung Jawab (Wajib 3-6) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-black">
              Tanggung Jawab Utama (3 hingga 6 Poin) <span className="text-red-500">*</span>
            </label>
            {responsibilities.length < JOB_LIMITS.responsibilities.max && (
              <button
                type="button"
                onClick={handleAddResponsibility}
                className="text-xs font-bold text-black hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Poin</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {responsibilities.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-center text-xs font-black text-slate-400">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  maxLength={JOB_LIMITS.responsibilities.itemMax}
                  placeholder={`Tugas pokok ke-${idx + 1}`}
                  value={item}
                  onChange={(e) => handleResponsibilityChange(idx, e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
                />
                {responsibilities.length > JOB_LIMITS.responsibilities.min && (
                  <button
                    type="button"
                    onClick={() => handleRemoveResponsibility(idx)}
                    className="p-2 text-slate-400 hover:text-red-600 transition"
                    aria-label="Hapus baris tanggung jawab"
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
              Nilai Tambah / Nice to Have (Opsional, Maks 5 Poin)
            </label>
            {niceToHave.length < JOB_LIMITS.niceToHave.max && (
              <button
                type="button"
                onClick={handleAddNiceToHave}
                className="text-xs font-bold text-black hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Nilai Tambah</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {niceToHave.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-center text-xs font-black text-slate-400">
                  +
                </span>
                <input
                  type="text"
                  maxLength={JOB_LIMITS.niceToHave.itemMax}
                  placeholder="Kriteria nilai tambah yang disukai"
                  value={item}
                  onChange={(e) => handleNiceToHaveChange(idx, e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveNiceToHave(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 transition"
                  aria-label="Hapus baris nilai tambah"
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
              Fasilitas & Benefit (Opsional, Maks 6 Poin)
            </label>
            {benefits.length < JOB_LIMITS.benefits.max && (
              <button
                type="button"
                onClick={handleAddBenefit}
                className="text-xs font-bold text-black hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Benefit</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {benefits.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 text-center text-xs font-black text-slate-400">
                  •
                </span>
                <input
                  type="text"
                  maxLength={JOB_LIMITS.benefits.itemMax}
                  placeholder="Contoh: BPJS Kesehatan, Tunjangan Makan, Laptop Perusahaan"
                  value={item}
                  onChange={(e) => handleBenefitChange(idx, e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveBenefit(idx)}
                  className="p-2 text-slate-400 hover:text-red-600 transition"
                  aria-label="Hapus baris benefit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Kompensasi & Batas Waktu */}
      <section className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-black/[0.06]">
          <div className="w-9 h-9 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shadow-2xs">
            <Briefcase className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-black text-black">
              4. Kompensasi & Penutupan
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Rentang gaji bulanan dan tanggal batas akhir lamaran.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label htmlFor="salaryMin" className="block text-sm font-bold text-black">
              Gaji Minimal (Rp, Opsional)
            </label>
            <input
              id="salaryMin"
              name="salaryMin"
              type="number"
              min={0}
              placeholder="Contoh: 5000000"
              value={salaryMin}
              onChange={(e) =>
                setSalaryMin(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="salaryMax" className="block text-sm font-bold text-black">
              Gaji Maksimal (Rp, Opsional)
            </label>
            <input
              id="salaryMax"
              name="salaryMax"
              type="number"
              min={0}
              placeholder="Contoh: 8000000"
              value={salaryMax}
              onChange={(e) =>
                setSalaryMax(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] focus:border-black focus:bg-white text-sm font-medium transition text-black"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="deadline" className="block text-sm font-bold text-black">
            Batas Akhir Lamaran (Opsional)
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

        {/* Analisis AI Screening */}
        <div className="pt-3 border-t border-black/[0.06]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={aiScreening}
              onChange={(e) => setAiScreening(e.target.checked)}
              className="w-5 h-5 rounded-md border-black/20 text-black focus:ring-black mt-0.5"
            />
            <div className="space-y-1">
              <span className="text-sm font-bold text-black flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-black" aria-hidden="true" />
                <span>Aktifkan Rekomendasi Screening CV Berbantuan AI</span>
              </span>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Sistem akan memberikan skor kecocokan dan ringkasan kualifikasi CV pelamar secara otomatis sebagai bahan pertimbangan tim rekrutmen. Keputusan akhir tetap sepenuhnya di tangan Anda.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* Navigasi Bawah */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <Link
          href="/mitra/lowongan"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full hover:bg-black/[0.05] text-black font-bold text-sm transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEditing ? "Batal Perubahan" : "Batal"}</span>
        </Link>
      </div>
    </form>
  );
}
