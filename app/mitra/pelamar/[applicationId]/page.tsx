import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Briefcase,
  FileText,
  ExternalLink,
  History,
  MapPin,
  GraduationCap,
  Globe,
  FolderGit2,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { LinkedinIcon } from "@/components/ui/LinkedinIcon";
import { StatusBadge, type ApplicationStatus } from "@/components/ui/StatusBadge";
import { ViewCvButton } from "@/components/mitra/ViewCvButton";
import { ApplicationStatusActions } from "@/components/mitra/ApplicationStatusActions";
import {
  CandidateNotes,
  type CandidateNoteItem,
} from "@/components/mitra/CandidateNotes";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  type JobType,
  type WorkMode,
} from "@/lib/labels";
import {
  calculateAge,
  EDUCATION_LEVEL_OPTIONS,
  type PortfolioItem,
} from "@/lib/validation/profil";
import { formatWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Detail Kandidat & Profil Akun Pelamar - Dashboard Mitra",
  description:
    "Tinjau data pelamar, biodata akun, domisili, umur, tautan LinkedIn, galeri portofolio karya, dan riwayat lamaran kandidat.",
};

interface DetailPelamarPageProps {
  params: Promise<{
    applicationId: string;
  }>;
}

function formatDateIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatDateBirth(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

type ApplicantProfile = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  headline: string | null;
  avatar_url?: string | null;
  province_id?: number | null;
  city_id?: number | null;
  birth_date?: string | null;
  education_level?: string | null;
  education_institution?: string | null;
  bio?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  portfolios?: PortfolioItem[] | null;
  created_at?: string;
};

type RawApp = {
  id: number;
  job_id: number;
  user_id: string;
  cv_path: string;
  cover_letter: string | null;
  ai_consent: boolean;
  status: ApplicationStatus;
  message_to_applicant: string | null;
  interview_at: string | null;
  interview_place: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: ApplicantProfile | null;
  jobs: {
    id: number;
    title: string;
    slug: string;
    status: string;
    job_type: string;
    work_mode: string;
    company_id: number;
    ai_screening: boolean;
  } | null;
};

type HistoryItem = {
  id: number;
  application_id: number;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  changed_by: string;
  note: string | null;
  created_at: string;
};

