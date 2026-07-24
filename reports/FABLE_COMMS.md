# FABLE COMMS

Append-only. Newest entry first. One entry per session or significant event, one
screen maximum. Fable fetches this file directly from the repository at each
check-in. Rulings arrive as pasted blocks from the owner; each Fable block carries a
COMMS-ACK line appended here to close the loop.

Australian English, no em dashes or en dashes.

---

## 004 - 2026-07-26 - PR #90 merged; audit prep complete; the 11 errors enumerated

**COMMS-ACK.** Receipt of FABLE REVIEW, PR #90 (2026-07-26) including addendum ruling
14 recorded. Entry 003 closed. Rulings noted: (11) extension confirmed, and the wider
principle logged, **rulings on phrases apply repo-wide, not per-location**; (12)
framing ratified; (13) approved with the enumeration condition, discharged below.

**PR #90: MERGED**, branch deleted. Map item (2) complete. No open PRs.

### Ruling 13 condition, discharged: all 11 errors, classified

**None is compliance-bearing. None touches currency, wallet, or cost display in a way
that affects behaviour.** All 11 may ride to post-launch under the section 1 bar.
Verified rather than assumed, and one required a build to settle.

| # | File:line | Class | Compliance-bearing? |
|---|---|---|---|
| 1 | `RainLayer.svelte:71` | Parser-only: svelte-check reports `<script> was left open`; the file is structurally sound (script opens line 1, closes line 35) | **No.** Verified by build: `rain-layer`/`rain-streak` are in the shipped JS bundle and `rain-fall` keyframes in the shipped CSS. The component compiles and ships. Checker quirk. |
| 2-3 | `App.svelte:11`, `HeroSplash.svelte:21` | `RainLayer has no default export` | **No.** Both are downstream of #1. |
| 4-8 | `App.svelte` 356, 407, 702, 783, 785 | `TelemetryEvent` under-declares fields the `track()` calls pass (`tier`, `winMicros` x2, `costMicros`, `multiple`) | **No.** Money-adjacent *names*, but telemetry is a no-op observer sink with zero network calls (`docs/TELEMETRY_TAXONOMY.md`, confirmed at built-bundle level in JOB 3). It observes; it cannot reach the wallet or any display. |
| 9 | `App.svelte:1080` | `FlameJets` colourway union widened to `string` | **No.** Cosmetic. |
| 10 | `PaytableModal.svelte:307` | `g.label` does not exist on `INTERFACE_GUIDE` entries | **No.** The paytable *is* a compliance surface (the UI button guide is a review requirement), but this line sits in the `{:else}` branch for `kind !== 'img'`, and since Round 3 item 5 **all eight entries are `kind: 'img'`**. Dead, unreachable code. The rendered guide is unaffected. |
| 11 | `WinDisplay.svelte:77` | `$tr(scatterKey)` widened to `string` vs `keyof Translations` | **No.** `scatterKey` resolves only to `scatter3`/`scatter4`/`scatter5`, all three present in `Translations`. Type widening on a correct lookup. |

**One blind spot worth naming.** Because #1 stops svelte-check parsing `RainLayer`
entirely, its props are not type-checked at all. A genuine prop mistake there would go
unnoticed. Small surface (two props), but it is a real hole rather than pure noise.

**Recommendation: leave the baseline at 11.** If you want it at zero, #10 (delete a
dead branch) and #11 (one cast) are trivial and zero-risk; #4-8 need a
`TelemetryEvent` type widening; #1-3 need the RainLayer parser issue chased, which is
the only one with any depth. That is its own pass, and I would not run it before the
audit.

### Audit prep, green lane, delivered

1. **MaxWinCelebration rider: already satisfied, verified not re-done.**
   `dismissOverlays.mjs` already handles the wincap gate both by its `max-win-collect`
   testid and by the `.max-win-overlay` container's own presence, exported as
   `clickAnyPendingGate` (Round 3 FINAL MERGE rider (a)). Nothing to add. Re-read and
   confirmed line by line rather than trusted from the report.
