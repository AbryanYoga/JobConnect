"use client";

import React, { useState, useRef } from "react";
import {
  Send,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { kirimPesanPublikAction } from "@/app/actions/kontak";
import { type KontakInput } from "@/lib/validation/kontak";

export const SUPPORT_EMAIL = "abryanyogapratama@gmail.com";

const KATEGORI_OPTIONS = [
  { value: "umum", labelId: "Pertanyaan Umum Seputar Platform", labelEn: "General Inquiries" },
  { value: "pelamar", labelId: "Bantuan Pencari Kerja & Kendala Melamar", labelEn: "Job Seeker Support" },
  { value: "mitra", labelId: "Pendaftaran & Kemitraan Perusahaan", labelEn: "Company Partnership" },
  { value: "kendala", labelId: "Laporan Kendala Sistem atau Loker Bodong", labelEn: "Report Issue or Fake Job" },
] as const;

export function PublicContactForm() {
  const { t, language } = useLanguage();
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [kategori, setKategori] = useState<KontakInput["kategori"]>("umum");
  const [pesan, setPesan] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ nama: string; email: string; kategori: string; pesan: string } | null>(null);

  const errorAlertRef = useRef<HTMLDivElement>(null);
  const inputNamaRef = useRef<HTMLInputElement>(null);
  const inputEmailRef = useRef<HTMLInputElement>(null);
  const inputPesanRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    const clientErrors: Record<string, string> = {};
    if (!nama.trim()) {
      clientErrors.nama = t("Nama lengkap wajib diisi.", "Full name is required.");
    } else if (nama.trim().length < 3) {
      clientErrors.nama = t("Nama lengkap minimal 3 karakter.", "Full name must be at least 3 characters.");
    }

    if (!email.trim()) {
      clientErrors.email = t("Alamat email wajib diisi.", "Email address is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      clientErrors.email = t("Format alamat email tidak valid.", "Invalid email format.");
    }

    if (!pesan.trim()) {
      clientErrors.pesan = t("Isi pesan wajib diisi.", "Message content is required.");
    } else if (pesan.trim().length < 10) {
      clientErrors.pesan = t("Isi pesan minimal 10 karakter.", "Message must be at least 10 characters.");
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setIsSubmitting(false);

      setTimeout(() => {
        errorAlertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (clientErrors.nama) {
          inputNamaRef.current?.focus();
        } else if (clientErrors.email) {
          inputEmailRef.current?.focus();
        } else if (clientErrors.pesan) {
          inputPesanRef.current?.focus();
        }
      }, 50);
      return;
    }

    const payload: KontakInput = {
      nama: nama.trim(),
      email: email.trim(),
      kategori,
      pesan: pesan.trim(),
    };

    const res = await kirimPesanPublikAction(payload);
    setIsSubmitting(false);

    if (!res.success) {
      setErrors(res.errors || { general: res.error || t("Gagal mengirimkan pesan.", "Failed to send message.") });
      setTimeout(() => {
        errorAlertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setSuccessInfo({ ...payload });
    setIsSuccess(true);
    setNama("");
    setEmail("");
    setKategori("umum");
    setPesan("");
    setErrors({});
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setSuccessInfo(null);
    setErrors({});
  };

  const selectedCategoryLabel =
    KATEGORI_OPTIONS.find((k) => k.value === (successInfo?.kategori || kategori))?.[
      language === "en" ? "labelEn" : "labelId"
    ] || kategori;

  const gmailComposeUrl = successInfo
    ? `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}&su=${encodeURIComponent(
        `[JobConnect - ${selectedCategoryLabel}] Dari: ${successInfo.nama}`
      )}&body=${encodeURIComponent(
        `Halo Tim Dukungan JobConnect,\n\nNama: ${successInfo.nama}\nEmail: ${successInfo.email}\nKategori: ${selectedCategoryLabel}\n\nPesan:\n${successInfo.pesan}\n\n(Dikirim melalui formulir kontak publik JobConnect)`
      )}`
    : `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}&su=${encodeURIComponent(
        `[JobConnect] Pertanyaan Tim Dukungan`
      )}`;

  return (
    <div className="bg-white rounded-3xl sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-10 shadow-card text-left max-w-3xl mx-auto space-y-6">
      {/* Header Formulir */}
      <div className="border-b border-black/[0.06] pb-5 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-300">
          <MessageSquare className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
          <span>{t("Formulir Bantuan Publik (Non-Login)", "Public Support Form (Non-Login)")}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-black tracking-tight">
          {t("Kirim Pesan Langsung ke Tim JobConnect", "Send Message Directly to JobConnect Support")}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          {t(
            "Punya pertanyaan seputar verifikasi lowongan, pendaftaran mitra, atau kendala akun? Kirimkan pesan Anda melalui formulir di bawah ini tanpa perlu login.",
            "Have questions about vacancy verification, partner registration, or account issues? Send your message through the form below without logging in."
          )}
        </p>
      </div>

      {/* Banner Notifikasi Kesalahan Validasi */}
      {Object.keys(errors).length > 0 && (
        <div
          ref={errorAlertRef}
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm font-semibold flex items-start gap-3 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 min-w-0 flex-1">
            <p className="font-bold">{t("Terdapat kesalahan isian formulir:", "There are form validation errors:")}</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs text-red-800 font-medium">
              {Object.entries(errors).map(([key, msg]) => (
                <li key={key}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tampilan Status Berhasil Kirim */}
      {isSuccess && successInfo ? (
        <div
          role="status"
          aria-live="polite"
          className="p-6 sm:p-8 rounded-3xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <h4 className="text-lg font-black text-emerald-950">
                {t("Pesan Berhasil Terkirim!", "Message Sent Successfully!")}
              </h4>
              <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed">
                {t(
                  `Terima kasih, ${successInfo.nama}. Pesan Anda telah kami terima dan diteruskan ke email pengelola (${SUPPORT_EMAIL}). Tim kami akan membalas ke ${successInfo.email} maksimal dalam 1x24 jam kerja.`,
                  `Thank you, ${successInfo.nama}. Your message has been received and forwarded to (${SUPPORT_EMAIL}). Our team will reply to ${successInfo.email} within 24 working hours.`
                )}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200 text-xs text-slate-700 space-y-1.5 font-medium">
            <p className="font-bold text-slate-900">{t("Salinan Data yang Dikirimkan:", "Submitted Data Summary:")}</p>
            <p><span className="text-slate-500">{t("Kategori:", "Category:")}</span> {selectedCategoryLabel}</p>
            <p><span className="text-slate-500">{t("Kutipan Pesan:", "Message Excerpt:")}</span> &ldquo;{successInfo.pesan.slice(0, 120)}{successInfo.pesan.length > 120 ? "..." : ""}&rdquo;</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <a
              href={gmailComposeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xs transition shadow-2xs min-h-[44px]"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>{t("Buka Salinan di Gmail", "Open Copy in Gmail")}</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>

            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition border border-black/10 min-h-[44px]"
            >
              <span>{t("Kirim Pesan Lainnya", "Send Another Message")}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Formulir Pengisian Pesan */
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Baris 1: Nama Lengkap & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="space-y-1.5">
              <label htmlFor="kontak-nama" className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{t("Nama Lengkap", "Full Name")} <span className="text-red-500">*</span></span>
              </label>
              <input
                ref={inputNamaRef}
                id="kontak-nama"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder={t("Nama Anda atau PIC instansi", "Your name or company contact")}
                className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium border bg-[#FAF8F0] focus:bg-white focus:outline-none transition-all min-h-[44px] ${
                  errors.nama ? "border-red-500 ring-2 ring-red-100" : "border-black/[0.1] focus:border-black"
                }`}
                aria-invalid={Boolean(errors.nama)}
                aria-describedby={errors.nama ? "kontak-nama-err" : undefined}
                required
              />
              {errors.nama && (
                <p id="kontak-nama-err" className="text-xs text-red-600 font-semibold">{errors.nama}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="kontak-email" className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{t("Alamat Email Balasan", "Reply Email Address")} <span className="text-red-500">*</span></span>
              </label>
              <input
                ref={inputEmailRef}
                id="kontak-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh: nama@domain.com"
                className={`w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium border bg-[#FAF8F0] focus:bg-white focus:outline-none transition-all min-h-[44px] ${
                  errors.email ? "border-red-500 ring-2 ring-red-100" : "border-black/[0.1] focus:border-black"
                }`}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "kontak-email-err" : undefined}
                required
              />
              {errors.email && (
                <p id="kontak-email-err" className="text-xs text-red-600 font-semibold">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Baris 2: Kategori Pesan */}
          <div className="space-y-1.5">
            <label htmlFor="kontak-kategori" className="text-xs font-bold text-slate-800 block">
              {t("Kategori Bantuan / Topik", "Topic / Assistance Category")} <span className="text-red-500">*</span>
            </label>
            <select
              id="kontak-kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value as KontakInput["kategori"])}
              className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold border border-black/[0.1] bg-[#FAF8F0] focus:bg-white focus:border-black focus:outline-none transition-all min-h-[44px]"
            >
              {KATEGORI_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {language === "en" ? opt.labelEn : opt.labelId}
                </option>
              ))}
            </select>
          </div>

          {/* Baris 3: Isi Pesan */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="kontak-pesan" className="font-bold text-slate-800">
                {t("Isi Pesan / Pertanyaan", "Message / Inquiry Details")} <span className="text-red-500">*</span>
              </label>
              <span className={`text-[11px] font-semibold ${pesan.length < 10 ? "text-slate-400" : "text-slate-600"}`}>
                {pesan.length}/1000 {t("karakter", "characters")}
              </span>
            </div>
            <textarea
              ref={inputPesanRef}
              id="kontak-pesan"
              rows={4}
              value={pesan}
              onChange={(e) => setPesan(e.target.value)}
              placeholder={t(
                "Tuliskan pertanyaan, keluhan, atau kendala Anda secara lengkap...",
                "Write your question, complaint, or problem details thoroughly..."
              )}
              className={`w-full p-4 rounded-2xl text-xs sm:text-sm font-medium border bg-[#FAF8F0] focus:bg-white focus:outline-none transition-all resize-y min-h-[100px] ${
                errors.pesan ? "border-red-500 ring-2 ring-red-100" : "border-black/[0.1] focus:border-black"
              }`}
              aria-invalid={Boolean(errors.pesan)}
              aria-describedby={errors.pesan ? "kontak-pesan-err" : undefined}
              required
            />
            {errors.pesan && (
              <p id="kontak-pesan-err" className="text-xs text-red-600 font-semibold">{errors.pesan}</p>
            )}
          </div>

          {/* Baris Tombol Aksi */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">
              {t("Pesan diteruskan ke:", "Destination email:")} <span className="font-bold text-slate-800">{SUPPORT_EMAIL}</span>
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#0F1F38] hover:bg-[#172C4D] text-white font-black text-xs sm:text-sm transition shadow-2xs hover:shadow active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                  <span>{t("Mengirim Pesan...", "Sending Message...")}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>{t("Kirim Pesan Sekarang", "Send Message Now")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
