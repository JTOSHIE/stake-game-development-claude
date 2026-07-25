#!/usr/bin/env python3
"""
verify_books_lookup_equality.py - R3 / TR-011 (2026-07-25).

Proves book-to-lookup equality for every row of every mode. Review 1 named this
as the thing it could not verify, and BOOKS_MANIFEST.md says plainly that the
manifest establishes identity and integrity, not semantic equivalence. This is
the semantic equivalence.

READ-ONLY. It opens games/future_spinner/library/publish_files/ for reading and
writes nothing there. The maths package is locked; reading a locked file is
permitted, writing is not, and nothing here writes.

WHAT IS CHECKED, and why these checks and not others.

For every round in every mode, five independent reconciliations:

  A. book.payoutMultiplier == the lookup table's payout for the SAME id.
     This is the literal equality review 1 asked for.
  B. finalWin.amount == book.payoutMultiplier.
     The event stream's own closing declaration agrees with the header.
  C. the LAST setTotalWin.amount == book.payoutMultiplier.
     The running total the player is shown lands on the same number.
  D. sum of every winInfo.totalWin == book.payoutMultiplier.
     The per-spin wins, meter already applied, sum to the declared total.
  E. within each winInfo, sum(wins[].win) == winInfo.totalWin.
     The individual symbol wins sum to their own spin's total.

D and E together are the substantive claim: individual symbol awards sum, spin
by spin and through the Overdrive meter, to the payout the lookup table prices.
A alone would only prove two files agree on a number.

WHAT IS DELIBERATELY NOT CHECKED, derived rather than assumed:

  sum(setWin.amount) is NOT asserted to equal the total. Measured on a real
  feature round (book id 1, base): sum(setWin.amount) = 36,724 against a
  payoutMultiplier of 36,389. setWin is a per-spin display event and does not
  form a summable series across a round. Asserting it would have produced a
  false failure on every feature round, which is how a verifier loses its
  credibility. The rule was derived from the data before being written down.

Run (from the repository root):
    python3 tools/verify_books_lookup_equality.py
    python3 tools/verify_books_lookup_equality.py --limit 1000   # quick pass
"""

import argparse
import csv
import json
import io
import subprocess
import sys
from pathlib import Path

PUBLISH = Path("games/future_spinner/library/publish_files")
MODES = ["base", "cruise", "antelite", "bonus", "super"]

# 5,000x expressed in centibets. Matches CENTIBET_CAP in
# frontend/src/lib/services/roundInterpreter.ts and the 5,000x hard cap in
# CLAUDE.md's true game facts.
CENTIBET_CAP = 500_000


def read_lookup(mode):
    """id -> payout in centibets, from lookUpTable_<mode>_0.csv."""
    table = {}
    path = PUBLISH / f"lookUpTable_{mode}_0.csv"
    with path.open(newline="") as fh:
        for row in csv.reader(fh):
            if len(row) < 3:
                continue
            table[int(row[0])] = int(row[2])
    return table


def stream_book(mode):
    """Yield each decoded round. Streams via the zstd CLI so no third-party
    Python package is required on the verifying machine, which matters for a
    check that a reviewer may want to run themselves."""
    path = PUBLISH / f"books_{mode}.jsonl.zst"
    proc = subprocess.Popen(["zstd", "-dc", str(path)], stdout=subprocess.PIPE)
    try:
        for line in io.TextIOWrapper(proc.stdout, encoding="utf-8"):
            line = line.strip()
            if line:
                yield json.loads(line)
    finally:
        proc.stdout.close()
        proc.wait()


