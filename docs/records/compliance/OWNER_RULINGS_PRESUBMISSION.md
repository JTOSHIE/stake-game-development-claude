# Pre-submission rulings the builder cannot make

Written 2026-08-10. Every item here was verified from source before being written
down, and each states the evidence rather than a recommendation dressed as one.

Two classes:

- **A. Rules text that disagrees with the maths.** These are disclosure claims
  about the maths package, so convention (l.8) sends them to the owner and Fable
  rather than letting a builder rewrite them.
- **B. Player-facing English that never reached the translation layer.** Fixing
  any of these needs real text in fifteen locales. Convention forbids inventing
  translations, and this project has already had a fabricated attribution
  retracted once, so they are listed for a translator rather than guessed at.

---

## A1. The rules say the 5,000x cap is "per spin". The maths caps the ROUND.

**What the player reads**, `frontend/src/lib/i18n/prose.ts:118`, and the fifteen
localised siblings:

> Maximum win per spin is capped at 5,000× your total bet.

**What the maths does**, `games/future_spinner/game_config.py:52`:

> `_WINCAP = 5000.0     # Maximum payout multiplier (x bet amount), hard cap both modes`

and line 28 describes the wincap band as *"maximum-win rounds (free spins
reaching 5,000x)"*, i.e. a property of the ROUND.

**Confirmed against the shipped books, not just the config.** The payout
reconciliation gate built on 2026-08-09 decoded all five books. `books_base`
round 1020 presents wins totalling **977,560 centibets** and pays
**`payoutMultiplier` = 500,000**, the cap. The round was capped, not the spin.

The cap is in fact applied at BOTH levels: each individual win is
`min(formula, 5000x)`, and the round is `min(sum of those, 5000x)`.

**Why the wording matters.** "Per spin" invites a player to conclude that a
sixteen-spin feature could pay up to sixteen times the cap. It cannot: the whole
round stops at 5,000x. The current sentence understates the constraint on the one
figure a maths reviewer checks first.

**The ruling needed:** whether to restate it, and in whose words. A wording that
matches the maths would be something like "maximum win per round", but the exact
phrasing is a compliance statement and needs to come from the owner or Fable, in
all sixteen locales.

---

## A2. The scatter rule describes a multiplier. The maths adds an award.

**What the player reads**, `frontend/src/lib/i18n/prose.ts` (`rulesScatterMult`),
and its fifteen localised siblings:

> 3, 4, or 5 SCATTERs anywhere apply a 1×, 3×, or 10× multiplier to your total bet win.

**What the maths does**, `games/future_spinner/game_config.py`, the
`scatter_multiplier_table` and the comment directly above it:

> `3: 1.0, 4: 3.0, 5: 10.0`
> "Awards are multiples of TOTAL BET, paid on the spin the scatters land."

**Confirmed against the shipped books.** The reconciliation gate computes a
scatter win as `award x globalMult x 100` centibets, with **no reference to any
other win on the board**, and that formula reconciles all 3,618,404 wins across
the five books with zero disagreements. It is an INSTANT AWARD, added
independently. It is not a multiplier applied to a win.

**Why the wording matters.** As written, a player with no other win on the board
could reasonably read "1x multiplier to your total bet win" as multiplying zero
and paying nothing. The game pays them 1x their total bet.

**The ruling needed:** the corrected phrasing, in all sixteen locales.

---

## B. Eleven player-facing strings that render English to all sixteen locales

Frozen in `frontend/scripts/hardcoded_string_baseline.json` and held by
`frontend/scripts/hardcoded_string_gate.mjs`, which fails on any NEW one. They
are listed here with their English text so a translator can work from one page.

| Where | English shown to every locale | Note |
|---|---|---|
| `HudOverlay.svelte`, 4 sites | **Mute** / **Unmute** | The nearest shipped key is `hudSound` = "SOUND", a noun. This is a toggle verb, so it cannot be reused. |
| `FeatureMenu.svelte`, 2 sites | **per spin** / **bet** | The cost line, as `{$isSocial ? 'per spin' : 'bet'}`. |
| `PaytableModal.svelte` | **Scatters** | A column header beside two keyed siblings, `colFreeSpins` = "Free Spins" and `colInstantAward`. `symbolScatter` = "SCATTER" exists but is UPPERCASE and would break the casing of that header row. |
| `ReplayMode.svelte` | **Bet** / **Play** | The replay cost line. |
| `ReplayMode.svelte` | **Currency** / **Token** | |
| `ReplayMode.svelte` | **Mode:** | |
| `FreeSpinsPresentation.svelte` | **Overdrive Free Spins** | An `aria-label`, so a screen reader announces English over correctly translated content. |
| `WinBreakdown.svelte` | **N ways** | No `ways` key exists anywhere. |
| `fsModes.ts` | **base bet** / **base play** | The trailing words of `maxWinVsBaseBetLabel`. The NUMBER in that label was made locale-aware on 2026-08-10; only these two words remain. |

**THE SOCIAL CONDITIONALS ARE NOT THE COMPLIANCE LAYER**, and this is the part
most likely to be misread by whoever picks this up. `{$isSocial ? 'per spin' :
'bet'}` looks like the sweepstakes vocabulary substitution doing its job. It is
not. That layer is `sv()` in `frontend/src/lib/i18n/vocabulary.ts`, driven by the
platform's own 39-row prohibited-terms table. These are hand-rolled copies of it,
English in BOTH branches, so they are untranslated AND bypassing the compliance
layer. `FeatureMenu.svelte`'s own comment says exactly this about a sibling that
was already corrected the same way.

---

## C. One thing that cannot be settled from this repository at all

`rgsService.ts` maps a platform error to a player-facing message by reading a
field of the 400 response body. WHICH field a real RGS uses decides whether
players ever see the correct session and authentication messages, and nothing in
`docs/stake-engine-live/` states it. One captured 400 body from a real
`/wallet/authenticate` or `/wallet/play` settles it in a single line. Until then
it is UNKNOWN rather than assumed, per rule 16.
