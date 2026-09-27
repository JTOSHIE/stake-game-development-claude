# Future Spinner sound files, provenance

A repository record. `vite.config.ts`'s `pruneDocs` keeps this file out of the shipped
bundle, and its `pruneAudioMasters` does the same for the WAV masters beside it.

## What ships, as of R146 (2026-09-25)

Nineteen files. Every one of them except `ui_click.mp3` comes from the OWNER'S stems,
dropped into this directory on 2026-09-25 under their code names. bgm_loop's master was
swapped by the owner to "take A" the same day, and restored to the original drop at R147
(2026-09-26) because take A could not be wrapped seamlessly; take A is parked, see below. At
R149 (2026-09-27) the owner replaced it with a ChatGPT circular rebuild (section below).

| Shipped file(s) | Master (bare stem, not versioned) | Master sha256 | Rate, frames |
|---|---|---|---|
| `bgm_loop.{webm,mp3}` | bgm_loop, ChatGPT circular rebuild (R149) | bdd217b7280b93e18aea0cf9fbda83a567777e9a09443e7d2bd58f4e5ab8dcea | 48 kHz, 523,636 |
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
MANIFEST.txt (also gitignored) lists the original drop, which bgm_loop was mastered from until
R149 (sha256 77556d1d..., still in the owner's future-spinner-sounds-ready.zip and final pack).
Take A (sha256 59cbe76c...) is parked where the owner left it, in the bgm_loop-take-A folder in
Downloads.

**The three beds are 4-bar loops at 88 BPM, 10.909 s.** They replaced 88.3 s and 57.8 s
beds at 100 and 140 BPM.

**The four cues R125 wired and left silent now have files**: feature_enter, feature_end,
retrigger and win_max. `soundService.ts` declares them in `AVAILABLE_PENDING_CUES` and
`themeStore.ts` paths them. A max win reached by a spin, or in Bet Replay, now plays
win_max instead of win_epic and its echo, and since R147 so does a BOUGHT max win, at the
moment its celebration appears (the one call-site change the R147 brief authorised, in
App.svelte's buy path; before it that reveal was silent and win_epic played only after the
feature). If win_max.mp3 ever
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
  -3 dBFS peak, 192k mp3. master.py's master_win_family is not run because it raises on
  win_small, which is shorter than the loudness meter's 0.4 s block.
- **R147, the rumble filter**: seven one-shots (feature_end, win_small, retrigger,
  win_medium, win_epic, win_max, feature_enter) carried a large sub-20 Hz swell, so a causal
  4th-order Butterworth high-pass at 30 Hz runs on them BEFORE the trim and peak step. Their
  share of energy below 20 Hz falls to 1.9% or less, and feature_end rises from -31.9 to
  -26.8 LUFS. The masters are not altered. Causal because a zero-phase filter left a click
  at the onset of feature_end and win_small.
- **R147, the win ladder**: after peak normalisation each win tier is attenuated, walking
  down from win_max, until it sits 1.75 LU below the next, so the encoded files rise at least
  1 LU a tier on pyloudnorm: win_small -31.7, win_medium -29.9, win_big -28.2, win_epic -26.5,
  win_max -24.7 LUFS (win_small measured as one padded 400 ms block). ffmpeg's ebur128 agrees
  (-31.7 for win_small given the same padded block, then -29.9, -28.2, -25.9, -24.7); unpadded,
  neither meter can read the 0.38 s win_small. Gains only; nothing is limited or recomposed, so the whole ladder sits well below
  the other effects, and win_big comes down 16.2 dB from the owner's level.
- **R148, the playback path (no file changed)**: the base bed (bgm_loop) now plays through
  Web Audio, one AudioBufferSourceNode looping the decoded buffer
  (`frontend/src/lib/services/loopBed.ts`). A looping audio element stalls about 50 to 60 ms
  at every wrap in Chromium whatever the file (measured with nothing attached: a 10,959 to
  10,969 ms period against 10,909 ms of audio), and a 16-bar encode only made the stall
  rarer (43 to 48 ms every 43.6 s), so it was not shipped. The encodes above are unchanged
  and still pass audio_verify's seam check. The tension bed and the anticipation riser still
  loop as audio elements.

To re-master after the owner replaces a master, from the repository root:
`tools/audio_forge/.venv/bin/python tools/audio_forge/r146_master_owner_stems.py <scratch-dir> [NAME ...]`,
then check the outputs and copy them here.

## R149 (2026-09-27): the idle bed is a ChatGPT circular rebuild

The owner's brief (`reports/briefs/FS_R149_CircularIdleBed_Prompt.md`) replaced the bgm_loop
master only. Provenance, as the brief states it: **ChatGPT circular rebuild, 2026-09-27**. The
master came from the art-review folder chatgpt-bgm-loop-circular (gitignored .scratch, never
committed) beside a cell_raw.wav (sha256 2d38fce2..., 48 kHz, 571,636 frames), which is
provenance only: not encoded, not shipped.

- **The supplier's figures, re-derived here and matching exactly:** 0.421 dB between the first
  and last 20 ms RMS, 37.85% of energy above 200 Hz, L/R correlation 0.776. Also measured: 48 kHz,
  24-bit, exactly 523,636 frames (4.00000 bars at 88 BPM); the join is a step 0.37x the loop's
  99.9th-percentile step. The master IS cell_raw's first 523,636 frames, sample for sample: no
  fold and no crossfade (cell_raw is those four bars plus a 1.0 s tail). No wrap was added here.
- **It is one bar played four times.** Its four bars (130,909 samples, 2.727 s each) are
  bit-identical, and so are cell_raw's; the original drop's four bars differ. So the idle bed now
  repeats every 2.73 s rather than every 10.9 s, and it wraps cleanly because the cut at four
  bars joins bar 4 to bar 1 exactly as each bar joins the next. The bars were tiled, not rendered
  through, so that same splice recurs at every bar line, every 2.727 s. How the repetition and
  the bar line sound over a long idle is the owner's ear-check.
- **It is not a sample-aligned edit of the original drop:** normalised cross-correlation with the
  previous master 0.18 at the best circular lag, which is chance level for audio with this
  spectrum. A correlation cannot rule out a re-render from the same material. It is darker: 37.85%
  of its energy lies above 200 Hz against 74.78% for the original drop (one-sided power summed
  over both channels, so it balances by Parseval). Worth hearing on a phone speaker.
- **Mastered as the other beds were**, through the R146 wrapper (gain to -18 LUFS, the 500 ms fold
  skipped): webm 206,698 B at -18.0 LUFS, mp3 263,277 B at -18.2 LUFS, both decoding to exactly
  523,636 frames where the decoder trims the Opus pre-skip and the mp3 encoder delay (ffmpeg,
  Chromium, WebKit; Firefox decodes the webm one frame short, 523,635, as it did the previous
  one); seam 0.50 dB webm and 0.45 dB mp3. Since R148 the bed loops through Web Audio, so its wrap
  in the game is sample-exact; this change is only the samples. Measured on the webm in the built
  game in Chromium (25 s idle, no spin, three autoplay policies): the output is exactly 0.5 x the
  decoded bed through both wraps, residual 0.0.
- **Open for the owner:** the stems' licence and source question now extends to this file, and
  the recorded OpenAI clearance (Ticket 456254) is scoped to image generation for artwork, not
  to audio. Take A stays parked. The original drop's master (sha256
  77556d1dd4e0c072dd4fb4a0d3437998d29ef65ec7cdcd20f46976ed3dc1f387) is in the owner's zip and
  final pack; to restore it, revert R149's samples commit and copy that master back beside the
  encodes.

