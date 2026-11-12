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

interface CompanyEditorialLandingProps {
  companiesCount: number;
  openJobsCount: number;
  provincesCount: number;
}

interface FaqItem {
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    q: "Berapa lama waktu yang dibutuhkan sampai lowongan tayang ke publik?",
    a: "Setelah Anda mempublikasikan lowongan, tim moderator JobConnect akan memeriksa kelengkapan data dan keabsahan informasi dalam waktu maksimal 1x24 jam kerja sebelum posisi dapat dilihat oleh pencari kerja.",
  },
  {
    q: "Apakah ada pungutan biaya kepada pelamar kerja?",
    a: "Sama sekali tidak. JobConnect menerapkan kebijakan tegas: seluruh proses rekrutmen wajib 100% bebas dari segala bentuk pungutan liar, biaya administrasi berkas, maupun calo tiket.",
  },
  {
    q: "Apakah perusahaan bisa memasang lowongan kerja remote (jarak jauh)?",
    a: "Bisa. Pada formulir pemasangan lowongan, Anda dapat memilih sistem kerja Remote sehingga posisi tersebut dapat dilamar oleh kandidat potensial dari 38 provinsi di Indonesia.",
  },
  {
    q: "Bagaimana proses mengundang kandidat ke tahap tes atau wawancara kerja?",
    a: "Melalui dashboard mitra perusahaan, Anda dapat mengubah status lamaran menjadi 'Wawancara', mengisi tanggal dan waktu, menyertakan lokasi fisik atau tautan video call, serta menulis pesan resmi langsung ke akun pelamar.",
  },
];

