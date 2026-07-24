#!/usr/bin/env python3
"""
Independent bet-level compliance recomputation for Future Spinner.

Written for the 2026-07-25 platform-delta pass as the SECOND computer in a
two-computer verification. Fable pre-computed the same figures separately; this
script must not consult those values, only produce its own and let the report
reconcile them.

Source of truth: the shipped, frozen publish tables under
games/future_spinner/library/publish_files/ (read-only, never regenerated).

Table format, one row per simulation:
    simulation_id , weight , payout_in_centibets

Payout multiplier x is expressed in units of the BASE bet, not of the mode cost.
So for the 100x bonus mode an average outcome of 96.35x base bet is an RTP of
96.35 percent against its 100x cost.

Statistics produced per mode:
  RTP                 sum(p*x) / cost
  SD                  standard deviation of x, reported raw and cost-normalised
  P(>=5000x)          cumulative probability at or above 5,000x
  P(>=10000x)         cumulative probability at or above 10,000x
  P scaled            the above after the published cost-multiplier relief bands
  ETL(40x cost)       share of total RTP from wins at or above 40 * cost
  ETL(>10000x)        share of total RTP from wins at or above 10,000x
  CVaR                coherent expected shortfall, at both 99 and 99.9 percent,
                      raw and cost-normalised, because the published definition
                      is ambiguous (see COMPLIANCE_WATCH.md, 2026-07-25 section)

Usage:  python3 scripts/qa/bet_level_compliance.py
"""

from decimal import Decimal, getcontext
import csv
import json
import os

getcontext().prec = 40

PUBLISH_DIR = "games/future_spinner/library/publish_files"
CENTIBET = Decimal(100)

# Read the cost multipliers from the shipped index rather than hardcoding them,
# so a table/cost mismatch cannot silently pass.
with open(os.path.join(PUBLISH_DIR, "index.json")) as fh:
    INDEX = json.load(fh)

MODES = [(m["name"], Decimal(str(m["cost"])), m["weights"]) for m in INDEX["modes"]]


def cost_scale(cost: Decimal) -> Decimal:
    """Published relief bands applied to tail probabilities for high-cost modes."""
    if cost >= 1000:
        return Decimal("0.2")
    if cost >= 500:
        return Decimal("0.5")
    if cost >= 200:
        return Decimal("0.8")
    return Decimal(1)


def expected_shortfall(pairs, total_w, alpha_tail):
    """
    Coherent expected shortfall over the worst alpha_tail of outcomes, where
    'worst' for the operator means the largest payouts.

    pairs must be sorted by payout descending. The final contributing atom is
    partially consumed so the result is exact for a discrete distribution rather
    than drifting with the atom's size.
    """
    target = Decimal(alpha_tail)
    acc_p = Decimal(0)
    acc_px = Decimal(0)
    for x, w in pairs:
        p = Decimal(w) / total_w
        if acc_p + p >= target:
            take = target - acc_p
            acc_px += take * x
            acc_p = target
            break
        acc_px += p * x
        acc_p += p
    if acc_p < target:  # tail smaller than requested, degenerate
        return acc_px / acc_p if acc_p > 0 else Decimal(0)
    return acc_px / target


def analyse(name, cost, table):
    path = os.path.join(PUBLISH_DIR, table)
    rows = []
    total_w = 0
    with open(path, newline="") as fh:
        for rec in csv.reader(fh):
            if not rec or len(rec) < 3:
                continue
            w = int(rec[1])
            x = Decimal(rec[2]) / CENTIBET
            rows.append((x, w))
            total_w += w

    total_w_d = Decimal(total_w)
    n = len(rows)

    # First and second moments in one pass over the exact rationals.
    mean = Decimal(0)
    for x, w in rows:
        mean += x * Decimal(w)
    mean /= total_w_d

    var = Decimal(0)
    for x, w in rows:
        d = x - mean
        var += d * d * Decimal(w)
    var /= total_w_d
    sd = var.sqrt()

    rtp = mean / cost

    def prob_at_or_above(t):
        acc = 0
        for x, w in rows:
            if x >= t:
                acc += w
        return Decimal(acc) / total_w_d

    def rtp_share_at_or_above(t):
        acc = Decimal(0)
        for x, w in rows:
            if x >= t:
                acc += x * Decimal(w)
        acc /= total_w_d
        return acc / mean if mean > 0 else Decimal(0)

    p5000 = prob_at_or_above(Decimal(5000))
    p10000 = prob_at_or_above(Decimal(10000))
    scale = cost_scale(cost)

    etl_40 = rtp_share_at_or_above(Decimal(40) * cost)
    etl_10000 = rtp_share_at_or_above(Decimal(10000))

    ordered = sorted(rows, key=lambda r: r[0], reverse=True)
    cvar99 = expected_shortfall(ordered, total_w_d, "0.01")
    cvar999 = expected_shortfall(ordered, total_w_d, "0.001")

    max_x = ordered[0][0]

    return {
        "mode": name,
        "cost": cost,
        "rows": n,
        "total_weight": total_w,
        "mean_x": mean,
        "rtp_pct": rtp * 100,
        "sd_raw": sd,
        "sd_norm": sd / cost,
        "max_x": max_x,
        "p5000": p5000,
        "p10000": p10000,
        "scale": scale,
        "p5000_scaled": p5000 * scale,
        "p10000_scaled": p10000 * scale,
        "etl_40_threshold": Decimal(40) * cost,
        "etl_40": etl_40,
        "etl_10000": etl_10000,
        "cvar99_raw": cvar99,
        "cvar99_norm": cvar99 / cost,
        "cvar999_raw": cvar999,
        "cvar999_norm": cvar999 / cost,
    }


