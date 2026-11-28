async (page) => {
  const sleep = ms => new Promise(r => setTimeout(r, ms))
  const rowsAll = await (await fetch('http://127.0.0.1:8791/list')).json()
  const range = await (await fetch('http://127.0.0.1:8791/range')).json()
  const rows = rowsAll.slice(range.start, range.end)

  const knownDeadFinalPaths = [
    '/vacation-rentals/canada/ontario/port-severn',
    '/vacation-rentals/canada/ontario/district-of-muskoka/huntsville',
    '/vacation-rentals/canada/quebec/laurentides/les-laurentides-regional-county-municipality/lac-sup%C3%A9rieur/lac-superieur-village',
  ]

  function classify(finalUrl, title) {
    try {
      const u = new URL(finalUrl)
      const p = u.pathname
      const q = u.search
      if (/bot or not/i.test(title || '')) return 'BOT'
      // 1) Vraies fiches : motifs avec identifiant de propriété.
      if (/^\/pdp\/lo\/\d+/.test(p)) return 'PROPERTY'
      if (/^\/\d+ha\/?$/.test(p)) return 'PROPERTY'
      if (/\.h\d+\.Hotel-Information/i.test(p)) return 'PROPERTY'
      if (/Hotel\.h\d+\.Hotel-Information/i.test(p)) return 'PROPERTY'
      if (/selected=\d+/.test(q)) return 'PROPERTY'
      // 2) Pages ville / destination (soft-404).
      if (knownDeadFinalPaths.some(x => p.startsWith(x))) return 'SOFT404_CITY'
      if (/^\/vacation-rentals\//.test(p)) return 'SOFT404_CITY'
      if (/Destinations-In-.*Hotel-Destinations/i.test(p)) return 'SOFT404_CITY'
      if (/\/Hotels?-/.test(p) && !/\.h\d+\.Hotel-Information/i.test(p)) return 'SOFT404_CITY'
      return 'UNKNOWN'
    } catch { return 'UNKNOWN' }
  }

  const out = []
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    try {
      await page.goto(r.affiliate_url, { waitUntil: 'domcontentloaded', timeout: 45000 })
      await page.waitForTimeout(700)
      const final = page.url()
      const title = await page.title()
      const verdict = classify(final, title)
      out.push({ id: r.id, name: r.name, input: r.affiliate_url, final, title, verdict })
    } catch (e) {
      out.push({ id: r.id, name: r.name, input: r.affiliate_url, final: null, title: null, verdict: 'ERROR', error: String(e).slice(0, 180) })
    }
    if (i < rows.length - 1) await sleep(300)
  }
  await fetch(`http://127.0.0.1:8791/result?start=${range.start}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(out),
  })
  const counts = {}
  for (const r of out) counts[r.verdict] = (counts[r.verdict] || 0) + 1
  return { start: range.start, end: range.end, processed: out.length, counts }
}
