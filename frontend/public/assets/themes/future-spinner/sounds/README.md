# Future Spinner sound files, provenance

A repository record. `vite.config.ts`'s `pruneDocs` keeps this file out of the shipped
bundle, and its `pruneAudioMasters` does the same for the WAV masters beside it.

## What ships, as of R146 (2026-09-25)

Nineteen files. Every one of them except `ui_click.mp3` comes from the OWNER'S stems,
dropped into this directory on 2026-09-25 under their code names. bgm_loop's master was
then swapped by the owner to "take A" the same day.

| Shipped file(s) | Master (bare stem, not versioned) | Master sha256 | Rate, frames |
|---|---|---|---|
| `bgm_loop.{webm,mp3}` | bgm_loop, take A | 59cbe76c3787151ea61326f8ff4cb9786166ef1684b899dd25831fc697bff0eb | 44.1 kHz, 481,091 |
| `bgm_tension.{webm,mp3}` | bgm_tension | 454d3e186bb81c9f2d4f6db6f3a8a0be09361aa70243c6b48cee208f61e92812 | 48 kHz, 523,636 |
| `anticipation_build.{webm,mp3}` | anticipation_build | 24cd9ac65db1a6be88e10eaa69af0b38643eea378ef07379cd3f4501f1c3418b | 48 kHz, 523,636 |
| `spin.mp3` | spin | c1ee12df991c9f5a6993bcb7f379c4829d303804215d0035cb979fea9d4a6f1e | 44.1 kHz |
| `reel_stop.mp3` | reel_stop | 6246f11e9b121f7491a016773f17fb937cc489120855b31b9112117d53ef1c34 | 44.1 kHz |
| `reel_stop_anticipation.mp3` | reel_stop_anticipation | 8911d7e754aa3793031d3ac564d44cbdfd1dc32c8b0a62ca02b0beaa0c8dba36 | 48 kHz |
| `scatter_land.mp3` | scatter_land | bf628534da06f9b724e23618e03d8a27749f67e3eaa7824d170d0ae2841dfa20 | 48 kHz |
| `win_small.mp3` | win_small | 145f3369752356720eef03db468c409117343f44151ff0549b6653352fbe111d | 44.1 kHz |
| `win_medium.mp3` | win_medium | 3810cc0c72f4406553c1bf0eea22623a88870334349b5472a50599010ae84c46 | 44.1 kHz |
| `win_big.mp3` | win_big | 049ad31ad469d3a5c5b41298a46fd688089b1862de156c0d56d94b167a812530 | 44.1 kHz |
| `win_epic.mp3` | win_epic | 2ebf5d578cf5da4238072a83b38346cd6eb70754a59aa9502db6614f29221f4e | 44.1 kHz |
| `win_max.mp3` | win_max | a7ffccceec14e90f0cf61a7ad0d0bb158dfc3055c9eda4b7b1703518372ae7ab | 44.1 kHz |
| `feature_enter.mp3` | feature_enter | 8ed947fe4cf1926cec34412f256d91ea15bca669e50d7f51b1987b2e84cea677 | 44.1 kHz |
| `feature_end.mp3` | feature_end | 2e2ead3375234ce5bfe464323776bd66f338fd851c5b2ba2674672f6dac4d6a0 | 44.1 kHz |
| `retrigger.mp3` | retrigger | 17dbdb2537117dfc33fdc579da20403f380c930452c8cd0ea2db04063e87b310 | 44.1 kHz |
| `ui_click.mp3` | the July row below, unchanged | | |

The masters sit in this directory as WAV files with the stems above, gitignored and never
committed; the sha256 column is what ties a master to its encode. The owner's own
MANIFEST.txt (also gitignored) lists the original drop, whose bgm_loop (sha256
77556d1dd4e0...) take A replaced; that original is still in the owner's
future-spinner-sounds-ready.zip.

**The three beds are 4-bar loops at 88 BPM, 10.909 s.** They replaced 88.3 s and 57.8 s
beds at 100 and 140 BPM.

**The four cues R125 wired and left silent now have files**: feature_enter, feature_end,
retrigger and win_max. `soundService.ts` declares them in `AVAILABLE_PENDING_CUES` and
`themeStore.ts` paths them. A max win reached by a spin, or in Bet Replay, now plays
win_max instead of win_epic and its echo. A BOUGHT max win still plays win_epic, because
that route calls playWin from App.svelte's buy settle; changing it is a call-site change,
parked for the owner (docs/audio/AUDIO_TRUTH_MAP.md section 4.5). If win_max.mp3 ever
fails to load, the max win plays win_epic and its echo instead, never silence; the first
real tap or key press of a session fetches all four cues so none starts late.

