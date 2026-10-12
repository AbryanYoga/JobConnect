"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder,
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const initialQuery = searchParams.get("q") || "";

  const resolvedPlaceholder = placeholder
    ? t(placeholder)
    : t("Cari posisi kerja, profesi, atau keahlian...", "Search job title, profession, or skills...");

  const [query, setQuery] = useState(initialQuery);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  // Sinkronkan state jika URL berubah dari luar sesuai panduan React
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setQuery(initialQuery);
  }

  // Debounce pembaruan URL saat pengguna mengetik
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        startTransition(() => {
          const params = new URLSearchParams(searchParams.toString());
          if (query.trim()) {
            params.set("q", query.trim());
          } else {
            params.delete("q");
          }
          // Reset ke halaman 1 saat pencarian berubah
          params.delete("page");

          const qs = params.toString();
          router.push(qs ? `/lowongan?${qs}` : "/lowongan", { scroll: false });
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, initialQuery, router, searchParams]);

  const handleClear = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/lowongan?${qs}` : "/lowongan", { scroll: false });
  };

  return (
    <div className={`relative flex items-center ${className}`.trim()}>
      <Search
        className="w-4 h-4 text-slate-400 absolute left-4.5 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={resolvedPlaceholder}
        className="w-full pl-12 pr-12 py-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-black/[0.08] rounded-full focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10 min-h-[48px] shadow-2xs font-medium transition-all"
        aria-label={t("Cari lowongan pekerjaan", "Search job vacancies")}
      />
      <div className="absolute right-4 flex items-center">
        {isPending ? (
          <Loader2 className="w-4 h-4 text-black animate-spin" aria-hidden="true" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-slate-400 hover:text-black transition-colors focus-visible:outline-2 focus-visible:outline-black"
            aria-label={t("Hapus kata kunci pencarian", "Clear search query")}
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
