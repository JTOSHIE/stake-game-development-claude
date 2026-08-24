#!/usr/bin/env python3
"""Owner-art pipeline: ingest supplied background candidates, with provenance.

Ingests the owner-supplied background candidates as CANDIDATES. It adopts
nothing: the shipped `bg_base.jpg` is never written by this script, and the
candidates land in their own `candidates/` directory beside it.

The four-point external-art test in CLAUDE.md ("The test for any future
external asset") is answered here by MEASUREMENT rather than by assertion,
which is the whole point of the test:

  1. Enhancement of art we already own, or a new design? The vendor drop
     includes `bg_original.jpg`, described in its README as "Your original file
     for reference". If that file is byte-identical to our shipped `bg_base.jpg`
     then our own art provably was the input, and the question becomes how far
     each candidate moved from it, which point 2 measures.
  2. Does the silhouette match? A background has no subject bounding box, so
     the equivalent measurement is composition correspondence: a downsampled,
     GRADE-INVARIANT comparison against the incumbent, so that a regrade of our
     own scene scores as the enhancement it is while a rearrangement of it does
     not. A candidate that correlates loosely is a new composition wearing an
     enhancement's clothes, exactly as a changed silhouette would be.
  3. Alpha channel and effect anchors? Backgrounds are opaque RGB, so there is
     no alpha to preserve. The anchors that do matter are the regions the HUD
     draws over: a candidate that lifts the bottom strip lifts it under white
     HUD text. Measured per region, and reported.
  4. Record the provenance. This script writes it, machine-readable, beside
     the candidates.

Run: scripts/assets/.venv/bin/python scripts/assets/background_candidate_ingest.py
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = Path.home() / "Downloads/slot_background_assets"
BG_DIR = ROOT / "frontend/public/assets/themes/future-spinner/backgrounds"
CAND_DIR = BG_DIR / "candidates"
RECORD_DIR = ROOT / "reports/qa"

INCUMBENT = BG_DIR / "bg_base.jpg"

# The vendor drop, and the README claim made for each file, quoted so the
# record carries what we were told alongside what we measured.
SOURCES = [
    ("v1", "bg_improved_v1.jpg", "Alternative compositions in the same style."),
    ("v2", "bg_improved_v2.jpg", "Alternative compositions in the same style."),
]
# Read for the provenance anchor only. Not a candidate, not ingested.
ANCHOR = "bg_original.jpg"

# CONTROLS, and they are the reason this record can answer point 1 at all.
#
# A correlation of 0.35 against the incumbent means nothing on its own. It only
# becomes evidence beside a file whose relationship to our art is DECLARED, and
# the vendor drop supplies one: `bg_original_enhanced.jpg`, described in the
# README as "Your original image with contrast, sharpness and colour boost
# applied (keeps the exact same scene)". That is a known enhancement, so
# whatever it scores IS the enhancement signature, measured on this drop by this
# method. `bg_original.jpg` pins the other end at identity.
#
# This is convention (l.4): the controls and the candidates are scored by the
# same code on the same incumbent, and the controls are what make the
# candidates' numbers mean something.
CONTROLS = [
    ("bg_original.jpg", "Your original file for reference.",
     "identity anchor, expected r = 1.0"),
    ("bg_original_enhanced.jpg",
     "Your original image with contrast, sharpness and colour boost applied "
     "(keeps the exact same scene).",
     "DECLARED ENHANCEMENT, the permitted-class signature"),
    ("bg_highquality_1920x1080.jpg",
     "New higher-quality version (recommended). Much sharper, richer neon, "
     "better reflections and atmosphere.",
     "vendor's recommended file, relationship undeclared"),
]

# Web-appropriate compression. The incumbent is the byte budget to beat or
# match: a candidate that ships four times the bytes for a background nobody
# looks at directly is not web-appropriate whatever it looks like. Swept
# rather than guessed, and the sweep is reported.
QUALITY_SWEEP = [92, 88, 85, 82, 80, 78, 75]

# Regions the measurement reports, as fractions of height. The HUD strip and
# the title band are where background luminance becomes a legibility question,
# so they are measured separately from the scene as a whole.
REGIONS = {
    "full": (0.00, 1.00),
    "title_band_top_18pc": (0.00, 0.18),
    "stage_band_middle_64pc": (0.18, 0.82),
    "hud_strip_bottom_18pc": (0.82, 1.00),
}


def sha256_of(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def luma(img: Image.Image) -> np.ndarray:
    """Rec. 601 luminance in 0..255 as float64, full resolution."""
    a = np.asarray(img.convert("RGB"), dtype=np.float64)
    return 0.299 * a[:, :, 0] + 0.587 * a[:, :, 1] + 0.114 * a[:, :, 2]


def region_stats(y: np.ndarray) -> dict:
    out = {}
    h = y.shape[0]
    for name, (lo, hi) in REGIONS.items():
        band = y[int(lo * h): int(hi * h), :]
        out[name] = {
            "mean_luma_255": round(float(band.mean()), 2),
            "p05_luma_255": round(float(np.percentile(band, 5)), 2),
            "p95_luma_255": round(float(np.percentile(band, 95)), 2),
            "stdev_luma_255": round(float(band.std()), 2),
        }
    return out


def composition_correspondence(a: Image.Image, b: Image.Image) -> dict:
    """How far a candidate moved from the incumbent COMPOSITION, not its grade.

    Downsampled to 64x36 so the measurement reads layout and tonal massing
    rather than grain or JPEG noise, which is the question being asked.

    The two decisive figures are GRADE-INVARIANT, and that correction was
    forced by the self-test rather than foreseen. A regrade is a global affine
    transform of tone: it moves every cell's absolute value while moving none of
    them relative to the others. The first version of this function measured
    absolute difference, so a hard contrast-and-colour push scored 33.7 per cent
    of cells "moved" and was classified a redesign, which is precisely wrong.
    Standardising each grid to zero mean and unit variance before differencing
    removes the grade and leaves the layout, which is the thing point 2 of the
    external-art test actually asks about. Pearson r is already affine-invariant
    by construction, which is why it held up where the raw share did not.

    The raw figures are kept alongside, because a large tonal shift with an
    unchanged composition is still worth seeing in the record.
    """
    grid = (64, 36)
    ga = np.asarray(a.convert("L").resize(grid, Image.LANCZOS), dtype=np.float64)
    gb = np.asarray(b.convert("L").resize(grid, Image.LANCZOS), dtype=np.float64)
    fa, fb = ga.ravel(), gb.ravel()

    def standardise(v: np.ndarray) -> np.ndarray:
        s = v.std()
        return (v - v.mean()) / (s if s > 1e-9 else 1.0)

    za, zb = standardise(fa), standardise(fb)
    r = float(np.corrcoef(fa, fb)[0, 1])
    return {
        "downsample_grid": f"{grid[0]}x{grid[1]}",
        "pearson_r_vs_incumbent": round(r, 4),
        # Grade-invariant, and the two the classifier reads.
        "share_cells_moved_gt_half_sd": round(float((np.abs(za - zb) > 0.5).mean()), 4),
        "mean_abs_diff_standardised_sd": round(float(np.abs(za - zb).mean()), 4),
        # Raw, for the record only.
        "raw_mean_abs_diff_luma_255": round(float(np.abs(fa - fb).mean()), 2),
        "raw_share_cells_moved_gt_10pc_range": round(
            float((np.abs(fa - fb) > 25.5).mean()), 4
        ),
    }


# The point-1 thresholds, in one place, so the self-test exercises the same
# predicate the ingest does rather than a lookalike reimplementation of it.
#
# Both sit in the middle of a wide measured gap, not on a round number chosen
# for looking tidy. Across the self-test's six seeded cases plus the vendor's
# declared enhancement, the two classes separate like this:
#
#   enhancements (identity, two regrades, vendor declared):
#       r 0.9640 to 1.0000, cells moved 0.0 to 7.3 per cent
#   recompositions (mirrored, panned 28 per cent, horizon relocated):
#       r 0.2478 to 0.5562, cells moved 39.0 to 54.9 per cent
#
# So r has a clear band between 0.5562 and 0.9640, and the moved share has one
# between 7.3 and 39.0 per cent. The thresholds below sit inside both.
ENHANCEMENT_MIN_R = 0.90
ENHANCEMENT_MAX_MOVED = 0.20


def classify(comp: dict) -> str:
    """ENHANCEMENT or NEW DESIGN, from a composition_correspondence() result.

    Reads the grade-invariant figures only, so a heavily regraded version of our
    own scene classifies as the enhancement it is.
    """
    return (
        "ENHANCEMENT"
        if comp["pearson_r_vs_incumbent"] >= ENHANCEMENT_MIN_R
        and comp["share_cells_moved_gt_half_sd"] <= ENHANCEMENT_MAX_MOVED
        else "NEW DESIGN"
    )


def compress_web(src: Image.Image, dst: Path, budget_bytes: int) -> dict:
    """Encode at the highest swept quality that stays inside the byte budget.

    Progressive, optimised, 4:2:0. If nothing in the sweep fits, the lowest
    swept quality is written and the overshoot is reported rather than hidden.
    """
    sweep = []
    chosen = None
    for q in QUALITY_SWEEP:
        dst.parent.mkdir(parents=True, exist_ok=True)
        src.convert("RGB").save(
            dst, "JPEG", quality=q, optimize=True, progressive=True, subsampling="4:2:0"
        )
        n = dst.stat().st_size
        sweep.append({"quality": q, "bytes": n})
        if chosen is None and n <= budget_bytes:
            chosen = q
            break
    if chosen is None:
        chosen = QUALITY_SWEEP[-1]
        src.convert("RGB").save(
            dst, "JPEG", quality=chosen, optimize=True, progressive=True,
            subsampling="4:2:0",
        )
    return {
        "sweep": sweep,
        "chosen_quality": chosen,
        "budget_bytes": budget_bytes,
        "output_bytes": dst.stat().st_size,
        "within_budget": dst.stat().st_size <= budget_bytes,
        "encoder_settings": "JPEG optimize=True progressive=True subsampling=4:2:0",
    }


def main() -> int:
    if not INCUMBENT.exists():
        print(f"incumbent not found: {INCUMBENT}")
        return 2
    missing = [n for _, n, _ in SOURCES if not (SRC_DIR / n).exists()]
    if missing:
        print(f"source candidates not found in {SRC_DIR}: {missing}")
        return 2

    CAND_DIR.mkdir(parents=True, exist_ok=True)
    RECORD_DIR.mkdir(parents=True, exist_ok=True)

    inc_img = Image.open(INCUMBENT)
    inc_sha = sha256_of(INCUMBENT)
    inc_bytes = INCUMBENT.stat().st_size
    inc_luma = luma(inc_img)

    # Point 1 of the external-art test, measured. The vendor's "your original
    # file for reference" either is our shipped asset or it is not.
    anchor_path = SRC_DIR / ANCHOR
    anchor = {"file": ANCHOR, "present": anchor_path.exists()}
    if anchor_path.exists():
        anchor_sha = sha256_of(anchor_path)
        anchor.update({
            "sha256": anchor_sha,
            "bytes": anchor_path.stat().st_size,
            "byte_identical_to_shipped_bg_base": anchor_sha == inc_sha,
            "readme_claim": "Your original file for reference.",
        })

    record = {
        "generated_utc": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "script": "scripts/assets/background_candidate_ingest.py",
        "adopts_anything": False,
        "note": (
            "Candidates only. The shipped bg_base.jpg is not written by this "
            "script and is byte-unchanged by this session."
        ),
        "source_directory": str(SRC_DIR),
        "incumbent": {
            "path": str(INCUMBENT.relative_to(ROOT)),
            "dimensions": f"{inc_img.size[0]}x{inc_img.size[1]}",
            "mode": inc_img.mode,
            "bytes": inc_bytes,
            "sha256": inc_sha,
            "regions": region_stats(inc_luma),
        },
        "provenance_anchor": anchor,
        "external_art_test_reference": "CLAUDE.md, 'The test for any future external asset'",
        "controls": [],
        "candidates": [],
    }

    # Score the controls first, by the same method, so the candidates' numbers
    # below are read against a declared enhancement rather than against nothing.
    for name, claim, role in CONTROLS:
        p = SRC_DIR / name
        if not p.exists():
            record["controls"].append({"file": name, "present": False, "role": role})
            continue
        cimg = Image.open(p)
        record["controls"].append({
            "file": name,
            "present": True,
            "role": role,
            "vendor_readme_claim": claim,
            "sha256": sha256_of(p),
            "bytes": p.stat().st_size,
            "dimensions": f"{cimg.size[0]}x{cimg.size[1]}",
            "composition_vs_incumbent": composition_correspondence(inc_img, cimg),
            "ingested": False,
        })

    for tag, name, claim in SOURCES:
        src_path = SRC_DIR / name
        img = Image.open(src_path)
        src_sha = sha256_of(src_path)
        src_bytes = src_path.stat().st_size
        mtime = datetime.fromtimestamp(
            src_path.stat().st_mtime, tz=timezone.utc
        ).strftime("%Y-%m-%dT%H:%M:%SZ")

        dst = CAND_DIR / f"bg_base_candidate_{tag}.jpg"
        comp = compress_web(img, dst, inc_bytes)
        out_img = Image.open(dst)
        out_luma = luma(out_img)

        entry = {
            "tag": tag,
            "source_path": str(src_path),
            "source_sha256": src_sha,
            "source_bytes": src_bytes,
            "source_mtime_utc": mtime,
            "source_dimensions": f"{img.size[0]}x{img.size[1]}",
            "source_mode": img.mode,
            "vendor_readme_claim": claim,
            "ingested_to": str(dst.relative_to(ROOT)),
            "ingested_sha256": sha256_of(dst),
            "compression": comp,
            "test_1_dimensions_match_incumbent": img.size == inc_img.size,
            "test_2_composition_vs_incumbent": composition_correspondence(inc_img, img),
            "test_3_alpha": {
                "source_has_alpha": "A" in img.getbands(),
                "note": (
                    "Opaque RGB background layer; no alpha to preserve. The "
                    "anchors that matter are the HUD and title regions the "
                    "interface draws over, measured below."
                ),
            },
            "regions_after_web_compression": region_stats(out_luma),
            "region_delta_vs_incumbent_mean_luma": {
                r: round(
                    region_stats(out_luma)[r]["mean_luma_255"]
                    - record["incumbent"]["regions"][r]["mean_luma_255"],
                    2,
                )
                for r in REGIONS
            },
        }
        record["candidates"].append(entry)

    # Point 1 of the external-art test, decided against the control rather than
    # by opinion. The declared enhancement sets the threshold; anything scoring
    # far below it did not enhance our art, it replaced it.
    enh = next(
        (c for c in record["controls"]
         if c.get("present") and c["file"] == "bg_original_enhanced.jpg"),
        None,
    )
    if enh:
        enh_r = enh["composition_vs_incumbent"]["pearson_r_vs_incumbent"]
        enh_moved = enh["composition_vs_incumbent"]["share_cells_moved_gt_half_sd"]
        for c in record["candidates"]:
            comp = c["test_2_composition_vs_incumbent"]
            cr = comp["pearson_r_vs_incumbent"]
            cm = comp["share_cells_moved_gt_half_sd"]
            klass = classify(comp)
            is_enh = klass == "ENHANCEMENT"
            c["test_1_verdict"] = {
                "class": klass,
                "candidate_r": cr,
                "declared_enhancement_control_r": enh_r,
                "candidate_share_cells_moved": cm,
                "declared_enhancement_control_share_cells_moved": enh_moved,
                "threshold_applied": (
                    f"r >= {ENHANCEMENT_MIN_R} and cells moved <= "
                    f"{ENHANCEMENT_MAX_MOVED * 100:g} per cent"
                ),
                "classifier_selftest": (
                    "scripts/assets/background_candidate_ingest_selftest.py, "
                    "convention (p): seeds a real enhancement and a real "
                    "recomposition and proves the classifier separates them"
                ),
                "claude_md_rule": (
                    "external ENHANCEMENT of existing art is permitted; "
                    "externally DESIGNED art is not"
                ),
                "permitted_under_that_rule_without_a_new_ruling": is_enh,
            }

    out_json = RECORD_DIR / "background_candidate_ingest.json"
    out_json.write_text(json.dumps(record, indent=2) + "\n")

    # Console summary, so a run is legible without opening the JSON.
    inc_r = record["incumbent"]["regions"]
    print(f"incumbent  {record['incumbent']['dimensions']}  {inc_bytes:,}B  "
          f"sha {inc_sha[:16]}")
    print(f"           full mean luma {inc_r['full']['mean_luma_255']}, "
          f"hud strip {inc_r['hud_strip_bottom_18pc']['mean_luma_255']}")
    if anchor.get("byte_identical_to_shipped_bg_base"):
        print(f"anchor     {ANCHOR} is BYTE-IDENTICAL to shipped bg_base.jpg: "
              f"our own art provably was the input")
    elif anchor.get("present"):
        print(f"anchor     {ANCHOR} present but NOT byte-identical to bg_base.jpg")
    else:
        print(f"anchor     {ANCHOR} absent; point 1 not anchored by measurement")
    print("\ncontrols, scored by the same method on the same incumbent:")
    for c in record["controls"]:
        if not c.get("present"):
            print(f"  {c['file']:32s} ABSENT   {c['role']}")
            continue
        cc = c["composition_vs_incumbent"]
        print(f"  {c['file']:32s} r={cc['pearson_r_vs_incumbent']:6.4f} "
              f"moved={cc['share_cells_moved_gt_half_sd'] * 100:5.1f}%   {c['role']}")

    for c in record["candidates"]:
        t2 = c["test_2_composition_vs_incumbent"]
        d = c["region_delta_vs_incumbent_mean_luma"]
        print(f"\ncandidate {c['tag']}  source {c['source_bytes']:,}B "
              f"-> ingested {c['compression']['output_bytes']:,}B "
              f"at q{c['compression']['chosen_quality']} "
              f"(budget {c['compression']['budget_bytes']:,}B, "
              f"within: {c['compression']['within_budget']})")
        print(f"           composition r={t2['pearson_r_vs_incumbent']}, "
              f"cells moved {t2['share_cells_moved_gt_half_sd'] * 100:.1f}%, "
              f"raw mean abs diff {t2['raw_mean_abs_diff_luma_255']}")
        print(f"           luma delta: full {d['full']:+.2f}, "
              f"title {d['title_band_top_18pc']:+.2f}, "
              f"stage {d['stage_band_middle_64pc']:+.2f}, "
              f"hud {d['hud_strip_bottom_18pc']:+.2f}")
        if "test_1_verdict" in c:
            v = c["test_1_verdict"]
            print(f"           test 1 class: {v['class']} "
                  f"(control enhancement r={v['declared_enhancement_control_r']}), "
                  f"permitted without a new ruling: "
                  f"{v['permitted_under_that_rule_without_a_new_ruling']}")
    print(f"\nrecord     {out_json.relative_to(ROOT)}")
    print(f"candidates {CAND_DIR.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    # R102: same guard as the npm run assets chain. R101 exempted this script on the
    # reasoning that it takes deliberate command-line arguments; R102 checked and that
    # was wrong. Refuses over uncommitted asset work; ALLOW_ASSETS_OVERWRITE=1 to proceed.
    from asset_guard import guard_or_exit
    guard_or_exit("background_candidate_ingest.py, the candidate background ingest")
    raise SystemExit(main())
