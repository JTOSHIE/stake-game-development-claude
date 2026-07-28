# STT-POPOUTS-A, TYPOGRAPHY (popout-s, frames 157 to 182)

scope: every frame of the `popout-s` session numbered 157 to 182 inclusive, viewport
`400x225`, lang `en`, per `reports/screens/stream-test-2026-07-28/MANIFEST.json`. 26 frames,
all opened with the Read tool. Magnified crops (4x to 10x, nearest neighbour) were derived
into the scratchpad, outside the repository, for glyph-level and baseline-level claims; every
claim below names the frame it came from.

frames_read: 26

## STT-POPOUTS-A-01 STREAM The Continue button on the mandatory intro rules card covers the middle of a sentence

- Frames: `reports/screens/stream-test-2026-07-28/160_popout-s_intro_rules.png` (settled
  state), `reports/screens/stream-test-2026-07-28/159_popout-s_transition_splash_to_rules.png`
  (same overlap mid-fade).
- Claim: on the `intro_rules` card, which the manifest calls *"Rules card, gated before first
  spin"* and which therefore every viewer meets before the first spin, the opaque cyan
  `Continue` pill is drawn over the middle of the second bullet. What is readable on frame
  `160`, verbatim: `The Overdrive meter starts at 1× and rises` / `+1× after every winning free
  spin, multiplying` / `all later w` [button] `ing the` / `feature.` The source string is
  `rulesOverdriveMeter` at `frontend/src/lib/i18n/translations.ts:1541`, ending
  `multiplying all later wins. It never resets during the feature.`, so the words `ins. It
  never resets dur` are the ones the button hides. Because the button is a centred pill rather
  than a full-width bar, prose is visible on BOTH sides of it and the line reads as a punched
  out sentence rather than as a truncation.
  The mechanism is a live comment in the file: R14 (2026-07-27) fixed a genuinely unreachable
  Continue button at this exact viewport by making it `position: sticky; bottom: 0` with an
  opaque fill, and the comment at `IntroSplash.svelte:128` states the intent, *"Opaque, because
  card content scrolls underneath this button."* The button being on screen is the fix working.
  A centred pill parked over the middle of a running line is the cost that was not priced.
  This is a non-money string, so it is not TR-115 / TR-086.
- Where fixable: `frontend/src/lib/components/IntroSplash.svelte:125`
  (`.intro-continue { position: sticky; bottom: 0; background-color: #0a0a1e; align-self:
  center }`), with `.intro-rules` at `:91` (its `text-align: left` at `:97`) and the short-viewport block at
  `:117`. Not locked.
- Proposed fix: add `padding-bottom` to `.intro-rules` equal to the sticky button's height so
  the last line can always scroll clear of it, or make the sticky footer a full-width opaque
  bar so text is cut cleanly above it instead of through it. One small CSS change either way.

## STT-POPOUTS-A-02 HIGH The PAYTABLE menu item sits entirely above the top of the viewport and never renders

- Frames: `reports/screens/stream-test-2026-07-28/173_popout-s_hud_menu.png` (settled),
  `reports/screens/stream-test-2026-07-28/172_popout-s_transition_menu_opening.png`.
