
# Session Report - R103 FULL OUTSTANDING WORK: the guide is honest again, one FX landed, and the Spine plan hit a system law (2026-08-25)

Brief saved verbatim: `reports/briefs/FS_FABLE_R103_OUTSTANDING_WORK_Prompt.md`. Branch:
`claude/r103-outstanding-work`, review lane. **Eight workstreams, all handled. Zero rasters
staged or committed. No kit. The incoming art directory was read only.**

**Two working-tree raster changes were made, both explicitly authorised by the brief**, and
neither was staged: six documentation icons restored (W2.3), one FX asset intaken (W3.3).

## Preconditions: all five met

R102 merged as `8d0ddfd4`; 27 placeholders present; the FX set and robot parts both on disk;
the R102 Spine document present; all eight guards live.

---

# WORKSTREAM 1 - SOURCE OF TRUTH

**New file: `reports/OUTSTANDING_LEDGER_2026-08-25.md`.** Every escalation and open finding from
R086 to R102, reconciled into one list with ID, status, evidence, owner-decision flag, next
action and blocker, grouped by category. Built from a four-lens read of the archives and then
corrected against HEAD.

**It opens with the four corrected assumptions (W1.2), because they have been misread before:**

1. Every live HUD control is CSS or inline SVG. `HudOverlay.svelte`: 0 `<img>`, 27 `<svg>`.
2. The button PNGs are Interface Guide captures, produced by headless screenshot of those CSS
   controls.
3. Six placeholders were documentation icons. **Now restored.**
4. The only safe live-HUD art target is the decorative banner panel.

**R097's escalation ledger was stale and self-contradictory** (it declared R089's E1-E3
discharged while R089-E1 was still live). That is closed by this file being the single list.

---

# WORKSTREAM 2 - THE SIX DOCUMENTATION ICONS, RESTORED

**Proof they are guide targets, not live controls**, measured per file:

| File | live-HUD `<img>` refs | PaytableModal refs | regen-script target |
|---|---|---|---|
| spin_button.png | **0** | 1 | yes |
| btn_turbo.png | **0** | 1 | yes |
| btn_menu.png | **0** | 1 | yes |
| btn_autoplay.png | **0** | 1 | yes |
| btn_bet_plus.png | **0** | 1 | yes |
| btn_bet_minus.png | **0** | 1 | yes |

**Impact analysis before acting.** The Paytable Interface Guide was showing hand-painted art in
slots whose documented job is to depict the live control, so the guide had stopped being true.
`interface_guide_icon_proof.mjs` is not in CI and asserts only byte-uniqueness across the ten
icons; **that property holds in BOTH states**, 10 distinct of 10, so restoring traded nothing
away. Restoring returns the files to exactly what CI already tests, and is reversible by
re-copying from the art-review folder.

**Restored, working tree only, hashes recorded:**

| File | before | after |
|---|---|---|
| spin_button.png | `91585b1ce883` 63,421 B | `260414ee04fa` 45,119 B |
| btn_turbo.png | `cffd623cb719` 29,670 B | `c53a20c2e24e` 21,679 B |
| btn_menu.png | `c38bbe68380f` 31,620 B | `11e2db4cb625` 13,542 B |
| btn_autoplay.png | `a4b5147e0e06` 34,116 B | `4a15be0750f4` 22,757 B |
| btn_bet_plus.png | `7b7ffc7eb584` 31,491 B | `0ccdf242a11e` 11,655 B |
| btn_bet_minus.png | `54e843b0d552` 32,505 B | `b84f298d23c6` 11,739 B |

All six now match HEAD exactly. **Nothing staged.**

**One left behind, deliberately.** `feature_button.png` is the tenth guide icon and is dual-role,
also rendering live in the buy dialog. It is still a working-tree placeholder. Reverting it is
the same argument, but it is the one file where the swap has a live effect, so it is escalated
rather than assumed.

---

# WORKSTREAM 3 - FX SET INTAKE

Full table in **`docs/design/FX_SET_INTAKE_2026-08-25.md`**. Twelve assets: **1 READY and
intaken, 3 WRONG-SPEC, 8 NO-ROW and homeless.**

