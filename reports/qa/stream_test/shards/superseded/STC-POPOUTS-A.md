# STC-POPOUTS-A, composition (popout-s, frames 157 to 182)

scope: every `popout-s` frame numbered 157 to 182 inclusive, 26 frames, session
viewport `400x225` per `MANIFEST.json`. Covers splash entrance, splash, the
splash-to-rules fade, the intro rules card, the rules-to-base fade, base idle,
both spin transitions, the three dead spins, the standard win, the three big-win
frames, the menu open transition, the HUD menu, the session panel, the paytable
open transition, and paytable sections `top` through `06_bet_modes`.
frames_read: 26

**Provenance, stated because two passes are folded into one shard.** A measured
STC-POPOUTS-A pass had already written this shard at this path before this run
opened it. This run re-opened all 26 frames independently and by eye, and every
finding below was re-confirmed against the frames rather than carried forward on
trust. The measured geometry from the first pass is preserved verbatim because it
is more precise than eye-reading and this run's independent reading agrees with
it on every claim it could check. What this run changed: it corrected the section
count in A-02, added A-10 and A-11 which the first pass did not carry, added the
out-of-lens observations at the end of the absences, and filled in the fix
locations that stood as `UNKNOWN`. Nothing was removed.

**CORRECTION, and it is the most important line in this shard.** An earlier state
of this file carried fix locations that DO NOT EXIST IN THIS TREE. There is no
`IntroRules.svelte` and no `PayTable.svelte`; the real components are
`IntroSplash.svelte` and `PaytableModal.svelte`. The selectors `.menu-popover`,
`.menu-item`, `.readout`, `.intro-actions`, `.paytable-header` and
`.paytable-body` return zero hits across `frontend/src/lib/components/*.svelte`,
and `.win-banner` exists only inside the class list `c1-win big-win-banner` at
`WinBanner.svelte:243`, not as a rule at `:322`. Every one of those locations has
been replaced below with a location opened and read at HEAD `d9bdf22`, and each
corrected location is now stated with the declaration it rests on so a reader can
check it in one grep. **The FRAME evidence in this shard was never affected: the
findings and their measured geometry stand, and only the fix locations were
wrong.** Recorded rather than quietly overwritten, per the facts discipline: a
fabricated `file:line` sends the next session to a file that is not there, and
that is the failure mode this audit can least afford.

**Severity order.** IDs below are held stable because they may already be in the
marshal's hands, so the file is not renumbered. The true worst-first order after
source location is: **A-04, A-01, A-02** (all STREAM), then A-03, A-05 (HIGH),
then A-06, A-07, A-08, A-09, A-10, A-11 (MEDIUM). A-04 was escalated from HIGH to
STREAM by the source read, for the reason given in its own entry.

Geometry in this shard is measured, not eyeballed. Frames were decoded to raw
`rgb24` with `ffmpeg` into the session scratchpad and read with the Python
standard library; no project script was run and nothing outside this shard was
written. All coordinates are zero-indexed pixels in the `400x225` frame, so the
viewport centre is `x=199.5`, `y=112.0`. Where a measurement is quoted beside a
CSS declaration, the declaration was found AFTER the measurement and is recorded
as confirming it, per convention (l.2).

## STC-POPOUTS-A-01 STREAM The intro rules `Continue` button is drawn on top of the body copy and hides the middle of two lines

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/160_popout-s_intro_rules.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/159_popout-s_transition_splash_to_rules.png`
- Claim: on frame `160` the solid cyan `Continue` button occupies `x=119..280`,
  `y=162..202`. Body text of the second bullet is still being painted underneath
  it: at `y=175` there are body-text pixels at `x=50` and at `x=322`, and at
  `y=178` there are 46 body-text pixels spanning `x=51..329`. Both rows fall
  inside the button's `y=162..202` band, so the line runs behind the button and
  survives only in the margins either side of it. The sentence a player is meant
  to read is `The Overdrive meter starts at 1x and rises +1x after every winning
  free spin, multiplying all later wins until the end of the feature.` What
  renders is that sentence with its middle punched out: the visible fragments are
  `multiplying` then `all later w`, the button, then `ing the` and a final
  visible `feature.` at `y=189..198`. The card itself is correctly inset
  (`x=16..384`, so 16 px each side), so this is not a card-width problem: the
  button is not in the flow, it is on top of it. The same occlusion is already
  present on the transition frame `159` while the card is still fading in, so it
  is the resting composition and not a mid-animation state. This is the second
  surface a viewer sees and it is gated before the first spin, so every stream
  opens on it.
- Where fixable: `frontend/src/lib/components/IntroSplash.svelte:125-130` (not
  locked). CORRECTED: the file named here previously, `IntroRules.svelte`, does
  not exist. The real cause is `.intro-continue`, which is `position: sticky`
  (`:126`), `bottom: 0` (`:127`) and `align-self: center` (`:130`). Because it is
  centred rather than stretched it is a pill narrower than the card, so the copy
  scrolls past it on both sides. The comment at `IntroSplash.svelte:128` shows the
  case was half-anticipated: *Opaque, because card content scrolls underneath this
  button.* The opaque background covers what is BEHIND the button and nothing
  covers what is BESIDE it. Worth handing to the tracker: the R14 note at
  `IntroSplash.svelte:52-65` documents this exact `400x225` viewport and fixed
  reachability by pinning this button, so the fix that made the button reachable
  is what now hides the copy.
- Proposed fix: make the sticky element a full-width footer row that carries the
  opaque background, with the button centred inside it, rather than a centred
  pill; that is, replace `align-self: center` with a stretched wrapper.

## STC-POPOUTS-A-02 STREAM Paytable copy is sliced through the middle of its glyphs by the scroll clip on five of the seven paytable frames in this range

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/176_popout-s_paytable_top.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/178_popout-s_paytable_02_ways_to_win.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/179_popout-s_paytable_03_symbol_payouts.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/180_popout-s_paytable_04_rules.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/182_popout-s_paytable_06_bet_modes.png`
- Claim: the paytable modal spans `y=0..215`, its fixed header band runs `y=0..100`
  and the scrolling content region runs `y=101..213`, with the panel's bottom
  border on rows `214..215`. The header therefore takes **101 of 216 panel pixels,
  46.8 per cent**, to carry a `PAYTABLE` title measuring only `x=45..210,
  y=40..55` and a close control at `x=318..355, y=30..66`: rows `0..29` above the
  control and rows `67..100` below the group are empty, so **64 px of the 225 px
  viewport height is header padding**. What is left for content is 113 px, and it
  is not enough for a single section, so the clip at `y=213` lands inside a line
  of type rather than between lines. Measured text-pixel counts per row
  immediately above the clip, which is what a cut line looks like:
  `176` rows `206,207,208` = `6,6,15` then nothing (the cyan line `All matching
  symbol positions count,` beheaded);
  `178` rows `210,211,212` = `7,13,18` then nothing (the caption `which is a match
  read left to right from reel 1. Reels 4` cut through the ascenders);
  `179` rows `205..213` = `24,27,21,21,23,21,21,30,58`, a full-height line running
  straight into the clip (the second symbol's name label, while its sibling card's
  label `WILD` renders complete, so two cards on one row are cropped at two
  different points of their own layout);
  `180` rows `206..212` = `96,27,18,22,23,17,20` then clipped (the third rule,
  `number of ways times your bet`);
  `182` row `212` = `22` then clipped (the `COST` value under `1x`).
  For contrast, frame `177` is clean: its text ends at `y=192` and rows `211..213`
  carry the content card's own bottom border, which is what the other five should
  look like. Frame `181` clips differently but no better: the Overdrive table
  stops after the `3` and `4` scatter rows with the panel border drawn under them,
  so the 5-scatter row is missing while the surface reads as complete. There is no
  fade, no scroll shadow and no visible scrollbar at any of these cuts, so the
  frame reads as a broken render rather than as scrollable content.
  (Count corrected by this run: five of the SEVEN paytable frames in range are
  sliced through glyphs, not five of eight. The seven are `176` through `182`;
  `177` is clean and `181` truncates at a row boundary. Sections `07` to `09` are
  frames `183` to `185` and belong to another squad.)
  **The source confirms the measured arithmetic, and names the root cause.**
  `frontend/src/lib/components/PaytableModal.svelte:544-552` sizes the panel
  `height: 92%` with `max-height: 662px` (`:549`), so 207 px here, centred, giving
  a panel from `y≈9`. `.fs-pt-head` at `:566-573` keeps `padding: 18px 26px`
  (`:570`) unchanged at every size around a 38 px close control (`:584`),
  predicting that control at `y=29..67` against a measured `y=30..66`; the body
  then picks up `padding: 14px 16px 20px` from `:798`, predicting first content at
  `y=100` against a measured `y=101`. Both predictions land within one pixel.
  **The root cause is that the file branches only on WIDTH.** Its only media
  queries are `@media (max-width: 420px)` at `:760` and `@media (max-width: 500px)`
  at `:797`, both of which fire at 400 px wide, and there is no height query
  anywhere in the file: the sole `max-height` in it is the fixed `662px` at
  `:549`. A 225 px viewport therefore gets a header sized for a 662 px one.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:566-573` and
  `frontend/src/lib/components/PaytableModal.svelte:797-798` (not locked).
  CORRECTED: the file named here previously, `PayTable.svelte`, does not exist,
  and neither `.paytable-header` nor `.paytable-body` appears anywhere in the
  component tree.
- Proposed fix: add a `@media (max-height: 400px)` branch beside the two existing
  width branches, cutting `.fs-pt-head` padding to about `8px 16px` and dropping
  `.fs-pt-title` from its `1.35rem` (`:575`); and land section anchors on a line
  boundary so a clipped line is never left half-drawn.

## STC-POPOUTS-A-03 HIGH The splash hero mark sits 1 px from the top edge with 34 px of empty frame below it

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/158_popout-s_splash.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/157_popout-s_transition_splash_entrance.png`
- Claim: on frame `158` the logo mark's bright pixels occupy `y=1..190`. Row `0`
  is empty and row `1` already carries 14 bright pixels spanning `x=152..238`, so
  the top of the mark clears the viewport edge by a single pixel while the bottom
  clears it by 34. The mark's vertical centre is `y=95.5` against a viewport
  centre of `y=112.0`, so the hero of the first surface a viewer sees is **16.5 px,
  7.3 per cent of the frame height, above optical centre**, with a third of the
  lower frame dead. Horizontal placement is by contrast exact: the same bright-pixel
  bbox is `x=109..290`, centre `199.5`, which is the viewport centre to the pixel.
  The asymmetry is therefore in one axis only and reads as an unscaled fixed
  height rather than a design choice. On a stream overlay that crops even a few
  rows off the top, this logo loses its arc.
  Derivable from the specification without the frame at all, per (l.1):
  `frontend/src/lib/components/HeroSplash.svelte:91-94` declares `.emblem-stage`
  as `width: min(62vw, 380px)` (`:93`) with `aspect-ratio: 1 / 1` (`:94`), and
  `.ring-glow` at `:99-101` extends that by `inset: -8%` to `116%`. At a 400 px
  width that is **62 per cent of 400 = 248 px square, in a 225 px viewport**: the
  stage is 23 px taller than the frame before the glow is counted. There is no
  height clamp anywhere in the file, whose only media query is
  `@media (prefers-reduced-motion: reduce)` at `HeroSplash.svelte:154`.
