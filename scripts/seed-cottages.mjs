#!/usr/bin/env node
/**
 * ANCIEN script de seeding — conservé pour compatibilité CLI.
 *
 * Le catalogue est désormais alimenté par DataForSEO via :
 *   node --env-file=.env scripts/dfs-chalet-accumulate.mjs --write
 *
 * SerpApi (engine google_hotels) n'est plus utilisé : aucun appel live ne doit
 * être fait depuis ce dépôt hors cron et accumulation.
 *
 * Usage historique : node scripts/seed-cottages.mjs muskoka tofino
 *   → équivalent : node --env-file=.env scripts/dfs-chalet-accumulate.mjs --write --cities=muskoka,tofino
 */
import { spawnSync } from 'node:child_process'

const cities = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const args = ['--env-file=.env', 'scripts/dfs-chalet-accumulate.mjs', '--write']
if (cities.length) args.push(`--cities=${cities.join(',')}`)

const result = spawnSync(process.execPath, args, { stdio: 'inherit', cwd: process.cwd() })
process.exit(result.status ?? 1)