## The one that landed: UI-04, the jet nozzle

Every condition measured, not assumed:

| Check | Result |
|---|---|
| Aspect against target | 480x480 into 160x160, exact **3.00x**, **0.00% drift**, inside the 1% source gate |
| Manifest row | UI-04, REPLACE, real shipped path |
| Actually rendered? | **Yes**, `FlameJets.svelte:134`, eight nozzles during scatter escalation |
| Subject bbox | **-7.6% w, -9.5% h**; R096 accepted -8.9%/-7.9%, R094 refused -40.3%/-20.7% |
| Anything anchored to its silhouette? | **No.** Nozzle at `left:-80px; top:-80px` on the jet origin; flame anchors to the same origin with `transform-origin:0 0` |
| Baked glow? | None needed; the engine supplies `--nozzle-glow` per colourway |

**Recorded rather than buried: opaque mass fell 20.2 points (79.6% to 59.4%) and mean luminance
fell 12.2.** It is a lighter, less solid nozzle. Nothing measures it, nothing breaks, and whether
it reads at the frame edge is an owner look call.

## The three refusals

**Both sheets fail on FRAME COUNT, which no resize can fix.** FX-03 wants 5 frames of 240x120,
delivered 4 of 512x512. FX-01 wants **6** frames of 200x200, delivered **4**. The handover calls
the sheet layout "not negotiable" and the engine walks the strip by index: a four-frame sheet in
a six-frame slot desyncs rather than looking slightly off.

**The reel bezel is wrong for EITHER reading of SC-03's target**: 28% adrift against 800x640, 17%
against the 640x468 the handover recommends, both an order of magnitude outside the 1% gate. So
the SC-03 ambiguity does not block it; the asset is simply wrong for it.

## The eight homeless, checked against the runtime

- **Win/premium/scatter bursts (06, 07, 10).** A particle runtime exists and is live across five
  components, but it draws **32 to 128 px sprites**, not 960 to 1200 px overlays. Needs a
  burst-overlay component.
- **Ambient particles (08)** at 1.4% ink: an idle field, needs an ambient layer plus a
  reduced-motion path.
- **Overdrive surge (09).** `FreeSpinsPresentation` exists but has no surge slot.
- **Inner cell emphasis (02).** `.cell-mod-overlay` is a container for CellModifier multiplier
  badges from the `cellMultipliers` store, and `.col-focus` is a COLUMN class on
  `strip.parentElement`. **There is no selected-cell concept in this game.**
- **Ground shadows (11, 12).** 680 and 2840 wide, **exactly matching the hero robot and car**.
  But `SceneGroup.svelte` separates them with a CSS `drop-shadow()` filter and has no shadow
  layer. **Smallest component job of the eight, clearest payoff.**

**The FX coverage gap R097 identified is NOT closed by this set.** Its smallest asset is 480x480;
the four particle REPLACE rows need sprites at 40, 128, 56 and 32 px. Still open.

---

# WORKSTREAM 4 - THE BANNER

**`docs/design/HUD_BANNER_COMMISSIONING_SPEC.md`.**

**718x88 verified rather than assumed**, from the live token arithmetic:
`--fs-x-slab = 297 - 16 = 281` and `--fs-w-slab = 939 + 44 + 16 - 281 = 718`, both matching
`docs/HUD_SPEC.md`. Aspect 8.159. `z-index:59` against controls at 61, and **`pointer-events:
none`**, so no touch target and no accessible name can apply to it.

**THE CONSTRAINT NOBODY HAD NOTICED.** The panel's border and glow are keyed to `--acc`, and
`--acc` is `--sig-cyan` in base play and `--sig-pink` under `.fs-hud--overdrive`. **A single
static raster cannot follow a skin flip.** So the commission must be **accent-neutral**, with the
existing CSS gradient border and glow left layered on top: one asset, both skins correct.

**Blueprint, split as the brief asked.** Art-only: a `background-image` on `.fs-panel`, one
declaration, no markup change, and no CI gate measures this element. Component work: anything
putting art inside a control. **Permanently CSS or SVG: every label and value**, because text is
localised across sixteen locales and baked type cannot follow a locale; the accent colour,
because it flips; and the state animations.

