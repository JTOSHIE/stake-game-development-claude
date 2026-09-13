R145: ASTRA STATIC PROOF INTAKE — THREE FILES ONLY.
Review lane. Medium effort. Save and commit this brief verbatim.

WHY THIS EXISTS
Owner restarted npm and saw no change. Correct: chatgpt-astra-static-proof
is scratch-only. Shipped rasters were never touched. This session copies
the three accepted proofs into the live theme tree so the look-pass is real.

FENCE
- Only these three live rasters may change, and only after ingest accepts them.
- Do not stage unrelated WIP rasters. Do not generate images. Do not call APIs.
- Do not touch games/ math, rgsService.ts, gameStore.ts, HeroIdle flipbooks
  except to REPORT which file the on-stage hero actually draws.
- Owner preview on 5173 stays untouched. Use another port.
- Fingerprint dirty rasters before any file op.
- Kit packaging forbidden.

SOURCES
/Users/jt/math-sdk/.scratch/art-review/chatgpt-astra-static-proof/
  01-hero-rest-680x1344.png
  02-h2-turbo-480.png
  03-m3-dash-480.png
  PROMPTS_AND_QA.md

TARGETS (shipped)
  frontend/public/assets/themes/future-spinner/ui/scene_character.png
  frontend/public/assets/themes/future-spinner/symbols/h2.png
  frontend/public/assets/themes/future-spinner/symbols/m3.png

PRECONDITIONS
1. On main, pull. Confirm the three sources exist and the three targets exist.
2. Read PROMPTS_AND_QA.md. Authority: IoU 1.000 vs shipped, max RGB 14/255,
   generative edits rejected, 480s are 2× of native 240s.
3. Trace the live hero: SceneGroup / HeroIdle / App. Record file:line for
   which raster is on stage at rest. If rest is an idle sheet and not
   scene_character.png, STILL swap scene_character.png, but say clearly
   "hero on stage will not change until Path 1 freeze points rest at this
   file." Do not invent a sheet rebuild in this session.

WORKSTREAM 1 — MEASURE THEN INGEST
- Measure source vs target dimensions.
- Hero: 680×1344 → 680×1344, native alpha, no keyer.
- H2 / M3: 480×480 proofs → shipped 240×240. Downscale with the project
  ingest path (the one that already proved byte-reproducible on hero
  sheets). Do not stretch. Do not green-key; these are RGBA cutouts.
- Refuse if aspect drift, IoU vs current shipped < 0.99, or alpha hole.
- Compare-against-shipped: expect near-identical silhouette; material
  delta only. If a proof is a different robot/turbo/dash, STOP that row.

WORKSTREAM 2 — SWAP
- Copy accepted ingest outputs over the three targets in the working tree.
- Do not commit the rasters unless the repo's current rule allows owner-
  approved theme rasters on this lane. If the standing fence is still
  "records only, rasters uncommitted," leave them dirty for the owner's
  look-pass and say so. Prefer matching how R137 placeholders were
  handled: visible locally, committed only if main now accepts theme
  rasters.
- Leave idle / win / brace sheets untouched.

WORKSTREAM 3 — PROVE IN A BROWSER YOU START
- Own server, not 5173.
- Confirm h2.png and m3.png network responses are the new bytes
  (hash vs pre-swap).
- Confirm scene_character.png hash changed.
- Screenshot rest + a board that contains H2 and M3 if the mock/dev
  path can show them; otherwise show paytable / symbol atlas.
- 1280 and 390: no clip, no missing asset, zero console 404s.

RECORDS
SESSION_REPORT + dated archive. Brief verbatim.
State in one line whether the on-stage hero will or will not change
after this swap.

DO NOT
- Path 1 freeze / strip deletion (next brief if owner still wants it).
- Audio.
- Any other symbol.

CLOSE
PR or dirty working tree per the fence you find on HEAD.
Owner look-pass: hard refresh the preview after this lands locally.
