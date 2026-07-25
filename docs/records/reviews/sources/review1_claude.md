**Future Spinner — first-submission approval review**

**Material limitation:** I could build and inspect the submitted frontend, but I could not launch and play it. Play feel, timing, contextual audio, real-device performance, and live RGS behaviour therefore remain unverified. I judged those areas from committed source, screenshots, proof sequences, and QA artefacts.

Review basis: repository snapshot [f5be4e74f937d326cc131f7d349567aa974abe89](https://github.com/JTOSHIE/stake-game-development-claude/commit/f5be4e74f937d326cc131f7d349567aa974abe89). The later 49fbf1d revision changes only audit-index/communications documents, not the implementation under review.

The governing sources were the current [approval guidelines](https://stake-engine.com/docs/approval-guidelines), [math verification rules](https://stake-engine.com/docs/math-verification), [frontend requirements](https://stake-engine.com/docs/front-end-communication), [RGS requirements](https://stake-engine.com/docs/rgs-communication), [replay requirements](https://stake-engine.com/docs/game-replay-requirements), [jurisdiction requirements](https://stake-engine.com/docs/jurisdiction-requirements), [tile requirements](https://stake-engine.com/docs/game-tile-requirements), and [math file format](https://stake-engine.com/docs/math/math-file-format).

**1. CHECKLIST WALK**

**Orientation assertions extracted without trust**

| **Studio assertion** | **Verification outcome** |
| --- | --- |
| 5×4, 1,024-ways cyberpunk automotive slot | Supported by source and screenshots. |
| Modes/costs: Base 1×, Cruise 1×, Antelite/Overboost 1.25×, Bonus 100×, Super 400× | CSV index, frontend, and independent computation agree. |
| Every mode RTP is 96.35%, with zero spread | Verified independently to displayed precision. |
| Maximum win is 5,000× and never exceeded | Verified in every lookup CSV. |
| Cap frequencies: 1/100,000; 1/250,000; 1/80,000; 1/1,000; 1/250 | Verified by weighted computation. |
| Raw payout SDs: 17.28, 11.29, 20.32, 206.63, 539.16 | Verified independently. |
| 3/4/5 scatters award 8/12/16 free spins, meters 1×/3×/10×; retrigger +5; winning free spins advance the meter; Super starts at 5× | Implemented/described in source, but the shipped event books needed to verify generated outcomes are absent. |
| Whole feature is stored in one book entry and the game is stateless | Source architecture and scans support the intent; impossible to verify against the absent books. |
| Static build, self-hosted assets, no third-party network calls | Verified in source and a fresh production build. |
| Spacebar, auth bet levels, count-up, sound control, explicit autoplay confirmation, replay, social wording, 16 languages, RG enforcement | Mixed. Several material failures are detailed below. |
| All eleven mandatory publish files are present and hash-verified | False. Only seven files are present; all five event books are absent. See [publish_files/](https://github.com/JTOSHIE/stake-game-development-claude/tree/f5be4e74f937d326cc131f7d349567aa974abe89/games/future_spinner/library/publish_files). |
| Submission and tile package are finalized | False. The dossier remains stale, the committed distribution is incomplete, and tile naming/small-scale branding need work. |

**Submission, conduct, and asset requirements**

| **Requirement** | **Verdict** | **Evidence** |
| --- | --- | --- |
| Final, internally coherent submission | **FAIL** | [SUBMISSION_DOSSIER.md](https://github.com/JTOSHIE/stake-game-development-claude/blob/f5be4e74f937d326cc131f7d349567aa974abe89/SUBMISSION_DOSSIER.md) claims all event books are present; the directory contains none. Other readiness/tile statements are also stale. |
| Game description and factual submission materials | **MARGINAL** | Dossier, [GAME_FACTS.md](https://github.com/JTOSHIE/stake-game-development-claude/blob/f5be4e74f937d326cc131f7d349567aa974abe89/GAME_FACTS.md), PAR sheet, and compliance watch exist, but they conflict with the submitted artefacts. |
| No jackpot, gamble, continuation, cash-out, or persistent-player-state mechanic | **PASS** | No such mechanic found in source or game documentation. |
| Stateless server-authoritative rounds | **UNVERIFIABLE** | Frontend resets round state, but event-book structure and generated feature state cannot be checked because books_*.jsonl.zst files are absent. |
| Original/appropriate branding; no Stake branding or underage/offensive imagery | **MARGINAL** | Committed art appears appropriate, but provenance and rights cannot be independently established from repository evidence. |
| Fully static, no fixed third-party resources | **PASS** | Fresh production build succeeded; self-hosted fonts/assets were found, with no fixed third-party runtime fetches. Dynamic RGS traffic and same-origin plate JSON are expected. |
| Background tile meets dimension/size requirements | **PASS** | design-system/brand/tile/tile_background_master.jpg, 2048×1152 and well under 3 MB. |
| Foreground tile has transparency and size compliance | **PASS** | tile_hero_full_transparent.png, transparent and under the combined size ceiling. |
| Provider mark and prescribed delivery naming/readability | **MARGINAL** | A transparent provider asset exists, but final file naming does not match delivery conventions and the 48 px proof is poorly legible. |
| Clean deployable build committed | **MARGINAL** | A fresh build works, but tracked frontend/dist contains only index.html and vite.svg, not the generated static asset set. |

**Mathematics and publish files**

| **Requirement** | **Verdict** | **Evidence** |
| --- | --- | --- |
| Index and lookup tables for all modes | **PASS** | Five CSVs plus index are present and structurally valid. |
| Compressed JSONL event book for every mode | **FAIL** | All five books_<mode>_0.jsonl.zst files are absent. These are mandatory under the current math-file format. |
| Lookup payouts match event-book results | **UNVERIFIABLE** | No books to decode or compare. |
| 100,000–1,000,000 simulations per mode | **PASS** | Each lookup has 100,000 unique, contiguous simulation IDs. |
| Positive weights and parseable integer payouts | **PASS** | Verified across all five CSVs. |
| RTP between 90.0% and 96.70% | **PASS** | Independently recomputed at effectively 96.35% for every mode. |
| RTP spread no greater than 0.5 percentage points | **PASS** | Observed spread is approximately 0.000000148 percentage points. |
| 5,000× cap observed and never exceeded | **PASS** | Maximum lookup payout is exactly 5,000× in all modes; no row exceeds it. |
| Maximum win realistically obtainable | **PASS** | Weighted cap rates range from 1/250 to 1/250,000, all much more frequent than 1/10,000,000. |
| Base volatility in allowed range | **PASS** | Base SD 17.2841, inside the 0.6–60 gate. |
| 5,000×/10,000× tail limits | **PASS** | Raw 5,000× probabilities pass; no payout reaches 10,000×. |
| Payout multiplier, cost multiplier, and max exposure gates | **PASS** | Max payout 5,000×; max mode cost 400×; at the configured $100 base level, maximum liability is $500,000 and Super costs $40,000. |
| CVaR and ETL liability gates | **PASS** | Independently recomputed values remain below the current thresholds. Antelite is the most concentrated but still passes. |
| Reported mode costs, RTP, SD, and cap frequency | **PASS** | No numeric divergence at the precision claimed by the studio. |
| Feature rules and statelessness reflected in event books | **UNVERIFIABLE** | Mandatory primary evidence is missing. |

**Frontend requirements**

| **Requirement** | **Verdict** | **Evidence** |
| --- | --- | --- |
| Distinct game assets and coherent theme | **MARGINAL** | Substantial custom art exists, but the visual language mixes cinematic background art, flat cartoon characters, glossy frames, and differently rendered symbols. |
| Responsive desktop, portrait, landscape, and mini-player presentation | **MARGINAL** | Proofs show functional responsive layouts without obvious board clipping; actual interactive popout behaviour is unplayed. |
| No external CDN, font, or image dependency | **PASS** | Source and fresh built output use local assets. |
| Rules show every mode’s cost, RTP, and maximum win | **PASS** | The main mode cards disclose all five. |
| Rules explain symbol payouts and feature access | **MARGINAL** | Standard awards and mode access are covered, but 6+ scatter payout/retrigger treatment is incomplete. |
| All special symbol values and exceptional conditions disclosed | **FAIL** | The 6+ scatter case present in the maths/PAR is omitted from player rules. |
| UI button guide | **PASS** for real-money mode; **FAIL** for social mode | The guide exists, but hardcoded text includes “Bet,” “Max Bet,” and “buy feature.” See [Paytable.svelte](https://github.com/JTOSHIE/stake-game-development-claude/blob/f5be4e74f937d326cc131f7d349567aa974abe89/frontend/src/lib/components/Paytable.svelte). |
| All authenticated bet levels supported consistently | **FAIL** | Primary HUD uses authenticated levels; Feature Menu imports a hardcoded ladder from [gameStore.ts](https://github.com/JTOSHIE/stake-game-development-claude/blob/f5be4e74f937d326cc131f7d349567aa974abe89/frontend/src/lib/stores/gameStore.ts). |
| Balance and final-win values displayed | **PASS** | Implemented in HUD/results surfaces. |
| Incremental win count-up | **PASS** | Source and QA evidence include count-up behaviour. |
| Spacebar starts a spin | **PASS** in ordinary state | Global handler exists. |
| Spacebar cannot act behind blocking dialogs | **FAIL** | Global handler does not know Feature Menu or buy-confirmation local modal state. |
| Sound can be disabled | **PASS** | Sound toggle/mute handling is implemented. |
| Autoplay requires explicit confirmation | **PASS** | Confirmation flow exists. |
| Jurisdictional autoplay cap and turbo restrictions | **FAIL** | Cap values are derived but not fully enforced: options above the cap remain selectable, and turboDisabled is not consumed by the control UI. |
| Minimum spin duration enforced | **MARGINAL** | Applied to autoplay scheduling, not clearly to manual/turbo presentation. |
| Buy feature hidden where prohibited | **PASS** | disabledBuyFeature is handled. |
| Correct affordability checks for all buy modes | **FAIL** | Confirmation uses a 100× affordability helper even when Super costs 400×; the final handler lacks a tier-specific balance guard. |
| Social-casino player-visible terminology | **FAIL** | Hardcoded real-money terms remain in the rules guide and accessibility labels. |
| Current social-casino currency support | **FAIL** | XGC/XSC are recognized; current XEC/Stake EU handling is absent. |
| Robust language parameter and fallback | **FAIL** | Locale files exist, but the launch lang value is parsed and never applied to the locale store. The game remains English. |
| Correct currency formatting | **MARGINAL** | Known currencies are formatted consistently, but XEC renders as an unrecognized code rather than social SC; many formatter calls omit the active locale. |
| No prohibited logging/telemetry leakage | **PASS** | Production telemetry is effectively no-op; no third-party reporting endpoint was found. |
| Fast-play behaviour and state protection | **MARGINAL** | Proof and logic exist, but blocking-modal and RG issues prevent a clean pass. |
| No placeholder production asset | **FAIL** | Default Vite favicon remains in the shipped frontend; unused Svelte starter art also remains in source. |

**RGS and replay requirements**

| **Requirement** | **Verdict** | **Evidence** |
| --- | --- | --- |
| Dynamic rgs_url, session parameters, authenticate/play/end-round flow | **PASS** structurally | Implemented in [rgsService.ts](https://github.com/JTOSHIE/stake-game-development-claude/blob/f5be4e74f937d326cc131f7d349567aa974abe89/frontend/src/lib/services/rgsService.ts). |
| Micros/base-unit conversion | **PASS** | Integer conversion and display helpers are present. |
| Authenticated limits and levels control the complete UI | **FAIL** | Feature Menu retains the hardcoded ladder. |
| Incoming RGS events produce the shown board and wins | **FAIL** | Live parser expects board, win, scatter; the project’s canonical interpreter and sample rounds use reveal, winInfo, and related events. |
| Long-feature active-round recovery | **FAIL** | authenticate.round is parsed but not used to resume a feature after reload/disconnect. |
| End-round resilience | **MARGINAL** | No retry/reconciliation path is evident. |
| Authentication failure cannot create unbacked gameplay | **FAIL** | Real authentication failure disables RGS mode, after which subsequent spin calls route to the local random mock implementation. |
| Mandatory replay entry and loading/error handling | **PASS** structurally | Replay detection, loading, errors, play-again, and hidden betting controls exist. |
| Replay reproduces full real result | **FAIL** | Normal non-feature replay uses the same obsolete board/win/scatter assumptions and can show an empty/default board. |
| Replay makes no new session/gameplay calls | **PASS** by source inspection | It uses fetched replay data rather than authenticating/spinning. |
| Replay displays cost, payout, and final win | **PASS** structurally | Replay summary values are rendered. |
| Replay social-language inference | **FAIL** | It depends on an optional social=true flag rather than reliably deriving social mode from XGC/XSC/XEC currency. |
| Replay audiovisual fidelity | **UNVERIFIABLE** | Cannot play; event mismatch already prevents a functional result pass. |

**QA and proof artefacts**

| **Requirement** | **Verdict** | **Evidence** |
| --- | --- | --- |
| Production build | **PASS** | Fresh build completed in 3.77 seconds. |
| Static-analysis/type quality gate | **FAIL** | npm run check reports 11 errors and 36 warnings across nine files. |
| Bundle size | **PASS** | Fresh static output is approximately 13.38 MiB, under the 25 MiB limit. |
| Current proof evidence matches exact reviewed implementation | **MARGINAL** | Full portrait/landscape proofs predate later changes to App, Feature Menu, Paytable, Replay, and currency logic; only some currency/social proofs were regenerated. |
| Touch targets/font/frame QA | **MARGINAL** | Automated reports are present and mostly passing; reduced-motion captured one 150 ms frame and the reports do not substitute for real-device play. |
| Audio QA | **UNVERIFIABLE** | The committed verifier records failed decode/loop checks and does not confirm feature-bed switching or reversion. |

**2. FINDINGS**

- **[BLOCKER] The mandatory event books are not in the submission.**
Evidence: [games/future_spinner/library/publish_files/](https://github.com/JTOSHIE/stake-game-development-claude/tree/f5be4e74f937d326cc131f7d349567aa974abe89/games/future_spinner/library/publish_files) contains the index, metadata, and five lookup CSVs, but none of the five referenced books_*.jsonl.zst files. This contradicts the dossier’s claim that all eleven mandatory files are present. Without them, event schemas, feature behaviour, statelessness, and lookup-to-book payout equivalence cannot be verified.
**Fix:** ship the exact five compressed books referenced by the index; record hashes; independently decode every row and prove the summed event payout equals its lookup payout.

- **[BLOCKER] The frontend does not understand its own live RGS event contract.**
Evidence: [rgsService.ts](https://github.com/JTOSHIE/stake-game-development-claude/blob/f5be4e74f937d326cc131f7d349567aa974abe89/frontend/src/lib/services/rgsService.ts) looks for board, win, and scatter. [roundInterpreter.ts](https://github.com/JTOSHIE/stake-game-development-claude/blob/f5be4e74f937d326cc131f7d349567aa974abe89/frontend/src/lib/services/roundInterpreter.ts) and committed sample rounds use reveal, winInfo, and the newer event family. The normal live result can therefore settle monetarily while showing an empty/default board. Normal replay repeats the obsolete assumptions.
**Fix:** create one canonical adapter based on the shipped event schema and use it for both live play and replay; test it against decoded event-book rows and representative RGS fixtures.

- **[BLOCKER] A failed production authentication can fall into local random mock play.**
Evidence: real auth failure switches _rgsMode off in rgsService.ts; later spin() calls then enter the Math.random mock path. A session-bearing production launch must never become an unbacked local game.
**Fix:** compile mock behaviour out of production or require an explicit development flag plus absence of all real-session parameters. Authentication failure must leave betting hard-disabled.

- **[MAJOR] Current social-casino and Stake EU requirements are not met.**
Evidence: [currency.ts](https://github.com/JTOSHIE/stake-game-development-claude/blob/f5be4e74f937d326cc131f7d349567aa974abe89/frontend/src/lib/utils/currency.ts) recognizes XGC/XSC but not XEC. Paytable/interface-guide text contains “current bet,” “Increase Bet,” “Max Bet,” and “buy feature.” Replay social mode relies on an optional flag. Current jurisdiction requirements treat XGC, XSC, and XEC as social currencies and prohibit real-money terms in social presentation.
**Fix:** add XEC→SC handling everywhere; derive social mode from currency; route all visible and accessible copy through a social-safe terminology layer; add DOM-level prohibited-term tests.

- **[MAJOR] Bet-level conformance breaks outside the primary HUD.**
Evidence: the primary HUD uses authenticated levels, while [FeatureMenu.svelte](https://github.com/JTOSHIE/stake-game-development-claude/blob/f5be4e74f937d326cc131f7d349567aa974abe89/frontend/src/lib/components/FeatureMenu.svelte) uses hardcoded increase/decrease actions from gameStore.ts. An unusual authenticated level can freeze or jump to an invalid value.
**Fix:** expose one authenticated bet-level model and require every bet-changing surface to use it.

- **[MAJOR] Advertised language support is not wired to launch parameters.**
Evidence: locale files exist and lang is parsed, but App initialization does not set the locale store. The runtime therefore stays at the English default.
**Fix:** normalize the launch parameter to supported locales, apply it before the first player-visible render, provide an English fallback, and test every supported and unknown language value.

- **[MAJOR] Responsible-gambling values are derived but not fully enforced.**
Evidence: maxAutoplaySpins and turboDisabled are computed in [responsibleGambling.ts](https://github.com/JTOSHIE/stake-game-development-claude/blob/f5be4e74f937d326cc131f7d349567aa974abe89/frontend/src/lib/services/responsibleGambling.ts), but autoplay options above a jurisdiction cap remain available and the turbo restriction does not disable the HUD control. Manual/turbo play also lacks a clear minimum-duration floor.
**Fix:** filter and clamp autoplay values, disable and reset turbo when required, and enforce the configured minimum presentation duration for every spin path.

- **[MAJOR] Transactional modals do not fully block game input, and Super affordability can be wrong.**
Evidence: the global spacebar guard is unaware of local Feature Menu and buy-confirmation modal state. The confirmation button uses a 100× affordability helper even for the 400× Super tier, and the final buy handler does not repeat a tier-specific balance check.
**Fix:** use a shared blocking-modal state, stop/pause autoplay when a transactional dialog opens, and revalidate balance >= selectedModeCost immediately before every paid action.

- **[MAJOR] Player rules omit a material scatter condition.**
Evidence: the PAR/maths describe 6+ scatters during free spins as paying the five-scatter award at the current meter and also retriggering. The player-facing rules stop at 3/4/5 and only mention “+5” for retriggers.
**Fix:** disclose 6+ scatter evaluation, payout treatment, retrigger treatment, and any count capping explicitly and consistently.

- **[MAJOR] The repository does not pass its own static quality gate.**
Evidence: the production build succeeds, but npm run check returns 11 errors and 36 warnings in Paytable, telemetry, WinDisplay, RainLayer, FlameJets, and related code. A first submission with unresolved compiler/static-analysis defects is not top-tier technical quality.
**Fix:** reach a clean check result and make it a required CI gate before regenerating proofs.

- **[MAJOR] Active-round and end-round recovery are incomplete.**
Evidence: the authentication response’s active round is parsed but not resumed; endRound has no robust retry/reconciliation handling. A reload during a long feature can lose the presentation, and an end-round transport failure can leave the session inconsistent.
**Fix:** hydrate active features from authenticate.round, persist the presentation cursor required for safe resume, and implement idempotent end-round retry/reconciliation.

- **[MINOR] Proof evidence is not fully tied to the exact final implementation.**
Evidence: full portrait/landscape sequences precede later changes to the main App, Feature Menu, Paytable, replay, and currency implementation. A “2026-07-26” review was committed on July 25 and reviewed an older revision.
**Fix:** generate the complete evidence matrix from a clean build of the exact submission commit, recording commit, browser, viewport, currency, language, and jurisdiction in every manifest.

- **[MINOR] Audio evidence does not prove the claims made for it.**
Evidence: the audio verifier records bedSwapFiredOnBonusBuy: false, bedRevertedAfterFeature: false, and loopSeamsWithinTolerance: false, with decode failures. This is not proof of an audible defect, but it is also not successful QA evidence.
**Fix:** run a functioning decode/analysis step and capture executable proof of bed switching, reversion, fades, mute, and loop boundaries.

- **[POLISH] Submission presentation still contains starter residue and weak small-scale branding.**
Evidence: the default Vite favicon remains, unused Svelte starter art is retained, and the provider logo is nearly unreadable in the 48 px proof.
**Fix:** replace starter assets, remove unused material, export delivery-named tile files, and design a simplified provider mark specifically for small display sizes.

**3. INDEPENDENT MATHS**

I parsed each shipped CSV independently. For mode cost \(c\):

\[ RTP = \frac{\sum_i w_i(p_i/100)}{\sum_i w_i \times c}\times100 \]

Cap probability uses weight, not row count. Every table contained 100,000 unique IDs from 0 through 99,999 and positive integer weights.

| **Mode** | **Cost** | **Computed RTP** | **Raw SD** | **SD ÷ cost** | **Max** | **Weighted cap probability** | **Approx. frequency** | **P(≥10,000×)** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Base | 1× | 96.349999873% | 17.284142 | 17.284142 | 5,000× | 0.000999999994% | 1 / 100,000.001 | 0 |
| Cruise | 1× | 96.349999947% | 11.289675 | 11.289675 | 5,000× | 0.000399999998% | 1 / 250,000.002 | 0 |
| Antelite | 1.25× | 96.349999851% | 20.323428 | 16.258742 | 5,000× | 0.001249999992% | 1 / 80,000.000 | 0 |
| Bonus | 100× | 96.349999996% | 206.632948 | 2.066329 | 5,000× | 0.100000000001% | 1 / 1,000.000 | 0 |
| Super | 400× | 96.349999999% | 539.161757 | 1.347904 | 5,000× | 0.399999999851% | 1 / 250.000 | 0 |

The studio’s cost, RTP, raw SD, maximum payout, and cap-frequency claims all reconcile at their stated precision. No numerical divergence was found in the lookup tables.

Tail/concentration results:

| **Mode** | **Cap contribution to RTP** | **Cap share of RTP** | **Top 1% probability-mass contribution to RTP** | **ETL share ≥40× cost** | **99.9% CVaR, normalized by cost** |
| --- | --- | --- | --- | --- | --- |
| Base | 5.00 pp | 5.189% | 64.303% | 0.5239 | 182.36× |
| Cruise | 2.00 pp | 2.076% | 49.017% | 0.3351 | 111.07× |
| Antelite | 5.00 pp | 5.189% | 75.389% | 0.6654 | 205.74× |
| Bonus | 5.00 pp | 5.189% | 12.978% | 0.0519 | 50.00× |
| Super | 5.00 pp | 5.189% | 9.143% | 0 | 12.50× |

Observations:

- The RTP spread is negligible and comfortably inside the 0.5-point rule.

- Maximum exposure, payout multiplier, cost multiplier, base volatility, CVaR, and ETL gates pass.

- No table contains a payout above 5,000×; the 10,000× tail is zero.

- Under a total-mode-cost interpretation of “5,000×,” Antelite, Bonus, and Super cannot reach 5,000× their entry cost; the raw figures above use the game’s documented base-bet cap convention.

- Antelite is unusually tail-concentrated: the largest 1% of weighted probability mass supplies about 75.39% of its RTP. It passes the liability gate but deserves commercial scrutiny.

- These results validate only the lookup distributions. They do **not** establish that event books generate the stated outcomes because those books were not submitted.

**4. QUALITY ASSESSMENT**

**Art consistency:** Below platform-leading quality. The game has a clear cyberpunk automotive premise and substantial custom work, but it combines cinematic/photographic backgrounds, flat cartoon characters and vehicle art, glossy metallic framing, and symbols with inconsistent rendering styles. The feature frame and gauge are more coherent than the base scene. The tile repeats the same cinematic-versus-flat-hero split. This reads as assembled art direction, not a unified premium production.

**Animation quality:** Serviceable, not exceptional. The committed sequences show staggered symbol movement, gauge/dial transitions, bloom, and conventional win overlays. They communicate state changes, but do not demonstrate the bespoke choreography, layered anticipation, or polished transition work expected beside the platform’s best studios. Several captures begin in dialogs or artificial test states, reducing their usefulness as experience evidence.

**Mobile experience:** The strongest quality area. Portrait and compact landscape proofs keep the grid and main controls usable, with no obvious board overlap or catastrophic clipping. On the short 390×664 portrait proof, however, the buy dialog removes the explanatory “what you get” and RTP/max details shown on the taller Pixel layout. The transaction remains operable, but information quality changes with viewport height. Actual touch feel, keyboard interaction, scrolling, and device performance remain unverified.

**Clarity of player communication:** Mixed and ultimately below approval quality. Mode cards, costs, RTP, maximum win, gauge state, and win banners are generally clear. That is undermined by the omitted 6+ scatter rule, real-money language in social mode, unwired localization, incomplete RG enforcement, and inconsistent bet controls. These are not cosmetic wording issues; they affect what the player is told and what actions the platform permits.

**Technical performance:** A fresh bundle builds to a reasonable size, and committed frame-gate reports are mostly favorable. Against that, the type/static check is red, the live event adapter is incompatible with the project’s own event schema, replay is functionally compromised, and production can route to random mock play following authentication failure. Those are release-integrity defects, not polish deductions.

**5. UNVERIFIABLE WITHOUT PLAY**

- Overall spin feel, responsiveness, anticipation, and feature pacing.

- Whether incremental count-up timing feels correct in context.

- Contextual audio quality, mix balance, fades, loop seams, ducking, mute behaviour, and feature-bed transitions.

- Actual live RGS rendering and settlement against a platform session.

- Full replay animation and audio fidelity.

- Real-device frame rate, memory use, thermal behaviour, and battery impact.

- Touch reliability, accidental activation, focus handling, and modal interaction on physical phones.

- Mini-player/popout behaviour in the actual host shell.

- Browser refresh and network-loss recovery during a feature.

- Active-round resume and end-round reconciliation.

- Runtime localization layout across all advertised languages.

- Screen-reader experience and complete accessible-name wording.

- Event-book feature logic, event ordering, and lookup-to-book payout equality, because the books are absent.

**6. SCORE**

**Score: 0.67 / 3.00 — reject**

The lookup mathematics are unusually clean for a debut submission: all five RTPs reconcile, cap rates are exact, exposure gates pass, and the mobile layout evidence shows competent implementation effort. That cannot outweigh submission-critical failures. The mandatory event books are absent; the live and replay event parsers do not match the project’s own event contract; real authentication failure can route into local random play; and current currency/social, language, bet-level, RG, rules, and recovery requirements are not met. This is not safe to place in front of players or an approval reviewer, and the quality evidence is not strong enough to argue that the problems are isolated packaging mistakes.

**Approval-thread sentence:** Reject and return: the lookup maths passes independently, but the submission lacks all five event books and the frontend is not safe for live RGS, replay, or current social-casino deployment.

**7. PATH TO THREE STARS**

The shortest honest path is:

- Ship all five exact event books and pass complete book-to-lookup/event-schema/statelessness verification.

- Replace the split event readers with one tested canonical adapter used for live play, features, and replay; prove it against decoded book events and RGS fixtures.

- Remove production mock fallback and implement active-round resume plus reliable end-round reconciliation.

- Complete XEC/social terminology, authenticated bet-level, locale, RG, modal-safety, and tier-specific affordability enforcement.

- Correct the 6+ scatter rules and audit every disclosure against the generated maths.

- Reach clean build, type, static-analysis, and end-to-end conformance gates; regenerate all proofs from the exact final commit and add physical-device/audio evidence.

- Give the art, animation, tile, and small-scale provider identity a cohesive premium pass. Compliance repair could move this toward approval; a genuine 3.00 also requires a visible jump in art direction and motion quality.