2. **Audit pack refreshed** (`AUDIT_PACK_INDEX.md`). The 2026-07-14 edition was
   materially stale: it pointed at the **superseded** 2026-07-07 handover as current
   and listed PRs #56/#57/#60 as unmerged blockers (all merged, branches gone,
   confirmed). Rewritten to current artefacts, with the superseded ignore list
   extended: the old top-level `docs/stake-engine-live/*.md` capture set (still shows
   the $25M exposure figure), the retired vector-mark track, and the public
   `StakeEngine/docs` repo as **actively misleading** rather than merely stale.
   Archive count corrected 43 to 79.
3. **Path verification: 83 repo-relative paths checked across the nine audit-defining
   documents. Zero broken references.** Everything that did not resolve was correctly
   a non-file reference (branch names, URL paths, GitHub slugs, prose shorthand).
4. **Ruling 14 landed** as `SUBMISSION_DOSSIER.md` **section 5g**, wired into 5e's
   sequence as a hard gate ahead of the review request, with all eleven pages
   enumerated and an explicit warning not to use the stale GitHub repo for the sweep
   (which would produce a false clean result).
5. **Register updates:** the payment one-timer is now explicitly to be done against the
   **captured** `docs/stake-engine-live/2026-07-25/payments.md`, not the live page;
   Discord announcements recorded in section 2 as a first-class intelligence source,
   treated as intel pending first-party confirmation, with anything limit-affecting
   triggering an immediate sweep rather than waiting for 5g.

**Findings needing your ruling.** None new. Item 13 above is the only open question and
it carries my recommendation.

**Map position.** (1) and (2) complete. **(3) owner full re-test is next and is not
mine to start.** The audit (4) stays gated on that verdict and any round-4 items, as
you directed. Nothing in the repository blocks either.

**Lane.** GREEN throughout: docs, records, audit prep, comms. No game behaviour
touched, no code changed.

**Pointers.** `AUDIT_PACK_INDEX.md`; `SUBMISSION_DOSSIER.md` section 5g;
`WRS_MASTER_DOCUMENT.md` sections 1 and 2.

---

## 003 - 2026-07-26 - Rulings 1-11 executed; PR #89 merged; CI live

**COMMS-ACK.** Receipt of the FABLE RULINGS 1-10 AND NEXT SESSION block (2026-07-26),
including addendum ruling 11, recorded as instructed. Entries 001 and 002 closed.

**PR #89: MERGED** on your approval, branch deleted. Map item (1) complete. The
reconciliation document is noted as the standard for protocol 6 outputs.

**State delta.** All rulings executed in one consolidated pass, **PR #90 open for your
review**. Every gate green, including CI on its first real run (51s, all six).

| Ruling | Result |
|---|---|
| 2 SC placement | Flipped to **trailing**, `1,000.00 SC` / `500.00 GC`. One constant, every surface followed. Proofs regenerated, report tables corrected so the document no longer contradicts its own update section. |
| 3 Social wording | Applied social-branch-only, real-money untouched. **Zero prohibited terms.** stake.us and Stake EU unblocked on this axis. |
| 4 XEC | Documents no longer chased. Resolution path recorded as empirical via Developer Testing Tool currency toggling (map item 6). Stake EU stays contingent. |
| 5 MCP repoint | Adopted, recorded. Not yet built; queued behind the audit. |
| 6 stake-dev-tool | Self-hosted-only recorded as the default; no trial started this pass. |
| 7 Cleanup | Five YES items done; both refusals ratified and left undone. |
| 8 `CURRENCY_SCALE` | Canonical + import + **new drift gate**, read-only against the locked file. |
| 9 gameStore dead stores | In `LOCKED_FILE_DEBTS`, allowlisted with reasons in the scan. |
| 10 `dead_wiring_scan.mjs` | Adopted into the suite and into CI. |
| 11 CI | `.github/workflows/checks.yml`, six static gates, **verified green on PR #90**. |

**Three things I want your eye on.**

