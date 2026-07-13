# Session Report: hygiene pass - dead components, five stale-selector scripts, Collection Meter relocation, repo tidy-up

- **Date:** 2026-07-08
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/hygiene-pass` (off up-to-date `main`, in a dedicated worktree at
  `/Users/jt/math-sdk-hygiene`).
- **Source:** Fable's 2026-07-07 verdict, final item in the standing sequencing: the
  hygiene pass, expanded scope per his rulings on trace findings 2-8 - Collection Meter
  relocation, dead component removal, the five stale-selector scripts, HANDOVER
  supersession, prompt archive, explicit-paths CLAUDE.md line, QA log archive.

## What this delivers

### Dead component removal (ratified)
Deleted `FeatureButton.svelte` and `ControlBar.svelte` - confirmed via grep (zero live
imports, only historical comments) and a clean build afterward. `ControlBar.svelte`'s
duplicate `isAutoPlay.set(true)` call site (flagged by the Wiring Integrity Audit's
`check_autoplay_confirm_gate.mjs` as a dead-but-parsed stale-artefact risk) is now gone
entirely rather than merely flagged - the gate now reports exactly one call site instead
of one live + one dead.

### Five sibling scripts with the stale `.spin-btn` selector - all fixed and re-verified live
Each script was actually run against a live dev server after fixing, not just edited:
- **`build_diet_verify.mjs`** (fixed first, per Fable's priority): also found and fixed a
  second, unrelated bug while getting it running - its `vite preview` startup detection
  regex (`/Local:/`) never matched, because (unlike `vite dev`'s banner) `vite preview`'s
  banner has an ANSI reset code between "Local" and ":". Also hardened the preview port to
  request a free one dynamically (same fix `qa_soak.mjs` already has), since the hardcoded
  port collided with an unrelated pre-existing listener on this machine. **Now runs clean:
  zero 404s, zero pruned-path requests, zero console errors.**
- **`layout_v1_audit.mjs`**: fixed `.hud-panel .turbo-btn`-style descendant selectors (the
  real DOM has these as siblings of `.fs-panel`, not descendants) and the dead
  `[data-testid="feature-button"]` flow (replaced with FeatureMenu's menu-then-ACTIVATE
  flow). **Runs clean: ALL OCCLUSION CHECKS PASS** (position numbers now differ from the
  script's original LAYOUT_SPEC v3.1-era "expected" values, which is correct - the HUD has
  since moved to the B1 reskin; only occlusion is gated, not position deltas, so this is
  not a functional failure, just stale reference numbers a human would need to reinterpret).
- **`ux_v1_audit.mjs`**: same selector fixes, plus this script predates the intro splash
  entirely and had no dismissal logic at all (added the same `dismissIntroIfPresent` helper
  `layout_v1_audit.mjs` already has), plus two `:visible`-qualifier fixes for the
  free-spins-overlay/`.fs-end` persistent-hidden-warm-mount duplicates. **Runs clean: ALL
  CHECKS PASS**, including the full wincap splash -> collect -> presentation -> summary flow.
- **`reel_v3_proof.mjs`** and **`motion_v2_proof.mjs`**: same selector + FeatureMenu-flow
  fixes, plus seeded a high balance via the dev test-store hook so the 100x bonus buy at
  spin #10 stays affordable regardless of how the preceding 9 spins land. **Both run to
  completion** (avg fps 59.6 and 59.5 respectively, well above the 55 floor) but **both
  surface a real, new finding**: exactly one frame over 100ms in each run (149ms and 150ms,
  out of 2,272 and 1,936 samples), landing at almost the same magnitude in both scripts -
  consistent with a single, likely-transient hitch at the bonus-buy transaction moment
  rather than two unrelated regressions. Not chased further in this pass (would need
  profiling, out of scope for "fix the stale selectors") - flagged for Fable/owner
  attention below.

### Collection Meter relocated (ratified)
`games/future_spinner_collect/` moved off `main` to `claude/collect-prototype` (branch
created from this session's starting commit, pushed, confirmed to hold the full directory
before removing it here). Added a "Reference / prototype branches" note to `CLAUDE.md`
pointing at it, alongside the reasoning Fable gave (a second maths package beside the
shipping one is the exact stale-artefact-misread class that has cost a star before).

### Repo tidy-up
- **HANDOVER supersession**: added an explicit archived-arc banner to the top of
  `HANDOVER_2026-07-06_Fable.md` pointing forward to `HANDOVER_2026-07-07_Fable.md` per
  convention (j) - kept as background reading (that file itself already calls it "the
  primary reference for full historical context"), not deleted or merged.
- **Prompt archive**: moved 59 pre-2026-07-06 `FS_*_Prompt.md` files (April-early-July,
  work long done and merged) to `reports/archive/prompts/`, with a README explaining the
  cutoff. The 5 files from the current arc (2026-07-06 onward) stay at the repo root, and
  convention (b)/(f) is unchanged - new briefs still land in the root when pasted.
- **QA log archive**: moved the six 2026-07-04 `qa_soak.mjs` artefacts (already explicitly
  called "historical evidence... not current verification" in their own committing
  commit's message) to `reports/archive/qa-2026-07-04/`, with a README. `reports/qa/` now
  holds only current artefacts (the Wiring Integrity Audit and REVIEW_EVENTS pass reports).
- **Explicit-paths convention**: added convention (k) to `CLAUDE.md`, formalising the
  "never `git add -A`/`git add .`" discipline already followed throughout this whole
  engagement.

## Verification
- `npm run build` / `svelte-check`: clean (same 6 pre-existing `node_modules` errors).
- `responsibleGambling.test.ts` 14/14, `roundInterpreter.determinism.test.ts` 58/58,
  `fsModes.drift.test.ts` 5/5, `scan_wallet_floats.mjs` PASS (52 files, down from 54 -
  the two deleted dead components), `check_autoplay_confirm_gate.mjs` PASS (now exactly
  1 call site total, not 1 live + 1 dead), Google-Fonts-CDN grep empty.
- `scripts/validate_math.py`: ALL COMPLIANCE CHECKS PASS (unaffected - no maths changes;
  the Collection Meter relocation only touches a sibling, never-locked directory).
- All five previously-broken scripts individually run to completion against a live dev
  server post-fix (see above for each one's actual result, not just "no longer times out").
- Locked files confirmed untouched (`rgsService.ts`, `gameStore.ts`,
  `games/future_spinner/` tracked content diff empty).

## Needs owner / Fable attention
- **New finding**: `reel_v3_proof.mjs` and `motion_v2_proof.mjs` both surface exactly one
  frame over the 100ms hard gate (149ms/150ms out of ~2,000-2,300 samples each), landing at
  almost the same point in both runs - worth a look at what happens around the bonus-buy
  transaction moment, though average fps comfortably clears 55 in both. Not a selector bug;
  a genuine performance data point this pass surfaced by making the scripts runnable again.
- `layout_v1_audit.mjs`'s recorded "expected" position values are stale (pre-B1-reskin);
  only occlusion is gated so this isn't a functional failure, but the reference numbers
  would mislead a human reviewer comparing them directly - a future pass could refresh them.
- Standing items unchanged: audio (still the one open creative blocker); QA re-soak (gated
  on audio, will pick up every new gate added across this whole audit/hygiene arc).

## FOR THE NEXT SESSION
- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** for each of the five
  scripts, didn't stop at "selector no longer stale" - actually ran each one against a live
  dev server and read its real output, which is how the ANSI-regex bug, the missing
  intro-dismissal logic, the persistent-warm-mount duplicates, and the two long-frame
  findings all surfaced; archived old prompts/QA logs with README explanations rather than
  silently deleting or silently leaving a bare `git mv` with no context.
- **Alternatives rejected:** loosening the zero-long-frames gate to make the two proof
  scripts "pass" (rejected - that would paper over a real, if minor, finding rather than
  report it); deleting the stale `layout_v1_audit.mjs` position-expectation values instead
  of just flagging them (rejected - refreshing them to the current B1 reskin's true
  positions is a small design-verification task of its own, better done deliberately than
  incidentally inside a selector-fix pass).
- **Files touched:** `CLAUDE.md` (LOCKED_FILE_DEBTS-adjacent reference-branch note +
  convention k), `HANDOVER_2026-07-06_Fable.md` (archived-arc banner),
  `frontend/scripts/{build_diet_verify.mjs, layout_v1_audit.mjs, ux_v1_audit.mjs,
  reel_v3_proof.mjs, motion_v2_proof.mjs, scene_proof.mjs}`, deleted
  `frontend/src/lib/components/{FeatureButton.svelte, ControlBar.svelte}`, deleted
  `games/future_spinner_collect/**` (relocated to `claude/collect-prototype`), moved 59
  `FS_*_Prompt.md` files to `reports/archive/prompts/` + README, moved 6 QA log files to
  `reports/archive/qa-2026-07-04/` + README, this report. Locked files confirmed untouched.
- **Open threads:** the two long-frame findings (worth a look, not chased here); audio;
  QA re-soak; `layout_v1_audit.mjs`'s stale position-expectation refresh (optional,
  flagged not fixed).
