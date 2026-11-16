import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  AdminLaporanView,
  type AdminLaporanJobDetailItem,
} from "@/components/admin/AdminLaporanView";
import type { AdminLaporanExportItem } from "@/components/admin/AdminLaporanExportButtons";
import { JOB_TYPE_LABEL, type JobType } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Rekapitulasi Platform",
  description:
    "Laporan agregat operasional, pengajuan lowongan, dan verifikasi kurasi platform JobConnect.",
};

interface AdminLaporanPageProps {
  searchParams: Promise<{
    mulai?: string;
    selesai?: string;
  }>;
}

export default async function AdminLaporanPage({ searchParams }: AdminLaporanPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=/admin/laporan");
  }

  // Verifikasi akun admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/403");
  }

  // Tentukan rentang tanggal default (30 hari terakhir)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const defaultStartDate = thirtyDaysAgo.toISOString().split("T")[0];
  const defaultEndDate = today.toISOString().split("T")[0];

  const startDate = params.mulai || defaultStartDate;
  const endDate = params.selesai || defaultEndDate;

  // 1. Ambil data lowongan agregat dalam rentang tanggal
  const { data: rawJobs, error: jobsError } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      slug,
      status,
      job_type,
      work_mode,
      created_at,
      updated_at,
      category:categories (id, name, slug),
      company:companies (
        id,
        name,
        slug,
        city:cities (
          name,
          province:provinces (name)
        )
      )
    `)
    .gte("created_at", `${startDate}T00:00:00Z`)
    .lte("created_at", `${endDate}T23:59:59Z`)
    .order("created_at", { ascending: false });

  // 2. Ambil metrik penambahan akun baru dalam rentang tanggal
  const [{ count: newCompaniesCount }, { count: newUsersCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "company")
        .gte("created_at", `${startDate}T00:00:00Z`)
        .lte("created_at", `${endDate}T23:59:59Z`),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "user")
        .gte("created_at", `${startDate}T00:00:00Z`)
        .lte("created_at", `${endDate}T23:59:59Z`),
    ]);

  const jobsList = (!jobsError && rawJobs) || [];

  // Hitung metrik agregat
  const totalLowongan = jobsList.length;
  const lowonganOpen = jobsList.filter((j) => j.status === "open").length;
  const lowonganPending = jobsList.filter((j) => j.status === "pending").length;
  const lowonganRejected = jobsList.filter(
    (j) => j.status === "rejected"
  ).length;
  const lowonganClosed = jobsList.filter((j) =>
    ["closed", "removed"].includes(j.status)
  ).length;

  const totalDiputuskan = lowonganOpen + lowonganRejected;
  const accRate =
    totalDiputuskan > 0
      ? Math.round((lowonganOpen / totalDiputuskan) * 100)
      : 0;

  // 3. Rekapitulasi per Mitra Perusahaan (Agregat)
  const companyMap = new Map<
    number,
    {
      id: number;
      name: string;
      slug: string;
      location: string;
      total: number;
      open: number;
      pending: number;
      rejected: number;
      latestDate: string;
    }
  >();

  jobsList.forEach((job) => {
    const rawCompany = Array.isArray(job.company)
      ? job.company[0]
      : job.company;
    if (!rawCompany) return;

    const companyId = rawCompany.id;
    const rawCity = rawCompany.city
      ? Array.isArray(rawCompany.city)
        ? rawCompany.city[0]
        : rawCompany.city
      : null;
    const rawProvince = rawCity?.province
      ? Array.isArray(rawCity.province)
        ? rawCity.province[0]
        : rawCity.province
      : null;
    const locationText = [rawCity?.name, rawProvince?.name]
      .filter(Boolean)
      .join(", ") || "Indonesia";

    const existing = companyMap.get(companyId);
    if (!existing) {
      companyMap.set(companyId, {
        id: companyId,
        name: rawCompany.name,
        slug: rawCompany.slug,
        location: locationText,
        total: 1,
        open: job.status === "open" ? 1 : 0,
        pending: job.status === "pending" ? 1 : 0,
        rejected: job.status === "rejected" ? 1 : 0,
        latestDate: job.created_at,
      });
    } else {
      existing.total += 1;
      if (job.status === "open") existing.open += 1;
      if (job.status === "pending") existing.pending += 1;
      if (job.status === "rejected") existing.rejected += 1;
      if (new Date(job.created_at) > new Date(existing.latestDate)) {
        existing.latestDate = job.created_at;
      }
    }
  });

  const rekapPerusahaan = Array.from(companyMap.values()).sort(
    (a, b) => b.total - a.total
  );

  // 4. Rekapitulasi per Kategori Lowongan
  const categoryMap = new Map<
    number,
    {
      id: number;
      name: string;
      total: number;
      open: number;
    }
  >();

  jobsList.forEach((job) => {
    const rawCategory = Array.isArray(job.category)
      ? job.category[0]
      : job.category;
    if (!rawCategory) return;

    const catId = rawCategory.id;
    const existing = categoryMap.get(catId);
    if (!existing) {
      categoryMap.set(catId, {
        id: catId,
        name: rawCategory.name,
        total: 1,
        open: job.status === "open" ? 1 : 0,
      });
    } else {
      existing.total += 1;
      if (job.status === "open") existing.open += 1;
    }
  });

  const rekapKategori = Array.from(categoryMap.values()).sort(
    (a, b) => b.total - a.total
  );

  // Siapkan data untuk tabel rincian
  const formattedJobsList: AdminLaporanJobDetailItem[] = jobsList.map((job) => {
    const rawCompany = Array.isArray(job.company)
      ? job.company[0]
      : job.company;
    const rawCategory = Array.isArray(job.category)
      ? job.category[0]
      : job.category;

    return {
      id: job.id,
      title: job.title,
      slug: job.slug,
      status: job.status,
      created_at: job.created_at,
      companyName: rawCompany?.name || "Perusahaan Mitra",
      categoryName: rawCategory?.name || "Umum",
    };
  });

  // Siapkan data untuk ekspor CSV
  const exportItems: AdminLaporanExportItem[] = jobsList.map((job, index) => {
    const rawCompany = Array.isArray(job.company)
      ? job.company[0]
      : job.company;
    const rawCategory = Array.isArray(job.category)
      ? job.category[0]
      : job.category;

    return {
      no: index + 1,
      judulLowongan: job.title,
      namaPerusahaan: rawCompany?.name || "Perusahaan Mitra",
      kategori: rawCategory?.name || "Umum",
      tipeKerja: JOB_TYPE_LABEL[job.job_type as JobType] || job.job_type,
      status: job.status,
      tanggalPengajuan: job.created_at,
    };
  });

  return (
    <AdminLaporanView
      startDate={startDate}
      endDate={endDate}
      totalLowongan={totalLowongan}
      lowonganOpen={lowonganOpen}
      lowonganPending={lowonganPending}
      lowonganRejected={lowonganRejected}
      lowonganClosed={lowonganClosed}
      accRate={accRate}
      newCompaniesCount={newCompaniesCount ?? 0}
      newUsersCount={newUsersCount ?? 0}
      rekapPerusahaan={rekapPerusahaan}
      rekapKategori={rekapKategori}
      jobsList={formattedJobsList}
      exportItems={exportItems}
      isFiltered={Boolean(params.mulai || params.selesai)}
    />
  );
}
