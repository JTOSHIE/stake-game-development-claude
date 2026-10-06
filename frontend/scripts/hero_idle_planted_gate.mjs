#!/usr/bin/env node
/**
 * HERO IDLE PLANTED GATE, R153 FORM: the hero is ONE STILL. No strip is on the render path, the
 * hero component holds no state and emits nothing, and the float one level above him is the
 * ceiling of his motion: translateY only, at or below the car's amplitude, and present.
 *
 * THE RULING THIS ENCODES, AND ITS HISTORY. R130 froze the idle flipbook; R138 put a wrapper float
 * back ("float yes, tick no") and kept the win unfold and the feature brace as reactions behind a
 * crossfade. The owner's R153 brief (reports/briefs/FS_R153_OperatorStripHeroStill_Prompt.md,
 * TASK 2) took the hero off the scored path altogether: "Stop rendering the win-unfold,
 * feature-brace, glance and ambient strips. One still remains, with the existing float as the
 * ceiling ... A win must settle without waiting on a character animation." So the reaction
 * exemptions this gate carried from R138 to R152 (a non-idle [data-motion] selector, the
 * .hero-cross buffer, the warm layers) are gone: there is no state in which the hero may animate.
 * The R138 float fence is kept unchanged, because the brief keeps the float and names it the
 * ceiling. The previous form of this file is in git at 895815b9.
 *
 * WHAT IT CHECKS, each one behaviour-keyed rather than name-keyed:
 *   (a) HeroIdle.svelte's style declares no animation, no transform and no @keyframes, under any
 *       name and at any nesting depth (seeds 3, 4 and 5).
 *   (b) HeroIdle.svelte's markup is exactly ONE element, an <img> carrying
 *       data-testid="hero-still" whose source is ui/scene_character.png (seeds 1 and 2).
 *   (c) No strip is referenced anywhere in frontend/src outside comments: no `ui/hero/` path and no
 *       `_<n>f.png` sheet name (seeds 1 and 12). asset_reference_gate would catch a strip that is
 *       both referenced and pruned; this catches the reference itself, pruned or not.
 *   (d) HeroIdle.svelte's script holds no state: no import at all, no reactive statement, no
 *       timer or frame callback, no dispatcher and no store write. That is what makes "a win never
 *       waits on the hero" structural rather than measured: a component that reads nothing and
 *       emits nothing cannot be awaited (seeds 6 and 7).
 *   (e) SceneGroup mounts HeroIdle with no binding and no event handler (seed 8).
 *   (f) The float fence on SceneGroup.svelte, as R138 wrote it: the keyframes .char-layer references
 *       transform by translateY only, their amplitude is at or below the car's, both derived from
 *       the file at gate time, and the float exists (seeds 9, 10 and 11).
 *   (g) SceneGroup's reduced-motion block still stops .char-layer with `animation: none !important`
 *       (seed 13).
 *
 * THE COMMENT TRAP. HeroIdle.svelte keeps the dated history of the reaction system in its header,
 * so its prose names every strip and every retired keyframe. Each file is split into CODE and PROSE
 * first and only CODE is judged; the self-test's negative control plants the banned forms inside
 * comments and requires silence, and the run prints how many strip names the real prose carries.
 *
 * Run:
 *   node scripts/hero_idle_planted_gate.mjs
 *   node scripts/hero_idle_planted_gate.mjs --self-test
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const SRC = join(HERE, '..', 'src')
const FILE = join(SRC, 'lib', 'components', 'HeroIdle.svelte')
const SCENE_FILE = join(SRC, 'lib', 'components', 'SceneGroup.svelte')

// ── 1. Split a component into CODE and PROSE, and scan only CODE ───────────
function sections(src) {
  const style = (src.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1]
  const script = (src.match(/<script[^>]*>([\s\S]*?)<\/script>/) || [, ''])[1]
  const markup = src.replace(/<style>[\s\S]*?<\/style>/, '').replace(/<script[^>]*>[\s\S]*?<\/script>/, '')
  return {
    styleCode: style.replace(/\/\*[\s\S]*?\*\//g, ' '),
    scriptCode: script.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 '),
    markupCode: markup.replace(/<!--[\s\S]*?-->/g, ' '),
    prose: [
      ...(style.match(/\/\*[\s\S]*?\*\//g) || []),
      ...(script.match(/\/\/[^\n]*/g) || []),
      ...(markup.match(/<!--[\s\S]*?-->/g) || []),
    ].join('\n'),
  }
}

