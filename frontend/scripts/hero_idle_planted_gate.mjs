#!/usr/bin/env node
/**
 * HERO IDLE PLANTED GATE: the resting hero's POSE may not animate; the layer
 * above him may float, translateY only, at or below the car's amplitude; the
 * reactions may crossfade; the idle may not.
 *
 * WHAT THIS GUARDS, AND WHY IT IS BEHAVIOURAL RATHER THAN A LIST OF NAMES.
 * The owner's ruling at R130 was that bad motion scores worse than a still, and R130 acted on it
 * by DELETING the idle flipbook, the 7.2s pendulum sway, the two-layer cross-dissolve and the
 * glance outright, freezing the hero on frame 01. The win unfold and the feature brace survive and
 * still play; those are reactions, not idle.
 *
 * AMENDED AT R138, ON THE OWNER'S OWN LATER RULING, which is exactly the caveat the first version
 * of this header recorded ("a gate cannot know an owner changed their mind, so what it encodes is
 * the ruling, not the taste"). After the live upload the owner ruled a completely still idle too
 * dead and ordered the float back, the same class as the car, with the fence holding everywhere
 * else. So the ruling this gate now encodes is R130 AS AMENDED BY R138:
 *
 *   - the POSE stays frozen: no rule reaching .hero-body, .hero-idle or .hero-cross at rest may
 *     animate or transform. The sheet still holds frame 01.
 *   - the WRAPPER may float: SceneGroup's .char-layer may reference keyframes whose transforms
 *     are translateY ONLY - no rotate (the pendulum stays dead), no translateX, no scale - and
 *     the float's amplitude must sit at or below the car's own, BOTH amplitudes derived from
 *     SceneGroup.svelte at gate time rather than from a number written in here (convention (s)).
 *     And the float must EXIST: R138's close is "float yes, tick no", so a deleted float is as
 *     much a regression now as a restored sway.
 *   - the REACTIONS may dissolve: .hero-cross, the crossfade's top buffer, is lawful ONLY behind
 *     a non-idle [data-motion=...] and only mounted inside {#if motion !== 'idle'}. An
 *     idle-reachable dissolve rule is a finding whatever its keyframes are called.
 *
 * THE GATE KEYS ON BEHAVIOUR, NOT ON THE RETIRED NAMES. Any selector that can match the hero
 * AT REST, and that carries an `animation`, `animation-name` or `transform` other than `none`, is a
 * finding whatever the keyframe is called. That is what makes seed 2 of the self-test meaningful:
 * it restores exactly the same pendulum under a BRAND-NEW name, `hero-drift-idle`, and a
 * name-matching gate would sail past it. Seed 7 hides the same rule inside an `@media (min-width)`
 * block, which a depth-limited walker would miss, so the rule walker is nesting-aware and drops
 * keyframe STEPS by their `@keyframes` ancestor rather than by depth. The float fence is
 * behaviour-keyed the same way: it resolves the keyframes .char-layer actually REFERENCES, so a
 * rotation smuggled back under a renamed keyframe (seed 12) is still caught.
 * Selectors carrying a non-idle `[data-motion=...]` are exempt: those are the reactions R130 kept.
 *
 * THE COMMENT TRAP, WHICH IS THE REASON THIS FILE EXISTS IN THIS SHAPE. HeroIdle.svelte's own prose
 * NAMES ALL FIVE retired keyframes and quotes the banned declaration `animation: hero-sway-idle
 * 7.2s` verbatim, because the file explains what was removed and why; SceneGroup.svelte's prose now
 * quotes the retired rotate values for the same reason. A grep-for-the-name gate is therefore a
 * permanent false positive on the very files it guards. Each component is split into CODE and
 * PROSE first (CSS block comments out of the style block, line and block comments out of the
 * script, HTML comments out of the markup) and only CODE is judged. The self-test carries negative
 * controls that plant the banned declarations inside comments and require silence, and it prints
 * how many of the five names the real file's prose actually contains, so the immunity is evidenced
 * on every run rather than asserted once.
 *
 * WHAT IT ALSO HOLDS: the R129 dissolve buffers (.hero-layer-a/.hero-layer-b, permanent and
 * shadow-carrying) must not return by name; exactly one element carries data-testid="hero-idle";
 * the script must not re-declare a `glance` state or reference the pruned hero_glance sheet; and
 * the three reduced-motion resets must keep their `!important`, which R130 added deliberately
 * after three specificity ties and which a tidy-up would strip as noise. The .hero-cross reset
 * must also force opacity 0, because stilling the fade without blanking the buffer would freeze a
 * half-transparent second frame over the rest pose.
 *
 * Run:
 *   node scripts/hero_idle_planted_gate.mjs
 *   node scripts/hero_idle_planted_gate.mjs --self-test
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const FILE = join(HERE, '..', 'src', 'lib', 'components', 'HeroIdle.svelte')
const SCENE_FILE = join(HERE, '..', 'src', 'lib', 'components', 'SceneGroup.svelte')

// ── 1. Split a component into CODE and PROSE, and scan only CODE ───────────
function sections(src) {
  const style = (src.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1]
  const script = (src.match(/<script[^>]*>([\s\S]*?)<\/script>/) || [, ''])[1]
  const markup = src.replace(/<style>[\s\S]*?<\/style>/, '').replace(/<script[^>]*>[\s\S]*?<\/script>/, '')
  return {
    styleCode: style.replace(/\/\*[\s\S]*?\*\//g, ' '),          // CSS comments
    scriptCode: script.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 '),
    markupCode: markup.replace(/<!--[\s\S]*?-->/g, ' '),          // HTML comments
    stylePROSE: (style.match(/\/\*[\s\S]*?\*\//g) || []).join('\n'),
  }
}

// ── 2. Nesting-aware rule walker over the comment-free CSS ───────────────
// Each frame keeps its OWN body, so a rule nested inside an @media is walked
// too. Keyframe STEPS are dropped by their @keyframes ancestor, not by depth.
function rules(css) {
  const out = []
  const stack = []
  let cur = ''
  for (const c of css) {
    if (c === '{') { stack.push({ sel: cur.trim(), body: '', anc: stack.map(f => f.sel) }); cur = '' }
    else if (c === '}') { const f = stack.pop(); if (!f) continue; f.body += cur; cur = ''; out.push(f) }
    else cur += c
  }
  return out.filter(f => f.sel && !f.sel.startsWith('@') && !f.anc.some(a => a.startsWith('@keyframes')))
}

// ── 2b. Keyframes extractor: name -> concatenated step bodies ────────────────
// The rule walker above deliberately DROPS keyframe steps; the float fence
// needs them, so this walks the same brace stream and keeps only frames whose
// ancestor chain contains `@keyframes <name>`.
function keyframes(css) {
  const out = {}
  const stack = []
  let cur = ''
  for (const c of css) {
    if (c === '{') { stack.push({ sel: cur.trim(), body: '', anc: stack.map(f => f.sel) }); cur = '' }
    else if (c === '}') {
      const f = stack.pop(); if (!f) continue
      f.body += cur; cur = ''
      const kf = [...f.anc].reverse().find(a => a.startsWith('@keyframes'))
      if (kf) {
        const name = kf.replace('@keyframes', '').trim()
        out[name] = (out[name] || '') + '\n' + f.body
      }
    }
    else cur += c
  }
  return out
}

// ── 2c. Animation names referenced by rules matching a selector pattern ──────
// Resolves the shorthand lexically: parenthesised groups (steps(...),
// cubic-bezier(...)) are collapsed first so their commas and spaces cannot
// split a token, then anything that is not a keyword, a time or a count is a
// keyframe name. Deliberately over-collects, like the css liveness gate: a
// stray token here means one extra keyframes lookup, while an under-collect is
// the exact miss the fence exists to prevent.
const ANIM_KEYWORDS = new Set(['none', 'infinite', 'normal', 'reverse', 'alternate', 'alternate-reverse',
  'forwards', 'backwards', 'both', 'running', 'paused', 'ease', 'ease-in', 'ease-out', 'ease-in-out',
  'linear', 'step-start', 'step-end'])
function referencedAnimations(R, selPattern) {
  const names = new Set()
  for (const r of R) {
    if (!r.sel.split(',').map(s => s.trim()).some(one => selPattern.test(one))) continue
    for (const d of decls(r.body)) {
      if (d.k !== 'animation' && d.k !== 'animation-name') continue
      const flat = d.v.replace(/!important/i, '').replace(/\([^)]*\)/g, '()')
      for (const part of flat.split(',')) {
        for (const tok of part.trim().split(/\s+/)) {
          if (!tok || tok.endsWith('()')) continue
          if (ANIM_KEYWORDS.has(tok.toLowerCase())) continue
          if (/^[\d.]+m?s$/.test(tok) || /^[\d.]+$/.test(tok)) continue
          names.add(tok)
        }
      }
    }
  }
  return names
}

const AT_REST = /\.hero-(body|idle|cross)\b/
const NON_IDLE_STATE = /\[data-motion\s*=\s*['"]?(?!idle)[a-z]+['"]?\]/

function decls(body) {
  return body.split(';').map(d => d.trim()).filter(Boolean).map(d => {
    const k = d.slice(0, d.indexOf(':')).trim().toLowerCase()
    const v = d.slice(d.indexOf(':') + 1).trim()
    return { k, v }
  })
}

// Largest |translateY| in px across a set of keyframe names, plus a flag for
// any transform function that is not translateY. Returns null amplitude when
// no named keyframe declares a transform at all.
function floatShape(kfMap, names) {
  let amp = null
  let foreign = []
  for (const name of names) {
    const body = kfMap[name]
    if (!body) continue
    for (const d of decls(body)) {
      if (d.k !== 'transform') continue
      const v = d.v.replace(/!important/i, '').trim()
      if (v === 'none') continue
      for (const m of v.matchAll(/([a-zA-Z]+)\(([^)]*)\)/g)) {
        const fn = m[1]
        if (fn !== 'translateY') { foreign.push(`${name}: ${fn}(${m[2]})`); continue }
        const px = Math.abs(parseFloat(m[2]))
        if (!Number.isNaN(px)) amp = Math.max(amp ?? 0, px)
      }
    }
  }
  return { amp, foreign }
}

function judge(src, sceneSrc) {
  const S = sections(src)
  const findings = []
  const R = rules(S.styleCode)

  // (a) at-rest-reachable rules must not animate or transform. This covers the
  // crossfade buffer too: a .hero-cross rule without a non-idle state qualifier
  // is reachable at rest, and an idle-reachable dissolve is exactly what R138
  // forbids.
  for (const r of R) {
    for (const one of r.sel.split(',').map(s => s.trim()).filter(Boolean)) {
      if (!AT_REST.test(one)) continue
      if (NON_IDLE_STATE.test(one)) continue           // a reaction rule, allowed
      for (const d of decls(r.body)) {
        const val = d.v.replace(/!important/i, '').trim()
        if ((d.k === 'animation' || d.k === 'animation-name') && val !== 'none' && val !== '') {
          findings.push(`at-rest selector \`${one}\` animates: ${d.k}: ${d.v}`)
        }
        if (d.k === 'transform' && val !== 'none') {
          findings.push(`at-rest selector \`${one}\` transforms: ${d.k}: ${d.v}`)
        }
      }
    }
  }

  // (b) the retired keyframes must not come back BY NAME (cheap, name-specific)
  const RETIRED = ['hero-sway-idle', 'hero-cycle-idle', 'hero-dissolve-in', 'hero-turn-glance', 'hero-cycle-glance']
  for (const name of RETIRED) {
    const re = new RegExp('@keyframes\\s+' + name + '\\b')
    if (re.test(S.styleCode)) findings.push(`retired keyframe \`@keyframes ${name}\` is back in the style block`)
  }

  // (c) the R129 dissolve buffers must not come back. R138's .hero-cross is a
  // different design (reaction-mounted, no shadow of its own) and is judged by
  // checks (a), (f) and (e+) rather than banned by name.
  for (const cls of ['hero-layer-a', 'hero-layer-b']) {
    if (new RegExp('\\bclass\\s*=\\s*["\'][^"\']*' + cls).test(S.markupCode) || new RegExp('\\.' + cls + '\\b').test(S.styleCode)) {
      findings.push(`dissolve buffer element \`.${cls}\` is back (markup or style)`)
    }
  }
  // exactly one element owns the sheet testid; the crossfade buffer is not it
  const sheets = (S.markupCode.match(/data-testid="hero-idle"/g) || []).length
  if (sheets !== 1) findings.push(`expected exactly 1 sheet element, found ${sheets}`)

  // (d) the glance state must not return through the script's sheet/frame maps
  if (/\bglance\b/.test(S.scriptCode)) findings.push('the script declares a `glance` state again')
  if (/hero_glance/.test(S.scriptCode) || /hero_glance/.test(S.markupCode)) findings.push('the pruned hero_glance sheet is referenced again')

  // (e) the accessibility floor must survive
  if (!/\.hero-idle\[data-motion\]\s*\{[^}]*animation:\s*none\s*!important/.test(S.styleCode))
    findings.push('the reduced-motion reset on .hero-idle[data-motion] is missing or lost its !important')
  if (!/\.hero-body\[data-motion\]\s*\{[^}]*animation:\s*none\s*!important/.test(S.styleCode))
    findings.push('the reduced-motion reset on .hero-body[data-motion] is missing or lost its !important')

  // (e+) the crossfade buffer's own floor: stilled AND blanked. If the markup
  // carries no .hero-cross at all this is not required (nothing to reset).
  const hasCross = /\bclass\s*=\s*["'][^"']*hero-cross/.test(S.markupCode)
  if (hasCross) {
    if (!/\.hero-cross\[data-motion\]\s*\{[^}]*animation:\s*none\s*!important[^}]*opacity:\s*0\s*!important/.test(S.styleCode))
      findings.push('the reduced-motion reset on .hero-cross[data-motion] is missing, lost its !important, or no longer blanks the buffer (opacity 0)')

    // (f) the crossfade buffer must be mount-gated on a non-idle motion, so the
    // idle cannot dissolve even if every CSS argument is lost to a future tie.
    if (!/\{#if motion !== 'idle'\}[\s\S]*?class\s*=\s*["'][^"']*hero-cross/.test(S.markupCode))
      findings.push(".hero-cross is no longer mounted inside {#if motion !== 'idle'}: the idle can reach the dissolve")
  }

  // (g) the float fence, judged on SceneGroup.svelte. R138 restored the wrapper
  // float as translateY only, at or below the car's amplitude, and R138's close
  // is "float yes, tick no" - so absence is a finding exactly as excess is.
  let floatEvidence = ''
  if (sceneSrc) {
    const G = sections(sceneSrc)
    const GR = rules(G.styleCode)
    const kf = keyframes(G.styleCode)
    const heroNames = referencedAnimations(GR, /\.char-layer\b/)
    const carNames = referencedAnimations(GR, /\.car-layer\b/)
    const hero = floatShape(kf, heroNames)
    const car = floatShape(kf, carNames)
    for (const f of hero.foreign) {
      findings.push(`the hero float's keyframes carry a non-translateY transform: ${f}`)
    }
    if (hero.amp === null || hero.amp === 0) {
      findings.push('the hero float is gone: no keyframe referenced by .char-layer declares a translateY (R138: float yes, tick no)')
    } else if (car.amp !== null && hero.amp > car.amp) {
      findings.push(`the hero float's amplitude (${hero.amp}px) exceeds the car's (${car.amp}px); R138 requires at or below`)
    }
    floatEvidence = `hero float ${hero.amp ?? 'none'}px vs car ${car.amp ?? 'none'}px, from ${[...heroNames].join('/') || 'no'} and ${[...carNames].join('/') || 'no'} keyframes`
  }

  return { findings, prose: S.stylePROSE, rules: R.length, floatEvidence }
}

// ── entry ────────────────────────────────────────────────────────────────────
const real = readFileSync(FILE, 'utf-8')
const realScene = readFileSync(SCENE_FILE, 'utf-8')

if (process.argv.includes('--self-test')) {
  console.log('HERO IDLE PLANTED GATE, seeded self-test\n')
  let bad = 0
  const check = (label, mutate, expectCatch, mutateScene) => {
    const { findings } = judge(mutate(real), mutateScene ? mutateScene(realScene) : realScene)
    const caught = findings.length > 0
    const ok = caught === expectCatch
    if (!ok) bad++
    console.log(`  ${ok ? (expectCatch ? 'caught' : 'clean ') : (expectCatch ? 'MISSED' : 'FALSE+')}  ${label}`)
    for (const f of findings.slice(0, 3)) console.log(`            ${f}`)
  }
  const id = s => s

  // SEED 1: the sway back, by its own name (R122's exact rule)
  check('seeded: R122 hero-sway-idle restored on .hero-body', s => s
    .replace('  .hero-body {\n    position: absolute;', '  @keyframes hero-sway-idle { 0%,100% { transform: rotate(-0.32deg) } 50% { transform: rotate(0.32deg) } }\n  .hero-body {\n    animation: hero-sway-idle 7.2s ease-in-out infinite;\n    position: absolute;'), true)

  // SEED 2: the SAME motion under a BRAND-NEW name - a name-only gate misses this
  check('seeded: the same pendulum under a new name (hero-drift-idle)', s => s
    .replace('  .hero-body {\n    position: absolute;', '  @keyframes hero-drift-idle { 0%,100% { transform: rotate(-0.32deg) } 50% { transform: rotate(0.32deg) } }\n  .hero-body {\n    animation: hero-drift-idle 7.2s ease-in-out infinite;\n    position: absolute;'), true)

  // SEED 3: the idle flipbook back on the sheet layer
  check('seeded: hero-cycle-idle flipbook restored on .hero-idle', s => s
    .replace(".hero-idle[data-motion='win']    {", "@keyframes hero-cycle-idle { from { background-position-x: 0 } to { background-position-x: var(--hero-span) } }\n  .hero-idle { animation: hero-cycle-idle 4.4s steps(6) infinite; }\n  .hero-idle[data-motion='win']    {"), true)

  // SEED 4: the R129 dual-buffer dissolve elements back in the markup
  check('seeded: .hero-layer-b dissolve buffer back in the markup', s => s
    .replace('<div\n    class="hero-idle"', '<div class="hero-layer-b" aria-hidden="true"></div>\n  <div\n    class="hero-idle"'), true)

  // SEED 5: the glance state back in the script
  check('seeded: the glance state back in the SHEET map', s => s
    .replace("const SHEET", "const GLANCE_SHEET = 'hero_glance_6f.png' // glance\n  const SHEET"), true)

  // SEED 6: the accessibility floor quietly weakened
  check('seeded: the reduced-motion reset loses its !important', s => s
    .replace('animation: none !important;\n      background-position-x: 0 !important;', 'animation: none;\n      background-position-x: 0;'), true)

  // SEED 7: the same pendulum HIDDEN INSIDE an @media block - a depth-only walker misses it
  check('seeded: hero drift restored inside an @media (min-width) block', s => s
    .replace('</style>', "  @media (min-width: 900px) {\n    @keyframes hero-drift-idle { 0%,100% { transform: rotate(-0.32deg) } 50% { transform: rotate(0.32deg) } }\n    .hero-body { animation: hero-drift-idle 7.2s ease-in-out infinite; }\n  }\n</style>"), true)

  // SEED 8: an IDLE-REACHABLE dissolve - the exact class R138 forbids. A bare
  // .hero-cross rule animates with no state qualifier, so the resting hero
  // would fade a second frame over himself.
  check('seeded: .hero-cross animates with no state qualifier (idle dissolve)', s => s
    .replace('  .hero-cross {\n    position: absolute;', '  .hero-cross {\n    animation: hero-cross-fade-win 1s linear infinite;\n    position: absolute;'), true)

  // SEED 9: the mount gate removed - the buffer exists at rest even though its
  // CSS is still reaction-scoped
  check("seeded: .hero-cross mounted outside {#if motion !== 'idle'}", s => s
    .replace("{#if motion !== 'idle'}", '{#if true}'), true)

  // SEED 10: the crossfade buffer's reduced-motion reset stops blanking it
  check('seeded: the .hero-cross reduced-motion reset loses opacity 0', s => s
    .replace('    .hero-cross[data-motion] {\n      animation: none !important;\n      opacity: 0 !important;\n    }', '    .hero-cross[data-motion] {\n      animation: none !important;\n    }'), true)

  // SEED 11: the R122 rotation restored INSIDE the float's own keyframes, the
  // exact form the old char-idle shipped
  check('seeded: rotate back inside the char-idle float keyframes', id, true, sc => sc
    .replace('50%      { transform: translateY(-3px); }', '50%      { transform: translateY(-3px) rotate(0.6deg); }'), )

  // SEED 12: the same pendulum under a RENAMED keyframe referenced from
  // .char-layer - behaviour-keyed, so the reference is what convicts it
  check('seeded: a renamed pendulum keyframe referenced by .char-layer', id, true, sc => sc
    .replace('animation: char-idle 5s ease-in-out infinite;', 'animation: char-drift 5s ease-in-out infinite;')
    .replace('@keyframes char-idle {', '@keyframes char-drift {\n    0%, 100% { transform: translateY(0) rotate(-0.6deg); }\n    50% { transform: translateY(-3px) rotate(0.6deg); }\n  }\n  @keyframes char-idle {'), )

  // SEED 13: the float's amplitude raised past the car's own
  check('seeded: the float amplitude raised above the car (8px vs 6px)', id, true, sc => sc
    .replace('50%      { transform: translateY(-3px); }', '50%      { transform: translateY(-8px); }'), )

  // SEED 14: the float deleted outright - R138 regressed back to R130's still
  check('seeded: the float deleted from .char-layer (back to too dead)', id, true, sc => sc
    .replace('animation: char-idle 5s ease-in-out infinite;', ''), )

  // NEGATIVE CONTROL A: the real files, which NAME the retired keyframes and
  // the retired rotate values in prose, must pass
  check('NEGATIVE CONTROL: the real files as they stand must pass', id, false)

  // NEGATIVE CONTROL B: prose that quotes the banned rules verbatim, as CSS and
  // HTML comments in BOTH files, must not trip it
  check('NEGATIVE CONTROL: comments quoting `animation: hero-sway-idle 7.2s` and rotate(0.6deg) must not trip it', s => s
    .replace('<style>', '<style>\n  /* R130 deleted `.hero-body { animation: hero-sway-idle 7.2s ease-in-out infinite; }`\n     and `@keyframes hero-sway-idle`, plus .hero-layer-a / .hero-layer-b and the glance. */')
    .replace('<div class="hero-body"', '<!-- was: <div class="hero-layer-b"></div>, hero_glance_6f.png, glance -->\n<div class="hero-body"'), false, sc => sc
    .replace('<style>', '<style>\n  /* the old rule was transform: translateY(-7px) rotate(0.6deg) scale(1.015) and it is dead */'))

  console.log('')
  const { prose, floatEvidence } = judge(real, realScene)
  const named = ['hero-sway-idle', 'hero-cycle-idle', 'hero-dissolve-in', 'hero-turn-glance', 'hero-cycle-glance']
    .filter(n => prose.includes(n))
  console.log(`  comment-immunity evidence: the real file's CSS prose names ${named.length}/5 retired keyframes (${named.join(', ')}) and the gate is silent.`)
  console.log(`  float fence evidence: ${floatEvidence}`)
  console.log('')
  if (bad) { console.error(`HERO IDLE PLANTED GATE SELF-TEST: FAIL (${bad} case(s) wrong)`); process.exit(1) }
  console.log('HERO IDLE PLANTED GATE SELF-TEST: PASS (every seed caught, every control clean)')
  process.exit(0)
}

const { findings, rules: n, floatEvidence } = judge(real, realScene)
console.log(`HERO IDLE PLANTED GATE: ${n} CSS rule(s) walked in HeroIdle.svelte; ${floatEvidence}`)
if (findings.length) {
  console.error('\nHERO IDLE PLANTED GATE: FAIL')
  for (const f of findings) console.error('  ' + f)
  process.exit(1)
}
console.log('HERO IDLE PLANTED GATE: PASS (pose frozen, float translateY-only at or below the car, dissolve reaction-scoped)')