## Open questions for the owner, recorded at R146

1. **Licence and source of the owner's stems: not stated in the drop.** Until it is
   recorded here, this set's licensing is UNKNOWN.
2. **OWNER CHOICE, R147: "scratchy-but-seamless bed restored; take A parked".** Take A
   starts with 12 ms of digital silence (528 zero frames) while its tail runs at about -12
   dBFS, so each wrap dropped into a 12 ms gap (seam 18.6 dB against audio_verify's 2.0 dB).
   R147 tried the brief's 40 ms equal-power fold first. Take A has no audio past its loop
   end, so the fold could only either cut the loop to 3.9853 bars (seam 0.90 dB, but every
   cycle 40 ms short of the 4-bar lock) or keep 4 bars by replaying the last 40 ms (seam
   1.22 dB, but a jump back in the music at every wrap, a step 3.2x the loop's 99.9th-
   percentile step and 0.92x its single largest). Neither is a
   pass without inventing audio, so the original drop's bed is back (audio_verify seam
   1.50 dB webm, 1.47 dB mp3). Take A
   can return as a re-export rendered with a wrapped 40 ms tail, as the other beds were.
   **R149:** the owner then replaced the idle master with the ChatGPT circular rebuild (above);
   take A stays parked.
3. **Closed at R147: the sub-20 Hz swell** is filtered out of the seven one-shots (above).
   feature_end is still 5.5 LU below feature_enter (-26.8 LUFS against -21.3): that is
   the stem's own level now, not the swell.
4. **Closed at R147: the win ladder** rises monotonically (above). **Still OPEN ART:
   win_max** sounds for 1.81 s (the master is 2.34 s) against the truth map's 5.0 s spec and
   the 2.6 s max-win reveal. It is not padded and not recomposed. A longer stem from the
   owner closes it.

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
covered by open question 1 above. Since R149 `bgm_loop.{webm,mp3}` is neither: it is a ChatGPT
circular rebuild the owner supplied, and its licence is open (the R149 section above).

## Legacy files

NONE, as of 2026-08-09. This section used to say that scatter.mp3 and win.mp3 were
unreferenced leftovers from an earlier sound-tier refactor, "left in place rather than
removed as out of scope for this pass". They were removed from THIS directory some time
ago, and the paragraph was never updated.

It kept resolving only because copies survived in the ROOT frontend/public/assets/sounds/
tree, which was a full duplicate nothing could reach: audio paths are built under the theme
base in `frontend/src/lib/stores/themeStore.ts`. That root tree was deleted on 2026-08-09,
1,955,845 bytes across 14 files, which is what finally made this claim fail out loud.
