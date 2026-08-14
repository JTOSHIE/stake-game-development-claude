# R061 small-size pixel guard, 2026-08-14

The owner confirmed Popout S and Mobile S fitting the full ten-figure GC
string correctly, so the R061 fs-profile fix is guarded at those sizes by
element screenshots of the three HUD money boxes, captured pre-change
(`<size>_<box>.png`) and post-change (`after_...`), same scenario (balance
996,622,600.00 GC, the owner's value).

Result: **3 of 6 byte-identical; the other 3 visually identical**. The
three divergent files were pixel-decoded and differenced in-browser: ZERO
pixels changed above a 12-of-765 channel-delta threshold, maximum single
channel delta 1 of 255 (PNG encoder and antialias quantum), and one of the
three also differs between two captures of the SAME build (the R059
recorded fitMoney capture-flake class). The small sizes are unchanged in
every meaningful sense; the durable guard is the money fit gate's CAD and
GC legs, which now include the visual-bounds assertion at these sizes.
