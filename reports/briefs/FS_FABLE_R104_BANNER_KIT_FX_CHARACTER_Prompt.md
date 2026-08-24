# R104: BANNER SELECTION + COMPLETION-KIT INTAKE + USABLE FX PATH + IN-HOUSE CHARACTER ROUTE

Sole live brief. Unattended. Review lane. Maximum useful effort. Long-running autonomous session.

## THE FENCE

* No kit packaging.
* output/ read-only.
* Do not weaken asset guards.
* Do not stage or commit game rasters unless a task below explicitly authorises working-tree-only
  placement and still forbids git add of rasters.
* Preserve all current safety guarantees.
* If blocked, record the exact blocker with evidence and continue. Do not stop early.

## PRECONDITIONS

* On main, up to date.
* Confirm current working-tree placeholder state.
* Confirm these exist:
  * .scratch/art-review/chatgpt-outstanding-completion-kit/
  * .scratch/art-review/chatgpt-fx-set/
  * reports/OUTSTANDING_LEDGER_2026-08-25.md
  * docs/design/SPINE_ROBOT_RIG_SETUP.md
  * frontend/scripts/scene/scene_character.svg
* Confirm guards are still active.

## GOAL

This session must convert the newest art flood into usable project progress and close as many
remaining structural gaps as possible.

Work through every workstream below in order.

## WORKSTREAM 1 - COMPLETION KIT FULL AUDIT

### 1.1 Inventory everything

Read the entire ChatGPT completion kit. For every file record:

* path
* dimensions
* alpha yes/no
* group from QA inventory
* probable purpose
* whether a shipped path exists
* whether a manifest row exists
* intake status: READY / WRONG-SPEC / NO-ROW / HOMELESS / DUPLICATE / REVIEW-ONLY

### 1.2 Group-level conclusions

Produce separate conclusions for: Banner candidates, Paytable support, FX expansion, Spine
support, Scene polish.

### 1.3 Update the outstanding ledger

Update reports/OUTSTANDING_LEDGER_2026-08-25.md or create a dated successor so the ledger
reflects the new kit and no longer depends on stale assumptions.

## WORKSTREAM 2 - BANNER SELECTION AND SAFE PLACEMENT

### 2.1 Verify the live banner contract again

Reconfirm from live code + HUD spec: exact geometry, z-index, pointer-events, relationship to
controls, Overdrive accent behaviour (--acc flip).

### 2.2 Evaluate all 718x88 candidates

For each banner candidate: measure actual pixels; inspect whether it is accent-neutral enough;
inspect whether centre regions remain calm enough for Balance / Win / Bet readability; inspect
edge behaviour under the CSS accent treatment; score them against the commissioning constraints
from R103.

### 2.3 Select and place

Choose the strongest candidate. If and only if it is valid: run it through the normal safe intake
path; place it working-tree-only onto the real decorative banner target if one exists; if no
raster target exists yet, create the minimum safe wiring needed only if that wiring is isolated,
reversible, and does not endanger controls, CI HUD checks, hit targets, or locale behaviour.

If wiring is non-trivial, stop at: selected asset, exact target recommendation, exact component
brief for the next session.

### 2.4 Overdrive correctness

Prove, or precisely explain, how the selected banner remains correct when --acc flips cyan to pink.

## WORKSTREAM 3 - MAKE FX ACTUALLY USABLE

### 3.1 Separate the FX universe into three buckets

Using both FX folders and runtime tracing, classify every FX asset into:

1. Can ship into an existing slot now
2. Good art, but needs correct frame count / size
3. Homeless without component work

### 3.2 Existing runtime mapping

Trace the real systems for: flame / jet, particles, win flashes, scatter feedback, cell overlays,
feature transition accents. Record actual expected sizes, frame counts, naming, and call sites.

### 3.3 Intake only what is truly ready

Working-tree-only intake for assets that are correctly sized, correctly framed, and actually
consumable by current code. No forcing.

### 3.4 Write precise re-generation specs

For every promising but unusable FX asset, write an exact machine-ready regeneration
specification: exact canvas size, exact frame count, exact strip layout or numbered frames, alpha
rules, no-text rules, intended consumer. These specs must be good enough to hand straight to
ChatGPT without rediscovery.

### 3.5 Particle gap closure plan

R097 / R103 both found the particle coverage gap remains open because generated FX were too large.
Produce a concrete particle commissioning set for the real runtime sizes in use.

## WORKSTREAM 4 - IN-HOUSE CHARACTER ROUTE

### 4.1 Hard-law position

Restate clearly, with citations: why external robot parts cannot enter the animation pipeline
under current system law; why the current static hero art remains permitted only while it
animates nothing.

### 4.2 Inspect the dormant in-house master

Audit frontend/scripts/scene/scene_character.svg: structure, named groups or lack thereof,
dimensions, whether build.py layered export can use it as-is, divergence from the currently
shipped enhanced raster.

### 4.3 Define the only unblocked Spine path

Produce a practical route that does not violate system law: re-group / re-author the in-house SVG
master into named body parts; export layers through the existing in-house pipeline; only then
consider Spine.

If safe preparatory work can be done without breaking the live static hero, do it. If not, write
the exact next implementation brief and stop.

### 4.4 Correct the Spine docs

Update the Spine setup docs so they no longer recommend an illegal external-parts adoption path as
if it were open.

## WORKSTREAM 5 - PAYTABLE AND GUIDE HONESTY

### 5.1 Current honesty state

After the R103 icon restoration, verify the Paytable Interface Guide now matches live controls.

### 5.2 Paytable support art from the new kit

Determine whether any new paytable support panels/frames can be used immediately. Intake only if
real targets exist and behaviour remains locale-safe.

### 5.3 Text and locale hazards

Audit visible paytable / feature / win surfaces for: baked English, non-localised strings, art
that would break translation if used as-is. Implement only safe isolated fixes. Escalate
wording/content decisions.

## WORKSTREAM 6 - PROGRAMME COMPLETION MATH

### 6.1 Recompute coverage

Recalculate: REPLACE coverage, working-tree modified rasters, homeless art volume by category,
blocked-by-law items, blocked-by-missing-component items, blocked-by-wrong-spec items.

### 6.2 Close or restate every major open decision

Update the ranked decision list: banner placement outcome; Spine law / in-house route; FX
regeneration set; particle set; remaining provider/tooling residuals.

### 6.3 Roadmap another session can execute blindly

End with a roadmap so the next session does not need to rediscover anything: exact files to
generate, exact files to wire, exact files to leave alone, exact owner decisions still required.

## CLOSE

* Records + safe code/doc fixes + authorised working-tree-only intakes only
* No raster commits
* Guards remain active
* PR on review lane
* Continue until all workstreams are complete
