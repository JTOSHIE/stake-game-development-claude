# Session Report - THE CURRENCY TABLE, THE SERIAL MONEY PATH (2026-07-29)

**Session 4b.** Brief saved verbatim: `reports/briefs/FS_CURRENCY_SERIAL_Prompt.md`.
Model Opus 5, main loop only, on `main` as integrator. Serial money-path session per
protocol rule 4: **zero parallel squads**, one verification agent at the close, which is the
only agent use the brief permitted.

`games/future_spinner/**` read-only throughout. **The conditional lock sanction was NOT
exercised.** `.claude/settings.json` was never opened and its diff is verified empty.

Australian English, no em dashes or en dashes.

## THE ONE-LINE RESULT

**34 of 49 supported currency codes were rendering something other than what the platform
publishes, eight of them showing the player a DIFFERENT CURRENCY'S symbol. It is now 0 of
49**, held by a gate of 589 assertions that reads the platform mirror at run time and has
been proven to go red on six seeded defects.

## PLAN OF RECORD, GRADED

Posted before the first expensive spend, per protocol rule 15.

| Line | Planned | Actual |
|---|---|---|
| JOB 1, the table | 0.5M | delivered, 49 rows rather than the briefed 36 |
| JOB 2, the gate | 1.3M | delivered, plus a second gate not in the brief |
| JOB 3, REQ-124 | 0.6M | delivered as a PARK plus a drift gate |
| JOB 4, REQ-016 | 0.3M | delivered as a RESOLUTION, not a park |
| JOB 5, transcription and close | 0.8M | delivered |
| Agents | 0.7M allowed | **1 agent**, at the close |
| **Parallel squads** | **0** | **0, held** |
| Wall clock | 1h30 | about 1h05 to the close |

**VERDICT AT PLANNING: FITS, 1.75M headroom. Outcome: it fitted, and the headroom paid for a
second gate.**

**Where the plan was wrong, recorded rather than absorbed.** It sized JOB 1 for 36 rows and
the table has 49. It did not budget `scripts/qa/bet_ladder_declaration_drift.mjs`, which
exists because JOB 3's derivation converted a fix into a park, and an unguarded park is not a
disposition.

**Why the verification agent was spent at all**, given the gate already checks the table
against the mirror deterministically and in CI: the gate and the table generator **parse the
capture the same way**, so a malformed or dropped row would be missed identically by both.
That is a shared-input risk under convention (l.4), and an independent reader is the only
instrument that closes it.

## THE PREMISE CORRECTIONS, WHICH ARE THE MOST IMPORTANT OUTPUT

Rule 16: anything below VERIFIED is a question, a session's narration is REPORTED, and only
the repository is VERIFIED. **The brief's own premises were recounted before any code was
written, and four were wrong.**

| Premise as briefed | Recounted 2026-07-29 by direct read |
|---|---|
| 36 supported codes | **49.** The 2026-07-29 capture publishes 13 the 2026-07-04 one did not |
| 23 diverge | **34 of 49** |
| Class A is 7 codes | **8** |
| NZD has no platform row (`M04:51`) | **It has one:** `NZ$10.00` |

**The three sources DO disagree, and cleanly.** The two 2026-07-29 files are byte-identical
to each other; the 2026-07-04 capture is a strict SUBSET, 36 rows, every shared row
identical, 13 added since. **So M04 was never wrong**: it measured a table that has since
grown. The recount reconciles exactly, 23 plus 11 is 34 and 13 plus 2 is 15.

**NZD is the correction that mattered**, because it inverted a disposition: from "no
specification, cannot diverge" to a Class A defect rendering a bare dollar sign.

## WHAT SHIPPED

**JOB 1, the table** (`89bb9b5`). `PLATFORM_CURRENCIES` in
`frontend/src/lib/utils/currency.ts`, 49 codes from `docs/stake-engine-live/2026-07-29/rgs.md:92`.
**Generated from the capture and round-tripped**, not hand-typed: symbol plus side plus
decimals rebuild the platform's own Example string byte-for-byte for all 49. The spacing rule
is the platform's own published `DisplayBalance` at `rgs.md:262`. `Intl` survives only for a
code the platform has not published. `XGC`, `XSC`, `XEC` unchanged.