**No implementation was attempted: the asset does not exist.** W4.3's condition was never met.

---

# WORKSTREAM 5 - PAYTABLE, TEXT AND LOCALE

Audited by a dedicated lens plus first-hand checks. New findings, all in the ledger:

- **`btn_max.png` bakes the English word MAX** while its live counterpart `hudMax` is localised.
  It is a screenshot of a text-bearing CSS control, so it cannot be re-captured per locale; the
  guide row needs a localised caption instead. **Owner call.**
- **WILD and SCAT reach the player as hardcoded literals** from a script-side table.
- **`RTP` is a bare hardcoded literal** in paytable markup.
- **Overdrive award strings bypass the locale number convention.**
- **`wild.png` carries a readable Latin W — and this is NOT a defect.** The design system's
  text-free law names "the machined W emblem inside the Wild" as its single exception. Closed
  with evidence rather than logged.
- Minor wiring: the paytable rebuilds asset paths instead of using the themeAssets helper; the
  `interface-guide` testid also wraps the Bet Modes footnote; `maxWinVsBaseBetLabel` is imported
  and unused.

**No text was changed.** Every item is either an owner wording decision or a tidy that would
touch player-facing strings, and the brief said escalate those.

---

# WORKSTREAM 6 - SPINE

## The blocker, and it is the project's own law

**The eleven external parts cannot enter the animation pipeline as the rules stand.** The system
law says anything the pipeline "positions or animates" is "**NEVER externally designed. No
exception, and no measurement changes that answer**", and permits external scene art **because**
"it is flat, terminal, and animates nothing". **Rigging is the act that destroys the
justification the permission rests on.** A provenance record is condition 3; condition 2 fails
first. **R102's step 1, adopt the parts, is withdrawn.**

## What changes the options

**There is an in-house vector master, it is tracked, and it is dormant.**
`frontend/scripts/scene/scene_character.svg`, 340x672, named as the character's source by the
compliance note in masters. Two facts decide its usefulness: it is **one flat group of about 35
unnamed paths**, so `build.py`'s existing layered track cannot split it; and **nothing renders
from it**, because the shipped 680x1344 raster is the externally enhanced version.

## Three routes, written into the Spine document

| Route | Compliant today | Matches shipped art | Job |
|---|---|---|---|
| A. Rig the external parts | **No**, needs an owner amendment | Yes | Small, gated on a ruling |
| B. Rig from the in-house master | **Yes** | **No**, predates the enhancement | Medium: group the paths, add a `layered` block |
| C. Re-author the enhanced look as a grouped vector master | Yes | Yes | Largest |

**Route A is not unreasonable and there is precedent**: the Assets law has been amended twice by
owner ruling. **But no builder may assume it.** Route B is the only one that can start unblocked,
and it reuses machinery the project already ships.

**W6.3, first motion**, is sequenced in the document: idle breathe alone first, then head settle
with a 4 to 6 frame lag, then arm sway offset left to right, visor energy last and only if the
art supports it, no celebration choreography. Feature-flagged with the static image as fallback,
reduced motion stops the idle, legs stay planted.

---

# WORKSTREAM 7 - TOOLING AND CONSISTENCY

**SC-03 no longer crashes the composer.** `compose()` parsed `target_dimensions` with a bare
`int()`, so SC-03's "800x640 source" raised an uncaught `ValueError` that neither `main()`
catches, in a module whose entire design is to refuse cleanly and never guess. It now raises
`ComposerRefusal` naming the row, the required cell format, and the fact that the remedy is an
owner decision. **29 of 30 REPLACE rows compose, 1 refuses cleanly, 0 crash.** Seeded from the
real SC-03 row rather than a fixture: **22/22.**

**The SC-03 TARGET remains open, and the exact owner question is:** the row's own note says
"Either author at the true 640x468 aspect **or** the engine call site changes." Which one is
intended? Authoring at 640x468 makes the art match the box; changing the call site keeps the
800x640 source and fixes the non-uniform squash in CSS. **The composer will not pick one.**