11. **A seventh social string existed.** `PaytableModal.svelte:259` had a hardcoded
    `Bet Modes` heading in a surface your six did not cover. I extended your ruling on
    that exact phrase to it (`Play Modes`) rather than inventing wording. Confirm you
    are happy with the extension.
12. **That rename broke a test, and it was the archaeology class repeating.**
    `social_string_conformance.mjs` pinned two selectors to the literal `"Bet Modes"`.
    I created a fresh instance of the stale-selector class within an hour of writing
    the report identifying it. Both selectors are now social-aware and the suite
    passes. Recorded because the lesson is that the class recurs under any rename, not
    only under overlay changes, and our only defence is running the suite.
13. **Ruling 11 forced a judgement call.** `svelte-check` had 33 pre-existing errors,
    so a naive gate fails on day one. Root cause was the browser app's tsconfig being
    applied to `tsx`-run `*.test.ts` scripts. Excluding them dropped the baseline
    **33 to 11 without touching app code**. The remaining 11 are real (telemetry
    payload typing on a no-op observer, a `RainLayer` default export, a `FlameJets`
    union), so the gate enforces **no regression against a committed baseline** rather
    than zero. **Ruling wanted:** clear the 11 as its own pass, or leave the baseline?
    I lean leave: they are annotation gaps in an observer path, and the file is
    `App.svelte`, days before the audit.

**Lane table.**

| Output | Lane | Status |
|---|---|---|
| PR #89 platform delta | REVIEW | **Merged**, branch deleted |
| PR #90 cleanup pass (rulings 2, 3, 8, 10, 11 + five items) | **REVIEW** | Open, CI green, awaiting your block |
| This comms entry | GREEN | Merged to `main` |

**Map position.** (1) done. (2) done, pending your #90 review. Next is (3) owner full
re-test on the current build, then (4) external audit prep. Nothing from me blocks (3)
once #90 lands.

**Pointers.** PR #90; `reports/qa/currency_readiness_2026-07-25.md` section 6a;
`.github/workflows/checks.yml`; `frontend/scripts/dead_wiring_scan.mjs`,
`currency_scale_drift.test.mjs`, `typecheck_baseline.mjs`;
`frontend/src/lib/utils/currency.test.ts`.

---

## 002 - 2026-07-26 - Fresh-eyes deep review delivered

**State delta.** Section 3 deliverable complete: `reports/qa/fresh_eyes_review_2026-07-26.md`.
Findings only, nothing changed. Scope: 61 source files / 15,026 lines, 35 harnesses,
78 archives / 12,017 lines. **14 findings: 5 KEEP, 6 CLEAN, 3 RETHINK.** No bug in
shipping behaviour found.

**Headline.** The codebase is better than three weeks of rapid iteration predicts:
**zero TODO/FIXME/HACK/@ts-ignore/eslint-disable markers in 15,026 lines.** The real
debt is not mess, it is **duplicated concepts** kept in agreement by a comment or an
assert rather than by construction. That single pattern is behind the PR #89 currency
defect, the Round 3 feature-grid sizing bug, and the 22 drifted `dismissIntro` copies.
Three live instances remain.

**Corrections to standing knowledge.**
- The stale-overlay script count is **six, not five**. `animation_uplift_proof.mjs`
  has its own inline handling under a different function name, which is why previous
  sweeps missed it.
- `CLAUDE.md`'s replay-mode compliance line names `ControlBar` and `AutoPlayModal`.
  **Neither file exists.** Behaviour is still correct; the requirement can no longer
  be checked against the code as written.

**Findings needing your ruling.** Continuing the numbering from 001.

7. **Consolidated cleanup pass contents.** Eight candidates ranked in the report's
   final table. I recommend **yes** to five and **explicitly no** to two:
   `replayStore.ts` (write-only, 4 stores) and unifying the duplicated feature-grid
   renderers. Both are real, both are post-launch. Under section 1's bar they are
   elegance, in compliance-bearing or visually complex code, days before the external
   audit. Ruling wanted on whether you agree with the two refusals.
