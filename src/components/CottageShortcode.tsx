'use client'

import { useState, useEffect } from 'react'
import CottageCard from '@/components/CottageCard'

const SORT_PARAMS = ['price', 'rating']
const FEATURED_PARAM = 'featured'

const FILTER_MAP: Record<string, string> = {
  'hot-tub':   'hotTub',
  'hottub':    'hotTub',
  'spa':       'hotTub',
  'family':    'family',
  'kids':      'family',
  'lakefront': 'lakefront',
  'waterfront':'lakefront',
  'lake':      'lakefront',
  'luxury':    'luxury',
  'luxe':      'luxury',
}

const PROVINCES = [
  'ontario', 'quebec', 'british-columbia', 'bc',
  'nova-scotia', 'alberta', 'new-brunswick',
  'pei', 'saskatchewan', 'manitoba',
]

interface CottageShortcodeProps {
  param1: string
  param2: string
  limit:  number
}

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

export function CottageShortcode({ param1, param2, limit }: CottageShortcodeProps) {
  const [cottages, setCottages] = useState<Cottage[]>([])
  const [loading,  setLoading]  = useState(true)

  const isSort     = SORT_PARAMS.includes(param2)
  const isFeatured = param2 === FEATURED_PARAM
  const isProvince = PROVINCES.includes(param1)
  const sort       = isSort ? param2 : 'rating'
  const category   = !isSort && !isFeatured ? (FILTER_MAP[param2] || '') : ''

  useEffect(() => {
    const params = new URLSearchParams({
      [isProvince ? 'province' : 'slug']: param1,
      limit:    String(limit),
      sort,
      ...(category   ? { category }        : {}),
      ...(isFeatured ? { featured: 'true' } : {}),
    })

    console.log('shortcode params:', params.toString())
    fetch(`/api/cottages?${params}`)
      .then(res => res.json())
      .then(data => setCottages(data?.cottages || []))
      .catch(() => setCottages([]))
      .finally(() => setLoading(false))
  }, [param1, param2, limit, isProvince, sort, category, isFeatured])

  if (loading) {
    return (
      <div className="my-6 space-y-3">
        {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
          <div key={i} className="flex gap-0 h-32 rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
            <div className="w-48 bg-gray-200 flex-shrink-0" />
            <div className="flex-1 p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (cottages.length === 0) return null

  return (
    <div className="my-6 space-y-4">
      {cottages.map((cottage, i) => (
        <CottageCard
          key={cottage.id}
          cottage={cottage}
          priority={i === 0}
        />
      ))}
    </div>
  )
}
