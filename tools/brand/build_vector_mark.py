#!/usr/bin/env python3
"""Builds design-system/brand/vector_mark/wrs_mark_v2.svg (Tier 2 vector mark).

Deterministic, paths-only SVG generator: tyre annulus, chrome rim, five
spokes, a reel window with three "7" slots, and arched "WE ROLL" / "SPINNERS"
wordmarks. All text is pre-converted to outline paths via fontTools against
the Orbitron Bold glyph outlines (no <text> element, no runtime font
dependency). Run from repo root:

    scripts/assets/.venv/bin/python3 tools/brand/build_vector_mark.py
"""
import math
import os

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONT_PATH = os.path.join(
    REPO_ROOT, "frontend/node_modules/@fontsource/orbitron/files/orbitron-latin-700-normal.woff2"
)
OUT_DIR = os.path.join(REPO_ROOT, "design-system/brand/vector_mark")

# ---- named tokens (design-system/DESIGN_SYSTEM.md) ----
CYAN = "#00FFFF"
MAGENTA = "#FF00FF"
GOLD = "#FFD700"
NAVY = "#060610"
# Not given explicit hexes in DESIGN_SYSTEM.md; chosen to sit in the
# "deep-navy gunmetal" / "flat grey chrome" families it describes and
# recorded in GENERATION_NOTE.md.
GUNMETAL = "#1a1e2b"
CHROME_LIGHT = "#c9cedb"
CHROME_DARK = "#868fa3"

VIEWBOX = 512
CX, CY = 256, 256

# ---- font loading ----
_font = TTFont(FONT_PATH)
_cmap = _font.getBestCmap()
_glyphset = _font.getGlyphSet()
UPM = _font["head"].unitsPerEm  # 1000
CAP = _font["OS/2"].sCapHeight  # 720


def glyph_data(ch):
    gname = _cmap[ord(ch)]
    glyph = _glyphset[gname]
    pen = SVGPathPen(_glyphset)
    glyph.draw(pen)
    return {"d": pen.getCommands(), "width": glyph.width}


def fmt(n):
    return f"{n:.3f}".rstrip("0").rstrip(".")


# ---------------------------------------------------------------- geometry --
def circle_subpath(cx, cy, r, clockwise=True):
    """A full-circle path subpath using two arcs (SVG needs >=2 arcs per
    circle since a single arc command cannot span 360 degrees)."""
    sweep = 1 if clockwise else 0
    return (
        f"M {fmt(cx + r)},{fmt(cy)} "
        f"A {fmt(r)},{fmt(r)} 0 1,{sweep} {fmt(cx - r)},{fmt(cy)} "
        f"A {fmt(r)},{fmt(r)} 0 1,{sweep} {fmt(cx + r)},{fmt(cy)} Z"
    )


def annulus_d(cx, cy, r_outer, r_inner):
    # evenodd: outer CW + inner CW leaves a ring (two same-winding circles
    # under evenodd always produce the ring regardless of relative winding).
    return circle_subpath(cx, cy, r_outer) + " " + circle_subpath(cx, cy, r_inner)


def rounded_rect_d(cx, cy, w, h, rx):
    x0, y0 = cx - w / 2, cy - h / 2
    x1, y1 = cx + w / 2, cy + h / 2
    return (
        f"M {fmt(x0 + rx)},{fmt(y0)} "
        f"L {fmt(x1 - rx)},{fmt(y0)} "
        f"A {fmt(rx)},{fmt(rx)} 0 0 1 {fmt(x1)},{fmt(y0 + rx)} "
        f"L {fmt(x1)},{fmt(y1 - rx)} "
        f"A {fmt(rx)},{fmt(rx)} 0 0 1 {fmt(x1 - rx)},{fmt(y1)} "
        f"L {fmt(x0 + rx)},{fmt(y1)} "
        f"A {fmt(rx)},{fmt(rx)} 0 0 1 {fmt(x0)},{fmt(y1 - rx)} "
        f"L {fmt(x0)},{fmt(y0 + rx)} "
        f"A {fmt(rx)},{fmt(rx)} 0 0 1 {fmt(x0 + rx)},{fmt(y0)} Z"
    )


