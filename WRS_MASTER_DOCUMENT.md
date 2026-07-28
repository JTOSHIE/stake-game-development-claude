# WRS MASTER DOCUMENT
Living register of everything We Roll Spinners must hold, maintain and carry forward across titles. Update statuses in place; log changes in section 9. Owners: JOSH (owner), FABLE (strategist/verifier), CC (Claude Code builder). Status values: DONE, IN PROGRESS, OPEN, GATE (blocks submission).

## 1. COMPANY REGISTER (owner-side, off-repo unless noted)

**PRIVACY RULE, owner's order 2026-07-28 and binding on every future session.** This repository
is PUBLIC. This register carries **facts only**. No personal document, no residential or
business address, no ABN, no account number and **no wallet address** is ever committed here or
anywhere else in the repository, whatever form it arrives in. Where a value exists but must not
be published, the register records **that it exists and where it is held**, and nothing more.

**Applied on the day the rule was written**, so it is a practice rather than an aspiration: two
of the owner's captures from 2026-07-28 showed the full USDT payout address, one of them beside
an empty Home/Work Address field. **Neither was committed.** The four captures from the same
sitting that carried no personal data were. The rule cost two files and it is worth it: a
payout address in a public repository is permanent, is trivially linked to revenue, and cannot
be withdrawn once indexed.

