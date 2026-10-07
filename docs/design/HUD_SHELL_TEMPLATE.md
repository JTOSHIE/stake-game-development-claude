# HUD_SHELL_TEMPLATE.md — the operator-standard control shell

**NOTE R153 (2026-10-07): sections 1, 2, 3, 5 and 6 no longer describe the shell as shipped, and
the style block this file mirrors has moved on.** Since R153
(`reports/briefs/FS_R153_OperatorStripHeroStill_Prompt.md`, TASK 1) every HUD profile paints the
operator strip: one flat plate, labels at 60% white, white values, hairline circles, and the SPIN
ring as the only accent. The desktop rules are the R153 OPERATOR STRIP section of
`frontend/src/lib/components/HudOverlay.svelte`, and the other three profiles carry the same paint
in their own sections. They read six `--op-*` tokens declared beside the `--hud-*` block on
`.game-wrapper` in `frontend/src/App.svelte`. No coordinate moved, so section 4 stands. A note above
each falsified passage says what is now true.

**Established 2026-08-26 by R119.** This file is workstream 5 of the R119 brief:
what a future WRS title inherits unchanged, what it re-skins, and what it must
not touch. It describes the shell as SHIPPED, not as aspired to.

The canonical implementation is the `<style>` block of
`frontend/src/lib/components/HudOverlay.svelte`. This document mirrors it.

---

## 1. The one thing that makes it a template: a shell token block

**NOTE R153 (2026-10-07): the block below still exists and no longer paints the bar.** The four
profiles paint from six tokens declared after it in the same `.game-wrapper` rule: `--op-plate`
rgba(18, 20, 26, 0.9), `--op-label` 60% white, `--op-value` #ffffff, `--op-glyph` 86% white,
`--op-hairline` 32% white and `--op-hairline-hi` 72% white. Of the block below, the HUD reads only
`--hud-accent`, on its four SPIN rings; the paytable modal reads eight of the other nine, and
`--hud-surface` has no reader. The Overdrive flip now covers four roots, `.m-hud--overdrive`
included.

All four HUD layouts inherit one declaration:

```css
/* App.svelte, on .game-wrapper - the element that also carries --theme-primary */
.game-wrapper {
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
/* HudOverlay.svelte - the state flip only */
.fs-hud--overdrive, .p-hud--overdrive, .c-hud--overdrive {
  --hud-accent: var(--theme-secondary, #FF2EC4);
}
```

**AMENDED 2026-08-26 by R120: the block MOVED, and R119's stated reason for its
old home was wrong on the mechanism.** The ten base tokens now live on
`.game-wrapper` in `App.svelte`, so the paytable modal, the FEATURES bar and the
feature instrument column inherit the same shell. Only the Overdrive accent flip
stays on the HUD roots, because it is a HUD state.

**The correction, recorded rather than erased.** R119 wrote that the block avoided
`:root` because "Svelte scopes styles per component, so a selector must match an
element the component actually renders or it is stripped". **That is not true of
`:root`**: compiling a `:root { --token: … }` rule with this project's own Svelte
5.53.0 shows it is neither scoped nor stripped, and `svelte-check` raises nothing.
The conclusion was right for the wrong reason.

**The real reason `:root` cannot hold these tokens**, and it is a trap worth
knowing: `--theme-primary` is declared on `.game-wrapper`, and a custom property
is substituted **where it is declared, not where it is used**. So
`--hud-accent: var(--theme-primary, #00FFFF)` written on `:root` resolves against
an `html` element that has no `--theme-primary`, freezes at the literal fallback,
and inherits that frozen value to the whole tree. The accent silently stops
following the palette — and it is silent precisely because the fallback IS the
current theme's cyan, so nothing looks wrong until someone changes theme.
Measured in a browser before the move: a `:root` token rendered the cyan fallback
while the same token on the wrapper rendered the theme colour.

## 2. What a new title inherits UNCHANGED

**NOTE R153 (2026-10-07): four of the six bullets below are no longer true of the bar.** The accent
is spent in ONE place, the 2px SPIN ring in `--hud-accent` (magenta under the Overdrive flip). A
live win lights nothing (no `.lit` rule remains), and active toggles and the three TURBO speeds are
white luminance steps. Keyboard focus rings sit outside this count: `frontend/src/app.css` draws
them in `--theme-primary`. Values are `--op-value`, pure white, not `--hud-text`. Labels are
`--op-label`, 60% white, in 10px tracked caps (7px in the 400x225 mini profile, where a 10px
label leaves a $50,000.00 balance too little room). There is one surface, `--op-plate`, not three
steps: the strip, every hairline circle at rest and the SPIN face share it. The first bullet and
the SPIN bullet stand.

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

**NOTE R153 (2026-10-07): the HUD has no raster and no chamfer left to re-skin.** No rule draws
`frontend/public/assets/themes/future-spinner/ui/hud_banner.png` since R153, and the build prunes
it (LEGACY_FILES in `frontend/vite.config.ts`); the file stays in the repository. The desktop strip
is one flat plate with an 8px radius and no `clip-path`, so the `.fs-plate` chamfer bullet no
longer applies to the HUD (the paytable's own `.fs-plate` keeps it). The other three bullets stand.

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

**NOTE R153 (2026-10-07): two of the three surfaces below left the `--hud-*` shell.**
`FeatureMenu.svelte` and `BonusInstrumentColumn.svelte` read no `--hud-*` token since R153: the
FEATURES entry triggers and the instrument column paint from the `--op-*` tokens. The paytable body
and its own `.fs-plate` still read `--hud-*`; its Interface Guide replicas read `--op-*`.

**AMENDED 2026-08-26 by R120: all three were brought onto the shell.** The table
below is kept as the record of what R119 left behind; every row is now done.
`BonusInstrumentColumn` and `FeatureMenu` consume the shell tokens directly, and
`PaytableModal`'s own copy of the metal `.fs-plate` follows the shell too, which
supersedes the scoping note added to `CHROME_PRIMITIVES.md` in R119.

R119 restyled `HudOverlay.svelte` only. These neighbouring surfaces carried
the previous chrome language and read as inconsistent beside the shell:

| surface | file | what still looks old |
|---|---|---|
| Feature instrument column | `frontend/src/lib/components/BonusInstrumentColumn.svelte` | magenta plate borders, gold values |
| FEATURES button | `frontend/src/lib/components/FeatureMenu.svelte` | magenta border and glow |
| Paytable chrome | `frontend/src/lib/components/PaytableModal.svelte` | the `.fs-plate` metal primitive, its own copy |

They are the natural next pass and each is a token re-point, not a rewrite.

## 6. The interface-guide dependency, which bites on every reskin

**NOTE R153 (2026-10-07): the regenerator is RETIRED; do not run it.** Every Interface Guide row in
`frontend/src/lib/components/PaytableModal.svelte` is a live markup replica since R153 (SPIN,
FEATURES and MAX since R152; bet up, bet down, autoplay, menu and the three speeds since R153), and
no guide row reads a PNG. Running the regenerator rewrites PNGs in public/ that no guide reads, and
commits rasters, which the R153 brief fences. The dependency remains in a new form: each replica is
its own markup and rules in that file, not the live control's, so a control restyle restyles its
replica in the same pass.

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
