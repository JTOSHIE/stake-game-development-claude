**Ready-to-paste Claude Code brief**

---

**R092: FINAL MISSING ASSETS SWAP (WORKING TREE ONLY)**

Sole live brief. Unattended. Review lane.

### THE FENCE
- No rasters may be staged or committed.
- Working-tree overwrites only.
- No kit packaging.
- output/ remains read-only.
- Leave all existing 22 placeholders in place.
- Owner’s dev server on 5173 stays untouched.

### PRECONDITIONS
- On main, up to date.
- Confirm source folder exists:
  `.scratch/art-review/chatgpt-final-missing-480-masters/`
- Confirm the previous 22 placeholders are still present in the working tree.

### TASK – SWAP THESE TWO

**1. Tile Plate**
- Source: the 732×612 Tile Plate from the folder above
- Target: the live tile plate path
- This size was specifically chosen to match the game’s requirement (bezel edge-to-edge). Run through normal ingest. If it fails for any reason, report exact measurements and do not force it.

**2. M1**
- Source: the 480×480 M1 Front Intake
- Target: the live M1 symbol path
- Standard 480→240 ingest path.

### REPORT
- List both results (success or failure with reason)
- Confirm new total number of modified rasters in the working tree
- Confirm zero rasters are staged
- Note any visual or console issues in a quick local preview

### CLOSE
- Leave the working tree swapped for the owner’s look-pass
- Do not stage or commit any rasters
- Record the session normally
- Include the full restore command for all currently modified rasters

When finished, stop and report.

---

Paste this into Claude Code.
