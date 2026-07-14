#!/usr/bin/env python3
"""JOB 3b math self-audit: CVaR/ETL/win-range-gap analysis from the shipped
lookUpTable CSVs (games/future_spinner/library/publish_files/, read-only -
this script never writes to that locked directory).

Computes the two risk metrics stake-engine.com/docs/approval-guidelines/
math-verification defines but scripts/validate_math.py does not yet compute:
  - CVaR (normalized): expected payout, in "times cost" units, in the worst
    0.1% weighted tail of outcomes, divided by the mode's cost multiplier.
  - ETL (normalized): the fraction of total RTP contributed by wins >= 40x
    the cost multiplier - "what proportion of RTP comes from the heavy tail."
Also buckets payouts on a log-ish scale to flag any multiplier band with zero
observed outcomes (an "unobtainable win range" per the same page), and reports
the most-likely-single-outcome's weighted share (dominance check).

Run: python3 scripts/math_selfaudit_risk_metrics.py
"""
import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / "games/future_spinner/library/publish_files"

MODES = {
    "base": 1.0,
    "cruise": 1.0,
    "antelite": 1.25,
    "bonus": 100.0,
    "super": 400.0,
}

# Buy-tier modes (guaranteed-feature purchases) get bucketed in BET-MULTIPLE
# units (raw payout, never divided by cost) - see the 2026-07-14b correction
# below for why times-cost bucketing is wrong for these two specifically.
BUY_MODES = {"bonus", "super"}

BUCKETS = [0, 0.5, 1, 2, 5, 10, 20, 50, 100, 250, 500, 1000, 2500, 5000, 5001]


def analyse(mode: str, cost: float) -> dict:
    path = LIB / f"lookUpTable_{mode}_0.csv"
    rows = []
    total_weight = 0
    max_single_weight = 0
    with open(path) as f:
        for _, w, pay in csv.reader(f):
            w = int(w)
            payout = int(pay) / 100.0  # centibets -> bet multiple
            rows.append((payout, w))
            total_weight += w
            max_single_weight = max(max_single_weight, w)

    total_rtp_weighted = sum(p * w for p, w in rows)
    rtp = total_rtp_weighted / total_weight / cost

    # CVaR: worst 0.1% tail by payout, weighted.
    rows_sorted = sorted(rows, key=lambda r: r[0], reverse=True)
    tail_target = total_weight * 0.001
    tail_weight = 0.0
    tail_payout_weighted = 0.0
    for payout, w in rows_sorted:
        take = min(w, max(0, tail_target - tail_weight))
        if take <= 0:
            break
        tail_payout_weighted += payout * take
        tail_weight += take
        if tail_weight >= tail_target:
            break
    cvar_abs = tail_payout_weighted / tail_weight if tail_weight > 0 else 0.0
    cvar_norm = cvar_abs / cost

    # ETL: RTP contribution from wins >= 40x cost.
    threshold = 40 * cost
    etl_weighted = sum(p * w for p, w in rows if p >= threshold)
    etl_norm = etl_weighted / total_rtp_weighted if total_rtp_weighted > 0 else 0.0

    # Win-range gap scan + dominance check.
    #
    # 2026-07-14b correction: the original version of this scan bucketed
    # EVERY mode in "times cost" units uniformly. For a 1x-cost mode that is
    # the same thing as bet-multiple units (harmless), but for a high-cost
    # buy-tier mode it is wrong: the mode's own maximum achievable ratio is
    # cap/cost (5000/100 = 50x cost for bonus, 5000/400 = 12.5x cost for
    # super) - every bucket edge ABOVE that ratio is empty BY CONSTRUCTION,
    # not because of any real coverage gap, since the payout distribution
    # can never reach a "times cost" value the cap itself doesn't allow.
    # Reading that as a coverage gap was the bug. Buy-tier modes are now
    # bucketed in BET-MULTIPLE units instead (the raw payout column, never
    # divided by cost) - the real, actually-achievable 0-5000x range every
    # mode shares regardless of cost, which is what "intermediate wins
    # should exist" is actually asking about.
    is_buy = mode in BUY_MODES
    bucket_unit = "x bet" if is_buy else "x cost"
    bucket_weights = [0] * (len(BUCKETS) - 1)
    for payout, w in rows:
        normalized = payout if is_buy else payout / cost
        for i in range(len(BUCKETS) - 1):
            if BUCKETS[i] <= normalized < BUCKETS[i + 1]:
                bucket_weights[i] += w
                break
    empty_buckets = [
        f"[{BUCKETS[i]}-{BUCKETS[i+1]}){bucket_unit}"
        for i in range(len(bucket_weights))
        if bucket_weights[i] == 0
    ]
    covered_buckets = [
        f"[{BUCKETS[i]}-{BUCKETS[i+1]}){bucket_unit}: {bucket_weights[i]:,}"
        for i in range(len(bucket_weights))
    ]

    zero_weight = sum(w for p, w in rows if p == 0.0)

    return {
        "mode": mode,
        "cost": cost,
        "rtp": rtp,
        "cvar_abs_bet_units": cvar_abs,
        "cvar_normalized": cvar_norm,
        "etl_threshold_x_cost": threshold,
        "etl_normalized": etl_norm,
        "zero_payout_rate": zero_weight / total_weight,
        "unique_payouts": len(set(p for p, w in rows if w > 0)),
        "total_rows": len(rows),
        "most_likely_single_outcome_share": max_single_weight / total_weight,
        "empty_mid_range_buckets": empty_buckets,
        "bucket_unit": bucket_unit,
        "covered_buckets": covered_buckets,
    }


def main() -> None:
    print("=" * 78)
    print("Future Spinner - math self-audit risk metrics (CVaR / ETL / gap scan)")
    print("=" * 78)
    for mode, cost in MODES.items():
        r = analyse(mode, cost)
        print(f"\n[{mode}]  cost {cost}x")
        print(f"  RTP                          {r['rtp']*100:.6f}%")
        print(f"  CVaR (normalized, /cost)     {r['cvar_normalized']:.3f}")
        print(f"  CVaR (absolute, bet units)   {r['cvar_abs_bet_units']:.1f}x")
        print(f"  ETL (normalized, >= {r['etl_threshold_x_cost']:.0f}x cost)  {r['etl_normalized']:.4f}")
        print(f"  Most-likely single outcome   {r['most_likely_single_outcome_share']*100:.3f}% of weight")
        print(f"  Empty mid-range buckets      {r['empty_mid_range_buckets'] or 'none'} (bucketed in {r['bucket_unit']})")
        if mode in BUY_MODES:
            print(f"  Full band coverage ({r['bucket_unit']}):")
            for line in r["covered_buckets"]:
                print(f"    {line}")


if __name__ == "__main__":
    main()
