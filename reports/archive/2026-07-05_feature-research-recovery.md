# Session Report: recover + commit the ante / multi-buy feature research

- **Date:** 2026-07-05
- **Model / effort:** Claude Opus 4.8, High.
- **Branch:** `claude/feature-research` (from `main` at a295630, after PR #27).
- **Source:** owner: the ante and multi-buy research from a recent session was never
  committed; locate it (working tree, ~/Desktop, or regenerate), commit it as
  `docs/FEATURE_RESEARCH_v1_1.md` on `claude/feature-research`, open a PR into `main`
  with a one-paragraph summary, and include a session report per convention.

## 1. What was located

The research was **found, not lost**. It is the full bet-mode + mechanic design space
document covering the ante variants (1.25x vs 1.5x vs two ante rungs) and the multi-buy
ladder (mini / standard / super buy tiers), plus the measured "mini-buy finding", volatility
recipes, the max-win ceiling decision and a phased roadmap.

- **Where it lived:** committed as `docs/MATH_DESIGN_SPACE.md` on the feature branches
  `claude/gap-analysis`, `claude/compliance-rg` and `claude/lumen-sideproject`
  (commits 0762444 "math design space" and b26dc7f "low-vol Cruise mode + mini-buy finding").
- **Why it looked lost:** it was **never merged to `main`**. From `main`'s perspective the
  file does not exist (`git cat-file -e main:docs/MATH_DESIGN_SPACE.md` fails), so the
  research had no presence on the trunk. Not on `~/Desktop`; no stash held it; no
  `FEATURE_RESEARCH*` file existed anywhere on disk.

## 2. What changed

- **`docs/FEATURE_RESEARCH_v1_1.md`** (new): the recovered research, committed verbatim
  under its intended deliverable name. A short provenance note was prepended (clearly marked
  as added-on-recovery) explaining where it came from and why it was effectively lost; the
  body below the note is unchanged from the recovered source (240-line original preserved).
- **`reports/SESSION_REPORT.md`** + archive copy (this file).

No code, no maths, no locked files touched. Docs-only change.

## 3. Verification

- Confirmed the source content is byte-faithful (copied from the tracked file via the
  git-tracked working tree, not regenerated).
- Branched cleanly from `main`; the three unrelated working-tree modifications carried in
  from the prior branch (`frontend/.claude/settings.local.json`, `frontend/dist/index.html`,
  `optimization_program/src/setup.toml`) were **deliberately left unstaged** so the PR is
  docs-only.
- `git diff .claude/settings.json` verified empty (no lock exception needed this session).

## 4. Lock discipline

No locked paths were modified. No lock exception was required or taken. The
`games/future_spinner/**` and `rgsService.ts`/`gameStore.ts` deny rules remain in place and
`.claude/settings.json` is unchanged.

## FOR THE NEXT SESSION

- **Model / effort:** Claude Opus 4.8, High.
- **Approach:** located the research rather than regenerating it, recovered it verbatim under
  the requested filename with a transparent provenance header, and opened a docs-only PR to
  `main`.
- **Alternatives considered and rejected:** (a) regenerating the research from session
  context — rejected, the original was found intact so recovery is faithful; (b) merging
  `docs/MATH_DESIGN_SPACE.md` under its old name — rejected, the owner asked specifically for
  `docs/FEATURE_RESEARCH_v1_1.md`; (c) sweeping the unrelated working-tree changes into this
  PR — rejected, kept the PR docs-only.
- **Files touched:** `docs/FEATURE_RESEARCH_v1_1.md` (new), `reports/SESSION_REPORT.md` +
  archive copy.
- **Open threads:** `docs/MATH_DESIGN_SPACE.md` still exists only on feature branches under
  its old name; decide whether to retire it in favour of this canonical copy. The design
  decisions D1-D6 (ante price, low-vol Cruise, buy ladder depth, second mechanic, max-win
  cap, RTP parity) remain open and lock at Stake approval.
