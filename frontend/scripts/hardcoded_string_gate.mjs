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
// THAT LIST WAS WRONG WHEN IT CLAIMED THEY WERE ALL FIXED, and the correction
// is the point. After R041 this header read "ALL OF THE ABOVE ARE NOW FIXED".
// Two of the strings it names were still shipping English to sixteen locales:
// ReplayMode's `cost =`, and WinBreakdown's ways line which this gate had never
// been able to see at all. A false claim in a gate's own header is worse than no
// header, because a run can never contradict it: the gate reports on the tree,
// not on its own comments. Found by a review pass, recorded as B10, and fixed by
// R042 A5 rather than by editing the sentence.
//
// AS OF R042 (2026-08-10) the list above IS closed, the baseline is 0, and the
// ratchet's both-directions check is what proved each entry was really burned
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

/**
 * Looks like a sentence or a label, not an identifier or a path.
 *
 * THE LENGTH CAP WAS 140 AND THAT WAS THE SECOND HALF OF THE SAME BLIND SPOT.
 * The name gives the assumption away: this was written for LABELS. The
 * RESPONSIBLE PLAY paragraph in PaytableModal.svelte is 281 characters of
 * player-facing English rendering to all sixteen locales, so even once rule 3
 * could see across newlines, this rejected it for being too long to be a label.
 * A gate hunting untranslated PROSE cannot cap its candidates at label length.
 * Raised to 600, which comfortably covers the longest paragraph we ship while
 * still refusing anything that looks like a minified blob.
 */
