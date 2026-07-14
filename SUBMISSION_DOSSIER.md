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
| 4 | Submission blurb v2 (Overdrive) | Section 3 below | Owner-approved text unchanged; a DRAFT soundtrack sentence added 2026-07-13, PENDING OWNER APPROVAL (not yet part of the approved blurb) | Owner |
| 5 | Game tile background image | Design system Phase B | To design | AssetForge v2 |
| 6 | Game tile foreground hero (transparent PNG) | Design system Phase B | To design | AssetForge v2 |
| 7 | WRS provider logo (square, transparent, legible small, PNG up to 10 MB) | Design system Phase B | To design | AssetForge v2 |
| 8 | Staged upload bundle with SHA-256 manifest | Pipeline | Rebuilds each change | Pre-submission |
| 9 | Portal facts sheet (RTP 96.35%, max 5,000x, 1,024 ways, features, volatility) | PAR v2 | Available | Done |
| 10 | Compliance evidence pack (section 4) | Audits + re-validation pass | Five-mode re-validated: maths independently VERIFIED + CI-gated (scripts/validate_math.py, MATH_VALIDATION.md); RGS integration verified aligned (docs/RGS_CONTRACT_REFERENCE.md); replay event IDs derived for all five modes (REPLAY_TEST_EVENTS.md, cruise/antelite/super added 2026-07-08); statelessness independently proven for cruise/antelite/super (reports/qa/review_events_statelessness_2026-07-08.md); live docs refreshed 2026-07-04. Remaining items are deploy-dependent only. | Complete pre-deploy |
| 11 | High resolution asset link (Drive or Dropbox, public) | Owner | Pending | Pre-submission |
| 12 | Trademark position | Owner | Knockout search clear | Done for submission |
| 13 | Team profile, branding upload, payment details in portal | Owner, one-time | Confirm on next portal login | Pre-submission |

## 3. SUBMISSION BLURB v2 (Overdrive) - soundtrack sentence restored as DRAFT, PENDING OWNER APPROVAL

**Status (2026-07-13, JOB 5):** the blurb below now includes a draft soundtrack sentence
(marked inline) - restored per `docs/CHAT_CLOSEOUT_2026-07-06.md` §2's own note that
"PROMO_BLURB.md restores its soundtrack sentence once audio ships, then the owner
approves the final text." No original wording survives anywhere in the repo (checked -
it was fully removed, not archived), so this is freshly drafted to match what actually
shipped (`tools/audio_forge/`, `reports/audio/GENERATION_LOG_2026-07-13.md`), not a
recovered original. **This draft sentence is NOT approved** - the rest of the blurb
remains the owner's last-approved v2 text, unchanged.

    Plug in. Power up. Future Spinner drops you into a neon soaked cyberpunk
    megacity where chrome rims and holographic gauges blaze across a 5x4 grid
    with 1,024 Ways to Win.

    Land three, four or five Energy Burst Scatters to bank an instant award of
    up to 10x total bet and ignite OVERDRIVE FREE SPINS: 8, 12 or 16 spins where
    every winning spin pushes the Overdrive meter one gear higher, adding +1x to
    a multiplier that never resets. Three or more scatters during the bonus add
    5 more spins. Prefer the fast lane? The Bonus Buy takes you straight to the
    feature for 100x.

    [DRAFT - PENDING OWNER APPROVAL, not yet part of the approved blurb] A driving
    synthwave soundtrack and layered turbo SFX push the neon city to life,
    shifting up a gear the instant Overdrive ignites.

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

**Soundtrack claim status (updated 2026-07-13):** audio has shipped (twelve mastered
sound files - two music beds, ten SFX/stingers - via `tools/audio_forge/`, provenance in
`reports/audio/GENERATION_LOG_2026-07-13.md`; wired into `soundService.ts` with a bed
crossfade on Overdrive entry/exit, verified via `frontend/scripts/audio_verify.mjs`,
ALL CHECKS PASS). Per `docs/CHAT_CLOSEOUT_2026-07-06.md` §2's own note, the blurb's
soundtrack sentence is now restored as a draft (section 3) - **but remains
PENDING OWNER APPROVAL**, not yet an approved claim. Do not treat the draft sentence as
approved copy until the owner explicitly signs off on it.

## 5. STAGING PROTOCOL (JOB 5, rewritten 2026-07-13 - was "POST-UPLOAD VERIFICATION
PROTOCOL"; that content is preserved below as 5e, now framed inside the fuller staging
sequence a real upload actually requires)

