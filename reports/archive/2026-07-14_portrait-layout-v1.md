# Session Report: PORTRAIT LAYOUT PASS, 2026-07-14

- **Date:** 2026-07-14
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/lumen-sideproject` (continuing the session's working branch;
  no locked files touched, per the brief's explicit "no locked files"
  constraint).
- **Source:** pasted brief, "PORTRAIT LAYOUT PASS, 2026-07-14", saved verbatim
  is not applicable here (brief arrived mid-conversation, not as a standalone
  file) - the governing instruction is quoted in full in this report's
  Verification section instead.

## Problem

The fixed 1280x720 design surface (`STAGE_W`/`STAGE_H` in `App.svelte`) scales
to fit any viewport via `S = min(innerWidth/1280, innerHeight/720)`, applied as
a single `transform: scale(S)` on `.game-wrapper`. On a portrait phone this
picks `innerWidth/1280` as the limiting factor, producing a very small `S`
(~0.30-0.32 at real phone widths) and shrinking everything inside
`.game-wrapper` in lockstep - including the DOM-based HUD, which has no
independent size of its own. The result: a native app rendered as a tiny
letterboxed strip in the middle of a tall screen.

## Before / after scale factors (measured via Playwright device descriptors,
   not assumed)

| Device | Viewport (measured) | Old `S` (whole stage incl. HUD) | New canvas scale | New HUD scale |
|---|---|---|---|---|
| iPhone 14 portrait | 390x664 | 0.3047 | 0.2925 | 1.0 (native) |
| Pixel 7 portrait | 412x839 | 0.3219 | 0.3090 | 1.0 (native) |
| iPhone 14 landscape | 750x340 | 0.4688 (unchanged) | n/a | 0.4688 (unchanged) |
| Pixel 7 landscape | 863x360 | 0.5000 (unchanged) | n/a | 0.5000 (unchanged) |

The portrait canvas scale is marginally *smaller* than the old whole-stage
`S` (0.2925 vs 0.3047 on iPhone 14) - the headline change is not a bigger
canvas, it's that the HUD stopped being multiplied by that tiny factor at
all. It now renders at native 1:1 DOM scale, stacked below the canvas.

## Composition decisions

1. **Layout-mode detection** (`App.svelte`): `portrait = innerHeight >
   innerWidth`, recomputed on resize alongside the existing `computeS()`.
2. **`.game-wrapper` becomes conditionally unscaled.** This is the load-bearing
   architectural decision. A CSS `transform` on an ancestor creates a new
   containing block for `position: fixed` descendants, re-anchoring them to
   that ancestor's *scaled* bounding box instead of the true viewport. Every
   modal in this tree (`PaytableModal`, `BuyBonus`, `SessionPanel`,
   `MaxWinCelebration`, `ThemeSelector`, `LoadingScreen`, `IntroSplash`) relies
   on `.game-wrapper` NOT being a transformed ancestor to correctly cover the
   real screen. So in portrait, `.game-wrapper.portrait` drops `transform:
   scale(S)` entirely and becomes a full-viewport, unscaled flex column;
   landscape's `.game-wrapper` is completely unchanged (still 1280x720,
   still `transform: scale(S)`). This was the deciding factor against an
   earlier, rejected plan (see Alternatives below) that would have kept
   `.game-wrapper` scaled and instead tried to relocate every modal
   component's template position - the containing-block fix is a single,
   universal, low-risk change instead of N per-component relocations.
3. **`.canvas-slot` / `.canvas-inner`**: the scene/frame/grid/logo/WinBanner
   subtree (previously direct children of `.game-wrapper`) is now wrapped in
   `.canvas-inner`, which keeps the exact same 1280x720 coordinate space and
   all existing absolute-positioned children unchanged. In portrait,
   `.canvas-inner.portrait` gets its own `transform: translateX(-50%)
   scale(portraitCanvasScale)` (`portraitCanvasScale = 0.96 * innerWidth /
   1280`, i.e. 96% of viewport width per the brief), anchored top-center
   inside `.canvas-slot` (which reserves the correct flex height,
   `STAGE_H * portraitCanvasScale`, so the native HUD below it starts at the
   right offset). In landscape both are simple 100%-sized pass-through
   wrappers with no transform of their own - `.game-wrapper`'s existing
   `scale(S)` does all the work, identical to before this pass.
4. **`.portrait-hud-slot`**: a native-flow flex column, sibling of
   `.canvas-slot`, holding `<FeatureMenu portrait>` and `<HudOverlay
   portrait>`. `flex: 0 0 auto` (sized to its own content) - see Errors and
   fixes below for why this matters.
5. **`HudOverlay.svelte` `portrait` prop**: a full parallel template (stats
   row: balance/win, then a full-width BET row with 44px steppers; controls
   row: menu, turbo/speed, a 72px central SPIN, MAX, autoplay), fully
   self-contained CSS (`.p-*` classes, no reuse of the landscape `.fs-*`
   LAYOUT_SPEC absolute-position classes - two early drafts tried reusing
   `.menu-wrapper`/`.autoplay-wrapper`/`.fs-menu` and both had to be reverted
   because those classes carry hardcoded `position: absolute; left: NNNpx`
   coordinates from the 1280x720 spec). Every native px size and font size is
   literal (`px`, not `rem`) so the 44px touch-target and 11px font floors are
   real regardless of root font-size.
6. **`FeatureMenu.svelte` `portrait` prop**: swaps the absolute-positioned
   `.fm-entry` knob (pinned beside the frame at 1280-space coordinates) for a
   full-width `.p-fm-entry` button rendered inside `.portrait-hud-slot`,
   "FEATURES" reachable directly above the controls row per the brief. The
   modal itself (`.fm`, `position: fixed; inset: 0`) needed no changes - it
   automatically covers the true viewport once `.game-wrapper` stops
   transforming it (item 2 above).
7. **Safe-area insets**: `viewport-fit=cover` added to `index.html`'s meta
   tag; `.game-wrapper.portrait` gets `padding-top/left/right:
   env(safe-area-inset-*)`; `.p-hud` (HudOverlay) already had bottom
   safe-area padding from the draft; `SessionPanel`'s corner panel
   (`top:1rem;right:1rem`) gets `calc(1rem + env(safe-area-inset-*))` so it
   doesn't sit under a notch/dynamic island now that it's genuinely anchored
   to the true screen corner.
8. **`BonusInstrumentColumn` (Overdrive meter) is not given a dedicated native
   portrait treatment this pass** - not named in the brief's explicit list
   (stats row, controls row, SPIN, MAX, FEATURES); it stays part of the
   scaled canvas in both modes. Disclosed as a known scope boundary, not a
   silent omission - worth a native-scale pass alongside a future feature-math
   frontend session, since during Overdrive it currently shrinks along with
   the rest of the canvas.

## Verification at 390x844 / 430x932 (item 3) - real findings, not assumed

Ran the exact composition through Playwright at real device profiles and
looked at the committed screenshots rather than assuming the CSS was correct:

- **Dead-gap bug (caught, fixed).** The first working draft used
  `.portrait-hud-slot { flex: 1 1 auto; justify-content: flex-end }`,
  intending to keep the HUD reachable near the thumb zone. In practice this
  stretched the slot to fill *all* remaining viewport height and then pushed
  its children to the bottom of that box - producing a large, dead,
  backdrop-only gap between the grid and the FEATURES/HUD controls. Caught
  from the first committed screenshot, not from reasoning about the CSS in
  the abstract. Fixed by changing to `flex: 0 0 auto` (sized to content,
  immediately below the canvas); any true leftover space on an unusually tall
  phone now collects at the very bottom, which reads as ordinary safe-area
  padding rather than a broken composition.
- **Bet-stepper touch target (caught by the new audit script, fixed).** The
  first draft's `.p-bet-step` was 30x30px - the audit script measured it and
  failed the 44px gate. Bumping the button itself to 44x44 collided with a
  second real bug: a single 3-column stats row (balance / win / bet) has no
  room for two 44px buttons plus a `$1,000,000.00`-scale bet figure (this
  file's own doc comment says balance is stress-tested to that value in
  landscape - portrait needs the same guarantee) without either clipping the
  currency text or shrinking the steppers back down. Confirmed the overflow
  in a stress screenshot (balance text visibly clipped at the card edge), then
  restructured to balance+win as a 2-up row with BET as its own full-width
  row below - both problems solved by the same layout change, verified by a
  second screenshot showing `$1,000,000.00` rendering in full.
- **Paytable "ways to win" diagram overflow (caught, fixed).** The 5-cell
  adjacency diagram (5x56px cells + 4 arrows, ~464px) overflowed the ~92%-wide
  panel at 390px viewports, cropping the outer cells - visible in the first
  committed paytable screenshot. Added a small-viewport rule (existing
  `@media (max-width: 500px)` block, already used for the symbol grid)
  shrinking cells to 40px and arrow padding, confirmed by re-checking
  `scrollWidth > clientWidth` on the diagram element after the fix (`false`).
- **Buy modal, win banner, SessionPanel**: verified via committed screenshots
  at both device profiles - all three already used viewport-relative sizing
  (`min(92vw, 400px)`, `min(90vw, 360px)`) that only needed `.game-wrapper` to
  stop being a transformed ancestor to render correctly; no CSS changes
  needed once item 2 above was in place.

## Landscape phone audit (item 4) - real numbers, partial fix, rest disclosed

Measured (not assumed) via Playwright's `iPhone 14 landscape` / `Pixel 7
landscape` device descriptors: actual `S` is 0.469-0.500, lower than the
brief's stated ~0.54 reference point. At that real scale, effective (post-scale)
sizes for the LAYOUT_SPEC v3.x control strip:

| Control | Source size | Effective @ S=0.469-0.500 | Verdict |
|---|---|---|---|
| `.fs-spin` (SPIN) | 84x84 | ~39.4-42.0 | fails narrowly (was ~45.5 at the assumed 0.54) |
| `.fs-turbo` (bumped 72->82 this pass) | 82x82 | ~38.5-41.0 | fails narrowly, improved from ~33.8-36.9 |
| `.fs-auto` (AUTO) | 48x48 | ~22.5-24.0 | fails |
| `.fs-menu` (hamburger) | 40x40 | ~18.8-20.0 | fails |
| `.fs-max` (MAX chip) | 26x44 | ~12.2-13.0 x ~20.6-22.0 | fails |
| `.fs-arrow` (bet +/-) | 44x24 | ~20.6-22.0 x ~11.3-12.0 | fails |

`.fs-turbo` got a real, safe bump (72x72 -> 82x82, recentred, no neighbour
collision - the 40px gap to `.fs-menu` absorbs it) since there was genuine
margin. Every other control in the panel is packed into gaps of 7-40px with no
spare room: `.fs-max` sits in a ~40px gap between `.fs-turbo` and `.fs-menu`
with only ~7px clearance each side pre-bump; `.fs-auto` is boxed between
`.fs-arrows` above and the 720px stage bottom edge below; the two `.fs-arrow`
buttons are stacked in a 52px-tall column that can't grow without colliding
with `.fs-auto`. Reaching 44px effective at the real ~0.47-0.50 scale needs
source sizes of roughly 88-94px - satisfying that for every control requires
re-spacing the whole LAYOUT_SPEC v3.x panel (moving anchor points further
apart, likely widening the panel itself), not a same-position size bump. That
is out of proportion to a single audit-and-bump line item in an otherwise
portrait-focused brief and risks visually regressing a previously-tuned,
shipped composition without dedicated visual QA across the many aspect ratios
`v3.1`-`v3.6`'s version history suggests it was tuned against.

**Disclosed, not silently left unfixed**: `frontend/scripts/
portrait_layout_conformance.mjs`'s touch-target gate correctly and
permanently fails on the landscape profiles (9 controls each run) until a
dedicated LAYOUT_SPEC re-spacing pass lands. This is intentional - an honest
red result that names the exact controls and their measured sizes beats a
green result that either silently exempts them or forces a rushed,
under-verified redesign this pass.

## New, permanent QA suite (item 5)

`frontend/scripts/portrait_layout_conformance.mjs` (new, run:
`node scripts/portrait_layout_conformance.mjs` from `frontend/`):

- Playwright device descriptors `iPhone 14` / `Pixel 7`, portrait and
  landscape each (4 profiles total).
- Committed screenshots per profile to `reports/screens/portrait-v1/
  <device>-<orientation>/`: `idle.png`, `spin.png`, `win.png`,
  `buy-modal.png`, `paytable.png`, `overboost-active.png` (24 files).
- Touch-target audit: enumerates every visible, on-screen `button,
  [role=button], input, a[href], [tabindex]`, asserts effective (post-scale)
  bounding box >= 44px on both dimensions. Explicitly excludes elements
  positioned entirely outside the true viewport - PixiJS's own internal
  accessibility helper button (rendered off-screen at `top: -1000px` by its
  `AccessibilityManager`) was initially caught as a false failure until this
  exclusion was added.
- Font-legibility assert: portrait HUD's own text elements (`.p-stat-label`,
  `.p-stat-value`, `.p-spin-txt`, `.p-tier`, `.p-max-cap`,
  `.p-fm-entry-label/-active`, `.p-mode-badge`) computed font-size >= 11px.
  Scoped to the new portrait elements only, not a blanket page-wide scan -
  the pre-existing landscape `.fs-label` (8.32px) / `.audio-label` (8px) text
  predates this pass and is sampled as a diagnostic (see below), not gated,
  to avoid conflating a genuinely new regression with a pre-existing,
  separately-scoped finding.
- Frame-gate: 5 spins per profile, RAF-based frame-time sampling, asserts
  zero frames over 100ms. All 4 profiles pass clean (0 long frames) on the
  final run - an earlier iPhone 14 portrait run showed a single ~250ms frame
  out of 327 samples (0.3%), not reproduced on Pixel 7 portrait (same code
  path, 0 long frames) or on the final re-run, consistent with a one-off
  cold-start hitch rather than a systemic portrait regression.
- Exits non-zero on any failure (collects every `pass: false` anywhere in the
  results tree) - currently exits 1 due to the disclosed landscape
  touch-target debt above; this is accurate, not a script bug.
- `standingMode` added to HudOverlay's existing dev-only `window.__testStores`
  hook (alongside `balance`/`betAmount`/`winAmount`/`rgsBetLevels`/`locale`/
  `speedTier`) so the suite can force OVERBOOST/Cruise for the
  `overboost-active` screenshot without driving the FeatureMenu UI through
  every device/orientation combination.

**Diagnostic-only, not gated** (`landscapeSmallTextDiagnostic` in the JSON
output): `.fs-label` (8.32px) and `.audio-label` (8px) in the existing,
already-shipped landscape HUD - both already under the 11px floor
independent of any stage-scale multiplication, predating this pass. Not
fixed here (scope creep into unrelated, previously-shipped landscape CSS) and
not silently hidden (sampled every run, visible in the JSON output).

## Alternatives considered and rejected

- **Duplicating the entire App.svelte template behind `{#if portrait}`**
  (considered first): would have meant two full copies of every modal,
  overlay, and canvas element. Rejected once the containing-block mechanism
  (item 2 above) was identified - a single conditional on `.game-wrapper`'s
  own transform fixes every modal's positioning universally, needing
  duplicated markup only for the two components the brief explicitly asks to
  decouple (HudOverlay, FeatureMenu).
- **Cropping the canvas to its "visible content" height** (~560px of the
  1280x720 space) to avoid the flex-height mismatch: rejected as fragile
  cropping math for marginal benefit; the simpler fix (`.portrait-hud-slot`
  sized to its own content) solved the actual observed bug without touching
  the canvas's own dimensions.
- **Bumping every landscape control to 44px effective this pass**: rejected
  after real Playwright measurement showed the panel has 7-40px of spare
  margin against controls that would need ~50px more each - the honest
  finding is "needs a re-spacing pass," not a rushed same-position bump that
  either collides with neighbours or doesn't actually clear the floor.

## Verification

- `npx svelte-check --tsconfig ./tsconfig.json`: 207 files, 6 pre-existing
  errors (all in `node_modules` type declarations - `@typescript-eslint/types`
  resolution and a `css-font-loading-module` conflict - unrelated to this
  pass, present before and after).
- `npm run build`: succeeds, same pre-existing Svelte compiler warnings
  (unused CSS selectors in `GameGrid.svelte`, lowercase `<tr>` in
  `PaytableModal.svelte`) as before this pass.
- `node scripts/portrait_layout_conformance.mjs`: final run, all 4 profiles -
  portrait touch-target/font-legibility/frame-gate all PASS; landscape
  touch-target 9 known/disclosed failures per profile (see table above),
  frame-gate PASS on all 4.
- Locked files confirmed untouched: `git diff --stat -- frontend/src/lib/
  services/rgsService.ts frontend/src/lib/stores/gameStore.ts
  games/future_spinner/ .claude/settings.json` is empty.
- Grepped every new/changed file for em/en dashes: none introduced (this
  report itself uses only hyphens and the word "to").

## Governing brief (quoted in full, for the record)

> PORTRAIT LAYOUT PASS, 2026-07-14. Conventions, locks and reporting as
> pinned; no locked files; proofs to reports/screens/portrait-v1/. Problem:
> the fixed 1280x720 design surface scale-to-fits on portrait phones (~0.30
> factor), miniaturising the entire game including the DOM HUD, which is
> currently coupled to the stage scale. Required outcome: a native-feeling
> portrait composition. (1) Add a layout mode: portrait whenever innerHeight
> > innerWidth; landscape keeps the existing scale-to-fit stage. (2) Portrait
> composition: the canvas (scene plus grid) fits to roughly 96 percent of
> viewport width, positioned in the upper portion with the scene backdrop
> filling behind; decouple the HUD from the stage scale so it renders at
> native DOM size and re-stacks below the grid: a compact stats row (balance,
> win, bet with steppers), then a controls row with the menu, the
> OVERBOOST/Cruise badge zone, a large central SPIN button of at least 64px,
> and MAX; the FEATURES button stays reachable above the controls; every
> interactive target at least 44px effective; fonts at native size, never
> stage-scaled; respect safe-area insets (add viewport-fit=cover to the meta
> tag and use env(safe-area-inset-*) padding). (3) Verify the paytable, buy
> modal, win banner and settings panel at 390x844 and 430x932; adjust their
> small-viewport CSS if anything occludes or overflows. (4) Landscape phone:
> keep the current approach but audit effective touch-target sizes at the
> 0.54 scale and bump any interactive element under 44px effective. (5) QA,
> new and permanent: Playwright device descriptors with isMobile true
> (iPhone 14, Pixel 7), portrait and landscape each: committed screenshots of
> idle, spin, win, buy modal, paytable and OVERBOOST-active states; a
> touch-target audit script that enumerates interactive elements and asserts
> effective size at least 44px; an effective-font-size legibility assert
> (minimum 11px rendered); fold all of it into the conformance suite so it
> runs forever; re-run the frame-gate attribution on the mobile profile. (6)
> Session report records the before/after scale factors and any composition
> decisions taken; Fable reviews the committed proofs next check-in before
> the owner re-tests on a real phone.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** identified
  the CSS containing-block mechanism early (a `transform` on `.game-wrapper`
  re-anchors every `position: fixed` modal to its scaled bounding box, not
  the true viewport) and used it as the single lever for the whole pass -
  making `.game-wrapper` conditionally unscaled in portrait fixes every
  modal's positioning for free, needing duplicated markup only for
  HudOverlay/FeatureMenu (the two components the brief explicitly names for
  decoupling). Iterated three times against real Playwright screenshots
  before landing the final composition (dead-gap, bet-stepper overflow,
  paytable diagram overflow) - none of those three bugs were visible from
  reading the CSS alone, only from the committed proofs.
- **Alternatives rejected:** full template duplication behind `{#if
  portrait}` (unnecessary once the containing-block fix was found); cropping
  the canvas to its visible-content height (fragile, unnecessary once the HUD
  slot was fixed to `flex: 0 0 auto`); forcing every landscape control to
  44px this pass (real measurement showed insufficient margin - disclosed as
  follow-up work instead of a rushed fix).
- **Files touched:** `frontend/index.html` (viewport-fit=cover),
  `frontend/src/App.svelte` (portrait detection, canvas-slot/canvas-inner/
  portrait-hud-slot restructure), `frontend/src/lib/components/
  HudOverlay.svelte` (portrait prop + template/CSS, bet-stepper 44px fix,
  landscape turbo 72->82px bump), `frontend/src/lib/components/
  FeatureMenu.svelte` (portrait prop + native trigger), `frontend/src/lib/
  components/PaytableModal.svelte` (small-viewport ways-diagram fix),
  `frontend/src/lib/components/SessionPanel.svelte` (safe-area insets),
  `frontend/scripts/portrait_layout_conformance.mjs` (new, permanent QA
  suite). Locked files untouched.
- **Open threads:** (a) landscape touch-target debt for `.fs-auto`,
  `.fs-menu`, `.fs-max`, `.fs-arrow` (and `.fs-spin`/`.fs-turbo` narrowly)
  needs a dedicated LAYOUT_SPEC re-spacing pass - real numbers are in this
  report and in the conformance script's JSON output, so it doesn't need
  rediscovering cold. (b) The pre-existing sub-11px landscape text
  (`.fs-label`/`.audio-label`) is a separate, disclosed, out-of-scope
  finding - same status. (c) `BonusInstrumentColumn` (Overdrive meter) has no
  dedicated portrait treatment yet - stays inside the scaled canvas, a
  reasonable v1 scope boundary but worth native-scale treatment alongside a
  future Overdrive-focused frontend pass. (d) Fable reviews the committed
  `reports/screens/portrait-v1/` proofs next check-in, per the brief, before
  the owner re-tests on a real phone.
