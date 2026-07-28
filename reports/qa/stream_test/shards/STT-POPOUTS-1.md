# STT-POPOUTS-1, TYPOGRAPHY (Popout S, frames 157 to 173, 1600px upscaled)
supersedes: reports/qa/stream_test/shards/superseded/STT-POPOUTS-A.md (partially: A spans 157 to 182, of which 157 to 173 is mine and 174 to 182 belongs to a sibling squad). STT-POPOUTS-B spans 183 to 207 and is entirely outside this range; nothing in it is reconciled here.
scope: the `popout-s` session, frames 157 to 173 inclusive, 17 frames, read from `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/`
frames_read: 17

Every frame is captured at a `400x225` viewport (`reports/screens/stream-test-2026-07-28/MANIFEST.json`,
`"viewport": "400x225"` on all seventeen rows) and resampled to 2844x1600, a factor of 7.111.
The default root font size is 16px and nothing in `frontend/src/app.css` overrides it, so
`rem` values below convert at 16px per rem.

METHOD NOTE, because it changed two of my answers. Every frame-derived glyph claim was
re-checked against the source literal in STEP 3. Two findings written from the 1600px frames
did not survive that check and are recorded as withdrawn drafts at the foot of this shard
rather than quietly deleted, per convention (l.2): a measurement that disagrees with the
specification is a broken measurement until proven otherwise.

## STT-POPOUTS-1-01 STREAM The HUD menu mixes Title Case and ALL CAPS across its six items, and the split follows the hardcoded-versus-keyed boundary rather than any design rule

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/172_popout-s_transition_menu_opening.png`
- Claim: five labels render, top to bottom, `Session`, `Speed`, `AUTO`, `MAX BET`, `Mute`.
  Three Title Case, two ALL CAPS, one panel, one face, one size, one colour, so casing is the
  only variable. A sixth item, `PAYTABLE`, is authored above them and never reaches the
  viewport (STT-POPOUTS-1-02), which makes it three and three at source.
  The split is mechanical rather than intentional: `Session` is a hardcoded literal at
  `frontend/src/lib/components/HudOverlay.svelte:547`, `Mute` and `Unmute` are hardcoded at
  `:575`, and the three that shout are keyed values, `autoPlay: 'AUTO'`
  (`frontend/src/lib/i18n/translations.ts:206`), `betMax: 'MAX BET'` (`:209`) and
  `paytable: 'PAYTABLE'` (`:271`). Every hardcoded label is Title Case and every keyed label
  is ALL CAPS, which is a build artefact, not a register.
  This is not KNOWN_OPEN Q-34. Q-34 is one mode name disagreeing across four surfaces via a
  `text-transform` present on one class and absent on three. This is five sibling rows of one
  list disagreeing with each other inside one view, on the surface a streamer opens to change
  speed or start autoplay. `KNOWN_OPEN.md` records that cross-surface capitalisation and
  button casing are gated nowhere and that the frames are the instrument.
- Resolution note: VISIBLE AT BOTH. The superseded shard reports this as STT-POPOUTS-A-03
  from magnified crops of the native captures. Confirmed here at 1600px with the same
  reading.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:547` and `:575` (the two
  hardcoded literals), `frontend/src/lib/i18n/translations.ts:206`, `:209` and `:271` (the
  three keyed values, times sixteen locales). Not locked.
- Proposed fix: put `text-transform` on `.hud-menu-item`
  (`frontend/src/lib/components/HudOverlay.svelte:1609`) so the register stops depending on
  sixteen locales' capitalisation, and rule on the direction together with Q-34 rather than
  picking it in the build.

## STT-POPOUTS-1-02 STREAM The PAYTABLE menu item is authored first and renders nowhere, so the platform-required surface has no visible route at this profile

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/172_popout-s_transition_menu_opening.png`
- Claim: `<button class="hud-menu-item" role="menuitem" on:click={openPaytable}>{$tr('paytable')}</button>`
  is the FIRST child of the menu at `frontend/src/lib/components/HudOverlay.svelte:546`, and
  `paytable` resolves to `'PAYTABLE'` (`frontend/src/lib/i18n/translations.ts:271`), so the
  string is neither empty nor missing. On both menu frames the topmost rendered item is
  `Session`, and the panel band above it carries no glyph, no partial glyph and no top
  border. Six authored items, five rendered.
  Geometry: `.hud-menu-item` is `padding: 0.5rem 0.9rem` at `font-size: 0.8rem`
  (`frontend/src/lib/components/HudOverlay.svelte:1609-1617`), about 31 to 34px per row, so
  six rows is about 200px, and `.m-hud-menu` is pinned `bottom: 44px` in a 225px viewport
  with `.hud-menu` carrying `overflow: hidden` and no `max-height`.
- Resolution note: VISIBLE AT BOTH, and I am signing an honest miss: my own 1600px frame pass
  counted five items and did not ask whether a sixth was authored. The superseded shard
  found it (STT-POPOUTS-A-02) by reading the markup. Recorded so the marshal knows this is
  A's catch confirmed rather than an independent second sighting, which under convention
  (l.4) is not corroboration.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1598` (`.hud-menu`), `:1115`
  (`.m-hud-menu`), item at `:546`. Not locked.
