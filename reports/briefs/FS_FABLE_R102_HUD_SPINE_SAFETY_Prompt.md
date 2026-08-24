# R102: LIVE HUD AUDIT + SPINE START + SAFETY CLEANUP

Sole live brief. Unattended. Review lane. High effort. Long-running autonomous session.

## THE FENCE

- No game rasters may be staged or committed.
- Do not modify the current 27 working-tree placeholders.
- No kit packaging.
- output/ remains read-only.
- Placeholders must survive byte-for-byte unchanged.
- Do not implement a full HUD redesign or a full Spine runtime in this session unless a
  minimal, safe, reversible foundation is clearly justified and isolated.

## PRECONDITIONS

- On main, up to date.
- Confirm the 27 placeholders are still present.
- Confirm robot Spine parts exist under:
  .scratch/art-review/chatgpt-robot-spine-parts/
- Confirm `npm run assets` is already guarded from R101.

## GOAL

Complete three workstreams in one session:

1. Full live HUD / banner reality audit and implementation path
2. Spine foundation using the existing robot part breakdown
3. Remaining safety / consistency cleanup that is clearly in scope

Work through all tasks below in order. Do not stop after the first section.

## WORKSTREAM A - LIVE HUD / BANNER AUDIT

### A1. Map the live HUD

Identify every visible control and information surface on the main play screen:

- Balance
- Win
- Bet
- Spin
- Turbo
- Bet + / Bet -
- Menu
- Autoplay
- Feature Buy / Overdrive entry
- Any side meters / banners / panels

For each, report:

- Render method (CSS, inline SVG, raster `<img>`, hybrid)
- Exact source file(s)
- Whether a newer raster already exists in the placeholder set or scratch folders
- Whether that raster is currently visible only in the Paytable Interface Guide

### A2. Separate "art exists" from "art is live"

Produce a clear table:

| Control | Live today | New art exists? | Where new art currently appears | Gap type |

Gap types:

- ART_MISSING
- ART_EXISTS_BUT_NOT_WIRED
- CSS_SVG_BY_DESIGN
- NEEDS_COMPONENT_CHANGE

### A3. Banner / HUD implementation options

Without implementing a full redesign, define the realistic options for making the live
bottom banner and main controls use the new art:

- Option 1: Keep CSS/SVG, treat new rasters as Paytable-only
- Option 2: Replace selected controls with raster buttons
- Option 3: Hybrid (frame/panel raster + CSS text/values)

For each option, state:

- Scope
- Risk
- What files would need to change
- Whether current placeholder dimensions are usable

### A4. Safe recommendation

Give a single recommended path for the next implementation brief.

Do not implement the full HUD change in this session unless you find a trivially safe,
isolated improvement that does not endanger layout, betting, or accessibility.

## WORKSTREAM B - SPINE START

### B1. Inventory the robot parts

Read: .scratch/art-review/chatgpt-robot-spine-parts/

List every part file, dimensions, and likely body role:

- Head / visor / antenna
- Torso
- Arms
- Legs
- Any extras

### B2. Assembly map

Propose a practical Spine hierarchy for this robot:

- Root
- Hip / pelvis
- Torso
- Head
- Arms
- Legs

Map each available PNG into that hierarchy.

Identify missing parts, if any, that would block a usable idle rig.

### B3. Integration foundation

Create a durable project record (not a half-broken runtime) describing:

- How these parts should be imported into Spine
- Naming convention
- Pivot / joint expectations
- What a first idle animation should include (bob, breathe, slight head tilt, eye/visor energy)

If there is an existing safe place in the repo for animation notes / character setup docs,
put it there. If not, create a clear document under docs/ or reports/ for Spine setup.

### B4. Minimal code-side foundation only if safe

Only if the codebase already has a natural insertion point:

- Add a non-breaking stub / config / manifest entry for a future Spine character
- Do not force a full runtime integration
- Do not break the current static robot display

If no safe insertion point exists, document the exact first implementation brief needed next.

## WORKSTREAM C - SAFETY + CONSISTENCY CLEANUP

### C1. Background script hazard

R101 left three background scripts unguarded on purpose. Re-evaluate them and either:

- Guard them the same way as `npm run assets`, or
- Document precisely why they should remain exempt

Do not leave this ambiguous.

### C2. Known consistency defects

Record current state and recommend exact next actions for:

- M3 identity conflict across design system / manifest / FX-01
- SC-03 composer crash on target_dimensions
- Any other high-confidence defects discovered while auditing HUD or Spine paths

Fix only what is clearly safe and in-scope. Escalate the rest with exact file references.

### C3. Final safety statement

Confirm:

- Placeholders unchanged
- `npm run assets` still guarded
- Whether background writers are now guarded
- Whether any command remains that can silently destroy current visual work

## DELIVERABLES

In the session report, provide:

- Full live HUD map and gap table
- Recommended HUD implementation path
- Spine part inventory + hierarchy map
- Spine foundation document / notes
- Safety cleanup results
- Ranked next briefs for future sessions

## CLOSE

- Records + any safe minimal code/doc changes only
- Zero placeholder rasters staged or committed
- Leave working tree placeholders unchanged
- PR on review lane
- Stop only when all three workstreams are complete