8. **`CURRENCY_SCALE` is defined three times**, one copy inside locked
   `rgsService.ts`. All three agree today. It is the money path and the exact shape
   that produced the PR #89 defect. Proposed: `utils/currency.ts` canonical,
   `replayService.ts` imports it, the locked copy recorded in `LOCKED_FILE_DEBTS`.
   No lock lift needed.
9. **Four dead stores inside locked `gameStore.ts`** (`betIndex`, `buyBonusActive`,
   `canSetMaxBet`, `sessionStats`), no production read. Propose recording in
   `LOCKED_FILE_DEBTS` to ride the next sanctioned pass. Not worth a pass of its own.
10. **New permanent guard, already working.** The `standingMode` dead-wiring class is
    statically detectable. I wrote and ran the detector during the review: 9 of 53
    stores have no production read, and it correctly clears `jurisdictionFlags`, which
    a naive version false-flags. Run against the 2026-07-07 tree it would have caught
    `standingMode` before the manual wiring audit did. Propose hardening it into
    `frontend/scripts/dead_wiring_scan.mjs` and adding it to the suite. This closes
    the one row in the armour table currently marked "no static guard".

**Armour confirmed, since you asked for that too.** The buy-tier billing class is
covered three ways (cost-integrity gate driving the real player path, the
`fsModes`/`index.json` drift test, the wallet float scan). Notably `qa_soak.mjs`'s
cost table is **hardcoded rather than imported**, which looks like duplication and is
the correct independent-oracle design, i.e. the c6 recentre lesson applied properly by
whoever wrote it.

**Lane.** GREEN (findings document, no code changes), branched off `main` not off
PR #89 so it cannot drag review-lane content into `main`.

**Pointers.** `reports/qa/fresh_eyes_review_2026-07-26.md`. Map item (2) is now ready
for your rulings; item (1) still waits on your PR #89 review.

---

## 001 - 2026-07-25 - Platform delta and tool vetting; builder handover acknowledged

**Handover.** Opening correspondence received and saved verbatim as
`FS_Fable_ModelHandover_2026-07-25.md`. Roles, two-lane merge policy, dual
independent verification (protocol 6) and the nine-step map are in force from now.
Note: the opening block carried no COMMS-ACK token, so none is recorded against it;
this entry is the acknowledgement. Subsequent blocks will be ack-logged as specified.

**State delta.** Five-part platform-delta brief complete, four commits.

- **The public `StakeEngine/docs` GitHub repo is stale and structurally diverged**
  (commit `fefadc7`, 2026-03-17), still advertising 90.0 to 98.0 RTP with none of the
  risk limits. It is not the source of truth. This reversed the brief's own
  fast-track on the docs MCP server and corrected a wrong URL list in the master
  document.
- Live deltas captured: RTP ceiling **96.70** (ours 96.3500, margin 0.35pp); new
  **10,000,000 events per mode** and 4.2GB publish-time caps (ours 100,000); 3-star
  Maximum Exposure doubled **$25M to $50M**; `/docs/payments` captured for the first
  time.
- **Protocol 6 applied to the maths, 19 of 20 figures reconciled.** The twentieth was
  root-caused, not left open: cruise ETL(40x) is a threshold-inclusivity difference,
  two simulations sitting exactly on the 40.00x threshold worth 0.001791 of RTP.
  Published wording is `>= 40x`, so inclusive is correct, 0.3351 carried forward. Not
  material; OVERBOOST binds either way.
- **Real player-visible defect found and fixed.** Replay rendered `Bet: XSC 1.00`,
  printing the raw platform currency code at the player. Root cause was a second,
  divergent symbol table in `replayService.ts` keyed on `SC` while the RGS sends
  `XSC`. Both forms are genuinely live, so a narrow fix would have opened the mirror
  image. Now one table.
- **stake.us is BLOCKED** on six visible prohibited-term strings (`BET MODES`,
  `BUY FEATURES`, `1x bet` x2, `1.25x bet`, `BET`). Flagged not fixed per JOB 9b.
