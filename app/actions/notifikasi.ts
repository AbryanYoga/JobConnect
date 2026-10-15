"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Sesi login Anda telah berakhir. Silakan masuk kembali.");
  return { supabase, user };
}

export async function markNotificationAsReadAction(notificationId: number) {
  try {
    const { supabase, user } = await getAuthUser();
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) return { success: false, error: error.message || "Gagal menandai notifikasi telah dibaca." };
    revalidatePath("/notifikasi");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan internal saat memperbarui notifikasi." };
  }
}

export async function markAllNotificationsAsReadAction() {
  try {
    const { supabase, user } = await getAuthUser();
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("read_at", null);

    if (error) return { success: false, error: error.message || "Gagal menandai seluruh notifikasi telah dibaca." };
    revalidatePath("/notifikasi");
    return { success: true };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan internal saat memperbarui notifikasi." };
  }
}
