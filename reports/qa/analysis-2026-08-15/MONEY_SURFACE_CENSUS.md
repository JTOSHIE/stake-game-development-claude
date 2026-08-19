# Money surface census

JOB 1 of the analysis only pass, 2026-08-15. Read only: nothing in this pass was
changed. Australian English, no em dashes or en dashes.

**Tree under census: `main` at `90f21280`.** PR #123 is UNMERGED, so two of the fixes
it carries are NOT in this tree; each such row says so explicitly. Reading the census
against the PR branch would give a different answer for exactly two rows.

---

## 1. Method, and why it is not a grep

Every component under `frontend/src/lib/components/` plus `frontend/src/App.svelte` was
walked top to bottom including markup, and every place a number representing money
reaches the DOM was recorded. Formatter names were then used only to CLASSIFY what the
walk had already found, never to find it. That order matters: three of the sites below
carry no formatter call at all and a formatter grep cannot see them.

Two categories are kept apart, because conflating them is what makes a census useless:

- **CURRENCY AMOUNTS**, a value in the player's currency. These are the census proper.
- **MULTIPLIERS AND RATIOS** (`1.25x bet`, `5,000x`, `96.35%`, `1,024 ways`). Money
  adjacent, rendered by `fsCostLabel`, `fsRtpLabel`, `fsMaxWinLabel` or a bare
  `toLocaleString`, and correctly outside the money formatters. Listed in section 5 so
  the reader can see they were examined rather than missed.

---

## 2. The arithmetic that decides every row

Two formatters, and the difference between them is the whole census
(`frontend/src/lib/utils/currency.ts`):

| Formatter | Fraction digits | Renders 0.125 as |
|---|---|---|
| `formatBalance` (:422) | the currency's own precision, 2 for USD | **$0.13** |
| `formatWin` (:584) | `winFractionDigits` (:549) widens while the integer micros still carry value below that place, capped at 4 | **$0.125** |

**The stake can be fractional, and exactly one mode makes it so.** `spinCostMicros`
(`frontend/src/lib/stores/buyAffordability.ts:62`) is
`Math.round(bet * MODE_COST[mode] * CURRENCY_SCALE)`. MODE_COST is base 1, cruise 1,
antelite 1.25, bonus 100, super 400, VERIFIED against
`games/future_spinner/library/publish_files/index.json` and
`frontend/src/lib/config/fsModes.ts` lines 73, 83, 93, 103 and 113.

Against the REAL platform ladder (32 levels, minimum 0.01), 160 bet-by-mode combinations
exist and exactly **four** produce a stake that is not a whole cent, all of them antelite:

| Bet | Mode | Stake | Digits needed | `formatBalance` renders |
|---|---|---|---|---|
| 0.01 | antelite | 0.0125 | 4 | **$0.01**, understates by 0.0025 |
| 0.02 | antelite | 0.025 | 3 | **$0.03**, overstates by 0.005 |
| 0.05 | antelite | 0.0625 | 4 | **$0.06**, understates by 0.0025 |
| 0.10 | antelite | 0.125 | 3 | **$0.13**, overstates by 0.005 |

Against the hardcoded `BET_LEVELS` the same calculation yields two: antelite at 0.10
(0.125) and at 0.50 (0.625). **So the platform's real ladder DOUBLES the exposure**,
because it carries the three sub-ten-cent rungs our fallback ladder does not.

Wins add a second fractional source that no ladder can remove: the minimum paying
combination is 0.08x (one L3 way), so a win at the platform minimum bet is $0.0008.

---

## 3. The census: currency amounts

Legend for RISK: **YES** means the site can render a value whose true amount it cannot
express. **no** means either the value is always a whole cent at every ladder level and
mode, or the site already routes through `formatWin`.

### 3.1 Stake and cost quotes