- Where fixable: `frontend/src/lib/components/HeroSplash.svelte:91-94` (not
  locked)
- Proposed fix: clamp the stage on both axes, for example
  `width: min(62vw, 62dvh, 380px)`, so the mark is bounded by whichever dimension
  is scarcer and stays optically centred.

## STC-POPOUTS-A-04 STREAM The HUD menu is cut off by the top edge, and its first item is entirely off-screen and unreachable

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/173_popout-s_hud_menu.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/172_popout-s_transition_menu_opening.png`
- Claim: on frame `173` the menu panel spans `x=45..245` and `y=0..177`. At
  `x=150` the panel's own fill colour is already present at `y=0` (pixel
  `(6,8,19)` at `y=0`, `(13,13,25)` at `y=3`), with no top border stroke and no
  rounded corner anywhere along the top, whereas the panel plainly has both on the
  surfaces where it fits. The panel's top edge and its corner radius are therefore
  off-screen: it is a dropdown that has run out of room and been truncated rather
  than resized. The first row `Session` is also the only one of the five that
  carries no divider above it, which is what the clipped top edge looks like from
  the inside. At the bottom the same column reads panel fill at `y=177`, then
  `(50,50,59)` at `y=178` and the HUD bar's bright top edge `(183,190,192)` at
  `y=179`, so the gap between the menu and the bar it belongs to is **zero
  pixels**. A 178 px panel in a 225 px viewport, flush against one edge and
  welded to the furniture at the other, is the single most cramped composition in
  this run.

  **ESCALATED TO STREAM BY THE SOURCE READ, and this is the part that matters.**
  What is clipped is not a border, it is a control. The menu `popout-s` renders is
  the `m-` profile at `frontend/src/lib/components/HudOverlay.svelte:545-575`,
  confirmed as the Popout S profile by the comment at `HudOverlay.svelte:1621-1622`
  (*at Popout S the speed control lives ONLY in this menu*). That markup declares
  **six** items in this order: `Paytable` (`:546`), `Session` (`:547`), the turbo
  row (`:556`), auto (`:565`), `MAX BET` (`:569`), `Mute` (`:574`). **Frame `173`
  shows five.** The measured label rows are `y=15..24`, `49..59`, `84..92`,
  `116..124`, `149..158`, reading `Session`, `Speed`, `AUTO`, `MAX BET`, `Mute`.
  The one missing is the FIRST in markup order, and the measured item pitch is
  33.5 px, so `Paytable`'s label lands at about `y=-18..-9`, entirely above the
  frame. That also explains the observation above that `Session` carries no
  divider: the divider belongs to the item that is off-screen.
  It cannot be scrolled to either. `.hud-menu` at `HudOverlay.svelte:1598-1608` is
  `position: absolute` with `bottom: calc(100% + 8px)` (`:1600`) and
  `overflow: hidden` (`:1606`) and **no `max-height`**, so the panel grows upward
  without a clamp and what leaves the viewport is silently discarded rather than
  made reachable. `.m-hud-menu` at `:1115` sets `bottom: 44px`, which matches the
  measured HUD bar top edge at `y=181` exactly.
  A control that is present in the DOM, invisible and unreachable is worse than an
  absent one, and this one is the paytable: the surface a streamer is most often
  asked to open on air.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1598-1608` (not
  locked). CORRECTED: the selector named here previously, `.menu-popover`, does
  not exist anywhere in the component tree, and neither does the `max-height: 60vh`
  attributed to it; `.hud-menu` has no `max-height` at all, which is the actual
  defect.
- Proposed fix: add `max-height: calc(100dvh - 44px - 16px)` and `overflow-y: auto`
  to `.hud-menu`, so the panel clamps to the viewport and scrolls its overflow
  instead of losing it, keeping its border and a visible top margin.

