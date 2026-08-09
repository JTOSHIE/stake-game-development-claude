# DTT live session captures, 2026-07-26

The owner's first real portal session: upload, publish, launch, and the Math Distribution
and Summary page. Committed per convention (h) so the independent verifier can review the
rendering from the repository rather than relying on a description.

**Full transcription and audit: `reports/qa/dtt_live_session_2026-07-26.md`.**
Nothing in this folder is edited or cropped; filenames were assigned from content.

| File | What it proves |
|---|---|
| `01_maths_sync_dialog_13_files_skip_0.png` | Maths upload dialog: 13 files, `Skip 0 Files`, `Delete 0`, `Move 0`. The 13th is `HASHES.txt`, a packaging error. |
| `02_maths_upload_in_progress_frontend_already_104.png` | Maths at 305 MB in flight; FRONTEND panel already reads 13.0 MB / 104 files, so the frontend shortfall predates the maths upload. |
| `03_files_page_math_380mb_13_files.png` | MATH 380 MB, 13 files, with per-file sizes. |
| `04_files_page_frontend_13mb_104_files.png` | FRONTEND 13.0 MB, 104 files. The basis of TR-061. |
| `05_dtt_replay_no_game_modes_prepublish.png` | Replay menu reads "No game modes available". Timestamped before the publish, so unresolved rather than failed. |
| `06_dtt_versions_front_vundefined_prepublish.png` | `Front (Current Vundefined)`, `Math (Current V)`: the pre-publish state the walkthrough predicted. |
| `07_dtt_settings_menu_and_balance_presets.png` | Settings surface: Balance, Currency, Language, Device Type, Open in New Tab, Social Mode. |
| `08_dtt_local_testing_redirect_url.png` | Local Testing offers a Redirect URL defaulting to `http://localhost:3000`. Lets us iterate against real RGS without an upload cycle. |
| `09_dtt_screen_presets_popout_s_400x225.png` | Seven viewport presets. **Popout S is exactly 400 x 225**, confirming the mini-player target. |
| `10_LIVE_GAME_hero_image_broken.png` | The running game. Broken-image placeholder where the pilot stands, car rendering correctly behind it. TR-061's live evidence. |
| `11_dtt_versions_front_v1_math_v1_published.png` | `Front (Current V1)`, `Math (Current V1)`. Publishing succeeded. |
| `12_dtt_language_menu_lists_da_danish.png` | Platform language list includes `da` (Danish), which we do not ship. Still scrolling at the capture edge. TR-059 extension. |
| `13_TR059_features_menu_german_chrome_english_body.png` | German session: `DREHKOSTEN`, `DREHMODI`, `WÄHLEN`, `AKTIV`, `AKTIVIEREN` beside English mode names and blurbs. Also shows correct per-tier pricing (100x, $50,000.00 at a $500.00 bet). |
| `14_TR059_TR062_paytable_german_title_english_body_em_dashes.png` | `GEWINNTABELLE` over English body copy, and the two em dash strings still rendering to a player. Evidence for both TR-059 and TR-062. |
| `15_maths_overall_bet_level_compliance_all_pass.png` | Every constraint green at both 2 Star and 3 Star. |
| `16_maths_all_five_modes_compliant.png` | BASE, CRUISE, ANTELITE, BONUS, SUPER all COMPLIANT, all 96.35% RTP, all 5,000x max. |
| `17_maths_base_detailed_metrics_and_6of6.png` | BASE 6 of 6, including Cross-Mode RTP Consistency at 0.00% variance, and the platform's RTP ceiling of 96.70%. |
| `18_maths_base_hit_rate_distribution.png` | Hit rate bands with counts and RTP contributions. |
| `19_maths_base_property_table_rtp_963500_sd_172841.png` | The platform's own figures: RTP 96.3500, Standard Deviation 17.2841, Simulation Count 100000. Independent corroboration of our committed claims. |

---

## Part 2, the remediation round and live play (21 further captures)

