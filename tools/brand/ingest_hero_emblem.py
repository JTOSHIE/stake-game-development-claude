"""BRAND HERO EMBLEM INGEST, 2026-07-15.

Deterministic, re-runnable ingest for the "We Roll Spinners" hero emblem
(source: Google Gemini, 1024x1024). Given the same source file this always
produces byte-identical output, per convention (l) (no regenerating already-
correct published artefacts).

Pipeline:
  1. Copy the source verbatim to source_raw.png (untouched reference).
  2. Measure the background colour from clean corner patches (top-left,
     top-right, bottom-left - bottom-right is skipped since that is where
     the generator watermark glyph sits).
  3. Find connected components of "non-background" pixels. The largest
     component is the emblem itself; any other component above a minimum
     size, isolated from the emblem, is a foreign glyph (the watermark) and
     gets flat-filled with the measured background colour.
  4. Re-measure the emblem's bounding box on the cleaned image and shift the
     whole canvas so left/right and top/bottom margins are equal (within a
     few px), padding/cropping with the same flat background colour.
  5. Emit the size ladder (1024, 512, 192, 96, 48) via LANCZOS resampling.

Usage: env/bin/python tools/brand/ingest_hero_emblem.py
"""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SOURCE = Path.home() / "Downloads" / "Gemini_Generated_Image_noojmpnoojmpnooj.png"
OUT_DIR = Path(__file__).resolve().parents[2] / "design-system" / "brand" / "hero_emblem"
PROOF_DIR = Path(__file__).resolve().parents[2] / "reports" / "screens" / "brand-emblem"

CANVAS = 1024
LADDER_SIZES = [1024, 512, 192, 96, 48]

# Non-background threshold: max per-channel absolute difference from the
# measured background colour. Chosen above the ~1-2 stdev of PNG compression
# noise in the flat corners, well below the emblem's own neon glow falloff.
CONTENT_THRESHOLD = 12
# Minimum pixel count for a component to be treated as a real foreign glyph
# rather than isolated compression-noise speckle (largest noise blob
# observed in this source is under 10px; the watermark glyph is ~850px).
MIN_FOREIGN_BLOB_PX = 50
# Padding added around a detected foreign blob's bbox before flat-filling,
# to also cover its anti-aliased edge halo just under CONTENT_THRESHOLD.
FOREIGN_BLOB_PAD = 6
# Recentring tolerance the brief requires (margins must match within this).
MARGIN_TOLERANCE_PX = 4


def measure_background(arr):
    """Median colour of three clean corner patches (skips bottom-right,
    where the watermark lives)."""
    h, w, _ = arr.shape
    patches = np.concatenate(
        [
            arr[0:40, 0:40].reshape(-1, 3),
            arr[0:40, w - 40 :].reshape(-1, 3),
            arr[h - 40 :, 0:40].reshape(-1, 3),
        ],
        axis=0,
    )
    return np.median(patches, axis=0)


def corner_stdev(arr, size=60):
    """Max per-channel stdev across the same three clean corners, as the
    post-patch flatness check the brief asks for."""
    h, w, _ = arr.shape
    patches = np.concatenate(
        [
            arr[0:size, 0:size].reshape(-1, 3),
            arr[0:size, w - size :].reshape(-1, 3),
            arr[h - size :, 0:size].reshape(-1, 3),
        ],
        axis=0,
    )
    return float(patches.std(axis=0).max())


