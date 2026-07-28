# STC-POPOUTL-A, composition (popout-l, frames 105 to 130)
scope: every `_popout-l_` frame numbered 105 to 130 inclusive, 26 frames, viewport `800x450`, lang `en`, build `d9bdf22`
frames_read: 26

## STC-POPOUTL-A-01 STREAM Paytable bullet lists pin the marker to the left content edge and centre the text, stranding every marker

- Frames: `reports/screens/stream-test-2026-07-28/128_popout-l_paytable_04_rules.png`, `reports/screens/stream-test-2026-07-28/129_popout-l_paytable_05_overdrive_free_spins.png`
- Claim: in both frames the `›` markers form a straight column hard against the modal's left content edge while the text of each bullet is CENTRED on the modal, so the marker is separated from the text it belongs to by a gap that changes on every single row. On `128` the six rows are `Wins pay left to right on adjacent reels starting from reel 1.`, `Symbol values shown are per matching way; the total is that value times the number of ways times your bet.`, `WILD substitutes for all symbols except SCATTER.`, `3, 4, or 5 SCATTERs anywhere apply a 1x, 3x, or 10x multiplier to your total bet win.`, `Maximum win per spin is capped at 5,000x your total bet.` and `Malfunctions void all pays and plays.`; the shortest of them, `Malfunctions void all pays and plays.`, leaves roughly 200 px of empty space between its marker and its first letter, while the longest leaves roughly 20 px. On `129` the same block runs from a near-zero gap on `The Overdrive meter starts at 1x and rises +1x after every winning free spin, multiplying all later wins. It never resets during the feature.` to roughly 130 px on `3 or more Scatters during free spins award +5 free spins.` in the very next row. The game's own established pattern for this exact list is LEFT-aligned text with the marker attached: `reports/screens/stream-test-2026-07-28/108_popout-l_intro_rules.png` renders four `›` bullets with the text left-aligned and a constant marker gap, and one of those bullets is the same sentence as a bullet on `129` (`Bonus Buy: pay 100x your bet to start the feature immediately.`). So the paytable disagrees with a sibling surface showing the same content.
- Where fixable: UNKNOWN
- Proposed fix: left-align the bullet text in the paytable rules and feature sections so the marker and its text keep a constant gap, matching the intro rules card.

## STC-POPOUTL-A-02 STREAM The balance readout never moves across five settled spins, and the session panel on the same frame contradicts it

- Frames: `reports/screens/stream-test-2026-07-28/110_popout-l_base_idle.png`, `113_popout-l_dead_spin_1_settled.png`, `114_popout-l_dead_spin_2_settled.png`, `115_popout-l_dead_spin_3_settled.png`, `116_popout-l_win_presentation.png`, `117_popout-l_transition_bigwin_countup_early.png`, `118_popout-l_transition_bigwin_countup_late.png`, `119_popout-l_bigwin_settled.png`, `120_popout-l_transition_menu_opening.png`, `121_popout-l_hud_menu.png`, `122_popout-l_session_panel.png` (all under `reports/screens/stream-test-2026-07-28/`)
- Claim: the HUD BALANCE pod reads `$50,000.00` on every one of those eleven frames. Across the same span the WIN pod goes `$0.00`, `$0.00`, `$0.00`, `$3.90`, `$15.95`, `$16.20`, `$16.20`, and the BET pod reads `$1.00` throughout. Frame `122_popout-l_session_panel.png` settles it inside a single frame: the session dialog reports `Spins 5`, `Total wagered $5.00`, `Total won $20.10`, `Net result +$15.10`, while the BALANCE pod visible in the same frame still reads `$50,000.00`. `$50,000.00 - $5.00 + $20.10 = $50,015.10`. Two money readouts on one screen disagree by `$15.10`, and the one a viewer watches all session is the frozen one.
- Where fixable: UNKNOWN
- Proposed fix: PARK(money path, and the balance writable lives behind a locked file, so this is escalated rather than fixed by a lens squad). Recorded here because it is visible on eleven frames and is not on any KNOWN row.

## STC-POPOUTL-A-03 HIGH The OVERDRIVE FREE SPINS table is left-anchored under a heading centred on the modal, leaving a dead column the width of a third of the frame

