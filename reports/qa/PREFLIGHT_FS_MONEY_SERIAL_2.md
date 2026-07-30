# PRE-FLIGHT: FS_MONEY_SERIAL_2, and the verdict is DO NOT ISSUE

**Run 2026-07-30 by the Head of Engineering seat, per `docs/records/ROLE_HEAD_OF_ENGINEERING.md`
section 3, before either brief was issued.** Five verification agents against HEAD, then two
adversarial reviewers over their results. **Both reviewers returned DO_NOT_ISSUE independently.**

**This document does not edit either brief.** Convention (f) means a brief is saved verbatim
and never corrected, so the corrections live here, beside it. Both briefs are committed
unaltered at `reports/briefs/`.

**Nothing here overturns a ruling.** The Product Owner's rulings are sound as DECISIONS. What
failed is the repository premises the brief attached to them, and every one of these was
checkable before a lock was spent.

Australian English, no em dashes or en dashes.

---

## 1. THE HEADLINE: THE SANCTION AS SPECIFIED BUYS NOTHING

The sanction lifts the lock on `frontend/src/lib/services/rgsService.ts` for two edits. **On
the evidence, neither edit is the right one, and one of them is not needed at all.**

### 1a. S2-C115 requires NO EDIT. The line already implements the ruling.

The ruling: *"the wire carries the player's raw language preference exactly as requested"*.

`rgsService.ts:525` at HEAD is `const lang = p.get('lang') ?? 'en'`. Measured across nine URL
shapes: `?lang=DE` sends `DE`; `?lang=  ja  ` sends `  ja  `; `?lang=zz9` sends `zz9`;
`?lang=` sends the empty string. **In every case where the player supplies a lang, the line
transmits it byte for byte.** No lowercase, no trim, no whitelist, no social override.

**The finding's own proposed fix does the OPPOSITE of the ruling.** It would replace `:525`
with `resolveLaunchLocale`, which at `frontend/src/lib/stores/socialLocale.ts:70` returns `en`
outright in social mode, lowercases and trims at `:72`, and whitelists against the sixteen
shipped locales at `:73`. Under the ruling, `?lang=de&social=true` must put `de` on the wire.
The proposed fix would put `en` there.

**The correct action is to CLOSE S2-C115 as ruled and already compliant**, not to spend a lock
on it.

The one residual: with no `lang` parameter at all, `?? 'en'` substitutes a preference the
player never expressed. That is a default where there was no request rather than an edit of a
request, so the ruling's words do not reach it. **It is a question for the owner, not an edit.**

### 1b. Line 735 is not a clamp site, and the real clamp site is not locked.

REQ-121 governs the wager the game SUBMITS. `:735` is inside `initRGS` and PUBLISHES the bet
ladder; the wager is formed about a hundred lines earlier in a different function. **Filtering
`betLevels` at `:735` is a no-op in both branches**, and a clamp gate written against it would
go green over an unfixed defect.

The clamp belongs in `frontend/src/lib/stores/betLadder.ts:39-41`, **which is not locked.**
What `:735` needs is a one-line PASSTHROUGH publishing the already-parsed `auth.minBet` and
`auth.maxBet`, mirroring the existing `rgsBetLevels.set(auth.betLevels)`.

**And the project's own prior derivation names a route needing no sanction at all.** The brief
neither cites nor rebuts it.

### 1c. The defect the sanction rests on may not be reachable.

The mechanism is real and repo-checkable: limits are parsed at `:565-567` and never published.
**But the harm only bites when an authenticate response supplies `minBet` and `maxBet` WITHOUT
`betLevels`, and our own pinned contract declares that impossible**: `OfficialAuthenticateConfig`
at `rgsService.ts:167-173` lists `betLevels` as REQUIRED. When `betLevels` IS supplied, every
offered value came from the platform and is authorised by construction.

Incidence: **UNKNOWN without the live platform.** `reports/FABLE_COMMS.md:155-157` states "the
game can submit a wager outside them" as fact. It is conditional on unmeasured platform
behaviour, and **that line is mine.**

---

## 2. THE THIRD LOCKED EDIT, WHICH CI CANNOT CATCH

The sanction covers rgsService.ts *"solely for the two ruled edits"*. The brief then orders
**S2-C060's fix in the same session**, whose recorded fix site is `rgsService.ts:799-807`, a
third region of the same locked file, in a third function.

**CI provides no backstop.** `scripts/qa/locked_paths_gate.mjs` `judge()` compares path SETS.
Driven directly: a commit touching rgsService.ts with a matching token returns `ok:true`
regardless of how many edits it contains. `TOKEN_RE` captures a date and a path list and has
no line-range field, so **"solely for the two ruled edits" is unexpressible in the mechanism**
and only a human can enforce it.

**The Product Owner has already ruled the other way on this exact question**, at
`reports/FABLE_COMMS.md:176`: *"S2-C060 needs its own serial money-path brief rather than a
sanction alone."*

**And S2-C060's derivation contains a false statement.** It claims `docs/stake-engine-live/`
holds *"ZERO occurrences of end-round, endRound or end_round in any file"*. Six files under
`docs/stake-engine-live/2026-07-29/` contain them, including `rgs.md:37`. The mirror was
committed before the derivation was written, so the grep was wrong at the time. Direction
matters: the platform text makes the finding STRONGER, not weaker.

**Adjacent and unnamed by the brief:** `rgsService.ts:799` is the `needsEndRound` gate pinned
by TR-064, an owner-PARKED OBSERVE FIRST, NO CODE CHANGE ruling.