### 5a. Frontend build artefact - what it is, how it's produced

The uploaded frontend artefact is `frontend/dist/` after `npm run build` - a static,
self-contained bundle (HTML/CSS/JS + the theme's asset tree), no server-side component.
Production chain: `vite build` (Svelte compile + bundle), then `vite.config.ts`'s
`pruneLegacyAssets` plugin strips every non-shipping theme/legacy asset from the output
(confirmed empty of pruned-path requests and under the 25MB budget by
`frontend/scripts/build_diet_verify.mjs` - see JOB 4, `reports/qa/build-diet-network-log.json`).
Current measured size: **13.59MB** (JOB 4, 2026-07-13), including the twelve mastered
audio files shipped in JOB 1. Regenerate immediately before staging with a clean
`npm run build` from `frontend/` - never upload a stale or hand-edited `dist/`.

### 5b. Exact portal upload steps

1. Log in to the Stake Engine developer dashboard (team profile, branding and payment
   details must already be confirmed one-time - see 5d below).
2. Upload the frontend bundle: the full contents of `frontend/dist/` as produced in 5a,
   for this exact commit.
3. Upload the maths/publish bundle: the eleven files in 5c below, from
   `games/future_spinner/library/publish_files/` - `index.json` first (declares the five
   modes and their file references), then each mode's `books_*.jsonl.zst` and
   `lookUpTable_*_0.csv`, then `game_metadata.json`.
4. Compose the game tile in the dashboard Tile Editor from the background image,
   foreground hero and provider logo (see JOB 7 - these are still design-pending, not
   part of this pass).
5. Enter the submission blurb (section 3) - **only once the draft soundtrack sentence has
   been explicitly owner-approved**, otherwise upload the blurb without it.
6. Do not request review yet - proceed to 5e (post-upload verification) first.

### 5c. `publish_files` inventory with fresh SHA-256 hashes (2026-07-14, gap closed)

The eleven files `index.json` actually declares (five modes: `base`, `cruise`,
`antelite`, `bonus`, `super`) - **all eleven now present and hash-verified**,
closing the `books_super.jsonl.zst` gap this section flagged on 2026-07-13:

| File | SHA-256 |
|---|---|
| `index.json` | `8857dbc027c5e2ceb0b2e39ec0a7dd05bc63272938dc8db515cdf7422d6f1aac` |
| `game_metadata.json` | `51e7dceeacd41fd292e769b75383ac8c77f726e8f275b1808ad898d99d9abc38` |
| `books_base.jsonl.zst` | `b86c8bb484523a53b8a42db6dbaef0bc26c51843077b5f06d01f492c40d39331` |
| `books_cruise.jsonl.zst` | `7b5a1ddcfcdfde76a2f286a36992df5f9e8632cf9cfdc442fcc71dfd3fcc5b24` |
| `books_antelite.jsonl.zst` | `9e5e8a0ad24f00383a6497f7debdf1ecaf46145d7f23f7d5d345e86ffd381377` |
| `books_bonus.jsonl.zst` | `a38d2b8f5da04ac4f401f33bcdfbbcde56f6b661bcc0f7ad50e518763dd9bbb9` |
| `books_super.jsonl.zst` | `c079226d718cab54825b91d5fdab631d7d2f8dd542f432e9b7b6ec7d57347445` |
| `lookUpTable_base_0.csv` | `7aa435857dcac59756f96b21dd128c58a9e3ed538b647c9056cebeee25e71990` |
| `lookUpTable_cruise_0.csv` | `da3e45c577866d7357f6b1e83b9a2d14e406d2daf24b662e1a55003e2ed5de01` |
| `lookUpTable_antelite_0.csv` | `150a6d243dcca205a7b9aff1c25c6ce5e3b31c634ac58f7b7e72274e4a054b15` |
| `lookUpTable_bonus_0.csv` | `a77241f1a2e6606bebe94b5e6bb86bc6dda957732316d4962cffc199731d50cd` |
| `lookUpTable_super_0.csv` | `2e94fe04ad0c44a69789f871b1c969e2c36021ce4db1c25bb328c8ee3dd4330e` |

**How the gap was closed (2026-07-14, sanctioned locked pass):** `books_super.jsonl.zst`
was regenerated via `games/future_spinner/run.py` under a temporary, scoped lift of the
`games/future_spinner/**` deny lines in `.claude/settings.json` (restored with a verified
empty diff immediately after; see the session report for the full account). The tool's
`target_modes` list regenerates cruise/antelite/super together (a fixed property of the
pipeline, not something this pass could narrow further without editing locked source
files, which stayed out of scope) - this incidentally recomputed
`lookUpTable_cruise_0.csv`/`lookUpTable_antelite_0.csv`/`lookUpTable_super_0.csv` and
`index.json` too. **Real finding**: the raw simulation stage is perfectly deterministic
(all three freshly-generated `books_*.jsonl.zst` files hash byte-identical to the values
already recorded above/in the PAR sheet), but the optimizer's lookup-table recomputation
is not bit-for-bit deterministic between runs (100k+ line diffs against the
already-published CSVs, despite presumably converging to the same statistics). Since
cruise/antelite/super's lookup tables were already correct and previously published, the
incidental non-deterministic recomputation was reverted (`git checkout --`) rather than
committed, so the CSVs and `index.json` in this table are the same already-published
bytes they always were - only the previously-missing `books_super.jsonl.zst` is new.
`scripts/validate_math.py` re-confirms 96.3500% RTP on the restored (unchanged) tables;
`scripts/review_events_stateless_scan.py` re-run against the fresh books confirms
statelessness (`reports/qa/review_events_statelessness_2026-07-14.md`).

**Seven orphaned, unreferenced `books_*.jsonl.zst` files, previously flagged here on
2026-07-13, are now deleted** (`books_volatile.jsonl.zst`, `books_ante.jsonl.zst`,
`books_hyperbuy.jsonl.zst`, `books_minibuy.jsonl.zst`, `books_superbuy.jsonl.zst`,
`books_megabuy.jsonl.zst`, `books_superante.jsonl.zst` - 35MB-203MB each). These were
leftover artefacts from an earlier mode-naming iteration, never referenced by
`index.json`, and exactly the class of stale-second-maths-package risk CLAUDE.md's
"Reference / prototype branches" note warns cost a star at a prior external audit. This
was within the sanctioned pass's explicit scope (the gitignored books artefacts under
`publish_files/` only), so deleted rather than merely flagged again.

