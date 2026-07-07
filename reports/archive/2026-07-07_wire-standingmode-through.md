# Session Report: wire standingMode through (OVERBOOST 1.25x per spin)

- **Date:** 2026-07-07
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/wiring-integrity-audit` (same branch as the Wiring Integrity Audit,
  PR #48 - still open; this is a follow-up commit on it rather than a new PR, since it
  directly resolves that PR's own headline finding and the PR wasn't merged yet).
- **Source:** explicit owner direction after the audit's headline finding was reported:
  "wire standingMode through, OVERBOOST 1.25x per spin while toggled on."

## What this delivers

Fixes the dead-end `standingMode` store the Wiring Integrity Audit found: selecting
Cruise or toggling OVERBOOST in the FEATURES menu previously had zero effect on the
actual spin request (`handleSpin` hardcoded `mode: 'base'` unconditionally). Now:

- `App.svelte`'s `handleSpin()` reads `$standingMode`, computes
  `cost = bet * MODE_COST[mode]` (routed through integer micros, matching `handleBuy`'s
  established pattern), sets `selectedBetMode` to the real mode, and passes `cost` (not
  the base `bet`) to `recordSpinResult`/`rgRecordSpin`.
- Added an affordability guard (`if (cost > bet && $balance < cost) return`) before the
  spin lock engages, since the locked `canSpin` guard only ever checks 1x-bet
  affordability - needed for OVERBOOST's 1.25x.
- Win-multiple display/telemetry (`result.totalWin / bet`) intentionally still uses the
  base bet, not `cost` - matches the existing convention for buy tiers (a win is always
  expressed as a multiple of the base bet everywhere in the UI).
- `qa_soak.mjs`: the `__qaLog` entry now includes `cost`; the pre-existing balance-drift
  check in `runSession` was updated to prefer `entry.cost` over `entry.bet` (harmless
  today since that matrix never leaves base mode, but no longer silently assumes every
  spin costs exactly the base bet).
- `betMode.ts`: updated both comments from "flagged, not fixed" to reflect the fix.
- `reports/qa/wiring_integrity_audit_2026-07-07.md`: updated in place - the headline
  finding section now documents the resolution and the after-fix gate results, rather
  than leaving a stale "not fixed" write-up sitting in an open PR.

## Verification
- `npm run build` / `svelte-check`: clean (same baseline as before).
- `responsibleGambling.test.ts` 14/14, `roundInterpreter.determinism.test.ts` 58/58,
  `fsModes.drift.test.ts` 5/5, `scan_wallet_floats.mjs` PASS, `check_autoplay_confirm_gate.mjs`
  PASS - all re-run clean after this change.
- **Cost-integrity gate re-run against a live dev server: all five modes now PASS**
  (previously `cruise`/`overboost` failed, `normal`/`bonus`/`super` passed):
  ```
  [PASS] normal    -> mode=base     micros=1000000
  [PASS] cruise    -> mode=cruise   micros=1000000
  [PASS] overboost -> mode=antelite micros=1250000
  [PASS] bonus     -> mode=bonus    micros=100000000
  [PASS] super     -> mode=super    micros=400000000
  ```
- Visual + live-balance proof: toggled OVERBOOST ON, spun at $1.00 bet, balance went
  $100.00 -> $98.75 (exactly `100 - 1.25 + 0`); the RG SessionPanel's NET figure
  correctly showed `-$1.25` too, confirming `rgRecordSpin`'s fix reaches the
  compliance-facing session display. Screenshots in `reports/screens/standingmode-fix/`.
- Locked files confirmed untouched (`rgsService.ts`, `gameStore.ts`,
  `games/future_spinner/` diff empty).

## Needs owner / Fable attention
- None blocking - this closes the one open decision from the Wiring Integrity Audit.
- Standing items unchanged: the other 5 stale-selector scripts; `canBuyBonus`'s locked
  hardcoded 100x (needs a sanctioned lock exception); a full `npm run qa:soak` run.

## FOR THE NEXT SESSION
- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** mirrored `handleBuy`'s
  already-established cost-computation pattern exactly (integer-micros rounding, the same
  `MODE_COST[mode] ?? fallback` shape) rather than inventing a new one, kept the affordability
  guard minimal (mirrors a similar guard that existed in an earlier prototype iteration of
  this exact feature, found via git history during the original audit), and updated the
  audit report/comments in place rather than leaving stale "not fixed" language sitting in
  an open PR now that the fix landed same-day.
- **Alternatives rejected:** using `cost` instead of `bet` for the win-multiple/telemetry
  calculations (rejected - would make a win's displayed multiple inconsistent with how
  every buy tier already expresses it, i.e. always relative to the base bet); opening a
  new PR for this fix (rejected - it directly resolves PR #48's own headline finding,
  which was still open, so continuing that PR avoids a stale "not fixed" report sitting
  in review).
- **Files touched:** `frontend/src/App.svelte` (handleSpin), `frontend/scripts/qa_soak.mjs`
  (balance-drift check + comment), `frontend/src/lib/stores/betMode.ts` (comments),
  `reports/qa/wiring_integrity_audit_2026-07-07.md` (updated in place), this report.
  Locked files confirmed untouched.
- **Open threads:** the other 5 stale-selector scripts; `canBuyBonus`'s locked hardcoded
  100x; a full `qa:soak` run; everything else still open from the 2026-07-07 Fable
  handover (audio, the two owner eye-calls, the hygiene pass including the Collection
  Meter relocation, the dossier/copy update).
