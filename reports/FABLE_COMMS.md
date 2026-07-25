# FABLE COMMS

Append-only. Newest entry first. One entry per session or significant event, one
screen maximum. Fable fetches this file directly from the repository at each
check-in. Rulings arrive as pasted blocks from the owner; each Fable block carries a
COMMS-ACK line appended here to close the loop.

Australian English, no em dashes or en dashes.

---

## 010 - 2026-07-25 - Wave 2 opened: TR-020a closed on evidence, one currency question needs a ruling

**Ruling 23 executed, and the answer was the opposite of the theory.** Instrumenting
`setOverdriveBed()` refuted the early-return hypothesis outright: on a real bought
feature the counters read `crossfadeToTension` 0 to 1 and `crossfadeToBase` 0 to 1,
`earlyReturnMuted` 0, and `bgm_tension` genuinely plays. The crossfade was correct the
whole time. All three red checks were harness faults, two of them the same mistake: a
`?mockCategory` pinned for the real spin also governed the buy (so the buy served a base
round and there was no feature to swap for), and the seam check appended asset paths
after the query string, so it decoded `index.html` rather than audio for a fortnight.
`AUDIO VERIFY: ALL CHECKS PASS`, 8 of 8, three consecutive runs. PR #98.

Two of my own hypotheses, a click race and an affordability edge, were wrong, and one
had already reached a code comment as the root cause. The instrumentation is what
caught it before commit. That is convention (l) doing its job.

**R4 delivered bar one part.** A finding worth naming: 14 hardcoded `aria-label`s carried
the restricted phrase "bet". No existing check could see them, because the visible-text
sweep reads rendered DOM text and screen-reader text is not rendered DOM text. In
practice a blind player in a social jurisdiction heard the exact vocabulary a sighted
player was protected from. Fixed at the source (three translated keys x 16 locales plus
SOCIAL_OVERRIDES), proven at runtime, and held by a new CI gate. Also fixed: replay
derived social mode from the `social` flag alone, so `currency=XSC` with no flag rendered
real-money vocabulary beside an SC balance.

**DECISION REQUEST, one numbered item.**

1. **XEC. Implement on review 1's word, or hold?** Review 1 marks XEC absent as a FAIL and
   asserts current jurisdiction requirements treat XGC, XSC and XEC as social currencies.
   It cites no first-party source. Three first-party sources have none: the live `/docs`
   routes, `/docs/reference/currencies` (XGC and XSC only), and the official
   StakeEngine/ts-client SDK `Currency` union. Our own scrape of the
   jurisdiction-requirements page found the prohibited-terms table and social mode only,
   no currency codes at all. The standing recommendation, quoted, is "do not record XEC as
   a supported code anywhere in the register until a first-party source is produced".
   Implementing it means inventing a symbol mapping, which convention (l) forbids, so I
   have parked it as TR-012b rather than guessing.
   **Options:** (a) hold until a first-party source appears, current position;
   (b) resolve empirically by toggling currencies in the Developer Testing Tool at
   staging, already recorded as comms map item 6; (c) implement XEC to SC defensively,
   cheap, but records an unverified code as fact. **Recommend (b), then (a) meanwhile.**

**Artefacts.** PR #98; `reports/qa/audio_verify_2026-07-13.json` (green, 8 of 8);
`reports/qa/a11y_social_proof_2026-07-25.json`; `frontend/scripts/a11y_social_terms_check.mjs`;
tracker rows TR-020a MERGED, TR-012 MERGED, TR-012a and TR-012b opened.

**Note for the record.** Briefs are dated 2026-07-27 and 2026-07-28; actual commit and run
dates are 2026-07-25. New comments carry the verifiable run date. Which is authoritative
is worth one line in the next ruling block.

**Next.** R5 bet levels, R7 RG enforcement, R8 modal affordability, completing wave 2.

---

## 009 - 2026-07-28 - Rulings executed: books resolved by design, FAIR captured, one lock conflict named

