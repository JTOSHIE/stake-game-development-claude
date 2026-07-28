COMMON PREAMBLE (paste at the top of every Wave 2 squad prompt)

You are one discovery squad in a shared-nothing audit of a slot game's captured frames, under the stream lens: this game will be shown on stream to tens of thousands of viewers, and the standard is that nothing on screen, at any moment, in any transition, reads as less than a top studio's work.

HARD RULES
- Read-only against the repository, with ONE exception: you write exactly one file, your ledger shard, at the path given below. Do not touch any other file.
- Do NOT run any project script (nothing under scripts/, no npm run, no gates). Read scripts as TEXT if you need them. Scripts here can write; an instruction cannot constrain a script's side effects.
- At the END of your work run: git status --porcelain, and report the output in your shard under `tree_after:`. Expected: only untracked paths under reports/screens/stream-test-2026-07-28/, reports/qa/stream_test/, and frontend/scripts/stream_test_capture.mjs. Anything else means you dirtied the tree: say so loudly.
- Derive before measuring where a claim touches a number: cite file:line for any specification claim.
- FIRST read /Users/jt/math-sdk/reports/qa/stream_test/KNOWN_OPEN.md. A finding matching a row there is reported as KNOWN(<row>) with your frame path as fresh evidence, in its own short section at the end of your shard. Only genuinely new findings get full entries.

FRAME SET
/Users/jt/math-sdk/reports/screens/stream-test-2026-07-28/
Filenames: NNN_<session-slug>_<surface>.png. Slugs: desktop, laptop, popout-l, popout-s, mobile-l, mobile-m, mobile-s, stretch, de-desktop, ar-desktop. Files containing `transition_` are deliberate mid-animation frames. MANIFEST.json in the same directory maps every frame to session, viewport, lang, phase, note.

SEVERITY SCALE (tag every finding)
- STREAM: a watching audience would notice it. Reserved for exactly that.
- HIGH: a reviewer or streamer inspecting the surface would catch it.
- MEDIUM: visible on comparison or repeat viewing.
- LOW: detectable only with tooling or pixel inspection.

SHARD FORMAT (write to your assigned path, markdown, no em or en dashes, Australian English)
# <shard name>
scope: <which sessions/frames you covered, and the count>
frames_read: <count actually opened>

## <ID> <SEVERITY> <one-line title>
- Frames: <path(s), the exact frames that show it>
- Claim: <precisely what is wrong, figures and strings transcribed verbatim in backticks>
- Where fixable: <frontend file:line if you can name it, else UNKNOWN. Note: frontend/src/lib/services/rgsService.ts, frontend/src/lib/stores/gameStore.ts, and games/future_spinner/** are LOCKED; if the fix appears to live there, say LOCKED>
- Proposed fix: <one or two lines, or PARK(<reason>) if larger than small>

## KNOWN matches
- KNOWN(<row>): <frame path>, <one line>

tree_after: <git status --porcelain output>

Use IDs <PREFIX>-01, -02, ... with your assigned prefix. Number in severity order, worst first. If you find nothing new in a category, say so explicitly rather than silently: absence of findings is a claim and you are signing it.
