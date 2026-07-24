# XEC/SC currency readiness audit, 2026-07-25

Part 3 of the platform-delta pass. Audits frontend currency handling end to end,
implements sweepstakes display driven by session data, and runs social-string
conformance against the SC display combination.

Harness: `frontend/scripts/currency_conformance.mjs`.
Evidence: `reports/qa/currency_conformance_2026-07-25.json`,
screenshots in `reports/screens/currency-readiness/`.

## Headline

Currency conformance **PASSES** on every assertion after the fixes below. The same
run surfaced **six genuine social-string violations** that are unrelated to currency
and are reported for a Fable wording ruling rather than auto-corrected.

## 1. XEC could not be verified, and this matters for scope

The brief specifies XEC/SC readiness. No first-party source for **XEC** could be
found: not on the live docs, not in the StakeEngine/docs repository, not in the
wallet API reference. The full search record is in
`docs/stake-engine-live/2026-07-25/DELTA_NOTES.md`.

What is documented is `XSC` (Stake Cash, symbol **SC**) and `XGC` (Gold Coin, symbol
**GC**). This audit therefore implements the **SC/GC sweepstakes family**, which is
what the brief's display requirement ("SC 1,000 style") actually describes, and does
not invent an XEC code. If XEC turns out to be a real third code, the work here
extends to it by adding one row to `VIRTUAL_CURRENCIES`, because every display path
now routes through that single table.

## 2. The B1 change, re-inspected as instructed

**Verdict: B1 was correct and remains correct.**

B1 (commit `ecfecc3`, recorded in `reports/archive/2026-07-24_owner-audit-remediation.md`)
set `currencyDisplay: 'narrowSymbol'` on the `Intl.NumberFormat` call, which is what
turns `US$1.00` into `$1.00`. This is a **derived** symbol: Intl resolves it from the
currency code the platform sent. It is not a hardcoded glyph substitution, and it
satisfies the brief's "must derive from platform-provided currency display
information, never a hardcoded symbol". No `US$` literal survives anywhere in the
repository or its history for `frontend/src`.

The problem was never B1. It was that B1 improved **one** of the two currency
implementations, and nobody noticed there was a second.

## 3. Defects found and fixed

### 3.1 Raw platform code leaked to players in replay mode. Real, player-visible.

`replayService.currencySymbol()` carried its own hardcoded ten-entry symbol map,
entirely separate from `utils/currency.ts`. Its sweepstakes key was **`SC`**. The RGS
authenticate response sends **`XSC`**. So a genuine sweepstakes session in replay mode
missed the map, fell through to the `?? \`${code} \`` fallback, and rendered:

> Bet: **XSC 1.00**

printing the raw platform code at the player. The stake.us jurisdiction rules
explicitly prohibit this class of exposure, and the brief states the code must never
be shown.

Fix: `currencySymbol()` is now a one-line delegation to `currencySymbolFor()` in the
shared module. The two tables cannot drift again because there is only one.

### 3.2 Both code forms are live, and only one was handled

Handling only `XSC` would have fixed 3.1 and opened the mirror-image hole.
`replayService.parseReplayParams()` defaults the currency itself:

```
const currency = params.get('currency') ?? (social ? 'SC' : 'USD')
```

so the **short** form `SC` genuinely flows through the system whenever a replay URL
omits the currency parameter. `socialMode.ts` already recognised all four forms
(`XGC`, `XSC`, `SC`, `GC`) for exactly this reason. `VIRTUAL_CURRENCIES` now keys all
four, and the harness asserts the alias resolves identically.

### 3.3 Sweepstakes amounts had no thousands separators

`formatBalance` formatted XSC with `amount.toFixed(2)`, producing `SC 1000.00`. The
brief specifies `SC 1,000` style. Now formatted through `toLocaleString` with fixed
fraction digits, producing `SC 1,000.00`.

`XGC` separately used `Math.round()`, discarding cents, while the platform documents
GC with 2 decimals. Both virtual currencies are now consistent at 2 decimals.

### 3.4 Replay hardcoded two decimal places

`ReplayMode.svelte` rendered `baseBet.toFixed(2)`, so a zero-decimal currency showed
`¥1.00` instead of `¥1`. It now routes through `formatBalance`, which applies the
zero-decimal set (JPY, IDR, KRW, VND, CLP).

### 3.5 Replay printed the raw code as a labelled field

`ReplayMode.svelte` rendered `Currency: {params.currency}` verbatim. The replay
requirements do list "Currency display" under Keep/Show, so the field stays, but two
constraints now apply: virtual currencies show the **symbol** rather than the code,
and the label itself switches to "Token" in social mode, because **"currency" is on
the prohibited-terms table** (currency -> token).

## 4. Conformance results

All assertions pass. Full output in the JSON evidence file.

### Unit layer, exact formatter output with an explicit `en` locale

| Case | Output | Assertion |
|---|---|---|
| `formatBalance(1000 * S, 'XSC')` | `SC 1,000.00` | leading symbol, grouped |
| `formatBalance(1000 * S, 'SC')` | `SC 1,000.00` | alias identical to XSC |
| `formatBalance(500 * S, 'XGC')` | `GC 500.00` | GC at 2 decimals |
| `formatBalance(1.25 * S, 'USD')` | `$1.25` | narrow symbol, no `US$` |
| `formatBalance(1250 * S, 'JPY')` | `¥1,250` | zero-decimal, high-minimum |
| `currencySymbolFor('XSC')` | `SC` | never the raw code |
| `currencySymbolFor('SC')` | `SC` | alias |
| `currencySymbolFor('USD')` | `$` | derived from code |