## How they were mastered

`tools/audio_forge/r146_master_owner_stems.py`, which imports `tools/audio_forge/master.py`
and calls the pipeline's own functions, unchanged. master.py's main() is not run: it reads
the July sources from the Desktop and writes over these files, so R146 added one guard to
it, and it now refuses any row whose owner master sits here unless told `--july-sources`.
The import route was calibrated before use: fed the July sources, it re-derives the July
encodes (8 mp3 byte for byte, the 3 webm packet for packet).

- **Beds**: gain to -18 LUFS only, then Opus webm (128k, 128k, 96k) and a 192k mp3
  fallback. **The 500 ms seam fold, the bar trim and the silence trim are skipped**: on
  these pre-wrapped 4-bar loops they would cut 3.34 to 3.82 bars. Measured: webm -18.0
  LUFS, mp3 -18.2 LUFS; the mp3 decodes to the exact 4-bar frame count. anticipation_build
  goes to -18 LUFS too; before R146 it was peak-normalised and shipped near -15.5 LUFS.
- **One-shots**: the pipeline's one-shot recipe: silence trim, the 250 ms reel_stop fade,
  -3 dBFS peak, 192k mp3. The win-tier escalation (master_win_family) is not run because
  it raises on win_small, which is shorter than the loudness meter's 0.4 s block; each
  tier is peak-normalised alone, which is main()'s own documented fallback.

To re-master after the owner replaces a master, from the repository root:
`tools/audio_forge/.venv/bin/python tools/audio_forge/r146_master_owner_stems.py <scratch-dir> [NAME ...]`,
then check the outputs and copy them here.

## Open questions for the owner, recorded at R146

1. **Licence and source of the owner's stems: not stated in the drop.** Until it is
   recorded here, this set's licensing is UNKNOWN.
2. **bgm_loop take A starts with 12 ms of digital silence** while its tail runs at about
   -12 dBFS, so each wrap, once every 10.9 s, drops into a 12 ms gap. audio_verify's seam
   check fails on it (18.6 dB against 2.0 dB); the original drop's bgm_loop measured 1.5 dB.
   Fix: a re-export wrapped like the other two beds, or the original drop.
3. **Seven one-shots carry a large sub-20 Hz swell** (feature_end and win_small worst), so
   peak normalisation leaves their audible part quiet: feature_end integrates near -32 LUFS.
4. **The win ladder is not monotonic** (win_big -11.9 LUFS, win_epic -23.7 LUFS), and
   **win_max** sounds for 1.78 s once its silent tail is trimmed (the master is 2.34 s),
   against the truth map's 5.0 s spec and the 2.6 s max-win reveal, and it is quieter than
   win_epic (-25.2 against -23.7 LUFS).

## July 2026: the Stable Audio 3 set (history, and still ui_click's provenance)

Before R146 all twelve shipped rows were generated by `tools/audio_forge/` (Stable Audio 3
open weights, `stabilityai/stable-audio-3-medium`, seed `20260707`) and mastered by
`tools/audio_forge/master.py`; see `reports/audio/GENERATION_LOG_2026-07-13.md`.
Only `ui_click.mp3` (`ui_click`, minimal digital tap) still ships from that set. Its full
prompt is in `tools/audio_forge/generate.py`'s `MANIFEST`.

## Licence

`ui_click.mp3` is generated audio subject to the **Stability AI Community License
Agreement** (the model's licence, not this repo's); see `tools/audio_forge/LICENSE.md` and
`tools/audio_forge/NOTICE` for the full text and attribution line. The owner's stems are
covered by open question 1 above.

## Legacy files

NONE, as of 2026-08-09. This section used to say that scatter.mp3 and win.mp3 were
unreferenced leftovers from an earlier sound-tier refactor, "left in place rather than
removed as out of scope for this pass". They were removed from THIS directory some time
ago, and the paragraph was never updated.

It kept resolving only because copies survived in the ROOT frontend/public/assets/sounds/
tree, which was a full duplicate nothing could reach: audio paths are built under the theme
base in `frontend/src/lib/stores/themeStore.ts`. That root tree was deleted on 2026-08-09,
1,955,845 bytes across 14 files, which is what finally made this claim fail out loud.
