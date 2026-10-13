import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export const DEFAULT_FROM_EMAIL =
  process.env.EMAIL_FROM || "JobConnect <notifikasi@jobconnect.id>";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Mengirimkan email menggunakan layanan Resend.
 * Jika RESEND_API_KEY tidak dikonfigurasi pada lingkungan kerja,
 * pengiriman akan dilewati secara aman (mode simulasi) tanpa menyebabkan galat.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = DEFAULT_FROM_EMAIL,
}: SendEmailOptions): Promise<SendEmailResult> {
  const currentApiKey = process.env.RESEND_API_KEY;

  if (!currentApiKey || !resend) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `[Email Dev Mode] Pengiriman ke: ${Array.isArray(to) ? to.join(", ") : to} | Subjek: "${subject}" dilewati karena RESEND_API_KEY belum diisi.`
      );
    }
    return {
      success: true,
      skipped: true,
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[Email Error]", error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim email.";
    console.error("[Email Exception]", message);
    return {
      success: false,
      error: message,
    };
  }
}