- Claim: the Popout S HUD menu is built with SIX items. In source order they are
  `{$tr('paytable')}` at `HudOverlay.svelte:546`, `Session` at `:547`,
  `{$tr('hudTurboLabel')}` at `:562`, `{$tr('autoPlay')}` at `:566`, `{$tr('betMax')}` at
  `:571` and `{$isMuted ? 'Unmute' : 'Mute'}` at `:575`. Only FIVE render. Both menu frames
  show `Session` as the topmost item, and at 8x magnification the 12 px of panel above
  `Session` carries no glyph, no partial glyph and no top border, so the first item is wholly
  above `y = 0` rather than partly cut. `paytable` resolves to `'PAYTABLE'`
  (`frontend/src/lib/i18n/translations.ts:271`), so the string is not empty.
  The geometry explains it and was derived rather than guessed: `.m-hud-menu` is pinned
  `bottom: 44px` (`HudOverlay.svelte:1115`), `.hud-menu` carries `position: absolute` and
  `overflow: hidden` with NO `max-height` (`:1598-1607`), and `.hud-menu-item` is
  `padding: 0.5rem 0.9rem` at `font-size: 0.8rem` (`:1609`), about 31 to 34 px per item.
  Six items is about 200 px, the menu's own top therefore lands near `-20 px` in a 225 px
  viewport, and `overflow: hidden` on the panel means nothing scrolls it back.
  Recorded in the typography shard because it is a labelled string that has overflowed its
  container, but the marshal should note it exceeds the lens: the paytable is a
  platform-required surface and this is its labelled route at this profile. Whether Popout S
  has any other entry point to the paytable was not determined here.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1598` (`.hud-menu`),
  `:1115` (`.m-hud-menu`), item at `:546`. Not locked.
- Proposed fix: cap the menu with `max-height: calc(100dvh - 52px)` and change `overflow:
  hidden` to `overflow-y: auto` on `.hud-menu`, so a menu taller than the viewport scrolls
  instead of losing its first item silently. Two properties, one rule.

## STT-POPOUTS-A-03 HIGH The HUD menu mixes title case and all caps inside one six-item list

- Frames: `reports/screens/stream-test-2026-07-28/173_popout-s_hud_menu.png`,
  `reports/screens/stream-test-2026-07-28/172_popout-s_transition_menu_opening.png`.
- Claim: one vertical menu, two casing registers, same family, same weight, same size, same
  colour, so casing is the only variable. Rendered top to bottom on frame `173`: `Session`,
  `Speed`, `AUTO`, `MAX BET`, `Mute`, plus the unrendered `PAYTABLE` above them
  (STT-POPOUTS-A-02). At source: `Session` is a hardcoded literal at
  `HudOverlay.svelte:547`; `Mute` and `Unmute` are hardcoded at `:575`;
  `autoPlay: 'AUTO'` is `translations.ts:206`, `betMax: 'MAX BET'` is `:209`, and
  `paytable: 'PAYTABLE'` is `:271`. So three of the six are all caps and three are title case,
  and the split runs along the boundary between what is hardcoded and what is a translation
  key rather than along any design intent.
  `KNOWN_OPEN.md` records that cross-surface capitalisation and button casing *"are gated
  nowhere; the frames are the instrument"*, so nothing would have caught this.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:547` and `:575` (the two
  hardcoded literals), `frontend/src/lib/i18n/translations.ts:206`, `:209`, `:271` (the three
  keyed values, times 16 locales). Not locked.
- Proposed fix: pick one register for menu items and apply it across all six. Cheapest
  mechanical route is `text-transform` on `.hud-menu-item` (`HudOverlay.svelte:1609`) so the
  register stops depending on 16 locales' capitalisation, but the direction is an art call in
  the same shape as Q-34 and should be ruled on rather than picked by the builder.

## STT-POPOUTS-A-04 MEDIUM Two heading registers across three overlays a player reaches from the same menu

- Frames: `reports/screens/stream-test-2026-07-28/174_popout-s_session_panel.png`
  (`Session information`), `reports/screens/stream-test-2026-07-28/178_popout-s_paytable_02_ways_to_win.png`
  (`WAYS TO WIN`), `reports/screens/stream-test-2026-07-28/179_popout-s_paytable_03_symbol_payouts.png`
  (`SYMBOL PAYOUTS`), `reports/screens/stream-test-2026-07-28/180_popout-s_paytable_04_rules.png`
  (`RULES`), `reports/screens/stream-test-2026-07-28/181_popout-s_paytable_05_overdrive_free_spins.png`
  (`OVERDRIVE FREE SPINS`), `reports/screens/stream-test-2026-07-28/182_popout-s_paytable_06_bet_modes.png`
  (`BET MODES`), `reports/screens/stream-test-2026-07-28/160_popout-s_intro_rules.png`
  (`OVERDRIVE FREE SPINS`).
- Claim: every paytable section heading is upper case and widely tracked because
  `.fs-heading` carries `text-transform: uppercase; letter-spacing: 0.16em`
  (`PaytableModal.svelte:605`). The session panel's heading is sentence case,
  `Session information`, from `rgSessionTitle` at `translations.ts:246` rendered by
  `SessionPanel.svelte:100` with no such transform. Two overlays opened from the same six-item
  menu, two heading conventions. Sentence case beside all caps for the same class of object is
  the machine-tell the standing mandate names, *"capitalisation that changes between two
  screens showing the same word"*, and the same feature is also `Session` in the menu and
  `Session information` on its own panel.
  Recorded beside it, because it is the same split one layer down and a future sweep will meet
  it: the feature name is upper case by DATA in one place and upper case by CSS in another.
  `IntroSplash.svelte:82` (`.intro-title`) sets no `text-transform`, so frame `160`'s
  `OVERDRIVE FREE SPINS` is caps because the string is caps, while frame `181`'s identical
  heading is caps because `.fs-heading` transforms it. They render the same today and would
  diverge the moment either side is touched.
