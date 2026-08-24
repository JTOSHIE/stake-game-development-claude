# R103: FULL OUTSTANDING WORK SESSION - HUD TRUTH, FX INTAKE, SPINE PATH, PAYTABLE, TEXT, CLEANUP

Sole live brief. Unattended. Review lane. Maximum useful effort. Long-running autonomous session.

## THE FENCE

* No placeholder rasters may be staged or committed unless a specific task below explicitly
  authorises a working-tree-only change and still forbids git add of rasters.
* No kit packaging.
* output/ read-only.
* Do not weaken asset guards.
* Prefer durable records + safe code/doc fixes over partial feature demos.
* If a task is blocked, record the exact blocker and continue to the next task. Do not stop early.

## PRECONDITIONS

* On main, up to date.
* Confirm current placeholder set still present.
* Confirm these scratch folders exist if present on disk:
  * .scratch/art-review/chatgpt-fx-set/
  * .scratch/art-review/chatgpt-robot-spine-parts/
  * any hero / UI / symbol placeholder folders still in use
* Confirm docs/design/SPINE_ROBOT_RIG_SETUP.md exists from R102.
* Confirm asset guards from R101/R102 are live.

## GOAL

This is a full outstanding-work session. Work through every workstream below in order. Do not
end the session until all workstreams are either completed, safely partially completed with
exact remaining blockers, or proven out of scope with evidence.

## WORKSTREAM 1 - SOURCE OF TRUTH RECONCILIATION

### 1.1 Build the master outstanding ledger

Create one authoritative ledger covering every still-open item from R086-R102, including:

* art gaps
* wiring gaps
* documentation drift
* tooling defects
* provider/legal residual items
* animation / Spine items
* paytable / text / locale items
* safety residual items

Each row must have:

* ID
* status
* evidence
* owner decision needed? (yes/no)
* recommended next action
* blocked by

### 1.2 Correct false assumptions

Explicitly restate and permanently record:

* Live HUD controls are CSS/SVG
* Button PNGs are Interface Guide captures, not live HUD art
* Six placeholders are documentation icons
* The only safe live-HUD art target currently identified is the decorative banner panel

If any prior session wording conflicts with this, correct the project records.

## WORKSTREAM 2 - DOCUMENTATION ICON CLEANUP PATH

### 2.1 Identify the six documentation-icon placeholders

Name them exactly. Prove they are Interface Guide targets, not live HUD controls.

### 2.2 Impact analysis

Determine:

* what currently displays them
* whether the Paytable Interface Guide is now misleading
* whether interface_guide_icon_proof or any related proof path is affected
* whether reverting them is safe

### 2.3 Safe action

If safe and reversible:

* restore those six paths in the working tree only to HEAD versions
* do not stage/commit rasters
* record exact before/after hashes

If not safe, stop and document the exact reason and the smallest safe follow-up brief.

## WORKSTREAM 3 - FX SET INTAKE

### 3.1 Inventory ChatGPT FX set

Read .scratch/art-review/chatgpt-fx-set/ thoroughly. For every file record:

* filename
* dimensions
* alpha yes/no
* likely purpose
* whether a manifest REPLACE row exists
* whether a shipped path exists
* intake status: READY / WRONG-SPEC / NO-ROW / AMBIGUOUS

### 3.2 Map to game systems

Trace where FX can actually plug in:

* symbol effects
* win flashes
* scatter feedback
* feature transition
* ambient particles
* frame/bezel accents

Do not invent runtime systems that do not exist. If art is good but homeless, mark it HOMELESS
and specify the component work required.

### 3.3 Working-tree intake only where valid

For any FX asset that:

* has a real target path
* passes dimension/aspect expectations
* is actually referenced or safely referenceable without redesign

...perform working-tree-only intake through the normal safe path.

Skip everything else with reasons.

### 3.4 FX architecture note

Write a durable note describing:

* which FX are now in-tree
* which remain homeless
* what the next implementation brief should be for actually showing them in play

## WORKSTREAM 4 - LIVE BANNER / HUD IMPLEMENTATION PATH