- Proposed fix: `max-height: calc(100dvh - 52px)` and `overflow-y: auto` on `.hud-menu`, so a
  menu taller than the viewport scrolls rather than losing its first item silently.

## STT-POPOUTS-1-03 STREAM The intro rules `Continue` button is drawn over the middle of a sentence a player must read before their first spin

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/160_popout-s_intro_rules.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/159_popout-s_transition_splash_to_rules.png`
- Claim: what survives on frame `160`, transcribed verbatim from the 1600px render:
  `The Overdrive meter starts at 1× and rises` / `+1× after every winning free spin, multiplying`
  / `all later w` [opaque button] `ring the` / `feature.` The source string ends
  `multiplying all later wins. It never resets during the feature.`
  (`frontend/src/lib/i18n/translations.ts:1541`), so the hidden run is `ins. It never resets dur`.
  Because the button is a centred pill and not a full-width bar, prose survives on BOTH sides
  of it and the line reads as a punched-out sentence rather than as a truncation. This is a
  non-money string, so it is not TR-115 / TR-086.
  The button being on screen at all is R14's fix working: `.intro-continue` is
  `position: sticky; bottom: 0` with an opaque fill and the comment at
  `frontend/src/lib/components/IntroSplash.svelte:127` states the intent, "Opaque, because
  card content scrolls underneath this button." A centred pill parked over a running line is
  the cost that was not priced.
- Resolution note: VISIBLE AT BOTH. Reported as STT-POPOUTS-A-01. Confirmed independently
  from the 1600px frames before the shard was read; the transcription matches A's to the
  character.
- Where fixable: `frontend/src/lib/components/IntroSplash.svelte:125-143` (`.intro-continue`),
  with `.intro-rules` at `:91-97` and the short-viewport block at `:115-123`. Not locked.
- Proposed fix: add `padding-bottom` to `.intro-rules` equal to the sticky button's height so
  the last line can scroll clear of it, or make the sticky footer a full-width opaque bar so
  text is cut cleanly above it rather than through it.

## STT-POPOUTS-1-04 HIGH The HUD stat labels are set at 7px, 36 per cent below the legibility floor the project states in its own source

- Frames: every HUD frame in range, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/162_popout-s_base_idle.png` through `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`
- Claim: `.m-stat-label { flex: 0 0 auto; font-size: 7px; letter-spacing: 0.04em; color: #6f8a9a; text-transform: uppercase; }`
  at `frontend/src/lib/components/HudOverlay.svelte:1128-1131`. Seven pixels, absolute, not a
  `rem` that could scale. This is the rule that draws `BAL` and `WIN`, the two labels that
  tell a viewer which figure is the balance and which is the win.
  The project states its own floor in its own source: "would either sit below the 11px
  legibility floor or overflow the 76px strip height"
  (`frontend/src/lib/components/FeatureMenu.svelte:227`). 7px is 36 per cent under it. The
  comment immediately below the offending rule, at
  `frontend/src/lib/components/HudOverlay.svelte:1133-1136`, names 11px as "the base size for
  this size class", so the floor is known in this file and the labels sit below it anyway.
  The frames show the consequence rather than discovering it: at 7px the labels are the
  lowest contrast text on the strip, a mid grey `#6f8a9a` on near black, and both are
  reduced to a smear at native size.
  Distinct from STT-POPOUTS-B-03, which found `0.52rem` (8.32px) in `FeatureMenu.svelte`.
  This is a different file, a different rule and a lower number.
- Resolution note: NEW AT 1600PX. The superseded shard reads the labels and reports their
  content but makes no size claim about them and does not reach this rule; its only
  size-related finding is A-08's scroll cut in the paytable.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:1130`. Not locked.
- Proposed fix: raise `.m-stat-label` to at least `11px` to meet the file's own floor and let
  the stat row drop the label's letter-spacing or shorten the strings to pay for it. A floor
  the project names and then undercuts in the same file is worse than no floor.

