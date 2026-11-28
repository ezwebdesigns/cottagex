// Génère le fichier de suivi des liens affiliés par province.
// Source : affiliatecottages, fiches standard (is_featured = false).
// Lecture seule ; aucun appel réseau externe, aucune écriture DB.
import { Pool } from 'pg'
import { writeFile } from 'node:fs/promises'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || '') ? {} : { ssl: { rejectUnauthorized: false } }),
})

const OUT = 'E:/PROJECTS/COTTAGEX/provinces-affiliate-links.md'

const slugify = (s) => String(s || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '') || 'none'

const { rows } = await pool.query(`
  SELECT COALESCE(NULLIF(province, ''), '(none)') AS province, count(*)::int AS n
  FROM affiliatecottages
  WHERE is_featured = false
  GROUP BY 1
  ORDER BY 1 ASC
`)
const total = rows.reduce((a, r) => a + r.n, 0)

const lines = [
  '# Liens affiliés par province — ChaletExpress',
  '',
  `Source : \`affiliatecottages\` — fiches **standard** (\`is_featured = false\`), **${total}** au total.`,
  'Généré le ' + new Date().toISOString().slice(0, 10) + '.',
  '',
  '> ⚠️ À confirmer : la DB contient deux libellés PEI (`Pei` et `Prince Edward Island`).',
  '> Ce fichier les traite comme deux lignes distinctes jusqu’à décision contraire.',
  '',
  '## Classement (du moins au plus de chalets)',
  '',
  '| # | Province | Chalets standard | Slug proposé | Page province | Lien affilié |',
  '|---:|---|---:|---|---|---|',
]

rows.forEach((r, i) => {
  const slug = slugify(r.province)
  lines.push(`| ${i + 1} | ${r.province} | ${r.n} | \`${slug}\` | https://chaletexpress.com/en/cottage-country/${slug} | _à créer_ |`)
})

lines.push('', '## Détail par province', '')
rows.forEach((r, i) => {
  const slug = slugify(r.province)
  lines.push(
    `### ${i + 1}. ${r.province} (${r.n})`,
    '',
    `- Page source : https://chaletexpress.com/en/cottage-country/${slug}`,
    '- Lien court Expedia/VRBO : _à créer_',
    '- Statut : ☐ à créer',
    ''
  )
})

await writeFile(OUT, lines.join('\n') + '\n', 'utf8')
console.log('WROTE', OUT)
console.log('PROVINCES', rows.length, 'TOTAL', total)
console.log(JSON.stringify(rows, null, 2))
await pool.end()
