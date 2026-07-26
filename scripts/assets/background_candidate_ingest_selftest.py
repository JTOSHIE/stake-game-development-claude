#!/usr/bin/env python3
"""Convention (p) self-test for the background candidate classifier.

The ingest run reports NEW DESIGN for both supplied candidates. A classifier
hardwired to return NEW DESIGN would print exactly that, so the report is not
evidence until the classifier has been seen to return the OTHER answer on art
that genuinely is an enhancement. That is what this does.

It imports `classify` and `composition_correspondence` from the ingest script
itself, so it exercises the shipping predicate rather than a lookalike copy of
it, which is the failure convention (p) was written about.

Six cases, planting the defect in the form it really occurs. The real form of a
"redesign wearing an enhancement's clothes" is same-style-different-composition,
so that is what the negative cases seed: not noise, not a black frame, but the
incumbent's own scene rearranged.

Run: scripts/assets/.venv/bin/python scripts/assets/background_candidate_ingest_selftest.py
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageEnhance

sys.path.insert(0, str(Path(__file__).resolve().parent))

from background_candidate_ingest import (  # noqa: E402
    ENHANCEMENT_MAX_MOVED,
    ENHANCEMENT_MIN_R,
    INCUMBENT,
    SRC_DIR,
    classify,
    composition_correspondence,
)


def regrade(img: Image.Image, contrast: float, colour: float,
            brightness: float) -> Image.Image:
    """A real regrade: the exact same scene, pushed. The permitted class."""
    out = ImageEnhance.Contrast(img.convert("RGB")).enhance(contrast)
    out = ImageEnhance.Color(out).enhance(colour)
    return ImageEnhance.Brightness(out).enhance(brightness)


def main() -> int:
    if not INCUMBENT.exists():
        print(f"incumbent not found: {INCUMBENT}")
        return 2
    inc = Image.open(INCUMBENT).convert("RGB")
    W, H = inc.size

    cases = []

    # POSITIVE CASES: genuine enhancements. The classifier must say ENHANCEMENT.
    # If it cannot, its NEW DESIGN verdicts are worthless.
    cases.append((
        "identity", inc.copy(), "ENHANCEMENT",
        "the incumbent against itself, the degenerate enhancement",
    ))
    cases.append((
        "regrade_matching_assetforge_bg_base",
        regrade(inc, 1.08, 1.18, 1.00), "ENHANCEMENT",
        "the AssetForge bg_base grade parameters reapplied, scripts/assets/backgrounds.py",
    ))
    cases.append((
        "regrade_hard_push", regrade(inc, 1.45, 1.60, 1.15), "ENHANCEMENT",
        "a regrade far harder than any real one, still the same scene",
    ))

    # NEGATIVE CASES: real recompositions. The classifier must say NEW DESIGN.
    # These are the form the actual defect takes: the same art, moved.
    cases.append((
        "mirrored", inc.transpose(Image.FLIP_LEFT_RIGHT), "NEW DESIGN",
        "same scene, same palette, same style, composition reversed",
    ))
    shifted = Image.new("RGB", (W, H))
    shifted.paste(inc, (int(W * 0.28), 0))
    shifted.paste(inc.crop((0, 0, int(W * 0.28), H)), (0, 0))
    cases.append((
        "panned_28pc", shifted, "NEW DESIGN",
        "the scene panned across by 28 per cent of width",
    ))
    # A vertical squeeze with a new skyline band: the horizon moves, which is
    # what "alternative composition in the same style" tends to mean in practice.
    squeezed = Image.new("RGB", (W, H))
    squeezed.paste(inc.resize((W, int(H * 0.62)), Image.LANCZOS), (0, int(H * 0.38)))
    squeezed.paste(inc.crop((0, 0, W, int(H * 0.38))).transpose(
        Image.FLIP_TOP_BOTTOM), (0, 0))
    cases.append((
        "horizon_moved", squeezed, "NEW DESIGN",
        "horizon relocated, upper band replaced; the real shape of a recomposition",
    ))

    print(f"classifier threshold: r >= {ENHANCEMENT_MIN_R} and cells moved "
          f"<= {ENHANCEMENT_MAX_MOVED * 100:g} per cent")
    print(f"incumbent: {INCUMBENT.name} {W}x{H}\n")

    failures = 0
    for name, img, expected, why in cases:
        comp = composition_correspondence(inc, img)
        got = classify(comp)
        ok = got == expected
        if not ok:
            failures += 1
        print(f"  [{'PASS' if ok else 'FAIL'}] {name:34s} "
              f"r={comp['pearson_r_vs_incumbent']:7.4f} "
              f"moved={comp['share_cells_moved_gt_half_sd'] * 100:5.1f}%  "
              f"expected {expected:11s} got {got}")
        print(f"         {why}")

    # And the live control from the vendor drop, which is the case that matters
    # most: a file whose README declares it an enhancement must classify as one.
    declared = SRC_DIR / "bg_original_enhanced.jpg"
    if declared.exists():
        comp = composition_correspondence(inc, Image.open(declared))
        got = classify(comp)
        ok = got == "ENHANCEMENT"
        if not ok:
            failures += 1
        print(f"\n  [{'PASS' if ok else 'FAIL'}] vendor declared enhancement      "
              f"r={comp['pearson_r_vs_incumbent']:7.4f} "
              f"moved={comp['share_cells_moved_gt_half_sd'] * 100:5.1f}%  "
              f"expected ENHANCEMENT got {got}")
        print("         bg_original_enhanced.jpg, README: keeps the exact same scene")
    else:
        print(f"\n  [SKIP] vendor declared enhancement absent: {declared}")

    total = len(cases) + (1 if declared.exists() else 0)
    print(f"\n{total - failures} of {total} cases as expected")
    if failures:
        print("SELF-TEST FAILED: the classifier does not separate the two classes, "
              "so its verdicts on the candidates carry no weight")
        return 1
    print("SELF-TEST PASSED: the classifier returns ENHANCEMENT on real "
          "enhancements and NEW DESIGN on real recompositions, so its NEW "
          "DESIGN verdict on the candidates is a finding rather than a default")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