## STT-POPOUTS-1-05 HIGH The win breakdown strip prints the maths package's internal symbol codes to the player, through a display-name table that maps every code to itself

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/170_popout-s_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/171_popout-s_bigwin_settled.png`
- Claim: a plate at the foot of the reel window carries four tokens. The first is the symbol
  name, rendered by `<span class="wb-symbol">{symbolLabel(current.symbol, $tr)}</span>`
  (`frontend/src/lib/components/WinBreakdown.svelte:92`). `symbolLabel` translates exactly two
  ids and passes the rest through a lookup table (`:19-24`):

  ```
  const SYMBOL_IDS: Record<string, string> = {
    H1: 'H1', H2: 'H2', M1: 'M1', M2: 'M2', M3: 'M3',
    L1: 'L1', L2: 'L2', L3: 'L3',
  }
  ```

  (`frontend/src/lib/components/WinBreakdown.svelte:15-17`). **It is an identity map.** Only
  `W` and `S` get real names, from `symbolWild` and `symbolScatter`; every one of the other
  eight symbols renders its raw internal maths-package id verbatim. The frames confirm it:
  the leading token on `170` and `171` is a two character alphanumeric of exactly that
  shape, which I read as `L3` on `170`. A placeholder table that survived is the machine
  tell the standing mandate names by name, and this one is dressed as a real table, which is
  why nothing has caught it.
  Same plate, second defect: `<span class="wb-ways">{current.ways} ways</span>` (`:94`) is a
  hardcoded lowercase English literal sitting beside a `$tr`-routed sibling on the same row,
  so on a de or ar session it reads `5 ways` between two localised tokens. Q-16's parked
  enumeration does not name it, which is the same incompleteness MID-02 records against Q-26.
  Same plate, third defect: `.wb-ways { font-size: 0.62rem }` (`:146`) is 9.92px while its
  three siblings inherit `.fs-plate > .fs-face { font-size: 0.7rem }` (`:139`), 11.2px. Four
  tokens on one plate at two sizes, one of them again below the 11px floor.
- Resolution note: NEW AT 1600PX. This strip is roughly 4px tall at the captured height and
  is not present as legible text in a thumbnail; the superseded shard does not mention it.
  `STL-AR-A-01` reaches the same surface from the Arabic session, which is corroboration from
  a genuinely independent input.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:15-17` (the identity map),
  `:94` (the hardcoded `ways`), `:146` (the size). Not locked.
- Proposed fix: give the eight paytable symbols real display names in the same table, route
  `ways` through `$tr`, and drop the `.wb-ways` size override so the plate sets one size.

## STT-POPOUTS-1-06 HIGH A sixth ASCII multiplication `x` exists, in a component, and it is neither in `fsModes.ts` nor the `WinBanner.svelte` instance MID-02 names

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/170_popout-s_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/171_popout-s_bigwin_settled.png`
- Claim: `<span class="wb-count">x{current.kind}</span>` at
  `frontend/src/lib/components/WinBreakdown.svelte:93`. The `x` is ASCII U+0078, hardcoded as
  a template prefix, on a plate that renders under the reels for the duration of every win.
  It is a further survivor of the class KNOWN_OPEN Q-26 exists to record and that MID-02
  showed Q-26 had under-enumerated. MID-02 called `WinBanner.svelte:205` the fifth instance,
  outside the two files Q-26 searched; this is a sixth, in a third file, and it is on a
  surface that appears on far more frames than the banner does.
  It also disagrees with its own neighbours in ORDER as well as glyph: this site writes the
  multiplier as `x{kind}` (mark first) while `WinBanner.svelte:205` writes `${mult}x` (mark
  last) and `MaxWinCelebration.svelte:155` writes `×` as a separate span. Three sites, three
  constructions of one quantity.
- Resolution note: NEW AT 1600PX in the sense that matters: the superseded shard explicitly
  WITHDREW a multiplication-glyph finding after failing to resolve `×` at four pixels
  (STT-POPOUTS-A, "Withdrawn during step 3"), and it was right to, because the sites it
  challenged really are `×`. This one is a different site and it is asserted from the source
  literal, not from the pixels.
- Where fixable: `frontend/src/lib/components/WinBreakdown.svelte:93`. Not locked.
- Proposed fix: change to `×{current.kind}` in the same edit as MID-02's
  `WinBanner.svelte:205`, and widen Q-26's enumeration from two config files to the whole
  `frontend/src/lib/` tree so the class closes once rather than a seventh time.

## STT-POPOUTS-1-07 HIGH The game's two win celebration labels disagree on the exclamation mark, and the same tier label exists twice in two string tables with different punctuation

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/168_popout-s_win_presentation.png` (`WIN!`), `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/169_popout-s_transition_bigwin_countup_early.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/170_popout-s_transition_bigwin_countup_late.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/171_popout-s_bigwin_settled.png` (all three `BIG WIN`)
- Claim: within one captured session, one round apart, the small win flash renders `WIN!` and
  the big win banner renders `BIG WIN` with no exclamation mark. Two celebration labels of one
  class, one shouting and one not.
  At source the punctuation is not a rendering accident, it is two tables that were never
  reconciled:
  - `winFlash: 'WIN!'` (`frontend/src/lib/i18n/translations.ts:223`), rendered by
    `frontend/src/lib/components/WinCelebration.svelte:35`. The comment at `:33` records that
    "`winFlash` is its own key rather than `win` plus an exclamation mark", so the mark is
    deliberate there.
  - `tierBigWin: 'BIG WIN'`, `tierMegaWin: 'MEGA WIN'`, `tierEpicWin: 'EPIC WIN'`
    (`frontend/src/lib/i18n/prose.ts:80-82`), rendered by
    `frontend/src/lib/components/WinBanner.svelte:200`. No marks.
  - `bigWin: 'BIG WIN!'`, `hugeWin: 'HUGE WIN!!'`, `megaWin: 'MEGA WIN!!!'`
    (`frontend/src/lib/i18n/translations.ts:260-262`), a SECOND set of the same tier labels,
    with escalating exclamation marks, rendered by
    `frontend/src/lib/components/WinDisplay.svelte:75,77`.
  `WinDisplay.svelte` is imported by exactly one consumer, `ReplayMode.svelte:18` and `:309`.
  So the shipping game says `BIG WIN` in live play and `BIG WIN!` in Bet Replay, which is
  mandatory and player-visible per `CLAUDE.md`'s compliance section, for the same event.
  The escalation convention differs too: replay escalates by mark count (`!`, `!!`, `!!!`),
  live play does not escalate at all.
