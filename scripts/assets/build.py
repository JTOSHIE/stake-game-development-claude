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
from PIL import Image, ImageDraw, ImageFilter

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


def top_level_matches(child, group_ids, match_transform, href_ids):
    cid = child.get("id")
    ctf = child.get("transform")
    if group_ids and cid in group_ids:
        return True
    if match_transform and ctf == match_transform:
        return True
    if href_ids:
        href = child.get("href") or child.get("{http://www.w3.org/1999/xlink}href")
        if href and href.lstrip("#") in href_ids:
            return True
    return False


def layered(src_path: Path, spec):
    """Produce two sprites: the named groups alone on transparency (out_only),
    and the master with those groups removed (out_base). group_ids matches a
    top-level element's own id; href_ids also matches <use> elements whose
    href references one of those ids (for repeated-instance groups, e.g. the
    brand mark's five-fold blade cluster: one real <g id="bpair"> plus four
    <use href="#bpair"> clones at different rotations)."""
    group_ids = set(spec.get("group_ids", []))
    match_transform = spec.get("match_transform")
    href_ids = set(spec.get("href_ids", []))
    w, h = spec["w"], spec["h"]

    # base: remove the matching top-level groups
    tree = ET.parse(src_path)
    root = tree.getroot()
    for child in list(root):
        if top_level_matches(child, group_ids, match_transform, href_ids):
            root.remove(child)
    render_bytes(ET.tostring(root, encoding="utf-8"), spec["out_base"], w, h)

    # only: keep <defs> and the matching groups, drop everything else drawable
    tree = ET.parse(src_path)
    root = tree.getroot()
    for child in list(root):
        tag = child.tag.split("}")[-1]
        if tag == "defs":
            continue
        if not top_level_matches(child, group_ids, match_transform, href_ids):
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


def _hex_rgb(h):
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _draw_shock_ring(w, h, colour):
    r, g, b = _hex_rgb(colour)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cx, cy = w / 2, h / 2
    radius = min(w, h) * 0.36
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        outline=(r, g, b, 255), width=max(2, int(min(w, h) * 0.09)),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=max(2, min(w, h) * 0.035)))
    core = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(core).ellipse(
        [cx - radius, cy - radius, cx + radius, cy + radius],
        outline=(255, 255, 255, 235), width=max(1, int(min(w, h) * 0.02)),
    )
    img = Image.alpha_composite(img, glow)
    img = Image.alpha_composite(img, core)
    return img


def _draw_spark(w, h, colour):
    r, g, b = _hex_rgb(colour)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cx, cy = w / 2, h / 2
    bar_len = min(w, h) * 0.42
    bar_thick = max(1, min(w, h) * 0.07)
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.line([(cx - bar_len, cy), (cx + bar_len, cy)], fill=(r, g, b, 255), width=int(bar_thick))
    gd.line([(cx, cy - bar_len), (cx, cy + bar_len)], fill=(r, g, b, 255), width=int(bar_thick))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=max(1, min(w, h) * 0.06)))
    core = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cd = ImageDraw.Draw(core)
    core_len = bar_len * 0.6
    core_thick = max(1, bar_thick * 0.4)
    cd.line([(cx - core_len, cy), (cx + core_len, cy)], fill=(255, 255, 255, 255), width=int(core_thick))
    cd.line([(cx, cy - core_len), (cx, cy + core_len)], fill=(255, 255, 255, 255), width=int(core_thick))
    img = Image.alpha_composite(img, glow)
    img = Image.alpha_composite(img, core)
    return img


