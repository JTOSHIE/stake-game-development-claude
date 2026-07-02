#!/usr/bin/env python3
"""
FS_MathSim_DeepAudit — main analysis script (read-only).

Reads the locked publish artifacts and statistics summary, computes every
metric independently, writes charts and a machine-readable results JSON to
~/math-sdk/audit/. Never writes to the game directory.

Exact-arithmetic policy:
  The lookup-table weights and payouts are integers, so RTP, hit rate and
  zero-win are computed with Python's arbitrary-precision integers (and
  fractions.Fraction for the final division) to avoid float rounding at the
  fourth decimal place. Standard deviation and chart bucketing use float64,
  which is ample for two-decimal volatility.
"""

import csv
import json
import hashlib
from fractions import Fraction
from pathlib import Path

import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

GAME = Path.home() / "stake-game-development-claude" / "games" / "future_spinner"
# Resolve the repo root regardless of home layout.
REPO = Path(__file__).resolve().parents[1]
GAME = REPO / "games" / "future_spinner"
PUB = GAME / "library" / "publish_files"
AUDIT = REPO / "audit"
CHARTS = AUDIT / "charts"
CHARTS.mkdir(parents=True, exist_ok=True)

CENTI = 100          # book scale: payout is bet-multiple x 100 (centibets)
CLAIM_RTP = 96.3500  # percent

results = {}


def load_lut(path):
    """Return (ids, weights, payouts) as lists of ints. Schema: id,weight,payout."""
    ids, weights, payouts = [], [], []
    with open(path, newline="") as fh:
        for row in csv.reader(fh):
            if not row:
                continue
            ids.append(int(row[0]))
            weights.append(int(row[1]))
            payouts.append(int(row[2]))
    return ids, weights, payouts


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


# ── Load base LUT ───────────────────────────────────────────────────────────
base_path = PUB / "lookUpTable_base_0.csv"
ids, weights, payouts = load_lut(base_path)
n = len(ids)
W = sum(weights)                                   # exact total weight (int)
weighted_centibets = sum(w * p for w, p in zip(weights, payouts))  # exact int

# RTP = (sum(weight*payout) / totalWeight) / 100, payout already in centibets.
# Expressed as a percentage: x100.
rtp_frac = Fraction(weighted_centibets, W * CENTI)        # mean bet-multiple
rtp_pct = float(rtp_frac * 100)

# Hit rate / zero-win (exact, weight-based).
w_win = sum(w for w, p in zip(weights, payouts) if p > 0)
w_zero = sum(w for w, p in zip(weights, payouts) if p == 0)
hit_rate_pct = float(Fraction(w_win, W) * 100)
zero_pct = float(Fraction(w_zero, W) * 100)

# Max win.
max_centibets = max(payouts)
max_x = max_centibets / CENTI

# Volatility: weighted population standard deviation of payout multiplier.
w_arr = np.array(weights, dtype=np.float64)
x_arr = np.array(payouts, dtype=np.float64) / CENTI       # bet-multiples
W_f = w_arr.sum()
mean_x = float((w_arr * x_arr).sum() / W_f)
var_x = float((w_arr * (x_arr - mean_x) ** 2).sum() / W_f)
std_x = var_x ** 0.5

# Average win per winning spin (weighted mean payout among payout>0).
w_win_f = w_arr[x_arr > 0].sum()
avg_win_winning = float((w_arr[x_arr > 0] * x_arr[x_arr > 0]).sum() / w_win_f)

results["base_lut"] = {
    "path": str(base_path),
    "n_entries": n,
    "total_weight": str(W),
    "weighted_centibets_sum": str(weighted_centibets),
    "rtp_pct": rtp_pct,
    "rtp_pct_4dp": round(rtp_pct, 4),
    "hit_rate_pct": hit_rate_pct,
    "zero_win_pct": zero_pct,
    "hit_plus_zero_pct": hit_rate_pct + zero_pct,
    "max_centibets": max_centibets,
    "max_multiplier_x": max_x,
    "mean_payout_x": mean_x,
    "volatility_std_x": std_x,
    "avg_win_per_winning_spin_x": avg_win_winning,
}

