import { Skeleton } from "@/components/ui/Skeleton";

export default function DetailLamaranLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F0]/40 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20 rounded-md" />
          <span className="text-slate-300">/</span>
          <Skeleton className="h-4 w-28 rounded-md" />
          <span className="text-slate-300">/</span>
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>

        <Skeleton className="h-4 w-40 rounded-md" />

        <div className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-9 shadow-card">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-56 rounded-md" />
              <Skeleton className="h-4 w-40 rounded-md" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-8 shadow-card space-y-4">
            <Skeleton className="h-6 w-48 rounded-md" />
            <div className="space-y-6 pt-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-start gap-4">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0 mt-1" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-48 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1 bg-white rounded-[28px] border border-black/[0.08] p-6 shadow-card space-y-4">
            <Skeleton className="h-5 w-36 rounded-md" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
