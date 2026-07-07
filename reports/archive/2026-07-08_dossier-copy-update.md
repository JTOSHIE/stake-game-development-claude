# Session Report: dossier/copy update session - OVERBOOST HUD visibility, reel mode default, five-mode copy

- **Date:** 2026-07-08
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/dossier-copy-update` (off up-to-date `main`, in a dedicated worktree at
  `/Users/jt/math-sdk-nextsession`).
- **Source:** Fable's second 2026-07-07 verdict message plus the owner's relayed eye-call
  closures, both saved verbatim as `FS_FableVerdicts2_2026-07-07_Prompt.md` per convention
  (b)/(f). This is "the next session" both messages named: item 0 (OVERBOOST HUD cost
  visibility) and item 0b (reel mode default flip), then the dossier and copy update.

## What this delivers

### Item 0: OVERBOOST HUD cost visibility
- `HudOverlay.svelte`: the BET display now shows the EFFECTIVE debit
  (`bet x MODE_COST[$standingMode]`), not the nominal bet level, whenever OVERBOOST is
  toggled ON - computed identically to `handleSpin`'s own cost calculation so the two can
  never drift apart. A persistent OVERBOOST badge (orange) and a subtler Cruise label
  (cyan) render above the BET box. Found and fixed a real clipping bug during verification:
  `.fs-plate`'s `clip-path` was silently clipping the badge since it was a child of the
  clipped element (Playwright reported it as laid out with `opacity:1`/`visible`, but
  nothing painted) - fixed by moving the badge to a plain, unclipped sibling anchor
  matching the BET box's geometry exactly.
- `FeatureMenu.svelte`: the FEATURES entry knob itself now reflects the toggle state - a
  persistent "OVERBOOST"/"CRUISE" label chip beneath the FEATURES label, and the knob's
  glow switches from cyan/pink pulse to a steady orange when OVERBOOST is engaged.
- `qa_soak.mjs`: new `runCostVisibilityCheck()` - asserts, for every standing/enhancer
  mode, the correct badge (or explicitly no badge for Normal) and the correct effective
  bet figure are present. Verified standalone against a live dev server: all pass.

### Item 0b: reel mode ships as drop
- `frontend/src/lib/stores/reelMode.ts`: default flipped from `'strip'` to `'drop'`
  (unlocked change). Confirmed via a production preview build (not just reading the
  `import.meta.env.DEV` gate) that the dev-only reel-mode toggle - and the theme selector,
  same gate - render zero times in an actual production bundle.
- Updated every doc/comment claiming strip-as-default: `reelMode.ts`'s own header comment,
  `GameGrid.svelte`'s choreography doc-comment, `App.svelte`'s toggle comment.

### Buy-affordability boundary assert (Fable's ruling on trace finding 2)
- `qa_soak.mjs`: new `runBuyAffordabilityBoundaryCheck()` - at 150x the bet (affords the
  100x Buy Overdrive, not the 400x NITRO OVERDRIVE), asserts the bonus ACTIVATE stays
  enabled and super ACTIVATE stays disabled. Verified standalone: passes. This is what
  actually protects an unaffordable super buy - not the locked `gameStore.canBuyBonus`
  (hardcoded to 100x, known-wrong for super, recorded in `CLAUDE.md`'s new
  LOCKED_FILE_DEBTS section per Fable's ruling: no lock lift now, ride along with any
  future sanctioned `gameStore.ts` pass).

### CLAUDE.md: two new standing entries
- **LOCKED_FILE_DEBTS** section: records the `canBuyBonus` hardcode debt.
- **Convention (j), living handover**: formalises the pattern already in use (one
  `HANDOVER_<date>_Fable.md` per arc, dated appended sections, fresh document only at a
  new arc) as ratified standing policy, per Fable's explicit approval.

### Dossier and copy update (five-mode reality)
- `frontend/src/lib/config/fsModes.ts`: OVERBOOST's blurb now explicitly states "Debits
  1.25x every spin while ON" - the single source of truth, so this sentence appears
  automatically in both the FEATURES menu card and the paytable's Bet Modes row.
- `PaytableModal.svelte`: fixed a stale comment claiming only two modes are live; RTP
  section simplified to "RTP (All 5 Modes) 96.35%" instead of separately (and
  incompletely) labelling only Base/Bonus; added a new "Responsible Play" paragraph
  covering exactly the autoplay stop-conditions actually reachable in the HUD (stop-on-win,
  stop-on-feature, loss-limit, manual stop) - deliberately not overclaiming the
  single-win-limit condition, which is implemented in the store but not yet wired to any
  UI control.
- `SUBMISSION_DOSSIER.md`: fixed every stale "two-mode"/"both modes" reference (inventory
  rows 3 and 10, the compliance evidence map, section 7); added the five-mode table Fable
  specified (cost/RTP/notes per mode, OVERBOOST's per-spin debit and NITRO OVERDRIVE's 5x
  pre-rev both stated plainly); added fresh 2026-07-07 independent re-verification numbers
  for all five modes; added an explicit "no soundtrack claim" confirmation; flagged the
  still-owed REVIEW_EVENTS pass (statelessness artefact + per-mode replay IDs) in section 6.
- `COMPLIANCE_WATCH.md`: added an explicit 2026-07-07 supersession note for the stale
  "base-only"/"two-mode package" framing (2026-07-03 entries kept as historical record, not
  rewritten - the supersession note sits alongside them).
- `GAME_FACTS.md`: fixed the "Bet modes: Two:..." summary row to the five-mode reality;
  flagged (not silently completed) that §2's detailed Base/Bonus verified-mathematics
  tables predate FeatureMath v2 and a full three-mode expansion mirroring them is a
  separate follow-up.
- Confirmed no soundtrack/music claim exists anywhere in the current copy (swept before
  and after this pass).

## Verification
- `npm run build` / `svelte-check`: clean (same 6 pre-existing `node_modules` errors).
- `responsibleGambling.test.ts` 14/14, `roundInterpreter.determinism.test.ts` 58/58,
  `fsModes.drift.test.ts` 5/5, `scan_wallet_floats.mjs` PASS, `check_autoplay_confirm_gate.mjs`
  PASS, Google-Fonts-CDN grep empty.
- `scripts/validate_math.py`: ALL COMPLIANCE CHECKS PASS (unaffected - this session made no
  maths changes).
- Cost-visibility and buy-affordability-boundary checks verified standalone against a live
  dev server (full `qa:soak` run not executed - 25-30 minutes, deferred per the established
  pattern from the Wiring Integrity Audit).
- Visual proof: `reports/screens/item0-overboost-visibility/` (badge clipping bug caught
  and fixed, before/after), `reports/screens/dossier-copy-update/` (paytable RTP/Responsible
  Play/Bet Modes sections).
- Locked files confirmed untouched (`rgsService.ts`, `gameStore.ts`, `games/future_spinner/`
  diff empty) - this entire session is frontend/docs-only, no maths changes.

## Needs owner / Fable attention
- None blocking. Per Fable's sequencing, next up: the REVIEW_EVENTS pass (statelessness
  artefact + per-mode replay IDs), then the hygiene pass (Collection Meter relocation, dead
  component removal, the five stale-selector scripts, HANDOVER supersession, prompt
  archive, explicit-paths CLAUDE.md line, QA log archive). QA re-soak stays gated on audio.
- A full three-mode `GAME_FACTS.md` §2 expansion (mirroring the Base/Bonus detail tables
  for Cruise/OVERBOOST/NITRO OVERDRIVE) remains an explicitly-flagged, not-yet-done item.

## FOR THE NEXT SESSION
- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** used `fsModes.ts`'s
  single-source-of-truth pattern for the OVERBOOST per-spin disclosure sentence rather than
  editing the paytable and FEATURES menu copy separately; caught the badge clip-path bug by
  trusting a live rendered screenshot over Playwright's `isVisible()`/computed-style report,
  which showed the element as present but didn't prove it painted; kept the new Responsible
  Play copy scoped exactly to what the HUD's autoplay menu actually exposes today, rather
  than describing the full four-condition store contract.
- **Alternatives rejected:** duplicating the "1.25x per spin" sentence separately in
  `FeatureMenu.svelte` and `PaytableModal.svelte` (rejected - both already render from
  `fsModes.ts`'s single blurb field, so editing there was strictly better); a full
  `GAME_FACTS.md` rewrite adding complete Cruise/OVERBOOST/NITRO sections (rejected as
  larger than what this session's copy scope named - flagged as a follow-up instead of
  silently expanding scope or silently leaving it stale with no note).
- **Files touched:** `CLAUDE.md`, `frontend/src/lib/components/{HudOverlay.svelte,
  FeatureMenu.svelte, GameGrid.svelte, PaytableModal.svelte}`, `frontend/src/App.svelte`,
  `frontend/src/lib/config/fsModes.ts`, `frontend/src/lib/stores/reelMode.ts`,
  `frontend/scripts/qa_soak.mjs`, `SUBMISSION_DOSSIER.md`, `COMPLIANCE_WATCH.md`,
  `GAME_FACTS.md`, `FS_FableVerdicts2_2026-07-07_Prompt.md` (new), this report. Locked
  files confirmed untouched.
- **Open threads:** the REVIEW_EVENTS pass; the hygiene pass (expanded scope per Fable's
  ruling); the `GAME_FACTS.md` three-mode expansion; audio (still the one open creative
  blocker); QA re-soak (gated on audio, will pick up the three new qa_soak.mjs gates added
  across this session and the Wiring Integrity Audit).
