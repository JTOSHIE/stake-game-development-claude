"""R146: master the owner's dropped stems through master.py's OWN functions.

Usage, from the repository root (writes ONLY into <stage_dir>; copy the results into the
theme sounds directory yourself after checking them):
    tools/audio_forge/.venv/bin/python tools/audio_forge/r146_master_owner_stems.py <stage_dir> [NAME ...]

With no names, masters all fifteen; pass names to re-master only those (as master.py does),
e.g. `... <stage_dir> bgm_loop` after the owner swaps one master.

The masters are the owner's WAVs in the theme sounds directory (gitignored, never versioned;
their full sha256 is recorded in the sounds README). Imports tools/audio_forge/master.py's OWN functions (master.py is not
edited and its main() is not run, because main() reads ~/Desktop/fs_audio and writes over the
shipped files). Calibrated before use: the same import recipe re-derives 8 shipped mp3s byte for
byte and 3 shipped webms packet for packet from the July sources.
Deviations from master.main(), each recorded in the session report:
  - beds: gain to BED_LUFS_TARGET only. trim_silence, trim_to_whole_bars, trim_to_seamless_cycle
    and condition_loop_seam (the 500 ms fold) are NOT applied: the owner's beds are pre-wrapped
    88 BPM 4-bar loops (523,636 frames at 48 kHz, 481,091 at 44.1 kHz), and the pipeline's
    loop path would re-cut them to 436,726 / 469,718 / 499,566 frames. anticipation_build also goes
    to -18 LUFS per the R146 brief, not master.py's historic peak path.
  - master_win_family is not called: it raises on win_small (0.37 s, under pyloudnorm's 0.4 s block);
    each tier is peak-normalised alone, which is main()'s own documented fallback.
  - four cues not in ROWS (feature_enter, feature_end, retrigger, win_max) take the one-shot recipe.
"""
import sys, importlib.util, soundfile as sf
from pathlib import Path
spec = importlib.util.spec_from_file_location('master', str(Path(__file__).resolve().parent / 'master.py'))
M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
SRC, STAGE = M.OUT_DIR, Path(sys.argv[1])
(STAGE / 'wav').mkdir(parents=True, exist_ok=True)
assert STAGE.resolve() != SRC.resolve(), 'stage into a scratch directory, never straight over the shipped files'
BEDS = {'bgm_loop': 128, 'bgm_tension': 128, 'anticipation_build': 96}   # = ROWS[n]['opus_kbps']
FOUR_BARS_S = 4 * 4 * 60 / 88   # the owner's beds are 4-bar loops at 88 BPM, 10.909 s at any rate
ONESHOTS = ['spin', 'reel_stop', 'reel_stop_anticipation', 'scatter_land', 'win_small', 'win_medium',
            'win_big', 'win_epic', 'win_max', 'feature_enter', 'feature_end', 'retrigger']
NAMES = sys.argv[2:] or list(BEDS) + ONESHOTS
unknown = [n for n in NAMES if n not in BEDS and n not in ONESHOTS]
assert not unknown, f'unknown name(s): {unknown}'
for n, kbps in BEDS.items():
    if n not in NAMES:
        continue
    assert M.ROWS[n]['opus_kbps'] == kbps
    d, sr = sf.read(str(SRC / f'{n}.wav'))
    # 523,636 frames at 48 kHz, 481,091 at 44.1 kHz. A bed that is not exactly four bars
    # would drift its downbeat at every wrap, so it is refused rather than encoded.
    assert len(d) == round(FOUR_BARS_S * sr), (n, len(d), sr, round(FOUR_BARS_S * sr))
    d = M.lufs_normalize(d, sr, M.BED_LUFS_TARGET)
    w = STAGE / 'wav' / f'{n}.wav'; sf.write(str(w), d, sr, subtype='PCM_16')
    M.encode_opus(w, STAGE / f'{n}.webm', kbps); M.encode_mp3(w, STAGE / f'{n}.mp3', 192)
    print(f'bed {n}: {len(d)} frames, seam {M.measure_seam_rms_delta_db(d, sr):.2f} dB, peak {M.linear_to_db(abs(d).max()):.2f} dBFS')
for n in ONESHOTS:
    if n not in NAMES:
        continue
    d, sr = sf.read(str(SRC / f'{n}.wav'))
    d = M.trim_silence(d, sr)
    if n == 'reel_stop':
        d = M.fade_out(d, sr, M.REEL_STOP_FADE_MS)
    d = M.peak_normalize(d, M.SFX_PEAK_TARGET_DBFS)
    w = STAGE / 'wav' / f'{n}.wav'; sf.write(str(w), d, sr, subtype='PCM_16')
    M.encode_mp3(w, STAGE / f'{n}.mp3', 192)
    print(f'one-shot {n}: {len(d)} frames at {sr} ({len(d)/sr*1000:.0f} ms)')
