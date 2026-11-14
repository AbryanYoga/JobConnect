"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendApplicationStatusEmailNotification } from "@/lib/email";
import {
  profilPerusahaanSchema,
  validateLogoFile,
  buildLogoPath,
  LOGO_BUCKET,
} from "@/lib/validation/profil";

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

const actionError = (err: unknown, fallback: string) => ({
  success: false as const,
  error: err instanceof Error ? err.message : fallback,
});

async function requireCompanyUser() {
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
    .select("name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "company") {
    throw new Error("Hanya akun perusahaan mitra yang dapat melakukan tindakan ini.");
  }

  const { data: company } = await supabase
    .from("companies")
    .select("id, name, city_id, logo_path, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  return { supabase, user, profile, company };
}

async function resolveCategoryId(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  rawData: Record<string, unknown>
): Promise<number | null> {
  const customName =
    typeof rawData.customCategoryName === "string"
      ? rawData.customCategoryName.trim()
      : "";

  if (customName && (rawData.categoryId === "custom" || !rawData.categoryId)) {
    try {
      const { data: rpcId, error: rpcErr } = await supabase.rpc(
        "get_or_create_category",
        { p_name: customName }
      );
      if (!rpcErr && rpcId) {
        return Number(rpcId);
      }
    } catch {
      // Abaikan jika RPC belum dieksekusi di database
    }

    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", customName)
      .maybeSingle();

    if (existing?.id) {
      return Number(existing.id);
    }

    const baseSlug = slugify(customName) || "kategori";
    const { data: newCat } = await supabase
      .from("categories")
      .insert({
        name: customName,
        slug: `${baseSlug}-${Date.now().toString().slice(-4)}`,
      })
      .select("id")
      .maybeSingle();

    if (newCat?.id) {
      return Number(newCat.id);
    }
  }

  return rawData.categoryId && rawData.categoryId !== "custom"
    ? Number(rawData.categoryId)
    : null;
}

function buildJobPayload(companyId: number, rawData: Record<string, unknown>, status: string) {
  const cleanTitle = typeof rawData.title === "string" && rawData.title.trim() ? rawData.title.trim() : "Draft Lowongan";
  const rawSkills = Array.isArray(rawData.skills) ? (rawData.skills as string[]).filter(Boolean) : [];
  const rawResp = Array.isArray(rawData.responsibilities) ? (rawData.responsibilities as string[]).filter(Boolean) : [];
  const rawNice = Array.isArray(rawData.niceToHave) ? (rawData.niceToHave as string[]).filter(Boolean) : [];
  const rawBenefits = Array.isArray(rawData.benefits) ? (rawData.benefits as string[]).filter(Boolean) : [];
  return {
    company_id: companyId,
    title: cleanTitle,
    category_id: rawData.categoryId ? Number(rawData.categoryId) : null,
    city_id: rawData.cityId ? Number(rawData.cityId) : null,
    location_detail: typeof rawData.locationDetail === "string" && rawData.locationDetail.trim() ? rawData.locationDetail.trim() : null,
    work_mode: typeof rawData.workMode === "string" ? rawData.workMode : "onsite",
    job_type: typeof rawData.jobType === "string" ? rawData.jobType : "full_time",
    education_min: typeof rawData.educationMin === "string" ? rawData.educationMin : "sma_smk",
    experience_min_years: Number(rawData.experienceMinYears) || 0,
    skills: rawSkills,
    summary: typeof rawData.summary === "string" && rawData.summary.trim() ? rawData.summary.trim() : null,
    responsibilities: rawResp,
    nice_to_have: rawNice,
    benefits: rawBenefits,
    salary_min: rawData.salaryMin ? Number(rawData.salaryMin) : null,
    salary_max: rawData.salaryMax ? Number(rawData.salaryMax) : null,
    deadline: typeof rawData.deadline === "string" && rawData.deadline.trim() ? rawData.deadline.trim() : null,
    ai_screening: Boolean(rawData.aiScreening),
    status,
  };
}

export async function updateProfilPerusahaanAction(rawData: unknown) {
  const val = profilPerusahaanSchema.safeParse(rawData);
  if (!val.success) {
    return { success: false, error: "Data profil perusahaan tidak valid. Silakan periksa kembali isian formulir." };
  }
  const { name, website, industry, size, cityId, addressNote, description } = val.data;

  try {
    const { supabase, user, company } = await requireCompanyUser();
    if (company) {
      const { error } = await supabase.from("companies").update({
        name, website, industry, size, city_id: cityId, address_note: addressNote, description,
      }).eq("id", company.id);
      if (error) return { success: false, error: error.message || "Gagal memperbarui profil perusahaan." };
    } else {
      const baseSlug = slugify(name) || "perusahaan";
      const { data: slugCheck } = await supabase.from("companies").select("id").eq("slug", baseSlug).maybeSingle();
      const uniqueSlug = slugCheck ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
      const { error } = await supabase.from("companies").insert({
        owner_id: user.id, name, slug: uniqueSlug, website, industry, size, city_id: cityId, address_note: addressNote, description,
      });
      if (error) return { success: false, error: error.message || "Gagal membuat data perusahaan baru." };
    }
    await supabase.from("profiles").update({ name }).eq("id", user.id);
    revalidatePath("/mitra/profil-perusahaan");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat menyimpan profil perusahaan.");
  }
}

export async function uploadCompanyLogoAction(formData: FormData) {
  const file = formData.get("logo");
  if (!file || !(file instanceof File)) {
    return { success: false, error: "Berkas logo tidak ditemukan. Silakan pilih berkas gambar." };
  }
  const val = await validateLogoFile(file);
  if (!val.ok) return { success: false, error: val.message };

  try {
    const { supabase, user, profile, company } = await requireCompanyUser();
    let comp: { id: number; logo_path: string | null } | null = company;
    if (!comp) {
      const companyName = profile?.name || "Perusahaan Mitra";
      const baseSlug = slugify(companyName) || "perusahaan";
      const { data: slugCheck } = await supabase.from("companies").select("id").eq("slug", baseSlug).maybeSingle();
      const uniqueSlug = slugCheck ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;
      const { data: newComp, error: insertError } = await supabase.from("companies").insert({
        owner_id: user.id, name: companyName, slug: uniqueSlug,
      }).select("id, logo_path").single();
      if (insertError || !newComp) {
        return { success: false, error: "Gagal membuat data awal perusahaan. Simpan profil terlebih dahulu." };
      }
      comp = newComp;
    }

    const storagePath = buildLogoPath(comp!.id, val.extension);
    const { error: uploadError } = await supabase.storage.from(LOGO_BUCKET).upload(storagePath, file, { contentType: file.type, upsert: true });
    if (uploadError) return { success: false, error: uploadError.message || "Gagal mengunggah logo ke penyimpanan storage." };

    if (comp!.logo_path && comp!.logo_path !== storagePath) {
      await supabase.storage.from(LOGO_BUCKET).remove([comp!.logo_path]);
    }
    const { error: updateError } = await supabase.from("companies").update({ logo_path: storagePath }).eq("id", comp!.id);
    if (updateError) return { success: false, error: "Gagal memperbarui referensi logo perusahaan di database." };

    const { data: publicUrlData } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(storagePath);
    await supabase.from("profiles").update({ avatar_url: publicUrlData.publicUrl }).eq("id", user.id);
    revalidatePath("/mitra/profil-perusahaan");
    revalidatePath("/", "layout");
    return { success: true, logoPath: storagePath, publicUrl: publicUrlData.publicUrl };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat memproses unggah logo.");
  }
}

export async function deleteCompanyLogoAction() {
  try {
    const { supabase, user, company } = await requireCompanyUser();
    if (!company?.logo_path) return { success: false, error: "Tidak ada logo perusahaan yang dapat dihapus." };

    await supabase.storage.from(LOGO_BUCKET).remove([company.logo_path]);
    const { error } = await supabase.from("companies").update({ logo_path: null }).eq("id", company.id);
    if (error) return { success: false, error: "Gagal menghapus referensi logo dari profil perusahaan." };

    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    revalidatePath("/mitra/profil-perusahaan");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat menghapus logo.");
  }
}

export async function saveJobDraftAction(rawData: Record<string, unknown>) {
  try {
    const { supabase, company } = await requireCompanyUser();
    if (!company) return { success: false, error: "Profil perusahaan belum terdaftar." };

    const resolvedCategoryId = await resolveCategoryId(supabase, rawData);
    const payload = buildJobPayload(company.id, { ...rawData, categoryId: resolvedCategoryId }, "draft");
    const rawId = typeof rawData.id === "number" ? rawData.id : undefined;
    if (rawId) {
      const { error } = await supabase.from("jobs").update(payload).eq("id", rawId).eq("company_id", company.id);
      if (error) return { success: false, error: error.message };
      revalidatePath("/mitra/lowongan");
      return { success: true, jobId: rawId, message: "Draft lowongan berhasil diperbarui." };
    }
    const baseSlug = slugify(payload.title) || "lowongan";
    const { data: newJob, error } = await supabase.from("jobs").insert({ ...payload, slug: `${baseSlug}-${Date.now().toString().slice(-6)}` }).select("id").single();
    if (error || !newJob) return { success: false, error: error?.message || "Gagal menyimpan draft lowongan." };

    revalidatePath("/mitra/lowongan");
    return { success: true, jobId: newJob.id, message: "Draft lowongan berhasil disimpan." };
  } catch (err) {
    return actionError(err, "Gagal menyimpan draft.");
  }
}

export async function submitJobAction(rawData: Record<string, unknown>) {
  try {
    const { supabase, company } = await requireCompanyUser();
    if (!company) return { success: false, error: "Profil perusahaan belum terdaftar." };
    if (!company.name || !company.city_id) return { success: false, error: "Profil perusahaan wajib dilengkapi sebelum mengajukan lowongan." };

    const resolvedCategoryId = await resolveCategoryId(supabase, rawData);
    const payload = buildJobPayload(company.id, { ...rawData, categoryId: resolvedCategoryId }, "draft");
    const rawId = typeof rawData.id === "number" ? rawData.id : undefined;
    let targetJobId: number;
    if (rawId) {
      targetJobId = rawId;
      const { error } = await supabase.from("jobs").update(payload).eq("id", targetJobId).eq("company_id", company.id);
      if (error) return { success: false, error: error.message };
    } else {
      const baseSlug = slugify(payload.title) || "lowongan";
      const { data: newJob, error } = await supabase.from("jobs").insert({ ...payload, slug: `${baseSlug}-${Date.now().toString().slice(-6)}` }).select("id").single();
      if (error || !newJob) return { success: false, error: error?.message || "Gagal membuat lowongan." };
      targetJobId = newJob.id;
    }

    const { error: rpcError } = await supabase.rpc("submit_job", { p_job_id: targetJobId });
    if (rpcError) return { success: false, error: rpcError.message || "Gagal mengajukan lowongan untuk peninjauan admin." };

    ["/mitra/lowongan", "/mitra"].forEach((p) => revalidatePath(p));
    return { success: true, jobId: targetJobId, message: "Lowongan berhasil diajukan dan sedang dalam antrean review admin." };
  } catch (err) {
    return actionError(err, "Gagal mengajukan lowongan.");
  }
}

export async function closeJobAction(jobId: number) {
  try {
    const { supabase, company } = await requireCompanyUser();
    if (!company) return { success: false, error: "Profil perusahaan tidak ditemukan." };

    const { data: job, error: jobError } = await supabase.from("jobs").select("id, status, slug").eq("id", jobId).eq("company_id", company.id).maybeSingle();
    if (jobError || !job) return { success: false, error: "Lowongan tidak ditemukan atau Anda tidak berwenang mengelolanya." };
    if (job.status === "closed") return { success: false, error: "Lowongan ini sudah dalam status ditutup." };
    if (job.status !== "open") return { success: false, error: `Lowongan dengan status ${job.status} tidak dapat ditutup langsung.` };

    const { error: updateError } = await supabase.from("jobs").update({ status: "closed" }).eq("id", jobId).eq("company_id", company.id);
    if (updateError) return { success: false, error: updateError.message || "Gagal menutup lowongan." };

    ["/mitra/lowongan", "/mitra", "/lowongan", ...(job.slug ? [`/lowongan/${job.slug}`] : [])].forEach((p) => revalidatePath(p));
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat menutup lowongan.");
  }
}

export async function getApplicantCvUrlAction(applicationId: number) {
  try {
    const { supabase, company } = await requireCompanyUser();
    if (!company) return { success: false, error: "Profil perusahaan belum terdaftar." };

    const { data: app, error } = await supabase.from("applications").select("id, cv_path, job_id, jobs:job_id (company_id)").eq("id", applicationId).maybeSingle();
    if (error || !app) return { success: false, error: "Lamaran tidak ditemukan." };

    const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
    const jobCompanyId = job && typeof job === "object" && "company_id" in job ? (job as { company_id: number }).company_id : null;
    if (jobCompanyId !== company.id) {
      return { success: false, error: "Anda tidak memiliki wewenang untuk mengakses CV pelamar ini." };
    }

    const { data: signedData, error: signError } = await supabase.storage.from("cvs").createSignedUrl(app.cv_path, 300);
    if (signError || !signedData?.signedUrl) return { success: false, error: signError?.message || "Gagal membuat URL aman untuk berkas CV." };

    return { success: true, signedUrl: signedData.signedUrl };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat memproses CV.");
  }
}

export async function addApplicationNoteAction(applicationId: number, noteText: string) {
  try {
    const cleanNote = noteText?.trim();
    if (!cleanNote) return { success: false, error: "Catatan internal tidak boleh kosong." };
    if (cleanNote.length > 2000) return { success: false, error: "Catatan internal maksimal 2000 karakter." };

    const { supabase, user, company } = await requireCompanyUser();
    if (!company) return { success: false, error: "Profil perusahaan belum terdaftar." };

    const { data: app, error: appError } = await supabase.from("applications").select("id, job_id, jobs:job_id (company_id)").eq("id", applicationId).maybeSingle();
    if (appError || !app) return { success: false, error: "Lamaran tidak ditemukan." };

    const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
    const jobCompanyId = job && typeof job === "object" && "company_id" in job ? (job as { company_id: number }).company_id : null;
    if (jobCompanyId !== company.id) {
      return { success: false, error: "Anda tidak berhak menambah catatan pada lamaran ini." };
    }

    const { error: insertError } = await supabase.from("application_notes").insert({ application_id: applicationId, author_id: user.id, note: cleanNote });
    if (insertError) return { success: false, error: insertError.message || "Gagal menyimpan catatan internal." };

    revalidatePath(`/mitra/pelamar/${applicationId}`);
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat menyimpan catatan.");
  }
}

export async function deleteApplicationNoteAction(noteId: number, applicationId: number) {
  try {
    const { supabase } = await requireCompanyUser();
    const { error } = await supabase.from("application_notes").delete().eq("id", noteId).eq("application_id", applicationId);
    if (error) return { success: false, error: error.message || "Gagal menghapus catatan." };

    revalidatePath(`/mitra/pelamar/${applicationId}`);
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat menghapus catatan.");
  }
}

export async function updateApplicationStatusAction({
  applicationId,
  toStatus,
  message,
  interviewAt,
  interviewPlace,
}: {
  applicationId: number;
  toStatus: string;
  message?: string;
  interviewAt?: string;
  interviewPlace?: string;
}) {
  try {
    const { supabase } = await requireCompanyUser();
    const { error: rpcError } = await supabase.rpc("change_application_status", {
      p_application_id: applicationId,
      p_to_status: toStatus,
      p_message: message || null,
      p_interview_at: interviewAt || null,
      p_interview_place: interviewPlace || null,
    });
    if (rpcError) return { success: false, error: rpcError.message || "Gagal memperbarui status lamaran." };

    sendApplicationStatusEmailNotification({
      applicationId,
      toStatus,
      message,
      interviewAt,
      interviewPlace,
    }).catch(() => {});

    revalidatePath(`/mitra/pelamar/${applicationId}`);
    return { success: true };
  } catch (err) {
    return actionError(err, "Terjadi kesalahan saat memproses status lamaran.");
  }
}

export async function switchToCompanyAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi login tidak valid. Silakan masuk terlebih dahulu." };
    }

    const { error: rpcError } = await supabase.rpc("register_as_company");
    if (rpcError) {
      return { success: false, error: rpcError.message || "Gagal mengalihkan peran menjadi mitra perusahaan. Pastikan fungsi database telah terpasang." };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    return actionError(err, "Gagal mengalihkan akun ke mitra perusahaan.");
  }
}


