# Session Report: ITEM 4, JOB 9b social-mode string audit (flag-only)

- **Date:** 2026-07-14
- **Model / effort:** Claude Sonnet 5, default effort.
- **Branch:** `claude/social-audit-item4` (off `main`, independent of ITEMS 0-3).
- **Source:** `FS_NextWorkOrder_2026-07-14_Prompt.md`, ITEM 4. Flag-only per the
  brief: no strings changed, Fable rules on wording before anything is edited.

## What changed this pass

**`reports/qa/social_mode_string_audit_2026-07-14.md`** (new). First mapped
how the existing social-mode system actually works (two mechanisms: `t()` +
`SOCIAL_OVERRIDES` in `translations.ts` for i18n keys, and inline `$isSocial`
ternaries in eight individual components), then swept for player-facing
strings that fall outside both.

## Real findings (flagged, none acted on)

1. **Most significant: `FS_MODES` blurb text (`config/fsModes.ts`) bypasses
   both social-mode mechanisms entirely.** `PaytableModal.svelte` and
   `FeatureMenu.svelte` both render `m.blurb`/`m.label` directly, with no
   `tr()` call and no `$isSocial` branch anywhere in either consumer. Two of
   the five modes' blurbs use the literal word **"Buy"** ("Buy a guaranteed
   Overdrive Free Spins entry", "Buy a rich entry with the Overdrive meter
   pre-revved to 5x") - CLAUDE.md's own record of the live prohibited-terms
   table names "buy" explicitly as banned on stake.us. The `bonus` mode's
   display label, `'Buy Overdrive'`, has the same issue. `overboost`'s blurb
   also uses "Debits" (account-money language).
2. **`scatter3`/`scatter4`/`scatter5`** (`translations.ts`, rendered live via
   `WinDisplay.svelte` through `WinPod.svelte`/`ReplayMode.svelte` - checked
   this before treating it as a live finding, not dead code): no
   `SOCIAL_OVERRIDES` entry for any of the three; the text is also stale
   relative to the shipped feature (mentions only the instant scatter
   multiplier, not the free-spins award, across all 16 locales); and **all
   48 instances (3 keys x 16 locales) contain an em dash**, a direct
   CLAUDE.md convention (a) violation independent of the social-mode
   question - confirmed across every locale block, not assumed from the
   English source alone.
3. **Minor, hygiene not compliance: `buyBonusDesc`** has both a base string
   and a `SOCIAL_OVERRIDES` entry, but zero consumers anywhere in the current
   component tree - dead code that looks maintained. Noted for a future
   cleanup pass, not a compliance risk since nothing renders it.
4. **Everything else checked came back correct**: `WinBanner.svelte`,
   `WinCelebration.svelte`, `MaxWinCelebration.svelte`, `BuyBonus.svelte`,
   `IntroSplash.svelte`, `FreeSpinsPresentation.svelte`, `SessionPanel.svelte`,
   `PaytableModal.svelte`'s own rules/disclaimer text, and `App.svelte`'s
   RGS-error-message scrubber all already branch correctly on `$isSocial` or
   route through `SOCIAL_OVERRIDES`.

## Verification

- Enumerated every file using `isSocial` (`grep -rn`) and read each one in
  full to confirm what it actually does, not just that it references the
  store.
- Separately grepped for hardcoded gambling-language strings
  (`'Buy `/`"Buy `/`Bought`/`purchase`/`Purchase`/`cost of`/`bought`/`wager`/`gambl`)
  across `frontend/src/lib/config/*.ts`, every component, and `App.svelte`,
  to find strings outside both existing social-mode mechanisms rather than
  only auditing files that already reference `isSocial`.
- Confirmed `WinDisplay.svelte` is genuinely mounted before calling
  `scatter3/4/5` a live finding.
- Confirmed `buyBonusDesc` has zero consumers before calling it dead code.
- Confirmed the em-dash finding across all sixteen locale blocks in
  `translations.ts`, not extrapolated from English alone.
- Own prose in the audit report contains no em/en dashes; every em dash
  present is inside a quoted, verbatim example of the existing problematic
  string (necessary to accurately show the finding).
- Locked files confirmed untouched: `git diff --stat -- frontend/src/lib/services/rgsService.ts frontend/src/lib/stores/gameStore.ts games/future_spinner/ .claude/settings.json` is empty.

## Not done this pass (by design, per the brief)

No strings edited anywhere - this is a flag-only pass. Findings 1 and 2 need
Fable's ruling on replacement wording before any change lands.

## FOR THE NEXT SESSION

- **Model/effort:** Claude Sonnet 5, default effort. **Approach:** mapped the
  existing two-mechanism system first so the audit could precisely name
  what's *outside* it, rather than re-auditing strings that already have
  working social-mode handling. Checked liveness/dead-code status for each
  finding before writing it up (WinDisplay.svelte's mount path, buyBonusDesc's
  consumer count) rather than assuming from file/key names alone.
- **Alternatives rejected:** fixing the "Buy" strings in `fsModes.ts` directly
  in this pass (rejected - explicitly out of scope per the brief: flag-only,
  Fable rules on wording first); treating `scatter3/4/5`'s lack of a
  `SOCIAL_OVERRIDES` entry as an obvious oversight requiring a fix (rejected
  - the text doesn't contain an explicit bet/win/balance token, so whether it
  needs one is a judgement call for Fable, not a settled compliance gap).
- **Files touched:** `reports/qa/social_mode_string_audit_2026-07-14.md`
  (new), `FS_NextWorkOrder_2026-07-14_Prompt.md` (saved verbatim on this
  branch too, per convention), this report + its dated archive copy. Locked
  files untouched; no frontend source files edited.
- **Open threads:** this closes ITEM 4, the last of the four ordered items in
  the 2026-07-14 work order. Only the sanctioned locked pass (books
  regeneration and cleanup) remains from this work order. ITEM 0's two
  flagged findings and ITEM 2's win-count-up tier question still await review
  on their own open branches/PRs.