- Where fixable: `frontend/src/lib/components/SessionPanel.svelte:100` with
  `frontend/src/lib/i18n/translations.ts:246`, against
  `frontend/src/lib/components/PaytableModal.svelte:605`. Not locked.
- Proposed fix: give the session panel's `h2` the same `text-transform: uppercase` and tracking
  as `.fs-heading`, or lower `.fs-heading` to sentence case. Direction is an art call, same
  shape as Q-34; the mechanical change is one property either way.

## STT-POPOUTS-A-05 MEDIUM Bulleted rules prose is left aligned on the intro card and centred in the paytable

- Frames: `reports/screens/stream-test-2026-07-28/160_popout-s_intro_rules.png`,
  `reports/screens/stream-test-2026-07-28/180_popout-s_paytable_04_rules.png`,
  `reports/screens/stream-test-2026-07-28/177_popout-s_paytable_01_match_symbols_on_adjacent_reels_st.png`.
- Claim: the same content type, bulleted rules prose with the same `›` marker set as an
  absolutely positioned `::before`, is aligned two ways. On frame `160` the wrapped lines are
  flush left, so `bet.` and `feature.` begin at the same x as the lines above them. On frame
  `180` the wrapped lines are centred, so `starting from reel 1.` is indented under
  `Wins pay left to right on adjacent reels`, and `number of ways times your bet` is indented
  under its own first line. Frame `177`'s body is centred as well. Centred body copy under a
  hanging bullet leaves the marker orphaned out to the left of a centred block, which is the
  tell.
  At source the two rules are near identical apart from alignment:
  `.intro-rules` sets `text-align: left` explicitly (`IntroSplash.svelte:97`), while
  `.fs-rules li` (`PaytableModal.svelte:667-669`) sets none and inherits centring from an
  ancestor. The inherited centring was not isolated within the source budget, and it does not
  need to be: adding the property to `.fs-rules` fixes it wherever it comes from.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:667-669` (`.fs-rules`),
  against `frontend/src/lib/components/IntroSplash.svelte:97`. Not locked.
- Proposed fix: add `text-align: left` to `.fs-rules` so both prose surfaces match, leaving
  section headings centred.

## STT-POPOUTS-A-06 MEDIUM The balance readout is frozen at `$50K` for the whole session while the session panel proves it moved

- Frames: `reports/screens/stream-test-2026-07-28/161_popout-s_transition_rules_to_base.png`
  through `reports/screens/stream-test-2026-07-28/173_popout-s_hud_menu.png`, every HUD frame
  in the range. Contradicted by
  `reports/screens/stream-test-2026-07-28/174_popout-s_session_panel.png`.
- Claim: `BAL` reads exactly `$50K` on frames `161`, `162`, `163`, `164`, `165`, `166`, `167`,
  `168`, `169`, `170`, `171`, `172` and `173`, thirteen consecutive frames spanning the whole
  captured session. Frame `174` proves the balance did move over that span: `Spins` `5`,
  `Total wagered` `$5.00`, `Total won` `$20.10`, `Net result` `+$15.10`. The compact form's
  granularity at this magnitude is 500 spins wide, so at `$1.00` a spin the readout cannot
  respond to anything a viewer watches happen. On the same 400 px bar it sits beside `WIN`
  `$15.94` and the bet `$1.00`, both at two decimals, so one row carries two currency formats.
  **This is raised as a tension with a ruled decision, not as an unnoticed defect**, per
  convention (n)'s requirement to surface rather than quietly pick a side. `actions/fitMoney.ts`
  is TR-066, and its header states the ruling: *"full precision everywhere else, abbreviation
  here and only here"*, closing an owner capture in which the Popout S `WIN` was cut mid-glyph
  and `BALANCE` dropped its cents. The action measures the real box and abbreviates only when
  the full string will not fit, which at a 58 px value slot and `$50,015.10` it will not. The
  ruling reasoned about the LEGIBILITY of a large figure. It does not appear to have considered
  that at this profile the abbreviation's step exceeds an entire session's movement, which is
  the state these thirteen frames show.
  Not TR-115 / TR-086 as that row is written: nothing here clips, ellipsises or overflows.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:605` (the call site) and
  `frontend/src/lib/actions/fitMoney.ts:1-6` and `:91` (the mechanism and the ruling). Not
  locked.
