#!/usr/bin/env python3
"""AudioForge v1 - local batch generation pipeline for the Future Spinner sound manifest,
using Stable Audio 3 open weights (stable_audio_tools + torch, MPS with CPU fallback).

Usage:
    .venv/bin/python generate.py [--only NAME] [--fresh-seeds]

Outputs candidates under ~/Desktop/fs_audio/candidates/<name>/<name>_s<seed>.wav and
appends a run record to ~/Desktop/fs_audio/GENERATION_LOG.md. Nothing under ~/Desktop is
ever committed to the repo - see promote.py to pick a winning candidate.
"""

import argparse
import datetime
import random
import subprocess
import sys
import time
from pathlib import Path

DESKTOP_OUT = Path.home() / "Desktop" / "fs_audio"
CANDIDATES_DIR = DESKTOP_OUT / "candidates"
LOG_PATH = DESKTOP_OUT / "GENERATION_LOG.md"

MODEL_MEDIUM = "stabilityai/stable-audio-3-medium"
MODEL_SMALL_SFX = "stabilityai/stable-audio-3-small-sfx"
MODEL_SMALL_MUSIC = "stabilityai/stable-audio-3-small-music"
LICENCE_NAME = "Stability AI Community License Agreement"

SFX_PREFIX = (
    "high quality game sound effect, modern cyberpunk arcade, chrome and analogue "
    "synth character, clean tight transient, dry studio recording, no music, no voice"
)
NEGATIVE_PROMPT = "low quality, muffled, distorted, voice, vocals"

BASE_SEED = 20260707
SEED_OFFSETS = [0, 1, 2, 3]
GEN_TIME_LIMIT_S = 120
TARGET_SAMPLE_RATE = 44100
PEAK_DBFS = -1.0

# (name, seconds, prompt, is_bgm) - BGM rows are not prefixed with SFX_PREFIX.
MANIFEST = [
    ("bgm_loop", 90, (
        "instrumental dark cyberpunk synthwave for a futuristic street racing slot game, "
        "heavy analog bass, driving 100 BPM techno pulse, neon arpeggios, distant thunder "
        "and soft rain underneath, occasional turbo whoosh accents, loopable, no intro or "
        "outro, consistent energy, confident, hypnotic, not aggressive"
    ), True),
    ("bgm_tension", 60, (
        "instrumental high energy cyberpunk turbo synthwave, aggressive and revved up, "
        "heavy driving bassline, fast arpeggios, relentless momentum, 140 BPM, loopable, "
        "no intro or outro"
    ), True),
    ("spin", 1.0, (
        "quick electric turbo whoosh, rising synth sweep with a short mechanical ignition "
        "snap at the start, bright presence"
    ), False),
    ("reel_stop", 1.0, (
        "tight mechanical reel stop clunk, metallic chrome snap with a short low thud, "
        "dry, no ring out"
    ), False),
    ("reel_stop_anticipation", 1.0, (
        "heavy metallic slam with a charged electric crackle tail"
    ), False),
    ("win_small", 1.0, (
        "short bright cheerful synth chime with a light coin sparkle"
    ), False),
    ("win_medium", 1.5, (
        "rising two-note synth chime with coin sparkles, warm and rewarding"
    ), False),
    ("win_big", 2.5, (
        "bold ascending synth fanfare with layered coin cascade and an energetic electric "
        "flourish"
    ), False),
    ("win_epic", 4.0, (
        "massive euphoric synth fanfare, cascading coins, roaring turbo engine rev and a "
        "huge bass drop, jackpot celebration"
    ), False),
    ("scatter_land", 1.5, (
        "rising futuristic ping with a shimmering synth tail and charged electric sparkle"
    ), False),
    ("anticipation_build", 4.0, (
        "tense building synth drone, pulsing low heartbeat, rising electric tension, even "
        "energy for seamless looping, no climax hit"
    ), False),
    ("ui_click", 1.0, (
        "single crisp minimal digital tap, soft synth click, near subliminal"
    ), False),
]

OWNER_STEPS = """\
Hugging Face authentication is required before AudioForge can run.

1. Create a Hugging Face account: https://huggingface.co/join
2. Accept the licence on all three model pages:
   - https://huggingface.co/stabilityai/stable-audio-3-medium
   - https://huggingface.co/stabilityai/stable-audio-3-small-sfx
   - https://huggingface.co/stabilityai/stable-audio-3-small-music
3. Create a read token: https://huggingface.co/settings/tokens
4. Run: huggingface-cli login
   (the huggingface_hub version installed in this venv has replaced that CLI with `hf` -
   if `huggingface-cli login` prints a deprecation notice instead of prompting for a
   token, run `hf auth login` instead; it is the same login.)

If step 4 succeeds but a real run still gets 401/403 on a repo: open
https://huggingface.co/settings/tokens, edit the token, and under User permissions ->
Repositories tick "Read access to contents of all public gated repos you can access",
then save and retry (the token value does not change, no re-login needed).

Then re-run this script.
"""

