"use client";

import React, { useState } from "react";
import { Download, Printer, Loader2 } from "lucide-react";

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

  const handleExportCsv = () => {
    if (disabled || items.length === 0) return;

    try {
      setIsExportingCsv(true);

      const headers = [
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
            ? "Tidak ada data pada rentang ini. Ekspor dinonaktifkan"
            : "Unduh rekapitulasi data kandidat dalam format CSV"
        }
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs min-h-[38px] ${
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
        <span>Ekspor CSV</span>
      </button>

      <button
        type="button"
        onClick={handlePrintPdf}
        disabled={disabled}
        title={
          disabled
            ? "Tidak ada data pada rentang ini. Ekspor dinonaktifkan"
            : "Cetak dokumen atau simpan sebagai PDF"
        }
        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs min-h-[38px] ${
          disabled
            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            : "bg-[#FFDD00] hover:bg-[#F5D400] text-black border border-black/10 active:scale-95"
        }`}
      >
        <Printer className="w-3.5 h-3.5 text-black" aria-hidden="true" />
        <span>Cetak PDF</span>
      </button>
    </div>
  );
}
