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

**Note (2026-07-13, PR #52 conflict resolution):** the hygiene pass (PR #52, originally
2026-07-08) was merged into `main` after resolving a two-file conflict (`.gitignore` -
union of both sides' ignore lines; this file - `main`'s version taken wholesale, since
the hygiene pass's own session report is preserved at
`reports/archive/2026-07-08_hygiene-pass.md` and nothing is lost). See that PR/branch for
the hygiene pass's own full report.
