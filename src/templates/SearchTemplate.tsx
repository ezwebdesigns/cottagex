'use client';

import { useMemo, useState } from 'react';
import { Home as HomeIcon, Sailboat, Bath, Users, Gem, PawPrint, Heart, Trees, TreePine, Umbrella, Building2, Snowflake, Mountain, Leaf } from 'lucide-react';
import PropertyCard from '@/components/cottagex/PropertyCard';
import CTASection from '@/components/cottagex/CTASection';
import SearchFaq from '@/components/cottagex/SearchFaq';
import SearchFilters, { EMPTY_FILTERS } from '@/components/cottagex/SearchFilters';
import MapSection from '@/components/cottagex/MapSection';
import SearchInspirations from '@/components/cottagex/SearchInspirations';
import CategoryScroller from '@/components/cottagex/CategoryScroller';
import SmartLink from '@/components/cottagex/SmartLink';
import { BreadcrumbSchema, ItemListSchema, FAQPageSchema } from '@/components/seo/SchemaOrg';

const categoryIconMap: Record<string, React.ElementType> = {
  lakefront: Kayak, 'hot-tub': Bath, family: Users, luxury: Gem,
  'pet-friendly': PawPrint, mountain: Mountain, romantic: Heart, 'log-cabin': HomeIcon,
  countryside: Trees, secluded: TreePine, beach: Umbrella, resort: Building2,
  skiing: Snowflake, pools: Waves, hiking: Footprints,
  coastal: Sailboat, waterfront: Kayak,
};

const CATEGORY_IDS = new Set(['lakefront', 'hot-tub', 'family', 'luxury', 'pet-friendly', 'mountain', 'romantic', 'log-cabin', 'countryside', 'secluded', 'beach', 'resort', 'skiing', 'pools', 'hiking', 'coastal', 'waterfront']);

const PROVINCE_SLUGS = new Set([
  'ontario', 'quebec', 'alberta', 'british-columbia', 'nova-scotia',
  'new-brunswick', 'manitoba', 'saskatchewan', 'pei', 'newfoundland',
]);

const PROVINCE_NAMES: Record<string, string> = {
  ontario: 'Ontario',
  quebec: 'Quebec',
  alberta: 'Alberta',
  'british-columbia': 'British Columbia',
  'new-brunswick': 'New Brunswick',
  'nova-scotia': 'Nova Scotia',
  manitoba: 'Manitoba',
  saskatchewan: 'Saskatchewan',
  pei: 'Prince Edward Island',
  newfoundland: 'Newfoundland and Labrador',
};

const PROVINCE_NAMES_FR: Record<string, string> = {
  ontario: 'Ontario',
  quebec: 'Québec',
  alberta: 'Alberta',
  'british-columbia': 'Colombie-Britannique',
  'new-brunswick': 'Nouveau-Brunswick',
  'nova-scotia': 'Nouvelle-Écosse',
  manitoba: 'Manitoba',
  saskatchewan: 'Saskatchewan',
  pei: 'Île-du-Prince-Édouard',
  newfoundland: 'Terre-Neuve-et-Labrador',
};

interface Cottage {
  id: number;
  name: string;
  province: string;
  price_cad: number;
  rating: number;
  reviews: number;
  type: string;
  thumbnail: string;
  photos: string[];
  amenities: string[];
  affiliate_url: string;
  google_link: string;
  source: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  lat?: number | null;
  lng?: number | null;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  link: string;
}

type SearchTemplateProps = {
  locale: string;
  slug: string;
  hero?: Record<string, unknown>;
  searchResults?: Record<string, unknown>;
  searchCTA?: Record<string, unknown>;
  searchFaq?: Record<string, unknown>;
  faqLocation?: string;
  faqProvince?: string;
  searchInspirations?: Record<string, unknown>;
  cottages?: Cottage[];
  categories?: Category[];
  totalFeaturedCount?: number;
};

