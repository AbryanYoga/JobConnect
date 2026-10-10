import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  FileCheck2,
  Clock,
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Banknote,
  Search,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApproveJobModal } from "@/components/admin/ApproveJobModal";
import { RejectJobModal } from "@/components/admin/RejectJobModal";
import {
  JOB_TYPE_LABEL,
  WORK_MODE_LABEL,
  EDUCATION_LABEL,
  type JobType,
  type WorkMode,
  type EducationMin,
} from "@/lib/labels";

export const metadata: Metadata = {
  title: "Antrean Review Lowongan",
  description: "Daftar antrean verifikasi dan moderasi lowongan kerja oleh admin platform JobConnect.",
};

interface AdminLowonganPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
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

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminLowonganPage({
  searchParams,
}: AdminLowonganPageProps) {
  const { status: rawStatus, q: searchQuery } = await searchParams;
  const currentTab = rawStatus || "pending";

  const supabase = await createClient();

  // Hitung jumlah data per status untuk tab badge
  const [
    { count: pendingCount },
    { count: openCount },
    { count: rejectedCount },
    { count: removedCount },
  ] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "removed"),
  ]);

  // Query lowongan
  let query = supabase
    .from("jobs")
    .select(`
      id,
      title,
      slug,
      status,
      work_mode,
      job_type,
      education_min,
      experience_min_years,
      skills,
      summary,
      responsibilities,
      nice_to_have,
      benefits,
      salary_min,
      salary_max,
      deadline,
      review_note,
      reviewed_at,
      created_at,
      company:companies (
        id,
        name,
        slug,
        industry
      ),
      category:categories (
        id,
        name
      ),
      city:cities (
        id,
        name,
        type,
        province:provinces (
          name
        )
      )
    `)
    .order("created_at", { ascending: currentTab === "pending" }); // Pending: tertua dulu agar adil (FIFO)

  if (currentTab !== "all") {
    if (currentTab === "rejected_or_removed") {
      query = query.in("status", ["rejected", "removed"]);
    } else {
      query = query.eq("status", currentTab);
    }
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery.trim()}%`);
  }

  const { data: jobsData } = await query;
  const jobs = jobsData || [];

  const TABS = [
    { key: "pending", label: "Menunggu Review", count: pendingCount ?? 0 },
    { key: "open", label: "Lowongan Aktif", count: openCount ?? 0 },
    {
      key: "rejected_or_removed",
      label: "Ditolak / Takedown",
      count: (rejectedCount ?? 0) + (removedCount ?? 0),
    },
    { key: "all", label: "Semua", count: null },
  ];

  return (
    <div className="space-y-8">
      {/* Header Halaman */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-slate-900 text-[#FFDD00] flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" aria-hidden="true" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Antrean Moderasi Lowongan
            </h1>
          </div>
          <p className="text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
            Periksa kriteria, kelayakan tanggung jawab, dan standar transparansi informasi sebelum menyetujui publikasi lowongan.
          </p>
        </div>

        {/* Pencarian Judul */}
        <form method="get" className="w-full sm:w-72">
          {rawStatus && <input type="hidden" name="status" value={rawStatus} />}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery || ""}
              placeholder="Cari judul lowongan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FAF8F0] border border-black/[0.08] text-xs font-semibold text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[44px]"
            />
          </div>
        </form>
      </div>

      {/* Baris Tab Filter Status */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Tab antrean moderasi">
        {TABS.map((tab) => {
          const isActive = currentTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/admin/lowongan?status=${tab.key}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition min-h-[44px] shrink-0 ${
                isActive
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:text-black border border-black/[0.08] hover:bg-[#FAF8F0]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-black rounded-full ${
                    isActive
                      ? "bg-[#FFDD00] text-black"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Daftar Kartu Antrean Lowongan */}
      {jobs.length === 0 ? (
        <EmptyState
          title={
            currentTab === "pending"
              ? "Tidak Ada Lowongan Menunggu Review"
              : "Tidak Ada Lowongan Ditemukan"
          }
          description={
            currentTab === "pending"
              ? "Seluruh pengajuan lowongan dari mitra perusahaan telah selesai dimoderasi. Kerja bagus!"
              : "Tidak ada data lowongan yang sesuai dengan kriteria filter atau pencarian Anda saat ini."
          }
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          action={{
            label: "Kembali ke Ringkasan",
            href: "/admin",
          }}
        />
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => {
            const companyData = Array.isArray(job.company) ? job.company[0] : job.company;
            const categoryData = Array.isArray(job.category) ? job.category[0] : job.category;
            const cityData = Array.isArray(job.city) ? job.city[0] : job.city;
            const provinceData = cityData?.province
              ? Array.isArray(cityData.province)
                ? cityData.province[0]
                : cityData.province
              : null;

            const companyName = companyData?.name || "Perusahaan Mitra";
            const categoryName = categoryData?.name || "Umum";
            const cityName = cityData ? `${cityData.type || ""} ${cityData.name}`.trim() : null;
            const provinceName = provinceData?.name || null;

            const typeLabel = JOB_TYPE_LABEL[job.job_type as JobType] || job.job_type;
            const modeLabel = WORK_MODE_LABEL[job.work_mode as WorkMode] || job.work_mode;
            const eduLabel = EDUCATION_LABEL[job.education_min as EducationMin] || job.education_min;

            return (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6"
              >
                {/* Header Kartu: Status, Judul, Perusahaan */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.06]">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                        {companyName}
                      </span>
                      {companyData?.industry && (
                        <span className="text-slate-500 font-medium">
                          ({companyData.industry})
                        </span>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 font-medium">
                        Kategori: <strong className="text-black">{categoryName}</strong>
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                      {job.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        job.status === "pending"
                          ? "bg-amber-50 text-amber-900 border-amber-300"
                          : job.status === "open"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : job.status === "rejected"
                          ? "bg-red-50 text-red-800 border-red-200"
                          : job.status === "removed"
                          ? "bg-rose-100 text-rose-900 border-rose-300"
                          : "bg-slate-100 text-slate-800 border-slate-300"
                      }`}
                    >
                      {job.status === "pending" && "Menunggu Review"}
                      {job.status === "open" && "Aktif (Open)"}
                      {job.status === "rejected" && "Ditolak"}
                      {job.status === "removed" && "Takedown (Removed)"}
                      {job.status === "closed" && "Ditutup"}
                      {job.status === "draft" && "Draft"}
                    </span>
                  </div>
                </div>

                {/* Kriteria Utama Grid Chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-bold text-black">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>{typeLabel}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-bold text-black">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>{modeLabel}</span>
                    {cityName && <span className="font-normal text-slate-600">({cityName})</span>}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-medium">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>Pendidikan: <strong className="text-black">{eduLabel}</strong></span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>Pengalaman Min: <strong className="text-black">{job.experience_min_years} tahun</strong></span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF8F0] border border-black/[0.06] font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>Batas Lamaran: <strong className="text-black">{formatDateIndo(job.deadline)}</strong></span>
                  </span>
                </div>

                {/* Gaji & Lokasi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF8F0] border border-black/[0.06] text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-slate-700 shrink-0">
                      <Banknote className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-slate-500 block">Rentang Gaji yang Ditawarkan:</span>
                      <strong className="text-black font-black text-sm">
                        {job.salary_min && job.salary_max
                          ? `${formatRupiah(job.salary_min)} - ${formatRupiah(job.salary_max)}`
                          : job.salary_min
                          ? `Mulai ${formatRupiah(job.salary_min)}`
                          : "Dirahasiakan oleh perusahaan"}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center text-slate-700 shrink-0">
                      <MapPin className="w-4 h-4 text-blue-600" aria-hidden="true" />
                    </div>
                    <div>
                      <span className="text-slate-500 block">Penempatan Lokasi Kerja:</span>
                      <strong className="text-black font-black text-sm">
                        {job.work_mode === "remote"
                          ? "Bekerja Jarak Jauh (Remote)"
                          : cityName && provinceName
                          ? `${cityName}, ${provinceName}`
                          : cityName || "Lokasi Ditentukan Perusahaan"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Ringkasan Lowongan */}
                {job.summary && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Ringkasan Lowongan:
                    </h3>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed bg-white rounded-2xl p-4 border border-black/[0.06]">
                      {job.summary}
                    </p>
                  </div>
                )}

                {/* Tanggung Jawab & Keahlian */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Tanggung Jawab */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-500 uppercase tracking-wider">
                      Tanggung Jawab Utama ({job.responsibilities?.length || 0}):
                    </h3>
                    <ul className="space-y-1.5 list-disc list-inside text-slate-700 font-medium bg-white rounded-2xl p-4 border border-black/[0.06]">
                      {(job.responsibilities || []).map((resp: string, idx: number) => (
                        <li key={idx} className="leading-relaxed">
                          {resp}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Keahlian yang Dibutuhkan */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-500 uppercase tracking-wider">
                      Keahlian yang Dibutuhkan ({job.skills?.length || 0}):
                    </h3>
                    <div className="flex flex-wrap gap-1.5 bg-white rounded-2xl p-4 border border-black/[0.06]">
                      {(job.skills || []).map((skill: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-slate-900 text-white font-bold text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Nilai Tambah & Benefit jika ada */}
                {((job.nice_to_have && job.nice_to_have.length > 0) ||
                  (job.benefits && job.benefits.length > 0)) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {job.nice_to_have && job.nice_to_have.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-500 uppercase tracking-wider block">
                          Nilai Tambah (Nice-to-Have):
                        </span>
                        <ul className="space-y-1 list-disc list-inside text-slate-700 font-medium bg-white rounded-2xl p-3 border border-black/[0.06]">
                          {job.nice_to_have.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {job.benefits && job.benefits.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="font-bold text-slate-500 uppercase tracking-wider block">
                          Fasilitas & Benefit:
                        </span>
                        <ul className="space-y-1 list-disc list-inside text-slate-700 font-medium bg-white rounded-2xl p-3 border border-black/[0.06]">
                          {job.benefits.map((item: string, idx: number) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Catatan Review Jika Ada */}
                {job.review_note && (
                  <div
                    role="alert"
                    className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-800 text-xs space-y-1"
                  >
                    <span className="font-bold block text-black">
                      Catatan Moderator Sebelumnya ({job.reviewed_at ? formatDateIndo(job.reviewed_at) : "Review Terakhir"}):
                    </span>
                    <p className="font-medium leading-relaxed">{job.review_note}</p>
                  </div>
                )}

                {/* Baris Bawah: Waktu Pengajuan & Aksi */}
                <div className="pt-4 border-t border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <span className="text-slate-500 font-medium">
                    Diajukan oleh mitra pada: <strong>{formatDateIndo(job.created_at)}</strong>
                  </span>

                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    {job.status === "open" && job.slug && (
                      <Link
                        href={`/lowongan/${job.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full hover:bg-black/[0.05] text-slate-700 hover:text-black font-bold border border-black/[0.08] transition min-h-[44px]"
                      >
                        <span>Lihat Tampilan Publik</span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    )}

                    {job.status === "pending" && (
                      <>
                        <ApproveJobModal
                          jobId={job.id}
                          jobTitle={job.title}
                          companyName={companyName}
                        />
                        <RejectJobModal
                          jobId={job.id}
                          jobTitle={job.title}
                          companyName={companyName}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