| # | File and line | What the player sees | Formatter | RISK | Note |
|---|---|---|---|---|---|
| 1 | `HudOverlay.svelte:330`, rendered at :408, :627, :710, :906 | The BET window, showing the ante adjusted effective cost | `formatWin` over `effectiveCost` (:297) | no | The one cost surface that already widens. Four layout variants share the one label |
| 2 | `BetSelector.svelte:75` | Denomination picker footer, the effective BET | `formatBalance` | **YES** | **FIXED ON PR #123, NOT IN THIS TREE** (formatBalance to formatWin) |
| 3 | `FeatureMenu.svelte:98`, rendered at :352 | "THIS SPIN COSTS x" in the FEATURES bet bar | `formatBalance` | **YES** | **FIXED ON PR #123, NOT IN THIS TREE** |
| 4 | `FeatureMenu.svelte:86`, rendered at :440 | The OVERBOOST card's resolved cost, inline with "1.25x bet" | `formatBalance`, via a LOCAL copy of the cost expression | **YES** | Not fixed anywhere. The antelite card is the one card where the risk is live |
| 5 | `FeatureMenu.svelte:513` | The ACTIVATE button's tooltip on an unaffordable tier, the shortfall amount | `formatBalance` over `shortfallFor` (`buyAffordability.ts:83-87`) | **YES** | Not fixed. A `title` attribute, so no gate that reads text nodes can see it |
| 6 | `PaytableModal.svelte:162`, rendered at :341 | The COST sub value on every Bet Modes card, including OVERBOOST | `formatBalance`, via a SECOND local copy of the cost expression | **YES** | Not fixed. Carries `data-money="cur"`, so the fit gate sees the box but nothing checks the value |
| 7 | `BetSelector.svelte:78`, rendered at :171 | The money figure on each bet level chip | `formatBalance` | no | Ladder values are whole cents by definition |
| 8 | `BuyBonus.svelte:45`, rendered at :99 and :149 | The buy dialog PRICE | `formatBalance` over `spinCostMicros` | no | Buy tiers are 100 and 400, so any ladder rung times either is a whole cent |
| 9 | `PaytableModal.svelte:157`, rendered at :306 | The BUY FEATURE price callout | `formatBalance` | no | Same reason as row 8 |
| 10 | `WinBanner.svelte:280`, rendered at :351 | FEATURE PRICE on a bought round's banner | `formatBalance` over `boughtRound.priceMicros` | no | Buy tiers only |

### 3.2 Balances, wins and the ledger

| # | File and line | What the player sees | Formatter | RISK | Note |
|---|---|---|---|---|---|
| 11 | `HudOverlay.svelte:329`, rendered at :390, :617, :698, :886 | BALANCE, four layout variants | `formatWin` | no | Widens, so a balance carrying a sub-cent remainder renders truly |
| 12 | `HudOverlay.svelte:367`, rendered at :394, :621, :702, :895 | WIN, four layout variants, counting up | `formatWin` with digits fixed once from the settled value | no | The fixed digit count is deliberate, so the width does not shimmy mid count |
| 13 | `HudOverlay.svelte:334` and :368 | The mini player's compact BALANCE and WIN | `formatBalanceCompact` behind `fitMoney` | no | Compact form is a deliberate below-floor fallback, ruled in R060 |
| 14 | `WinDisplay.svelte:108` | The WIN panel's large count up amount | `formatWin` | no | |
| 15 | `WinBanner.svelte:229-230`, rendered at :345 | The celebration band headline amount | `formatWin`, or `formatBalanceCompact` when the fit reports overflow | no | Two paths, both correct for sub-cent |
| 16 | `WinBreakdown.svelte:82`, rendered at :95 | The per way pay figure in the breakdown strip | `formatWin` | no | |
| 17 | `FreeSpinsPresentation.svelte:148`, rendered at :539 | The per spin win pop during free spins | `formatWin` over centibets | no | |
| 18 | `BonusInstrumentColumn.svelte:53`, rendered at :75 and :102 | TOTAL WIN on the bonus instrument plate | `formatWin` | no | |
| 19 | `SessionPanel.svelte:116` | **TOTAL WAGERED** in the session ledger | `formatBalance` | **YES** | Not fixed. Accumulates the spin cost in micros, so antelite drift compounds across the session. See section 4 |
| 20 | `SessionPanel.svelte:125` | TOTAL WON in the session ledger | `formatWin` | no | Corrected by R057 for exactly this class |
| 21 | `SessionPanel.svelte:72`, rendered at :88, :126 and inside the reality check body at :139 | NET RESULT, and the pinned corner NET | `formatWin` over `rgNetMicros` | no | Net inherits wagered's micros, which are exact; only the WAGERED row's rendering is lossy |
| 22 | `ReplayMode.svelte:611` | The replay figures row, the base bet | `formatBalance` | no | A ladder value |
| 23 | `ReplayMode.svelte:614` | The replay figures row, TOTAL SPENT after the equals sign | `formatBalance` over `totalBetSpentMicros` | **YES** | Not fixed. An antelite replay at a sub-ten-cent bet misstates the spend on the surface a REVIEWER opens |

### 3.3 Money that reaches the DOM with no formatter at all

| # | File and line | What the player sees | Path | Note |
|---|---|---|---|---|
| 24 | `HudOverlay.svelte:512`, :759, :976 | The autoplay LOSS LIMIT amount field, with the currency symbol beside it | `<input type="number" min="1" step="1" bind:value={lossLimitAmount}>`, raw two way binding | **Bypasses both formatters entirely.** The symbol honours the trailing rule, the NUMBER does not pass through any money code. `step="1"` also means the smallest expressible loss limit is one whole currency unit, which is 100 minimum bets on the real ladder |

