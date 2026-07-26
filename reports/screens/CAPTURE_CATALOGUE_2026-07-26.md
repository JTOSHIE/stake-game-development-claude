# Capture catalogue, 2026-07-26

Track: `track/screenshot-analyst`. Duties 2 (catalogue), 3 (within-frame
arithmetic) and 5 (visual lens). Timestamps are the capture time carried in the
source filename, local time, and they are also the ordering key duty 4 uses.

Set: `reports/screens/screenshot-analyst-2026-07-26/`, nine captures.
Sixteen committed frames from other sets were re-read for duties 4 and 5 and are
catalogued in section 3.

---

## 1. New capture set

### 01_hud_bet_1250_overboost_on_balance_103474.png

- **Captured** 2026-07-26 12:12:33
- **Purpose tag** The owner's OVERBOOST observation. Should prove what the HUD
  BET box reads while the enhancer is toggled on.
- **Surface** Live game in the Stake Engine DTT popout, Bets panel docked right.
- **Viewport** Desktop browser, game pane roughly 916 by 700 css px, landscape.
- **Figures verbatim** BALANCE `$1,034.74`; WIN `$0.00`; BET `$12.50`; badge
  `OVERBOOST` above the BET box; pill `FEATURES  OVERBOOST` at reel right;
  turbo dial `4x`. Bets panel `Bets 50`, `Guidelines 0/58`. Newest rows:
  `12:11:57 base $1.00 $0.00`, `12:11:56 base $1.00 $0.00`,
  `12:11:55 base $1.00 $0.00`, `12:11:54 base $1.00 $0.00`,
  `12:11:52 base $1.00 +$14.88 x14.88`, `12:11:50 base $1.00 +$0.91 x0.91`,
  `12:11:49 base $1.00 $0.00`, `12:11:48 base $1.00 $0.00`,
  `12:11:47 base $1.00 $0.00`, `12:11:45 base $1.00 +$0.88 x0.88`,
  `12:11:44 base $1.00 $0.00`, `12:11:43 base $1.00 $0.00`,
  `12:11:41 base $1.00 +$0.40 x0.40`, `12:11:40 base $1.00 +$0.16 x0.16`,
  `12:11:38 base $1.00 $0.00`, `12:11:37 base $1.00 +$0.55 x0.55`,
  `12:11:36 base $1.00 $0.00`, `12:11:07 base $1.00 +$74.01 x74.01`,
  `12:11:06 base $1.00 $0.00`, `12:11:04 base $1.00 +$0.82 x0.82`.
- **Within-frame** BET `$12.50` against an implied bet level of `$10.00` is
  exactly 1.25x, which is `MODE_COST.antelite`. Every listed MULT equals payout
  divided by COST. Consistent. Note the panel rows are `base` at `$1.00`: the
  mode and bet level were changed after 12:11:57 and before the first `antelite`
  row at 12:12:48, so this frame is the "before" of the OVERBOOST timeline.

### 02_bets_page_antelite_cost_1000_not_effective_1250.png

- **Captured** 2026-07-26 12:13:11
- **Purpose tag** The surface the owner's observation matches. Should prove what
  the platform Bets page COST column shows for an `antelite` row.
