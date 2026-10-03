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
      aria-label="Jelajah wilayah dan provinsi"
      className="bg-white border-b border-slate-200 py-4 sm:py-5 shadow-2xs relative z-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-navy-700" aria-hidden="true" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
              Jelajah Lowongan Berdasarkan Wilayah
            </h2>
          </div>
          <Link
            href="/wilayah"
            className="text-xs font-semibold text-navy-700 hover:text-navy-900 transition-colors shrink-0 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-navy-600 rounded-xs"
          >
            Lihat 38 Provinsi →
          </Link>
        </div>

        {/* Kontainer Baris Chip Horizontal */}
        <div className="relative group">
          {/* Tombol Geser Kiri (Desktop) */}
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Geser pilihan provinsi ke kiri"
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-sm items-center justify-center text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-navy-600"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>

          <div
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto py-1 scroll-smooth no-scrollbar focus:outline-none"
            tabIndex={0}
            aria-label="Daftar chip provinsi"
          >
            {/* Chip Kerja Remote */}
            <Link
              href="/wilayah/remote"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-navy-50 text-navy-800 hover:bg-navy-100 border border-navy-200 shrink-0 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-navy-600"
            >
              <Globe className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
              <span>Kerja Remote</span>
            </Link>

            {/* Chip Seluruh Provinsi */}
            {provinces.map((prov) => (
              <Link
                key={prov.id}
                href={`/wilayah/${prov.slug}`}
                className="inline-flex items-center px-3.5 py-2 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 shrink-0 transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-navy-600"
              >
                <span>{prov.name}</span>
              </Link>
            ))}
          </div>

          {/* Tombol Geser Kanan (Desktop) */}
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Geser pilihan provinsi ke kanan"
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-full bg-white border border-slate-300 shadow-sm items-center justify-center text-slate-700 hover:text-navy-900 hover:bg-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-navy-600"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
