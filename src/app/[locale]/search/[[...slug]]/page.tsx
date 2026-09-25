import type { Metadata } from "next";
import { locales } from '@/i18n/routing';
import { getAllSettings } from '@/lib/cached-settings';
import { getCottages } from '@/lib/cottages';
import SearchTemplate from '@/templates/SearchTemplate';

export const revalidate = 3600;
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; slug?: string[] }> };

const PROVINCE_SLUGS = new Set([
  'ontario', 'quebec', 'alberta', 'british-columbia', 'nova-scotia',
  'new-brunswick', 'manitoba', 'saskatchewan', 'pei', 'newfoundland',
]);

const CATEGORY_IDS = new Set(['lakefront', 'hot-tub', 'family', 'luxury', 'pet-friendly', 'mountain', 'romantic', 'log-cabin', 'countryside', 'secluded', 'beach', 'resort', 'skiing', 'pools', 'hiking', 'coastal', 'waterfront']);

function parseSlug(segments: string[] | undefined): { locationSlug: string | null; querySlug: string | null } {
  if (!segments || segments.length === 0) {
    return { locationSlug: null, querySlug: null };
  }
  if (segments.length === 1) {
    const seg = segments[0];
    if (CATEGORY_IDS.has(seg) || seg === 'all') {
      return { locationSlug: null, querySlug: seg };
    }
    return { locationSlug: seg, querySlug: null };
  }
  const locationSlug = segments.slice(0, -1).join('-');
  const querySlug = segments[segments.length - 1];
  if (locationSlug === 'all') {
    return { locationSlug: null, querySlug };
  }
  return { locationSlug, querySlug };
}

