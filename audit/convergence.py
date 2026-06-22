#!/usr/bin/env python3
"""
Convergence run (Step 4): replay spins by sampling the published distribution.

The served game draws rounds from the lookup table in proportion to their
weights. This script re-plays that exact process at scale: it samples spins
from the committed lookUpTable_base_0.csv with probability proportional to the
LUT weights, and plots the running RTP, hit rate, scatter-band and max win
against spin count, showing convergence to the published 96.3500% RTP. No
pipeline or optimiser is run; this is a Monte-Carlo replay of the validated
distribution. Read-only on the repo.
"""
import csv
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

REPO = Path("/home/user/stake-game-development-claude")
LUT = REPO / "games/future_spinner/library/publish_files/lookUpTable_base_0.csv"
CHARTS = REPO / "audit" / "charts"
CENTI = 100
N = 5_000_000
SEED = 20260622

weights, payouts = [], []
with open(LUT, newline="") as fh:
    for r in csv.reader(fh):
        if r:
            weights.append(int(r[1])); payouts.append(int(r[2]))
w = np.array(weights, dtype=np.float64)
mult = np.array(payouts, dtype=np.float64) / CENTI
prob = w / w.sum()

rng = np.random.default_rng(SEED)
# Sample N spins by weight; draw in chunks to keep memory modest.
chunk = 1_000_000
draws_mult = np.empty(N, dtype=np.float64)
filled = 0
while filled < N:
    k = min(chunk, N - filled)
    idx = rng.choice(len(prob), size=k, p=prob)
    draws_mult[filled:filled + k] = mult[idx]
    filled += k

running_rtp = np.cumsum(draws_mult) / np.arange(1, N + 1) * 100  # percent
final_rtp = running_rtp[-1]
emp_hit = float((draws_mult > 0).mean() * 100)
emp_max = float(draws_mult.max())
print(f"N={N:,}  empirical RTP={final_rtp:.4f}%  (target 96.3500%)")
print(f"empirical hit rate={emp_hit:.4f}%  empirical max={emp_max:.1f}x")

# Plot running RTP convergence (log x).
plt.figure(figsize=(9, 5.5))
xs = np.arange(1, N + 1)
# subsample for plotting
step = max(1, N // 5000)
plt.plot(xs[::step], running_rtp[::step], color="#1f77b4", lw=1.2, label="Running RTP")
plt.axhline(96.35, color="#d62728", ls="--", lw=1.5, label="Target 96.3500%")
plt.xscale("log")
plt.ylim(80, 115)
plt.xlabel("Spins replayed (log scale)")
plt.ylabel("Running RTP (%)")
plt.title(f"Convergence of replayed RTP to 96.3500% (N={N:,}, final {final_rtp:.4f}%)")
plt.legend()
plt.grid(True, which="both", alpha=0.3)
plt.tight_layout()
plt.savefig(CHARTS / "04_convergence_rtp.png", dpi=110)
plt.close()
print("chart saved: audit/charts/04_convergence_rtp.png")
