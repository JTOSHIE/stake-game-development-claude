// delivery_set_gate.mjs - M03 of reports/qa/session3/MECHANISMS.md.
// Session 4a, 2026-07-29. Run (from the repository root):
//   node scripts/qa/delivery_set_gate.mjs --self-test
//   node scripts/qa/delivery_set_gate.mjs
//
// EIGHT platform requirements had no proof path and all eight are properties of
// one read-only walk of design-system/archive/delivery/ plus the kit payload
// layout. Session 3's register called this "the cheapest large win left"
// because the four delivery files and their hashes are already committed.
//
//   REQ-164  background plus foreground total 3MB or less as a PAIR; the
//            provider logo is NOT part of that sum
//   REQ-169  foreground is a high resolution PNG with a genuine alpha channel;
//            JPG is not acceptable
//   REQ-170  name the foreground <GameTitle>-FG.png
//   REQ-171  supply the studio's official PROVIDER logo, not the game logo or
//            a wordmark variant
//   REQ-172  provider logo is a high resolution PNG with a genuine alpha
//            channel, same class as the foreground
//   REQ-173  name the logo <ProviderName>-Logo.png, provider name first
//   REQ-174  the provider logo stays readable scaled down to tile size, so
//            thin strokes and small detail survive
//   REQ-176  at submission, upload the CONTENTS of dist/, not the folder itself
//
// ── WHY THE PNG IS DECODED RATHER THAN TRUSTED ──────────────────────────────
//
// "A genuine alpha channel" is not a file extension and it is not the IHDR
// colour type either. A PNG can be written as RGBA with every alpha byte set to
// 255, which is an opaque image wearing an alpha channel, and it is exactly what
// a naive "save as PNG" from a flattened composite produces. That file passes
// any check that reads only the header, and it fails at the platform, where the
// foreground is composited over the background and arrives as an opaque
// rectangle covering it.
//
// So this decodes the alpha plane: IHDR, the concatenated IDAT, one inflate and
// the five PNG scanline filters. About sixty lines, no dependency, and CI needs
// no image library. Node's zlib is the only thing it leans on.
//
// ── REQ-174, AND ITS THRESHOLD, WHICH IS DERIVED RATHER THAN CHOSEN ─────────
//
// "Readable at tile size" is a judgement, and a gate that invents a legibility
// score would be the wrongly-solved failure convention (l.6) names. What IS a
// property, and is the mechanism BEHIND the requirement's own stated concern
// ("so thin strokes and small detail" survive), is ALPHA COVERAGE RETENTION.
//
// Box-average the alpha plane down to the width a provider logo occupies on a
// tile, then compare the fraction of pixels that remain substantially opaque.
// A stroke thinner than one destination pixel averages down below the opacity
// threshold and disappears, so its coverage collapses. A logo built from solid
// masses keeps almost all of its coverage. The measured retention of the
// shipped mark is recorded beside the threshold below, so a later reader can
// see the margin rather than trust the number.
//
// This does NOT claim to measure legibility. It measures the one failure mode
// the requirement names, and it says so.

