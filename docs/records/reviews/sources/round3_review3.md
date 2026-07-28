**Stake Engine Approval Report: iteration or from the third reviewer**

**Future Spinner — round-two approval review**

**Prominent limitation:** I could not launch and play the game as a player or exercise the current build against a live RGS session. Runtime judgements below rely on source, independent computation, the clean build, and committed screenshots/proofs—not personal play.

Repository reviewed at [<u>649993cca763650d2e9b0092a1a68987a73ffeee</u>](https://github.com/JTOSHIE/stake-game-development-claude/commit/649993cca763650d2e9b0092a1a68987a73ffeee) on main. I checked the current [<u>math requirements</u>](https://stake-engine.com/docs/approval-guidelines/math-verification), [<u>submission checklist</u>](https://stake-engine.com/docs/approval-guidelines/submission-checklist), [<u>frontend requirements</u>](https://stake-engine.com/docs/approval-guidelines/front-end-communication), [<u>RGS requirements</u>](https://stake-engine.com/docs/approval-guidelines/rgs-communication), [<u>replay requirements</u>](https://stake-engine.com/docs/approval-guidelines/game-replay-requirements), [<u>jurisdiction rules</u>](https://stake-engine.com/docs/approval-guidelines/jurisdiction-requirements), and [<u>quality rankings</u>](https://stake-engine.com/docs/approval-guidelines/game-quality-rankings).

**1. CHECKLIST WALK**

| **Requirement** | **Verdict** | **Evidence** |
|----|----|----|
| RTP 90.0–96.70% | **PASS** | Independent weighted recomputation of all five lookUpTable\_\<mode\>\_0.csv files gives 96.34999985–96.349999999%. |
| Cross-mode RTP spread ≤0.5pp | **PASS** | Measured spread is approximately 0.00000015 percentage points. |
| Hard maximum-win cap | **PASS** | Maximum payout is exactly 500,000 centibets, or 5,000×, in every table; zero rows exceed it. |
| Max win realistically obtainable | **PASS** | Cap odds range from 1-in-250 to 1-in-250,000, comfortably more frequent than the usual 1-in-10,000,000 concern. |
| Automated multiplier/volatility/tail/CVaR/ETL gates | **PASS** | Maximum payout 5,000×; maximum cost 400×; base SD 17.284×; worst cost-scaled 5,000× tail is 0.0032; P≥10,000× is zero; estimated worst 0.1%-tail CVaR is 205.741; worst ETL above 40× cost is 0.6411. |
| ≤10,000,000 outcomes and ≤4.2GB per event file | **UNVERIFIABLE** | BOOKS_MANIFEST.md claims 100,000 rows and 17–152MB per book, but the five books are absent from the repository. The committed lookup tables do have 100,000 rows each. |
| Book-to-lookup semantic equality | **UNVERIFIABLE** | The current verifier correctly exits 2 when books are absent. The committed 500,000-round result cannot be independently rerun or bound to the private input files. See Finding 2. |
| Stateless rounds | **MARGINAL** | roundInterpreter.ts, replay/live parsers, index.json, and committed live payload captures support single-round resolution. The private event streams remain inaccessible. |
| Clean finalized build | **PASS** | Fresh npm ci plus npm run build succeeded. Build stamp identifies clean HEAD, version V10: 110 files, 15,633,367 bytes/14.91MiB. |
| Fully static; no unrelated external sources | **PASS** | Source has only local plates.json, parameter-derived RGS POSTs, and parameter-derived replay GETs. Fonts are bundled locally. Telemetry has no network sink. |
| Authentication, invalid-launch failure, production mock containment | **MARGINAL** | Source fails closed through stores/liveGuard.ts; current mock-containment checks pass. Live evidence is V8, while HEAD builds V10. |
| Canonical play and settlement path | **PASS** | rgsService.ts:617-637 sends integer-micro amount; :698-702 retries end-round; :845-860 delegates to the canonical event interpreter. |
| Authenticate-driven bet levels and minStep | **MARGINAL** | Player selections are confined to returned betLevels, so arbitrary off-step values cannot be synthesized. However stepBet, defaultBetLevel, minBet, and maxBet are parsed and then dropped by initRGS; the platform default is not applied. |
| Bet Replay | **MARGINAL** | Mandatory parameters, GET endpoint, canonical interpretation, Play/Play Again, cost multiplier and error states are present. V8 live screenshots show replay working, but no current V10 live recapture exists. Several replay labels remain English in non-English sessions. |
| Spacebar maps to spin | **PASS** | App.svelte:1593-1634 routes Space through handleSpin, respects modal/live/jurisdiction guards, and prevents scrolling only after taking ownership. |
| Balance, bet, final win and incremental count-up | **PASS** | Authoritative balance is propagated after play/end-round; integer-micro formatting is centralized; HUD and WinBanner implement count-up. Timing and perceived smoothness remain unplayed. |
| Explicit-confirm autoplay; no one-click indefinite repetition | **PASS** | Current static gate finds exactly one isAutoPlay.set(true) call, behind a real option click. Stop conditions and fire-time modal guards are implemented. |
| High-cost feature confirmation and affordability | **PASS** | Source derives 100×/400× prices from MODE_COST, checks balance, and requires a separate confirm action. |
| Per-mode cost, RTP and maximum-win disclosure | **PASS** | PaytableModal.svelte:295-347 renders all five modes from FS_MODES; each card shows cost, 96.35% RTP and 5,000× max. |
| Symbol pays, special values, feature access and UI guide | **PASS in English** | Paytable contains all symbol awards, scatter multipliers/free spins, feature rules and eight captured control illustrations. |
| Language parameter robustness | **PASS** | App.svelte:161-196 resolves the launch language before first render, falls back safely, and forces English for social mode. |
| Advertised 16-locale completeness | **FAIL** | Core prose, mode descriptions, paytable headings and win celebrations remain English. Confirmed both in source and committed Arabic/German live frames. |
| Social-mode prohibited vocabulary | **PASS** | Current source gate scans 59 accessibility attributes; vocabulary and DOM checks pass. Social branches replace restricted betting/buy/win terms on inspected surfaces. |
| XSC/XEC never display raw platform codes | **PASS for current fallback** | Independent 82-assertion currency test passes; XSC/XEC render as trailing SC, matching the current currency table. |
| Platform-driven currency display metadata | **MARGINAL** | Formatter support exists, but no component receives auth.currencyDisplay; every money call omits its metadata argument. Current official RGS documentation does not define that field, so this is not evidence of a live wrong display, but the claimed end-to-end support is absent. |
| Jurisdiction and responsible-gambling flags | **PASS** | Official flags drive autoplay, turbo, super-turbo, slam-stop, spacebar, buy-feature visibility, session display and minimum duration. Current 59-check RG proof passes. |
| Telemetry does not influence outcomes or create egress | **PASS** | telemetry.ts is sink-based and no-op by default; only a development in-memory sink is registered. No telemetry network call exists in source or bundle. |
| Desktop/mobile/popout geometry and no document scrolling | **MARGINAL** | Headless seven-preset geometry reports no clipping/scrolling; mobile grids reach 83.7–96% viewport width and committed screens look composed. Old real phones and live V10 remain untested. |
| 400×225 mini-player | **MARGINAL** | Dedicated compact HUD and screenshots exist; the current geometry report passes. The most detailed mini-player proof predates later layout revisions. |
| Sound disable and reduced-motion support | **MARGINAL** | Source contains music/SFX controls and reduced-motion branches. Mix, looping, latency and actual muting cannot be verified without play. |
| Original branding, no Stake branding or underage appeal | **PASS** | Committed screenshots show a bespoke cyberpunk automotive identity; player-facing assets contain no Stake branding or child-oriented imagery. |
| Tile/portal/team/payment submission state | **UNVERIFIABLE** | Tile masters exist under design-system/brand/tile/; portal upload state, final team profile, legal title clearance and activation readiness cannot be established from HEAD. |
| Evidence current against HEAD | **FAIL** | Live pack identifies V8/e0c30611; clean HEAD builds V10/649993c. Other proof inconsistencies are detailed in Finding 4. |
| Three-star commercial finish | **MARGINAL** | Cohesive, distinctive and feature-rich, but mixed-language key information, unclosed evidence provenance and unverified runtime polish are incompatible with top-tier approval. |

**2. FINDINGS**

**1. MAJOR — Key player information and celebrations are not localized**

frontend/src/lib/components/WinBanner.svelte:195-207 hardcodes BIG WIN, MEGA WIN, EPIC WIN and BET in component script. The Arabic live frame reports/screens/live-portal-2026-07-28/085921_frame.png visibly shows “BIG WIN” and “11x BET” over an Arabic HUD.

PaytableModal.svelte:37-69,191-230,261,304-405 also contains English-only ways instructions, rules, table headings, mode statistics, interface guide, responsible-play copy and disclaimer. config/fsModes.ts:59-115 holds English-only mode descriptions. The German live capture shows translated chrome surrounding English body copy.

This is not a missing decorative translation; it affects rules, costs, feature explanations and the game’s most prominent win surface.

**Required fix:** route every visible string and accessibility label through the locale layer, add all 16 translations, and replace regex-only coverage with an AST/runtime gate that finds literals in script variables as well as markup. Capture paytable, feature menu, replay and each win tier in representative LTR and RTL locales.

**2. MAJOR — Private-book semantic proof is not approval-grade provenance**

The current tools/verify_books_lookup_equality.py is materially improved and fails closed. My run without private books exited 2, and its self-test passed.

The committed positive result remains untrustworthy as current proof:

- reports/qa/books_lookup_equality_2026-07-25.json contains no verifier commit, input hashes or run timestamp binding it to the books listed in BOOKS_MANIFEST.md.

- The result predates the fail-closed verifier revision in substance, even though it was recommitted with that revision.

- BOOKS_MANIFEST.md says “Generated 2026-07-28,” but its current blob was introduced by commit dc87a2f, authored and committed on 2026-07-25. That stated generation date is impossible under the repository history.

- For capped rounds, verify_books_lookup_equality.py accepts inner \>= spin_total for every winInfo event, not specifically the event that crosses the cap. This is broader than the documented truncation exception.

None of this proves the books are wrong; it means the claimed 4,455,829-assertion semantic proof is not independently attributable to the stated private inputs.

**Required fix:** rerun the current verifier against the exact upload directory and commit a signed report containing verifier commit, all five book hashes, all five lookup hashes, row counts and run timestamp. Narrow the capped-round exception to the actual crossing event and verify cumulative pre-cap/post-cap totals.

**3. MAJOR — Authoritative RGS configuration is parsed, then discarded before consumption**

rgsService.ts:563-576 correctly extracts minBet, maxBet, stepBet, defaultBetLevel and optional currencyDisplay. But initRGS() at :732-738 publishes only balance, currency, bet levels and jurisdiction.

Consequences:

- The initial betAmount remains the local \$1.00 default whenever \$1.00 is on the returned ladder, even if the platform supplies another defaultBetLevel.

- stepBet is never validated directly; correctness relies entirely on the platform’s returned ladder already being valid.

- Currency display metadata cannot reach any component. Calls such as HudOverlay.svelte:287-288 and WinBanner.svelte:198 omit the formatter’s metadata argument.

The current trailing-SC fallback matches today’s documented XSC/XEC display, so I did not find a current raw-code money error. Nevertheless, the claimed metadata-driven remediation is not end-to-end, and the default/min-step contract is only partly respected.

**Required fix:** publish the complete normalized authenticate configuration to stores, initialize the bet from the returned default, assert every level lies inside min/max and aligns with step, and pass currency display metadata to every money surface, including replay.

**4. MINOR — Current runtime evidence is stale or non-reproducible**

- The live portal catalogue explicitly identifies V8/e0c30611; HEAD builds V10/649993c. There are changes across 26 frontend files between those revisions.

- frontend/scripts/build_diet_verify.mjs fails at HEAD: it migrated to an in-process server but still calls preview.kill() at line 206. My execution ended with TypeError: preview.kill is not a function, so it cannot currently produce its advertised network-hygiene verdict.

- reports/screens/motion-v2/proof-summary.json records one 150ms long frame, while reports/qa/anticipation_performance_2026-07-25.md says the environment cannot verify the frame gate and idles at 34–43fps. Neither is current real-device proof.

- Detailed mini-player evidence predates the title-drop and later composition revisions.

**Required fix:** repair the gate, upload the exact clean V10 artifact, and recapture authentication, play/end-round, replay, social currency, mobile and both popout sizes. Replace machine-local paths and old performance snapshots with HEAD-bound evidence.

**5. POLISH — Shipping and code hygiene are below a three-star standard**

The build is comfortably under its 25MiB internal budget, but approximately 1.865MiB of root assets/sounds/ is unreferenced, and the 886KB bg-1.jpg is unreachable in production because production forces the Future Spinner theme and renders bg_base.jpg/bg_overdrive.jpg directly.

npm run check succeeds but reports 36 warnings in five files, including accessibility warnings. The installed dependency tree also reports one moderate production-class qs advisory, although that package does not appear to be part of the static player runtime.

**Required fix:** prune unreachable assets, resolve rather than baseline the warnings, and refresh dependencies with a rebuilt/static regression pass.

**3. INDEPENDENT MATHS**

All calculations used the committed CSV weights directly:

RTP = Σ(weight × payoutCentibets) / \[100 × cost × Σ(weight)\]

| **Mode** | **Cost** | **RTP** | **Raw SD** | **Max / base bet** | **Max / actual cost** | **P(5,000×)** | **Odds** | **Top 1% share of RTP** |
|----|----|----|----|----|----|----|----|----|
| Base | 1× | 96.349999873% | 17.2841× | 5,000× | 5,000× | 0.0000100000 | 1-in-100,000 | 64.3030% |
| Cruise | 1× | 96.349999947% | 11.2897× | 5,000× | 5,000× | 0.0000040000 | 1-in-250,000 | 49.0170% |
| Antelite | 1.25× | 96.349999851% | 20.3234× | 5,000× | 4,000× | 0.0000125000 | 1-in-80,000 | 75.3893% |
| Bonus | 100× | 96.349999996% | 206.6329× | 5,000× | 50× | 0.0010000000 | 1-in-1,000 | 12.9782% |
| Super | 400× | 96.349999999% | 539.1618× | 5,000× | 12.5× | 0.0040000000 | 1-in-250 | 9.1434% |

Additional results:

- Rows above the 5,000× cap: **zero in every mode**.

- Payout probability at or above 10,000×: **zero in every mode**.

- Base weighted hit rate: **29.1129691%**, matching the studio’s 29.11%.

- Share of RTP supplied by the single cap outcome: base 5.1894%, cruise 2.0758%, antelite 5.1894%, bonus 5.1894%, super 5.1894%.

- Top 0.1% weighted-outcome share of RTP: base 18.9264%, cruise 11.5282%, antelite 21.3535%, bonus 5.1894%, super 1.2974%.

- Worst ETL contribution above 40× actual cost: **0.641055**, Antelite.

- Estimated normalized CVaR of the worst weighted 0.1%: base 182.356, cruise 111.074, antelite 205.741, bonus 50.000, super 12.500.

- Super’s 5,000× tail after the documented 0.8 cost relief: 0.004 × 0.8 = 0.0032, below 0.01.

- Cross-mode RTP spread: approximately **0.00000015pp**.

Comparison with studio documents:

- RTP, cap, cap frequencies, base hit rate and all published SD figures agree.

- The independently obtained ETL maximum rounds to the ACP capture’s 0.641.

- The ACP capture reports CVaR 205.710 versus my top-0.1%-tail estimate of 205.741. The 0.031 difference is consistent with the repository’s acknowledged quantile-boundary ambiguity and is immaterial to either 700/800 limit; it is not evidence of table drift.

- No mathematical discrepancy was found in the committed lookup tables.

- Antelite’s top 1% supplying 75.39% of RTP is commercially significant concentration, but not a rules breach.

**4. REMEDIATION VERIFICATION**

**Fixed/MERGED sample**

| **Tracker row** | **Result** | **Verification** |
|----|----|----|
| TR-008, end-round retry | **VERIFIED** | rgsService.ts:698-702 now wraps the credit/settlement leg in \_withRetry. |
| TR-009, invented live event parser | **VERIFIED — high severity** | \_parsePlayResponse() delegates to interpretEvents() and strips padding to 5×4. |
| TR-010, production mock fallback | **VERIFIED — high severity** | Production action routes are guarded and the current built bundle passes the mock-marker scan. |
| TR-013, authenticate bet ladder | **NARROWLY VERIFIED** | All player-selectable levels come from rgsBetLevels; hardcoded-ladder drift is fixed. Default/minStep passthrough remains incomplete. |
| TR-014, launch locale | **NARROWLY VERIFIED** | Locale is set before first render and fallback works. This did not make the whole product localized. |
| TR-015, jurisdiction/RG enforcement | **VERIFIED** | Official flags have concrete consumers; current RG checks pass. |
| TR-016, modal safety | **VERIFIED** | Shared modal registration blocks spacebar and rechecks autoplay at fire time. |
| TR-044, verifier passing with absent books | **VERIFIED** | Direct run exits 2; --self-test passes both absent-input cases. |
| TR-091, locale-gate blind spots | **PARTIAL** | The named 19 instances were fixed, but TR-104 proves the systemic guard still misses literals assigned in component script. |
| TR-094, max-win hold | **VERIFIED IN SOURCE — high severity** | Spin/buy actions guard isWincap; replay ordering and animation suppression are present. Runtime feel remains unplayed. |
| TR-012c, currency metadata | **INCOMPLETE** | Formatter and RGS mapping exist, but initRGS drops the metadata before UI consumption. “DTT-verified later” overstates the end-to-end state. |

**REFUTED/HALLUCINATED sample**

| **Tracker row** | **Result** | **Verification** |
|----|----|----|
| TR-001, external Google fonts | **REFUTATION HONEST** | No Google font URL; Orbitron WOFF/WOFF2 files are bundled locally. |
| TR-002, mandatory sweeps_en.json | **REFUTATION HONEST** | Current rules recommend a naming pattern but do not mandate that exact file; equivalent social branching exists. |
| TR-050, 0.60pp Super RTP drift | **REFUTATION HONEST** | Independent five-table recomputation finds all modes at 96.35%. |
| TR-052, Super 5,050× breach | **REFUTATION HONEST** | Row 40992 is 10550 centibets, or 105.50×; every table max is exactly 5,000×. |

**Tracker reliability verdict:** broadly useful but not self-authenticating—9 of 11 sampled fixed dispositions fully survived, two were only partial/incomplete, and all four sampled refutations were honest.

**5. QUALITY ASSESSMENT**

The visual identity is stronger than a typical first submission. The cyan/magenta/gold palette, pilot, car, industrial reel frame and mechanical symbols form a coherent cyberpunk-automotive system. The desktop, portrait and compact screenshots look intentionally composed rather than assembled from platform samples. Five modes, standing-mode variance, Overboost and the progressive Overdrive presentation provide credible product depth.

The weaknesses are those real reviewers punish:

- The paytable and feature panels are information-dense, with narrow Orbitron copy and extensive scrolling.

- Symbols are dark and relatively uniform at idle; the large metal frame can dominate the symbol art.

- Non-English sessions visibly fracture into translated controls plus English rules and celebrations.

- Popout readability is engineered tightly enough that screenshots and measurement are not substitutes for an actual small-screen session.

- Animation ambition is evident in the committed sequences, but timing, anticipation payoff, celebration interruption and performance are not credibly proven on current hardware.

- The evidence package is voluminous but not consistently current or reproducible. For approval, more evidence is not better when version identity and provenance are uncertain.

This is credible **two-star commercial work**: original and substantially polished, but not yet the exceptional, uncompromised execution required for three stars.

**6. UNVERIFIABLE WITHOUT PLAY**

- Reel feel, slam-stop responsiveness and whether the anticipation cadence creates tension rather than delay.

- Win count-up smoothness, banner timing and the indefinite max-win hold in natural play.

- Audio mix, loop seams, ducking, mute behaviour and fatigue across longer sessions.

- Real-device performance, memory pressure and GPU behaviour on older iOS/Android hardware.

- Touch comfort and readability at 320×568 and 400×225 during active rounds and features.

- Current V10 live authentication, retry/idempotency, disconnect recovery and multiple-authenticate behaviour.

- Actual RGS default bet/minStep handling under unusual ladders.

- Live XSC/XEC payload shapes and any currency display metadata.

- Actual 100×/400× wallet debits, credit settlement and insufficient-balance errors at current HEAD.

- Current V10 replay from load through full animation, max-win collection, Play Again and popout.

- Whether autoplay ever feels like consecutive betting from one interaction under latency.

- Full private-book semantic equality and statelessness.

- Overall fun, clarity under motion and repeat-session appeal.

**7. SCORE**

**2.00 / 3.00 — approve at two stars, not three.**

The lookup-table maths is exceptionally clean, the static build is compact and source-level platform coverage is substantially better than the first-round material. I found no mathematical blocker, cap breach, mock-money path or obvious live-wallet miscalculation.

Three stars are not supportable while central rules and celebrations remain untranslated, authoritative RGS configuration is dropped before consumption, the private-book proof lacks attributable provenance, and the current live/performance evidence does not describe the exact submitted build. These are not cosmetic deductions from an otherwise finished top-tier product; they are the difference between a strong submission and one I would confidently place beside the platform’s best studios.

**Approval-thread sentence:** Approve at two stars: the maths and core platform contract are strong, but open localization, RGS configuration and evidence-provenance gaps prevent a three-star recommendation.

**8. PATH TO THREE STARS**

1.  Complete genuine 16-locale coverage for the paytable, features, replay and every celebration; add an AST/runtime guard and RTL/LTR screenshot matrix.

2.  Produce a current, hash-bound private-book verification report using the exact upload files and current verifier; correct the capped-event exception.

3.  Carry default bet, min/max, step and currency display configuration from authenticate through to every consumer, with unusual-ladder and XSC/XEC live tests.

4.  Repair the broken network-hygiene gate, upload the exact clean V10 build, and recapture live authentication, wallet settlement, replay, social currencies, mobile and both popouts.

5.  Run real-device performance and audio QA, then close the remaining accessibility warnings and remove unreachable production assets.

6.  Re-review the resulting exact artifact through actual play. Three stars should not be awarded on source and screenshots alone.
