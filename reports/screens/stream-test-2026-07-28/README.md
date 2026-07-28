# Stream test capture set, 2026-07-28

The watched-session capture for the stream test
(`reports/briefs/FS_STREAM_TEST_Prompt.md`, WAVE 1). The game will be shown on
stream to tens of thousands of viewers; this set is every state AND every
transition midpoint of a full watched session, at the seven platform presets
plus one stretched desktop window, plus one full session in German and one in
Arabic. 519 frames, ten sessions, 70 wallet plays, zero fabricated screens
(every spin asserted against the wallet-call counter before its shot counted).

Produced by `frontend/scripts/stream_test_capture.mjs` against the production
build of HEAD `d9bdf22` (v10): dist served in-process, wallet endpoints
fulfilled at the network boundary from committed real book rounds
(`src/lib/services/__fixtures__/replay_rounds.json`), RGS host an invalid TLD
so nothing can reach a network. Machine-generated set, so the catalogue is
this README plus `MANIFEST.json`, per the analyst pattern's rule for machine
sets.

## The watched session, in viewing order

splash (with entrance mid), rules card, base idle, a three-spin dead streak
(with reels-in-motion mids), a standard win, a big win (with two count-up
mids), the HUD menu, the session panel, the paytable end to end, the autoplay
menu, the FEATURES menu with both buy dialogs, the feature trigger, entry
card, six in-flight feature frames, the exit back to base, and in a fresh
context the 5,000x wincap: overlay mid-fade, held celebration, collect press,
and the return to base.

Filenames: `NNN_<session-slug>_<surface>.png`. Frames containing `transition_`
are deliberate mid-animation captures; their timing is approximate by nature
(screenshot overhead included) and they are evidence of what a viewer can see,
not of a specific millisecond.

## Sessions

| Session | Viewport | Lang | Frames |
|---|---|---|---|
| Desktop | 1200x675 | en | 52 |
| Laptop | 1024x576 | en | 52 |
| Popout L | 800x450 | en | 52 |
| Popout S | 400x225 | en | 51 |
| Mobile L | 425x812 | en | 52 |
| Mobile M | 375x667 | en | 52 |
| Mobile S | 320x568 | en | 52 |
| Stretch | 1920x800 | en | 52 |
| Desktop de | 1200x675 | de | 52 |
| Desktop ar | 1200x675 | ar | 52 |

Stretch (1920x800) is the brief's stretched desktop window: deliberately not
16:9, the shape of a streamer's browser dragged wide on a 1080p display with
chat dock or taskbar eating the height.

## Known limits of THIS set

- Transition midpoints are single samples of continuous animations, not video.
  A defect visible only in a narrow window between two sampled offsets can be
  missed; the motion-residue audit reads the mids it has.
- **Popout S has no autoplay_menu frame, and that is a fact about the game,
  not the harness**: across four runs and two selector families (translated
  aria-labels, then all four layout-branch wrapper classes) no autoplay
  control could be found or opened at 400x225. Handed to the Wave 2
  composition squad to confirm from the frames and disposition in the ledger.
- Social mode is not captured here (it forces English and swaps the vocabulary
  layer); it remains the never-captured surface named in
  `docs/QUALITY_CHARTER.md` 5.3.
- Replay mode is not captured here; TR-114 owns that surface.
- The harness lessons this set paid for are recorded in the capture script's
  own comments: locale-agnostic selectors (the game translates aria-labels, so
  testids and wrapper classes are the selectors, and the desktop-class layout
  is a FOURTH branch the earlier capture family never named), and the autoplay
  menu closed by toggling its own button rather than Escape, which it ignores.
