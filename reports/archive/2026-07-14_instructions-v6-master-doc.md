# Session Report: Project instructions v6 + WRS_MASTER_DOCUMENT.md creation

- **Date:** 2026-07-14
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/master-doc-and-instructions-v6` (off `main`).
- **Source:** pasted brief (Fable-authored operating instructions text plus the
  WRS master document register), executed verbatim per convention (c)/(f).

## What changed this pass

1. **`CLAUDE_PROJECT_INSTRUCTIONS_v6.md`** (new, repo root): saved verbatim exactly
   as supplied. **v6 supersedes v5** (`CLAUDE_PROJECT_INSTRUCTIONS_v5.md`, dated July
   2026, itself marked "Supersedes v4 and all earlier versions") - v5 is left in place
   as historical record, not deleted, consistent with this project's practice of
   marking supersession rather than removing prior versions. The pasted text itself
   states the same supersession relationship implicitly by its version number and
   date (2026-07-13) being newer than v5's.
2. **`WRS_MASTER_DOCUMENT.md`** (new, repo root): saved verbatim exactly as supplied.
   This resolves an open gap flagged in JOB 6 of the prior consolidated work order
   (`reports/archive/2026-07-14_job6-audit-refresh.md` and this session's own
   `AUDIT_PACK_INDEX.md`): the document was referenced by an earlier brief and by
   `CLAUDE_PROJECT_INSTRUCTIONS_v6.md` section 2 and section 4 (VERIFIED STATE /
   DOCS line) but did not exist anywhere in the repository. Confirmed absent again
   immediately before writing it (`test -f WRS_MASTER_DOCUMENT.md`) so as not to
   silently overwrite anything.

## Not done this pass (flagged, not silent)

- **The pinned Claude project instructions on claude.ai are NOT updated by this
  session.** That is a claude.ai project-settings UI action outside any tool
  available to a repository-writing session; the owner needs to paste the same v6
  text into the project's pinned instructions themselves. Everything else the brief
  asked for (verbatim save, commit, session-report note) is done.

## Verification

- Grepped both new files for em dash/en dash Unicode characters (`\xe2\x80\x94`,
  `\xe2\x80\x93`): zero matches in either file, consistent with convention (a).
- Confirmed `CLAUDE_PROJECT_INSTRUCTIONS_v5.md` exists and is unmodified (superseded
  in name only, left in place as historical record).
- Confirmed `WRS_MASTER_DOCUMENT.md` was genuinely absent before this pass.
- Locked files confirmed untouched: `git diff --stat -- frontend/src/lib/services/rgsService.ts frontend/src/lib/stores/gameStore.ts games/future_spinner/ .claude/settings.json` is empty.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** treated both
  documents as pure verbatim saves per the explicit instruction - no rewording, no
  reformatting, no "helpful" additions - and used the two-step verification (grep for
  banned punctuation, confirm no silent overwrite) rather than assuming a pasted brief
  is automatically clean.
- **Alternatives rejected:** deleting or archiving `CLAUDE_PROJECT_INSTRUCTIONS_v5.md`
  now that v6 exists (rejected - this project's convention is to mark supersession,
  not delete prior versions, matching how HANDOVER.md and other superseded docs are
  handled); attempting to reach claude.ai's project settings via any available tool to
  update the pinned instructions directly (rejected - no such tool exists in this
  session; flagged above as an owner action instead of silently skipped).
- **Files touched:** `CLAUDE_PROJECT_INSTRUCTIONS_v6.md` (new), `WRS_MASTER_DOCUMENT.md`
  (new), this report + its dated archive copy. Locked files untouched.
- **Open threads:** owner needs to paste the v6 text into the claude.ai project's
  pinned instructions themselves (not something a repo-writing session can do);
  `WRS_MASTER_DOCUMENT.md`'s own change log (section 9) still shows only its
  2026-07-13 creation entry and its status table reflects state as of PR #54 - a
  future session should append a dated section 9 entry and refresh section 3's status
  table once PRs #56-#63 (Jobs 1-8 of the prior work order) are merged, since several
  rows (audio provenance, QA re-soak, budget re-verify, dossier section 5, tile
  layers) moved from OPEN/IN PROGRESS toward DONE during that arc but this document
  did not exist yet to reflect it.