**COMMS-ACK.** Rulings of 2026-07-28 received and executed. Entry 008 closed.

**RULING 1, books.** LFS rejected, books stay out of the public repository.
`BOOKS_MANIFEST.md` created as the public fingerprint of the private set, and
`SUBMISSION_DOSSIER.md` 5c reworded around an explicit two-set table with the manifest
as the bridge. TR-023 closed **RESOLVED BY DESIGN**, TR-024 **FIXED**.

Verified while building the manifest, all computed not assumed: every book holds exactly
**100,000 rows**, matching its lookup table; the mode set matches `index.json`; and **all
five SHA-256 values are byte-identical to those already in dossier 5c**. The dossier's
hash record was always correct. Only its sentence was wrong, which is precisely how three
reviewers cloned the repo and one raised a BLOCKER. Row-by-row payout equality is stated
in the manifest as **not yet proven**, and remains R3's work.

**RULING 2, antelite: ACCEPTED BY DESIGN.** Closed. **But it could not be recorded where
you asked.**

31. **The PAR sheet is inside a locked path and the ruling named no deny lines to lift.**
    `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md` is covered by
    `Edit(games/future_spinner/**)` and `Write(games/future_spinner/**)`. Convention (e)
    requires a sanctioning brief to name the exact deny lines; this one did not, and
    routing around a deny via Bash is explicitly forbidden. So I did not edit it.
    The same content is recorded in `COMPLIANCE_WATCH.md` under 2026-07-28, flagged to
    move into the PAR on the next sanctioned locked pass. **Ruling wanted:** accept the
    compliance-register location, or issue a lift naming
    `Edit(games/future_spinner/**)` for this single line.

**RULING 3, art contradiction: SCHEDULED.** TR-027 closed as ruled, with R1's bar
governing and the targeted cohesion pass recorded in three parts.
`feature/cohesion-pass` to be sequenced with `feature/scatter-anticipation` after
Wave 3. Not branched yet, per the execution order.

**RULING 4, FAIR API: captured.** `docs/stake-engine-live/2026-07-28/fair-catalogue.md`,
with the schema and a verbatim excerpt. `COMPLIANCE_WATCH.md` records that our maths
package is its data source and **no additional work is owed**.

Two things the capture told us that are worth knowing, both computed from the payload:

- **Our `weight_range` is conventional.** Published games cluster at `1.1259e15` (2^50),
  exactly where our per-mode totals sit.
- **Our 100,000 events per mode is at the LOW end of the published field.** Others run
  1M to 10M; Obey The Reptillians sits at exactly 10,000,000, the platform cap. We are
  compliant, on the stated 100,000 minimum, but it is publicly visible to anyone reading
  the catalogue, including competitors and reviewers. Worth an owner decision at some
  point. Also visible: several live games run above the 96.70% ceiling (Lokis Vault at
  0.98), consistent with the ceiling binding new submissions only.

32. **Missing input, named not guessed: the FAIR outcome endpoint.**
    `https://fair.stake-engine.com/` returns **404**, and the catalogue payload carries
    no schema link, no documentation and no per-game outcome URL. The outcome endpoint
    contract is therefore **not captured**. Per convention (m) I will not infer a URL
    pattern. **Need: the endpoint URL.**

**Owner note recorded.** A full OneDrive copy of the `games/future_spinner` library
including publish files was taken 2026-07-28; recorded in `BOOKS_MANIFEST.md` and the
dossier as the off-repo custody location for the upload set.

**Next, per the execution order, no deviation:** merges #94, #95, #93, #92 with rebases,
then R24, R14, audio instrumentation, Wave 2.

## 008 - 2026-07-27 - DECISION REQUEST: wave 1 complete bar one, ten items need a ruling

Written as a decision document rather than a status update. Everything below is
either blocked on you, blocked on the owner, or a judgement call I should not make
alone. Numbering continues from entry 007.

### Board