- Proposed fix: PARK(this is an owner or Fable question, not a builder's. Options: (a) accept
  it, the ruling already did; (b) abbreviate the thousands but keep the cents, for example
  `$50.0K` or `$50,015`, which moves on every spin and still fits; (c) let the balance pod
  borrow width from the win pod when the win pod is at `$0.00`. Option (b) is the genre
  convention and is a change inside `fitMoney`'s compact formatter alone.)

## STT-POPOUTS-A-07 MEDIUM Two symbol payout cards in one row carry their labels on different baselines

- Frames: `reports/screens/stream-test-2026-07-28/179_popout-s_paytable_03_symbol_payouts.png`.
- Claim: in the `SYMBOL PAYOUTS` grid the left card's label `WILD` and the right card's label
  sit about 9 px apart vertically at a 225 px viewport height, measured from the two labels'
  cap tops in the same row at 4x magnification. Two instances of one component, not sharing a
  baseline. The offset is also what pushes the right label past the panel's visible edge, so it
  survives as about two pixels of glyph top and is illegible while `WILD` beside it is clean.
  The cause was NOT isolated within the source budget and I am not guessing at it:
  `.fs-sym-card > .fs-face` is `padding: 14px 10px; gap: 6px; align-items: center`
  (`PaytableModal.svelte:657`) and `.fs-sym-card img` is a fixed `78px` square with
  `object-fit: contain` (`:658`), which should hold the labels level. Something between those
  rules and the rendered cards does not, and finding out what is a source question rather than
  a frame question.
- Where fixable: UNKNOWN. Candidates are
  `frontend/src/lib/components/PaytableModal.svelte:657-659`.
- Proposed fix: PARK(the cause is not isolated. Once it is, the durable shape is a fixed-height
  art slot in `.fs-sym-card > .fs-face` so labels share a baseline regardless of what the
  symbol art does.)

## STT-POPOUTS-A-08 MEDIUM The paytable's scroll region bisects a line of body text on every section at this viewport, with no mask or affordance

- Frames: `reports/screens/stream-test-2026-07-28/176_popout-s_paytable_top.png`,
  `reports/screens/stream-test-2026-07-28/175_popout-s_transition_paytable_opening.png`,
  `reports/screens/stream-test-2026-07-28/178_popout-s_paytable_02_ways_to_win.png`,
  `reports/screens/stream-test-2026-07-28/179_popout-s_paytable_03_symbol_payouts.png`,
  `reports/screens/stream-test-2026-07-28/180_popout-s_paytable_04_rules.png`,
  `reports/screens/stream-test-2026-07-28/182_popout-s_paytable_06_bet_modes.png`.
- Claim: **stated at the severity the source supports, not the one the frames first suggested.**
  `.fs-pt-body` is `overflow-y: auto` with a styled thin scrollbar
  (`PaytableModal.svelte:593`), so this is a scroll region and cutting content at its edge
  is lawful behaviour, not a container-fit bug. What the frames show is what that costs at
  `400x225`: the visible body is roughly 45 px tall, so every section is cut through the
  x-height of a line rather than between lines, against a hard chamfered neon border with no
  fade mask and no visible scrollbar thumb in any of the six frames. Per frame, the bisected
  string:
  - `178`: `which is a match read left to right from reel 1. Reels 4`, with the line above it
    intact.
  - `179`: the right symbol card's label reduced to about two pixels of glyph top. No payout
    figure is visible anywhere in the section.
  - `180`: `number of ways times your bet`.
  - `182`: the `Normal` card's second value row, a dollar figure beginning `$1`.
  - `176` and `175`: `All matching symbol positions count,`.
  Frame `177` is the control: the same section fits and is intact, so the panel can render a
  section cleanly and the failure is section height against this viewport.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:593` (`.fs-pt-body`).
  Not locked.
- Proposed fix: add a bottom fade mask to `.fs-pt-body` at short viewports
  (`mask-image: linear-gradient(...)`) so a cut line reads as "more below" rather than as
  broken text, and make the scrollbar thumb visible at this profile rather than translucent.
  Both are contained CSS changes in one rule.

## STT-POPOUTS-A-09 LOW One HUD menu label is knocked out of the list's shared left edge

- Frames: `reports/screens/stream-test-2026-07-28/173_popout-s_hud_menu.png`,
  `reports/screens/stream-test-2026-07-28/172_popout-s_transition_menu_opening.png`.
- Claim: `Session`, `AUTO`, `MAX BET` and `Mute` all begin at the same left x, being the
  `0.9rem` left padding of `.hud-menu-item` (`HudOverlay.svelte:1609`, `display: block`,
  `text-align: left`). `Speed` begins about 9 px further right because its bolt SVG
  (`HudOverlay.svelte:561`) is an inline sibling of the label inside the same block button
  rather than sitting in a reserved gutter. `Mute`'s speaker icon is on the trailing side
  instead (`:576`), so one list has an icon leading one item, an icon trailing another,
  none on three, and exactly one label out of alignment.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:561` with
  `:1609`. Not locked.
- Proposed fix: make `.hud-menu-item` a flex row with a fixed-width leading icon slot, so every
  label shares one left edge whether or not its row has an icon.

## STT-POPOUTS-A-10 LOW Two small-caps label treatments inside the one paytable

- Frames: `reports/screens/stream-test-2026-07-28/181_popout-s_paytable_05_overdrive_free_spins.png`,
  `reports/screens/stream-test-2026-07-28/182_popout-s_paytable_06_bet_modes.png`.
- Claim: adjacent sections of one overlay label their columns two ways for the same visual
  role, a small tracked uppercase label sitting above a cyan value. Section 05's
  `SCATTERS`, `FREE SPINS` and `INSTANT AWARD` are gold; they are real `<th>` elements
  (`PaytableModal.svelte:259`). Section 06's `COST`, `RTP` and `MAX WIN` are grey and lighter,
  from `.fs-mode-stat-label` (`:712-715`, `font-size: 0.56rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(200, 220, 235, 0.6)`). Scrolling from one to the next,
  the header row changes identity between two tables a player reads as the same object. Held at
  LOW because they are genuinely two components, a data table and a card stat, rather than two
  instances of one.
  The `<th>` rule itself was not isolated within the source budget, so only one side of the
  pair carries a line number.
- Where fixable: `frontend/src/lib/components/PaytableModal.svelte:712`
  (`.fs-mode-stat-label`) and `:259` (the `<th>` markup; its style rule not isolated). Not
  locked.
- Proposed fix: point both at one colour token and one weight. One line once the direction is
  chosen.

## Withdrawn during step 3, recorded so it is not re-derived

**A multiplication-glyph finding was drafted from the frames and is WITHDRAWN, refuted by the
specification.** The draft claimed that frame `182` showed `1x` with an ASCII `x` beside
`5,000×` with U+00D7 on one row, and that frame `181`'s `1x` and `3x` disagreed with frame
`160`'s `1×, 3× or 10×`. At 10x magnification the two marks genuinely do rasterise differently,
one reading as a bold baseline letterform and the other as a light mark on the maths axis.

The source says otherwise, and the source wins:
- `PaytableModal.svelte:95-97` is `award: '1×'`, `'3×'`, `'10×'`, all U+00D7.
- `PaytableModal.svelte:321` is `{m.cost}×`, U+00D7.
- `fsModes.ts:139` is `FS_MAX_WIN_LABEL = '5,000×'`, U+00D7.
- All three values on the bet-mode row carry the SAME class, `fs-mode-stat-value fs-num`
  (`PaytableModal.svelte:321`, `:326`, `:338`), so they are one character in one face at one
  size.

At a rendered size of about 7 px a U+00D7 is three or four pixels across, and one pixel of
subpixel offset changes its apparent weight and vertical position completely. Per convention
(l.2) a measurement that disagrees with the specification is a broken measurement until proven
otherwise, and I cannot prove otherwise from a 400x225 PNG. There is no glyph defect on these
surfaces. **This is the one place in this shard where the frames alone would have produced a
false finding**, and it is recorded rather than deleted so the next squad reading these frames
does not spend the same budget on it. MID-02's separate claim about `WinBanner.svelte:205` is
untouched by this and is confirmed below.

## Explicit absences, signed

Each of these was looked for across all 26 frames at full size, and at 4x to 10x nearest
neighbour magnification on every frame carrying the relevant surface. Nothing was found and I
am signing that.

- **No em dashes and no en dashes in player-visible prose.** Every prose surface in the range
  was magnified and read character by character: the rules card body (`159`, `160`), the
  paytable body and tables (`175` through `182`), the session panel (`174`), the HUD menu
  (`172`, `173`), the win banner (`169`, `170`, `171`). The only punctuation present is the
  comma, the full stop, one semicolon (`180`, `way; the total is that value`), round brackets,
  the colon in `00:00:21`, `$`, `%`, `+`, the thousands comma in `5,000×` and the `›` bullet
  marker. No hyphen-minus, no U+2013, no U+2014.
- **No mixed straight and curly quotes.** No apostrophe and no quotation mark of any kind
  appears in any player-visible string across the 26 frames, so the class cannot be violated
  here.
- **No double spaces.** Inter-word gaps were compared at 4x on the rules card body (`160`), the
  paytable prose (`177`, `178`, `180`) and the session panel labels (`174`); every gap within a
  line is uniform.
- **No ellipsised string and no CSS text-overflow ellipsis** anywhere in the range. The cuts in
  STT-POPOUTS-A-08 are hard cuts through the glyphs, which is why they read as broken rather
  than as truncation. Noted for the marshal: `PaytableModal.svelte:718` and `:722` do carry
  `text-overflow: ellipsis`, but neither rule reaches a visible string in these 26 frames.
- **No system font leakage and no fallback glyph in a foreign family.** `app.css:97-98` declares
  `--fs-font-display: 'Orbitron', system-ui, sans-serif` and `--fs-font-numeric: 'Orbitron',
  'Courier New', monospace`, so both tokens do have system fallbacks that would be visible if
  Orbitron failed. It did not fail on any frame in this range. Specifically checked: the `›`
  bullet marker on `160` and `180` renders in the surrounding face rather than dropping to a
  system serif; the `×` on `160`, `181` and `182` renders in its surrounding face; the `+` and
  the `:` on `174`, the `%` on `182` and the `K` suffix on `$50K` (`169`, at 10x) all match
  their neighbours. The `Continue` label (`160`) and the HUD numerals are `--fs-font-numeric`
  while prose is `--fs-font-display`, which is the design system rather than a leak. Q-07's
  allowlisted infinity glyph is on the autoplay panel, which is not captured in this range.
- **No money pod clipping, ellipsising or overflowing**, so I record NO fresh evidence for
  TR-115 / TR-086 from this range. `$50K`, `$15.94`, `$16.20`, `$10.27`, `$3.90`, `$0.00`,
  `$1.00`, `$5.00`, `$20.10` and `+$15.10` all sit inside their containers with clearance on
  every frame that carries them. STT-POPOUTS-A-06 is a different failure and says so.
- **No numeral shimmy on a non-`.fs-num` surface.** Per TR-089 the banner count-up is excluded.
  Every other numeric surface available was compared frame to frame: the HUD `WIN` pod across
  `169` `$15.94`, `170` `$16.20` and `171` `$16.20` holds the same digit count and the same `$`
  x position; the bet pod `$1.00` and the balance `$50K` are byte-identical across all thirteen
  HUD frames, so neither can shimmy; the session panel (`174`) is a single settled capture. No
  third count-up surface appears in this range.
- **No decimal or currency format disagreement inside any single panel.** The session panel
  (`174`) is uniformly two decimals. The paytable bet-mode card (`182`) is uniformly two
  decimals on its money row. The only cross-format disagreement found is the HUD bar, reported
  as STT-POPOUTS-A-06.
- **No missing space before an opening bracket.** `reel 1 (left to right).` on `176` and `177`
  reads closed up at 1x; at 4x the space is present and the appearance is the display face's
  shallow bracket. Not a finding.
- **Q-34 not observable in this range.** No mode badge and no features menu frame falls in 157
  to 182. The only mode name captured is `Normal` on `182`, with no second surface in range to
  compare it against.
- **TR-104 not observable in this range.** This session is `lang: en` per the manifest.
- **Q-27 not observable in this range.** No hyperlink and no unstyled surface reaches any of the
  26 frames, so the Vite scaffold link colour and body centring cannot show.
- **TR-114 not observable.** No replay surface falls in this range.

## KNOWN matches

- KNOWN(MID-01): `reports/screens/stream-test-2026-07-28/169_popout-s_transition_bigwin_countup_early.png`.
  Fresh evidence at the Popout S viewport, on the frame pair the ledger predicted by name. The
  banner reads `$10.27` while the HUD `WIN` pod already reads `$15.94`, on a win that settles at
  `$16.20` on `reports/screens/stream-test-2026-07-28/171_popout-s_bigwin_settled.png`. The two
  readouts disagree by `$5.67` at that instant, against the `$5.66` the ledger measured on the
  desktop frame.
- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/169_popout-s_transition_bigwin_countup_early.png`,
  `reports/screens/stream-test-2026-07-28/170_popout-s_transition_bigwin_countup_late.png`,
  `reports/screens/stream-test-2026-07-28/171_popout-s_bigwin_settled.png`. The banner unit
  renders `16x BET` on all three. Unlike the withdrawn draft above, this one is confirmed by the
  specification rather than only by pixels: `WinBanner.svelte:205` builds the string with ASCII
  `x`, per the ledger.
- KNOWN(Q-16 park): `reports/screens/stream-test-2026-07-28/181_popout-s_paytable_05_overdrive_free_spins.png`.
  The first column header of the Overdrive table is a hardcoded English literal,
  `<th>Scatters</th>` at `frontend/src/lib/components/PaytableModal.svelte:259`, sitting between
  two localised siblings, `{$tr('colFreeSpins')}` and `{$tr('colInstantAward')}`, on the same
  row. It renders `SCATTERS` here because this session is `en`; on a de or ar session it would
  render English between two translated headers. Q-16's enumeration names paytable SECTION
  headers and does not name this table header, so this is one more parked string rather than a
  new row, offered as enumeration rather than as a finding.

## LOUD: a committed evidence frame is MODIFIED in the working tree, and it is not mine

`git status --porcelain` at the close of this run reports:

```
 M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png
```

**A committed capture frame has been overwritten in the working tree during this wave.** It
grew from `59295` bytes at HEAD to `91803` bytes on disk, with an mtime of
`Jul 28 23:53:41 2026`, which is inside this wave's window.

It is not mine. Frame `188` is outside my assigned range of 157 to 182, I never opened it, and
every derived crop this squad produced was written to the session scratchpad outside the
repository under an `STTPA_` or `a1`/`a2`/`a3` prefix. The frame belongs to the popout-s
squads working 183 and above.

The size growth from 59 KB to 92 KB is the signature of a re-encoded or upscaled image written
back over its own source path, which is exactly the failure `CLAUDE.md` convention **(h.1)**
and **SA-012** record: *"Evidence that a casual re-run can overwrite is not evidence."* The
likely mechanism is a magnification or crop step that used the frame's own path as its output
path instead of a scratch path, the same shape as `anticipation_proof.mjs` writing straight
into `reports/screens/scatter-anticipation/`.

**I have not restored it**, on two grounds: this squad is read-only against the repository
apart from this shard, and another squad may still be mid-run against that file, so pulling it
back to HEAD would be reaching into a live writer's working state. It is the marshal's call.
The restore is `git checkout -- reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png`,
and it should happen before any consolidation commit, because a modified evidence frame
silently invalidates every finding any squad has cited against it.

tree_after:

```
 M reports/screens/stream-test-2026-07-28/188_popout-s_features_menu.png
?? reports/qa/stream_test/shards/STC-MOBILEL-B.md
?? reports/qa/stream_test/shards/STC-MOBILEM-B.md
?? reports/qa/stream_test/shards/STC-MOBILES-A.md
?? reports/qa/stream_test/shards/STC-MOBILES-B.md
?? reports/qa/stream_test/shards/STC-STRETCH-A.md
?? reports/qa/stream_test/shards/STC-STRETCH-B.md
?? reports/qa/stream_test/shards/STM-DESKTOP.md
?? reports/qa/stream_test/shards/STM-LAPTOP.md
?? reports/qa/stream_test/shards/STM-MOBILEM.md
?? reports/qa/stream_test/shards/STM-MOBILES.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STM-STRETCH.md
?? reports/qa/stream_test/shards/STT-DESKTOP-A.md
?? reports/qa/stream_test/shards/STT-DESKTOP-B.md
?? reports/qa/stream_test/shards/STT-LAPTOP-B.md
?? reports/qa/stream_test/shards/STT-POPOUTS-A.md
?? reports/qa/stream_test/shards/STT-POPOUTS-B.md
```

The untracked rows are this wave's shards. `STT-POPOUTS-A.md` is mine; the other sixteen are
other squads' and are not my concern. Nothing shows as DELETED. One row shows as MODIFIED and
it is called out above.
