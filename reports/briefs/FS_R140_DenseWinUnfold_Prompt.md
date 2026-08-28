---

**R140: WIRE DENSE WIN UNFOLD + FEATURE BRACE**

Sole live brief. Unattended. Review lane. High care. Use Opus 5 if available.

### THE FENCE
- Only these sources:  
  `/Users/jt/math-sdk/.scratch/art-review/chatgpt-hero-dense-reactions/`
- Idle float from R138 stays.
- Reaction crossfade from R138 stays.
- No new idle strip.
- No sway, glance, audio, gauge, or kit rebuild unless a committed raster forces a frontend hash change.
- Do not sweep unrelated rasters.
- Do not blow the 25MB cap.

### PRECONDITIONS
- On main, up to date. Note R141 / #178 if unmerged; do not reopen the needle unless this session is already on that SHA.
- Save this brief verbatim.
- Fingerprint any dirty rasters.
- Confirm live rest pose is still the crossed-arms master used by the current win/brace sheets.

### GOAL
Replace the live win unfold and feature brace with the dense strips so the acting is no longer a slideshow.

Owner: float is accepted. Transitions still look amateur.

---

# WORKSTREAM 1 — CENSUS AND IDENTITY

Count frames. Measure first-hand, do not trust QA_REPORT.md:

- canvas 680×1344 RGBA
- frame 1 == last frame
- IoU vs the **live** rest frame (not only vs the package rest)
- ground-line drift
- columns 0 and 679 clear
- limbs inside the frame at peak
- mean consecutive silhouette % vs the live 16-frame / 7-frame strips

Refuse if identity vs live rest fails, if fists clip, or if it is lighting-only.

---

# WORKSTREAM 2 — BUDGET

Record local and clean-CI headroom.

32-frame win will be expensive. Prefer:

1. ingest full 32 if it fits
2. else keep ends + peak and drop even mid frames to 24, then 16
3. never drop frame 1 / last

WebP is an owner call. Do not introduce `.webp` unless already used in the tree.

---

# WORKSTREAM 3 — INTAKE AND WIRE

Use the real ingest / sheet pack path the hero already uses.

Wire:
- win strip → existing win motion
- brace strip → existing energy / feature motion
- rest still frame 01
- R138 dissolve still one frame ahead
- epic hold duration still covers the last frame
- reduced motion still freezes on rest

Do not change idle art or the wrapper float.

---

# WORKSTREAM 4 — QA

Prove:
- idle: float only, pose held
- big / epic: denser unfold, returns to rest
- feature entry: denser brace, returns to rest
- no edge clip at game size
- 60fps / no console faults
- 1280 + one narrow
- gauge needle untouched unless #178 is already on this tree

---

# WORKSTREAM 5 — REPORT

Include:
- frames shipped vs delivered
- identity IoU vs live rest
- budget before/after
- whether dissolve still helps
- remaining clunk that is still art

### CLOSE
- Dense reactions live or refused with numbers
- Float preserved
- PR on review lane

---

After #178 and #140 are on main, rebuild a **frontend-only** kit so Stake gets the 0° needle and the new strips together. Audio still waits.
