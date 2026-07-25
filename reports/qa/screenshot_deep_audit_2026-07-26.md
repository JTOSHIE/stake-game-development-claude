# Screenshot deep audit, 2026-07-26

**JOB 1 of `FS_V3_CONSOLIDATED_Prompt.md`.** Every portal capture read across five lenses:
layout, text, money display, state, and platform chrome. This job gates JOB 3, so the fix
pass does not start until this is committed and one build carries everything it finds.

## Inventory and provenance

| Source | Count | Status |
|---|---|---|
| `reports/screens/dtt-live-2026-07-26/` | **48** | committed, all read |
| `~/Desktop/*2026-07-26*.png` | 48 | verified byte-identical to the committed set by MD5, zero uncommitted |
| `~/Desktop/DTT_SCREENSHOTS/` | n/a | **does not exist** |
| Other `reports/screens/*` sets (50 dirs) | n/a | local development proofs, not portal captures, out of scope |
| Three loose `~/Desktop/*2026-07-17*.png` | 3 | **deliberately excluded, see below** |

**`~/Desktop/DTT_SCREENSHOTS/` does not exist.** The brief expects it because
`00_READ_ME_FIRST.md` part 8 told the owner to create it. The owner instead saved captures
loose to the Desktop and pasted them into chat. Named rather than worked around, per (m):
nothing is missing from the audit as a result, because the loose files are the same
captures and are all committed, but the walkthrough's instruction did not survive contact
and JOB 7 should not repeat it unchanged.

**Three loose 2026-07-17 captures are excluded, and this is a deliberate refusal.** They are
not Future Spinner portal captures. They are personal account screens on two unrelated
gambling sites, and they contain a real person's name, date of birth, home address, email
address, and **one plaintext password**. Committing them would publish personal data and a
live credential into a git repository, which no brief authorises and which I will not do.
They are named here as excluded so the gap in the file listing is explained; their contents
are not reproduced. **Owner action: treat that password as compromised and delete the
screenshots.**

## Coverage note

All 48 were opened and read in this session. Captures 01 to 19 were read in the first pass,
20 to 40 in the second, 41 to 48 in the third, and 23 and 35 were re-opened during this audit
to verify specific layout claims at pixel level. Two captures (43, 44) had labels I originally
assigned from their timestamps rather than their contents; both were corrected in `bd4a1f1`
before this audit was written.

---

## The audit table

Anomaly codes: **L** layout, **T** text, **M** money, **S** state, **P** platform chrome.
Disposition: **FL** already on `FIX_LIST_2026-07-26.md`, **NEW** new row raised here,
**ND** not a defect, **OWN** owner action, **BANK** observation banked, no action.

### Session 1, upload and publish (01 to 19)

