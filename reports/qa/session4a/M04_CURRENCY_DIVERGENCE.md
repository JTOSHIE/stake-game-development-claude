# M04: THE CURRENCY DISPLAY TABLE, MEASURED

**Session 4a, 2026-07-29.** `reports/briefs/FS_SESSION4A_MECHANISMS_Prompt.md`, JOB 2.

M04 was ranked 4th by coverage and was the third gate this session intended to build. It
was **stopped before it was built**, on a measurement, and this file is that measurement.

> **SUPERSEDED 2026-07-29 AS A STATEMENT OF CURRENT STATE. Still valid as a dated
> measurement, which is what it is.** Read it as evidence of what was true on the
> 2026-07-04 capture, never as a description of HEAD.
>
> | This file says | Current, verified 2026-07-29 |
> |---|---|
> | 36 supported codes | **49.** The 2026-07-29 capture adds 13 |
> | 23 diverge | **34 of 49 did.** The 23 here are confirmed exactly; 11 of the 13 new codes also diverged |
> | Class A is 7 codes | **8.** NZD joins it, see the correction below |
> | NZD has no platform row | **It has one**, `NZ$10.00` |
> | REQ-108 PARKED, currently unmet | **MET and GATED.** 0 of 49 diverge |
>
> Nothing here was wrong when written. The platform's table grew. The fix, the gate and the
> full reconciliation are in `reports/qa/currency_table_2026-07-29/` and
> `frontend/scripts/currency_table_gate.mjs`; the recount is in `reports/FABLE_COMMS.md`
> entry 028.

Australian English, no em dashes or en dashes.

---

## WHY THIS IS A DOCUMENT AND NOT A GATE

Two independent reasons, and either alone would be enough.

**1. Convention (l.8) binds.** *"Maths-adjacent findings escalate. Anything touching the
maths package, player money display, or a submission claim goes to the owner and Fable as a
question with evidence attached. The builder does not rule on it."* Every divergence below is
player money display. Rewriting 23 currency formats is not a gate, it is a change to the
money path, and protocol rule 4 keeps the money path serial and deliberate for exactly this
reason.

**2. The session was at its stop line.** The brief sets "no new gate started at 25 minutes
remaining". A gate is complete only when built, seeded, wired and green on the remote runner,
and half a gate is reverted rather than left. Starting a money-path rewrite here would have
produced the half.

---

## THE RECOUNT, AND IT CORRECTS THE REGISTER

`reports/qa/session3/PARKED_TRACKER.md:90` records, from the adversarial panel:

> The panel confirmed the seeds are real: CAD, MXN, SGD, NZD and TWD all render a bare
> $10.00 against the platform table.

That premise is **REPORTED**, per rule 16, and it was recounted rather than trusted. The
recount changes the answer:

| | |
|---|---|
| Panel reported | 5 currencies |
| **Measured 2026-07-29** | **23 of 36** |
| Method | `formatBalance(10_000_000, code)` against the Example column of the platform's Supported Currencies table |
| Platform source | `docs/stake-engine-live/rgs-communication.md:46` to `:87`, fetched 2026-07-04 |
| Formatter | `frontend/src/lib/utils/currency.ts` |

**And one of the five named is not in the platform table at all.** NZD appears in
`currency.ts:25`'s supported list but has no row in the platform's Supported Currencies
table, so REQ-108 states no display specification for it. It cannot diverge from a
specification that does not exist. That is not a defect; it is a scope correction.

> **CORRECTED 2026-07-29 by the boot-set audit. THE PARAGRAPH ABOVE IS FALSE AGAINST THE
> CURRENT CAPTURE, and it inverted a disposition.** It is left standing because this is a
> dated measurement record and rewriting it would destroy the evidence, but it must not be
> read as current.
>
> **NZD has a row.** `docs/stake-engine-live/2026-07-29/rgs.md:130` publishes
> `New Zealand Dollar	NZD	NZ$	NZ$10.00`. The paragraph was true against the 2026-07-04
> capture this file measured, and the 2026-07-29 full capture adds 13 codes including NZD.
> So NZD is not a scope exclusion, it is a **Class A defect**: the game rendered a bare `$`
> on a New Zealand balance, which a player reads as United States dollars. Fixed and gated
> 2026-07-29, see `frontend/scripts/currency_table_gate.mjs`.
>
> **The second citation in the same paragraph is also stale.** `currency.ts:25` no longer
> holds a supported-currency list; that line is now part of the file's header comment. The
> list it referred to was replaced by `PLATFORM_CURRENCIES`.
>
> **The lesson is the one this file itself argues.** A measurement against a dated capture
> is only as current as the capture, and nothing here said which capture it used until the
> line below was read carefully. The table it measured has since grown by 13 rows.

---

## THE 23 DIVERGENCES, BY CLASS

Sorted by how badly a player is misled, which is not the same as how badly the string
differs.

### CLASS A: the player is shown the WRONG CURRENCY'S symbol (6)

The serious class. A bare `$` in front of a Canadian, Mexican, Singaporean, Taiwanese,
Chilean or Argentine balance reads as United States dollars, and `¥` on a Chinese balance is
the Japanese yen sign.

| Code | Platform specifies | We render | What the player concludes |
|---|---|---|---|
| CAD | `CA$10.00` | `$10.00` | US dollars |
| MXN | `MX$10.00` | `$10.00` | US dollars |
| SGD | `SG$10.00` | `$10.00` | US dollars |
| TWD | `NT$10.00` | `$10.00` | US dollars |
| CLP | `10 CLP` | `$10` | US dollars |
| ARS | `10.00 ARS` | `$10.00` | US dollars |
| CNY | `CN¥10.00` | `¥10.00` | Japanese yen |

