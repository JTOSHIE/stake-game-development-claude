# HUD_SPEC.md — Desktop control banner, locked geometry

**Locked 2026-07-25, OWNER AUDIT ROUND 3, item 7.** These are the enforced
LAYOUT_SPEC stage coordinates (1280x720 design surface, `HudOverlay.svelte`'s
desktop/`.fs-hud` layout only — portrait and compact-landscape have their own
native-DOM layouts and are out of scope for this lock) for every control in
the bottom banner. Any future change to these coordinates must update this
file in the same commit, and must keep every assert in
`frontend/scripts/hud_banner_spec_check.mjs` green.

## The rules this geometry encodes

1. **Shared vertical centre.** Every control's centre-Y is exactly **604px**.
   No exceptions. This is what "true centring" means for this banner.
2. **Consistent gap.** Every distinct control is separated from its neighbour
   by exactly **16px**, left edge to right edge (TURBO through AUTO, the
   whole row).
3. **44px+ touch targets.** Every interactive control's bounding box is at
   least 44x44px (BALANCE/WIN/BET plates are not interactive and are exempt).

   **PROVENANCE OF THE 44, ruled 2026-08-20 by R073, because a threshold with no
   stated source is a threshold nobody can defend to a reviewer.** THE PLATFORM
   DOES NOT NAME ONE. Swept at HEAD on 2026-08-20 across the whole dated mirror
   under `docs/stake-engine-live/`, including the fifty-one submission checklist:
   **zero occurrences** of a touch-target, tap-target or minimum-control-size
   requirement, and no number anywhere. The checklist's only "44" is its own item
   [44], which is about replay support in Popout S and unrelated.

   **So 44 is OURS, adopted from Apple's Human Interface Guidelines**, whose
   minimum tappable area is 44x44 points, and it is the stricter of the two
   common industry figures (Google's Material guidance is 48x48dp for the target
   with a 24dp minimum for the visual element, and WCAG 2.2 AA's Target Size
   (Minimum) is 24x24 CSS pixels). **Recording that it is a self-imposed choice
   rather than a platform rule is the point of this note**: it means a control
   measuring 43px is a QUALITY failure against our own bar and not a compliance
   failure against the platform's, and a reviewer asking where the number came
   from now gets an answer instead of a shrug.

   **AN INCONSISTENCY WAS NAMED HERE AND IS NOW CLOSED, 2026-08-28 by R135.** This paragraph
   used to record that `popout_conformance.mjs` labelled its assertion "meets the 44px touch
   target" while testing `>= 40`, and that the threshold was deliberately not moved in the pass
   that documented it. **R075 moved it.** VERIFIED at HEAD by direct read: the assertion is
   `geom.btnH >= 44`, and the script's own comment beside it records that it "read >= 40 beside
   this 44 label from R14 until R075". Nothing on TR-164 remains live here.
   **THE STALENESS IS RECORDED RATHER THAN QUIETLY DELETED**, because this is a LOCKED spec that
   a session reads as current, and convention (h.1) exists precisely because a stale status claim
   in a boot document does the most damage: the next reader either hunts a threshold that is
   already correct, or "fixes" one that needs no fixing.
4. **AUTO is tangent to SPIN.** AUTO's left edge equals SPIN's right edge
   exactly (`1027 + 84 = 1111`) — touching, never overlapping, never gapped.
5. **MAX matches the mobile treatment.** A 48px circle (`.p-round-btn`-style
   radial-gradient dark circle, "MAX" text centred), not the old narrow
   26x44 rectangular "cap".
6. **Stress values fit via autofit.** BALANCE/WIN/BET all use the existing
   `use:autofitText` action so a seven-figure balance or win never overflows
   its plate — verified up to $1,000,000+ in the conformance check.

## Locked coordinates (stage px, `.fs-hud` desktop layout)

