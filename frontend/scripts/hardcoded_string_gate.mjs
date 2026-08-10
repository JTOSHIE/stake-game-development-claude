// hardcoded_string_gate.mjs
//
// PLAYER-FACING ENGLISH THAT NEVER REACHED THE TRANSLATION LAYER.
//
// Sixteen locales ship, and `locale_prose_conformance` proves every KEYED string
// resolves in all of them with zero gaps. That is a strong guarantee about the
// keys and says nothing at all about a literal typed straight into markup: an
// unkeyed string is not a missing translation, it is not a translation at all,
// and no completeness check can see one. Every instance below rendered English
// to all sixteen.
//
// WHAT THIS CATCHES, from the pre-submission hunt that found them by hand:
//   HudOverlay          {$isMuted ? 'Unmute' : 'Mute'}, four sites
//   FeatureMenu         {m.cost}x {$isSocial ? 'per spin' : 'bet'}, two sites
//   ReplayMode          'Bet'/'Play', 'Currency'/'Token', 'Mode:', 'cost ='
//   PaytableModal       the 'Scatters' column header, beside two keyed siblings
//   WinBreakdown        {current.ways} ways
//
// ALL OF THE ABOVE ARE NOW FIXED. Fable's ruling block R041 (2026-08-10)
// supplied the wording for all sixteen locales, the baseline went 11 -> 0, and
// the ratchet's both-directions check is what proved each one was really burned
// rather than merely edited around.
//
// TWO THINGS THIS FILE GOT WRONG, kept because they are the lesson rather than
// the history. The list above claimed WinBreakdown's `{current.ways} ways` as a
// catch, and rule 3 could NEVER have made it: it read `[^<>{}\n]`, so a single
// brace anywhere in a text node disqualified the whole node and the English
// beside the interpolation was never a candidate. FeatureMenu's twelfth literal,
// "per spin while ON", shipped through this gate for the same reason while it
// printed PASS. Both were found by hand, and a gate that is trusted while blind
// is worse than no gate. Rule 3 is widened and both shapes are seeded below.
//
// THE SOCIAL CONDITIONALS ARE NOT THE COMPLIANCE MECHANISM, which is the trap
// worth naming. `{$isSocial ? 'per spin' : 'bet'}` looks like the sweepstakes
// vocabulary layer doing its job. It is not: that layer is `sv()` in
// i18n/vocabulary.ts, driven by the platform's own 39-row prohibited-terms
// table. These are hand-rolled copies of it, and FeatureMenu's own comment at
// line 333 says so about a sibling that was already fixed ("Was
// `{$isSocial ? 'PLAY' : 'BET'}`, a hand-rolled copy of a layer..."). They are
// English in BOTH branches, so they are twice wrong: untranslated, and bypassing
// the compliance layer.
//
// THE FROZEN RATCHET, same shape as scripts/qa/doc_currency_gate.mjs and for the
// same reason. Fixing these needs real translation in fifteen locales, which is
// not something a builder invents. So the known set is frozen, the count prints
// on every run, and ANY NEW hardcoded string fails immediately. The list is
// checked in BOTH directions: an entry that matches nothing also fails, so
// fixing one and leaving its entry behind is caught. A ratchet that can rust is
// not a ratchet.
//
// WHAT IT DELIBERATELY DOES NOT SCAN, so the parked class is honestly enumerated:
//   - Anything inside <script>. Class names, testids, store keys and comments
//     live there and are not player-facing.
//   - HTML comments, which is where two false positives came from on the first
//     draft: FeatureMenu:333 and MaxWinCelebration:156 both QUOTE the literal
//     they replaced, inside a comment explaining the fix.
//   - Dev-only components. ThemeSelector never renders in production
//     (App.svelte forces the default theme behind import.meta.env.DEV), so its
//     English is unreachable.
//   - Strings with no prose word in them. A bare 'spin' is nearly always a CSS
//     class or a testid; requiring a prose marker keeps the signal usable, and a
//     gate that cries wolf gets switched off.
//
// Convention (p):
//   node scripts/hardcoded_string_gate.mjs --self-test
//   node scripts/hardcoded_string_gate.mjs
//   node scripts/hardcoded_string_gate.mjs --freeze     rewrite the baseline
//
// Writes only its baseline, and only under --freeze. Convention (h.1) holds.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const BASELINE = join(ROOT, 'scripts', 'hardcoded_string_baseline.json')

