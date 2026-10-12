import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Masuk ke Akun",
  description:
    "Masuk ke akun JobConnect Anda untuk melihat status lamaran atau mengelola lowongan kerja.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100dvh-8rem)] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#FAF8F0]">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto bg-white rounded-[32px] border border-black/[0.08] shadow-card p-8 sm:p-10 text-center text-slate-500 text-sm font-medium">
            Memuat formulir masuk...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
