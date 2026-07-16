'use client'

import { useState, useEffect } from 'react'
import ListicleCard from '@/components/ListicleCard'
import { useProductSchemas } from '@/hooks/useProductSchemas'

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
  param3?: string
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

export function CottageShortcode({ param1, param2, param3, limit }: CottageShortcodeProps) {
  const [cottages, setCottages] = useState<Cottage[]>([])
  const [loading,  setLoading]  = useState(true)

  const isSort     = SORT_PARAMS.includes(param2)
  const isFeatured = param2 === FEATURED_PARAM
  const isProvince = PROVINCES.includes(param1)
  const sort       = isSort ? param2 : 'rating'
  const category   = !isSort && !isFeatured ? (FILTER_MAP[param2] || param2) : ''
  const featuredCategory = isFeatured && param3 ? (FILTER_MAP[param3] || param3) : ''

  useEffect(() => {
    const params = new URLSearchParams({
      [isProvince ? 'province' : 'slug']: param1,
      limit:    String(limit),
      sort,
      ...(category || featuredCategory ? { category: category || featuredCategory } : {}),
      ...(isFeatured ? { featured: 'true' } : {}),
    })

    console.log('shortcode params:', params.toString())
    fetch(`/api/cottages?${params}`)
      .then(res => res.json())
      .then(data => setCottages(data?.cottages || []))
      .catch(() => setCottages([]))
      .finally(() => setLoading(false))
  }, [param1, param2, limit, isProvince, sort, category, isFeatured])

  useProductSchemas(cottages)

  if (loading) {
    return (
      <div className="my-6 space-y-8">
        {Array.from({ length: Math.min(limit, 3) }).map((_, i) => (
          <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-md flex flex-col lg:flex-row animate-pulse">
            <div className="lg:w-2/5 h-[200px] bg-slate-200" />
            <div className="lg:w-3/5 p-5 space-y-3">
              <div className="flex gap-2">
                <div className="h-4 w-20 bg-slate-200 rounded-full" />
                <div className="h-4 w-12 bg-slate-200 rounded-lg ml-auto" />
              </div>
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="pt-3 border-t border-slate-100 flex justify-between">
                <div className="space-y-1">
                  <div className="h-2.5 w-16 bg-slate-200 rounded" />
                  <div className="h-5 w-20 bg-slate-200 rounded" />
                </div>
                <div className="h-8 w-32 bg-slate-200 rounded-full" />
              </div>
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
