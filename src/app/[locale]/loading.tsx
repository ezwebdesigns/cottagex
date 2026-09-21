import PropertyGridSkeleton from '@/components/cottagex/PropertyGridSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative min-h-[300px] lg:min-h-[360px] overflow-hidden bg-slate-100 animate-pulse">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4">
          <div className="h-4 w-40 bg-slate-200 rounded-full" />
          <div className="h-8 w-2/3 max-w-xl bg-slate-200 rounded-xl" />
        </div>
      </div>
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <PropertyGridSkeleton count={12} />
      </div>
    </div>
  );
}
