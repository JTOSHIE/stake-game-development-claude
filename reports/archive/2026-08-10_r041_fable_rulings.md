# Session Report - R041 EXECUTED, FABLE RULINGS ON FABLE COMMS 040 (2026-08-10)

**2026-08-10. Fable ruling block R041, answering FABLE COMMS 040.** Brief saved
verbatim at `reports/briefs/FS_R041_FABLE_RULINGS_Prompt.md` per convention (f).

Commit `7e1e140` plus this close. No locked path touched, no lock exception
requested or needed.

---

## What the ruling asked for, and what landed

| Task | State | Evidence |
|---|---|---|
| 1, cap wording, 16 locales | DONE | 34 strings, diffed against the brief, 0 mismatches |
| 2, scatter wording, 16 locales | DONE | included in the same 34 |
| 3, `errRoundIncomplete` + rewire | DONE | `liveGuard.test.ts`, plus an end-to-end render proof |
| 4, ten keys, eleven rewires | DONE | 176 values diffed, 0 mismatches |
| 5, gate widening + rebaseline | DONE | RED proven before, GREEN after, baseline 11 to 0 |
| 6, wallet deadline disposition | DONE | recorded beside the constant and in the record |
| 7, capture scaffold | DONE, UNARMED | `tools/capture_rgs_400.sh`; Q6 stays UNKNOWN |
| 8, board item | DONE | queued in the handover and the master document |
| 0, v6 request | NOT ACTIONED, as instructed | see below |

**TASK 0.** The owner's request to commit `CLAUDE_PROJECT_INSTRUCTIONS_v6.md` was
overtaken and is recorded rather than actioned: v7 (2026-07-25) is on main,
v6 is archived under `reports/archive/superseded/`, both verified by direct read.
No instructions file was created, moved or edited. The owner is re-pinning v7
project-side.

## How the strings were applied, because the method is the guarantee

The sixteen-locale values were **parsed out of the committed brief**, not retyped
into a script. A hand-copied table would have been a second transcription with
nothing checking it. Verification then evaluated the real modules with `tsx` and
diffed every string back against that same brief: **34 of 34** for TASK 1/2 and
**176 of 176** for TASK 3/4, zero mismatches. The composed social path was proved
rather than reasoned about: `sv(t('en','betUnit','social'), true)` returns
`play`, `baseBetUnit` returns `base play`, and `de`/`ja` return their own
translations.

## Two gates were repaired that R041 did not mention, both caused by its own edits

Neither was in scope as written. Both would have shipped green over a real hole.

1. **`paytable_parity.test.ts` seeded a phrase TASK 2 deletes.** Its scatter seed
   did `replace('a 1×, 3×, or 10× multiplier', ...)`. R041's rewording removes
   that phrase, so the mutation became a no-op, the gate stayed green on an
   unplanted defect and the self-test scored it MISSED, exit 1. Re-anchored on
   the KEY. **A seed keyed to prose is disarmed by any honest edit to that
   prose**, which is convention (p)'s failure mode in a new costume.
2. **`machine_tell_gate.mjs` never scanned the prose layer.** It read
   `translations.ts` alone for mixed apostrophes while its own block regex has
   always matched `prose.locales.ts`'s identical shape. The prose layer carries
   the paytable rules and the disclaimer, the longest sentences we ship and the
   ones most likely to contain an apostrophe at all. Now scanned, both directions
   checked, proven by removing the exemption (red) and by flipping the source
   (stale-exemption red).

## The one thing escalated rather than decided

**R041's apostrophe instruction cannot be obeyed in French.** Its two French
strings use U+2019 while the rest of the `fr` block uses escaped U+0027, and
`rulesSymbolValues` renders two lines above `rulesMaxWin` in the same paytable
view, so a player sees both forms at once. That is the mandate's named machine
tell, measured rather than asserted: curly at lines 374 and 375, straight at 366,
372, 380 and 396; `tr` carries none and no other locale mixes.

**The ratified wording ships untouched.** Rewriting compliance text is not a
builder's call and converting the whole `fr` block would edit prose R041 did not
rule on. The mixing is frozen as one named entry so main stays green under rule
10, any NEW mixing fails immediately, and the entry must be removed when the
ruling lands or the gate fails. **The one-line decision is
`docs/records/compliance/OWNER_RULINGS_PRESUBMISSION.md` section E.**

## Three places the ruling was incomplete, closed on the evidence