---

## 3. THE REPRODUCTION CONDITION IS MIS-ENUMERATED

The brief gates the sanction on reproducing *"all four SHARD_H derivations (S2-C061/064, C115,
C062's derivation)"*.

- **SHARD_H produced FIVE rows**: S2-C060, S2-C061, S2-C064, S2-C110, S2-C115.
- **S2-C062 is not a SHARD_H row at all.** Its `src` is `session3:JOB4` and its `derived` field
  is the empty string. Reproducing it says nothing about SHARD_H.
- **S2-C060 is the omitted one, and it is the money-path row whose fix the same brief orders.**
  So an unreproduced SHARD_H hypothesis would be built into the money path in the session that
  gates three others on reproduction.

**Reproduction is otherwise achievable**, and this is the good news: every load-bearing citation
in S2-C061, S2-C064 and S2-C115 is a static read of a tracked file. No live RGS needed. The
18-reference enumeration underpinning REQ-121's NOT_MET grading **reproduces exactly at HEAD**.

**But four line citations have drifted** and a session told to reproduce by opening the cited
line would find the wrong code: S2-C115's `socialLocale.ts` citations are all off by three;
S2-C062's `currency.ts:211` moved to `:343` and `:375`; S2-C064's `:632` is `:633`.

**And a second in-repo derivation DISPUTES S2-C061** on the exact point the sanction turns on.
`reports/qa/session4b/REQ124_LADDER_DERIVATION.md` reads the fallback's COMMENT as behaviour and
calls it "not a production surface". S2-C061 is right on the code and REQ124 is wrong on that
row, but per `LEDGER.md:130` a second independent derivation is material and must be weighed
rather than skipped.

---

## 4. THE PRECISION RULING RESTS ON PREMISES THAT DO NOT HOLD

**The contradiction it harmonises was manufactured by our own register.** `rgs.md:297` is ONE
sentence pair, hedged throughout: *"How these win values are displayed is at the discrecion of
the publisher, though it is reccomonded that the extra precions is only displayed with the base
bet-size is <$0.10"*. Splitting it into REQ-126 and REQ-127 as two same-weight rows promoted
advice to obligation. **The single mandatory clause is that wins show exact amounts.** There was
never anything binding on the other side to harmonise with.

**The authenticated minimum is not $0.01.** It is established nowhere, and every concrete figure
in the repository says $0.10, including the platform's own examples at `rgs.md:302` and
`rgs_wallet.md:42` (`"minBet": 100000`). Worse: **`minBet` is parsed at `:565` and then
discarded.** No production module outside rgsService.ts references it.

**"Never round upward" describes what the code does NOT do today.** Every win readout goes
through `formatBalance(Math.round(...))` at five sites, and `Math.round` rounds half away from
zero. Adding decimal places **would not change the rounding mode**, so the stated defect would
survive the fix.

**And the two/four decimal split does not close the requirement.** A payout renders exactly in
cents only when payout times base bet is a whole number of cents. **$0.10 is not "under $0.10"**,
so the current ladder floor lands on the two-decimal side of the proposed boundary. Measured
share of rounds whose win is not a whole number of cents at $0.10: **base 24.6%, Buy Overdrive
87.8%.**

**The floor cannot be moved in this session anyway.** It is declared in three locked files, and
`CLAUDE.md` freezes the published lookup tables. Changing only the client would ship a game
offering levels the submitted package does not declare, with every gate green.

**One live mischarge path the brief does not mention:** `HudOverlay.svelte:144-146` re-snaps the
current bet reactively when the ladder changes, with no confirmation and no direction guard. A
ladder change can therefore silently re-price an open bet UPWARD, and one SPIN press charges it.

---

## 5. WHAT THE BRIEF IS MISSING AS A BRIEF

It fails this seat's own gate. It names `_TEMPLATE.md` rather than carrying it: **no BUDGET, no
STOP LINES, no DEGRADATION ORDER, no DONE MEANS as an end state, no WHAT THIS SESSION MUST NOT
DO, no premise provenance tags.**

The consequence is concrete: a session holding an irreversible lock over twelve deliverables
cannot tell what to drop first, so it sheds the LAST work rather than the RIGHT work.

**It is also not one session's work.** Twelve deliverables with delegation forbidden, which puts
it squarely against `AGENT_BUDGET_AND_SCHEDULING.md` 4.5, the main-loop context line that has
already ended two sessions.

**And the rulings it implements are not in the repository**, which convention (m) forbids: work
citing a document does not start until the document is in the tree. The brief orders them
transcribed AFTERWARDS.

---

## 6. WHAT I RECOMMEND

1. **Land the rulings in `FABLE_COMMS.md` as a dated entry first.** Convention (m).
2. **Close S2-C115 as ruled and already compliant.** No edit, no sanction. Put the absent-lang
   default to the owner as a separate one-line question.
3. **Re-derive REQ-121's route before spending anything.** If the non-locked route holds, the
   sanction is not needed at all; if it does not, the sanction is for a one-line PASSTHROUGH at
   `:735`, with the clamp built in non-locked `betLadder.ts`.
4. **Remove S2-C060 entirely.** It takes its own serial brief, per the Product Owner's own
   earlier ruling, and its derivation needs correcting first.
5. **Split the rest.** REQ-121 chain in one session; precision in another, after the owner has
   ruled on the two money-display questions the harmonised reading leaves open.
6. **Escalate the precision finding**, because it changes the answer: the platform's text is
   advisory except for exact wins, and the exactness gap is at the CURRENT floor, not below it.
