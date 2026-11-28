#!/usr/bin/env node
/**
 * ChaletExpress — vérification de disponibilité via DataForSEO (dry-run par défaut)
 *
 * But : pour chaque fiche ayant un affiliate_url, interroger hotel_info/live/advanced
 * avec son property_token. Si DataForSEO ne trouve plus la fiche, on la désactive
 * en DB (jamais de DELETE). Le short link affilié lui-même n'est pas testé :
 * VRBO/Expedia bloquent les requêtes serveur (406/429).
 *
 * Coût réel : $0.004 par appel (même sur "No Search Results").
 *
 * Usage :
 *   node --env-file=.env scripts/check-affiliate-via-dfs.mjs                       # dry-run, 130 fiches, max $1
 *   node --env-file=.env scripts/check-affiliate-via-dfs.mjs --limit=8             # test rapide
 *   node --env-file=.env scripts/check-affiliate-via-dfs.mjs --write               # applique
 *   node --env-file=.env scripts/check-affiliate-via-dfs.mjs --max-cost=0.5        # garde-fou
 *
 * Verdicts :
 *   ALIVE   → task 20000 + résultat présent
 *   MISSING → task 40102 ("No Search Results") ou 20000 sans résultat
 *   UNKNOWN → tout autre statut / erreur réseau → available INCHANGÉ
 */
import pg from 'pg'
import fs from 'node:fs/promises'
import { loadDfsEnv, dataforseoEnabled, stayDates, locationName } from '../src/lib/dataforseo.ts'

loadDfsEnv(['E:/PROJECTS/TOOLS/dfs-test/.env.local'])
if (!dataforseoEnabled()) { console.error('[dfs-check] Identifiants DataForSEO absents.'); process.exit(1) }

