"use client";

import React from "react";
import Link from "next/link";

/**
 * Komponen LogoIcon JobConnect:
 * Kotak ikon bersudut membulat dengan simbol resmi JobConnect (The Gateway Bridge).
 */
function LogoIcon() {
  return (
    <div className="w-8 h-8 bg-[#31A8FF] rounded-[8px] flex items-center justify-center p-1.5 shadow-2xs shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        aria-hidden="true"
      >
        <g transform="translate(4.0, 4.0) scale(0.92)">
          <path
            fill="white"
            d="M 14 86 V 46 C 14 26 30 14 50 14 C 56 14 62 16 67 19 L 60 30 C 57 28 54 26 50 26 C 35 26 25 35 25 47 V 86 Z"
          />
          <path
            fill="white"
            d="M 86 14 V 54 C 86 74 70 86 50 86 C 44 86 38 84 33 81 L 40 70 C 43 72 46 74 50 74 C 63 74 73 65 73 53 V 14 Z"
          />
          <path
            fill="#FFDD00"
            fillRule="evenodd"
            d="M 50 38 A 12 12 0 1 0 50 62 A 12 12 0 1 0 50 38 Z M 50 45 A 5 5 0 1 1 50 55 A 5 5 0 1 1 50 45 Z"
          />
        </g>
      </svg>
    </div>
  );
}

/**
 * Daftar ikon media sosial terverifikasi.
 */
const SOCIAL_ICONS = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg
        className="w-5 h-5 text-slate-800 fill-current"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
  },
  {
    name: "X (Twitter)",
    href: "https://x.com",
    icon: (
      <svg
        className="w-5 h-5 text-slate-800 fill-current"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg
        className="w-5 h-5 text-slate-800 stroke-current fill-none stroke-2"
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
];

/**
 * Komponen FooterCard:
 * Struktur kartu berlapis (layered card) dengan kotak luar abu-abu dan wadah putih di dalamnya.
 */
function FooterCard() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#E9EBEE] rounded-[48px] border border-slate-200 shadow-sm overflow-hidden">
        {/* Kotak Putih Dalam */}
        <div className="bg-white rounded-[40px] m-2 shadow-sm">
          <div className="p-8 md:p-10 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Kolom Informasi Brand (2 Kolom di Desktop) */}
            <div className="lg:col-span-2 space-y-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 group"
                aria-label="JobConnect Beranda"
              >
                <LogoIcon />
                <span className="text-[26px] font-bold tracking-tight text-[#0F172A]">
                  JobConnect
                </span>
              </Link>

              <p className="text-[#64748B] leading-relaxed text-[16px] font-normal max-w-[320px]">
                Portal lowongan kerja terpercaya yang mempertemukan talenta dengan perusahaan mitra di 38 provinsi di Indonesia.
              </p>

              {/* Kelompok Tombol Media Sosial */}
              <div className="flex items-center gap-3">
                {SOCIAL_ICONS.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Kunjungi ${social.name} JobConnect`}
                    className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-slate-50 transition-all active:scale-95 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31A8FF]"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Kolom Lowongan */}
            <div className="space-y-6">
              <h4 className="text-[14px] font-medium text-[#94A3B8]">Lowongan</h4>
              <ul className="space-y-4 list-none p-0 m-0">
                <li>
                  <Link
                    href="/lowongan"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Semua Lowongan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wilayah"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Jelajah Wilayah
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wilayah/remote"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Kerja Remote
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lowongan"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Lowongan Terbaru
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolom Panduan */}
            <div className="space-y-6">
              <h4 className="text-[14px] font-medium text-[#94A3B8]">Panduan</h4>
              <ul className="space-y-4 list-none p-0 m-0">
                <li>
                  <Link
                    href="/tentang"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Alur Melamar
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tentang"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Screening CV
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tentang"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Verifikasi Mitra
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tentang"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Keamanan Akun
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolom Perusahaan */}
            <div className="space-y-6">
              <h4 className="text-[14px] font-medium text-[#94A3B8]">Perusahaan</h4>
              <ul className="space-y-4 list-none p-0 m-0">
                <li>
                  <Link
                    href="/tentang"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="/mitra"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Dashboard Mitra
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register?peran=perusahaan"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Pasang Lowongan
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tentang"
                    className="text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors"
                  >
                    Pusat Bantuan
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Baris Legal Bagian Bawah (Di Dalam Wadah Abu-Abu, Di Luar Kotak Putih) */}
        <div className="px-6 sm:px-12 md:px-16 lg:px-20 py-5 flex flex-col md:flex-row justify-between items-center gap-6 text-[15px]">
          <p className="text-[#64748B] font-medium">
            &copy; {currentYear} JobConnect. Hak cipta dilindungi.
          </p>

          <div className="flex items-center gap-8 text-[#64748B] font-medium">
            <Link
              href="/tentang"
              className="hover:text-[#1E293B] transition-colors"
            >
              Pusat Legal
            </Link>
            <div className="w-[1px] h-4 bg-slate-300" aria-hidden="true" />
            <Link
              href="/tentang"
              className="hover:text-[#1E293B] transition-colors"
            >
              Ketentuan Pengguna
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Komponen Footer Utama JobConnect
 */
export function Footer() {
  return (
    <footer className="w-full flex flex-col items-center gap-0 mt-auto pt-8 pb-12 bg-transparent">
      <FooterCard />
    </footer>
  );
}

export default Footer;
