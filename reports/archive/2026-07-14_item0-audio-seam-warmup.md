# Session Report: ITEM 0, Audio seam and warm-up fix

- **Date:** 2026-07-14
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/audio-seam-warmup-item0` (off `main`).
- **Source:** `FS_NextWorkOrder_2026-07-14_Prompt.md`, ITEM 0. Gates the owner's mix
  play-test per the work order's own instruction.

## What changed this pass

**1. Loop-conditioning (`tools/audio_forge/master.py`).** Added
`condition_loop_seam()`: folds the final 500ms of a loop into its head via an
equal-power crossfade, then trims the (now-redundant) tail off - the standard
seamless-wrap-loop technique. The new clip's start is (almost) the source's own
natural continuation of what used to be its last sample, fading across to the
original head content over the crossfade window, so both the wrap point and the
chronological continuity read naturally. Added `measure_seam_rms_delta_db()`
(informational, logged during mastering) and wired both into `master_row()` right
after the existing bar-align/seamless-cycle trim, before loudness normalisation.

**Real, measured result - not uniform across the three rows:**

| Row | Seam RMS delta (Python, pre-encode) | Seam RMS delta (browser, shipped webm/mp3) | Verdict |
|---|---|---|---|
| `bgm_loop` | 0.17dB | 0.04dB / 0.15dB | PASS, comfortably |
| `bgm_tension` | 0.02dB | 0.22dB / 0.02dB | PASS, comfortably |
| `anticipation_build` | 6.75dB | 6.69dB / 6.72dB | **FAIL - 3x over the 2dB tolerance** |

Investigated why before writing this up: `anticipation_build`'s source is a rising
"build" texture with rapid transient/noise-like fluctuations (30ms-resolution RMS
scan of the raw source swings roughly -14 to -29dBFS inside just the first 100ms),
not a smooth tonal pad like the two beds. An equal-power crossfade blends the levels
correctly (confirmed: the two beds prove the *implementation* works), but a strict
20ms window at the very edge of noisy, transient-heavy content just samples
wherever that transient happened to land - the beds are periodic/tonal and blend
cleanly; this one is not. This is a genuine content limitation, not an
implementation bug. **Flagging for a decision rather than silently loosening the
gate or forcing a pass**: either accept the current seam as shipped (anticipation
phases are typically short and the loop point may rarely be reached in real play),
regenerate this row with cleaner edge material, or grant a documented, sanctioned
exception specifically for this row's tolerance.

**2. Re-mastered and re-encoded all three loop rows, both formats** (MP3 + WebM
Opus), from the real promoted source WAVs at `~/Desktop/fs_audio/`, through the
updated pipeline. Confirmed via `ffmpeg -af ebur128` that the beds land at -18.2
LUFS (both before and after this pass, on both the old and newly re-mastered
files) - see the LUFS finding below.

**3. Seam metric added to `frontend/scripts/audio_verify.mjs` as a hard gate**
(`loopSeamsWithinTolerance`). Decodes the actual shipped bytes (both formats) via
the Web Audio API in-browser, not a re-check of the Python pipeline's own
self-report - measures the real end-vs-start 20ms RMS delta against the real
shipped audio a player would hear. Ran it for real:
`AUDIO VERIFY: FAIL` - every other check passes (spin/reel-stop/win sounds fire,
bed swap on bonus buy, bed reverts after the feature, zero request failures, zero
console errors); only `loopSeamsWithinTolerance` fails, and only on
`anticipation_build`, exactly matching the Python-side measurement. This is the
gate working as designed, not a regression - see the finding above.

**4. First-gesture audio warm-up.** Added `warmUpAudio()` to `soundService.ts`:
mutes, plays, and immediately pauses every `Audio` element once, on the player's
first `pointerdown`/`keydown` (wired in `App.svelte`, decoupled from `playBGM()`'s
own gesture listener, which only starts BGM playback). Idempotent, restores each
element's prior mute state. Checked whether "first-spin textures" needed the same
treatment: `GameGrid.svelte`'s existing `_prewarmArt()` already decodes every
symbol/fx texture at component mount, which happens before the first gesture in
the normal flow (confirmed by reading the render tree - `<GameGrid>` is not gated
behind the intro overlay) - no second, gesture-gated texture warm-up was added, since
one already exists and already fires early enough.

**5. Re-ran the frame-gate attribution.** The full 25-30 minute soak matrix wasn't
re-run for this alone; instead wrote a focused re-check
(`frontend/scripts/spin_click_warmup_recheck.mjs`, new) reusing the exact same
FPS-sampling/`logAction`/`attributeLongFrames` methodology as `qa_soak.mjs`, over 15
spins from a fresh page load (the same cold-start window the baseline's cluster sat
in). Baseline (`reports/qa/frame-gate-attribution-2026-07-13.json`, JOB 2,
pre-warm-up): 5 long frames total, 4 attributed to `spin-click` at 200-300ms delta,
2 of which landed within the first 3 seconds of their session. This pass: 1 long
frame total, attributed to `spin-click-4` at a 5ms delta, at t=6.3s (past the
3-second window) - **zero long frames in the first-3-second cold-start window this
time**, down from 2. Read plainly: the early cold-start cluster the fix targets
does appear to have shrunk to zero in this recheck, but the sample size (15 spins,
one page load) is much smaller than the baseline's full-soak run, so this is a
targeted spot-check, not a statistically rigorous before/after - flagging that
distinction rather than overclaiming a definitive fix from a small sample.

**6. Deleted legacy `sounds/scatter.mp3` and `sounds/win.mp3`.** Confirmed
unreferenced first (`grep -rn` across `frontend/src/` for both filenames - zero
hits) before removing via `git rm`.

**7. Moved `SUBMISSION_BLURB.md`** to `reports/archive/SUBMISSION_BLURB_superseded.md`
via `git mv` (preserves history), with a SUPERSEDED header pointing at
`SUBMISSION_DOSSIER.md` section 3. Updated the two documents that referenced its old
repo-root path (`AUDIT_PACK_INDEX.md`, `WRS_MASTER_DOCUMENT.md`) so neither points at
a now-wrong location.

## Real finding: the -21.8 LUFS instruction does not match independent measurement

The brief said to "note the measured -21.8 LUFS beds as accepted-as-shipped... correcting
the earlier -18 claim." Before writing that down as fact, measured it fresh, per this
project's own verification discipline: `ffmpeg -af ebur128=peak=true -f null -` against
the actual shipped `bgm_loop.mp3`/`bgm_tension.mp3` **before any change this pass**
(checked out from the last commit) showed **-18.2 LUFS** on both, not -21.8. After this
pass's seam-fix re-master, the same measurement on the newly-shipped files shows
**-18.2 LUFS again** (both webm and mp3) - matching the pipeline's own -18.0 target
almost exactly, both before and after. I do not have the method behind the -21.8
figure to reconcile the gap - one plausible explanation checked: `musicVolume`'s
default slider value is 0.5 (a *linear* amplitude scalar on `HTMLAudioElement.volume`,
not a dB value), so the *effective, in-game perceived* loudness at default settings
would land roughly 6dB below the file's own LUFS (in the same "quieter than nominal"
direction as -21.8, though not an exact match either) - but this is a hypothesis, not
a confirmed derivation. **Recording both numbers rather than silently accepting
either**: the shipped file's own intrinsic LUFS is verified at -18.2 (target met); the
-21.8 figure could not be reproduced against the actual shipped bytes by this
session's own measurement.

## Verification

- `python3 -m py_compile master.py` before running it.
- Ran the real mastering pass (`--only` filter not needed, ran all three rows
  explicitly) against the real promoted source WAVs, not a synthetic test signal.
- Independent `ffmpeg -af ebur128` loudness measurement, both before (checked out
  from the last commit) and after this pass's changes.
- `npx svelte-check` after the `App.svelte`/`soundService.ts` edits - the only 6
  errors are pre-existing `node_modules` type-declaration conflicts (`esrap`,
  `css-font-loading-module`), unrelated to this pass's files.
- Ran `audio_verify.mjs` for real (not just added the check) - confirmed the seam
  gate fires correctly (fails exactly where expected, passes exactly where expected).
- Ran the focused spin-click re-check for real against a live dev server, not
  inferred from code review.
- Full `npm run build` clean; restored the git-tracked `frontend/dist/` build
  artefact afterward to avoid polluting this commit with unrelated build output
  (same discipline as the 2026-07-14 merge sweep).
- Locked files confirmed untouched: `git diff --stat -- frontend/src/lib/services/rgsService.ts frontend/src/lib/stores/gameStore.ts games/future_spinner/ .claude/settings.json` is empty.

## Not done this pass (flagged, not silent)

- `anticipation_build`'s seam gate genuinely fails and was not forced to pass -
  needs an owner/Fable decision (accept as shipped, regenerate, or grant a
  documented tolerance exception for this specific row).
- The -21.8 LUFS discrepancy is not resolved, only surfaced with both numbers
  recorded - needs whoever produced the -21.8 figure to clarify their method so
  this can be reconciled.
- The full 25-30 minute soak matrix was not re-run; the frame-gate re-check is a
  smaller, targeted spot-check (documented above), not a full statistical
  replacement for the baseline run.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** implemented the
  seam-conditioning algorithm once and applied it uniformly to all three rows as
  instructed, then measured honestly rather than assuming success - this is what
  surfaced the real, disclosed `anticipation_build` gate failure and the LUFS
  discrepancy, both of which a rubber-stamp pass would have missed or silently
  smoothed over. Used a small, targeted re-check for the frame-gate attribution
  instead of a full 25-30 minute soak re-run, given the specific claim to verify
  (does the early cold-start cluster shrink) doesn't need the full matrix to
  answer, and said so plainly rather than presenting a partial check as the full
  soak's equivalent.
- **Alternatives rejected:** widening the seam gate's RMS window or relaxing its
  2dB tolerance to force `anticipation_build` to pass silently (rejected - would be
  gaming the metric rather than fixing or disclosing the real issue); accepting the
  brief's -21.8 LUFS figure without measuring it myself (rejected - directly
  contradicts this project's "verify fresh, don't take numbers on trust" discipline,
  and my own reproducible ffmpeg measurement shows -18.2 on the actual shipped
  bytes); adding a second gesture-gated texture-priming pass in `GameGrid.svelte`
  for "first-spin textures" that already have a working, earlier priming path via
  `_prewarmArt()` at mount (rejected - would be redundant complexity for something
  already covered, confirmed by reading the actual mount order).
- **Files touched:** `tools/audio_forge/master.py` (loop-conditioning + seam
  measurement), `frontend/public/assets/themes/future-spinner/sounds/{bgm_loop,
  bgm_tension,anticipation_build}.{mp3,webm}` (re-mastered), `frontend/scripts/
  audio_verify.mjs` (seam hard gate), `frontend/scripts/spin_click_warmup_recheck.mjs`
  (new), `frontend/src/lib/services/soundService.ts` (`warmUpAudio()`),
  `frontend/src/App.svelte` (first-gesture wiring), deleted `sounds/scatter.mp3` +
  `sounds/win.mp3`, moved `SUBMISSION_BLURB.md` -> `reports/archive/
  SUBMISSION_BLURB_superseded.md`, updated `AUDIT_PACK_INDEX.md` and
  `WRS_MASTER_DOCUMENT.md`'s stale references to the old path, this report + its
  dated archive copy. Locked files untouched.
- **Open threads:** the two flagged findings above (anticipation_build seam
  tolerance, LUFS discrepancy) need an owner/Fable decision before the mix
  play-test is requested, per the work order's own gate. ITEM 1 (JOB 5b in-game
  rules conformance), ITEM 2 (JOB 2 addendum extensions a-g), ITEM 3 (JOB 3b math
  self-audit), ITEM 4 (JOB 9b social-mode audit), and the sanctioned locked pass
  (books regeneration) remain, to be executed in order per the work order.
