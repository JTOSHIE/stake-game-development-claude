# Stake Engine docs delta notes, 2026-07-25

Three sources were compared this pass. They do not agree with each other, and the
disagreement is itself the finding.

| Source | Identifier | Date | Status |
|---|---|---|---|
| GitHub `StakeEngine/docs` | commit `fefadc7bd117f8e06f0a01e750408da2244f8d8f` | 2026-03-17 | STALE, diverged structure |
| Our mirror | `docs/stake-engine-live/*.md` | 2026-07-04 | superseded by this pass |
| Live site | stake-engine.com, rendered | 2026-07-25 | AUTHORITATIVE |

## Structural divergence, repo versus live

The GitHub repository is not a mirror of the deployed site. It carries a different
route tree entirely:

| Topic | Repo route | Live route |
|---|---|---|
| Math approval criteria | `/docs/approval/math-requirements` | `/docs/approval-guidelines/math-verification` |
| Front end | `/docs/web-sdk/*` | `/docs/front-end/*` |
| Maths SDK | `/docs/math-sdk/*` | `/docs/math/*` |
| Currencies | `/docs/reference/currencies` | absent from live navigation |
| Payments | absent | `/docs/payments` |

Practical consequence: the repository cannot be used as the compliance source of
truth. Where the two disagree, the live site wins, and this mirror records the live
capture. The repository remains useful for one thing only, the currency reference
table, which live no longer publishes (see the XEC item below).

## Delta 1, RTP ceiling. CONFIRMED, affects us.

- Repo (2026-03-17) still states the range as **90.0% to 98.0%**.
- Live (2026-07-25) states **90.0% to 96.70%**.
- Our 2026-07-04 mirror already carried 96.70, so this ceiling is not new this pass.
  It is new only relative to the public repository, which has never been updated.

Our position: all five modes ship at **96.3500%**. Margin to the ceiling is
**0.35pp**. The multi-mode 0.5% variation rule is satisfied with a 0.0000pp spread
across all five modes.

Effective-date note: no effective date is published on the live page. The ceiling was
already live at our 2026-07-04 capture, so it took effect on or before that date. Any
studio reading the public repository would still believe 98.0% is permitted.

## Delta 2, file size restrictions. NEW since 2026-07-04.

A "File Size Restrictions" section now heads the math verification page. It did not
exist in our 2026-07-04 capture and does not exist in the repository at all.

- No single events file (`.jsonl.zst`) can exceed **4.2GB**.
- No game mode can contain more than **10,000,000 events**.
- Files or modes exceeding this fail on publish.

Our position: **100,000 rounds per mode**, two orders of magnitude below the cap.
Not a risk. Recorded because it is a publish-time hard failure, not a review opinion,
and because it interacts with any future decision to raise simulation counts.

## Delta 3, 3-star maximum exposure doubled. NEW since 2026-07-04.

| Tier | 2026-07-04 mirror | 2026-07-25 live | Change |
|---|---|---|---|
| 2-star Maximum Exposure | $10,000,000 | $10,000,000 | unchanged |
| 3-star Maximum Exposure | $25,000,000 | **$50,000,000** | **doubled** |

Every other bet-level limit in both tiers is unchanged between the two captures. This
is a loosening in our favour at our target tier. No action required, recorded so the
next verification pass does not read the old $25,000,000 figure out of the superseded
mirror.

## Delta 4, payments page. NEW, no prior counterpart.

`/docs/payments` is captured for the first time. Two models, selectable per team,
switchable at any time with effect from the following month:

- **10% GGR (Revenue Share)**, on actual GGR. Negative months record a carry-forward
  debt. The studio never pays Stake out of pocket, but payouts stop until the debt
  clears. No time limit on the carry-forward.
- **7.5% Guaranteed**, on expected GGR derived from the game's RTP. No debt can
  accrue. Stake absorbs the volatility.

Mechanics: one wallet per team, added in team settings. Payouts run on the 1st of each
month, invoice first, funds within 12 hours, any amount above $0.00.

Owner decision, not a build item. Linked from the owner payment row in
`WRS_MASTER_DOCUMENT.md` this pass.

## Delta 5, XEC and SC sweepstakes currency for Stake EU. NOT VERIFIED.

The brief records an XEC/SC sweepstakes currency introduction for Stake EU. This pass
could **not** confirm it from any available source, and the claim is carried forward
as unverified rather than recorded as fact.

Searches performed:

- Live navigation scrape of every `/docs` route: no reference section, no currencies
  page, no XEC.
- Live `/docs/rgs/wallet`: currency appears only as an opaque `"currency": "USD"`
  field, no code table.
- Live `/docs/approval-guidelines/jurisdiction-requirements`: social mode and the
  prohibited-terms table only, no currency codes, no EU content.
- Full-text search of the cloned repository for `XEC`: zero hits (only false positives
  on `execCommand` and `Executables`).
- Full-text search of the cloned repository for `Stake EU`, `stake.eu`, `sweepstake`:
  zero hits.

What IS documented, repository only, at `/docs/reference/currencies`:

| Currency | Code | Symbol | Decimals | Documented example |
|---|---|---|---|---|
| Stake Gold Coin | `XGC` | GC | 2 | `10.00 GC` |
| Stake Cash | `XSC` | SC | 2 | `10.00 SC` |

Both carry `symbolAfter: true`. Note the documented format is **`10.00 SC`, symbol
trailing**, which contradicts the brief's `SC 1,000` leading-symbol style. Part 3
implements from the platform-provided data rather than from either assumption, so the
contradiction does not block the work, but the format question needs an owner or Fable
ruling before any SC display is treated as final. Flagged in `COMPLIANCE_WATCH.md`.

Recommendation: treat Stake EU as a **contingent** distribution target only, as the
brief already frames it, and do not record XEC as a supported code anywhere in the
register until a first-party source is produced.

## Unchanged this pass, re-verified

- Statelessness, no jackpots, no gamble, no continuation, no early cashout.
- Post-approval lockdown: cosmetic fixes only, no math, mode or gameplay changes.
- Automatic consideration for stake.us subject to the jurisdiction language rules.
- Maximum bet size accepted by the RGS is $500,000 USD, else error 400
  "invalid bet amount".
