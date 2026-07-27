# POLISH REVIEW CAPTURE SET, 2026-07-27

A fresh full-surface capture set taken from the **production build** at HEAD, so Fable can
review every player-visible surface on return without launching anything. Convention (h):
visual verdicts are given on proofs committed under `reports/screens/`.

Australian English, no em dashes or en dashes.

## Provenance

| Field | Value |
|---|---|
| Produced by | `frontend/scripts/polish_review_capture.mjs` |
| Build commit | `2745b4d8ed5c4f02dda9daf38f3b6e8f3200d5f9` |
| Clean tree at build | **true** |
| Bundle | 109 files, 15,607,103 bytes |
| Frames | **91** |
| Wallet calls during capture | authenticate 18, play **8**, end-round 8 |
| Machine-readable index | `MANIFEST.json` beside this file |

**Why the wallet count is in the provenance table.** A capture set where nothing ever
reached the wallet is a set of photographs of an idle screen with informative filenames.
That has happened in this repository before, and the harness now fails red on zero
`/wallet/play` calls. Eight real rounds were played through the shipped code.

## How these were produced, and what that means for how much to trust them

This is the **production build**, served by `vite preview`, launched with real `sessionID`
and `rgs_url` parameters. Every DEV-only hook (`?mock`, `?windemo`, `?anticipationDemo`,
`window.__testStores`) is compiled out of a production build, so none of them was used and
none could have been.

The three wallet endpoints are intercepted at the network boundary and answered with
official-shaped payloads. Rounds come from `src/lib/services/__fixtures__/replay_rounds.json`,
which holds **real committed book rounds** with their full event arrays, selected by reading
the mode off the `/wallet/play` request body. So the presentations below are the shipped
components rendering genuine round data. **Everything downstream of the interception is
shipped code.**

What that does NOT cover, stated so nobody over-reads the set: real network timing, real
device performance, audio in context, and anything that depends on the platform's own
chrome around the iframe.

## What to look at first

This set is the first one taken after the machine-tell sweep
(`docs/QUALITY_CHARTER.md`), so five things changed appearance and are worth a
deliberate look:

1. **`026_desktop_celebration_max_win.png`** and its Mobile L twin. The crown was three
   `★` font glyphs, U+2605, which the Orbitron subset does not carry, so it rendered in
   whatever the operating system fell back to. It is three drawn SVG stars now. The
   multiplication sign beside `5,000` was a letter `x` and is now `×`, matching every
   other surface.
2. **Any paytable frame.** The close control was `✕` (U+2715, also absent from the subset)
   and the ways-to-win arrows were `→` (U+2192, likewise). Both are drawn now, in the same
   geometric 24x24 family as the existing HUD icons.
3. **Any `hud_menu` frame.** The audio control was two operating-system emoji, so it looked
   like a different product on every device. It is one drawn speaker icon now.
4. **Any `autoplay_menu` frame.** The loss-limit field had a hardcoded `$` beside it in a
   game whose owner plays it in euro. The symbol is derived from the session currency now,
   and placed on the side that currency places it.
5. **The splash and loading surfaces.** The root font stack was the Vite scaffold's own,
   naming no brand face at all, and two surfaces were set in Courier New. The brand face
   leads everywhere now.

## Known limits of THIS set, named rather than left to be discovered

- **Two presets carry the full sweep**, Desktop and Mobile L, one landscape and one
  portrait. The other five carry the layout-critical surfaces only: splash, rules, base
  idle, HUD menu, session panel, paytable, features and autoplay. Rounds cost wall-clock
  and the small presets exist to show layout, which the surfaces above already do.
- **The 5,000x cap runs in its own browser context.** Two earlier runs proved that a fourth
  spin cannot start inside the settle window after three presentations have run, and the
  harness's guard correctly SKIPPED the shot rather than photographing a stale screen. The
  fix is a fresh context where the cap round is the first spin, not a looser guard.
- **`cruise` and `antelite` appear as mode SELECTIONS, not as played rounds.** The FEATURES
  frames show them selected with their prices; no separate round was captured per standing
  mode.
- **Social mode is not in this set.** It forces English and swaps the vocabulary layer, and
  it deserves its own pass rather than a corner of this one.