- **Surface** Stake Engine dashboard Bets panel, cropped to the panel alone.
- **Viewport** Panel crop, roughly 407 by 703 px.
- **Figures verbatim** `Bets 50`, `Guidelines 0/58`. Columns
  `TIME MODE COST PAYOUT MULT STATUS`. Rows, newest first:
  `12:13:15 antelite $10.00 $0.00 -`,
  `12:13:13 antelite $10.00 +$5.50 x0.55`,
  `12:13:11 antelite $10.00 +$53.50 x5.35`,
  `12:13:10 antelite $10.00 $0.00 -`,
  `12:13:08 antelite $10.00 +$4.20 x0.42`,
  `12:13:07 antelite $10.00 $0.00 -`,
  `12:13:05 antelite $10.00 +$1.80 x0.18`,
  `12:13:04 antelite $10.00 $0.00 -`,
  `12:13:03 antelite $10.00 +$4.20 x0.42`,
  `12:13:01 antelite $10.00 $0.00 -`,
  `12:13:00 antelite $10.00 $0.00 -`,
  `12:12:59 antelite $10.00 $0.00 -`,
  `12:12:57 antelite $10.00 +$246.00 x24.60`,
  `12:12:56 antelite $10.00 $0.00 -`,
  `12:12:55 antelite $10.00 $0.00 -`,
  `12:12:54 antelite $10.00 $0.00 -`,
  `12:12:52 antelite $10.00 $0.00 -`,
  `12:12:51 antelite $10.00 +$5.50 x0.55`,
  `12:12:49 antelite $10.00 +$1.50 x0.15`,
  `12:12:48 antelite $10.00 $0.00 -`. All `Settled`.
- **Within-frame** Every MULT equals payout divided by the `$10.00` COST value.
  Internally consistent. The `$10.00` disagrees with the HUD's `$12.50` in frame
  01, which is the whole point of the frame and is resolved in the ledger at
  SA-001 and SA-002.

### 03_freespins_12_intro_balance_82154_bet_1250.png

- **Captured** 2026-07-26 12:15:04
- **Purpose tag** First balance anchor for the `antelite` reconciliation, and a
  feature-entry render.
- **Surface** Live game, Overdrive Free Spins intro overlay, Bets panel right.
- **Viewport** Desktop landscape, game pane roughly 916 by 700 css px.
- **Figures verbatim** Overlay `OVERDRIVE FREE SPINS`, `+12 FREE SPINS`,
  `CLICK TO CONTINUE`. Side panels `OVERDRIVE FREE SPINS 12`,
  `TOTAL WIN $62.50`, `MULTIPLIER 1x`. HUD BALANCE `$821.54`; WIN `$0.00`;
  BET `$12.50`; `OVERBOOST` badge. Win-line strip under the reels
  `L1 x5 2ways $50.00`. Newest Bets rows:
  `12:13:48 antelite $10.00 +$874.70 x87.47`, `12:13:47 $0.00`,
  `12:13:46 $0.00`, `12:13:45 $0.00`, `12:13:43 +$4.40 x0.44`,
  `12:13:42 +$5.00 x0.50`, `12:13:41 $0.00`, `12:13:39 +$2.40 x0.24`,
  `12:13:38 $0.00`, `12:13:37 $0.00`, `12:13:35 +$5.80 x0.58`,
  `12:13:34 $0.00`, `12:13:32 $0.00`, `12:13:31 $0.00`, `12:13:30 $0.00`,
  `12:13:29 $0.00`, `12:13:28 $0.00`, `12:13:26 $0.00`,
  `12:13:24 +$6.30 x0.63`, `12:13:23 $0.00`, all `antelite $10.00`.
- **Within-frame** BET `$12.50` is 1.25 x `$10.00`. `x87.47` equals
  `874.70 / 10.00`. `MULTIPLIER 1x` is correct for a feature that has not yet
  had a winning spin. Consistent. HUD WIN `$0.00` beside `TOTAL WIN $62.50` is
  expected: the HUD figure populates on round settle, the panel carries the
  running feature total. Same pattern in frame 04, so it is behaviour rather
  than a one-off.

### 04_freespins_8_intro_balance_156604_proves_1250_debits.png

- **Captured** 2026-07-26 12:15:54
- **Purpose tag** Second balance anchor. With frame 03 this pair is what proves
  the `antelite` debit to the cent.
