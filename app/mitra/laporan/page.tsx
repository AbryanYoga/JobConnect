import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Filter,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Briefcase,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge, type ApplicationStatus } from "@/components/ui/StatusBadge";

export const metadata: Metadata = {
  title: "Laporan Rekapitulasi Pelamar - Mitra JobConnect",
  description:
    "Laporan berkala rekapitulasi pengajuan lamaran dan alur seleksi kandidat perusahaan mitra JobConnect.",
};

interface LaporanPageProps {
  searchParams: Promise<{
    mulai?: string;
    selesai?: string;
    lowongan?: string;
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

export default async function LaporanMitraPage({ searchParams }: LaporanPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/mitra/laporan");
  }

  // Ambil data perusahaan yang dimiliki oleh akun mitra ini
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!company) {
    redirect("/mitra/profil-perusahaan");
  }

  // Tentukan batas rentang tanggal (default 30 hari terakhir)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const defaultStartDate = thirtyDaysAgo.toISOString().split("T")[0];
  const defaultEndDate = today.toISOString().split("T")[0];

  const startDate = params.mulai || defaultStartDate;
  const endDate = params.selesai || defaultEndDate;
  const selectedJobId = params.lowongan ? Number(params.lowongan) : null;

  // 1. Ambil daftar lowongan milik perusahaan untuk dropdown filter dan rekapitulasi
  const { data: companyJobs } = await supabase
    .from("jobs")
    .select("id, title, status, created_at")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const jobsList = companyJobs || [];
  const jobIds = jobsList.map((j) => j.id);

