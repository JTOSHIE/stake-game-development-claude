# Session Report - THE STREAM TEST RECOVERY, WAVE 2 DISCOVERY (2026-07-29)

Brief saved verbatim: `reports/briefs/FS_STREAM_TEST_RECOVERY_Prompt.md` (commit
`bd15d42`, saved before any other work). Branch: `main`, this session as sole
writer. No lock exceptions taken and none needed; `git diff .claude/settings.json`
empty throughout. Explicit paths on every commit per convention (k).

## Summary

The stream test resumed after the trial session hit its allowance mid-checkpoint.
**Wave 2 discovery is now COMPLETE across all five lenses: 47 shards, 540
findings, zero squads lost.** The adversarial verification pass was NOT run, and
that is the honest headline rather than a footnote: this session stopped at a
wave boundary with its allowance largely spent, per protocol rule 13, rather
than starting a pass it could not finish.

## JOB 1, the salvage survey, and the correction it produced

**The 220MB push had not failed. It had landed.** `git ls-remote origin
refs/heads/main` returned `93e2dbe`, identical to local HEAD, with
`rev-list --left-right --count` reading `0 0`, and CI run 30353308358 on that
push was green. The premise the brief was written on was wrong, and checking it
first is what stopped this session re-committing 519 frames it did not need to.

| Artefact | State found |
|---|---|
| Capture set, 519 frames, 220MB | committed AND pushed at `93e2dbe` |
| Harness with the locale-agnostic fix | committed at `93e2dbe`, unmodified |
| `KNOWN_OPEN.md` | committed at `93e2dbe` |
| `WAVE2_SQUAD_PROMPT.md` | untracked |
| Wave 2 shards | **exactly one**, `STV.md`, untracked |

Per convention (q), nothing that existed was re-run. The batched capture commit
the brief called for was therefore not performed, because performing it would
have re-committed already-durable evidence.

## JOB 2, durable commit

Four commits, smallest first, each pushed and each green. The two mid-flight
findings were written to a new `reports/qa/stream_test/LEDGER.md`, credited to
the trial session, with this session's derivation kept separate from that credit:

- **MID-01 STREAM.** The win banner and the HUD WIN pod run two independent
  count-ups over the same figure, 1400 ms against 528 ms at 16x, identical
  cubic easing. Derived from `WinBanner.svelte:79,166` and
  `HudOverlay.svelte:302-315` BEFORE measuring. The closed form predicts a pod
  reading of $15.96 at the instant the banner shows $10.29; frame `013` reads
  **$15.95**. Measurement confirmed the derivation rather than discovering it,
  per convention (l.2).
- **MID-02 HIGH.** `WinBanner.svelte:205` writes the multiplier unit with ASCII
  `x` on 60 of 519 frames. Charter row Q-26 exists to record that the Q-12 glyph
  fix was not swept to the class and enumerates four survivors in `fsModes.ts`;
  this is a fifth. The row written to catch an incomplete sweep was itself
  incompletely swept.

## JOB 3, discovery via the container

47 shards, every one of the 519 frames read by at least one lens.

| Lens | Shards | Findings |
|---|---|---|
| Composition | 16 | 236 |
| Typography | 16 | 163 |
| Motion residue | 8 | 77 |
| Localisation | 4 | 42 |
| Voice | 2 | 22 |

**540 findings: 43 STREAM, 160 HIGH, 228 MEDIUM, 106 LOW.**

## JOB 4, marshalled but NOT verified

The shards are consolidated to `LEDGER.md`. **No finding in it has been
verified and the ledger says so in its first paragraph.** Convention (r) and
`docs/skills/FULL_AUDIT_METHOD.md` section 4 both say a thorough audit is not
started on the last quarter of a budget, because a half checked list is more
dangerous than an unchecked one. No fix was applied either, deliberately:
applying fixes would have moved the tree epoch under an unverified list, which
is the trap section 2.2 exists to name.

