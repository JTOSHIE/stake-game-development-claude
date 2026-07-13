#!/usr/bin/env python3
"""AudioForge v1 - promote a chosen candidate to the shipped filename.

Usage:
    .venv/bin/python promote.py <name> <seed>

Copies ~/Desktop/fs_audio/candidates/<name>/<name>_s<seed>.wav to
~/Desktop/fs_audio/<name>.wav - both paths live under ~/Desktop and are never committed.
"""

import argparse
import shutil
import sys
from pathlib import Path

DESKTOP_OUT = Path.home() / "Desktop" / "fs_audio"
CANDIDATES_DIR = DESKTOP_OUT / "candidates"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("name", help="Manifest row name, e.g. spin")
    parser.add_argument("seed", type=int, help="Seed of the chosen candidate")
    args = parser.parse_args()

    candidate = CANDIDATES_DIR / args.name / f"{args.name}_s{args.seed}.wav"
    if not candidate.exists():
        print(f"No candidate found at {candidate}", file=sys.stderr)
        sys.exit(1)

    dest = DESKTOP_OUT / f"{args.name}.wav"
    DESKTOP_OUT.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(candidate, dest)
    print(f"Promoted {candidate} -> {dest}")


if __name__ == "__main__":
    main()