/** Never scanned. Each needs a reason, not just a name. */
const SKIP_FILES = new Set([
  // Dev-only: App.svelte forces DEFAULT_THEME_ID when import.meta.env.DEV is
  // false, and the selector is gated on the same flag, so nothing here renders
  // to a player.
  'ThemeSelector.svelte',
  // No longer rendered at all. Kept only because four live documents cite it by
  // line; see the note at the foot of the file.
  'LoadingScreen.svelte',
])

/**
 * Strings on DEV-ONLY controls, excluded by exact text with a reason each.
 *
 * A whole-file skip is too blunt for App.svelte, which carries both the game and
 * the dev utilities, so these are named individually.
 */
const DEV_ONLY_TEXT = new Map([
  // The reel-mode cycle button sits in the collapsed dev utility cluster
  // (App.svelte's own comment: "dev-only theme/reel-mode"), and
  // build_diet_verify already asserts "reel-mode toggle absent" in the
  // production bundle, so this label cannot reach a player.
  ['Toggle reel mode', 'dev-only utility; build_diet_verify asserts it is absent from dist'],
])

/**
 * A string is a candidate only if it reads like PROSE. Without this the scan
 * returns every CSS class and data-testid in the tree.
 */
const PROSE_WORD = /\b(the|a|an|your|you|to|of|is|are|and|or|with|per|spin|bet|play|win|coins|balance|mute|unmute|ways|scatter|scatters|session|free|game|feature|cost|currency|token|mode|replay|responsible|total|prize|max|min)\b/i