## STC-POPOUTS-A-05 HIGH The session panel keeps 20 px side margins and none at all top or bottom, so its frame is cut on two edges

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/174_popout-s_session_panel.png`
- Claim: the panel's border stroke sits at `x=20` and `x=379`, giving **20 px of
  margin on the left and 20 px on the right**, which is clearly the intended
  symmetric inset. Vertically there is no inset at all: at `x=200` the panel's
  fill runs from `y=0` to `y=224` with no horizontal border stroke at either end,
  and the only border pixels near the edges are the tips of the corner arcs, at
  `y=0` (`x=26` and `x=373`) and `y=224` (`x=26` and `x=373`). The top and bottom
  borders are off-screen and the four rounded corners are sliced. Inside the
  panel the rhythm is otherwise good and should not be disturbed: the five data
  rows sit at `y=81, 109, 136, 164, 191`, a pitch of 28, 27, 28, 27, reading
  `Time played 00:00:21`, `Spins 5`, `Total wagered $5.00`, `Total won $20.10`,
  `Net result +$15.10`. The defect is purely that a modal inset 20 px
  horizontally is inset 0 px vertically at `400x225`.
- Where fixable: `frontend/src/lib/components/SessionPanel.svelte:178-180` (not
  locked). CORRECTED: there is no `.session-panel` CSS rule and no
  `min(520px, calc(100vw - 40px))` in the file; `session-panel` appears only as a
  modal key at `:51` and a testid at `:83`. The real rule is `.sp-sheet`, and it
  predicts the measurement exactly: `width: min(90vw, 360px)` (`:179`) gives
  **360 px at a 400 px viewport, matching the measured `x=20..379` to the pixel**,
  with `padding: 20px 22px` (`:180`) and **no `max-height` and no `overflow`**,
  inside a backdrop that centres with `align-items: center` (`:174`). One axis is
  clamped against the viewport and the other is not.
- Proposed fix: add `max-height: calc(100dvh - 2rem)` and `overflow-y: auto` to
  `.sp-sheet` so the same inset applies on both axes and the border closes on all
  four sides at any viewport.

## STC-POPOUTS-A-06 MEDIUM The HUD menu's `Speed` row does not share a left edge with the other four rows

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/173_popout-s_hud_menu.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/172_popout-s_transition_menu_opening.png`
- Claim: measured left edge of each menu label on frame `173`: `Session` `x=62`,
  `Speed` `x=90`, `AUTO` `x=62`, `MAX BET` `x=62`, `Mute` `x=62`. Four of the five
  items align on `x=62` and the fifth starts **28 px to the right of them**,
  because `Speed` alone carries a leading icon (occupying roughly `x=66..78`) that
  is laid out before the label instead of in a reserved gutter. The icon itself
  does not align with `x=62` either, so the row aligns with nothing. The
  inconsistency compounds: `Mute` also carries an icon but places it *after* the
  label at `x=108..116`, so one menu of five items uses a leading icon, a trailing
  icon and no icon at all, and the only column edge in the panel is broken by the
  one row that leads. Vertical rhythm is by contrast fine and should be left
  alone: label rows at `y=15..24, 49..59, 84..92, 116..124, 149..158`, a pitch of
  34, 35, 32, 33.
  **The source gives the 28 px exactly, which is what makes this mechanical rather
  than a matter of taste.** `.hud-menu-item` at
  `frontend/src/lib/components/HudOverlay.svelte:1609-1618` has
  `padding: 0.5rem 0.9rem` (`:1611`), so a plain row's label starts 14.4 px inside
  the panel. `.m-turbo-item` at `:1631-1635` adds `display: flex` with
  `gap: 0.5rem` (`:1634`) in front of a `.m-turbo-bolt` of `width: 20px` (`:1637`),
  so that row's label starts at `14.4 + 20 + 8 = 42.4 px`. **The predicted
  difference is 28.0 px and the measured difference is 28 px.**
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1609-1637` (not
  locked). CORRECTED: the selector is `.hud-menu-item`, not `.menu-item`, which
  does not exist; and it is not a flex row with `gap: 10px`, it is a `display:
  block` row at `:1610` whose turbo sibling alone is made flex at `:1632`. That
  distinction is the fix: the plain rows have no icon column to inherit.
- Proposed fix: give every `.hud-menu-item` a fixed-width leading icon slot (a
  28 px `::before` gutter, or `padding-left` on the plain rows matching the turbo
  row) so labels share one left edge whether or not their row has an icon, and
  settle on one side for icons across the menu.

## STC-POPOUTS-A-07 MEDIUM The big-win banner is a full-bleed band that bisects the reel machine

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/169_popout-s_transition_bigwin_countup_early.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/170_popout-s_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/171_popout-s_bigwin_settled.png`
- Claim: the banner is a horizontal band with no left or right terminus. Measured
  at the extreme columns of the frame, the band's wash is present at `x=5` from
  `y=47` and at `x=398` from `y=47`, running to about `y=128` in both cases, so it
  reaches both viewport edges and is cut by them rather than ending in a shape.
  Its 82 px of height is **36 per cent of the frame**, and it lands across the
  middle of the reel window, whose neon border spans `y=15..166` (measured on
  frame `162`). The result on frames `170` and `171` is that the grid survives
  only as a strip of one symbol row above the band and a sliver below it, and the
  win-line readout in that lower sliver is reduced to an unreadable smear of
  type. The celebration surface and the surface it is celebrating cannot both be
  seen. Recorded beside it, from this run's independent viewing: the band's
  interior wash also differs between `169` and `170`, a dark circular vignette
  behind `$10.27` on the first and a flat opaque field behind `$16.20` on the
  second, and the amount is set visibly larger on `170` and `171`. The band's
  GEOMETRY does not move between the frames (see the signed absence below), so
  this is the count-up glow and punch rather than a layout jump, and it is noted
  here rather than raised. This is a composition claim about the band's shape and
  extent; the separate defect that the band's figure disagrees with the HUD figure
  at the same instant is already tracked and is recorded under KNOWN below.
- Where fixable: `frontend/src/lib/components/WinBanner.svelte:342-352` (not
  locked). CORRECTED TWICE, and both corrections are kept. This entry first named
  `.win-banner` at `:322`, which does not exist; a later pass then correctly
  refused to guess a line and left it unstated. **The rule has now been opened and
  read**, so the citation stands on the file rather than on inference: the class
  is `.big-win-banner`, not `.win-banner`, applied at `WinBanner.svelte:243` in
  the list `c1-win big-win-banner tier-{tier}`, and its rule block at `:342-352`
  is `position: absolute` (`:343`), `left: 0` (`:344`), `right: 0` (`:345`),
  `top: 310px` (`:346`), `transform: translateY(-50%)` (`:347`),
  `width: 100%` (`:348`). It is full bleed by construction and pinned to a
  hardcoded `310px` offset. The file's only short-viewport branch,
  `@media (max-width: 500px)` at `:513`, adjusts type sizes and `.fs-face`
  padding and **never touches `left`, `right`, `width` or `top`**, so the band
  stays full bleed and at that fixed offset at every width. That the offset is a
  hardcoded pixel value against a scaled stage is the reason the band lands where
  it does at `225px`, and it is the thing to change if the marshal rules the
  full-bleed treatment is not deliberate.
- Proposed fix: PARK(the banner's shape at short viewports is an art call, and it
  interacts with the count-up reconciliation already parked under MID-01, so it
  should be decided with that rather than separately). The options are to inset
  and round the band so it reads as a card over the reels, or to shrink its height
  at short viewports so at least two symbol rows stay visible.

