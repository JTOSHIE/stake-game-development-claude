---

## 2026-07-26f: V3 FRESH SESSION, JOB 3 remainder through JOB 5

Brief saved verbatim: `reports/briefs/FS_V3_FRESH_SESSION_Prompt.md` (`63a3f56`).
Live parent set unchanged: `FS_V3_CONSOLIDATED_Prompt.md` and
`FS_V3_CONTINUATION_Prompt.md`. **No lock exception was taken and none was needed.**
`rgsService.ts`, `gameStore.ts` and `games/future_spinner/**` untouched;
`git diff .claude/settings.json` verified 0 bytes before every commit. Explicit
paths on every commit, never `git add -A`.

### What landed, by job

| Job | Result | Commit |
|---|---|---|
| Brief saved verbatim | DONE | `63a3f56` |
| 3(e) mini-profile abbreviation, TR-066 | **DONE, row CLOSED** | `e4bfbc5` |
| 3(d) social forces English, TR-067 | **DONE, row CLOSED** | `e9bf3f6` |
| 3(f) FEATURE PRICE line, TR-068 | **DONE, row CLOSED** | `17679ce` |
| TR-072, found in passing, fixed per the mandate | **DONE, row OPENED and CLOSED** | `a933dc4` |
| 3(g) contrast measured, TR-070 | **DONE, row CLOSED** | `fe8d446` |
| 3(h) locked-paths CI gate | **DONE** | `5c1b991` |
| 3(i) no documentation ships | **DONE** | `856fd17` |
| 4, build provenance, TR-062 (a) | **DONE** | `7dd83e6` |
| 5, kit V3 from a fresh clone, TR-062 (b) | **DONE, row CLOSED** | `a1ff78b` |
| 6, 7, 9, 10 | **NOT STARTED**, resume notes below | |
| 8, close | this section | |

**JOB 3 is now complete, (a) through (i).** Six tracker rows closed this session:
TR-066, TR-067, TR-068, TR-070, TR-062 and the new TR-072.

### JOB 3(e), and the root cause that was not the recorded one

Fable ruled mini-profile abbreviation only. Built as ruled, and building it found
that **this row's own recorded diagnosis was wrong, and it was mine.**

The row said `noStatValueIsTruncated` was vacuous because "every `.m-stat-value`
carries `use:autofitText`, which iteratively shrinks the font". That is true of
`.p-stat-value`, `.c-stat-value` and `.fs-value`. **It was never true of
`.m-stat-value`**, and it is the reverse of the truth: that rule read a flat
`font-size: 11px`, so it never multiplied in the `--autofit-scale` custom property
the action writes. **`use:autofitText` has been a complete no-op on the mini strip
since JOB C created the profile.** The comment sitting beside the rule asserted the
opposite, which is how it survived two tuning passes and a written diagnosis. So the
owner's mid-glyph cut was not autofit reaching a limit; it was nothing shrinking at
all and `overflow: hidden` doing the cutting.

Abbreviation is still required, and that was derived before it was built: the
BALANCE box measures **84.2px** including its 7px label, leaving roughly 58px for a
value needing about 95px, so a fit costs an effective **6.7px** against a 9px floor.

**Both fixtures, which is what makes it a proof of the ruling rather than of half of
it.** Hostile `$52,431,098.76`: `$52.43M` at the full 11px in all five states.
Fits-in-full: **`$1,040.06` complete at 9.92px**, and that value is not invented, it
is the balance in the owner's own capture where the shipped build rendered
`BAL $1,040` with the cents cut. Desktop, portrait and compact landscape all render
`BALANCE $52,431,098.76` in full, asserted.

`formatBalanceCompact` uses Intl compact notation rather than a hand-written K/M/B
table, because a table would be English in a game shipping sixteen locales, and it
**truncates rather than rounds**: $999,999.99 must not read as "$1M". A money readout
may understate under abbreviation; it may never overstate.

**A third defect, found only by doing the capture comparison the ruling asked for.**
The mini strip's menu button renders as an **empty box with no icon**, in the owner's
live capture and in ours. It borrows the portrait profile's `.p-hamburger-bar`, which
paints from `var(--p-acc)`, declared on `.p-hud` and nowhere else, so inside `.m-hud`
the declaration is invalid at computed-value time and the bars are transparent. The
only control reaching the paytable, session panel, turbo, autoplay and MAX in the
popout had no affordance. `.c-hud` had the identical defect. Both fixed.

