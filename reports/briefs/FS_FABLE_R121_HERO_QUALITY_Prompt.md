# FS FABLE R121 — Prompt, verbatim

Recorded verbatim per convention (f). Pasted by the owner on 2026-08-26.

---

**R121: HERO ANIMATION QUALITY PASS**

Sole live brief. Unattended. Review lane. High care. Player-visible animation work.

### THE FENCE
- No kit packaging.
- No bulk factory intake.
- Do not weaken asset guards.
- Do not disturb the committed banner pair or HUD shell.
- Do not sweep placeholders.
- Prefer clear visible improvement over subtle technical motion.
- Refuse weaker-than-incumbent strips.
- Keep reduced-motion safe.

### PRECONDITIONS
- On main, up to date.
- Confirm current hero system:
  - crossed-arms rest/idle
  - existing win / feature reactions if present
  - glance or other secondary states if present
- Confirm available strong candidates from prior kits/factory only where already audited as identity-locked.
- Confirm current win-banner occlusion behaviour around the hero.

### GOAL
Make the hero feel like a **real animated mascot**, not a lightly breathing still.

Target outcome:
- stronger readable motion at game distance
- clearer difference between idle, win, and feature states
- crossed-arms attitude preserved
- no identity drift
- no foot teleport
- motion that a reviewer notices within a few seconds

This is a quality pass, not an architecture rewrite.

---

# WORKSTREAM 1 — CURRENT HERO TRUTH

### 1.1 Inventory live hero states
Map every live state:
- idle / breathe
- win reaction
- feature reaction
- glance / approval / other if present
- reduced-motion fallback

For each record:
- source strip/sheet
- frame count
- trigger
- visible strength
- whether it reads under the win banner

### 1.2 Define the quality bar
A successful pass must make all of these true:
- idle is clearly alive, not a tiny shimmer
- meaningful wins cause an obvious reaction
- feature entry causes an obvious reaction
- dead time does not feel frozen
- the character remains the preferred crossed-arms hero

---

# WORKSTREAM 2 — SELECTIVE UPGRADE ONLY

### 2.1 Candidate evaluation
Evaluate only identity-locked candidates that can beat the live states on:
- readable body motion
- visor/chest energy change
- rest return
- ground stability
- performance cost
- visibility despite banner occlusion

Priority candidates if available and valid:
1. stronger feature-trigger / power-surge reaction
2. stronger win reaction
3. stronger epic-class reaction if distinct
4. better secondary life in dead time
5. max-win reaction only if the hero remains meaningfully visible during max presentation

### 2.2 Hard refusals
Refuse:
- neutral arms-at-sides figures
- alternate body families
- weaker motion than current live states
- strips with unstable ground/foot teleport
- anything that makes the hero feel twitchy or cheap

---

# WORKSTREAM 3 — STATE MACHINE CLARITY

Implement the clearest possible behaviour matrix:

| State | Desired hero behaviour |
|------|-------------------------|
| idle / dead spin | visible living idle |
| small win | no reaction or tiny approval only if truly elegant |
| meaningful win | clear win reaction |
| epic-class win | stronger reaction if available |
| feature trigger / entry | clear power-up response |
| feature active | optional restrained ambient life only if not noisy |
| max win | only if visible and worthwhile |

Requirements:
- clean enter/exit to rest/idle
- no state sticking
- no double-driving conflicting strips
- reduced motion remains sane

---

# WORKSTREAM 4 — READABILITY UNDER UI

### 4.1 Banner occlusion
Re-measure how much of the reaction remains visible when the win banner is up.

Prefer reactions whose readable mass sits in:
- chest
- shoulders
- lower visor
- stance energy

not only the top of the head.

### 4.2 Safe composition tweaks
Only if clearly helpful and low-risk:
- minor reaction-only offset
- timing tweak so peak motion reads before full occlusion
- no redesign of the win banner in this session

---

# WORKSTREAM 5 — PERFORMANCE AND STABILITY

Verify:
- stable frame timing
- no asset 404s
- no console errors
- acceptable dist impact
- no regression in car/hero layout relationship

Sanitize any newly intaken frames if RGB-under-alpha fringe is present.

---

# WORKSTREAM 6 — REVIEW IMPACT QA

Prove with evidence across:
- base idle
- dead time
- meaningful win
- feature entry
- reduced motion

Answer explicitly:
- what a reviewer notices in the first 10 seconds
- what they notice on a win
- what they notice on feature entry
- whether this materially improves the "poor animations" risk

---

# WORKSTREAM 7 — REPORT

State:
- which states were upgraded
- which candidates were refused and why
- current live behaviour matrix
- remaining hero animation gaps
- exact next art request if more motion still needs new renders rather than transforms

### CLOSE
- Hero animation quality only
- Selective upgrades only
- No bulk factory import
- Guards remain active
- PR on review lane
- Stop when the hero is clearly more alive and reactive in review-visible states, or blocked with exact residuals
