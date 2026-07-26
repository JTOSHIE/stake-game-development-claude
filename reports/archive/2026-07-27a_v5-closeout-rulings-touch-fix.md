# Session Report - V5 CLOSEOUT, THE TWO RULINGS AND THE TOUCH FIX (2026-07-27)

Brief saved verbatim: `reports/briefs/FS_V5_CLOSEOUT_Prompt.md`. Fresh session on
`main`, integrator role, explicit paths, commit per job, no lock exceptions and
none needed: all four locked paths clean in `git status` throughout and
`git diff .claude/settings.json` empty. Five jobs, and the brief justifies the
multi-job shape itself: each is small and two of them are the owner's ruling
lines arriving with the paste.

The rulings were **TITLE: DROP** and **BG: V1**.

## Summary

All five jobs complete. Kit V5 is on the Desktop, built from a fresh clone at
`ffdd7dc4`, with all three dist gates green inside the clone.

**One thing about the BG ruling is worth stating first, because it is a
deviation from the brief and it was decided rather than assumed.** JOB 2
enumerates three branches, V2, ENHANCED and KEEP. The owner replied **V1**,
which is none of them. V1 is the other candidate ingested last session, and the
owner saw it live: the local-session steps included `?bg=v1` for exactly that
purpose. It measures the same class as V2 (NEW DESIGN, Pearson r 0.3850 against
a declared-enhancement control at 0.9966), so the V2 branch's treatment applies
to it unchanged, at its own measured q80 encode rather than V2's q82. That is
the only reading the branch structure supports, and it is recorded here because
a brief and a ruling that disagree is exactly the kind of thing that should not
be resolved silently.

## JOB 1: TITLE DROP at Popout S

One constant, as the recomposition session promised: `MINI_CROP_TOP_Y` from
`LOGO_TOP_Y` (18) to `FRAME_TOP_Y` (84), making the mini crop window 468 stage
units, exactly `FRAME_H`.

Derived before measuring, per (l.1):

    scale = min(400/640, 181/468) = 0.386752
    frame = 640 * 0.386752 = 247.5px, 61.9% of the viewport
    grid  = 522 * 0.386752 = 201.9px, 50.5% of the viewport

The composition gate measured **grid fill 50.5%**, centre offset 0. Exact
agreement.

**Scope checked rather than assumed.** Desktop 40.8%, Laptop 40.8%, Popout L
33.9%, Mobile L 96%, Mobile M 96%, Mobile S 83.7% are all identical to the
before run, and the dead band stays at the one deliberate 10px gap across all
ten swept heights. The title is dropped at the mini profile only.

**The gate's floor moved because its DERIVATION moved**, 42.0 to 48.0, the
divisor going 534 to 468. It was re-derived, not re-pinned to an observation.
The before capture measures 44.2% against that new floor and the gate flags it,
which is the floor demonstrating it would catch a regression back. The
seeded-violation self-test still passes in both directions.

**Two convention (h.1) faults fell out of this**, both caught by `git status`
before they were committed and both fixed:

1. The gate hardcoded its evidence directory, so this pass's captures would have
   overwritten the recomposition session's committed before and after.
2. It also hardcoded its QA result FILENAME, so the first run overwrote that
   session's committed JSON with this pass's numbers while the screenshots went
   somewhere else. That is the worse of the two, because the overwrite was
   invisible in the directory listing.

Both are now scoped by `--evidence-dir`, with the default filename kept byte for
byte so nothing already committed is renamed.

## JOB 2: BG V1 adopted, and the convention amended

`bg_base.jpg` is now candidate v1 at its measured q80 encode, 273,173 bytes,
sha `c7ecfa15dde8db42`, verified against the ingest record after the copy rather
than assumed.

**The Overdrive variant had to be derived, and this is the part an adoption
silently breaks.** `App.svelte` crossfades `bg_overdrive.jpg` over the base while
the feature plays. The two shipped files were always one city under two lights,
graded from two frames of the same retired loop. Swapping only the base would
have cut the entire skyline to a different skyline on every bonus trigger and cut
back when it ended, with nothing in the build reporting it and every gate green.

`scripts/assets/background_overdrive_derive.py` applies the RELATIVE difference
between `backgrounds.py`'s own two grades, so the treatment is the project's own
and traceable to it rather than invented:

| Parameter | Relative | From |
|---|---|---|
| Contrast | 1.0556 | 1.14 / 1.08 |
| Colour | 1.1017 | 1.30 / 1.18 |
| Brightness | 0.9400 | 0.94 / 1.00 |
| Channel R,G,B | 1.1800, 0.9200, 1.0566 | per channel |
| Vignette | 0.1935 | (0.50 - 0.38) / (1 - 0.38), incremental |

