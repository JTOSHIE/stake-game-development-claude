# R148 - THE IDLE BED LOOPS WITHOUT A CUT, AND NO FIRST GESTURE SILENCES IT (2026-09-27)

Loop join and first-click bed resume, review lane. Brief saved verbatim at
`reports/briefs/FS_R148_LoopJoinFirstClickBed_Prompt.md` per convention (f). Branch
`claude/r148-loop-join-bed-resume`. Ultracode on: two workflows (a read-only map, 7 agents; an
adversarial self-audit of the whole diff, 8 agents), every figure then re-derived first-hand.

## Preconditions

- #183 was already merged when the session began (from the owner's account, 2026-09-27T05:02:33Z,
  merge `cff0e577`); main CI run 36296048701, push, 30 of 30 green. Nothing was merged here.
- `bgm_loop` on main is the restored original-drop encode (webm fef77037, mp3 a902311d, the blobs
  of 0d060d9f); take A is parked (`~/Downloads/bgm_loop-take-A/`, sha 59cbe76c...).
- **The 16-bar precondition fails as written.** `bgm_loop_16bar.wav` (sha f1ad4285...) exists only
  in the final pack, `~/Downloads/future-spinner-audio-final/loops/`, not in the sounds folder or
  `.scratch`. The pack's own `bgm_loop.wav` is byte-identical to the shipped master (77556d1d).
  Option A was not built, so the file was not copied anywhere.
- Session-start fingerprint: clean tree; 2,724 tracked raster SHA-256s; the sounds folder hashed.

## What the map found (measured, not assumed)

- **The loop join is not in the file.** decodeAudioData returns exactly the 523,636-frame loop and
  its seam is 1.50 / 1.47 dB; audio_verify's file gate is green and cannot see the cut.
- **It is the <audio> element's loop.** Timed with nothing attached (an audio tap perturbs the
  element: captureStream adds about 180 ms, a MediaElementSource tap shrinks it), the wrap period
  is 10,959 to 10,969 ms against 10,909 ms of audio, a stall of about 50 to 60 ms every wrap,
  webm and mp3 (my own re-run: webm 10,964.3 / 10,959.5, mp3 10,968.5 / 10,963.6 ms). It is a
  timing proxy; whether it is heard is the owner's ear.
- **The first click killed the bed.** warmUpAudio() played and paused EVERY element, the bed
  included, and playBGM() was latched shut by `bgmStarted`. The first spin never restarted it
  (playSpinStart only ducks); only a feature exit did. Mute then unmute did not restore it either.

## Bug 1: the loop join (commit d15fa734)

The brief's order, stopping at the first that passes audio_verify and an ear-check:
- **A, a 16-bar encode:** measured on a scratch encode, it still stalls, 43 to 48 ms at its 43.6 s
  wrap (two single-wrap samples): the same cut four times rarer. Not shipped.
- **B, two elements crossfaded 40 ms:** not built into the game. A 40 ms overlap of the file's own
  samples makes every cycle 3.9853 bars, R147's F1, which the owner rejected because it breaks the
  4-bar lock. (A scratch prototype reached 33.0 to 39.7 ms overlaps.) **This departure from the
  brief's A, B, C order is put to the owner in the PR.**
- **C, shipped:** new `frontend/src/lib/services/loopBed.ts`. LoopBed stands in for the bed's
  element with the surface soundService drives, so mute, applyVolumes, both ducks, the warm-up and
  the 600 ms Overdrive crossfade are unchanged; it loops the decoded bgm_loop buffer on one
  AudioBufferSourceNode at 48 kHz. No audio file changed; dist grows 4,794 B (18,705,041 to 18,709,835 B, the same 105 files), far
  inside the 26,214,400 B cap.
  Any failure falls back to the looping element, and building it can never throw out of module
  load. The tension bed and the anticipation riser stay elements (the brief scopes the idle bed).

## Bug 2: first gesture resumes the bed (commit 6a4ddd77)

soundService.ts only; no App, HeroSplash or GameGrid call site. The warm-up leaves a playing
element alone and keeps a primed bed playing when it should sound; playBGM decides from the beds'
state, reconciles the bed after an Overdrive boundary passed while muted, and arms one capture-phase
starter (pointerdown, click, keydown) that stays armed until a start succeeds.

## The self-audit changed the work

Eight agents over the whole diff: 18 confirmed findings, the rest refuted or uncertain.
- **A touch regression (major, reproduced three ways).** A touch tap's pointerdown carries no user
  activation and its click does; LoopBed read a refused-but-pending start as playing, so the click
  skipped play() and the tap was lost, on the splash and on Bet Replay START. Fixed: before
  activation play() refuses at once and never calls resume(); with activation it resumes inside the
  gesture; `paused` stays true until the source starts; only the newest play() can cancel a start.
- **A new console warning.** The first cut logged Chrome's "AudioContext was not allowed to start"
  on every load; the same change removes it (measured: none on the final build).
- **My proofs were weaker than claimed.** Playwright's locator.waitFor and boundingBox grant user
  activation, exactly as evaluate does, so the first harness never modelled a first visit; and its
  output verdict read a context that never ran as audible. Rebuilt: readiness and coordinates come
  over the console, activation is asserted false before every first input, a context that never
  ran reads NOT-RENDERING, and two seeded reds must stay silent.
- **The committed proofs went blind to the bed.** r043 counted only element play() calls; it now
  also records Web Audio starts, and its self-test gained a seed (commit 0d381268).
