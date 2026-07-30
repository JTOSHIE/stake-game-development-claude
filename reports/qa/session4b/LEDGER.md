# THE TRUE FIXDOWN LEDGER: all 118, each with one disposition

JOB 4 of `reports/briefs/FS_TRUE_FIXDOWN_Prompt.md`, 2026-07-30.
Row-level data at `DISPOSITIONS.tsv`; full derivations at `waveA_raw.json`.

Australian English, no em dashes or en dashes. "Minor" is not a disposition.

## Before and after, stated plainly

| | Before this session | After |
|---|---|---|
| Findings in the ledger | 118 | 118 |
| **With a cause anybody had checked** | **27** (23 per cent) | **118** (100 per cent) |
| FIXED | 0 | **2** |
| STRUCK, symptom not real at HEAD | 0 | **19** |
| PARKED with a named reason | 0 | **97** |
| Undispositioned | **118** | **0** |

**The 118 is smaller by 21: two fixed and nineteen struck.** 97 remain open, every
one of them now carrying a derived cause, a fix location and a named reason for
not being applied. That is the honest count and it is well short of the fix
volume the brief hoped for; section 6 says which resource ran out.

## The dispositions

| Disposition | Count | What it means |
|---|---|---|
| **FIXED** | 2 | Applied, gated with a seeded self-test, and re-proven from freshly captured evidence |
| **STRUCK** | 19 | Re-derivation found the symptom is NOT real at HEAD, or that there is nothing to fix |
| **PARKED, derived and not applied** | 81 | Cause derived and fix specified; the fix batch closed before reaching them |
| **PARKED, owner decision** | 8 | Re-derivation returned PARK; a design or policy call, not a build call |
| **PARKED, sanction request** | 4 | The fix requires EDITING a locked path |
| **PARKED, larger than small** | 4 | Needs its own surgical brief, per protocol rule 6 |

## FIXED, with proof paths

| Row | Sev | What | Proof |
|---|---|---|---|
| **S2-C020** | STREAM | Q-26, 6 letter-x multiplication signs in `prose.ts` | `multiplication_sign_gate.mjs` (seeded), DOM re-proof at `social_string_conformance_2026-07-30_q26_reproof.json`, commit `fec8d61` |
| **S2-C021** | STREAM | Q-26, 45 more in `prose.locales.ts`; enumeration completed at 51 BEFORE the fix | as above, commit `fec8d61` |

**Also fixed this session, though not one of the 118: MID-01**, the ruled lead of
JOB 3. `WinBanner.svelte` and `HudOverlay.svelte` animated the same `$winAmount`
on two frame loops with two duration rules. Now one shared source in
`stores/winCountUp.ts`, held by `win_countup_sync_gate.mjs` with a seeded
self-test, re-proven from fresh frames at
`reports/screens/mid01-countup-sync-2026-07-30/`. Commit `9ac424b`.

## THE FOUR SANCTION REQUESTS, and there are four rather than three

The brief named three rows at locked paths (S2-C060, S2-C062, S2-C115) and said a
fourth would park the same way. **Re-derivation produced four**, and the set is
not the brief's set: S2-C062 turns out not to need a locked edit, while S2-C061
and S2-C064 do.

**The deny lines to lift**, both from `.claude/settings.json`, for every request below:

```
"Edit(frontend/src/lib/services/rgsService.ts)",
"Write(frontend/src/lib/services/rgsService.ts)",
```

| Row | Sev | The exact change |
|---|---|---|
| **S2-C115** | MEDIUM | **ONE LINE.** Replace `rgsService.ts:525` `const lang = p.get('lang') ?? 'en'` with `const lang = resolveLaunchLocale(p.get('lang'), socialAtBoot, locales)`, importing the existing non-locked authority from `../stores/socialLocale`. The wire value and the screen value become the same function of the URL. No import cycle: the locale module imports gameStore, the social-mode store and the translations module, and none of those imports the RGS service. |
| **S2-C061** | HIGH | **ONE LINE plus two non-locked files.** Immediately after line 735 of the locked service, publish the four limits from the authenticate response (`minBet`, `maxBet`, `stepBet`, `defaultBetLevel`) into a new non-locked limits store, mirroring the already-sanctioned bet-levels passthrough exactly. That store, TO BE CREATED under `frontend/src/lib/stores/`, and the ladder guard, are NOT locked. Exact literal in `waveA_raw.json` under this row. |
| **S2-C064** | HIGH | **THE SAME ONE LINE as S2-C061.** The squad reports identical root and identical fix and recommends the two be merged into one row. Filed separately here because the ledger's row identity is not this session's to change. |
| **S2-C060** | HIGH | **LARGER THAN SMALL, and it is on the money path.** Move the settle out of the spin call so it runs after the presentation, matching `sessionRecovery.ts:262`: delete the `if (needsEndRound)` block at `rgsService.ts:800-803` and return the settle as a deferred closure on `SpinResult`. Protocol rule 4 requires the money path to run in a serial single-job session, so this wants its own brief as well as its own sanction. |

**S2-C062 does NOT need a sanction**, against the brief's premise. Session 3
derived (`JOB4_CAUSE_REDERIVATION.md:203-214`) that `gameStore.ts:7` is not the
artefact that decides what the game offers, so acting there would produce a green
gate over an unchanged submission. It is PARKED as an owner decision, not as a
lock request.

