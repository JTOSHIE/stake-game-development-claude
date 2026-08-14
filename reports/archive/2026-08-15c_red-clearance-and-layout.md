# PR 123 red clearance and layout evidence, 2026-08-15d

Archive copy of the section in `reports/SESSION_REPORT.md`, per convention (a).
Nothing is edited between the two.

---

# Session Report - PR 123 RED CLEARANCE AND LAYOUT EVIDENCE (2026-08-15d)

Brief saved verbatim at `reports/briefs/FS_RED_CLEARANCE_2026-08-15_Prompt.md`.
Branch `track/standback-2026-08-15`, the PR #123 branch, as ordered. Australian
English, no em dashes or en dashes. Explicit-path commits. Locked paths untouched.

## TASK 1: the two dead manifests are archived, not deleted

`git mv` moved both into `docs/records/tracks/closed/`, each under a note recording
that its branch was deleted on 2026-07-28 with the verification at
`docs/records/BRANCH_HYGIENE_2026-07-28.md` and that the file is kept as a closed
record. **Nothing was deleted.**

**The disjoint check no longer sees them, measured rather than assumed:**

```
DISJOINT: 2 manifest(s), 4472 tracked file(s), 0 file collision(s), 0 shared glob(s)
  screenshot-analyst: 13 glob(s)
  standback-2026-08-15: 35 glob(s)
```

The check reads `docs/records/tracks/` with a non-recursive directory listing, so a
manifest one level down under `closed/` is a record rather than a live claim. The
brief's fallback, moving them to `reports/archive/tracks-closed/` instead, was
therefore not needed and was not used.

## TASK 2: the max-win hold gate asserts behaviour now

**The static string count is gone.** In its place, `spinDisabledPerProfile` drives
each of the four layout profiles and reads the rendered control off the DOM.

**The four profiles were read out of the component and its caller, not assumed.**
HudOverlay branches `{#if portrait}`, `{:else if miniPlayer}`,
`{:else if compactLandscape}`, `{:else}`, one SPIN button each with its own class,
and App.svelte computes the three props:

| Profile | Button | Selected by | Viewport driven |
|---|---|---|---|
| portrait | `.p-spin` | `innerHeight > innerWidth` | 390x844 |
| miniPlayer | `.m-spin` | `innerWidth <= 480` and `innerHeight <= 300` | 400x225 |
| compactLandscape | `.c-spin` | not mini, `innerHeight < innerWidth`, `innerHeight < 500` | 900x450 |
| fullscreen | `.fs-spin` | the `{:else}` branch | 1280x720 |

Three assertions per profile: exactly one SPIN control is mounted, the mounted one
carries that profile's own class so the viewport really selected the branch under
test, and its DOM `disabled` property AND attribute are both true at wincap.
**Twelve assertions, all green against the current build**, so there is no finding
to record under the brief's "if it goes red" clause.

**The seeded self-test, convention (p).** The seed severs the `$isWincap ? true`
arm on ONE instance in a scratch copy of `HudOverlay.svelte`, rebuilds to the
gitignored scratch tree, and restores the working file in a `finally` that then
verifies it byte for byte. The seeded run reports:

```
  FAIL    portrait 390x844: the p-spin SPIN control is DISABLED at wincap,
          read from the DOM (property false, attribute false)
  ok      fullscreen 1280x720: the fs-spin SPIN control is DISABLED at wincap ...
  caught  the p-spin instance is reported enabled at wincap, by name
  ok      and the fs-spin control instance stayed green in the same run
```

The paired control matters as much as the seed: an assertion that failed
everything would "catch" a seed it never looked at.

**And the non-zero exit is demonstrated rather than argued.** `FS_SPIN_SEED=<0..3>`
points a REAL gate run at a severed build. Run with `FS_SPIN_SEED=2` it printed
`compactLandscape 900x450: the c-spin SPIN control is DISABLED at wincap (property
false, attribute false)`, then `MAX WIN HOLD GATE: FAIL (1)`, and **exited 1**.

**No component was changed.** `git diff` on `HudOverlay.svelte` is empty at close,
and the seed's own restore check would have refused to continue otherwise.

## TASK 3: layout evidence, and the REPORTED figures do not reproduce

Frames and `MEASUREMENTS.md` at `reports/screens/layout-2026-08-15/`, with the raw
reading beside them in `_measurements.json`. Nothing was changed.

**Desktop 1280x720, viewport centre 640.00:**

| | left | right | centre |
|---|---|---|---|
| painted reel frame `.game-frame` | 320.00 | 960.00 | **640.00** |
| reel frame `.grid-slot` | 379.00 | 901.00 | **640.00** |
| banner slab `.fs-panel` | 309.00 | 1020.00 | **664.50** |
| turbo | 227.00 | 309.00 | 268.00 |
| spin | 1027.00 | 1111.00 | 1069.00 |
| autoplay | 1111.00 | 1159.00 | 1135.00 |

