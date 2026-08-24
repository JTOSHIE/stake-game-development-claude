R089: PREFERRED-MASTER SWAP (WORKING TREE ONLY)
Sole live brief. Unattended. Review lane. Save and commit this brief verbatim per convention (c).
THE FENCE (ABSOLUTE)

* No raster from any ChatGPT / output / .scratch folder may be staged or committed.
* Only working-tree overwrites of existing shipped paths are allowed.
* Kit packaging is forbidden.
* Leave the eight already-swapped placeholders in place; add the new ones from the shortlist below.
* output/ remains read-only.
* No generation, no API calls.
* Owner’s dev server on 5173 stays untouched — use your own preview port if needed.

PRECONDITIONS

1. On main, clean tracked tree (or report dirty state). Confirm arc2-baseline still resolves.
2. Confirm the preferred source files exist at the paths listed below.
3. Expect the previous eight placeholders to still be present in the working tree.

TASK 1 — SNAPSHOT
Copy the current preferred masters into a dated snapshot folder for safety: .scratch/preferred-swap-2026-08-24/src/
TASK 2 — PERFORM THE SWAPS (WORKING TREE ONLY)
For each row below, take the preferred source file, run it through the existing ingest path (or equivalent 480→240 premultiplied downscale + alpha handling), and overwrite the corresponding shipped path in the working tree only.
Symbols

* Wild ← future-spinner-480-masters/01-wild.png
* Scatter ← future-spinner-480-masters/02-scatter-energy-core.png
* H1 Complete ← future-spinner-480-masters/03-h1-spinning-rim-complete.png
* H1 Base ← future-spinner-480-masters/04-h1-spinning-rim-base.png
* H1 Spin ← future-spinner-480-masters/05-h1-spinning-rim-spin.png
* H2 Turbo ← future-spinner-480-masters/06-h2-turbocharger.png
* M2 ← future-spinner-symbols/M2-premium-coilover-strut.png
* M3 ← future-spinner-symbols/M3-holographic-dash-readout.png
* L1 ← future-spinner-symbols/L1-jewel-cut-lug-nut.png
* L2 ← future-spinner-symbols/L2-iridium-spark-plug.png
* L3 ← future-spinner-symbols/L3-forged-piston.png
* Tile Plate ← future-spinner-ui-support-480-masters/06-tile-plate-refinement-v2.png

Background

* Main background ← future-spinner-480-masters/08-cyberpunk-garage-background.png (WORKSHOP default)

UI

* Gauge Face ← future-spinner-ui-support-480-masters/01-ui-gauge-face.png
* Needle ← future-spinner-ui-support-480-masters/02-ui-single-needle.png
* Spin Button ← future-spinner-ui-support-480-masters/03-ui-spin-button.png
* Turbo ← future-spinner-consistency-ui-480-masters/01-ui-turbo-quick-spin.png
* Bet + ← future-spinner-consistency-ui-480-masters/02-ui-bet-increase-plus.png
* Bet – ← future-spinner-consistency-ui-480-masters/03-ui-bet-decrease-minus.png
* Feature Buy ← future-spinner-consistency-ui-480-masters/07-ui-feature-buy-overdrive.png
* Main HUD Banner ← future-spinner-consistency-ui-480-masters/04-ui-main-hud-banner.png
* Paytable Button ← future-spinner-consistency-ui-480-masters/05-ui-paytable-button.png
* Settings Button ← future-spinner-consistency-ui-480-masters/06-ui-settings-menu-button.png
* Autoplay ← future-spinner-extra-ui-480-masters/01-ui-autoplay-button.png
* Sound On ← future-spinner-extra-ui-480-masters/03-ui-sound-on.png
* Sound Off ← future-spinner-extra-ui-480-masters/04-ui-sound-off.png

(Adjust exact shipped paths to match the real locations in the frontend asset tree. If a target path does not exist or the source fails ingest gates, record it as WRONG-SPEC / NO-ROW and skip.)
TASK 3 — REPORT

* List every successful swap (source → destination)
* List every skipped / failed item with reason
* Confirm zero rasters are staged
* Confirm the working tree now contains the expanded set of placeholders
* Note any layout or missing-asset issues observed in a quick local preview

TASK 4 — CLOSE

* Leave the working tree in the swapped state so the owner can continue looking locally
* Do not stage or commit any rasters
* Record the session in the normal way (comms + SESSION_REPORT)
* Restore instruction remains: git checkout -- <paths> returns to HEAD

When finished, stop and report. Owner will perform the next look-pass.
