# RESKIN BOUNDARY

The definitive engine-versus-skin inventory for Future Spinner: what carries forward to a
new title unchanged, what has to be replaced, how each replaceable thing is made, and which
gates must go green again after it is swapped.

Australian English, metric, no em dashes or en dashes.

**Created 2026-07-27** by the round-three prep session, executing the substance of the
prepared but never-run `track/docs-reskin` brief (`docs/records/tracks/docs-reskin_BRIEF.md`,
JOB C).

---

## 0. What this document is, and what owns what

**`WRS_MASTER_DOCUMENT.md` section 7b owns the ORDER of a next title. This document owns
the CONTENT of one step in that order.** Section 7b is quoted at
`WRS_MASTER_DOCUMENT.md:198`:

> ### 7b. Next-title template (applies to LUMEN, queued after Future Spinner submits)
> Reuse in order: maths package + validate_math + PAR -> wiring integrity audit pattern ->
> statelessness/replay evidence -> AssetForge + AudioForge (new seeds/prompts) ->
> rules/paytable/UI guide conformance -> QA soak + platform conformance suite (all scripts
> are reusable) -> math self-audit -> compliance watch -> dossier from this register's
> 3a-3d -> tile layers -> submit. Company layer (section 1) does not repeat; only per-title
> rows do.

**This document does not restate that order and must not be read as an alternative
sequence.** It expands exactly one arrow in that chain: the fourth,
`AssetForge + AudioForge (new seeds/prompts)`, which is the only link whose inputs are art.

Three deliberate limits, stated up front so silence is not read as coverage:

- **It schedules nothing.** The ranking in Part 4 is a cost estimate, not a plan.
- **It proposes no fixes.** Part 4 names couplings; naming one accurately is the
  deliverable. A gap quietly fixed while writing this document would be scope nobody
  granted.
- **It does not restate the maths pipeline.** That is section 7b's first link and it is
  documented where it lives.

**Two facts drive everything below**, and both are measured rather than assumed:

1. `frontend/public/` holds **1,026 files**; the shipped theme tree
   `frontend/public/assets/themes/future-spinner/` holds **84** of them.
2. `scripts/assets/manifest.json` covers **5 exports, 3 layered pairs, 1 plate, 4 particles
   and 2 brand exports**. It is therefore not the manifest of the skin. It is the manifest
   of the part of the skin that has masters. Part 4 GAP 3 is the consequence.

---

## 1. Engine versus skin, directory by directory

**ENGINE** means code whose behaviour would be identical under a new title: mode logic,
wallet layer, interpreters, stores, gates, conformance suites, maths pipeline.
**SKIN** means anything whose replacement is the point of a reskin: symbol art and masters,
palette tokens, vocabulary and locale strings, audio rows, splash and celebration assets,
layout theme constants, brand marks, tile layers.

| Directory | Class | Notes |
|---|---|---|
| `games/future_spinner/` | **ENGINE**, and LOCKED | The maths package. A new title gets its OWN package; this one is not edited. Read-only throughout this document. |
| `frontend/src/lib/services/` | **ENGINE** | `rgsService.ts` (locked), `replayService.ts`, `roundInterpreter.ts`, `soundService.ts`, `telemetry.ts`. Two title couplings live here and are named in GAP 4 and GAP 7. |
| `frontend/src/lib/stores/` | **ENGINE** | 31 files, 8 of them colocated tests. `gameStore.ts` is locked. `themeStore.ts` is the one with skin-shaped machinery, most of it dead: GAP 2. |
| `frontend/src/lib/utils/` | **ENGINE** | `currency.ts` is the single canonical money formatter and carries no title identity. |
| `frontend/src/lib/actions/`, `frontend/src/lib/mock/` | **ENGINE** | Mock rounds are Future Spinner shaped but are dev-only fixtures, not shipped behaviour. |
| `frontend/src/lib/components/` | **MIXED**, 23 files | The structure is engine, the content is skin. `GameGrid.svelte` is the sharpest case: its layout maths is generic and its ten-entry symbol map is not (GAP 7). |
| `frontend/src/lib/config/` | **SKIN**, wearing a config's clothes | `fsModes.ts`, `themes.ts`. See GAP 8: the file that presents as a config is partly this title's marketing copy. |
| `frontend/src/lib/i18n/` | **SKIN** for the values, **ENGINE** for the mechanism | The `sv()` vocabulary layer and the prohibited-term table carry forward; 162 lines naming Overdrive, Nitro, OVERBOOST or Cruise do not (GAP 9). |
| `frontend/src/App.svelte`, `app.css`, `main.ts` | **MIXED** | Nine hardcoded theme-identity branches plus the game id: GAP 5. |
| `frontend/public/assets/themes/future-spinner/` | **SKIN**, wholly | The 84 files a reskin replaces. |
| `frontend/public/assets/themes/{beautiful-game,oil-and-fire,trap-lane,source}/` | **NEITHER**, 153 MB | Alternate-theme and concept art, pruned from `dist` at build (`frontend/vite.config.ts:22-33`). Carried, not shipped. |
| `frontend/public/assets/{symbols,ui,frames,videos}/` | **SKIN**, legacy root | Pre-AssetForge. Mostly superseded, but three shipped files still trace here by hash: GAP 3. |
| `design-system/masters/` | **SKIN**, the source of truth for what has one | 17 SVG masters. |
| `design-system/brand/{hero_emblem,hero_icon,provider_mark}/` | **COMPANY skin** | Carries forward to LUMEN **unchanged**. This is section 7b's own split: "Company layer (section 1) does not repeat". |
| `design-system/brand/{tile,delivery}/` | **TITLE skin** | Per-title storefront artefacts. Rebuilt for a new title. |
| `scripts/assets/`, `tools/audio_forge/`, `tools/brand/` | **ENGINE**, the generators | Reusable. Their INPUTS are skin; their code is not. |
| `frontend/scripts/` (91 `.mjs`) | **ENGINE**, the gates and proofs | Reusable, with the title-specific exceptions Part 3 names explicitly. |
| `scripts/qa/` | **ENGINE** | `locked_paths_gate.mjs` is repository governance, entirely title-agnostic. |
| `tools/`, `utils/`, `src/` (repository root) | **ENGINE** | The maths SDK and its verifiers. |

