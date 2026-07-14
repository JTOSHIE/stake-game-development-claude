#!/usr/bin/env python3
"""AudioForge master.py - deterministic mastering pass for the Future Spinner sound
manifest. Takes the promoted WAVs at ~/Desktop/fs_audio/<name>.wav and produces shipping
files in frontend/public/assets/themes/future-spinner/sounds/.

Usage:
    .venv/bin/python master.py [NAME ...]

With no arguments, masters every row in MANIFEST. Pass one or more row names to
re-master only those (e.g. `python master.py reel_stop` after a re-roll).

Requires ffmpeg/ffprobe on PATH (encoding to MP3/WebM Opus) and the AudioForge venv
(soundfile, numpy, pyloudnorm - see requirements.txt).
"""

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

SOURCE_DIR = Path.home() / "Desktop" / "fs_audio"
OUT_DIR = Path(__file__).resolve().parents[2] / "frontend" / "public" / "assets" / "themes" / "future-spinner" / "sounds"

SILENCE_THRESHOLD_DBFS = -60.0
REEL_STOP_FADE_MS = 250
SFX_PEAK_TARGET_DBFS = -3.0
BED_LUFS_TARGET = -18.0
WIN_TIER_MARGIN_LUFS = 1.0  # minimum separation enforced between adjacent win tiers
ZERO_CROSSING_SEARCH_MS = 15  # window to search for a clean zero crossing near a cut point
SILENCE_TRIM_ZERO_CROSSING_MS = 5  # tighter window for the silence-trim boundary itself
SEAM_CROSSFADE_MS = 500  # loop-conditioning crossfade length (2026-07-14 seam fix)
SEAM_RMS_WINDOW_MS = 20  # window used to measure the end-vs-start seam level match
SEAM_RMS_TOLERANCE_DB = 2.0  # informational target; the hard gate lives in audio_verify.mjs

# (name, is_bgm, bpm) - bpm is None for non-tempo-locked rows.
# is_loop=True rows get WebM Opus + MP3-fallback; everything else gets MP3 only.
ROWS = {
    "bgm_loop": {"is_loop": True, "bpm": 100, "opus_kbps": 128},
    "bgm_tension": {"is_loop": True, "bpm": 140, "opus_kbps": 128},
    "anticipation_build": {"is_loop": True, "bpm": None, "opus_kbps": 96},
    "spin": {"is_loop": False},
    "reel_stop": {"is_loop": False},
    "reel_stop_anticipation": {"is_loop": False},
    "win_small": {"is_loop": False},
    "win_medium": {"is_loop": False},
    "win_big": {"is_loop": False},
    "win_epic": {"is_loop": False},
    "scatter_land": {"is_loop": False},
    "ui_click": {"is_loop": False},
}

WIN_TIER_ORDER = ["win_small", "win_medium", "win_big", "win_epic"]


def db_to_linear(db: float) -> float:
    return 10 ** (db / 20)


def linear_to_db(linear: float) -> float:
    return 20 * np.log10(linear) if linear > 0 else -999.0


def trim_silence(data: np.ndarray, sr: int, threshold_dbfs: float = SILENCE_THRESHOLD_DBFS) -> np.ndarray:
    """Strips leading/trailing samples below threshold_dbfs (checked on the mono-summed
    envelope so a signal panned hard in one channel doesn't get trimmed as silence), then
    snaps both cut points to the nearest zero crossing so the trim itself doesn't
    introduce a new click at the boundary (confirmed necessary in practice: ui_click's
    real content is a ~30ms transient followed by a long near-silent tail well below
    threshold - trimming to the raw threshold-crossing sample alone risked cutting
    mid-waveform)."""
    mono = data.mean(axis=1) if data.ndim > 1 else data
    thresh = db_to_linear(threshold_dbfs)
    above = np.where(np.abs(mono) > thresh)[0]
    if len(above) == 0:
        return data
    search = int(sr * SILENCE_TRIM_ZERO_CROSSING_MS / 1000)
    start = nearest_zero_crossing(data, int(above[0]), search)
    end = nearest_zero_crossing(data, int(above[-1]) + 1, search)
    if end <= start:
        start, end = int(above[0]), int(above[-1]) + 1
    return data[start:end]


