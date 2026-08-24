#!/usr/bin/env node
/**
 * CSS LIVENESS GATE: a class applied only from script must still have a rule
 * in the artefact that ships.
 *
 * WHAT THIS CATCHES, and it shipped for real. Svelte's CSS scoper removes any
 * selector it cannot see used in the component's markup. A class that only ever
 * reaches an element through `classList.add()` is invisible to that analysis, so
 * its rule is dropped while any `@keyframes` it referenced survives as an orphan.
 * The build stays green, the bundle stays valid, and the behaviour is simply
 * absent. R086 measured nine of GameGrid's ten per-symbol idle animations dead in
 * exactly this way; only `idle-breathe` survived, because it is the one class
 * written literally in the markup.
 *
 * THE DETAIL THAT MAKES OR BREAKS THIS GATE. Svelte does not delete a pruned rule,
 * it COMMENTS IT OUT, emitting `/* (unused) .idle-coil{...}* /`. A liveness check
 * that greps the compiled CSS without stripping comments therefore finds the rule
 * it is looking for and reports PASS on precisely the defect it exists to catch.
 * The production minifier then strips those comments, so the shipped file and the
 * compiled file disagree about whether the text is present. Every check below runs
 * on comment-stripped CSS for that reason.
 *
 * WHY THE COLLECTOR FOLLOWS INDIRECTION, per convention (p). The defect that
 * shipped did NOT take the form `classList.add('idle-coil')`. It took the form
 * `classList.add(idleClass(sym))` with the names held in a `Record` literal, and
 * `classList.remove(...IDLE_ALL)` with the names held in an array literal. A
 * collector that only reads direct string arguments would have found nothing and
 * printed PASS. It resolves one level of indirection through array literals,
 * object literals and helper functions for that reason: the gate must see the form
 * that actually occurs, not the form that is convenient to parse.
 *
 * WHY REGEX AND NOT AN AST. The components are `<script lang="ts">`, and the
 * parser this repository ships (acorn, via rollup) does not parse TypeScript. A
 * TypeScript parser is not a dependency worth adding for a class-name scan, so the
 * collection is deliberately lexical and deliberately over-collects: a false
 * positive here is a class reported as informational, which is cheap, while a
 * false negative is the whole failure this gate exists to prevent.
 *
 * Run:
 *   node scripts/qa/css_liveness_gate.mjs
 *   node scripts/qa/css_liveness_gate.mjs --self-test
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..', '..')
const SRC = join(REPO, 'frontend', 'src')
const DIST_ASSETS = join(REPO, 'frontend', 'dist', 'assets')

/** Svelte comments a pruned rule out rather than deleting it. Strip before testing. */
const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '')

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** A class token appears as a selector in this CSS: `.name` not followed by more
 *  name characters, so `.idle-coil` never matches `.idle-coiled`, and an
 *  `@keyframes idle-coil` identifier never matches because it carries no dot. */
function hasRule(css, cls) {
  return new RegExp(`\\.${esc(cls)}(?![\\w-])`).test(css)
}

/** Split minified CSS into selector texts, so liveness can be judged per RULE
 *  rather than per file. Checking the whole bundle at once is what let a class
 *  belonging to a DIFFERENT component vouch for this one. */
function selectorsIn(css) {
  return [...css.matchAll(/(^|[}])\s*([^{}@][^{}]*)\{/g)].map((m) => m[2])
}

/** THE FALSE NEGATIVE THIS EXISTS TO PREVENT, found while building this gate and
 *  worth the extra machinery. The first version asked "does `.spinning` appear
 *  anywhere in the bundle". It does: HudOverlay has its own `.spinning`, scoped
 *  `svelte-1waqajp`. GameGrid's `.reel-strip.spinning .symbol-img` had been pruned
 *  exactly like the idles, and the gate printed PASS because another component's
 *  identically-named class stood in for it. svelte-check disagreed, which is the
 *  only reason it surfaced.
 *
 *  Svelte emits a surviving scoped rule with the component's own hash on the same
 *  selector, `.symbol-img.svelte-1rf55k2.idle-coil`, so attribution is available
 *  in the artefact. A rule authored as a BARE `:global(.x)` carries no hash by
 *  design; that form is accepted on presence alone, because being global is the
 *  authored intent. */
function isLiveForComponent(selectors, cls, hash, bareGlobal) {
  const re = new RegExp(`\\.${esc(cls)}(?![\\w-])`)
  for (const sel of selectors) {
    if (!re.test(sel)) continue
    if (bareGlobal) return true
    if (hash && sel.includes(hash)) return true
  }
  return false
}

