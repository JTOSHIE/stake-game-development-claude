# 2026-07-26, track/screenshot-analyst, first session

Track-tagged section per MULTI-TRACK PROTOCOL rule 8. The integrator
concatenates this into `reports/SESSION_REPORT.md` on `main`, never discarding
it.

Branch `track/screenshot-analyst`. Two commits, `e04f3bd` and `1cad07e`.
Delivered by pull request. `main` was not pushed and was not touched.

---

## What ran

Boot order as the brief specified: `CLAUDE.md` in full, then the brief, then
`docs/records/tracks/screenshot-analyst.manifest`, written and committed before
any work started.

### Duty 1, INTAKE

Seventy eight loose image files on `~/Desktop` were hashed with
`git hash-object` and matched against every tracked image blob in the
repository. Forty eight are byte-identical to files already committed under
`reports/screens/dtt-live-2026-07-26/` and were not re-committed. Nine are new
and are now committed under `reports/screens/screenshot-analyst-2026-07-26/`
with content-assigned names following the established `NN_description.png`
pattern.

Reported by exclusion, with reasons, rather than silently dropped:

| excluded | reason |
| --- | --- |
| `photo_2026-07-17_08-15-32.jpg`, `photo_2026-07-17_08-15-40.jpg` | Third-party Stake.com Mines bet-share panels for another person's account. Not our game, carries Stake branding which `CLAUDE.md:325` prohibits in the repository, and carries a third party's handle and bet identifiers. |
| `Screenshot 2026-07-25 at 7.33.45 am.png` | A Claude remote-control chat window. Project-adjacent tooling, not a rendered game surface, and its content is already in the written record. |
| `Screenshot 2026-07-05 at 7.36.45 am.png` | A terminal transcript of a Claude session. Same reason. |
| `Screenshot 2026-05-08 at 12.59.06 am.png` | 4,055 bytes, effectively blank. Junk. |
| `Screenshot 2026-07-15 at 1.05.13 am.png` | A real Future Spinner dev capture at `localhost:5173`, but eleven days old, superseded, and it exposes the owner's personal browser tabs and menu bar. |
| `FS_DesignSystem_ContactSheet.png`, `Transparent We Roll Spinners icon.png`, `we roll Spinner's main logo with text.png`, `we roll spinners circular.png`, `wrs_provider_mark_source.png` | Brand and design assets, not captures. Another pass's territory. |
| `~/Desktop/Desktop/`, roughly 93 screenshots from March and April 2026 | A stale archive predating the capture regime. |
| Remaining loose screenshots dated 2026-05-08, 07-03, 07-04, 07-15 | Not new. **Dispositioned by date and NOT opened.** Stated plainly rather than implying they were inspected. If the owner wants a historical sweep it is a separate job. |

### Duties 2 and 3, CATALOGUE and within-frame arithmetic

`reports/screens/CAPTURE_CATALOGUE_2026-07-26.md`. All nine new captures get a
row carrying filename, capture timestamp, purpose tag, surface, viewport, and
every visible figure extracted verbatim. Sixteen committed frames from
`dtt-live-2026-07-26/` were re-read for duties 4 and 5 rather than trusted from
their filenames, because a filename is not evidence under convention (l.3).

Every frame is internally consistent. The three checks that could have failed
and did not: every MULT equals payout divided by its COST value; every session
panel's `Total wagered` equals spins times bet level; every session panel's
`Net result` equals won minus wagered.

### Duty 4 and Assignment B, BETWEEN-FRAME ARITHMETIC

The core duty, and the thing the brief says has never been done systematically.
Full working at `reports/qa/live_stats/2026-07-26_mode_cost_reconciliation.md`.

| mode | declared | proven by | residual |
| --- | --- | --- | --- |
| `base` 1.0x | `fsModes.ts:63` | session panel, 524 spins, and a second at 44 spins | 0.00 |
| `cruise` 1.0x | `fsModes.ts:72` | **NO CAPTURE EXISTS** | not proven |
| `antelite` 1.25x | `fsModes.ts:85` | frames 03 to 04 | 0.00 |
| `bonus` 100x | `fsModes.ts:97` | frames 41 to 42 | 0.00 |
| `super` 400x | `fsModes.ts:107` | frames 46 to 48 | 0.00 |

