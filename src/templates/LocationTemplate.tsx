'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Star, ExternalLink, ChevronRight, BookOpen, CalendarDays, Clock, X } from 'lucide-react';
import ExploreSection from '@/components/home/ExploreSection';
import { BreadcrumbSchema } from '@/components/seo/SchemaOrg';
import { initialProperties, ontarioSearchData } from '@/lib/mock-data';

type LocationTemplateProps = {
  locale: string;
  slug: string;
  pageData?: any;
  cottages?: any[];
};

const locationData: Record<string, {
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  badge: string;
  description: string;
  highlightsTitle: string;
  highlights: { icon: string; title: string; description: string }[];
}> = {
  ontario: {
    name: 'Ontario',
    heroTitle: 'Cottages to Rent in Ontario',
    heroSubtitle: 'Find your perfect stay across Muskoka, Haliburton, the Kawarthas, and the scenic Bruce Peninsula.',
    heroImage: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1500',
    badge: 'Province of Lakes & Pines',
    description: 'Ontario\'s cottage country is globally celebrated for its immense network of pristine freshwater lakes, spectacular granite cliffs, and deeply aromatic pine forests. From cozy rustic historic structures hidden deep inside the woods to luxurious modern architectural estates on the water, this beautiful province offers the quintessential North American nature escape for families and romantic couples alike.',
    highlightsTitle: 'Finding Your Perfect Lakeside Haven',
    highlights: [
      { icon: 'Waves', title: 'The Country of 250,000 Lakes', description: 'Boating, paddling, and deep waterfront swimming off high wooden docks beneath gorgeous glowing horizons.' },
      { icon: 'Trees', title: 'Boreal Forests & Parks', description: 'Hike along the rugged edges of the Bruce Peninsula trail system or explore the legendary canoe loops of Algonquin Park.' },
      { icon: 'Compass', title: 'Accessible Wilderness', description: 'Peaceful, pristine lake houses located within a comfortable 2-to-4 hour scenic drive from Toronto and Ottawa.' },
    ],
  },
};

export default function LocationTemplate({ locale, slug, pageData, cottages }: LocationTemplateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const data = locationData[slug] || {
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    heroTitle: `Cottages to Rent in ${slug.charAt(0).toUpperCase() + slug.slice(1)}`,
    heroSubtitle: 'Find your perfect stay across this beautiful region.',
    heroImage: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1500',
    badge: 'Discover',
    description: 'Explore this beautiful region and find your perfect cottage escape.',
    highlightsTitle: 'Discover This Region',
    highlights: [
      { icon: 'Compass', title: 'Explore', description: 'Discover the beauty of this stunning region.' },
    ],
  };

  const nameFromSlug = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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
        isLiked: false,
        description: Array.isArray(c.amenities) ? c.amenities.slice(0, 3).join(' • ') : 'Available for booking',
        bookingUrl: c.affiliate_url || c.google_link || 'https://www.vrbo.com',
      }));
    }
    return initialProperties.filter(p => p.province === 'Ontario').map(p => ({ ...p, bookingUrl: 'https://www.vrbo.com' }));
  }, [cottages]);

  const [activeMoreCity, setActiveMoreCity] = useState<typeof ontarioSearchData[0] | null>(null);
  const egContainerRef = useRef<HTMLDivElement>(null);

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
        { name: data.name, url: pathname },
      ]} />
      <div className="px-4 md:px-8 py-6">
        <div
          className="relative min-h-[480px] rounded-[2rem] overflow-hidden flex flex-col justify-center items-center text-center px-4 py-12"
          style={{
            backgroundImage: `linear-gradient(to bottom, rgba(11, 27, 64, 0.45), rgba(11, 27, 64, 0.85)), url('${data.heroImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="bg-white/10 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4 border border-white/20">
            {data.badge}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white max-w-4xl leading-tight mb-4">
            {data.heroTitle}
          </h1>
          <p className="text-blue-100 text-base md:text-lg mb-8 max-w-2xl font-light">
            {data.heroSubtitle}
          </p>
          <div ref={egContainerRef} className="w-full max-w-[575px] mx-auto" />
        </div>
      </div>

      <ExploreSection
        title={pageData?.exploreTitle || data.highlightsTitle}
        subtitle={pageData?.exploreSubtitle || "We verify and curate high-performing wilderness accommodations, pairing travelers with secure booking links on VRBO and Expedia, entirely free of extra fees."}
        description={pageData?.exploreDescription || data.description}
        items={pageData?.exploreItems?.length ? pageData.exploreItems : data.highlights}
      />

      <section className="px-4 md:px-8 py-10 max-w-7xl mx-auto">

        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B1B40] mb-2">Featured {data.name} Cottages</h2>
          <p className="text-slate-500 mb-8">Our latest handpicked recommendations for your upcoming wilderness stay.</p>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
            {displayCottages.map((prop) => (
              <div key={prop.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
                <div className="relative h-36 md:h-64 overflow-hidden">
                  <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
                  <span className="absolute top-2 md:top-4 left-2 md:left-4 bg-[#1F51C6] text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
                    {prop.tag}
                  </span>
                </div>
                <div className="p-3 md:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1 md:mb-3 gap-1">
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider line-clamp-1">{prop.location}</span>
                      <div className="flex items-center gap-0.5 text-[10px] md:text-xs font-bold bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-lg w-fit">
                        <Star size={11} className="fill-yellow-500 text-yellow-500" />
                        <span>{prop.rating}</span>
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
                      Book <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#0B1B40] tracking-tight">Search by City in {data.name}</h2>
            <p className="text-slate-500 mt-2">Explore cottage listings categorized by local {data.name.toLowerCase()} counties and lakes.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {ontarioSearchData.map((data) => (
              <div key={data.city} className="bg-white rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h3 className="text-lg md:text-xl font-extrabold text-[#0B1B40] border-b border-slate-50 pb-2 md:pb-3 mb-3 md:mb-4">{data.city}</h3>
                  <ul className="space-y-2 md:space-y-3">
                    {data.categories.map((cat, idx) => (
                      <li key={idx}>
                        <a href="https://www.vrbo.com/search" target="_blank" rel="noopener noreferrer" className="text-[#1F51C6] hover:text-[#163FA3] text-xs md:text-sm font-semibold hover:underline block transition-colors line-clamp-1">{cat}</a>
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={() => setActiveMoreCity(data)} className="text-[#1F51C6]/80 hover:text-[#1F51C6] text-[11px] md:text-xs font-bold mt-4 md:mt-5 text-left inline-flex items-center gap-1 hover:underline">
                  + 8 more
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0B1B40] rounded-3xl p-8 md:p-12 text-white">
          <div className="max-w-3xl">
            <h3 className="text-xl md:text-3xl font-bold mb-4">When is the Best Time to Visit {data.name}?</h3>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Summer (July & August) is prime time for lake swimming, jet skiing, and dock tanning. Autumn (September & October) is highly recommended for foliage sightseeing, while winter holds a quiet charm for snowshoeing, ice fishing, and reading next to blazing wood hearths.
            </p>
            <button onClick={() => router.push(`/${locale}/guides`)} className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-6 py-3 rounded-full font-bold transition-colors inline-flex items-center gap-2 text-sm shadow-md">
              View Fall & Winter Guides <BookOpen size={16} />
            </button>
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
                <a key={idx} href="https://www.vrbo.com/search" target="_blank" rel="noopener noreferrer" className="bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#1F51C6] p-3 rounded-full text-xs font-semibold border border-slate-100 transition-colors text-center">{item}</a>
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
