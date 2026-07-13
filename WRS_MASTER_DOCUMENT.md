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
| Submission blurb | SUBMISSION_BLURB.md / dossier s3 | GATE (owner approval of amended wording; soundtrack line restores after audio ships) |
### 3b. Reviewer-facing evidence
| Artefact | Path | Status |
|---|---|---|
| PAR sheet (5 modes, pre-rev disclosure) | games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md | DONE |
| Math self-audit vs approval criteria | reports/qa/math_selfaudit_*.md | OPEN (JOB 3b) |
| Compliance watch (dated re-validation) | COMPLIANCE_WATCH.md | IN PROGRESS (JOB 3) |
| Wiring integrity audit | reports/qa/wiring_integrity_audit_2026-07-07.md | DONE |
| Statelessness proof (script + result) | scripts/review_events_stateless_scan.py; reports/qa/review_events_statelessness_* | DONE |
| Replay event IDs (5 modes) | REPLAY_TEST_EVENTS.md | DONE |
| Determinism / provably-fair | roundInterpreter.determinism.test.ts; PF_READINESS.md | DONE (re-verify in JOB 3) |
| QA re-soak (current, 5 modes, audio, conformance) | reports/qa/ (new dated logs) | OPEN (JOB 2 + extensions) |
| Build diet + budget | frontend/scripts/build_diet_verify.mjs; report | IN PROGRESS (JOB 4 re-run with audio) |
| Audio provenance | reports/audio/GENERATION_LOG_2026-07-13.md; sounds/README.md | OPEN (JOB 1e) |
| Math validation record | MATH_VALIDATION.md; scripts/validate_math.py | DONE |
| RGS contract reference | docs/RGS_CONTRACT_REFERENCE.md | DONE |
| Telemetry taxonomy (no-op default) | docs/TELEMETRY_TAXONOMY.md | DONE (confirm no-op in JOB 3) |
### 3c. Portal artefacts
| Artefact | Status |
|---|---|
| Tile background layer (hi-res scene) | OPEN (Fable art master next check-in; AssetForge slot via JOB 7) |
| Tile foreground layer (pilot+car transparent PNG) | OPEN (same) |
| Provider logo (square, transparent) | OPEN (same) |
| Dossier section 5: ACP staging protocol with doc-URL citations | OPEN (JOB 5) |
### 3d. Process record
| Artefact | Path | Status |
|---|---|---|
| Living arc handover | HANDOVER_2026-07-07_Fable.md | DONE (PR #53 merge pending) |
| Hygiene pass (prompt archive, supersessions) | PR #52 | APPROVED, merge pending |
| Known locked-file debts | CLAUDE.md LOCKED_FILE_DEBTS note (canBuyBonus 1x/100x hardcodes, compensated) | DONE |

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
