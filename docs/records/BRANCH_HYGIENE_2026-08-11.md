# Branch hygiene, 2026-08-11: the ruling (t.1) rule 3 enumeration

Ordered by Fable's standing ruling (t.1) (2026-08-11, saved verbatim at
`reports/briefs/FS_FABLE_RULING_T1_Prompt.md`), rule 3: enumerate every surviving
remote branch with its unique-commit count against `main`, recommend keep or delete
with a one-line reason, and **wait for the owner's OK in chat before deleting
anything**. This record commits direct to `main` under rule 1. Australian English,
no em dashes or en dashes.

Method, so the numbers are checkable: `git fetch origin --prune`, then per branch
`git rev-list --count origin/main..origin/<branch>` (ahead),
`git merge-base --is-ancestor` (ancestry), and `git cherry origin/main
origin/<branch>` (patch-equivalence, where `-` means the patch already exists in
`main` under another SHA, the signature of a rebase-merged head). Enumerated at
`main` tip `c6c34f0a`, 2026-08-11. Every tip SHA is recorded so any deleted branch
can be resurrected with `git branch <name> <tip>`.

## The enumeration: eight branches exist on the remote and that is the whole list

| Branch | Ahead | Tip | Last commit | Verdict proposed |
|---|---|---|---|---|
| `main` | | `c6c34f0a` | 2026-08-11 | The trunk; not in question |
| `claude/collect-prototype` | 0 | `75eff451` | 2026-07-08 | **KEEP without question** (ruling); the zero is misleading, see below |
| `claude/gap-analysis` | 18 | `bcbe1522` | 2026-07-05 | **KEEP without question** (ruling); horizon work |
| `claude/lumen-sideproject` | 38 | `4f4d6ef8` | 2026-07-05 | **KEEP without question** (ruling); a different title, never merges |
| `chore/wip-backgrounds` | 1 | `88df4f9c` | 2026-07-26 | **KEEP**: one genuinely unique docstring fix (`git cherry` `+`), recorded in CLAUDE.md's branch table as unmerged on purpose; deleting it deletes the only copy of that patch |
| `claude/fs-super-prototype` | 1 | `d270019f` | 2026-07-06 | **KEEP**: the Super Buy maths prototype, genuinely unique (`git cherry` `+`), preserved off `main` so a second maths package never sits beside the shipping one |
| `claude/future-spinner-audit-yv55hj` | 1 | `a5b51567` | 2026-08-10 | **DELETE**: auto-named session branch of PR #117, merged at R043 Phase 0; its one ahead commit is patch-identical to `main` (`git cherry` `-`), the pre-rebase duplicate of already-merged content; exactly the (t.1) rule 2 class |
| `claude/remote-control-tv30mf` | 0 | `c6c34f0a` | 2026-08-11 | **DELETE once this session closes**: this session's own auto-named branch; every PR it carried (#118 to #121) is merged and its tip IS `main`'s tip, zero unique commits and zero unique tree; under (t.1) rule 2 it dies on merge, and a future session pushing to the same name simply recreates it |

## The collect-prototype subtlety, restated so the zero is never misread

`claude/collect-prototype` shows ahead 0 and its tip is an ancestor of `main`, both
of which read as deletable. They are not: its tree holds sixteen files under
`origin/claude/collect-prototype:games/future_spinner_collect` (a ref-qualified
path, spelt that way deliberately: the directory exists in that branch's tree
only, not at HEAD) that `main`'s tip does not have, because it is a
named handle on an OLD commit in `main`'s history from before those files were
removed. The full explanation lives in CLAUDE.md's BRANCHES section; it is KEEP by
ruling regardless.

## State

**The owner's OK landed in chat on 2026-08-11** ("OK delete both"), and the two
deletions were then ATTEMPTED from the session and BLOCKED by the environment:
the cloud session's git proxy returns HTTP 403 on any ref deletion (both the
`git push origin --delete <name>` form and the empty-refspec
`git push origin :refs/heads/<name>` form; verified by `git ls-remote --heads`
showing both heads surviving each attempt), and the GitHub MCP toolset carries
`create_branch` but no branch deletion. Commits push fine; only ref deletion is
filtered.

**So the two owner-approved deletions pass to a hand that can reach them**, and
nothing here is guessed at or routed around: either one click each on the
repository's branches page, or two commands in the next session on a machine
with direct push credentials:

```
git push origin --delete claude/future-spinner-audit-yv55hj
git push origin --delete claude/remote-control-tv30mf
```

Both tips are recorded in the table above for resurrection if ever wanted. Once
they are gone, CLAUDE.md's BRANCHES table ("six branches and that is the whole
list") is exactly true again with no edit needed; its dated note pointing here
records the interim.
