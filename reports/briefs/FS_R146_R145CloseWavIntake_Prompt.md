R146 after R145 close. Two phases in one session. Review lane. Unattended.

THE FENCE
No maths. No HUD geometry. No hero animation rewrite.
Do not delete ui_click.mp3.
Do not commit MANIFEST.txt.
Do not stage unrelated WIP rasters.
Owner preview on 5173 is untouched. Use another port.

============================================================
PHASE 0 — CLOSE R145 BEFORE ANY AUDIO WORK
============================================================
1. git fetch origin. Identify PR #181 / branch claude/r145-astra-static-proof
   (or whatever the open R145 branch is).
2. If #181 is open, CI green, and not merged:
   checkout that branch, pull, confirm HEAD contains the three ingested
   rasters (scene_character.png, symbols/h2.png, symbols/m3.png).
   Merge to main via the repo's normal review-lane close (gh pr merge
   only if that is how this repo merges; otherwise push and open/merge
   per CLAUDE.md). Then checkout main and pull.
3. If #181 is already merged, checkout main, pull, confirm those three
   files are on main.
4. Owner ruling for the H2/M3 resample finding, recorded in the report
   as OWNER RULING B: accept H2 and M3 as ingested. Do not regenerate.
   Do not drop them from the PR. Path 1 freeze (rest = scene_character.png)
   is NOT this session.
5. Confirm arc2-baseline still resolves. Tree after merge: no leftover
   R145 session branch as the working checkout. Proceed from main only.

STOP if #181 is red or missing the three rasters. Report and do not
start Phase 1.

============================================================
PHASE 1 — INTAKE THE DROPPED WAV STEMS
============================================================
Owner already extracted, code names already correct:

  ~/math-sdk/frontend/public/assets/themes/future-spinner/sounds/

Expected wavs (must exist before you encode):
  bgm_loop.wav
  bgm_tension.wav
  anticipation_build.wav
  spin.wav
  reel_stop.wav
  reel_stop_anticipation.wav
  scatter_land.wav
  win_small.wav
  win_medium.wav
  win_big.wav
  win_epic.wav
  win_max.wav
  feature_enter.wav
  feature_end.wav
  retrigger.wav

Leave the wavs on disk as masters. Do not rename.
ui_click has no new wav — keep shipped ui_click.mp3.

TASK 1.1 inventory
List the folder. Map each new wav to the live mp3/webm the game
actually loads. Read soundService.ts load paths and
tools/audio_forge/master.py ROWS / AVAILABLE_PENDING_CUES.

TASK 1.2 encode through the real pipeline
Run master.py (or the project's existing encode path) so each wav
becomes what soundService already requests:
  three loops  -> webm + mp3 fallback
  one-shots    -> mp3
Beds must land at the pipeline -18 LUFS target, not the wav audition
-14. Do not bake spin/anticipation ducks into the files.

If master.py's 500 ms seam fold would shorten a pre-wrapped 4-bar
loop and break the 88 BPM / 523636-at-48k lock, skip that fold for
these three beds and record why. These wavs are already wrapped
with a 40 ms equal-power fold.

TASK 1.3 flip the four previously silent/pending cues
feature_enter, feature_end, retrigger, win_max must resolve to real
encoded files and be removed from any pending/missing list.
Mute must still kill anticipation_build — it is now a loop the code
stops dead, not a one-shot.

TASK 1.4 do not change play-call sites in App / GameGrid / banners
Keep existing function names. Only the bytes behind the names change.

TASK 1.5 verify
- every live cue has its expected extension next to the wav master
- built bundle references the four newly-live cues
- playBGM / setOverdriveBed / playAnticipation still point at
  bgm_loop / bgm_tension / anticipation_build
- reduced-motion and mute paths unchanged
- dist cap respected (wav masters must not enter dist if the build
  only packs mp3/webm — confirm)
- 5173 untouched

Report
- R145 merge SHA
- encoded sizes + LUFS if measured
- which four cues flipped from silent/pending to live
- whether the 500 ms seam fold was skipped
- restore command for the previous mp3/webm if the owner hates the mix

Close as a review-lane PR. Do not package a kit.