- Frames: `reports/screens/stream-test-2026-07-28/129_popout-l_paytable_05_overdrive_free_spins.png`, `reports/screens/stream-test-2026-07-28/128_popout-l_paytable_04_rules.png`
- Claim: on `129` the heading `OVERDRIVE FREE SPINS` is centred on the modal, its optical centre falling at about x 400 of the 800 px frame. The three-column table it heads (`SCATTERS`, `FREE SPINS`, `INSTANT AWARD`, with rows `3 / 8 / 1x`, `4 / 12 / 3x`, `5 / 16 / 10x`) runs from about x 62 to about x 500, so its optical centre is about x 281. The heading sits about 120 px to the right of the centre of its own table, and the region from about x 500 to the modal's right content edge at about x 740, from the header rule down to the last table row, is completely empty: roughly 240 by 170 px of nothing, about a tenth of the frame. Every other section of this modal fills the full content width (`130_popout-l_paytable_06_bet_modes.png` two-up cards, `127_popout-l_paytable_03_symbol_payouts.png` four-up cards), so this table reads as unfinished rather than as breathing room.
- Where fixable: UNKNOWN
- Proposed fix: either centre the table on the modal so it sits under its heading, or let the three columns share the full content width.

## STC-POPOUTL-A-04 HIGH Paytable section anchors land with the section's last line sliced in half by the viewport bottom edge

- Frames: `reports/screens/stream-test-2026-07-28/125_popout-l_paytable_01_match_symbols_on_adjacent_reels_st.png`, `reports/screens/stream-test-2026-07-28/126_popout-l_paytable_02_ways_to_win.png`, `reports/screens/stream-test-2026-07-28/128_popout-l_paytable_04_rules.png`, `reports/screens/stream-test-2026-07-28/130_popout-l_paytable_06_bet_modes.png`
- Claim: at `800x450` each captured paytable section anchor stops with a line of text bisected horizontally by the bottom edge rather than clipped at a clean boundary. On `125` the caption `Reels 1, 2 and 3 hold the same symbol (highlighted), which is a match read left to right from reel 1. Reels 4 and 5 are not required.` has its first line fully visible and its second line, `and 5 are not required.`, cut through the middle of the letterforms. On `126` the symbol card label under the second card is cut through mid-glyph so `SCATTER` reads as a partial word. On `128` the table row `4 / 12 / 3x` is cut through its digits. On `130` the OVERBOOST and Buy Overdrive card descriptions are cut mid-line. A half-height row of letters at the frame edge is the specific thing a stream overlay crop makes worse, and it recurs on four of the seven paytable frames in this range.
- Where fixable: UNKNOWN
- Proposed fix: PARK(the anchor offset and the section padding interact, so this is a scroll-anchor change rather than a one-property edit). Options: add bottom padding equal to one line height to each section, or snap the anchor so a section boundary rather than a text line meets the viewport edge.

## STC-POPOUTL-A-05 HIGH Symbol cards in one row put their name labels on three different baselines

- Frames: `reports/screens/stream-test-2026-07-28/127_popout-l_paytable_03_symbol_payouts.png`, `reports/screens/stream-test-2026-07-28/126_popout-l_paytable_02_ways_to_win.png`
- Claim: on `127` the four cards of the first payout row share one top edge and one bottom edge, but their labels do not share a baseline. `H1` and `H2` sit noticeably higher than `WILD`, and `SCAT` sits lower again, a spread of roughly 15 to 20 px across four adjacent cards of identical height. `126` shows the same row scrolled so the bottom edge crosses it, and the consequence is unmistakable there: `WILD` is fully legible while the neighbouring `SCATTER` label is sliced by the same horizontal edge, which can only happen because the two labels are at different heights inside identically sized cards. Four cards side by side is exactly the arrangement where a shared baseline is clearly intended.
- Where fixable: UNKNOWN
- Proposed fix: give the symbol art slot a fixed height in the card so the name label starts at the same offset in every card, instead of letting the label follow the intrinsic height of the artwork.

## STC-POPOUTL-A-06 MEDIUM The HUD popover is half empty, mixes three casings in five rows, and its bottom edge butts the HUD bar with no gap

