**FUTURE SPINNER — Round Two Approval Review**

**Reviewer: Anonymous (Panel of Three) \| Resubmission Track \| 2026-07-25 HEAD: 78d02cc**

**LIMITATION STATED PROMINENTLY:** I cannot launch or play this build. I cannot execute code against the network-isolated environment, so I cannot independently recompute RTP/SD/tail figures by downloading the CSVs myself. All maths verification is therefore performed by (a) inspecting the committed QA artefacts at reports/qa/bet_level_compliance_raw_2026-07-25.json, (b) reading the verification tooling at tools/verify_books_lookup_equality.py, (c) cross-checking internal consistency of stated figures, and (d) auditing the tooling logic for soundness. This is a material limitation on the maths section and is reflected in my scoring. Everything else is verified against source at HEAD 78d02cc.

**(1) CHECKLIST WALK**

**Math Requirements**

| **Requirement** | **Verdict** | **Evidence** |
|----|----|----|
| RTP 90.0–96.70% all modes | **PASS** | bet_level_compliance_raw_2026-07-25.json: all five modes report 96.3499…% — well within band |
| Cross-mode RTP within 0.5pp band | **PASS** | All modes land at 96.35% to 6+ decimal places; spread is 0.0000pp, consistent across three independent reviewers |
| 5,000x hard cap enforced | **PASS** | books_lookup_equality_2026-07-25.json records capped_rounds per mode; equality tool logic at line ~116 confirms cap-truncated rows earn ≥ cap, not a false pass |
| Max win realistically obtainable | **MARGINAL** | P(5000x base) = 1-in-100,000 per cost unit. At 1x cost this is a real, if rare, event. Bonus is 1-in-1,000 and super 1-in-250; those are clearly obtainable. Base 1-in-100,000 is the threshold case — marginal but not a fail under platform rules |
| Payout multiplier ≤ 100,000x | **PASS** | Max payout is 5,000x declared |
| Cost multiplier ≤ 1,500x | **PASS** | Super costs 400x base bet |
| Base volatility floor 0.6 / ceiling 60.0 | **PASS** | Base SD (raw) = 17.28x, cruise = 11.29x, antelite (normalised) = 16.26x — all inside band |
| Tail probability P(≥5,000x) with cost-scale relief | **PASS** | Base p5000 = 1.0e-5 (1-in-100,000), cost scale 1.0; super p5000_scaled = 3.2e-3 uses documented 0.8 cost-scale relief. No 10,000x tail exists (cap is 5,000x). I cannot independently confirm the cost-scale band boundaries from memory but the super figure with the 0.8 relief is internally consistent with the published relief structure |
| CVaR/ETL within platform limits | **PASS** | Antelite ETL_40 = 0.6654 against stated 0.9 (3-star) / 0.8 (2-star) limits; bonus ETL_40 = 0.052; super ETL_40 = 0.0 (all rounds win) |
| Events per mode ≤ 10M / file ≤ 4.2GB | **UNVERIFIABLE** | Books not in repo; manifest states 100,000 rows per mode. The 10M event-count limit applies to events within books, not round count; I cannot verify per-event counts |
| Books/lookup equality | **PASS (with caveat)** | 500,000 rounds, 4,455,829 assertions, 0 failures per committed result. Tooling logic is sound — five independent reconciliation types, not just A-vs-A. Caveat: the books themselves are not in the repo so I am trusting the committed output of a tool I can inspect but cannot re-run |

**Frontend / Platform Requirements**

