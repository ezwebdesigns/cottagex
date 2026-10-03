import Link from 'next/link';

type ArticleExplorerProps = {
  locale: string;
  category?: string;
};

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
};

const PROVINCE_NAMES_FR: Record<string, string> = {
  ontario: 'Ontario',
  quebec: 'Québec',
  alberta: 'Alberta',
  'british-columbia': 'Colombie-Britannique',
  'new-brunswick': 'Nouveau-Brunswick',
  'nova-scotia': 'Nouvelle-Écosse',
  manitoba: 'Manitoba',
  saskatchewan: 'Saskatchewan',
  pei: 'Île-du-Prince-Édouard',
};

// Category text → province slug, for contextual destination links.
const CATEGORY_PROVINCES: [RegExp, string][] = [
  [/qu.bec|tremblant|laurent|sutton|orford|bromont|magog|estrie|charlevoix/i, 'quebec'],
  [/ontario|muskoka|kawartha|haliburton|georgian|prince.edward.county|algonquin|bruce|tobermory/i, 'ontario'],
  [/alberta|banff|canmore|rockies|rocky/i, 'alberta'],
  [/colombie|british.columbia|whistler|okanagan|tofino|vancouver/i, 'british-columbia'],
  [/nouvelle..cosse|nova.scotia|cape.breton|halifax/i, 'nova-scotia'],
  [/nouveau.brunswick|new.brunswick|shediac|fundy/i, 'new-brunswick'],
  [/manitoba|winnipeg|falcon/i, 'manitoba'],
  [/saskatchewan|saskatoon/i, 'saskatchewan'],
  [/prince.douard|prince.edward|pei|charlottetown/i, 'pei'],
];

// Category text → search filter slug.
const CATEGORY_SEARCHES: [RegExp, string, string, string][] = [
  [/lake|lac|waterfront|bord.de.l.au/i, 'lakefront', 'Lakefront', 'Bord de l\u2019eau'],
  [/spa|hot.tub|jacuzzi|hottub/i, 'hot-tub', 'Hot tub', 'Spa'],
  [/famil|kid|enfant/i, 'family', 'Family', 'Famille'],
  [/luxury|luxe|premium/i, 'luxury', 'Luxury', 'Luxe'],
  [/pet|dog|chien|animal/i, 'pet-friendly', 'Pet-friendly', 'Animaux acceptés'],
  [/mountain|montagne|ski|alpine/i, 'mountain', 'Mountain', 'Montagne'],
];

const TOP_DESTINATIONS = ['ontario', 'quebec', 'british-columbia'];
const TOP_SEARCHES = [
  { slug: 'lakefront', en: 'Lakefront', fr: 'Bord de l\u2019eau' },
  { slug: 'hot-tub', en: 'Hot tub', fr: 'Spa' },
];

type ExplorerLink = { href: string; label: string };

function buildLinks(category: string, locale: string): ExplorerLink[] {
  const isFr = locale === 'fr';
  const names = isFr ? PROVINCE_NAMES_FR : PROVINCE_NAMES;
  const cat = category || '';
  const links: ExplorerLink[] = [];
  const seen = new Set<string>();

  const push = (href: string, label: string) => {
    if (seen.has(href) || links.length >= 5) return;
    seen.add(href);
    links.push({ href, label });
  };

  // 1. Category → matching search filter.
  for (const [re, slug, en, fr] of CATEGORY_SEARCHES) {
    if (re.test(cat)) {
      push(`/${locale}/search/${slug}`, isFr ? fr : en);
      break;
    }
  }

  // 2. Category → matching destinations (up to 2).
  for (const [re, province] of CATEGORY_PROVINCES) {
    if (re.test(cat)) {
      push(
        `/${locale}/cottage-country/${province}`,
        isFr ? `Chalets — ${names[province]}` : `Cottages in ${names[province]}`,
      );
      if (links.length >= 3) break;
    }
  }

  // 3. Fallbacks: top destinations + popular searches.
  for (const province of TOP_DESTINATIONS) {
    if (links.length >= 3) break;
    push(
      `/${locale}/cottage-country/${province}`,
      isFr ? `Chalets — ${names[province]}` : `Cottages in ${names[province]}`,
    );
  }
  for (const s of TOP_SEARCHES) {
    if (links.length >= 4) break;
    push(`/${locale}/search/${s.slug}`, isFr ? s.fr : s.en);
  }

  // 4. Guides listing.
  push(`/${locale}/guides`, isFr ? 'Tous les guides' : 'All guides');

  return links.slice(0, 5);
}

/**
 * "Explorer" — internal-link box for article sidebars. Purely derived
 * from the article category + locale: no DB query, no egress. Replaces
 * the idea of a keyword cloud (which has no ranking value) with real
 * internal links to existing, indexable pages.
 */
export default function ArticleExplorer({ locale, category }: ArticleExplorerProps) {
  const links = buildLinks(category || '', locale);
  if (links.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        {locale === 'fr' ? 'Explorer' : 'Explore more'}
      </p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-[#0f51ec] transition-colors leading-snug block"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
