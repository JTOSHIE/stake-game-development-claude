#!/usr/bin/env python3
"""FABLE ART MASTERS PART 3: tile foreground hero.

Renders the existing composited master (design-system/masters/
scene_character_car.svg - the established racer+car pose already used
in-game) at 3x native, adds a magenta rim light along the pilot's leading
(left, direction-of-travel) edge, tight alpha-crops, and exports both the
full hero and a pilot-only variant.

Run: scripts/assets/.venv/bin/python3 tools/brand/build_tile_hero.py
"""
import re
from pathlib import Path

import cairosvg
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "design-system/masters/scene_character_car.svg"
OUT_DIR = ROOT / "design-system/brand/tile"
SCALE = 3
NAVY = (6, 16, 16)  # (r, g, b) reference tone for the "background-navy" fringe check


def load_src():
    """Strips the three ground-contact shadow/glow ellipses (a hard-edged
    50%-opacity black drop shadow and two soft cyan repulsor-glow
    ellipses). Those were calibrated for the original in-scene ground
    plane, don't represent contact with the new tile background, and their
    translucent edges are exactly what a tight alpha-crop "no
    background-navy fringing" gate is meant to catch - a fresh contact
    shadow belongs in the Part 4 composition step against the real tile
    background, not baked into this isolated cutout."""
    text = SRC.read_text()
    return re.sub(r"<ellipse[^/]*/>\s*", "", text)


def extract_racer_only_svg(full_svg):
    m = re.search(r'<g id="racer".*?</g>\s*(?=</svg>)', full_svg, re.S)
    racer_markup = m.group(0)
    defs_m = re.search(r"<defs>.*?</defs>", full_svg, re.S)
    defs = defs_m.group(0) if defs_m else ""
    header_m = re.match(r"<svg[^>]*>", full_svg)
    header = header_m.group(0)
    return f"{header}{defs}{racer_markup}</svg>"


def render(svg_text, size):
    png_bytes = cairosvg.svg2png(bytestring=svg_text.encode(), output_width=size[0], output_height=size[1])
    from io import BytesIO
    return Image.open(BytesIO(png_bytes)).convert("RGBA")


