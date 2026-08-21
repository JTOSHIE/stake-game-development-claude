#!/usr/bin/env python3
"""Convention (p) self-test for the AssetForge ingest pass.

An ingest that accepted everything would print a tidy list of accepted files and
look exactly like an ingest that was working. So the refusals are the thing that
has to be SEEN to fire, and each case below plants the defect in the form it
really occurs in this project rather than in a convenient synthetic form:

  the wrong CLASS   not a random string, but the real basenames of the real KEEP,
                    DEAD and REGEN rows, because those are the files somebody
                    will actually drop into the candidates directory by habit.
  aspect drift      not a 10:1 sliver, but a SQUARE candidate for tile_plate,
                    which is 244x204. That is the mistake a generator makes on
                    its own, every time, because square is its default, and it is
                    the one a dimension assertion cannot see.
  residual key      not "is there any green", but green DOMINANCE surviving in
                    pixels the matte kept, which is what a fringe actually is.

It imports the shipping functions from ingest.py rather than reimplementing them,
so it exercises the code that runs, which is the failure convention (p) exists to
prevent.

Run: scripts/assets/.venv/bin/python scripts/assets/assetforge/ingest_selftest.py
"""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ingest import (  # noqa: E402
    Refusal,
    assert_dims,
    green_key_knockout,
    ingest_one,
    load_manifest,
    silhouette_thumb,
)


def green_plate(w: int, h: int, subject: bool = True, fringe: bool = False) -> Image.Image:
    """A key plate with a subject on it, optionally with a green fringe."""
    img = Image.new("RGB", (w, h), (0, 255, 0))
    if subject:
        d = ImageDraw.Draw(img)
        pad = min(w, h) // 5
        if fringe:
            # Dominance 51/255 = 0.20, squarely inside the soft matte band. A real
            # fringe is a BLEND of subject and key on an anti-aliased edge, so it
            # lands mid-band; a fringe at key strength (say 90,200,90 at dominance
            # 0.43) is simply key and the matte removes it outright, which is a
            # different case and does not exercise despill at all.
            d.ellipse([pad - 3, pad - 3, w - pad + 3, h - pad + 3], fill=(150, 201, 150))
        d.ellipse([pad, pad, w - pad, h - pad], fill=(200, 40, 40))
    return img


def write(tmp: Path, name: str, img: Image.Image) -> Path:
    p = tmp / name
    img.save(p)
    return p


