# Future Spinner - Replay Test Event IDs

**Game:** Future Spinner  **Studio:** We Roll Spinners

The Stake Engine bet-replay review requests event IDs covering, **in every bet mode**:
normal win, big win, win cap (max win), loss (zero payout), and bonus-round trigger
(where applicable). This maps each scenario to (a) a representative **real event ID**
derived from our published lookup tables, and (b) a **local reproduction** via the dev
mock. Australian English, no em dashes or en dashes.

Five bet modes ship (FeatureMath v2, 2026-07-07): **base**/Normal (1.0x), **cruise**/Cruise
(1.0x), **antelite**/OVERBOOST (1.25x, ante-style toggle debited every spin while ON),
**bonus**/Buy Overdrive (100.0x) and **super**/NITRO OVERDRIVE (400.0x, guaranteed trigger
with the Overdrive meter pre-revved to 5x). (Supersedes the earlier single- and two-mode
scaffolds.)

## Representative real event IDs (from the shipped lookup tables)

Derived from `games/future_spinner/library/publish_files/lookUpTable_<mode>_0.csv`
(`sim_id,weight,payout×100`; 100,000 sims per mode; max payout 500000 = 5,000x), cross-
checked against the shipped `books_<mode>.jsonl.zst` for the trigger rows (a trigger is
defined by the event book, not the payout column alone). These are the event IDs to hand
the reviewer for the current math version.

| Scenario | BASE | CRUISE | ANTELITE | BONUS | SUPER | Notes |
|----------|------|--------|----------|-------|-------|-------|
| Normal win | **0** (~3.90x) | **0** (~3.90x) | **0** (~3.90x) | **130** | **1484** (~7.70x) | modest 1x-10x win; super's own band is thin (only 93/100,000 sims land here) since a guaranteed trigger pushes most outcomes higher |
| Big win | **1** (~363.89x) | **11** (~182.55x) | **1** (~363.89x) | **0** (~16.2x) | **0** (~171.10x) | 50x-500x band |
| Win cap (5,000x) | **1020** | **1875** | **1020** | **124** | **11** | payout column == 500000 |
| Loss (zero payout) | **5** | **1** | **7** | *none* | *none* | bonus/super buy guarantee a trigger, so neither has a zero-payout outcome - tell the reviewer |
| Feature trigger | *see method* | **11** | **1** | n/a | n/a | bonus/super **are** the feature; cruise/antelite found by scanning their books for a `freeSpinTrigger` event (cruise sim 11 and antelite sim 1 happen to coincide with each mode's own Big Win row above - a genuine trigger-plus-big-win round, not an error) |

**Finding a base/cruise/antelite trigger event ID:** a trigger is defined by the event
**book**, not the payout column, so scan `books_<mode>.jsonl.zst` for a round whose events
include the free-spins trigger (3+ scatters), or use a tool that auto-buckets by feature
(mnemoo LUT analyzer books-log, or stake-dev-tool bet-stats). Cruise (sim 11) and antelite
(sim 1) above were found this way (`scripts/review_events_stateless_scan.py`'s sibling
candidate-search, run 2026-07-08). The curated local trigger samples (below) are the
stand-in for base until a real trigger sim ID is pinned on staging.

**Caveats:**
- `sim_id` is 0-based; math-sdk writes `library[sim+1] = Book(sim)`, so the deployed RGS event
  ID may be offset by 1 - **verify each ID against the staging build** and adjust if the replay
  loads the neighbouring round.
- These IDs are tied to the current math version; re-derive if the math package changes.
- Cruise/antelite/super event IDs (2026-07-08) were derived from books regenerated via
  `games/future_spinner/run.py` (run_sims only, no re-optimisation) and independently
  confirmed byte-identical (SHA-256) to the originally shipped, PAR-sheet-recorded
  `books_{cruise,antelite,super}.jsonl.zst` and their lookup tables - a pure reproduction,
  not a re-derivation of the maths.

## Replay URL template

```
https://werollspinners.live.stake-engine.com/future-spinner/v1/?replay=true&game={GAME_UUID}&version=1&mode={BASE|CRUISE|ANTELITE|BONUS|SUPER}&event={EVENT_ID}&currency=USD&amount=1000000&lang=en&rgs_url=rgs.stake-engine.com
```

The game fetches `GET {rgs_url}/bet/replay/{game}/{version}/{mode}/{event}`; our
`replayService.ts` / `ReplayMode.svelte` implement this (verified compliant against
`docs/stake-engine-live/game-replay-requirements.md`).

## Local reproduction (dev mock, no deployment)

| Scenario | Base (dev) | Cruise (dev) | Antelite (dev) | Bonus (dev) | Super (dev) |
|----------|------------|--------------|-----------------|-------------|-------------|
| Loss | `?mockCategory=base_loss` | n/a - no curated sample yet | n/a - no curated sample yet | n/a | n/a |
| Normal win | `?mockCategory=base_win_small` / `base_win_mid` | n/a - no curated sample yet | n/a - no curated sample yet | `?mockCategory=bonus_win_small` (bonus buy) | n/a - no curated sample yet |
| Big win | `?mockCategory=base_win_large` | n/a - no curated sample yet | n/a - no curated sample yet | `?mockCategory=bonus_win_large` | n/a - no curated sample yet |
| Win cap | `?mockCategory=wincap` | n/a - no curated sample yet | n/a - no curated sample yet | `?mockCategory=wincap` (bonus buy) | n/a - no curated sample yet |
| Bonus trigger | `?mockCategory=trigger_3` / `trigger_4` / `trigger_5` | n/a - no curated sample yet | n/a - no curated sample yet | inherent (bonus buy) | inherent (super buy) |
| Retrigger / high meter | `?mockCategory=retrigger` / `high_meter` | n/a - no curated sample yet | n/a - no curated sample yet | `?mockCategory=retrigger` / `high_meter` | n/a - no curated sample yet |

Cruise/antelite/super have no curated entries in `sample_rounds.json` yet (a known,
previously-flagged limitation - see `games/future_spinner_collect/COLLECT_PROTOTYPE_FINDINGS.md`
for the same pattern noted elsewhere); in dev/mock mode these three modes correctly price
and label their spins but fall back to `_mockSpin`'s generic random board rather than a
curated feature demo. This does not affect the real RGS replay path above, which is
per-mode from the actual shipped books regardless of what the local dev mock curates.

## Populate + review checklist

1. Deploy to Stake Engine staging; confirm each event ID above resolves to the intended round
   (adjust for the possible +1 offset).
2. Provide the verified event-ID table for **each of the five** bet modes to the reviewer.
3. Confirm: max-win (5,000x) replays and dwells in every mode; base loss (event 5) shows a
   clean zero round; a trigger event plays the full Overdrive free-spins sequence
   (including NITRO OVERDRIVE's meter starting visibly at 5x, not 1x); replay UI hides
   balance/bet/autoplay, disables betting, makes no session calls, and offers Play / Play Again.
