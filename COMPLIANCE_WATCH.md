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
- **Original IP:** verified. Original designs, produced in-house from vector masters.
  No pre-purchased or third-party licensed content.
- **No Stake branding:** verified. No Stake trademark or themes in any shipped asset or text.
- **No underage appeal:** verified. No child or child-like characters.
- **Social/jurisdiction:** social mode present; prohibited-term overrides applied for
  stake.us (`social=true`). See `docs/stake-engine-live/jurisdiction-requirements.md`.
  Feature-buy disclosure: the `disabledBuyFeature` jurisdiction flag must hide the bonus buy
  (Stage 2 frontend scope).
- **Bet Replay:** implemented and mandatory-compliant; player session not required. Event
  IDs are captured on the deployed staging build per `docs/REVIEW_EVENTS_PLAN.md` during the
  SUBMISSION_DOSSIER.md section 5 protocol. Stage 2: bonus-buy replays must display the amount
  spent including the 100x cost multiplier.

## Process reminders

- **Portal Developer Testing Tool:** to be used after uploading the bundle to the Stake
  Engine portal, before requesting review (authenticate, play, end-round against staging).
- **Upcoming platform features to track:** provably fair, and stateful games. Neither is
  required for our current stateless submission; note for future roadmap only.

## Watch log

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
  appeal; a short promotional blurb must accompany the submission (we have `PROMO_BLURB.md`).
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
capped at 5,000x, all 96.3500% RTP (see `HANDOVER_2026-07-07_Fable.md` for the full
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
  `isAutoPlay.set(true)` has exactly two call sites in the whole codebase, both inside
  `startAuto(count)` in `ControlBar.svelte:57-63` and its `HudOverlay.svelte` duplicate,
  each only reachable via two explicit clicks (open the autoplay menu, then click a
  specific spin-count option). Never called on mount, from restored state, or from a URL
  param.
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
    times, 1s apart. **Gap found:** `endRound()` is called directly (`rgsService.ts:473`),
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
  - **Resume-after-refresh / replay:** **gap confirmed, not new but re-verified today** -
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
