
# Session Report - R102 HUD AUDIT + SPINE START + SAFETY CLEANUP: the HUD draws no rasters, the rig is specified, and a second silent destroyer was closed (2026-08-25)

Brief saved verbatim: `reports/briefs/FS_FABLE_R102_HUD_SPINE_SAFETY_Prompt.md`. Branch:
`claude/r102-hud-spine-safety`, review lane. **THE FENCE HELD: zero rasters staged or
committed, no placeholder touched, no kit, the incoming art directory read only. The 27
placeholders are byte-for-byte unchanged**, aggregate `33b3530734`, the same value R100 and
R101 recorded.

## Preconditions: all four met

| Precondition | State |
|---|---|
| On `main`, up to date | Yes. R101 merged as `5c8f30bf` |
| 27 placeholders present | Yes, fingerprint matches R101's |
| Robot Spine parts present | 11 part PNGs plus their record |
| `npm run assets` guarded | Yes, all three generators call the R101 guard |

---

# WORKSTREAM A - LIVE HUD / BANNER AUDIT

## A1. The live HUD, mapped

**The headline finding, and it corrects the brief's premise: the live HUD contains no raster
images at all.** `HudOverlay.svelte` has **0 `<img>` tags and 27 `<svg>` tags**.

| Surface | Render method | Source |
|---|---|---|
| Balance | CSS plate, chrome rim gradient + clip-path notch, colour from a theme token | `HudOverlay.svelte:936` |
| Win | CSS, same plate, lit state is a keyframed drop-shadow | `:945` |
| Bet | CSS; the value itself is the button that opens the picker | `:956` |
| Bet + / Bet - | CSS gradient cap + inline SVG chevron | `:978` |
| SPIN | CSS conic-gradient bezel + radial-gradient dome + ring, inline SVG glyph | `:986` |
| TURBO | CSS knob + inline SVG bolt, three tiers by attribute selector | `:865` |
| MAX | CSS radial-gradient circle, text only | `:880` |
| MENU | Pure CSS: gradient square plus three empty painted spans | `:889` |
| AUTOPLAY | CSS knob + inline SVG loop arrow | `:1004` |
| Bottom banner `.fs-panel` | **Markup-empty `<div>`, painted by CSS gradients only** | `:861` |
| Feature Buy entry | CSS | `FeatureMenu.svelte` |
| Overdrive meter | **raster** `<img>`, gauge_face + gauge_needle | `BonusInstrumentColumn.svelte:85,88` |
| Buy dialog header | **raster** `<img>`, feature_button.png | `BuyBonus.svelte:117` |
| Scene robot / car | **raster** `<img>` | `SceneGroup.svelte:71` |

So the only rasters a player sees outside the reels are the Overdrive gauge, the buy-dialog
header, and the scene art. Every bottom-banner control is CSS or inline SVG.

## A2. Art exists versus art is live

**The button rasters are screenshots of the CSS controls.**
`frontend/scripts/regen_interface_guide_icons.mjs` drives a headless browser, captures the
live buttons by CSS selector, and writes them into the shipped ui directory. Its own header
says so, and `HudOverlay.svelte:1707` says "Replaces spin_button.png".

| Control | Live today | New art exists? | Where the raster appears | Gap type |
|---|---|---|---|---|
| Balance | CSS plate | panel_balance.png exists | nowhere, defined but never read | CSS_SVG_BY_DESIGN |
| Win | CSS plate | panel_win.png exists | nowhere, defined but never read | CSS_SVG_BY_DESIGN |
| Bet | CSS plate | none | - | CSS_SVG_BY_DESIGN |
| Bet + / - | CSS + SVG | btn_bet_plus/minus.png | Paytable Interface Guide only | CSS_SVG_BY_DESIGN |
| SPIN | CSS + SVG | spin_button.png | Paytable Interface Guide only | CSS_SVG_BY_DESIGN |
| TURBO | CSS + SVG | btn_turbo 1/2/3.png | Paytable Interface Guide only | CSS_SVG_BY_DESIGN |
| MAX | CSS | btn_max.png | Paytable Interface Guide only | CSS_SVG_BY_DESIGN |
| MENU | CSS | btn_menu.png | Paytable Interface Guide only | CSS_SVG_BY_DESIGN |
| AUTOPLAY | CSS + SVG | btn_autoplay.png | Paytable Interface Guide only | CSS_SVG_BY_DESIGN |
| Feature Buy | CSS | feature_button.png | Guide AND the buy dialog | CSS_SVG_BY_DESIGN |
| Overdrive meter | raster | gauge_face/needle | live | (already art) |
| **Bottom banner** | **empty div** | **NONE** | - | **ART_MISSING** |