**A defect in a boot document, found on the way.**
`JOB4_CAUSE_REDERIVATION.md` contradicts itself four lines apart: line 49 says
*"One of the 27 needs a lock sanction (S2-C062, gameStore.ts)"* and line 52 says
*"Not one of the 27 needs a lock sanction"*. Line 49 is the operative reading.

## What the re-derivation actually found, and it is the inversion the brief predicted

| Verdict on the RECORDED cause | Count of 92 |
|---|---|
| **NO_CAUSE_STATED**, the row re-quoted its own finding and named no mechanism | **53** |
| PARTIALLY_RIGHT | 24 |
| ACTUALLY_CORRECT | 10 |
| REFUTED | 5 |

**Only 10 of 92 recorded causes were correct as written, 11 per cent**, and 53 of
them never stated a cause at all. Against Session 3's 0 of 27, the combined
figure for the whole 118 is **10 of 119 checked causes**, counting the one row
checked twice.

**The brief's inversion is confirmed.** The 78 plain UPHELD rows were the
unexamined ones, and 17 of the 19 STRUCK rows come from that population: defects
recorded as real that are not real at HEAD. A plain UPHELD was worth less than a
row that admitted its cause was unsound.

## THE CONTROL FAILED, and it failed because I designed it badly

The Plan of Record declared **S2-C045 a blind control**: a row Session 3 had
already derived, seeded into a shard without telling the squad, so that a matching
derivation would corroborate squad quality from independent inputs.

**It did not work.** The squad found `JOB4_CAUSE_REDERIVATION.md` in the
repository, read Session 3's verdict, and said so in its own answer: *"This row
was already re-derived by Session 3 ... I confirm that verdict from source."*
Its agreement therefore SHARES AN INPUT with the thing it was meant to check,
which is exactly what convention (l.4) forbids treating as corroboration.

**The control is VOIDED, not passed.** The squad behaved correctly and declared
what it had read; the design was wrong, because a blind control cannot be seeded
in a repository where the answer is a readable file. A future control needs a row
whose answer exists only outside the tree, or must be run against a shard the
squad cannot trace back to a published derivation.

**So Wave A's quality is UNMEASURED.** Two cautions follow, and they should shape
how the 81 derived-not-applied rows are treated:

1. **All 92 came back DERIVED and not one came back UNKNOWN**, despite the prompt
   stating plainly that UNKNOWN is a complete answer and often the correct one. A
   zero rate across 92 findings is not obviously credible and is the strongest
   available signal that some derivations are thinner than they read.
2. **Two squads reported that no gate was executed** because the pass was
   read-only, so their closure claims rest on reading gate source and CI wiring
   rather than on a green run. Both said so unprompted, which is the behaviour the
   method wants.

**Treat a Wave A derivation as a HYPOTHESIS until reproduction or a second
independent source derivation promotes it**, per `FULL_AUDIT_METHOD.md` 2.7. The
two rows FIXED above were each verified first-hand in the main loop before the
fix landed: the Q-26 enumeration was recounted by this session, and its
instrument control was re-run, before a single character changed.

## Two new findings, neither of them in the 118

- **MID-01b: a THIRD win count-up clock.** `WinDisplay.svelte:50` runs its own
  600ms count-up over the same `$winAmount`. It is not a MID-01 instance:
  `App.svelte:1689` and `:1716` are mutually exclusive branches of one
  `{#if isReplay}` and `WinDisplay` is mounted only by `ReplayMode.svelte:309`, so
  it never renders beside the HUD pod. What is real is a third duration rule for
  one figure on a compliance-mandated surface. Frozen by file in
  `win_countup_sync_gate.mjs` with its reason, so it cannot be forgotten and a
  FOURTH loop still fails. **Found by the new gate's own negative control on its
  first run**, which is what convention (p) predicts.
- **Stale committed evidence at `reports/qa/social_string_conformance_2026-07-14b.json`.**
  It records the paytable MAX WIN text as `5,000x base bet`; a capture of the same
  surface today contains that phrase zero times. The unit words were dropped from
  the paytable at some point after 2026-07-14 and nothing noticed, because the
  gate asserts named checks rather than the text blob it also stores. Not caused
  by this session and not this session's call to rule on.

## Cluster map caveat, carried forward

The 18-surface cluster map at `CLUSTER_MAP.tsv` was built mechanically by primary
file. Per `AGENT_BUDGET_AND_SCHEDULING.md` 4.4 that is a HYPOTHESIS, and squads
were asked to report miscluster. They found real ones:

- **A1 reports S2-C002, S2-C003, S2-C004 and S2-C007 are ONE row**, four
  descriptions of a single fact, and that the repository already treats them as
  one: `replay_contract_gate.mjs:3-6` says the eleven requirements it covers "are
  one gate, not eleven". Carrying them as four inflates the burndown fourfold.
- **A2 reports S2-C084 is misfiled under FAMILY: CURRENCY** and has nothing to do
  with currency, and that its recorded path `REPLAY_TEST_EVENTS.md:72` is a BLANK
  line, with the stale content at `:66-78`. An anchor on a blank line is how a fix
  lands in the wrong place.
- **A2 also reports S2-C028 and S2-C030 are one claim**, closed by one artefact.

These are recorded rather than actioned: merging ledger rows changes finding
identity across three sessions of history, and that is an owner call.
