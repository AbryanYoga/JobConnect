"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, LogIn } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginSchema } from "@/lib/validation/auth";
import { fieldErrors } from "@/lib/validation/helpers";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationResult = loginSchema.safeParse({
      email,
      password,
    });

    if (!validationResult.success) {
      setErrors(fieldErrors(validationResult.error));
      setIsSubmitting(false);
      return;
    }

    setErrors({});
    setIsSubmitting(false);
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