**Eight asset paths are defined in `themeStore.ts` and read by nothing**: spinButton,
btnMinus, btnPlus, btnAutoplay, btnMenu, panelBalance, panelWin, and the turbo entry. Zero
consumers outside their own definition. They are dead configuration, invisible to
`dead_wiring_scan.mjs` because that gate scans exported stores rather than object properties.

**An uncomfortable consequence.** Six of the 27 placeholders ARE those icon files. They were
swapped with hand-painted art on the same 200x200 canvas, files 1.4x to 2.8x larger. **The
Interface Guide therefore shows art that no longer depicts the controls a player uses.**
Nothing automated catches it: `interface_guide_icon_proof.mjs` is not in CI, and it asserts
byte-uniqueness plus builds a grid for a human to eyeball rather than comparing pixels.

## A3. Implementation options, priced

The constraint that prices all three: `docs/HUD_SPEC.md` locks every control to exact stage
pixels, `hud_banner_spec_check.mjs` re-measures them from a live render and asserts them
byte-for-byte, `control_row_symmetry_gate.mjs` holds the 16px gaps in CI with a seeded
self-test, the touch-target floor is 44px, and there are 35 aria-labels with text localised
across sixteen locales.

**Option 1, keep CSS/SVG and treat the rasters as Paytable-only.** Scope: nothing. Risk:
none. Files: none. **This is what the project already does, and the handover has documented it
since arc 2 opened.**

**Option 2, replace selected controls with raster buttons.** Scope: `HudOverlay.svelte` plus
the locked spec plus two gates. Risk: **high, and mostly not aesthetic.** Baked text cannot
localise across sixteen locales; an `<img>` carries no accessible name unless one is added;
the exact px geometry is asserted from a live render so every swap must land inside the locked
box; and the source rasters are screenshots of the very controls being replaced, so the result
is a photograph of a vector. Dimensions: the square controls WOULD fit cleanly, TURBO 200x200
into 82x82 at 2.44x, SPIN into 84x84 at 2.38x, MENU at 4.55x, MAX and AUTO at 4.17x, all
supersampled and undistorted. The plates would NOT: BALANCE is 200x62 against a 340x90 raster,
WIN is 150x62 against 360x100, both aspect mismatches, and BET has no raster at all.

**Option 3, hybrid frame/panel raster plus CSS text and values.** Scope: one decorative
element. Risk: **lowest of the three by a wide margin**, because `.fs-panel` is a markup-empty
div that the spec itself calls decorative and z-index below every control. It is not visually
blank: it carries a linear-gradient fill plus a gradient-border trick, the file's only
`background-image` and one that contains no `url()`. Its geometry is already token-derived
from `--fs-row-gap`, so a raster would swap a background, not a layout. No coordinate, no touch
target, no accessible name and no localised string is involved. Files: one CSS rule and one
new asset. **Dimensions: 718x88, aspect 8.16, and nothing on disk is close.** The art does not
exist and would have to be commissioned.

## A4. Recommendation

**Keep Option 1 for the controls and pursue Option 3 for the banner only.**

The controls are CSS by a documented decision that predates this session, the rasters that
appear to be their replacements are photographs of them, and the enforcement around their
geometry and accessibility is the strongest in the codebase. There is no upside to trade
against that risk.

The banner is the opposite case: a purely decorative surface carrying CSS gradients rather
than art, with no geometry assertion of its own and no accessibility surface. **The next brief should commission a 718x88 panel
raster in the arc-2 style register and wire it as a background on `.fs-panel`.** Nothing else
in the HUD should move.

**No HUD change was implemented.** Nothing qualified as trivially safe and isolated: the one
change that would qualify needs art that does not exist yet.

---

# WORKSTREAM B - SPINE START

## B1 and B2: inventory and hierarchy

Both are in the new **`docs/design/SPINE_ROBOT_RIG_SETUP.md`**, measured rather than copied.
Eleven parts, all RGBA with genuine alpha and zero corner alpha, all with a 20 to 23 px
transparent margin, and left/right pairs on identical canvases.

**Three properties that decide how the rig is built, all verified:**

1. **Every subject is centred at (0.50, 0.50) of its canvas**, so a default import
   centre-pivots every limb. Every pivot must be set deliberately.
2. **The supplied pivot set is internally coherent.** Every pivot is exactly horizontally
   centred; both socket pairs are exactly symmetric, shoulders 205 px either side of the neck
   and hips 100 px either side of the torso socket.
