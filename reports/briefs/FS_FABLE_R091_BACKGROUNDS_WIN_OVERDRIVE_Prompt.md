R091: BACKGROUNDS + WIN/OVERDRIVE SWAP (WORKING TREE ONLY)
Sole live brief. Unattended. Review lane.
THE FENCE

* No rasters may be staged or committed.
* Working-tree overwrites only.
* No kit packaging.
* output/ remains read-only.
* Leave all existing 20 placeholders in place.
* Owner’s dev server on 5173 stays untouched.

PRECONDITIONS

* On main, up to date.
* Confirm these source folders exist:
   * .scratch/art-review/chatgpt-fullres-backgrounds/
   * .scratch/art-review/chatgpt-win-overdrive-480-masters/
* Confirm the previous 20 placeholders are still present in the working tree.

TASK 1 — BACKGROUND
Swap the preferred full-resolution background into the working tree.

* Source: chatgpt-fullres-backgrounds/ (use the Workshop version as default unless a previous ruling says otherwise)
* Target: the live background path used by the game
* If the source resolution does not match the shipped target, report the exact dimensions and do not squash. Record as WRONG-SPEC if it fails the gate.

TASK 2 — WIN + OVERDRIVE GRAPHICS
Swap the new celebration and feature graphics:
From chatgpt-win-overdrive-480-masters/:

* Small / Medium Win Banner
* Big Win Banner
* Max Win / Ultimate Win Frame
* Overdrive Entry / Trigger Graphic

Map each to the correct shipped path. If a target path does not exist or the asset is not referenced by the running game, record as NO-ROW and skip.
TASK 3 — REPORT

* List every successful swap (source → destination)
* List every skipped / failed item with reason (WRONG-SPEC / NO-ROW)
* Confirm total number of modified rasters now in the working tree
* Confirm zero rasters are staged
* Note any layout, missing-asset, or console issues observed in a quick local preview

TASK 4 — CLOSE

* Leave the working tree in the swapped state for the owner’s look-pass
* Do not stage or commit any rasters
* Record the session normally
* Include the restore command for all currently modified rasters

NOTES FOR THIS SESSION

* Do not attempt the Tile Plate (still requires a 732×612 re-render).
* Do not invent an M1 — none exists yet.
* Backgrounds are 1920×1080; report exact target size if they fail.

When finished, stop and report.
