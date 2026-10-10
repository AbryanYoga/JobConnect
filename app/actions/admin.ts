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

/**
 * Server Action untuk men-takedown lowongan aktif (open) yang bermasalah ke status removed.
 */
export async function takedownJobAction(jobId: number, reason: string) {
  try {
    const cleanReason = reason?.trim() || "";
    if (!cleanReason || cleanReason.length < 5) {
      return {
        success: false,
        error: "Alasan takedown wajib diisi minimal 5 karakter.",
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
      return { success: false, error: "Hanya admin moderator yang berwenang men-takedown lowongan." };
    }

    const { error: rpcError } = await supabase.rpc("review_job", {
      p_job_id: jobId,
      p_decision: "takedown",
      p_note: cleanReason,
    });

    if (rpcError) {
      return {
        success: false,
        error: rpcError.message || "Gagal melakukan takedown lowongan.",
      };
    }

    revalidatePath("/admin/lowongan");
    revalidatePath("/admin");
    revalidatePath("/lowongan");
    revalidatePath("/mitra/lowongan");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat melakukan takedown lowongan.";
    return { success: false, error: msg };
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Server Action untuk membuat kategori lowongan baru.
 */
export async function createCategoryAction(name: string) {
  try {
    const cleanName = name?.trim() || "";
    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: "Nama kategori wajib diisi minimal 2 karakter." };
    }
    if (cleanName.length > 50) {
      return { success: false, error: "Nama kategori maksimal 50 karakter." };
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
      return { success: false, error: "Hanya admin moderator yang berwenang menambah kategori." };
    }

    const slug = slugify(cleanName);
    if (!slug) {
      return { success: false, error: "Nama kategori tidak menghasilkan tautan slug yang valid." };
    }

    // Cek duplikasi
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .or(`name.ilike.${cleanName},slug.eq.${slug}`)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "Kategori dengan nama atau slug serupa sudah terdaftar." };
    }

    const { error: insertError } = await supabase
      .from("categories")
      .insert({
        name: cleanName,
        slug,
      });

    if (insertError) {
      return { success: false, error: insertError.message || "Gagal membuat kategori baru." };
    }

    revalidatePath("/admin/kategori");
    revalidatePath("/admin");
    revalidatePath("/lowongan");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menambah kategori.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action untuk memperbarui nama kategori lowongan.
 */
export async function updateCategoryAction(id: number, name: string) {
  try {
    const cleanName = name?.trim() || "";
    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: "Nama kategori wajib diisi minimal 2 karakter." };
    }
    if (cleanName.length > 50) {
      return { success: false, error: "Nama kategori maksimal 50 karakter." };
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
      return { success: false, error: "Hanya admin moderator yang berwenang mengedit kategori." };
    }

    const slug = slugify(cleanName);

    // Cek duplikasi dengan kategori lain
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .neq("id", id)
      .or(`name.ilike.${cleanName},slug.eq.${slug}`)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "Nama kategori tersebut sudah digunakan oleh kategori lain." };
    }

    const { error: updateError } = await supabase
      .from("categories")
      .update({
        name: cleanName,
        slug,
      })
      .eq("id", id);

    if (updateError) {
      return { success: false, error: updateError.message || "Gagal memperbarui kategori." };
    }

    revalidatePath("/admin/kategori");
    revalidatePath("/admin");
    revalidatePath("/lowongan");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memperbarui kategori.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action untuk menghapus kategori lowongan jika tidak berelasi dengan lowongan kerja.
 */
export async function deleteCategoryAction(id: number) {
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
      return { success: false, error: "Hanya admin moderator yang berwenang menghapus kategori." };
    }

    // Periksa keterikatan dengan tabel jobs
    const { count: jobCount } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (jobCount && jobCount > 0) {
      return {
        success: false,
        error: `Kategori ini masih digunakan oleh ${jobCount} lowongan pekerjaan dan tidak dapat dihapus.`,
      };
    }

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { success: false, error: deleteError.message || "Gagal menghapus kategori." };
    }

    revalidatePath("/admin/kategori");
    revalidatePath("/admin");
    revalidatePath("/lowongan");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus kategori.";
    return { success: false, error: msg };
  }
}