### 4.1 Banner specification

From docs/HUD_SPEC.md and live DOM/CSS:

* confirm the decorative bottom banner target geometry
* confirm expected size, role, z-index, and interaction constraints
* produce an exact commissioning spec for the missing panel raster

Expected direction from R102: 718x88 decorative panel. Verify rather than assume. If different,
measure and correct.

### 4.2 Implementation blueprint

Produce a complete blueprint for the safest path to improve the live bottom bar without breaking:

* control hit targets
* 44px touch floor
* aria labels
* locale text
* CI HUD checks

The blueprint must distinguish:

* what can be art-only
* what requires component work
* what must remain CSS/SVG

### 4.3 No reckless implementation

Do not replace live controls with rasters in this session. If and only if a trivially safe
decorative banner swap becomes possible and a valid asset exists, you may do working-tree-only
placement. Otherwise stop at the blueprint + commissioning spec.

## WORKSTREAM 5 - PAYTABLE / TEXT / LOCALE AUDIT

### 5.1 Paytable art and copy surfaces

Audit the paytable thoroughly:

* symbol payout panel
* feature rules copy
* interface guide icons
* any raster thumbnails
* any baked text risks

Report:

* outdated art
* mismatched icons vs live controls
* text hardcoding
* locale-unsafe surfaces

### 5.2 Text systems

Identify:

* where copy is localised correctly
* where baked art text would break locales
* any visible English-only hardcoding in paytable / feature / win surfaces

### 5.3 Recommended corrections

Produce a ranked list of paytable/text corrections. Implement only safe documentation or
clearly isolated non-raster fixes. Escalate anything that needs owner wording decisions.

## WORKSTREAM 6 - SPINE PATH TO FIRST MOTION

### 6.1 Validate the current Spine setup doc

Review docs/design/SPINE_ROBOT_RIG_SETUP.md against the actual part files.

Confirm or correct:

* part inventory
* hierarchy
* pivots
* missing parts
* visor limitation

### 6.2 Make the parts usable to the project

The parts are currently in a gitignored scratch path. Create a safe adoption plan:

* where they should live
* how provenance should be recorded
* what may and may not be cited under project conventions
* the minimum import package for a first idle

If a safe non-raster documentation/manifest structure can be created, create it. Do not commit
binary part rasters unless project rules clearly allow a controlled non-shipping reference path
and the fence still holds.

### 6.3 First motion plan

Define the smallest useful Spine outcome:

* idle breathe
* head tilt
* optional visor energy once art supports it
* no celebration choreography yet

Deliver a sequenced implementation plan another session can execute without rediscovery.

## WORKSTREAM 7 - TOOLING AND CONSISTENCY DEFECTS

Address or fully specify fixes for:

1. M3 identity conflict
   * design system
   * manifest role
   * FX-01 semantics
   Choose the recorded owner-ratified truth and align docs if safe. If code prompts would change
   behaviour, escalate rather than silently rewrite game content.
2. SC-03 composer crash
   * measure the exact target_dimensions parse failure
   * fix only if the correct target is unambiguous
   * otherwise propose the exact owner question needed
3. Any remaining generator/composer inconsistencies found during this session
4. CI/docs drift directly related to the above

## WORKSTREAM 8 - FINAL PROGRAMME STATE

### 8.1 Recompute completeness

Recalculate:

* REPLACE coverage
* placeholder count
* homeless art volume
* live vs guide vs dead surfaces

### 8.2 Ranked roadmap

End with a roadmap in this exact order:

1. immediate safe cleanups
2. art commissioning still required
3. component work required
4. animation work required
5. provider/tooling residuals

### 8.3 Restore / safety confirmation

Confirm:

* whether placeholders changed
* whether any documentation icons were restored
* whether any FX were intaken
* that no kit packaging occurred
* that guards remain active

## CLOSE

* Records + safe code/doc fixes only, unless a working-tree-only art restoration/intake is
  explicitly justified above
* No raster commits
* PR on review lane
* Continue until all workstreams are handled
