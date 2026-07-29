# Stream test clusters

JOB 2 of `reports/briefs/FS_SESSION1_STREAM_CLOSE_Prompt.md`. The ledger's findings
grouped by DEFECT IDENTITY rather than by squad, so verification can settle a defect once
instead of settling every report of it.

Marshalled in the main loop at grep level, 2026-07-29, over **54** active shards.

Australian English, no em dashes or en dashes.

## Scale

**566 active findings: 60 STREAM, 183 HIGH, 242 MEDIUM, 81 LOW.** Superseded native
shards at `shards/superseded/` are excluded; their content was re-judged by the sight
gate re-run and their surviving claims live in the re-run shards.

> **CORRECTED 2026-07-29 by the boot-set audit. This line read "571 active findings" and
> "over 55 active shards".** The four tier figures were and are exactly right; only the
> total was wrong, by 5.
>
> **Derived, not estimated.** Counting the finding headings in the 54 active shard files,
> `grep -cE "^## [A-Za-z0-9-]+ (STREAM|HIGH|MEDIUM|LOW) "`, gives STREAM 60, HIGH 183,
> MEDIUM 242, LOW 81, total **566**. The components already summed to 566 in this document's
> own sentence, so the error was visible on its face and survived anyway. It is also
> corroborated from the other side: `KNOWN_OPEN.md` independently recorded "506 are HIGH,
> MEDIUM or LOW", and 60 plus 506 is 566.
>
> **Why this one mattered.** 571 was quoted onward into `KNOWN_OPEN.md`, which briefs boot
> from, and a total nobody can reproduce is the shape of claim that makes a whole register
> untrustworthy. The shard count was 54 files, not 55: the 55th `.md` in that directory is
> `SHARD_INDEX.md`, which is the index rather than a shard.

This file clusters the **STREAM** tier, which is what `DONE MEANS` turns on. The HIGH,
MEDIUM and LOW tiers are clustered only to a count here and are parked for Session 2.

## Why clustering is not a shortcut

The squads were shared-nothing: one lens, one third of one session, no sight of each
other's shards. Where many independently report the same defect, that is corroboration
from genuinely independent inputs in the sense convention (l.4) requires. Fable's
RULING 2 adopts cluster verification with three safeguards, and they are the substance:
**two representative instances drawn from DIFFERENT squads, two-verifier panels on every
STREAM cluster, and any divergence between instances REOPENS the cluster.**

## The STREAM clusters

Twenty six. Ordered by corroboration weight, which is also verification priority: the
most independently reported defects are both the likeliest to be real and the cheapest to
settle.