  // 2. Ambil data lamaran dalam rentang tanggal
  let applications: Array<{
    id: number;
    job_id: number;
    user_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    decided_at: string | null;
    applicant: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    } | null;
    jobTitle?: string;
  }> = [];

  if (jobIds.length > 0) {
    const targetJobIds = selectedJobId ? [selectedJobId] : jobIds;

    const { data: appData, error: appError } = await supabase
      .from("applications")
      .select(`
        id,
        job_id,
        user_id,
        status,
        created_at,
        updated_at,
        decided_at,
        applicant:profiles!user_id(id, name, email, phone)
      `)
      .in("job_id", targetJobIds)
      .gte("created_at", `${startDate}T00:00:00Z`)
      .lte("created_at", `${endDate}T23:59:59Z`)
      .order("created_at", { ascending: false });

    if (!appError && appData) {
      // Petakan judul lowongan
      const jobTitleMap = new Map<number, string>();
      jobsList.forEach((j) => jobTitleMap.set(j.id, j.title));

      applications = appData.map((item) => {
        const applicantData = Array.isArray(item.applicant)
          ? item.applicant[0]
          : item.applicant;

        return {
          id: item.id,
          job_id: item.job_id,
          user_id: item.user_id,
          status: item.status,
          created_at: item.created_at,
          updated_at: item.updated_at,
          decided_at: item.decided_at,
          applicant: applicantData || null,
          jobTitle: jobTitleMap.get(item.job_id) || "Lowongan Kerja",
        };
      });
    }
  }

  // Hitung ringkasan statistik dari database nyata
  const totalPelamar = applications.length;
  const dalamProses = applications.filter((a) =>
    ["dikirim", "ditinjau", "shortlist", "wawancara"].includes(a.status)
  ).length;
  const diterima = applications.filter((a) =>
    ["ditawari", "diterima"].includes(a.status)
  ).length;
  const ditolak = applications.filter((a) =>
    ["ditolak", "ditarik"].includes(a.status)
  ).length;

  // Hitung rekap per lowongan
  const rekapLowongan = jobsList.map((job) => {
    const pelamarLowongan = applications.filter((a) => a.job_id === job.id);
    return {
      id: job.id,
      title: job.title,
      status: job.status,
      total: pelamarLowongan.length,
      dalamProses: pelamarLowongan.filter((a) =>
        ["dikirim", "ditinjau", "shortlist", "wawancara"].includes(a.status)
      ).length,
      diterima: pelamarLowongan.filter((a) =>
        ["ditawari", "diterima"].includes(a.status)
      ).length,
      ditolak: pelamarLowongan.filter((a) =>
        ["ditolak", "ditarik"].includes(a.status)
      ).length,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header Halaman Laporan */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-50 text-navy-800 text-xs font-bold border border-navy-100">
              <BarChart3 className="w-3.5 h-3.5 text-navy-700" aria-hidden="true" />
              <span>Laporan Operasional Rekrutmen</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Laporan Rekapitulasi Pelamar
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Data rekapitulasi pengajuan lamaran, alur seleksi, dan keputusan kandidat per rentang tanggal.
            </p>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 self-start sm:self-center">
            <span className="block font-semibold text-slate-800">Rentang Aktif</span>
            <span>
              {formatDateIndo(startDate)} s.d. {formatDateIndo(endDate)}
            </span>
          </div>
        </div>

        {/* Panel Filter Rentang Tanggal dan Pilihan Lowongan */}
        <form
          method="GET"
          action="/mitra/laporan"
          className="pt-4 border-t border-black/[0.06] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
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

          <div>
            <label
              htmlFor="lowongan"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Posisi Lowongan
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="lowongan"
                name="lowongan"
                defaultValue={selectedJobId ? String(selectedJobId) : ""}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-600 bg-white truncate"
              >
                <option value="">Semua Posisi Lowongan</option>
                {jobsList.map((job) => (
                  <option key={job.id} value={String(job.id)}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition shadow-2xs min-h-[38px]"
            >
              <Filter className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Terapkan Filter</span>
            </button>

            {(params.mulai || params.selesai || params.lowongan) && (
              <Link
                href="/mitra/laporan"
                className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition min-h-[38px]"
              >
                Reset
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Kartu Ringkasan Metrik Rekapitulasi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Total Pelamar Masuk</span>
            <Users className="w-4 h-4 text-navy-700" />
          </div>
          <div className="text-2xl font-black text-black">{totalPelamar}</div>
          <div className="text-[11px] text-slate-500">
            Pada rentang tanggal yang dipilih
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Dalam Proses Seleksi</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{dalamProses}</div>
          <div className="text-[11px] text-slate-500">
            Status review, shortlist, atau wawancara
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Diterima / Ditawari</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-800">{diterima}</div>
          <div className="text-[11px] text-slate-500">
            Kandidat berhasil lolos seleksi
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/[0.08] p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Ditolak / Ditarik</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-800">{ditolak}</div>
          <div className="text-[11px] text-slate-500">
            Belum sesuai kriteria atau ditarik
          </div>
        </div>
      </div>

      {/* Tabel 1: Rekapitulasi Berdasarkan Lowongan */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-black">
              Rekapitulasi per Posisi Lowongan
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Statistik perolehan pelamar pada masing-masing posisi pekerjaan aktif.
            </p>
          </div>
        </div>

        {rekapLowongan.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Belum ada lowongan pekerjaan yang dibuat.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs min-w-[580px]">
              <thead>
                <tr className="border-b border-black/[0.08] text-slate-500 font-bold">
                  <th className="pb-3 pr-4">Judul Lowongan</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-center">Total Pelamar</th>
                  <th className="pb-3 px-3 text-center">Dalam Proses</th>
                  <th className="pb-3 px-3 text-center">Diterima</th>
                  <th className="pb-3 px-3 text-center">Ditolak</th>
                  <th className="pb-3 pl-3 text-right">Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {rekapLowongan.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-navy-950">
                      {item.title}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-sm text-[11px] font-bold ${
                          item.status === "open"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : item.status === "pending"
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-black">
                      {item.total}
                    </td>
                    <td className="py-3.5 px-3 text-center text-amber-800 font-semibold">
                      {item.dalamProses}
                    </td>
                    <td className="py-3.5 px-3 text-center text-emerald-800 font-semibold">
                      {item.diterima}
                    </td>
                    <td className="py-3.5 px-3 text-center text-rose-800 font-semibold">
                      {item.ditolak}
                    </td>
                    <td className="py-3.5 pl-3 text-right">
                      <Link
                        href={`/mitra/lowongan/${item.id}/pelamar`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-navy-800 hover:text-navy-950 hover:underline"
                      >
                        <span>Lihat Pelamar</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tabel 2: Rincian Daftar Pelamar Lengkap */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-black">
              Daftar Rekapitulasi Kandidat Pelamar
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Riwayat lengkap berkas pelamar yang masuk pada rentang waktu yang ditentukan.
            </p>
          </div>

          <div className="text-xs text-slate-600 font-semibold">
            {applications.length} berkas ditemukan
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-[#FAF8F0] border border-black/[0.08] space-y-2">
            <BarChart3 className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-black">
              Tidak ada data pada rentang ini.
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Cobalah memilih rentang tanggal yang lebih luas atau pilih lowongan lain pada formulir filter di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="border-b border-black/[0.08] text-slate-500 font-bold">
                  <th className="pb-3 pr-2 w-10">No</th>
                  <th className="pb-3 px-3">Tanggal Melamar</th>
                  <th className="pb-3 px-3">Nama Kandidat</th>
                  <th className="pb-3 px-3">Posisi Dilamar</th>
                  <th className="pb-3 px-3">Status Seleksi</th>
                  <th className="pb-3 px-3">Pembaruan</th>
                  <th className="pb-3 pl-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {applications.map((app, index) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 pr-2 text-slate-400 font-mono text-[11px]">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                      {formatDateIndo(app.created_at)}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-black">
                        {app.applicant?.name || "Nama Tidak Tersedia"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {app.applicant?.email || ""}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-800">
                      {app.jobTitle}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={app.status as ApplicationStatus} />
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {formatDateIndo(app.updated_at)}
                    </td>
                    <td className="py-3.5 pl-3 text-right whitespace-nowrap">
                      <Link
                        href={`/mitra/pelamar/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs transition"
                      >
                        <span>Detail</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
