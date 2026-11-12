"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  profilPelamarSchema,
  validateAvatarFile,
  AVATAR_BUCKET,
} from "@/lib/validation/profil";

/**
 * Server Action untuk menyimpan perubahan profil pelamar kerja secara menyeluruh.
 * Mencakup data identitas, kontak, domisili, umur (tanggal lahir), pendidikan,
 * bio profesional, tautan LinkedIn, serta portofolio karya nyata.
 */
export async function updateProfilPelamarAction(rawData: unknown) {
  const validationResult = profilPelamarSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      error: "Data profil tidak valid. Silakan periksa kembali isian formulir.",
    };
  }

  const {
    name,
    phone,
    headline,
    provinceId,
    cityId,
    birthDate,
    educationLevel,
    educationInstitution,
    bio,
    linkedinUrl,
    portfolioUrl,
    portfolios,
    emailNotifications,
  } = validationResult.data;

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

    const updatePayload = {
      name,
      phone,
      headline,
      province_id: provinceId,
      city_id: cityId,
      birth_date: birthDate,
      education_level: educationLevel,
      education_institution: educationInstitution,
      bio,
      linkedin_url: linkedinUrl,
      portfolio_url: portfolioUrl,
      portfolios,
      email_notifications: emailNotifications,
    };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", user.id);

    if (updateError) {
      // Fallback update untuk kolom dasar jika kolom tambahan belum di-migrasi di Supabase
      const lowerErr = (updateError.message || "").toLowerCase();
      if (lowerErr.includes("column") || lowerErr.includes("does not exist") || lowerErr.includes("schema")) {
        const { error: fallbackError } = await supabase
          .from("profiles")
          .update({
            name,
            phone,
            headline,
            email_notifications: emailNotifications,
          })
          .eq("id", user.id);

        if (!fallbackError) {
          revalidatePath("/profil");
          return {
            success: true,
            warning:
              "Data dasar profil berhasil disimpan. Untuk menyimpan domisili, umur, bio, dan portofolio, silakan jalankan migration di database/migration_applicant_profile.sql.",
          };
        }
      }

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

/**
 * Server Action untuk mengunggah dan memperbarui foto profil pelamar kerja.
 */
export async function uploadAvatarAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
  publicUrl?: string;
}> {
  const file = formData.get("avatar");
  if (!file || !(file instanceof File)) {
    return { success: false, error: "Berkas foto profil tidak ditemukan." };
  }

  const validation = await validateAvatarFile(file);
  if (!validation.ok) {
    return { success: false, error: validation.message };
  }

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

    const fileExt = validation.extension;
    const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message || "Gagal mengunggah foto profil.",
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (profileError) {
      return {
        success: false,
        error: profileError.message || "Gagal menyimpan tautan foto ke profil.",
      };
    }

    revalidatePath("/profil");
    return { success: true, publicUrl };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah foto profil.";
    return { success: false, error: message };
  }
}

/**
 * Server Action untuk menghapus foto profil dan mengembalikan ke inisial nama.
 */
export async function deleteAvatarAction(): Promise<{
  success: boolean;
  error?: string;
}> {
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

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    if (profileError) {
      return {
        success: false,
        error: profileError.message || "Gagal menghapus foto profil.",
      };
    }

    revalidatePath("/profil");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus foto.";
    return { success: false, error: message };
  }
}
