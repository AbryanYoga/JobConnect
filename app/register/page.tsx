import { Suspense } from "react";
import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Akun",
  description:
    "Daftar akun pencari kerja atau perusahaan mitra di JobConnect untuk mulai mencari atau memasang lowongan terverifikasi.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100dvh-8rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-slate-50">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto bg-white rounded-card border border-slate-200 shadow-sm p-8 text-center text-slate-500 text-sm">
            Memuat formulir pendaftaran...
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
