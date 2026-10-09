"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Globe, ChevronRight } from "lucide-react";

export interface ProvinceWithCount {
  id: number;
  name: string;
  slug: string;
  jobCount: number;
}

interface ProvinceIndexViewProps {
  provinces: ProvinceWithCount[];
  remoteCount: number;
  totalOpenJobs: number;
}

export function ProvinceIndexView({
  provinces,
  remoteCount,
  totalOpenJobs,
}: ProvinceIndexViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active">("all");

  const filteredProvinces = useMemo(() => {
    let result = provinces;

    if (filterMode === "active") {
      result = result.filter((p) => p.jobCount > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    return result;
  }, [provinces, filterMode, searchQuery]);

  const activeProvincesCount = useMemo(() => {
    return provinces.filter((p) => p.jobCount > 0).length;
  }, [provinces]);

  return (
    <div className="space-y-8 pb-16">
      {/* Breadcrumb Navigasi */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link
              href="/"
              className="hover:text-navy-900 transition-colors focus-visible:outline-2 focus-visible:outline-navy-700 rounded-xs"
            >
              Beranda
            </Link>
          </li>
          <li aria-hidden="true" className="text-slate-400">
            /
          </li>
          <li className="font-semibold text-slate-800" aria-current="page">
            Wilayah
          </li>
        </ol>
      </nav>

      {/* Header Halaman */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-navy-50 text-navy-800 border border-navy-100 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
          <span>Jelajah Nusantara</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-navy-950 tracking-tight">
          Jelajah Lowongan Berdasarkan Wilayah
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Temukan lowongan kerja resmi yang tersebar di 38 provinsi di Indonesia serta opsi
          kerja jarak jauh (remote). Terdapat {totalOpenJobs} lowongan aktif di {activeProvincesCount} provinsi.
        </p>
      </div>

      {/* Kartu Khusus Lowongan Remote */}
      <div className="rounded-card border border-navy-200 bg-navy-50/50 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-sm bg-navy-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Globe className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-navy-950">
                Kerja Remote (Bebas Lokasi)
              </h2>
              <span className="px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-white text-navy-800 border border-navy-200">
                {remoteCount > 0 ? `${remoteCount} lowongan aktif` : "Belum ada lowongan"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Peluang karier yang dapat dikerjakan dari mana saja tanpa batasan domisili atau kewajiban hadir di kantor fisik.
            </p>
          </div>
        </div>

        <Link
          href="/wilayah/remote"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-control bg-navy-800 hover:bg-navy-900 active:bg-navy-950 text-white font-medium text-xs sm:text-sm transition-colors shadow-xs shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
        >
          Lihat Lowongan Remote
        </Link>
      </div>

      {/* Bar Pencarian & Filter Provinsi */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Input Pencarian Nama Provinsi */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama provinsi (misal: Jawa, Bali, Papua)..."
            className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-control focus:outline-none focus:border-navy-700 focus:ring-1 focus:ring-navy-700 min-h-[44px]"
            aria-label="Cari nama provinsi"
          />
        </div>

        {/* Filter Tombol Pil */}
        <div className="flex items-center gap-1.5 shrink-0" role="group" aria-label="Filter status lowongan">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-3 py-2 rounded-sm text-xs font-semibold transition-colors min-h-[44px] border ${
              filterMode === "all"
                ? "bg-navy-800 text-white border-navy-800"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Semua ({provinces.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("active")}
            className={`px-3 py-2 rounded-sm text-xs font-semibold transition-colors min-h-[44px] border ${
              filterMode === "active"
                ? "bg-navy-800 text-white border-navy-800"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            Ada Lowongan ({activeProvincesCount})
          </button>
        </div>
      </div>

      {/* Grid 38 Provinsi */}
      {filteredProvinces.length === 0 ? (
        <div className="rounded-card border border-dashed border-slate-300 p-8 sm:p-12 text-center bg-white">
          <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" aria-hidden="true" />
          <h3 className="text-sm font-bold text-navy-950">
            Provinsi tidak ditemukan
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tidak ada provinsi yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setFilterMode("all");
            }}
            className="mt-3 text-xs font-semibold text-navy-800 hover:underline min-h-[44px] inline-flex items-center"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredProvinces.map((province) => {
            const hasJobs = province.jobCount > 0;

            return (
              <Link
                key={province.id}
                href={`/wilayah/${province.slug}`}
                className={`p-4 rounded-card border transition-all flex items-center justify-between gap-3 min-h-[64px] group focus-visible:outline-2 focus-visible:outline-navy-700 ${
                  hasJobs
                    ? "bg-white border-slate-200 hover:border-navy-400 hover:bg-slate-50/50 shadow-2xs"
                    : "bg-slate-50/70 border-slate-200/70 hover:border-slate-300 opacity-75"
                }`}
              >
                <div className="min-w-0 space-y-0.5">
                  <h3
                    className={`text-sm font-bold truncate transition-colors ${
                      hasJobs
                        ? "text-navy-950 group-hover:text-navy-800"
                        : "text-slate-600"
                    }`}
                  >
                    {province.name}
                  </h3>
                  <p
                    className={`text-xs ${
                      hasJobs ? "text-navy-800 font-medium" : "text-slate-400"
                    }`}
                  >
                    {hasJobs ? `${province.jobCount} lowongan aktif` : "Belum ada lowongan"}
                  </p>
                </div>

                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5 ${
                    hasJobs ? "text-navy-700" : "text-slate-300"
                  }`}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
