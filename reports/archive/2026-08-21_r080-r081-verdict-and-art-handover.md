# Session Report - R080 THE VERDICT AND ARC 2, R081 THE ART HANDOVER (2026-08-21)

Briefs saved verbatim: `reports/briefs/FS_FABLE_R080_VERDICT_ARC2_Prompt.md` and
`reports/briefs/FS_FABLE_R081_ART_HANDOVER_Prompt.md`. Branch: `main`, as integrator.
**No game code changed in either.** Locked paths untouched.

**A lane note first, surfaced per convention (n).** Both briefs arrived in one paste and both
declare themselves the sole live brief, which convention (v) says cannot both be true. They
were read as a SEQUENCE rather than as a replacement, because R081 depends on ARC 2 existing
and R080 opens it, and because R081 declares no predecessor dead. Executed in that order. If
that reading is wrong the correction is cheap: the two are separable commits.

## R080 SUMMARY: not published, 4.3 of 9, on production values alone

**Attempt 1 scored 4.3 of 9 against a 6-point threshold and was not published.** Reviewers
1.33, 1.33, 1.67. Tags: low quality assets, poor animations, bad sound design. Resubmission
opens 24/08/2026 18:19:53.

Recorded verbatim in the dossier as its new section 10 and in the master document's
submission record as attempt 1. **The arithmetic was recomputed rather than accepted:**
1.33 + 1.33 + 1.67 = 4.33, the quoted 4.3 to one decimal, average 1.44, the 1-star tier the
live rankings page describes as "Not published". The gap to the bar is **1.67 points, about
0.56 per reviewer** on a scale of roughly 0.33 steps.

**What the verdict does NOT say is the load-bearing part.** Not one compliance, functional,
correctness, maths, RGS, localisation, responsible-gambling or accessibility issue was raised
anywhere in the feedback. All three tags are production values. The estate arc one built was
not challenged, so ARC 2 inherits it frozen-valid and does not re-litigate it. The three
reviewers also agreed tightly, which reads as a consistent judgement of the same thing rather
than one dissent to argue with.

**One consequence of not being published, worth naming because it expires:** the
post-approval lockdown has NOT engaged. Gameplay and mode changes are lawful in this arc in a
way they never will be again after publication.

**THE CALIBRATION GAP IS THE MOST USEFUL FINDING.** Our own round-four external refresh
scored this same build band 2, three reviewers at 2.33 of 3 each. The platform scored it
1.44. **We over-scored the shipped article by about nine-tenths of a star**, and the whole of
that gap sits in the three tags, which our rubric weighted lightly or not at all. Internal
review re-anchors in ARC 2 to the live quality-rankings tiers and the owner's benchmark
captures of a published title, not to our own prior work.

## R080 TASK 2: the publication rule, corrected with the delta stated

The bar is **6 of 9 points, a 2-star average**, and the lock is **3 days**. Corrected in the
two live documents that carried the old rule: the v8 frame and the master document's platform
register. The superseded figures are written out rather than silently overwritten, because
the delta is material: "average below 1.0" was a LOWER bar, and a game averaging 1.5 stars
was publishable under the old reading and is not under this one.

**A PROVENANCE CAVEAT RIDES IT, recorded in COMPLIANCE_WATCH rather than buried.** These
figures come from the owner's live reading. **No capture under `docs/stake-engine-live/`
contains them**, including the newest, so the mirror is now KNOWN STALE on this point and a
re-capture of the approval page is owed. The verdict corroborates the threshold
independently by quoting it, which is why the correction was made rather than parked.

`HANDOVER_2026-08-15_Fable.md` also states the seven-day figure and was deliberately NOT
edited: it is a dated arc handover, the class convention (j) and the document-currency gate
both treat as a record of what was true then. ARC 2 opens its own handover.

## R080 TASK 3: ARC 2 opened

`WRS_MASTER_DOCUMENT.md` section 7 now carries the arc: what transfers whole and is not
reopened, what is in scope, and the calibration re-anchor. Scope is art, animation, sound and
gameplay depth to the 2-star shelf standard, which the rankings page defines as games showing
"considerable creativity or originality" that "may lack polish compared to more established
studios" while still demonstrating "strong development quality and attention to detail".

Gameplay depth is recorded as a WATCH rather than a finding: attempt 1 was not tagged for it,
but the rankings page names shallow gameplay and missing engaging features as frequent causes
of a 1-star rating, so it is worth raising deliberately rather than assuming.

## R081 SUMMARY: the real art brief is 30 files, not 115

`docs/art/ART_HANDOVER_ARC2.md` and the machine manifest `docs/art/art_manifest_arc2.csv`,
47 rows, every shipped raster accounted for with none missing. Contact sheets by priority
tier at `reports/art/arc2/current/`.

**THE BRIEF'S "~115" IS EXACTLY THE SOURCE COUNT, AND ONLY 47 SHIP.** 47 + 23 + 45 = 115
across the three named roots, but `assets/ui/` and `assets/symbols/` are pre-LAYOUT_SPEC
legacy roots the build fully prunes, dead since WinPod was deleted at R058. **Sixty-eight of
the 115 never reach a player**, and sending them to a generation tool would be paying to
redraw dead files.

Of the 47 that do ship: **1 KEEP, 30 REPLACE, 10 REGEN, 6 DEAD.**

### Ten files that look like UI art and are not

