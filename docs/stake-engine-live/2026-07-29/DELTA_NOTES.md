# LIVE DOCS DELTA, 2026-07-29

Convention (d) docs watch, run as JOB 1a phase 1 of
`reports/briefs/FS_SESSION2_AUDIT_ONE_Prompt.md`.

Australian English, no em dashes or en dashes in this note. Upstream quotations carry
whatever punctuation upstream used, per convention (l.7), and the upstream RTP band is
written with an en dash in the platform's own text.

---

## What was captured, and why it is the first COMPLETE capture

**64 pages, all 64 rendered.** Every page the live docs navigation exposes, crawled from
`https://stake-engine.com/docs` and captured to this directory. The manifest at
`_manifest.json` carries the URL, page title, character count and sha256 of each.

Before this pass the repository held **four PARTIAL captures totalling 603 prose lines
across 8 files**, plus 11 root level files whose newest content dated from 2026-07-04.
There was no complete corpus and no consolidated requirements register. Convention (m)
requires an external document to physically exist in the repository before work cites it,
so the full corpus is committed here rather than sampled.

**One page in the prior manifest no longer exists.** The `changelog` slug resolved to
`https://stake-engine.com/docs/updates`, which is absent from the current navigation. Its
2026-07-04 capture was already 88 characters and already recorded `looks_real: false`, so
nothing was lost, but the slug should not be carried forward as though it were a live page.

**The PDF at `https://stake-engine.com/docs-content/distribution_optimization.pdf` was
NOT captured.** It is linked from the docs navigation and is a binary, not a rendered page.
Named here so its absence is a stated gap rather than an unexamined one.

---

## THE CAPTURE INSTRUMENT, and the false delta it nearly produced

**Recorded because the first instrument was wrong and the error would have read as a
platform wide rewrite.**

The docs site is client rendered: a plain HTTP fetch returns only `Loading...`, which is
why convention (d) has always used a headless browser. The first capture of this pass read
`document.body.innerText`, and every one of the ten overlapping approval guidelines pages
came back **larger by a near identical +1020 to +1043 characters**.

That uniformity was the tell. It was not content. It was the navigation sidebar, which
renders at the 1440 pixel viewport used for the capture and did not appear in the
2026-07-04 capture. Reading `document.querySelector('main').innerText` instead returned
**872 characters for `general-disclaimer`, byte identical to the committed 2026-07-04
capture of the same page**.

Two things follow, and the second is the one worth keeping:

1. The capture selector is `main`, recorded in every file's header so the next pass
   reproduces it rather than rediscovering it.
2. **Eight of the ten overlapping pages match the 2026-07-04 capture on sha256**, produced
   by a different session running a different script on a different date. That is
   corroboration with genuinely independent inputs, which is what convention (l.4) asks
   for, and it is what licenses the two remaining differences below to be read as real
   platform changes rather than as capture noise.

Had the contaminated capture been trusted, this note would have reported ten changed
requirement pages and every one of them would have been wrong.

---

## THE TWO REAL CHANGES

### 1. `math-verification`: a NEW file size restriction, and 3-star exposure DOUBLED

**New section, not present in the 2026-07-04 capture.** Quoted verbatim:

> In order to limit RGS instability caused by large file downloads:
>
> No single events file (.jsonl.zst) can exceed 4.2GB
> No game mode can contain more than 10,000,000 events
>
> Files/modes exceeding this size will fail on publish.

**Future Spinner is COMPLIANT on both limits, measured rather than assumed:**

| Limit | Published | Ours | Margin |
|---|---|---|---|
| Single events file | 4.2GB | **146MB**, the largest of the five (`books_bonus.jsonl.zst`) | about 29x under |
| Events per mode | 10,000,000 | **100,000 rows** in every one of the five modes | 100x under |

The 10,000,000 figure is not new to the project: it was relayed from the platform Discord
on 2026-07-25 and recorded at `COMPLIANCE_WATCH.md` section 3 of the platform delta as
COMPLIANT and verified. What is new is that it now appears in the **official documentation**
rather than only in an announcement, and that it arrives beside a file size cap the project
had no record of at all.

