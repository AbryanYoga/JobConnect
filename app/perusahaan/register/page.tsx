import { Suspense } from "react";
import type { Metadata } from "next";
import { CompanyRegisterForm } from "./CompanyRegisterForm";

export const metadata: Metadata = {
  title: "Daftar Akun Perusahaan Mitra - JobConnect",
  description:
    "Daftarkan perusahaan Anda di JobConnect untuk mulai mempublikasikan lowongan kerja resmi dan merekrut talenta terverifikasi.",
};

export default function CompanyRegisterPage() {
  return (
    <div className="min-h-[calc(100dvh-8rem)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#FAF8F0]">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto bg-white rounded-[32px] border border-black/[0.08] shadow-card p-8 sm:p-10 text-center text-slate-500 text-sm font-medium">
            Memuat formulir pendaftaran perusahaan...
          </div>
        }
      >
        <CompanyRegisterForm />
      </Suspense>
    </div>
  );
}