What the marshal COULD establish without verifiers is cross-squad agreement.
The squads were shared-nothing, one lens and one half session each, none able to
see another's shard, so repeated independent reports are corroboration from
genuinely independent inputs in the sense convention (l.4) requires. Five
clusters are named. The largest, **the reel window going transparent mid-spin
with the scene showing through the board, is reported by eleven squads across
two different lenses and seven viewports.** That establishes the thing was seen;
it does not establish the diagnosis, and the ledger says so.

Four localisation findings could not have come from any English session,
including an entire Responsible Play paragraph rendering in English under a
German heading, and the Arabic max win overlay printing multiplier and unit in
LTR order.

**One item was verified first-hand by this session rather than by an agent.**
`KNOWN_OPEN` sizes TR-104 as "larger than small, sized like TR-091". Its tier
half is already fixed, proven by frame `430` reading `GROSSER GEWINN` and frame
`482` reading Arabic. Only the unit remains, at `WinBanner.svelte:210`, and the
fix is one line using a `bet` key that already exists in all sixteen locales in
the correct ALL-CAPS shape and that `MaxWinCelebration.svelte:159` already calls
for the same word. Recorded so the next session does not re-derive it.

## JOB 5, the method amendments, and the model trial record

Committed at `6283bef`: `FULL_AUDIT_METHOD.md` gains 4.1 (mass waves run in the
workflow container with per-agent retry, and a lost agent is reported as LOST
rather than omitted, because a squad that died silently and a squad that found
nothing produce identical output) and 4.2 (a session renames regeneratable
scratch aside rather than deleting it, so the safety layer never has to ask).
`CLAUDE.md` convention (q) gains the precondition. The closing checklist gains a
line for agent accounting.

### The trial record

**Agents deployed: 93 transcripts across 8 workflow runs.** Waves completed:
capture (trial session) and discovery (this session). Verification: not run.

Burn figures, cited rather than estimated. Two of the four completed runs
reported usage and are quoted; the others did not report and are recorded as not
known rather than guessed, per convention (l.3):

| Run | Agents | Subagent tokens | Tool uses | Wall clock |
|---|---|---|---|---|
| Composition remainder | 7 | 1,318,122 | 457 | 54.6 min |
| Motion, localisation, voice | 13 | 2,371,525 | 905 | 80.8 min |
| Typography | 16 | not reported | not reported | about 90 min |
| Two abandoned attempts | 44 launched | not reported | not reported | about 75 min |

**Self-caught errors: two, both orchestration, both caught by reading agent
transcripts rather than by anything failing loudly.**

1. **Context exhaustion by design.** The first wave gave each squad a whole
   52-frame session. Three squads were cut off after looking at every frame and
   before writing anything, so everything they had seen was lost. Caught by
   noticing three transcripts ending in an interrupt at 14 to 22MB. The fix was
   structural, not a retry: halve the frame set, and order every squad to write
   its shard the moment the last frame is read, before opening any source file.
   **Zero squads were lost after that change**, across 36 agents.
2. **A parameter that silently did not arrive.** Three workflows were launched
   from one script parameterised by an `args` value naming the lens group. The
   args did not reach the script through the `scriptPath` invocation, so all
   three defaulted to the same group and ran identical squads against identical
   frame sets, writing to identical shard paths. Caught by reading a transcript
   in which an agent said, in its own words, that another process was
   concurrently editing its shard and it would merge rather than clobber. Fixed
   by baking the group in as a constant, which cannot fail that way, and
   verified by checking the squad prefixes actually running in each workflow
   before letting them proceed.

The nine shards produced during the second error were kept, not discarded: each
was checked for duplicate ids and a clean `tree_after` before commit, and
`STC-LAPTOP-B` records the collision honestly in its own `frames_read` line as
two independent passes over the same 26 frames.

**Deviations resolved in the open:** the batched capture commit was not
performed (the capture set was already durable, and convention (q) forbids
re-running it); the verification pass and the fix batch were not started (the
allowance would not carry them, and a partial verification is the one artefact
the method names as most dangerous). Both are recorded here and in the ledger
rather than quietly dropped.

