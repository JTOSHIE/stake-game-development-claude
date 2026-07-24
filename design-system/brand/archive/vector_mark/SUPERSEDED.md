# SUPERSEDED — vector_mark (v2 and v3)

**Superseded 2026-07-25, OWNER AUDIT ROUND 3, item 1 (logo canonicalisation).**

This directory (`wrs_mark_v2*`, `wrs_mark_v3*`, both SVG masters and their
PNG export ladders, plus their `GENERATION_NOTE*.md` files) is retired. It
was never wired into the shipped frontend (`grep` across `frontend/` and
`scripts/` at retirement time found no reference outside this directory's
own gate scripts) - a flat-vector exploration track running alongside the
photographic hero emblem, not a shipped alternative to it.

**The hero emblem is now the sole WRS mark.** See:
- `design-system/brand/hero_emblem/` — the ratified master (ingested
  2026-07-15, `tools/brand/ingest_hero_emblem.py`), sizes 1024/512/192/96/48.
- `design-system/brand/hero_icon/` — a tight circular crop of the emblem's
  wheel-and-reel core (excludes the wordmark arcs, legible at small sizes),
  sizes 192/96/48/32, derived by `tools/brand/derive_hero_icon.py`.

Kept in place (not deleted) for historical reference only - do not resume
the vector-mark track without a fresh owner ruling.