/** Classes written literally in the component's markup: `class="a b"`, `class:x`. */
function markupClasses(source) {
  const out = new Set()
  const body = source.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
  for (const m of body.matchAll(/\bclass\s*=\s*"([^"]*)"/g)) {
    for (const tok of m[1].split(/\s+/)) if (/^[A-Za-z][\w-]*$/.test(tok)) out.add(tok)
  }
  for (const m of body.matchAll(/\bclass:([A-Za-z][\w-]*)/g)) out.add(m[1])
  return out
}

/** Discover a component's scope hash from a class that is in BOTH its markup and
 *  its style block: such a rule always survives, and carries the hash. */
function scopeHashFor(source, builtCss) {
  const style = styleBlocks(source)
  for (const cls of markupClasses(source)) {
    if (!hasRule(style, cls)) continue
    const m = builtCss.match(new RegExp(`\\.${esc(cls)}\\.(svelte-[\\w]+)`))
    if (m) return m[1]
  }
  return null
}

/** Is this class authored in a FULLY GLOBAL selector, one that Svelte emits with
 *  no scope hash at all?
 *
 *  The distinction matters and the first version got it wrong. `:global(body.replay-route)`
 *  in App.svelte emits `body.replay-route{...}` with no hash, because the whole
 *  selector is global; demanding a hash there reported a perfectly live rule as
 *  pruned. `.symbol-img:global(.idle-coil)` is NOT this case: it keeps a scoped
 *  compound, so it emits `.symbol-img.svelte-1rf55k2.idle-coil` and the hash is
 *  the right thing to demand.
 *
 *  So the test is not "does the class sit inside :global()", it is "does anything
 *  SCOPED survive once every :global() group is removed". */
function authoredFullyGlobal(style, cls) {
  const re = new RegExp(`\\.${esc(cls)}(?![\\w-])`)
  for (const sel of selectorsIn(style)) {
    if (!re.test(sel)) continue
    const withoutGlobals = sel.replace(/:global\([^)]*\)/g, '')
    if (!/[.#\w]/.test(withoutGlobals)) return true
  }
  return false
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    const st = statSync(p)
    if (st.isDirectory()) walk(p, out)
    else out.push(p)
  }
  return out
}

/** Extract the balanced argument text of every `classList.<op>(` call. */
function classListArgLists(source) {
  const out = []
  const re = /classList\s*\.\s*(add|remove|toggle)\s*\(/g
  let m
  while ((m = re.exec(source))) {
    let depth = 1
    let i = re.lastIndex
    while (i < source.length && depth > 0) {
      const ch = source[i]
      if (ch === '(') depth++
      else if (ch === ')') depth--
      i++
    }
    out.push(source.slice(re.lastIndex, i - 1))
  }
  return out
}

const STRING_LITERAL = /'([^'\\\n]*)'|"([^"\\\n]*)"|`([^`$\\\n]*)`/g

function literalsIn(text) {
  const out = []
  let m
  STRING_LITERAL.lastIndex = 0
  while ((m = STRING_LITERAL.exec(text))) {
    const v = m[1] ?? m[2] ?? m[3]
    if (v) out.push(v)
  }
  return out
}

/** Identifiers referenced in an argument list: `...IDENT`, `IDENT`, `IDENT(...)`. */
function identifiersIn(text) {
  const out = new Set()
  const re = /(?:\.\.\.)?\b([A-Za-z_$][\w$]*)\b/g
  let m
  while ((m = re.exec(text))) out.add(m[1])
  return [...out]
}

/** Resolve one identifier to the class-name literals it can contribute:
 *  an array literal, an object literal, or a function body (which may itself
 *  reference one of those, so this recurses once). */
function resolveIdentifier(source, name, seen = new Set()) {
  if (seen.has(name)) return []
  seen.add(name)
  const found = []
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // const NAME[: Type] = [ ... ]  or  = { ... }
  const declRe = new RegExp(`(?:const|let|var)\\s+${esc}\\s*(?::[^=]+)?=\\s*([\\[{])`)
  const d = declRe.exec(source)
  if (d) {
    const open = d[1]
    const close = open === '[' ? ']' : '}'
    let i = d.index + d[0].length
    let depth = 1
    const start = i
    while (i < source.length && depth > 0) {
      const ch = source[i]
      if (ch === open) depth++
      else if (ch === close) depth--
      i++
    }
    found.push(...literalsIn(source.slice(start, i - 1)))
  }

  // function NAME(...) { ... }  or  const NAME = (...) => { ... }
  const fnRe = new RegExp(`function\\s+${esc}\\s*\\(|(?:const|let|var)\\s+${esc}\\s*(?::[^=]+)?=\\s*(?:async\\s*)?\\(`)
  const f = fnRe.exec(source)
  if (f) {
    const braceStart = source.indexOf('{', f.index + f[0].length)
    if (braceStart !== -1) {
      let depth = 1
      let i = braceStart + 1
      while (i < source.length && depth > 0) {
        const ch = source[i]
        if (ch === '{') depth++
        else if (ch === '}') depth--
        i++
      }
      const body = source.slice(braceStart + 1, i - 1)
      found.push(...literalsIn(body))
      for (const id of identifiersIn(body)) found.push(...resolveIdentifier(source, id, seen))
    }
  }
  return found
}

