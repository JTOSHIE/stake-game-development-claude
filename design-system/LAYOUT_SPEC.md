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
