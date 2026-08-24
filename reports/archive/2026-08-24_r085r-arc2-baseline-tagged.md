# Session Report - R085-R SAVE POINT RESUMED: the restore point is cut, submission-1 stays held (2026-08-24)

Brief saved verbatim: `reports/briefs/FS_FABLE_R085R_SAVE_POINT_RESUMED_Prompt.md`, which
supersedes R085 in whole per (v). Branch: `main`, green lane, records only. **No force
operation. No generation, no API call, no network beyond git and gh. Nothing in
output/imagegen was moved, edited, deleted or committed.** Locked paths untouched.

## Preconditions: all met

| Precondition | State |
|---|---|
| On `main`, pulled | Yes, already up to date |
| Modified tracked files | **0** |
| BASELINE_SHA | **`618b711eebcaed7682aca4f63b16b24911d5c456`** (R085 records) |
| `submission-1` remote | absent |
| `arc2-baseline` remote | absent at start |
| Remote tags at start | zero |

## TASK 1: the restore point is cut and pushed

**`arc2-baseline` now exists, annotated, at `618b711eebcaed7682aca4f63b16b24911d5c456`.**
Verified three ways rather than assumed: `git cat-file -t` returns `tag`, so it is a real
annotated object and not a lightweight ref; `git rev-list -n1` dereferences to
BASELINE_SHA exactly; and the remote now lists two refs for it, `refs/tags/arc2-baseline`
at tag object `b11163e40e7cbdc9d9f8a1a352997f57ca544b11` and `refs/tags/arc2-baseline^{}`
at the commit. Two refs for one annotated tag is the correct shape.

**This is the repository's first tag.** It had never carried one.

The message is the brief's verbatim, and it now carries the two-figure score form R085
recovered from TR-181: platform-quoted 4.3 of 9, recomputed sum 4.33 from 1.33 + 1.33 +
1.67, average 1.44. It also records, inside the tag itself, that the submission-1 build
question was open at tagging time and points at comms 083, so a reader who finds this tag
in a year is told what was NOT known when it was cut.

## TASK 2: submission-1 stays held, and the bar is now written down

Not created. `submission-1` remains absent from the remote, confirmed after the push.

**The definition of ready, recorded here so it is not renegotiated later:** an
owner-supplied artefact that states the built SHA verbatim. That means the kit README line,
or the `build-info.json` from the zip actually uploaded, or a portal capture showing the
uploaded package identity. **Owner memory does not qualify.** When it lands, the tag quotes
the artefact verbatim in its message, uses the two-figure score form above, and the release
follows R085 TASK 3 semantics unchanged, including the original-versus-rebuild labelling
and the rule that a mismatched rebuild is never presented as the original.

## TASK 3: read-only inventory of output/imagegen

**Nothing was touched.** No file opened beyond the four text records and PNG headers.

**The directory is LIVE and grew during this session**, which is a fact about the reading
rather than a conclusion about the work: the first pass counted 90 files and found three
prompt records; a re-read minutes later counted 91 and found four, the fourth
(`future-spinner-core-controls-hud-480-masters/PROMPTS_AND_QA.md`) carrying an mtime of
2026-08-24 12:01, one minute before it was read. **Every count below is therefore a reading
taken at 2026-08-24 12:01 and not a stable figure.**

### Tree to one level

| Folder | Files | Bytes |
|---|---:|---:|
| `future-spinner-480-masters` | 27 | 28,819,877 |
| `future-spinner-ui-support-480-masters` | 24 | 19,982,203 |
| `future-spinner-core-controls-hud-480-masters` | 20 | 13,364,541 |
| `future-spinner-symbols` | 17 (+1 .DS_Store) | 10,618,125 |

**Total at read time: 91 files, 72,797,588 bytes** (including two `.DS_Store` files).
Second-level subfolders present: `source-1254`, `work-alpha`, `review` (in the three
480-master sets) and `chroma`, `preview-64px` (in the symbols set).

**Mtime range: 2026-08-22 05:57 to 2026-08-24 12:01.**

### Header-only dimension census, 85 PNGs

`1254x1254` 41, `480x480` 24, `1016x1548` 6, `64x64` 5, `1040x520` 2, `1016x1547` 2,
`1536x1024` 2, `1920x525` 1, `1440x1050` 1, `1920x384` 1.

### The four prompt records, and the fields the brief asked for

All four are titled `PROMPTS_AND_QA.md`, one per folder. Their full text is long and is
reproduced in the session transcript rather than duplicated here; what follows is the
field-level answer the brief asked for, measured with controls.

**None of the fields the brief names appears in any of the four.** Counted across all four
files:

