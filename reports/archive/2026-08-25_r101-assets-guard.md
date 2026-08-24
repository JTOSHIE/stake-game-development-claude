
# Session Report - R101 ASSETS GUARD: npm run assets is safe by default, and the hazard was measured by running it (2026-08-25)

Brief saved verbatim: `reports/briefs/FS_FABLE_R101_ASSETS_GUARD_Prompt.md`. Branch:
`claude/r101-assets-guard`, review lane, held for Fable and the owner. **THE FENCE HELD:
zero rasters staged or committed, no placeholder touched, no kit, the incoming art directory
read only. The 27 placeholders are byte-for-byte unchanged**, sha256-verified before and
after, aggregate `33b3530734`, the same value R100 recorded.

## Preconditions: all three met

| Precondition | State |
|---|---|
| On `main`, up to date | Yes. R100 merged as `4703280e` |
| Placeholder rasters present | 27, and the aggregate fingerprint matches R100's |
| Pipeline can regenerate | Confirmed by running it in a sandbox: 39 outputs, exit 0 |

## TASK 1: the hazard, measured by running it rather than by reading it

**METHOD, and it is the point of this section.** R097 predicted this hazard by reading
`build.py` as text, and its own method line says so: "Measured from scripts/assets/manifest.json
plus build.py read as text, never executed". That was sound for build.py and wrong for the
command, because **`npm run assets` chains THREE scripts**:

```
build.py && flame_jets.py && symbol_fx.py
```

So this session copied the working tree, including the 27 dirty placeholders, into a sandbox
outside the repository, pointed the real interpreter at the copied scripts so their `ROOT`
resolved into the sandbox, ran all three stages, and diffed by sha256. The repository was
never at risk and the answer is an observation rather than an inference.

### What it does, exactly

**Overwrites 16 of the 27 placeholders**, confirming R097's figure by execution:

| | |
|---|---|
| symbols | h1, h1_base, h1_spin, h2, l1, l2, l3, m1, m2, m3, scatter, tile_plate, wild |
| ui | feature_button, gauge_face, gauge_needle |

**Leaves 11 alone**: both backgrounds, logo, scene_car, scene_character, and the six
remaining UI buttons (btn_autoplay, btn_bet_minus, btn_bet_plus, btn_menu, btn_turbo,
spin_button).

**Creates 17 files absent from HEAD, not 15.** Ten symbol _1x variants, four brand_mark
files, gauge_base, **and two that R097 could not see**: the reduced-motion still frames
l2_fuse_static and m3_flame_static, written by symbol_fx.py at its lines 99 and 116. That
script does not name them in its own summary line, so even reading its output would not
reveal them. R097's ten, four and one are all confirmed.

**Exit code on that run: 0.** Nothing warned, nothing prompted.

### Was there already a safety check? No, and not nearly.

Across all three generators: no argparse, no `sys.argv` read, no environment variable, no
dry-run, no `--force`, no existence check, no mtime check, no git check, no confirmation.
`build.py` does not import `os` at all, so an env-var check was structurally impossible in
it before this change. The single conditional in `build.py` guards the INPUT masters
directory, not the output.

## TASK 2: the guard

**New file: `scripts/assets/asset_guard.py`.** It refuses when TRACKED files under the asset
output root differ from HEAD, prints an operator-facing message, and exits 2. Nothing is
written.

**THE SHAPE IS THE PROJECT'S OWN, NOT AN INVENTION.** Convention (u) already established
this idiom for `scripts/assets/source_registry.py`: a shared module every generator asks
before acting, which refuses loudly. This is the same shape applied to the output side, and
it is called by all three generators rather than by a wrapper, so **it cannot be bypassed by
running one script directly instead of going through npm**.

**THE OVERRIDE IS AN ENVIRONMENT VARIABLE, deliberately:**

```
ALLOW_ASSETS_OVERWRITE=1 npm run assets
```

None of the three generators takes arguments, so a flag would have to be added to all three
and would still only guard the npm route. An env var read inside the guard covers every
route into the code. An empty value and the value `0` do NOT disarm it, so a stray export in
a shell profile cannot switch the guard off for good.

**Scope, and it is deliberately narrow.** Only tracked files under the asset output root.
Untracked files there are not guarded, because creating a file destroys nothing and the
generators create files as their normal product. Dirt outside the asset root is ignored: a
guard that fired on an unrelated edit would be switched off within a week.

**Ignorance is distinguished from cleanliness.** If git cannot be consulted, `at_risk`
returns `None` rather than an empty list, and the guard proceeds while saying so on stderr.
A non-git checkout cannot hold uncommitted work, so proceeding is correct; announcing it is
what keeps the module honest about the difference.

