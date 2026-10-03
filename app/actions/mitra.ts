"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profilPerusahaanSchema } from "@/lib/validation/profil";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Server Action untuk menyimpan profil perusahaan mitra (identitas, industri, lokasi, dan deskripsi).
 */
export async function updateProfilPerusahaanAction(rawData: unknown) {
  const validationResult = profilPerusahaanSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      error: "Data profil perusahaan tidak valid. Silakan periksa kembali isian formulir.",
    };
  }

  const {
    name,
    website,
    industry,
    size,
    cityId,
    addressNote,
    description,
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

    // Pastikan pengguna memiliki peran company
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "company") {
      return {
        success: false,
        error: "Hanya akun perusahaan mitra yang dapat menyimpan profil ini.",
      };
    }

    // Cek apakah data perusahaan sudah ada
    const { data: existingCompany } = await supabase
      .from("companies")
      .select("id, slug")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (existingCompany) {
      const { error: updateError } = await supabase
        .from("companies")
        .update({
          name,
          website,
          industry,
          size,
          city_id: cityId,
          address_note: addressNote,
          description,
        })
        .eq("id", existingCompany.id);

      if (updateError) {
        return {
          success: false,
          error: updateError.message || "Gagal memperbarui profil perusahaan.",
        };
      }
    } else {
      const baseSlug = slugify(name) || "perusahaan";
      let uniqueSlug = baseSlug;

      const { data: slugCheck } = await supabase
        .from("companies")
        .select("id")
        .eq("slug", uniqueSlug)
        .maybeSingle();

      if (slugCheck) {
        uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      const { error: insertError } = await supabase
        .from("companies")
        .insert({
          owner_id: user.id,
          name,
          slug: uniqueSlug,
          website,
          industry,
          size,
          city_id: cityId,
          address_note: addressNote,
          description,
        });

      if (insertError) {
        return {
          success: false,
          error: insertError.message || "Gagal membuat data perusahaan baru.",
        };
      }
    }

    // Selaraskan nama tampilan di tabel profiles
    await supabase
      .from("profiles")
      .update({ name })
      .eq("id", user.id);

    revalidatePath("/mitra/profil-perusahaan");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat menyimpan profil perusahaan.";
    return { success: false, error: message };
  }
}
