import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import {
  Building2,
  MapPin,
  Calendar,
  ArrowLeft,
  Clock,
  Video,
  ExternalLink,
  Bot,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  StatusBadge,
  type ApplicationStatus,
  APPLICATION_STATUS_CONFIG,
} from "@/components/ui/StatusBadge";
import { TombolTarikLamaran } from "@/components/lamaran/TombolTarikLamaran";

interface DetailLamaranPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: DetailLamaranPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Detail Lamaran #${id}`,
    description: "Detail informasi status, berkas, dan timeline proses lamaran kerja di JobConnect.",
  };
}

function formatDateIndo(dateStr: string): string {
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

function formatDateTimeIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function getCompanyInitials(name: string): string {
  if (!name) return "CO";
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => !["pt", "cv", "tbk", "ud"].includes(w.toLowerCase()));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default async function DetailLamaranPage({ params }: DetailLamaranPageProps) {
  const { id } = await params;
  const applicationId = Number(id);

  if (!applicationId || isNaN(applicationId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/lamaran-saya/${id}`);
  }

  // 1. Ambil data detail lamaran
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select(
      `
      id,
      job_id,
      user_id,
      cv_path,
      cover_letter,
      status,
      ai_consent,
      message_to_applicant,
      interview_at,
      interview_place,
      decided_at,
      created_at,
      updated_at,
      job:jobs (
        id,
        title,
        slug,
        job_type,
        work_mode,
        education_min,
        experience_min_years,
        company:companies (
          id,
          name,
          slug,
          logo_path,
          city:cities (
            name,
            province:provinces (name)
          )
        )
      )
    `
    )
    .eq("id", applicationId)
    .single();

  if (appError || !application) {
    notFound();
  }

  // Keamanan: hanya pemilik lamaran yang boleh melihat halaman ini
  if (application.user_id !== user.id) {
    notFound();
  }

  // 2. Ambil riwayat timeline perubahan status
  const { data: statusHistory } = await supabase
    .from("application_status_history")
    .select("id, from_status, to_status, note, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });

  const jobData = Array.isArray(application.job) ? application.job[0] : application.job;
  const companyData = jobData?.company
    ? Array.isArray(jobData.company)
      ? jobData.company[0]
      : jobData.company
    : null;
  const cityData = companyData?.city
    ? Array.isArray(companyData.city)
      ? companyData.city[0]
      : companyData.city
    : null;
  const provinceData = cityData?.province
    ? Array.isArray(cityData.province)
      ? cityData.province[0]
      : cityData.province
    : null;

  const companyName = companyData?.name || "Perusahaan Mitra";
  const companyInitials = getCompanyInitials(companyName);
  const locationText =
    [cityData?.name, provinceData?.name].filter(Boolean).join(", ") ||
    (jobData?.work_mode === "remote" ? "Kerja Remote" : "Indonesia");

  let logoUrl: string | null = null;
  if (companyData?.logo_path) {
    const { data: publicUrlData } = supabase.storage
      .from("company-logos")
      .getPublicUrl(companyData.logo_path);
    logoUrl = publicUrlData.publicUrl;
  }

  const historyList = statusHistory || [];

  return (
    <div className="min-h-screen bg-[#FAF8F0]/40 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigasi Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Beranda", href: "/" },
            { label: "Lamaran Saya", href: "/lamaran-saya" },
            { label: `Lamaran #${application.id}` },
          ]}
        />

        {/* Tombol Kembali */}
        <div>
          <Link
            href="/lamaran-saya"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-black transition min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Riwayat Lamaran</span>
          </Link>
        </div>

        {/* Kartu Header Status Lamaran */}
        <section className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-9 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
              {/* Logo Perusahaan */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-black/[0.08] bg-[#FAF8F0] flex items-center justify-center shrink-0 overflow-hidden">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={`Logo ${companyName}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-black text-xl text-black select-none">
                    {companyInitials}
                  </span>
                )}
              </div>

              {/* Judul & Meta */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-black text-black tracking-tight">
                    {jobData?.title || "Posisi Pekerjaan"}
                  </h1>
                  <StatusBadge status={application.status as ApplicationStatus} />
                </div>

                <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 flex-wrap font-medium">
                  {companyData?.slug ? (
                    <Link
                      href={`/perusahaan/${companyData.slug}`}
                      className="font-bold text-black hover:text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <Building2 className="w-4 h-4 text-slate-700" aria-hidden="true" />
                      <span>{companyName}</span>
                    </Link>
                  ) : (
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <span>{companyName}</span>
                    </span>
                  )}
                  <span className="text-slate-300" aria-hidden="true">•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>{locationText}</span>
                  </span>
                  <span className="text-slate-300" aria-hidden="true">•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    <span>Dilamar {formatDateIndo(application.created_at)}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Aksi Halaman Lowongan & Penarikan Lamaran */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <TombolTarikLamaran
                applicationId={application.id}
                currentStatus={application.status}
                jobTitle={jobData?.title || "Posisi Pekerjaan"}
                companyName={companyName}
              />
              {jobData?.slug && (
                <Link
                  href={`/lowongan/${jobData.slug}`}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition min-h-[44px]"
                >
                  <span>Buka Halaman Lowongan</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Pemberitahuan Penting Sesuai Status Terkini */}
        {application.status === "wawancara" && (
          <div
            role="region"
            aria-label="Informasi Jadwal Wawancara"
            className="rounded-[28px] bg-blue-50/90 border border-blue-200/90 p-6 sm:p-7 shadow-card space-y-3"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200">
              <Video className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
              <span>Undangan Wawancara Kerja</span>
            </div>
            <h2 className="text-lg font-black text-blue-950 tracking-tight">
              Selamat! Anda Diundang ke Tahap Wawancara
            </h2>
            <div className="space-y-1.5 text-sm text-blue-900 font-medium">
              <p>
                <span className="font-bold">Waktu Wawancara: </span>
                {application.interview_at
                  ? formatDateTimeIndo(application.interview_at)
                  : "Menunggu konfirmasi jam dari perusahaan"}
              </p>
              {application.interview_place && (
                <p>
                  <span className="font-bold">Lokasi / Tautan Pertemuan: </span>
                  {application.interview_place}
                </p>
              )}
            </div>
          </div>
        )}

        {application.status === "ditolak" && (
          <div
            role="region"
            aria-label="Informasi Status Lamaran Ditolak"
            className="rounded-[28px] bg-red-50/90 border border-red-200/90 p-6 sm:p-7 shadow-card space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-900 text-xs font-bold border border-red-200">
              <AlertCircle className="w-3.5 h-3.5 text-red-700" aria-hidden="true" />
              <span>Keputusan Seleksi</span>
            </div>
            <h2 className="text-lg font-black text-red-950 tracking-tight">
              Lamaran Belum Dapat Dilanjutkan
            </h2>
            <p className="text-sm text-red-900 leading-relaxed font-medium">
              {application.message_to_applicant ||
                "Terima kasih atas minat Anda. Pihak perusahaan memutuskan untuk melanjutkan proses dengan kandidat lain untuk posisi ini."}
            </p>
          </div>
        )}

        {application.status === "diterima" && (
          <div
            role="region"
            aria-label="Informasi Status Lamaran Diterima"
            className="rounded-[28px] bg-emerald-50/90 border border-emerald-200/90 p-6 sm:p-7 shadow-card space-y-2"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>Resmi Diterima</span>
            </div>
            <h2 className="text-lg font-black text-emerald-950 tracking-tight">
              Selamat! Anda Diterima di {companyName}
            </h2>
            <p className="text-sm text-emerald-900 leading-relaxed font-medium">
              Selamat atas keberhasilan Anda! Pihak perusahaan akan segera menghubungi Anda untuk langkah administrasi atau orientasi selanjutnya.
            </p>
          </div>
        )}

        {/* Tata Letak Dua Kolom: Timeline Proses di Kiri, Rincian Berkas di Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Kolom Kiri: Timeline Riwayat Perubahan Status */}
          <section
            aria-label="Timeline Riwayat Status Lamaran"
            className="lg:col-span-2 bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6"
          >
            <div className="space-y-1 border-b border-black/[0.06] pb-4">
              <h2 className="text-xl font-black text-black tracking-tight">
                Timeline Riwayat Proses
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Catatan kronologis setiap tahapan seleksi yang diperbarui secara transparan.
              </p>
            </div>

            {historyList.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Clock className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
                <p className="text-sm font-bold text-slate-800">
                  Lamaran Berhasil Terkirim
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Lamaran Anda saat ini berada dalam antrean peninjauan oleh tim rekruter perusahaan mitra.
                </p>
              </div>
            ) : (
              <ol className="relative border-l-2 border-black/[0.08] ml-4 sm:ml-6 space-y-7 list-none m-0 p-0">
                {historyList.map((item, index) => {
                  const isLatest = index === historyList.length - 1;
                  const config =
                    APPLICATION_STATUS_CONFIG[item.to_status as ApplicationStatus];
                  const label = config?.label || item.to_status;

                  return (
                    <li key={item.id} className="relative pl-6 sm:pl-8">
                      {/* Titik Indikator Timeline */}
                      <span
                        className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${
                          isLatest
                            ? "bg-[#FFDD00] border-black shadow-2xs"
                            : "bg-white border-slate-400"
                        }`}
                        aria-hidden="true"
                      />

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-sm sm:text-base font-black text-black">
                            {label}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {formatDateTimeIndo(item.created_at)}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-0.5 rounded-full bg-black text-[#FFDD00] text-[10px] font-black tracking-wide uppercase">
                              Status Terkini
                            </span>
                          )}
                        </div>

                        {item.note && (
                          <div className="p-3 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs text-slate-700 leading-relaxed font-medium">
                            {item.note}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          {/* Kolom Kanan: Rincian Berkas yang Dikirim */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[28px] border border-black/[0.08] p-6 shadow-card space-y-5">
              <h3 className="text-base font-black text-black tracking-tight border-b border-black/[0.06] pb-3">
                Berkas Lamaran
              </h3>

              {/* Status Berkas CV */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Curriculum Vitae (CV)
                </span>
                <div className="p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-900 font-black text-xs border border-amber-200">
                    PDF
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      Berkas CV Terunggah
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tersimpan di Supabase Storage aman
                    </p>
                  </div>
                </div>
              </div>

              {/* Opsi Analisis AI */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Analisis AI
                </span>
                <div className="p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] flex items-start gap-2.5 text-xs">
                  <Bot className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      {application.ai_consent ? "Izin Analisis Aktif" : "Analisis Tidak Diaktifkan"}
                    </span>
                    <span className="text-slate-500 text-[11px] leading-snug block mt-0.5">
                      {application.ai_consent
                        ? "Anda menyetujui analisis kecocokan profil oleh sistem AI saat melamar."
                        : "Anda memilih agar berkas dinilai secara langsung tanpa ekstraksi AI."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Surat Pengantar jika Ada */}
              {application.cover_letter && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Surat Pengantar
                  </span>
                  <div className="p-3.5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                    {application.cover_letter}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
