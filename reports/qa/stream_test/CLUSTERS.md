# Stream test clusters

JOB 2 of `reports/briefs/FS_SESSION1_STREAM_CLOSE_Prompt.md`. The ledger's findings
grouped by DEFECT IDENTITY rather than by squad, so verification can settle a defect once
instead of settling every report of it.

Marshalled in the main loop at grep level, 2026-07-29, over 55 active shards.

Australian English, no em dashes or en dashes.

## Scale

**571 active findings: 60 STREAM, 183 HIGH, 242 MEDIUM, 81 LOW.** Superseded native
shards at `shards/superseded/` are excluded; their content was re-judged by the sight
gate re-run and their surviving claims live in the re-run shards.

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
