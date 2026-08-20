# The fifty-one, machine-walked at HEAD: the R074 final audit table (2026-08-20)

Companion to the verbatim capture at
`docs/stake-engine-live/2026-08-13/submission_checklist_we_roll_spinners.md` and the
mapping at `docs/records/GUIDELINES_51_MAPPING_2026-08-13.md`. Produced by FABLE FINAL
AUDIT BRIEF R074 (saved verbatim at `reports/briefs/FS_FABLE_R074_FINAL_AUDIT_Prompt.md`).
Australian English, no em dashes or en dashes.

**What this table is.** Every one of the 51 items re-walked at HEAD (`3cbef98c`, tip of
`main`, tree clean): the mapping row's citations followed and re-verified first-hand, every
CI-runnable proof an item cites re-run locally this session, frame vintages checked against
the last change to the surface they show. Method: nine read-only verifier agents over the
rows, adversarial refutation of every non-clean draft, first-hand spot-checks of
load-bearing claims by the session, and the full local gate battery run this day (static
suite 74 of 74 steps PASS, browser matrix legs run locally, verdicts cited per row). The
remote CI truth at HEAD: the newest full browser matrix is run 32353012031 on `307989ad`,
SUCCESS 30 of 30; every commit since is record-only (zero paths under `frontend/`,
`scripts/`, or the workflow file changed, verified by diff), which is exactly the class the
matrix filter skips by design; the static suite ran green on every later push
(32364167540, 32372996744, 32373522535, and this session's own pushes).

**The one blocker on re-reads: the portal login.** The pane's stake-engine.com session has
expired. Sign-in requires ticking two terms-agreement boxes and an OAuth grant, which are
owner actions, never a session's. So every LOGGED-IN read this brief asked for is escalated
rather than performed: the item-level fifty-one re-read against the live logged-in page,
the portal pre-checks, the published version stamps, the Math page, and the Start Approval
form dry-read. The public checklist page (framing only, items login-gated) is captured in
`docs/stake-engine-live/2026-08-20/` and is byte-identical to every capture back to
2026-08-11. The 2026-08-13 logged-in transcription remains the newest item-level truth.

**Verdicts.** CONFIRMED means every load-bearing claim in the mapping row re-established
at HEAD. STALE-refreshed means the item's SUBSTANCE verifies at HEAD (in several cases
more strongly than the row claims) but the mapping row's evidence cell has drifted since
2026-08-13; the corrected citation is in this table, and the 2026-08-13 mapping is left
unedited as a dated record. ESCALATED means the evidence is a portal read this session
cannot perform. Counts: **38 CONFIRMED, 12 STALE-refreshed, 1 ESCALATED.**

The dominant STALE shape is worth naming once rather than twelve times: the mapping was
written on 2026-08-13 and four estate passes landed after it (R058 pod removal, R065 to
R068, R071 precision law and face change, R072 end-frame). Line numbers, symbol names, a
leg count and two instrument attributions moved underneath the mapping's cells while the
behaviours themselves stayed proven, each by a gate that runs at HEAD. No item's substance
failed re-verification.

