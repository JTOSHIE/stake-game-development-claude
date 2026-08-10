# FRESH-CONTEXT STATE OF THE REPOSITORY, 2026-08-10

Written for a reader with no recent context, because a great deal has moved and the owner
asked for a full review rather than another increment.

**How this was produced.** Fourteen read-only agents: ten parallel surveys (submission
readiness against the platform's own mirror, the maths package and every disclosure claim
made about it, the money path end to end, the gate and test estate, compliance and
internationalisation, whether the repository's documents tell the truth, recent-change
risk, the shipped artefact, known-outstanding work, and the frontend as a system), then
three adversarial passes (a platform reviewer deciding whether to REJECT, a player-harm
trace, and a hunt for claims the repository makes about itself that are no longer true),
then this synthesis. About 2.95M subagent tokens over 46 minutes.

**Status of everything below.** This document is the synthesis agent's own words, edited
only for house style. It is REPORTED under protocol rule 16 except where the companion
register marks a finding VERIFIED. The full findings list, with evidence strings and
provenance, is `reports/qa/fresh_context_2026-08-10/FINDINGS.md`, and the untouched raw
ledger is beside it.

**Six findings were recounted directly and are VERIFIED**, listed in that register. Four
of them would lose the submission.

---

## 1. WHERE THE PROJECT ACTUALLY IS

Not submission ready, and the reason is narrow and fixable rather than structural. The maths is genuinely strong: I recomputed the five published lookup tables with exact rational arithmetic and every mode returns 96.350000% (expected payout 0.9635 / 0.9635 / 1.2044 / 96.3500 / 385.4000 units of the base bet at costs 1.0 / 1.0 / 1.25 / 100.0 / 400.0 from `games/future_spinner/library/publish_files/index.json`), max payout is exactly 500000 centibets in all five tables, and `python3 scripts/validate_math.py` prints "MATH VALIDATION: ALL COMPLIANCE CHECKS PASS". CI is green at HEAD (`gh run list` shows run 31356925880 for commit 14f5149, success). The engineering discipline around gates is unusually good.

What is not ready is the **disclosure layer** sitting on top of that maths. Four player-facing figures ship English-punctuated into ten locales where the comma is the decimal separator, so a German player reads a maximum win of five and a Cruise RTP of 9,635%. And the maximum-win rule itself states the cap against the wrong quantity in three of five modes. Both are in the bundle currently on the Desktop, verified by grep, not inferred. Neither is a rebuild; both are text.

HEAD is `14f5149` ("The string gate was blind to prose, which is the only thing it is for"). The working tree is nearly clean: `git status --porcelain | wc -l` returns 1 (`reports/qa/locale_prose_conformance.json`). Earlier probes saw 19 dirty files; that has been restored.

## 2. WHAT CHANGED RECENTLY, AND WHAT IT MEANS FOR YOUR PRIORS

Three days of work sit between the last stable audit and now. On 2026-08-09 and 08-10 a money-path fix run landed (stalled wallet, settle-failure guard on the reload path, sub-cent win precision, an auth-shape guard), then R041, a Fable ruling block that rewrote player-facing rules text across sixteen locales, then two commits repairing gates R041 had disarmed, then `14f5149` widening the hardcoded-string gate.

**Adjust one prior in particular.** `docs/records/compliance/OWNER_RULINGS_PRESUBMISSION.md` is *current*, not stale. An earlier probe reported as a blocker that sections A1, A2 and B present already-closed items as open. That is refuted: lines 45, 84, 115 and 162 each carry "**RULED AND EXECUTED, 2026-08-10, R041 TASK n.**" and the superseded quotes are explicitly labelled as evidence of the finding rather than as current text. The file has since grown sections F, G and H covering the locale numeral defect, the untranslated paragraph and the settle-failure gap. Read it; it is the single most honest document in the repository.

**Do not extend that trust to the other compliance documents.** `docs/records/compliance/STAKE_GUIDELINES_SELF_ASSESSMENT.md` is 42 commits behind HEAD (`git rev-list --count cfdcbe3..HEAD` = 42), carries 59 numbered rows against a summary asserting 58, and contradicts its own summary block four ways (row "FAIL 0" against prose "TWO ITEMS STILL FAIL" and then "The three failures"). `COMPLIANCE_WATCH.md` contains exactly one occurrence of "2026-08" and still records the submission checklist as login-gated and uncaptured, twelve days after it was captured.

## 3. THE STATE OF EACH MAJOR SURFACE

