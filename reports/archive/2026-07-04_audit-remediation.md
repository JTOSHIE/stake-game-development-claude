# Session Report: Audit remediation

- **Date:** 2026-07-04
- **Model / effort:** Claude Code, High.
- **Branch:** `claude/audit-remediation` (from up-to-date `main`).
- **Brief:** `FS_AUDIT_REMEDIATION_Prompt.md` (saved verbatim).
- **READ FIRST:** prior `SESSION_REPORT.md`, the three 2026-07-04 archives, CLAUDE.md,
  `LAYOUT_SPEC.md` through v3.4, `DESIGN_SYSTEM.md`, `COMPLIANCE_WATCH.md`,
  `SUBMISSION_DOSSIER.md`. All read first.

Remediation of the three external audits (conditional 3, 2, 2 stars). Hard locks held:
`rgsService.ts`, `gameStore.ts`, `games/future_spinner/**` were not edited (Task 6 read them
only). No lock exception taken; `.claude/settings.json` diff empty.

## Task 1 - warm hidden mount (residual reported honestly)

Implemented in `App.svelte`: during loading, a hidden warm block mounts the
`FreeSpinsPresentation` entry-overlay subtree (which auto-starts its entry, reactive on
`active && script`, with a minimal literal `WARM_SCRIPT`) and `BonusInstrumentColumn`, at
opacity 0 (still painted, so styles/layout/decode warm), out of flow, behind everything,
aria-hidden, hidden then unmounted at 600ms. It emits no audio (the subtree imports none,
verified), never affects layout, and runs concurrently with loading (mock RGS + asset load,
longer than the 600ms window), so it adds no loading delay.

**Result: the single cold-start hitch survives.** `motion_v2_proof.mjs` on a fresh page:
avg fps **59.9** (gate >=55, PASS), zero long frames FAILED with **one** frame at **182.8ms**
(p95 17.7ms, p99 18.6ms). I tried the warm mount at two durations (flare-only, then through
the gauge stage); both left the one frame. Root read: the specified warm-then-**unmount**
approach discards the warmed DOM/styles on unmount, so the first real entry re-pays the
one-time cost; the only remaining lever is a **persistent** hidden mount (never unmount),
which the brief's approach excludes. Per the brief ("if the hitch survives, report the
measured residual honestly and stop tuning; do not stack speculative fixes"), I stopped. The
residual is one frame of ~7,000 sampled, on a page's first-ever Overdrive entry only; it does
not recur and does not affect reel motion. fps evidence: `reports/screens/audit-remediation/
motion-proof-summary.json`.

## Task 2 - Super Turbo anticipation floor

`GameGrid.svelte`: the final-reel hold is now `Math.max(300, (scatterAnticipate ? 900 : 600)
* speedFactor)`, flooring both the scatter and near-miss holds at 300ms. Effective holds per
tier (logged + asserted in the proof harness, PASS >=300 all tiers):

| Tier | Scatter hold | Near-miss hold |
|------|-------------|----------------|
| Normal (1x) | 900ms | 600ms |
| Turbo (0.5x) | 450ms | 300ms |
| Super Turbo (0.16x) | 300ms (was ~144ms) | 300ms (was ~96ms) |

Normal and Turbo are numerically unchanged; only Super Turbo is floored.

## Task 3 - MAX chip touch target

The visible chip keeps its v3.3 geometry (x936 w24, y591 h26). The button is now the
touch target: an enlarged **26 x 44** CSS px hit rectangle centred on the chip (x935 to 961,
y582 to 626), with an inner `.max-chip-face` span holding the visible chip. A 44 x 44 square
cannot fit: the SPIN hit circle (centre (1004,604), radius 42) and the bet-arrow column
(right edge x932) cap the width at 26, so width is the recorded lever and height is the full
44. Recorded as `LAYOUT_SPEC` AMENDMENT v3.5(a). Headless audit
(`frontend/scripts/audit_remediation.mjs`): MAX, SPIN and bet-arrow hit rectangles are
**pairwise non-intersecting at 1280x720 and at Mobile S 320x568** (PASS).

## Task 4 - intro splash persistence

