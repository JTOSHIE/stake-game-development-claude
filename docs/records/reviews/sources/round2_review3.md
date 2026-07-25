Reviewer 3

**Future Spinner — Round-Two Approval Review**

**Material limitation:** I could not launch or play the build. I reviewed source code, shipped lookup tables, generated bundle, committed captures, proof sequences and conformance artefacts only. Feel, timing, audio mix and real-device behaviour are explicitly excluded from the score.

**Repository state reviewed:** current remote main at [<u>78d02cc17ae6e0ed8d40c81c29fe546f9fb2f68b</u>](https://github.com/JTOSHIE/stake-game-development-claude/commit/78d02cc17ae6e0ed8d40c81c29fe546f9fb2f68b), independently confirmed against the remote immediately before scoring.

**Decision:** Reject this revision. The lookup maths are strong, but the production launch contract, mandatory replay and social-jurisdiction implementation contain source-proven failures.

**1. CHECKLIST WALK**

Requirements are drawn from the current [<u>general</u>](https://stake-engine.com/docs/approval-guidelines), [<u>maths</u>](https://stake-engine.com/docs/approval-guidelines/math-verification), [<u>frontend</u>](https://stake-engine.com/docs/approval-guidelines/front-end-communication), [<u>RGS</u>](https://stake-engine.com/docs/approval-guidelines/rgs-communication), [<u>replay</u>](https://stake-engine.com/docs/approval-guidelines/game-replay-requirements), [<u>jurisdiction</u>](https://stake-engine.com/docs/approval-guidelines/jurisdiction-requirements), [<u>tile</u>](https://stake-engine.com/docs/approval-guidelines/game-tile-requirements) and [<u>quality</u>](https://stake-engine.com/docs/approval-guidelines/game-quality-rankings) pages.

**General and submission**

| **Requirement** | **Verdict** | **Evidence** |
|----|----|----|
| Reviewable frontend and maths version | PASS | HEAD and five-mode package pinned above; index.json names all five modes. |
| Promotional blurb | PASS | SUBMISSION_DOSSIER.md, game-description sections. |
| Finalised and publication-ready | FAIL | Production RGS, replay, social and mini-player failures below. |
| Stateless bets; no jackpot, gamble, continuation or early cashout | MARGINAL | game_metadata.json declares stateless; no such frontend mechanic found. Full book semantics cannot be independently checked because the event books are absent. |
| Original design and lawful IP | UNVERIFIABLE | Generation/provenance notes exist, but asset ownership and third-party licence compliance cannot be independently established from the repository alone. |
| No Stake-branded assets | PASS | No Stake branding visible in the current capture groups. |
| No offensive, explicit or underage-targeted content | PASS | Current captures show an adult-coded automotive/cyberpunk theme with no child-like characters. |
| stake.us social-language compliance | FAIL | Prohibited terms remain on visible social surfaces. |
| Post-approval maths/gameplay lockdown acknowledged | PASS | Documented in SUBMISSION_DOSSIER.md and COMPLIANCE_WATCH.md; not yet operative because approval has not been earned. |

**Maths and automated bet-level limits**

| Requirement | Verdict | Evidence/computation |
|----|----|----|
| Correct mode costs in rules | PASS | Costs are 1×, 1×, 1.25×, 100× and 400× in index.json, fsModes.ts and the current paytable capture. |
| RTP 90.0%–96.70%; modes within 0.5pp | PASS | Independent weighted recomputation: every mode 96.34999985%–96.35000000%; spread below 0.000001pp. |
| Max win agrees with rules | PASS | Every lookup caps at 5,000× base bet; paytable shows 5,000× for all modes. |
| Max win realistically obtainable | PASS | Frequencies range from 1/250 to 1/250,000, all materially more frequent than 1/10,000,000. |
| 100,000–1,000,000 slot simulations | MARGINAL | Each lookup has exactly 100,000 rows. BOOKS_MANIFEST.md asserts 100,000 book rows per mode, but the books are unavailable to verify. |
| Reasonable paying portion | PASS | Weighted hit rates: 29.11%, 43.86%, 29.44%, 100%, 100%. |
| Most likely individual result not dominant | PASS | Largest single-row weight probability is 0.7721% in Cruise; no atom is overwhelmingly dominant. |
| Non-zero hit at least 1 in 20 | PASS | All modes exceed 29%. |
| Base-mode standard deviation within 0.6–60 | PASS | Normal 17.284×; Cruise 11.290×. |
| Non-zero weights; zero-weight rows not dominant | PASS | Zero zero-weight rows across 500,000 lookup rows. |
| No unreasonable payout-range gaps | MARGINAL | Standing modes have many intermediate values, but Cruise jumps from about 1,855.79× to the 5,000× cap and Normal from 2,098.67× to the cap. |
| Max payout multiplier ≤100,000× | PASS | 5,000×. |
| Max cost multiplier ≤1,500× | PASS | 400×. |
| P(≥5,000×) and P(≥10,000×) | PASS | Worst unscaled P(≥5,000×) is 0.004; Super cost-scaling reduces it to 0.0032, below 0.01. Every P(≥10,000×) is zero. |
| Normalised CVaR and ETL limits | PASS on offline interpretation | Worst normalised CVaR99.9 is 205.741; worst ETL≥40×cost share is 0.6654; both below three-star limits. |
| Maximum exposure and operative CVaR definition | UNVERIFIABLE | Depends on ACP bet configuration and whether ACP applies raw or normalised CVaR. The studio’s own report correctly says exposure is not determinable offline. |
| Events ≤4.2 GB and ≤10 million/mode | MARGINAL | Manifested sizes and 100,000-row claims pass, but the actual private event files were not supplied. |

**Frontend and communication**

| Requirement | Verdict | Evidence |
|----|----|----|
| Unique visual/audio assets | MARGINAL | Custom assets exist, but visual cohesion is below established-studio quality and several source claims conflict about AI-generated art. |
| Free of visual bugs | FAIL | Current 400×225 proof visibly overlaps balance, bet controls and buttons: reports/screens/layouts-2026-07-25/popout-400x225.png. |
| Mini-player support | FAIL | Board remains 5×4, but the active HUD is distorted and important values are unreadable. The conformance script tests only dismissal of the rules modal, not the active game. |
| Mobile support and usable controls | MARGINAL | Portrait captures reflow successfully, but there is substantial dead space and no real-device or touch-use proof. |
| Static bundle; no external sources | PASS | Clean production build succeeded; fonts are bundled locally; static scan found no runtime font/CDN dependency. RGS/replay calls are the intended platform calls. |
| Detailed, truthful rules | MARGINAL | Core paytable and feature values match maths, but social wording fails and the PAR still contains a retracted six-scatter statement. |
| Per-mode cost and purchased action | PASS | All five mode cards show cost and descriptions. |
| RTP and max win per mode | PASS | All five cards show 96.35% and 5,000× without clipping. |
| All symbol payouts and special values | PASS | Eight paying symbols, Wild, Scatter awards, trigger counts and meter behaviour are described. |
| UI guide | MARGINAL | Complete in real-money mode; hardcoded “Bet” and “Buy” wording makes the same guide non-compliant in social mode. |
| Change bet and expose every authenticated level | FAIL | Local ladder logic is improved, but production authentication cannot populate it. |
| Current balance | FAIL in live operation | Component exists; the live response mapper expects a number where the platform returns a balance object. |
| Final non-zero win clearly shown | MARGINAL | Source and captures show it, but the live round response cannot reach the presentation correctly. |
| Incremental count-up for multi-action wins | MARGINAL | Count-up implementations exist in HudOverlay.svelte, WinDisplay.svelte and WinBanner.svelte; timing and live totals are unverified. |
| Sound disable option | PASS in source | Mute plus music/SFX sliders are implemented. In-context effectiveness is unverified. |
| Spacebar mapped to spin | MARGINAL | Mapping exists, including modal suppression, but disabledSpacebar from the official jurisdiction contract is ignored. |
| Explicit-confirm autoplay | PASS in source | First click opens options; selecting a count starts autoplay. |
| Network errors and information leakage | UNVERIFIABLE | Production mock containment exists and development logging is guarded, but no live network/console session was available. |
| Currency and language robustness | FAIL | RGS currency mapping is broken; platform display metadata is dropped; much of the paytable and several controls remain hardcoded English despite the 16-locale claim. |
| Fastplay remains legible | UNVERIFIABLE | Source has three speed tiers and committed proofs, but timing, legibility and disabled-speed enforcement cannot be assessed without play. |

**RGS communication**

| Requirement | Verdict | Evidence |
|----|----|----|
| Authenticate using platform contract | FAIL | rgsService.ts:59-68, 320-336 expects a flat object. The pinned official client returns nested balance, config, jurisdictionFlags and round. |
| Respect min, max, default, step and bet levels | FAIL | Mapper reads nonexistent top-level fields and therefore cannot populate the ladder. |
| Use rgs_url | FAIL | Normal play does not prepend https:// to the host-form parameter used by the official client; replay does. |
| Correct play and end-round schemas | FAIL | Game expects flat events, numeric balance, roundId and win; official play returns {balance, round} with events in game state. End-round also uses an incompatible round-ID model. |
| Current language/currency | FAIL | Authenticate omits the official language field and drops balance currency/display metadata. |
| Jurisdiction flags | FAIL | Several platform flags are ignored or renamed to invented properties. |
| Active-round recovery | FAIL | Recovery expects \`{roundId, state:'open' |
| Player-visible failure handling | MARGINAL | Auth errors produce a blocking banner, but the current official launch URL is itself misclassified as missing because the guard checks session, not sessionID. |

**Mandatory bet replay**

| Requirement | Verdict | Evidence |
|----|----|----|
| Detect replay, parse parameters and auto-fetch | PASS in source | replayService.ts:56-145. |
| No active session or authenticated wallet calls | PASS in source | Normal RGS initialisation is skipped in replay mode. |
| Loading, Play, Play Again and error states | PASS in source | All are present. |
| Hide normal betting controls and prevent normal-play transition | PASS in source | Replay has a separate UI branch. |
| Show cost, payout and win | MARGINAL | Values are present, but an exact normal-round presentation is not. |
| Replay full round exactly as played | FAIL | Feature rounds use the canonical interpreter; normal wins/losses still search for nonexistent board, win and scatter events. |
| Test IDs for normal, big, cap, loss and feature scenarios | MARGINAL | REPLAY_TEST_EVENTS.md proposes IDs, but admits a possible ±1 mismatch, lacks a pinned base trigger and requires staging verification. |

**Tile and three-star quality**

| Requirement | Verdict | Evidence |
|----|----|----|
| Background and transparent foreground, ≤3 MB combined | PASS | Current pair totals about 0.78 MB. |
| Required delivery naming | FAIL | Files remain tile_background_master.jpg and tile_hero_full.png, not the platform convention. |
| Provider logo clear at small size | FAIL | Tracker TR-031 admits the 48px master is unreadable and no candidate has been adopted. |
| Tested across devices | MARGINAL | Six viewport captures exist; they are browser captures, not real-device tests, and one proves a broken mini-player. |
| Optimised bundle | MARGINAL | Clean build is 14.77 MiB. No hard frontend cap is published, but the dossier’s 13.59 MB figure is stale. |
| Clean, cohesive art and animation | MARGINAL | Feature layering is ambitious, but art styles and finish are inconsistent; animation feel remains unverified. |
| Conceptual depth | PASS | Five modes, a progressive feature meter, retriggers and distinct volatility profiles provide genuine depth. |

**2. FINDINGS**

1.  **BLOCKER — Production launches cannot become playable.**\
    App.svelte:675-695 checks for session, while the official launch contract and the game’s own parser use sessionID; the production live guard therefore disables betting on a correct launch. Separately, [<u>rgsService.ts</u>](https://github.com/JTOSHIE/stake-game-development-claude/blob/78d02cc17ae6e0ed8d40c81c29fe546f9fb2f68b/frontend/src/lib/services/rgsService.ts#L58-L116) models flat authentication/play responses, while the exact official dependency pinned in package-lock.json defines nested [<u>AuthenticateResponse</u> <u>and</u> <u>PlayResponse</u>](https://github.com/StakeEngine/ts-client/blob/df9e126d79b3fe1ef353f4fac9c1699cd79a4d3e/src/types.ts#L60-L122). rgs_url host normalisation, play events, currency, jurisdiction flags, round ID and end-round semantics are also incompatible.\
    **Fix:** use the pinned official client or implement its exact raw contract; use sessionID consistently; test from an official launch URL through authenticate, play, active round and end-round with raw representative fixtures.

2.  **BLOCKER — Mandatory normal-round replay does not replay the shipped event schema.**\
    [<u>ReplayMode.svelte:106-160</u>](https://github.com/JTOSHIE/stake-game-development-claude/blob/78d02cc17ae6e0ed8d40c81c29fe546f9fb2f68b/frontend/src/lib/components/ReplayMode.svelte#L106-L160) uses the canonical interpreter only if freeSpinTrigger exists. Other rounds search for board, win and scatter; the committed live fixtures contain reveal, winInfo, setWin, setTotalWin and finalWin, with zero legacy events. Normal wins and losses therefore produce an empty or static board rather than the exact round.\
    **Fix:** feed every replay through roundInterpreter; add assertions for loss, ordinary win, big win, cap and feature rounds in every applicable mode.

3.  **BLOCKER — stake.us social wording still contains prohibited terms.**\
    PaytableModal.svelte:37-52 renders “pays” in social rules; :96-109 hardcodes “Bet”, “buy” and “Max Bet” throughout the interface guide; WinBanner.svelte:248 always renders BET. Replay’s initial mode derives only from social=true, so an XSC/XEC URL can briefly render the real-money disclaimer before mount. The social conformance script inspects only mode-card text and checks only “Buy” and “Debits”, so its PASS is not meaningful for the full surface.\
    **Fix:** route every player-visible and accessibility string through one social-aware vocabulary layer and scan the complete rendered DOM—including first paint, banners, rules, replay and overlays—against the full platform term list.

4.  **MAJOR — Jurisdiction enforcement tests validate invented flag names.**\
    The official client supplies minimumRoundDuration, disabledSpacebar, disabledSuperTurbo, displayRTP, displaySessionTimer and related flags. responsibleGambling.ts:31-39 instead reads minSpinMs, maxAutoplaySpins, realityCheckMs and mandatorySessionDisplay; it ignores several real flags. The tests pass because they inject those same non-platform properties.\
    **Fix:** type the store from the pinned SDK and test every operative official flag against the controls it must change.

5.  **MAJOR — Current mini-player proof shows an unusable active HUD.**\
    [<u>popout-400x225.png</u>](https://github.com/JTOSHIE/stake-game-development-claude/blob/78d02cc17ae6e0ed8d40c81c29fe546f9fb2f68b/reports/screens/layouts-2026-07-25/popout-400x225.png) shows the balance and bet fields compressed into overlapping vertical fragments, an unlabeled feature control and collisions across the bottom bar. The committed popout gate proves only that the rules modal’s Continue button can be clicked.\
    **Fix:** build a dedicated mini-player HUD and test active idle, spinning, result, feature and modal states for visibility and operability.

6.  **MAJOR — The book/lookup equality verifier can pass with no books.**\
    The private books are absent. Running tools/verify_books_lookup_equality.py at current HEAD generated five zstd: can't stat errors, processed zero rounds and zero assertions, then printed BOOKS/LOOKUP EQUALITY: PASS. It does not fail on missing files or decompressor exit status, nor require exactly 100,000 unique IDs. The committed 4.45-million-assertion report therefore cannot be trusted without the private input package.\
    **Fix:** fail closed on missing input and non-zero subprocess status; require exact row/ID equality, no duplicates, expected hashes and expected assertion counts; rerun against the ACP upload set.

7.  **MAJOR — Platform-driven SC/XEC display metadata is implemented but disconnected.**\
    currency.ts can consume {symbol, symbolAfter, decimals}, but rgsService.authenticate() drops that metadata. Tracker TR-012c explicitly calls this a “WIRING GAP” while labelling the row “MERGED, DTT-verified later”. Current player surfaces therefore use fallback tables rather than platform metadata.\
    **Fix:** preserve authenticated balance/display metadata through the store and pass it to every balance, bet, win, buy and replay formatter.

8.  **MAJOR — Submission tile branding is not final.**\
    Background and foreground exist and meet the size limit, but delivery names do not follow the published convention. The provider-mark tracker admits the current 48px mark is illegible, presents three imperfect candidates and leaves adoption open. SUBMISSION_DOSSIER.md:29-31,164 still says tile/provider work is pending.\
    **Fix:** commission a purpose-drawn small-size provider mark, adopt one final asset and deliver all three files under platform-compliant names.

9.  **MINOR — The repository’s normal type-check command fails and CI does not run it.**\
    npm run check reports 0 Svelte errors, 36 warnings and vite.config.ts:33 TS7006. CI runs only the Svelte baseline, so TR-018’s “baseline is zero and CI enforces it” is incomplete. The warnings include a non-focusable role="dialog" and extensive apparently unused animation selectors.\
    **Fix:** make the complete command green and run it, plus a production build, in CI.

10. **MINOR — Evidence and source-of-truth documents remain internally inconsistent.**\
    The dossier simultaneously treats tile assets as pending and completed; the PAR still says six-plus visible scatters can occur while the corrected facts say five maximum; the bundle-size measurement is stale; several evidence filenames are future-dated relative to commits. These do not change the lookup maths, but they lower confidence in claimed closure.\
    **Fix:** perform one factual reconciliation pass against HEAD and make generated measurements fail when stale.

**3. INDEPENDENT MATHS**

I independently parsed the five shipped lookup CSVs. For each mode:

RTP = Σ(weight × payout_centibets) / (Σweight × 100 × mode_cost)

No studio maths script or reported result was used in the calculation.

| Mode | Cost | RTP | SD raw / cost-normalised | Hit rate | Max frequency | P≥5,000×, operative | P≥10,000× | CVaR99.9 norm | ETL ≥40×cost |
|----|----|----|----|----|----|----|----|----|----|
| Base | 1× | 96.349999873% | 17.284 / 17.284 | 29.1130% | 1 / 100,000.001 | 0.0000100 | 0 | 182.356 | 52.3882% |
| Cruise | 1× | 96.349999947% | 11.290 / 11.290 | 43.8633% | 1 / 250,000.002 | 0.0000040 | 0 | 111.074 | 33.5083% |
| OVERBOOST | 1.25× | 96.349999851% | 20.323 / 16.259 | 29.4422% | 1 / 80,000.000 | 0.0000125 | 0 | 205.741 | 66.5376% |
| Buy Overdrive | 100× | 96.349999996% | 206.633 / 2.066 | 100% | 1 / 1,000.000 | 0.0010000 | 0 | 50.000 | 5.1910% |
| NITRO | 400× | 96.349999999% | 539.162 / 1.348 | 100% | 1 / 250.000 | **0.0032000 scaled** | 0 | 12.500 | 0% |

Additional checks:

- 100,000 rows per mode; zero zero-weight rows.

- Unique payout values: 10,930 / 5,837 / 14,814 / 37,193 / 46,049.

- Worst top-1% RTP concentration is OVERBOOST at 75.3893%; high, but its normalised ETL remains below the published limit.

- Every lookup maximum is exactly 500,000 centibets = 5,000× base bet.

- All five studio RTP, SD, hit-rate and cap-frequency claims agree with the lookup tables within rounding.

- Review 2’s reported Super cap discrepancy is not reproducible: the lookup is unambiguously 1 in 250.

- Lookup agreement does **not** verify that the private event for each ID actually presents or sums to that payout. That remains unverified because the book proof is not fail-safe and the inputs were unavailable.

- Maximum exposure and the operative raw-versus-normalised CVaR rule remain ACP-dependent.

**4. REMEDIATION VERIFICATION**

**Sample of fixed/MERGED rows**

| Tracker row | Severity | Independent verdict |
|----|----|----|
| TR-008 end-round retry | Minor, financially important | **Present in code**, but not effective end-to-end because the end-round contract itself is wrong. |
| TR-009 canonical live parser | Critical | **Partial.** The parser delegation is correct, but the production play mapper never extracts the official round state; replay still uses legacy events. |
| TR-010 mock containment | Critical | **Partial with regression.** Production mock access is blocked, but correct sessionID launches are also blocked because the guard checks session. |
| TR-011 book equality | High | **Not verified.** Tool passes vacuously with missing books. |
| TR-012 social/currency | High | **Failed as a closure.** Some labels were fixed, but visible banned terms and first-paint replay leakage remain. |
| TR-013 authenticated bet ladder | High | **Verified in the isolated model.** End-to-end behaviour remains impossible while authentication is broken. |
| TR-014/014a locale work | High | **Partial.** Launch locale is applied, but substantial hardcoded English remains in paytable, replay and menus. |
| TR-015 jurisdiction enforcement | High | **Failed against platform contract.** Tests inject invented flag names. |
| TR-016 modal safety/affordability | High | **Verified in source and targeted evidence.** Shared modal registration and per-tier affordability are real changes. |
| TR-018 zero type baseline | Medium | **Partial/overstated.** Svelte has zero errors, but the normal project check still fails and CI omits that failure. |
| TR-021 intro popout | High | **Specific fix verified.** The Continue button is reachable; the active mini-player remains visibly broken. |
| TR-030 short buy-dialog disclosure | High | **Verified in code/evidence.** Sticky disclosure addresses the filed defect. |
| TR-037 max-win clipping | Major | **Verified.** Current capture shows complete 5,000× values and a separate base-bet qualifier. |

**Sample of REFUTED/HALLUCINATED rows**

| Tracker row | Independent verdict |
|----|----|
| TR-001 external Google fonts | **Honest refutation.** Fonts are local in source and production output. |
| TR-002 mandatory sweeps_en.json | **Honest refutation.** The platform recommends that pattern; it does not mandate that filename. |
| TR-032 nonexistent source paths | **Honest HALLUCINATED disposition.** The cited files do not exist; actual equivalents have different names. |
| TR-033 Super cap frequency | **Honest refutation.** Independent result is exactly 1/250. |
| TR-034 nonexistent count-up SFX | **Honest HALLUCINATED disposition.** No such asset or cited implementation exists. |

**Tracker reliability:** Mixed and unsuitable as a release sign-off. It preserves several honest refutations and some genuine fixes, but repeatedly treats an isolated unit test, a vacuous verifier or a deferred DTT check as closure. Every high-severity “MERGED” row still requires direct re-verification.

**5. QUALITY ASSESSMENT**

**Art consistency:** The chrome HUD and automotive symbols form a recognisable system, but the flat cartoon driver, semi-photoreal city/car scene, glossy instrument overlays and thin sci-fi typography do not fully belong to one visual language. A dead-spin board dominated by twenty dark pistons is visually weak. The unresolved provider mark reinforces the impression of a brand system still in development.

**Animation:** The committed feature sequence shows meaningful staging—entry gate, colour-state change, gauge, meter progression and tiered celebrations. That is stronger than a generic static slot. Screenshots cannot establish timing, easing, audio synchronisation or whether effects remain legible at Turbo/Super Turbo. The final result is serviceable from evidence, not exceptional.

**Mobile experience:** Portrait hierarchy is generally coherent and controls appear touch-sized. The bottom half carries conspicuous unused space, while the scene character and automotive identity largely disappear. The 400×225 mini-player is materially below approval quality.

**Clarity of communication:** Real-money mode cards are a strong point: cost, RTP and max win are visible for every mode and the paytable covers symbol combinations and feature access. This is undermined by social-language failures, hardcoded English, stale documentation and a replay that cannot reproduce ordinary rounds.

**Technical performance:** A clean static build succeeds at 14.77 MiB and fonts/assets are local. Source contains extensive performance-oriented work, but the project check fails, the official wallet contract is not implemented and the committed frame-rate figures cannot substitute for real-device testing.

This is not three-star studio quality. Even after functional correction, the current static art and mini-player would require another polish pass before competing beside the platform’s strongest studios.

**6. UNVERIFIABLE WITHOUT PLAY**

- Whether authenticate, play, end-round and recovery behave against an actual staging RGS after correction.

- Reel feel, slam-stop responsiveness and input latency.

- Spin, feature, count-up and celebration pacing.

- Exact synchronization between presented events and wallet settlement.

- Audio quality, loudness, looping, crossfades and mix in context.

- Whether mute silences every currently playing source.

- Turbo/Super Turbo legibility and minimum-round timing.

- Real-device frame rate, thermal behaviour, memory use and loading time.

- Touch ergonomics, safe-area behaviour and orientation changes on physical phones.

- Reduced-motion behaviour in context.

- Screen-reader focus order and modal trapping.

- Network interruption, reload, active-round resumption and double-credit protection.

- ACP maximum exposure, operative CVaR interpretation and uploaded event-book hashes.

- Replay event-ID correctness, including the documented possible ID offset.

- Player feel, entertainment value over repeated sessions and feature-frequency perception.

**7. SCORE**

**0.67 / 3.00 — reject**

The independent lookup maths are submission-grade: RTPs, mode costs, volatility, tails and cap frequencies all reconcile, and the concept has more depth than a basic first release. That cannot offset a production frontend which source analysis shows will disable betting on the official sessionID launch, parse the wallet contract incorrectly, fail mandatory normal-round replay and expose prohibited stake.us language. The mini-player and provider identity also remain below commercial quality. These are approval failures, not polish deductions.

**Approval-thread sentence:** Reject at 0.67: current HEAD does not implement the pinned Stake Engine launch and wallet contract, ordinary-round replay is broken, and stake.us wording still fails despite mathematically compliant lookup tables.

**8. PATH TO THREE STARS**

1.  Replace the custom wallet adapter with the pinned official client or its exact contract; correct sessionID, rgs_url, nested balance/config/round mapping, mode play, settlement, recovery and every official jurisdiction flag.

2.  Route every live and replay round through the same canonical event interpreter, then prove loss, normal win, big win, cap and feature replay in all applicable modes on staging.

3.  Make social mode fail-safe across the full rendered surface and first paint; wire platform currency metadata to every monetary display and test XSC/XEC without raw-code or prohibited-term leakage.

4.  Replace the vacuous book verifier with fail-closed validation and capture ACP evidence for hashes, exposure, CVaR and tail gates.

5.  Rebuild the 400×225 HUD, adopt a purpose-drawn legible provider mark and remove the remaining art-style mismatch and dead space.

6.  Make the complete type/build suite green in CI, then perform recorded real-device, audio, network-recovery, accessibility and fastplay testing.

7.  Only after those functional gates pass, undertake a final animation/art pass aimed at exceptional cohesion and detail; the present visual standard would be closer to a two-star candidate than a three-star release.
