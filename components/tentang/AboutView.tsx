"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  X,
  ChevronDown,
  HelpCircle,
  UserCheck,
  Building2,
  ShieldCheck,
  Layers,
  ArrowRight,
  FileText,
  BadgeCheck,
  Check,
  Mail,
  MessageCircle,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export type FaqCategoryKey = "pelamar" | "perusahaan" | "keamanan" | "fitur";

export interface FaqItem {
  id: string;
  category: FaqCategoryKey;
  questionId: string;
  questionEn: string;
  answerId: string;
  answerEn: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  // --- Kategori: Pencari Kerja (pelamar) ---
  {
    id: "biaya-pelamar",
    category: "pelamar",
    questionId: "Apakah ada biaya yang dipungut dari pencari kerja?",
    questionEn: "Are there any fees charged to job seekers?",
    answerId:
      "Tidak ada. JobConnect 100% gratis untuk seluruh pencari kerja. Kami tidak memungut biaya pendaftaran, biaya akun, maupun biaya penempatan kerja. Jika ada pihak yang mengatasnamakan perusahaan mitra dan meminta transfer uang, tiket perjalanan, atau biaya seragam, segera laporkan ke tim JobConnect.",
    answerEn:
      "None. JobConnect is 100% free for all job seekers. We do not charge registration fees, account creation fees, or placement commissions. If anyone claiming to represent a partner company requests payment, report them immediately.",
  },
  {
    id: "format-cv",
    category: "pelamar",
    questionId: "Format berkas apa yang didukung untuk mengunggah CV?",
    questionEn: "What file formats are supported for uploading CVs?",
    answerId:
      "Berkas CV wajib berformat PDF dengan batas ukuran maksimal 2 MB. Format PDF menjaga kerapian tata letak resume Anda agar terbaca jelas oleh tim HR maupun sistem skrining dokumen.",
    answerEn:
      "CV files must be in PDF format with a maximum file size of 2 MB. The PDF format ensures your resume layout remains neat, clear, and easily readable by HR teams.",
  },
  {
    id: "pantau-lamaran",
    category: "pelamar",
    questionId: "Bagaimana cara memantau linimasa status lamaran saya?",
    questionEn: "How can I track the progress of submitted applications?",
    answerId:
      "Buka menu Lamaran Saya untuk melihat progres setiap berkas secara langsung. Status lamaran diperbarui secara berkala: Terkirim, Sedang Ditinjau, Jadwal Wawancara, Diterima, atau Ditolak, lengkap dengan catatan resmi dari HR.",
    answerEn:
      "Open the My Applications menu to track your application progress in real time. Statuses update transparently: Submitted, Under Review, Interview Scheduled, Accepted, or Rejected, with official notes from HR.",
  },
  {
    id: "jangkauan-lokasi",
    category: "pelamar",
    questionId: "Apakah lowongan mencakup seluruh wilayah di Indonesia?",
    questionEn: "Does JobConnect cover all regions in Indonesia?",
    answerId:
      "Ya. JobConnect melayani penempatan kerja di 38 provinsi di Indonesia, mencakup kota besar hingga daerah kabupaten, serta menyediakan kategori khusus lowongan Jarak Jauh (Remote) yang dapat dikerjakan dari mana saja.",
    answerEn:
      "Yes. JobConnect covers job placements across all 38 provinces in Indonesia, as well as a dedicated Remote Work category that allows you to work from anywhere nationwide.",
  },
  {
    id: "ubah-berkas",
    category: "pelamar",
    questionId: "Bisakah saya memperbarui profil atau CV setelah melamar?",
    questionEn: "Can I update my profile or CV after applying?",
    answerId:
      "Anda dapat memperbarui data profil dan tautan portofolio kapan saja melalui halaman Profil Saya. Berkas CV yang sudah terkirim pada suatu lowongan akan tetap tersimpan sebagai arsip lamaran tersebut untuk menjaga keaslian riwayat pengajuan.",
    answerEn:
      "You can update your profile information and portfolio links anytime via My Profile. Submitted CV files for specific vacancies remain archived as submitted to maintain accurate application records.",
  },

