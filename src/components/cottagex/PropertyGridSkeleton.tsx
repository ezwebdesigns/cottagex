/**
 * Grid placeholder matching the PropertyCard grid geometry
 * (grid-cols-2 sm:3 md:4 lg:6) to avoid layout shift while streaming.
 */
export default function PropertyGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden bg-white border border-slate-100 animate-pulse"
        >
          <div className="aspect-[4/3] bg-slate-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-3/4 bg-slate-100 rounded" />
            <div className="h-3 w-1/2 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