**JOB 2, the gate** (`89bb9b5`). `frontend/scripts/currency_table_gate.mjs`, wired into the
CI static job with its self-test as its own step BEFORE the scan. 589 assertions, 49 codes by
8 magnitude rungs, **Class A first in the proof output**. It parses the mirror at run time so
gate and implementation have independent inputs. **`Intl` unreachability is INSTRUMENTED**,
by patching the `Intl.NumberFormat` constructor, not asserted in a comment. Six seeded
defects, ten controls, every negative control paired with a positive.

**JOB 3, REQ-124 PARKED and the sanction NOT taken** (`c74de72`). Derivation at
`reports/qa/session4b/REQ124_LADDER_DERIVATION.md`. Guard at
`scripts/qa/bet_ladder_declaration_drift.mjs`, read-only against the locked package.

**JOB 4, REQ-016 resolved on the platform's words** (`10cf212`).
`reports/qa/compliance_register/REGISTER.md:86`. NOT explicitly mandated, so the standing
no-Stake-branding rule is not overridden. One question parked, no interpretation shipped.

**JOB 5, transcription** (`10cf212`). `reports/FABLE_COMMS.md` entry 028, provenance stated,
COMMS-ACK on 020, 023, 024 and 025.

## VERIFICATION, every result produced by running the thing after the change

| Gate | Result |
|---|---|
| currency table gate | PASS, 589 assertions, 0 divergences |
| currency table seeded self-test | PASS, 6 of 6 seeds caught, 10 of 10 controls |
| bet ladder declaration drift | PASS |
| bet ladder drift seeded self-test | PASS, 5 of 5 seeds, negative control green |
| currency static assertions (gate 12) | PASS, 82 assertions |
| layout fit gate | PASS, 7 presets |
| layout fit gate, AED | PASS, 7 presets, see caveat |
| social string conformance | PASS |
| social DOM conformance | PASS |
| a11y social terms | PASS |
| dash gate | PASS, source and dist |
| doc currency gate | PASS, 333 frozen, 0 new |
| locked paths gate self-test | PASS |

**THE MONEY-FIT RE-RUN THE BRIEF ASKED FOR COULD NOT HAVE PROVED WHAT IT WAS ASKED TO PROVE,
and that is named rather than left as a green tick.** `frontend/scripts/layout_fit_gate.mjs:80`
hardcodes `currency: 'USD'`, and USD is one of the 15 codes that did NOT change, so the plain
re-run exercised no widened symbol at all. It was run a second time against `AED`, a trailing
three-character symbol and the worst case for width: PASS at all seven presets including the
320x568 mini profile. The probe was reverted and the gate file is unchanged in git.

**THE INDEPENDENT VERIFICATION AGENT, and it earned its 92k tokens.** One agent, COMPLETED,
none LOST. It was told to read the capture by eye and NOT to reuse the script's method,
because the gate and the table generator share a parsing approach and would miss a malformed
row identically. It confirms **49 rows, 49 entries, no code present in only one side, and no
mismatch on symbol, decimals or placement**, with the six hand spot-checks all matching. It
also reports the table ends at `XEC` with the next line being prose, so nothing was truncated.

**And it found the one structural trap in the source that this session was lucky rather than
careful about.** Two pairs of rows carry IDENTICAL Display and Example strings: `NOK` and
`ISK` are both `kr` and `kr10.00`, and `XSC` and `XEC` are both `SC` and `10.00 SC`. A parser
keying on the Display or Example value rather than on the currency code would silently
conflate each pair and ship 47 rows believing it had 49. Ours keys on the code column, so it
was never exposed, but the property was not deliberate and is recorded here so the next
person editing the parser knows the constraint exists.

## THREE THINGS THE GATES CAUGHT IN THIS SESSION'S OWN WORK

1. **The seeded self-test found a bug in the seeds, on its first run.** Seeds 1 and 5 went red
   on a SYNTAX ERROR rather than the planted defect: the replacement text contained `$'`
   inside a currency symbol, which `String.replace` expands as "splice in everything after the
   match", so both were duplicating the file into itself. Only the `expect` pattern caught it.
   **A seed that goes red for the wrong reason has taught the gate nothing.**
