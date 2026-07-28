# Session Report - MULTI-TRACK PROTOCOL V3, THE CAPACITY AMENDMENT (2026-07-28)

Brief saved verbatim: `reports/briefs/FS_PROTOCOL_V3_CAPACITY_Prompt.md`, commit
`238ee11`, per conventions (b) and (f). Fresh session on `main`, integrator
role, explicit paths, one job, one work commit. No lock exception was taken and
no locked path was touched.

## THE ONE JOB: the protocol amendment (`238ee11`)

The MULTI-TRACK PROTOCOL was amended in `CLAUDE.md`, which holds the
authoritative text, and mirrored in `WRS_MASTER_DOCUMENT.md` section 3e, with a
change log entry in section 9. The amendment date is 2026-07-28 and the
recorded reason is the owner's capacity change: sessions now run under a large
allowance.

**Rule 4 replaced.** Multi-wave sessions running parallel agent squads per
`docs/skills/FULL_AUDIT_METHOD.md` are now the DEFAULT for audit, verification,
capture, documentation and sweep work. Squads are sized per convention (r), one
coherent surface each, writing to ledger shards consolidated by a marshal, with
the session as sole committer. Sequential single-job sessions remain mandatory
only for locked-file surgery and for any change to the money path, where serial
care outranks parallel speed. The replaced text, *"One job per session by
default, in a fresh context"*, is preserved in the amendment note beside the
rule rather than edited away, because its concern was real and survives in rule
13's wave-boundary stop and in the serial carve-out.

**Rule 13 added, the completion mandate, in the owner's words**: a session that
accepts a brief under open capacity finishes it; honest stops remain lawful
only at wave boundaries with the resume state written, and a session that stops
must state which resource actually ran out, since context no longer will.

**Rule 14 added, the effectiveness mandate**: every brief states the agent
scale expected and the tool inventory available (parallel task agents, web
fetch of the platform mirror sources, Playwright with installed browsers, the
full gate family, the local RGS harness, tesseract, the analyst catalogue
pattern), and sessions optimise their own workflow within the brief rather than
serialising by habit.

## Verification

- The diff was swept for em and en dashes before commit: none in any changed
  line, per the brief's own constraint and the standing dash rule.
- The only other place that restated the old rule 4 was section 3e's table row,
  replaced here. The one remaining occurrence of the old wording in the
  repository is inside `reports/briefs/FS_MULTITRACK_PROTOCOL_V2_Prompt.md`,
  which is a verbatim brief and therefore untouched by design, per convention
  (f).
- The rule numbering in both documents is unaffected: rules 13 and 14 extend
  the sequence, no existing rule was renumbered, so every citation by number in
  session reports, tracker rows and commit messages stays correct.
- Section 3e's table rows 13 and 14 were checked for well-formed pipes against
  the existing two-column format.

## Rule 10 and rule 12 closings

**Rule 10.** The work push (`238ee11`) ran remote CI as run **30341480373**
and it is **green**, all eleven jobs success:
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30341480373

One observation for the expected-run-times table rather than an alarm: the run
took 11.5 minutes wall clock (08:12:59 to 08:24:32 UTC), well outside the
recorded 2.9 to 4.6 minute range, because the `browser: preview server` leg sat
about ten minutes inside `npx playwright install-deps chromium`, the apt step
measured at 12 seconds on a cache hit. It recovered on its own and every gate
passed. The cause is the runner's package mirror, nothing of ours; the leg's
15-minute timeout would have cut it off had it truly hung. Judge against the
range, and know the range has a long infrastructure tail.

The report push's own run is read and recorded in the filled closing appended
at the end of this report, after its result was known.

**Rule 12.** `npm run owner:preview` ran before this report was written:

`OWNER PREVIEW  |  v10 line, main  |  commit 238ee11  |  built 2026-07-28T18:12:51+10:00  |  started 2026-07-28T08:25:15.240Z  |  http://192.168.4.92:5173`

Curled rather than believed: **HTTP 200, 1,256 bytes,
`<title>Future Spinner</title>`**. Per the one-commit-lag clause, the preview
is refreshed once more as the last action of the close, after the final push.

## FOR THE NEXT SESSION

- **Model and effort used**: Fable 5, default effort, single session, one job
  plus the brief save and this report.
- **Approach**: read the standing protocol text in both documents first, then
  the instruments the new rules cite (`docs/skills/FULL_AUDIT_METHOD.md`,
  convention (r), the locked-path list) so the amended text points at things
  that exist; amended `CLAUDE.md` as the authority and mirrored to section 3e;
  preserved the replaced rule 4 text beside the rule, per this repository's
  practice of keeping history honest rather than editing it away.
- **Alternatives tried and rejected**: renumbering or slotting the new rules as
  4a/4b (rejected; rules are cited by number and 13 and 14 simply extend the
  sequence); dropping the replaced rule 4 text entirely (rejected; the
  protocol section itself models preserving superseded content with its
  reason, and the old rule's concern genuinely survives in rule 13).
- **Files touched**: `CLAUDE.md`, `WRS_MASTER_DOCUMENT.md`,
  `reports/briefs/FS_PROTOCOL_V3_CAPACITY_Prompt.md`,
  `reports/SESSION_REPORT.md`,
  `reports/archive/2026-07-28g_protocol-v3-capacity.md`.
- **Open threads**: none opened by this session. The amendment is standing
  policy from `238ee11` forward: briefs now carry an agent scale and tool
  inventory per rule 14, and the final-mile JOBs 3 to 6 handed over by the
  previous session are candidates for a multi-wave session under the new
  rule 4 default.