That table is seven rows, because CNY belongs to the class by meaning while the six above it
share the `$` form. Counted as 7 in the totals below.

### CLASS B: symbol on the wrong SIDE of the number (9)

| Code | Platform specifies | We render |
|---|---|---|
| DKK | `10.00 KR` | `kr 10.00` |
| PLN | `10.00 zł` | `zł 10.00` |
| VND | `10 ₫` | `₫10` |
| SAR | `10.00 SAR` | `SAR 10.00` |
| ILS | `10.00 ILS` | `₪10.00` |
| AED | `10.00 AED` | `AED 10.00` |
| TND | `10.00 TND` | `TND 10.00` |
| OMR | `10.00 OMR` | `OMR 10.00` |
| QAR | `10.00 QAR` | `QAR 10.00` |

ILS also changes symbol form, so it belongs to class C as well; it is counted once, here.

### CLASS C: right side, wrong symbol form or spacing (7)

| Code | Platform specifies | We render |
|---|---|---|
| PEN | `S/10.00` | `PEN 10.00` |
| KWD | `KD10.00` | `KWD 10.00` |
| JOD | `JD10.00` | `JOD 10.00` |
| BHD | `BD10.00` | `BHD 10.00` |
| IDR | `Rp10` | `Rp 10` |
| NOK | `kr10.00` | `kr 10.00` |
| MYR | `RM10.00` | `RM 10.00` |

### The 13 that are already correct

USD, JPY, EUR, RUB, PHP, INR, KRW, BRL, TRY, NGN, CRC, XGC, XSC.

**XGC and XSC passing matters more than it looks**, because they are the two the project
built its own table for. Every failure above is a fiat code delegated to `Intl`, and every
pass among the virtual currencies is a row this project wrote down. That is the diagnosis.

---

## THE CAUSE, DERIVED RATHER THAN GUESSED

`currency.ts:15` states the design: *"fiat symbols come from Intl via the currency code the
platform sent"*, and `:210` repeats it: *"The symbol is derived by Intl from the code, never
substituted."*

**Deriving from `Intl` was the right instinct and it is the wrong authority.** `Intl` renders
a currency the way a LOCALE conventionally writes it. The platform's table is not a locale
convention, it is a **display specification the platform published and REQ-108 makes
binding**. Where the two disagree, `Intl` is not wrong about typography and is still wrong
about the requirement.

So this is not 23 bugs. It is **one design decision with 23 symptoms**, which is why fixing
it is a single coherent change rather than a list, and why it wants a ruling rather than a
patch.

---

## THE QUESTION FOR THE OWNER AND FABLE, per convention (l.8)

Stated as options with trade-offs, per (l.6) and the FACTS DISCIPLINE point 3, rather than
decided here.

**Option 1. Adopt the platform table verbatim as the display authority.** Add the 36 rows to
`currency.ts` as an explicit table with symbol, placement and decimals, and format from it,
keeping `Intl` only for grouping and decimal separators. Highest conformance with REQ-108,
and it makes the requirement mechanically checkable, which is what M04 needs to exist at all.
Cost: a money-path change touching every fiat rendering, so it wants its own session.

**Option 2. Fix class A only.** Six `$` collisions plus CNY. Removes every case where a
player could read the wrong currency, leaves placement and spacing divergent. Much smaller,
and it is the whole of the player-harm risk. Leaves REQ-108 unheld, because the requirement
binds the whole table.

**Option 3. Adopt the table and freeze the remainder as recorded debt**, the pattern
`scripts/qa/doc_currency_baseline.json` already uses. The gate ships green over a printed
baseline of known divergences and any NEW one fails. Holds the class against regression
today without a money-path rewrite. **REQ-108 would still not be HELD**, because the
requirement is currently unmet and a frozen baseline records that rather than fixing it.

**The recommendation, and it is a recommendation and not a ruling: Option 1, in its own
session, with Option 2 taken immediately if that session cannot be scheduled before
submission.** Class A is the only part a player can be actively misled by.

---

## WHAT THIS MEANS FOR THE FIVE REQUIREMENTS

All five stay **PARKED**, and the reason has changed from "budget" to something more useful.

| REQ | Sev | Status after this measurement |
|---|---|---|
| REQ-108 | STREAM | PARKED, and now known to be **currently unmet for 23 of 36 currencies**. Not a budget park. |
| REQ-125 | STREAM | PARKED, budget. Not reached. |
| REQ-127 | STREAM | PARKED, budget. Not reached. |
| REQ-119 | MEDIUM | PARKED, budget. Not reached. |
| REQ-126 | LOW | PARKED, and unwitnessable at HEAD: no bet below $0.10 is selectable, so half of it has no reachable state until the ladder floor changes, which is itself behind a locked path. |

**A gate was not built, and the requirement went from believed-broken-in-5-places to
measured-broken-in-23.** That is the useful half of a stopped job, and it is what 4b
inherits instead of a guess.

---

## REPRODUCING THIS

From `frontend/`, against the table at `docs/stake-engine-live/rgs-communication.md:46`:

```
npx tsx -e "import {formatBalance} from './src/lib/utils/currency.ts'; \
  for (const c of ['CAD','MXN','SGD','TWD','CLP','ARS','CNY']) \
    console.log(c, formatBalance(10_000_000, c))"
```