| Item | Status | Owner | Notes |
|---|---|---|---|
| **Business name registration (ASIC)** | **DONE 2026-07-27** | JOSH | **We Roll Spinners**, registered with ASIC **27 July 2026**, renewal due **28 July 2027**. Held by the owner's incorporated entity; the **ABN is on file offline** and is deliberately not recorded here. **Diarise the renewal**: a lapsed business name is a live compliance problem on a platform that requires the publisher name to match. |
| **Domain** | **DONE** | JOSH | `werollspinners.com` live. |
| **Platform payment model** | **DONE, CHOSEN 2026-07-28** | JOSH | **Profit Share, 10 percent GGR.** Evidence: `reports/screens/live-portal-2026-07-28/082628_frame.png`, which shows Profit Share selected against Guaranteed at 7.5 percent. Reasoned from the captured doc `docs/stake-engine-live/2026-07-25/payments.md` per Fable ruling 14, not from the live page. Switchable per team with effect from the following month. |
| **Payout wallet** | **DONE, CONFIGURED 2026-07-28** | JOSH | Configured on the platform. **ERC-20, USDT.** The address is **held offline only and is never recorded in this repository**, per the privacy rule above. Two facts from the platform's own wallet page that are worth carrying: payouts run at the beginning of each month for the previous month, and **failed payments cannot be recovered**, so the address is worth re-reading before the first payout cycle. |
| Business structure and tax advice (AU) | OPEN | JOSH | Engage an accountant on: sole trader vs company for publisher income, ABN, GST registration threshold (AUD 75k), treatment of Stake Engine payouts, record keeping. Neither Fable nor any doc here is legal or tax advice. |
| Trademark clearance: "We Roll Spinners", "Future Spinner" | **SEARCHES COMPLETE, EVIDENCE SUMMARISED, GATE SATISFIED 2026-07-28** | JOSH | Platform rule: team names, game titles and assets must comply with IP law; infringement is grounds for rejection. Searches run against IP Australia (exact-phrase 2026-07-15, variant scan classes 9/41 2026-07-18) and USPTO (owner-conducted 2026-07-23); records at docs/records/trademark/2026-07-15/SEARCH_LOG.md. Fable's similarity review (2026-07-23) found both names clear on the AU dataset; USPTO checks attested clear by the owner. Documented pragmatic clearance based on official-register searches and Fable's similarity review, not a formal legal opinion; engage a trademark professional before any enforcement action or if the names are ever challenged. **USPTO WORDMARK SEARCHES RE-RUN 2026-07-28 for both names, with the owner's captures committed as evidence** at `reports/screens/live-portal-2026-07-28/`, frames `082429` and `082546`. **What the committed frames show**, read off them rather than summarised from memory: `"Future Spinner"` returns 14,407 results, and the two visible marks are both `SPINNER` in IC 028, both **DEAD / CANCELLED**; `"future spin"` returns 16,693 results, and the first is **FUTURE SPIN**, serial **88852459**, **IC 041 entertainment services and online games**, owner **LIGHT & WONDER, INC.**, status **DEAD / ABANDONED**. **No live exact match was observed for either name.** The nearest neighbours are therefore a dead abandoned filing in our own class and registrations in IC 028, which is different goods. **One qualification, stated because it matters more than the conclusion:** the owner also reports a LIVE `SPINNERS` registration in IC 028 for different goods; that particular record is NOT visible in the committed frames, so it is recorded here as the owner's observation rather than as something this register has verified. **An attorney clearance opinion remains OPTIONAL and is not held.** Everything above is a documented pragmatic clearance from official-register searches, not a legal opinion, and the builder gives no view on whether an abandoned neighbouring mark clears our use. |
| Stake Engine developer ToS acceptance | DONE | JOSH | Accepted at account creation. Record date if known. Re-read before submission; post-approval lockdown and removal conditions bind us. |
| Licence archive | IN PROGRESS | JOSH | Folder ~/Desktop/fs_audio/licences/ plus in-repo copies. Holds: Stability AI Community License (tools/audio_forge/LICENSE.md, NOTICE), audio provenance (reports/audio/GENERATION_LOG once JOB 1 lands), any CC0 source notes. Add every future tool licence at adoption time. Public tool terms are auto-archived in-repo by builder sessions at adoption time (docs/licences/); owner-held Desktop archives are reserved for purchase receipts and paid licence documents only. |
| Stability revenue threshold watch | OPEN | JOSH | Community License is free for commercial use under USD 1,000,000 annual revenue. If WRS approaches it, an enterprise licence is required. Review at each tax year end. |
| Prohibited-tool register | DONE | FABLE | ElevenLabs: prohibited for real-money gambling without written authorisation (verified 2026). Google Lyria: music-only, watermarked, unsuitable. Suno/Udio: avoid for shipped assets (post-settlement terms unverified for gambling). Check any new AI tool's gambling stance BEFORE spending. |
| Provider brand assets | IN PROGRESS | FABLE/JOSH | Square provider logo (transparent PNG) for Team Settings > Branding, displayed publicly on stake.com. Josh uploads once. OWNER AUDIT ROUND 3 (2026-07-25) canonicalised the hero emblem as the sole WRS mark: provider upload file is `design-system/brand/hero_emblem/master_512.png`; in-game icon set is hero-derived (`design-system/brand/hero_icon/`, `tools/brand/derive_hero_icon.py`); the flat vector-mark track (v2/v3) is retired to `design-system/brand/archive/vector_mark/` (see its `SUPERSEDED.md`). |
| Payment details for publisher payouts | **SUPERSEDED by the two rows above, DONE 2026-07-28** | JOSH | Configure in team settings before first payout cycle. **Payments docs: https://stake-engine.com/docs/payments** (captured 2026-07-25 to `docs/stake-engine-live/2026-07-25/payments.md`). A model choice is required, switchable per team at any time with effect from the following month: **10% GGR (Revenue Share)** on actual GGR, where a negative month records a carry-forward debt that pauses payouts until cleared, with no time limit and no out-of-pocket liability; or **7.5% Guaranteed** on expected GGR derived from the game's RTP, where no debt can accrue and Stake absorbs the variance. One wallet per team. Payouts run on the 1st of each month, invoice first then funds within 12 hours, any amount above $0.00. Owner decision, not a build item. **The one-timer is to be done against the CAPTURED doc, `docs/stake-engine-live/2026-07-25/payments.md`, not against the live page** (Fable ruling 14, 2026-07-26): the live site changes without notice or effective dates, so the captured copy is what our decision and this register were reasoned from. Re-check the live page only via the section 5g final docs delta sweep. |
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
| Tile, composed portrait master | **DONE 2026-07-26.** The owner supplied a finished composed tile, ingested byte-identical as `design-system/brand/tile/tile_composed_master.png` and delivered as `FutureSpinner-Tile.png`. It is **408x546**, which turns out to be the platform's own published tile geometry: the docs give no pixel dimensions anywhere, so it was MEASURED across a live sample of published tiles from the public FAIR catalogue, 81 of 87 decoded at exactly 408x546 (`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`). **This closes the "provisional defaults, not an official number" note carried on the rows below since JOB 7.** The same survey found the platform sets the game title and publisher name as TYPE on the tile itself, which nothing in the requirements page mentions. |
| Tile background layer (hi-res scene) | DONE as a layer, `tile_background_master.jpg` (2048x1152, landscape), delivered as `FutureSpinner-BG.jpg`. Retained beside the composed master because the requirements page asks for separate BG and FG files and **nobody here has opened the portal's Design Thumbnail editor**, so which form it takes is unknown. Both forms ship. |
| Tile foreground layer (pilot+car transparent PNG) | DONE as a layer, `tile_hero_full.png` (4159x1875, landscape), delivered as `FutureSpinner-FG.png`. **The layers could not be derived from the composed master, and that was tested rather than assumed**: about a fifth of the frame would need painting to recover a complete background behind the character, the type is baked into the pixels, and 37.6% of the character silhouette has no confident matte edge. Measurements and proof sheet at `design-system/brand/tile/TILE_LAYER_DERIVATION.md`. The composed master is the composition REFERENCE if the editor wants layers, not a source to cut them from. |
| Provider logo (square, transparent) | **DONE 2026-07-26, pending only the owner's upload.** The delivery is `design-system/brand/delivery/WeRollSpinners-Logo.png`, candidate **f** at its native 1024, which carries a real alpha channel so the "transparent" requirement is met by the artwork rather than by a waiver. This supersedes the earlier hero-emblem and `brand_mark.svg` positions recorded on this row, and the alpha caveat they carried is closed. Candidate **g**, an owner-supplied 25-file variant pack that arrived the same day, was TESTED against f rather than filed beside it: f took 3 of 3 legibility measures at 32px and 2 of 3 at every other size on the ladder, so the delivered file did not change (`design-system/brand/provider_mark/PROVIDER_LOGO_DERIVATION.md`). g is superseded for the portal mark and adopted as the **studio brand set** for favicon, site and print, kept in whole at `design-system/brand/provider_mark/pack_g/`. |
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