def _draw_coin(w, h, colour):
    r, g, b = _hex_rgb(colour)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cx, cy = w / 2, h / 2
    radius = min(w, h) * 0.42
    d = ImageDraw.Draw(img)
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=(r, g, b, 255))
    rim = max(1, radius * 0.12)
    dark = (max(0, r - 90), max(0, g - 90), max(0, b - 60), 255)
    d.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], outline=dark, width=int(rim))
    inner = radius * 0.62
    d.ellipse([cx - inner, cy - inner, cx + inner, cy + inner], outline=dark, width=max(1, int(rim * 0.5)))
    highlight = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    hd = ImageDraw.Draw(highlight)
    hr = radius * 0.5
    hcx, hcy = cx - radius * 0.32, cy - radius * 0.32
    hd.ellipse([hcx - hr, hcy - hr, hcx + hr, hcy + hr], fill=(255, 255, 255, 130))
    highlight = highlight.filter(ImageFilter.GaussianBlur(radius=max(1, radius * 0.18)))
    img = Image.alpha_composite(img, highlight)
    return img


def _draw_smoke_puff(w, h, colour):
    r, g, b = _hex_rgb(colour)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    cx, cy = w / 2, h / 2
    base_r = min(w, h) * 0.22
    # A few overlapping soft lobes offset from centre break up the perfect
    # circle so it reads as a wisp, not a disc.
    lobes = [(0, 0, 1.0), (0.28, -0.12, 0.72), (-0.3, 0.08, 0.68), (0.05, 0.3, 0.6), (-0.12, -0.28, 0.55)]
    for ox, oy, scale in lobes:
        lr = base_r * scale
        lcx, lcy = cx + ox * min(w, h), cy + oy * min(w, h)
        d = ImageDraw.Draw(img)
        d.ellipse([lcx - lr, lcy - lr, lcx + lr, lcy + lr], fill=(r, g, b, 70))
    img = img.filter(ImageFilter.GaussianBlur(radius=max(2, min(w, h) * 0.09)))
    return img


PARTICLE_DRAWERS = {
    "shock_ring": _draw_shock_ring,
    "spark": _draw_spark,
    "coin": _draw_coin,
    "smoke_puff": _draw_smoke_puff,
}


def build_particle(spec):
    """Procedural, palette-sourced particle textures (2026-07-16, ANIMATION
    UPLIFT PASS): small win/anticipation/splash choreography particles drawn
    directly with PIL (no SVG master, no external tool - a simple geometric
    shape plus a Gaussian-blurred glow layer is enough for each of these)."""
    global count
    kind = spec["kind"]
    w, h = spec["w"], spec["h"]
    drawer = PARTICLE_DRAWERS.get(kind)
    if drawer is None:
        raise ValueError(f"unknown particle kind: {kind}")
    img = drawer(w, h, spec["colour"])
    out_path = OUT / spec["out"]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_path, "PNG", optimize=True)
    count += 1
    print(f"  {spec['out']:42s} {w}x{h}  (procedural particle: {kind})")


def build_brand_export(spec):
    """Copies a design-system/brand/ master into the bundle with palette
    compression (2026-07-16, ANIMATION UPLIFT PASS item 1 - the splash
    needs the hero emblem inside frontend/public, not just the design-system
    source). Source is a raster PNG (not an SVG master), so this is a plain
    PIL palette-reduce + optimize rather than an svg2png render; the
    design-system source itself is untouched.

    Kept as flat RGB (no alpha): the master's own background is already a
    near-uniform solid colour, so the consuming component matches its own
    backdrop to that same colour instead of paying for a chroma-keyed alpha
    channel, which roughly doubles the file size for a soft-edge gradient
    PNG's palette mode can't represent in a single byte-per-pixel index."""
    global count
    src_path = ROOT / spec["src"]
    img = Image.open(src_path).convert("RGB")
    colors = spec.get("palette_colors", 256)
    out_img = img.convert("P", palette=Image.ADAPTIVE, colors=colors)
    out_path = OUT / spec["out"]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_img.save(out_path, "PNG", optimize=True)
    count += 1
    size_kb = out_path.stat().st_size / 1024
    print(f"  {spec['out']:42s} {img.size[0]}x{img.size[1]}  (brand export, {colors}-colour palette, {size_kb:.1f}KB)")


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

    print("[particles]")
    for spec in manifest.get("particles", []):
        build_particle(spec)

    print("[brand exports]")
    for spec in manifest.get("brand_exports", []):
        build_brand_export(spec)

    print(f"done: {count} outputs")


if __name__ == "__main__":
    main()
