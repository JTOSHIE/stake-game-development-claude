// regen_interface_guide_icons.mjs — R2-7c (owner audit round 2, item c).
//
// Regenerates the 5 legacy interface-guide icon PNGs that are NOT part of the
// AssetForge v2 manifest-driven pipeline (scripts/assets/build.py /
// manifest.json only wires up feature_button.png + the brand/gauge/scene
// exports — see manifest.json's "exports" list). spin_button.png,
// btn_bet_plus.png, btn_bet_minus.png, btn_autoplay.png and btn_menu.png were
// legacy hand-placed PNGs that had never been regenerated from the CURRENT
// shipped HudOverlay.svelte chrome.
//
// Mechanism chosen: headless-browser screenshot-crop of the real, live
// rendered button (Playwright), NOT a new SVG master wired into build.py.
// Reason: HudOverlay's chrome (.fs-spin / .fs-auto / .fs-menu / .fs-arrow)
// is built from a conic-gradient bezel + radial-gradient face + layered
// box-shadow glows + drop-shadow-filtered SVG glyphs. conic-gradient has no
// SVG equivalent at all (SVG only has linearGradient/radialGradient), and
// cairosvg (the pipeline's renderer, see build.py) does not evaluate CSS
// filters/backdrop effects either — hand-authoring an SVG master would be a
// re-interpretation, not a faithful capture, of "the CURRENT live
// components" the brief asks for. So this is the documented fallback path.
//
// Technique: for each target button, walk its DOM ancestor chain up to
// <body>, hiding (visibility:hidden) every sibling at every level and
// clearing background on every ancestor — this prunes the whole page down to
// exactly the root-to-target path (works generically regardless of what
// background video/canvas/reel layers exist, without needing to name them).
// html/body backgrounds are cleared too, so a `page.screenshot({
// omitBackground: true })` of a small clip around the button's own
// bounding box yields a real alpha-transparent PNG of just that button +
// its own glow, matching the existing files' convention (RGBA, transparent
// corners, opaque button filling most of the frame — verified against the
// current committed icons before writing this script).
//
// Padding-to-square + resize-to-200x200 (the 5 files' existing pixel size,
// confirmed via `sips -g pixelWidth -g pixelHeight`) is done with Pillow via
// the project's existing asset-pipeline venv (scripts/assets/.venv), the
// same library build.py itself uses for its procedural particle/plate work —
// kept out of Node so no new image dependency is added to package.json.
//
// Run (from frontend/): node scripts/regen_interface_guide_icons.mjs