- **Surface** Live game, second Overdrive Free Spins entry, Bets panel right.
- **Viewport** Desktop landscape, as frame 03.
- **Figures verbatim** Overlay `OVERDRIVE FREE SPINS`, `+8 FREE SPINS`,
  `CLICK TO CONTINUE`. Panels `OVERDRIVE FREE SPINS 8`, `TOTAL WIN $60.00`,
  `MULTIPLIER 1x`. HUD BALANCE `$1,566.04`; WIN `$0.00`; BET `$12.50`;
  `OVERBOOST` badge. Win-line strip `L3 x4 1ways $2.00`. Newest Bets rows, all
  `antelite $10.00`: `12:15:42 +$916.00 x91.60`, `12:15:41 $0.00`,
  `12:15:39 +$5.30 x0.53`, `12:15:38 $0.00`, `12:15:37 $0.00`,
  `12:15:35 $0.00`, `12:15:34 +$3.40 x0.34`, `12:15:33 $0.00`,
  `12:15:31 $0.00`, `12:15:30 +$2.00 x0.20`, `12:15:28 +$3.00 x0.30`,
  `12:15:27 +$6.10 x0.61`, then `12:13:48 +$874.70 x87.47` and the frame 03 rows
  below it.
- **Within-frame** Consistent, same checks as frame 03. The visible gap between
  `12:13:48` and `12:15:27` is the free-spins round: the feature resolves inside
  one book round, so it produces no additional Bets rows. That is exactly what
  `CLAUDE.md:238` says the maths does, and it is worth recording because a
  reviewer could read the gap as missing rows.

### 05_portrait_base_bet_2000_balance_157440.png

- **Captured** 2026-07-26 12:24:40
- **Purpose tag** Narrow-profile layout with the Bets panel, `base` at a raised
  bet level.
- **Surface** Live game in a narrow popout, portrait-ish game pane, Bets panel
  right, Math page visible behind.
- **Viewport** Game pane roughly 295 by 490 css px inside a 783 by 775 window.
- **Figures verbatim** HUD BALANCE `$1,574.40`; WIN `$0.00`; BET `$20.00` with
  down and up chevrons; controls `SPIN`, `MAX`, turbo `4x`, menu. `FEATURES`
  bar. Bets panel `Bets 37`, `Guidelines 0/58`. Rows, all `base $20.00`:
  `12:24:40 $0.00`, `12:24:39 +$12.80 x0.64`, `12:24:38 $0.00`,
  `12:24:36 +$11.00 x0.55`, `12:24:35 $0.00`, `12:24:34 $0.00`,
  `12:24:32 +$10.80 x0.54`, `12:24:30 +$939.00 x46.95`, `12:24:29 $0.00`,
  `12:24:28 $0.00`, `12:24:27 $0.00`, `12:24:25 $0.00`,
  `12:24:24 +$11.00 x0.55`, `12:24:23 $0.00`, `12:24:21 $0.00`,
  `12:24:20 $0.00`.
- **Within-frame** No mode badge, correct for `base`. BET `$20.00` equals the
  bet level because `MODE_COST.base` is 1.0. Every MULT equals payout over
  `$20.00`. Consistent.

### 06_session_panel_44_spins_wagered_880_net_plus_48240.png

- **Captured** 2026-07-26 12:24:54
- **Purpose tag** The game's own session tally, independent of the platform
  panel. Should prove the in-game wagered total against the bet level.
- **Surface** Live game with the Session information modal open, Bets panel
  right.
- **Viewport** As frame 05, narrow popout.
- **Figures verbatim** Modal `Session information`: `Time played 00:01:30`,
  `Spins 44`, `Total wagered $880.00`, `Total won $1,362.40`,
  `Net result +$482.40`. HUD BET `$20.00`. Bets panel `Bets 44`. Rows, all
  `base $20.00`: `12:24:51 +$2.00 x0.10`, `12:24:49 $0.00`, `12:24:48 $0.00`,
  `12:24:46 $0.00`, `12:24:45 +$17.60 x0.88`, `12:24:43 +$8.40 x0.42`,
  `12:24:41 +$44.80 x2.24`, `12:24:40 $0.00`, `12:24:39 +$12.80 x0.64`,
  `12:24:38 $0.00`, `12:24:36 +$11.00 x0.55`, `12:24:35 $0.00`,
  `12:24:34 $0.00`, `12:24:32 +$10.80 x0.54`, `12:24:30 +$939.00 x46.95`,
  `12:24:29 $0.00`.