- Frames: `reports/screens/stream-test-2026-07-28/121_popout-l_hud_menu.png`, `reports/screens/stream-test-2026-07-28/120_popout-l_transition_menu_opening.png`
- Claim: three things in one small panel, all composition. (a) The panel is sized by its two slider rows, so the three menu rows above them each leave roughly half the panel width empty: `PAYTABLE`, `Session` and `Mute` end well short of the panel's mid-line while `MUSIC` and `SOUND` run the full width to their `50%` and `80%` values. (b) The five rows carry three casings: `PAYTABLE` all caps and letter-spaced, `Session` and `Mute` title case, `MUSIC` and `SOUND` all caps at a smaller size, in a panel about 150 px tall. (c) The panel's bottom edge meets the top edge of the HUD bar with no gap at all, so the popover and the bar read as one merged shape rather than as a panel floating above its trigger; the `MUSIC` and `SOUND` rows sit closer to the panel's bottom edge than `PAYTABLE` sits to its top edge.
- Where fixable: UNKNOWN
- Proposed fix: settle one casing for the menu rows, and lift the panel clear of the HUD bar by the same amount as its internal row gap.

## STC-POPOUTL-A-07 MEDIUM The big win banner is more than twice the width of the reel panel and hides the middle two of four grid rows

- Frames: `reports/screens/stream-test-2026-07-28/117_popout-l_transition_bigwin_countup_early.png`, `reports/screens/stream-test-2026-07-28/118_popout-l_transition_bigwin_countup_late.png`, `reports/screens/stream-test-2026-07-28/119_popout-l_bigwin_settled.png`
- Claim: at `800x450` the banner runs to within roughly 60 px of both viewport edges, about 675 px wide, while the reel panel it belongs to is about 315 px wide. The banner therefore overhangs the reel panel by about 180 px on each side, crossing the character art on the left and the empty city background on the right, and vertically it covers rows two and three of the four-row grid, including the win lines the celebration exists to show. `119` shows the settled state with the same coverage. The banner's own three elements are laid out for a much wider frame: `BIG WIN` sits far left of the amount `$16.20` and `16x BET` far right of it, with large empty gaps either side of the amount, so the bar reads as a desktop component dropped into a popout without being resized.
- Where fixable: UNKNOWN
- Proposed fix: PARK(a celebration re-layout is an art call). Options: cap the banner width to the reel panel width plus a fixed overhang, or move the banner above the grid at viewports under about 900 px wide.

## STC-POPOUTL-A-08 MEDIUM The win breakdown strip renders at roughly 6 px cap height and sits on top of the grid's bottom row

- Frames: `reports/screens/stream-test-2026-07-28/118_popout-l_transition_bigwin_countup_late.png`, `reports/screens/stream-test-2026-07-28/119_popout-l_bigwin_settled.png`, `reports/screens/stream-test-2026-07-28/120_popout-l_transition_menu_opening.png`, `reports/screens/stream-test-2026-07-28/121_popout-l_hud_menu.png`
- Claim: a rounded strip spanning the inner width of the reel panel carries the win breakdown, reading `L3  x4  1 ways  $0.22` on `118`, `120` and `121` and `H3  x5  6 ways  $16.20` on `119`. Its text is about 6 px tall at this viewport, well below the size of every other readout on screen, and the strip overlaps the bottom row of the grid rather than sitting below it. `1 ways` is also a singular quantity given a plural noun, on the same strip.
- Where fixable: UNKNOWN
- Proposed fix: give the strip its own band below the grid at this viewport and raise its minimum font size; fix `1 ways` to `1 way` at the same time.

## STC-POPOUTL-A-09 MEDIUM Three settled spins in a row show an identical board, and the full speed frame already shows that same board

- Frames: `reports/screens/stream-test-2026-07-28/112_popout-l_transition_reels_full_speed.png`, `113_popout-l_dead_spin_1_settled.png`, `114_popout-l_dead_spin_2_settled.png`, `115_popout-l_dead_spin_3_settled.png` (all under `reports/screens/stream-test-2026-07-28/`)
- Claim: judged as a sequence, `113`, `114` and `115` are three separate settled spins whose twenty symbol cells are the same symbols in the same cells. `112`, captured with the reels at full speed before any of them settled, already shows that identical board. Four consecutive frames of a spinning game showing one unchanging grid is what a viewer reads as a frozen game, and the frames on either side (`111` accelerating, `116` win presentation) do change.
- Where fixable: UNKNOWN
- Proposed fix: PARK(cannot tell from frames alone whether this is a capture harness artefact or a render defect; it needs one live run to separate the two).

## STC-POPOUTL-A-10 MEDIUM The pre first spin board is twenty identical symbols