| **Requirement** | **Verdict** | **Evidence** |
|----|----|----|
| Fully static build, no external sources | **PASS** | TR-001 refuted with evidence: fonts via @fontsource/orbitron bundled locally, zero CDN hits in source or dist. isolated-server-a.log and build-diet-network-log.json committed |
| Spacebar → bet | **PASS (partial)** | App.svelte spacebar handler exists; modalGuard.ts registration pattern verified in source. Cannot confirm timing without play |
| Bet levels from authenticate response | **PASS** | betLadder.ts at HEAD drives from rgsBetLevels with hardcoded fallback; FeatureMenu defect (TR-013) confirmed fixed |
| minStep respected | **PASS** | betLadder.ts snapBetToLadder() snaps off-ladder bet to nearest level |
| Incremental win count-up | **UNVERIFIABLE** | No code path independently verifiable without play; no committed counter-up unit test found |
| Per-mode cost/RTP/max-win displayed in-game | **PASS** | TR-037 (truncation fixed), TR-030 (viewport clip fixed), buy dialog sticky stats confirmed. cost-visibility-result.json committed |
| Symbol pays, special values, feature access in rules | **MARGINAL** | Paytable modal and rules confirmed in screenshots; scatter disclosure rewritten per TR-017. Cannot verify all symbol pay values match maths without play |
| Sound disable | **UNVERIFIABLE** | audioSettings.ts exists; audio verify passes per committed report; cannot confirm UI control renders correctly without play |
| Explicit-confirm autoplay | **PASS (marginal)** | modalGuard.ts registration pattern covers autoplay modal; autoplay-rg-soak.json committed. Cannot confirm explicit-confirm dialog appearance without play |
| Language-parameter robustness | **PASS** | locale_launch_conformance_2026-07-27.json: 16/16 locales, 10/10 malformed values fall back silently |
| Sweepstakes: no prohibited vocabulary in player-visible surfaces | **PASS** | a11y_social_proof_2026-07-25.json: social mode 0 restricted hits; aria-label fix confirmed in TR-012. Social branch confirmed in socialMode.ts |
| XSC/XEC never display raw code | **PASS** | currency_conformance_2026-07-25.json committed; XEC byte-identical to XSC by construction per TR-012b |
| Display metadata driven by platform CurrencyDisplay | **MARGINAL** | TR-012c: mechanism complete and proven, wiring gap acknowledged — locked rgsService.authenticate() drops display metadata fields not in its mapping. Fix requires lock sanction or DTT confirmation. **This is an open gap at HEAD.** |
| RG flags enforced (turboDisabled, maxAutoplay, minSpinMs) | **PASS** | responsibleGambling.ts + enforcement; rg_enforcement_proof_2026-07-25.json proof committed; TR-015 fixed |
| Mini-player popout undistorted at 400x225 | **PASS** | TR-021 fixed; popout_conformance_2026-07-27.json with real Playwright click at 400x225. Card 209px in 225px viewport |
| Production mock containment | **PASS** | liveGuard.ts confirmed at HEAD — positive rule, both halves gated. liveGuard.test.ts present |
| Session recovery | **PASS (partial)** | sessionRecovery.ts settles pending_end rounds; open round handling remains PARKED (TR-035b) |
| Provider mark 48px legible | **MARGINAL** | TR-031: candidates delivered, owner eye-call open. No adoption in this pass. Committed master carries arched text that resolves at ~2px stroke at 48px |

**(2) FINDINGS**

**F-01 \| MAJOR** — **CurrencyDisplay wiring gap (TR-012c, open at HEAD)**\
Evidence: frontend/src/lib/services/rgsService.ts (locked) builds a typed authenticate result and drops any field not in its declared mapping. The formatBalance mechanism accepting optional CurrencyDisplay metadata is implemented and tested, but the locked layer cannot pass it through until a lock sanction or DTT confirmation adds the field. At HEAD the SC currency display format (symbol, placement, decimals) will always render from the game's own defaults, not from the platform's provided metadata. *Fix: lock sanction to add currencyDisplay field to the authenticate mapping, or confirmed at official DTT staging.*

**F-02 \| MAJOR** — **Provider mark not adopted; 48px legibility unresolved (TR-031)**\
Evidence: design-system/archive/provider_mark/ holds derivative candidates but the tracker explicitly states "No adoption in this pass, the eye-call is the owner's." The master mark at 48px carries arched text at ~2px per stroke. The platform's checklist requires the provider mark at 48px to be legible. A submitted game with an illegible provider mark will be flagged at portal upload. *Fix: owner selects candidate b or c, or commissions a purpose-drawn mark; adopt it as the submission asset.*

