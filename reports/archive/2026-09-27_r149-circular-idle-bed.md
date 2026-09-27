# R149 archive (2026-09-27): the circular idle bed

Dated copy of the R149 section of `reports/SESSION_REPORT.md`, per convention (a).

# R149 - THE IDLE BED IS THE CHATGPT CIRCULAR REBUILD, AND IT IS ONE BAR PLAYED FOUR TIMES (2026-09-27)

Circular idle bed only, review lane. Brief saved verbatim at
`reports/briefs/FS_R149_CircularIdleBed_Prompt.md` per convention (f). Branch
`claude/r149-circular-idle-bed`. Ultracode on: one workflow, an adversarial self-audit of the
branch (5 lenses and 7 refutation agents, about 1.69M subagent tokens), and every figure it
touched re-derived first-hand.

## Preconditions

- **#184 was already merged** when the session began (owner's account, 2026-09-27T08:43:52Z,
  merge `02747cb2`), so the Web Audio idle bed is live on main. Nothing was merged here.
- **R148's remote CI, recorded here because R148's report promised it "in the paragraph that
  follows" and no such paragraph was written:** PR run 36305394483 (pull_request) on
  ed1998a72e0cf13e83ef2d799b2d653c44a44d83, 30 of 30 green; main run 36307118573 (push) on
  02747cb279e70a206e3e633b0a9d703f5d2314bf, 30 of 30 green. The second was confirmed green before
  this branch was pushed (rule 10). R147's section carries the same unkept promise.
- **The new master is exactly 523,636 frames at 48,000 Hz** (24-bit PCM, stereo), so the brief's
  stop line did not trigger. sha256 bdd217b7280b93e18aea0cf9fbda83a567777e9a09443e7d2bd58f4e5ab8dcea.
- **Masters live in the theme tree:** the R146 wrapper's SRC is the master module's OUT_DIR, the
  sounds directory, so the new master was copied over the gitignored bgm_loop WAV there (brief
  step 2). The previous master (sha256 77556d1dd4e0c072dd4fb4a0d3437998d29ef65ec7cdcd20f46976ed3dc1f387)
  is kept, gitignored, in the repository's `.scratch` under r149-previous-bgm-loop, beside the
  owner's zip and final pack (R148 verified the pack's copy by hash).
- **Session-start fingerprint (brief task 1):** clean tree on main; 2,724 tracked raster SHA-256s;
  the sounds directory and the three bgm_loop files hashed before any file operation. At close
  the 2,724 rasters are unchanged, and in the sounds directory only bgm_loop's WAV, webm and mp3 and
  the README differ.

## What changed

| Commit | Content |
|---|---|
| `92f95ed8` | the brief, verbatim |
| `4b11d40d` | **only the new samples**, as the brief says: bgm_loop.webm (208,164 to 206,698 B) and bgm_loop.mp3 (263,277 B either way, CBR, new bytes) |
| `c6cffdbb` | the provenance note (brief task 6): the sounds README's bgm_loop row, an R149 section, and a pointer from its Licence section |
| `9608b2d3` | records only: dated R149 notes in GAME_FACTS.md and SUBMISSION_DOSSIER.md, and ledger section 1E |
| the next commit | this report and its dated archive |

The encodes went through the R146 wrapper with the 500 ms fold skipped and no wrap invented. The
audit re-ran the wrapper from the master: the mp3 is byte-identical, and the webm is identical
packet for packet and in decoded PCM (only an 8-byte random Matroska track id differs). No code
changed: loopBed.ts, soundService.ts, bgm_tension, anticipation_build, every one-shot, every
raster, the maths, the HUD and the hero are blob-identical to main.

## What the measurement found beyond the brief

- **The supplier's three figures re-derive exactly:** 0.421 dB between the first and last 20 ms
  RMS, 37.85% of energy above 200 Hz, L/R correlation 0.776. The join step is 0.37x the loop's
  99.9th-percentile step.
