# Session Report - R092 FINAL MISSING ASSETS: the tile plate and M1 both land at zero drift, and the arc-2 placeholder set is complete (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R092_FINAL_MISSING_ASSETS_Prompt.md`. Branch:
`claude/r092-final-missing-assets`, review lane, held for Fable and the owner. **THE FENCE HELD:
zero rasters staged, asserted by a gate. The swaps live only in the working tree. output/
untouched and read only, no generation, no API call, no kit packaged. The owner's dev server on
5173 was never touched; this session ran its own on 4173 and stopped it.** Locked paths not
involved.

## Preconditions: all met

| Precondition | State |
|---|---|
| On `main`, up to date | Yes. R091 merged as `236723e0`; checked out `main` and pulled |
| `arc2-baseline` | **`618b711eebcaed7682aca4f63b16b24911d5c456`**, unchanged |
| `.scratch/art-review/chatgpt-final-missing-480-masters/` | Present, two masters plus record |
| Previous 22 placeholders | All present, plus the R091 provenance record still deliberately dirty |

## TASK: both swaps, both at zero drift

| Row | Source | Shipped path | Transform | Drift | Result |
|---|---|---|---|---|---|
| SY-13 | `01-tile-plate-732x612.png` | `symbols/tile_plate.png` | 732x612 to 244x204 | **0.0000%** | **SWAPPED** |
| SY-07 | `02-m1-aggressive-front-intake-480x480.png` | `symbols/m1.png` | 480x480 to 240x240 | **0.0000%** | **SWAPPED** |

Both went through the real `ingest.py` unmodified and unflagged. **Nothing was forced and no
flag was passed.**

### The tile plate, and the thing worth naming before the look pass

R090 refused a square master at 16.39% drift and recommended exactly this canvas: 3x the target
at 732x612, bezel edge to edge, zero margin. The new master is built that way, so the gate that
refused twice now passes at zero. Measured rather than trusted: **the ink reaches all four
canvas edges, margins 0/0/0/0**, so SY-13's `safe_margins` requirement that it "fills the cell"
is satisfied for the first time.

**This plate carries no green key and no alpha, deliberately, because the whole image is the
plate.** Ingest reported `cleared 0px, soft edge 0px` and the delivered file is **100% opaque**,
where the plate it replaces had transparent rounded corners at a 23px radius. So the corner
rounding is now done by `.tile-plate`'s own `border-radius: 8px` rather than by the art's alpha.
That is a real change in how the corner is produced, and it was verified in the running game
rather than reasoned about: the plate loads at 244x204 into a 114.4x95.3 box under
`object-fit: fill`, 35 instances on the board, **corners round cleanly with no square-corner
artefact**.

Also verified that the despill did nothing it should not have: colour delta of the delivered
file against a plain Lanczos downscale of the source is **max 0, mean 0.000**. With no green in
the image there is nothing for the despill to act on, which is the correct outcome and worth
measuring rather than assuming, because a despill that silently shifted the cyan edge response
would have been invisible in a thumbnail.

### M1, and the last glow-era symbol retired

R090's E5 recorded `m1.png` as the only asset left from the pre-reskin set, carrying 60.2%
soft-edge pixels where the swapped symbols carry 7 to 20%, with no candidate in any batch. There
is one now.

Delivered file: **22,850 visible pixels (39.7%), 37 pure-green pixels at or below 5.9% alpha**,
invisible at render size. Alpha bbox rows 63 to 179, columns 4 to 235, a wide short intake
module as the subject implies, with 63px of top padding out of 240.

**The headroom question that dogged M2 does not arise here.** `IDLE_CLASS` maps M1 to
`idle-rev`, which is `filter` plus `scale(1.012)` with **no translate at all**, so there is no
excursion to clear and no art-space contract to violate.

## TASK: report

- **Swapped 2, failed 0.** Both at 0.0000% aspect drift through the normal ingest path.
- **The working tree now carries 24 modified rasters**, up from 22.
- **Zero rasters staged**, asserted by a gate.
- `npm run build` exit 0.
- Local preview on 4173: **zero console errors, zero page errors, zero missing-asset requests,
  no layout breakage.** The board now renders the complete set. M1 reads as a front intake and
  is clearly distinct from the H1 wheel beside it. The plate gives every cell mechanical depth.

**The arc-2 placeholder set is now complete in the working tree**: every symbol including M1,
the tile plate behind all 35 cells, the background pair, the gauge pair and seven UI controls.

### Payload, recorded as a direction rather than a problem