| # | Cluster | Instances | Squads reporting |
|---|---|---|---|
| **C-01** | **The reel window is transparent mid-spin and the scene art shows through the board** | **12** | STC-DESKTOP-A, STC-LAPTOP-A, STC-MOBILEL-1, STC-POPOUTS-1, STC-STRETCH-A, STM-DESKTOP, STM-LAPTOP, STM-MOBILEM, STM-MOBILES, STM-POPOUTL, STM-POPOUTS, STM-STRETCH |
| **C-02** | **The buy confirm dialog states a price and offers no reachable CONFIRM or CANCEL; body copy sliced by the stats strip** | **8** | STC-LAPTOP-B, STC-MOBILES-3, STC-POPOUTL-B, STC-POPOUTS-3, STT-LAPTOP-B, STT-POPOUTS-2, STT-POPOUTS-3 |
| **C-03** | **The win detail strip prints raw internal symbol codes to the player, at a few device pixels** | **4** | STT-MOBILEL-2, STT-MOBILES-2, STT-POPOUTS-3, STL-AR-A |
| **C-04** | **The max win COLLECT leaves win lines and celebration glow painted over an emptied board** | **3** | STM-DESKTOP, STM-MOBILES, STM-POPOUTL |
| **C-05** | **The big win band covers the reel frame's rails and hides grid rows** | **2** | STC-MOBILEL-1, STC-MOBILES-1 |
| **C-06** | **The intro rules Continue button is drawn over its own body copy** | **2** | STC-POPOUTS-1, STT-POPOUTS-1 |
| **C-07** | **Paytable bullet markers pinned left while their text is centred** | **2** | STC-POPOUTL-A, STT-POPOUTL-A |
| **C-08** | **The feature instrument column is cut by the right viewport edge, taking a money value with it** | **2** | STC-POPOUTS-3, STT-POPOUTS-3 |
| **C-09** | **The PAYTABLE menu item is unreachable at small viewports, so a platform-required surface has no route** | **2** | STC-POPOUTS-1, STT-POPOUTS-1 |
| **C-10** | **Two money figures on screen disagree during the win presentation** (the MID-01 family) | **2** | STM-MOBILEM, STT-MOBILEM-1 |
| **C-11** | **The max win overlay does not hide the live HUD; the collect instruction prints across BALANCE and WIN** | **2** | STM-MOBILEM, STC-MOBILES-3 |
| C-12 | The German Responsible Play paragraph renders in English under a German heading | 1 | STL-DE-B |
| C-13 | The German paytable states max win twice with two different thousands separators | 1 | STL-DE-A |
| C-14 | `5,000×EINSATZ` collides unit with multiplier on the German max win hero | 1 | STL-DE-B |
| C-15 | The Arabic max win overlay prints multiplier and unit in LTR order | 1 | STL-AR-B |
| C-16 | A stock browser focus ring persists on the last control touched, through spin, win and COLLECT | 1 | STM-POPOUTS |
| C-17 | The SPIN glyph renders as a solid black blob for the whole of every spin | 1 | STM-MOBILES |
| C-18 | The rules card fades at element opacity, so balance and reels read through its body copy | 1 | STM-MOBILES |
| C-19 | The free spins entry gate is still fully painted through the documented feature run | 1 | STM-STRETCH |
| C-20 | The balance readout never moves across five settled spins, contradicted by the session panel | 1 | STC-POPOUTL-A |
| C-21 | The autoplay panel opens over the FEATURES button and cuts its label to `FE` | 1 | STC-DESKTOP-B |
| C-22 | The FEATURES menu saws the OVERBOOST card through its heading, two buy tiers off-panel with no cue | 1 | STC-POPOUTL-B |
| C-23 | The paytable does not cover the viewport when scrolled; a lit band of scene sits across the bottom | 1 | STC-LAPTOP-A |
| C-24 | The splash's call to action renders off the bottom edge, so the first surface carries no instruction | 1 | STC-POPOUTS-1 |
| C-25 | Feature entry copy is painted over the speedometer graphic rather than below it | 2 | STC-MOBILEL-3, STC-MOBILES-3 |
| C-26 | The max win hero sets one phrase in three sizes and three colours; HUD menu casing splits on the keyed boundary | 2 | STT-MOBILEM-3, STT-POPOUTS-1 |

**Corroboration is not verification.** C-01 being reported twelve times by twelve
shared-nothing squads establishes that it was SEEN across seven viewports and two lenses.
It does not establish the diagnosis or the proposed fix, which is what the panels are for.

## Already verified without a panel, and why

Three findings are NOT sent to verification because they were established first-hand from
source and frames by the session rather than reported by an agent, which is a higher
standard than a panel gives:

- **MID-01 / TR-116**: derived from `WinBanner.svelte:79,166` and `HudOverlay.svelte:302-315`
  BEFORE measurement, predicting the pod at $15.96 when the banner shows $10.29; frame
  `013` reads $15.95. Agreement to one cent. **RULED by Fable: shared clock.**
- **MID-02 / TR-117 glyph half**: `WinBanner.svelte:205` reads ASCII `x`, verified by
  codepoint against seventeen files using U+00D7.
- **TR-104 remaining half / TR-117 locale half**: frames `430` and `482` prove the tier
  label is already locale routed; `WinBanner.svelte:210` is `sv('BET', $isSocial)`, and
  the `bet` key exists in all sixteen locales.

## Parked for Session 2

The HIGH (183), MEDIUM (242) and LOW (81) tiers are not clustered beyond their counts and
are not verified. That is the degradation order operating as written, not an omission.

## VERIFICATION, batch A: the eleven multi-instance STREAM clusters

Two-seat adversarial panels per Fable RULING 2, each seat told to REFUTE and to default to
refuted when uncertain, shared-nothing, 22 verifiers, zero lost. 2,093,785 tokens.

| Panel verdict | Count |
|---|---|
| CONFIRMED | 1 (C-07) |
| **PARTIAL** | **9** |
| REFUTED | 0 |
| SPLIT | 1 (C-11) |
| **REOPENED** | **3** (C-03, C-10, C-11) |

**Nothing was refuted, and almost nothing was confirmed clean.** The defects are real; the
DIAGNOSES are mostly wrong or incomplete. PARTIAL in this pass means a correct symptom
attached to a cause that does not survive reading the source, and it is the most useful
verdict the panel could have returned, because **a fix aimed at the wrong line does not
work and lands later as a failed fix rather than as a bad diagnosis.**