**Maths and disclosure.** The maths reproduces independently and passes every published band. The disclosure does not match it. `frontend/src/lib/i18n/prose.ts:118` reads verbatim: `'Maximum win per game round is capped at 5,000× your total bet. A game round includes the triggering spin and any free spins it awards.'` The payout multiplier is against the **base** bet, which my recomputation proves (super expects 385.4 base-bet units at a cost of 400, giving 96.35%; if 5000 were against total bet the RTP arithmetic would not close). So in NITRO OVERDRIVE the true maximum is 12.5x what the player stakes, and the rule overstates it 400-fold. Twelve elements below on the same modal, `prose.ts:88` says the opposite: `'Max win is quoted against the base bet.'` Both render in `PaytableModal.svelte` (rules list composed at :52, footnote at :360). The platform requires exactly this to match: "Ensure the maximum win amount matches the description in the game rules for each mode."

**The money path.** Traced end to end by two probes and consistent between them. Both integer-micros gates pass. The one open hole: a settle failure during *live* play engages nothing. `rgsService.ts:800-803` calls `endRound` inside the spin's try block; the catch rethrows; `App.svelte:1817` hands the optimistic debit back unless `liveGuardReason` is `'wallet-stalled'`, and nothing on the live spin path ever sets it. Screen shows the pre-bet balance while the RGS holds an open round with the stake taken. The identical failure was diagnosed and fixed on the *reload* path a day earlier (`sessionRecovery.ts:360` sets `'settle-failed'`). This is section H of the owner rulings document, so it is known, and it is not fixed.

**i18n and compliance.** Sixteen locales ship and the key tables are structurally complete (75 prose keys and 39 social keys across 16 locales, 0 gaps, per `locale_prose_conformance --static` PART 1). The prohibited-terms table in `vocabulary.ts` is a verbatim 39-row transcription of the platform's own. What fails is numerals and coverage: `grep -c "5,000" frontend/src/lib/i18n/prose.locales.ts` returns 15, and the shipped kit bundle contains `Der Maximalgewinn pro Spielrunde ist auf 5,000× deinen Gesamteinsatz be` and `Ruhigere Fahrt: häufigere kleinere Gewinne, unverändert 96.35% RTP`. On the same German screen, `translations.ts:1896` renders `Maximalgewinn 5.000× Einsatz` correctly. One modal, two punctuations, two readings.

**The gate estate.** Large and mostly healthy: roughly 156 gate and test files, 41 carrying seeded self-tests, 44 wired into CI's static job plus a 14-leg browser matrix. The failure mode is not absent gates, it is **gates whose predicate is narrower than the class they claim**. `hardcoded_string_gate.mjs` now reports "1 player-facing literal(s), 1 frozen" and PASSes; the one frozen entry is the Responsible Play paragraph, and the gate still cannot see `× {response.costMultiplier} {mode === 'social' ? '=' : 'cost ='}` at `ReplayMode.svelte:430` or the five English volatility labels at `fsModes.ts:74-114`, because it scans only `.svelte` files under `lib/components` and its label shape excludes `=`. Separately, `locale_prose_conformance.mjs` is RED at HEAD (one leak, Indonesian `replayModeLabel: 'Mode:'`) and appears in `.github/workflows/checks.yml` only inside a comment at line 709 that asserts it proves what it is not run to prove.

**The shipped artefact.** `~/Desktop/FS_UPLOAD_KIT/BUILD_INFO.json` reads commit `3284db2c`, 78 files, 12,318,651 bytes, four kit gates PASS. HEAD is `14f5149`, three commits later. The local `frontend/dist/build-info.json` reads commit `e85a177` with `"cleanTree": false`. So neither artefact is HEAD, and the one on the Desktop predates the string-gate widening. Content-wise the intervening commits touch reports and scripts, not shipped source, but the bundle still carries every defect named above.

**The documentation record.** 263 commits since 2026-07-28, and `reports/SESSION_REPORT.md` gained sections for only the last two. `reports/archive/` jumps from 2026-08-05c to 2026-08-10, omitting the money-path arc entirely. `node scripts/qa/doc_currency_gate.mjs` PASSes while printing "337 frozen claim(s) still outstanding", and its predicate only checks that a cited line *exists*, never what it says, which is precisely how the self-assessment can cite a guard that no longer exists in the source and stay green.

## 4. WHAT IS OUTSTANDING, ORDERED BY WHAT BLOCKS FIRST

**Needs work, blocks submission:**

1. Locale numeral punctuation. Three prose keys carry English-punctuated figures in the
   prose layer: `rulesMaxWin`, `modeCruiseBlurb` and `modeOverboostBlurb`, 30 values across
   ten locales. Separately, `MaxWinCelebration.svelte` carries its own hardcoded `5,000`
   literal. The mechanism to fix both already exists and is proven: `fsMaxWinLabel(locale)`
   in `fsModes.ts` derives the figure through `toLocaleString`.
