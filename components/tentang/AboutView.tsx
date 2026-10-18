"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  HelpCircle,
  ChevronDown,
  Check,
  FileText,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface FaqItem {
  id: string;
  category: "pelamar" | "perusahaan" | "keamanan";
  questionId: string;
  questionEn: string;
  answerId: string;
  answerEn: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "biaya",
    category: "pelamar",
    questionId: "Apakah ada biaya yang dipungut dari pencari kerja?",
    questionEn: "Are there any fees charged to job seekers?",
    answerId:
      "Tidak ada. JobConnect 100% gratis untuk seluruh pencari kerja. Kami tidak memungut biaya pendaftaran, biaya pembuatan akun, maupun biaya penempatan kerja. Jika ada pihak yang mengatasnamakan perusahaan mitra dan meminta uang, segera laporkan ke tim kami.",
    answerEn:
      "None. JobConnect is 100% free for all job seekers. We do not charge registration fees, account creation fees, or placement commissions. If anyone claiming to represent a partner company requests payment, report them immediately.",
  },
  {
    id: "format-cv",
    category: "pelamar",
    questionId: "Format berkas apa yang didukung untuk mengunggah CV?",
    questionEn: "What file formats are supported for uploading CVs?",
    answerId:
      "Berkas CV wajib berformat PDF dengan batas ukuran maksimal 2 MB. Format PDF menjaga tata letak resume Anda tetap rapi, profesional, dan mudah dibaca oleh tim HR perusahaan.",
    answerEn:
      "CV files must be in PDF format with a maximum file size of 2 MB. The PDF format ensures your resume layout remains neat, professional, and easily readable by HR teams.",
  },
  {
    id: "moderasi-lowongan",
    category: "keamanan",
    questionId: "Bagaimana proses moderasi lowongan sebelum tayang ke publik?",
    questionEn: "How are job vacancies moderated before going public?",
    answerId:
      "Setiap lowongan yang diajukan oleh mitra wajib melalui verifikasi admin JobConnect. Admin memeriksa keabsahan instansi, kejelasan alamat operasional, kepastian rentang gaji, serta kelayakan tanggung jawab kerja sebelum status lowongan disetujui.",
    answerEn:
      "Every vacancy submitted by partners must undergo verification by JobConnect administrators. Admins review entity authenticity, physical office location, stated salary ranges, and job responsibilities before approval.",
  },
  {
    id: "ai-screening",
    category: "keamanan",
    questionId: "Bagaimana kerja asisten AI dalam peninjauan lamaran?",
    questionEn: "How does the AI assistant work in reviewing applications?",
    answerId:
      "Asisten AI hanya bertindak sebagai alat bantu bagi perekrut untuk membandingkan kecocokan kualifikasi terstruktur (seperti pendidikan minimal, keahlian wajib, dan durasi pengalaman). Keputusan seleksi, panggilan wawancara, dan penerimaan 100% berada di tangan manusia. Pelamar juga bebas memilih apakah berkasnya ingin dianalisis oleh AI atau tidak.",
    answerEn:
      "The AI assistant only serves as an aid for recruiters to evaluate structured qualification matches (such as education minimum, required skills, and experience length). Selection, interview calls, and hiring decisions are 100% human-driven. Applicants can also choose whether or not to enable AI screening.",
  },
  {
    id: "transparansi-gaji",
    category: "pelamar",
    questionId: "Mengapa seluruh lowongan wajib mencantumkan rentang gaji?",
    questionEn: "Why are all vacancies required to state a salary range?",
    answerId:
      "Transparansi kriteria adalah komitmen utama JobConnect. Kami melarang informasi kompensasi rahasia agar pencari kerja dapat mengukur kecocokan finansial dan karier sejak awal, sekaligus mencegah praktik eksploitasi upah yang tidak adil.",
    answerEn:
      "Criteria transparency is JobConnect's core commitment. We prohibit confidential compensation listings so job seekers can assess financial alignment early and avoid unfair wage practices.",
  },
  {
    id: "daftar-mitra",
    category: "perusahaan",
    questionId: "Bagaimana cara perusahaan mendaftar sebagai mitra resmi?",
    questionEn: "How do companies register as official partners?",
    answerId:
      "Perusahaan dapat mendaftarkan akun mitra melalui menu Pasang Lowongan, melengkapi data profil instansi, alamat kantor operasional, dan logo resmi. Setelah profil diverifikasi, mitra dapat mengunggah draf lowongan dan mengelola berkas pelamar langsung dari Dashboard Mitra.",
    answerEn:
      "Companies can register a partner account via the Post a Job menu, complete entity details, operational office address, and official logo. Once verified, partners can draft vacancies and manage candidate dossiers directly from the Partner Dashboard.",
  },
  {
    id: "jangkauan-wilayah",
    category: "pelamar",
    questionId: "Apakah lowongan mencakup seluruh wilayah di Indonesia?",
    questionEn: "Does JobConnect cover all regions in Indonesia?",
    answerId:
      "Ya. JobConnect mencakup penempatan kerja di seluruh 38 provinsi di Indonesia (dari kota metropolitan hingga kabupaten daerah), serta menyediakan kategori khusus lowongan Jarak Jauh (Remote) yang dapat dikerjakan dari rumah.",
    answerEn:
      "Yes. JobConnect covers job placements across all 38 provinces in Indonesia, as well as a dedicated Remote Work category that allows you to work from home anywhere nationwide.",
  },
  {
    id: "notifikasi-status",
    category: "pelamar",
    questionId: "Bagaimana cara memantau progres lamaran yang sudah dikirim?",
    questionEn: "How can I track the progress of submitted applications?",
    answerId:
      "Anda dapat membuka halaman Lamaran Saya untuk melihat linimasa status berkas secara realtime (Dikirim, Ditinjau, Wawancara, Diterima, atau Ditolak). Pembaruan juga dikirimkan melalui notifikasi akun dan email resmi.",
    answerEn:
      "You can visit the My Applications page to track real-time dossier progress (Submitted, Under Review, Interview, Accepted, or Rejected). Status updates are also delivered via account notifications and official emails.",
  },
];

