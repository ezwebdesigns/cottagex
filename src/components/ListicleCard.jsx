'use client';

import { Star, ExternalLink } from 'lucide-react';

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
    <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row">
      <div className="lg:w-2/5 relative h-72 lg:h-auto min-h-[300px] bg-slate-100">
        {thumbnail ? (
          <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-4xl">🏡</div>
        )}
        <div className="absolute top-6 left-6 w-12 h-12 bg-[#0B1B40] text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
          #{rank}
        </div>
      </div>
      <div className="lg:w-3/5 p-8 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            {vibe && (
              <span className="bg-blue-50 text-[#1F51C6] text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                {vibe}
              </span>
            )}
            {rating && (
              <div className="flex items-center gap-1 text-sm font-bold bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg">
                <Star size={14} className="fill-yellow-500 text-yellow-500" />
                <span>{parseFloat(rating).toFixed(1)} / 5</span>
              </div>
            )}
          </div>
          <h3 className="text-2xl font-bold text-[#0B1B40] mb-4">
            {name}
          </h3>
        </div>
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">ESTIMATED RATE</p>
            {price_cad ? (
              <>
                <span className="text-2xl font-black text-[#1F51C6]">${parseInt(price_cad)}</span>
                <span className="text-xs text-slate-500 font-medium"> / night</span>
              </>
            ) : (
              <span className="text-sm text-slate-400">Check price</span>
            )}
          </div>
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="bg-[#0B1B40] hover:bg-[#1F51C6] text-white px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 text-sm shadow-md"
          >
            Book on {sourceLabel} <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