def nearest_zero_crossing(data: np.ndarray, target_sample: int, search_samples: int) -> int:
    """Finds the sample index nearest target_sample where the mono-summed signal crosses
    zero (sign change), searching +/- search_samples. Falls back to target_sample if no
    crossing is found in range (e.g. near true silence, where any cut is effectively
    click-free anyway)."""
    mono = data.mean(axis=1) if data.ndim > 1 else data
    lo = max(0, target_sample - search_samples)
    hi = min(len(mono) - 1, target_sample + search_samples)
    window = mono[lo:hi]
    if len(window) < 2:
        return target_sample
    signs = np.sign(window)
    crossings = np.where(np.diff(signs) != 0)[0]
    if len(crossings) == 0:
        return target_sample
    # nearest crossing to the centre of the search window
    centre = target_sample - lo
    nearest = crossings[np.argmin(np.abs(crossings - centre))]
    return lo + nearest


def fade_out(data: np.ndarray, sr: int, duration_ms: int) -> np.ndarray:
    n = int(sr * duration_ms / 1000)
    n = min(n, len(data))
    if n <= 0:
        return data
    data = data.copy()
    # equal-power fade (cosine curve) - gentler on the ear than a linear ramp
    ramp = np.cos(np.linspace(0, np.pi / 2, n)) ** 2
    if data.ndim > 1:
        ramp = ramp[:, None]
    data[-n:] = data[-n:] * ramp
    return data


def trim_to_whole_bars(data: np.ndarray, sr: int, bpm: float) -> np.ndarray:
    """Trims to the longest whole-bar count (4/4 time assumed) that fits the current
    length at the given BPM, then snaps the cut point to the nearest zero crossing."""
    bar_seconds = 240 / bpm  # 4 beats/bar
    bar_samples = int(round(bar_seconds * sr))
    n_bars = len(data) // bar_samples
    if n_bars < 1:
        return data
    target = n_bars * bar_samples
    cut = nearest_zero_crossing(data, target, int(sr * ZERO_CROSSING_SEARCH_MS / 1000))
    return data[:cut]


def trim_to_seamless_cycle(data: np.ndarray, sr: int) -> np.ndarray:
    """anticipation_build has no BPM to bar-align against. Snaps both the very start and
    very end to their nearest zero crossings so the loop boundary is click-free - a
    simple, deterministic heuristic (not a full self-similarity search), documented here
    rather than overstated: this makes the *cut* seamless, it does not guarantee the
    *musical* content phrases perfectly, which would need a bar/phrase-aware source."""
    search = int(sr * ZERO_CROSSING_SEARCH_MS / 1000)
    start = nearest_zero_crossing(data, 0, search)
    end = nearest_zero_crossing(data, len(data) - 1, search)
    if end <= start:
        return data
    return data[start:end]


def condition_loop_seam(data: np.ndarray, sr: int, crossfade_ms: float = SEAM_CROSSFADE_MS) -> np.ndarray:
    """Folds the final crossfade_ms of a loop into its head via an equal-power
    crossfade, then trims the (now-redundant) tail off - the standard technique for a
    seamless wrap loop. The new clip's first sample is (almost) the source's natural
    continuation of what used to be its last sample (tail_region[0] at fade weight 1.0),
    fading across to the original head content by the end of the crossfade window, so
    both the wrap point (old end -> new start) and the chronological continuity read
    naturally. This shortens the clip by crossfade_ms - trim_to_whole_bars/
    trim_to_seamless_cycle must run first so the bar/cycle alignment is computed on the
    pre-seam-fix length, not after this shortens it."""
    n = int(sr * crossfade_ms / 1000)
    if n * 2 >= len(data):
        return data  # too short to condition safely - leave as-is rather than corrupt it
    head = data[:n]
    tail = data[len(data) - n:]
    middle = data[n:len(data) - n]
    fade_in = np.sin(np.linspace(0, np.pi / 2, n)) ** 2  # 0 -> 1, toward the head
    fade_out = np.cos(np.linspace(0, np.pi / 2, n)) ** 2  # 1 -> 0, away from the tail
    if data.ndim > 1:
        fade_in = fade_in[:, None]
        fade_out = fade_out[:, None]
    blended_head = tail * fade_out + head * fade_in
    return np.concatenate([blended_head, middle], axis=0)


