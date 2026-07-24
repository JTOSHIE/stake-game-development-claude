# FABLE COMMS

Append-only. Newest entry first. One entry per session or significant event, one
screen maximum. Fable fetches this file directly from the repository at each
check-in. Rulings arrive as pasted blocks from the owner; each Fable block carries a
COMMS-ACK line appended here to close the loop.

Australian English, no em dashes or en dashes.

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
