// interface_guide_icon_proof.mjs — R2-7c proof grid (owner audit round 2,
// item c: "regenerate every interface-guide icon ... with a proof grid
// committed").
//
// Boots its own vite dev server (mirrors nitro_flow_proof.mjs's boilerplate),
// then for each of the 6 image-based INTERFACE_GUIDE entries in
// PaytableModal.svelte (spin, bet+, bet-, features, autoplay, menu) captures:
//   (a) the real live HUD button, in situ, exactly as a player sees it
//   (b) the same icon as rendered inside the paytable's Interface Guide row
// and assembles a single side-by-side comparison grid image so an owner/
// reviewer can eyeball that the two now match, without diffing files by hand.
//
// Output: reports/screens/owner-audit-v2/interface-guide-icons/proof-grid.png
//
// Run (from frontend/): node scripts/interface_guide_icon_proof.mjs

import { chromium } from 'playwright'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn, spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FRONTEND = join(__dirname, '..')
const ROOT = join(FRONTEND, '..')
const VENV_PY = join(ROOT, 'scripts', 'assets', '.venv', 'bin', 'python')
const OUT_DIR = join(ROOT, 'reports', 'screens', 'owner-audit-v2', 'interface-guide-icons')
mkdirSync(OUT_DIR, { recursive: true })

// live selector = the real HUD control; guideName = its `name` field in
// PaytableModal's INTERFACE_GUIDE array (used to find its row there).
const ENTRIES = [
  { live: '[data-testid="spin-button"]', guideName: 'Spin' },
  { live: 'button[aria-label="Increase bet"]', guideName: 'Increase Bet' },
  { live: 'button[aria-label="Decrease bet"]', guideName: 'Decrease Bet' },
  { live: '[data-testid="feature-menu-button"]', guideName: 'Features' },
  { live: '.fs-auto', guideName: 'Autoplay' },
  { live: '.fs-menu', guideName: 'Menu' },
]

async function getFreePort() {
  return new Promise((resolvePromise, reject) => {
    const srv = createServer()
    srv.on('error', reject)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address()
      srv.close(() => resolvePromise(port))
    })
  })
}

function startDevServer(port) {
  return new Promise((resolvePreview, reject) => {
    const proc = spawn('npx', ['vite', '--port', String(port), '--strictPort'], {
      cwd: FRONTEND, stdio: ['ignore', 'pipe', 'pipe'],
    })
    let resolved = false
    const onData = (d) => {
      const s = d.toString()
      if (!resolved && /Local/.test(s)) { resolved = true; resolvePreview(proc) }
    }
    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('error', reject)
    setTimeout(() => { if (!resolved) reject(new Error('vite dev server did not start in time')) }, 15000)
  })
}

