# Session Report - R082 THE TWO FRAMES UNIFIED AT v9 (2026-08-22)

Brief saved verbatim: `reports/briefs/FS_FABLE_R082_FRAME_UNIFY_V9_Prompt.md`, carrying both
instruments, the pasted draft's instruction and the ruling that replaced it. Branch: `main`,
as integrator, record-only per convention (t). **No game code changed. No locked path was
read for anything but computation and none was written.** `.claude/settings.json` diff
verified empty.

## What arrived, and why it was not executed as written

A frame document arrived numbered **v7 (2026-08-21)**, declaring that it superseded
**v6 (2026-07-13)**, with the instruction to commit it at the root, archive v6, and record
that v7 supersedes v6. Every one of those premises was false at `eb7b978d`, and all four
were verified first-hand before a single byte was written:

| The instruction assumed | The repository held |
|---|---|
| v6 is the current frame, awaiting archive | v6 was archived on 2026-07-25 at `fbaea577` |
| v7 is the next number | A DIFFERENT v7, dated 2026-07-25, was archived on 2026-08-15 at `447cdfca` |
| The root is free for v7 | `CLAUDE_PROJECT_INSTRUCTIONS_v8.md` had been the root frame since 2026-08-15 |
| v8 does not exist | v8 had been updated that same morning by R080, and `CLAUDE.md` line 10 named it the frame |

Executing it literally would have put **two different documents under the number v7**, one
archived and one active, left a lower number superseding a higher one, and orphaned v8 at the
root while the conventions document still pointed at it. That is precisely the ambient
superseded artefact convention (h) exists to prevent, and the archived v7's own prepended
note would have been made false: it says "Read v8 for the current frame."

**It was surfaced, not smoothed and not quietly reinterpreted.** Convention (n) says the
obligation is to state the tension and let it be ruled on, and that choosing quietly is the
violation in either direction. Nothing was committed until the owner ruled.

## The ruling, and the merge it specified

The owner withdrew the v7 numbering as a convention (m) miss and ruled that the repository
lineage is authoritative: take v8 as the BASE, fold in the draft's newer content, keep every
v8 clause the draft lacked, and publish the result as **v9**. Precedence: where the two
disagree on a current fact the draft wins; where v8 states something more richly, v8 wins.

**What the draft contributed:** the ARC 2 current state and its four workstreams; the
4.3-of-9 verdict with the reviewer split; the corrected platform reality (six of nine, the
3-day lock, reviewers ticking the 51 Guidelines boxes); conventions (v) and (w); the
wagers-are-the-owner's-hand-only line, now stated absolutely; the derive-before-measuring
precedence ladder; the current owner standing items and horizon; and one genuinely new rule,
that blocking CI watchers are retired for on-demand polls that abort loudly on empty probe
output, which exists nowhere else in the estate and is recorded here as new.

**What v8 kept:** all eight WHAT CHANGED FROM v7 corrections, carried forward unedited
because they are still the live rules; the locked-file debts pointer instead of an
enumeration; `docs/records/WAYS_OF_WORKING.md` in the session-start list; the two-face
typography fact; (h.1); and the richer statements of (f), (g), (l) and section 5.

**Two clauses in the draft were regressions on v8 and are NOT carried.** It called the
builder the **"sole writer"**, which is the exact claim v8's correction 5 retired in July
(MAIN is single-writer; other sessions deliver by pull request), and its session-start list
**omitted `docs/records/WAYS_OF_WORKING.md`**, which was v8's correction 6. Both are called
out by name inside v9's carried-forward correction list, so the next reader of either
lineage can see that they were considered and rejected rather than missed.

## Three facts the merge corrected against first-hand sources

Not one of these was in the ruling. They came out of checking the draft's claims rather than
transcribing them, per convention (m).

