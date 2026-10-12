"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ShieldCheck, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function AboutView() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12">
        {/* Breadcrumb Navigasi */}
        <Breadcrumb
          items={[
            { label: "Beranda", href: "/" },
            { label: "Tentang Kami" },
          ]}
        />

        {/* Header Hero Tentang Kami */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-800" aria-hidden="true" />
            <span>{t("Misi & Komitmen JobConnect")}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-navy-950 tracking-tight leading-tight">
            {t("Menghubungkan Pencari Kerja dan Perusahaan Resmi Tanpa Rasa Cemas")}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {t("JobConnect hadir untuk menyelesaikan keresahan pelamar kerja di Indonesia: maraknya lowongan penipuan, calo, pungutan liar, dan ketidakpastian informasi gaji.")}
          </p>
        </div>

        {/* Tiga Pilar Utama */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-card border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy-950">
              {t("100% Verifikasi Admin")}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("Setiap lowongan yang diajukan oleh mitra wajib melalui peninjauan langsung oleh admin moderator sebelum tayang ke publik. Bebas lowongan bodong dan calo.")}
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-card border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-lg bg-navy-50 text-navy-700 flex items-center justify-center font-bold text-lg">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy-950">
              {t("Transparansi Kriteria")}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("Wajib mencantumkan rentang kompensasi gaji, kualifikasi pendidikan minimal, mode kerja (WFO/Hybrid/Remote), serta tanggung jawab terstruktur.")}
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-card border border-slate-200 shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-navy-950">
              {t("AI Sebagai Asisten, Bukan Penentu")}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t("Sistem kecerdasan buatan hanya membantu memberikan masukan kecocokan kualifikasi. Keputusan seleksi dan penerimaan 100% berada di tangan manusia.")}
            </p>
          </div>
        </div>

        {/* Jangkauan Seluruh Indonesia */}
        <section className="bg-navy-950 text-white rounded-card p-8 sm:p-12 shadow-sm space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-amber-400 font-bold text-xs uppercase tracking-wider block">
              {t("Jangkauan Seluruh Indonesia")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t("Mencakup 38 Provinsi dan 514 Kota/Kabupaten")}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {t("Baik Anda mencari peluang kerja di kota metropolitan maupun kesempatan kerja remote dari pelosok daerah, JobConnect menyediakan wadah resmi bagi seluruh talenta bangsa.")}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/lowongan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFDD00] text-navy-950 hover:bg-[#F2D000] font-bold text-sm transition shadow-2xs min-h-[44px]"
            >
              <span>{t("Jelajahi Lowongan")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register?peran=perusahaan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition border border-white/20 min-h-[44px]"
            >
              <span>{t("Pasang Lowongan Perusahaan")}</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
