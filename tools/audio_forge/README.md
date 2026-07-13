# AudioForge v1

Local batch audio generation pipeline for the Future Spinner sound manifest, using
Stability AI's Stable Audio 3 open weights (`stable_audio_tools` + `torch`, MPS on Apple
Silicon with CPU fallback). Everything it generates lands under `~/Desktop/fs_audio/` -
nothing produced by this tool is ever committed to the repo.

## Setup

Requires Python 3.11 (not the system default on this host - see "Why Python 3.11" below).

```sh
brew install python@3.11   # if not already installed
cd tools/audio_forge
/opt/homebrew/opt/python@3.11/libexec/bin/python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Hugging Face authentication (required before anything runs)

`generate.py` checks this first and refuses to do anything else until it passes:

1. Create a Hugging Face account: https://huggingface.co/join
2. Accept the licence on both model pages:
   - https://huggingface.co/stabilityai/stable-audio-3-medium
   - https://huggingface.co/stabilityai/stable-audio-3-small
3. Create a read token: https://huggingface.co/settings/tokens
4. Log in from this venv: `hf auth login` (the installed `huggingface_hub` version has
   replaced the old `huggingface-cli` with `hf`; `generate.py` tries `huggingface-cli
   whoami` first and falls back to `hf auth whoami` automatically, so either login command
   works)

If auth is missing, `generate.py` prints these same steps and exits without doing
anything else - no device selection, no model load, no network call beyond the auth check
itself.

## Usage

```sh
source .venv/bin/activate

# Generate everything (4 candidates x every manifest row)
python generate.py

# Only one row
python generate.py --only spin

# Re-roll with new random seeds instead of the deterministic base seed + offsets
python generate.py --only spin --fresh-seeds

# Pick a winner and promote it to the shipped filename
python promote.py spin 20260707
```

Candidates land at `~/Desktop/fs_audio/candidates/<name>/<name>_s<seed>.wav`. `promote.py`
copies a chosen candidate to `~/Desktop/fs_audio/<name>.wav`, the filename the game's
asset pipeline expects. Every run appends a record to `~/Desktop/fs_audio/GENERATION_LOG.md`
- model id, licence name, run date, and per file the prompt, seed and requested duration.

## Model selection

Tries `stabilityai/stable-audio-3-medium` first. Before generating the real manifest, it
loads the model and times one throwaway generation of the shortest SFX row as a
capability/timing probe. If the model fails to load, or that probe takes longer than 120
seconds on this hardware, it falls back to `stabilityai/stable-audio-3-small` for the
whole run and records the switch (and why) in `GENERATION_LOG.md`.

Device selection: MPS if `torch.backends.mps.is_available()`, else CPU. If a generation
call fails on MPS with a `RuntimeError` (e.g. an unimplemented op), it retries the same
call on CPU rather than aborting the run.

## Output format

44.1 kHz stereo, 16-bit PCM WAV, peak-normalised to -1 dBFS. Every SFX prompt is
prefixed with a shared palette string (chrome/analogue-synth cyberpunk arcade character,
dry studio recording, no music/voice); the two BGM rows (`bgm_loop`, `bgm_tension`) are
not prefixed, since that palette is SFX-specific. Every row uses the same negative
prompt: `low quality, muffled, distorted, voice, vocals`.

The manifest (12 rows: 2 BGM beds + 10 SFX/stingers) lives in `MANIFEST` at the top of
`generate.py` - edit there to add or change rows, not via CLI flags.

## Licence

`LICENSE.md` in this directory is the Stability AI Community License Agreement that
covers Stable Audio 3 (see `NOTICE` for provenance and how it self-corrects on first real
run). Generated audio is subject to that licence, not the repo's own licensing - read it
before shipping anything this tool produces.

## Why Python 3.11

The project host's default `python3` is 3.14, and Homebrew's `python@3.12` was also
tried. Both fail installing `stable-audio-tools`: it pins `pandas==2.0.2` (May 2023),
which predates 3.12's release and has no prebuilt wheel for either, forcing a source
build that then fails outright (`ModuleNotFoundError: No module named 'pkg_resources'`
during pandas' own `setup.py`, because current `setuptools` no longer bundles
`pkg_resources` by default). `pandas==2.0.2` does ship a 3.11 wheel, so 3.11 was used
instead - `requirements.txt` also pins `setuptools<81` for the same `pkg_resources`
reason (a different chain: `stable_audio_tools -> k_diffusion -> clip` imports
`pkg_resources` directly at module load time, so an unpinned `pip install` in a fresh
3.11 venv would hit the exact same error the moment `generate.py` tries to import
`stable_audio_tools.inference.generation`).

## Never committed

`.venv/`, everything under `~/Desktop/fs_audio/` (candidates, promoted files,
`GENERATION_LOG.md`) - only the code, `requirements.txt`, this README, `LICENSE.md` and
`NOTICE` are part of the repo.
