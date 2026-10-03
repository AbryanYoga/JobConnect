"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Search,
  ShieldCheck,
  Clock,
  Cpu,
  MapPin,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState("");

  useGSAP(
    () => {
      // Periksa preferensi reduced motion pengguna
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", {
        y: -15,
        opacity: 0,
        duration: 0.6,
      })
        .from(
          ".hero-title",
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.3"
        )
        .from(
          ".hero-subtitle",
          {
            y: 15,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          ".hero-search",
          {
            y: 25,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.3"
        )
        .from(
          ".hero-pillar",
          {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
          },
          "-=0.3"
        );
    },
    { scope: containerRef }
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = keyword.trim();
    if (query) {
      router.push(`/lowongan?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/lowongan");
    }
  };

  const popularKeywords = [
    "Operator Produksi",
    "Teknisi Listrik",
    "Staff Administrasi",
    "Akuntansi",
    "Teknologi Informasi",
  ];

  return (
    <section
      ref={containerRef}
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 text-white pt-16 pb-20 sm:pt-24 sm:pb-28"
    >
      {/* Aksen Latar Belakang Geometris Halus */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        aria-hidden="true"
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-navy-500 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-amber-500/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          {/* Lencana Pil Penanda Jangkauan */}
          <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs sm:text-sm font-medium text-navy-100 shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Portal Lowongan Terverifikasi • 38 Provinsi</span>
          </div>

          {/* Judul Utama Berkekuatan Tinggi */}
          <h1
            id="hero-heading"
            className="hero-title text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]"
          >
            Temukan Karier Impian,{" "}
            <span className="text-amber-400">Terhubung Langsung</span> ke Seluruh
            Indonesia
          </h1>

          {/* Subjudul Penjelas Nilai Platform */}
          <p className="hero-subtitle text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Platform bursa kerja transparan dengan verifikasi manual oleh admin,
            bebas risiko penipuan, bebas ghosting, dan seleksi adil untuk talenta
            di 514 kota dan kabupaten.
          </p>

          {/* Kotak Pencarian Terpadu Melayang */}
          <div className="hero-search pt-2 max-w-2xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              noValidate
              role="search"
              aria-label="Pencarian lowongan di beranda"
              className="p-2 sm:p-2.5 rounded-card bg-white text-slate-900 shadow-lg border border-slate-200/80 flex flex-col sm:flex-row items-stretch gap-2"
            >
              <div className="flex-1 relative flex items-center">
                <Search
                  className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="hero-search-input"
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Cari posisi kerja, keahlian, atau profesi..."
                  className="w-full pl-11 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 rounded-control min-h-[44px]"
                  aria-label="Kata kunci pencarian lowongan"
                />
              </div>

              <button
                type="submit"
                id="hero-search-button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-control bg-navy-700 hover:bg-navy-800 active:bg-navy-900 text-white font-medium text-sm transition-colors shadow-xs min-h-[44px] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-500"
              >
                <span>Cari Lowongan</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>

            {/* Tag Kata Kunci Populer */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap pt-3 text-xs text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                Pencarian populer:
              </span>
              {popularKeywords.map((item) => (
                <Link
                  key={item}
                  href={`/lowongan?q=${encodeURIComponent(item)}`}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors border border-white/10"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Pilar Kepercayaan JobConnect */}
        <div className="mt-16 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Pilar 1 */}
          <div className="hero-pillar p-5 rounded-card bg-white/5 backdrop-blur-xs border border-white/10 hover:border-white/25 transition-all">
            <div className="w-10 h-10 rounded-control bg-amber-400/20 text-amber-400 flex items-center justify-center mb-3.5">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Verifikasi ACC Admin
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Seluruh lowongan dimoderasi manual sebelum tayang untuk melindungi
              pelamar dari penipuan dan pungutan liar.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="hero-pillar p-5 rounded-card bg-white/5 backdrop-blur-xs border border-white/10 hover:border-white/25 transition-all">
            <div className="w-10 h-10 rounded-control bg-sky-400/20 text-sky-400 flex items-center justify-center mb-3.5">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Bebas Ghosting
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Kepastian status dengan 8 tahapan lamaran transparan dan riwayat
              waktu pembaruan secara real-time.
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="hero-pillar p-5 rounded-card bg-white/5 backdrop-blur-xs border border-white/10 hover:border-white/25 transition-all">
            <div className="w-10 h-10 rounded-control bg-emerald-400/20 text-emerald-400 flex items-center justify-center mb-3.5">
              <Cpu className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Seleksi Adil & Opsional
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Analisis kesesuaian CV oleh AI bersifat pilihan mandiri tanpa
              menolak pelamar secara otomatis.
            </p>
          </div>

          {/* Pilar 4 */}
          <div className="hero-pillar p-5 rounded-card bg-white/5 backdrop-blur-xs border border-white/10 hover:border-white/25 transition-all">
            <div className="w-10 h-10 rounded-control bg-indigo-400/20 text-indigo-400 flex items-center justify-center mb-3.5">
              <MapPin className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Jangkauan 38 Provinsi
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Data wilayah resmi Kemendagri menjangkau peluang kerja di 514 kota,
              kabupaten, hingga lowongan kerja remote.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
