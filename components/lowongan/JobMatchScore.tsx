"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Target, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface JobMatchScoreProps {
  isLoggedIn: boolean;
  userRole?: string | null;
  userEducation?: string | null;
  userCityId?: number | null;
  userProvinceId?: number | null;
  hasDefaultCv?: boolean;
  jobEducationMin?: string | null;
  jobWorkMode?: string | null;
  jobCityId?: number | null;
  jobProvinceId?: number | null;
}

const EDU_RANK: Record<string, number> = {
  smp: 0,
  sma_smk: 1,
  d3: 2,
  d4: 3,
  s1: 3,
  s2: 4,
  s3: 5,
  lainnya: 1,
};

export function JobMatchScore({
  isLoggedIn,
  userRole = "user",
  userEducation,
  userCityId,
  userProvinceId,
  hasDefaultCv = false,
  jobEducationMin,
  jobWorkMode,
  jobCityId,
  jobProvinceId,
}: JobMatchScoreProps) {
  const { t } = useLanguage();

  if (!isLoggedIn || userRole !== "user") {
    if (userRole === "company" || userRole === "admin") {
      return null;
    }

    return (
      <div className="bg-white rounded-[24px] border border-black/[0.08] p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
            <Target className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-950">
              {t("Kecocokan Profil", "Profile Match")}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {t("Evaluasi kualifikasi otomatis", "Automatic qualification review")}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          {t(
            "Masuk sebagai pelamar untuk melihat persentase kecocokan pendidikan, domisili, dan berkas profil Anda dengan lowongan ini.",
            "Sign in as job seeker to see your qualification match percentage for this vacancy."
          )}
        </p>

        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs transition shadow-2xs min-h-[40px]"
        >
          <span>{t("Masuk untuk Cek Kecocokan", "Sign In to Check Match")}</span>
        </Link>
      </div>
    );
  }

  // 1. Evaluasi Pendidikan (Maksimal 40 poin)
  let eduScore = 20;
  let eduMatchText = t("Pendidikan perlu diverifikasi", "Education pending verification");
  let eduMatched = false;

  const minRank = jobEducationMin ? EDU_RANK[jobEducationMin] ?? 1 : 1;
  const userRank = userEducation ? EDU_RANK[userEducation] ?? 1 : 0;

  if (!jobEducationMin) {
    eduScore = 40;
    eduMatchText = t("Terbuka untuk semua jenjang pendidikan", "Open for all education levels");
    eduMatched = true;
  } else if (userRank >= minRank) {
    eduScore = 40;
    eduMatchText = t("Pendidikan memenuhi syarat minimal lowongan", "Education meets vacancy requirement");
    eduMatched = true;
  } else if (userEducation) {
    eduScore = 15;
    eduMatchText = t("Jenjang pendidikan di bawah syarat yang ditentukan", "Education below minimum requirement");
    eduMatched = false;
  } else {
    eduScore = 10;
    eduMatchText = t("Belum mengisi data pendidikan di profil", "No education data in profile");
    eduMatched = false;
  }

  // 2. Evaluasi Wilayah / Mode Kerja (Maksimal 30 poin)
  let locScore = 15;
  let locMatchText = t("Lokasi kerja berbeda wilayah", "Different work location");
  let locMatched = false;

  if (jobWorkMode === "remote") {
    locScore = 30;
    locMatchText = t("Kerja Remote (fleksibel dari mana saja)", "Remote Work (flexible anywhere)");
    locMatched = true;
  } else if (userCityId && jobCityId && userCityId === jobCityId) {
    locScore = 30;
    locMatchText = t("Domisili satu kota dengan lokasi kantor", "Same city as office location");
    locMatched = true;
  } else if (userProvinceId && jobProvinceId && userProvinceId === jobProvinceId) {
    locScore = 25;
    locMatchText = t("Domisili satu provinsi dengan kantor", "Same province as office location");
    locMatched = true;
  } else {
    locScore = 15;
    locMatchText = t("Wilayah kantor di luar domisili Anda", "Office outside your home domicile");
    locMatched = false;
  }

  // 3. Evaluasi Berkas CV & Kelengkapan (Maksimal 30 poin)
  let docScore = 10;
  let docMatchText = t("Belum menyimpan CV utama", "No main CV saved");
  let docMatched = false;

  if (hasDefaultCv) {
    docScore = 30;
    docMatchText = t("CV utama tersimpan (Quick Apply aktif)", "Main CV ready (Quick Apply enabled)");
    docMatched = true;
  } else {
    docScore = 10;
    docMatchText = t("Belum mengunggah CV utama di profil", "No main CV uploaded in profile");
    docMatched = false;
  }

  const totalScore = Math.min(100, eduScore + locScore + docScore);

  let labelClass = "bg-emerald-50 text-emerald-900 border-emerald-300";
  let statusText = t("Sangat Cocok", "Highly Matched");
  let barColor = "bg-emerald-500";

  if (totalScore < 60) {
    labelClass = "bg-slate-100 text-slate-800 border-slate-300";
    statusText = t("Perlu Penyesuaian", "Needs Adjustment");
    barColor = "bg-slate-500";
  } else if (totalScore < 80) {
    labelClass = "bg-amber-50 text-amber-900 border-amber-300";
    statusText = t("Cukup Cocok", "Good Match");
    barColor = "bg-amber-500";
  }

  return (
    <div className="bg-white rounded-[24px] border border-black/[0.08] p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-700" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-navy-950">
              {t("Kecocokan Profil", "Profile Match")}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {t("Analisis kualifikasi Anda", "Your qualification analysis")}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black border ${labelClass}`}
        >
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          <span>{totalScore}% {statusText}</span>
        </span>
      </div>

      {/* Progress Bar Visual */}
      <div className="space-y-1.5">
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${barColor} transition-all duration-500 rounded-full`}
            style={{ width: `${totalScore}%` }}
          />
        </div>
      </div>

      {/* Rincian Poin Kecocokan */}
      <div className="space-y-2 pt-1">
        <div className="flex items-start gap-2 text-xs">
          {eduMatched ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <span className={eduMatched ? "text-slate-800 font-semibold" : "text-slate-500"}>
            {eduMatchText}
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs">
          {locMatched ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <span className={locMatched ? "text-slate-800 font-semibold" : "text-slate-500"}>
            {locMatchText}
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs">
          {docMatched ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <span className={docMatched ? "text-slate-800 font-semibold" : "text-slate-500"}>
            {docMatchText}
          </span>
        </div>
      </div>
    </div>
  );
}
