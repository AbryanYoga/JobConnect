"use client";

import { useState } from "react";
import {
  Banknote,
  GraduationCap,
  Clock,
  Briefcase,
  Laptop,
  Calendar,
  MapPin,
  Share2,
  Check,
  Bookmark,
  ShieldCheck,
} from "lucide-react";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  EDUCATION_LABEL,
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";

export interface MainCriteriaCardProps {
  salaryMin?: number | null;
  salaryMax?: number | null;
  educationMin: string;
  experienceMinYears?: number;
  jobType: string;
  workMode: string;
  deadline?: string | null;
  skills?: string[];
  locationText: string;
  locationDetail?: string | null;
  isOpen: boolean;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatSalary(min?: number | null, max?: number | null): string {
  if (min && max) {
    return `${formatRupiah(min)} - ${formatRupiah(max)}`;
  }
  if (min) {
    return `Mulai ${formatRupiah(min)}`;
  }
  if (max) {
    return `Hingga ${formatRupiah(max)}`;
  }
  return "Gaji dapat dinegosiasikan";
}

function formatDateIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function MainCriteriaCard({
  salaryMin,
  salaryMax,
  educationMin,
  experienceMinYears,
  jobType,
  workMode,
  deadline,
  skills = [],
  locationText,
  locationDetail,
  isOpen,
}: MainCriteriaCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Lowongan Kerja di JobConnect",
          url,
        });
        return;
      } catch {
        // Fallback ke clipboard jika share dialog dibatalkan
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard gagal
    }
  };

  return (
    <div className="bg-white rounded-card border border-slate-200 shadow-2xs overflow-hidden sticky top-20">
      {/* Header Kartu */}
      <div className="bg-navy-900 text-white p-5 sm:p-6 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-navy-200">
            Kriteria Utama
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Terverifikasi</span>
          </span>
        </div>
        <div className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
          {formatSalary(salaryMin, salaryMax)}
        </div>
        <span className="text-xs text-navy-200 block">
          Perkiraan kompensasi bulanan
        </span>
      </div>

      {/* Daftar Kriteria Terstruktur */}
      <div className="p-5 sm:p-6 space-y-5">
        <div className="space-y-4">
          {/* 1. Pendidikan Minimal */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-navy-800">
              <GraduationCap className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-500 block">Pendidikan Minimal</span>
              <span className="text-xs sm:text-sm font-bold text-navy-950">
                {EDUCATION_LABEL[educationMin as EducationMin] || educationMin}
              </span>
            </div>
          </div>

          {/* 2. Pengalaman Kerja */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-navy-800">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-500 block">Pengalaman Kerja</span>
              <span className="text-xs sm:text-sm font-bold text-navy-950">
                {experienceMinYears && experienceMinYears > 0
                  ? `Minimal ${experienceMinYears} tahun`
                  : "Terbuka bagi lulusan baru (Fresh Graduate)"}
              </span>
            </div>
          </div>

          {/* 3. Tipe Pekerjaan */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-navy-800">
              <Briefcase className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-500 block">Tipe Pekerjaan</span>
              <span className="text-xs sm:text-sm font-bold text-navy-950">
                {JOB_TYPE_LABEL[jobType as JobType] || jobType}
              </span>
            </div>
          </div>

          {/* 4. Mode Kerja */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-navy-800">
              <Laptop className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-500 block">Mode Bekerja</span>
              <span className="text-xs sm:text-sm font-bold text-navy-950">
                {WORK_MODE_LABEL[workMode as WorkMode] || workMode}
              </span>
            </div>
          </div>

          {/* 5. Batas Waktu / Deadline */}
          {deadline && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-rose-50 flex items-center justify-center shrink-0 mt-0.5 text-rose-700">
                <Calendar className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs text-slate-500 block">Batas Waktu Lamaran</span>
                <span className="text-xs sm:text-sm font-bold text-rose-700">
                  {formatDateIndo(deadline)}
                </span>
              </div>
            </div>
          )}

          {/* 6. Lokasi Penempatan */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 text-navy-800">
              <MapPin className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-slate-500 block">Lokasi Penempatan</span>
              <span className="text-xs sm:text-sm font-bold text-navy-950 block">
                {locationText}
              </span>
              {locationDetail && (
                <span className="text-xs text-slate-600 block mt-0.5 leading-relaxed">
                  {locationDetail}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Keahlian Wajib */}
        {skills && skills.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
              Keahlian yang Dibutuhkan
            </span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-sm border border-slate-200 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tombol Aksi Cepat */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          {isOpen ? (
            <a
              href="#formulir-lamaran"
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs sm:text-sm transition shadow-2xs min-h-[44px]"
            >
              Lamar Posisi Ini
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="w-full inline-flex items-center justify-center px-4 py-3 rounded-md bg-slate-100 text-slate-400 font-semibold text-xs sm:text-sm cursor-not-allowed min-h-[44px]"
            >
              Penerimaan Lamaran Ditutup
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition min-h-[44px]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-700">Tautan Disalin</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span>Bagikan Lowongan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
