export type HomepageHero = {
  tag: string;
  title: string;
  description: string;
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

export type HomepageCTA = {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  image: string;
};

export const defaultSettings: Record<string, any> = {
  homepage_hero: {
    tag: "Official VRBO Affiliate Search",
    title: "Find Your Perfect Canadian Escape",
    description: "Instantly query and secure verified premium lake houses and mountain lodges.",
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
  homepage_cta: {
    title: "Own a Beautiful Cabin?\nPartner with us seamlessly.",
    description: "Expand your booking volume by listing your Canadian property inside our premium recommended guides.",
    buttonText: "Contact Partnership Team",
    buttonLink: "/{locale}/contact",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1000",
  },
};
