**Ready-to-paste Claude Code brief**

---

**R097: FULL ARC-2 PLACEHOLDER AUDIT**

Sole live brief. Unattended. Review lane. High effort.

### THE FENCE
- No rasters may be staged or committed.
- No kit packaging.
- output/ remains read-only.
- Do not modify any placeholder files.
- Do not touch `hero_emblem_512.png`.
- Owner’s dev server on 5173 stays untouched. Use your own preview port if needed.
- This is a **read-only audit + reporting** session. No swaps, no code changes, no generation.

### PRECONDITIONS
- On main, up to date.
- Working tree may contain the current set of uncommitted placeholder rasters — leave them exactly as they are.
- Confirm arc2-baseline still resolves.

### GOAL
Produce a single, definitive status report of the entire arc-2 placeholder effort so the owner has a clear, complete picture of where things stand.

### TASK 1 — WORKING TREE INVENTORY
List every currently modified raster in the working tree.
For each file report:
- Path
- Current on-disk dimensions
- Whether it differs from HEAD
- Which R0xx session most likely introduced it (best effort from records)

Group them by category:
- Symbols
- Tile / plate
- Backgrounds
- Gauge
- UI controls
- Title / logo
- Hero character (robot + car)

### TASK 2 — MANIFEST COVERAGE
Against `docs/art/art_manifest_arc2.csv` (REPLACE rows only):

- Which REPLACE rows now have a placeholder in the working tree?
- Which REPLACE rows are still missing a candidate?
- Which working-tree rasters have no matching REPLACE row (if any)?

Be explicit. Use a clear table.

### TASK 3 — QUALITY & TECHNICAL FINDINGS LOG
Compile every material technical finding from R086–R096 that is still relevant, including:

- Aspect / dimension gate results
- Contrast measurements (title)
- Silhouette / bounding-box changes
- Overlay alignment status (`.antenna-light`, `.underglow`, etc.)
- Any remaining known defects or style positions (e.g. title still darker than original)
- Tooling bugs that were surfaced (ALPHA_SNAP_FLOOR, ingest jpeg quality, lack of `--compare-against-shipped`, etc.)

Mark each item as:
- **Closed**
- **Open – art decision**
- **Open – code decision**
- **Open – tooling**
- **Open – provider / licence**

### TASK 4 — HOMELESS & ARCHITECTURAL GAPS
Document assets that were generated but cannot currently be used:

- Win / Overdrive celebration art (~9.65 MB)
- Any title states or character poses that have no wiring
- Live HUD controls that remain CSS/SVG while new raster art only appears in the Paytable Interface Guide

For each, state what would be required to make it usable (component change, new wiring, geometry change, etc.).

### TASK 5 — VISUAL SPOT CHECK
Launch a local preview (your own port). Capture and briefly describe:

- Base game at rest
- One spin / win state if easy
- Presence and readability of: symbols, tile, background, title, robot, car, gauge

Note any obvious remaining visual issues (without fixing them).

### TASK 6 — FINAL STATUS SUMMARY
End the report with a clear executive summary containing:

1. Total placeholders currently in the working tree
2. Overall art completeness (% of REPLACE rows covered)
3. List of remaining open decisions the owner must make
4. Recommended next actions, ranked
5. Exact restore command for the full current set of modified rasters

### CLOSE
- Commit **records only** (the audit report + any supporting notes)
- Zero rasters staged or committed
- PR on review lane
- Leave the working tree exactly as you found it

When finished, stop and present the full audit.

---

Paste this into Claude Code. This will give you a complete, single-source picture of the entire arc-2 art state.