def measure_seam_rms_delta_db(data: np.ndarray, sr: int, window_ms: float = SEAM_RMS_WINDOW_MS) -> float:
    """Returns the absolute dB difference between the RMS of the first and last
    window_ms of data - the same seam-level-match metric audio_verify.mjs's hard gate
    checks against the shipped, encoded file. Informational here (logged, not
    asserted); the pipeline can't itself guarantee an arbitrary source's tail and head
    levels end up within tolerance after conditioning, so this is measured and
    reported honestly rather than silently assumed."""
    n = int(sr * window_ms / 1000)
    n = min(n, len(data) // 2)
    if n <= 0:
        return 0.0
    start_rms = np.sqrt(np.mean(data[:n].astype(np.float64) ** 2))
    end_rms = np.sqrt(np.mean(data[-n:].astype(np.float64) ** 2))
    start_db = linear_to_db(start_rms)
    end_db = linear_to_db(end_rms)
    return abs(start_db - end_db)


def peak_normalize(data: np.ndarray, target_dbfs: float) -> np.ndarray:
    peak = np.max(np.abs(data))
    if peak <= 0:
        return data
    gain = db_to_linear(target_dbfs) / peak
    return data * gain


def lufs_normalize(data: np.ndarray, sr: int, target_lufs: float) -> np.ndarray:
    meter = pyln.Meter(sr)
    current = meter.integrated_loudness(data)
    gain_db = target_lufs - current
    return data * db_to_linear(gain_db)


def master_win_family(mastered: dict) -> dict:
    """Peak-normalises each win tier to SFX_PEAK_TARGET_DBFS (the ceiling every SFX gets),
    then checks the resulting integrated LUFS escalates small < medium < big < epic. Peak
    normalisation alone doesn't guarantee this - two clips at the same peak can have very
    different loudness depending on their crest factor - so this walks the tiers from
    loudest (epic, the anchor) down to quietest (small), and wherever an earlier
    (should-be-quieter) tier's LUFS isn't at least WIN_TIER_MARGIN_LUFS below the next
    tier's, pulls the earlier tier's gain down further. This only ever attenuates (never
    boosts past the -3dBFS peak ceiling), so it stays compliant with the peak-normalise
    rule while guaranteeing monotonic escalation."""
    sr = mastered[WIN_TIER_ORDER[0]]["sr"]
    meter = pyln.Meter(sr)

    for name in WIN_TIER_ORDER:
        mastered[name]["data"] = peak_normalize(mastered[name]["data"], SFX_PEAK_TARGET_DBFS)

    lufs = {name: meter.integrated_loudness(mastered[name]["data"]) for name in WIN_TIER_ORDER}

    for i in range(len(WIN_TIER_ORDER) - 2, -1, -1):
        lower, upper = WIN_TIER_ORDER[i], WIN_TIER_ORDER[i + 1]
        if lufs[lower] >= lufs[upper] - WIN_TIER_MARGIN_LUFS:
            target = lufs[upper] - WIN_TIER_MARGIN_LUFS
            correction_db = target - lufs[lower]
            mastered[lower]["data"] = mastered[lower]["data"] * db_to_linear(correction_db)
            lufs[lower] = target
            print(f"    [win-escalation] {lower} attenuated {correction_db:.2f}dB "
                  f"to sit below {upper} (target {target:.2f} LUFS)")

    print("    Win family final LUFS: " + ", ".join(
        f"{name}={lufs[name]:.2f}" for name in WIN_TIER_ORDER
    ))
    return mastered


def encode_mp3(wav_path: Path, out_path: Path, bitrate_k: int) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
         "-codec:a", "libmp3lame", "-b:a", f"{bitrate_k}k", str(out_path)],
        check=True,
    )


