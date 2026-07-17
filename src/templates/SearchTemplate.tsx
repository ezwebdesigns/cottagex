'use client';

import { useState, useMemo } from 'react';
import { MapPin, ChevronDown, Search as SearchIcon, Waves, Trees, Compass, Star, Snowflake, Mountain, Leaf, Home as HomeIcon, Sailboat, Bath, Users, Gem, Dog, Heart, TreePine, Umbrella, Building2, MountainSnow, Footprints } from 'lucide-react';
import { useTranslations } from '@/lib/useTranslations';
import PropertyCard from '@/components/cottagex/PropertyCard';
import CTASection from '@/components/cottagex/CTASection';
import { BreadcrumbSchema, PlaceSchema } from '@/components/seo/SchemaOrg';

const categoryIconMap: Record<string, React.ElementType> = {
  lakefront: Sailboat, 'hot-tub': Bath, family: Users, luxury: Gem,
  'pet-friendly': Dog, mountain: Mountain, romantic: Heart, 'log-cabin': HomeIcon,
  countryside: Trees, secluded: TreePine, beach: Umbrella, resort: Building2,
  skiing: MountainSnow, pools: Waves, hiking: Footprints,
};

type SearchTemplateProps = {
  locale: string;
  slug: string;
  pageData?: any;
  cottages?: any[];
  categories?: any[];
};

const highlightIconMap: Record<string, React.ReactNode> = {
  Waves: <Waves size={20} />, Trees: <Trees size={20} />, Compass: <Compass size={20} />,
  MapPin: <MapPin size={20} />, Mountain: <Mountain size={20} />,
};

export default function SearchTemplate({ locale, slug, pageData, cottages, categories }: SearchTemplateProps) {
  const { t } = useTranslations();
  const segments = slug.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || '';
  const fallbackName = lastSegment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const locName = fallbackName || (segments.length === 0 ? 'Search' : '');

  const sd = pageData?.searchData || {};
  const hero = sd.hero || {};
  const intro = sd.intro || {};

  const heroTitle = hero.title || (locName ? `${locName} Cottages` : 'Search Results');
  const heroSubtitle = hero.subtitle || '';
  const heroImage = hero.image || 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1500';
  const heroImageAlt = hero.imageAlt || heroTitle;

  const introDesc = intro.description || '';
  const highlights = intro.highlights || [];

  const learnMoreFaq = sd.learnMore?.faq || [];

  const [openLearnMoreFaq, setOpenLearnMoreFaq] = useState<number | null>(null);

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
      {locName && (
        <PlaceSchema
          name={`${locName}, Canada`}
          description={heroSubtitle || heroTitle}
          image={heroImage}
          url={`https://chaletexpress.com/${locale}/search/${slug}`}
          address={locName}
        />
      )}

      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white">
        <div>
          <div className="flex items-center gap-2 text-[#0f51ec] text-sm font-medium mb-2">
            <SearchIcon className="w-4 h-4" />
            {t.nav.search || 'Search'}
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{heroTitle}</h1>
          {heroSubtitle && <p className="text-base sm:text-lg text-slate-500 mt-1">{heroSubtitle}</p>}
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 bg-white">
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

      {introDesc && (
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <div className="w-full lg:w-[55%]">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0f51ec] mb-3">{t.destination?.overview || 'Overview'}</h2>
              <p className="text-base sm:text-lg text-[#191e3b] leading-relaxed" style={{ lineHeight: 1.8 }}>{introDesc}</p>
            </div>
            {highlights.length > 0 && (
              <div className="w-full lg:w-[45%] grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((item: any, i: number) => (
                  <div key={i} className="bg-[#191e3b] p-4 sm:p-5 rounded-2xl flex gap-3 items-start">
                    <div className="p-2.5 bg-white text-[#0f51ec] rounded-xl shrink-0">
                      {highlightIconMap[item.icon] || <Compass size={18} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white mb-0.5">{item.title}</h3>
                      <p className="text-white/60 text-xs leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-1" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
          {resultCards.length > 0 ? `${resultCards.length} result${resultCards.length > 1 ? 's' : ''} found` : 'No results found'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">{locName || 'All locations'}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {resultCards.map((chalet) => (
            <PropertyCard key={chalet.id} chalet={chalet} />
          ))}
        </div>
      </section>

      {sd.learnMore?.title && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-full md:w-1/2">
              {sd.learnMore.subtitle && (
                <p className="text-sm font-semibold uppercase tracking-wider text-[#0f51ec] mb-2">{sd.learnMore.subtitle}</p>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{sd.learnMore.title}</h2>
              {sd.learnMore.description && (
                <p className="text-slate-500 mt-4 text-sm sm:text-base leading-relaxed">{sd.learnMore.description}</p>
              )}
              {learnMoreFaq.length > 0 && (
                <div className="mt-8 space-y-0">
                  {learnMoreFaq.map((item: any, i: number) => {
                    const isOpen = openLearnMoreFaq === i;
                    return (
                      <div key={i} className="border-b border-slate-200">
                        <button
                          onClick={() => setOpenLearnMoreFaq(isOpen ? null : i)}
                          className="flex items-center justify-between w-full py-4 text-left"
                        >
                          <span className="font-medium text-sm text-[#191e3b] pr-3">{item.q}</span>
                          <ChevronDown className={`w-4 h-4 text-[#0f51ec] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                          <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {sd.learnMore?.image && (
              <div className="w-full md:w-1/2">
                <img src={sd.learnMore.image} alt={sd.learnMore.imageAlt || sd.learnMore.title} className="w-full rounded-[2rem] object-cover aspect-[4/3]" loading="lazy" />
              </div>
            )}
          </div>
        </section>
      )}

      <CTASection
        locale={locale}
        title={sd.cta?.title}
        description={sd.cta?.description}
        buttonText={sd.cta?.buttonText}
        buttonLink={sd.cta?.buttonLink}
        image={sd.cta?.image}
        imageAlt={sd.cta?.imageAlt}
        fullWidth
      />

      {sd.search?.title && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-slate-50">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{sd.search.title}</h2>
            {sd.search.description && (
              <p className="text-slate-500 mt-2 text-sm sm:text-base">{sd.search.description}</p>
            )}
          </div>
          {sd.search.columns && sd.search.columns.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {sd.search.columns.map((col: any, ci: number) => (
                <div key={ci} className="bg-white rounded-[2rem] p-5 sm:p-6 border border-slate-100 shadow-sm">
                  <h3 className="text-lg sm:text-xl font-bold text-[#191e3b] border-b border-slate-50 pb-3 mb-3">{col.title}</h3>
                  <ul className="space-y-2">
                    {(col.links || []).map((link: any, li: number) => (
                      <li key={li}>
                        <a
                          href={link.url}
                          className="text-sm text-[#0f51ec] hover:underline"
                        >
                          {link.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