**The 3-star exposure ceiling changed, in our favour:**

| 3-star rated games | 2026-07-04 | 2026-07-29 |
|---|---|---|
| Maximum Exposure | `$25,000,000` | **`$50,000,000`** |
| Maximum Payout Multiplier | `100,000x` | `100,000x`, unchanged |
| Maximum Bet Cost | `$500,000` | `$500,000`, unchanged |

The 2-star tier is unchanged at `$10,000,000`. No build work is owed by a raised ceiling;
it is recorded so the number in any submission facing document is the current one.

### 2. `rgs-communication`: 13 new currencies, and one of them SETTLES AN OPEN CONTRADICTION

Thirteen currency rows were added: PKR, EGP, NZD, BOB, GHS, KES, MAD, BAM, ISK, TZS, UGX,
XOF, and **XEC**.

**XEC is the one that matters**, because `COMPLIANCE_WATCH.md:407` records an open
contradiction headed *"CONTRADICTION: SC display format. NEEDS A RULING, affects XSC as
well as XEC."* The platform's own currency reference now carries both rows. Quoted verbatim
from the capture, tab separated as upstream renders them:

```
Stake Cash	XSC	SC	10.00 SC
Stake Euro Cash	XEC	SC	10.00 SC
```

**Both are TRAILING placement.** The project ships trailing, `1,000.00 SC`, under Fable
ruling 2 of 2026-07-26, which rested on two first party sources: the currency reference
documenting `symbolAfter: true`, and the official `StakeEngine/ts-client` SDK
(`XSC: { symbol: 'SC', decimals: 2, symbolAfter: true }`).

The Discord announcement's *"displayed using the SC format (e.g. SC 1,000)"*, which is
leading placement and which created the contradiction, is now contradicted by the
platform's current documentation for both currencies.

**So the open item has a third independent first party source, and it agrees with what we
ship.** This is recorded as evidence for the ruling, not as the ruling: the comms item is
Fable's to close, and convention (l.8) puts a player money display question with the owner
and the Product Owner rather than with the builder. What the builder can state is that no
change to shipped behaviour is indicated by this capture.

---

## What did NOT change

Eight of the ten overlapping approval guidelines pages are byte identical on sha256 to
their 2026-07-04 captures: `approval-guidelines`, `front-end-communication`,
`game-quality-rankings`, `game-replay-requirements`, `game-tile-requirements`,
`general-disclaimer`, `jurisdiction-requirements`, `submission-checklist`.

The RTP band is among them and is unchanged. Quoted from the current capture, carrying the
platform's own en dash:

> The calculated Return to Player (RTP) must be within 90.0%–96.70%. For multiple modes,
> all must fall within a 0.5% variation

Future Spinner is 96.35% in all five modes, so the multi mode 0.5% variation clause is
satisfied by construction: the spread across modes is zero.

---

## Corpus tiering, for the requirements register

The 64 pages are not equally load bearing, and counting them as though they were would
inflate every downstream estimate. Tiered by what the pages place an obligation on:

| Tier | Pages | Candidate normative statements | Status |
|---|---|---|---|
| `BUILD_APPROVAL` | 10 | 88 | The compliance spine |
| `BUILD_RGS` | 4 | 21 | In scope |
| `BUILD_FRONTEND` | 10 | 20 | In scope |
| `COMMERCIAL_LEGAL` | 4 | 173 | Studio obligations, triage only |
| `MATHS_SDK` | 35 | 161 | **OUT OF SCOPE**, locked package, own sanction |
| `ORIENTATION` | 1 | 3 | Navigation only |

The `MATHS_SDK` exclusion follows `docs/skills/FULL_AUDIT_METHOD.md` section 5: the maths
package is locked and wants its own audit pass with its own sanction. The pages are
captured and committed regardless, so a future sanctioned maths pass does not begin by
re-fetching them.
