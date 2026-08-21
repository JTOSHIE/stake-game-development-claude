#!/usr/bin/env python3
"""AssetForge ingest: green-key knockout, delivery downscale, silhouette, manifest assertion.

The QA pass that stands between a generated candidate and the shipped tree. It
adopts nothing: everything lands in a gitignored scratch directory and only an
owner-approved asset is ever copied into the repository, per the R083 brief and
convention (h.1).

WHY THE MANIFEST IS THE GATE AND NOT A LOOKUP. `docs/art/art_manifest_arc2.csv`
classifies all 47 shipped rasters, and only its 30 REPLACE rows may be ingested.
The other three classes each refuse for a different and load-bearing reason:

  KEEP  is BR-01, the hero emblem, whose own row reads "Do not replace, restyle
        or recolour". It is the palette anchor every other asset harmonises
        with, so an ingest that quietly overwrote it would move the target the
        whole arc is aiming at.
  DEAD  ships but never renders, and its rows read "Delete, do not redraw". A
        redraw here would spend art budget on a file no player can see, and
        SC-07 would then regenerate itself from a stale export entry anyway.
  REGEN is NOT UI ART. DOC-01's row: the live control is CSS plus inline SVG and
        the PNG is a HEADLESS SCREENSHOT of it, produced by
        frontend/scripts/regen_interface_guide_icons.mjs. A hand-drawn
        replacement drifts from the button it documents. Restyle the control and
        re-run the regenerator instead.

So a file that names no manifest row is refused, and a file that names the wrong
CLASS of row is refused with the reason its row gives. Refusal writes nothing.

WHY ASPECT IS CHECKED SEPARATELY FROM DIMENSION. Resizing straight to the target
always satisfies a dimension assertion, which is exactly why the assertion alone
is not evidence: a square symbol squashed into 244x204 passes it while looking
wrong. The aspect check is the one that catches that, and it runs BEFORE the
resize, on the source. Convention (p) reasoning applied to an assertion rather
than to a gate.

Run: scripts/assets/.venv/bin/python scripts/assets/assetforge/ingest.py \
       --in <dir-of-candidates> [--id SY-01] [--out .scratch/assetforge/ingest]
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image

REPO = Path(__file__).resolve().parents[3]
MANIFEST = REPO / "docs" / "art" / "art_manifest_arc2.csv"
DEFAULT_OUT = REPO / ".scratch" / "assetforge" / "ingest"

INGESTABLE = "REPLACE"
SILHOUETTE_PX = 64

# Green dominance, g - max(r, b), in normalised units. At or below LOW the pixel
# is subject and fully opaque; at or above HIGH it is key and fully clear; the
# band between is the soft matte that keeps hair and glow edges from stairstepping.
KEY_TOL_LOW = 0.10
KEY_TOL_HIGH = 0.30

# A source whose aspect differs from its target by more than this is refused
# rather than squashed. One percent absorbs a rounding difference like 244x204
# against 245x205 without absorbing a square drawn for a non-square slot.
ASPECT_TOLERANCE = 0.01

# Alpha at or below this is snapped to fully clear during the premultiplied
# downscale. Two units out of 255 is under one percent opacity: below what any
# display resolves, and squarely inside Lanczos ringing.
ALPHA_SNAP_FLOOR = 2.0 / 255.0


class Refusal(Exception):
    """The candidate is not ingestable. Nothing is written."""


def sha256_of(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_manifest(path: Path = MANIFEST) -> dict[str, dict]:
    """Index every manifest row by BOTH its id and its basename.

    Basenames are unique across all 47 rows (asserted here rather than assumed,
    because the day a second `frame-1.png` appears in another directory is the
    day silent resolution by basename starts ingesting into the wrong row).
    """
    rows = list(csv.DictReader(path.open(encoding="utf-8")))
    if not rows:
        raise Refusal(f"manifest is empty: {path}")
    index: dict[str, dict] = {}
    seen_basenames: dict[str, str] = {}
    for row in rows:
        base = row["path"].split("/")[-1]
        if base in seen_basenames:
            raise Refusal(
                f"manifest basename collision: {base!r} is used by both "
                f"{seen_basenames[base]} and {row['id']}; resolution by basename "
                f"is no longer safe, pass --id explicitly"
            )
        seen_basenames[base] = row["id"]
        index[row["id"]] = row
        index[base] = row
    return index


def resolve_row(candidate: Path, index: dict[str, dict], explicit_id: str | None) -> dict:
    """Find the manifest row this candidate claims, or refuse."""
    if explicit_id:
        row = index.get(explicit_id)
        if row is None:
            raise Refusal(f"no manifest row with id {explicit_id!r}")
    else:
        row = index.get(candidate.name)
        if row is None:
            raise Refusal(
                f"{candidate.name!r} matches no row in art_manifest_arc2.csv. "
                f"Name the candidate after the shipped file it replaces, or pass --id."
            )
    cls = row["classification"]
    if cls != INGESTABLE:
        note = (row.get("notes") or "").strip().split(".")[0]
        raise Refusal(
            f"{row['id']} ({row['path']}) is classified {cls}, not {INGESTABLE}. "
            f"{note}."
        )
    return row


def target_dims(row: dict) -> tuple[int, int]:
    raw = (row["target_dimensions"] or "").strip().lower()
    if "x" not in raw:
        raise Refusal(f"{row['id']} has no parseable target_dimensions: {raw!r}")
    w, h = raw.split("x", 1)
    return int(w), int(h)


def check_aspect(src: Image.Image, w: int, h: int, allow: bool) -> float:
    """Compare source aspect with target aspect BEFORE any resize."""
    src_aspect = src.width / src.height
    tgt_aspect = w / h
    drift = abs(src_aspect - tgt_aspect) / tgt_aspect
    if drift > ASPECT_TOLERANCE and not allow:
        raise Refusal(
            f"aspect drift {drift:.1%}: source is {src.width}x{src.height} "
            f"({src_aspect:.4f}) but the target is {w}x{h} ({tgt_aspect:.4f}). "
            f"Resizing would squash the art and still satisfy the dimension "
            f"assertion. Re-render at the target aspect, or pass "
            f"--allow-aspect-change if the crop is deliberate."
        )
    return drift


def green_key_knockout(
    img: Image.Image,
    tol_low: float = KEY_TOL_LOW,
    tol_high: float = KEY_TOL_HIGH,
) -> tuple[Image.Image, dict]:
    """Knock the green key out to alpha and despill what it left behind.

    Keying on green DOMINANCE, g - max(r, b), rather than on distance to a
    nominal key colour, because a render's key is never one exact RGB triple:
    it carries the scene's own lighting across it. Dominance is what the key
    and the subject actually differ in.
    """
    rgb = np.asarray(img.convert("RGB"), dtype=np.float32) / 255.0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    other = np.maximum(r, b)
    dominance = g - other

    alpha = 1.0 - np.clip((dominance - tol_low) / (tol_high - tol_low), 0.0, 1.0)

    # DESPILL, HARDER AT THE EDGE THAN IN THE INTERIOR, because that is where
    # spill actually lives. A solid interior pixel never touched the key and may
    # legitimately be green, so it keeps the gentle ceiling. A PARTIALLY
    # transparent pixel is by definition a blend with the key, so it is clamped
    # to carry no green dominance at all.
    #
    # The gentle ceiling alone was not enough, measured rather than assumed: it
    # permits dominance up to tol_low in kept pixels, and the downscale then
    # resamples that allowance up to 46/255 on the delivered edge. Clamping the
    # edge to zero dominance is what actually removes the fringe.
    edge = (alpha > 0.0) & (alpha < 1.0)
    solid = alpha >= 1.0
    g_despilled = np.where(edge, np.minimum(g, other),
                  np.where(solid, np.minimum(g, other + tol_low), g))

    out = np.stack([r, g_despilled, b, alpha], axis=-1)
    out = np.clip(out * 255.0, 0, 255).astype(np.uint8)

    # Measured AFTER despill, on the pixels the matte kept. Measuring the input
    # array here would report the fringe the despill just removed and would make
    # a broken despill indistinguishable from a working one, which is the whole
    # thing this number exists to tell apart.
    residual = (g_despilled - other)[alpha > 0.0]

    stats = {
        "cleared_px": int((alpha <= 0.0).sum()),
        "opaque_px": int((alpha >= 1.0).sum()),
        "soft_edge_px": int(((alpha > 0.0) & (alpha < 1.0)).sum()),
        "despilled_px": int((g_despilled < g).sum()),
        "max_residual_dominance": float(residual.max()) if residual.size else 0.0,
    }
    return Image.fromarray(out, mode="RGBA"), stats


def despill_existing(rgba: Image.Image) -> tuple[Image.Image, dict]:
    """Native route: keep the supplied alpha, apply the same edge despill rule."""
    arr = np.asarray(rgba, dtype=np.float32) / 255.0
    r, g, b, alpha = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    other = np.maximum(r, b)
    edge = (alpha > 0.0) & (alpha < 1.0)
    solid = alpha >= 1.0
    g_despilled = np.where(edge, np.minimum(g, other),
                  np.where(solid, np.minimum(g, other + KEY_TOL_LOW), g))
    out = np.stack([r, g_despilled, b, alpha], axis=-1)
    residual = (g_despilled - other)[alpha > 0.0]
    stats = {
        "cleared_px": int((alpha <= 0.0).sum()),
        "opaque_px": int((alpha >= 1.0).sum()),
        "soft_edge_px": int(edge.sum()),
        "despilled_px": int((g_despilled < g).sum()),
        "max_residual_dominance": float(residual.max()) if residual.size else 0.0,
    }
    return Image.fromarray(np.clip(out * 255.0, 0, 255).astype(np.uint8), mode="RGBA"), stats


def resize_premultiplied(rgba: Image.Image, w: int, h: int) -> Image.Image:
    """Downscale RGBA through PREMULTIPLIED alpha, then restore straight alpha.

    THIS IS NOT A REFINEMENT, IT IS THE DIFFERENCE BETWEEN A CLEAN EDGE AND A
    GREEN HALO ON EVERY SYMBOL. A cleared pixel still carries its original RGB,
    which after a green-key knockout is the key itself. Lanczos resamples RGB and
    alpha independently, so downscaling straight RGBA averages that key colour
    back into every partially transparent edge pixel: alpha says "barely there"
    while RGB says "pure green", and the game composites the green.

    Caught on the first end-to-end run of this script, not by its self-test: the
    knockout's own statistics were clean because they are measured BEFORE the
    resize. The self-test now measures the DELIVERED file for exactly this reason.

    Premultiplying first makes a transparent pixel contribute nothing to the
    average, which is what "transparent" is supposed to mean.
    """
    arr = np.asarray(rgba, dtype=np.float32) / 255.0
    rgb, alpha = arr[..., :3], arr[..., 3:4]
    premul = np.concatenate([rgb * alpha, alpha], axis=-1)
    small = np.asarray(
        Image.fromarray(np.clip(premul * 255.0, 0, 255).astype(np.uint8), mode="RGBA")
        .resize((w, h), Image.LANCZOS),
        dtype=np.float32,
    ) / 255.0
    a = small[..., 3:4]

    # SNAP NEAR-ZERO ALPHA TO ZERO BEFORE DIVIDING. Lanczos rings, so a region
    # that should be fully clear comes back carrying one or two units of alpha,
    # and un-premultiplying those divides a near-zero colour by a near-zero
    # alpha and clips the result to pure key. Measured on the first run: 510
    # pixels at alpha 1 to 7 sat at full green dominance for exactly this
    # reason. They are under one percent opaque and invisible, so the honest
    # move is to finish clearing them rather than to amplify them and then
    # excuse the number.
    a = np.where(a < ALPHA_SNAP_FLOOR, 0.0, a)

    straight = np.where(a > 0.0, np.clip(small[..., :3] / np.maximum(a, 1e-6), 0.0, 1.0), 0.0)
    out = np.concatenate([straight, a], axis=-1)
    return Image.fromarray(np.clip(out * 255.0, 0, 255).astype(np.uint8), mode="RGBA")


def detect_alpha_route(img: Image.Image) -> tuple[str, dict]:
    """Decide whether this candidate arrived with alpha already, or on a key field.

    Both routes are real now: the Stability API can return a PNG that is already cut out,
    and it can also return an opaque render on a chroma field. Guessing wrong is not a
    near miss in either direction. Running the keyer over an ALREADY transparent PNG is
    the worse one, because the keyer reads RGB only: it would compute a fresh matte from
    colour, ignore the alpha the provider supplied, and hand back a fully opaque image
    whose cutout has been silently thrown away. Nothing downstream would notice, because
    the dimensions and the format would both still be right.

    So the route is decided by measurement, not by a flag somebody remembers to pass.
    """
    if img.mode not in ("RGBA", "LA", "PA"):
        return "key", {"reason": f"source mode {img.mode} carries no alpha channel"}
    alpha = np.asarray(img.convert("RGBA").split()[-1], dtype=np.uint8)
    clear_fraction = float((alpha < 255).mean())
    # A PNG can carry an alpha channel that is uniformly opaque, which is an RGB image
    # wearing four channels. That is the key route, not the native one.
    if clear_fraction < 1e-6:
        return "key", {"reason": "alpha channel present but fully opaque, so it carries no cutout"}
    return "native", {"reason": "source supplied its own cutout",
                      "clear_fraction": round(clear_fraction, 5)}


def silhouette_thumb(rgba: Image.Image, size: int = SILHOUETTE_PX) -> Image.Image:
    """A contain-fitted binary silhouette, for eyeballing shape reads at a glance."""
    alpha = np.asarray(rgba.split()[-1], dtype=np.uint8)
    mask = Image.fromarray(np.where(alpha >= 128, 255, 0).astype(np.uint8), mode="L")
    fitted = mask.copy()
    fitted.thumbnail((size, size), Image.LANCZOS)
    canvas = Image.new("L", (size, size), 0)
    canvas.paste(fitted, ((size - fitted.width) // 2, (size - fitted.height) // 2))
    black = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    black.putalpha(canvas)
    return black


def assert_dims(img: Image.Image, w: int, h: int, label: str) -> None:
    if (img.width, img.height) != (w, h):
        raise Refusal(
            f"{label}: expected {w}x{h}, produced {img.width}x{img.height}"
        )


def ingest_one(
    candidate: Path,
    index: dict[str, dict],
    out_dir: Path,
    explicit_id: str | None = None,
    allow_aspect_change: bool = False,
) -> dict:
    """Run the whole pass for one candidate. Raises Refusal and writes nothing."""
    row = resolve_row(candidate, index, explicit_id)
    w, h = target_dims(row)
    wants_alpha = row["alpha"].strip().lower() == "yes"

    src = Image.open(candidate)
    src.load()
    drift = check_aspect(src, w, h, allow_aspect_change)

    if wants_alpha:
        route, route_why = detect_alpha_route(src)
        if route == "native":
            # Preserve the provider's cutout untouched. Despill still runs, because a
            # natively cut-out render can still carry a green rim if it was composed
            # against one, and the edge clamp is the same rule either way.
            keyed, key_stats = despill_existing(src.convert("RGBA"))
        else:
            keyed, key_stats = green_key_knockout(src)
        key_stats = {"route": route, **route_why, **key_stats}
    else:
        keyed, key_stats = src.convert("RGB"), {"route": "opaque",
                                                "reason": "row is opaque, no alpha to handle"}

    delivered = (resize_premultiplied(keyed, w, h) if wants_alpha
                 else keyed.resize((w, h), Image.LANCZOS))
    assert_dims(delivered, w, h, f"{row['id']} delivery")

    out_dir.mkdir(parents=True, exist_ok=True)
    # Deliver in the format the manifest DECLARES, not in whatever the candidate
    # arrived as. A transparent row saved as JPEG loses its alpha silently, and
    # an opaque row saved as PNG inflates a 1920x1080 background well past the
    # kit's size budget. The manifest's `format` column is the authority.
    suffix = Path(row["path"]).suffix.lower()
    stem = Path(row["path"]).stem
    delivered_path = out_dir / f"{stem}{suffix}"
    if suffix in {".jpg", ".jpeg"}:
        delivered.convert("RGB").save(delivered_path, quality=92, subsampling=0)
    else:
        delivered.save(delivered_path)

    record = {
        "utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "manifest_id": row["id"],
        "manifest_path": row["path"],
        "classification": row["classification"],
        "source": str(candidate),
        "source_sha256": sha256_of(candidate),
        "source_dims": [src.width, src.height],
        "target_dims": [w, h],
        "aspect_drift": round(drift, 5),
        "alpha_expected": wants_alpha,
        "key": key_stats,
        "delivered": str(delivered_path),
        "delivered_sha256": sha256_of(delivered_path),
    }

    if wants_alpha:
        thumb = silhouette_thumb(delivered)
        assert_dims(thumb, SILHOUETTE_PX, SILHOUETTE_PX, f"{row['id']} silhouette")
        thumb_path = out_dir / f"{stem}_silhouette_{SILHOUETTE_PX}.png"
        thumb.save(thumb_path)
        record["silhouette"] = str(thumb_path)
        record["silhouette_sha256"] = sha256_of(thumb_path)

    with (out_dir / "ingest_ledger.jsonl").open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record) + "\n")
    return record


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--in", dest="src", required=True, help="file, or directory of candidates")
    ap.add_argument("--out", dest="out", default=str(DEFAULT_OUT))
    ap.add_argument("--id", dest="explicit_id", default=None,
                    help="manifest id, when the candidate is not named after the shipped file")
    ap.add_argument("--allow-aspect-change", action="store_true")
    args = ap.parse_args()

    src = Path(args.src)
    out_dir = Path(args.out)
    candidates = sorted(p for p in ([src] if src.is_file() else src.glob("*"))
                        if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"})
    if not candidates:
        print(f"INGEST: no candidate images under {src}", file=sys.stderr)
        return 1
    if args.explicit_id and len(candidates) > 1:
        print("INGEST: --id names one row, so it takes exactly one candidate", file=sys.stderr)
        return 1

    index = load_manifest()
    accepted, refused = 0, 0
    for c in candidates:
        try:
            rec = ingest_one(c, index, out_dir, args.explicit_id, args.allow_aspect_change)
        except Refusal as exc:
            refused += 1
            print(f"  [REFUSED] {c.name}: {exc}")
            continue
        accepted += 1
        key = rec["key"]
        detail = (f"cleared {key['cleared_px']}px, soft edge {key['soft_edge_px']}px"
                  if "cleared_px" in key else "opaque row")
        print(f"  [OK]       {c.name} -> {rec['manifest_id']} "
              f"{rec['target_dims'][0]}x{rec['target_dims'][1]}, {detail}")

    print(f"\nINGEST: {accepted} accepted, {refused} refused, ledger at "
          f"{out_dir / 'ingest_ledger.jsonl'}")
    return 0 if refused == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())
