# Win_Celebration.dc.html - Svelte integration handoff (C1)

Maps the C1 win-celebration mock onto the shipped `Win*` components. Same format
as `HUD_Reskin_HANDOFF.md`: it is a reskin, not a rewrite. Keep every live
binding. No CDN font. Australian English. No em or en dashes.

Mock: `Win_Celebration.dc.html` (this design project). Preview switcher covers
tier (BIG / MEGA / EPIC / MAX) x scheme (Future / Trap / Oil / Pitch) x
base / Overdrive. That switcher is preview-only scaffolding and does NOT ship.

---

## 0. Ground truth (confirmed from source, do not regress)

| tier | threshold (from `WinBanner.svelte`) | count-up | particles | signature token |
|------|-------------------------------------|----------|-----------|-----------------|
| BIG  | `winMultiplier >= 10`  | 1400ms | 14 | `--sig-cyan` |
| MEGA | `winMultiplier >= 30`  | 2000ms | 28 | `--sig-pink` (+ gold multiplier chip) |
| EPIC | `winMultiplier >= 100` | 2800ms | 48 | `--sig-gold` |
| MAX  | `= 5,000x` cap | dedicated fullscreen | 90 | `--sig-pink` / `--sig-orange` (Overdrive pair) |

Small wins `1x` to `<10x` stay the existing `WinCelebration.svelte` flash
(`WIN!` / `PRIZE!`, 1.2s). Do not turn those into a plate.

Count-up easing is cubic ease-out (`1 - (1 - p)^3`), matching the shipped
`WinBanner` count-up. `overdriveVisual` warms the accents on feature wins.

---

## Step 1 - `WinBanner.svelte` (BIG / MEGA / EPIC plates)

Reskin the banner body onto `.fs-plate` + `.fs-rail`; keep all script logic
(thresholds, `showBanner`, staged count-up, `isSocial` i18n, `formatBalance` +
`CURRENCY_SCALE`, auto-dismiss). Only the markup and the scoped `<style>` change.

1. Re-declare the 5 signature tokens + primitives in the component's scoped
   `<style>` (Svelte scopes per component, so re-declaring is correct - see
   `docs/design/CHROME_PRIMITIVES.md`). Copy `.fs-plate`, `.fs-plate > .fs-face`,
   `.fs-rail`, `.fs-num` and the tier escalation / particle / entry blocks from
   the mock's `<style>`.
2. Markup: wrap the banner in `.fs-plate` with a `.fs-rail` and a `.fs-face`
   holding the tier label + amount. Drive the plate signature per tier:
   `class="fs-plate tier-{tier}"` -> `--sig` = cyan / pink / gold.
3. Numerals use the B1 sharp-numeral treatment (`.fs-num`, near-white fill,
   tight 3px halo, `tabular-nums`) - not the old wide cyan double glow.
4. Overdrive: `import { overdriveVisual } from '../stores/overdriveVisual'` and
   put `class:c1-win--overdrive={$overdriveVisual}` (or the banner's root class)
   so feature wins flip the accent warm. App already mirrors the flag live.
5. Keep the tiered particle burst; counts stay 14 / 28 / 48 by tier.

## Step 2 - `MaxWinCelebration.svelte` (MAX 5,000x overlay)

Keep the whole script: `show` prop, `collect` dispatch, `Enter` key dismiss,
`isSocial`, the 90-particle field, the halo ring, App halting autoplay while
visible, z-index 150. Reskin only:

1. Re-declare tokens + primitives in scoped `<style>`; set the root to the
   Overdrive pair (`--acc: --sig-pink`, `--acc2: --sig-orange`).
2. Port the mock's `.c1-max`, `.c1-halo`, `.c1-max-headline`, `.c1-max-mult`,
   `.c1-max-x`, `.c1-max-betlabel`, `.c1-collect`, `.c1-hint` blocks.
3. `MAX WIN` / `MAX PRIZE` stays behind `isSocial`; `BET` / `PLAY` stays behind
   `isSocial`. COLLECT remains an explicit click (Enter also collects).

## Step 3 - `WinCelebration.svelte` + `WinBreakdown.svelte`

- `WinCelebration.svelte`: leave the sub-10x flash logic as is; only retint the
  flash to `--acc` so it matches the scheme. No structural change.
- `WinBreakdown.svelte`: keep the `activeWins` group cycle (900ms settle, then
  1400ms per group). Optionally reskin its chip onto a thin `.fs-plate` using the
  paid symbol's tier token, but the cycle timing and bindings do not change.

---

## Constraints checklist (must all hold in the PR)

- [ ] No `fonts.googleapis.com` / `fonts.gstatic.com` `<link>`. Orbitron is
      self-hosted via `@fontsource`; use `font-family: 'Orbitron', system-ui, sans-serif`.
- [ ] Australian English, no em or en dashes (hyphens only; `x` sign is fine).
- [ ] All live bindings preserved: thresholds, `formatBalance` + `CURRENCY_SCALE`,
      `isSocial` i18n, `activeWins`, autoplay-pause, `overdriveVisual`.
- [ ] `prefers-reduced-motion: reduce` guard kept on every animation.
- [ ] Tier escalation = more chrome + bigger bloom + token shift, never new
      colours invented outside the 5 signature tokens.
- [ ] Stack appropriately in a worktree (same flow as #29 / #30 / #31).
