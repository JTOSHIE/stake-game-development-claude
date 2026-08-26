# FS FABLE R122 — Prompt, verbatim

Recorded verbatim per convention (f). Pasted by the owner on 2026-08-26.

---

**R122: POSE-CHANGING HERO STRIP INTAKE**

Sole live brief. Unattended. Review lane. High care. Player-visible animation work.

### THE FENCE
- No kit packaging.
- No bulk factory intake beyond this named package.
- Do not weaken asset guards.
- Do not disturb HUD shell / banner pair.
- Do not sweep placeholders.
- Refuse any strip that fails identity, rest-return, ground stability, or silhouette-change tests.
- Keep reduced-motion safe.

### PRECONDITIONS
- On main, up to date.
- Confirm package exists:
  `.scratch/art-review/chatgpt-pose-changing-hero-strips/`
- Confirm current live hero state machine from R121 is present.
- Confirm current dist headroom.

### GOAL
Replace lighting-only hero motion with **real pose-changing performances**.

Target outcome:
- idle has a real weight shift
- win reaction unfolds arms then returns to crossed
- feature entry uses a distinct brace / power-up pose
- all three remain the same hero identity
- reviewer-visible animation quality is materially stronger

---

# WORKSTREAM 1 — FIRST-HAND ACCEPTANCE GATE

Do not trust the package QA alone. Re-measure.

For each strip:
- identity vs live crossed-arms rest
- first frame == last frame
- opaque ground-line stability
- silhouette change vs rest
- whether pose actually changes, not just glow

Acceptance floors from R121:
- idle **> 2%**
- win reaction **> 5%** and arms unfold/recross
- feature brace **> 4%** and distinct from idle/win

Refuse any strip that fails.

---

# WORKSTREAM 2 — BUDGET AND SANITATION

Before wiring:
- estimate packed-sheet cost
- sanitise RGB-under-zero-alpha if present
- keep headroom safe
- prefer replacements over extra concurrent sheets where possible

---

# WORKSTREAM 3 — WIRE THE THREE STATES

Implement:

| State | Strip |
|------|--------|
| idle / dead time | weight-shift idle |
| meaningful win | arms-unfold win reaction |
| feature trigger / entry | feature brace |

Requirements:
- clean enter/exit
- no truncated curves
- no state sticking
- reduced motion actually stops motion
- preserve current trigger thresholds unless a tiny safe improvement is obvious

---

# WORKSTREAM 4 — BANNER OCCLUSION CHECK

Re-measure how much of the new win reaction remains visible under the live win banner.

If the unfold still hides too much peak motion:
- prefer a timing/composition tweak
- do not redesign the banner in this session unless a one-line safe improvement is proven

---

# WORKSTREAM 5 — QA MATRIX

Prove across:
- idle
- small win
- meaningful win
- feature entry
- reduced motion
- 60fps / no console faults

Answer explicitly:
- silhouette change now vs R121 lighting-only baseline
- whether a reviewer can see pose change at game distance
- remaining gaps

---

# WORKSTREAM 6 — REPORT

State:
- which strips shipped
- which were refused
- current hero behaviour matrix
- dist impact
- exact residual if any strip looked strong in QA docs but failed first-hand measurement

### CLOSE
- These three strips only
- Measurement-first
- Guards remain active
- PR on review lane
- Stop when the hero finally changes pose in live play, or when blocked with exact evidence
