# browser: max-win hold, run 31815432853: diagnosis

TASK 5 of `reports/briefs/FS_REPORT_REVERT_2026-08-15_Prompt.md`, 2026-08-15.
**Diagnosis only. The gate was not changed and the component was not changed.**
Australian English, no em dashes or en dashes.

---

## The diagnosis, in one paragraph

**It is the gate asserting on the old store's IDENTITY, not the button's rendered
disabled state, and not a behavioural regression.** The failing item is the static
assertion named "the SPIN control is disabled by state during the hold, not merely
covered" at `frontend/scripts/max_win_hold_gate.mjs:204`, and its check is a source
literal count rather than a rendered-state read: it requires the exact text
`disabled={$isWincap ? true : ($isSpinning ? false : !$canSpin)}` to appear four times in
`frontend/src/lib/components/HudOverlay.svelte`. PR #123 renamed that store at those four
bindings to `$canAffordSpin`, so the count falls to zero and the assertion reports FAIL,
while the expression's SHAPE is untouched: measured on both trees, `90f21280` carries the
`$canSpin` literal four times and zero of the new form, and `59c4c88e` carries the
`$canSpin` literal zero times and
`disabled={$isWincap ? true : ($isSpinning ? false : !$canAffordSpin)}` four times, which
is the same ternary with the same `$isWincap ? true` first branch that the assertion
exists to protect. The behaviour is not merely unchanged, it is strictly stronger, since
`canAffordSpin` accounts for the mode cost that `canSpin` ignores; and the gate's own
RUNTIME assertions on the same run all passed, including no `/wallet/play` and no
`/wallet/end-round` during the hold and a real COLLECT click dismissing it, so the only
thing that changed is the identifier the static check is pinned to.

## The evidence, measured rather than argued

| Reading | `main` at `90f21280` | PR head `59c4c88e` |
|---|---|---|
| `disabled={$isWincap ? true : ($isSpinning ? false : !$canSpin)}` | **4** | **0** |
| `disabled={$isWincap ? true : ($isSpinning ? false : !$canAffordSpin)}` | 0 | **4** |
| the gate's assertion at `frontend/scripts/max_win_hold_gate.mjs:206` | passes | **fails** |
| the gate's runtime assertions on run 31815432853 | not run on this branch | **all passed** |

The run log's own ordering says the same thing: every dynamic check printed `ok`, the
balance and win held across 60 samples, zero wallet calls landed during the hold, and a
real COLLECT dismissed it; the single failing line is the static one.

## The fix, named as the brief asks, and NOT applied

The gate's `check` and its `seed` at `frontend/scripts/max_win_hold_gate.mjs:206-208` both
name `$canSpin` and both need the new store name, or better, a pattern that matches the
store-independent part of the expression. **Changing that is a gate edit, which this brief
forbids, so it stops here.**

Two things a remediation pass should weigh before making that edit, because the obvious
one-word change would leave the same trap set:

1. **A source-literal assertion breaks on every rename, including a correct one.** This is
   the second time the estate has paid for a gate reading a name rather than a behaviour.
   Matching `disabled=\{\$isWincap \? true :` and counting four would assert the part that
   carries the meaning, the wincap-first branch, and survive any rename of the
   affordability store.
2. **The gate's own title says "by state", and the runtime half already proves it.** If
   the dynamic assertions are considered sufficient, the static one is a belt that now
   costs a red run on a rename; if they are not, the static one should read the rendered
   `disabled` property in the browser rather than the source text.