## STC-POPOUTS-A-08 MEDIUM The two HUD readout pods use different label-to-value gaps, and the gap between the pods barely exceeds them

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/162_popout-s_base_idle.png` (measured; the same bar renders unchanged in frames `163` to `171`)
- Claim: element runs along the HUD bar on frame `162`, measured across rows
  `186..214` and stable across three thresholds: `BAL` `x=88..104`, `$50K`
  `x=121..156`, `WIN` `x=177..191`, `$0.00` `x=202..239`. That gives a
  label-to-value gap of **16 px inside the balance pod** and **10 px inside the
  win pod**, a 60 per cent difference between two instances of the same pattern,
  while the gap separating the two pods is only **20 px**. The separator is
  therefore just 4 px wider than the wider of the two internal gaps, so proximity
  does not group the pods and the bar reads as four loose items rather than two
  pods. At 400 px of bar width there is no room for the eye to recover the
  grouping from anything else.
  **The mechanism, which is why the two differ despite a single declaration.**
  `.m-stat` at `frontend/src/lib/components/HudOverlay.svelte:1119-1126` sets one
  `gap: 4px` (`:1125`) for both pods, but `.m-stat-value` at `:1132-1133` is
  `flex: 1 1 auto`, so the value box absorbs the pod's slack, and the two pods are
  given DIFFERENT slack on purpose: `.m-stat--balance { flex: 1.15 1 0; }`
  (`:1179`) against `.m-stat--win { flex: 1 1 0; }` (`:1180`). The wider pod's
  value therefore drifts further from its label. The declared gap is identical and
  the rendered gap is not, which is exactly what the frame shows.
  **THE SLACK ONLY BECOMES A VISIBLE GAP BECAUSE THE TEXT IS CENTRED IN IT, AND
  THAT CENTRING IS THE SAME Q-27 SCAFFOLD RULE AS FINDING 10.** A value box that
  absorbs slack does not by itself move the ink: left-aligned text would still
  start at the box's leading edge and the rendered gap would be the declared `4px`
  in both pods. It drifts because the text is CENTRED inside the grown box.
  `.m-stat-value` declares no `text-align` of its own, and a grep of
  `frontend/src/lib/components/HudOverlay.svelte` returns `text-align` only at
  `:1182`, `:1343`, `:1541`, `:1616`, `:1706` and `:1795`, none of which is an
  ancestor of these two pods. The alignment is therefore inherited, and it is
  inherited from the Vite scaffold block `#app { ... text-align: center; }` at
  `frontend/src/app.css:139-144`, the same `app.css:143` that finding 10 traced.
  The arithmetic corroborates it rather than merely being consistent with it:
  centred ink predicts a gap of `4 + (box - ink) / 2`, so the measured `16px` and
  `10px` imply value boxes of `59px` and `49px`, a ratio of `1.204` against the
  declared flex weighting of `1.15` (`:1179` against `:1180`), agreeing to within
  the difference between ink width and box width. Left alignment predicts equal
  gaps and is refuted by the frame.
  **Findings 08 and 10 therefore have ONE root cause**, and it is the tracked
  scaffold remnant, not two independent layout mistakes in two components.
- Where fixable: `frontend/src/app.css:143` (not locked), with
  `frontend/src/lib/components/HudOverlay.svelte:1132-1133` as the defensive
  second site. CORRECTED: there is no `.readout` selector in the file.
- Proposed fix: remove the scaffold `#app` block from `app.css`, which is Q-27's
  own fix and simultaneously resolves finding 10; then, because the HUD should not
  depend on what an ancestor happens to inherit, set `text-align: start` on
  `.m-stat-value` so the rendered gap equals the declared `gap: 4px` in both pods,
  and raise the inter-pod gap to at least twice it. **Re-proof note for the
  marshal:** removing one line in `app.css` changes three surfaces at once, the
  paytable rules, both HUD readouts and anything else inheriting it, so it is
  re-proofed from fresh frames across the whole capture set rather than from these
  two, per audit method 2.2.

## STC-POPOUTS-A-09 MEDIUM The paytable's gold accent bar aligns with no edge of the panel it decorates

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/176_popout-s_paytable_top.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/177_popout-s_paytable_01_match_symbols_on_adjacent_reels_st.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/180_popout-s_paytable_04_rules.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/181_popout-s_paytable_05_overdrive_free_spins.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/182_popout-s_paytable_06_bet_modes.png`
- Claim: the gold rule at the left of the paytable is pure `(255,215,0)` and
  occupies `x=18..21, y=26..199`, identically on every paytable frame in this
  range. Every edge it could relate to is somewhere else: the panel runs
  `y=0..215`, the title cap-height runs `y=40..55`, the close control runs
  `y=30..66`, and the content card's top border is at `y=101` with the content
  clip at `y=213`. So the bar starts 26 px below the panel top, 14 px above the
  title, and ends 16 px above the panel bottom and 14 px above the content clip.
  It is a decorative rule that shares a start or end with nothing on the surface,
  which at this viewport is the most conspicuous vertical line in the modal.
  **The derivation matches the measurement on all three figures.**
  `frontend/src/lib/components/PaytableModal.svelte:563` declares the rail as
  `.fs-pt-panel .fs-rail { top: 16px; bottom: 16px; width: 4px; }`. Against a panel
  of `height: 92%` (`:548`), which is 207 px here and so spans `y≈9..216`, that
  predicts `y=25..200` and a width of 4 px. **Measured: `x=18..21` (4 px) and
  `y=26..199`.** One pixel on each end.
  So the inset is not in percent and the rail is not mispositioned against its own
  box; it is anchored perfectly to a box the eye cannot see. That is the defect.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:563` (not
  locked). CORRECTED: `PayTable.svelte` does not exist, and the inset is a fixed
  `16px`, not a percentage.
- Proposed fix: anchor the bar to the panel's inner content box so its top and
  bottom land on real edges, most usefully the title cap-height at `y=40` and the
  content clip.

## STC-POPOUTS-A-10 MEDIUM The paytable rules list centres its text while leaving the bullet marker hard left, so the marker is orphaned and the two rules surfaces disagree

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/180_popout-s_paytable_04_rules.png`, compared against `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/160_popout-s_intro_rules.png`
- Claim: on frame `180` the `RULES` list draws a `>` style marker hard against the
  left of the content card while the text of each rule is centre-aligned in the
  card. The first rule renders as `Wins pay left to right on adjacent reels`
  followed by a centred continuation `starting from reel 1.`, so the wrapped line
  does not align with the line above it and neither line aligns with the marker,
  which is left sitting beside white space. Frame `160`, one surface away in the
  same game, renders the same bullet pattern the correct way: left-aligned text
  whose first line starts immediately after the marker and whose wrapped lines
  return to a common left edge (`all later w`, `ing the`, `feature.` all resume at
  the card's text inset). The same list pattern is therefore composed two
  different ways in one title, and the paytable's version is the one that reads as
  unfinished.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:668-669` (not
  locked). CORRECTED: `PayTable.svelte` does not exist. The real rules are
  `.fs-rules li { font-size: 0.84rem; ...; padding-left: 16px; position: relative; }`
  (`:668`) and `.fs-rules li::before { content: '›'; position: absolute; left: 0; }`
  (`:669`). Neither `.fs-rules` (`:667`) nor its `li` sets any `text-align`, so the
  centring is inherited from an ancestor while the marker is pinned absolutely to
  `left: 0` of the item: the marker cannot follow text it is not laid out with.
- Proposed fix: set `text-align: left` on `.fs-rules li` at
  `PaytableModal.svelte:668`, so the copy starts at the same left edge the marker
  hangs from. This matches the intro card, whose `.intro-rules` is already
  `text-align: left` at `IntroSplash.svelte:97`, which is why the two surfaces
  disagree today.

## STC-POPOUTS-A-11 MEDIUM The on-board win callout is drawn over symbol art and across its own win line, with no plate and no clearance

- Frames: `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/168_popout-s_win_presentation.png`
- Claim: the standard win presentation draws a `WIN!` callout at roughly the
  centre of the 5x4 grid, directly on top of a symbol tile and across the cyan
  win-line polyline that passes through the same cell, with no backing plate, halo
  or clearance behind the type. At `400x225` the callout is set smaller than the
  HUD's own `WIN` label in the bar below it (`WIN` at `x=177..191` on frame `162`,
  the same bar), so the element that exists to announce the win is the smallest
  instance of that word on screen and it is the only one competing with artwork
  behind it. The HUD reads `WIN $3.90` at the same moment, which is legible; the
  callout is not.
- Where fixable: UNKNOWN
- Proposed fix: give the callout a backing plate or a minimum size at short
  viewports, and offset it clear of the win-line path.

## Explicit absences, signed

Each of these was measured on the frames named, not assumed, and each was
re-checked by eye in this run's independent pass over all 26 frames.

- **No element collides with or is cut by the LEFT or RIGHT viewport edge on any
  of the 26 frames.** Every clipping defect found in this run is on the vertical
  axis. Checked by locating the outermost border stroke or content run on each
  surface: base HUD content `x=4..394` on `162` (4 px left, 5 px right); rules
  card `x=16..384` on `160`; paytable panel `x=16..383` on `176`, `178`, `182`;
  session panel border at `x=20` and `x=379` on `174`; menu panel `x=45..245` on
  `173`.
