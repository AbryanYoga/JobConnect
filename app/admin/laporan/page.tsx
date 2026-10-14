import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Percent,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  AdminLaporanExportButtons,
  type AdminLaporanExportItem,
} from "@/components/admin/AdminLaporanExportButtons";
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

function formatDateIndo(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
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
      tanggalPengajuan: formatDateIndo(job.created_at),
    };
  });

  return (
    <div className="space-y-8">
      {/* Header Khusus Hasil Cetak PDF */}
      <div className="hidden print:block p-4 border-b border-black space-y-1 mb-6">
        <h1 className="text-xl font-bold text-black">JobConnect Moderator</h1>
        <h2 className="text-sm font-semibold text-slate-700">
          Laporan Rekapitulasi Platform & Aktivitas Moderasi Lowongan
        </h2>
        <p className="text-xs text-slate-500">
          Periode: {formatDateIndo(startDate)} s.d. {formatDateIndo(endDate)} | Dicetak pada: {formatDateIndo(new Date().toISOString())}
        </p>
      </div>

      {/* Header Halaman Rekapitulasi Platform */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-[#FFDD00] text-xs font-bold">
              <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Rekapitulasi Platform Administrator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Rekapitulasi Platform & Moderasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-2xl leading-relaxed">
              Ringkasan metrik agregat volume lowongan, rasio persetujuan moderasi, dan pertumbuhan mitra platform per rentang tanggal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
            <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
              <span className="block font-semibold text-slate-800">Rentang Periode</span>
              <span>
                {formatDateIndo(startDate)} s.d. {formatDateIndo(endDate)}
              </span>
            </div>

            <AdminLaporanExportButtons
              items={exportItems}
              startDate={startDate}
              endDate={endDate}
              disabled={jobsList.length === 0}
            />
          </div>
        </div>

        {/* Panel Filter Rentang Tanggal */}
        <form
          method="GET"
          action="/admin/laporan"
          className="pt-4 border-t border-black/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
        >
          <div>
            <label
              htmlFor="mulai"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Tanggal Mulai
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                id="mulai"
                name="mulai"
                defaultValue={startDate}
                max={endDate}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="selesai"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Tanggal Selesai
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                id="selesai"
                name="selesai"
                defaultValue={endDate}
                min={startDate}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-2xs min-h-[38px]"
            >
              <Filter className="w-3.5 h-3.5 text-[#FFDD00]" aria-hidden="true" />
              <span>Terapkan Periode</span>
            </button>

            {(params.mulai || params.selesai) && (
              <Link
                href="/admin/laporan"
                className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition min-h-[38px]"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Kartu Ringkasan Metrik Platform */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Diajukan</span>
            <FileText className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-black">{totalLowongan}</div>
          <div className="text-[11px] text-slate-500">Lowongan periode ini</div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Disetujui (ACC)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800">{lowonganOpen}</div>
          <div className="text-[11px] text-slate-500">Tayang publik resmi</div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Antrean Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{lowonganPending}</div>
          <div className="text-[11px] text-slate-500">Menunggu verifikasi</div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Tolak / Revisi</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800">{lowonganRejected}</div>
          <div className="text-[11px] text-slate-500">
            Ditolak bersyarat ({lowonganClosed} ditutup)
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Rasio ACC Rate</span>
            <Percent className="w-4 h-4 text-navy-700" />
          </div>
          <div className="text-2xl font-black text-navy-950">{accRate}%</div>
          <div className="text-[11px] text-slate-500">Persentase kelolosan</div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Pengguna Baru</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-950">
            {(newUsersCount ?? 0) + (newCompaniesCount ?? 0)}
          </div>
          <div className="text-[11px] text-slate-500">
            {newCompaniesCount ?? 0} mitra, {newUsersCount ?? 0} pelamar
          </div>
        </div>
      </div>

      {/* Tabel 1: Rekapitulasi per Mitra Perusahaan */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-black">
              Rekapitulasi per Mitra Perusahaan
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Agregat pengajuan lowongan kerja dan status kurasi masing-masing perusahaan pada periode ini.
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600">
            {rekapPerusahaan.length} Mitra Aktif
          </span>
        </div>

        {rekapPerusahaan.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Tidak ada aktivitas pengajuan lowongan dari mitra pada periode ini.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-black/[0.08] text-slate-500 font-bold">
                  <th className="pb-3 pr-4">Nama Perusahaan</th>
                  <th className="pb-3 px-3">Domisili Kantor</th>
                  <th className="pb-3 px-3 text-center">Total Lowongan</th>
                  <th className="pb-3 px-3 text-center">Tayang (Open)</th>
                  <th className="pb-3 px-3 text-center">Pending</th>
                  <th className="pb-3 px-3 text-center">Ditolak</th>
                  <th className="pb-3 pl-3 text-right">Aktivitas Terakhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {rekapPerusahaan.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-navy-950">
                      {c.name}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {c.location}
                    </td>
                    <td className="py-3.5 px-3 text-center font-black text-black">
                      {c.total}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-emerald-800">
                      {c.open}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-amber-800">
                      {c.pending}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-rose-800">
                      {c.rejected}
                    </td>
                    <td className="py-3.5 pl-3 text-right text-slate-500 whitespace-nowrap text-[11px]">
                      {formatDateIndo(c.latestDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabel 2: Rekapitulasi per Kategori Lowongan */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-lg font-black text-black">
            Distribusi Lowongan Berdasarkan Kategori
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Sebaran kebutuhan tenaga kerja pada kategori bidang industri platform.
          </p>
        </div>

        {rekapKategori.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Belum ada data kategori lowongan pada periode ini.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-black/[0.08] text-slate-500 font-bold">
                  <th className="pb-3 pr-4">Nama Bidang Kategori</th>
                  <th className="pb-3 px-3 text-center">Total Lowongan</th>
                  <th className="pb-3 px-3 text-center">Lowongan Tayang</th>
                  <th className="pb-3 pl-3 text-right">Porsi Platform</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {rekapKategori.map((cat) => {
                  const porsi =
                    totalLowongan > 0
                      ? Math.round((cat.total / totalLowongan) * 100)
                      : 0;
                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-navy-950">
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-3 text-center font-black text-black">
                        {cat.total}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-800">
                        {cat.open}
                      </td>
                      <td className="py-3.5 pl-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-bold text-slate-700">{porsi}%</span>
                          <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-navy-900 rounded-full"
                              style={{ width: `${porsi}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabel 3: Rincian Seluruh Lowongan dalam Periode */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-black">
              Rincian Pengajuan Lowongan Periode Ini
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Riwayat lengkap seluruh lowongan yang masuk dalam rentang tanggal terpilih.
            </p>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {jobsList.length} lowongan tercatat
          </span>
        </div>

        {jobsList.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-[#FAF8F0] border border-black/[0.08] space-y-2">
            <BarChart3 className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-black">
              Tidak ada aktivitas platform pada rentang ini.
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Cobalah memilih rentang tanggal yang lebih luas pada filter di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-black/[0.08] text-slate-500 font-bold">
                  <th className="pb-3 pr-2 w-10">No</th>
                  <th className="pb-3 px-3">Tanggal Pengajuan</th>
                  <th className="pb-3 px-3">Judul Lowongan</th>
                  <th className="pb-3 px-3">Perusahaan Mitra</th>
                  <th className="pb-3 px-3">Kategori</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 pl-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {jobsList.map((job, index) => {
                  const rawCompany = Array.isArray(job.company)
                    ? job.company[0]
                    : job.company;
                  const rawCategory = Array.isArray(job.category)
                    ? job.category[0]
                    : job.category;

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 pr-2 text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {formatDateIndo(job.created_at)}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-navy-950">
                        {job.title}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        {rawCompany?.name || "Perusahaan Mitra"}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {rawCategory?.name || "Umum"}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-sm text-[11px] font-bold ${
                            job.status === "open"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : job.status === "pending"
                              ? "bg-amber-50 text-amber-900 border border-amber-200"
                              : job.status === "rejected"
                              ? "bg-rose-50 text-rose-800 border border-rose-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                        <Link
                          href={`/lowongan/${job.slug}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-navy-900 hover:text-navy-700 hover:underline"
                        >
                          <span>Buka Detail</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