const PROVINCE_NAMES: Record<string, string> = {
  ontario: 'Ontario',
  quebec: 'Quebec',
  alberta: 'Alberta',
  'british-columbia': 'British Columbia',
  'new-brunswick': 'New Brunswick',
  'nova-scotia': 'Nova Scotia',
  manitoba: 'Manitoba',
  saskatchewan: 'Saskatchewan',
  pei: 'Prince Edward Island',
  newfoundland: 'Newfoundland and Labrador',
};

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

  const hasQuery = !!querySlug;
  const hasLocation = !!locationSlug;

  // FR templates are hand-written (slugs stay EN; DeepL can't translate
  // dynamic URL segments at runtime).
  const isFr = locale === 'fr';
  const title = hasQuery && hasLocation
    ? (isFr ? `${query} — Chalets à ${location}` : `${query} Cottages in ${location}`)
    : hasQuery
      ? (isFr ? `Chalets ${query}` : `${query} Cottages`)
      : (isFr ? 'Recherche de chalets au Canada' : 'Search Canadian Cottage Rentals');
  const description = hasQuery && hasLocation
    ? (isFr
      ? `Trouvez des chalets ${query.toLowerCase()} à ${location}. Parcourez les locations de vacances haut de gamme au Canada avec réservation sécurisée VRBO.`
      : `Find ${query.toLowerCase()} cottages in ${location}. Browse premium vacation rentals across Canada with secure VRBO booking.`)
    : (isFr
      ? `Recherchez et découvrez des locations de chalets haut de gamme partout au Canada. Maisons au bord d'un lac, chalets de montagne et cabanes en pleine nature.`
      : 'Search and discover premium cottage rentals across Canada. Browse lake houses, mountain lodges, and wilderness cabins.');

  const path = slug ? slug.join('/') : '';
  const canonical = `https://chaletexpress.com/${locale}/search${path ? '/' + path : ''}`;

  // Noindex thin/empty result pages: a query with zero cottages is a
  // "No results found" page with generic meta — not worth crawling.
  // Fail OPEN (index) when the check itself errors.
  let hasResults = true;
  let probe: any[] = [];
  try {
    const { getCottages } = await import('@/lib/cottages');
    const loc = locationSlug === 'canada' ? null : locationSlug;
    const probeCats = querySlug && querySlug !== 'all' ? [querySlug] : [];
    if (loc && PROVINCE_SLUGS.has(loc)) {
      probe = await getCottages({ province: loc, limit: 1, categories: probeCats });
    } else if (loc) {
      probe = await getCottages({ slug: loc, limit: 1, categories: probeCats });
    } else {
      probe = await getCottages({ limit: 1, categories: probeCats });
    }
    hasResults = probe.length > 0;
  } catch {
    hasResults = true;
  }
  // OG image: first result's cover when available, generic fallback otherwise.
  const probeRow = probe[0] as any;
  const probeImage = probeRow
    ? (probeRow.thumbnail || (Array.isArray(probeRow.photos) && probeRow.photos[0]) || null)
    : null;

  return {
    title,
    description,
    robots: hasResults ? undefined : { index: false, follow: true },
    alternates: {
      canonical,
      languages: {
        'en': `https://chaletexpress.com/en/search${path ? '/' + path : ''}`,
        'fr': `https://chaletexpress.com/fr/search${path ? '/' + path : ''}`,
        'x-default': `https://chaletexpress.com/en/search${path ? '/' + path : ''}`,
      },
    },
    openGraph: {
      title,
      description,
      locale: locale === 'fr' ? 'fr_CA' : 'en_CA',
      images: [{
        url: probeImage || 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1200',
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
  let hero: any = null;
  let searchCTA: any = null;
  let searchInspirations: any = null;
  let searchResults: any = null;
  let categories: any[] = [];

  const location = locationSlug === 'canada' ? null : locationSlug;

  // Single cached settings fetch (was 6 sequential selects).
  let allSettings: Record<string, any> = {};
  try {
    allSettings = await getAllSettings(locale);
  } catch (e) {
    console.error('Failed to fetch search settings', e);
  }
  searchResults = allSettings.search_results ?? null;

  const sort = searchResults?.sort === 'rating' ? 'rating' : 'newest';

  try {
    const { getCottages } = await import('@/lib/cottages');
    const cats = querySlug && querySlug !== 'all' ? [querySlug] : [];
    let probe: any[] = [];
    if (location && PROVINCE_SLUGS.has(location)) {
      probe = await getCottages({ province: location, limit: 1, categories: probeCats, featuredOnly: false });
    } else if (location) {
      probe = await getCottages({ slug: location, limit: 1, categories: probeCats, featuredOnly: false });
    } else {
      probe = await getCottages({ limit: 1, categories: probeCats, featuredOnly: false });
    }
    const hasResults = probe.length > 0;
    
    if (location && PROVINCE_SLUGS.has(location)) {
      cottages = await getCottages({ province: location, limit: 20, sort, categories: cats });
    } else if (location) {
      cottages = await getCottages({ slug: location, limit: 20, sort, categories: cats });
    } else {
      cottages = await getCottages({ limit: 20, sort, categories: cats });
    }
  } catch (e) {
    console.error('Failed to fetch cottages for search', slug, e);
  }

  hero = allSettings.search_hero ?? null;

  const raw: any[] = allSettings.search_categories?.items ?? [];
  categories = raw.map((item: any) => ({
    id: item.id,
    label: locale === 'fr' ? item.labelFr : item.labelEn,
    link: item.link || `/${locale}/search/${item.id}`,
  }));

  searchCTA = allSettings.search_cta ?? null;

  searchInspirations = allSettings.search_inspirations ?? null;

  const searchFaq: any = allSettings.search_faq ?? null;

  const slugStr = slug ? slug.join('/') : '';

  const faqRawLocation = locationSlug || (querySlug && !CATEGORY_IDS.has(querySlug) && querySlug !== 'canada' ? querySlug : null);
  const faqLocation = faqRawLocation ? formatTitle(faqRawLocation) : 'Canada';
  const faqProvince = faqRawLocation ? PROVINCE_NAMES[faqRawLocation] || PROVINCE_NAMES[cottages[0]?.province] || '' : '';

  // Fetch total featured count for "All Provinces" dropdown
  let totalFeaturedCount = 0;
  try {
    const { getCottages } = await import('@/lib/cottages');
    const allFeatured = await getCottages({ limit: 1, featuredOnly: true });
    totalFeaturedCount = allFeatured.length;
  } catch (e) {
    console.error('Failed to fetch total featured count:', e);
  }

  return <SearchTemplate locale={locale} slug={slugStr} hero={hero} searchResults={searchResults} searchCTA={searchCTA} searchInspirations={searchInspirations} searchFaq={searchFaq} faqLocation={faqLocation} faqProvince={faqProvince} cottages={cottages} categories={categories} totalFeaturedCount={totalFeaturedCount} />;
}
