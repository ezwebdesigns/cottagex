'use client';

import { useState, useEffect } from 'react';
import { MapPin, Star, ExternalLink } from 'lucide-react';
import SourceBadge from '@/components/SourceBadge';

type Props = {
  shortcode: string;
  fallbackTitle?: string;
  fallbackDesc?: string;
};

const shortcodeRegex = /\[([a-z0-9-]+),\s*([a-z0-9-]+)(?:,\s*(\d+))?\]/;
const SORT_PARAMS = ['price', 'rating'];
const FEATURED_PARAM = 'featured';
const PROVINCES = ['ontario', 'quebec', 'british-columbia', 'bc', 'nova-scotia', 'alberta', 'new-brunswick', 'pei', 'saskatchewan', 'manitoba'];
const FILTER_MAP: Record<string, string> = {
  'hot-tub': 'hotTub', 'hottub': 'hotTub', 'spa': 'hotTub',
  'family': 'family', 'kids': 'family',
  'lakefront': 'lakefront', 'waterfront': 'lakefront', 'lake': 'lakefront',
  'luxury': 'luxury', 'luxe': 'luxury',
};

function CardSkeleton() {
  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm animate-pulse">
      <div className="h-36 md:h-64 bg-slate-200" />
      <div className="p-3 md:p-5 space-y-3">
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
        <div className="flex justify-between pt-3 border-t border-slate-100">
          <div className="h-5 bg-slate-200 rounded w-1/4" />
          <div className="h-8 bg-slate-200 rounded-full w-1/3" />
        </div>
      </div>
    </div>
  );
}

function CottageCard({ cottage }: { cottage: any }) {
  const photo = Array.isArray(cottage.photos) && cottage.photos[0] ? cottage.photos[0] : cottage.thumbnail || '';
  const badge = cottage.source || (Array.isArray(cottage.amenities) && cottage.amenities[0]) || 'Featured';
  const location = cottage.province ? `${cottage.slug}, ${cottage.province}` : cottage.slug;
  const desc = Array.isArray(cottage.amenities) ? cottage.amenities.slice(0, 2).join(' • ') : '';
  const bookingUrl = cottage.affiliate_url || cottage.google_link || 'https://www.vrbo.com';

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow group flex flex-col justify-between">
      <div className="relative h-36 md:h-64 overflow-hidden bg-slate-100">
        {photo && <img src={photo} alt={cottage.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
        <div className="absolute top-2 md:top-4 left-2 md:left-4"><SourceBadge source={badge} /></div>
      </div>
      <div className="p-3 md:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1 md:mb-3 gap-1">
            <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider line-clamp-1 capitalize">{location}</span>
            {cottage.rating && (
              <div className="flex items-center gap-0.5 text-[10px] md:text-xs font-bold bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded-lg w-fit">
                <Star size={11} className="fill-yellow-500 text-yellow-500" />
                <span>{cottage.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <h3 className="text-sm md:text-xl font-bold text-[#0B1B40] mb-2 leading-tight">{cottage.name}</h3>
          {desc && <p className="hidden md:block text-slate-600 text-sm mb-6 leading-relaxed">{desc}</p>}
        </div>
        <div className="pt-2 md:pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            {cottage.price_cad && (
              <>
                <span className="text-sm md:text-2xl font-black text-[#1F51C6]">${cottage.price_cad}</span>
                <span className="text-[10px] md:text-xs text-slate-500 font-medium">/night</span>
              </>
            )}
          </div>
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-3 md:px-5 py-1.5 md:py-2.5 rounded-full text-[11px] md:text-sm font-semibold transition-colors inline-flex items-center justify-center gap-1.5 w-full md:w-auto">
            Book <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedCottages({ shortcode, fallbackTitle, fallbackDesc }: Props) {
  const [cottages, setCottages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const match = shortcode.match(shortcodeRegex);
  const param1 = match?.[1] || 'ontario';
  const param2 = match?.[2] || 'rating';
  const limit = match?.[3] ? parseInt(match[3]) : 6;

  const isSort = SORT_PARAMS.includes(param2);
  const isFeatured = param2 === FEATURED_PARAM;
  const isProvince = PROVINCES.includes(param1);
  const sort = isSort ? param2 : 'rating';
  const category = !isSort && !isFeatured ? (FILTER_MAP[param2] || param2) : '';

  useEffect(() => {
    const params = new URLSearchParams({
      [isProvince ? 'province' : 'slug']: param1,
      limit: String(limit),
      sort,
      ...(category ? { category } : {}),
      ...(isFeatured ? { featured: 'true' } : {}),
    });
    fetch(`/api/cottages?${params}`)
      .then(r => r.json())
      .then(d => setCottages(d?.cottages || []))
      .catch(() => setCottages([]))
      .finally(() => setLoading(false));
  }, [param1, param2, limit, isProvince, sort, category, isFeatured]);

  return (
    <div className="mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-[#0B1B40] mb-2">{fallbackTitle || `Featured Cottages`}</h2>
      {fallbackDesc && <p className="text-slate-500 mb-8">{fallbackDesc}</p>}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
        {loading
          ? Array.from({ length: Math.min(limit, 6) }).map((_, i) => <CardSkeleton key={i} />)
          : cottages.map(c => <CottageCard key={c.id} cottage={c} />)}
      </div>
    </div>
  );
}
