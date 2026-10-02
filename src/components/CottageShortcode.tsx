'use client'

import { useMemo } from 'react'
import { useProductSchemas } from '@/hooks/useProductSchemas'
import ListicleCard from '@/components/ListicleCard'
import PropertyCard from '@/components/cottagex/PropertyCard'

interface Cottage {
  id:            string
  slug:          string
  name:          string
  source:        string
  thumbnail:     string | null
  price_cad:     number | null
  rating:        number | null
  reviews:       number | null
  sleeps:        number | null
  bedrooms:      number | null
  bathrooms:     number | null
  amenities:     string[]
  affiliate_url: string | null
  google_link:   string | null
  is_featured:   boolean
  available:     boolean
}

interface CottageShortcodeProps {
  cottages: Cottage[]
  layout?: 'list' | 'cards'
}

export function CottageShortcode({ cottages, layout = 'list' }: CottageShortcodeProps) {
  useProductSchemas(cottages)

  const chaletCards = useMemo(() => {
    return (cottages || []).map((c: any) => ({
      id: String(c.id),
      name: c.name,
      location: c.province || '',
      province: c.province || '',
      price: c.price_cad || 0,
      rating: c.rating || 0,
      reviews: c.reviews || 0,
      badge: c.type || 'Featured',
      image: c.thumbnail || (Array.isArray(c.photos) && c.photos[0]) || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80',
      description: Array.isArray(c.amenities) ? c.amenities.slice(0, 3).join(' • ') : '',
      vrboUrl: c.affiliate_url || c.google_link || '#',
      source: c.source,
      beds: c.bedrooms || 0,
      baths: c.bathrooms || 0,
      guests: c.sleeps || 0,
      lat: c.lat ?? null,
      lng: c.lng ?? null,
    }));
  }, [cottages]);

  if (!cottages || cottages.length === 0) return null

  if (layout === 'cards') {
    return (
      <div className="my-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {chaletCards.map((chalet) => (
          <PropertyCard key={chalet.id} chalet={chalet} compact withSchema={false} />
        ))}
      </div>
    )
  }

  return (
    <div className="my-6 space-y-4">
      {cottages.map((cottage, i) => (
        <ListicleCard
          key={cottage.id}
          cottage={cottage}
          rank={i + 1}
          priority={i === 0}
        />
      ))}
    </div>
  )
}
