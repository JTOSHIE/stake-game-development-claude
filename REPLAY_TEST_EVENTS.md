# Future Spinner - Replay Test Event IDs

**Game:** Future Spinner  **Studio:** We Roll Spinners

The Stake Engine bet-replay review requests event IDs covering, **in every bet mode**:
normal win, big win, win cap (max win), loss (zero payout), and bonus-round trigger
(where applicable). This maps each scenario to (a) a representative **real event ID**
derived from our published lookup tables, and (b) a **local reproduction** via the dev
mock. Australian English, no em dashes or en dashes.

Two bet modes ship: **base** (cost 1.0x) and **bonus** buy (cost 100.0x). (Supersedes the
earlier single-mode scaffold - the game now ships the Overdrive Free Spins feature and a
100x bonus buy per the Option C decision.)

## Representative real event IDs (from the shipped lookup tables)

Derived from `games/future_spinner/library/publish_files/lookUpTable_<mode>_0.csv`
(`sim_id,weight,payout×100`; 100,000 sims per mode; max payout 500000 = 5,000x). These are
the event IDs to hand the reviewer for the current math version.

| Scenario | BASE event | BONUS event | Notes |
|----------|------------|-------------|-------|
| Normal win | **0** (~3.90x) | **130** | modest 1x-10x win |
| Big win | **1** (~363.89x) | **0** (~16.2x) | 50x-500x band; pick a larger sim if a bigger hit is wanted |
| Win cap (5,000x) | **1020** | **124** | payout column == 500000 |
| Loss (zero payout) | **5** | *none* | bonus buy guarantees a trigger, so it has **no zero-payout outcome** - tell the reviewer |
| Bonus trigger | *see method* | n/a | bonus mode **is** the feature |

**Finding a base bonus-trigger event ID:** a trigger is defined by the event **book**, not the
payout column, so scan `books_base.jsonl.zst` for a round whose events include the free-spins
trigger (3+ scatters), or use a tool that auto-buckets by feature (mnemoo LUT analyzer books-log,
or stake-dev-tool bet-stats). The curated local trigger samples (below) are the stand-in until a
real trigger sim ID is pinned on staging.

**Caveats:**
- `sim_id` is 0-based; math-sdk writes `library[sim+1] = Book(sim)`, so the deployed RGS event
  ID may be offset by 1 - **verify each ID against the staging build** and adjust if the replay
  loads the neighbouring round.
- These IDs are tied to the current math version; re-derive if the math package changes.

## Replay URL template

```
https://werollspinners.live.stake-engine.com/future-spinner/v1/?replay=true&game={GAME_UUID}&version=1&mode={BASE|BONUS}&event={EVENT_ID}&currency=USD&amount=1000000&lang=en&rgs_url=rgs.stake-engine.com
```

The game fetches `GET {rgs_url}/bet/replay/{game}/{version}/{mode}/{event}`; our
`replayService.ts` / `ReplayMode.svelte` implement this (verified compliant against
`docs/stake-engine-live/game-replay-requirements.md`).

## Local reproduction (dev mock, no deployment)

| Scenario | Base (dev) | Bonus (dev) |
|----------|------------|-------------|
| Loss | `?mockCategory=base_loss` | n/a |
| Normal win | `?mockCategory=base_win_small` / `base_win_mid` | `?mockCategory=bonus_win_small` (bonus buy) |
| Big win | `?mockCategory=base_win_large` | `?mockCategory=bonus_win_large` |
| Win cap | `?mockCategory=wincap` | `?mockCategory=wincap` (bonus buy) |
| Bonus trigger | `?mockCategory=trigger_3` / `trigger_4` / `trigger_5` | inherent (bonus buy) |
| Retrigger / high meter | `?mockCategory=retrigger` / `high_meter` | `?mockCategory=retrigger` / `high_meter` |

## Populate + review checklist

1. Deploy to Stake Engine staging; confirm each event ID above resolves to the intended round
   (adjust for the possible +1 offset).
2. Provide the verified event-ID table for **each** bet mode to the reviewer.
3. Confirm: max-win (5,000x) replays and dwells; base loss (event 5) shows a clean zero round;
   a base bonus-trigger event plays the full Overdrive free-spins sequence; replay UI hides
   balance/bet/autoplay, disables betting, makes no session calls, and offers Play / Play Again.
