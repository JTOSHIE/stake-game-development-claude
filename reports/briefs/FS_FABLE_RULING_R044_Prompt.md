FABLE RULING BLOCK R044: DOC CURRENCY STOP RESOLVED, PR #122 APPROVED
Verified first-hand at main 4a55eaf5 and PR #122 head 67d12fac. Owner paste is
review-lane authorisation. Australian English, no em or en dashes.
1. THE TWO LINES. Records are appended, never rewritten. In CLAUDE.md, after
the pending-deletions note, append: "Executed 2026-08-11: both branches are
deleted. a5b51567 no longer resolves from any branch and remains permanently
fetchable via GitHub's immutable pull ref (git fetch origin
refs/pull/117/head), verified first-hand by Fable. Resurrection for that row
is honoured through that ref." In BRANCH_HYGIENE_2026-08-11.md, add a dated
footnote under the table: "Post-deletion note, 2026-08-11: a5b51567 resolves
only via git fetch origin refs/pull/117/head; c6c34f0a is main's own history
and unaffected."
2. THE GATE. The doc currency DEAD_COMMIT check gains a second-chance
resolver: when a cited SHA fails local resolution, attempt one targeted
git fetch origin <sha> (GitHub serves SHAs reachable from any ref, including
permanent pull refs), re-resolve, and only then report DEAD_COMMIT. Seed per
(p) with a fabricated SHA that must still fail, and show both the rescued and
the failing case in the session report.
3. Commit 1 and 2 together, explicit paths, remote CI verified green per rule
10. That restores full green estate-wide.
4. PR #122: after step 3 lands, rebase the branch onto main, require its CI
full green including the three newly wired legs and the repaired static leg,
merge by rebase, and delete the session branch immediately per (t.1) rule 2.
Its pre-rebase head needs no special handling: refs/pull/122/head preserves
it, which is exactly what the rule 2 resolver now understands.
COMMS-ACK: fold into this session's entry per (t); TR-123 closes on the
merge.== stake-engine.com/teams/we-roll-spinners/games?launch=true&team=we-roll-spinners&game=future-spinner&currency=USD&language=en&deviceType=desktop&balance=1000000000&social=false&math=1&front=7&checklist=false&replay=false&amount=1000000