### 5d. Owner checklist - one-time portal actions vs per-update actions

**One-time (do once, ever, for this studio/game):**
- [ ] Team profile and branding configured in Team Settings (provider logo applies to all
  tiles automatically once set here - do not re-upload per game).
- [ ] Payment details confirmed in the portal.
- [ ] Knockout trademark search cleared (already done, dossier inventory item 12).

**Per-update (repeat every time a new build/maths version is submitted):**
- [ ] Regenerate `frontend/dist/` fresh (5a) - never reuse a prior build.
- [ ] Re-verify `books_super.jsonl.zst`'s hash if the maths package changed at all (5c).
- [ ] Re-upload both bundles (frontend + publish_files) for the exact new commit.
- [ ] Re-run the post-upload verification protocol (5e) against the newly deployed build,
  not a cached prior result.
- [ ] Confirm the submission blurb text matches what's actually approved at the time
  (the soundtrack sentence must not go in until explicitly approved - see 5b step 5).
- [ ] Only then request review.

### 5e. Post-upload verification protocol (preserved from the prior section 5, unchanged)
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

**REVIEW_EVENTS pass: DONE (2026-07-08).** Statelessness artefact committed
(`scripts/review_events_stateless_scan.py` + `reports/qa/review_events_statelessness_2026-07-08.md`)
proving cruise, antelite and super all independently stateless from the actual shipped
books (regenerated under a temporary, owner-sanctioned lock exception and confirmed
byte-identical, SHA-256, to the originally shipped FeatureMath v2 books - a pure
reproduction, not a re-derivation). `REPLAY_TEST_EVENTS.md` now has real per-mode event
IDs for all five modes (previously only base/bonus).

## 7. WHERE EACH ARTEFACT FINALISES
Overdrive merge: maths files, PAR v2, facts sheet (done). FeatureMath v2: three
more modes shipped into the locked package (done, 2026-07-07). Stage 2
frontend: buy-tier UI with social overrides, jurisdiction flag, buy-tier
replay, rules and paytable for all five modes (done; per-mode replay IDs for
cruise/antelite/super landed 2026-07-08, see section 6).
AssetForge v2: all art including tile background, tile hero and provider
logo. Motion Polish v2: final presentation. Build Diet v2: final dist
and bundle. Compliance re-validation: evidence pack refreshed against the final
build. Then section 5, then submit.