// A plain .ts module has no sections: strip its comments and judge the rest as script.
function tsCode(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
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

// Every rule including those inside @media, WITH its at-rule ancestors, for check (g).
function rulesWithAncestors(css) {
  const out = []
  const stack = []
  let cur = ''
  for (const c of css) {
    if (c === '{') { stack.push({ sel: cur.trim(), body: '', anc: stack.map(f => f.sel) }); cur = '' }
    else if (c === '}') { const f = stack.pop(); if (!f) continue; f.body += cur; cur = ''; out.push(f) }
    else cur += c
  }
  return out
}

// ── 2b. Keyframes extractor: name -> concatenated step bodies ────────────────
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
// Deliberately over-collects: a stray token means one extra keyframes lookup,
// while an under-collect is the exact miss the fence exists to prevent.
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

function decls(body) {
  return body.split(';').map(d => d.trim()).filter(Boolean).map(d => {
    const k = d.slice(0, d.indexOf(':')).trim().toLowerCase()
    const v = d.slice(d.indexOf(':') + 1).trim()
    return { k, v }
  })
}

// Largest |translateY| in px across a set of keyframe names, plus a flag for
// any transform function that is not translateY.
function floatShape(kfMap, names) {
  let amp = null
  const foreign = []
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

// ── 3. The source tree, for check (c) ────────────────────────────────────────
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(svelte|ts|js|mjs)$/.test(name) && !/\.test\.(ts|mjs|js)$/.test(name)) out.push(p)
  }
  return out
}
const STRIP_REF = /ui\/hero\/|_\d+f\.png/

