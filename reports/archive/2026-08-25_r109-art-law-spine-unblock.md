
# Session Report - R109 ART LAW WITHDRAWN: Spine unblocked, two audit-facing documents needed care, and the blocker map has no Stake blockers left (2026-08-25)

Brief saved verbatim: `reports/briefs/FS_FABLE_R109_ART_LAW_SPINE_UNBLOCK_Prompt.md`. Branch:
`claude/r109-art-law-spine-unblock`, review lane. **Zero rasters staged or committed. No kit
packaging. Guards untouched and still refusing at exit 2. The committed banner pair was not
disturbed.**

---

# WORKSTREAM 1 - THE OLD LAW, FOUND AND UPDATED

## 1.1 Every source located

A tracked sweep for the restriction returned occurrences across 30-odd files. They split cleanly,
and the split is the whole method here:

- **ACTIVE INSTRUCTIONS**, which go stale and were amended: the system law, the builder
  conventions, the compliance mirror, the facts sheet, the submission dossier, the Spine setup
  doc, the FX spec.
- **DATED RECORDS**, which do not go stale and were NOT touched: `reports/SESSION_REPORT.md`,
  every `reports/archive/*`, `reports/FABLE_COMMS.md` entries, saved briefs, `design-system/archive/*`
  and the QA shards. **Convention (s): history does not go stale, instructions do.**

## 1.2 The seven documents amended

| File | What changed |
|---|---|
| `design-system/DESIGN_SYSTEM.md` | The SYSTEM LAW itself. Ruling quoted verbatim; superseded rule kept in full beneath it |
| `CLAUDE.md` | Condition 2 struck and replaced; test step 1 demoted from a gate to a labelling step; the 2026-07-27 amendment annotated |
| `COMPLIANCE_WATCH.md` | Original-IP claim re-qualified |
| `GAME_FACTS.md` | See 1.4 |
| `SUBMISSION_DOSSIER.md` | See 1.4 |
| `docs/design/SPINE_ROBOT_RIG_SETUP.md` | Blocker section marked SUPERSEDED, route A opened, visor question closed, new section 10 added |
| `docs/design/FX_REGENERATION_SPEC.md` | Robot layers unblocked; the "static art that animates nothing" distinction withdrawn |

**Not one deleted its old text.** Each carries the supersession beside what it replaced.

## 1.3 The new rule, stated unambiguously

> External development-stage artwork may be used in the Future Spinner animation pipeline,
> including character rigging and Spine, provided final shipped assets remain
> quality-controlled, provenance-recorded, and presentation-safe for Stake.

Three conditions survive and are not optional: **quality-controlled**, **provenance-recorded**,
**presentation-safe for Stake**. Unrequested external art remains prohibited. **Scope is Future
Spinner**; other WRS titles stay under the superseded rule until the owner says otherwise, and
`DESIGN_SYSTEM.md` says so explicitly because it governs all WRS titles.

## 1.4 TWO AUDIT-FACING DOCUMENTS NEEDED CARE, NOT AN EDIT

`GAME_FACTS.md` states of itself that it is compiled for external audit. `SUBMISSION_DOSSIER.md`
is submission-facing. **Both asserted "symbols remain never externally designed".**

**That sentence is now false as a RULE and still true as a FACT.** The externally generated
symbol art is uncommitted and under review, so the committed set really does still derive from
the in-house SVG masters.

Both documents now state the rule change **and** say plainly that the shipped-set claim must be
re-verified before any submission that adopts that art. **A reviewer must not be shown a rule the
project has withdrawn, and must not be shown a false claim about what ships.** Getting only one of
those right would have been worse than leaving the documents alone.

## 1.5 One reading surfaced rather than decided, per convention (n)

The superseded law's strictest clause was about SYMBOLS: "NEVER externally designed. No
exception." The ruling withdraws the animation-pipeline restriction and names rigging and Spine
as an example, using "including", without naming symbols as an exception to the withdrawal.