def rect_d(x0, y0, x1, y1):
    return f"M {fmt(x0)},{fmt(y0)} L {fmt(x1)},{fmt(y0)} L {fmt(x1)},{fmt(y1)} L {fmt(x0)},{fmt(y1)} Z"


def notches_d(cx, cy, r_in, r_out, count, half_angle_deg):
    parts = []
    for i in range(count):
        a = math.radians(360.0 * i / count)
        da = math.radians(half_angle_deg)
        pts = []
        for (r, ang) in ((r_in, a - da), (r_out, a - da), (r_out, a + da), (r_in, a + da)):
            pts.append((cx + r * math.sin(ang), cy - r * math.cos(ang)))
        d = f"M {fmt(pts[0][0])},{fmt(pts[0][1])} "
        d += " ".join(f"L {fmt(x)},{fmt(y)}" for x, y in pts[1:])
        d += " Z"
        parts.append(d)
    return " ".join(parts)


def spokes_d(cx, cy, r_in, r_out, count, half_width, offset_deg=0):
    """Each spoke is a straight trapezoid-ish bar of constant angular
    half-width (converted to a chord half-width at each radius)."""
    parts = []
    for i in range(count):
        a = math.radians(offset_deg + 360.0 * i / count)
        perp = a + math.pi / 2
        ux, uy = math.sin(a), -math.cos(a)
        px, py = math.sin(perp), -math.cos(perp)
        p_in_a = (cx + r_in * ux + half_width * px, cy + r_in * uy + half_width * py)
        p_in_b = (cx + r_in * ux - half_width * px, cy + r_in * uy - half_width * py)
        p_out_a = (cx + r_out * ux - half_width * px, cy + r_out * uy - half_width * py)
        p_out_b = (cx + r_out * ux + half_width * px, cy + r_out * uy + half_width * py)
        pts = [p_in_a, p_in_b, p_out_a, p_out_b]
        d = f"M {fmt(pts[0][0])},{fmt(pts[0][1])} " + " ".join(
            f"L {fmt(x)},{fmt(y)}" for x, y in pts[1:]
        ) + " Z"
        parts.append(d)
    return " ".join(parts)


BIG_RECT_LOCAL = "M -2000,-2000 L 3000,-2000 L 3000,3000 L -2000,3000 Z"


def letter_group(ch, gid, cap_height, cyan_out, magenta_in, fill_hex, mono=False):
    g = glyph_data(ch)
    s = cap_height / CAP
    local_cyan = cyan_out / s if cyan_out else 0
    local_magenta = magenta_in / s if magenta_in else 0
    d = g["d"]
    pieces = []
    if not mono and cyan_out:
        pieces.append(
            f'<clipPath id="co_{gid}"><path fill-rule="evenodd" d="{BIG_RECT_LOCAL} {d}"/></clipPath>'
        )
    if not mono and magenta_in:
        pieces.append(f'<clipPath id="ci_{gid}"><path d="{d}"/></clipPath>')
    defs = "".join(pieces)
    body = []
    if mono:
        body.append(f'<path d="{d}" fill="{fill_hex}"/>')
    else:
        if cyan_out:
            body.append(
                f'<path d="{d}" fill="none" stroke="{CYAN}" stroke-width="{fmt(local_cyan)}" clip-path="url(#co_{gid})"/>'
            )
        if magenta_in:
            body.append(
                f'<path d="{d}" fill="none" stroke="{MAGENTA}" stroke-width="{fmt(local_magenta)}" clip-path="url(#ci_{gid})"/>'
            )
        body.append(f'<path d="{d}" fill="{fill_hex}"/>')
    return defs, "".join(body), g["width"], s