---

## 2. The skin register

**This section is the expansion of section 7b's fourth arrow**,
`AssetForge + AudioForge (new seeds/prompts)`. Each family answers four questions:
**(a)** where it lives, **(b)** format and dimensions, **(c)** the generation pipeline and
its seed convention, and **(d)** which gates must re-run after it is swapped. The fourth is
the one that makes this document useful rather than decorative.

All dimensions below were measured by opening the files, not read off a document. Where a
document and the file disagree, that is recorded as GAP 12 rather than reconciled silently.

### 2.0 The seed correction, which section 7b's shorthand needs

Section 7b says "new seeds/prompts". **Only one asset family in this repository has a seed.**
Stated here because a LUMEN session reading 7b alone would go hunting for seeds that were
never recorded:

| Family | Reproducibility anchor |
|---|---|
| **Audio (AudioForge)** | A REAL SEED. `BASE_SEED = 20260707` at `tools/audio_forge/generate.py:36`, `SEED_OFFSETS = [0, 1, 2, 3]` at `:37`. Four candidates per row at base+0 to base+3. |
| **Symbols, particles, flames, brand exports (AssetForge)** | NO seed, deterministic by construction. `scripts/assets/build.py:7-9` states "same inputs produce byte-identical outputs"; `scripts/assets/symbol_fx.py:16-17` states "fixed FRAMES tables, no RNG/time". The contract is "same SVG in, same PNG out". |
| **Backgrounds** | NO seed. The anchor is a SHA-256 of source and shipped file in the generation note, plus a seeded self-test for the ENHANCEMENT-versus-NEW-DESIGN classifier. |
| **Brand emblem** | NO seed, and no model version and no generation date either. `design-system/brand/hero_emblem/GENERATION_NOTE.md` records that the date was not independently captured. **This is the weakest provenance link in the chain and it is the one a reskin cannot re-roll.** |

### 2.1 Reel symbols

**(a)** `frontend/public/assets/themes/future-spinner/symbols/{h1,h2,m1,m2,m3,l1,l2,l3,wild,scatter}.png`, plus the `_1x` half-scale set.

**(b)** PNG RGBA, **240x240** base and **120x120** for `_1x`. Sources are **1024x1024 SVG
masters** in `design-system/masters/` (17 files). Layered derivatives `h1_base.png` and
`h1_spin.png`, both 240x240 RGBA. FX sheets: `m3_flame_sheet.png` 1200x200 (six 200x200
frames), `l2_fuse_sheet.png` 800x200 (four 200x200 frames), with 200x200 statics.
`tile_plate.png` 244x204 RGBA.

**(c)** `scripts/assets/build.py` driven by `scripts/assets/manifest.json` (symbol list
`:5-16`, export sizes `:17-20`, layered specs `:28-54`, procedural plate `:55-59`). Invoked
by `npm run assets` (`frontend/package.json:11`), which chains `build.py`, then
`flame_jets.py`, then `symbol_fx.py`. **No seed**, per 2.0.

**(d)** `hud_reel_size_check.mjs` (the feature's DOM board against the canonical
`CELL_W=120 / CELL_H=100 / GAP=4`; new art of a different aspect ratio breaks this first),
`symbol_life_proof.mjs`, `paytable_card_fill_gate.mjs` (new intrinsic sizes change card
heights and reintroduce the exact shipped defect), `layout_fit_gate.mjs`,
`reel_v3_proof.mjs` (avg fps >= 55, zero frames over 100 ms, across 20 spins; catches
heavier PNGs costing frames), `build_diet_verify.mjs`, `dist_hygiene_gate.mjs`,
`interface_guide_icon_proof.mjs`.

### 2.2 Backgrounds

**(a)** `frontend/public/assets/themes/future-spinner/backgrounds/{bg_base.jpg, bg_overdrive.jpg, bg-1.jpg, bg-1.mp4}`.

**(b)** `bg_base.jpg` JPEG 1920x1080 RGB, 266.8 KB. `bg_overdrive.jpg` JPEG 1920x1080 RGB,
262.9 KB. `bg-1.mp4` is retired from the served build (`frontend/vite.config.ts:13-15`).

