"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  Filter,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  ChevronRight,
  ArrowRightLeft,
  Building2,
  ShieldCheck,
} from "lucide-react";
import {
  LaporanExportButtons,
  type LaporanExportItem,
} from "@/components/mitra/LaporanExportButtons";
import { useLanguage } from "@/lib/i18n";

export interface RekapLowonganItem {
  id: number;
  title: string;
  status: string;
  total: number;
  dalamProses: number;
  diterima: number;
  ditolak: number;
}

export interface ApplicationDetailItem {
  id: number;
  job_id: number;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  decided_at: string | null;
  applicant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  jobTitle?: string;
}

export interface CompanyInfo {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  industry?: string | null;
  location?: string | null;
  addressNote?: string | null;
}

export interface SimpleJobOption {
  id: number;
  title: string;
}

interface MitraLaporanViewProps {
  company: CompanyInfo;
  startDate: string;
  endDate: string;
  selectedJobId: number | null;
  jobsList: SimpleJobOption[];
  totalPelamar: number;
  dalamProses: number;
  diterima: number;
  ditolak: number;
  rekapLowongan: RekapLowonganItem[];
  applications: ApplicationDetailItem[];
  exportItems: LaporanExportItem[];
  isFiltered: boolean;
}

function formatDate(dateStr: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatStatusText(status: string, language: string): string {
  if (language === "en") {
    switch (status) {
      case "dikirim":
        return "Submitted";
      case "ditinjau":
        return "Under Review";
      case "shortlist":
        return "Shortlisted";
      case "wawancara":
        return "Interview";
      case "ditawari":
        return "Offered";
      case "diterima":
        return "Accepted";
      case "ditolak":
        return "Rejected";
      case "ditarik":
        return "Withdrawn";
      case "open":
        return "Live";
      case "pending":
        return "Pending";
      case "closed":
        return "Closed";
      default:
        return status;
    }
  }
  switch (status) {
    case "dikirim":
      return "Dikirim";
    case "ditinjau":
      return "Ditinjau";
    case "shortlist":
      return "Shortlist";
    case "wawancara":
      return "Wawancara";
    case "ditawari":
      return "Ditawari";
    case "diterima":
      return "Diterima";
    case "ditolak":
      return "Ditolak";
    case "ditarik":
      return "Ditarik";
    case "open":
      return "Tayang";
    case "pending":
      return "Menunggu ACC";
    case "closed":
      return "Ditutup";
    default:
      return status;
  }
}

export function MitraLaporanView({
  company,
  startDate,
  endDate,
  selectedJobId,
  jobsList,
  totalPelamar,
  dalamProses,
  diterima,
  ditolak,
  rekapLowongan,
  applications,
  exportItems,
  isFiltered,
}: MitraLaporanViewProps) {
  const { t, language } = useLanguage();
  const locale = language === "en" ? "en-US" : "id-ID";

  const selectedJobTitle =
    jobsList.find((j) => j.id === selectedJobId)?.title ||
    (language === "en" ? "All Job Positions" : "Semua Posisi Lowongan");

  const documentRefNumber = `JC-REP/${new Date().getFullYear()}/${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}/${company.id}-${startDate.replace(/-/g, "").slice(2)}`;

  return (
    <>
      {/* ============================================================== */}
      {/* 1. TAMPILAN RESMI KHUSUS CETAK PDF / PRINT (@media print)      */}
      {/* ============================================================== */}
      <div className="hidden print:block font-sans text-slate-900 bg-white text-xs leading-relaxed">
        {/* CSS Khusus Print untuk Memastikan Format Kertas A4 Rapi */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm 12mm 12mm 12mm;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              background: #ffffff !important;
              color: #0f172a !important;
            }
            .page-break-inside-avoid {
              break-inside: avoid;
              page-break-inside: avoid;
            }
          }
        ` }} />

        {/* Kop Surat Dokumen Resmi */}
        <header className="pb-3 border-b-2 border-slate-900 border-double">
          <div className="flex items-start justify-between gap-4">
            {/* Sisi Kiri: Logo & Nama Perusahaan Mitra */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-slate-300 p-1 flex items-center justify-center shrink-0 overflow-hidden bg-white">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt={company.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Mitra Resmi Terverifikasi JobConnect</span>
                </div>
                <h1 className="text-lg font-black text-slate-950 uppercase tracking-tight">
                  {company.name}
                </h1>
                <p className="text-[10px] text-slate-600 max-w-md font-medium">
                  {company.addressNote ? `${company.addressNote}, ` : ""}
                  {company.location || "Indonesia"}
                  {company.industry ? ` | Sektor: ${company.industry}` : ""}
                </p>
              </div>
            </div>

            {/* Sisi Kanan: Metadata Identitas Berkas Laporan */}
            <div className="text-right space-y-0.5 shrink-0">
              <div className="text-[11px] font-black tracking-wider text-slate-900 uppercase">
                JobConnect Recruitment Report
              </div>
              <div className="text-[10px] font-mono text-slate-600">
                No: <span className="font-bold text-slate-900">{documentRefNumber}</span>
              </div>
              <div className="text-[10px] text-slate-600">
                Dicetak: <span className="font-semibold text-slate-900">{formatDate(new Date().toISOString(), locale)}</span>
              </div>
              <div className="inline-block mt-1 px-2 py-0.5 rounded-sm bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider">
                Dokumen Resmi Terverifikasi
              </div>
            </div>
          </div>
        </header>

        {/* Judul Laporan & Subtitel */}
        <div className="my-4 text-center space-y-1">
          <h2 className="text-base font-black text-slate-950 uppercase tracking-wide">
            Laporan Rekapitulasi Pelamar & Status Seleksi Kandidat
          </h2>
          <p className="text-[11px] text-slate-600 font-medium">
            Rekapitulasi performa penyerapan tenaga kerja, sebaran berkas masuk, dan alur kurasi kandidat.
          </p>
        </div>

        {/* Bar Metadata Parameter Laporan */}
        <div className="grid grid-cols-4 gap-2 p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-[10px] mb-4">
          <div>
            <span className="text-slate-500 block font-semibold uppercase tracking-wider text-[9px]">
              Rentang Periode
            </span>
            <span className="font-bold text-slate-900">
              {formatDate(startDate, locale)} s.d. {formatDate(endDate, locale)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold uppercase tracking-wider text-[9px]">
              Filter Posisi
            </span>
            <span className="font-bold text-slate-900 truncate block">
              {selectedJobTitle}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold uppercase tracking-wider text-[9px]">
              Total Kandidat Terdata
            </span>
            <span className="font-bold text-slate-900">
              {totalPelamar} Berkas Lamaran
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-semibold uppercase tracking-wider text-[9px]">
              Kepatuhan Integritas
            </span>
            <span className="font-bold text-emerald-800">
              100% Bebas Pungutan & Calo
            </span>
          </div>
        </div>

        {/* Ringkasan Indikator Kunci (4 Kotak KPI Eksekutif) */}
        <div className="grid grid-cols-4 gap-3 mb-5 page-break-inside-avoid">
          <div className="p-3 rounded-lg border border-slate-300 bg-slate-50/50 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-600 block uppercase tracking-wider">
              Total Pelamar
            </span>
            <div className="text-xl font-black text-slate-950">{totalPelamar}</div>
            <div className="text-[9px] text-slate-500 font-medium">
              Seluruh berkas masuk periode ini
            </div>
          </div>

          <div className="p-3 rounded-lg border border-amber-300 bg-amber-50/40 space-y-0.5">
            <span className="text-[10px] font-bold text-amber-900 block uppercase tracking-wider">
              Dalam Proses Seleksi
            </span>
            <div className="text-xl font-black text-amber-950">{dalamProses}</div>
            <div className="text-[9px] text-amber-800 font-medium">
              Tahap review, shortlist & wawancara
            </div>
          </div>

          <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50/40 space-y-0.5">
            <span className="text-[10px] font-bold text-emerald-900 block uppercase tracking-wider">
              Lolos Seleksi
            </span>
            <div className="text-xl font-black text-emerald-950">{diterima}</div>
            <div className="text-[9px] text-emerald-800 font-medium">
              Kandidat ditawari / resmi diterima
            </div>
          </div>

          <div className="p-3 rounded-lg border border-rose-300 bg-rose-50/40 space-y-0.5">
            <span className="text-[10px] font-bold text-rose-900 block uppercase tracking-wider">
              Belum Lolos / Ditarik
            </span>
            <div className="text-xl font-black text-rose-950">{ditolak}</div>
            <div className="text-[9px] text-rose-800 font-medium">
              Belum sesuai kriteria / ditarik
            </div>
          </div>
        </div>

        {/* BAGIAN 1: Tabel Rekapitulasi per Posisi Lowongan */}
        <section className="mb-5 page-break-inside-avoid">
          <h3 className="text-xs font-black text-slate-950 uppercase tracking-wide pb-1.5 mb-2 border-b border-slate-300">
            1. Agregat Perolehan Kandidat per Posisi Pekerjaan
          </h3>

          {rekapLowongan.length === 0 ? (
            <div className="py-4 text-center text-slate-500 text-[10px] italic">
              Tidak ada data posisi lowongan pada periode ini.
            </div>
          ) : (
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2 px-2 w-8 text-center">No</th>
                  <th className="py-2 px-3">Judul Posisi Lowongan</th>
                  <th className="py-2 px-3 text-center w-24">Status</th>
                  <th className="py-2 px-3 text-center w-24">Total Pelamar</th>
                  <th className="py-2 px-3 text-center w-24">Dalam Proses</th>
                  <th className="py-2 px-3 text-center w-20">Lolos</th>
                  <th className="py-2 px-3 text-center w-20">Ditolak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rekapLowongan.map((item, idx) => (
                  <tr key={item.id} className="page-break-inside-avoid">
                    <td className="py-1.5 px-2 text-center text-slate-500 font-mono text-[9px]">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-950">
                      {item.title}
                    </td>
                    <td className="py-1.5 px-3 text-center">
                      <span className="font-semibold text-slate-700 uppercase text-[9px]">
                        {formatStatusText(item.status, "id")}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-center font-bold text-slate-950">
                      {item.total}
                    </td>
                    <td className="py-1.5 px-3 text-center text-amber-900 font-medium">
                      {item.dalamProses}
                    </td>
                    <td className="py-1.5 px-3 text-center text-emerald-900 font-semibold">
                      {item.diterima}
                    </td>
                    <td className="py-1.5 px-3 text-center text-rose-900 font-medium">
                      {item.ditolak}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 bg-slate-100 font-bold text-slate-950">
                  <td colSpan={3} className="py-2 px-3 text-right uppercase tracking-wider text-[9px]">
                    Total Akumulasi
                  </td>
                  <td className="py-2 px-3 text-center font-black">{totalPelamar}</td>
                  <td className="py-2 px-3 text-center text-amber-950">{dalamProses}</td>
                  <td className="py-2 px-3 text-center text-emerald-950">{diterima}</td>
                  <td className="py-2 px-3 text-center text-rose-950">{ditolak}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        {/* BAGIAN 2: Tabel Rincian Kandidat Pelamar */}
        <section className="mb-6">
          <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-300">
            <h3 className="text-xs font-black text-slate-950 uppercase tracking-wide">
              2. Rincian Rekapitulasi Berkas Pelamar Masuk
            </h3>
            <span className="text-[10px] font-semibold text-slate-600">
              Total {applications.length} Kandidat Tercatat
            </span>
          </div>

          {applications.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-[10px] italic">
              Tidak ada pelamar yang masuk pada rentang waktu ini.
            </div>
          ) : (
            <table className="w-full text-left text-[10px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-y-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wider text-[9px]">
                  <th className="py-2 px-2 w-8 text-center">No</th>
                  <th className="py-2 px-3 w-24">Tanggal Lamar</th>
                  <th className="py-2 px-3">Nama Lengkap Pelamar</th>
                  <th className="py-2 px-3">Kontak Pelamar</th>
                  <th className="py-2 px-3">Posisi Lowongan</th>
                  <th className="py-2 px-3 text-right w-24">Status Seleksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {applications.map((app, idx) => (
                  <tr key={app.id} className="page-break-inside-avoid">
                    <td className="py-1.5 px-2 text-center text-slate-500 font-mono text-[9px]">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-3 text-slate-700 whitespace-nowrap text-[9px]">
                      {formatDate(app.created_at, locale)}
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-950">
                      {app.applicant?.name || "Nama Tidak Tersedia"}
                    </td>
                    <td className="py-1.5 px-3 text-slate-700 font-mono text-[9px]">
                      <div>{app.applicant?.email || "-"}</div>
                      <div className="text-slate-500">{app.applicant?.phone || "-"}</div>
                    </td>
                    <td className="py-1.5 px-3 font-medium text-slate-800">
                      {app.jobTitle || "-"}
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      <span className="inline-block px-1.5 py-0.5 rounded border border-slate-300 font-bold text-[9px] uppercase tracking-wide">
                        {formatStatusText(app.status, "id")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* BAGIAN 3: Pakta Integritas & Kolom Pengesahan Laporan */}
        <footer className="pt-3 border-t-2 border-slate-900 page-break-inside-avoid space-y-4">
          <div className="p-2.5 rounded-lg border border-slate-300 bg-slate-50 text-[9px] text-slate-700 leading-normal">
            <strong>Pakta Integritas Rekrutmen Bebas Pungli:</strong> Seluruh informasi yang termuat dalam laporan ini adalah rekapitulasi sah dari aktivitas lowongan kerja resmi di platform JobConnect Indonesia. Perusahaan mitra menyatakan bahwa proses seleksi dilaksanakan secara transparan, profesional, dan bebas dari pungutan liar, biaya perantara, serta calo tenaga kerja sesuai dengan ketentuan perundang-undangan ketenagakerjaan yang berlaku.
          </div>

          <div className="grid grid-cols-2 gap-8 pt-2 text-[10px]">
            {/* Sisi Kiri: Verifikasi Sistem */}
            <div className="space-y-1">
              <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                Diverifikasi Oleh Sistem:
              </div>
              <div className="font-black text-slate-950">
                Platform Moderator JobConnect Indonesia
              </div>
              <p className="text-[9px] text-slate-500">
                Sistem Integritas Rekrutmen Terverifikasi
                <br />
                Token Keamanan: {documentRefNumber}
              </p>
              <div className="pt-6 font-mono text-[9px] text-slate-400">
                [ Terverifikasi Secara Digital ]
              </div>
            </div>

            {/* Sisi Kanan: Penanggung Jawab Perusahaan Mitra */}
            <div className="text-right space-y-1">
              <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                Penanggung Jawab Perusahaan:
              </div>
              <div className="font-black text-slate-950 uppercase">
                {company.name}
              </div>
              <p className="text-[9px] text-slate-500">
                Divisi Manajemen Sumber Daya Manusia (HRD)
                <br />
                {company.location || "Indonesia"}
              </p>
              <div className="pt-6 text-slate-400 text-[9px]">
                ( ............................................................. )
                <br />
                <span className="text-[8px] text-slate-400">Tanda Tangan & Cap Stempel Resmi</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ============================================================== */}
      {/* 2. TAMPILAN WEB INTERAKTIF (print:hidden)                       */}
      {/* ============================================================== */}
      <div className="space-y-8 print:hidden">
        {/* Header Halaman Laporan Web */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-[#FFDD00] text-xs font-bold">
                <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t("Laporan Operasional Rekrutmen", "Recruitment Operational Report")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                {t("Laporan Rekapitulasi Pelamar", "Applicant Summary Report")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {t(
                  "Data rekapitulasi pengajuan lamaran, alur seleksi, dan keputusan kandidat per rentang tanggal.",
                  "Summary data of applications, selection workflow, and candidate decisions by date range."
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                <span className="block font-semibold text-slate-800">
                  {t("Rentang Aktif", "Active Date Range")}
                </span>
                <span>
                  {formatDate(startDate, locale)} {language === "en" ? "to" : "s.d."} {formatDate(endDate, locale)}
                </span>
              </div>

              <LaporanExportButtons
                items={exportItems}
                companyName={company.name}
                startDate={startDate}
                endDate={endDate}
                disabled={applications.length === 0}
              />
            </div>
          </div>

          {/* Panel Filter Rentang Tanggal dan Pilihan Lowongan */}
          <form
            method="GET"
            action="/mitra/laporan"
            className="pt-4 border-t border-black/[0.06] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label
                htmlFor="mulai"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                {t("Tanggal Mulai", "Start Date")}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  id="mulai"
                  name="mulai"
                  defaultValue={startDate}
                  max={endDate}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="selesai"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                {t("Tanggal Selesai", "End Date")}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  id="selesai"
                  name="selesai"
                  defaultValue={endDate}
                  min={startDate}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="lowongan"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                {t("Posisi Lowongan", "Job Position")}
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="lowongan"
                  name="lowongan"
                  defaultValue={selectedJobId ? String(selectedJobId) : ""}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white truncate"
                >
                  <option value="">{t("Semua Posisi Lowongan", "All Job Positions")}</option>
                  {jobsList.map((job) => (
                    <option key={job.id} value={String(job.id)}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition shadow-2xs min-h-[44px] cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-[#FFDD00]" aria-hidden="true" />
                <span>{t("Terapkan Filter", "Apply Filter")}</span>
              </button>

              {isFiltered && (
                <Link
                  href="/mitra/laporan"
                  className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition min-h-[44px]"
                >
                  {t("Reset", "Reset")}
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Kartu Ringkasan Metrik Rekapitulasi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">{t("Total Pelamar Masuk", "Total Applicants")}</span>
              <Users className="w-4 h-4 text-slate-700" />
            </div>
            <div className="text-2xl font-black text-black">{totalPelamar}</div>
            <div className="text-[11px] text-slate-500">
              {t("Pada rentang tanggal yang dipilih", "During selected date range")}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">{t("Dalam Proses Seleksi", "In Selection Process")}</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-900">{dalamProses}</div>
            <div className="text-[11px] text-slate-500">
              {t("Status review, shortlist, atau wawancara", "Review, shortlist, or interview")}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">{t("Diterima / Ditawari", "Accepted / Offered")}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-800">{diterima}</div>
            <div className="text-[11px] text-slate-500">
              {t("Kandidat berhasil lolos seleksi", "Candidates passed selection")}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">{t("Ditolak / Ditarik", "Rejected / Withdrawn")}</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-800">{ditolak}</div>
            <div className="text-[11px] text-slate-500">
              {t("Belum sesuai kriteria atau ditarik", "Not matching criteria or withdrawn")}
            </div>
          </div>
        </div>

        {/* Tabel 1: Rekapitulasi Berdasarkan Lowongan */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-black">
                {t("Rekapitulasi per Posisi Lowongan", "Breakdown by Job Position")}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {t(
                  "Statistik perolehan pelamar pada masing-masing posisi pekerjaan aktif.",
                  "Applicant statistics for each active job vacancy position."
                )}
              </p>
            </div>
          </div>

          {rekapLowongan.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              {t("Belum ada lowongan pekerjaan yang dibuat.", "No job vacancies posted yet.")}
            </div>
          ) : (
            <div>
              <div className="text-[11px] text-slate-500 font-medium sm:hidden flex items-center gap-1.5 pb-2">
                <ArrowRightLeft className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                <span>{t("Geser tabel untuk melihat seluruh data", "Scroll table horizontally to view full data")}</span>
              </div>
              <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                <table className="w-full text-left text-xs min-w-[580px]">
                  <thead>
                    <tr className="border-b border-black/[0.08] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="pb-3 pr-4">{t("Judul Lowongan", "Job Title")}</th>
                      <th className="pb-3 px-3">{t("Status", "Status")}</th>
                      <th className="pb-3 px-3 text-center">{t("Total Pelamar", "Total Applicants")}</th>
                      <th className="pb-3 px-3 text-center">{t("Dalam Proses", "In Process")}</th>
                      <th className="pb-3 px-3 text-center">{t("Diterima", "Accepted")}</th>
                      <th className="pb-3 px-3 text-center">{t("Ditolak", "Rejected")}</th>
                      <th className="pb-3 pl-3 text-right">{t("Kelola", "Manage")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {rekapLowongan.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 pr-4 font-bold text-slate-900">
                          {item.title}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-sm text-[11px] font-bold ${
                              item.status === "open"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : item.status === "pending"
                                ? "bg-amber-50 text-amber-900 border border-amber-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {formatStatusText(item.status, language)}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-bold text-black">
                          {item.total}
                        </td>
                        <td className="py-3.5 px-3 text-center text-amber-800 font-semibold">
                          {item.dalamProses}
                        </td>
                        <td className="py-3.5 px-3 text-center text-emerald-800 font-semibold">
                          {item.diterima}
                        </td>
                        <td className="py-3.5 px-3 text-center text-rose-800 font-semibold">
                          {item.ditolak}
                        </td>
                        <td className="py-3.5 pl-3 text-right">
                          <Link
                            href={`/mitra/lowongan/${item.id}/pelamar`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 hover:text-black hover:underline min-h-[44px]"
                          >
                            <span>{t("Lihat Pelamar", "View Applicants")}</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Tabel 2: Rincian Daftar Pelamar Lengkap */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-4 sm:p-6 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-black">
                {t("Daftar Rekapitulasi Kandidat Pelamar", "Applicant Candidate Records")}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {t(
                  "Riwayat lengkap berkas pelamar yang masuk pada rentang waktu yang ditentukan.",
                  "Full history of candidate applications received during the selected date range."
                )}
              </p>
            </div>

            <div className="text-xs text-slate-600 font-semibold">
              {applications.length} {t("berkas ditemukan", "records found")}
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-[#FAF8F0] border border-black/[0.08] space-y-2">
              <BarChart3 className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-black">
                {t("Tidak ada data pada rentang ini.", "No data found for this date range.")}
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                {t(
                  "Cobalah memilih rentang tanggal yang lebih luas atau pilih lowongan lain pada formulir filter di atas.",
                  "Try choosing a broader date range or select another job from the filter above."
                )}
              </p>
            </div>
          ) : (
            <div>
              <div className="text-[11px] text-slate-500 font-medium sm:hidden flex items-center gap-1.5 pb-2">
                <ArrowRightLeft className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                <span>{t("Geser tabel untuk melihat seluruh data", "Scroll table horizontally to view full data")}</span>
              </div>
              <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-black/[0.08] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="pb-3 pr-2 w-10">No</th>
                      <th className="pb-3 px-3">{t("Tanggal Melamar", "Application Date")}</th>
                      <th className="pb-3 px-3">{t("Nama Pelamar", "Applicant Name")}</th>
                      <th className="pb-3 px-3">{t("Kontak", "Contact")}</th>
                      <th className="pb-3 px-3">{t("Posisi Lowongan", "Job Position")}</th>
                      <th className="pb-3 px-3">{t("Status Seleksi", "Selection Status")}</th>
                      <th className="pb-3 pl-3 text-right">{t("Aksi", "Action")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {applications.map((app, index) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 pr-2 text-slate-400 font-mono text-[11px]">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                          {formatDate(app.created_at, locale)}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          {app.applicant?.name || t("Nama Tidak Tersedia", "Name not available")}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          <div>{app.applicant?.email || "-"}</div>
                          <div className="text-[11px] text-slate-400">{app.applicant?.phone || "-"}</div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 font-medium">
                          {app.jobTitle || "-"}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-sm text-[11px] font-bold ${
                              ["diterima", "ditawari"].includes(app.status)
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : ["dikirim", "ditinjau", "shortlist", "wawancara"].includes(app.status)
                                ? "bg-amber-50 text-amber-900 border border-amber-200"
                                : ["ditolak", "ditarik"].includes(app.status)
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {formatStatusText(app.status, language)}
                          </span>
                        </td>
                        <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                          <Link
                            href={`/mitra/pelamar/${app.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 hover:text-black hover:underline min-h-[44px]"
                          >
                            <span>{t("Detail Berkas", "View Application")}</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
