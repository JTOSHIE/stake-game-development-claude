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

# ============================================================================
# R2R JOB 7 / TR-044, 2026-07-25. THIS TOOL NOW FAILS CLOSED.
# ============================================================================
#
# Round-two reviewer 3's sixth finding, confirmed by execution: run at HEAD with
# the private books absent, it produced five `zstd: can't stat` errors on stderr,
# processed zero rounds, made zero assertions, and printed
# "BOOKS/LOOKUP EQUALITY: PASS".
#
# That is not a small bug. The books are gitignored (.gitignore:9,
# `**/library/**`), so ANY reviewer working from the GitHub tree gets exactly
# that result, and the committed 4.45-million-assertion report is unreproducible
# for them while the tool tells them everything is fine. A verifier that passes
# when it verified nothing is worse than no verifier, because it converts an
# absent proof into a positive one.
#
# Three separate defects made it possible, and all three are fixed:
#
#   1. `stream_book` spawned zstd and never looked at its EXIT STATUS. A failed
#      decompression produced an empty stdout, which read as a book with no
#      rounds rather than as an error.
#   2. Nothing asserted that the round count was NON-ZERO, so zero rounds and
#      zero failures satisfied the final `if total_failures:` test.
#   3. Nothing asserted the counts were RIGHT. Every mode ships exactly 100,000
#      rounds and exactly 100,000 lookup rows; a book truncated to 50,000 would
#      have passed silently on the half it could check.
#
# The rule now is that a check which could not run is a FAILURE, never a pass.
# Every condition below is fatal:
#
#   - a missing lookup CSV or a missing book file
#   - a non-zero exit status from the decompressor
#   - zero rounds processed in any mode
#   - a duplicate id in the book or in the lookup table
#   - a lookup id never seen in the book, or a book id absent from the lookup
#   - a round count or lookup row count that is not EXACTLY the expected one
#
# The expected counts are parameters (`--expect-rounds`, `--expect-lookup-rows`)
# rather than hardcoded, defaulting to the 100,000 that CLAUDE.md's true game
# facts record, so the same tool can verify a differently sized package without
# being edited into agreeing with whatever it was given.

DEFAULT_EXPECT_ROUNDS = 100_000
DEFAULT_EXPECT_LOOKUP_ROWS = 100_000

# 5,000x expressed in centibets. Matches CENTIBET_CAP in
# frontend/src/lib/services/roundInterpreter.ts and the 5,000x hard cap in
# CLAUDE.md's true game facts.
CENTIBET_CAP = 500_000


class VerificationError(Exception):
    """A condition that makes the verification INVALID rather than failed.

    Distinct from a row-level failure on purpose. A row-level failure means the
    books and the lookup disagree, which is a finding. One of these means the
    check could not be performed at all, which must never be reported as a pass.
    """


def read_lookup(mode, publish):
    """id -> payout in centibets, from lookUpTable_<mode>_0.csv.

    Raises rather than returning a partial table: a missing file and an empty
    file are both fatal, and a duplicate id means the table cannot be trusted as
    a mapping at all.
    """
    path = publish / f"lookUpTable_{mode}_0.csv"
    if not path.is_file():
        raise VerificationError(f"lookup table missing: {path}")

    table = {}
    duplicates = []
    rows = 0
    with path.open(newline="") as fh:
        for row in csv.reader(fh):
            if len(row) < 3:
                continue
            rows += 1
            rid = int(row[0])
            if rid in table:
                duplicates.append(rid)
            table[rid] = int(row[2])

    if rows == 0:
        raise VerificationError(f"lookup table is empty: {path}")
    if duplicates:
        raise VerificationError(
            f"lookup table has {len(duplicates)} duplicate id(s), first {duplicates[:5]}: {path}"
        )
    return table