def arc_text(text, radius, cap_height, cyan_out, magenta_in, fill_hex, tracking, top, mono, id_prefix):
    """Lay out `text` along a circular arc (top=True: upright, reads left to
    right along the top; top=False: flipped so it reads upright along the
    bottom)."""
    letters = [c for c in text if c != " "]
    widths = []
    scales = []
    for ch in text:
        if ch == " ":
            widths.append(None)
            scales.append(None)
            continue
        gd = glyph_data(ch)
        widths.append(gd["width"])
        scales.append(cap_height / CAP)

    space_gap = cap_height * 0.9
    angular = []
    for w in widths:
        adv = (w * scales[0] if w is not None else space_gap) + tracking
        angular.append(adv / radius)
    total = sum(angular)
    phi = -total / 2.0

    defs_all = []
    body_all = []
    gi = 0
    for idx, ch in enumerate(text):
        phi_center = phi + angular[idx] / 2.0
        if ch != " ":
            gid = f"{id_prefix}{gi}"
            defs, body, width, s = letter_group(ch, gid, cap_height, cyan_out, magenta_in, fill_hex, mono)
            defs_all.append(defs)
            cx_local = width / 2.0
            # Anchor the letter's baseline so the glyph block is vertically
            # centred ON the arc radius (cap-top at radius+cap/2 outward,
            # baseline at radius-cap/2 inward for top text, and mirrored for
            # bottom text) rather than baseline-on-circle - baseline-on-circle
            # pushes cap-tops well past the arc radius, which for the top
            # wordmark actually oversteps the chrome rim's inner edge.
            baseline_r = radius - cap_height / 2.0 if top else radius + cap_height / 2.0
            if top:
                a_deg = math.degrees(phi_center)
                px = CX + baseline_r * math.sin(phi_center)
                py = CY - baseline_r * math.cos(phi_center)
                transform = (
                    f"translate({fmt(px)},{fmt(py)}) rotate({fmt(a_deg)}) "
                    f"scale({fmt(s)},{fmt(-s)}) translate({fmt(-cx_local)},0)"
                )
            else:
                a_deg = math.degrees(-phi_center)
                px = CX + baseline_r * math.sin(phi_center)
                py = CY + baseline_r * math.cos(phi_center)
                transform = (
                    f"translate({fmt(px)},{fmt(py)}) rotate({fmt(a_deg)}) "
                    f"scale({fmt(s)},{fmt(-s)}) translate({fmt(-cx_local)},0)"
                )
            body_all.append(f'<g transform="{transform}">{body}</g>')
            gi += 1
        phi += angular[idx]

    return "".join(defs_all), "".join(body_all)