import { readFileSync, existsSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { inflateSync, deflateSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', '..')

// ── The delivery set, as the platform names it ───────────────────────────────
//
// GAME_TITLE and PROVIDER_NAME are the two halves of the platform's naming
// rule, quoted from docs/stake-engine-live/game-tile-requirements.md via
// design-system/archive/delivery/README.md, which records the mapping.

const DELIVERY_DIR = 'design-system/archive/delivery'
const GAME_TITLE = 'FutureSpinner'
const PROVIDER_NAME = 'WeRollSpinners'

/** The platform's stated ceiling for background plus foreground, in bytes. */
const PAIR_CEILING = 3 * 1024 * 1024

/**
 * S2-C113. The provider mark master, which the delivered logo must BE.
 *
 * Named as a PATH rather than as a recorded hash, per convention (s): a hash
 * written into this file is a value that changes captured in an instruction,
 * and it would go stale the first time the mark is legitimately re-exported.
 * Deriving it from the single source at read time cannot go stale.
 */
const PROVIDER_MASTER = join(ROOT,
  'design-system/archive/provider_mark/provider_mark_f-owner-transparent_master_1024.png')

/**
 * The width a provider logo occupies on a tile. The published tile geometry is
 * 408x546 (docs/stake-engine-live/2026-07-26/published-tile-geometry.md,
 * measured across live published assets); a provider mark sits at roughly a
 * quarter of that width, so 96 pixels is the destination size used here.
 */
const TILE_LOGO_WIDTH = 96

/** Alpha at or above this counts as substantially opaque. */
const OPAQUE = 128

/**
 * Minimum share of full-size coverage that must survive the downscale.
 * DERIVED, not chosen: the shipped mark retains the figure printed by this
 * gate on every run, and a one-pixel stroke at 1024 wide averages to alpha 21
 * at 96 wide, which is far below OPAQUE and takes its coverage to zero. The
 * threshold sits between those two, nearer the failure, so it catches a mark
 * rebuilt from hairlines without failing an honest redraw.
 */
const MIN_COVERAGE_RETENTION = 0.5

/** Minimum share of the image that must be transparent for alpha to be real. */
const MIN_TRANSPARENT_SHARE = 0.01

// ── A minimal PNG alpha reader ───────────────────────────────────────────────

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function unfilter(ft, line, prev, bpp) {
  const n = line.length
  if (ft === 0) return
  if (ft === 1) { for (let i = bpp; i < n; i++) line[i] = (line[i] + line[i - bpp]) & 255; return }
  if (ft === 2) { for (let i = 0; i < n; i++) line[i] = (line[i] + prev[i]) & 255; return }
  if (ft === 3) {
    for (let i = 0; i < n; i++) {
      const a = i >= bpp ? line[i - bpp] : 0
      line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
    }
    return
  }
  if (ft === 4) {
    for (let i = 0; i < n; i++) {
      const a = i >= bpp ? line[i - bpp] : 0
      const b = prev[i]
      const c = i >= bpp ? prev[i - bpp] : 0
      const p = a + b - c
      const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
      line[i] = (line[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255
    }
    return
  }
  throw new Error(`unknown PNG filter type ${ft}`)
}

/**
 * Returns { w, h, colourType, alpha } where alpha is a w*h byte plane, or
 * { error } for anything this reader will not claim to understand. It refuses
 * rather than guesses: a gate that silently treats an unreadable file as
 * passing is the failure convention (p) exists to prevent.
 */
export function readPngAlpha(buf) {
  if (buf.length < 33 || !buf.subarray(0, 8).equals(PNG_MAGIC)) return { error: 'not a PNG' }
  if (buf.toString('ascii', 12, 16) !== 'IHDR') return { error: 'no IHDR' }
  const w = buf.readUInt32BE(16)
  const h = buf.readUInt32BE(20)
  const bitDepth = buf[24]
  const colourType = buf[25]
  const interlace = buf[28]
  if (bitDepth !== 8) return { error: `bit depth ${bitDepth} not supported by this reader` }
  if (interlace !== 0) return { error: 'interlaced PNG not supported by this reader' }
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colourType]
  if (!channels) return { error: `colour type ${colourType} not supported by this reader` }

  const idat = []
  let off = 8
  while (off + 8 <= buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    if (type === 'IDAT') idat.push(buf.subarray(off + 8, off + 8 + len))
    if (type === 'IEND') break
    off += 12 + len
  }
  if (!idat.length) return { error: 'no IDAT' }

  let raw
  try { raw = inflateSync(Buffer.concat(idat)) } catch (e) { return { error: `IDAT inflate failed: ${e.message}` } }

  const stride = w * channels
  if (raw.length < h * (stride + 1)) return { error: 'truncated image data' }

  const alpha = Buffer.alloc(w * h, 255)
  let prev = Buffer.alloc(stride)
  let p = 0
  for (let y = 0; y < h; y++) {
    const ft = raw[p++]
    const line = Buffer.from(raw.subarray(p, p + stride))
    p += stride
    unfilter(ft, line, prev, channels)
    if (colourType === 6) for (let x = 0; x < w; x++) alpha[y * w + x] = line[x * 4 + 3]
    else if (colourType === 4) for (let x = 0; x < w; x++) alpha[y * w + x] = line[x * 2 + 1]
    prev = line
  }
  return { w, h, colourType, alpha }
}

/** Share of the plane that is substantially transparent. */
function transparentShare(img) {
  let n = 0
  for (let i = 0; i < img.alpha.length; i++) if (img.alpha[i] < OPAQUE) n++
  return n / img.alpha.length
}

/**
 * Coverage retained after a box-average downscale to `destW`. Returns
 * { full, small, retention }, each coverage being the share of pixels at or
 * above OPAQUE.
 */
export function coverageRetention(img, destW) {
  const scale = img.w / destW
  const destH = Math.max(1, Math.round(img.h / scale))
  let full = 0
  for (let i = 0; i < img.alpha.length; i++) if (img.alpha[i] >= OPAQUE) full++
  full /= img.alpha.length

  let small = 0
  for (let y = 0; y < destH; y++) {
    const y0 = Math.floor(y * scale), y1 = Math.min(img.h, Math.max(y0 + 1, Math.floor((y + 1) * scale)))
    for (let x = 0; x < destW; x++) {
      const x0 = Math.floor(x * scale), x1 = Math.min(img.w, Math.max(x0 + 1, Math.floor((x + 1) * scale)))
      let sum = 0, count = 0
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { sum += img.alpha[yy * img.w + xx]; count++ }
      if (count && sum / count >= OPAQUE) small++
    }
  }
  small /= destW * destH
  return { full, small, retention: full > 0 ? small / full : 0 }
}

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex')

// ── The predicate, extracted so the self-test can seed it directly ───────────
//
// It takes a FILE MAP rather than reading the directory, which is the only way
// a seeded defect can be planted without writing into a committed evidence
// directory. Convention (h.1): this gate never writes to the tree.

/**
 * @param files    { name -> Buffer } the delivery directory as read
 * @param kitSrc   the text of scripts/kit_build.mjs
 * @param distRoot { hasIndexAtRoot: boolean, present: boolean }
 */
export function auditDelivery(files, kitSrc, distRoot, providerMasterPath = PROVIDER_MASTER) {
  const out = []
  const add = (req, klass, detail) => out.push({ req, klass, detail })

  const fgName = `${GAME_TITLE}-FG.png`
  const bgNames = [`${GAME_TITLE}-BG.jpg`, `${GAME_TITLE}-BG.png`]
  const logoName = `${PROVIDER_NAME}-Logo.png`

  // REQ-170 and REQ-173: the two naming rules, checked as names rather than as
  // "a file that looks like a foreground". A misnamed file is the defect.
  if (!files[fgName]) {
    add('REQ-170', 'NAME', `no foreground named ${fgName}; the platform rule is <GameTitle>-FG.png`)
  }
  if (!files[logoName]) {
    add('REQ-173', 'NAME', `no provider logo named ${logoName}; the platform rule is <ProviderName>-Logo.png, provider name first`)
  }

  const bgName = bgNames.find((n) => files[n])
  if (!bgName) add('REQ-164', 'NAME', `no background named ${bgNames.join(' or ')}`)

  // REQ-164: the PAIR, and only the pair. The provider logo is excluded on the
  // platform's own wording, which the delivery README quotes; including it
  // would be a stricter gate than the requirement and would fail honestly
  // compliant sets.
  if (bgName && files[fgName]) {
    const pair = files[bgName].length + files[fgName].length
    if (pair > PAIR_CEILING) {
      add('REQ-164', 'SIZE', `background plus foreground is ${(pair / 1024 / 1024).toFixed(2)}MB against the 3MB ceiling`)
    }
  }

  // REQ-169 and REQ-172: a genuine alpha channel, decoded rather than inferred.
  for (const [req, name, role] of [['REQ-169', fgName, 'foreground'], ['REQ-172', logoName, 'provider logo']]) {
    const buf = files[name]
    if (!buf) continue
    if (buf.subarray(0, 8).equals(Buffer.from([0xff, 0xd8, 0xff, 0xe0])) || !buf.subarray(0, 8).equals(PNG_MAGIC)) {
      add(req, 'FORMAT', `the ${role} is not a PNG; JPG is not acceptable for this slot`)
      continue
    }
    const img = readPngAlpha(buf)
    if (img.error) { add(req, 'UNREADABLE', `the ${role} could not be decoded: ${img.error}`); continue }
    if (img.colourType !== 6 && img.colourType !== 4) {
      add(req, 'NO_ALPHA_CHANNEL', `the ${role} is PNG colour type ${img.colourType}, which carries no alpha channel at all`)
      continue
    }
    const share = transparentShare(img)
    if (share < MIN_TRANSPARENT_SHARE) {
      add(req, 'ALPHA_NOT_GENUINE',
        `the ${role} declares an alpha channel but only ${(share * 100).toFixed(2)}% of it is transparent, so it is an opaque image wearing an alpha channel`)
    }
  }

  // REQ-171: the PROVIDER logo, not the game logo or the tile.
  //
  // S2-C113. THIS CHECK USED TO BE ONLY THE NEGATIVE HALF BELOW, AND THE
  // NEGATIVE HALF IS BLIND TO THE DEFECT IT IS NAMED FOR. It fires only when
  // the logo is byte-identical to ANOTHER FILE IN THE SAME DELIVERY, so it
  // catches "the same file was copied into two slots" and nothing else. Drop
  // the GAME logo into the provider slot, which is the defect REQ-171 exists
  // to catch, and if no sibling happens to match it the audit returns clean.
  // Measured, not argued: substituting frontend/public/assets/ui/
  // logo_future_spinner.png into the logo slot produced ZERO findings, from
  // this check and from every other check in this file.
  //
  // The positive assertion is what closes it. The delivered provider logo must
  // BE the provider mark master, byte for byte. That is decidable rather than
  // a judgement, and unlike the sibling comparison it does not depend on what
  // else happens to be in the delivery.
  if (files[logoName]) {
    const logoHash = sha256(files[logoName])

    if (!existsSync(providerMasterPath)) {
      add('REQ-171', 'MASTER_ABSENT',
        `the provider mark master is absent at ${providerMasterPath}, so the delivered logo `
          + 'cannot be checked against it and this gate cannot honestly claim REQ-171')
    } else {
      const masterHash = sha256(readFileSync(providerMasterPath))
      if (logoHash !== masterHash) {
        add('REQ-171', 'WRONG_ARTWORK',
          `the delivered provider logo is not the provider mark master: delivery is ${logoHash.slice(0, 16)}, `
            + `master ${masterHash.slice(0, 16)}. The slot holds something other than the studio's mark`)
      }
    }

    // The original negative half, kept. It catches a different failure, two
    // slots holding one file, and convention (l.4) is the reason to keep both:
    // they read different inputs, so one cannot inherit the other's blind spot.
    for (const [name, buf] of Object.entries(files)) {
      if (name === logoName) continue
      if (sha256(buf) === logoHash) {
        add('REQ-171', 'WRONG_ARTWORK', `the provider logo is byte-identical to ${name}, so the slot holds the game artwork rather than the studio's provider mark`)
      }
    }
  }

  // REQ-174: coverage retention at tile size.
  if (files[logoName]) {
    const img = readPngAlpha(files[logoName])
    if (!img.error && (img.colourType === 6 || img.colourType === 4)) {
      const c = coverageRetention(img, TILE_LOGO_WIDTH)
      if (c.retention < MIN_COVERAGE_RETENTION) {
        add('REQ-174', 'DETAIL_LOST',
          `the provider logo retains only ${(c.retention * 100).toFixed(1)}% of its coverage at ${TILE_LOGO_WIDTH}px, against a ${(MIN_COVERAGE_RETENTION * 100).toFixed(0)}% floor: thin strokes vanish at tile size`)
      }
    }
  }

  // REQ-176: the CONTENTS of dist, not the folder. Two halves, because either
  // alone can be true while the requirement is broken.
  if (distRoot.present && !distRoot.hasIndexAtRoot) {
    add('REQ-176', 'PAYLOAD_SHAPE', 'dist/index.html is not at the root of dist, so "the contents of dist" would not put the entry point where the platform expects it')
  }
  if (!/cpSync\(\s*dist\s*,/.test(kitSrc)) {
    add('REQ-176', 'KIT_LAYOUT', 'the kit builder no longer copies dist itself into the upload payload, so the payload may carry a nested dist/ folder rather than its contents')
  }

  return out
}

// ── Reading the real tree ────────────────────────────────────────────────────

function liveFiles() {
  const dir = join(ROOT, DELIVERY_DIR)
  const files = {}
  for (const name of [
    `${GAME_TITLE}-BG.jpg`, `${GAME_TITLE}-FG.png`,
    `${GAME_TITLE}-Tile.png`, `${PROVIDER_NAME}-Logo.png`,
  ]) {
    const p = join(dir, name)
    if (existsSync(p) && statSync(p).isFile()) files[name] = readFileSync(p)
  }
  return files
}

const liveKitSrc = () => readFileSync(join(ROOT, 'scripts', 'kit_build.mjs'), 'utf8')

function liveDistRoot() {
  const dist = join(ROOT, 'frontend', 'dist')
  if (!existsSync(dist)) return { present: false, hasIndexAtRoot: false }
  return { present: true, hasIndexAtRoot: existsSync(join(dist, 'index.html')) }
}

// ── Convention (p): the seeded self-test ─────────────────────────────────────

function selfTest() {
  let failures = 0
  let seedCount = 0
  let controlCount = 0
  const clean = liveFiles()
  const kitSrc = liveKitSrc()
  const distRoot = { present: true, hasIndexAtRoot: true }

  // Counted rather than recited. The summary line used to carry the literal
  // "11 seeds, 5 paired controls", and adding two seeds made it false the
  // moment they landed. Convention (s): a value that changes is never written
  // into a sentence, it is derived from its single source at read time.
  const run = (name, expect, build, masterPath = PROVIDER_MASTER) => {
    if (/^SEED/.test(name)) seedCount++
    else if (/^CONTROL/.test(name)) controlCount++
    const [f, k, d] = build()
    const found = auditDelivery(f, k, d, masterPath)
    const ok = expect === 0 ? found.length === 0 : found.length >= expect
    if (ok) console.log(`  ok   ${name}`)
    else {
      failures++
      console.error(`  FAIL ${name}\n    expected ${expect ? '>= ' + expect : '0'} findings, got ${found.length}`)
      for (const x of found) console.error(`      ${x.req} ${x.klass}: ${x.detail}`)
    }
  }
  const copy = () => ({ ...clean })

  // A real opaque-alpha PNG, built here rather than described, because
  // "declares RGBA but every alpha byte is 255" is the exact defect REQ-169 and
  // REQ-172 exist to catch and a hand-made array would not exercise the reader.
  const opaqueRgbaPng = makeRgbaPng(64, 64, () => 255)
  // A hairline mark: one-pixel strokes on a 1024 grid, which is what a logo
  // rebuilt from a vector outline at the wrong stroke weight looks like.
  const hairlinePng = makeRgbaPng(1024, 1024, (x, y) => (x % 64 === 0 || y % 64 === 0 ? 255 : 0))

  console.log('\nSEEDS, each the defect its requirement exists to prevent')

  run('SEED 1  a foreground delivered as JPG is caught', 1, () => {
    const f = copy()
    delete f[`${GAME_TITLE}-FG.png`]
    f[`${GAME_TITLE}-FG.jpg`] = clean[`${GAME_TITLE}-BG.jpg`]
    return [f, kitSrc, distRoot]
  })

  run('SEED 2  a foreground misnamed against <GameTitle>-FG.png is caught', 1, () => {
    const f = copy()
    f['foreground.png'] = f[`${GAME_TITLE}-FG.png`]
    delete f[`${GAME_TITLE}-FG.png`]
    return [f, kitSrc, distRoot]
  })

  run('SEED 3  a logo named <Logo>-WeRollSpinners.png, order reversed, is caught', 1, () => {
    const f = copy()
    f['Logo-WeRollSpinners.png'] = f[`${PROVIDER_NAME}-Logo.png`]
    delete f[`${PROVIDER_NAME}-Logo.png`]
    return [f, kitSrc, distRoot]
  })

  run('SEED 4  an RGBA logo whose alpha is entirely opaque is caught', 1, () => {
    const f = copy()
    f[`${PROVIDER_NAME}-Logo.png`] = opaqueRgbaPng
    return [f, kitSrc, distRoot]
  })

  run('SEED 5  an RGBA foreground whose alpha is entirely opaque is caught', 1, () => {
    const f = copy()
    f[`${GAME_TITLE}-FG.png`] = opaqueRgbaPng
    return [f, kitSrc, distRoot]
  })

  run('SEED 6  the background and foreground pair breaking 3MB is caught', 1, () => {
    const f = copy()
    f[`${GAME_TITLE}-BG.jpg`] = Buffer.alloc(2.9 * 1024 * 1024)
    return [f, kitSrc, distRoot]
  })

  run('SEED 7  the game tile copied into the provider logo slot is caught', 1, () => {
    const f = copy()
    f[`${PROVIDER_NAME}-Logo.png`] = f[`${GAME_TITLE}-Tile.png`]
    return [f, kitSrc, distRoot]
  })

  run('SEED 8  a hairline logo that vanishes at tile size is caught', 1, () => {
    const f = copy()
    f[`${PROVIDER_NAME}-Logo.png`] = hairlinePng
    return [f, kitSrc, distRoot]
  })

  run('SEED 9  a kit builder that stops copying dist into the payload is caught', 1, () =>
    [copy(), kitSrc.replace(/cpSync\(\s*dist\s*,/, 'cpSync(join(fe),'), distRoot])

  run('SEED 10 a dist with no index.html at its root is caught', 1, () =>
    [copy(), kitSrc, { present: true, hasIndexAtRoot: false }])

  run('SEED 11 a truncated, undecodable PNG is REPORTED, not skipped', 1, () => {
    const f = copy()
    f[`${PROVIDER_NAME}-Logo.png`] = clean[`${PROVIDER_NAME}-Logo.png`].subarray(0, 200)
    return [f, kitSrc, distRoot]
  })

  // S2-C113. THE SEED THAT USED TO RETURN CLEAN. The GAME logo dropped into the
  // PROVIDER slot is the defect REQ-171 is named for, and before the positive
  // master comparison was added this produced ZERO findings from the whole
  // file: the old sibling-identity check only fires when the logo matches
  // ANOTHER DELIVERED FILE, and the game logo matches none of them.
  //
  // The artwork is a real file from this repository rather than a synthesised
  // PNG, because the defect is a real file being copied into the wrong slot and
  // a generated image would not exercise the comparison the same way.
  run('SEED 12 the GAME logo in the PROVIDER slot is caught', 1, () => {
    const f = copy()
    const gameLogo = join(ROOT, 'frontend', 'public', 'assets', 'ui', 'logo_future_spinner.png')
    if (!existsSync(gameLogo)) {
      throw new Error(`SEED 12 ANCHOR LOST: ${gameLogo} is absent, so this seed would prove nothing`)
    }
    f[`${PROVIDER_NAME}-Logo.png`] = readFileSync(gameLogo)
    return [f, kitSrc, distRoot]
  })

  // Paired with SEED 12: the check must depend on the master actually being
  // there. A comparison against an absent file that quietly passes would be the
  // same blindness one level up.
  run('SEED 13 an absent provider mark master is REPORTED, not skipped', 1, () => [
    copy(), kitSrc, distRoot,
  ], join(ROOT, 'design-system', 'brand', 'provider_mark', 'does-not-exist.png'))

  console.log('\nNEGATIVE CONTROLS, each PAIRED with a seed above')

  // CONTROL 1, paired with every seed. Without it, all eleven above are
  // satisfied by a gate that flags everything it is handed.
  run('CONTROL 1  the committed delivery set is NOT flagged', 0, () => [copy(), kitSrc, distRoot])

  // CONTROL 2, paired with SEEDS 4, 5 and 8. The shipped logo really is RGBA
  // with real transparency and really does survive the downscale. If this ever
  // fails, the seeds are proving nothing about the shipped artwork.
  run('CONTROL 2  the shipped logo has genuine alpha AND survives tile size', 0, () => {
    const img = readPngAlpha(clean[`${PROVIDER_NAME}-Logo.png`])
    if (img.error) throw new Error(`control 2 cannot read the shipped logo: ${img.error}`)
    if (transparentShare(img) < MIN_TRANSPARENT_SHARE) throw new Error('control 2 no longer exercises genuine alpha')
    if (coverageRetention(img, TILE_LOGO_WIDTH).retention < MIN_COVERAGE_RETENTION) {
      throw new Error('control 2 no longer exercises coverage retention')
    }
    return [copy(), kitSrc, distRoot]
  })

  // CONTROL 3, paired with SEED 6. The BACKGROUND is a JPG and must stay legal:
  // the platform's format rule binds the foreground and the logo, not the
  // background. A gate demanding PNG everywhere would be red on the clean tree.
  run('CONTROL 3  a JPG BACKGROUND is legal and is NOT flagged', 0, () => {
    const f = copy()
    if (!f[`${GAME_TITLE}-BG.jpg`]) throw new Error('control 3 no longer exercises the JPG background')
    return [f, kitSrc, distRoot]
  })

  // CONTROL 4, paired with SEED 6. The provider logo is EXCLUDED from the 3MB
  // pair on the platform's own wording. A logo large enough to break the sum if
  // it were counted must still pass.
  run('CONTROL 4  a large provider logo does NOT count against the 3MB pair', 0, () => {
    const f = copy()
    f[`${PROVIDER_NAME}-Logo.png`] = clean[`${PROVIDER_NAME}-Logo.png`]
    f[`${GAME_TITLE}-BG.jpg`] = Buffer.alloc(1.4 * 1024 * 1024)
    f[`${GAME_TITLE}-FG.png`] = clean[`${GAME_TITLE}-FG.png`]
    return [f, kitSrc, distRoot]
  })

  // CONTROL 5, paired with SEED 10. An ABSENT dist is not a failure: the
  // delivery half of this gate runs before any build, and reporting a missing
  // build as a requirement breach would make the gate red for the wrong reason.
  run('CONTROL 5  an absent dist is not reported as a payload breach', 0, () =>
    [copy(), kitSrc, { present: false, hasIndexAtRoot: false }])

  if (failures) { console.error(`\nDELIVERY SET SELF-TEST: FAIL (${failures})`); process.exit(1) }
  console.log(`\nDELIVERY SET SELF-TEST: PASS (${seedCount} seeds, ${controlCount} paired controls)`)
}

/** Build a real, inflate-able RGBA PNG so seeds exercise the decoder. */
function makeRgbaPng(w, h, alphaAt) {
  const raw = Buffer.alloc(h * (w * 4 + 1))
  let p = 0
  for (let y = 0; y < h; y++) {
    raw[p++] = 0
    for (let x = 0; x < w; x++) {
      raw[p++] = 200; raw[p++] = 200; raw[p++] = 200; raw[p++] = alphaAt(x, y)
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0)
    return Buffer.concat([len, body, crc])
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  return Buffer.concat([
    PNG_MAGIC, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ])
}

let CRC_TABLE = null
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      CRC_TABLE[n] = c
    }
  }
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return c ^ 0xffffffff
}

// ── Entry ────────────────────────────────────────────────────────────────────

if (process.argv.includes('--self-test')) {
  selfTest()
} else {
  const files = liveFiles()
  const findings = auditDelivery(files, liveKitSrc(), liveDistRoot())

  console.log(`\nDELIVERY SET, ${DELIVERY_DIR}`)
  for (const [name, buf] of Object.entries(files)) {
    const img = buf.subarray(0, 8).equals(PNG_MAGIC) ? readPngAlpha(buf) : null
    const dims = img && !img.error ? `${img.w}x${img.h} type ${img.colourType}` : 'JPEG'
    console.log(`  ${name.padEnd(28)} ${String(Math.round(buf.length / 1024)).padStart(4)} KB  ${dims}`)
  }
  const logo = files[`${PROVIDER_NAME}-Logo.png`]
  if (logo) {
    const img = readPngAlpha(logo)
    if (!img.error) {
      const c = coverageRetention(img, TILE_LOGO_WIDTH)
      console.log(`  provider logo coverage retention at ${TILE_LOGO_WIDTH}px: ${(c.retention * 100).toFixed(1)}% (floor ${(MIN_COVERAGE_RETENTION * 100).toFixed(0)}%)`)
      console.log(`  provider logo transparent share: ${(transparentShare(img) * 100).toFixed(1)}%`)
    }
  }

  if (findings.length) {
    console.error(`\n${findings.length} finding(s):`)
    for (const f of findings) console.error(`  ${f.req} ${f.klass}: ${f.detail}`)
    console.error('\nDELIVERY SET: FAIL')
    process.exit(1)
  }
  console.log('\nDELIVERY SET: PASS')
}