export function AboutView() {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<"semua" | "pelamar" | "perusahaan" | "keamanan">("semua");
  const [openFaqId, setOpenFaqId] = useState<string | null>("biaya");

  const filteredFaqs = selectedCategory === "semua"
    ? FAQ_ITEMS
    : FAQ_ITEMS.filter((item) => item.category === selectedCategory);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#FAF8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10 sm:space-y-12">
        {/* Navigasi Breadcrumb */}
        <Breadcrumb
          items={[
            { label: t("Beranda", "Home"), href: "/" },
            { label: t("Panduan & FAQ", "Guide & FAQ") },
          ]}
        />

        {/* Header Hero Bergaya Landing Page BMC */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFDD00] text-black border border-black/10 text-xs font-bold shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-black" aria-hidden="true" />
            <span>{t("Pusat Bantuan & Panduan Resmi", "Official Guide & Help Center")}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0D0C23] tracking-tight leading-tight">
            {t("Panduan Resmi & Pertanyaan Umum", "Official Guide & FAQ")}
          </h1>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {t(
              "Informasi transparan seputar tata cara melamar kerja, format berkas, moderasi lowongan, verifikasi mitra, serta sistem keamanan tanpa calo di JobConnect.",
              "Transparent information regarding job applications, file formats, vacancy moderation, partner verification, and broker-free security on JobConnect."
            )}
          </p>
        </div>

        {/* 3 Langkah Cepat Melamar (Visual Stepper Card) */}
        <section className="bg-white rounded-[32px] sm:rounded-[44px] p-6 sm:p-10 lg:p-12 border border-black/[0.08] shadow-card space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-black/[0.06] pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {t("Alur Cepat Melamar", "Quick Application Flow")}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-[#0D0C23] tracking-tight mt-1">
                {t("3 Langkah Menuju Karier Resmi", "3 Steps to Your Official Career")}
              </h2>
            </div>
            <Link
              href="/lowongan"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-navy-900 hover:text-navy-700 underline underline-offset-4 self-start sm:self-auto"
            >
              <span>{t("Cari Lowongan Sekarang", "Search Jobs Now")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Langkah 1 */}
            <div className="bg-[#FAF8F0] p-6 rounded-[24px] border border-black/[0.06] space-y-3.5 flex flex-col justify-between hover:shadow-card transition duration-200">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center font-black text-sm text-[#0D0C23] shadow-2xs">
                  01
                </div>
                <h3 className="text-base font-bold text-[#0D0C23]">
                  {t("Unggah CV Format PDF", "Upload PDF CV")}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {t(
                    "Siapkan resume terbaikmu dalam format PDF (maksimal 2 MB). Lengkapi data kontak telepon dan profil dasar.",
                    "Prepare your best resume in PDF format (maximum 2 MB). Complete your phone contact and basic profile."
                  )}
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.06] flex items-center gap-2 text-xs text-slate-600 font-medium">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t("PDF Maksimal 2 MB", "PDF Maximum 2 MB")}</span>
              </div>
            </div>

            {/* Langkah 2 */}
            <div className="bg-[#FAF8F0] p-6 rounded-[24px] border border-black/[0.06] space-y-3.5 flex flex-col justify-between hover:shadow-card transition duration-200">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center font-black text-sm text-[#0D0C23] shadow-2xs">
                  02
                </div>
                <h3 className="text-base font-bold text-[#0D0C23]">
                  {t("Pilih Lowongan Transparan", "Choose Transparent Jobs")}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {t(
                    "Pilih pekerjaan sesuai keahlian, rentang gaji, dan domisili (Onsite, Hybrid, atau Remote). Tanpa gaji dirahasiakan.",
                    "Select vacancies matching your skills, salary range, and residence (Onsite, Hybrid, or Remote). No hidden salaries."
                  )}
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.06] flex items-center gap-2 text-xs text-slate-600 font-medium">
                <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t("Kriteria Pasti & Jelas", "Clear & Certain Criteria")}</span>
              </div>
            </div>

            {/* Langkah 3 */}
            <div className="bg-[#FAF8F0] p-6 rounded-[24px] border border-black/[0.06] space-y-3.5 flex flex-col justify-between hover:shadow-card transition duration-200">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-black/[0.08] flex items-center justify-center font-black text-sm text-[#0D0C23] shadow-2xs">
                  03
                </div>
                <h3 className="text-base font-bold text-[#0D0C23]">
                  {t("Pantau Linimasa Status", "Track Status Timeline")}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {t(
                    "Pantau progres berkasmu langsung di menu Lamaran Saya. Dapatkan notifikasi saat dijadwalkan wawancara atau diterima.",
                    "Track your dossier progress in My Applications. Receive notifications when scheduled for interviews or accepted."
                  )}
                </p>
              </div>
              <div className="pt-2 border-t border-black/[0.06] flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t("Pembaruan Realtime", "Realtime Updates")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bagian FAQ Interaktif */}
        <section className="bg-white rounded-[32px] sm:rounded-[44px] p-6 sm:p-10 lg:p-12 border border-black/[0.08] shadow-card space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/[0.06] pb-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                {t("Pertanyaan Sering Diajukan", "Frequently Asked Questions")}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0D0C23] tracking-tight">
                {t("Temukan Jawaban yang Sering Ditanyakan", "Find Common Answers")}
              </h2>
            </div>

            {/* Segmented Filter Kategori FAQ */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF8F0] p-1.5 rounded-full border border-black/[0.06]">
              {(
                [
                  { key: "semua", labelId: "Semua", labelEn: "All" },
                  { key: "pelamar", labelId: "Pencari Kerja", labelEn: "Job Seekers" },
                  { key: "keamanan", labelId: "Keamanan & AI", labelEn: "Security & AI" },
                  { key: "perusahaan", labelId: "Mitra Perusahaan", labelEn: "Companies" },
                ] as const
              ).map((tab) => {
                const isActive = selectedCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedCategory(tab.key)}
                    className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition min-h-[38px] flex items-center ${
                      isActive
                        ? "bg-[#0D0C23] text-white shadow-2xs"
                        : "text-slate-700 hover:text-black hover:bg-black/5"
                    }`}
                  >
                    {t(tab.labelId, tab.labelEn)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Daftar Accordion FAQ */}
          <div className="space-y-3.5">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`rounded-[22px] border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "bg-[#FAF8F0] border-black/20 shadow-2xs"
                      : "bg-white border-black/[0.08] hover:border-black/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0D0C23] min-h-[52px]"
                  >
                    <span>{t(faq.questionId, faq.questionEn)}</span>
                    <span className="shrink-0 p-1 rounded-full bg-white border border-black/[0.08] text-slate-700">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-black" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal border-t border-black/[0.06]">
                      {t(faq.answerId, faq.answerEn)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Kartu Bawah: Hubungi Kami / Mulai Melamar (Tema Gelap Persis Landing Page) */}
        <section className="bg-[#0D0C23] text-white rounded-[32px] sm:rounded-[48px] p-8 sm:p-14 lg:p-16 text-center space-y-6 shadow-card">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block">
              {t("Siap Menemukan Pekerjaan Impian?", "Ready to Find Your Dream Job?")}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t("Lamar lowongan resmi terverifikasi sekarang juga.", "Apply to official verified vacancies right now.")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal max-w-xl mx-auto">
              {t(
                "Tidak ada perantara, tidak ada biaya administrasi. Seluruh proses seleksi dilakukan secara transparan langsung dengan perusahaan mitra.",
                "No intermediaries, no administrative fees. The entire selection process is conducted transparently directly with partner companies."
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/lowongan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-[#0D0C23] font-black text-sm transition shadow-2xs hover:shadow active:scale-95 min-h-[44px]"
            >
              {t("Eksplorasi Lowongan", "Explore Vacancies")}
            </Link>
            <Link
              href="/register?peran=perusahaan"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition border border-white/20 min-h-[44px]"
            >
              {t("Pasang Lowongan Perusahaan", "Post Company Vacancy")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
