"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profilPelamarSchema } from "@/lib/validation/profil";

/**
 * Server Action untuk menyimpan perubahan profil pelamar kerja.
 * Sesuai aturan keamanan RLS: hanya kolom name, phone, headline, dan email_notifications
 * yang diperbarui (kolom role dan email tidak disentuh).
 */
export async function updateProfilPelamarAction(rawData: unknown) {
  const validationResult = profilPelamarSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      error: "Data profil tidak valid. Silakan periksa kembali isian formulir.",
    };
  }

  const { name, phone, headline, emailNotifications } = validationResult.data;

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

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name,
        phone,
        headline,
        email_notifications: emailNotifications,
      })
      .eq("id", user.id);

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Gagal menyimpan pembaruan profil.",
      };
    }

    revalidatePath("/profil");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat menyimpan pembaruan profil.";
    return { success: false, error: message };
  }
}
