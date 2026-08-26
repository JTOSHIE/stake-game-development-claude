# FS FABLE R123 — Prompt, verbatim

Recorded verbatim per convention (f). Pasted by the owner on 2026-08-26.

---

**R123: POSE-CHANGING HERO STRIPS V2 INTAKE**

Sole live brief. Unattended. Review lane. High care. Player-visible animation work.

### THE FENCE
- No kit packaging.
- No bulk factory intake beyond this named package.
- Do not weaken asset guards.
- Do not disturb HUD shell / banner pair.
- Do not sweep placeholders.
- Keep the already-shipped R122 idle weight-shift unless first-hand measurement proves a clear regression.
- Refuse any strip that fails identity, rest-return, ground stability, silhouette-change, or **canvas-edge** tests.
- Keep reduced-motion safe.

### PRECONDITIONS
- On main, up to date.
- Confirm package exists:
  `.scratch/art-review/chatgpt-pose-changing-hero-strips-v2/`
- Confirm current live idle is the R122 weight-shift strip.
- Confirm current dist headroom.

### GOAL
Wire the repaired **win unfold** and **feature brace** strips now that limbs are claimed to sit inside the canvas.

Target outcome:
- idle remains the planted-foot weight shift
- meaningful wins play a real arms-unfold reaction
- feature entry plays a distinct brace / power-up pose
- no severed limbs
- reviewer-visible pose change at game distance

---

# WORKSTREAM 1 — FIRST-HAND ACCEPTANCE GATE

Do not trust the package QA alone.

For every runtime frame of both new strips, measure:
- identity vs live crossed-arms rest
- first frame == last frame
- opaque ground-line stability
- silhouette change vs rest
- **min/max opaque x**
- whether any fully opaque pixel touches column 0 or 679
- whether unfolded arms/fists remain fully inside the 680×1344 canvas
- whether the figure overflows the live hero box in-game

Acceptance:
- win unfold **> 5%** silhouette change and genuine unfold/recross
- feature brace **> 4%** silhouette change and distinct from idle/win
- **no opaque edge contact**
- no flat-cut limb at 2× inspection

Refuse immediately if the canvas-edge defect returns.

---

# WORKSTREAM 2 — BUDGET AND SANITATION

Before wiring:
- estimate packed-sheet cost
- sanitise RGB-under-zero-alpha
- keep headroom safe
- prefer replacements of the current lighting-only win/feature sheets

---

# WORKSTREAM 3 — WIRE THE TWO NEW STATES

Implement:

| State | Strip |
|------|--------|
| meaningful win | v2 win-reaction unfold |
| feature trigger / entry | v2 feature brace |

Keep:
- R122 idle weight-shift
- clean enter/exit
- no truncated curves
- reduced motion actually off

---

# WORKSTREAM 4 — BANNER OCCLUSION + BOX CLIP

Re-measure:
- how much of the unfold remains visible under the live win banner
- whether the live hero box clips the new poses

If the live box clips repaired limbs, fix the box/overflow only if low-risk and proven. Do not redesign the banner unless a one-line safe improvement is proven.

---

# WORKSTREAM 5 — QA MATRIX

Prove across:
- idle
- small win
- meaningful win
- feature entry
- reduced motion
- 60fps / no console faults

Capture the actual unfold/brace peaks, not just the first 180ms hop.

---

# WORKSTREAM 6 — REPORT

State:
- edge-test results per frame
- which strips shipped or refused
- current live hero behaviour matrix
- dist impact
- remaining animation gaps

### CLOSE
- These two repaired strips plus the already-shipped idle
- Measurement-first, including the canvas-edge test that R122 found
- Guards remain active
- PR on review lane
- Stop when win and feature finally change pose without severed limbs, or when blocked with exact evidence
