FABLE BRIEF R068: THE RTL GEOMETRY LEAK (2026-08-14). Sole live brief.
Owner finding with screenshot: Arabic, and only Arabic, shifts the board
cells left out of the frame; all other languages and all currencies
confirmed clean by the owner's full sweep. Root mechanism to confirm and
name exactly: the game sets no direction itself (zero dir or rtl
references in src), the portal host document flips to rtl for ar, and
inherited direction re-flows the board's cell container while the
painted frame stays put. Judgement tier, one session, Australian
English, no em or en dashes. Save and commit verbatim. Explicit-path
commits, CI green per rule 10, comms folded per (t).
TASK 1. Reproduce under the host condition (document dir rtl, lang ar),
name the exact inheriting container, then pin the GAME STAGE to
left-to-right at its root (direction ltr, bidi isolation where needed)
so board geometry is host-invariant: frame, cells, jets, presentation
layers, win chips, feature panels, buy dialog, replay view. Text nodes
keep native Arabic shaping untouched; the ar HUD labels in the owner's
capture are the regression reference for what must not change.
TASK 2. Verify the ar rulesWaysPay prose states the ways rule as
left-to-right from reel 1 (the game rule is language-invariant); if the
ar translation contradicts it, ESCALATE the sentence, do not rewrite.
TASK 3, THE GATE. A direction-parity proof runs the harness with the
host flipped to rtl and asserts the board rect and every stage surface
rect equal their ltr twins at Desktop, Mobile S and Popout S, frames
committed for ar; seeded per (p) by lifting the pin, which must
reproduce the owner's exact drift red before the fix and green after.
CLOSE. Tracker row credits the owner's language sweep; full matrix
green; rebuild at the tip and print the stamp for one dist sync; tree
clean. FOR THE NEXT SESSION: the owner's Arabic re-check beside this
capture, the retrigger eyeball, then the fifty-one walk, one-timers,
Start Approval on the owner's word.
