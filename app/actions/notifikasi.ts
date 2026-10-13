"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Menandai satu notifikasi tertentu sebagai telah dibaca.
 */
export async function markNotificationAsReadAction(notificationId: number) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Sesi login Anda telah berakhir. Silakan masuk kembali.",
      };
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      return {
        success: false,
        error: error.message || "Gagal menandai notifikasi telah dibaca.",
      };
    }

    revalidatePath("/notifikasi");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan internal saat memperbarui notifikasi.";
    return { success: false, error: message };
  }
}

/**
 * Menandai semua notifikasi milik pengguna saat ini sebagai telah dibaca.
 */
export async function markAllNotificationsAsReadAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Sesi login Anda telah berakhir. Silakan masuk kembali.",
      };
    }

    const { error } = await supabase
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) {
      return {
        success: false,
        error: error.message || "Gagal menandai seluruh notifikasi telah dibaca.",
      };
    }

    revalidatePath("/notifikasi");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan internal saat memperbarui notifikasi.";
    return { success: false, error: message };
  }
}