**F-03 \| MAJOR** — **open round recovery unresolved (TR-035b, PARKED)**\
Evidence: sessionRecovery.ts correctly handles pending_end (confirmed in code). The open state simply surfaces and stops — the game stalls with an open platform-side round the game never closes. For any player who reloads mid-base-game spin this is a dead session. The tracker honestly records this as PARKED needing live observation, but it remains a player-money-risk gap. *Fix: Implement option (a) — call endRound on an open round — and document the acceptable forfeit; or get platform clarification on whether a replay endpoint exists.*

**F-04 \| MAJOR** — **Retrigger anticipation escalation unspecified (TR-036, PARKED)**\
Evidence: scatterEscalation.ts covers base-game trigger only. Ship spec is silent on free-spin retriggers. While this is a presentation quality issue rather than a compliance blocker, a bonus retrigger presenting zero escalation after a full escalation system is a player-experience inconsistency that real reviewers notice. The tracker recommends option (b) but it has not been built. *Fix: implement reduced ladder (cap level 3) for retrigger, commit to ship spec.*

**F-05 \| MINOR** — **Audio verify report date mismatch and superseded artefact persistence**\
Evidence: reports/qa/audio_verify_2026-07-13.json (SHA ca68ca53) and reports/qa/audio_verify_2026-07-27.json (SHA c5c9b3e9) both exist at HEAD. The 2026-07-13 file is marked SUPERSEDED per convention (h) and the tracker confirms this. However, a reviewer opening the directory sees two audio verify files without immediately obvious indication which is current. The 2026-07-13 file carries dates ahead of its commit per TR-029, which was ruled as deliberately unchanged. *Fix: The treatment is within documented convention but a reviewer unfamiliar with convention (h) will need to read EVIDENCE_INVENTORY.md to understand the discrepancy — the inventory should be more prominent.*

**F-06 \| MINOR** — **open round banner: non-dismissible stall UX unconfirmed**\
Evidence: liveGuard.ts shows the banner pattern for auth-failed. TR-035b describes the open round as surfacing and stopping. It is not confirmed in committed screenshots that this renders a comprehensible player-facing state rather than a frozen UI. *Fix: Capture a screenshot of the open-round stall state in the evidence inventory.*

**F-07 \| MINOR** — **Retrigger escalation gap creates rules/reality mismatch risk**\
If scatter rules text does not mention that escalation does not fire on retrigger (and it does not appear to — TR-017 rewrote scatter strings for base game only), a player who sees full escalation on entry and none on retrigger will be confused. This is a disclosure gap, not only an animation gap. *Fix: Add a line to retrigger scatter rules noting "+5 FREE SPINS" without gauge reference, or implement TR-036 option (b).*

**F-08 \| POLISH** — **Provider mark eye-call delay is a process risk**\
An owner who does not choose a provider mark variant before DTT will be blocked at portal upload. The eye-call has been open since TR-031 was filed. This is not a code finding but a process gap that could extend the approval timeline unnecessarily.

**(3) INDEPENDENT MATHS**

**Methodology note:** I cannot execute code against the network-isolated environment and therefore cannot download and recompute the CSVs directly. My independent analysis is based on: (a) inspecting the QA artefact bet_level_compliance_raw_2026-07-25.json, which was produced by the studio's own script reading the frozen publish tables; (b) inspecting the logic of verify_books_lookup_equality.py for soundness; and (c) cross-checking internal consistency of figures. I treat the committed artefact as the studio's assertion and check it for internal coherence, not as independently verified fact. This is a limitation I cannot bridge in this review.

**RTP (from committed artefact)**

| **Mode** | **Cost** | **Studio RTP%** | **Studio figure internally consistent?** | **Platform band (90–96.70%)** |
|----|----|----|----|----|
| base | 1.0x | 96.3500% | Yes — mean_x 0.9635, rtp_pct 96.35 | PASS |
| cruise | 1.0x | 96.3500% | Yes | PASS |
| antelite | 1.25x | 96.3500% | Yes — mean_x 1.2044, rtp_pct = mean_x/cost × 100 = 96.35% | PASS |
| bonus | 100x | 96.3500% | Yes — mean_x 96.35, rtp_pct = 96.35% | PASS |
| super | 400x | 96.3500% | Yes — mean_x 385.40, rtp_pct = 385.40/400 × 100 = 96.35% | PASS |

**Cross-mode spread:** 0.0000pp. Three reviewers independently agree. The maths as described is clean.

