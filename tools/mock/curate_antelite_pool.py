#!/usr/bin/env python3
"""FABLE/OWNER AUDIT REMEDIATION R2-5: curate a production-representative
antelite (OVERBOOST, 1.25x enhancer) mock pool from the real, locked
simulation books, matching the existing base/cruise pools' category
structure in frontend/src/lib/mock/sample_rounds.json.

Selection is WEIGHT-aware, not uniform-random over the raw books file: the
raw books pool over-represents rare outcomes because the lookup table's
weight column - not raw book frequency - determines how often each book is
actually served. Within each payout/trigger bucket, this picks the
HIGHEST-WEIGHT (most commonly-served) book, i.e. the most representative
example of that bucket, not merely the first or a random one.

Reads the locked games/future_spinner/library/publish_files/ books + lookup
table (read-only - never writes there). Writes only to the non-locked
frontend/src/lib/mock/sample_rounds.json.

Run: scripts/assets/.venv/bin/python3 tools/mock/curate_antelite_pool.py
"""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BOOKS_ZST = ROOT / "games/future_spinner/library/publish_files/books_antelite.jsonl.zst"
LOOKUP_CSV = ROOT / "games/future_spinner/library/publish_files/lookUpTable_antelite_0.csv"
SAMPLE_JSON = ROOT / "frontend/src/lib/mock/sample_rounds.json"


def load_books():
    raw = subprocess.run(["unzstd", "-c", str(BOOKS_ZST)], capture_output=True, check=True).stdout
    books = {}
    for line in raw.decode().splitlines():
        r = json.loads(line)
        books[r["id"]] = r
    return books


def load_weights():
    weights = {}
    with open(LOOKUP_CSV) as f:
        for line in f:
            book_id, weight, _payout = line.strip().split(",")
            weights[int(book_id)] = int(weight)
    return weights


def has_trigger(book):
    return any(e.get("type") == "freeSpinTrigger" for e in book["events"])


def scatter_count(book):
    for e in book["events"]:
        if e.get("type") == "freeSpinTrigger":
            return len(e.get("positions", []))
    return 0


def has_retrigger(book):
    triggers = [e for e in book["events"] if e.get("type") == "freeSpinTrigger"]
    return len(triggers) >= 2


def best_by_weight(candidates, weights):
    return max(candidates, key=lambda b: weights.get(b["id"], 0))


def main():
    books = load_books()
    weights = load_weights()
    all_books = list(books.values())

    non_trigger = [b for b in all_books if not has_trigger(b)]
    trigger_books = [b for b in all_books if has_trigger(b)]

    loss = [b for b in non_trigger if b["payoutMultiplier"] == 0]
    win_small = [b for b in non_trigger if 0 < b["payoutMultiplier"] <= 500]   # <=5x
    win_mid = [b for b in non_trigger if 500 < b["payoutMultiplier"] <= 2000]  # 5-20x
    win_large = [b for b in non_trigger if 2000 < b["payoutMultiplier"] <= 10000]  # 20-100x

    retrig = [b for b in trigger_books if has_retrigger(b)]
    trig3 = [b for b in trigger_books if not has_retrigger(b) and scatter_count(b) == 3]
    trig4 = [b for b in trigger_books if not has_retrigger(b) and scatter_count(b) == 4]
    trig5 = [b for b in trigger_books if not has_retrigger(b) and scatter_count(b) == 5]

    entries = []

    def add(category, pool, n=1):
        if not pool:
            print(f"WARNING: no candidates for antelite/{category}, skipping")
            return
        pool_sorted = sorted(pool, key=lambda b: weights.get(b["id"], 0), reverse=True)
        for b in pool_sorted[:n]:
            entries.append({"mode": "antelite", "category": category, "round": b})

    add("antelite_loss", loss, n=2)
    add("antelite_win_small", win_small, n=3)
    add("antelite_win_mid", win_mid, n=2)
    add("antelite_win_large", win_large, n=2)
    add("trigger_3", trig3, n=1)
    add("trigger_4", trig4, n=1)
    add("trigger_5", trig5, n=1)
    add("retrigger", retrig, n=1)

    trigger_entries = [e for e in entries if e["category"] in ("trigger_3", "trigger_4", "trigger_5", "retrigger")]
    assert len(trigger_entries) >= 1, "antelite pool has zero natural Overdrive trigger rounds"

    with open(SAMPLE_JSON) as f:
        existing = json.load(f)
    existing_antelite = [e for e in existing if e["mode"] == "antelite"]
    print(f"existing antelite entries before curation: {len(existing_antelite)}")

    merged = [e for e in existing if e["mode"] != "antelite"] + entries
    with open(SAMPLE_JSON, "w") as f:
        json.dump(merged, f, indent=2)

    print(f"wrote {len(entries)} antelite entries to {SAMPLE_JSON}")
    for e in entries:
        w = weights.get(e["round"]["id"], 0)
        print(f"  {e['category']:16s} book_id={e['round']['id']:>6} payout={e['round']['payoutMultiplier']:>6} weight={w}")


if __name__ == "__main__":
    main()