/** Class-name shaped: kebab or single word, no spaces, no slashes or dots. */
const looksLikeClass = (s) => /^[A-Za-z][\w-]*$/.test(s) && !/^(add|remove|toggle|true|false|px|none)$/.test(s)

function collectFromComponent(source) {
  const names = new Set()
  for (const args of classListArgLists(source)) {
    for (const lit of literalsIn(args)) if (looksLikeClass(lit)) names.add(lit)
    for (const id of identifiersIn(args)) {
      for (const lit of resolveIdentifier(source, id)) if (looksLikeClass(lit)) names.add(lit)
    }
  }
  return names
}

/** The component's style blocks, COMMENT-STRIPPED.
 *
 *  Stripping here rather than at each call site closes two separate holes at
 *  once, both of which this gate hit while being written. A class named only in
 *  prose ("the .spinning gate") would otherwise count as having a rule, and this
 *  file's comments discuss class names constantly. And a long comment sitting
 *  immediately above a selector was being swallowed into the selector text by the
 *  splitter, which made `:global(body.replay-route)` read as scoped and reported a
 *  live rule as pruned. */
function styleBlocks(source) {
  const out = []
  const re = /<style[^>]*>([\s\S]*?)<\/style>/g
  let m
  while ((m = re.exec(source))) out.push(m[1])
  return stripCssComments(out.join('\n'))
}

function builtCss() {
  if (!existsSync(DIST_ASSETS)) return null
  const files = readdirSync(DIST_ASSETS).filter((f) => f.endsWith('.css'))
  if (!files.length) return null
  return files.map((f) => readFileSync(join(DIST_ASSETS, f), 'utf8')).join('\n')
}

// ── Self-test, convention (p): plant the defect in the form it really occurs ──
async function selfTest() {
  // Resolved from frontend/package.json so the fixture compiles through THE
  // PROJECT'S OWN compiler, at the exact version that builds the real bundle.
  // A gate that compiled against some other Svelte would be testing a different
  // scoper than the one whose behaviour it is asserting.
  // Resolving the real file rather than the bare specifier lands on a CJS interop
  // wrapper, whose named exports sit under `default`. Both shapes are accepted so
  // this keeps working if the package's entry shape changes.
  const require = createRequire(join(REPO, 'frontend', 'package.json'))
  const mod = await import(pathToFileURL(require.resolve('svelte/compiler')).href)
  const compile = mod.compile ?? mod.default?.compile
  if (typeof compile !== 'function') {
    throw new Error('svelte compiler resolved but exposes no compile(): ' + Object.keys(mod).join(', '))
  }

  const FIXTURE = (globalise) => `<script>
  let el;
  function paint() { el.classList.add('seeded-prune') }
</script>
<div bind:this={el} class="host"></div>
<style>
  .host { color: red }
  ${globalise ? ':global(.seeded-prune)' : '.seeded-prune'} { animation: seeded 1s infinite }
  @keyframes seeded { to { opacity: .5 } }
</style>`

  const results = []
  for (const [label, globalise] of [['scoped', false], ['global', true]]) {
    const src = FIXTURE(globalise)
    const out = compile(src, { name: 'Fixture', css: 'external' })
    const rawCss = out.css ? out.css.code : ''
    const css = stripCssComments(rawCss)
    const collected = collectFromComponent(src)
    const sourceHasRule = hasRule(styleBlocks(src), 'seeded-prune')
    // Judged with the SAME component-scoped predicate the scan uses, so the
    // self-test exercises the real code path rather than a simpler cousin of it.
    const hash = scopeHashFor(src, css)
    const bareGlobal = authoredFullyGlobal(styleBlocks(src), 'seeded-prune')
    const live = isLiveForComponent(selectorsIn(css), 'seeded-prune', hash, bareGlobal)
    results.push({ label, rawCss, collected: [...collected], sourceHasRule, live })
  }

  const scoped = results.find((r) => r.label === 'scoped')
  const globalR = results.find((r) => r.label === 'global')

  console.log('CSS LIVENESS GATE SELF-TEST (convention p)\n')
  console.log('The class is applied ONLY via classList.add in script, exactly as the')
  console.log('shipped defect did, and is never written in the markup.\n')

  console.log('--- FIXTURE A, plain scoped rule: the seeded violation ---')
  console.log('  collector saw class            :', scoped.collected.join(', ') || '(none)')
  console.log('  rule present in component source:', scoped.sourceHasRule)
  console.log('  compiled CSS, verbatim         :', scoped.rawCss.trim())
  console.log('  rule live after comment strip  :', scoped.live)
  const redOk = scoped.collected.includes('seeded-prune') && scoped.sourceHasRule && scoped.live === false
  console.log(`  GATE VERDICT                   : ${redOk ? 'RED (correct, the violation was caught)' : 'NOT RED (self-test FAILED)'}\n`)

  console.log('--- FIXTURE B, :global() rule: the fix ---')
  console.log('  compiled CSS, verbatim         :', globalR.rawCss.trim())
  console.log('  rule live after comment strip  :', globalR.live)
  const greenOk = globalR.live === true
  console.log(`  GATE VERDICT                   : ${greenOk ? 'GREEN (correct)' : 'NOT GREEN (self-test FAILED)'}\n`)

  if (!redOk || !greenOk) {
    console.log('CSS LIVENESS GATE SELF-TEST: FAIL')
    return 1
  }
  console.log('CSS LIVENESS GATE SELF-TEST: PASS, the gate goes red on a planted prune and green on its fix')
  return 0
}

