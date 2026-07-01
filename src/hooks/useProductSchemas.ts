'use client'

import { useEffect } from 'react'

function buildSchema(cottage: any) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: cottage.name,
    category: 'Vacation Rental',
  }

  const image = cottage.thumbnail || (Array.isArray(cottage.photos) && cottage.photos[0])
  if (image) schema.image = image

  if (cottage.affiliate_url || cottage.google_link) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'CAD',
      url: cottage.affiliate_url || cottage.google_link,
    }
    if (cottage.price_cad != null) {
      schema.offers.price = cottage.price_cad
    }
  }

  if (cottage.rating != null) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: cottage.rating,
      reviewCount: cottage.reviews || 0,
    }
  }

  return schema
}

export function useProductSchemas(cottages: any[]) {
  useEffect(() => {
    if (!cottages.length) return

    const scripts: HTMLScriptElement[] = []

    for (const cottage of cottages) {
      const existing = document.getElementById(`schema-product-${cottage.id}`)
      if (existing) continue

      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = `schema-product-${cottage.id}`
      script.textContent = JSON.stringify(buildSchema(cottage))
      document.head.appendChild(script)
      scripts.push(script)
    }

    return () => {
      for (const script of scripts) {
        script.remove()
      }
    }
  }, [cottages])
}
