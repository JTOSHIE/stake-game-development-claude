# Capture catalogue, 2026-07-27

Track: `track/screenshot-analyst`, round 3. Duties 1 (intake), 2 (catalogue),
3 (within frame arithmetic), 4 (between frame arithmetic) and 5 (visual lens).
Timestamps are the capture time carried in the source filename, local time, and
they are also the ordering key duty 4 uses.

## What was found on the Desktop, and what was ingested

Twenty two loose captures on `~/Desktop` post date the previous intake's last
frame (2026-07-26 15:02:04). **Fourteen of them are already committed**, by two
other sessions, and were confirmed identical by MD5 rather than by filename:

| already committed under | frames | source times |
| --- | --- | --- |
| `reports/screens/live-shapes-2026-07-26/` | 01 to 06 | 15:36:45 to 19:33:08 |
| `reports/screens/live-round2-2026-07-26/` | 01 to 08 | 19:59:25 to 20:22:12 |

Those fourteen are NOT re-ingested. The brief's own parenthesis limits this track
to new capture sets, never altering existing evidence, and re-committing another
session's frames under new names would put two copies of the same evidence in the
repository. They are read, catalogued in section 3 and used for duty 4.

**Eight are genuinely new and are ingested here**, into
`reports/screens/screenshot-analyst-2026-07-27/`.

Excluded and reported by exclusion, per duty 1: nothing. Every one of the
twenty two is a project capture. No personal or non project material was found
loose on the Desktop in this window. The `FS_UPLOAD_KIT_V5` and `FS_UPLOAD_KIT_V6`
folders were checked and contain build output only, no captures.

`SA-016` held: one filename, `Screenshot 2026-07-26 at 11.09.01<U+202F>pm.png`,
carries a narrow no break space before `pm` and could not be opened by its
apparent path. It was resolved by listing the directory in Python. That is the
frame now committed as `08_...`.

---

## 1. The new capture set

### 01_dtt_bonus_row_275430_cost_column_reads_bet_level_1000.png

- **Captured** 2026-07-27 02:23:45. 791 by 718.
- **Purpose tag** The owner's bet size question. Should prove what the HUD, the
  platform COST column and the platform MULT column each read at the same instant,
  with a `bonus` round in the panel.
- **Surface** Live game in the Stake Engine DTT popout, Bets panel docked right.
- **Viewport** Game pane roughly 360 by 660 css px, portrait shaped.
- **Figures verbatim** BALANCE `€1,167,050.00`; WIN `€0.00`; BET `€1,250.00`;
  badge `OVERBOOST` above the BET plate; pill `FEATURES  OVERBOOST`; turbo `1x`.
  Panel `Bets 10`, `Guidelines 0/58`, columns `TIME MODE COST PAYOUT MULT STAT`.
  Rows, newest first: `02:23:39 antelite €1,000.00 €0.00 -`,
  `02:23:35 antelite €1,000.00 +€310.00 ×0.31`,
  `02:23:33 antelite €1,000.00 €0.00 -`,
  `02:22:50 bonus €1,000.00 +€275,430.00 ×275.43`,
  `02:22:42 base €1,000.00 €0.00 -`,
  `02:22:39 base €1,000.00 +€100.00 ×0.10`,
  `02:22:37 base €1,000.00 €0.00 -`,
  `02:22:25 base €1,000.00 +€550.00 ×0.55`,
  `02:22:21 base €1,000.00 €0.00 -`,
  `02:22:18 base €1,000.00 +€410.00 ×0.41`. All `Se[ttled]`.
- **Within frame** BET `€1,250.00` against a `€1,000.00` level is exactly 1.25x,
  which is `MODE_COST.antelite`. Every MULT equals payout divided by the COST
  cell. Consistent.
- **VERDICT: CORRECT.** `1,000.00 x 1.25 = 1,250.00` in the HUD; the COST column
  is the bet level by platform convention, not a charge; and the ten rows close
  the wallet exactly: debits `6 x 1,000.00 + 3 x 1,250.00 + 100,000.00 =
  109,750.00`, credits `276,800.00`, net `+167,050.00`, closing `1,167,050.00`,
  implied opening `1,000,000.00` to the cent.

### 02_play_response_antelite_amount_1000000000_is_bet_level_hud_1250.png

- **Captured** 2026-07-27 02:27:04. 2393 by 770.
- **Purpose tag** The field behind the COST column. Should prove what the
  platform actually stores against an `antelite` round.
- **Surface** DTT popout with the Bets panel, plus Chrome DevTools Network with
  the `wallet` filter and a `play` response open.
