# FS FeatureMath: Overdrive Free Spins, Stage 1 (Maths Model)

## OWNER SANCTION AND PRE-AUTHORISATIONS
The owner (Joshua Thompson) has decided the game ships WITH a real bonus feature
(Option C). This pass is explicitly sanctioned to modify games/future_spinner/
(config, gamestate, run, publish files, PAR sheet) to build it. rgsService.ts and
gameStore.ts remain HARD LOCKED. Per convention, lift the maths deny rules for this
session only by writing .claude/settings.local.json with allow entries for
Edit(games/future_spinner/**) and Write(games/future_spinner/**); delete that file
as the final step so the locks re-apply.
- Overwrite any file in scope without asking; run all tooling without asking
- Three-Strike Rule per approach: same error 3 times, change approach or report

## THE FEATURE (build exactly this)
Name: OVERDRIVE FREE SPINS.
- Trigger: 3, 4 or 5 scatters in the base game award 8, 12 or 16 free spins AND
  still pay the existing instant scatter award of 1x, 3x or 10x total bet.
- Overdrive meter: the bonus starts at multiplier 1x. After every WINNING free
  spin the multiplier increases by +1x. The multiplier applies to all subsequent
  free-spin wins (ways wins and scatter pays alike). It never resets during the
  bonus and is not retroactive. No cap beyond the round win cap.
- Retrigger: 3 or more scatters during free spins award +5 free spins and pay
  their instant scatter award (multiplied by the current Overdrive multiplier).
- Bonus buy: second bet mode "bonus", cost 100.0x, is_buybonus=True, guaranteeing
  a 3+ scatter trigger spin (weight the 3/4/5 distribution so the 100x price is
  fair against the mode RTP).
- Win cap: 5,000x total per round, hard, both modes.
- The whole feature resolves inside ONE book round (Stake Engine stateless).

## DESIGN TARGETS (latitude allowed, report what lands)
- RTP: exactly 96.3500% at 4dp in BOTH modes (integer-arithmetic convention as
  audit/analyze.py; also report full precision). This satisfies the 0.5% rule.
- Base RTP budget guidance: wincap 0.05, instant scatter pays 0.04, free spins
  0.34, base ways 0.5335. Treat as starting fences; rebalance if convergence
  demands, and report the final split.
- Free spins trigger rate: once per 150 to 220 base spins. This requires
  reworking the scatter economics (distribution quotas and forcing, and reel
  weights if needed): the old 6.37% scatter rate belonged to the instant-only
  design and is far too frequent for a free-spins trigger.
- Volatility: medium-high; weighted SD anywhere in 16x to 24x is acceptable.
- Base hit rate: 28% to 34%.
- Bonus mode: average bonus outcome consistent with 96.35% at 100x cost;
  distribution weighted over 3/4/5 scatter entries.
- Simulation size: 100,000 rounds per mode minimum (raise if convergence needs).

## Task 0: Preconditions
- cd ~/math-sdk && git checkout main && git pull
- Confirm the workflow-setup PR is merged (.claude/settings.json must exist on
  main). If not, STOP and report.
- git checkout -b claude/overdrive-feature
- Write the session settings.local.json lift described in the sanction block.
- Save this brief verbatim as FS_FeatureMath_Prompt.md per convention.

## Task 1: Model design and implementation
- Redesign games/future_spinner/game_config.py and gamestate.py for the feature:
  free-spin trigger and counts (8/12/16, retrigger +5), the Overdrive progressive
  multiplier applied within the freegame, retained instant scatter pays, the two
  bet modes (base cost 1.0 is_feature=True is_buybonus=False; bonus cost 100.0
  is_buybonus=True), distributions and criteria for wincap, freegame, scatter,
  zero and basegame per the RTP budget, and the paytable UNCHANGED (H1 22/6/1.5
  down to L3 0.65/0.20/0.08 per way).
- Follow the SDK's sample lines game freegame patterns (freespin_triggers,
  force_freegame, freegame reel sets) as the reference implementation. Create a
  freegame reel set if needed.
- Document every design decision in comments using the true values.

## Task 2: Simulate, optimise, converge
- Full pipeline under a fresh venv (system Python 3.14 worked previously; Rust
  toolchain already installed): create books for both modes, generate configs,
  run the optimiser for both modes, analytics.
- Convergence discipline: if the optimiser cannot reach a target, adjust fences,
  quotas or reel weights and rerun. If after several distinct approaches a design
  target is unreachable, report the nearest achievable configuration and its
  numbers as an owner decision rather than forcing a bad fit. RTP at exactly
  96.3500% (4dp) in both modes is NON-NEGOTIABLE; the other targets have the
  latitude stated above.

## Task 3: Verification gates (all must pass before commit)
- RTP: both lookup tables independently recomputed with exact integer arithmetic
  equal 96.3500% at 4dp; report 10dp values.
- Books and lookup tables agree positionally by id and as multisets, both modes.
- Max win exactly 5,000.00x, zero rounds above cap, both modes.
- Round-shape audit: decompress a sample of at least 200 freegame-containing
  books and verify event sequences are well formed: trigger spin with 3/4/5
  scatters, correct spin counts including retriggers, multiplier progression
  (+1 only after winning spins, applied to subsequent wins), instant scatter
  pays present, and total payout equals the book payoutMultiplier in every
  sampled round. Any mismatch is an ABORT.
- Determinism: rerun book creation for base mode and confirm byte-identical
  payouts (fixed seeds).
- index.json lists both modes with correct costs and files; game_metadata.json
  modes ["base","bonus"]; no orphan files in publish_files.

## Task 4: Regenerate the PAR sheet for the two-mode game
- Full rewrite of FUTURE_SPINner_PAR_SHEET.md sections from the final artefacts
  (use the actual filename FUTURE_SPINNER_PAR_SHEET.md): game description with
  OVERDRIVE FREE SPINS, both modes documented as SHIPPED features (replace the
  SINGLE MODE DECLARATION with a two-mode declaration), scatter table (instant
  pays and spin awards), Overdrive multiplier rules, trigger rate, all
  weight-dependent metrics recomputed from the final lookup tables, bonus mode
  section with the buy cost and entry distribution. No em or en dashes. The PAR
  must describe the uploaded artefacts exactly, zero inconsistencies.

## Task 5: Documentation and handover
- Update CLAUDE.md game facts and CLAUDE_PROJECT_INSTRUCTIONS_v5.md to v5.1:
  Option C decided, feature spec as built, new metrics, two-mode package,
  updated remaining pass sequence (feature frontend, design batches, AssetForge
  v2, Motion Polish v2, Build Diet v2, compliance re-validation, submission).
- Update COMPLIANCE_WATCH.md: single-mode question RESOLVED by shipping the
  feature; note the replay requirement that bonus-buy replays must display the
  amount spent including the cost multiplier (frontend Stage 2 scope), and the
  jurisdiction flag disabledBuyFeature must hide the buy (Stage 2 scope).
- Rebuild ~/Desktop/FutureSpinner_SubmissionBundle/ maths files from the new
  package with a fresh hash manifest (frontend dist refresh happens in Stage 2).
- Delete .claude/settings.local.json (re-arm the locks).
- reports/SESSION_REPORT.md plus archive copy per convention; status doc to
  ~/Desktop/.
- Commit everything with clear messages, push, and open the PR into main via gh
  titled "Overdrive Free Spins: two-mode maths package, PAR regenerated" with
  the session report as description. Report the final metrics table: RTP both
  modes at 4dp and 10dp, trigger rate, hit rate, SD, average bonus win,
  wincap frequency, and the final RTP budget split.