- **`waysCount` had no rewire target.** Q3's own table names
  `WinBreakdown.svelte | N ways`, so that is where it went. Recorded rather than
  silently chosen, because placement of player-facing text is not a builder's
  invention.
- **"HudOverlay both audio panels" undercounts.** There are four, at 389, 532,
  616 and 778. All four rewired.
- **`App.svelte` and `WinBreakdown.svelte` are absent from the COMMITS list**,
  and the work is impossible without them: `App.svelte` is the only render site
  of the guard banner. Committed, and named here.

`FreeSpinsPresentation` took `t(lang, 'overdriveFreeSpins', mode)` rather than
`$tr(...)`: `$tr` is not in scope there and the file's own pattern is `t()`. The
ruling's escape hatch covers it.

## Verification

- **61 static gates green locally**, run one at a time from the CI list.
- `npm run check`: **505 files, 0 errors** (36 pre-existing warnings).
- `dist_hygiene_gate`, `build_diet_verify`: PASS from a clean tree.
- `hardcoded_string_gate`: self-test **5 seeded, 7 negative controls**, all
  caught; live scan **0 outstanding, 2 exempt by design**. Proven end to end by
  putting the real defect back into the real component and watching it fail.
- `liveGuard.test.ts`: the new banner map asserted, and proved to go red when the
  map is disarmed.
- **Two new proofs**, both reading TEXT as well as pixels, because a screenshot
  proves something rendered and not which string:
  `scripts/r041_wording_proof.mjs` (rules in en/de/ja/zh, HUD audio in de, replay
  meta in real and social) and `scripts/r041_stall_banner_proof.mjs` (a wallet
  that hangs, the 15s deadline, and the German `errRoundIncomplete` on screen).
  Frames and two observation ledgers in `reports/screens/r041/`.

**Two defects found in my own work, both by a gate rather than by me.**

1. Both proofs first wrote `observations.json` to the same directory and the
   second clobbered the first. Separate filenames now, both re-run.
2. **I overwrote this file.** Convention (a) reads like "write the session
   report", and this report ACCUMULATES: 11,030 lines and 327 headings. I
   replaced it with a 147-line document. `doc_currency_gate` went red
   immediately, because twenty-nine other documents cite line numbers inside it,
   and that is the only reason it was caught in the same minute rather than at
   review. Restored from `7e1e140` and appended instead; the archive copy under
   `reports/archive/` is this session's section alone, which is what (a) asks
   for. **The lesson is the one already written down and not followed: look at
   the target before overwriting it.** A file whose name is singular is not
   thereby a file that holds one thing.

---

## FOR THE NEXT SESSION

**Model and effort.** Opus 5, ultracode on. One eleven-agent read-only workflow
established ground truth before any edit (ten probes plus a completeness critic,
about 1.36M subagent tokens, 22 minutes). **That workflow paid for itself twice
over**: the critic found the paytable-parity regression and the apostrophe
conflict, neither of which any probe had been asked about and neither of which I
would have found before CI did.

**Approach.** Every file:line in the ruling was treated as REPORTED under rule 16
and recounted. All of them held except the HudOverlay panel count.

**Alternatives tried and rejected.** Adding `betUnit` to `SOCIAL_OVERRIDES`
instead of wrapping in `sv()`: both produce `play`, but the ruling names `sv()`
and doubling the mechanisms would leave two places to change. Rewriting the NUL
sentinel in `hardcoded_string_gate` as an escape: rejected once `keyOf` was found
to use the same convention.

**Open threads.**

1. **Section E, the French apostrophe.** One line from the owner or Fable. It is
   the only thing R041 left that a builder cannot close.
2. **Q6 stays UNKNOWN.** `tools/capture_rgs_400.sh` is written and deliberately
   unarmed. It needs one owner-pasted launch URL, then a run and a commit.
3. **PROSE_NUMERAL_LOCALE_PASS**, queued. Prose figures are en-formatted in all
   sixteen locales while the mode cards beside them are locale-formatted, so a
   German player can see one quantity punctuated two ways. R041 pinned `5,000×`
   on purpose so the wording could land first.
4. **Not done, recorded so silence is not read as coverage:** `mini_player_proof`
   still runs English-only; FEATURES, the bet selector, the HUD menu, the
   autoplay menu and the resume banner are still not focus-contained; the session
   panel still covers two tiles at Popout S.
