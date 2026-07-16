'use client';

import { ExternalLink, MapPin } from 'lucide-react';
import StarRating from '@/components/StarRating';

export default function ListicleCard({ cottage, rank = 1, priority = false }) {
  const {
    name,
    thumbnail,
    price_cad,
    rating,
    amenities = [],
    affiliate_url,
    google_link,
    source,
  } = cottage;

  const bookingUrl = affiliate_url || google_link || '#';
  const vibe = amenities.length > 0 ? amenities[0] : null;
  const sourceLabel = source?.replace('.com', '') || 'Partner';

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
      <div className="relative min-h-[150px] bg-slate-100">
        {thumbnail ? (
          <img src={thumbnail} alt={name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-2xl">🏡</div>
        )}
        <div className="absolute top-3 left-3 w-8 h-8 bg-[#0B1B40] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
          #{rank}
        </div>
      </div>
      <div className="p-5 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
            {vibe && (
              <span className="bg-blue-50 text-[#1F51C6] text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full">
                {vibe}
              </span>
            )}
            {rating && (
              <div className="flex items-center gap-1">
                <StarRating rating={parseFloat(rating)} size={12} />
                <span className="text-xs font-bold text-[#0B1B40]">{parseFloat(rating).toFixed(1)}</span>
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold text-[#0B1B40] mb-1 leading-tight">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <MapPin size={10} className="text-[#1F51C6]" />
            <span className="capitalize">{cottage.province || cottage.slug || ''}</span>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">ESTIMATED RATE</p>
            {price_cad ? (
              <>
                <span className="text-xl font-black text-[#1F51C6]">${parseInt(price_cad)}</span>
                <span className="text-[10px] text-slate-500 font-medium"> / night</span>
              </>
            ) : (
              <span className="text-xs text-slate-400">Check price</span>
            )}
          </div>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="bg-[#0B1B40] hover:bg-[#1F51C6] text-white px-4 py-2 rounded-full font-bold transition-all flex items-center gap-1.5 text-xs shadow-md"
          >
            Check Availability <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
