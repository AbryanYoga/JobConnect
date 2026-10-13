export interface EmailLayoutOptions {
  title: string;
  preheader?: string;
  contentHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}

/**
 * Template tata letak email dasar responsif JobConnect.
 * Menggunakan gaya inline agar kompatibel dengan berbagai email client.
 */
export function renderEmailLayout({
  title,
  preheader,
  contentHtml,
  ctaText,
  ctaUrl,
}: EmailLayoutOptions): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jobconnect.id";
  const notificationSettingsUrl = `${siteUrl}/profil`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${preheader ? `<span style="display: none !important; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</span>` : ""}
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Kartu Wadah Email -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);">
          <!-- Header JobConnect -->
          <tr>
            <td style="background-color: #0F172A; padding: 24px 32px; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">Job<span style="color: #FFDD00;">Connect</span></span>
                  </td>
                  <td align="right">
                    <span style="font-size: 12px; color: #94A3B8; font-weight: 500;">Pemberitahuan Resmi</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Konten Utama -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; line-height: 1.6;">
              ${contentHtml}

              ${
                ctaText && ctaUrl
                  ? `
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px; margin-bottom: 12px;">
                <tr>
                  <td align="center">
                    <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0F172A; color: #FFFFFF; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 9999px; text-decoration: none; text-align: center; box-shadow: 0 2px 4px rgba(15, 23, 42, 0.15);">
                      ${ctaText}
                    </a>
                  </td>
                </tr>
              </table>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Garis Pembatas -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 0;">
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #F8FAFC; text-align: center; font-size: 12px; color: #64748B; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">
                Email ini dikirim otomatis oleh <strong>JobConnect</strong>. Mohon tidak membalas email ini secara langsung.
              </p>
              <p style="margin: 0;">
                Anda menerima email ini karena mengaktifkan notifikasi email. Anda dapat mengatur preferensi notifikasi di <a href="${notificationSettingsUrl}" style="color: #0F172A; text-decoration: underline;">Pengaturan Profil</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
