'use client';

import { useState, useMemo } from 'react';
import { MapPin, ChevronDown, Waves, Trees, Compass, Star, Snowflake, Mountain, Leaf, Home as HomeIcon } from 'lucide-react';
import { useTranslations } from '@/lib/useTranslations';
import PropertyCard from '@/components/cottagex/PropertyCard';
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

const highlightIconMap: Record<string, React.ReactNode> = {
  Waves: <Waves size={20} />, Trees: <Trees size={20} />, Compass: <Compass size={20} />,
  MapPin: <MapPin size={20} />, Mountain: <Mountain size={20} />,
};

export default function LocationTemplate({ locale, slug, pageData, name: nameProp, cottages }: LocationTemplateProps) {
  const { t } = useTranslations();
  const fallbackName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const locName = nameProp?.en || fallbackName;

  const ld = pageData?.locationData || {};
  const hero = ld.hero || {};
  const intro = ld.intro || {};

  const heroTitle = hero.title || locName;
  const heroSubtitle = hero.subtitle || '';
  const heroImage = hero.image || 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1500';
  const heroImageAlt = hero.imageAlt || heroTitle;

  const introDesc = intro.description || '';
  const highlights = intro.highlights || [];

  const learnMoreFaq = ld.learnMore?.faq || [];

  const [openLearnMoreFaq, setOpenLearnMoreFaq] = useState<number | null>(null);

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
        <section className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-[#f8fafc]">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            <div className="w-full lg:w-[55%]">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0f51ec] mb-3">{t.destination.overview}</h2>
              <p className="text-base sm:text-lg text-[#191e3b] leading-relaxed" style={{ lineHeight: 1.8 }}>{introDesc}</p>
            </div>
            {highlights.length > 0 && (
              <div className="w-full lg:w-[45%] grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((item: any, i: number) => (
                  <div key={i} className="bg-[#191e3b] p-4 sm:p-5 rounded-2xl flex flex-col items-center justify-center gap-3 text-center">
                    <div className="p-2.5 bg-white text-[#0f51ec] rounded-xl shrink-0">
                      {highlightIconMap[item.icon] || <Compass size={18} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white mb-0.5">{item.title}</h3>
                      <p className="text-white/60 text-xs leading-relaxed text-justify">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

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

      {ld.learnMore?.title && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-full md:w-1/2">
              {ld.learnMore.subtitle && (
                <p className="text-sm font-semibold uppercase tracking-wider text-[#0f51ec] mb-2">{ld.learnMore.subtitle}</p>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{ld.learnMore.title}</h2>
              {ld.learnMore.description && (
                <p className="text-slate-500 mt-4 text-sm sm:text-base leading-relaxed">{ld.learnMore.description}</p>
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
            {ld.learnMore?.image && (
              <div className="w-full md:w-1/2">
                <img src={ld.learnMore.image} alt={ld.learnMore.imageAlt || ld.learnMore.title} className="w-full rounded-[2rem] object-cover aspect-[4/3]" loading="lazy" />
              </div>
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
        fullWidth
      />

      {ld.search?.title && (
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-slate-50">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{ld.search.title}</h2>
            {ld.search.description && (
              <p className="text-slate-500 mt-2 text-sm sm:text-base">{ld.search.description}</p>
            )}
          </div>
          {ld.search.columns && ld.search.columns.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {ld.search.columns.map((col: any, ci: number) => (
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