function judge(src, sceneSrc, tree) {
  const S = sections(src)
  const findings = []

  // (a) no motion of any kind in the hero component's own style
  for (const r of rules(S.styleCode)) {
    for (const d of decls(r.body)) {
      const val = d.v.replace(/!important/i, '').trim()
      if ((d.k === 'animation' || d.k === 'animation-name') && val !== 'none' && val !== '')
        findings.push(`HeroIdle \`${r.sel}\` animates: ${d.k}: ${d.v}`)
      if (d.k === 'transform' && val !== 'none')
        findings.push(`HeroIdle \`${r.sel}\` transforms: ${d.k}: ${d.v}`)
      if (d.k === 'will-change' && /transform/.test(val))
        findings.push(`HeroIdle \`${r.sel}\` declares will-change: transform, a motion hint on a still`)
    }
  }
  for (const m of S.styleCode.matchAll(/@keyframes\s+([\w-]+)/g))
    findings.push(`HeroIdle declares \`@keyframes ${m[1]}\`: the still has no motion of its own`)

  // (b) exactly one element, the still
  const tags = [...S.markupCode.matchAll(/<([a-zA-Z][\w:-]*)(\s|\/|>)/g)].map(m => m[1])
  const blocks = (S.markupCode.match(/\{[#:@]/g) || []).length
  if (tags.length !== 1 || tags[0] !== 'img')
    findings.push(`HeroIdle's markup must be exactly one <img>, found ${tags.length} element(s): ${tags.join(', ') || 'none'}`)
  if (blocks) findings.push(`HeroIdle's markup carries ${blocks} control block(s) ({#if}, {#each}, ...): the still has no states`)
  if ((S.markupCode.match(/data-testid="hero-still"/g) || []).length !== 1)
    findings.push('expected exactly one data-testid="hero-still"')
  if (!/src\s*=\s*"\{assetBase\}\/ui\/scene_character\.png"/.test(S.markupCode))
    findings.push('the still is not ui/scene_character.png (src="{assetBase}/ui/scene_character.png")')

  // (c) no strip referenced anywhere in src, outside comments
  for (const [path, text] of Object.entries(tree)) {
    const code = path.endsWith('.svelte')
      ? (() => { const T = sections(text); return T.styleCode + '\n' + T.scriptCode + '\n' + T.markupCode })()
      : tsCode(text)
    const m = code.match(STRIP_REF)
    if (m) findings.push(`${path} references a hero strip (\`${m[0]}\`) outside a comment`)
  }

  // (d) no state in the hero component
  const script = S.scriptCode
  if (/^\s*import\b/m.test(script)) findings.push('HeroIdle imports something: the still reads no store and needs no module')
  if (/^\s*\$:/m.test(script)) findings.push('HeroIdle has a reactive statement: the still has no state to derive')
  for (const [re, what] of [
    [/\bsetTimeout\b|\bsetInterval\b/, 'a timer'],
    [/\brequestAnimationFrame\b/, 'a frame callback'],
    [/\bcreateEventDispatcher\b|\bdispatch\s*\(/, 'an event dispatcher'],
    [/\.(set|update)\s*\(/, 'a store write'],
    [/\bonMount\b|\bonDestroy\b/, 'a lifecycle hook'],
  ]) if (re.test(script)) findings.push(`HeroIdle carries ${what}: a win would have something to wait on`)
  const lets = [...script.matchAll(/\b(?:let|const|var|function)\s+([\w$]+)/g)].map(m => m[1])
  const extra = lets.filter(n => n !== 'assetBase')
  if (extra.length) findings.push(`HeroIdle declares state beyond its one prop: ${extra.join(', ')}`)

  // (e) SceneGroup mounts it with no binding and no handler
  const G = sections(sceneSrc)
  const mounts = [...G.markupCode.matchAll(/<HeroIdle\b([^>]*)\/?>/g)].map(m => m[1])
  if (mounts.length !== 1) findings.push(`SceneGroup must mount HeroIdle exactly once, found ${mounts.length}`)
  for (const attrs of mounts) {
    if (/\b(bind|on):/.test(attrs)) findings.push(`SceneGroup's HeroIdle mount carries a binding or handler: ${attrs.trim()}`)
  }

  // (f) the float fence, unchanged from R138
  const GR = rules(G.styleCode)
  const kf = keyframes(G.styleCode)
  const heroNames = referencedAnimations(GR, /\.char-layer\b/)
  const carNames = referencedAnimations(GR, /\.car-layer\b/)
  const hero = floatShape(kf, heroNames)
  const car = floatShape(kf, carNames)
  for (const f of hero.foreign) findings.push(`the hero float's keyframes carry a non-translateY transform: ${f}`)
  if (hero.amp === null || hero.amp === 0) {
    findings.push('the hero float is gone: no keyframe referenced by .char-layer declares a translateY (the brief keeps it as the ceiling)')
  } else if (car.amp !== null && hero.amp > car.amp) {
    findings.push(`the hero float's amplitude (${hero.amp}px) exceeds the car's (${car.amp}px)`)
  }
  const floatEvidence = `hero float ${hero.amp ?? 'none'}px vs car ${car.amp ?? 'none'}px, from ${[...heroNames].join('/') || 'no'} and ${[...carNames].join('/') || 'no'} keyframes`

  // (g) reduced motion still stops the float, unconditionally
  const rm = rulesWithAncestors(G.styleCode).filter(r => r.anc.some(a => /prefers-reduced-motion:\s*reduce/.test(a)))
  const stopsFloat = rm.some(r => r.sel.split(',').map(s => s.trim()).includes('.char-layer') &&
    /animation:\s*none\s*!important/.test(r.body))
  if (!stopsFloat) findings.push("SceneGroup's reduced-motion block no longer stops .char-layer with `animation: none !important`")

  return { findings, prose: S.prose, floatEvidence }
}

// ── entry ────────────────────────────────────────────────────────────────────
const real = readFileSync(FILE, 'utf-8')
const realScene = readFileSync(SCENE_FILE, 'utf-8')
const realTree = Object.fromEntries(walk(SRC).map(p => [relative(join(HERE, '..'), p), readFileSync(p, 'utf-8')]))

if (process.argv.includes('--self-test')) {
  console.log('HERO IDLE PLANTED GATE (R153, one still), seeded self-test\n')
  let bad = 0
  const heroKey = relative(join(HERE, '..'), FILE)
  const check = (label, mutate, expectCatch, mutateScene, mutateTree) => {
    const hero = mutate(real)
    const scene = mutateScene ? mutateScene(realScene) : realScene
    const tree = { ...realTree, [heroKey]: hero, [relative(join(HERE, '..'), SCENE_FILE)]: scene }
    if (mutateTree) mutateTree(tree)
    const { findings } = judge(hero, scene, tree)
    const caught = findings.length > 0
    const ok = caught === expectCatch
    if (!ok) bad++
    console.log(`  ${ok ? (expectCatch ? 'caught' : 'clean ') : (expectCatch ? 'MISSED' : 'FALSE+')}  ${label}`)
    for (const f of findings.slice(0, 3)) console.log(`            ${f}`)
  }
  const id = s => s
  const must = (s, needle) => { if (!s.includes(needle)) throw new Error(`seed anchor not found: ${needle}`); return s }

  // SEED 1: a strip back on the render path, as the still's own source
  check('seeded: the still swapped for the idle strip (ui/hero/hero_crossed_idle_6f.png)', s =>
    must(s, '/ui/scene_character.png').replace('/ui/scene_character.png', '/ui/hero/hero_crossed_idle_6f.png'), true)
  // SEED 2: a reaction buffer element back beside the still
  check('seeded: a second element (a reaction buffer) beside the still', s =>
    must(s, '<img\n  class="hero-still"').replace('<img\n  class="hero-still"', '<div class="hero-cross" aria-hidden="true"></div>\n<img\n  class="hero-still"'), true)
  // SEED 3: an animation on the still itself
  check('seeded: an animation on .hero-still', s =>
    must(s, '    display: block;\n').replace('    display: block;\n', '    display: block;\n    animation: hero-cross-top-win 1.5s steps(31) 1 forwards;\n'), true)
  // SEED 4: a pendulum under a brand-new name, keyframes and all
  check('seeded: a renamed pendulum keyframe on the still', s =>
    must(s, '</style>').replace('</style>', '  @keyframes hero-drift { 0%,100% { transform: rotate(-0.3deg) } 50% { transform: rotate(0.3deg) } }\n  .hero-still { animation: hero-drift 7s ease-in-out infinite; }\n</style>'), true)
  // SEED 5: the same hidden inside an @media block
  check('seeded: a transform hidden inside an @media (min-width) block', s =>
    must(s, '</style>').replace('</style>', '  @media (min-width: 900px) {\n    .hero-still { transform: translateY(-4px); }\n  }\n</style>'), true)
  // SEED 6: the reaction state machine's first two lines back
  check('seeded: a store import and a reactive win trigger back in the script', s =>
    must(s, '  export let assetBase: string').replace('  export let assetBase: string', "  import { winAmount } from '../stores/gameStore'\n  export let assetBase: string\n  let motion = 'idle'\n  $: if ($winAmount > 0) motion = 'win'"), true)
  // SEED 7: a hold timer, the shape the old reactions settled on
  check('seeded: a setTimeout hold in the script', s =>
    must(s, '  export let assetBase: string').replace('  export let assetBase: string', '  export let assetBase: string\n  setTimeout(() => {}, 1500)'), true)
  // SEED 8: SceneGroup listening for the hero, the shape a win would wait on
  check('seeded: SceneGroup mounts HeroIdle with an on:done handler', id, true, sc =>
    must(sc, '<HeroIdle assetBase={$themeAssets.assetBase} />').replace('<HeroIdle assetBase={$themeAssets.assetBase} />', '<HeroIdle assetBase={$themeAssets.assetBase} on:done={() => {}} />'))
  // SEED 9: the R122 rotation restored inside the float's own keyframes
  check('seeded: rotate back inside the char-idle float keyframes', id, true, sc =>
    must(sc, '50%      { transform: translateY(-3px); }').replace('50%      { transform: translateY(-3px); }', '50%      { transform: translateY(-3px) rotate(0.6deg); }'))
  // SEED 10: the float's amplitude raised past the car's own
  check('seeded: the float amplitude raised above the car (8px vs 6px)', id, true, sc =>
    must(sc, '50%      { transform: translateY(-3px); }').replace('50%      { transform: translateY(-3px); }', '50%      { transform: translateY(-8px); }'))
  // SEED 11: the float deleted outright
  check('seeded: the float deleted from .char-layer', id, true, sc =>
    must(sc, 'animation: char-idle 5s ease-in-out infinite;').replace('animation: char-idle 5s ease-in-out infinite;', ''))
  // SEED 12: a strip preloaded from ANOTHER file, which no HeroIdle check could see
  check('seeded: App.svelte preloads the win strip', id, true, null, tree => {
    const k = Object.keys(tree).find(p => p.endsWith('App.svelte'))
    tree[k] = tree[k].replace('</script>', "  new Image().src = '/assets/themes/future-spinner/ui/hero/hero_win_reaction_32f.png'\n</script>")
  })
  // SEED 13: the reduced-motion reset on the float loses its !important
  check('seeded: the .char-layer reduced-motion reset loses !important', id, true, sc =>
    must(sc, '.chest-lamp {\n      animation: none !important;').replace('.chest-lamp {\n      animation: none !important;', '.chest-lamp {\n      animation: none;'))

  // NEGATIVE CONTROL A: the real files as they stand
  check('NEGATIVE CONTROL: the real files as they stand must pass', id, false)
  // NEGATIVE CONTROL B: prose quoting every banned form, in all three comment syntaxes
  check('NEGATIVE CONTROL: comments quoting strips, timers, keyframes and transforms must not trip it', s => s
    .replace('<style>', '<style>\n  /* was: .hero-body { animation: hero-sway-idle 7.2s; transform: rotate(0.3deg) } @keyframes hero-sway-idle, ui/hero/hero_win_reaction_32f.png */')
    .replace('<img\n  class="hero-still"', '<!-- was: <div class="hero-cross"></div> {#if motion} ui/hero/hero_feature_trigger_16f.png -->\n<img\n  class="hero-still"')
    .replace('  export let assetBase: string', "  // was: import { winAmount } from '../stores/gameStore'; setTimeout(endReaction, 1500); $: react('win')\n  export let assetBase: string"),
  false, sc => sc.replace('<style>', '<style>\n  /* the old rule was transform: translateY(-7px) rotate(0.6deg) scale(1.015) and it is dead */'))

  console.log('')
  const { prose, floatEvidence } = judge(real, realScene, realTree)
  const named = ['hero_crossed_idle_6f', 'hero_win_reaction_32f', 'hero_feature_trigger_16f', 'hero_glance_6f']
    .filter(n => prose.includes(n))
  console.log(`  comment-immunity evidence: HeroIdle's prose names ${named.length}/4 hero strips (${named.join(', ')}) and the gate is silent.`)
  console.log(`  float fence evidence: ${floatEvidence}`)
  console.log('')
  if (bad) { console.error(`HERO IDLE PLANTED GATE SELF-TEST: FAIL (${bad} case(s) wrong)`); process.exit(1) }
  console.log('HERO IDLE PLANTED GATE SELF-TEST: PASS (every seed caught, every control clean)')
  process.exit(0)
}

const { findings, floatEvidence } = judge(real, realScene, realTree)
console.log(`HERO IDLE PLANTED GATE: ${Object.keys(realTree).length} source file(s) scanned for strips; ${floatEvidence}`)
if (findings.length) {
  console.error('\nHERO IDLE PLANTED GATE: FAIL')
  for (const f of findings) console.error('  ' + f)
  process.exit(1)
}
console.log('HERO IDLE PLANTED GATE: PASS (one still, no strip in src, no state in the hero, float translateY-only at or below the car)')
