'use client';

import dynamic from 'next/dynamic';
import type { MapPoint } from './ListingsMap';

const ListingsMap = dynamic(() => import('./ListingsMap'), {
  ssr: false,
  loading: () => <div className="h-72 sm:h-96 rounded-[2rem] bg-slate-100 animate-pulse" />,
});

type MapChalet = {
  id: string | number;
  name: string;
  lat?: number | null;
  lng?: number | null;
  price?: number | null;
};

/**
 * Map section under a listings grid. Renders nothing when no
 * geocoded points exist. Leaflet loads on demand (separate chunk).
 */
export default function MapSection({ chalets, locale }: { chalets: MapChalet[]; locale: string }) {
  const points: MapPoint[] = (chalets || [])
    .filter(
      (c): c is MapChalet & { lat: number; lng: number } =>
        typeof c.lat === 'number' && typeof c.lng === 'number' && isFinite(c.lat) && isFinite(c.lng),
    )
    .map((c) => ({ id: String(c.id), name: c.name, lat: c.lat, lng: c.lng, price: c.price ?? null }));

  if (points.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg sm:text-xl font-bold text-[#191e3b] mb-3">
        {locale === 'fr' ? 'Explorer sur la carte' : 'Explore on the map'}
      </h3>
      <ListingsMap points={points} />
    </div>
  );
}
