// Probe local Playwright with installed Chrome (NO DB writes)
import { chromium } from 'playwright'

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const page = await browser.newPage()

for (const url of [
  'https://www.vrbo.com/vacation-rentals/canada/ontario/port-severn',
  'https://vrbo.com/affiliate/MVzAojA',
]) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.waitForTimeout(1500)
  console.log('INPUT :', url)
  console.log('FINAL :', page.url())
  console.log('TITLE :', await page.title())
  console.log('---')
}
await browser.close()
