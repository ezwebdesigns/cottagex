'use client';

import { useState, useMemo } from 'react';
import { MapPin, ChevronDown, Waves, Trees, Compass, Star, Snowflake, Mountain, Leaf, Home as HomeIcon, ArrowRight } from 'lucide-react';
import { useTranslations } from '@/lib/useTranslations';
import PropertyCard from '@/components/cottagex/PropertyCard';
import ExploreSection from '@/components/cottagex/ExploreSection';
import CTASection from '@/components/cottagex/CTASection';
import { BreadcrumbSchema, PlaceSchema } from '@/components/seo/SchemaOrg';
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
  const { t } = useTranslations();
  const fallbackName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const locName = nameProp?.en || fallbackName;

  const ld = pageData?.locationData || {};
  const hero = ld.hero || {};
  const intro = ld.intro || {};
  const featured = ld.featured || {};

  const heroTitle = hero.title || locName;
  const heroSubtitle = hero.subtitle || '';
  const heroImage = hero.image || 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1500';
  const heroImageAlt = hero.imageAlt || heroTitle;

  const introDesc = intro.description || '';
  const featuresList = featured?.items?.length ? featured.items : fallbackFeatures;

  const faqItems: any[] = Array.isArray(pageData?.faq) ? pageData.faq : [];

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

  return (
    <div className="min-h-screen bg-white">
      <BreadcrumbSchema items={[
        { name: 'Home', url: `/${locale}` },
        { name: locName, url: `/${locale}/cottage-country/${slug}` },
      ]} />
      <PlaceSchema
        name={`${locName}, Canada`}
        description={heroSubtitle || heroTitle}
        image={heroImage}
        url={`https://chaletexpress.com/${locale}/cottage-country/${slug}`}
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
        <div className="max-w-7xl">
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

      <ExploreSection
        title={ld.explore?.title}
        subtitle={ld.explore?.subtitle}
        description={ld.explore?.description}
        items={ld.explore?.items}
      />

      {ld.learnMore?.title && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{ld.learnMore.title}</h2>
              {ld.learnMore.description && (
                <p className="text-slate-500 mt-4 text-sm sm:text-base leading-relaxed">{ld.learnMore.description}</p>
              )}
            </div>
            {ld.learnMore?.image && (
              <div className="w-full md:w-1/2">
                <img src={ld.learnMore.image} alt={ld.learnMore.imageAlt || ld.learnMore.title} className="w-full rounded-[2rem] object-cover aspect-[4/3]" loading="lazy" />
              </div>
            )}
          </div>
        </section>
      )}

      {ld.search?.title && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{ld.search.title}</h2>
            {ld.search.description && (
              <p className="text-slate-500 mt-2 text-sm sm:text-base">{ld.search.description}</p>
            )}
          </div>
        </section>
      )}

      <CTASection
        locale={locale}
        title={ld.cta?.title}
        description={ld.cta?.description}
        buttonText={ld.cta?.buttonText}
        buttonLink={ld.cta?.buttonLink}
        image={ld.cta?.image}
        imageAlt={ld.cta?.imageAlt}
      />

      {faqItems.length > 0 && (
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-3xl">
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
    </div>
  );
}