Captured both ways at desktop and checked by eye: same skyline, same star, same
road, the Overdrive frame hotter and more heavily vignetted.

**The tonal direction is favourable and worth recording**, because it was not
the reason for the choice but it supports it. Against the background it replaced,
v1 runs **-16.73** mean luma in the title band and **-21.38** under the bottom
HUD strip. Both bands the interface draws over got DARKER, and the interface is
light on dark, so the readouts gained contrast rather than losing it. The stage
band brightened slightly (+6.08), which works with the frame's cyan.

**The convention amendment.** `CLAUDE.md`'s Assets section now permits
owner-commissioned NEW DESIGNS for scene and marketing art with recorded
provenance. The 2026-07-25 amendment drew its line at enhancement because that
was the case in front of it, and two adoptions since have not fitted on either
side of that line: the tile, whose own generation record states *"Externally
generated, commissioned by the owner"*, and this background. Rather than leave
the written rule at odds with what the project actually does, the amendment names
what really separates the permitted case from the Manus failure, which was never
enhancement versus design:

1. the owner commissioned it;
2. it does not enter the animation pipeline (symbols and anything the effect
   system positions remain in-house only, without exception);
3. its provenance is measured and recorded before it ships.

The test gains a fifth point, from this session's own near-miss: **check what
else is derived from the asset**, because an adopted file with siblings computed
from the old one leaves the set incoherent and no gate will say so.

Provenance is recorded in `design-system/brand/GENERATION_NOTE_background.md`,
in the shape the tile's record established.

**Bundle:** `bg_base` -3,999 and `bg_overdrive` -11,718, plus about 202 from
removing the eye-call harness. Measured 15,519,660 to **15,503,741**.

The `?bg=` parameter and the `candidates/` directory are gone. Unlike `?grade`
and `?haze`, which stay as comparison tools because they cost nothing, this one
needed 0.51MB of now-rejected art in `public/` to mean anything. Both are
recoverable at `6eaea1a` and every measurement is in the ingest record.

**`build_diet_verify.mjs` also migrated to `evidenceDir`**, one of the (h.1)
migrations recorded as open. Caught because a routine gate run left
`build-diet-network-log.json` modified inside this commit, where 54 of 54 changed
lines were a random preview port number.

## JOB 3: TR-085, the free-spins TAP TO CONTINUE

**Reproduced before fixing**: 29.9px at iphone14-landscape and 32.2px at
pixel7-landscape against the 44px floor, while both portrait profiles passed.

**The cause was a scale the original fix never saw.** `.entry-continue` already
carried `min-height: 96px`, and that number was not arbitrary: it was chosen so
the button clears 44px at the ~0.58x this stage scales to in PORTRAIT. Landscape
scales much further, measured 0.3112 and 0.3350, so the same 96 units rendered
under the floor. The old fix was right for the case it was measured against and
silently short for the one it was not. That also explains why the audit that
found this only sees it sometimes: it only measures the button on runs that
happen to trigger a bonus, and only landscape fails.

Fixed with the pattern the tracker row itself predicted, `.m-fm-entry`'s compact
visual with an extended hit area: `::after { inset: -28px 0 }`. Vertical only,
because width was never short (78.7px narrowest) and widening sideways would push
the target under neighbouring layout for no gain. **28 units derived, not
guessed:** 96 + 56 = 152 units renders 47.2px at the 0.3104 worst scale, about 7
per cent of margin. Raising `min-height` instead would have needed roughly 142
units, spent on desktop and portrait too where the button is already generous.

| Profile | Stage scale | Visual | Hit box | Extension press |
|---|---|---|---|---|
| iphone14-portrait | 0.5799 | 146.6 x 55.7 | 146.6 x 88.1 | ok |
| iphone14-landscape | 0.3112 | 78.7 x 29.9 | 78.7 x 47.3 | ok |
| pixel7-portrait | 0.6430 | 162.5 x 61.7 | 162.5 x 97.7 | ok |
| pixel7-landscape | 0.3350 | 84.7 x 32.2 | 84.7 x 50.9 | ok |

The new gate does two things a size assertion alone would not. It performs a
**real un-forced click inside the extension but outside the visual button** and
requires the gate to advance, because a target that measures big and takes no
press is not a fix. And its convention (p) self-test seeds the exact defect, the
extension removed, and confirms the gate goes red on both landscape profiles.

