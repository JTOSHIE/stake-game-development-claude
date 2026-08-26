# FS FABLE R120 — Prompt, verbatim

Recorded verbatim per convention (f). Pasted by the owner on 2026-08-26.

---

**R120: NEIGHBOUR CONSISTENCY PASS**

Sole live brief. Unattended. Review lane. Focused UI consistency work.

### THE FENCE
- No kit packaging.
- No bulk art intake.
- Do not weaken asset guards.
- Do not bake live values or labels into images.
- Do not replace live controls with dead raster buttons.
- Preserve locked HUD geometry and control behaviour.
- Prefer token/CSS restyles over structural rewrites.
- Do not sweep placeholders.
- If guide-icon regeneration is blocked by dirty-tree guards, document the exact residual and do not bypass the guard.

### PRECONDITIONS
- On main, up to date.
- Confirm R119 operator-standard HUD shell is live.
- Confirm current mismatched neighbours still exist:
  - FEATURES button
  - instrument / gauge column
  - paytable modal chrome
  - interface guide icons showing old chrome
- Confirm any relevant design tokens / HUD shell tokens from R119.

### GOAL
Make the remaining UI neighbours match the new quiet operator-standard HUD.

Target outcome:
- FEATURES no longer looks like leftover themed chrome
- instrument column no longer out-shouts the HUD
- paytable modal feels part of the same shell family
- interface guide residual is either fixed or precisely blocked
- overall UI reads as one system, not half-migrated

---

# WORKSTREAM 1 — TRUTH MAP

### 1.1 Locate each neighbour
Map exact sources for:
- FEATURES button
- instrument / gauge column and related feature-side chrome
- paytable modal frame, rows, close control, section chrome
- interface guide icons used by PaytableModal / UI guide

### 1.2 Define the consistency target
Match the R119 shell discipline:
- dark glass / neutral surfaces
- quiet hairlines
- near-white text where appropriate
- one accent used sparingly
- no multi-colour rail chaos
- no brushed-metal overload

---

# WORKSTREAM 2 — FEATURES BUTTON

Restyle FEATURES to sit in the same visual family as the new HUD utility controls.

Requirements:
- quieter at rest
- accent only when useful/active
- no leftover loud magenta badge look unless active state truly needs it
- preserve hit target and behaviour

---

# WORKSTREAM 3 — INSTRUMENT / GAUGE COLUMN

Restyle the feature instrument column so it no longer looks like old custom chrome beside the new shell.

Requirements:
- reduce visual dominance
- keep readability of gauge/state information
- preserve any real functional behaviour
- make it feel related to the operator shell and current feature presentation

If full restyle is risky, implement the strongest safe quieting pass and document residuals.

---

# WORKSTREAM 4 — PAYTABLE MODAL CHROME

Restyle the paytable/interface modal to match the shell:
- panel background
- row cards
- title treatment
- close button
- dividers / accent line

Do not rewrite the content model.
Do not bake new words into art.

---

# WORKSTREAM 5 — INTERFACE GUIDE ICONS

### 5.1 Assess staleness
Confirm which guide icons still show pre-R119 chrome.

### 5.2 Regeneration path
If the tree can cleanly support:
```bash
node frontend/scripts/regen_interface_guide_icons.mjs
```
and the guard allows it without weakening policy, regenerate.

If blocked by dirty placeholders under the guard root:
- do not bypass
- record exact blocker
- list the exact command/order needed after a clean tree

---

# WORKSTREAM 6 — QA

Verify:
- base game
- feature-active state
- paytable open
- win-banner state if practical
- desktop / one narrower width if practical
- no control behaviour regressions
- no console/asset faults
- accent discipline still holds

---

# WORKSTREAM 7 — REPORT

State:
- what changed in FEATURES
- what changed in instrument column
- what changed in paytable chrome
- whether guide icons were regenerated or blocked
- remaining UI inconsistencies after this pass

### CLOSE
- Neighbour consistency only
- No HUD geometry redesign
- No placeholder sweeps
- Guards remain active
- PR on review lane
- Stop when the UI neighbours no longer visibly contradict the R119 shell, or when blocked with exact residuals
