# Session Report: gap analysis + ante / Double-Chance third bet mode

- **Date:** 2026-07-05
- **Model / effort:** Claude Opus 4.8 (1M context), High.
- **Branch:** `claude/gap-analysis` (from `main` after PR #27).
- **Source:** owner: research the field for gaps "before the next layer", then "expand maths go for it".

## 1. Feature gap analysis (`docs/GAP_ANALYSIS.md`)

Two research passes (general slot UX conventions + the Stake Engine ecosystem), cross-checked
against the mirrored approval docs. Scored Future Spinner across core UI, info/help, presentation,
settings, RG/compliance, social and Stake-specific plumbing.

- **Headline:** bet modes and maths cannot change after approval, so any extra mode / mechanic /
  higher max-win is a now-or-never decision for this submission.
- Answered the owner's "what line do you have for winnings" question: the game is 1,024-ways by
  design (no paylines). Shipped the fix (commit 6b9e39f): the paytable now shows 4^5 = 1,024 and a
  worked multi-way example, with a per-way note.
- Iterable frontend gaps logged (autoplay stop-conditions, volatility indicator, settings depth,
  UI button guide, mini-player check).

## 2. Ante / Double-Chance third bet mode (the maths expansion) — commit 8e94995

Owner chose to expand the maths. Added a third stateless mode while the maths can still change.

- **Design:** cost 1.5x, ~2x the free-spin trigger rate (1 in 92.4 vs base 1 in 184.7). Same
  reels, same Overdrive feature, same 5,000x cap; the heavier free-game fence is funded by a
  lighter base-ways fence (authentic ante profile). Not a buy - reels spin normally.
- **Build:** set up the SDK `env/` venv (`make setup`); added the `ante` BetMode
  (game_config.py), optimiser fences summing to 0.9635 (game_optimization.py), and the mode to
  the canonical runner (run.py). Generated **ante-only** via a scratch runner so the already
  verified base/bonus books, lookup tables and replay event IDs stayed **byte-identical**
  (confirmed: git diff of base/bonus tables empty). The pipeline auto-published the weighted
  `lookUpTable_ante_0.csv`, `books_ante.jsonl.zst`, and a 3-mode `index.json`.
- **Validated (`scripts/validate_math.py`, CI-gated):** RTP 96.350000% all three modes,
  cross-mode variation 0.0000%; ante hit rate 29.65%, SD 23.26x, wincap 1 in 66,667,
  P(>=5000x) 1.5e-05. All Stake star-tier risk gates pass. Ante cross-checks added to the validator.
- **Docs:** PAR sheet section 5B + three-mode declaration (v1.2); `game_metadata.json` v1.2.0
  modes [base, ante, bonus]; COMPLIANCE_WATCH + SUBMISSION_DOSSIER reconciled to three modes.

## 3. Frontend wiring (non-locked)

- `AnteToggle.svelte`: a "Double Chance" toggle (cyan, distinct from the magenta Bonus Buy),
  persisted to localStorage, showing the +0.5x extra cost. Bottom-left, clear of all controls.
- `betMode.ts` widened to `base | ante | bonus` + an `anteEnabled` store. `App.svelte` spin/buy
  handlers set `selectedBetMode` to 'ante' when enabled (the sanctioned rgsService passthrough
  sends it, so the server applies the 1.5x cost) and reset to the standing mode after a buy.
  Base/bonus behaviour unchanged. Affordability guards the 1.5x debit.
- Paytable gains an ante rule line, social-scrubbed (no bet/pay/cost terms in social mode).
- `svelte-check` clean (only pre-existing node_modules .d.ts noise); `npm run build` clean.
  Visual proof: `reports/screens/ante/ante_off.png`, `ante_on.png`.

## 4. Lock discipline

The two `games/future_spinner/**` deny lines were lifted in the working tree for the build under
the owner's sanction, then restored with `git checkout` and a **verified-empty**
`git diff .claude/settings.json` before any commit. No Bash-write routed around a deny; the SDK's
own pipeline produced the maths artefacts. settings.json is unstaged and clean.

## Verification

`validate_math.py` ALL PASS (three modes 96.3500%). Frontend build + typecheck clean. base/bonus
maths artefacts byte-identical. Lock restored (diff empty).

## Still outstanding / owner

- Not pushed / no PR opened yet (branch `claude/gap-analysis`, three commits) - awaiting owner to
  avoid the prior PR-orphaning-on-merge issue.
- Remaining now-or-never options if wanted this submission: a 2nd interacting free-spins mechanic;
  a mini/super bonus-buy tier; raising the 5,000x ceiling. Otherwise the maths is ready to lock.
- Jurisdiction: ante-style bets are restricted in some markets; gate the toggle behind an RGS flag
  if one is exposed (none consumed yet).
- Deploy-dependent: re-derive replay event IDs on staging (base/bonus IDs preserved; ante needs
  its own), portal upload, tile asset pack, owner portal items.

## FOR THE NEXT SESSION

- **Model/effort:** Opus 4.8 (1M), High.
- **Approach:** research-first gap analysis, then a surgical ante-only maths regeneration to
  preserve the verified base/bonus package, then minimal-but-real frontend wiring.
- **Alternatives rejected:** full 3-mode rebuild (would have changed base/bonus tables + replay
  IDs and forced re-verification) - rejected in favour of ante-only. A deeper second free-spins
  mechanic - deferred (higher risk; owner picked the ante mode).
- **Files touched:** game_config.py, game_optimization.py, run.py, PAR sheet, game_metadata.json,
  index.json, lookUpTable_ante_0.csv (maths); App.svelte, betMode.ts, AnteToggle.svelte,
  PaytableModal.svelte, translations.ts (frontend); validate_math.py; GAP_ANALYSIS.md,
  COMPLIANCE_WATCH.md, SUBMISSION_DOSSIER.md.
- **Open threads:** push/PR the branch; decide whether to add any further now-or-never maths;
  jurisdiction gating for ante; the iterable frontend gaps from the gap analysis.
