# SESSION 8 RESUME LEDGER

One line per commit, appended as each lands. Protocol rule 13 makes an honest stop lawful
only at a boundary, and a gate session has no waves, so the commit is the boundary. A
session picking this up mid-flight reads the last line and continues from there.

Session: FS_GATE_TIER, `reports/briefs/FS_GATE_TIER_Prompt.md`.
Base HEAD: `8e2bd1a`, main, 2026-08-04.

Scope: the 19 rows of tier `gate_or_ci`, verdict `STILL_OPEN`, in
`reports/qa/session7/RECONCILED.tsv`. Fixed before the session began and not extended.

Format: `<sha>  <row ids or scope>  <what landed>  <proof>  <main loop context at commit>`

---

`370b2f1`  session setup  Brief saved verbatim to `reports/briefs/FS_GATE_TIER_Prompt.md`; this ledger opened.  Proof: 19 rows at tier `gate_or_ci` and verdict `STILL_OPEN` re-counted by awk over `reports/qa/session7/RECONCILED.tsv`, matching the brief's provenance.  Main loop about 60k.

`(no commit)`  JOB 1, all 19 rows  Six shared-nothing reconnaissance agents, one cluster each, read-only, notes under a scratch path and not committed. 6 of 6 returned, 0 errors, about 796k of agent tokens.  Proof: every cluster returned quoted source read at HEAD; the predicate verdicts are recorded per row and drove the job order below. **Only 4 of 19 rows came back canPredicateSeeDefect=YES.**  Main loop about 150k.

`aa5f6ff`  S2-C008, S2-C009 (JOB 2, both STREAM)  Opt-in `keys` leg in `driveReplay`, money-path predicate extracted as `assertNoMoneyPath`, new keyboard drive judged by it alone; `vocabulary.ts` currency rationale corrected and `replay_contract_gate.mjs` named as the proving instrument.  Proof: `SEEDS: 9/9 caught, 0 missed, 0 unapplied` with `caught SEED keypress-puts-money-on-the-wire` (tally was 8/8 before); plain run `21/21 assertions passed` with `pass [keyboard] no authenticated RGS call in replay`. The row's OWN specified seed was impossible and is replaced with an observation-boundary seed, reasons in the commit.  Main loop about 200k.

`31dfbfa`  S2-C044, S2-C080, S2-C052 in part (JOB 4)  Build stamp asserted against HEAD and cleanTree with four seeds; `generated` literal replaced by a run-derived value plus `measuredAt`; dev-hook scan for `__telemetry` and `mockCurrency` with seeds.  Proof: S2-C044 went RED on the real tree with NO seed (stamp 8e2bd1a against HEAD 370b2f1); S2-C052 proved RED END TO END by hoisting the real line and running a real build (`__telemetry` 0 to 1, gate named the file), source restored to 0 pending changes; then GREEN after a clean rebuild, `DIST HYGIENE: PASS`. Two halves of S2-C052 REFUSED with measurements: `setTelemetrySink` is unscannable because esbuild renames it, and the origin clause would be permanently red. S2-C118 not started.  Main loop about 225k.