**Wave 1: four of five delivered, all CI green.** #92 R10 type-zero, #93 R12
evidence hygiene, #94 R9 scatter disclosure, #95 R6 locale. Remaining: R14 popout.
Nothing is merged; all four await review.

### BLOCKING, and it compounds

21. **The three external review documents have never reached the builder session.**
    Only your dispositions on a handful of findings were relayed inside the
    programme brief. `docs/records/reviews/sources/` holds placeholders, not
    reconstructions, because writing plausible review text from dispositions would
    put fabricated findings into a compliance record.
    **Consequence:** TR-004 to TR-008 (review 3's F3/F5/F7/F8/F10) cannot record
    their finding text or PR citations, and **tracker coverage cannot be called
    exhaustive** since there is no way to know what is missing. This gets worse as
    each wave lands against an unverified baseline. **Need: the three documents
    pasted into the repo, or an instruction to proceed on partial coverage and
    accept the gap on the record.**

### Needs your ruling

22. **Merge order for the four open PRs.** `REVIEW_TRACKER.md` is touched by **all
    four**; `App.svelte` by three (#92, #93, #95). Conflicts are certain.
    **My recommendation:** #94 (smallest overlap), then #95, then #93, then **#92
    last** so the zero-error ratchet is verified against the fully merged tree
    rather than a partial one. I will rebase and resolve the tracker conflicts.
    Confirm or reorder.

23. **TR-020a, audio bed swap. PARKED after two attempts**, per the operating
    rules. `bedSwapFiredOnBonusBuy` and `bedRevertedAfterFeature` still fail.
    Ruled out: the wiring exists (`soundService` subscribes to `overdriveVisual`
    at line 360, `App` sets it at line 318). Fixed on the way but not the cause: a
    real click-path gap where the harness never clicked CLICK TO CONTINUE.
    **Options:** (a) instrument `setOverdriveBed()` with a dev counter to prove
    whether it is called and which branch it takes, roughly 30 minutes; (b) suspect
    the `active === overdriveBedActive` early return, since the warm-mount
    presentation may already have flipped the store so the real entry no-ops, which
    would be **a genuine product bug**; (c) accept headless audio limits and move
    bed-swap plus seam checks to DTT staging, where the seam check must be re-run
    anyway. **My recommendation: (a) then (b).**

24. **TR-014a, 40 hardcoded player-facing strings, untranslated in all 16 locales.**
    Found while checking the `ja` proof: FEATURES still renders English. Includes
    `FEATURES`, `ACTIVATE`, `SELECT`, `SPIN MODES`, `SPIN COST`, `MAX WIN`,
    `MULTIPLIER`, `SOUND`, `MUSIC`, `OVERBOOST`, `CRUISE`, `SESSION`, `SPINS`,
    `REALITY CHECK`, `CONTINUE`, `START REPLAY`. The platform states games "will be
    tested with various combinations of currencies and languages"
    (`front-end-communication.md:44`), so this is reviewer-visible in fifteen of
    sixteen locales. Unassigned, not fixed, scope deliberately not expanded.
    **Need: priority (the owner has opened reprioritisation, and I would argue this
    outranks parts of wave 2), and a ruling on whether the RG and session strings
    also require social variants.**

25. **R14 popout inherits a known-real defect.** `IntroSplash.svelte`'s Continue
    button can render fully outside the viewport at Stake's 400x225 mini-player
    size, carried unfixed since Round 3 and confirmed by a DOM-level click bypass
    being required to unblock the harness. **Need: does R14 fix it, or regenerate
    proofs and leave the fix to its own responsive pass?**

26. **R1a pre-granted locked pass, still unacknowledged.** Wave 3 opens the first
    lock lift in this project's history on `rgsService.ts`. I will follow
    convention (f) exactly. **Need: confirmation it lands as its own isolated
    commit rather than one strand of a thirteen-item sweep, before I start wave 3.**

### For the record, no action needed

27. **The 6-plus scatter claim was mine and was wrong.** Retracted in #94, cause
    recorded, and it produced convention **(l) derive before measuring**, now
    ratified and merged. The engine's clamp for counts above 5 exists but is
    unreachable on the visible 5x4 board, so it is defensive dead code, not a
    compliance question. No ruling needed.

28. **Splash now returns on every cold load** per the owner's ruling, with the
    legacy localStorage flag actively cleared so existing players are not left
    permanently opted out.

29. **Buy-dialog disclosure was clipped more widely than the brief assumed.**
    390x664 already passed; the real failures were 360x600 and compact landscape
    812x375. Fixed by making the stats row sticky. RTP and max win are a stated
    review requirement, so this was compliance, not styling.

30. **Convention (l) is in force** and R6 was the first work executed under it. The
    gap was found by derivation from the spec rather than by measurement.

## 007 - 2026-07-27 - Convention (l) ratified: derive before measuring

**Owner ruling, standard operating procedure.** Recorded as `CLAUDE.md` convention
**(l)** and mirrored into `CLAUDE_PROJECT_INSTRUCTIONS_v6.md` section 3 as **(m)**.
Green lane, merged to `main`.

**What prompted it.** I reported that 352 base rounds reached 6 scatters and 12 reached
7, and wrote a `rulesScatterSixPlus` disclosure into all 16 locales on that basis. The
owner challenged it. **They were right and I was wrong.** The `reveal` event emits a
six-row board per reel, the visible 5x4 grid plus one padding row above and below, and I
counted the padding. Visible window only: **maximum 5, zero rounds at 6 or 7.** The
disclosure was removed (19 references) and TR-017a is marked REFUTED as my own error.

**The two failures the convention now closes:**

1. The exact answer was one line of specification away, `num_reels = 5`, needing no
   measurement at all. I measured to discover rather than to confirm.
2. Switching from name-matching to the engine's own `scatter: true` flag returned
   **identical** counts, which I read as independent corroboration. It was not: both
   read the same padded array, and that flag is set on padding cells too. Shared input,
   shared flaw.

**The procedure, in force from now:** derive from the specification first and cite
`file:line`; measurement confirms and never discovers, and a measurement disagreeing
with the specification is broken until proven otherwise; every number carries a
checkable source or is reported as not known; corroboration requires independent inputs,
stated explicitly; self-audit before reporting rather than after; **unsolved beats
wrongly solved**, so park with options rather than filling a gap; compliance text quoted
verbatim with its date, never paraphrased; maths-adjacent findings escalate as questions
with evidence rather than being ruled on by the builder.

The worked example is written into the convention itself, so the next session inherits
the failure and not just the rule.

**Board.** Wave 1: R10 (#92), R12 (#93), R9 (#94) all open and CI green. R9 carries the
retraction up front so a reviewer sees it before the claim. Remaining in wave 1: R14
popout refresh, R6 locale wiring. **Still blocked:** the three external review documents
have never been provided, so TR-004 to TR-008 cannot be resolved and tracker coverage
cannot be called exhaustive.

## 006 - 2026-07-26 - Owner Audit Round 4 delivered, PR #91

**State delta.** All seven Round 4 items delivered, **PR #91 open, CI green (49s)**.
Proofs `reports/screens/owner-audit-v4/`, results
`reports/qa/owner_audit_v4_2026-07-26.json`.

**Two bugs, both root-caused, and the brief's framing was wrong on both.**

- **Item 3.** Overdrive was always correct. Only NITRO broke, and only inside the
  wincap window: Overdrive derived from `$selectedBetMode`, NITRO from
  `liveIsNitroEntry`, a binding that arrives only once `FreeSpinsPresentation` reaches
  its entry phase, which is after MaxWinCelebration's COLLECT gate. Measured before
  the fix: `nitro-wincap` read `colourway-natural`.
- **Item 1 does not reproduce.** Gate visible and in-viewport on four profiles and six
  desktop sizes across all three routes. Not "fixed": that is working code days before
  the audit. The owner's clarification points at `introSeen()` reading **localStorage
  first**, which is exactly why incognito shows the splash and their desktop does not.

**The owner's clarification changed item 3 materially, and for the better.** They meant
**borders and shading**, not the jets. That exposed a real gap rather than a routing
bug: the backdrop and frame had only **two** states, so a spun-in feature and a bought
Overdrive rendered identically magenta. Natural now grades green to match its green
flames. All three surfaces derive from one route source, so they can no longer
disagree; they previously each re-derived from `liveIsNitroEntry` and shared one bug.

**Item 7 draft delivered; prototype deliberately NOT built.** It lives in `GameGrid`'s
reel timing loop. Prototyping there on a seven-item PR immediately before the audit is
the risk the section 1 bar warns against. Scoped as its own branch in section 6.

**Findings needing your ruling.** Continuing the numbering.

15. **Scatter anticipation, five open questions** in the proposal's section 7. The
    load-bearing one: escalation can build toward a 4th or 5th scatter the board never
    had, because the outcome is known before the reels move. Accept as genre-standard,
    or soften when the board holds no further scatter? I lean accept, with a capped
    dead-build duration.
16. **Natural route colour is my call and should be yours.** I chose green-leaning to
    match the green flames and to read as clearly not-a-purchase. Colour is an owner
    eye-call; proofs are in `item3-route-*.png`.
17. **Item 6 reverses a prior decision.** The 2026-07-14c grid-first pass explicitly
    excluded the desktop lockup from portrait; Round 4 reinstates it. Noting the
    reversal rather than burying it.
18. **NITRO affordability** (owner's third observation) is real: `canBuyBonus` in
    locked `gameStore.ts` hardcodes `bet x 100`, wrong at 400x. Already in
    `LOCKED_FILE_DEBTS`; it is what R8 targets. Not touched here, it needs the locked
    pass.

**Sequencing decision, taken and flagged.** The FS AUDIT REMEDIATION R1-R13 brief
arrived mid-Round-4. It is **saved verbatim and not executed**
(`FS_AuditRemediation_2026-07-27_Prompt.md`). Round 4 lands first as its own reviewable
unit; R1-R13 takes a fresh branch. Two things in it need your explicit acknowledgement
before I start:

19. **R10 reverses your ruling of the previous day.** You ruled "baseline stays at 11,
    and the type-cleanup pass is correctly refused before the audit". R10 says fix all
    11 including the RainLayer parser chase and ratchet CI to zero. I will do it, but
    the reversal should be deliberate, not silent.
20. **R1 pre-grants the first locked pass in this project's history** on
    `rgsService.ts`. I will follow convention (f) exactly (named deny lines,
    never-committed edit, verified-empty diff), and I want it as its own isolated
    commit rather than one strand of a thirteen-item sweep.

**Lane.** PR #91 REVIEW. This entry GREEN.

**Map position.** Round 4 awaits your review. R1-R13 queued behind it. The owner
re-test (map item 3) is still the audit's precondition.

## 005 - 2026-07-26 - Branch prune done; board handed to the owner

**COMMS-ACK.** Receipt of FABLE RULINGS 2026-07-26b recorded. Entry 004 closed.
Rulings noted: (1) ruling 13 closed, baseline stays at 11, type cleanup correctly
refused; (2) audit pack refresh ratified in full; (3) dossier 5g ratified as landed;
(4) branch prune executed, below; (5) board state formally recorded.

**RainLayer blind spot: compensated, not chased.** One instruction added to
`AUDIT_PACK_INDEX.md` section 4 as item 5: the auditor manually verifies the two props
(`count`, `opacity`, plus the cosmetic `variant`) against both callers, `App.svelte`
and `HeroSplash.svelte`. Closes the only known unchecked-props hole for the price of a
sentence, as ruled.

### Branch prune

**15 merged remote branches deleted.** Full SHAs recorded here so every deletion stays
recoverable by `git branch <name> <sha>`:

| Branch | SHA |
|---|---|
| `claude/anticipation-reroll-itemA` | `5ee9869aa50f088669eb00c1725aab2002be2813` |
| `claude/audio-seam-warmup-item0` | `ab7c96eb60e9ad18221093a6e752e89612b72a7a` |
| `claude/books-regen-locked-pass` | `f43dd2c5a0ee9dcff5abecf50d9cde94f8d91f43` |
| `claude/brand-hero-emblem` | `12ac14a7cd47b53e05d1310f2bea5acbd8876755` |
| `claude/landscape-compact-v1` | `97c0441dcff6be08b9b9598c377851eada276a3a` |
| `claude/math-audit-correction-itemD` | `c57f7eead0f53d20a5470161fa5624f560400e8f` |
| `claude/math-selfaudit-item3` | `a1f0b4bed6fcda619694b31edea684dc7f1b0802` |
| `claude/portrait-layout-v1` | `d987760b8fc55e34a4e871b99d2718ecbfc208ab` |
| `claude/portrait-v2-grid-first` | `cc1521d0a4dfa6d1685af0d74253fbba82f251f8` |
| `claude/qa-conformance-item2` | `c8202319cac26913b3838522069099a8c1a1af42` |
| `claude/record-corrections-itemE` | `92525cb7b7ce8e8dcbf75244977f271ac6da42cd` |
| `claude/rules-conformance-item1` | `7126f996b4b7ca51bab9a6184b1e673a051ba032` |
| `claude/social-audit-item4` | `4b45a4060a865c6b21f24604aa9b21ba3306537e` |
| `claude/social-strings-itemC` | `906d96cd71bc514cf2acc5132faaa3d7b09413bd` |
| `claude/win-countup-itemB` | `a42084de4c0e4fe76d24dc92b73000ca4f9954c9` |

Each was verified an ancestor of `main` before deletion, not merely assumed merged.
Four stale local branches whose remotes were deleted were also removed with
`git branch -d` (which refuses anything unmerged).

**Four reference branches preserved exactly as directed:** `claude/collect-prototype`,
`claude/gap-analysis`, `claude/lumen-sideproject`, `claude/fs-super-prototype`.

**ONE EXCEPTION, HELD RATHER THAN DELETED, needs your ruling.**

14. **`claude/compliance-rg` (`c595566`) was NOT deleted.** It is **not an ancestor of
    `main`**, so it does not satisfy "every merged remote work branch", and it is not
    on the four-branch preserve list either. It falls between the two clauses. The
    2026-07-25 close-out sweep recorded that its content "landed via hand-picked
    cherry-picks into other PRs per the 2026-07-07 handover, not a PR of their own",
    which explains why the tip is not an ancestor even though the work is on `main`.
    I did not delete it, because deleting an unmerged branch on an inference about
    cherry-picks is not something to do without an explicit instruction. **Ruling
    wanted:** delete it, or add it to the preserve list. Remote is otherwise exactly
    the four references plus `main`.

### Board state

Confirmed from the repository, not asserted: **no open PRs, working tree clean** except
the two known-safe untracked directories, `main` green, CI passing.

**The builder holds nothing actionable.** Audit prep is complete. The external audit's
sole remaining precondition is the owner's full re-test verdict and any round-4 items
it produces. As of this entry the machine side is waiting on its owner.

Open items carried, none of them blocking and none of them mine to move:

- Owner re-test verdict, then any round-4 items (map item 3).
- Ruling wanted on `claude/compliance-rg` above.
- XEC, resolved empirically at Developer Testing Tool staging (map item 6).
- Owner one-timers: payment details against the captured payments doc, hero-emblem
  provider logo upload, Tile Editor composition.
- Blurb's draft soundtrack sentence still pending owner approval.
- Post-launch, ruled and deliberately deferred: `replayStore` removal, feature-grid
  renderer unification, the six non-shared overlay scripts, the 11-error typecheck
  baseline.

**Lane.** GREEN: comms, records, branch housekeeping. No code, no game behaviour.

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