**bg-1.jpg IS GONE, 2026-08-09, and the format lie recorded here was the least of it.** This
paragraph used to note that the file named .jpg was really a PNG, 826 x 461. True, and it was
the wrong thing to notice. Nobody had opened the image. It was a machine-generated cityscape
carrying legible neon signage for rival gambling brands, JACKPOT CITY among them, shipping
886KB into an artefact uploaded to Stake. It could not paint in production, since the branch
consuming it runs only for non-default themes, but the published criterion is worded about
what a submission CONTAINS. Deleted; every theme's background is now named `bg_base.jpg`.

**(c)** Two paths, one current. Historic: `scripts/assets/backgrounds.py` extracted two
frames from `assets/videos/bg_animated_loop.mp4` at t=22s and t=7s with two absolute grades;
needs `ffmpeg` on PATH. **Current**: `bg_base.jpg` is owner-commissioned external art,
ingested and measured by `scripts/assets/background_candidate_ingest.py`, provenance at
`design-system/brand/GENERATION_NOTE_background.md`, classified NEW DESIGN at Pearson
r 0.3850 against the incumbent. `bg_overdrive.jpg` is derived from whatever `bg_base.jpg`
currently is, by `scripts/assets/background_overdrive_derive.py`. **Neither background
script is chained into `npm run assets`** (GAP 11).