- Resolution note: NEW AT 1600PX. The exclamation mark on `WIN!` is roughly one pixel wide at
  the captured height. The replay half of the claim is derived from source and is flagged as
  such: no replay frame exists in this capture set (KNOWN_OPEN TR-114).
- Where fixable: `frontend/src/lib/i18n/prose.ts:80-82` against
  `frontend/src/lib/i18n/translations.ts:223` and `:260-262`, with the two consumers at
  `frontend/src/lib/components/WinBanner.svelte:200` and
  `frontend/src/lib/components/WinDisplay.svelte:75,77`. Not locked.
- Proposed fix: pick one punctuation convention for win celebration labels and delete the
  duplicate tier set rather than translating both. Note for the marshal, in the same shape as
  MID-02's note about `WinPod.svelte`: `translations.ts:260-262` is a full sixteen-locale tier
  table reachable only from replay, and whether replay should keep its own labels at all is
  the question to settle before either table is edited.

## STT-POPOUTS-1-08 HIGH Three disagreeing currency formats on one HUD strip, and the abbreviated one does not move for the whole session

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/161_popout-s_transition_rules_to_base.png` through `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`, thirteen consecutive HUD frames
- Claim: the balance reads exactly `$50K` on frames `161`, `162`, `163`, `164`, `165`, `166`,
  `167`, `168`, `169`, `170`, `171`, `172` and `173`. No decimal places, no thousands
  separator, an uppercase Latin `K`. Beside it on the same 400px bar the win pod reads
  `$0.00`, then `$3.90` (`168`), then `$15.94` (`169`), then `$16.20` (`170`, `171`), and the
  bet reads `$1.00`. One row, two currency formats.
  Across those thirteen frames the player wagers `$1.00` four times and is paid `$3.90` and
  `$16.20`, and the balance readout does not change a single glyph, because the compact
  form's step at this magnitude is wider than anything a viewer watches happen.
  **Raised as a tension with a ruled decision, not as an unnoticed defect**, per convention
  (n)'s requirement to surface rather than quietly pick a side. The abbreviation is the
  sanctioned output of `fitMoney`, which measures the real box and abbreviates only when the
  full string will not fit; the call site is
  `frontend/src/lib/components/HudOverlay.svelte:605`, and the spans are deliberately empty
  because the action owns the text, as the comment at `:594-602` states. That ruling reasoned
  about the LEGIBILITY of a large figure. What these thirteen frames add is that at this
  profile the abbreviation's step exceeds an entire session's movement.
  Not TR-115 / TR-086 as that row is written: nothing here clips, ellipsises or overflows.
  COUNTER-EVIDENCE, recorded so the marshal can dispose of this in one read: the sibling shard
  STT-POPOUTS-B withdrew a similar finding as refuted by the same ruling, citing
  `frontend/src/lib/utils/currency.ts:257-268`. I did not read that file and do not dispute
  the ruling; the claim I am making is narrower, that the ruling did not consider the step
  size against session movement.
- Resolution note: VISIBLE AT BOTH. Reported as STT-POPOUTS-A-06 with the same frame list and
  the same reasoning. Confirmed.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:605` (the call site) and
  `frontend/src/lib/actions/fitMoney.ts` (the mechanism). Not locked.
- Proposed fix: PARK(an owner or Fable question, per convention (l.8), since it touches the
  money display. Options: (a) accept it, the ruling already did; (b) abbreviate the thousands
  but keep enough precision to move, for example `$50.0K` or `$50,015`, which still fits;
  (c) let the balance pod borrow width from the win pod while the win pod is at `$0.00`.
  Option (b) is the genre convention and is a change inside the compact formatter alone.)

