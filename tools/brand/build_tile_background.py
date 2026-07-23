#!/usr/bin/env python3
"""FABLE ART MASTERS PART 2: tile background.

Re-renders the shipped rain-city scene (the AssetForge backgrounds
pipeline's "bg_base.jpg" job - same source frame, same grading params, for
continuity) at 2048x1152. Applies a measured brightness lift only if the
native render falls short of the Tile Editor's dark-background warning
gate - never a palette change.

Run: scripts/assets/.venv/bin/python3 tools/brand/build_tile_background.py
Requires ffmpeg on PATH.
"""
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "frontend/public/assets/videos/bg_animated_loop.mp4"
OUT_DIR = ROOT / "design-system/brand/tile"
TMP = Path(__file__).resolve().parent / ".tile_tmp"

# Identical to backgrounds.py's "bg_base.jpg" job - same seed (source frame
# timestamp) and grading parameters as the shipped game backdrop.
JOB = {
    "t": 22,
    "contrast": 1.08, "colour": 1.18, "brightness": 1.0,
    "channel": (1.0, 1.0, 1.06),
    "vignette": 0.38, "vignette_inner": 0.45,
}
TARGET_SIZE = (2048, 1152)
GATE_OVERALL_MIN = 24.0
GATE_BAND_MIN = 30.0


def extract(t, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-ss", str(t), "-i", str(SRC),
         "-frames:v", "1", str(dst)],
        check=True,
    )


def channel_mul(img, mults):
    r, g, b = img.split()[:3]
    def scale(ch, m):
        if m == 1.0:
            return ch
        return ch.point(lambda x, m=m: min(255, int(x * m)))
    return Image.merge("RGB", (scale(r, mults[0]), scale(g, mults[1]), scale(b, mults[2])))


def vignette(img, strength, inner):
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


def measure_luminance(img):
    arr = np.asarray(img).astype(float)
    lum = 0.2126 * arr[:, :, 0] + 0.7152 * arr[:, :, 1] + 0.0722 * arr[:, :, 2]
    h, _ = lum.shape
    band = lum[int(h * 0.33):int(h * 0.67), :]
    return lum.mean(), band.mean()


def main():
    if not SRC.exists():
        sys.exit(f"source video not found: {SRC}")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    src_png = TMP / "tile_bg_source.png"
    extract(JOB["t"], src_png)
    img = Image.open(src_png).convert("RGB")
    img = ImageEnhance.Contrast(img).enhance(JOB["contrast"])
    img = ImageEnhance.Color(img).enhance(JOB["colour"])
    if JOB["brightness"] != 1.0:
        img = ImageEnhance.Brightness(img).enhance(JOB["brightness"])
    img = channel_mul(img, JOB["channel"])
    img = vignette(img, JOB["vignette"], JOB["vignette_inner"])

    overall, band = measure_luminance(img)
    print(f"native render luminance: overall={overall:.2f} band={band:.2f}")
    lift_applied = 1.0
    if overall < GATE_OVERALL_MIN or band < GATE_BAND_MIN:
        needed = max(GATE_OVERALL_MIN / overall if overall else 999, GATE_BAND_MIN / band if band else 999)
        lift_applied = needed * 1.03  # small margin over the exact threshold
        img = ImageEnhance.Brightness(img).enhance(lift_applied)
        overall, band = measure_luminance(img)
        print(f"applied measured exposure lift x{lift_applied:.3f} (no palette change) -> overall={overall:.2f} band={band:.2f}")
    else:
        print("native render already clears the brightness gate - no exposure lift applied")

    gate_ok = overall >= GATE_OVERALL_MIN and band >= GATE_BAND_MIN
    print(f"GATE: overall>={GATE_OVERALL_MIN} band>={GATE_BAND_MIN} -> {'PASS' if gate_ok else 'FAIL'}")

    master = img.resize(TARGET_SIZE, Image.LANCZOS)
    master_path = OUT_DIR / "tile_background_master.jpg"
    master.save(master_path, "JPEG", quality=92)
    print("wrote", master_path, master.size)

    preview_h = round(1024 * TARGET_SIZE[1] / TARGET_SIZE[0])
    preview = master.resize((1024, preview_h), Image.LANCZOS)
    preview_path = OUT_DIR / "tile_background_preview_1024.jpg"
    preview.save(preview_path, "JPEG", quality=88)
    print("wrote", preview_path, preview.size)

    for p in TMP.glob("*"):
        p.unlink()
    if TMP.exists():
        TMP.rmdir()

    return gate_ok, overall, band, lift_applied


if __name__ == "__main__":
    ok, overall, band, lift = main()
    sys.exit(0 if ok else 1)
