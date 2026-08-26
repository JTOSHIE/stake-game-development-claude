# HUD_SHELL_TEMPLATE.md — the operator-standard control shell

**Established 2026-08-26 by R119.** This file is workstream 5 of the R119 brief:
what a future WRS title inherits unchanged, what it re-skins, and what it must
not touch. It describes the shell as SHIPPED, not as aspired to.

The canonical implementation is the `<style>` block of
`frontend/src/lib/components/HudOverlay.svelte`. This document mirrors it.

---

## 1. The one thing that makes it a template: a shell token block

All four HUD layouts inherit one declaration:

```css
.fs-hud, .p-hud, .c-hud, .m-hud {
  --hud-surface:        rgba(11, 15, 24, 0.84);   /* plate + panel fill      */
  --hud-surface-raised: rgba(20, 26, 37, 0.88);   /* buttons sit above it    */
  --hud-surface-sunken: rgba(6, 9, 15, 0.90);     /* value wells             */
  --hud-border:         rgba(226, 238, 250, 0.13);/* neutral hairline        */
  --hud-border-strong:  rgba(226, 238, 250, 0.26);/* hover / active edge     */
  --hud-text:           #eef4fa;                  /* live values, near-white */
  --hud-text-dim:       rgba(214, 230, 244, 0.58);/* labels                  */
  --hud-accent:         var(--theme-primary, #00FFFF);
  --hud-shadow:         0 6px 20px rgba(0, 0, 0, 0.45);
  --hud-shadow-soft:    0 2px 8px rgba(0, 0, 0, 0.40);
}
.fs-hud--overdrive, .p-hud--overdrive, .c-hud--overdrive {
  --hud-accent: var(--theme-secondary, #FF2EC4);
}
```

**Why it is declared on four roots rather than on `:root`.** Svelte scopes styles
per component, so a selector must match an element the component actually
renders or it is stripped and `svelte-check` reports an unused selector, which
`typecheck_baseline.mjs` fails on any rise. The four roots are the four layout
branches of the same `{#if}` chain, so exactly one of them exists at a time.

## 2. What a new title inherits UNCHANGED

- **Every token NAME above.** A new title re-points `--theme-primary` and
  `--theme-secondary` and gets a coherent shell for free.
- **The accent discipline.** Chrome at rest is neutral. The accent is spent in
  exactly three places: the SPIN control, a live win, and active toggle states.
  A colour that appears everywhere signals nothing.
- **Values are near-white.** `--hud-text` on every live numeral in every layout.
  A player comparing BALANCE against BET must not be comparing two colours.
- **Labels are dim and uppercase.** `--hud-text-dim`.
- **Surfaces are three steps, not one:** sunken wells hold values, the base
  surface is the panel, raised surfaces are buttons. Depth carries the hierarchy
  that a metal bezel used to carry.
- **SPIN is dominant by SIZE and by being the only accent-carrying control**, not
  by having a more elaborate material than its neighbours.

## 3. What stays GAME-SPECIFIC

- `--theme-primary` / `--theme-secondary` — the two hues the shell reads.
- `ui/hud_banner.png` — the desktop panel's 718x88 backdrop raster. Optional: the
  three non-desktop layouts have no raster at all and look correct without one.
- The chamfer on `.fs-plate`'s `clip-path`. It is this title's shape language and
  it costs no contrast. A new title may square it off.
- The SVG glyph paths (bolt, hamburger, play, chevrons).
- Anything outside `HudOverlay.svelte`. See section 5.

## 4. What a new title MUST NOT touch

- **The geometry.** `docs/HUD_SPEC.md` locks all nine desktop control boxes and
  requires that file to be amended in the same commit as any change to them.
  R119 changed no geometry: `hud_banner_spec_check.mjs` passes on every gap,
  every tangency and every touch target.
- **`font-size` on any value.** The autofit actions rewrite it at runtime through
  `--autofit-scale`; a new rule that does not multiply that variable in silently
  disables autofit. This is a real defect that already shipped once.
- **The three TURBO speed steps.** `turbo_intensity_gate.mjs` measures the live
  control's mean WCAG luminance at each speed across seven presets and asserts a
  1.25:1 minimum step between adjacent tiers. Re-hue it freely; keep it an
  escalation.
- **The value class names** `.cyan` / `.magenta` / `.gold`. They no longer carry
  colour, but they are attached to the autofit actions and the testids. They are
  now field IDENTIFIERS, not colour names, and are kept to avoid touching markup.

## 5. Known surfaces this shell does NOT cover

R119 restyled `HudOverlay.svelte` only. These neighbouring surfaces still carry
the previous chrome language and now read as inconsistent beside the shell:

| surface | file | what still looks old |
|---|---|---|
| Feature instrument column | `frontend/src/lib/components/BonusInstrumentColumn.svelte` | magenta plate borders, gold values |
| FEATURES button | `frontend/src/lib/components/FeatureMenu.svelte` | magenta border and glow |
| Paytable chrome | `frontend/src/lib/components/PaytableModal.svelte` | the `.fs-plate` metal primitive, its own copy |

They are the natural next pass and each is a token re-point, not a rewrite.

## 6. The interface-guide dependency, which bites on every reskin

`frontend/scripts/regen_interface_guide_icons.mjs` screenshot-crops the LIVE
controls into eight shipped PNGs that `PaytableModal.svelte` renders in the
in-game interface guide. **A HUD restyle silently falsifies that guide**: nothing
fails, the manual is simply wrong, and the in-game guide is a review
requirement. Re-run the regenerator in the same pass as any control restyle:

```
node frontend/scripts/regen_interface_guide_icons.mjs
```

It refuses unless every tracked asset under
`frontend/public/assets/themes/future-spinner` matches HEAD, which is deliberate:
it writes straight into that directory.