/** Looks like a sentence or a label, not an identifier or a path. */
const LABEL_SHAPE = /^[A-Za-z][A-Za-z0-9 ,.'!?:%()×-]{1,140}$/

let failures = 0
const bad = (n, d) => { failures++; console.error(`  FAIL  ${n}${d ? '\n        ' + d : ''}`) }

/** The markup half of a Svelte file, with comments removed. */
export function markupOf(src) {
  const i = src.lastIndexOf('</script>')
  const markup = i >= 0 ? src.slice(i + '</script>'.length) : src
  return markup
    // HTML comments FIRST: they quote the literals they replaced, which is where
    // this gate's first draft found two false positives.
    .replace(/<!--[\s\S]*?-->/g, '')
    // The <style> block, which is INSIDE the markup region and is not markup.
    // Second draft: CSS comments are full of apostrophes ("the element's own
    // height"), and an apostrophe pair reads as a single-quoted literal, so the
    // scan reported fragments like "s own height or the viewport" as
    // player-facing English. CSS carries no player text at all, so it goes.
    .replace(/<style[\s\S]*?<\/style>/gi, '')
}

/** Every player-facing English literal in one component's markup. */
export function findHardcoded(src, file) {
  const markup = markupOf(src)
  const out = []
  const push = (text) => {
    const s = text.trim()
    if (!s || !LABEL_SHAPE.test(s) || !PROSE_WORD.test(s)) return
    if (DEV_ONLY_TEXT.has(s)) return
    if (!out.includes(s)) out.push(s)
  }
  // 1. Single-quoted literals inside markup EXPRESSIONS: {cond ? 'A' : 'B'}.
  //    Svelte attribute values use double quotes, so single quotes in markup are
  //    almost always expression literals, which is what we are hunting.
  //
  //    TWO SHAPES ARE EXCLUDED BY THEIR CONTEXT, and both were false positives on
  //    the third draft:
  //      $tr('balance')     a translation KEY, i.e. the exact OPPOSITE of the
  //                         defect. Flagging it would report correctly keyed
  //                         strings as unkeyed.
  //      phase === 'spin'   a state comparison, not a label.
  for (const m of markup.matchAll(/'([^'\\\n]{2,140})'/g)) {
    const before = markup.slice(Math.max(0, m.index - 24), m.index)
    if (/\b(?:\$?tr|t|sv|get)\(\s*$/.test(before)) continue          // a key
    if (/,\s*$/.test(before) && /\b(?:\$?tr|t|sv)\(/.test(before)) continue // t(locale, 'key'
    if (/[=!]==?\s*$/.test(before)) continue                          // a comparison
    push(m[1])
  }

  // 2. Double-quoted values of PLAYER-FACING attributes ONLY, named explicitly.
  //    The first draft scanned every double-quoted value and flagged
  //    class="win-pod fs-plate" and data-testid="spin-button", because both
  //    contain a prose word. Enumerating the attributes that a player can
  //    actually read is the only way to tell a label from a selector.
  for (const m of markup.matchAll(/\b(aria-label|title|placeholder|alt|aria-description)\s*=\s*"([^"\\\n]{2,140})"/g)) {
    push(m[2])
  }
  // 3. Text nodes between tags, INCLUDING the English either side of an
  //    interpolation. R041.
  //
  //    THIS READ `[^<>{}\n]` AND THAT IS WHY "per spin while ON" SHIPPED.
  //    Excluding braces did not merely skip the expression, it disqualified the
  //    WHOLE TEXT NODE: one `{` anywhere between the tags and the entire segment
  //    stopped matching, so the prose beside it was never even a candidate. The
  //    gate printed PASS over a literal rendering English to sixteen locales,
  //    and its own header claimed WinBreakdown's `{current.ways} ways` as a
  //    catch it could never have made. A gate that cannot see the commonest
  //    shape of the defect it names is worth less than no gate, because it is
  //    trusted.
  for (const m of markup.matchAll(/>([^<>\n]{2,300})</g)) {
    for (const frag of textFragments(m[1])) push(frag)
  }
  return out.map((text) => ({ file, text }))
}

/**
 * One text node split into the prose fragments a player actually reads.
 *
 * Interpolations become boundaries rather than content, and so do the visual
 * separators that habitually sit beside them (`·`, `|`, `/`, `•`), because a
 * fragment like "per spin while ON ·" would otherwise fail LABEL_SHAPE on the
 * separator and vanish, which is the same silent miss in a new costume.
 *
 * Brace matching is DEPTH-COUNTED rather than regex `\{[^{}]*\}`: R041 itself
 * introduced `{$tr('waysCount', { n: current.ways })}`, whose nested object
 * literal would have closed the non-greedy form early and spilled `)}` into the
 * text as a false positive.
 *
 * THE INTERPOLATION MARKER IS A NUL, NOT A SPACE, and it looks like a space in
 * every editor. `keyOf` below already uses one as a joiner, so it is this
 * file's convention rather than a novelty. Do not "tidy" it into a real space:
 * the split would then break on ordinary whitespace and shred
 * "per spin while ON" into four one-word fragments, each too short for
 * LABEL_SHAPE, and this defect would pass again for a brand new reason.
 */
export function textFragments(node) {
  let out = '', depth = 0
  for (const ch of node) {
    if (ch === '{') { depth++; if (depth === 1) out += ' '; continue }
    if (ch === '}') { if (depth > 0) depth--; continue }
    if (depth === 0) out += ch
  }
  return out.split(/[ ·•|/]+/).map((s) => s.trim()).filter(Boolean)
}

/**
 * DELIBERATE English, exempt on its MERITS rather than frozen as debt. R041.
 *
 * These are the SOCIAL branch of a ternary whose real-money branch is now keyed.
 * They are not awaiting translation and never will be: social sessions are
 * pinned to `en` before first paint by `stores/socialLocale.ts`, enforcing the
 * platform's own guideline 46 ("English is the only supported language in Social
 * Mode"), so there is no second locale for them to be wrong in.
 *
 * Keyed `file|text` rather than by bare text, for the same reason the sibling
 * gate scopes its debt by file: a bare exemption would also excuse a new `Play`
 * written tomorrow in another component.
 */
const BY_DESIGN = new Map([
  ['ReplayMode.svelte|Play',
    "social branch of the replay cost line; the platform's own replacement for 'Bet', and social is en-only"],
  ['ReplayMode.svelte|Token',
    "social branch of the replay currency line; 'currency' is in vocabulary.ts NOT_SUBSTITUTED because a "
    + 'blanket rewrite would corrupt the ISO code labels, so the swap is made at the render site and is '
    + 'proved by replay_contract_gate.mjs rather than asserted'],
])

function scanTree() {
  const dir = join(SRC, 'lib', 'components')
  const files = readdirSync(dir).filter((f) => f.endsWith('.svelte') && !SKIP_FILES.has(f))
  const found = []
  for (const f of files) found.push(...findHardcoded(readFileSync(join(dir, f), 'utf8'), f))
  found.push(...findHardcoded(readFileSync(join(SRC, 'App.svelte'), 'utf8'), 'App.svelte'))
  return found.filter((h) => !BY_DESIGN.has(`${h.file}|${h.text}`))
}

const keyOf = (h) => `${h.file} ${h.text}`

function loadBaseline() {
  if (!existsSync(BASELINE)) return { entries: [], keys: new Set() }
  const raw = JSON.parse(readFileSync(BASELINE, 'utf8'))
  const entries = raw.frozen ?? []
  if (raw.frozen_count !== undefined && raw.frozen_count !== entries.length) {
    console.error(`HARDCODED STRING GATE: FAIL, the baseline disagrees with itself: `
      + `frozen_count ${raw.frozen_count} against ${entries.length} entries`)
    process.exit(1)
  }
  return { entries, keys: new Set(entries.map(keyOf)) }
}

function freeze(found) {
  writeFileSync(BASELINE, JSON.stringify({
    _comment: [
      'FROZEN player-facing English that never reached the translation layer.',
      'Every entry renders the same English in all sixteen locales.',
      'Fixing one needs a real translation in fifteen locales, which a builder',
      'does not invent, so they are frozen and the gate goes live anyway.',
      'THIS LIST ONLY SHRINKS. A new hardcoded string fails immediately, and an',
      'entry that matches nothing fails too, so a fix cannot leave its entry',
      'behind. Regenerate ONLY to record a genuine fix, never to make a new',
      'string pass.',
    ],
    frozen_count: found.length,
    frozen: found.map((h) => ({ file: h.file, text: h.text })),
  }, null, 2) + '\n')
  console.log(`HARDCODED STRING GATE: froze ${found.length} entries to ${BASELINE}`)
}

// ── self-test ────────────────────────────────────────────────────────────────
function selfTest() {
  const SEEDS = [
    ['a new hardcoded label in markup', true,
      () => findHardcoded(`<script>let x = 1</script>\n<div>Total Bet</div>`, 'X.svelte').length > 0],
    ['a hand-rolled social conditional, English in BOTH branches, which is the '
      + 'shape that looks like the compliance layer and is not', true,
      () => findHardcoded(`<script></script>\n<span>{$isSocial ? 'per spin' : 'bet'}</span>`, 'X.svelte')
        .some((h) => h.text === 'per spin')],
    ['a mute toggle', true,
      () => findHardcoded(`<script></script>\n<b>{$isMuted ? 'Unmute' : 'Mute'}</b>`, 'X.svelte')
        .some((h) => h.text === 'Mute')],
    // ── R041. The class rule 3 could not see, and the reason it shipped. ──────
    // FeatureMenu:435 rendered "per spin while ON" to all sixteen locales while
    // this gate printed PASS, because rule 3 read `[^<>{}\n]`: a text node
    // containing an interpolation did not match AT ALL, so the English either
    // side of it was never a candidate. The pre-submission hunt found it by
    // hand; the gate could not have. Seeded in the form it really occurs,
    // interpolation and separator included, per convention (p).
    ['R041: an English literal ADJACENT to an interpolation inside one text node, '
      + 'which is the exact shape that shipped at FeatureMenu.svelte:435', true,
      () => findHardcoded(
        `<script></script>\n<p>{fsCostLabel(m.cost, $locale)} per spin while ON · <span>{price(m.cost)}</span></p>`,
        'X.svelte').some((h) => h.text === 'per spin while ON')],
    ['R041: the same class trailing an interpolation, the WinBreakdown form, '
      + 'which the gate header claimed to catch and never did', true,
      () => findHardcoded(`<script></script>\n<span>{current.ways} ways</span>`, 'X.svelte')
        .some((h) => h.text === 'ways')],
    ['NEGATIVE CONTROL: a text node that is ONLY an interpolation stays clean, '
      + 'so widening rule 3 does not report every expression in the tree', false,
      () => findHardcoded(`<script></script>\n<span>{formatWin(x, c, l)}</span>`, 'X.svelte').length > 0],
    ['NEGATIVE CONTROL: a keyed call carrying a NESTED object literal, the shape '
      + 'R041 introduced at WinBreakdown, must not leak its own braces as text', false,
      () => findHardcoded(`<script></script>\n<span>{$tr('waysCount', { n: current.ways })}</span>`, 'X.svelte').length > 0],
    ['NEGATIVE CONTROL: a keyed string is not flagged', false,
      () => findHardcoded(`<script></script>\n<div>{$tr('hudSession')}</div>`, 'X.svelte').length > 0],
    ['NEGATIVE CONTROL: a CSS class is not prose', false,
      () => findHardcoded(`<script></script>\n<div class="win-pod fs-plate"></div>`, 'X.svelte').length > 0],
    ['NEGATIVE CONTROL: a testid is not prose', false,
      () => findHardcoded(`<script></script>\n<b data-testid="spin-button"></b>`, 'X.svelte').length > 0],
    ['NEGATIVE CONTROL: an HTML COMMENT quoting the literal it replaced, which '
      + 'is where the first draft of this gate found two false positives', false,
      () => findHardcoded(`<script></script>\n<!-- Was \`{$isSocial ? 'PLAY' : 'BET'}\`, a hand-rolled copy -->\n<div></div>`, 'X.svelte').length > 0],
    ['NEGATIVE CONTROL: anything inside <script> is out of scope', false,
      () => findHardcoded(`<script>const label = 'Total Bet'</script>\n<div></div>`, 'X.svelte').length > 0],
  ]
  let n = 0
  for (const [why, shouldFlag, run] of SEEDS) {
    let got
    try { got = run() } catch (e) { got = `threw ${e.message}` }
    const good = got === shouldFlag
    if (!good) n++
    console.log(`  ${good ? 'caught ' : 'MISSED '} seeded: ${why}`)
  }
  const seeded = SEEDS.filter((s) => s[1]).length
  console.log(n === 0
    ? `\nHARDCODED STRING GATE SELF-TEST: PASS (${seeded} seeded, ${SEEDS.length - seeded} negative controls)`
    : `\nHARDCODED STRING GATE SELF-TEST: FAIL (${n})`)
  process.exit(n === 0 ? 0 : 1)
}

// ── run ──────────────────────────────────────────────────────────────────────
const found = scanTree()

if (process.argv.includes('--self-test')) selfTest()
if (process.argv.includes('--freeze')) { freeze(found); process.exit(0) }

const { entries, keys } = loadBaseline()
const foundKeys = new Set(found.map(keyOf))

const added = found.filter((h) => !keys.has(keyOf(h)))
const rusted = entries.filter((e) => !foundKeys.has(keyOf(e)))

console.log(`HARDCODED STRING GATE: ${found.length} player-facing literal(s), ${entries.length} frozen`)

if (added.length) {
  bad(`no NEW player-facing English reaches markup unkeyed`,
    added.map((h) => `${h.file}: ${JSON.stringify(h.text)}`).join('\n        '))
}
if (rusted.length) {
  bad('every frozen entry still matches something',
    'these were fixed without burning their entry, so the ratchet has rusted:\n        '
    + rusted.map((e) => `${e.file}: ${JSON.stringify(e.text)}`).join('\n        '))
}

if (failures) {
  console.error(`\nHARDCODED STRING GATE: FAIL (${failures})`)
  process.exit(1)
}
console.log(entries.length === 0
  ? `\nHARDCODED STRING GATE: PASS (0 outstanding; ${BY_DESIGN.size} exempt by design, each with its reason above)`
  : `\nHARDCODED STRING GATE: PASS (${entries.length} frozen string(s) still outstanding, `
    + 'each needing a real translation in fifteen locales)')
