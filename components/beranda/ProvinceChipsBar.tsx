"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Globe, MapPin } from "lucide-react";

export interface ProvinceChipItem {
  id: number;
  name: string;
  slug: string;
}

interface ProvinceChipsBarProps {
  provinces: ProvinceChipItem[];
}

export function ProvinceChipsBar({ provinces }: ProvinceChipsBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section
      aria-label="Jelajah lowongan berdasarkan wilayah dan provinsi"
      className="bg-slate-50 border-b border-slate-200 py-3.5 sm:py-4 relative z-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-navy-800" aria-hidden="true" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-navy-950">
              Jelajah Berdasarkan Wilayah
            </h2>
          </div>
          <Link
            href="/wilayah"
            className="text-xs font-semibold text-navy-800 hover:text-navy-950 transition-colors shrink-0 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-navy-700 rounded-xs"
          >
            Daftar 38 Provinsi
          </Link>
        </div>

        {/* Kontainer Baris Chip Horizontal */}
        <div className="relative group">
          {/* Tombol Geser Kiri (Desktop) */}
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Geser pilihan wilayah ke kiri"
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-xs items-center justify-center text-slate-700 hover:text-navy-900 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-navy-700"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth no-scrollbar focus:outline-none"
            tabIndex={0}
            aria-label="Daftar wilayah dan provinsi"
          >
            {/* Chip Kerja Remote */}
            <Link
              href="/wilayah/remote"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold bg-white text-navy-900 hover:bg-navy-50 border border-slate-300 hover:border-navy-400 shrink-0 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-navy-700 shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
              <span>Kerja Remote</span>
            </Link>

            {/* Chip Seluruh Provinsi */}
            {provinces.map((prov) => (
              <Link
                key={prov.id}
                href={`/wilayah/${prov.slug}`}
                className="inline-flex items-center px-3 py-1.5 rounded-sm text-xs font-medium bg-white text-slate-700 hover:text-navy-950 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 shrink-0 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-navy-700 shadow-2xs"
              >
                <span>{prov.name}</span>
              </Link>
            ))}
          </div>

          {/* Tombol Geser Kanan (Desktop) */}
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Geser pilihan wilayah ke kanan"
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-xs items-center justify-center text-slate-700 hover:text-navy-900 hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-navy-700"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
