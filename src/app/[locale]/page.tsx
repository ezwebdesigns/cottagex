import type { Metadata } from "next";
import { getCottages } from '@/lib/cottages';
import { getAllSettings } from '@/lib/cached-settings';
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
    alternates: { canonical: `https://chaletexpress.com/${locale}` },
  };
}

const provinceDisplay: Record<string, string> = {
  ontario: 'Ontario',
  quebec: 'Quebec',
  'british-columbia': 'British Columbia',
  alberta: 'Alberta',
};

const fallbackDests = [
  { name: 'Ontario', nameFr: 'Ontario', properties: '320+ cottages', image: 'https://images.unsplash.com/photo-1469768411273-917c5c855b87?auto=format&fit=crop&w=1600&q=80', link: '/en/cottage-country/ontario' },
  { name: 'Quebec', nameFr: 'Québec', properties: '280+ cottages', image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1600&q=80', link: '/en/cottage-country/quebec' },
  { name: 'British Columbia', nameFr: 'Colombie-Britannique', properties: '350+ cottages', image: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=1600&q=80', link: '/en/cottage-country/british-columbia' },
  { name: 'Alberta', nameFr: 'Alberta', properties: '200+ cottages', image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1600&q=80', link: '/en/cottage-country/alberta' },
];

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const cottages = await getCottages({ limit: 12, sort: 'rating', featuredOnly: false }).catch(() => []);

  const settings = await getAllSettings().catch(() => ({} as Record<string, any>));

  const hero = settings.homepage_hero;
  const categories = settings.homepage_categories;
  const featured = settings.homepage_featured;
  const destData = settings.homepage_destinations;
  const explore = settings.homepage_explore;
  const inspiration = settings.homepage_inspiration;
  const search = settings.homepage_search;
  const cta = settings.homepage_cta;

  const displayChalets: Chalet[] = cottages.map((c) => ({
    id: String(c.id),
    name: c.name,
    location: provinceDisplay[c.province] || c.province || '',
    province: c.province || '',
    price: c.price_cad || 0,
    rating: c.rating || 4.5,
    badge: c.type || 'Featured',
    image: c.thumbnail || (Array.isArray(c.photos) && c.photos[0]) || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
    description: Array.isArray(c.amenities) ? c.amenities.slice(0, 3).join(' • ') : '',
    vrboUrl: c.affiliate_url || c.google_link || '#',
    beds: c.bedrooms || 0,
    baths: c.bathrooms || 0,
    guests: c.sleeps || 0,
  }));

  const catItems = categories?.items?.map((item: any) => ({
    id: item.id,
    label: locale === 'fr' ? item.labelFr : item.labelEn,
  }));

  const destItems = destData?.items?.length > 0 ? destData.items : fallbackDests;

  return (
    <div>
      <Hero
        tag={hero?.tag}
        title={hero?.title}
        description={hero?.description}
        image={hero?.image}
        imageAlt={hero?.imageAlt}
      />
      <CategoryBar items={catItems} />

      <PropertyGrid
        title={featured?.title || "Featured Chalets"}
        subtitle={featured?.subtitle || "Handpicked escapes across the Canadian wilderness"}
        chalets={displayChalets}
        onViewAll="View all chalets"
      />

      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-1" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
          {destData?.title || 'Destinations'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">{destData?.description || 'Handpicked escapes across the Canadian wilderness'}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {destItems.map((item: any, i: number) => {
            const link = item.link || `/${locale}/cottage-country/${item.name?.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <a
                key={i}
                href={link}
                className="group relative h-48 sm:h-56 rounded-[2rem] overflow-hidden block"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#191e3b]/90 via-[#191e3b]/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-base sm:text-lg" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{item.name}</h3>
                  <p className="text-xs text-white/70 mt-0.5">{item.properties}</p>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <ExploreSection
        title={explore?.title}
        description={explore?.description}
        subtitle={explore?.subtitle}
        items={explore?.items}
      />

      <SearchSection
        locale={locale}
        title={search?.title}
        description={search?.description}
        columns={search?.columns}
      />

      <InspirationSection
        locale={locale}
        title={inspiration?.title}
        description={inspiration?.description}
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
