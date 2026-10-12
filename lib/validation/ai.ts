import { z } from "zod";

/**
 * Skema Zod untuk validasi hasil evaluasi screening CV oleh AI.
 * Sesuai dengan spesifikasi format PRD bagian 7.3.
 */

export const AiReviewLevelEnum = z.enum(["tinggi", "sedang", "rendah"]);
export type AiReviewLevel = z.infer<typeof AiReviewLevelEnum>;

export const AiEvaluationSchema = z.object({
  score: z
    .number({
      error: "Skor evaluasi harus berupa angka.",
    })
    .int("Skor harus bilangan bulat.")
    .min(0, "Skor minimal adalah 0.")
    .max(100, "Skor maksimal adalah 100."),
  level: AiReviewLevelEnum,
  summary: z
    .string({
      error: "Ringkasan evaluasi wajib berupa teks.",
    })
    .min(10, "Ringkasan evaluasi minimal 10 karakter.")
    .max(1000, "Ringkasan evaluasi maksimal 1000 karakter."),
  matched_skills: z
    .array(z.string().trim().min(1, "Nama keahlian tidak boleh kosong."))
    .default([]),
  missing_skills: z
    .array(z.string().trim().min(1, "Nama keahlian tidak boleh kosong."))
    .default([]),
  interview_questions: z
    .array(
      z.string().trim().min(5, "Pertanyaan wawancara minimal 5 karakter.")
    )
    .min(1, "Harus menyediakan minimal 1 pertanyaan wawancara.")
    .max(10, "Maksimal 10 pertanyaan wawancara.")
    .default([]),
  suspicious: z.boolean({
    error: "Penanda suspicious harus bernilai boolean.",
  }).default(false),
});

export type AiEvaluationResult = z.infer<typeof AiEvaluationSchema>;

/**
 * Helper untuk membersihkan teks respons AI (termasuk tag code fence markdown)
 * dan memvalidasinya menggunakan skema Zod.
 */
export function parseAndValidateAiResponse(rawText: string): {
  success: boolean;
  data?: AiEvaluationResult;
  error?: string;
} {
  try {
    let cleanText = rawText.trim();

    // Hapus blok kode markdown jika model menyertakan ```json ... ```
    if (cleanText.startsWith("```")) {
      const match = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        cleanText = match[1].trim();
      }
    }

    const parsedJson = JSON.parse(cleanText);
    const validationResult = AiEvaluationSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      const issues = validationResult.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      return {
        success: false,
        error: `Format JSON tidak valid menurut skema: ${issues}`,
      };
    }

    return {
      success: true,
      data: validationResult.data,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Gagal mem-parsing teks respons JSON.";
    return {
      success: false,
      error: `Format respons AI bukan JSON yang valid: ${errorMsg}`,
    };
  }
}
