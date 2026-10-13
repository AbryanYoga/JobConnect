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

/**
 * Server Action untuk menyimpan lowongan sebagai draft.
 */
export async function saveJobDraftAction(rawData: {
  id?: number;
  title: string;
  summary?: string;
  categoryId?: number | "";
  provinceId?: number | "";
  cityId?: number | "";
  locationDetail?: string;
  workMode: string;
  jobType: string;
  educationMin: string;
  experienceMinYears?: number;
  skills: string[];
  responsibilities: string[];
  niceToHave?: string[];
  benefits?: string[];
  salaryMin?: number | "";
  salaryMax?: number | "";
  deadline?: string;
  aiScreening?: boolean;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi login Anda telah berakhir." };
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!company) {
      return { success: false, error: "Profil perusahaan belum terdaftar." };
    }

    const cleanTitle = rawData.title?.trim() || "Draft Lowongan";
    const baseSlug = slugify(cleanTitle) || "lowongan";
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const payload = {
      company_id: company.id,
      title: cleanTitle,
      category_id: rawData.categoryId ? Number(rawData.categoryId) : null,
      city_id: rawData.cityId ? Number(rawData.cityId) : null,
      location_detail: rawData.locationDetail?.trim() || null,
      work_mode: rawData.workMode || "onsite",
      job_type: rawData.jobType || "full_time",
      education_min: rawData.educationMin || "sma_smk",
      experience_min_years: Number(rawData.experienceMinYears) || 0,
      skills: rawData.skills.filter(Boolean),
      summary: rawData.summary?.trim() || null,
      responsibilities: rawData.responsibilities.filter(Boolean),
      nice_to_have: (rawData.niceToHave || []).filter(Boolean),
      benefits: (rawData.benefits || []).filter(Boolean),
      salary_min: rawData.salaryMin ? Number(rawData.salaryMin) : null,
      salary_max: rawData.salaryMax ? Number(rawData.salaryMax) : null,
      deadline: rawData.deadline?.trim() || null,
      ai_screening: Boolean(rawData.aiScreening),
      status: "draft",
    };

    if (rawData.id) {
      const { error: updateError } = await supabase
        .from("jobs")
        .update(payload)
        .eq("id", rawData.id)
        .eq("company_id", company.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
      revalidatePath("/mitra/lowongan");
      return { success: true, jobId: rawData.id, message: "Draft lowongan berhasil diperbarui." };
    } else {
      const { data: newJob, error: insertError } = await supabase
        .from("jobs")
        .insert({
          ...payload,
          slug: uniqueSlug,
        })
        .select("id")
        .single();

      if (insertError) {
        return { success: false, error: insertError.message };
      }
      revalidatePath("/mitra/lowongan");
      return { success: true, jobId: newJob.id, message: "Draft lowongan berhasil disimpan." };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal menyimpan draft.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action untuk mengajukan lowongan ke admin (memanggil fungsi submit_job).
 */
export async function submitJobAction(rawData: {
  id?: number;
  title: string;
  summary: string;
  categoryId: number | "";
  cityId?: number | "";
  locationDetail?: string;
  workMode: string;
  jobType: string;
  educationMin: string;
  experienceMinYears?: number;
  skills: string[];
  responsibilities: string[];
  niceToHave?: string[];
  benefits?: string[];
  salaryMin?: number | "";
  salaryMax?: number | "";
  deadline: string;
  aiScreening?: boolean;
}) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi login Anda telah berakhir." };
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id, name, city_id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!company) {
      return { success: false, error: "Profil perusahaan belum terdaftar." };
    }

    if (!company.name || !company.city_id) {
      return { success: false, error: "Profil perusahaan wajib dilengkapi sebelum mengajukan lowongan." };
    }

    // 1. Simpan atau perbarui data lowongan terlebih dahulu
    const cleanTitle = rawData.title.trim();
    const baseSlug = slugify(cleanTitle) || "lowongan";
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const payload = {
      company_id: company.id,
      title: cleanTitle,
      category_id: rawData.categoryId ? Number(rawData.categoryId) : null,
      city_id: rawData.cityId ? Number(rawData.cityId) : null,
      location_detail: rawData.locationDetail?.trim() || null,
      work_mode: rawData.workMode,
      job_type: rawData.jobType,
      education_min: rawData.educationMin,
      experience_min_years: Number(rawData.experienceMinYears) || 0,
      skills: rawData.skills.filter(Boolean),
      summary: rawData.summary.trim(),
      responsibilities: rawData.responsibilities.filter(Boolean),
      nice_to_have: (rawData.niceToHave || []).filter(Boolean),
      benefits: (rawData.benefits || []).filter(Boolean),
      salary_min: rawData.salaryMin ? Number(rawData.salaryMin) : null,
      salary_max: rawData.salaryMax ? Number(rawData.salaryMax) : null,
      deadline: rawData.deadline.trim(),
      ai_screening: Boolean(rawData.aiScreening),
      status: "draft",
    };

    let targetJobId: number;

    if (rawData.id) {
      targetJobId = rawData.id;
      const { error: updateError } = await supabase
        .from("jobs")
        .update(payload)
        .eq("id", targetJobId)
        .eq("company_id", company.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    } else {
      const { data: newJob, error: insertError } = await supabase
        .from("jobs")
        .insert({
          ...payload,
          slug: uniqueSlug,
        })
        .select("id")
        .single();

      if (insertError) {
        return { success: false, error: insertError.message };
      }
      targetJobId = newJob.id;
    }

    // 2. Panggil fungsi database submit_job untuk validasi menyeluruh dan mengubah status menjadi pending
    const { error: rpcError } = await supabase.rpc("submit_job", {
      p_job_id: targetJobId,
    });

    if (rpcError) {
      return {
        success: false,
        error: rpcError.message || "Gagal mengajukan lowongan untuk peninjauan admin.",
      };
    }

    revalidatePath("/mitra/lowongan");
    revalidatePath("/mitra");
    return {
      success: true,
      jobId: targetJobId,
      message: "Lowongan berhasil diajukan dan sedang dalam antrean review admin.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Gagal mengajukan lowongan.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action untuk menutup lowongan perusahaan (mengubah status open menjadi closed).
 */
export async function closeJobAction(jobId: number) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi login telah berakhir. Silakan masuk kembali." };
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!company) {
      return { success: false, error: "Profil perusahaan tidak ditemukan." };
    }

    // Ambil data lowongan
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, status, slug")
      .eq("id", jobId)
      .eq("company_id", company.id)
      .maybeSingle();

    if (jobError || !job) {
      return {
        success: false,
        error: "Lowongan tidak ditemukan atau Anda tidak berwenang mengelolanya.",
      };
    }

    if (job.status === "closed") {
      return { success: false, error: "Lowongan ini sudah dalam status ditutup." };
    }

    if (job.status !== "open") {
      return {
        success: false,
        error: `Lowongan dengan status ${job.status} tidak dapat ditutup langsung.`,
      };
    }

    const { error: updateError } = await supabase
      .from("jobs")
      .update({ status: "closed" })
      .eq("id", jobId)
      .eq("company_id", company.id);

    if (updateError) {
      return { success: false, error: updateError.message || "Gagal menutup lowongan." };
    }

    revalidatePath("/mitra/lowongan");
    revalidatePath("/mitra");
    if (job.slug) {
      revalidatePath(`/lowongan/${job.slug}`);
    }
    revalidatePath("/lowongan");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menutup lowongan.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action untuk mendapatkan signed URL berkas CV pelamar (berlaku 5 menit).
 * Memeriksa hak kepemilikan lowongan oleh perusahaan sebelum membuat URL aman.
 */
export async function getApplicantCvUrlAction(applicationId: number) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi login Anda telah berakhir." };
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!company) {
      return { success: false, error: "Profil perusahaan belum terdaftar." };
    }

    // Ambil data lamaran beserta relasi lowongannya
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        cv_path,
        job_id,
        jobs:job_id (
          company_id
        )
      `)
      .eq("id", applicationId)
      .maybeSingle();

    if (appError || !application) {
      return { success: false, error: "Lamaran tidak ditemukan." };
    }

    type AppWithJob = {
      id: number;
      cv_path: string;
      job_id: number;
      jobs: { company_id: number } | { company_id: number }[] | null;
    };

    const typedApp = application as unknown as AppWithJob;
    const job = Array.isArray(typedApp.jobs) ? typedApp.jobs[0] : typedApp.jobs;
    if (!job || job.company_id !== company.id) {
      return {
        success: false,
        error: "Anda tidak memiliki wewenang untuk mengakses CV pelamar ini.",
      };
    }

    // Buat signed URL dari bucket privat cvs (berlaku 300 detik / 5 menit)
    const { data: signedData, error: signError } = await supabase.storage
      .from("cvs")
      .createSignedUrl(typedApp.cv_path, 300);

    if (signError || !signedData?.signedUrl) {
      return {
        success: false,
        error: signError?.message || "Gagal membuat URL aman untuk berkas CV.",
      };
    }

    return { success: true, signedUrl: signedData.signedUrl };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memproses CV.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action untuk menambahkan catatan internal perusahaan pada kandidat pelamar.
 * Catatan ini bersifat privat dan hanya dapat dibaca oleh tim perusahaan pemilik lowongan.
 */
export async function addApplicationNoteAction(
  applicationId: number,
  noteText: string
) {
  try {
    const cleanNote = noteText?.trim();
    if (!cleanNote || cleanNote.length === 0) {
      return { success: false, error: "Catatan internal tidak boleh kosong." };
    }
    if (cleanNote.length > 2000) {
      return {
        success: false,
        error: "Catatan internal maksimal 2000 karakter.",
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi login Anda telah berakhir." };
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (!company) {
      return { success: false, error: "Profil perusahaan belum terdaftar." };
    }

    // Periksa kepemilikan lowongan dari lamaran ini
    const { data: application, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        job_id,
        jobs:job_id (
          company_id
        )
      `)
      .eq("id", applicationId)
      .maybeSingle();

    if (appError || !application) {
      return { success: false, error: "Lamaran tidak ditemukan." };
    }

    type AppWithJob = {
      id: number;
      job_id: number;
      jobs: { company_id: number } | { company_id: number }[] | null;
    };
    const typedApp = application as unknown as AppWithJob;
    const job = Array.isArray(typedApp.jobs) ? typedApp.jobs[0] : typedApp.jobs;
    if (!job || job.company_id !== company.id) {
      return {
        success: false,
        error: "Anda tidak berhak menambah catatan pada lamaran ini.",
      };
    }

    const { error: insertError } = await supabase
      .from("application_notes")
      .insert({
        application_id: applicationId,
        author_id: user.id,
        note: cleanNote,
      });

    if (insertError) {
      return {
        success: false,
        error: insertError.message || "Gagal menyimpan catatan internal.",
      };
    }

    revalidatePath(`/mitra/pelamar/${applicationId}`);
    return { success: true };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat menyimpan catatan.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action untuk menghapus catatan internal perusahaan pada kandidat pelamar.
 */
export async function deleteApplicationNoteAction(
  noteId: number,
  applicationId: number
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi login Anda telah berakhir." };
    }

    const { error: deleteError } = await supabase
      .from("application_notes")
      .delete()
      .eq("id", noteId)
      .eq("application_id", applicationId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message || "Gagal menghapus catatan.",
      };
    }

    revalidatePath(`/mitra/pelamar/${applicationId}`);
    return { success: true };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat menghapus catatan.";
    return { success: false, error: msg };
  }
}

/**
 * Server Action untuk mengubah status lamaran kerja menggunakan fungsi change_application_status.
 * Memvalidasi transisi status sah dan mencatat riwayat perubahan status di database.
 */
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
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Sesi login Anda telah berakhir." };
    }

    const { error: rpcError } = await supabase.rpc(
      "change_application_status",
      {
        p_application_id: applicationId,
        p_to_status: toStatus,
        p_message: message || null,
        p_interview_at: interviewAt || null,
        p_interview_place: interviewPlace || null,
      }
    );

    if (rpcError) {
      return {
        success: false,
        error: rpcError.message || "Gagal memperbarui status lamaran.",
      };
    }

    // Kirim notifikasi email kepada pelamar jika mengaktifkan notifikasi email
    sendApplicationStatusEmailNotification({
      applicationId,
      toStatus,
      message,
      interviewAt,
      interviewPlace,
    }).catch((err) => {
      console.error("[Email Notification Trigger Error]", err);
    });

    revalidatePath(`/mitra/pelamar/${applicationId}`);
    return { success: true };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Terjadi kesalahan saat memproses status lamaran.";
    return { success: false, error: msg };
  }
}


