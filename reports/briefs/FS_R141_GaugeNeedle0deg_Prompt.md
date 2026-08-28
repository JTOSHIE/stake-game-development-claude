---

**R141: INTAKE 0° GAUGE NEEDLE**

Sole live brief. Unattended. Review lane. Use Opus 5 if available.

### THE FENCE
- This raster only:  
  `/Users/jt/math-sdk/.scratch/art-review/chatgpt-gauge-needle-0deg/gauge_needle.png`
- Do not touch `gauge_face.png`.
- Do not change the sweep formula unless ingest proves the bake is not 0°.
- No hero, audio, kit, or other art.
- Do not sweep unrelated rasters.

### PRECONDITIONS
- On main, up to date (R138/R139 state as-is).
- Save the brief verbatim.
- Confirm the source file exists and measure it first-hand.

### GOAL
Replace shipped `gauge_needle.png` with the 0° needle so

`needleDeg = -110 + clamp((mult-1)/15) * 220`

sweeps −110° → +110° through the top, as the comment says.

---

# WORKSTREAM 1 — MEASURE BEFORE INGEST

Record:
- source W×H, alpha
- tip angle (must be ~0°)
- pivot vs canvas centre
- shipped target size from the manifest / call site
- current HEAD needle angle

If source aspect ≠ shipped target, ingest must resize without rotating the tip off 0°.

---

# WORKSTREAM 2 — INGEST AND SWAP

Use the real ingest path.  
If the row is UI and ingest refuses, stop and report — do not raw-overwrite unless the project already treats this file as a direct theme swap.

After swap, prove in-browser:
- face still needle-free (on-screen count = 1)
- at multiplier 1 the needle sits at the start of the arc, not 27° high
- at mid and max the sweep is symmetric about 12 o’clock
- hub does not orbit

If the baked tip is not 0° after ingest, fix the call site by the measured residual only. Do not guess 27.2°.

---

# WORKSTREAM 3 — QA

- 1280 feature column
- reduced motion
- no second needle
- R138 hero float untouched
- static gates locally before push

### CLOSE
Report baked angle before/after, whether the formula changed, needle count on screen. PR on review lane.

---
