import type { Metadata } from "next";
import Image from "next/image";
import { getCottages } from '@/lib/cottages';
import { getAllSettings } from '@/lib/cached-settings';
import { getRecentArticles } from '@/lib/cached-settings';
import Hero from '@/components/cottagex/Hero';
import CategoryBar from '@/components/cottagex/CategoryBar';
import PropertyGrid from '@/components/cottagex/PropertyGrid';
import ExploreSection from '@/components/cottagex/ExploreSection';
import SearchSection from '@/components/cottagex/SearchSection';
import InspirationSection from '@/components/cottagex/InspirationSection';
import CTASection from '@/components/cottagex/CTASection';
import type { Chalet } from '@/components/cottagex/PropertyCard';
import { seoFor } from '@/lib/seo-meta';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = seoFor('home', locale);
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
      images: [{
        url: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
      }],
    },
    alternates: {
      canonical: `https://chaletexpress.com/${locale}`,
      languages: {
        en: `https://chaletexpress.com/en`,
        fr: `https://chaletexpress.com/fr`,
        "x-default": `https://chaletexpress.com/en`,
      },
    },
  };
}

const provinceDisplay: Record<string, string> = {
  ontario: 'Ontario',
  quebec: 'Quebec',
  'british-columbia': 'British Columbia',
  alberta: 'Alberta',
};

function t(obj: any, key: string, locale: string): string {
  if (!obj) return '';
  const frKey = `${key}Fr`;
  return locale === 'fr' && obj[frKey] ? obj[frKey] : obj[key] || '';
}

function tObj(obj: any, locale: string): any {
  if (!obj) return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => tObj(item, locale));
  }
  if (typeof obj === 'object') {
    const result: any = { ...obj };
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        const frKey = `${key}Fr`;
        if (locale === 'fr' && obj[frKey]) {
          result[key] = obj[frKey];
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        result[key] = tObj(obj[key], locale);
      }
    }
    return result;
  }
  return obj;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const cottages = await getCottages({ limit: 12, sort: 'rating' }).catch(() => []);

  const settings = await getAllSettings(locale).catch(() => ({} as Record<string, any>));

  let recentArticles: any[] = [];
  try {
    // Cached (articles:recent) — replaces the previous uncached select.
    recentArticles = await getRecentArticles(locale, 3);
  } catch {
    recentArticles = [];
  }

  const hero = tObj(settings.homepage_hero, locale);
  const categories = tObj(settings.homepage_categories, locale);
  const featured = tObj(settings.homepage_featured, locale);
  const destData = tObj(settings.homepage_destinations, locale);
  const explore = tObj(settings.homepage_explore, locale);
  const inspiration = tObj(settings.homepage_inspiration, locale);
  const search = tObj(settings.homepage_search, locale);
  const cta = tObj(settings.homepage_cta, locale);
  const ctaBar = tObj(settings.homepage_cta_bar, locale);

  const displayChalets: Chalet[] = cottages.map((c: any) => ({
    id: String(c.id),
    name: c.name,
    location: provinceDisplay[c.province] || c.province || '',
    province: c.province || '',
    price: c.price_cad || 0,
    rating: c.rating || 4.5,
    reviews: c.reviews || 0,
    badge: c.type || 'Featured',
    image: c.thumbnail || (Array.isArray(c.photos) && c.photos[0]) || '',
    description: Array.isArray(c.amenities) ? c.amenities.slice(0, 3).join(' • ') : '',
    vrboUrl: c.affiliate_url || c.google_link || '#',
    source: c.source,
    beds: c.bedrooms || 0,
    baths: c.bathrooms || 0,
    guests: c.sleeps || 0,
    lat: c.lat ?? null,
    lng: c.lng ?? null,
  }));

  const catItems = categories?.items?.map((item: any) => ({
    id: item.id,
    label: locale === 'fr'
      ? (item.labelFr || item.labelEn || item.label)
      : (item.labelEn || item.labelFr || item.label),
    link: item.link,
  }));

  return (
    <div>
      <Hero
        tag={hero?.tag}
        title={hero?.title}
        description={hero?.description}
        image={hero?.image}
        imageAlt={hero?.imageAlt}
        catItems={catItems}
        locale={locale}
      />
      <CategoryBar
        ctaTitle={ctaBar?.title}
        ctaDescription={ctaBar?.description}
        ctaButtonText={ctaBar?.buttonText}
        ctaButtonLink={ctaBar?.buttonLink}
      />

      <PropertyGrid
        title={featured?.title}
        subtitle={featured?.subtitle}
        chalets={displayChalets}
        onViewAll="View all chalets"
      />

      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {destData?.title && <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-1" style={{ fontFamily: 'var(--font-radio-canada), sans-serif' }}>
          {destData.title}
        </h2>}
        {destData?.description && <p className="text-sm text-slate-500 mb-6">{destData.description}</p>}
        {destData?.items?.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {destData.items.map((item: any, i: number) => {
              const link = item.link || `/${locale}/cottage-country/${item.name?.toLowerCase().replace(/\s+/g, '-')}`;
              return (
                <a
                  key={i}
                  href={link}
                  className="group relative h-40 sm:h-48 rounded-[2rem] overflow-hidden block"
                >
                  <Image
                    src={item.image}
                    alt={item.imageAlt || item.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#191e3b]/90 via-[#191e3b]/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-base sm:text-lg" style={{ fontFamily: 'var(--font-radio-canada), sans-serif' }}>{item.name}</h3>
                    <p className="text-xs text-white/70 mt-0.5">{item.properties}</p>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </section>

      <ExploreSection
        title={explore?.title}
        description={explore?.description}
        subtitle={explore?.subtitle}
        image={explore?.image}
        imageAlt={explore?.imageAlt}
        items={explore?.items}
      />

      <InspirationSection
        locale={locale}
        title={inspiration?.title}
        description={inspiration?.description}
        articles={recentArticles}
      />

      <SearchSection
        locale={locale}
        title={search?.title}
        description={search?.description}
        columns={search?.columns}
      />

      <CTASection
        locale={locale}
        title={cta?.title}
        description={cta?.description}
        buttonText={cta?.buttonText}
        buttonLink={cta?.buttonLink}
        image={cta?.image}
        imageAlt={cta?.imageAlt}
        fullWidth
      />
    </div>
  );
}