# --------------------------------------------------------------- assembly --
def build(mono=False):
    defs_parts = []
    body_parts = []

    # 1. outer tyre annulus (r230 -> r196), deep-navy gunmetal
    tyre_fill = CYAN if mono else GUNMETAL
    body_parts.append(f'<path d="{annulus_d(CX, CY, 230, 196)}" fill="{tyre_fill}" fill-rule="evenodd"/>')

    # 24 cyan tread notches on the outer edge (>=8 units wide, none under)
    notch_fill = CYAN
    body_parts.append(
        f'<path d="{notches_d(CX, CY, 214, 230, 24, 1.6)}" fill="{notch_fill}" fill-rule="evenodd"/>'
    )

    # 2. chrome rim ring r196 -> r176, two flat greys
    ring_light = CYAN if mono else CHROME_LIGHT
    ring_dark = CYAN if mono else CHROME_DARK
    body_parts.append(f'<path d="{annulus_d(CX, CY, 196, 186)}" fill="{ring_light}" fill-rule="evenodd"/>')
    body_parts.append(f'<path d="{annulus_d(CX, CY, 186, 176)}" fill="{ring_dark}" fill-rule="evenodd"/>')

    # 3. five spokes at 72 degrees, width >=20 units, gunmetal + 6-unit magenta edge
    spoke_fill = CYAN if mono else GUNMETAL
    spoke_stroke = "none" if mono else MAGENTA
    # offset 18deg clears the top (0deg) and bottom (180deg) wordmark
    # centres - 5 spokes at 72deg apart otherwise put one directly behind
    # each arc's centre letter.
    body_parts.append(
        f'<path d="{spokes_d(CX, CY, 128, 176, 5, 11, offset_deg=18)}" fill="{spoke_fill}" '
        f'stroke="{spoke_stroke}" stroke-width="6" stroke-linejoin="round"/>'
    )

    # 4. reel window: dark plate, 8-unit cyan border, 2x 6-unit dividers, 3 slots each holding a "7"
    win_w, win_h, win_rx = 216, 120, 16
    plate_fill = NAVY if not mono else "none"
    body_parts.append(
        f'<path d="{rounded_rect_d(CX, CY, win_w, win_h, win_rx)}" fill="{plate_fill}" '
        f'stroke="{CYAN}" stroke-width="8"/>'
    )
    slot_w = (win_w - 2 * 6) / 3.0
    x0 = CX - win_w / 2
    div1_cx = x0 + slot_w + 3
    div2_cx = x0 + 2 * slot_w + 6 + 3
    for dcx in (div1_cx, div2_cx):
        body_parts.append(
            f'<path d="{rect_d(dcx - 3, CY - win_h / 2 + 6, dcx + 3, CY + win_h / 2 - 6)}" fill="{CYAN}"/>'
        )
    slot_centers = [
        x0 + slot_w / 2,
        x0 + slot_w + 6 + slot_w / 2,
        x0 + 2 * (slot_w + 6) + slot_w / 2,
    ]
    seven_cap = 76
    seven_fill = CYAN if mono else GOLD
    seven_stroke = "none" if mono else MAGENTA
    for sx in slot_centers:
        gd = glyph_data("7")
        s = seven_cap / CAP
        local_stroke = 4 / s
        cx_local = gd["width"] / 2.0
        # baseline sits slightly below vertical center to optically balance the digit
        py = CY + seven_cap * 0.42
        transform = f"translate({fmt(sx)},{fmt(py)}) scale({fmt(s)},{fmt(-s)}) translate({fmt(-cx_local)},0)"
        stroke_attr = "" if mono else f' stroke="{seven_stroke}" stroke-width="{fmt(local_stroke)}"'
        body_parts.append(f'<g transform="{transform}"><path d="{gd["d"]}" fill="{seven_fill}"{stroke_attr}/></g>')

    # 5. arched wordmarks
    letter_fill = CYAN if mono else NAVY
    d1, b1 = arc_text(
        "WE ROLL", radius=150, cap_height=44, cyan_out=3, magenta_in=5,
        fill_hex=letter_fill, tracking=10, top=True, mono=mono, id_prefix="top",
    )
    d2, b2 = arc_text(
        "SPINNERS", radius=150, cap_height=44, cyan_out=3, magenta_in=5,
        fill_hex=letter_fill, tracking=10, top=False, mono=mono, id_prefix="bot",
    )
    defs_parts.append(d1)
    defs_parts.append(d2)
    body_parts.append(b1)
    body_parts.append(b2)

    defs_xml = "".join(defs_parts)
    body_xml = "".join(body_parts)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VIEWBOX} {VIEWBOX}" '
        f'width="{VIEWBOX}" height="{VIEWBOX}">'
        f"<defs>{defs_xml}</defs>{body_xml}</svg>"
    )
    return svg


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    full = build(mono=False)
    mono = build(mono=True)
    with open(os.path.join(OUT_DIR, "wrs_mark_v2.svg"), "w") as f:
        f.write(full)
    with open(os.path.join(OUT_DIR, "wrs_mark_v2_mono_cyan.svg"), "w") as f:
        f.write(mono)
    print("wrote", os.path.join(OUT_DIR, "wrs_mark_v2.svg"))
    print("wrote", os.path.join(OUT_DIR, "wrs_mark_v2_mono_cyan.svg"))


if __name__ == "__main__":
    main()
