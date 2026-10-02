import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          {/* Kolom Kiri: Identitas dan Deskripsi */}
          <div className="max-w-sm">
            <span className="text-lg font-semibold text-white tracking-tight">
              JobConnect
            </span>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Portal lowongan kerja yang mempertemukan pencari kerja dengan
              perusahaan mitra.
            </p>
          </div>

          {/* Kolom Kanan: Tautan Navigasi */}
          <nav aria-label="Navigasi Footer" className="flex flex-col gap-1">
            <Link
              href="/lowongan"
              className="min-h-[44px] inline-flex items-center text-sm font-medium text-slate-100 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 rounded-control"
            >
              Cari Lowongan
            </Link>
            <Link
              href="/wilayah"
              className="min-h-[44px] inline-flex items-center text-sm font-medium text-slate-100 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 rounded-control"
            >
              Jelajah Wilayah
            </Link>
          </nav>
        </div>

        {/* Baris Bawah: Hak Cipta dan Keterangan Proyek */}
        <div className="mt-8 md:mt-10 pt-6 border-t border-navy-800 text-xs text-slate-400">
          <p>
            &copy; {currentYear} JobConnect. Dibuat sebagai tugas proyek RPL,
            SMK Negeri 6 Surakarta.
          </p>
        </div>
      </div>
    </footer>
  );
}
