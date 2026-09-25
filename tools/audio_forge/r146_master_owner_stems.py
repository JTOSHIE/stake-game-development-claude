"""R146: master the owner's dropped stems through master.py's OWN functions.

Usage, from the repository root (writes ONLY into <stage_dir>; copy the results into the
theme sounds directory yourself after checking them):
    tools/audio_forge/.venv/bin/python tools/audio_forge/r146_master_owner_stems.py <stage_dir> [NAME ...]

With no names, masters all fifteen; pass names to re-master only those (as master.py does),
e.g. `... <stage_dir> bgm_loop` after the owner swaps one master.

The masters are the owner's WAVs in the theme sounds directory (gitignored, never versioned;
their full sha256 is recorded in the sounds README). Imports tools/audio_forge/master.py's OWN functions (used
unchanged; R146 added only a refusal guard to master.py's main(), which is not run here because
it reads ~/Desktop/fs_audio and writes over the shipped files). Calibrated before use: the same import recipe re-derives 8 shipped mp3s byte for
byte and 3 shipped webms packet for packet from the July sources.
Deviations from master.main(), each recorded in the session report:
  - beds: gain to BED_LUFS_TARGET only. trim_silence, trim_to_whole_bars, trim_to_seamless_cycle
    and condition_loop_seam (the 500 ms fold) are NOT applied: the owner's beds are pre-wrapped
    88 BPM 4-bar loops (523,636 frames at 48 kHz, 481,091 at 44.1 kHz), and the pipeline's
    loop path would re-cut them to about 3.34 / 3.59 / 3.82 bars (bgm_loop / bgm_tension /
    anticipation_build; the fold alone still loses 0.19 of a bar). anticipation_build also goes
    to -18 LUFS per the R146 brief, not master.py's historic peak path.
  - master_win_family is not called: it raises on win_small (0.37 s, under pyloudnorm's 0.4 s block);
    each tier is peak-normalised alone, which is main()'s own documented fallback.
  - four cues not in ROWS (feature_enter, feature_end, retrigger, win_max) take the one-shot recipe.
"""
import os, sys, importlib.util, soundfile as sf
from pathlib import Path
spec = importlib.util.spec_from_file_location('master', str(Path(__file__).resolve().parent / 'master.py'))
M = importlib.util.module_from_spec(spec); spec.loader.exec_module(M)
SRC, STAGE = M.OUT_DIR, Path(sys.argv[1])
PUBLIC = SRC.parents[3]   # frontend/public: anything staged under it would ship


def _inside(child: Path, parent: Path) -> bool:
    # samefile, not a path comparison: this disk is case-insensitive, so 'Sounds' is 'sounds'.
    for q in [child.resolve(), *child.resolve().parents]:
        if q.exists() and os.path.samefile(q, parent):
            return True
    return False


assert not _inside(STAGE, PUBLIC), 'stage into a scratch directory outside frontend/public, never over the shipped files'
(STAGE / 'wav').mkdir(parents=True, exist_ok=True)
BEDS = {'bgm_loop': 128, 'bgm_tension': 128, 'anticipation_build': 96}   # = ROWS[n]['opus_kbps']
FOUR_BARS_S = 4 * 4 * 60 / 88   # the owner's beds are 4-bar loops at 88 BPM, 10.909 s at any rate
ONESHOTS = ['spin', 'reel_stop', 'reel_stop_anticipation', 'scatter_land', 'win_small', 'win_medium',
            'win_big', 'win_epic', 'win_max', 'feature_enter', 'feature_end', 'retrigger']
