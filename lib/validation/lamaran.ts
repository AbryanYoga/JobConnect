import { z } from "zod";

export const CV_MAX_BYTES = 2 * 1024 * 1024;
export const COVER_LETTER_MAX = 2000;
export const CV_BUCKET = "cvs";

export const CV_ERROR_MESSAGE = "CV harus berformat PDF dan maksimal 2 MB";

/**
 * Skema validasi pengiriman data lamaran pekerjaan.
 * Catatan: aiConsent bernilai default false dan tidak wajib true
 * karena analisis AI bersifat opsional bagi pelamar (PRD 7.6 dan commit T3).
 */
export const lamaranSchema = z.object({
  jobId: z
    .number({ error: "ID lowongan harus berupa angka" })
    .int("ID lowongan tidak valid")
    .positive("ID lowongan wajib diisi"),
  coverLetter: z
    .string()
    .nullish()
    .transform((val) => {
      if (!val) return null;
      const trimmed = val.trim();
      return trimmed || null;
    })
    .refine(
      (val) => !val || val.length <= COVER_LETTER_MAX,
      `Surat pengantar maksimal ${COVER_LETTER_MAX} karakter`
    ),
  aiConsent: z.boolean().default(false),
});

export type LamaranInput = z.infer<typeof lamaranSchema>;

/**
 * Validasi berkas CV sisi klien dan server.
 * Memeriksa tipe MIME, ukuran berkas (> 0 dan <= 2 MB), serta 5 byte pertama (%PDF-).
 */
export async function validateCvFile(
  file: File
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!file || typeof file.slice !== "function") {
    return { ok: false, message: CV_ERROR_MESSAGE };
  }

  if (file.type !== "application/pdf") {
    return { ok: false, message: CV_ERROR_MESSAGE };
  }

  if (file.size <= 0 || file.size > CV_MAX_BYTES) {
    return { ok: false, message: CV_ERROR_MESSAGE };
  }

  try {
    const slice = file.slice(0, 5);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (
      bytes.length !== 5 ||
      bytes[0] !== 0x25 || // %
      bytes[1] !== 0x50 || // P
      bytes[2] !== 0x44 || // D
      bytes[3] !== 0x46 || // F
      bytes[4] !== 0x2d // -
    ) {
      return { ok: false, message: CV_ERROR_MESSAGE };
    }
  } catch {
    return { ok: false, message: CV_ERROR_MESSAGE };
  }

  return { ok: true };
}

/**
 * Menghasilkan path penyimpanan berkas CV pada storage bucket 'cvs'.
 * Format ini selaras dengan syarat RLS di applications_insert_policy
 * dan cvs_insert_policy: "${userId}/${jobId}.pdf".
 */
export function buildCvPath(userId: string, jobId: number): string {
  return `${userId}/${jobId}.pdf`;
}
