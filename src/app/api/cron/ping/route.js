/**
 * /app/api/cron/ping/route.js
 * Cron quotidien — vérifie les cottages is_featured = true
 * Planifié via vercel.json : tous les jours à 7h UTC
 *
 * Sécurisé par CRON_SECRET (header Authorization)
 */

import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function GET(request) {

  // ── Sécurité : vérifier le secret Vercel Cron ──────────────────────────────
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const client = await pool.connect()
  const results = { pinged: 0, available: 0, unavailable: 0, errors: 0 }

  try {
    // Récupérer uniquement les cottages affichés sur le site
    const { rows: cottages } = await client.query(`
      SELECT id, name, google_link
      FROM affiliatecottages
      WHERE is_featured = true
        AND google_link IS NOT NULL
    `)

    console.log(`[ping] ${cottages.length} cottages featured à vérifier`)

    for (const cottage of cottages) {
      try {
        const res = await fetch(cottage.google_link, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(6000), // timeout 6s
          headers: {
            // Simuler un navigateur pour éviter les blocages
            'User-Agent': 'Mozilla/5.0 (compatible; CottageChecker/1.0)',
          },
        })

        const available = res.ok // 200-299
        const pingStatus = res.status

        await client.query(`
          UPDATE affiliatecottages
          SET
            available    = $1,
            ping_status  = $2,
            last_pinged  = NOW()
          WHERE id = $3
        `, [available, pingStatus, cottage.id])

        available ? results.available++ : results.unavailable++
        results.pinged++

        console.log(`[ping] ${cottage.name?.slice(0, 35).padEnd(35)} → ${pingStatus} ${available ? '✓' : '✗'}`)

      } catch (err) {
        // Timeout ou erreur réseau → marquer indisponible par précaution
        await client.query(`
          UPDATE affiliatecottages
          SET
            available   = false,
            ping_status = 0,
            last_pinged = NOW()
          WHERE id = $1
        `, [cottage.id])

        results.unavailable++
        results.errors++
        console.error(`[ping] ${cottage.id} erreur: ${err.message}`)
      }

      // Petite pause entre les pings pour ne pas surcharger
      await new Promise(r => setTimeout(r, 300))
    }

  } finally {
    client.release()
  }

  console.log(`[ping] Terminé — ${JSON.stringify(results)}`)

  return Response.json({
    success: true,
    timestamp: new Date().toISOString(),
    ...results,
  })
}