- Record fixes: B described as rejected on design grounds, not measured; the stall ranges widened
  to cover every run; the ear-check and iOS behaviour stated as open. The two code commits were
  rewritten before any push (the first's tree is byte-identical to the original), so their
  messages state the evidence as it now stands.

## Evidence on the final code

All on a dist whose code is identical to the committed build (the only difference is the dirty
label in the build stamp), headless Chromium, fake origins, no port except audio_verify's ephemeral
one and r043's 4527. **5173 was never bound** (it carried the owner's own server during the session).

| Proof | Result |
|---|---|
| Wrap: 34 s idle, no spin, tap on the speaker path, 3 policies | 3 wraps each; output = 0.5 x decoded bed, residual 0.0 whole run and within 20 ms of each wrap; no silence over 2 ms; no lag jump |
| Tap calibration, same path | a planted 144-zero gap reads as exactly 144-sample silences at both wraps |
| Spin duck, from the bed's own gain | 0.5 to 0.2 (x0.4, -7.96 dB) from 30 ms after the click, held 1,790 ms, then 0.5 |
| First visit, activation asserted false, 13 cases (mouse, touch, keys, mute, persisted mute, reduced motion, Bet Replay by mouse and touch), default policy | final 13/13 audible; main 7/13 silent; the first cut of C 3/13 not rendering (every single touch tap) |
| Same, no-user-gesture-required (the "sound on reload" case) | final 13/13 audible; main 10/13 silent |
| Seeded reds (no input; Escape only), default policy | silent or not rendering on every build |
| Mute across an Overdrive boundary, both directions | main plays the wrong bed; final the right one alone |
| Overdrive in and out | base bed fades out and back over about 600 ms |
| Fallbacks: constructor throws, decode fails, no Web Audio | each boots and plays the bed through the element, 0 page errors |
| Console on a gesture-free load | no warning or error (first cut: the autoplay warning every load) |
| audio_verify (port 53530) | ALL CHECKS PASS, loopSeamsWithinTolerance included (1.50 / 1.47 dB) |
| r043, extended | self-test PASS (3 seeds caught); proof PASS 11/11; mute 0 of 0 |

**Both CI suites run locally on the final tree 98a0762b:** static job 82 of 83 run steps green, 0
failed (`npm ci` skipped locally; CI runs it); browser matrix 28 of 28 green.

**Remote CI (rule 10):** recorded by full SHA in the paragraph that follows, after the push.

**Owner preview NOT refreshed:** the brief keeps 5173 untouched and nothing landed on main.

## Restore

- Bug 2: `git revert 6a4ddd77`. Bug 1: `git revert d15fa734` (the bed returns to the element).
  Proofs: `git revert 0d381268`. Records: `git revert 98a0762b`. Once merged: revert the merge.

## OWNER WAITING LIST

1. **Ear-check at the wrap** (the brief's stop rule). Listen through an idle bed past 10.9 s and
   21.8 s: it should not cut. *Owner.*
2. **Rule on the departure from A, B, C:** A measured and rejected; B rejected on R147's 4-bar
   ruling without being built; C shipped. *Owner ruling.*
3. **iOS and Safari on a device:** the silent switch (does the bed mute while effects still sound?),
   lock and return, a phone call, AirPods. UNKNOWN here. If the switch mutes it, the fix is
   `navigator.audioSession.type = 'playback'` where supported, or the element bed on iOS.
   *Owner device check.*
4. **The tension bed and the anticipation riser** still loop as elements, so they still stall at
   their wraps during features; LoopBed would take them in a line each. *Owner scope ruling.*
5. **Still open from R147's audit:** D2 (the tension bed stays ducked if a feature starts inside
   the spin duck), D4 (the spin duck's timer lifts the bed mid-riser), D5 (the heard win levels).
   *Code, own brief.*
6. **The pack's provenance statement** ("composed and synthesised originally", "no licensed stem")
   is the pack README's claim, REPORTED, not verified; it bears on R147's open question of the
   stems' licence. *Owner to confirm and record.*
7. **The splash's keyboard dismissal needs focus** (HeroSplash's keydown sits on an unfocused div):
   Space and Enter now start the bed but leave the splash up. *Owner UX call.*

## FOR THE NEXT SESSION

**Model and effort:** Opus 5.5, ultracode. Workflows: the map (7 agents, about 1.55M subagent
tokens) and the self-audit (8 agents, about 1.87M). **Plan of record, stated late:** the map ran
before a written plan; the brief's own order served as the plan.

**Approach:** preconditions; map by workflow with a critic; re-measure first-hand; Bug 2 first
(smaller, independent), then Bug 1 by the brief's order; an adversarial self-audit; act on it,
including rebuilding the proofs; rewrite the unpushed record; both local suites; push; PR.

**Alternatives rejected:** A (still stalls); B (R147 F1); a Web Audio tap on the element as proof
(it perturbs the element); copying the 16-bar master in (A not built); regenerating any evidence;
suspending the context when the bed pauses (a restart outside a gesture could then fail on iOS).

**Files:** `frontend/src/lib/services/loopBed.ts` (new), `soundService.ts`, `r043_replay_audio_proof.mjs`,
`audio_verify.mjs` (a comment), `docs/audio/AUDIO_TRUTH_MAP.md`, the sounds README, the ledger, the
brief, and this report with its dated archive.

**Lessons worth keeping:** a Playwright locator call grants user activation just as evaluate does;
an output-based verdict must fail closed when nothing renders; a pending Web Audio start is not a
playing one; and a resume() made before activation stays pending until a later one succeeds.