export default async function DetailPelamarPage({
  params,
}: DetailPelamarPageProps) {
  const { applicationId } = await params;
  const appId = Number(applicationId);

  if (isNaN(appId) || appId <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/mitra/pelamar/${appId}`);
  }

  // Ambil data profil perusahaan mitra yang login
  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect("/mitra/profil-perusahaan");
  }

  // Ambil detail lamaran beserta data profil akun pelamar (dengan fallback query aman)
  let rawApplication: unknown = null;
  const { data: fullAppData, error: fullAppError } = await supabase
    .from("applications")
    .select(`
      id,
      job_id,
      user_id,
      cv_path,
      cover_letter,
      ai_consent,
      status,
      message_to_applicant,
      interview_at,
      interview_place,
      decided_at,
      created_at,
      updated_at,
      profiles:user_id (
        id,
        name,
        email,
        phone,
        headline,
        avatar_url,
        province_id,
        city_id,
        birth_date,
        education_level,
        education_institution,
        bio,
        linkedin_url,
        portfolio_url,
        portfolios,
        created_at
      ),
      jobs:job_id (
        id,
        title,
        slug,
        status,
        job_type,
        work_mode,
        company_id,
        ai_screening
      )
    `)
    .eq("id", appId)
    .maybeSingle();

  if (fullAppError || !fullAppData) {
    // Fallback jika database belum menjalankan migration kolom biodata baru
    const { data: basicAppData } = await supabase
      .from("applications")
      .select(`
        id,
        job_id,
        user_id,
        cv_path,
        cover_letter,
        ai_consent,
        status,
        message_to_applicant,
        interview_at,
        interview_place,
        decided_at,
        created_at,
        updated_at,
        profiles:user_id (
          id,
          name,
          email,
          phone,
          headline
        ),
        jobs:job_id (
          id,
          title,
          slug,
          status,
          job_type,
          work_mode,
          company_id,
          ai_screening
        )
      `)
      .eq("id", appId)
      .maybeSingle();
    rawApplication = basicAppData;
  } else {
    rawApplication = fullAppData;
  }

  const application = rawApplication as RawApp | null;

  if (!application || !application.jobs) {
    notFound();
  }

  // Pastikan lowongan ini benar milik perusahaan yang sedang masuk
  if (application.jobs.company_id !== company.id) {
    redirect("/mitra/lowongan");
  }

  // Ambil riwayat status lamaran
  const { data: rawHistory } = await supabase
    .from("application_status_history")
    .select("id, application_id, from_status, to_status, changed_by, note, created_at")
    .eq("application_id", appId)
    .order("created_at", { ascending: false });

  const statusHistory = (rawHistory as unknown as HistoryItem[]) || [];

  // Ambil seluruh catatan internal perusahaan untuk kandidat ini
  const { data: rawNotes } = await supabase
    .from("application_notes")
    .select("id, application_id, author_id, note, created_at")
    .eq("application_id", appId)
    .order("created_at", { ascending: false });

  const notes = (rawNotes as unknown as CandidateNoteItem[]) || [];

  const applicant = application.profiles;
  const applicantName = applicant?.name || "Kandidat Pelamar";
  const headline = applicant?.headline || "Pencari Kerja JobConnect";
  const initials = getInitials(applicantName);

  const job = application.jobs;
  const jobTypeLabel = JOB_TYPE_LABEL[job.job_type as JobType] || job.job_type;
  const workModeLabel = WORK_MODE_LABEL[job.work_mode as WorkMode] || job.work_mode;

  // Resolusi data domisili pelamar (kota & provinsi)
  let applicantLocation: string | null = null;
  if (applicant?.city_id) {
    const { data: cityData } = await supabase
      .from("cities")
      .select("name, type, provinces:province_id(name)")
      .eq("id", applicant.city_id)
      .maybeSingle();
    if (cityData) {
      const typeStr = cityData.type === "kota" ? "Kota" : "Kab.";
      const provName = (cityData.provinces as { name: string } | null)?.name;
      applicantLocation = `${typeStr} ${cityData.name}${provName ? `, ${provName}` : ""}`;
    }
  } else if (applicant?.province_id) {
    const { data: provData } = await supabase
      .from("provinces")
      .select("name")
      .eq("id", applicant.province_id)
      .maybeSingle();
    if (provData) {
      applicantLocation = provData.name;
    }
  }

  // Hitung usia pelamar dari tanggal lahir
  const applicantAge = calculateAge(applicant?.birth_date);

  // Label jenjang pendidikan
  const educationLabel =
    EDUCATION_LEVEL_OPTIONS.find((e) => e.value === applicant?.education_level)?.label ||
    applicant?.education_level ||
    null;

  // Format tautan WhatsApp langsung dengan template pesan kontekstual
  const whatsappUrl = formatWhatsAppUrl(
    applicant?.phone,
    applicantName,
    company.name,
    job.title,
    application.status,
    application.interview_at ? formatDateIndo(application.interview_at) : null,
    application.interview_place
  );

  // Format tautan Gmail langsung dengan pesan template otomatis sesuai status lamaran
  let gmailUrl: string | null = null;
  if (applicant?.email) {
    let emailSubject = `Konfirmasi Lamaran Kerja: ${job.title} - ${company.name}`;
    let emailBody = `Halo ${applicantName},\n\nTerima kasih telah melamar posisi ${job.title} di ${company.name} melalui platform JobConnect.\n\nSaat ini berkas lamaran Anda sedang dalam tahap peninjauan oleh tim rekrutmen kami. Kami akan segera mengabari Anda kembali mengenai proses seleksi selanjutnya.\n\nSalam hangat,\nTim Rekrutmen ${company.name}`;

    if (application.status === "diterima") {
      emailSubject = `Selamat! Anda Dinyatakan Diterima Bekerja di ${company.name} (${job.title})`;
      emailBody = `Halo ${applicantName},\n\nSelamat! Berdasarkan hasil evaluasi kualifikasi dan seluruh tahapan seleksi yang telah dilalui, kami dari ${company.name} dengan senang hati menyampaikan bahwa Anda dinyatakan RESMI DITERIMA untuk bergabung bersama kami pada posisi ${job.title}.\n\nTim HR kami akan segera menghubungi Anda kembali terkait dokumen penawaran kerja (offering letter), kelengkapan berkas administrasi, dan jadwal orientasi hari pertama kerja (onboarding).\n\nJika ada hal yang ingin Anda tanyakan atau konfirmasi terlebih dahulu, silakan langsung membalas email ini.\n\nSalam sukses dan selamat bergabung,\nTim Rekrutmen ${company.name}`;
    } else if (application.status === "wawancara") {
      emailSubject = `Undangan Wawancara Kerja: ${job.title} - ${company.name}`;
      const scheduleInfo = application.interview_at
        ? `Waktu: ${formatDateIndo(application.interview_at)}\nLokasi / Media: ${application.interview_place || "Daring / Online"}\n\n`
        : "";
      emailBody = `Halo ${applicantName},\n\nKami dari ${company.name} mengundang Anda untuk mengikuti tahapan wawancara kerja untuk posisi ${job.title}.\n\n${scheduleInfo}Mohon konfirmasikan kesediaan jadwal Anda dengan membalas pesan email ini.\n\nSalam hangat,\nTim Rekrutmen ${company.name}`;
    } else if (application.status === "ditawari") {
      emailSubject = `Penawaran Pekerjaan Resmi (Offering): ${job.title} - ${company.name}`;
      emailBody = `Halo ${applicantName},\n\nKami dari ${company.name} ingin menyampaikan penawaran pekerjaan untuk posisi ${job.title}. Kami sangat terkesan dengan rekam jejak dan kualifikasi yang Anda miliki.\n\nMohon periksa penawaran ini dan kabari kami kembali untuk langkah berikutnya.\n\nSalam hangat,\nTim Rekrutmen ${company.name}`;
    } else if (application.status === "ditolak") {
      emailSubject = `Pemberitahuan Status Lamaran: ${job.title} - ${company.name}`;
      emailBody = `Halo ${applicantName},\n\nTerima kasih atas antusiasme dan waktu yang Anda luangkan untuk melamar posisi ${job.title} di ${company.name}.\n\nSetelah melakukan pertimbangan menyeluruh terhadap seluruh berkas kandidat, saat ini kami memutuskan untuk belum dapat melanjutkan proses seleksi Anda ke tahap berikutnya.\n\nKami mendoakan kesuksesan untuk langkah dan karier profesional Anda ke depan.\n\nSalam hangat,\nTim Rekrutmen ${company.name}`;
    }

    gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      applicant.email
    )}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  }

  // Daftar karya portofolio
  const portfolioItems = (applicant?.portfolios as PortfolioItem[]) || [];

  // Siapkan signed URL awal (berlaku 5 menit) untuk berkas CV privat
  let initialSignedCvUrl: string | null = null;
  if (application.cv_path) {
    try {
      const { data: signedData } = await supabase.storage
        .from("cvs")
        .createSignedUrl(application.cv_path, 300);
      initialSignedCvUrl = signedData?.signedUrl || null;
    } catch {
      initialSignedCvUrl = null;
    }
  }

  return (
    <div className="space-y-8">
      {/* Navigasi Kembali */}
      <div>
        <Link
          href={`/mitra/lowongan/${application.job_id}/pelamar`}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-black transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Kembali ke Daftar Pelamar ({job.title})</span>
        </Link>
      </div>

      {/* Kartu Profil Utama Akun Kandidat (Biodata, Umur, Domisili, Kontak & Tautan) */}
      <div className="bg-white rounded-[32px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {applicant?.avatar_url ? (
              <Image
                src={applicant.avatar_url}
                alt={`Foto ${applicantName}`}
                width={72}
                height={72}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0 shadow-xs border-2 border-black/10"
                unoptimized
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0D0C23] text-white font-black text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-xs border-2 border-black/10 select-none">
                {initials}
              </div>
            )}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-3xl font-black text-black tracking-tight">
                  {applicantName}
                </h1>
                <StatusBadge status={application.status} />
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                {headline}
              </p>

              {/* Lencana Ringkas: Umur, Domisili, Pendidikan */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {applicantAge !== null && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>
                      Usia {applicantAge} tahun
                      {applicant?.birth_date ? ` (Lahir ${formatDateBirth(applicant.birth_date)})` : ""}
                    </span>
                  </span>
                )}

                {applicantLocation && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                    <MapPin className="w-3 h-3 text-blue-700" />
                    <span>{applicantLocation}</span>
                  </span>
                )}

                {educationLabel && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAF8F0] text-slate-800 border border-black/[0.08]">
                    <GraduationCap className="w-3 h-3 text-slate-600" />
                    <span>
                      {educationLabel}
                      {applicant?.education_institution ? ` (${applicant.education_institution})` : ""}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bilah Aksi Kontak Cepat & Tautan Akun Pelamar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-black/[0.06]">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition min-h-[40px]"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              <span>Hubungi via WhatsApp</span>
            </a>
          )}

          {gmailUrl && (
            <a
              href={gmailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-slate-50 border border-black/[0.08] text-slate-800 font-bold text-xs shadow-2xs transition min-h-[40px]"
            >
              <Mail className="w-4 h-4 text-rose-500" aria-hidden="true" />
              <span>Kirim Email (Gmail)</span>
            </a>
          )}

          {applicant?.linkedin_url && (
            <a
              href={applicant.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A66C2] hover:bg-[#084e96] text-white font-bold text-xs shadow-2xs transition min-h-[40px]"
            >
              <LinkedinIcon className="w-4 h-4" aria-hidden="true" />
              <span>Profil LinkedIn</span>
              <ExternalLink className="w-3 h-3 text-white/80" aria-hidden="true" />
            </a>
          )}

          {applicant?.portfolio_url && (
            <a
              href={applicant.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-2xs transition min-h-[40px]"
            >
              <Globe className="w-4 h-4 text-[#FFDD00]" aria-hidden="true" />
              <span>Website Portofolio</span>
              <ExternalLink className="w-3 h-3 text-white/80" aria-hidden="true" />
            </a>
          )}

          <div className="inline-flex items-center gap-2 text-xs text-slate-500 px-3 py-2 rounded-full bg-[#FAF8F0] border border-black/[0.04] ml-auto">
            <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>Melamar {formatDateIndo(application.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Grid Dua Kolom: Informasi Akun, Portofolio & Seleksi */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Kolom Kiri: Dokumen Pelamar, Lowongan, CV & Portofolio */}
        <div className="xl:col-span-8 space-y-6">
          {/* Subgrid: Posisi Lowongan & Berkas CV Berdampingan untuk Memaksimalkan Ruang */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Posisi Lowongan yang Dilamar */}
            <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-black" aria-hidden="true" />
                  <h2 className="text-base sm:text-lg font-black text-black">
                    Posisi Dilamar
                  </h2>
                </div>
                {job.status === "open" && (
                  <Link
                    href={`/lowongan/${job.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-black transition"
                  >
                    <span>Buka Lowongan</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-2 flex-1 flex flex-col justify-center">
                <h3 className="text-base font-black text-black leading-snug">
                  {job.title}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
                  <span className="px-2.5 py-1 rounded-full bg-white border border-black/[0.06] font-bold text-black">
                    {jobTypeLabel}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white border border-black/[0.06] font-bold text-black">
                    {workModeLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Berkas Curriculum Vitae (CV) */}
            <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-black" aria-hidden="true" />
                <h2 className="text-base sm:text-lg font-black text-black">
                  Berkas CV Resmi (PDF)
                </h2>
              </div>

              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Berkas tersimpan aman di cloud storage terenkripsi dengan signed URL privat (berlaku 5 menit).
                </p>

                <div className="pt-1">
                  <ViewCvButton
                    applicationId={application.id}
                    initialSignedUrl={initialSignedCvUrl}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Jadwal Wawancara (Jika Sudah Ditentukan) */}
          {application.interview_at && (
            <div className="bg-white rounded-3xl border border-blue-200 p-6 sm:p-7 shadow-card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" aria-hidden="true" />
                  <h2 className="text-base sm:text-lg font-black text-black">
                    Jadwal Wawancara Terjadwal
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
                  Tahap Wawancara Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm font-medium">
                <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-1">
                  <span className="text-slate-500 text-xs block">Waktu Wawancara:</span>
                  <strong className="text-black font-black text-sm block">
                    {formatDateIndo(application.interview_at)}
                  </strong>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] space-y-1">
                  <span className="text-slate-500 text-xs block">Lokasi atau Tautan Pertemuan:</span>
                  {application.interview_place?.startsWith("http") ? (
                    <a
                      href={application.interview_place}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-bold text-xs sm:text-sm inline-flex items-center gap-1 underline break-all"
                    >
                      <span>Buka Tautan Pertemuan</span>
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                  ) : (
                    <strong className="text-black font-bold text-xs sm:text-sm block">
                      {application.interview_place || "Lokasi belum ditentukan"}
                    </strong>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Surat Lamaran (Cover Letter) */}
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-black" aria-hidden="true" />
              <h2 className="text-base sm:text-lg font-black text-black">
                Surat Lamaran (Cover Letter)
              </h2>
            </div>

            {application.cover_letter ? (
              <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                {application.cover_letter}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm text-slate-500 font-medium italic">
                Kandidat tidak menyertakan surat lamaran tertulis khusus saat mengirimkan lamaran ini.
              </div>
            )}
          </div>

          {/* Bio / Ringkasan Tentang Pelamar */}
          {applicant?.bio && (
            <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-black" aria-hidden="true" />
                <h2 className="text-base sm:text-lg font-black text-black">
                  Tentang Kandidat (Bio)
                </h2>
              </div>
              <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                {applicant.bio}
              </div>
            </div>
          )}

          {/* Galeri Portofolio & Hasil Karya Nyata Pelamar */}
          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-black" aria-hidden="true" />
                <h2 className="text-base sm:text-lg font-black text-black">
                  Portofolio & Karya Nyata Pelamar
                </h2>
              </div>
              {portfolioItems.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFDD00] text-black text-xs font-black shadow-2xs">
                  {portfolioItems.length} Proyek
                </span>
              )}
            </div>

            {portfolioItems.length === 0 ? (
              <div className="p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs text-slate-500 font-medium italic">
                Pelamar belum mencantumkan proyek portofolio tambahan pada akun ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#FAF8F0]/70 border border-black/[0.08] hover:border-black/20 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      {item.imageUrl && (
                        <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 border border-black/[0.06] mb-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-black text-sm text-black">
                          {item.title}
                        </h3>
                        {item.year && (
                          <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-black/[0.06]">
                            {item.year}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                          {item.description}
                        </p>
                      )}

                      {item.skills && item.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-black/[0.06]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {item.url && (
                      <div className="pt-2 border-t border-black/[0.06]">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <span>Kunjungi Demo Proyek</span>
                          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Aksi Status, Catatan Internal Tim & Timeline Riwayat Status */}
        <div className="xl:col-span-4 space-y-6">
          <ApplicationStatusActions
            applicationId={application.id}
            currentStatus={application.status}
            candidateName={applicantName}
            initialInterviewAt={application.interview_at}
            initialInterviewPlace={application.interview_place}
          />

          <CandidateNotes
            applicationId={application.id}
            notes={notes}
            currentUserId={user.id}
          />

          <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-5">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-black" aria-hidden="true" />
              <h2 className="text-base sm:text-lg font-black text-black">
                Riwayat Status Lamaran
              </h2>
            </div>

            {statusHistory.length === 0 ? (
              <div className="text-xs text-slate-500 font-medium p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06]">
                Belum ada catatan perubahan status lanjutan.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-black/[0.08]">
                {statusHistory.map((item) => (
                  <div key={item.id} className="relative space-y-1">
                    <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-white border-2 border-black" />
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={item.to_status} />
                      <span className="text-[11px] text-slate-500 font-medium">
                        {formatDateIndo(item.created_at)}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-slate-600 font-medium pt-1">
                        {item.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
