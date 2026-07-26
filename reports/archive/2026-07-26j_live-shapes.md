
## 2026-07-26j: THE LIVE WIRE, READ FIELD BY FIELD

Brief saved verbatim: `reports/briefs/FS_LIVE_SHAPES_Prompt.md`. Fresh session on
`main`, three jobs, commit per job. **No lock exception granted and none taken**;
`frontend/src/lib/services/rgsService.ts` is untouched and `git diff` over it is
empty. Zero em or en dashes across every file written.

The owner opened DevTools on a live Stake Engine session and captured the
Network panel with the `wallet` filter applied. These are the first first-party
sightings of the real authenticate, play and end-round bodies. Until today every
claim about those shapes rested on the pinned types and on decoded book rows.

### JOB 1: what the live wire says

Six captures committed to `reports/screens/live-shapes-2026-07-26/`.

**Confirmed, and now closed as TR-077, TR-078 and TR-079.**

- **`round.state` IS a bare event array.** The frame shows it opening directly
  into `[ { "index": 0, "type": "reveal", "board": [...] } ]`. That is what
  `_extractEvents` assumes, and it is the first confirmation from the platform
  rather than from our own pinned types.
- **Money is integer micros in both directions.** `balance.amount` 996800000 on
  authenticate, 995060000 on end-round, and the HUD in the same frame reads
  `EUR 995.06`. At `CURRENCY_SCALE` 1,000,000 those are the same number.
- **`end-round` returns balance ONLY**, the whole body being
  `{"balance":{"amount":995060000,"currency":"EUR"}}`, with no round identity at
  all. That is exactly what the TR-009 rewrite assumed when it replaced the
  invented `{balance: number, roundId}`.
- **Plays without an end-round exist**, visible in the request list, so a
  zero-win round settles without one.
- A detail worth keeping: the board rows carry **six cells against a five-reel
  visible grid**. That is the padding row from the `CLAUDE.md` worked example,
  seen on the live wire for the first time.

**TR-080, the jurisdiction read, and the one place this session nearly got it
wrong.**

The live response carries `jurisdiction` at TOP LEVEL beside `balance` and
`user`. `rgsService.ts:555-559` reads `config.jurisdiction`.

`frontend/scripts/live_shape_conformance.mjs` proves this against the SHIPPED
function rather than a copy: it serves the captured body from a throwaway local
HTTP server and calls the real exported `authenticate()`. Nothing is
re-implemented, so it cannot agree with the parser by sharing its mistake, which
is convention (l.4) applied to a test rather than to a claim.

**The defect is REACHABLE, not confirmed live, and the difference is the whole
finding.** The frame shows the response TAIL only. Whether a `config` block
further up also carries a jurisdiction copy is unknown, so the harness runs both
cases: case A (no copy) reproduces the defect, case B (a copy) shows the parser
already correct.

**The error this session made and caught.** The first draft of the harness
asserted the defect flatly, from a fixture that omitted `config` entirely
because `config` was not legible in the capture. That fixture then "proved" a
second finding: that the bet ladder also arrives empty. **That is false.** Ledger
SA-020 recorded live bet levels of 450, 500, 750 and 1,000, none of which the
hardcoded fallback can express, so `config.betLevels` demonstrably does arrive.
The draft had measured its own assumption and produced a confident wrong answer
from it, which is precisely the failure convention (l.2) names. It was caught by
checking the new result against an existing committed one rather than by
re-reading the code. The harness now models what the capture shows and splits
the unknown into two cases instead of picking the dramatic one.

**The fix is parked, not applied.** One line, `rgsService.ts:558`:

    from   ...(config.jurisdiction ?? {}),
    to     ...(config.jurisdiction ?? raw.jurisdiction ?? {}),

Tolerant rather than a swap: `config.jurisdiction` still wins where it exists,
the top-level block is used where it does not, and where neither exists nothing
changes. All three cases are RUN in the harness, so the owner would be approving
a change that has been executed rather than one that has been described. It sits
in the tracker's parked-rows table with three options and a recommendation.

**TR-081, the red authenticate and the four console errors: NOT DIAGNOSABLE.**

Derivable from code: production has exactly two `authenticate` call sites,
`initRGS()` and `sessionRecovery.recoverSession()`, and `authenticate` is **not**
wrapped in `_withRetry` (only `play` and `endRound` are), so our client never
retries it. Four requests therefore means at least two session boots rather than
a retry storm.

Not derivable: the cause of the red one, or the content of the four console
errors, because **no frame shows the Console panel**; every frame has the AI
assistance tab open in that slot instead. Recording a plausible cause would be
the (l.6) violation, so the row says what would settle it: the Console tab with
the errors expanded, and the red row's own Headers and Response tabs.

### JOB 2: PART 9c rewritten to one page

The section was written before anyone had watched a real update happen. Most of
it described work the platform does by itself.

Differential sync is now explained instead of feared: **upload 4, delete 3, skip
104**, and all three numbers are normal. Upload is only what changed, because the
build renames a file when its contents change. Delete is the previous version of
those same files, worked out by the platform. Skip is everything unchanged.

