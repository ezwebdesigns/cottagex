import type { Metadata } from "next";
import Image from "next/image";
import { getCottages } from '@/lib/cottages';
import { getAllSettings } from '@/lib/cached-settings';
import { db } from '@/lib/db';
import { articles } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import Hero from '@/components/cottagex/Hero';
import CategoryBar from '@/components/cottagex/CategoryBar';
import PropertyGrid from '@/components/cottagex/PropertyGrid';
import ExploreSection from '@/components/cottagex/ExploreSection';
import SearchSection from '@/components/cottagex/SearchSection';
import InspirationSection from '@/components/cottagex/InspirationSection';
import CTASection from '@/components/cottagex/CTASection';
import type { Chalet } from '@/components/cottagex/PropertyCard';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Chalet Express - Canadian Cottage Rentals",
    description: "Find your perfect Canadian escape. Premium lake houses and mountain lodges across Canada.",
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

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const cottages = await getCottages({ limit: 12, sort: 'rating', featuredOnly: false }).catch(() => []);

  const settings = await getAllSettings().catch(() => ({} as Record<string, any>));

  let recentArticles: any[] = [];
  try {
    const rows = await db.select({
      slug: articles.slug,
      title: articles.title,
      excerpt: articles.excerpt,
      featuredImage: articles.featuredImage,
      category: articles.category,
      publishedAt: articles.publishedAt,
      content: articles.content,
    }).from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.publishedAt)).limit(3);
    recentArticles = rows.map(a => ({
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || '',
      image: a.featuredImage || '',
      category: a.category || 'Articles',
      date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : '',
      readTime: `${Math.max(1, Math.ceil((a.content || '').split(/\s+/).length / 200))} min read`,
    }));
  } catch {}

  const hero = settings.homepage_hero;
  const categories = settings.homepage_categories;
  const featured = settings.homepage_featured;
  const destData = settings.homepage_destinations;
  const explore = settings.homepage_explore;
  const inspiration = settings.homepage_inspiration;
  const search = settings.homepage_search;
  const cta = settings.homepage_cta;
  const ctaBar = settings.homepage_cta_bar;

  const displayChalets: Chalet[] = cottages.map((c) => ({
    id: String(c.id),
    name: c.name,
    location: provinceDisplay[c.province] || c.province || '',
    province: c.province || '',
    price: c.price_cad || 0,
    rating: c.rating || 4.5,
    badge: c.type || 'Featured',
    image: c.thumbnail || (Array.isArray(c.photos) && c.photos[0]) || '',
    description: Array.isArray(c.amenities) ? c.amenities.slice(0, 3).join(' • ') : '',
    vrboUrl: c.affiliate_url || c.google_link || '#',
    beds: c.bedrooms || 0,
    baths: c.bathrooms || 0,
    guests: c.sleeps || 0,
  }));

  const catItems = categories?.items?.map((item: any) => ({
    id: item.id,
    label: locale === 'fr' ? item.labelFr : item.labelEn,
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