GATE_CHECK_FILENAME = "model_config.json"
TOKEN_PERMISSION_MESSAGE = (
    'Open https://huggingface.co/settings/tokens, edit the FutureS token, and under '
    'User permissions > Repositories tick "Read access to contents of all public gated '
    'repos you can access", then save and retry. The token value does not change, so no '
    're-login is needed.'
)


def check_gated_access() -> bool:
    """AUDIOFORGE pre-flight: confirm gated access to all three model repos by
    downloading only their small model_config.json file. Reports PASS/FAIL per repo;
    stops with the token-permission message on any 401/403."""
    from huggingface_hub import hf_hub_download
    from huggingface_hub.utils import HfHubHTTPError

    all_pass = True
    for repo in (MODEL_MEDIUM, MODEL_SMALL_SFX, MODEL_SMALL_MUSIC):
        try:
            hf_hub_download(repo, filename=GATE_CHECK_FILENAME, repo_type="model")
        except HfHubHTTPError as exc:
            status = getattr(exc.response, "status_code", None)
            print(f"FAIL\t{repo}\tHTTP {status}: {exc}")
            all_pass = False
            if status in (401, 403):
                print(f"\n{TOKEN_PERMISSION_MESSAGE}\n")
                return False
        except Exception as exc:  # noqa: BLE001
            print(f"FAIL\t{repo}\t{type(exc).__name__}: {exc}")
            all_pass = False
        else:
            print(f"PASS\t{repo}")

    return all_pass


def full_prompt_for(name: str, prompt: str, is_bgm: bool) -> str:
    return prompt if is_bgm else f"{SFX_PREFIX}, {prompt}"


def check_hf_auth() -> bool:
    """Verify Hugging Face auth via `huggingface-cli whoami`. Recent huggingface_hub
    releases replaced that CLI with `hf` (`huggingface-cli` is now a no-op deprecation
    stub that always exits 1) - if the `huggingface-cli` result looks like that stub,
    fall back to `hf auth whoami`, which is the same check under the current tool name."""
    for command in (["huggingface-cli", "whoami"], ["hf", "auth", "whoami"]):
        try:
            result = subprocess.run(
                command, capture_output=True, text=True, timeout=30,
            )
        except FileNotFoundError:
            continue
        output = (result.stdout or "") + (result.stderr or "")
        if "no longer works" in output.lower():
            continue  # deprecation stub, not a real answer - try the next command
        if result.returncode == 0 and output.strip() and "not logged in" not in output.lower():
            return True
    return False


def pick_device(preferred: str = "mps") -> str:
    import torch

    if preferred == "mps" and torch.backends.mps.is_available() and torch.backends.mps.is_built():
        return "mps"
    return "cpu"


def load_model(model_id: str, device: str):
    from stable_audio_tools import get_pretrained_model

    model, model_config = get_pretrained_model(model_id)
    model = model.to(device)
    model.eval()
    return model, model_config


def try_copy_licence(model_id: str) -> None:
    """Best-effort: copy the licence bundled in the HF repo into tools/audio_forge/LICENSE.md
    once we can actually reach it (i.e. after a successful authenticated model load)."""
    try:
        from huggingface_hub import hf_hub_download

        licence_path = hf_hub_download(model_id, filename="LICENSE.md", repo_type="model")
        dest = Path(__file__).resolve().parent / "LICENSE.md"
        dest.write_text(Path(licence_path).read_text())
        print(f"  Refreshed LICENSE.md from {model_id}'s repo.")
    except Exception as exc:  # noqa: BLE001 - best-effort, never fatal
        print(f"  Could not refresh LICENSE.md from {model_id}: {exc}", file=sys.stderr)


