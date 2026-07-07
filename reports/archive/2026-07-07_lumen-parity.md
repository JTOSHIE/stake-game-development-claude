# Session Report: LUMEN parity — MUSIC/SOUND volume sliders + paytable Interface Guide

- **Date:** 2026-07-07
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/lumen-parity` (off up-to-date `main`, in a dedicated worktree at
  `/Users/jt/math-sdk-lumenparity`).
- **Source:** the owner noticed LUMEN (`sideproject/lumen`, a separate side project on
  `claude/lumen-sideproject`) had independent MUSIC/SOUND volume sliders and a paytable
  Interface Guide section that Future Spinner never got, and asked for both to be ported
  over. Used LUMEN's own commit `4f4d6ef` ("paytable overhaul + music/SFX volume controls")
  as the reference implementation - copied the audio-store and audio-slider pattern
  directly (it is a validated, shipped design already), and re-authored the Interface Guide
  section against Future Spinner's actual controls/assets rather than porting LUMEN's whole
  paytable visual overhaul (which also redid the symbol-payout grid - out of scope here,
  and Future Spinner's existing paytable is unchanged per CLAUDE.md's "Paytable unchanged"
  rule).

## What this delivers

### 1. Independent MUSIC / SOUND volume (previously mute/unmute only)
- New `frontend/src/lib/stores/audioSettings.ts`: `musicVolume`/`sfxVolume`, each a
  writable in [0, 1], persisted to `localStorage` (`fs_music_volume`/`fs_sfx_volume`,
  matching the project's existing `fs_`-prefixed key convention), fully guarded (SSR /
  blocked storage / missing key / NaN all fall back to the default - `MUSIC_DEFAULT = 0.5`,
  `SFX_DEFAULT = 0.8`, same defaults LUMEN shipped with).
- `frontend/src/lib/services/soundService.ts`: reworked from hardcoded per-sound volumes to
  a `BASE` volumes table scaled by the two sliders - BGM loudness is `musicVol * bgmDuck`
  (duck factors preserved from the original spin/anticipation ducking ratios: 0.4 and 0.27
  of the music ceiling), every SFX is `BASE.<sound> * sfxVol`. `applyVolumes()` recomputes
  every sound's volume and runs on every slider change and on unmute (mute still overrides
  and stops all one-shot clones immediately, unchanged from before).
- `frontend/src/lib/components/HudOverlay.svelte`: the menu's old single Mute button is now
  an `.audio-panel` with the Mute toggle plus two labelled range sliders (MUSIC / SOUND),
  styled on the HUD's existing `--sig-cyan` accent token (not a hardcoded colour, so it
  follows the active theme scheme like every other HUD control).

### 2. Paytable Interface Guide (new section)
- `frontend/src/lib/components/PaytableModal.svelte`: added an `INTERFACE_GUIDE` array (Spin,
  Increase Bet, Decrease Bet, Features, Autoplay, Menu - each with its real theme UI PNG -
  plus Turbo and Max Bet as styled text pills, since neither has dedicated art) and a new
  "Interface Guide" section between Bet Modes and RTP, `data-testid="interface-guide"` for
  headless verification. Confirmed the referenced UI assets exist at
  `assets/themes/future-spinner/ui/` (the active theme) and are NOT touched by Build Diet's
  `assets/ui/*` prune (that prunes the separate, legacy top-level `assets/ui/` folder only -
  confirmed by reading `build_diet_verify.mjs`).

## Verification
- `npm run build`: clean.
- `npx svelte-check`: clean (only the 6 pre-existing `node_modules` errors).
- `grep -rn "fonts.googleapis.com\|fonts.gstatic.com"`: empty (compliance unaffected).
- Playwright, dev server on a throwaway port: dragged the MUSIC slider to 20% and confirmed
  it renders correctly alongside SOUND at its 80% default and the Mute button, all in the
  HUD's cyan accent (`reports/screens/lumen-parity/02_audio_menu_music20pct.png`); opened
  the paytable and scrolled through the new Interface Guide section, confirming every real
  control image loads (Spin/Increase Bet/Decrease Bet/Features/Autoplay/Menu) and both pills
  (TURBO/MAX) render, with the RTP grid and Disclaimer sections below unaffected
  (`reports/screens/lumen-parity/03_paytable_interface_guide_top.png`,
  `04_paytable_interface_guide_pills_and_rtp.png`).
- Locked files confirmed untouched (`rgsService.ts`, `gameStore.ts`, `games/future_spinner/`
  diff empty) - this is a purely additive frontend change, no maths/PAR/locked-surface
  changes needed.

## Needs owner / Fable attention
- None blocking. Purely additive UI/audio parity work, no maths or locked-file changes.
- If a future skin wants different Interface Guide copy/art per control, `INTERFACE_GUIDE`
  in `PaytableModal.svelte` is the single place to edit (same "one array, everything derives
  from it" pattern already used for `FS_MODES`).

## FOR THE NEXT SESSION
- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** used LUMEN's already-
  shipped `audioSettings.ts`/`soundService.ts` pattern verbatim (proven design, no need to
  redesign), but hand-wrote the Interface Guide's content and CSS against Future Spinner's
  actual controls/assets and existing `--sig-*` theme-token vocabulary rather than copying
  LUMEN's cyan-hardcoded styling, and did not port LUMEN's separate whole-paytable symbol-
  grid visual redesign since that touches shipped, validated territory out of scope for
  this ask.
- **Alternatives rejected:** porting LUMEN's full `PaytableModal.svelte` overhaul wholesale
  (rejected - it also redoes the symbol payout cards/copy which Future Spinner's paytable
  doesn't need touched); hardcoding LUMEN's raw cyan hex values in the new slider/guide CSS
  (rejected - Future Spinner's HUD/paytable already have a `--sig-cyan`/`--sig-*` scheme-token
  system so every other skin's colours stay consistent automatically).
- **Files touched:** `frontend/src/lib/stores/audioSettings.ts` (new),
  `frontend/src/lib/services/soundService.ts`, `frontend/src/lib/components/{HudOverlay.svelte,
  PaytableModal.svelte}`, this report. `frontend/dist` build noise restored to `HEAD` before
  commit. Locked files confirmed untouched.
- **Open threads:** none from this pass. Both LUMEN-parity items the owner flagged are now
  done; ask before starting anything else.
