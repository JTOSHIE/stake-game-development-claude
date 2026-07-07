# FUTURE SPINNER: STAKE ENGINE SUBMISSION DOSSIER v1.0
Studio: We Roll Spinners | July 2026
Sources: live docs captured 2026-07-03 into docs/stake-engine-live/, the Stake
Engine developer manual, and the repository state. This document frames every
artefact required for submission, its status, what produces it, and at which
pass it reaches final form. It supersedes SUBMISSION_CHECKLIST.md.

## 1. WHAT STAKE FORMALLY REQUIRES AT SUBMISSION
From the live approval guidelines: approval is requested for a specific frontend
and maths version; the game must be finalised at submission; the request must be
accompanied by a short blurb describing theme and mechanics for promotional use
and the description tag; review covers functionality, clarity, communication and
technical performance; after approval only minor visual updates are permitted,
with no new modes, maths changes or mechanic changes. Games are automatically
considered for stake.us if the social language rules are met.
From the developer manual: the build uploads via the dashboard; the game tile is
composed in the dashboard Tile Editor (background image, foreground element,
gradient, title); the provider logo is configured once in Team Settings then
Branding and applies to all tiles automatically; the interactive approval
checklist in the docs must be satisfied.

## 2. DOSSIER INVENTORY
| # | Artefact | Produced by | Status | Final at |
|---|----------|-------------|--------|----------|
| 1 | Frontend build (dist, static only) | Pipeline | Regenerates each pass | Build Diet v2 |
| 2 | Maths files: index.json, both lookup tables, both books, game_metadata.json | Overdrive pass | MERGED to main | Done (v1.1.0) |
| 3 | PAR sheet (five modes, FeatureMath v2 documented) | Overdrive pass + FeatureMath v2 | MERGED to main | Done |
| 4 | Submission blurb v2 (Overdrive) | Section 3 below | OWNER APPROVED (soundtrack line amended, pending re-approval) | Owner |
| 5 | Game tile background image | Design system Phase B | To design | AssetForge v2 |
| 6 | Game tile foreground hero (transparent PNG) | Design system Phase B | To design | AssetForge v2 |
| 7 | WRS provider logo (square, transparent, legible small, PNG up to 10 MB) | Design system Phase B | To design | AssetForge v2 |
| 8 | Staged upload bundle with SHA-256 manifest | Pipeline | Rebuilds each change | Pre-submission |
| 9 | Portal facts sheet (RTP 96.35%, max 5,000x, 1,024 ways, features, volatility) | PAR v2 | Available | Done |
| 10 | Compliance evidence pack (section 4) | Audits + re-validation pass | Five-mode re-validated: maths independently VERIFIED + CI-gated (scripts/validate_math.py, MATH_VALIDATION.md); RGS integration verified aligned (docs/RGS_CONTRACT_REFERENCE.md); replay event IDs derived for base/bonus (REPLAY_TEST_EVENTS.md), cruise/antelite/super still owed (see section 6); live docs refreshed 2026-07-04. Remaining items are deploy-dependent only. | Complete pre-deploy (2026-07-04), five-mode replay IDs pending |
| 11 | High resolution asset link (Drive or Dropbox, public) | Owner | Pending | Pre-submission |
| 12 | Trademark position | Owner | Knockout search clear | Done for submission |
| 13 | Team profile, branding upload, payment details in portal | Owner, one-time | Confirm on next portal login | Pre-submission |

## 3. SUBMISSION BLURB v2 (Overdrive), OWNER APPROVED (soundtrack line amended, pending re-approval)

    Plug in. Power up. Future Spinner drops you into a neon soaked cyberpunk
    megacity where chrome rims and holographic gauges blaze across a 5x4 grid
    with 1,024 Ways to Win.

    Land three, four or five Energy Burst Scatters to bank an instant award of
    up to 10x total bet and ignite OVERDRIVE FREE SPINS: 8, 12 or 16 spins where
    every winning spin pushes the Overdrive meter one gear higher, adding +1x to
    a multiplier that never resets. Three or more scatters during the bonus add
    5 more spins. Prefer the fast lane? The Bonus Buy takes you straight to the
    feature for 100x.

    With a 96.35% RTP, wins up to 5,000x your bet and turbo mode, Future Spinner
    is built for players who live on the edge of the grid.

