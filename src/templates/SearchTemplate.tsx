'use client';

import { useMemo } from 'react';
import { Home as HomeIcon, Sailboat, Bath, Users, Gem, PawPrint, Heart, Trees, TreePine, Umbrella, Building2, Snowflake, Waves, Footprints, Mountain, Kayak } from 'lucide-react';
import PropertyCard from '@/components/cottagex/PropertyCard';
import CTASection from '@/components/cottagex/CTASection';
import SearchInspirations from '@/components/cottagex/SearchInspirations';
import { BreadcrumbSchema } from '@/components/seo/SchemaOrg';

const categoryIconMap: Record<string, React.ElementType> = {
  lakefront: Kayak, 'hot-tub': Bath, family: Users, luxury: Gem,
  'pet-friendly': PawPrint, mountain: Mountain, romantic: Heart, 'log-cabin': HomeIcon,
  countryside: Trees, secluded: TreePine, beach: Umbrella, resort: Building2,
  skiing: Snowflake, pools: Waves, hiking: Footprints,
  coastal: Sailboat, waterfront: Kayak,
};

type SearchTemplateProps = {
  locale: string;
  slug: string;
  hero?: any;
  searchResults?: any;
  searchCTA?: any;
  searchInspirations?: any;
  cottages?: any[];
  categories?: any[];
};

export default function SearchTemplate({ locale, slug, hero, searchResults, searchCTA, searchInspirations, cottages, categories }: SearchTemplateProps) {
  const segments = slug.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || '';
  const fallbackName = lastSegment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const locName = fallbackName || (segments.length === 0 ? 'Search' : '');

  const heroTitle = hero?.title || (locName ? `${locName} Cottages` : 'Search Cottages');
  const heroSubtitle = hero?.subtitle || '';

  const resultCards = useMemo(() => {
    return (cottages || []).map(c => ({
      id: String(c.id),
      name: c.name,
      location: c.province || '',
      province: c.province || '',
      price: c.price_cad || 0,
      rating: c.rating || 0,
      badge: c.type || 'Featured',
      image: c.thumbnail || (Array.isArray(c.photos) && c.photos[0]) || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
      description: Array.isArray(c.amenities) ? c.amenities.slice(0, 3).join(' • ') : '',
      vrboUrl: c.affiliate_url || c.google_link || '#',
      beds: c.bedrooms || 0,
      baths: c.bathrooms || 0,
      guests: c.sleeps || 0,
    }));
  }, [cottages]);

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema items={[
        { name: 'Home', url: `/${locale}` },
        { name: locName || 'Search', url: `/${locale}/search/${slug}` },
      ]} />

      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white text-center">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{heroTitle}</h1>
        {heroSubtitle && <p className="text-base sm:text-lg text-slate-500 mt-2 max-w-2xl mx-auto">{heroSubtitle}</p>}
      </section>

      {categories && categories.length > 0 && (
        <section className="pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="flex justify-center gap-4 sm:gap-5 lg:gap-7 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat: any) => {
              const Icon = categoryIconMap[cat.id] || Mountain;
              const Wrapper = cat.link ? 'a' : 'div';
              return (
                <Wrapper key={cat.id} href={cat.link} className="flex flex-col items-center gap-1.5 flex-shrink-0 group min-w-[56px] sm:min-w-[64px]">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border border-[#0f51ec] bg-[#0f51ec] group-hover:bg-white group-hover:border-slate-200 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-white group-hover:text-slate-400 transition-colors" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-[#191e3b] group-hover:text-slate-500 transition-colors text-center whitespace-nowrap">
                    {cat.label}
                  </span>
                </Wrapper>
              );
            })}
          </div>
        </section>
      )}

      <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-white">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-1 text-left" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
          {resultCards.length > 0
            ? (searchResults?.title || `${resultCards.length} result${resultCards.length > 1 ? 's' : ''} found`)
            : 'No results found'}
        </h2>
        <p className="text-sm text-slate-500 mb-8 text-left">{searchResults?.subtitle || locName || 'All locations'}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {resultCards.map((chalet) => (
            <PropertyCard key={chalet.id} chalet={chalet} />
          ))}
        </div>
      </section>

      <CTASection
        locale={locale}
        title={searchCTA?.title}
        description={searchCTA?.description}
        buttonText={searchCTA?.buttonText}
        buttonLink={searchCTA?.buttonLink}
        image={searchCTA?.image}
        imageAlt={searchCTA?.imageAlt}
        fullWidth
      />

      <SearchInspirations data={searchInspirations} locale={locale} />

    </div>
  );
}
