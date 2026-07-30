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
| 5 | Game tile background image | Design system Phase B | **DELIVERED** as `design-system/brand/delivery/FutureSpinner-BG.jpg`, under the platform naming convention | Owner uploads in the Tile Editor |
| 6 | Game tile foreground hero (transparent PNG) | Design system Phase B | **DELIVERED** as `design-system/brand/delivery/FutureSpinner-FG.png` | Owner uploads in the Tile Editor |
| 7 | WRS provider logo (square, transparent, legible small, PNG up to 10 MB) | Owner-supplied, externally commissioned | **DELIVERED and ADOPTED** (candidate f, 2026-07-26) as `design-system/brand/delivery/WeRollSpinners-Logo.png`, 1024x1024 RGBA, real alpha, 39KB | Owner uploads once in Team Settings Branding |
| 8 | Staged upload bundle with SHA-256 manifest | Pipeline | Rebuilds each change | Pre-submission |
| 9 | Portal facts sheet (RTP 96.35%, max 5,000x, 1,024 ways, features, volatility) | PAR v2 | Available | Done |
| 10 | Compliance evidence pack (section 4) | Audits + re-validation pass | Five-mode re-validated: maths independently VERIFIED + CI-gated (scripts/validate_math.py, reports/archive/superseded/MATH_VALIDATION.md); RGS integration verified aligned (docs/RGS_CONTRACT_REFERENCE.md); replay event IDs derived for all five modes (REPLAY_TEST_EVENTS.md, cruise/antelite/super added 2026-07-08); statelessness independently proven for cruise/antelite/super (reports/qa/review_events_statelessness_2026-07-08.md); live docs refreshed 2026-07-04. Remaining items are deploy-dependent only. | Complete pre-deploy |
| 11 | High resolution asset link (Drive or Dropbox, public) | Owner | Pending | Pre-submission |
| 12 | Trademark position | Owner | Knockout search clear | Done for submission |
| 13 | Team profile, branding upload, payment details in portal | Owner, one-time | Confirm on next portal login | Pre-submission |

## 3. SUBMISSION BLURB v2 (Overdrive) - soundtrack sentence restored as DRAFT, PENDING OWNER APPROVAL

> **Status superseded: blurb B is FINAL. See section 8a.**

**Status (2026-07-13, JOB 5):** the blurb below now includes a draft soundtrack sentence
(marked inline) - restored per `docs/CHAT_CLOSEOUT_2026-07-06.md` §2's own note that
"reports/archive/superseded/PROMO_BLURB.md restores its soundtrack sentence once audio ships, then the owner
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
(reports/archive/superseded/MATH_VALIDATION.md). The RGS wire contract is documented and our client
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

> **DTT SESSION: run `DTT_PROTOCOL.md` at the repository root alongside this section.**
> 5b below is the upload steps and 5d is the one-time versus per-update checklist;
> `DTT_PROTOCOL.md` is the ten scripted observations to make once the build is up, each
> with its expected value and the single line of code that changes if it disagrees. Order:
> 5b, then DTT_PROTOCOL.md, then 5e. (Added 2026-07-26.)

## 5. STAGING PROTOCOL (JOB 5, rewritten 2026-07-13 - was "POST-UPLOAD VERIFICATION

> **Amended by section 8h: the official Developer Testing Tool stage is added before submission.**
PROTOCOL"; that content is preserved below as 5e, now framed inside the fuller staging
sequence a real upload actually requires)

### 5a. Frontend build artefact - what it is, how it's produced

