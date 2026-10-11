import { Skeleton } from "@/components/ui/Skeleton";

export default function LamaranSayaLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F0]/40 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20 rounded-md" />
          <span className="text-slate-300">/</span>
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-6 w-36 rounded-full" />
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-white rounded-[28px] border border-black/[0.08] p-6 sm:p-7 shadow-card space-y-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-48 max-w-full rounded-md" />
                    <Skeleton className="h-4 w-32 max-w-full rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-7 w-24 rounded-full" />
              </div>
              <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-4 w-28 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
