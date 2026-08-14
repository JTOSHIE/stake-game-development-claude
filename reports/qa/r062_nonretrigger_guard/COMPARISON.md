# R062 non-retrigger pixel guard, 2026-08-14

Mid-feature board shots of the NON-retrigger fixture (bonus.feature) at three
fixed elapsed marks, captured from the pre-R062 build (`board_t*.png`, source
stashed and rebuilt at 1d72d632) and the post-R062 build (`after_...`), the
identical deterministic replay both times.

Result: **ZERO changed pixels** in all three comparisons (in-browser decode
and channel-difference, threshold 24 of 765). The R062 moment's styles are
scoped behind the retrigger state (`fs-moment-dim`), so ordinary spins render
byte-for-byte as before, which is the brief's guardrail held exactly.