**Read literally, externally sourced development-stage symbols are now permitted**, which is also
what this project has been doing in practice for the whole of arc 2. **The documents apply the
ruling as written and flag the reading in place.** If the owner intended symbols to stay
in-house-only, that is one sentence and the place for it is marked.

---

# WORKSTREAM 2 - SPINE UNBLOCKED

## 2.1 What the package actually contains, re-measured

| Group | Canvas | Registers to | Usable for |
|---|---|---|---|
| **11 body parts** | 190x270 to 480x340 | each other; pivots verified at R102 | **the rig** |
| **emissive v1**: visor-off head, visor glow, eye, chest | 640x640 / 640x320 / 640x160 / 640x480 | **each other**, subjects 583-596 wide | a rig built on the v1 head |
| **emissive v2**: visor, eye, chest | **680x1344 each** | **the SHIPPED hero, exactly** | **CSS overlays, no rig needed** |
| contact shadows, three generations | 680x240, 2840x300 | the hero widths exactly | grounding, blocked separately |

**THE ONE GENUINELY MISSING PIECE.** No visor emissive is registered to the RIG's 380x330 head
part. v1's visor-off head is 640x640 with a subject aspect of **1.140 against the rig head's
1.175**, so it is a **different render**, not the same head at another size. A rig using it must
take the whole v1 family and be checked for style consistency against the other ten parts.

## 2.2 The first non-static target is smaller than a rig

**The game already animates the visor.** `SceneGroup.svelte` carries `.visor-glint`: a CSS
radial-gradient at `left:32%; top:17%; width:20%; height:12%`, keyframed opacity, `mix-blend-mode:
screen`, and a `prefers-reduced-motion` rule setting it to `opacity: 0`.

**v2's visor layer registers to the same 680x1344 canvas as the hero it sits on.** Swapping the
gradient for it keeps the same keyframes, the same blend mode and the same accessibility rule, and
adds **no runtime, no dependency and no architecture**. The eye and chest layers follow the same
argument.

**Why R109 did not implement it.** It is a player-visible change to the hero; `mix-blend-mode:
screen` behaves differently over a full-canvas painted raster than over a small gradient; and it
pairs a new raster with a CSS reference, so both must land together exactly as the banner did.
**That is a short, well-defined brief rather than a blind edit**, and the brief's own instruction
was to leave a precise implementation path where a safe foundation could not be completed.

## 2.3 The implementation path, now concrete

Written into `docs/design/SPINE_ROBOT_RIG_SETUP.md` section 10. Hierarchy, pivots, import
procedure and the first-idle specification were already in sections 3, 4 and 9. **What R109 adds
is the runtime insertion point, which was previously unanswerable:**

