<!-- Stake Engine docs snapshot, convention (d) docs watch -->
- topic: approval_guidelines_math_verification
- resolved_url: https://stake-engine.com/docs/approval-guidelines/math-verification
- fetched: 2026-08-11
- rendered_via: headless chromium (Playwright), document.querySelector('main').innerText, direct transport from the owner's machine.

---
Math Verification
Betlevel templates

Depending on exposure and cost-limits, different bet-level templates will be applied to your game. These templates define the minimum, maximum and default bet sizes for all currencies. A bet will be rejected by the RGS if either of the following condititons are true:

The total bet cost exceedes $500,000 USD (or equivialent amount in a different currency)
The potential payout from a single bet exceedes $50,000,000 USD (or equivialent amount in a different currency)

Any bet size beyond this limit will return error code: 400 ("invalid bet amount").

Bet-level templates define the underlying base bet amount and range from a maximum of $1 USD to $1000 USD. The bet template assigned to your game will depend on factors such as: maximum cost multipler, maximum payout amopunt, game volatilty/operator risk (discussed below).

File Size Restrictions

In order to limit RGS instability caused by large file downloads:

No single events file (.jsonl.zst) can exceed 4.2GB
No game mode can contain more than 10,000,000 events

Files/modes exceeding this size will fail on publish.

Summary statistics and hit-rate tables will be analyzed to ensure the game adheres to industry standards for chance-based casino games and is not misleading.

Summary Statistics
Verify the mode cost is correctly represented in the game rules for each mode.
The calculated Return to Player (RTP) must be within 90.0%–96.70%. For multiple modes, all must fall within a 0.5% variation (e.g. a base game at 96.0% RTP requires other modes to be between 95.5% and 96.5%).
Ensure the maximum win amount matches the description in the game rules for each mode.
The maximum win should be realistically obtainable (typically more frequent than 1 in 10,000,000, depending on payout amount).
For slot-type games, run 100,000–1,000,000 simulations to ensure sufficient outcome diversity and avoid repeated results in a single session.
A reasonable portion of simulations should yield paying results (e.g., 90,000 non-paying results out of 100,000 may be grounds for rejection).
The hit-rate of the most likely single simulation should not be overwhelmingly dominant if there is a visual expectation that results are sufficiently varied.
Critical Tests

Every game must pass all of the checks below before it can be submitted for review.

Test	Requirement
Base mode	The game must include a base mode with a 1.0× cost multiplier, and it must be the cheapest mode.
Base volatility	The base (1.0×) mode’s standard deviation must be ≥ 0.6.
RTP band	Every mode’s RTP must sit between 90.0% and 96.7%.
Cross-mode RTP	RTP may vary by at most 0.5% across modes (e.g. a 96.0% base game requires every other mode to be 95.5%–96.5%).
Max payout multiplier	No mode’s maximum win may exceed 500,000×.
Max cost multiplier	No mode’s cost multiplier may exceed 2,000×.
Non-zero hit rate	Every mode must land a non-zero win at least once in every 50 spins (i.e. no rarer than 1 in 50).
Viable bet level	At least one bet-level template must fit within the game’s limits. In practice this only fails when another critical limit is breached, or when nearly every non-critical check fails (see below).
Non-Critical Tests

Non-critical tests control operator risk. Unlike critical tests, failing them does not block submission — instead your game’s maximum exposure and maximum bet cost are reduced. Those two caps decide the largest bet-level template your game can be assigned, so the more checks you fail, the smaller the bets your game will accept (and in the worst case, no template qualifies at all).

Every game is measured against two rating tiers, 2-Star and 3-Star. The 3-Star tier is more lenient, so a game that no longer qualifies at 2-Star may still qualify at 3-Star with a lower cap.

Limits per rating
Check	2-Star	3-Star
Maximum Exposure	$15,000,000	$50,000,000
Maximum Bet Cost	$100,000	$500,000
Maximum Payout Multiplier	50,000×	100,000×
Maximum Cost Multiplier	1,000×	2,000×
Maximum Base Std Dev	50.0	60.0
Risk Limit — CVaR (per-stake)	700	700
Risk Limit — CVaR (absolute)	20,000	50,000
Tail Probability — P(≥ 5,000×)	0.010	0.050
Tail Probability — P(≥ 10,000×)	0.005	0.010
Expected Tail Liability (> 40×)	0.8	0.9
Expected Tail Liability (> 10,000×)	0.6	0.8
Expected Tail Liability (sum)	1.3	1.5