**A false PASS was caught during the work**, and it is the finding worth keeping.
The first measurement added unscaled `::after` insets from `getComputedStyle` to
an already scaled `getBoundingClientRect`, reporting a 47px target as 86px. On a
control whose entire problem is that it lives inside a scaled stage, mixing the
two unit systems would have passed a button still under the floor, with a green
gate over it. Both terms are now converted to rendered pixels via the element's
own layout-to-rendered ratio.

## JOB 4: KIT V5

`~/Desktop/FS_UPLOAD_KIT_V5/`, built from a fresh clone at `ffdd7dc4`, frontend
only, single use. **108 files, 15,504,197 bytes (14.79 MB).** All three dist
gates run IN THE CLONE and passed: dist hygiene, dash gate dist scan, mock
containment. The kit's own refusal self-test passed first.

Verified in the built kit rather than assumed: `bg_base.jpg` is
`c7ecfa15dde8db42` and `bg_overdrive.jpg` is `909dbeefd304b10b`, the adopted
pair; the shipped walkthrough contains PART 9d; and zero `candidates/` paths
survive anywhere in the bundle.

`00_READ_ME_FIRST.md` gains **PART 9d, the V5 visit**, and PART 9c is marked
superseded rather than deleted. The final owner list is the brief's: upload and
publish V5, eyeball the recomposed Popout S and the mobiles plus the background
live, the twenty bracketed Cruise spins, the Guidelines ticks, never Start
Approval. It opens with what actually changed so the owner knows what they are
looking at, and it asks for a real thumb on TAP TO CONTINUE on a sideways phone,
because a measurement is not a thumb.

**Two kit-tooling faults fixed on the way.**

1. `kit_build.mjs` had `FS_UPLOAD_KIT_V3` hardcoded while a V4 had been built and
   shipped, so the script and the Desktop disagreed about which kit it makes, and
   a README inside a V4 folder would have told the owner to confirm "Front V3".
   The version is now one parameter used in the folder name, the README title and
   the publish check.
2. The README template still opened by telling the owner to delete
   `math/HASHES.txt` and to compose the tile, both of which PART 9d says in as
   many words are not needed. The kit and the walkthrough inside the same folder
   disagreed on the first instruction the owner reads. Fixed and the kit rebuilt.

**NEEDS THE OWNER'S HAND, and it is the TR-062 hazard by name.** Four kits now
sit on the Desktop: `FS_UPLOAD_KIT` (dead), `FS_UPLOAD_KIT_V3`,
`FS_UPLOAD_KIT_V4` and the new `FS_UPLOAD_KIT_V5`. Only V5 is live. The stale
three were not deleted from here because deleting the owner's Desktop folders is
not a call this session should make unasked, but a stale kit sitting beside a
current one is exactly how TR-062 happened.

## Self-audit before reporting, per the facts discipline item 4

- **Brief followed as written**, with the one recorded deviation: the BG ruling
  was V1, outside the three enumerated branches, resolved to the V2 branch's
  treatment and flagged above rather than silently.
- **Commit per job**, as required: JOB 1 `6f4be54`, JOB 2 `7b5c22c`, JOB 3
  `1d7df5c`, JOB 4 `c1f131f` and `ffdd7dc`, JOB 5 this report.
- **No lock exceptions**, and none needed. All four locked paths clean in
  `git status` at every commit, `git diff .claude/settings.json` empty, and
  nothing written to a locked path by any route including Bash.
- **No em or en dashes** in any file written this session, checked per file.
- **Every number carries its source**: composition figures from
  `reports/qa/smallscreen_composition_*_title-drop-2026-07-27.json`, background
  provenance from `background_candidate_ingest.json` and
  `background_overdrive_derive.json`, touch measurements from
  `entry_continue_touch_gate.json`, bundle figures from the builds' own
  `build-info.json`, kit figures from the kit's `BUILD_INFO.json`.
- **(l.1) and (l.2) honoured on both measurable jobs**: the Popout S grid fill
  and the touch extension were both derived from the layout maths first and the
  measurement agreed.
- **(h.1) honoured, and enforced twice**: two overwrite hazards were caught and
  fixed rather than committed, and a third script was migrated.
- **(p) honoured**: both gates touched this session have seeded-violation
  self-tests that pass in both directions, and the TR-085 gate was watched going
  red on the real defect before its PASS was accepted.
- **Maths package untouched.** Nothing here reads or writes
  `games/future_spinner/**` and no figure is maths-adjacent.

