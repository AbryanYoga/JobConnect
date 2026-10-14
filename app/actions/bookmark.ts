"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ToggleBookmarkResult {
  success: boolean;
  isBookmarked?: boolean;
  error?: string;
  message?: string;
}

/**
 * Menyimpan atau menghapus lowongan pekerjaan dari daftar bookmark pelamar.
 */
export async function toggleBookmarkAction(jobId: number): Promise<ToggleBookmarkResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "AUTH_REQUIRED",
        message: "Silakan masuk ke akun Anda terlebih dahulu untuk menyimpan lowongan.",
      };
    }

    // Cek apakah lowongan sudah pernah disimpan sebelumnya
    const { data: existing, error: checkError } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", user.id)
      .eq("job_id", jobId)
      .maybeSingle();

    if (checkError) {
      return {
        success: false,
        error: "DB_ERROR",
        message: checkError.message || "Gagal memeriksa status simpan lowongan.",
      };
    }

    if (existing) {
      // Hapus dari bookmark
      const { error: deleteError } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", user.id)
        .eq("job_id", jobId);

      if (deleteError) {
        return {
          success: false,
          error: "DELETE_FAILED",
          message: deleteError.message || "Gagal menghapus lowongan dari daftar tersimpan.",
        };
      }

      revalidatePath("/tersimpan");
      revalidatePath("/lowongan");
      return { success: true, isBookmarked: false };
    } else {
      // Tambah ke bookmark
      const { error: insertError } = await supabase
        .from("saved_jobs")
        .insert({
          user_id: user.id,
          job_id: jobId,
        });

      if (insertError) {
        return {
          success: false,
          error: "INSERT_FAILED",
          message: insertError.message || "Gagal menyimpan lowongan.",
        };
      }

      revalidatePath("/tersimpan");
      revalidatePath("/lowongan");
      return { success: true, isBookmarked: true };
    }
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan internal saat memperbarui lowongan tersimpan.";
    return {
      success: false,
      error: "INTERNAL_ERROR",
      message,
    };
  }
}

/**
 * Mengambil daftar ID lowongan yang disimpan oleh pengguna saat ini.
 */
export async function getUserSavedJobIdsAction(): Promise<number[]> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("saved_jobs")
      .select("job_id")
      .eq("user_id", user.id);

    if (error || !data) {
      return [];
    }

    return data.map((item) => Number(item.job_id));
  } catch {
    return [];
  }
}