| # | Capture | Viewport | Surface | Observations | Disposition |
|---|---|---|---|---|---|
| 01 | `01_maths_sync_dialog_13_files_skip_0` | desktop browser | Files, maths sync dialog | **P** `Upload 13 Files, Skip 0, Delete 0, Move 0`. **S** the 13th is `HASHES.txt`. **P** background FRONTEND panel already reads 13.0 MB / 104 files. **S** left rail shows "Design Thumbnail" placeholder | OWN (delete HASHES.txt); BANK |
| 02 | `02_maths_upload_in_progress_frontend_already_104` | desktop | Files, upload progress | **P** 305 MB at 5.00 MB/s. **M** MATH 0 B / 0 files mid-flight, FRONTEND 13.0 MB / 104 | BANK (proves the frontend shortfall predates the maths upload) |
| 03 | `03_files_page_math_380mb_13_files` | desktop | Files page | **M** MATH 380 MB / 13 files; per-file sizes legible and all match the kit. **S** `math/HASHES.txt` 2.82 KB present | OWN |
| 04 | `04_files_page_frontend_13mb_104_files` | desktop | Files page | **M** FRONTEND 13.0 MB / 104 files against a 108-file kit | FL (TR-061, resolved) |
| 05 | `05_dtt_replay_no_game_modes_prepublish` | DTT toolbar | Replay menu | **S** "No game modes available". Timestamped 05.00.23, before the 05.12.05 publish | ND (pre-publish state); check 8 still open |
| 06 | `06_dtt_versions_front_vundefined_prepublish` | DTT toolbar | Versions menu | **T** `Front (Current Vundefined)`, `Math (Current V)`. Literal "undefined" rendered to a user | ND, platform-side, and it is the diagnostic our walkthrough step 16 relies on |
| 07 | `07_dtt_settings_menu_and_balance_presets` | DTT toolbar | Settings | **P** Balance, Currency, Language, Device Type, Open in New Tab, Social Mode. 19 balance presets, $100 to $10,000,000,000 | BANK |
| 08 | `08_dtt_local_testing_redirect_url` | DTT toolbar | Local Testing | **P** Redirect URL defaulting to `http://localhost:3000`. Lets us test against real RGS from a local dev server | BANK, materially cheapens TR-059 and layout work |
| 09 | `09_dtt_screen_presets_popout_s_400x225` | DTT toolbar | Screen menu | **P** seven presets. Popout S is exactly 400x225, confirming the mini-player target | BANK |
| 10 | `10_LIVE_GAME_hero_image_broken` | Desktop 1200x675 | live game | **S** broken-image placeholder with visible border box where the pilot stands; car renders. **M** BALANCE $1,000.00, WIN $0.00, BET $1.00, internally consistent. **L** grid, frame, logo, FEATURES all correct | FL (TR-061, resolved in 22) |
| 11 | `11_dtt_versions_front_v1_math_v1_published` | DTT | Versions | **S** `Front (Current V1)`, `Math (Current V1)` after publish | BANK |
| 12 | `12_dtt_language_menu_lists_da_danish` | DTT | Language menu | **P** `ar de en es fi fr hi id ja ko pl pt ru tr zh vi da`, still scrolling at the capture edge. `da` is not one of our 16 | FL (TR-059 extension) |
| 13 | `13_TR059_features_menu_german_chrome_english_body` | Desktop | FEATURES menu, `de` | **T** `DREHKOSTEN`, `DREHMODI`, `WÄHLEN`, `AKTIV`, `AKTIVIEREN` beside English mode names and every blurb. **M** at $500 bet: OVERBOOST `1.25x per spin while ON, $625.00` and Buy Overdrive `100x, $50,000.00`, both arithmetically correct | FL (TR-059); money **ND**, correct |
| 14 | `14_TR059_TR062_paytable_german_title_english_body_em_dashes` | Desktop | paytable, `de` | **T** `GEWINNTABELLE` over fully English body. **T** two em dashes rendering to a player. **M** scatter `3/4/5 = 1x/3x/10x + 8/12/16`, H1 3x 1.5 / 4x 6, all match the PAR | FL (TR-059, TR-062) |
| 15 | `15_maths_overall_bet_level_compliance_all_pass` | Desktop | Math page | **M** all eleven constraints green at 2 Star and 3 Star | BANK, dossier evidence |
| 16 | `16_maths_all_five_modes_compliant` | Desktop | Math page | **M** five modes COMPLIANT, all 96.35% RTP, all 5,000x max | BANK |
| 17 | `17_maths_base_detailed_metrics_and_6of6` | Desktop | Math page | **M** BASE 6/6; Cross-Mode RTP Consistency 0.00% variance; platform states the RTP ceiling as **96.70%** | BANK; ceiling to COMPLIANCE_WATCH in JOB 6 |
| 18 | `18_maths_base_hit_rate_distribution` | Desktop | Math page | **M** hit-rate bands. Truncated at (200,500) in this capture; full table arrived later by paste | BANK |
| 19 | `19_maths_base_property_table_rtp_963500_sd_172841` | Desktop | Math page | **M** RTP 96.3500, SD 17.2841, Simulation Count 100000, Max Payout 5000, all matching our committed claims | BANK, strongest independent corroboration |

### Session 2, remediation and responsive sweep (20 to 40)

