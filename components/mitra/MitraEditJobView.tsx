"use client";

import { Edit3, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { CloseJobButton } from "@/components/mitra/CloseJobButton";
import {
  JobForm,
  type JobFormData,
  type CategoryOption,
  type ProvinceOption,
  type CityOption,
} from "@/components/mitra/JobForm";

interface MitraEditJobViewProps {
  job: {
    id: number;
    title: string;
    status: string;
    review_note?: string | null;
  };
  categories: CategoryOption[];
  provinces: ProvinceOption[];
  cities: CityOption[];
  initialData: Partial<JobFormData>;
}

export function MitraEditJobView({
  job,
  categories,
  provinces,
  cities,
  initialData,
}: MitraEditJobViewProps) {
  const { t } = useLanguage();

  const statusLabel =
    job.status === "open"
      ? t("Tayang (Aktif)", "Published (Active)")
      : job.status === "pending"
      ? t("Menunggu Review", "Pending Review")
      : job.status === "rejected"
      ? t("Perlu Revisi", "Needs Revision")
      : t("Draft", "Draft");

  return (
    <div className="space-y-8">
      {/* Header Halaman Edit */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shadow-2xs">
              <Edit3 className="w-4 h-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              {t("Edit Lowongan Kerja", "Edit Job Vacancy")}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                job.status === "open"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : job.status === "pending"
                  ? "bg-amber-50 text-amber-900 border-amber-300"
                  : job.status === "rejected"
                  ? "bg-red-50 text-red-800 border-red-200"
                  : "bg-slate-100 text-slate-800 border-slate-300"
              }`}
            >
              {t("Status Saat Ini:", "Current Status:")} {statusLabel}
            </span>

            {job.status === "open" && (
              <CloseJobButton jobId={job.id} jobTitle={job.title} />
            )}
          </div>
        </div>

        <p className="text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
          {t(
            "Perbarui kriteria atau detail lowongan. Anda dapat menyimpannya kembali sebagai draft atau mengajukannya langsung ke admin moderator.",
            "Update job criteria or details. You can save changes as draft or submit directly to admin moderators."
          )}
        </p>

        {/* Peringatan jika status rejected */}
        {job.status === "rejected" && job.review_note && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs sm:text-sm flex items-start gap-3 font-medium mt-3"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <span className="font-bold block">
                {t("Alasan Penolakan oleh Admin Sebelumnya:", "Previous Admin Moderation Notes:")}
              </span>
              <p className="leading-relaxed">{job.review_note}</p>
              <p className="text-xs text-red-700 pt-1">
                {t(
                  "Silakan sesuaikan kriteria di bawah ini sesuai masukan admin, lalu klik \"Ajukan Lowongan\" untuk meninjau ulang.",
                  "Please adjust the criteria below according to admin feedback, then click \"Submit Vacancy\" for re-evaluation."
                )}
              </p>
            </div>
          </div>
        )}

        {/* Info jika status pending */}
        {job.status === "pending" && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm flex items-start gap-3 font-medium mt-3"
          >
            <Clock className="w-5 h-5 shrink-0 text-amber-700 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <span className="font-bold block">
                {t("Lowongan Sedang Dalam Antrean Review Admin:", "Vacancy is in the Admin Review Queue:")}
              </span>
              <p className="leading-relaxed">
                {t(
                  "Menyimpan perubahan saat ini akan memperbarui berkas yang ditinjau oleh tim moderator platform.",
                  "Saving changes will update the submission reviewed by the platform moderation team."
                )}
              </p>
            </div>
          </div>
        )}

        {/* Info jika status open */}
        {job.status === "open" && (
          <div
            role="status"
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm flex items-start gap-3 font-medium mt-3"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-700 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <span className="font-bold block">
                {t("Lowongan Sedang Tayang Aktif:", "Job is Currently Active & Published:")}
              </span>
              <p className="leading-relaxed">
                {t(
                  "Anda dapat memperbarui batas waktu lamaran, ringkasan, atau benefit pekerjaan ini.",
                  "You can update the application deadline, summary, or benefits of this job."
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Formulir Edit Lowongan */}
      <JobForm
        categories={categories}
        provinces={provinces}
        cities={cities}
        initialData={initialData}
        isEditing={true}
      />
    </div>
  );
}
