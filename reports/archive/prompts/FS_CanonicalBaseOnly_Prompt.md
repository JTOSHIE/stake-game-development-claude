# FS Canonical Base-Only Consistency Pass

## OWNER SANCTION AND PRE-AUTHORISATIONS
This pass is explicitly sanctioned by the owner (Joshua Thompson) to modify the
normally locked maths directory games/future_spinner/ for the sole purposes listed
in the tasks below. The sanction covers: removing the unshipped bonus bet mode,
regenerating the publish files, and regenerating the PAR sheet. It covers nothing
else. rgsService.ts and gameStore.ts remain HARD LOCKED and must not be touched.
After this pass completes, the full lock on games/future_spinner/ re-applies.

- Overwrite ANY file within the sanctioned scope without asking
- Fix TypeScript and Python errors autonomously
- Run build, tsc, npm, pip, python, git without asking
- Three-Strike Rule: same error 3 times, stop and report, no fourth attempt

## ABORT CONDITIONS (check after Task 3, before committing anything)
- If the new base per-round payouts are NOT byte-identical to the previous
  committed lookUpTable_base_0.csv (positionally by id and as a sorted multiset),
  ABORT: revert all changes and report.
- If the new lookup table RTP is not EXACTLY 96.3500 percent by integer
  arithmetic, ABORT: revert all changes and report.
- If books_base payouts do not match the new lookup table, ABORT and report.

## Task 0: Preconditions
- cd ~/math-sdk && git checkout main && git pull
- Confirm PR #1 has been merged (the paytable in
  frontend/src/lib/components/PaytableModal.svelte must show H1 pays 1.5/6/22).
  If not merged, STOP and report; do not proceed on a stale main.
- Create branch: git checkout -b claude/canonical-base-only
- Record the SHA-256 of games/future_spinner/library/publish_files/lookUpTable_base_0.csv
  and keep a copy at /tmp/prev_lut_base.csv for the identity check in Task 3.

## Task 1: Remove the unshipped bonus mode from the maths source
- games/future_spinner/game_config.py: delete the bonus BetMode entry from
  self.bet_modes, plus any conditions, weights, comments and RTP budget notes that
  exist only for the bonus mode. Do NOT change anything else: the paytable, reel
  strips, scatter_multiplier_table, wincap, and all base-mode distributions must
  remain byte-identical. Diff the file after editing and verify the only removed
  content is bonus-specific.
- games/future_spinner/run.py: remove the "bonus" entries from num_sim_args and
  any other bonus references so the pipeline runs single-mode.
- Delete games/future_spinner/library/publish_files/lookUpTable_bonus_0.csv.
- grep -rn -i "bonus" games/future_spinner/ --include="*.py" must return only
  historical comments if any remain; remove those too. Result: zero bonus
  references in the maths source.

## Task 2: One canonical publish run, from the repo
- Create a Python 3.12 virtual environment (the SDK utility get_file_hash.py
  requires 3.12), install requirements, and run the full publish pipeline via
  games/future_spinner/run.py in PRODUCTION mode: create books, generate configs,
  run the optimiser, analytics. With the bonus mode removed from the config, the
  SDK's own pipeline now emits base-only output natively: books_base.jsonl.zst,
  lookUpTable_base_0.csv, index.json.
- Confirm index.json declares exactly one mode: base, cost 1.0, referencing the
  two files above, and game_metadata.json lists modes ["base"].

## Task 3: Verification gates (see ABORT CONDITIONS)
- Payout identity: compare the new lookUpTable_base_0.csv per-round payouts
  against /tmp/prev_lut_base.csv, positionally by id and as a sorted multiset.
  Must be byte-identical. Use the existing audit/resim_compare.py approach.
- RTP: compute Sum(weight x payout) / (Sum(weight) x 100) x 100 with exact
  integer arithmetic (fractions.Fraction). Must equal 96.3500 percent exactly.
- Books: decompress books_base.jsonl.zst, confirm 100,000 rounds, payoutMultiplier
  matches the lookup table positionally by id and as a multiset, maximum exactly
  5000.00x, no round above the cap.
- Record hit rate, weighted SD, scatter trigger rate and scatter average win from
  the new table: these feed the PAR regeneration in Task 4.

## Task 4: Regenerate the PAR sheet from the canonical artefact
- games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md: recompute every
  weight-dependent figure from the new canonical lookup table and books, using
  the same integer-arithmetic methods as the audit scripts (audit/analyze.py is
  the reference): volatility, scatter trigger rate, scatter average win, the win
  distribution and combination tables, and any percentile figures. RTP, hit rate,
  paytable values, reel frequencies and the scatter table (1x/3x/10x) should come
  out unchanged; if any of those change, treat it as an ABORT condition.
- Summary table: change the "Bonus buy" row to "Bonus buy | No: base game only,
  single mode".
- Replace section 11 (BONUS BUY MODE) with a section titled "SINGLE MODE
  DECLARATION" stating: the game ships exactly one bet mode (base, cost 1.0x),
  it is stateless with an instant scatter multiplier, and there is no free spin,
  bonus game, feature buy, gamble or continuation mechanic.
- Remove every em dash and en dash from the document, replacing each with a
  colon, comma or hyphen as reads naturally. The multiplication sign x column
  formatting may remain as is.
- The PAR must describe the uploaded bundle exactly, with zero references to any
  unshipped mode.

## Task 5: Commit canonical state and restage the submission bundle
- git add -A && git commit -m "feat(math): canonical base-only package, unshipped bonus mode removed, PAR regenerated from uploaded artefact"
- Rebuild the frontend: cd frontend && npx tsc --noEmit && npm run build (must
  both pass; no frontend source changed, so failures mean environment issues).
- Recreate ~/Desktop/FutureSpinner_SubmissionBundle/ from scratch: the new
  publish files (books_base.jsonl.zst, lookUpTable_base_0.csv, index.json,
  game_metadata.json), the fresh dist/, the regenerated PAR sheet, PROMO_BLURB.md,
  and a new SHA-256 hash manifest covering every file.
- If PROMO_BLURB.md still claims a 50x scatter or buy-bonus access, replace it
  with the corrected version from FS_BlurbChecklistFix_Prompt.md (Task 1 there)
  and apply that prompt's SUBMISSION_CHECKLIST.md updates too; skip if already done.

## Task 6: Status and handover
- Update FUTURE_SPINNER_PROJECT_STATUS.md: canonical base-only package complete,
  PAR matches uploaded bundle exactly, no reviewer notes required, submission
  pending the design elevation pass. Copy the status doc to ~/Desktop/.
- git add -A && git commit -m "docs: status update, canonical base-only package staged"
- Push the branch and report: the before and after lookup table hashes, the
  verification results (payout identity, exact RTP, books match), the new PAR
  metric values (volatility, scatter trigger rate, scatter average win), and
  confirmation the bundle on the Desktop is fully self-consistent.
