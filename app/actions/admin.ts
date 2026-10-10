"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Action untuk menyetujui (ACC) lowongan pending menjadi status open.
 */
export async function approveJobAction(jobId: number, note?: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi login Anda telah berakhir. Silakan masuk kembali." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Hanya admin moderator yang berwenang menyetujui lowongan." };
    }

    const { error: rpcError } = await supabase.rpc("review_job", {
      p_job_id: jobId,
      p_decision: "approve",
      p_note: note?.trim() || null,
    });

    if (rpcError) {
      return {
        success: false,
        error: rpcError.message || "Gagal menyetujui lowongan.",
      };
    }

    revalidatePath("/admin/lowongan");
    revalidatePath("/admin");
    revalidatePath("/lowongan");
    revalidatePath("/mitra/lowongan");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menyetujui lowongan.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action untuk menolak lowongan pending dengan alasan wajib.
 */
export async function rejectJobAction(jobId: number, reason: string) {
  try {
    const cleanReason = reason?.trim() || "";
    if (!cleanReason || cleanReason.length < 5) {
      return {
        success: false,
        error: "Alasan penolakan wajib diisi minimal 5 karakter agar mitra dapat memperbaiki lowongan.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi login Anda telah berakhir. Silakan masuk kembali." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return { success: false, error: "Hanya admin moderator yang berwenang menolak lowongan." };
    }

    const { error: rpcError } = await supabase.rpc("review_job", {
      p_job_id: jobId,
      p_decision: "reject",
      p_note: cleanReason,
    });

    if (rpcError) {
      return {
        success: false,
        error: rpcError.message || "Gagal menolak lowongan.",
      };
    }

    revalidatePath("/admin/lowongan");
    revalidatePath("/admin");
    revalidatePath("/mitra/lowongan");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menolak lowongan.";
    return { success: false, error: msg };
  }
}

