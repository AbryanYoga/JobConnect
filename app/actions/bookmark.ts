"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ToggleBookmarkResult {
  success: boolean;
  isBookmarked?: boolean;
  error?: string;
  message?: string;
}

export async function toggleBookmarkAction(jobId: number): Promise<ToggleBookmarkResult> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "AUTH_REQUIRED", message: "Silakan masuk ke akun Anda terlebih dahulu untuk menyimpan lowongan." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "company" || profile?.role === "admin") {
      return {
        success: false,
        error: "ROLE_NOT_ALLOWED",
        message: "Fitur simpan lowongan hanya tersedia untuk akun pencari kerja.",
      };
    }

    const { data: existing, error: checkError } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", user.id)
      .eq("job_id", jobId)
      .maybeSingle();

    if (checkError) return { success: false, error: "DB_ERROR", message: checkError.message || "Gagal memeriksa status simpan lowongan." };

    const isBookmarked = !existing;
    const { error: opError } = existing
      ? await supabase.from("saved_jobs").delete().eq("user_id", user.id).eq("job_id", jobId)
      : await supabase.from("saved_jobs").insert({ user_id: user.id, job_id: jobId });

    if (opError) {
      return { success: false, error: isBookmarked ? "INSERT_FAILED" : "DELETE_FAILED", message: opError.message };
    }

    ["/tersimpan", "/lowongan"].forEach((p) => revalidatePath(p));
    return { success: true, isBookmarked };
  } catch (err: unknown) {
    return { success: false, error: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "Terjadi kesalahan internal saat memperbarui lowongan tersimpan." };
  }
}

export async function getUserSavedJobIdsAction(): Promise<number[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase.from("saved_jobs").select("job_id").eq("user_id", user.id);
    return error || !data ? [] : data.map((item) => Number(item.job_id));
  } catch {
    return [];
  }
}
