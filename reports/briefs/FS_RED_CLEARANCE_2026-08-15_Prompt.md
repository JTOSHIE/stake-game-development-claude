WE ROLL SPINNERS: PR 123 RED CLEARANCE AND LAYOUT EVIDENCE

Branch: track/standback-2026-08-15, the PR #123 branch. Do NOT branch fresh.
Australian English. No em dashes or en dashes anywhere, including in committed
documents. Commits stage explicit paths only, never git add -A, never commit -a.
Locked paths untouched: frontend/src/lib/services/rgsService.ts,
frontend/src/lib/stores/gameStore.ts, games/future_spinner/,
.claude/settings.json.

CONTEXT
The revert pass left PR #123 red at exactly two steps, disjoint and max-win hold,
both of them documented decisions rather than defects. The owner has ruled on the
first: nothing is deleted, the dead manifests are archived. The second is a gate
asserting on an identifier's spelling rather than on behaviour, which the previous
session diagnosed and correctly did not touch.

TASK 1: archive the two dead track manifests
docs/records/tracks/quality-sweep.manifest and
docs/records/tracks/docs-reskin.manifest belong to branches deleted on
2026-07-28. Move both with git mv into docs/records/tracks/closed/ so the record
stays visible in the tree rather than only in history. Do NOT git rm either file.
Then confirm the disjoint check no longer sees them. If the check globs the
tracks directory recursively and still collides, move them instead to
reports/archive/tracks-closed/ and say in the report that you did so and why. Add
a one line note at the top of each moved file recording that its branch was
deleted on 2026-07-28 and that the manifest is retained as a closed record.

TASK 2: fix the max-win hold gate on behaviour, not on a name
frontend/scripts/max_win_hold_gate.mjs:206 counts the literal
`disabled={$isWincap ? true : ($isSpinning ? false : !$canSpin)}` and requires
exactly four occurrences. Remove that static count. Replace it with a RUNTIME
assertion covering the same four spin button instances the count was standing in
for: with the wincap state set, each rendered spin button must carry the disabled
attribute, read from the DOM rather than from the source. Drive each of the four
layout profiles the four instances belong to; identify those profiles from the
component rather than assuming them, and name them in the report.

This gate must carry a seeded self-test per convention (p), invoked the same way
the other gates in this repository invoke theirs. The seed severs the
`$isWincap ? true` first branch on ONE instance in a scratch copy of the source,
so that instance renders enabled at wincap. The seeded run must FAIL, naming
which instance, with a real non-zero exit. A seed that passes means the gate is
not asserting what it claims and the task is not done.

Do not change any component. If the runtime assertion goes red against the
current build, that is a finding: record it, do not fix it, and stop.

TASK 3: layout evidence, capture only
Capture the game at rest, no dialog open, at Desktop 1280x720 and at the portrait
profile the project already uses, and commit the frames to
reports/screens/layout-2026-08-15/. Alongside them commit a MEASUREMENTS.md
holding, per profile and measured from the DOM rather than from the image: the
reel frame's outer bounding box, the bottom banner slab's bounding box, the
viewport width, the turbo button's bounding box, the spin button's bounding box,
and the autoplay button's bounding box. Then compute and state, per profile: the
reel centre, the banner centre, the viewport centre, the gap from the turbo
button's right edge to the banner's left edge, and the gap from the banner's
right edge to the spin button's left edge.

Fable measured a 902 wide screenshot and found reel centre 405.5, banner centre
428.5, viewport centre 451, an equal step of roughly 23px at each nesting level,
and could not isolate the spin button's left edge from a compressed image. Treat
those as REPORTED and re-derive all of them from the DOM. Also record which
element, if any, the reel is sharing a centred container with, since the FEATURES
button sitting outside the reel is the current suspect for the offset.

CHANGE NO LAYOUT, NO CSS AND NO COMPONENT IN THIS TASK. It is evidence only.

TASK 4: report the unmasked steps, fix nothing
Disjoint currently runs before the scope step, so the job aborts early and about
40 later steps are skipped remotely. Once TASK 1 clears disjoint those steps will
run, some for the first time in this branch's life. Report exactly what they say:
which pass, which fail, and for each failure one line on whether it looks like a
real defect or another gate asserting on something that moved. DO NOT FIX ANY OF
THEM. Write the list to reports/qa/standback-2026-08-15/UNMASKED_STEPS.md.

Separately, record as a finding that a failing early step masks every step after
it, which is now the second time this has hidden information in this branch. Do
not reorder the workflow in this pass.

STOP LINE: close after these four tasks. Do not touch any other finding from the
analysis pass, do not change a tracker status cell, do not alter a player facing
string, and do not begin remediation of anything TASK 4 surfaces.

COMMIT
Stage explicit paths only:
  docs/records/tracks/closed/quality-sweep.manifest
  docs/records/tracks/closed/docs-reskin.manifest
  frontend/scripts/max_win_hold_gate.mjs
  reports/screens/layout-2026-08-15/ (the frames)
  reports/screens/layout-2026-08-15/MEASUREMENTS.md
  reports/qa/standback-2026-08-15/UNMASKED_STEPS.md
  reports/SESSION_REPORT.md
  reports/archive/2026-08-15c_red-clearance-and-layout.md
  reports/briefs/FS_RED_CLEARANCE_2026-08-15_Prompt.md (this brief, verbatim)
Message first line: dead manifests archived, max-win gate asserts behaviour
Run scripts/qa/locked_paths_gate.mjs and doc_currency_gate.mjs; both must pass.
Push to the PR #123 branch, which produces a CI run, and record it per rule 10.
End with a FOR THE NEXT SESSION block.
