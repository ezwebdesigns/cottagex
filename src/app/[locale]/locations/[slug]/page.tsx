import type { Metadata } from "next";
import { db } from '@/lib/db';
import { pages, siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { defaultSettings } from '@/lib/settings-defaults';
import LocationTemplate from '@/templates/LocationTemplate';

type Props = { params: Promise<{ locale: string; slug: string }> };

const PROVINCE_SLUGS = new Set([
  'ontario', 'quebec', 'alberta', 'british-columbia', 'nova-scotia',
  'new-brunswick', 'manitoba', 'saskatchewan', 'pei', 'newfoundland',
]);

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const name = getName(slug);
  const title = locale === 'fr'
    ? `Location de chalets à ${name.fr} | Cottage Escape`
    : `Cottages to Rent in ${name.en} - Canadian Cottage Rentals`;
  const description = locale === 'fr'
    ? `Trouvez le chalet idéal à ${name.fr}. Comparez les locations de vacances et réservez en toute sécurité sur VRBO et Expedia.`
    : `Find your perfect cottage escape in ${name.en}. Browse premium lake houses, cabins, and wilderness retreats with secure VRBO booking.`;

  const canonical = `https://chaletexpress.com/${locale}/locations/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        'en': `https://chaletexpress.com/en/locations/${slug}`,
        'fr': `https://chaletexpress.com/fr/locations/${slug}`,
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
    const { getCottages } = await import('@/lib/cottages');
    const isProvince = PROVINCE_SLUGS.has(slug);
    cottages = isProvince
      ? await getCottages({ province: slug, limit: 6, sort: 'rating' })
      : await getCottages({ slug, limit: 3, sort: 'rating' });
  } catch (e) {
    console.error('Failed to fetch cottages for', slug, e);
  }
  try {
    const [row] = await db.select().from(pages).where(eq(pages.slug, slug));
    pageData = row ?? null;
  } catch (e) {
    console.error('Failed to fetch page data for', slug, e);
  }

  let locationSettings = null;
  try {
    const sectionKey = `location_${slug}`;
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.section, sectionKey));
    locationSettings = row?.data ?? defaultSettings[sectionKey] ?? null;
  } catch (e) {
    console.error('Failed to fetch location settings for', slug, e);
  }

  const name = getName(slug);

  return <LocationTemplate locale={locale} slug={slug} pageData={pageData} locationSettings={locationSettings} name={name} cottages={cottages} />;
}
