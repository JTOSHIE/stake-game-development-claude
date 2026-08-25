# R112: CROSSED-ARMS HERO ANIMATION SYSTEM

Sole live brief. Unattended. Review lane. High effort. Player-visible animation rebuild.

## THE FENCE

- No kit packaging.
- output/ read-only except where this brief requires hero animation assets/runtime files.
- Do not weaken asset guards.
- Do not disturb the committed banner pair.
- Do not sweep unrelated placeholders into commits.
- Prefer reversible fallback to the current hero if the new system is unstable.
- Focus on the **one hero figure**. Do not expand into symbol animation in this session.

## PRECONDITIONS

- On main, up to date.
- Confirm the package exists:
  `.scratch/art-review/chatgpt-full-hero-animation-package/`
- Confirm current robot rig/idle implementation from R111 is present.
- Confirm owner preference:
  - crossed-arms stance is preferred
  - current neutral "slight shake" is not good enough
  - hero animation is the priority for review scoring

## GOAL

Replace the weak neutral idle with a **credible crossed-arms hero animation system**.

Target outcome:

- default on-screen hero uses the preferred crossed-arms attitude
- visible body/head/arm life beyond tiny shaking
- correct unique hands
- stable grounding
- review-relevant character animation

This is the hero animation pass. Make it count.

---

# WORKSTREAM 1 - PACKAGE AUDIT

Inventory the full package:

- modular parts
- signature crossed-arms assets
- full-body poses
- animation strips
- energy/shadow layers
- QA sheets / assembly guide

For each important asset record:

- path
- dimensions
- alpha
- role
- usable / weak / mismatched
- whether it can drive live animation now

Validate especially:

- left/right hand uniqueness
- crossed-arms master quality
- strip registration and frame consistency
- whether modular parts and strips belong to the same figure

---

# WORKSTREAM 2 - CHOOSE THE BEST IMPLEMENTATION ROUTE

Compare routes using the actual package:

**Route A - Pose/strip driven hero**

- use crossed-arms master + idle strips + reaction strips
- strongest if strips are coherent

**Route B - Layered crossed-arms hierarchy**

- locked crossed-arms torso unit
- animated head / pelvis / legs
- strongest if modular layers register cleanly

**Route C - Hybrid**

- crossed-arms default presentation
- strip playback for idle/reaction
- limited hierarchical motion where safe

Choose the route that produces the best **visible review result**, not the most theoretically pure
architecture.

State the choice and why.

---

# WORKSTREAM 3 - DEFAULT HERO REPLACEMENT

Replace the current neutral rig presentation with the preferred crossed-arms hero as the default
on-screen character.

Requirements:

- preserve scene layout as much as possible
- keep car relationship sensible
- keep fallback available if needed
- remove the weak shake-idle as the main impression

If both a strong still master and a strong idle strip exist, prefer a living crossed-arms idle
over a frozen pose.

---

# WORKSTREAM 4 - REAL MOVEMENT

Implement the strongest available motion set from the package:

Priority order:

1. crossed-arms idle life
2. head glance / attention
3. weight shift
4. arm transition if quality is high enough
5. restrained win acknowledgement if stable

Do not force bad transitions.
If an arm-uncross strip is weak, skip it rather than shipping broken movement.

Motion quality bar:

- readable from game distance
- premium, not twitchy
- loop-safe where needed
- no foot sliding unless intentional
- no obvious hand duplication artifacts

---

# WORKSTREAM 5 - HAND / JOINT / REGISTRATION QA

Verify under live preview:

- hands look like a true left/right pair
- crossed arms read clearly
- head joins torso cleanly
- no major separation at pelvis/shoulders
- no distracting clipping
- contact with the scene still feels grounded

If the best current package still has a serious hand or join defect, keep the best available
presentation and document the exact residual art fix required.

---

# WORKSTREAM 6 - REDUCED MOTION + PERFORMANCE

Preserve:

- reduced-motion fallback
- acceptable frame cost
- no console/asset faults
- stable behaviour across spin and feature screens if the hero remains visible

---

# WORKSTREAM 7 - REVIEW IMPACT ASSESSMENT

Explicitly answer:

- does this materially improve the "poor animations" issue versus the previous neutral shake rig?
- what motion is now visible to a reviewer within 5-10 seconds?
- what is still missing for a stronger animation score on the hero alone?

---

# WORKSTREAM 8 - REPORT + NEXT HERO STEPS

Report:

- chosen route
- files changed
- assets used
- what motion shipped
- what was refused and why
- exact next art/code step if anything is still weak

## CLOSE

- Hero animation system only
- Reversible if unstable
- No unrelated asset sweeps
- Guards remain active
- PR on review lane
- Stop when the crossed-arms hero is clearly better than the neutral shake rig, or blocked with
  exact evidence
