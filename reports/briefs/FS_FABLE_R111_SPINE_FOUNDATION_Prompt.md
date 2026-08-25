# R111: SPINE FOUNDATION + FIRST ROBOT IDLE

Sole live brief. Unattended. Review lane. High effort. Player-visible animation work.

## THE FENCE

- No kit packaging.
- output/ read-only except where this brief explicitly requires animation/runtime foundation files.
- Do not weaken asset guards.
- Do not disturb the committed banner pair.
- Do not sweep unrelated placeholder rasters into commits.
- Prefer a reversible fallback to the current static hero if the rig is not yet stable.
- Keep the first animation modest and review-relevant: idle life, not celebration choreography.

## PRECONDITIONS

- On main, up to date.
- Confirm the R109 owner ruling is active: external development-stage art may enter the Future
  Spinner animation pipeline.
- Confirm external robot parts exist on disk from prior kits.
- Confirm current hero is rendered via `SceneGroup` / static image path.
- Confirm current CSS idle / hover behaviour on `.char-layer`.
- Confirm no full Spine runtime is required to already exist; establishing foundation is in scope.

## GOAL

Make the robot **non-static**.

Deliver the smallest credible Spine-based idle that improves perceived animation quality for
review:

- breathe / subtle body motion
- slight head motion
- stable grounded presentation
- no double-bob against existing CSS idle

This session is about foundation + first visible life, not a full performance set.

---

# WORKSTREAM 1 - PART PACKAGE AND HIERARCHY

### 1.1 Inventory usable parts

Locate the best available external robot part set and support layers.

Record:

- part list
- dimensions
- which parts form a coherent body set
- missing critical parts, if any

### 1.2 Define hierarchy

Establish a practical Spine hierarchy, for example:

- root
- pelvis / hips
- torso
- head
- upper arms / lower arms
- upper legs / lower legs

Map each available PNG into that hierarchy.

### 1.3 Pivots

Define initial pivot expectations for:

- head
- torso
- arms
- legs

If exact pivots cannot be finalised visually, choose conservative centres and document them.

---

# WORKSTREAM 2 - RUNTIME FOUNDATION

### 2.1 Choose the implementation route

Pick the smallest viable route for this codebase:

- official Spine runtime if already practical
- or the least-invasive animation foundation that can display a multi-part hierarchy now

Do not over-engineer.

### 2.2 Integration point

Integrate at the hero character location currently occupied by the static robot.

Requirements:

- keep layout stable
- preserve scene composition as much as possible
- allow fallback to static art if needed
- do not break car presentation

### 2.3 Conflict with existing CSS motion

`.char-layer` already has idle motion.

You must choose one explicit policy:

- disable CSS bob when Spine idle is active
- or coordinate so motion does not double

Do not ship both full motions stacked by accident.

---

# WORKSTREAM 3 - FIRST IDLE

### 3.1 Animation target

Create a short looping idle with:

- subtle torso breathe
- slight head tilt or drift
- minimal arm/shoulder life if hierarchy allows
- no large travel
- no win celebration

### 3.2 Timing

Keep it premium and restrained:

- slow enough to feel intentional
- visible enough that reviewers notice the character is alive
- stable under repeated looping

### 3.3 Reduced motion

Preserve an accessible reduced-motion path:

- either freeze to a clean pose
- or heavily damp the motion

---

# WORKSTREAM 4 - VISUAL QA

Verify:

- robot remains correctly placed relative to car and reels
- feet/grounding still make sense
- no obvious joint separation
- no violent clipping
- idle survives base game and feature screens if the hero remains visible
- no console errors
- performance remains acceptable on the local preview

If the first rig is structurally weak, keep fallback static art and report exact missing
part/pivot issues rather than forcing a broken character on screen.

---

# WORKSTREAM 5 - REVIEW-ORIENTED OUTCOME

Explicitly assess whether the result materially improves the "poor animations" review tag
relative to a static hero.

Report:

- what motion is now visible
- what is still missing for a stronger animation score
- whether symbol/feature animation still needs a parallel pass after this

---

# WORKSTREAM 6 - NEXT ANIMATION ROADMAP

End with a ranked animation roadmap:

1. stabilise / improve this idle if needed
2. simple win acknowledgement
3. feature-entry reaction
4. broader symbol/feedback animation pass
5. audio coupling later

## CLOSE

- Foundation + first idle only
- Reversible if unstable
- No unrelated asset sweeps
- Guards remain active
- PR on review lane
- Stop when the robot is either visibly non-static, or blocked with exact technical residuals