- **The reel window is not off-centre.** On frame `162` its neon border spans
  `x=86..313`, centre `199.5`, which is the viewport centre exactly; and
  `y=15..166`, centre `90.5`, which is the exact centre of the `y=0..181` area
  above the HUD bar. Side margins 86 and 86, top and bottom margins 15 and 15.
  There is no centring finding here and I looked for one.
- **The splash mark is not off-centre horizontally.** Bright-pixel bbox `x=109..290`
  on frame `158`, centre `199.5`. The finding at A-03 is the vertical axis only.
- **Modal side insets are symmetric everywhere I could measure them.** Session
  panel 20 and 20, paytable 16 and 16, rules card 16 and 16. The asymmetric-padding
  category yields nothing on the horizontal axis in this run.
- **Vertical rhythm inside panels is even.** Session panel data rows at
  `y=81, 109, 136, 164, 191` (pitch 28, 27, 28, 27); menu labels at
  `y=15, 49, 84, 116, 149` (pitch 34, 35, 32, 33). No irregular-spacing finding.
- **No adjacent-frame layout jump found in the base and win run.** Compared `162`
  against `163`, `164`, `165`, `166`, `167` and `168`, and `169` against `170` and
  `171`: the reel window, the HUD bar and the banner band hold the same
  coordinates throughout, and the banner band's vertical extent differs by one
  pixel between `169` (`y=47..128` at `x=398`) and `171` (`y=47..127`), which is
  count-up glow and not a layout change. The interior wash and type size of the
  banner do change between `169` and `170`, which this run looked at again
  specifically: the band does not move, so it is the count-up punch and it is
  recorded inside A-07 rather than raised as a jump. The only other element that
  changes appearance between adjacent frames is the `Speed` row's lightning icon,
  bright on `172` and dim on `173`; `172` is captured mid-open per the manifest,
  so this is attributable to the open animation and I am not raising it.
- **The large background regions either side of the reel window are not dead
  space.** They carry the scene art (the car and the city) at full detail on
  `161` through `171`, so they read as the composition's backdrop rather than as
  unfinished surface. I looked specifically for an unfinished read and did not
  find one.
- **The HUD bar is crowded but nothing in it collides or overlaps.** Ten controls
  sit in 400 px on `162` and its siblings through `173`: settings, menu, the two
  readout pods, bet down, `$1.00`, bet up and spin. Every pair clears every other
  and the row's baselines agree. The grouping defect is real and is raised at
  A-08; simple crowding is not a finding here and I am signing that.
- **The paytable header's title and close control are aligned to each other.**
  Title cap-height `y=40..55`, centre `47.5`; close control `y=30..66`, centre
  `48.0`. Half a pixel apart, so there is no baseline finding between them. The
  header defect at A-02 is its height, not its internal alignment.
- **No frame in this range shows the replay ghost pod (TR-114) or any autoplay
  panel**, so neither surface could be judged here.
- **TR-104 could not be evidenced from this session.** The banner on `169`, `170`
  and `171` renders `BIG WIN` in English on an English session, which is correct
  here. That row needs the `de` and `ar` sessions.

Two observations recorded out of lens, so the squad that owns them does not have
to rediscover them cold. Neither is raised as a composition finding.

- **Mixed casing inside one menu.** Frames `172` and `173` render `Session`,
  `Speed` and `Mute` in sentence case beside `AUTO` and `MAX BET` in full caps, in
  the same five-item list. That is the charter's cross-surface capitalisation
  class, not composition.
- **Three consecutive dead spins show what looks like the same board.** Frames
  `165`, `166` and `167` are captured as three separately settled spins and their
  symbol grids read identically. That is a capture or content question rather than
  a layout one.

## KNOWN matches

- KNOWN(MID-01): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/169_popout-s_transition_bigwin_countup_early.png` shows the banner reading `$10.27` while the HUD `WIN` pod at the same instant reads `$15.94`, on a win that settles at `$16.20`; `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/171_popout-s_bigwin_settled.png` shows both at `$16.20`. The ledger predicts exactly this pair for popout-s, and the frames carry it.
- KNOWN(MID-02): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/169_popout-s_transition_bigwin_countup_early.png`, `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/170_popout-s_transition_bigwin_countup_late.png` and `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/171_popout-s_bigwin_settled.png` all render the banner unit as `16x BET` with a letter `x`.
- KNOWN(Q-26): **PARTLY WITHDRAWN BY THIS RUN. Read this before acting on it.** An
  earlier state of this shard reported that
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/181_popout-s_paytable_05_overdrive_free_spins.png`
  renders the instant-award column with a letter `x` (as `1x` and `3x`), against
  the proper `×` on
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/160_popout-s_intro_rules.png`.
  **That claim is wrong and is withdrawn.** The source is
  `frontend/src/lib/components/PaytableModal.svelte:95`, which builds that row as
  `{ scatters: 3, spins: 8,  award: '1×' }`: it is already U+00D7. At `400x225`
  the multiplication sign is only a few pixels tall and reads as a letter `x` in
  the frame. This was a rendering artefact of the viewport being read as a
  codepoint difference, which is precisely the (l.2) failure of letting
  measurement discover rather than confirm, and it is recorded rather than
  silently deleted.
  What remains OPEN and unconfirmed: the `COST` column on
  `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/182_popout-s_paytable_06_bet_modes.png`
  renders as `1x` beside a max win that is certainly `×`
  (`FS_MAX_WIN_LABEL = '5,000×'`, `frontend/src/lib/config/fsModes.ts:139`). The
  cost is stored as a NUMBER, not a string (`cost: 1.0` at
  `frontend/src/lib/config/fsModes.ts:73`), so its suffix is composed in a template
  this run did not locate within its source budget. **The glyph there is NOT
  KNOWN**, and per (l.3) it is left as a question for the marshal rather than
  asserted either way: check the template that appends the cost suffix, and if it
  is an ASCII `x` it is a genuine Q-26 survivor on the same card as a `×`.
- KNOWN(TR-115 / TR-086): `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/162_popout-s_base_idle.png` shows the balance pod abbreviating to `$50K` while the win pod in the same bar shows full precision `$0.00`, and `/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/171_popout-s_bigwin_settled.png` shows `BAL $50K` beside `WIN $16.20`. Nothing is clipped or ellipsised, so this is the abbreviate mechanism working rather than failing, recorded here as evidence for the shared fit-or-abbreviate mechanism mapped to JOB 3 rather than as a new finding.

tree_after:

```
?? reports/qa/stream_test/shards/STC-DESKTOP-A.md
?? reports/qa/stream_test/shards/STC-DESKTOP-B.md
?? reports/qa/stream_test/shards/STC-LAPTOP-A.md
?? reports/qa/stream_test/shards/STC-LAPTOP-B.md
?? reports/qa/stream_test/shards/STC-MOBILEL-A.md
?? reports/qa/stream_test/shards/STC-POPOUTL-A.md
?? reports/qa/stream_test/shards/STC-POPOUTL-B.md
?? reports/qa/stream_test/shards/STC-POPOUTS-A.md
?? reports/qa/stream_test/shards/STC-POPOUTS-B.md
```

Nine untracked shards, mine and eight other squads'. **Nothing is MODIFIED and
nothing is DELETED**, so no tracked file in the repository was touched by this
run. The only file this run wrote is its own shard at
`reports/qa/stream_test/shards/STC-POPOUTS-A.md`.

---

# STC-POPOUTS-A, SECOND INDEPENDENT PASS (composition, popout-s, frames 157 to 182)

**Why this is appended and not a replacement.** This pass opened all 26 frames
itself and measured them itself. When it went to write, the file at this path was
being actively written by another process (21,018 bytes at 23:12, 37,842 at 23:18,
38,381 at 23:19). Clobbering a live writer would have destroyed a complete shard
mid-write, so this pass follows the ledger's own conflict rule, multi-track
protocol rule 8: resolve by concatenation, never by discarding a section. Findings
above are the first writer's and keep their numbers 01 to 11. Findings below are
this pass's and start at 12 so nothing collides. Both passes cover the same 26
frames and the same lens; where they overlap, this pass's independent measurements
are recorded under "Corroboration" rather than as new ids.