The reconciliation had to model something the earlier within-frame work never
needed to: a mid-animation frame's balance. The RGS settles a whole round at
once and the client animates afterwards, so a settled row's credit can be in the
wallet before it is on screen. Frame 04 closes to the cent only when the newest
row's credit is treated as not yet applied, and that model then also explains
frame 42's `WIN $142,184.65` against a settled `+$144,350.00`.

`cruise` is recorded as unproven rather than assumed. All 54 committed capture
sets were searched and none shows a `cruise` row or badge.

### Duty 5, VISUAL LENS

Two viewport families in the new set: desktop landscape at roughly 916 by 700
css px, and a narrow popout at roughly 295 by 490 to 545 css px. No truncation,
no overlap, no empty control, no placeholder string, no locale bleed. EUR
formats consistently across HUD, banner and Bets panel at six-figure balances.

One finding, SA-008: the per-line win strip renders on the reel frame's bottom
border rather than clear of it. It is legible and nothing is cut off, so it is
tagged ANOMALY not DEFECT. **The measurement duty 5 asks for was not taken**:
the overlap was read at display size, not at the capture's native resolution.
Said plainly rather than dressed up as a measurement.

No contrast verdict is offered. This pass read captures, and the project's
contrast claim is made against real composited pixels by
`reports/qa/contrast_2026-07-26.json` per TR-070.

### Duty 6 and Assignment C, STATS INTAKE

Three dated structured records in `reports/qa/live_stats/`: the owner's 50 row
EUR Bets page as JSON, the session panels with their arithmetic, and the Math
page comparison.

Anomaly checks, all clean across the 50 rows: no payout above 5,000x bet
(largest `x321.75`), no debit disagreeing with its mode cost, no settlement gap,
and every stated MULT equals payout over COST to within 0.005, checked
programmatically.

**No RTP verdict is issued and none is inferable from these records.** The
committed statistics note stands: RTP is not verifiable by play.

### The Word document

`Math Distribution & Summary .docx`, the Stake Engine Math and Bets tabs.
Convention (m) is satisfied: it physically exists on the owner's Desktop, which
`.claude/settings.json` lists under `additionalDirectories`, and it was read
directly.

**SPIN information has not changed.** Every platform figure the repository also
asserts agrees: RTP `96.35%` in all five modes, `MAX 5,000x` in all five, base
`HIT 29.11%`, `Std Dev 17.2841`, `Outcomes 100,000`, `Max Win Hit-Rate
100000.0006`, and all five cost multipliers exactly as the brief's duty 4 states
them. New material the document adds (per-mode hit rates, break-even columns,
streak figures, the full bet-level compliance table) is listed in
`reports/qa/live_stats/2026-07-26_math_distribution_summary_ingest.md` for the
integrator to promote into `GAME_FACTS.md` if it wants. This track does not
write that file.

Note per convention (l.4): the document and capture 09 are **not** independent
sources. Both render the same dashboard page for the same session, and the
document's row 1 matches the capture's top row exactly. That is a transcription
check, not corroboration.

### Duty 7, LEDGER

`docs/records/screenshots/FINDINGS_LEDGER.md`, sixteen rows: 1 DEFECT, 6
ANOMALY, 7 NOT-A-DEFECT, 2 PROCESS. `REVIEW_TRACKER.md` was not touched.

---