1. **The 2-star bar was quoted with its demanding half elided.** The draft rendered it
   "considerable creativity or originality... may lack polish compared to established
   studios". The captured text at
   `docs/stake-engine-live/2026-08-11/approval_guidelines_game_quality_rankings.md` line 18
   drops neither "more" nor the third sentence, "they still demonstrate strong development
   quality and attention to detail", which is the clause that actually sets the bar. v9
   quotes all three sentences with the dated source. Convention (m) now says so explicitly:
   compliance text is never elided, because an ellipsis can drop the demanding half.
2. **The Valkyrie attribution was wrong.** The draft wrote "Valkyrie (Waylander's Forge et
   al.)". Valkyrie is the PUBLISHER, recorded in our own first-party FAIR catalogue capture
   at `docs/stake-engine-live/2026-07-28/fair-catalogue.md` line 49 against the game
   `Lokis Vault`; Waylander's Forge is the competitor title studied in
   `docs/FEATURE_RESEARCH_v1_1.md`. v9 states both correctly and points at
   `docs/QUALITY_CHARTER.md` section 2, which already renders the benchmark in checkable
   properties.
3. **The one-active-review claim looked unsourced and is not.** R074's final audit recorded
   on 2026-08-20 that the sentence "appears in NO committed capture", verified by a sweep of
   the whole 2026-08-20 set. It is in the 2026-08-09 capture,
   `docs/stake-engine-live/2026-08-09/submission-checklist.md` line 141, quoted verbatim,
   and that capture also carries the follow-on the draft omitted: the limit rises to five
   concurrent reviews once approved. R074's finding was true of its own scope and read as
   wider than it was. v9 states the quote, its source, and the fact that a fresh logged-in
   capture is still owed.

## The clause-letter collision, found while merging

The draft's **(w) is the branding carve-out**. `CLAUDE.md`'s **(w) is the register split**,
recorded 2026-08-13 at R057 CLOSE. Both are live, both are load-bearing, and a bare "(w)"
was about to mean two different rules in two documents a reader consults in the same
sitting. The frame's own letters already diverged from `CLAUDE.md`'s in two other places:
the frame's (a) is the register split, and the frame's (o) is the close-sequence rule that
`CLAUDE.md` files at (u.1).

Resolved rather than papered over: v9 opens with an explicit clause-letter note stating that
its letters are its own, that any cross-citation is written in full as "CLAUDE.md convention
(x)", and that the branding rule is the one genuinely unhomed rule, carried by `CLAUDE.md`
as an unlettered bullet among its shipped-text rules. `CLAUDE.md` gains the mirror image of
that note beside its frame pointer. **E1 asks the owner to close it properly.**

## What landed

- `CLAUDE_PROJECT_INSTRUCTIONS_v9.md` at the root, 27,820 bytes, the merged frame.
- `CLAUDE_PROJECT_INSTRUCTIONS_v8.md` moved to `reports/archive/superseded/` under a
  prepended dated note, **body proved byte-identical to the committed version** by diff
  against `HEAD:CLAUDE_PROJECT_INSTRUCTIONS_v8.md`. Its note says plainly that v8 was not
  retired for being wrong.
- The withdrawn draft archived whole and unedited at
  `reports/archive/superseded/CLAUDE_PROJECT_INSTRUCTIONS_v7_draft_2026-08-21_WITHDRAWN.md`,
  body proved byte-identical to the paste, so **v9 can be diffed against both parents**.
- `CLAUDE.md` frame pointer repointed to v9 with the full corrected lineage, the numbering
  rule recorded, and the clause-letter note added. Its line 13 also carried a stale date,
  attributing 2026-08-15 to v7 rather than to v8; corrected in passing.
- `WRS_MASTER_DOCUMENT.md` row 5's model-policy citation repointed to v9.
- The dated records that also name v8 were **deliberately left alone**: the session report's
  own history, the R071 brief, comms entry 067 and the closed TR-181 tracker row are
  accurate statements about the world at the time they were written, and the conventions
  forbid editing them.

## Verification

