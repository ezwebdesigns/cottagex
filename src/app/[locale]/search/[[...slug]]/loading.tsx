import PropertyGridSkeleton from '@/components/cottagex/PropertyGridSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="h-8 w-2/3 max-w-xl bg-slate-100 rounded-xl mx-auto animate-pulse" />
      </div>
      <div className="px-4 sm:px-6 lg:px-8">
        <PropertyGridSkeleton count={12} />
      </div>
    </div>
  );
}
