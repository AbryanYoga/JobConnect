import { renderEmailLayout } from "./base";

export interface ApplicationStatusEmailData {
  applicantName: string;
  jobTitle: string;
  companyName: string;
  toStatus: string;
  applicationId: number;
  message?: string | null;
  interviewAt?: string | null;
  interviewPlace?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  dikirim: "Terkirim",
  ditinjau: "Sedang Ditinjau",
  wawancara: "Tahap Wawancara",
  diterima: "Lolos Seleksi (Diterima)",
  ditolak: "Belum Sesuai Kriteria",
  ditarik: "Lamaran Ditarik",
};

export function renderApplicationStatusEmail(data: ApplicationStatusEmailData) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jobconnect.id";
  const applicationUrl = `${siteUrl}/lamaran-saya/${data.applicationId}`;
  const statusLabel = STATUS_LABELS[data.toStatus] || data.toStatus;

  let subject = `Pembaruan Lamaran: ${data.jobTitle} di ${data.companyName}`;
  if (data.toStatus === "wawancara") {
    subject = `Undangan Wawancara: ${data.jobTitle} di ${data.companyName}`;
  } else if (data.toStatus === "ditolak") {
    subject = `Pemberitahuan Seleksi: ${data.jobTitle} di ${data.companyName}`;
  }

  const isInterview = data.toStatus === "wawancara";
  const isRejected = data.toStatus === "ditolak";

  let statusBadgeColor = "#0284C7"; // blue
  let statusBadgeBg = "#F0F9FF";
  if (isInterview) {
    statusBadgeColor = "#D97706"; // amber
    statusBadgeBg = "#FFFBEB";
  } else if (isRejected) {
    statusBadgeColor = "#DC2626"; // red
    statusBadgeBg = "#FEF2F2";
  }

  const contentHtml = `
    <h1 style="font-size: 20px; font-weight: 700; color: #0F172A; margin: 0 0 16px 0; line-height: 1.3;">
      Halo ${data.applicantName},
    </h1>

    <p style="font-size: 15px; color: #334155; margin: 0 0 20px 0;">
      Ada pembaruan status terkini untuk lamaran pekerjaan Anda di <strong>${data.companyName}</strong>.
    </p>

    <!-- Ringkasan Lamaran -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="padding-bottom: 10px; font-size: 13px; color: #64748B; width: 110px;">Posisi:</td>
          <td style="padding-bottom: 10px; font-size: 14px; font-weight: 600; color: #0F172A;">${data.jobTitle}</td>
        </tr>
        <tr>
          <td style="padding-bottom: 10px; font-size: 13px; color: #64748B;">Perusahaan:</td>
          <td style="padding-bottom: 10px; font-size: 14px; font-weight: 600; color: #0F172A;">${data.companyName}</td>
        </tr>
        <tr>
          <td style="font-size: 13px; color: #64748B;">Status Baru:</td>
          <td>
            <span style="display: inline-block; background-color: ${statusBadgeBg}; color: ${statusBadgeColor}; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; border: 1px solid ${statusBadgeColor}33;">
              ${statusLabel}
            </span>
          </td>
        </tr>
      </table>
    </div>

    ${
      isInterview && (data.interviewAt || data.interviewPlace)
        ? `
    <!-- Kotak Jadwal Wawancara -->
    <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px;">
      <h2 style="font-size: 15px; font-weight: 700; color: #92400E; margin: 0 0 12px 0;">
        Detail Jadwal Wawancara
      </h2>
      ${
        data.interviewAt
          ? `<p style="font-size: 14px; color: #78350F; margin: 0 0 6px 0;"><strong>Waktu:</strong> ${data.interviewAt}</p>`
          : ""
      }
      ${
        data.interviewPlace
          ? `<p style="font-size: 14px; color: #78350F; margin: 0;"><strong>Lokasi / Tautan Pertemuan:</strong> ${data.interviewPlace}</p>`
          : ""
      }
    </div>
    `
        : ""
    }

    ${
      data.message
        ? `
    <!-- Pesan dari Perusahaan -->
    <div style="margin-bottom: 24px;">
      <h2 style="font-size: 14px; font-weight: 600; color: #475569; margin: 0 0 8px 0;">
        Catatan dari Pihak Perusahaan:
      </h2>
      <div style="background-color: #F1F5F9; border-left: 3px solid #94A3B8; padding: 12px 16px; font-size: 14px; color: #334155; font-style: italic;">
        "${data.message}"
      </div>
    </div>
    `
        : ""
    }

    <p style="font-size: 14px; color: #64748B; margin: 0;">
      Silakan klik tombol di bawah untuk melihat rincian lengkap lamaran Anda di JobConnect.
    </p>
  `;

  const html = renderEmailLayout({
    title: subject,
    preheader: `Pembaruan status lamaran untuk posisi ${data.jobTitle} di ${data.companyName}.`,
    contentHtml,
    ctaText: "Lihat Detail Lamaran",
    ctaUrl: applicationUrl,
  });

  const text = [
    `Halo ${data.applicantName},`,
    "",
    `Ada pembaruan status terkini untuk lamaran pekerjaan Anda di ${data.companyName}.`,
    `Posisi: ${data.jobTitle}`,
    `Perusahaan: ${data.companyName}`,
    `Status Baru: ${statusLabel}`,
    data.interviewAt ? `Waktu Wawancara: ${data.interviewAt}` : "",
    data.interviewPlace ? `Lokasi Wawancara: ${data.interviewPlace}` : "",
    data.message ? `Catatan dari Perusahaan: "${data.message}"` : "",
    "",
    `Buka detail lamaran Anda di: ${applicationUrl}`,
    "",
    "Salam,",
    "Tim JobConnect",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
