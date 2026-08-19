# Stand-back ledger, 2026-08-15

HEAD at launch: `90f21280`. Workflow `project-audit`, 25 of 25 agents
completed, 0 lost. Discovery returned 44 findings. Marshal produced 16
clusters and dropped 9. Verification: 14 confirmed, 2 refuted, 0 unverified.

Dirty-lens reports (8 of 8) were a missing-shell artefact (explore agents
have no `git status`). The real tree was clean of agent writes. Confirmed
independently by `git status --porcelain` in the main loop.

Every finding below has a disposition. Minor is not one of them.

## Confirmed clusters

| Id | Disposition | Notes |
|---|---|---|
| C-spin-afford | **FIXED** | TR-149. `canAffordSpin` is the SPIN and spacebar gate. Locked `canSpin` unread. |
| C-cost-format | **FIXED** | TR-150. FeatureMenu and BetSelector use `formatWin` on the same micros. |
| C-afford-float | **FIXED** | TR-151. `canAffordMode` / `shortfallFor` compare integer micros. |
| C-buy-price | **PARTLY FIXED, remainder PARKED** | `buyPriceLabel` now uses `spinCostMicros(..., 'bonus')`. The generic BUY FEATURE plate still sits above the 400x NITRO card. That is disclosure copy, not a wrong Bonus Buy figure. Extracted: decide whether the generic plate stays, becomes Buy Overdrive, or lists both prices. |
| C-mode-chip | **FIXED** | TR-152. Chip reads `$tr`. Uppercase transform removed. |
| C-social-parse | **FIXED** | TR-153. Replay accepts `social=1`. |
| C-dead-rasters | **FIXED** (WinPod pair). Theme-folder unused rasters **PARKED** | TR-154. `KEEP_UI` empty. frame-1 / subtitle / panel rasters need a diet pass of their own. |
| C-evidence-hygiene | **PARKED AND EXTRACTED** | TR-090/097 named scripts are migrated (tracker closed). Remaining writers: `numeral_locale_pass.mjs` default apply path, `background_local_testing_verify.mjs`, `evidence_*.mjs` family, some provider-mark scripts, and four proofs that write `frontend/screens/`. The hygiene ratchet cannot see absolute `/Users/.../reports` paths. `evidence_hygiene_gate.mjs` is not a CI step. Extracted as its own brief: migrate the remaining writers, widen the ratchet, then wire the gate. Do not wire the gate first. |
| C-social-charter | **FIXED** (the stale sentence) | Charter 5.3 now records the CI social DOM gate. A scored quality read of the vocabulary swap is still a later wave. |
| C-locale-charter | **FIXED** (the stale present tense) | 4.3 and 5.3 corrected. Named HUD keys are routed. Remainder of the 560 stays parked. |
| C-stale-tracker | **FIXED** for the rows first-hand verified | Closed: TR-090, TR-097, TR-114, TR-086 (both cells), TR-115, Q-25, Q-28, Q-34 chip leftover. Left untouched because this pass did not re-prove them: TR-096, TR-059, AUDIT_CLOSURE Q6 (dated register). |
| C-a11y-gap | **REVIEWED AND KEPT** | Named limit of this pass. Only `a11y_social_terms_check.mjs` exists. No focus order, keyboard-only walk, or screen-reader pass. |
| C-stage2-docs | **FIXED** | `CLAUDE.md` scatter line no longer says "once Stage 2 wires the feature". `COMPLIANCE_WATCH.md` current posture now states the flag hides the buy and bonus-buy replay shows `spinCostMicros`. |
| C-audio-ungated | **REVIEWED AND KEPT** | Named limit. Twelve shipped rows. `audio_verify.mjs` exists and is local-only. Loudness, tails, generic-AI tell: never swept. |

## Refuted clusters

| Id | Disposition | Why |
|---|---|---|
| C-theme-concepts | **REVIEWED AND KEPT** | Already dispositioned. Alternate theme trees are pruned from dist. `App.svelte` forces Future Spinner outside DEV. |
| C-reel-v3 | **REVIEWED AND KEPT** | Already named as the unrun animation-quality wave. `reel_v3_proof.mjs` is local on purpose (`checks.yml` 17-21). |

## Dropped by the marshal (9), still dispositioned

| Finding | Disposition |
|---|---|
| scaffold-01 Q-27 remnants | **PARTLY FIXED.** Indigo hover is now brand cyan. `#242424` and `color-scheme` remain. |
| scaffold-02 Q-27 stale remainder list | **FIXED** in the charter row. |
| scaffold-03 Q-28 | **FIXED** (already stripped in vite; charter closed). |
| scaffold-04 stock frontend README | **PARKED.** Developer-facing, not player-facing. |
| scaffold-05 package.json 0.0.0 | **REVIEWED AND KEPT.** Human version is root `VERSION`. |
| inventory-02 LoadingScreen orphan | **PARKED.** Delete with `assetLoadProgress` on a hygiene pass. Already allowlisted. |
| inventory-04 scene-master two homes | **PARKED.** Convention (u) already refuses unlisted sources. |
| inventory-06 missing DEV theme dirs | **PARKED.** Theme selector is DEV only. |
| uncovered-02 social wiring works | **NOT A DEFECT.** |

## Surfaces this pass did not sweep

Audio quality. Social-mode quality (as distinct from the conformance gate).
Accessibility beyond prohibited terms. Animation quality and timing.
Rendered-DOM capitalisation. The locked maths package.

## First-hand spot checks (main loop)

Opened: `gameStore.ts:88-91`, `buyAffordability.ts`, `HudOverlay.svelte`
SPIN disabled and BET format, `FeatureMenu.svelte:128` (before) and the
`$tr` form (after), `replayService.ts:95`, `vite.config.ts` KEEP_UI,
`frontend/dist/index.html` (no comments), `App.svelte:1972-1975` replay
exclusive mount, `money_fit_gate.mjs` header, the four evidencePaths
imports named by TR-090/097.

Tests run after the fix: `modalGuard.test.ts` PASS including the new
OVERBOOST cases; `replayLocale.test.ts` PASS including `social=1`;
`dead_wiring_scan.mjs` PASS with `canSpin` allowlisted.

## Agent accounting

Discover x8 COMPLETED. Marshal x1 COMPLETED. Verify x16 COMPLETED.
Lost: none.