### JOB 3(f), and what the capture shows

The real-money proof capture reads

```
EPIC WIN   $29,214.24   386x BET      FEATURE PRICE $40,000.00
```

which is TR-068's confusion exactly, now legible as the loss it is. The social
capture reads `EPIC PRIZE $11,551.28  183x PLAY  FEATURE PRICE $10,000.00` with
COINS/PRIZE/PLAY throughout.

`spinCostMicros` is now the only place that cost expression exists. It previously
existed **five times over**, which is five chances for the price a player is quoted
to disagree with the price they are charged.

### TR-072, and why it is not a small thing

Found by looking rather than by a gate: the JOB 3(f) proof stalled on the free-spins
CLICK TO CONTINUE gate, and reading the markup to find its selector showed the string
was a bare English literal.

`locale_completeness_check.mjs` reported PASS with **four** of these shipping. Its
scan required the literal's first character to sit immediately after the `>`, which
holds only when an element and its text are on one line. The moment an element wraps,
which is the house style, its text sits on its own line behind a newline and
indentation and the gate could not see it at all. **That is the TR-060 and TR-063
pattern for the third time.**

The four are all reachable: CLICK TO CONTINUE, which every free-spins entry stops on;
REACHED! and COLLECT on the 5,000x celebration; and PLAY AGAIN on Bet Replay, a
mandatory platform surface. Fixed by authoring across all sixteen locales, composed
from each locale's own shipped vocabulary.

### JOB 3(g): measured, and no scrim needed

The row deliberately did not fix blind. Re-measured after 3(b) and the prediction
held. Worst-case contrast against the real composited backdrop: FEATURES label
**10.06 / 7.98 / 7.57 / 9.05** at Mobile L, M, S and 390x844; the mode chip
10.70 / 10.18 / 9.25 / 10.58. Every figure clears WCAG AA at 4.5:1 and the lowest
clears **AAA** at 7:1. Adding a scrim would have been a change made against a
measurement nobody took.

Two corrections caught before they became findings: a colour-parsing bug that
reported every preset failing at 1.17:1 (impossible for light text, caught by
convention (l.2)), and an inert assertion whose target never rendered.

### JOB 3(h): the deny rules do not guard git

`scripts/qa/locked_paths_gate.mjs` runs first in CI and reads what actually landed.
Token format documented in CLAUDE.md beside the locks:

```
LOCK-SANCTION: <YYYY-MM-DD> <locked-path>[, <locked-path>]...
```

Checked in **both directions**: every locked path touched must be named, and every
path named must be touched, so a blanket sanction is rejected rather than ignored.

**Self-test output, as the brief requires it recorded:**

```
caught  a locked file changed with NO token                      (expected FAIL, got FAIL)
caught  the same change WITH a matching token                    (expected PASS, got PASS)
caught  a token naming ONE path while TWO are touched            (expected FAIL, got FAIL)
caught  a blanket token naming MORE than it changes              (expected FAIL, got FAIL)
caught  a file INSIDE games/future_spinner/ with no token        (expected FAIL, got FAIL)
caught  .claude/settings.json committed with no token            (expected FAIL, got FAIL)
caught  a locked file touched via a bulk add                     (expected FAIL, got FAIL)
caught  negative control: an ordinary commit                     (expected PASS, got PASS)
caught  negative control: an empty range                         (expected PASS, got PASS)

LOCKED PATHS SELF-TEST: PASS
```

It builds a real throwaway git repository and makes real commits in it, because the
git plumbing is where a path-matching gate actually goes wrong.

### JOBs 3(i), 4 and 5

Documentation no longer ships. The audio generation-notes README naming the model,
seeds, prompts and licence paths is pruned at build and its absence is asserted by a
separate gate that knows nothing about the plugin, because a plugin that stops
running fails silently, which is how `build_diet_verify.mjs` sat broken for ten days.

`dist/build-info.json` carries the commit; the boot line prints it from values Vite
**inlined**, and the network-hygiene gate asserts the file is never fetched:
**0 requests**, measured.

`scripts/kit_build.mjs` refuses an unpushed HEAD and a dirty `frontend/`. **Both
refusals were observed firing on the real tree** before the push, and the build
succeeded only once both were resolved, so they are known to work rather than
assumed to. One bug was found by running it rather than reading it: the tree-facts
helper trimmed the whole `git status --porcelain` output, stripping the leading space
off the first line only, so one dirty frontend file was downgraded from a refusal to
a warning. That is the wrong direction to be wrong in.

