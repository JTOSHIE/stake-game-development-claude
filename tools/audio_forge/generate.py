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
MODEL_SMALL = "stabilityai/stable-audio-3-small"
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
2. Accept the licence on both model pages:
   - https://huggingface.co/stabilityai/stable-audio-3-medium
   - https://huggingface.co/stabilityai/stable-audio-3-small
3. Create a read token: https://huggingface.co/settings/tokens
4. Run: huggingface-cli login
   (the huggingface_hub version installed in this venv has replaced that CLI with `hf` -
   if `huggingface-cli login` prints a deprecation notice instead of prompting for a
   token, run `hf auth login` instead; it is the same login.)

Then re-run this script.
"""


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
    import torch
    from stable_audio_tools.inference.generation import generate_diffusion_cond

    sample_rate = model_config["sample_rate"]
    sample_size = model_config["sample_size"]

    conditioning = [{"prompt": prompt, "seconds_start": 0, "seconds_total": seconds}]
    negative_conditioning = [
        {"prompt": negative_prompt, "seconds_start": 0, "seconds_total": seconds}
    ]

    def run(active_device):
        with torch.no_grad():
            return generate_diffusion_cond(
                model,
                steps=100,
                cfg_scale=7.0,
                conditioning=conditioning,
                negative_conditioning=negative_conditioning,
                sample_size=sample_size,
                sample_rate=sample_rate,
                seed=seed,
                device=active_device,
            )

    try:
        audio = run(device)
    except RuntimeError as exc:
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


def probe_and_select_model(device: str):
    """Load stable-audio-3-medium and time a short row. Falls back to stable-audio-3-small
    if the load fails or the probe generation exceeds GEN_TIME_LIMIT_S. The probe generation
    itself is discarded (timing/capability test only) - the real manifest loop regenerates
    every row from scratch with whichever model was selected."""
    probe_row = min((r for r in MANIFEST if not r[3]), key=lambda r: r[1])
    name, seconds, prompt, is_bgm = probe_row
    prompt = full_prompt_for(name, prompt, is_bgm)

    switched = False
    switch_reason = None

    print(f"Probing {MODEL_MEDIUM} (row '{name}', {seconds}s)...")
    try:
        model, model_config = load_model(MODEL_MEDIUM, device)
    except Exception as exc:  # noqa: BLE001
        switch_reason = f"{MODEL_MEDIUM} failed to load: {exc}"
        print(f"  {switch_reason}")
        switched = True
        model, model_config = load_model(MODEL_SMALL, device)
        try_copy_licence(MODEL_SMALL)
        return model, model_config, MODEL_SMALL, switched, switch_reason

    start = time.monotonic()
    try:
        generate_one(model, model_config, device, prompt, NEGATIVE_PROMPT, seconds, BASE_SEED)
        elapsed = time.monotonic() - start
    except Exception as exc:  # noqa: BLE001
        switch_reason = f"{MODEL_MEDIUM} probe generation failed: {exc}"
        print(f"  {switch_reason}")
        switched = True
        del model
        model, model_config = load_model(MODEL_SMALL, device)
        try_copy_licence(MODEL_SMALL)
        return model, model_config, MODEL_SMALL, switched, switch_reason

    print(f"  Probe completed in {elapsed:.1f}s (limit {GEN_TIME_LIMIT_S}s).")
    if elapsed > GEN_TIME_LIMIT_S:
        switch_reason = (
            f"{MODEL_MEDIUM} probe row '{name}' took {elapsed:.1f}s, over the "
            f"{GEN_TIME_LIMIT_S}s limit on this hardware"
        )
        print(f"  {switch_reason}")
        switched = True
        del model
        model, model_config = load_model(MODEL_SMALL, device)
        try_copy_licence(MODEL_SMALL)
        return model, model_config, MODEL_SMALL, switched, switch_reason

    try_copy_licence(MODEL_MEDIUM)
    return model, model_config, MODEL_MEDIUM, switched, switch_reason


def run_manifest(model, model_config, device: str, only, fresh_seeds: bool):
    rows = MANIFEST if only is None else [r for r in MANIFEST if r[0] == only]
    if not rows:
        print(f"No manifest row named '{only}'.", file=sys.stderr)
        sys.exit(1)

    rng = random.SystemRandom()
    log_entries = []

    for name, seconds, prompt, is_bgm in rows:
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

            print(f"  generating {name} seed={seed} ({seconds}s)...")
            t0 = time.monotonic()
            audio, sample_rate = generate_one(
                model, model_config, device, prompt, NEGATIVE_PROMPT, seconds, seed
            )
            elapsed = time.monotonic() - t0
            postprocess_and_write(audio, sample_rate, seconds, out_path)
            print(f"    -> {out_path} ({elapsed:.1f}s)")

            log_entries.append({
                "name": name,
                "seed": seed,
                "seconds": seconds,
                "prompt": prompt,
            })

    return log_entries


def write_log(model_id: str, switched: bool, switch_reason, log_entries) -> None:
    DESKTOP_OUT.mkdir(parents=True, exist_ok=True)
    date = datetime.date.today().isoformat()

    lines = [f"## Run {date}", f"- Model: `{model_id}`", f"- Licence: {LICENCE_NAME}"]
    if switched:
        lines.append(f"- **Switched from {MODEL_MEDIUM} to {MODEL_SMALL}**: {switch_reason}")
    lines.append("")

    if log_entries:
        lines.append("| name | seed | duration (s) | prompt |")
        lines.append("|---|---|---|---|")
        for entry in log_entries:
            lines.append(
                f"| {entry['name']} | {entry['seed']} | {entry['seconds']} | {entry['prompt']} |"
            )
    else:
        lines.append("(no new candidates generated - all requested files already existed)")
    lines.append("")

    with open(LOG_PATH, "a") as f:
        f.write("\n".join(lines) + "\n")

    print(f"Log updated: {LOG_PATH}")


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

    device = pick_device("mps")
    print(f"Using device: {device}")

    model, model_config, model_id, switched, switch_reason = probe_and_select_model(device)
    print(f"Using model: {model_id}" + (f" (switched: {switch_reason})" if switched else ""))

    log_entries = run_manifest(model, model_config, device, args.only, args.fresh_seeds)
    write_log(model_id, switched, switch_reason, log_entries)
    print("Done.")


if __name__ == "__main__":
    main()
