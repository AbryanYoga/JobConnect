import { Skeleton } from "@/components/ui/Skeleton";

export default function PelamarLoading() {
  return (
    <div className="space-y-6">
      {/* Skeleton Header */}
      <div className="bg-white rounded-3xl border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-4">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-8 w-72 rounded-2xl" />
        <Skeleton className="h-4 w-48 rounded-full" />
      </div>

      {/* Skeleton Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full shrink-0" />
        ))}
      </div>

      {/* Skeleton List Items */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-3xl border border-black/[0.08] p-6 shadow-card space-y-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton circle className="w-12 h-12 shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
