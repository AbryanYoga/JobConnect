"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "@/lib/i18n";

/**
 * Komponen LogoIcon JobConnect:
 * Kotak ikon dengan simbol resmi JobConnect (The Gateway Bridge) dan animasi interaktif.
 */
function LogoIcon() {
  return (
    <motion.div
      whileHover={{ scale: 1.06, rotate: [0, -4, 4, 0] }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-9 h-9 bg-[#31A8FF] rounded-xl flex items-center justify-center p-1.5 shadow-xs shrink-0 cursor-pointer"
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
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
    </motion.div>
  );
}

/**
 * Daftar ikon media sosial resmi JobConnect.
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
 * Komponen Link Animasi:
 * Memberikan pergeseran halus ke kanan saat pointer diarahkan ke tautan.
 */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.li whileHover={{ x: 3 }} transition={{ duration: 0.18, ease: "easeOut" }}>
      <Link
        href={href}
        className="inline-block text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31A8FF]"
      >
        {children}
      </Link>
    </motion.li>
  );
}

/**
 * Komponen FooterCard:
 * Kartu terpadu (single unified card) dengan warna putih solid, batas halus,
 * dan animasi scroll masuk yang menyatu dengan latar belakang krem (#FAF8F0).
 */
function FooterCard() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.99 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white rounded-[36px] sm:rounded-[44px] border border-black/[0.08] shadow-sm overflow-hidden">
        {/* Area Konten Utama Grid */}
        <div className="p-8 md:p-10 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Kolom Informasi Brand (2 Kolom di Desktop) */}
          <div className="lg:col-span-2 space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31A8FF] rounded-xl"
              aria-label={t("JobConnect Beranda", "JobConnect Home")}
            >
              <LogoIcon />
              <span className="text-[26px] font-bold tracking-tight text-[#0F172A] group-hover:text-[#31A8FF] transition-colors">
                JobConnect
              </span>
            </Link>

            <p className="text-[#64748B] leading-relaxed text-[15px] font-normal max-w-[320px]">
              {t(
                "Portal lowongan kerja terpercaya yang mempertemukan talenta dengan perusahaan mitra di 38 provinsi di Indonesia.",
                "Trusted job portal connecting talent with partner companies across 38 provinces in Indonesia."
              )}
            </p>

            {/* Kelompok Tombol Media Sosial dengan Animasi Hover Spring */}
            <div className="flex items-center gap-3 pt-1">
              {SOCIAL_ICONS.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t("Kunjungi", "Visit")} ${social.name} JobConnect`}
                  whileHover={{ y: -3, scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 450, damping: 20 }}
                  className="w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-black/[0.08] bg-[#FAF8F0]/50 hover:bg-[#FAF8F0] shadow-2xs hover:shadow-xs transition-colors group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31A8FF]"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Kolom Lowongan */}
          <div className="space-y-5">
            <h4 className="text-[14px] font-semibold tracking-wider text-[#94A3B8] uppercase">
              {t("Lowongan", "Jobs")}
            </h4>
            <ul className="space-y-3.5 list-none p-0 m-0">
              <FooterLink href="/lowongan">{t("Semua Lowongan", "All Jobs")}</FooterLink>
              <FooterLink href="/wilayah">{t("Jelajah Wilayah", "Explore Regions")}</FooterLink>
              <FooterLink href="/wilayah/remote">{t("Kerja Remote", "Remote Work")}</FooterLink>
              <FooterLink href="/lowongan">{t("Lowongan Terbaru", "Latest Jobs")}</FooterLink>
            </ul>
          </div>

          {/* Kolom Panduan */}
          <div className="space-y-5">
            <h4 className="text-[14px] font-semibold tracking-wider text-[#94A3B8] uppercase">
              {t("Panduan", "Guides")}
            </h4>
            <ul className="space-y-3.5 list-none p-0 m-0">
              <FooterLink href="/tentang">{t("Alur Melamar", "Application Process")}</FooterLink>
              <FooterLink href="/tentang">{t("Screening CV", "CV Screening")}</FooterLink>
              <FooterLink href="/tentang">{t("Verifikasi Mitra", "Partner Verification")}</FooterLink>
              <FooterLink href="/tentang">{t("Keamanan Akun", "Account Security")}</FooterLink>
            </ul>
          </div>

          {/* Kolom Perusahaan */}
          <div className="space-y-5">
            <h4 className="text-[14px] font-semibold tracking-wider text-[#94A3B8] uppercase">
              {t("Perusahaan", "Companies")}
            </h4>
            <ul className="space-y-3.5 list-none p-0 m-0">
              <FooterLink href="/tentang">{t("Tentang Kami", "About Us")}</FooterLink>
              <FooterLink href="/mitra">{t("Dashboard Mitra", "Partner Dashboard")}</FooterLink>
              <FooterLink href="/register?peran=perusahaan">{t("Pasang Lowongan", "Post a Job")}</FooterLink>
              <FooterLink href="/tentang">{t("Pusat Bantuan", "Help Center")}</FooterLink>
            </ul>
          </div>
        </div>

        {/* Baris Legal Bagian Bawah: Terpadu di dalam kartu putih dengan pemisah halus */}
        <div className="border-t border-black/[0.06] bg-[#FAF8F0]/30 px-6 sm:px-10 lg:px-12 py-5 flex flex-col md:flex-row justify-between items-center gap-4 text-[14px]">
          <p className="text-[#64748B] font-medium">
            &copy; {currentYear} JobConnect. {t("Hak cipta dilindungi.", "All rights reserved.")}
          </p>

          <div className="flex items-center gap-6 sm:gap-8 text-[#64748B] font-medium">
            <Link
              href="/tentang"
              className="hover:text-[#1E293B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31A8FF]"
            >
              {t("Pusat Legal", "Legal Center")}
            </Link>
            <div className="w-[1px] h-4 bg-slate-200" aria-hidden="true" />
            <Link
              href="/tentang"
              className="hover:text-[#1E293B] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#31A8FF]"
            >
              {t("Ketentuan Pengguna", "Terms of Use")}
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Komponen Footer Utama JobConnect:
 * Berlatar krem (#FAF8F0) yang menyatu sempurna dengan seluruh tata letak halaman.
 */
export function Footer() {
  return (
    <footer className="w-full flex flex-col items-center gap-0 mt-auto pt-6 sm:pt-8 pb-14 sm:pb-18 bg-[#FAF8F0]">
      <FooterCard />
    </footer>
  );
}

export default Footer;
