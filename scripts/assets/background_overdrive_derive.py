#!/usr/bin/env python3
"""Derive the Overdrive background variant from an adopted base background.

WHY THIS EXISTS. `App.svelte` crossfades `bg_overdrive.jpg` in over
`bg_base.jpg` while the Overdrive feature plays. The two shipped files were
graded by `backgrounds.py` from two frames of one retired loop video, so they
have always been the same city under two different lights, and the crossfade
reads as the scene heating up.

Adopting an externally supplied base breaks that silently. The base becomes a
different city while the Overdrive variant stays the old one, so triggering the
feature would cut the whole skyline to a different skyline and cut back when it
ended. Nothing in the build would fail; it would simply look broken to a player,
which is the kind of defect THE STANDING MANDATE exists to catch.

WHAT IT DOES. Applies the Overdrive treatment to the adopted base as a RELATIVE
grade, derived from `backgrounds.py`'s own two parameter sets rather than
invented here. Those describe two absolute grades applied to raw video frames:

    bg_base       contrast 1.08  colour 1.18  brightness 1.00
                  channel (1.00, 1.00, 1.06)  vignette 0.38 inner 0.45
    bg_overdrive  contrast 1.14  colour 1.30  brightness 0.94
                  channel (1.18, 0.92, 1.12)  vignette 0.50 inner 0.45

An adopted candidate arrives already finished, so the absolute base grade must
NOT be reapplied to it. What is wanted is only the difference between the two,
which for the multiplicative enhancements is the ratio:

    contrast   1.14 / 1.08 = 1.0556
    colour     1.30 / 1.18 = 1.1017
    brightness 0.94 / 1.00 = 0.9400
    channel    (1.18/1.00, 0.92/1.00, 1.12/1.06) = (1.1800, 0.9200, 1.0566)

The vignette is not a ratio, because it composites toward black rather than
scaling. Two vignettes of strength s1 then s2 leave (1-s1)(1-s2) of the image,
so reaching a total of 0.50 from an image already carrying 0.38 needs

    s2 = (0.50 - 0.38) / (1 - 0.38) = 0.1935

and that only holds if the adopted base already carries the base vignette. A
supplied candidate may carry none, so the strength is a parameter with the
derived value as its default, and the choice made is recorded in the output.

Run: scripts/assets/.venv/bin/python scripts/assets/background_overdrive_derive.py \
         [--vignette 0.1935] [--quality 80]
"""
from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[2]
BG_DIR = ROOT / "frontend/public/assets/themes/future-spinner/backgrounds"
BASE = BG_DIR / "bg_base.jpg"
OUT = BG_DIR / "bg_overdrive.jpg"
RECORD = ROOT / "reports/qa/background_overdrive_derive.json"

# Straight from backgrounds.py's JOBS, so the ratios below are traceable.
BASE_GRADE = {"contrast": 1.08, "colour": 1.18, "brightness": 1.00,
              "channel": (1.00, 1.00, 1.06), "vignette": 0.38, "inner": 0.45}
OVERDRIVE_GRADE = {"contrast": 1.14, "colour": 1.30, "brightness": 0.94,
                   "channel": (1.18, 0.92, 1.12), "vignette": 0.50, "inner": 0.45}

REL_CONTRAST = OVERDRIVE_GRADE["contrast"] / BASE_GRADE["contrast"]
REL_COLOUR = OVERDRIVE_GRADE["colour"] / BASE_GRADE["colour"]
REL_BRIGHTNESS = OVERDRIVE_GRADE["brightness"] / BASE_GRADE["brightness"]
REL_CHANNEL = tuple(
    OVERDRIVE_GRADE["channel"][i] / BASE_GRADE["channel"][i] for i in range(3)
)
REL_VIGNETTE = (
    (OVERDRIVE_GRADE["vignette"] - BASE_GRADE["vignette"])
    / (1.0 - BASE_GRADE["vignette"])
)
INNER = OVERDRIVE_GRADE["inner"]


def channel_mul(img: Image.Image, mults) -> Image.Image:
    """Identical to backgrounds.py's, so the two agree by construction."""
    r, g, b = img.split()[:3]

    def scale(ch, m):
        if m == 1.0:
            return ch
        return ch.point(lambda x, m=m: min(255, int(x * m)))

    return Image.merge("RGB", (scale(r, mults[0]), scale(g, mults[1]),
                               scale(b, mults[2])))


