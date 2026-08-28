# R137 - TWENTY-EIGHT PLACEHOLDERS ADOPTED, TWO REFUSED, AND THE KIT IS CLEAN

Brief: `reports/briefs/FS_R137_PlaceholdersKit_Prompt.md`, saved verbatim before any work.
Branch `claude/r137-placeholders-kit`, review lane, pull request #176. Boot from main ef70eb66.
The owner's ruling in this brief LIFTED a fence standing since R129: the 30 working-tree
placeholders could now be committed if they passed ingest and look-pass gates.

## 1. What landed

**28 of 30 adopted, 2 refused, and each refusal decided by a number I took myself.**

Commit `578a3a51` names the provider (OpenAI gpt-image-1), the clearance (Ticket 456254,
development-stage art only, machine-enforced by `provider_gate.json` since R099) and the phrase
the brief requires. Staged one explicit path at a time, never a directory: 28 paths, all under the
theme, nothing from `.scratch` or `output/` in the index.

**REFUSED 1, `symbols/tile_plate.png`, FAILS ALPHA.** HEAD carries three distinct alpha values,
6.600% of pixels non-opaque and all four corners at alpha 0. The candidate carries ONE alpha value
across all 49,776 pixels, 0.000% non-opaque, all four corners at 255: a fully opaque rectangle
where SY-13 declares `alpha=yes`, `TRANSPARENT PNG` and "corner radius must match the grid". It
paints behind every one of the 35 cells.

**REFUSED 2, `ui/feature_button.png`, FAILS INGEST.** Not by argument: by running the tool.
`ingest.py` on all 30 candidates returns **29 accepted, 1 refused**, and prints
`[REFUSED] feature_button.png: DOC-10 is classified REGEN, not REPLACE`. Open since R103 as
OUTSTANDING_LEDGER R103-E5, never answered.

Both were archived byte-for-byte with their sha256s before the working tree was reverted, so
declining them destroyed nothing.

## 2. The central worry was a misreading, and the sweep proved it

`placeholder_map_2026-08-24.csv` records L1, L2, L3, M2, M3, tile_plate and the logo as
WRONG-SPEC, and all seven are modified in the working tree. That looked like seven files bypassing
a refusal. **It is not. Those rows refuse candidate MASTERS, not shipped files**: the five symbol
masters were portrait (1016x1547 and 1016x1548) against square 240x240 rows, and tile_plate and the
logo were offered as square 480x480 against 244x204 and 600x120 targets. All seven were re-supplied
at the correct aspect and re-ingested later, each on record: the five symbols through a package
literally named `square-rerender` at 0.00% drift, tile_plate from a 732x612 master (exactly 3x of
244x204, verbatim the remedy the original refusal recommended), and the logo at native 600x120.

The ledgers were checked rather than believed: **all 37 rows across 7 ledger files re-hashed against
the real source and delivered files, zero mismatches**, and six of the files reproduce BIT-IDENTICALLY
(maxdiff 0) when re-run through `ingest.py`'s own key-knockout and resize.

## 3. The gauge, which the owner named

HEAD's `gauge_face.png` has a needle BAKED IN: **1,305 strong-red pixels inside the dial radius**.
The adopted face has **ZERO**. Both draw sites stack a separately rotating needle on top, so main
currently paints TWO needles and the shipped face now paints one. **On-screen needle count on the
adopted pair: 1**, counted in pixels rather than from the DOM, because the DOM shows a single `img`
either way.

**The needle's own angle is a contract question this session did NOT close.** Five independent
measurements agree the adopted needle sits at about 27.5 degrees from vertical; `art_manifest_arc2.csv`
UI-02 permits 62 or 0. It is adopted as a PAIR with the face because the alternative was measured and
is worse: HEAD's 62-degree needle over the new needle-free face reads about -48 degrees at rest and
+172 at full, nearly straight down, against -83 and +137 for the adopted pair. Refusing the needle
while taking the face is the worst of the three options; refusing both leaves the two-needle defect
live. The residual offset is on the owner list.

## 4. Gates, and the R135 lesson applied

**Static gates: 82 of 82 green. Browser matrix: 28 of 28 green.** Both run locally before the push.

That second suite is the point. R135 pushed a red because its local runner covered only the static
job and `browser: splash calm` lives in the browser matrix. This session built BOTH runners as
precondition 5 asked, listed all 28 legs by name, and ran them. `splash calm` is green.

`dist_hygiene_gate` passes for the first time in three sessions. It had failed in R134 and R135 on
one field, `cleanTree: false`, and the fix was not to touch the gate: it was to resolve the dirty
tree honestly, which is what committing 28 and reverting 2 does. `dist/build-info.json` now records
`"cleanTree": true`.

## 5. Budget

R128 recorded the working-tree dist at 25,875,180 bytes with 339,220 of headroom and called it the
planning number. **That figure is now stale and the position is comfortable.** Measured at this
commit: dist is **23,456,011 bytes = 22.37 MiB against a 25 MiB cap, headroom 2,758,389 bytes =
2.63 MiB**. The difference is the pruning R129 to R135 did in between, the glance sheet and the
perimeter among it.