# ── Win-tier buckets + cumulative RTP ───────────────────────────────────────
# Buckets in bet-multiples. Each tuple is (label, low_inclusive, high_exclusive).
bucket_defs = [
    ("0 (no win)", 0.0, 1e-9),
    ("0-1x", 1e-9, 1.0),
    ("1-2x", 1.0, 2.0),
    ("2-5x", 2.0, 5.0),
    ("5-10x", 5.0, 10.0),
    ("10-50x", 10.0, 50.0),
    ("50-100x", 50.0, 100.0),
    ("100-500x", 100.0, 500.0),
    ("500-5000x", 500.0, 5000.0 + 1e-6),
]
buckets = []
for label, lo, hi in bucket_defs:
    if label == "0 (no win)":
        mask = x_arr == 0.0
    else:
        mask = (x_arr >= lo) & (x_arr < hi)
    w_b = float(w_arr[mask].sum())
    prob = w_b / W_f
    rtp_contrib = float((w_arr[mask] * x_arr[mask]).sum() / W_f)  # in bet-mult
    buckets.append({
        "label": label,
        "weight": w_b,
        "prob_pct": prob * 100,
        "rtp_contrib_pct": rtp_contrib * 100,  # as % of bet (since RTP is %)
        "count_rows": int(mask.sum()),
    })
results["buckets"] = buckets

# Cumulative RTP-contribution curve, ordered by ascending payout multiplier.
order = np.argsort(x_arr)
x_sorted = x_arr[order]
w_sorted = w_arr[order]
contrib_sorted = w_sorted * x_sorted
cum_contrib = np.cumsum(contrib_sorted)
total_contrib = cum_contrib[-1]
cum_weight = np.cumsum(w_sorted)
frac_outcomes = cum_weight / W_f
frac_rtp = cum_contrib / total_contrib

# ── Bonus LUT (for completeness; PAR section 11 claims 96.35%) ──────────────
bonus_path = PUB / "lookUpTable_bonus_0.csv"
b_ids, b_w, b_p = load_lut(bonus_path)
Wb = sum(b_w)
bonus_weighted = sum(w * p for w, p in zip(b_w, b_p))
# Bonus cost is 100x bet, so RTP = mean_payout / cost.
bonus_cost = 100.0
bonus_mean_x = (bonus_weighted / Wb) / CENTI
bonus_rtp_pct = bonus_mean_x / bonus_cost * 100
results["bonus_lut"] = {
    "path": str(bonus_path),
    "n_entries": len(b_ids),
    "total_weight": str(Wb),
    "mean_payout_x": bonus_mean_x,
    "cost_x": bonus_cost,
    "rtp_pct": bonus_rtp_pct,
    "max_multiplier_x": max(b_p) / CENTI,
}

# ── SHA256 of publish files (no index.json manifest exists to compare to) ───
pub_files = sorted(p for p in PUB.iterdir() if p.is_file())
results["hashes"] = {p.name: sha256(p) for p in pub_files}
results["index_json_present"] = (PUB / "index.json").exists()
results["books_present"] = any(PUB.glob("books*"))

# ── Scatter metrics from statistics_summary.json (SDK-computed) ─────────────
stats = json.loads((GAME / "library" / "statistics_summary.json").read_text())
scatter_hr_oneinN = stats["custom_hr_summary"]["base"]["{'symbol': 'scatter'}"]
scatter_avg = stats["custom_av_win_summary"]["base"]["{'symbol': 'scatter'}"]
scatter_count = stats["custom_sim_count_summary"]["base"]["{'symbol': 'scatter'}"]
results["scatter"] = {
    "source": "library/statistics_summary.json (SDK weighted summary)",
    "hit_rate_one_in_N": scatter_hr_oneinN,
    "trigger_rate_pct": 100.0 / scatter_hr_oneinN,
    "avg_win_x": scatter_avg,
    "raw_sim_count": scatter_count,
}
# RTP fence decomposition from config/fence info.
fence = stats["mode_fence_info"]["base"]
results["rtp_decomposition"] = {
    "basegame_rtp_pct": fence["basegame"]["rtp"] * 100,
    "scatter_rtp_pct": fence["scatter"]["rtp"] * 100,
    "wincap_rtp_pct": 5.00,  # PAR/config wincap quota 0.05 -> 5.00% (5000x x 0.001)
    "sum_pct": (fence["basegame"]["rtp"] + fence["scatter"]["rtp"]) * 100 + 5.00,
}