| File | What it proves |
|---|---|
| `20_RESOLVED_sync_upload_4_skip_104_names_the_same_four.png` | **`Upload 4 Files, Skip 104 Files`.** The portal independently names the same four files the diff named. Resolves TR-061 and settles its cause. |
| `21_sync_dialog_detail_four_filenames.png` | The four filenames legible: `bgm_loop.mp3`, `scene_character.png`, brand_mark_base.png, `frame-1.png`. |
| `22_FIXED_hero_pilot_rendering_front_v2.png` | The pilot renders. `Front (Current V2)`, `Math (Current V1)`. |
| `23_mobile_portrait_TR065_scrollbar.png` | Mobile portrait, playable. Scrollbar on the game frame: TR-065. |
| `24_mobile_s_320x568_TR065_scrollbar.png` | Mobile S, same scrollbar. |
| `25_popout_l_800x450_hero_splash.png` | Popout L, the WE ROLL SPINNERS hero splash and TAP TO CONTINUE. |
| `26_popout_l_800x450_full_landscape_hud.png` | Popout L renders the full landscape HUD, correctly not the mini strip. |
| `27_popout_s_400x225_selected.png` | Popout S selected. |
| `28_popout_s_mini_strip_TR066_win_clipped.png` | Mini strip with all seven controls, closing DTT check 10. WIN readout clipped mid-glyph: TR-066. |
| `29_laptop_1024x576_clean.png` | Laptop, clean, no scrollbar. |
| `30_TR062_paytable_em_dash_still_shipping_in_v2.png` | The em dash still rendering in V2. TR-062 unresolved. Also pins H1 1.5/6/22 and H2 0.8/3/10 against the PAR. |
| `31_bets_panel_50_rounds_settled.png` | The Bets panel: time, mode, cost, payout, multiplier, status. |
| `32_guidelines_tab_0_of_58_prechecks.png` | The 58-item checklist at 0 of 58. |
| `33_guidelines_tail_final_approval.png` | Tail of the checklist through Game Released. |
| `34_guidelines_beside_running_game.png` | Checklist beside the running game. |
| `35_guidelines_scroll.png` | Mid-list scroll position. |
| `36_bet_detail_event_52121_replay_this_bet.png` | Event ID 52121, Operator, Currency, Cost, Payout, Cost multiplier, and the **Replay this bet** button. |
| `37_REPLAY_WORKING_event_52121_with_disclaimer.png` | **Replay working live**, disclaimer rendering, `Mode: base`, `Bet: $1.00`, `Currency: USD`. |
| `38_autoplay_1000_bet_47_remaining.png` | Autoplay at $1,000 a spin, 4x turbo, 47 remaining, $50M balance. |
| `39_session_131_spins_net_minus_61260.png` | 131 spins, wagered $131,000, won $69,740, net -$61,260. Reconciles to the HUD balance exactly. |
| `40_session_143_spins_net_plus_9590_after_80650_win.png` | 143 spins, won $152,590, net +$9,590. One x80.65 win twelve spins earlier caused the whole swing. |

---

## Part 3, buy modes and the money path (8 further captures)

| File | What it proves |
|---|---|
| `41_session_524_base_spins_balance_reconciles.png` | 524 base spins, wagered $524,000, won $441,330, net -$82,670. Balance $49,917,330 reconciles exactly. |
| `42_after_three_bonus_buys_balance_reconciles.png` | After three $500 bonus buys at 100x. Balance $49,972,875 reconciles exactly against the bet log. |
| `43_bets_panel_bonus_rows_cost_column.png` | The Bets panel showing the three bonus rows as `bonus $500.00` in the COST column, which is the bet level and not the $50,000 actually debited. The source of the cost confusion. |
| `44_features_menu_shows_true_buy_cost.png` | The FEATURES menu in English: `SPIN COST $500.00`, and Buy Overdrive priced `100x, $50,000.00` on the card itself. **The game states the true buy cost in two places before purchase**, the card and the confirm dialog. |
| `45_nitro_confirm_price_200000_at_500_bet.png` | NITRO OVERDRIVE confirm at a $500 bet: `PRICE $200,000.00`, RTP 96.35%, MAX WIN 5,000x base bet. **The game shows the true cost up front.** Guideline item 27 confirmed live. |
| `46_TR068_win_57215_while_balance_falls_142785.png` | **TR-068.** `WIN $57,215.00` in large green type while the balance falls by $142,785, because the round cost $200,000. Balance $49,830,090 reconciles exactly. |
| `47_nitro_confirm_price_400000_at_1000_bet.png` | Same dialog at a $1,000 bet: `PRICE $400,000.00`. Cost scales correctly with bet level. |
| `48_final_balance_48916485_reconciles_exactly.png` | After five super buys. Balance $48,916,485 reconciles exactly. The 400x debit is charged correctly. |