- **This is a light theme of one.** The theme selector is dev-only, so only the shipped
  Future Spinner skin can appear.

## The index


### Desktop, 1200x675  (26 frames)

| Frame | Surface |
|---|---|
| `001_desktop_splash.png` | Hero splash, first surface a player sees |
| `002_desktop_intro_rules.png` | Rules card, gated before first spin |
| `003_desktop_base_idle.png` | Base game at rest, full HUD |
| `004_desktop_hud_menu.png` | HUD menu open, audio controls and menu items |
| `005_desktop_session_panel.png` | Session information panel |
| `006_desktop_paytable_top.png` | Paytable, opening view |
| `007_desktop_paytable_01_match_symbols_on_adjacent_reels_st.png` | Paytable section |
| `008_desktop_paytable_02_ways_to_win.png` | Paytable section |
| `009_desktop_paytable_03_symbol_payouts.png` | Paytable section |
| `010_desktop_paytable_04_rules.png` | Paytable section |
| `011_desktop_paytable_05_overdrive_free_spins.png` | Paytable section |
| `012_desktop_paytable_06_bet_modes.png` | Paytable section |
| `013_desktop_paytable_07_interface_guide.png` | Paytable section |
| `014_desktop_paytable_08_responsible_play.png` | Paytable section |
| `015_desktop_paytable_09_disclaimer.png` | Paytable section |
| `016_desktop_features_menu.png` | FEATURES menu, all five modes and their prices |
| `017_desktop_mode_cruise_selected.png` | Cruise selected, standing mode |
| `018_desktop_mode_overboost_on.png` | OVERBOOST on, effective spin cost shown |
| `019_desktop_dialog_buy_overdrive.png` | Buy confirm dialog, price stated up front |
| `020_desktop_dialog_nitro_overdrive.png` | Buy confirm dialog, price stated up front |
| `021_desktop_autoplay_menu.png` | Autoplay menu, stop conditions and loss limit |
| `022_desktop_celebration_win.png` | Win presentation |
| `023_desktop_celebration_big_win.png` | Win presentation |
| `024_desktop_feature_entry_card.png` | Free spins entry, explicit continue gate |
| `025_desktop_feature_in_play.png` | Overdrive free spins in play, meter and totals |
| `026_desktop_celebration_max_win.png` | MAX WIN celebration, the 5,000x cap, first spin of a fresh session |

### Laptop, 1024x576  (8 frames)

| Frame | Surface |
|---|---|
| `027_laptop_splash.png` | Hero splash, first surface a player sees |
| `028_laptop_intro_rules.png` | Rules card, gated before first spin |
| `029_laptop_base_idle.png` | Base game at rest, full HUD |
| `030_laptop_hud_menu.png` | HUD menu open, audio controls and menu items |
| `031_laptop_session_panel.png` | Session information panel |
| `032_laptop_paytable_top.png` | Paytable, opening view |
| `033_laptop_features_menu.png` | FEATURES menu, all five modes and their prices |
| `034_laptop_autoplay_menu.png` | Autoplay menu, stop conditions and loss limit |

### Popout L, 800x450  (8 frames)

| Frame | Surface |
|---|---|
| `035_popout-l_splash.png` | Hero splash, first surface a player sees |
| `036_popout-l_intro_rules.png` | Rules card, gated before first spin |
| `037_popout-l_base_idle.png` | Base game at rest, full HUD |
| `038_popout-l_hud_menu.png` | HUD menu open, audio controls and menu items |
| `039_popout-l_session_panel.png` | Session information panel |
| `040_popout-l_paytable_top.png` | Paytable, opening view |
| `041_popout-l_features_menu.png` | FEATURES menu, all five modes and their prices |
| `042_popout-l_autoplay_menu.png` | Autoplay menu, stop conditions and loss limit |

### Popout S, 400x225  (7 frames)