# ── Charts ──────────────────────────────────────────────────────────────────
# 1) Payout-multiplier distribution histogram (log y), weighted, winning only.
plt.figure(figsize=(9, 5))
win_mask = x_arr > 0
plt.hist(
    x_arr[win_mask], bins=np.logspace(np.log10(1e-2), np.log10(5000), 60),
    weights=w_arr[win_mask], color="#1f77b4", edgecolor="none",
)
plt.xscale("log")
plt.yscale("log")
plt.xlabel("Payout multiplier (x bet, winning spins, log scale)")
plt.ylabel("Weighted frequency (log scale)")
plt.title("Future Spinner — payout-multiplier distribution (weighted, wins only)")
plt.grid(True, which="both", alpha=0.3)
plt.tight_layout()
plt.savefig(CHARTS / "01_payout_distribution.png", dpi=110)
plt.close()

# 2) Win-multiplier bucket bar chart: probability and RTP contribution.
labels = [b["label"] for b in buckets]
probs = [b["prob_pct"] for b in buckets]
contribs = [b["rtp_contrib_pct"] for b in buckets]
fig, ax1 = plt.subplots(figsize=(11, 5.5))
xpos = np.arange(len(labels))
ax1.bar(xpos - 0.2, probs, width=0.4, color="#1f77b4", label="Probability (%)")
ax1.set_ylabel("Probability of spin (%)", color="#1f77b4")
ax1.set_yscale("log")
ax2 = ax1.twinx()
ax2.bar(xpos + 0.2, contribs, width=0.4, color="#d62728", label="RTP contribution (pp)")
ax2.set_ylabel("RTP contribution (percentage points)", color="#d62728")
ax1.set_xticks(xpos)
ax1.set_xticklabels(labels, rotation=30, ha="right")
ax1.set_title("Win-multiplier buckets: probability (log) and RTP contribution")
fig.tight_layout()
fig.savefig(CHARTS / "02_bucket_chart.png", dpi=110)
plt.close(fig)

# 3) Cumulative RTP-contribution curve.
plt.figure(figsize=(9, 5.5))
plt.plot(frac_outcomes * 100, frac_rtp * 100, color="#2ca02c", lw=2)
plt.xlabel("Cumulative fraction of outcomes by weight, ascending payout (%)")
plt.ylabel("Cumulative fraction of total RTP (%)")
plt.title("Cumulative RTP-contribution curve (volatility profile)")
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig(CHARTS / "03_cumulative_rtp.png", dpi=110)
plt.close()

# Concentration stat: fraction of RTP from the top 1% of outcomes by weight.
top1_mask = frac_outcomes >= 0.99
rtp_from_top1 = float((1.0 - frac_rtp[~top1_mask][-1]) * 100) if (~top1_mask).any() else 0.0
results["rtp_from_top_1pct_outcomes"] = rtp_from_top1

# ── Save results ────────────────────────────────────────────────────────────
(AUDIT / "audit_results.json").write_text(json.dumps(results, indent=2))

# ── Console summary ─────────────────────────────────────────────────────────
print("=== BASE LUT ===")
print(f"entries={n}  total_weight={W}")
print(f"RTP = {rtp_pct:.4f}%  (claim {CLAIM_RTP:.4f}%, diff {rtp_pct-CLAIM_RTP:+.4f} pp)")
print(f"hit_rate = {hit_rate_pct:.4f}%   zero_win = {zero_pct:.4f}%   sum = {hit_rate_pct+zero_pct:.4f}%")
print(f"max = {max_centibets} centibets = {max_x:.2f}x")
print(f"mean payout = {mean_x:.4f}x   volatility(std) = {std_x:.4f}x")
print(f"avg win per winning spin = {avg_win_winning:.4f}x")
print("=== SCATTER (statistics_summary.json) ===")
print(f"trigger rate = {100.0/scatter_hr_oneinN:.4f}% (1-in-{scatter_hr_oneinN:.2f})  avg_win = {scatter_avg:.4f}x  raw_count={scatter_count}")
print("=== RTP DECOMPOSITION ===")
print(json.dumps(results["rtp_decomposition"], indent=2))
print("=== BONUS LUT ===")
print(f"entries={len(b_ids)}  mean={bonus_mean_x:.4f}x  cost={bonus_cost}x  RTP={bonus_rtp_pct:.4f}%  max={max(b_p)/CENTI:.2f}x")
print("=== BUCKETS ===")
for b in buckets:
    print(f"{b['label']:>12}  P={b['prob_pct']:7.4f}%  RTPcontrib={b['rtp_contrib_pct']:7.4f}pp  rows={b['count_rows']}")
print(f"RTP from top 1% of outcomes (by weight): {rtp_from_top1:.2f}%")
print("=== HASHES ===")
for k, v in results["hashes"].items():
    print(f"{k}: {v}")
print(f"index.json present: {results['index_json_present']}   books present: {results['books_present']}")
print("DONE")
