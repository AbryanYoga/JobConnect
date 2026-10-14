import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Briefcase,
  Clock,
  Users,
  FileCheck,
  PlusCircle,
  Building2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { JOB_TYPE_LABEL, WORK_MODE_LABEL, type JobType, type WorkMode } from "@/lib/labels";
import { checkCompanyVerification } from "@/lib/validation/profil";
import { getCompanyLogo } from "@/lib/company-logo";

export const metadata: Metadata = {
  title: "Dashboard Mitra - Ringkasan",
  description: "Pantau lowongan kerja aktif, status persetujuan admin, dan lamaran kandidat masuk.",
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

function getStatusBadge(status: string) {
  switch (status) {
    case "open":
      return {
        label: "Tayang (Open)",
        className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    case "pending":
      return {
        label: "Menunggu ACC",
        className: "bg-amber-50 text-amber-900 border-amber-300",
      };
    case "draft":
      return {
        label: "Draft",
        className: "bg-slate-100 text-slate-800 border-slate-300",
      };
    case "rejected":
      return {
        label: "Ditolak",
        className: "bg-red-50 text-red-800 border-red-200",
      };
    case "closed":
      return {
        label: "Ditutup",
        className: "bg-slate-100 text-slate-600 border-slate-200",
      };
    case "removed":
      return {
        label: "Ditakedown",
        className: "bg-red-100 text-red-900 border-red-300",
      };
    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

export default async function MitraDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/mitra");
  }

  // Ambil profil akun
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "company") {
    redirect("/403");
  }

  // Ambil data profil perusahaan lengkap
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, slug, city_id, logo_path, industry, size, website, address_note, description")
    .eq("owner_id", user.id)
    .maybeSingle();

  let logoUrl: string | null = null;
  if (company?.logo_path) {
    const { data: publicUrlData } = supabase.storage
      .from("company-logos")
      .getPublicUrl(company.logo_path);
    logoUrl = publicUrlData.publicUrl;
  }
  const fallbackLogo = company?.name ? getCompanyLogo(company.name) : null;
  const effectiveLogo = logoUrl || fallbackLogo;

  const verification = checkCompanyVerification({
    ...company,
    logoUrl: effectiveLogo,
  });

  // Jika profil perusahaan belum terverifikasi lengkap (wajib data nyata + logo)
  if (!company || !verification.isComplete) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-10 shadow-card space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-800" aria-hidden="true" />
            <span>Langkah Wajib Verifikasi Perusahaan ({verification.completedCount} / {verification.totalRequired} Terpenuhi)</span>
          </div>

          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
              Lengkapi Bukti Perusahaan Nyata & Logo
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
              Untuk melindungi pencari kerja dari lowongan fiktif dan calo liar, JobConnect mewajibkan setiap mitra perusahaan melengkapi data operasional nyata serta mengunggah logo resmi sebelum dapat mempublikasikan lowongan pekerjaan.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F0] border border-black/[0.08] space-y-3">
            <h2 className="text-sm font-bold text-black flex items-center gap-2">
              <Building2 className="w-4 h-4 text-black" aria-hidden="true" />
              <span>Persyaratan yang Masih Perlu Dilengkapi:</span>
            </h2>
            <ul className="text-xs sm:text-sm text-slate-700 space-y-2 font-medium list-disc list-inside">
              {verification.missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <Link
              href="/mitra/profil-perusahaan"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-sm shadow-2xs hover:shadow transition min-h-[44px]"
            >
              <span>Lengkapi Profil & Unggah Logo Sekarang</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ambil metrik ringkasan dari database jika sudah terverifikasi
  const companyId = company.id;

  // 1. Ambil seluruh lowongan milik perusahaan ini
  const { data: jobsData } = await supabase
    .from("jobs")
    .select("id, title, slug, status, job_type, work_mode, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  const jobs = jobsData || [];
  const openJobsCount = jobs.filter((j) => j.status === "open").length;
  const pendingJobsCount = jobs.filter((j) => j.status === "pending").length;
  const jobIds = jobs.map((j) => j.id);

  // 2. Ambil total lamaran dan yang perlu ditinjau
  let totalApplicationsCount = 0;
  let pendingReviewCount = 0;
  const applicationCountsByJob: Record<number, number> = {};

  if (jobIds.length > 0) {
    const { data: appsData } = await supabase
      .from("applications")
      .select("id, job_id, status")
      .in("job_id", jobIds);

    if (appsData) {
      totalApplicationsCount = appsData.length;
      pendingReviewCount = appsData.filter(
        (a) => a.status === "dikirim" || a.status === "ditinjau"
      ).length;

      // Hitung per lowongan
      appsData.forEach((app) => {
        applicationCountsByJob[app.job_id] = (applicationCountsByJob[app.job_id] || 0) + 1;
      });
    }
  }

  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Banner Sapaan Ramah Khas BMC */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-black/[0.08] p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
            {effectiveLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={effectiveLogo}
                alt={`Logo ${company.name}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <Building2 className="w-8 h-8 text-slate-400" aria-hidden="true" />
            )}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>Mitra Resmi Terverifikasi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight truncate">
              {company.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl leading-relaxed">
              Kelola lowongan kerja resmi, pantau proses peninjauan admin, dan seleksi kandidat pelamar secara transparan tanpa pungutan liar.
            </p>
          </div>
        </div>

        <Link
          href="/mitra/lowongan/tambah"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-sm shadow-2xs hover:shadow transition shrink-0 min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
          <span>Pasang Lowongan Baru</span>
        </Link>
      </div>

      {/* Grid Statistik 4 Kolom */}
      <section aria-label="Ringkasan Statistik Rekrutmen">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Kartu 1: Lowongan Tayang */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Lowongan Tayang
              </span>
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Briefcase className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-black">
              {openJobsCount}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Aktif dapat dilamar publik
            </p>
          </div>

          {/* Kartu 2: Menunggu ACC Admin */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Menunggu ACC
              </span>
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-black">
              {pendingJobsCount}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Sedang diverifikasi admin
            </p>
          </div>

          {/* Kartu 3: Total Pelamar Masuk */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Pelamar
              </span>
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                <Users className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-black">
              {totalApplicationsCount}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Berkas lamaran diterima
            </p>
          </div>

          {/* Kartu 4: Perlu Ditinjau */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-black/[0.08] p-5 sm:p-6 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Perlu Ditinjau
              </span>
              <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
                <FileCheck className="w-4 h-4 stroke-[2.2]" aria-hidden="true" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-black">
              {pendingReviewCount}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Status dikirim atau ditinjau
            </p>
          </div>
        </div>
      </section>

      {/* Bagian Lowongan Terbaru */}
      <section aria-label="Daftar Lowongan Terbaru" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-black text-black tracking-tight">
              Aktivitas Lowongan Terbaru
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Lowongan pekerjaan yang baru saja diajukan atau dikelola perusahaan Anda.
            </p>
          </div>

          {jobs.length > 0 && (
            <Link
              href="/mitra/lowongan"
              className="inline-flex items-center gap-1 text-xs font-bold text-black hover:underline min-h-[44px]"
            >
              <span>Lihat Semua ({jobs.length})</span>
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        {recentJobs.length === 0 ? (
          /* Empty State Sesuai Standar Antislop */
          <div className="bg-white rounded-3xl border border-black/[0.08] p-8 sm:p-12 text-center shadow-card space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F0] border border-black/[0.08] flex items-center justify-center mx-auto text-black shadow-2xs">
              <Briefcase className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-lg font-black text-black">
                Kamu belum punya lowongan
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Pasang lowongan pertamamu untuk mulai menjangkau pencari kerja terverifikasi dari seluruh 38 provinsi di Indonesia.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/mitra/lowongan/tambah"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFDD00] hover:bg-[#F5D400] text-black font-black text-xs sm:text-sm shadow-2xs transition min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                <span>Pasang Lowongan Pertama</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-black/[0.08] shadow-card divide-y divide-black/[0.06] overflow-hidden">
            {recentJobs.map((job) => {
              const badge = getStatusBadge(job.status);
              const applicantCount = applicationCountsByJob[job.id] || 0;
              const typeLabel =
                JOB_TYPE_LABEL[job.job_type as JobType] || job.job_type;
              const modeLabel =
                WORK_MODE_LABEL[job.work_mode as WorkMode] || job.work_mode;

              return (
                <div
                  key={job.id}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-black/[0.01] transition"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Diajukan pada {formatDateIndo(job.created_at)}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-black truncate">
                      {job.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                      <span>{typeLabel}</span>
                      <span>•</span>
                      <span>{modeLabel}</span>
                      <span>•</span>
                      <span className="font-bold text-black">
                        {applicantCount} Pelamar
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-stretch sm:self-center shrink-0">
                    <Link
                      href={`/mitra/lowongan/${job.id}/pelamar`}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-[#FAF8F0] hover:bg-[#F3EEDD] text-black text-xs font-bold border border-black/[0.08] transition min-h-[44px]"
                    >
                      <span>Lihat Pelamar</span>
                    </Link>
                    <Link
                      href={`/mitra/lowongan/${job.id}/edit`}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-full hover:bg-black/[0.04] text-slate-700 hover:text-black text-xs font-bold transition min-h-[44px]"
                    >
                      <span>Kelola</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Kartu Prinsip Rekrutmen Transparan */}
      <div className="bg-[#FAF8F0] rounded-3xl border border-black/[0.08] p-6 sm:p-8 space-y-3">
        <h3 className="text-sm font-black text-black uppercase tracking-wider">
          Komitmen Rekrutmen Bersih JobConnect
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          JobConnect menjamin seluruh proses rekrutmen bebas calo dan tanpa pungutan biaya apa pun kepada pencari kerja. Setiap lowongan yang diajukan akan ditinjau admin moderator dalam waktu maksimal 1x24 jam kerja sebelum ditayangkan ke publik.
        </p>
      </div>
    </div>
  );
}