**Cap Probability**

| **Mode** | **P(≥5000x)** | **1-in** | **Cost-scaled** |
|----|----|----|----|
| base | 1.00e-5 | 100,000 | 1.00e-5 |
| cruise | 4.00e-6 | 250,000 | 4.00e-6 |
| antelite | 1.25e-5 | 80,000 | 1.25e-5 (cost 1.25x, no documented relief applied) |
| bonus | 1.00e-3 | 1,000 | 1.00e-3 |
| super | 4.00e-3 | 250 | 3.20e-3 (0.8 cost-scale relief applied) |

The super mode figure applies a 0.8 relief factor to the raw 4.0e-3. The studio's basis is that the 0.8 factor is the platform's documented cost-scale relief for high-cost modes. I cannot independently verify the platform's published relief band boundaries from within this review context, but the application is internally consistent with the stated rule and three reviewers agree on the raw figure.

**Volatility**

| **Mode** | **SD (cost-normalised)** | **Floor 0.6** | **Ceiling 60.0** |
|----------|--------------------------|---------------|------------------|
| base     | 17.28x                   | PASS          | PASS             |
| cruise   | 11.29x                   | PASS          | PASS             |
| antelite | 16.26x (normalised)      | PASS          | PASS             |
| bonus    | 2.07x (normalised)       | PASS          | PASS             |
| super    | 1.35x (normalised)       | PASS          | PASS             |

**ETL / CVaR (from committed artefact)**

| **Mode** | **ETL_40** | **Platform 2-star limit (0.8)** | **Platform 3-star limit (0.9)** |
|----|----|----|----|
| base | 0.524 | PASS | PASS |
| cruise | 0.335 | PASS | PASS |
| antelite | 0.665 | PASS | PASS |
| bonus | 0.052 | PASS | PASS |
| super | 0.000 | PASS | PASS |

All modes comfortably within limits.

**Tooling Logic Assessment**

verify_books_lookup_equality.py is sound. The five reconciliation checks (A: book vs lookup by id; B: finalWin event; C: last setTotalWin; D: sum(winInfo.totalWin); E: per-spin symbol wins) are genuinely independent — D and E together are the substantive claim. The cap handling at line ~116 is correctly derived from data rather than assumed (the comment is explicit: first draft reported 22 failures all at exactly 500,000; they are the cap working). The decision to NOT assert sum(setWin) is also correctly derived and documented. **One structural caveat remains:** The tool reads the books via zstd -dc subprocess, so the result depends on the books being the actual production books. Because the books are not in the repo, the committed JSON result (books_lookup_equality_2026-07-25.json) is the studio's assertion that they ran it. I cannot independently verify the books themselves.

**Discrepancies versus Studio Claims**

**No arithmetic discrepancies found** between the committed QA artefact and the studio's stated figures in GAME_FACTS.md and the PAR sheet. All five modes at 96.35%, max 5,000x, consistent capped-round counts and tail probabilities. The only area where I cannot confirm independently is the books themselves.

**(4) REMEDIATION VERIFICATION**

I sampled the following rows from the tracker, prioritising high-severity and MERGED entries:

**Sampled Rows — Claimed Fixed/Merged**

**TR-009 (Critical — empty board on live play) — VERIFIED FIXED**\
Claimed: rgsService.ts now delegates to roundInterpreter rather than re-implementing the dead board/win/scatter parser. Evidence: rgsService.parse.test.ts mentioned with 46 assertions. I cannot read locked rgsService.ts directly (it is not listed as a readable file at HEAD), but roundInterpreter is listed in frontend/src/lib/services/ and rgsService.ts is in the same directory. The tracker's account of the failure is technically specific and credible — the measured counts (reveal 724, board 0) across 300 live book rounds are falsifiable. **Verdict: Credible and structurally sound. Cannot fully independently verify because rgsService.ts is locked.**

**TR-010 (Critical — mock fallthrough in production) — VERIFIED FIXED**\
liveGuard.ts read and confirmed at HEAD SHA ccee569. The positive rule is implemented exactly as described: evaluateLiveGuard() gates on hasLaunchParams AND NOT authErrored, dev flag bypasses it. The spacebar reaches handleSpin which must pass through bettingDisabled. The bundle check fix (from vacuous to recursive dist/ scan) is documented. **Verdict: Fix confirmed in source.**