- **Viewport** Full desktop, game pane roughly 990 by 570 css px, landscape.
- **Figures verbatim** BALANCE `€501,870.00`; WIN `€0.00`; BET `€1,250.00`;
  `OVERBOOST` badge; turbo `4x`; pill `FEATURES  OVERBOOST`. Panel `Bets 11`.
  Rows: `02:26:53 antelite €1,000.00 €0.00 -`,
  `02:26:51 antelite €1,000.00 +€480.00 ×0.48`,
  `02:26:48 antelite €1,000.00 +€10,750.00 ×10.75`,
  `02:26:24 base €1,000.00 +€870.00 ×0.87`,
  `02:26:22`, `02:26:21`, `02:26:20`, `02:26:19`, `02:26:18` all
  `base €1,000.00 €0.00 -`, `02:26:14 base €1,000.00 +€610.00 ×0.61`,
  `02:26:06 base €1,000.00 +€910.00 ×0.91`. Response body:
  `"betID": 1056576699`, `"amount": 1000000000`, `"payout": 480000000`,
  `"payoutMultiplier": 0.48`, `"active": true`, `"mode": "antelite"`,
  `"state": [ { "index": 0, "type": "reveal", "board": [ ... "M1" ... "L3" ...
  "L2" ... "W" wild true ... ] } ]`.
- **Within frame** `amount` 1,000,000,000 micros is `€1,000.00`, the bet level,
  and the COST cell on the matching `02:26:51` row reads the same `€1,000.00`.
  `payout` 480,000,000 micros is `€480.00` and matches that row's PAYOUT.
  `payoutMultiplier` 0.48 is `480 / 1,000`, so it too is against the level.
- **VERDICT: CORRECT.** The platform stores the level, our HUD shows the charge,
  and the eleven rows close the wallet: debits `11,750.00`, credits `13,620.00`,
  net `+1,870.00`, closing `501,870.00`, implied opening `500,000.00` to the cent.

### 03_desktop_v1_background_in_game_balance_479710_bet_1250.png

- **Captured** 2026-07-27 02:30:41. 1195 by 679.
- **Purpose tag** The adopted V1 background in game at desktop, and the HUD at a
  large balance.
- **Surface** Live game, full pane, no panels.
- **Viewport** 1195 by 679 capture, landscape desktop.
- **Figures verbatim** BALANCE `€479,710.00`; WIN `€0.00`; BET `€1,250.00`;
  `OVERBOOST` badge above the BET plate; pill `FEATURES  OVERBOOST`; turbo `4x`;
  `MAX` present and dimmed. Board is a settled 5 by 4 with no win strip.
- **Within frame** `€1,250.00` against the same `€1,000.00` level as frames 01
  and 02 is 1.25x. Nothing else to reconcile inside the frame.
- **VERDICT: CORRECT.** Every readout renders in full, including the six figure
  balance with cents, at this width.
- **Visual lens** Reel frame outer bracket spans roughly x 300 to x 890 against a
  1195 wide capture, so the stage is centred to within a few pixels. No clipping,
  no truncation, no overlap. The scene reads as one image: character and car over
  the adopted rain city, no halo or cut out edge at the layer seam.

### 04_DEFECT_popout_s_balance_479710_renders_as_479.png

- **Captured** 2026-07-27 02:31:05. 426 by 314.
- **Purpose tag** The recomposed small screen. Should prove the mini strip is
  legible after the smallscreen recompose pass.
- **Surface** DTT `Screen` tab at popout size, game pane only.
- **Viewport** Game pane roughly 355 by 226 css px, the mini player profile.
- **Figures verbatim** `BAL €479`  `WIN €0`  `€1,250.00` between two gold
  chevrons. Controls: settings button, menu button, bet down, bet value, bet up,
  play.
- **Within frame** `€1,250.00` is correct for the level and mode. **`BAL €479` is
  not the balance.** The same wallet reads `€479,710.00` in frame 05 eleven
  seconds later and in frame 03 twenty four seconds earlier.
- **VERDICT: DEFECT.** The balance readout understates the player's balance by
  three orders of magnitude. Reproduced from the shipped bundle at 355 by 226:
  the element's text is `€479.7K`, `data-fit-mode` is `compact`, `data-fit-px` is
  `9.00` at a floor of 9, `clientWidth` 25 against `scrollWidth` 42, and
  `.m-stat-value` carries `overflow: hidden` with no ellipsis. Ledgered `SA-021`,
  severity HIGH. Reproduction evidence in `repro/`.
- **Visual lens** `WIN €0` is the compact form of `€0.00` and is correct rather
  than cut, confirmed by the same reproduction. The bet value renders in full.

### 05_narrow_pane_balance_479710_in_full_bet_1250.png