# R147 1B. Seven of the owner's one-shots carry a large sub-20 Hz swell (measured share of
# energy below 20 Hz: feature_end 99.3%, win_small 99.1%, retrigger 98.1%, win_medium 97.6%,
# win_epic 89.3%, win_max 88.0%, feature_enter 54.5%; every other stem 0.6% or less). Peak
# normalisation spent its headroom on that inaudible swell, so their audible part shipped
# quiet. master.py has no rumble filter, so the filter is declared here and applied BEFORE the
# pipeline's own trim and peak normalisation; the owner's WAV masters are not altered.
# Causal (minimum-phase) on purpose: a zero-phase filter's pre-ringing left feature_end and
# win_small starting on a 0.62 and 0.39 step, a click at every onset; causal leaves both ends
# at about 0. 4th order at 30 Hz (the top of the brief's 20 to 30 Hz range) leaves at most
# 1.9% of energy below 20 Hz and costs about 0.4 dB at 40 Hz.
HIGHPASS_STEMS = {'feature_end', 'win_small', 'retrigger', 'win_medium', 'win_epic', 'win_max', 'feature_enter'}
HIGHPASS_ORDER, HIGHPASS_HZ = 4, 30


def highpass(d, sr):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(HIGHPASS_ORDER, HIGHPASS_HZ, 'hp', fs=sr, output='sos'), d, axis=0)


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
def premaster_oneshot(n):
    d, sr = sf.read(str(SRC / f'{n}.wav'))
    if n in HIGHPASS_STEMS:
        d = highpass(d, sr)
    d = M.trim_silence(d, sr)
    if n == 'reel_stop':
        d = M.fade_out(d, sr, M.REEL_STOP_FADE_MS)
    return M.peak_normalize(d, M.SFX_PEAK_TARGET_DBFS), sr


# R147 1C. THE WIN LADDER. The owner's stems left it inverted (win_big about 12 LU above
# win_epic). The brief orders a gain ladder, no new audio: after encode, integrated loudness
# must rise at least 1 LU per step, small < medium < big < epic < max. Gains only, so the top
# anchors it: every tier sits at the -3 dBFS peak ceiling already, and raising win_max further
# would need a limiter. Walking down from win_max, each tier is ATTENUATED only as far as needed
# to sit LADDER_PREENCODE_LU below the next. 1.75, the smallest margin at which the ENCODED
# files clear 1.0 LU on both pyloudnorm and ffmpeg's ebur128 (at 1.25 the two meters disagree by
# 0.57 LU on win_epic, and ebur128 then read the epic-to-max step as only +0.7).
# This is master_win_family's walk, extended to win_max, with a short-clip loudness method:
# BS.1770 gates in 400 ms blocks, so a clip shorter than that (win_small, 0.38 s) is measured
# as one silence-padded 400 ms block. Always computed from all five tiers, so re-mastering one
# of them gives the same gains.
WIN_LADDER = ['win_small', 'win_medium', 'win_big', 'win_epic', 'win_max']
LADDER_PREENCODE_LU = 1.75


def ladder_lufs(d, sr):
    import numpy as np, pyloudnorm as pyln
    need = int(0.4 * sr)
    if len(d) < need:
        d = np.vstack([d, np.zeros((need - len(d), d.shape[1]))])
    return pyln.Meter(sr).integrated_loudness(d)


LADDER_GAIN_DB = {}
if any(n in WIN_LADDER for n in NAMES):
    level = {n: ladder_lufs(*premaster_oneshot(n)) for n in WIN_LADDER}
    target = level[WIN_LADDER[-1]]
    LADDER_GAIN_DB[WIN_LADDER[-1]] = 0.0
    for n in reversed(WIN_LADDER[:-1]):
        target = min(level[n], target - LADDER_PREENCODE_LU)
        LADDER_GAIN_DB[n] = target - level[n]
    print('win ladder: ' + ', '.join(f'{n} {level[n]:.2f} LUFS gain {LADDER_GAIN_DB[n]:+.2f} dB' for n in WIN_LADDER))

for n in ONESHOTS:
    if n not in NAMES:
        continue
    d, sr = premaster_oneshot(n)
    if n in LADDER_GAIN_DB:
        d = d * M.db_to_linear(LADDER_GAIN_DB[n])
    w = STAGE / 'wav' / f'{n}.wav'; sf.write(str(w), d, sr, subtype='PCM_16')
    M.encode_mp3(w, STAGE / f'{n}.mp3', 192)
    print(f'one-shot {n}: {len(d)} frames at {sr} ({len(d)/sr*1000:.0f} ms)')
