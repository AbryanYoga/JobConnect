"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  Calendar,
  ArrowLeft,
  Clock,
  Video,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  StatusBadge,
  type ApplicationStatus,
  APPLICATION_STATUS_CONFIG,
} from "@/components/ui/StatusBadge";
import { TombolTarikLamaran } from "@/components/lamaran/TombolTarikLamaran";
import { getCompanyLogo } from "@/lib/company-logo";
import { useLanguage } from "@/lib/i18n";

export interface StatusHistoryItem {
  id: number;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string;
}

export interface DetailLamaranViewProps {
  application: {
    id: number;
    status: string;
    created_at: string;
    interview_at: string | null;
    interview_place: string | null;
    message_to_applicant: string | null;
    ai_consent?: boolean;
    cover_letter: string | null;
  };
  jobData: {
    title: string;
    slug: string;
  } | null;
  companyName: string;
  companyInitials: string;
  locationText: string;
  logoUrl: string | null;
  historyList: StatusHistoryItem[];
  companySlug?: string | null;
  slaDaysPassed?: number;
  slaRemainingDays?: number;
}

function formatDate(dateStr: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
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

export function DetailLamaranView({
  application,
  jobData,
  companyName,
  companyInitials,
  locationText,
  logoUrl,
  historyList,
  companySlug,
  slaDaysPassed = 1,
  slaRemainingDays = 13,
}: DetailLamaranViewProps) {
  const { language, t } = useLanguage();
  const locale = language === "en" ? "en-US" : "id-ID";

  const daysPassed = slaDaysPassed;
  const remainingDays = slaRemainingDays;

  return (
    <div className="space-y-8">
      {/* Tombol Kembali */}
      <div>
        <Link
          href="/lamaran-saya"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-black transition min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>{t("Kembali ke Riwayat Lamaran", "Back to Application History")}</span>
        </Link>
      </div>

      {/* Kartu Header Status Lamaran */}
      <section className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-9 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
            {/* Logo Perusahaan */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-black/[0.08] bg-[#FAF8F0] flex items-center justify-center shrink-0 overflow-hidden">
              {logoUrl || getCompanyLogo(companyName) ? (
                <Image
                  src={logoUrl || getCompanyLogo(companyName)!}
                  alt={`Logo ${companyName}`}
                  width={80}
                  height={80}
                  className="w-full h-full object-contain p-2"
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
                  {jobData?.title || t("Posisi Pekerjaan", "Job Position")}
                </h1>
                <StatusBadge status={application.status as ApplicationStatus} />
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 flex-wrap font-medium">
                {companySlug ? (
                  <Link
                    href={`/perusahaan/${companySlug}`}
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
                  <span>{t("Dilamar", "Applied")} {formatDate(application.created_at, locale)}</span>
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
                <span>{t("Buka Halaman Lowongan", "Open Job Page")}</span>
                <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Pemantau Garansi Anti-Ghosting SLA */}
      {(application.status === "dikirim" || application.status === "ditinjau") && (
        <div
          role="region"
          aria-label="Pemantau Batas Waktu Respon Anti-Ghosting"
          className="rounded-[28px] bg-amber-50/80 border border-amber-200/90 p-6 sm:p-7 shadow-card space-y-3"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-800" aria-hidden="true" />
              <span>{t("Garansi Anti-Ghosting JobConnect (SLA 14 Hari)", "JobConnect Anti-Ghosting SLA (14 Days)")}</span>
            </div>
            <span className="text-xs font-bold text-amber-900">
              {remainingDays > 0
                ? t(`Sisa ${remainingDays} Hari Kerja`, `${remainingDays} Working Days Remaining`)
                : t("Melewati Batas Standar Respon", "Exceeded Standard Response Window")}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-black text-amber-950 tracking-tight">
            {remainingDays > 0
              ? t("Lamaran Anda Terlindungi Garansi Respon", "Your Application is Protected by Response SLA")
              : t("Waktu Respon Sedang Diingatkan ke Mitra", "Follow-up Reminder Sent to Employer")}
          </h2>

          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
            {remainingDays > 0
              ? t(
                  `Mitra perusahaan berkomitmen meninjau lamaran dalam 14 hari kerja sejak dikirimkan (${formatDate(application.created_at, locale)}). Anda akan menerima pemberitahuan otomatis jika ada undangan wawancara atau pembaruan status.`,
                  `Employers commit to reviewing applications within 14 working days of submission (${formatDate(application.created_at, locale)}). You will receive automatic alerts for interview invites or status updates.`
                )
              : t(
                  "Lamaran ini telah melampaui batas waktu standar review 14 hari kerja. Sistem telah mengirimkan pengingat notifikasi ke tim rekrutmen perusahaan.",
                  "This application has exceeded the standard 14 working day review window. Our system has flagged a follow-up reminder to the recruiting team."
                )}
          </p>

          {/* Progress Bar SLA 14 Hari */}
          <div className="pt-2">
            <div className="w-full bg-amber-200/80 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  remainingDays > 0 ? "bg-amber-600" : "bg-rose-600"
                }`}
                style={{ width: `${Math.min(100, Math.max(10, (daysPassed / 14) * 100))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-amber-900/80 font-bold mt-1.5">
              <span>{t("Hari 1 (Dikirim)", "Day 1 (Submitted)")}</span>
              <span>{t("Batas Hari ke-14", "Day 14 Deadline")}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pemberitahuan Penting Sesuai Status Terkini */}
      {application.status === "wawancara" && (
        <div
          role="region"
          aria-label="Informasi Jadwal Wawancara"
          className="rounded-[28px] bg-blue-50/90 border border-blue-200/90 p-6 sm:p-7 shadow-card space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200">
            <Video className="w-3.5 h-3.5 text-blue-700" aria-hidden="true" />
            <span>{t("Undangan Wawancara Kerja", "Job Interview Invitation")}</span>
          </div>
          <h2 className="text-lg font-black text-blue-950 tracking-tight">
            {t("Selamat! Anda Diundang ke Tahap Wawancara", "Congratulations! You are Invited to an Interview")}
          </h2>
          <div className="space-y-1.5 text-sm text-blue-900 font-medium">
            <p>
              <span className="font-bold">{t("Waktu Wawancara:", "Interview Time:")} </span>
              {application.interview_at
                ? formatDateTime(application.interview_at, locale)
                : t("Menunggu konfirmasi jam dari perusahaan", "Awaiting time confirmation from employer")}
            </p>
            {application.interview_place && (
              <p>
                <span className="font-bold">{t("Lokasi / Tautan Pertemuan:", "Location / Meeting Link:")} </span>
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
            <span>{t("Keputusan Seleksi", "Selection Decision")}</span>
          </div>
          <h2 className="text-lg font-black text-red-950 tracking-tight">
            {t("Lamaran Belum Dapat Dilanjutkan", "Application Not Moving Forward")}
          </h2>
          <p className="text-sm text-red-900 leading-relaxed font-medium">
            {application.message_to_applicant ||
              t(
                "Terima kasih atas minat Anda. Pihak perusahaan memutuskan untuk melanjutkan proses dengan kandidat lain untuk posisi ini.",
                "Thank you for your interest. The employer has decided to move forward with other candidates for this position."
              )}
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
            <span>{t("Resmi Diterima", "Officially Accepted")}</span>
          </div>
          <h2 className="text-lg font-black text-emerald-950 tracking-tight">
            {t("Selamat! Anda Diterima di", "Congratulations! You have been accepted at")} {companyName}
          </h2>
          <p className="text-sm text-emerald-900 leading-relaxed font-medium">
            {t(
              "Selamat atas keberhasilan Anda! Pihak perusahaan akan segera menghubungi Anda untuk langkah administrasi atau orientasi selanjutnya.",
              "Congratulations on your success! The employer will contact you shortly for onboarding and administration steps."
            )}
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
              {t("Timeline Riwayat Proses", "Process Timeline History")}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {t(
                "Catatan kronologis setiap tahapan seleksi yang diperbarui secara transparan.",
                "Chronological record of each selection stage updated transparently."
              )}
            </p>
          </div>

          {historyList.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" aria-hidden="true" />
              <p className="text-sm font-bold text-slate-800">
                {t("Lamaran Berhasil Terkirim", "Application Successfully Submitted")}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t(
                  "Lamaran Anda saat ini berada dalam antrean peninjauan oleh tim rekruter perusahaan mitra.",
                  "Your application is currently in the review queue by the partner company's recruitment team."
                )}
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
                          {t(label)}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {formatDateTime(item.created_at, locale)}
                        </span>
                        {isLatest && (
                          <span className="px-2 py-0.5 rounded-full bg-black text-[#FFDD00] text-[10px] font-black tracking-wide uppercase">
                            {t("Status Terkini", "Current Status")}
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
              {t("Berkas Lamaran", "Application Files")}
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
                    {t("Berkas CV Terunggah", "CV Document Uploaded")}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {t("Tersimpan di Supabase Storage aman", "Stored securely in cloud storage")}
                  </p>
                </div>
              </div>
            </div>

            {/* Surat Pengantar jika Ada */}
            {application.cover_letter && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {t("Surat Pengantar", "Cover Letter")}
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
  );
}
