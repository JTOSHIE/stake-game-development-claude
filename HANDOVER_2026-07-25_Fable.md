> **SUPERSEDED 2026-07-25c.** Start at `HANDOVER_2026-07-25c_Fable.md`, which is the
> current living arc handover and is written as a boot document. This file is retained
> as the prior arc's record; it is history, not orientation.

# Handover to Fable — Future Spinner status update (2026-07-25)

**From:** the working session (Claude Sonnet 5). **To:** Fable (has main-repo access).
**Purpose:** new arc document per standing convention (j) - supersedes
`reports/archive/handovers/HANDOVER_2026-07-07_Fable.md` (which now carries a pointer note to here). This arc covers
the identity canonicalisation and HUD lock work, and Owner Audit rounds 1 through 3, all
now merged to `main`.

Australian English throughout; no em or en dashes anywhere.

---

## Current verified state

- **Five modes live at 96.3500% RTP, independently re-verified.** Normal, Cruise,
  OVERBOOST, Buy Overdrive, and NITRO OVERDRIVE (the 400x Super Buy) - all stateless,
  5,000x hard cap every mode, in the locked `games/future_spinner/**` package.
- **Audio shipped and mixed.** AudioForge v1 delivered spin/reel-stop/win/bed-swap
  coverage with loop-conditioned seams; `frontend/scripts/audio_verify.mjs` confirms the
  wiring end to end (spin/reel-stop/win-on-real-spin all fire, zero request failures, zero
  console errors) - one open item on the seam-decode check itself, see "Outstanding" below.
- **Portrait and landscape layouts locked to `docs/HUD_SPEC.md`.** The desktop HUD banner
  was re-measured this arc to a machine-enforced coordinate spec
  (`frontend/scripts/hud_banner_spec_check.mjs`, ~50 assertions, 0px deviation from spec);
  portrait/compact-landscape each have their own native-scale composition, decoupled from
  the stage transform.
- **Feature presentation flow complete.** CLICK TO CONTINUE gates every trigger (no
  auto-advance, no spoiler leak - `spoiler_bug_check.mjs`), the bonus-feature grid renders
  at exact base-game size on every profile (`hud_reel_size_check.mjs`, sub-pixel match),
  the Overdrive meter/retrigger/end-celebration sequence is stable.
- **Identity locked to the hero emblem, with derived icons.** The `vector_mark` v2/v3
  track is retired and archived (`design-system/brand/archive/vector_mark/`, with
  `SUPERSEDED.md`); the sole mark going forward is `design-system/brand/hero_emblem/`,
  with a deterministic derived icon ladder (`design-system/brand/hero_icon/`, 192/96/48/32)
  now wired into the in-game LoadingScreen. `WRS_MASTER_DOCUMENT.md`'s brand rows point at
  `hero_emblem/master_512.png` as the provider upload file - flagged there as flat-RGB, not
  alpha-transparent, needing either a re-export or an owner waiver before submission.
- **Trademark gate closed.** AU exact-phrase register search log recorded
  (`docs/records/trademark/2026-07-18/au/`), variant scan run and clean.
