# Audio truth map

**Written R125, 2026-08-26.** What sound this game actually makes, what it does not, and
exactly what has to happen for the four missing stems to go live.

Everything here was read from the code and measured from the shipped files. Where a claim
came from running something, the command is named. Nothing in this document was inferred
from a previous document.

---

## 1. The one-line summary

Twelve stems ship and are wired. **Four moments have no stem: `feature_enter`,
`feature_end`, `retrigger`, `win_max`.** As of R125 all four have permanent, verified call
sites that fire at the right moment and stay silent, so each is one line of configuration
away from being live. No placeholder audio was created, and none should be.

---

## 2. Inventory: every cue, its file, and its call site

Files live in `frontend/public/assets/themes/future-spinner/sounds/`. Paths are built in
`frontend/src/lib/stores/themeStore.ts:88-101`; the player is
`frontend/src/lib/services/soundService.ts`.

| Moment | File | Duration | Play function | Fired from | Wired? |
|---|---|---|---|---|---|
| BGM bed | `bgm_loop.{mp3,webm}` | 88.30s loop | `playBGM()` | `App.svelte:1402` | yes |
| BGM, Overdrive bed | `bgm_tension.{mp3,webm}` | 57.78s loop | `setOverdriveBed()` | `overdriveVisual` store subscription | yes |
| UI click | `ui_click.mp3` | 0.04s | `playUIClick()` / `playClick()` | HudOverlay ×9, FeatureMenu ×8, PaytableModal, IntroSplash | yes |
| Spin start | `spin.mp3` | 0.31s | `playSpinStart()` | `GameGrid.svelte:984` | yes |
| Reel stop | `reel_stop.mp3` | 0.18s | `playReelStop(i)` | `GameGrid.svelte:445,516`; `FreeSpinsPresentation.svelte:315,353` | yes |
| Reel stop, last reel under anticipation | `reel_stop_anticipation.mp3` | 0.31s | `playReelStop(4)` | same, branch inside `playReelStop` | yes |
| Anticipation build | `anticipation_build.{mp3,webm}` | 3.49s loop | `playAnticipation()` | `GameGrid.svelte:1042,1134` | yes |
| Anticipation stop | (same file, stopped) | - | `stopAnticipation()` | `soundService.ts` only: `playReelStop()` on the last reel, and `setMuted(true)` | yes |
| Scatter lands | `scatter_land.mp3` | 1.50s | `playScatterLand()` | `GameGrid.svelte:446,517` | yes |
| Win, small (<10×) | `win_small.mp3` | 0.67s | `playWin()` | `App.svelte:871,1709,1729`; `ReplayMode.svelte:320,351,395,416` | yes |
| Win, medium (10-29.99×) | `win_medium.mp3` | 1.50s | `playWin()` | as above | yes |
| Win, big (30-99.99×) | `win_big.mp3` | 2.34s | `playWin()` | as above | yes |
| Win, epic (100×+) | `win_epic.mp3` | 3.66s + 800ms echo | `playWin()` | as above | yes |
| Mute / unmute |, (no sound of its own) |, | `setMuted()` | `isMuted` store subscription | n/a |
| **Feature trigger** | *(no dedicated stem)* |, |, | announced by `scatter_land` ×N plus the escalation ladder | **partial** |
| **Feature enter** | **MISSING** |, | `playFeatureEnter()` | `FreeSpinsPresentation.svelte`, `runEntrySequence()` | **hook live, silent** |
| **Feature active** | *(no dedicated stem)* |, |, | covered by the `bgm_tension` bed swap | by design |
| **Retrigger** | **MISSING** |, | `playRetrigger()` | `FreeSpinsPresentation.svelte`, settled retrigger moment | **hook live, silent** |
| **Feature end** | **MISSING** |, | `playFeatureEnd()` | `FreeSpinsPresentation.svelte`, `toEnd()` | **hook live, silent** |
| **Max win / wincap** | **MISSING** (reuses `win_epic`) |, | `playMaxWin()` | `App.svelte:1709`; `ReplayMode.svelte:320,395` | **hook live, falls back** |

Three things in that table are easy to misread, so they are stated plainly:

