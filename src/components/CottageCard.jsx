/**
 * components/CottageCard.jsx
 * Card horizontale style Google Hotels — réutilisable partout
 *
 * Props:
 *   cottage {object} — données depuis getCottages()
 *   priority {boolean} — LCP image priority (true pour les 2 premiers)
 */

import Image from 'next/image'

// Icônes amenités
const AMENITY_ICONS = {
  'Hot tub':      '🛁',
  'Spa':          '💆',
  'Waterfront':   '🌊',
  'Beach access': '🏖️',
  'Kid-friendly': '👨‍👩‍👧',
  'Pet-friendly': '🐾',
  'Fireplace':    '🔥',
  'Ski access':   '⛷️',
  'Pool':         '🏊',
  'Wi-Fi':        '📶',
}

// Badge source
const SOURCE_COLORS = {
  'Vrbo.com':    { bg: 'bg-blue-50',   text: 'text-blue-700',   label: 'VRBO' },
  'Expedia.com': { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Expedia' },
  'Hotels.com':  { bg: 'bg-red-50',    text: 'text-red-700',    label: 'Hotels.com' },
}

export default function CottageCard({ cottage, priority = false }) {
  const {
    name,
    type,
    source,
    thumbnail,
    price_cad,
    rating,
    reviews,
    sleeps,
    bedrooms,
    bathrooms,
    amenities = [],
    affiliate_url,
    google_link,
  } = cottage

  // Lien de booking — affiliate_url en priorité, google_link en fallback
  const bookingUrl = affiliate_url || google_link || '#'

  // Amenités à afficher (max 4)
  const displayAmenities = amenities
    .filter(a => AMENITY_ICONS[a])
    .slice(0, 4)

  // Score couleur
  const ratingColor =
    rating >= 4.8 ? 'bg-emerald-600' :
    rating >= 4.5 ? 'bg-green-600'   :
    rating >= 4.0 ? 'bg-yellow-600'  :
    'bg-gray-400'

  const sourceStyle = SOURCE_COLORS[source] || { bg: 'bg-gray-50', text: 'text-gray-600', label: source }

  return (
    <a
      href={bookingUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex gap-0 rounded-2xl border border-gray-100 overflow-hidden
                 hover:border-gray-200 hover:shadow-md transition-all duration-200
                 bg-white w-full"
    >
      {/* ── Photo ── */}
      <div className="relative w-48 min-w-[192px] overflow-hidden bg-gray-100 flex-shrink-0">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={name}
            fill
            sizes="192px"
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-2xl">🏡</span>
          </div>
        )}

        {/* Rating badge */}
        {rating && (
          <span className={`absolute top-2 left-2 ${ratingColor} text-white
                            text-xs font-semibold px-2 py-0.5 rounded-lg`}>
            ★ {rating.toFixed(1)}
          </span>
        )}
      </div>

      {/* ── Contenu ── */}
      <div className="flex flex-col justify-between p-4 flex-1 min-w-0">

        {/* Titre + source */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-2
                         group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium
                            ${sourceStyle.bg} ${sourceStyle.text}`}>
            {sourceStyle.label}
          </span>
        </div>

        {/* Infos capacité */}
        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
          {type && (
            <span className="capitalize">{type}</span>
          )}
          {sleeps && (
            <span>👥 Sleeps {sleeps}</span>
          )}
          {bedrooms && (
            <span>🛏 {bedrooms} bed{bedrooms > 1 ? 's' : ''}</span>
          )}
          {bathrooms && (
            <span>🚿 {bathrooms} bath{bathrooms > 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Amenités */}
        {displayAmenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {displayAmenities.map(a => (
              <span key={a}
                className="text-xs bg-gray-50 border border-gray-100
                           text-gray-600 px-2 py-0.5 rounded-full">
                {AMENITY_ICONS[a]} {a}
              </span>
            ))}
          </div>
        )}

        {/* Prix + reviews + CTA */}
        <div className="flex items-center justify-between mt-3 pt-3
                        border-t border-gray-50">
          <div>
            {price_cad ? (
              <>
                <span className="text-base font-semibold text-gray-900">
                  CAD ${price_cad}
                </span>
                <span className="text-xs text-gray-400 ml-1">/ night</span>
              </>
            ) : (
              <span className="text-sm text-gray-400">Check price</span>
            )}
            {reviews && (
              <p className="text-xs text-gray-400 mt-0.5">
                {reviews.toLocaleString()} reviews
              </p>
            )}
          </div>

          <span className="text-xs font-medium text-blue-600 bg-blue-50
                           px-3 py-1.5 rounded-lg group-hover:bg-blue-600
                           group-hover:text-white transition-colors">
            Book now →
          </span>
        </div>
      </div>
    </a>
  )
}