## STT-POPOUTS-1-09 MEDIUM One menu label is knocked 28px off the list's shared left edge, and the two icon rows put their icons on opposite sides

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/172_popout-s_transition_menu_opening.png`
- Claim: `Session`, `AUTO`, `MAX BET` and `Mute` all begin at the `0.9rem` left padding of
  `.hud-menu-item` (`frontend/src/lib/components/HudOverlay.svelte:1609-1617`, `display: block`,
  `text-align: left`). `Speed` begins **28px** further right, and the figure is derivable
  rather than measured: `.m-turbo-item` is `display: flex; align-items: center; gap: 0.5rem`
  (`:1632-1636`) and `.m-turbo-bolt` is `width: 20px` (`:1637`), so the label starts at
  20px + 8px. `Mute`'s speaker icon is on the TRAILING side instead
  (`frontend/src/lib/components/HudOverlay.svelte:576`), so one list has an icon leading one
  row, an icon trailing another, none on three, and exactly one label out of alignment.
- Resolution note: VISIBLE AT BOTH, but REFINED. The superseded shard reports this as
  STT-POPOUTS-A-09 and puts the offset at "about 9 px" from the native frames. The source
  gives 28px, and my own 1600px measurement gives about 206 upscaled pixels, which is 29px at
  the captured height. A's figure is wrong by a factor of three, which is exactly the class of
  error a thumbnail measurement produces.
- Where fixable: `frontend/src/lib/components/HudOverlay.svelte:561` and `:576` (the two
  icons), `:1609` and `:1632-1637` (the two layouts). Not locked.
- Proposed fix: make `.hud-menu-item` a flex row with a fixed width leading icon slot, empty
  on rows without an icon, so all six labels share one left edge.

## STT-POPOUTS-1-10 MEDIUM The balance label is abbreviated where its sibling is not, and at 7px the abbreviation reads as a currency code

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/162_popout-s_base_idle.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/168_popout-s_win_presentation.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/173_popout-s_hud_menu.png`
- Claim: two labels sit on one strip in one style. One is a truncation and one is a whole
  word: `hudBalanceShort: 'BAL'` and `hudWinShort: 'WIN'`
  (`frontend/src/lib/i18n/translations.ts:1545-1546`). The German pair is symmetric, `GUTH`
  and `GEW` (`:1597-1598`), so English is the locale that mixes conventions.
  The size makes it worse rather than merely untidy. At `font-size: 7px`
  (`frontend/src/lib/components/HudOverlay.svelte:1130`) in the squared display face, the `A`
  of `BAL` presents as a flat-topped bowl over a heavy crossbar and, in the 1600px render,
  reads as an `R`. The string is `BAL`, confirmed at source; what a viewer at 400x225 gets is
  three glyphs that resolve as `BRL`, the ISO 4217 code for the Brazilian real, printed
  immediately left of a dollar amount. That is a misread with a money meaning, not a cosmetic
  one.
- Resolution note: NEW AT 1600PX. The label is unreadable in the native captures, which is
  why the superseded shard quotes its content from source rather than from the frames.
- Where fixable: `frontend/src/lib/i18n/translations.ts:1545` (the string) and
  `frontend/src/lib/components/HudOverlay.svelte:1130` (the size and the `#6f8a9a` colour).
  Not locked.
- Proposed fix: fix the size first (STT-POPOUTS-1-04), which removes most of the misread, and
  then decide whether both labels truncate or neither. `BAL` at 11px does not read as `BRL`.

## STT-POPOUTS-1-11 MEDIUM The display face makes `5` indistinguishable from `S` and `8` from `B`, in the one sentence that states the feature's award schedule

- Frames: `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/160_popout-s_intro_rules.png`, `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/159_popout-s_transition_splash_to_rules.png`
- Claim: the first bullet reads `3, 4 or 5 Scatters award 8, 12 or 16 free spins and pay an
  instant 1×, 3× or 10× total bet.` The card body inherits `--fs-font-display`, which is
  `'Orbitron', system-ui, sans-serif` (`frontend/src/app.css:97`), at `font-size: 0.72rem`
  under the `max-height: 400px` block that applies here
  (`frontend/src/lib/components/IntroSplash.svelte:119`), so 11.52px. In this face the lining
  figure `5` and the capital `S` are near identical squared forms and they are adjacent in
  `5 Scatters`; the figure `8` and the capital `B` are likewise near identical, so `award 8,`
  presents as `award B,`. The screen that states the award schedule is the screen where its
  numerals are least separable, and it is gated before the first spin, so every viewer meets
  it.
- Resolution note: NEW AT 1600PX. Numeral letterform ambiguity is precisely the class the
  native pass could not resolve, and the superseded shard makes no claim about it.
- Where fixable: `frontend/src/app.css:97` (the face) and
  `frontend/src/lib/components/IntroSplash.svelte:119` (the size at this profile). Not locked.
- Proposed fix: PARK(the face is the brand face and swapping it is an art call). The bounded
  mitigation is to stop shrinking this block to 11.52px at short viewports, since the
  ambiguity is a function of size as much as of design, or to spell the counts as words on
  this card alone.

## Withdrawn during STEP 3, recorded so they are not re-derived

Both were written from the 1600px frames in STEP 2 and are refuted by the source. They are
kept because a withdrawn finding is evidence about the instrument, and because the second one
would otherwise have overturned a correctly signed absence in the shard I supersede.

**WITHDRAWN, the `Continue` button is not in a foreign font family.** The STEP 2 draft claimed
the label `Continue` on frame `160` rendered in a monospace fallback while the card body
rendered in the brand face, and cited the even letter advances and the round `C`, `e` and `t`
as evidence of a system font leak. The source refutes it on three counts:
`.intro-continue` sets `font-family: var(--fs-font-numeric)`
(`frontend/src/lib/components/IntroSplash.svelte:135`); `--fs-font-numeric` is
`'Orbitron', 'Courier New', monospace` and `--fs-font-display` is
`'Orbitron', system-ui, sans-serif` (`frontend/src/app.css:97-98`), so both stacks lead with
the same face; and `frontend/src/main.ts:2-4` self-hosts Orbitron at 400, 700 AND 900, so the
weight the button asks for (`font-weight: 900`,
`frontend/src/lib/components/IntroSplash.svelte:136`) is present and cannot trigger a family
fallback. The even advances I read as monospacing are `letter-spacing: 0.12em` (`:137`) on a
wide geometric face. The card heading uses the identical token and weight
(`.intro-title`, `:82-84`), which is the control I should have compared against and did not.
**This is the one place in this shard where the frames alone would have produced a false
finding**, and it would have contradicted STT-POPOUTS-A's correctly signed absence on system
font leakage. A's absence stands.