Gap turbo right to banner left: **0.00**. Gap banner right to spin left: **7.00**.

**Mobile S 320x568, the portrait profile the project already uses, viewport centre
160.00:** painted frame, reel, banner slab and features bar all measure a centre of
**160.00**. The two gaps read -104.00 and -182.00 because in portrait the turbo and
spin are CHILDREN of the slab, so those figures are containment rather than
separation, and the report says so.

**THE REEL IS NOT OFF CENTRE.** The painted frame and the slot both measure 640.00
against a viewport centre of 640.00, to the hundredth of a pixel, at desktop, and
160.00 at portrait. **The only element off centre anywhere in the two profiles is
the desktop banner slab, at +24.50px right.** Fable's REPORTED reading, reel 405.5,
banner 428.5, viewport 451 with an equal 23px step at each nesting level, scales to
575.4 and 608.1 against a viewport centre of 640, and neither figure is what the DOM
holds. The equal-step pattern is not present at all: the steps are 0.00, 0.00 and
+24.50.

**The FEATURES suspect is refuted for the reel.** `.fm-entry` IS a sibling of
`.grid-slot` inside `.canvas-inner`, along with the logo box, the scene group, the
painted frame and the jets holder. But that container computes `display: block` with
`justify-content: normal`, so it does not distribute its children, and the reel
measures dead centre with the FEATURES entry present. The whole ancestor chain
measures a centre of 640.00 at every level. The slab is in a different subtree and
is where the offset lives.

## TASK 4: the unmasked steps

`reports/qa/standback-2026-08-15/UNMASKED_STEPS.md`. All 69 static steps were run
locally against this exact tree in workflow order: **67 pass, one skipped as an
install step, one fails.**

The single failure is `dist hygiene, no documentation ships`, on
`cleanTree: stamp says false, expected true`. **It is a local artefact and cannot
occur in CI**: the step runs after `production build`, the build stamps whether the
tree was clean, and this local sequence built while the pass's own uncommitted work
was present. Every one of that gate's seeded self-tests passed in the same
invocation, including both negative controls.

**THE FINDING, recorded as the brief asks: a failing early step masks every step
after it, and this is the second time on this branch.** Run 31815432853 aborted at
step 3 and hid about 66 steps; runs 31836692899 and 31837837541 aborted at step 5
and hid about 65. A red at step 3 and a red at step 65 are indistinguishable from
outside the job. **The workflow was not reordered**, per the stop line; two possible
shapes are named in the report for a remediation pass to weigh.

## Verification

- `scripts/qa/locked_paths_gate.mjs`: **PASS**, and the disjoint half now passes too.
- `scripts/qa/doc_currency_gate.mjs`: **PASS**, 0 new.
- `max_win_hold_gate.mjs`: PASS, 12 new assertions green.
  `max_win_hold_gate.mjs --self-test`: PASS, every seed caught including the new one.
- No component, no player-facing string, no tracker status cell and no locked path
  was touched.

**ONE DEPARTURE FROM THE BRIEF'S STAGED LIST, declared rather than slipped in.** The
track manifest is not on the brief's list, but the branch now touches the two old
manifest paths, `docs/records/tracks/closed/`, the gate, the frames and this brief,
and the scope check fails on any path the manifest does not declare. It is extended
by exactly those paths and by nothing else, and its superseded header note is marked
superseded rather than deleted.

## FOR THE NEXT SESSION

Model and effort: Claude Fable 5, judgement tier, one session, on the PR #123 branch.
Approach: move rather than delete, read the profiles out of the component before
driving them, prove the seed with a real non-zero exit rather than by argument, and
measure the layout from the DOM before believing a figure taken off an image.
Alternatives tried and rejected: patching the built bundle to seed the gate, which
would prove only that the gate catches an edit to a file nobody ships from, so the
seed rebuilds from a scratch copy of the source instead; and reporting the local
`dist hygiene` red as a finding, which it is not, since the stamp truthfully
recorded a dirty local tree.

**What the next session decides, in this order:**

1. **The desktop banner slab's +24.50px.** It is now measured rather than suspected,
   and the reel is proven not to be the cause. The slab measures 711.00 wide where
   its own comment describes 688. Whether it moved, grew, or the comment is stale is
   not established and was not guessed at.
2. **Whether the static job should stop masking its own later steps.** Two shapes are
   named in `UNMASKED_STEPS.md` and neither was applied.
3. **The paragraph-level archive gaps** from the previous pass, still unrepaired.
4. Everything the analysis pass left open: the money surfaces, the bet ladder, the
   eight v7 clauses, the 68 register mismatches and TR-148 item 4.
