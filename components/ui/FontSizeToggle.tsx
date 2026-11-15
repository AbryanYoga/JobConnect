"use client";

import React, { useState, useEffect } from "react";
import { Type } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function FontSizeToggle({ className = "" }: { className?: string }) {
  const { t } = useLanguage();
  const [isLarge, setIsLarge] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("jobconnect_font_size");
      if (saved === "large") {
        setIsLarge(true);
        document.documentElement.classList.add("font-large");
      }
    }
  }, []);

  const toggleFontSize = () => {
    const nextState = !isLarge;
    setIsLarge(nextState);
    if (typeof window !== "undefined") {
      if (nextState) {
        document.documentElement.classList.add("font-large");
        localStorage.setItem("jobconnect_font_size", "large");
      } else {
        document.documentElement.classList.remove("font-large");
        localStorage.setItem("jobconnect_font_size", "normal");
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleFontSize}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition min-h-[38px] cursor-pointer shadow-2xs ${
        isLarge
          ? "bg-navy-950 text-[#FFDD00] border-navy-800"
          : "bg-white hover:bg-slate-50 text-slate-700 border-black/10"
      } ${className}`}
      aria-label={
        isLarge
          ? t("Ubah ke ukuran huruf normal", "Switch to normal font size")
          : t("Perbesar ukuran teks agar mudah dibaca", "Enlarge text size for better readability")
      }
      title={
        isLarge
          ? t("Mode Teks Besar Aktif (Klik untuk Normal)", "Large Text Mode Active (Click for Normal)")
          : t("Perbesar Ukuran Huruf (Ramah Mata)", "Enlarge Font Size (Accessible Mode)")
      }
    >
      <Type
        className={`w-3.5 h-3.5 ${isLarge ? "text-[#FFDD00]" : "text-slate-600"}`}
        aria-hidden="true"
      />
      <span className="font-mono text-[11px] font-black">
        {isLarge ? "A+" : "A"}
      </span>
      <span className="hidden xl:inline text-[11px]">
        {isLarge ? t("Teks Besar", "Large Text") : t("Teks", "Font")}
      </span>
    </button>
  );
}