- **Captured** 2026-07-27 02:31:16. 434 by 782.
- **Purpose tag** The control frame in the recomposed narrow pane, and the same
  balance at a width where it fits.
- **Surface** DTT `Screen` tab, narrow tall pane, Bets panel clipped at the right
  edge.
- **Viewport** Game pane roughly 360 by 700 css px, portrait shaped.
- **Figures verbatim** BALANCE `€479,710.00`; WIN `€0.00`; BET `€1,250.00`;
  `OVERBOOST` badge; pill `FEATURES  OVERBOOST`; turbo `4x`; `MAX` dimmed.
  Bets panel: `TIME` column only, eighteen rows visible, every one reading
  `02:27:` with the seconds outside the frame.
- **Within frame** Same level and mode as frames 03 and 04, `1.25x` again, and
  the balance agrees with frame 03 to the cent.
- **VERDICT: CORRECT.** This is the control that makes frame 04 a defect rather
  than a design choice: the same value, same session, same minute, rendered in
  full as soon as the pane is wide enough.
- **Visual lens** The Bets panel is cut to its TIME column by the pane width.
  That is the DTT's own panel outside our game surface, so it is not our
  clipping, but it is why the 02:27 rows cannot be used for duty 4.

### 06_paytable_ways_to_win_and_symbol_payouts.png

- **Captured** 2026-07-27 02:44:56. 899 by 401.
- **Purpose tag** The paytable after the card fill fix. Should prove nothing
  shows through a card and the payouts read correctly.
- **Surface** Paytable modal, WAYS TO WIN and SYMBOL PAYOUTS, cropped by the
  owner to the top of the sheet.