**The roster question, framed rather than ruled.** A model-roster call belongs
to the owner and Fable, so this section presents the comparison and does not
decide it. The trial session produced the capture wave and caught three harness
defects from the run's own evidence, then lost an entire discovery wave because
it was chat-spawned and had no durability layer. This session produced the
discovery wave and lost nothing after the design was corrected, but spent two
self-caught orchestration errors getting there and did not reach verification.
The honest reading is that the difference visible in this arc is **orchestration
discipline rather than model quality**, since the trial session's loss was
caused by a missing container and not by its judgement, and its one surviving
shard (`STV.md`) is among the strongest in the set. The comparison the owner
actually wants is therefore not yet available, and forcing one from this arc
would be exactly the confident error convention (l.6) warns against.

## Verification of this session's own claims

- The remote state was read with `git ls-remote`, not from a local ref.
- MID-01 was derived from source and then confirmed against the frame, in that
  order, agreeing to one cent.
- MID-02's codepoint, the sixteen `bet` locale values and the TR-104 half-fix
  were read first-hand from source and from frames `430` and `482`.
- Every shard was checked for duplicate finding ids and a clean `tree_after`
  before it was committed.
- No committed evidence was rewritten. `git status` clean at close.

## Rule 12, the owner preview

Refreshed before this report, per rule 12. The printed line:

```
OWNER PREVIEW  |  v10 line, main  |  commit 905592c  |  built 2026-07-29T01:09:33+10:00  |  started 2026-07-28T15:09:48.610Z  |  http://192.168.4.92:5173
```

It refused once first, correctly, because a squad's step-three enrichment had
landed after the wave commit and left the tree dirty. That was committed as
`905592c` and the preview then ran clean. The refusal is recorded because a
preview that refuses and says why is the rule working.

## FOR THE NEXT SESSION

- **Model and effort used**: Opus 5, ultra effort, single session, six jobs
  attempted and four completed.
- **Approach**: survey before touching anything, which immediately corrected the
  brief's premise about the failed push; commit smallest first and push each
  batch; run discovery in the workflow container with per-agent retry; stop at
  the wave boundary rather than start a verification pass the allowance could
  not carry.
- **Alternatives tried and rejected**: 52-frame squads (rejected after three
  squads were lost to context exhaustion); passing the lens group through
  workflow `args` (rejected after it silently failed and ran three duplicate
  waves); applying the two ready fixes before verification (rejected, it would
  move the tree epoch under an unverified list, method section 2.2); discarding
  the nine shards produced during the duplicate-wave error (rejected, they were
  checked and are sound, and one of them records the collision itself).
- **Files touched**: `reports/briefs/FS_STREAM_TEST_RECOVERY_Prompt.md`,
  `reports/qa/stream_test/LEDGER.md`,
  `reports/qa/stream_test/WAVE2_SQUAD_PROMPT.md`,
  `reports/qa/stream_test/shards/` (47 shards plus `SHARD_INDEX.md`),
  `docs/skills/FULL_AUDIT_METHOD.md`, `CLAUDE.md`, `reports/SESSION_REPORT.md`.
  No file under `frontend/src/`, `games/future_spinner/` or any locked path was
  modified.
- **Open threads**:
  1. **The verification pass, which is the whole of what remains before any fix
     lands.** 540 findings, shared-nothing, one adversarial verifier per finding
     told to REFUTE and to default to refuted when uncertain. Size it as its own
     job per convention (r); the recorded figure is about 3.1M subagent tokens
     for 41 verifiers. Start with cluster 1: eleven independent reports make it
     both the likeliest to be real and the cheapest to settle.
  2. **Fable verifies the arc**, per the brief's handover.
  3. **The STREAM-severity ledger goes to the owner.** 43 findings, listed in
     `LEDGER.md`, all unverified and labelled as such.
  4. **The total audit's remaining waves** (audio, social-mode capture,
     accessibility, animation timing) schedule on the fresh allowance, per
     `FULL_AUDIT_METHOD.md` section 5.
  5. **TR-104's remaining half is fix-ready**, one line, verified first-hand.