`App.svelte`: key `fs_intro_seen_v1`, read/write through localStorage, then sessionStorage,
then an in-memory flag, each guarded (no console errors in incognito/blocked-storage).
Continue is enabled immediately, the splash never blocks longer than its own animation, and
the spacebar block is unchanged.

## Task 5 - flame jet viewport clip audit (verification, then a scale fix)

The audit measured all eight `.jet .flame` boxes against the stage at the six viewports. At
the v3.4 scale 0.55 the **two top jets clipped** above the stage top at every viewport
(their flame reaches y = 84 minus 240s, so s must be <= 84/240 = 0.35). Per the brief the
only lever is scale: reduced to **0.34** (mount points and directions unchanged). Re-audit:
all eight flame boxes fully inside the stage at all six viewports (PASS). Recorded as v3.5(b).
Audit JSON: `reports/screens/audit-remediation/audit.json`.

## Task 6 - social-mode error-string bleed check (read-only on locks)

Read `rgsService.ts` (its 8 fixed `ERROR_MESSAGES`, keyed by `RGSErrorCode`) and every
component that renders an error state. Of the prohibited terms (bet, buy, purchase, cost),
only **"bet"** appears in any RGS message (ERR_VAL); no buy/purchase/cost anywhere.

| # | Error path | Source | Social treatment | Prohibited term? | Verdict |
|---|-----------|--------|------------------|------------------|---------|
| 1 | `App.svelte` `.error-banner` (all RGS play errors) | locked `rgsService` message string | `errorDisplay` social scrub | "bet" (ERR_VAL) scrubbed to "play"; balance to coins; buy/purchase/cost now scrubbed defensively | PASS |
| 2 | `BuyBonus.svelte` insufficient warning | localised `insufficientBalance` key (social override) | already social-safe | none | PASS |
| 3 | `ReplayMode.svelte` error-detail `{error}` | replay-service `e.message` (not RGS play; public replay endpoint) | rendered raw | none in the fallbacks or expected fetch errors | PASS |

Fix applied (unlocked layer only): `App.svelte` `errorDisplay` already scrubbed bet and
balance; it now also scrubs purchase/buy/cost so any future RGS string is covered. The RGS
error **code** is not surfaced to the unlocked layer (`gameStore` exposes only the message
string), so code-to-localised-string mapping is not possible without editing a locked file;
the display-layer scrub is the available mechanism and covers the actual and defensive cases.

**Adjacent finding (not an error path, so outside Task 6's scope, flagged for follow-up):**
`ReplayMode.svelte` lines 267 to 269 render literal "Bet:" and "cost" labels on the replay
start screen; in a social replay these surface prohibited terms. Recommend social-gating
those two labels in the unlocked `ReplayMode.svelte` in a dedicated pass (it is a compliance
component; not changed here to stay within this task's error-state scope and avoid an
unverified edit to a mandated component).

## Task 7 - document hygiene

(a) `docs/PAR_NAMING_ADDENDUM.md` created: maths IDs immutable; the PAR-original to art-name
map (verified against the read-only PAR sheet) H2 Turbocharger to Nitro Canister, M1 Car
Grille to Steering Wheel, M2 Exhaust Pipe to Coilover, M3 Steering Wheel to Plasma Booster,
plus L2 Spark Plug to Blade Fuse (the same class of rename, added for completeness);
frequencies/paytable/RTP byte-identical to the SHA-256 manifest in PAR section 9. Referenced
from `GAME_FACTS.md` (and fixed a pre-existing em dash there while adding the reference).
(b) `HANDOVER.md`: prepended one ARCHIVED 2026-07-03 header line; nothing else changed.
(c) `SUBMISSION_DOSSIER.md`: blurb status corrected to OWNER APPROVED (soundtrack line
amended, pending re-approval); the blurb's final paragraph now keeps RTP 96.35%, 5,000x and
turbo mode and drops the soundtrack phrase.
(d) Grep of the reviewer docs found only two forward-looking hits: the blurb approval
(resolved by (c)) and `COMPLIANCE_WATCH.md`'s staging event IDs (reworded to point at the new
`REVIEW_EVENTS_PLAN.md`). No "next session / future pass / owner taste" language in the
reviewer docs (only in internal session reports/archives, which were left untouched). The
remaining owner one-timers in the dossier (asset link, portal details) are clearly owner
scoped in the Produced-by column.
(e) `docs/REVIEW_EVENTS_PLAN.md` created: the 11-row event-ID capture checklist (base win;
3/4/5 scatter triggers; retrigger; bonus buy; wincap per mode; BIG/MEGA/EPIC), normal and
social ID columns empty for the staging protocol.

