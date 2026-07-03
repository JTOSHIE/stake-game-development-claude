#!/usr/bin/env python3
"""AssetForge v2 static background grader.

Extracts two frames from the retired background loop and grades them per
HANDOVER.md section 3 (static backgrounds), producing bg_base.jpg and
bg_overdrive.jpg. The served build uses these static images; the video is
excluded from the build (kept in the repo for reference).

Run: scripts/assets/.venv/bin/python scripts/assets/backgrounds.py
Requires ffmpeg on PATH.
"""
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "frontend/public/assets/videos/bg_animated_loop.mp4"
OUT = ROOT / "frontend/public/assets/themes/future-spinner/backgrounds"
TMP = Path(__file__).resolve().parent / ".bg_tmp"

# HANDOVER section 3 grading parameters
JOBS = [
    {
        "name": "bg_base.jpg", "t": 22,
        "contrast": 1.08, "colour": 1.18, "brightness": 1.0,
        "channel": (1.0, 1.0, 1.06),          # R, G, B
        "vignette": 0.38, "vignette_inner": 0.45,
    },
    {
        "name": "bg_overdrive.jpg", "t": 7,
        "contrast": 1.14, "colour": 1.30, "brightness": 0.94,
        "channel": (1.18, 0.92, 1.12),         # R, G, B
        "vignette": 0.50, "vignette_inner": 0.45,
    },
]


def extract(t: int, dst: Path):
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-ss", str(t), "-i", str(SRC),
         "-frames:v", "1", str(dst)],
        check=True,
    )


def channel_mul(img: Image.Image, mults):
    r, g, b = img.split()[:3]
    def scale(ch, m):
        if m == 1.0:
            return ch
        return ch.point(lambda x, m=m: min(255, int(x * m)))
    return Image.merge("RGB", (scale(r, mults[0]), scale(g, mults[1]), scale(b, mults[2])))


def vignette(img: Image.Image, strength: float, inner: float):
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
            if f < 0:
                f = 0.0
            elif f > 1:
                f = 1.0
            px[x, y] = int(255 * strength * (f * f))   # darken amount at this pixel
    black = Image.new("RGB", (w, h), (0, 0, 0))
    return Image.composite(black, img, mask)


def grade(job):
    src_png = TMP / (job["name"] + ".png")
    extract(job["t"], src_png)
    img = Image.open(src_png).convert("RGB")
    img = ImageEnhance.Contrast(img).enhance(job["contrast"])
    img = ImageEnhance.Color(img).enhance(job["colour"])
    if job["brightness"] != 1.0:
        img = ImageEnhance.Brightness(img).enhance(job["brightness"])
    img = channel_mul(img, job["channel"])
    img = vignette(img, job["vignette"], job["vignette_inner"])
    OUT.mkdir(parents=True, exist_ok=True)
    dst = OUT / job["name"]
    img.save(dst, "JPEG", quality=88)
    print(f"  {job['name']:16s} t={job['t']:>2}s  {img.size[0]}x{img.size[1]}  {dst.stat().st_size // 1024} KB")


def main():
    if not SRC.exists():
        sys.exit(f"source video not found: {SRC}")
    print("AssetForge v2 backgrounds ->", OUT.relative_to(ROOT))
    for job in JOBS:
        grade(job)
    # clean the extraction temp
    for p in TMP.glob("*.png"):
        p.unlink()
    if TMP.exists():
        TMP.rmdir()
    print("done")


if __name__ == "__main__":
    main()