## TASK 3: the self-test, and the end-to-end proof

**`asset_guard.py --self-test`: 9 of 9.** It builds a REAL throwaway git repository and
makes real commits in it, rather than calling the predicate with hand-made strings, for the
reason `locked_paths_gate.mjs` already records: git plumbing is where a path-matching guard
actually goes wrong, so the plumbing is what is tested. The seeded defect is a tracked asset
raster replaced in the working tree and not committed, which is exactly the state the 27
placeholders are in.

The controls are what make the refusals mean something: a clean tree passes, untracked
output does not trip it, dirt outside the asset root is ignored, a deleted tracked asset is
protected, both falsey override values still refuse, and a non-repository returns ignorance
rather than cleanliness.

**Wired into CI**, in the static gates job beside the other seeded-violation self-tests. It
is stdlib only, so it needs no venv and no image libraries, which is why it can run there
for about a second.

**The three brief requirements were also proved END TO END**, in a sandbox git repository so
the real tree was never involved:

| State | Result |
|---|---|
| Clean tree | `build.py` exit 0, ran normally |
| Dirty placeholder | exit 2, refused, **file preserved byte-for-byte** |
| `ALLOW_ASSETS_OVERWRITE=1` | exit 0, proceeded, file overwritten, notice printed |

**And on the live repository:** `npm run assets` now exits 2 and refuses over all 27
placeholders. Because the npm script chains with `&&`, stages 2 and 3 never run, verified by
checking that the flipbook sheets they write are unchanged. The 27 placeholders were
re-fingerprinted afterwards and are identical.

## A reassurance nobody had checked

**The protected KEEP asset, hero_emblem_512.png, is itself a pipeline output**, exported by
`build.py` from the brand master. Every arc-2 brief has said not to touch it. The sandbox run
shows the pipeline reproduces it, and `hero_icon_96.png` beside it, **byte-identically**. It
was never at risk from regeneration.

## Verification

Asset guard self-test 9/9. Source registry self-test PASS. Generate self-test 21/21, unchanged,
as a control. Doc currency PASS with 0 new claims. Locked paths PASS. Explicit paths per (k).
Zero rasters staged.

**One instrument error, caught and corrected before it reached a claim.** A first sweep for
other unguarded writers counted `.save(` calls per file and reported `r048_masters.py` as an
unguarded writer to the shipped tree. Reading it showed the opposite: those four placeholder
paths are its `SRC` inputs, which it READS, and its `OUT` is `reports/art/r048`. The count
was measuring write calls anywhere rather than writes to the output root. Re-measured against
each script's actual destination constant.

## ESCALATIONS

**E1 (R101). Three background scripts write into the same protected tree and are NOT
guarded**, and this is a deliberate scope decision rather than an oversight.
`scripts/assets/backgrounds.py`, `scripts/assets/background_overdrive_derive.py` and
`scripts/assets/background_candidate_ingest.py` all write into the backgrounds directory,
which holds 2 of the 27 placeholders, precisely the two `npm run assets` does not touch.
They were left alone because the brief scoped this to `npm run assets` and said not to
broaden the guard, and because their risk profile genuinely differs: each takes deliberate
command-line arguments, so invoking one is an explicit act, where `npm run assets` is a
routine command that looks harmless. R091 legitimately ran the derive script while
placeholders were in the tree. **If the owner wants them guarded it is one import and one
call each**, and the guard already supports it.

**E2 (R101). R097's "recreates 15" is superseded by a measured 17.** Recorded rather than
silently corrected, because R097's number is cited in its own escalation ledger and in comms
entry 095. The cause is worth keeping: it read the first of three scripts.

**E3 (R101). The 17 recreated files include at least one the art manifest calls DEAD.**
`scripts/assets/manifest.json` still exports `scene_character_car.png`, whose art-manifest
row is DEAD. An override run would put deliberately-absent files back into the tree. Not
fixed here: pruning the generator manifest is an art decision.

**Carried forward:** R100's E1 (no OpenAI client) and E3 (M3 identity conflict across three
documents) stand, as do R099's E2 and E3. R097's E1, the `npm run assets` hazard, is
**CLOSED by this session**.

## FOR THE NEXT SESSION

**The 27 placeholders are untouched and are now protected from the command that threatened
them.** Kit packaging stays forbidden while any placeholder differs from HEAD.

The remaining route to the same tree is the three background scripts in E1. Everything else
that writes there is now guarded.

Model and effort: one session, unattended, review lane, high care. Four read-only mapping
lenses plus a sandbox execution that produced the ground truth. Seven files changed, no
raster and no placeholder touched.
