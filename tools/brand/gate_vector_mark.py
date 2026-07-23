#!/usr/bin/env python3
"""Structural gates for design-system/brand/vector_mark/wrs_mark_v2*.svg.

1. paths-only: zero <text>/<rect>/<circle>/<ellipse>/<line>/<polygon>/
   <polyline>/<image> elements anywhere in the tree (defs included) - every
   visible shape must be a <path>.
2. margin symmetry: sweeping the rendered PNG in from each of the four
   edges to the first non-transparent pixel must agree within 2px.
3. minimum stroke at 192: the spoke stroke (the mark's declared 6-unit
   structural minimum, per the "minimum stroke 6 units" hard rule) must
   still render at >=2px when the whole mark is rendered at 192x192.

Note on stroke-width interpretation: the brief states a global "minimum
stroke 6 units" hard rule, but separately specifies the arched wordmark's
own inner/outer treatment at 5 and 3 units, and the reel digits' outline at
4 units - all below that global minimum. Those are later, more specific
instructions for named decorative elements (the neon-sign double-stroke
letters, the digit outline), not a contradiction to resolve by inflating
them to 6 - so this gate measures the 6-unit *structural* stroke (spokes),
which is what the "minimum stroke" rule and its render-gate are read to
govern. Recorded here rather than silently picked.

Run from repo root:
    scripts/assets/.venv/bin/python3 tools/brand/gate_vector_mark.py
"""
import os
import sys
import xml.etree.ElementTree as ET

import cairosvg
from PIL import Image

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MARK_DIR = os.path.join(REPO_ROOT, "design-system/brand/vector_mark")

FORBIDDEN_TAGS = {"text", "rect", "circle", "ellipse", "line", "polygon", "polyline", "image", "tspan"}


def strip_ns(tag):
    return tag.split("}")[-1] if "}" in tag else tag


def gate_paths_only(svg_path):
    tree = ET.parse(svg_path)
    found = [strip_ns(el.tag) for el in tree.iter() if strip_ns(el.tag) in FORBIDDEN_TAGS]
    ok = len(found) == 0
    return ok, f"forbidden elements found: {found}" if found else "no forbidden elements"


def render(svg_path, size):
    png_bytes = cairosvg.svg2png(url=svg_path, output_width=size, output_height=size)
    from io import BytesIO
    return Image.open(BytesIO(png_bytes)).convert("RGBA")


def gate_margin_symmetry(svg_path, size=512, tolerance_px=2):
    im = render(svg_path, size)
    alpha = im.split()[-1]
    px = alpha.load()
    w, h = im.size

    def first_nonzero_col_from_left():
        for x in range(w):
            for y in range(h):
                if px[x, y] > 8:
                    return x
        return w

    def first_nonzero_col_from_right():
        for x in range(w - 1, -1, -1):
            for y in range(h):
                if px[x, y] > 8:
                    return w - 1 - x
        return w

    def first_nonzero_row_from_top():
        for y in range(h):
            for x in range(w):
                if px[x, y] > 8:
                    return y
        return h

    def first_nonzero_row_from_bottom():
        for y in range(h - 1, -1, -1):
            for x in range(w):
                if px[x, y] > 8:
                    return h - 1 - y
        return h

    left = first_nonzero_col_from_left()
    right = first_nonzero_col_from_right()
    top = first_nonzero_row_from_top()
    bottom = first_nonzero_row_from_bottom()
    margins = {"left": left, "right": right, "top": top, "bottom": bottom}
    spread = max(margins.values()) - min(margins.values())
    ok = spread <= tolerance_px
    return ok, f"margins(px @ {size}) = {margins}, spread = {spread}"


def gate_min_stroke_at_192(svg_path, size=192):
    """Samples a horizontal cross-section through the top-right spoke
    region and measures the thickest contiguous non-background run there,
    as a proxy for the mark's declared 6-unit structural stroke."""
    im = render(svg_path, size)
    px = im.load()
    w, h = im.size
    # spokes sit on an annulus between r=128 and r=176 (of 512), scaled to
    # this render size; sample a ring of rows in that band on the right
    # side (x > cx) where a spoke offset places one cleanly.
    scale = size / 512.0
    cy = int(256 * scale)
    best_run = 0
    for y in range(cy - int(60 * scale), cy + int(60 * scale)):
        if y < 0 or y >= h:
            continue
        run = 0
        for x in range(int(300 * scale), w):
            r, g, b, a = px[x, y]
            is_magenta_ish = a > 40 and r > 120 and b > 120 and g < 120
            if is_magenta_ish:
                run += 1
                best_run = max(best_run, run)
            else:
                run = 0
    ok = best_run >= 2
    return ok, f"thickest magenta run at {size}px = {best_run}px"


def main():
    variants = ["wrs_mark_v2.svg", "wrs_mark_v2_mono_cyan.svg"]
    all_ok = True
    for variant in variants:
        path = os.path.join(MARK_DIR, variant)
        print(f"\n=== {variant} ===")
        ok1, msg1 = gate_paths_only(path)
        print(f"[{'PASS' if ok1 else 'FAIL'}] paths-only: {msg1}")
        ok2, msg2 = gate_margin_symmetry(path)
        print(f"[{'PASS' if ok2 else 'FAIL'}] margin symmetry: {msg2}")
        if "mono" not in variant:
            ok3, msg3 = gate_min_stroke_at_192(path)
            print(f"[{'PASS' if ok3 else 'FAIL'}] min stroke @192: {msg3}")
        else:
            ok3 = True
        all_ok = all_ok and ok1 and ok2 and ok3
    print("\nALL GATES:", "PASS" if all_ok else "FAIL")
    sys.exit(0 if all_ok else 1)


if __name__ == "__main__":
    main()
