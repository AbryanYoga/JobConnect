"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import {
  CheckCircle2,
  ChevronRight,
  Eye,
  Star,
  Gift,
  UserCheck,
  Calendar,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { updateApplicationStatusAction } from "@/app/actions/mitra";
import { type ApplicationStatus } from "@/components/ui/StatusBadge";
import { RejectCandidateModal } from "./RejectCandidateModal";
import { ScheduleInterviewModal } from "./ScheduleInterviewModal";

interface ApplicationStatusActionsProps {
  applicationId: number;
  currentStatus: ApplicationStatus;
  candidateName?: string;
  initialInterviewAt?: string | null;
  initialInterviewPlace?: string | null;
  onOpenRejectModal?: () => void;
  onOpenInterviewModal?: () => void;
}

export function ApplicationStatusActions({
  applicationId,
  currentStatus,
  candidateName = "Kandidat",
  initialInterviewAt,
  initialInterviewPlace,
  onOpenRejectModal,
  onOpenInterviewModal,
}: ApplicationStatusActionsProps) {
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  const handleProgressStatus = async (nextStatus: ApplicationStatus) => {
    setErrorMessage(null);
    setIsUpdating(true);
    try {
      const res = await updateApplicationStatusAction({
        applicationId,
        toStatus: nextStatus,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Gagal memperbarui status.");
      }
    } catch {
      setErrorMessage("Terjadi kendala jaringan saat memperbarui status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const isFinalStatus = ["diterima", "ditolak", "ditarik"].includes(currentStatus);

  return (
    <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-5">
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-black text-black">
          {t("Keputusan & Alur Seleksi", "Hiring Decision & Selection Pipeline")}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium">
          {t(
            "Tentukan kelanjutan proses pelamar pada tahapan seleksi perusahaan Anda.",
            "Manage the candidate's next step in your company's recruitment pipeline."
          )}
        </p>
      </div>

      {isFinalStatus ? (
        <div className="p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs sm:text-sm font-medium space-y-2">
          <div className="flex items-center gap-2 font-bold text-black">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" aria-hidden="true" />
            <span>{t("Keputusan Akhir Telah Ditetapkan", "Final Decision Has Been Made")}</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {currentStatus === "diterima" &&
              t(
                "Kandidat ini telah resmi diterima bekerja. Status lamaran telah selesai dan tidak dapat diubah kembali.",
                "Candidate has been officially hired. Application status is concluded and locked."
              )}
            {currentStatus === "ditolak" &&
              t(
                "Kandidat ini telah ditolak beserta alasan tertulis. Status lamaran telah ditutup.",
                "Candidate has been rejected with written reasons. Application status is closed."
              )}
            {currentStatus === "ditarik" &&
              t(
                "Lamaran telah ditarik secara sukarela oleh pelamar.",
                "Application was voluntarily withdrawn by the applicant."
              )}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Tombol Alur Progresif Sesuai Status Saat Ini */}
          {currentStatus === "dikirim" && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleProgressStatus("ditinjau")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-xs sm:text-sm shadow-2xs hover:shadow transition min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" aria-hidden="true" />
                  <span>{t("Memperbarui Status...", "Updating Status...")}</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>{t("Tandai Sedang Ditinjau", "Mark Under Review")}</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                </>
              )}
            </button>
          )}

          {currentStatus === "ditinjau" && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleProgressStatus("shortlist")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-xs sm:text-sm shadow-2xs hover:shadow transition min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" aria-hidden="true" />
                  <span>{t("Memperbarui Status...", "Updating Status...")}</span>
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>{t("Pindahkan ke Shortlist", "Move to Shortlist")}</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                </>
              )}
            </button>
          )}

          {/* Tombol Jadwalkan Wawancara untuk Shortlist atau perbarui jadwal jika sudah wawancara */}
          {(currentStatus === "shortlist" || currentStatus === "wawancara") && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={onOpenInterviewModal || (() => setIsInterviewModalOpen(true))}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-2xs hover:shadow transition min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>
                {currentStatus === "wawancara"
                  ? t("Ubah Jadwal Wawancara", "Reschedule Interview")
                  : t("Jadwalkan Wawancara Kandidat", "Schedule Candidate Interview")}
              </span>
            </button>
          )}

          {currentStatus === "wawancara" && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleProgressStatus("ditawari")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-xs sm:text-sm shadow-2xs hover:shadow transition min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" aria-hidden="true" />
                  <span>{t("Memperbarui Status...", "Updating Status...")}</span>
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>{t("Beri Penawaran Kerja (Offering)", "Extend Job Offer")}</span>
                  <ChevronRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                </>
              )}
            </button>
          )}

          {currentStatus === "ditawari" && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleProgressStatus("diterima")}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-2xs hover:shadow transition min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                  <span>{t("Memperbarui Status...", "Updating Status...")}</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                  <span>{t("Terima Kandidat Bekerja", "Hire Candidate")}</span>
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          )}

          {/* Tombol Tolak Lamaran (Tersedia dari status apa pun sebelum diterima) */}
          <div className="pt-2 border-t border-black/[0.06]">
            <button
              type="button"
              disabled={isUpdating}
              onClick={onOpenRejectModal || (() => setIsRejectModalOpen(true))}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full hover:bg-red-50 text-red-600 hover:text-red-700 font-bold text-xs sm:text-sm border border-red-200 transition min-h-[44px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" aria-hidden="true" />
              <span>{t("Tolak Lamaran Kandidat", "Reject Candidate Application")}</span>
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 text-xs text-red-600 font-semibold pt-1"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Modal Penolakan Lamaran */}
      <RejectCandidateModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        applicationId={applicationId}
        candidateName={candidateName}
      />

      {/* Modal Penjadwalan Wawancara */}
      <ScheduleInterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        applicationId={applicationId}
        candidateName={candidateName}
        initialInterviewAt={initialInterviewAt}
        initialInterviewPlace={initialInterviewPlace}
      />
    </div>
  );
}
