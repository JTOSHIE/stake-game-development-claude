**Ready-to-paste Claude Code brief**

---

**R095: BRIGHTENED HERO ASSETS SWAP (WORKING TREE ONLY)**

Sole live brief. Unattended. Review lane.

### THE FENCE
- No rasters may be staged or committed.
- Working-tree overwrites only.
- No kit packaging.
- output/ remains read-only.
- Leave all existing placeholders in place.
- Owner’s dev server on 5173 stays untouched.
- **Protected asset:** Do **not** touch `hero_emblem_512.png` (BR-01, SOLE KEEP).

### PRECONDITIONS
- On main, up to date.
- Confirm source folder exists:
  `.scratch/art-review/chatgpt-hero-brightened/`
- Confirm the previous placeholders are still present in the working tree.

### TASK – SWAP THESE THREE

From `chatgpt-hero-brightened/`:

| Asset | Expected Size | Target |
|-------|---------------|--------|
| Title Lockup (brightened) | 600 × 120 | `logo.png` |
| Robot (brightened) | 680 × 1344 | `scene_character.png` |
| Car (brightened) | 2840 × 1000 | `scene_car.png` |

These are brightness/contrast refinements of the assets already swapped in R094.  
Run each through the normal ingest path. They should pass at 0.00% drift.

### REPORT
- List every successful swap
- List any failure with reason
- Confirm new total number of modified rasters in the working tree
- Confirm zero rasters are staged
- Confirm `hero_emblem_512.png` was **not** modified
- Note any remaining overlay alignment or contrast issues observed in a quick local preview

### CLOSE
- Leave the working tree swapped for the owner’s look-pass
- Do not stage or commit any rasters
- Record the session normally
- Include the full restore command for all currently modified rasters

When finished, stop and report.

---

Paste this into Claude Code.
