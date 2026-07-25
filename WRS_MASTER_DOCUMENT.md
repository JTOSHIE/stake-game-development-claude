# WRS MASTER DOCUMENT
Living register of everything We Roll Spinners must hold, maintain and carry forward across titles. Update statuses in place; log changes in section 9. Owners: JOSH (owner), FABLE (strategist/verifier), CC (Claude Code builder). Status values: DONE, IN PROGRESS, OPEN, GATE (blocks submission).

## 1. COMPANY REGISTER (owner-side, off-repo unless noted)
| Item | Status | Owner | Notes |
|---|---|---|---|
| Business structure and tax advice (AU) | OPEN | JOSH | Engage an accountant on: sole trader vs company for publisher income, ABN, GST registration threshold (AUD 75k), treatment of Stake Engine payouts, record keeping. Neither Fable nor any doc here is legal or tax advice. |
| Trademark clearance: "We Roll Spinners", "Future Spinner" | DONE | JOSH | Platform rule: team names, game titles and assets must comply with IP law; infringement is grounds for rejection. Searches run against IP Australia (exact-phrase 2026-07-15, variant scan classes 9/41 2026-07-18) and USPTO (owner-conducted 2026-07-23); records at docs/records/trademark/2026-07-15/SEARCH_LOG.md. Fable's similarity review (2026-07-23) found both names clear on the AU dataset; USPTO checks attested clear by the owner. Documented pragmatic clearance based on official-register searches and Fable's similarity review, not a formal legal opinion; engage a trademark professional before any enforcement action or if the names are ever challenged. |
| Stake Engine developer ToS acceptance | DONE | JOSH | Accepted at account creation. Record date if known. Re-read before submission; post-approval lockdown and removal conditions bind us. |
| Licence archive | IN PROGRESS | JOSH | Folder ~/Desktop/fs_audio/licences/ plus in-repo copies. Holds: Stability AI Community License (tools/audio_forge/LICENSE.md, NOTICE), audio provenance (reports/audio/GENERATION_LOG once JOB 1 lands), any CC0 source notes. Add every future tool licence at adoption time. Public tool terms are auto-archived in-repo by builder sessions at adoption time (docs/licences/); owner-held Desktop archives are reserved for purchase receipts and paid licence documents only. |
| Stability revenue threshold watch | OPEN | JOSH | Community License is free for commercial use under USD 1,000,000 annual revenue. If WRS approaches it, an enterprise licence is required. Review at each tax year end. |
| Prohibited-tool register | DONE | FABLE | ElevenLabs: prohibited for real-money gambling without written authorisation (verified 2026). Google Lyria: music-only, watermarked, unsuitable. Suno/Udio: avoid for shipped assets (post-settlement terms unverified for gambling). Check any new AI tool's gambling stance BEFORE spending. |
| Provider brand assets | IN PROGRESS | FABLE/JOSH | Square provider logo (transparent PNG) for Team Settings > Branding, displayed publicly on stake.com. Josh uploads once. OWNER AUDIT ROUND 3 (2026-07-25) canonicalised the hero emblem as the sole WRS mark: provider upload file is `design-system/brand/hero_emblem/master_512.png`; in-game icon set is hero-derived (`design-system/brand/hero_icon/`, `tools/brand/derive_hero_icon.py`); the flat vector-mark track (v2/v3) is retired to `design-system/brand/archive/vector_mark/` (see its `SUPERSEDED.md`). |
| Payment details for publisher payouts | OPEN | JOSH | Configure in team settings before first payout cycle. **Payments docs: https://stake-engine.com/docs/payments** (captured 2026-07-25 to `docs/stake-engine-live/2026-07-25/payments.md`). A model choice is required, switchable per team at any time with effect from the following month: **10% GGR (Revenue Share)** on actual GGR, where a negative month records a carry-forward debt that pauses payouts until cleared, with no time limit and no out-of-pocket liability; or **7.5% Guaranteed** on expected GGR derived from the game's RTP, where no debt can accrue and Stake absorbs the variance. One wallet per team. Payouts run on the 1st of each month, invoice first then funds within 12 hours, any amount above $0.00. Owner decision, not a build item. **The one-timer is to be done against the CAPTURED doc, `docs/stake-engine-live/2026-07-25/payments.md`, not against the live page** (Fable ruling 14, 2026-07-26): the live site changes without notice or effective dates, so the captured copy is what our decision and this register were reasoned from. Re-check the live page only via the section 5g final docs delta sweep. |
| Studio web presence | OPTIONAL | JOSH | Not required by platform. |