def encode_opus(wav_path: Path, out_path: Path, bitrate_k: int) -> None:
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav_path),
         "-codec:a", "libopus", "-b:a", f"{bitrate_k}k", str(out_path)],
        check=True,
    )


def master_row(name: str, config: dict, out_dir: Path):
    src = SOURCE_DIR / f"{name}.wav"
    if not src.exists():
        print(f"  [skip] {name}: no promoted WAV at {src}", file=sys.stderr)
        return None

    print(f"  mastering {name}...")
    data, sr = sf.read(src)
    data = trim_silence(data, sr)

    if name == "reel_stop":
        data = fade_out(data, sr, REEL_STOP_FADE_MS)

    if config["is_loop"]:
        if config["bpm"]:
            data = trim_to_whole_bars(data, sr, config["bpm"])
        else:
            data = trim_to_seamless_cycle(data, sr)

        # Seam fix (2026-07-14): fold the tail into the head and trim, so the wrap
        # point is a genuine crossfade rather than just a click-free zero-crossing cut.
        data = condition_loop_seam(data, sr)
        delta_db = measure_seam_rms_delta_db(data, sr)
        status = "OK" if delta_db <= SEAM_RMS_TOLERANCE_DB else "OUT OF TOLERANCE"
        print(f"    [seam] end-vs-start RMS delta: {delta_db:.2f}dB "
              f"(target <= {SEAM_RMS_TOLERANCE_DB}dB) - {status}")

    return data, sr


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("names", nargs="*", help="Row names to master (default: all)")
    args = parser.parse_args()

    names = args.names if args.names else list(ROWS.keys())
    unknown = [n for n in names if n not in ROWS]
    if unknown:
        print(f"Unknown row(s): {', '.join(unknown)}", file=sys.stderr)
        sys.exit(1)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    mastered = {}

    for name in names:
        config = ROWS[name]
        result = master_row(name, config, OUT_DIR)
        if result is None:
            continue
        data, sr = result
        mastered[name] = {"data": data, "sr": sr, "config": config}

    # Loudness pass. The win-escalation check (small < medium < big < epic) only makes
    # sense with all four tiers present - a re-master of a single win tier still gets
    # peak-normalised, just without the cross-tier correction (documented, not silent).
    win_family_corrected = set()
    if all(n in mastered for n in WIN_TIER_ORDER):
        mastered = master_win_family(mastered)
        win_family_corrected = set(WIN_TIER_ORDER)
    else:
        requested_win_tiers = [n for n in WIN_TIER_ORDER if n in mastered]
        if requested_win_tiers:
            print(f"    [win-escalation] skipped - only {requested_win_tiers} requested, "
                  f"needs all four tiers to check escalation; peak-normalising alone")

    for name, m in mastered.items():
        if name in win_family_corrected:
            continue  # already peak-normalised + escalation-corrected above
        config = m["config"]
        if config["is_loop"]:
            m["data"] = lufs_normalize(m["data"], m["sr"], BED_LUFS_TARGET) if config["bpm"] else \
                peak_normalize(m["data"], SFX_PEAK_TARGET_DBFS)
        else:
            m["data"] = peak_normalize(m["data"], SFX_PEAK_TARGET_DBFS)

    # Write mastered WAV to a temp scratch path, then encode to shipping formats.
    scratch = OUT_DIR / ".scratch"
    scratch.mkdir(exist_ok=True)
    for name, m in mastered.items():
        wav_scratch = scratch / f"{name}.wav"
        sf.write(str(wav_scratch), m["data"], m["sr"], subtype="PCM_16")

        config = m["config"]
        if config["is_loop"]:
            encode_opus(wav_scratch, OUT_DIR / f"{name}.webm", config["opus_kbps"])
            encode_mp3(wav_scratch, OUT_DIR / f"{name}.mp3", 192)
        else:
            encode_mp3(wav_scratch, OUT_DIR / f"{name}.mp3", 192)

        print(f"    -> {name}: shipped to {OUT_DIR}")

    shutil.rmtree(scratch)
    print("Done.")


if __name__ == "__main__":
    main()
