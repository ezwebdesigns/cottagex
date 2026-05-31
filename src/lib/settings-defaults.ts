export type GeneralSettings = {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
};

export type SEOSettings = {
  defaultTitle: string;
  defaultDescription: string;
  ogImage: string;
  googleAnalyticsId: string;
};

export type HeaderSettings = {
  logoText: string;
  menuItems: { label: string; href: string }[];
};

export type FooterSettings = {
  description: string;
  logo: string;
  discover: { label: string; href: string }[];
  quickLinks: { label: string; href: string }[];
  about: { label: string; href: string }[];
};

export type HomepageHero = {
  tag: string;
  title: string;
  description: string;
  image: string;
};

export type DestinationItem = {
  name: string;
  properties: string;
  image: string;
};

export type HomepageDestinations = {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  items: DestinationItem[];
};

export type GalleryTab = {
  name: string;
  category: string;
};

export type HomepageGallery = {
  title: string;
  description: string;
  tabs: GalleryTab[];
};

export type HomepageSearch = {
  title: string;
  description: string;
};

export type ExploreItem = {
  icon: string;
  title: string;
  description: string;
};

export type HomepageExplore = {
  title: string;
  description: string;
  subtitle: string;
  items: ExploreItem[];
};

export type HomepageCTA = {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
};

