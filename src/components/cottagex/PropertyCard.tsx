'use client';

import Image from 'next/image';
import { Star, Heart, MapPin, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import vrboLogo from '@/../public/images/vrbo3.png';
import expediaLogo from '@/../public/images/expedia3.png';

export type Chalet = {
  id: string;
  name: string;
  location: string;
  province: string;
  price: number;
  rating: number;
  reviews?: number;
  badge: string;
  image: string;
  description: string;
  vrboUrl: string;
  beds: number;
  baths: number;
  guests: number;
  source?: string;
};

type PropertyCardProps = {
  chalet: Chalet;
  isFavorite?: boolean;
  onToggleFavorite?: (chalet: Chalet) => void;
  categoryBadge?: string;
};

export default function PropertyCard({ chalet, isFavorite, onToggleFavorite, categoryBadge }: PropertyCardProps) {
  const t = useTranslations();
  const badgeLabel = categoryBadge || (t.raw('badges') as Record<string, string>)[chalet.badge] || chalet.badge;
  const sourceLower = (chalet.source || '').toLowerCase();
  const isVrbo = sourceLower.includes('vrbo');
  const isExpedia = sourceLower.includes('expedia');
  const starCount = Math.min(5, Math.max(0, Math.round(chalet.rating || 0)));

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: chalet.name,
    image: chalet.image,
    address: {
      '@type': 'PostalAddress',
      addressLocality: chalet.location,
      addressCountry: 'CA',
    },
  };
  if (chalet.description) schema.description = chalet.description;
  if (chalet.vrboUrl && chalet.vrboUrl !== '#') schema.url = chalet.vrboUrl;
  if (chalet.province) schema.address.addressRegion = chalet.province;
  if (chalet.beds > 0) schema.numberOfRooms = chalet.beds;
  if (chalet.price > 0) schema.priceRange = `$${chalet.price} per night`;
  if (chalet.rating > 0 && chalet.reviews && chalet.reviews > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: chalet.rating,
      reviewCount: chalet.reviews,
    };
  }

  return (
    <a
      href={chalet.vrboUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden bg-white border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={chalet.image}
          alt={chalet.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur text-[#191e3b] text-[10px] font-semibold">
          {badgeLabel}
        </div>
        {isVrbo && (
          <Image
            src={vrboLogo}
            alt="VRBO"
            width={48}
            height={32}
            className="absolute bottom-2 left-2 h-3.5 sm:h-4 w-auto drop-shadow-sm"
            loading="lazy"
          />
        )}
        {isExpedia && (
          <Image
            src={expediaLogo}
            alt="Expedia"
            width={48}
            height={32}
            className="absolute bottom-2 left-2 h-3.5 sm:h-4 w-auto drop-shadow-sm"
            loading="lazy"
          />
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(chalet); }}
            className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 transition-colors ${isFavorite ? 'text-[#0f51ec] fill-[#0f51ec]' : 'text-[#191e3b]'}`} />
          </button>
        )}
      </div>

      <div className="p-2.5 sm:p-3">
        <h3 className="font-semibold text-[#191e3b] text-xs sm:text-sm leading-tight truncate mb-0.5" style={{ fontFamily: 'var(--font-radio-canada), sans-serif' }}>
          {chalet.name}
        </h3>
        <div className="flex items-center gap-0.5 text-slate-400 mb-1.5">
          <MapPin className="w-3 h-3" />
          <span className="text-[10px] truncate">{chalet.location}</span>
        </div>
        <div className="flex items-center mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < starCount ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
          ))}
          {chalet.reviews && chalet.reviews > 0 && (
            <span className="text-[10px] text-slate-400 ml-1">({t('properties.reviews', { count: chalet.reviews })})</span>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <div className="min-w-0">
            {chalet.price > 0 && (
              <>
                <span className="text-sm font-bold text-[#191e3b]">${chalet.price}</span>
                <span className="text-[10px] text-slate-400">{t('properties.perNight')}</span>
              </>
            )}
          </div>
          {chalet.price > 0 ? (
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0f51ec] text-white group-hover:bg-[#0d44c9] transition-colors">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          ) : (
            <span className="ml-auto px-3 py-1.5 rounded-full bg-[#0f51ec] text-white text-[11px] font-semibold group-hover:bg-[#0d44c9] transition-colors">
              {t('properties.checkPricing')}
            </span>
          )}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </a>
  );
}