def stream_book(mode, publish):
    """Yield each decoded round. Streams via the zstd CLI so no third-party
    Python package is required on the verifying machine, which matters for a
    check that a reviewer may want to run themselves.

    The decompressor's EXIT STATUS is now checked. Not checking it is what let
    five `zstd: can't stat` errors read as five books containing no rounds.
    """
    path = publish / f"books_{mode}.jsonl.zst"
    if not path.is_file():
        raise VerificationError(f"book file missing: {path}")

    proc = subprocess.Popen(
        ["zstd", "-dc", str(path)],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    try:
        for line in io.TextIOWrapper(proc.stdout, encoding="utf-8"):
            line = line.strip()
            if line:
                yield json.loads(line)
    finally:
        proc.stdout.close()
        stderr = proc.stderr.read().decode("utf-8", "replace").strip()
        proc.stderr.close()
        code = proc.wait()
        # A caller that stopped early (--limit) closes the pipe under zstd, and
        # SIGPIPE/EPIPE is not a decompression failure. Anything else is.
        if code not in (0, -13, 141) and not _STOPPED_EARLY[0]:
            raise VerificationError(
                f"zstd exited {code} for {path}" + (f": {stderr}" if stderr else "")
            )


# Set while a --limit run is deliberately abandoning the stream, so the SIGPIPE
# that follows is not mistaken for a decompression failure.
_STOPPED_EARLY = [False]


def verify_mode(mode, publish, limit=None,
                expect_rounds=DEFAULT_EXPECT_ROUNDS,
                expect_lookup_rows=DEFAULT_EXPECT_LOOKUP_ROWS):
    lookup = read_lookup(mode, publish)
    stats = {
        "mode": mode,
        "rounds": 0,
        "lookup_rows": len(lookup),
        "failures": [],
        "checked": {"A": 0, "B": 0, "C": 0, "D": 0, "E": 0},
        "no_win_rounds": 0,
        "capped_rounds": 0,
        "max_payout_centibets": 0,
        "duplicate_ids": [],
        "lookup_ids_never_seen": 0,
    }

    if limit is None and len(lookup) != expect_lookup_rows:
        raise VerificationError(
            f"{mode}: lookup has {len(lookup)} rows, expected exactly {expect_lookup_rows}"
        )

    def fail(rid, check, detail):
        if len(stats["failures"]) < 20:  # cap the report, never the counting
            stats["failures"].append({"id": rid, "check": check, "detail": detail})

    seen = set()

    for rnd in stream_book(mode, publish):
        if limit is not None and stats["rounds"] >= limit:
            _STOPPED_EARLY[0] = True
            break
        stats["rounds"] += 1
        rid = rnd["id"]

        # Duplicate ids make every downstream count meaningless: 100,000 rounds
        # of which 40,000 are the same round is not a verified package.
        if rid in seen:
            if len(stats["duplicate_ids"]) < 20:
                stats["duplicate_ids"].append(rid)
        seen.add(rid)
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

    # ── Fail closed on everything the row loop cannot see ────────────────────
    # These run AFTER the stream, because they are properties of the whole
    # package rather than of any one round. Every one of them is fatal.

    if stats["rounds"] == 0:
        raise VerificationError(
            f"{mode}: ZERO rounds processed. The check did not run, so it cannot pass."
        )

    if stats["duplicate_ids"]:
        raise VerificationError(
            f"{mode}: duplicate round id(s) in the book, first {stats['duplicate_ids'][:5]}"
        )

    if limit is None:
        if stats["rounds"] != expect_rounds:
            raise VerificationError(
                f"{mode}: {stats['rounds']} rounds, expected exactly {expect_rounds}"
            )
        if len(seen) != len(lookup):
            raise VerificationError(
                f"{mode}: {len(seen)} distinct book ids against {len(lookup)} lookup rows; "
                "the two sets are not the same size"
            )
        never_seen = set(lookup) - seen
        stats["lookup_ids_never_seen"] = len(never_seen)
        if never_seen:
            raise VerificationError(
                f"{mode}: {len(never_seen)} lookup id(s) have no round in the book, "
                f"first {sorted(never_seen)[:5]}"
            )

    return stats


def _fail(message):
    """One place that prints a fatal result, so FAIL is impossible to miss."""
    print()
    print("!" * 72)
    print("BOOKS/LOOKUP EQUALITY: FAIL")
    print(message)
    print("!" * 72)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None, help="rounds per mode, for a quick pass")
    ap.add_argument("--json-out", default=None)
    ap.add_argument("--publish-dir", default=str(PUBLISH),
                    help="publish_files directory to verify (the self-test points this at an empty one)")
    ap.add_argument("--expect-rounds", type=int, default=DEFAULT_EXPECT_ROUNDS,
                    help="exact rounds required per mode; anything else is a FAILURE, not a warning")
    ap.add_argument("--expect-lookup-rows", type=int, default=DEFAULT_EXPECT_LOOKUP_ROWS,
                    help="exact lookup rows required per mode")
    ap.add_argument("--self-test", action="store_true",
                    help="run this tool against a directory with no input and assert it exits non-zero")
    args = ap.parse_args()

    if args.self_test:
        return self_test()

    publish = Path(args.publish_dir)
    if not publish.is_dir():
        _fail(f"publish_files not found at {publish}. Nothing was verified.")
        return 2

    report = {"modes": [], "totals": {}}
    total_rounds = total_failures = 0
    total_checks = 0

    for mode in MODES:
        try:
            s = verify_mode(mode, publish, args.limit,
                            args.expect_rounds, args.expect_lookup_rows)
        except VerificationError as err:
            # The distinction that matters: this is not "the books disagree
            # with the lookup", it is "the check could not be performed". The
            # previous version had no way to say that, so it said PASS.
            _fail(f"VERIFICATION INVALID: {err}")
            return 2
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
        "expect_rounds_per_mode": args.expect_rounds,
        "expect_lookup_rows_per_mode": args.expect_lookup_rows,
        "limited": args.limit,
    }
    print()
    print(f"rounds verified : {total_rounds:,}")
    print(f"assertions made : {total_checks:,}")
    print(f"failures        : {total_failures}")

    if args.json_out:
        Path(args.json_out).write_text(json.dumps(report, indent=2))

    # Belt and braces. Every mode already raises on zero rounds, but a total of
    # zero must never reach the success path by any route at all.
    if total_rounds == 0 or total_checks == 0:
        _fail(f"ZERO work done: {total_rounds} rounds, {total_checks} assertions.")
        return 2

    if total_failures:
        _fail(f"{total_failures} row-level failure(s). See the per-mode detail above.")
        return 1
    print("\nBOOKS/LOOKUP EQUALITY: PASS")
    return 0


