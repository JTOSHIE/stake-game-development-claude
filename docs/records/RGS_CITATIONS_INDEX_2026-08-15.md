# RGS citations index

Every ruling and tracker row that cites the platform RGS documentation family, with its
line reference and whether that reference still resolves. Built 2026-08-15 as TASK 4 of
`reports/briefs/FS_FABLE_R070_DOCS_MIRROR_Prompt.md`, carried forward from the dead R069.

Australian English, no em dashes or en dashes. Upstream quotations carry whatever
punctuation upstream used, per convention (l.7).

**Bare filename shorthands below are deliberately left unbackticked**, because a
backticked bare filename is a DEAD_PATH claim to the document currency gate
(`docs/records/DOC_CURRENCY_GATE_SPEC.md`). Full repository paths are backticked.

---

## 1. What the family is, and where it lives

Four pages, three under `/docs/rgs` and one in the approval guidelines that publishes the
same currency material:

| Page | Live route | Current mirror |
|---|---|---|
| RGS Details | `/docs/rgs` | `docs/stake-engine-live/2026-08-15/rgs.md` |
| Wallet | `/docs/rgs/wallet` | `docs/stake-engine-live/2026-08-15/rgs_wallet.md` |
| Basic RGS Example | `/docs/rgs/example` | `docs/stake-engine-live/2026-08-15/rgs_example.md` |
| RGS Communication | `/docs/approval-guidelines/rgs-communication` | `docs/stake-engine-live/2026-08-15/approval_guidelines_rgs_communication.md` |

**All four have been byte-identical since 2026-07-29**, verified 2026-08-15 by capturing
each afresh through two independent transports and comparing sha256 against the
2026-07-29, 2026-08-10 and 2026-08-11 mirrors. The RGS Details page reads 12,025
characters and `cefad0fd2ed1a789e4b50cea9f0a2266d1ab5d0f04428f3d1889531a31a24580` on
every one of those four dates. **Every citation in this index therefore still quotes
live platform text**, which is the question the index exists to answer.

---

## 2. THE OFFSET, which is the one thing a reader needs before following any line number

The page text has not moved. **The capture header has.** The 2026-07-29 and 2026-08-10
sets carry a fifteen-line header, and the 2026-08-11 and 2026-08-15 sets carry a
seven-line header, so the same sentence sits eight lines earlier in the newer files:

> **2026-07-29 file line N is 2026-08-15 file line N minus 8.**

Verified line by line for every citation in this index. TR-134 already recorded one
instance of this (its "142 in the 2026-07-29 mirror, 134 in the 2026-08-11 mirror"); the
rule behind it is written here once so nobody derives it again.

| Cited as | 2026-07-29 line | Same text in the 2026-08-15 mirror | Resolves |
|---|---|---|---|
| the Basic Flow paragraph | rgs.md:37 | `docs/stake-engine-live/2026-08-15/rgs.md`, line 29 | YES |
| Supported Currencies table header | rgs.md:93 | line 85 | YES |
| the XEC row | rgs.md:142 | line 134 | YES |
| the `CurrencyMeta` sample | rgs.md:205 to 257 | lines 197 to 249 | YES |
| "Although bet levels are not mandatory" | rgs.md:286 | line 278 | YES |
| the minBet and maxBet clamp | rgs.md:288 | line 280 | YES |
| "should incorporate small denomination bets" | rgs.md:295 | line 287 | YES |
| the win display hedge | rgs.md:297 | line 289 | YES |

---

## 3. Rulings: the Fable comms entries that cite the family

`reports/FABLE_COMMS.md`, newest first. Nine line-numbered citations across seven
entries, plus two path-only citations.

| Entry | Date | Comms line | Citation | What it carries |
|---|---|---|---|---|
| 059 | 2026-08-13 | 319 | rgs.md:142 | The XEC reversal. The published row "Stake Euro Cash XEC SC 10.00 SC" is the primary source that reversed the R054 EC ruling and is quoted at all three pins |
| 037 | 2026-07-31 | 1528 | rgs.md:295 | The correction to entry 035. The precision clause is unhedged: four points of precision below a 0.1x minimum win, and our minimum way-win is 0.08x |
| 036 | 2026-07-31 | 1740 | rgs.md, unnumbered, via Q2 | Fable's ruling on the exact-win formatter and the ladder floor |
| 035 | 2026-07-31 | 1826 | rgs.md:297 | The retraction. The win-display sentence is hedged, and its only mandatory clause is that wins show exact amounts |
| 031 | 2026-07-30 | 2524 | rgs.md:37 | Corrects a false derivation: end-round DOES appear in the 2026-07-29 capture, which makes the finding stronger |
| 031 | 2026-07-30 | 2562 | rgs.md:297 | One hedged sentence pair was split into two same-weight register rows, promoting advice to obligation |
| 030 | 2026-07-30 | 2804 | rgs.md:288 | REQ-121, the wager clamp to authenticated minBet and maxBet rather than a hardcoded ladder |
| 030 | 2026-07-30 | 2907 | `docs/stake-engine-live/2026-07-29/rgs.md`, lines 93 to 142 and 207 to 257 | The currency contradiction: the page's own table against its own `CurrencyMeta` sample |
| 028 | 2026-07-29 | 3086 | rgs.md:286 and :295 | The obligation strength of the bet-level guidance, quoted as "Although bet levels are not mandatory" and "should incorporate" |
| 028 | 2026-07-29 | 3088 | rgs.md:295 | Shipping $0.01 alone would create a money defect at four points of precision |
| 028 | 2026-07-29 | 3143 | `docs/stake-engine-live/2026-07-29/rgs.md` at `:205` | The `CurrencyMeta` reference implementation contradicts the page's own Example column for 14 codes |

