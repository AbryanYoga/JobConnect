"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User, Building2, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerSchema, type Peran } from "@/lib/validation/auth";
import { fieldErrors } from "@/lib/validation/helpers";

export function RegisterForm() {
  const searchParams = useSearchParams();
  const initialPeran: Peran =
    searchParams.get("peran") === "perusahaan" ? "perusahaan" : "pelamar";

  const [peran, setPeran] = useState<Peran>(initialPeran);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationResult = registerSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      peran,
    });

    if (!validationResult.success) {
      setErrors(fieldErrors(validationResult.error));
      setIsSubmitting(false);
      return;
    }

    setErrors({});
    setIsSubmitting(false);
  };

  const isCompany = peran === "perusahaan";

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header Kartu Pendaftaran */}
      <div className="bg-white rounded-card border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-medium mb-3 border border-navy-100">
            <ShieldCheck className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
            <span>Pendaftaran Akun Terverifikasi</span>
          </div>
          <h1 className="text-2xl font-bold text-navy-950 tracking-tight">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Pilih peran Anda dan mulai temukan lowongan atau pasang lowongan kerja.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Pemilihan Peran (Segmented Radio Cards) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Daftar Sebagai
            </label>
            <div
              className="grid grid-cols-2 gap-3"
              role="radiogroup"
              aria-label="Pilihan Peran Pendaftaran"
            >
              <button
                type="button"
                role="radio"
                aria-checked={peran === "pelamar"}
                onClick={() => {
                  setPeran("pelamar");
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                className={`flex flex-col items-start p-3.5 rounded-card border text-left transition-all min-h-[5.25rem] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 ${
                  peran === "pelamar"
                    ? "border-navy-600 bg-navy-50/70 text-navy-950 ring-1 ring-navy-600 shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-control flex items-center justify-center shrink-0 ${
                      peran === "pelamar"
                        ? "bg-navy-700 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="font-semibold text-sm">Pelamar</span>
                </div>
                <span className="text-xs text-slate-500 leading-snug">
                  Cari dan lamar lowongan kerja
                </span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={peran === "perusahaan"}
                onClick={() => {
                  setPeran("perusahaan");
                  if (errors.name) {
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }
                }}
                className={`flex flex-col items-start p-3.5 rounded-card border text-left transition-all min-h-[5.25rem] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 ${
                  peran === "perusahaan"
                    ? "border-navy-600 bg-navy-50/70 text-navy-950 ring-1 ring-navy-600 shadow-xs"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-control flex items-center justify-center shrink-0 ${
                      peran === "perusahaan"
                        ? "bg-navy-700 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Building2 className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="font-semibold text-sm">Perusahaan</span>
                </div>
                <span className="text-xs text-slate-500 leading-snug">
                  Pasang lowongan dan rekrut tim
                </span>
              </button>
            </div>
          </div>

          {/* Input Nama Lengkap / Nama Perusahaan */}
          <Input
            id="register-name"
            label={isCompany ? "Nama Perusahaan" : "Nama Lengkap"}
            required
            type="text"
            autoComplete={isCompany ? "organization" : "name"}
            placeholder={
              isCompany ? "Contoh: PT Teknologi Bangsa" : "Contoh: Budi Santoso"
            }
            leftIcon={
              isCompany ? (
                <Building2 className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )
            }
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={errors.name}
          />

          {/* Input Alamat Email */}
          <Input
            id="register-email"
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
            id="register-password"
            label="Kata Sandi"
            required
            type="password"
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            helperText="Gunakan minimal 8 karakter gabungan huruf dan angka."
            leftIcon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: "" }));
            }}
            error={errors.password}
          />

          {/* Input Konfirmasi Kata Sandi */}
          <Input
            id="register-confirm-password"
            label="Konfirmasi Kata Sandi"
            required
            type="password"
            autoComplete="new-password"
            placeholder="Ulangi kata sandi"
            leftIcon={<Lock className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: "" }));
            }}
            error={errors.confirmPassword}
          />

          {/* Tombol Submit Pendaftaran */}
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
              <span>
                {isCompany
                  ? "Daftar sebagai Perusahaan"
                  : "Daftar sebagai Pelamar"}
              </span>
            </Button>
          </div>
        </form>

        {/* Tautan Masuk */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            Sudah memiliki akun JobConnect?{" "}
            <Link
              href="/login"
              className="font-semibold text-navy-700 hover:text-navy-900 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-600 rounded-xs"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