2. **The doc currency gate caught a dead citation inside the Fable entry announcing the fix**:
   `general_disclaimer.md:18`, a file of that name does not exist.
3. **The doc currency gate demanded a stale baseline entry be burned in the same commit.** The
   frozen debt "CurrencyMeta does not appear in currency.ts" stopped being true the moment the
   new comment named `CurrencyMeta`.

**And one thing convention (h.1) caught.** `social_string_conformance.mjs` and
`social_dom_conformance.mjs` rewrite committed evidence on a plain run: 1 JSON and 15 PNGs
were dirtied and all were restored from HEAD. The JSON drift was **pre-existing and unrelated**
(`5,000× base bet` had become `5,000×` in paytable prose; every currency amount identical).
This is the open work `CLAUDE.md:464` already names, now measured at 16 files.

## SELF-AUDIT, per THE FACTS DISCIPLINE point 4

- **Brief followed?** Yes, with two deliberate departures, both stated at the time and both
  upward in scope. The table ships **49** rather than 36, because the brief names the
  2026-07-29 capture as the authority and 36 would leave 13 published codes on `Intl`. And a
  second gate was built that the brief did not ask for.
- **Locked paths respected?** Yes. No locked file was written. Deny lines never lifted,
  `.claude/settings.json` never opened, its `git diff` empty. **No commit carries a
  LOCK-SANCTION token, correctly, because no commit touches a locked path.** The drift gate
  reads both locked files as text and JSON only.
- **Lookup tables?** Untouched, not regenerated.
- **Every number cited?** Yes, all reproducible from the named commands.
- **Convention (l.8)?** Honoured. The one genuinely unruled money question, the platform's
  `CurrencyMeta` contradicting its own Example column for 14 codes, was escalated as comms 028
  rather than decided here.
- **Anything shipped on an interpretation?** No.

## WHAT WAS NOT DONE, NAMED EXPLICITLY

- **REQ-124 is PARKED, not fixed.** The compliant version is a coupled four-requirement change
  to a frozen published package and needs a sanction covering published artefacts.
- **Currency gate phase 2 NOT widened**, per the brief's prohibition.
- **The fixdown NOT started**, per the brief's prohibition.
- **Grouping and locale decimal marks unchanged.** The Example column specifies nothing about
  grouping, since every published example is a single-digit amount. Preserving existing
  behaviour is what keeps `XGC` and `XSC` unchanged.
- **`GBP` and `AUD` have no platform row** and correctly fall through to `Intl`. They are the
  gate's negative control.
- **SA-002 and SA-007** open since 2026-07-26, untouched. **Entry 024's two items** still
  queued for Fable.

## FOR THE NEXT SESSION

**Model and effort:** Opus 5, serial, main loop only. **Approach:** recount every premise
before writing code; generate data tables from the source rather than typing them; build the
gate before believing the fix.

**Alternatives tried and rejected:**

- *Shipping 36 codes as briefed.* Rejected: leaves 13 published codes on `Intl`.
- *Following the platform's `CurrencyMeta` rather than its Example column.* Rejected: it
  contradicts the platform's own examples for 14 codes, and TR-057 already ruled the table
  wins on the owner's live captures.
- *Adopting the platform's `toFixed` with no grouping.* Rejected: renders a thousand as
  `1000.00` and would have changed `XGC` and `XSC`, which the brief pins as unchanged.
- *Taking the lock sanction.* Rejected on the derivation, which is the whole of JOB 3.

**Files touched:** `frontend/src/lib/utils/currency.ts`,
`frontend/scripts/currency_table_gate.mjs`, `scripts/qa/bet_ladder_declaration_drift.mjs`,
`scripts/qa/doc_currency_baseline.json`, `.github/workflows/checks.yml`,
`reports/qa/compliance_register/REGISTER.md`, `reports/FABLE_COMMS.md`,
`reports/qa/session4b/REQ124_LADDER_DERIVATION.md`, `reports/qa/currency_table_2026-07-29/`,
`reports/briefs/FS_CURRENCY_SERIAL_Prompt.md`.

