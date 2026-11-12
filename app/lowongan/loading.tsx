import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function LowonganLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3 border-b border-black/[0.08] pb-6">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-8 w-80 sm:w-96" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>

        {/* Grid Dua Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Kolom Kiri: Filter Panel Skeleton */}
          <div className="lg:col-span-1 bg-white p-5 rounded-[28px] border border-black/[0.08] shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <div className="flex flex-wrap gap-1.5">
                <Skeleton className="h-8 w-14 rounded-full" />
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <div className="grid grid-cols-3 gap-1">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-black/[0.06]">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full mt-2 rounded-xl" />
            </div>
          </div>

          {/* Kolom Kanan: Search Bar dan Kartu Lowongan Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar Skeleton */}
            <Skeleton className="h-12 w-full rounded-full" />

            <div className="flex items-center justify-between border-b border-black/[0.08] pb-3">
              <Skeleton className="h-4 w-44" />
            </div>

            {/* List Kartu Lowongan Skeleton */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[28px] border border-black/[0.08] p-5 sm:p-6 space-y-4 shadow-card"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 flex-1 w-full">
                      <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-3/4 max-w-sm" />
                        <Skeleton className="h-4 w-1/2 max-w-xs" />
                      </div>
                    </div>
                    <div className="hidden sm:block text-right">
                      <Skeleton className="h-3 w-20 ml-auto mb-1" />
                      <Skeleton className="h-5 w-28 ml-auto" />
                    </div>
                  </div>

                  <SkeletonText lines={2} />

                  <div className="pt-3 border-t border-black/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-28 rounded-full shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