**M3 corrected in the design system, with the prior text preserved** rather than overwritten,
per the project's rule that the record of a wrong belief is evidence. **FX-01's role was NOT
edited**: it feeds directly into generation prompts, so changing it changes game content, and
the brief said escalate rather than silently rewrite. Independent corroboration: the FX batch
describes its own sheet as a holo dash flicker "for the M3 family".

---

# WORKSTREAM 8 - PROGRAMME STATE

## 8.1 Recomputed

| Measure | Value |
|---|---|
| Manifest rows | 47: 30 REPLACE, 10 REGEN, 6 DEAD, 1 KEEP |
| Working-tree modified rasters | **22** (was 27: minus 6 restored, plus 1 intake) |
| REPLACE coverage | **21 of 30, 70.0%** (was 66.7% at R097) |
| Homeless art | **7.19 MiB** across 11 FX assets, plus R097's ~9.65 MiB of win/Overdrive art |
| Live vs guide vs dead | Live HUD: 0 rasters. Guide-only: 9 icons. Dual-role: feature_button. DEAD rows: 6 |

## 8.2 Ranked roadmap

**1. Immediate safe cleanups (builder, no decisions):** revert `feature_button.png`; delete the
eight dead `themeStore.ts` paths; fix the 7 truncated manifest notes; `BASELINE_WARNINGS` 36 to
4; the four wrong `renders_in` citations; remove the unused paytable import; stop generating the
unreferenced `_1x` variants.

**2. Art commissioning:** the 718x88 accent-neutral banner panel; the four particle sprites at
40/128/56/32; re-render the two FX sheets to 5x240x120 and 6x200x200.

**3. Component work:** the two hero ground shadows (smallest, art already exists and already
fits); a win burst overlay (unlocks three FX plus R097's 9.65 MiB); a per-row negative in the
composer.

**4. Animation:** the Spine route decision, then group the master or rig, then idle breathe only.

**5. Provider and tooling residuals:** implement the OpenAI client; capture pricing or rule the
exemption; archive the Ticket 456254 correspondence; `--compare-against-shipped`;
`ALPHA_SNAP_FLOOR`.

## 8.3 Safety confirmation

| Question | Answer |
|---|---|
| Did placeholders change? | **Yes, twice, both authorised.** 6 restored to HEAD (W2.3), 1 FX intaken (W3.3). 27 to 22 |
| Documentation icons restored? | **Yes, all six**, hashes above, working tree only |
| FX intaken? | **One**, UI-04 jet nozzle |
| Kit packaging? | **None** |
| Guards active? | **Yes, all eight**, self-test 11/11 |
| Rasters staged or committed? | **Zero** |

---

## Verification

Generate self-test **22/22**. Asset guard **11/11**. Doc currency **PASS, 0 new**. Locked paths
**PASS**. Explicit paths per (k).

## ESCALATIONS

**E1 (R103). The Spine system-law conflict.** External parts cannot be rigged without an owner
amendment. Three routes recorded. **This gates every Spine task.**

**E2 (R103). The SC-03 target question**, stated above verbatim from the row's own note.

**E3 (R103). FX-01's role still says "booster flame"** and feeds a generation prompt. One cell.

**E4 (R103). `btn_max.png` bakes the word MAX** in a guide whose live counterpart is localised.

**E5 (R103). `feature_button.png` is the last un-restored guide icon**, and it is dual-role.

**E6 (R103). The banner commission is accent-neutral or it cannot follow the Overdrive skin.**

**E7 (R103). The four particle REPLACE rows are still uncovered.** This FX set has nothing
under 480px.

**Carried:** everything in the new ledger. **Closed by this session:** R102-E1 (guide
misrepresentation), R100-E5's crash half, R097-F33 and R089-E1-DISPOSITION (stale ledger),
R097-SC03-UI04's UI-04 half, R103-E11 (the Wild's W is the law's own named exception).

Model and effort: one session, unattended, review lane, eight workstreams. Four read-only survey
lenses plus first-hand measurement of every load-bearing claim. Nine files changed, two
authorised working-tree raster changes, zero rasters staged.