## Verification results, measured

    node scripts/qa/locked_paths_gate.mjs --self-test
      LOCKED PATHS SELF-TEST: PASS

    node scripts/qa/locked_paths_gate.mjs main HEAD
      LOCKED PATHS: 2 commit(s) in main..HEAD, 0 sanctioned, 0 violation(s)
      TRACK SCOPE: branch track/screenshot-analyst, 8 glob(s), 18 changed file(s), 0 out of scope
      LOCKED PATHS: PASS

    node scripts/qa/locked_paths_gate.mjs --check-disjoint
      DISJOINT: 3 manifest(s), 2512 tracked file(s), 4 file collision(s), 0 shared glob(s)
      DISJOINT: FAIL
        reports/qa/live_stats/2026-07-26_bets_page_eur_base_50_rows.json is claimed by quality-sweep and screenshot-analyst
        reports/qa/live_stats/2026-07-26_math_distribution_summary_ingest.md is claimed by quality-sweep and screenshot-analyst
        reports/qa/live_stats/2026-07-26_mode_cost_reconciliation.md is claimed by quality-sweep and screenshot-analyst
        reports/qa/live_stats/2026-07-26_session_panels.json is claimed by quality-sweep and screenshot-analyst

Dash check: zero em or en dashes across all nine new text files.

**The disjoint failure is real, expected, and declared in the manifest before it
happened.** It is SA-013 and it needs the integrator, not this branch. The owner
named `reports/qa/live_stats/**` for duty 6, so narrowing it here would silently
discard an assigned scope; `quality-sweep.manifest` is another track's file, so
editing it here would fail the scope check it exists to enforce. Rule 3 says
overlap forces sequence. It costs one line today because `track/quality-sweep`
has zero commits and has not started.

## Self-audit against the brief, per THE FACTS DISCIPLINE item 4

- Branch `track/screenshot-analyst`, delivered by pull request, `main` never
  pushed. Correct.
- Manifest written and committed first, before the work. Correct.
- Brief saved verbatim to both `docs/records/tracks/` and `reports/briefs/`, the
  two copies verified byte-identical with `diff`. Correct.
- `REVIEW_TRACKER.md` not written. Correct.
- No em or en dashes, explicit paths in every commit, no lock exception taken
  and none needed. Correct.
- Every one of the seven standing duties discharged, and all three first-session
  assignments answered.
- Two places where the brief asked for something this pass did not fully
  deliver, stated rather than glossed: the native-resolution measurement for
  SA-008, and two session panels in `dtt-live-2026-07-26/` listed as swept but
  not re-read, recorded as such in
  `reports/qa/live_stats/2026-07-26_session_panels.json` rather than counted as
  reconciled.

---

## FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, one session, one job as rule 4
prefers. Judgement work: the between-frame reconciliation is arithmetic, but
deciding which balance model a mid-animation frame is in is not mechanical, and
getting it wrong produces a confident wrong answer of exactly the kind
convention (l) exists to prevent.

**Approach taken.** Derive before measuring, per convention (l.1). The
specification was read first (`fsModes.ts`, `buyAffordability.ts`,
`HudOverlay.svelte`) and the closed-form answer stated before a single capture
was opened. Measurement then confirmed it. Had the two disagreed, the
measurement would have been suspect first.

**Alternatives tried and rejected.**

- *Reconciling frames 01 to 03 first.* Attempted, and it does not close on its
  own: seven seconds of rows between 12:13:16 and 12:13:22 are in no capture.
  Kept as the corroborating window with its unknowns stated as unknowns rather
  than dropped, and the decisive proof moved to the fully-covered 03 to 04 pair.
- *Treating the balance as settled in every frame.* Rejected because it makes
  frames 03 to 04 close to no sensible per-spin figure at all. The
  mid-animation model was adopted only after it produced 0.00 on one window and
  then independently explained frame 42's count-up.
- *Narrowing `reports/qa/live_stats/**` out of the manifest to make CI green.*
  Rejected. It would have discarded an owner-assigned scope to make a gate
  pass, which is the failure mode convention (p) is about.
- *Editing `quality-sweep.manifest` to resolve the collision.* Rejected. Another
  track's file, out of scope, and it would fail the scope check.

