#!/usr/bin/env node
/**
 * HERO IDLE PLANTED GATE: the resting hero may not animate and may not transform.
 *
 * WHAT THIS GUARDS, AND WHY IT IS BEHAVIOURAL RATHER THAN A LIST OF NAMES.
 * The owner's ruling at R130 was that bad motion scores worse than a still, and R130 acted on it
 * by DELETING the idle flipbook, the 7.2s pendulum sway, the two-layer cross-dissolve and the
 * glance outright, freezing the hero on frame 01. The win unfold and the feature brace survive and
 * still play; those are reactions, not idle.
 * Nothing guarded that. Grepping all 140 scripts under frontend/scripts for hero-sway, hero-idle,
 * hero_glance, HeroIdle, hero-cycle or hero-body returns exactly one hit, and it is the prune entry
 * for hero_glance_6f.png in build_diet_verify.mjs, which is not a guard.
 *
 * THE GATE KEYS ON BEHAVIOUR, NOT ON THE FIVE RETIRED NAMES. Any selector that can match the hero
 * AT REST, and that carries an `animation`, `animation-name` or `transform` other than `none`, is a
 * finding whatever the keyframe is called. That is what makes seed 2 of the self-test meaningful:
 * it restores exactly the same pendulum under a BRAND-NEW name, `hero-drift-idle`, and a
 * name-matching gate would sail past it. Seed 7 hides the same rule inside an `@media (min-width)`
 * block, which a depth-limited walker would miss, so the rule walker is nesting-aware and drops
 * keyframe STEPS by their `@keyframes` ancestor rather than by depth.
 * Selectors carrying a non-idle `[data-motion=...]` are exempt: those are the reactions R130 kept.
 *
 * THE COMMENT TRAP, WHICH IS THE REASON THIS FILE EXISTS IN THIS SHAPE. HeroIdle.svelte's own prose
 * NAMES ALL FIVE retired keyframes and quotes the banned declaration `animation: hero-sway-idle
 * 7.2s` verbatim, because the file explains what was removed and why. A grep-for-the-name gate is
 * therefore a permanent false positive on the very file it guards. The component is split into CODE
 * and PROSE first (CSS block comments out of the style block, line and block comments out of the
 * script, HTML comments out of the markup) and only CODE is judged. The self-test carries a
 * negative control that plants the banned declaration inside a comment and requires silence, and it
 * prints how many of the five names the real file's prose actually contains, so the immunity is
 * evidenced on every run rather than asserted once.
 *
 * WHAT IT ALSO HOLDS: the two dissolve buffers must not return in markup or style; exactly one
 * sheet element must exist; the script must not re-declare a `glance` state or reference the pruned
 * hero_glance sheet; and the two reduced-motion resets must keep their `!important`, which R130
 * added deliberately after three specificity ties and which a tidy-up would strip as noise.
 *
 * THE HONEST CAVEAT: this is a FORWARD regression guard. It would not have caught R122's sway when
 * that sway was the intended design; it catches its RETURN now that the owner has ruled against it.
 * A gate cannot know an owner changed their mind, so what it encodes is the ruling, not the taste.
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

// ── 1. Split the component into CODE and PROSE, and scan only CODE ───────────
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

const AT_REST = /\.hero-(body|idle)\b/
const NON_IDLE_STATE = /\[data-motion\s*=\s*['"]?(?!idle)[a-z]+['"]?\]/

function decls(body) {
  return body.split(';').map(d => d.trim()).filter(Boolean).map(d => {
    const k = d.slice(0, d.indexOf(':')).trim().toLowerCase()
    const v = d.slice(d.indexOf(':') + 1).trim()
    return { k, v }
  })
}

function judge(src) {
  const S = sections(src)
  const findings = []
  const R = rules(S.styleCode)

  // (a) at-rest-reachable rules must not animate or transform
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

  // (c) the dual-buffer dissolve elements must not come back
  for (const cls of ['hero-layer-a', 'hero-layer-b']) {
    if (new RegExp('\\bclass\\s*=\\s*["\'][^"\']*' + cls).test(S.markupCode) || new RegExp('\\.' + cls + '\\b').test(S.styleCode)) {
      findings.push(`dissolve buffer element \`.${cls}\` is back (markup or style)`)
    }
  }
  // exactly one sheet element
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

  return { findings, prose: S.stylePROSE, rules: R.length }
}

// ── entry ────────────────────────────────────────────────────────────────────
const real = readFileSync(FILE, 'utf-8')

if (process.argv.includes('--self-test')) {
  console.log('HERO IDLE PLANTED GATE, seeded self-test\n')
  let bad = 0
  const check = (label, mutate, expectCatch) => {
    const { findings } = judge(mutate(real))
    const caught = findings.length > 0
    const ok = caught === expectCatch
    if (!ok) bad++
    console.log(`  ${ok ? (expectCatch ? 'caught' : 'clean ') : (expectCatch ? 'MISSED' : 'FALSE+')}  ${label}`)
    for (const f of findings.slice(0, 3)) console.log(`            ${f}`)
  }

  // SEED 1: the sway back, by its own name (R122's exact rule)
  check('seeded: R122 hero-sway-idle restored on .hero-body', s => s
    .replace('  .hero-body {\n    position: absolute;', '  @keyframes hero-sway-idle { 0%,100% { transform: rotate(-0.32deg) } 50% { transform: rotate(0.32deg) } }\n  .hero-body {\n    animation: hero-sway-idle 7.2s ease-in-out infinite;\n    position: absolute;'), true)

  // SEED 2: the SAME motion under a BRAND-NEW name - a name-only gate misses this
  check('seeded: the same pendulum under a new name (hero-drift-idle)', s => s
    .replace('  .hero-body {\n    position: absolute;', '  @keyframes hero-drift-idle { 0%,100% { transform: rotate(-0.32deg) } 50% { transform: rotate(0.32deg) } }\n  .hero-body {\n    animation: hero-drift-idle 7.2s ease-in-out infinite;\n    position: absolute;'), true)

  // SEED 3: the idle flipbook back on the sheet layer
  check('seeded: hero-cycle-idle flipbook restored on .hero-idle', s => s
    .replace(".hero-idle[data-motion='win']    {", "@keyframes hero-cycle-idle { from { background-position-x: 0 } to { background-position-x: var(--hero-span) } }\n  .hero-idle { animation: hero-cycle-idle 4.4s steps(6) infinite; }\n  .hero-idle[data-motion='win']    {"), true)

  // SEED 4: the dual-buffer dissolve elements back in the markup
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

  // NEGATIVE CONTROL A: the real file, which NAMES all five retired keyframes in prose
  check('NEGATIVE CONTROL: the real file as it stands must pass', s => s, false)

  // NEGATIVE CONTROL B: prose that quotes the banned rule verbatim, as CSS and HTML comments
  check('NEGATIVE CONTROL: a comment quoting `animation: hero-sway-idle 7.2s` must not trip it', s => s
    .replace('<style>', '<style>\n  /* R130 deleted `.hero-body { animation: hero-sway-idle 7.2s ease-in-out infinite; }`\n     and `@keyframes hero-sway-idle`, plus .hero-layer-a / .hero-layer-b and the glance. */')
    .replace('<div class="hero-body"', '<!-- was: <div class="hero-layer-b"></div>, hero_glance_6f.png, glance -->\n<div class="hero-body"'), false)

  console.log('')
  const { prose } = judge(real)
  const named = ['hero-sway-idle', 'hero-cycle-idle', 'hero-dissolve-in', 'hero-turn-glance', 'hero-cycle-glance']
    .filter(n => prose.includes(n))
  console.log(`  comment-immunity evidence: the real file's CSS prose names ${named.length}/5 retired keyframes (${named.join(', ')}) and the gate is silent.`)
  console.log('')
  if (bad) { console.error(`HERO IDLE PLANTED GATE SELF-TEST: FAIL (${bad} case(s) wrong)`); process.exit(1) }
  console.log('HERO IDLE PLANTED GATE SELF-TEST: PASS (every seed caught, every control clean)')
  process.exit(0)
}

const { findings, rules: n } = judge(real)
console.log(`HERO IDLE PLANTED GATE: ${n} CSS rule(s) walked in HeroIdle.svelte`)
if (findings.length) {
  console.error('\nHERO IDLE PLANTED GATE: FAIL')
  for (const f of findings) console.error('  ' + f)
  process.exit(1)
}
console.log('HERO IDLE PLANTED GATE: PASS (the resting hero neither animates nor transforms)')