- **Within-frame** `44 x $20.00 = $880.00`, matching Total wagered exactly.
  `$1,362.40 - $880.00 = +$482.40`, matching Net result exactly. Panel `Spins
  44` equals the platform `Bets 44`. Three independent tallies agree. Fully
  consistent.

### 07_eur_base_bet_1000_active_row_balance_49105000.png

- **Captured** 2026-07-26 12:29:33
- **Purpose tag** EUR locale at a high bet level, and the only capture in the
  repository showing a row mid-settlement.
- **Surface** Live game narrow popout, Bets panel right, Math page behind.
- **Viewport** Game pane roughly 295 by 545 css px inside a 722 by 830 window.
- **Figures verbatim** HUD BALANCE `EUR 491,050.00`; WIN `EUR 0.00`;
  BET `EUR 1,000.00`. `Bets 9`, `Guidelines 0/58`. Rows, all `base
  EUR 1,000.00`: `12:29:33 +EUR 540.00 x0.54 Active`,
  `12:29:32 EUR 0.00 - Settled`, `12:29:30 +EUR 100.00 x0.10 Settled`,
  `12:29:28 +EUR 410.00 x0.41 Settled`, `12:29:27 EUR 0.00 Settled`,
  `12:29:26 EUR 0.00 Settled`, `12:29:25 EUR 0.00 Settled`,
  `12:29:24 EUR 0.00 Settled`, `12:29:23 EUR 0.00 Settled`.
- **Within-frame** Every MULT equals payout over `1,000.00`. The `Active` row's
  payout is not in the HUD WIN box, which reads `0.00`, and that is the correct
  reading of an unsettled round. Consistent. The balance cannot be closed from
  this frame alone: no earlier frame gives the session's opening balance, so the
  nine rows do not determine it. Recorded as SA-010, an open item rather than a
  finding.

### 08_eur_mega_win_95200_95x_bet_balance_43816000.png

- **Captured** 2026-07-26 12:33:16
- **Purpose tag** Win-banner tier and multiplier rendering at a high bet level in
  EUR.
- **Surface** Live game narrow popout, MEGA WIN banner over the reels.
- **Viewport** As frame 07.
- **Figures verbatim** Banner `MEGA WIN`, `EUR 95,200.00`, `95x BET`. Panels
  `OVERDRIVE FREE SPINS 1`, `TOTAL WIN EUR 95,200.00`. HUD BALANCE
  `EUR 438,160.00`; WIN `EUR 0.00`; BET `EUR 1,000.00`. Bets `Bets 50`. Rows,
  all `base EUR 1,000.00`: `12:33:06 +EUR 95,200.00 x95.20`,
  `12:33:04 +EUR 560.00 x0.56`, `12:33:03 EUR 0.00`,
  `12:33:02 +EUR 390.00 x0.39`, `12:33:00 +EUR 180.00 x0.18`,
  `12:32:59 EUR 0.00`, `12:32:58 EUR 0.00`, `12:32:56 EUR 0.00`,
  `12:32:55 EUR 0.00`, `12:32:54 EUR 0.00`, `12:32:53 EUR 0.00`,
  `12:32:52 EUR 0.00`, `12:32:50 EUR 0.00`, `12:32:49 EUR 0.00`,
  `12:32:48 +EUR 910.00 x0.91`, `12:32:47 EUR 0.00`.
- **Within-frame** `95,200.00 / 1,000.00 = 95.20`, and the banner reads
  `95x BET`, which is `Math.round(95.20)` as
  `frontend/src/lib/components/WinBanner.svelte:199` specifies. The Bets row
  reads `x95.20`. Both correct, and the difference between them is rounding for
  display, not disagreement. Consistent.

### 09_eur_win_321750_x32175_balance_58950000.png

