import Link from "next/link";
import { FileQuestion, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center flex flex-col items-center">
        {/* Ikon dan Kode Status */}
        <div
          className="w-16 h-16 rounded-full bg-navy-50 text-navy-700 flex items-center justify-center mb-6 shrink-0 shadow-xs"
          aria-hidden="true"
        >
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="text-sm font-semibold tracking-wider uppercase text-navy-600 mb-2">
          Kesalahan 404
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
          Halaman Tidak Ditemukan
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8 max-w-sm">
          Halaman yang Anda tuju tidak tersedia, telah dipindahkan, atau tautan
          yang Anda ikuti salah.
        </p>

        {/* Tombol Tindakan Lanjut */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-control text-sm font-medium text-white bg-navy-700 hover:bg-navy-800 active:bg-navy-900 transition-colors shadow-xs inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </Link>

          <Link
            href="/lowongan"
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-control text-sm font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 hover:text-navy-700 hover:border-slate-400 active:bg-slate-100 transition-colors inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>Cari Lowongan</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