| # | Capture | Viewport | Surface | Observations | Disposition |
|---|---|---|---|---|---|
| 20 | `20_RESOLVED_sync_upload_4_skip_104...` | desktop | Files sync dialog | **P** `Upload 4 Files, Skip 104 Files`. Portal independently names the same four files the diff named | FL (TR-061 resolved) |
| 21 | `21_sync_dialog_detail_four_filenames` | desktop | sync detail | **S** four filenames legible | BANK |
| 22 | `22_FIXED_hero_pilot_rendering_front_v2` | Desktop 1200x675 | live game | **S** pilot renders. `Front (Current V2)`, `Math (Current V1)`. **M** BALANCE $1,000.00 / WIN $0.00 / BET $1.00 consistent | FL resolved |
| 23 | `23_mobile_portrait_TR065_scrollbar` | mobile portrait | live game | **L** scrollbar on the game frame. **L NEW** the bottom control row is **clipped at the right edge**: the rightmost circular control renders only a partial glyph ("2") and is cut by the viewport boundary. **L** FEATURES bar text is low contrast over the busy background. **M** BALANCE $1,024.75 / WIN $0.00 / BET $1.00 consistent | FL (TR-065); **NEW TR-069** for the clipped control; contrast **NEW TR-070** |
| 24 | `24_mobile_s_320x568_TR065_scrollbar` | Mobile S 320x568 | live game | **L** scrollbar. **M** BALANCE $1,021.06 consistent | FL (TR-065) |
| 25 | `25_popout_l_800x450_hero_splash` | Popout L 800x450 | hero splash | **L** WE ROLL SPINNERS mark renders cleanly, TAP TO CONTINUE legible | ND |
| 26 | `26_popout_l_800x450_full_landscape_hud` | Popout L | live game | **L** full landscape HUD, correctly not the mini strip. **M** BALANCE $1,040.06 / WIN $0.00 / BET $1.00 consistent | ND |
| 27 | `27_popout_s_400x225_selected` | Popout S | live game, menu open | **M** mini strip shows `BAL $1,040`, `WIN $0.0...` behind the menu | FL (TR-066) |
| 28 | `28_popout_s_mini_strip_TR066_win_clipped` | Popout S 400x225 | live game | **L** all seven controls present, closing DTT check 10. **T** WIN readout clipped mid-glyph. **M** `BAL $1,040` drops cents where the true balance is $1,040.06. **L NEW** the FUTURE SPINNER logo **overlaps the frame's top-right corner**. **L** scrollbar present | FL (TR-066); **NEW TR-071** logo overlap |
| 29 | `29_laptop_1024x576_clean` | Laptop 1024x576 | live game | **L** clean, no scrollbar, no clipping. **M** $1,040.06 / $0.00 / $1.00 consistent | ND |
| 30 | `30_TR062_paytable_em_dash_still_shipping_in_v2` | Desktop | paytable | **T** em dash still present in V2. **M** H1 1.5/6/22, H2 0.8/3/10 match the PAR exactly | FL (TR-062) |
| 31 | `31_bets_panel_50_rounds_settled` | Desktop | platform Bets panel | **P** columns TIME, MODE, COST, PAYOUT, MULT, STATUS. **M** zero-win rows show `$0.00` and `—` and status `Settled` | BANK; the `Settled` on zero-win rows is what makes TR-064's observation necessary |
| 32 | `32_guidelines_tab_0_of_58_prechecks` | Desktop | Guidelines tab | **P** 58-item checklist at 0/58 | BANK |
| 33 | `33_guidelines_tail_final_approval` | Desktop | Guidelines tail | **P** final approval items through Game Released | BANK |
| 34 | `34_guidelines_beside_running_game` | Desktop | split view | **M** $1,040.06 / $0.00 / $1.00 consistent | ND |
| 35 | `35_guidelines_scroll` | Desktop | split view | **L** background bleed below the control bar is intentional stage space, not dead space (`App.svelte:1852` documents it). **M** consistent | ND, recorded so it is not re-raised |
| 36 | `36_bet_detail_event_52121_replay_this_bet` | Desktop | Bets detail | **P** Event ID, Operator, Currency, Cost, Payout, Cost multiplier, Created, Updated, **Replay this bet**. **M** $1.00 cost, $23.00 payout, x1.00 cost multiplier, internally consistent | BANK, largely solves DTT check 8 |
| 37 | `37_REPLAY_WORKING_event_52121_with_disclaimer` | Desktop | replay overlay | **S** replay working live. **T** disclaimer renders. **S** no betting controls, no balance, correct per the compliance requirement. **T** `Mode: base`, `Bet: $1.00`, `Currency: USD` | BANK |
| 38 | `38_autoplay_1000_bet_47_remaining` | Desktop | live game | **M** BALANCE $49,982,650.00 / BET $1,000.00, autoplay 47 remaining, turbo 4x. **S** WILD renders | ND |
| 39 | `39_session_131_spins_net_minus_61260` | Desktop | session panel | **M** 131 spins, $131,000 wagered, $69,740 won, net -$61,260; HUD balance $49,938,740 reconciles exactly | BANK |
| 40 | `40_session_143_spins_net_plus_9590...` | Desktop | session panel | **M** 143 spins, $143,000 wagered, $152,590 won, net +$9,590; HUD $50,009,590 reconciles exactly. **T** win banner `L2 x4 2 ways $500.00` legible | BANK |

### Session 3, buy modes and the money path (41 to 48)