def remove_watermark(arr, bg):
    """Flat-fills any isolated foreign blob (the generator watermark) with
    the measured background colour. Returns (cleaned_arr, patches_applied)."""
    diff = np.abs(arr.astype(np.int16) - bg).max(axis=2)
    mask = diff > CONTENT_THRESHOLD
    labeled, n = ndimage.label(mask, structure=np.ones((3, 3)))
    sizes = ndimage.sum(mask, labeled, range(1, n + 1))
    main_label = int(np.argmax(sizes)) + 1

    cleaned = arr.copy()
    patches_applied = []
    for lbl in range(1, n + 1):
        if lbl == main_label or sizes[lbl - 1] < MIN_FOREIGN_BLOB_PX:
            continue
        ys, xs = np.where(labeled == lbl)
        y0, y1 = max(ys.min() - FOREIGN_BLOB_PAD, 0), min(ys.max() + FOREIGN_BLOB_PAD, arr.shape[0] - 1)
        x0, x1 = max(xs.min() - FOREIGN_BLOB_PAD, 0), min(xs.max() + FOREIGN_BLOB_PAD, arr.shape[1] - 1)
        cleaned[y0 : y1 + 1, x0 : x1 + 1] = bg
        patches_applied.append({"bbox": (int(x0), int(y0), int(x1), int(y1)), "size_px": int(sizes[lbl - 1])})

    return cleaned, patches_applied, main_label, labeled, mask


def content_bbox(mask, labeled, main_label):
    ys, xs = np.where(labeled == main_label)
    return int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())


def measure_margins(arr, bg, threshold):
    """Independent re-measurement of margins directly from pixel data at a
    given threshold - used to verify recentring without going anywhere near
    the transform's own bbox bookkeeping (2026-07-15 fix: the original
    verify derived its "new bbox" algebraically from the pre-shift bbox and
    the applied (dx, dy), so a sign bug in the paste itself could still
    self-report a clean result - see FIX note below)."""
    h, w, _ = arr.shape
    diff = np.abs(arr.astype(np.int16) - bg).max(axis=2)
    mask = diff > threshold
    labeled, n = ndimage.label(mask, structure=np.ones((3, 3)))
    sizes = ndimage.sum(mask, labeled, range(1, n + 1))
    main_label = int(np.argmax(sizes)) + 1
    ys, xs = np.where(labeled == main_label)
    x0, y0, x1, y1 = int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())
    left, right = x0, w - 1 - x1
    top, bottom = y0, h - 1 - y1
    return {"threshold": threshold, "left": left, "right": right, "top": top, "bottom": bottom}


def recentre(arr, bg, bbox):
    """Shifts the canvas so left/right and top/bottom margins around bbox
    are equal, padding/cropping with bg.

    FIX (2026-07-15, Fable's independent threshold sweep caught this): the
    src/dst slice ranges below were swapped, so a positive dx (meant to
    shift content LEFT, i.e. new_x = old_x - dx) actually shifted content
    RIGHT instead - the emblem moved the wrong way. The old verify then
    computed "new_bbox" algebraically as (x0 - dx, ...), which assumes the
    shift happened as intended rather than re-measuring the real shifted
    pixels, so it self-reported a clean 0-1px result even though the actual
    image was off by roughly double the intended shift in the wrong
    direction. Fixed by (a) correcting the slice ranges so old_x = new_x +
    dx is applied consistently, and (b) verifying afterwards with
    measure_margins() against the actual shifted array at multiple
    thresholds, independent of this function's own bookkeeping.
    """
    h, w, _ = arr.shape
    x0, y0, x1, y1 = bbox
    left, right = x0, w - 1 - x1
    top, bottom = y0, h - 1 - y1
    dx = round((left - right) / 2)
    dy = round((top - bottom) / 2)

    canvas = np.empty_like(arr)
    canvas[:, :] = bg
    # new[x_new] = old[x_new + dx]  ->  dst ranges over valid new_x, src is dst offset by dx.
    dst_x0, dst_x1 = max(0, -dx), min(w, w - dx)
    dst_y0, dst_y1 = max(0, -dy), min(h, h - dy)
    src_x0, src_x1 = dst_x0 + dx, dst_x1 + dx
    src_y0, src_y1 = dst_y0 + dy, dst_y1 + dy
    canvas[dst_y0:dst_y1, dst_x0:dst_x1] = arr[src_y0:src_y1, src_x0:src_x1]

    return canvas, dx, dy


