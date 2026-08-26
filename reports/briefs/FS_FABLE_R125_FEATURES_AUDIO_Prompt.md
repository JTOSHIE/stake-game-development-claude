# FS FABLE R125 - Prompt, as received

Recorded per convention (f). Pasted by the owner on 2026-08-26. The workstream
headings, the fence and the CLOSE conditions are the owner's.

**READ THIS BEFORE TREATING THIS FILE AS THE OWNER'S EXACT WORDS.** Unlike the R117-R124
prompt records, this one was written out after the builder session's context was
compacted, so it is reproduced from the brief as carried forward rather than copied
straight from the owner's paste. Its structure, every fence bullet, every workstream and
every CLOSE condition are faithful and were the actual instructions the session worked to.
Individual sentences inside the workstream bodies may be reworded. If exact wording ever
matters, check it against the owner's original message; do not cite this file as verbatim.

---

**R125: FEATURES GUIDE FIX + AUDIO PATHFINDING**

Sole live brief. Unattended. Review lane. Long-running builder session. High care.

### THE FENCE
- No kit packaging.
- No bulk art intake.
- Do not weaken asset guards.
- Do not invent or fake audio stems.
- Do not commit placeholder silence as finished sound design.
- Do not sweep placeholders.
- Preserve locked HUD geometry and live-text rules.

### PRECONDITIONS
- On main, up to date.
- Confirm R124 v3 win unfold is live.
- Confirm current paytable / interface guide still uses a painted Features badge.
- Confirm current sound service and theme sound folder can be inspected.

### GOAL
Close two remaining production holes:
1. Make the paytable Features row match the live control.
2. Map the real audio path so stem acquisition can start immediately.

This session should leave a working UI fix plus a concrete audio implementation plan, not
another art detour.

### WS1 — FEATURES GUIDE ROW
Find the mismatch. Confirm whether every other row is a live-control screenshot and
Features is the only painted badge.

Preferred fix: use the same method as the other guide rows. Screenshot/capture the live
FEATURES control, or reuse the live grille glyph already in the button. No new
lightning-bolt mark. No ornate machine badge.

Preserve row copy, hit behaviour, locale text.

QA at desktop and one narrower width: Features row matches the live button, Turbo still
uniquely owns the bolt, no console/asset faults.

### WS2 — SMALL UI RESIDUALS ONLY
If cheap and safe, also fix:
- Features hover/pressed/open affordance if still missing.
- Any remaining one-line neighbour inconsistency caused by the quieter HUD.

Do not start a new HUD redesign.

### WS3 — AUDIO TRUTH MAP (main non-UI workstream)

**3.1 Inventory** every current cue (files and call sites) for: UI, spin start, reel stop,
land, win small/medium/big/mega/epic, max win, feature trigger, feature enter, feature
active, feature end, retrigger, anticipation, BGM, mute/unmute.

**3.2 Missing-stem matrix**, columns: Moment | Current file | Wired? | Status | Required
filename | Spec. Including at least feature_enter, feature_end, win_max, retrigger.

**3.3 Implementation readiness.** For each missing stem document: exact path, exact
function that should play it, when it fires, whether a hook exists, whether a new hook is
needed, duration/intensity expectation, whether it should duck BGM.

Do **not** generate fake stems.

**3.4 Acquisition route.** Recommend the practical production path for a solo + AI
workflow: what can be licensed safely for real-money use, what must stay human-composed or
licensed, exact naming and delivery format, how Claude should ingest files once they exist,
what must not be used if licence is unclear.

Be specific enough that the next session can start as soon as files arrive.

### WS4 — SAFE HOOKS ONLY
If a hook is missing and can be added with no fake audio: add the hook, keep it silent
until a real file exists, fail safe if the file is absent, do not pretend the cue is
finished.

If hooks already exist, leave them ready and document the drop-in filenames.

### WS5 — REPORT
Morning-ready handoff covering: Features guide change, UI residual, full audio inventory,
exact missing-stem shopping list, exact target paths and wiring functions, recommended
acquisition route, and what the next session should do the moment the four files exist.

### CLOSE
Features mismatch closed if possible. Audio path mapped, not faked. Guards remain active.
PR on review lane. Stop when the guide row is consistent and the audio acquisition path is
concrete.