- **Owner Audit rounds 1 through 3 all merged to `main`** (PRs #86, #87, #88). Round 3's
  full conformance sweep also found and fixed a systemic test-harness drift problem (six
  scripts had independently fallen out of sync with overlay handling added across earlier
  arcs) - see `reports/SESSION_REPORT.md` for the complete root-cause table.

All conventions referenced above are as pinned in `CLAUDE.md` (locked files, the
lock-exception mechanism, integer-micros rule, session reporting, explicit-path commits)
and `CLAUDE_PROJECT_INSTRUCTIONS_v6.md` - both still current, neither touched this arc.

---

## The board, in order

1. **Owner full re-test on the new build.** Everything above is ready for a fresh
   owner pass against the current `main`.
2. **Round 4 touch-ups, plus final animation polish, if the re-test warrants.** Not
   pre-committed - scoped only if the owner's re-test surfaces something.
3. **Platform-delta and tool vetting session.** Confirm nothing in Stake's own tooling/
   platform has moved since the last check against live docs
   (`docs/stake-engine-live/`, `COMPLIANCE_WATCH.md`).
4. **External audit, in a fresh environment, carrying two named gates plus the
   reviewer-tag rubric:**
   - `qa_soak.mjs`'s full 24-cell locale x social x speedTier matrix must complete clean.
     This session's own environment ran 8/24 cells clean before its own time budget ran
     out (still actively progressing, not stalled) - full completion was never observed
     end to end this arc.
   - `portrait_layout_conformance.mjs`'s full run must complete clean. This session found
     and fixed the specific bug that was blocking it (`auditOverdriveMeterOnScreen()`
     hanging on a MaxWinCelebration wincap overlay left open by an earlier spin in the
     same audit sequence - fixed in `frontend/scripts/lib/dismissOverlays.mjs` and
     `portrait_layout_conformance.mjs`, verified at the specific failure point via a
     targeted smoke test against a real `?mockCategory=wincap` round) but the fix was
     **not** re-validated by running the script's full suite end to end this session -
     that full run is this gate.
   - Neither gate should be treated as satisfied by this session's partial/interrupted
     runs - both need a genuine clean pass in the external audit's own environment.
5. **Developer Testing Tool staging on the platform.**
6. **Portal one-timers and Tile Editor composition.**
7. **Dossier section 5 walk-through.**
8. **Submit.**

---

## Outstanding (carried from `reports/SESSION_REPORT.md`, not yet actioned)

- **Popout-viewport overflow, real product finding, not fixed.** `IntroSplash.svelte`'s
  Continue button can render fully outside the visible viewport at Stake's 400x225
  mini-player popout size - confirmed via a DOM-level click bypass being required to
  even unblock the *test harness*, let alone a real player. Requires a first-ever session
  opened directly in mini-player mode (an unlikely but not impossible sequence for a
  genuinely new player). Needs its own responsive pass.
- **Audio loop-seam decode gap, unconfirmed either way.** `audio_verify.mjs`'s seam-RMS
  gate fails to decode any of the three shipped bed tracks (`bgm_loop`/`bgm_tension`/
  `anticipation_build`, both formats, six failures, all identical
  `"Unable to decode audio data"`) via headless Chromium's `AudioContext`. A uniform
  failure across every file reads more like a headless-Chromium codec limitation in the
  sandboxed dev environment than six independently corrupted masters, but this has not
  been confirmed either way - needs a real (non-headless) browser re-check.
- **Five older audit scripts** (`layout_v1_audit.mjs`, `motion_v2_proof.mjs`,
  `reel_v3_proof.mjs`, `scene_proof.mjs`, `ux_v1_audit.mjs`) still carry a pre-shared-helper
  `dismissIntroIfPresent()` rather than the current `frontend/scripts/lib/dismissOverlays.mjs`
  - not part of the mandatory conformance gate, no evidence of breakage, worth a dedup pass
  if they're ever brought back into active rotation.

---

## Boot instructions for the next session

The next session may run in **either** the terminal or the desktop app's Code tab, against
this same repository folder, with **identical locks** either way (the `deny` rules in
`.claude/settings.json` are machine-enforced regardless of which surface starts the
session). Before acting, that session **must read**:

1. This document (`HANDOVER_2026-07-25_Fable.md`).
2. `reports/SESSION_REPORT.md` (the current, unarchived copy - it carries the full
   per-item root-cause table for rounds 1 through 3 and the FINAL MERGE riders).

Both are on `main` as of this handover. No open PRs, no local-only work anywhere in the
repository - see `reports/SESSION_REPORT.md`'s FINAL MERGE close-out section for the full
branch/PR/working-tree sweep this arc ends on.
