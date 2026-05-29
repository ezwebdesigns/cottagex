/**
 * Exemple d'usage dans un listicle MDX ou page contenu
 *
 * Pour un article "10 Best Cottages in Muskoka" :
 *
 * app/[locale]/blog/best-cottages-muskoka/page.jsx
 */

import { getCottages } from '@/lib/cottages'
import CottageGrid    from '@/components/CottageGrid'

export default async function BestCottagesMuskoka() {

  // 7 cottages pour le listicle, triés par rating
  const cottages = await getCottages({
    slug:  'muskoka',
    limit: 7,
    sort:  'rating',
  })

  // Variante : seulement les cottages avec hot tub
  // const cottages = await getCottages({
  //   slug:       'muskoka',
  //   limit:      7,
  //   sort:       'rating',
  //   categories: ['hotTub'],
  // })

  // Variante : cottages family friendly triés par prix
  // const cottages = await getCottages({
  //   slug:       'muskoka',
  //   limit:      7,
  //   sort:       'price',
  //   categories: ['family'],
  // })

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">

      <h1 className="text-3xl font-medium text-gray-900 mb-4">
        10 Best Cottages in Muskoka for 2026
      </h1>

      <p className="text-gray-600 mb-8">
        From lakefront retreats to luxury chalets, here are the top-rated
        cottages in Muskoka available to book on VRBO and Expedia.
      </p>

      {/* Listicle avec filtres interactifs */}
      <CottageGrid
        cottages={cottages}
        limit={7}
        showFilters={true}
        title="Top-rated Muskoka cottages"
        searchUrl="https://vrbo.com/affiliates/vrbo-canada.sGa16vS"
      />

      {/* ... reste de l'article ... */}

    </article>
  )
}

/**
 * SHORTCODE PATTERN
 * Si tu utilises MDX, tu peux enregistrer CottageGrid comme composant global :
 *
 * // mdx-components.jsx (racine du projet)
 * import CottageGridServer from '@/components/CottageGridServer'
 * export function useMDXComponents(components) {
 *   return { CottageGrid: CottageGridServer, ...components }
 * }
 *
 * Puis dans ton article MDX :
 * <CottageGrid slug="muskoka" limit={7} showFilters />
 *
 * CottageGridServer est un wrapper Server Component qui fetch les données
 * et passe les cottages à CottageGrid (Client Component).
 */