| Control | CSS rule | left | top | width | height | right | bottom | centre-Y |
|---|---|---|---|---|---|---|---|---|
| TURBO | `.fs-turbo` | 199 | 563 | 82 | 82 | 281 | 645 | 604 |
| MAX | `.fs-max` | 297 | 580 | 48 | 48 | 345 | 628 | 604 |
| MENU | `.menu-wrapper` | 361 | 582 | 44 | 44 | 405 | 626 | 604 |
| BALANCE | `.fs-balance` (`.fs-box`) | 421 | 573 | 200 | 62 | 621 | 635 | 604 |
| WIN | `.fs-win` (`.fs-box`) | 637 | 573 | 150 | 62 | 787 | 635 | 604 |
| BET | `.fs-bet` (`.fs-box`) | 803 | 573 | 120 | 62 | 923 | 635 | 604 |
| BET STEPPERS | `.fs-arrows` | 939 | 578 | 44 | 52 | 983 | 630 | 604 |
| SPIN | `.fs-spin` | 999 | 562 | 84 | 84 | 1083 | 646 | 604 |
| AUTO | `.autoplay-wrapper` | 1083 | 580 | 48 | 48 | 1131 | 628 | 604 |

Background panel (`.fs-panel`, decorative only, z-index below every control
above): `left:281px; top:560px; width:718px; height:88px`, spanning from one
gap before MAX to one gap after STEPPERS. TURBO and SPIN/AUTO sit deliberately
outside it, as before this pass.

**AMENDED 2026-08-15, and this file is amended in the same commit as the CSS
because its own rule above requires that.** The panel was `width:711px`, an
asymmetric backdrop: 16px of inset before MAX and 9px after STEPPERS, which put
the two OUTER gaps at 0.00 and 7.00. The right inset is now the same one gap as
the left, so the outer gaps are EQUAL. **No control moved**: every coordinate in
the table above is unchanged and `hud_banner_spec_check.mjs` passes on all of
them. The row's nine horizontal positions are now derived in `HudOverlay.svelte`
from a single `--fs-row-gap` token rather than hand-set, and the token's value is
the 16px this file already locks.

**A geometry question this amendment deliberately does NOT answer.** The panel
now centres on 668 rather than on the canvas centre 640, because its contents run
MAX.left 325 to STEPPERS.right 1011 and that span's midpoint is 668. A
canvas-centred panel WITH equal outer gaps is arithmetically impossible while
TURBO's right edge and SPIN's left edge sit at 309 and 1027, which are 331 and
387 from 640. Closing it means moving locked controls, which is an owner call.
The measurement, the proof and three costed options are at
`reports/screens/controlrow-2026-08-15/MEASUREMENTS.md`.

## Gap audit (left edge of control N+1 minus right edge of control N)

TURBO→MAX 16 · MAX→MENU 16 · MENU→BALANCE 16 · BALANCE→WIN 16 · WIN→BET 16 ·
BET→STEPPERS 16 · STEPPERS→SPIN 16 · SPIN→AUTO 0 (tangent, by design — rule 4).

Re-measured from the DOM 2026-08-15 at 1280x720 and at 1200x675: all seven gaps
read 16.00 and 15.00 respectively, SPIN→AUTO reads 0.00 at both, and the two
outer gaps against the panel now read 0.00 and 0.00. Held by
`frontend/scripts/control_row_symmetry_gate.mjs`, which carries a seeded
self-test that skews one gap by 6px and must go red naming it.

## What changed from the pre-2026-07-25 geometry

- **AUTO** was at `left:912px; top:648px` (centre-Y **672**, not 604) — sitting
  well below-left of SPIN, entirely unaligned with the rest of the row and not
  touching SPIN at all. This was the most visible defect the item names.
- **MAX** was a narrow `26x44` rectangular "cap" at `left:311px` — the only
  non-circular control in the row, inconsistent with TURBO/MENU/AUTO/SPIN's
  shared circular-button language and with the mobile layout's own MAX
  styling.
- **MENU** was `40x40px` — under the 44px touch-target floor.
- BALANCE/WIN/BET/STEPPERS were already correctly centred at y=604 and gapped
  16px apart from each other; they only needed to shift right (+49px) to make
  room for MENU's regained 4px and the whole row's new spacing math, not a
  redesign.

## Enforcement

`frontend/scripts/hud_banner_spec_check.mjs` re-measures every control above
via a live headless-browser render and asserts every rule in this document
byte-for-byte (exact px, not "close enough"). Run it as part of the full
conformance suite; a change to any control's geometry that isn't reflected
in this table fails that check on sight.