scope: `popout-s` frames 157 to 182 inclusive, 26 frames, viewport `400x225`.
frames_read: 26

**Measurement method.** PNGs decoded in memory by an inline zlib reader inside a
single shell process. Nothing was written to disk while measuring and no project
script was run. Coordinates are zero-based, so the viewport is `x 0..399, y 0..224`.

## STC-POPOUTS-A-12 HIGH The paytable header and its body use different horizontal padding at this viewport, so the heading sits 11 px inside the card edge below it

- Frames: `reports/screens/stream-test-2026-07-28/177_popout-s_paytable_01_match_symbols_on_adjacent_reels_st.png`,
  `reports/screens/stream-test-2026-07-28/176_popout-s_paytable_top.png`,
  `reports/screens/stream-test-2026-07-28/182_popout-s_paytable_06_bet_modes.png`
- Claim: measured on frame `177`, the dialog's left furniture (the amber accent
  rail) occupies `x 16..21` and the dialog's right border is at `x = 382`. The
  content card inside has borders at `x = 34` and `x = 364`, so the card is inset
  `18 px` left and `19 px` right and is symmetric to a pixel of border width. The
  heading `PAYTABLE` begins at `x = 45`, which is `11 px` inside the card's own
  left border directly beneath it. The mechanism is in the source and it is a
  one-sided override: `.fs-pt-head { padding: 18px 26px; }` at
  `frontend/src/lib/components/PaytableModal.svelte:570` is never overridden,
  while `.fs-pt-body { padding: 20px 30px 30px; }` at `:595` IS overridden to
  `padding: 14px 16px 20px;` by the `@media (max-width: 500px)` block at
  `:794-798`. Below 500 px the body pulls in to 16 and the header stays at 26, a
  `10 px` split, which is the `11 px` measured allowing for the border and the
  glyph bearing. Above 500 px the two are 26 against 30 and the defect is
  invisible, which is why it survives: it only exists at popout widths.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:794-798` (the
  `@media (max-width: 500px)` block), against `:570` and `:595`.
- Proposed fix: add `.fs-pt-head { padding: 14px 16px; }` to the same media block
  so the header tracks the body at popout widths.

## STC-POPOUTS-A-13 MEDIUM The two symbol cards in one paytable row put their labels on different baselines

- Frames: `reports/screens/stream-test-2026-07-28/179_popout-s_paytable_03_symbol_payouts.png`
- Claim: the `SYMBOL PAYOUTS` section shows two cards side by side. The left
  card's label `WILD` has its first ink row at `y = 204` and the right card's
  label at `y = 212`, an `8 px` step. The step is stable across detection
  thresholds 60, 90, 120 and 150, so it is not a measurement artefact. The
  artwork steps with it: left art first ink row `y = 135`, right `y = 149`. The
  ART step is expected and is not the finding: `.fs-sym-card img` is a fixed box,
  `78px` square at `frontend/src/lib/components/PaytableModal.svelte:658` and
  `64px` square under `@media (max-width: 500px)` at `:800`, with
  `object-fit: contain`, so a wide symbol renders shorter and centres lower
  inside the same box. The LABEL step is the finding, because a fixed art box
  should put both labels on one baseline and does not. The visible cost is on the
  frame: `WILD` clears the bottom edge intact while the right card's label is the
  one that gets sliced.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:657-658` and
  `:800`. Recorded honestly: the fixed `img` box does not by itself explain an
  `8 px` label step, so the card that differs has something else in its column,
  and that is not yet located.
- Proposed fix: give the art slot an explicit fixed height in the card column and
  let the label sit on the flex baseline below it, so both cards resolve to the
  same two baselines whatever the symbol's aspect ratio.

## STC-POPOUTS-A-14 MEDIUM The reel window does not change across the frame labelled full speed and all three settled dead spins

- Frames: `reports/screens/stream-test-2026-07-28/164_popout-s_transition_reels_full_speed.png`,
  `reports/screens/stream-test-2026-07-28/165_popout-s_dead_spin_1_settled.png`,
  `reports/screens/stream-test-2026-07-28/166_popout-s_dead_spin_2_settled.png`,
  `reports/screens/stream-test-2026-07-28/167_popout-s_dead_spin_3_settled.png`,
  `reports/screens/stream-test-2026-07-28/163_popout-s_transition_reels_accelerating.png`
- Claim: comparing the reel window interior only (`x 95..300, y 22..165`,
  `29,315` pixels, tolerance 16 per channel), frame `163` to `164` differs by
  `43.17 per cent` of pixels, which is a reel in motion. Every comparison after
  that sits at or near the ambient glow floor: `164` to `165` `6.08 per cent`,
  `165` to `166` `3.24 per cent`, `166` to `167` `3.13 per cent`, and `164` to
  `167` `5.10 per cent`. So the grid shown at the moment the manifest calls
  `Reels at full speed` is already the grid all three dead spins settle on, and
  the three dead spins do not differ from one another beyond the glow pulse.
  Stated with its ambiguity per convention (l.6): either the capture replayed one
  round three times, in which case the three-spins half of this is a harness
  artefact, or three real spins produced an identical grid. The `164` half stands
  either way, because a frame labelled full speed should not be the settled board
  whichever round it belongs to.
- Where fixable: UNKNOWN
- Proposed fix: PARK(the capture harness's round feed must be checked first; the
  two readings have different fixes and the frames alone cannot choose).

## STC-POPOUTS-A-15 MEDIUM The reel window loses its cell backing during acceleration, so the scene reads through the grid

- Frames: `reports/screens/stream-test-2026-07-28/163_popout-s_transition_reels_accelerating.png`
- Claim: on the acceleration frame the left and centre of the reel window show
  the scene behind the reels instead of the dark cell backing that every other
  reel frame in this range carries: the car body and roadway in the lower left of
  the window, and a magenta building face near the middle, both continuous with
  the scene art outside the window. Compare
  `162_popout-s_base_idle.png`, `164_popout-s_transition_reels_full_speed.png`
  and `165_popout-s_dead_spin_1_settled.png`, where the same region is uniform
  dark backing. The window therefore goes see-through for part of the spin and
  opaque again by the next frame, which is a jump between two adjacent frames on
  every spin. Recorded as read from the frame by eye; the `43.17 per cent`
  difference measured in STC-POPOUTS-A-14 is consistent with it but does not on
  its own prove the cause.