- **Viewport** Cropped region of a desktop pane.
- **Figures verbatim** `WAYS TO WIN`, reels `1 2 3` lit and `4 5` dim, caption
  `Reels 1, 2 and 3 hold the same symbol (highlighted), which is a match read
  left to right from reel 1. Reels 4 and 5 are not require[d]` (cut by the
  owner's crop, not by the game). `SYMBOL PAYOUTS`: `WILD  Substitutes for all
  symbols except SCATTER`; `SCAT  3 / 4 / 5 = 1x / 3x / 10x + 8 / 12 / 16 free
  spins`; `H1  3x 1.5  4x 6  5x 22`; `H2  3x 0.8  4x 3  5x 10`;
  `M1  3x 0.45  4x 1.5  5x 5`.
- **Within frame** H1 `22 / 6 / 1.5` and the scatter `1x / 3x / 10x` match
  `CLAUDE.md` exactly. Card fills are opaque and no background shows through.
- **VERDICT: CORRECT.** No money figures to reconcile; every paytable figure
  matches the committed specification.

### 07_turbo_bolt_1x_and_max_control.png

- **Captured** 2026-07-27 02:46:43. 222 by 256.
- **Purpose tag** The speed control after the fixpack. Should prove the control
  is the bolt alone with its speed numeral.
- **Surface** Control cluster, cropped by the owner to the bolt and MAX.
- **Figures verbatim** bolt glyph with `1x` beneath it; `MAX` button beside it.
- **VERDICT: CORRECT.** No money figures. The bolt carries its own numeral and
  the two controls do not overlap at this crop.

### 08_local_dev_v1_background_win_21228_bet_100.png

- **Captured** 2026-07-26 23:09:01. 2670 by 1638.
- **Purpose tag** The adopted V1 background in game on the local build, and a
  settled win with the per line strip showing.
- **Surface** Local development build at `192.168.4.92:5173`, `DEV` badge visible
  bottom right, full browser window.
- **Viewport** Retina capture of roughly a 1335 css px wide window, landscape.
- **Figures verbatim** BALANCE `$311.28`; WIN `$212.28`; BET `$1.00`; win strip
  `M2  x3  1 ways  $0.30`; pill `FEATURES` with no OVERBOOST badge; turbo `4x`.
  Partially visible behind the browser window, one row of a Bets panel from an
  earlier session: `14:24:03  bonus  €1,000.00  +€182,350.00  x182.35  Settled`.
- **Within frame** `$` currency and no OVERBOOST, so BET `$1.00` is the level and
  the charge both. The win strip shows one line of a multi line round, so
  `$0.30` under a `$212.28` total is not a disagreement. Balance and win cannot
  be reconciled without a second frame.
- **VERDICT: CORRECT**, with the caveat that this frame carries no second anchor,
  so it is internally consistent rather than reconciled.
- **Visual lens, and the SA-008 measurement that was never taken.** Measured at
  native capture resolution: the per line win strip's lower edge and the reel
  frame's inner neon border are coincident, and the silver frame rail begins
  about 16 native px below that, so roughly 8 css px of clearance at this
  capture's scale. Nothing is cut off and the strip's text is clear of every
  edge. That is crowding, not clipping, which is what `SA-008` recorded without
  a measurement. The measurement now exists.
- The partially visible `bonus` row behind the window is a fourth independent
  instance of the COST column carrying the bet level: `€1,000.00` COST against a
  `+€182,350.00` payout at `x182.35`, which is `182,350 / 1,000`.

---

## 2. Between frame arithmetic for this set

Full working, generated rather than typed, in
`reports/qa/live_stats/2026-07-27_money_timeline.md`, with the machine readable
rows in `reports/qa/live_stats/2026-07-27_bets_rows_and_reconciliation.json`.

| leg | frames | result |
| --- | --- | --- |
| S2 | 01, closed inside itself | **CLOSES to 0.00.** Implied opening `€1,000,000.00` exactly |
| S3 | 02, closed inside itself | **CLOSES to 0.00.** Implied opening `€500,000.00` exactly |
| 01 to 02 | 02:23:45 to 02:27:04 | **Does not join, by design.** The wallet was re-seeded; `Bets 10` restarts as `Bets 11` on a fresh row set and five `authenticate` calls sit in the Network panel |
| 02 to 03 | 02:27:04 to 02:30:41 | **OPEN.** `-€22,160.00` with the intervening rows not in evidence. Not forced, per (l.6) |
| 03 to 04 | 02:30:41 to 02:31:05 | Same wallet, no rounds between. Frame 04 renders it as `€479` |
| 04 to 05 | 02:31:05 to 02:31:16 | Same wallet, no rounds between. Frame 05 renders it as `€479,710.00` |

---

## 3. Committed frames re-read this pass

Read for duties 3, 4 and 5. Not re-ingested; the paths below are the existing
evidence.

### `reports/screens/live-round2-2026-07-26/`

- **01**, 19:59:25, Bet Replay of `super` event 22975 at amount 750 EUR. Neon
  instrument plate reads `MULTIPLIER  5000.0x` and `WIN  3750000.00`, beside a
  `MEGA WIN!!!` banner whose own amount ends `0,000.00`. **VERDICT: DEFECT**, and
  not a money arithmetic one: `3,750,000 / 750 = 5,000.00` is exactly right, but
  the figure is rendered with no thousands separators and no currency symbol, and
  it overflows its plate. Ledgered `SA-022`.
- **02**, 19:59:41, the same replay a moment later: `MAX WIN REACHED!` overlay,
  `5,000` `x` `BET`, `COLLECT`, `Press COLLECT or hit Enter to continue`.
  **VERDICT: CORRECT**, and it closes `SA-018`, which had recorded that no
  capture of this overlay existed anywhere in the repository.
- **03**, 20:15:07, `antelite` at a `€20.00` level: HUD BET `€25.00`, COST column
  `€20.00`, response `"amount": 20000000`, `"mode": "antelite"`, `"payout": 0`.
  **VERDICT: CORRECT.** `20.00 x 1.25 = 25.00`.
- **04**, 20:19:50, the FEATURES menu at a `€7.00` level: `SPIN COST €8.75`,
  `BET €7.00`, OVERBOOST card `1.25x bet` and `1.25x per spin while ON · €8.75`,
  Buy Overdrive `100x · €700.00`, footer `All modes · RTP 96.35%`. Bets row
  `20:19:06 bonus €7.00 +€288.54 ×41.22`. Response `"amount": 7000000`,
  `"payout": 288540000`, `"payoutMultiplier": 41.22`, `"mode": "bonus"`.
  **VERDICT: CORRECT**, and it is the clearest single frame in the whole evidence
  base: our menu states 8.75 and 700.00 while the platform row states 7.00.
- **05**, 20:21:28, portrait pane: BALANCE `€512.29`, WIN `€0.00`, BET `€8.75`,
  `Bets 6` with all six rows visible. **VERDICT: CORRECT.** The six rows close
  the wallet to 0.00 against an opening of exactly `€1,000.00`.
- **06**, 20:21:46, mobile L: same three readouts, in full. **VERDICT: CORRECT**
  on money. The dead space between the bet plate and the control cluster is that
  session's own finding, `TR-084` class, not re-raised here.
- **07**, 20:21:58, mobile M layout. No new money figures.
- **08**, 20:22:12, popout S: `BAL €512.2`  `WIN €0.00`  `€8.75`. **VERDICT:
  DEFECT**, same class as frame 04 of this set: the balance is cut, here to a
  string that still looks complete. Folded into `SA-021`.

### `reports/screens/live-shapes-2026-07-26/`

- **01**, 15:36:45, DTT Replay panel: `super`, event `22975`, amount `750`,
  currency `EUR (Euro)`. Input state only.
- **02**, 16:28:33, tile editor, background `no file chosen`. No money figures.
- **03**, 19:19:18, sync dialog, `upload 4  delete 3  skip 104`. No money figures.
- **04**, 19:30:08, authenticate response: `"mode": "bonus", "costMultiplier":
  100, "maxBet": 1000000000`; `"mode": "super", "costMultiplier": 400, "maxBet":
  1000000000`; `"jurisdiction"` all flags false with `minimumRoundDuration: 0`;
  `"balance": { "amount": 996800000, "currency": "EUR" }`. HUD in the same frame:
  BALANCE `€995.06`, WIN `€0.76`, BET `€1.00`, strip `M2  x3  2 ways  €0.60`.
  **VERDICT: CORRECT**, and this is the frame that turns `SA-002` from an
  inference into a platform fact: the platform holds the cost multiplier as its
  own field and still renders the level in the COST column.
- **05**, 19:30:53, play response: `"betID": 1055919443`, `"amount": 1000000`,
  `"payout": 800000`, `"payoutMultiplier": 0.8`, `"mode": "base"`. **VERDICT:
  CORRECT.** `amount` is the level in micros for `base` too, where level and
  charge happen to be equal.
- **06**, 19:33:08, end round response: `{"balance":{"amount":995060000,
  "currency":"EUR"}}`, which is `€995.06` and matches the HUD in frame 04.
  **VERDICT: CORRECT.**

---

## 4. Visual lens, per viewport

| profile | frames | finding |
| --- | --- | --- |
| desktop landscape, roughly 1200 css px | 03, 08 | Clean. Stage centred, all three readouts in full with cents, no clipping or overlap. Win strip crowding measured at frame 08 and it is crowding, not clipping |
| narrow tall pane, roughly 360 css px | 01, 05 | Clean on our surface. Everything renders in full. The DTT's own Bets panel is cut by the pane, which is outside our game |
| mini player, roughly 355 by 226 css px | 04 | **BALANCE cut without an ellipsis, `SA-021`.** Every other control legible and correctly sized |
| paytable modal | 06 | Clean. Card fills opaque, payout figures correct |
| Bet Replay | live-round2 01 | **Value overflows its plate and is formatted without separators or symbol, `SA-022`** |

---

## 5. Assignment C, the background and its Overdrive variant

**The adopted V1 background is live in game**, in every full pane capture of this
intake: frames 03, 05 and 08 of this set, and frame 02's game pane. The same rain
city, the same character and car, at both the local development build (frame 08,
`192.168.4.92:5173`) and the platform DTT (frames 02, 03, 05).

**The Overdrive variant is a real, measurably different image**, measured on the
shipped assets rather than judged from a picture:

| asset | mean R | mean G | mean B | R minus B |
| --- | --- | --- | --- | --- |
| `bg_base.jpg` | 56.23 | 77.84 | 97.32 | -41.09 |
| `bg_overdrive.jpg` | 56.90 | 65.57 | 97.12 | -40.22 |

Same city, and the difference is almost entirely **green removed**, 15.8 per cent
of it, with red up 1.2 per cent and blue flat. The rendered proofs in
`reports/screens/background-adopted-2026-07-27/` differ over 489,162 of 810,000
pixels, so the crossfade is wired and the two states are not the same frame.

**Stated precisely, because the brief's phrase was "hotter light":** the variant
is hotter in the magenta direction, not the red direction. Red against blue is
unchanged to within one unit. Whether that is the intended reading is a design
call for the owner, not this track's.

**What is NOT confirmed:** no capture in this intake shows the Overdrive variant
in game. Free spins do not appear in any of the eight frames, so the crossfade
has been proven in the asset and in the offline render, and not in live play. One
paired capture closes it: the same window, same size, one frame in base play and
one during Overdrive Free Spins.

**The seam anomaly.** At the character and car layer over the backdrop there is
no halo, no cut out edge and no colour fringe at native resolution. The anomaly is
on the adopted art itself: a hard dark near vertical stroke runs down the car's
rear quarter panel, crossing both the gold trim line and the magenta underglow,
and stopping dead in the middle of the panel. It is baked into the shipped sprite
`frontend/public/assets/themes/future-spinner/ui/scene_car.png`, at column
x 1864, y 263 to 554 of a 2840 by 1000 image, so it is not a compositing
artefact of the live build. Visible to a player in frame 03. Ledgered `SA-023`.
