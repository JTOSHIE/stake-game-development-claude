---

**R135: LOOSE-END SWEEP — PARKED CODE DEFECTS**

Sole live brief. Unattended. Review lane. High care. Long session. Use subagents.

### THE FENCE
- Code and gates only.
- No new art generation.
- No audio generation.
- No hero flipbook / sway / glance revival.
- No feature-border revival.
- No kit packaging.
- Do not weaken asset guards.
- Do not sweep or commit the owner’s 30 WIP rasters.
- Do not redesign the banner.
- Do not change locked maths.

### PRECONDITIONS
1. On main, up to date. Confirm R134 / PR #174 state.
2. Save this brief verbatim first.
3. Fingerprint the 30 WIP rasters before any file operation. Re-verify at close.
4. Read CLAUDE.md, HUD_SPEC.md, RESKIN_BOUNDARY.md, AUDIO_TRUTH_MAP.md.
5. Build a local static-gates runner and run it before every push.

### GOAL
Close every parked **code** finding that does not need new audio or new committed art.

Owner intent: clean the board. Bad motion stays dead. Live text stays live.

---

# WORKSTREAM 0 — LEDGER

Build a table of every parked item from R129–R134 and mark each:

`FIX` · `GATE` · `PARK` · `OWNER`

Must include at least:

1. GameGrid upper-only progress clamps (reel geometry, same shape as the money bug)
2. `.booster-flicker` brighter under reduced motion than its own peak
3. 1x–10x grid flash playing under the free-spins overlay
4. Overdrive-tinted banner unreachable in real play
5. `shock_ring.png` drawn 2.03×–5.50× upscaled in WinBanner
6. Inert / dead CSS that still looks live
7. Count-up / money surfaces after R134
8. Reduced-motion holes in celebration / feature / booster
9. Interface-guide proof that asserts uniqueness but not likeness
10. Hero animation CI gap (measurement exists, no gate)
11. Docs that still describe deleted idle dissolve / perimeter / glance as current
12. `npm run assets` / other writers vs the 30 WIP rasters
13. Dist / prune comments that overclaim a guard
14. Audio hooks that are silent — inventory only, do not invent stems

Every `PARK` / `OWNER` line must say why it cannot move in this session.

---

# WORKSTREAM 1 — GRID CLAMPS

Same class as R134, different surface.

Find every `Math.min((now-start)/duration, 1)` / upper-only progress in GameGrid and siblings.

If negative progress can jump a reel, clamp `[0,1]` at the source.

Do not change spin feel beyond removing illegal rewind.

Seeded test: force a negative timestamp lead and prove the first frame does not jump backward.

---

# WORKSTREAM 2 — REDUCED MOTION TRUTH

`.booster-flicker` must not render brighter under reduced motion than its animated peak.

Audit:
- booster / turbo
- win banner subtree (R133 claimed covered)
- feature overlay
- hero accents
- jets
- max-win

Rule: reduced motion may freeze or dim. It may not intensify.

Prove with a same-page on/off capture, not a comment.

---

# WORKSTREAM 3 — FEATURE OVERLAY VS GRID FLASH

The 1x–10x grid flash must not play under an opaque free-spins overlay, or it must be suppressed while that overlay is up.

Measure first. Fix the actual path.

Feature-end HUD/banner lockstep from R132 must survive.

---

# WORKSTREAM 4 — SHOCK RING SCALE

`shock_ring.png` is 128² and drawn far larger.

Options, in order:
1. Draw it nearer native size if the effect still reads
2. Swap to an existing sharper ring already in the tree
3. Leave it and record why neither is acceptable

Do not commission new art. Do not upscale further.

---

# WORKSTREAM 5 — DEAD CODE THAT LOOKS ALIVE

Find celebration / feature CSS that compiles, is named like a live effect, and never paints.

Either make it paint on a true stage layer, or delete / isolate it.

No third state of “documented as live, inert in pixels”.

Include the unreachable overdrive-tinted banner: either wire it to a real state or mark it unreachable in the source comment and stop treating it as a feature.

---

# WORKSTREAM 6 — GATES FOR CLASSES THAT KEEP RECURRING

Add only gates that would have caught a real miss from R130–R134:

A. Money never negative — already exists; confirm it still runs in CI.  
B. Reduced-motion must not intensify named flicker / booster rules.  
C. Hero idle must remain planted: no `hero-sway-idle`, no idle dissolve, no glance transform.  
D. Feature perimeter raster must stay unreferenced.

Each new gate: seed RED, then PASS.  
Do not add a gate you cannot seed.

---

# WORKSTREAM 7 — DOC DRIFT

Dated records stay. Living instructions must not describe deleted machinery as current.

Fix only instruction-facing docs that would send the next session back to:
- idle dissolve
- feature perimeter
- glance as live
- dual-needle as intended
- Orbitron on `.c1-amount`

Do not rewrite SESSION_REPORT history.

---

# WORKSTREAM 8 — AUDIO INVENTORY ONLY

List every hook in `soundService` / theme sounds folder.

For each missing stem (`feature_enter`, `feature_end`, `win_max`, `retrigger`, and any other silent hook):
- function name
- when it fires
- expected path
- whether the file exists

Do not generate audio. Do not ship silence as a cue.

---

# WORKSTREAM 9 — QA

Prove:
- base win HUD = banner
- feature-end HUD = banner
- `?mockCategory=super_win_small` still 0ms lead
- first count-up frame `>= $0.00` at 15x / 830x / 5000x
- no feature perimeter
- idle planted
- reduced motion does not brighten booster
- Big / Mega / Epic banner still shows art through the band
- 1280 and one narrow width
- 60fps / zero console faults
- local static-gates green except the known dirty-tree stamp

---

# WORKSTREAM 10 — ADVERSARIAL PASS

Before close, attack your own diff for:
- inverted premises
- inert CSS
- gates that probe a reconstruction
- comments that trip text gates
- WIP raster staging
- overclaimed guards

Fix what you introduced.

---

### CLOSE
- Parked code defects closed or explicitly owner-parked
- 30 WIP rasters byte-identical
- 0 new audio / 0 new art
- PR on review lane
- Report the leftover OWNER list in one table: audio stems, gauge face, WIP particles, placeholder commit, SC-03

---

**R136: OWNER ART INTAKE — GAUGE + PARTICLES ONLY**

Use this after R135 is on main. Still no hero factory.

### THE FENCE
- Only the gauge pair and particle sprites the owner already generated.
- No 30-raster sweep.
- No logo / emblem replace.
- No audio.
- Aspect / ingest gates stay on.
- If a candidate is WIP and better than HEAD, swap only after measuring.

### TASKS
1. Confirm the committed gauge face still contains a baked needle.
2. If the scratch needle-free face + single needle exist and pass ingest, swap those two only.
3. Compare owner WIP particles vs committed particles at runtime size. Take only those that are sharper and not a WIP-clobber of a file the owner is still iterating.
4. Prove turbo / win / feature particles still render.
5. Leave every other placeholder uncommitted.

### CLOSE
Report accepted / refused with dimensions, needle count, and runtime size.

---

**After those two, the real leftovers are only:**
- four audio stems
- whether to commit the rest of the 30 placeholders
- SC-03

That is the clean-off path. Start with **R135**.