| Field | Occurrences |
|---|---:|
| provider | **0** |
| model | **0** |
| endpoint | **0** |
| seed | **0** |
| cost | **0** |
| request-id | **0** |
| api_key | **0** |
| credits | **0** |
| licence / license | **0** |
| sha256 | **0** |

**Controls on the same four files, proving the search works and the zeros are real
absences:** `prompt` 9, `generator` 2, `workflow` 3.

**No key-shaped string is present in any of them**, checked against `sk-[A-Za-z0-9]{20,}`.

**The only generation-method attributions present, quoted verbatim:**

> "Generated on 2026-08-22 with the built-in image-generation workflow."
> "Generated with the built-in image-generation workflow on 2026-08-22."
> "Generated on 2026-08-24 with the built-in image-generation workflow."
> "The generator produced square 1254x1254 RGB source renders."

**Reference material named in the records, quoted verbatim** from the symbols record:

> "The five Gemini sheets supplied by the owner were used only as visual references."
> "`Gemini_Generated_Image_kyhkg9kyhkg9kyhk.jpeg`: primary material voice from the
> mechanised Wild, carbon tile plate, rim and turbo."
> "`Gemini_Generated_Image_fyyv3dfyyv3dfyyv.jpeg`: premium energy and surface-confidence
> reference from the Scatter Energy Core and M1 intake."
> "`Gemini_Generated_Image_a5ioroa5ioroa5io.jpeg`: approved subject identities and initial
> M2 to L3 silhouettes."

Those three referenced jpeg files are **not present** in output/imagegen; the folder holds
PNGs only.

**One line worth surfacing verbatim because it states the intended use**, from the
core-controls record's prompt lock:

> "Commercial real-money slot-game UI in the locked Future Spinner cyberpunk automotive art
> direction."

**No style register and no config file sits in or beside output/imagegen.** The four
`PROMPTS_AND_QA.md` files are the only non-image files in the tree. `docs/art/style_register.json`
remains absent, so the composer still refuses.

**The records DO carry substantial QA measurement**, which is a fact about their content:
per-asset foreground-mass percentages, alpha bounds, transparent-corner and green-fringe
checks, H1 registration figures (mean absolute pixel difference 2.63/255, 95th percentile
13/255), needle angle 62.53 degrees at tip radius 169.07px, and background contrast ratios
0.574 and 0.414. The processing method is described in the core-controls record as
chroma extraction with border-key sampling, soft matte, despill, and a single Lanczos
resize to 480x480.

**No conclusions are drawn here about provider, licence or fitness.** The brief reserves
that ruling to the owner and Fable, and this section is an inventory.

## Verification

Document currency and locked paths below, chained with `&&` per (o). Explicit paths per
(k). No code changed, no rebuild. Remote CI verified with the full sha.

## ESCALATIONS

**E1 (R085-R). submission-1 unlocks only on the owner artefact**, per TASK 2's definition
of ready. The uploaded zip's `build-info.json` is the cleanest form; a portal capture of
the uploaded package identity also qualifies. Memory does not.

**E2 (R085-R). The four prompt records carry no provider, model, endpoint, seed, cost or
request-id field.** Stated as a measured absence, not as a criticism: convention (l)
requires generation pipelines to be seeded, logged and re-runnable per item with provenance
committed, and these records do carry prompts and dense QA measurements. Whether what they
carry satisfies (l), and under whose licence the work was produced, is the owner and
Fable's ruling and is deliberately not inferred here.

**E3 (R085-R). output/imagegen is live and growing**, gaining a folder's worth of records
during the four minutes this inventory took. Any future count is a reading, not a state,
until the directory settles or is brought under version control by an owner decision.

**E4 (R085-R). Three referenced Gemini source jpegs are named in the records but are not
in the directory**, so the reference chain those records describe is not reconstructable
from what is on disk.

R085's E2 (no submission record convention) stands and is the direct cause of E1. R084's
E1, E2 and E3 stand, as do R083's E3 and E4, R082's three, R080's E1, R081's E2 and E3,
TR-148's four, R078's E1 and E2, and R079's E1 and E2.

## FOR THE NEXT SESSION

**The restore point exists now**, which was the point of resuming: whatever the reskin does
to the tree, `arc2-baseline` recovers the last pre-reskin state.

submission-1 unlocks only on the owner artefact. R086 arrives from Fable on the owner's
REISSUE: style register, secret-scanning gate, Gemini terms capture, SY-09 transcription,
the arc-2 living handover, and the submission-record convention text if the owner ratifies
it. All generation remains blocked on the owner's provider ruling.

Model and effort: Opus, judgement tier, one session, green lane on `main`, records only.
