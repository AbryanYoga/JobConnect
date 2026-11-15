"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Printer,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  FolderGit2,
  CheckCircle2,
  Globe,
  ExternalLink,
  Sparkles,
  User,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/LinkedinIcon";
import type { PortfolioItem } from "@/lib/validation/profil";

interface PrintCvClientProps {
  profile: {
    name: string;
    email: string;
    phone: string | null;
    headline: string | null;
    avatarUrl: string | null;
    birthDate: string | null;
    age: number | null;
    educationLevel: string | null;
    educationInstitution: string | null;
    locationText: string | null;
    bio: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    portfolios: PortfolioItem[];
  };
}

function getInitials(name: string): string {
  if (!name) return "JC";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function PrintCvClient({ profile }: PrintCvClientProps) {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const todayStr = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  // Kumpulkan keahlian dari portofolio atau sediakan kompetensi dasar sesuai bidang
  const extractedSkills = Array.from(
    new Set(
      profile.portfolios.flatMap((p) =>
        Array.isArray(p.skills) ? p.skills.filter(Boolean) : []
      )
    )
  );

  const defaultSkills = [
    "Pengembangan Perangkat Lunak",
    "Analisis & Problem Solving",
    "Komunikasi & Kerja Tim",
    "Manajemen Waktu",
    "Adaptabilitas Cepat",
  ];

  const finalSkills =
    extractedSkills.length > 0 ? extractedSkills : defaultSkills;

  // Ringkasan profil profesional jika bio belum diisi manual
  const professionalBio =
    profile.bio ||
    `Lulusan ${profile.educationInstitution || "kejuruan"} dengan spesialisasi ${
      profile.headline || "profesional di bidangnya"
    }. Memiliki motivasi kerja yang tinggi, integritas, serta kesiapan untuk beradaptasi dan berkontribusi secara produktif bersama tim perusahaan.`;

  return (
    <div className="min-h-screen bg-[#FAF8F0] py-8 sm:py-12 print:py-0 print:bg-white text-slate-800">
      {/* Top Action Bar (Disembunyikan saat dicetak / PDF) */}
      <div className="max-w-4xl mx-auto px-4 mb-8 print:hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-[24px] border border-black/[0.08] shadow-card">
          <Link
            href="/profil"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-black transition min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Halaman Profil</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-[#FAF8F0] px-3.5 py-2 rounded-full border border-black/[0.06]">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Pratinjau Resume Standar ATS</span>
            </span>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-navy-950 hover:bg-black text-[#FFDD00] font-black text-xs sm:text-sm shadow-md transition active:scale-95 min-h-[44px] cursor-pointer w-full sm:w-auto"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              <span>Cetak / Simpan PDF (Ctrl+P)</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-3 text-center font-medium">
          Petunjuk: Pada jendela cetak browser, pilih Destination: <strong>Save as PDF</strong> (Simpan sebagai PDF) untuk mengunduh dokumen resmi ini.
        </p>
      </div>

      {/* Lembar CV Format Standar Kertas A4 (Menyatu Harmonis dengan JobConnect) */}
      <main className="max-w-4xl mx-auto bg-white p-6 sm:p-12 md:p-14 border border-black/[0.08] sm:rounded-[36px] sm:shadow-card print:border-none print:shadow-none print:rounded-none print:p-0 print:max-w-none space-y-8">
        {/* Header Identitas & Kontak */}
        <header className="border-b-2 border-slate-900 pb-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 sm:gap-5 min-w-0">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={`Foto ${profile.name}`}
                  width={84}
                  height={84}
                  className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl object-cover shrink-0 border-2 border-slate-900 shadow-xs"
                  unoptimized
                />
              ) : (
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-[#0D0C23] text-[#FFDD00] font-black text-2xl sm:text-3xl flex items-center justify-center shrink-0 border-2 border-slate-900 shadow-xs select-none">
                  {getInitials(profile.name)}
                </div>
              )}

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 uppercase tracking-tight">
                    {profile.name}
                  </h1>
                </div>
                {profile.headline && (
                  <p className="text-sm sm:text-base font-bold text-slate-700">
                    {profile.headline}
                  </p>
                )}
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Akun Terverifikasi Resmi JobConnect</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Rincian Kontak & Domisili (Terstruktur Rapi) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF8F0] border border-black/[0.04]">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-slate-800 truncate" title={profile.email}>
                {profile.email}
              </span>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF8F0] border border-black/[0.04]">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-slate-800 truncate">
                  {profile.phone}
                </span>
              </div>
            )}

            {profile.locationText && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF8F0] border border-black/[0.04]">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-slate-800 truncate" title={profile.locationText}>
                  {profile.locationText}
                </span>
              </div>
            )}

            {profile.age !== null && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF8F0] border border-black/[0.04]">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                <span className="font-semibold text-slate-800">
                  Usia {profile.age} Tahun
                </span>
              </div>
            )}

            {profile.linkedinUrl && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF8F0] border border-black/[0.04] min-w-0">
                <LinkedinIcon className="w-3.5 h-3.5 text-[#0A66C2] shrink-0" />
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-800 hover:text-blue-700 truncate"
                  title={profile.linkedinUrl}
                >
                  {profile.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "linkedin/")}
                </a>
              </div>
            )}

            {profile.portfolioUrl && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF8F0] border border-black/[0.04] min-w-0">
                <Globe className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-800 hover:text-blue-700 truncate"
                  title={profile.portfolioUrl}
                >
                  {profile.portfolioUrl.replace(/^https?:\/\/(www\.)?/i, "")}
                </a>
              </div>
            )}
          </div>
        </header>

        {/* 1. Ringkasan Profil Profesional */}
        <section className="space-y-2.5 break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
            <User className="w-4 h-4 text-slate-900" aria-hidden="true" />
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider">
              Profil & Ringkasan Profesional
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-medium whitespace-pre-line text-justify">
            {professionalBio}
          </p>
        </section>

        {/* 2. Riwayat Pendidikan */}
        <section className="space-y-3 break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
            <GraduationCap className="w-4 h-4 text-slate-900" aria-hidden="true" />
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider">
              Riwayat Pendidikan
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-sm font-bold text-slate-950">
                {profile.educationInstitution || "Pendidikan Terakhir"}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-black/[0.06] text-slate-700 self-start sm:self-auto">
                {profile.educationLevel || "Lulusan Sederajat"}
              </span>
            </div>
            {profile.headline && (
              <p className="text-xs text-slate-600 font-medium">
                Konsentrasi Keahlian: {profile.headline}
              </p>
            )}
          </div>
        </section>

        {/* 3. Portofolio Proyek & Karya Nyata */}
        <section className="space-y-3 break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
            <FolderGit2 className="w-4 h-4 text-slate-900" aria-hidden="true" />
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider">
              Pengalaman Proyek & Portofolio Karya
            </h2>
          </div>

          {profile.portfolios.length > 0 ? (
            <div className="space-y-3">
              {profile.portfolios.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1.5 break-inside-avoid"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-950">
                      {item.title}
                    </span>
                    {item.year && (
                      <span className="text-[11px] font-semibold text-slate-500">
                        {item.year}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-700 leading-relaxed font-medium text-justify">
                      {item.description}
                    </p>
                  )}
                  {item.skills && item.skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-500">
                        Teknologi:
                      </span>
                      {item.skills.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-slate-700 border border-black/[0.06]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.url && (
                    <p className="text-[11px] text-slate-500 font-mono pt-0.5 truncate">
                      Tautan: {item.url}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.04] space-y-1">
              <span className="text-xs font-bold text-slate-800 block">
                Kesiapan Kerja & Penugasan Pertama
              </span>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Telah menyelesaikan seluruh program kurikulum dan uji kompetensi kejuruan di {profile.educationInstitution || "institusi pendidikan"}. Siap mengikuti masa percobaan, magang industri, atau penugasan posisi tingkat awal (entry-level).
              </p>
            </div>
          )}
        </section>

        {/* 4. Keahlian & Keterampilan Utama */}
        <section className="space-y-3 break-inside-avoid">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
            <Sparkles className="w-4 h-4 text-slate-900" aria-hidden="true" />
            <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider">
              Keahlian & Kompetensi Utama
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {finalSkills.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-[#FAF8F0] text-slate-800 border border-black/[0.08] print:border-slate-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>

        {/* Footer Dokumen Resmi */}
        <footer className="pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true" />
            <span>Dokumen Curriculum Vitae resmi - JobConnect Indonesia</span>
          </div>
          <span>Dicetak pada {todayStr}</span>
        </footer>
      </main>
    </div>
  );
}
