R148: LOOP JOIN + FIRST-CLICK BED RESUME.

Fence: no new audio files, no image gen, no maths, no HUD geometry,
no hero sheets. 5173 untouched. Review lane.

PRECONDITIONS
Merge #183 if still open and green. Checkout main. Confirm
bgm_loop is the restored scratchy-but-seamless encode
(take A parked). Confirm 16-bar master exists on disk at
sounds/ or .scratch as bgm_loop_16bar.wav from the final pack.

BUG 1 — loop join
Symptom: idle bed cuts and restarts. Not a new composition.
Fix, try in this order, stop at first that audio_verify and
an ear-check pass:
  A. Point the idle <audio>.loop source at a 16-bar encode of
     the SAME bed (43.636 s / 2,094,545 @ 48k). Encode through
     the existing wrapper. Skip the 500 ms fold. Dist cap must
     still clear.
  B. If A blows the cap or still clicks, dual-element crossfade
     at the wrap (two bgm_loop elements, 40 ms equal-power),
     same pattern as the hero dissolve. Do not invent samples.
  C. Web Audio AudioBufferSourceNode loopStart/loopEnd on the
     existing buffer only if A and B fail. Keep mute, duck,
     and the 600 ms overdrive crossfade working.

Prove: 30 s idle with no spin, screenshot or meter the wrap.
audio_verify loopSeamsWithinTolerance must stay green on the
file. Reduced-motion unchanged.

BUG 2 — first click kills the bed
Symptom: sound on reload, click through splash/continue, bed
dies until first spin.
Cause already on file: first-gesture warm-up pauses the bed
and nothing resumes it unless playSpinStart runs.
Fix: any first user gesture (pointerdown, click, key, splash
dismiss, TAP TO CONTINUE) must resume or call playBGM() if
the bed is paused and mute is off. Splash/intro must not
pause-without-resume. First spin must not be the only restart.
Mute still stops every voice.

Prove in browser, two loads:
  1. Reload, wait, click splash/continue, wait 3 s, NO spin.
     Bed is audible.
  2. Reload, press Space or Enter first, no click.
     Bed is audible.
  3. Mute then unmute still restores the bed.
Control: first spin still ducks 8 dB for 1.8 s.

Do not change call sites in GameGrid except if playBGM must
be invoked from the existing splash/continue handler.
Commit separately from the loop change.
Self-audit the diff. PR review lane.
