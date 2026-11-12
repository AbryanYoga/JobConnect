import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Akun Pencari Kerja",
  description:
    "Daftar akun pencari kerja di JobConnect untuk mulai mencari dan melamar lowongan kerja terverifikasi.",
};

interface RegisterPageProps {
  searchParams: Promise<{ peran?: string; error?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { peran } = await searchParams;

  // Jika parameter peran adalah perusahaan, alihkan ke formulir khusus perusahaan mitra
  if (peran === "perusahaan") {
    redirect("/perusahaan/register");
  }

  return (
    <div className="min-h-[calc(100dvh-8rem)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#FAF8F0]">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto bg-white rounded-[32px] border border-black/[0.08] shadow-card p-8 sm:p-10 text-center text-slate-500 text-sm font-medium">
            Memuat formulir pendaftaran...
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