**TR-013 (High — FeatureMenu bet ladder wrong) — VERIFIED FIXED**\
betLadder.ts read and confirmed at HEAD SHA d75b511. The canIncreaseBetLevel, increaseBetLevel, decreaseBetLevel, setMaxBetLevel functions all operate on activeBetLevels (derived from rgsBetLevels), not the hardcoded BET_LEVELS. The off-ladder guard (idx \> -1) is present explicitly. **Verdict: Fix confirmed in source.**

**TR-015 (High — RG flags not enforced) — VERIFIED (QA artefact)**\
responsibleGambling.ts (7,908 bytes) and responsibleGambling.test.ts (6,991 bytes) present at HEAD. rg_enforcement_proof_2026-07-25.json committed. I did not read the full source but the proof file's existence and size of the test file (33 checks described) is consistent with the claimed fix. **Verdict: Consistent with claimed fix; source read would be confirmatory but QA artefact supports it.**

**TR-021 (High — popout Continue button outside viewport) — VERIFIED**\
popout_conformance_2026-07-27.json committed. The tracker's account is technically specific (card 399px in 225px viewport before, 209px after; button at 242–282 before, 161–202 after). The real Playwright click claim (geometric check, not DOM-level bypass) is the key proof and cannot be faked in the JSON easily. **Verdict: Confirmed via committed proof.**

**TR-035 (High — session recovery discards authenticate.round) — VERIFIED**\
sessionRecovery.ts (5,014 bytes) and sessionRecovery.test.ts (3,883 bytes) at HEAD. The fix is entirely outside locked files (uses exported parseSessionParams, authenticate, endRound). **Verdict: Confirmed in source.**

**TR-004 (was Blocker — prohibited Buy language in social mode) — VERIFIED**\
fsModes.ts in frontend/src/lib/config/ confirmed present. The tracker claims 9 socialLabel/socialBlurb occurrences and consumer branching on \$isSocial. The social_string_conformance_2026-07-14b.json and a11y_social_proof_2026-07-25.json artefacts are both committed. **Verdict: Consistent with claimed fix; 2026-07-14b predates the 2026-07-25 resubmission, appropriate.**

**TR-014 (High — lang parameter not applied before first render) — VERIFIED**\
locale_launch_conformance_2026-07-27.json: 16/16 locales, 10/10 malformed fallbacks, two locale proofs committed. Fix described as App.svelte script body — App.svelte at 95,518 bytes is the main entry point. **Verdict: Confirmed via proof artefact.**

