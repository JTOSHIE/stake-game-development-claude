# LAYOUT_SPEC v3.1 (owner approved)

Reference 1280x720, S = min(vw/1280, vh/720), whole stage scales together,
safe margin 24. LOGO top centre 380 wide y 18. FRAME 640x468 at (320,84);
GRID 522x349 centred inside; cells canonical 120x100 canvas space. FEATURE
button: Grille art carrying the button (no plate box), about 128 wide,
positioned beside the frame upper left, just above and right of the
character, label centred beneath. HUD panel x 320 to 960, y 560 to 648,
translucent deep navy, radius 18, one baseline cy 604: TURBO 72 far left
INSIDE the panel (themed, flames on engage); hamburger; BALANCE box 170 and
WIN box 140 pulled close together, values 18, labels 12, sized to fit
$10,000.00; BET with fully visible stacked cyan arrows given the freed
width; SPIN 84 centred (970,604) clear of the bet arrows; AUTOPLAY 48 at
(902,672) below the bar. CHARACTER with hover car: left scene group, taller
(about 560 character height), set further back, clear of the turbo. BONUS
INSTRUMENT COLUMN (Overdrive only): gauge 232 at (1018,96) with the spins
readout integrated in the face art; designed MULTIPLIER and TOTAL WIN
instrument plates stacked beneath (1000 to 1262). BANNER compact 380x96
centred over grid at (450,262), translucent, gold rim. Z-ORDER LAW:
background 0, frame 10, grid 20, symbols 30, win FX 40, HUD and meter 60,
banner 100, modals 200, splash 300; HUD never beneath the frame. Speed
tiers Normal, Turbo, Super Turbo; spin pressed mid-spin slam-stops reels,
outcome unchanged.

# AMENDMENT v3.2 (owner approved) — fixed-field HUD

Supersedes the v3.1 HUD panel and control positions only; the frame, grid, logo, banner,
scene group and bonus instrument column positions from v3.1 are unchanged. Driven by
stress-testing $10,000.00 balance / $5,000.00 win / $5,000.00 bet values, which crowded the
v3.1 panel and risked bet-arrow occlusion. The panel widens to x 296 to 984 (688 wide).
TURBO 72 moves OUTSIDE the panel, centred at (268,604), clear of the panel's left edge.
SPIN 84 moves further right, centred at (1004,604), clear of the panel's right edge.
AUTOPLAY 48 stays below the bar, now at (936,672) to stay under the wider panel. Inside the
panel, every field is a FIXED box that never moves or resizes as its value grows: hamburger
at x 344; BALANCE fixed box at x 400, width 200; WIN fixed box at x 616, width 150; BET at
x 782 with the value right-aligned in a fixed 120 width; the stacked cyan bet arrows in
their own FIXED column at x 916, independent of the BET value box. Every numeric HUD value
renders with tabular numerals (font-variant-numeric: tabular-nums) so digit width never
shifts. Z-order law is unchanged from v3.1.

# AMENDMENT v3.3 (owner approved) — feature button right, MAX chip returns, theme selector dev-only

Supersedes only the elements it names; the frame, grid, logo, banner, scene group, bonus
instrument column and the other v3.2 fixed-field HUD boxes are unchanged.

(a) FEATURE button relocates to the RIGHT side of the frame, about 160 wide, vertically
centred on the frame (the frame is 640x468 at (320,84), so its vertical centre is y 318).
During Overdrive the FEATURE button is hidden and the bonus instrument column owns that right
zone.

(b) MAX BET returns as a MAX chip at a FIXED position beside the bet arrows. The stacked cyan
bet arrows shift from x 916 (v3.2) to x 906; the MAX chip sits at x 938, width 40, on the HUD
baseline (cy 604), wired to the existing max-bet ladder logic, rendered with tabular numerals,
and never repositioned by its content. The chip clears the SPIN button; if a stress audit
finds the fixed 40 width intersecting the SPIN circle, the chip width is the free lever and is
recorded here with the final measured value.

(c) The theme selector button is removed from the production UI and gated behind a dev-only
flag (import.meta.env.DEV); in production it is never rendered and the default theme is forced
(already the case in App.svelte, re-verified this pass).

# AMENDMENT v3.4 (owner concept) — Overdrive flame jets

Eight flame jets ring the frame (640x468 at (320,84)), two per side, flame pointing OUTWARD
from each edge, sprites derived from M3_master_v3.svg (nozzle + a 5-frame flame sheet). Fixed
positions in stage coordinates, at the jet-mouth origin, with an outward rotation:

| Jet | Mouth (x,y) | Flame direction |
|-----|-------------|-----------------|
| top-left / top-right | (480,84) / (800,84) | up (rot -90) |
| bottom-left / bottom-right | (480,552) / (800,552) | down (rot 90) |
| left-upper / left-lower | (320,224) / (320,412) | left (rot 180) |
| right-upper / right-lower | (960,224) / (960,412) | right (rot 0) |

Each jet renders at scale 0.55. They IGNITE on the Overdrive entry (driven by
`overdriveVisualActive`, in sync with the gauge slam), burn for the whole bonus with a CSS
steps(5) sprite loop plus a scale-breathe, and extinguish when the end phase starts. Pooled
(the eight elements exist once, toggled by class; the flame is CSS-driven, zero per-frame
allocation). prefers-reduced-motion shows the static-glow frame with no animation. Z-order:
the jet layer is z15 (above the frame at z10, outside the grid so it never overlaps symbols),
below the HUD (z60) and banner (z100).
