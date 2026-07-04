#!/usr/bin/env python3
"""Symbol Life v2 flipbook sprite sheets (Reel Feel v3, Task 3).

Exports deterministic flipbook sprite sheets for the two symbol FX the brief
names for pipeline export, each played on the reel tile's fx overlay via a CSS
steps() loop (no per-frame allocation in the engine, matching flame_jets.py):

  - symbols/m3_flame_sheet.png   6-frame booster-flame flicker (from the
                                 M3 jetFlame group), 200x200 per frame.
  - symbols/l2_fuse_sheet.png    4-frame fuse-arc flicker (from the L2 fuseArc
                                 group), 200x200 per frame.
  - *_static.png                 a single settled frame for prefers-reduced-motion.

Frames are rendered from the full 1024 viewBox so the FX overlays the symbol in
its exact position (the engine stacks the sheet over the base symbol at the same
82% box, screen-blended). Determinism: fixed FRAMES tables, no RNG/time, sheets
packed left-to-right by alpha_composite, mirroring flame_jets.py.

Run via `npm run assets` (chained after flame_jets.py) or directly:
    scripts/assets/.venv/bin/python scripts/assets/symbol_fx.py
"""
import xml.etree.ElementTree as ET
from pathlib import Path

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
MASTERS = ROOT / "design-system/masters"
OUT = ROOT / "frontend/public/assets/themes/future-spinner/symbols"
TMP = Path(__file__).resolve().parent / ".fx_tmp"
NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)

FRAME = 200  # per-frame square, rendered from the full 1024 viewBox

# M3 booster flame — group scale about the nozzle mouth (452,512) + core opacity.
# 6 frames: a brief flare then settle, never a linear ramp.
M3_FRAMES = [
    (0.92, 0.95, 0.74),
    (1.00, 1.00, 0.96),
    (1.10, 1.07, 0.82),
    (1.04, 1.00, 1.00),
    (0.97, 0.99, 0.86),
    (0.90, 0.94, 0.70),
]

# L2 fuse arc — electric flicker: whole-group opacity + a vertical jitter so the
# bolt reads as arcing. 4 frames.
L2_FRAMES = [
    (1.00, 0.0),
    (0.72, -4.0),
    (1.00, 3.0),
    (0.58, -2.0),
]


def local(el):
    return el.tag.split("}")[-1]


def keep_only(root, keep_id):
    for child in list(root):
        if local(child) == "defs":
            continue
        if child.get("id") == keep_id:
            continue
        root.remove(child)


def render(root, out, w, h):
    out.parent.mkdir(parents=True, exist_ok=True)
    cairosvg.svg2png(bytestring=ET.tostring(root, encoding="utf-8"),
                     write_to=str(out), output_width=w, output_height=h)


def pack(frames, out):
    sheet = Image.new("RGBA", (FRAME * len(frames), FRAME), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        sheet.alpha_composite(f, (i * FRAME, 0))
    sheet.save(out, "PNG")


def build_m3():
    src = MASTERS / "M3_master_v3.svg"
    frames = []
    for i, (sx, sy, co) in enumerate(M3_FRAMES):
        tree = ET.parse(src); root = tree.getroot()
        keep_only(root, "jetFlame")
        flame = root.find(f".//{{{NS}}}g[@id='jetFlame']")
        flame.set("transform", f"translate(452 512) scale({sx} {sy}) translate(-452 -512)")
        core = root.find(f".//{{{NS}}}path[@id='flameCore']")
        if core is not None:
            core.set("opacity", f"{round(0.95 * co, 3)}")
        tmp = TMP / f"m3_{i}.png"
        render(root, tmp, FRAME, FRAME)
        frames.append(Image.open(tmp).convert("RGBA"))
    pack(frames, OUT / "m3_flame_sheet.png")
    frames[3].save(OUT / "m3_flame_static.png", "PNG")
    return len(frames)


def build_l2():
    src = MASTERS / "L2_reel_fuse.svg"
    frames = []
    for i, (op, dy) in enumerate(L2_FRAMES):
        tree = ET.parse(src); root = tree.getroot()
        keep_only(root, "fuseArc")
        arc = root.find(f".//{{{NS}}}g[@id='fuseArc']")
        arc.set("opacity", f"{op}")
        arc.set("transform", f"translate(0 {dy})")
        tmp = TMP / f"l2_{i}.png"
        render(root, tmp, FRAME, FRAME)
        frames.append(Image.open(tmp).convert("RGBA"))
    pack(frames, OUT / "l2_fuse_sheet.png")
    frames[0].save(OUT / "l2_fuse_static.png", "PNG")
    return len(frames)


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    n_m3 = build_m3()
    n_l2 = build_l2()
    for p in TMP.glob("*.png"):
        p.unlink()
    TMP.rmdir()
    print(f"symbol fx -> {OUT.relative_to(ROOT)}: "
          f"m3_flame_sheet.png ({n_m3} frames {FRAME}x{FRAME}), "
          f"l2_fuse_sheet.png ({n_l2} frames {FRAME}x{FRAME})")


if __name__ == "__main__":
    main()
