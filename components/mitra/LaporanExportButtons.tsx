"use client";

import React, { useState } from "react";
import { Download, Printer, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export interface LaporanExportItem {
  no: number;
  tanggalMelamar: string;
  namaPelamar: string;
  email: string;
  telepon: string;
  posisiLowongan: string;
  statusSeleksi: string;
  tanggalUpdate: string;
}

interface LaporanExportButtonsProps {
  items: LaporanExportItem[];
  companyName: string;
  startDate: string;
  endDate: string;
  disabled?: boolean;
}

export function LaporanExportButtons({
  items,
  companyName,
  startDate,
  endDate,
  disabled = false,
}: LaporanExportButtonsProps) {
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const { t, language } = useLanguage();

  const handleExportCsv = () => {
    if (disabled || items.length === 0) return;

    try {
      setIsExportingCsv(true);

      const headers =
        language === "en"
          ? [
              "No",
              "Application Date",
              "Applicant Name",
              "Email",
              "Phone Number",
              "Job Position",
              "Selection Status",
              "Last Updated",
            ]
          : [
              "No",
              "Tanggal Melamar",
              "Nama Pelamar",
              "Email",
              "Nomor Telepon",
              "Posisi Lowongan",
              "Status Seleksi",
              "Pembaruan Terakhir",
            ];

      const csvRows = items.map((item) => [
        item.no,
        `"${item.tanggalMelamar.replace(/"/g, '""')}"`,
        `"${item.namaPelamar.replace(/"/g, '""')}"`,
        `"${item.email.replace(/"/g, '""')}"`,
        `"${(item.telepon || "-").replace(/"/g, '""')}"`,
        `"${item.posisiLowongan.replace(/"/g, '""')}"`,
        `"${item.statusSeleksi.replace(/"/g, '""')}"`,
        `"${item.tanggalUpdate.replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        "\uFEFF" +
        [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cleanCompanySlug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `laporan-pelamar-${cleanCompanySlug}-${startDate}-sd-${endDate}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handlePrintPdf = () => {
    if (disabled || items.length === 0) return;
    window.print();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <button
        type="button"
        onClick={handleExportCsv}
        disabled={disabled || isExportingCsv}
        title={
          disabled
            ? language === "en"
              ? "No data in this date range. Export disabled."
              : "Tidak ada data pada rentang ini. Ekspor dinonaktifkan."
            : t("Unduh rekapitulasi data kandidat dalam format CSV", "Download candidate summary in CSV format")
        }
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs min-h-[44px] cursor-pointer ${
          disabled
            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            : "bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 active:scale-95"
        }`}
      >
        {isExportingCsv ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
        ) : (
          <Download className="w-3.5 h-3.5 text-slate-600" aria-hidden="true" />
        )}
        <span>{t("Ekspor CSV", "Export CSV")}</span>
      </button>

      <button
        type="button"
        onClick={handlePrintPdf}
        disabled={disabled}
        title={
          disabled
            ? language === "en"
              ? "No data in this date range. Print disabled."
              : "Tidak ada data pada rentang ini. Ekspor dinonaktifkan."
            : t("Cetak dokumen atau simpan sebagai PDF", "Print document or save as PDF")
        }
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs min-h-[44px] cursor-pointer ${
          disabled
            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            : "bg-[#FFDD00] hover:bg-[#F5D400] text-black border border-black/10 active:scale-95"
        }`}
      >
        <Printer className="w-3.5 h-3.5 text-black" aria-hidden="true" />
        <span>{t("Cetak PDF", "Print PDF")}</span>
      </button>
    </div>
  );
}
