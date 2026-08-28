R138: RESTORE IDLE FLOAT + SMOOTH REACTIONS ONLY
Sole live brief. Unattended. Review lane. High care.
THE FENCE

* No new art factory.
* No 6-frame idle sheet.
* No left/right sway.
* No glance.
* No feature-border revival.
* No audio.
* No kit packaging unless the tree is already clean.
* Do not sweep WIP rasters.
* Do not change the gauge in this session (0° needle is a separate intake).
* Live text stays live.

PRECONDITIONS

* On main, up to date.
* Confirm R130 idle freeze is still the live rest pose (frame 01 held).
* Confirm the car’s existing float / underglow motion.
* Fingerprint dirty rasters if any exist.

GOAL
Owner ruling after the live upload:

* Completely still idle is now too dead.
* Restore the original slight floating, the same class as the car.
* Keep planted stance, crossed arms, no pose ticking.
* Win unfold and feature brace must stop looking like a flipbook.

Target:

* idle = rest pose + tiny vertical float
* reactions = existing strips, temporally smoothed
* reduced motion = freeze both

WORKSTREAM 1 — MEASURE THE CAR
Record the live car motion:

* property (translateY / filter / both)
* amplitude in px
* period
* whether the hero container already has a disabled char-idle

Idle float must be at or below the car’s amplitude. If it reads as a sway, it is too big.
WORKSTREAM 2 — IDLE FLOAT ONLY
Put a slow bob on the hero wrapper, not on the sprite sheet.
Allowed:

* translateY about 2–4px
* period about 4–6s
* ease-in-out
* optional matching contact-shadow / underglow if the car has one

Not allowed:

* rotation
* translateX
* idle flipbook
* dual-buffer dissolve on idle
* weight-shift frames

If .char-idle already did this and was disabled for the rig, restore that rule at a measured small amplitude rather than inventing a new pendulum.
Prove over 8s:

* pose pixels do not tick
* wrapper Y travels the intended 2–4px
* no 14px punch

WORKSTREAM 3 — SMOOTH WIN AND FEATURE ONLY
Keep the 16-frame unfold and 7-frame brace.
Add a dual-buffer crossfade only while data-motion is win or energy.
Rules:

* bottom layer holds current frame at opacity 1
* top layer fades the next frame
* no ghosted second body
* enter and exit still land on rest
* epic duration stays 1.9s if that hold is still required
* idle must not use this dissolve

If the dissolve ghosts legs or clips fists, drop it and only ease the existing punch transform. Do not add frames.
WORKSTREAM 4 — QA
Prove:

* idle float visible but quieter than the old tick
* small win: no reaction
* big / epic: unfold reads smoother
* feature entry: brace reads smoother
* reduced motion: no float, no dissolve
* 1280 and portrait
* 60fps / no console faults
* gauge / kit / R137 rasters untouched

WORKSTREAM 5 — REPORT
Include:

* car vs hero amplitudes
* whether dissolve shipped or was refused
* remaining clunk that is art, not code

CLOSE

* Float yes, tick no
* Reactions smoother or honest “needs denser drawings”
* PR on review lane