### THE KIT

**`~/Desktop/FS_UPLOAD_KIT_V3/`**

| Field | Value |
|---|---|
| Commit | `7dd83e6a4ffd6a6fed74a0c2fd0a9262661e6c5e` |
| Tree | clean, built in a fresh clone |
| Contents | `02_frontend_upload/` (108 files, 15,515,125 bytes, 14.80 MB), `README.md`, `BUILD_INFO.json` |
| Gates run IN THE CLONE | dist hygiene PASS, dash gate dist scan PASS, mock containment PASS |
| Maths | stays at V1, NOT re-uploaded |

`~/Desktop/FS_UPLOAD_KIT/` is DEAD and must not be uploaded again.

### Gate results at HEAD

| Gate | Result |
|---|---|
| `npm run check` (svelte-check AND tsc) | **0 errors**, 36 warnings, the committed baseline, 496 files |
| typecheck baseline, dead wiring, wallet floats, currency scale drift | **PASS** |
| locale completeness **plus its new seeded self-test** | **PASS**, 0 unexplained literals, 5 of 5 seeds caught |
| a11y social terms, vocabulary, fsModes drift | **PASS** |
| dash gate: self-test, source, dist | **PASS**, all three |
| currency static | **PASS**, 82 assertions |
| **social locale, NEW gate 12a** | **PASS**, 65 assertions |
| betLadder, responsibleGambling, modalGuard, liveGuard, sessionRecovery, scatterEscalation, launchParams | **PASS** |
| rgsService parse and contract, replayRounds | **PASS** |
| layout fit gate, seven presets | **PASS** |
| **contrast gate, NEW gate 13d** | **PASS**, seeded violation caught, negative control clean |
| **dist hygiene, NEW gate 13e** | **PASS**, 4 of 4 seeds caught, stamp reconciles |
| **locked paths, NEW gate 0** | **PASS**, 9 of 9 self-test cases |
| mini player proof | **PASS**, 19 checks, 5 seeded violations caught |
| feature price proof | **PASS**, 15 checks including the negative control |
| locale launch conformance | **PASS**, 16 locales, 10 fallbacks, 5 social cases, negative control |
| build diet verify | **ALL CHECKS PASS**, `buildInfoRequests: 0` |
| mock containment | **PASS** |
| kit builder self-test | **PASS**, 5 of 5 |

Five new CI gates this session: **0** locked paths, **12a** social locale,
**13d** contrast, **13e** dist hygiene, plus the locale gate's self-test.

### Self-audit against the brief and the conventions

- Brief saved verbatim to `reports/briefs/` and committed first, convention (f).
- One commit per job, explicit paths throughout, never `git add -A`, convention (k).
- No em or en dashes authored. The four surviving in `gameStore.ts` comments stay
  parked (locked, no exception); seven in `vite.config.ts` comments were cleared
  while that file was open.
- No lock exception anywhere. No bulk operation ran over a tree containing locked
  paths; the only tree-wide operations were read-only scans.
- Every new gate ships a seeded self-test, convention (p), and in every case the
  seed is the form the defect really took rather than a form the gate handles.
- Money-path work escalated rather than ruled on: TR-066's abbreviation and
  TR-068's price line were both built to Fable's recorded rulings, not to my
  recommendation, per (l.8).
- Two of my own measurements were wrong and were caught by (l.2) before they became
  findings: the contrast colour parse, and the kit builder's porcelain parse.
  A third, this row's own autofit diagnosis, was wrong in the record and is
  corrected in TR-066 rather than quietly overwritten.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort, single continuous session.

