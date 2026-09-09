export interface Cottage {
  id: string;
  name: string;
  slug: string;
  province: string;
  thumbnail: string | null;
  price_cad: number | null;
  rating: number | null;
  reviews: number | null;
  amenities: string[];
  affiliate_url: string | null;
  google_link: string | null;
  is_featured: boolean;
  available: boolean;
  type: string;
  category: string;
  source: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  featuredImage: string;
  isPublished: boolean;
  author?: string;
  date?: string;
  locale?: string;
  translationOf?: number | null;
  content?: string;
  seoTitle?: string;
  seoKeywords?: string;
  faq?: { question: string; answer: string }[];
  ctaTitle?: string;
  ctaButton?: string;
  ctaLink?: string;
  type?: string;
  imageAlt?: string;
  authorId?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  locale: string;
  template: string;
  isPublished: boolean;
  translationOf?: number | null;
  content?: string;
  seoTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  faq?: { question: string; answer: string }[];
  ctaTitle?: string;
  ctaButton?: string;
  ctaLink?: string;
  ctaDescription?: string;
  exploreTitle?: string;
  exploreSubtitle?: string;
  exploreDescription?: string;
  exploreItems?: ExploreItem[];
  locationData?: LocationData;
  publishedAt?: string | null;
}

export interface ExploreItem {
  icon: string;
  title: string;
  description: string;
}

export interface LocationData {
  hero: {
    tag: string;
    title: string;
    subtitle: string;
    image: string;
    imageAlt: string;
  };
  intro: {
    description: string;
    highlightsTitle: string;
    subtitle: string;
    highlights: ExploreItem[];
  };
  featured: {
    title: string;
    description: string;
  };
  explore: {
    items: ExploreItem[];
  };
  search: {
    title: string;
    description: string;
  };
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  featuredImage: string;
  imageAlt?: string;
  author?: string;
  date: string;
  readTime: string;
  isPublished: boolean;
  locale?: string;
  translationOf?: number | null;
  seoTitle?: string;
  seoKeywords?: string;
  faq?: { question: string; answer: string }[];
  ctaTitle?: string;
  ctaButton?: string;
  ctaLink?: string;
  type?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  listicleItems?: ListicleItem[];
}

export interface ListicleItem {
  id?: number;
  articleId?: number;
  rank?: number;
  title: string;
  description?: string;
  rating?: string;
  price?: string;
  image?: string;
  vibe?: string;
  vrboLink?: string;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  link: string;
  labelEn?: string;
  labelFr?: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  province: string;
  description: string;
  image: string;
  imageAlt?: string;
  link: string;
  cottageCount?: number;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface LibraryItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
  createdAt: string;
}

export interface AdSettings {
  sidebarScript?: string;
  headerScript?: string;
  footerScript?: string;
  sidebarEnabled?: boolean;
  headerEnabled?: boolean;
  footerEnabled?: boolean;
}

export interface SidebarSection {
  title: string;
  icon?: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  label: string;
  href: string;
  icon?: string;
}

export type CmsValue = string | number | boolean | null | Record<string, unknown> | unknown[];
export type CmsObject = Record<string, CmsValue>;
export type CmsArray = CmsValue[];