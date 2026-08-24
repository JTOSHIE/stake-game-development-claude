---

**R096: SILHOUETTE-RESTORED HERO SWAP (WORKING TREE ONLY)**

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
  `.scratch/art-review/chatgpt-hero-silhouette-restored/`
- Confirm the previous placeholders are still present in the working tree.

### TASK – SWAP THESE ASSETS

From `chatgpt-hero-silhouette-restored/`:

| Asset | Expected Size | Target |
|-------|---------------|--------|
| Robot (restored proportions + bright grade) | 680 × 1344 | `scene_character.png` |
| Car (taller / fuller + bright grade) | 2840 × 1000 | `scene_car.png` |
| Title (extra-bright, if present) | 600 × 120 | `logo.png` |

These are proportion + brightness refinements of the current hero set.  
Run each through the normal ingest path. They should pass at 0.00% drift.

### ADDITIONAL CHECK (important)
After swapping, re-measure or visually confirm:
- Whether the robot silhouette is fuller than the previous version
- Whether the car has more visual height/weight
- Whether the existing overlays (`.antenna-light`, `.underglow`) sit better or still need CSS re-tuning

Report the findings clearly.

### REPORT
- List every successful swap
- List any failure with reason
- Confirm total modified rasters in the working tree
- Confirm zero rasters staged
- Confirm `hero_emblem_512.png` was **not** modified
- Report silhouette and overlay observations from the local preview

### CLOSE
- Leave the working tree swapped for the owner’s look-pass
- Do not stage or commit any rasters
- Record the session normally
- Include the full restore command for all currently modified rasters

When finished, stop and report.

---
