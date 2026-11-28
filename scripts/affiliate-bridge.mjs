// Tiny local bridge for Playwright affiliate-link check
import http from 'node:http'
import fs from 'node:fs'

const LIST = 'C:/Users/mday/AppData/Local/hermes/cache/scratch/affiliate-list.json'
const RANGE = 'C:/Users/mday/AppData/Local/hermes/cache/scratch/affiliate-range.json'

const server = http.createServer((req, res) => {
  if (req.url === '/list') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(fs.readFileSync(LIST))
    return
  }
  if (req.url === '/range') {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(fs.readFileSync(RANGE))
    return
  }
  if (req.url.startsWith('/result') && req.method === 'POST') {
    let body = ''
    req.on('data', c => { body += c })
    req.on('end', () => {
      const u = new URL(req.url, 'http://127.0.0.1:8791')
      const start = u.searchParams.get('start') || '0'
      const out = `C:/Users/mday/AppData/Local/hermes/cache/scratch/affiliate-browser-${start}.json`
      fs.writeFileSync(out, body)
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ok: true, bytes: body.length, result: out }))
    })
    return
  }
  res.writeHead(404)
  res.end()
})
server.listen(8791, '127.0.0.1', () => console.log('bridge listening on 8791'))