**WITHDRAWN, the amber mark left of the `Speed` row is a declared element, not a stray glyph.**
The STEP 2 draft called it an orphaned glyph resembling `(`, clipped by the menu panel's left
edge, present identically in `172` and `173`. It is
`.m-turbo-item[data-speed="normal"] { box-shadow: inset 3px 0 0 rgba(255, 200, 150, 0.26); }`
at `frontend/src/lib/components/HudOverlay.svelte:1640-1642`, a 3px inset leading edge that
follows the row's corner radius, which is why it presents as a curved stroke. The comment
above it at `:1638-1639` records the intent: "All three tiers carry the leading edge; it is
the edge's brightness that steps, so the row's shape never changes and only its intensity
does." What remains true and is NOT worth a finding on its own: at the `normal` tier the row's
own background is `rgba(0, 0, 0, 0.22)` over a near-black panel, so the row is invisible and
its leading edge reads as a detached mark rather than as an edge of anything. Offered to the
composition lens as an observation, not raised here as a typography defect.

## Native pass reconciliation

The superseded shard is `STT-POPOUTS-A.md`, scope 157 to 182. Frames 174 to 182 belong to a
sibling squad and its findings on them are not mine to judge; they are listed as OUT OF RANGE
with no verdict, deliberately, rather than being waved through.

| Native finding | Frames | Verdict |
|---|---|---|
| A-01 Continue button covers a sentence | 159, 160 | **CONFIRMED.** Independently re-derived from the 1600px frames before A was read, and the surviving-word transcription matches A's to the character. Reported here as STT-POPOUTS-1-03. |
| A-02 PAYTABLE menu item never renders | 172, 173 | **CONFIRMED.** Verified at source: the item is `HudOverlay.svelte:546`, `paytable: 'PAYTABLE'` is `translations.ts:271`, and both menu frames at 1600px show `Session` topmost with a clean band above it and no partial glyph. Signed honestly: my own frame pass missed it, so this is A's catch confirmed, not a second independent sighting. |
| A-03 HUD menu mixes title case and all caps | 172, 173 | **CONFIRMED.** Reported here as STT-POPOUTS-1-01 with A's source citations verified line by line. |
| A-04 Two heading registers across three overlays | 174, 178 to 182, 160 | **OUT OF RANGE, partially testable and not disposed of.** Only the frame 160 side is mine. I confirm that side: `.intro-title` sets no `text-transform` (`IntroSplash.svelte:82-89`), so `OVERDRIVE FREE SPINS` on 160 is caps by DATA. The session panel and paytable comparanda are on frames a sibling squad holds and I make no verdict on the cross-surface claim. |
| A-05 Rules prose left aligned on the card, centred in the paytable | 160, 177, 180 | **OUT OF RANGE, partially testable.** I confirm the frame 160 side: `.intro-rules { text-align: left }` (`IntroSplash.svelte:97`) and the wrapped lines on the 1600px render are flush left, so `bet.` and `feature.` begin at the same x as the lines above. The paytable half is a sibling squad's frames. No verdict on the pair. |
| A-06 Balance frozen at `$50K` while formats disagree | 161 to 173 | **CONFIRMED.** All thirteen frames re-read at 1600px; the balance string is `$50K` on every one. Reported here as STT-POPOUTS-1-08, with STT-POPOUTS-B's counter-evidence recorded beside it so the marshal sees both sides. |
| A-07 Two symbol payout cards on different baselines | 179 | **OUT OF RANGE.** Sibling squad's frame. No verdict. |
| A-08 Paytable scroll region bisects a text line | 175 to 182 | **OUT OF RANGE.** Sibling squad's frames. No verdict. |
| A-09 One menu label off the shared left edge | 172, 173 | **CONFIRMED but REFINED.** The defect is real. A's magnitude is wrong: it reports "about 9 px" and the true offset is **28px**, derivable from `.m-turbo-bolt { width: 20px }` plus `.m-turbo-item { gap: 0.5rem }` (`HudOverlay.svelte:1632-1637`), and my 1600px measurement gives 29px. A thumbnail-derived magnitude was off by a factor of three; the direction and the mechanism were right. Reported here as STT-POPOUTS-1-09. |
| A-10 Two small-caps label treatments in the paytable | 181, 182 | **OUT OF RANGE.** Sibling squad's frames. No verdict. |
| A's withdrawn multiplication-glyph draft | 160, 181, 182 | **THE WITHDRAWAL WAS CORRECT, and it holds at full resolution for the part I can test.** Frame 160 renders `1×, 3× or 10×` and `+1×` with U+00D7, matching `PaytableModal.svelte:95-97`. A was right to refuse a glyph claim it could not resolve. Recorded because the correct instinct there is the same instinct that produced my own withdrawn `Continue` draft, in the opposite direction. |
| A's signed absence, "No system font leakage and no fallback glyph" | all 26 | **CONFIRMED, and my challenge to it is withdrawn.** See the first withdrawn draft above. A's reading that the `Continue` label and the HUD numerals are `--fs-font-numeric` while prose is `--fs-font-display` is correct, and both stacks lead with Orbitron, which `main.ts:2-4` self-hosts at all three used weights. |
| A's signed absence, "No numeral shimmy on a non-`.fs-num` surface" | 161 to 173 | **CONFIRMED for my range**, with the same limit A implies and I state below: the HUD win pod is left-anchored at a constant x across `162`, `168`, `169`, `170` and `171`, and the bet and balance strings are identical across all thirteen HUD frames, so neither can shimmy. Two count-up samples cannot prove a count-up steady, and neither of us has consecutive mid-count frames of the pod. |
| A's signed absences on dashes, quotes, double spaces, ellipsis | all 26 | **CONFIRMED for frames 157 to 173.** Re-checked at 1600px, where the resolution is genuinely sufficient for the first time. See my own absences below. |
| A's LOUD note, frame 188 MODIFIED in the working tree | 188 | **RESOLVED, and A could not have known.** The sibling shard STT-POPOUTS-B self-reports at B-08 that IT caused the modification with an unguarded `sips` call carrying no `--out`, and that it restored the file with `git checkout --` on that single path. A's alarm was correct, its refusal to restore another squad's working state was correct, and the tree is clean of it now, as my own `tree_after` shows. Recorded here so A's open alarm does not reach the ledger as an unexplained one. |

