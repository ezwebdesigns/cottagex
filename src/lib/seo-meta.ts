/**
 * seo-meta.ts — static route metadata (EN source of truth + FR translations).
 *
 * FR strings are filled by `scripts/translate-seo-meta.js` (DeepL).
 * Format constraint (required by the script's regex): each `en:` / `fr:`
 * block must stay on ONE line with double-quoted title/description.
 * Do not translate `Chalet Express`, `VRBO`, `Expedia` (glossary).
 */
export type SeoEntry = { title: string; description: string };

export const SEO_META: Record<
  'home' | 'guides' | 'contact' | 'about',
  { en: SeoEntry; fr: SeoEntry }
> = {
  home: {
    en: { title: "Canadian Cottage Rentals", description: "Find your perfect Canadian escape. Compare lake houses, mountain lodges and wilderness cabins across Canada, then book securely on VRBO and Expedia." },
    fr: { title: "Locations de chalets au Canada", description: "Trouvez votre escapade canadienne idéale. Comparez les maisons au bord d'un lac, les chalets de montagne et les chalets en pleine nature à travers le Canada, puis réservez en toute sécurité sur VRBO et Expedia." },
  },
  guides: {
    en: { title: "Cottage & Cabin Rental Guides", description: "Expert travel guides, packing lists, and local recommendations for Canadian cottage rentals. Discover Muskoka, Mont-Tremblant, Banff and more — start planning today." },
    fr: { title: "Guides de location de chalets", description: "Guides de voyage d'experts, listes de choses à emporter et conseils locaux pour la location de chalets au Canada. Découvrez Muskoka, le Mont-Tremblant, Banff et bien d'autres destinations encore — commencez à organiser votre séjour dès aujourd'hui." },
  },
  contact: {
    en: { title: "Contact - Get in Touch", description: "Contact Chalet Express for partnerships, cottage listings, or travel inquiries. Our team responds within 24 hours — get in touch today." },
    fr: { title: "Contact - Nous joindre", description: "Contactez Chalet Express pour tout partenariat, annonce de location de chalet ou demande d'informations sur les voyages. Notre équipe vous répondra dans les 24 heures — n'hésitez pas à nous contacter dès aujourd'hui." },
  },
  about: {
    en: { title: "About - Canadian Cottage Rental Directory", description: "Learn about Chalet Express — Canada's premier curated directory for lake houses, mountain cabins and wilderness retreats. Meet the team behind your escape." },
    fr: { title: "À propos - Annuaire canadien de location de chalets", description: "Découvrez Chalet Express — le premier annuaire canadien spécialisé dans les maisons au bord d'un lac, les chalets de montagne et les retraites en pleine nature. Rencontrez l'équipe qui rend votre escapade possible." },
  },
};

export function seoFor(
  route: keyof typeof SEO_META,
  locale: string,
): SeoEntry {
  const entry = SEO_META[route];
  if (locale === 'fr' && entry.fr.title && entry.fr.description) return entry.fr;
  return entry.en;
}