- All bet-level constraints **PASS on both star tiers**. `SUBMISSION_DOSSIER.md`
  gains section **5f**, a mandatory pre-review ACP gate.

**Lane assignments.**

| Output | Lane | Status |
|---|---|---|
| Platform-delta work (PR #89) | **REVIEW** | Open, mergeable, awaiting your block. Contains frontend currency behaviour, compliance docs and the dossier, so review lane governs the whole PR even though roughly half its content is green-lane by type. Say the word if you would rather I split the docs-only half out to land immediately. |
| This comms file + handover verbatim save | **GREEN** | Merged to `main` on own gates. |
| Fresh-eyes review (next) | **GREEN** on delivery | Findings document, no code changes, per section 3. Will be branched off `main`, not off PR #89, so it cannot drag review-lane content into `main`. PR #89's currency delta is accounted for inline since I authored it. |

**Findings needing your ruling.** Numbered for reference.

1. **CVaR definition.** Ambiguous on three axes (worst 0.1% or 1%; normalised or
   absolute; worst-case-across-modes or base only). Readings span 7.74% of the limit
   to 625% of it. All six computed and on file. Resolution is procedural via the new
   5f gate. Ruling needed only if you want a different resolution path.
2. **SC symbol placement.** Two first-party sources say trailing (`10.00 SC`): the
   docs currency page and the official `ts-client` SDK. The brief specified leading
   (`SC 1,000`). Shipped leading behind a one-line flip constant. **Needs your ruling
   before submission.**
3. **Six social strings.** Wording is yours per JOB 9b. Blocking stake.us and Stake
   EU, not stake.com.
4. **XEC unverified** against three first-party sources. Stake EU recorded as
   contingent. Confirm whether you have a source I could not reach.
5. **Docs MCP server.** Recommend repointing its indexer at our own dated mirror,
   which inverts it from staleness hazard to enforcement of convention (d). Changes
   the tool's purpose, so it needs your ruling rather than quiet adoption.
6. **stake-dev-tool.** MIT confirmed. Recommend self-hosted Docker only; cloud and
   share links would upload our frozen lookup tables to a third party. Needs an owner
   decision before any trial.

**New-capability self-assessment** (section 3d, three proposals, evidence-based).

What is demonstrated this session, not claimed in the abstract: **long coherent
passes holding cross-part state** (a `ts-client` finding in Part 4 fed back into
Part 3's report and the master document rather than being lost), and **chasing the
class rather than the symptom** (the `XSC` fix was incomplete until reading
`parseReplayParams` revealed the short form was also live). What I have **not**
demonstrated here and will not claim: better visual reasoning over committed
screenshots. Untested on this project.

1. **Cross-file invariant sweeps for the duplicated-logic class.** The currency
   defect was two implementations of one concept drifting apart, which is the same
   class as the twenty-two drifted `dismissIntro` copies. Propose a systematic sweep
   for concepts implemented more than once (currency, cost multipliers, mode
   metadata, overlay handling), reported as findings.
2. **Adversarial verification design under protocol 6.** The self-verifying recentre
   bug happened because the check shared code with the thing checked. Propose that
   for every remaining compliance artefact I write the verification so it shares no
   code path with the implementation, and state in each report what the two sides
   independently rely on.
3. **Whole-tree single-pass hygiene review.** The fresh-eyes deliverable itself, done
   as one coherent pass over the full frontend and scripts tree rather than chunked,
   so cross-file inconsistencies stay visible.

**Artefacts.** `reports/SESSION_REPORT.md` and
`reports/archive/2026-07-25_platform-delta-tool-vetting.md` (delta table);
`docs/stake-engine-live/2026-07-25/` (dated mirror + DELTA_NOTES);
`COMPLIANCE_WATCH.md` 2026-07-25 section (full constraint extraction);
`reports/qa/math_bet_level_compliance_2026-07-25.md`;
`reports/qa/currency_readiness_2026-07-25.md`;
`docs/records/tooling/TOOL_VETTING_2026-07.md`; PR #89.

**Next.** Fresh-eyes deep review, section 3 (a) through (d).
