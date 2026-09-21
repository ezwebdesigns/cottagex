'use client';

type Filters = {
  maxPrice: number | null;
  minRating: number | null;
  minBedrooms: number | null;
  amenities: string[];
  sort: 'featured' | 'price-asc' | 'rating-desc';
};

type SearchFiltersProps = {
  locale: string;
  priceCeil: number;
  amenityOptions: { name: string; count: number }[];
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  isActive: boolean;
};

const selectCls =
  'px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-medium text-[#191e3b] focus:outline-none focus:ring-2 focus:ring-[#0f51ec]';

export const EMPTY_FILTERS: Filters = {
  maxPrice: null,
  minRating: null,
  minBedrooms: null,
  amenities: [],
  sort: 'featured',
};

export default function SearchFilters({
  locale, priceCeil, amenityOptions, filters, onChange, onReset, isActive,
}: SearchFiltersProps) {
  const fr = locale === 'fr';
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const toggleAmenity = (name: string) =>
    set({
      amenities: filters.amenities.includes(name)
        ? filters.amenities.filter((a) => a !== name)
        : [...filters.amenities, name],
    });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-medium text-[#191e3b]">
        <span className="text-slate-500">{fr ? 'Prix max' : 'Max price'}</span>
        <input
          type="range"
          min={100}
          max={priceCeil}
          step={10}
          value={filters.maxPrice ?? priceCeil}
          onChange={(e) => {
            const v = Number(e.target.value);
            set({ maxPrice: v >= priceCeil ? null : v });
          }}
          className="w-24 accent-[#0f51ec]"
          aria-label={fr ? 'Prix maximum' : 'Maximum price'}
        />
        <span className="font-semibold tabular-nums">
          {filters.maxPrice ? `$${filters.maxPrice}` : fr ? 'Tous' : 'Any'}
        </span>
      </label>

      <select
        value={filters.minRating ?? ''}
        onChange={(e) => set({ minRating: e.target.value ? Number(e.target.value) : null })}
        className={selectCls}
        aria-label={fr ? 'Note minimale' : 'Minimum rating'}
      >
        <option value="">{fr ? 'Toutes notes' : 'Any rating'}</option>
        <option value="4.5">4.5+</option>
        <option value="4.8">4.8+</option>
      </select>

      <select
        value={filters.minBedrooms ?? ''}
        onChange={(e) => set({ minBedrooms: e.target.value ? Number(e.target.value) : null })}
        className={selectCls}
        aria-label={fr ? 'Chambres min.' : 'Min bedrooms'}
      >
        <option value="">{fr ? 'Chambres : toutes' : 'Any bedrooms'}</option>
        <option value="2">2+</option>
        <option value="3">3+</option>
        <option value="4">4+</option>
      </select>

      <select
        value={filters.sort}
        onChange={(e) => set({ sort: e.target.value as Filters['sort'] })}
        className={selectCls}
        aria-label={fr ? 'Trier par' : 'Sort by'}
      >
        <option value="featured">{fr ? 'En vedette' : 'Featured'}</option>
        <option value="price-asc">{fr ? 'Prix croissant' : 'Price: low to high'}</option>
        <option value="rating-desc">{fr ? 'Mieux notés' : 'Top rated'}</option>
      </select>

      {amenityOptions.slice(0, 6).map((a) => {
        const on = filters.amenities.includes(a.name);
        return (
          <button
            key={a.name}
            type="button"
            onClick={() => toggleAmenity(a.name)}
            aria-pressed={on}
            className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-colors ${
              on
                ? 'bg-[#0f51ec] text-white border-[#0f51ec]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#0f51ec]/30'
            }`}
          >
            {a.name} ({a.count})
          </button>
        );
      })}

      {isActive && (
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2.5 rounded-full text-sm font-semibold text-[#0f51ec] hover:bg-[#0f51ec]/5 transition-colors"
        >
          {fr ? 'Réinitialiser' : 'Reset'}
        </button>
      )}
    </div>
  );
}
