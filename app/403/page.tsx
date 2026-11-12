import type { Metadata } from "next";
import { ShieldAlert, Home, LogIn } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Akses Ditolak | JobConnect",
  description: "Anda tidak memiliki hak akses untuk membuka halaman ini.",
};

interface ForbiddenPageProps {
  searchParams?: Promise<{
    reason?: string;
  }>;
}

export default async function ForbiddenPage({
  searchParams,
}: ForbiddenPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const reason = resolvedParams.reason;

  let message =
    "Akun Anda tidak memiliki izin atau peran yang sesuai untuk membuka area halaman ini. Pastikan Anda telah masuk dengan kredensial yang tepat.";

  if (reason === "pelamar_cannot_access_mitra") {
    message =
      "Anda sedang masuk sebagai akun Pencari Kerja. Area portal perusahaan hanya dapat diakses oleh akun Mitra Perusahaan. Silakan keluar akun (logout) terlebih dahulu jika ingin mendaftar atau mengelola akun perusahaan.";
  } else if (reason === "company_cannot_access_pelamar") {
    message =
      "Anda sedang masuk sebagai akun Mitra Perusahaan. Area ini khusus untuk akun Pencari Kerja. Silakan gunakan dashboard mitra untuk mengelola lowongan dan pelamar.";
  }

  return (
    <main
      id="main-content"
      className="min-h-[calc(100vh-4rem)] bg-[#FAF8F0] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-white rounded-[32px] border border-black/[0.08] shadow-card p-6 sm:p-8 space-y-6">
          {/* Ikon Peringatan Otorisasi */}
          <div className="mx-auto w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs">
            <ShieldAlert className="w-8 h-8" aria-hidden="true" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 text-xs font-semibold border border-red-200">
              <span>Status 403</span>
            </div>
            <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
              Akses Ditolak
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              {message}
            </p>
          </div>

          {/* Opsi Aksi Pengguna */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <ButtonLink
              href="/"
              variant="primary"
              size="md"
              fullWidth
              leftIcon={<Home className="w-4 h-4" aria-hidden="true" />}
            >
              Kembali ke Beranda
            </ButtonLink>

            <ButtonLink
              href="/auth/logout"
              variant="outline"
              size="md"
              fullWidth
              leftIcon={<LogIn className="w-4 h-4" aria-hidden="true" />}
            >
              Ganti Akun
            </ButtonLink>
          </div>
        </div>
      </div>
    </main>
  );
}
