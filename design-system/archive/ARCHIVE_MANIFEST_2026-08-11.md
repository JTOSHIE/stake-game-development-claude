# Design-system archive manifest, 2026-08-11 (R050 TASK 1)

Superseded explorations moved here by FABLE MASTER BRIEF R050, convention
(h): nothing deleted, every byte kept, every provenance file kept beside its
artefact. The kit was rebuilt before and after the move and is BYTE
IDENTICAL (77 files, 12,331,199 bytes both sides, recorded in the R050
session report), demonstrating none of this material ever shipped.

| Archived set | What it was | Why it is retired |
|---|---|---|
| `provider_mark/` | The provider-logo derivation programme: the a-master emblem, candidates b to g with per-candidate provenance, the adopted-F pack_g, and `PROVIDER_LOGO_DERIVATION.md` with its 32px legibility measurements | The owner identified `design-system/brand/hero_emblem/master_1024.png` as the studio mark (R050 owner decisions on record). The derivation stands as evidence; its adoption is superseded |
| `delivery/` | The pre-R050 platform-named delivery set (`FutureSpinner-BG/FG/Tile`, `WeRollSpinners-Logo`) built by `frontend/scripts/tile_delivery_build.mjs` | Superseded by the R050 promotion set (assets/portal, created at CHECKPOINT ONE of the same brief), built from the owner's four recorded picks. The builder script remains in the tree but its output paths now live here; it is not to be re-run against the archive |
| `theme_source_concepts/` | Concept folders for unshipped theme explorations (greyhounds, geopolitical, soccer) that sat under `frontend/public/assets/themes/source/` | Never shipped (the build-diet prune excluded them, proven by the unchanged kit above); moved out of `public/` entirely so the TR-047 class (public/ contents invisibly shipping) cannot reach them even if the prune list changes |

The R048 candidate sets under `reports/art/r048/` are NOT archived: they are
the dated evidence of that round's delivery, and the owner's decisions on
record promote none of them (M1 and M2 excepted, promoted as picked).

Live-document references to the three moved sets (22 across ten files) were
repointed to the archive paths in the same commit, so every citation still
resolves to the same bytes.
