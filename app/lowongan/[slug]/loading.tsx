import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function JobDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Back Button Skeleton */}
        <Skeleton className="h-5 w-44" />

        {/* Header Section Skeleton */}
        <div className="bg-white rounded-[28px] sm:rounded-[36px] border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5 flex-1 w-full">
              <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-7 w-3/4 max-w-md" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </div>
            </div>
            <Skeleton className="h-12 w-36 rounded-full shrink-0" />
          </div>
        </div>

        {/* Dua Kolom Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Kolom Kiri */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
              <Skeleton className="h-6 w-36 border-b border-slate-100 pb-2" />
              <SkeletonText lines={4} />
            </div>

            <div className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
              <Skeleton className="h-6 w-48 border-b border-slate-100 pb-2" />
              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-11/12" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>

            <div className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4">
              <Skeleton className="h-6 w-44 border-b border-slate-100 pb-2" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Sidebar Kriteria Skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[28px] border border-black/[0.08] shadow-card overflow-hidden">
              <div className="bg-navy-900 p-6 space-y-2">
                <Skeleton className="h-4 w-24 bg-navy-800" />
                <Skeleton className="h-7 w-48 bg-navy-800" />
              </div>
              <div className="p-6 space-y-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="w-8 h-8 rounded-md shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <Skeleton className="h-11 w-full rounded-full" />
                  <Skeleton className="h-10 w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
