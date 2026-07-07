# Session Report: Wiring Integrity Audit (Fable's sanctioned work order)

- **Date:** 2026-07-07
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/wiring-integrity-audit` (off up-to-date `main`, in a dedicated
  worktree at `/Users/jt/math-sdk-wiring`).
- **Source:** Fable's verdicts on the 2026-07-07 handover (PR #47), relayed by the owner
  and saved verbatim as `FS_FableVerdicts_2026-07-07_Prompt.md` per convention (b)/(f).
  Item 1's sanctioned work order: a Wiring Integrity Audit, explicitly scoped "read-only
  plus tests, no locked files, no sanction needed" - (a) a static trace of dispatch/handler
  pairings; (b) a cost-integrity gate in `qa_soak.mjs`; (c) a wallet-path float scan; (d) a
  fsModes/index.json drift test; (e) two autoplay asserts folded in from item 3.

## What this delivers

Full detail is in `reports/qa/wiring_integrity_audit_2026-07-07.md`. Summary:

- **Headline finding (not part of the original ask, surfaced by the trace):**
  `standingMode` is a dead-end store - selecting Cruise or toggling OVERBOOST in the
  FEATURES menu currently has zero effect on the actual spin request (`App.svelte`'s
  `handleSpin` hardcodes `mode: 'base'` regardless). Same bug class as the buy-tier billing
  fix, on the standing-mode side. **Flagged, not fixed** - per the audit's explicit scope
  and because it's a real behaviour change (which maths curve plays, whether OVERBOOST's
  1.25x should apply per spin), not a mechanical correction. Concrete, reproducible proof:
  the new cost-integrity gate shows `cruise`/`overboost` FAIL while `normal`/`bonus`/`super`
  PASS.
- **(a) Static trace**: covered every `createEventDispatcher` pairing plus `handleSpin`/
  `handleBuy`/the autoplay loop. Also found and fixed: `qa_soak.mjs`'s spin-button selector
  was stale (targeted a class that only exists in dead code, since the B1 HUD reskin);
  `handleBuy`'s `cost` reached the balance store unrounded; `CLAUDE.md` and `betMode.ts`
  still claimed only two bet modes exist.
- **(b)** `qa_soak.mjs` gained a cost-integrity phase: for each of the five modes at a fixed
  bet, drives the FEATURES menu like a real player and asserts the recorded mode/debit are
  correct. Verified standalone against a live dev server (full soak run is 25-30 minutes) -
  reproduces the headline finding exactly (3 pass, 2 fail).
- **(c)** New `scan_wallet_floats.mjs`: found and fixed the one real violation it exists to
  catch (`handleBuy`'s unrounded `cost`), now passes clean across 54 files. Locked files are
  explicitly out of scope (a finding there needs a sanction to fix, so a permanent gate
  can't fail against code we can't touch) - one such finding in `rgsService.ts`'s mock-spin
  payout calc is noted for visibility, not gated on.
- **(d)** New `fsModes.drift.test.ts`: cross-checks `fsModes.ts` against the shipped
  `index.json`, 5/5 matched.
- **(e)** `responsibleGambling.test.ts` gained two explicitly-named checks for the literal
  `minSpinMs` default (now 14/14, was 12/12). New `check_autoplay_confirm_gate.mjs`: asserts
  exactly one LIVE `isAutoPlay.set(true)` call site gated behind a real `on:click` - caught
  a real complication (the dead `ControlBar.svelte` has a second, unreachable copy) and
  correctly distinguishes live from dead call sites rather than failing on it.

## Verification
- `npm run build`: clean.
- `npx svelte-check`: clean (only the 6 pre-existing `node_modules` errors).
- `responsibleGambling.test.ts`: 14/14. `roundInterpreter.determinism.test.ts`: 58/58
  (re-run to confirm unaffected). `fsModes.drift.test.ts`: 5/5. `scan_wallet_floats.mjs`:
  PASS. `check_autoplay_confirm_gate.mjs`: PASS.
- Google-Fonts-CDN compliance grep: empty.
- Locked files confirmed untouched (`rgsService.ts`, `gameStore.ts`, `games/future_spinner/`
  diff empty) - everything in this pass is frontend-only or new scripts/tests.

## Needs owner / Fable attention
- **The `standingMode` headline finding** needs an explicit decision before any fix:
  wiring it into `handleSpin` means Cruise/OVERBOOST selections start actually changing
  gameplay/cost, not a mechanical correction. See the audit report's "Recommendation."
- The other 5 verification scripts sharing `qa_soak.mjs`'s stale `.spin-btn` selector
  were not fixed this pass (out of scope for a `qa_soak.mjs`-specific work order).
- `canBuyBonus`'s hardcoded 100x affordability check lives in the locked `gameStore.ts` -
  needs a sanctioned lock exception if it's ever to be fixed properly.
- A full `npm run qa:soak` run (25-30 minutes) is a natural follow-up to confirm the new
  cost-integrity phase end to end inside the harness itself, not just standalone.

## FOR THE NEXT SESSION
- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** treated Fable's "flagging,
  not fixing" instruction literally for the standingMode finding even though it was more
  severe than what prompted the audit - built the cost-integrity gate exactly as specified
  across all five modes, which itself produced the concrete before/after evidence rather
  than requiring a separate write-up; fixed only what was unambiguously in-scope and
  mechanical (the stale selector, the unrounded float, the stale docs).
- **Alternatives rejected:** fixing `standingMode`'s wiring immediately (rejected - it's a
  real gameplay/cost behaviour change needing an explicit decision, unlike the buy-tier fix
  which was unambiguous); fixing all 6 scripts sharing the stale `.spin-btn` selector
  (rejected as scope creep beyond the `qa_soak.mjs`-specific work order - flagged instead);
  running the full 25-30 minute `qa_soak.mjs` soak to validate the new phase (rejected as
  disproportionate for this pass - validated the identical logic standalone instead).
- **Files touched:** `CLAUDE.md`, `frontend/src/lib/stores/betMode.ts` (comments only),
  `frontend/src/App.svelte` (float rounding fix + `__qaLog` extension),
  `frontend/scripts/qa_soak.mjs` (selector fix + cost-integrity phase),
  `frontend/scripts/{scan_wallet_floats.mjs, check_autoplay_confirm_gate.mjs}` (new),
  `frontend/src/lib/config/fsModes.drift.test.ts` (new),
  `frontend/src/lib/stores/responsibleGambling.test.ts` (two new checks),
  `FS_FableVerdicts_2026-07-07_Prompt.md` (new, brief saved verbatim),
  `reports/qa/wiring_integrity_audit_2026-07-07.md` (new), this report. Locked files
  confirmed untouched.
- **Open threads:** the `standingMode` fix decision (headline item); the other 5 stale-
  selector scripts; `canBuyBonus`'s locked hardcoded 100x; a full `qa:soak` run; everything
  else still open from the 2026-07-07 Fable handover (audio, the two owner eye-calls, the
  hygiene pass including the Collection Meter relocation, the dossier/copy update).
