R086: PLACEHOLDER INTEGRATION, FENCED. Sole live brief; R085-R is

complete and closed; the register-and-gates pack becomes R087 on the

owner's REISSUE. Review lane. Sonnet, high effort. Unattended. Save and

commit this brief verbatim per convention (c).



THE FENCE, ABSOLUTE THIS SESSION AND EVERY SESSION UNTIL A PROVIDER

RULING CLEARS A BATCH: no file from output/imagegen, no derivative of

one, and no screenshot depicting one is staged or committed. The close

gate for this brief asserts git diff --cached contains zero raster

additions or modifications (.png .jpg .jpeg .webp .gif). Kit packaging

is FORBIDDEN while any placeholder differs from HEAD in the working

tree. Locked paths untouched. No generation, no API calls.



PRECONDITIONS

1. On main, clean tracked tree, git pull. Confirm arc2-baseline resolves

   to 618b711e.

2. git check-ignore output/imagegen; if NOT ignored, add "output/" to

   .gitignore as part of this session's records commit.



TASK 1: SNAPSHOT THE LIVE DIRECTORY

Copy output/imagegen in full to .scratch/placeholder-2026-08-24/src/

(gitignored per h.1). Record in the report: file count, total bytes,

newest mtime of the snapshot. Everything after the snapshot instant is

out of scope this session; the incoming directory itself is read-only

and untouched.



TASK 2: THE MAPPING TABLE, COMMITTED

Author docs/art/placeholder_map_2026-08-24.csv, one row per snapshot

file: filename, batch folder, header dimensions, alpha yes/no, manifest

id or NONE, shipped path or NONE, status MAPPED / NO-ROW / INTERMEDIATE

/ WRONG-SPEC / AMBIGUOUS, and the selection note where several

candidates target one row (prefer the batch record's stated target,

else newest, and say which). Scope is the manifest's REPLACE rows only.

chroma, work-alpha, review and preview-64px contents are INTERMEDIATE.

ui-support and core-controls-hud files map only where a REPLACE row

exists; documentation icons and the DEAD panels take no replacement by

design, so expect NO-ROW there and record it without swapping.



TASK 3: LOCAL SWAP, WORKING TREE ONLY

For each MAPPED file: process snapshot source to delivery spec through

the existing ingest tooling (premultiplied downscale, dimension and

aspect gates, 64px check) writing to .scratch/placeholder-2026-08-24/

delivery/, then overwrite the shipped path IN THE WORKING TREE ONLY.

Never stage a swapped raster. Sources failing ingest gates become

WRONG-SPEC in the table and are not swapped. Report counts: swapped,

wrong-spec, no-row, intermediate.



TASK 4: THE SY-09 TRANSCRIPTION, COMMITTED

Correct the manifest row SY-09: role is the holographic dash readout,

not the booster; note field records that the FX-01 overlay sheet

semantics become the holo flicker sheet, layout spec unchanged at six

frames of 200x200 in one 1200x200 row. Text-only change; the owner's

paste of this brief is the ratification. Make no component or code

changes this session; if a swap genuinely requires one, record it as a

finding instead of making it.



TASK 5: BUILD, RUN, LOOK, MEASURE

Local build with the swapped tree. Capture to .scratch/

placeholder-2026-08-24/screens/ (NEVER reports/screens/): full board at

rest, spin in motion, paytable, win presentation, feature screen, and a

small-scale reel context shot. DOM-measure and report: M2 idle bob

excursion versus its art top bound, L3 idle pump excursion versus its

crown bound, in pixels at the rendered size, plus any layout breakage,

missing-asset error or console fault. Report build pass or fail

plainly. No screenshot leaves .scratch.



TASK 6: RECORDS AND CLOSE

Comms entry 085, folded (t): snapshot figures, map counts, swap counts,

build result, DOM headroom numbers, and the standing status line:

placeholder assets are visual-test only, provider attribution rides the

batch records as received, ship-bar unchanged pending provider

clearance. Record the two convention texts as RATIFIED BY OWNER PASTE

of this brief: (1) SUBMISSION RECORD: every portal upload act gets a

same-day committed record of kit filename, kit sha256, source SHA from

the kit README, and portal timestamp; (2) EXTERNAL INTAKE: externally

generated batches arrive as closed dated folders with a MANIFEST.md

naming provider, product, model, account, dates, verbatim prompts,

included reference files, post-processing chain and manifest-id

targets, and are never edited after delivery. SESSION_REPORT.md plus

dated archive; brief committed verbatim; explicit paths (k); close

gates chained with && (o), including the zero-raster-staged assertion

above. Restore instruction recorded for future sessions: git checkout

-- <swapped paths> returns the tree to HEAD before any kit build.



FOR THE NEXT SESSION

Owner look-pass verdicts arrive by eye, not as record verdicts; formal

visual verdicts wait for cleared assets and committed proofs per (h).

R087 pack (style register, secret-scanning gate, Gemini terms capture,

arc-2 living handover) ships on the owner's REISSUE. submission-1

remains held on the portal artefact. Provider ruling and the OpenAI

formal reply remain open. Owner clarification (add to the brief):

The primary goal of this session is a viewable local build.

After the working-tree swaps are complete, the owner will run the normal local development command (npm run dev or equivalent) to inspect the game with the placeholder art.

Do not package a submission kit.

Do not stage or commit any rasters.

Leave the working tree in the swapped state at the end of the session so the owner can view it. The restore command (git checkout -- <swapped paths>) will be used later when we want to return to HEAD.
