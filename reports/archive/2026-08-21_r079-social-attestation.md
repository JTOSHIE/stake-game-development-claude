# Session Report - R079 SOCIAL WORDING ATTESTATION SWEEP (2026-08-21)

Brief saved verbatim: `reports/briefs/FS_FABLE_R079_SOCIAL_ATTESTATION_Prompt.md`, the sole
live brief, including the owner's capture of the Start Approval Step 2 table. Branch:
`main`, as integrator. **Read-only against the shipped bundle: no code changed, no rebuild,
nothing patched.** Locked paths untouched.

## THE LINE FOR THE OWNER AT THE FORM (TASK 3)

> **Attestation basis, R079, 2026-08-21.** Swept 33 restricted phrases, a SUPERSET of the
> form's 32 (the union of the form's table and the platform's docs table, which carries one
> more), whole-word and case-insensitive, over every player-facing string the shipped
> bundle renders in social mode: 203 of 203 string keys resolved as social renders them,
> plus 3,402 harvested rendered strings across eight surfaces. **Zero hits in every string
> this studio authors.** The single occurrence anywhere is the word "stake" inside
> `TM and © 2026 Stake Engine.`, the closing line of the platform's OWN mandated General
> Disclaimer, which the platform requires shipped verbatim and which R078 ruled is the
> branding rule's one scoped exception. Bundle stamp: v10, commit `38cd2257` content at tip
> `fada3c77`, cleanTree true, 93 files, 12,455,660 bytes.

**It is not zero, and the owner should tick the box knowing exactly why.** One restricted
phrase does appear on a social surface. It is not our wording: it is the platform's own
mandated paragraph, which we are required to ship byte-exact and forbidden to alter. A
reviewer running the same grep will find the same single hit, so it is better met with an
explanation than discovered.

## TASK 1, the form's table against the mirror: NOT IDENTICAL

The brief's expectation was "identical, per Fable's spot-match of the distinctive rows".
**The spot-match does not hold across the whole table**, and the differences are quoted here
per the brief's instruction rather than acted on.

The form carries 32 rows, all 32 unique. The dated mirror carries 39 rows and 33 unique
restricted phrases. Two substantive differences, in both directions:

**1. A restricted phrase in the docs that the form omits.**

    docs:  fund    ->  balance
    form:  (absent)

**2. A replacement that differs.**

    docs:    credit  ->  balance
    form:    credit  ->  coins

Four further apparent differences are artefacts of the PLATFORM'S OWN internal duplication
rather than a form-versus-docs disagreement. The docs table lists six phrases twice, and
four of those carry a DIFFERENT replacement each time; the form lists each once, choosing
one. Quoted so the owner can see it is the platform's inconsistency and not ours:

    docs:  paid out -> win        AND  paid out -> won      (form keeps: win)
    docs:  pays out -> won        AND  pays out -> win      (form keeps: won)
    docs:  betting  -> play / playing AND betting -> playing (form keeps: play / playing)
    docs:  total bet -> total play AND total bet -> play    (form keeps: total play)
    docs:  win feature -> play feature, twice, identical
    docs:  pay out -> win / won, twice, identical

**MY OWN SOURCE WAS CHECKED BEFORE THE DIFFERENCE WAS CALLED REAL**, because a stale mirror
would produce exactly this appearance. The table is byte-stable across all six captures:
the canonical mirror fetched 2026-07-04 and the dated captures at 2026-07-29, 2026-08-10,
2026-08-11, 2026-08-15 and 2026-08-20 all carry 39 rows, 33 unique phrases, `credit ->
balance` and `fund -> balance`. The docs have not moved in seven weeks, so the form and the
documentation genuinely disagree today.

**ESCALATED, not acted on.** Which instrument governs the attestation is the owner's and
Fable's to say. The sweep therefore used the UNION of both lists, 33 phrases, so the result
holds whichever governs.

## TASK 2, the sweep

**The phrase list was built from the PLATFORM'S sources**, the form table and the docs
mirror, never from this repository's own transcription. Scanning our table against our
strings would share an input and so could share its flaw, which is convention (l.4). Our
transcription was then checked AS A SEPARATE QUESTION and is an exact set match: 33 in, 33
out, nothing missing, nothing extra, and it cites its source sha and row count.

Three passes, agreeing:

**Pass 1, static, complete over the string tables.** Every one of 203 player-facing keys
resolved through the real resolver as social mode renders it. Five raw hits. **Four of the
five do not render in social mode**, because the component handles social at the CALL SITE
rather than in the table, which the static pass cannot see:

    replayBetLabel       "Bet"        ReplayMode renders `mode === 'social' ? 'Play' : ...`
    replayCurrencyLabel  "Currency"   ReplayMode renders `mode === 'social' ? 'Token' : ...`
    betUnit              "bet"        FeatureMenu wraps it in sv(), the substitution layer
    baseBetUnit          "base bet"   fsModes returns "base play" on the social branch