| Frame | Surface |
|---|---|
| `043_popout-s_splash.png` | Hero splash, first surface a player sees |
| `044_popout-s_intro_rules.png` | Rules card, gated before first spin |
| `045_popout-s_base_idle.png` | Base game at rest, full HUD |
| `046_popout-s_hud_menu.png` | HUD menu open, audio controls and menu items |
| `047_popout-s_session_panel.png` | Session information panel |
| `048_popout-s_paytable_top.png` | Paytable, opening view |
| `049_popout-s_features_menu.png` | FEATURES menu, all five modes and their prices |

### Mobile L, 425x812  (26 frames)

| Frame | Surface |
|---|---|
| `050_mobile-l_splash.png` | Hero splash, first surface a player sees |
| `051_mobile-l_intro_rules.png` | Rules card, gated before first spin |
| `052_mobile-l_base_idle.png` | Base game at rest, full HUD |
| `053_mobile-l_hud_menu.png` | HUD menu open, audio controls and menu items |
| `054_mobile-l_session_panel.png` | Session information panel |
| `055_mobile-l_paytable_top.png` | Paytable, opening view |
| `056_mobile-l_paytable_01_match_symbols_on_adjacent_reels_st.png` | Paytable section |
| `057_mobile-l_paytable_02_ways_to_win.png` | Paytable section |
| `058_mobile-l_paytable_03_symbol_payouts.png` | Paytable section |
| `059_mobile-l_paytable_04_rules.png` | Paytable section |
| `060_mobile-l_paytable_05_overdrive_free_spins.png` | Paytable section |
| `061_mobile-l_paytable_06_bet_modes.png` | Paytable section |
| `062_mobile-l_paytable_07_interface_guide.png` | Paytable section |
| `063_mobile-l_paytable_08_responsible_play.png` | Paytable section |
| `064_mobile-l_paytable_09_disclaimer.png` | Paytable section |
| `065_mobile-l_features_menu.png` | FEATURES menu, all five modes and their prices |
| `066_mobile-l_mode_cruise_selected.png` | Cruise selected, standing mode |
| `067_mobile-l_mode_overboost_on.png` | OVERBOOST on, effective spin cost shown |
| `068_mobile-l_dialog_buy_overdrive.png` | Buy confirm dialog, price stated up front |
| `069_mobile-l_dialog_nitro_overdrive.png` | Buy confirm dialog, price stated up front |
| `070_mobile-l_autoplay_menu.png` | Autoplay menu, stop conditions and loss limit |
| `071_mobile-l_celebration_win.png` | Win presentation |
| `072_mobile-l_celebration_big_win.png` | Win presentation |
| `073_mobile-l_feature_entry_card.png` | Free spins entry, explicit continue gate |
| `074_mobile-l_feature_in_play.png` | Overdrive free spins in play, meter and totals |
| `075_mobile-l_celebration_max_win.png` | MAX WIN celebration, the 5,000x cap, first spin of a fresh session |

### Mobile M, 375x667  (8 frames)

| Frame | Surface |
|---|---|
| `076_mobile-m_splash.png` | Hero splash, first surface a player sees |
| `077_mobile-m_intro_rules.png` | Rules card, gated before first spin |
| `078_mobile-m_base_idle.png` | Base game at rest, full HUD |
| `079_mobile-m_hud_menu.png` | HUD menu open, audio controls and menu items |
| `080_mobile-m_session_panel.png` | Session information panel |
| `081_mobile-m_paytable_top.png` | Paytable, opening view |
| `082_mobile-m_features_menu.png` | FEATURES menu, all five modes and their prices |
| `083_mobile-m_autoplay_menu.png` | Autoplay menu, stop conditions and loss limit |

### Mobile S, 320x568  (8 frames)

| Frame | Surface |
|---|---|
| `084_mobile-s_splash.png` | Hero splash, first surface a player sees |
| `085_mobile-s_intro_rules.png` | Rules card, gated before first spin |
| `086_mobile-s_base_idle.png` | Base game at rest, full HUD |
| `087_mobile-s_hud_menu.png` | HUD menu open, audio controls and menu items |
| `088_mobile-s_session_panel.png` | Session information panel |
| `089_mobile-s_paytable_top.png` | Paytable, opening view |
| `090_mobile-s_features_menu.png` | FEATURES menu, all five modes and their prices |
| `091_mobile-s_autoplay_menu.png` | Autoplay menu, stop conditions and loss limit |
