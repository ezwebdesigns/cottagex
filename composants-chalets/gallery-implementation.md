# Gallery Section — Implémentation shortcode

## Contexte
Le champ actuel de traduction FR des tabs doit rester intact.
Il faut ajouter un nouveau champ `shortcode` pour chaque tab.

---

## Étape 1 — Migration DB

Identifie la table qui stocke les gallery tabs (probablement `homepage_settings`
ou `gallery_tabs` ou similaire). Ajoute une colonne `shortcode` :

```sql
-- Adapter selon le nom réel de ta table
ALTER TABLE gallery_tabs ADD COLUMN IF NOT EXISTS shortcode TEXT;
```

Si les tabs sont stockés en JSONB dans une table parent (ex: `homepage_settings`),
adapter la structure JSONB pour inclure `shortcode` dans chaque tab :

```json
{
  "tabs": [
    { "label": "Cottage rentals in Canada", "labelFr": "Chalets au Canada", "shortcode": "[canada, all, 6]" },
    { "label": "Luxury Cottages", "labelFr": "Chalets de luxe", "shortcode": "[canada, luxury, 6]" },
    { "label": "Pet Friendly Cottages", "labelFr": "Chalets acceptant les animaux", "shortcode": "[canada, pet-friendly, 6]" },
    { "label": "Family Cottage Resorts", "labelFr": "Chalets familiaux", "shortcode": "[canada, family, 6]" },
    { "label": "Lakefront Cottages", "labelFr": "Chalets en bord de lac", "shortcode": "[canada, lakefront, 6]" },
    { "label": "Cottages with hot tub", "labelFr": "Chalets avec spa", "shortcode": "[canada, hot-tub, 6]" }
  ]
}
```

---

## Étape 2 — Dashboard Admin

Dans le formulaire Gallery Section, ajoute un 3e champ par tab :
- Champ 1 : Label EN (existant)
- Champ 2 : Label FR (existant — NE PAS MODIFIER)
- Champ 3 : Shortcode (nouveau) — placeholder: "[canada, all, 6]"

---

## Étape 3 — Mise à jour lib/cottages.js

Ajouter les nouveaux filtres dans `getCottages()` et reconnaître `canada` comme Canada wide :

```js
// Dans getCottages(), remplacer le bloc filtre destination par :
if (slug && slug !== 'canada') {
  // Vérifie si c'est une province ou un slug de destination
  const isProvince = PROVINCES.includes(slug)
  if (isProvince) {
    conditions.push(`province = $${paramIndex++}`)
    params.push(slug)
  } else {
    conditions.push(`slug = $${paramIndex++}`)
    params.push(slug)
  }
}
// Si slug === 'canada' ou absent → pas de filtre destination (Canada wide)

// Ajouter dans CATEGORY_CONDITIONS :
const CATEGORY_CONDITIONS = {
  family:        `amenities @> '["Kid-friendly"]'`,
  hotTub:        `(amenities @> '["Hot tub"]' OR amenities @> '["Spa"]')`,
  'hot-tub':     `(amenities @> '["Hot tub"]' OR amenities @> '["Spa"]')`,  // alias
  lakefront:     `(amenities @> '["Waterfront"]' OR amenities @> '["Beach access"]')`,
  luxury:        `(rating >= 4.8 AND price_cad >= 600)`,
  'pet-friendly':`amenities @> '["Pet-friendly"]'`,
  all:           null,  // pas de filtre catégorie
}
```

---

## Étape 4 — Parser shortcode dans GallerySection

Le composant GallerySection reçoit les tabs depuis la DB avec leur shortcode.
Quand l'utilisateur clique un tab, parser le shortcode et fetch `/api/cottages` :

```ts
// Regex identique au système existant
const shortcodeRegex = /\[([a-z0-9-]+),\s*([a-z0-9-]+)(?:,\s*(\d+))?\]/

function parseShortcode(shortcode: string) {
  const match = shortcode.match(shortcodeRegex)
  if (!match) return { slug: 'canada', category: 'all', limit: 6 }
  return {
    slug:     match[1].trim(),           // ex: 'canada'
    category: match[2].trim(),           // ex: 'hot-tub'
    limit:    match[3] ? parseInt(match[3]) : 6,
  }
}

// Dans le composant, quand tab change :
async function loadCottages(shortcode: string) {
  const { slug, category, limit } = parseShortcode(shortcode)
  const params = new URLSearchParams({
    ...(slug && slug !== 'canada' ? { slug } : {}),
    limit:    String(limit),
    sort:     'rating',
    ...(category && category !== 'all' ? { category } : {}),
  })
  const res  = await fetch(`/api/cottages?${params}`)
  const data = await res.json()
  return data.cottages || []
}
```

---

## Étape 5 — Cards style template

Les cards de la Gallery doivent utiliser le design vertical existant du template
(visible sur /fr/guides/7-most-beautiful-cottages-ontario) :
- Photo pleine largeur en haut
- Badge catégorie (Popular, Secluded, etc.) → utiliser `source` ou premier amenity
- Nom du chalet
- Localisation (ville/province depuis `slug` + `province`)
- Description courte → utiliser les 2 premiers amenities comme résumé
- Prix CAD / night
- Bouton "Check →" → `affiliate_url` || `google_link`

Adapter le composant card existant pour accepter les données `affiliatecottages`
en plus des données hardcodées actuelles.

---

## Shortcodes par défaut à renseigner dans le dashboard

| Tab EN | Tab FR | Shortcode |
|--------|--------|-----------|
| Cottage rentals in Canada | Chalets au Canada | [canada, all, 6] |
| Luxury Cottages | Chalets de luxe | [canada, luxury, 6] |
| Pet Friendly Cottages | Chalets acceptant les animaux | [canada, pet-friendly, 6] |
| Family Cottage Resorts | Chalets familiaux | [canada, family, 6] |
| Lakefront Cottages | Chalets en bord de lac | [canada, lakefront, 6] |
| Cottages with hot tub | Chalets avec spa | [canada, hot-tub, 6] |

---

## Notes importantes

1. Le champ FR existant (`labelFr`) NE DOIT PAS être modifié — c'est la traduction du tab
2. Le shortcode est une nouvelle colonne/champ indépendant
3. Si `shortcode` est vide pour un tab → fallback sur `[canada, all, 6]`
4. Les cards skeleton (loading) doivent s'afficher pendant le fetch — même pattern que CottageShortcode
5. Canada wide = pas de filtre slug/province dans la requête SQL
