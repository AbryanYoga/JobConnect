"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Search, MapPin, ShieldCheck, CheckCircle2, CircleDollarSign } from "lucide-react";
import Link from "next/link";

export interface ProvinceOption {
  id: number;
  name: string;
  slug: string;
}

interface HeroSectionProps {
  provinces?: ProvinceOption[];
}

export function HeroSection({ provinces = [] }: HeroSectionProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.from(".hero-badge", {
        opacity: 0,
        y: -10,
        duration: 0.5,
      })
        .from(
          ".hero-title",
          {
            opacity: 0,
            y: 15,
            duration: 0.6,
          },
          "-=0.2"
        )
        .from(
          ".hero-subtitle",
          {
            opacity: 0,
            y: 12,
            duration: 0.5,
          },
          "-=0.3"
        )
        .from(
          ".hero-search",
          {
            opacity: 0,
            y: 15,
            duration: 0.6,
          },
          "-=0.2"
        )
        .from(
          ".hero-guarantee",
          {
            opacity: 0,
            y: 10,
            duration: 0.5,
          },
          "-=0.2"
        );
    },
    { scope: containerRef }
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = keyword.trim();
    const params = new URLSearchParams();

    if (query) {
      params.set("q", query);
    }

    if (selectedLocation === "remote") {
      params.set("mode", "remote");
    } else if (selectedLocation) {
      params.set("wilayah", selectedLocation);
    }

    const queryString = params.toString();
    if (queryString) {
      router.push(`/lowongan?${queryString}`);
    } else {
      router.push("/lowongan");
    }
  };

  const popularKeywords = [
    "Operator Produksi",
    "Staff Administrasi",
    "Teknisi Listrik",
    "Akuntansi",
    "Teknologi Informasi",
  ];

  return (
    <section
      ref={containerRef}
      aria-labelledby="hero-heading"
      className="bg-white border-b border-slate-200 pt-12 pb-14 sm:pt-16 sm:pb-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          {/* Label Kontekstual Tanpa Efek AI */}
          <div className="hero-badge mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider bg-navy-50 text-navy-800 border border-navy-100">
              <ShieldCheck className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
              <span>Portal Bursa Kerja Terverifikasi Indonesia</span>
            </span>
          </div>

          {/* Judul Utama yang Kuat dan Manusiawi */}
          <h1
            id="hero-heading"
            className="hero-title text-3xl sm:text-4xl lg:text-5xl font-black text-navy-950 tracking-tight leading-[1.2]"
          >
            Lowongan Kerja Resmi dan Terverifikasi di 38 Provinsi
          </h1>

          {/* Subjudul Lugas */}
          <p className="hero-subtitle text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
            Temukan kesempatan karier dari perusahaan yang dimoderasi manual oleh admin.
            Proses seleksi transparan, tanpa risiko ghosting, dan bebas pungutan liar.
          </p>

          {/* Konsol Pencarian Terpadu Dua Kolom */}
          <div className="hero-search mt-8">
            <form
              onSubmit={handleSearchSubmit}
              noValidate
              role="search"
              aria-label="Pencarian lowongan kerja"
              className="bg-slate-50 p-2 sm:p-2.5 rounded-card border border-slate-300 shadow-sm flex flex-col md:flex-row items-stretch gap-2"
            >
              {/* Kolom Kata Kunci */}
              <div className="flex-1 relative flex items-center bg-white rounded-control border border-slate-200 focus-within:border-navy-600 focus-within:ring-1 focus-within:ring-navy-600">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="hero-search-input"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Posisi kerja, keahlian, atau perusahaan..."
                  className="w-full pl-10 pr-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[44px] rounded-control"
                  aria-label="Kata kunci lowongan kerja"
                />
              </div>

              {/* Kolom Pemilih Wilayah / Provinsi */}
              <div className="md:w-64 relative flex items-center bg-white rounded-control border border-slate-200 focus-within:border-navy-600 focus-within:ring-1 focus-within:ring-navy-600">
                <MapPin
                  className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                  aria-hidden="true"
                />
                <select
                  id="hero-location-select"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 text-sm text-slate-800 bg-transparent focus:outline-none min-h-[44px] rounded-control appearance-none cursor-pointer"
                  aria-label="Pilih wilayah atau provinsi"
                >
                  <option value="">Semua Wilayah</option>
                  <option value="remote">Kerja Remote (Dari Mana Saja)</option>
                  {provinces.map((prov) => (
                    <option key={prov.id} value={prov.slug}>
                      {prov.name}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 text-xs text-slate-400">
                  ▼
                </span>
              </div>

              {/* Tombol Eksekusi Pencarian */}
              <button
                type="submit"
                id="hero-search-button"
                className="inline-flex items-center justify-center px-6 py-3 rounded-control bg-navy-800 hover:bg-navy-900 active:bg-navy-950 text-white font-medium text-sm transition-colors shadow-xs min-h-[44px] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-700"
              >
                Cari Lowongan
              </button>
            </form>

            {/* Kata Kunci Sering Dicari (Tanpa Ikon Sparkles AI) */}
            <div className="flex items-center gap-2 flex-wrap mt-3 text-xs text-slate-600">
              <span className="text-slate-500 font-medium">Sering dicari:</span>
              {popularKeywords.map((item) => (
                <Link
                  key={item}
                  href={`/lowongan?q=${encodeURIComponent(item)}`}
                  className="px-2.5 py-1 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-navy-950 transition-colors border border-slate-200"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Jalur Transparansi dan Kepastian (Bukan 4 Kartu Seragam AI) */}
        <div className="hero-guarantee mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-navy-50 text-navy-800 border border-navy-100 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-950">
                Moderasi Manual Admin
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Setiap lowongan dan profil perusahaan diverifikasi keabsahannya sebelum tayang guna mencegah penipuan.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-navy-50 text-navy-800 border border-navy-100 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-950">
                Transparansi 8 Status Seleksi
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pelamar dapat memantau setiap langkah proses rekrutmen secara real-time tanpa ketidakpastian.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-navy-50 text-navy-800 border border-navy-100 flex items-center justify-center shrink-0 mt-0.5">
              <CircleDollarSign className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-950">
                Nol Pungutan Biaya
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Seluruh tahapan pendaftaran akun, pencarian lowongan, hingga pengiriman berkas 100% gratis bagi pencari kerja.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