- Frames: `reports/screens/stream-test-2026-07-28/109_popout-l_transition_rules_to_base.png`, `reports/screens/stream-test-2026-07-28/110_popout-l_base_idle.png`, `reports/screens/stream-test-2026-07-28/111_popout-l_transition_reels_accelerating.png`
- Claim: on `109` and `110`, the first sight a viewer gets of the reels, all twenty cells hold the same symbol. `111`, 250 ms into the first spin, still has reels four and five holding that same symbol in all four rows while reels one to three carry mixed real symbols and several empty cells, so the frame reads as a half-populated grid. A uniform grid is not a board a 1,024 ways game can produce, so this is a default fill reaching the screen, and it is on screen for the whole of the idle state before the first spin.
- Where fixable: UNKNOWN
- Proposed fix: seed the idle board from a real weighted draw rather than a constant fill.

## STC-POPOUTL-A-11 LOW The session dialog title is not left-aligned with the rows beneath it

- Frames: `reports/screens/stream-test-2026-07-28/122_popout-l_session_panel.png`
- Claim: the heading `Session information` begins a few pixels left of the left edge of the label column beneath it (`Time played`, `Spins`, `Total wagered`, `Total won`, `Net result`), which are themselves a clean column. The values column (`00:00:21`, `5`, `$5.00`, `$20.10`, `+$15.10`) is cleanly right-aligned, so the one edge that fails is the one between the title and its own content.
- Where fixable: UNKNOWN
- Proposed fix: give the title the same horizontal padding as the row list rather than the dialog's own padding.

## STC-POPOUTL-A-12 LOW The HUD popover's left edge does not align with the button it is anchored to

- Frames: `reports/screens/stream-test-2026-07-28/121_popout-l_hud_menu.png`
- Claim: the popover's left edge sits a few pixels left of the left edge of the hamburger button below it. The two are visually adjacent and the alignment is clearly intended, so the small offset reads as a stray pixel value rather than as a deliberate overhang.
- Where fixable: UNKNOWN
- Proposed fix: anchor the popover to the button's left edge rather than to the HUD's own padding box.

## STC-POPOUTL-A-13 LOW Bet mode cards mix centred and left-aligned values inside the same column

- Frames: `reports/screens/stream-test-2026-07-28/130_popout-l_paytable_06_bet_modes.png`
- Claim: in each of the four mode cards the `COST` column header and its multiplier (`1x`, `1x`, `1.25x`, `100x`) are centred in the column, but the currency figure directly beneath (`$1.00`, `$1.00`, `$1.25`, `$100.00`) is aligned to the card's left content edge instead. The offset is small on `$1.00` and obvious on `$100.00`, where the figure visibly overhangs the multiplier above it.
- Where fixable: UNKNOWN
- Proposed fix: centre the currency figure on the same column axis as the multiplier above it.

## STC-POPOUTL-A-14 LOW The paytable modal's top margin is about a third of its side margins

- Frames: `reports/screens/stream-test-2026-07-28/124_popout-l_paytable_top.png`, `reports/screens/stream-test-2026-07-28/123_popout-l_transition_paytable_opening.png`
- Claim: the modal sits about 30 px from the left and right viewport edges and about 10 px from the top, so the frame it draws is not evenly inset. At `800x450` the modal's top border is close enough to the edge that the surrounding frame reads as a crop rather than as a dialog.
- Where fixable: UNKNOWN
- Proposed fix: use one inset value on all three sides at this viewport.

## STC-POPOUTL-A-15 LOW `SCATTERs` is written with a lowercase plural on an uppercase term

- Frames: `reports/screens/stream-test-2026-07-28/128_popout-l_paytable_04_rules.png`
- Claim: the rules bullet reads `3, 4, or 5 SCATTERs anywhere apply a 1x, 3x, or 10x multiplier to your total bet win.` The same modal writes the term as `SCATTER` on `127_popout-l_paytable_03_symbol_payouts.png` (`Substitutes for all symbols except SCATTER`) and as `Scatters` on `129_popout-l_paytable_05_overdrive_free_spins.png` (`3 or more Scatters during free spins award +5 free spins.`), so one term takes three casings inside one modal.
- Where fixable: UNKNOWN
- Proposed fix: settle one casing for the term and apply it across the paytable strings.

## Explicit absences, signed

Each of these was looked for on all 26 frames and is signed as absent.

