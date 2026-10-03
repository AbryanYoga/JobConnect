"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, ArrowRight, LogIn, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation/auth";
import { fieldErrors } from "@/lib/validation/helpers";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const validationResult = loginSchema.safeParse({
      email,
      password,
    });

    if (!validationResult.success) {
      setErrors(fieldErrors(validationResult.error));
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validationResult.data.email,
        password: validationResult.data.password,
      });

      if (error) {
        const lowerMsg = error.message.toLowerCase();
        if (
          lowerMsg.includes("invalid login credentials") ||
          lowerMsg.includes("invalid_grant") ||
          lowerMsg.includes("wrong password")
        ) {
          setServerError("Email atau kata sandi yang Anda masukkan salah.");
        } else if (lowerMsg.includes("email not confirmed")) {
          setServerError(
            "Email Anda belum dikonfirmasi. Silakan periksa kotak masuk email Anda."
          );
        } else {
          setServerError(
            error.message || "Gagal masuk ke akun. Silakan coba beberapa saat lagi."
          );
        }
        setIsSubmitting(false);
        return;
      }

      // Ambil data profil untuk menentukan pengalihan berdasarkan peran
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      router.refresh();

      // Pengalihan berdasarkan parameter redirectTo atau peran akun
      if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
        router.push(redirectTo);
      } else if (profile?.role === "admin") {
        router.push("/admin");
      } else if (profile?.role === "company") {
        router.push("/mitra");
      } else {
        router.push("/profil");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi gangguan koneksi saat masuk. Silakan coba lagi.";
      setServerError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-card border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Header Kartu Masuk */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-medium mb-3 border border-navy-100">
            <LogIn className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
            <span>Portal Masuk Akun</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
            Selamat Datang Kembali
          </h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Masuk untuk melanjutkan lamaran atau mengelola lowongan kerja Anda.
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="p-3.5 rounded-control bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 mb-4"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" aria-hidden="true" />
            <span className="leading-snug">{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Input Alamat Email */}
          <Input
            id="login-email"
            label="Alamat Email"
            required
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
            }}
            error={errors.email}
          />

          {/* Input Kata Sandi */}
          <Input
            id="login-password"
            label="Kata Sandi"
            required
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan kata sandi akun Anda"
            leftIcon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={errors.password}
          />

          {/* Tombol Submit Masuk */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
              className="gap-2 font-medium"
            >
              <span>Masuk ke Akun</span>
            </Button>
          </div>
        </form>

        {/* Tautan ke Pendaftaran */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Belum memiliki akun JobConnect?{" "}
            <Link
              href="/register"
              className="font-semibold text-navy-700 hover:text-navy-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 rounded-xs"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
