# FS FABLE R119 — Prompt, verbatim

Recorded verbatim per convention (f). Pasted by the owner on 2026-08-26.

---

**R119: OPERATOR-STANDARD HUD SHELL**

Sole live brief. Unattended. Review lane. High care. Player-visible UI pivot.

### THE FENCE
- No kit packaging.
- No bulk art intake.
- Do not weaken asset guards.
- Do not bake Balance / Win / Bet / labels into images.
- Do not replace live controls with dead raster buttons.
- Preserve locale-safe text and existing control behaviour.
- Prefer reversible CSS/component restyle over structural rewrites.
- Do not sweep placeholders.

### PRECONDITIONS
- On main, up to date.
- Confirm current HUD lives primarily in CSS/SVG rather than painted button rasters.
- Confirm live Balance / Win / Bet values are dynamic text.
- Confirm current spin / bet / menu / turbo / autoplay behaviour remains the source of truth.
- Confirm any HUD_SPEC / locked geometry rules before changing hit targets.

### GOAL
Pivot the HUD from mismatched custom chrome to a **clean operator-standard shell**.

Target outcome:
- dark glass / neutral modern control bar
- white or off-white live values
- restrained accent only
- theme remains in the game world, not in every control skin
- reusable later as a template HUD
- no regression in usability, locale, or Stake-required controls

---

# WORKSTREAM 1 — CURRENT HUD TRUTH MAP

### 1.1 Inventory the live HUD
Map every visible control and value surface:
- Balance
- Win
- Bet
- Spin
- Bet up/down
- Max / turbo / autoplay / menu / sound if present
- decorative panels behind them

For each record:
- component/CSS source
- interactive yes/no
- text source
- current visual treatment

### 1.2 Identify what must not break
Explicitly protect:
- live numeric values
- bet level changes from RGS
- sound toggle availability
- spacebar-to-spin/bet behaviour if present
- autoplay confirmation behaviour if present
- 44px-class touch comfort where relevant
- any locked HUD geometry / CI checks

---

# WORKSTREAM 2 — STANDARD SHELL DESIGN DIRECTION

Implement a quiet operator-style shell:

### Visual targets
- dark translucent panels
- simple neutral borders
- clean white / near-white values
- minimal cyan accent only where useful
- no busy carbon/texture overload on controls
- spin remains the dominant control
- secondary controls visually quieter

### Product intent
- game art carries the theme
- HUD carries clarity
- future games can reuse this shell

Do **not** invent a second control system.
Restyle the existing one.

---

# WORKSTREAM 3 — IMPLEMENT THE RESTYLE

### 3.1 Panels
Restyle the bottom bar / info plates:
- quieter material
- better separation from the scene
- less visual competition with hero/reels

### 3.2 Controls
Restyle shells for:
- spin
- bet controls
- utility buttons

Keep:
- SVG/code glyphs or existing functional icons where practical
- current hit targets unless a clear safe improvement is needed

### 3.3 Values
Ensure Balance / Win / Bet remain:
- live text
- highly legible
- consistently aligned
- not styled like decorative art

### 3.4 Accent discipline
One restrained accent system only.
No multi-colour neon chrome across every button.

---

# WORKSTREAM 4 — RESPONSIVE / STATE QA

Verify across:
- desktop wide
- mid desktop
- narrow mobile-like width
- mini-player if practical
- base game
- feature active
- win banner visible states

Check:
- no clipped controls
- no unreadable values
- no control overlap
- hero/car not newly crowded by HUD chrome
- feature perimeter and HUD can coexist

---

# WORKSTREAM 5 — TEMPLATE NOTES

Document the resulting HUD as a reusable shell:
- what is standard template chrome
- what remains game-specific
- what future titles should inherit unchanged

---

# WORKSTREAM 6 — REPORT

State:
- exact files changed
- before/after design intent
- any geometry left untouched and why
- residual risks
- whether the HUD now reads as operator-standard rather than leftover custom chrome

### CLOSE
- HUD chrome restyle only
- live text preserved
- no baked labels
- no control-behaviour regressions
- Guards remain active
- PR on review lane
- Stop when the HUD is quieter, cleaner, and aligned with a standard provider shell, or blocked with exact evidence
