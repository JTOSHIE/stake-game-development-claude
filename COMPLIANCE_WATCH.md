# COMPLIANCE WATCH

Living record of Stake Engine compliance posture for Future Spinner, and a log of
differences found when the live docs are refreshed into `docs/stake-engine-live/`.
Australian English, no em dashes or en dashes.

## Current posture (build verified against current requirements)

- **Stateless:** verified. Three bet modes (base 1.0x, ante / Double-Chance 1.5x, bonus buy
  100.0x); the Overdrive Free Spins feature resolves inside one book round. No jackpot, gamble,
  continuation or early cashout. Matches the approval-guidelines Key Restrictions (free spins
  and feature buys are permitted; jackpots/gamble/continuation are not).
- **Feature:** Overdrive Free Spins with a progressive multiplier, an ante / Double-Chance
  mode (1.5x, ~2x trigger rate) and a 100x bonus buy. All three modes stateless and capped at
  5,000x, all at 96.3500% RTP (cross-mode variation 0.0000%).
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

### 2026-07-05: built the full template mode library (11 modes)
Owner directed an exhaustive autonomous build of every compliant bet mode, since this first
game is a reusable template. Built and independently validated (`scripts/validate_math.py`,
ALL PASS) eleven modes, every one at 96.3500% RTP (cross-mode variation 0.0000%, within the
0.5% rule), stateless, sharing the 5,000x cap:
- **Standing modes:** cruise 1.0x (SD 11.10x), base 1.0x (17.28x), antelite 1.25x (20.31x),
  ante 1.5x (23.26x), volatile 1.0x (24.28x), superante 2.0x (26.41x).
- **Buy ladder:** minibuy 80x (SD 178x), bonus 100x (207x), superbuy 300x (407x),
  megabuy 500x (633x), hyperbuy 1000x (969x). All pass the cost-scaled tail-risk gate.
- **Finding:** the 5,000x cap does NOT limit the buy ladder (buys feasible to 1000x, the
  platform cost-multiplier ceiling). Documented in `docs/MASTER_TEMPLATE.md` + `MATH_DESIGN_SPACE.md`.
- All 1.0x-cost modes sit inside the operator-risk SD band (0.6-60). Each mode generated on
  its own so the others stay byte-identical; base/cruise/ante/bonus unchanged.
- Lock exception followed (deny lifted for the build, restored with verified-empty diff).
- Frontend selector for the library is a separate iterable pass; the shipped skin selects a subset.

### 2026-07-05: added a third bet mode (ante / Double-Chance)
Acted on the gap analysis "now-or-never" finding (bet modes lock at approval). Added a
third stateless mode, **ante / Double-Chance** (cost 1.5x, ~2x the free-spin trigger rate:
1 in 92.4 vs base 1 in 184.7), same reels/feature/5,000x cap as base. Generated ante-only so
the already-verified base/bonus books + replay event IDs stay byte-identical; base/bonus
lookup tables unchanged (git diff empty).
- **RTP:** 96.3500% all three modes, cross-mode variation 0.0000% (well within the 0.5% rule).
  All Stake star-tier risk gates pass in `scripts/validate_math.py` (ante SD 23.26x in band,
  wincap 1 in 66,667, P(>=5000x) 1.5e-05). PAR sheet updated (section 5B, three-mode
  declaration), `game_metadata.json` version 1.2.0 modes [base, ante, bonus].
- **Frontend:** Double Chance toggle (cyan, distinct from magenta Bonus Buy); sends 'ante'
  via the sanctioned `selectedBetMode` passthrough so the server applies the 1.5x cost; base/
  bonus behaviour unchanged. Paytable gains an ante rule line, social-scrubbed (no bet/pay/
  cost terms leak in social mode). Build + typecheck clean; proof in `reports/screens/ante/`.
- **Jurisdiction watch:** ante-style bets are restricted in some markets (like autoplay/turbo).
  No RGS flag consumed yet; gate the toggle behind a jurisdiction flag if one is exposed. The
  bonus-buy `disabledBuyFeature` gating is unaffected.
- **Lock discipline:** the two `games/future_spinner/**` deny lines were lifted for the build
  under the owner's sanction and restored before commit (git diff .claude/settings.json empty).

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
