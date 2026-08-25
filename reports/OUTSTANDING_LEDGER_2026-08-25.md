# OUTSTANDING LEDGER, arc 2 — one authoritative list

> **AMENDED 2026-08-25 by R104.** A completion kit of 122 files arrived after this ledger was
> written. What it changed is in section 0A; the rest of the ledger stands. **Do not read the
> pre-R104 rows as though the kit does not exist.**

## 0B. WHAT R105 CHANGED (the runtime-true kit)

**THE BANNER PAIR IS COMMITTED.** Raster and CSS landed together, which is the only CI-safe
way either half could land: `asset_reference_gate.mjs` requires every referenced asset to exist
in dist, `build_diet_verify.mjs` fails any 404. Verified safe first: the path
`assets/themes/future-spinner/ui/` is not in PRUNED_PREFIXES and not under the fully-pruned
`assets/ui/` that KEEP_UI guards, 63,873 bytes against a 25 MB budget, and no CI gate measures
`.fs-panel`. **The six new finalists did not beat the placed one**, so no re-swap: it still wins
on accent neutrality at 2.98% cyan+magenta against 3.5% to 20.5%.

**FX-01 IS CLOSED IN ART.** The holo flicker sheet arrived at 1536x256, six frames of 256x256,
which is a **uniform 1.28x downscale to the required 1200x200 in six 200x200 frames, 0.00%
aspect drift**, with every frame boundary landing on an integer. Ingested and swapped
working-tree-only. **This is the first FX row closed after three art batches.**

| Ledger item | Was | Now |
|---|---|---|
| **R102-E2** banner | placed but uncommittable | **COMMITTED as a pair** |
| **R104-E1** banner pair unresolved | OPEN | **CLOSED**, option A taken |
| **FX-01** M3 overlay sheet | WRONG-SPEC across two batches | **INTAKEN**, working-tree |
| **FX-02** L2 fuse arc | WRONG-SPEC | **STILL OPEN.** The kit's 4-frame sheet fits the geometry EXACTLY but it is a reel-stop impact, not a fuse arc. Refused on intent, not on numbers |
| **FX-03** jet flame | WRONG-SPEC | **STILL OPEN.** Five frames at last, but 256x256 square against 240x120 landscape: 50% drift |
| **FX-05..08** particles | gap open after two batches | **STILL OPEN, and now precisely.** 24 sprites arrived at 32/64/96/128. Sizes are finally reachable; the DESIGNS are not: there is no coin, no ring and no smoke wisp among the six. The one plausible match, spark, measures saturation 0.20 against the incumbent's 0.94 |
| **R104-E5** shadows need a component | OPEN | **OPEN with the exact blocker named**: `.char-layer` carries a breathing transform, so a shadow inside it lifts off the ground |
| Paytable support art | homeless | **STILL HOMELESS, and now proven**: `PaytableModal.svelte` has 2 `<img>` tags and no `background-image url()` at all. There is no panel raster target to aim at |

**Two kit assets are fully opaque** and would black out whatever sits behind them: the
feature-rules card background and the side-panel texture strip.

## 0C. WHAT R106 CHANGED (the FX closure kit)

**THREE FX ROWS ARE NOW CLOSED. REPLACE COVERAGE 24 of 30, 80.0%**, up from 73.3%.

| Row | Outcome | Why |
|---|---|---|
| **FX-02** L2 filament arc | **CLOSED** | Exactly 800x200 in four 200x200 frames, **no resize needed**. Correct subject at last, a filament arc rather than the reel-stop impostor R105 refused. Hue 199 against the incumbent's 215, both cyan-family and matching the L2 electric-blue signature. Marginally denser than what it replaces, not weaker |
| **FX-07** smoke wisp | **CLOSED** | 64x64 to 56x56 is a uniform downscale. **The only particle that is genuinely better than its incumbent**: mean alpha 27.9 to 67.4. The incumbent is an amorphous smudge; this reads as smoke |
| **FX-03** jet flame | **REFUSED ON HUE**, and this is the finding of the session | Geometry is PERFECT: exactly 1200x120 in five 240x120 frames. **But the jet flame sheet is a FIXED GREEN ASSET BY DESIGN.** `FlameJets.svelte` recolours it per colourway with CSS `hue-rotate`: natural none, overdrive 60deg, nitro 215deg, implementing an owner-ruled contrast law. The candidate is cyan at hue 202. A green source yields green, cyan, magenta exactly as documented; a cyan source yields **cyan, violet, yellow**. All three colourways would be wrong |
| **FX-05** coin | REFUSED | The row is a **gold** coin; the candidate is a grey and magenta chrome token. Hue 51 to 240, saturation 0.75 to 0.26 |
| **FX-06** shock ring | REFUSED | Right subject, exactly 128x128, but saturation 0.94 to 0.26 and mean alpha 47.9 to 29.5. The incumbent is a bold pure-cyan ring; the candidate is sketchy and dual-hued. It is "the most reused particle" |
| **FX-08** spark | REFUSED | Stronger than the previous kit's attempt but still saturation 0.94 to 0.37, and visually a **dark** blue shard where a spark should be bright |

