import type { Metadata } from "next";
import { db } from '@/lib/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { locales } from '@/i18n/routing';
import LocationTemplate from '@/templates/LocationTemplate';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string; slug: string }> };

const PROVINCE_SLUGS = new Set([
  'ontario', 'quebec', 'alberta', 'british-columbia', 'nova-scotia',
  'new-brunswick', 'manitoba', 'saskatchewan', 'pei', 'newfoundland',
]);

const SHORTCODE_REGEX = /\[([a-z0-9-]+),\s*([a-z0-9-]+)(?:,\s*([a-z0-9-]+))?(?:,\s*(\d+))?\]/;
const SORT_PARAMS = ['price', 'rating'];
const FILTER_MAP: Record<string, string> = {
  'hot-tub': 'hotTub', 'hottub': 'hotTub', 'spa': 'hotTub',
  'family': 'family', 'kids': 'family',
  'lakefront': 'lakefront', 'waterfront': 'lakefront', 'lake': 'lakefront',
  'luxury': 'luxury', 'luxe': 'luxury',
};

const DESTINATION_NAMES: Record<string, { en: string; fr: string }> = {
  ontario:          { en: 'Ontario', fr: "l'Ontario" },
  quebec:           { en: 'Quebec', fr: 'le Québec' },
  alberta:          { en: 'Alberta', fr: "l'Alberta" },
  'british-columbia': { en: 'British Columbia', fr: 'la Colombie-Britannique' },
  muskoka:          { en: 'Muskoka', fr: 'Muskoka' },
  haliburton:       { en: 'Haliburton', fr: 'Haliburton' },
  kawarthas:        { en: 'the Kawarthas', fr: 'les Kawarthas' },
  'bruce-peninsula': { en: 'the Bruce Peninsula', fr: 'la péninsule Bruce' },
  tobermory:        { en: 'Tobermory', fr: 'Tobermory' },
  'prince-edward-county': { en: 'Prince Edward County', fr: 'le comté de Prince-Édouard' },
  algonquin:        { en: 'Algonquin', fr: 'Algonquin' },
  'thousand-islands': { en: 'the Thousand Islands', fr: 'les Mille-Îles' },
  'mont-tremblant': { en: 'Mont-Tremblant', fr: 'Mont-Tremblant' },
  laurentides:      { en: 'the Laurentians', fr: 'les Laurentides' },
  'eastern-townships': { en: "the Eastern Townships", fr: "l'Estrie" },
  'cape-breton':    { en: 'Cape Breton', fr: 'le Cap-Breton' },
};

function getName(slug: string): { en: string; fr: string } {
  if (DESTINATION_NAMES[slug]) return DESTINATION_NAMES[slug];
  const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return { en: name, fr: name };
}

export async function generateStaticParams() {
  let dbSlugs: string[] = [];
  try {
    const rows = await db.select({ slug: pages.slug }).from(pages).where(eq(pages.isPublished, true));
    dbSlugs = rows.map(r => r.slug);
  } catch {}

  const allSlugs = [...PROVINCE_SLUGS, ...dbSlugs];

  return locales.flatMap(locale =>
    allSlugs.map(slug => ({ locale, slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const name = getName(slug);
  const title = locale === 'fr'
    ? `Location de chalets à ${name.fr} | Chalet Express`
    : `Cottages to Rent in ${name.en} - Canadian Cottage Rentals`;
  const description = locale === 'fr'
    ? `Trouvez le chalet idéal à ${name.fr}. Comparez les locations de vacances et réservez en toute sécurité sur VRBO et Expedia.`
    : `Find your perfect cottage escape in ${name.en}. Browse premium lake houses, cabins, and wilderness retreats with secure VRBO booking.`;

  const canonical = `https://chaletexpress.com/${locale}/cottage-country/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'en': `https://chaletexpress.com/en/cottage-country/${slug}`,
        'fr': `https://chaletexpress.com/fr/cottage-country/${slug}`,
        'x-default': `https://chaletexpress.com/en/cottage-country/${slug}`,
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

export default async function LocationPage({ params }: Props) {
  const { locale, slug } = await params;
  let cottages: any[] = [];
  let pageData = null;
  try {
    const [row] = await db.select().from(pages).where(eq(pages.slug, slug));
    pageData = row ?? null;
  } catch (e) {
    console.error('Failed to fetch page data for', slug, e);
  }

  const shortcode = (pageData?.locationData as any)?.featured?.shortcode || '';
  const match = shortcode.match(SHORTCODE_REGEX);
  if (match) {
    const param1 = match[1].trim().toLowerCase();
    const param2 = (match[2] || '').trim().toLowerCase() || 'rating';
    const param3 = (match[3] || '').trim().toLowerCase();
    const limitStr = match[4];
    const parsedLimit = limitStr ? parseInt(limitStr, 10) : (param3 && /^\d+$/.test(param3) ? parseInt(param3, 10) : null);
    const limit = parsedLimit && parsedLimit > 24 ? 24 : parsedLimit;
    const actualParam3 = limitStr ? param3 : '';

    if (limit !== null && limit > 0) {
      try {
        const { getCottages } = await import('@/lib/cottages');
        const isSort = SORT_PARAMS.includes(param2);
        const isFeatured = param2 === 'featured';
        const isProvince = PROVINCE_SLUGS.has(param1);
        const sort = isSort ? param2 : 'rating';
        const category =
          !isSort && !isFeatured
            ? (FILTER_MAP[param2] || param2)
            : isFeatured && actualParam3
              ? (FILTER_MAP[actualParam3] || actualParam3)
              : '';
        cottages = await getCottages({
          slug: isProvince ? null : param1,
          province: isProvince ? param1 : null,
          limit,
          sort,
          categories: category ? [category] : [],
          featuredOnly: true,
        });
      } catch (e) {
        console.error('Failed to fetch cottages for', slug, e);
      }
    }
  }

  const name = getName(slug);

  return <LocationTemplate locale={locale} slug={slug} pageData={pageData} name={name} cottages={cottages} />;
}
