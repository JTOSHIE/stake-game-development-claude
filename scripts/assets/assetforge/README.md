# AssetForge

The arc-two art pipeline. **Generation is NOT stood up**: R083 assessed this machine and
found local SD 3.5 impractical, so the brief's own STOP applied. The assessment, the three
blockers and the costed cloud alternative are in
`docs/art/ASSETFORGE_FEASIBILITY_2026-08-22.md`. Licence captures are under
`docs/licences/stability/2026-08-22/`.

What exists today is the half that does not depend on where the pixels come from.

## `ingest.py`, the candidate QA pass

Green-key knockout, delivery downscale, 64px silhouette, and a manifest assertion that
refuses anything it should not touch. Outputs land in `.scratch/assetforge/ingest/`, which
is gitignored per convention (h.1); only an owner-approved asset is ever copied into the
shipped tree.

```
scripts/assets/.venv/bin/python scripts/assets/assetforge/ingest.py --in <dir-or-file>
```

Exit 0 when everything was accepted, 2 when anything was refused, so it can gate a chain.

**It refuses by manifest class, and each refusal has a different reason.** Only the 30
REPLACE rows of `docs/art/art_manifest_arc2.csv` are ingestable. KEEP is the hero emblem
the whole palette anchors to. DEAD ships but never renders and its rows say delete rather
than redraw. REGEN is not UI art at all: those PNGs are headless screenshots of live CSS
and SVG controls, so a hand-drawn replacement drifts from the control it documents.

**It also refuses aspect drift**, which is the failure a dimension assertion cannot see. A
square candidate resized into 244x204 satisfies any dimension check and still looks wrong,
so the aspect is compared on the SOURCE, before the resize.

## `ingest_selftest.py`, convention (p)

```
scripts/assets/.venv/bin/python scripts/assets/assetforge/ingest_selftest.py
```

Fifteen cases, importing the shipping functions rather than copies of them. It went red
three times on real defects while it was being written, which is the only reason its green
counts for anything:

1. `max_residual_dominance` was measured on the pre-despill array, so a broken despill and
   a working one produced the same number.
2. The delivered file carried a **green halo**: RGBA was downscaled without premultiplying,
   so Lanczos averaged the key colour of fully transparent pixels back into every edge
   pixel. Alpha said "barely there" while RGB said "pure green". Caught by the first
   end-to-end run, NOT by the self-test, which was only checking the knockout's own
   statistics. The delivered-file assertion exists because of this.
3. Despill allowed dominance up to `tol_low` in kept pixels, and the downscale resampled
   that allowance up to 46/255 on the edge. Partially transparent pixels are blends with
   the key by definition, so they are now clamped to zero green dominance while solid
   interior pixels, which never touched the key, keep the gentle ceiling.

Delivered green dominance went from 255/255 to 0/255 across those three fixes.