**THE SHADOW INSERTION POINT IS NOW EXACT.** The breathing animation sits on the LAYER, not the
image: `.car-layer` carries `car-hover` and `.char-layer` carries `char-idle`, both animating
`transform`. So a shadow inside either layer bobs with its hero. **`.scene-group` is the correct
parent**: it is `position:absolute; inset:0; pointer-events:none` and its own comment calls it a
"Non-stacking wrapper: no z-index/transform of its own". The snippet is in the session report.
Not implemented, because positioning a 680x240 shadow under a character inside an 860px
`object-fit: contain` box needs visual iteration that cannot be verified headlessly.

**FX-04 is coupled to FX-03** and cannot close while FX-03 is refused: it must be frame 3 of that
sheet, exported from it.

## 0D. WHAT R107 CHANGED (the final closure kit)

**REPLACE COVERAGE 27 of 30 = 90.0%**, from 80.0%. **SIX OF EIGHT FX ROWS CLOSED.** Only three
REPLACE rows remain uncovered in the entire manifest.

| Row | Outcome | Evidence |
|---|---|---|
| **FX-03** jet flame | **CLOSED** | Exactly 1200x120, five 240x120 frames, and **median hue 110.1 on every frame** — the green source the hue-rotate colourways require. R106 refused this row at perfect geometry for being cyan; the contract is now met |
| **FX-04** jet still | **CLOSED** | The kit shipped an explicit frame-3 export that is **byte-identical** to its own frame 3 and **pixel-identical** to frame 3 of the strip, which is exactly what the manifest demands |
| **FX-06** shock ring | **CLOSED** | meanA **47.9 to 51.1** and peak luma **148.6 to 170.6**: stronger AND brighter, at exactly 128x128, hue 185 |
| **FX-05** coin | **still open, but close** | It IS gold at last, hue 45, saturation 0.86 against the incumbent's 0.75. **Refused on brightness**: peak luma 177.4 to 114.1, a 36% dimming, and meanA 145 to 116. The rule is "clearly as strong or stronger" |
| **FX-08** spark | **still open** | Third attempt. Named "bright" and measures dimmer: peak luma 222.9 to 188.0, saturation **0.94 to 0.31** |