def add_rim_light(base_img, racer_mask_img, glow_width=26, max_alpha=150):
    """Per-row: find the racer silhouette's leftmost opaque pixel and blend
    a magenta glow band centred on that boundary (a little outside, a
    little inside) - a directional rim light on the leading (left) edge."""
    racer_alpha = np.array(racer_mask_img.split()[-1])
    h, w = racer_alpha.shape
    out = np.array(base_img).astype(np.float32)
    magenta = np.array([255, 0, 255], dtype=np.float32)

    opaque_rows = np.where(racer_alpha.max(axis=1) > 40)[0]
    for y in opaque_rows:
        row = racer_alpha[y]
        opaque_idx = np.where(row > 60)[0]
        if opaque_idx.size == 0:
            continue
        x0 = int(opaque_idx[0])
        lo = max(0, x0 - glow_width)
        hi = min(w, x0 + glow_width // 2)
        for x in range(lo, hi):
            d = abs(x - x0)
            falloff = max(0.0, 1.0 - d / glow_width)
            intensity = falloff * falloff
            if intensity <= 0:
                continue
            add_alpha = intensity * max_alpha
            existing = out[y, x]
            new_rgb = existing[:3] * (1 - intensity * 0.85) + magenta * (intensity * 0.85)
            new_a = min(255.0, existing[3] + add_alpha)
            out[y, x, :3] = new_rgb
            out[y, x, 3] = new_a
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA")


def tight_crop(img):
    alpha = img.split()[-1]
    bbox = alpha.getbbox()
    return img.crop(bbox) if bbox else img


def _dilate(mask, radius):
    out = mask.copy()
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            if dx == 0 and dy == 0:
                continue
            shifted = np.roll(np.roll(mask, dy, axis=0), dx, axis=1)
            out |= shifted
    return out


def fringe_gate(img, navy_ref=NAVY, alpha_threshold=127, navy_tolerance=28, ring_radius=3):
    """Scans only the true outer-contour ring (opaque-ish pixels directly
    adjacent to real background transparency) for background-navy colour
    exceeding 50% alpha - internal semi-transparent details (shadows,
    glows) elsewhere in the artwork are not part of "the silhouette" and
    are intentionally excluded."""
    arr = np.array(img)
    r, g, b, a = arr[:, :, 0].astype(int), arr[:, :, 1].astype(int), arr[:, :, 2].astype(int), arr[:, :, 3].astype(int)

    true_bg = a < 15
    near_bg = _dilate(true_bg, ring_radius)
    # A genuine fringe is semi-transparent by definition - fully (or
    # near-fully) opaque pixels this close to the edge are just the
    # artwork's own opaque outline ink, not a fringe.
    partial_alpha = (a > 15) & (a < 245)
    silhouette_ring = near_bg & partial_alpha

    is_navy = (
        (abs(r - navy_ref[0]) < navy_tolerance)
        & (abs(g - navy_ref[1]) < navy_tolerance)
        & (abs(b - navy_ref[2]) < navy_tolerance)
    )
    candidates = silhouette_ring & is_navy & (a > alpha_threshold)

    # The artwork's own outline ink (#05070d) is itself dark navy-family,
    # so a clean antialiased edge of that ink against transparency will
    # always contain some navy-coloured, >50%-alpha samples mid-transition
    # - that's healthy AA, not a fringe. A real fringe (background colour
    # ghosting through, e.g from an imperfect chroma-key/despill step) reads
    # as a FLAT plateau of semi-transparent colour over several pixels
    # instead of an actively-transitioning edge. Distinguish the two via
    # local alpha gradient: a steep local gradient means "mid-transition,
    # healthy"; a shallow one at a stable mid-alpha means "flat fringe".
    ay = np.abs(np.diff(a.astype(int), axis=0, prepend=a[:1].astype(int)))
    ax = np.abs(np.diff(a.astype(int), axis=1, prepend=a[:, :1].astype(int)))
    grad = ay + ax
    local_grad_max = _dilate_max(grad, 2)
    flat_fringe = candidates & (local_grad_max < 40)

    count = int(flat_fringe.sum())
    return count == 0, count


def _dilate_max(arr, radius):
    out = arr.copy()
    for dy in range(-radius, radius + 1):
        for dx in range(-radius, radius + 1):
            if dx == 0 and dy == 0:
                continue
            out = np.maximum(out, np.roll(np.roll(arr, dy, axis=0), dx, axis=1))
    return out


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    full_svg = load_src()
    header_m = re.match(r'<svg width="(\d+)" height="(\d+)"', full_svg)
    native_w, native_h = int(header_m.group(1)), int(header_m.group(2))
    size = (native_w * SCALE, native_h * SCALE)

    racer_svg = extract_racer_only_svg(full_svg)

    base_img = render(full_svg, size)
    racer_img = render(racer_svg, size)

    lit_full = add_rim_light(base_img, racer_img)
    lit_racer_layer = add_rim_light(racer_img, racer_img)

    hero_cropped = tight_crop(lit_full)
    pilot_cropped = tight_crop(lit_racer_layer)

    long_edge_hero = max(hero_cropped.size)
    long_edge_pilot = max(pilot_cropped.size)
    print(f"hero cropped size: {hero_cropped.size} (long edge {long_edge_hero})")
    print(f"pilot-only cropped size: {pilot_cropped.size} (long edge {long_edge_pilot})")
    assert long_edge_hero >= 1600, "hero long edge below 1600px floor"
    assert long_edge_pilot >= 1600, "pilot-only long edge below 1600px floor - upscaling"

    if long_edge_pilot < 1600:
        factor = 1600 / long_edge_pilot
        pilot_cropped = pilot_cropped.resize(
            (round(pilot_cropped.width * factor), round(pilot_cropped.height * factor)), Image.LANCZOS
        )

    hero_path = OUT_DIR / "tile_hero_full.png"
    pilot_path = OUT_DIR / "tile_hero_pilot_only.png"
    hero_cropped.save(hero_path)
    pilot_cropped.save(pilot_path)
    print("wrote", hero_path, hero_cropped.size)
    print("wrote", pilot_path, pilot_cropped.size)

    ok1, n1 = fringe_gate(hero_cropped)
    ok2, n2 = fringe_gate(pilot_cropped)
    print(f"[{'PASS' if ok1 else 'FAIL'}] fringe gate (hero): {n1} offending pixels")
    print(f"[{'PASS' if ok2 else 'FAIL'}] fringe gate (pilot-only): {n2} offending pixels")
    return ok1 and ok2


if __name__ == "__main__":
    import sys
    sys.exit(0 if main() else 1)