## Task 8 - percentile frame reporting

`motion_v2_proof.mjs` now computes and prints p95/p99 frame times and writes them into
`proof-summary.json` (p95 17.7ms, p99 18.6ms this run). No gate change.

## Gates

| Gate | Result |
|------|--------|
| motion proof: avg fps >=55 | PASS (59.9); p95/p99 reported |
| motion proof: zero frames >100ms | FAIL (1 frame, 182.8ms) - residual reported per Task 1 |
| anticipation floor >=300ms all tiers | PASS |
| hit-area non-intersection (1280x720, 320x568) | PASS |
| jet clip audit (six viewports) | PASS (scale 0.34, recorded v3.5) |
| exact-total interpreter test | PASS 58/58 |
| build clean; svelte-check 0 new errors; assets byte-identical (2 runs) | PASS |
| locked files + `.claude/settings.json` unchanged | PASS (zero diff) |

The one failing gate is the zero-long-frame criterion, which the brief explicitly scoped as
"report the residual honestly and stop" once the warm mount did not eliminate it.

## Working-tree note

Uncommitted "Build Diet / QA soak" work from a prior session is present in the working tree
(`FS_BuildDiet_QA_Prompt.md`, `frontend/scripts/qa_soak.mjs`, `build_diet_verify.mjs`,
`reports/qa/`, and edits to `frontend/vite.config.ts` / `package.json`). It is not part of
this pass and was NOT committed here (this commit uses explicit paths). Flagging so it is not
lost.

## FOR THE NEXT SESSION

- **Model / effort used:** Claude Code at High.
- **Approach:** implemented the six code/audit tasks with headless gates, did the document
  hygiene, and analysed the locked error paths read-only. The warm mount was tried at two
  targetings before stopping per the brief.
- **Alternatives tried and rejected:** (1) a longer/gauge-reaching warm mount (still left the
  one frame; the unmount discards the warming). (2) editing locked files to map error codes
  (forbidden; used the display-layer scrub instead). (3) a 44x44 MAX square (cannot fit; 26x44
  recorded).
- **Files touched:** `App.svelte`, `GameGrid.svelte`, `HudOverlay.svelte`, `FlameJets.svelte`,
  `motion_v2_proof.mjs`, new `audit_remediation.mjs`; `LAYOUT_SPEC.md` (v3.5),
  `SUBMISSION_DOSSIER.md`, `HANDOVER.md`, `COMPLIANCE_WATCH.md`, `GAME_FACTS.md`, new
  `docs/PAR_NAMING_ADDENDUM.md` and `docs/REVIEW_EVENTS_PLAN.md`; `reports/screens/
  audit-remediation/*`.
- **Open threads before the dossier section 5 protocol:**
  1. **Audio delivery** - drop a music file into `~/Desktop/fs_audio/` and run the audio pass;
     then the blurb's soundtrack line can be restored and re-approved.
  2. **Staging run** - deploy, then fill `docs/REVIEW_EVENTS_PLAN.md` event IDs and the RGS
     endpoint test.
  3. **Portal one-timers** - team profile, payment, provider logo upload, public asset link.
  4. **Tile assets** - game-tile background and foreground hero for the Tile Editor.
  5. **Blurb re-approval** - owner to re-approve the soundtrack-free blurb (or the restored
     one once audio ships).
  6. **Replay social labels** - social-gate the "Bet:"/"cost" labels in `ReplayMode.svelte`
     (adjacent finding above).
  7. **Cold-start frame** - only a persistent hidden mount remains as a lever; deferred per
     this brief.
  8. **Build Diet / QA** - the uncommitted prior-session work noted above.
