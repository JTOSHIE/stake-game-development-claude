#!/usr/bin/env python3
"""
Re-simulation comparison (sandbox vs committed). Read-only on the real repo.
Computes every metric from the freshly generated sandbox publish bundle and
compares to the committed artifacts and the claimed figures.
"""
import csv, json, hashlib, io
from fractions import Fraction
from pathlib import Path
import zstandard as zstd

REPO = Path("/home/user/stake-game-development-claude")
SAND = Path("/tmp/fs_resim/games/future_spinner/library")
FRESH_PUB = SAND / "publish_files"
COMMIT_PUB = REPO / "games/future_spinner/library/publish_files"
AUDIT = REPO / "audit"
CHARTS = AUDIT / "charts"
CENTI = 100
CLAIMS = {"rtp": 96.3500, "hit": 33.57, "zero": 66.43, "max": 5000.0,
          "vol": 16.26, "scatter_rate": 6.21, "scatter_avg": 95.1}

def load_lut(path):
    ids, w, p = [], [], []
    with open(path, newline="") as fh:
        for r in csv.reader(fh):
            if r:
                ids.append(int(r[0])); w.append(int(r[1])); p.append(int(r[2]))
    return ids, w, p

def metrics(weights, payouts):
    W = sum(weights)
    num = sum(wt*pp for wt, pp in zip(weights, payouts))
    rtp = float(Fraction(num, W*CENTI) * 100)
    w_win = sum(wt for wt, pp in zip(weights, payouts) if pp > 0)
    w_zero = sum(wt for wt, pp in zip(weights, payouts) if pp == 0)
    hit = float(Fraction(w_win, W) * 100)
    zero = float(Fraction(w_zero, W) * 100)
    mx = max(payouts) / CENTI
    # weighted population std of multiplier
    mean = num / (W*CENTI)
    var = sum(wt * ((pp/CENTI) - mean)**2 for wt, pp in zip(weights, payouts)) / W
    return {"rtp": rtp, "hit": hit, "zero": zero, "max": mx, "vol": var**0.5,
            "mean": mean, "total_weight": W, "n": len(weights)}

def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for c in iter(lambda: fh.read(1<<20), b""):
            h.update(c)
    return h.hexdigest()

out = {}

# ── Fresh and committed LUT metrics ─────────────────────────────────────────
_, fw, fp = load_lut(FRESH_PUB / "lookUpTable_base_0.csv")
_, cw, cp = load_lut(COMMIT_PUB / "lookUpTable_base_0.csv")
fresh = metrics(fw, fp)
commit = metrics(cw, cp)
out["fresh_metrics"] = fresh
out["committed_metrics"] = commit
out["payouts_identical"] = (fp == cp)
out["weights_identical"] = (fw == cw)

# ── Bundle consistency: index.json references real, parseable files ─────────
idx = json.loads((FRESH_PUB / "index.json").read_text())
bundle = {"index": idx, "files_exist": {}, "hashes": {}}
for mode in idx["modes"]:
    for key in ("events", "weights"):
        fn = mode[key]
        fp_ = FRESH_PUB / fn
        bundle["files_exist"][fn] = fp_.exists()
        if fp_.exists():
            bundle["hashes"][fn] = sha256(fp_)
out["bundle"] = bundle

# ── Decompress books_base, count rounds, cross-check payouts, scatter factors ─
books_path = FRESH_PUB / "books_base.jsonl.zst"
dctx = zstd.ZstdDecompressor()
round_count = 0
payout_mismatch = 0
scatter_factor_samples = {}   # scatter_count -> set of scatter-only award values seen
sample_check = 0
with open(books_path, "rb") as fh:
    with dctx.stream_reader(fh) as reader:
        text = io.TextIOWrapper(reader, encoding="utf-8")
        for line in text:
            line = line.strip()
            if not line:
                continue
            rec = json.loads(line)
            rid = rec["id"]
            pm = rec["payoutMultiplier"]
            # cross-check book payout vs LUT payout column for first 2000 rounds
            if round_count < 2000 and rid - 1 < len(fp):
                # book id is 1-based in this SDK; LUT id is 0-based
                lut_idx = rid - 1
                if 0 <= lut_idx < len(fp) and fp[lut_idx] != pm:
                    payout_mismatch += 1
                sample_check += 1
            # extract scatter award factor from events (winInfo with symbol 'S')
            for ev in rec.get("events", []):
                wins = ev.get("wins") if isinstance(ev, dict) else None
                if wins:
                    for wdat in wins:
                        if wdat.get("symbol") == "S":
                            k = wdat.get("kind")
                            scatter_factor_samples.setdefault(int(k), set()).add(wdat.get("win"))
            round_count += 1
out["books"] = {
    "round_count": round_count,
    "sample_cross_checked": sample_check,
    "payout_mismatches_in_sample": payout_mismatch,
    "scatter_award_factors": {k: sorted(v) for k, v in sorted(scatter_factor_samples.items())},
}

# ── Scatter rate/avg from fresh statistics_summary.json ─────────────────────
stats = json.loads((SAND / "statistics_summary.json").read_text())
hr = stats["custom_hr_summary"]["base"]["{'symbol': 'scatter'}"]
out["scatter_stats"] = {
    "trigger_rate_pct": 100.0/hr,
    "avg_win_x": stats["custom_av_win_summary"]["base"]["{'symbol': 'scatter'}"],
    "raw_count": stats["custom_sim_count_summary"]["base"]["{'symbol': 'scatter'}"],
}

(AUDIT / "resim_results.json").write_text(json.dumps(out, indent=2, default=str))

# ── Report to console ───────────────────────────────────────────────────────
def line(name, claim, val, unit="", tol=0.01):
    diff = val - claim
    ok = abs(diff) <= tol
    print(f"{name:<22} claim={claim:<10} resim={val:<12.4f} diff={diff:+.4f}{unit}  {'MATCH' if ok else 'CHECK'}")

print("=== FRESH (RE-SIMULATED) BASE LUT METRICS ===")
print(f"entries={fresh['n']} total_weight={fresh['total_weight']}")
line("RTP %", CLAIMS["rtp"], fresh["rtp"], tol=0.05)
line("Hit rate %", CLAIMS["hit"], fresh["hit"], tol=0.05)
line("Zero-win %", CLAIMS["zero"], fresh["zero"], tol=0.05)
line("Max x", CLAIMS["max"], fresh["max"], tol=0.0)
line("Volatility x", CLAIMS["vol"], fresh["vol"], tol=0.5)
line("Scatter rate %", CLAIMS["scatter_rate"], out["scatter_stats"]["trigger_rate_pct"], tol=0.05)
line("Scatter avg x", CLAIMS["scatter_avg"], out["scatter_stats"]["avg_win_x"], tol=0.1)
print(f"\npayouts identical to committed: {out['payouts_identical']}")
print(f"weights identical to committed:  {out['weights_identical']}")
print(f"committed RTP recomputed: {commit['rtp']:.4f}%   max {commit['max']:.2f}x")
print("\n=== BUNDLE ===")
print(json.dumps(bundle["files_exist"], indent=2))
print("\n=== BOOKS ===")
print(f"rounds={round_count}  sample_checked={sample_check}  payout_mismatches={payout_mismatch}")
print(f"scatter award factors observed: {out['books']['scatter_award_factors']}")
print("DONE")