Document currency gate run over the close-state tree before pushing, per the standing rule
and the 2026-08-11 lesson. Baseline before the pass: PASS, 272 frozen, 0 new. v9 itself
carries no backticked path claims, so it presents nothing for the gate to judge, which is
the style v8 established and is preserved deliberately: the document is pasted as plain
text into the owner's Claude project, not rendered. Every path it names was nonetheless
resolved by hand against the tree before it was written. Gates chained with `&&` per the
frame's (o). Explicit paths staged per (k). No rebuild and no code change, so the browser
matrix has nothing to exercise.

## ESCALATIONS

**E1 (R082). The branding carve-out has no convention letter in `CLAUDE.md`.** It lives as
an unlettered bullet among the shipped-text rules while the frame carries it at (w) and
`CLAUDE.md` uses (w) for the register split. v9 and `CLAUDE.md` both now state the collision
explicitly so nobody is misled, but stating a collision is not closing one. The owner is
asked to ratify a `CLAUDE.md` letter for the branding rule, at which point both documents
cite it by that letter and the note can shrink to a pointer.

**E2 (R082). The frame now carries live arc state again, which v8 deliberately did not.**
v8's design made sections 4, 6 and 7 pure pointers on the grounds that live state is never
carried in an instruction, which is convention (s). The ruling requires the ARC 2 state and
the verdict to be folded in. The compromise written into v9 is that dated facts are stated
as dated facts, which do not go stale, while every moving value (file counts, cue counts,
workstream status) is pointed at rather than written down. That is the best available
reading of both instructions, and it is flagged because it is a real tension and the owner
may want it resolved differently at the next frame revision.

**E3 (R082). A fresh logged-in capture of the approval page is still owed**, now for two
figures rather than one: the 6-of-9 bar with its 3-day lock (R080's E1, still open) and the
first-time-publisher one-active-review limit, whose only committed source is the 2026-08-09
capture and which R074's 2026-08-20 sweep could not find in its own set.

R080's E1, R081's E2 and E3, TR-148's four escalations, R078's E1 and E2, and R079's E1 and
E2 all stand.

## RETRO-VERIFICATION (per convention (t))

**Remote CI green on `ab3f2f18`**: run 32503156941, workflow `checks`, conclusion success,
2m2s. Three jobs, verified at job level: "what changed" success, "static gates" success, and
the browser matrix correctly SKIPPED, because the `browser` job declares `needs: changes` and
this pass altered no code and no asset. That is the expected shape for a records-only commit
and it matches what the verification section above predicted rather than merely agreeing with
it after the fact.

**THE NEW (o) WATCHER CLAUSE EARNED ITS PLACE ON ITS FIRST USE, and what it caught was me.**
The close-sequence poll was written against the ABBREVIATED sha `ab3f2f18`. `gh run list
--commit` requires the full 40-character sha: given an abbreviation it returns an empty JSON
array **and exits 0**, with no error and no warning. The poll therefore probed empty for
thirty minutes against a run that had been green since its second minute. Because the clause
requires an on-demand poll to ABORT LOUDLY on empty probe output rather than read silence as
green, it exited 1 and said so, and the verification was then done properly. A blocking
watcher of the old shape would have produced no output at all, and no output would have been
read as nothing wrong.

**The operational form, recorded so it is not rediscovered:** always probe with
`$(git rev-parse HEAD)`, never a short sha, and never let an empty probe stand in for a green
one. Proven both ways this session: `gh run list --commit ab3f2f18` returns `[]` at exit 0,
`gh run list --commit $(git rev-parse HEAD)` returns the run.

## FOR THE NEXT SESSION

**The frame is settled and the numbering question is closed forever: read the version from
the repository root, never from a document describing itself.** v9 is pinned text for the
owner's Claude project and the full body was printed in the reply for that purpose.

Nothing in R082 is queued for a builder. The arc's real work is unchanged and unstarted: the
**mechanic decision is the owner's and is still pending**, and it gates the books
regeneration. Art, animation and sound proceed independently of it.

Model and effort: Opus, judgement tier, one session, integrator on `main`, records only.