| File | Before | After | Note |
|---|---|---|---|
| `tile_plate.png` | 1,054 B | **81,899 B** | The ratio looks alarming and is misleading: the old plate was a flat three-colour rounded rectangle that compressed to almost nothing. It is one file. |
| `m1.png` | 37,695 B | **61,996 B** | In line with the rest of the swapped symbol set. |

Neither is a problem against the 25 MiB kit budget. Both are recorded so a later session does
not have to rediscover them.

## Verification

Records-only commit; the swaps are deliberately uncommitted. Close gates chained with `&&` per
(u.1), each exit code the direct left operand. Explicit paths per (k). Remote CI verified with
the full SHA per rule 10.

## ESCALATIONS

**E1 (R092). The tile plate is materially busier than the flat rectangle it replaces, and
SY-13's own note says it must stay subordinate to the symbols.** It now carries stepped bezel
edges, machined corner transitions and a visible carbon weave behind every one of the 35 cells,
and it is the single highest-leverage tile in the set with no per-symbol branch. On screen the
symbols still dominate and I would not call it a defect, but this is deliberate art direction
rather than an aspect fix, so it wants the owner's eye rather than a builder's verdict.

**E2 (R092). The plate's corner geometry now comes from CSS rather than from the art.** The old
plate defined its own corner with a 23px alpha radius; the new one is opaque and square, rounded
by `.tile-plate { border-radius: 8px }`. The rendered radius is therefore smaller than before.
It reads correctly in the preview, and it is recorded because it is a change nobody asked for and
a future session comparing the two files would otherwise find it surprising.

R091's E1 through E4 stand, as do R090's E1 through E4 (E5 is CLOSED by this session), R089's E1
through E3, R087's E1 through E4 and R086's E2 through E5.

## FOR THE NEXT SESSION

**The working tree is LEFT SWAPPED with 24 modified rasters plus one provenance record**, so the
owner can run `npm run dev` from `frontend/` and look at the complete set.

**RESTORE INSTRUCTION, all currently modified paths:**

```
git checkout -- frontend/public/assets/themes/future-spinner/backgrounds/bg_base.jpg \
                frontend/public/assets/themes/future-spinner/backgrounds/bg_overdrive.jpg \
                frontend/public/assets/themes/future-spinner/symbols/wild.png \
                frontend/public/assets/themes/future-spinner/symbols/scatter.png \
                frontend/public/assets/themes/future-spinner/symbols/h1.png \
                frontend/public/assets/themes/future-spinner/symbols/h1_base.png \
                frontend/public/assets/themes/future-spinner/symbols/h1_spin.png \
                frontend/public/assets/themes/future-spinner/symbols/h2.png \
                frontend/public/assets/themes/future-spinner/symbols/m1.png \
                frontend/public/assets/themes/future-spinner/symbols/m2.png \
                frontend/public/assets/themes/future-spinner/symbols/m3.png \
                frontend/public/assets/themes/future-spinner/symbols/l1.png \
                frontend/public/assets/themes/future-spinner/symbols/l2.png \
                frontend/public/assets/themes/future-spinner/symbols/l3.png \
                frontend/public/assets/themes/future-spinner/symbols/tile_plate.png \
                frontend/public/assets/themes/future-spinner/ui/gauge_face.png \
                frontend/public/assets/themes/future-spinner/ui/gauge_needle.png \
                frontend/public/assets/themes/future-spinner/ui/spin_button.png \
                frontend/public/assets/themes/future-spinner/ui/btn_turbo.png \
                frontend/public/assets/themes/future-spinner/ui/btn_bet_plus.png \
                frontend/public/assets/themes/future-spinner/ui/btn_bet_minus.png \
                frontend/public/assets/themes/future-spinner/ui/feature_button.png \
                frontend/public/assets/themes/future-spinner/ui/btn_menu.png \
                frontend/public/assets/themes/future-spinner/ui/btn_autoplay.png \
                reports/qa/background_overdrive_derive.json
```

Kit packaging stays forbidden while any placeholder differs from HEAD.

**What remains open is no longer about missing art.** The placeholder set is complete. The live
questions are the provider ruling that gates whether any of this can ship at all, whether
illustrated celebration art is wanted given every win moment is CSS today (R091 E2, 9.65 MB
currently homeless), `ingest.py`'s hardcoded jpeg quality for opaque full-size rows (R091 E1),
the `ALPHA_SNAP_FLOOR` comparison bug (R090 E1), and the R088 pack on the owner's reissue.

Model and effort: one session, unattended, review lane. Both swaps passed the gate unforced, so
no escalation was triggered.
