"use client";

import React from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Download, FileText, CheckCircle2 } from "lucide-react";
import type { PortfolioItem } from "@/lib/validation/profil";

interface PrintCvClientProps {
  profile: {
    name: string;
    email: string;
    phone: string | null;
    headline: string | null;
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

  // Kumpulkan keahlian unik dari portofolio
  const allSkills = Array.from(
    new Set(
      profile.portfolios.flatMap((p) =>
        Array.isArray(p.skills) ? p.skills.filter(Boolean) : []
      )
    )
  );

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:py-0 print:bg-white text-slate-800">
      {/* Action Bar (Hanya tampil di layar, otomatis disembunyikan saat cetak) */}
      <div className="max-w-[800px] mx-auto px-4 mb-6 print:hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <Link
            href="/profil"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-navy-950 transition min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Halaman Profil</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs shadow-md transition min-h-[44px] cursor-pointer w-full sm:w-auto"
            >
              <Printer className="w-4 h-4 text-white" aria-hidden="true" />
              <span>Cetak / Simpan PDF (Ctrl+P)</span>
            </button>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mt-2 text-center font-medium">
          Tip: Pada jendela print browser Anda, pilih opsi Destination: <strong>Save as PDF</strong> untuk mengunduh berkas ke ponsel atau laptop Anda.
        </p>
      </div>

      {/* Lembar CV Format Standar Kertas A4 */}
      <div className="max-w-[800px] mx-auto bg-white p-8 sm:p-12 border border-slate-200 sm:rounded-2xl sm:shadow-lg print:border-none print:shadow-none print:rounded-none print:p-0 print:max-w-none space-y-6">
        {/* Header Identitas Diri */}
        <div className="border-b-2 border-slate-900 pb-5 space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                {profile.name}
              </h1>
              {profile.headline && (
                <p className="text-sm sm:text-base font-bold text-slate-700 mt-0.5">
                  {profile.headline}
                </p>
              )}
            </div>
            <div className="hidden sm:block print:hidden text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Terverifikasi JobConnect</span>
              </span>
            </div>
          </div>

          {/* Kontak & Rincian Singkat */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
            <span className="font-semibold">{profile.email}</span>
            {profile.phone && (
              <>
                <span className="text-slate-300 print:text-slate-400">•</span>
                <span>{profile.phone}</span>
              </>
            )}
            {profile.locationText && (
              <>
                <span className="text-slate-300 print:text-slate-400">•</span>
                <span>{profile.locationText}</span>
              </>
            )}
            {profile.age !== null && (
              <>
                <span className="text-slate-300 print:text-slate-400">•</span>
                <span>Usia {profile.age} Tahun</span>
              </>
            )}
            {profile.linkedinUrl && (
              <>
                <span className="text-slate-300 print:text-slate-400">•</span>
                <span className="truncate max-w-[220px]">{profile.linkedinUrl}</span>
              </>
            )}
            {profile.portfolioUrl && (
              <>
                <span className="text-slate-300 print:text-slate-400">•</span>
                <span className="truncate max-w-[220px]">{profile.portfolioUrl}</span>
              </>
            )}
          </div>
        </div>

        {/* 1. Ringkasan Profesional */}
        {profile.bio && (
          <div className="space-y-1.5 break-inside-avoid">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              Ringkasan Profesional
            </h2>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line text-justify">
              {profile.bio}
            </p>
          </div>
        )}

        {/* 2. Riwayat Pendidikan */}
        <div className="space-y-2 break-inside-avoid">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
            Pendidikan
          </h2>
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">
                {profile.educationInstitution || "Institusi Pendidikan"}
              </span>
              <span className="text-slate-500 font-medium">
                {profile.educationLevel || "Lulusan Sederajat"}
              </span>
            </div>
            {profile.educationInstitution && profile.educationLevel && (
              <p className="text-slate-600">
                Jenjang: {profile.educationLevel}
              </p>
            )}
          </div>
        </div>

        {/* 3. Portofolio Proyek & Karya Nyata */}
        {profile.portfolios.length > 0 && (
          <div className="space-y-3 break-inside-avoid">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              Pengalaman Proyek & Portofolio Karya
            </h2>
            <div className="space-y-3">
              {profile.portfolios.map((item, idx) => (
                <div key={idx} className="text-xs space-y-1 break-inside-avoid">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{item.title}</span>
                    {item.year && (
                      <span className="text-slate-500 font-medium">{item.year}</span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-slate-700 leading-relaxed text-justify">
                      {item.description}
                    </p>
                  )}
                  {item.skills && item.skills.length > 0 && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      Keahlian yang diterapkan: {item.skills.join(", ")}
                    </p>
                  )}
                  {item.url && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Tautan: {item.url}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Keahlian & Keterampilan */}
        {allSkills.length > 0 && (
          <div className="space-y-1.5 break-inside-avoid">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1">
              Keahlian & Keterampilan
            </h2>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {allSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200 print:border-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Catatan Kaki Dokumen Resmi */}
        <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between print:pt-4">
          <span>Dokumen resume resmi pelamar kerja - JobConnect Indonesia</span>
          <span>Dicetak pada {todayStr}</span>
        </div>
      </div>
    </div>
  );
}