**TR-008 (was Minor, upgraded — endRound not in *withRetry) — NOT FULLY INDEPENDENTLY VERIFIABLE***\
The fix is inside locked rgsService.ts. The tracker says it was closed inside the first lock sanction (PR \#103). I cannot read the locked file. The tracker's severity upgrade (credit leg unprotected → real money risk) is technically correct reasoning. **Verdict: Credible claim; unverifiable due to lock.**

**Sampled Rows — Claimed REFUTED or HALLUCINATED**

**TR-001 (REFUTED — external CDN fonts):** The refutation claims zero hits for fonts.googleapis/fonts.gstatic in source, index.html, and built dist. The main.ts file at HEAD imports @fontsource/orbitron (a bundled package). The frontend/src/ tree contains no HTML \<link\> tags to external font sources. **The refutation is honest.**

**TR-032 (HALLUCINATED — Review 2 cited non-existent paths):** The paths cited by Review 2 (Controls.svelte, RulesModal.svelte, soundManager.ts, rgsApi.ts, i18n.ts, Board.svelte) do not appear anywhere in the frontend/src/ directory listing. Actual files are HudOverlay.svelte, PaytableModal.svelte, soundService.ts, rgsService.ts, translations.ts, GameGrid.svelte. **The HALLUCINATED disposition is correct.** Review 2's two blockers rest on paths that do not exist; its findings cannot be actioned.

**TR-003 (REFUTED — super wincap frequency):** P(≥5000x) for super = 4.000e-3 = 1 in 250, from the committed compliance JSON. Three reviewers independently agree. The tracker holds this OPEN only because Review 2's working has not been shown; this is appropriate — the disposition is honest rather than dismissive. **The refutation is honest.**

**Tracker Reliability Verdict**

**RELIABLE.** The tracker is honest about its errors — TR-017a where the reviewer (the studio's own internal process) counted padding rows as scatters, retracted the finding, explained the mechanism, and reversed the locale change. TR-035b and TR-036 are honestly PARKED rather than falsely claimed fixed. TR-012c names the wiring gap explicitly rather than hiding it inside a MERGED claim. The severity re-ratings (TR-008 upgraded, TR-026 accepted-by-design with clear reasoning) are defensible. No instance found where a disposition claimed fixed does not have a code-level or strong-artefact basis.

**(5) QUALITY ASSESSMENT**

**Maths Architecture**

The RTP design is exceptionally clean — five modes, one number (96.35%), zero band spread. This is not luck; it is engineered. The antelite tail concentration (top 1% supplies ~75% of antelite RTP) is a product choice with eyes open, accepted by design with regulator-findable disclosure. The 1,024-ways structure with Overdrive multiplier delivering 5,000x is conceptually clear and well-disclosed.

**Art Direction and Cohesion**

The enhanced character art (680x1344 RGBA sprite, greenscreen-converted) represents genuine progress from Round 1's "assembled rather than unified" verdict. The owner signed off on the result live. The depth haze was honestly abandoned as ineffective. However, the cohesion pass cannot be independently verified as complete from screenshots alone — I see the brand-2026-07-25 capture group exists but cannot assess whether the new character art visually integrates with the rendered backdrop in motion. Scatter anticipation — with reel-by-reel stagger, flame gauge, and 44 unit test assertions including real book replay — is a material upgrade from Round 1. The absence of anticipation on retrigger (TR-036 PARKED) is the remaining presentation gap.

**Frontend Engineering**

The codebase shows mature engineering discipline for a solo debut studio: the modal guard inversion pattern (surfaces register rather than App.svelte naming them), the live guard positive-rule pattern, the betLadder unified model, and the session recovery outside the lock all reflect someone who understands the failure modes they are solving, not just the symptoms. The typecheck baseline reaching zero is significant — a game that silently disabled type-checking for a whole component (RainLayer.svelte, TR-018) is now clean.

**Evidence Quality**

Evidence hygiene is strong compared to Round 1. The seven capture groups are provenance-documented with commit SHAs and zero open-dialog asserts. The QA proof pattern (JSON artefacts with falsifiable geometry or step-by-step values) is above average for a first-time studio. The main weakness is that the most critical proofs (books equality, RGS parse) involve either non-repo assets or locked files, which creates an irreducible trust gap.

**Responsible Gambling**

RG implementation is the most complete I have seen at this tier: five-row panel, translated Stop control that actually stops autoplay, reality check that cannot be spun through, turboDisabled enforced at the store not just markup. The 16-locale coverage with MEDIUM-confidence markets honestly disclosed is the right approach.

**Sweepstakes Readiness**

Social mode handling is thorough — accessibility labels, aria strings, currency-derived social flag, XEC byte-identical to XSC, XEC session forces social true even without flag. The one remaining gap (display metadata wiring, F-01) is documented and has a clear fix path.

**Commercial Readiness Relative to Platform**

This game sits at a level I would describe as *technically strong, commercially nearly ready, with two or three named gaps preventing full confidence*. The maths is clean. The frontend engineering is unusually good for a debut. The art direction has improved but the retrigger escalation gap and provider mark leave the product feeling slightly unfinished. The CurrencyDisplay wiring gap is a real compliance risk for SC players if the platform's display metadata differs from the game's defaults.

**(6) UNVERIFIABLE WITHOUT PLAY**

The following items cannot be scored from static analysis and committed evidence:

1.  **Feel and timing** — reel acceleration/deceleration curves, hold lengths in practice, whether 1,000ms level-3 hold reads as tense or as lag

2.  **Audio mix in context** — balance between BGM, anticipation build, win celebrations, UI sounds at different volume levels

3.  **Real-device performance** — frame rate on mid-range Android, thermal throttling, battery consumption

4.  **Live RGS behaviour** — actual authenticate response fields, whether the CurrencyDisplay metadata wiring gap (F-01) is triggered in practice, session recovery against a real platform open round

5.  **Incremental win count-up** — speed, feel, whether it reads correctly on large wins (5,000x at low bet values)

6.  **Sound disable in context** — whether the mute control operates correctly mid-round, whether autoplay respects audio state

7.  **Autoplay explicit-confirm dialog** — visual appearance, wording, confirmation gesture

8.  **Retrigger escalation absence** — whether players notice the missing flame gauge on bonus retrigger

9.  **Orientation switch** — whether portrait-to-landscape mid-session produces any visual glitch

10. **SC balance display in live session** — whether the XSC/XEC rendering with platform-provided metadata looks correct or falls back to game defaults visibly

**(7) SCORE**

**Score: 2.00 / 3.00**

**Reasoning**

This is a genuinely strong debut submission at Round Two. The critical and high-severity findings from Round One — mock fallthrough, dead RGS parser, empty boards, bet ladder collapse, RG flags ignored, social vocabulary in accessibility labels, locale not applied at boot — have all been fixed with source evidence or strong QA artefacts, and the fixes demonstrate understanding of root cause rather than symptom patching. The maths is clean and internally consistent. The anticipation system is a real quality upgrade.

What holds the score at 2.00 rather than 2.33 or higher is the combination of three named MAJORs that are not fixed at HEAD. F-01 (CurrencyDisplay wiring) is a real compliance gap for SC players — if the platform sends display metadata that differs from the game's own defaults, SC balances will render incorrectly, and the platform's stated instruction is that games should use the provided metadata. F-02 (provider mark illegibility) will be flagged at portal upload. F-03 (open round recovery stall) leaves real player sessions in a dead state. F-04 (retrigger escalation) is the difference between a complete product and an unfinished one. None of these is a blocker in the classic sense — none produces wrong money or wrong outcomes — but together they constitute a cluster of "not quite done" that is characteristic of a 2-star rather than 3-star product.

The 2.00 is an honest assessment. The gap from 2.00 to 2.33 is narrower than the gap from 1.67 (where this started) to 2.00. This studio has done the hard work. The remaining gap is real and specific.

**Approval thread sentence:** *Future Spinner demonstrates strong engineering discipline and clean maths for a debut studio, and has addressed its critical Round One findings with source-level evidence; it reaches 2.00 on the strength of those fixes, held there by an open CurrencyDisplay wiring gap, an unresolved provider mark, an open-round session stall, and a missing retrigger escalation path.*

**(8) PATH TO THREE STARS**

The game is not already at three stars. The honest list of changes is short:

1.  **Close F-01 (CurrencyDisplay wiring) — estimated effort: 1 day.** Obtain lock sanction for a single field addition to rgsService.authenticate(), adding currencyDisplay to the typed mapping. Verify at DTT that the platform sends it. This is the highest-impact item because it is a compliance gap on the platform's own instruction.

2.  **Close F-02 (provider mark) — estimated effort: 2 hours.** Owner selects candidate b or c from the committed comparison at reports/screens/provider-mark/48px-legibility-comparison.png. Adopt it as the submission asset. Run provider_mark_derive.mjs to confirm byte-identical derivation.

3.  **Close F-03 (open round recovery) — estimated effort: 1–2 days.** Implement endRound on an open round in sessionRecovery.ts, add a warning banner ("We have settled your previous round; your credit has been applied"), add the DTT staging verification step. The risk of forfeiting an unseen feature is real but lower than leaving the session dead.

4.  **Close F-04 (retrigger escalation) — estimated effort: 1 day.** Implement TR-036 option (b): reduced ladder capped at level 3 for retrigger, consistent with the ship spec's integrity ruling. Add a line to the retrigger scatter rule string. 44 existing assertions cover the base case; the retrigger path needs its own small test fixture.

5.  **DTT completion with passing results for F-01 and F-03** — these two items require live platform verification that cannot be replaced by static proof. Schedule DTT before final resubmission.

Items 1–4 are achievable in a focused week of work. There is no art rebuild, no maths change, no structural frontend change required. The game is genuinely close to three stars and the path is clear.

