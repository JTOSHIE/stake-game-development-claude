# Fresh-eyes deep review, 2026-07-26

First major deliverable of the model handover, per section 3 of
`reports/archive/handovers/FS_Fable_ModelHandover_2026-07-25.md`. **Findings only. Nothing was changed in this
pass.**

Scope: the full `frontend/src` tree (61 files, 15,026 lines) and `frontend/scripts`
(35 harnesses), plus the 78 session-report archives (12,017 lines) for section (c).

Reviewed at `main` = `fe27bbe`. PR #89 is open and not merged; where a finding
touches code that PR changes, it is marked **[#89]** and the pending state is
accounted for inline, since I authored it.

Classification: **KEEP** (fine as is), **CLEAN** (safe removal), **RETHINK** (a
better approach exists, named, with its risk stated).

Applying section 1's bar throughout: the threshold for touching working code this
late is material risk reduction or reviewer-visible quality, never elegance. Several
findings below are real but explicitly **not worth acting on before submission**, and
I say so rather than padding the cleanup list.

---

## Headline

The codebase is in materially better shape than three weeks of rapid iteration would
predict. **Zero TODO, FIXME, HACK, XXX, WORKAROUND, `@ts-ignore` or `eslint-disable`
markers across all 15,026 lines.** That is not normal and it deserves saying first.

The real debt is not messy code. It is **duplicated concepts**: the same idea
implemented twice in two places, kept in agreement by a comment or an assert rather
than by construction. That is the single pattern behind the currency defect found in
PR #89, the Round 3 feature-grid sizing bug, and the twenty-two drifted `dismissIntro`
copies. It is still present in three live places.

Total: **14 findings.** 5 KEEP, 6 CLEAN, 3 RETHINK. None is a bug in shipping
behaviour. One RETHINK is worth doing before submission; the other two are not.

---

## (a) Codebase hygiene sweep

### A1. Debt markers: zero. **KEEP**

`grep` across `src/` and `scripts/` for TODO, FIXME, HACK, XXX, WORKAROUND,
`@ts-ignore`, `@ts-expect-error`, `eslint-disable`: **0 hits**. No suppressed type
errors, no parked workarounds. Nothing to do.

### A2. `Counter.svelte`, Vite scaffold leftover. **CLEAN**

`src/lib/Counter.svelte`, 10 lines, is the stock Vite/Svelte demo counter. Zero
inbound imports. Pure scaffold residue from project creation.

Risk of removal: nil. It is not referenced, not built into any chunk that ships, and
deleting it cannot affect behaviour.

### A3. Two orphaned components superseded by the HUD rebuilds. **CLEAN**

| File | Lines | Superseded by |
|---|---|---|
| `src/lib/components/BalanceDisplay.svelte` | 87 | `HudOverlay.svelte`'s balance plate |
| `src/lib/components/OverdriveMeter.svelte` | 47 | `BonusInstrumentColumn.svelte` |

Both have **zero inbound imports** anywhere in `src/`. Verified individually, not by
heuristic: the only surviving mentions are two comments (below) and the unrelated
`rulesOverdriveMeter` i18n key, which is a translation string about the game mechanic
rather than the component.

`BonusInstrumentColumn.svelte:44` already calls the latter "the legacy
OverdriveMeter", so the supersession was known and the file was simply never deleted.

Risk of removal: low, but not nil. Confirm no Playwright script selects a class name
that only these files define before deleting. I checked the obvious ones and found
nothing, but the scripts tree is large enough that a targeted grep at execution time
is cheap insurance.

### A4. Stale comments and one stale compliance doc naming components that no longer exist. **CLEAN**

`ControlBar` and `AutoPlayModal` do not exist as files. They are still named in three
places:

| Location | Text | Assessment |
|---|---|---|
| `CLAUDE.md`, Compliance section | "In replay mode BalanceDisplay, ControlBar, AutoPlayModal and ThemeSelector are not rendered" | **The one that matters.** A compliance requirement written against three component names, two of which no longer exist and one of which is dead (A3). The underlying behaviour is still correct, but the requirement can no longer be checked against the code as written. |
| `App.svelte:1238` | comment "matching BalanceDisplay/ControlBar/ThemeSelector" | Harmless, but describes removed structure. |
| `HudOverlay.svelte:91` | "ported from the retired ControlBar unchanged" | **KEEP.** This one is correct and useful: it is deliberately historical and says "retired". |

Recommendation: reword the `CLAUDE.md` line to describe the behaviour (no balance,
bet controls, autoplay or theme selector rendered in replay mode) rather than naming
components. This is a compliance document, so it is **REVIEW lane**.

### A5. `replayStore.ts` is entirely write-only. **CLEAN, but low priority**

All four exports (`replayParams`, `replayResponse`, `replayPhase`, `replayError`)
are written and **never read** by any production code.

`ReplayMode.svelte` keeps **parallel state**: a local variable and the store, set in
lockstep at roughly ten sites:

```
phase = 'ready'
replayPhase.set('ready')
```

The component renders from the locals. The stores are pure ceremony.

This is the same shape as the `standingMode` dead-end (section c): state that looks
wired and is not. It is currently harmless precisely because nothing reads it, but a
future reader could reasonably assume the stores are authoritative and drive
behaviour from them.

Two options:
- **CLEAN:** delete `replayStore.ts` and its paired writes.
- **RETHINK:** have `ReplayMode` render from the stores, which is idiomatic Svelte and
  would incidentally give the conformance harness observable replay state.

**My recommendation is to do neither before submission.** Bet Replay is a mandatory
compliance feature; touching it late is risk without reviewer-visible benefit, and
under section 1's bar this is elegance. Post-launch maintenance. Recorded so it is
not rediscovered cold.

### A6. Four dead stores inside locked `gameStore.ts`. **CLEAN, blocked by lock**

`betIndex` (derived), `buyBonusActive` (writable), `canSetMaxBet` (derived) and
`sessionStats` (writable) have **no read anywhere in production code**, including via
`derived()` and `.subscribe()`.

`gameStore.ts` is hard-locked, so this cannot be actioned without a sanctioned pass.
Recommendation: record in `CLAUDE.md`'s `LOCKED_FILE_DEBTS` alongside the existing
`canBuyBonus` entry, so it rides along with the next sanctioned locked pass rather
than justifying one. These are dead weight, not defects: no behaviour depends on them
and none is reachable by a player.

### A7. `themePalette` dead derived store. **CLEAN**

`src/lib/stores/themeStore.ts` exports a `themePalette` derived store with no reader.
The theme selector is dev-only and force-defaulted in production, so this is on a
surface that never ships. Trivial removal, no risk, no urgency.

### A8. `c1preview.html` does not ship. **KEEP, verified**

`src/c1preview.ts` shows as an orphan to import analysis, but it is the entry point
for `c1preview.html`, a dev preview page. `vite.config.ts` declares no
`rollupOptions.input`, so Vite builds only `index.html`, and `dist/` contains exactly
one HTML file. **Confirmed it does not reach the shipped bundle.** No action. Recorded
because it looks like a finding and is not, and the next reviewer should not have to
re-derive that.

---

## (b) Approach audit

### B1. HUD spec: machine-enforced coordinates. **KEEP. Best thing in the codebase.**

`docs/HUD_SPEC.md` paired with `hud_banner_spec_check.mjs` (about 50 assertions, 0px
deviation) is the approach I would choose today, and it is better than what most
projects at this stage have. A locked coordinate table with a machine check against it
converts "the HUD looks right" from an opinion into a gate.

It also solved a genuinely non-obvious problem, recorded in the Round 3 report: the
outer wrappers (`.menu-wrapper`, `.autoplay-wrapper`) are the real positioning
authority and force `position: static` on their children, which cost real debugging
time. The spec captures the resolved truth rather than the intent, which is the right
call.

No change recommended.

### B2. Conformance suites: shared helper plus independent oracles. **KEEP, with one gap**

Two design choices here are correct and worth stating because they are easy to get
wrong:

1. `dismissOverlays.mjs` centralises overlay handling after twenty-two copies drifted.
2. `qa_soak.mjs`'s `MODE_COST_CHECK` table **hardcodes** the five costs rather than
   importing `MODE_COST` from `fsModes.ts`. That looks like duplication and is
   actually the correct verification design: the check is an **independent oracle**.
   If it imported the value it is checking, it would pass no matter what that value
   became. This is precisely the lesson from the self-verifying recentre bug (c6), and
   whoever wrote it got it right.

The gap: **six** scripts still carry their own overlay handling, not five. The known
five (`layout_v1_audit`, `motion_v2_proof`, `reel_v3_proof`, `scene_proof`,
`ux_v1_audit`) use `dismissIntroIfPresent`. `animation_uplift_proof.mjs` is a sixth,
missed by previous sweeps because it does not use that function name: it drives the
browser heavily (53 `page.` calls) with its own inline `hero-splash` and
`intro-continue` handling.

None is in the mandatory gate, so this is not urgent. See RETHINK R2.

### B3. Feature presentation flow: a second grid kept in sync by hand. **RETHINK, but not now**

`FreeSpinsPresentation.svelte` renders the feature grid as **its own DOM
representation**, entirely separate from `GameGrid.svelte`'s PIXI canvas. The
geometry exists twice, in two languages:

| Source | Declaration |
|---|---|
| `GameGrid.svelte:59-61` | `const CELL_W = 120`, `CELL_H = 100`, `GAP = 4` |
| `FreeSpinsPresentation.svelte:523-527` | `gap: 4px`, `width: 120px; height: 100px` |

Kept in agreement by a comment (line 519 references GameGrid's constants) and by
`hud_reel_size_check.mjs`, which measures both and asserts a 2px tolerance.

**This already failed once.** Round 3 item 8 found the feature grid rendering at
roughly 65% and 77% of true size, because the DOM copy used 72x72 cells with 10px
gaps against GameGrid's 120x100 with 4px.

The approach I would choose today is one grid renderer driven by shared geometry
constants, so the two cannot disagree by construction. The approach shipped is two
renderers plus an assert.

**Recommendation: do not change it before submission.** Unifying the renderers is a
large change to the most visually complex flow in the game, four days from an external
audit, to fix a class already covered by a passing sub-pixel assert. The assert is
doing its job. This belongs in post-launch maintenance, and the risk of the rewrite
now clearly exceeds the risk it removes.

Worth noting for the record: the assert is the **only** thing holding these together.
If `hud_reel_size_check.mjs` is ever weakened or skipped, the class reopens silently.

### B4. Sound service: plain `HTMLAudioElement`. **KEEP**

`soundService.ts` uses `HTMLAudioElement` with a clone pool, persisted mute, and
ducking constants for spin and anticipation. No Web Audio graph.

For a static bundle with no external origins, this is the right low-risk choice.
A Web Audio graph would give genuinely gapless loops and sample-accurate ducking, and
the open loop-seam item is exactly the thing it would fix properly, but that is a
rewrite of a working, mixed, owner-auditioned system. Post-launch, and only if the
seam issue proves real rather than the headless-codec artefact it currently looks
like.

### B5. Mock layer: correct shape, one consequence worth knowing. **KEEP**

`rgsService.ts` falls back to mock when session params are absent, distinguishing a
param error from a real auth failure rather than swallowing both. That is the right
design.

The consequence, which I relied on deliberately in PR #89: in dev the mock path never
sets `currencyCode`, which is what makes the new `?mockCurrency=` hook stable. That is
a behavioural dependency worth writing down, since a future change making the mock
return a currency would silently break the currency conformance harness. Recorded
here rather than left as tribal knowledge.

---

## (c) Error archaeology

Read across the 78 archives. Six named incidents, four pattern classes, and an honest
answer on what should have caught each.

### c1. Buy-tier billing bug (2026-07-07). Should have been caught by an end-to-end cost assert. Nothing existed.

Clicking NITRO OVERDRIVE charged 100x and served a `bonus` round instead of 400x and
`super`. `FeatureMenu` correctly dispatched the clicked mode; `App.svelte`'s handler
**discarded it** (`on:buy={() => buyBonusRef?.openConfirm()}`); `BuyBonus` and
`handleBuy` were both hardcoded to `bet * 100`.

Why it was not caught: every component was individually correct. The defect lived in
the seam between them, and nothing tested the seam. It was found by a human-driven
wiring integrity audit, not by any gate.

**Now covered, well.** Three independent layers:
- `qa_soak.mjs` `runCostIntegrityCheck`: drives the FEATURES menu as a real player per
  mode and asserts both the recorded server mode and the exact integer-micros debit,
  against an independent hardcoded oracle.
- `fsModes.drift.test.ts`: cross-checks `fsModes.ts` costs against the shipped
  `publish_files/index.json`, the two sides being independently generated.
- `scan_wallet_floats.mjs`: enforces the integer-micros rule.

### c2. `standingMode` dead-end (2026-07-07). Same class. Statically detectable.

Selecting Cruise or toggling OVERBOOST had **zero effect on the spin request**:
`handleSpin` hardcoded `mode: 'base'`. A store written by the UI and read by nothing.

Also found by the wiring audit, not a gate. Now covered by the same cost-integrity
check, which exercises the standing modes as well as the buys.

**But the general class is cheaply detectable statically**, and that guard does not
exist. See R1 and the demonstration below.

### c3. Anticipation `:global()` CSS stripping. Build-output class.

Svelte's scoped-CSS compiler stripped selectors that were only ever applied to
dynamically created elements, so the styling silently vanished from the build while
the source looked correct.

Class: **source-correct, build-wrong.** Reading the source can never catch it; only
inspecting built output or rendered result can. Partially covered today by
`build_diet_verify.mjs` (request-level checks on `dist/`) and by the reduced-motion
CSS presence assert. Not systematically covered for arbitrary styles, and I do not
propose fixing that: the general version is expensive and the specific recurrence risk
is low now that the pattern is known.

### c4. Spoiler bug (Owner Audit Round 2). Timing class.

A just-finished feature's settlement landed for a single frame and let the App-level
WinBanner reveal the outcome early. Now guarded by an explicit suppression flag and
`spoiler_bug_check.mjs`.

Class: **single-frame timing**, only observable in motion. Covered by a dedicated
assert. No further guard proposed.

### c5. The stale-selector fleet (Round 3). Duplicated templates drifting.

Twenty-two scripts had independently copy-pasted `dismissIntro`/`waitSpinDone`, and
six broke when new overlays appeared. Fixed by extraction into
`dismissOverlays.mjs`.

**Mostly covered by construction now**, but six scripts remain outside the shared
module (B2), so the class is not fully closed.

### c6. The self-verifying recentre (brand pass). The most instructive failure.

A recentre transform was verified by a check that shared code with the transform
itself, so the check confirmed the bug. Fixed by independent verification at multiple
thresholds.

Class: **self-verification sharing code with the subject.** This is the one Fable
already elevated into protocol 6, and it is now the explicit reason
`qa_soak.mjs`'s cost table is hardcoded rather than imported (B2). Covered by
discipline rather than by a gate, which is appropriate: it is a design rule, not a
testable property.

### Pattern classes, and where our armour actually stands

| Class | Example | Covered? |
|---|---|---|
| Self-verification sharing code with the subject | c6 recentre | **Yes**, by protocol 6 and by design in `qa_soak` |
| Silent UI-to-wallet gaps | c1 billing, c2 standingMode | **Yes** for cost and mode, three layers. **No** static guard for the general dead-store shape |
| Duplicated templates drifting | c5 selectors, B3 grid, A5 stores, R1 scale | **Partially.** Asserts cover the two known instances; nothing prevents new ones |
| Overlay changes breaking test click-paths | c5 | **Mostly.** Six scripts still outside the shared helper |
| Source-correct, build-wrong | c3 CSS stripping | **Partially**, request-level only |

---

## RETHINK findings

### R1. `CURRENCY_SCALE` is defined three times, one copy inside a locked file. **RETHINK. Worth doing.**

| File | Form |
|---|---|
| `src/lib/utils/currency.ts:18` | `export const CURRENCY_SCALE = 1_000_000` |
| `src/lib/services/rgsService.ts:29` | `export const CURRENCY_SCALE = 1_000_000` (**LOCKED**) |
| `src/lib/services/replayService.ts:32` | `const CURRENCY_SCALE = 1_000_000` (module-local) |

All three currently agree, so there is no bug today. But this is the money path, and
it is the exact shape that produced the PR #89 currency defect: two implementations of
one concept, agreeing by luck rather than by construction. `CLAUDE.md` makes the
integer-micros rule mandatory with zero float tolerance; having its scale constant
exist in triplicate undercuts that.

**Named approach:** `utils/currency.ts` becomes canonical. `replayService.ts` imports
it instead of declaring its own (a one-line change; PR #89 already added an import
from that module to this file, so the edge exists **[#89]**). `rgsService.ts` cannot
be touched, so its copy stays and is instead **recorded in `LOCKED_FILE_DEBTS`** with
a note that `utils/currency.ts` is canonical.

**Risk:** very low. One import swap of an identical literal, in a non-locked file,
covered by the existing float scan and the new currency harness.

**Recommendation: do it in the consolidated cleanup pass.** It is small, it is in the
money path, and it removes a drift edge rather than tidying one.

### R2. Six scripts carry private overlay handling. **RETHINK. Cheap, do it opportunistically.**

Five use `dismissIntroIfPresent`; `animation_uplift_proof.mjs` is a sixth with inline
handling under a different name, which is why previous sweeps counted five.

**Named approach:** point all six at `dismissOverlays.mjs`, exactly as the Round 3
sweep did for the other twenty-two.

**Risk:** low but not zero. These are older one-off audit scripts, currently not in the
mandatory gate and with no evidence of breakage. Repointing them means re-running each
to confirm, which costs time for scripts nobody currently runs.

**Recommendation: only if the consolidated cleanup pass has room.** The honest
priority is low. What matters more is the count being **six, not five**, so the next
person does not think the sweep is closer to complete than it is.

### R3. Feature grid geometry declared twice. **RETHINK. Explicitly do NOT do before submission.**

Covered in full at B3. Named approach: one renderer driven by shared constants.
Risk: high, in the most visually complex flow, immediately before an external audit,
against a class already covered by a passing sub-pixel assert. **Post-launch.**

---

## (d) New-capability self-assessment

Stated against evidence from the two sessions I have run on this project, not in the
abstract. Where I have no evidence, I say so.

**Demonstrated.** Long coherent passes holding cross-part state: in the platform-delta
session a `ts-client` finding in Part 4 fed back into Part 3's report and the master
document instead of being lost. Chasing the class rather than the reported symptom:
the `XSC` currency fix was incomplete until reading `parseReplayParams` revealed the
short `SC` form was also live, which is the difference between fixing a bug and fixing
its class. Root-causing rather than reporting divergence: the cruise ETL figure was
resolved to the two specific simulations sitting on the threshold.

**Not demonstrated, and therefore not claimed.** Better visual reasoning over
committed screenshots. I have not done it on this project and will not assert it until
I have.

Three proposals, compliance and quality focused:

**D1. A dead-wiring static guard, and it already works.** The `standingMode` class
(state written by the UI, read by nothing) is statically detectable. I wrote and ran
the detector during this review: it scans exported stores for reads via `$store`,
`get()`, `derived()` and `.subscribe()` across all production files. On today's tree
it finds **9 of 53 stores with no production read** (A5, A6, A7), and it correctly
excludes `jurisdictionFlags`, which a naive version flags but which is genuinely read
via `derived()` at `responsibleGambling.ts:31`. Run against the 2026-07-07 tree it
would have flagged `standingMode` before the wiring audit found it by hand.
Proposal: harden it into `frontend/scripts/dead_wiring_scan.mjs` with an allowlist for
deliberate exports, and add it to the conformance suite. Cheap, permanent, and it
closes the one row in the armour table marked "no static guard".

**D2. Duplicated-concept sweeps as a standing check.** Every serious defect in the
archaeology is one concept implemented twice. Proposal: a periodic sweep for concepts
with more than one definition (scale constants, mode metadata, grid geometry, overlay
handling, currency symbols), reported as findings rather than auto-fixed. This review
found three live instances (R1, R2, B3) in a single pass.

**D3. Adversarial verification design under protocol 6.** For every remaining
compliance artefact, I write the verification so it shares **no code path** with the
implementation, and state explicitly in each report what the two sides independently
rely on. The Part 2 maths report already worked this way (its own parser, its own
arithmetic, costs read from the shipped `index.json` rather than from `fsModes.ts`).
Making it an explicit, stated property of each report rather than an implicit habit is
what turns c6's lesson into something auditable.

---

## Consolidated cleanup pass, proposed contents

For Fable's ruling. Ordered by value, not by size.

| # | Item | Class | Lane | Recommend |
|---|---|---|---|---|
| 1 | R1: single `CURRENCY_SCALE`, record the locked copy as a debt | RETHINK | REVIEW | **Yes** |
| 2 | A4: reword the `CLAUDE.md` replay-mode line to behaviour, not component names | CLEAN | REVIEW | **Yes** |
| 3 | A2, A3, A7: delete `Counter.svelte`, `BalanceDisplay.svelte`, `OverdriveMeter.svelte`, `themePalette` | CLEAN | REVIEW | **Yes**, with a selector grep first |
| 4 | A6: record the four dead `gameStore` stores in `LOCKED_FILE_DEBTS` | CLEAN | REVIEW | **Yes**, doc only, no lock lift |
| 5 | D1: harden the dead-wiring scan into a permanent gate | new guard | REVIEW | **Yes** |
| 6 | R2: repoint the six scripts at `dismissOverlays.mjs` | RETHINK | GREEN | Only if there is room |
| 7 | A5: remove or invert `replayStore.ts` | CLEAN | REVIEW | **No.** Post-launch |
| 8 | R3/B3: unify the feature grid renderers | RETHINK | REVIEW | **No.** Post-launch |

Items 7 and 8 are real findings that I am recommending against acting on. Under
section 1's bar they are elegance, not risk reduction, and both sit in
compliance-bearing or visually complex code immediately before an external audit.