def self_test():
    """Run this tool against an absent input package and assert a non-zero exit.

    The whole finding was that the tool passed with no books. The only proof
    that cannot rot is the tool actually being run that way, so it is run that
    way, here, by itself.
    """
    import tempfile

    print("SELF-TEST: the tool must FAIL when its input is absent\n")
    ok = True

    with tempfile.TemporaryDirectory() as empty:
        cmd = [sys.executable, str(Path(__file__).resolve()), "--publish-dir", empty]
        proc = subprocess.run(cmd, capture_output=True, text=True)
        out = proc.stdout + proc.stderr
        checks = [
            ("exits non-zero with no input", proc.returncode != 0),
            ("says FAIL", "BOOKS/LOOKUP EQUALITY: FAIL" in out),
            ("does NOT say PASS", "BOOKS/LOOKUP EQUALITY: PASS" not in out),
            ("names the missing input", "missing" in out.lower() or "not found" in out.lower()),
        ]
        for name, passed in checks:
            print(f"  {'ok  ' if passed else 'FAIL'} {name}")
            ok = ok and passed
        print(f"\n  exit status was {proc.returncode}")

    # A directory holding lookup tables but NO books: the exact shape a GitHub
    # checkout has, since the books are gitignored and the CSVs are not.
    with tempfile.TemporaryDirectory() as partial:
        real = PUBLISH
        copied = 0
        if real.is_dir():
            for mode in MODES:
                src = real / f"lookUpTable_{mode}_0.csv"
                if src.is_file():
                    (Path(partial) / src.name).write_bytes(src.read_bytes())
                    copied += 1
        if copied == len(MODES):
            print("\nSELF-TEST: lookup tables present, books absent (a GitHub checkout)\n")
            proc = subprocess.run(
                [sys.executable, str(Path(__file__).resolve()), "--publish-dir", partial],
                capture_output=True, text=True,
            )
            out = proc.stdout + proc.stderr
            for name, passed in [
                ("exits non-zero", proc.returncode != 0),
                ("says FAIL", "BOOKS/LOOKUP EQUALITY: FAIL" in out),
                ("does NOT say PASS", "BOOKS/LOOKUP EQUALITY: PASS" not in out),
                ("names the missing book file", "book file missing" in out),
            ]:
                print(f"  {'ok  ' if passed else 'FAIL'} {name}")
                ok = ok and passed
        else:
            print("\nSELF-TEST: skipped the books-absent case, lookup tables are not on this machine")

    print()
    if not ok:
        print("SELF-TEST: FAIL")
        return 1
    print("SELF-TEST: PASS")
    return 0


if __name__ == "__main__":
    sys.exit(main())
