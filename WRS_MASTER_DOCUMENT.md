# WRS MASTER DOCUMENT
Living register of everything We Roll Spinners must hold, maintain and carry forward across titles. Update statuses in place; log changes in section 9. Owners: JOSH (owner), FABLE (strategist/verifier), CC (Claude Code builder). Status values: DONE, IN PROGRESS, OPEN, GATE (blocks submission).

## 1. COMPANY REGISTER (owner-side, off-repo unless noted)
| Item | Status | Owner | Notes |
|---|---|---|---|
| Business structure and tax advice (AU) | OPEN | JOSH | Engage an accountant on: sole trader vs company for publisher income, ABN, GST registration threshold (AUD 75k), treatment of Stake Engine payouts, record keeping. Neither Fable nor any doc here is legal or tax advice. |
| Trademark clearance: "We Roll Spinners", "Future Spinner" | GATE | JOSH | Platform rule: team names, game titles and assets must comply with IP law; infringement is grounds for rejection. Run searches (IP Australia, USPTO, common-law web/app-store search) before submission; keep search records here. |
| Stake Engine developer ToS acceptance | DONE | JOSH | Accepted at account creation. Record date if known. Re-read before submission; post-approval lockdown and removal conditions bind us. |
| Licence archive | IN PROGRESS | JOSH | Folder ~/Desktop/fs_audio/licences/ plus in-repo copies. Holds: Stability AI Community License (tools/audio_forge/LICENSE.md, NOTICE), audio provenance (reports/audio/GENERATION_LOG once JOB 1 lands), any CC0 source notes. Add every future tool licence at adoption time. |
| Stability revenue threshold watch | OPEN | JOSH | Community License is free for commercial use under USD 1,000,000 annual revenue. If WRS approaches it, an enterprise licence is required. Review at each tax year end. |
| Prohibited-tool register | DONE | FABLE | ElevenLabs: prohibited for real-money gambling without written authorisation (verified 2026). Google Lyria: music-only, watermarked, unsuitable. Suno/Udio: avoid for shipped assets (post-settlement terms unverified for gambling). Check any new AI tool's gambling stance BEFORE spending. |
| Provider brand assets | IN PROGRESS | FABLE/JOSH | Square provider logo (transparent PNG) for Team Settings > Branding, displayed publicly on stake.com. Fable authors master next check-in; Josh uploads once. |
| Payment details for publisher payouts | OPEN | JOSH | Configure in team settings before first payout cycle; see manual's publisher payments notes. |
| Studio web presence | OPTIONAL | JOSH | Not required by platform. |

## 2. PLATFORM REGISTER (Stake Engine obligations)
- Review model: 3 anonymous reviewers, fractional scores (0 to 3 in ~0.33 steps), rounded average; average below 1.0 = not published, thread locked 7 days, then resubmission allowed. Target: 3 stars.
- Post-approval lockdown: only minor cosmetic updates after approval; NO math changes, NO new modes, NO gameplay changes. Everything ships final.
- Exclusivity/content: original designs only; no Stake/Kick branding; nothing appealing to minors; reviewer discretion on taste.
- Dual-platform: auto-considered for stake.com and stake.us; social-mode language must pass (JOB 9b audits strings).
- Ranking: released games start at the bottom of New Releases; re-ranked every Friday (AU time).
- Static-only rule: build reaches no external source (fonts included). Conformance sweep in JOB 2 extensions.
- Key doc URLs: /docs/approval/checklist, /docs/approval/math-requirements, /docs/approval/frontend-requirements, /docs/approval/rgs-requirements, /docs/approval/quality, /docs/approval/game-tile, /faq/publishing/exclusivity-requirements (all under stake-engine.com). Mirrored locally under docs/stake-engine-live/.

