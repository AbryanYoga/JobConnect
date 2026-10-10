import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  FileCheck2,
  Briefcase,
  Building2,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FolderTree,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { JOB_TYPE_LABEL, WORK_MODE_LABEL, type JobType, type WorkMode } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Ringkasan Platform",
  description: "Statistik platform, metrik lowongan kerja, dan antrean review moderator JobConnect.",
};

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

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Ambil metrik riil dari database
  const [
    { count: pendingCount },
    { count: openCount },
    { count: companiesCount },
    { count: applicationsCount },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("companies")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true }),
  ]);

  // Ambil hingga 5 lowongan pending tertua yang membutuhkan tinjauan
  const { data: pendingJobsData } = await supabase
    .from("jobs")
    .select(`
      id,
      title,
      slug,
      created_at,
      deadline,
      work_mode,
      job_type,
      company:companies (
        id,
        name,
        slug
      )
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(5);

  const pendingJobs = pendingJobsData || [];

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-slate-900 text-[#FFDD00] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Ringkasan Platform Moderator
            </h1>
          </div>
          <p className="text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
            Pantau status operasional lowongan, verifikasi pengajuan mitra baru, dan pantau kurasi kualitas platform JobConnect.
          </p>
        </div>

        <Link
          href="/admin/lowongan"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-sm shadow-2xs hover:shadow transition shrink-0 min-h-[44px]"
        >
          <FileCheck2 className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>Buka Antrean Review</span>
        </Link>
      </div>

      {/* Banner Peringatan Antrean Pending */}
      {(pendingCount ?? 0) > 0 && (
        <div
          role="region"
          aria-label="Pemberitahuan antrean review"
          className="bg-amber-50 rounded-3xl border border-amber-300 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-black mt-0.5">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black text-amber-950">
                Terdapat {pendingCount} Lowongan Menunggu Peninjauan
              </h2>
              <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
                Pengajuan dari mitra perusahaan membutuhkan verifikasi kelayakan kriteria sebelum dipublikasikan ke pencari kerja.
              </p>
            </div>
          </div>

          <Link
            href="/admin/lowongan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition shrink-0 min-h-[44px]"
          >
            <span>Tinjau Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Grid Metrik Utama Platform */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Antrean Pending */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Antrean Review
            </span>
            <span className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Clock className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-black text-black tracking-tight">
            {pendingCount ?? 0}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Memerlukan persetujuan moderator
          </p>
        </div>

        {/* Lowongan Aktif */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lowongan Aktif
            </span>
            <span className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
              <Briefcase className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-black text-black tracking-tight">
            {openCount ?? 0}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Tampil di halaman pencarian publik
          </p>
        </div>

        {/* Perusahaan Terdaftar */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mitra Perusahaan
            </span>
            <span className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center">
              <Building2 className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-black text-black tracking-tight">
            {companiesCount ?? 0}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Perusahaan pemberi kerja terdaftar
          </p>
        </div>

        {/* Total Lamaran */}
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Berkas Masuk
            </span>
            <span className="w-9 h-9 rounded-2xl bg-[#FAF8F0] text-slate-800 border border-black/[0.08] flex items-center justify-center">
              <Users className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-black text-black tracking-tight">
            {applicationsCount ?? 0}
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Lamaran dikirim oleh pencari kerja
          </p>
        </div>
      </div>

      {/* Bagian Daftar Antrean Review Terkini */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black text-black tracking-tight">
              Antrean Review Terbaru
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pengajuan lowongan terdepan yang belum ditinjau oleh tim moderator.
            </p>
          </div>

          <Link
            href="/admin/lowongan"
            className="text-xs font-bold text-slate-600 hover:text-black inline-flex items-center gap-1 transition"
          >
            <span>Lihat Semua Antrean</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {pendingJobs.length === 0 ? (
          <EmptyState
            title="Antrean Review Kosong"
            description="Tidak ada lowongan baru yang membutuhkan moderasi saat ini. Semua pengajuan telah diproses."
            icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
            action={{
              label: "Kelola Kategori Platform",
              href: "/admin/kategori",
            }}
          />
        ) : (
          <div className="space-y-3">
            {pendingJobs.map((job) => {
              const companyData = Array.isArray(job.company) ? job.company[0] : job.company;
              const companyName = companyData?.name || "Perusahaan Mitra";
              const typeLabel = JOB_TYPE_LABEL[job.job_type as JobType] || job.job_type;
              const modeLabel = WORK_MODE_LABEL[job.work_mode as WorkMode] || job.work_mode;

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-card hover:border-black/20 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-700">
                        {companyName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">
                        Diajukan: {formatDateIndo(job.created_at)}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-black tracking-tight truncate">
                      {job.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-600">
                      <span className="px-2.5 py-1 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-bold text-black">
                        {typeLabel}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-bold text-black">
                        {modeLabel}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-bold">
                        Menunggu Review
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/lowongan?review=${job.id}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold transition shrink-0 min-h-[44px] w-full sm:w-auto"
                  >
                    <span>Tinjau Lowongan</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pintasan Aksi Platform */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Link
          href="/admin/kategori"
          className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card hover:border-black/20 transition group flex items-start gap-4 min-h-[44px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shrink-0 group-hover:scale-105 transition">
            <FolderTree className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-base text-black tracking-tight">
              Kelola Kategori Lowongan
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Tambah, perbarui nama, atau susun taksonomi kategori pekerjaan di seluruh platform.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/perusahaan"
          className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card hover:border-black/20 transition group flex items-start gap-4 min-h-[44px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center text-black shrink-0 group-hover:scale-105 transition">
            <Building2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-base text-black tracking-tight">
              Daftar Mitra Perusahaan
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Periksa profil perusahaan, kontak penanggung jawab, dan kelengkapan identitas institusi.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
