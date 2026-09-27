# R147 - R146 LANDED, TAKE A PARKED, THE RUMBLE FILTERED, THE WINS LADDERED, AND THE ESTATE AUDITED (2026-09-26)

Overnight close and full estate audit, review lane, unattended. Brief saved verbatim at
`reports/briefs/FS_R147_OvernightCloseEstateAudit_Prompt.md` per convention (f), including the
owner's trailing line "Utilize workflows as much as possible." Branch `claude/r147-overnight-audit`.
The full audit is its own file, `reports/audit/R147_ESTATE_AUDIT.md`; this section is the session.

**Session-start fingerprint** (before any file operation): clean tree, 465 tracked raster
SHA-256s, the 19 shipped sound files and the 15 gitignored WAV masters hashed.

## Phase 0: R146 landed

- PR #182 was open with 30 of 30 checks green. **Merged as
  `0dd8105c0b93740cb45028bab24f7ccddc6bec60`** (a GitHub merge commit, the repository's shape),
  2026-09-25T17:38:19Z. **Main CI after the merge: run 36168381090, push,
  30 of 30 green.**
- Confirmed on main: `feature_enter`, `feature_end`, `retrigger` and `win_max` resolve to real mp3
  blobs and the three beds to webm plus mp3; `AVAILABLE_PENDING_CUES` (`soundService.ts:530`) lists
  all four; mute still stops `anticipation_build` (`setMuted`, `soundService.ts:219`); dist carries
  0 WAV. All later work branched from that main.

## Phase 1: the three named audio gaps

### A. Take A's seam: the fold was tried first, then take A was parked (`e94b1faa`)

Take A (44.1 kHz, 481,091 frames, exactly 4 bars at 88 BPM) opens on 528 zero frames. The brief's
order was to fold it first and revert only if that could not pass without inventing audio:

| Variant | Length | Seam | Wrap step against the loop's 99.9th-percentile step |
|---|---|---|---|
| as delivered | 4.0000 bars | 18.67 dB | 1.1x |
| F1: 40 ms equal-power fold, tail removed | 3.9853 bars | 0.90 dB | 0.2x |
| F2: fold, 4 bars kept | 4.0000 bars | 1.22 dB | **3.2x** (a jump back in the music every wrap) |

(Against the single largest in-loop step F2's wrap is 0.92x; the self-audit caught that the
recorded ratio was taken against the 99.9th percentile, and the records now say so.) The other
beds keep 4 bars because their fold used audio rendered past the loop end; take A has none. F1
breaks the owner's 4-bar lock, F2 replays the last 40 ms at every wrap, and filling the gap from another
bar would compose a bar-1 opening the take never had. **So the original drop's `bgm_loop` is back,
and the OWNER CHOICE is recorded: "scratchy-but-seamless bed restored; take A parked".** Its master
(sha256 `77556d1d...`) is back beside the encodes; re-encoding it reproduces the pre-take-A files
byte for byte (mp3) and packet for packet (webm), and those committed blobs from 0d060d9f are what
shipped. Take A is untouched in `~/Downloads/bgm_loop-take-A/`.

**audio_verify.mjs: ALL CHECKS PASS** (2026-09-25T17:56:10Z, its own ephemeral port 57646), all
eight checks including `loopSeamsWithinTolerance`: bgm_loop 1.50 / 1.47 dB, bgm_tension 1.30 /
1.21, anticipation_build 1.79 / 1.76 (webm / mp3) against 2.0 dB.

### B. The sub-20 Hz swell (`cb7abc9a`)

A causal 4th-order Butterworth high-pass at 30 Hz, declared in
`tools/audio_forge/r146_master_owner_stems.py`, now runs on the seven affected one-shots before
master.py's own silence trim and -3 dBFS peak normalisation. Zero-phase was tried first and
rejected: its pre-ringing started `feature_end` and `win_small` on steps of 0.62 and 0.39, a click
at every onset. Energy below 20 Hz fell from 54.8 to 99.3% to 1.9% or less. **The proof the brief
asked for: `feature_end` -31.9 to -26.8 LUFS, `feature_enter` -20.8 to -21.3, so the pair's gap
closes from 11.1 to 5.5 LU.** Only those seven mp3s changed; the WAV masters did not.

### C. The win ladder (`e8cbc37a`) and the bought max win (`b721febb`)

- **Ladder: attenuation only, walking down from `win_max`** (already at the -3 dBFS ceiling, so
  raising anything would need a limiter). Each tier sits 1.75 LU below the next before encode, the
  smallest of the margins tried (1.25, 1.75, 2.0) that clears 1 LU after encode on both meters;
  the self-audit later found 1.6 also clears it (about 0.15 LU a step less attenuation), recorded
  as an owner option. Encoded, win_small measured as one padded 400 ms block on both meters:
  pyloudnorm -31.7, -29.9, -28.2, -26.5, -24.7 LUFS; ebur128 -31.7, -29.9, -28.2, -25.9, -24.7. `win_big` came
  down 16.2 dB. **`win_max`'s 1.81 s against the 5.0 s spec is OPEN ART**: not padded, not composed.
- **Bought max win: the one call-site change the brief authorised.** `handleBuy` now calls
  `playMaxWin()` as `MaxWinCelebration` appears and skips its closing `playWin()` for a capped
  round, as `handleSpin` does. Proved on the pinned bonus-mode wincap fixture bought through the
  FEATURES menu, every `play()` recorded: control, celebration at +431 ms and silent, `win_epic` at
  +16,470 ms after the feature; fix, **`win_max` RESOLVED at +479 ms**, no `win_epic`; a non-capped
  buy unchanged (`win_epic` and echo at +19,652 / +20,453 ms). Zero page errors.

## Phase 2: the estate audit

One read-only workflow: eight section auditors (2.4 split in two), an adversarial verifier after
each, a completeness critic. 17 agents, 0 lost; 139 claims confirmed, 28 corrected; 11
contradictions between sections, all resolved in the report. **Then every figure was re-derived by
this session** (git, ffprobe and ebur128, pyloudnorm, PIL, Playwright), each agent instrument read
and re-run with its control. The Phase 2 fingerprint held: 465 of 465 rasters, one index row
changed (this session's own README record `1c335cdd`, made while the auditors ran), 0 porcelain
lines. Declared: `doc_currency_gate.mjs` fetches, so its runs wrote hidden prefetch refs and
FETCH_HEAD.

**What it found that matters most** (details and evidence in the audit file):
1. **The first-gesture warm-up stops the base music bed for the whole session** when the first
   gesture is a key press, or the bed is already playing, or its file is late: `warmUpAudio()`
   plays and pauses every element in `sounds`, `bgm` included. Proved in real Chromium with the
   real autoplay policy against a control that skips the warm-up. Pre-existing, not R146's.
2. `bgm_tension` stays ducked to 40% for a whole feature that starts within 1.8 s of the spin cue
   (proved, 0.2 against a 0.5 slider); mute across a feature boundary leaves the wrong bed after
   unmute; the spin duck's timer lifts the bed mid-riser (both by code reading).
3. **At the default sliders every win tier, `win_max` included, plays under the unducked music bed**
   (`win_max` by 2.6 LU; spin.mp3 sits 10.2 LU above it). **R147's own ladder deepened this**,
   because it could only attenuate. A listening ruling for the owner.
4. Path 1's one-line mount exists (`heroMode="static"` at `App.svelte:2270`) and is **not** safe:
   it unmounts HeroIdle (win unfold and brace) and moves the rest pose (IoU 0.95647, calibrated
   against R122's 0.993). Not done, per the ruling.
5. The gauge hub item closes: the needle's hub is within 0.2 px of its pivot and covers the face's
   off-centre printed hub at every angle.
6. `npm run assets` on a clean tree would rewrite 18 tracked non-generator rasters before a later
   guard refuses with "Nothing has been written."; ALPHA_SNAP_FLOOR, the fixed JPEG quality and
   `--compare-against-shipped` are still open; master.py's guard is disarmed in a clone.
7. The repository-root `env/` Python (3.14.6, numpy 2.2.5) silently overwrites named arrays; the
   two venvs the pipelines use are clean, so no R146 or R147 encode is affected.
8. No secret anywhere (15 patterns, each proven on a control); `uploads/.env` is still tracked
   (S2-C142, empty values).

## Phase 3: fixes that fell out of the audit

- **50 merged session heads deleted from origin** (`claude/r086-...` to `claude/r146-...`), each
  proven first: an ancestor of main, 0 unique commits, one MERGED PR whose merge commit on main has
  the tip as its second parent, `refs/pull/N/head` equal to the tip, no open PR. Deleted at
  2026-09-25T18:55:21Z; all 50 re-read as gone with their pull refs intact. The per-row log and
  restore command are in the audit's 2.1. **Left:** the six keep-list heads, the two merged
  2026-08-15 heads (not session heads; the owner's call since R071) and `controlrow/2026-08-15`
  (unmerged). Nothing local was deleted; two old stashes stay.
- **Live documents corrected** (2.6's five patterns plus what R147's own commits made false), with
  dated records kept and append-only files appended: GAME_FACTS, SUBMISSION_DOSSIER,
  COMPLIANCE_WATCH, README, WRS_MASTER_DOCUMENT (row and change log), AUDIO_TRUTH_MAP,
  SPINE_ROBOT_RIG_SETUP, REVIEW_TRACKER, the sounds README, the OUTSTANDING_LEDGER (new 1C),
  `generate.py`'s docstring and two code comments; and **CLAUDE.md's BRANCHES paragraph**, which
  claimed six heads when there were 59.
- **Not changed, with reasons:** the four audio defects, the colour divergences and the stale hero
  comments are outside Phase 3's allowed list; the stale committed replay evidence was not
  regenerated because the proof rewrites six committed PNGs, and no raster may be staged.

## Phase 4: self-audit

**Adversarial pass over the whole diff and the report** (one workflow, five lenses: documents,
code, audio artefacts, the report's figures, fence and brief; a skeptic re-derived every finding;
10 agents, 0 lost). **22 findings, 18 confirmed, 4 refuted, all minor**: none touched the fence,
shipped behaviour or a gate, and the code lens confirmed every path through the new buy-path
branch. Fixed before the push, each re-derived first:
- **I had rewritten R103's dated Spine amendment in place**, against "do not rewrite history
  files". It is restored verbatim, with a dated R147 note above it.
- The audio records overstated two things. Take A's F2 wrap step is 3.2x the loop's 99.9th-percentile
  step, not its largest (0.92x of that). And "ebur128 cannot meter win_small" is only true
  unpadded: given the same 400 ms block it reads -31.7, so the both-meter claim now has its
  evidence. 1.75 LU was the smallest margin tried, not the true minimum (1.6 also clears).
- The truth map's section 4.4 said the buy cue fires before a 2.6 s dwell (it has none), and
  three cells in rows I edited kept R146 figures; the win-tier and BGM line citations (stale since
  before R147) are corrected.
- A dated NOTE under CLAUDE.md's Assets preamble now states what the audio actually is, without
  amending the rule; the wrapper's docstring lists R147's two deviations; the report gained a
  restore row for every byte change, the homeless-art reconciliation, the true 6-of-56 figure for
  rule (t.1) 2, the corrected ALPHA_SNAP_FLOOR cause (a strict `<` in float32, so `<=` fixes it),
  two capture citations and the D5 qualifier.

**Fence, checked on the whole diff `0dd8105c..HEAD`:** 28 files; 0 WAV, MANIFEST or .scratch; 0
rasters; 0 locked paths (`locked_paths_gate` PASS); `asset_guard.py` unchanged; no maths, HUD
geometry, image generation or kit. The session-start raster fingerprint: 465 of 465 unchanged.
**5173 was never bound**: the session's server was 5174, audio_verify used 57646, and the probes
routed requests without binding a port.

**Both suites run locally on the final code before the push:**
- **Static job: 82 of 83 run steps green, 0 failed**, on `9804c1e7`; `npm ci` skipped locally (it
  deletes `node_modules` under a running server; CI runs it). Its build: 106 files, 18,705,465 B,
  0 WAV, dist hygiene PASS; svelte-check 0 errors, 3 warnings; stake mark 75 shipped assets.
- **Browser matrix: 28 of 28 green** against that build.
- The commits after `9804c1e7` change documents, comments and a tool's docstring only; the
  document currency, dash and machine-tell gates were re-run on them (PASS, 0 new findings), and
  the static job is re-run on the final committed tree (recorded after the push, below).

**Remote CI (rule 10):** recorded by full SHA in the paragraph that follows, after the push.

**Owner preview NOT refreshed**, although Phase 0 landed PR #182 on main: the brief keeps 5173
untouched, and the brief governs (convention (n)). The checkout is left on
`claude/r147-overnight-audit`.

## Restore commands for every byte change

- Take A back: `git revert e94b1faa`, then copy `~/Downloads/bgm_loop-take-A/bgm_loop.wav` over
  the gitignored master.
- The seven R146 one-shot encodes (no high-pass):
  `git restore --source=0dd8105c -- frontend/public/assets/themes/future-spinner/sounds/{feature_end,feature_enter,retrigger,win_small,win_medium,win_epic,win_max}.mp3`
- Keep the high-pass, drop the ladder:
  `git restore --source=cb7abc9a -- frontend/public/assets/themes/future-spinner/sounds/{win_small,win_medium,win_big,win_epic}.mp3`
- The bought max win back to win_epic: `git revert b721febb`.
- The document corrections: `git revert 9804c1e7 31bf9d08` (the Phase 3 docs and the Phase 4 fixes).
- Any deleted branch: `git push origin <tip>:refs/heads/<name>` from the audit's 2.1 log.
- Everything, once merged: `git revert -m 1 <the R147 merge sha>`.

## OWNER WAITING LIST

Each item: the exact next action, and what it needs (new art, new audio, an owner ruling, or a
code change on a review-lane PR).

1. **Take A against the scratchy bed. DECIDED this session as the brief ordered: the original drop
   ships, take A is parked.** To bring take A back: a re-export rendered with a wrapped 40 ms tail,
   as the other beds were. *New audio (owner re-export).*
2. **Listening ruling on heard levels** (audit 2.3 D5): every win tier under the unducked bed at
   default sliders, deepened by R147's ladder. Raise the BASE win gains, lower `MUSIC_DEFAULT`,
   build the specified win_max duck, or take the ladder margin down to 1.6 LU. *Owner ruling, then
   code.*
3. **`win_max` duration**: 1.81 s against 5.0 s and the 2.6 s reveal. A longer stem from the owner.
   *New audio.*
4. **Path 1 hero rest freeze**: the one-line mount exists and is not safe (drops the unfold and the
   brace; IoU 0.956). Rule between (a) the one line, accepting that loss, and (b) keeping the
   reactions, which means re-registering the strips against the R145 raster; then a browser proof
   on a non-5173 port. *Owner ruling; (b) is art pipeline work.*
5. **Pre-loader resume wipe, still true at HEAD**: `FreeSpinsPresentation.svelte:420` clears the
   TR-099 checkpoint unconditionally and the warm mount (`App.svelte:2117`) reaches it about 1.4 s
   after load. A surgical brief next to the money path. *Code, own brief.*
6. **Kit rebuild and portal upload**: no reskinned front upload is recorded; the portal last showed
   front v9. Build from a fresh clone and upload, then re-read the 51 and the version stamps.
   *Owner action.*
7. **The four audio runtime defects** (audit 2.3 D1 to D4): warm-up stops the bed, bgm_tension
   stuck ducked, wrong bed after unmute, riser duck lifted. Each is a code fix with a real-browser
   proof and a control. *Code, review lane; no new audio.*
8. **Licence and source of the fifteen owner stems: UNKNOWN.** Record them in the sounds README.
   *Owner.*
9. **Ownership and in-house wording the builder may not amend**: CLAUDE.md's Assets preamble (says
   audio is in-house), README's first Licence sentence and `LICENSE` lines 5 to 6, COMPLIANCE_WATCH's
   "Original IP: verified", the self-assessment's row 5 evidence, and whether the dossier's 9c
   register and the distinctness attestation are re-issued for the R137 and R145 art. *Owner
   ruling.*
10. **OpenAI ruling records still read BARRED** (the dated ruling record and PROVIDER_GATE_2026-08-22,
    which `provider_gate.json` points at): add a supersession pointer? *Fable ruling.*
11. **Branches**: delete `analysis/2026-08-15` and `track/standback-2026-08-15` (merged)? Keep or
    delete `controlrow/2026-08-15` (3 unmerged commits, PR #125 closed)? Prune the 52 stale local
    branches and the two 2026-07 stashes? *Owner OK in chat.*
12. **Open art rows and homeless art**: SC-03 `frame-2.png` (squashed 0.800 x 0.731; art at 640x468 or a call-site
    change), SY-13 `tile_plate.png` (needs a real alpha cutout), DOC-10 `feature_button.png` (R103-E5); and the homeless win and Overdrive art (ledger
    R097-F20; none of it is tracked beyond the eleven rasters the audit lists): build the surface or
    drop the art. *New art or ruling.*
13. **Visual divergences for an owner eye**: the WIN rail's pink glow on a cyan rail, the mini-player
    FEATURES trigger white in OVERBOOST, the paytable rail's gold glow, the FEATURES modal and win
    breakdown still in pre-R119 chrome, and the label typeface split. *Owner ruling, then a restyle
    PR with before and after proof.*
14. **Bet Replay parity**: a replayed feature never swaps to `bgm_tension`, and free-spin wins are
    silent everywhere. *Owner ruling; call sites only if reusing cues.*
15. **Tooling**: the `npm run assets` clean-tree residual (18 rasters), ALPHA_SNAP_FLOOR, the JPEG
    quality override, `--compare-against-shipped`, master.py's guard keyed on a tracked list, the
    typecheck warning ceiling (36 against 3), and the root `env/` numpy defect. *Code; the assets
    residual needs a ruling because the fence protects asset_guard.*
16. **Stale committed evidence**: regenerate `reports/screens/r043-replay-audio/` in an evidence
    job (`FS_WRITE_EVIDENCE=1 node scripts/r043_replay_audio_proof.mjs` after a build). *A session
    whose brief says it regenerates evidence.*
17. **Hygiene**: S2-C142 (`uploads/.env` tracked in a public repository; untrack it and ship an
    example), the `.env.*` ignore gaps, the tracked `frontend/.claude/settings.local.json`, about
    179 MB of legacy symbols and videos with no frontend consumer (one video is a pipeline source), a third-party studio's game recording in a public
    repository, and Dependabot disabled. *Owner ruling.*
18. **Submission records**: the attempt-1 build SHA is still unrecorded, and the 6-of-9 bar needs a
    fresh capture of the logged-in approval page. *Owner.*

## FOR THE NEXT SESSION

**Model and effort:** Opus 5.5, high effort, workflows as the owner asked: the estate audit (17
agents, about 3.4M subagent tokens) and the Phase 4 self-audit (10 agents, about 1.7M). **Plan of
record, stated late rather than claimed:** Phase 1 ran before a written plan; the audit's plan was
its workflow script.

**Approach:** land R146; fingerprint; each Phase 1 fix tried in the brief's order with a control
and measured on two meters; audit by workflow; then re-derive every figure in the report first-hand
rather than copying agent numbers; then fix only what Phase 3 allows; then an adversarial pass over
the whole diff; then both local suites, push, PR.

**Alternatives rejected:** shipping take A with F1 or F2 (breaks the lock, or replays 40 ms at every wrap); patching the
gap from another bar (invents audio); a zero-phase high-pass (onset clicks); a limiter to raise the
ladder's top (not allowed and changes the stems); regenerating the r043 evidence (restages six
PNGs); fixing the four audio defects or the colour divergences here (outside Phase 3's list);
deleting the 2026-08-15 heads (not session heads); dropping or pruning anything local.

**Files touched:** ten sound encodes (bgm_loop pair and eight one-shots; `ui_click.mp3` untouched),
`tools/audio_forge/r146_master_owner_stems.py`, `frontend/src/App.svelte` (the one call site),
comment-only lines in `soundService.ts` and `FreeSpinsPresentation.svelte`, `generate.py`'s
docstring, eleven documents including CLAUDE.md, the brief, the audit report, and this report with
its dated archive.

**Open threads:** the waiting list above. The warm-up defect (item 7) is the one a player meets
first, and it needs no new audio.
