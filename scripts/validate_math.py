#!/usr/bin/env python3
"""Independent math validation for Future Spinner.

Recomputes the headline maths from the SHIPPED lookup tables (zero trust in the
PAR), the way the community LUT analyzer (mnemoo/tools) and StakeCLI's compliance
check do, and gates on Stake Engine's published rubric. Run before submission so a
drifted or non-compliant table cannot slip through (StakeCLI's --yes only warns).

Reads games/future_spinner/library/publish_files/{index.json, lookUpTable_<mode>_0.csv}.
CSV rows are `sim_id,weight,payout` where payout is the multiplier x100 (390 = 3.90x)
and weight is a uint64. Integer arithmetic on the weight sums avoids float drift.

Run:  python3 scripts/validate_math.py
Exits non-zero if any HARD compliance check fails (CI-ready).
"""
import csv
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PUB = ROOT / "games/future_spinner/library/publish_files"

# Our stated facts (CLAUDE.md / GAME_FACTS) to cross-check against.
STATED = {
    "rtp": 0.963500,           # both modes, 4dp
    "base_hit_rate": 0.2911,
    "base_std": 17.28,         # weighted SD in bet-multiples
    "bonus_std": 206.63,
    "max_win": 5000.0,
    "base_wincap_one_in": 100_000,
    "bonus_wincap_one_in": 1_000,
}
# Stake compliance rubric - from the OFFICIAL math-verification doc
# (docs/stake-engine-live/math-verification.md, mirrored 2026-07-04).
RTP_MIN, RTP_MAX = 0.90, 0.9670  # official band 90.0%-96.70% (NOT 98%)
CROSS_MODE_MAX = 0.005           # all modes within 0.5% of each other
BASE_HIT_MIN = 0.05              # non-zero win hit rate must be >= 1 in 20
BASE_HIT_MAX = 0.40              # sanity upper bound (not a doc limit; warn-ish)
MIN_ROWS = 100_000              # 100k-1M simulations
MIN_UNIQUE_PAYOUTS = 10
MAX_ZERO_RATE = 0.90            # >90% non-paying may be grounds for rejection
MAX_WIN_ACHIEVABLE_ONE_IN = 10_000_000  # max win typically more frequent than 1 in 10M
# Star-tier operator-risk ceilings (3-star band, the more permissive of 2/3-star):
MAX_PAYOUT_MULT = 100_000       # max payout multiplier
MAX_COST_MULT = 1_500           # max bet-mode cost multiplier
BASE_SD_MIN, BASE_SD_MAX = 0.6, 60.0    # base (1.0x) standard deviation band
P_BIGWIN_MAX = 1e-2             # P(>=5000x), cost-scaled (see below)


def cost_scale(cost: float) -> float:
    """High-cost modes contribute less to tail risk; the doc scales P(>=5000)."""
    if cost >= 1000:
        return 0.2
    if cost >= 500:
        return 0.5
    if cost >= 200:
        return 0.8
    return 1.0


def analyse(mode: str, cost: float, weights_file: str) -> dict:
    path = PUB / weights_file
    total_w = 0
    win_w = 0
    zero_w = 0
    wpay = 0            # sum(weight * payout_x100)
    wpay_sq = 0         # sum(weight * payout_x100^2)  -> for weighted variance
    max_pay = 0
    min_nonzero = None
    payouts = set()
    rows = 0
    with open(path, newline="") as f:
        for sim_id, w, pay in csv.reader(f):
            w = int(w); pay = int(pay)
            rows += 1
            total_w += w
            wpay += w * pay
            wpay_sq += w * pay * pay
            payouts.add(pay)
            if pay > 0:
                win_w += w
                if min_nonzero is None or pay < min_nonzero:
                    min_nonzero = pay
            else:
                zero_w += w
            if pay > max_pay:
                max_pay = pay
    # weight of the top (max-payout) outcome -> wincap odds
    cap_w = 0
    with open(path, newline="") as f:
        for _, w, pay in csv.reader(f):
            if int(pay) == max_pay:
                cap_w += int(w)

    rtp = wpay / total_w / 100.0 / cost
    hit_rate = win_w / total_w
    zero_rate = zero_w / total_w
    mean_mult = wpay / total_w / 100.0                      # E[payout multiple]
    e_x2 = wpay_sq / total_w / 10000.0                      # E[(payout multiple)^2]
    variance = max(0.0, e_x2 - mean_mult * mean_mult)
    std = math.sqrt(variance)                               # weighted SD, bet-multiples
    cv = std / mean_mult if mean_mult else float("inf")     # coefficient of variation
    max_win = max_pay / 100.0
    wincap_one_in = (total_w / cap_w) if cap_w else float("inf")
    return dict(
        mode=mode, cost=cost, rows=rows, total_w=total_w, rtp=rtp, hit_rate=hit_rate,
        zero_rate=zero_rate, mean_mult=mean_mult, std=std, cv=cv, max_win=max_win,
        min_nonzero=(min_nonzero or 0) / 100.0, unique_payouts=len(payouts),
        wincap_one_in=wincap_one_in,
        p_bigwin=(cap_w / total_w if total_w else 0.0),  # P(>=5000x), = P at the cap
    )


