FABLE BRIEF R075: THE TOOLTIP AND THE GATE, FINAL PRE-SUBMISSION FIXES
(2026-08-20). Sole live brief, both items from the R074 final audit.
Judgement tier, one short session, Australian English, no em or en
dashes. Save and commit verbatim. Explicit-path commits, remote CI green
per rule 10, comms folded per (t).
TASK 1, G2. The four speed tooltips (HudOverlay.svelte 513, 621, 778,
871) route their title attributes through the same localised source the
adjacent aria-labels already use, no new strings, no hardcoded English,
the four states consistent. The hardcode scan extends to title
attributes with the current state as the seeded violation per (p).
Frames of the tooltip in en and de.
TASK 2, G4. popout_conformance.mjs aligns assertion to label at 44 per
the recorded HUD_SPEC bar (TR-169). Run it: if green, done; if any
element reads under 44, DO NOT retune and DO NOT fix, report the element
and its measurement verbatim for the owner's call, quality against our
own bar, the platform names none.
CLOSE. Tracker rows (G2 closed, G4 dispositioned or escalated), full
matrix green, rebuild at the tip, print the stamp for the owner's final
sync, tree clean. FOR THE NEXT SESSION: nothing; the owner's glance,
walk, and Start Approval.