// ── Scan mode ────────────────────────────────────────────────────────────────
function scan() {
  const css = builtCss()
  if (css === null) {
    console.log('CSS LIVENESS GATE: FAIL, no built CSS found at frontend/dist/assets.')
    console.log('  Run `npm run build` in frontend/ first. This gate reads the artefact that')
    console.log('  ships, never the component source, because the prune happens at build time.')
    return 1
  }
  const live = stripCssComments(css)
  const selectors = selectorsIn(live)

  const files = walk(SRC).filter((f) => f.endsWith('.svelte'))
  const dead = []
  const informational = []
  const unattributable = []
  let checked = 0

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    if (!/classList\s*\.\s*(add|remove|toggle)\s*\(/.test(source)) continue
    const style = styleBlocks(source)
    const names = collectFromComponent(source)
    const rel = relative(REPO, file)
    const hash = scopeHashFor(source, live)
    for (const cls of [...names].sort()) {
      if (!hasRule(style, cls)) { informational.push({ file: rel, cls }); continue }
      const bareGlobal = authoredFullyGlobal(style, cls)
      if (!hash && !bareGlobal) {
        // No anchor class to attribute rules by, so liveness cannot be judged
        // honestly. Reported rather than assumed either way.
        unattributable.push({ file: rel, cls })
        continue
      }
      checked++
      if (!isLiveForComponent(selectors, cls, hash, bareGlobal)) dead.push({ file: rel, cls })
    }
  }

  console.log(`CSS LIVENESS GATE: ${files.length} component(s) scanned, ${checked} script-applied class(es) with a source rule checked against the built CSS`)
  if (informational.length) {
    console.log(`  ${informational.length} class-shaped token(s) reaching a classList call with NO rule in their own`)
    console.log('  component, reported not judged. The collector deliberately over-collects (see')
    console.log('  the header): a token here is a candidate, not a confirmed class, and none can')
    console.log('  fail this gate. Only a class that HAS a source rule is judged.')
    const byFile = new Map()
    for (const i of informational) {
      if (!byFile.has(i.file)) byFile.set(i.file, [])
      byFile.get(i.file).push(i.cls)
    }
    for (const [f, cs] of byFile) console.log(`    ${f}: ${cs.sort().join(', ')}`)
  }

  if (unattributable.length) {
    console.log(`  ${unattributable.length} class(es) whose component exposes no anchor class to attribute rules by,`)
    console.log('  so liveness is NOT judged for them. Reported rather than guessed:')
    for (const u of unattributable) console.log(`    ${u.file}: .${u.cls}`)
  }

  if (dead.length) {
    console.log('\nCSS LIVENESS GATE: FAIL, a class is applied from script and its rule is NOT in the built CSS')
    for (const d of dead) {
      console.log(`  PRUNED  ${d.file}`)
      console.log(`      .${d.cls}`)
      console.log(`      has a rule in the component but none in the shipped artefact`)
    }
    console.log('\nWrap the selector in :global(), for example .symbol-img:global(.idle-coil),')
    console.log('so the scoper can no longer prove it unused. Svelte cannot see a class that')
    console.log('only ever arrives through classList, so it removes the rule and keeps the')
    console.log('build green.')
    return 1
  }

  console.log('\nCSS LIVENESS GATE: PASS')
  return 0
}

const mode = process.argv.includes('--self-test') ? 'self-test' : 'scan'
process.exit(mode === 'self-test' ? await selfTest() : scan())
