// cohesion_capture.mjs - TR-027 before/after pairs (2026-07-25).
// Captures every grade and haze variant at both profiles so the eye-calls can
// be made from a contact sheet rather than by reloading between options.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { dismissIntro } from './lib/dismissOverlays.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', '..', 'reports', 'screens', 'cohesion-pass')
mkdirSync(OUT, { recursive: true })

const port = await new Promise((res, rej) => {
  const s = createServer(); s.on('error', rej)
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => res(port)) })
})
const dev = spawn('npx', ['vite', '--port', String(port), '--strictPort'], { cwd: join(__dirname, '..'), stdio: 'ignore' })
await new Promise((r) => setTimeout(r, 6000))
const browser = await chromium.launch()

const PROFILES = {
  desktop:  { width: 1280, height: 720 },
  portrait: { width: 430,  height: 932 },   // excludes the scene group, so it isolates the grade
}

async function shot(profile, query, name) {
  const page = await browser.newPage({ viewport: PROFILES[profile] })
  await page.goto(`http://localhost:${port}/?mock=1${query}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
  await dismissIntro(page)
  await page.waitForTimeout(1200)
  await page.screenshot({ path: join(OUT, `${profile}-${name}.png`) })
  await page.close()
  console.log(`  ${profile}-${name}.png`)
}

console.log('BEFORE (shipped look, grade off + haze off):')
for (const p of Object.keys(PROFILES)) await shot(p, '', 'before')

console.log('\nGRADE variants (haze 0, so the grade is isolated):')
for (const g of ['warm', 'cool', 'deep']) {
  for (const p of Object.keys(PROFILES)) await shot(p, `&grade=${g}`, `grade-${g}`)
}

console.log('\nHAZE variants (desktop only, portrait excludes the scene group):')
for (const h of [1, 2, 3]) await shot('desktop', `&haze=${h}`, `haze-${h}`)

console.log('\nCOMBINED, a plausible landing point:')
await shot('desktop', '&grade=deep&haze=2', 'combined-deep-haze2')
await shot('portrait', '&grade=deep', 'combined-deep')

await browser.close(); dev.kill()
