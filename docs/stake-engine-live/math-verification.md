<!-- Stake Engine live docs snapshot -->
- topic: math-verification
- resolved_url: https://stake-engine.com/docs/approval-guidelines/math-verification
- fetched: 2026-07-04
- rendered_via: headless Chrome (Playwright)
- content_sha256: 32e479e43c54153133754b167c60357a75c164776c06ce01e5a52c98c2734a6c
- content_chars: 4307
- looks_real: true

# math-verification

Math Verification

Summary statistics and hit-rate tables will be analyzed to ensure the game adheres to industry standards for chance-based casino games and is not misleading.

Summary Statistics
Verify the mode cost is correctly represented in the game rules for each mode.
The calculated Return to Player (RTP) must be within 90.0%–96.70%. For multiple modes, all must fall within a 0.5% variation (e.g., base game at 97% RTP requires other modes to be between 96.5% and 97.5%). - Ensure the maximum win amount matches the description in the game rules for each mode.
The maximum win must be realistically obtainable (typically more frequent than 1 in 10,000,000, depending on payout amount).
For slot-type games, run 100,000–1,000,000 simulations to ensure sufficient outcome diversity and avoid repeated results in a single session.
A reasonable portion of simulations should yield paying results (e.g., 90,000 non-paying results out of 100,000 may be grounds for rejection).
The hit-rate of the most likely single simulation should not be overwhelmingly dominant if there is a visual expectation that results are sufficiently varied.
Other Considerations
The hit-rate of non-zero wins should align with industry standards (<1 in 20 bets, or more frequent).
For “BASE” modes (1x cost), the standard deviation should be within industry norms to ensure reasonable volatility for slot-type games.
List the number of non-zero weight payouts. Zero-weight payouts should not dominate the provided simulations.
Inspect hit-rates for win-ranges to avoid gaps where expected win amounts are unobtainable (e.g., intermediate wins should exist between small payouts and the maximum payout amount).

In order to control operator risk, there are limits imposed surrounding bonus mode costs, exposure and large-win probabilities.

2-Star rated games:

Maximum Exposure: $10,000,000
Maximum Payout Multiplier: 25,000x
Maximum Bet Cost: $100,000
Maximum Cost Multiplier: 1,000x
Minimum Base (1.0x cost) Standard Deviation: 0.6
Maximum Base (1.0x cost) Standard Deviation: 50.0
P(>=5000) / P(>=10000): 1e-2 / 8e-2
Risk Limits (CVaR): 700
Liability (ETL, >40x Bet): 0.8
Liability (ETL, P(>10000)): 0.6

3-Star rated games:

Maximum Exposure: $25,000,000
Maximum Payout Multiplier: 100,000x
Maximum Bet Cost: $500,000
Maximum Cost Multiplier: 1,500x
Minimum Base (1.0x cost) Standard Deviation: 0.6
Maximum Base (1.0x cost) Standard Deviation: 60.0
P(>=5000) / P(>=10000): 1e-2 / 2e-2
Risk Limits (CVaR): 800
Liability (ETL, >40x Bet): 0.9
Liability (ETL, P(>10000)): 0.8

The maximum bet-size accepted by the RGS is $500,000 USD, any bet size beyond this limit will return error code: 400 ("invalid bet amount")

P(>=5000) / P(>=10000)

These are the maximum allowed cumulative probabilities of achieving a payout >=5000x and >=10000x respectively. The worst-case (highest) P(5000) and P(10000) values across all modes are used. For high-cost modes, the measured probability is scaled down before comparison against the limit:

Cost multiplier c >= 1000x: probability is scaled by 0.2
Cost multiplier 500 <= c < 1000: probability is scaled by 0.5
Cost multiplier 200 <= c < 500: probability is scaled by 0.8

This makes higher-cost modes more lenient, as their effective contribution to tail-risk is reduced relative to base bet.

CVaR (Conditional Value at Risk)

Also known as ‘Expected Shortfall’, this answers the question: “what is the expected payout to the operator when a win occurs in the worst 0.1% of outcomes?” Two values are considered: the normalized CVaR (CVaR / Bet-Cost), which represents the expected payout relative to the cost multiplier in the worst 0.1% of cases, and the un-normalized CVaR, which represents the absolute expected payout amount when such a rare event occurs.

ETL (Expected Tail Liability)

This measures the RTP contribution from heavy-tailed win-distributions to determine what proportion of total expected return is concentrated in wins >= 40× Cost-Multiplier (or >10,000x if not applicable). It indicates how much of the game’s RTP comes from infrequent large payouts rather than smaller, more frequent wins.

A normalized ETL value of 0.5 means that half of the game’s total RTP is derived from wins above the threshold — indicating high tail-risk concentration for operators.