---

## 4. The SessionPanel premise, quoted and tested

`frontend/src/lib/components/SessionPanel.svelte:120-122`, verbatim:

> Wagered stays formatBalance because stakes are bet ladder values, whole currency
> units by construction.

**FALSIFIED by antelite at 1.25x, and the falsification does not need the real ladder.**

The row renders `$rgSession.wageredMicros`, and that field accumulates
`Math.max(0, Math.round(costMicros))` in `rgRecordSpin`
(`frontend/src/lib/stores/responsibleGambling.ts:176`), called from `App.svelte:808`,
:812 and :1713 as `rgRecordSpin(Math.round(cost * CURRENCY_SCALE), ...)` where `cost` is
`spinCostMicros(bet, mode) / CURRENCY_SCALE` (`App.svelte:732-733`, :1588-1589).

So the accumulated value is the REAL debit including the mode cost, not the bet. One
antelite spin at the 0.10 rung adds 125,000 micros, and `formatBalance` renders that as
$0.13. The premise is wrong in both of its clauses:

- **"bet ladder values"**: the row does not hold a ladder value, it holds a ladder value
  times a mode cost.
- **"whole currency units"**: 0.125 is not a whole currency unit, and neither is any of
  the four antelite products in section 2.

The drift is one sided per spin but compounds: a hundred antelite spins at the 0.10 rung
wager $12.50 and the ledger shows $13.00.

**Nothing was changed.** The comment and the formatter are both recorded here as found.

---

## 5. Multipliers and ratios, examined and correctly outside the money formatters

Listed so a reader can see the boundary was drawn deliberately: `fsCostLabel`
(`fsModes.ts:198`) at `FeatureMenu.svelte:390`, :440, :445, :498 and
`PaytableModal.svelte:340`; `fsRtpLabel` (:182) at `FeatureMenu.svelte:526`,
`BuyBonus.svelte:153`, `PaytableModal.svelte:345` and :407; `fsMaxWinLabel` (:188) at
`PaytableModal.svelte:357` and :408; `WinDisplay.svelte:111` and `WinBanner.svelte:347`
for the `Nx BET` line; `BonusInstrumentColumn.svelte:107` for the meter;
`MaxWinCelebration.svelte:160` for the 5,000x wincap figure;
`PaytableModal.svelte:208` for the 1,024 ways callout, :252 for the per way pay
multipliers and :282 for the trigger table integers; and `ReplayMode.svelte:613` for the
bare cost multiplier between the two money figures. All of these are ratios rather than
amounts, and all of the label helpers route through `toLocaleString` with an explicit
locale, which is the machine-tell requirement rather than a money requirement.

`App.svelte` renders NO money itself. Lines 2254, 2272 and 2314 hand raw numbers to
`WinDisplay` and `BonusInstrumentColumn`, which format them. `WinCelebration.svelte` and
`ResumeOffer.svelte` render no monetary value at all.

---

## 6. Fable's count, confirmed and extended

**Fable reported five cost sites, of which the stand back fixed two. CONFIRMED on both
halves, for the cost quote family**: rows 2, 3, 4, 5 and 6 above are exactly five
pre-spin cost quotes, and PR #123 changes exactly two of them, rows 2 and 3, both from
`formatBalance` to `formatWin` (verified by `git diff 90f21280 59c4c88e`).

**And the census finds two more money surfaces that a cost-site grep could not see**,
because neither is a cost quote:

- **row 19**, the session ledger's TOTAL WAGERED, which is a stake ACCUMULATOR rather
  than a quote, and whose own source comment asserts the opposite of what it does; and
- **row 23**, the replay view's TOTAL SPENT, which is not in the live game at all and is
  the figure a platform reviewer sees beside the platform's own Bets panel.

Plus **row 24**, the autoplay loss limit input, which reaches the DOM with no formatter
on either side and would not appear in any formatter-based enumeration.

**So the true figure at `90f21280` is seven fractional-risk currency surfaces**, five of
which are cost quotes, and two of the seven are fixed only on an unmerged branch.

---

## 7. What this census does NOT establish

- **Whether `Math.round` or `Math.floor` is the correct conversion.** Both instruction
  documents say floor and the shipped code uses round at every non-locked site. That is
  a money-path ruling under convention (l.8) and is recorded in FINDINGS.md, not decided
  here.
- **Whether the platform would reject an off-ladder bet.** The fallback ladder question
  is JOB 4.
- **What any of this looks like rendered.** No browser was driven in this pass.
