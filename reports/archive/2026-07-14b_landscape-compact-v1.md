# Session Report: LANDSCAPE COMPACT HUD PASS, 2026-07-14b

- **Date:** 2026-07-14
- **Model / effort:** Claude Sonnet 5, High effort (per the brief - the
  decoupling pattern was proven in PR #78, this pass is specified work
  applying it to a second breakpoint).
- **Branch:** `claude/landscape-compact-v1`, off `main` after merging PR #78
  (portrait layout pass).
- **Source:** pasted brief, "LANDSCAPE COMPACT HUD PASS, 2026-07-14b",
  quoted in full in this report's Verification section.

## Problem

PR #78 (the portrait pass) closed out portrait phones but left one entry in
its own disclosed debt table: landscape phones. Real Playwright measurement
in that pass found the LAYOUT_SPEC v3.x control strip's actual scale on a
landscape phone (~0.47-0.50, not the ~0.54 originally assumed) leaves 7
production touch targets under the 44px effective floor: SPIN (39.7px),
turbo (38.7px), AUTO (22.7px), Menu (18.9px), MAX chip (12.3x20.8px), and
both bet steppers (20.8x11.3px each). This pass closes that debt by gating a
compact, native-scale HUD onto landscape phones specifically (height below
500px), reusing the exact decoupling mechanism the portrait pass proved.

## PR #78 merged first, per the brief

`gh pr merge 78 --merge` - merged clean (`mergeStateStatus: CLEAN`) into
`main` before starting this pass's branch, so `claude/landscape-compact-v1`
sits on top of the portrait work rather than diverging from it.

## Composition decisions

1. **Gate by height, not orientation** (`App.svelte`): `compactLandscape =
   innerHeight < innerWidth && innerHeight < 500`. Desktop landscape
   (>=500px tall) takes neither this nor the portrait branch and is
   completely unchanged - still the single `scale(S)` transform, still every
   LAYOUT_SPEC control at its original position.
2. **Reused the portrait pass's decoupling mechanism exactly, generalised
   to a second mode.** `.game-wrapper` drops its `scale(S)` transform
   whenever `portrait OR compactLandscape` is true (previously portrait-only)
   - same reasoning as before: a `transform` on an ancestor re-anchors every
   `position:fixed` modal to its own bounding box instead of the true
   viewport, so decoupling is what lets PaytableModal/BuyBonus/SessionPanel/
   etc render correctly on a landscape phone too. `.canvas-slot`/
   `.canvas-inner` (the 1280x720 design surface) now also carry a
   `.compact-landscape` variant alongside their existing `.portrait` one,
   with a HEIGHT-driven scale formula instead of portrait's width-driven one:
   `compactCanvasScale = min(innerWidth/1280, (innerHeight - 76) / 720)` - the
   canvas fits whatever space remains above a fixed 76px native HUD strip.
3. **`.native-hud-slot`** (renamed from the portrait pass's
   `.portrait-hud-slot` when this pass started, since it's now shared by two
   modes): gets a `.compact-landscape` variant that switches it from
   portrait's vertical `flex-direction: column` stack to a horizontal
   `flex-direction: row`, fixed at 76px tall - `FeatureMenu`'s compact
   trigger and `HudOverlay`'s compact strip become two side-by-side flex
   items in one row instead of stacked rows.
4. **`HudOverlay.svelte` `compactLandscape` prop**: a third template branch
   (alongside the existing `portrait` and default/landscape ones) rendering
   a single native-scale row: menu, balance, win, bet (with two 44px
   steppers), turbo, AUTO, MAX, then a 60px SPIN on the right - the brief's
   named order plus MAX and the FEATURES trigger folded in where they fit
   naturally (MAX beside AUTO/SPIN, matching how the portrait branch already
   grouped MAX with autoplay; FEATURES via FeatureMenu's own sibling item,
   see below). Fully self-contained `.c-*` CSS classes, same discipline as
   the portrait pass's `.p-*` block - no reuse of the LAYOUT_SPEC `.fs-*`
   absolute-position classes.
5. **`FeatureMenu.svelte` `compactLandscape` prop**: an icon-only 48px round
   trigger (no room for a text label at this width budget) as the leftmost
   item in the native-scale row, alongside `HudOverlay`'s strip. Deliberately
   has no active-mode badge (unlike the portrait/landscape triggers) - see
   Errors and fixes below for why.