def f(d, places=4):
    q = Decimal(1).scaleb(-places)
    return str(Decimal(d).quantize(q))


def sci(d):
    v = Decimal(d)
    return "0" if v == 0 else f"{float(v):.6e}"


def main():
    results = [analyse(n, c, t) for n, c, t in MODES]

    print("=" * 78)
    print("INDEPENDENT BET-LEVEL COMPLIANCE RECOMPUTATION")
    print("source:", PUBLISH_DIR)
    print("=" * 78)

    for r in results:
        print(f"\n--- {r['mode']}  (cost {r['cost']}x, {r['rows']} rows, "
              f"total weight {r['total_weight']}) ---")
        print(f"  max payout            {f(r['max_x'], 2)}x")
        print(f"  mean payout           {f(r['mean_x'], 6)}x")
        print(f"  RTP                   {f(r['rtp_pct'], 6)} %")
        print(f"  SD raw                {f(r['sd_raw'])}")
        print(f"  SD cost-normalised    {f(r['sd_norm'])}")
        print(f"  P(>=5000x)            {sci(r['p5000'])}")
        print(f"  P(>=10000x)           {sci(r['p10000'])}")
        print(f"  cost scale band       {r['scale']}")
        print(f"  P(>=5000x) scaled     {sci(r['p5000_scaled'])}")
        print(f"  ETL threshold (40x c) {f(r['etl_40_threshold'], 1)}x")
        print(f"  ETL(>=40x cost)       {f(r['etl_40'])}")
        print(f"  ETL(>=10000x)         {f(r['etl_10000'])}")
        print(f"  CVaR99   raw / norm   {f(r['cvar99_raw'])} / {f(r['cvar99_norm'])}")
        print(f"  CVaR99.9 raw / norm   {f(r['cvar999_raw'])} / {f(r['cvar999_norm'])}")

    print("\n" + "=" * 78)
    print("WORST CASE ACROSS MODES (the published comparison rule)")
    print("=" * 78)
    w5 = max(results, key=lambda r: r["p5000_scaled"])
    w10 = max(results, key=lambda r: r["p10000_scaled"])
    wetl = max(results, key=lambda r: r["etl_40"])
    print(f"  worst scaled P(>=5000x)   {sci(w5['p5000_scaled'])}  ({w5['mode']})")
    print(f"  worst scaled P(>=10000x)  {sci(w10['p10000_scaled'])}  ({w10['mode']})")
    print(f"  worst ETL(>=40x cost)     {f(wetl['etl_40'])}  ({wetl['mode']})")

    base = next(r for r in results if r["mode"] == "base")
    print(f"  base SD (the tested one)  {f(base['sd_raw'])}")

    rtps = [r["rtp_pct"] for r in results]
    print(f"  RTP spread across modes   {f(max(rtps) - min(rtps), 6)} pp")

    with open("reports/qa/bet_level_compliance_raw_2026-07-25.json", "w") as fh:
        json.dump(
            [{k: (str(v) if isinstance(v, Decimal) else v) for k, v in r.items()}
             for r in results],
            fh,
            indent=2,
        )
    print("\nraw values written to reports/qa/bet_level_compliance_raw_2026-07-25.json")


if __name__ == "__main__":
    main()