import { chromium } from 'playwright'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createServer } from 'node:net'
import { spawn, spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const FRONTEND = join(__dirname, '..')
const ROOT = join(FRONTEND, '..')
const UI_DIR = join(FRONTEND, 'public', 'assets', 'themes', 'future-spinner', 'ui')
const VENV_PY = join(ROOT, 'scripts', 'assets', '.venv', 'bin', 'python')

const TARGETS = [
  { selector: '[data-testid="spin-button"]', out: 'spin_button.png', label: 'Spin' },
  { selector: 'button[aria-label="Increase bet"]', out: 'btn_bet_plus.png', label: 'Increase Bet' },
  { selector: 'button[aria-label="Decrease bet"]', out: 'btn_bet_minus.png', label: 'Decrease Bet' },
  { selector: '.fs-auto', out: 'btn_autoplay.png', label: 'Autoplay' },
  { selector: '.fs-menu', out: 'btn_menu.png', label: 'Menu' },
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

// Prunes the DOM to exactly the root-to-target path (see header comment) and
// clears backgrounds along the chain. Returns nothing; state lives in the
// page under window.__iso for the paired restore() call.
async function isolate(page, selector) {
  await page.evaluate((sel) => {
    const target = document.querySelector(sel)
    if (!target) throw new Error('isolate: target not found: ' + sel)
    const touched = []
    let el = target
    while (el && el !== document.documentElement) {
      const parent = el.parentElement
      if (parent) {
        for (const sib of Array.from(parent.children)) {
          if (sib !== el) {
            touched.push([sib, 'visibility', sib.style.visibility])
            sib.style.visibility = 'hidden'
          }
        }
      }
      touched.push([el, 'background', el.style.background])
      el.style.background = 'transparent'
      el = parent
    }
    touched.push([document.documentElement, 'background', document.documentElement.style.background])
    touched.push([document.body, 'background', document.body.style.background])
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
    window.__iso = touched
  }, selector)
}

async function restore(page) {
  await page.evaluate(() => {
    const touched = window.__iso || []
    for (const [el, prop, prev] of touched) {
      if (!el) continue
      if (prev) el.style[prop] = prev
      else el.style.removeProperty(prop)
    }
    window.__iso = null
  })
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

async function captureIcon(page, tmpDir, target) {
  const box = await page.locator(target.selector).boundingBox()
  if (!box) throw new Error(`no bounding box for ${target.selector}`)

  await isolate(page, target.selector)

  // Small margin: enough to keep box-shadow/drop-shadow glow bleed (the
  // largest, .fs-spin, has a 14px shadow blur + 12px ring glow + 6px glyph
  // drop-shadow) without drowning the button in transparent padding — the
  // committed icons this replaces fill almost the whole 200x200 frame (their
  // content bbox spans edge-to-edge to within ~8-16px), so the crop stays
  // tight to match that convention.
  const margin = clamp(Math.round(0.18 * Math.max(box.width, box.height)), 12, 22)
  const clip = {
    x: Math.max(0, box.x - margin),
    y: Math.max(0, box.y - margin),
    width: box.width + margin * 2,
    height: box.height + margin * 2,
  }

  const rawPath = join(tmpDir, target.out)
  await page.screenshot({ path: rawPath, clip, omitBackground: true })
  await restore(page)

  const outPath = join(UI_DIR, target.out)
  const py = `
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert('RGBA')
w, h = im.size
side = max(w, h)
canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
canvas.paste(im, ((side - w) // 2, (side - h) // 2), im)
canvas = canvas.resize((200, 200), Image.LANCZOS)
canvas.save(sys.argv[2], 'PNG')
`
  const res = spawnSync(VENV_PY, ['-c', py, rawPath, outPath], { stdio: 'inherit' })
  if (res.status !== 0) throw new Error(`Pillow post-process failed for ${target.out}`)
  console.log(`  wrote ${outPath.replace(ROOT + '/', '')} (source crop ${Math.round(clip.width)}x${Math.round(clip.height)} from live ${target.selector})`)
}

async function run() {
  mkdirSync(UI_DIR, { recursive: true })
  const tmpDir = mkdtempSync(join(tmpdir(), 'fs-icon-regen-'))

  const port = await getFreePort()
  const server = await startDevServer(port)
  try {
    const browser = await chromium.launch()
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
    await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle' })
    await page.waitForSelector('[data-testid="spin-button"]', { timeout: 15000 })
    await page.waitForFunction(() => window.__testStores?.balance, { timeout: 8000 })
    await dismissIntro(page)

    // High balance + a mid-ladder bet so both bet-stepper arrows render
    // enabled (bright cyan chevron) rather than the disabled/greyscale state
    // — the guide icon should show the button as normally seen, not disabled.
    await page.evaluate(() => {
      window.__testStores.balance.set(1_000_000)
      window.__testStores.betAmount.set(5)
    })
    await page.waitForTimeout(250)

    console.log('Capturing interface-guide icons from the live HUD:')
    for (const target of TARGETS) {
      await captureIcon(page, tmpDir, target)
    }

    await browser.close()
    console.log(`done: ${TARGETS.length} icons regenerated in ${UI_DIR.replace(ROOT + '/', '')}`)
  } finally {
    server.kill()
    rmSync(tmpDir, { recursive: true, force: true })
  }
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