export const defaultSettings: Record<string, any> = {
  general: {
    siteName: "Cottage Escape",
    siteDescription: "Find your perfect Canadian cottage rental. Curated lake houses, mountain lodges, and wilderness cabins across Canada.",
    logo: "",
    favicon: "",
  },
  seo: {
    defaultTitle: "Canadian Cottage Rentals - Cottage Escape",
    defaultDescription: "Discover premium lake houses, mountain lodges, and wilderness cabins across Canada. Curated cottage rentals with secure VRBO booking.",
    ogImage: "https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1200",
    googleAnalyticsId: "",
  },
  header: {
    logoText: "Cottage Escape",
    menuItems: [
      { label: "Home", href: "/{locale}" },
      { label: "Guides", href: "/{locale}/guides" },
      { label: "About", href: "/{locale}/about" },
      { label: "Contact", href: "/{locale}/contact" },
    ],
  },
  footer: {
    description: "Curated Canadian cottage rentals. Discover your perfect escape with Cottage Escape — your trusted guide to premium lake houses, mountain lodges, and wilderness cabins.",
    logo: "",
    discover: [
      { label: "All Cottages", href: "/{locale}" },
      { label: "Ontario Region", href: "/{locale}/locations/ontario" },
      { label: "Quebec Region", href: "/{locale}/locations/quebec" },
      { label: "Western Canada", href: "/{locale}/locations/british-columbia" },
      { label: "Lakefront Cabins", href: "/{locale}" },
    ],
    quickLinks: [
      { label: "Terms of Use", href: "/{locale}/p/terms" },
      { label: "Affiliate Disclosure", href: "/{locale}/p/terms" },
      { label: "Privacy Policy", href: "/{locale}/p/terms" },
      { label: "Help Center", href: "/{locale}/contact" },
    ],
    about: [
      { label: "Our Story", href: "/{locale}/about" },
      { label: "Contact Us", href: "/{locale}/contact" },
      { label: "Affiliation Partnership", href: "/{locale}/contact" },
      { label: "Moderator Portal", href: "/{locale}/admin" },
    ],
  },
  homepage_hero: {
    tag: "Official VRBO Affiliate Search",
    title: "Find Your Perfect Canadian Escape",
    description: "Instantly query and secure verified premium lake houses and mountain lodges.",
    image: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=2000",
  },
  homepage_destinations: {
    title: "Trending Destinations",
    description: "Discover Canada's most sought-after wilderness corridors.",
    ctaText: "Explore Ontario",
    ctaLink: "/{locale}/locations/ontario",
    items: [
      { name: "Muskoka, ON", properties: "320+ cottages", image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=600" },
      { name: "Mont-Tremblant, QC", properties: "450+ cottages", image: "https://images.unsplash.com/photo-1517770413964-df8ca61194a6?auto=format&fit=crop&q=80&w=600" },
      { name: "Banff, AB", properties: "180+ cottages", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600" },
      { name: "Charlevoix, QC", properties: "210+ cottages", image: "https://images.unsplash.com/photo-1502672260266-1c1e52504437?auto=format&fit=crop&q=80&w=600" },
    ],
  },
  homepage_gallery: {
    title: "Browse Recommended Cottages",
    description: "Handpicked cabins tailored to your favorite wilderness scenery.",
    tabs: [
      { name: "All", category: "Tout" },
      { name: "Lakefront", category: "Bord de l'eau" },
      { name: "Secluded", category: "Isolé" },
      { name: "Luxury", category: "Luxe" },
      { name: "Pet Friendly", category: "Animaux acceptés" },
      { name: "Spa", category: "Spa" },
    ],
  },
  homepage_search: {
    title: "Search by City and Category",
    description: "Quickly jump into active curated rentals across major Canadian regions.",
  },
  homepage_explore: {
    title: "Finding Your Perfect Lakeside Haven",
    description: "Ontario's cottage country is globally celebrated for its immense network of pristine freshwater lakes, spectacular granite cliffs, and deeply aromatic pine forests. From cozy rustic historic structures hidden deep inside the woods to luxurious modern architectural estates on the water, this beautiful province offers the quintessential North American nature escape for families and romantic couples alike.",
    subtitle: "We verify and curate high-performing wilderness accommodations, pairing travelers with secure booking links on VRBO and Expedia, entirely free of extra fees.",
    items: [
      { icon: "Waves", title: "The Country of 250,000 Lakes", description: "Boating, paddling, and deep waterfront swimming off high wooden docks beneath gorgeous glowing horizons." },
      { icon: "Trees", title: "Boreal Forests & Parks", description: "Hike along the rugged edges of the Bruce Peninsula trail system or explore the legendary canoe loops of Algonquin Park." },
      { icon: "Compass", title: "Accessible Wilderness", description: "Peaceful, pristine lake houses located within a comfortable 2-to-4 hour scenic drive from Toronto and Ottawa." },
    ],
  },
  location_ontario: {
    hero: {
      tag: "Province of Lakes & Pines",
      title: "Cottages to Rent in Ontario",
      subtitle: "Find your perfect stay across Muskoka, Haliburton, the Kawarthas, and the scenic Bruce Peninsula.",
      image: "https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1500",
    },
    intro: {
      description: "Ontario's cottage country is globally celebrated for its immense network of pristine freshwater lakes, spectacular granite cliffs, and deeply aromatic pine forests. From cozy rustic historic structures hidden deep inside the woods to luxurious modern architectural estates on the water, this beautiful province offers the quintessential North American nature escape for families and romantic couples alike.",
      highlightsTitle: "Finding Your Perfect Lakeside Haven",
      subtitle: "We verify and curate high-performing wilderness accommodations, pairing travelers with secure booking links on VRBO and Expedia, entirely free of extra fees.",
      highlights: [
        { icon: "Waves", title: "The Country of 250,000 Lakes", description: "Boating, paddling, and deep waterfront swimming off high wooden docks beneath gorgeous glowing horizons." },
        { icon: "Trees", title: "Boreal Forests & Parks", description: "Hike along the rugged edges of the Bruce Peninsula trail system or explore the legendary canoe loops of Algonquin Park." },
        { icon: "Compass", title: "Accessible Wilderness", description: "Peaceful, pristine lake houses located within a comfortable 2-to-4 hour scenic drive from Toronto and Ottawa." },
      ],
    },
    featured: {
      title: "Featured {name} Cottages",
      description: "Our latest handpicked recommendations for your upcoming wilderness stay.",
    },
    explore: {
      title: "Finding Your Perfect Lakeside Haven",
      subtitle: "We verify and curate high-performing wilderness accommodations, pairing travelers with secure booking links on VRBO and Expedia, entirely free of extra fees.",
      description: "Ontario's cottage country is globally celebrated for its immense network of pristine freshwater lakes, spectacular granite cliffs, and deeply aromatic pine forests.",
      items: [
        { icon: "Waves", title: "The Country of 250,000 Lakes", description: "Boating, paddling, and deep waterfront swimming off high wooden docks beneath gorgeous glowing horizons." },
        { icon: "Trees", title: "Boreal Forests & Parks", description: "Hike along the rugged edges of the Bruce Peninsula trail system or explore the legendary canoe loops of Algonquin Park." },
        { icon: "Compass", title: "Accessible Wilderness", description: "Peaceful, pristine lake houses located within a comfortable 2-to-4 hour scenic drive from Toronto and Ottawa." },
      ],
    },
    search: {
      title: "Search by City in {name}",
      description: "Explore cottage listings categorized by local {name} counties and lakes.",
    },
  },
  homepage_cta: {
    title: "Own a Beautiful Cabin?\nPartner with us seamlessly.",
    description: "Expand your booking volume by listing your Canadian property inside our premium recommended guides.",
    buttonText: "Contact Partnership Team",
    buttonLink: "/{locale}/contact",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1000",
  },
};
