# OUTSTANDING LEDGER, arc 2 — one authoritative list

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
| **R103-SPINE-LAW** | **The external robot parts CANNOT enter the animation pipeline under the system law** | **NEW, BLOCKING** | DESIGN_SYSTEM: anything the pipeline "positions or animates" is "NEVER externally designed. No exception, and no measurement changes that answer". External scene art is permitted *because* "it animates nothing" | **Yes** | Owner ruling, or the in-house route |
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
