"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Cari posisi kerja, profesi, atau keahlian...",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  // Sinkronkan state jika URL berubah dari luar
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

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
        className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-control focus:outline-none focus:border-navy-700 focus:ring-1 focus:ring-navy-700 min-h-[44px] transition-colors"
        aria-label="Cari lowongan pekerjaan"
      />
      <div className="absolute right-3 flex items-center">
        {isPending ? (
          <Loader2 className="w-4 h-4 text-navy-700 animate-spin" aria-hidden="true" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-sm text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-navy-700"
            aria-label="Hapus kata kunci pencarian"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
