# Session Report: Workflow conventions setup

- **Date:** 2026-07-03
- **Branch:** `claude/workflow-setup` (from up-to-date `main` at `c5382a2`, which includes
  the merged canonical base-only package, PR #2)
- **Topic:** Establish WRS workflow conventions: permissions, session reports, compliance
  watch, and the v5 operating manual.

## What ran

- Checked out `main`, pulled (fast-forwarded to `c5382a2`), created `claude/workflow-setup`.
- Set up a headless-browser docs capture in the scratchpad (Playwright + system Chrome, no
  browser download), discovered the live Stake Engine docs nav, and captured five topics.
- Verified all new docs are free of em and en dashes.

## What changed (new files on this branch)

- `.claude/settings.json`: permissions policy. `defaultMode: acceptEdits`; an allow list for
  common git, npm, python, media and shell reads; `ask` on `rm`; `deny` on the locked files
  (`rgsService.ts`, `gameStore.ts`, `games/future_spinner/**`), `git push --force*`, `sudo`.
- `CLAUDE.md`: rewritten and current. Locked files (machine-enforced, session-only
  exceptions via `.claude/settings.local.json`), integer micros rule, true game facts,
  Manus retired / in-house vector assets, dev-only theme selector, and the session
  conventions (a) to (d).
- `CLAUDE_PROJECT_INSTRUCTIONS_v5.md`: full operating manual, marked as superseding v4 and
  earlier. Reflects the merged canonical base-only maths, scatter 1x/3x/10x everywhere, the
  in-house vector design system and engine-and-skin architecture, the approved symbol
  lineup, the remaining pass sequence (AssetForge v2, Motion Polish v2, Build Diet v2, then
  submission), and the workflow conventions.
- `reports/README.md` and `reports/archive/`: session-report scaffold.
- `COMPLIANCE_WATCH.md`: seeded posture plus the first watch-log entry.
- `docs/stake-engine-live/`: first snapshot of five docs topics plus `_manifest.json`.

## Verification results

- `.claude/settings.json` parses as valid JSON.
- Docs capture: 4 of 5 topics rendered real content (approval-guidelines 2,250 chars,
  jurisdiction-requirements 1,375, game-quality-rankings 3,245, game-replay-requirements
  5,037). Changelog has no dedicated docs page: `/docs/changelog` and `/docs/updates` both
  error and there is no changelog nav entry; recorded as not-found for the next refresh.
- New docs verified clean of em and en dashes.
- Note: this branch adds workflow and docs files only. No frontend source or maths files
  were touched, so there is no runtime behaviour to build or exercise here.

## Needing owner attention

1. **Star rating vs base-only decision.** The live `game-quality-rankings` page lists
   "missing engaging features: bonus modes and additional game mechanics" among common
   causes of low ratings and says these are expected in competitive submissions. Our
   canonical decision is base-only single-mode, which is fully compliant but may cap the
   star rating. The in-house vector design system addresses the separate
   AI-generated-assets concern. Decision recorded in `COMPLIANCE_WATCH.md`.
2. **Approved symbol lineup is a design target, not yet shipped.** The lineup in v5
   (H2 Boost Gauge, M1 Steering Wheel, M2 Gear, M3 Headlight, etc.) differs from the
   currently shipped raster symbols; it will be produced through AssetForge v2. Paytable
   values are locked and unchanged; only the art identity changes.
3. **PR.** See the branch and PR status printed at the end of the session.
