R147: OVERNIGHT CLOSE + FULL ESTATE AUDIT.
Review lane. Unattended. High effort. Use sub-agents freely.
Save this brief verbatim first. Fingerprint the tree before any file
operation. Owner preview on 5173 is UNTOUCHED. Use another port.

THE FENCE
No maths package edits.
No HUD geometry / HUD_SPEC bone moves.
No new image generation and no API image calls.
No kit packaging.
Do not commit WAV masters, MANIFEST.txt, or .scratch art.
Do not weaken asset_guard.
Do not invent audio. You may filter, trim, wrap, or re-encode
files already on disk. You may not compose new music.
Do not delete unmerged branches. Merged-session-branch cleanup
is allowed only after you list them and prove each is an ancestor
of origin/main.

OWNER RULINGS ALREADY MADE (do not reopen)
- R145 H2/M3: ruling B, accepted as ingested.
- Path 1 freeze (hero rest = scene_character.png) is NOT this session
  unless a one-line mount already exists and is proven safe.
- Pre-loader silence fix 0d060d9f / equivalent on the R146 branch:
  KEEP. Do not revert it.
- ui_click.mp3 stays the shipped file.

============================================================
PHASE 0 — LAND R146 BEFORE ANYTHING ELSE
============================================================
1. git fetch origin.
2. Identify PR #182 / claude/r146-wav-intake.
3. If open and CI green: merge by repo convention, checkout main, pull.
4. If red: STOP, report, do not start Phase 1.
5. Confirm on main after merge:
   - feature_enter, feature_end, retrigger, win_max resolve to real
     mp3 (and beds to webm+mp3)
   - AVAILABLE_PENDING_CUES no longer lists those four as missing
   - mute still kills anticipation_build
   - dist has zero wavs
6. Record merge SHA. All later work branches from that main.

============================================================
PHASE 1 — AUDIO GAPS THAT ARE ALREADY NAMED
Do these in order. Each is its own commit if it changes bytes or
behaviour.
============================================================

A. Take A seam (bgm_loop)
   Measured: 12 ms digital silence at head, seam RMS ~18.6 dB
   against a 2.0 dB gate. Recurs every 10.9 s.
   Allowed fix, in this order, stop at first pass:
     1. Wrap the on-disk bgm_loop.wav with the same 40 ms
        equal-power fold used on bgm_tension / anticipation_build.
        Downbeat must remain sample 0 after the fold. Re-encode
        only bgm_loop.webm + bgm_loop.mp3.
     2. If a wrap cannot be proven inside 2.0 dB without
        inventing audio, REVERT take A (git revert 750259c9 or
        restore bgm_loop.{wav,mp3,webm} from the pre-take-A
        commit on this branch) and record OWNER CHOICE:
        "scratchy-but-seamless bed restored; take A parked".
   Do not ship a bed that fails audio_verify loopSeamsWithinTolerance
   unless you have already tried (1) and recorded why it failed.
   Re-run audio_verify.mjs. Beds other than bgm_loop must still pass.