**`CLAUDE.md` and `CLAUDE_PROJECT_INSTRUCTIONS_v7.md` cite the family nowhere.** VERIFIED
2026-08-15 by direct grep: every RGS reference in both is to the locked service file
`frontend/src/lib/services/rgsService.ts`, not to the platform pages. Stated because an
absence found by looking is worth more than an absence assumed.

---

## 4. Tracker rows that cite the family

`docs/records/reviews/REVIEW_TRACKER.md`.

| Row | Tracker line | Citation | What it carries |
|---|---|---|---|
| TR-057 | 221 | `docs/stake-engine-live/rgs-communication.md`, line 82 | Two first-party prose sources say two decimals for the social codes against one that says zero, the official client's own `CurrencyMeta`. Our value agrees with the prose |
| TR-133 | 382 | the current mirror, rgs.md, page-level | The published table still prints "Stake Euro Cash / XEC / SC / 10.00 SC" while the R054 ruling knowingly diverged from it on live evidence |
| TR-134 | 383 | `docs/stake-engine-live/2026-07-29/rgs.md`, line 142, and the 2026-08-11 mirror at line 134 | The R054 reversal. The published row is the primary source, the announcement is silent on labels, and the table governs |

**TR-057's citation is the one to look at twice.** It names
`docs/stake-engine-live/rgs-communication.md`, the UNDATED root-level mirror, whose own
header records `fetched: 2026-07-04`. That file still exists and its line 82 still reads
"Stake Gold Coin XGC GC 10.00 GC", so the citation resolves and the two-decimal claim it
supports is still correct. **But it points at a capture that predates the 2026-07-29
addition of 13 currencies, including XEC**, so a reader following it lands in a corpus
that does not contain the row TR-133 and TR-134 turn on. The current equivalent line is
`docs/stake-engine-live/2026-08-15/approval_guidelines_rgs_communication.md`, line 90,
with the XEC row that the 2026-07-04 capture cannot have at line 92.

---

## 5. Live documents outside the ruling and tracker spine

Included because the same line references are load-bearing there, and a reader chasing a
number will meet these first.

| Document | Line | Citation | Note |
|---|---|---|---|
| `docs/RGS_CONTRACT_REFERENCE.md` | 13, 14, 17, 18 | `docs/stake-engine-live/2026-07-29/rgs.md` and the 2026-07-29 rgs-communication capture, both pinned by CHECK anchors | The anchors assert existence only, so they stay green as newer sets land beside them |
| `DTT_PROTOCOL.md` | 93, 229 | `docs/stake-engine-live/rgs-communication.md`, line 82 | Same undated 2026-07-04 capture as TR-057, same caveat |
| `docs/records/GUIDELINES_51_MAPPING_2026-08-13.md` | 29, 93 | `docs/stake-engine-live/2026-07-29/rgs.md`, line 142 | Guidelines item 11, the currency display row |
| `COMPLIANCE_WATCH.md` | 122, 133, 753 | the rgs-communication page by name | Names it as one of the two official contract documents, and records the 2026-07-29 delta of 13 new currencies |
| `SUBMISSION_DOSSIER.md` | 458 | `/docs/approval-guidelines/rgs-communication` by route | Source list for the submission text |
| `reports/briefs/FS_FABLE_R056_CONSOLIDATED_Prompt.md` | 20, 23 | `docs/stake-engine-live/2026-07-29/rgs.md`, line 142 | The brief that ordered the XEC reversal |
| `reports/briefs/FS_CURRENCY_SERIAL_Prompt.md` | 16 | `docs/stake-engine-live/2026-07-29/rgs.md` | Records the corrected path to the Supported Currencies table |

---

## 6. What to do with this page

1. **Following an old line number:** subtract 8 to read it in the 2026-08-15 mirror.
   The text is identical; only the header length changed.
2. **Writing a new citation:** cite the FULL dated path, never a bare filename, and
   never in backticks without the directory, because the document currency gate reads a
   backticked bare filename as a dead path.
3. **When the family next moves:** every row above becomes checkable in one pass, since
   each names the exact sentence rather than only the line, and a changed page will be
   caught by the convention (d) refresh before a citation silently starts quoting text
   that is no longer published.