  // --- Kategori: Mitra Perusahaan (perusahaan) ---
  {
    id: "daftar-mitra",
    category: "perusahaan",
    questionId: "Bagaimana cara perusahaan mendaftar sebagai mitra resmi?",
    questionEn: "How do companies register as official partners?",
    answerId:
      "Klik menu Mitra Perusahaan lalu pilih Daftarkan Perusahaan. Anda dapat mendaftar dengan akun Google kantor atau email bisnis, melengkapi profil instansi, alamat operasional, dan logo resmi.",
    answerEn:
      "Click on Partner Company then select Register Company. You can register using your work Google account or business email, then complete your entity profile, office address, and logo.",
  },
  {
    id: "durasi-moderasi",
    category: "perusahaan",
    questionId: "Berapa lama waktu yang dibutuhkan untuk verifikasi lowongan?",
    questionEn: "How long does vacancy verification take?",
    answerId:
      "Tim moderasi JobConnect memverifikasi setiap lowongan baru dalam waktu maksimal 1x24 jam pada hari kerja. Kami memastikan kejelasan posisi, alamat kantor, dan rentang kompensasi sebelum lowongan tampil di katalog publik.",
    answerEn:
      "JobConnect moderators review and verify each new vacancy within a maximum of 1x24 business hours. We verify role details, office addresses, and compensation ranges before publication.",
  },
  {
    id: "fitur-wawancara",
    category: "perusahaan",
    questionId: "Bagaimana cara mengundang pelamar ke tahap wawancara?",
    questionEn: "How do companies invite applicants to interviews?",
    answerId:
      "Dari Dashboard Mitra, HR dapat membuka detail pelamar dan menekan tombol Jadwalkan Wawancara. Masukkan tanggal, waktu, format wawancara (tatap muka atau tautan video call), serta catatan instruksi bagi kandidat.",
    answerEn:
      "From the Partner Dashboard, recruiters can open candidate details and click Schedule Interview. Enter date, time, interview format (in-person or video link), and candidate instructions.",
  },
  {
    id: "unduh-cv-kandidat",
    category: "perusahaan",
    questionId: "Apakah mitra perusahaan dapat mengunduh berkas CV pelamar?",
    questionEn: "Can employers download applicant CV files directly?",
    answerId:
      "Ya. Mitra dapat melihat ringkasan profil kandidat dan mengunduh berkas CV berformat PDF secara langsung dari dashboard rekrutmen untuk keperluan evaluasi internal tim HR.",
    answerEn:
      "Yes. Partners can view candidate summaries and download original PDF CV files directly from the recruitment dashboard for internal evaluation.",
  },

  // --- Kategori: Keamanan & Bebas Calo (keamanan) ---
  {
    id: "verifikasi-keamanan",
    category: "keamanan",
    questionId: "Bagaimana JobConnect mencegah penipuan dan lowongan kerja fiktif?",
    questionEn: "How does JobConnect prevent fraud and fake job postings?",
    answerId:
      "Seluruh perusahaan mitra wajib melalui verifikasi identitas instansi dan lokasi kantor yang valid. Admin memeriksa kepastian rentang gaji serta kelayakan tanggung jawab sebelum menyetujui setiap lowongan yang diajukan.",
    answerEn:
      "All partner companies undergo identity and office location verification. Administrators verify salary transparency and job responsibilities before approving any posting.",
  },
  {
    id: "lapor-indikasi-penipuan",
    category: "keamanan",
    questionId: "Apa yang harus dilakukan jika menemukan kejanggalan pada lowongan?",
    questionEn: "What should I do if I find a suspicious job posting?",
    answerId:
      "Anda dapat langsung menekan tombol Lapor yang tersedia di setiap halaman lowongan pekerjaan, atau mengirim laporan langsung ke tim admin dengan menyertakan bukti tangkapan layar. Tim kami akan membekukan akun yang terindikasi mencurigakan.",
    answerEn:
      "You can immediately click the Report button available on every vacancy page or submit a report to administrators with screenshot evidence. Suspicious accounts are frozen promptly.",
  },
  {
    id: "privasi-data",
    category: "keamanan",
    questionId: "Bagaimana JobConnect melindungi kerahasiaan data pribadi pencari kerja?",
    questionEn: "How does JobConnect protect applicant personal data privacy?",
    answerId:
      "Kontak telepon, email, dan berkas CV Anda hanya dapat diakses oleh perusahaan mitra tempat Anda mengajukan lamaran resmi. JobConnect tidak pernah menjual atau membagikan data pengguna kepada pihak ketiga tanpa izin Anda.",
    answerEn:
      "Your phone contact, email, and CV files are only shared with partner companies where you officially submit applications. JobConnect never sells or shares your personal data with third parties.",
  },