def generate_one(model, model_config, device: str, prompt: str, negative_prompt: str,
                  seconds: float, seed: int):
    """Uses generate_diffusion_cond_inpaint, not the plain generate_diffusion_cond: all
    three Stable Audio 3 variants (medium/small-sfx/small-music) declare
    local_add_cond_ids = ["inpaint_mask", "inpaint_masked_input"] in their model_config.json
    - a unified text-to-audio + inpainting architecture that populates those conditioning
    tensors unconditionally. Only *_inpaint builds them (as an all-zero "generate
    everything from scratch" mask when no inpaint_audio/mask is given); the plain function
    never does, and fails with `KeyError: 'inpaint_mask'` on this model family."""
    import torch
    from stable_audio_tools.inference.generation import generate_diffusion_cond_inpaint

    sample_rate = model_config["sample_rate"]
    sample_size = model_config["sample_size"]

    conditioning = [{"prompt": prompt, "seconds_start": 0, "seconds_total": seconds}]
    negative_conditioning = [
        {"prompt": negative_prompt, "seconds_start": 0, "seconds_total": seconds}
    ]

    def run(active_device):
        with torch.no_grad():
            return generate_diffusion_cond_inpaint(
                model,
                steps=100,
                cfg_scale=7.0,
                # apg_scale=0.0 uses vanilla CFG instead of Adaptive Projected Guidance.
                # APG's apg_project() (models/dit.py) unconditionally calls .double() on
                # its intermediate tensors, and MPS has no float64 support at all (not a
                # transient/retryable failure - torch raises TypeError, not RuntimeError,
                # and it recurs on every single diffusion step). Disabling APG keeps
                # generation on native MPS instead of forcing every call through the CPU
                # fallback path, which would defeat the point of MPS acceleration.
                apg_scale=0.0,
                conditioning=conditioning,
                negative_conditioning=negative_conditioning,
                sample_size=sample_size,
                seed=seed,
                device=active_device,
            )

    try:
        audio = run(device)
    except (RuntimeError, TypeError, NotImplementedError) as exc:
        # MPS backend gaps surface as different exception types depending on where
        # PyTorch trips the "unsupported on MPS" check (e.g. an unimplemented op is
        # RuntimeError, but an explicit unsupported-dtype conversion like float64 is
        # TypeError - confirmed via generate_diffusion_cond_inpaint's APG path).
        if device != "mps":
            raise
        print(f"    MPS generation failed ({exc}); retrying on CPU", file=sys.stderr)
        model.to("cpu")
        try:
            audio = run("cpu")
        finally:
            model.to(device)
        return audio, sample_rate

    return audio, sample_rate


def postprocess_and_write(audio, sample_rate: int, seconds: float, out_path: Path) -> None:
    import soundfile as sf
    import torch

    audio = audio[0]  # (channels, samples)

    target_len = int(round(seconds * sample_rate))
    if audio.shape[-1] > target_len:
        audio = audio[..., :target_len]

    if audio.shape[0] == 1:
        audio = audio.repeat(2, 1)
    elif audio.shape[0] > 2:
        audio = audio[:2]

    peak = audio.abs().max().item()
    target_peak = 10 ** (PEAK_DBFS / 20)
    if peak > 0:
        audio = audio * (target_peak / peak)
    audio = audio.clamp(-1.0, 1.0)

    if sample_rate != TARGET_SAMPLE_RATE:
        import torchaudio

        audio = torchaudio.functional.resample(audio, sample_rate, TARGET_SAMPLE_RATE)
        sample_rate = TARGET_SAMPLE_RATE

    out_path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(out_path), audio.to(torch.float32).cpu().numpy().T, sample_rate, subtype="PCM_16")


def probe_and_select_models(device: str):
    """Load stable-audio-3-medium and time a short row. Falls back to the two specialised
    small models - stable-audio-3-small-sfx for SFX rows, stable-audio-3-small-music for
    the two BGM rows - if medium fails to load or the probe generation exceeds
    GEN_TIME_LIMIT_S. The probe generation itself is discarded (timing/capability test
    only) - the real manifest loop regenerates every row from scratch with whichever
    model(s) were selected.

    Returns (models, switched, switch_reason) where models is a dict keyed by is_bgm:
    {False: (model, config, model_id), True: (model, config, model_id)}."""
    probe_row = min((r for r in MANIFEST if not r[3]), key=lambda r: r[1])
    name, seconds, prompt, is_bgm = probe_row
    prompt = full_prompt_for(name, prompt, is_bgm)

    switched = False
    switch_reason = None
    model = None

    print(f"Probing {MODEL_MEDIUM} (row '{name}', {seconds}s)...")
    try:
        model, model_config = load_model(MODEL_MEDIUM, device)
        start = time.monotonic()
        generate_one(model, model_config, device, prompt, NEGATIVE_PROMPT, seconds, BASE_SEED)
        elapsed = time.monotonic() - start
        print(f"  Probe completed in {elapsed:.1f}s (limit {GEN_TIME_LIMIT_S}s).")
        if elapsed > GEN_TIME_LIMIT_S:
            switch_reason = (
                f"{MODEL_MEDIUM} probe row '{name}' took {elapsed:.1f}s, over the "
                f"{GEN_TIME_LIMIT_S}s limit on this hardware"
            )
            switched = True
    except Exception as exc:  # noqa: BLE001
        switch_reason = f"{MODEL_MEDIUM} failed to load or generate: {exc}"
        switched = True

    if not switched:
        try_copy_licence(MODEL_MEDIUM)
        return (
            {False: (model, model_config, MODEL_MEDIUM), True: (model, model_config, MODEL_MEDIUM)},
            switched,
            switch_reason,
        )

    print(f"  {switch_reason}")
    print(f"  Falling back to {MODEL_SMALL_SFX} (SFX rows) and {MODEL_SMALL_MUSIC} (BGM rows).")
    del model

    sfx_model, sfx_config = load_model(MODEL_SMALL_SFX, device)
    music_model, music_config = load_model(MODEL_SMALL_MUSIC, device)
    try_copy_licence(MODEL_SMALL_SFX)

    return (
        {False: (sfx_model, sfx_config, MODEL_SMALL_SFX), True: (music_model, music_config, MODEL_SMALL_MUSIC)},
        switched,
        switch_reason,
    )