def main() -> int:
    index = load_manifest()
    results: list[tuple[str, bool, str]] = []

    def record(name: str, ok: bool, detail: str = "") -> None:
        results.append((name, ok, detail))

    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        out = tmp / "out"

        # ---- SEEDED REFUSALS. Every one must be seen to fire. ----------------
        cases = [
            ("unknown file refused", "not_in_the_manifest.png", green_plate(240, 240),
             "matches no row"),
            ("KEEP row refused", "hero_emblem_512.png", green_plate(512, 512),
             "classified KEEP"),
            ("DEAD row refused", "frame-1.png", green_plate(800, 640),
             "classified DEAD"),
            ("REGEN row refused", "spin_button.png", green_plate(128, 128),
             "classified REGEN"),
        ]
        for label, fname, img, expect in cases:
            p = write(tmp, fname, img)
            try:
                ingest_one(p, index, out)
                record(label, False, "ACCEPTED, it should have refused")
            except Refusal as exc:
                record(label, expect in str(exc), str(exc)[:72])

        # Aspect drift: a SQUARE candidate for the 244x204 tile plate.
        p = write(tmp, "tile_plate.png", green_plate(600, 600))
        try:
            ingest_one(p, index, out)
            record("aspect drift refused", False, "ACCEPTED a square for a 244x204 slot")
        except Refusal as exc:
            record("aspect drift refused", "aspect drift" in str(exc), str(exc)[:72])

        # The assertion itself must be capable of failing.
        try:
            assert_dims(Image.new("RGBA", (63, 64)), 64, 64, "seeded")
            record("dimension assertion fires", False, "a 63x64 image passed a 64x64 assertion")
        except Refusal as exc:
            record("dimension assertion fires", "expected 64x64" in str(exc), str(exc)[:72])

        # ---- CONTROLS. These must pass, or the refusals above prove nothing. -
        p = write(tmp, "wild.png", green_plate(480, 480, fringe=True))
        try:
            rec = ingest_one(p, index, out)
            d = Image.open(rec["delivered"])
            ok = (d.size == (240, 240) and d.mode == "RGBA"
                  and rec["manifest_id"] == "SY-01"
                  and rec["key"]["cleared_px"] > 0 and rec["key"]["opaque_px"] > 0)
            record("valid REPLACE accepted", ok,
                   f"{rec['manifest_id']} {d.size} {d.mode} cleared={rec['key']['cleared_px']}")
            sil = Image.open(rec["silhouette"])
            record("silhouette is 64x64 RGBA", sil.size == (64, 64) and sil.mode == "RGBA",
                   f"{sil.size} {sil.mode}")
            record("despill reduced the fringe", rec["key"]["despilled_px"] > 0,
                   f"despilled {rec['key']['despilled_px']}px")
            record("no key survives in kept pixels",
                   rec["key"]["max_residual_dominance"] <= 0.10 + 1e-6,
                   f"max residual dominance {rec['key']['max_residual_dominance']:.4f}")

            # THE CASE THAT CAUGHT THE HALO. Everything above is measured on the
            # knockout, which happens BEFORE the downscale, so all of it stayed
            # green while the delivered file carried a pure-key edge. The only
            # honest place to assert "no key ships" is the file that ships.
            da = np.asarray(d, dtype=np.int16)
            kept = da[..., 3] > 0
            dom = da[..., 1] - np.maximum(da[..., 0], da[..., 2])
            worst = int(dom[kept].max()) if kept.any() else 0
            # Alpha-weighted, because that is what a viewer composites: a unit of
            # green at one percent opacity is not a halo and calling it one would
            # make the assertion unpassable for the wrong reason. Both are
            # asserted, so neither can hide the other.
            seen = float((dom.clip(0) * da[..., 3] / 255.0).max())
            record("delivered file carries no key", worst <= 26 and seen <= 8.0,
                   f"max dominance {worst}/255, alpha-weighted {seen:.1f}/255")
        except Refusal as exc:
            record("valid REPLACE accepted", False, f"refused: {exc}")

        # THE NATIVE-TRANSPARENT ROUTE. A provider that returns an already cut-out PNG
        # must have its cutout PRESERVED, not recomputed from colour. Before the route
        # detection existed the keyer converted to RGB first, discarded the supplied
        # alpha and returned a fully opaque image, and nothing downstream could see it
        # because the dimensions and the format were both still correct.
        native = Image.new("RGBA", (480, 480), (0, 0, 0, 0))
        nd = ImageDraw.Draw(native)
        nd.ellipse([96, 96, 384, 384], fill=(200, 40, 40, 255))
        p = write(tmp, "scatter.png", native)          # SY-02, a REPLACE row at 240x240
        try:
            rec = ingest_one(p, index, out)
            d = Image.open(rec["delivered"])
            al = np.asarray(d)[..., 3]
            kept = float((al > 0).mean())
            record("native cutout preserved, not re-keyed",
                   rec["key"]["route"] == "native" and 0.05 < kept < 0.95,
                   f"route={rec['key']['route']}, {kept:.1%} of the delivered image is opaque")
        except Refusal as exc:
            record("native cutout preserved, not re-keyed", False, f"refused: {exc}")

        # An RGBA source whose alpha is uniformly opaque is an RGB image wearing four
        # channels, and must take the KEY route rather than the native one.
        flat = Image.new("RGBA", (480, 480), (0, 255, 0, 255))
        fd = ImageDraw.Draw(flat)
        fd.ellipse([96, 96, 384, 384], fill=(200, 40, 40, 255))
        p = write(tmp, "h2.png", flat)                 # SY-06, a REPLACE row at 240x240
        try:
            rec = ingest_one(p, index, out)
            record("fully opaque alpha takes the key route",
                   rec["key"]["route"] == "key" and rec["key"]["cleared_px"] > 0,
                   f"route={rec['key']['route']}, cleared={rec['key'].get('cleared_px')}")
        except Refusal as exc:
            record("fully opaque alpha takes the key route", False, f"refused: {exc}")

        # An opaque row: no key to knock out, no silhouette, JPEG delivery.
        p = write(tmp, "bg_base.jpg", Image.new("RGB", (3840, 2160), (20, 30, 60)))
        try:
            rec = ingest_one(p, index, out)
            d = Image.open(rec["delivered"])
            record("opaque row accepted, no alpha", d.size == (1920, 1080) and d.mode == "RGB",
                   f"{d.size} {d.mode} {Path(rec['delivered']).suffix}")
            record("opaque row grows no silhouette", "silhouette" not in rec,
                   "silhouette absent" if "silhouette" not in rec else "silhouette present")
        except Refusal as exc:
            record("opaque row accepted, no alpha", False, f"refused: {exc}")

        # The knockout must be capable of clearing nothing when there is no key.
        _, stats = green_key_knockout(Image.new("RGB", (32, 32), (200, 40, 40)))
        record("no false knockout on keyless art", stats["cleared_px"] == 0,
               f"cleared {stats['cleared_px']}px of a solid red plate")

        # A silhouette of an empty alpha must be empty, not a full square.
        empty = silhouette_thumb(Image.new("RGBA", (100, 100), (0, 0, 0, 0)))
        record("empty alpha yields empty silhouette",
               np.asarray(empty.split()[-1]).max() == 0, "alpha max 0")

    print("ASSETFORGE INGEST SELF-TEST\n")
    for name, ok, detail in results:
        print(f"  [{'PASS' if ok else 'FAIL'}] {name:34s} {detail}")
    failed = [n for n, ok, _ in results if not ok]
    print()
    if failed:
        print(f"SELF-TEST FAILED: {len(failed)} of {len(results)} cases: {', '.join(failed)}")
        return 1
    print(f"SELF-TEST PASSED: {len(results)}/{len(results)} cases, every seeded "
          f"refusal fired and every control held.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
