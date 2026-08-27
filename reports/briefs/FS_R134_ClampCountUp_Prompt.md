**Ready-to-paste Claude Code brief**

---

**R134: CLAMP COUNT-UP — MONEY NEVER GOES NEGATIVE**

Sole live brief. Unattended. Review lane. High care.

### THE FENCE
- Count-up / money surfaces only.
- No banner redesign.
- No hero animation.
- No feature-border revival.
- No audio.
- No kit packaging.
- Do not weaken asset guards.
- Do not sweep the owner’s 30 WIP rasters.

### PRECONDITIONS
- On main, up to date.
- Confirm R133 is merged or present.
- Fingerprint the 30 WIP rasters first.

### GOAL
A player must never see a negative win amount.

R133 measured the defect:
- `Math.min((now - startTime) / duration, 1)` clamps only the upper bound
- negative progress passes through
- `easeOutCubic` amplifies it
- scale grows with the win  
  `- $0.10` at 15x · `- $22.17` at 830x · about `- $130` at wincap

Fix the cause, not one label.

---

# WORKSTREAM 1 — FIND EVERY COUNT-UP

Inventory every tween / ease that writes:
- HUD WIN
- win banner amount
- feature-end banner
- max-win amount if shared
- any other money plate

Name the shared helper if there is one.

---

# WORKSTREAM 2 — CLAMP AT THE SOURCE

Progress must be `>= 0` and `<= 1` before easing.

Displayed money must be `>= 0`.

Do not hide a negative with CSS.  
Do not special-case one tier.

Add a seeded test that:
- starts from 0
- uses the live ease
- proves the first painted frame is never negative at 15x, 830x, and 5000x
- goes RED if the clamp is removed

---

# WORKSTREAM 3 — PRESERVE R132 / R133

Re-prove:
- base HUD and banner stay in lockstep
- feature-end HUD and banner stay in lockstep
- sub-10x feature does not reveal early
- amount contrast / tabular face unchanged
- banner chrome from R133 still paints through the band

---

# WORKSTREAM 4 — QA

Prove:
- Big / Mega / Epic
- feature-end
- `?mockCategory=super_win_small`
- first frame of each count-up is `>= $0.00`
- reduced motion
- 60fps / no console faults

---

# WORKSTREAM 5 — REPORT

State:
- exact function that leaked negative progress
- every surface now covered
- seeded RED proof
- lockstep numbers after the clamp

### CLOSE
- No negative money on screen
- No banner / hero scope creep
- Guards remain active
- PR on review lane

---
