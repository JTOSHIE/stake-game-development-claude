# Session Report - R089 PREFERRED-MASTER SWAP: seven UI controls added to the working tree, seven symbols and the background refused on aspect, four UI rows have no live raster (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R089_PREFERRED_MASTER_SWAP_Prompt.md`. Branch:
`claude/r089-preferred-master-swap`, review lane per the brief, held for Fable and the owner.
**THE FENCE HELD: zero raster additions or modifications staged, asserted by a gate. The
actual swaps live only in the working tree and are never committed. output/ read only, no
generation, no API call, no kit packaged. The owner's dev server on 5173 was never touched;
this session ran its own on 4173 and stopped it.** Locked paths not involved.

## Preconditions: all met

| Precondition | State |
|---|---|
| On `main`, tree state | On `main` at `b67730c3` (R087 merged); tree carried the eight expected placeholders, reported dirty as designed |
| `arc2-baseline` | **`618b711eebcaed7682aca4f63b16b24911d5c456`**, unchanged |
| Preferred sources present | **26 of 26** found and header-measured, including the new `future-spinner-consistency-ui-480-masters` batch |
| Previous eight placeholders present | Yes, all eight still modified in the working tree |

## TASK 1: snapshot

26 preferred masters copied to `.scratch/preferred-swap-2026-08-24/src/` preserving batch
structure: 26 files, 7,953,501 bytes. Gitignored under `.scratch`.

## TASK 2: the swaps

Sources run through the AssetForge primitives directly (green-key knockout or native-alpha
despill, then premultiplied Lanczos downscale) at each shipped file's OWN real dimensions.
The manifest-driven `ingest.py` cannot be used for most of these because it refuses on
classification: the UI-control targets are REGEN or DEAD rows, not REPLACE. The brief's "or
equivalent premultiplied downscale + alpha handling" is exactly this path. The 1% aspect
guard was applied on the source before any resize, as `ingest.py` applies it.

### SWAPPED, working tree only (7)

| Row | Source | Shipped path | Transform |
|---|---|---|---|
| Spin Button | ui-support/03-ui-spin-button | `ui/spin_button.png` | 480x480 to 200x200 |
| Turbo | consistency-ui/01-ui-turbo-quick-spin | `ui/btn_turbo.png` | 480x480 to 200x200 |
| Bet + | consistency-ui/02-ui-bet-increase-plus | `ui/btn_bet_plus.png` | 480x480 to 200x200 |
| Bet - | consistency-ui/03-ui-bet-decrease-minus | `ui/btn_bet_minus.png` | 480x480 to 200x200 |
| Feature Buy | consistency-ui/07-ui-feature-buy-overdrive | `ui/feature_button.png` | 480x480 to 224x224 |
| Settings Button | consistency-ui/06-ui-settings-menu-button | `ui/btn_menu.png` | 480x480 to 200x200 |
| Autoplay | extra-ui/01-ui-autoplay-button | `ui/btn_autoplay.png` | 480x480 to 200x200 |

All seven verified on the delivered artefact: correct dimensions, RGBA, and a few pure-green
pixels at or below 9% alpha (2 to 12 per file), the same negligible Lanczos ringing recorded
at R086, far below the R083 halo class. No gate failed.

**WHERE THESE RENDER, verified in source, because it changes what the owner will see.** The
live HUD spin, bet, menu, turbo and autoplay controls are CSS plus inline SVG; a grep for a
live HUD `<img>` reading any of these seven rasters returns nothing. They are drawn as the
INTERFACE GUIDE inside the Paytable modal (`PaytableModal.svelte`, eight `kind: 'img'` guide
rows), and `feature_button.png` additionally renders live on the Buy screen
(`BuyBonus.svelte:117`). So the owner sees the swapped set by opening the paytable; the HUD
buttons themselves keep their CSS appearance during play. This is an honest limitation of the
targets, not of the swap.

### WRONG-SPEC, refused on aspect and skipped (7)

Same finding as R086, re-confirmed. Each would be squashed to fit and is left as it was.

| Row | Source | Target | Drift |
|---|---|---|---|
| M2 | symbols/M2-premium-coilover-strut | `symbols/m2.png` 240x240 | 34.4% |
| M3 | symbols/M3-holographic-dash-readout | `symbols/m3.png` 240x240 | 50.0% |
| L1 | symbols/L1-jewel-cut-lug-nut | `symbols/l1.png` 240x240 | 34.3% |
| L2 | symbols/L2-iridium-spark-plug | `symbols/l2.png` 240x240 | 34.4% |
| L3 | symbols/L3-forged-piston | `symbols/l3.png` 240x240 | 34.4% |
| Tile Plate | ui-support/06-tile-plate-refinement-v2 | `symbols/tile_plate.png` 244x204 | 16.4% |
| Main background | 480-masters/08-cyberpunk-garage-background | `backgrounds/bg_base.jpg` 1920x1080 | 43.7% |