## Explicit absences, signed

Each was looked for across all seventeen frames at 1600px, which is the first pass at which
most of these classes are actually judgeable. Where an absence cannot be fully supported I say
so rather than signing it.

- **No em dash and no en dash in player-visible prose.** The prose surfaces in range are the
  two rules bullets (`159`, `160`), the five menu labels (`172`, `173`), the three HUD labels
  and their values (`161` to `173`), the banner (`169` to `171`) and the win breakdown plate
  (`170`, `171`). Read character by character at 1600px. The only punctuation present anywhere
  in the range is the comma, the full stop, the `$`, the `+` in `+1×`, the `×` (U+00D7), the
  `!` on `WIN!`, the `›` bullet marker and the `.` decimal point. No hyphen-minus, no U+2013,
  no U+2014.
- **No mixed straight and curly quotes.** There is no apostrophe and no quotation mark of any
  kind on any of the seventeen frames, so the class cannot be violated here. Checked
  specifically on the two rules bullets, which are the only running prose in range and are
  written without contractions or possessives.
- **No double spaces.** Inter-word gaps on both rules bullets were compared across all four
  rendered lines at 1600px and are uniform. The four-token gaps on the win breakdown plate are
  `gap: 10px` between separate flex children
  (`frontend/src/lib/components/WinBreakdown.svelte:135`), not doubled spaces inside a string,
  which the source confirms rather than the frame.
- **No ellipsised string and no `text-overflow` ellipsis reaching a visible string** in this
  range. The one truncation in range, STT-POPOUTS-1-03, is a hard occlusion with no ellipsis,
  which is why it reads as broken rather than as truncated.
- **No missing-glyph box and no tofu.** The `›` marker on `160`, the `×` on `159` and `160`,
  the `$` on every HUD frame and the `K` suffix on `$50K` all render in their surrounding
  face. KNOWN_OPEN Q-07's allowlisted infinity glyph is on the autoplay panel, which is not
  captured in this range.
- **No money pod clipping, ellipsising or overflowing**, so **no fresh evidence for
  TR-115 / TR-086 from frames 157 to 173**. `$50K`, `$0.00`, `$3.90`, `$10.27`, `$15.94`,
  `$16.20` and `$1.00` all sit inside their containers with clearance on every frame that
  carries them. Recorded as a positive absence because STT-POPOUTS-1-08 explains why: at this
  profile the fit mechanism abbreviates rather than clips.
- **No `.fs-num` shimmy claim is made**, per KNOWN_OPEN TR-089. Signed with its limit stated:
  on the OTHER numeric surfaces, where a finding would be new, I found none across the samples
  available. The HUD win pod is left-anchored at a constant x across `162` (`$0.00`), `168`
  (`$3.90`), `169` (`$15.94`), `170` and `171` (`$16.20`); the bet pod and the balance are
  glyph-identical across all thirteen HUD frames and therefore cannot shimmy. **NOT SIGNED as
  clean:** this capture set holds no consecutive mid-count frames of the HUD pod, and MID-01
  establishes that the pod does run its own 528ms count-up, so the one surface where shimmy
  could occur is the one surface these frames cannot rule on.
- **No placeholder string on any non-symbol surface, and one ON a symbol surface.** No lorem,
  no untranslated key, no `undefined`, no `NaN` on any of the seventeen frames. The identity
  map at `WinBreakdown.svelte:15-17` is the exception and is reported as STT-POPOUTS-1-05.
