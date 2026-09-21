'use client';

import { useEffect, useRef } from 'react';
import type * as Leaflet from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  price?: number | null;
  image?: string;
};

function priceLabel(price?: number | null): string {
  if (price == null || price <= 0) return '';
  return `$${Math.round(price)}`;
}

/**
 * Interactive listings map (Leaflet + OpenStreetMap tiles, no API key).
 * Rendered via next/dynamic(ssr:false) by callers — never in the SSR bundle.
 */
export default function ListingsMap({ points }: { points: MapPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const valid = points.filter(
    (p): p is MapPoint & { lat: number; lng: number } =>
      typeof p.lat === 'number' && typeof p.lng === 'number' && isFinite(p.lat) && isFinite(p.lng),
  );

  useEffect(() => {
    if (!ref.current || valid.length === 0) return;
    let map: Leaflet.Map | null = null;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false }).setView([valid[0].lat, valid[0].lng], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      const bounds = L.latLngBounds([]);
      for (const p of valid) {
        const label = priceLabel(p.price);
        const icon = L.divIcon({
          className: 'cx-map-pin',
          html: `<span style="display:inline-flex;align-items:center;gap:2px;background:#0f51ec;color:#fff;font-weight:700;font-size:12px;padding:4px 8px;border-radius:999px;box-shadow:0 2px 8px rgba(15,81,236,.4);white-space:nowrap;">${label || '•'}</span>`,
        });
        const safeName = p.name.replace(/</g, '&lt;');
        L.marker([p.lat, p.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<strong style="font-size:13px">${safeName}</strong>` +
              (p.price ? `<br/><span>${label} / night</span>` : ''),
          );
        bounds.extend([p.lat, p.lng]);
      }
      if (valid.length > 1) map.fitBounds(bounds.pad(0.2));
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [valid.map((p) => p.id).join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  if (valid.length === 0) return null;

  return (
    <div className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
      <div ref={ref} className="h-72 sm:h-96 w-full z-0" />
    </div>
  );
}
