# Session Report: MAX bet button relocated away from SPIN

- **Date:** 2026-07-04
- **Model / effort:** Claude Code, High.
- **Branch:** `claude/max-relocate` (from `main` after PR #19 merged and deployed).
- **Source:** owner-reported hazard (informal): the MAX bet chip sat right against the
  SPIN button, a mis-tap position.

## What was wrong

The MAX chip was never actually relocated. The v3.5 audit-remediation pass only enlarged its
tap target (26 x 44) inside the same cramped slot: `left: 935px`, right edge x961, one pixel
off the SPIN hit circle whose leftmost point is x962. A control that jumps the bet to maximum
sitting hard against SPIN is the fat-finger hazard the owner flagged, and it was still live in
the deployed build.

## Fix

Moved the MAX chip to the FAR LEFT of the HUD, into the 40px gap between the TURBO button
(right edge x304) and the hamburger menu (left edge x344): a 26 x 44 button centred at x324
(spanning x311 to 337), baseline y604 unchanged, visible chip geometry (24 x 26) unchanged.

- `frontend/src/lib/components/HudOverlay.svelte`: `.max-chip` `left: 935px -> 311px` (single
  coordinate; the whole stage is a fixed 1280x720 surface scaled uniformly, so no other change
  is needed and it holds at every viewport). Comments updated.
- `design-system/LAYOUT_SPEC.md`: added AMENDMENT v3.6 recording the move and the measured
  clearances.

Chosen from three options put to the owner (own row under BET / far-left standalone / keep
order with a gap); the owner chose far-left standalone.

## Verification (headless, 1280x720, page px = stage coords)

Measured button rectangles from the live DOM:

| Button | x span | note |
|--------|--------|------|
| TURBO | 232 to 304 | right edge 304 |
| MAX | 311 to 337 | 7px clear of TURBO, 7px clear of menu |
| menu | 344 to 384 | |
| SPIN | 962 to 1046 | leftmost 962 |

MAX right edge 337, SPIN left edge 962: a 625px gap (was touching). MAX, TURBO and hamburger
hit rectangles are pairwise non-intersecting; MAX no longer intersects the SPIN circle.
`npm run build` clean, zero console errors on load. Proof:
`reports/screens/max-relocate/base-bar.png`.

## Locks

`rgsService.ts`, `gameStore.ts`, `games/future_spinner/**` untouched (HudOverlay and
LAYOUT_SPEC are not locked). The stray prior-session Build-Diet/QA files remain uncommitted in
the working tree and were excluded via explicit-path staging.