def main():
    if not SOURCE.exists():
        raise SystemExit(f"source not found: {SOURCE}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    PROOF_DIR.mkdir(parents=True, exist_ok=True)

    src_img = Image.open(SOURCE).convert("RGB")
    if src_img.size != (CANVAS, CANVAS):
        raise SystemExit(f"expected {CANVAS}x{CANVAS}, got {src_img.size}")

    # 1. Untouched reference copy.
    src_img.save(OUT_DIR / "source_raw.png")

    arr = np.asarray(src_img)
    bg = measure_background(arr)
    print(f"measured background colour: {tuple(round(c) for c in bg)} (brief cites ~#080A16)")

    pre_stdev = corner_stdev(arr)
    print(f"pre-patch corner stdev: {pre_stdev:.3f}")

    # 2/3. Watermark removal.
    cleaned, patches_applied, main_label, labeled, mask = remove_watermark(arr, bg)
    for p in patches_applied:
        print(f"flat-filled foreign blob bbox={p['bbox']} size={p['size_px']}px")
    if not patches_applied:
        print("WARNING: no foreign blob found above the size threshold - nothing patched")

    post_stdev = corner_stdev(cleaned)
    print(f"post-patch corner stdev: {post_stdev:.3f} (must be < 2)")
    assert post_stdev < 2, f"post-patch corner stdev {post_stdev:.3f} >= 2"

    # 4. Recentre on the cleaned emblem's own bbox.
    bbox = content_bbox(mask, labeled, main_label)
    print(f"measured emblem bbox: x[{bbox[0]},{bbox[2]}] y[{bbox[1]},{bbox[3]}]")
    shifted, dx, dy = recentre(cleaned, bg, bbox)
    print(f"shift applied: dx={dx} dy={dy}")

    # Independent verification (2026-07-15 fix): re-measure the ACTUAL
    # shifted pixels at a sweep of thresholds, entirely separate from
    # recentre()'s own bookkeeping, so a transform bug cannot self-report a
    # clean result the way the original algebraic new_bbox did.
    print("threshold sweep (independent re-measurement of the shifted image):")
    print(f"{'threshold':>9} | {'left':>5} {'right':>5} (diff) | {'top':>5} {'bottom':>5} (diff)")
    sweep = {t: measure_margins(shifted, bg, t) for t in (18, 40, 80, 100, 120)}
    for t, m in sweep.items():
        lr_diff = abs(m["left"] - m["right"])
        tb_diff = abs(m["top"] - m["bottom"])
        print(f"{t:>9} | {m['left']:>5} {m['right']:>5} ({lr_diff:>3}) | {m['top']:>5} {m['bottom']:>5} ({tb_diff:>3})")

    for t in (40, 100):
        m = sweep[t]
        lr_diff = abs(m["left"] - m["right"])
        tb_diff = abs(m["top"] - m["bottom"])
        assert lr_diff <= MARGIN_TOLERANCE_PX, f"left/right margins not equalised within tolerance at threshold {t} (diff {lr_diff})"
        assert tb_diff <= MARGIN_TOLERANCE_PX, f"top/bottom margins not equalised within tolerance at threshold {t} (diff {tb_diff})"
    print(f"margins verified within {MARGIN_TOLERANCE_PX}px at both threshold 40 and threshold 100 (threshold-invariant)")

    master = Image.fromarray(shifted, mode="RGB")
    master.save(OUT_DIR / "master_1024.png")

    # 5. Size ladder.
    for size in LADDER_SIZES:
        if size == CANVAS:
            continue
        resized = master.resize((size, size), Image.LANCZOS)
        resized.save(OUT_DIR / f"master_{size}.png")

    # Proof copies for review-by-proof (convention h).
    for size in LADDER_SIZES:
        name = f"master_{size}.png"
        Image.open(OUT_DIR / name).save(PROOF_DIR / name)

    print("done:", OUT_DIR)


if __name__ == "__main__":
    main()
