# Session Report: OWNER AUDIT REMEDIATION, 2026-07-24

- **Date:** 2026-07-24.
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/owner-audit-remediation-v1`, cut fresh off `main` (zero
  open PRs at the time of branching).

Fourteen-item remediation brief from the owner audit, three priorities:
A (functional bugs), B (display/UX), C (visual). Every item ships with its
own fix and its own assert/proof, per the brief. The external audit session
is queued to run immediately after this pass merges.

## Per-item fix-and-assert table

| Item | Fix | Assert / proof | Result |
|---|---|---|---|
| A1 - NITRO price label | `buyConfirmBody`'s hardcoded "100×" (all 16 locales + social override) made a `{cost}` placeholder; added `t()` interpolation support | `auditCostLabelConsistency` (menu cards + buy-confirm modal, both tiers) | PASS |
| A2 - FEATURES menu clipping | `.fm-cards` given `flex:1 1 auto; min-height:0` (was growing to full content height and getting clipped by the panel's `overflow:hidden`, not the `vh`/`dvh` units as first suspected); `dvh` fallback added too | `auditMenuViewportClipping`, all 4 profiles x orientations | PASS |
| A3 - Live cost reactivity | `currentSpinCost` reactive statement referenced `$betAmount` only inside a called function (invisible to Svelte's dependency scan) - inlined the expression so both `$betAmount` and `$standingMode` are direct dependencies; added a persistent "This spin costs" line | `live-reactivity` check (change bet with menu open) | PASS |
| A4 - Autoplay loss limit | Loss-limit checkbox reused the autoplay spin count as a bogus dollar multiplier; single-win limit was hardcoded to 0 with no UI. Added real dollar/multiplier inputs for both | `autoplay_rg_soak.mjs` (loss limit, single-win limit, stop-on-feature, all via real DOM) | PASS, all 3 scenarios |
| A5 - Mock pool triggers | Curated 12 new `cruise` pool entries (previously zero) from the real, locked `books_cruise.jsonl.zst` + lookup-table weights; extended `handleSpin` to honour `?mockCategory=` for standing modes (previously buy-flow only) | `mock_pool_trigger_check.mjs` (static pool check + live spin-until-trigger harness) | PASS |
| B1 - Currency/HUD sizing | `currencyDisplay: 'narrowSymbol'` drops "US$"→"$"; new `autofitText` Svelte action (iterative, not single-pass - see below) applied to all 9 balance/win/bet spans | `auditHudStressValues` at $999,999.99 | PASS |
| B2 - Win banner truncation | Same `autofitText` action applied to `.c1-amount`; `width:100%` added (flex-centred elements size to content by default, so a bare `max-width` doesn't trigger the overflow check) | `win_banner_stress_proof.mjs` at $1,000 / $100,000 / $1,000,000 | PASS |
| B3 - SPIN MODES clarity | Explicit radio-dot indicator (not just the border-glow ring) on standing-mode cards; OVERBOOST card shows its own resolved cost inline | Visual proof + confirmed HUD bet plate updates live with menu open | PASS |
| B4 - Buy confirm redesign | Modal now pulls feature name/blurb from `FS_MODES` (was one generic title/body shared by both tiers); added a "what you get" section (mode blurb + scatter/spin breakdown + meter behaviour, reusing existing Rules-tab translations) and a price/RTP/max-win stat row; widened the modal | Proof screenshots, both tiers | PASS |
| B5 - Autoplay infinity | `∞` option added to all 3 autoplay-menu layouts, gated on `rgJurisdiction.maxAutoplaySpins === Infinity`; `Infinity` flows through the existing count/decrement machinery with no special-casing | `auditAutoInfiniteOption`, both flag states | PASS |
| C1 - Rain in main scene | Extracted HeroSplash's rain streaks into a shared `RainLayer.svelte` (props: count/opacity), reused in both the splash (10 @ 0.55, unchanged) and the live backdrop (6 @ 0.22, new) | DOM verification (streak count/opacity/nesting) + reduced-motion check + before/after screenshots | PASS |
| C2 - Vector Mark V3 | Filled "dark coin" badge replacing the rejected v2's hollow-outline construction - gradient chrome rim, filled gunmetal spokes with a magenta SVG-blur glow, a lit reel window, neon-sign-style filled wordmarks | `gate_vector_mark_v3.mjs` (paths-only, margin symmetry, min stroke) via Chromium, not cairosvg (see below) | PASS |

## PRIORITY A: functional

### A1: the actual bug, and a second one it wasn't

Research initially flagged two "stale 100×" sites. Only one was real: the
buy-confirm modal's `buyConfirmBody` string was a hardcoded "100× your bet?"
across all 16 locales and the social override - predating NITRO, never
updated when the 400x tier shipped. Fixed by adding lightweight `{key}`
interpolation to `t()` and replacing the hardcoded number with `{cost}` in
every locale (mechanical `sed`, verified per-locale). The second flagged
site (`PaytableModal.svelte`'s Rules-tab "Buy Feature" plate) turned out to
be correctly scoped to the base Overdrive Free Spins tier specifically
(100x is right there), not a NITRO-adjacent bug - left untouched.

The assert (`auditCostLabelConsistency`) checks both the menu cards'
own `{cost}× · $price` internal consistency and the buy-confirm modal's
body-text multiplier against its own price plate - directly targeting the
class of bug that shipped (a number in one place drifting from another).

### A2: not the units, the flex layout

First hypothesis (static `vh`/`%` units not accounting for mobile dynamic
toolbars) was wrong. The real cause: `.fm-cards` had no `flex` property, so
in a flex column it sized to its own content height by default and
overflowed past `.fm-panel > .fs-face`'s `overflow:hidden` - not a units
problem, a missing `flex:1 1 auto; min-height:0`. Added the `dvh` fallback
alongside since it's a genuine, if secondary, improvement.

### A3: a real Svelte reactivity footgun, caught by its own assert

`currentSpinCost = price(MODE_COST[$standingMode] ?? 1)` looked reactive
but `price()` closes over `$betAmount` from outside the statement Svelte's
compiler actually scans - so changing bet never re-triggered the line.
Confirmed this shipped once already: the `live-reactivity` check I wrote
for this item failed on the first conformance run after adding the
"This spin costs" line, which is exactly the point of writing the assert
rather than eyeballing it once.

### A4: three real bugs and a deep test-tooling chase

The loss-limit and single-win-limit UI fixes were straightforward once
found (§ per-item table). Proving them end-to-end was not: the mock
`?mockCategory=` override only ever worked for the buy flow, so a normal
autoplay spin's win/loss was always uncontrolled random noise - `stop on
feature` could never even be exercised in dev, since standing-mode spins
never populated `lastRoundEvents` at all. Extended `handleSpin` to mirror
the buy-flow's existing serve-a-curated-round pattern (dev-only,
`import.meta.env.DEV`-gated, live play unaffected). That surfaced a second
bug of my own making mid-fix: a local `const isWincap` collided with the
imported `isWincap` store, which Svelte's compiler rejects outright
("Cannot subscribe to stores that are not declared at the top level") -
caught by `svelte-check`... no, actually caught by the dev server itself;
`svelte-check` does NOT catch this class of Svelte-compiler error, only
runtime compilation does - worth remembering for any future App.svelte
change. Renamed to `roundIsWincap`.

The soak script itself then needed two more rounds of fixing: a
`.p-round-btn` selector ambiguity (matched the hamburger menu button, not
autoplay - scoped to `.p-autoplay-wrapper .p-round-btn`), and a subtler
one - App.svelte permanently mounts a "warm" `FreeSpinsPresentation`
instance (`inert`, `visibility:hidden`, pre-painted for performance) that
also renders `[data-testid="freespins-overlay"]`. A `.first()`/`.last()`
Playwright locator on that testid is a *dynamic* query - once the real
overlay detaches, `.last()` silently starts resolving to the permanently-
attached warm instance, which never detaches, hanging the "wait for gone"
check forever even though the real presentation had already finished
(confirmed by screenshot: normal gameplay had resumed well inside the wait
window). Fixed by tracking element *count* instead of a single locator's
own state.

### A5: a genuine simulation-methodology finding

Naively counting `freeSpinTrigger` events in the raw `books_base.jsonl.zst`
gives 15.2% - nowhere near the documented 0.5415% shipped trigger rate.
The raw books pool is not itself weighted; `lookUpTable_base_0.csv`'s
per-book weight column is what determines how often each book is actually
served, and trigger books are assigned proportionally small weights.
Curation picked the **highest-weight** (most representative) book per
category bucket rather than sampling uniformly, which would have
over-represented rare outcomes exactly the way the raw pool does.

## PRIORITY B: display and UX

### B1/B2: one action, two real bugs in its first version

`autofitText` (new Svelte action, `frontend/src/lib/actions/autofitText.ts`)
shrinks font-size via a `--autofit-scale` custom property until content
fits its box. First version used a single linear
`clientWidth/scrollWidth` ratio pass - left a real ~14px residual overflow
on a 13-character amount, because `letter-spacing: 2px` is a fixed pixel
value that doesn't shrink proportionally with font-size. Rewrote as an
iterative loop (measure, shrink, re-measure, up to 6 passes). Separately,
the HUD stress-value assert itself needed two fixes before it was testing
the real thing: `rgsBetLevels` must be set *before* `betAmount` (a reactive
snap-to-nearest-ladder-level guard - by design, for the real bet-stepper
UX - silently overrides any bet not on the ladder), and the win count-up
animation needed a longer wait (800ms, not 400ms) before reading the
settled value.

### B3/B4: content and clarity, not just chrome

B3's radio dot and OVERBOOST inline cost are small additions; the
meaningful part was confirming (not assuming) that the HUD's own bet plate
already updates live when switching modes with the menu open - it does,
via the existing `effectiveCost` reactive statement. B4 pulls the buy
modal's feature name and description straight from `FS_MODES` (the same
source of truth the menu cards use) instead of one generic string shared
by both tiers - Buy Overdrive and NITRO OVERDRIVE now read as genuinely
different presentations, and NITRO's "pre-revved to 5x" line came along
for free since it was already in `fsModes.ts`'s blurb. The RTP/max-win
disclosure and scatter/meter breakdown reuse existing, already-localised
Rules-tab strings rather than duplicating new copy across 16 locales.

### B5: Infinity actually just works

Passing `Infinity` into the existing `autoPlayCount.update(n => n - 1)` /
`$autoPlayCount <= 0` machinery needed no special-casing at all -
`Infinity - 1 === Infinity`, and it's never `<= 0`. Only the *display*
needed a lying-eight symbol instead of literally rendering the string
"Infinity".

## PRIORITY C: visual

### C1: extraction, not duplication

`RainLayer.svelte` is HeroSplash's own rain-streak logic extracted so it
can be reused at a different density/opacity in the live backdrop (6
streaks @ 0.22, vs the splash's 10 @ 0.55) without copy-pasting the
streak-generation code. Verified via direct DOM inspection (streak count,
opacity custom property, correct nesting inside `.bg-layer`, absence under
`reducedMotion: 'reduce'`) rather than relying on a single static
screenshot, which - correctly, since the effect is deliberately subtle -
could not reliably show a thin animated line either way.

### C2: a real rendering-tool bug, found before it shipped broken

v3's construction depends on real SVG `feGaussianBlur` for its spoke/
window/wordmark glows. Direct pixel-level testing showed **cairosvg does
not correctly render gaussian blur** - a `stdDeviation="3"` blur fell from
alpha 255 to 0 within ~2 pixels, a hard edge, not a spread. Confirmed
*before* committing to the construction style, not discovered after
shipping broken exports. Every v3 render (previews, gate measurements,
PNG exports) goes through headless Chromium instead - v2's existing
cairosvg pipeline is untouched. A second bug surfaced during first render:
the mono-cyan variant's navy plate (a full r=230 disk, unlike v2's thin
tyre annulus) was made cyan too in the naive port of v2's "tyre fill
becomes cyan in mono" pattern, burying every other cyan element into one
flat circle - fixed by keeping the plate navy in both variants.

## Verification

- `npx svelte-check --tsconfig ./tsconfig.json`: 207 files, 6 pre-existing
  `node_modules` errors only, unchanged throughout the session.
- `frontend/scripts/portrait_layout_conformance.mjs` (final run): all
  checks pass except `reducedMotionFrameGate.bySegment.plainSpins` - the
  same documented, pre-existing host-level scheduling jitter noted in
  prior sessions' reports (it moved to a different profile/segment across
  this session's several re-runs, which is itself further evidence it's
  random noise, not a regression tied to any change here).
- `frontend/scripts/autoplay_rg_soak.mjs`: all 3 scenarios (loss limit,
  single-win limit, stop-on-feature) pass, driven entirely through the
  real DOM.
- `frontend/scripts/mock_pool_trigger_check.mjs`: static pool check (base
  17 natural triggers, cruise 3) and live spin-until-trigger harness both
  pass.
- `frontend/scripts/win_banner_stress_proof.mjs`: $1,000 / $100,000 /
  $1,000,000 all render the full untruncated string with no overflow.
- `frontend/scripts/gate_vector_mark_v3.mjs`: paths-only, margin symmetry
  (26px all sides, spread 0), minimum stroke at 192 (22px) all pass, both
  variants.
- Locked files confirmed untouched: `git diff --stat -- frontend/src/lib/
  services/rgsService.ts frontend/src/lib/stores/gameStore.ts
  games/future_spinner/ .claude/settings.json` is empty.

## Not done / open items

- The autoplay soak's `?mockCategory=` extension to `handleSpin` is
  `import.meta.env.DEV`-gated and does not touch live RGS behaviour, but it
  is a real, if narrow, addition to a previously buy-flow-only mechanism -
  worth Fable's explicit sign-off alongside the rest of this pass, not
  because it's risky, but because it's new surface in a file that gets
  edited carefully.
- Vector Mark V3 is committed for owner judgement per the brief, not wired
  into any frontend code path - the hero emblem remains the canonical logo
  at 96px+; v3 has no favicon/watermark call site yet.
- No new locale translations beyond the mechanical `{cost}` interpolation
  fix and the new `buyWhatYouGet` label (translated into all 16 locales) -
  the "what you get" scatter/meter copy reuses existing, already-localised
  Rules-tab strings rather than adding new copy.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** worked
  Priority A to completion first (functional bugs block real money/RG
  correctness), then B (display/UX), then C (visual) - matching the
  brief's own priority ordering rather than an arbitrary sequence. For
  each item, built the fix, then the assert, then ran the assert for real
  before moving on - the A3 reactivity bug, the isWincap naming collision,
  and the `.last()` dynamic-locator bug were all caught only because the
  assert was actually run and its failure investigated, not assumed
  passing. Chased root causes rather than loosening asserts to make them
  pass: the A2 clipping fix and the A4 mock-serving extension both took
  longer than a surface fix would have, but land on the actual mechanism.
- **Alternatives rejected:** rather than
  weakening the win-banner-stress assert's overflow tolerance to paper
  over the letter-spacing residual, fixed `autofitText` to iterate;
  rather than accepting the `.last()`-hangs-forever soak timeout by
  inflating it further (already tried up to 120s), found and fixed the
  actual dynamic-locator bug.
- **Files touched:** `frontend/src/App.svelte`,
  `frontend/src/lib/components/{BuyBonus,FeatureMenu,HeroSplash,HudOverlay,
  WinBanner}.svelte`, `frontend/src/lib/components/RainLayer.svelte` (new),
  `frontend/src/lib/actions/autofitText.ts` (new),
  `frontend/src/lib/i18n/translations.ts`, `frontend/src/lib/utils/currency.ts`,
  `frontend/src/lib/mock/sample_rounds.json` (+12 cruise entries),
  `frontend/scripts/portrait_layout_conformance.mjs` (5 new audits:
  cost-label consistency, menu-viewport-clipping, HUD stress values,
  auto-infinite-option, plus the reused frame gate),
  `frontend/scripts/{autoplay_rg_soak,mock_pool_trigger_check,
  win_banner_stress_proof,gate_vector_mark_v3}.mjs` (all new),
  `tools/brand/build_vector_mark_v3.py` (new),
  `tools/mock/curate_cruise_pool.py` (new),
  `design-system/brand/vector_mark/wrs_mark_v3*` (new, both variants +
  exports + generation note). Locked files untouched.
- **Open threads:** none blocking. PR opened, not merged, per standing
  convention - the external audit session is queued to run once this pass
  merges.
