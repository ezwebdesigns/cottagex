/**
 * translate-to-fr.mjs
 * Traduit automatiquement en.json → fr.json via DeepL API
 *
 * Usage:
 *   DEEPL_KEY=ta_clé node scripts/translate-to-fr.mjs
 *
 * Prérequis:
 *   - Compte DeepL gratuit → https://www.deepl.com/pro-api (500 000 chars/mois gratuits)
 *   - Clé API dans .env : DEEPL_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx
 *
 * Comportement:
 *   - Traduit uniquement les clés MANQUANTES dans fr.json (safe à relancer)
 *   - Préserve les clés existantes dans fr.json (tes traductions manuelles)
 *   - Affiche le nombre de caractères utilisés (pour surveiller le quota)
 */

import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEEPL_KEY  = process.env.DEEPL_KEY || 'REMPLACE_PAR_TA_CLE_DEEPL'

// Chemins des fichiers — adapter si nécessaire
const EN_PATH = join(__dirname, '../messages/en.json')
const FR_PATH = join(__dirname, '../messages/fr.json')

// ─── DEEPL API ────────────────────────────────────────────────────────────

async function translateText(text) {
  // Ne pas traduire les strings vides ou avec seulement des variables
  if (!text || text.trim() === '') return text
  
  const res = await fetch('https://api-free.deepl.com/v2/translate', {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      text,
      target_lang: 'FR',
      source_lang: 'EN',
      // Préserve les variables {variable} et {count} sans les traduire
      tag_handling: 'xml',
      ignore_tags:  'x',
    }).toString()
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepL API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  return data.translations[0].text
}

// ─── UTILITAIRES ──────────────────────────────────────────────────────────────

/**
 * Récupère toutes les clés d'un objet JSON imbriqué
 * Retourne: { 'hero.title': 'Find Your...' }
 */
function flattenObject(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value, fullKey))
    } else {
      acc[fullKey] = value
    }
    return acc
  }, {})
}

/**
 * Définit une valeur dans un objet imbriqué via un chemin pointé
 * ex: setNestedValue(obj, 'hero.title', 'Trouvez...')
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {}
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
}

/**
 * Récupère une valeur dans un objet imbriqué via un chemin pointé
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌐 Chalet Express — Traduction automatique EN → FR via DeepL')
  console.log(`📁 Source : ${EN_PATH}`)
  console.log(`📁 Cible  : ${FR_PATH}\n`)

  // Charger en.json
  let enJson
  try {
    enJson = JSON.parse(readFileSync(EN_PATH, 'utf8'))
  } catch {
    console.error('❌ en.json introuvable ou invalide')
    process.exit(1)
  }

  // Charger fr.json existant (ou créer un objet vide)
  let frJson = {}
  try {
    frJson = JSON.parse(readFileSync(FR_PATH, 'utf8'))
    console.log('✓ fr.json existant chargé — les traductions existantes seront préservées\n')
  } catch {
    console.log('ℹ️  fr.json introuvable — création depuis zéro\n')
  }

  // Aplatir en.json pour avoir toutes les clés
  const enFlat = flattenObject(enJson)
  const frFlat = flattenObject(frJson)

  // Identifier les clés manquantes dans fr.json
  const missingKeys = Object.keys(enFlat).filter(key => !frFlat[key])
  const totalKeys   = Object.keys(enFlat).length

  console.log(`📊 Clés totales dans en.json   : ${totalKeys}`)
  console.log(`✅ Clés déjà dans fr.json      : ${totalKeys - missingKeys.length}`)
  console.log(`🔄 Clés à traduire             : ${missingKeys.length}\n`)

  if (missingKeys.length === 0) {
    console.log('✅ fr.json est déjà complet — rien à traduire')
    process.exit(0)
  }

  // Estimer les caractères (pour info quota)
  const totalChars = missingKeys.reduce((sum, key) => sum + String(enFlat[key]).length, 0)
  console.log(`📝 Caractères à traduire       : ~${totalChars.toLocaleString()} / 500 000 gratuits\n`)

  // Traduire clé par clé
  let translated = 0
  let errors     = 0
  let charsUsed  = 0

  for (const key of missingKeys) {
    const originalText = enFlat[key]

    // Skip les valeurs non-string (nombres, booléens, arrays)
    if (typeof originalText !== 'string') {
      setNestedValue(frJson, key, originalText)
      translated++
      continue
    }

    try {
      process.stdout.write(`  🔄 ${key.padEnd(45)} `)
      const translatedText = await translateText(originalText)
      setNestedValue(frJson, key, translatedText)
      charsUsed += originalText.length
      translated++
      console.log(`✓`)

      // Petite pause pour éviter le rate limiting DeepL
      await new Promise(r => setTimeout(r, 100))

    } catch (err) {
      console.log(`✗ ${err.message}`)
      // En cas d'erreur, garder le texte anglais comme fallback
      setNestedValue(frJson, key, originalText)
      errors++
    }
  }

  // Sauvegarder fr.json
  writeFileSync(FR_PATH, JSON.stringify(frJson, null, 2), 'utf8')

  // Résumé
  console.log(`\n${'─'.repeat(55)}`)
  console.log(`✅ Traduction terminée`)
  console.log(`   Clés traduites    : ${translated}`)
  console.log(`   Erreurs           : ${errors}`)
  console.log(`   Caractères utilisés: ~${charsUsed.toLocaleString()}`)
  console.log(`   Fichier sauvegardé : ${FR_PATH}`)
  console.log(`\n⚠️  Vérifie les traductions dans fr.json avant de déployer`)
  console.log(`   Certaines traductions peuvent nécessiter des ajustements`)
  console.log(`   (termes spécifiques au voyage, noms de lieux, etc.)\n`)
}

main().catch(err => {
  console.error('Fatal:', err.message)
  process.exit(1)
})