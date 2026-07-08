# COMPLIANCE WATCH

Living record of Stake Engine compliance posture for Future Spinner, and a log of
differences found when the live docs are refreshed into `docs/stake-engine-live/`.
Australian English, no em dashes or en dashes.

## Current posture (build verified against current requirements)

- **Stateless:** verified. Two bet modes (base 1.0x, bonus buy 100.0x); the Overdrive Free
  Spins feature resolves inside one book round. No jackpot, gamble, continuation or early
  cashout. Matches the approval-guidelines Key Restrictions (free spins and feature buys are
  permitted; jackpots/gamble/continuation are not).
- **Feature:** Overdrive Free Spins with a progressive multiplier, plus a 100x bonus buy.
  Both modes stateless and capped at 5,000x, both at 96.3500% RTP.
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