def vignette(img: Image.Image, strength: float, inner: float) -> Image.Image:
    """Identical to backgrounds.py's, including its quadratic falloff."""
    if strength <= 0:
        return img
    w, h = img.size
    cx, cy = (w - 1) / 2.0, (h - 1) / 2.0
    maxd = (cx ** 2 + cy ** 2) ** 0.5
    mask = Image.new("L", (w, h), 0)
    px = mask.load()
    span = 1.0 - inner
    for y in range(h):
        dy2 = (y - cy) ** 2
        for x in range(w):
            d = ((x - cx) ** 2 + dy2) ** 0.5 / maxd
            f = (d - inner) / span
            f = 0.0 if f < 0 else (1.0 if f > 1 else f)
            px[x, y] = int(255 * strength * (f * f))
    black = Image.new("RGB", (w, h), (0, 0, 0))
    return Image.composite(black, img, mask)


def sha256_of(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--vignette", type=float, default=REL_VIGNETTE)
    ap.add_argument("--quality", type=int, default=80)
    args = ap.parse_args()

    if not BASE.exists():
        print(f"base not found: {BASE}")
        return 2

    base_sha = sha256_of(BASE)
    img = Image.open(BASE).convert("RGB")
    src_size = img.size

    out = ImageEnhance.Contrast(img).enhance(REL_CONTRAST)
    out = ImageEnhance.Color(out).enhance(REL_COLOUR)
    out = ImageEnhance.Brightness(out).enhance(REL_BRIGHTNESS)
    out = channel_mul(out, REL_CHANNEL)
    out = vignette(out, args.vignette, INNER)

    prev_sha = sha256_of(OUT) if OUT.exists() else None
    prev_bytes = OUT.stat().st_size if OUT.exists() else None
    out.save(OUT, "JPEG", quality=args.quality, optimize=True, progressive=True,
             subsampling="4:2:0")

    record = {
        "generated_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "script": "scripts/assets/background_overdrive_derive.py",
        "derived_from": {
            "path": str(BASE.relative_to(ROOT)),
            "sha256": base_sha,
            "dimensions": f"{src_size[0]}x{src_size[1]}",
        },
        "parameter_source": "scripts/assets/backgrounds.py JOBS, base and overdrive",
        "relative_grade": {
            "contrast": round(REL_CONTRAST, 4),
            "colour": round(REL_COLOUR, 4),
            "brightness": round(REL_BRIGHTNESS, 4),
            "channel_rgb": [round(c, 4) for c in REL_CHANNEL],
            "vignette_strength": round(args.vignette, 4),
            "vignette_inner": INNER,
            "vignette_note": (
                "incremental, (0.50 - 0.38) / (1 - 0.38); the base is assumed to "
                "already carry the 0.38 vignette"
            ),
        },
        "output": {
            "path": str(OUT.relative_to(ROOT)),
            "sha256": sha256_of(OUT),
            "bytes": OUT.stat().st_size,
            "dimensions": f"{out.size[0]}x{out.size[1]}",
            "encoder": f"JPEG quality={args.quality} optimize progressive 4:2:0",
        },
        "replaced": {"sha256": prev_sha, "bytes": prev_bytes},
    }
    RECORD.parent.mkdir(parents=True, exist_ok=True)
    RECORD.write_text(json.dumps(record, indent=2) + "\n")

    print(f"base      {BASE.name}  {src_size[0]}x{src_size[1]}  sha {base_sha[:16]}")
    print(f"relative  contrast {REL_CONTRAST:.4f}  colour {REL_COLOUR:.4f}  "
          f"brightness {REL_BRIGHTNESS:.4f}")
    print(f"          channel {tuple(round(c, 4) for c in REL_CHANNEL)}  "
          f"vignette {args.vignette:.4f} inner {INNER}")
    if prev_bytes is not None:
        print(f"replaced  {prev_bytes:,}B sha {prev_sha[:16]}")
    print(f"wrote     {OUT.relative_to(ROOT)}  {OUT.stat().st_size:,}B  "
          f"sha {sha256_of(OUT)[:16]}")
    print(f"record    {RECORD.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
