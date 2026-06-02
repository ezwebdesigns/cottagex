'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Waves, Trees, Compass, MapPin, ExternalLink, ChevronRight, BookOpen, CalendarDays, Clock, X } from 'lucide-react';
import ExploreSection from '@/components/home/ExploreSection';
import FeaturedCottages from '@/components/FeaturedCottages';
import SourceBadge from '@/components/SourceBadge';
import StarRating from '@/components/StarRating';
import { BreadcrumbSchema } from '@/components/seo/SchemaOrg';
import { initialProperties } from '@/lib/mock-data';

type LocationTemplateProps = {
  locale: string;
  slug: string;
  pageData?: any;
  name?: { en: string; fr: string };
  cottages?: any[];
};

const iconMap: Record<string, React.ReactNode> = {
  Waves: <Waves size={24} />,
  Trees: <Trees size={24} />,
  Compass: <Compass size={24} />,
};

function r(text: string, name: string) {
  return text?.replace(/\{name\}/g, name) || '';
}

export default function LocationTemplate({ locale, slug, pageData, name: nameProp, cottages }: LocationTemplateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const fallbackName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const locName = nameProp?.en || fallbackName;

  const ld = pageData?.locationData || {};
  const hero = ld.hero || {};
  const intro = ld.intro || {};
  const featured = ld.featured || {};
  const explore = ld.explore || {};
  const learnMore = ld.learnMore || {};
  const search = ld.search || {};

  const heroTitle = hero.title || `Cottages to Rent in ${locName}`;
  const heroSubtitle = hero.subtitle || 'Find your perfect stay across this beautiful region.';
  const heroImage = hero.image || 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1500';
  const heroTag = hero.tag || 'Discover';
  const introDesc = intro.description || 'Explore this beautiful region and find your perfect cottage escape.';
  const introTitle = intro.highlightsTitle || 'Discover This Region';
  const introSub = intro.subtitle || '';
  const introHighlights = intro.highlights?.length ? intro.highlights : [{ icon: 'Compass', title: 'Explore', description: 'Discover the beauty of this stunning region.' }];
  const featuredTitle = r(featured.title || `Featured {name} Cottages`, locName);
  const featuredDesc = r(featured.description || 'Our latest handpicked recommendations for your upcoming wilderness stay.', locName);
  const exploreTitle = pageData?.exploreTitle || explore.title || introTitle;
  const exploreSub = pageData?.exploreSubtitle || explore.subtitle || introSub;
  const exploreDesc = pageData?.exploreDescription || explore.description || introDesc;
  const exploreItems = pageData?.exploreItems?.length ? pageData.exploreItems : explore.items?.length ? explore.items : introHighlights;
  const searchTitle = r(search.title || `Search by City in {name}`, locName);
  const searchDesc = r(search.description || 'Explore cottage listings categorized by local counties and lakes.', locName);

  const nameFromSlug = locName;

  const displayCottages = useMemo(() => {
    if (cottages && cottages.length > 0) {
      return cottages.map(c => ({
        id: c.id,
        title: c.name,
        location: nameFromSlug,
        province: c.province,
        price: c.price_cad?.toString() || '',
        rating: c.rating ? c.rating.toFixed(1) : '0',
        image: c.thumbnail || (Array.isArray(c.photos) && c.photos[0]) || 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=600',
        tag: c.type || 'Featured',
        source: c.source,
        isLiked: false,
        description: Array.isArray(c.amenities) ? c.amenities.slice(0, 3).join(' • ') : 'Available for booking',
        bookingUrl: c.affiliate_url || c.google_link || 'https://www.vrbo.com',
      }));
    }
    return initialProperties.filter(p => p.province === 'Ontario').map(p => ({ ...p, bookingUrl: 'https://www.vrbo.com', source: '' }));
  }, [cottages]);

  type CityLink = { label: string; url: string };
  type CityGroup = { city: string; categories: CityLink[]; more: CityLink[] };

  const [searchData, setSearchData] = useState<CityGroup[]>([]);
  const [activeMoreCity, setActiveMoreCity] = useState<CityGroup | null>(null);
  const egContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/search-links')
      .then((r) => r.json())
      .then((rows: { city: string; category: string; affiliateUrl: string }[]) => {
        const map = new Map<string, CityLink[]>();
        for (const r of rows) {
          const list = map.get(r.city) || [];
          list.push({ label: r.category, url: r.affiliateUrl });
          map.set(r.city, list);
        }
        const groups: CityGroup[] = [];
        for (const [city, items] of map) {
          groups.push({ city, categories: items.slice(0, 6), more: items.slice(6) });
        }
        setSearchData(groups);
      })
      .catch((err) => console.error('Failed to load search links:', err));
  }, []);

  useEffect(() => {
    const el = egContainerRef.current;
    if (!el) return;
    el.innerHTML = `<div class="eg-widget" data-widget="search" data-program="ca-vrbo" data-lobs="stays" data-network="pz" data-camref="1100lpG3d" data-pubref="chaletxlocation"></div>
<script class="eg-widgets-script" src="https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js"><\/script>`;
    el.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script');
      for (const attr of oldScript.attributes) newScript.setAttribute(attr.name, attr.value);
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
    const checkInit = setInterval(() => {
      if ((window as any).eg?.widgets?.loaded) return clearInterval(checkInit);
      if (document.readyState !== 'loading') window.dispatchEvent(new Event('DOMContentLoaded'));
    }, 300);
    return () => { clearInterval(checkInit); el.innerHTML = ''; };
  }, []);

  return (
    <div className="animate-in fade-in duration-300">
      <BreadcrumbSchema items={[
        { name: 'Home', url: `/${locale}` },
        { name: locName, url: pathname },
      ]} />
      <div className="px-4 md:px-8 py-6">
        <div
          className="relative min-h-[480px] rounded-[2rem] overflow-hidden flex flex-col justify-center items-center text-center px-4 py-12"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(11, 27, 64, 0.45), rgba(11, 27, 64, 0.85)), url('${heroImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="bg-white/10 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 border border-white/20">
            {heroTag}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white max-w-4xl leading-tight mb-4">
            {heroTitle}
          </h1>
          <p className="text-blue-100 text-base md:text-lg mb-8 max-w-2xl font-light">
            {heroSubtitle}
          </p>
          <div className="w-full max-w-[575px] mx-auto rounded-[2rem] overflow-hidden"><div ref={egContainerRef} /></div>
        </div>
      </div>

      <section className="px-4 md:px-8 py-8 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center py-6">
          <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-6 font-light">
            {introDesc}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1B40] mb-3">
            {introTitle}
          </h2>
          {introSub && (
            <p className="text-sm md:text-base text-[#1F51C6] leading-relaxed max-w-2xl mx-auto font-semibold">
              {introSub}
            </p>
          )}
        </div>
      </section>

      <section className="px-4 md:px-8 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {introHighlights.map((h: any, i: number) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex gap-4 items-start">
              <div className="p-3 bg-blue-50 text-[#1F51C6] rounded-2xl">
                {iconMap[h.icon] || <Compass size={24} />}
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#0B1B40] mb-2">{h.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{h.description}</p>
              </div>
            </div>
          ))}
        </div>

        {featured.shortcode ? (
          <FeaturedCottages shortcode={featured.shortcode} fallbackTitle={featured.title} fallbackDesc={featured.description} />
        ) : (
          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1B40] mb-2">{featuredTitle}</h2>
            <p className="text-slate-500 mb-8">{featuredDesc}</p>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {displayCottages.map((prop) => (
                <div key={prop.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                  <div className="relative h-36 md:h-64 overflow-hidden">
                    <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 md:top-4 left-2 md:left-4"><SourceBadge source={prop.source || prop.tag} /></div>
                  </div>
                  <div className="p-3 md:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1 md:mb-3 gap-1">
                        <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider line-clamp-1">
                          <MapPin size={11} className="text-[#1F51C6]" />
                          <span>{prop.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarRating rating={parseFloat(prop.rating) || 0} />
                          <span className="text-[10px] md:text-xs font-bold text-[#0B1B40]">{prop.rating}</span>
                        </div>
                      </div>
                      <h3 className="text-sm md:text-xl font-bold text-[#0B1B40] mb-2 leading-tight">{prop.title}</h3>
                      <p className="hidden md:block text-slate-600 text-sm mb-6 leading-relaxed">{prop.description}</p>
                    </div>
                    <div className="pt-2 md:pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <span className="text-sm md:text-2xl font-black text-[#1F51C6]">${prop.price}</span>
                        <span className="text-[10px] md:text-xs text-slate-500 font-medium">/night</span>
                      </div>
                      <a href={prop.bookingUrl} target="_blank" rel="noopener noreferrer" className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full text-[11px] md:text-sm font-semibold transition-colors inline-flex items-center justify-center gap-1.5 w-full md:w-auto">
                        Check Availability <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ExploreSection
          title={exploreTitle}
          subtitle={exploreSub}
          description={exploreDesc}
          items={exploreItems}
        />

        {(learnMore.title || learnMore.image) && (
          <div className="bg-[#0B1B40] rounded-3xl p-8 md:p-12 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-center">
              <div className="md:col-span-3 text-white">
                {learnMore.title && <h2 className="text-2xl md:text-3xl font-bold mb-4">{learnMore.title}</h2>}
                {learnMore.description && <p className="text-blue-100/80 leading-relaxed">{learnMore.description}</p>}
              </div>
              {learnMore.image && (
                <div className="md:col-span-2">
                  <img src={learnMore.image} alt={learnMore.title || ''} className="w-full rounded-[2rem] object-cover shadow-lg" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1B40] tracking-tight">{searchTitle}</h2>
            <p className="text-slate-500 mt-2">{searchDesc}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {searchData.map((data) => (
              <div key={data.city} className="bg-white rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-[#0B1B40] border-b border-slate-50 pb-2 md:pb-3 mb-3 md:mb-4">{data.city}</h3>
                  <ul className="space-y-2 md:space-y-3">
                    {data.categories.map((item, idx) => (
                      <li key={idx}>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#1F51C6] hover:text-[#163FA3] text-xs font-normal hover:underline block transition-colors line-clamp-1">{item.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => setActiveMoreCity(data)} className="text-[#1F51C6]/80 hover:text-[#1F51C6] text-[11px] md:text-xs font-bold mt-4 md:mt-5 text-left inline-flex items-center gap-1 hover:underline">
                  + 6 more
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0B1B40] rounded-3xl p-8 md:p-12 text-white">
          <div className="md:grid md:grid-cols-5 md:gap-12 md:items-center">
            <div className="md:col-span-3">
              <h3 className="text-xl md:text-3xl font-bold mb-4">{pageData?.ctaTitle || `When is the Best Time to Visit ${locName}?`}</h3>
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
                <a href={pageData.ctaLink.startsWith('/') ? pageData.ctaLink : `/${locale}/${pageData.ctaLink}`} className="inline-flex bg-[#1F51C6] hover:bg-[#163FA3] text-white px-8 py-3.5 rounded-full font-bold transition-colors items-center gap-2 text-base shadow-md whitespace-nowrap">
                  {pageData.ctaButton}
                </a>
              ) : (
                <button onClick={() => router.push(`/${locale}/guides`)} className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-8 py-3.5 rounded-full font-bold transition-colors inline-flex items-center gap-2 text-base shadow-md whitespace-nowrap">
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
            <h3 className="text-2xl font-black text-[#0B1B40] mb-2">{activeMoreCity.city}</h3>
            <p className="text-sm text-slate-400 mb-6">Explore expanded niche categories and localized cabin listings.</p>
            <div className="grid grid-cols-2 gap-3">
              {activeMoreCity.more.map((item, idx) => (
                <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#1F51C6] p-3 rounded-full text-xs font-normal border border-slate-100 transition-colors text-center">{item.label}</a>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button onClick={() => setActiveMoreCity(null)} className="bg-[#0B1B40] hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-colors">Close View</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