  // --- Kategori: Fitur & Seleksi Kerja (fitur) ---
  {
    id: "transparansi-gaji",
    category: "fitur",
    questionId: "Mengapa setiap lowongan wajib mencantumkan rentang gaji?",
    questionEn: "Why are all vacancies required to state a salary range?",
    answerId:
      "Transparansi upah adalah standar utama JobConnect. Kami meniadakan praktik gaji rahasia agar pencari kerja dapat mengukur kecocokan finansial sejak awal, sekaligus mendorong standar kompensasi kerja yang sehat dan adil di Indonesia.",
    answerEn:
      "Compensation transparency is JobConnect's standard. We eliminate secret salaries so job seekers can evaluate financial fit upfront and promote fair compensation standards in Indonesia.",
  },
  {
    id: "filter-pencarian",
    category: "fitur",
    questionId: "Fitur pencarian apa saja yang tersedia untuk menyaring lowongan?",
    questionEn: "What search filters are available for browsing jobs?",
    answerId:
      "Anda dapat memfilter lowongan berdasarkan kata kunci profesi, kategori bidang kerja, lokasi 38 provinsi, mode kerja (Onsite, Hybrid, Remote), tipe kontrak (Penuh Waktu, Paruh Waktu, Magang), dan tingkat pendidikan minimal.",
    answerEn:
      "You can filter vacancies by keyword, industry category, location across 38 provinces, work mode (Onsite, Hybrid, Remote), contract type, and minimum education level.",
  },
  {
    id: "bantuan-skrining",
    category: "fitur",
    questionId: "Bagaimana cara kerja sistem skrining kriteria pada lamaran?",
    questionEn: "How does the qualification screening system work?",
    answerId:
      "Sistem membandingkan kecocokan syarat formal seperti jenjang pendidikan, keahlian utama, dan lokasi kerja untuk mempermudah HR meninjau berkas. Seluruh keputusan pemanggilan wawancara dan penerimaan tetap ditentukan sepenuhnya oleh pihak rekruter manusia.",
    answerEn:
      "The system compares structured criteria like education level, core skills, and location to assist HR review. All interview and hiring decisions remain 100% human-driven by recruiters.",
  },
];

