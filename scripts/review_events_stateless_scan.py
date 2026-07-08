#!/usr/bin/env python3
"""REVIEW_EVENTS pass: statelessness scan for cruise/antelite/super.

Decodes each mode's shipped books_<mode>.jsonl.zst and, for every round,
locates the first free-spin winInfo event and reads its meta.globalMult - the
Overdrive meter's value at that point. Since the meter only ever increments
after a winning spin (never decrements, never resets mid-round) and is set
once at the feature's start (gamestate.py's _overdrive_start_meter(), called
from run_freespin() before the free-spin loop begins), the FIRST winning
free-spin's globalMult in every round equals that round's starting meter
value. The distinct set of these values across all rounds proves (or
disproves) two things per mode:
  1. Statelessness: every round starts from the SAME meter value (no
     cross-round carry - if state leaked between rounds, this set would show
     drift/spread instead of a single constant).
  2. The correct starting value: 1 for base/cruise/antelite, 5 for super
     (NITRO OVERDRIVE's pre-rev).

Method precedent: this mirrors the manual analysis done for `super` during
FeatureMath v2 (reports/archive/2026-07-07_featuremath-v2.md), generalised
into a reusable script and extended to cruise/antelite (which FeatureMath v2
did not separately verify this way).

Caveat (recorded, not glossed over): a round whose free-spin sequence never
wins contributes no data point to this check (there is no dedicated
"meter-at-feature-start" event independent of a win). Reported separately per
mode so the coverage this check actually achieves is visible, not implied to
be 100%.

Run: env/bin/python scripts/review_events_stateless_scan.py
(from the repo root; requires the `zstandard` package, already a project dep)
"""
import io
import json
import sys
from pathlib import Path

import zstandard as zstd

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / "games/future_spinner/library/publish_files"

# name -> expected starting Overdrive meter value (gamestate._overdrive_start_meter)
MODES = {
    "cruise": 1,
    "antelite": 1,
    "super": 5,
}


def iter_books(path: Path):
    decompressor = zstd.ZstdDecompressor()
    with open(path, "rb") as f:
        with decompressor.stream_reader(f) as reader:
            txt = io.TextIOWrapper(reader, encoding="utf-8")
            for line in txt:
                line = line.strip()
                if line:
                    yield json.loads(line)


def first_freegame_win_global_mult(book: dict):
    """Return the meta.globalMult of the first winInfo win recorded once the
    round has entered gameType == 'freegame', or None if the round never wins
    during free spins (no data point)."""
    in_freegame = False
    for ev in book.get("events", []):
        et = ev.get("type")
        if et == "reveal":
            if ev.get("gameType") == "freegame":
                in_freegame = True
            elif ev.get("gameType") == "basegame":
                in_freegame = False
        elif et == "winInfo" and in_freegame:
            for w in ev.get("wins", []):
                gm = w.get("meta", {}).get("globalMult")
                if gm is not None:
                    return gm
    return None


def scan_mode(mode: str, expected: int):
    path = LIB / f"books_{mode}.jsonl.zst"
    if not path.exists():
        return {"mode": mode, "error": f"missing {path}"}

    total = 0
    with_data = 0
    values = set()
    per_value_count = {}
    for book in iter_books(path):
        total += 1
        gm = first_freegame_win_global_mult(book)
        if gm is not None:
            with_data += 1
            values.add(gm)
            per_value_count[gm] = per_value_count.get(gm, 0) + 1

    return {
        "mode": mode,
        "expected_start_meter": expected,
        "total_rounds": total,
        "rounds_with_a_freegame_win": with_data,
        "coverage_pct": round(100 * with_data / total, 2) if total else 0.0,
        "distinct_start_meter_values_observed": sorted(values),
        "stateless": sorted(values) == [expected],
        "value_counts": per_value_count,
    }


def main():
    results = [scan_mode(mode, expected) for mode, expected in MODES.items()]

    print("=" * 78)
    print("REVIEW_EVENTS PASS: statelessness scan (cruise / antelite / super)")
    print("=" * 78)
    for r in results:
        if "error" in r:
            print(f"[{r['mode']}] ERROR: {r['error']}")
            continue
        status = "STATELESS" if r["stateless"] else "FAIL - NOT STATELESS"
        print(
            f"[{r['mode']}] expected start meter = {r['expected_start_meter']}, "
            f"observed distinct values = {r['distinct_start_meter_values_observed']} "
            f"-> {status}"
        )
        print(
            f"           {r['rounds_with_a_freegame_win']}/{r['total_rounds']} rounds "
            f"({r['coverage_pct']}%) had at least one free-spin win to sample from"
        )

    all_ok = all(r.get("stateless") for r in results if "error" not in r)
    print()
    print("STATELESSNESS SCAN: " + ("ALL PASS" if all_ok else "FAILURES DETECTED"))

    out_path = ROOT / "reports/qa/review_events_statelessness_scan_result.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(results, indent=2))
    print(f"\nRaw results written to {out_path.relative_to(ROOT)}")

    if not all_ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