Maximum Exposure and Maximum Bet Cost are the starting caps, before any penalty. Every other check in the table is a check that, when failed, reduces those two caps.

How failures are grouped

Closely-related checks are collapsed into a single failure class, so failing several checks that measure the same underlying thing only counts once:

Class	Checks it covers
Maximum Payout Multiplier	maximum payout
Cost Multiplier	maximum cost multiplier
Base Volatility (Std Dev)	maximum base std dev
Risk Limit (CVaR)	per-stake CVaR and absolute CVaR
Expected Tail Liability	ETL > 40×, ETL > 10,000×, and the ETL sum
Tail Probability	P(≥ 5,000×) and P(≥ 10,000×)

For example, exceeding both P(≥ 5,000×) and P(≥ 10,000×) counts as a single failure (the Tail Probability class), not two. A class counts once no matter how many modes trip it. There are six classes in total, so six is the maximum possible number of failures.

Penalty schedule

The number of failed classes sets the reduced exposure and bet-cost caps, per rating:

2-Star

Failed classes	Maximum Exposure	Maximum Bet Cost
0–1	$15,000,000	$100,000
2	$10,000,000	$50,000
3	$5,000,000	$50,000
4	$1,000,000	$10,000
5	$500,000	$10,000
6	$100,000	$5,000

3-Star

Failed classes	Maximum Exposure	Maximum Bet Cost
0	$50,000,000	$500,000
1	$25,000,000	$500,000
2	$15,000,000	$250,000
3	$10,000,000	$100,000
4	$5,000,000	$50,000
5	$1,000,000	$10,000
6	$500,000	$10,000

A bet-level template is valid for a rating only if both of the following hold against that rating’s reduced caps:

worst-case payout — maximum payout multiplier × maximum bet — stays within the Maximum Exposure cap, and
worst-case round cost — maximum cost multiplier × maximum bet — stays within the Maximum Bet Cost cap.

If no template fits — for example a very high max-win game whose smallest allowed bet already breaches the reduced exposure cap — the game shows “no valid template” for that rating.

Check definitions

Tail Probability — P(≥ 5,000×) and P(≥ 10,000×) The probability that a single round pays 5,000× or 10,000× the stake or more. The worst-case (highest) value across all modes is compared against the limit. These are raw probabilities and are not scaled by cost multiplier.

Risk Limit — CVaR (Conditional Value at Risk) Also known as Expected Shortfall, this answers: “what is the expected payout to the operator when a win lands in the worst 0.1% of outcomes?” Two values are checked:

Per-stake (normalized) — CVaR ÷ cost multiplier, i.e. the expected worst-case payout relative to the bet. Limit: 700 for both ratings.
Absolute — the un-normalized expected payout amount. Limit: 20,000 (2-Star) / 50,000 (3-Star).

Expected Tail Liability (ETL) The share of a mode’s RTP that comes from heavy-tail wins, normalized by cost multiplier. ETL > 40× covers wins above 40× the cost multiplier, ETL > 10,000× covers wins above 10,000×, and the sum combines the two. An ETL of 0.5 means half of the mode’s total RTP comes from these large, infrequent wins — a sign of high tail-risk concentration for operators.

Other Considerations
The hit-rate of non-zero wins should align with industry standards (no rarer than 1 in 50 bets, or more frequent).
For base (1.0× cost) modes, the standard deviation should sit within industry norms to give reasonable volatility for slot-type games.
Zero-weight payouts should not dominate the provided simulations — list the number of non-zero-weight payouts.
Inspect win-range hit-rates for gaps where expected win amounts are unobtainable (e.g. intermediate wins should exist between small payouts and the maximum win).

The maximum bet accepted by the RGS is $500,000 USD (or the equivalent in another currency). Any bet beyond this limit returns error code: 400 ("invalid bet amount").