The uploaded frontend artefact is `frontend/dist/` after `npm run build` - a static,
self-contained bundle (HTML/CSS/JS + the theme's asset tree), no server-side component.
Production chain: `vite build` (Svelte compile + bundle), then `vite.config.ts`'s
`pruneLegacyAssets` plugin strips every non-shipping theme/legacy asset from the output
(confirmed empty of pruned-path requests and under the 25MB budget by
`frontend/scripts/build_diet_verify.mjs` - see JOB 4, `reports/qa/build-diet-network-log.json`).
Current measured size: **14.80MB** (108 files, 15,515,125 bytes) against the 25MB budget,
measured on the artefact that ships: the JOB 5 kit V3 build, from a fresh clone at commit
`7dd83e6a`, clean tree, 2026-07-26. Supersedes both the 13.59MB recorded at JOB 4 on
2026-07-13 and the 21.87MB measured earlier on 2026-07-26.

The 108th file is `build-info.json` itself, the JOB 4 provenance stamp, which records the
other 107 files and 15,514,744 bytes and is excluded from its own total for want of a
fixed point. 15,514,744 plus the stamp's own 381 bytes is 15,515,125, and
`dist_hygiene_gate.mjs` asserts exactly that reconciliation on every build.

**The earlier 108-file / 15,510,083-byte figure is superseded, and both movements are
accounted for.** JOB 3(i) removed one file, `assets/themes/future-spinner/sounds/README.md`,
because documentation no longer ships; JOB 4 added one, `build-info.json`, so the count is
108 again for a different reason. The byte total rises because the same session added the
mini-player abbreviation formatter, the social locale rule, the FEATURE PRICE line, the
boot stamp and twenty new translation keys across sixteen locales, all of which are bundled
JavaScript and together outweigh the removed file.

No exact byte-for-byte reconciliation between the two figures is offered, and that is
deliberate rather than an omission. The two builds are of different source trees, and the
README itself was edited between them by the TR-063 dash purge, so its size at the earlier
measurement is not its size now. Per convention (l.3) a figure is either cited or it is not
known: the current figure is computed and cited below, and a difference decomposed across
two trees would be an estimate wearing a decimal point.

The figure above is computed by `frontend/scripts/dist_hygiene_gate.mjs` on the build it
describes and written to `reports/qa/dist_hygiene_2026-07-26.json`, so it is re-derivable
rather than carried forward. That gate also asserts the 25MB budget and that no
documentation file is present.

**That property is reproducible, and it was verified rather than asserted.** A clean clone
taken from origin, installed with `npm ci` and built with `npm run build`, produced
**identical file lists and an exact byte match** against this machine, at the
108-file / 15,510,083-byte figure current when that check ran. Convention (o) makes the
property structural rather than something to remember, and the clone build for the current
figure is JOB 5's, where the kit is assembled.

Getting there took two fixes, both recorded under TR-047. An untracked, unreferenced
`branding/` directory in `frontend/public/` was shipping 7.06MB into `dist/` while being
invisible to git, so a clone built 14.81MB where the working machine built 21.87MB; it is
deleted and its path ignored. That narrowed the gap to four `.DS_Store` files, which macOS
writes into any directory Finder has opened and Vite copies verbatim, and which
`pruneLegacyAssets` now strips.

**See CLAUDE.md convention (o):** the staging bundle is always built from a fresh clone,
never from a working machine, so this property is structural rather than something to
remember to check.

Regenerate immediately before staging with a clean `npm run build` from `frontend/` - never
upload a stale or hand-edited `dist/`.

### 5b0. THE SUBMISSION ENTRY IS `future-spinner-2` (owner's ruling, 2026-07-28)

**Everything in 5b onward targets the game entry `future-spinner-2`.** It is a fresh clean
upload and it is the entry that will be submitted.

The original `future-spinner` entry is **superseded**. It awaits deletion once the platform's
cooldown allows, which is `OWNER_CHECKLIST.md` item 3b. Two entries for one game is exactly
the stale-artefact confusion this dossier exists to prevent, so the distinction is recorded
here rather than left to memory.

**Evidence that V8 is live on that entry**: `reports/screens/live-portal-2026-07-28/`, frame
`071805`, whose boot line reads build `e0c30611`, the kit V8 commit, and whose bundle hash
`index-pDIjyKAp.js` matches the kit's own JS filename.

**One thing on that frame is EXPECTED and is not a fault.** `GET .../approvals/future-spinner-2`
returns **404 (Not Found)** until Start Approval is pressed. Recorded so a reviewer meeting it
in a console capture does not read it as a defect.

**A second thing on that frame is diagnosed and closed**: three background files returned 403
from a path under `scratch/front/`, the platform's unpublished staging area. They are present
in dist and in the uploaded kit, measured both ways, and they rendered six minutes later with
no code change. Full reasoning in **TR-102**.

### 5b. Exact portal upload steps

1. Log in to the Stake Engine developer dashboard and open the **`future-spinner-2`** entry
   (team profile, branding and payment details must already be confirmed one-time - see 5d
   below).
2. Upload the frontend bundle: the full contents of `frontend/dist/` as produced in 5a,
   for this exact commit.
3. Upload the maths/publish bundle: the TWELVE files in 5c below, from
   `games/future_spinner/library/publish_files/` - `index.json` first (declares the five
   modes and their file references), then each mode's `books_*.jsonl.zst` and
   `lookUpTable_*_0.csv`, then `game_metadata.json`.
4. Compose the game tile in the dashboard Tile Editor from the background image,
   foreground hero and provider logo. **All four are delivered** under the platform's
   naming convention in `design-system/brand/delivery/`: `FutureSpinner-BG.jpg`,
   `FutureSpinner-FG.png`, `WeRollSpinners-Logo.png` and `FutureSpinner-Tile.png`.
   **The fourth is the COMPOSED TILE MASTER, 408x546 flat**, so if the Tile Editor
   accepts a finished tile there is nothing to compose. It was omitted from this
   list and from the upload kit until 2026-07-30 (S2-C092). The provider logo is a
   separate one-time upload in Team Settings Branding rather than in the Tile
   Editor. See
   `design-system/brand/delivery/README.md` for hashes and `DTT_PROTOCOL.md` for the
   owner-action checklist.
5. Enter the submission blurb (section 3) - **only once the draft soundtrack sentence has
   been explicitly owner-approved**, otherwise upload the blurb without it.
6. Do not request review yet - proceed to 5e (post-upload verification) first.

### 5c. `publish_files` inventory, TWO ARTEFACT SETS (reworded 2026-07-28)

**Read this heading carefully: there are two sets, and they are not the same.** The
previous wording said "all eleven now present and hash-verified", which was true of the
build machine and false of this repository. All three external reviewers cloned the
repository, saw seven files, and one correctly raised it as a BLOCKER. The wording, not
the artefacts, was the defect.

| Set | Contents | Where it lives |
|---|---|---|
| **REPO-COMMITTED** | `index.json`, `game_metadata.json`, and the five `lookUpTable_<mode>_0.csv` files. **Seven files.** | This repository |
| **LOCAL UPLOAD SET** | Those seven **plus** the five `books_<mode>.jsonl.zst`. **Twelve files.** | The build machine, plus an owner-held **Google Drive** copy of the full `games` directory (2026-07-28). Sharing scope is an owner-controlled setting and is tracked in `COMPLIANCE_WATCH.md`; the link itself is deliberately not recorded in this public repository. |

**The repository-committed set is seven files, and the five lookup tables are five, and
both counts are now machine-checked on every CI run rather than asserted here.** This is
the exact claim whose earlier wording said "all eleven now present", which was true of the
build machine and false of this repository, and which three external reviewers cloned and
correctly raised as a BLOCKER. A count that is written down is a count that goes stale; a
count that is checked cannot.
<!--CHECK: count=7 games/future_spinner/library/publish_files/*-->
<!--CHECK: count=5 games/future_spinner/library/publish_files/lookUpTable_*_0.csv-->

**The upload set is what goes to the ACP. The books are deliberately NOT in the
repository** and never will be, per the Fable ruling of 2026-07-28: LFS bandwidth on a
public repo, no platform requirement to commit them, and decisively, the books are the
complete outcome distribution and publishing them pre-release would hand the product to
anyone who clones. Two of them also exceed GitHub's hard 100 MB per-file limit, so a
plain commit could not succeed regardless.

**The bridge is `BOOKS_MANIFEST.md`** in the repository root: per-book SHA-256, byte
size, row count and provenance, so the private set is verifiable without being
published. All five hashes below are byte-identical to that manifest.

**TWELVE files, and the count was wrong here until 2026-07-26.** This heading said
"the eleven files `index.json` declares", which is wrong twice: `index.json` declares
**ten** files (five books, five lookup tables), and the table below lists **twelve**,
because `index.json` itself and `game_metadata.json` are both uploaded and neither is
declared by the index. Step 3 above named eleven for the same reason. Corrected in both
places. The artefacts were always right; the arithmetic was not, and a first-time uploader
counting twelve against a document saying eleven would reasonably think something was
missing.

The twelve upload files, with fresh SHA-256 hashes:

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
5. Complete 5f below (ACP Math Distribution and Summary evidence). Hard gate.
6. Complete 5g below (final docs delta sweep, within 24 hours of the request). Hard
   gate: if any rule changed, HALT and escalate rather than proceeding.
7. Only then request review, with the blurb, for the exact uploaded versions.

### 5f. ACP Math Distribution and Summary evidence capture (MANDATORY, added 2026-07-25)

**This step runs after the math upload and BEFORE requesting review. Review is not
requested until it has been completed and its evidence committed.**

Why it exists. The platform applies automated bet-level limits (maximum exposure,
maximum payout multiplier, maximum bet cost, maximum cost multiplier, base standard
deviation floor and ceiling, tail probabilities at 5,000x and 10,000x, CVaR risk limit,
and ETL liability limits) whose published definitions are not complete enough to
reproduce with certainty offline. Specifically, the CVaR definition is ambiguous on
three axes at once: the tested quantile (0.1% or 1%), the normalisation (CVaR divided
by bet cost, or the absolute value), and whether the worst-case-across-modes rule that
is explicitly stated for the tail probabilities also applies to CVaR. Our own
recomputation covers every reading (see `reports/qa/math_bet_level_compliance_2026-07-25.md`),
and under the plausible readings we pass with wide margins, but the platform's own
displayed figures are the only definitive ones.

Steps:

1. Complete the maths upload per 5b step 3.
2. Open the ACP **Math Distribution and Summary** screen for the uploaded version.
3. Screenshot the full screen, including every displayed summary statistic and every
   automated limit result. Commit to `reports/screens/acp-math-summary/<date>/`.
4. Transcribe the displayed values into a dated note under `reports/qa/` and reconcile
   them line by line against our independently computed table in
   `reports/qa/math_bet_level_compliance_2026-07-25.md`.
5. Record the platform's operative CVaR definition once observed, and update
   `COMPLIANCE_WATCH.md`'s 2026-07-25 open-question entry with the resolved answer.
6. **Where our figures and the platform's disagree, the platform's are definitive.**
   Correct ours to match and note the correction.
7. **If any displayed value sits outside its limit, stop.** Do not request review.
   Escalate to the owner with the screenshot and the reconciliation note.

Only when steps 1 through 6 are complete and nothing is outside a limit does 5e step 7
(request review) become available, and 5g must also have run clean.

### 5g. FINAL DOCS DELTA SWEEP (MANDATORY, added 2026-07-26, Fable ruling 14)

**Within 24 hours before requesting review.** This is a named final gate, not a
courtesy check.

Why it exists. The platform changes its published rules without announcement and
without effective dates. In a three-week window we observed the RTP ceiling already
lowered to 96.70 (while the public GitHub repository still advertised 90.0 to 98.0),
brand-new file-size caps appear, and the 3-star Maximum Exposure double from
$25,000,000 to $50,000,000. Any of those landing between our last capture and our
review request would mean submitting against rules that no longer exist.

Steps:

1. Re-fetch **every** approval page plus the payments page, rendered (the site is a
   client-side app and returns an empty shell to a plain fetch):
   - `/docs/approval-guidelines`
   - `/docs/approval-guidelines/math-verification`
   - `/docs/approval-guidelines/submission-checklist`
   - `/docs/approval-guidelines/jurisdiction-requirements`
   - `/docs/approval-guidelines/game-quality-rankings`
   - `/docs/approval-guidelines/game-tile-requirements`
   - `/docs/approval-guidelines/game-replay-requirements`
   - `/docs/approval-guidelines/rgs-communication`
   - `/docs/approval-guidelines/front-end-communication`
   - `/docs/approval-guidelines/general-disclaimer`
   - `/docs/payments`
2. Write the capture to a new dated directory under `docs/stake-engine-live/`, with a
   manifest carrying SHA-256 per page, in the same shape as the 2026-07-25 set.
3. **Diff against the most recent dated mirror.** Compare content hashes first, then
   read any page whose hash moved.
4. **Log the result in `reports/FABLE_COMMS.md`**, whether or not anything changed. A
   clean sweep is itself the evidence that the gate ran.
5. **If ANY rule changed, HALT.** Do not request review. Escalate to Fable with the
   diff and wait for a ruling. This applies to any change in a stated limit, threshold,
   prohibited term, required behaviour or file-format constraint, however small.

Do not use the public `StakeEngine/docs` GitHub repository as a source for this sweep.
It is four months stale and structurally diverged from the deployed site; using it
would produce a false clean result. See
`docs/stake-engine-live/2026-07-25/DELTA_NOTES.md`.

## 6. DOCUMENTATION GAPS TO CLOSE

> **Amended by section 8. Several gaps listed here are closed; see 8b, 8d and 8e.**
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

---

## 8. STATE AT HEAD (2026-07-25, refreshed end to end)

**This section is authoritative where it conflicts with sections 1 to 7 above**, which
predate the work below. Sections 1, 2, 4 and 7 remain accurate as structure; sections 3, 5
and 6 are amended here.

### 8a. Submission blurb: B is FINAL

Blurb B is recorded as final per owner instruction relayed 2026-07-25. Section 3's header
still reads DRAFT, PENDING OWNER APPROVAL; that status is superseded by this section. The
soundtrack sentence ships only if audio ships, per the standing rule that no claim precedes
its artefact.

### 8b. Maths: book-to-lookup equality is PROVEN, not asserted

Review 1 named this as the one thing it could not verify. It is now proven for **every row
of every mode**.

`tools/verify_books_lookup_equality.py`, read-only against the locked package:

```
rounds verified : 500,000
assertions made : 4,455,829
failures        : 0
```

Five independent reconciliations per round: book payout against the lookup table on the same
id; the closing `finalWin`; the last `setTotalWin`; the per-spin `winInfo.totalWin` values
summing to the declared payout; and each spin's individual symbol wins summing to its own
total. The last two are the substantive claim, because they prove individual symbol awards
sum, spin by spin and through the Overdrive meter, to the payout the lookup prices. The
first alone would only prove two files agree on a number.

**Wincap frequency, weighted, matches the published figures exactly.** Raw capped-row counts
are not probabilities; the books are a sample set and the lookup carries the weights:

| Mode | Weighted P(wincap) | 1 in |
|---|---|---|
| base | 0.0000100000 | 100,000 |
| cruise | 0.0000040000 | 250,000 |
| antelite | 0.0000125000 | 80,000 |
| bonus | 0.0010000000 | 1,000 |
| super | 0.0040000000 | 250 |

`BOOKS_MANIFEST.md` is the bridge between the repository-committed artefacts and the local
upload set: the seven committed files any reviewer can inspect, plus the five
`books_*.jsonl.zst` that go to the ACP, with SHA-256 for each. It now records semantic
equivalence, not merely identity and integrity.

### 8c. Platform limits: compliant with margin, and the source is named

| Limit | Requirement | Ours |
|---|---|---|
| RTP band, new submissions | 90.0% to 96.70% | **96.35%** in all five modes |
| Outcomes per mode | max 10,000,000 | **100,000** per mode |
| Max win | 5,000x cap | 5,000x, every table |

Both the RTP band and the outcome cap come from the **first-party platform announcement of
2026-07-25**, quoted verbatim with its date in `COMPLIANCE_WATCH.md`. As at the 5g sweep of
the same date they are **not yet on the published approval-guidelines page**; the
announcement said the RTP range takes effect "shortly with the next deploy". Cited as an
announcement rather than as a page, so the citation is checkable.

### 8d. Currency: XSC, XGC and XEC, with one gap named

XEC is implemented and is a **release gate** for Stake EU: *"Games that don't support it
won't be released on the platform."* It is defined identical to XSC by construction, and the
tests assert `XEC == XSC` rather than hardcoded output, so the pair cannot drift.

Symbol placement is **payload driven**. `formatBalance` accepts the platform's own
`CurrencyDisplay` metadata (`symbol`, `symbolAfter`, `decimals`) and renders per payload;
absent metadata, output is byte-identical to before. Both placements are asserted from
fixture payloads, so the game is correct whichever the platform sends.

**The gap, named rather than hidden:** locked `rgsService.authenticate()` builds a typed
object and drops any field not in its list, so a real payload's display metadata cannot yet
reach the consumption layer. Closing it needs either a lock sanction adding the field to
that mapping, or confirmation at the platform testing session that the metadata arrives
inside a field the mapping already carries. Not guessed at, and not routed around.

The raw code is never shown to a player: asserted for every virtual code.

### 8e. Session recovery, and what is deliberately unresolved

`authenticate.round` was mapped and then discarded, so a mid-round reload abandoned an open
round. On a `pending_end` round that is a **decided win nothing was ever going to collect**.
Now settled through the platform's own `endRound`, proven by 17 assertions against an
injected stub, since a `pending_end` round cannot be produced on demand against a live RGS.

**TR-035b is parked with options**, because an `open` round cannot be resumed from
`authenticate` alone: it reports the state but not the round's events. Settling it could
forfeit a feature the player has not seen; fabricating a presentation would be inventing an
outcome. The three options and the four questions that settle them are in
`docs/staging/DTT_SESSION_RECOVERY_VERIFICATION.md`, including a double-credit test on
repeated reloads which would be a blocker if it failed.

### 8f. Presentation integrity: scatter anticipation

Escalation is a function of **scatters visibly landed** and **whether reels are still
moving**, and of nothing else. A build therefore states "three are down and reels are still
turning", which is true one hundred per cent of the time; it never claims a scatter that has
not landed. The signature enforces it: the function cannot be passed a board.

The prior synthetic near-miss path, which read the final board to fabricate tension from a
high-symbol pattern, is deleted.

Designed against measurement rather than intuition: 40,000 shipped rounds, anticipation
opening in 23.18% of base rounds with 64.5% converting, and 0.5% of rounds landing two
scatters on one reel, which is why levels are computed from state rather than incremented.

### 8g. Production safety: the mock cannot be reached

`initRGS` sets `_rgsMode = false` on a genuine authenticate failure as well as the dev case,
and `spin()` fell through to the mock. A production player with a failed session would have
been served **fabricated wins against no wallet**. Betting is now enabled only on positive
evidence of a live session, every bet route is gated, and a blocked session shows a
translated, non-dismissible banner. A bundle gate asserts no mock marker reaches production,
and its negative control is recorded: injecting a marker makes the gate fail.

### 8h. Staging protocol amendment: the Developer Testing Tool stage

Section 5's protocol gains one stage before submission: a session on the **official
on-platform Developer Testing Tool**, which is where the remaining empirical questions are
settled in one sitting. It carries the 5f Math screen read.

Community-hosted tooling is **not** an acceptable substitute: our frozen tables and books do
not leave our custody for any third party pre-release, and every question the community
cloud would answer is answered identically on the platform's own infrastructure, where
uploading is the entire point. Self-hosting the community tool remains permitted.

**What the session settles:** XEC live behaviour and the currency display metadata; the
TR-012c placement question, by reading what the platform actually sends; TR-035b's
open-round semantics; and the CVaR definition.

### 8i. Presentation: cohesion

The scene character and car are enhanced art, adopted under an owner ruling that amended the
assets convention. Verified before adoption: subject bounding boxes match the originals to
0.7% and identically respectively, so no layout shifted. A single global grade is available
and ships at neutral.

**SUPERSEDED 2026-07-27, and the correction is recorded rather than the old text edited
away.** This paragraph used to state the rule as "external enhancement of art we already own
is permitted; externally designed art is not, and symbols are never externally designed."
That was the 2026-07-25 amendment and it is no longer the operative rule. `CLAUDE.md`'s
Assets section was amended again on 2026-07-27: **owner-commissioned NEW DESIGNS are
permitted for SCENE and MARKETING art, with recorded provenance. Symbols remain never
externally designed, and unrequested external design remains prohibited.** Two shipped
assets fit neither side of the old line, which is why the rule was restated to describe what
the project actually does. The full adoption register, with hashes and measurements, is
section 9c below.

---

## 9. STATE AT HEAD (2026-07-27): the live confirmations, the art adoptions, the display convention

Section 8 above is a **2026-07-25 snapshot** and is kept as one. This section carries what
landed after it, and it is the current one. Written by the round-three prep session; every
figure carries a path a reader can open, per convention (l.3).

### 9a. The live confirmations

These are the four things the game has now been observed doing on the live platform rather
than asserted about. Each was a real risk before it was observed.

| # | Confirmation | Evidence | Row |
|---|---|---|---|
| 1 | **Bet Replay WORKS on the live platform.** It did not before 2026-07-26. The panel launched, the board rendered static, and START REPLAY sat as an unclickable shadow. Root cause: `App.svelte`'s `.bg-layer` is `position: fixed` at `z-index: 0`, and a positioned layer at z-index 0 paints and hit-tests ABOVE unpositioned content, so the entire replay UI sat under the backdrop. Fixed in both directions. Bet Replay is a **mandatory** approval requirement, so this was a submission blocker. | Live: `reports/screens/live-round2-2026-07-26/01_replay_22975_celebration_multiplier_5000x_win_3750000.png` and `02_MAX_WIN_REACHED_overlay_5000x_bet_collect.png`, a `super` buy-tier wincap round replayed through to its celebration and PLAY AGAIN. Earlier live sighting with the disclaimer rendering: `reports/screens/dtt-live-2026-07-26/37_REPLAY_WORKING_event_52121_with_disclaimer.png`. Seeded-defect proof and the fixed flow: `reports/screens/replay-blocker/`. Gate: `frontend/scripts/replay_blocker_proof.mjs`, 7 of 7. | TR-076, CLOSED |
| 2 | **The MAX WIN celebration has been photographed.** The 5,000x cap fired on a real live round and the overlay presented correctly: three gold stars, MAX WIN REACHED, the `5,000 x BET` figure, and COLLECT. The underlying round was a `super` bet at EUR 750.00 paying EUR 3,750,000.00, exactly 5,000.00x, the platform's own row reading `x5000.00`. **At the cap, not through it.** | `reports/screens/live-round2-2026-07-26/02_MAX_WIN_REACHED_overlay_5000x_bet_collect.png`; second capture `reports/screens/replay-blocker/05_super_wincap_maxwin_celebration.png` | TR-073 CLOSED; ledger SA-018 CLOSED, SA-017 |
| 3 | **The payload shapes are confirmed from the wire**, quoted rather than inferred. See 9b. | `reports/screens/live-shapes-2026-07-26/` | TR-077, TR-078, TR-079 |
| 4 | **The jurisdiction read is TOLERANT of both live shapes.** The live authenticate carries `jurisdiction` at TOP LEVEL; the parser read `config.jurisdiction` only. Now `...(config.jurisdiction ?? raw.jurisdiction ?? {})`, additive rather than a swap, so the pinned shape still wins where it exists. Taken under an owner lock sanction: exactly the two named deny lines lifted as a never-committed working-tree edit, restored with `git diff .claude/settings.json` verified empty, commit carrying `LOCK-SANCTION: 2026-07-26 frontend/src/lib/services/rgsService.ts`, gate reading 1 commit, 1 sanctioned, 0 violations. | Proof runs against the **shipped exported function**, not a copy: `frontend/scripts/live_shape_conformance.mjs` serves the captured live body to the real `authenticate()`. 9 of 9 including both negative controls. Result `reports/qa/live_shape_conformance_2026-07-26.json`. | TR-080, CLOSED |

**A fifth, which the brief did not name and which is a mandatory dossier gate:** the ACP
Math Distribution and Summary screen has been read live and **every constraint passes at
both star tiers**. Transcribed at `reports/qa/dtt_live_session_2026-07-26.md`, frames at
`reports/screens/dtt-live-2026-07-26/15_...png` through `19_...png`. Headline figures as the
platform itself displays them: Max Payout Multiplier 5,000.0 against 100,000.0; Cost
Multiplier 400.0 against 1,500.0; Base Volatility 17.3 inside 0.6 to 60.0; Tail Probability
at 5,000x 0.003 against 0.010; **Risk Limit (CVaR) 205.710 against 700.000 and 800.000**;
ETL(Sum) 0.641 against 1.500. All five modes COMPLIANT, all at 96.35%, all 5,000x max, BASE
6 of 6 with cross-mode RTP variance 0.00%.

**Three consequences, stated as open rather than closed:**

1. **Section 5f still reads as an un-run gate. It has substantially been run.** Its step 3
   asks for captures at `reports/screens/acp-math-summary/<date>/`; that directory does not
   exist and the evidence is at `reports/screens/dtt-live-2026-07-26/` instead. The gate is
   satisfied in substance and not in filing.
2. **The CVaR open question recorded in `COMPLIANCE_WATCH.md` has an answer on file.** The
   platform displays `Risk Limit (CVaR) 205.710` against 700/800, which resolves the
   which-limit-and-which-value half of the three unknowns even if the quantile definition
   survives.
3. **Two cited sources disagree on the 2-star Maximum Exposure limit.** `COMPLIANCE_WATCH.md`
   records the published table as `$10,000,000` at 2-star; the platform's own ACP screen
   displays `15,000,000.0`. **Raised here rather than silently corrected**, because it
   touches a published compliance limit and section 5f step 6 says the platform's figures
   are definitive where they disagree with ours. Owner and Fable item.

### 9b. The payload shapes, quoted from the wire

Per convention (l.7), quoted rather than paraphrased.

**Play response** (TR-077), from `reports/screens/live-shapes-2026-07-26/05_play_response_state_is_event_array_micros.png`:

```
round.betID            1055919443
round.amount           1000000
round.payout           800000
round.payoutMultiplier 0.8
round.active           true
round.mode             "base"
round.state            [ { "index": 0, "type": "reveal", "board": [...] } ]
```

Two findings in that one shape. `state` **is** the event array, not an object containing
one. And the board rows carry **six** cells against a five-reel visible grid: the padding
row, seen on the live wire for the first time, and the same padding that produced the
worked example behind convention (l).

**Authenticate, money fields** (TR-078): `balance.amount` 996800000 with `currency` "EUR",
with the HUD reading `EUR 995.06` in the same frame.

**Authenticate, per-mode cost table** (ledger SA-024), the field that settles the display
convention:

```
"mode": "bonus",  "costMultiplier": 100, "maxBet": 1000000000
"mode": "super",  "costMultiplier": 400, "maxBet": 1000000000
```

**End-round** (TR-079), the entire response on one line:

```
{"balance":{"amount":995060000,"currency":"EUR"}}
```

No `roundId`, no `betID`, nothing else. `CURRENCY_SCALE` is 1,000,000, so the integer-micros
rule holds in both directions.

### 9c. The art adoptions, with provenance

Four external adoptions ship. **Only one of them was recorded in this dossier before
2026-07-27.** The operative permitting clause for all of them is `CLAUDE.md`'s Assets
section as amended 2026-07-27; the superseding note is in section 8i above.

| Asset | Class | Dimensions | Shipped SHA-256 | What the measurement found | Record |
|---|---|---|---|---|---|
| `frontend/public/assets/themes/future-spinner/backgrounds/bg_base.jpg` | Owner-commissioned **NEW DESIGN** | 1920x1080 RGB, 273,173 bytes at JPEG q80 progressive 4:2:0 | `c7ecfa15dde8db42...` | **Pearson r 0.3850**, 58.2% of cells moved, against an identity control at 1.0000 and a declared ENHANCEMENT control at 0.9966. Source `65ef44c1ce96d351...`, 569,573 bytes. The encode was chosen by a sweep against the incumbent's own 277,172-byte budget. | `design-system/brand/GENERATION_NOTE_background.md`, `reports/qa/background_candidate_ingest.json` |
| `.../backgrounds/bg_overdrive.jpg` | Derived in-house from the above | 1920x1080 RGB, 269,186 bytes | `909dbeefd304b10b...` | Deterministic grade, ratios taken from the original pipeline's own two parameter sets. **Derived because `App.svelte` crossfades the two**: adopting only the base would have cut to a different skyline on every bonus trigger, with every gate green. This is what added point 5 to the CLAUDE.md assets test. | `reports/qa/background_overdrive_derive.json` |
| `design-system/brand/tile/tile_composed_master.png`, and its delivery copy `FutureSpinner-Tile.png` | Owner-commissioned **NEW DESIGN** | **408x546** portrait, aspect 0.7473 | `741e77face74f7e9...`, byte-identical in both copies and byte-identical to the source | 408x546 is the platform's own **observed** published tile geometry, at 93.1% of an 87-tile decoded sample. The platform publishes no number. First portrait asset in the project: BG 2048x1152 and FG 4159x1875 are both landscape. Layers could not be cut from it, and that was **tested rather than assumed**: the type is baked into the pixels and 37.62% of the silhouette boundary has no confident matte edge, so both forms ship. | `design-system/brand/tile/GENERATION_NOTE_composed_master.md`, `TILE_LAYER_DERIVATION.md` |
| `.../ui/scene_character.png`, `.../ui/scene_car.png` | External **ENHANCEMENT** of art we already own | 680x1344 RGBA and 2840x1000 RGBA | `1acbd781ce1c7b79...` (629,245 bytes) and `627c6920c26e5be2...` (1,036,271 bytes), both measured for this record | Character subject bounding box matching the original to **0.7%**; car bounding box **identical** at 2729x914, 40.7% transparent in both. | `CLAUDE.md` Assets section; hashes recorded here for the first time |

**Two honest gaps against these, named rather than smoothed over:**

- **The scene character and car have no source hash on record.** The provenance requirement
  (source path, source hash, shipped hash, dimensions, supplier claim, measurement) postdates
  their adoption by two days, so it does not bind retroactively. It matters anyway: ledger
  row **SA-023** has since found a hard dark stroke baked into `scene_car.png` at column
  x 1864, y 263 to 554, 29% of the sprite height and visible to a player, awaiting an owner
  ruling on whether it is a designed shut line or a leftover from the enhancement pass.
  **Without a source hash there is no way to test whether the stroke came in with the
  enhancement.**
- **The Overdrive background variant is unproven in live play.** Ledger row **SA-026**: the
  variant is measurably a magenta shift rather than a red one (15.8% of the green removed,
  red up 1.2%, blue flat), and no committed capture shows it in game.

### 9d. The display convention, and what it costs a reader who does not know it

**The platform's Bets panel COST column, and the `round.amount` field in the play response,
both carry the BET LEVEL, not the amount debited.** The platform holds the multiplier
separately as `costMultiplier`. This is a platform-wide convention applied to every studio
and every mode; **our game is right**.

| What is seen | Where | What it actually is |
|---|---|---|
| BET EUR 1,250.00 | our HUD gold plate | what the next spin costs: bet level times mode multiplier |
| COST EUR 1,000.00 | the platform's Bets page | the BET LEVEL, never the multiplier, never the charge |
| `"amount": 1000000000` | the play response | the same bet level, in micros, and it feeds that COST column |

Proven in four stages, each independent of the last: inference from three modes agreeing;
wallet deltas to the cent across base, antelite, bonus and super with residual 0.00; the
platform's own `costMultiplier` fields; and three sessions reconciled by solving for the
opening balance twice, once under each competing reading, giving exact round openings under
the true costs and nothing round under the alternative.

**The consequence a reviewer must not be left to trip over:** the MULT column is payout over
the bet level too, so an `antelite` row reading `x91.60` is `x73.28` against actual spend. No
cap is breached in either reading; the 5,000x cap is measured against the bet level by both
the platform and our own `WINCAP`.

Owner-facing one-page explanation with four annotated frames:
`docs/records/MONEY_DISPLAY_EXPLAINED.md`. Full statement of what our own surfaces show:
`GAME_FACTS.md` section 3a.

**OPEN DECISION, not the builder's**: ledger rows SA-002 and SA-007 ask whether the
convention should be raised with the platform before submission. Waiting since 2026-07-26.

### 9e. Corrections to section 8, so it is not read as current

| Section 8 claim | Correction at HEAD |
|---|---|
| §8 header "STATE AT HEAD (2026-07-25)" | It is a 2026-07-25 snapshot. This section 9 is the current state. |
| §8e "TR-035b is parked with options" | **Not parked.** RE-RULED and RESOLVED by Fable 2026-07-26, status MERGED, RESUME AND SETTLE with no forfeit path. The premise the park rested on is gone: authenticate does return the round's events at `round.state`. |
| §8h lists four things the DTT session will settle | Two are settled: TR-035b is resolved and the CVaR figure has been displayed. **XEC live behaviour and the currency display metadata remain genuinely unobserved** and are the only two that should still be listed. |
| §5c maths file hashes | **Verified NOT stale**, so the next session need not re-derive them: all seven repo-committed maths files hash exactly to the §5c table, and `git ls-files` returns exactly those seven. |
| Bundle figure in §5 | Superseded. **As at 2026-07-27 the kit was V6, built from a fresh clone, 110 files, 15,601,767 bytes (14.88 MB)**; the two files added since V5 were the two speed-control captures. **CORRECTED 2026-07-29 by the boot-set audit: this row said "Current kit is V6" in the present tense and the kit is now V10.** The byte figure is deliberately NOT restated, because a bundle size changes on every build and a number chased today is stale tomorrow: **read it from `frontend/dist/build-info.json`, which stamps the version, the commit and the byte count on every build**, rather than from any sentence in this document. That file is the authority; this row is a dated note. |
| §2 item 10, "live docs refreshed 2026-07-04" | Dated mirrors now exist at `docs/stake-engine-live/2026-07-25/`, `2026-07-25b/`, `2026-07-26/` and `2026-07-28/`. |
| §6 and §2 item 13, which read as though the portal has never been entered | The game is published and the owner has run at least four live portal sessions. The two URLs §6 asks to capture are recorded in `COMPLIANCE_WATCH.md` as wrong and erroring. |
