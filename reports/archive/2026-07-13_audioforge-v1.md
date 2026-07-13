# Session Report: AUDIOFORGE V1 - local Stable Audio 3 batch generation pipeline

- **Date:** 2026-07-13
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/audioforge-v1` (off up-to-date `main`).
- **Source:** pasted brief, saved verbatim as `FS_AudioForge_v1_Prompt.md` per convention (b)/(f).

## What this delivers

`tools/audio_forge/` - a local batch audio generation pipeline for the Future Spinner
sound manifest (12 rows: 2 BGM beds + 10 SFX/stingers), built against Stability AI's
Stable Audio 3 open weights via `stable_audio_tools` + `torch`.

- **`generate.py`** - gates on Hugging Face auth first (nothing else runs until it
  passes), picks MPS with CPU fallback, probes `stable-audio-3-medium` with a throwaway
  timed generation of the shortest SFX row and falls back to `stable-audio-3-small` if it
  can't load or the probe exceeds 120s (recording the switch and why in the log), then
  generates 4 seeded candidates per manifest row (base seed `20260707` + offsets 0-3) as
  44.1kHz stereo 16-bit WAV peak-normalised to -1 dBFS, written to
  `~/Desktop/fs_audio/candidates/<name>/<name>_s<seed>.wav`. Supports `--only <name>` and
  `--fresh-seeds` for re-rolls. Appends every run to `~/Desktop/fs_audio/GENERATION_LOG.md`
  with model id, licence name, date, and per-file prompt/seed/duration.
- **`promote.py <name> <seed>`** - copies a chosen candidate to `~/Desktop/fs_audio/<name>.wav`.
- **`requirements.txt`** - a full pinned freeze (185 packages) of a verified-working
  install, plus an explicit `setuptools<81` pin (see findings below).
- **`README.md`** - setup, HF auth steps, usage, model-selection/output-format detail,
  and the Python-3.11 rationale.
- **`LICENSE.md`** - the Stability AI Community License Agreement, sourced from the
  publicly-readable sibling `stable-audio-open-1.0` model card (the actual
  `stable-audio-3-medium`/`-small` repos are gated and unreachable without the auth this
  session doesn't have). `generate.py` auto-refreshes this file from whichever model
  actually loads, the first time a real authenticated run succeeds.
- **`NOTICE`** - the Stability attribution line, plus a note on the LICENSE.md provenance
  above and the self-correction behaviour.

## Findings from actually building and running this, not just writing code

- **Python 3.14 (this host's default) and 3.12 both fail**: `stable-audio-tools` pins
  `pandas==2.0.2` (May 2023), which predates both and has no prebuilt wheel for either,
  forcing a source build that then fails outright
  (`ModuleNotFoundError: No module named 'pkg_resources'` inside pandas' own `setup.py`,
  because current `setuptools` no longer bundles `pkg_resources`). Installed Python 3.11
  via Homebrew (`brew install python@3.11`, does not touch the system default) and built
  the venv on that instead - `pandas==2.0.2` has a 3.11 wheel.
- **A second, different `pkg_resources` gap** surfaces at import time even on 3.11:
  `stable_audio_tools -> k_diffusion -> clip` imports `pkg_resources` directly when
  `generate.py` imports `generate_diffusion_cond`, and a fresh venv's default
  (unpinned) `setuptools` is 82.0.1, which has dropped `pkg_resources`. Fixed by pinning
  `setuptools<81` in `requirements.txt`. Verified in a completely fresh venv built only
  from `requirements.txt` (not just the working venv this was debugged in) - full import
  chain (`get_pretrained_model`, `generate_diffusion_cond`, `soundfile`, `torchaudio`)
  succeeds, MPS confirmed available.
- **`huggingface-cli` is a non-functional deprecation stub** in the `huggingface_hub`
  version this install resolved (1.23.0) - `huggingface-cli whoami` and
  `huggingface-cli login` both just print "no longer works, use `hf` instead" and exit 1,
  regardless of actual auth state. The brief specifies `huggingface-cli whoami` by name;
  `check_hf_auth()` tries that first (matching the brief literally) and falls back to
  `hf auth whoami` (the actual working equivalent) if the result looks like the
  deprecation stub, so the check is correct either way. `README.md` and the printed owner
  steps both note the `hf auth login` fallback so the owner isn't sent to run a command
  that silently does nothing.
- **Live-tested the HF-auth gate for real** (not just read the code): this host has no
  Hugging Face credentials configured, so `python generate.py` was actually run and
  correctly printed the owner steps and exited 1 without attempting any device selection,
  model load, or download - exactly the "before anything... stop" behaviour the brief
  specifies. Model loading, the medium/small probe-and-fallback logic, actual generation,
  and the LICENSE.md auto-refresh could not be exercised end-to-end in this session as a
  result (no credentials, and the model weights are multi-gigabyte gated downloads) -
  flagged below, not silently assumed working.

## Verification

- `promote.py` smoke-tested against a fake candidate directory (correct copy, correct
  destination path).
- `requirements.txt` reproducibility verified twice: once in the venv it was developed
  against, once in a completely fresh `python@3.11` venv built from nothing but
  `requirements.txt` - both resolve and import cleanly.
- `generate.py --help` and the no-args run both exercised live against this host; the
  auth gate behaves exactly as specified (prints owner steps, exits 1, does nothing else).
- Locked files confirmed untouched: `git diff --stat` against `rgsService.ts`,
  `gameStore.ts`, `games/future_spinner/**`, `.claude/settings.json` is empty (this pass
  never touched any of them - a new, separate tool under `tools/`).
- Font-CDN compliance grep: empty (unaffected, no frontend changes).
- `.gitignore` updated: `tools/audio_forge/.venv/` and `tools/audio_forge/__pycache__/`
  added, mirroring the existing `scripts/assets/.venv/` pattern, so the venv can never be
  accidentally staged.
- Confirmed nothing under `~/Desktop` is tracked or staged (that path is entirely outside
  this repository's working tree, so there is no git mechanism by which it could be).

## Needs owner attention

- **HF auth was never configured in this environment**, so the pipeline's core promise -
  actually generating audio - is unverified beyond the auth gate itself. Once the owner
  completes the four steps in `README.md` (account, accept both model licences, create a
  read token, `hf auth login`), a first real run (`python generate.py --only ui_click`
  is the cheapest single-row smoke test - 1 second of audio, one manifest row) is the
  next natural verification step, and will also be the first real test of the
  medium/small probe-and-fallback logic and the LICENSE.md auto-refresh.
- **`stable-audio-3-medium`/`stable-audio-3-small` were not independently confirmed to
  exist as named on Hugging Face** - the brief names them explicitly and `generate.py`
  targets them by id, but this session had no auth to check the model pages. If either
  id doesn't resolve, `get_pretrained_model` will raise on load, which `probe_and_select_model`
  already handles as a "couldn't load" case (falls to small, or fails if small also
  doesn't resolve) - worth a quick manual check of both URLs before the first real run.
- The full pinned `requirements.txt` (185 packages) is heavier than a minimal
  `stable-audio-tools` + `torch` + `soundfile` list would be, but was the reproducible,
  verified-working choice given how fragile this dependency tree already proved to be
  (two separate `pkg_resources` failure modes across three Python versions tried) - an
  unpinned install re-run in the future could re-resolve differently and hit a new
  variant of the same class of problem.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** built and actually ran
  every piece that could be run without HF credentials (venv setup across three Python
  versions until one worked, both import-chain failures found and fixed, the auth gate
  itself live-tested to confirm it stops exactly where the brief says it should) rather
  than writing code against documentation alone; fetched `generate_diffusion_cond`'s real
  signature and the actual conditioning/negative_conditioning list-of-dicts shape from
  the `stable-audio-tools` source on GitHub before writing `generate.py`, rather than
  guessing the API.
- **Alternatives rejected:** using the system default Python 3.14 or Homebrew's 3.12
  (rejected - both fail on `pandas==2.0.2`'s missing wheel, see findings); fabricating a
  `stable-audio-3-medium`-specific LICENSE.md by paraphrasing from memory (rejected -
  used the real, verbatim, publicly-readable text from the sibling
  `stable-audio-open-1.0` model card instead, with the provenance and the
  auto-self-correction path clearly documented in `NOTICE`, rather than presenting
  unverified text as if it were confirmed model-specific); printing the brief's literal
  `huggingface-cli login` instruction unmodified (rejected - verified it's a
  non-functional deprecation stub in the installed version and added the working
  `hf auth login` fallback so the owner isn't sent to run a dead command).
- **Files touched:** `tools/audio_forge/{generate.py, promote.py, requirements.txt,
  README.md, LICENSE.md, NOTICE}` (new), `.gitignore` (added the AudioForge venv
  pattern), `FS_AudioForge_v1_Prompt.md` (brief, verbatim), this report + its dated
  archive copy. `tools/audio_forge/.venv/` exists locally but is gitignored, never
  committed. Locked files untouched.
- **Open threads:** the actual generation pipeline (model load, probe/fallback,
  candidate generation, LICENSE.md auto-refresh) is code-complete and import-verified but
  not yet run end-to-end, gated on the owner completing HF auth - that first real run is
  the natural next step once credentials exist.