def write_log_header(models: dict, switched: bool, switch_reason) -> None:
    """Writes the run header + table header immediately, before any generation starts,
    then append_log_row() appends one line per candidate as it completes. This makes
    GENERATION_LOG.md durable against an interrupted run (e.g. an unattended multi-hour
    caffeinate session that gets killed) - every candidate actually written to disk is
    logged the moment it's written, not batched until the whole run finishes."""
    DESKTOP_OUT.mkdir(parents=True, exist_ok=True)
    date = datetime.date.today().isoformat()

    model_ids = sorted({model_id for _, _, model_id in models.values()})
    lines = [f"## Run {date}", f"- Model(s): {', '.join(f'`{m}`' for m in model_ids)}",
             f"- Licence: {LICENCE_NAME}"]
    if switched:
        lines.append(
            f"- **Switched from {MODEL_MEDIUM} to {MODEL_SMALL_SFX} (SFX) / "
            f"{MODEL_SMALL_MUSIC} (BGM)**: {switch_reason}"
        )
    lines.append("")
    lines.append("| name | seed | duration (s) | model | prompt |")
    lines.append("|---|---|---|---|---|")

    with open(LOG_PATH, "a") as f:
        f.write("\n".join(lines) + "\n")


def append_log_row(entry: dict) -> None:
    with open(LOG_PATH, "a") as f:
        f.write(
            f"| {entry['name']} | {entry['seed']} | {entry['seconds']} | "
            f"{entry['model_id']} | {entry['prompt']} |\n"
        )
        f.flush()


def run_manifest(models: dict, device: str, only, fresh_seeds: bool) -> int:
    rows = MANIFEST if only is None else [r for r in MANIFEST if r[0] == only]
    if not rows:
        print(f"No manifest row named '{only}'.", file=sys.stderr)
        sys.exit(1)

    rng = random.SystemRandom()
    generated_count = 0

    for name, seconds, prompt, is_bgm in rows:
        model, model_config, model_id = models[is_bgm]
        prompt = full_prompt_for(name, prompt, is_bgm)
        if fresh_seeds:
            seeds = [rng.randint(0, 2**31 - 1) for _ in SEED_OFFSETS]
        else:
            seeds = [BASE_SEED + offset for offset in SEED_OFFSETS]

        for seed in seeds:
            out_path = CANDIDATES_DIR / name / f"{name}_s{seed}.wav"
            if out_path.exists() and not fresh_seeds:
                print(f"  [skip] {out_path.relative_to(DESKTOP_OUT)} already exists")
                continue

            print(f"  generating {name} seed={seed} ({seconds}s) via {model_id}...")
            t0 = time.monotonic()
            audio, sample_rate = generate_one(
                model, model_config, device, prompt, NEGATIVE_PROMPT, seconds, seed
            )
            elapsed = time.monotonic() - t0
            postprocess_and_write(audio, sample_rate, seconds, out_path)
            print(f"    -> {out_path} ({elapsed:.1f}s)")

            append_log_row({
                "name": name,
                "seed": seed,
                "seconds": seconds,
                "prompt": prompt,
                "model_id": model_id,
            })
            generated_count += 1

    return generated_count


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--only", metavar="NAME", help="Only generate this manifest row")
    parser.add_argument(
        "--fresh-seeds",
        action="store_true",
        help="Use new random seeds instead of the deterministic base+offset seeds (re-rolls)",
    )
    args = parser.parse_args()

    if not check_hf_auth():
        print(OWNER_STEPS)
        sys.exit(1)

    print("Checking gated access to all three model repos...")
    if not check_gated_access():
        print("\nGated access check failed for at least one repo - see FAIL lines above.", file=sys.stderr)
        sys.exit(1)

    device = pick_device("mps")
    print(f"Using device: {device}")

    models, switched, switch_reason = probe_and_select_models(device)
    used = ", ".join(sorted({m[2] for m in models.values()}))
    print(f"Using model(s): {used}" + (f" (switched: {switch_reason})" if switched else ""))

    write_log_header(models, switched, switch_reason)
    generated_count = run_manifest(models, device, args.only, args.fresh_seeds)
    print(f"Done. {generated_count} candidate(s) generated. Log: {LOG_PATH}")


if __name__ == "__main__":
    main()