- **No letter-spacing or weight mismatch between two instances of one component.** The five
  menu rows share `.hud-menu-item` and match each other in size, weight and tracking; the
  three HUD stat labels share `.m-stat-label` and match; the two rules bullets share
  `.intro-rules li` and match. The differences reported above are between DIFFERENT components,
  which is a different claim and is made as one.
- **The splash frames carry no typography at all.** `157` and `158` are the logo raster on a
  dark field: no version string, no loading text, no legal line, no title type. Nothing to
  judge, and nothing a splash is obliged to carry is missing.
- **KNOWN_OPEN Q-27 not observable in this range.** No hyperlink and no unstyled surface
  reaches any of the seventeen frames, so the Vite scaffold link colour cannot show. Recorded
  beside it as enumeration rather than as a finding, because Q-27's list does not name it: the
  scaffold's `button { }` element reset survives at `frontend/src/app.css:145-156`, including
  `background-color: #1a1a1a`, `font-weight: 500` and `button:hover { border-color: #646cff }`,
  the stock Vite indigo. Every button on these frames carries a class that overrides it, so
  nothing shows, and it is offered only to widen Q-27's enumeration.
- **KNOWN_OPEN TR-104 not observable in this range.** This session is `lang: en`
  (`MANIFEST.json`), so English on frames `169` to `171` is correct behaviour and says nothing
  about the de and ar sessions the row concerns. Recorded so English frames are not misread as
  TR-104 sightings.
- **KNOWN_OPEN TR-114 not observable.** No replay surface falls in this range, which is why
  the replay half of STT-POPOUTS-1-07 is flagged as source-derived rather than frame-proven.
- **KNOWN_OPEN Q-34 not observable in this range.** No mode name (`Cruise` or `CRUISE`)
  appears on frames 157 to 173.
- **Frames outside 157 to 173 were not opened.** No claim here rests on any frame a sibling
  squad holds. Where a native finding needed one, I recorded OUT OF RANGE and gave no verdict.

## KNOWN matches

- **KNOWN(MID-01)**, fresh evidence at the Popout S viewport, on the frame pair the ledger
  predicted by name. Frame
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/169_popout-s_transition_bigwin_countup_early.png`
  shows the banner at `$10.27` while the HUD WIN pod in the same frame already reads `$15.94`,
  on a win that settles at `$16.20` on
  `/Users/jt/math-sdk/.evidence-scratch/stream-test-upscaled-1600/171_popout-s_bigwin_settled.png`
  where both read `$16.20`. The two readouts disagree by **`$5.67`** at that instant, against
  the `$5.66` the ledger measured on the desktop frame `013` (`$10.29` against `$15.95`).
  Recorded as a divergence in the third significant figure, not as a discrepancy: the two
  captures sample different instants of the same 1400ms and 528ms pair.
- **KNOWN(MID-02)**, fresh evidence. Frames `169`, `170` and `171` all render the unit line as
  `16x BET`. Confirmed at source rather than only in pixels:
  `frontend/src/lib/components/WinBanner.svelte:205` is
  `$: multLabel = \`${Math.round(shownMultiplier)}x\``, ASCII `x`, exactly as the ledger
  states, and the unit beside it is `$: multUnitLabel = sv('BET', $isSocial)` at `:210`, which
  is the line the ledger names as TR-104's remaining half. Both are still in place at the
  epoch these frames were captured. STT-POPOUTS-1-06 reports a sixth instance of the same
  class at a third site.
- **KNOWN(Q-16 park)**, one further parked string to add to the enumeration, from within my
  range: `frontend/src/lib/components/WinBreakdown.svelte:94` renders the hardcoded English
  literal `ways` beside a `$tr`-routed sibling on the same plate, and it is player-visible for
  the duration of every win, on frames `170` and `171`. Q-16's enumeration names autoplay
  labels, paytable section headers, the max win overlay line, `Mute`/`Unmute` and aria labels.
  It does not name this one. Offered as enumeration, not as a new row, and the park stays
  parked.
- **No match for KNOWN_OPEN TR-115 / TR-086, TR-112, TR-114, Q-26 (as written), Q-27, Q-34 or
  Q-07** in frames 157 to 173. Each is addressed individually under Explicit absences above
  rather than left silent, because an unmentioned row and an absent row look identical to a
  marshal.

tree_after:

```
?? reports/qa/stream_test/shards/STC-POPOUTS-1.md
?? reports/qa/stream_test/shards/STC-POPOUTS-2.md
?? reports/qa/stream_test/shards/STM-POPOUTS.md
?? reports/qa/stream_test/shards/STT-POPOUTS-1.md
?? reports/qa/stream_test/shards/STT-POPOUTS-2.md
?? reports/qa/stream_test/shards/STT-POPOUTS-3.md
```

Every entry is untracked. `STT-POPOUTS-1.md` is mine and is the only file this squad wrote;
the other five are sibling squads' shards and are neither mine nor my concern. The count rose
by one between my first and last status call as another squad landed `STC-POPOUTS-2.md`, which
is expected in a concurrent wave. **Nothing shows
as MODIFIED and nothing shows as DELETED.** No committed evidence frame was written to: every
frame read came from `.evidence-scratch/stream-test-upscaled-1600/`, no image tool was invoked
against any path under `reports/screens/`, and no scratch file was produced at all.