2. The max-win basis. `rulesMaxWin` and `rulesScatterMult` both say "your total bet"; the maths is against the base bet. One string each, plus the social variants, plus the fifteen locales.
3. The Overdrive rules block: `translations.ts:1843-1844` tells the player two modes exist and one buy price, on a screen rendering five mode cards and "RTP (All 5 Modes)". `:1830` says the meter starts at 1x, contradicted by `gamestate.py:39-48` returning 5 for super.
4. Bet Replay has no audio at all (`grep -c "sound\|audio\|mute" ReplayMode.svelte` returns 0) against the platform's "Show all animations, sounds, and visual effects".
5. The live settle-failure guard (section H).

**Needs work, lower cost:** the untranslated Responsible Play paragraph (frozen, needs fifteen translations); the five volatility labels; the `cost =` literal on replay; wiring `locale_prose_conformance` into CI once its one leak is triaged.

**Needs a ruling:** sections A3 (a blocked-settle banner whose middle sentence is false), C (the RGS 400 error-body shape, genuinely unknowable from here), E (mixed apostrophes in the French prose block, currently frozen as one exemption at `machine_tell_gate.mjs:330`). Eight owner-park proposals at `reports/qa/session9/OWNER_PARK_PROPOSALS.md:426-435` have an empty signature column.

**Known and accepted:** six LOCKED_FILE_DEBTS entries in `CLAUDE.md:137-236`, each with a verified compensating control; two English exemptions in social mode (social sessions are pinned to `en`); the reconciliation gate that cannot run in CI because the books are gitignored.

## 5. WHERE THE BODIES ARE LIKELY BURIED

**Gate allowlists with no both-directions check.** `dead_wiring_scan.mjs` holds 13 ALLOWLIST keys and prints "allowlisted (12)"; `activeRound` is excused as an undecided question while `App.svelte:669` reads it. `a11y_social_terms_check.mjs` has 18 ALLOW entries, 12 matching nothing, four of which assert translation debt that closed. Neither gate can fail on a stale exemption. `machine_tell_gate.mjs:360-370` shows the correct shape; copy it.

**Anywhere a gate reads a value but not its form.** `paytable_parity.test.ts` compares the number 5000 to the cap 5000 and never asks what it is a multiple of, which is why the entire max-win basis error is invisible to a green estate. Assume the same blindness elsewhere.

**The self-assessment and OWNER_CHECKLIST.** Three artefacts disagree on item counts (51 published items, 59 assessed rows, a portal counter reading 58) and `OWNER_CHECKLIST.md` says "Nine of them are OWNER items" at :52 and "OWNER is **seven**" at :76. If a reviewer is handed either document, they are handed arithmetic that does not close.

**The maths package's non-PAR files.** `games/future_spinner/README.md` is tracked, pre-Overdrive, publishes a third scatter table (2x/10x/50x) and states the scatter does not trigger free spins. `game_calculation.py` carries 5x/15x/50x in four docstrings and its `__main__` self-test raises `AssertionError` on the shipped values.

## 6. WHAT NOBODY HAS CHECKED

Nothing has been observed running. No probe launched a browser, a dev server, an RGS or a Playwright leg. Every frontend verdict, including all four blockers, is source plus string presence in built bundles. No one has seen the German paytable render.

The wire contract is unconfirmed. Whether `/wallet/play` dedupes a retry is unknown and the platform mirror is silent on it (`grep -rn -i "idempot" docs/stake-engine-live/` returns nothing), which is what decides whether the un-keyed retry is a double stake. Whether the RGS charges `amount x cost` or `amount` flat is inferred, and the whole mode-pricing story rests on it.

The requirements register has not been re-walked. I recounted it myself from `reports/qa/compliance_register/walk_shards/`: 194 distinct requirement rows, SATISFIED 91, NO_PROOF 70, NOT_MET 26, UNKNOWN 6, N/A 1, out of 232 enumerated. That walk is dated 2026-07-29 and at least one cluster has closed since. Treat the 26 as a list to re-walk, not a count.

No image or audio content has been inspected by anyone, only formats and byte sizes. The repository's own record shows a rival-casino-branded image was found by a human opening a file, and no gate reads text inside a shipped image. Audit waves 2 to 5 (audio, social-mode capture, accessibility, animation quality) have never been run for this title, per `WRS_MASTER_DOCUMENT.md:266-270` and `docs/QUALITY_CHARTER.md:469-472`.

Translation quality is entirely unchecked. Numerals were enumerated in all fifteen non-English locales and German was read end to end. Arabic, Hindi, Japanese, Korean, Chinese, Russian and Vietnamese have not been read for meaning, and RTL layout has never been checked. No screen reader has been run.

The portal is unseen. The five green pre-submission gates, the "Latest front version: v4" line, the thumbnail assertion and the one-active-review limit all rest on `docs/stake-engine-live/2026-08-09/submission-checklist.md`, which alone among 21 captures in that mirror carries no sha256 and no character count; its own header reads "rendered_via: owner's browser, transcribed by the owner into chat and mirrored here". Finally, one platform source is missing from the mirror entirely: `distribution_optimization.pdf`. Its requirements are unknown to this repository.
