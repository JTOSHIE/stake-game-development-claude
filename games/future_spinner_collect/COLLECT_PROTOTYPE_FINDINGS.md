# Collection Meter (coin-collect) — prototype findings

Prototype in a SIBLING package (`games/future_spinner_collect`), recovered from
the orphaned `claude/compliance-rg` branch. The locked shipped `games/future_spinner`
package was never touched - nothing here required or used a lock exception.

## The mechanic (see `README.md` for the full write-up)
A stateless Collection Meter layered on top of the Overdrive Free Spins engine:
the L3 low symbol doubles as a collect coin, carrying a random cash value
(0/1x/2x/5x/15x/50x total bet, weight-skewed heavily toward 0) only when it
lands during free spins. Every non-zero coin accumulates into an in-round pot,
paid out once at `end_freespin`. The pot resets to 0 in `reset_book`, so the
whole feature resolves inside one stateless book round - same statelessness
contract as the shipped Overdrive package.

## Independent validation (recomputed from the SHIPPED lookup tables in this
recovery pass, zero trust in the README's own numbers or the optimiser)

| mode | cost | RTP (recomputed, 10dp) | weighted SD | max win seen | hit rate | wincap odds |
|---|---|---|---|---|---|---|
| base  | 1.0x   | 96.3499998474% | 17.17x  | 5,000.00x | 29.1130% | 1 in 100,000 |
| bonus | 100.0x | 96.3499999943% | 214.37x | 5,000.00x | 100.0000% | 1 in 1,000 |

- Recomputed directly from `library/publish_files/lookUpTable_{base,bonus}_0.csv`
  as `sum(weight x payout) / sum(weight) / 100 / cost` (same method as
  `scripts/validate_math.py` uses for the shipped package) - **matches the
  README's stated table exactly**, to the last stated digit.
- Both modes round to **96.3500% at 4dp**, 0.0000pp cross-mode spread.
- Max payout seen in both 100,000-row tables is exactly 5,000.00x - the hard
  cap holds.

## What was NOT independently re-derived in this recovery pass
The README additionally claims the pot-accumulation mechanic is provably
stateless at the event level: "exactly one `collectPayout` per book" and "sum
of all coin values always equals the payout amount." That claim was originally
verified against the raw `books_{base,bonus}.jsonl.zst` files at generation
time - those files are gitignored (per the existing `**/library/**` precedent,
same as the shipped package) and were not part of this recovery, so this pass
did **not** regenerate them or re-derive that claim from scratch. The
lookup-table-level RTP/SD/hit-rate/wincap numbers above are independently
reproduced from committed data; the event-level statelessness claim is
inherited from the original prototype documentation, not re-verified here.
Regenerating the books (a full production-scale run through this package's
own runner, which needs a proper 2-mode `run.py` - the checked-in one is a
stale 11-mode scratch runner referencing modes this package doesn't define)
is the natural next step before this prototype is considered for a sanctioned
regen into the locked package, mirroring how `future_spinner_super` was
de-risked before FeatureMath v2 promoted it.

## Conclusion
The Collection Meter's headline maths (RTP, volatility, hit rate, win cap) are
independently confirmed from the shipped lookup tables and match the
prototype's own documentation exactly. It remains a sibling, not-for-release
experiment: recovered and validated at the table level only. A sanctioned
regen into the locked `games/future_spinner` package (like NITRO OVERDRIVE
before it) would additionally need the event-level statelessness re-proof
above, a ship name, and a fence review against the now five-mode shipped
package's cross-mode RTP band.
