# AudioForge v1

Local batch audio generation pipeline for the Future Spinner sound manifest, using
Stability AI's Stable Audio 3 open weights (`stable_audio_tools` + `torch`, MPS on Apple
Silicon with CPU fallback). Everything it generates lands under `~/Desktop/fs_audio/` -
nothing produced by this tool is ever committed to the repo.

## Setup

Requires Python 3.10 specifically (not the system default on this host - see "Why Python
3.10" below).

```sh
brew install python@3.10   # if not already installed
cd tools/audio_forge
/opt/homebrew/opt/python@3.10/libexec/bin/python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Hugging Face authentication and gated access (required before anything runs)

`generate.py` checks both, in order, and refuses to do anything else until they pass:

1. Create a Hugging Face account: https://huggingface.co/join
2. Accept the licence on all three model pages:
   - https://huggingface.co/stabilityai/stable-audio-3-medium
   - https://huggingface.co/stabilityai/stable-audio-3-small-sfx
   - https://huggingface.co/stabilityai/stable-audio-3-small-music
3. Create a read token: https://huggingface.co/settings/tokens
4. Log in from this venv: `hf auth login` (the installed `huggingface_hub` version has
   replaced the old `huggingface-cli` with `hf`; `generate.py` tries `huggingface-cli
   whoami` first and falls back to `hf auth whoami` automatically, so either login command
   works)

If auth is missing, `generate.py` prints these same steps and exits without doing
anything else - no device selection, no model load, no network call beyond the auth check
itself.

Once auth passes, `generate.py` runs a pre-flight gated-access check: it downloads only
the small `model_config.json` file from each of the three repos and prints PASS/FAIL per
repo. If any repo comes back 401/403 (auth succeeded but the token itself isn't scoped to
read gated repo contents), it stops and prints:

> Open https://huggingface.co/settings/tokens, edit the FutureS token, and under User
> permissions > Repositories tick "Read access to contents of all public gated repos you
> can access", then save and retry. The token value does not change, so no re-login is
> needed.

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

Tries `stabilityai/stable-audio-3-medium` first, for every row. Before generating the
real manifest, it loads the model and times one throwaway generation of the shortest SFX
row as a capability/timing probe. If the model fails to load, or that probe takes longer
than 120 seconds on this hardware, it falls back to two specialised small models instead
of running everything through one: `stabilityai/stable-audio-3-small-sfx` for the 10 SFX
rows, `stabilityai/stable-audio-3-small-music` for the 2 BGM rows (`bgm_loop`,
`bgm_tension`) - and records the switch (and why) in `GENERATION_LOG.md`.

Device selection: MPS if `torch.backends.mps.is_available()`, else CPU. If a generation
call fails on MPS (a `RuntimeError`, `TypeError`, or `NotImplementedError` - MPS backend
gaps surface as different exception types depending on where PyTorch trips the
"unsupported on MPS" check), it retries the same call on CPU rather than aborting the run.
Generation itself calls `generate_diffusion_cond_inpaint`, not the plain
`generate_diffusion_cond`: all three Stable Audio 3 variants declare a unified
text-to-audio + inpainting architecture (`local_add_cond_ids = ["inpaint_mask",
"inpaint_masked_input"]` in their `model_config.json`) that only the `*_inpaint` function
populates - the plain function raises `KeyError: 'inpaint_mask'` on this model family.
It also passes `apg_scale=0.0` (vanilla CFG instead of Adaptive Projected Guidance): APG's
internal computation unconditionally calls `.double()`, and MPS has no float64 support at
all, so leaving APG on would force every single generation onto the slow CPU-retry path
regardless of hardware.

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

## Why Python 3.10

Originally built against Python 3.11 and the PyPI release of `stable-audio-tools`
(0.0.19). That combination installs fine, but 0.0.19 predates Stable Audio 3's
architecture entirely and fails at model-load time: `TypeError:
TransformerBlock.__init__() got an unexpected keyword argument 'local_add_cond_dim'`.
Stable Audio 3's `model_config.json` needs a DiT block parameter PyPI's release doesn't
implement.

`stable-audio-tools`' GitHub main branch does implement it, but its `pyproject.toml` pins
`requires-python = ">=3.10,<3.11"` - Python 3.11, 3.12 and the host's default 3.14 are all
rejected outright by pip when installing from source. Python 3.10 was installed via
Homebrew (`brew install python@3.10`, does not touch the system default) specifically to
satisfy this constraint.

One upside of moving to GitHub main: its *base* install (no `[train]` extra) has no
`pandas` dependency at all - `pandas==2.0.2` (and the wheel/`pkg_resources` saga that came
with it on Python 3.11/3.12/3.14) turned out to be a training-only dependency the earlier
PyPI-based attempt never actually needed for pure inference. Two smaller gaps remained and
are pinned as overrides in `requirements.txt` (see the comments there): `PyWavelets==1.4.1`
(the version GitHub main's `pyproject.toml` pins) is ABI-incompatible with `numpy>=2`, and
`pytorch_lightning` isn't a base dependency at all but gets imported unconditionally by
`stable_audio_tools/models/lora/callbacks.py` even for pure inference.

## Never committed

`.venv/`, everything under `~/Desktop/fs_audio/` (candidates, promoted files,
`GENERATION_LOG.md`) - only the code, `requirements.txt`, this README, `LICENSE.md` and
`NOTICE` are part of the repo.
