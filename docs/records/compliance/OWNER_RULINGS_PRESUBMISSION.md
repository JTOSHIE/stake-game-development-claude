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

## A3. A blocked-settle banner reuses a message whose middle sentence is false

Added 2026-08-10, and it is a wording call rather than a defect.

When a recovered round is presented and its `end-round` then fails, the game now
engages the live guard: every bet route is blocked and the existing translated
banner is shown. Before this it was SILENT, which was strictly worse: the player
saw their winning round, the balance never moved, nothing said so, and SPIN could
place a real bet on top of a round the platform was still holding open.

The banner reuses `errSessionUnavailable`, the only keyed message of its kind and
the only one that ships in all sixteen locales:

> Game unavailable. Your session could not be verified. Please reload or contact support.

Sentences one and three are true and are the correct instruction: reloading
re-runs recovery, and `end-round` is idempotent on the session's active round, so
a reload really can settle it. **Sentence two is false in this case.** The session
authenticated perfectly well; what failed was the settle.

It was shipped anyway, deliberately, because the alternative was continuing to
say nothing at all, and because inventing a new sentence in fifteen locales is
exactly what convention forbids a builder from doing. But under (l.3) and the
standing mandate that nothing player-visible may read as machine-generated, a
wrong explanation is a real defect and it is recorded here rather than left in a
commit message.

**The ruling needed:** whether to author a distinct message for this state, in
which case it joins the translation list in section B, or to accept the reuse.

---

## D. The wallet deadline constant, which has no upstream number to inherit

Added 2026-08-10, alongside A3.

`frontend/src/lib/services/walletTimeout.ts:40`:

> `export const WALLET_TIMEOUT_MS = 15_000`

**The defect it closes**, measured against the shipped dist with a stub whose
`/wallet/play` never responds: the spin control held its spinning state for **90
seconds** with the stake gone from the displayed balance, no banner, no error,
and a second click doing nothing because `handleSpin` returns early while
`$isSpinning`. `_withRetry` could not help, because it retries REJECTIONS and a
stall never rejects.

**Why the number is ours rather than inherited.** The pinned official client sets
no deadline on its wallet calls at all, so there is no platform figure to adopt
and nothing in `docs/stake-engine-live/` states an expected latency.

**The trade it makes, stated plainly because it is a real cost.** A wallet merely
SLOW past 15s has its round abandoned client-side while the server settles it,
and the player is blocked until they reload. That was chosen deliberately: the
outcome of the round is UNKNOWN at that point, and blocking every bet route is
what stops a second stake going out against a wallet whose state we can no longer
see. Reloading re-authenticates and `recoverSession` settles whatever round was
left open, which is what the banner asks for.

**The ruling needed:** whether 15s is right, measured against whatever p99 the
platform quotes for `/wallet/play`. One constant, tuned in one place.

**RULED 2026-08-10, R041. 15s STANDS.** The ruling confirms there is no platform
p99 and no client deadline to inherit, so the figure is ours by absence rather
than by preference. **It carries a replacement rule:** if the platform ever
publishes either figure, the constant becomes the GREATER of 3x the published
p99 or the published deadline. That condition is recorded beside the constant in
`walletTimeout.ts` as well as here, so a reader of the code finds it without
needing to know a ruling exists.

---

## E. R041's apostrophe instruction cannot be obeyed in French, and the two halves disagree

Raised 2026-08-10 while executing R041. **The ratified wording shipped exactly as
written; only the typography is in question, and no builder resolved it.**

**The instruction**, R041 TASK 1, quoted verbatim:

> Escape apostrophes per each file's existing convention; typographic apostrophes below are intentional.

**Why both halves cannot hold for `fr`.** R041's French replacements for
`rulesMaxWin` and `rulesScatterMult` use the typographic apostrophe U+2019
("qu’il accorde", "n’importe où"). The rest of the `fr` block in
`prose.locales.ts` uses the escaped straight form U+0027. Honouring the second
half therefore breaks the first.

**Measured, not assumed.** After applying the ruling, the `fr` block carries
U+2019 at lines 374 and 375 and escaped U+0027 at lines 366, 372, 380 and 396.
Only `fr` is affected: `tr` carries no typographic apostrophe at all, and no
other locale mixes.

**It is player-visible in one view**, which is what makes it a defect rather
than a tidiness question. `rulesSymbolValues` (straight, line 372) renders two
lines above `rulesScatterMult` and `rulesMaxWin` (curly, 374 and 375) in the
same French paytable rules block. The standing mandate names this exact class:
*"straight and curly quotes mixed in one view"*.

**A gate should have caught it and could not.** `machine_tell_gate.mjs` encodes
mixed apostrophes per locale, and its own block regex has always matched
`prose.locales.ts`'s `  fr: {` shape, but the file was never passed in: the scan
read `translations.ts` alone. So the longest player-facing sentences in the
product, the paytable rules and the disclaimer, were never scanned for the one
defect class most likely to appear in them. **That blind spot is now closed**,
the `fr` mixing is frozen as a single named entry, and both directions are
checked, so when this is ruled on the entry must be removed or the gate fails.

**The ruling needed, and it is one line.** Either:

- **convert R041's two French strings to the escaped straight form**, which
  changes no word and makes the block self-consistent; or
- **convert the whole `fr` block to typographic apostrophes**, which is
  consistent the other way but edits prose R041 did not rule on.

The builder did neither, because rewriting ratified compliance text is not a
builder's call and neither is editing prose outside the ruling.

---

## C. One thing that cannot be settled from this repository at all

`rgsService.ts` maps a platform error to a player-facing message by reading a
field of the 400 response body. WHICH field a real RGS uses decides whether
players ever see the correct session and authentication messages, and nothing in
`docs/stake-engine-live/` states it. One captured 400 body from a real
`/wallet/authenticate` or `/wallet/play` settles it in a single line. Until then
it is UNKNOWN rather than assumed, per rule 16.
