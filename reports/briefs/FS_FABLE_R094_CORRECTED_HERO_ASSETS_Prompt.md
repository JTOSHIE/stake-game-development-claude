**Ready-to-paste Claude Code brief**

---

**R094: CORRECTED HERO ASSETS SWAP (WORKING TREE ONLY)**

Sole live brief. Unattended. Review lane.

### THE FENCE
- No rasters may be staged or committed.
- Working-tree overwrites only.
- No kit packaging.
- output/ remains read-only.
- Leave all existing 24 placeholders in place.
- Owner’s dev server on 5173 stays untouched.
- **Protected asset:** Do **not** touch `hero_emblem_512.png` (BR-01, SOLE KEEP).

### PRECONDITIONS
- On main, up to date.
- Confirm source folder exists:
  `.scratch/art-review/chatgpt-hero-corrected-sizes/`
- Confirm the previous 24 placeholders are still present in the working tree.

### TASK – SWAP THESE THREE

From `chatgpt-hero-corrected-sizes/`:

| Asset | Expected Size | Target |
|-------|---------------|--------|
| Title Lockup | 600 × 120 | `logo.png` (or the live title raster path) |
| Robot | 680 × 1344 | `scene_character.png` |
| Car | 2840 × 1000 | `scene_car.png` |

Run each through the normal ingest path.  
These sizes were taken directly from the shipped targets, so they should pass at 0.00% drift.  
If any fail, report exact measurements and do not force.

### REPORT
- List every successful swap (source → destination)
- List any failure with reason
- Confirm new total number of modified rasters in the working tree
- Confirm zero rasters are staged
- Confirm `hero_emblem_512.png` was **not** modified
- Note any layout or console issues in a quick local preview

### CLOSE
- Leave the working tree swapped for the owner’s look-pass
- Do not stage or commit any rasters
- Record the session normally
- Include the full restore command for all currently modified rasters

When finished, stop and report.

---

Paste this into Claude Code.