**Approach.** Jobs in briefed order, one commit each, each job's measurement taken
before its code was written. Where a ruling predicted an outcome (TR-070's "the
contrast may resolve itself"), the prediction was tested rather than assumed in
either direction.

**Alternatives tried and rejected.**
- A magnitude threshold for the mini abbreviation ("abbreviate above $1,000,000"),
  rejected because it guesses at a pixel width that depends on the currency symbol,
  the locale's separators, the bet ladder and whether the brand font loaded. The
  action measures instead.
- A hand-written K/M/B suffix table, rejected because it would be English in a game
  shipping sixteen locales. Intl compact notation carries each locale's own
  magnitude word for free.
- Rounding rather than truncating the abbreviated value, rejected on the money rule:
  $999,999.99 would read as "$1M".
- Implementing TR-067 as "one line in `tr.ts`" as the row records, rejected because
  it would leave the `locale` store itself reading `de` and every other consumer
  disagreeing with the words beside it. The store is forced instead.
- Adding a scrim to the FEATURES bar, rejected after measuring: it already clears AAA.
- Reporting the contrast gate's first result (every preset failing at 1.17:1) as a
  finding, rejected under (l.2); it was a broken measurement and "fixing" it would
  have addressed a defect that does not exist.
- Refusing the kit build on any dirty path anywhere, rejected as theatre: the
  artefact comes from a clone, so an untracked file elsewhere cannot reach it. It
  warns by name instead and refuses only on `frontend/` and an unpushed HEAD.
- Sharing one doc-extension list between the build plugin and the hygiene gate,
  rejected under (l.4): two methods agreeing means nothing when they share an input.

**Files touched.** Per commit above; explicit paths throughout.

**WHERE THE NEXT SESSION RESUMES: JOB 6, exactly as the live parent brief writes it.**
Nothing in JOBs 6, 7, 9 or 10 was started, and no partial work exists for any of them.

- **JOB 6, DOCUMENTATION.** Not started. Dossier evidence section: the platform's
  independent maths corroboration (96.3500, 17.2841, 100000, 5000, 0.00% variance,
  all constraints green at both star tiers) with capture pointers, which are
  `reports/screens/dtt-live-2026-07-26/15_maths_overall_bet_level_compliance_all_pass.png`,
  `16_maths_all_five_modes_compliant.png`, `17_maths_base_detailed_metrics_and_6of6.png`,
  `18_maths_base_hit_rate_distribution.png` and
  `19_maths_base_property_table_rtp_963500_sd_172841.png`; the production money-path
  proof (the four to-the-cent HUD reconciliations across base, 100x and 400x, and
  Event 63's 400x debit, all currently recorded only inside TR-068's row); the item 12
  conflict recorded as observation-pending with both first-party citations (TR-064).
  `GAME_FACTS.md`: the 5.00% wincap RTP band fact. `COMPLIANCE_WATCH.md`: the
  platform-stated 96.70% ceiling with its capture reference.
  `docs/records/reviews/FIX_LIST_2026-07-26.md` updated so every row carries its
  disposition and commit; **that file has NOT been touched this session and its rows
  do not yet reflect commits `e4bfbc5` through `a1ff78b`.**
- **JOB 7, THE OWNER'S SECOND VISIT.** Not started. Replace any prior second-visit
  section in the walkthrough with one authoritative version, per the parent brief's
  seven numbered steps, plus the two ruled amendments: screenshots saved loose on the
  Desktop for the builder to file, and the confirmation list now including the
  FEATURE PRICE line on a bought round and the mini-player readouts at Popout S.
  Both of those are now real and capturable: `reports/screens/feature-price-2026-07-26/`
  and `reports/screens/mini-player-2026-07-26/` show what the owner should expect to see.
- **JOB 9, QUALITY CHARTER AND SWEEP.** Not started. `docs/QUALITY_CHARTER.md` is
  referenced by THE STANDING MANDATE in CLAUDE.md and **does not exist yet**. Known
  sweep material already located but deliberately not actioned this session: four em
  dashes in locked `gameStore.ts` comments (parked, locked, no exception); and the
  sentence-case English prose that TR-059 owns, including
  `MaxWinCelebration.svelte`'s "Press COLLECT or hit Enter to continue" and
  `ReplayMode.svelte`'s "Replaying round...", which the repaired
  `locale_completeness_check.mjs` still cannot see because it scans ALL-CAPS literals
  only. That limit is now the honest boundary between TR-072 (closed) and TR-059
  (parked), and JOB 9's sweep is where it gets revisited.
- **JOB 10, THE RESKIN BOUNDARY.** Not started. `docs/RESKIN_BOUNDARY.md` does not exist.

**The owner can run the second visit now if they wish**, since kit V3 exists and is
correct, but the walkthrough's authoritative second-visit section is JOB 7 and is not
yet written, so the current walkthrough does not describe kit V3.

**Nothing is blocked.** Every remaining job is documentation or a new document; no
code change is outstanding, no gate is red, and no question is waiting on a ruling.
