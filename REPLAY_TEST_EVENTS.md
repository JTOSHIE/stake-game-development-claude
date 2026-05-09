# Future Spinner — Replay Test Event IDs

**Game:** Future Spinner
**Studio:** We Roll Spinners
**Status:** SCAFFOLD — fill in after staging deployment

## How to populate

1. Deploy game to Stake Engine staging
2. Run rounds to produce each scenario below
3. Capture the event ID from each round (visible in the network tab on /wallet/play response, or in the round history)
4. Build the replay URL using the captured event ID
5. Test each replay URL — must show the correct round
6. Provide this completed file to the Stake Engine reviewer

## Test scenarios (per Stake Engine spec)

| Scenario       | Mode | Event ID  | Replay URL |
|----------------|------|-----------|------------|
| Normal win     | BASE | _pending_ | _pending_  |
| Big win        | BASE | _pending_ | _pending_  |
| Win cap (5000×)| BASE | _pending_ | _pending_  |
| Loss (zero)    | BASE | _pending_ | _pending_  |

## Replay URL template

```
https://werollspinners.live.stake-engine.com/future-spinner/v1/?replay=true&game={GAME_UUID}&version=1&mode=BASE&event={EVENT_ID}&currency=USD&amount=1000000&lang=en&rgs_url=rgs.stake-engine.com
```

## Notes

- "Bonus trigger" scenario does not apply — Future Spinner has no bonus mode (instant scatter multiplier only, stateless per Stake Engine requirements)
- All test rounds should be at the default bet level (1.00 USD = 1,000,000 micros)
- Win cap rounds are rare (1 in 100,000) — may need the Stake Engine team to seed a specific simulation for this
