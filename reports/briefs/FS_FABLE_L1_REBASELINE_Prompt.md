FABLE BRIEF L1: LOCAL RE-BASELINE, RUNNER HYGIENE, Q6 CAPTURE, OWNER PREVIEW
Run locally on the owner's Mac in the existing clone. Any model tier suffices;
owner preference Claude Fable 5 accepted. Australian English, no em or en
dashes. Save and commit this brief verbatim. Explicit-path commits only.

PHASE 0. BASELINE PARITY. Confirm no uncommitted local work worth keeping (if
the tree is dirty, stop and show the owner the diff before touching it), then
fetch and hard-reset to origin/main at the PR #118 merge SHA. npm ci, full
rebuild, run the complete gate and proof estate. Print one line:
PARITY: <merge SHA> | kit <files>/<bytes> vs closure 77/12,330,182 (v10 bytes
were commit-stamped, so match on file count and on every gate result, and
report the byte delta as expected) | gates <green>/<total> vs closure 71/71.
Any mismatch beyond the commit-stamp byte delta is a STOP, reported not fixed.

PHASE 1. PROOF-RUNNER HYGIENE (from COMMS 046 and the Fable verification
round). kit_basis_gate, popout_conformance, social_dom and social_string get
clean exit semantics: exit 0 on PASS, non-zero on FAIL, and they terminate.
Document the runner (tsx) at the top of each and in scripts/README. Seeded per
convention (p): a deliberately failing invocation of each must exit non-zero,
shown in the session report. Then CI-wire the three browser proofs now that
they exit. Verify the full CI matrix green remotely per rule 10.

PHASE 2. Q6 CAPTURE, armed on the owner's paste of the session-bearing launch
URL (sessionID= and rgs_url= present). Run tools/capture_rgs_400.sh against
it, commit the raw bodies under docs/stake-engine-live/captures/ with today's
date, and report which top-level field carries the error identifier and
whether it matches the string code read at rgsService.ts:381. Update the
UNKNOWN in OWNER_RULINGS section C to its resolved state. If no URL is pasted
this session, record SKIPPED, OWNER-GATED.

PHASE 3. OWNER PREVIEW. Serve the built kit locally, print the URL clearly,
and keep serving until the owner ends the session. Remind the owner: German
locale, rules screen, two minutes of play for the mix.

CLOSE. Session report appended and archived, this brief committed,
FABLE_COMMS entry appended noting parity result, hygiene, capture outcome and
that the preview was served. FOR THE NEXT SESSION: external audit refresh.
DONE MEANS: parity line printed and true; four runners exit correctly with
seeded proof; CI green including the newly wired legs; capture committed or
SKIPPED OWNER-GATED recorded; preview served; tree clean.
