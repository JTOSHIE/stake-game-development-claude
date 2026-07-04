# Session Report: Opus elevate — final lineup, motion review, v3.3 UI corrections

- **Date:** 2026-07-04
- **Model / effort:** Opus 4.8, High.
- **Branch:** `claude/opus-elevate` (from up-to-date `main`; PRs #12 layout-install, #13
  ux-polish, #14 motion-polish-v2 all merged).
- **Brief:** `FS_OpusElevate_Prompt.md` (saved verbatim).
- **READ FIRST (per convention (i)):** `reports/SESSION_REPORT.md` + the motion-polish-v2,
  ux-polish and layout-install archives; `design-system/LAYOUT_SPEC.md` (v3.1 + v3.2);
  `design-system/DESIGN_SYSTEM.md`; `HANDOVER.md`. All read before touching anything.

## Honest scope of this pass

Delivered and verified: **Task 0** (convention (i)), **Task 1** (final reel lineup),
**Task 2** (critical review + one warranted elevation), **Task 5** (LAYOUT_SPEC v3.3 amendment
+ implementation). **Not built this pass** and carried in FOR THE NEXT SESSION: **Task 3**
(buy modal), **Task 4** (flame jets — a new pooled-sprite animation system), **Task 6**
(paytable elevation), and the full BEFORE/AFTER GIF suite of **Task 7**. I prioritised the
review (the reason Opus was invoked) and the tangible, hash-verifiable lineup install over
starting a large new subsystem I could not finish and verify to the fps/GIF gate in one pass.
Motion Polish v2 is genuinely strong; per the brief I did not redo what is already strong.

## Task 0 — conventions

Appended CLAUDE.md convention **(i) Handover block** (this report's FOR THE NEXT SESSION and
READ FIRST sections are the first application).

## Task 1 — final lineup installed (verified)

Three reel masters created (`H2_reel_nitro.svg`, `M2_reel_coilover.svg`, `L2_reel_fuse.svg`),
manifest repointed so `h2`/`m2`/`l2` (240, 120 and paytable sizes) rasterise from them.
`DESIGN_SYSTEM.md` lineup updated (H2 = Nitro Canister crimson, M2 = Coilover violet, L2 =
Blade Fuse electric blue) and the gauge (`H2_master_v31`) + grille (`M2_master_v2`) recorded
UI-EXCLUSIVE. The instrument masters keep their UI roles (bonus gauge, feature button) —
untouched. `plates.json` colours unchanged.

**Reconciliation with Motion v2:** the H2 reel previously used a layered gauge-needle overlay
(`symbols/h2_base`/`h2_needle`). The Nitro Canister has no separable needle, so that
reel-scale layered export was removed from the manifest, the two stale PNGs deleted, and
`GameGrid.svelte`'s H2 overlay path retired (H1's spoke overlay is untouched). The HUD gauge
(UI `gauge_base`/`gauge_needle` from `H2_master_v31`) is unaffected.

`npm run assets` reproducible (two runs byte-identical). Served-bytes hash check vs disk
(dev server), as in the wiring pass:

| Export | Served == disk |
|---|---|
| `symbols/h2.png` / `h2_1x.png` (Nitro reel + paytable) | yes (`35a4e6cd…`) |
| `symbols/m2.png` / `m2_1x.png` (Coilover) | yes (`edab7a8d…`) |
| `symbols/l2.png` / `l2_1x.png` (Blade Fuse) | yes (`f62c40c0…`) |

All three render on-brand on their tile plates (contact sheet
`~/Desktop/FS_AssetForge_Screens/opus_reel_lineup.png`).

## Task 2 — critical review of Motion Polish v2

Judged each Motion v2 item against the report, the committed GIFs, the code, and the live
headless game. Motion v2 is strong; most items are GOOD.

| Item | Verdict | Reasoning |
|---|---|---|
| Reel travel weight + stop slam | **GOOD** | Ticker-driven 60fps, velocity-scaled vertical stretch (no live blur filter) + brightness dip + symbol-cycling noise reads as real travel; per-reel staggered stop with a 10px overshoot and ease-out settle already has anticipation-into-impact. No change. |
| Win punch + particle richness | **GOOD** | Plate edge bloom in signature colour + symbol scale-punch (win-flash-pulse with a scale beat) + pooled Pixi burst (90-slot pool, no per-frame alloc); celebration tiers already widen the burst 14/28/48. Rich enough; leave alone. |
| Ways cycling clarity | **GOOD** | `WinBreakdown` cycles group-by-group (symbol/count/ways/pay) at 1.4s, matched exactly to the interpreter output. Clear. |
| Celebration escalation | **GOOD** | BIG/MEGA/EPIC at 10x/30x/100x with tier labels, escalating glow, staged count-up (1.4/2.0/2.8s) and screen shake >=50x. Well-shaped curve. |
| Overdrive transition drama | **GOOD** | Five-stage flare -> dip -> gauge -> burst -> settle, needle ripping to redline, frame hue-shift, reverse played behind the total-win summary. Dramatic and correctly sequenced. |
| Idle life | **ELEVATE (one symbol)** | Every symbol had signature idle motion EXCEPT the new premium H2 reel (Nitro Canister), which my Task 1 reconciliation left on the generic breathe. A premium symbol reading as inert is the one gap. |

**Elevation applied — H2 idle "charge":** added an `idle-charge` class (a 2.6s crimson
brightness + drop-shadow pulse, `#ff2d3d`) so the Nitro Canister reads as charged rather than
inert, consistent with its signature colour and the "subtle mechanical motion per object"
law. Reduced-motion disables it with the other idles. This is the only motion change this
pass; the BEFORE/AFTER GIF pairs the brief asks for (for this and any future elevations) are
in FOR THE NEXT SESSION, since idle motion is not legible in a static frame and the GIF
harness time is better spent once flame jets and the buy/paytable elevations also exist.