- **Captured** 2026-07-26 14:11:04
- **Purpose tag** The frame that ties the owner's Word document to the capture
  record: this is the same session as the document's Bets tab.
- **Surface** Live game narrow popout, Bets panel right, Math page behind.
- **Viewport** As frame 07.
- **Figures verbatim** HUD BALANCE `EUR 589,500.00`; WIN `EUR 321,750.00`;
  BET `EUR 1,000.00`. `Bets 50`, `Guidelines 0/58`. Rows, all `base
  EUR 1,000.00`: `14:10:32 +EUR 321,750.00 x321.75`, `14:10:31 EUR 0.00`,
  `14:10:29 EUR 0.00`, `14:10:28 EUR 0.00`, `14:10:27 +EUR 600.00 x0.60`,
  `14:10:25 +EUR 550.00 x0.55`, `14:10:24 EUR 0.00`, `14:10:23 EUR 0.00`,
  `14:10:22 EUR 0.00`, `14:10:20 +EUR 380.00 x0.38`, `14:10:19 EUR 0.00`,
  `14:10:18 EUR 0.00`, `14:10:16 EUR 0.00`, `14:10:15 EUR 0.00`,
  `14:10:14 EUR 0.00`, `14:10:12 EUR 0.00`.
- **Within-frame** HUD WIN `EUR 321,750.00` equals the newest row's payout, and
  `321,750 / 1,000 = 321.75` equals the stated MULT. `x321.75` is well inside
  the 5,000x cap. Consistent. This frame's rows match rows 1 to 16 of
  `reports/qa/live_stats/2026-07-26_bets_page_eur_base_50_rows.json` exactly,
  which is a transcription check on the document, not independent corroboration.

---

## 2. Between-frame arithmetic for this set

Ordered by timestamp, the money timeline of the OVERBOOST run:

    12:12:33  frame 01  BALANCE   $1,034.74   bet level $10.00, OVERBOOST on, no antelite row yet
    12:13:11  frame 02  no balance visible (panel crop)
    12:15:04  frame 03  BALANCE     $821.54
    12:15:54  frame 04  BALANCE   $1,566.04

Frame 03 to frame 04 closes to 0.00 at a debit of `$12.50` per spin and fails by
`$30.00` at `$10.00`. Frame 01 to frame 03 admits `$12.50` and refutes `$10.00`
on a row-cadence argument. The full working, including how mid-animation frames
are modelled, is in
`reports/qa/live_stats/2026-07-26_mode_cost_reconciliation.md`.

The three EUR frames 07, 08 and 09 are not a continuous timeline: 07 is a nine
row session, 08 and 09 are separate 50 row windows with no shared anchor and no
opening balance in evidence. They are catalogued and internally checked, and
their between-frame reconciliation is recorded as not closeable from the
committed evidence rather than forced.

---

## 3. Committed frames re-read this pass

Re-read for duty 4 and duty 5 rather than trusted from their filenames, because
a filename is not evidence under convention (l.3). All in
`reports/screens/dtt-live-2026-07-26/`.