### C-01, the worked example, and why shipping the shard's fix would have been wrong

Twelve squads saw the reel window go transparent mid-spin. It is real, and the panel found
it worse than any shard measured: at `007_desktop_transition_reels_accelerating.png` the
interior probes `(37,56,85)` against an undisputed exterior scene at `(13,57,89)`, so the
interior is as bright as the exterior and **nothing is in front of it at all**.

But both cited causes were wrong, in different directions:

- **Instance A** cited `GameGrid.svelte:1225-1233`, and that holds for why the hole is
  SEE-THROUGH. It is not why there is a hole, and the shard never asks. **The geometric
  cause is one line nobody read**: `const DROP_H = 520` at `GameGrid.svelte:499`. The strip
  is 7 slots at `TILE = 104`, so 724px, with `REST_Y = -104`; at `startY = -624` its bottom
  edge sits at y=100 inside a 412px column, leaving **312px, 76 per cent of the reel
  window, bare by construction on every single drop.**
- **Instance B's cause is refuted by the source.** It claimed the cells are unpopulated
  strip slots; all seven are rendered unconditionally at `:1134` and painted at `:497`
  before the fall starts. **Its proposed fix is therefore a no-op**: it changes nothing in
  either frame.
- **Instance A's fix cures the symptom and masks rather than removes**, converting a 312px
  see-through band into a 312px dead-black band beside fully painted cells. Under the
  standing mandate's inspection test that is still a player-visible defect.

The sound fix is at `GameGrid.svelte:499` and `:74`: reduce `DROP_H` to at most 208, the
strip's actual bottom buffer, or widen `STRIP` so it still covers all 412px at `startY`,
with the opaque `.symbol-col` fill as a backstop. **Noted for whoever takes it: at 0.88
alpha (`:1259`) even a fully painted board passes 12 per cent of the scene through every
cell, so an opaque fill changes the look.** That is a design call and was not the panel's
to make.

### The three reopens are all MY marshalling errors, not bad findings

This is the safeguard earning its place, and the honest reading is that it caught the
marshal rather than the squads. Fable's RULING 2 attached two representative instances from
DIFFERENT squads precisely so a cluster could be tested for whether it is one defect. All
three failures are in the clustering done at JOB 2 by grep in the main loop:

- **C-03: the cluster title is a CONJUNCTION of two defects.** `STL-AR-A-01` is a content
  and i18n defect on a strip that is fully legible, from which the verifier read `M3`
  directly. `STT-POPOUTS-3-04` is a legibility defect whose content half cannot be read at
  any resolution, and whose own shard concedes the strip does not resolve into words even
  at 2844x1600. Grep matched them on shared words. They are not the same defect.
- **C-10: two squads read ONE image.** Both entries cite the same frame
  `272_mobile-m_transition_bigwin_countup_early.png` and the same two figures. **That is
  one observation reported twice, not a defect seen twice**, so the corroboration weight of
  2 was inflated.
- **C-11: the cluster counted a RETRACTION as a corroboration.** `STC-MOBILES-3` does not
  report this defect. What it contains, in its signed absences, is an item headed
  `WITHDRAWN DRAFT CLAIM: there is no visible HUD ghost under the max win scrim`. **That is
  one squad reporting and one squad DENYING, and the 2 in that row was false.**

**The generalisable lesson, and it is going into the method:** grep-level clustering in the
main loop is cheap and it is the right first pass, but **it cannot tell a report from a
retraction, and it cannot tell one image read twice from a defect seen twice.** Corroboration
counts produced that way are provisional until a panel has tested them. Nothing here needed
an expensive marshal; it needed the safeguard that was already ruled.

### Severity corrections returned by the panels

Verifiers were free to correct severity and did: C-09 down to HIGH and MEDIUM, C-11 to
HIGH, C-03, C-04, C-05 and C-10 split between seats. The corrected values are carried in
the run record and are applied when each cluster's disposition is written.

## VERIFICATION, batch B, and the combined result

30 verifiers over the fifteen remaining clusters, zero lost, 2,823,164 tokens.

| | Batch A | Batch B | **Combined** |
|---|---|---|---|
| CONFIRMED | 1 | 4 | **5** |
| PARTIAL | 9 | 7 | **16** |
| REFUTED | 0 | 1 | **1** |
| SPLIT | 1 | 3 | **4** |
| REOPENED | 3 | 4 | **7** |
| Verifiers | 22 | 30 | **52** |
| Tokens | 2.09M | 2.82M | **4.92M** |

