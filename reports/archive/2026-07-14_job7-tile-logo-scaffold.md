# Session Report: JOB 7, Storefront tile and logo scaffold

- **Date:** 2026-07-14
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/tile-logo-scaffold-job7` (off `main`).
- **Source:** JOB 7 of `FS_ConsolidatedWorkOrder_2026-07-13_Prompt.md`. Independent of
  Jobs 3-6 per the work order's own stop conditions.

## What changed this pass

**Located the spec.** The only captured Stake Engine page addressing this is
`docs/stake-engine-live/game-tile-requirements.md` (headless-rendered 2026-07-04,
`looks_real: true`). Attempted a fresh live re-fetch per convention (d) first: no
Chrome extension is connected in this background session, and a plain `WebFetch` on
the docs URL returned only the unrendered SPA shell ("Loading...") - this page needs
JS rendering, which is exactly why the original capture used headless Playwright.
Fell back to the existing snapshot, which is fully rendered and not superficially
stale on its face. Grepped every other captured live-docs page and every `*.md` in the
repo for tile/thumbnail/logo/dimension keywords: nothing else exists.

**Real finding: the published spec has no pixel dimensions or text-safe areas at
all.** It specifies, verbatim: background image (environmental, PNG/JPG, high
resolution), foreground image (feature character or key item, transparent PNG, high
resolution), provider logo (transparent PNG, high resolution, "clear and legible at
small sizes"), background+foreground combined under 3MB, and an exact naming
convention (`GameTitle-BG.png`, `GameTitle-FG.png`, `ProviderName-Logo.png`). No width,
height, or safe-zone guidance is published anywhere Stake-side that this repo has
captured. Recorded verbatim rather than inventing numbers and presenting them as
official.

**Real finding: the Provider Logo requirement is already satisfied, no new art
needed.** `brand_mark.svg` is documented in `design-system/DESIGN_SYSTEM.md` as "the
WRS provider logo" and already exports at 512x512 (`ui/brand_mark.png`) and 192x192
(`ui/brand_mark_glyph.png`), both transparent PNG, via the existing AssetForge
manifest. This narrows JOB 7's actual scope: only two new art masters are needed
(tile background, tile foreground hero), not three.

**Partial finding for the foreground hero:** `scene_character_car.svg` (the existing
"identity character" master - racer plus hover car, per `DESIGN_SYSTEM.md`) is a
strong reference/starting point rather than a from-scratch design, though it is
currently composed for in-game HUD placement (1200x656 landscape) and would need an
isolated re-crop/re-composition on transparency for tile use, not a straight reuse.

**Scaffolded output slots.** Added a new `storefront_tile` key to
`scripts/assets/manifest.json` (`tile_background`, `tile_foreground_hero`,
`provider_logo`), each with a `src` (master filename, not yet authored for the first
two), `out` path under a new `storefront/` output folder, provisional `w`/`h`, the
published format string, the exact upload naming convention, and a note stating
whether new art is required. Authored **no artwork** - only slot metadata, per the
brief.

**Confirmed the scaffold is inert.** Read `scripts/assets/build.py`'s `main()`: it
loops only `manifest["symbols"]`, `["exports"]`, `["layered"]`, `["tile_plate"]`,
`["plates_json"]` by explicit key name - a new top-level key is never touched. Ran the
existing build (`build.py`) to prove nothing broke: same 33 outputs as before the
edit, zero errors, zero change to any tracked output file (`git status` on
`frontend/public/assets/` clean after the run - only `manifest.json` itself shows a
diff).

## Not done this pass (explicitly, not silently)

- No artwork authored, per the brief - Fable authors both new art masters (tile
  background, tile foreground hero) at the next check-in from this reported spec. The
  provider logo needs no new authoring at all (see above), only owner/Fable
  confirmation that reusing `brand_mark.svg`'s existing export is acceptable.
- The provisional `w`/`h` values in the scaffold are not a Stake-published
  requirement - they are reasonable defaults chosen in the absence of one, flagged
  inline in the manifest's own `_doc` field and here. Confirm against the actual
  dashboard Tile Editor on the owner's next portal login (`SUBMISSION_DOSSIER.md`
  section 6 already tracks this same "screenshot the submission form" gap).
- The scaffold is not wired into `build.py`'s render loop - it stays inert until the
  masters exist and a future pass adds that wiring, which keeps today's deterministic
  build byte-identical.

## Verification

- Read `docs/stake-engine-live/game-tile-requirements.md` in full before recording
  anything from it.
- Grepped all ten other captured live-docs pages plus every tracked `.md` file for
  tile/thumbnail/logo/dimension keywords - confirmed no second, more detailed source
  exists in this repo.
- Read `scripts/assets/build.py` end to end to confirm the new manifest key is never
  iterated.
- Ran `build.py` and diffed `git status` before/after: identical 33 outputs, zero
  tracked-file changes beyond the manifest edit itself.
- `python3 -c "import json; json.load(...)"` confirms `manifest.json` is still valid
  JSON after the edit.
- Locked files confirmed untouched: `git diff --stat -- frontend/src/lib/services/rgsService.ts frontend/src/lib/stores/gameStore.ts games/future_spinner/ .claude/settings.json` is empty.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** treated "locate the
  spec" literally - read the actual captured page rather than assuming it contained
  pixel numbers, which surfaced the real gap (no dimensions published) instead of
  silently inventing a fake-authoritative number. Cross-checked the existing
  AssetForge manifest and design system docs before scaffolding, which surfaced the
  brand-mark reuse finding rather than treating all three tile assets as equally
  needing fresh art.
- **Alternatives rejected:** inventing "official-looking" pixel dimensions without
  flagging the gap (rejected - would mislead Fable into treating a guess as a
  requirement); wiring the new manifest entries into `build.py`'s render loop now
  (rejected - the source masters don't exist yet, so wiring it in would just crash the
  existing, working deterministic build for everyone until Fable delivers art);
  attempting to regenerate the live docs snapshot without working browser automation
  (rejected - `WebFetch` only returns the unrendered SPA shell for this page; a real
  refresh needs headless Chrome, unavailable in this background session).
- **Files touched:** `scripts/assets/manifest.json` (new inert `storefront_tile` key),
  this report + its dated archive copy. Locked files untouched.
- **Open threads:** Fable authors `tile_background.svg` and `tile_foreground_hero.svg`
  from this reported spec; owner/Fable confirm the provisional pixel dimensions
  against the actual dashboard Tile Editor and confirm the `brand_mark.svg` reuse for
  the provider logo; once masters land, wire `storefront_tile` into `build.py`'s
  render loop as a normal follow-up; re-run the live-docs capture for
  `game-tile-requirements` next time browser automation is available, in case the
  published page has been updated since 2026-07-04. JOB 8 (round-two audio slots
  placeholder note) remains, independent of everything else in this work order.