**THE COUNTS BELOW ARE CARRIED FROM THE BRIEF AND ARE NOT VERIFIED BY THIS SESSION.
RE-VERIFY EVERY ONE FROM THE LEDGERS AT BOOT rather than carrying them forward again.** This
session recounted four premises it was handed and all four were wrong, which is the argument
for doing it.

- The TRUE fixdown, premise corrected, is still the outstanding programme.
- **MID-01's shared clock is still unbuilt.**
- **18 parked clusters.**
- **118 upheld findings at zero fixed.** Entry 026 confirmed the 118 exactly.
- **50 requirements unguarded.** Note entry 026 corrected a neighbouring figure from 82 to
  **79** requirements with no proof path, enumerated at
  `reports/qa/session3/NO_PROOF_SET.tsv`. Establish which of the two this line means before
  quoting it.

**Open threads this session created:**

1. **Comms 028's decision request:** is the Example column authoritative over `CurrencyMeta`
   for all 14 contradicting codes?
2. **REQ-016's parked half:** does the platform EXPECT the attribution despite not requiring it?
3. **REQ-124's owner question:** is it in scope before submission at all, given the platform
   calls it a recommendation twice over?
4. **`layout_fit_gate.mjs:80` hardcodes USD**, so the money-fit gate cannot see a
   currency-width regression. Parameterising it is cheap and is now a known blind spot.
5. **Two conformance gates still rewrite 16 committed evidence files** on a plain run.


## THE CLOSE

**Owner preview, per rule 12, run BEFORE this report was written so the line is evidence
rather than an intention.** Printed line, verbatim:

```
OWNER PREVIEW  |  v10 line, main  |  commit 10cf212  |  built 2026-07-29T22:41:37+10:00  |  started 2026-07-29T12:42:11.387Z  |  http://192.168.4.92:5173
```

**And the address was CURLED, because printing a URL is not evidence the URL works**, which
is the trap rule 12 names from its own first run. `http://192.168.4.92:5173` answered
**HTTP 200**. It is run once more as the LAST action of this close, after the final push, per
the one-commit-lag clause: the line quoted here is the earlier one and the address is the
later one. A reader finding them one docs commit apart has found the design, not a bug.

**Remote CI, per rule 10.** Recorded below with the run link, checked and not assumed.

**Run `30452690054`, commit `10cf212`, conclusion SUCCESS, all 13 jobs green.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30452690054

The job that matters for this session is **`static gates`**, which carries both new gates and
both seeded self-tests, and it passed on the remote runner rather than only on this machine,
which is the distinction rule 10 exists to enforce.

**The slowest leg was `browser: bet selector` and it is NOT related to this change.** That
gate authenticates in USD (`frontend/scripts/bet_selector_gate.mjs:108`), and USD is one of
the 15 codes that did not change. The spread is runner contention, which `CLAUDE.md:713`
already records: the same class of gate took 276 seconds on one run and 173 on the next.
Judged against the range, not against a remembered number.

**Committed gate evidence is reproducible**: re-running the gate after the commit produces
output byte-identical to `reports/qa/currency_table_2026-07-29/GATE.txt`.

**`npm run check`**: 501 files, **0 errors**, 36 warnings, all pre-existing and none in
`currency.ts`.

**`git status` clean, no committed evidence rewritten.** The 16 evidence files that two
conformance gates dirtied during their re-runs were all restored from HEAD and verified.

**Final push, run `30453697686`, commit `d521c01`, conclusion SUCCESS.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30453697686

**RULE 10 HAS THE SAME ONE-COMMIT LAG RULE 12 NAMES, and it is named here rather than
chased.** Recording a run link is itself a commit, which starts another run, so a session
that insists on committing the result of its own last push never terminates. The line above
is the verified result of the push that carried this report. **This commit, which adds that
line, is documents-only**, so per the `checks.yml` `changes` gating it runs the static job
alone at about 1.4 minutes rather than the full matrix. Its result is verified and reported
to the owner in the session close message rather than committed, which is where the chain
stops.