3. **The chain assembles to the right height.** Raw sum 1440 px; four seams each double-count
   two 20 px margins, giving about 1280 px against the 1344 px reference. **95 per cent, which
   is agreement rather than coincidence.** Arm-to-leg ratio 0.70 against a human 0.72.

The hierarchy parents legs to `hip` rather than to `pelvis`, because the pelvis is a rendered
part and the hip is the transform an idle drives.

## B3: the foundation document

`docs/design/SPINE_ROBOT_RIG_SETUP.md` carries the provenance, the measured inventory, the
naming convention (anatomical, never screen-relative, since the robot's left is the viewer's
right), the full pivot and socket table, the import procedure, the draw order, and a first
idle specification with per-bone channels and amplitudes.

**Two things the delivery cannot support as-is, both recorded rather than glossed:**

- **The visor is baked into the head part.** The brief asks the first idle to include visor
  energy. That is not a keyframe on this part list. Three honest options are written out: a
  tinted overlay quad, a commissioned emissive visor layer registered to the same canvas, or
  deferral. The second is correct if the visor is meant to carry the character's life, and it
  is a new art request.
- **The delivery record over-claims itself.** It promises a review folder with a contact sheet
  and neutral assembly preview, and a source-original folder of unprocessed outputs. Neither
  exists; the folder holds the eleven PNGs and the record.

## B4: no code, and the reason is a gate

**There is no natural insertion point.** No Spine runtime, no atlas loader, no skeletal
animation of any kind: a sweep for Spine, skeleton, `.atlas` and esotericsoftware returns
nothing. The robot is one static `<img>` in `SceneGroup.svelte:71`.

A config stub or manifest entry nothing reads would be dead wiring, and
`frontend/scripts/dead_wiring_scan.mjs` runs in CI precisely to catch state that is written
and never read. **Adding an unread entry to satisfy a checklist is the exact pattern that gate
exists to stop**, so the document carries the ranked next brief instead: adopt the parts into
the repository with a provenance record first, decide the visor question, rig to the document,
and only then a runtime brief behind a feature flag with the static image as fallback.

---

# WORKSTREAM C - SAFETY AND CONSISTENCY

## C1. The background scripts: I was wrong at R101, and all three are now guarded

R101 exempted them with this reasoning, quoted from its own report: "each takes deliberate
command-line arguments, so invoking one is an explicit act, where `npm run assets` is a
routine command that looks harmless."

**I checked it this session and it was wrong.**

| Script | argparse? | Destination | Now |
|---|---|---|---|
| `scripts/assets/backgrounds.py` | **none at all** | hardcoded OUT | guarded |
| `scripts/assets/background_candidate_ingest.py` | **none at all** | hardcoded BG_DIR | guarded |
| `scripts/assets/background_overdrive_derive.py` | yes, but they tune quality | hardcoded bg_overdrive.jpg | guarded |

Two of the three take no arguments whatsoever and write unconditionally, exactly like
`npm run assets`. The third's arguments do not choose the destination. **The exemption rested
on a property the code does not have, so it is withdrawn and all three now refuse over
uncommitted asset work.**

One workflow consequence, named rather than discovered later: deriving the Overdrive twin
while a background placeholder is in the tree, which R091 legitimately did, now needs
`ALLOW_ASSETS_OVERWRITE=1`. That is correct rather than inconvenient: the operator IS
deliberately overwriting, and the override makes it explicit.

## C2. A second silent destroyer, found and closed

**R097's claim that `npm run assets` is "the only known command that can destroy the current
visual test set" is no longer true.**

`frontend/scripts/regen_interface_guide_icons.mjs` screenshots the live controls straight into
`frontend/public/assets/themes/future-spinner/ui/`, and its target list includes
spin_button.png, btn_bet_plus.png, btn_bet_minus.png, btn_autoplay.png, btn_menu.png and
btn_turbo.png. **Those are six of the 27 placeholders.** It is not an npm script, so it is
invoked directly, and it carried no guard.

**It is now guarded through the SAME python guard**, via a new `--require-clean` entry point
on `asset_guard.py`, rather than a second implementation in JavaScript. Two copies of a rule
drift; one does not. Self-test is now **11 of 11**, the two new cases exercising that entry
point as a real subprocess, because an exit code that another language reads is not proven by
a function that works when imported.

## C2 continued. The carried defects

**M3 identity conflict, unchanged and still three-way.** `design-system/DESIGN_SYSTEM.md`
calls M3 the Plasma Booster; the manifest's SY-09 role was corrected to the Holographic Dash
Readout at R086 and ratified by owner paste; the manifest's FX-01 role still describes its
sheet as the M3 booster flame. Because `compose()` puts the role straight into the prompt,
FX-01 would generate the wrong subject. **Exact next action:** one-line corrections to
`design-system/DESIGN_SYSTEM.md`'s symbol lineup row and to the FX-01 role cell in
`docs/art/art_manifest_arc2.csv`. Not done here: which of the two is authoritative is an art
decision, and R086's precedent is that the correction is owner-ratified.