**(d)** `contrast_gate.mjs` is THE gate for this swap: it measures composited pixels rather
than CSS, because the portrait FEATURES plate starts at 10 per cent opacity so the contrast
a player experiences is against whatever the art happens to be there, and it reports against
the WORST pixel. Then `background_adopted_proof.mjs`, `scrim_coverage_gate.mjs`,
`build_diet_verify.mjs` (the current file was recompressed to q80 specifically to fit the
incumbent's byte budget), and `scripts/assets/background_candidate_ingest_selftest.py`.

### 2.3 UI chrome, buttons and panels

**(a)** `frontend/public/assets/themes/future-spinner/ui/`.

**(b)** All PNG RGBA. `spin_button.png` 200x200; `btn_autoplay/menu/max/bet_plus/bet_minus.png`
200x200; `btn_turbo{,_2,_3}.png` 200x200; `feature_button.png` 224x224;
`gauge_{face,base,needle}.png` 464x464; `panel_balance.png` 340x90; `panel_win.png` 360x100;
`logo.png` 600x120; `subtitle.png` 300x30; `jet_nozzle.png` 160x160; `jet_flame_sheet.png`
1200x120 (five 240x120 frames); `scene_car.png` 2840x1000; `scene_character.png` 680x1344;
`scene_character_car.png` 1200x656; `particles/{shock_ring 128x128, spark 32x32, coin 40x40, smoke_puff 56x56}.png`.

**(c)** Four pipelines and two orphan groups.

1. `feature_button`, `gauge_face`, `scene_character_car`, `brand_mark*`: `build.py` from
   `manifest.json:21-27` and `:28-54`.
2. `particles/*`: drawn procedurally with PIL inside `build.py:236-256` (`PARTICLE_DRAWERS`),
   specified at `manifest.json:77-110`. No SVG master, deterministic geometry, no seed.
3. `jet_*`: `scripts/assets/flame_jets.py` from `design-system/masters/M3_master_v3.svg`.
4. `spin_button`, `btn_bet_plus`, `btn_bet_minus`, `btn_autoplay`, `btn_menu`,
   `btn_turbo{,_2,_3}`, `btn_max`: **NOT in the manifest.** They are Playwright
   screenshot-crops of the live rendered HudOverlay chrome, produced by
   `frontend/scripts/regen_interface_guide_icons.mjs`. Its header explains why: the chrome
   uses `conic-gradient`, which has no SVG equivalent, and cairosvg does not evaluate CSS
   filters, so an SVG master would be a re-interpretation rather than a capture.
5. **ORPHANS, no generator anywhere**: `logo.png`, `subtitle.png`, `panel_balance.png`,
   `panel_win.png`. See GAP 3.
6. **SEMI-ORPHANS**: `scene_car.png` and `scene_character.png` are byte-identical to the
   files in `design-system/incoming/`, so they were placed rather than derived in the
   current tree.

**(d)** `hud_banner_spec_check.mjs` (re-measures every desktop control against the exact
locked coordinates in `docs/HUD_SPEC.md`; any art that changes a control's box fails on
sight), `turbo_intensity_gate.mjs` (the three speeds must be provably distinguishable, floor
1.30:1 against a 1.25:1 bar), **`regen_interface_guide_icons.mjs` must itself be RE-RUN
rather than merely checked**, `interface_guide_icon_proof.mjs`, `layout_fit_gate.mjs`,
`hud_naming_uniformity_check.mjs`, `hud_reskin_proof.mjs`, `paytable_reskin_proof.mjs`,
`scene_proof.mjs`, `flame_colourway_proof.mjs`, `contrast_gate.mjs`, `dead_wiring_scan.mjs`.

### 2.4 Splash, loading and brand marks

**(a)** `frontend/public/assets/themes/future-spinner/ui/{hero_emblem_512,hero_icon_96,brand_mark{,_base,_spin,_glyph}}.png`;
masters under `design-system/brand/hero_emblem/` and `hero_icon/`; `frontend/public/favicon-32.png`.

**(b)** `hero_emblem_512.png` PNG 512x512 **mode P (256-colour palette, no alpha)**;
`hero_icon_96.png` 96x96 RGBA. The two bespoke marks recorded beside it here,
brand_mark.png at 512x512 RGBA and brand_mark_glyph.png at 192x192, were DELETED on
2026-08-09: the hero icon replaced them, this file's own note at 2.4 already said so,
and they were still shipping 314KB into the bundle for a component that no longer renders
RGBA. Masters `master_1024.png` 1024x1024 **RGB**, plus 512/192/96/48 derivatives.
`favicon-32.png` 32x32 RGBA, 3,268 bytes.

**(c)** Origin Google Gemini from an owner-supplied prompt quoted verbatim in
`design-system/brand/hero_emblem/GENERATION_NOTE.md`; that note also records an invisible
SynthID watermark and a visible generator glyph patched out during ingest. Ingest
`tools/brand/ingest_hero_emblem.py`; icon derivation `tools/brand/derive_hero_icon.py`;
bundle copy `build.py:283-320` (`build_brand_export`). Retired vector track under
`tools/brand/build_vector_mark*.py` with outputs archived. **No seed, no model version, no
recorded date**: see 2.0.

**(d)** `splash_calm_gate.mjs` is THE gate here. It samples boot-logo geometry every 250 ms
across ten seconds at three presets and asserts ZERO variance: no rotation, no translation,
no animation writing `transform`. It exists because a canonicalisation commit left a spin
animation on a non-radially-symmetric mark and the bounding box swung 77px at Desktop and
98px at Popout S. **A new mark with different symmetry reintroduces exactly this.** Then
`splash_proof.mjs`, `contrast_gate.mjs`, `build_diet_verify.mjs` (the 512 palette export
exists to be about 124 KB rather than the 417 KB master), `tools/brand/gate_vector_mark.py`,
`provider_mark_compare.mjs`.

### 2.5 Audio

**(a)** `frontend/public/assets/themes/future-spinner/sounds/` (16 files), plus a superseded
legacy set formerly at frontend/public/assets/sounds/, DELETED 2026-08-09. Audio
resolves under the THEME base (`frontend/src/lib/stores/themeStore.ts` builds every
path as `${b}/sounds/...`), so that root tree was 1.9MB nothing could reach.

**(b)** MP3 for all twelve shipped rows, plus WebM/Opus encodes for the three loop beds only
(`bgm_loop`, `bgm_tension`, `anticipation_build`). Largest `bgm_loop.mp3` 932.9 KB, smallest
`ui_click.mp3` 5.6 KB. The codec choice is made at runtime by
`frontend/src/lib/services/soundService.ts:34-41`.

**(c) The only family with a real seed convention, and it is recorded precisely.** Generator
`tools/audio_forge/generate.py`, model `stabilityai/stable-audio-3-medium`, **`BASE_SEED = 20260707`
at `:36`** with `SEED_OFFSETS = [0, 1, 2, 3]` at `:37`; candidates written as
`<name>/<name>_s<seed>.wav`, four per row. `--fresh-seeds` re-rolls. Prompts in the
`MANIFEST` table from `:43`. Mastering `master.py`, promotion `promote.py`. Provenance in the
sounds `README.md`; licence Stability AI Community License Agreement, archived at
`tools/audio_forge/LICENSE.md`. **That provenance README is pruned from `dist`**
(`frontend/vite.config.ts`), because it names the model, the seeds, the prompts and the
licence paths, and a player can fetch anything in the bundle.

**(d)** `audio_verify.mjs` (every `/sounds/` request returns 200, and the sounds actually
FIRE, because `HTMLMediaElement.play()` is intercepted rather than trusting that a file was
requested; plus the bed swap on a bonus buy, and zero console errors),
`build_diet_verify.mjs`, `dist_hygiene_gate.mjs` (**its first run found the shipped sounds
README, with seventeen em dashes in it, served from the portal in the owner's own 104-file
listing**), `dash_gate.mjs` both halves.

### 2.6 Vocabulary, locale strings and mode labels

**(a)** `frontend/src/lib/i18n/translations.ts` (16 locales), `frontend/src/lib/config/fsModes.ts`,
`frontend/src/lib/components/PaytableModal.svelte`.

**(b)** TypeScript literals. Mode records carry `label`, `blurb`, optional `socialLabel` and
`socialBlurb`, `volatility`, `cost` and `serverMode`.

**(c)** **Hand-authored. There is no generator.** The one machine-derived artefact is the
prohibited-term table in `vocabulary.ts`, transcribed verbatim from a dated mirror and pinned
by content hash against `docs/stake-engine-live/jurisdiction-requirements.md`;
`SUBSTITUTIONS` is derived from that table rather than retyped.

**(d)** `locale_completeness_check.mjs`, `vocabulary.test.ts`, `a11y_social_terms_check.mjs`
(**screen-reader text is player-facing text**; this exists because 14 control labels shipped
carrying the restricted phrase "bet", so a blind player in a social jurisdiction heard
vocabulary a sighted player was protected from), `social_string_conformance.mjs`,
`social_dom_conformance.mjs`, `socialLocale.test.ts`, `dash_gate.mjs`,
`machine_tell_gate.mjs`, `fsModes.drift.test.ts`, `paytable_card_fill_gate.mjs` (longer
translated strings change card heights), `rules_conformance_proof.mjs`,
`rg_wording_proof.mjs`.

### 2.7 Theme palettes and layout theme constants

**(a)** `frontend/src/lib/config/themes.ts` (six palettes of four colours), and then seven
component scoped `<style>` blocks that redeclare the working token set.

**(b)** CSS custom properties inside Svelte scoped styles. **Only `--sig-cyan` and
`--sig-magenta` read from the theme**; `--sig-pink`, `--sig-gold`, `--sig-orange` and
`--sig-green` are literal hex, repeated per component. `App.svelte` is the only place theme
palette values reach CSS at all.

**(c)** **None. Hand-authored per component**, and `docs/design/CHROME_PRIMITIVES.md`
ratifies the duplication as correct for Svelte scoping. That is defensible, and it means the
token VALUES have seven homes rather than one. See GAP 1.

**(d)** `contrast_gate.mjs`, `turbo_intensity_gate.mjs`, `scrim_coverage_gate.mjs`,
`cohesion_capture.mjs`, `paytable_card_fill_gate.mjs`.

### 2.8 Storefront tile and provider mark

**(a)** `design-system/brand/tile/` and `design-system/archive/delivery/`.

**(b)** `delivery/FutureSpinner-BG.jpg` JPEG 2048x1152 RGB; `delivery/FutureSpinner-FG.png`
PNG 4159x1875 RGBA; `delivery/FutureSpinner-Tile.png` PNG **408x546** RGBA;
`delivery/WeRollSpinners-Logo.png` PNG 1024x1024 RGBA; `tile/tile_composed_master.png` PNG
408x546 RGBA. Provider-mark pack `pack_g/` carries 32 to 1254 px in transparent PNG, WebP,
black-bg and white-bg JPEG, a favicon `.ico` and two PDFs.

**408x546 is the platform's observed published geometry**, at 93.1 per cent of an 87-tile
decoded sample (`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`). The platform
publishes no number; that survey read it out of the public FAIR catalogue's own assets.

**(c)** `tools/brand/build_tile_background.py` and `build_tile_hero.py` for the landscape
masters; `frontend/scripts/tile_master_ingest.mjs` for the owner's composed PORTRAIT tile,
ingested flat without retouching or resizing; `tile_layer_derivation.mjs`, which **attempts**
the background and foreground separation and **measures why it fails** rather than asserting
it would (title type baked in as pixels; no background behind the character);
`tile_delivery_build.mjs`, which COPIES rather than renames so the generation notes that
describe the masters by their real names are not orphaned;
`published_tile_geometry_survey.mjs`, which reads dimensions from PNG headers via 64-byte
Range requests. Provider-mark candidates a to d are deterministic canvas operations or
purpose-drawn; e, f and g are owner-supplied packs. **No seed.** The `storefront_tile` block
in `manifest.json` is explicitly INERT and its own `_doc` says so.

**(d)** `tile_layer_derivation.mjs`, `published_tile_geometry_survey.mjs`,
`provider_mark_compare.mjs`, `trademark_variant_scan_au.mjs` (**name clearance, which a new
title needs from scratch**), `tile_delivery_build.mjs` (the combined 3 MB ceiling).

### 2.9 Frames and the reel window

**(a)** `frontend/public/assets/themes/future-spinner/frames/{frame-1,frame-2}.png`.

**(b)** Both PNG 800x640 RGBA. **`frame-2` is the shipped one**
(`frontend/src/lib/stores/themeStore.ts:57`), chosen for a larger transparent centre window
that avoids clipping the canvas.

**(c) None.** `frame-2.png` is byte-identical to the legacy
`frontend/public/assets/frames/frame_clean_minimal.png`, SHA-256 `cd9e924d44888d59...`,
verified. There is no master in `design-system/masters/` and no generator. See GAP 3.

**(d)** `layout_fit_gate.mjs` (the frame must FIT and every control must be reachable at
seven presets, which is exactly what the frame's transparent window governs),
`hud_reel_size_check.mjs`, `smallscreen_composition_gate.mjs`,
`portrait_layout_conformance.mjs`, `popout_conformance.mjs` (a real Playwright click at the
platform's 400x225 mini-player size).

---

## 3. The gate map, and what "all scripts are reusable" actually means

Section 7b asserts, of the QA soak and platform conformance suite, that "all scripts are
reusable". **That is broadly true and this section is the evidence for it at file level. It
is not wholly true, and the exceptions are named here rather than discovered later.**

The CI-blocking set is `.github/workflows/checks.yml`, split into two jobs on purpose: a
browser-free "static gates" job and a "browser gates" job that installs chromium. The split
exists because `layout_fit_gate.mjs` and `contrast_gate.mjs` were once in the browser-free
job and crashed at `chromium.launch()` on every run from 117 to 120 on main.

**Genuinely title-agnostic** (reusable as-is): `scripts/qa/locked_paths_gate.mjs`,
`dead_wiring_scan.mjs`, `scan_wallet_floats.mjs`, `currency_scale_drift.test.mjs`,
`dash_gate.mjs`, `machine_tell_gate.mjs`, `dist_hygiene_gate.mjs`, `scrim_coverage_gate.mjs`,
`layout_fit_gate.mjs`, `contrast_gate.mjs`, `splash_calm_gate.mjs`, `build_diet_verify.mjs`,
`audio_verify.mjs`, and the wallet, replay, recovery, modal-guard and bet-ladder tests.

**Title-specific in their ASSERTIONS, and therefore not reusable without editing:**

| Gate | The title-specific part |
|---|---|
| `hud_banner_spec_check.mjs` | Asserts against `docs/HUD_SPEC.md`'s exact stage coordinates (TURBO at left 227 top 563 82x82, and so on). A different layout means a different spec and a different gate. |
| `fsModes.drift.test.ts` | Asserts against `games/future_spinner/library/publish_files/index.json`. A new title has a new package. |
| `paytable_card_fill_gate.mjs` | Derives its locale list from the shipped `Locale` union, which carries forward, but its card selectors are this paytable's. |
| `turbo_intensity_gate.mjs` | Measures `btn_turbo{,_2,_3}.png` specifically. |
| `interface_guide_icon_proof.mjs`, `regen_interface_guide_icons.mjs` | Capture the live chrome by selector. |
| `hud_reel_size_check.mjs` | Pinned to `CELL_W=120 / CELL_H=100 / GAP=4`. |
| `trademark_variant_scan_au.mjs` | Scans for this title's name variants. |

**Deliberately not in CI** (stated scope in the workflow header): `qa_soak.mjs`,
`portrait_layout_conformance.mjs`, `currency_conformance.mjs`, `popout_conformance.mjs` and
every `*_proof.mjs`. They need a real dev server and take tens of minutes; their results are
committed as JSON under `reports/qa/`.

**A reskin's minimum re-run set**: the six browser gates; the static skin gates (locale
completeness, a11y social terms, dash gate both halves, machine-tell gate both halves, dist
hygiene); plus `audio_verify.mjs`, `build_diet_verify.mjs`, `hud_banner_spec_check.mjs`,
`hud_reel_size_check.mjs` and `regen_interface_guide_icons.mjs` locally. **Every gate
carrying `--self-test` runs in self-test mode FIRST**, per convention (p): a gate that cannot
fail on a seeded violation has a meaningless PASS.

---

## 4. Honest gaps, ranked hardest first

These are **named, not solved**, and explicitly for post-submission work. Each is a real
coupling a clean reskin would have to pay for. Nothing here was fixed while writing this
document; a gap quietly closed would be scope nobody granted.

### GAP 1. Theme colour tokens live in seven component style blocks, not in a token layer. HARDEST.

Only `--sig-cyan` and `--sig-magenta` read from the theme. `--sig-pink`, `--sig-gold`,
`--sig-orange` and `--sig-green` are literal hex redeclared in seven files: `HudOverlay`,
`PaytableModal`, `FeatureMenu`, `WinBanner`, `WinBreakdown`, `MaxWinCelebration`,
`WinCelebration`. Beneath the tokens sit raw literals that route through no token at all:
**152 hex colours in `HudOverlay.svelte`, 68 in `FeatureMenu.svelte`, 62 in
`PaytableModal.svelte`, 28 in `WinBanner.svelte`, 24 in `App.svelte`**. `themes.ts` offers
four colours per theme; the shipped UI uses hundreds.

Compounded by `docs/design/CHROME_PRIMITIVES.md`, which ratifies the duplication as correct.
A reskin therefore has to change a documented convention as well as the code.

**Cost driver:** a new palette is a manual sweep of roughly 400 literals across 19 files,
with no single point of control and no test that would notice a missed one.

### GAP 2. Dead theme machinery gives a false impression of reskin-readiness. VERY HARD, because it is invisible.

The repository looks multi-theme. In the shipped build it is not.

- `.scheme-trap`, `.scheme-oil` and `.scheme-pitch` are declared in `HudOverlay.svelte` and
  `PaytableModal.svelte` and **no component ever adds these classes**.
- **Thirteen of the fifteen derived `themeAssets` fields have zero consumers**:
  `spinButton`, `btnMinus`, `btnPlus`, `btnAutoplay`, `btnMenu`, `panelBalance`, `panelWin`,
  `symbols`, `backgroundVideo`, `isVideo` are declared in `themeStore.ts` and read nowhere.
  Only `assetBase`, `background`, `logo` and `frame` are read.
- `themeAssets.background` is read only in an `{:else}` branch the shipped theme never takes.
- 153 MB of alternate-theme art sits in `public/` and is pruned from `dist` at build.

**Cost driver:** a planner reading `themeStore.ts` would reasonably conclude that swapping
`assetBase` swaps the game. It does not. The real coupling is elsewhere and has to be
discovered file by file.

### GAP 3. Five shipped skin assets have no generator and no master. HARD, and irreversible without re-authoring.

Traced by hash rather than assumed. Two of these were re-verified independently while
writing this document.

| Shipped file | Traced to | SHA-256 prefix |
|---|---|---|
| `themes/future-spinner/ui/logo.png` (600x120) | `assets/ui/logo_future_spinner.png` (legacy root) | `ec6310444b427de1` (verified) |
| `themes/future-spinner/ui/subtitle.png` (300x30) | `assets/ui/logo_we_roll_spinners.png` (legacy root) | `1a684d0879547b45` |
| `themes/future-spinner/frames/frame-2.png` (800x640) | `assets/frames/frame_clean_minimal.png` (legacy root) | `cd9e924d44888d59` (verified) |
| `themes/future-spinner/ui/scene_car.png` (2840x1000) | `design-system/incoming/scene_car_enhanced_2840x1000_RGBA.png` | `627c6920c26e5be2` |
| `themes/future-spinner/ui/scene_character.png` (680x1344) | `design-system/incoming/scene_character_enhanced_680x1344_RGBA.png` | `1acbd781ce1c7b79` |

`panel_balance.png` (340x90) and `panel_win.png` (360x100) have **no traceable origin at
all**. `design-system/masters/` holds 17 SVGs and none of them is a logo, a subtitle, a panel
or a frame.

**Cost driver:** a new title cannot regenerate a logo, a subtitle, a frame, two panels or the
scene sprites, because nothing in the repository knows how they were made.

### GAP 4. The shipped background bypasses the theme layer entirely. HARD.

`App.svelte` writes the literal paths
`assets/themes/future-spinner/backgrounds/bg_base.jpg` and `bg_overdrive.jpg` directly into
the markup, guarded by `{#if $activeTheme.id === 'future-spinner'}`. `WinPod.svelte` does the
same for `assets/ui/win_pod_v3_{active,idle}.png`, pointing at the **legacy root** rather
than any theme. `soundService.ts` hardcodes `assets/themes/future-spinner/sounds` as the
audio fallback root, so a themed sound that fails to load falls back to a Future Spinner
sound regardless of the active theme.

**Cost driver:** three separate code sites, each a different shape of bypass, none
discoverable from `themeStore.ts`.

### GAP 5. Nine hardcoded theme-identity branches in App.svelte, plus the game id. HARD.

- `App.svelte`: `const gameId = 'future_spinner'`, sent to the RGS.
- `App.svelte`: the console build banner literal.
- **Nine theme-identity branches** deciding whether the hero splash, the background, the warm
  mount, the scene group and the flame jets render at all.
- `themeStore.ts`: `isVideo: $t.id === 'future-spinner'`.
- `themes.ts`: `DEFAULT_THEME_ID = 'future-spinner'`, forced unconditionally in production.
- `frontend/package.json`: `"name": "future-spinner-frontend"`.
- localStorage keys `wrs_theme` and `fs_muted`.

**Note, 2026-07-27:** `frontend/index.html`'s `<title>` was a tenth member of this list until
the machine-tell sweep replaced the scaffold package name with the real title
(`docs/QUALITY_CHARTER.md` Q-01). The `package.json` name remains.

**Cost driver:** the identity branches are behaviour, not styling. Each decides whether a
whole subsystem renders.

### GAP 6. Hardcoded stage pixel geometry. MEDIUM-HARD, and intentionally so.

`App.svelte` fixes `STAGE_W = 1280` and `STAGE_H = 720`. `GameGrid.svelte` fixes `REELS 5`,
`ROWS 4`, `CELL_W 120`, `CELL_H 100`, `GAP 4`. `HudOverlay.svelte` carries **326 literal `px`
declarations**, the control positions being absolute stage coordinates. Sprite boxes in
`SceneGroup.svelte` are tied to the exact 2840x1000 and 680x1344 sprites shipped.

This is documented and enforced rather than accidental: `design-system/LAYOUT_SPEC.md`
specifies every coordinate, and `docs/HUD_SPEC.md` declares the geometry LOCKED, requires the
file to be updated in the same commit as any change, and is kept green by
`hud_banner_spec_check.mjs`.

**Cost driver:** a new title gets a rigid, well-tested layout for free, **provided its art
fits a 1280x720 stage with a 5x4 grid of 120x100 cells**. Any other grid shape is a rewrite
of `HudOverlay.svelte`, `LAYOUT_SPEC.md`, `HUD_SPEC.md` and `hud_banner_spec_check.mjs`
together.

### GAP 7. Symbol names and mode names are referenced from logic, not from config. MEDIUM.

`roundInterpreter.ts` carries `const SCATTER_NAME = 'S'` and a `cell.name === 'W'` test.
`GameGrid.svelte` carries the ten-entry symbol-id to filename map, a per-symbol idle
animation class for each of the ten IDs, `FX_CLASS`/`FX_SHEET` naming `M3` and `L2`
specifically, and a `plateTint()` fallback of literal `'#00ffff'`.
`FreeSpinsPresentation.svelte` carries a **second, independent** `SYM_FILE` map duplicating
part of GameGrid's. `PaytableModal.svelte` restates the ten symbols and payouts by hand from
`games/future_spinner/game_config.py`. The five mode names are restated as union types in
`betMode.ts`, `fsModes.ts`, and narrowed to two in one `rgsService.ts` payload shape. The
colour-to-symbol table lives in the generator (`manifest.json`), emitted to `plates.json` and
fetched at runtime.

**Only ONE of these couplings is guarded by a drift test**: `fsModes.drift.test.ts` checks
costs against `index.json`. The hand-restated paytable numbers and the symbol maps have no
equivalent.

**Cost driver:** LUMEN's maths package already uses different mode names (`surface`,
`deepdive`, `bloom`, `abyssalbloom`). Every union type, every map and every hand-restated
payout has to be found and changed, and **only the cost table would fail loudly if missed**.

### GAP 8. `fsModes.ts` is the declared single source of truth and it is title-shaped. MEDIUM.

The file states that FeatureMenu and PaytableModal both render every card and row from one
array, "so adding, removing or renaming a mode is a one-line edit here". True for the modes.
It does not cover, in the same file: the RTP and cap labels (`'96.35%'`, `'5,000×'`), the HUD
field labels (`HUD_LABEL_FREE_SPINS = 'OVERDRIVE FREE SPINS'`), the five mode blurbs and the
four social overrides. The file is also named for the title.

**Cost driver:** low mechanical difficulty, but it is the file that will be edited by
someone who believes it is a config and finds it is partly this title's marketing copy.

### GAP 9. Locale strings carry the feature's proper nouns. MEDIUM.

**162 lines** of `translations.ts` mention `Overdrive`, `Nitro`, `OVERBOOST` or `Cruise`,
including translated and transliterated forms in the Arabic and German blocks.
`PaytableModal.svelte` carries the two legal strings naming `Future Spinner™` and
`We Roll Spinners™`.

**Cost driver:** a new feature will not be called Overdrive, so 16 locales of feature copy
have to be **re-translated, not merely re-keyed**. `locale_completeness_check.mjs` catches a
MISSING key; it cannot catch a key whose value still says "Overdrive".

### GAP 10. Asset paths hardcoded in components rather than resolved from a manifest. MEDIUM-LOW.

Beyond GAP 4's three bypasses, twelve components build asset paths by string concatenation
off `assetBase` rather than reading a named entry: `WinBanner`, `FreeSpinsPresentation`,
`SceneGroup`, `BonusInstrumentColumn`, `HeroSplash`, `LoadingScreen`, `BuyBonus`,
`FlameJets`, `GameGrid`, `PaytableModal`, `App.svelte`. `manifest.json` knows every one of
those output paths; nothing reads the manifest at runtime. The only runtime manifest read in
the whole app is `plates.json`.

**Cost driver:** a renamed output produces a 404 at runtime, not a build failure.
`build_diet_verify.mjs` would catch it, but only if run, and it is not in CI.

### GAP 11. `npm run assets` regenerates only part of the skin. LOW, but a trap.

`frontend/package.json` chains exactly three scripts: `build.py`, `flame_jets.py`,
`symbol_fx.py`. **Not chained, and therefore silently stale after a master change**:
`backgrounds.py`, `background_overdrive_derive.py`, `background_candidate_ingest.py`,
`compose_side_by_side.py`, all of `tools/brand/`, all of `tools/audio_forge/`, and
`regen_interface_guide_icons.mjs`.

That last is the sharpest: the interface-guide icons ARE screenshots of the live HUD chrome,
so a reskin that does not re-run it **leaves the in-game user manual showing the previous
title's buttons**. Nothing fails; the paytable is simply wrong. The in-game guide is a review
requirement, so this is a submission risk rather than a cosmetic one.

### GAP 12. Documented dimensions contradict shipped dimensions. LOW.

`frontend/public/assets/symbols/README.md` states "Recommended size: 200x200 px, transparent
PNG" and lists filenames as `H1.png` through `S.png`. The shipped pipeline exports **240x240
and 120x120 under lower-case names**. The README describes a scheme that no longer exists and
would mislead anyone bringing new art in. Related: `manifest.json`'s `storefront_tile` block
declares slots whose own `_doc` admits the values are provisional defaults rather than a
platform-published number, and states the block is not read.

Also in this class: bg-1.jpg was a PNG behind a .jpg name (2.2). That file was deleted on
2026-08-09 for a much larger reason than its extension; see 2.2.

---

## 5. The company-versus-title split

Section 7b closes with "Company layer (section 1) does not repeat; only per-title rows do."
This document mirrors that split in its own inventory, using 7b's vocabulary so the two read
as one:

| Carries forward to LUMEN UNCHANGED (company skin) | Replaced per title (title skin) |
|---|---|
| `design-system/archive/provider_mark/` | `design-system/masters/` |
| `design-system/brand/hero_emblem/` | `frontend/public/assets/themes/<title>/` |
| `design-system/brand/hero_icon/` | `design-system/brand/tile/`, `delivery/` |
| The studio name, mark and provider logo ladder | Every locale string value |
| `tools/audio_forge/` and `scripts/assets/` as CODE | Their INPUTS: prompts, masters, seeds |

---

## 6. Reading order for a next-title session

1. `WRS_MASTER_DOCUMENT.md` section 7b, for the ORDER.
2. This document's Part 1, for what is engine and what is skin.
3. This document's Part 4 BEFORE estimating, because GAP 1 and GAP 3 are the two that
   section 7b's single arrow currently hides.
4. This document's Part 2 for the family being replaced, and its **(d)** row as the
   definition of done.
5. `docs/QUALITY_CHARTER.md`, because a reskin is exactly when machine-tells enter: new
   strings, new glyphs, new placeholder art.
