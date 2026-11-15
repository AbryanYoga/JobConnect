"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n";

export function IndonesiaFlag({
  className = "w-5 h-3.5",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={`inline-block rounded-[3px] overflow-hidden shadow-2xs border border-black/15 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <rect width="30" height="10" fill="#E11D48" />
      <rect y="10" width="30" height="10" fill="#FFFFFF" />
    </svg>
  );
}

export function UkFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 30"
      className={`inline-block rounded-[3px] overflow-hidden shadow-2xs border border-black/15 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <clipPath id="uk-flag-clip-s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="uk-flag-clip-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip-s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath="url(#uk-flag-clip-t)"
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

interface LanguageOption {
  code: Language;
  name: string;
  label: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: "id",
    name: "Indonesia",
    label: "Bahasa Indonesia",
  },
  {
    code: "en",
    name: "English",
    label: "English",
  },
];

interface LanguageSwitcherProps {
  className?: string;
  variant?: "navbar" | "mobile";
}

export function LanguageSwitcher({
  className = "",
  variant = "navbar",
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption =
    LANGUAGES.find((opt) => opt.code === language) || LANGUAGES[0];

  // Tutup dropdown saat klik di luar elemen atau tombol Esc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === "mobile") {
    return (
      <div
        ref={containerRef}
        className={`relative w-full rounded-2xl bg-black/[0.03] border border-black/[0.06] p-2.5 ${className}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 px-1">
            {language === "id" ? "Bahasa Situs" : "Site Language"}
          </span>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 border border-black/[0.08] shadow-2xs hover:bg-black/[0.02] transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-label={
              language === "id"
                ? "Pilih bahasa tampilan situs"
                : "Select display language"
            }
          >
            {activeOption.code === "id" ? (
              <IndonesiaFlag className="w-5 h-3.5" />
            ) : (
              <UkFlag className="w-5 h-3.5" />
            )}
            <span>{activeOption.name}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
          </button>
        </div>

        {isOpen && (
          <div
            className="mt-2.5 bg-white rounded-xl border border-black/[0.08] shadow-md p-1.5 space-y-1 animate-in fade-in-0 zoom-in-95"
            role="listbox"
            aria-label="Daftar bahasa / Language list"
          >
            {LANGUAGES.map((opt) => {
              const isSelected = opt.code === language;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleSelect(opt.code)}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-colors min-h-[44px] ${
                    isSelected
                      ? "bg-[#FFDD00]/25 text-[#0D0C23] font-extrabold"
                      : "text-slate-700 hover:bg-black/[0.04] hover:text-navy-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {opt.code === "id" ? (
                      <IndonesiaFlag className="w-5 h-3.5" />
                    ) : (
                      <UkFlag className="w-5 h-3.5" />
                    )}
                    <span>{opt.name}</span>
                  </div>
                  {isSelected && (
                    <Check
                      className="w-4 h-4 text-[#0D0C23]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Desktop Navbar Variant (Dropdown List)
  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 bg-white/90 hover:bg-white text-slate-800 px-3.5 py-1.5 rounded-full text-xs font-bold border border-black/[0.08] shadow-2xs hover:border-black/[0.15] transition-all min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={
          language === "id"
            ? `Bahasa saat ini: ${activeOption.name}. Klik untuk mengganti bahasa`
            : `Current language: ${activeOption.name}. Click to change language`
        }
      >
        {activeOption.code === "id" ? (
          <IndonesiaFlag className="w-5 h-3.5" />
        ) : (
          <UkFlag className="w-5 h-3.5" />
        )}
        <span className="font-bold tracking-tight text-slate-800 hidden lg:inline">
          {activeOption.name}
        </span>
        <span className="font-bold tracking-tight text-slate-800 lg:hidden">
          {activeOption.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-44 bg-white rounded-2xl border border-black/[0.08] shadow-xl p-1.5 z-50 animate-in fade-in-0 zoom-in-95 origin-top-right focus:outline-none"
          role="listbox"
          aria-label="Pilihan Bahasa / Language Selection"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-black/[0.05] mb-1">
            {language === "id" ? "Pilih Bahasa" : "Select Language"}
          </div>
          {LANGUAGES.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => handleSelect(opt.code)}
                role="option"
                aria-selected={isSelected}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                  isSelected
                    ? "bg-[#FFDD00] text-[#0D0C23] font-extrabold shadow-2xs"
                    : "text-slate-700 hover:bg-black/[0.04] hover:text-[#0D0C23]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {opt.code === "id" ? (
                    <IndonesiaFlag className="w-5 h-3.5" />
                  ) : (
                    <UkFlag className="w-5 h-3.5" />
                  )}
                  <span>{opt.name}</span>
                </div>
                {isSelected && (
                  <Check
                    className="w-4 h-4 text-[#0D0C23]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
