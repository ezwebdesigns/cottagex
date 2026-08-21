'use client';

import { useState, useEffect, useCallback } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import SourceBadge from '@/components/SourceBadge';
import StarRating from '@/components/StarRating';
import { useProductSchemas } from '@/hooks/useProductSchemas';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

type GalleryTab = { name: string; category: string; shortcode?: string };

type PropertyGalleryProps = {
  title?: string;
  description?: string;
  tabs?: GalleryTab[];
};

const shortcodeRegex = /\[([a-z0-9-]+),\s*([a-z0-9-]+)(?:,\s*([a-z0-9-]+))?(?:,\s*(\d+))?\]/;

function parseShortcode(shortcode: string) {
  const match = shortcode.match(shortcodeRegex);
  if (!match) return { slug: 'canada', category: 'all', limit: 6, featured: false };

  const parts = [match[2], match[3]].filter(Boolean);
  const featured = parts.includes('featured');
  const nonFeatured = parts.filter(p => p !== 'featured');

  return {
    slug: match[1].trim(),
    category: nonFeatured[0] || 'all',
    limit: match[4] ? parseInt(match[4]) : (match[3] && !match[4] && /^\d+$/.test(match[3]) ? parseInt(match[3]) : 6),
    featured,
  };
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm animate-pulse">
      <div className="h-36 md:h-56 bg-slate-200" />
      <div className="p-3 md:p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="flex justify-between pt-3 border-t border-slate-100">
          <div className="h-5 bg-slate-200 rounded w-1/4" />
          <div className="h-8 bg-slate-200 rounded-full w-1/3" />
        </div>
      </div>
    </div>
  );
}

function CottageCard({ cottage }: { cottage: any }) {
  const t = useTranslations();
  const photo = Array.isArray(cottage.photos) && cottage.photos[0] ? cottage.photos[0] : '';
  const badge = cottage.source || (Array.isArray(cottage.amenities) && cottage.amenities[0]) || 'Featured';
  const location = cottage.province ? `${cottage.slug}, ${cottage.province}` : cottage.slug;
  const desc = Array.isArray(cottage.amenities) ? cottage.amenities.slice(0, 2).join(' • ') : '';
  const bookingUrl = cottage.affiliate_url || cottage.google_link || 'https://www.vrbo.com';

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group flex flex-col justify-between">
      <div className="relative h-36 md:h-56 overflow-hidden bg-slate-100">
        {photo && <Image src={photo} alt={cottage.image_alt || cottage.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" />}
        <div className="absolute top-2 md:top-4 left-2 md:left-4"><SourceBadge source={badge} /></div>
      </div>

      <div className="p-3 md:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-1 md:mb-2 gap-0.5 md:gap-2">
            <h3 className="font-bold text-[#0B1B40] text-sm md:text-lg leading-tight line-clamp-1">{cottage.name}</h3>
            {cottage.rating && (
              <div className="flex items-center gap-1">
                <StarRating rating={cottage.rating} size={12} />
                <span className="text-[11px] md:text-sm font-bold text-[#0B1B40]">{cottage.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center text-slate-500 text-xs md:text-sm mb-2 md:mb-4">
            <MapPin size={12} className="mr-1 text-[#1F51C6]" />
            <span className="line-clamp-1 capitalize">{location}</span>
          </div>
          {desc && <p className="hidden md:block text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">{desc}</p>}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between pt-2 md:pt-3 border-t border-slate-100 gap-2">
          <div>
            {cottage.price_cad > 0 ? (
              <>
                <span className="text-sm md:text-xl font-bold text-[#1F51C6]">${cottage.price_cad}</span>
                <span className="text-[10px] md:text-sm text-slate-500">/night</span>
              </>
            ) : (
              <span className="text-xs md:text-sm font-bold text-[#1F51C6]">{t('properties.checkPricing')}</span>
            )}
          </div>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[11px] md:text-sm font-semibold transition-colors inline-flex items-center justify-center gap-1 w-full md:w-auto"
          >
            Check Availability <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PropertyGallery({ title = "Browse Recommended Cottages", description = "Handpicked cabins tailored to your favorite wilderness scenery.", tabs }: PropertyGalleryProps) {
  const galleryTabs: GalleryTab[] = tabs ?? [
    { name: 'Cottage rentals in Canada', category: 'Chalets au Canada', shortcode: '[canada, all, 6]' },
    { name: 'Luxury Cottages', category: 'Chalets de luxe', shortcode: '[canada, luxury, 6]' },
    { name: 'Pet Friendly Cottages', category: 'Chalets acceptant les animaux', shortcode: '[canada, pet-friendly, 6]' },
    { name: 'Family Cottage Resorts', category: 'Chalets familiaux', shortcode: '[canada, family, 6]' },
    { name: 'Lakefront Cottages', category: 'Chalets en bord de lac', shortcode: '[canada, lakefront, 6]' },
    { name: 'Cottages with hot tub', category: 'Chalets avec spa', shortcode: '[canada, hot-tub, 6]' },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [cottages, setCottages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCottages = useCallback(async (tab: GalleryTab) => {
    setLoading(true);
    const sc = tab.shortcode || '[canada, all, 6]';
    const { slug, category, limit, featured } = parseShortcode(sc);
    const params = new URLSearchParams({
      ...(slug && slug !== 'canada' ? { slug } : {}),
      limit: String(limit),
      sort: 'rating',
      affiliateOnly: 'true',
      ...(category && category !== 'all' ? { category } : {}),
      ...(featured ? { featured: 'true' } : {}),
    });
    try {
      const res = await fetch(`/api/cottages?${params}`);
      const data = await res.json();
      setCottages(data.cottages || []);
    } catch {
      setCottages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCottages(galleryTabs[activeIndex]);
  }, [activeIndex, galleryTabs, fetchCottages]);

  useProductSchemas(cottages);

  return (
    <section className="px-4 md:px-8 py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1B40]">{title}</h2>
            <p className="text-gray-500 mt-2">{description}</p>
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 [&::-webkit-scrollbar]:hidden">
          {galleryTabs.map((tab, i) => (
            <button
              key={tab.category}
              onClick={() => setActiveIndex(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeIndex === i
                  ? 'bg-[#1F51C6] text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
            : cottages.map((c) => <CottageCard key={c.id} cottage={c} />)}
        </div>
      </div>
    </section>
  );
}
