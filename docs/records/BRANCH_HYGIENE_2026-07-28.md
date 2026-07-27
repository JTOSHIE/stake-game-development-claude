# Branch hygiene verification, 2026-07-28

Owner's order, `reports/briefs/FS_HYGIENE_AND_REGISTER_Prompt.md` JOB 1.

**Every branch below was verified MECHANICALLY before deletion, and the verification is
recorded here so the deletion is auditable after the heads are gone.** Two independent
checks per branch, both of which must pass:

1. `git rev-list --count origin/main..origin/<branch>` is **0**, so the branch carries no
   commit that main does not already have.
2. `git merge-base --is-ancestor origin/<branch> origin/main` exits **0**, so the branch tip
   is itself an ancestor of main.

The two are not the same question and both are asked deliberately: a branch could in
principle have zero unique commits while its tip is not an ancestor, and a tip could be an
ancestor while the count command was pointed at the wrong ref. Agreeing answers from two
different commands is the point.

| Branch | Tip | Unique commits vs main | Tip is ancestor of main | Deleted |
|---|---|---|---|---|
| `fix/R2R-wallet-contract` | `da4826f` | **0** | **yes** | yes |
| `track/screenshot-analyst` | `bd7894b` | **0** | **yes** | yes |
| `track/docs-reskin` | `c103ca2` | **0** | **yes** | yes |
| `track/quality-sweep` | `c103ca2` | **0** | **yes** | yes |

Verified against `origin/main` at `e7221a3` on 2026-07-27T23:09:40Z.

**Nothing unique was destroyed.** Each tip remains reachable from main by SHA, so any of
these can be resurrected with `git branch <name> <tip>` from the table above if a reason
ever appears.