## 2. PLATFORM REGISTER (Stake Engine obligations)
- Review model: 3 anonymous reviewers, fractional scores (0 to 3 in ~0.33 steps), rounded average; average below 1.0 = not published, thread locked 7 days, then resubmission allowed. Target: 3 stars.
- Post-approval lockdown: only minor cosmetic updates after approval; NO math changes, NO new modes, NO gameplay changes. Everything ships final.
- Exclusivity/content: original designs only; no Stake/Kick branding; nothing appealing to minors; reviewer discretion on taste.
- Dual-platform: auto-considered for stake.com and stake.us; social-mode language must pass (JOB 9b audits strings).
- Ranking: released games start at the bottom of New Releases; re-ranked every Friday (AU time).
- Static-only rule: build reaches no external source (fonts included). Conformance sweep in JOB 2 extensions.
- Key doc URLs (CORRECTED 2026-07-25, the previous list used the `/docs/approval/...` paths, which are the **public GitHub repository's** route tree and are NOT the live site): live paths are /docs/approval-guidelines, /docs/approval-guidelines/math-verification, /docs/approval-guidelines/submission-checklist, /docs/approval-guidelines/jurisdiction-requirements, /docs/approval-guidelines/game-quality-rankings, /docs/approval-guidelines/game-tile-requirements, /docs/approval-guidelines/game-replay-requirements, /docs/payments (all under stake-engine.com). Mirrored locally under docs/stake-engine-live/, dated captures from 2026-07-25 onward.
- **The public repository is NOT the source of truth.** `StakeEngine/docs` on GitHub (commit `fefadc7`, last updated 2026-03-17) is stale and structurally diverged from the deployed site: it still advertises the old 90.0 to 98.0 RTP range and carries none of the automated bet-level limits. Compliance questions are answered from the live site or our dated mirror, never from the repository. See `docs/stake-engine-live/2026-07-25/DELTA_NOTES.md`.

- **Discord announcements are a first-class intelligence source** (Fable ruling 14, 2026-07-26). The platform announces changes there that reach the docs late or not at all, and the docs carry no effective dates. The owner relays announcements as they appear; they are recorded here and in `COMPLIANCE_WATCH.md` with the date relayed, and treated as **intel pending first-party confirmation** in the same way as the section 2c roadmap items, not as verified rules. Anything that would change a limit or a required behaviour triggers an immediate docs delta sweep rather than waiting for the section 5g gate.

### 2a. New platform rules captured 2026-07-25, with our status

| # | Rule | Limit | Our position | Status |
|---|---|---|---|---|
| 1 | **RTP ceiling lowered** for new submissions | 90.0 to **96.70%** (was 90.0 to 98.0) | **96.3500%** in all five modes, spread 0.0000pp against a 0.5% allowance | **PASS**, margin 0.35pp. Flagged as the tightest proportional figure we carry (99.64% of the permitted ceiling). Any future RTP lift breaches. |
| 2 | **File size restrictions** (publish-time hard failure, not a review opinion) | No events file over **4.2GB**; no mode over **10,000,000 events** | **100,000 rounds per mode**, roughly two orders of magnitude inside the cap | **PASS**, wide margin. Constrains any future decision to raise simulation counts. |
| 3 | **Automated bet-level verification limits** per star tier: maximum exposure, maximum payout multiplier, maximum bet cost, maximum cost multiplier, base SD floor and ceiling, P(>=5000x), P(>=10000x), CVaR, and ETL at two thresholds | See `COMPLIANCE_WATCH.md` 2026-07-25 section for the full table, both tiers | Every determinable constraint passes on **both** tiers, most by wide margins. Independently recomputed from the shipped tables in `reports/qa/math_bet_level_compliance_2026-07-25.md` | **PASS**, with two proximity flags and one open definition question, below. |

Notes on rule 3:
- **3-star Maximum Exposure doubled**, $25,000,000 to **$50,000,000**, between our 2026-07-04 and 2026-07-25 captures. A loosening in our favour at our target tier.
- **Proximity flag:** worst-case ETL(>=40x cost) is 0.6654 (OVERBOOST), which is 73.93% of the 3-star limit but **83.17% of the 2-star limit**, inside the 20% flagging band should a rounded reviewer average land us at 2 stars. Still passes there.
- **OPEN, CVaR definition.** The published definition is ambiguous on three axes at once (worst 0.1% or 1%, normalised or absolute, worst-case-across-modes or base only). The plausible readings pass comfortably; one implausible reading fails badly. Resolved procedurally, not analytically: the ACP **Math Distribution and Summary** screen is now a **mandatory pre-review gate** at `SUBMISSION_DOSSIER.md` section 5f, where the platform's own figures are definitive and any value outside a limit stops the submission.

### 2b. Distribution targets

- **stake.com** (real money): primary. On track.
- **stake.us** (social): auto-considered, contingent on the jurisdiction language rules. **Currently BLOCKED** by six visible player-facing prohibited-term strings found 2026-07-25 (`BET`, `1x bet` x2, `1.25x bet`, `BUY FEATURES`, `BET MODES`, all in the Feature Menu). Reported not fixed: wording is Fable's ruling per JOB 9b. See `reports/qa/currency_readiness_2026-07-25.md`.
- **Stake EU** (sweepstakes): **CONTINGENT, and its premise is unverified.** The brief records an XEC/SC sweepstakes currency introduction for Stake EU. This session could not confirm **XEC** against three independent first-party sources (the live site, the docs repository, and the official `StakeEngine/ts-client` SDK's `Currency` union, which lists 34 fiat codes plus XGC and XSC and nothing else). What is real and now implemented is the **SC/GC family** (`XSC`/`XGC`, plus the `SC`/`GC` short forms the replay flow uses). Do not record XEC as supported until a first-party source exists. Also open: two first-party sources say sweepstakes amounts render **trailing** (`10.00 SC`) while the brief specifies **leading** (`SC 1,000`); we ship the brief's form behind a single flip constant pending a ruling.

### 2c. Roadmap intel (UNVERIFIED by this session, recorded as intel not fact)

Carried from the 2026-07-25 brief. **No first-party source for any of the three was found** in this session's docs sweep; they are recorded so they are not lost, explicitly marked as unverified, and must not be treated as platform commitments or planned against without corroboration.

- **Multi-operator expansion:** Stake Engine games reaching operators beyond Stake's own properties. Would change the exclusivity calculus in section 2 if true.
- **Regulatory push:** increased regulatory posture, consistent in direction with the observed tightening of the RTP ceiling and the introduction of automated bet-level risk limits, both of which ARE verified.
- **Rebrand:** a platform rebrand. Would affect the "no Stake branding" asset rule and our doc URLs if it lands.

## 3. FUTURE SPINNER DOCUMENT REGISTRY (in-repo paths)
### 3a. Player-facing (the "user manual"; review requirement)
| Artefact | Path | Status |
|---|---|---|
| Rules and paytable UI (all rules, per-mode cost, per-mode RTP, per-mode max win, all symbol pays, special values, feature access) | frontend PaytableModal + rules UI | IN PROGRESS (JOB 5b) |
| UI button guide | frontend (new) | OPEN (JOB 5b) |
| Submission blurb | reports/archive/superseded/PROMO_BLURB.md / dossier s3 | GATE (owner approval of amended wording; soundtrack line restores after audio ships). The stale pre-Overdrive `SUBMISSION_BLURB.md` (flagged in JOB 6's reports/archive/superseded/AUDIT_PACK_INDEX.md) was moved to `reports/archive/SUBMISSION_BLURB_superseded.md` with a SUPERSEDED header in the 2026-07-14 work order's ITEM 0 - resolved. |
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
| Math validation record | reports/archive/superseded/MATH_VALIDATION.md; scripts/validate_math.py | DONE (re-run fresh against the final merged main during the 2026-07-14 sweep, all-pass) |
| RGS contract reference | docs/RGS_CONTRACT_REFERENCE.md | DONE |
| Telemetry taxonomy (no-op default) | docs/TELEMETRY_TAXONOMY.md | DONE (no-op confirmed at built-bundle level in JOB 3) |
### 3c. Portal artefacts
| Artefact | Status |
|---|---|
| Tile background layer (hi-res scene) | OPEN, now scaffolded - AssetForge output slot added in JOB 7 (`scripts/assets/manifest.json`'s `storefront_tile.tile_background`, inert until Fable delivers the master SVG). No existing master fits; genuinely new art needed. Note: the published Stake tile spec has no pixel dimensions or text-safe-area guidance at all - the scaffold's w/h values are provisional defaults, not an official number; confirm against the dashboard Tile Editor. |
| Tile foreground layer (pilot+car transparent PNG) | OPEN, now scaffolded (same manifest, `tile_foreground_hero`). `scene_character_car.svg` (the existing in-game identity-character master) is a strong reference/starting point for Fable rather than a from-scratch design, but still needs isolated re-crop/re-composition work - not a straight reuse. |
| Provider logo (square, transparent) | IN PROGRESS - OWNER AUDIT ROUND 3 (2026-07-25) superseded the JOB 7 `brand_mark.svg` candidate: the hero emblem is now the sole WRS mark, so the provider upload file is `design-system/brand/hero_emblem/master_512.png` (ratified 2026-07-15). Note this master is flat RGB with a solid dark background (`#080A16`), not alpha-transparent - the row's "transparent" requirement is not literally met by this file; needs either an alpha-channel re-export of the same master or an explicit owner waiver before upload. `brand_mark.svg`/the flat vector-mark track are retired to `design-system/brand/archive/vector_mark/`. |
| Dossier section 5: ACP staging protocol with doc-URL citations | DONE (JOB 5 merged to main 2026-07-14: full 5a-5e staging protocol, publish_files SHA-256 inventory) |
### 3d. Process record
| Artefact | Path | Status |
|---|---|---|
| Living arc handover | reports/archive/handovers/HANDOVER_2026-07-07_Fable.md | DONE, merged |
| Hygiene pass (prompt archive, supersessions) | merged to main (was PR #52) | DONE |
| Known locked-file debts | CLAUDE.md LOCKED_FILE_DEBTS note (canBuyBonus 1x/100x hardcodes, compensated) | DONE |
| External audit pack refresh (pointer + supersession list) | reports/archive/superseded/AUDIT_PACK_INDEX.md | DONE (JOB 6, merged 2026-07-14). The audit itself has not run - this is prep only, per the work order. |
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
- 2026-07-14: Jobs 1-8 of the 2026-07-13 consolidated work order, and reports/archive/superseded/CLAUDE_PROJECT_INSTRUCTIONS_v6.md, all merged to main via a full PR sweep (`reports/archive/2026-07-14_pr-merge-sweep.md`). Ten open PRs resolved to zero; locked files, frontend build and math validation all re-verified clean on the final merged main. Sections 3b/3c/3d above updated to reflect landed work. Two real findings surfaced during the sweep and JOB 6/7 prep, both still open: `SUBMISSION_BLURB.md` (repo root) is stale pre-Overdrive text contradicting the shipped game (3a); the provider logo requirement turns out to already be satisfied by the existing `brand_mark.svg` master, pending only a confirmation, not new art (3c). Remaining before submission: JOB 3b (math self-audit), JOB 5b (in-game rules conformance UI), JOB 9b (social-mode string audit), and the JOB 2 addendum's platform-conformance extensions (a-g) - none of these have started. 24 stale merged remote/local branches cleaned up in the same pass, preserving the two deliberately-named reference branches (`claude/collect-prototype`, `claude/gap-analysis`).
- 2026-07-23: Trademark clearance row (section 1) flipped IN PROGRESS -> DONE. Closed by Fable's AU similarity ruling (both names clear against the 2026-07-18 variant-scan dataset) and the owner's manually-conducted USPTO searches (attested clear); full record at `docs/records/trademark/2026-07-15/SEARCH_LOG.md`, 2026-07-23 entry. Retained as a standing caveat in the row itself: documented pragmatic clearance, not a formal legal opinion; a trademark professional is still required before any enforcement action or if the names are ever challenged.
- 2026-07-25: OWNER AUDIT ROUND 3 item 1 (logo canonicalisation) - the hero emblem is now the sole WRS mark. `tools/brand/derive_hero_icon.py` derives a small circular hero icon (192/96/48/32) from the ratified `hero_emblem/master_1024.png`, committed to `design-system/brand/hero_icon/`; the in-game loading-screen brand mark now uses the 96 derivative. The flat vector-mark track (v2 and v3, 22 files, never wired into the shipped frontend) is retired to `design-system/brand/archive/vector_mark/` with a `SUPERSEDED.md`. Sections 1 and 3c above updated: provider upload file is now `hero_emblem/master_512.png` (noted as flat RGB, not alpha-transparent - the row's own "transparent" requirement needs either a re-export or an owner waiver before upload), superseding the prior `brand_mark.svg` candidate.
- 2026-07-25 (PLATFORM DELTA AND TOOL VETTING): section 2 substantially extended. New subsection 2a records the three new platform rules with our pass status (RTP ceiling 96.70 with our 0.35pp margin; the 10,000,000 events-per-mode and 4.2GB publish-time caps against our 100,000; and the full automated bet-level limit set, all passing on both star tiers). New 2b splits the distribution targets and records stake.us as BLOCKED on six social-string findings and Stake EU as contingent on an XEC premise this session could not verify against three first-party sources. New 2c records the roadmap intel explicitly as UNVERIFIED. The section 1 payment row gains the payments docs link and both payment models. **The "Key doc URLs" line was corrected: it had been listing the public GitHub repository's `/docs/approval/...` route tree, which is not the live site and is four months stale, still advertising the old 90.0 to 98.0 RTP range with none of the risk limits.** Full evidence: `docs/stake-engine-live/2026-07-25/`, `COMPLIANCE_WATCH.md` 2026-07-25 section, `reports/qa/math_bet_level_compliance_2026-07-25.md`, `reports/qa/currency_readiness_2026-07-25.md`, `docs/records/tooling/TOOL_VETTING_2026-07.md`.
