"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Sesi login Anda telah berakhir. Silakan masuk kembali.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    throw new Error("Hanya admin moderator yang berwenang melakukan tindakan ini.");
  }

  return { supabase, user };
}

const actionError = (err: unknown, fallback: string) => ({
  success: false as const,
  error: err instanceof Error ? err.message : fallback,
});

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

export async function approveJobAction(jobId: number, note?: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc("review_job", {
      p_job_id: jobId,
      p_decision: "approve",
      p_note: note?.trim() || null,
    });
    if (error) return { success: false, error: error.message || "Gagal menyetujui lowongan." };

    ["/admin/lowongan", "/admin", "/lowongan", "/mitra/lowongan"].forEach((p) => revalidatePath(p));
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat menyetujui lowongan.");
  }
}

export async function rejectJobAction(jobId: number, reason: string) {
  try {
    const cleanReason = reason?.trim() || "";
    if (cleanReason.length < 5) {
      return { success: false, error: "Alasan penolakan wajib diisi minimal 5 karakter agar mitra dapat memperbaiki lowongan." };
    }
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc("review_job", {
      p_job_id: jobId,
      p_decision: "reject",
      p_note: cleanReason,
    });
    if (error) return { success: false, error: error.message || "Gagal menolak lowongan." };

    ["/admin/lowongan", "/admin", "/mitra/lowongan"].forEach((p) => revalidatePath(p));
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat menolak lowongan.");
  }
}

export async function takedownJobAction(jobId: number, reason: string) {
  try {
    const cleanReason = reason?.trim() || "";
    if (cleanReason.length < 5) {
      return { success: false, error: "Alasan takedown wajib diisi minimal 5 karakter." };
    }
    const { supabase } = await requireAdmin();
    const { error } = await supabase.rpc("review_job", {
      p_job_id: jobId,
      p_decision: "takedown",
      p_note: cleanReason,
    });
    if (error) return { success: false, error: error.message || "Gagal melakukan takedown lowongan." };

    ["/admin/lowongan", "/admin", "/lowongan", "/mitra/lowongan"].forEach((p) => revalidatePath(p));
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat melakukan takedown lowongan.");
  }
}

export async function createCategoryAction(name: string) {
  try {
    const cleanName = name?.trim() || "";
    if (cleanName.length < 2 || cleanName.length > 50) {
      return { success: false, error: "Nama kategori harus antara 2 sampai 50 karakter." };
    }
    const slug = slugify(cleanName);
    if (!slug) return { success: false, error: "Nama kategori tidak menghasilkan tautan slug yang valid." };

    const { supabase } = await requireAdmin();
    const { data: existing } = await supabase.from("categories").select("id").or(`name.ilike.${cleanName},slug.eq.${slug}`).maybeSingle();
    if (existing) return { success: false, error: "Kategori dengan nama atau slug serupa sudah terdaftar." };

    const { error } = await supabase.from("categories").insert({ name: cleanName, slug });
    if (error) return { success: false, error: error.message || "Gagal membuat kategori baru." };

    ["/admin/kategori", "/admin", "/lowongan"].forEach((p) => revalidatePath(p));
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat menambah kategori.");
  }
}

export async function updateCategoryAction(id: number, name: string) {
  try {
    const cleanName = name?.trim() || "";
    if (cleanName.length < 2 || cleanName.length > 50) {
      return { success: false, error: "Nama kategori harus antara 2 sampai 50 karakter." };
    }
    const slug = slugify(cleanName);
    const { supabase } = await requireAdmin();

    const { data: existing } = await supabase.from("categories").select("id").neq("id", id).or(`name.ilike.${cleanName},slug.eq.${slug}`).maybeSingle();
    if (existing) return { success: false, error: "Nama kategori tersebut sudah digunakan oleh kategori lain." };

    const { error } = await supabase.from("categories").update({ name: cleanName, slug }).eq("id", id);
    if (error) return { success: false, error: error.message || "Gagal memperbarui kategori." };

    ["/admin/kategori", "/admin", "/lowongan"].forEach((p) => revalidatePath(p));
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat memperbarui kategori.");
  }
}

export async function deleteCategoryAction(id: number) {
  try {
    const { supabase } = await requireAdmin();
    const { count } = await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("category_id", id);
    if (count && count > 0) {
      return { success: false, error: `Kategori ini masih digunakan oleh ${count} lowongan pekerjaan dan tidak dapat dihapus.` };
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return { success: false, error: error.message || "Gagal menghapus kategori." };

    ["/admin/kategori", "/admin", "/lowongan"].forEach((p) => revalidatePath(p));
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat menghapus kategori.");
  }
}



