# Social-mode string audit, 2026-07-14 (JOB 9b, ITEM 4)

Flag-only, per the brief: no strings changed in this pass. Fable rules on
wording before anything here is edited. This document lists every
player-facing string this pass found that needs a stake.us social-casino
review, with enough context to make the call without re-deriving it.

## How the existing system works (for context)

Most of the game's social-mode handling already goes through one of two
mechanisms:

1. **`t(locale, key, mode)`** (`frontend/src/lib/i18n/translations.ts`):
   looks up a key's base-locale string, but if `mode === 'social'` AND the
   key exists in `SOCIAL_OVERRIDES`, returns the override instead. Applies
   across all 16 locales via one shared override map.
2. **Inline `$isSocial` ternaries** in individual components (`WinBanner.svelte`,
   `WinCelebration.svelte`, `MaxWinCelebration.svelte`, `BuyBonus.svelte`,
   `IntroSplash.svelte`, `FreeSpinsPresentation.svelte`, `SessionPanel.svelte`,
   `App.svelte`'s RGS-error-message scrubber) - each decides its own
   social/real text directly.

Both mechanisms are already well used. The findings below are strings that
fall **outside** both mechanisms, or that sit inside mechanism 1 without an
override entry despite using gambling-framed language.

## Finding 1 (most significant): `FS_MODES` blurb text bypasses both mechanisms entirely

`frontend/src/lib/config/fsModes.ts` - the single source of truth both the
FEATURES menu (`FeatureMenu.svelte`) and the paytable's Bet Modes section
(`PaytableModal.svelte`) render `m.blurb` from directly, with **no** `tr()`
call and **no** `$isSocial` branch anywhere in either consumer:

```
cruise:    'A smoother ride: more frequent smaller wins, same 96.35% RTP.'
overboost: 'Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.'
bonus:     'Buy a guaranteed Overdrive Free Spins entry.'
super:     'Buy a rich entry with the Overdrive meter pre-revved to 5x.'
```

- **`bonus` and `super` both use the literal word "Buy"** - CLAUDE.md's own
  record of the live prohibited-terms table names "buy" explicitly as banned
  on stake.us, with "get bonus" / "instantly triggered" / "can be played for"
  as suggested replacements. These two strings would reach a stake.us player
  completely unmodified today.
- `overboost`'s blurb uses "Debits" - money-account language, not on the
  explicit banned list but in the same spirit as "bet"/"balance" (both of
  which the existing `SOCIAL_OVERRIDES` map treats as needing replacement
  elsewhere in the same UI).
- `cruise`'s "wins" mirrors the exact word `SOCIAL_OVERRIDES` already
  remaps to "prize" everywhere else it appears (`win: 'PRIZE'`).
- The label `'Buy Overdrive'` (the `bonus` mode's display name, shown on its
  FEATURES menu card and in the paytable) also contains "Buy" directly.

**Not fixed in this pass** - flagging for Fable's wording call, per the
brief. If a fix is wanted, the natural pattern is the same one already used
everywhere else: either add per-mode social variants to `FS_MODES` (a
`blurbSocial`/`labelSocial` field) or route these through `tr()` +
`SOCIAL_OVERRIDES` like every other Overdrive string already does.

## Finding 2: `scatter3`/`scatter4`/`scatter5` - live, un-overridden, and stale

`WinDisplay.svelte` (mounted via `WinPod.svelte` and `ReplayMode.svelte`,
confirmed live, not dead code) reads these three keys directly via
`scatterKey` and `tr()`. English source:

```
scatter3: '3 SCATTERS — 1× MULTIPLIER'
scatter4: '4 SCATTERS — 3× MULTIPLIER'
scatter5: '5 SCATTERS — 10× MULTIPLIER!'
```

- **No entry in `SOCIAL_OVERRIDES`** for any of the three. The English text
  doesn't contain an explicit "bet"/"win"/"balance" token, so it may not
  strictly need one under the existing override philosophy - but that's a
  judgement call, not a settled fact, and is exactly what this flag-only
  pass exists to surface rather than decide.
- **Stale relative to the shipped feature**: the true mechanic (per
  CLAUDE.md's "True game facts") is "3/4/5 scatters award 8/12/16 free spins
  AND pay an instant 1x/3x/10x total bet" - these three strings mention only
  the instant multiplier, not the free-spins award, in all 16 locales.
- **Em dash present in all 48 instances** (3 keys x 16 locales) - a direct
  CLAUDE.md convention (a) violation ("no em dashes or en dashes anywhere"),
  independent of the social-mode question. Confirmed across every locale
  block in `translations.ts`, not just English:
  `'3 متناثر — مضاعف 1×'` (ar), `'3 SCATTER — 1-FACH'` (de), and so on for
  all sixteen.

## Finding 3 (minor, hygiene not compliance): `buyBonusDesc` is dead code

`buyBonusDesc: 'Guaranteed scatter spin — 100× bet'` has both a base string
and a `SOCIAL_OVERRIDES` entry (`'Guaranteed scatter play, 100× play'`), but
`grep -rn "buyBonusDesc"` across every `.svelte` file in `frontend/src/lib/components/`
and `App.svelte` finds **zero consumers** - the key is defined but never
rendered anywhere in the current component tree. Not a social-mode risk
(nothing reads it), but noted since a translation key that looks
maintained-and-correct is easy to mistake for load-bearing when it isn't -
worth a cleanup pass whenever this file is next under a sanctioned edit for
something else, not urgent on its own.

## Everything checked and found already correct

`WinBanner.svelte`, `WinCelebration.svelte`, `MaxWinCelebration.svelte`,
`BuyBonus.svelte`, `IntroSplash.svelte`, `FreeSpinsPresentation.svelte`,
`SessionPanel.svelte`, `PaytableModal.svelte`'s own rules/disclaimer text
(not the `FS_MODES` blurbs it also renders, see Finding 1), and
`App.svelte`'s RGS-error-message scrubber (`errorDisplay`, scrubs
"Insufficient balance"/"balance"/"bet(s)"/"purchase(s)"/"buy"/"cost(s)" from
the locked RGS's raw error strings before display) all already branch
correctly on `$isSocial` or route through `SOCIAL_OVERRIDES`.

## Verification

- `grep -rn "isSocial"` across every component + `App.svelte` to enumerate
  every file with existing social-mode handling, then read each one to
  confirm what it does (not just that it does something).
- `grep -rn "'Buy \|\"Buy \|Bought\|purchase\|Purchase"` and a second pass
  for `"cost of"`/`"bought"`/`"wager"`/`"gambl"` across
  `frontend/src/lib/config/*.ts`, every component, and `App.svelte`, to find
  hardcoded gambling-language strings outside both existing mechanisms.
- Confirmed `WinDisplay.svelte` (home of `scatter3/4/5`) is actually mounted
  (via `WinPod.svelte`/`ReplayMode.svelte`) before treating it as a live
  finding rather than dead code.
- Confirmed `buyBonusDesc` has zero consumers before calling it dead code,
  rather than assuming from the name alone.
- Confirmed the em dash finding across all 16 locale blocks in
  `translations.ts`, not just the English source.

## Not done this pass (by design, per the brief)

No strings edited. This is a flag-only pass; Fable rules on wording for
Finding 1 and Finding 2 before any change lands.
