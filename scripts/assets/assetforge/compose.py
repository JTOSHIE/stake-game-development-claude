#!/usr/bin/env python3
"""Deterministic prompt composer: style register x manifest row, never a hand-written string.

WHY THIS EXISTS RATHER THAN A PROMPT FILE. A production prompt typed by hand drifts from
the manifest the moment either moves: the manifest says a symbol delivers at 240x240 with
alpha, the prompt says something slightly different, and nothing catches it because a
prompt is prose. Here the prompt is BUILT from the two committed sources, so it cannot
disagree with them. The same row plus the same register always yields the same prompt,
byte for byte, which is also what makes a regeneration reproducible.

THE STYLE REGISTER LANDED IN R100, at the path below. Until then this module REFUSED
rather than inventing one, per convention (m): external documents must physically exist in
the repository before work cites them. Nothing here changed when it arrived, which was the
point of refusing rather than stubbing.

WHAT A REGISTER AUTHOR NEEDS TO KNOW, because it is not obvious from the loader. 'base' and
'negative' are consumed as STRINGS and joined with the row's own fields, so neither may be a
nested object. 'base' is prefixed to every prompt BEFORE the row's role, so it must describe
the house style and never the subject. The transparency clause is appended by compose()
itself from the manifest's alpha column, so a 'base' that also describes a background will
contradict it, and a 'negative' that mentions green spill or drop shadow will duplicate what
compose() already adds for alpha rows.

Run: scripts/assets/.venv/bin/python scripts/assets/assetforge/compose.py --id SY-01
"""
from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
MANIFEST = REPO / "docs" / "art" / "art_manifest_arc2.csv"
STYLE_REGISTER = REPO / "docs" / "art" / "style_register.json"

INGESTABLE = "REPLACE"


class ComposerRefusal(Exception):
    """The prompt cannot be built from committed sources. Nothing is guessed."""


def load_style_register(path: Path = STYLE_REGISTER) -> dict:
    if not path.exists():
        raise ComposerRefusal(
            f"the style register does not exist at {path.relative_to(REPO)}. The composer "
            f"builds production prompts by merging it with each manifest row and will not "
            f"substitute a hand-written prompt for it, because a hand-written prompt is "
            f"exactly the drift this module exists to prevent (convention (m): an external "
            f"document must be in the repository before work cites it). Expected keys: "
            f"'base', 'negative', and optionally 'per_role' and 'camera'."
        )
    reg = json.loads(path.read_text(encoding="utf-8"))
    for key in ("base", "negative"):
        if key not in reg:
            raise ComposerRefusal(f"style register is missing required key {key!r}")
    return reg


def load_rows(path: Path = MANIFEST) -> dict[str, dict]:
    rows = list(csv.DictReader(path.open(encoding="utf-8")))
    return {r["id"]: r for r in rows}


def compose(row: dict, register: dict, *, oversample: int = 2) -> dict:
    """Merge one manifest row with the register. Pure and deterministic."""
    if row["classification"] != INGESTABLE:
        raise ComposerRefusal(
            f"{row['id']} is classified {row['classification']}, not {INGESTABLE}; "
            f"only the REPLACE rows are generated"
        )
    # R103: this used to be a bare int() over the split, which raised an uncaught ValueError
    # rather than refusing. SC-03's cell reads "800x640 source", so ONE of the thirty REPLACE
    # rows crashed the composer with a traceback, in a module whose entire design is to refuse
    # cleanly and never guess. Neither main() catches ValueError, so it escaped as a crash.
    raw = (row.get("target_dimensions") or "").strip()
    try:
        w, h = (int(v) for v in raw.lower().split("x"))
    except (ValueError, TypeError):
        raise ComposerRefusal(
            f"{row['id']} has an unparseable target_dimensions cell {raw!r}. The cell must read "
            f"exactly WIDTHxHEIGHT, for example '240x240'. This is a MANIFEST DATA defect, so "
            f"fix the cell rather than this parser. The known case is SC-03, whose own note says "
            f"the replacement should be authored at the true 640x468 aspect OR the engine call "
            f"site should change; which of those is intended is an owner decision and the "
            f"composer will not pick one."
        ) from None
    wants_alpha = row["alpha"].strip().lower() == "yes"

    # Twice delivery size, per the brief, then clamped so the request stays near the
    # model's trained megapixel band. Generating far above it does not add detail, it
    # adds repeated structure, so the honest oversample is capped and the shortfall is
    # made up by an upscale pass rather than pretended away.
    gen_w, gen_h = w * oversample, h * oversample

    parts = [register["base"], row["role"].strip()]
    if notes := (row.get("notes") or "").strip():
        parts.append(f"manifest note: {notes.split('.')[0]}")
    if per_role := register.get("per_role", {}).get(row["id"]):
        parts.append(per_role)
    parts.append(
        "isolated on a pure chroma-key green field, no shadow cast onto the field"
        if wants_alpha else "full-bleed opaque scene, no transparent regions"
    )

    negative = register["negative"]
    if wants_alpha:
        negative += ", green spill on the subject, drop shadow on the background"

    return {
        "manifest_id": row["id"],
        "manifest_path": row["path"],
        "prompt": ". ".join(p.rstrip(". ") for p in parts if p) + ".",
        "negative_prompt": negative,
        "delivery_dims": [w, h],
        "generate_dims": [gen_w, gen_h],
        "wants_alpha": wants_alpha,
        "oversample": oversample,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--id", dest="ids", action="append", required=True)
    ap.add_argument("--oversample", type=int, default=2)
    args = ap.parse_args()
    try:
        register = load_style_register()
    except ComposerRefusal as exc:
        print(f"COMPOSER REFUSED: {exc}", file=sys.stderr)
        return 3
    rows = load_rows()
    out = []
    for i in args.ids:
        if i not in rows:
            print(f"COMPOSER REFUSED: no manifest row {i!r}", file=sys.stderr)
            return 3
        out.append(compose(rows[i], register, oversample=args.oversample))
    print(json.dumps(out, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
