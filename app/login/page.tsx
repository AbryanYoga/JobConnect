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
    <div className="min-h-[calc(100dvh-8rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-slate-50">
      <Suspense
        fallback={
          <div className="w-full max-w-md mx-auto bg-white rounded-card border border-slate-200 shadow-sm p-8 text-center text-slate-500 text-sm">
            Memuat formulir masuk...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
