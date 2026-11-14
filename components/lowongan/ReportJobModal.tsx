"use client";

import React, { useState } from "react";
import { AlertTriangle, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface ReportJobModalProps {
  jobId: number;
  jobTitle: string;
  jobSlug: string;
}

const REPORT_REASONS = [
  { id: "pungutan_biaya", labelId: "Indikasi pungutan biaya / calo / transfer uang", labelEn: "Illegal fees / scam payment request" },
  { id: "gaji_tidak_sesuai", labelId: "Gaji atau syarat kerja tidak sesuai deskripsi", labelEn: "Salary or job criteria does not match description" },
  { id: "perusahaan_fiktif", labelId: "Indikasi perusahaan fiktif atau lokasi palsu", labelEn: "Suspected fake company or fraudulent office" },
  { id: "kontak_mencurigakan", labelId: "Kontak WhatsApp atau email mencurigakan", labelEn: "Suspicious WhatsApp contact or phishing email" },
  { id: "lainnya", labelId: "Kejanggalan atau pelanggaran etika lainnya", labelEn: "Other ethical violation or suspicious behavior" },
];

export function ReportJobModal({
  jobId,
  jobTitle,
  jobSlug,
}: ReportJobModalProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0].id);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setIsSuccess(false);
    setDescription("");
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulasi pengiriman laporan moderasi ke sistem
      await new Promise((resolve) => setTimeout(resolve, 600));
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsOpen(false);
      }, 2500);
    } catch {
      // Tangani fallback
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 transition hover:underline cursor-pointer min-h-[36px]"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" aria-hidden="true" />
        <span>{t("Laporkan Kejanggalan Lowongan", "Report Suspicious Posting")}</span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-black/10 space-y-5">
            {/* Tombol Tutup */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition cursor-pointer"
              aria-label="Tutup modal laporan"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Header Modal */}
            <div className="flex items-start gap-3.5 pr-8">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200/80 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 id="report-modal-title" className="text-base sm:text-lg font-black text-navy-950">
                  {t("Laporkan Lowongan Kerja", "Report Job Posting")}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                  {jobTitle}
                </p>
              </div>
            </div>

            {isSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" aria-hidden="true" />
                <h4 className="text-sm font-black text-emerald-950">
                  {t("Laporan Berhasil Dikirim", "Report Successfully Submitted")}
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  {t(
                    "Terima kasih telah membantu menjaga ekosistem JobConnect tetap aman dan bebas calo. Tim kurasi kami akan segera memeriksa laporan ini.",
                    "Thank you for helping keep JobConnect safe and scam-free. Our moderation team will investigate this report promptly."
                  )}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="hidden" name="jobId" value={jobId} />
                <input type="hidden" name="jobSlug" value={jobSlug} />
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    {t("Kategori Pelanggaran", "Violation Category")}
                  </label>
                  <div className="space-y-1.5">
                    {REPORT_REASONS.map((item) => (
                      <label
                        key={item.id}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition ${
                          selectedReason === item.id
                            ? "bg-rose-50/50 border-rose-300 text-rose-950 font-bold"
                            : "bg-white border-black/[0.08] text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportReason"
                          value={item.id}
                          checked={selectedReason === item.id}
                          onChange={() => setSelectedReason(item.id)}
                          className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                        />
                        <span>{language === "en" ? item.labelEn : item.labelId}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="reportDetail" className="text-xs font-bold text-slate-800 block">
                    {t("Kronologi / Keterangan Tambahan (Opsional)", "Chronology / Additional Details (Optional)")}
                  </label>
                  <textarea
                    id="reportDetail"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t(
                      "Jelaskan bukti kejanggalan atau kronologi jika dihubungi oknum mencurigakan...",
                      "Explain any evidence or chronology if contacted by suspicious parties..."
                    )}
                    className="w-full text-xs rounded-xl border border-black/10 p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 rounded-full border border-black/10 text-xs font-bold text-slate-600 hover:bg-slate-50 transition min-h-[40px] cursor-pointer"
                  >
                    {t("Batal", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition shadow-2xs disabled:opacity-50 min-h-[40px] cursor-pointer"
                  >
                    {isSubmitting ? t("Mengirim...", "Submitting...") : t("Kirim Laporan", "Submit Report")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
