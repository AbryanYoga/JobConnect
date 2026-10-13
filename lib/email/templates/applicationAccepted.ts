import { renderEmailLayout } from "./base";

export interface ApplicationAcceptedEmailData {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  applicationId: number;
  message?: string | null;
}

/**
 * Template email khusus untuk notifikasi penerimaan kerja (ACC) pelamar.
 */
export function renderApplicationAcceptedEmail(
  data: ApplicationAcceptedEmailData
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jobconnect.id";
  const applicationUrl = `${siteUrl}/lamaran-saya/${data.applicationId}`;
  const subject = `Selamat! Lamaran Anda Diterima di ${data.companyName}`;

  const contentHtml = `
    <!-- Header Ucapan Selamat -->
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; background-color: #ECFDF5; color: #059669; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 9999px; border: 1px solid #A7F3D0; margin-bottom: 12px;">
        Lamaran Diterima
      </span>
      <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0; line-height: 1.3;">
        Selamat, ${data.applicantName}!
      </h1>
      <p style="font-size: 15px; color: #475569; margin: 0;">
        Pihak <strong>${data.companyName}</strong> telah menerima lamaran Anda untuk bergabung bersama tim mereka.
      </p>
    </div>

    <!-- Kotak Rincian Penerimaan -->
    <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px 24px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 10px; font-size: 13px; color: #166534; width: 110px;">Posisi:</td>
          <td style="padding-bottom: 10px; font-size: 15px; font-weight: 700; color: #0F172A;">${data.jobTitle}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #166534;">Perusahaan:</td>
          <td style="font-size: 15px; font-weight: 700; color: #0F172A;">${data.companyName}</td>
        </tr>
      </table>
    </div>

    ${
      data.message
        ? `
    <!-- Catatan Lanjutan dari Perusahaan -->
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 14px; font-weight: 600; color: #334155; margin: 0 0 8px 0;">
        Instruksi dan Pesan dari Perusahaan:
      </h2>
      <div style="background-color: #F8FAFC; border-left: 3px solid #10B981; padding: 14px 18px; font-size: 14px; color: #1E293B; line-height: 1.6;">
        ${data.message}
      </div>
    </div>
    `
        : ""
    }

    <p style="font-size: 14px; color: #64748B; margin: 0 0 8px 0; line-height: 1.5;">
      Silakan klik tombol di bawah untuk membuka detail lamaran Anda, melihat instruksi lebih lanjut, atau berkomunikasi dengan perusahaan mitra.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Selamat! Anda dinyatakan lolos dan diterima untuk posisi ${data.jobTitle} di ${data.companyName}.`,
    contentHtml,
    ctaText: "Lihat Rincian Penerimaan",
    ctaUrl: applicationUrl,
  });

  const text = [
    `Selamat, ${data.applicantName}!`,
    "",
    `Pihak ${data.companyName} telah menerima lamaran Anda untuk posisi ${data.jobTitle}.`,
    "",
    `Posisi: ${data.jobTitle}`,
    `Perusahaan: ${data.companyName}`,
    `Status: Lolos Seleksi (Diterima)`,
    "",
    data.message ? `Pesan dari Perusahaan: "${data.message}"` : "",
    "",
    `Buka rincian lengkap lamaran Anda di: ${applicationUrl}`,
    "",
    "Salam sukses,",
    "Tim JobConnect",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