const LABEL_SHAPE = /^[A-Za-z][A-Za-z0-9 ,.'!?:%()×-]{1,600}$/

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
  // 2b. INTERPOLATED values of the same player-facing attributes: title={expr}.
  //     R075, closing G2 of the R074 final audit. The four speed tooltips
  //     shipped `title={$speedTier === 'normal' ? 'Normal speed' : ...}` while
  //     this gate printed PASS, and the blindness had TWO independent causes:
  //     rule 2 reads only STATIC double-quoted attribute values, and rule 1,
  //     which does see expression literals, then rejected 'Normal speed',
  //     'Turbo' and 'Super Turbo' because PROSE_WORD carries no speed
  //     vocabulary. Inside an attribute a player actually reads, a quoted
  //     literal IS a label by construction, so the attribute name is the prose
  //     marker and PROSE_WORD deliberately does not apply here. Keys and
  //     comparisons are excluded exactly as in rule 1, so the state names in
  //     `$speedTier === 'normal'` stay clean while the label branches flag.
  //     SHAPE NOT SEEN, stated per the audit discipline: a literal sitting
  //     AFTER a nested `}` inside the same attribute expression is beyond the
  //     `[^}]` capture; no shipped attribute carries that form today.
  for (const m of markup.matchAll(/\b(aria-label|title|placeholder|alt|aria-description)\s*=\s*\{([^}\n]{2,300})\}?/g)) {
    const expr = m[2]
    for (const q of expr.matchAll(/'([^'\\\n]{2,140})'/g)) {
      const before = expr.slice(Math.max(0, q.index - 24), q.index)
      if (/\b(?:\$?tr|t|sv|get)\(\s*$/.test(before)) continue          // a key
      if (/,\s*$/.test(before) && /\b(?:\$?tr|t|sv)\(/.test(before)) continue
      if (/[=!]==?\s*$/.test(before)) continue                          // a comparison
      const s = q[1].trim()
      if (!s || !LABEL_SHAPE.test(s) || DEV_ONLY_TEXT.has(s)) continue
      if (!out.includes(s)) out.push(s)
    }
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
  //
  //    AND THE FIRST WIDENING WAS STILL NOT ENOUGH, which is the more useful
  //    half of this. It took `{` and `}` out of the class and left `\n` in it,
  //    so a text node was still disqualified the moment it WRAPPED. The
  //    RESPONSIBLE PLAY paragraph, a full English sentence rendering to all
  //    sixteen locales directly under a translated heading, sat in
  //    PaytableModal.svelte the whole time and this gate returned [] for that
  //    file. PLAYER-FACING PROSE IS EXACTLY THE TEXT THAT WRAPS, so excluding
  //    newlines excluded the very class the gate exists for. Found by a review
  //    pass, not by the gate. Now `s`-flagged, with whitespace normalised in
  //    the fragments so a wrapped sentence compares as one line.
  for (const m of markup.matchAll(/>([^<>]{2,600})</gs)) {
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
  return out.split(/[ ·•|/]+/).map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean)
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

/**
 * A CONFIG FIELD RENDERED RAW. R042 TASK A6.
 *
 * `fsModes.ts` declares `volatility: 'Low' | 'High' | 'Very High' | 'Extreme'`
 * and both FEATURES card layouts interpolated the union member DIRECTLY, so a
 * Japanese player read "Very High" on a card whose every other word was
 * translated. No .svelte file contained the string, so no markup scan could
 * have found it.
 *
 * THE FIRST ATTEMPT AT THIS SCANNED THE CONFIG FILE AND WAS USELESS, which is
 * worth recording because it looked reasonable. Reading string literals out of
 * fsModes.ts finds `'Low'` and `'High'`, and then either PROSE_WORD rejects them
 * (they are not prose words) or, with PROSE_WORD removed, it flags the config's
 * own vocabulary, which is legitimately English and is now keyed at the render
 * site. Either way the gate learns nothing: the config literal is not the
 * defect. THE RENDER IS.
 *
 * So this looks for the shape that actually broke: a component interpolating a
 * config-owned field straight into markup, with no translation call around it.
 */
const RENDERED_FIELDS = 'volatility|label|blurb|title|caption|unit|suffix'
const RAW_FIELD_RENDER = new RegExp(
  String.raw`\{\s*\w+\.(${RENDERED_FIELDS})\s*\}`, 'g')

export function findRawFieldRenders(src, file) {
  const markup = markupOf(src)
  const out = []
  for (const m of markup.matchAll(RAW_FIELD_RENDER)) {
    // `{$tr(m.labelKey)}` and friends are the CORRECT form and carry a call, so
    // the match above cannot see them: it requires the braces to hold nothing
    // but the member expression.
    out.push({ file, text: m[0] })
  }
  return out
}

function scanTree() {
  const dir = join(SRC, 'lib', 'components')
  const files = readdirSync(dir).filter((f) => f.endsWith('.svelte') && !SKIP_FILES.has(f))
  const found = []
  for (const f of files) found.push(...findHardcoded(readFileSync(join(dir, f), 'utf8'), f))
  found.push(...findHardcoded(readFileSync(join(SRC, 'App.svelte'), 'utf8'), 'App.svelte'))
  for (const f of files) found.push(...findRawFieldRenders(readFileSync(join(dir, f), 'utf8'), f))
  found.push(...findRawFieldRenders(readFileSync(join(SRC, 'App.svelte'), 'utf8'), 'App.svelte'))
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
    // ── The class the FIRST widening still could not see. ───────────────────
    // Two independent constraints hid it: rule 3 excluded `\n`, so a text node
    // was disqualified the moment it wrapped; and LABEL_SHAPE capped candidates
    // at 140 characters, which is a LABEL's length, not a paragraph's. The real
    // instance is PaytableModal's RESPONSIBLE PLAY text, 281 characters of
    // English rendering to all sixteen locales under a translated heading, and
    // this gate returned [] for that file while printing PASS. Seeded in the
    // form it really occurs: wrapped, long, and between plain tags.
    ['R041 follow-up: a WRAPPED player-facing paragraph, the form prose actually '
      + 'takes, which the newline exclusion and the 140-character label cap hid', true,
      () => findHardcoded(
        `<script></script>\n<div>\n  <p class="fs-disc">\n    Autoplay can be set to stop automatically on any win, when the\n    Overdrive feature triggers, or once a loss limit you choose is\n    reached, and can always be stopped manually at any time.\n  </p>\n</div>`,
        'X.svelte').some((h) => h.text.startsWith('Autoplay can be set to stop'))],
    ['NEGATIVE CONTROL: a wrapped block of pure markup with no prose stays clean, '
      + 'so widening across newlines does not report the whole component tree', false,
      () => findHardcoded(
        `<script></script>\n<div class="a">\n  <span class="b"></span>\n  <i class="c"></i>\n</div>`,
        'X.svelte').length > 0],
    ['NEGATIVE CONTROL: a text node that is ONLY an interpolation stays clean, '
      + 'so widening rule 3 does not report every expression in the tree', false,
      () => findHardcoded(`<script></script>\n<span>{formatWin(x, c, l)}</span>`, 'X.svelte').length > 0],
    ['NEGATIVE CONTROL: a keyed call carrying a NESTED object literal, the shape '
      + 'R041 introduced at WinBreakdown, must not leak its own braces as text', false,
      () => findHardcoded(`<script></script>\n<span>{$tr('waysCount', { n: current.ways })}</span>`, 'X.svelte').length > 0],
    // ── R075, G2. An interpolated player-facing attribute. ──────────────────
    // The exact form that shipped at HudOverlay 513, 621, 778 and 871 until
    // R075: a title attribute whose ternary carries hardcoded English labels,
    // beside an aria-label that routes correctly. Seeded verbatim per (p),
    // comparison literals included, so the seed proves BOTH that the labels
    // flag and that the state names beside them do not.
    ['R075/G2: the shipped speed tooltip, an interpolated title attribute whose '
      + 'ternary carries hardcoded English labels', true,
      () => findHardcoded(
        `<script></script>\n<button aria-label={$tr('a11yCycleSpeed')} title={$speedTier === 'normal' ? 'Normal speed' : $speedTier === 'turbo' ? 'Turbo' : 'Super Turbo'}></button>`,
        'X.svelte').some((h) => h.text === 'Normal speed')],
    ['R075/G2: the same seed must flag the colon branch too, the Super Turbo label', true,
      () => findHardcoded(
        `<script></script>\n<button title={$speedTier === 'normal' ? 'Normal speed' : $speedTier === 'turbo' ? 'Turbo' : 'Super Turbo'}></button>`,
        'X.svelte').some((h) => h.text === 'Super Turbo')],
    ['NEGATIVE CONTROL: the R075 fix form, an interpolated title routed through '
      + 'a key, must pass, or the fix itself would fail the gate', false,
      () => findHardcoded(`<script></script>\n<button title={$tr('a11yCycleSpeed')}></button>`, 'X.svelte').length > 0],
    ['NEGATIVE CONTROL: comparison literals inside an attribute expression are '
      + 'state names, not labels, and stay clean', false,
      () => findHardcoded(`<script></script>\n<span title={mode === 'social' ? $tr('a') : $tr('b')}></span>`, 'X.svelte').length > 0],
    // ── R042 A6. A config-owned field rendered raw. ─────────────────────────
    ['R042: a config union member interpolated straight into markup, the shape '
      + 'that put "Very High" on a Japanese FEATURES card', true,
      () => findRawFieldRenders(`<script></script>\n<span class="fm-vol">{m.volatility}</span>`, 'X.svelte').length > 0],
    ['NEGATIVE CONTROL: the keyed form through VOLATILITY_KEY must pass, or the '
      + 'fix itself would fail the gate', false,
      () => findRawFieldRenders(`<script></script>\n<span>{$tr(VOLATILITY_KEY[m.volatility])}</span>`, 'X.svelte').length > 0],
    ['NEGATIVE CONTROL: a keyed prose field such as {$tr(m.labelKey)} must pass', false,
      () => findRawFieldRenders(`<script></script>\n<span>{$tr(m.labelKey)}</span>`, 'X.svelte').length > 0],
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
