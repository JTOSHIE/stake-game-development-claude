# FS FeatureFrontend: Overdrive Stage 2 (Presentation, Buy, Replay, Compliance)

## PRE-AUTHORISATIONS
- Overwrite ANY file without asking, EXCEPT the hard locks
- Fix TypeScript errors autonomously; run all tooling without asking
HARD LOCKS (machine-enforced): frontend/src/lib/services/rgsService.ts,
frontend/src/lib/stores/gameStore.ts, and everything under games/future_spinner/
(the maths is final and locked again). All new behaviour uses the parallel-files
pattern: new stores, components and services reading what the locked code
exposes. Three-Strike Rule: same error 3 times, change approach or stop and report.

## CONTEXT
The merged maths ships two modes: base (1.0x) and a 100x bonus buy, with
Overdrive Free Spins (3/4/5 scatters award 8/12/16 spins plus instant 1x/3x/10x;
the Overdrive meter rises +1x after every winning free spin and multiplies all
subsequent wins; 3+ scatters in the bonus retrigger +5 and pay their instant
award times the meter; 5,000x hard cap). The frontend still presents the old
instant-only game. This pass makes the frontend present the true game, fully
localised and compliant. Use the existing style and temporary CSS elements where
final art is pending (AssetForge v2 delivers the styled meter and buy button art
later; build clean structure now).

## Task 0: Preconditions and housekeeping
- cd ~/math-sdk && git checkout main && git pull
- Confirm the Overdrive maths is on main (index.json must list both modes) and
  the dossier PR is merged (SUBMISSION_DOSSIER.md exists). If either is missing,
  STOP and report.
- git checkout -b claude/feature-frontend
- If CLAUDE.md convention (d) does not yet describe the real lock-exception
  mechanism, update it now: exceptions require a brief explicitly naming the
  deny lines to lift; the lift is a temporary never-committed working-tree edit
  of .claude/settings.json, restored with a verified-empty diff before any
  commit; writing to locked paths via Bash to route around a deny is forbidden
  and never counts as an exception. Also record convention (f): briefs arrive as
  pasted messages and are saved and committed verbatim by the session.

## Task 1: Round interpreter (read the truth first)
- Decompress a sample from the real books at
  games/future_spinner/library/publish_files/books_base.jsonl.zst (read-only)
  and study the actual event structure of freegame rounds: trigger, spin
  sequence, retriggers, meter progression, win events, final totals.
- Build frontend/src/lib/services/roundInterpreter.ts: a typed interpreter that
  converts one book round into an ordered presentation script (base reveal,
  scatter lands, trigger, each free spin with its board, wins, meter value,
  retriggers, running total, final total). Pure and unit-testable.
- Extract a curated sample set into frontend/src/lib/mock/sample_rounds.json:
  at least 40 rounds covering a base loss, base wins of each tier, 3, 4 and 5
  scatter triggers, a retrigger round, a high-meter round, and the wincap round,
  from both modes. Mock mode serves these so the whole feature is developable
  and testable offline.

## Task 2: Free spins presentation
- Entry transition (Overdrive engages, CSS treatment in existing theme colours),
  a spins-remaining counter, and the Overdrive meter as a temporary CSS gauge
  showing the current multiplier, positioned where the final boost gauge art
  will sit.
- Per spin: board plays with existing reel mechanics; wins display with the
  meter made visible (base win x meter = awarded win); the meter increments only
  after a winning spin, animated.
- Retrigger: celebration moment, +5 added visibly, instant scatter award shown
  multiplied by the meter.
- End: total-win summary with count-up, then transition back to base.
- Turbo shortens every duration. Autoplay treats the whole bonus as one round:
  pauses during it, resumes or stops per its remaining count after the summary.
  Spacebar and input guards behave correctly throughout.

## Task 3: Bonus Buy
- First inspect how the locked rgsService issues Play requests and whether the
  bet mode is already a parameter or store-driven. If the mode can be selected
  through existing exposed surface, wire it via a new non-locked store. If it is
  hardcoded to base with no exposed path, STOP and report the exact minimal
  sanctioned change required (file, lines, proposed diff) and wait; do not lift
  any lock in this pass.
- Buy button at the established convention position with a temporary CSS
  treatment; confirm modal showing the feature description and the price (100x
  the current bet, formatted in live currency via the existing formatter), with
  an affordability guard and explicit confirm and cancel.
- On confirm: place the bonus-mode bet and present the guaranteed trigger round
  through the Task 2 flow. In mock mode, serve bonus-mode sample rounds.

## Task 4: Social mode and jurisdiction compliance (live docs are binding)
- Every new string ships in translations.ts across ALL 16 locales with social
  overrides per the live prohibited terms table. Binding examples: never buy,
  bonus buy, purchase, cost of, at the cost of, bought in social mode; use forms
  like get bonus, play, can be played for, instantly triggered. Audit every new
  label, modal, rules paragraph and button in social mode including first paint.
- Read the jurisdiction flags the RGS authenticate response exposes through the
  existing non-locked surface; when disabledBuyFeature is set, the buy button
  and its rules references are fully hidden. If the flag is not exposed outside
  the locked service, STOP and report the exact minimal sanctioned change, as in
  Task 3.

## Task 5: Replay for bonus rounds
- Replay plays back a complete free spins round from its round data using the
  Task 1 interpreter, HUD hidden, disclaimer in every phase as today.
- Where the replayed round is a bonus buy, display the amount spent including
  the cost multiplier (100x bet) per the live replay requirements.
- Graceful on malformed input, as the existing replay is.

## Task 6: Rules and paytable for the true game
- PaytableModal and the rules screen gain the Overdrive section: trigger table
  (3/4/5 scatters = 8/12/16 spins plus 1x/3x/10x instant), meter rules, +5
  retrigger, the buy and its price, both modes at 96.35% RTP, the 5,000x cap.
  All 16 locales, social variants throughout, seven point disclaimer untouched
  and reachable at all times.

## Task 7: Verification (the exact-total gate is the point)
- npx tsc --noEmit and npm run build pass with no warnings.
- Interpreter unit check: for every round in sample_rounds.json, the sum of all
  presented win events must equal the round payoutMultiplier EXACTLY (integer
  centibets, no float drift). Any mismatch is an ABORT: it means the
  presentation lies about the maths.
- Headless run-through in mock mode: base spin, each win tier, a full trigger
  round with meter increments only on winning spins, a retrigger round, the
  wincap round, and a buy flow, all with no console errors and stable memory.
- Social first-paint scan across locales including every new string; replay of a
  bonus round and a buy round (cost display check); six-viewport re-check with
  the new UI elements reachable everywhere.
- Update FUTURE_SPINNER_PROJECT_STATUS.md and copy to ~/Desktop/. Session report
  plus archive per convention, commit, push, and open the PR into main via gh
  titled "Overdrive Stage 2: feature frontend, buy, replay, compliance" with the
  session report as description. Report: the event schema found, the exact-total
  gate result, strings added per locale, and any STOP items from Tasks 3 and 4.