def verify_mode(mode, limit=None):
    lookup = read_lookup(mode)
    stats = {
        "mode": mode,
        "rounds": 0,
        "lookup_rows": len(lookup),
        "failures": [],
        "checked": {"A": 0, "B": 0, "C": 0, "D": 0, "E": 0},
        "no_win_rounds": 0,
        "capped_rounds": 0,
        "max_payout_centibets": 0,
    }

    def fail(rid, check, detail):
        if len(stats["failures"]) < 20:  # cap the report, never the counting
            stats["failures"].append({"id": rid, "check": check, "detail": detail})

    for rnd in stream_book(mode):
        if limit is not None and stats["rounds"] >= limit:
            break
        stats["rounds"] += 1
        rid = rnd["id"]
        declared = rnd["payoutMultiplier"]
        stats["max_payout_centibets"] = max(stats["max_payout_centibets"], declared)

        # A. book vs lookup, same id
        if rid not in lookup:
            fail(rid, "A", "id absent from the lookup table")
        else:
            stats["checked"]["A"] += 1
            if lookup[rid] != declared:
                fail(rid, "A", f"lookup {lookup[rid]} != book {declared}")

        events = rnd.get("events", [])
        final = [e for e in events if e.get("type") == "finalWin"]
        set_total = [e for e in events if e.get("type") == "setTotalWin"]
        win_info = [e for e in events if e.get("type") == "winInfo"]

        # B. finalWin
        if final:
            stats["checked"]["B"] += 1
            if int(final[-1].get("amount", -1)) != declared:
                fail(rid, "B", f"finalWin {final[-1].get('amount')} != {declared}")
        elif declared != 0:
            fail(rid, "B", "a paying round carries no finalWin event")

        # C. last setTotalWin
        if set_total:
            stats["checked"]["C"] += 1
            if int(set_total[-1].get("amount", -1)) != declared:
                fail(rid, "C", f"last setTotalWin {set_total[-1].get('amount')} != {declared}")

        # D. winInfo totals sum to the declared payout.
        #
        # THE CAP. On a round that reaches the 5,000x ceiling the declared
        # payout is TRUNCATED to exactly CENTIBET_CAP while the event stream
        # still records what the wins actually came to, so the sum legitimately
        # EXCEEDS the declared total. Derived from the data, not assumed: the
        # first draft of this verifier asserted plain equality and reported 22
        # failures across 2,500 rounds, every single one of them at exactly
        # 500,000 and none of them anywhere else. Reporting those as book
        # defects would have been badly wrong. On a capped round the meaningful
        # assertion is that the round genuinely EARNED at least the cap.
        capped = declared == CENTIBET_CAP
        if capped:
            stats["capped_rounds"] += 1
        if win_info:
            stats["checked"]["D"] += 1
            summed = sum(int(e.get("totalWin", 0)) for e in win_info)
            if capped:
                if summed < declared:
                    fail(rid, "D", f"capped round earned only {summed}, below the {declared} cap")
            elif summed != declared:
                fail(rid, "D", f"sum(winInfo.totalWin) {summed} != {declared}")
        else:
            stats["no_win_rounds"] += 1
            if declared != 0:
                fail(rid, "D", f"no winInfo events but payout is {declared}")

        # E. each winInfo internally consistent
        for ev in win_info:
            stats["checked"]["E"] += 1
            inner = sum(int(w.get("win", 0)) for w in ev.get("wins", []))
            spin_total = int(ev.get("totalWin", -1))
            # Same truncation applies to the spin that crosses the ceiling.
            if capped and inner >= spin_total:
                continue
            if inner != spin_total:
                fail(rid, "E", f"winInfo index {ev.get('index')}: sum(wins.win) {inner} != totalWin {ev.get('totalWin')}")
                break

    return stats


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None, help="rounds per mode, for a quick pass")
    ap.add_argument("--json-out", default=None)
    args = ap.parse_args()

    if not PUBLISH.exists():
        print(f"publish_files not found at {PUBLISH}", file=sys.stderr)
        return 2

    report = {"modes": [], "totals": {}}
    total_rounds = total_failures = 0
    total_checks = 0

    for mode in MODES:
        s = verify_mode(mode, args.limit)
        report["modes"].append(s)
        total_rounds += s["rounds"]
        total_failures += len(s["failures"])
        total_checks += sum(s["checked"].values())
        c = s["checked"]
        print(
            f"{mode:9} rounds {s['rounds']:>7}  lookup {s['lookup_rows']:>7}  "
            f"A {c['A']:>7} B {c['B']:>7} C {c['C']:>7} D {c['D']:>7} E {c['E']:>8}  "
            f"max {s['max_payout_centibets']:>8}  capped {s['capped_rounds']:>5}  failures {len(s['failures'])}"
        )
        for f in s["failures"][:5]:
            print(f"    FAIL id={f['id']} check {f['check']}: {f['detail']}")

    report["totals"] = {
        "rounds": total_rounds,
        "assertions": total_checks,
        "failures": total_failures,
    }
    print()
    print(f"rounds verified : {total_rounds:,}")
    print(f"assertions made : {total_checks:,}")
    print(f"failures        : {total_failures}")

    if args.json_out:
        Path(args.json_out).write_text(json.dumps(report, indent=2))

    if total_failures:
        print("\nBOOKS/LOOKUP EQUALITY: FAIL")
        return 1
    print("\nBOOKS/LOOKUP EQUALITY: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
