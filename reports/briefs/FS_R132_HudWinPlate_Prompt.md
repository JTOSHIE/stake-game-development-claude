---

**R132: HUD WIN PLATE + BANNER TRUTH**

Sole live brief. Unattended. Review lane. High care.

### THE FENCE
- No kit packaging.
- No new hero flipbook / sway / glance.
- No feature-border revival.
- No audio generation.
- Do not weaken asset guards.
- Do not sweep the owner’s 30 WIP rasters.
- Keep live text live.

### PRECONDITIONS
- On main, up to date.
- Confirm R131 is merged or present.
- Fingerprint the 30 WIP rasters first.

### GOAL
Fix the owner-visible defect first:

On a normal-spin win, the HUD WIN plate stays at `$0.00` while the win banner shows the real amount. Feature rounds already update the plate.

Also close the two leftover R131 items:
- epic chromatic flash is inert
- `win_countup_steady_gate` probes a reconstruction, not the shipped amount

---

# WORKSTREAM 1 — HUD WIN ON BASE SPINS

Trace every path that writes the HUD WIN plate:
- base-game win
- Big / Mega / Epic banner
- feature / Overdrive
- collect / next-spin reset

Prove the current bug with a real base-game win:
- banner amount
- HUD WIN amount
- whether the plate updates only after feature or collect

Fix so:
- a normal win updates HUD WIN
- the plate matches the live win
- it still resets at the correct point
- feature behaviour does not regress

Do not hide the plate. Do not bake the amount into art.

---

# WORKSTREAM 2 — COUNT-UP GATE

Make `win_countup_steady_gate` measure the **shipped** `.c1-amount` face and layout, not a reconstructed probe.

Seed a RED before it may PASS.

---

# WORKSTREAM 3 — EPIC CHROMATIC FLASH

The flash is inert because it lives inside the banner’s transformed containing block.

Either:
- move it to a true full-stage layer, or
- delete it if it cannot fire without burying HUD/hero

Do not ship dead code that looks alive.

---

# WORKSTREAM 4 — BANNER, SMALL ONLY

Do not rebuild the banner.

If cheap and safe:
- keep live label / amount / multiplier
- keep tier colours from R131
- no full-stage surround
- no baked words

Any extra chrome must not cover Spin / Bet / Balance or the planted hero.

---

# WORKSTREAM 5 — QA

Prove:
- base-game win: HUD WIN updates
- Big / Mega / Epic banners
- Overdrive / feature: HUD WIN still updates
- next spin resets correctly
- no feature perimeter
- idle stays planted
- reduced motion
- 1280 and one narrower width
- 60fps / no console faults

---

# WORKSTREAM 6 — REPORT

State:
- exact cause of the $0.00 HUD WIN bug
- what writes the plate now
- whether the flash was moved or deleted
- whether the count-up gate now reads the real element
- remaining banner residuals

### CLOSE
- HUD WIN must update on normal spins
- No idle-tick revival
- Guards remain active
- PR on review lane

---