- Where fixable: UNKNOWN
- Proposed fix: PARK(which layer owns the backing, the cell or the reel strip, is
  a layering decision and wants the owner's call, not a value change).

## STC-POPOUTS-A-16 MEDIUM Mixed casing inside one five-item menu column, and the split follows which strings are localised

- Frames: `reports/screens/stream-test-2026-07-28/173_popout-s_hud_menu.png`,
  `reports/screens/stream-test-2026-07-28/172_popout-s_transition_menu_opening.png`
- Claim: the visible menu reads, top to bottom, `Session`, `Speed`, `AUTO`,
  `MAX BET`, `Mute`. Three sentence-case items and two upper-case items in one
  column of five. The split is not random: `Session` is a hardcoded English
  literal at `frontend/src/lib/components/HudOverlay.svelte:547` and
  `Mute`/`Unmute` are hardcoded literals at `:575`, while `AUTO` and `MAX BET`
  come through `{$tr('autoPlay')}` at `:566` and `{$tr('betMax')}` at `:571`,
  whose values are upper-case. So the casing seam falls exactly on the boundary
  between the parked hardcoded strings and the localised ones. Compositionally
  the two upper-case rows carry no descenders and a uniform cap height, so the
  row rhythm reads differently above and below them even though the spacing is
  constant. This is not Q-34, which is about `Cruise` against `CRUISE` on four
  other surfaces, and it is a consequence of the Q-16 park rather than a
  separate cause.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:547` and `:575`
  (the hardcoded literals), against the `autoPlay` and `betMax` locale values.
- Proposed fix: pick one casing for menu items and apply it to all five when the
  Q-16 park is lifted; until then a `text-transform` on `.hud-menu-item` at
  `:1609-1618` makes the column consistent without touching the parked strings.

## STC-POPOUTS-A-17 MEDIUM The win breakdown strip inside the reel window is too small to resolve at this viewport and is stacked under the banner

- Frames: `reports/screens/stream-test-2026-07-28/170_popout-s_transition_bigwin_countup_late.png`,
  `reports/screens/stream-test-2026-07-28/171_popout-s_bigwin_settled.png`
- Claim: on the late count-up and the settled big win, a small win breakdown
  strip is drawn inside the reel window, low and centred, at a size where its
  characters do not resolve at `400x225`: a few pixels of glyph height in a
  `225 px` frame. It sits directly beneath the full-bleed big win band and inside
  the reel frame's lower chrome, so it is at once unreadable and competing with
  two other surfaces for the same strip of frame. A readout nobody can read is
  dead content occupying live space at the most-watched moment in the game.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte` (component
  identified by name; the specific rule was not opened, so the line is UNKNOWN).
- Proposed fix: hide the breakdown below a minimum viewport height rather than
  scaling it past legibility.

## STC-POPOUTS-A-18 LOW The splash entrance frame is indistinguishable from the settled splash

- Frames: `reports/screens/stream-test-2026-07-28/157_popout-s_transition_splash_entrance.png`,
  `reports/screens/stream-test-2026-07-28/158_popout-s_splash.png`
- Claim: the manifest describes frame `157` as `Splash mid-entrance, about 600ms after load`
  and `158` as the settled splash. Whole-frame comparison at a tolerance of 8 per
  channel finds `339` of `90,000` pixels differ, `0.377 per cent`, far below the
  ambient animation floor measured elsewhere in this same session: frames `161`
  and `162`, also a transition and its end state, differ by `10.262 per cent` on
  the identical measure. At 600 ms there is no entrance left to see. Recorded at
  LOW from the composition lens because it is an absence of motion rather than a
  layout defect; a motion or transition lens should take it.
- Where fixable: UNKNOWN
- Proposed fix: PARK(belongs to a motion lens, not this one).

## STC-POPOUTS-A-19 LOW A focus ring sits on the spin control during both spin transitions and not at rest

- Frames: `reports/screens/stream-test-2026-07-28/163_popout-s_transition_reels_accelerating.png`,
  `reports/screens/stream-test-2026-07-28/164_popout-s_transition_reels_full_speed.png`
- Claim: on both spin transition frames the spin control, showing its stop glyph,
  carries a square outline ring that is absent from
  `162_popout-s_base_idle.png` and `165_popout-s_dead_spin_1_settled.png`. The
  compositional cost is a stray hard-edged rectangle in the bottom right corner
  during exactly the two frames where the reels are moving. It is most likely a
  browser focus ring following the harness's synthetic click, so it may be a
  capture artefact rather than a player-visible defect, and it is recorded at LOW
  and flagged as such rather than asserted.
- Where fixable: UNKNOWN
- Proposed fix: confirm against a session not driven by synthetic clicks; if it
  reproduces for a mouse user, use `:focus-visible` rather than `:focus`.

## Corroboration of findings 01 to 11 above, with sources this pass located

These are not new ids. They are this pass's independent measurements and source
locations for findings the first writer already numbered.

- **Confirms 01 (Continue over the body copy), and names the mechanism.** On
  frame `160` the body lines are left-aligned at `x = 50` to `x = 53` and run out
  to `x = 359`, while the solid button block occupies a continuous bright run
  from `y = 162` to `y = 202`, the same span as the third and fourth text lines.
  The source is `frontend/src/lib/components/IntroSplash.svelte:125-131`:
  `.intro-continue { position: sticky; bottom: 0; background-color: #0a0a1e; align-self: center; ... }`.
  The comment at `:128` reads *Opaque, because card content scrolls underneath this button*,
  so the author knew content passes under it and made only the BUTTON opaque.
  `align-self: center` shrink-wraps it to its own text width, so the copy either
  side of it is not covered and shows through, which is precisely the
  `all later w` / `ing the` read on the frame. Smallest correct fix: wrap the
  button in a full-width sticky footer band that carries the opaque background,
  so the sticky element spans the card rather than only the button.
- **Confirms 04 (menu clipped at the top), names the mechanism, and confirms the
  missing first item.** `.hud-menu` at
  `frontend/src/lib/components/HudOverlay.svelte:1598-1607` is
  `position: absolute; bottom: calc(100% + 8px); left: 0; min-width: 200px` with
  NO `max-height`, while its sibling `.auto-menu` at `:1780` does carry
  `max-height: calc(100vh - 90px)`. One dropdown was clamped and the one beside
  it was not. The Popout S item list at `:546-577` is, in order,
  `{$tr('paytable')}`, `Session`, the turbo item, `{$tr('autoPlay')}`,
  `{$tr('betMax')}`, then `Mute`: six items. Frame `173` shows five, topmost
  `Session`. The item that is off-screen is therefore the PAYTABLE entry, at
  `:546`. Geometry from the frame agrees: the panel's left border stroke is
  present at `x = 46` on row `y = 0` (luminance `44` against an interior of `7`),
  the bottom border is a bright stroke at `y = 178`, and the bottom-left corner
  is radiused, the left edge moving from `x = 46` at `y = 3` to `x ≈ 53` at
  `y = 176`, with no matching radius or border at the top.
- **Confirms 05 (session panel cut top and bottom) to the pixel, and names the
  mechanism.** Traced on frame `174`, the panel's border runs at `x = 20` and
  `x = 379`, a width of `360 px` with symmetric `20 px` side gutters, and the
  corner radius is centred on rows `y = 0` and `y = 224` (left border at `x = 25`
  on both `y = 0` and `y = 224`, `x = 21` at `y = 6` and `y = 218`, settling to
  `x = 20` by `y = 110`), so the bounding box is exactly `y 0..224`. The source
  predicts the width exactly: `.sp-sheet { width: min(90vw, 360px); padding: 20px 22px; }`
  at `frontend/src/lib/components/SessionPanel.svelte:178-189`, which at `400px`
  gives `min(360, 360) = 360`, matching the measured `360`. There is no
  `max-height` on `.sp-sheet` and NO `@media` block anywhere in that file, while
  the backdrop centres with `align-items: center` at `:174-177`, so tall content
  overflows equally in both directions. The fix already exists in this repository
  as a precedent: `.intro-card` at `IntroSplash.svelte:66-69` uses
  `max-height: calc(100dvh - 2rem); overflow-y: auto;` for exactly this case.
- **Confirms 06 (the `Speed` row's left edge) with figures.** Measured label left
  edges on frame `173`: `Session` `x = 62`, `AUTO` `x = 62`, `MAX BET` `x = 62`,
  `Mute` `x = 62`, `Speed` `x = 90`, a `28 px` step. The mechanism is in the
  markup: the turbo row places `<svg class="m-turbo-bolt">` BEFORE its label at
  `frontend/src/lib/components/HudOverlay.svelte:560-561`, while the mute row
  places `<svg class="audio-mute-icon">` AFTER its label at `:575-577`, and
  `.hud-menu-item` at `:1609-1618` is `display: block; text-align: left`, so a
  leading inline icon simply pushes that row's text right. Fix: make
  `.hud-menu-item` a flex row with a fixed-width leading icon slot that every row
  reserves whether or not it has an icon.
- **Confirms 10 (centred paytable rules), and this is the important one, because
  the cause is not in the paytable at all.** Measured on frame `180`: bullet one
  line one spans `x 68..341` (centre `204.5`) and line two spans `x 128..273`
  (centre `200.5`), sharing a centre to within `4 px` while differing in left
  edge by `60 px`. That is centred text. The paytable's own CSS does NOT centre
  it: `.fs-rules li` at `frontend/src/lib/components/PaytableModal.svelte:668` is
  `padding-left: 16px; position: relative` with the `›` marker absolutely
  positioned at `left: 0` at `:669`, and there is no `text-align` on `.fs-rules`
  or any ancestor of it in that file. The centring is INHERITED from
  `frontend/src/app.css:139-144`:

  ```
  #app {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
  ```

  That is the untouched Vite scaffold block, and `text-align: center` at
  `app.css:143` is the *scaffold body centring* named in charter row **Q-27**.
  Q-27 is currently recorded as *Visible only if any link or unstyled surface
  reaches a frame*. Frame `180` is that frame: the scaffold rule is centring
  player-facing rules copy in the paytable at this viewport, and the same
  cascade explains why the intro rules card at `160` is unaffected (its `.intro-rules li`
  sits inside a card that sets its own alignment). **Q-27 should be re-rated from
  probably-invisible to visibly affecting player-facing copy**, and the fix for
  finding 10 is one line in `app.css`, not in `PaytableModal.svelte`.
- **Records a disagreement with 02, honestly.** Finding 02 above rates the
  bottom-edge slicing of paytable copy as STREAM. This pass looked at the same
  frames (`176`, `178`, `179`, `180`, `181`, `182`) and judged it correct
  behaviour for a scrolling list at a `225 px` viewport rather than a defect in
  itself, and signed it off as an absence rather than writing it up. Both
  readings are recorded so the marshal rules on it rather than inheriting one by
  accident. The two passes agree it compounds a real defect where it slices the
  lower of two misaligned labels, which is STC-POPOUTS-A-13.
- **Records a disagreement with 07 and 08.** This pass judged the full-bleed big
  win band a deliberate celebration treatment rather than an overflow, on the
  grounds that it runs edge to edge on both sides with its content centred within
  it; and measured the bottom HUD across frames `162`, `165`, `166`, `167`,
  `168`, `169`, `170` and `171` and found no control overlapping another, even at
  the widest win value in the range. Both are signed as absences below. The
  marshal should treat 07 and 08 as contested rather than as agreed.

## Explicit absences, signed (second pass)

I checked each of these myself and found nothing, and I am signing that.

- **REFUTED BY MY OWN RE-MEASUREMENT, and recorded rather than quietly dropped.**
  This pass first measured the session panel's heading as starting at `x = 44`
  while its five row labels started at `x = 52..56`, and was about to write it up
  as a broken left edge. Re-measuring at lower detection thresholds killed it:
  at thresholds 60, 90 and 120 the heading and ALL five row labels start at
  `x = 43` or `x = 44`. The apparent `10 px` step existed only at threshold 150
  and was an artefact of the row labels being dim (`rgba(205,222,238,0.7)` at
  `frontend/src/lib/components/SessionPanel.svelte:162`) so their antialiased
  leading pixels fell under the cut. The CSS agrees with the corrected reading:
  `.sp-sheet { padding: 20px 22px }` at `:180` is one uniform inset for the
  heading and the rows alike. **The session panel's left edge is correct.**
- **Nothing is cut off by the left or right viewport edge on any of the 26
  frames.** Traced the horizontal extents of every full-width surface: the
  paytable dialog runs `x 16..382` on frame `177`, the session panel runs
  `x 20..379` on frame `174`, and the HUD menu's left border is at `x = 46` on
  frame `173` with its right edge inside the frame. All sit inside `0..399` with
  air on both sides. Every clipping finding in this pass is on the vertical axis.
- **The paytable content card is not the source of the header misalignment in
  STC-POPOUTS-A-12.** Card borders at `x = 34` and `x = 364` against dialog
  furniture at `x = 16..21` and `x = 382` on frame `177`: inset `18 px` left and
  `19 px` right, symmetric to a pixel of border width.
- **The session panel's value column is correctly right-aligned.** `00:00:21`,
  `5`, `$5.00` and `$20.10` all terminate at `x = 354` or `x = 355` on frame
  `174`. No ragged edge, no per-row drift.
- **The splash lockup is horizontally centred.** Bright bounding box on frame
  `158` is `x 108..290, y 1..190`, centre `x = 199.0` against a viewport centre
  of `199.5`. The splash defect is vertical only: centre `y = 95.5` against
  `112.0`, top ink at `y = 1`, and no row below `y = 192` carrying luminance
  above `34`.
- **The bottom HUD bar at `400x225` is not crowded and no control overlaps
  another.** Checked on frames `162`, `165`, `166`, `167`, `168`, `169`, `170`
  and `171`: the six controls hold clear separation on all of them, including
  where the win pod carries its widest value (`$15.94`, `$16.20`). Recorded as a
  disagreement with finding 08 above rather than as agreement.
- **No dead region other than the splash band.** Checked every state frame for
  large empty areas: base idle, the three dead spins, the win presentation, the
  menu, the session panel and all seven paytable views fill their frame. The only
  dead region in the set is the `33 px` splash band.
- **No project script was run and no file other than this shard was written.**
  Every figure above came from an inline PNG decode in a shell process that wrote
  nothing, and from `grep -n` and `sed -n` reads of six source files:
  `IntroSplash.svelte`, `HudOverlay.svelte`, `PaytableModal.svelte`,
  `SessionPanel.svelte`, `app.css`, plus a directory listing of
  `lib/components/`.

## KNOWN matches (second pass)

- KNOWN(MID-01): `reports/screens/stream-test-2026-07-28/169_popout-s_transition_bigwin_countup_early.png`
  shows the banner at `$10.27` while the HUD win pod reads `$15.94` at the same
  instant, on a win settling at `$16.20` in
  `reports/screens/stream-test-2026-07-28/171_popout-s_bigwin_settled.png`. The
  `169`/`171` pair the ledger already names, confirmed at this viewport.
- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/169_popout-s_transition_bigwin_countup_early.png`,
  `170_popout-s_transition_bigwin_countup_late.png` and
  `171_popout-s_bigwin_settled.png` all render the unit as `16x BET` with a
  letter `x`.
- KNOWN(Q-27), and it is an upgrade rather than a sighting.
  `reports/screens/stream-test-2026-07-28/180_popout-s_paytable_04_rules.png`
  shows the Vite scaffold's `text-align: center` at `frontend/src/app.css:143`
  centring player-facing paytable rules copy, with the `›` markers left hanging
  at the card edge. Q-27 is recorded as *visible only if any link or unstyled
  surface reaches a frame*; this frame shows it reaching a fully styled,
  player-facing surface. Derivation in the corroboration of finding 10 above.
- KNOWN(Q-26): `reports/screens/stream-test-2026-07-28/181_popout-s_paytable_05_overdrive_free_spins.png`
  renders the instant award column as `1x` and `3x`, and
  `reports/screens/stream-test-2026-07-28/182_popout-s_paytable_06_bet_modes.png`
  renders `1x` and `5,000x`, while
  `reports/screens/stream-test-2026-07-28/160_popout-s_intro_rules.png` writes the
  same quantities as `1×, 3× or 10×` with the multiplication sign. Two paytable
  surfaces disagreeing with the intro rules card on the same values in the same
  session is the incomplete sweep MID-02 says Q-26's enumeration missed.
- KNOWN(Q-16 park): `Session` at
  `frontend/src/lib/components/HudOverlay.svelte:547` and `Mute` at `:575` are
  both visible as hardcoded English on
  `reports/screens/stream-test-2026-07-28/173_popout-s_hud_menu.png`. This is the
  English session so the park's own defect is not visible here, but the two
  strings are confirmed present on a stream frame, and per STC-POPOUTS-A-16 they
  are also what makes the menu column's casing inconsistent.
- KNOWN(TR-104): `169`, `170` and `171` render `BIG WIN` and `16x BET`. English
  session, so the locale failure is not visible; recorded to confirm the surface
  and strings the row describes appear at this viewport.
- KNOWN(TR-115 / TR-086): the balance pod reads `$50K` on
  `reports/screens/stream-test-2026-07-28/162_popout-s_base_idle.png` and on every
  later frame in the range, while the win pod beside it reads `$0.00`, then
  `$3.90`, `$15.94` and `$16.20`. Two money readouts side by side, one abbreviated
  to whole thousands and one to cents, and the abbreviated one cannot show a
  `$1.00` bet being taken across three dead spins (`165`, `166` and `167` all read
  `$50K`). Money display fit class, already mapped to final-mile JOB 3.
