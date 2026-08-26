# FS FABLE R126 - Prompt, verbatim

Recorded verbatim per convention (f). Pasted by the owner on 2026-08-26 and reproduced
from the owner's own message in the same session, not reconstructed.

---

**R126: HIGH-DENSITY HERO IN-BETWEEN INTAKE**

Sole live brief. Unattended. Review lane. Long-running builder session. High care.

### THE FENCE
- No kit packaging.
- No intake beyond:
  `.scratch/art-review/chatgpt-hero-inbetween-factory/`
- Do not weaken asset guards.
- Do not disturb HUD shell / banner pair.
- Do not sweep placeholders.
- Refuse lighting-only or edge-sliced frames.
- Keep reduced-motion safe.
- Budget is binding. Do not blow the 25MB cap.

### PRECONDITIONS
- On main, up to date.
- Confirm package exists and contains the claimed 68 frames.
- Confirm current live hero states:
  - R122 idle weight-shift
  - R124 v3 win unfold
  - R123 feature brace
- Confirm current dist headroom.

### GOAL
Replace sparse flipbooks with the denser performances **only where first-hand measurement proves
they are smoother and still identity-safe**.

Priority:
1. 24-frame win unfold
2. 12-frame idle
3. 16-frame feature brace
4. 8-frame approval nod only if it is real acting
5. 8-frame feature-ambient only if restrained and useful

Success is reviewer-visible smoothness, not file count.

---

# WORKSTREAM 1 - CENSUS
Inventory every frame/strip.
Separate runtime frames from QA sheets.

---

# WORKSTREAM 2 - HARD GATES
For every candidate strip, measure first-hand:
- identity vs live rest
- first == last
- ground stability
- no opaque pixels on columns 0 or 679
- no flat-cut limbs
- neighbouring-frame jump size
- silhouette change
- chest-width travel on win/brace
- live box clipping
- banner occlusion on the win strip

Refuse any strip that is:
- choppy
- clipped
- a different body family
- weaker than the live incumbent for that state

If a 24-frame win strip is too expensive, test a measured downsample to 16 or 12 **evenly spaced
frames** and keep the version that still looks continuous at game size.

---

# WORKSTREAM 3 - BUDGET
Estimate packed-sheet cost before wiring.
Sanitise RGB-under-zero-alpha.

If headroom is tight, ship in this order:
1. win
2. idle
3. feature brace
4. extras last or refuse

WebP remains an owner decision unless already supported. Do not invent a new media pipeline.

---

# WORKSTREAM 4 - WIRE ACCEPTED STRIPS
Update frame counts, durations, and state timers so denser strips are not truncated.

Keep:
- clean rest return
- no snap-cut
- reduced motion actually off
- no transform layer fighting the new motion
  If the old sway makes dense frames look drunk, reduce or remove it.

---

# WORKSTREAM 5 - SMOOTHNESS QA
Prove in the real game:
- idle loop
- meaningful win
- feature entry
- reduced motion
- 60fps / no console faults

Capture mid-performance, not only frame 01.
Compare visually against the live sparse strips.

Answer:
- is the jitter gone?
- does it now read as animation rather than stills?
- which strips still need more in-betweens?

---

# WORKSTREAM 6 - REPORT
State:
- which strips shipped
- which were refused
- whether any strip was thinned for budget
- current live frame counts
- dist impact
- remaining animation gaps

### CLOSE
- Measurement-first
- Smoothness over volume
- Guards remain active
- PR on review lane
- Stop when the accepted dense strips are live, or when blocked with exact evidence
