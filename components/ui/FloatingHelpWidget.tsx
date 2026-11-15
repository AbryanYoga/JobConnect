"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  HelpCircle,
  X,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { CareerGlossaryModal } from "./CareerGlossaryModal";

interface FaqItem {
  qId: string;
  qEn: string;
  aId: string;
  aEn: string;
}

const FAQ_LIST: FaqItem[] = [
  {
    qId: "Bagaimana cara melamar pekerjaan di JobConnect?",
    qEn: "How do I apply for jobs on JobConnect?",
    aId: "Buka menu Lowongan, pilih posisi yang diminati, lalu klik 'Lamar Sekarang'. Jika Anda sudah mengunggah CV di profil, Anda cukup memilih opsi 'Quick Apply' untuk melamar dalam 1 detik.",
    aEn: "Go to Vacancies, choose a job, and click 'Apply Now'. If you already saved a CV in your profile, simply choose 'Quick Apply' to submit instantly.",
  },
  {
    qId: "Apakah melamar kerja di JobConnect dipungut biaya?",
    qEn: "Are there any fees to apply on JobConnect?",
    aId: "Tidak ada sama sekali. JobConnect 100% GRATIS untuk pencari kerja. Kami menjamin bebas pungutan liar dan calo. Laporkan instansi jika ada indikasi penarikan biaya.",
    aEn: "Absolutely not. JobConnect is 100% FREE for job seekers with zero broker fees. Report any suspicious fee requests immediately.",
  },
  {
    qId: "Bagaimana cara mengaktifkan fitur Quick Apply?",
    qEn: "How do I activate the Quick Apply feature?",
    aId: "Masuk ke halaman Profil Anda, buka bagian 'Berkas CV Utama (Quick Apply)', lalu unggah satu file CV berformat PDF (maksimal 2 MB). Setelah tersimpan, berkas tersebut siap dipakai di setiap lowongan.",
    aEn: "Go to your Profile page, scroll to 'Main CV Document', and upload a PDF file (max 2 MB). Once saved, it is ready for 1-click applications.",
  },
  {
    qId: "Di mana saya bisa melihat status dan panggilan kerja?",
    qEn: "Where can I see my application status and interview calls?",
    aId: "Buka menu 'Lamaran Saya'. Jika status Anda berpindah ke 'Wawancara' atau 'Diterima', jadwal dan lokasinya akan tertera di linimasa tersebut, serta dikirimkan otomatis ke WhatsApp dan email Anda.",
    aEn: "Check 'My Applications'. If your status moves to 'Interview' or 'Accepted', date and location details will appear in your timeline and will be sent to your WhatsApp and email.",
  },
];

export function FloatingHelpWidget() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Tutup panel dengan tombol Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  // Tutup panel saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const supportWaUrl = `https://api.whatsapp.com/send?phone=6281234567890&text=${encodeURIComponent(
    "Halo Layanan Bantuan JobConnect, saya membutuhkan panduan bantuan terkait penggunaan portal lowongan kerja JobConnect."
  )}`;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-5 right-5 z-40 print:hidden flex flex-col items-end"
    >
      {/* Panel Tanya Jawab & Bantuan */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={t("Pusat Bantuan & Panduan Cepat", "Help & Quick Guides")}
          className="mb-3 w-[92vw] sm:w-[380px] bg-white rounded-3xl border border-black/10 shadow-2xl p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header Popover */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center justify-center shrink-0">
                <LifeBuoy className="w-5 h-5 text-amber-700" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-black text-navy-950">
                  {t("Pusat Bantuan & Panduan", "Help Center & Guides")}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {t("Solusi mudah untuk seluruh usia", "Simple solutions for all ages")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-navy-950 hover:bg-slate-100 transition cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
              aria-label={t("Tutup panel bantuan", "Close help panel")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Daftar Tanya Jawab Interaktif */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {FAQ_LIST.map((item, idx) => {
              const isExpanded = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-black/[0.06] bg-[#FAF8F0] overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-3 flex items-center justify-between gap-2 text-xs font-bold text-navy-950 hover:text-navy-700 transition cursor-pointer min-h-[44px]"
                    aria-expanded={isExpanded}
                  >
                    <span>{language === "en" ? item.qEn : item.qId}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-3 pt-0 text-[11px] text-slate-600 leading-relaxed font-medium border-t border-black/[0.04]">
                      {language === "en" ? item.aEn : item.aId}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Aksi Bantuan Langsung */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsGlossaryOpen(true);
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition min-h-[40px] cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
              <span>{t("Buka Kamus Istilah Karir", "Open Career Glossary")}</span>
            </button>

            <a
              href={supportWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs min-h-[40px]"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              <span>{t("Chat Bantuan via WhatsApp", "Chat Support on WhatsApp")}</span>
            </a>
          </div>
        </div>
      )}

      {/* Tombol Utama Terapung */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-navy-950 hover:bg-navy-900 text-white shadow-xl hover:shadow-2xl active:scale-95 transition-all border border-navy-800 font-bold text-xs min-h-[44px] cursor-pointer group"
        aria-expanded={isOpen}
        aria-label={t("Buka pusat bantuan dan panduan cepat", "Open help and quick guides")}
      >
        <div className="w-6 h-6 rounded-full bg-[#FFDD00] text-navy-950 flex items-center justify-center shrink-0">
          <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
        </div>
        <span className="font-extrabold tracking-tight">
          {t("Bantuan", "Help")}
        </span>
      </button>

      {/* Modal Kamus Karir jika dipanggil dari Bantuan */}
      <CareerGlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />
    </div>
  );
}