**Files touched.** `docs/records/tracks/screenshot-analyst.manifest`,
`docs/records/tracks/FS_TRACK_SCREENSHOT_ANALYST_Prompt.md`,
`reports/briefs/FS_TRACK_SCREENSHOT_ANALYST_Prompt.md`,
`docs/records/screenshots/FINDINGS_LEDGER.md`,
`reports/screens/CAPTURE_CATALOGUE_2026-07-26.md`,
`reports/screens/screenshot-analyst-2026-07-26/` (nine captures),
`reports/qa/live_stats/` (four records), and this file.

**Open threads.**

1. SA-013, the manifest collision. Blocks CI on this pull request. Integrator,
   one line, free while `track/quality-sweep` is unstarted.
2. SA-012, four altered evidence files in
   `reports/screens/scatter-anticipation/`. Needs an owner or integrator
   decision: restore or recommit as a new dated set.
3. SA-006, `cruise` unproven. One short autospin run with a session panel before
   and after closes it.
4. SA-002, SA-007, SA-011, wanting owner or Fable rulings, all maths-adjacent or
   platform-facing, escalated per (l.8) rather than answered here.
5. SA-008 wants its native-resolution measurement taken.
6. The two unread session panels in `dtt-live-2026-07-26/`.

---

# 2026-07-26, appended section: the owner's second intake

Appended per convention (j), which keeps one living document per arc extended
with dated sections rather than a fresh file per update. Same track, same day,
same branch. Everything below re-verifies fresh rather than carrying forward the
first pass's numbers.

## What arrived

The owner supplied three further captures and an updated
`Math Distribution & Summary .docx`, the document having grown from 40,810 to
87,050 bytes. Both were checked by modification time rather than taken on trust:
the captures at 14:29:57, 14:30:32 and 15:02:09, the document at 15:05.

## A working-tree change this track had to work around, stated plainly

The repository at `/Users/jt/math-sdk` had been switched to `main` by another
session between the first pull request and this one, with uncommitted work in
progress on `CLAUDE.md`, `WRS_MASTER_DOCUMENT.md` and
`docs/records/tracks/quality-sweep.manifest`.

Checking out `track/screenshot-analyst` in that working tree would have pulled
the checkout out from under a concurrent writer. This track instead created an
isolated `git worktree` for its own branch, leaving `main` and its uncommitted
work untouched. Verified after the fact: `main` still checked out, still seven
entries in `git status --short`, none of them this track's.

That is MULTI-TRACK rule 1 working as intended rather than a problem, and it is
recorded because the protocol does not currently say what a track should do when
it finds the shared working tree checked out to someone else's branch. A worktree
is the answer, and it is worth writing into the protocol.

## SA-013 was resolved while this track was working

The integrator narrowed `quality-sweep.manifest` from `reports/qa/**` to
`reports/qa/*` on `main`. Because `*` matches exactly one path segment, that
covers every gate output written directly into `reports/qa/` while excluding
every subtree, `live_stats` included. The collision this track declared in its
own manifest before the first file landed there is closed.

Observed as an uncommitted working-tree change, so it is reported as observed
rather than as landed. The integrator confirms it is committed before merging.

## New findings

**SA-017, the 5,000x wincap fired live, exactly at the cap.** The most
significant event in the evidence base and the first time the repository has
caught it. A `super` round at a `EUR 750.00` bet level paid `EUR 3,750,000.00`.

    3,750,000.00 / 750.00 = 5,000.00 exactly

Cross-checked between our own HUD (frame 10) and the platform's independent row
(frame 11, reading `x5000.00`). `WINCAP` is 5,000 at `gameStore.ts:8`. At the
cap, not through it. Nothing in the 126 ingested rows exceeds it.

**SA-018, and this is the one worth acting on: there is no capture of the
max-win celebration anywhere in the repository.** The wincap has now
demonstrably fired, and `MaxWinCelebration.svelte` has never been photographed
on screen in live play. Frame 10 is the aftermath, taken twelve seconds later,
with the reels at rest and no overlay.