| # | Verdict | Re-verified at HEAD, with citations |
|---|---|---|
| 01 | STALE-refreshed | Auth path first-hand: `rgsService.ts:555` `authenticate`, `:730` `initRGS` (locked, sanction record in CLAUDE.md). Live 200 authenticate captured 2026-08-11 (`docs/stake-engine-live/captures/2026-08-11_wallet_400_2.json`, label "authenticate, REAL session (control, expect 200)"). CORRECTED CITATION: the per-mode behavioural rounds with frames are `reports/screens/round4/` (R046 TASK 3; its observations.json playRequests log lists all five modes), NOT `frontend/scripts/r047_verify.mjs`, which is a static ruling verifier that has never driven a round (verified by full read and git history). Round4 frames are dated 2026-08-11 and predate the 2026-08-15 spin-gating change; the behaviour at HEAD is held by the CI matrix and this session's local battery. |
| 02 | CONFIRMED | `r057_invalid_rgs_proof.mjs` header names this item; CI leg "browser: invalid rgs_url guard" (checks.yml); refused-port drive, keyed banner en and de, nothing on the wire after a spin press, seeded per (p) by severing the guard. Local run this session: PASS. |
| 03 | STALE-refreshed | `rgsService.play` (locked) verified; autoplay legs drive the same path (`r042b_autoplay_proof.mjs`, CI leg, local run this session PASS). CORRECTED CITATION: the one-round-per-mode drive is `reports/screens/round4/` with its playRequests wallet log, not `r047_verify.mjs` (same misattribution as item 01). |
| 04 | CONFIRMED | `frontend/index.html` is the custom document (no platform loader); `dist_hygiene_gate.mjs` local run PASS this session. |
| 05 | CONFIRMED | Trademark evidence records exist as cited (R050 captures, owner-signed 2026-08-13); restricted-term scans green (`social_string_conformance.mjs` local run PASS). |
| 06 | CONFIRMED | Canonical source registry per convention (u) (`scripts/assets/canonical_sources.json`, refusal-tested); provenance notes exist at the cited brand paths; owner reviewed every promoted final (R050). |
| 07 | CONFIRMED | `docs/records/DISTINCTNESS_ATTESTATION_2026-08-13.md` exists, every clause cited, owner-SIGNED 2026-08-13 (sign-off block, item 3). |
| 08 | CONFIRMED | Tile master 408x546 with the measured de facto geometry note (`design-system/brand/tile/GENERATION_NOTE_composed_master.md`); promoted set at `assets/portal/` with provenance. The portal "Thumbnail is set." pre-check is ancillary and stands on the 2026-08-13 capture; its re-read is in the login escalation. |
| 09 | CONFIRMED | `stores/betLadder.ts` drives from `rgsBetLevels` with the hardcoded array as fallback only; `betLadder.test.ts` PASS in this session's battery, including the three TR-013 arithmetic cases. |
| 10 | STALE-refreshed | The restore is real and guarded: `sessionRecovery.ts:286-288` sets `betAmount` from `round.amount / CURRENCY_SCALE` when finite and positive, and the driver comment quotes this checklist item verbatim beside it. CORRECTED CITATION: the mapping cited `:251`, which is the opening-bet write, not the round-amount restore. `sessionRecovery.test.ts` PASS in this session's battery. |
| 11 | CONFIRMED | `currency.ts` 49-row transcription verified; `currency.test.ts` PASS; `currency_table_gate.mjs` PASS against the platform mirror this session (transcription-fidelity pin standing, XEC as published row SC). |
| 12 | STALE-refreshed | `r057_subcent_proof.mjs` CI leg; local run this session PASS. The item's substance holds: the real 0.08x book round renders $0.008 on every payout surface. CORRECTED CITATION: R071's precision law (TR-155) moved the ledger NET and balance expectations to two places, so the mapping's "renders $0.008 on ... Net" no longer describes the proof's assertion set; wins stay at four places, Net at two, per the platform ruling. Frames at `reports/screens/r057-subcent/` are 2026-08-13 and predate the R071 surface changes; the behaviour at HEAD is held by the passing proof. |
| 13 | CONFIRMED | `rgsService.ts` (locked): `needsEndRound` follows the official client's active-flag rule; a zero-win settled round sends nothing. Verified by direct read. |
| 14 | STALE-refreshed | The gate at HEAD is `canAffordSpin` (`stores/buyAffordability.ts:106`), which requires balance to cover the standing MODE'S real cost, a strictly stronger gate than the mapping's cited `canSpin` (now dead, zero production reads, registered in LOCKED_FILE_DEBTS). Both the SPIN control and the spacebar read it. CORRECTED CITATION: `buyAffordability.ts:106`, not `gameStore.ts:88`. |
| 15 | CONFIRMED | `layout_fit_gate.mjs` across seven presets; its header names this checklist line; local run this session PASS (with seeded self-test). |
| 16 | STALE-refreshed | Space bound to the bet action at `App.svelte:1868` (handler) behind the modal guard (`:1909` `$anyModalOpen`) and the same `canAffordSpin` gate the button reads (`:1916`), verified first-hand this session; `modalGuard.test.ts` PASS in the battery. CORRECTED CITATION: the guard is `canAffordSpin`, not `canSpin` (renamed by the 2026-08-15 pass, same drift as item 14). |
| 17 | STALE-refreshed | RTP and Max Win are stated in the rules in all 16 locales, verified at HEAD: the rulesOverdriveModes block in `frontend/src/lib/i18n/translations.ts` (all five modes with cost, RTP and cap) and `rulesMaxWin` at `frontend/src/lib/i18n/prose.ts:119` with 15 locale renderings in prose.locales.ts. CORRECTED CITATION: the rulesMaxWin key lives in the prose layer, not in translations.ts as the mapping says. `disclaimer_conformance` and `kit_basis_gate` PASS this session. Paytable frames (2026-08-11) predate later surface passes; the card-fill and locale gates hold the rendering at HEAD. |
| 18 | CONFIRMED | Per-symbol centibet values render through locale formatters (TR-125 `toLocaleString` routing, held by `r047_verify.mjs` T1 static checks, run PASS this session); `paytable_card_fill_gate.mjs` PASS at every shipped locale in this session's battery. |
| 19 | CONFIRMED | 1,024-ways explanation and per-symbol combination rows verified in the rules keys; rendering held by the paytable card fill leg (PASS this session). |
| 20 | CONFIRMED | Mode cards from `config/fsModes.ts` `MODE_COST`; `allModesLabel` in 16 locales; `fsModes.drift.test.ts` PASS this session (pins fsModes to the shipped `index.json`). |
| 21 | CONFIRMED | Rules state 3/4/5 scatters award 8/12/16 spins plus 1x/3x/10x instant, retrigger +5: verified this session against the primary source, `game_config.py` `scatter_multiplier_table` (1.0/3.0/10.0) and `freespin_triggers` (8/12/16 base, flat +5 freegame). |
| 22 | CONFIRMED | Disclaimer in all locales; `disclaimer_conformance.test.ts` PASS this session (sixteen locales, seeded self-test). |
| 23 | CONFIRMED | `check_autoplay_confirm_gate.mjs` and `r042b_autoplay_proof.mjs`, both CI legs, both PASS locally this session. |
| 24 | CONFIRMED | Buy confirm dialog with per-tier price; `buyAffordability.ts` is the one truth for card and dialog (TR-016); battery green. |
| 25 | STALE-refreshed | Desktop presets run in `layout_fit_gate.mjs` (Desktop 1200x675, Laptop 1024x576) and the matrix's default desktop viewports; local battery PASS. CORRECTED CITATION: the matrix is 28 legs at HEAD, not 24 (the figure was exact on 2026-08-13; money fit, retrigger, control row symmetry and direction parity landed since; per convention (s) the count belongs to checks.yml, not to a row). The rounds-with-frames attribution is `reports/screens/round4/` as in item 01. |
| 26 | CONFIRMED | `popout_conformance.mjs` CI leg at both popout sizes; local run PASS this session. (Its label-versus-threshold wording, "44px" beside `>= 40`, is a ruled decision escalated in the R074 verdict, TR-169 having settled the 44's provenance as our own HIG bar.) |
| 27 | STALE-refreshed | Mobile function is held at HEAD by `layout_fit_gate.mjs` mobile presets and `portrait 390x844` in the max-win and money-fit profiles (CI legs, PASS this session). CORRECTED CITATION: `portrait_layout_conformance.mjs` is LOCAL-ONLY by the workflow's own header (checks.yml line 18), not a CI leg as the mapping says; and this session's attempt to run it could not complete, its drive dying against the current Max Win overlay, which makes it the third member of the stale local-harness class escalated in the R074 verdict. |
| 28 | CONFIRMED | `app.css` `touch-action: manipulation` verified at HEAD with the recorded accessibility reasoning for not using user-scalable=no. |
| 29 | CONFIRMED | Guide keys (`guideSpinName/Desc`, `guideBetPlusName/Desc`, `guideFeaturesName` and siblings) verified in `prose.ts` (en) and `prose.locales.ts` (all locales). |
| 30 | CONFIRMED | `stores/audioSettings.ts` with the HUD mute control verified; owner-accepted mix (TR-102). |
| 31 | CONFIRMED | `translations.ts` en is the base table; every locale carries exactly the en keyset (machine-compared this session, all three layers). |
| 32 | CONFIRMED | Per-key fallback to en verified; `locale_launch_conformance.mjs` run this session: PASS, 16 of 16 locales, 10 of 10 malformed values fall back silently. |
| 33 | CONFIRMED | Books-to-lookup equality RE-RUN IN FULL this session at HEAD: 500,000 rounds, 4,455,829 assertions, 0 failures, with all five book SHA-256 values verified equal to `BOOKS_MANIFEST.md` before the run (the input-binding TR-110 asked for; hashes and the run log quoted in the R074 verdict record). `round_payout_reconciliation_gate` holds the display layer. |
| 34 | CONFIRMED | `game_config.py` defines no mystery mode; vacuously satisfied, stated rather than ticked silently. |
| 35 | CONFIRMED | `social_string_conformance.mjs` and `social_dom_conformance.mjs` both PASS locally this session; social renders English only (item 39). |
| 36 | CONFIRMED | GC/SC trailing placement pinned (`1,000.00 SC` shape, never `$`); `currency.test.ts` and the conformance gates PASS this session; the fifty-row `currency_conformance.mjs` local harness run this session: PASS. |
| 37 | CONFIRMED | Social vocabulary system verified; `vocabulary.test.ts` PASS this session; rendered names asserted by the social DOM leg. |
| 38 | CONFIRMED | `replay_contract_gate.mjs` social leg asserts Token, never Currency, in the replay window; local run this session PASS (86 assertions, 15 of 15 seeds). |
| 39 | CONFIRMED | `stores/socialLocale.ts` forces en in social mode; `socialLocale.test.ts` PASS this session. |
| 40 | CONFIRMED | Public replay endpoint via `replayService.ts`; the contract gate carries the platform's real captured payload (event 83776) and PASSED locally this session; owner confirmed the live render (R056). |
| 41 | CONFIRMED | `ReplayMode.svelte` reads currency, lang and amount from the query string; the contract gate drives all three; PASS this session. |
| 42 | STALE-refreshed | Play-again control and full state reset verified at HEAD. CORRECTED CITATION: the control now sits at `ReplayMode.svelte:582-583` and the reset in `playAgain()` at `:452-460`; the mapping's `:487` and `:392` were exact on 2026-08-13 and were shifted by the R058 pod removal and later passes. |
| 43 | STALE-refreshed | Bet cost and applied multiplier render in the replay figures, and the END BANNER carries amount and multiplier inline, asserted by the contract gate (`assertEndBannerValues`, banner equals envelope at three sizes; PASS this session). CORRECTED CITATION: the mapping's FEATURE COMPLETE pod no longer exists; R058 (owner ruling) deleted WinPod and the banner carries the values, which is a stronger disposition than the row records. |
| 44 | STALE-refreshed | Replay at Popout S verified: whole-column single-scale fit with the no-vertical-overflow assertion at 400x225 in the contract gate, frames refreshed 2026-08-20 with the R072 end-frame change (the one frame family at HEAD vintage). CORRECTED CITATION: the mapping's "520-vs-400px fix" comment was deleted with the pod in R058; the standing fix is the R056 TASK 4 fit plus R072's held end-frame. |
| 45 | ESCALATED | Portal state only: the approval landing's "Valid betlevel template found." pre-check. The 2026-08-13 capture holds it verbatim (transcription's adjacent-page-state block); the live re-read is login-gated this session. One owner glance on submission morning re-confirms it. |
| 46 | CONFIRMED | PLATFORM-MANAGED per R073 (2026-08-20): there is no Provably Fair toggle in this game's Settings, OWNER-OBSERVED at the portal, the rule 16 provenance path; Replay is enabled with no toggle either, its behaviour evidenced at items 40 and 44 (both PASS this session). TR-170 holds the record. |
| 47 | CONFIRMED | POST-SUBMISSION by design (reviewer-side approval state). Newest captured stamps: front v9, math v1 (2026-08-13); the current stamp re-read is in the login escalation. |
| 48 | CONFIRMED | POST-SUBMISSION owner action (the approved-channel post), unchanged. |
| 49 | CONFIRMED | Throttled diligence pack exists as cited (`reports/qa/r057_throttled_device_2026-08-13.md`: 6x CPU, boot 528ms, cadence animation-clocked); thresholds reported, not invented; the real-device hand-test line remains the owner's. |
| 50 | CONFIRMED | POST-SUBMISSION process step (close request, add emojis), unchanged. |
| 51 | CONFIRMED | POST-SUBMISSION: the end state itself. |

**What this table does not do.** It ticks nothing: the Guidelines checkboxes are ticked by
reviewers and 0 of 51 is the expected state. It does not re-read any logged-in portal
surface; every such read is enumerated in the R074 verdict's escalation list for the
owner's logged-in submission morning. And it does not edit the 2026-08-13 mapping, whose
cells are a dated record; the corrected citations live here.
