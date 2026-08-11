FABLE APPROVAL BLOCK: PR #120 (ack line, docs-only) PLUS STANDING LANE RULING
Verified first-hand at branch head 383833db9c4f091f17888efab27065a4039002ca.
Scope confirmed: two files under reports/, 14 insertions, entry 048 exact.
APPROVED TO MERGE on CI green (run 31444578358 reported green; watcher
confirms).
STANDING RULING, effective on this merge, record in CLAUDE.md conventions:
a PR whose entire diff is append-only record files (FABLE_COMMS,
SESSION_REPORT plus its dated archive, verbatim brief saves under
reports/briefs/, and tracker rows recording already-ratified dispositions)
is GREEN LANE: it merges on its own CI green with no Fable approval block,
and Fable verifies it retrospectively at the next check-in per session start
protocol. Dedicated ack PRs end here: the closing ack of any merge is folded
into the next substantive FABLE_COMMS entry instead of riding its own PR.
Anything touching code, gates, locked paths, player-facing text or rulings
remains review lane unchanged. COMMS-ACK 048 for this merge is therefore the
first line of the L1 session's comms entry, not a new PR.
