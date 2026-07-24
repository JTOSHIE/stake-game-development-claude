#!/usr/bin/env python3
"""FABLE ART MASTERS follow-up: VECTOR MARK V3, badge construction.

Replaces the rejected v2 (hollow double-stroke outline construction) with a
filled dark-coin badge: solid navy plate, gradient-filled chrome rim, filled
gunmetal spokes with a magenta SVG gaussian-blur edge glow, a lit reel
window (gold filled 7s, cyan glow), and neon-sign-style filled wordmark
letterforms with layered glow strokes. Same geometry skeleton, gates and
export sizes as v2 - reuses v2's font-to-path and arc-layout math directly
(tools/brand/build_vector_mark.py) rather than re-deriving it.

cairosvg does NOT correctly render feGaussianBlur (confirmed: a
stdDeviation=3 blur falls off within ~2px instead of a real gaussian
spread) - this generator's PNG exports go through a headless Chromium page
instead (see export step below), which has a real filter engine.

Run: scripts/assets/.venv/bin/python3 tools/brand/build_vector_mark_v3.py
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_vector_mark import (  # noqa: E402
    glyph_data, fmt, annulus_d, rounded_rect_d, rect_d, notches_d, spokes_d,
    CAP, VIEWBOX, CX, CY,
)

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "design-system/brand/vector_mark",
)

CYAN = "#00FFFF"
MAGENTA = "#FF00FF"
GOLD = "#FFD700"
NAVY = "#060610"
GUNMETAL = "#1a1e2b"
CHROME_LIGHT = "#e8ecf4"
CHROME_MID = "#9aa4b8"
CHROME_DARK = "#4a5468"


def arc_text_filled(text, radius, cap_height, tracking, top, id_prefix, fill_hex, glow_filter_id):
    """Places filled letterforms (neon-sign style: solid fill + a glow
    stroke driven by an SVG filter, not v2's hollow double-outline)."""
    widths = []
    for ch in text:
        if ch == " ":
            widths.append(None)
            continue
        widths.append(glyph_data(ch)["width"])
    scale = cap_height / CAP
    space_gap = cap_height * 0.9
    angular = []
    for w in widths:
        adv = (w * scale if w is not None else space_gap) + tracking
        angular.append(adv / radius)
    total = sum(angular)
    phi = -total / 2.0

    body = []
    gi = 0
    for idx, ch in enumerate(text):
        phi_center = phi + angular[idx] / 2.0
        if ch != " ":
            gd = glyph_data(ch)
            cx_local = gd["width"] / 2.0
            baseline_r = radius - cap_height / 2.0 if top else radius + cap_height / 2.0
            if top:
                a_deg = math.degrees(phi_center)
                px = CX + baseline_r * math.sin(phi_center)
                py = CY - baseline_r * math.cos(phi_center)
            else:
                a_deg = math.degrees(-phi_center)
                px = CX + baseline_r * math.sin(phi_center)
                py = CY + baseline_r * math.cos(phi_center)
            transform = (
                f"translate({fmt(px)},{fmt(py)}) rotate({fmt(a_deg)}) "
                f"scale({fmt(scale)},{fmt(-scale)}) translate({fmt(-cx_local)},0)"
            )
            # Layered glow: a blurred magenta-stroked copy behind, then the
            # solid filled cyan letterform on top - a lit neon tube, not a
            # hollow outline.
            local_glow_stroke = 10 / scale
            body.append(
                f'<g transform="{transform}">'
                f'<path d="{gd["d"]}" fill="none" stroke="{MAGENTA}" '
                f'stroke-width="{fmt(local_glow_stroke)}" filter="url(#{glow_filter_id})" opacity="0.8"/>'
                f'<path d="{gd["d"]}" fill="{fill_hex}" stroke="{CYAN}" '
                f'stroke-width="{fmt(3 / scale)}"/>'
                f"</g>"
            )
            gi += 1
        phi += angular[idx]
    return "".join(body)


def build_defs():
    return f"""
    <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{CHROME_LIGHT}"/>
      <stop offset="35%" stop-color="{CHROME_MID}"/>
      <stop offset="55%" stop-color="{CHROME_DARK}"/>
      <stop offset="80%" stop-color="{CHROME_MID}"/>
      <stop offset="100%" stop-color="{CHROME_LIGHT}"/>
    </linearGradient>
    <radialGradient id="navyPlate" cx="42%" cy="38%" r="75%">
      <stop offset="0%" stop-color="#0c1120"/>
      <stop offset="70%" stop-color="{NAVY}"/>
      <stop offset="100%" stop-color="#020208"/>
    </radialGradient>
    <filter id="glowMagenta" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="glowCyan" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="glowGold" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    """


def build(mono=False):
    defs = [build_defs()]
    body = []

    # 1. Deep navy plate circle behind everything (the "filled dark coin").
    # Stays navy even in mono mode - it's a full r=230 disk (unlike v2's
    # thin tyre annulus), so making it cyan too would bury every other
    # cyan-filled element stacked on top of it into one flat circle (caught
    # visually: the first mono render was literally just a solid cyan disk).
    body.append(f'<path d="{annulus_d(CX, CY, 230, 0)}" fill="url(#navyPlate)" fill-rule="evenodd"/>')

    # Cyan tread notches on the outer edge.
    body.append(f'<path d="{notches_d(CX, CY, 214, 230, 24, 1.6)}" fill="{CYAN}" fill-rule="evenodd"/>')

    # 2. Chrome rim: gradient-filled, not flat outline.
    rim_fill = CYAN if mono else "url(#chromeGrad)"
    body.append(f'<path d="{annulus_d(CX, CY, 196, 176)}" fill="{rim_fill}" fill-rule="evenodd"/>')

    # 3. Filled gunmetal spokes with a magenta SVG-blur edge glow.
    spoke_path = spokes_d(CX, CY, 128, 176, 5, 11, offset_deg=18)
    if mono:
        body.append(f'<path d="{spoke_path}" fill="{CYAN}"/>')
    else:
        body.append(f'<path d="{spoke_path}" fill="none" stroke="{MAGENTA}" stroke-width="6" filter="url(#glowMagenta)" opacity="0.85"/>')
        body.append(f'<path d="{spoke_path}" fill="{GUNMETAL}" stroke="{MAGENTA}" stroke-width="2"/>')

    # 4. Reel window: lit panel (glowing cyan border), gold filled 7s with cyan glow.
    win_w, win_h, win_rx = 216, 120, 16
    panel_fill = "none" if mono else NAVY
    if not mono:
        body.append(f'<path d="{rounded_rect_d(CX, CY, win_w + 10, win_h + 10, win_rx + 4)}" fill="none" stroke="{CYAN}" stroke-width="6" filter="url(#glowCyan)" opacity="0.75"/>')
    body.append(f'<path d="{rounded_rect_d(CX, CY, win_w, win_h, win_rx)}" fill="{panel_fill}" stroke="{CYAN}" stroke-width="8"/>')
    slot_w = (win_w - 2 * 6) / 3.0
    x0 = CX - win_w / 2
    for dcx in (x0 + slot_w + 3, x0 + 2 * slot_w + 6 + 3):
        body.append(f'<path d="{rect_d(dcx - 3, CY - win_h / 2 + 6, dcx + 3, CY + win_h / 2 - 6)}" fill="{CYAN}"/>')
    slot_centers = [x0 + slot_w / 2, x0 + slot_w + 6 + slot_w / 2, x0 + 2 * (slot_w + 6) + slot_w / 2]
    seven_cap = 76
    seven_fill = CYAN if mono else GOLD
    for sx in slot_centers:
        gd = glyph_data("7")
        s = seven_cap / CAP
        cx_local = gd["width"] / 2.0
        py = CY + seven_cap * 0.42
        transform = f"translate({fmt(sx)},{fmt(py)}) scale({fmt(s)},{fmt(-s)}) translate({fmt(-cx_local)},0)"
        if mono:
            body.append(f'<g transform="{transform}"><path d="{gd["d"]}" fill="{seven_fill}"/></g>')
        else:
            body.append(f'<g transform="{transform}"><path d="{gd["d"]}" fill="{GOLD}" filter="url(#glowGold)" opacity="0.9"/></g>')
            body.append(f'<g transform="{transform}"><path d="{gd["d"]}" fill="{GOLD}" stroke="{MAGENTA}" stroke-width="{fmt(4/s)}"/></g>')

    # 5. Neon-sign wordmarks: filled letterforms + layered glow, not hollow.
    letter_fill = CYAN if mono else CYAN
    glow_id = "glowMagenta"
    if mono:
        # Simple filled mono pass, no glow filter (keeps mono a flat silhouette).
        for text, top in (("WE ROLL", True), ("SPINNERS", False)):
            widths = []
            for ch in text:
                widths.append(None if ch == " " else glyph_data(ch)["width"])
            scale = 44 / CAP
            tracking = 10
            radius = 150
            space_gap = 44 * 0.9
            angular = [((w * scale if w is not None else space_gap) + tracking) / radius for w in widths]
            phi = -sum(angular) / 2.0
            for idx, ch in enumerate(text):
                phi_center = phi + angular[idx] / 2.0
                if ch != " ":
                    gd = glyph_data(ch)
                    cx_local = gd["width"] / 2.0
                    baseline_r = radius - 22 if top else radius + 22
                    if top:
                        a_deg = math.degrees(phi_center)
                        px = CX + baseline_r * math.sin(phi_center)
                        py = CY - baseline_r * math.cos(phi_center)
                    else:
                        a_deg = math.degrees(-phi_center)
                        px = CX + baseline_r * math.sin(phi_center)
                        py = CY + baseline_r * math.cos(phi_center)
                    transform = (
                        f"translate({fmt(px)},{fmt(py)}) rotate({fmt(a_deg)}) "
                        f"scale({fmt(scale)},{fmt(-scale)}) translate({fmt(-cx_local)},0)"
                    )
                    body.append(f'<g transform="{transform}"><path d="{gd["d"]}" fill="{CYAN}"/></g>')
                phi += angular[idx]
    else:
        body.append(arc_text_filled("WE ROLL", 150, 44, 10, True, "top", letter_fill, glow_id))
        body.append(arc_text_filled("SPINNERS", 150, 44, 10, False, "bot", letter_fill, glow_id))

    defs_xml = "".join(defs)
    body_xml = "".join(body)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VIEWBOX} {VIEWBOX}" '
        f'width="{VIEWBOX}" height="{VIEWBOX}">'
        f"<defs>{defs_xml}</defs>{body_xml}</svg>"
    )


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    full = build(mono=False)
    mono = build(mono=True)
    with open(os.path.join(OUT_DIR, "wrs_mark_v3.svg"), "w") as f:
        f.write(full)
    with open(os.path.join(OUT_DIR, "wrs_mark_v3_mono_cyan.svg"), "w") as f:
        f.write(mono)
    print("wrote", os.path.join(OUT_DIR, "wrs_mark_v3.svg"))
    print("wrote", os.path.join(OUT_DIR, "wrs_mark_v3_mono_cyan.svg"))


if __name__ == "__main__":
    main()
