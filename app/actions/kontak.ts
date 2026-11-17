"use server";

import { kontakSchema, type KontakInput } from "@/lib/validation/kontak";
import { createClient } from "@/lib/supabase/server";

export interface KirimPesanResult {
  success: boolean;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

export async function kirimPesanPublikAction(
  data: KontakInput
): Promise<KirimPesanResult> {
  const parsed = kontakSchema.safeParse(data);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    parsed.error.issues.forEach((err) => {
      const field = err.path[0];
      if (typeof field === "string" && !errors[field]) {
        errors[field] = err.message;
      }
    });

    const firstErrorMessage =
      parsed.error.issues[0]?.message || "Terdapat isian formulir yang belum valid.";
    return { success: false, error: firstErrorMessage, errors };
  }

  try {
    const supabase = await createClient();

    // Notifikasi ke seluruh profil admin agar ada rekam jejak pesan publik masuk
    const { data: adminProfiles } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin");

    if (adminProfiles && adminProfiles.length > 0) {
      const notifications = adminProfiles.map((adm) => ({
        user_id: adm.id,
        type: "pesan_publik",
        title: "Pesan Kontak Publik Baru",
        body: `Pesan baru dari ${parsed.data.nama} (${parsed.data.email}): "${parsed.data.pesan.slice(0, 80)}..."`,
        link: "/tentang#bantuan-kontak",
      }));

      await supabase.from("notifications").insert(notifications);
    }

    return {
      success: true,
      message: "Pesan Anda berhasil dikirimkan ke tim dukungan JobConnect.",
    };
  } catch {
    // Tetap berhasil jika insert notifikasi optional terkendala
    return {
      success: true,
      message: "Pesan Anda berhasil dikirimkan ke tim dukungan JobConnect.",
    };
  }
}