| # | Capture | Viewport | Surface | Observations | Disposition |
|---|---|---|---|---|---|
| 41 | `41_session_524_base_spins_balance_reconciles` | Desktop | session panel | **M** 524 spins, $524,000 wagered, $441,330 won, net -$82,670; HUD $49,917,330 reconciles exactly | BANK |
| 42 | `42_after_three_bonus_buys_balance_reconciles` | Desktop | live game | **M** HUD $49,972,875 reconciles exactly after three 100x buys. **T** WIN $142,184.65 mid count-up toward $144,350 | ND (count-up is animation, not a stale value) |
| 43 | `43_bets_panel_bonus_rows_cost_column` | Desktop | Bets panel | **P** bonus rows show `$500.00` in COST, which is the bet level not the $50,000 debited | ND, platform convention, recorded in the fix list as A.1 |
| 44 | `44_features_menu_shows_true_buy_cost` | Desktop | FEATURES menu, `en` | **M** `SPIN COST $500.00`; Buy Overdrive `100x, $50,000.00`; OVERBOOST `1.25x per spin while ON, $625.00`. All correct. **T** English throughout, so the mode blurbs read correctly here | ND, and it is the evidence that the game states true cost on the card |
| 45 | `45_nitro_confirm_price_200000_at_500_bet` | Desktop | buy confirm | **M** `PRICE $200,000.00` at a $500 bet, RTP 96.35%, MAX WIN 5,000x base bet. Correct 400x | ND, guideline 27 confirmed live |
| 46 | `46_TR068_win_57215_while_balance_falls_142785` | Desktop | live game | **M** `WIN $57,215.00` headlined while the balance falls $142,785, because the round cost $200,000. HUD $49,830,090 reconciles exactly | FL (TR-068) |
| 47 | `47_nitro_confirm_price_400000_at_1000_bet` | Desktop | buy confirm | **M** `PRICE $400,000.00` at a $1,000 bet. Cost scales correctly with bet level | ND |
| 48 | `48_final_balance_48916485_reconciles_exactly` | Desktop | live game | **M** HUD $48,916,485 reconciles exactly after five 400x buys. **M** WIN $102,930.00 on a round that lost $297,070 | FL (TR-068) |

---

## Cross-frame money consistency

Every frame containing more than one money value was checked for internal consistency, and
every balance was checked against the platform's own bet log. **Four independent
reconciliations, all exact**, spanning base, 100x bonus and 400x super:

| Capture | Expected from the bet log | HUD | |
|---|---|---|---|
| 41 | $49,917,330.00 | $49,917,330.00 | exact |
| 42 | $49,972,875.00 | $49,972,875.00 | exact |
| 46 | $49,830,090.00 | $49,830,090.00 | exact |
| 48 | $48,916,485.00 | $48,916,485.00 | exact |

**No money display anomaly of any kind was found in 48 captures.** Every bet, balance, win
and price is internally consistent within its frame and consistent with the maths package.
The only money-adjacent finding is TR-068, which is presentation, not arithmetic.

---

## New rows raised by this audit

| Row | Finding | Size | Joins JOB 3? |
|---|---|---|---|
| **TR-069** | The bottom control row is clipped at the right edge at mobile portrait: the rightmost circular control renders a partial glyph and is cut by the viewport boundary. A player cannot reach it. Same layout family as TR-065 and almost certainly the same root cause, the wrapper sizing rather than the control itself | small, unlocked | **yes** |
| **TR-070** | The FEATURES bar label at mobile portrait sits at low contrast over the background art. Readability, not function | small, unlocked | **yes**, if the TR-065 re-derivation does not resolve it incidentally |
| **TR-071** | At Popout S the FUTURE SPINNER logo overlaps the frame's top-right corner | small, unlocked | **yes** |

All three are small, unlocked frontend defects in the same responsive layout code JOB 3 item
(b) already opens, so they ride that pass rather than becoming their own. **Nothing found in
this audit is larger than JOB 3's scope, so nothing is parked.**

## Reconciliation against FIX_LIST_2026-07-26.md

| Fix-list item | Corroborating captures | Still open? |
|---|---|---|
| A.1 bet cost, not a defect | 43, 44, 45, 47 | closed, recorded |
| A.2 balance, not a defect | 41, 42, 46, 48 | closed, recorded |
| B.1 / TR-068 buy-round win presentation | 46, 48 | open, ruled in JOB 2 |
| B.2 / TR-065 frame scrolls | 23, 24, 28 | open, JOB 3 (b) |
| B.3 / TR-066 double-tap zoom | not visually observable; established from `index.html` | open, JOB 3 (c) |
| B.4 / TR-066 mini WIN clipping | 27, 28 | open, JOB 3 (e) |
| B.5 / TR-067 social forces English | not visually observable; established from `tr.ts` | open, JOB 3 (d) |
| B.6 / TR-062 stale bundle | 30 | open, JOB 3 (a) plus JOB 4 and 5 |
| B.7 / TR-059 localisation | 13, 14, 12 | parked in JOB 2 pending the language capture |
| B.8 / TR-063 dash gate | 14, 30 | open, JOB 3 (a) |
| C.1 / TR-064 zero-win end-round | 31 | held for observation, JOB 7 |
| D.1 platform dropped four files | 20, 21 | resolved, worth reporting upstream |
| E owner actions | 01, 03 (HASHES.txt); 01 to 04 (thumbnail placeholder) | JOB 7 |

**Every anomaly in the table above is accounted for**: on the fix list, raised as TR-069 to
TR-071, banked as a platform observation, or explicitly recorded as not a defect with its
reasoning.
