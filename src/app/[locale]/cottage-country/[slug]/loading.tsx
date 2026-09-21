import PropertyGridSkeleton from '@/components/cottagex/PropertyGridSkeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-64 sm:h-96 overflow-hidden bg-slate-100 animate-pulse" />
      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <PropertyGridSkeleton count={12} />
      </div>
    </div>
  );
}