- **Max win is not silent today.** It plays the epic stinger and its 800ms echo, and has
  done deliberately since R5 (`soundService.ts`, `playWin`'s doc comment). What it lacks is
  a cue of its *own*. `playMaxWin()` therefore falls back to exactly today's behaviour when
  no dedicated stem exists, turning it on is an upgrade, never a regression.
- **"Feature active" is not a gap.** The Overdrive bed swap (`bgm_loop` → `bgm_tension`,
  600ms crossfade) is the feature-active cue, and it is wired and verified.
- **"Feature trigger" is only a partial gap.** The scatters that trigger it each sound
  `scatter_land`, escalating through `scatterEscalation`. There is no separate "you have
  triggered the feature" stinger, but the moment is not unsounded. Adding one is optional
  and is *not* in the four below.

---

## 3. The missing-stem matrix

| Moment | Current file | Wired? | Status | Required filename | Spec |
|---|---|---|---|---|---|
| Feature enter | none | yes, silent | **MISSING** | **feature_enter.mp3** | 1.2s. Front-loaded impact, decaying tail. Turbo compresses the entry animation to ~404ms, so the cue must land its hit in the first ~300ms and not depend on its tail. Announce-and-open, not a win. |
| Retrigger | none | yes, silent | **MISSING** | **retrigger.mp3** | 1.2s, hard cap 1.5s (the moment holds 1600ms). Bright, additive, clearly "more". Must not read as a win-tier chime, the win ladder owns that vocabulary. |
| Feature end | none | yes, silent | **MISSING** | **feature_end.mp3** | 1.5s. Resolving, downward, closing. Plays under the total-win banner's count-up, so it must sit below it: no bright transient in the first 400ms. |
| Max win | `win_epic.mp3` (shared) | yes, falls back | **MISSING** | **win_max.mp3** | 5.0s. The largest sound in the game; it must clearly exceed `win_epic` (3.66s). App dwells 2600ms on the board before the celebration modal, so the first 2.6s carries the reveal. |

Byte budget: `build_diet_verify` reports dist at 23.31MB against a 25MB ceiling, so 1.69MB
of headroom. At the shipped stems' own encode density these four come to roughly 230KB
together. Not a constraint, but do not let `win_max` balloon.

---

## 4. Implementation readiness, cue by cue

All four hooks exist and were verified firing in R125. The verification method matters:
a hook that is correct today fires and makes no sound, which is indistinguishable from a
hook that is never called, so `soundService.ts` carries a dev-only `__pendingCueTrace`
counting `fired` and `played` per cue, in the same spirit as the existing `__bedSwapTrace`.
Measured at R125: `featureEnter` and `featureEnd` both `fired: 1, played: 0` on a boot that
replayed an interrupted feature round, with the entry overlay confirmed on screen in
`stage-flare` at t=711ms and cleared at t=2060ms, the hooks track the visible presentation.

### 4.1 `feature_enter`
- **Exact path:** **frontend/public/assets/themes/future-spinner/sounds/feature_enter.mp3**
- **Function that plays it:** `playFeatureEnter()` in `soundService.ts`
- **Fires from:** `FreeSpinsPresentation.svelte`, first statement of `runEntrySequence()`
- **When:** the instant the entry flare paints, before the dip/gauge/burst stages
- **Hook exists?** Yes, added R125. **New hook needed?** No.
- **Why there and not in `start()`:** `startFrom()` (the TR-099 resume) deliberately skips
  the entry sequence. A feature resumed mid-round must not replay its entry stinger, and
  hooking inside `runEntrySequence()` inherits that correctness instead of restating it.
- **Duck BGM?** **No.** This moment already carries a musical event, the 600ms
  `bgm_loop`→`bgm_tension` crossfade fires at the same boundary via `overdriveVisual`. A
  duck here would fight `rampVolume()` mid-crossfade. If ducking is wanted later it must be
  designed *with* the crossfade, not stacked on it.

### 4.2 `retrigger`
- **Exact path:** **.../sounds/retrigger.mp3**
- **Function:** `playRetrigger()`
- **Fires from:** `FreeSpinsPresentation.svelte`, inside `runRetriggerLadder(spin).then(...)`,
  immediately before `retriggerMoment = true`
- **When:** after the capped per-reel ladder has finished, on the settled award
- **Hook exists?** Yes, added R125. **New hook needed?** No.
- **Why after the ladder:** each reel of the ladder already sounds `playReelStop(r)`. Firing
  the retrigger cue during the ladder would race those; firing it on the settled moment
  marks the award itself.
- **Duck BGM?** No. Short, and the bed is already the tension bed here.

### 4.3 `feature_end`
- **Exact path:** **.../sounds/feature_end.mp3**
- **Function:** `playFeatureEnd()`
- **Fires from:** `FreeSpinsPresentation.svelte`, first statement of `toEnd()`,
  **guarded on `script?.triggered`**
- **When:** as the feature closes, immediately before the total-win banner is raised
- **Hook exists?** Yes, added R125. **New hook needed?** No.
- **Why the guard:** `toEnd()` is also the exit of `start()`'s wincap *walkthrough*, a base
  game round that reached the cap and never entered the feature at all. Unguarded, the cue
  would announce the end of a feature that never happened.
- **Duck BGM?** No, but note it lands within ~600ms of the bed crossfade back to
  `bgm_loop`. Audition against that crossfade, not in isolation.

### 4.4 `win_max`
- **Exact path:** **.../sounds/win_max.mp3**
- **Function:** `playMaxWin(multiplier)`
- **Fires from:** `App.svelte:1709` (live), `ReplayMode.svelte:320` and `:395` (replay,
  both wincap reveal branches)
- **When:** at the wincap reveal, before the 2600ms board dwell and before
  `MaxWinCelebration` takes the screen
- **Hook exists?** Yes, added R125. **New hook needed?** No.
- **Fail-safe:** `playMaxWin()` plays the dedicated stem if present and otherwise calls
  `playWin(multiplier)`, today's epic-plus-echo. It cannot introduce a silence.
- **Duck BGM?** **Yes, and this is the one that should.** It is the loudest moment in the
  game and nothing else musical happens at that boundary. The pattern is already in this
  file: set `bgmDuck`, assign `sounds.bgm.volume = musicVol * bgmDuck`, restore on a timer,
  exactly as `playSpinStart()` does with `BGM_DUCK_SPIN`. Suggested duck 0.3 for the stem's
  length plus ~500ms. **Not implemented at R125 on purpose:** a duck's correctness is
  audible, not structural, and cannot be judged without the file.

### 4.5 One inconsistency found while mapping, not fixed here
On the **bought** feature path, `App.svelte` plays the round's win cue *after* the
presentation (`App.svelte:871`), with no reveal-time cue when a bought round hits the cap -
whereas the ordinary spin path plays it at the splash before the COLLECT wait
(`App.svelte:1709`). So a bought max win and a spun max win sound different. Out of scope
for R125's fence (hooks only, no new audio), recorded here so it is not rediscovered.

---

## 5. Acquisition route

### 5.1 The route already exists, in this repository
The twelve shipped stems were not bought. They were generated by **`tools/audio_forge/`**,
a local, deterministic, licensed pipeline built for this game, and mastered by
`tools/audio_forge/master.py`. Provenance is on record in
`reports/audio/GENERATION_LOG_2026-07-13.md` and the sounds directory's own `README.md`.

**It is runnable on this machine right now.** Verified at R125:
`tools/audio_forge/.venv` exists, torch 2.7.1 with MPS available, `stable_audio_tools`
importable, and all three model repos already in the local Hugging Face cache
(`stable-audio-3-medium`, `-small-sfx`, `-small-music`). No download, no setup, no purchase
stands between the project and these four files.

This is the recommended route, and it is not a shortcut: it is the same route, same model,
same seed discipline and same mastering as everything already shipping, which is the only
way the four new cues will sit in the same sonic world as the twelve they join.

### 5.2 Exactly what the next session does
1. Add four rows to `MANIFEST` in `tools/audio_forge/generate.py`. Row shape is
   `(name, seconds, prompt, is_loop)`, all four are `is_loop=False`. Use the durations in
   §3 and keep the shared `SFX_PREFIX` and `NEGATIVE_PROMPT` untouched so the four match
   the existing palette.
2. Add the same four names to `ROWS` in `tools/audio_forge/master.py` as
   `{"is_loop": False}`.
3. `cd tools/audio_forge && .venv/bin/python generate.py --only feature_enter` (and the
   other three). Each row generates four candidates at `BASE_SEED + [0,1,2,3]` =
   20260707-20260710, into `~/Desktop/fs_audio/candidates/<name>/`. **Nothing generated
   there is ever committed.**
4. Audition, then `.venv/bin/python promote.py <name> <seed>` for the chosen candidate.
5. `.venv/bin/python master.py <names>`, silence trim, `-3.0 dBFS` SFX peak target,
   MP3 encode straight into the theme sounds directory.
6. Two one-line wirings per cue: add the key to `AVAILABLE_PENDING_CUES` in
   `soundService.ts`, and add its path to the `sounds` map in `themeStore.ts`. Nothing else
  , the hooks are already at the right call sites.
7. Append the run to `reports/audio/GENERATION_LOG_2026-07-13.md` (or a new dated log) with
   per-file model, seed and prompt, and add the four rows to the sounds `README.md` table.
8. Re-run `node frontend/scripts/audio_verify.mjs`. Confirm `zeroSoundRequestFailures` and
   `zeroConsoleErrors` still hold, and confirm `__pendingCueTrace` now shows `played > 0`
   for each cue turned on, `fired > 0, played === 0` means the file did not resolve.

### 5.3 Licensing, read this before shipping for real money
Generated audio is covered by the **Stability AI Community License Agreement** (dated
5 July 2024), archived in-repo at `tools/audio_forge/LICENSE.md` with attribution in
`tools/audio_forge/NOTICE`. Two clauses matter for a real-money game and are quoted in
substance from that file:

- **Commercial use requires registration.** Section III grants a royalty-free commercial
  licence but states the licensee "must register with Stability AI at
  https://stability.ai/community-license". This is an owner action; it is not something a
  build session can do or verify.
- **There is a revenue ceiling, and it is not scoped to the audio.** The same section:
  if the licensee or its affiliates, individually or in aggregate, generate more than
  **USD $1,000,000 in annual revenue**, "regardless of whether that revenue is generated
  directly or indirectly from the Stability AI Materials", the licence **terminates**, and
  an Enterprise licence must be requested, which Stability "may grant ... in its sole
  discretion."

For a slot game intended to earn, that ceiling is a live business risk rather than a
theoretical one: success is the trigger condition. The licence also carves out downstream
recipients ("If you receive Stability AI Materials ... as part of an integrated end user
product, then Section III ... will not apply to you"), so the exposure sits with the studio,
not with the operator or the player.

This is a summary of clauses in a file in this repository, not legal advice. The owner
should confirm registration and decide, deliberately, whether the studio is comfortable
with that ceiling before more of the soundtrack depends on it.

### 5.4 What to use if the licence is not acceptable
If the ceiling is unacceptable, the four cues must come from a source with a **perpetual,
irrevocable, revenue-uncapped** grant. In practice that means one of:

- a **buyout / work-for-hire commission** from a composer, with copyright assigned or a
  perpetual worldwide licence explicitly covering real-money gambling;
- a **royalty-free library licence** that names gambling/casino use as permitted and does
  not terminate on revenue (read the extended/enterprise tier, not the standard one);
- **CC0 / public domain** source material, with the provenance archived at adoption time.

Under that route, the pragmatic split is to leave the twelve existing SFX where they are
and commission the pieces that carry the game's identity, the two beds and `win_max` -
since those are the most audible and the most costly to be forced to replace later.

**What must not be used, under any route:** anything whose licence is unclear, anything
whose terms are silent on gambling, "free download" material without an archived licence
file, and anything sourced from a model whose training-data or output-rights position is
not documented. The in-repo pattern is the standard: licence text committed next to the
tool, a NOTICE with the attribution line, and a generation log naming model, seed and
prompt per file. Any new source must arrive with the same paperwork or it does not go in.

### 5.5 Delivery format, whichever route is taken
Non-negotiable, because `master.py` and the runtime both assume it:

- **Deliver:** 44.1kHz stereo WAV, unnormalised, no fades applied, no silence padding.
  Put them in `~/Desktop/fs_audio/<name>.wav`, the exact path `master.py` reads.
- **Filenames, exactly:** `feature_enter`, `feature_end`, `retrigger`, `win_max`.
- **Do not deliver MP3.** `master.py` produces the MP3; a re-encode of an MP3 is a second
  generation loss.
- **Mastering is the pipeline's job, not the supplier's.** `master.py` applies silence trim
  and a `-3.0 dBFS` peak target for one-shots. Pre-normalised or pre-limited material fights
  it.
- **None of these four loop**, so none get the WebM/Opus second encode, MP3 only, which is
  what `ROWS`' `is_loop: False` means.

### 5.6 How Claude should ingest the files when they arrive
Do not accept a stem on its filename. For each one, before wiring: confirm it exists at the
expected path, read its real duration, sample rate and channel count from the file header,
check it against the §3 spec, and confirm it is not silent (peak well above the
`-60 dBFS` silence threshold `master.py` uses). A file that fails any of those is refused
and reported, not wired, the same first-hand-measurement rule R122-R124 applied to art.
Then wire, then re-run `audio_verify.mjs`, then confirm `__pendingCueTrace.played` moved.

---

## 6. What this document does not cover

- **The win-tier loudness ladder is not re-derived here.** It was set at R117 to an even
  ×1.284 per step and is unchanged.
- **No listening test was performed.** Every duration and byte size here was read from a
  file header. Nothing in this document is a judgement about how anything *sounds*.
- **`win_max`'s BGM duck is specified but not implemented**, for the reason in §4.4.
- **The bought-max-win timing inconsistency in §4.5 is recorded, not fixed.**
- **Localisation of audio is out of scope**, no cue in this game carries voice, so the
  sixteen locales do not bear on it.
