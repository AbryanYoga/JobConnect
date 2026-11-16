"use client";

import React, { useEffect, useState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface StickyApplyBarProps {
  jobTitle: string;
  companyName: string;
  isOpen: boolean;
  isExpired: boolean;
  hasApplied: boolean;
}

// Bilah melayang cepat untuk memudahkan pelamar menekan tombol lamar di ponsel
export function StickyApplyBar({
  jobTitle,
  companyName,
  isOpen,
  isExpired,
  hasApplied,
}: StickyApplyBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Tampilkan sticky bar setelah pengguna scroll melewati header lowongan (280px)
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsVisible(scrollY > 280);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToForm = () => {
    const el = document.getElementById("formulir-lamaran");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/[0.08] p-3 shadow-lg md:hidden animate-in slide-in-from-bottom duration-200">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-black truncate">{jobTitle}</p>
          <p className="text-[11px] text-slate-500 truncate">{companyName}</p>
        </div>

        <div>
          {hasApplied ? (
            <span className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t("Sudah Dilamar", "Applied")}</span>
            </span>
          ) : !isOpen || isExpired ? (
            <span className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t("Ditutup", "Closed")}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black text-xs font-black shadow-xs active:scale-95 transition min-h-[40px]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t("Lamar Sekarang", "Apply Now")}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
