# Brand assets, 2026-07-25

Regenerated as part of the pre-review evidence pass, alongside the TR-031 provider-mark
candidates so the two are compared in one place rather than captured twice.

## Contents

- `master_512.png`, `master_96.png`, `master_48.png` - the shipped hero emblem at the three
  sizes that matter, copied from `design-system/brand/hero_emblem/` unmodified.
- `provider_mark_*_48.png` - the three TR-031 candidates at the size the complaint is about.

## The finding this group carries

Review 1 called the provider mark "nearly unreadable" at 48px. Placed beside the
candidates, the reason is visible rather than arguable: the master carries arched
WE ROLL / SPINNERS text around a detailed chrome wheel, and at 48px that text is about two
pixels per stroke. It cannot resolve at any contrast, so sharpening was never the fix.

The candidates drop the text ring and keep the wheel and reels. Both derivations are
markedly more legible than the control. **None of them is ideal**, and that is worth saying
plainly: a purpose-drawn mark, built simple at small size rather than reduced from a
detailed one, would beat all three. The candidates are the best available derivation from
the committed master, not the best possible mark.

Side-by-side comparison: `reports/screens/provider-mark/48px-legibility-comparison.png`.

## Provenance note

The hero emblem master is an owner-supplied, externally generated raster carrying a SynthID
watermark, ingested 2026-07-15 with its generation prompt recorded verbatim in
`design-system/brand/hero_emblem/GENERATION_NOTE.md`. Derivations are deterministic canvas
operations on that file; nothing was hand edited.