const TICKER_ITEMS = [
  "Talenta Terverifikasi",
  "100% Bebas Calo",
  "Moderasi Cepat 1x24 Jam",
  "Akses Berkas CV PDF",
  "Wawancara Terjadwal Otomatis",
  "Jangkauan 38 Provinsi",
  "Kriteria Kualifikasi Terstruktur",
];

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function CompanyEditorialLanding({
  companiesCount,
  openJobsCount,
  provincesCount,
}: CompanyEditorialLandingProps) {
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
            <span>Portal Khusus Mitra Perusahaan</span>
          </div>

          {/* Layout Dua Kolom */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 lg:gap-14">
            {/* Kolom Kiri: Judul Utama Terbaca Nyaman */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.08]">
                Rekrut talenta terverifikasi,{" "}
                <span className="text-slate-800 font-bold block sm:inline">
                  langsung dari sumbernya.
                </span>
              </h1>
            </div>

            {/* Kolom Kanan: Narasi Solusi & Tombol Aksi */}
            <div className="w-full lg:w-[420px] space-y-6 shrink-0">
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                Pangkas tumpukan berkas yang tidak cocok. Hubungkan lowongan kerja
                resmi perusahaan Anda langsung dengan ribuan kandidat terverifikasi
                di 38 provinsi tanpa perantara calo.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href="/perusahaan/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-sm shadow-2xs hover:shadow transition-all min-h-[48px] active:scale-95 text-center"
                >
                  <Briefcase className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
                  <span>Daftar Akun Perusahaan</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
                </Link>

                <Link
                  href="/login?peran=perusahaan"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border border-black/[0.12] shadow-2xs transition-all min-h-[48px] text-center"
                >
                  <span>Masuk Portal Mitra</span>
                </Link>
              </div>

              <div className="pt-1 flex items-center gap-2 text-xs font-medium text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>100% Bebas biaya calo dan tanpa pungutan liar</span>
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
              <span>Standar Kualifikasi</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Kriteria tegas.
              <br />
              Berkas kandidat terkurasi.
            </h2>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              Setiap lowongan kerja yang Anda buat memiliki parameter terstruktur:
              jenjang pendidikan minimal, pengalaman tahun kerja, keahlian utama,
              serta rentang gaji transparan. Kandidat yang masuk otomatis tersaring
              sesuai kualifikasi nyata yang Anda butuhkan.
            </p>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Tim HR menghemat waktu skrining awal dan dapat langsung berfokus
              mewawancarai kandidat yang paling relevan.
            </p>

            <div className="pt-2 flex items-center gap-6 text-xs font-semibold text-slate-700 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                Parameter kualifikasi presisi
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                Verifikasi identitas resmi
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
                <span>Filter Otomatis</span>
                <span className="w-2 h-2 rounded-full bg-[#FFDD00]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
                Skrining Parameter Berkas
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Kandidat disaring berdasarkan syarat minimum pendidikan dan pengalaman
                yang Anda tetapkan sejak awal publikasi.
              </p>
            </motion.div>

            {/* Kartu 2 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-black/[0.08] p-6 sm:p-7 space-y-2.5 shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>Kredibilitas Brand</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
                100% Bebas Calo & Pungli
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Reputasi perusahaan terlindungi penuh. Seluruh lowongan diperiksa
                keabsahannya oleh tim admin maksimal 1x24 jam kerja.
              </p>
            </motion.div>

            {/* Kartu 3 */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-black/[0.08] p-6 sm:p-7 space-y-2.5 shadow-2xs hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between text-xs font-bold text-blue-800">
                <span>Standar Dokumen</span>
                <FileCheck2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-950 tracking-tight">
                Format CV PDF Siap Baca
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Unduh dan tinjau resume kandidat dalam format PDF standar, lengkap
                dengan riwayat kontak langsung tanpa perantara.
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
              <span>Alur Kerja Rekrutmen</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Dari berkas masuk,
              <br />
              hingga penawaran kerja.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Kelola seluruh proses seleksi talenta dalam satu alur teratur tanpa
              perlu aplikasi chat terpisah.
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
                  Pasang Lowongan
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Tuliskan judul, deskripsi tugas, persyaratan, tipe pekerjaan, dan
                  pilihan mode kerja onsite maupun remote.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                Langkah awal publikasi
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
                  Moderasi 1x24 Jam
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Tim JobConnect meninjau keabsahan lowongan untuk memastikan kepatuhan
                  bebas biaya calo sebelum tayang ke publik.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                Pemeriksaan keabsahan
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
                  Kelola Status Pelamar
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Pindahkan berkas kandidat ke status Ditinjau, Shortlist, Wawancara,
                  hingga Penerimaan langsung di dashboard.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                Penyaringan kandidat
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
                  Undang Wawancara
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Kirim jadwal, waktu, lokasi, atau tautan video meeting bersama catatan
                  resmi yang langsung diterima akun kandidat.
                </p>
              </div>
              <div className="pt-2 text-xs font-semibold text-slate-500">
                Keputusan rekrutmen
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
            <span>Jangkauan Nasional</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-tight">
            {provincesCount} provinsi terjangkau.
            <br />
            Satu pintu rekrutmen.
          </h2>

          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal max-w-2xl mx-auto">
            Akses talenta profesional dari Sabang sampai Merauke. Pasang lowongan kerja
            onsite di kota operasional kantor Anda, atau buka peluang kerja jarak jauh
            (remote) untuk menarik talenta terbaik tanpa batasan geografis.
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
                Provinsi Terjangkau
              </p>
              <p className="text-[11px] text-slate-500">Cakupan wilayah nusantara</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-black/[0.08] space-y-1.5 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 mb-2">
                <Building2 className="w-4 h-4" aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                {companiesCount > 0 ? companiesCount : "Resmi"}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Mitra Perusahaan
              </p>
              <p className="text-[11px] text-slate-500">Identitas terkonfirmasi</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-black/[0.08] space-y-1.5 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 mb-2">
                <Briefcase className="w-4 h-4" aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                {openJobsCount > 0 ? `${openJobsCount}+` : "Aktif"}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Lowongan Terbuka
              </p>
              <p className="text-[11px] text-slate-500">Sedang aktif tayang</p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-black/[0.08] space-y-1.5 shadow-2xs"
            >
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-700 mb-2">
                <Clock className="w-4 h-4" aria-hidden="true" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                &lt; 24 Jam
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Waktu Moderasi
              </p>
              <p className="text-[11px] text-slate-500">Pemeriksaan cepat admin</p>
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
                {item}
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
              <span>Pertanyaan Umum</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Hal yang Sering Ditanyakan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Informasi penting seputar registrasi dan publikasi lowongan bagi perusahaan
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
                      {faq.q}
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
                      {faq.a}
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
            <span>Kemitraan Perusahaan JobConnect</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Siap menemukan talenta terbaik untuk perkembangan bisnis Anda?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
            Daftarkan perusahaan Anda sekarang dan mulai publikasikan lowongan kerja
            resmi terverifikasi dalam hitungan menit.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/perusahaan/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-base shadow-md transition-all min-h-[48px] active:scale-95"
            >
              <span>Daftar sebagai Perusahaan</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
            </Link>

            <Link
              href="/login?peran=perusahaan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 transition-all min-h-[48px]"
            >
              <span>Masuk Portal Mitra</span>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
