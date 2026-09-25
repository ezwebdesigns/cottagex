'use client'

import { useProductSchemas } from '@/hooks/useProductSchemas'
import ListicleCard from '@/components/ListicleCard'

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
}

export function CottageShortcode({ cottages }: CottageShortcodeProps) {
  useProductSchemas(cottages)

  if (!cottages || cottages.length === 0) return null

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
