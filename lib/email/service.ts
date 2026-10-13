import { sendEmail } from "./resend";
import { renderApplicationStatusEmail } from "./templates/statusUpdate";
import { renderApplicationAcceptedEmail } from "./templates/applicationAccepted";
import { createClient } from "@/lib/supabase/server";

export interface SendApplicationStatusNotificationParams {
  applicationId: number;
  toStatus: string;
  message?: string | null;
  interviewAt?: string | null;
  interviewPlace?: string | null;
}

/**
 * Mengirimkan email notifikasi perubahan status lamaran kepada pelamar
 * jika pelamar mengaktifkan preferensi email_notifications pada akunnya.
 */
export async function sendApplicationStatusEmailNotification({
  applicationId,
  toStatus,
  message,
  interviewAt,
  interviewPlace,
}: SendApplicationStatusNotificationParams) {
  try {
    const supabase = await createClient();

    // Ambil data lamaran beserta relasi profil pelamar dan lowongan
    const { data: application, error } = await supabase
      .from("applications")
      .select(
        `
        id,
        user_id,
        jobs:job_id (
          title,
          companies:company_id (
            name
          )
        )
      `
      )
      .eq("id", applicationId)
      .single();

    if (error || !application) {
      console.warn(
        `[Email Notification] Gagal mengambil data lamaran #${applicationId}:`,
        error?.message
      );
      return { success: false, error: "Data lamaran tidak ditemukan." };
    }

    // Ambil data profil pelamar untuk memeriksa preferensi email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, name, email_notifications")
      .eq("id", application.user_id)
      .single();

    if (!profile?.email) {
      return {
        success: true,
        skipped: true,
        reason: "Pelamar tidak memiliki alamat email.",
      };
    }

    // Periksa apakah pelamar mengaktifkan notifikasi email
    if (profile.email_notifications === false) {
      return {
        success: true,
        skipped: true,
        reason: "Pelamar menonaktifkan notifikasi email.",
      };
    }

    const jobData = application.jobs as unknown as {
      title: string;
      companies: { name: string } | null;
    } | null;

    const applicantName = profile.name || "Pelamar";
    const jobTitle = jobData?.title || "Lowongan Pekerjaan";
    const companyName = jobData?.companies?.name || "Perusahaan Mitra";

    // Pilih template: jika diterima (ACC), gunakan template selamat
    let emailPayload: { subject: string; html: string; text: string };

    if (toStatus === "diterima") {
      emailPayload = renderApplicationAcceptedEmail({
        applicantName,
        jobTitle,
        companyName,
        applicationId,
        message,
      });
    } else {
      emailPayload = renderApplicationStatusEmail({
        applicantName,
        jobTitle,
        companyName,
        applicationId,
        toStatus,
        message,
        interviewAt,
        interviewPlace,
      });
    }

    return await sendEmail({
      to: profile.email,
      subject: emailPayload.subject,
      html: emailPayload.html,
      text: emailPayload.text,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan internal saat memproses email notifikasi.";
    console.error("[Email Notification Error]", msg);
    return { success: false, error: msg };
  }
}
