"use client";

import React, { useState } from "react";
import { BookOpen, Search, X, HelpCircle, CheckCircle2 } from "lucide-react";
import { Modal } from "./Modal";
import { useLanguage } from "@/lib/i18n";

export interface GlossaryItem {
  term: string;
  category: "mode" | "tipe" | "seleksi" | "dokumen";
  definitionId: string;
  definitionEn: string;
}

export const CAREER_GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    term: "Hybrid",
    category: "mode",
    definitionId:
      "Sistem kerja fleksibel yang memadukan kerja di kantor fisik (misal 2 sampai 3 hari seminggu) dan bekerja dari rumah (WFH).",
    definitionEn:
      "A flexible work arrangement blending working in the physical office with working from home.",
  },
  {
    term: "Remote (Kerja Jarak Jauh)",
    category: "mode",
    definitionId:
      "Bekerja 100% dari rumah atau lokasi mana pun di Indonesia menggunakan internet, tanpa kewajiban datang fisik ke gedung kantor.",
    definitionEn:
      "Working 100% from home or anywhere using internet connection without physical office commute.",
  },
  {
    term: "On-site (Kerja di Lokasi)",
    category: "mode",
    definitionId:
      "Bekerja penuh di lokasi fisik instansi, pabrik, toko, atau bengkel perusahaan sesuai jam operasional.",
    definitionEn:
      "Working physically at the company office, factory, or facility premises.",
  },
  {
    term: "Full-time (Penuh Waktu)",
    category: "tipe",
    definitionId:
      "Pekerjaan reguler dengan jam kerja penuh (umumnya 8 jam sehari atau 40 jam per minggu).",
    definitionEn:
      "Standard regular employment working around 40 hours per week.",
  },
  {
    term: "Part-time (Paruh Waktu)",
    category: "tipe",
    definitionId:
      "Pekerjaan dengan jam kerja lebih pendek (misal 3 sampai 4 jam per hari), cocok untuk siswa, mahasiswa, atau pekerja lepas.",
    definitionEn:
      "Employment with fewer hours per week than a full-time position.",
  },
  {
    term: "Magang / Internship",
    category: "tipe",
    definitionId:
      "Program pelatihan kerja praktek nyata untuk siswa SMK atau lulusan baru guna mendapatkan bimbingan dan pengalaman industri.",
    definitionEn:
      "A practical work training program for vocational students or fresh graduates.",
  },
  {
    term: "Kontrak (PKWT)",
    category: "tipe",
    definitionId:
      "Perjanjian Kerja Waktu Tertentu dengan durasi kerja yang telah disepakati di awal (misal 6 bulan, 1 tahun, atau 2 tahun).",
    definitionEn:
      "Fixed-term employment agreement for a specified agreed duration.",
  },
  {
    term: "Cover Letter (Surat Pengantar)",
    category: "dokumen",
    definitionId:
      "Surat singkat perkenalan diri yang menjelaskan alasan Anda tertarik melamar dan keunggulan keahlian Anda untuk posisi tersebut.",
    definitionEn:
      "A brief introductory letter highlighting why you are a great fit for the role.",
  },
  {
    term: "Shortlist (Kandidat Terpilih)",
    category: "seleksi",
    definitionId:
      "Tahapan di mana berkas lamaran Anda dinilai cocok oleh rekruter dan dimasukkan ke daftar prioritas untuk proses tes atau wawancara.",
    definitionEn:
      "A stage indicating your application passed initial review and entered priority selection.",
  },
  {
    term: "Offering Letter (Surat Penawaran)",
    category: "seleksi",
    definitionId:
      "Surat resmi dari instansi yang memuat penawaran besaran gaji, fasilitas, dan tanggal mulai masuk kerja setelah Anda dinyatakan lolos.",
    definitionEn:
      "An official formal letter detailing salary, benefits, and start date offer.",
  },
  {
    term: "Onboarding (Masa Orientasi)",
    category: "seleksi",
    definitionId:
      "Proses orientasi dan adaptasi karyawan baru untuk mengenal budaya kerja, alat kerja, dan rekan tim pada minggu pertama bekerja.",
    definitionEn:
      "The initial orientation process helping new hires adapt to the team and workflow.",
  },
  {
    term: "Quick Apply (Lamar 1-Klik)",
    category: "dokumen",
    definitionId:
      "Fitur JobConnect yang memungkinkan pelamar mengirim lamaran secara instan menggunakan CV profil yang sudah tersimpan tanpa upload ulang.",
    definitionEn:
      "JobConnect feature allowing instant 1-click apply using your pre-saved profile CV.",
  },
];

interface CareerGlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CareerGlossaryModal({ isOpen, onClose }: CareerGlossaryModalProps) {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("semua");

  const filteredItems = CAREER_GLOSSARY_ITEMS.filter((item) => {
    if (activeCategory !== "semua" && item.category !== activeCategory) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchTerm = item.term.toLowerCase().includes(q);
      const matchDefId = item.definitionId.toLowerCase().includes(q);
      const matchDefEn = item.definitionEn.toLowerCase().includes(q);
      return matchTerm || matchDefId || matchDefEn;
    }
    return true;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("Kamus Istilah Karir", "Career Glossary")} size="lg">
      <div className="space-y-4">
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {t(
            "Penjelasan istilah dunia kerja dan rekrutmen dalam bahasa Indonesia sederhana agar mudah dipahami oleh seluruh kalangan usia.",
            "Simple explanations of workplace and recruitment terms in plain Indonesian for all age groups."
          )}
        </p>

        {/* Kolom Pencarian Istilah */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("Cari istilah: misal Hybrid, Remote, Shortlist...", "Search term: e.g. Hybrid, Remote...")}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#FAF8F0] border border-black/10 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black min-h-[44px]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black p-1"
              aria-label={t("Hapus pencarian")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Kategori Istilah */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: t("Semua Istilah", "All Terms"), value: "semua" },
            { label: t("Mode Kerja", "Work Mode"), value: "mode" },
            { label: t("Tipe Pekerjaan", "Job Type"), value: "tipe" },
            { label: t("Tahap Seleksi", "Selection"), value: "seleksi" },
            { label: t("Dokumen", "Documents"), value: "dokumen" },
          ].map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition min-h-[36px] whitespace-nowrap cursor-pointer ${
                activeCategory === cat.value
                  ? "bg-navy-900 text-white shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Daftar Istilah */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-medium">
              {t("Tidak ditemukan istilah yang sesuai pencarian.", "No matching term found.")}
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-black text-navy-950">
                    {item.term}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-black/[0.08] text-slate-600">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {language === "en" ? item.definitionEn : item.definitionId}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition min-h-[44px] cursor-pointer"
          >
            {t("Tutup", "Close")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function CareerGlossaryTrigger({ className = "" }: { className?: string }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-bold text-navy-800 hover:text-navy-950 hover:underline min-h-[40px] cursor-pointer ${className}`}
        title={t("Buka kamus istilah karir bahasa Indonesia", "Open career glossary in plain Indonesian")}
      >
        <BookOpen className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
        <span>{t("Kamus Istilah Karir", "Career Glossary")}</span>
      </button>

      <CareerGlossaryModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
