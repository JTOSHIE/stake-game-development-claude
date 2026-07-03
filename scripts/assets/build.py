#!/usr/bin/env python3
"""AssetForge v2 deterministic asset pipeline.

Renders every export declared in manifest.json from the vector masters in
design-system/masters/ to exact pixel sizes under
frontend/public/assets/themes/future-spinner/.

Deterministic and reproducible: same inputs produce byte-identical outputs
(cairosvg and Pillow embed no timestamps; JSON is written with sorted keys).

Run via `npm run assets` (from frontend/) or directly:
    scripts/assets/.venv/bin/python scripts/assets/build.py
"""
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

import cairosvg
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SVG_NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NS)

manifest = json.loads((HERE / "manifest.json").read_text())
MASTERS = ROOT / manifest["masters_root"]
OUT = ROOT / manifest["output_root"]

count = 0


def render(src_path: Path, out_rel: str, w: int, h: int):
    global count
    out_path = OUT / out_rel
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cairosvg.svg2png(
        url=str(src_path), write_to=str(out_path),
        output_width=w, output_height=h,
    )
    count += 1
    print(f"  {out_rel:42s} {w}x{h}")


def render_bytes(svg_bytes: bytes, out_rel: str, w: int, h: int):
    global count
    out_path = OUT / out_rel
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cairosvg.svg2png(
        bytestring=svg_bytes, write_to=str(out_path),
        output_width=w, output_height=h,
    )
    count += 1
    print(f"  {out_rel:42s} {w}x{h}  (layered)")


def top_level_matches(child, group_ids, match_transform):
    cid = child.get("id")
    ctf = child.get("transform")
    if group_ids and cid in group_ids:
        return True
    if match_transform and ctf == match_transform:
        return True
    return False


def layered(src_path: Path, spec):
    """Produce two sprites: the named groups alone on transparency (out_only),
    and the master with those groups removed (out_base)."""
    group_ids = set(spec.get("group_ids", []))
    match_transform = spec.get("match_transform")
    w, h = spec["w"], spec["h"]

    # base: remove the matching top-level groups
    tree = ET.parse(src_path)
    root = tree.getroot()
    for child in list(root):
        if top_level_matches(child, group_ids, match_transform):
            root.remove(child)
    render_bytes(ET.tostring(root, encoding="utf-8"), spec["out_base"], w, h)

    # only: keep <defs> and the matching groups, drop everything else drawable
    tree = ET.parse(src_path)
    root = tree.getroot()
    for child in list(root):
        tag = child.tag.split("}")[-1]
        if tag == "defs":
            continue
        if not top_level_matches(child, group_ids, match_transform):
            root.remove(child)
    render_bytes(ET.tostring(root, encoding="utf-8"), spec["out_only"], w, h)


def build_tile_plate(spec):
    global count
    w, h = spec["w"], spec["h"]
    radius = spec["radius"]
    fill = spec["fill"]
    grid_alpha = int(round(spec["grid_alpha"] * 255))
    step = spec["grid_step"]
    r = int(fill[1:3], 16); g = int(fill[3:5], 16); b = int(fill[5:7], 16)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=(r, g, b, 255))
    # faint interior grid, clipped to the plate via a mask
    grid = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for x in range(step, w, step):
        gd.line([(x, 0), (x, h)], fill=(255, 255, 255, grid_alpha), width=1)
    for y in range(step, h, step):
        gd.line([(0, y), (w, y)], fill=(255, 255, 255, grid_alpha), width=1)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    img.paste(grid, (0, 0), Image.composite(grid.split()[3], Image.new("L", (w, h), 0), mask))
    out_path = OUT / spec["out"]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG")
    count += 1
    print(f"  {spec['out']:42s} {w}x{h}  (procedural plate)")


def build_plates_json(spec):
    global count
    payload = {
        "note": spec["note"],
        "plate_sprite": spec["plate_sprite"],
        "colours": spec["colours"],
    }
    out_path = OUT / spec["out"]
    out_path.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")
    count += 1
    print(f"  {spec['out']:42s}        (colour table)")


def main():
    if not MASTERS.exists():
        sys.exit(f"masters root not found: {MASTERS}")
    print(f"AssetForge v2 build -> {OUT.relative_to(ROOT)}")

    print("[symbols] 240x240 and 120x120")
    for sym in manifest["symbols"]:
        src = MASTERS / sym["src"]
        for size in manifest["symbol_sizes"]:
            render(src, f"symbols/{sym['id']}{size['suffix']}.png", size["w"], size["h"])

    print("[exports]")
    for e in manifest["exports"]:
        render(MASTERS / e["src"], e["out"], e["w"], e["h"])

    print("[layered]")
    for spec in manifest["layered"]:
        layered(MASTERS / spec["src"], spec)

    print("[tile plate + plates.json]")
    build_tile_plate(manifest["tile_plate"])
    build_plates_json(manifest["plates_json"])

    print(f"done: {count} outputs")


if __name__ == "__main__":
    main()
