# Session Report: AUDIOFORGE pre-flight + small-sfx/small-music fallback amendment - real generation proven

- **Date:** 2026-07-13
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/audioforge-v1` (continuation of the earlier AudioForge v1 build, PR #54, still open).
- **Source:** pasted brief, saved verbatim as `FS_AudioForge_v1_Prompt.md` (the original
  build) plus this session's follow-up brief (the AUDIOFORGE pre-flight + fallback
  amendment - not separately filed since it amends the same tool, per the brief's own
  framing: "proceed directly into the AUDIOFORGE V1 brief with its small-sfx/small-music
  fallback amendment").

## What changed this pass

1. **AUDIOFORGE pre-flight, run for real.** Checked Hugging Face auth live in this
   session (`hf auth whoami`) - not authenticated. Asked the owner to run the login
   themselves (never handled the token) via `hf auth login` in their own terminal;
   confirmed success (`user=JTOSHIE`). Then ran the gated-access check for real: downloaded
   only `model_config.json` from all three model repos and got **PASS on all three**:
   `stabilityai/stable-audio-3-medium`, `stabilityai/stable-audio-3-small-sfx`,
   `stabilityai/stable-audio-3-small-music`.
2. **Small-sfx/small-music fallback amendment**, implemented in `generate.py`: the single
   `stabilityai/stable-audio-3-small` fallback is now two specialised models -
   `stable-audio-3-small-sfx` for the 10 SFX rows, `stable-audio-3-small-music` for the 2
   BGM rows (`bgm_loop`, `bgm_tension`). `probe_and_select_models()` returns a dict keyed
   by `is_bgm`; `run_manifest()` picks the right model per row; `write_log()` records
   whichever model(s) were actually used.
3. **Proceeded into real generation**, since gated access passed. This is where the
   session spent most of its time - four separate, real bugs surfaced one after another,
   each only findable by actually running the pipeline against the real, newly-released
   Stable Audio 3 weights (not documentation, not the PyPI package's stale examples):

## Real bugs found and fixed (in the order they surfaced)

1. **`stable-audio-tools` 0.0.19 (PyPI) can't load Stable Audio 3 at all.** `TypeError:
   TransformerBlock.__init__() got an unexpected keyword argument 'local_add_cond_dim'`.
   The PyPI release predates Stable Audio 3's architecture. GitHub main has the fix, but
   its `pyproject.toml` requires Python 3.10 exactly (`>=3.10,<3.11`), not the 3.11 the
   earlier PyPI-based build used. Rebuilt the venv on Homebrew Python 3.10
   (`brew install python@3.10`, doesn't touch the system default).
   - **Bonus finding while switching:** GitHub main's *base* install has no `pandas`
     dependency at all - it's a `[train]`-extra-only dependency there, so the entire
     pandas/`pkg_resources`/setuptools saga from the original build (see the prior
     session's report) turned out to be unnecessary complexity for pure inference, not a
     real constraint of this model family.
2. **`ImportError` chain: PyWavelets/numpy ABI mismatch.** `stable_audio_tools ->
   k_diffusion -> clip -> pywt` failed with `ValueError: numpy.dtype size changed, may
   indicate binary incompatibility`. `PyWavelets==1.4.1` (GitHub main's pin) predates
   `numpy>=2` and is ABI-incompatible with it. Fixed: `pip install --upgrade
   "PyWavelets>=1.6"` (resolved to 1.8.0).
3. **`ModuleNotFoundError: No module named 'pytorch_lightning'`.** Not a base dependency
   of `stable-audio-tools` at all (only in `[train]`), but
   `stable_audio_tools/models/lora/callbacks.py` imports it unconditionally at module load
   time, so even pure inference needs it installed. Fixed: `pip install
   "pytorch_lightning==2.5.5"` (the version GitHub main's `[train]` extra pins).
4. **Wrong generation function: `KeyError: 'inpaint_mask'`.** All three Stable Audio 3
   variants (confirmed on both medium and small-sfx) declare `local_add_cond_ids =
   ["inpaint_mask", "inpaint_masked_input"]` in their `model_config.json` - a unified
   text-to-audio + inpainting architecture. Only `generate_diffusion_cond_inpaint`
   populates those conditioning tensors (as an all-zero "generate everything from scratch"
   mask when no inpaint region is given); the plain `generate_diffusion_cond` this tool was
   originally written against never does, and fails outright on this model family. Fixed by
   switching `generate_one()` to call `generate_diffusion_cond_inpaint` (drops the
   `sample_rate` kwarg too - that function derives it from `model.sample_rate`
   internally, doesn't accept it as a parameter).
5. **MPS float64 limitation via APG:** `TypeError: Cannot convert a MPS Tensor to
   float64 dtype`. Traced to `models/dit.py`'s `apg_project()` (Adaptive Projected
   Guidance), which unconditionally calls `.double()` on its intermediate tensors - MPS has
   no float64 support at all, so this isn't a transient/retryable failure, it recurs on
   every diffusion step. Fixed with `apg_scale=0.0` (vanilla CFG instead of APG) in the
   `generate_diffusion_cond_inpaint` call, keeping generation on native MPS instead of
   forcing every call through the CPU-retry path (which would have defeated the point of
   MPS acceleration entirely). Also broadened `generate_one()`'s CPU-retry exception catch
   from `RuntimeError` alone to `(RuntimeError, TypeError, NotImplementedError)`, since this
   specific MPS failure surfaced as `TypeError`, not `RuntimeError` - a real gap the
   original exception handling would have missed for any future MPS-unsupported-op case
   that isn't APG.

## Real generation proof

After all five fixes, ran `python generate.py --only ui_click` (the cheapest manifest row)
to completion, live, on this hardware:

| seed | file | size | generation time |
|---|---|---|---|
| 20260707 | `ui_click_s20260707.wav` | 176,444 bytes | 104.5s |
| 20260708 | `ui_click_s20260708.wav` | 176,444 bytes | 101.7s |
| 20260709 | `ui_click_s20260709.wav` | 176,444 bytes | 132.5s |
| 20260710 | `ui_click_s20260710.wav` | 176,444 bytes | 108.9s |

All four generated by `stabilityai/stable-audio-3-medium` on native MPS - the probe
(92.6s, under the 120s limit) never needed to fall back to the small-sfx/small-music
models, so the fallback amendment's actual model-loading path is code-complete and
import-verified but not yet exercised by a real forced-fallback run (would need to
artificially fail medium's load to trigger it - not done this pass, since the real probe
correctly chose medium). `GENERATION_LOG.md` was written correctly at
`~/Desktop/fs_audio/GENERATION_LOG.md` with model id, licence name, date, and per-file
prompt/seed/duration, matching the brief's spec exactly.

`LICENSE.md` was also genuinely auto-refreshed from the real `stabilityai/stable-audio-3-medium`
repo during this run (the `try_copy_licence()` call after a successful probe) - confirmed
identical in substance to the earlier best-effort draft sourced from the sibling
`stable-audio-open-1.0` model card (only raw-text formatting differs: smart quotes, no
markdown headers). `NOTICE` updated to record this as now-verified, not still a
best-effort placeholder.

## Not done this pass (explicitly, not silently skipped)

- **The full 48-file manifest** (12 rows x 4 seeds) was not run - the brief's smoke-test
  scope was "prove the pipeline actually works," which the 4-candidate `ui_click` run
  does unambiguously. Running the full manifest is a straightforward next step for the
  owner (`python generate.py`), just a longer one (roughly 25-30x the ui_click run's
  ~450s at this per-clip rate, though BGM rows at 60-90s requested duration will take
  substantially longer per clip than the 1s SFX rows).
- **The small-sfx/small-music fallback path itself** was not exercised for real (medium
  never failed its probe this run) - the code is written and import-verified but not
  proven end-to-end under an actual fallback trigger.
- **The full 48-file run's use of `apg_scale=0.0` vs `1.0`'s audio-quality difference**
  was not evaluated - this pass verified the pipeline runs and produces valid audio, not
  a perceptual A/B of guidance quality. Worth a listen once real candidates exist.

## Verification

- All five fixes verified by the pipeline actually completing real generation end to end,
  not by inspection alone.
- `requirements.txt` rebuilt from a real `pip freeze` of the working venv (74 packages,
  down from the earlier Python-3.11 attempt's 185 - the pandas/`[train]`-extras chain is
  gone entirely). Includes the exact GitHub commit `stable-audio-tools` was installed
  from, via pip's `name @ git+url@commit` syntax.
- Locked files confirmed untouched (`rgsService.ts`, `gameStore.ts`,
  `games/future_spinner/**`, `.claude/settings.json`) - this pass only touches
  `tools/audio_forge/` and this report.
- Nothing under `~/Desktop` or `tools/audio_forge/.venv/` is tracked or staged (both
  outside/gitignored).

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** ran the real pipeline
  against the real, newly-released Stable Audio 3 weights rather than trusting the
  original build's documentation-derived API calls - this surfaced five genuine bugs
  (Python version constraint, two missing/incompatible dependencies, a wrong-function API
  call, and a real MPS hardware limitation) that no amount of code review would have
  caught, since they all only manifest when the actual model architecture and actual
  MPS backend are exercised together. Fixed each one in turn, re-running after every
  single fix rather than batching guesses.
- **Alternatives rejected:** staying on Python 3.11 + PyPI 0.0.19 and trying to patch
  around the missing `local_add_cond_dim` support (rejected - that's a real architecture
  gap in an old release, not a bug patchable from outside the library); leaving APG
  enabled and routing every generation through the CPU-retry fallback (rejected - would
  work but abandons MPS acceleration entirely for every single call, not just genuine
  failures, defeating the brief's explicit "MPS with CPU fallback" design); running the
  full 48-file manifest to "prove it more" (rejected - the brief asked for a working
  pipeline, and a 4-candidate real generation with real timings is unambiguous proof; the
  full run is expensive compute better left to the owner's own judgement about when to
  spend it).
- **Files touched:** `tools/audio_forge/generate.py` (small-sfx/small-music fallback,
  `generate_diffusion_cond_inpaint` + `apg_scale=0.0`, broadened CPU-retry exception
  catch, pre-flight gated-access check), `tools/audio_forge/requirements.txt` (rebuilt
  for Python 3.10 + GitHub main), `tools/audio_forge/README.md` (Setup, Model selection,
  Why Python 3.10 sections all updated), `tools/audio_forge/NOTICE` (LICENSE.md provenance
  updated to "now verified"), `tools/audio_forge/LICENSE.md` (auto-refreshed by the real
  run itself, not manually edited), this report + its dated archive copy. Locked files
  untouched.
- **Open threads:** the full 48-file manifest run (owner's call on timing/compute);
  exercising the small-sfx/small-music fallback path for real (would need an artificial
  medium-load failure to trigger); an audio-quality listen-through once real candidates
  exist, including whether `apg_scale=0.0` vs the default `1.0` is audible; PR #54 still
  needs the owner's merge decision (both the original build and this amendment are on the
  same branch/PR).

## Addendum (2026-07-13, same day) - full 48-candidate manifest run, provenance

PR #54 merged; the owner then asked for the full manifest run (all 12 rows x 4 seeds),
unattended under `caffeinate` so the Mac wouldn't sleep mid-run. Recorded here for the
dossier since the run's provenance isn't a clean single pass - two real incidents
happened and both are relevant to trusting the resulting candidates and log.

**Incident 1 - the first attempt was killed by a tool timeout, not the job itself.**
Launched via a backgrounded Bash call with an explicit `timeout: 600000` (10 minutes) -
that cap turned out to apply even in background mode, so the process was killed
~10 minutes in, mid-way through `bgm_loop` (a 90-second-audio row, ~730-790s per
candidate at this hardware's pace - nothing close to finishing in 10 minutes). Three
`bgm_loop` candidates (seeds 20260707/08/09) had already completed and written valid,
complete WAV files to disk before the kill, but `write_log()` at the time only ran once,
after the *entire* manifest finished - so those three real, valid candidates were never
recorded in `GENERATION_LOG.md` at all.

**Fix, applied before relaunching:** refactored `generate.py` so the log is written
incrementally - `write_log_header()` writes the run's header once, then
`append_log_row()` appends one line immediately after each candidate is written to disk,
flushing every write. An interrupted run now only ever loses the *in-flight* candidate at
the moment of interruption, never previously-completed ones. This is committed as its own
change (see below).

**Manual reconciliation:** since the three `bgm_loop` files predate this fix, they were
individually appended to `GENERATION_LOG.md` by hand in a clearly-marked
"## Run 2026-07-13 (reconciliation)" block, stating why (the timeout, not a failed
generation) and that the files themselves were verified complete and valid on disk before
being logged. No files were regenerated or altered - this is a paperwork fix, not a
maths/audio fix.

**Relaunch:** the full run was restarted fully detached
(`nohup caffeinate -i -s python generate.py > /tmp/audioforge_full_run.log 2>&1 &`,
disowned) specifically so it could not be killed by any tool-level timeout again -
`nohup`'d output isn't tracked by the Bash tool's own process lifecycle at all. It
skipped the 7 already-complete candidates (4 `ui_click` from the earlier smoke test, 3
`bgm_loop` from the killed attempt) and ran the remaining 41 to completion.

**Result:** all 48 candidates present and valid, zero fallback switches (medium handled
every row), full per-row timing table already relayed to the owner in chat. Nothing under
`~/Desktop` is part of this or any commit - `GENERATION_LOG.md`, all candidates, and the
promoted-file convention all stay outside the repo per the original brief.

- **Files touched (this addendum):** `tools/audio_forge/generate.py` (incremental
  `write_log_header()`/`append_log_row()` in place of the old batched `write_log()`),
  this report + its dated archive copy. No maths/frontend/locked files touched.
