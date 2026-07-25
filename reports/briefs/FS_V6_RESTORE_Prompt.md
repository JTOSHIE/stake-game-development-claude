# FS_V6_RESTORE_Prompt.md

Saved verbatim per conventions (b) and (f). Relayed by the owner from Fable, 2026-07-25.

---

FS_V6_RESTORE_Prompt.md. Save this brief verbatim to reports/briefs/ and commit it with the work below. Explicit paths only, never git add -A or commit -a. Standard locks apply throughout; git diff .claude/settings.json must be empty at every commit. Australian English, no em or en dashes anywhere.

CONTEXT. The owner has directed that the project operating instructions return to the repository root. The authoritative copy is reports/archive/superseded/CLAUDE_PROJECT_INSTRUCTIONS_v6.md, which carries convention (m) and the 2026-07-13 platform conformance work order addendum. That committed copy, not any pasted variant, is the text to restore. Do not retype, regenerate or reflow the file; move it so the bytes are preserved.

JOB 1, RESTORE. Record the SHA-256 of reports/archive/superseded/CLAUDE_PROJECT_INSTRUCTIONS_v6.md (expected 2cd7797531f9bb4b735d393ad00b487e286cdcea97b605c60bf3d99261a05384). Then git mv reports/archive/superseded/CLAUDE_PROJECT_INSTRUCTIONS_v6.md CLAUDE_PROJECT_INSTRUCTIONS_v6.md. Record the SHA-256 of the root copy; the two hashes must be identical and both go in the session report. A mismatch stops the job.

JOB 2, INDEX AND REFERENCES. In reports/archive/superseded/INDEX.md, replace the CLAUDE_PROJECT_INSTRUCTIONS_v6.md row's successor entry with: restored to the repository root on 2026-07-25 by owner instruction; ACTIVE there as the project operating frame. Leave the v5 row unchanged. Prepend a two-line SUPERSEDED banner to reports/archive/superseded/CLAUDE_PROJECT_INSTRUCTIONS_v5.md pointing at CLAUDE_PROJECT_INSTRUCTIONS_v6.md at the repository root, because v5's own header still reads ACTIVE, which is stale. Update any live root document whose link targets the old archived v6 path (HANDOVER_2026-07-25_Fable.md is known to) so it points at the root copy. Touch nothing else in reports/archive/ and never edit reports/FABLE_COMMS.md entries; it is append-only.

JOB 3, DIVISION OF AUTHORITY. Append a dated section to reports/SESSION_REPORT.md, plus the dated archive copy per standing convention, recording: v6 supersedes v5, which remains archived under reports/archive/superseded/; v6 at the root is the stable project operating frame and is pinned verbatim in the owner's Claude project for Fable check-ins; CLAUDE.md remains the builder's conventions document and continues to accumulate conventions beyond v6, already including (n); where the two conflict on builder conduct, CLAUDE.md governs; live project state is always read from the repository, never from either instructions document. Add the same division-of-authority note as a short paragraph near the top of CLAUDE.md if an equivalent note is not already present; if one is, leave it as is and say so in the report.

JOB 4, COMMIT. One commit, explicit paths only: CLAUDE_PROJECT_INSTRUCTIONS_v6.md, reports/archive/superseded/INDEX.md, reports/archive/superseded/CLAUDE_PROJECT_INSTRUCTIONS_v5.md, HANDOVER_2026-07-25_Fable.md, CLAUDE.md, reports/SESSION_REPORT.md, the dated session report archive copy, and reports/briefs/FS_V6_RESTORE_Prompt.md. Verify git diff .claude/settings.json is empty immediately before committing. End the session report section with a FOR THE NEXT SESSION block.