## Verification, measured

    smallscreen_composition_gate.mjs --phase after       PASS, Popout S 50.5% against floor 48
    smallscreen_composition_gate.mjs --self-test         PASS, seeded violations turn it red
    layout_fit_gate.mjs                                  PASS, 7 presets, 0 offscreen, 0 clipped
    entry_continue_touch_gate.mjs                        PASS, 4 of 4 profiles clear 44px
    entry_continue_touch_gate.mjs --self-test            PASS, seeded defect red on both landscapes
    build_diet_verify.mjs                                PASS, dist 14.79MB < 25MB budget
    dist_hygiene_gate.mjs                                PASS, incl. seeded violations caught
    dash_gate.mjs                                        PASS, source and dist
    typecheck_baseline.mjs                               PASS, 0 errors, 36 warnings, unchanged
    locked_paths_gate.mjs                                PASS, 0 violations
    kit_build.mjs --self-test                            PASS
    kit_build.mjs --version 5                            PASS, 108 files, 15,504,197 bytes
    npm run build                                        107 files, 15,503,741 bytes
    git diff .claude/settings.json                       EMPTY
    git status on the four locked paths                  clean
    em and en dash count across files written            0

## Rule 10 closing link

Recorded below after the final push, per rule 10.

## FOR THE NEXT SESSION

**The owner's V5 visit is the gate on everything else.** Per the brief: after the
visit, Fable's benchmark polish review, then external review round three. Nothing
below should start before the visit's answers are in, because two of the three
open items can only be answered from it.

**What the visit is expected to return**, so the next session knows what it is
filing:

1. **An eye-call on the new background and the dropped Popout S title, live.**
   Both were decided from local evidence; this is the first time either is seen
   on the real platform. If the title drop reads as a loss at Popout S rather
   than a gain, reverting is the same one constant back to `LOGO_TOP_Y`, and the
   gate floor goes back to 42.0 with it.
2. **The twenty bracketed Cruise spins**, the only thing that closes TR-075, and
   unanswered across three visits now.
3. **The Guidelines ticks.**

**Immediate, and it needs the owner rather than a session:** three stale kits
sit on the Desktop beside the live one (`FS_UPLOAD_KIT`, `_V3`, `_V4`). That is
the TR-062 configuration exactly. Ask before deleting them, but ask.

**Still open, unchanged by this session.** The `evidenceDir()` migration for
`layout_fit_gate.mjs` and `contrast_gate.mjs` named under (h.1); this session
migrated `build_diet_verify.mjs` and found two more overwrite hazards in the
composition gate, which suggests the remaining two are worth doing as a set
rather than opportunistically. `reducedMotionFrameGate` was already failing at
HEAD before this session and is excluded from CI; it wants a session of its own
to make deterministic.

**A note for whoever adopts art next.** The fifth point added to the external-art
test, check what else is derived from the asset, came out of nearly shipping a
background whose Overdrive variant was a different city. Nothing in the build
would have caught it: every gate was green, the bundle was smaller, and the
defect only appears once a player triggers a bonus. Derived siblings are invisible
to a file-level swap, and that is the general lesson, not a background-specific one.

**Model and effort.** Opus 5 at high effort. The judgement was in three places:
resolving BG: V1 against a brief that did not enumerate it, rather than either
stopping or quietly picking a branch; noticing that adopting a background implied
regenerating its Overdrive sibling, which no part of the brief asked for; and
distrusting a gate that reported a comfortable 86px pass on a control whose whole
problem is that it lives in a scaled coordinate system.

**Alternatives tried and rejected.**

- *Treating BG: V1 as out of scope and stopping for clarification.* Rejected. V1
  is an ingested candidate the owner saw live through the harness built for that
  purpose, and it measures the same class as the branch that does exist, so the
  treatment follows. Recorded as a deviation instead.
- *Raising `min-height` for TR-085.* Rejected on the arithmetic: about 142 stage
  units, a third taller, spent on every profile to fix two.
- *A uniform `inset: -28px` on the hit extension.* Rejected in favour of vertical
  only. Width already cleared the floor by 78 per cent, and extending sideways
  buys nothing while reaching under neighbouring layout.
- *Keeping the `?bg=` harness as a comparison tool, as `?grade` and `?haze` were
  kept.* Rejected. Those cost nothing; this one costs 0.51MB of rejected art in
  the served tree to keep a switch nobody will press again.
- *Deleting the three stale Desktop kits.* Rejected as not this session's call,
  and flagged for the owner instead.
- *Shipping the background without regenerating `bg_overdrive.jpg`.* Rejected
  once the crossfade was traced. It would have passed every gate.
