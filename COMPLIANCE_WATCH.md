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