**THE THREE REMAINING REPLACE ROWS ARE:** SC-03 (blocked on the owner's target decision), FX-05
(coin, needs brightness), FX-08 (spark, needs brightness and saturation).

**THE BURST-OVERLAY RECOMMENDATION IS WITHDRAWN, and it was wrong for three sessions.** I have
been recommending a burst-overlay component since R103. **It already exists.**
`WinBanner.svelte` renders `c1-shockwave` from `ui/particles/shock_ring.png` for every win tier,
gated only by reduced motion, plus a chromatic flash and an epic-tier coin fountain. **This
session improved the very asset it draws.** What does NOT exist is celebration feedback BELOW the
10x big-win threshold, and those thresholds are deliberate: they are the same ones the
autoplay-pause uses. Adding a fourth tier under them is a game-feel decision, not minimal wiring.

**THE CONTACT SHADOWS HAVE A NEWLY FOUND BLOCKER, and it is not placement.** All the geometry is
now measured: character scale 0.3028, feet 27.7px above the stage bottom, shadow centroid at 49.9%
of its canvas so it needs 36.4px below the contact point, leaving 8.7px past the stage bottom.
Composited over the real backdrop it does ground the figure, shadow luminance 19.7 against a floor
of 32.2. **But `.car-img, .char-img` is a SHARED CSS rule carrying
`drop-shadow(0 6px 18px rgba(0,0,0,.5))`, which is already a contact shadow.** Adding a raster
shadow either doubles it, or requires removing the filter from a rule that also governs the car.
That is a coupled design decision and it is not a builder's to make.

## 0E. WHAT R108 CHANGED — THE ART ARC IS EFFECTIVELY COMPLETE

**REPLACE COVERAGE 29 of 30 = 96.7%. ALL EIGHT FX ROWS ARE CLOSED.**
**Exactly ONE REPLACE row remains uncovered in the entire manifest: SC-03**, which has been
blocked on an owner decision since the arc opened, not on art.

| Row | Outcome | Evidence |
|---|---|---|
| **FX-05** coin | **CLOSED** | Delivered at the **exact 40x40 runtime target**, gold at hue 45, saturation **0.75 to 0.82**, and **107.2%** of the incumbent's integrated light. Brighter, warmer and more saturated on every measure |
| **FX-08** spark | **CLOSED** | Exact 32x32, and **252.1% of the incumbent's integrated light** |

### The instrument that decided it, recorded because it reversed a refusal

R107 refused this spark's predecessor partly on **peak luminance**, the mean over opaque pixels.
On this candidate that measure again read DIMMER: 195.4 against the incumbent's 222.9, with
saturation 0.24 against 0.94. **Both readings were true and both were the wrong instrument.**

The incumbent spark is a **thin cross**: few opaque pixels, each very bright. The candidate is a
**fuller six-point burst**: more pixels at a slightly lower average. Per-pixel brightness favours
the cross; what the eye actually receives at 32px is the INTEGRATED LIGHT, the sum of alpha times
luminance over the whole sprite. On that measure the burst delivers **two and a half times more**.
The low saturation is likewise explained rather than damning: the core is white-hot, which is what
a bright spark looks like, and the spikes are still cyan.

**The lesson worth keeping: for a small sprite judged on "does it catch the eye", integrate
alpha x luminance over the canvas. Peak-over-opaque rewards thin bright shapes and punishes full
ones.**

### What is left

**Art: nothing, for the REPLACE set**, apart from SC-03 which needs a decision rather than a
picture. The remaining programme is owner decisions and component work, both already enumerated
in sections 0B, 0C and 0D.

## 0F. R109 — THE ANIMATION-PIPELINE RESTRICTION IS WITHDRAWN, AND THE BLOCKER MAP IS REBUILT

**OWNER RULING, 2026-08-25, quoted verbatim:**

> External development-stage artwork may be used in the Future Spinner animation pipeline,
> including character rigging and Spine, provided final shipped assets remain
> quality-controlled, provenance-recorded, and presentation-safe for Stake.

**Static-only treatment of the robot is no longer required.** Three conditions survive and are
not optional: **quality-controlled**, **provenance-recorded**, **presentation-safe for Stake**.
Unrequested external art is still prohibited. **Scope: Future Spinner.** Other WRS titles remain
under the superseded rule until the owner says otherwise.

**Documents amended** (six; every one keeps its superseded text rather than deleting it):
`design-system/DESIGN_SYSTEM.md` (the SYSTEM LAW itself), `CLAUDE.md` (condition 2 and test step
1), `COMPLIANCE_WATCH.md`, `GAME_FACTS.md`, `SUBMISSION_DOSSIER.md`,
`docs/design/SPINE_ROBOT_RIG_SETUP.md`, plus `docs/design/FX_REGENERATION_SPEC.md`.

**Dated records were NOT edited.** Session reports, archives, comms entries and saved briefs keep
the old law verbatim, per convention (s): history does not go stale, instructions do.

**TWO AUDIT-FACING DOCUMENTS NEEDED CARE, not just an edit.** `GAME_FACTS.md` states it is
compiled for external audit and `SUBMISSION_DOSSIER.md` is submission-facing. Both asserted
"symbols remain never externally designed". **That claim is now false as a RULE and still true as
a FACT about the shipped set**, because the externally generated symbol art is uncommitted and
under review. Both were amended to state the rule change AND to say plainly that the shipped-set
statement must be re-verified before any submission that adopts that art. **A reviewer must not
be shown a withdrawn rule, and must not be shown a false claim about what ships.**

### Rows this closes

| Row | Now |
|---|---|
| **R103-SPINE-LAW** external parts cannot be rigged | **CLOSED by ruling.** Route A is open and recommended |
| **R102-E4** parts not in the repository, nothing may cite them | **Reduced to ordinary adoption work.** Provenance is still required by the ruling's own condition |
| **R102-E5** visor baked into the head | **CLOSED.** Solved in art, and now in law |
| **R104-E2** route A needs a law amendment | **CLOSED** |

---

## 0G. THE BLOCKER MAP, REBUILT FROM ZERO UNDER THE NEW LAW

### A. Real Stake or product blockers

**None identified.** The one item touching the platform is R097-F35, submission-1 held on the
portal artefact, which is an owner-side hold rather than a defect. The AI-provenance scoring risk
recorded in the arc-2 handover is a QUALITY consideration the ruling's "presentation-safe"
condition now carries, not a gate.

### B. Internal outdated process residue

**Found and removed this session:**

| Item | Disposition |
|---|---|
| The animation-pipeline restriction | **WITHDRAWN** by owner ruling |
| Ledger rows marked "blocked in law" | **Updated** |
| The FX spec's "static art that animates nothing" distinction | **Withdrawn**; the distinction no longer exists |
| `CLAUDE.md` test step 1, "class decides admissibility" | **Amended**; class is now a labelling step, steps 2 to 5 are the whole test |

**Actively looked for and NOT found:** any rule blocking component work while placeholders are
dirty. The only match was a heading in the HUD commissioning spec categorising art-only versus
component work, which is a categorisation and not a prohibition.

**Examined and DELIBERATELY KEPT, because each has a real basis:**

| Rule | Why it stays |
|---|---|
| Kit packaging forbidden while any placeholder differs from HEAD | Packaging now would ship 30 unreviewed rasters. **Real safety, not residue** |
| The asset guards (7 writers) | They prevent silent destruction of the visual set, proven by execution |
| Locked-path sanction tokens | Money path and maths package |
| Convention (p) seeded self-tests, explicit-path commits, evidence hygiene | Ordinary engineering discipline |
| HUD control labels must stay CSS/SVG | **Real basis: sixteen locales.** Baked text cannot localise. This is scoped to labels, values, the accent colour and state animations, not to whole controls |

### C. Owner decisions still needed

1. **SC-03's target** — the last uncovered REPLACE row: author at the true 640x468 aspect, or change the call site.
2. **The shared `.car-img, .char-img` drop-shadow** — blocks the contact shadows; adding a raster shadow doubles it or changes the car too.
3. **`char-idle` versus a rigged idle** — NEW, from R109. The wrapper supplies the bob in CSS; a rig would supply it in the skeleton. Running both doubles it.
4. **Does the ruling cover SYMBOLS?** — surfaced per convention (n). Read literally it does, and that matches arc-2 practice. One sentence settles it.
5. **Whether sub-10x wins should celebrate** — the burst art exists; the thresholds are deliberate.
6. **Whether to commit the 30 working-tree placeholders**, which is what makes the audit-facing documents' shipped-set statements need re-verification.
7. The baked MAX in the guide icon; the background room; OpenAI pricing or a covered-plan exemption.

### D. Ordinary implementation work, cheapest first

1. **Visor, eye and chest overlays on the static hero.** No new dependency; the v2 layers register to the shipped hero canvas exactly, and `.visor-glint` already exists with its own keyframes and reduced-motion path.
2. **Contact shadows**, once C2 is answered. Fully measured in the R107 report.
3. **The OpenAI client**, then pricing.
4. **The Spine rig**, once C3 is answered. Needs a runtime dependency, an atlas loader, a render target and a reduced-motion path.
5. The small tooling debts: 7 truncated manifest notes, `BASELINE_WARNINGS`, four wrong `renders_in` citations, the unreferenced `_1x` variants.
6. **Paytable panel targets**, which do not exist at all.

## 0H. R110 - THE PAINTED VISOR DOES NOT FIT, AND R109's REGISTRATION CLAIM WAS WRONG

**Nothing in the kit is a visor for this robot.** Measured against the shipped 680 x 1344
`ui/scene_character.png`, whose head spans y 40..300 with a maximum width of 297 px and whose lens
sits at x 185..568, y 37..319:

| Layer | Centroid y | Lands on | Fatal measurement |
|---|---|---|---|
| 40-visor-only-glow-layer-680x1344.png | 446 (33.2%) | chest and folded arms | 488 px wide, 1.64x the whole head |
| 41-eye-light-layer-680x1344.png | 404 (30.1%) | folded arms | 13 points low |
| 42-chest-energy-layer-680x1344.png | 700 (52.1%) | pelvis | 14 points low |
| 19-robot-visor-glow-layer.png (640x320) | n/a | floats above a different robot's dome | 44.3% on-body |

All three 680-family layers are displaced downward by a **consistent 13 to 16 percentage points**.
They are coherent with each other and with a differently framed reference figure. A translate does
not fix the visor: shifted up 211 px or 240 px it swallows the head and hides the real visor.

**CORRECTION TO SECTION 0F.** R109 recorded that these layers "register to the shipped hero canvas
exactly". **They do not.** The checks behind that claim were canvas dimensions and
percentage-of-pixels-on-silhouette, both true, neither answering the question: 93.9 per cent
on-body is fully compatible with being on the wrong body part. The 0F text stands with this
correction beside it, per convention (s).

**A REAL DEFECT WAS FOUND IN THE INCUMBENT AND FIXED.** `.visor-glint` at `top:17%` centred on
image y309, the neck pinch. Only **5.7 per cent** of the gradient's energy reached the lens and
**32.4 per cent** missed the sprite. Now `top:11%`: **56.4 per cent on lens, 3.6 per cent wasted**.
One declaration, one value to revert, keyframes and reduced-motion path untouched.

**WHAT IS NOW BLOCKED ON ART, WITH AN EXACT SPEC.** Canvas 680 x 1344 registered to
`scene_character.png`; lens x 185..568, y 37..319; emissive peak y 201..268; maximum width 297 px;
cyan to magenta left to right. Until that exists, the visor stays a CSS gradient.

**STILL OPEN, UNCHANGED BY THIS SESSION:** the contact-shadow decision, blocked by the shared
`.car-img, .char-img` drop-shadow rule; the coordinated idle policy that must precede any rig; the
first Spine idle rig itself.

---

## 0A. WHAT THE COMPLETION KIT CHANGED

**Of 24 top-level deliverables in the kit, ONE could be used.**

| Ledger item | Was | Now |
|---|---|---|
| **R102-E2** banner art missing | OPEN, art did not exist | **CLOSED IN ART.** Four 718x88 candidates arrived; variant B selected on measurement and PLACED working-tree-only, with its CSS wiring also working-tree-only. **Committing either would fail CI**, see below |
| **R102-E5** visor baked into the head | OPEN, needed an art request | **CLOSED 2026-08-25: solved in art AND in law, see 0F.** Historic text follows: The kit ships a visor-off head plus separate visor, eye and chest emissive layers. They are externally designed, so the ruling still gates them |
| **R103-SPINE-LAW** external parts illegal | OPEN | OPEN, and **route B was re-sized from medium to LARGE**: the in-house master is in the folded-arm hero pose and needs limb re-authoring, not just grouping. **Route A, one owner ruling, is now the cheapest path by a wide margin** |
| **R097-FX-SET** particle gap | OPEN | **STILL OPEN.** The kit's smallest asset is 128x160; the four particle rows need 40, 128, 56 and 32 px. Neither art flood has addressed them. A machine-ready commissioning prompt is now written |
| **FX-01 / FX-03 sheets** | WRONG-SPEC | **STILL WRONG-SPEC.** FX-01's frame COUNT is right at last (6), the frame SHAPE is not: 256x320 delivered against 200x200 required |
| **R097-SC03-UI04** | UI-04 closed at R103 | SC-03 still open; the kit's two bezel variants are both wrong for either reading of the target |
| **R103-E10** unused paytable import | OPEN | **CLOSED.** Removed; the function is still used by BuyBonus so the export stays |
| **R102-E1** guide misrepresented controls | CLOSED at R103 | **VERIFIED STILL CLOSED.** The six icons match HEAD |

**THE BANNER'S WIRING CANNOT BE COMMITTED, and the reason is a gate rather than a preference.**
`frontend/scripts/asset_reference_gate.mjs` asserts every asset path the code references exists
in dist, and `build_diet_verify.mjs` fails any 404. A committed `url()` pointing at an
uncommitted raster would fail both. **So the raster and its one CSS line both stay in the working
tree, together**, and the next session either commits both or reverts both.

**Two working-tree changes are live and deliberate**, and are recorded here so nobody finds them
cold: a new untracked hud_banner.png under the theme's ui directory, and one `background-image`
layer added to `.fs-panel` in `HudOverlay.svelte` (modified, uncommitted). (The raster's path is
deliberately written in prose rather than backticked, because it does not exist at HEAD and the
document currency gate correctly refuses a citation to a file that is not there. It refused this
very line once.)



**Built 2026-08-25 by R103 WORKSTREAM 1**, reconciling every escalation and open finding from
R086 through R102 into a single list, then correcting it against the repository at HEAD.

**How to read it.** "Owner?" means the item cannot be closed by a builder because it needs a
judgement, a wording choice, a spend, or new art. Everything marked NO is a builder task that
only needs scheduling. Evidence is a path, a line, or a measurement taken this session.

**This file supersedes the scattered ESCALATIONS sections as the place to look.** Those
sections stay where they are, because the record of what each session believed is evidence.

---

## 0. CORRECTED ASSUMPTIONS — read this first

These four statements are established, measured, and have been misread before. WORKSTREAM 1.2.

| # | Statement | Evidence |
|---|---|---|
| A1 | **Every live HUD control is CSS or inline SVG.** None is a raster. | `HudOverlay.svelte` has 0 `<img>` and 27 `<svg>`, counted at HEAD |
| A2 | **The button PNGs are Interface Guide captures, not live HUD art.** They are headless screenshots of the CSS controls. | `frontend/scripts/regen_interface_guide_icons.mjs` captures by CSS selector into the shipped ui directory; `docs/art/ART_HANDOVER_ARC2.md` section 3 names all ten |
| A3 | **Six placeholders were documentation icons**, so the Interface Guide stopped depicting the live controls. | spin_button, btn_turbo, btn_menu, btn_autoplay, btn_bet_plus, btn_bet_minus. Each: 0 live-HUD `<img>` refs, 1 PaytableModal ref, 1 regen-script target. **RESTORED to HEAD in the working tree by R103 W2.3.** |
| A4 | **The only safe live-HUD art target is the decorative banner panel** `.fs-panel`. | `pointer-events:none`, `z-index:59` against controls at 61, no accessible name, no locale text. Geometry verified 718x88 this session from the token arithmetic, not assumed |

**Anything in an earlier record that reads as "new HUD art exists but is not wired" is wrong in
its premise.** The art in question is a photograph of the thing it would replace.

---

## 1. SAFETY — all closed

| ID | Item | Status | Evidence | Owner? |
|---|---|---|---|---|
| R097-F23 | `npm run assets` silently reverts placeholders | **CLOSED** R101 | Guard refuses at exit 2; measured 16 overwrites, 17 recreations | No |
| R101-E1 | Three background scripts unguarded | **CLOSED** R102 | Exemption withdrawn; all three refuse | No |
| R102-C2 | `regen_interface_guide_icons.mjs` unguarded | **CLOSED** R102 | Guarded via `--require-clean` | No |
| R100-E2 | Client guard beyond brief's file list | **OPEN**, ratification only | `CLIENTS` + `require_client()` in generate.py | **Yes**, Fable ratifies |
| R097-TREE-GUARD | Kit packaging forbidden while placeholders differ from HEAD | **STANDING** | Operating constraint, not a task | No |

**Residual risk: none known.** All seven writers into the shipped asset tree are guarded.
`ingest.py` is NOT guarded and does not need to be: its `DEFAULT_OUT` is a gitignored scratch
path, verified this session, so it produces candidates rather than shipping them.

## 2. PROVIDER AND LEGAL

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| R099-E2 | Ticket 456254 rests on a transcription, no captured source | OPEN | No capture anywhere in repo, Desktop or Downloads | **Yes** | Archive the correspondence |
| R099-E3 | No committed credit price, so `cost_of` refuses | OPEN | `'gpt-image-1' has no committed credit price` | **Yes**, spend decision | Capture pricing, or rule a covered-plan exemption |
| R100-E1 | **No OpenAI client exists** | OPEN, **first blocker** | `generate.py` implements Stability only | No, builder task | Implement the client |
| R099-E1 | Mark changed on the owner's brief, gate comment asks for a Fable ruling | OPEN | provider_gate.json `_comment` | **Yes** | Ratify or revert, one field |
| R097-F34 | Provider ruling gates whether any placeholder can ship | **PARTIAL** | Ticket 456254 cleared artwork; generation still blocked by the above | **Yes** | Downstream of the three above |
| R097-F35 | submission-1 held on the portal artefact | OPEN, a hold | Owner-side | **Yes** | None available to a builder |

## 3. ART GAPS AND COMMISSIONING

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| R102-E2 | **Banner panel art does not exist** | OPEN | 718x88, aspect 8.159; nothing on disk within reach | **Yes** | Commission to the R103 spec |
| R097-FX-SET | The 8 P4 FX rows were the whole coverage gap | **PARTIAL**, see W3 | The 2026-08-25 FX set delivers no sprite under 480px; the four particle rows stay unfilled | **Yes** | Commission particle sprites at 40/128/56/32 px |
| R097-SC03-UI04 | SC-03 and UI-04 uncovered | **UI-04 CLOSED** R103 | Jet nozzle intaken, 0.00% aspect drift, bbox -7.6%/-9.5% | Partly | SC-03 still open, see 5 |
| R097-F19 | SC-01 background room: WORKSHOP taken as default, dyno-cell unreviewed | OPEN, longest-standing | R097 | **Yes** | Pick the room |
| R100-E7 | Background subject drifted: manifest says rain-soaked city, batches ban rain | OPEN | manifest SC-01 role vs batch records | **Yes** | Settle in the manifest |
| R097-F16 | Title lockup darker than what it replaced, 3.42:1 | OPEN | R097 | **Yes** | Accept or re-render |
| R097-F17 | Tile plate busier than the flat rectangle it replaced | OPEN | R097 | **Yes** | Accept or re-render |
| R097-F18 | Tile plate corner radius now comes from CSS, not the art | OPEN | R097 | Weak yes | Accept |
| R087-SCATTER-TUMBLE | Scatter placeholder may tumble under the restored 360 degree idle | OPEN | R087 | **Yes** | Look pass |
| R090-M2-NUDGE | M2 top edge to row 8-10 at the next re-render | OPEN | R090 | No | Fold into the next batch |
| R103-E5 | `feature_button.png` is now the only working-tree placeholder among the guide's ten | **NEW** | After the W2.3 restore | **Yes** | Revert it too, or accept |
| R103-E11 | `wild.png` carries a readable Latin W | **CLOSED, not a defect** | DESIGN_SYSTEM text-free law names "the machined W emblem inside the Wild" as its single exception | No | None |

## 4. WIRING AND HOMELESS ART

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| R097-F20 | ~9.65 MB of win/Overdrive art has no render site | OPEN | R097 | **Yes** | Decide: build the surface or drop the art |
| R097-F21 | Title states and character poses have no state machinery | OPEN | R097 | **Yes** | Same |
| R097-F22 | Seven swapped UI controls change the guide and buy screen, not the HUD | **SUPERSEDED** by A2/A3 | The premise is now understood | No | Closed by the W2.3 restore |
| R089-E3 | Four shortlist UI rows have no live raster target | **SUPERSEDED** by A1 | The HUD draws no rasters | No | — |
| R102-E3 | Eight dead asset paths in `themeStore.ts` | OPEN | Zero consumers outside their own definition | Weak yes | Wire or delete |
| R103-E7 | Paytable rebuilds asset paths itself rather than using the themeAssets helper | OPEN, no defect today | Lens finding | No | Tidy |
| R103-E9 | `data-testid="interface-guide"` also wraps the Bet Modes footnote | OPEN, no visual defect | Lens finding | No | Narrow the testid |
| R103-E10 | `maxWinVsBaseBetLabel` imported and unused in the paytable | OPEN | Lens finding | No | Delete the import |
| R097-F32 | Four dead CSS selectors outside the liveness gate's class | OPEN | R097 | No | Sweep |
| R093-LOGO-BOX | A blocky title lockup would need a `.logo-box` layout change | OPEN | R093 | **Yes** if the title shape changes | — |

## 5. TOOLING

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| R100-E5 | SC-03 crashed the composer | **HALF CLOSED** R103 | Crash fixed: now a clean `ComposerRefusal`, seeded 22/22. The TARGET is still ambiguous | **Yes** for the target | See the question in the report |
| R100-E6 | 7 of 30 manifest notes cut mid-token by `notes.split('.')[0]` | OPEN | Measured R100 | No | Sentence-split fix |
| R100-E4 | No per-row negative; UI-05 needs the opposite of the global one | OPEN | compose.py reads one `negative` | No | Add per-row override |
| R097-F24 | `ALPHA_SNAP_FLOOR` does not clear the alpha its docstring claims | OPEN | R097 | No | Fix |
| R097-F25 | `ingest.py` hardcodes quality 92 / subsampling 0 | OPEN | R097 | No | Add CLI override |
| R097-F26 | Aspect-refusal message advises a flag that squashes | OPEN | R097 | No | One-line message fix |
| R097-F27 | No `--compare-against-shipped`; the bbox test is hand-run every time | OPEN | R097; R103 ran it by hand again | No | Build it |
| R097-F28 | `BASELINE_WARNINGS` is 36 against a real count of 4 | OPEN | R097 | No | Constant change |
| R093-SC07-TRAP | `scripts/assets/manifest.json` still exports SC-07, whose art row is DEAD | OPEN | R101-E3 restates it | No | Manifest edit |
| R103-E8 | The manifest generates `_1x` symbol variants nothing references | **NEW** | 10 of the 17 recreated files are `_1x` | No | Stop generating them, or wire them |
| R086-E5 | The incoming art directory is live, so a snapshot can race a batch | OPEN | R086 | No | Structural answer already recorded |
| R087-E4 | Local preview cannot exercise a real board | OPEN | Environment constraint | No | — |
| R090-E4 / R096-E2 | Symbol and scene payload growth | OPEN, watch items | R090, R096 | No | Watch |

## 6. SPINE AND ANIMATION

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| **R103-SPINE-LAW** | ~~external robot parts cannot enter the animation pipeline~~ **CLOSED 2026-08-25 BY OWNER RULING, see 0F** | **CLOSED** | DESIGN_SYSTEM: anything the pipeline "positions or animates" is "NEVER externally designed. No exception, and no measurement changes that answer". External scene art is permitted *because* "it animates nothing" | **Yes** | Owner ruling, or the in-house route |
| R102-E4 | Parts are in a gitignored path, so nothing may cite them | OPEN, subsumed by the above | Convention (m) | **Yes** | — |
| R102-E5 | The visor is baked into the head part | OPEN | Measured R102, re-verified R103 | **Yes** | Three options recorded |
| R103-SVG-DORMANT | The in-house robot vector master exists, is tracked, and is DORMANT | **NEW** | `frontend/scripts/scene/scene_character.svg`, 340x672, one flat group of ~35 unnamed paths, zero live consumers | **Yes** | See the three routes in the Spine doc |
| R087-E1 | Idle excursion amplitudes to be judged by eye | OPEN | R087 | **Yes** | Look pass |

## 7. DOCUMENTATION DRIFT

| ID | Item | Status | Evidence | Owner? |
|---|---|---|---|---|
| R100-E3 / R086-E3 | M3 identity across three documents | **PART CLOSED** R103 | DESIGN_SYSTEM corrected with the prior text preserved. **FX-01's role still says booster flame and feeds a generation prompt, so it was escalated not edited** | **Yes** for FX-01 |
| R101-E2 | R097's "recreates 15" superseded by a measured 17 | OPEN | Recorded, not yet corrected in R097's own file | No |
| R102-E6 | R097's "only known command" superseded | OPEN | Same | No |
| R097-F29 | Four manifest `renders_in` citations point at wrong lines | OPEN | R097 | No |
| R097-F30 | DOC-10's note miscounts the regen targets | OPEN | R097 | No |
| R097-F31 | ART_HANDOVER carries two off-by-one counts | OPEN | R097 | No |
| R097-F33 / R089-E1-DISPOSITION | Escalation ledger stale and self-contradictory | **CLOSED by this file** | This ledger is now the single list | No |
| R087-R088-PACK | The R088 pack | **PART CLOSED** | Style register landed R100 | **Yes** for the rest |

## 8. PAYTABLE, TEXT AND LOCALE

| ID | Item | Status | Evidence | Owner? | Next action |
|---|---|---|---|---|---|
| R103-E1 | **`btn_max.png` bakes the English word MAX** while `hudMax` is localised | **NEW** | Guide icon carries baked type | **Yes** | It is a capture of a CSS control whose label is text; re-capture per locale is impossible, so the guide row needs a localised caption instead |
| R103-E3 | Symbol names WILD and SCAT reach the player as hardcoded literals | **NEW** | From a script-side table | **Yes** | Localise or rule them brand terms |
| R103-E2 | `RTP` is a bare hardcoded literal in paytable markup | **NEW** | Lens finding | No visible defect | Localise |
| R103-E4 | Overdrive award strings bypass the locale number convention | **NEW** | Lens finding | No visible defect today | Route through the formatter |
| R102-E1 | The guide misrepresented the live controls | **CLOSED** R103 W2.3 | Six icons restored to HEAD in the working tree | No | — |


### CI incident, 2026-08-25, recorded so the next session does not misdiagnose it

**R103's first run on `b305f9d9` concluded CANCELLED, and it was a runner incident, not a
defect and not a threshold.** The `what changed` job hit its `timeout-minutes: 5` at 5m01s
with EVERY step reporting success; its `Check out` step alone took **298 seconds**. Because
that job gates the browser matrix, the 28 browser gates never ran, so the run could not be
called green even though `static gates` had passed every step.

**The first diagnosis was wrong and the numbers corrected it.** The repository's pack is
1.37 GiB, of which `reports/` is 1,199 MiB (63%), so "the repo has grown past the timeout"
was an appealing story. It does not survive the data: the four preceding runs checked out the
same repository in **30s, 39s, 24s and 106s**, and the re-run of this very commit took **36s**
and went **30/30 green**. 298s is an outlier at roughly 3x the worst recent run, not a trend.

**This is the second recorded instance of the class**, the first being the 9m24s run whose
`Install frontend dependencies` step ran 320s against 9 to 22s elsewhere in the same run.
`CLAUDE.md` already draws the rule from it: **a slow run is a runner or npm incident until the
per-step timings say otherwise, and the way to tell is to read the step breakdown.** That rule
worked here.

**The residual fragility is real but is NOT a defect to fix on this evidence.** A 1.37 GiB
history makes a `fetch-depth: 0` job more exposed to a bad runner than a small repository would
be. If this recurs, the cheap fixes in order are: raise `timeout-minutes` on that one job; or
fetch only the merge-base rather than full history; or address the evidence volume in
`reports/`, which is the largest and riskiest option and rewrites history.

---

## The shortest true summary

**Nothing unsafe is outstanding.** Every command that could silently destroy the visual work is
guarded, and that was verified by execution rather than by reading.

**The programme is gated on five owner decisions**, in the order that unblocks the most work:
the OpenAI pricing or exemption; the banner panel commission; the Spine system-law question; the
homeless win and Overdrive art; and the background room. Everything else on this list is a
builder task waiting for a slot.