- **No element collides with or is cut off by the LEFT or RIGHT viewport edge** on any of the 26 frames. The HUD bar is full bleed by design, and every pod, button, dialog and card sits inside both side edges. The only edge clipping found is at the bottom edge and is written up as STC-POPOUTL-A-04.
- **The three primary modals are correctly centred.** The intro rules card (`108`) and the session dialog (`122`) each sit with equal left and right margins and with top and bottom margins that match each other. I checked both axes on both.
- **The HUD is not crowded at this viewport.** All six HUD groups (the two left icons, BALANCE, WIN, BET, the turbo and autoplay icons, MAX, spin) sit clear of one another with visible gutters on `110`, `113`, `114`, `115`, `116`, `119` and `121`. Nothing wraps, nothing overlaps, and the spin button is fully inside the right edge.
- **No layout jump between adjacent frames in the HUD, the reel panel or the paytable chrome.** I compared each consecutive pair across the run: `105`/`106`, `107`/`108`, `109`/`110`, `110`/`111`/`112`, `113`/`114`/`115`, `117`/`118`/`119`, `120`/`121`, `123`/`124`, and the paytable section series `124` through `130`. The modal frame, the header rule, the close button and the left accent rail hold the same geometry across all seven paytable frames, and the HUD holds the same geometry across all eleven frames that show it. The only content that jumps between adjacent frames is the reel board, written up as STC-POPOUTL-A-09.
- **No dead region in the base game scene.** The empty right third of the play area on `110` and its siblings is scene art (city, light shafts, rain) and reads as composition, not as an unfinished panel. I judged it as breathing room deliberately and am signing that call.
- **No asymmetric padding found in the intro rules card** (`107`, `108`): left and right text insets match, and the `Continue` button is centred on the card.
- **The paytable close button and title are inset by comparable amounts** from their respective modal edges on all seven paytable frames; I looked for a mismatch there and did not find one.
- **The OVERDRIVE FREE SPINS table's own columns are correctly aligned**: on `129` each of `3`, `8`, `1x`, `4`, `12`, `3x`, `5`, `16`, `10x` is centred under its header. I initially suspected the `INSTANT AWARD` column was off and it is not.
- **No finding matching KNOWN row TR-115 / TR-086** (money display fit failure) on these 26 frames: no money pod on any frame clips, ellipsises or overflows. `$50,000.00`, `$16.20`, `$15.95`, `$3.90`, `$1.00`, `$100.00`, `$20.10` and `+$15.10` all render complete inside their containers.
- **No finding matching KNOWN row TR-114** (replay ghost pod): no replay surface appears in this range.
- **No finding matching KNOWN row Q-27** (Vite scaffold CSS): no link or unstyled surface reaches any of these 26 frames.
- **No finding matching KNOWN row Q-34** (`Cruise` versus `CRUISE`): `130` renders `Normal`, `Cruise`, `OVERBOOST` and `Buy Overdrive`, and no HUD mode badge appears anywhere in 105 to 130, so the two surfaces the row compares are not both present in this range. `OVERBOOST` is a genuinely uppercase mode name per `CLAUDE.md`, so it is not a casing drift and I am not reporting it as one.

## KNOWN matches

- KNOWN(MID-01): `reports/screens/stream-test-2026-07-28/117_popout-l_transition_bigwin_countup_early.png` shows the banner reading `$10.28` while the HUD WIN pod on the same frame reads `$15.95`, on a win that settles at `$16.20` in `119_popout-l_bigwin_settled.png`. This is the popout-l instance the ledger predicted at `117`/`119`, and the banner figure is one cent from the ledger's `$10.29` desktop reading.
- KNOWN(MID-02): `reports/screens/stream-test-2026-07-28/117_popout-l_transition_bigwin_countup_early.png`, `118_popout-l_transition_bigwin_countup_late.png` and `119_popout-l_bigwin_settled.png` all render the unit as `16x BET` with a letter `x`, while the same session's paytable writes `5,000x` and `100x` in the rules and mode cards. Three more frames of evidence for the ledger row.
- KNOWN(TR-104): `reports/screens/stream-test-2026-07-28/117`, `118` and `119` render `BIG WIN` and `x BET`; this is the `en` session so the strings are correct here, and the frames are recorded only as confirmation that the surface exists in the popout-l run for the de and ar squads to compare against.
- KNOWN(Q-16 park): `reports/screens/stream-test-2026-07-28/121_popout-l_hud_menu.png` shows `Mute`, and `127`, `128`, `132` style section headers `SYMBOL PAYOUTS`, `RULES` and `INTERFACE GUIDE` are parked strings; of the parked list, the ones VISIBLE in this range are `Mute`, `SYMBOL PAYOUTS` (`127`), `RULES` (`128`). This is the `en` session so nothing is mistranslated here; recorded so the de and ar squads know these are on-frame surfaces.

tree_after: recorded at the end of the run, below.