**SC-03 composer crash, unchanged.** `docs/art/art_manifest_arc2.csv`'s SC-03 row carries
`target_dimensions` of "800x640 source", and `compose.py:66` parses that field with `int()`,
raising an uncaught `ValueError` that neither `compose.main()` nor `generate.main()` catches.
**Exact next action:** decide SC-03's true target, which the arc-2 handover says should be the
true 640x468 aspect, then correct the cell; and separately make `compose()` refuse rather than
crash on an unparseable dimension cell.

**New this session:** eight dead asset paths in `themeStore.ts`, and six placeholder button
rasters occupying documentation-icon slots (A2 above).

## C3. Final safety statement

| Question | Answer |
|---|---|
| Placeholders unchanged? | **Yes. 27/27 byte-for-byte, sha256 before and after** |
| `npm run assets` still guarded? | **Yes**, all three stages, verified refusing at exit 2 |
| Background writers now guarded? | **Yes, all three**, verified refusing at exit 2 |
| Any command left that can silently destroy visual work? | **No, none found** |

The sweep behind the last row: every tracked `.py`, `.mjs` and `.js` outside `frontend/src`
that references the theme asset tree was enumerated, and each one's actual write DESTINATION
was read rather than its write-call count. Seven write into the shipped asset tree and **all
seven are now guarded**: build.py, flame_jets.py, symbol_fx.py, backgrounds.py,
background_overdrive_derive.py, background_candidate_ingest.py, and
regen_interface_guide_icons.mjs. The rest write to `reports/`, to scratch, or to
`design-system/brand/`. `r048_masters.py` reads four placeholder paths as SOURCES and writes
to `reports/art/r048`, which an earlier count in this session got wrong before the destination
was checked.

---

## Verification

Asset guard self-test **11/11**. Generate self-test 21/21, unchanged, as a control. Doc
currency **PASS, 0 new**. Locked paths PASS. Explicit paths per (k). Zero rasters staged.

**The doc currency gate caught me stating something correctly but formatting it wrongly.** The
Spine document said the review and source-original folders do not exist, and backticked their
names while saying so. A backticked path is a claim regardless of the prose around it, so the
gate was right and the document was fixed. Fifth encounter with that class in this arc.

## ESCALATIONS

**E1 (R102). Six placeholders are documentation icons, and the Interface Guide now
misrepresents the live controls.** spin_button, btn_turbo, btn_menu, btn_autoplay,
btn_bet_plus, btn_bet_minus. Recommended: revert those six to their captured versions and keep
the other 21. Not done, because the fence forbids touching placeholders.

**E2 (R102). The bottom banner has no art and is the one safe place for some.** 718x88,
aspect 8.16, nothing on disk close. The recommended next HUD brief.

**E3 (R102). Eight dead asset paths in `themeStore.ts`**, defined and read by nothing, and
invisible to the dead-wiring gate because it scans exported stores rather than object
properties. Either wire them or delete them; leaving them implies a plan that does not exist.

**E4 (R102). The Spine parts are not in the repository**, so nothing may cite them under
convention (m). Adopting them with a provenance record is step 1 of the rig brief.

**E5 (R102). The visor is baked into the head part**, so the requested visor-energy idle needs
an art decision before rigging.

**E6 (R102). R097's "only known command" claim is superseded**, recorded rather than silently
corrected because it is cited in R097's own ledger.

**Carried:** R100's E1 (no OpenAI client) and E3 (M3), R099's E2 and E3, R101's E2 and E3.
**R101's E1 is CLOSED by C1.**

## RANKED NEXT BRIEFS

1. **Revert the six documentation-icon placeholders** (E1). Smallest, and it removes a live
   inconsistency between the guide and the game.
2. **Commission and wire the 718x88 banner panel** (E2). The only safe HUD art change.
3. **Correct M3 across the three documents** (C2). Two one-line edits, blocks correct FX-01
   generation.
4. **Adopt the Spine parts into the repository with provenance** (E4), then rig to the
   document.
5. **Implement the OpenAI client** (R100 E1), then price it.
6. **SC-03**: decide the true target and make `compose()` refuse rather than crash.

Model and effort: one session, unattended, review lane, high effort, three workstreams. Four
read-only audit lenses plus first-hand verification of every load-bearing claim. Twelve files
changed, no raster and no placeholder touched.
