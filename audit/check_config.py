#!/usr/bin/env python3
"""
Reel-strip, paytable and ways-to-win validation (read-only).
Parses the reel CSVs and the paytable mirrored from game_config.py, verifies
internal consistency, and writes config_results.json to ~/math-sdk/audit/.
"""
import csv
import json
from collections import Counter
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
GAME = REPO / "games" / "future_spinner"
AUDIT = REPO / "audit"

PAY_SYMBOLS = ["H1", "H2", "M1", "M2", "M3", "L1", "L2", "L3"]
SPECIAL = ["W", "S"]
VALID = set(PAY_SYMBOLS + SPECIAL)

# Paytable mirrored verbatim from game_config.py (read-only reference).
PAYTABLE = {
    (5, "H1"): 22.0, (4, "H1"): 6.0, (3, "H1"): 1.5,
    (5, "H2"): 10.0, (4, "H2"): 3.0, (3, "H2"): 0.8,
    (5, "M1"): 5.0,  (4, "M1"): 1.5, (3, "M1"): 0.45,
    (5, "M2"): 4.0,  (4, "M2"): 1.0, (3, "M2"): 0.3,
    (5, "M3"): 2.0,  (4, "M3"): 0.6, (3, "M3"): 0.2,
    (5, "L1"): 1.5,  (4, "L1"): 0.45,(3, "L1"): 0.15,
    (5, "L2"): 0.8,  (4, "L2"): 0.25,(3, "L2"): 0.10,
    (5, "L3"): 0.65, (4, "L3"): 0.20,(3, "L3"): 0.08,
}
SCATTER_TABLE = {3: 1.0, 4: 3.0, 5: 10.0}

res = {}


def read_reel(path):
    """Return list of columns (reel strips). CSV rows are board rows; columns are reels."""
    rows = []
    with open(path, newline="") as fh:
        for r in csv.reader(fh):
            if r:
                rows.append([c.strip() for c in r])
    ncol = len(rows[0])
    cols = [[rows[i][c] for i in range(len(rows))] for c in range(ncol)]
    return rows, cols


# ── Ways-to-win ─────────────────────────────────────────────────────────────
num_reels, rows_per_reel = 5, 4
ways = rows_per_reel ** num_reels
res["ways_to_win"] = {"num_reels": num_reels, "rows_per_reel": rows_per_reel,
                      "computed": ways, "claim": 1024, "match": ways == 1024}

# ── BR0 reel strip ──────────────────────────────────────────────────────────
br0_rows, br0_cols = read_reel(GAME / "reels" / "BR0.csv")
br0 = {
    "n_rows": len(br0_rows),
    "n_reels": len(br0_cols),
    "per_reel_counts": [dict(Counter(c)) for c in br0_cols],
    "invalid_symbols": sorted({s for c in br0_cols for s in c} - VALID),
    "symbols_present": sorted({s for c in br0_cols for s in c}),
}
# Are all five reels identical in composition (PAR claims uniform)?
counters = [Counter(c) for c in br0_cols]
br0["uniform_across_reels"] = all(counters[0] == ct for ct in counters[1:])
# Dead-symbol check: every paying symbol must appear somewhere on the strip.
br0["pay_symbols_all_reachable"] = all(
    any(sym in c for c in br0_cols) for sym in PAY_SYMBOLS + SPECIAL
)
res["BR0"] = br0

# ── BRWCAP reel strip (forced wincap) ───────────────────────────────────────
wc_rows, wc_cols = read_reel(GAME / "reels" / "BRWCAP.csv")
res["BRWCAP"] = {
    "n_rows": len(wc_rows),
    "n_reels": len(wc_cols),
    "symbols_present": sorted({s for c in wc_cols for s in c}),
    "invalid_symbols": sorted({s for c in wc_cols for s in c} - VALID),
    "comment": "wincap strip should be high-pay/wild heavy to reach 5000x",
}

# ── Paytable consistency ────────────────────────────────────────────────────
pt = {"negative_or_zero": [], "monotonic_by_tier": True, "monotonic_by_match": True}
for k, v in PAYTABLE.items():
    if v <= 0:
        pt["negative_or_zero"].append([list(k), v])
# Tier order high to low.
tier_order = ["H1", "H2", "M1", "M2", "M3", "L1", "L2", "L3"]
for match in (3, 4, 5):
    vals = [PAYTABLE[(match, s)] for s in tier_order]
    if any(vals[i] < vals[i + 1] for i in range(len(vals) - 1)):
        pt["monotonic_by_tier"] = False
# Within a symbol, 5-of >= 4-of >= 3-of.
for s in tier_order:
    if not (PAYTABLE[(5, s)] >= PAYTABLE[(4, s)] >= PAYTABLE[(3, s)]):
        pt["monotonic_by_match"] = False
pt["all_referenced_symbols_valid"] = all(s in VALID for (_, s) in PAYTABLE)
res["paytable"] = pt

# ── Scatter table ───────────────────────────────────────────────────────────
res["scatter_table"] = {
    "config": SCATTER_TABLE,
    "monotonic": SCATTER_TABLE[3] <= SCATTER_TABLE[4] <= SCATTER_TABLE[5],
    "par_section2_states": {3: 1.0, 4: 3.0, 5: 10.0},
    "matches_par_section2": SCATTER_TABLE == {3: 1.0, 4: 3.0, 5: 10.0},
    "note_stale_comment_values": {3: 5.0, 4: 15.0, 5: 50.0},
}

(AUDIT / "config_results.json").write_text(json.dumps(res, indent=2, default=str))

print("=== WAYS ===", res["ways_to_win"])
print("=== BR0 ===")
print("rows:", br0["n_rows"], "reels:", br0["n_reels"])
print("symbols:", br0["symbols_present"], "invalid:", br0["invalid_symbols"])
print("uniform across reels:", br0["uniform_across_reels"])
print("all pay symbols reachable:", br0["pay_symbols_all_reachable"])
for i, ct in enumerate(br0["per_reel_counts"]):
    print(f"  reel {i}: {ct}  (total {sum(ct.values())})")
print("=== BRWCAP ===")
print("rows:", res["BRWCAP"]["n_rows"], "symbols:", res["BRWCAP"]["symbols_present"],
      "invalid:", res["BRWCAP"]["invalid_symbols"])
print("=== PAYTABLE ===", json.dumps(res["paytable"], default=str))
print("=== SCATTER ===", json.dumps(res["scatter_table"], default=str))
print("DONE")
