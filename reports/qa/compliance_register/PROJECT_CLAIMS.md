# PROJECT CLAIMS, to be TESTED not trusted

179 rows enumerated from the project's own `COMPLIANCE_WATCH.md` (68) and
`SUBMISSION_DOSSIER.md` (111). **These are not requirements.** They are what the project
asserts about its own compliance, and JOB 1b tests them against the register at
`REGISTER.md` and against the tree at HEAD.

Kept separate deliberately. A first marshal tried to fuse these into the platform register by
text similarity and returned zero cross-shard fusions, which is implausible given that these
documents restate platform requirements by construction. The token overlap could not carry it
because a project document paraphrases in its own vocabulary. Fusing them would have let the
project's own assertion that it complies become evidence that it complies.

| id | shard | obligation | vis | source | claim |
|---|---|---|---|---|---|
| R7-01 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:12-13` | The whole feature must resolve within a single book round so no round state persists between requests. |
| R7-02 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:13-15` | Ship no jackpot, gamble, continuation or early-cashout mechanic; free spins and feature buys are the only permitted extras. |
| R7-03 | compliance-watch-posture | MATHS | YES | `COMPLIANCE_WATCH.md:17-18` | Every one of the five modes must be stateless, hard-capped at 5,000x max win, and return 96.3500% RTP. |
| R7-04 | compliance-watch-posture | ARTEFACT | NO | `COMPLIANCE_WATCH.md:19-20` | Every shipped asset must be original, in-house from vector masters, with no pre-purchased or licensed content. |
| R7-05 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:21` | No Stake trademark, name or theme may appear in any shipped asset or string. |
| R7-06 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:22` | No child or child-like character may appear anywhere in the game. |
| R7-07 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:23-24` | The build must carry a social mode that swaps prohibited gambling vocabulary when the session is social. |
| R7-08 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:25-26` | When the RGS jurisdiction flag `disabledBuyFeature` is set, the buy-feature entry point must not be rendered. |
| R7-09 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:29-30` | A replay of a bought round must show the real amount staked, cost multiplier included, not the base bet. |
| R7-10 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:34-35` | Run authenticate, play and end-round through the portal Developer Testing Tool against staging after upload and before requesting review. |
| R7-11 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:57-58` | The frontend must take its bet ladder and min, max and step from the authenticate response rather than from local constants. |
| R7-12 | compliance-watch-posture | PROCESS | YES | `COMPLIANCE_WATCH.md:59-61` | Supply tile BG plus transparent FG under 3MB combined, plus a transparent provider logo legible small, named to the platform pattern. |
| R7-13 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:62-63` | UNRESOLVED: the authoritative submission criteria list has never been read, because it sits behind portal auth; it must be captured on the owner's next login before submission can claim checklist coverage. |
| R7-14 | compliance-watch-posture | PROCESS | UNKNOWN | `COMPLIANCE_WATCH.md:81` | A short promotional blurb must be supplied with the submission package. |
| R7-15 | compliance-watch-posture | STUDIO | NO | `COMPLIANCE_WATCH.md:82-83` | After approval the studio may ship only minor visual updates; any maths or new-mode change is out of scope for the approved version. |
| R7-16 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:84-86` | Replace every prohibited gambling term for stake.us with the platform's suggested social wording, ideally in a `sweeps_<lang>` locale file. |
| R7-17 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:87-88` | The submission must clear more than 1 star or it is returned unpublished for resubmission. |
| R7-18 | compliance-watch-posture | MATHS | YES | `COMPLIANCE_WATCH.md:89-90` | The package must carry bonus modes and additional mechanics, not a bare base game, to avoid a low star rating. |
| R7-19 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:91` | Shipped art must not read as generic AI-generated output; provenance and craft must be evident. |
| R7-20 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:96-98` | Bet Replay must work for any event ID without a player session, since the reviewer will hand over a range of IDs to replay. |
| R7-21 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:98` | Capture a set of staging event IDs covering the scenarios a reviewer would ask for, before requesting review. |
| R7-22 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:99-101` | UNRESOLVED: there is no readable platform changelog, so the project cannot prove it is current with platform changes; each docs refresh must re-check for a changelog page. Restated at l.70-71, where `/docs/updates` renders only 88 chars and is called a known gap to re-check manually. |
| R7-23 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:129-130` | The hide-on-flag and the replay cost display must cover both buy tiers at their real costs, 100x and 400x, not just the first one. |
| R7-24 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:141` | Where a jurisdiction sets a minimum spin duration, fast-play must be disabled and the floor must win over any speed tier. |
| R7-25 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:150-152` | Autoplay may start only after two deliberate player actions, and never from mount, restored state or a URL parameter. |
| R7-26 | compliance-watch-posture | ARTEFACT | NO | `COMPLIANCE_WATCH.md:154-156` | Round reconstruction must be deterministic, with no clock or random source in the interpreter, so a replay is bit-identical. |
| R7-27 | compliance-watch-posture | ARTEFACT | NO | `COMPLIANCE_WATCH.md:157` | The shipped bundle must make no external network call other than the RGS and replay endpoints; telemetry stays a no-op by default. |
| R7-28 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:166-167` | The live bet ladder must come from the authenticate response, with the static array reachable only in dev, mock or auth-failure mode. |
| R7-29 | compliance-watch-posture | PROCESS | YES | `COMPLIANCE_WATCH.md:173-176` | UNRESOLVED as recorded in this file: the credit leg of a round has no retry, so a transient disconnect after a successful play can leave the player unpaid; l.197-200 parks it as a future hardening pass rather than a fix. See duplicates_noted, the record may be stale. |
| R7-30 | compliance-watch-posture | PROCESS | YES | `COMPLIANCE_WATCH.md:189-192 "**Resume-after-refresh / replay:** **gap confirmed, not new but re-verified today** - repo-wide grep for `resume\ reconnect\ onLine\` | UNRESOLVED as recorded: there is no mid-round recovery path, and the parsed `AuthResponse.round?: ActiveRound` field is never consumed (l.177-179), so a refresh mid-round silently abandons it. Parked at l.197-200 as low risk under the stateless design. |
| R7-31 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:211` | The bet-level constraints below are machine-applied to the upload, so the package must satisfy them before any human review happens. |
| R7-32 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:220 "Maximum Exposure \ $10,000,000 \` | Keep maximum exposure at or under $50,000,000 for a 3-star tier, $10,000,000 for 2-star. |
| R7-33 | compliance-watch-posture | MATHS | YES | `COMPLIANCE_WATCH.md:221 "Maximum Payout Multiplier \ 25,000x \` | Keep the maximum payout multiplier at or under 100,000x for 3-star, 25,000x for 2-star. |
| R7-34 | compliance-watch-posture | MATHS | YES | `COMPLIANCE_WATCH.md:222 "Maximum Bet Cost \ $100,000 \` | Keep the maximum cost of any single bet at or under $500,000 for 3-star, $100,000 for 2-star. |
| R7-35 | compliance-watch-posture | MATHS | YES | `COMPLIANCE_WATCH.md:223 "Maximum Cost Multiplier \ 1,000x \` | Keep the highest bet-mode cost multiplier at or under 1,500x for 3-star, 1,000x for 2-star. |
| R7-36 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:224-225 "Minimum Base (1.0x cost) Standard Deviation \ 0.6 \ 0.6 Maximum Base (1.0x cost) Standard Deviation \ 50.0 \` | Base-mode standard deviation must sit between 0.6 and 60.0 for 3-star, 0.6 and 50.0 for 2-star. |
| R7-37 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:226-227 "P(>=5000) \ 1e-2 \ 1e-2 P(>=10000) \ 8e-2 \` | Cumulative probability of a win at or above 5,000x must not exceed 1e-2, and at or above 10,000x must not exceed 2e-2 at 3-star. See duplicates_noted: the ACP screen at l.589 states different figures. |
| R7-38 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:228 "Risk Limits (CVaR) \ 700 \` | Keep CVaR at or under 800 for 3-star, 700 for 2-star. |
| R7-39 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:229-230 "Liability (ETL, >40x Bet) \ 0.8 \ 0.9 Liability (ETL, P(>10000)) \ 0.6 \` | Expected tail liability must stay at or under 0.9 against the 40x-bet threshold and 0.8 against the P(>10000) threshold at 3-star. |
| R7-40 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:232-233` | The client must never submit a bet above $500,000 USD; the RGS rejects it with HTTP 400. |
| R7-41 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:238-239` | The tail-probability gates are judged on whichever mode is worst, so every mode must pass, not just base. |
| R7-42 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:242-243` | Compare tail probabilities after the platform's cost-multiplier scaling (0.8 in the 200 to 500 band, 1.0 below 200), not the raw measurement. |
| R7-43 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:259-263` | Compute CVaR as the expected payout in the worst 0.1% of outcomes, in both normalised and un-normalised form. |
| R7-44 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:265-266` | Compute ETL as the share of RTP delivered by wins at or above 40x the cost multiplier, or above 10,000x where 40x does not apply. |
| R7-45 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:281-284` | UNRESOLVED: the CVaR definition is ambiguous on three axes and none is answerable from published docs; the project reports both quantiles (l.295-297) rather than choosing one. Marked RESOLVED IN PRACTICE at l.546-548, not closed as a definition. |
| R7-46 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:286-292` | Read and screenshot the ACP Math Distribution and Summary screen after upload and before requesting review, and correct our figures to the platform's where they disagree. |
| R7-47 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:301-303` | Keep every events file under 4.2GB and every mode under 10,000,000 events, or publication fails. Restated first-party at l.421 as "modes must not exceed 10 million outcomes." |
| R7-48 | compliance-watch-posture | MATHS | YES | `COMPLIANCE_WATCH.md:305-306` | Cross-mode RTP spread must stay within the 0.5% allowance; all modes must report effectively the same RTP. |
| R7-49 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:306-307` | Take limits only from the live docs or the dated mirror; the public GitHub repo is stale and is barred as a source. |
| R7-50 | compliance-watch-posture | PROCESS | YES | `COMPLIANCE_WATCH.md:333-337` | UNRESOLVED: whether to raise the per-mode event count above 100,000 is an open owner decision, because the FAIR catalogue publishes the figure and rivals run 1,000,000 to 10,000,000. |
| R7-51 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:335` | Each mode must contain at least 100,000 events. |
| R7-52 | compliance-watch-posture | MATHS | NO | `COMPLIANCE_WATCH.md:348-349` | Treat the uploaded weight and payout tables as frozen for the life of a version; any change needs a new version. |
| R7-53 | compliance-watch-posture | ARTEFACT | UNKNOWN | `COMPLIANCE_WATCH.md:388-389` | The build must support the XEC currency or it cannot be released on Stake EU. |
| R7-54 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:396-397` | The string "XEC" must never reach a player-facing surface, including any formatted balance. |
| R7-55 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:400` | An EU or XEC session must present social vocabulary, with the social currency set as defence in depth if the flag is absent. |
| R7-56 | compliance-watch-posture | PROCESS | YES | `COMPLIANCE_WATCH.md:409-413` | UNRESOLVED, NEEDS A RULING: two first-party sources disagree on SC symbol placement, leading versus trailing, and it affects the XSC balance already shipping as well as XEC. Also recorded at l.308-313, where the same contradiction is called unresolved. |
| R7-57 | compliance-watch-posture | MATHS | YES | `COMPLIANCE_WATCH.md:429-430` | Every mode's RTP must fall inside 90.0% to 96.70%; the band binds new submissions only. Also recorded at l.49-50 as "RTP band is 90.0%-96.70%, NOT up to 98%". |
| R7-58 | compliance-watch-posture | STUDIO | NO | `COMPLIANCE_WATCH.md:451-452` | The studio must choose between the two published revenue models, 10% of actual GGR with carry-forward debt or 7.5% of expected GGR; no code or maths obligation follows. |
| R7-59 | compliance-watch-posture | STUDIO | NO | `COMPLIANCE_WATCH.md:458-459` | Pre-release lookup tables and books must not be uploaded to any third-party or community-run service. |
| R7-60 | compliance-watch-posture | STUDIO | NO | `COMPLIANCE_WATCH.md:464-465` | Community tooling may only be used self-hosted on our own machines, never its hosted cloud or share links. |
| R7-61 | compliance-watch-posture | PROCESS | UNKNOWN | `COMPLIANCE_WATCH.md:467-468` | UNRESOLVED: three empirical questions remain open, including TR-035b open-round semantics, which is recorded nowhere else in this file with a resolution path. |
| R7-62 | compliance-watch-posture | STUDIO | NO | `COMPLIANCE_WATCH.md:470-471` | Any backup of pre-release internals must be created private and the sharing setting checked at creation time. Reinforced at l.377-379: further backups are for owner disaster recovery only and "should not be publicly shared". |
| R7-63 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:483-484` | Per-spin cost, RTP and max win must all be displayed to the player; this is the accepted mitigation for the antelite tail concentration. |
| R7-64 | compliance-watch-posture | ARTEFACT | YES | `COMPLIANCE_WATCH.md:524-525` | Every player-money readout, replay included, must be formatted with thousands separators and the currency symbol, never raw `.toFixed(2)`. |
| R7-65 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:525-526` | UNRESOLVED: the SA-022 money-format fix has not been re-captured live, so the replay surface is not yet evidenced as compliant. |
| R7-66 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:546-548` | UNRESOLVED as a definition: the CVaR quantile question stays open and the project relies on the platform's own displayed figure at the pre-review gate instead. |
| R7-67 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:552-564` | UNRESOLVED: the published table says $10,000,000 and the ACP screen read live says 15,000,000.0 for the 2-star exposure limit; parked for an owner and Fable ruling rather than silently corrected. |
| R7-68 | compliance-watch-posture | PROCESS | NO | `COMPLIANCE_WATCH.md:589 "Tail Probability (10,000x) \ 0 \ 0.002 \` | UNRESOLVED and, unlike the exposure disagreement, not flagged by the document: the ACP screen states 2-star 0.002 and 3-star 0.005 for the 10,000x tail probability, against 8e-2 and 2e-2 in the published table at l.227. Needs the same parked-with-options treatment. |
| R8-01 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:9-10` | Name the exact frontend build and maths version in the approval request rather than requesting approval of the game generically. |
| R8-02 | submission-dossier | ARTEFACT | UNKNOWN | `SUBMISSION_DOSSIER.md:10` | Ship a finished game, not a build expected to change during review. |
| R8-03 | submission-dossier | STUDIO | YES | `SUBMISSION_DOSSIER.md:10-12` | Supply promotional blurb copy covering theme and mechanics, plus the description tag, with the request. |
| R8-04 | submission-dossier | ARTEFACT | UNKNOWN | `SUBMISSION_DOSSIER.md:12-13` | Be defensible on all four review axes, since review is not limited to maths. |
| R8-05 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:13-14` | Freeze modes, maths and mechanics at approval; post-approval changes are limited to minor visual work. |
| R8-06 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:14-15` | Satisfy the social language rules if stake.us consideration is wanted. |
| R8-07 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:16` | Deliver the build through the developer dashboard upload, not by any other channel. |
| R8-08 | submission-dossier | PROCESS | YES | `SUBMISSION_DOSSIER.md:16-18` | Compose the tile in the dashboard Tile Editor from a background image, a foreground element, a gradient and a title. |
| R8-09 | submission-dossier | PROCESS | YES | `SUBMISSION_DOSSIER.md:18-19` | Upload the provider logo once under Team Settings then Branding; do not re-upload per game. |
| R8-10 | submission-dossier | PROCESS | UNKNOWN | `SUBMISSION_DOSSIER.md:19-20` | Work the platform's interactive approval checklist to completion before requesting review. |
| R8-11 | submission-dossier | ARTEFACT | NO | `SUBMISSION_DOSSIER.md:25` | Submit a static-only frontend bundle as a required submission artefact. |
| R8-12 | submission-dossier | MATHS | NO | `SUBMISSION_DOSSIER.md:26` | Submit index.json, the lookup tables, the books and game_metadata.json as the maths package. Note the cell says "both", a two-mode figure the same document later restates as five modes and twelve files (see R8-55). |
| R8-13 | submission-dossier | MATHS | NO | `SUBMISSION_DOSSIER.md:27` | Produce a PAR sheet documenting all five modes. |
| R8-14 | submission-dossier | STUDIO | YES | `SUBMISSION_DOSSIER.md:28` | Have owner-approved blurb text ready as a submission artefact. |
| R8-15 | submission-dossier | STUDIO | YES | `SUBMISSION_DOSSIER.md:29` | Deliver a tile background image and have the owner upload it in the Tile Editor. |
| R8-16 | submission-dossier | STUDIO | YES | `SUBMISSION_DOSSIER.md:30` | Deliver a transparent-PNG foreground hero for the tile. |
| R8-17 | submission-dossier | STUDIO | YES | `SUBMISSION_DOSSIER.md:31` | Deliver a square transparent PNG provider logo, legible at small size, at most 10 MB, uploaded once in Team Settings Branding. |
| R8-18 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:32` | Assemble the staged upload bundle with a SHA-256 manifest before submission. |
| R8-19 | submission-dossier | STUDIO | NO | `SUBMISSION_DOSSIER.md:33` | Provide the portal facts sheet carrying RTP, max win, ways, features and volatility. |
| R8-20 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:34` | Assemble the section 4 compliance evidence pack, complete pre-deploy. |
| R8-21 | submission-dossier | STUDIO | NO | `SUBMISSION_DOSSIER.md:35` | Publish a public high-resolution asset link (Drive or Dropbox) for the submission. |
| R8-22 | submission-dossier | STUDIO | NO | `SUBMISSION_DOSSIER.md:36` | Hold a cleared knockout trademark search for the title. Restated as a one-time portal-adjacent action at 5d, line 338. |
| R8-23 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:37` | Confirm team profile, branding upload and payment details in the portal once, pre-submission. |
| R8-24 | submission-dossier | STUDIO | YES | `SUBMISSION_DOSSIER.md:132-133` | Keep the draft soundtrack sentence out of any submitted blurb until explicit owner sign-off. |
| R8-25 | submission-dossier | STUDIO | YES | `SUBMISSION_DOSSIER.md:483-484` | Make every promotional claim conditional on the artefact backing it already shipping. |
| R8-26 | submission-dossier | MATHS | NO | `SUBMISSION_DOSSIER.md:71-73` | Keep every feature resolving inside one book round, with no jackpot, gamble, continuation, early cashout or cross-round state. |
| R8-27 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:73-74` | Make the seven-point disclaimer, the rules and the full paytable reachable from every game state. |
| R8-28 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:74` | Display RTP and max win to the player. |
| R8-29 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:74-75` | Make every paytable figure equal the validated maths, exactly. |
| R8-30 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:75` | Support spinning with the spacebar. |
| R8-31 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:75-76` | Gate autoplay behind a confirmation and prevent one-click consecutive betting. |
| R8-32 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:76` | Provide a sound disable control that actually silences the game. |
| R8-33 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:76` | Present wins as an incremental count-up rather than an instant jump. |
| R8-34 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:76-77` | Ship sixteen locales. |
| R8-35 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:77` | Keep social mode free of prohibited real-money language, including on the very first frame painted. |
| R8-36 | submission-dossier | ARTEFACT | NO | `SUBMISSION_DOSSIER.md:77-78` | Ship a static build that requests no external origin, carries no Stake branding, and uses original IP only. |
| R8-37 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:78` | Implement Bet Replay for base rounds. |
| R8-38 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:79` | Verify responsive layout at all six required viewports. |
| R8-39 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:80-83` | Give every buy-tier string a social override; the banned terms are buy, bonus buy, purchase, bought, cost of, at the cost of, with replacements such as get bonus, play, instantly triggered, can be played for. |
| R8-40 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:84` | When disabledBuyFeature is set, hide both buy tiers completely rather than disabling them. |
| R8-41 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:85-86` | Replay a full free spins round, and on a buy-tier round show the amount spent with the cost multiplier applied. |
| R8-42 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:86-87` | Document all five modes in the paytable and rules, localised in all sixteen locales. |
| R8-43 | submission-dossier | MATHS | NO | `SUBMISSION_DOSSIER.md:88` | Keep every mode's RTP within the 0.5 per cent cross-mode band. |
| R8-44 | submission-dossier | MATHS | YES | `SUBMISSION_DOSSIER.md:103-104` | Apply the 5,000x hard cap, statelessness, 1,024 ways and the 5x4 grid to all five modes. Restated as a platform limit at line 528. |
| R8-45 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:118-121` | Provide the responsible-play controls: autoplay stop conditions, a manual stop, a player-set loss limit, and a session summary of time, spins and net. |
| R8-46 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:135` | Run DTT_PROTOCOL.md's ten scripted observations as part of the staging sequence, in the order 5b, DTT_PROTOCOL.md, 5e (lines 138 to 139). |
| R8-47 | submission-dossier | ARTEFACT | NO | `SUBMISSION_DOSSIER.md:149-150` | Upload frontend/dist as a self-contained static bundle with no server-side component. |
| R8-48 | submission-dossier | ARTEFACT | NO | `SUBMISSION_DOSSIER.md:182-183` | Keep the shipped bundle under 25MB and free of documentation files. |
| R8-49 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:199-200` | Build the uploaded bundle from a fresh clone so the artefact is reproducible by definition. |
| R8-50 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:203-204` | Rebuild dist immediately before staging; never upload a stale or hand-edited dist. Restated per-update at line 341. |
| R8-51 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:208-209` | Submit against the future-spinner entry, the sole entry since the owner deleted -2 and cleared prior uploads (2026-08-11, R051). |
| R8-52 | submission-dossier | STUDIO | YES | `SUBMISSION_DOSSIER.md:211-212` | Delete the superseded future-spinner entry once the platform cooldown allows, so two entries do not exist for one game. |
| R8-53 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:231-233` | Have team profile, branding and payment details already confirmed before opening the entry to upload. |
| R8-54 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:234-235` | Upload the entire contents of dist for the exact commit being submitted. |
| R8-55 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:236-239` | Upload twelve maths files in the stated order: index.json first, then five books and five lookup tables, then game_metadata.json. The dossier records at lines 275 to 279 that index.json itself declares ten files and that the earlier count of eleven was wrong. |
| R8-56 | submission-dossier | PROCESS | YES | `SUBMISSION_DOSSIER.md:240-246` | Compose the tile from the three delivered assets, uploading the provider logo separately and once in Team Settings Branding. |
| R8-57 | submission-dossier | PROCESS | YES | `SUBMISSION_DOSSIER.md:247-248` | Enter the blurb without the soundtrack sentence unless the owner has explicitly approved that sentence. |
| R8-58 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:249` | Do not press review at upload time; run the post-upload verification protocol first. |
| R8-59 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:263-264` | Keep the five books out of the repository while still uploading them to the ACP. |
| R8-60 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:271-273` | Maintain BOOKS_MANIFEST.md with per-book SHA-256, byte size, row count and provenance so the uncommitted books stay verifiable. |
| R8-61 | submission-dossier | PROCESS | YES | `SUBMISSION_DOSSIER.md:335-336` | Configure team profile and branding once in Team Settings and never re-upload the logo per game. |
| R8-62 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:337` | Confirm payment details in the portal as a one-time action. |
| R8-63 | submission-dossier | MATHS | NO | `SUBMISSION_DOSSIER.md:342` | Re-verify the books_super hash on any maths package change. |
| R8-64 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:343` | Re-upload both bundles together for the exact new commit, never one alone. |
| R8-65 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:344-345` | Re-run 5e against the newly deployed build each time, never reusing a prior pass. |
| R8-66 | submission-dossier | STUDIO | YES | `SUBMISSION_DOSSIER.md:346-347` | Reconcile the entered blurb against the currently approved text at each submission. |
| R8-67 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:348` | Request review only after every per-update item is complete. |
| R8-68 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:351-352` | Run a currency by language by device matrix, social mode included, against the deployed build in the Developer Testing Tool. |
| R8-69 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:353-354` | Verify authenticate, play and end-round on the wire against the deployed game, and run the endpoint test with a portal session. |
| R8-70 | submission-dossier | PROCESS | YES | `SUBMISSION_DOSSIER.md:355-356` | Replay three round types, each in both normal and social mode, checking the cost display on the buy round. |
| R8-71 | submission-dossier | PROCESS | YES | `SUBMISSION_DOSSIER.md:357` | Confirm the composed tile passes the editor's thumbnail guidelines. |
| R8-72 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:359-360` | Treat the docs delta sweep as a hard gate within 24 hours of the request, halting and escalating on any rule change. |
| R8-73 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:361` | Submit the review request against the exact uploaded frontend and maths versions, with the blurb. |
| R8-74 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:365-366` | Complete the ACP Math Distribution and Summary capture, and commit its evidence, before requesting review. 5e step 5 (line 358) states the same as a hard gate. |
| R8-75 | submission-dossier | MATHS | NO | `SUBMISSION_DOSSIER.md:369-372` | Sit inside every automated bet-level limit the platform applies; the dossier states the published definitions are not complete enough to reproduce offline, so the platform's displayed figures are the only definitive ones. |
| R8-76 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:384-385` | Capture the full ACP maths screen including every statistic and limit result, and commit it to the named dated directory. Section 9a consequence 1 (lines 657 to 660) records that this directory does not exist and the evidence sits elsewhere. |
| R8-77 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:386-388` | Transcribe the platform's displayed values and reconcile them line by line against our own computed table. |
| R8-78 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:389-390` | Record the operative CVaR definition once observed and close the open question in COMPLIANCE_WATCH.md. |
| R8-79 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:391-392` | Treat the platform's figures as definitive on disagreement, correct ours, and note the correction. |
| R8-80 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:393-394` | Stop and escalate rather than requesting review if any displayed value is outside its limit. |
| R8-81 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:401` | Run the docs delta sweep inside the 24 hours before the review request. |
| R8-82 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:413-414` | Re-fetch all ten approval-guidelines pages listed at lines 415 to 424 plus /docs/payments, rendered rather than plain-fetched. |
| R8-83 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:426-427` | Write each sweep to a new dated mirror directory with a per-page SHA-256 manifest. |
| R8-84 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:428-429` | Diff the new capture against the previous mirror by hash, then read every page whose hash moved. |
| R8-85 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:430-431` | Log every sweep result, clean or not, so the gate's own execution is evidenced. |
| R8-86 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:432-434` | Halt on any change to a limit, threshold, prohibited term, required behaviour or file-format constraint, and wait for a ruling. |
| R8-87 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:436-437` | Source the sweep from the deployed site only, never the public docs repository. |
| R8-88 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:444-447` | Add the approval checklist and game tile guideline pages to the standing docs refresh set. Section 9e (line 780) records both URLs as wrong and erroring, so the requirement's target is UNKNOWN at HEAD. |
| R8-89 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:447-450` | Screenshot the submission form fields at the next portal login so any uncovered field is recorded. |
| R8-90 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:468-469` | Refresh the compliance evidence pack against the final build before running section 5 and submitting. |
| R8-91 | submission-dossier | MATHS | NO | `SUBMISSION_DOSSIER.md:488-489` | Prove book-to-lookup equality for every row of every mode rather than asserting it. |
| R8-92 | submission-dossier | MATHS | NO | `SUBMISSION_DOSSIER.md:526 "RTP band, new submissions \ 90.0% to 96.70% \` | Keep RTP inside 90.0% to 96.70% for a new submission. The dossier states at lines 530 to 534 that this band comes from a first-party announcement of 2026-07-25 and was not yet on the published approval-guidelines page. |
| R8-93 | submission-dossier | MATHS | NO | `SUBMISSION_DOSSIER.md:527 "Outcomes per mode \ max 10,000,000 \` | Keep each mode at or under 10,000,000 outcomes. |
| R8-94 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:537-538` | Support XEC; a game without it is not released on the platform. The inner sentence is the platform's own wording as the dossier quotes it. |
| R8-95 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:542-544` | Render currency symbol, placement and decimals from the platform's CurrencyDisplay payload rather than hardcoding them. |
| R8-96 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:553` | Never display a raw virtual currency code to a player. |
| R8-97 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:557-559` | Settle an open or pending_end round found at authenticate through the platform's endRound, rather than abandoning it. Section 9e (line 775) re-rules this as RESUME AND SETTLE with no forfeit path. |
| R8-98 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:566-567` | Never credit a round twice across repeated reloads; failure here is a submission blocker. |
| R8-99 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:573-574` | Drive anticipation only from scatters visibly landed and whether reels are still moving; never anticipate an outcome the player cannot yet see. |
| R8-100 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:587-589` | Enable betting only on positive evidence of a live session, gate every bet route, show a translated non-dismissible banner when blocked, and ship no mock marker in production. |
| R8-101 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:594-596` | Run an official on-platform Developer Testing Tool session before submission, carrying the 5f maths screen read. Section 9e (line 776) narrows the open questions to XEC live behaviour and the currency display metadata. |
| R8-102 | submission-dossier | STUDIO | NO | `SUBMISSION_DOSSIER.md:598-601` | Never hand the frozen tables or books to a third party pre-release; self-hosting the community tool is permitted. |
| R8-103 | submission-dossier | STUDIO | NO | `SUBMISSION_DOSSIER.md:618-620` | Allow externally commissioned scene and marketing art only with recorded provenance; symbols are always in-house and unrequested external design is prohibited. |
| R8-104 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:640` | Ship a working Bet Replay: it is mandatory for approval, and a broken one blocks submission. Stronger restatement of R8-37 and R8-41. |
| R8-105 | submission-dossier | MATHS | NO | `SUBMISSION_DOSSIER.md:645-647` | Pass every ACP maths constraint at both star tiers, read from the live screen. |
| R8-106 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:665-669` | Resolve the 2-star Maximum Exposure disagreement with the owner and Fable rather than silently picking a figure; the platform's screen governs per R8-79. |
| R8-107 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:709-710` | Handle all money as integer micros at a scale of 1,000,000, in both directions on the wire. |
| R8-108 | submission-dossier | ARTEFACT | YES | `SUBMISSION_DOSSIER.md:722` | Ship the tile at 408x546 portrait to match the observed published geometry. The platform's own required figure is UNKNOWN: the dossier states plainly that no number is published. |
| R8-109 | submission-dossier | STUDIO | NO | `SUBMISSION_DOSSIER.md:727-729` | Record source path, source hash, shipped hash, dimensions, the supplier's claim and the measurement for every adopted external asset. |
| R8-110 | submission-dossier | MATHS | YES | `SUBMISSION_DOSSIER.md:760-761` | Measure the 5,000x cap against the bet level, matching the platform's own convention, not against actual spend. |
| R8-111 | submission-dossier | PROCESS | NO | `SUBMISSION_DOSSIER.md:767-768` | Get an owner ruling on whether the cost-display convention is raised with the platform before submission. |