- **The master is one bar played four times.** Its four bars (130,909 samples, 2.727 s each) are
  bit-identical at integer level, and so are cell_raw's; the original drop's four bars differ. The
  file is 4.00000 bars long, as the brief says, but its content repeats every 2.73 s. The bars
  were tiled rather than rendered through (cell_raw's own continuation out of the last frame steps
  about 10x less than the join), so the same splice recurs at every bar line. Both are the
  owner's ear to judge; nothing measured is an outlier.
- **There is no fold.** The master IS cell_raw's first 523,636 frames, sample for sample; cell_raw
  is those four bars plus a 48,000-frame (1.0 s) tail. My first README draft said "equal outside
  its first 1,920 samples (the supplier's 40 ms fold)": I had checked only the outside. Corrected
  before commit.
- **It is not a sample-aligned edit of the original drop** (NCC 0.18 at the best circular lag,
  chance level for audio with this spectrum; a correlation cannot rule out a re-render from the
  same material). It is darker: 37.85% of energy above 200 Hz against 74.78% for the original
  drop.
- **Decoders:** ffmpeg, Chromium and WebKit decode both encodes to exactly 523,636 frames (they trim
  the Opus pre-skip and the mp3 encoder delay); Firefox decodes the webm one frame short, 523,635,
  as it did the previous encode (pre-existing, measured first-hand). Current Chromium, WebKit and
  Firefox all pick the webm; the mp3 serves only a browser without WebM Opus or a failed decode.

## Evidence (final tree; dist built clean at the tip, commit c6cffdbb, 105 files, 18,708,369 B excluding build-info.json)

| Proof | Result |
|---|---|
| audio_verify (its own ephemeral port) | ALL CHECKS PASS; bgm_loop seam 0.501 dB webm, 0.450 dB mp3 (gate 2.0); run before the commits on the same encode bytes |
| Idle 25 s, no spin, dist served by this session's own server on port 4549, Chromium, default policy | verdict PASS: output = 0.5 x the decoded bed, residual 0.0 through both wraps, no lag jump, no silence over 2 ms |
| Same, user-gesture-required | PASS, residual 0.0 |
| Same, no-user-gesture-required | PASS, residual 0.0 |
| Calibration, same server and tap: a 144-sample gap planted at the wrap | verdict FAIL as required: -144 lag shift per wrap, two 144-sample silences |
| Seeded reds on a real clean recording, at a wrap | clean PASS; 1-sample insert FAIL; one-bar skip FAIL; -0.1 dB gain step FAIL |
| The decoded bed is the new master | matches an ffmpeg decode of the dist webm to -81.7 dB; NCC 0.9989 with the new master, 0.147 with the old |
| Idle means idle | 0 spin requests, 0 bed element plays, 0 page errors, one AudioContext, secure origin 127.0.0.1:4549 |
| dist | no WAV (pruneAudioMasters pruned 15 masters); 18,708,795 B with build-info.json, cap 26,214,400 B; the bed files shrink 1,466 B |
| Local CI, final tree 9608b2d3 | static job 82 of 83 green (npm ci skipped; CI runs it); browser matrix 28 of 28 green |

**Remote CI (rule 10):** a report commit cannot cite the CI run of its own push, and R147 and
R148 each promised a following paragraph that was never written. So the remote result for this
branch's final push is recorded, by full SHA, on the pull request, and the next session's report
carries it into this file under its preconditions, as this one did for R148.

**5173 was never bound.** audio_verify used an ephemeral port; the idle proof ran its own server
on 4549 and closed it; the audit's one reproduction used 4551.

## Two instrument failures, both caught before the record

1. **The analyser read a clean recording as dirty.** Under the default policy it reported a -26 dB
   residual that repeated every cycle, reproduced three times bit for bit, while the other two
   policies read 0.0. The bed was fine: the analyser's 0.5 s opening window matched the wrong one of
   four near-identical bars (the recording aligned to an ffmpeg decode at a lag of exactly three
   bars, 392,727 samples, at -81.7 dB), and the -26 dB was the codec's bar-to-bar difference. The
   alignment now uses one full loop cycle; R148's own recording still reads 0.0 under it (the
   control). The calibration had shown the symptom first (3-sample lag jitter, gain 0.458) and I did
   not stop on it. The audit then showed that the analyser had no verdict at all (a real one-bar
   skip reads at the same -26 dB), so it now fails closed on any residual, lag jump or silence,
   and checks the files against the run's own record.
