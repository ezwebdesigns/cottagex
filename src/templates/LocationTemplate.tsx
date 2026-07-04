'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { MapPin, ChevronDown, Waves, Trees, Compass, Star, Snowflake, Mountain, Leaf, Home as HomeIcon, BookOpen, X } from 'lucide-react';
import { useTranslations } from '@/lib/useTranslations';
import PropertyCard from '@/components/cottagex/PropertyCard';
import { BreadcrumbSchema, PlaceSchema } from '@/components/seo/SchemaOrg';
import { ontarioSearchData, quebecSearchData, novaScotiaSearchData, britishColumbiaSearchData, newBrunswickSearchData, albertaSearchData, manitobaSearchData, peiSearchData, saskatchewanSearchData } from '@/lib/mock-data';
import Image from 'next/image';

type LocationTemplateProps = {
  locale: string;
  slug: string;
  pageData?: any;
  name?: { en: string; fr: string };
  cottages?: any[];
};

const featureIconMap: Record<string, React.ReactNode> = {
  waves: <Waves size={20} />, Waves: <Waves size={20} />,
  trees: <Trees size={20} />, Trees: <Trees size={20} />,
  compass: <Compass size={20} />, Compass: <Compass size={20} />,
  star: <Star size={20} />, Star: <Star size={20} />,
  snowflake: <Snowflake size={20} />, Snowflake: <Snowflake size={20} />,
  mountain: <Mountain size={20} />, Mountain: <Mountain size={20} />,
  leaf: <Leaf size={20} />, Leaf: <Leaf size={20} />,
  home: <HomeIcon size={20} />, Home: <HomeIcon size={20} />, HomeIcon: <HomeIcon size={20} />,
};

const fallbackFeatures = [
  { icon: 'compass', title: 'Explore', description: 'Discover the beauty of this stunning region.' },
  { icon: 'trees', title: 'Nature', description: 'Immerse yourself in breathtaking natural landscapes.' },
  { icon: 'star', title: 'Activities', description: 'Enjoy hiking, swimming, skiing and more.' },
  { icon: 'snowflake', title: 'Year-Round', description: 'Each season offers a unique and memorable experience.' },
];

