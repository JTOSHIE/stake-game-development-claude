"""BRAND HERO ICON DERIVATION, OWNER AUDIT ROUND 3 item 1, 2026-07-25.

Deterministic, re-runnable derivation of a small circular "hero icon" from
the ratified hero emblem master (design-system/brand/hero_emblem/master_1024.png,
ingested 2026-07-15 - see tools/brand/ingest_hero_emblem.py). The full emblem
carries the "WE ROLL SPINNERS" wordmark as an arc of text around the outer
rim; the hero icon is a tight centre-crop capturing only the wheel-and-reel
core, for use anywhere the wordmark arcs would be illegible at small sizes
(the brief's named target this round: LoadingScreen.svelte's spinning brand
mark).

Pipeline (byte-identical given the same source, per convention (l)):
  1. Load master_1024.png (RGB, 1024x1024).
  2. Centre-crop a square of CROP_FRACTION * 1024 px. CROP_FRACTION=0.48 was
     picked by direct visual calibration (rendered the circular composite at
     0.42/0.48/0.54/0.66 and inspected each - see calibration proof saved
     below): at this fraction the wheel's tyre tread fills the crop with a
     small margin, and the wordmark arc text ("WE ROLL" / "SPINNERS") falls
     entirely outside the inscribed circle applied in step 3. An automated
     brightness-based bleed check was tried and abandoned - the wheel's OWN
     art carries neon accent glow (a diagonal light streak, rim highlights)
     nearly as bright as the wordmark's neon text, so "any bright pixel near
     the crop edge" cannot distinguish the two; only a direct look at the
     rendered circular crop can confirm no legible text remains, which is
     what the calibration proof below is for.
  3. Apply a circular alpha mask (supersampled 4x then downsampled for a
     smooth anti-aliased edge - PIL's ImageDraw.ellipse has no native AA).
  4. Composite onto a solid "dark plate" disc sampled directly from the
     master's own corner background colour, so the emblem's existing dark
     background merges into the plate seamlessly with no visible seam -
     outside the circle stays fully transparent (alpha 0).
  5. Emit the size ladder (192, 96, 48, 32) via LANCZOS downsampling.
  6. Save a calibration proof (the crop circle overlaid on the full master)
     plus a size-ladder contact sheet.

Usage: scripts/assets/.venv/bin/python3 tools/brand/derive_hero_icon.py
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "design-system" / "brand" / "hero_emblem" / "master_1024.png"
OUT_DIR = ROOT / "design-system" / "brand" / "hero_icon"
PROOF_DIR = ROOT / "reports" / "screens" / "owner-audit-v3" / "hero-icon"

CANVAS = 1024
CROP_FRACTION = 0.48
LADDER_SIZES = [192, 96, 48, 32]
SUPERSAMPLE = 4


def measure_background(arr):
    h, w, _ = arr.shape
    patches = np.concatenate(
        [
            arr[0:40, 0:40].reshape(-1, 3),
            arr[0:40, w - 40 :].reshape(-1, 3),
            arr[h - 40 :, 0:40].reshape(-1, 3),
            arr[h - 40 :, w - 40 :].reshape(-1, 3),
        ],
        axis=0,
    )
    return np.median(patches, axis=0)


def circular_mask(size, supersample=SUPERSAMPLE):
    big = size * supersample
    mask_big = Image.new("L", (big, big), 0)
    ImageDraw.Draw(mask_big).ellipse((0, 0, big - 1, big - 1), fill=255)
    return mask_big.resize((size, size), Image.LANCZOS)


def main():
    if not SOURCE.exists():
        raise SystemExit(f"source not found: {SOURCE}")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PROOF_DIR.mkdir(parents=True, exist_ok=True)

    master = Image.open(SOURCE).convert("RGB")
    if master.size != (CANVAS, CANVAS):
        raise SystemExit(f"expected {CANVAS}x{CANVAS}, got {master.size}")
    master_arr = np.asarray(master)
    bg = measure_background(master_arr)
    plate_colour = tuple(int(round(c)) for c in bg)
    print(f"measured plate colour (from master's own corners): {plate_colour}")

    crop_size = round(CANVAS * CROP_FRACTION)
    left = (CANVAS - crop_size) // 2
    top = (CANVAS - crop_size) // 2
    crop = master.crop((left, top, left + crop_size, top + crop_size))

    mask = circular_mask(crop_size)
    plate = Image.new("RGBA", (crop_size, crop_size), (*plate_colour, 255))
    composite = Image.new("RGBA", (crop_size, crop_size), (0, 0, 0, 0))
    composite.paste(plate, (0, 0), mask)  # dark plate disc, circular
    composite.paste(crop.convert("RGBA"), (0, 0), mask)  # emblem art on top, same circular mask

    # Calibration proof: the chosen crop circle overlaid on the full master.
    calib = master.convert("RGBA").copy()
    overlay = Image.new("RGBA", calib.size, (0, 0, 0, 0))
    ImageDraw.Draw(overlay).ellipse((left, top, left + crop_size, top + crop_size), outline=(0, 255, 200, 255), width=4)
    calib = Image.alpha_composite(calib, overlay)
    calib.save(PROOF_DIR / "calibration-crop-circle.png")

    outputs = {}
    for size in LADDER_SIZES:
        resized = composite.resize((size, size), Image.LANCZOS)
        out_path = OUT_DIR / f"hero_icon_{size}.png"
        resized.save(out_path)
        outputs[size] = out_path
        print(f"wrote {out_path} ({size}x{size})")

    # Contact-sheet proof: all four sizes side by side on a dark background.
    pad = 24
    sheet_w = sum(LADDER_SIZES) + pad * (len(LADDER_SIZES) + 1)
    sheet_h = max(LADDER_SIZES) + pad * 2
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (10, 10, 20, 255))
    x = pad
    for size in LADDER_SIZES:
        icon = Image.open(outputs[size]).convert("RGBA")
        y = pad + (max(LADDER_SIZES) - size) // 2
        sheet.paste(icon, (x, y), icon)
        x += size + pad
    sheet.save(PROOF_DIR / "size-ladder-contact-sheet.png")

    print("done:", OUT_DIR)
    print("proofs:", PROOF_DIR)


if __name__ == "__main__":
    main()
