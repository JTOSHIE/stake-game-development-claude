# Small-screen recomposition, before and after (2026-07-26)

Brief: `reports/briefs/FS_SMALLSCREEN_RECOMPOSE_Prompt.md`. Tracker rows: TR-083
(Popout S) and TR-084 (Mobile S, M and L).

The defect specification is the owner's own live captures, committed by the previous
session at `reports/screens/live-round2-2026-07-26/`:

| Owner capture | What it shows |
|---|---|
| `08_DEFECT_popout_s_stage_small_and_right_anchored.png` | Popout S stage small and hard right-anchored, FEATURES stranded far left |
| `07_DEFECT_mobile_M_reels_not_filling_width.png` | Mobile M reels not filling the available width |
| `06_DEFECT_mobile_L_dead_space_between_bet_and_controls.png` | Mobile L dead band between BET and the controls |
| `05_DEFECT_mobile_portrait_reels_small_in_pane.png` | Mobile portrait reels small inside the pane |

`before/` is captured from the pre-change build, `after/` from the shipped build, both
by `frontend/scripts/smallscreen_composition_gate.mjs` at the platform's own seven
Screen presets. Filenames match one-to-one between the two directories, so any pair
can be opened side by side.

`popout_s_400x225_features_open.png` is the FEATURES panel opened from the mini strip
the way a player opens it, which is the half of the Popout S defect that a picture of
the idle screen cannot show: before the pass, the panel's mode list had a 28px window
onto 663px of content and none of the four mode cards was reachable.

## The measured change

| Preset | Grid fill, before | after | Frame centre offset, before | after | Dead band, before | after |
|---|---|---|---|---|---|---|
| Popout S 400x225 | 32.8% | **44.2%** | **+110.6px** | **0.0px** | n/a | n/a |
| Mobile L 425x812 | 96.0% | 96.0% | 0.0px | 0.0px | **30.8px** | **10.0px** |
| Mobile M 375x667 | 79.5% | **96.0%** | 0.0px | 0.0px | 10.5px | 10.0px |
| Mobile S 320x568 | 65.8% | **83.7%** | 0.0px | 0.0px | 10.5px | 10.0px |
| Desktop, Laptop, Popout L | unchanged | unchanged | 0.0px | 0.0px | n/a | n/a |

10.0px is `.p-hud`'s own `gap: 10px`, the one deliberate breathing space, so the
after column is the floor rather than a smaller hole.

The dead band was proportional to viewport HEIGHT, which is why the owner measured
roughly 250px where this machine measured 30.8px at a nominal 425x812. Swept at 425
wide on the pre-fix build it grew at exactly 1.000px per px of viewport height:
30.8 at 812, 118.8 at 900, 218.8 at 1000, **249.8 at 1031**, 618.8 at 1400. The
platform's Screen preset sets the width and the window supplies the height. After the
fix it is flat at 10.0px across all ten swept heights.

Gate results: `reports/qa/smallscreen_composition_before_2026-07-26.json` and
`..._after_2026-07-26.json`.