**Pass 2, dynamic, what a player actually sees.** The built bundle driven in social mode,
232 unique rendered strings across boot, first paint, features menu, the paytable through
twelve scroll passes, the HUD menu, the session panel, a spin and social replay. One hit.

**Pass 3, the CI gate's own walk, as corroboration on the surfaces pass 2 could not reach.**
`social_dom_conformance` covers eight surfaces INCLUDING the win banner and the autoplay
menu, harvesting 3,402 social strings, and reports exactly one informational hit. PASS.

**The result, per phrase.** Zero hits for: at the cost of, be awarded to player's accounts,
bet, bet/s, bets, betting, bonus buy, bought, buy, buy bonus, cash, cost of, credit,
currency, deposit, fund, gamble, money, paid, paid out, pay, pay out, payer, pays, pays out,
place your bets, purchase, rebet, total bet, wager, win feature, withdraw. That is 32 of 33.

**One hit, quoted verbatim with its surface**, as the brief requires:

    phrase:  stake
    surface: the rules and paytable overlay, social mode, p.fs-disc
    text:    "... Winnings are settled according to the amount received from the Remote
              Game Server and not from events within the web browser. TM and © 2026
              Stake Engine."

**The carve-out is cited because it actually hits.** R078 ruled the platform-mandated
General Disclaimer block is required shipped text carrying the platform's own mark by
mandate, the branding rule's one scoped exception (TR-177). The word is inside that block
and nowhere else in any social surface.

## THE INSTRUMENT WAS PROVEN ABLE TO FIRE BEFORE ZERO WAS REPORTED

A sweep that finds nothing and a sweep that is broken produce identical output, so the
scanner was seeded before its result was believed. For each of the 33 phrases: a positive
control, the phrase case-flipped inside a sentence, which must match; and a negative
control, the phrase glued inside a longer word, which must NOT. **33 of 33 fired on the
positive and stayed silent on the negative**, in the same JavaScript regular expression that
produced the results, not a re-implementation of it. Plus the control that matters most: the
scanner does find "stake" in the mandated closing line, so the one hit is a real detection
rather than a coincidence.

## Coverage stated honestly, including what each pass could not reach

Pass 2's drive could not open a buy dialog, and that is not a hole: the buy control was
DOCKED into the features menu by R059, so `buy-bonus-button` does not exist as a separate
surface in this build. The buy path's strings were harvested from the features menu and the
paytable, and they read "GET FEATURES", "Get Overdrive", "GET FEATURE", "Feature Play: play
100× your total play to start the feature instantly" and "Insufficient coins. Please add
coins." Pass 2 also did not render a win banner, because `windemo` is DEV-only and correctly
does not reach a built bundle, and the mock spin did not settle a win. **Pass 3 covers both
the win banner and the autoplay menu**, which is why it is reported rather than treated as a
duplicate of pass 2.

## Verification

The bundle swept is the shipped artefact: stamped at tip `fada3c77`, cleanTree true, 93
files, 12,455,660 bytes, byte-identical in size to the build verified against the branding
gates at R078, and the only commits between are record-only (`reports/**`, confirmed by
diff). No rebuild was performed, per the brief.

Document currency run over the close-state tree before pushing. Explicit paths per (k).
Gates chained with `&&` per (u.1).

## ESCALATIONS

**E1 (R079), and it is the one that needs a ruling before Step 2 is ticked.** The Start
Approval form's table and the platform's own published table disagree, quoted in TASK 1
above: the docs restrict `fund` and the form does not list it, and the two give different
replacements for `credit`. The sweep is clean under BOTH readings, so this does not block
the attestation, but the owner is ticking a confirmation against a list whose authoritative
version is ambiguous, and that is worth knowing at the moment of ticking rather than after.

**E2 (R079), carried from TASK 2 rather than found by it.** Four keys hold restricted words
in their table values and are saved only by call-site handling: `replayBetLabel`,
`replayCurrencyLabel`, `betUnit`, `baseBetUnit`. Nothing renders them today and no gate is
wrong. It is recorded because a future component that reads one of those keys directly,
without the ternary or the `sv()` wrapper, would ship a restricted word with every existing
gate green, and the cheapest guard is knowing the four names.

TR-148's four escalations, R078's E1 and E2, and the R074 bundle all stand where they were.

## FOR THE NEXT SESSION

Nothing. The owner ticks Step 2 on the line at the top of this report, pastes the game
details at Step 3, and submits.

Model and effort: Fable, judgement tier, one short session, integrator on `main`, read-only
throughout. Approach: derive the phrase list from the platform's own sources, resolve every
key through the real resolver, harvest the rendered bundle, corroborate on the surfaces the
harvest could not reach, and seed the scanner before believing its zero. Alternatives
rejected: scanning with this repository's own PROHIBITED_TERMS table, which shares an input
with the strings under test and would have made agreement meaningless; and reporting the
static pass's five hits as findings, which measurement showed to be four false positives of
a method that reads table values rather than rendered output.
