"""curate_mock_rounds.py - NITRO DEV FUEL, 2026-07-15 neon polish pass.

Curates a small, representative pool of REAL rounds from the shipped,
published `games/future_spinner/library/publish_files/books_<mode>.jsonl.zst`
books into `frontend/src/lib/mock/sample_rounds.json`, so
`frontend/src/lib/mock/roundProvider.ts` can serve a genuine end-to-end demo
for modes that currently fall back to the generic synthetic mock board
(super, at the time this script was written - cruise/antelite are still
uncurated and can be added the same way later).

READ-ONLY against games/future_spinner/** (a locked directory per CLAUDE.md -
this script only ever opens those files for reading, and writes exclusively
to frontend/src/lib/mock/sample_rounds.json, which is not locked).

Idempotent: running twice for the same mode replaces that mode's entries
rather than duplicating them (matches by `mode` field).

Run (from repo root, with the env/ venv active):
  env/bin/python scripts/curate_mock_rounds.py
"""

import io
import json
from pathlib import Path

import zstandard as zstd

ROOT = Path(__file__).resolve().parents[1]
LIB = ROOT / "games" / "future_spinner" / "library" / "publish_files"
SAMPLE_ROUNDS_PATH = ROOT / "frontend" / "src" / "lib" / "mock" / "sample_rounds.json"


def decompress_books(mode: str) -> list[dict]:
    """Read-only: decompress books_<mode>.jsonl.zst, one dict per line, indexed by line number == id."""
    path = LIB / f"books_{mode}.jsonl.zst"
    decompressor = zstd.ZstdDecompressor()
    rounds = []
    with open(path, "rb") as f:
        with decompressor.stream_reader(f) as reader:
            txt_stream = io.TextIOWrapper(reader, encoding="utf-8")
            for line in txt_stream:
                if line.strip():
                    rounds.append(json.loads(line))
    return rounds


def curate_super(rounds: list[dict]) -> list[dict]:
    """Hand-picked, verified-by-inspection round ids covering a representative
    spread: a low win, the near-average win, a big win well under cap, a
    cap-adjacent near-miss, and an exact wincap - the "representative handful
    including a cap-adjacent round" item 1 of the brief asks for. Also picks
    a retrigger and a high-meter round by scanning criteria/events, since
    those aren't in the hand-verified set from the initial research pass.
    """
    picks: list[tuple[int, str]] = [
        (88426, "super_win_small"),   # 2.30x - lowest non-zero payout in the table
        (8, "super_win_mid"),         # 385.80x - close to the table's 385.40x average
        (917, "super_win_large"),     # 2626.13x - big win, well under cap
        (62133, "super_cap_adjacent"),  # 4777.21x - near but not at the 5,000x cap
    ]
    picked_ids = {i for i, _ in picks}

    # Exact wincap: first round in file order with payoutMultiplier == 500000.
    wincap_id = next(
        (r["id"] for r in rounds if r.get("payoutMultiplier") == 500000 and r["id"] not in picked_ids),
        None,
    )
    if wincap_id is not None:
        picks.append((wincap_id, "super_wincap"))
        picked_ids.add(wincap_id)

    # Retrigger: a round whose events include a freeSpinRetrigger.
    retrigger_id = next(
        (
            r["id"]
            for r in rounds
            if r["id"] not in picked_ids
            and any(ev.get("type") == "freeSpinRetrigger" for ev in r.get("events", []))
        ),
        None,
    )
    if retrigger_id is not None:
        picks.append((retrigger_id, "super_retrigger"))
        picked_ids.add(retrigger_id)

    # High meter: a round whose final free-spin win shows the largest
    # meta.globalMult seen (meter climbed well above the 5x floor).
    best_id, best_mult = None, 5
    for r in rounds:
        if r["id"] in picked_ids:
            continue
        for ev in r.get("events", []):
            if ev.get("type") != "winInfo":
                continue
            for w in ev.get("wins", []):
                gm = (w.get("meta") or {}).get("globalMult")
                if isinstance(gm, (int, float)) and gm > best_mult:
                    best_mult, best_id = gm, r["id"]
    if best_id is not None:
        picks.append((best_id, "super_high_meter"))

    by_id = {r["id"]: r for r in rounds}
    entries = []
    for round_id, category in picks:
        r = by_id.get(round_id)
        if r is None:
            print(f"  WARNING: round id {round_id} ({category}) not found, skipping")
            continue
        entry_round = {
            "id": r["id"],
            "payoutMultiplier": r["payoutMultiplier"],
            "events": r["events"],
        }
        if "criteria" in r:
            entry_round["criteria"] = r["criteria"]
        if "baseGameWins" in r:
            entry_round["baseGameWins"] = r["baseGameWins"]
        if "freeGameWins" in r:
            entry_round["freeGameWins"] = r["freeGameWins"]
        entries.append({"mode": "super", "category": category, "round": entry_round})
        print(f"  {category}: id={r['id']} payout={r['payoutMultiplier']/100:.2f}x")
    return entries


def main() -> None:
    print("Decompressing books_super.jsonl.zst (read-only)...")
    super_rounds = decompress_books("super")
    print(f"  {len(super_rounds)} rounds loaded")

    print("Curating super mode sample pool...")
    new_entries = curate_super(super_rounds)

    existing = json.loads(SAMPLE_ROUNDS_PATH.read_text(encoding="utf-8"))
    kept = [e for e in existing if e.get("mode") != "super"]
    merged = kept + new_entries
    SAMPLE_ROUNDS_PATH.write_text(json.dumps(merged, indent=2) + "\n", encoding="utf-8")
    print(
        f"Wrote {SAMPLE_ROUNDS_PATH.relative_to(ROOT)}: "
        f"{len(kept)} pre-existing + {len(new_entries)} new super = {len(merged)} total"
    )


if __name__ == "__main__":
    main()
