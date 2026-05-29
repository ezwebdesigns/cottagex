/**
 * components/CottageGrid.jsx
 * Grille de cottages avec filtres interactifs
 * Client Component — filtres côté client, données chargées côté serveur
 *
 * Usage sur une page destination (3 cottages) :
 *   <CottageGrid cottages={cottages} limit={3} />
 *
 * Usage dans un listicle (7 cottages) :
 *   <CottageGrid cottages={cottages} limit={7} showFilters />
 *
 * Usage comme shortcode dans MDX/contenu :
 *   <CottageGrid slug="muskoka" limit={7} showFilters />
 */

'use client'

import { useState, useMemo } from 'react'
import CottageCard from './CottageCard'

// Filtres catégories — basés sur amenities
const CATEGORY_FILTERS = [
  {
    key:    'family',
    label:  'Family',
    icon:   '👨‍👩‍👧',
    match:  (c) => c.amenities?.includes('Kid-friendly'),
  },
  {
    key:    'hotTub',
    label:  'Hot Tub / Spa',
    icon:   '🛁',
    match:  (c) => c.amenities?.includes('Hot tub') || c.amenities?.includes('Spa'),
  },
  {
    key:    'lakefront',
    label:  'Lakefront',
    icon:   '🌊',
    match:  (c) => c.amenities?.includes('Waterfront') || c.amenities?.includes('Beach access'),
  },
  {
    key:    'luxury',
    label:  'Luxury',
    icon:   '✨',
    match:  (c) => c.rating >= 4.5 && c.price_cad >= 500,
  },
]

// Tri
const SORT_OPTIONS = [
  { key: 'rating', label: 'Top rated' },
  { key: 'price',  label: 'Lowest price' },
]

export default function CottageGrid({
  cottages    = [],
  limit       = 3,
  showFilters = false,
  title       = null,
  searchUrl   = null, // URL "See all" vers VRBO/Expedia
}) {
  const [activeCategory, setActiveCategory] = useState(null)
  const [sort, setSort]                     = useState('rating')

  const filtered = useMemo(() => {
    let results = [...cottages]

    // Filtre catégorie
    if (activeCategory) {
      const filter = CATEGORY_FILTERS.find(f => f.key === activeCategory)
      if (filter) results = results.filter(filter.match)
    }

    // Tri
    if (sort === 'price') {
      results.sort((a, b) => (a.price_cad || 9999) - (b.price_cad || 9999))
    } else {
      results.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }

    return results.slice(0, limit)
  }, [cottages, activeCategory, sort, limit])

  return (
    <section className="w-full">

      {/* Titre optionnel */}
      {title && (
        <h2 className="text-lg font-medium text-gray-900 mb-4">{title}</h2>
      )}

      {/* Filtres — affichés seulement si showFilters = true */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-5">

          {/* Catégories */}
          <div className="flex flex-wrap gap-2 flex-1">
            {CATEGORY_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveCategory(activeCategory === f.key ? null : f.key)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full
                            border transition-colors
                            ${activeCategory === f.key
                              ? 'bg-gray-900 text-white border-gray-900'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Tri */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5
                       bg-white text-gray-600 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Grille */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filtered.map((cottage, i) => (
            <CottageCard
              key={cottage.id}
              cottage={cottage}
              priority={i < 2}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm mb-3">No cottages match this filter.</p>
          <button
            onClick={() => setActiveCategory(null)}
            className="text-sm text-blue-600 underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* CTA "See all" */}
      {searchUrl && (
        <div className="mt-6 text-center">
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white
                       text-sm font-medium px-6 py-3 rounded-xl transition-colors"
          >
            See all available cottages →
          </a>
        </div>
      )}
    </section>
  )
}