2. **A batch loop proved nothing and exited 0.** zsh does not word-split an unquoted `$m`, so the
   script received "app ugr" as one argument, matched no mode and exited 0 with no output. It now
   refuses unknown arguments (seeded, exit 1), and each capture deletes its tag's old files first.

## The self-audit, and what it changed

Five lenses over the branch (fence and brief, every number, the proof instrument, stale claims,
what ships and CI), with a refutation agent on every blocker or major finding; none lost.

- **Fence: clean.** Exactly the brief's files changed; the brief is byte-identical to the pasted
  text; nothing WAV, MANIFEST or `.scratch` committed; no locked path; rasters unchanged.
- **Numbers, corrected before push:** the original drop's share above 200 Hz is 74.78%, not 74.68%
  (my first method counted its DC offset, -0.0057, twice; the new master reads 37.846% either way);
  the samples commit quoted the dirty build's byte count; "not an edit" was stronger than NCC can
  show; the frame claim needed its decoder. The two unpushed commit messages were rewritten, trees
  unchanged.
- **Stale claims, confirmed by refutation:** GAME_FACTS.md and SUBMISSION_DOSSIER.md stated the
  original drop and its 1.50 / 1.47 dB seams as current. Dated R149 notes added (commit
  `9608b2d3`), with ledger 1E. The documents that state a licence or provenance posture are left
  for the owner (waiting list item 3).
- **A pre-existing defect, confirmed major and outside the fence:** stopping any Vite dev server
  re-runs a build-only plugin hook and restamps `frontend/dist/build-info.json`, so the stamp can
  name a commit the bundle was not built from, and dist hygiene's stamp check then passes over a
  stale bundle. It is why I first wrote that "audio_verify rebuilt dist": dist was built by
  `npm run build` at 08:47Z, and audio_verify's dev server shutdown at 08:51Z restamped it. For this
  session's evidence, dist was rebuilt clean at the tip. Raised as its own task for a review-lane PR.

## Restore

