"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  Building2,
  CheckCircle2,
  SlidersHorizontal,
  ShieldCheck,
  FileCheck2,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface CompanyEditorialLandingProps {
  companiesCount: number;
  openJobsCount: number;
  provincesCount: number;
}

interface FaqItem {
  q: string;
  q_en: string;
  a: string;
  a_en: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Berapa lama waktu yang dibutuhkan sampai lowongan tayang ke publik?",
    q_en: "How long does it take for a job post to go public?",
    a: "Setelah Anda mempublikasikan lowongan, tim moderator JobConnect akan memeriksa kelengkapan data dan keabsahan informasi dalam waktu maksimal 1x24 jam kerja sebelum posisi dapat dilihat oleh pencari kerja.",
    a_en: "After you publish a vacancy, the JobConnect moderation team will review data completeness and validity within 24 business hours before the position becomes visible to job seekers.",
  },
  {
    q: "Apakah ada pungutan biaya kepada pelamar kerja?",
    q_en: "Are there any fees charged to job applicants?",
    a: "Sama sekali tidak. JobConnect menerapkan kebijakan tegas: seluruh proses rekrutmen wajib 100% bebas dari segala bentuk pungutan liar, biaya administrasi berkas, maupun calo tiket.",
    a_en: "Not at all. JobConnect strictly enforces a zero-fee policy: the entire recruitment process must be 100% free of illegal levies, administration fees, and middleman markups.",
  },
  {
    q: "Apakah perusahaan bisa memasang lowongan kerja remote (jarak jauh)?",
    q_en: "Can companies post remote job vacancies?",
    a: "Bisa. Pada formulir pemasangan lowongan, Anda dapat memilih sistem kerja Remote sehingga posisi tersebut dapat dilamar oleh kandidat potensial dari 38 provinsi di Indonesia.",
    a_en: "Yes. In the job posting form, you can select Remote work mode so that candidates from all 38 provinces in Indonesia can apply.",
  },
  {
    q: "Bagaimana proses mengundang kandidat ke tahap tes atau wawancara kerja?",
    q_en: "How does the interview invitation process work?",
    a: "Melalui dashboard mitra perusahaan, Anda dapat mengubah status lamaran menjadi 'Wawancara', mengisi tanggal dan waktu, menyertakan lokasi fisik atau tautan video call, serta menulis pesan resmi langsung ke akun pelamar.",
    a_en: "Through the partner dashboard, you can change the application status to 'Interview', set date and time, include a physical address or video call link, and send an official message directly to the applicant's account.",
  },
];