The five symbol masters are portrait or landscape against square rows; the tile plate is a
square source against a 244x204 slot; the background is a square source against a 16:9 slot
and a 4x upscale besides. All want a re-render at target aspect, or an owner authorised pad
to square, before they can go in undistorted. `bg_overdrive.jpg` is the derived grade twin of
`bg_base`, so even a padded background would need its twin regenerated in the same pass.

### NO-ROW, no live shipped raster target (4)

| Row | Source | Reason |
|---|---|---|
| Main HUD Banner | consistency-ui/04-ui-main-hud-banner | No shipped HUD-banner raster; the HUD is CSS plus the DEAD panel plates |
| Paytable Button | consistency-ui/05-ui-paytable-button | No shipped paytable-button raster; the paytable opens from a CSS menu control |
| Sound On | extra-ui/03-ui-sound-on | No shipped sound-toggle raster |
| Sound Off | extra-ui/04-ui-sound-off | No shipped sound-toggle raster |

### ALREADY SWAPPED, left in place per the brief (8)

wild, scatter, h1, h1_base, h1_spin, h2, gauge_face, gauge_needle. Not re-touched.

**A mapping note recorded rather than left implicit:** the Turbo source is a single quick-spin
control and maps to `btn_turbo.png` only; the two further speed-state rasters `btn_turbo_2`
and `btn_turbo_3` are not in the shortlist and were left unchanged.

## TASK 3: verification and preview

- **Swapped 7, wrong-spec 7, no-row 4, already in place 8**, 26 shortlist rows.
- **Zero rasters staged**, asserted by a gate before commit.
- **Working tree now carries 15 modified placeholder rasters** (the 8 prior plus the 7 new).
- `npm run build` exit 0.
- Local preview on 4173: the paytable Interface Guide renders all seven swapped controls,
  all `naturalWidth > 0`, with clean silhouettes and no visible green fringe. **Zero console
  errors, zero page errors, zero missing-asset requests.** No layout breakage observed.

## Verification

Records-only commit; the swaps themselves are deliberately uncommitted. Close gates chained
with `&&` per (u.1), each exit code the direct left operand. Explicit paths per (k). Remote
CI verified with the full SHA per rule 10.

## ESCALATIONS

**E1 (R089). The seven swapped UI rasters change the Paytable Interface Guide and the Buy
screen, NOT the live HUD controls**, which are CSS plus inline SVG. If the owner wants the
live HUD buttons to carry this art, that is a component change (swap the CSS/SVG controls for
`<img>` or restyle them), which is code and out of scope for a working-tree asset swap. Named
so the look-pass is judged against the right surface.

**E2 (R089). Seven preferred masters cannot go in without distortion** (M2, M3, L1, L2, L3,
tile plate, background). They need a re-render at target aspect or an owner authorised pad to
square. This is R086's finding standing; nothing about it changed.

**E3 (R089). Four shortlist UI rows have no live raster target** (main HUD banner, paytable
button, sound on, sound off). If these controls are wanted as art, they need either a shipped
raster added and wired, or acceptance that they stay CSS.

R087's E1 through E4 stand, as do R086's E2 through E5, R085-R's E1, E2 and E4, and the older
open threads recorded there.

## FOR THE NEXT SESSION

**The working tree is LEFT SWAPPED with fifteen placeholder rasters, deliberately, so the
owner can run `npm run dev` from `frontend/` and look.** The new UI art is visible in the
Paytable modal's Interface Guide and on the Buy screen; the symbols and background are
unchanged from the R087 state because their preferred masters failed the aspect gate.

**RESTORE INSTRUCTION, to return the tree to HEAD before any kit build:**

```
git checkout -- frontend/public/assets/themes/future-spinner/symbols/wild.png \
                frontend/public/assets/themes/future-spinner/symbols/scatter.png \
                frontend/public/assets/themes/future-spinner/symbols/h1.png \
                frontend/public/assets/themes/future-spinner/symbols/h1_base.png \
                frontend/public/assets/themes/future-spinner/symbols/h1_spin.png \
                frontend/public/assets/themes/future-spinner/symbols/h2.png \
                frontend/public/assets/themes/future-spinner/ui/gauge_face.png \
                frontend/public/assets/themes/future-spinner/ui/gauge_needle.png \
                frontend/public/assets/themes/future-spinner/ui/spin_button.png \
                frontend/public/assets/themes/future-spinner/ui/btn_turbo.png \
                frontend/public/assets/themes/future-spinner/ui/btn_bet_plus.png \
                frontend/public/assets/themes/future-spinner/ui/btn_bet_minus.png \
                frontend/public/assets/themes/future-spinner/ui/feature_button.png \
                frontend/public/assets/themes/future-spinner/ui/btn_menu.png \
                frontend/public/assets/themes/future-spinner/ui/btn_autoplay.png
```

Kit packaging stays forbidden while any placeholder differs from HEAD. To take the seven
aspect-failing symbols and the background further, the owner rules on a pad-to-square or a
re-render at target aspect, and on the WORKSHOP or TESTCELL background (still pending from
R086). R088 pack (style register, secret-scanning gate, Gemini terms capture, arc-2 living
handover) ships on the owner's reissue.

Model and effort: one session, unattended, review lane. No gate failed, so no escalation was
triggered.