Specification says it should have shown, and `$isWincap` is computed against the
bet level at both `gameStore.ts:158` and `roundInterpreter.ts:265`, which this
round cleared exactly. So the expected reading is that it fired and was
collected inside those twelve seconds. **That is inference, and it is parked
rather than concluded**, because a submission-facing claim about the max-win
presentation should not rest on inference. One capture closes it, and Bet Replay
can replay the round from its event id rather than waiting for another wincap.

**SA-019**, scene visible through unfilled reel cells in a mid-spin frame. Not
called a defect: reels populate left to right and the game's aesthetic is a
translucent frame over a city scene. Recorded because the idle board in frame 10
is fully opaque, so the two states do differ, and one settled-state capture at
the same viewport settles it.

**SA-020**, a positive confirmation rather than a fault. The observed bet levels
are `EUR 450.00`, `500.00`, `750.00` and `1,000.00`, none of which is in the
hardcoded fallback ladder at `gameStore.ts:7`, which tops out at 100. The game
is therefore driving from `rgsBetLevels`, the authenticated ladder. That is the
R5/TR-013 fix confirmed in live conditions, where previously it was held only by
a unit test.

## SA-006 moved, and honestly

`cruise` was the one mode with no evidence at all. It now has a capture and fifty
Bets rows, and its cost multiplier is confirmed **at display level**: HUD BET and
the COST column both read `EUR 10.00`, and since the HUD renders the effective
debit (SA-001) while COST carries the bet level (SA-002), the two being equal
means the multiplier is 1.0.

**The wallet delta is still not measured.** Every other mode was proven by
differencing two BALANCE readouts; `cruise` has one anchor and no second frame.
The row is updated to say exactly that rather than being closed. It is now the
only gap left in the mode-cost table.

## Stats intake, second snapshot

`reports/qa/live_stats/2026-07-26b_bets_page_all_modes_126_rows.json`, 126 unique
rows: 58 `base`, 50 `cruise`, 11 `bonus`, 7 `super`. It is COMPLEMENTARY to the
first snapshot, not superseding: the Bets panel is a rolling window capped at 50,
so each export holds a different slice. They share exactly one row, 14:10:32,
which agrees in both.

Anomaly checks across all 126, all clean:

- No payout above 5,000x bet. One row lands exactly on it, SA-017.
- No settlement gap. All 126 read `Settled`.
- Every stated MULT equals payout over COST at a tolerance of 0.006.

No RTP verdict is issued. The committed statistics note stands.

## Verification, measured again

    node scripts/qa/locked_paths_gate.mjs main HEAD
      LOCKED PATHS: 4 commit(s) in main..HEAD, 0 sanctioned, 0 violation(s)
      TRACK SCOPE: branch track/screenshot-analyst, 8 glob(s), 24 changed file(s), 0 out of scope
      LOCKED PATHS: PASS

Dash check: zero em or en dashes across every file this track has written.

The `--check-disjoint` result now depends on whether the integrator's
`quality-sweep.manifest` narrowing is committed, which is not this branch's to
determine. Both outcomes are recorded in SA-013 rather than one being asserted.

## FOR THE NEXT SESSION, revised

Open threads, in the order they are worth doing:

1. **SA-018**, capture the max-win celebration. Replayable from the wincap
   round's event id, so it does not need another 1-in-100,000 round. This is the
   highest-value single capture available to this track.
2. **SA-006**, one `cruise` run with a session panel before and after, closing
   the last mode-cost gap with a real wallet delta.
3. **SA-012**, the four altered evidence files in
   `reports/screens/scatter-anticipation/`. Still needs an owner or integrator
   decision; unchanged since the first pass.
4. **SA-019**, one settled-state frame at the `cruise` viewport.
5. **SA-002, SA-007, SA-011**, still wanting owner or Fable rulings.
6. **SA-008**, still wants its native-resolution measurement.
7. The two unread session panels in `reports/screens/dtt-live-2026-07-26/`.

Worth putting to the owner as a protocol question rather than a finding: the
MULTI-TRACK PROTOCOL does not say what a track should do when it finds the shared
working tree checked out to another session's branch. This session used a
`git worktree`, which cost nothing and disturbed nothing. It is a candidate for
rule 9.