### DOM layer, real app driven by `?mockCurrency=`

| Currency | Balance rendered | Bet rendered | Console errors |
|---|---|---|---|
| USD | `BALANCE / $100.00` | `BET / $1.00` | 0 |
| JPY | `BALANCE / ¥100` | `BET / ¥1` | 0 |
| XSC | `COINS / SC 100.00` | `PLAY / SC 1.00` | 0 |
| XGC | `COINS / GC 100.00` | `PLAY / GC 1.00` | 0 |

Note the HUD labels switch to `COINS` / `PLAY` on their own for the sweepstakes
codes. That is `socialMode.ts` inferring social presentation from the currency,
working as designed and now proven end to end.

Asserted for every virtual currency: the raw code appears **nowhere** in the rendered
page text.

### Test hook

`?mockCurrency=<code>` is a new **dev-only** hook in `App.svelte`, guarded by
`import.meta.env.DEV` exactly like the theme selector, mirroring the existing
`?mockCategory` and `?social` hooks. It seeds the currency the RGS would have sent.
It cannot exist in a production build. In dev the RGS mock path never sets
`currencyCode` (authenticate throws on absent session params), so the override is
stable.

## 5. Social-string findings. NOT auto-corrected, escalated for ruling.

Running the SC display combination (`?mockCurrency=XSC&social=true`) surfaced six
**visible, player-facing** prohibited-term strings in the Feature Menu:

| Rendered text | Element | Prohibited term | Table's replacement |
|---|---|---|---|
| `BET` | `.fm-betlabel` | bet | play |
| `1× bet` | `.fm-cost` | bet | play |
| `1× bet` | `.fm-cost` | bet | play |
| `1.25× bet` | `.fm-cost` | bet | play |
| `BUY FEATURES` | `.fm-section-label` | buy | play / get bonus |
| `BET MODES` | `.fm-info-btn` | bet | play |

All six are confirmed genuinely visible: not inside the `.warm-mount` hidden
duplicate subtree, non-zero bounding box, `visibility: visible`, `opacity: 1`.

**Why these escaped until now.** The existing `social_string_conformance.mjs` checks
exactly two terms (`Buy`, `Debits`) in exactly two components' card labels and
blurbs. It still passes, and it passed on this same build while all six violations
were on screen. Its scope was narrower than the requirement. The new sweep walks
every visible text node against the full thirteen-term list.

**Deliberately not fixed here.** `CLAUDE_PROJECT_INSTRUCTIONS_v6` JOB 9b is explicit:
report currency-language strings needing social variants, "flagging rather than
changing them until Fable rules on wording". Replacement wording is an art-direction
call, not a mechanical substitution: `BUY FEATURES` could become `GET FEATURES` or
`PLAY FEATURES`, and `1× bet` could become `1× play` or `1× stake-free`, with
different implications for clarity. That is Fable's ruling to make.

**Status: submission blocker for stake.us and any social distribution.** Not a
blocker for stake.com real-money. Tracked as an open item.

The harness reports the two verdicts separately and on purpose. Currency conformance
exits non-zero on a currency defect. Social wording is reported as findings with a
loud warning and does not mask a currency pass, nor vice versa.

## 6. Files changed

- `frontend/src/lib/utils/currency.ts` - single source of truth; `VIRTUAL_CURRENCIES`
  keyed on all four live code forms; `currencySymbolFor()`, `isVirtualCurrency()`
  exported; grouped virtual formatting; optional platform locale parameter;
  `VIRTUAL_SYMBOL_TRAILING` as the one flip point for the open placement question.
- `frontend/src/lib/services/replayService.ts` - divergent symbol map deleted,
  delegates to the shared module.
- `frontend/src/lib/components/ReplayMode.svelte` - amounts via `formatBalance`,
  symbol not code for virtual currencies, social-aware field label.
- `frontend/src/App.svelte` - dev-only `?mockCurrency=` hook.
- `frontend/scripts/currency_conformance.mjs` - new harness.

Typecheck: `svelte-check` reports 33 errors / 36 warnings / 13 files both before and
after these changes, identical to the pre-existing baseline. Zero of them are in the
files touched here. The baseline errors are pre-existing test-file `@types/node`
gaps and two unrelated `App.svelte` items.

Regression: `social_string_conformance.mjs` re-run, ALL CHECKS PASS.

## 7. Open items

1. **SC symbol placement.** We ship leading (`SC 1,000.00`) per the brief. The
   platform currency reference documents trailing (`1,000.00 SC`, `symbolAfter: true`).
   One of the two is wrong for players. Flip point is the single
   `VIRTUAL_SYMBOL_TRAILING` constant. Needs an owner or Fable ruling.
2. **XEC.** Unverified. Do not record it as supported until a first-party source
   exists.
3. **Six social strings.** Need a wording ruling before stake.us or Stake EU
   distribution.
4. **Locale plumbing.** `formatBalance` now accepts a platform locale tag and the
   replay path passes `params.lang`. The main HUD call sites still omit it and so
   fall back to the browser's locale. Low risk (grouping and decimal marks only, the
   symbol is already correct), but it means a `lang=ja` session on an en-AU browser
   groups numbers the en-AU way. Worth closing in a later pass.