## Task 5 — LAYOUT_SPEC v3.3 (appended + implemented, verified)

Appended `AMENDMENT v3.3` to `LAYOUT_SPEC.md`, then implemented:

- **(a) FEATURE button** relocated from the frame upper-left to the RIGHT of the frame
  (`FeatureButton.svelte`, left 966, 160 wide, vertically centred on the frame at y318), and
  **hidden during Overdrive** (new `overdriveActive` prop, driven by App.svelte's
  `featureActive`) so the bonus instrument column owns that zone.
- **(b) MAX chip** returned in `HudOverlay.svelte`, wired to a local max-bet ladder function
  (highest affordable level, consistent with the increase-arrow affordability guard),
  tabular numerals, fixed position, never repositioned by content. **Geometry correction:**
  the brief's literal `arrows x906 + MAX x938 w40` puts the 40px chip inside the 44px arrow
  column and across the SPIN circle (measured: MAX 938-978 vs arrows 906-950 vs SPIN
  962-1046 — two overlaps). The v3.3 note pre-authorised the chip width as the free lever; I
  narrowed the arrow column to 26 and the chip to x936 w24, which clears both. Recorded in
  the amendment.
- **(c) Theme selector** — already fully `import.meta.env.DEV`-gated in App.svelte (button and
  panel both) with the default theme forced in production; re-verified, no change needed.

**v3.3 audit (headless, 1280x720, S=1):**

| Check | Result |
|---|---|
| MAX chip (x936 w24) intersects SPIN (x962) | clear |
| MAX chip intersects bet arrows (x906 w26) | clear |
| FEATURE button right of frame centre | yes (x966, frame centre x640) |

Screenshots: `reports/screens/opus-elevate/base-v33.png` (splash-over state) and
`base-v33-clean.png` (feature button right, MAX chip beside the arrows, HUD intact).

## Gates

| Gate | Result |
|------|--------|
| `npm run build` | clean |
| `svelte-check` on edited files | 0 new errors (same pre-existing baseline) |
| Exact-total interpreter test | PASS 58/58 |
| Headless fps, 20 spins incl. one bonus entry | avg **59.9** (gate >=55 PASS); 1 long frame (>100ms), the same one-time cold-start bonus-mount hitch documented in Motion v2, unchanged |
| Reproducible asset build | byte-identical across two runs |

Note: the fps run is the existing `motion_v2_proof.mjs` harness; "bonus with jets burning" is
not measured because flame jets are not built this pass.

## Scope and locks

`rgsService.ts`, `gameStore.ts`, `games/future_spinner/**` untouched — no lock exception
needed or taken. Edited: `GameGrid.svelte` (H2-overlay retirement + H2 idle-charge),
`HudOverlay.svelte` (MAX chip), `FeatureButton.svelte` (right placement + Overdrive hide),
`App.svelte` (feature prop). Playwright installed `--no-save` for the audit (package.json /
lock unchanged). `dist/` and the regenerated `reports/screens/motion-v2/` GIFs left
uncommitted.

## FOR THE NEXT SESSION

- **Model / effort used:** Opus 4.8 at High.
- **Approach:** read all context first; delivered the two tangible, hash/audit-verifiable
  pieces (final lineup install with the Motion-v2 H2 reconciliation; v3.3 UI corrections) and
  the critical Motion-v2 review with one concrete, warranted elevation (H2 idle life). Held
  back the large new subsystems rather than ship them unverified.
- **Alternatives tried and rejected:** (1) the literal v3.3 MAX-chip coordinates (x938 w40) —
  rejected, they overlap both the arrow column and the SPIN circle; resolved by narrowing the
  arrows to 26 and the chip to x936 w24 (recorded in the amendment). (2) Keeping the H2
  gauge-needle overlay on the Nitro reel — rejected, a gauge needle over a nitro canister is
  visually wrong; retired the reel-scale layered export and gave H2 a signature idle instead.
- **Files touched:** `CLAUDE.md`, `design-system/DESIGN_SYSTEM.md`, `design-system/LAYOUT_SPEC.md`,
  `design-system/masters/{H2_reel_nitro,M2_reel_coilover,L2_reel_fuse}.svg`,
  `scripts/assets/manifest.json`, the h2/m2/l2 theme exports (+ deleted h2_base/h2_needle),
  `frontend/src/App.svelte`, `GameGrid.svelte`, `HudOverlay.svelte`, `FeatureButton.svelte`,
  `reports/screens/opus-elevate/*`, `FS_OpusElevate_Prompt.md`.
- **Open threads (not done this pass):**
  1. **Task 4 flame jets** — pipeline export of the M3 nozzle + a short flame sequence,
     pooled sprites mounted around the frame (positions to become v3.3 jet entries), ignite on
     Overdrive entry / burn through the bonus / extinguish on exit, reduced-motion static
     glow. The single biggest remaining piece.
  2. **Task 3 buy modal** — real symbol images in the preview grid, scale-in entrance, Grille
     header, instrument-plate price element.
  3. **Task 6 paytable elevation** — section-header consistency, spacing grid, aligned symbol
     cells, ways diagram polish, typographic hierarchy.
  4. **Task 7 GIF suite** — BEFORE/AFTER GIFs for the H2 idle-charge elevation and any future
     elevations, plus a flame-jet bonus GIF, and an fps run with jets burning.
  5. **Inherited:** the one >100ms cold-start frame on the first-ever Overdrive mount (Motion
     v2 flagged it; a warm hidden mount during loading is the untried lever).
  6. **Taste check:** the H2 idle-charge pulse rate/intensity and the compact MAX chip width
     (24px) are owner-eye calls.