const TICKER_ITEMS = [
  { id: "Talenta Terverifikasi", en: "Verified Talent" },
  { id: "100% Bebas Calo", en: "100% Broker-Free" },
  { id: "Moderasi Cepat 1x24 Jam", en: "Fast 24-Hour Moderation" },
  { id: "Akses Berkas CV PDF", en: "Standard PDF CV Access" },
  { id: "Wawancara Terjadwal Otomatis", en: "Automated Interview Scheduling" },
  { id: "Jangkauan 38 Provinsi", en: "38 Provinces Reach" },
  { id: "Kriteria Kualifikasi Terstruktur", en: "Structured Qualification Criteria" },
];

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function CompanyEditorialLanding({
  companiesCount,
  openJobsCount,
  provincesCount,
}: CompanyEditorialLandingProps) {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const getSectionAnimation = (delay = 0) => {
    if (shouldReduceMotion) return {};
    return {
      initial: { opacity: 0, y: 28 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: false, amount: 0.15 },
      transition: { duration: 0.55, delay, ease: easeOutExpo },
    };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOutExpo },
    },
  };

  return (
    <div className="min-h-screen bg-[#FAF8F0] text-slate-900 overflow-x-clip">
      {/* ========================================================
          SECTION 01: HERO (BERSILANG ELEGAN & BERKARAKTER)
          ======================================================== */}
      <section className="relative px-4 sm:px-6 md:px-12 pt-8 sm:pt-14 md:pt-20 pb-16 md:pb-24 max-w-7xl mx-auto">
        <motion.div
          {...getSectionAnimation(0)}
          className="space-y-8"
        >
          {/* Badge Kategori Manusiawi */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.08] text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#FFDD00] ring-2 ring-black/10" />
            <span>{t("Portal Khusus Mitra Perusahaan", "Partner Employer Portal")}</span>
          </div>

          {/* Layout Dua Kolom */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-14">
            {/* Kolom Kiri: Judul Utama Terbaca Nyaman */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.08]">
                {t("Rekrut talenta terverifikasi,", "Recruit verified talent,")}{" "}
                <span className="text-slate-800 font-bold block sm:inline">
                  {t("langsung dari sumbernya.", "directly from the source.")}
                </span>
              </h1>
            </div>

            {/* Kolom Kanan: Narasi Solusi & Tombol Aksi */}
            <div className="w-full lg:w-[420px] space-y-6 shrink-0">
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                {t(
                  "Pangkas tumpukan berkas yang tidak cocok. Hubungkan lowongan kerja resmi perusahaan Anda langsung dengan ribuan kandidat terverifikasi di 38 provinsi tanpa perantara calo.",
                  "Cut through mismatched resumes. Connect your company's official job listings directly with thousands of verified candidates across 38 provinces without broker fees."
                )}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/perusahaan/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-sm shadow-2xs hover:shadow transition-all min-h-[48px] active:scale-95 text-center"
                >
                  <Briefcase className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
                  <span>{t("Daftar Akun Perusahaan", "Register Company Account")}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
                </Link>

                <Link
                  href="/login?peran=perusahaan"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border border-black/[0.12] shadow-2xs transition-all min-h-[48px] text-center"
                >
                  <span>{t("Masuk Portal Mitra", "Sign In to Employer Portal")}</span>
                </Link>
              </div>

              <div className="pt-1 flex items-center gap-2 text-xs font-medium text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>{t("100% Bebas biaya calo dan tanpa pungutan liar", "100% Free of broker fees and zero hidden charges")}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 02: KUALIFIKASI TERSTRUKTUR (12-COL ASYMMETRIC)
          ======================================================== */}
      <section className="py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-black/[0.08]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Kolom Kiri: Narasi Nilai & Kredibilitas */}
          <motion.div
            {...getSectionAnimation(0.05)}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.08] text-xs font-semibold text-slate-700 shadow-2xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
              <span>{t("Standar Kualifikasi", "Qualification Standard")}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              {t("Kriteria tegas.", "Strict criteria.")}
              <br />
              {t("Berkas kandidat terkurasi.", "Curated candidate files.")}
            </h2>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              {t(
                "Setiap lowongan kerja yang Anda buat memiliki parameter terstruktur: jenjang pendidikan minimal, pengalaman tahun kerja, keahlian utama, serta rentang gaji transparan. Kandidat yang masuk otomatis tersaring sesuai kualifikasi nyata yang Anda butuhkan.",
                "Every vacancy you create has structured parameters: minimum education level, years of work experience, core skills, and transparent salary range. Incoming candidates are automatically filtered to match your actual requirements."
              )}
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {t(
                "Tim HR menghemat waktu skrining awal dan dapat langsung berfokus mewawancarai kandidat yang paling relevan.",
                "HR teams save initial screening time and can focus directly on interviewing the most relevant candidates."
              )}
            </p>

            <div className="pt-2 flex items-center gap-6 text-xs font-semibold text-slate-700 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                {t("Parameter kualifikasi presisi", "Precise qualification parameters")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                {t("Verifikasi identitas resmi", "Official identity verification")}
              </span>
            </div>
          </motion.div>

          {/* Kolom Kanan: 3 Kartu Bernilai Tambah */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.15 }}
            className="lg:col-span-5 space-y-4"
          >
            {/* Kartu 1 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-black/[0.08] p-6 sm:p-7 space-y-2.5 shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>{t("Filter Otomatis", "Automated Filtering")}</span>
                <span className="w-2 h-2 rounded-full bg-[#FFDD00]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
                {t("Skrining Parameter Berkas", "Resume Parameter Screening")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {t(
                  "Kandidat disaring berdasarkan syarat minimum pendidikan dan pengalaman yang Anda tetapkan sejak awal publikasi.",
                  "Candidates are screened based on the minimum education and experience requirements you set from the start."
                )}
              </p>
            </motion.div>

            {/* Kartu 2 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-black/[0.08] p-6 sm:p-7 space-y-2.5 shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>{t("Kredibilitas Brand", "Brand Credibility")}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
                {t("100% Bebas Calo & Pungli", "100% Scam & Broker Free")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {t(
                  "Reputasi perusahaan terlindungi penuh. Seluruh lowongan diperiksa keabsahannya oleh tim admin maksimal 1x24 jam kerja.",
                  "Your company reputation is fully protected. All vacancies are vetted by the admin team within 24 business hours."
                )}
              </p>
            </motion.div>

            {/* Kartu 3 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-black/[0.08] p-6 sm:p-7 space-y-2.5 shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                <span>{t("Standar Dokumen", "Document Standard")}</span>
                <FileCheck2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
                {t("Format CV PDF Siap Baca", "Standard PDF CV Format")}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {t(
                  "Unduh dan tinjau resume kandidat dalam format PDF standar, lengkap dengan riwayat kontak langsung tanpa perantara.",
                  "Download and review candidate resumes in standard PDF format, complete with direct contact details."
                )}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          SECTION 03: ALUR KERJA TERPADU (4 TAHAPAN JELAS)
          ======================================================== */}
      <section className="py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto border-t border-black/[0.08]">
        <motion.div
          {...getSectionAnimation(0)}
          className="space-y-12"
        >
          {/* Header Section */}
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.08] text-xs font-semibold text-slate-700 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>{t("Alur Kerja Rekrutmen", "Recruitment Workflow")}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              {t("Dari berkas masuk,", "From incoming applications,")}
              <br />
              {t("hingga penawaran kerja.", "to job offer.")}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {t(
                "Kelola seluruh proses seleksi talenta dalam satu alur teratur tanpa perlu aplikasi chat terpisah.",
                "Manage the entire talent selection process in one structured flow without needing separate chat apps."
              )}
            </p>
          </div>

          {/* Grid 4 Langkah Manusiawi */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Langkah 1 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-black/[0.08] p-6 sm:p-7 space-y-4 shadow-2xs flex flex-col justify-between hover:border-black/20 transition-all duration-200"
            >
              <div className="space-y-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFDD00] text-black font-extrabold text-xs">
                  01
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
                  {t("Pasang Lowongan", "Post Vacancy")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {t(
                    "Tuliskan judul, deskripsi tugas, persyaratan, tipe pekerjaan, dan pilihan mode kerja onsite maupun remote.",
                    "Write title, task description, requirements, job type, and choice of onsite or remote work mode."
                  )}
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                {t("Langkah awal publikasi", "Initial publishing step")}
              </div>
            </motion.div>

            {/* Langkah 2 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-black/[0.08] p-6 sm:p-7 space-y-4 shadow-2xs flex flex-col justify-between hover:border-black/20 transition-all duration-200"
            >
              <div className="space-y-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFDD00] text-black font-extrabold text-xs">
                  02
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
                  {t("Moderasi 1x24 Jam", "24-Hour Moderation")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {t(
                    "Tim JobConnect meninjau keabsahan lowongan untuk memastikan kepatuhan bebas biaya calo sebelum tayang ke publik.",
                    "JobConnect team reviews vacancy validity to ensure broker-free compliance before public release."
                  )}
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                {t("Pemeriksaan keabsahan", "Validity check")}
              </div>
            </motion.div>

            {/* Langkah 3 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-black/[0.08] p-6 sm:p-7 space-y-4 shadow-2xs flex flex-col justify-between hover:border-black/20 transition-all duration-200"
            >
              <div className="space-y-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFDD00] text-black font-extrabold text-xs">
                  03
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
                  {t("Kelola Status Pelamar", "Manage Applicant Status")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {t(
                    "Pindahkan berkas kandidat ke status Ditinjau, Shortlist, Wawancara, hingga Penerimaan langsung di dashboard.",
                    "Move candidate files to Reviewed, Shortlist, Interview, and Accepted status directly in the dashboard."
                  )}
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                {t("Penyaringan kandidat", "Candidate screening")}
              </div>
            </motion.div>

            {/* Langkah 4 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-black/[0.08] p-6 sm:p-7 space-y-4 shadow-2xs flex flex-col justify-between hover:border-black/20 transition-all duration-200"
            >
              <div className="space-y-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFDD00] text-black font-extrabold text-xs">
                  04
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">
                  {t("Undang Wawancara", "Schedule Interview")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {t(
                    "Kirim jadwal, waktu, lokasi, atau tautan video meeting bersama catatan resmi yang langsung diterima akun kandidat.",
                    "Send schedule, time, location, or video meeting link with official notes delivered straight to candidate accounts."
                  )}
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                {t("Keputusan rekrutmen", "Hiring decision")}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 04: JANGKAUAN NASIONAL & METRIK NYATA
          ======================================================== */}
      <section className="py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto text-center border-t border-black/[0.08]">
        <motion.div
          {...getSectionAnimation(0)}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.08] text-xs font-semibold text-slate-700 shadow-2xs mx-auto">
            <MapPin className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            <span>{t("Jangkauan Nasional", "National Reach")}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight">
            {provincesCount} {t("provinsi terjangkau.", "provinces covered.")}
            <br />
            {t("Satu pintu rekrutmen.", "One recruitment gateway.")}
          </h2>

          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal max-w-2xl mx-auto">
            {t(
              "Akses talenta profesional dari Sabang sampai Merauke. Pasang lowongan kerja onsite di kota operasional kantor Anda, atau buka peluang kerja jarak jauh (remote) untuk menarik talenta terbaik tanpa batasan geografis.",
              "Access professional talent across Indonesia. Post onsite vacancies in your office location, or open remote opportunities to attract top talent without geographic constraints."
            )}
          </p>

          {/* 4 Kartu Metrik Database */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 text-left"
          >
            <motion.div
              variants={itemVariants}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-black/[0.08] space-y-1.5 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 mb-2">
                <MapPin className="w-4 h-4" aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                {provincesCount}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {t("Provinsi Terjangkau", "Provinces Covered")}
              </p>
              <p className="text-[11px] text-slate-500">{t("Cakupan wilayah nusantara", "Nationwide coverage")}</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-black/[0.08] space-y-1.5 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 mb-2">
                <Building2 className="w-4 h-4" aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                {companiesCount > 0 ? companiesCount : t("Resmi", "Official")}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {t("Mitra Perusahaan", "Partner Companies")}
              </p>
              <p className="text-[11px] text-slate-500">{t("Identitas terkonfirmasi", "Confirmed identities")}</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-black/[0.08] space-y-1.5 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 mb-2">
                <Briefcase className="w-4 h-4" aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                {openJobsCount > 0 ? `${openJobsCount}+` : t("Aktif", "Active")}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {t("Lowongan Terbuka", "Open Vacancies")}
              </p>
              <p className="text-[11px] text-slate-500">{t("Sedang aktif tayang", "Currently active")}</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-black/[0.08] space-y-1.5 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 mb-2">
                <Clock className="w-4 h-4" aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                &lt; 24 {t("Jam", "Hours")}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {t("Waktu Moderasi", "Moderation Time")}
              </p>
              <p className="text-[11px] text-slate-500">{t("Pemeriksaan cepat admin", "Fast admin review")}</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ========================================================
          MARQUEE TICKER (PURE CSS, HALUS & RINGAN)
          ======================================================== */}
      <section className="py-5 bg-white border-y border-black/[0.08] overflow-hidden select-none">
        <div className="flex gap-8 whitespace-nowrap animate-marquee">
          {TICKER_ITEMS.concat(TICKER_ITEMS).map((item, idx) => (
            <div key={idx} className="inline-flex items-center gap-3">
              <span className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
                {t(item.id, item.en)}
              </span>
              <span className="w-2 h-2 rounded-full bg-[#FFDD00] border border-black/10 shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          FAQ ACCORDION (INTERAKTIF & AKSESIBEL)
          ======================================================== */}
      <section className="py-16 sm:py-24 md:py-28 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto">
        <motion.div
          {...getSectionAnimation(0)}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/[0.08] text-xs font-semibold text-slate-700 shadow-2xs mx-auto">
              <span>{t("Pertanyaan Umum", "Frequently Asked Questions")}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              {t("Hal yang Sering Ditanyakan", "Common Inquiries")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {t(
                "Informasi penting seputar registrasi dan publikasi lowongan bagi perusahaan",
                "Important information regarding registration and vacancy publishing for employers"
              )}
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-black/[0.08] bg-white overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left cursor-pointer hover:bg-black/[0.02] transition min-h-[48px]"
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-950 tracking-tight">
                      {t(faq.q, faq.q_en)}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-black" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-black/[0.04]">
                      {t(faq.a, faq.a_en)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          BOTTOM CTA CARD (NAVY GELAP DENGAN AKSESIBILITAS TINGGI)
          ======================================================== */}
      <section className="px-4 sm:px-6 md:px-12 pb-16 sm:pb-24 max-w-7xl mx-auto">
        <motion.div
          {...getSectionAnimation(0.05)}
          className="bg-[#0D0C23] rounded-[32px] sm:rounded-[44px] p-8 sm:p-14 md:p-16 text-center text-white space-y-6 shadow-xl relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-semibold text-[#FFDD00] border border-white/10">
            <Building2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t("Kemitraan Perusahaan JobConnect", "JobConnect Company Partnership")}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
            {t("Siap menemukan talenta terbaik untuk perkembangan bisnis Anda?", "Ready to find top talent for your business growth?")}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
            {t(
              "Daftarkan perusahaan Anda sekarang dan mulai publikasikan lowongan kerja resmi terverifikasi dalam hitungan menit.",
              "Register your company now and start posting official verified job openings in minutes."
            )}
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/perusahaan/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-base shadow-md transition-all min-h-[48px] active:scale-95"
            >
              <span>{t("Daftar sebagai Perusahaan", "Register as Company")}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
            </Link>

            <Link
              href="/login?peran=perusahaan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 transition-all min-h-[48px]"
            >
              <span>{t("Masuk Portal Mitra", "Sign In to Employer Portal")}</span>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
