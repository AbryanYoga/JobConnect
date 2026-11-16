"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Percent,
  ExternalLink,
} from "lucide-react";
import {
  AdminLaporanExportButtons,
  type AdminLaporanExportItem,
} from "@/components/admin/AdminLaporanExportButtons";
import { useLanguage } from "@/lib/i18n";

export interface AdminLaporanPerusahaanItem {
  id: number;
  name: string;
  slug: string;
  location: string;
  total: number;
  open: number;
  pending: number;
  rejected: number;
  latestDate: string;
}

export interface AdminLaporanKategoriItem {
  id: number;
  name: string;
  total: number;
  open: number;
}

export interface AdminLaporanJobDetailItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  companyName: string;
  categoryName: string;
}

interface AdminLaporanViewProps {
  startDate: string;
  endDate: string;
  totalLowongan: number;
  lowonganOpen: number;
  lowonganPending: number;
  lowonganRejected: number;
  lowonganClosed: number;
  accRate: number;
  newCompaniesCount: number;
  newUsersCount: number;
  rekapPerusahaan: AdminLaporanPerusahaanItem[];
  rekapKategori: AdminLaporanKategoriItem[];
  jobsList: AdminLaporanJobDetailItem[];
  exportItems: AdminLaporanExportItem[];
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

export function AdminLaporanView({
  startDate,
  endDate,
  totalLowongan,
  lowonganOpen,
  lowonganPending,
  lowonganRejected,
  lowonganClosed,
  accRate,
  newCompaniesCount,
  newUsersCount,
  rekapPerusahaan,
  rekapKategori,
  jobsList,
  exportItems,
  isFiltered,
}: AdminLaporanViewProps) {
  const { t, language } = useLanguage();
  const locale = language === "en" ? "en-US" : "id-ID";

  return (
    <div className="space-y-8">
      {/* Header Khusus Hasil Cetak PDF */}
      <div className="hidden print:block p-4 border-b border-black space-y-1 mb-6">
        <h1 className="text-xl font-bold text-black">JobConnect Moderator</h1>
        <h2 className="text-sm font-semibold text-slate-700">
          {t("Laporan Rekapitulasi Platform & Aktivitas Moderasi Lowongan")}
        </h2>
        <p className="text-xs text-slate-500">
          {language === "en" ? "Period" : "Periode"}: {formatDate(startDate, locale)}{" "}
          {language === "en" ? "to" : "s.d."} {formatDate(endDate, locale)} |{" "}
          {language === "en" ? "Printed on" : "Dicetak pada"}:{" "}
          {formatDate(new Date().toISOString(), locale)}
        </p>
      </div>

      {/* Header Halaman Rekapitulasi Platform */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-[#FFDD00] text-xs font-bold">
              <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t("Rekapitulasi Platform Administrator")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              {t("Rekapitulasi Platform & Moderasi")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              {t(
                "Ringkasan metrik agregat volume lowongan, rasio persetujuan moderasi, dan pertumbuhan mitra platform per rentang tanggal."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              <span className="block font-semibold text-slate-800">
                {t("Rentang Periode")}
              </span>
              <span>
                {formatDate(startDate, locale)} {language === "en" ? "to" : "s.d."}{" "}
                {formatDate(endDate, locale)}
              </span>
            </div>

            <AdminLaporanExportButtons
              items={exportItems}
              startDate={startDate}
              endDate={endDate}
              disabled={jobsList.length === 0}
            />
          </div>
        </div>

        {/* Panel Filter Rentang Tanggal */}
        <form
          method="GET"
          action="/admin/laporan"
          className="pt-4 border-t border-black/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label
              htmlFor="mulai"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              {t("Tanggal Mulai")}
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
              {t("Tanggal Selesai")}
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

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-2xs min-h-[44px] cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-[#FFDD00]" aria-hidden="true" />
              <span>{t("Terapkan Periode")}</span>
            </button>

            {isFiltered && (
              <Link
                href="/admin/laporan"
                className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition min-h-[44px]"
              >
                {t("Reset")}
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Kartu Ringkasan Metrik Platform */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t("Total Diajukan")}</span>
            <FileText className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-black">{totalLowongan}</div>
          <div className="text-[11px] text-slate-500">
            {t("Lowongan periode ini")}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t("Disetujui (ACC)")}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800">
            {lowonganOpen}
          </div>
          <div className="text-[11px] text-slate-500">
            {t("Tayang publik resmi")}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t("Antrean Pending")}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">
            {lowonganPending}
          </div>
          <div className="text-[11px] text-slate-500">
            {t("Menunggu verifikasi")}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t("Tolak / Revisi")}</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800">
            {lowonganRejected}
          </div>
          <div className="text-[11px] text-slate-500">
            {language === "en"
              ? `Conditionally rejected (${lowonganClosed} closed)`
              : `Ditolak bersyarat (${lowonganClosed} ditutup)`}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t("Rasio ACC Rate")}</span>
            <Percent className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{accRate}%</div>
          <div className="text-[11px] text-slate-500">
            {t("Persentase kelolosan")}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t("Pengguna Baru")}</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-950">
            {newUsersCount + newCompaniesCount}
          </div>
          <div className="text-[11px] text-slate-500">
            {language === "en"
              ? `${newCompaniesCount} partners, ${newUsersCount} job seekers`
              : `${newCompaniesCount} mitra, ${newUsersCount} pelamar`}
          </div>
        </div>
      </div>

      {/* Tabel 1: Rekapitulasi per Mitra Perusahaan */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-black">
              {t("Rekapitulasi per Mitra Perusahaan")}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {t(
                "Agregat pengajuan lowongan kerja dan status kurasi masing-masing perusahaan pada periode ini."
              )}
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600">
            {rekapPerusahaan.length} {t("Mitra Aktif")}
          </span>
        </div>

        {rekapPerusahaan.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            {t(
              "Tidak ada aktivitas pengajuan lowongan dari mitra pada periode ini."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-black/[0.08] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pr-4">{t("Nama Perusahaan")}</th>
                  <th className="pb-3 px-3">{t("Domisili Kantor")}</th>
                  <th className="pb-3 px-3 text-center">{t("Total Lowongan")}</th>
                  <th className="pb-3 px-3 text-center">{t("Tayang (Open)")}</th>
                  <th className="pb-3 px-3 text-center">{t("Pending")}</th>
                  <th className="pb-3 px-3 text-center">{t("Ditolak")}</th>
                  <th className="pb-3 pl-3 text-right">{t("Aktivitas Terakhir")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {rekapPerusahaan.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-slate-900">
                      {c.name}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {c.location}
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-black">
                      {c.total}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-emerald-800">
                      {c.open}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-amber-800">
                      {c.pending}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-rose-800">
                      {c.rejected}
                    </td>
                    <td className="py-3.5 pl-3 text-right text-slate-500 whitespace-nowrap text-[11px]">
                      {formatDate(c.latestDate, locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabel 2: Rekapitulasi per Kategori Lowongan */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-lg font-black text-black">
            {t("Distribusi Lowongan Berdasarkan Kategori")}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {t(
              "Sebaran kebutuhan tenaga kerja pada kategori bidang industri platform."
            )}
          </p>
        </div>

        {rekapKategori.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            {t("Belum ada data kategori lowongan pada periode ini.")}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-black/[0.08] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pr-4">{t("Nama Bidang Kategori")}</th>
                  <th className="pb-3 px-3 text-center">{t("Total Lowongan")}</th>
                  <th className="pb-3 px-3 text-center">{t("Lowongan Tayang")}</th>
                  <th className="pb-3 pl-3 text-right">{t("Porsi Platform")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {rekapKategori.map((cat) => {
                  const porsi =
                    totalLowongan > 0
                      ? Math.round((cat.total / totalLowongan) * 100)
                      : 0;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-slate-900">
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-3 text-center font-black text-black">
                        {cat.total}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-800">
                        {cat.open}
                      </td>
                      <td className="py-3.5 pl-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-bold text-slate-700">{porsi}%</span>
                          <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-slate-900 rounded-full"
                              style={{ width: `${porsi}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabel 3: Rincian Seluruh Lowongan dalam Periode */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-black">
              {t("Rincian Pengajuan Lowongan Periode Ini")}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              {t(
                "Riwayat lengkap seluruh lowongan yang masuk dalam rentang tanggal terpilih."
              )}
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {jobsList.length} {t("lowongan tercatat")}
          </span>
        </div>

        {jobsList.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-[#FAF8F0] border border-black/[0.08] space-y-2">
            <BarChart3 className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-black">
              {t("Tidak ada aktivitas platform pada rentang ini.")}
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              {t(
                "Cobalah memilih rentang tanggal yang lebih luas pada filter di atas."
              )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-black/[0.08] text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3 pr-2 w-10">No</th>
                  <th className="pb-3 px-3">{t("Tanggal Pengajuan")}</th>
                  <th className="pb-3 px-3">{t("Judul Lowongan")}</th>
                  <th className="pb-3 px-3">{t("Perusahaan Mitra")}</th>
                  <th className="pb-3 px-3">{t("Kategori")}</th>
                  <th className="pb-3 px-3">{t("Status")}</th>
                  <th className="pb-3 pl-3 text-right">{t("Aksi")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {jobsList.map((job, index) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pr-2 text-slate-400 font-mono text-[11px]">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      {formatDate(job.created_at, locale)}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">
                      {job.title}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {job.companyName}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {job.categoryName}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-sm text-[11px] font-bold ${
                          job.status === "open"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : job.status === "pending"
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : job.status === "rejected"
                            ? "bg-rose-50 text-rose-800 border border-rose-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {job.status === "open"
                          ? t("Tayang")
                          : job.status === "pending"
                          ? t("Menunggu Moderasi")
                          : job.status === "rejected"
                          ? t("Ditolak")
                          : job.status}
                      </span>
                    </td>
                    <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                      <Link
                        href={`/lowongan/${job.slug}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 hover:text-black hover:underline"
                      >
                        <span>{t("Buka Detail")}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
