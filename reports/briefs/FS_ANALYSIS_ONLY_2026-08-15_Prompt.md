WE ROLL SPINNERS: ANALYSIS ONLY PASS, 2026-08-15

Branch: fresh read only branch off main at 90f2128. Australian English. No em
dashes or en dashes anywhere, including in committed documents.

THIS PASS WRITES NO CODE. Hard stop lines, all of them absolute:
  - No edit to anything under frontend/src/
  - No edit to any player facing string in i18n/
  - No edit to games/future_spinner/ (read only, for computation only)
  - No edit to rgsService.ts, gameStore.ts, .claude/settings.json
  - No gate is written, wired, or modified
  - No tracker status cell is changed, no disposition is closed
The only files this pass may create are the report artefacts named under COMMIT.
If a job would require a write outside those, stop and record it as a finding.

CONTEXT
Fable reviewed the stand back audit at PR #123 head 59c4c88 against main
90f2128 and found the audit sound in its code and unreliable in its coverage
claims. Six items could not be reached from Fable's container. This pass closes
those and produces a census. It fixes nothing.

PREMISES, tag each as you check it
  - main is at 90f2128 and PR #123 is unmerged. VERIFIED by Fable 2026-08-15,
    reconfirm at start and record if it has moved.
  - BET_LEVELS in gameStore.ts is [0.10, 0.20, 0.50, 1.00, 2.00, 5.00, 10.00,
    20.00, 50.00, 100.00]. VERIFIED by Fable.
  - The real platform ladder observed in the owner's live portal session is
    0.01, 0.02, 0.05, 0.10, 0.20, 0.40, 0.60, 0.80, 1.00, 1.20, 1.40, 1.60,
    1.80, 2.00, 3.00, 4.00, 5.00, 6.00, 7.00, 8.00, 9.00, 10.00, 12.00, 14.00,
    16.00, 18.00, 20.00, 30.00, 40.00, 50.00, 75.00, 100.00. REPORTED from an
    owner screenshot, not from the repository.
  - MODE_COST is base 1, cruise 1, antelite 1.25, bonus 100, super 400.
    VERIFIED by Fable against index.json and statistics_summary cost_mapping.

JOB 1: complete money surface census. HIGHEST VALUE, do this first.
Do not grep for formatter names alone. Enumerate every element that renders a
monetary value to a player, by walking the components rather than by pattern.
For each, record: file and line, what the value is, which formatter it reaches
(including through helpers and through any path that bypasses both formatters),
and whether the value can be fractional at any bet level times any mode cost,
using the real platform ladder above rather than BET_LEVELS. Fable found five
cost sites of which the stand back fixed two; confirm or refute that count and
find any site Fable's grep could not see. Write the census as a table.

JOB 2: TR-136 gate coverage delta
Read frontend/scripts/r057_subcent_proof.mjs and list exactly which surfaces it
drives. Set that against the JOB 1 census and produce the delta: every money
surface that can render a fractional value and is not asserted by any gate.
Record the premise stated in SessionPanel.svelte above the Total Won row, that
stakes are bet ladder values and whole currency units by construction, and state
plainly whether antelite at 1.25x falsifies it. Do not modify the gate or the
comment.

JOB 3: the three unreachable checks
  3a. Report the remote CI status of PR #123 head 59c4c88: which checks ran,
      which passed, and whether rule 10 was satisfied for that commit.
  3b. Inspect .claude/worktrees/trusting-colden-055579 without modifying it.
      Report the branch, whether the tree is dirty, whether it holds commits not
      on any pushed branch, and a recommended disposition. Do not delete it.
  3c. Confirm content coverage for two session report headings that Fable could
      resolve only by filename: "ADDENDUM: REMOTE CI AND OWNER PREVIEW" and
      "ADDENDUM: the close, and a fourth thing that went wrong". Prove by
      content match against reports/archive/, not by filename.

JOB 4: bet ladder divergence
Compare BET_LEVELS against the real ladder above. Report every level invented,
every level missing, and state whether the fallback ladder contains the platform
minimum. Then trace what actually reaches the player when the authenticate
response omits betLevels, per betLadder.ts, and state what breaks. Analysis only.

JOB 5: operating frame accuracy
Read CLAUDE_PROJECT_INSTRUCTIONS_v7.md clause by clause against the repository
at HEAD. List every clause that misstates the repo. Fable already found two,
convention (f) on LOCKED_FILE_DEBTS and convention (g) on Math.floor; confirm
both and find the rest. Do not edit the document.

JOB 6: consolidated open register
Produce one table of every item currently open across
docs/records/reviews/REVIEW_TRACKER.md, reports/qa/stream_test/KNOWN_OPEN.md,
docs/QUALITY_CHARTER.md, COMPLIANCE_WATCH.md, and the stand back ledger at
reports/qa/standback-2026-08-15/LEDGER.md. For each: id, one line summary,
where it is recorded, and whether its recorded status matches HEAD when you open
it first hand. Flag every mismatch. Change no status cell.

DEGRADATION ORDER: if short, deliver JOB 1, then 2, then 6, then 3, then 4,
then 5. Anything below the cut is listed as NOT RUN with its resume state.

STOP LINE: close after the report is written. Do not begin remediation of
anything found, however small or however obvious the fix. If a finding looks
urgent, write it at the top of the report under HEADING: URGENT and stop.

COMMIT
Create only:
  reports/qa/analysis-2026-08-15/FINDINGS.md
  reports/qa/analysis-2026-08-15/MONEY_SURFACE_CENSUS.md
  reports/qa/analysis-2026-08-15/OPEN_REGISTER.md
  reports/SESSION_REPORT.md
  reports/archive/2026-08-15b_analysis-only-pass.md
  reports/briefs/FS_ANALYSIS_ONLY_2026-08-15_Prompt.md (this brief, verbatim)
Stage those explicit paths only. Never git add -A. Never commit -a.
Message first line: analysis only pass, no changes, census and open register
Run scripts/qa/locked_paths_gate.mjs and confirm it passes with no sanction
token. Push and record the remote CI run per rule 10. End with a FOR THE NEXT
SESSION block listing what a remediation pass would need to decide first.