**One cluster was refuted outright.** C-20, the claim that the balance readout never moves
across five settled spins with the session panel contradicting it, did not survive either
seat. It is CLOSED as not a defect. That is the verification layer doing the job it exists
for: a STREAM-severity claim about the money display, removed before anyone acted on it.

### SIX of twenty six clusters carried a marshalling fault, and the panels found every one

All six are errors in the JOB 2 clustering done by this session at grep level. None is a
bad finding by a squad. Fable's RULING 2 safeguards were attached to catch exactly this and
they caught it at a rate of **23 per cent of clusters**:

| Cluster | The marshalling fault |
|---|---|
| C-03 | **Two different defects fused** by a compound title that grep matched on shared words: a content and i18n defect on a legible strip, and a legibility defect whose content cannot be read at any resolution |
| C-10 | **Two squads reading ONE image** counted as two instances. Same frame, same figures, same instant. One observation reported twice, not a defect seen twice |
| C-11 | **A signed RETRACTION counted as a corroboration.** The second squad's shard carries an item headed `WITHDRAWN DRAFT CLAIM`. One squad reporting and one squad denying, and the `2` in that row was false |
| C-12 | **Corroboration HIDDEN by the tier filter.** The map recorded 1 instance; a second exists on the Arabic session reporting the identical defect with the identical cause. It was filtered out before clustering because its squad tiered it HIGH while the German squad tiered it STREAM, and this file clusters the STREAM tier only |
| C-23 | The same tier-filter fault: a different squad reported it and the map said one |
| C-26 | **Two unrelated defects filed in one row**, failing this file's own stated premise of grouping by defect identity |

**C-12 and C-23 are the important pair, because they are a METHOD fault rather than a
slip.** Clustering one severity tier at a time systematically hides corroboration for any
defect that two squads tiered differently, and squads tier independently by design. The
fix is to cluster across ALL tiers first and filter by severity afterwards. That is cheap
and it is going into the method.

### The other thing the panels caught: a fix that does not compile

C-12's proposed fix was to add `responsiblePlayBody` to the key union now and park the
sixteen-locale translation. **It cannot be staged that way.** `prose.ts:72` defines
`ProseStrings` as a total `Record<ProseKey, string>`, so the moment the key enters the
union at `prose.ts:46-49`, all fifteen locale objects in `prose.locales.ts` and the `en`
base fail typecheck until every one carries a value. The key and the copy must land
together, or the key must be optional and silently render nothing. Discovering that
mid-edit is how a parked half-fix gets forced through with placeholder strings.

## FINAL DISPOSITION of the STREAM tier

| Disposition | Clusters | Which |
|---|---|---|
| **CLOSED, not a defect** | 1 | C-20 |
| **OWNER-PARKED, verified, diagnosis corrected by panel** | 18 | C-01, C-02, C-04 to C-09, C-13, C-15 to C-19, C-21, C-22, C-24 |
| **REOPENED by the ruled safeguard, handed to Session 2** | 7 | C-03, C-10, C-11, C-14, C-23, C-25, C-26 |

**No fix was applied by this session, and that is the correct outcome rather than a budget
concession.** Sixteen of twenty six clusters returned PARTIAL, meaning a real symptom
attached to a cause that does not survive reading the source. Applying the shards' proposed
fixes would have shipped at least one no-op (C-01 instance B), one fix that converts a
see-through band into a dead-black one (C-01 instance A), and one that does not compile
(C-12). **The most valuable thing this pass did was stop those from being applied.**

**UPDATE, 2026-07-29, after the close was first written.** Headroom remained, so two of
the three first-hand findings were APPLIED and re-proven from freshly captured frames:
**MID-02 (the glyph) and TR-104's remaining half (the locale unit), both at
`WinBanner.svelte`, both FIXED at `f7a853e`**, proof at
`reports/screens/winbanner-fix-2026-07-29/`. Tracker row TR-117 is FIXED.

**MID-01 (the shared count-up clock, RULED by Fable) remains parked** and is Session 2's.
It is a real refactor across two components plus a frame-level equality assertion and its
convention (p) seeded self-test, not a one-line change, and starting it inside the closing
window would have risked exactly the half-applied fix this session has argued against
twice.

The rest of the section above stands: sixteen clusters returned PARTIAL and none of their
proposed fixes were applied.
