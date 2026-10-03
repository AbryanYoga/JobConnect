"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  profilPerusahaanSchema,
  validateLogoFile,
  buildLogoPath,
  LOGO_BUCKET,
} from "@/lib/validation/profil";

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

/**
 * Server Action untuk mengunggah logo perusahaan ke bucket storage 'company-logos'.
 */
export async function uploadCompanyLogoAction(formData: FormData) {
  const file = formData.get("logo");
  if (!file || !(file instanceof File)) {
    return {
      success: false,
      error: "Berkas logo tidak ditemukan. Silakan pilih berkas gambar.",
    };
  }

  const validation = await validateLogoFile(file);
  if (!validation.ok) {
    return {
      success: false,
      error: validation.message,
    };
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "company") {
      return {
        success: false,
        error: "Hanya akun perusahaan mitra yang dapat mengunggah logo.",
      };
    }

    // Ambil atau buat data awal perusahaan jika belum ada baris di database
    let { data: company } = await supabase
      .from("companies")
      .select("id, logo_path")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!company) {
      const companyName = profile?.name || "Perusahaan Mitra";
      const baseSlug = slugify(companyName) || "perusahaan";
      let uniqueSlug = baseSlug;

      const { data: slugCheck } = await supabase
        .from("companies")
        .select("id")
        .eq("slug", uniqueSlug)
        .maybeSingle();

      if (slugCheck) {
        uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      const { data: newCompany, error: insertError } = await supabase
        .from("companies")
        .insert({
          owner_id: user.id,
          name: companyName,
          slug: uniqueSlug,
        })
        .select("id, logo_path")
        .single();

      if (insertError || !newCompany) {
        return {
          success: false,
          error:
            "Gagal membuat data awal perusahaan. Simpan profil terlebih dahulu.",
        };
      }

      company = newCompany;
    }

    const storagePath = buildLogoPath(company.id, validation.extension);

    const { error: uploadError } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return {
        success: false,
        error:
          uploadError.message || "Gagal mengunggah logo ke penyimpanan storage.",
      };
    }

    // Jika ada file logo lama, bersihkan dari storage
    if (company.logo_path && company.logo_path !== storagePath) {
      await supabase.storage.from(LOGO_BUCKET).remove([company.logo_path]);
    }

    // Perbarui logo_path di tabel companies
    const { error: updateError } = await supabase
      .from("companies")
      .update({ logo_path: storagePath })
      .eq("id", company.id);

    if (updateError) {
      return {
        success: false,
        error: "Gagal memperbarui referensi logo perusahaan di database.",
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(LOGO_BUCKET)
      .getPublicUrl(storagePath);

    revalidatePath("/mitra/profil-perusahaan");

    return {
      success: true,
      logoPath: storagePath,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat memproses unggah logo.";
    return { success: false, error: message };
  }
}

/**
 * Server Action untuk menghapus logo perusahaan dari storage dan database.
 */
export async function deleteCompanyLogoAction() {
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

    const { data: company } = await supabase
      .from("companies")
      .select("id, logo_path")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!company || !company.logo_path) {
      return {
        success: false,
        error: "Tidak ada logo perusahaan yang dapat dihapus.",
      };
    }

    // Hapus berkas dari bucket storage
    await supabase.storage.from(LOGO_BUCKET).remove([company.logo_path]);

    // Hapus referensi dari database
    const { error: updateError } = await supabase
      .from("companies")
      .update({ logo_path: null })
      .eq("id", company.id);

    if (updateError) {
      return {
        success: false,
        error: "Gagal menghapus referensi logo dari profil perusahaan.",
      };
    }

    revalidatePath("/mitra/profil-perusahaan");
    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat menghapus logo.";
    return { success: false, error: message };
  }
}
