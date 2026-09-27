R149: CIRCULAR IDLE BED ONLY.

Source (do not search Downloads):
  ~/math-sdk/.scratch/art-review/chatgpt-bgm-loop-circular/bgm_loop.wav
  cell_raw is provenance only — do not encode or ship it.

Fence: replace only the idle-bed master and its encoded
bgm_loop.{mp3,webm}. Do not touch loopBed.ts, soundService.ts,
bgm_tension, anticipation_build, any one-shot, any raster,
maths, HUD, hero. 5173 untouched. Review lane.

PRECONDITIONS
#184 merged or cherry-pick if still open — this session assumes
the Web Audio idle bed is live. Confirm frames of the new master
are exactly 523636 at 48000 Hz. If not, STOP.

TASK
1. Fingerprint current shipped bgm_loop.{wav,mp3,webm}.
2. Copy the new master over
   frontend/public/assets/themes/future-spinner/sounds/bgm_loop.wav
   only if that wav path is how masters live; if masters live
   outside the theme tree, follow the R146 wrapper path exactly.
3. Re-encode through the existing wrapper. Skip the 500 ms fold —
   this file is already a 4.00000-bar cell. Do not invent a wrap.
4. audio_verify must stay green on the file seam.
5. Dist still under cap. No WAV in the kit if the pipeline
   already strips them.
6. Provenance note: ChatGPT circular rebuild 2026-09-27,
   0.421 dB first/last 20 ms RMS, 37.85% energy above 200 Hz,
   L/R corr 0.776. Take A still parked.

Prove idle 25 s with no spin on your own port, not 5173.
If Web Audio is live the wrap is sample-exact; this commit is
only the new samples. Ear-check is the owner's.

Commit separately. PR review lane.
