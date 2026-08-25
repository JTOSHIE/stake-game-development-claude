# R110: PAINTED VISOR LAYER ON EXISTING HERO

Sole live brief. Unattended. Review lane. High care. Player-visible change.

## THE FENCE

- No kit packaging.
- output/ read-only except for the specific hero/visor assets required by this brief.
- Do not weaken asset guards.
- Do not disturb the committed banner pair.
- Do not begin full Spine runtime work in this session.
- Prefer a minimal, reversible implementation.
- Working-tree-only for new rasters unless a paired CI-safe commit is clearly justified.

## GOAL

Replace the current CSS-gradient visor glint with the painted visor layer, while preserving:

- current timing/keyframes as much as practical
- reduced-motion behaviour
- layout stability
- the existing static hero body

This is the first non-static hero upgrade under the updated art law.

## TASKS

### TASK 1 - Source validation

Verify dimensions, transparency, registration, and that it is visually stronger than the CSS
gradient.

### TASK 2 - Minimal implementation

Implement in SceneGroup.

### TASK 3 - Visual verification

If `mix-blend-mode` or layering causes obvious quality issues, adjust minimally or leave a
precise residual rather than forcing a bad look.

### TASK 4 - Scope control

If eye/chest emissive layers can be added just as safely and remain aligned, you may include
them. If not, stop after visor and document the exact next step.

Do **not** expand into contact-shadow policy or full rig work.

### TASK 5 - Report

Report which asset was used (or why none), files changed, working-tree vs commit-ready, residual
risks, and the recommended next session.
