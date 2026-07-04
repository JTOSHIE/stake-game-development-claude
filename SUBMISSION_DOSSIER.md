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
| 3 | PAR sheet v2 (two modes, Overdrive documented) | Overdrive pass | MERGED to main | Done |
| 4 | Submission blurb v2 (Overdrive) | Section 3 below | OWNER APPROVED (soundtrack line amended, pending re-approval) | Owner |
| 5 | Game tile background image | Design system Phase B | To design | AssetForge v2 |
| 6 | Game tile foreground hero (transparent PNG) | Design system Phase B | To design | AssetForge v2 |
| 7 | WRS provider logo (square, transparent, legible small, PNG up to 10 MB) | Design system Phase B | To design | AssetForge v2 |
| 8 | Staged upload bundle with SHA-256 manifest | Pipeline | Rebuilds each change | Pre-submission |
| 9 | Portal facts sheet (RTP 96.35%, max 5,000x, 1,024 ways, features, volatility) | PAR v2 | Available | Done |
| 10 | Compliance evidence pack (section 4) | Audits + re-validation pass | Two-mode re-validated: maths independently VERIFIED + CI-gated (scripts/validate_math.py, MATH_VALIDATION.md); RGS integration verified aligned (docs/RGS_CONTRACT_REFERENCE.md); replay event IDs derived (REPLAY_TEST_EVENTS.md); live docs refreshed 2026-07-04. Remaining items are deploy-dependent only. | Complete pre-deploy (2026-07-04) |
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
New obligations created by Overdrive (owned by Stage 2 unless noted): bonus buy
UI must carry social overrides for every string (the live prohibited terms table
bans buy, bonus buy, purchase, bought, cost of, at the cost of on stake.us, with
replacements such as get bonus, play, instantly triggered, can be played for);
the RGS jurisdiction flag disabledBuyFeature must fully hide the buy; replay
must play back a complete free spins round and, for a bonus buy round, display
the amount spent including the cost multiplier; both modes must appear in the
paytable and rules, localised across all sixteen locales; the 0.5% mode RTP rule
is satisfied by design, both modes at 96.3500%, evidenced in PAR v2.
Independent verification (2026-07-04): the maths is recomputed from the shipped
lookup tables by scripts/validate_math.py (CI-gated) - both modes 96.350000%,
cross-mode variation 0.0000%, base hit 29.11%, SD 17.28x / 206.63x, max 5,000x,
wincap 1-in-100k / 1-in-1k, all Stake checks pass (MATH_VALIDATION.md). The RGS
wire contract is documented and our client verified aligned in
docs/RGS_CONTRACT_REFERENCE.md. Community tooling assessed in docs/TOOLING_REVIEW.md.

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

## 7. WHERE EACH ARTEFACT FINALISES
Overdrive merge: maths files, PAR v2, facts sheet (done). Stage 2 frontend: buy
UI with social overrides, jurisdiction flag, bonus replay, rules and paytable
for both modes. AssetForge v2: all art including tile background, tile hero and
provider logo. Motion Polish v2: final presentation. Build Diet v2: final dist
and bundle. Compliance re-validation: evidence pack refreshed against the final
build. Then section 5, then submit.