### 3e. Process protocol: MULTI-TRACK (owner's order, 2026-07-26, standing; amended 2026-07-28, the capacity amendment)

Mirrored from `CLAUDE.md`, which holds the authoritative text. Recorded here
because this document is the register a reader opens first, and a protocol nobody
finds is a protocol nobody follows.

Until now this project has had exactly one writer working one job at a time on
`main`. That is why the record is coherent, and nothing here weakens it. What
changes is that more than one session may now work at once.

Amended 2026-07-28 (V3, the capacity amendment,
`reports/briefs/FS_PROTOCOL_V3_CAPACITY_Prompt.md`): rule 4 replaced, rules 13
and 14 added. The recorded reason is the owner's capacity change: sessions now
run under a large allowance. `CLAUDE.md` holds the authoritative amended text
and preserves the replaced rule 4 beside it.

| # | Rule |
|---|---|
| 1 | **`main` is single-writer.** Exactly one session at a time holds the INTEGRATOR role, and only it merges or pushes `main`. Every other session works on a branch and delivers by pull request. |
| 2 | **A track is a branch plus a manifest.** `track/<name>`, and a committed scope manifest at `docs/records/tracks/<name>.manifest` listing path globs, declared in the track's brief. Tracks deliver by pull request only. |
| 3 | **Parallel tracks require provably disjoint scopes.** Not unlikely to collide: disjoint, checkable by comparing manifests. Overlap forces sequence rather than a merge policy. |
| 4 | **Under a large allowance, multi-wave sessions running parallel agent squads per `docs/skills/FULL_AUDIT_METHOD.md` are the DEFAULT for audit, verification, capture, documentation and sweep work.** Squads are sized per convention (r), one coherent surface each, writing to ledger shards consolidated by a marshal, with the session as sole committer. Sequential single-job sessions remain mandatory only for locked-file surgery and for any change to the money path, where serial care outranks parallel speed. (Replaced 2026-07-28 by the capacity amendment; the prior one-job-per-session text is preserved beside the authoritative rule in `CLAUDE.md`.) |
| 5 | **Model policy.** Sonnet High for mechanical and suite work; Opus for judgement; xHigh and above reserved for a single hard bounded problem in a short surgical session. The twice-failed escalation rule stands (`CLAUDE_PROJECT_INSTRUCTIONS_v7.md`: a brief failing its gates twice escalates one tier). |
| 6 | **Hard problems are extracted, not solved mid-flow.** A hard bounded problem found inside a job is written up as its own surgical brief and handed back, rather than absorbed into the session that found it. |
| 7 | **Fable verifies every pull request before merge**, and the scope gate enforces the manifests in CI, so a track that wanders outside its declared paths fails before a human has to notice. |
| 8 | **Track session reports are dated AND track-tagged sections.** The integrator merges pull requests one at a time and resolves report conflicts **by concatenation, never by discarding a section**. |
| 9 | **Expected failures are declared before they run.** Seeded-failure proofs run locally wherever possible; a genuinely required red run against origin uses a branch named `test/expected-fail-<topic>`, a commit message opening `EXPECTED FAIL`, the branch deleted after, and the session report naming the run BEFORE the owner can meet the notification. An unexplained red on any other branch is treated as real. (Filled 2026-07-26 with the slot's originally intended content; the slot had sat empty because the rule's brief was issued but never executed.) |
| 10 | **A red run on main stops the line.** No new job starts until main is green. Every session verifies its own final push's REMOTE CI result before closing and records the run link in the session report. Local gate results never substitute for the remote run. (Owner's order, 2026-07-26; earned by runs 117 to 120, four consecutive red pushes to main that every session's local gates had passed. The corrected account of runs 117 to 121 is recorded beside the authoritative rule in `CLAUDE.md`.) |
| 11 | **Concurrent sessions never share a working tree.** Every track session creates its own git worktree at boot, at `worktrees/<track>/` (gitignored), and removes it at close. The primary checkout at the repository root belongs to the integrator alone. A session finding the primary checkout on an unexpected branch touches nothing and reports it: no checkout, no stash, no reset, because an unexpected branch means another session is mid-flight and their working tree is theirs. (Owner's order, 2026-07-26; earned by a near-miss where the screenshot-analyst track returned to find the primary checkout switched to `main` with three files of another session's uncommitted work in it. Rule 1 made `main` single-writer for the BRANCH and never covered the working tree.) |
| 12 | **The owner's local preview is always current main.** Any session that lands a change on `main` runs `npm run owner:preview` as part of its close, BEFORE the session report, and records the printed version line in that report; before, not after, because the line is evidence and a report written first describes an intention. Track sessions never touch the owner preview: single writer applies to it as to `main`, and `scripts/owner_preview.mjs` refuses to run in a linked worktree by inspecting the git dir rather than trusting the caller. **If the preview cannot be refreshed, the session report says so in its own line** rather than silently leaving a stale server up, because a preview nobody has said is stale is worse than no preview: the owner trusts it. The script stops ONLY the instance it previously started, tracked by a pidfile under the gitignored `.owner-preview/` and matched on pid AND process start time so a recycled pid can never be mistaken for ours; it never guesses at processes, it refuses a dirty tree and reports it in full rather than discarding work, and it leaves nothing half-started. (Owner's order, 2026-07-28, `reports/briefs/FS_OWNER_PREVIEW_RULE_Prompt.md`: *whenever main changes, the owner's local copy is already fresh, never stale, never his job to refresh.*) |
| 13 | **The completion mandate.** In the owner's words: *a session that accepts a brief under open capacity finishes it; honest stops remain lawful only at wave boundaries with the resume state written, and a session that stops must state which resource actually ran out, since context no longer will.* (Owner's order, 2026-07-28, the capacity amendment, `reports/briefs/FS_PROTOCOL_V3_CAPACITY_Prompt.md`.) |
| 14 | **The effectiveness mandate.** Every brief states the agent scale expected and the tool inventory available: parallel task agents, web fetch of the platform mirror sources, Playwright with installed browsers, the full gate family, the local RGS harness, tesseract, and the analyst catalogue pattern. Sessions optimise their own workflow within the brief rather than serialising by habit. (Owner's order, 2026-07-28, the capacity amendment.) |

The rule 9 gap recorded here previously was filled on 2026-07-26 by the
replay-blocker session, on the owner's instruction; rules 10 and 11 keep their
numbers, so every existing citation stays correct.

Enforced by `scripts/qa/locked_paths_gate.mjs`, which carries both the locked-path
rule and the track scope gate, and runs first in CI.

### 3f. Process protocol: THE RETRO MECHANISM (owner's order, 2026-07-26, standing)

**After the owner's second portal visit, Fable's benchmark polish review nominates
up to THREE surfaces for focused redo sessions, one specialist session each, on its
own track.**

The three are selected by **measured weakness against the professional bar**, not by
taste and not by whichever surface was discussed most recently. The bar is THE
STANDING MANDATE's inspection test: what a rival studio's art director would
conclude from that surface alone.

Why three and why separate. A single "polish pass" over everything is how polish
becomes uniform and shallow; three named surfaces with a session each get depth, and
being on their own tracks means they can run in parallel under section 3e's rules
provided their manifests are disjoint. Fewer than three is a legitimate outcome: the
review nominates **up to** three, and nominating one is a stronger statement than
padding to three.

Each nomination carries the measurement that justified it, so a redo session starts
from a stated deficiency rather than from an instruction to make something nicer.

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

## 7. HORIZON, and the next-title template

### 7a. Off-repo archive: the LUMEN side project (owner ruled, 2026-07-26)

`sideproject/` is **out of the repository entirely**. It held an early LUMEN
concept build (a Svelte and Pixi frontend with its own `node_modules`), it was
never tracked by git, never referenced by the Future Spinner build, and it sat
in the working tree as 112 MB of untracked material that every `git status`
had to step over.

| Field | Value |
|---|---|
| Archived to | `~/Desktop/WRS_ARCHIVE/sideproject_2026-07-26.zip` |
| Size | 52,738,480 bytes |
| Contents | 4,188 non-directory entries and 483 directories, verified against the working tree before deletion: `unzip -t` clean, file counts and symlink counts equal |
| Carries | `sideproject/README_ARCHIVE.txt`, one line, stating it is concept material and possible future theme inspiration, not project code |

**It is concept material, not code to resume from.** When LUMEN starts, the
template below is the starting point, and the archive is worth opening for
theme and art ideas rather than for anything to build on.

**And the deletion risked less than it looked like it did.** The LUMEN source
lives on the branch `claude/lumen-sideproject` (`4f4d6ef`, confirmed present on
origin 2026-07-26), which the 2026-07-25 owner audit already recorded as
intentionally parked and not for merge. What sat in the working tree was
overwhelmingly build output: 89 MB of `node_modules` and a built `dist/` out of
112 MB total. The zip is a belt-and-braces copy of a directory whose meaningful
contents were already on a pushed branch.

### 7b. Next-title template (applies to LUMEN, queued after Future Spinner submits)
Reuse in order: maths package + validate_math + PAR -> wiring integrity audit pattern -> statelessness/replay evidence -> AssetForge + AudioForge (new seeds/prompts) -> rules/paytable/UI guide conformance -> QA soak + platform conformance suite (all scripts are reusable) -> math self-audit -> compliance watch -> dossier from this register's 3a-3d -> tile layers -> submit. Company layer (section 1) does not repeat; only per-title rows do.

**THE STANDARD PRE-SUBMISSION ANALYSIS, owner-ordered 2026-07-28.** Before `submit`, and
after the build is complete, every title runs the full audit at
**`docs/skills/FULL_AUDIT_METHOD.md`**. It is a separate job from building, because mid-build
you are inside the assumptions you are trying to test, and the chain above has no step for
it. The evidence that it pays, from the Future Spinner run: the six briefed build jobs
produced 22 findings, and auditing that pass produced 12 more, one of them a regression the
build pass had introduced.

It is waves rather than one sweep. Wave 1, the machine-tell sweep, is COMPLETE for Future
Spinner. **Waves 2 to 5 are named and not yet run for this title: audio, social-mode capture,
accessibility, and animation quality.** Each is sized as its own job; the method document
records why each matters and `docs/QUALITY_CHARTER.md` 5.3 records them as uncovered so
silence is not read as coverage.

**This section owns the ORDER. `docs/RESKIN_BOUNDARY.md` owns the CONTENT of the fourth
link**, `AssetForge + AudioForge (new seeds/prompts)`, which is the only link in the chain
whose inputs are art. Added 2026-07-27. Three things in it qualify the line above, and they
are pointers rather than restatements:

- **"new seeds/prompts" is true of exactly one family.** Only AudioForge has a seed
  (`BASE_SEED = 20260707`, `tools/audio_forge/generate.py:36`). AssetForge is
  deterministic-by-construction with no seed at all, and the brand emblem has no recorded
  seed, model version or generation date. See `RESKIN_BOUNDARY.md` 2.0, so a next-title
  session does not go hunting for seeds that were never recorded.
- **"all scripts are reusable" holds broadly, with named exceptions.** Scope and exceptions:
  `RESKIN_BOUNDARY.md` Part 3, which lists the gates whose ASSERTIONS are title-specific
  (`hud_banner_spec_check.mjs` against this title's locked stage coordinates,
  `fsModes.drift.test.ts` against this title's maths package, and four others).
- **The cost this one arrow currently hides.** `RESKIN_BOUNDARY.md` Part 4 ranks twelve
  hard couplings. Read GAP 1 (roughly 400 colour literals across 19 files with no token
  layer) and GAP 3 (five shipped assets with no master and no generator) BEFORE estimating a
  next title, because neither is visible from this chain.

## 8. STANDING ANSWERS
- User manual: none exists as a separate artefact anywhere on Stake; the in-game rules/paytable/UI guide is the user manual and a review requirement.
- Technical docs for Stake: nothing beyond the uploaded math package and static frontend; internal evidence (3b) exists to answer reviewer questions and for our own verification discipline.
- Gambling licence: WRS does not hold operator licences; games publish under Stake's operation via the Stake Engine ToS. Owner to confirm personal/company legal position with a professional (see 1).

## 9. CHANGE LOG
- 2026-07-28 (MULTI-TRACK PROTOCOL V3, the capacity amendment): rule 4 replaced and rules 13 and 14 added, in `CLAUDE.md` (authoritative) and section 3e here, per `reports/briefs/FS_PROTOCOL_V3_CAPACITY_Prompt.md`. The recorded reason is the owner's capacity change: sessions now run under a large allowance. Rule 4 now makes multi-wave sessions running parallel agent squads per `docs/skills/FULL_AUDIT_METHOD.md` the DEFAULT for audit, verification, capture, documentation and sweep work, squads sized per convention (r), one coherent surface each, writing to ledger shards consolidated by a marshal, with the session as sole committer; sequential single-job sessions remain mandatory only for locked-file surgery and for any change to the money path, where serial care outranks parallel speed. Rule 13, the completion mandate, in the owner's words: a session that accepts a brief under open capacity finishes it; honest stops remain lawful only at wave boundaries with the resume state written, and a session that stops must state which resource actually ran out, since context no longer will. Rule 14, the effectiveness mandate: every brief states the agent scale expected and the tool inventory available (parallel task agents, web fetch of the platform mirror sources, Playwright with installed browsers, the full gate family, the local RGS harness, tesseract, the analyst catalogue pattern), and sessions optimise their own workflow within the brief rather than serialising by habit. The replaced one-job-per-session rule 4 is preserved beside the authoritative text in `CLAUDE.md`.
- 2026-07-28 (BASELINE AND METHOD): **`docs/skills/FULL_AUDIT_METHOD.md` created and named in section 7b as the standard pre-submission analysis for every title.** It captures the multi-agent audit as a repeatable method: the discovery and adversarial-verification layers; verifying the FIXES rather than the findings once the tree has moved, and the epoch trap that makes a naive resume produce misleading output; the read-only clause that has to cover the side effects of invoked scripts, with a `git status` self-check in the agent's own output schema, because an instruction constrains an agent's tools and not the software it runs; sizing an audit like a job (convention r) with the measured token and wall-clock figures; resuming before improvising (convention q) with the measured cost of not doing so; the frozen-debt ratchet, keyed by file and text, printed on every run and checked in both directions; seeded self-tests as the price of any gate's PASS, run through the shipped code path rather than a restatement of it; and evidence scratch discipline. It also names waves 2 to 5 as unrun for THIS title: audio, social-mode capture, accessibility and animation quality. Alongside it: the nine upstream SDK sample packages removed from `games/` per ruling 4 (TR-088), with the Makefile's orphaned `test_run` target removed rather than repointed at the locked package; the SA-002 and SA-007 COST-column question recorded as DECLINED per ruling 5, in both rows, explicitly flagged as the repository's own supporting case rather than a quotation of Fable since the verbatim text was not supplied; the chromium binary cached in CI, keyed on the RESOLVED Playwright version from the lockfile rather than the range in `package.json`, which already differ (1.62.0 against `^1.61.1`); and expected run durations recorded beside rule 10 so a slow run is knowledge rather than alarm.
- 2026-07-27 (ROUND-THREE PREP, the two unrun tracks executed on main): the prepared `track/quality-sweep` and `track/docs-reskin` briefs were never run as tracks, so their substance was executed on `main` by the integrator. Two new documents. **`docs/QUALITY_CHARTER.md`** is the document `CLAUDE.md`'s standing mandate has cited since it was recorded and which did not exist until now: it carries the mandate verbatim, states the Valkyrie benchmark in seven checkable properties against our own first-party captures of that publisher rather than as an adjective, and holds the nine-class machine-tell sweep list. Its sweep found 35 symbol glyphs shipping in `dist`, 31 of them player-visible, and `<title>future-spinner-frontend</title>`, the Vite starter's own package name, as the pre-hydration browser tab title. That last finding was CORRECTED within the same pass, and the correction is recorded rather than the claim edited away: the title is transient, replaced on mount by App.svelte's `<svelte:head>`, so the first severity assessment was wrong even though the fix was right. Twenty-two findings, all dispositioned; enforced going forward by `frontend/scripts/machine_tell_gate.mjs` in the static CI job, whose ten seeded violations are all strings that were really in this repository. One item is parked and extracted per protocol rule 6 rather than half-done: about 35 keys times 16 locales of player-visible English that is still hardcoded, counted and listed in full so the surgical pass needs no rediscovery. **`docs/RESKIN_BOUNDARY.md`** is the engine-versus-skin inventory: a directory-by-directory classification, a nine-family skin register answering where, format and dimensions, pipeline and seed, and which gates must re-run, then twelve honest gaps ranked hardest first for post-submission. Section 7b above gains its pointer, and this row is that document's change-log entry. What `RESKIN_BOUNDARY.md` deliberately does NOT do: it does not schedule, does not restate the maths pipeline, and proposes no fixes for the gaps it names.
- 2026-07-26 (MULTI-TRACK PROTOCOL V2): new sections 3e and 3f record the owner's multi-track protocol and the retro mechanism, mirroring the authoritative text in `CLAUDE.md`. `main` becomes single-writer with exactly one INTEGRATOR session; every other session works a `track/<name>` branch against a committed manifest at `docs/records/tracks/<name>.manifest` and delivers by pull request. Parallel tracks require provably disjoint scopes, checked by comparing manifests rather than hoped for. Enforced in CI by `scripts/qa/locked_paths_gate.mjs`, which now carries the track scope gate beside the locked-path rule and runs first. Two tracks opened: `track/docs-reskin` and `track/quality-sweep`, with their briefs written as paste-ready prompts in `docs/records/tracks/`. The walkthrough gained its authoritative SECOND VISIT section so the owner's portal visit is unblocked by nothing.
- 2026-07-13: Document created (Fable). Statuses reflect main at PR #54 with PRs #52/#53 approved and awaiting merge.
- 2026-07-14: Jobs 1-8 of the 2026-07-13 consolidated work order, and reports/archive/superseded/CLAUDE_PROJECT_INSTRUCTIONS_v6.md, all merged to main via a full PR sweep (`reports/archive/2026-07-14_pr-merge-sweep.md`). Ten open PRs resolved to zero; locked files, frontend build and math validation all re-verified clean on the final merged main. Sections 3b/3c/3d above updated to reflect landed work. Two real findings surfaced during the sweep and JOB 6/7 prep, both still open: `SUBMISSION_BLURB.md` (repo root) is stale pre-Overdrive text contradicting the shipped game (3a); the provider logo requirement turns out to already be satisfied by the existing `brand_mark.svg` master, pending only a confirmation, not new art (3c). Remaining before submission: JOB 3b (math self-audit), JOB 5b (in-game rules conformance UI), JOB 9b (social-mode string audit), and the JOB 2 addendum's platform-conformance extensions (a-g) - none of these have started. 24 stale merged remote/local branches cleaned up in the same pass, preserving the two deliberately-named reference branches (`claude/collect-prototype`, `claude/gap-analysis`).
- 2026-07-23: Trademark clearance row (section 1) flipped IN PROGRESS -> DONE. Closed by Fable's AU similarity ruling (both names clear against the 2026-07-18 variant-scan dataset) and the owner's manually-conducted USPTO searches (attested clear); full record at `docs/records/trademark/2026-07-15/SEARCH_LOG.md`, 2026-07-23 entry. Retained as a standing caveat in the row itself: documented pragmatic clearance, not a formal legal opinion; a trademark professional is still required before any enforcement action or if the names are ever challenged.
- 2026-07-25: OWNER AUDIT ROUND 3 item 1 (logo canonicalisation) - the hero emblem is now the sole WRS mark. `tools/brand/derive_hero_icon.py` derives a small circular hero icon (192/96/48/32) from the ratified `hero_emblem/master_1024.png`, committed to `design-system/brand/hero_icon/`; the in-game loading-screen brand mark now uses the 96 derivative. The flat vector-mark track (v2 and v3, 22 files, never wired into the shipped frontend) is retired to `design-system/brand/archive/vector_mark/` with a `SUPERSEDED.md`. Sections 1 and 3c above updated: provider upload file is now `hero_emblem/master_512.png` (noted as flat RGB, not alpha-transparent - the row's own "transparent" requirement needs either a re-export or an owner waiver before upload), superseding the prior `brand_mark.svg` candidate.
- 2026-07-25 (PLATFORM DELTA AND TOOL VETTING): section 2 substantially extended. New subsection 2a records the three new platform rules with our pass status (RTP ceiling 96.70 with our 0.35pp margin; the 10,000,000 events-per-mode and 4.2GB publish-time caps against our 100,000; and the full automated bet-level limit set, all passing on both star tiers). New 2b splits the distribution targets and records stake.us as BLOCKED on six social-string findings and Stake EU as contingent on an XEC premise this session could not verify against three first-party sources. New 2c records the roadmap intel explicitly as UNVERIFIED. The section 1 payment row gains the payments docs link and both payment models. **The "Key doc URLs" line was corrected: it had been listing the public GitHub repository's `/docs/approval/...` route tree, which is not the live site and is four months stale, still advertising the old 90.0 to 98.0 RTP range with none of the risk limits.** Full evidence: `docs/stake-engine-live/2026-07-25/`, `COMPLIANCE_WATCH.md` 2026-07-25 section, `reports/qa/math_bet_level_compliance_2026-07-25.md`, `reports/qa/currency_readiness_2026-07-25.md`, `docs/records/tooling/TOOL_VETTING_2026-07.md`.