B. Sub-20 Hz rumble on one-shots
   Seven one-shots carry inaudible sub-20 Hz energy; feature_end
   lands ~7 LU quieter than a clean version.
   High-pass the affected WAV masters at 20–30 Hz (or the
   pipeline's existing rumble filter if one exists), peak-norm
   back to -3 dBFS, re-encode only those mp3s.
   Prove feature_end integrated loudness moves toward the rest
   of the feature pair. Do not remix musically.

C. Win-ladder loudness
   win_big is ~12 LU louder than win_epic. That inverts the tier.
   Do not compose new stingers. After pipeline peak-norm, apply
   a gain ladder so that after encode, integrated loudness
   rises at least 1 LU each step:
     win_small < win_medium < win_big < win_epic < win_max
   If win_max source is only 1.78 s against a 5.0 s celebration,
   do NOT pad with silence and do NOT invent a 5 s composition.
   Record the duration miss as OPEN ART. Wire what exists.
   Bought-max-win still playing win_epic: if that is one call
   site and the fence allows soundService/themeStore only, fix
   it. If it requires App.svelte / buy-path behaviour change,
   implement it — this brief explicitly authorises that one
   call-site change. Prove a bought 5000x plays win_max.



============================================================
PHASE 2 — FULL REPOSITORY AUDIT (read-mostly)
Fingerprint the tree at the start of this phase. Re-check at
the end. The audit must not mutate tracked files except the
report it writes.
============================================================

Produce reports/audit/R147_ESTATE_AUDIT.md with these sections,
every claim first-hand, file:line, SHA, or measured number.

2.1 Git estate
   - main SHA, arc2-baseline target
   - open PRs
   - merged session branches still on origin (name, merge commit,
     safe to delete y/n)
   - stale local branches
   After the list exists: delete ONLY origin branches that are
   already merged to main AND have no open PR. Log each deletion.
   Leave anything unmerged.

2.2 Submission / Stake Engine readiness
   Walk the 51-item reviewer list as a studio checklist, not as
   ticks you invent. Record 0-of-51 as the correct public state.
   For each of assets / animations / sound, state what changed
   since the 4.3/9 review and what a reviewer would still tag.
   Confirm frontend dist vs 25 MB cap.
   Confirm no wav in dist.
   Confirm locked maths untouched since last known SHA.

2.3 Audio runtime truth
   Re-derive from soundService.ts + the live sounds folder:
   cue name, file present, format, duration, LUFS if cheap,
   mute behaviour, duck dB, pending vs live.
   Mark take-A seam result after Phase 1.
   List remaining silent or wrong-tier moments.

2.4 Visual / animation truth
   - Which REPLACE rows are live vs still HEAD-old
   - Hero: which sheet mounts at rest (HeroIdle vs scene_character)
   - Idle float / win unfold / feature brace still wired?
   - Overdrive perimeter: present or removed
   - HUD tokens vs paytable / FEATURES neighbours
   - Banner geometry vs any leftover 1920 rails
   - Known open art: SC-03, homeless win overlays, Features
     glyph if still a bolt, gauge hub offset
   Do not swap rasters in this phase.

2.5 Tooling / gates
   List gates that are green, gates that fail for a known
   accepted reason (take A seam if unrestored), and gates that
   assert stale facts.
   Named historical bugs to confirm still open or closed:
   ALPHA_SNAP_FLOOR float compare, ingest jpeg quality on
   opaque full-size rows, --compare-against-shipped missing,
   npm run assets guard, master.py overwrite guard from R146.
   Fix ONLY: stale assertions that are now false because R146
   shipped, and any gate that would go red on main for a reason
   you just introduced.

2.6 Docs drift
   Find live instructions (not dated records) that still say
   the four cues are silent, audio is Stable Audio only,
   OpenAI is BARRED, hero must not use external art, or
   Spine law is the old ban. Correct live instructions.
   Do not rewrite history files.

2.7 Security / hygiene
   Secret scan. Large binaries that should be gitignored.
   Output/imagegen still ignored. No API keys in tree.

============================================================
PHASE 3 — SMALL FIXES THAT FALL OUT OF THE AUDIT
Only if cheap, proven, and inside the fence.
============================================================
Allowed:
- Doc corrections from 2.6
- Gate comment / fixture updates from 2.5
- The bought-max-win call site from 1.C
- Merged-branch deletion from 2.1
- Restore command recorded for every byte change

Not allowed without a new owner line:
- New hero sheets
- New beds
- Layout redesign
- Enabling Spine
- Packaging a portal kit

============================================================
PHASE 4 — SELF AUDIT BEFORE YOU PUSH
============================================================
Adversarial pass over your own diff.
Every number in the report re-derived, not copied from an agent.
Confirm:
  - 5173 never bound by you
  - zero wavs staged
  - zero rasters staged unless a Phase-1 encode replaced an
    already-tracked mp3/webm
  - fingerprint of non-audio WIP rasters unchanged
  - CI static + browser matrix green on the final tree
  - PR opened, review lane, not self-merged unless this repo's
    rule for records-only says otherwise. Audio/code changes
    stay on a PR.

Close report: reports/SESSION_REPORT.md append + dated archive
reports/archive/2026-09-25_r147-overnight-audit.md

OWNER WAITING LIST (end of report, numbered)
Anything you could not fix, with the exact next action and
whether it needs new art, new audio, or an owner ruling.
Expected candidates if still true:
  1. Take A vs scratchy bed
  3. win_max duration
  4. Path 1 hero rest freeze
  5. Pre-loader resume wipe (escalated in R146)
  6. Kit rebuild / portal upload

 ===.  Utilize workflows as much as possible.