| frame | figures verbatim | within-frame |
| --- | --- | --- |
| `41_session_524_base_spins_balance_reconciles.png` | Session panel `00:16:18`, `Spins 524`, `Total wagered $524,000.00`, `Total won $441,330.00`, `Net result -$82,670.00`; HUD BALANCE `$49,917,330.00`, WIN `$0.00`, BET `$1,000.00` | consistent, residual 0.00 both checks |
| `42_after_three_bonus_buys_balance_reconciles.png` | HUD BALANCE `$49,972,875.00`, WIN `$142,184.65`, BET `$500.00`; rows `06:22:20 bonus $500.00 +$144,350`, `06:22:00 bonus $500.00 +$21,125`, `06:21:41 bonus $500.00 +$44,760`, then `base $1,000.00` rows | consistent. WIN `$142,184.65` against a settled `+$144,350.00` is the HUD count-up mid-flight, the documented behaviour at `HudOverlay.svelte:263` |
| `43_bets_panel_bonus_rows_cost_column.png` | `bonus $500.00` on all three buy rows, `base $1,000.00` below | consistent with 42 |
| `46_TR068_win_57215_while_balance_falls_142785.png` | HUD BALANCE `$49,830,090.00`, WIN `$57,215.00`, BET `$500.00`; row `06:23:26 super $500.00 +$57,215.00` | consistent. `400 x 500 - 57,215 = 142,785`, the fall TR-068 was raised about |
| `48_final_balance_48916485_reconciles_exactly.png` | HUD BALANCE `$48,916,485.00`, WIN `$102,930.00`, BET `$1,000.00`; rows `06:25:18 super $1,000.00 +$102,930`, `06:24:51 super $1,000.00 +$60,270`, `06:24:31 super $500.00 +$50,395`, `06:23:59 super $500.00 +$72,800`, `06:22:20 bonus $500.00 +$144,350`, `06:22:00 bonus $500.00 +$21,125`, `06:21:41 bonus $500.00 +$44,760`, `06:21:17 base $1,000.00 $0.00` and below; bet detail drawer fields `Event ID`, `Operator`, `Currency`, `Cost (USD)`, `Payout (USD)`, `Cost multiplier`, `Created`, `Updated` | consistent |

Between-frame results for these: 41 to 42 closes to 0.00 at `bonus` 100x, and 46
to 48 closes to 0.00 at `super` 400x. Working in
`reports/qa/live_stats/2026-07-26_mode_cost_reconciliation.md`.

---

## 4. Visual lens, per viewport

Recorded per duty 5. Nothing here was measured with a ruler; where a measurement
is claimed it is a pixel read off the capture at its native size, and where one
is not available the entry says so.

**Desktop landscape, game pane roughly 916 by 700 css px (frames 01, 03, 04).**
Clean. `OVERBOOST` appears twice, once in the `FEATURES` pill at reel right and
once as the badge above the BET box, and both are intentional and correctly
placed. The badge sits clear of the BET plate's clip path, which is what the
unclipped sibling anchor at `HudOverlay.svelte:796` exists to achieve. No
truncation of `BALANCE`, `WIN` or `BET` at these values. The win-line strip under
the reels (`L1 x5 2ways $50.00` in frame 03, `L3 x4 1ways $2.00` in frame 04)
renders on the reel frame's bottom border rather than clear of it; it is legible
in both, and it is logged as SA-008, low severity, because it reads as crowding
rather than clipping and a native-resolution measurement of the overlap was not
taken.

**Narrow popout, game pane roughly 295 by 490 to 545 css px (frames 05 to 09).**
The HUD reflows to a stacked layout with `BALANCE` and `WIN` on one row and `BET`
on its own full-width row, which is the portrait correction at
`HudOverlay.svelte:1659`. At `EUR 491,050.00` (frame 07) and
`EUR 589,500.00` (frame 09) the balance figure fits its plate without visible
truncation or autofit shrink to illegibility. `FEATURES` renders as a full-width
bar rather than the landscape pill. No overlap, no empty control, no placeholder
string observed in any of the five.

**Locale.** Every frame is English chrome with English body text. No locale bleed
of the kind TR-059 recorded (a German title over an English body) appears in this
set. EUR frames format as `EUR 1,000.00` with the symbol leading and a comma
group separator, consistently across the HUD, the banner and the Bets panel.

**Dash typography.** The platform Bets panel renders an em dash in the MULT
column on every zero-payout row. It is the Stake Engine dashboard's own glyph,
not ours, and it is outside the repository's dash gate. Logged as SA-009,
NOT-A-DEFECT, because a screenshot of our game page carrying an em dash is worth
knowing about before a reviewer asks.

**Contrast.** Not measured. This pass read captures rather than composited
pixels, and the project's contrast claim is made by
`reports/qa/contrast_2026-07-26.json` against real composited pixels per TR-070.
No contrast verdict is offered here, per convention (l.6).
