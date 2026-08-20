# AUDIT CLOSURE, 2026-08-10: the end-state register after the R043 run

Produced by R043 PHASE 7 per `reports/briefs/FS_R043_MEGA_CLOSEOUT_Prompt.md`.
Australian English, no em dashes or en dashes. Every claim below carries its
evidence; anything not first-hand is marked. The run executed on PR #118
(`claude/remote-control-tv30mf`), base `main` at `ce252a8` (after the Phase 0
merge of PR #117), with CI verified green between phases.

## The full rebuild and the whole gate estate, from HEAD

Fresh `npm run build` from a clean tree at `c4347fad`:
**`frontend/dist/build-info.json` reads v10, cleanTree true, 77 files,
12,330,182 bytes** (the kit byte count this phase is asked to record).

**Every gate and headless proof was then run against that build. 71 runs, all
verdicts PASS**, in three groups:

- **Static and unit, 44 of 44 PASS**: locked paths (with self-test), doc
  currency (337 frozen, 0 new, with self-test), kit build self-test, supply
  chain (with self-test), typecheck baseline, dead wiring (with the new
  reachability self-test), wallet floats, currency scale drift, paytable
  parity (with self-test), locale completeness, a11y social terms, dash gate
  (self-test, source and dist), multiplication sign, machine tell (self-test,
  source and dist), evidence hygiene (0 frozen, with self-test), bet ladder,
  responsible gambling, modal guard, live guard, session recovery (including
  the new resync branches), feature resume x2, launch params, rgs parse,
  wallet contract, replay rounds, replay locale, win precision, hardcoded
  strings (with self-test), dist hygiene (clean-tree stamp), kit basis gate
  (with self-test), r043_verify (87 checks, with self-test), numeral pass
  idempotence.
- **Browser gates, 18 of 18 PASS**: layout fit, contrast, splash calm, turbo
  intensity, paytable card fill, scrim coverage, win count-up steady and
  sync, max-win hold, bet selector, preview server, build diet network
  hygiene, replay contract, replay fit, locale prose conformance (self-test
  8/8 and full run, 3,660 rendered strings, zero leaks), autoplay proof
  (r042b), popout conformance (3 viewports, real clicks), social DOM
  conformance (3,162 social strings, 8 surfaces, allPass true).
- **Ruling proofs, 9 of 9 PASS**: r043 replay audio proof (10 assertions plus
  self-test), r043 settle failure proof (17 assertions plus self-test), r042
  wording proof, r041 stall banner proof, recovery banner proof, social
  string conformance (ALL CHECKS PASS).

**Two findings the closure suite itself produced, both actioned in this
phase's commit:**

1. `social_dom_conformance.mjs` and `social_string_conformance.mjs` imported
   `announceEvidenceTarget`, which `evidencePaths.mjs` has never exported, so
   both threw at module load and could not even print FAIL. Same class as the
   `locale_prose_conformance` repair earlier in this run (fresh-context majors
   1 and 58); found only because this suite runs every gate, wired or not.
   Both imports fixed; both gates then ran and PASSED.
2. **A lingering-handle observation, not a failure**: `popout_conformance`,
   `social_dom_conformance` and `social_string_conformance` each print their
   PASS verdict and write their report, then never exit (a server or browser
   handle survives). Verdicts were read from their own output; the processes
   were reaped by hand. Recorded here so the next session wiring any of the
   three into CI knows to fix the exit first.

## The end-state register

### Blockers (fresh-context review 2026-08-10, B1 to B14)

| Item | State | Evidence |
|---|---|---|
| B1 / B10, responsiblePlayBody hardcoded English; the gate blind to it | **CLOSED** (R042 A4) | OWNER_RULINGS section G RULED AND EXECUTED; `r042b_autoplay_proof` re-asserts the paragraph on screen; hardcoded string gate PASS |
| B2 / B3 / B4 / B6 / B11, en-form figures in ten comma-decimal locales | **CLOSED** (R042 A2, extended by R043 1b) | `numeral_locale_pass.mjs --check` PASS; machine_tell en-form scan with the freeze retired; kit basis gate figure half PASS |
| B5, OWNER_RULINGS A1/A2 presented as open after being ruled | **CLOSED** | Both sections carry RULED AND EXECUTED markers (`OWNER_RULINGS_PRESUBMISSION.md:45,84`), verified by direct read this phase |
| B7, max-win basis contradiction | **CLOSED** (R042 A3 + R043 1a) | Basis proven from primary data (audit section 1); `kit_basis_gate.mjs` zero-asserts the superseded phrases in CI |
| B8, one-click autoplay | **CLOSED** (R042 B) | OWNER_RULINGS section L; rewritten gate plus wallet-call proof, both green in this suite |
| B9, silent Bet Replay | **CLOSED** (R043 PHASE 2) | `r043_replay_audio_proof.mjs` 10 assertions; frames and cue trace at `reports/screens/r043-replay-audio/` |
| B12, live settle failure refunds on assumption | **CLOSED** (R043 PHASE 4) | `r043_settle_failure_proof.mjs` 17 assertions; `resyncAfterSpinRejection`; CI browser leg |
| B13, evidence directories dirtied by plain runs | **CLOSED** (R043 PHASES 3b and 4 follow-through) | Evidence ratchet at ZERO (36 writers migrated in all); predicate widened to the identifier-join shape after catching `recovery_banner_proof` rewriting three PNGs live; seeded self-test 5/4 |
| B14, the 45-commit arc with no session reports | **OPEN, honestly** | No evidence in the tree that the missing arc sections were reconstructed; reconstruction is a judgement call for the owner or a dedicated session, not a rider on this run |

### OWNER_RULINGS sections A to L

A1, A2, B, A3(banner), D: RULED AND EXECUTED by R041 (markers in the document).
E, F, G, I, L: RULED AND EXECUTED by R042. **H, J, K: RULED AND EXECUTED by
R043** (markers added this phase). **C (the 400-body field, Q6): OPEN,
OWNER-GATED** (below).

### Fresh-context majors actioned by this run

| Major | Disposition |
|---|---|
| 1, 2, 6 (locale instrument) | **FIXED**: broken import repaired, PART 3 opens the real paytable via the new open-paytable testid, prose.ts names its real guard, gate wired as a CI browser leg |
| 7 (dead wiring liveness) | **FIXED**: reachability from the shipped entry, seeded, in CI; surfaced assetLoadProgress exactly as predicted (allowlisted with citation) and retired the rusted activeRound exemption |
| 8, 9 (games README and game_calculation.py stale) | **RECORDED as LOCKED_FILE_DEBTS** (both VERIFIED first-hand; the embedded self-test crash reproduced); ride the next sanctioned maths pass |
| 10 (PAR scatter line) | Already recorded in LOCKED_FILE_DEBTS with the owner ruling; unchanged |
| 11 (GAME_FACTS scatter claim) | **FIXED**: per-mode truth with citations (base/cruise/antelite 0, bonus 2, super 2 six-scatter rounds per 100,000; award identical to five) |
| 12, 13 (Overdrive rules block) | **FIXED** (R043 1c, 1d), pinned by `r043_verify` |
| 17, 18 (self-assessment rows) | **FIXED**: item 32 states the both-levels cap truth its own cited gate states; items 23 and 24 no longer cite closed defects |
| 19 (doc_currency structural limit) | **RECORDED as TR-122** with the predicate gap named |

The remaining fresh-context majors (the seventy-major triage) were NOT in this
brief's scope and stay open in the review tracker.

### The Fable audit items

AF-1 (RTP precision wording), AF-2 (tracker currency), AF-3 (kit-size record),
AF-4 (zero-egress positive): all **dispositioned by PR #117** as rows TR-118
to TR-121, merged at Phase 0. Nothing this run did reopened any of them; the
fresh kit figure recorded here (12,330,182 bytes) supersedes TR-120's dated
12,328,647 as the current build's figure, both being dated facts.

### Q6 (the RGS 400 body field)

**CLOSED 2026-08-20 by R073, on a capture the OWNER took against the live wallet.** The
body is committed verbatim, with the session redacted and nothing else altered, at
`docs/stake-engine-live/captures/wallet-play-400_2026-08-20.md`:

```json
{"error":"ERR_VAL","message":"invalid amount"}
```

HTTP 400, provoked by an amount of 10,000,000,000 micros against a live ceiling of
1,000,000,000, so it was ten times the top of the ladder and **no wager was placed**.

**It confirms the top-level error-field dialect the R045 reader was built for**, which is
the claim `frontend/scripts/r045_error_field_proof.mjs` states in its own header: the
platform answers wallet errors with the identifier in top-level `error`, while
`handleRGSError` originally read only top-level `code`. This is the first captured
artefact behind the half that reader was widened for, and `ERR_VAL` corroborates the value
`money_fit_gate` stubs at the ladder boundary.

**Everything below is the record of what was open and why, kept unedited**, because the
account of a thing that could not be settled from this repository at all is worth reading
beside the one paste that settled it.

**OPEN, OWNER-GATED, and the run attempted it.** The R043 paste supplied
`https://stake-engine.com/teams/we-roll-spinners/games/future-spinner/files?launch=true&...`,
which is the PORTAL address: fetched from this environment it serves a
client-rendered shell with no session material, and the portal mints
sessions only behind the owner's login (verified by fetch, 10,364 bytes, no
sessionID, no rgs_url). `tools/capture_rgs_400.sh` requires the
session-bearing GAME url (the address carrying `sessionID=` and `rgs_url=`
that exists once the game is actually launched in the owner's browser). The
scaffold stays armed; the ask to the owner is one paste of that url.

**RE-OPENED HONESTLY, NOT RE-PROVED. Recorded 2026-08-15 by R071 TASK 8, which was asked to
do one or the other and could not do the first.** Re-checked at HEAD on 2026-08-15:
`tools/capture_rgs_400.sh` is still present and still armed, and no capture of a 400 body
exists anywhere in the repository. **What is missing is named precisely, so nobody spends
another session discovering it:** the scaffold needs the SESSION-BEARING GAME url, the
address carrying `sessionID=` and `rgs_url=` that only exists once the game has actually
been launched in the owner's own logged-in browser. The portal address is not it and cannot
be made into it, because the portal mints sessions only behind the login and serves a
client-rendered shell to anything else.

**This is not a repository question and no amount of builder work will close it.** It is one
paste, and until it arrives the honest state is UNKNOWN rather than open-and-being-worked.
Recorded that way deliberately: an owner-gated item sitting in a work queue reads as
somebody's outstanding task, and this one is nobody's until the url exists.

### Phase dispositions for the run itself

| Phase | State | CI |
|---|---|---|
| 0, preconditions | DONE: PR #117 merged on green, COMMS-ACK 045 closed, rebase on `ce252a8` | run 31386799363 green |
| 1, wording close-out | DONE | run 31390508700 green, all 16 checks |
| 2, replay audio (B9) | DONE | run 31391988157 green |
| 3, hygiene cluster | DONE | run 31393766620 green |
| 4, settle failure (B12) + ratchet follow-through | DONE | run 31395417437 green, 18 checks including both new legs |
| 5, Q6 capture | ATTEMPTED, OWNER-GATED (above) | n/a |
| 6, mirror refresh | DONE: 66 of 66 pages rendered, 61 of 64 shared pages byte-identical, three deltas logged with two STOP flags | run 31402346574 green (shared push with phase 7) |
| 7, closure audit | THIS DOCUMENT | run 31402346574 green, head `22d0599`, 18 of 18 checks success |

### The platform requirements matrix

Updated as a dated addendum to
`reports/qa/compliance_register/REGISTER.md`: REQ-095 (replay audio) moves to
SATISFIED with the Phase 2 proof; REQ-112/130 now cover the FAILURE mode with
the Phase 4 proof; REQ-113 doubles as the mid-session recovery surface; and
every maths-verification row is flagged as citing a SUPERSEDED capture,
because the platform rewrote that page (below). The full 193-requirement
re-walk (fresh-context major 54: 26 NOT_MET, 70 NO_PROOF at the 2026-07-29
walk) remains open and is Fable-round work, not a rider on this run.

## STOP items recorded for the owner and Fable (not actioned)

1. **The platform rewrote `approval_guidelines/math-verification`** (Phase 6
   delta, COMPLIANCE_WATCH 2026-08-10 entry): published Critical Tests,
   bet-level template caps ($500,000 bet cost, $50,000,000 potential payout,
   RGS 400 beyond), and per-rating CVaR and tail figures. First-look
   derivation says every critical test is met by the shipped package; the
   CVaR computation against the now-published definition is Fable's to run
   (convention l.8), and it resolves the long-open CVaR ambiguity of FABLE
   COMMS 001.
2. **The platform terms counterparty changed** from Carrot Gaming Pty Ltd
   (Australia) to Medium Rare N.V. (Curacao), published Jul 30 2026. An
   owner-facing contractual change; nothing in the repository turns on it.

## Everything still open, honestly

- **Owner items**: Q6 launch-url paste (above); the terms counterparty review
  (STOP 2); the Provably Fair toggle and the other OWNER_CHECKLIST items;
  the eight unsigned owner-park proposals (fresh-context majors 20, 57).
- **Fable-round items**: the CVaR computation against the published
  definition (STOP 1); re-enumeration of the maths-verification requirement
  rows against the 2026-08-10 capture; the full requirements re-walk; the
  seventy-major triage beyond the thirteen actioned here.
- **Recorded debts riding sanctioned passes**: the LOCKED_FILE_DEBTS list in
  CLAUDE.md (now including games README and game_calculation.py);
  TYPOGRAPHIC_APOSTROPHE_PASS (post-approval); the three lingering-handle
  gates (observation 2 above); B14's missing report arc.
- **Two DTT observations carried from Phase 4** (recorded in
  sessionRecovery.ts): end-round behaviour on an already-settled session, and
  the third-authenticate-in-one-page-life case.
- **No phase was reverted.** No locked path was written; the conditional
  Phase 4 sanction was not triggered and `.claude/settings.json` was never
  lifted (its diff was empty at every commit, verified by the locked-paths
  gate on every push).

## FOR THE NEXT SESSION

**Next is the Fable verification round against the submission candidate**: PR
#118 carries the whole R043 run for Fable's independent verification and the
merge decision; the two STOP items above are its first agenda entries, the
CVaR computation now being plain arithmetic against a published definition.