interface CategoryMeta {
  key: FaqCategoryKey;
  titleId: string;
  titleEn: string;
  descId: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CATEGORIES: CategoryMeta[] = [
  {
    key: "pelamar",
    titleId: "Untuk Pencari Kerja",
    titleEn: "For Job Seekers",
    descId: "Alur melamar, berkas CV, linimasa status",
    descEn: "Application flow, CV dossier, status tracking",
    icon: UserCheck,
  },
  {
    key: "perusahaan",
    titleId: "Mitra Perusahaan",
    titleEn: "Partner Companies",
    descId: "Registrasi HR, moderasi, jadwal wawancara",
    descEn: "HR registration, moderation, interview schedules",
    icon: Building2,
  },
  {
    key: "keamanan",
    titleId: "Keamanan & Bebas Calo",
    titleEn: "Security & Trust",
    descId: "Verifikasi resmi, privasi data, cegah pungli",
    descEn: "Official verification, data privacy, zero fees",
    icon: ShieldCheck,
  },
  {
    key: "fitur",
    titleId: "Fitur & Seleksi Kerja",
    titleEn: "Features & Screening",
    descId: "Transparansi gaji, filter 38 provinsi, kriteria",
    descEn: "Salary transparency, 38 provinces filter, criteria",
    icon: Layers,
  },
];

export function AboutView() {
  const { t, language } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FaqCategoryKey | "semua">("semua");
  const [openFaqId, setOpenFaqId] = useState<string | null>("biaya-pelamar");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      semua: FAQ_ITEMS.length,
      pelamar: 0,
      perusahaan: 0,
      keamanan: 0,
      fitur: 0,
    };
    FAQ_ITEMS.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return FAQ_ITEMS.filter((item) => {
      const matchCategory =
        selectedCategory === "semua" || item.category === selectedCategory;

      if (!matchCategory) return false;

      if (!query) return true;

      const qText = `${item.questionId} ${item.questionEn}`.toLowerCase();
      const aText = `${item.answerId} ${item.answerEn}`.toLowerCase();
      return qText.includes(query) || aText.includes(query);
    });
  }, [searchQuery, selectedCategory]);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const handleCategorySelect = (key: FaqCategoryKey) => {
    setSelectedCategory((prev) => (prev === key ? "semua" : key));
  };

  const handleResetSearch = () => {
    setSearchQuery("");
    setSelectedCategory("semua");
  };

  return (
    <div className="relative min-h-screen bg-[#FAF8F0] text-[#1F2022] overflow-x-hidden selection:bg-[#FFDD00] selection:text-[#0D0C23]">
      {/* Ambient background glow & soft vertical bar accents yang menyatu dengan landing page */}
      <div
        className="absolute top-0 left-0 right-0 h-96 overflow-hidden pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        {/* Soft top gradient glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[760px] sm:w-[960px] h-[440px] bg-gradient-to-b from-amber-200/25 via-amber-100/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Stepped vertical accents sisi kiri (gaya ZENTRADE yang diadaptasi hangat) */}
        <div className="absolute top-0 left-4 sm:left-12 flex gap-3 sm:gap-5 opacity-30">
          <div className="w-6 sm:w-12 h-64 bg-gradient-to-b from-amber-300/30 to-transparent rounded-b-full blur-xs" />
          <div className="w-6 sm:w-12 h-52 bg-gradient-to-b from-amber-300/25 to-transparent rounded-b-full blur-xs" />
          <div className="w-6 sm:w-12 h-40 bg-gradient-to-b from-sky-300/20 to-transparent rounded-b-full blur-xs" />
          <div className="w-6 sm:w-12 h-28 bg-gradient-to-b from-sky-300/15 to-transparent rounded-b-full blur-xs" />
          <div className="w-6 sm:w-12 h-16 bg-gradient-to-b from-slate-300/15 to-transparent rounded-b-full blur-xs" />
        </div>

        {/* Stepped vertical accents sisi kanan */}
        <div className="absolute top-0 right-4 sm:right-12 flex flex-row-reverse gap-3 sm:gap-5 opacity-30">
          <div className="w-6 sm:w-12 h-64 bg-gradient-to-b from-amber-300/30 to-transparent rounded-b-full blur-xs" />
          <div className="w-6 sm:w-12 h-52 bg-gradient-to-b from-amber-300/25 to-transparent rounded-b-full blur-xs" />
          <div className="w-6 sm:w-12 h-40 bg-gradient-to-b from-sky-300/20 to-transparent rounded-b-full blur-xs" />
          <div className="w-6 sm:w-12 h-28 bg-gradient-to-b from-sky-300/15 to-transparent rounded-b-full blur-xs" />
          <div className="w-6 sm:w-12 h-16 bg-gradient-to-b from-slate-300/15 to-transparent rounded-b-full blur-xs" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20 space-y-12 sm:space-y-16">
        {/* Hero Section (Centred) */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          {/* Tag Pill Khas JobConnect */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFDD00] text-[#0D0C23] border border-black/10 text-xs font-bold shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#0D0C23]" aria-hidden="true" />
            <span>{t("Pusat Bantuan & FAQ Resmi", "Official Help Center & FAQ")}</span>
          </div>

          {/* Headline Besar & Ramah */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0D0C23] tracking-tight leading-[1.1]">
            {t("Pertanyaan yang Sering Diajukan", "Frequently Asked Questions")}
          </h1>

          {/* Lede Subtitle */}
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal max-w-2xl mx-auto">
            {t(
              "Temukan jawaban resmi seputar alur melamar kerja, format berkas CV, moderasi lowongan, verifikasi mitra perusahaan, dan sistem rekrutmen aman tanpa calo di JobConnect.",
              "Find official answers regarding job applications, CV files, vacancy moderation, partner verification, and broker-free recruitment on JobConnect."
            )}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#faq-list"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0D0C23] hover:bg-black text-white text-xs sm:text-sm font-bold transition-all shadow-2xs hover:shadow active:scale-95 min-h-[44px]"
            >
              <span>{t("Jelajahi Jawaban", "Browse Answers")}</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </a>
            <a
              href="#bantuan-kontak"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-[#0D0C23] text-xs sm:text-sm font-bold border border-black/10 transition-all shadow-2xs hover:shadow active:scale-95 min-h-[44px]"
            >
              <Mail className="w-4 h-4 text-[#0D0C23]" />
              <span>{t("Hubungi Tim Bantuan", "Contact Support")}</span>
            </a>
          </div>
        </div>

        {/* Search Bar (Kapsul Putih Bersih dengan Border Halus & Fokus Jelas) */}
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-center h-14 sm:h-16 rounded-full bg-white border border-[#222222]/15 shadow-card transition-all duration-200 focus-within:border-[#0D0C23] focus-within:ring-2 focus-within:ring-[#0D0C23]/10 px-4 sm:px-6">
            <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                "Cari pertanyaan, kendala, atau kata kunci...",
                "Search queries, keywords, or topics..."
              )}
              aria-label={t("Cari pertanyaan FAQ", "Search FAQ questions")}
              className="w-full bg-transparent text-sm sm:text-base text-[#0D0C23] placeholder:text-slate-400 border-0 border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 font-normal"
              style={{ outline: "none", border: "none", boxShadow: "none" }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={t("Hapus pencarian", "Clear search")}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-black transition shrink-0 ml-2 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick search status / badge */}
          {searchQuery && (
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 px-4">
              <span>
                {t(
                  `Menampilkan ${filteredFaqs.length} pertanyaan untuk "${searchQuery}"`,
                  `Showing ${filteredFaqs.length} results for "${searchQuery}"`
                )}
              </span>
              <button
                type="button"
                onClick={handleResetSearch}
                className="text-navy-700 hover:text-black font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t("Reset pencarian", "Reset search")}</span>
              </button>
            </div>
          )}
        </div>

        {/* 4 Category Cards (2x2 Grid) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t("Pilih Kategori Panduan", "Select Guide Category")}
            </span>
            {selectedCategory !== "semua" && (
              <button
                type="button"
                onClick={() => setSelectedCategory("semua")}
                className="text-xs text-navy-800 hover:text-black hover:underline font-bold cursor-pointer"
              >
                {t("Tampilkan Semua Kategori", "Show All Categories")}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.key;
              const count = categoryCounts[cat.key] || 0;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleCategorySelect(cat.key)}
                  aria-pressed={isSelected}
                  className={`group relative text-left p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] border transition-all duration-200 flex items-center gap-4 sm:gap-5 min-h-[104px] sm:min-h-[116px] h-full cursor-pointer shadow-2xs hover:shadow-card ${
                    isSelected
                      ? "bg-[#0D0C23] text-white border-[#0D0C23] shadow-card ring-2 ring-[#0D0C23]/20"
                      : "bg-white hover:bg-slate-50/70 border-black/[0.08] hover:border-black/20 text-[#0D0C23]"
                  }`}
                >
                  {/* Round Icon Disc */}
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 ${
                      isSelected
                        ? "bg-white/10 border-white/20 text-[#FFDD00]"
                        : "bg-[#FAF8F0] border-black/[0.08] text-[#0D0C23] group-hover:border-black/20"
                    }`}
                  >
                    <IconComp className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  {/* Card Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-base sm:text-lg font-bold truncate ${
                          isSelected ? "text-white" : "text-[#0D0C23]"
                        }`}
                      >
                        {t(cat.titleId, cat.titleEn)}
                      </h3>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 border ${
                          isSelected
                            ? "bg-[#FFDD00] text-[#0D0C23] border-[#FFDD00] font-bold"
                            : "bg-[#FAF8F0] text-slate-700 border-black/[0.06]"
                        }`}
                      >
                        {count} {t("Topik", "Topics")}
                      </span>
                    </div>
                    <p
                      className={`text-xs sm:text-sm mt-1 line-clamp-1 ${
                        isSelected ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {t(cat.descId, cat.descEn)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Langkah Cepat Melamar (Visual Stepper Card Bergaya Landing Page) */}
        <section className="bg-white rounded-[28px] sm:rounded-[36px] p-6 sm:p-8 border border-black/[0.08] shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {t("Alur Cepat Melamar", "Quick Application Flow")}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#0D0C23] mt-1">
                {t("3 Langkah Menuju Karier Resmi di JobConnect", "3 Steps to Your Official Career on JobConnect")}
              </h2>
            </div>
            <Link
              href="/lowongan"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-900 hover:text-navy-700 underline underline-offset-4 self-start sm:self-auto min-h-[36px]"
            >
              <span>{t("Cari Lowongan Sekarang", "Search Jobs Now")}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Langkah 1 */}
            <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-3 flex flex-col justify-between hover:shadow-2xs transition">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-black/[0.08] flex items-center justify-center font-black text-xs text-[#0D0C23] shadow-2xs">
                  01
                </div>
                <h4 className="text-sm font-bold text-[#0D0C23]">
                  {t("Unggah CV Format PDF", "Upload PDF CV")}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {t(
                    "Siapkan resume dalam format PDF (maksimal 2 MB). Lengkapi data kontak telepon dan profil dasar.",
                    "Prepare your resume in PDF format (maximum 2 MB). Complete phone contacts and profile."
                  )}
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.06] flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t("PDF Maksimal 2 MB", "PDF Maximum 2 MB")}</span>
              </div>
            </div>

            {/* Langkah 2 */}
            <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-3 flex flex-col justify-between hover:shadow-2xs transition">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-black/[0.08] flex items-center justify-center font-black text-xs text-[#0D0C23] shadow-2xs">
                  02
                </div>
                <h4 className="text-sm font-bold text-[#0D0C23]">
                  {t("Pilih Lowongan Transparan", "Choose Transparent Jobs")}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {t(
                    "Pilih pekerjaan sesuai keahlian, rentang gaji, dan domisili (Onsite, Hybrid, atau Remote).",
                    "Select jobs matching your skills, salary range, and residence (Onsite, Hybrid, or Remote)."
                  )}
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.06] flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t("Gaji & Syarat Pasti", "Clear Salary & Terms")}</span>
              </div>
            </div>

            {/* Langkah 3 */}
            <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-3 flex flex-col justify-between hover:shadow-2xs transition">
              <div className="space-y-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-black/[0.08] flex items-center justify-center font-black text-xs text-[#0D0C23] shadow-2xs">
                  03
                </div>
                <h4 className="text-sm font-bold text-[#0D0C23]">
                  {t("Pantau Linimasa Status", "Track Status Timeline")}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {t(
                    "Pantau progres berkas langsung di menu Lamaran Saya. Dapatkan kabar saat jadwal wawancara terbit.",
                    "Track dossier progress in My Applications. Receive updates when interviews are scheduled."
                  )}
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.06] flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t("Pembaruan Realtime", "Realtime Updates")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Accordion FAQ Area (One-at-a-time Accordion) */}
        <section id="faq-list" className="space-y-6">
          <div className="space-y-4 border-b border-black/[0.08] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t("Daftar Tanya Jawab", "Q&A Directory")}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0D0C23] tracking-tight">
                  {selectedCategory === "semua"
                    ? t("Seluruh Pertanyaan", "All Questions")
                    : CATEGORIES.find((c) => c.key === selectedCategory)
                    ? t(
                        CATEGORIES.find((c) => c.key === selectedCategory)!.titleId,
                        CATEGORIES.find((c) => c.key === selectedCategory)!.titleEn
                      )
                    : t("Pertanyaan Terkait", "Related Questions")}
                </h2>
              </div>
              <span className="text-xs text-slate-600 font-medium self-start sm:self-auto">
                {filteredFaqs.length} {t("pertanyaan ditemukan", "questions found")}
              </span>
            </div>

            {/* Quick Segmented Filter (Individual Chips mandiri agar tidak patah atau melar) */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("semua")}
                className={`shrink-0 text-xs sm:text-sm px-4 py-2 rounded-full font-bold transition-all min-h-[40px] flex items-center cursor-pointer border ${
                  selectedCategory === "semua"
                    ? "bg-[#0D0C23] text-white border-[#0D0C23] shadow-2xs"
                    : "bg-white text-slate-700 border-black/[0.08] hover:border-black/20 hover:text-black hover:bg-slate-50"
                }`}
              >
                {t("Semua", "All")} ({categoryCounts.semua})
              </button>
              {CATEGORIES.map((c) => {
                const isSelected = selectedCategory === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setSelectedCategory(c.key)}
                    className={`shrink-0 text-xs sm:text-sm px-4 py-2 rounded-full font-semibold transition-all min-h-[40px] flex items-center cursor-pointer border ${
                      isSelected
                        ? "bg-[#0D0C23] text-white font-bold border-[#0D0C23] shadow-2xs"
                        : "bg-white text-slate-700 border-black/[0.08] hover:border-black/20 hover:text-black hover:bg-slate-50"
                    }`}
                  >
                    {t(c.titleId, c.titleEn).replace("Untuk ", "")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accordion Rows */}
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3.5">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                const catMeta = CATEGORIES.find((c) => c.key === faq.category);

                return (
                  <div
                    key={faq.id}
                    className={`rounded-[20px] sm:rounded-[22px] border transition-all duration-200 overflow-hidden ${
                      isOpen
                        ? "bg-white border-[#0D0C23] shadow-md ring-1 ring-[#0D0C23]/10"
                        : "bg-white border-black/[0.08] hover:border-black/20 shadow-2xs"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(faq.id)}
                      aria-expanded={isOpen}
                      className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0D0C23] min-h-[64px] sm:min-h-[72px] cursor-pointer group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <span className="text-[#0D0C23] group-hover:text-navy-700 transition-colors">
                          {language === "en" ? faq.questionEn : faq.questionId}
                        </span>
                        {catMeta && (
                          <span className="self-start text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FAF8F0] text-slate-600 border border-black/[0.06]">
                            {t(catMeta.titleId, catMeta.titleEn).replace("Untuk ", "")}
                          </span>
                        )}
                      </div>

                      {/* Thin circular chevron disc */}
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
                          isOpen
                            ? "bg-[#0D0C23] border-[#0D0C23] text-[#FFDD00] rotate-180"
                            : "bg-[#FAF8F0] border-black/[0.08] text-slate-600 group-hover:text-black group-hover:border-black/20"
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </button>

                    {/* Smooth CSS Grid Accordion Transition (.32s) */}
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="pt-3 pb-6 px-5 sm:px-6 border-t border-black/[0.06] text-xs sm:text-sm text-slate-700 leading-relaxed font-normal bg-[#FAF8F0]/40">
                          {language === "en" ? faq.answerEn : faq.answerId}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="p-10 sm:p-14 text-center rounded-[28px] bg-white border border-black/[0.08] shadow-card space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-slate-600">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-[#0D0C23]">
                  {t("Tidak Ada Pertanyaan yang Sesuai", "No Questions Match Your Search")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  {t(
                    "Kami tidak menemukan pertanyaan yang cocok dengan kata kunci Anda. Silakan coba kata kunci lain atau reset filter.",
                    "We could not find any questions matching your query. Please try different keywords or reset filters."
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetSearch}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-bold text-xs sm:text-sm transition shadow-2xs min-h-[44px] cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t("Reset Pencarian", "Reset Search")}</span>
              </button>
            </div>
          )}
        </section>

        {/* Contact / Help Section at Bottom (Tema Gelap Persis Bagian Bawah Landing Page) */}
        <section
          id="bantuan-kontak"
          className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 lg:p-14 bg-[#0D0C23] text-white shadow-card text-center space-y-6"
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFDD00] block">
              {t("Bantuan Langsung", "Direct Support")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {t(
                "Masih Memerlukan Bantuan Terkait JobConnect?",
                "Still Need Assistance Regarding JobConnect?"
              )}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-lg mx-auto">
              {t(
                "Tim dukungan kami siap membantu menjawab pertanyaan Anda, menerima laporan verifikasi lowongan, maupun membantu pendaftaran mitra perusahaan.",
                "Our support team is ready to answer questions, process vacancy reports, and assist with company partner registration."
              )}
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://api.whatsapp.com/send?phone=6281326311280&text=Halo%20Admin%20JobConnect"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition shadow-2xs hover:shadow active:scale-95 min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 text-white fill-current" />
              <span>WhatsApp: 0813-2631-1280</span>
            </a>
            <a
              href="mailto:support@jobconnect.id"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-black text-sm transition shadow-2xs hover:shadow active:scale-95 min-h-[44px]"
            >
              <Mail className="w-4 h-4 text-[#0D0C23]" />
              <span>{t("Kirim Email ke Tim Dukungan", "Email Support Team")}</span>
            </a>
            <Link
              href="/lowongan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition border border-white/20 min-h-[44px]"
            >
              <span>{t("Eksplorasi Lowongan Kerja", "Explore Job Vacancies")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