def main() -> int:
    index = json.loads((PUB / "index.json").read_text())
    modes = index["modes"]
    results = {m["name"]: analyse(m["name"], m["cost"], m["weights"]) for m in modes}

    fails, warns = [], []

    def check(cond, msg, hard=True):
        if cond:
            return
        (fails if hard else warns).append(msg)

    print("=" * 74)
    print("Future Spinner - independent math validation (from shipped lookup tables)")
    print("=" * 74)
    base_rtp = results.get("base", {}).get("rtp")
    for name, r in results.items():
        print(f"\n[{name}]  cost {r['cost']:g}x   rows {r['rows']:,}")
        print(f"  RTP              {r['rtp']*100:.6f}%   (stated {STATED['rtp']*100:.4f}%)")
        print(f"  hit rate         {r['hit_rate']*100:.4f}%")
        print(f"  mean multiple    {r['mean_mult']:.4f}x")
        print(f"  std dev (SD)     {r['std']:.2f}x   (volatility, bet-multiples)")
        print(f"  coeff of var     {r['cv']:.3f}    (SD/mean)")
        print(f"  max win          {r['max_win']:g}x")
        print(f"  min non-zero     {r['min_nonzero']:g}x")
        print(f"  zero-payout rate {r['zero_rate']*100:.2f}%")
        print(f"  unique payouts   {r['unique_payouts']:,}")
        print(f"  max-win odds     1 in {r['wincap_one_in']:,.0f}")
        print(f"  P(>=5000x)       {r['p_bigwin']:.2e}  (cost-scaled {r['p_bigwin']*cost_scale(r['cost']):.2e}, limit {P_BIGWIN_MAX:.0e})")

        # --- compliance rubric ---
        check(RTP_MIN <= r["rtp"] <= RTP_MAX, f"{name}: RTP {r['rtp']*100:.4f}% outside {RTP_MIN*100:g}-{RTP_MAX*100:g}%")
        check(r["rows"] >= MIN_ROWS, f"{name}: only {r['rows']:,} rows (< {MIN_ROWS:,})")
        check(r["unique_payouts"] >= MIN_UNIQUE_PAYOUTS, f"{name}: {r['unique_payouts']} unique payouts (< {MIN_UNIQUE_PAYOUTS})")
        check(r["zero_rate"] <= MAX_ZERO_RATE, f"{name}: zero-payout {r['zero_rate']*100:.1f}% (> {MAX_ZERO_RATE*100:g}%)")
        check(r["wincap_one_in"] <= MAX_WIN_ACHIEVABLE_ONE_IN, f"{name}: max win odds 1 in {r['wincap_one_in']:,.0f} (> 1 in {MAX_WIN_ACHIEVABLE_ONE_IN:,})")
        check(r["max_win"] <= MAX_PAYOUT_MULT, f"{name}: max win {r['max_win']:g}x (> {MAX_PAYOUT_MULT:,}x)")
        check(r["cost"] <= MAX_COST_MULT, f"{name}: cost {r['cost']:g}x (> {MAX_COST_MULT:,}x)")
        scaled_p = r["p_bigwin"] * cost_scale(r["cost"])
        check(scaled_p <= P_BIGWIN_MAX, f"{name}: P(>=5000x) {scaled_p:.2e} cost-scaled (> {P_BIGWIN_MAX:.0e})")
        if base_rtp is not None:
            check(abs(r["rtp"] - base_rtp) <= CROSS_MODE_MAX, f"{name}: RTP varies {abs(r['rtp']-base_rtp)*100:.4f}% vs base (> {CROSS_MODE_MAX*100:g}%)")

    # base-specific
    br = results["base"]
    check(BASE_HIT_MIN <= br["hit_rate"] <= BASE_HIT_MAX, f"base: hit rate {br['hit_rate']*100:.2f}% outside {BASE_HIT_MIN*100:g}-{BASE_HIT_MAX*100:g}%")
    check(BASE_SD_MIN <= br["std"] <= BASE_SD_MAX, f"base: std dev {br['std']:.2f}x outside {BASE_SD_MIN}-{BASE_SD_MAX} band")

    # --- cross-check vs stated facts (warnings only) ---
    def near(a, b, rel=0.01):
        return abs(a - b) <= rel * max(abs(b), 1e-9)
    print("\n--- cross-check vs stated facts (warn on mismatch) ---")
    checks = [
        ("base RTP == 96.35%", near(br["rtp"], STATED["rtp"], 1e-4)),
        ("bonus RTP == 96.35%", near(results["bonus"]["rtp"], STATED["rtp"], 1e-4)),
        ("base hit rate == 29.11%", near(br["hit_rate"], STATED["base_hit_rate"], 0.02)),
        ("base SD == 17.28x", near(br["std"], STATED["base_std"], 0.03)),
        ("bonus SD == 206.63x", near(results["bonus"]["std"], STATED["bonus_std"], 0.03)),
        ("max win == 5000x", near(br["max_win"], STATED["max_win"]) and near(results["bonus"]["max_win"], STATED["max_win"])),
        ("base wincap ~ 1 in 100k", near(br["wincap_one_in"], STATED["base_wincap_one_in"], 0.15)),
        ("bonus wincap ~ 1 in 1k", near(results["bonus"]["wincap_one_in"], STATED["bonus_wincap_one_in"], 0.20)),
    ]
    for label, ok in checks:
        print(f"  {'OK ' if ok else 'DIFF'} {label}")
        if not ok:
            warns.append(f"stated-fact mismatch: {label}")

    print("\n" + "=" * 74)
    if warns:
        print("WARNINGS:")
        for w in warns:
            print("  - " + w)
    if fails:
        print("COMPLIANCE FAILURES:")
        for fmsg in fails:
            print("  - " + fmsg)
        print("MATH VALIDATION: FAIL")
        return 1
    print("MATH VALIDATION: ALL COMPLIANCE CHECKS PASS" + ("  (with warnings)" if warns else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