6. **Dev-only elements marked `data-dev`** (item 4): the theme-selector and
   reel-mode-toggle buttons in `App.svelte` (both already gated behind
   `import.meta.env.DEV`) now also carry `data-dev="true"`, letting the
   conformance script's touch-target audit exclude them by attribute instead
   of guessing by selector.

## Before / after: the seven debt-table touch targets (real measurement)

All measured via the same Playwright device descriptors PR #78 used (iPhone
14 landscape, Pixel 7 landscape - both fall under the 500px compact-mode
breakpoint, so both now render the compact strip).

| Control | PR #78 (LAYOUT_SPEC, scaled) | This pass (native, compact strip) |
|---|---|---|
| SPIN | 39.7px | 60x60px |
| Turbo (speed cycle) | 38.7px | 44x44px |
| AUTO | 22.7px | 44x44px |
| Menu | 18.9px | 44x44px |
| MAX chip | 12.3x20.8px | 44x44px |
| Bet decrease | 20.8x11.3px | 44x44px |
| Bet increase | 20.8x11.3px | 44x44px |

All seven now measure at or above the 44px floor (SPIN at 60px, comfortably
above the brief's 56px minimum) - confirmed by the conformance script's
touch-target audit passing clean (0 failures, both landscape profiles) after
excluding the two `data-dev` elements, which is the correct behaviour per
item 4 (they were never real production failures, just dev-server-only
noise in a suite that has to run against `vite` for the
`window.__testStores` hook).

## Font legibility (item 3) - closes the disclosed PR #78 finding

The compact strip's own `.c-stat-label`/`.c-stat-value`/`.c-tier`/
`.c-max-cap`/`.c-mode-badge` are all native `px` values >=11px from the
start (11px labels/badges, 14px values, 11px tier/max text) - the
font-legibility audit (extended this pass to cover `.c-*` selectors,
mirroring the portrait audit's `.p-*` coverage) passes clean on both
landscape profiles. The `landscapeSmallTextDiagnostic` sample (still run
every pass per the brief's "keep the legibility assert on") - which checks
the OLD `.fs-label` (8.32px) / `.audio-label` (8px) selectors PR #78
disclosed - now comes back **empty** for both landscape profiles, since
neither device profile renders that template any more below the 500px
breakpoint. This closes disclosed thread (b) for the two profiles this
suite actually measures. Desktop landscape (>=500px tall) still renders the
old template unchanged and was never covered by any Playwright device
profile in this suite either before or after this pass - not claimed as
fixed, just genuinely out of this suite's measurement surface either way.

## Real bugs caught during verification (not assumed from the CSS)

Three real problems surfaced from actual screenshots and measurements, same
discipline as the portrait pass:

1. **Missing class binding (a real regression, caught before commit).** The
   template wired `<div class="native-hud-slot">` without the
   `class:compact-landscape={compactLandscape}` binding the new CSS rule
   depended on. Visually this meant the compact strip inherited the
   PORTRAIT branch's default `flex-direction: column` instead of `row`,
   stacking FeatureMenu's 48px trigger on top of HudOverlay's 84px-tall
   (wrongly sized) strip - measured via `getBoundingClientRect()`:
   `.native-hud-slot` was 132px tall instead of the intended 76px, and the
   bottom ~60px of the strip was clipped off-screen (canvas 264px + strip
   132px = 396px, 56px taller than the 340px viewport). Fixed by adding the
   missing `class:compact-landscape` binding; re-measured at exactly
   264+76=340px, matching the viewport with zero clipping.
2. **Stress-value truncation on both balance and bet.** With balance forced
   to $1,000,000 (the same stress figure this file's own landscape doc
   comment cites, and the value PR #78 fixed for portrait), the compact
   strip's `.c-stat-value` truncated with an ellipsis on the iPhone 14
   landscape profile (750px wide) - confirmed via
   `scrollWidth > clientWidth`, off by ~5px. An initial fix attempt
   (rebalancing `.c-stat`/`.c-stat--bet` flex ratios to give balance more
   share) actually made the BET value truncate instead, since the fixed
   ~483px available width is zero-sum across the three cells - flex-ratio
   tuning alone couldn't create width, only move it around. The real fix was
   `.c-stat`'s own horizontal padding (8px -> 4px each side), which bought
   back enough width for both balance and bet to fit without truncation on
   both device profiles - confirmed via a fresh stress-value screenshot and
   `scrollWidth`/`clientWidth` equality on all three stat values.
3. **FeatureMenu's active-mode badge, designed then removed before it
   shipped.** The first draft gave the compact trigger the same
   `entryActiveLabel` badge (OVERBOOST/CRUISE) the portrait/landscape
   triggers show. At the 48px button size available in a 76px-tall strip,
   that badge would have needed either a sub-11px font (failing the
   legibility gate) or enough vertical room to push the strip past 76px
   (re-triggering the same clipping bug as #1). Removed before it ever
   rendered in a committed screenshot - `HudOverlay`'s own `.c-mode-badge`
   on the bet stat cell already shows the same OVERBOOST/CRUISE state in the
   same visible row, so the FeatureMenu badge would have been redundant as
   well as broken.

## Production-bundle verification (item 4)

`grep` against the built `dist/assets/*.js` after `npm run build` still
finds the literal strings `"Change theme"` / `"Toggle reel mode"` /
`"data-dev"` - Svelte compiles `{#if import.meta.env.DEV}` into a runtime
conditional over the compiled render function, not a literal `if (false)`
esbuild's minifier can trivially prove dead, so the gated markup's bytes
remain in the bundle. This is a pre-existing characteristic of this
codebase's Svelte+Vite+esbuild pipeline, not something this pass changes,
and not what actually matters for "confirm absent from the production
bundle" - the meaningful, user-facing claim is DOM/runtime absence, which
**is** independently verified: served the real `dist/` output via `vite
preview` (not the dev server) and confirmed via Playwright that
`document.querySelectorAll('[data-dev]')` returns zero elements, `.theme-btn`
and `.reel-mode-btn` are both absent from the rendered DOM, and the
dev-only `window.__testStores` hook is also correctly undefined. A real
player never sees or can reach either button; only the conformance suite
(which must drive the dev server for `window.__testStores`) ever renders
them, which is exactly why the `data-dev` exclusion in the audit is the
right fix rather than a workaround.

## Deferred, per item 6: BonusInstrumentColumn (thread c)

Unchanged from PR #78's own disclosure: the Overdrive meter still has no
dedicated native-scale treatment in either portrait or compact-landscape
mode - it stays part of the scaled canvas in all three layout modes. Not
named in either brief's explicit list of what to decouple. Carried forward
as an open thread for a future Overdrive-focused frontend pass, not lost.

## Minor, non-blocking observation (not fixed, disclosed)

FeatureMenu's compact trigger reuses the same hamburger-line glyph
(`M4 6h16M4 12h16M4 18h10`) as HudOverlay's menu button - consistent with
every other layout mode (portrait's `.p-fm-entry`, landscape's
`.fm-entry-knob` both use the identical path), so this isn't a new defect
introduced by this pass. In compact mode specifically, the two buttons now
sit directly adjacent in one row, which makes their visual similarity more
noticeable than in the other modes where they're further apart. A distinct
icon for FEATURES would be a deliberate iconography decision better made by
the owner/Fable than silently changed mid-technical-pass, so it's flagged
here rather than acted on.

## Verification

- `npx svelte-check --tsconfig ./tsconfig.json`: 207 files, 6 pre-existing
  `node_modules` errors only (same as before this pass), nothing new.
- `npm run build`: succeeds, no new warnings.
- `node scripts/portrait_layout_conformance.mjs` (final run, all 4
  profiles):

  | Profile | Touch-target | Font-legibility | Frame-gate | Small-text diagnostic |
  |---|---|---|---|---|
  | iphone14-portrait | PASS (0 failing) | PASS (10 checked) | PASS (0 long frames) | n/a |
  | iphone14-landscape | PASS (0 failing) | PASS (8 checked) | PASS (0 long frames) | empty |
  | pixel7-portrait | PASS (0 failing) | PASS (10 checked) | PASS (0 long frames) | n/a |
  | pixel7-landscape | PASS (0 failing) | PASS (8 checked) | PASS (0 long frames) | empty |

  All four profiles clean - the suite's overall exit code is 0 for the first
  time since PR #78 introduced the landscape debt table.
- Portrait screenshots (`reports/screens/portrait-v1/`) re-captured this run
  too (12 files, unchanged code path) - committed refreshed rather than left
  stale, since re-running the full suite is how this pass verified the
  landscape side didn't regress portrait.
- Landscape screenshots now live in `reports/screens/landscape-compact-v1/`
  (12 files: 2 profiles x idle/spin/win/buy-modal/paytable/overboost-active)
  - moved out of `portrait-v1/` since their content is fundamentally
  different now (compact strip, not the old LAYOUT_SPEC panel); the stale
  originals were `git rm`'d rather than left orphaned.
- Locked files confirmed untouched: `git diff --stat -- frontend/src/lib/
  services/rgsService.ts frontend/src/lib/stores/gameStore.ts
  games/future_spinner/ .claude/settings.json` is empty.
- Grepped every new/changed file for em/en dashes: none introduced.

## Governing brief (quoted in full, for the record)

> LANDSCAPE COMPACT HUD PASS, 2026-07-14b. Conventions, locks and reporting
> as pinned; Sonnet, High effort (the decoupling pattern is proven from PR
> #78; this is now specified work); proofs to
> reports/screens/landscape-compact-v1/. (1) Gate by height, not
> orientation: whenever innerHeight is below 500px in landscape, decouple
> the HUD from the stage scale exactly as the portrait pass did and render a
> native-scale compact single-row control strip: menu, then the stats
> cluster (balance, win, bet with steppers), then turbo, AUTO, and SPIN at
> 56px or larger on the right; the canvas scale-to-fits the remaining height
> above the strip; desktop landscape at 500px height or more is unchanged.
> (2) All seven production touch targets from the PR #78 debt table must
> reach 44px effective: SPIN 39.7, turbo 38.7, AUTO 22.7, Menu 18.9, MAX chip
> 12.3x20.8, both bet steppers 20.8x11.3. (3) The native-scale strip must
> also clear the sub-11px landscape text findings (.fs-label, .audio-label),
> closing disclosed thread (b) in the same stroke; keep the legibility
> assert on. (4) Mark the dev-only theme and reel-mode buttons data-dev,
> confirm both are absent from the production bundle, and exclude
> absent-in-prod elements from the production audit so the landscape
> profiles can reach a true pass. (5) The conformance suite's two landscape
> profiles must finish with touch, font and frame gates all green; commit
> the same six states per profile as proofs. (6) BonusInstrumentColumn's
> portrait treatment stays deferred as scoped (thread c), queued for a
> future Overdrive polish pass; note it in the session report so it isn't
> lost. Merge PR #78 first, then run this pass on a fresh branch.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, High effort. **Approach:** applied the
  portrait pass's proven decoupling mechanism (drop `.game-wrapper`'s scale
  transform, give the canvas its own nested scale, native-DOM HUD below) to
  a second, height-gated breakpoint rather than inventing a new mechanism -
  the only genuinely new design decision was the compact strip's own
  horizontal composition and where to fit MAX/FEATURES into the brief's
  named order. Caught three real bugs from actual measurements/screenshots
  before they shipped (missing class binding causing 56px of clipping,
  stress-value truncation, an over-cramped active-mode badge) rather than
  trusting the CSS by inspection.
- **Alternatives rejected:** rebalancing flex ratios alone to fix the
  stress-value truncation (didn't work - zero-sum width, fixed by reducing
  padding instead, which actually freed width rather than moving it around);
  giving FeatureMenu's compact trigger the same active-mode badge the other
  modes have (would have failed either the legibility gate or the 76px
  strip-height budget; redundant with HudOverlay's own bet-cell badge in the
  same row anyway).
- **Files touched:** `frontend/src/App.svelte` (compact-landscape detection,
  canvas-slot/canvas-inner/native-hud-slot generalisation, data-dev
  attributes), `frontend/src/lib/components/HudOverlay.svelte`
  (compactLandscape prop + template/CSS, stat-cell padding/flex fix),
  `frontend/src/lib/components/FeatureMenu.svelte` (compactLandscape prop +
  compact trigger), `frontend/scripts/portrait_layout_conformance.mjs`
  (data-dev exclusion, compact-landscape font audit, dual screenshot roots).
  Locked files untouched.
- **Open threads:** (a) desktop landscape (>=500px tall) has never been
  covered by any Playwright device profile in this suite, before or after
  this pass - its `.fs-label`/`.audio-label` text and touch targets remain
  genuinely unmeasured by this conformance suite (not claimed fixed, not
  claimed broken). (b) FeatureMenu's compact trigger icon is visually very
  similar to the adjacent menu button - a real but minor UX polish item,
  disclosed above, not acted on pending an owner/Fable call on iconography.
  (c) BonusInstrumentColumn still has no native-scale treatment in any
  layout mode - carried forward per item 6, queued for a future
  Overdrive-focused pass. (d) Fable reviews the pushed proofs (both
  `reports/screens/portrait-v1/` and the new
  `reports/screens/landscape-compact-v1/`) next check-in, per the standing
  convention, before any merge.