export default function SearchTemplate({ locale, slug, hero, searchResults, searchCTA, searchFaq, faqLocation, faqProvince, searchInspirations, cottages, categories, totalFeaturedCount }: SearchTemplateProps) {
  const segments = slug.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || '';
  const fallbackName = lastSegment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const locName = fallbackName || (segments.length === 0 ? 'Search' : '');

  const activeCategory = CATEGORY_IDS.has(lastSegment) ? lastSegment : null;
  const categoryLabel = activeCategory
    ? categories?.find((c: Category) => c.id === activeCategory)?.label || fallbackName
    : null;

  const isProvincePage = segments.some(seg => PROVINCE_SLUGS.has(seg));

  const [filterProvince, setFilterProvince] = useState('all');
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const heroTitle = (hero?.title as string) || (locName ? `${locName} Cottages` : 'Search Cottages');
  const heroSubtitle = (hero?.subtitle as string) || '';

  const priceCeil = useMemo(() => {
    const prices = (cottages || []).map((c) => c.price_cad || 0).filter((p) => p > 0);
    if (!prices.length) return 1000;
    return Math.ceil(Math.max(...prices) / 50) * 50;
  }, [cottages]);

  const amenityOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cottages || []) {
      for (const a of c.amenities || []) counts.set(a, (counts.get(a) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((x, y) => y.count - x.count);
  }, [cottages]);

  const filtersActive =
    filters.maxPrice != null ||
    filters.minRating != null ||
    filters.minBedrooms != null ||
    filters.amenities.length > 0 ||
    filters.sort !== 'featured';

  const provinceCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of cottages || []) {
      const p = c.province || '(none)';
      counts[p] = (counts[p] || 0) + 1;
    }
    return counts;
  }, [cottages]);

  const provinces = Object.keys(provinceCounts).sort();

  const visibleCottages = useMemo(() => {
    let list = cottages || [];
    if (filterProvince !== 'all') {
      list = list.filter(c => (c.province || '(none)') === filterProvince);
    }
    if (filters.maxPrice != null) {
      list = list.filter(c => (c.price_cad || 0) > 0 && (c.price_cad || 0) <= filters.maxPrice!);
    }
    if (filters.minRating != null) {
      list = list.filter(c => (c.rating || 0) >= filters.minRating!);
    }
    if (filters.minBedrooms != null) {
      list = list.filter(c => (c.bedrooms || 0) >= filters.minBedrooms!);
    }
    if (filters.amenities.length > 0) {
      list = list.filter(c => {
        const am = c.amenities || [];
        return filters.amenities.every(a => am.includes(a));
      });
    }
    const sorted = [...list];
    if (filters.sort === 'price-asc') {
      sorted.sort((a, b) => (a.price_cad || Infinity) - (b.price_cad || Infinity));
    } else if (filters.sort === 'rating-desc') {
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return sorted;
  }, [cottages, filterProvince, filters]);

  const resultCards = useMemo(() => {
    return (visibleCottages || []).map(c => ({
      id: String(c.id),
      name: c.name,
      location: c.province || '',
      province: c.province || '',
      price: c.price_cad || 0,
      rating: c.rating || 0,
      reviews: c.reviews || 0,
      badge: c.type || 'Featured',
      image: c.thumbnail || (Array.isArray(c.photos) && c.photos[0]) || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
      description: Array.isArray(c.amenities) ? c.amenities.slice(0, 3).join(' • ') : '',
      vrboUrl: c.affiliate_url || c.google_link || '#',
      source: c.source,
      beds: c.bedrooms || 0,
      baths: c.bathrooms || 0,
      guests: c.sleeps || 0,
      lat: c.lat ?? null,
      lng: c.lng ?? null,
    }));
  }, [visibleCottages]);

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema items={[
        { name: 'Home', url: `/${locale}` },
        { name: locName || 'Search', url: `/${locale}/search/${slug}` },
      ]} />

      {(cottages || []).length > 0 && (
        <ItemListSchema
          url={`https://chaletexpress.com/${locale}/search/${slug}`}
          items={(cottages || []).map((c) => ({
            name: c.name,
            image: c.thumbnail || (Array.isArray(c.photos) && c.photos[0]) || undefined,
            url: c.affiliate_url || c.google_link || undefined,
            price: c.price_cad ?? undefined,
            rating: c.rating ?? undefined,
            reviews: c.reviews ?? undefined,
          }))}
        />
      )}
      {Array.isArray((searchFaq as any)?.items) && (searchFaq as any).items.length > 0 && (
        <FAQPageSchema
          items={(searchFaq as any).items.map((item: any) => ({
            question: String(item.q || '')
              .replace(/\{location\}/g, faqLocation || '')
              .replace(/\{province\}/g, faqProvince || ''),
            answer: String(item.a || '')
              .replace(/\{location\}/g, faqLocation || '')
              .replace(/\{province\}/g, faqProvince || ''),
          }))}
        />
      )}

      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white text-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#191e3b]" style={{ fontFamily: 'var(--font-radio-canada), sans-serif' }}>{heroTitle}</h1>
        {heroSubtitle && <p className="text-base sm:text-lg text-slate-500 mt-2 max-w-2xl mx-auto">{heroSubtitle}</p>}
      </section>

      {categories && categories.length > 0 && (
        <section className="pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 bg-white">
          <CategoryScroller variant="light" className="flex justify-center gap-4 sm:gap-5 lg:gap-7 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat: Category) => {
              const Icon = categoryIconMap[cat.id] || Mountain;
              return (
                <SmartLink key={cat.id} href={cat.link} className="flex flex-col items-center gap-1.5 flex-shrink-0 group min-w-[56px] sm:min-w-[64px]">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border border-[#0f51ec] bg-[#0f51ec] group-hover:bg-white group-hover:border-slate-200 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-white group-hover:text-slate-400 transition-colors" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-[#191e3b] group-hover:text-slate-500 transition-colors text-center whitespace-nowrap">
                    {cat.label}
                  </span>
                </SmartLink>
              );
            })}
          </CategoryScroller>
        </section>
      )}

      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b]" style={{ fontFamily: 'var(--font-radio-canada), sans-serif' }}>
              {resultCards.length > 0
                ? ((searchResults?.title as string) || (locale === 'fr'
                  ? `${resultCards.length} résultat${resultCards.length > 1 ? 's' : ''} trouvé${resultCards.length > 1 ? 's' : ''}`
                  : `${resultCards.length} result${resultCards.length > 1 ? 's' : ''} found`))
                : (locale === 'fr' ? 'Aucun résultat' : 'No results found')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{(searchResults?.subtitle as string) || locName || (locale === 'fr' ? 'Toutes les destinations' : 'All locations')}</p>
          </div>
          {!isProvincePage && provinces.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">{locale === 'fr' ? 'Trier par destination' : 'Sort by Destination'}</span>
              <select
                value={filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
                className="px-4 py-2.5 rounded-full border border-slate-200 bg-white text-sm font-medium text-[#191e3b] focus:outline-none focus:ring-2 focus:ring-[#0f51ec]"
              >
                <option value="all">{locale === 'fr' ? `Toutes les provinces (${totalFeaturedCount})` : `All Provinces (${totalFeaturedCount})`}</option>
                {provinces.map(p => {
                  const names = locale === 'fr' ? PROVINCE_NAMES_FR : PROVINCE_NAMES;
                  return (
                    <option key={p} value={p}>{names[p] || p.charAt(0).toUpperCase() + p.slice(1)} ({provinceCounts[p]})</option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
        <div className="mb-8">
          <SearchFilters
            locale={locale}
            priceCeil={priceCeil}
            amenityOptions={amenityOptions}
            filters={filters}
            onChange={setFilters}
            onReset={() => {
              setFilters(EMPTY_FILTERS);
              setFilterProvince('all');
            }}
            isActive={filtersActive || filterProvince !== 'all'}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {resultCards.map((chalet) => (
            <PropertyCard key={chalet.id} chalet={chalet} categoryBadge={categoryLabel || undefined} />
          ))}
        </div>
        <MapSection chalets={resultCards} locale={locale} />
      </section>

      <CTASection
        locale={locale}
        title={searchCTA?.title as string | undefined}
        description={searchCTA?.description as string | undefined}
        buttonText={searchCTA?.buttonText as string | undefined}
        buttonLink={searchCTA?.buttonLink as string | undefined}
        image={searchCTA?.image as string | undefined}
        imageAlt={searchCTA?.imageAlt as string | undefined}
        fullWidth
      />

      <SearchFaq data={searchFaq as any} location={faqLocation} province={faqProvince} locale={locale} />

      <SearchInspirations data={searchInspirations as any} locale={locale} />

    </div>
  );
}