const DFS_BASE = process.env.DATAFORSEO_BASE || 'https://api.dataforseo.com'
const cred = Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_API_PASSWORD}`).toString('base64')
const dates = stayDates()

const args = process.argv.slice(2)
const WRITE = args.includes('--write')
const arg = (name, def) => { const a = args.find(x => x.startsWith(`--${name}=`)); return a ? a.split('=')[1] : def }
const MAX_COST = Number(arg('max-cost', '1')) || 1
const LIMIT = Math.max(0, parseInt(arg('limit', '0'), 10) || 0)
const OFFSET = Math.max(0, parseInt(arg('offset', '0'), 10) || 0)
const DELAY = Math.max(0, parseInt(arg('delay', '200'), 10) || 0)

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, max: 4 })
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function post(path, task) {
  for (let a = 0; a < 3; a++) {
    try {
      const res = await fetch(`${DFS_BASE}/v3/business_data/google${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Basic ${cred}` },
        body: JSON.stringify([task]),
        signal: AbortSignal.timeout(120000),
      })
      if (res.status === 429 || res.status >= 500) { await sleep(1500 * (a + 1)); continue }
      const j = await res.json()
      const t = j?.tasks?.[0]
      return { t, cost: Number(j?.cost || t?.cost || 0), http: res.status }
    } catch (e) {
      if (a === 2) return { t: null, cost: 0, http: 0, error: e.message }
      await sleep(1200 * (a + 1))
    }
  }
  return { t: null, cost: 0, http: 0 }
}

function verdictOf(t) {
  const code = t?.status_code
  if (code === 20000 && t?.result?.[0]) return 'ALIVE'
  if (code === 40102) return 'MISSING'
  if (code === 20000 && Array.isArray(t?.result) && t.result.length === 0) return 'MISSING'
  return 'UNKNOWN'
}

;(async () => {
  let sql = `
    SELECT id, name, property_token, province, affiliate_url, google_link, available
    FROM affiliatecottages
    WHERE affiliate_url IS NOT NULL AND affiliate_url <> ''
      AND property_token IS NOT NULL AND property_token <> ''
    ORDER BY id
  `
  const params = []
  if (OFFSET) { sql += ` OFFSET $${params.length + 1}`; params.push(OFFSET) }
  if (LIMIT) { sql += ` LIMIT $${params.length + 1}`; params.push(LIMIT) }
  const { rows: cottages } = await pool.query(sql, params)

  console.log(`[dfs-check] ${cottages.length} fiche(s) à vérifier — mode ${WRITE ? 'WRITE' : 'DRY-RUN'}`)
  console.log(`[dfs-check] séjour ${dates.check_in} → ${dates.check_out} | max-cost $${MAX_COST.toFixed(3)}`)

  const report = []
  const counts = { ALIVE: 0, MISSING: 0, UNKNOWN: 0 }
  let cost = 0

  for (let i = 0; i < cottages.length; i++) {
    if (cost + 0.004 > MAX_COST) {
      console.log(`[dfs-check] Garde-fou coût atteint ($${cost.toFixed(3)} / $${MAX_COST.toFixed(3)}) — arrêt.`)
      break
    }
    const c = cottages[i]
    const province = String(c.province || '').toLowerCase()
    const task = {
      hotel_identifier: c.property_token,
      location_name: locationName(province),
      language_code: 'en',
      currency: 'CAD',
      check_in: dates.check_in,
      check_out: dates.check_out,
      adults: 2,
    }
    const { t, cost: cc, http, error } = await post('/hotel_info/live/advanced', task)
    cost += cc
    const verdict = verdictOf(t)
    counts[verdict] = (counts[verdict] || 0) + 1
    const result = t?.result?.[0]
    const row = {
      id: c.id,
      name: c.name,
      property_token: c.property_token,
      province: c.province,
      affiliate_url: c.affiliate_url,
      google_link: c.google_link,
      http,
      status_code: t?.status_code ?? null,
      status_message: t?.status_message ?? error ?? null,
      has_result: !!result,
      result_title: result?.title ?? null,
      result_check_url: result?.check_url ?? null,
      verdict,
      cost: cc,
      action: verdict === 'MISSING' ? (WRITE ? 'disabled' : 'would-disable') : 'kept',
    }
    report.push(row)

    const flag = verdict === 'MISSING' ? '✗' : verdict === 'UNKNOWN' ? '?' : '✓'
    console.log(`[dfs-check] ${String(i + 1).padStart(3)}/${cottages.length} ${flag} ${String(t?.status_code ?? http).padEnd(6)} ${verdict.padEnd(7)} $${cost.toFixed(3)} ${c.name?.slice(0, 38).padEnd(38)}`)

    if (WRITE && verdict === 'MISSING') {
      // 404 = convention "mort" déjà utilisée par /api/cron/ping (smallint).
      await pool.query(`
        UPDATE affiliatecottages
        SET available = false, ping_status = 404, last_pinged = NOW()
        WHERE id = $1
      `, [c.id])
    } else if (WRITE) {
      await pool.query(`UPDATE affiliatecottages SET last_pinged = NOW() WHERE id = $1`, [c.id])
    }

    if (DELAY && i < cottages.length - 1) await sleep(DELAY)
  }

  console.log(`\n[dfs-check] Résumé : ${JSON.stringify(counts)} | coût réel $${cost.toFixed(3)}`)
  if (WRITE) console.log('[dfs-check] Pense à vider le cache cottages via le dashboard admin.')
  else console.log(`[dfs-check] DRY-RUN — ${report.filter(r => r.action === 'would-disable').length} fiche(s) seraient désactivées.`)

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outJson = `C:/Users/mday/AppData/Local/hermes/cache/scratch/dfs-affiliate-check-${stamp}.json`
  const outCsv = `C:/Users/mday/AppData/Local/hermes/cache/scratch/dfs-affiliate-check-${stamp}.csv`
  await fs.writeFile(outJson, JSON.stringify(report, null, 2), 'utf8')
  const csv = ['id,name,property_token,status_code,status_message,verdict,affiliate_url,action']
    .concat(report.map(r => [r.id, r.name, r.property_token, r.status_code, r.status_message, r.verdict, r.affiliate_url, r.action]
      .map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))).join('\n')
  await fs.writeFile(outCsv, csv, 'utf8')
  console.log(`[dfs-check] Rapport JSON : ${outJson}`)
  console.log(`[dfs-check] Rapport CSV  : ${outCsv}`)

  await pool.end()
})().catch(e => { console.error('[dfs-check] ERREUR', e); process.exit(1) })