**The `HASHES.txt` deletion step is gone.** It was a whole step asking the owner
to hunt a 2.82 KB notes file out of a 13 row list. It is harmless residue and the
step cost more than the tidiness was worth. The page says so explicitly, because
a previous version told him to do it, and contradicting yourself silently is
worse than never having said it.

The tile step is gone (composed already), the maths step is gone (untouched, and
no maths folder ships in the kit), and Publish is one button said once.

Five items remain and nothing else: the event 22975 max-win replay with its
celebration capture, twenty bracketed Cruise spins, Gold Coin decimals, the
language list and Danish fallback, and the Guidelines ticks.

**Three old observations came off, and the page says why.** They asked the owner
to read the network panel for where a round's events live, how a round ends, and
whether the platform sends display information. His own DevTools screenshots
answered all three. A shorter list reads as work being cut unless someone says
where it went, and in this case he did the work himself.

Forty-five minutes becomes twenty; 670 lines becomes 542.

### One thing that does not match, flagged rather than resolved

`reports/screens/live-shapes-2026-07-26/02_tile_editor_background_no_file_chosen.png`,
captured 16:28, shows the Tile Editor with **Background Image: No file chosen**
and the placeholder GAME TITLE template in the preview. The brief says the tile
is composed and done, and the walkthrough now says so too.

Both can be true if the tile was finished after 16:28, which is likely given the
brief is later. It is recorded here rather than reconciled because the owner is
authoritative on what he did and a capture is a moment, not a state. If the tile
is in fact not composed, this line is where that gets noticed.

### Verification, measured

    node frontend/scripts/live_shape_conformance.mjs     9 of 9 checks ok
      defect REACHABLE (case A), controls pass, proposed fix verified
    node scripts/qa/locked_paths_gate.mjs --self-test    PASS
    node scripts/qa/locked_paths_gate.mjs --check-disjoint  3 manifests, 0 collisions
    git diff frontend/src/lib/services/rgsService.ts     EMPTY, no lock exception taken
    dash check across every file written                 0

### Rule 10 closing link

This session's final push, BOTH JOBS GREEN:
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30197391943`
  static gates: success
  browser gates: success

### FOR THE NEXT SESSION

**The parked sanction line, ready to paste.** If the owner wants TR-080 closed:

> Sanction: lift the deny on `frontend/src/lib/services/rgsService.ts` for one
> isolated pass to change line 558 from `...(config.jurisdiction ?? {}),` to
> `...(config.jurisdiction ?? raw.jurisdiction ?? {}),`, per the recommendation
> in the parked-rows table and the run evidence at
> `reports/qa/live_shape_conformance_2026-07-26.json`. Commit message carries
> `LOCK-SANCTION: <date> frontend/src/lib/services/rgsService.ts`.

The recommendation is to take **one screenshot first**: the authenticate response
scrolled to the top. If a `config.jurisdiction` copy is there, case B is real,
nothing needs fixing, and a locked file never has to be opened. That screenshot
is a ten second job and it converts a maybe into a fact.

**The owner's remaining list**, now five items on one page: the event 22975
replay with its celebration capture, twenty bracketed Cruise spins, Gold Coin
decimals, the language list and Danish, and the Guidelines ticks. Two captures
that are NOT on his page but would close TR-081 if he is in DevTools anyway: the
Console tab with its four errors expanded, and the red `authenticate` row's
Headers and Response tabs.

**Then Fable's polish review and round three.** The retro mechanism at
`WRS_MASTER_DOCUMENT.md` section 3f nominates up to three surfaces for focused
redo sessions after the portal visit, selected by measured weakness against the
professional bar rather than by taste.

**Model and effort.** Opus 5 at high effort. The judgement was in refusing to
report the jurisdiction defect as confirmed when the capture could not support
it, and in noticing that a second finding the harness produced contradicted an
existing committed result.

**Alternatives tried and rejected.**

- *Reporting TR-080 as a confirmed live defect.* Rejected once the fixture's
  own second finding contradicted SA-020. The capture shows a tail, and a tail
  cannot prove the absence of something in the head.
- *Applying the one-line fix.* Rejected: locked file, no exception in this brief.
  The brief's own instruction is to design it, prove it and park it, and that is
  what happened.
- *Guessing at the four console errors.* Rejected under (l.6). Two named
  captures settle it and neither has been taken.
- *Leaving the `HASHES.txt` step in PART 9c "just in case".* Rejected. It is
  residue, and a step that costs more than the tidiness is a step that trains
  the owner to skim the page.

**Files touched.** `reports/briefs/FS_LIVE_SHAPES_Prompt.md`,
`reports/screens/live-shapes-2026-07-26/` (six captures),
`frontend/scripts/live_shape_conformance.mjs` (new),
`reports/qa/live_shape_conformance_2026-07-26.json`,
`docs/records/reviews/REVIEW_TRACKER.md`,
`docs/records/upload-kit/00_READ_ME_FIRST.md`, this report and its archive copy.

**Open threads.** TR-080 (parked sanction, one screenshot away from being
settled either way), TR-081 (not diagnosable, two captures named), TR-073,
TR-074 and TR-075 from the previous session, all of which close on captures from
the same visit. The four keep-or-discard working-tree items from session 26i are
unchanged and still the owner's call.
