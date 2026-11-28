#!/usr/bin/env node
/**
 * ChaletExpress — vérification des affiliate_url
 *
 * but: détecter les liens d'affilié qui ne mènent plus à une fiche disponible,
 * et désactiver la fiche en DB (jamais de DELETE).
 *
 * Usage :
 *   node --env-file=.env scripts/check-affiliate-links.mjs                 # dry-run (aucune écriture)
 *   node --env-file=.env scripts/check-affiliate-links.mjs --limit=10      # 10 premières fiches
 *   node --env-file=.env scripts/check-affiliate-links.mjs --write         # applique en DB
 *   node --env-file=.env scripts/check-affiliate-links.mjs --write --suspicious
 *
 * Règles de décision :
 *   DEAD       → 404 / 410, ou page finale générique, ou phrase "no longer available"
 *   SUSPICIOUS → page finale non compensée (via --suspicious seulement)
 *   ALIVE      → 2xx avec URL finale ressemblant à une fiche
 *   UNKNOWN    → 403 / 429 / 5xx / timeout → available INCHANGÉ (jamais désactivé)
 *
 * Délai : 700 ms entre chaque requête, concurrence 1. Ne jamais désactiver sur 429.
 */
import pg from 'pg'
import fs from 'node:fs/promises'

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const WRITE_SUSPICIOUS = args.includes('--suspicious')
const limitArg = args.find(a => a.startsWith('--limit='))
const LIMIT = limitArg ? Math.max(1, parseInt(limitArg.split('=')[1], 10) || 0) : 0
const delayArg = args.find(a => a.startsWith('--delay='))
const DELAY = delayArg ? Math.max(200, parseInt(delayArg.split('=')[1], 10) || 700) : 700
const offsetArg = args.find(a => a.startsWith('--offset='))
const OFFSET = offsetArg ? Math.max(0, parseInt(offsetArg.split('=')[1], 10) || 0) : 0

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 (compatible; ChaletExpressLinkChecker/1.0)'

const DEAD_PHRASES = [
  'no longer available', 'is no longer', 'has been removed', 'listing has been removed',
  "n'est plus disponible", 'n’est plus disponible', 'page not found', "couldn't find this",
  'we could not find', 'this property is not available', 'annonce introuvable',
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

function isListingUrl(finalUrl) {
  try {
    const u = new URL(finalUrl)
    const host = u.hostname.replace(/^www\./, '')
    const p = u.pathname
    if (host.includes('vrbo')) {
      return /\/pdp\/lo\/\d+/.test(p) || /\/property\//.test(p) || /\/vacation-rental\//.test(p) || /\/\d{6,}/.test(p)
    }
    if (host.includes('expedia')) {
      return /Hotel\.h\d+\.Hotel-Information/i.test(p) || /\/hotel\//i.test(p) || /\/\d{6,}/.test(p)
    }
    if (host.includes('booking')) return /\/hotel\//i.test(p) || /\/\d{6,}/.test(p)
    return null // hébergeur inconnu → on ne conclut pas
  } catch { return null }
}

async function checkOne(url) {
  let res = null
  let method = 'HEAD'
  const init = {
    redirect: 'follow',
    signal: AbortSignal.timeout(12000),
    headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml' },
  }
  try {
    res = await fetch(url, { ...init, method: 'HEAD' })
  } catch (e) {
    return { status: 0, finalUrl: '', method, error: e.message, verdict: 'UNKNOWN', phrase: null, shape: null }
  }

  // Certains CDN refusent HEAD → on retente en GET.
  if ([403, 405, 501].includes(res.status)) {
    method = 'GET'
    try {
      res = await fetch(url, { ...init, method: 'GET' })
    } catch (e) {
      return { status: 0, finalUrl: '', method, error: e.message, verdict: 'UNKNOWN', phrase: null, shape: null }
    }
  }

  const status = res.status
  const finalUrl = res.url || url

  // 404/410 = mort certain. 403/429/5xx/0 = inconnu (jamais désactivé).
  if (status === 404 || status === 410) {
    return { status, finalUrl, method, error: null, verdict: 'DEAD', phrase: null, shape: isListingUrl(finalUrl) }
  }
  // 406 = bot-wall (très courant sur VRBO/Expedia) → inconnu, jamais désactivé.
  if (status === 0 || status === 403 || status === 406 || status === 429 || status >= 500) {
    return { status, finalUrl, method, error: null, verdict: 'UNKNOWN', phrase: null, shape: isListingUrl(finalUrl) }
  }

  // 2xx/3xx : on analyse la forme de l'URL finale et (si GET) le début du HTML.
  const shape = isListingUrl(finalUrl)
  let phrase = null
  if (status >= 200 && status < 400 && shape !== true) {
    // URL finale générique ou inconnue → on cherche une phrase explicite.
    try {
      const bodyRes = await fetch(finalUrl, { ...init, method: 'GET' })
      const reader = bodyRes.body?.getReader()
      if (reader) {
        let text = ''
        let bytes = 0
        while (bytes < 250000) {
          const { done, value } = await reader.read()
          if (done) break
          text += Buffer.from(value).toString('utf8')
          bytes += value.length
        }
        await reader.cancel().catch(() => {})
        const lower = text.toLowerCase()
        phrase = DEAD_PHRASES.find(p => lower.includes(p)) || null
      }
    } catch {}
  }

  let verdict = 'ALIVE'
  if (phrase) verdict = 'DEAD'
  else if (shape === false) verdict = 'SUSPICIOUS'
  else if (shape === null) verdict = 'UNKNOWN'

  return { status, finalUrl, method, error: null, verdict, phrase, shape }
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 4,
})

