"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Search,
  MapPin,
  ArrowRight,
  Building2,
  Check,
  Laptop,
  Globe,
  FileText,
  Heart,
} from "lucide-react";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  EDUCATION_LABEL,
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useLanguage } from "@/lib/i18n";

export interface BmcLandingProps {
  provinces: { id: number; name: string; slug: string }[];
  categories: { id: number; name: string; slug: string; jobCount: number }[];
  latestJobs: {
    id: number;
    title: string;
    slug: string;
    workMode: WorkMode;
    jobType: JobType;
    educationMin: EducationMin;
    experienceMinYears?: number;
    skills?: string[];
    summary?: string | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    isDemo?: boolean;
    createdAt?: string;
    company: {
      id: number;
      name: string;
      slug?: string;
      logoUrl?: string | null;
      cityName?: string | null;
      provinceName?: string | null;
    } | null;
  }[];
  totalJobsCount: number;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatSalary(min?: number | null, max?: number | null, t?: (id: string, en?: string) => string): string {
  if (min && max) {
    return `${formatRupiah(min)} - ${formatRupiah(max)}`;
  }
  if (min) {
    return `${t ? t("Mulai", "From") : "Mulai"} ${formatRupiah(min)}`;
  }
  if (max) {
    return `${t ? t("Hingga", "Up to") : "Hingga"} ${formatRupiah(max)}`;
  }
  return t ? t("Gaji dapat dinegosiasikan", "Salary negotiable") : "Gaji dapat dinegosiasikan";
}

import { getCompanyLogo, getCompanyInitials } from "@/lib/company-logo";

const HERO_CASCADE_CARDS = [
  {
    cls: "bmc-scroll-l1 absolute top-8 left-3 xl:left-8 2xl:left-14 w-48 xl:w-56 2xl:w-60 pointer-events-auto",
    rotate: "-rotate-6",
    logo: { type: "img" as const, src: "/logos/companies/telkom.svg", alt: "Telkom Indonesia", pad: "p-1.5" },
    titleId: "PT Telkom Nusantara membuka 12 posisi Frontend & Backend",
    titleEn: "PT Telkom Nusantara opens 12 Frontend & Backend positions",
    statId: "9.138 pelamar",
    statEn: "9,138 applicants",
  },
  {
    cls: "bmc-scroll-l2 absolute top-[270px] xl:top-[290px] left-6 xl:left-14 2xl:left-22 w-48 xl:w-56 2xl:w-60 pointer-events-auto",
    rotate: "rotate-2",
    logo: { type: "img" as const, src: "/logos/companies/mandiri.svg", alt: "Bank Mandiri", pad: "p-1" },
    titleId: "Bank Mandiri merekrut Officer Development Program nasional",
    titleEn: "Bank Mandiri recruits national Officer Development Program",
    statId: "8.450 pelamar",
    statEn: "8,450 applicants",
  },
  {
    cls: "bmc-scroll-l3 absolute top-[520px] xl:top-[550px] left-2 xl:left-6 2xl:left-12 w-48 xl:w-56 2xl:w-60 pointer-events-auto",
    rotate: "-rotate-3",
    logo: { type: "text" as const, text: "BS", bg: "bg-blue-600" },
    titleId: "Budi Santoso diterima sebagai UI/UX Designer di Bank Mitra",
    titleEn: "Budi Santoso hired as UI/UX Designer at Partner Bank",
    statId: "Gaji Rp 14 - 20 Jt",
    statEn: "Salary Rp 14 - 20 M",
  },
  {
    cls: "bmc-scroll-r1 absolute top-8 right-3 xl:right-8 2xl:right-14 w-48 xl:w-56 2xl:w-60 pointer-events-auto",
    rotate: "rotate-6",
    logo: { type: "img" as const, src: "/logos/companies/bca.svg", alt: "BCA Finance", pad: "p-1.5" },
    titleId: "BCA Finance Mitra membuka Staff Operasional wilayah Surabaya",
    titleEn: "BCA Finance Partner opens Operations Staff in Surabaya",
    statId: "146 lowongan baru",
    statEn: "146 new vacancies",
  },
  {
    cls: "bmc-scroll-r2 absolute top-[270px] xl:top-[290px] right-6 xl:right-14 2xl:right-22 w-48 xl:w-56 2xl:w-60 pointer-events-auto",
    rotate: "-rotate-2",
    logo: { type: "img" as const, src: "/logos/companies/gojek.svg", alt: "Gojek Mitra", pad: "p-1" },
    titleId: "Gojek Mitra Logistik membuka 24 posisi Product & Operations Remote",
    titleEn: "Gojek Logistics Partner opens 24 Remote Product & Operations positions",
    statId: "2.095 pelamar",
    statEn: "2,095 applicants",
  },
  {
    cls: "bmc-scroll-r3 absolute top-[520px] xl:top-[550px] right-2 xl:right-6 2xl:right-12 w-48 xl:w-56 2xl:w-60 pointer-events-auto",
    rotate: "rotate-4",
    logo: { type: "img" as const, src: "/logos/companies/solusi-pintar.svg", alt: "Solusi Pintar Teknologi", pad: "p-1" },
    titleId: "Solusi Pintar Teknologi merekrut Fresh Graduate SMK & Diploma",
    titleEn: "Solusi Pintar Teknologi recruits Vocational & Diploma Fresh Graduates",
    statId: "1.420 pelamar",
    statEn: "1,420 applicants",
  },
];

export function BmcLandingPage({
  provinces,
  latestJobs,
  totalJobsCount,
}: BmcLandingProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [keyword, setKeyword] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const heroSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mainContainerRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // Jika pengguna memilih reduced motion, pastikan semua elemen langsung terlihat
      gsap.set(
        ".hero-anim-item, .bmc-card-inner, .anim-jobseeker-header, .anim-jobseeker-mockup, .anim-transparency-header, .anim-mode-card, .anim-employer-left, .anim-employer-mockup, .anim-wilayah-header, .anim-wilayah-chip, .anim-jobs-header, .anim-job-card, .anim-cta-card",
        { opacity: 1, y: 0, x: 0, scale: 1 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-anim-item",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: "top 80%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      gsap.fromTo(
        ".bmc-card-inner",
        { opacity: 0, y: 35, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          stagger: 0.07,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: "top 80%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      if (heroSectionRef.current) {
        const parallaxConfigs = [
          { sel: ".bmc-scroll-l1", y: -160, rotate: -12, scrub: 1 },
          { sel: ".bmc-scroll-l2", y: -230, rotate: 6, scrub: 1.25 },
          { sel: ".bmc-scroll-l3", y: -300, rotate: -7, scrub: 1.5 },
          { sel: ".bmc-scroll-r1", y: -170, rotate: 12, scrub: 1.1 },
          { sel: ".bmc-scroll-r2", y: -240, rotate: -6, scrub: 1.35 },
          { sel: ".bmc-scroll-r3", y: -310, rotate: 8, scrub: 1.6 },
        ];
        parallaxConfigs.forEach((c) => {
          gsap.to(c.sel, {
            y: c.y,
            rotate: c.rotate,
            ease: "none",
            scrollTrigger: {
              trigger: heroSectionRef.current,
              start: "top 80px",
              end: "bottom top",
              scrub: c.scrub,
            },
          });
        });
      }

      const animFromTo = (target: string, trigger: string, fromVars: gsap.TweenVars, toVars: gsap.TweenVars = {}) => {
        gsap.fromTo(target, fromVars, {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger,
            start: "top 85%",
            end: "bottom top-=40px",
            toggleActions: "play reverse play reverse",
          },
          ...toVars,
        });
      };

      animFromTo(".anim-jobseeker-header", ".anim-jobseeker-header", { opacity: 0, y: 35 });
      animFromTo(".anim-jobseeker-mockup", ".anim-jobseeker-mockup", { opacity: 0, y: 45, scale: 0.94 }, { duration: 0.85, ease: "back.out(1.3)" });
      animFromTo(".anim-transparency-header", ".anim-transparency-header", { opacity: 0, y: 35 });
      animFromTo(".anim-mode-card", ".anim-mode-grid", { opacity: 0, y: 40, scale: 0.95 }, { stagger: 0.12, ease: "back.out(1.2)" });
      animFromTo(".anim-employer-left", ".anim-employer-box", { opacity: 0, x: -35 });
      animFromTo(".anim-employer-mockup", ".anim-employer-box", { opacity: 0, x: 35, scale: 0.95 }, { duration: 0.85, ease: "back.out(1.2)" });
      animFromTo(".anim-wilayah-header", ".anim-wilayah-header", { opacity: 0, y: 30 });
      animFromTo(".anim-wilayah-chip", ".anim-wilayah-grid", { opacity: 0, scale: 0.88, y: 18 }, { duration: 0.45, stagger: 0.035, ease: "back.out(1.4)" });
      animFromTo(".anim-jobs-header", ".anim-jobs-header", { opacity: 0, y: 30 });
      animFromTo(".anim-job-card", ".anim-jobs-grid", { opacity: 0, y: 35 }, { duration: 0.75, stagger: 0.09 });
      animFromTo(".anim-cta-card", ".anim-cta-card", { opacity: 0, y: 45, scale: 0.94 }, { duration: 0.85, ease: "power3.out" });
    }, mainContainerRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (selectedProvince) params.set("wilayah", selectedProvince);
    const qs = params.toString();
    router.push(qs ? `/lowongan?${qs}` : "/lowongan");
  };

  return (
    <div
      ref={mainContainerRef}
      className="bg-[#FAF8F0] min-h-screen text-[#1F2022] overflow-x-hidden selection:bg-[#FFDD00] selection:text-[#0D0C23]"
    >
      {/* ========================================================
          HERO SECTION (Khas Buy Me a Coffee dengan 6 Kartu Cascade & Parallax Scroll)
          ======================================================== */}
      <section
        ref={heroSectionRef}
        className="relative z-20 pt-10 sm:pt-16 pb-16 sm:pb-36 px-4 sm:px-6 lg:px-8 overflow-x-clip overflow-y-visible min-h-0 lg:min-h-[820px]"
      >
        <div className="mx-auto max-w-3xl text-center relative z-20 space-y-6 sm:space-y-8">
          {/* Badge Rating & Kepercayaan Atas Hero */}
          <div className="hero-anim-item inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#222222]/10 shadow-2xs">
            <div className="flex items-center gap-0.5 text-emerald-600">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 fill-emerald-600"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-[#1F2022]">
              {t("100% Terverifikasi Admin • Bebas Calo & Pungli", "100% Admin Verified • Zero Scams & Brokers")}
            </span>
          </div>

          {/* Headline Utama Besar & Hangat */}
          <h1 className="hero-anim-item text-4xl sm:text-6xl lg:text-7xl font-black text-[#0D0C23] tracking-tight leading-[1.08] max-w-3xl mx-auto">
            {t("Mulai langkah karier impianmu tanpa rasa cemas.", "Take the next step in your dream career with confidence.")}
          </h1>

          {/* Subtitle Ramah & Lugas */}
          <p className="hero-anim-item text-base sm:text-xl text-[#3A3B3E] max-w-2xl mx-auto leading-relaxed font-normal">
            {t(
              "Portal resmi penghubung pencari kerja dan perusahaan mitra di seluruh Indonesia. Transparan gaji, syarat kerja terstruktur, dan dipantau langsung oleh admin moderator.",
              "The official portal connecting job seekers and partner companies across Indonesia. Transparent salaries, structured requirements, and monitored directly by admin moderators."
            )}
          </p>

          {/* Tombol Kuning Khas BMC: Start My Page */}
          <div className="hero-anim-item flex items-center justify-center pt-1">
            <Link
              href="/lowongan"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-black text-base sm:text-lg transition shadow-2xs hover:shadow active:scale-95 min-h-[48px]"
            >
              {t("Mulai Cari Lowongan", "Start Searching Jobs")}
            </Link>
          </div>

          {/* Hero Search Bar: Widget Interaktif BMC Style */}
          <form
            onSubmit={handleSearchSubmit}
            className="hero-anim-item relative z-30 mx-auto max-w-2xl bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-full border border-[#222222]/15 shadow-card flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-2 px-4 py-2 flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t("Posisi, keahlian, atau profesi...", "Position, skills, or profession...")}
                className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>

            <div className="hidden md:flex items-center border-l border-slate-200 pl-2 pr-1 shrink-0 relative z-40">
              <CustomSelect
                variant="hero"
                icon={<MapPin className="w-4 h-4 text-slate-500" aria-hidden="true" />}
                options={[
                  { value: "", label: t("Semua Wilayah", "All Regions") },
                  ...provinces.map((prov) => ({
                    value: prov.slug,
                    label: prov.name,
                  })),
                ]}
                value={selectedProvince}
                onChange={(val) => setSelectedProvince(val)}
                placeholder={t("Semua Wilayah", "All Regions")}
                searchable={true}
                searchPlaceholder={t("Cari provinsi...", "Search province...")}
                dropdownClassName="w-64 max-w-[280px] -right-2 left-auto top-full"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-bold text-sm sm:text-base transition duration-150 shadow-2xs shrink-0 min-h-[44px]"
            >
              <span>{t("Cari Lowongan", "Search Jobs")}</span>
            </button>
          </form>

          {/* Keterangan Tambahan Bawah Search */}
          <div className="hero-anim-item relative z-10 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-600 font-medium pt-1">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>{t("Gratis untuk pencari kerja", "Free for job seekers")}</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>{totalJobsCount} {t("lowongan aktif siap dilamar", "active vacancies ready to apply")}</span>
            </span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>{t("Jangkauan 38 provinsi", "Coverage across 38 provinces")}</span>
            </span>
          </div>
        </div>

        {/* ========================================================
            6 KARTU CASCADE DI KANAN DAN KIRI (100% Konsep Buy Me a Coffee)
            ======================================================== */}
        <div className="hidden lg:block pointer-events-none select-none z-20">
          {HERO_CASCADE_CARDS.map((card, i) => (
            <div key={i} className={card.cls}>
              <div className={`bmc-card-inner bg-white p-4 xl:p-5 rounded-3xl border border-black/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:shadow-card-md hover:-translate-y-1 transition duration-200 ${card.rotate} text-left`}>
                {card.logo.type === "img" ? (
                  <div className={`w-11 h-11 rounded-full bg-white border border-slate-200/90 ${card.logo.pad || "p-1"} flex items-center justify-center shadow-2xs overflow-hidden shrink-0`}>
                    <Image
                      src={card.logo.src}
                      alt={card.logo.alt}
                      width={38}
                      height={38}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className={`w-11 h-11 rounded-full ${card.logo.bg} text-white font-black text-sm flex items-center justify-center shadow-2xs shrink-0`}>
                    {card.logo.text}
                  </div>
                )}
                <p className="mt-3 text-xs xl:text-[13px] font-bold text-[#0D0C23] leading-snug line-clamp-3">
                  {t(card.titleId, card.titleEn)}
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] xl:text-xs text-slate-500 font-medium">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                  <span>{t(card.statId, card.statEn)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          FITUR UTAMA 1: PENCARI KERJA (Gaya Box Besar BMC "Support")
          ======================================================== */}
      <section className="anim-jobseeker-box py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl bg-white rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 lg:p-16 border border-[#222222]/10 shadow-card flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14 text-left">
          <div className="anim-jobseeker-header space-y-5 max-w-2xl">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-500 block">
              {t("Untuk Pencari Kerja", "For Job Seekers")}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0D0C23] tracking-tight leading-tight">
              {t("Lamar pekerjaan resmi dengan mudah dalam hitungan menit.", "Apply for official jobs easily within minutes.")}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {t(
                "JobConnect membuat proses melamar kerja transparan dan bebas ribet. Unggah CV sekali, pilih lowongan yang cocok, dan pantau status lamaran langsung dari dashboard Anda.",
                "JobConnect makes job applications transparent and hassle-free. Upload your CV once, select matching vacancies, and track application status directly from your dashboard."
              )}
            </p>
            <div className="pt-2">
              <Link
                href="/lowongan"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-black text-sm transition shadow-2xs hover:shadow active:scale-95 min-h-[44px]"
              >
                {t("Cari Lowongan Sekarang", "Search Vacancies Now")}
              </Link>
            </div>
          </div>

          {/* Mockup Interaktif Kartu Lamaran (BMC Replica) */}
          <div className="anim-jobseeker-mockup w-full max-w-md bg-[#FAF8F0] p-6 sm:p-8 rounded-[28px] border border-slate-200 shadow-2xs text-left space-y-5 hover:shadow-card transition duration-300 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-navy-950">
                {t("Lamar ke PT Inovasi Solusi", "Apply to PT Inovasi Solusi")}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {t("Resmi", "Official")}
              </span>
            </div>

            {/* Kotak Ringkasan Pekerjaan */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
              <span className="text-xs text-slate-500 block">{t("Posisi Lowongan", "Job Opening")}</span>
              <span className="text-base font-bold text-navy-950 block">
                Software Engineer (Fullstack)
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {t("Penuh Waktu", "Full Time")}
                </span>
                <span className="text-[11px] font-semibold bg-navy-50 text-navy-800 px-2 py-0.5 rounded">
                  {t("Hybrid • Jakarta", "Hybrid • Jakarta")}
                </span>
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">
                  {t("Rp 14 - 20 Juta", "Rp 14 - 20 Million")}
                </span>
              </div>
            </div>

            {/* Kotak Lampiran CV */}
            <div className="bg-white p-3.5 rounded-xl border border-dashed border-slate-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-5 h-5 text-navy-800 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    CV-Budi-Santoso.pdf
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    1.2 MB • {t("Siap dikirim", "Ready to send")}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 shrink-0">
                {t("Terverifikasi", "Verified")}
              </span>
            </div>

            {/* Tombol Kirim Lamaran Kuning Khas BMC */}
            <Link
              href="/lowongan"
              className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-black text-sm transition shadow-2xs hover:shadow active:scale-95 min-h-[44px]"
            >
              {t("Kirim Lamaran Sekarang", "Submit Application Now")}
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          FITUR UTAMA 2: TRANSPARANSI KRITERIA (Gaya BMC "Memberships")
          ======================================================== */}
      <section className="anim-transparency-box py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl bg-white rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 lg:p-16 border border-[#222222]/10 shadow-card text-center space-y-10">
          <div className="anim-transparency-header space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-500 block">
              {t("Transparansi Karier", "Career Transparency")}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0D0C23] tracking-tight leading-tight">
              {t("Kriteria jelas sejak awal. Tanpa gaji misterius.", "Clear criteria from day one. No mystery salaries.")}
            </h2>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {t(
                "Kami mewajibkan setiap lowongan mitra mencantumkan rentang gaji, kualifikasi pendidikan minimal, mode kerja, serta benefit secara terstruktur. Tidak ada lagi jebakan informasi yang disembunyikan.",
                "We require every partner vacancy to state salary ranges, minimum education qualifications, work modes, and benefits in a structured way. No more hidden information."
              )}
            </p>
          </div>

          {/* 3 Kartu Mode Kerja Bergaya Membership BMC */}
          <div className="anim-mode-grid grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Kartu 1: Onsite */}
            <div className="anim-mode-card bg-[#FAF8F0] p-6 rounded-[24px] border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-card hover:-translate-y-1 transition duration-200">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-navy-900 border border-slate-200 shadow-2xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-950">
                    {t("Kerja di Kantor (Onsite)", "Office Work (Onsite)")}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {t(
                      "Kolaborasi tatap muka dengan fasilitas kerja lengkap di kantor mitra.",
                      "In-person collaboration with full facilities at the partner office."
                    )}
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200/60 list-none p-0">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{t("BPJS Kesehatan & Ketenagakerjaan", "Health & Employment Social Security")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{t("Makan siang / tunjangan makan", "Lunch / meal allowance")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{t("Lingkungan tim profesional", "Professional team environment")}</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/lowongan?mode=onsite"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-full bg-white hover:bg-slate-50 text-navy-950 font-bold text-xs border border-slate-300 transition min-h-[44px]"
              >
                {t("Lihat Lowongan Onsite", "View Onsite Jobs")}
              </Link>
            </div>

            {/* Kartu 2: Hybrid (Featured Center Card) */}
            <div className="anim-mode-card bg-navy-950 text-white p-6 sm:p-7 rounded-[28px] shadow-card space-y-4 flex flex-col justify-between border-2 border-amber-400 relative hover:shadow-card-md hover:-translate-y-1 transition duration-200">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-navy-950 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider">
                {t("Paling Diminati", "Most Popular")}
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-amber-400 border border-white/10">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t("Model Kerja Hybrid", "Hybrid Work Model")}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    {t(
                      "Fleksibilitas seimbang antara kerja di rumah dan kantor.",
                      "Balanced flexibility between working from home and the office."
                    )}
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-200 pt-2 border-t border-white/10 list-none p-0">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>{t("2-3 hari kerja dari rumah", "2-3 days work from home")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>{t("Tunjangan internet bulanan", "Monthly internet allowance")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>{t("Laptop / perangkat difasilitasi", "Laptop / work device provided")}</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/lowongan?mode=hybrid"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-navy-950 font-black text-xs transition shadow-2xs hover:shadow active:scale-95 min-h-[44px]"
              >
                {t("Lihat Lowongan Hybrid", "View Hybrid Jobs")}
              </Link>
            </div>

            {/* Kartu 3: Remote */}
            <div className="anim-mode-card bg-[#FAF8F0] p-6 rounded-[24px] border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between hover:shadow-card hover:-translate-y-1 transition duration-200">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-navy-900 border border-slate-200 shadow-2xs">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-950">
                    {t("Remote (Jarak Jauh)", "Remote Work")}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {t(
                      "Bebas bekerja dari mana saja di seluruh 38 provinsi di Indonesia.",
                      "Freedom to work from anywhere across all 38 provinces in Indonesia."
                    )}
                  </p>
                </div>
                <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-200/60 list-none p-0">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{t("Bekerja dari domisili sendiri", "Work from your own residence")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{t("Gaji standar nasional", "National standard salary")}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{t("Jam kerja fleksibel", "Flexible working hours")}</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/wilayah/remote"
                className="inline-flex items-center justify-center w-full py-2.5 rounded-full bg-white hover:bg-slate-50 text-navy-950 font-bold text-xs border border-slate-300 transition min-h-[44px]"
              >
                {t("Lihat Lowongan Remote", "View Remote Jobs")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FITUR UTAMA 3: UNTUK PERUSAHAAN MITRA
          ======================================================== */}
      <section className="anim-employer-box py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl bg-white rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 lg:p-16 border border-[#222222]/10 shadow-card flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="anim-employer-left space-y-4 max-w-lg text-left">
            <span className="text-xs font-bold tracking-widest uppercase text-slate-500 block">
              {t("Untuk Perusahaan & HRD", "For Companies & HR")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0D0C23] tracking-tight leading-tight">
              {t("Pasang lowongan dan temukan talenta terbaik tanpa calo.", "Post vacancies and find top talent with zero intermediaries.")}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {t(
                "Kelola kebutuhan rekrutmen perusahaan Anda dengan platform terpercaya. Dapatkan pelamar berkualitas, sistem filter terintegrasi, dan kemudahan jadwal seleksi langsung dari Dashboard Mitra.",
                "Manage your company's recruitment needs with a trusted platform. Get qualified applicants, integrated filter systems, and easy selection scheduling right from the Partner Dashboard."
              )}
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/register?peran=perusahaan"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-bold text-sm transition shadow-2xs hover:shadow active:scale-95 min-h-[44px]"
              >
                {t("Daftar Sebagai Mitra Perusahaan", "Register as Partner Company")}
              </Link>
              <Link
                href="/tentang"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition min-h-[44px]"
              >
                {t("Pelajari Alur Moderasi", "Learn Moderation Flow")}
              </Link>
            </div>
          </div>

          {/* Kartu Dashboard Mitra Mockup */}
          <div className="anim-employer-mockup w-full md:w-80 bg-[#FAF8F0] p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3.5 text-left shrink-0 hover:shadow-card transition duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-navy-950 uppercase tracking-wide">
                {t("Dashboard Mitra", "Partner Dashboard")}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 block">{t("Pelamar Masuk", "Incoming Applicants")}</span>
              <span className="text-xl font-black text-navy-950">28 {t("Pelamar", "Applicants")}</span>
            </div>

            <div className="space-y-2">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
                <div>
                  <span className="font-bold text-slate-800 block">Siti Nurhaliza</span>
                  <span className="text-[10px] text-slate-500">UI Designer</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px]">
                  {t("Wawancara", "Interview")}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs shadow-2xs">
                <div>
                  <span className="font-bold text-slate-800 block">Ahmad Fauzi</span>
                  <span className="text-[10px] text-slate-500">Backend Dev</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                  {t("Diterima", "Accepted")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          JELAJAHI BERDASARKAN WILAYAH (38 Provinsi & Remote Work)
          ======================================================== */}
      <section className="anim-wilayah-section py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8 bg-white rounded-[32px] sm:rounded-[44px] p-6 sm:p-12 border border-[#222222]/10 shadow-card">
          <div className="anim-wilayah-header flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 border border-navy-100 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-navy-700" />
                <span>{t("Jangkauan 38 Provinsi di Indonesia", "Coverage across 38 Provinces in Indonesia")}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0D0C23] tracking-tight">
                {t("Jelajahi Lowongan Berdasarkan Wilayah", "Explore Jobs by Region")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
                {t(
                  "Temukan lowongan kerja resmi di provinsi domisilimu atau pilih kesempatan berkarier jarak jauh (remote).",
                  "Find official job openings in your home province or choose remote career opportunities."
                )}
              </p>
            </div>
            <Link
              href="/wilayah"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-navy-900 hover:text-navy-700 underline underline-offset-4 shrink-0"
            >
              <span>{t("Lihat Semua 38 Provinsi", "View All 38 Provinces")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid Chips Wilayah Terpopuler */}
          <div className="anim-wilayah-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {/* Chip Remote Highlight */}
            <Link
              href="/wilayah/remote"
              className="anim-wilayah-chip col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-navy-950 text-white flex items-center justify-between gap-2 shadow-2xs hover:shadow hover:-translate-y-0.5 transition min-h-[44px]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Globe className="w-4 h-4 text-[#FFDD00] shrink-0" />
                <span className="text-xs font-bold truncate">{t("Kerja Remote", "Remote Work")}</span>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFDD00] text-navy-950 shrink-0">
                {t("Nasional", "National")}
              </span>
            </Link>

            {provinces.slice(0, 11).map((prov) => (
              <Link
                key={prov.id}
                href={`/lowongan?wilayah=${prov.slug}`}
                className="anim-wilayah-chip p-3.5 rounded-2xl bg-[#FAF8F0] hover:bg-white border border-slate-200/80 hover:border-slate-300 flex items-center justify-between gap-2 shadow-2xs hover:shadow hover:-translate-y-0.5 transition min-h-[44px]"
              >
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {prov.name}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200/60 shrink-0">
                  {t("Lihat", "View")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          KATALOG LOWONGAN TERBARU (Real Data dari Database + Logo Perusahaan)
          ======================================================== */}
      {latestJobs && latestJobs.length > 0 && (
        <section className="anim-jobs-section py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <div className="anim-jobs-header flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold tracking-widest uppercase text-slate-500 block">
                  {t("Peluang Kerja Terbaru", "Latest Job Opportunities")}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#0D0C23] tracking-tight">
                  {t("Lowongan Resmi Terverifikasi", "Official Verified Vacancies")}
                </h2>
              </div>
              <Link
                href="/lowongan"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-navy-900 hover:text-navy-700 underline underline-offset-4"
              >
                <span>{t("Lihat Seluruh Lowongan", "View All Vacancies")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="anim-jobs-grid grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {latestJobs.map((job) => {
                const companyName = job.company?.name || "Perusahaan Mitra";
                const companyLogo = getCompanyLogo(companyName);
                const locationText =
                  [job.company?.cityName, job.company?.provinceName]
                    .filter(Boolean)
                    .join(", ") || (job.workMode === "remote" ? "Remote" : "Indonesia");

                return (
                  <article
                    key={job.id}
                    className="anim-job-card bg-white rounded-[24px] p-5 sm:p-6 border border-slate-200/90 shadow-card hover:shadow-card-md hover:border-slate-300 hover:-translate-y-1 transition duration-200 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 p-1 flex items-center justify-center shrink-0 font-bold text-xs text-navy-900 shadow-2xs overflow-hidden">
                            {job.company?.logoUrl ? (
                              <Image
                                src={job.company.logoUrl}
                                alt={`Logo ${companyName}`}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            ) : companyLogo ? (
                              <Image
                                src={companyLogo}
                                alt={`Logo ${companyName}`}
                                width={48}
                                height={48}
                                className="w-full h-full object-contain p-0.5"
                              />
                            ) : (
                              getCompanyInitials(companyName)
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-medium text-slate-600 block truncate">
                              {companyName}
                            </span>
                            <Link
                              href={`/lowongan/${job.slug}`}
                              className="text-base font-bold text-navy-950 hover:text-navy-800 transition line-clamp-1"
                            >
                              {job.title}
                            </Link>
                          </div>
                        </div>

                        {job.isDemo && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                            Demo
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{locationText}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                          {t(JOB_TYPE_LABEL[job.jobType] || job.jobType)}
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-navy-50 text-navy-800">
                          {t(WORK_MODE_LABEL[job.workMode] || job.workMode)}
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                          {t("Min.")} {t(EDUCATION_LABEL[job.educationMin] || job.educationMin)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-navy-950">
                        {formatSalary(job.salaryMin, job.salaryMax, t)}
                      </span>
                      <Link
                        href={`/lowongan/${job.slug}`}
                        className="inline-flex items-center justify-center px-4.5 py-2 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-bold text-xs shadow-2xs hover:shadow active:scale-95 transition min-h-[44px]"
                      >
                        {t("Detail Lowongan", "Job Details")}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          BOTTOM CALL TO ACTION BANNER (Gaya Melengkung BMC)
          ======================================================== */}
      <section className="anim-cta-section py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="anim-cta-card mx-auto max-w-7xl bg-[#0D0C23] text-white rounded-[32px] sm:rounded-[48px] p-8 sm:p-16 text-center space-y-6 shadow-card hover:shadow-card-md transition duration-300">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight max-w-2xl mx-auto">
            {t("Siap melangkah ke karier impianmu berikutnya?", "Ready to take the next step in your dream career?")}
          </h2>
          <p className="text-sm sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            {t(
              "Bergabunglah dengan ribuan pencari kerja lainnya di JobConnect. Temukan pekerjaan resmi, aman, dan tanpa biaya perantara.",
              "Join thousands of other job seekers on JobConnect. Find official, secure jobs with zero broker fees."
            )}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/lowongan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-black text-base transition shadow-2xs hover:shadow active:scale-95 min-h-[48px]"
            >
              {t("Eksplorasi Lowongan Sekarang", "Explore Vacancies Now")}
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base transition border border-white/20 min-h-[48px]"
            >
              {t("Daftar Akun Gratis", "Register Free Account")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