The button set plus `feature_button` are DOCUMENTATION ICONS, rendered only inside the
paytable's Interface Guide. The live controls are drawn in CSS and inline SVG;
`HudOverlay.svelte:1708` says so outright. They are produced by headless screenshot of the
running app, so the correct way to change them is to restyle the live control and re-run the
regenerator. **A hand-drawn replacement would drift from the button it documents**, which
`interface_guide_icon_proof.mjs` exists to catch.

`feature_button.png` is the one dual-role file, regenerated by that script AND rendering live
as the buy dialog header art. **I had it classified as ordinary art until I checked the
regenerator's own target list**, which is the kind of thing that is only ever found by
reading the generator rather than the consumer.

### Six that ship and render nowhere, two of which need more than a delete

`frame-1`, `subtitle`, `panel_balance`, `panel_win`, `scene_character_car`, `hero_icon_96`.

**`scene_character_car.png` REGENERATES ITSELF** from a stale export entry, so deleting the
PNG alone restores it on the next asset build. The same stale-export class covers two files
already deleted in August, `brand_mark.png` and `brand_mark_glyph.png`: running `npm run
assets` today would recreate both and take the theme folder from 47 rasters to 50. Three
export entries to fix in one edit. **`hero_icon_96.png` derives from the PROTECTED emblem
master**, so it is deleted alongside LoadingScreen rather than regenerated by an art tool.

### A live visual defect, found and specified for the replacement to fix

**The Overdrive meter renders TWO NEEDLES.** `gauge_face.png` is a whole render of a master
whose needle group is baked in at 62 degrees, and the live `gauge_needle` sprite rotates on
top of it. Confirmed twice: by reading `BonusInstrumentColumn.svelte:85` and `:88`, and by
eye on the P3 contact sheet, where the baked needle is plainly visible on the dial.

The pipeline already knew. `scripts/assets/manifest.json:38` declares a needle-free
`gauge_base.png` as the intended under-layer, with a note saying the engine rotates the
needle over it. **Nothing ever referenced it, so it was correctly deleted as unreferenced,
and the bug it was meant to prevent survived.** The replacement dial must be needle-free, and
the needle sprite is drawn pre-rotated to 62 degrees, so every angle in the code is 62
degrees off what the art shows.

### A class lesson for every replacement

The two dead panels **bake English words into the art**, BALANCE and WIN. That cannot survive
sixteen locales, and social mode remaps WIN to PRIZE. `panel_balance` also carries garbled
machine pseudo-text in its readout window. **No replacement may bake copy into a raster**,
and the handover says so.

### Constraints the manifest carries per row

Exact sheet layouts, measured and stated: `m3_flame_sheet` 6 frames of 200x200 in one row;
`l2_fuse_sheet` 4 of 200x200; `jet_flame_sheet` 5 of 240x120. `jet_flame_static` is literally
frame 3 of the jet sheet, pixel-identical, so it should be exported from the replacement
sheet rather than drawn separately.

`scatter.png` rotates a full 360 degrees over 12 seconds, so a replacement must be radially
symmetric or designed to spin. `h1` is three files composited by symbol ID and never by game
state. `tile_plate` sits behind every symbol unconditionally and is the highest-leverage
single tile in the set. Plate signature colours are applied by the engine as a CSS glow and
are NOT baked into the art, so a baked glow would double. `frame-2` is squashed
non-uniformly today, 0.800 in x against 0.731 in y.

## Method, and one thing I nearly got wrong about my own tooling

The render-site mapping ran as a three-agent fan-out with an adversarial verifier. **My first
extraction of one agent's result reported it as empty and I almost re-ran 184 turns of
work.** The agent had returned sixteen assets and the richest notes of the three; my
extraction script was at fault. Checking the transcript before concluding an agent failed
cost one command and saved the whole group, and the workflow documentation warns about
exactly this.

Everything in the manifest that could be measured was measured: dimensions, alpha and colour
type parsed from each file's own PNG or JPEG header, byte sizes from disk, render sites read
from the components. The two strongest claims, the double needle and the documentation icons,
were verified by hand after the agents reported them.

## Verification

Document currency run over the close-state tree before pushing. Explicit paths per (k).
Gates chained with `&&` per (u.1). No rebuild and no code change in either brief, so the
browser matrix has nothing to exercise; the static suite covers what changed.

## ESCALATIONS

**E1 (R080). A re-capture of the live approval page is OWED**, because the publication
threshold and lock now live only in the owner's reading and in this record. Everything else
in the compliance estate is corroborated by a dated capture; this one is not.

**E2 (R081). Three stale export entries in `scripts/assets/manifest.json`** would recreate
three files that should not ship, two of them already deleted, on the next `npm run assets`.
Not actioned here because R081 is records and evidence only, and because the fix touches the
asset pipeline.

**E3 (R081). The gauge double-needle is a LIVE defect on a player-facing surface**, not only
an art-handover note. It is visible during the Overdrive feature today. Whether it is fixed
by the art replacement or by a code change sooner is an owner call.

TR-148's four escalations, R078's E1 and E2, and R079's E1 and E2 all stand.

## FOR THE NEXT SESSION

The production arc plan, owner and Fable first (R080's own handover line). The art manifest
is ready to hand to the generation tools; nothing in R081 is queued for a builder.

Model and effort: Fable, judgement tier, one session covering two briefs, integrator on
`main`, records and evidence only.