A subtlety worth recording because it inverts the intuition: committing the rasters changed nothing
in a LOCAL dist, because vite copies `public/` verbatim and the working tree already held them. What
it changed is what a CLEAN CI CHECKOUT builds, from 21,468,488 bytes to 23,456,011.

## 6. The kit

Built by the project's own `kit_build.mjs` from a FRESH CLONE, which is convention (o)'s structural
half, and which refuses when HEAD is unreachable on the remote or when tracked files under
`frontend/` differ from HEAD. Both refusals passed on their own.

| field | value |
|---|---|
| path | `~/Desktop/FS_UPLOAD_KIT` |
| version | v10 |
| source SHA | `578a3a51444f1f08a6def5bb9426abb3055e4305` |
| upload payload | 102 files, 23,455,987 bytes |
| whole kit | 109 files, 24,842,865 bytes |
| kit manifest sha256 | `e5a879a40471928095d8d5033b6b42b6d53ca8fbabd1ae34a71aa10845129e4c` |

The record is at `docs/records/upload-kit/SUBMISSION_RECORD_2026-08-28_R137.md` with the portal
timestamp deliberately blank. **The owner uploads. No session uploads.**

**AUDIO IS INCOMPLETE AND THE KIT SAYS SO.** Twelve sound files ship. Four wired cues have no stem
and those moments are silent: `feature_enter`, `feature_end`, `retrigger`, `win_max`, each confirmed
missing by direct filesystem check rather than inferred from the audio map. Nothing was generated
and no silence is described as finished sound.

## 7. The 51-item list exists, and nothing was ticked

The brief said never to invent a 51/51 score. **The list is real**: the verbatim logged-in capture at
`docs/stake-engine-live/2026-08-13/submission_checklist_we_roll_spinners.md`, 51 items whose
section counts sum to 51, with the platform's own misspellings preserved; a mapping document; and
R074's machine walk of 2026-08-20, which is now 8 days and 291 changed files stale. It was walked
rather than replaced by the eighteen-point fallback, and the eighteen were walked too.
**Zero of 51 boxes are ticked, which is the expected state: reviewers tick them, not the studio.**

## 8. My own instrument failure, and the fleet caught it

**I told every agent that `http://localhost:5173` was serving this working tree. It was serving a
different application entirely**, a React app called SI Planogram Builder from another directory. At
boot I checked that the port ANSWERED and never checked WHAT answered. Six of the eight sweeps found
it independently, stood up a real server, and proved it served the working tree by byte-comparing
`gauge_face.png` (302,421 served against HEAD's 107,549) before measuring anything. One of them said
plainly that its own first probe returned zero console errors, zero page errors and zero failed
requests, and that this read as a clean pass while pointed at the wrong application.

**Liveness is not identity.** The check that costs one line, and that I skipped, is fetching a known
asset and comparing its bytes. Every browser measurement in this session was re-taken on a verified
server, and the critic closed the question by showing all 30 URLs served byte-identical to the
working tree.

## 9. Corrections to earlier records

- **R128's budget figure** is superseded: 339,220 bytes of headroom then, 2,758,389 now.
- **The 30 modified files are NOT the manifest's 30 REPLACE rows.** The counts match and the sets do
  not: `frames/frame-2.png` (SC-03, REPLACE) is untouched and `ui/feature_button.png` (REGEN) sits in
  its place. Anyone reasoning "30 modified equals the 30 gated rows" reaches a true-sounding
  conclusion by a broken route. REPLACE coverage after this commit is 27 of 30.
- **`ingest.py` has a hole its own ledger documents.** For tile_plate it records `alpha_expected: True`,
  `route: key`, `cleared_px: 0` and the reason "alpha channel present but fully opaque, so it carries
  no cutout", and exits OK. There is no assertion that a row wanting alpha actually produced a cutout.
  A gate that prints the diagnosis and passes anyway is the shape this project keeps finding.

## 10. FOR THE NEXT SESSION

**Model and effort:** Opus 5, high effort, ultracode. One 10-agent sweep, then hand verification of
every decision that mattered. About 2.0M subagent tokens.

**Approach:** run the real tool rather than a reconstruction of it. Eight sweeps discussed ingest and
none executed it; the critic did, and its 29-accepted-1-refused is what decided the commit.

**Alternatives rejected:** committing all 30 (two fail the fence); refusing the gauge needle while
taking the face (measured worse than adopting both); flipping DOC-10's class to REPLACE to admit
`feature_button` (that reverses a decision R125 recorded deliberately, and is the owner's call).

**Open, and named rather than implied:** the two refused rasters; the gauge needle's 27.5-degree
offset and its 45.5px off-centre hub; SC-03 / `frame-2.png`; the four audio stems; and an
`ingest.py` assertion for the alpha hole in section 9.
