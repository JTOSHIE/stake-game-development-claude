# COMPLIANCE WATCH

Living record of Stake Engine compliance posture for Future Spinner, and a log of
differences found when the live docs are refreshed into `docs/stake-engine-live/`.
Australian English, no em dashes or en dashes.

## Current posture (build verified against current requirements)

- **Stateless:** verified. **Five modes** (base 1.0x, cruise 1.0x, OVERBOOST 1.25x, Buy
  Overdrive 100.0x, NITRO OVERDRIVE 400.0x - corrected 2026-07-13, this summary had been
  left saying "two bet modes" after FeatureMath v2 shipped three more on 2026-07-07, see
  the Watch log entry of that date); the Overdrive Free Spins feature resolves inside one
  book round. No jackpot, gamble, continuation or early cashout. Matches the
  approval-guidelines Key Restrictions (free spins and feature buys are permitted;
  jackpots/gamble/continuation are not).
- **Feature:** Overdrive Free Spins with a progressive multiplier, plus two buy tiers
  (Buy Overdrive 100x, NITRO OVERDRIVE 400x). All five modes stateless and capped at
  5,000x, all at 96.3500% RTP.
- **Original IP:** verified, and **QUALIFIED 2026-08-05 because the flat claim was no longer
  true of what ships.** Symbols, frames and UI are original designs produced in-house from
  vector masters, never externally designed. Owner-commissioned SCENE, TILE and MARKETING art
  is adopted from outside under the Assets rulings in `CLAUDE.md`, each carrying a generation
  note or provenance record beside the asset giving source, hashes, dimensions and the
  measurement against what it replaced. The hero emblem is a Google Gemini generation and
  carries SynthID, governed by the licence capture at `docs/licences/google-gemini/2026-07-15/`.
  <!--CHECK: exists docs/licences/google-gemini/2026-07-15/*-->
  <!--CHECK: exists design-system/brand/hero_emblem/GENERATION_NOTE.md-->
  No pre-purchased content, and no third-party licensed content beyond that generation and
  its recorded licence. **The number of provenance records is deliberately not written here**,
  per convention (s): it grows whenever art is commissioned. Read the set from the brand
  directory.
- **No Stake branding:** verified. No Stake trademark or themes in any shipped asset or text.
- **No underage appeal:** verified. No child or child-like characters.
- **Social/jurisdiction:** social mode present; prohibited-term overrides applied for
  stake.us (`social=true`). See `docs/stake-engine-live/jurisdiction-requirements.md`.
  Feature-buy disclosure: the `disabledBuyFeature` jurisdiction flag hides the bonus buy
  (FeatureMenu and PaytableModal filter on `$buyFeatureDisabled`; VERIFIED 2026-08-15).
- **Bet Replay:** implemented and mandatory-compliant; player session not required. Event
  IDs are captured on the deployed staging build per `docs/REVIEW_EVENTS_PLAN.md` during the
  SUBMISSION_DOSSIER.md section 5 protocol. Bonus-buy replays display the amount spent
  from `spinCostMicros` (WinBanner PRICE line; VERIFIED 2026-08-15).

## Process reminders

- **Portal Developer Testing Tool:** to be used after uploading the bundle to the Stake
  Engine portal, before requesting review (authenticate, play, end-round against staging).
- **Platform features to track:** stateful games remain deferred by the platform and are not
  required for our stateless submission. **Provably fair is NO LONGER UPCOMING**, corrected
  2026-07-31: the 2026-07-28 Watch entry below records the FAIR API as live, public and
  unauthenticated, and the mirror at `docs/stake-engine-live/2026-07-28/fair-api.md` quotes the
  platform as having implemented Provably Fair across all stateless games built on Stake
  Engine. That entry records that no build work is owed.

## Watch log

### 2026-08-15: full 64-route re-capture (R070); ZERO delta, and the RGS refresh stands done early

Every route the live docs sidebar lists was enumerated from `/docs` itself and captured
into `docs/stake-engine-live/2026-08-15/`: 71 navigation anchors, 64 unique routes, all
rendered, none sampled or skipped. **All 64 are byte-identical to the 2026-08-11
capture.** No page changed, so no delta is recorded, no STOP is raised and no ruling is
owed.

**The RGS family was re-diffed on two independent transports**, per the brief and per
convention (l.4): through the logged-in browser pane, hashing
`document.querySelector('main').innerText` in the page, and independently through
headless Playwright at a different viewport. `/docs/rgs` reads 12,025 characters and
sha256 `cefad0fd2ed1a789e4b50cea9f0a2266d1ab5d0f04428f3d1889531a31a24580`,
`/docs/rgs/wallet` 2,537 and `15d774ea...`, `/docs/rgs/example` 2,273 and `0abf0a75...`,
each matching the 2026-08-11 record exactly. **The trio has not changed since
2026-07-29**, across four captures and seventeen days, so **the submission-morning
refresh of the RGS family stands done early.**

**Eight pages first read as changed by exactly one character each, and the cause was in
our own record rather than on the platform.** The 2026-08-11 manifest recorded sha256
over the raw `innerText` while the file beside it holds the trimmed text, and those eight
pages end in a newline. Re-capturing the raw text reproduced the 2026-08-11 hashes
exactly for all eight. The 2026-08-15 manifest records both normalisations per page so
the false delta cannot recur. Full account in
`docs/stake-engine-live/2026-08-15/DELTA_NOTES.md`.

**Four items were escalated from the materiality skim, none actioned**: three clauses of
the platform Developer Agreement (the public repository against clause 5.1.a.ii, the
insurance obligation at 17.16.a that no register carries, and the USD $1,000 licence-fee
accrual floor at line 387 against the flat "any amount above $0.00" in the owner's
register), and one integrity artefact inside the locked maths package (three lookup-table
hashes in the package config disagree with the shipped CSVs, cause documented in
`SUBMISSION_DOSSIER.md`, nothing that ships is affected). Tracker row TR-148.

### 2026-08-10: full 66-page mirror re-render (R043 PHASE 6); three pages changed, two STOP flags

The complete 2026-07-29 topic list was re-rendered into
`docs/stake-engine-live/2026-08-10/` (all 66 pages, render_state rendered; the
per-file headers record the transport note for this environment). Compared by
sha256 against 2026-07-29: **61 of 64 shared pages byte-identical**. The three
deltas, each read in full rather than sampled:

1. **`approval_guidelines_math_verification` REWRITTEN AND EXTENDED (4,558 to
   8,065 chars). ANSWERED 2026-08-10; the STOP is lifted and this note records it
   2026-08-15 under R071 TASK 8.** `FABLE_COMMS.md` entry 047 closes it by
   arithmetic against the published figures rather than by assertion: every
   critical test passes with margin, and the numbers are in that entry. **The
   STOP was correct when it was written** and it is being lifted by an answer
   rather than by time passing, which is the distinction this file exists to
   keep. The page's contents, as first captured: The page
   now publishes, as tables, what was previously prose or absent:
   - a new **Betlevel templates** section: the RGS rejects a bet whose total
     cost exceeds $500,000 USD or whose potential payout exceeds $50,000,000
     USD, returning 400 "invalid bet amount"; base-bet templates range $1 to
     $1000 USD.
   - a new **Critical Tests** table (all must pass before submission): base
     mode 1.0x and cheapest; base standard deviation >= 0.6; RTP 90.0 to
     96.7%; cross-mode RTP variation <= 0.5%; max payout multiplier <=
     500,000x; max cost multiplier <= 2,000x; **non-zero hit rate at least 1
     in 50 in EVERY mode**; at least one viable bet-level template.
   - a new **Non-Critical Tests** limits table per rating: Maximum Exposure
     $15,000,000 (2-Star) / $50,000,000 (3-Star); Maximum Bet Cost $100,000 /
     $500,000; Maximum Payout Multiplier 50,000x / 100,000x; Maximum Cost
     Multiplier 1,000x / 2,000x; Maximum Base Std Dev 50.0 / 60.0; **Risk
     Limit CVaR (per-stake) 700 / 700; CVaR (absolute) 20,000 / 50,000**;
     Tail Probability P(>=5,000x) 0.010 / 0.050; P(>=10,000x) 0.005 / 0.010.
   Why the STOP matters twice over: (a) the long-open CVaR ambiguity (FABLE
   COMMS 001 finding 1 recorded three unresolved axes) now has PUBLISHED
   figures and needs Fable to re-run the section 5f computation against the
   published definition; (b) the old 3-Star Maximum Exposure figure in the
   superseded root mirror ($25,000,000, `math-verification.md:46`) is now
   $50,000,000, so any document citing the old figure cites a superseded one.
   First-look posture, derivation not ruling: every CRITICAL test reads as met
   by the shipped package (base 1.0x cheapest; base SD 17.28 >= 0.6; all five
   modes 96.35%; cap 5,000x << 500,000x; max cost 400x <= 2,000x; base
   hit rate 29.11% >> 1 in 50), and the per-mode hit-rate and CVaR figures
   against the PUBLISHED definitions are for Fable's verification round, per
   convention (l.8).

2. **`approval_guidelines_submission_checklist` preamble reworded** (1,376 to
   1,405 chars, one sentence): "reflects the exact criteria your game will be
   reviewed against" became "is the criteria applied to a NEW TEAM.
   Requirements may vary once your team builds a track record, so your own
   review checklist can differ slightly." Bears on how the authenticated
   2026-08-09 checklist transcription is read (it is the new-team baseline).
   No shipped behaviour touched.

3. **`terms` counterparty CHANGED. STOP: owner-facing contractual change,
   recorded, not actioned.** Published date moved from Aug 6, 2025 to Jul 30,
   2026, and the contracting entity changed THROUGHOUT from Carrot Gaming Pty
   Ltd (Australia, reg 677 182 553, Melbourne) to **Medium Rare N.V.
   (Curacao, register 145353, Seru Loraweg 17 B)**. The licence-fee mechanics
   (10% GGR, USDT, negative rollover) read unchanged; the party the owner
   contracts with does not. This is the owner's to review; nothing in the
   repository changes on its account.

No shipped behaviour was changed by this delta, so nothing was actioned;
the two STOP items above are for the owner and Fable. The 2026-08-09
authenticated checklist transcription remains the newest capture of the
REVIEW checklist; today's public checklist page differs from it in scope, not
in content.

### 2026-07-04: captured the full approval-guidelines set + rubric findings
Discovered (via the docs nav) that we were mirroring only 4 of the approval pages and that
the dossier's `/docs/approval/checklist` + `/docs/approval/game-tile` URLs were wrong (they
error). Captured the real set under `/docs/approval-guidelines/`: **submission-checklist,
game-tile-requirements, rgs-communication, front-end-communication, math-verification,
general-disclaimer** (now 11 pages mirrored; manifest rebuilt).

Key findings (all reconciled against our build):
- **RTP band is 90.0%-96.70%, NOT up to 98%** (math-verification). We are compliant at
  **96.35%** with 0.35% headroom. `scripts/validate_math.py` was tightened to this real cap
  (and re-run: still ALL PASS).
- **Operator-risk star-tier ceilings** (math-verification) all pass for us: max payout mult
  5,000x (<= 100,000x), cost mult 100x (<= 1,500x), base SD 17.28 (in 0.6-60), P(>=5000x)
  cost-scaled 1e-5 base / 1e-3 bonus (<= 1e-2), max win reachable 1-in-100k / 1-in-1k
  (< 1-in-10M). Added these as gates to `validate_math.py`.
- **rgs-communication / front-end-communication** are the OFFICIAL RGS + frontend contract
  docs and align with `docs/RGS_CONTRACT_REFERENCE.md` (authenticate returns bet levels +
  min/max/minStep the frontend must respect; we do).
- **game-tile-requirements:** BG (PNG/JPG env background) + FG (transparent PNG) combined
  <= 3MB, plus a transparent Provider Logo legible at small size, with `GameTitle-BG/FG` /
  `ProviderName-Logo` naming. Feeds the tile asset task (owner/design).
- **submission-checklist:** the full criteria list is **login-gated** (portal auth) - capture
  the authenticated version on the owner's next portal login.

### 2026-07-04: docs refresh, no changes
Re-rendered all five pages via headless Chrome into `docs/stake-engine-live/`.
**No content changes** vs the 2026-07-03 snapshot: approval-guidelines (2250 chars),
jurisdiction-requirements (1375), game-quality-rankings (3245) and
game-replay-requirements (5037) all match byte-for-byte (identical content SHA-256).
The `/docs/updates` changelog page still renders only 88 chars (`looks_real:false`) via
this method, same as before; treat as a known gap and re-check it manually. No compliance
action required. Bet-replay implementation remains aligned with the (unchanged) spec, and
the star-rating "missing bonus feature" concern is already addressed (the Overdrive Free
Spins feature and 100x bonus buy ship, per the Option C decision below).

### 2026-07-03: first live docs refresh
Source snapshots saved under `docs/stake-engine-live/` (rendered via headless Chrome).

- **approval-guidelines:** captured. Confirms strictly stateless; no jackpots, gamble,
  continuation or early cashout; original designs only; no Stake branding; no underage
  appeal; a short promotional blurb must accompany the submission (blurb B, FINAL, in `SUBMISSION_DOSSIER.md` section 8a).
  Post-release, only minor visual updates are allowed once approved: no math or new-mode
  changes. No conflict with our build.
- **jurisdiction-requirements:** captured. Prohibited-terms table for stake.us with
  suggested social replacements (bet to play, cash to coins, etc.). Recommends a
  `sweeps_<lang>` language file. We handle this via social mode overrides. No conflict.
- **game-quality-rankings:** captured. NEW relative to prior notes. Games are rated 0 to
  3 stars; 1 star or lower is not published and is sent back to resubmit. **Owner
  attention:** the page lists "Missing engaging features: bonus modes and additional game
  mechanics ... are expected in competitive submissions" among common causes of low
  ratings, and warns against "over-reliance on generic AI-generated assets". Our canonical
  decision is deliberately base-only single-mode, which may cap the star rating even though
  it is fully compliant. The in-house vector design system directly addresses the
  AI-generated-assets concern. Decision point for the owner: accept a potentially lower
  ranking for a clean stateless base game, or plan a compliant additional mechanic later.
- **game-replay-requirements:** captured. Confirms Bet Replay is mandatory for all new
  games, session not required, and the reviewer will request a range of event IDs to
  validate scenarios. Matches our implementation; capture staging event IDs before review.
- **changelog:** no dedicated docs page found. `/docs/changelog` and `/docs/updates` both
  error, and there is no changelog entry in the docs navigation. Recorded as not-found;
  re-check on the next refresh in case a changelog page is added.

### 2026-07-03: single-mode star-rating question RESOLVED (Option C)
The owner decided to ship a real bonus feature (OVERDRIVE FREE SPINS). The maths is now a
two-mode package (base + 100x bonus buy), directly answering the quality-rankings concern
that additional mechanics are expected in competitive submissions. Both modes are stateless,
capped at 5,000x, and return 96.3500% RTP. This closes the base-only decision point above.

Two Stage 2 (feature frontend) compliance items opened by the feature:
- **Buy-feature disclosure:** the jurisdiction flag `disabledBuyFeature` must hide the bonus
  buy where feature buys are not permitted.
- **Bonus-buy replay:** bonus-buy replays must display the amount spent including the 100x
  cost multiplier (per the game-replay-requirements page).

A compliance re-validation against the live docs for the two-mode feature game is scheduled
in the pass sequence before submission.

### 2026-07-07: SUPERSEDED by FeatureMath v2 - five-mode package
The two entries above (the base-only decision at 2026-07-03's game-quality-rankings note,
and this section's "now a two-mode package" framing) are both superseded. FeatureMath v2
shipped three more modes into the locked package the same day: Cruise (1.0x, low-vol),
OVERBOOST (1.25x ante toggle, debits every spin while ON), and NITRO OVERDRIVE (400x,
Overdrive meter pre-revved to 5x). The package is now five modes, all stateless, all
capped at 5,000x, all 96.3500% RTP (see `reports/archive/handovers/HANDOVER_2026-07-07_Fable.md` for the full
per-mode table and independent re-verification). This closes the star-rating concern the
2026-07-03 entry flagged more fully than the original two-mode answer did - a five-mode
package with a genuine ante mechanic and two buy tiers is a stronger answer to "additional
mechanics are expected in competitive submissions" than base-plus-one-buy was.
Buy-feature disclosure and buy replay's cost-multiplier display now apply to **both** buy
tiers (Buy Overdrive 100x and NITRO OVERDRIVE 400x), not just the original bonus buy.

### 2026-07-13: JOB 3 re-validation - line-by-line against current `main`, dated evidence

Consolidated Work Order JOB 3. Every line below is a fresh check against today's code/
build, not carried forward from an earlier pass.

- **RG jurisdiction defaults (minSpinMs 0 unless flags demand):** confirmed in
  `frontend/src/lib/stores/responsibleGambling.ts:25-32` - `rgJurisdiction` derives
  `minSpinMs` from `jurisdictionFlags` (`typeof $f.minSpinMs === 'number' ? $f.minSpinMs :
  0`), sourced from the RGS `authenticate` response's `jurisdiction` passthrough
  (`rgsService.ts:421`). Turbo is auto-disabled whenever `minSpinMs > 0`. Test coverage
  (`responsibleGambling.test.ts:64-66`) asserts both the literal 0ms floor with no
  jurisdiction data and the 2500ms UKGC-style override - re-ran today, still passes.
  `rgSpinDelay()` is the single enforcement point, called from `App.svelte`'s
  `scheduleAutoSpin()` after the turbo/super speed-tier factor, so the jurisdiction floor
  always wins even under fast-play multipliers.
- **Autoplay explicit-confirm gate:** confirmed structural, not a single named function -
  `isAutoPlay.set(true)` has exactly ONE call site in the whole codebase, inside
  `startAuto(count)` at `HudOverlay.svelte:194`, reachable only via two explicit clicks
  (open the autoplay menu, then click a specific spin-count option). Never called on
  mount, from restored state, or from a URL param.
  **CORRECTED 2026-07-30.** This line previously claimed TWO call sites, "both inside
  `startAuto(count)` in `ControlBar.svelte:57-63` and its `HudOverlay.svelte` duplicate".
  It was wrong in two ways at once, and the second is the one that would have misled a
  reader: not only was the COUNT wrong, the file it NAMED FIRST no longer exists. The
  ControlBar component (deliberately not written as a backticked path, because a dead
  filename written as a live path is itself a gate finding, and the document currency
  gate flagged exactly that when this correction was first drafted) was deleted on
  2026-07-08 in commit `56c0403`, the dead-components hygiene pass, and the duplicate
  went with it. Recounted here by
  `grep -rn "isAutoPlay.set(true)" frontend/src`, which returns exactly one line.
  **The compliance conclusion is unchanged and is in fact stronger**: one guarded call
  site is a narrower surface than two, so the explicit-confirm property still holds. What
  was stale was the evidence, not the finding, which is why this is a correction and not
  a reopening.
- **Provably-fair determinism test:** re-ran fresh today
  (`npx tsx src/lib/services/roundInterpreter.determinism.test.ts`) - **PASS, 58/58**
  sample books reconstruct identically across 5 runs each, plus a static source-text
  guard against `Math.random`/`Date.now`/`new Date(` in `roundInterpreter.ts`.
- **Telemetry confirmed no-op by default, zero external network calls in the bundle:**
  `track()` in `telemetry.ts:68-70` is a hard no-op unless `setTelemetrySink()` has been
  called; the only call site is `App.svelte:110-114`, gated behind
  `import.meta.env.DEV` (never fires in a production build). Source-level grep for
  `fetch(`/`XMLHttpRequest`/`new WebSocket`/`sendBeacon` in `telemetry.ts` and its only
  consumer: zero matches. Checked the **actual built bundle** too (`npm run build`, then
  grep `dist/assets/index-*.js`): 4 `fetch(` call sites total, all attributable to the
  legitimate RGS/replay communication layer (`authenticate`, `endRound`, `/replay/`
  strings found adjacent) - none from telemetry, which has none to begin with.
- **Bet levels:** confirmed dynamic, not hardcoded - `rgsBetLevels` (`rgsBetLevels.ts`) is
  populated from the real RGS `authenticate` response (`rgsService.ts:419`,
  `auth.betLevels` converted from micros), with a static fallback array only used in
  dev/mock/auth-failure mode (`$rgsBetLevels.length > 0 ? $rgsBetLevels : BET_LEVELS`).
- **RGS failure paths, each exercised once, observed behaviour recorded:**
  - **Disconnect mid-spin:** `handleRGSError()` (`rgsService.ts:194-197`) maps a fetch
    `TypeError` to the retryable `ERR_GEN` code; `_withRetry()` retries `play()` up to 3
    times, 1s apart. **THIS GAP IS CLOSED, 2026-07-25, by the first lock sanction (PR #103);
    recorded here 2026-08-15 by R071 TASK 8 because the register still described it as
    open.** VERIFIED at HEAD by direct read: `endRound` is routed through `_withRetry`, and
    the comment beside it records both the defect and why the fix is safe, namely that
    end-round is idempotent on the round id. `CLAUDE.md`'s LOCKED_FILE_DEBTS entry for
    `rgsService.ts` records the same closure. **The description below is kept as the
    original diagnosis**, because it states the consequence better than a closure note
    would: **Gap found:** `endRound()` was called directly (`rgsService.ts:473`),
    not wrapped in `_withRetry` - a disconnect specifically during end-round (after
    `play()` already succeeded) gets no retry, just a single throw into the same
    generic error-banner path `App.svelte` already renders. The RGS contract's
    `AuthResponse.round?: ActiveRound` field is parsed but never consumed anywhere -
    the frontend has no resume-in-progress-round logic, though the game's stateless
    design (the whole feature resolves inside one book round) limits the blast radius.
  - **Insufficient funds on buy:** confirmed complete. `FeatureMenu.svelte`'s per-tier
    affordability gate (`$balance < $betAmount * m.cost`) blocks opening the buy modal at
    all when unaffordable, correctly using the real per-tier cost (100x or 400x). The
    modal's own `canBuyBonus` check (`gameStore.ts`, locked) is hardcoded to a flat 100x -
    already recorded as a compensated, unreachable finding in `CLAUDE.md`'s
    `LOCKED_FILE_DEBTS` (ratified 2026-07-07, no lock lift needed while `FeatureMenu`'s
    tighter gate keeps blocking first) - re-confirmed still true and still compensated
    today, not a new gap. Server-side `ERR_IPB` also maps to a clear
    "Insufficient balance" banner message.
  - **Resume-after-refresh / replay:** **CLOSED; recorded 2026-08-15 by R071 TASK 8.**
    VERIFIED at HEAD by direct read: `sessionRecovery.ts` reads `auth.round` and publishes
    it to the `activeRound` store, and `App.svelte` mounts a `ResumeOffer` presentation on
    it, so the silent mid-round refresh this entry describes now has a recovery path. The
    original finding is kept below unedited, because the reasoning about WHY it was
    lower-risk rather than no-risk is the part worth re-reading:
    **gap confirmed, not new but re-verified today** -
    repo-wide grep for `resume|reconnect|onLine|visibilitychange` returns zero matches;
    `initRGS()` always re-authenticates clean on load and never inspects `auth.round`.
    Replay mode itself (a separate, explicit URL-param flow) is fully handled with its own
    error state machine (`ReplayMode.svelte`) and a descriptive thrown `Error` on a
    non-OK fetch (`replayService.ts:98-109`) - no gap there, only in silent mid-round
    refresh recovery, which the stateless architecture makes lower-risk but not zero-risk.

**Net assessment:** no new compliance regressions found. Two pre-existing, low-risk gaps
re-confirmed (endRound not wrapped in retry; no resume-after-refresh path) - both
compensated by the stateless single-book-round design, neither blocking submission, both
worth a future hardening pass rather than urgent fixes. The "Current posture" summary
above was stale (still said "two bet modes" nine days after the five-mode package
shipped) - corrected in this same pass.

### 2026-07-25: automated bet-level verification constraints, full extraction

Source: `https://stake-engine.com/docs/approval-guidelines/math-verification`, rendered
and captured 2026-07-25 to `docs/stake-engine-live/2026-07-25/math-verification.md`.
Delta analysis against the 2026-07-04 mirror and the public GitHub repository is in
`docs/stake-engine-live/2026-07-25/DELTA_NOTES.md`.

These are **automated** limits applied to the uploaded maths, not reviewer opinion.
They are stated per star tier. Our target tier is 3 stars, so the 3-star column is the
operative one, with the 2-star column recorded because a rounded average can land us
there.

#### The constraint table, as published

| Constraint | 2-star limit | 3-star limit |
|---|---|---|
| Maximum Exposure | $10,000,000 | $50,000,000 |
| Maximum Payout Multiplier | 25,000x | 100,000x |
| Maximum Bet Cost | $100,000 | $500,000 |
| Maximum Cost Multiplier | 1,000x | 1,500x |
| Minimum Base (1.0x cost) Standard Deviation | 0.6 | 0.6 |
| Maximum Base (1.0x cost) Standard Deviation | 50.0 | 60.0 |
| P(>=5000) | 1e-2 | 1e-2 |
| P(>=10000) | 8e-2 | 2e-2 |
| Risk Limits (CVaR) | 700 | 800 |
| Liability (ETL, >40x Bet) | 0.8 | 0.9 |
| Liability (ETL, P(>10000)) | 0.6 | 0.8 |

Separately, and independent of tier: the maximum bet size accepted by the RGS is
**$500,000 USD**. Anything above returns HTTP 400 with "invalid bet amount".

#### Definitions, as published

- **P(>=5000) and P(>=10000).** The maximum allowed cumulative probabilities of
  achieving a payout at or above 5,000x and 10,000x respectively. The **worst-case,
  meaning highest, value across all modes** is the one tested. This matters for us:
  the gate is not the base mode, it is whichever mode is worst.

- **Cost-multiplier scaling of the tail probabilities.** For high-cost modes the
  measured probability is scaled **down** before comparison, making expensive modes
  more lenient because their effective contribution to tail risk is smaller relative
  to a base bet:

  | Cost multiplier c | Scale applied |
  |---|---|
  | c >= 1000x | 0.2 |
  | 500 <= c < 1000 | 0.5 |
  | 200 <= c < 500 | 0.8 |
  | c < 200 | none stated, treated as 1.0 |

  Applied to us: NITRO OVERDRIVE at 400x cost falls in the 200 to 500 band and is
  scaled by **0.8**. Buy Overdrive at 100x is below the lowest published band and
  therefore takes **no relief**, scale 1.0. Cruise, OVERBOOST and base likewise take
  no relief.

- **CVaR, Conditional Value at Risk**, also called Expected Shortfall. Published
  definition: "what is the expected payout to the operator when a win occurs in the
  worst 0.1% of outcomes?" Two values are stated to be considered, the **normalised**
  CVaR (CVaR divided by bet cost), and the **un-normalised** CVaR (the absolute
  expected payout when such an event occurs).

- **ETL, Expected Tail Liability.** The proportion of total expected return
  concentrated in wins at or above **40x the cost multiplier** (or above 10,000x
  where 40x is not applicable). A normalised ETL of 0.5 means half the game's RTP
  comes from wins above the threshold. Two limits are published per tier, one against
  the 40x-bet threshold and one against the P(>10000) threshold.

#### OPEN QUESTION, CVaR definition. Recorded verbatim, resolution path attached.

**RESOLVED TWICE OVER, and this register carried it as open until 2026-08-15, when R071
TASK 8 recorded the closure.** It was resolved in PRACTICE from the ACP screen, which this
same file already records further down, and then closed by arithmetic in `FABLE_COMMS.md`
entry 047 on 2026-08-10 against the platform's published figures. **The question below is
kept in full, because a definitional ambiguity that was answered once will be asked again**
and the resolution path attached to it is what answered it.

The published text says the worst **0.1%** of outcomes. Our independent pre-computation
from Fable is stated as **CVaR99**, that is the worst **1%**. These are not the same
statistic, and the published limit (700 or 800) is given without units or an explicit
statement of which of the two published variants, normalised or un-normalised, it is
compared against.

Three unknowns, none resolvable from the published documentation:

1. Is the tested quantile 0.1% (CVaR99.9) or 1% (CVaR99)?
2. Is the limit compared against the normalised or the un-normalised value?
3. Is the worst-case-across-modes rule applied to CVaR as it explicitly is to the tail
   probabilities, or is CVaR assessed on the base mode only?

**Resolution path, recorded as the formal mechanism rather than a guess.** The ACP
computes and displays these figures itself. After the math upload and **before**
requesting review, the ACP **Math Distribution and Summary** screen is read and
screenshotted into dossier evidence, and our independently computed values are
reconciled against the platform's own displayed values. Where they disagree, the
platform's figures are definitive and ours are corrected to match. This is now a
formal staging step in `SUBMISSION_DOSSIER.md` section 5, added this pass, so it
cannot be skipped on the way to submission.

Until that reconciliation happens, our CVaR position is reported at **both** quantiles
in `reports/qa/math_bet_level_compliance_2026-07-25.md` so that whichever definition
the platform uses, the answer is already on file.

#### Other constraints recorded this pass

- **File size restrictions, new since the 2026-07-04 capture.** No single events file
  (`.jsonl.zst`) may exceed **4.2GB**, and no game mode may contain more than
  **10,000,000 events**. These fail at publish time, not at review. Ours is 100,000
  rounds per mode, roughly two orders of magnitude inside the cap.
- **RTP ceiling 96.70%.** Ours is 96.3500% in all five modes, margin 0.35pp, spread
  across modes 0.0000pp against a 0.5% allowance. The public GitHub repository still
  advertises the old 90.0 to 98.0 range and must not be used as the source of truth.
- **SC display format contradiction, SETTLED 2026-08-14 by R065; recorded here 2026-08-15
  by R071 TASK 8.** The placement set was resolved whole and the owner's live confirmation
  of the XEC display is recorded, closing the standing glance (`FABLE_COMMS.md` entry 067).
  The code agrees at HEAD: the platform currency table drives placement per code, with the
  social tokens trailing and `symbolAfter` retired for fiat. **The contradiction as it was
  first written is kept below**, because the shape of it (two first-party sources, neither
  wrong, describing different currency classes) is the reason it took a ruling rather than
  a lookup: **SC display format contradiction, as originally recorded.** The only first-party currency table
  found (repository only, live no longer publishes one) documents `XSC` as symbol `SC`
  with `symbolAfter: true`, example `10.00 SC`. The brief specifies an `SC 1,000`
  leading-symbol style. Part 3 drives display from platform-provided session data
  rather than from either assumption, so this does not block, but the final format
  needs a ruling. `XEC` could not be verified from any source, see the delta notes.


### 2026-07-28: FAIR API, and two design rulings recorded

**FAIR API.** `https://fair.stake-engine.com/catalogue` is a public JSON endpoint
listing every published game with, per active version and per mode, the mode `name`,
`rtp`, `weight_range` and `events` count. Captured to
`docs/stake-engine-live/2026-07-28/fair-catalogue.md`.

**Our position: no additional work is owed.** Our maths package IS the data source for
these figures; FAIR publishes what the ACP already holds. Nothing in the endpoint asks
anything of the frontend or the build.

Two observations worth recording, both computed from the captured payload rather than
assumed:

- **`weight_range` convention matches ours.** Published games cluster around
  `1.1259e15` (2^50), which is exactly the order of our own per-mode total weights
  (base 1,125,899,906,813,400). Our tables are conventional, not anomalous.
- **Our 100,000 events per mode is at the LOW end of the published field.** Others run
  1,000,000 to 10,000,000 (Obey The Reptillians sits at exactly 10,000,000, the cap).
  **Corrected 2026-07-31**: the captured excerpt holds nineteen modes and FOUR of them sit
  between 100,000 and 1,000,000, so the range as written omits the band immediately above ours.
  We remain inside the platform minimum of 100,000 and two orders below the 10,000,000
  ceiling, so this is compliant, but it is a visible differentiator in a public
  catalogue and worth an owner decision at some point.

**Outcome endpoint contract: CAPTURED 2026-07-28.** The URL came from the owner's
dashboard capture: `https://stake-engine.com/fair/api`. Full contract mirrored at
`docs/stake-engine-live/2026-07-28/fair-api.md`. Four public, unauthenticated endpoints:
catalogue, outcome verification, **event table**, and peek. Comms finding 32 closed.

**This materially refines the books-privacy position.** The **event table** endpoint
(`GET /event/{team}/{game}/{version}/{mode}`, no auth) returns, quoting the platform,
"the ordered list of every possible payout outcome and its corresponding probability
weight range". That is exactly the content of our `lookUpTable_<mode>_0.csv` files.
**After publication the platform makes our payout distribution public by design**, and
the docs state the weight and payout tables are "published and immutable" per version.

The 2026-07-28 ruling still stands on its narrow ground, because the **event books hold
more than FAIR publishes**: the per-round event streams, board reveals and feature
choreography are not exposed by any FAIR endpoint. But the phrase "the complete outcome
distribution" should be read as pre-release only. Post-release, that distribution is
public by platform design, and it becomes independently verifiable by any third party
against the platform's own copy, which is the strongest available answer to review 1's
complaint that book-to-lookup equality could not be checked.

**PRE-RELEASE EXPOSURE, RAISED FOR OWNER DECISION (2026-07-28).** The off-repo custody
copy of the full `games` directory is a **publicly accessible** Google Drive folder: it
loads without sign-in and offers "Download all". If it contains the
`books_*.jsonl.zst` files, then the complete pre-release outcome distribution and event
choreography are currently downloadable by anyone holding the link, which is precisely
the exposure the same day's ruling rejected Git LFS to avoid. The link is deliberately
NOT recorded in this repository.

**Owner clarification, same day:** the folder was created as a personal reference backup
and shared here only to demonstrate that a backup exists. It was **not** an intentional
publication. That is worth recording because it changes the character of the finding
from a decision to a setting: nothing about the backup's purpose requires public access,
so restricting the folder to named accounts costs nothing and closes the exposure.

**Status: CLOSED 2026-07-28.** The owner disabled the folder's sharing; it is no longer
publicly accessible. The backup itself is unaffected and remains available to the owner.
No further action. No second copy is needed for builder access: the books are read
directly from `games/future_spinner/library/publish_files/` on the build machine, which
is how their hashes and row counts were verified for `BOOKS_MANIFEST.md`. Additional
copies add custody surface without adding capability, so any further backup should be
for owner-side disaster recovery only, and should not be publicly shared.

## PLATFORM DELTA, 2026-07-25 (first-party announcements, relayed from Discord)

Source saved verbatim at `reports/briefs/FS_PlatformDiscordDump_2026-07-25.md`. Quoted,
not paraphrased, per convention (l.7).

### 1. XEC and Stake EU. ACTIONED, and it reverses a standing hold.

Quoted: **"To be eligible for release on Stake EU, your games must support the XEC
currency. Games that don't support it won't be released on the platform."**

This is the first-party source TR-012b was waiting for. The HOLD was correct while three
first-party sources had no trace of the code; the position changes now **because** the
evidence changed, which is the discipline working rather than failing. XEC is implemented
and identical to XSC by construction.

Quoted: **"Internally, the currency code used is XEC. However, players will not see XEC
in-game."** Held by an assertion that a formatted XEC balance never contains the string
"XEC".

Quoted: **"Similar to Stake US, games released on Stake EU will have social set to true."**
XEC is also in the social-currency set as defence in depth, so an XEC session presents
social vocabulary even if the flag were ever absent.

Quoted: **"We're also likely to introduce additional sweepstakes-style currencies in the
future."** Adding one is a single line in `VIRTUAL_CURRENCIES` plus one in the social set.

### 2. CONTRADICTION: SC display format. NEEDS A RULING, affects XSC as well as XEC.

The announcement says the currency is **"displayed using the SC format (e.g. SC 1,000)"**,
which is **leading** placement. We ship **trailing**, `1,000.00 SC`, under Fable ruling 2
of 2026-07-26, which was itself based on two first-party sources: the currency reference
documenting `symbolAfter: true`, and the official `StakeEngine/ts-client` SDK
(`XSC: { symbol: 'SC', decimals: 2, symbolAfter: true }`).

So two first-party sources now disagree, and this is **not new to XEC**: it applies to the
XSC balance already shipping for Stake US. No unilateral change has been made. Recorded as
a numbered comms item with options.

### 3. Outcome cap, 10 million per mode. COMPLIANT, verified.

Quoted: **"modes must not exceed 10 million outcomes."** Measured from the shipped lookup
tables: **100,000 rows in every one of the five modes**, two orders of magnitude below the
cap. No action. Note this cuts against the earlier observation that 100,000 sits at the low
end of the published field: the platform has now capped the top rather than raised the
floor.

### 4. RTP range 90.0% to 96.70% for new submissions. COMPLIANT, unchanged.

Quoted: **"the required math range for all modes must fall within the range 90.0% —>
96.70%"**, and **"this will not be applied retroactively"**. Future Spinner is 96.35% in
all five modes, inside the band with 0.35pp of headroom. Already the ceiling this project
has been building to.

### 5. New payments documentation page. SUPERSEDED BY ENTRY 7 BELOW, 2026-07-29.

`https://stake-engine.com/docs/payments`. Named here so the docs-refresh pass fetches it
rather than discovering it late.

**STRUCK 2026-07-29. This entry said NOT YET MIRRORED and was already false when written.**
The page was mirrored to `docs/stake-engine-live/2026-07-25/payments.md` in commit `b440145`
at 17:22 on 2026-07-25, **thirty four minutes after** commit `d1b5b83` wrote this line at
16:48 the same day. Entry 7 below records the mirror correctly. The two entries then sat
thirteen lines apart contradicting each other for four days.

Kept rather than deleted, because the failure is the useful part: **entry 7 was added without
striking entry 5**, and a document that contradicts itself is worse than one that is merely
stale, since a reader has no way to tell which half to trust. The cost was real and
measurable: this stale line was carried forward into
`reports/briefs/FS_SESSION2_AUDIT_ONE_Prompt.md` as a VERIFIED premise, instructing a session
to treat the payments page as a known corpus gap and to name it as missing. It is not
missing. **When adding an entry that resolves an earlier one, strike the earlier one in the
same edit.**

### 6. Roadmap, recorded for awareness rather than action.

Additional operators beyond Stake; more games taken through regulation; a **minor rebrand
away from Stake-specific branding**; stateful games deferred. The rebrand item is worth
watching: our compliance rule is already that no Stake branding appears in any shipped
asset or string, so a platform-side rebrand does not create work for us, and that is worth
knowing in advance rather than discovering it.

### 7. Payments page. MIRRORED 2026-07-25, no build work owed.

Captured at `docs/stake-engine-live/2026-07-25/payments.md`. Commercial terms only: two
models, 10% of actual GGR with an indefinite carry-forward debt, or 7.5% of expected GGR
with no debt and no upside from variance. Quoted: **"GGR = Total Bets − Total Wins Paid to
Players"**, and **"You never pay Stake money out of pocket."** It places no obligation on
the code, the maths package or the submission artefacts. Owner decision, recorded rather
than recommended.

### 8. Stake Dev Tool 2.0 cloud. REJECTED (Fable ruling, 2026-07-25b). Custody rule stands.

The community tool's hosted cloud and share links are a **community-run server**, and the
standing custody rule is unchanged: **our frozen tables and books do not leave our custody
for any third party pre-release.** Every empirical question the cloud would answer is
answered identically by the OFFICIAL on-platform Developer Testing Tool during staging,
where uploading to Stake's own infrastructure is the entire point of the exercise.

**Self-hosting remains the only permitted mode** for the community tool, since a
`docker compose up` on our own machine never transfers custody.

This applies to all three open empirical questions: TR-012c SC placement, TR-035b
open-round semantics, and the CVaR definition. None of them is a reason to move the books.

**LESSON FOR THE REGISTER (Fable ruling, 2026-07-25).** Backups of pre-release game
internals are **private by default, verified at creation, not after**. The Drive folder
was not an intentional publication and was closed the same day it was raised, but it was
public for as long as it existed because nobody checked the setting when the copy was
made. Verification belongs at creation time, where it costs one look, rather than at
discovery time, where it costs an exposure window of unknown length.

**ANTELITE TAIL CONCENTRATION, ACCEPTED BY DESIGN (Fable ruling, 2026-07-28).**
Review 1 computed that antelite's largest 1% of weighted probability mass supplies about
75.4% of its RTP, and flagged it for commercial scrutiny. Ruled accepted by design, no
maths change: it passes every platform gate (ETL 0.6654 against a 0.9 3-star limit and
0.8 at 2-star); the tail weighting **is** the OVERBOOST product promise, since an ante
paid for boosted feature access rides the feature tail by construction; post-approval
lockdown would make any change permanent in the wrong direction; and the player-facing
disclosures already carry the truth (per-spin cost, RTP, max win are all displayed).

**Recorded here rather than in the PAR sheet. RESOLVED 2026-07-28: this is now the
permanent location, not a temporary one.**

The ruling asked for a commercial-notes line in
`games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md`. That path is inside the
`Edit/Write(games/future_spinner/**)` deny rules, and convention (e) requires a
sanctioning brief to name the exact deny lines to lift. The ruling did not name them, and
routing around a deny via Bash is explicitly forbidden, so the edit was not made and the
blocker was named rather than worked around.

**Owner decision: leave it here.** The reasoning, recorded so it is not revisited:
lifting the lock on the shipped maths package to relocate a note that already exists,
dated and findable, is more risk than the tidiness is worth. `COMPLIANCE_WATCH.md` is
the compliance register and a reasonable home for a commercial-design note. If the PAR is
ever opened for a substantive reason under a properly sanctioned pass, the note can move
then as a free rider. **No lock lift is being sought for this.**

---

## LIVE OBSERVATION DELTA, 2026-07-27 (what the portal itself has now shown us)

Added by the round-three prep session. Everything below is an observation from a live
portal or ACP session with a committed capture, not a docs read. Where it corrects an
earlier section of this file, the earlier section is left in place and the correction is
recorded here, so the history stays honest.

### 1. Bet Replay: the posture bullet is superseded, in our favour

The "Current posture" bullet says event IDs are captured on the deployed staging build per
`docs/REVIEW_EVENTS_PLAN.md`, and lists buy-tier cost display as Stage 2.

**Both are now overtaken by what the platform actually provides.** The platform's own Bets
panel exposes the Event ID on every row with a per-row "Replay this bet" button, which
removes the guesswork in `REPLAY_TEST_EVENTS.md` and largely settles the DTT replay check.
And Bet Replay is **confirmed working live** on a `super` buy-tier wincap round through to
its celebration and PLAY AGAIN (`SUBMISSION_DOSSIER.md` section 9a, TR-076).

**One open defect on that surface**, so this is not recorded as unqualified compliance:
ledger row SA-022 found player money rendered by `.toFixed(2)` in the replay win pod, so a
large win read `3750000.00` with no separators and no currency symbol. **Fixed at source
2026-07-27** (`docs/QUALITY_CHARTER.md` Q-11) and awaiting a live re-capture.
**THE AWAITED RE-CAPTURE IS MOOT, recorded 2026-08-15 by R071 TASK 8: the surface no longer
exists.** The pod was deleted by R058 TASK 2 on 2026-08-13 under the owner's design ruling,
and `ReplayMode.svelte` records in place of the mount that its fixed WIN window was removed
rather than fitted, citing the owner's own truncated-amount capture. **A row awaiting a
capture of a deleted component cannot be closed by capturing anything**, which is why this
is recorded as moot rather than left open indefinitely.

### 2. The CVaR open question has an answer on file

The open question recorded earlier in this file is genuinely ambiguous on three axes, and
the resolution path adopted was procedural: read the platform's own figure at the ACP
pre-review gate.

**That gate has now been run.** The ACP Math Distribution and Summary screen displays:

```
Risk Limit (CVaR)    205.710     2 Star limit 700.000     3 Star limit 800.000
```

(`reports/qa/dtt_live_session_2026-07-26.md`, frames
`reports/screens/dtt-live-2026-07-26/15_maths_overall_bet_level_compliance_all_pass.png`
onward.)

**What this resolves and what it does not.** It resolves the which-limit-and-which-value
half: the platform computes one figure from our uploaded tables and it passes at both
tiers with margin. It does not settle the quantile definition question in the abstract, and
it does not need to: the platform's own computation is the one that decides approval.
Recorded as RESOLVED IN PRACTICE rather than closed as a definition.

### 3. A limit disagreement, RAISED not silently corrected

**Two first-party sources disagree on the 2-star Maximum Exposure limit.**

**THE DISAGREEMENT NO LONGER EXISTS: the platform republished the table to agree with its
own ACP. VERIFIED 2026-08-15 by direct read of the dated mirror**, where the math
verification page now prints Maximum Exposure at $15,000,000 and $50,000,000. The
`$10,000,000` figure in this file's own earlier table is the superseded capture. **The
record below stands as written**, because a platform that changed its published limits is
exactly the thing a compliance watch exists to notice, and deleting the disagreement would
delete the evidence that it moved.

| Source | 2-star Maximum Exposure |
|---|---|
| The published limits table, recorded earlier in this file | `$10,000,000` |
| The platform's own ACP Math screen, read live 2026-07-26 | `15,000,000.0` |

Per convention (l.6) this is parked with its options rather than resolved by picking one.
Both readings pass comfortably for us (our figures are 1,000,000.0 and 5,000,000.0), so
nothing is at risk either way, and that is exactly why it is safe to leave open and wrong
to quietly overwrite. `SUBMISSION_DOSSIER.md` section 5f step 6 says the platform's figures
are definitive where they disagree with ours, which points at 15,000,000.0; but the
published table is what a reviewer would cite. **Owner and Fable item.**

### 4. The Developer Testing Tool has been used, repeatedly

The "Process reminders" section reads as though the DTT is a future step. It is not: the
game is published, the owner has run at least four live portal sessions, and the DTT
evidence set is committed at `reports/screens/dtt-live-2026-07-26/` with the session
transcribed at `reports/qa/dtt_live_session_2026-07-26.md`. The reminder is kept because it
is still the right sequence for the NEXT version, not because the step is outstanding.

### 5. Every bet-level constraint, as the platform itself displays it

Recorded here so the compliance position rests on the platform's own arithmetic and not
only on ours. Our figures and the platform's were computed from the same uploaded tables by
different code, so this is confirmation of the upload rather than independent corroboration
of the maths, and it is stated that way per convention (l.4).

| Constraint | Ours, as displayed | 2 Star | 3 Star |
|---|---|---|---|
| Max Exposure | 1,000,000.0 / 5,000,000.0 | 15,000,000.0 | 50,000,000.0 |
| Max Payout Multiplier | 5,000.0 | 25,000.0 | 100,000.0 |
| Max Bet Cost | 80,000.0 / 400,000.0 | 100,000.0 | 500,000.0 |
| Cost Multiplier | 400.0 | 1,000.0 | 1,500.0 |
| Base Volatility (Std Dev) | 17.3 | 0.6 to 50.0 | 0.6 to 60.0 |
| Tail Probability (5,000x) | 0.003 | 0.010 | 0.010 |
| Tail Probability (10,000x) | 0 | 0.002 | 0.005 |
| Risk Limit (CVaR) | 205.710 | 700.000 | 800.000 |
| ETL (40x) | 0.641 | 0.800 | 0.900 |
| ETL (10,000x) | 0 | 0.600 | 0.800 |
| ETL (Sum) | 0.641 | 1.300 | 1.500 |

All five modes COMPLIANT, all at 96.35%, all 5,000x max win, BASE 6 of 6 with cross-mode
RTP variance 0.00%.

---

## DOCS WATCH, 2026-07-29: the first COMPLETE capture, and two real deltas

Convention (d) run as JOB 1a of `reports/briefs/FS_SESSION2_AUDIT_ONE_Prompt.md`. Full note
at `docs/stake-engine-live/2026-07-29/DELTA_NOTES.md`.

**64 pages, all 64 rendered**, being every page the live docs navigation exposes. The
repository previously held four PARTIAL captures totalling 603 prose lines across 8 files with
newest content dated 2026-07-04. Committed at `docs/stake-engine-live/2026-07-29/`.

**The capture selector is `document.querySelector('main')`, and this matters.** A first pass
read `document.body.innerText` and every overlapping page came back larger by a near identical
+1020 characters. That was the navigation sidebar, not content. Reading `main` returns 872
characters for `general-disclaimer`, **byte identical to the 2026-07-04 capture**, and eight of
the ten overlapping approval-guidelines pages match on sha256 across two different sessions
running two different scripts. That is corroboration with genuinely independent inputs per
convention (l.4), and it is what licenses the two differences below to be read as real.

### Delta 1. `math-verification`: a NEW file size restriction, and 3-star exposure doubled

Quoted verbatim:

> In order to limit RGS instability caused by large file downloads:
>
> No single events file (.jsonl.zst) can exceed 4.2GB
> No game mode can contain more than 10,000,000 events
>
> Files/modes exceeding this size will fail on publish.

**COMPLIANT on both, measured rather than assumed:**

| Limit | Published | Ours | Margin |
|---|---|---|---|
| Single events file | 4.2GB | **146MB**, largest of the five | about 29x under |
| Events per mode | 10,000,000 | **100,000 rows**, every mode | 100x under |

The 10,000,000 figure is section 3 of the 2026-07-25 platform delta above, relayed from
Discord and already verified compliant. What is new is that it now appears in the **official
documentation**, and that it appears beside a file size cap this file HAD already recorded:
  corrected 2026-07-31, the 4.2GB limit was mirrored to
  `docs/stake-engine-live/2026-07-25/math-verification.md` in commit `25bc4d5` on 2026-07-25
  and written into the 2026-07-25 entry above on the same day.

**3-star Maximum Exposure moved from `$25,000,000` to `$50,000,000`.** Payout multiplier
(`100,000x`) and bet cost (`$500,000`) unchanged; the 2-star tier unchanged at `$10,000,000`.
A raised ceiling owes no build work; recorded so any submission-facing number is the current one.

### Delta 2. `rgs-communication`: 13 new currencies, and XEC SETTLES THE OPEN CONTRADICTION

Added: PKR, EGP, NZD, BOB, GHS, KES, MAD, BAM, ISK, TZS, UGX, XOF and **XEC**.

Section 2 of the 2026-07-25 platform delta above is headed *"CONTRADICTION: SC display format.
NEEDS A RULING, affects XSC as well as XEC."* The platform currency reference now carries both
rows. Quoted verbatim, tab separated as upstream renders them:

```
Stake Cash	XSC	SC	10.00 SC
Stake Euro Cash	XEC	SC	10.00 SC
```

**Both TRAILING.** We ship trailing, `1,000.00 SC`, under Fable ruling 2 of 2026-07-26, which
rested on the currency reference documenting `symbolAfter: true` and on the official
`StakeEngine/ts-client` SDK (`XSC: { symbol: 'SC', decimals: 2, symbolAfter: true }`). The
Discord announcement's *"displayed using the SC format (e.g. SC 1,000)"*, which is leading and
which created the contradiction, is now contradicted by the platform's own current documentation
for both currencies.

**A third independent first-party source, agreeing with what we ship.** Recorded as evidence
for the ruling and NOT as the ruling: convention (l.8) leaves a player-money display question
with the owner and Fable. What the builder can state is that this capture indicates no change
to shipped behaviour. Carried into `reports/FABLE_COMMS.md` for closure.

### What did not change, and one page that no longer exists

Eight of ten overlapping pages byte identical on sha256: `approval-guidelines`,
`front-end-communication`, `game-quality-rankings`, `game-replay-requirements`,
`game-tile-requirements`, `general-disclaimer`, `jurisdiction-requirements`,
`submission-checklist`. The RTP band is among them and is unchanged, quoted with the platform's
own en dash: *"The calculated Return to Player (RTP) must be within 90.0%–96.70%. For multiple
modes, all must fall within a 0.5% variation"*. Future Spinner is 96.35% in all five modes, so
the 0.5% cross-mode clause is satisfied by construction at 0.00% spread.

**The `changelog` slug is gone.** It resolved to `https://stake-engine.com/docs/updates`, absent
from the current navigation. Its 2026-07-04 capture was already 88 characters and already
recorded `looks_real: false`, so nothing was lost, but it should not be carried forward as a
live page.

**Not captured, named so silence is not read as coverage:**
`https://stake-engine.com/docs-content/distribution_optimization.pdf`, linked from the docs
navigation, is a binary rather than a rendered page.

### The 35 maths SDK pages are captured but OUT OF SCOPE

They carry 161 of the corpus's 466 candidate normative statements. Excluded from the
requirements register per `docs/skills/FULL_AUDIT_METHOD.md` section 5: the maths package is
locked and wants its own audit pass with its own sanction. Captured and committed regardless, so
that pass does not begin by re-fetching them.

## 2026-08-11 (R046 TASK 1, round 4 mirror refresh)

All 64 pages of the 2026-08-10 set re-rendered by the same method (headless
chromium, `querySelector('main').innerText`, sha256 over the extracted text;
direct transport from the owner's machine this pass, no proxy). **Zero
deltas: every page's extracted text is sha-identical to the 2026-08-10
capture.** No STOP arises; nothing shipped is touched by an unchanged docs
surface. The dated set and manifest are committed at
`docs/stake-engine-live/2026-08-11/`, each page marked
`changed_since_2026_08_10: false` in its manifest row, so the next refresh
diffs against today without re-deriving anything.