## 4. COMPLIANCE EVIDENCE MAP
Verified and holding (evidence in audit/ and PR #1): stateless per platform
definition (the free spins resolve inside one book round; no jackpot, gamble,
continuation, early cashout, cross-round state); seven point disclaimer, rules
and full paytable always reachable; RTP and max win displayed; paytable matches
the validated maths exactly; spacebar spin; autoplay confirmation, no one-click
consecutive bets; working sound disable; incremental win count-up; sixteen
locales; social mode clean including first paint; static build, no external
origins, no Stake branding, original IP; Bet Replay implemented for base rounds;
responsive verified at all six required viewports.
New obligations created by Overdrive (owned by Stage 2 unless noted): buy-tier
UI must carry social overrides for every string (the live prohibited terms table
bans buy, bonus buy, purchase, bought, cost of, at the cost of on stake.us, with
replacements such as get bonus, play, instantly triggered, can be played for);
the RGS jurisdiction flag disabledBuyFeature must fully hide both buy tiers;
replay must play back a complete free spins round and, for a buy-tier round,
display the amount spent including the cost multiplier; all five modes must
appear in the paytable and rules, localised across all sixteen locales; the
0.5% mode RTP rule is satisfied by design, all five modes at 96.3500%,
evidenced in the PAR sheet's five-mode declaration (section 10) and
independently re-verified 2026-07-07 (see the mode table below).

**FIVE-MODE TABLE** (FeatureMath v2, shipped 2026-07-07, all independently
re-verified from the shipped lookup tables via `scripts/validate_math.py`):

| Mode | Cost | RTP | Notes |
|---|---|---|---|
| Normal | 1.0x | 96.35% | Standard play. |
| Cruise | 1.0x | 96.35% | Low-volatility standing mode, same cost and RTP as Normal. |
| OVERBOOST | 1.25x | 96.35% | Ante-style toggle - **debits 1.25x every spin while ON**, not a one-shot buy. About 1.6x the feature trigger rate. |
| Buy Overdrive | 100x | 96.35% | One-shot buy, guaranteed Overdrive Free Spins entry. |
| NITRO OVERDRIVE | 400x | 96.35% | One-shot buy, guaranteed entry with the Overdrive meter **pre-revved to 5x** at the feature's first free spin. |

All five: 5,000x hard win cap, stateless (resolves inside one book round), 4^5
= 1,024 ways, 5x4 grid. Cross-mode RTP spread 0.0000pp (satisfies the 0.5%
rule with large margin).

Independent verification (2026-07-07, re-run fresh for this dossier update):
the maths is recomputed from the shipped lookup tables by
`scripts/validate_math.py` (CI-gated) - all five modes 96.350000%, cross-mode
variation 0.0000%, base hit 29.11% (SD 17.28x), cruise SD 11.29x, antelite
(OVERBOOST) SD 20.32x, bonus SD 206.63x, super (NITRO OVERDRIVE) SD 539.16x,
max 5,000x every mode, wincap base 1-in-100k / cruise 1-in-250k / antelite
1-in-80k / bonus 1-in-1k / super 1-in-250, all Stake checks pass
(MATH_VALIDATION.md). The RGS wire contract is documented and our client
verified aligned in docs/RGS_CONTRACT_REFERENCE.md. Community tooling assessed
in docs/TOOLING_REVIEW.md.

**Responsible play** (frontend, non-locked): autoplay can stop automatically
on any win, on Overdrive triggering, or once a player-set loss limit is
reached, and can always be stopped manually; a session summary (time, spins,
net) is available from the menu. Implemented in
`frontend/src/lib/stores/responsibleGambling.ts`, jurisdiction-flag-driven and
off by default; player-facing copy lives in the in-game paytable's
"Responsible Play" section.

**No soundtrack claim**: the submission blurb (section 3) and all in-game copy
remain free of any soundtrack/music claim until audio actually ships (audio
delivery is still the one open creative item, tracked in
`docs/CHAT_CLOSEOUT_2026-07-06.md` section 3).

## 5. POST-UPLOAD VERIFICATION PROTOCOL (before requesting review)
1. Dashboard Developer Testing Tool: matrix of currencies, languages including
   social mode, and device modes against the deployed build.
2. Browser network verification of authenticate, play and end-round on the
   deployed game, plus audit/rgs_endpoint_test.py with a portal session.
3. Replay URL tests: a base win round, a free spins round, and a bonus buy round
   (cost display check), each in normal and social mode.
4. Tile check: the composed tile passes the thumbnail guidelines in the editor.
5. Only then request review, with the blurb, for the exact uploaded versions.

## 6. DOCUMENTATION GAPS TO CLOSE
Headless capture of the interactive approval checklist items at
https://stake-engine.com/docs/approval/checklist plus the full game tile
guidelines at https://stake-engine.com/docs/approval/game-tile plus any other
pages under /docs/approval/, added to the standing docs refresh set. On the
owner's next portal login: confirm team profile and payment details, and
screenshot the submission form fields so this dossier can record any field not
yet covered.

**REVIEW_EVENTS pass (ratified by Fable, still owed, queued next after this
copy update):** commit the statelessness artefact (a scan script plus its
output summary, under `reports/qa/`) proving cruise/antelite/super are
stateless from the actual shipped books, and the per-mode Bet Replay event IDs
for cruise/antelite/super (base/bonus already have theirs in
`REPLAY_TEST_EVENTS.md`).

## 7. WHERE EACH ARTEFACT FINALISES
Overdrive merge: maths files, PAR v2, facts sheet (done). FeatureMath v2: three
more modes shipped into the locked package (done, 2026-07-07). Stage 2
frontend: buy-tier UI with social overrides, jurisdiction flag, buy-tier
replay, rules and paytable for all five modes (rules/paytable done; per-mode
replay IDs for cruise/antelite/super still owed, see section 6).
AssetForge v2: all art including tile background, tile hero and provider
logo. Motion Polish v2: final presentation. Build Diet v2: final dist
and bundle. Compliance re-validation: evidence pack refreshed against the final
build. Then section 5, then submit.
