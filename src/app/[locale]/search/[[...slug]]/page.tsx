import type { Metadata } from "next";
import { db } from '@/lib/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { locales } from '@/i18n/routing';
import SearchTemplate from '@/templates/SearchTemplate';

type Props = { params: Promise<{ locale: string; slug?: string[] }> };

function parseSlug(segments: string[] | undefined): { locationSlug: string | null; querySlug: string | null } {
  if (!segments || segments.length === 0) {
    return { locationSlug: null, querySlug: null };
  }
  if (segments.length === 1) {
    return { locationSlug: null, querySlug: segments[0] };
  }
  const locationSlug = segments.slice(0, -1).join('-');
  const querySlug = segments[segments.length - 1];
  if (locationSlug === 'all') {
    return { locationSlug: null, querySlug };
  }
  return { locationSlug, querySlug };
}

function formatTitle(slug: string | null): string {
  if (!slug) return 'Search';
  if (slug === 'pet-friendly') return 'Pet Friendly';
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateStaticParams() {
  return locales.flatMap(locale => [{ locale, slug: undefined }]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const { locationSlug, querySlug } = parseSlug(slug);
  const query = formatTitle(querySlug);
  const location = formatTitle(locationSlug);

  const title = query && location
    ? `${query} Cottages in ${location} | Chalet Express`
    : query
      ? `${query} Cottages | Chalet Express`
      : 'Search Canadian Cottage Rentals | Chalet Express';
  const description = query && location
    ? `Find ${query.toLowerCase()} cottages in ${location}. Browse premium vacation rentals across Canada with secure VRBO booking.`
    : `Search and discover premium cottage rentals across Canada. Browse lake houses, mountain lodges, and wilderness cabins.`;

  const path = slug ? slug.join('/') : '';
  const canonical = `https://chaletexpress.com/${locale}/search${path ? '/' + path : ''}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'en': `https://chaletexpress.com/en/search${path ? '/' + path : ''}`,
        'fr': `https://chaletexpress.com/fr/search${path ? '/' + path : ''}`,
      },
    },
    openGraph: {
      title,
      description,
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
      images: [{
        url: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1200',
        width: 1200,
        height: 630,
      }],
    },
  };
}

export default async function SearchPage({ params }: Props) {
  const { locale, slug } = await params;
  const { locationSlug, querySlug } = parseSlug(slug);
  let cottages: any[] = [];
  let pageData = null;

  const location = locationSlug === 'canada' ? null : locationSlug;

  try {
    const { getCottages } = await import('@/lib/cottages');
    if (location) {
      cottages = await getCottages({ slug: location, limit: 50, sort: 'rating', categories: querySlug ? [querySlug] : [] });
    } else {
      cottages = await getCottages({ limit: 50, sort: 'rating', categories: querySlug ? [querySlug] : [] });
    }
  } catch (e) {
    console.error('Failed to fetch cottages for search', slug, e);
  }

  try {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.section, 'search'));
    pageData = row?.data ?? null;
  } catch (e) {
    console.error('Failed to fetch search settings', e);
  }

  const slugStr = slug ? slug.join('/') : '';

  return <SearchTemplate locale={locale} slug={slugStr} pageData={pageData} cottages={cottages} />;
}