const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const outJson = `C:/Users/mday/AppData/Local/hermes/cache/scratch/affiliate-link-check-${stamp}.json`
const outCsv = `C:/Users/mday/AppData/Local/hermes/cache/scratch/affiliate-link-check-${stamp}.csv`

;(async () => {
  let q = `
    SELECT id, name, affiliate_url, google_link, is_featured, available, last_ping_status, absence_count, availability_reason
    FROM affiliatecottages
    WHERE affiliate_url IS NOT NULL AND affiliate_url <> ''
    ORDER BY id
  `
  const params = []
  if (OFFSET || LIMIT) {
    q += ` OFFSET $${params.length + 1}`
    params.push(OFFSET)
  }
  if (LIMIT) {
    q += ` LIMIT $${params.length + 1}`
    params.push(LIMIT)
  }
  const { rows: cottages } = await pool.query(q, params)

  console.log(`[aff-check] ${cottages.length} fiche(s) à vérifier — mode ${WRITE ? 'WRITE' : 'DRY-RUN'}`)
  console.log(`[aff-check] délai ${DELAY}ms entre requêtes, concurrence 1`)

  const report = []
  const counts = { ALIVE: 0, DEAD: 0, SUSPICIOUS: 0, UNKNOWN: 0 }

  for (let i = 0; i < cottages.length; i++) {
    const c = cottages[i]
    const r = await checkOne(c.affiliate_url)
    counts[r.verdict] = (counts[r.verdict] || 0) + 1
    const row = {
      id: c.id,
      name: c.name,
      affiliate_url: c.affiliate_url,
      status: r.status,
      method: r.method,
      final_url: r.finalUrl,
      verdict: r.verdict,
      phrase: r.phrase,
      shape: r.shape,
      error: r.error,
      action: r.verdict === 'DEAD' || (WRITE_SUSPICIOUS && r.verdict === 'SUSPICIOUS') ? (WRITE ? 'disabled' : 'would-disable') : 'kept',
    }
    report.push(row)

    const flag = r.verdict === 'DEAD' ? '✗' : r.verdict === 'UNKNOWN' ? '?' : r.verdict === 'SUSPICIOUS' ? '!' : '✓'
    console.log(`[aff-check] ${String(i + 1).padStart(3)}/${cottages.length} ${flag} ${String(r.status).padStart(3)} ${r.verdict.padEnd(10)} ${c.name?.slice(0, 42).padEnd(42)} → ${r.finalUrl?.slice(0, 70)}`)

    if (i < cottages.length - 1) await sleep(DELAY)
  }

  // Écritures DB : uniquement sur verdict DEAD (ou SUSPICIOUS si --suspicious).
  let disabled = 0
  if (WRITE) {
    for (const row of report) {
      const doDisable = row.verdict === 'DEAD' || (WRITE_SUSPICIOUS && row.verdict === 'SUSPICIOUS')
      if (!doDisable) {
        // On ne touche pas absence_count (compteur du sync mensuel).
        // On horodate seulement le contrôle.
        await pool.query(`UPDATE affiliatecottages SET last_pinged = NOW() WHERE id = $1`, [row.id])
        continue
      }
      await pool.query(`
        UPDATE affiliatecottages
        SET available = false,
            last_ping_status = $1,
            availability_reason = 'ping_404',
            last_pinged = NOW()
        WHERE id = $2
      `, [row.status, row.id])
      disabled++
    }
    console.log(`[aff-check] ${disabled} fiche(s) désactivée(s) en DB.`)
    console.log(`[aff-check] Pense à vider le cache cottages via le dashboard admin.`)
  } else {
    console.log(`[aff-check] DRY-RUN — aucune écriture DB. ${report.filter(r => r.action === 'would-disable').length} fiche(s) seraient désactivées.`)
  }

  await fs.writeFile(outJson, JSON.stringify(report, null, 2), 'utf8')
  const csv = ['id,name,status,method,verdict,final_url,phrase,action']
    .concat(report.map(r => [r.id, r.name, r.status, r.method, r.verdict, r.final_url, r.phrase || '', r.action]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))).join('\n')
  await fs.writeFile(outCsv, csv, 'utf8')

  console.log(`\n[aff-check] Résumé : ${JSON.stringify(counts)}`)
  console.log(`[aff-check] Rapport JSON : ${outJson}`)
  console.log(`[aff-check] Rapport CSV  : ${outCsv}`)

  await pool.end()
})().catch(e => { console.error('[aff-check] ERREUR', e); process.exit(1) })
