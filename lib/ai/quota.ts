import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Batas default kuota harian screening AI jika variabel lingkungan AI_MAX_SCANS_PER_DAY belum diatur.
 */
export const DEFAULT_AI_MAX_SCANS_PER_DAY = 50;

/**
 * Batas maksimal percobaan analisis ulang untuk satu berkas lamaran (PRD 7.5).
 */
export const MAX_AI_ATTEMPTS_PER_APPLICATION = 3;

/**
 * Mendapatkan batas maksimal kuota harian dari environment variable AI_MAX_SCANS_PER_DAY.
 */
export function getDailyAiScanLimit(): number {
  const envVal = process.env.AI_MAX_SCANS_PER_DAY;
  if (!envVal) {
    return DEFAULT_AI_MAX_SCANS_PER_DAY;
  }

  const parsed = parseInt(envVal, 10);
  if (isNaN(parsed) || parsed <= 0) {
    return DEFAULT_AI_MAX_SCANS_PER_DAY;
  }

  return parsed;
}

export interface QuotaCheckResult {
  allowed: boolean;
  currentCount: number;
  maxLimit: number;
  remaining: number;
  resetAt: string;
}

/**
 * Menghitung jumlah pemindaian AI yang telah selesai atau sedang diproses pada hari ini (UTC / WIB).
 */
export async function countAiScansToday(
  supabaseAdmin: SupabaseClient
): Promise<number> {
  const now = new Date();
  // Awal hari ini (00:00:00 UTC)
  const startOfDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  ).toISOString();

  const { count, error } = await supabaseAdmin
    .from("application_ai_reviews")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfDay)
    .in("status", ["done", "processing"]);

  if (error) {
    // Jika ada kegagalan query, jangan memblokir proses tetapi catat default 0
    return 0;
  }

  return count ?? 0;
}

/**
 * Memeriksa apakah kuota harian AI masih mencukupi sesuai PRD 7.5.
 */
export async function checkDailyAiQuota(
  supabaseAdmin: SupabaseClient
): Promise<QuotaCheckResult> {
  const maxLimit = getDailyAiScanLimit();
  const currentCount = await countAiScansToday(supabaseAdmin);
  const allowed = currentCount < maxLimit;
  const remaining = Math.max(0, maxLimit - currentCount);

  // Waktu reset kuota (00:00:00 UTC hari berikutnya)
  const now = new Date();
  const tomorrow = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );

  return {
    allowed,
    currentCount,
    maxLimit,
    remaining,
    resetAt: tomorrow.toISOString(),
  };
}
