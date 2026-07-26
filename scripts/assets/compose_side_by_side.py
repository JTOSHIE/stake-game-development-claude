#!/usr/bin/env python3
"""Compose labelled current-versus-candidate comparison sheets.

Driven by a JSON spec written by frontend/scripts/background_candidate_proof.mjs.
The labels are burned into the image on purpose: an unlabelled pair of frames
in a report is a puzzle six months later, and the whole value of this evidence
is that someone can open it cold and know which side is which.

Run: compose_side_by_side.py <spec.json>
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PAD = 16
LABEL_H = 34
BG = (14, 16, 24)
FG = (236, 240, 248)
ACCENT = (94, 234, 212)

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial Bold.ttf",
]


def load_font(size: int) -> ImageFont.ImageFont:
    for p in FONT_CANDIDATES:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def label_strip(width: int, text: str, size: int, colour) -> Image.Image:
    strip = Image.new("RGB", (width, LABEL_H), BG)
    d = ImageDraw.Draw(strip)
    f = load_font(size)
    bbox = d.textbbox((0, 0), text, font=f)
    d.text(
        ((width - (bbox[2] - bbox[0])) // 2, (LABEL_H - (bbox[3] - bbox[1])) // 2 - bbox[1]),
        text, font=f, fill=colour,
    )
    return strip


def panel(img_path: Path, text: str) -> Image.Image:
    img = Image.open(img_path).convert("RGB")
    out = Image.new("RGB", (img.width, img.height + LABEL_H), BG)
    out.paste(label_strip(img.width, text, 18, FG), (0, 0))
    out.paste(img, (0, LABEL_H))
    return out


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: compose_side_by_side.py <spec.json>")
        return 2
    spec = json.loads(Path(sys.argv[1]).read_text())

    for item in spec:
        left = panel(Path(item["current"]), item["leftLabel"])
        right = panel(Path(item["v2"]), item["rightLabel"])
        title = item["label"]

        if item["stack"] == "horizontal":
            body_w = left.width + right.width + PAD * 3
            body_h = max(left.height, right.height) + PAD * 2
        else:
            body_w = max(left.width, right.width) + PAD * 2
            body_h = left.height + right.height + PAD * 3

        canvas = Image.new("RGB", (body_w, body_h + LABEL_H + PAD), BG)
        canvas.paste(label_strip(body_w, title, 20, ACCENT), (0, PAD // 2))

        if item["stack"] == "horizontal":
            canvas.paste(left, (PAD, LABEL_H + PAD))
            canvas.paste(right, (PAD * 2 + left.width, LABEL_H + PAD))
        else:
            canvas.paste(left, (PAD, LABEL_H + PAD))
            canvas.paste(right, (PAD, LABEL_H + PAD * 2 + left.height))

        out = Path(item["out"])
        canvas.save(out, "PNG", optimize=True)
        print(f"  composed {out.name}  {canvas.width}x{canvas.height}  "
              f"{out.stat().st_size:,}B  ({item['stack']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
