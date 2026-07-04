'use client';

import { Star, Heart, MapPin, ArrowUpRight } from 'lucide-react';
import { useTranslations } from '@/lib/useTranslations';

export type Chalet = {
  id: string;
  name: string;
  location: string;
  province: string;
  price: number;
  rating: number;
  badge: string;
  image: string;
  description: string;
  vrboUrl: string;
  beds: number;
  baths: number;
  guests: number;
};

type PropertyCardProps = {
  chalet: Chalet;
  isFavorite?: boolean;
  onToggleFavorite?: (chalet: Chalet) => void;
};

export default function PropertyCard({ chalet, isFavorite, onToggleFavorite }: PropertyCardProps) {
  const { t } = useTranslations();
  const badgeLabel = (t.badges as Record<string, string>)[chalet.badge] || chalet.badge;

  return (
    <a
      href={chalet.vrboUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl overflow-hidden bg-white border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={chalet.image}
          alt={chalet.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur text-[#191e3b] text-[10px] font-semibold">
          {badgeLabel}
        </div>
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
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h3 className="font-semibold text-[#191e3b] text-xs sm:text-sm leading-tight truncate" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
            {chalet.name}
          </h3>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-[#191e3b]">{chalet.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-slate-400 mb-2">
          <MapPin className="w-3 h-3" />
          <span className="text-[10px] truncate">{chalet.location}</span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <div>
            <span className="text-sm font-bold text-[#191e3b]">${chalet.price}</span>
            <span className="text-[10px] text-slate-400">{t.properties.perNight}</span>
          </div>
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0f51ec] text-white group-hover:bg-[#0d44c9] transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </a>
  );
}
