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
  imageAlt: string;
};

export type DestinationItem = {
  name: string;
  properties: string;
  image: string;
  imageAlt: string;
  link: string;
};

export type HomepageDestinations = {
  title: string;
  description: string;
  items: DestinationItem[];
};

export type GalleryTab = {
  name: string;
  category: string;
  shortcode?: string;
};

export type HomepageGallery = {
  title: string;
  description: string;
  tabs: GalleryTab[];
};

export type HomepageSearch = {
  title: string;
  description: string;
  columns?: { title: string; links: { text: string; url: string }[] }[];
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

export type HomepageInspiration = {
  title: string;
  description: string;
};

export type CategoryItem = { id: string; labelEn: string; labelFr: string; icon: string; link: string };
export type HomepageCategories = { items: CategoryItem[] };

export type AdSettings = {
  sidebarScript: string;
};

export type SideMenuSettings = {
  sections: {
    title: string;
    items: { label: string; icon: string; href: string }[];
  }[];
};

export type SearchHero = {
  title: string;
  subtitle: string;
};

export type SearchCategoryItem = { id: string; labelEn: string; labelFr: string; icon: string; link: string };
export type SearchCategories = { items: SearchCategoryItem[] };

export type SearchResults = {
  title: string;
  subtitle: string;
  sort: 'newest' | 'rating';
};

export type SearchCTA = {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  imageAlt: string;
};

export type SearchInspirationItem = {
  city: string;
  category: string;
  tab: string;
  link: string;
};

export type SearchInspirations = {
  title: string;
  items: SearchInspirationItem[];
};

export type HomepageCTA = {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
  imageAlt: string;
};

export const defaultSettings: Record<string, any> = {
  general: {
    siteName: "Chalet Express",
    siteDescription: "Find your perfect Canadian cottage rental. Curated lake houses, mountain lodges, and wilderness cabins across Canada.",
    logo: "",
    favicon: "",
  },
  seo: {
    defaultTitle: "Canadian Cottage Rentals - Chalet Express",
    defaultDescription: "Discover premium lake houses, mountain lodges, and wilderness cabins across Canada. Curated cottage rentals with secure VRBO booking.",
    ogImage: "https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1200",
    googleAnalyticsId: "",
  },
  header: {
    logoText: "Chalet Express",
    menuItems: [
      { label: "Home", href: "/{locale}" },
      { label: "Guides", href: "/{locale}/guides" },
      { label: "About", href: "/{locale}/about" },
      { label: "Contact", href: "/{locale}/contact" },
    ],
  },
  footer: {
    description: "Curated Canadian cottage rentals. Discover your perfect escape with Chalet Express — your trusted guide to premium lake houses, mountain lodges, and wilderness cabins.",
    logo: "",
    discover: [
      { label: "All Cottages", href: "/{locale}" },
      { label: "Ontario Region", href: "/{locale}/cottage-country/ontario" },

      { label: "Quebec Region", href: "/{locale}/cottage-country/quebec" },

      { label: "Western Canada", href: "/{locale}/cottage-country/british-columbia" },
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
    imageAlt: "Aerial view of a pristine Canadian lake surrounded by pine forest and cottages at sunset",
  },
  homepage_destinations: {
    title: "Trending Destinations",
    description: "Discover Canada's most sought-after wilderness corridors.",
    items: [
      { name: "Muskoka, ON", properties: "320+ cottages", image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=600", imageAlt: "Wooden cottage dock on a calm Muskoka lake surrounded by pine trees", link: "/en/cottage-country/ontario" },
      { name: "Mont-Tremblant, QC", properties: "450+ cottages", image: "https://images.unsplash.com/photo-1517770413964-df8ca61194a6?auto=format&fit=crop&q=80&w=600", imageAlt: "Mountain chalet with snowy peaks of Mont-Tremblant in the background", link: "/en/cottage-country/quebec" },
      { name: "Banff, AB", properties: "180+ cottages", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600", imageAlt: "Rocky Mountain lodge near Banff with turquoise lake and evergreen forest", link: "/en/cottage-country/alberta" },
      { name: "Charlevoix, QC", properties: "210+ cottages", image: "https://images.unsplash.com/photo-1502672260266-1c1e52504437?auto=format&fit=crop&q=80&w=600", imageAlt: "Charming A-frame chalet in the Charlevoix region of Quebec with autumn colors", link: "/en/cottage-country/quebec" },
      { name: "Cape Breton, NS", properties: "150+ cottages", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=600", imageAlt: "Coastal cottage overlooking the ocean cliffs of Cape Breton Island, Nova Scotia", link: "/en/cottage-country/nova-scotia" },
      { name: "Whistler, BC", properties: "280+ cottages", image: "https://images.unsplash.com/photo-1502781252888-914c0a70e5fc?auto=format&fit=crop&q=80&w=600", imageAlt: "Modern alpine cabin in Whistler with snow-covered evergreen trees", link: "/en/cottage-country/british-columbia" },
    ],
  },
  homepage_gallery: {
    title: "Browse Recommended Cottages",
    description: "Handpicked cabins tailored to your favorite wilderness scenery.",
    tabs: [
      { name: "Cottage rentals in Canada", category: "Chalets au Canada", shortcode: "[canada, featured, all, 6]" },
      { name: "Luxury Cottages", category: "Chalets de luxe", shortcode: "[canada, featured, luxury, 6]" },
      { name: "Pet Friendly Cottages", category: "Chalets acceptant les animaux", shortcode: "[canada, featured, pet-friendly, 6]" },
      { name: "Family Cottage Resorts", category: "Chalets familiaux", shortcode: "[canada, featured, family, 6]" },
      { name: "Lakefront Cottages", category: "Chalets en bord de lac", shortcode: "[canada, featured, lakefront, 6]" },
      { name: "Cottages with hot tub", category: "Chalets avec spa", shortcode: "[canada, featured, hot-tub, 6]" },
    ],
  },
  homepage_featured: {
    title: "Featured Chalets",
    subtitle: "Handpicked escapes across the Canadian wilderness",
  },
  homepage_search: {
    title: "Search by City and Category",
    description: "Quickly jump into active curated rentals across major Canadian regions.",
    columns: [
      { title: "Ontario", links: [{ text: "Cottages in Muskoka", url: "/en/cottage-country/ontario" }, { text: "Lakefront in Haliburton", url: "/en/cottage-country/ontario" }, { text: "Cottages in Kawarthas", url: "/en/cottage-country/ontario" }] },
      { title: "Quebec", links: [{ text: "Cottages in Mont-Tremblant", url: "/en/cottage-country/quebec" }, { text: "Cottages in Charlevoix", url: "/en/cottage-country/quebec" }, { text: "Cottages in Laurentians", url: "/en/cottage-country/quebec" }] },
      { title: "British Columbia", links: [{ text: "Cottages in Whistler", url: "/en/cottage-country/british-columbia" }, { text: "Cottages in Vancouver", url: "/en/cottage-country/british-columbia" }, { text: "Cottages in Tofino", url: "/en/cottage-country/british-columbia" }] },
      { title: "Alberta", links: [{ text: "Cottages in Banff", url: "/en/cottage-country/alberta" }, { text: "Cottages in Jasper", url: "/en/cottage-country/alberta" }, { text: "Cottages in Calgary", url: "/en/cottage-country/alberta" }] },
    ],
  },
  homepage_inspiration: {
    title: "Latest Inspiration",
    description: "Expert guides, local tips, and curated stories to help plan your perfect Canadian cottage escape.",
  },
  homepage_explore: {
    title: "Finding Your Perfect Lakeside Haven",
    description: "Ontario's cottage country is globally celebrated for its immense network of pristine freshwater lakes, spectacular granite cliffs, and deeply aromatic pine forests. From cozy rustic historic structures hidden deep inside the woods to luxurious modern architectural estates on the water, this beautiful province offers the quintessential North American nature escape for families and romantic couples alike.",
    subtitle: "We verify and curate high-performing wilderness accommodations, pairing travelers with secure booking links on VRBO and Expedia, entirely free of extra fees.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Scenic Canadian lake house with dock and pine forest at sunset",
    items: [
      { icon: "Waves", title: "The Country of 250,000 Lakes", description: "Boating, paddling, and deep waterfront swimming off high wooden docks beneath gorgeous glowing horizons." },
      { icon: "Trees", title: "Boreal Forests & Parks", description: "Hike along the rugged edges of the Bruce Peninsula trail system or explore the legendary canoe loops of Algonquin Park." },
      { icon: "Compass", title: "Accessible Wilderness", description: "Peaceful, pristine lake houses located within a comfortable 2-to-4 hour scenic drive from Toronto and Ottawa." },
    ],
  },
  homepage_cta: {
    title: "Own a Beautiful Cabin?\nPartner with us seamlessly.",
    description: "Expand your booking volume by listing your Canadian property inside our premium recommended guides.",
    buttonText: "Contact Partnership Team",
    buttonLink: "/{locale}/contact",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1000",
    imageAlt: "Cozy wooden cabin interior with warm lighting in a Canadian forest setting",
  },
  homepage_cta_bar: {
    title: "Find Your Perfect Canadian Escape",
    description: "Browse handpicked lake houses, mountain lodges, and wilderness cabins across Canada.",
    buttonText: "Explore Cottages",
    buttonLink: "/{locale}/cottage-country/ontario",
  },
  ads: {
    sidebarScript: "",
  },
  homepage_categories: {
    items: [
      { id: "lakefront", labelEn: "Lakefront", labelFr: "Lac", icon: "Sailboat", link: "" },
      { id: "hot-tub", labelEn: "Hot Tub", labelFr: "Spa", icon: "Bath", link: "" },
      { id: "family", labelEn: "Family", labelFr: "Famille", icon: "Users", link: "" },
      { id: "luxury", labelEn: "Luxury", labelFr: "Luxe", icon: "Gem", link: "" },
      { id: "pet-friendly", labelEn: "Pet Friendly", labelFr: "Animaux", icon: "Dog", link: "" },
      { id: "mountain", labelEn: "Mountain", labelFr: "Montagne", icon: "Mountain", link: "" },
      { id: "romantic", labelEn: "Romantic", labelFr: "Romantique", icon: "Heart", link: "" },
      { id: "log-cabin", labelEn: "Log Cabin", labelFr: "Chalet bois", icon: "Home", link: "" },
      { id: "countryside", labelEn: "Countryside", labelFr: "Campagne", icon: "Trees", link: "" },
      { id: "secluded", labelEn: "Secluded", labelFr: "Isolé", icon: "TreePine", link: "" },
      { id: "beach", labelEn: "Beach", labelFr: "Plage", icon: "Umbrella", link: "" },
      { id: "resort", labelEn: "Resort", labelFr: "Village", icon: "Building2", link: "" },
      { id: "skiing", labelEn: "Skiing", labelFr: "Ski", icon: "MountainSnow", link: "" },
      { id: "pools", labelEn: "Pools", labelFr: "Piscines", icon: "Waves", link: "" },
      { id: "hiking", labelEn: "Hiking", labelFr: "Randonnée", icon: "Footprints", link: "" },
    ],
  },
  search: {
    hero: { title: "", subtitle: "", image: "", imageAlt: "" },
    intro: { description: "", highlights: [] },
    learnMore: { title: "", subtitle: "", description: "", faq: [], image: "", imageAlt: "" },
    cta: { title: "", description: "", buttonText: "", buttonLink: "", image: "", imageAlt: "" },
    search: { title: "", description: "", columns: [] },
  },
  search_hero: {
    title: "",
    subtitle: "",
  },
  search_categories: {
    items: [],
  },
  search_results: {
    title: "Results",
    subtitle: "All locations",
    sort: "newest",
  },
  search_cta: {
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    image: "",
    imageAlt: "",
  },
  search_inspirations: {
    title: "",
    items: [],
  },
  side_menu: {
    sections: [
      {
        title: "Navigation",
        items: [
          { label: "Explore", icon: "Compass", href: "/{locale}" },
          { label: "Guides", icon: "BookOpen", href: "/{locale}/guides" },
          { label: "Terms", icon: "Info", href: "/{locale}/terms" },
        ],
      },
      {
        title: "Destinations",
        items: [
          { label: "Ontario", icon: "MapPin", href: "/{locale}/cottage-country/ontario" },
          { label: "Quebec", icon: "MapPin", href: "/{locale}/cottage-country/quebec" },
          { label: "British Columbia", icon: "MapPin", href: "/{locale}/cottage-country/british-columbia" },
          { label: "Alberta", icon: "MapPin", href: "/{locale}/cottage-country/alberta" },
        ],
      },
    ],
  },
};
