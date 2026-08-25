# R113: WIN CELEBRATION PACKAGE INTAKE + WIRING

Sole live brief. Unattended. Review lane. High effort. Player-visible presentation work.

## THE FENCE

- No kit packaging.
- output/ read-only except where this brief requires win-presentation assets/wiring.
- Do not weaken asset guards.
- Do not disturb the committed banner pair.
- Do not sweep unrelated placeholders into commits.
- Prefer minimal safe wiring into the existing win presentation flow.
- Do not rebuild the whole economy/UX of win tiers unless required for safe display.

## PRECONDITIONS

- On main, up to date.
- Confirm package exists:
  `.scratch/art-review/chatgpt-win-celebration-package/`
- Confirm current win presentation components exist:
  - `WinBanner` / max-win / big-win / epic-win paths as applicable
- Confirm current thresholds for win tiers remain intentional.
- Note any in-progress hero animation work and do not break it.

## GOAL

Make Big Win, Epic Win, and Max Win / 5000x look premium and review-ready using the new
celebration package.

Target outcome:

- stronger tier identity
- cleaner overlay presentation
- value-safe amount display where dynamic values are required
- visible improvement over the current celebration look

---

# WORKSTREAM 1 - PACKAGE AUDIT

Inventory every asset in the win celebration package.

For each file record:

- path
- dimensions
- alpha
- tier
- baked text yes/no
- role: main frame / accent / support
- status: READY / WRONG-SPEC / HOMELESS / WEAK / REVIEW-ONLY

Especially validate:

- Big Win frames
- Epic Win frames
- Max Win frames
- value-free Max frames
- separate 5000x emblem options
- support vignette / bloom / ring / banner backing

---

# WORKSTREAM 2 - MAP TO LIVE WIN FLOW

Trace the real components and thresholds for:

- Big Win
- Epic Win
- Max Win
- any existing shockwave / banner / overlay behaviour

Document:

- where art can plug in now
- where code changes are required
- which assets can remain support-only

Do not invent a second win system if one already exists.

---

# WORKSTREAM 3 - INTAKE READY ASSETS

Working-tree intake for assets that:

- match usable geometry
- have a real consumer or can be safely referenced
- do not break locale/dynamic value display

Prefer:

- value-free frames where the amount is dynamic
- integrated 5000x only where the current presentation already uses baked cap messaging or can
  safely show it

---

# WORKSTREAM 4 - MINIMAL WIRING

Implement the smallest safe presentation upgrade:

Priority:

1. Max Win / 5000x
2. Epic Win
3. Big Win
4. shared support accents if easy

Requirements:

- preserve readable win amounts
- preserve tier thresholds unless a tiny safe improvement is obvious
- no locale-breaking baked values for ordinary win amounts
- keep reduced-motion behaviour sane if relevant

If full wiring is blocked by architecture, implement what is safe and leave a precise residual
brief for the rest.

---

# WORKSTREAM 5 - VISUAL QA

Verify:

- Big / Epic / Max each read as ascending tiers
- amount remains legible
- overlays do not crush the reels into illegibility unless intentional for Max
- no console/asset faults
- no regression in ordinary non-celebrated wins

---

# WORKSTREAM 6 - REPORT

State:

- what was intaken
- what was wired
- what remains homeless
- whether this materially improves the presentation side of review risk
- recommended next step after hero animation lands

## CLOSE

- Win celebration presentation only
- Minimal safe wiring
- No unrelated asset sweeps
- Guards remain active
- PR on review lane
- Stop when the new package is either visibly improving live win celebration, or blocked with
  exact residuals