async function dismissIntro(page) {
  const splash = page.locator('[data-testid="hero-splash"]')
  if (await splash.count() > 0 && await splash.isVisible().catch(() => false)) {
    await splash.click()
    await page.waitForTimeout(100)
  }
  const btn = page.locator('[data-testid="intro-continue"]')
  if (await btn.count() > 0 && await btn.isVisible().catch(() => false)) {
    await btn.click()
    await page.waitForTimeout(100)
  }
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

async function captureLive(page, selector, outPath) {
  const box = await page.locator(selector).boundingBox()
  if (!box) throw new Error(`no bounding box for ${selector}`)
  const margin = clamp(Math.round(0.4 * Math.max(box.width, box.height)), 16, 40)
  const clip = {
    x: Math.max(0, box.x - margin),
    y: Math.max(0, box.y - margin),
    width: box.width + margin * 2,
    height: box.height + margin * 2,
  }
  await page.screenshot({ path: outPath, clip })
}

async function run() {
  const port = await getFreePort()
  const server = await startDevServer(port)
  const tmpDir = mkdtempSync(join(tmpdir(), 'fs-guide-proof-'))

  try {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
    await dismissIntro(page)
    await page.evaluate(() => {
      window.__testStores.balance.set(1_000_000)
      window.__testStores.betAmount.set(5)
    })
    await page.waitForTimeout(250)

    console.log('Capturing live HUD buttons...')
    const liveShots = {}
    for (const e of ENTRIES) {
      const p = join(tmpDir, `live_${e.guideName.replace(/\s+/g, '_')}.png`)
      await captureLive(page, e.live, p)
      liveShots[e.guideName] = p
    }

    console.log('Opening paytable Interface Guide...')
    await page.locator('.fs-menu').click()
    await page.waitForTimeout(150)
    await page.locator('.hud-menu-item').first().click()
    await page.waitForSelector('[data-testid="interface-guide"]', { timeout: 8000 })
    await page.locator('[data-testid="interface-guide"]').evaluate((el) => el.scrollIntoView({ block: 'start' }))
    await page.waitForTimeout(300)

    console.log('Capturing regenerated guide icons...')
    const guideShots = {}
    const rows = page.locator('[data-testid="interface-guide"] .fs-guide-row')
    const rowCount = await rows.count()
    for (let i = 0; i < rowCount; i++) {
      const row = rows.nth(i)
      const nameText = (await row.locator('.fs-guide-name').innerText()).trim()
      const entry = ENTRIES.find((e) => e.guideName === nameText)
      if (!entry) continue
      const iconEl = row.locator('.fs-guide-icon')
      const p = join(tmpDir, `guide_${entry.guideName.replace(/\s+/g, '_')}.png`)
      await iconEl.screenshot({ path: p })
      guideShots[entry.guideName] = p
    }

    await browser.close()

    const missing = ENTRIES.filter((e) => !guideShots[e.guideName])
    if (missing.length) {
      throw new Error(`could not locate guide rows for: ${missing.map((m) => m.guideName).join(', ')}`)
    }

    console.log('Assembling proof grid...')
    const manifestPath = join(tmpDir, 'manifest.json')
    const rowsManifest = ENTRIES.map((e) => ({
      label: e.guideName,
      live: liveShots[e.guideName],
      guide: guideShots[e.guideName],
    }))
    writeFileSync(manifestPath, JSON.stringify(rowsManifest))

    const gridOut = join(OUT_DIR, 'proof-grid.png')
    const py = `
import json, sys
from PIL import Image, ImageDraw, ImageFont

with open(sys.argv[1]) as f:
    rows = json.load(f)
out_path = sys.argv[2]

LABEL_W = 220
CELL_W = 260
CELL_H = 180
PAD = 16
HEADER_H = 60
ROW_H = CELL_H + PAD

W = LABEL_W + CELL_W * 2 + PAD * 3
H = HEADER_H + ROW_H * len(rows) + PAD

canvas = Image.new('RGBA', (W, H), (14, 16, 26, 255))
draw = ImageDraw.Draw(canvas)

try:
    font_big = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 22)
    font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 16)
    font_small = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 13)
except Exception:
    font_big = ImageFont.load_default()
    font = ImageFont.load_default()
    font_small = ImageFont.load_default()

draw.text((PAD, 14), 'Interface Guide icons — regenerated vs live HUD (R2-7c)', font=font_big, fill=(230, 240, 250, 255))
draw.text((LABEL_W + PAD, HEADER_H - 22), 'LIVE HUD (in situ)', font=font_small, fill=(120, 220, 255, 255))
draw.text((LABEL_W + PAD + CELL_W + PAD, HEADER_H - 22), 'GUIDE ICON (regenerated)', font=font_small, fill=(120, 220, 255, 255))

y = HEADER_H
for row in rows:
    draw.text((PAD, y + CELL_H // 2 - 10), row['label'], font=font, fill=(255, 255, 255, 255))
    for col, key in enumerate(('live', 'guide')):
        im = Image.open(row[key]).convert('RGBA')
        im.thumbnail((CELL_W - 20, CELL_H - 20), Image.LANCZOS)
        cell_bg = Image.new('RGBA', (CELL_W, CELL_H), (26, 30, 44, 255))
        cx = LABEL_W + PAD + col * (CELL_W + PAD)
        ox = (CELL_W - im.width) // 2
        oy = (CELL_H - im.height) // 2
        cell_bg.paste(im, (ox, oy), im)
        canvas.paste(cell_bg, (cx, y))
    y += ROW_H

canvas = canvas.convert('RGB')
canvas.save(out_path, 'PNG')
print(f'wrote {out_path} ({W}x{H})')
`
    const res = spawnSync(VENV_PY, ['-c', py, manifestPath, gridOut], { stdio: 'inherit' })
    if (res.status !== 0) throw new Error('grid assembly failed')

    console.log(`proof grid: ${gridOut.replace(ROOT + '/', '')}`)
  } finally {
    server.kill()
    rmSync(tmpDir, { recursive: true, force: true })
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
