import { Skeleton } from "@/components/ui/Skeleton";

export default function DetailPelamarLoading() {
  return (
    <div className="space-y-6">
      {/* Skeleton Header & Navigasi */}
      <Skeleton variant="rectangular" className="h-5 w-40 rounded-full" />

      {/* Skeleton Kartu Profil Kandidat */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" className="w-16 h-16 shrink-0" />
            <div className="space-y-2">
              <Skeleton variant="rectangular" className="h-6 w-56 rounded-md" />
              <Skeleton variant="rectangular" className="h-4 w-40 rounded-md" />
            </div>
          </div>
          <Skeleton variant="rectangular" className="h-8 w-28 rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-black/[0.06]">
          <Skeleton variant="rectangular" className="h-12 rounded-2xl" />
          <Skeleton variant="rectangular" className="h-12 rounded-2xl" />
          <Skeleton variant="rectangular" className="h-12 rounded-2xl" />
        </div>
      </div>

      {/* Skeleton Dua Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton variant="rectangular" className="h-48 rounded-3xl" />
          <Skeleton variant="rectangular" className="h-64 rounded-3xl" />
        </div>
        <div className="space-y-6">
          <Skeleton variant="rectangular" className="h-56 rounded-3xl" />
          <Skeleton variant="rectangular" className="h-72 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