- Samples: `git revert 4b11d40d`, then copy the previous master (sha256 77556d1d..., in `.scratch`
  under r149-previous-bgm-loop, the owner's zip and the final pack) back over the gitignored
  bgm_loop WAV and check its hash. Provenance: `git revert c6cffdbb`. Records: `git revert
  9608b2d3`. Once merged: revert the merge. R147's audit row for bgm_loop (`git revert e94b1faa`)
  no longer applies cleanly after this change.

## Branch hygiene (ruling (t.1) rule 2)

Two merged session heads were still on the remote and were deleted, each first proven an ancestor
of main with no unique commit, its PR merged, its PR head equal to its tip and its merge commit on
main: `claude/r147-overnight-audit` (tip af156ccf072c879987ca36575229c0394c45683b, PR #183, merge
cff0e577) and `claude/r148-loop-join-bed-resume` (tip ed1998a72e0cf13e83ef2d799b2d653c44a44d83,
PR #184, merge 02747cb2). Either returns with `git push origin <tip>:refs/heads/<name>`.

**Owner preview NOT refreshed:** the brief keeps 5173 untouched and nothing landed on main.

## OWNER WAITING LIST

1. **Ear-check the new bed** (the brief: the ear-check is the owner's). It is one 2.727 s bar
   repeated, with the same splice at every bar line, and darker than the original drop. Listen over
   a long idle and on a phone speaker. If the file's first 15 ms (Opus priming, measurably less
   faithful than the bar lines) is audible at the wrap, a circular-primed encode would remove it.
   *Owner.*
2. **Licence and source of the ChatGPT rebuild, and what it is** (generated audio or an edit made in
   ChatGPT). The recorded OpenAI clearance (Ticket 456254, `provider_gate.json`) covers image
   generation for development-stage artwork, not audio, and says not to broaden it; no gate reads
   audio provenance. *Owner / Fable.*
3. **The provenance-posture sweep, on the owner's word for item 2.** These now read as if every
   shipped sound but ui_click were the owner's stems, or as if all shipped work were original:
   CLAUDE.md's R147 audio NOTE; the root README's licence sentence and LICENSE (legal text, the
   owner's); WRS_MASTER_DOCUMENT's audio provenance row; AUDIO_TRUTH_MAP's summary; RESKIN_BOUNDARY;
   QUALITY_CHARTER's audio row; FULL_AUDIT_METHOD's audio note; COMPLIANCE_WATCH's original-IP
   block; frame clause (l) (seeded, re-runnable generation). Left as written because each states a
   posture only the owner can set. *Owner, then a records pass.*
4. **The draft blurb's "A driving synthwave soundtrack"** (SUBMISSION_DOSSIER and the blurb record)
   now describes a different, darker bed. *Owner, with item 1.*
5. **A stale comment the fence kept me out of:** loopBed.ts line 8 says the bed's seam "is 1.50 dB"
   (the original drop's; this bed is 0.50 dB) and that decodeAudioData returns exactly 523,636 frames
   (true in Chromium and WebKit, not Firefox). *Code, the next brief that opens loopBed.ts.*
6. **Firefox decodes bgm_loop.webm one frame short** (523,635), before and after R149, so its wrap
   drops one sample. *Code, a later loop-bed pass (prefer the mp3 there, after measuring).*
7. **The Vite build-info restamp** (the self-audit, above): raised as its own task. *Code.*
8. **Carried from R148:** the A/B/C ruling, the iOS device check (silent switch, lock, a call), the
   tension bed and riser still looping as elements, R147 D2/D4/D5, the pack provenance statement,
   and the splash's keyboard focus. *As recorded in R148.*
9. **Take A** stays parked in Downloads. *Owner.*

## FOR THE NEXT SESSION

**Model and effort:** Opus 5.5, ultracode. One workflow, the self-audit (12 agents, about 1.69M
subagent tokens, 445 tool calls, 19 minutes). **Plan of record:** the brief's numbered tasks were
the plan; none needed a design choice.

**Approach:** preconditions and fingerprints; copy the master; encode through the wrapper; verify
the encodes; audio_verify; the idle proof on a real port; commit the samples alone, then the
provenance; the self-audit; act on it (numbers, wording, records, the verdict); rebuild at the tip;
re-run the proofs; both local suites; push; PR.

**Alternatives rejected:** a one-bar encode (a quarter of the size and identical under Web Audio,
but the brief fixes the master, and the element fallback would then stall every 2.7 s); explaining
the default-policy residual away instead of finding the alignment fault; quoting an envelope
correlation (0.17 to 0.61 depending on the window); editing the posture documents before the owner
says what the rebuild is.

**Files:** bgm_loop.webm and bgm_loop.mp3, the sounds README, GAME_FACTS.md, SUBMISSION_DOSSIER.md,
the ledger, the brief, and this report with its dated archive.

**Lessons worth keeping:** align on the whole period of a signal that repeats inside it, or a clean
recording reads dirty; a calibration with odd jitter is the instrument speaking first; an analyser
that prints numbers is not a verdict until it can exit red; zsh does not word-split an unquoted
variable, and a script that ignores unknown arguments exits 0 on nothing; "equal outside X" says
nothing about the inside; a DC offset counts twice in an unweighted rfft power sum; and stopping a
Vite dev server can restamp dist, so rebuild at the tip before citing build-info.json.
