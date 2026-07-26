# Track session reports

One directory per track. A track session writes its report to
`reports/tracks/<track>/SESSION_REPORT.md` and **not** to
`reports/SESSION_REPORT.md`.

## Why this exists

MULTI-TRACK PROTOCOL rule 8: track session reports are dated **and**
track-tagged sections, and the integrator "merges PRs one at a time and resolves
report conflicts by concatenation, never by discarding a section."

Concatenation is the ruled outcome, so the mechanism is arranged to make it
mechanical rather than a merge argument. Two tracks appending to one
`reports/SESSION_REPORT.md` collide on every pull request, and the pressure at a
collision is always to drop one side. A per-track file cannot collide, so the
integrator's job is to append rather than to adjudicate.

It also settles a smaller conflict. Convention (a) requires every session to
write `reports/SESSION_REPORT.md`, and no track manifest includes that path, so
a track literally could not satisfy the convention. This is how it satisfies it:
the track writes its section here, and the integrator lands it in the main report.

## The integrator's job

On merging a track's pull request, copy that track's section into
`reports/SESSION_REPORT.md` as a dated and track-tagged section, in merge order,
and copy it to `reports/archive/` per convention (a). **Append. Never rewrite,
summarise or drop a section**: two tracks' reports are two accounts of two pieces
of work, and a merge that keeps one has destroyed evidence to save a scroll.

The per-track file stays where it is after the merge. It is the track's own
record and it is cheap to keep.