## 3. FUTURE SPINNER DOCUMENT REGISTRY (in-repo paths)
### 3a. Player-facing (the "user manual"; review requirement)
| Artefact | Path | Status |
|---|---|---|
| Rules and paytable UI (all rules, per-mode cost, per-mode RTP, per-mode max win, all symbol pays, special values, feature access) | frontend PaytableModal + rules UI | IN PROGRESS (JOB 5b) |
| UI button guide | frontend (new) | OPEN (JOB 5b) |
| Submission blurb | PROMO_BLURB.md / dossier s3 | GATE (owner approval of amended wording; soundtrack line restores after audio ships). The stale pre-Overdrive `SUBMISSION_BLURB.md` (flagged in JOB 6's AUDIT_PACK_INDEX.md) was moved to `reports/archive/SUBMISSION_BLURB_superseded.md` with a SUPERSEDED header in the 2026-07-14 work order's ITEM 0 - resolved. |
### 3b. Reviewer-facing evidence
| Artefact | Path | Status |
|---|---|---|
| PAR sheet (5 modes, pre-rev disclosure) | games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md | DONE |
| Math self-audit vs approval criteria | reports/qa/math_selfaudit_*.md | OPEN (JOB 3b, addendum - not the same as the JOB 3 re-validation below, still not started) |
| Compliance watch (dated re-validation) | COMPLIANCE_WATCH.md | DONE (JOB 3 re-validation merged to main 2026-07-14; RG gates, PF determinism 58/58, telemetry no-op confirmed at built-bundle level, three RGS failure paths traced) |
| Wiring integrity audit | reports/qa/wiring_integrity_audit_2026-07-07.md | DONE |
| Statelessness proof (script + result) | scripts/review_events_stateless_scan.py; reports/qa/review_events_statelessness_* | DONE |
| Replay event IDs (5 modes) | REPLAY_TEST_EVENTS.md | DONE |
| Determinism / provably-fair | roundInterpreter.determinism.test.ts; PF_READINESS.md | DONE (re-verified fresh in JOB 3, 58/58 pass) |
| QA re-soak (current, 5 modes, audio, conformance) | reports/qa/ (dated logs) | DONE for the core gates merged in JOB 2 (cost integrity, frame-gate attribution, reduced-motion, reel-mode-toggle absence, real vite-banner bug fixed). OPEN for the addendum's platform-conformance extensions (a-g): same-origin resource sweep, spacebar-triggers-bet assert, mini-player popout screenshots, bet-level conformance incl. high-min currency, language fuzz, incremental win count-up assert, fastplay legibility - none of these are built yet. |
| Build diet + budget | frontend/scripts/build_diet_verify.mjs; reports/qa/build-diet-network-log.json | DONE - JOB 2's and JOB 4's versions of this script were reconciled during the 2026-07-14 merge sweep (both gate sets combined); re-run fresh against the merged main: 13.59MB dist, all gates pass (zero 404s/pruned-hits/console errors, dist under 25MB, reel-toggle absent, reduced-motion CSS present). |
| Audio provenance | reports/audio/GENERATION_LOG_2026-07-13.md; sounds/README.md | DONE (JOB 1 merged to main 2026-07-14) |
| Math validation record | MATH_VALIDATION.md; scripts/validate_math.py | DONE (re-run fresh against the final merged main during the 2026-07-14 sweep, all-pass) |
| RGS contract reference | docs/RGS_CONTRACT_REFERENCE.md | DONE |
| Telemetry taxonomy (no-op default) | docs/TELEMETRY_TAXONOMY.md | DONE (no-op confirmed at built-bundle level in JOB 3) |
### 3c. Portal artefacts
| Artefact | Status |
|---|---|
| Tile background layer (hi-res scene) | OPEN, now scaffolded - AssetForge output slot added in JOB 7 (`scripts/assets/manifest.json`'s `storefront_tile.tile_background`, inert until Fable delivers the master SVG). No existing master fits; genuinely new art needed. Note: the published Stake tile spec has no pixel dimensions or text-safe-area guidance at all - the scaffold's w/h values are provisional defaults, not an official number; confirm against the dashboard Tile Editor. |
| Tile foreground layer (pilot+car transparent PNG) | OPEN, now scaffolded (same manifest, `tile_foreground_hero`). `scene_character_car.svg` (the existing in-game identity-character master) is a strong reference/starting point for Fable rather than a from-scratch design, but still needs isolated re-crop/re-composition work - not a straight reuse. |
| Provider logo (square, transparent) | IN PROGRESS (sign-off only, no art needed) - JOB 7 found `brand_mark.svg` is already documented as the WRS provider logo (`design-system/DESIGN_SYSTEM.md`) and already exports at 512x512 (`ui/brand_mark.png`) and 192x192 (`ui/brand_mark_glyph.png`), both transparent PNG. No new art needed; only needs Fable/owner confirmation to use the existing export for the Team Settings upload. |
| Dossier section 5: ACP staging protocol with doc-URL citations | DONE (JOB 5 merged to main 2026-07-14: full 5a-5e staging protocol, publish_files SHA-256 inventory) |
### 3d. Process record
| Artefact | Path | Status |
|---|---|---|
| Living arc handover | HANDOVER_2026-07-07_Fable.md | DONE, merged |
| Hygiene pass (prompt archive, supersessions) | merged to main (was PR #52) | DONE |
| Known locked-file debts | CLAUDE.md LOCKED_FILE_DEBTS note (canBuyBonus 1x/100x hardcodes, compensated) | DONE |
| External audit pack refresh (pointer + supersession list) | AUDIT_PACK_INDEX.md | DONE (JOB 6, merged 2026-07-14). The audit itself has not run - this is prep only, per the work order. |
| PR merge sweep (all ten open PRs resolved) | reports/archive/2026-07-14_pr-merge-sweep.md | DONE 2026-07-14. Zero open PRs remain. Two genuinely stale branches (JOB 1's carrier branch, and the oldest pre-work-order incremental-logging fix) needed real reconciliation; the other eight were already correctly merged against the post-hygiene-pass main by the sessions that created them. Locked files, frontend build and math validation all re-verified clean on the final merged main. |
| Round-two audio slots (bonus_trigger, buy_confirm, wild_land, coin_count, win_max, ambience_rain) | reports/archive/2026-07-14_job8-audio-round2-placeholder.md | OPEN, deliberately deferred (JOB 8) - gated on the owner playing the JOB 1 build and Fable ruling on the mix. Not started, by design. |

## 4. TESTING GATES BEFORE SUBMISSION (evidence lands in reports/qa/)
1. Five-mode QA re-soak: cost integrity (integer micros), buy boundary, OVERBOOST cost visibility, drop default, reduced motion. (JOB 2)
2. Audio pass: all files 200, event firing, bed swap, gesture-gated start, mute/slider persistence. (JOB 1f)
3. Platform conformance: same-origin resource sweep (fonts), spacebar bet, mini-player popout, bet-level conformance incl. high-min currency, language fuzz, incremental win count-up, fastplay legibility. (JOB 2 ext)
4. Math self-audit per approval page. (JOB 3b)
5. Compliance re-validation incl. RGS failure paths. (JOB 3)
6. Budget re-verify under 25MB with audio. (JOB 4)
7. Social-mode string audit. (JOB 9b)
8. External audit refresh on current artefacts only. (JOB 6, then separate fresh session)
9. Fable independent verification: mastered-audio measurement, code-risk review, recomputation of any new maths claims, final checklist walk. (Fable, next check-ins)
10. Owner play-test on the preview URL, all five modes, phone and desktop. (JOSH)

## 5. SUBMISSION RECORD (fill at submission; append per attempt)
Attempt #: | Date: | Build commit: | Math package hashes: | Blurb version: | Reviewer thread notes: | Scores (3x fractional): | Final stars: | Outcome: | Follow-ups:

## 6. POST-RELEASE OPERATIONS
- Change policy: cosmetic-only; anything else requires Stake's request. Plan features into the NEXT title instead (Collection Meter prototype lives on claude/collect-prototype for this reason).
- Weekly: check Friday re-rank position; monitor approval-thread/messages; record payments per cycle against the payments register.
- Licence watch: Stability revenue threshold; keep provenance folder current.

## 7. NEXT-TITLE TEMPLATE (applies to LUMEN, queued after Future Spinner submits)
Reuse in order: maths package + validate_math + PAR -> wiring integrity audit pattern -> statelessness/replay evidence -> AssetForge + AudioForge (new seeds/prompts) -> rules/paytable/UI guide conformance -> QA soak + platform conformance suite (all scripts are reusable) -> math self-audit -> compliance watch -> dossier from this register's 3a-3d -> tile layers -> submit. Company layer (section 1) does not repeat; only per-title rows do.

## 8. STANDING ANSWERS
- User manual: none exists as a separate artefact anywhere on Stake; the in-game rules/paytable/UI guide is the user manual and a review requirement.
- Technical docs for Stake: nothing beyond the uploaded math package and static frontend; internal evidence (3b) exists to answer reviewer questions and for our own verification discipline.
- Gambling licence: WRS does not hold operator licences; games publish under Stake's operation via the Stake Engine ToS. Owner to confirm personal/company legal position with a professional (see 1).

## 9. CHANGE LOG
- 2026-07-13: Document created (Fable). Statuses reflect main at PR #54 with PRs #52/#53 approved and awaiting merge.
- 2026-07-14: Jobs 1-8 of the 2026-07-13 consolidated work order, and CLAUDE_PROJECT_INSTRUCTIONS_v6.md, all merged to main via a full PR sweep (`reports/archive/2026-07-14_pr-merge-sweep.md`). Ten open PRs resolved to zero; locked files, frontend build and math validation all re-verified clean on the final merged main. Sections 3b/3c/3d above updated to reflect landed work. Two real findings surfaced during the sweep and JOB 6/7 prep, both still open: `SUBMISSION_BLURB.md` (repo root) is stale pre-Overdrive text contradicting the shipped game (3a); the provider logo requirement turns out to already be satisfied by the existing `brand_mark.svg` master, pending only a confirmation, not new art (3c). Remaining before submission: JOB 3b (math self-audit), JOB 5b (in-game rules conformance UI), JOB 9b (social-mode string audit), and the JOB 2 addendum's platform-conformance extensions (a-g) - none of these have started. 24 stale merged remote/local branches cleaned up in the same pass, preserving the two deliberately-named reference branches (`claude/collect-prototype`, `claude/gap-analysis`).
