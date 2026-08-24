**Ready-to-paste Claude Code brief**

---

**R093: HERO TITLE + CHARACTER SWAP (WORKING TREE ONLY)**

Sole live brief. Unattended. Review lane.

### THE FENCE
- No rasters may be staged or committed.
- Working-tree overwrites only.
- No kit packaging.
- output/ remains read-only.
- Leave all existing 24 placeholders in place.
- Owner’s dev server on 5173 stays untouched.

### PRECONDITIONS
- On main, up to date.
- Confirm source folder exists:
  `.scratch/art-review/chatgpt-hero-character-masters/`
- Confirm the previous 24 placeholders are still present in the working tree.

### TASK – SWAP THE NEW HERO ASSETS

From `chatgpt-hero-character-masters/`:

**Title**
- Main Title lockup
- Title – Idle / Soft Glow state
- Title – Energy Surge state

**Character (separated layers)**
- Robot main (800×1000)
- Robot active pose (800×1000)
- Car only (1400×600)

Map each file to the correct shipped path in the frontend asset tree.  
If a target path does not exist or the asset is not currently referenced by the running game, record it as NO-ROW and skip. Do not invent new component wiring in this brief.

### REPORT
- List every successful swap (source → destination)
- List every skipped / failed item with reason (NO-ROW / WRONG-SPEC)
- Confirm new total number of modified rasters in the working tree
- Confirm zero rasters are staged
- Note any layout, missing-asset, or console issues observed in a quick local preview

### CLOSE
- Leave the working tree in the swapped state for the owner’s look-pass
- Do not stage or commit any rasters
- Record the session normally
- Include the full restore command for all currently modified rasters

When finished, stop and report.

---

Paste this into Claude Code.