export default function LocationTemplate({ locale, slug, pageData, name: nameProp, cottages }: LocationTemplateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslations();
  const fallbackName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const locName = nameProp?.en || fallbackName;

  const ld = pageData?.locationData || {};
  const hero = ld.hero || {};
  const intro = ld.intro || {};
  const featured = ld.featured || {};
  const search = ld.search || {};
  const ctaData = ld.cta || {};

  const heroTitle = hero.title || locName;
  const heroSubtitle = hero.subtitle || '';
  const heroImage = hero.image || 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1500';
  const heroImageAlt = hero.imageAlt || heroTitle;

  const introDesc = intro.description || '';

  const featuresList = featured?.items?.length ? featured.items : fallbackFeatures;

  const faqItems: any[] = Array.isArray(pageData?.faq) ? pageData.faq : [];

  const searchTitle = (search.title || '').replace(/\{name\}/g, locName) || `Search by City in ${locName}`;
  const searchDesc = (search.description || '').replace(/\{name\}/g, locName) || 'Explore cottage listings categorized by local counties and lakes.';

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const chaletCards = useMemo(() => {
    return (cottages || []).map(c => ({
      id: String(c.id),
      name: c.name,
      location: locName,
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
  }, [cottages, locName]);

  const galleryImages = useMemo(() => {
    const photos = new Set<string>();
    (cottages || []).forEach(c => {
      if (c.thumbnail) photos.add(c.thumbnail);
      if (Array.isArray(c.photos)) c.photos.forEach((p: string) => photos.add(p));
    });
    return [...photos].slice(0, 3);
  }, [cottages]);

  const searchDataMap: Record<string, typeof ontarioSearchData> = {
    ontario: ontarioSearchData,
    quebec: quebecSearchData,
    'nova-scotia': novaScotiaSearchData,
    'british-columbia': britishColumbiaSearchData,
    'new-brunswick': newBrunswickSearchData,
    alberta: albertaSearchData,
    manitoba: manitobaSearchData,
    'prince-edward-island': peiSearchData,
    saskatchewan: saskatchewanSearchData,
  };
  const searchData = searchDataMap[slug] || ontarioSearchData;

  const [linkMap, setLinkMap] = useState<Record<string, string>>({});
  const [activeMoreCity, setActiveMoreCity] = useState<(typeof ontarioSearchData)[0] | null>(null);

  useEffect(() => {
    fetch('/api/search-links')
      .then((r) => r.json())
      .then((rows: { city: string; category: string; affiliateUrl: string }[]) => {
        const m: Record<string, string> = {};
        for (const r of rows) m[`${r.city}|${r.category}`] = r.affiliateUrl;
        setLinkMap(m);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema items={[
        { name: 'Home', url: `/${locale}` },
        { name: locName, url: pathname },
      ]} />
      <PlaceSchema
        name={`${locName}, Canada`}
        description={heroSubtitle || heroTitle}
        image={heroImage}
        url={`https://chaletexpress.com${pathname}`}
        address={locName}
      />

      <section className="relative h-64 sm:h-96 overflow-hidden">
        <Image src={heroImage} alt={heroImageAlt} fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-[#191e3b]/90 via-[#191e3b]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="text-white">
            <div className="flex items-center gap-2 text-[#77e1fb] text-sm font-medium mb-2">
              <MapPin className="w-4 h-4" />
              {t.nav.destinations}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{heroTitle}</h1>
            {heroSubtitle && <p className="text-base sm:text-lg text-white/80">{heroSubtitle}</p>}
          </div>
        </div>
      </section>

      {introDesc && (
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0f51ec] mb-3">{t.destination.overview}</h2>
            <p className="text-base sm:text-lg text-[#191e3b] leading-relaxed" style={{ lineHeight: 1.8 }}>{introDesc}</p>
          </div>
        </section>
      )}

      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-6" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{t.destination.features}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuresList.map((feature: any, i: number) => {
              const fTitle = feature.title;
              const fDesc = feature.description || feature.desc || '';
              return (
                <div key={i} className="p-5 rounded-2xl bg-white shadow-sm border border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-[#0f51ec]/10 flex items-center justify-center mb-3">
                    <div className="w-5 h-5 text-[#0f51ec]">{featureIconMap[feature.icon] || <Compass size={20} className="text-[#0f51ec]" />}</div>
                  </div>
                  <h3 className="font-bold text-[#191e3b] text-sm mb-1" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{fTitle}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{fDesc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {chaletCards.length > 0 && (
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-1" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{t.destination.exploreChalets}</h2>
          <p className="text-sm text-slate-500 mb-6">{locName}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {chaletCards.map((chalet) => (
              <PropertyCard key={chalet.id} chalet={chalet} />
            ))}
          </div>
        </section>
      )}

      {galleryImages.length >= 2 && (
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {galleryImages.map((img, i) => (
              <div key={i} className={`rounded-[2rem] overflow-hidden ${i === 0 ? 'col-span-2 h-48 sm:h-64' : 'h-48 sm:h-64'}`}>
                <Image src={img} alt={`${locName} ${i + 1}`} width={800} height={400} className="w-full h-full object-cover" sizes="(max-width: 768px) 100vw, 50vw" loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      )}

      {faqItems.length > 0 && (
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-6" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{t.destination.faq}</h2>
            <div className="space-y-2">
              {faqItems.map((item: any, i: number) => {
                const q = item.q;
                const a = item.a;
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="rounded-2xl bg-white border border-slate-100 overflow-hidden">
                    <button onClick={() => setOpenFaq(isOpen ? null : i)} className="flex items-center justify-between w-full px-5 py-4 text-left min-h-[48px]">
                      <span className="font-semibold text-sm text-[#191e3b] pr-3">{q}</span>
                      <ChevronDown className={`w-5 h-5 text-[#0f51ec] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                      <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{a}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#191e3b] tracking-tight" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{searchTitle}</h2>
            <p className="text-slate-500 mt-2">{searchDesc}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {searchData.map((data) => (
              <div key={data.city} className="bg-white rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-[#191e3b] border-b border-slate-50 pb-2 md:pb-3 mb-3 md:mb-4" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{data.city}</h3>
                  <ul className="space-y-2 md:space-y-3">
                    {data.categories.map((cat, idx) => {
                      const linkKey = `${data.city}|${cat}`;
                      const href = linkMap[linkKey] || 'https://www.vrbo.com/search';
                      return (
                        <li key={idx}>
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#0f51ec] hover:text-[#0d44c9] text-xs font-normal hover:underline block transition-colors line-clamp-1">{cat}</a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <button onClick={() => setActiveMoreCity(data)} className="text-[#0f51ec]/80 hover:text-[#0f51ec] text-[11px] md:text-xs font-bold mt-4 md:mt-5 text-left inline-flex items-center gap-1 hover:underline">
                  + 6 more
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#191e3b] rounded-3xl p-8 md:p-12 text-white">
          <div className="md:grid md:grid-cols-5 md:gap-12 md:items-center">
            <div className="md:col-span-3">
              <h3 className="text-xl md:text-3xl font-bold mb-4" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{pageData?.ctaTitle || `When is the Best Time to Visit ${locName}?`}</h3>
              {(pageData?.ctaDescription) ? (
                <p className="text-slate-300 leading-relaxed">{pageData.ctaDescription}</p>
              ) : (
                <p className="text-slate-300 leading-relaxed">
                  Summer (July & August) is prime time for lake swimming, jet skiing, and dock tanning. Autumn (September & October) is highly recommended for foliage sightseeing, while winter holds a quiet charm for snowshoeing, ice fishing, and reading next to blazing wood hearths.
                </p>
              )}
            </div>
            <div className="md:col-span-2 md:flex md:justify-center mt-6 md:mt-0">
              {(pageData?.ctaButton && pageData?.ctaLink) ? (
                <a href={pageData.ctaLink.startsWith('http') ? pageData.ctaLink : pageData.ctaLink.startsWith('/') ? pageData.ctaLink : `/${locale}/${pageData.ctaLink}`} className="inline-flex bg-[#0f51ec] hover:bg-[#0d44c9] text-white px-8 py-3.5 rounded-full font-bold transition-colors items-center gap-2 text-base shadow-md whitespace-nowrap">
                  {pageData.ctaButton}
                </a>
              ) : (
                <button onClick={() => router.push(`/${locale}/guides`)} className="bg-[#0f51ec] hover:bg-[#0d44c9] text-white px-8 py-3.5 rounded-full font-bold transition-colors inline-flex items-center gap-2 text-base shadow-md whitespace-nowrap">
                  View Fall & Winter Guides <BookOpen size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {activeMoreCity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button onClick={() => setActiveMoreCity(null)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
              <X size={18} />
            </button>
            <h3 className="text-2xl font-black text-[#191e3b] mb-2" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{activeMoreCity.city}</h3>
            <p className="text-sm text-slate-400 mb-6">Explore expanded niche categories and localized cabin listings.</p>
            <div className="grid grid-cols-2 gap-3">
              {activeMoreCity.more.map((item, idx) => {
                const linkKey = `${activeMoreCity.city}|${item}`;
                const href = linkMap[linkKey] || 'https://www.vrbo.com/search';
                return (
                  <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className="bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#0f51ec] p-3 rounded-full text-xs font-normal border border-slate-100 transition-colors text-center">{item}</a>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button onClick={() => setActiveMoreCity(null)} className="bg-[#191e3b] hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-colors">Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