**`SceneGroup.svelte`'s `.char-layer`**, a positioned wrapper at `left:22px; bottom:18px;
width:206px; height:407px`. The rig replaces `<img class="char-img">` inside it, with the static
image kept behind a feature flag as the fallback.

**A NEW DECISION THE UNBLOCK CREATES.** `.char-layer` carries `animation: char-idle 5s`, which
supplies the bob and breathe in CSS. A rigged idle does the same job in the skeleton. **Running
both doubles it.** This is the same class as the contact shadow's shared `drop-shadow`, and it
should be decided before rigging rather than discovered after.

**Still needs tooling:** a Spine runtime dependency, an atlas loader, a render target inside a
Svelte component, and a reduced-motion path that stops the idle rather than slowing it. **That is
a dependency decision, and it is why 2.2 comes first.**

---

# WORKSTREAM 3 - OTHER OUTDATED RULES

**Removed this session:** the animation-pipeline restriction; two ledger rows marked "blocked in
law"; the FX spec's "static art that animates nothing" distinction; `CLAUDE.md` test step 1's
class gate.

**Actively looked for and NOT FOUND:** any rule blocking component work while placeholders are
dirty. The only match was a heading in the HUD commissioning spec categorising art-only versus
component work, which is a categorisation and not a prohibition. **The suspicion was reasonable
and the rule does not exist.**

**Examined and DELIBERATELY KEPT, with the basis stated:**

| Rule | Basis |
|---|---|
| Kit packaging forbidden while any placeholder differs from HEAD | Packaging now would ship **30 unreviewed rasters**. Real safety |
| The seven asset guards | They prevent silent destruction of the visual set, proven by execution at R101 |
| Locked-path sanction tokens | Money path and the maths package |
| HUD control labels stay CSS or SVG | **Sixteen locales.** Baked text cannot localise. Scoped to labels, values, the accent colour and state animations, not to whole controls |
| Convention (p) self-tests, explicit paths, evidence hygiene | Ordinary discipline, no product cost |

---

# WORKSTREAM 4 - THE BLOCKER MAP, REBUILT FROM ZERO

## A. Real Stake or product blockers: **NONE**

The only platform-touching item is submission-1 held on the portal artefact, an owner-side hold
rather than a defect. The AI-provenance scoring risk is a quality consideration the ruling's own
"presentation-safe" condition now carries.

## B. Internal outdated process residue: **cleared this session**, see Workstream 3.

## C. Owner decisions still needed: **seven**

1. SC-03's target, the last uncovered REPLACE row.
2. The shared `.car-img, .char-img` drop-shadow, which blocks the contact shadows.
3. **`char-idle` versus a rigged idle** — new this session.
4. **Does the ruling cover symbols?** — surfaced, applied as written.
5. Whether sub-10x wins should celebrate.
6. Whether to commit the 30 working-tree placeholders.
7. The baked MAX in the guide icon; the background room; OpenAI pricing or a covered-plan exemption.

## D. Ordinary implementation work, cheapest first

1. Visor, eye and chest overlays on the static hero. No dependency.
2. Contact shadows, once C2 is answered.
3. The OpenAI client, then pricing.
4. The Spine rig, once C3 is answered.
5. Small tooling debts: 7 truncated manifest notes, `BASELINE_WARNINGS`, four wrong `renders_in`
   citations, the unreferenced `_1x` variants.
6. Paytable panel targets, which do not exist at all.

---

# WORKSTREAM 5 - PROGRAMME STATE

| Question | Answer |
|---|---|
| Old law removed or amended? | **Amended in seven documents**, none deleted its old text |
| Spine unblocked? | **Yes.** Route A open; runtime insertion point identified; one new decision created |
| Other outdated rules found? | One class removed; the suspected placeholder/component block **does not exist**; five rules examined and kept with reasons |
| Remaining true blockers? | **No Stake or product blockers.** Seven owner decisions, and ordinary work |
| Recommended next session | **The visor/eye/chest overlay pair**: smallest, no dependency, art registers exactly, and it is the first thing the ruling actually unlocks |

**Unchanged:** REPLACE coverage 29/30 = 96.7%, all eight FX rows closed, 30 working-tree rasters
uncommitted.

---

## Verification

Generate self-test **22/22**. Asset guard **11/11**. Ingest **17/17**. Doc currency **PASS, 0
new**. Locked paths **PASS**. Zero rasters staged.

## ESCALATIONS

**E1 (R109). Does the ruling cover SYMBOLS?** Applied as written; one sentence settles it.

**E2 (R109). `char-idle` versus a rigged idle** — decide before rigging.

**E3 (R109). The audit-facing documents now carry a conditional claim** that must be re-verified
before any submission adopting the externally generated symbol art.

**E4 (R109). No visor emissive registers to the rig's 380x330 head part.** The 640 family is a
different render.

**Closed:** R103-SPINE-LAW, R102-E4 (reduced to ordinary work), R102-E5, R104-E2.

Model and effort: one session, unattended, review lane, high care, five workstreams. A law change
applied to seven documents without deleting a line of history, and two audit-facing documents
handled as compliance text rather than as prose.
