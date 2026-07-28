
# Session Report - THE FINAL MILE, JOBS 1 AND 2 (2026-07-28)

Brief saved verbatim: `reports/briefs/FS_FINAL_MILE_Prompt.md`, commit `fa5dab8`,
per conventions (b) and (f). Fresh session on `main`, integrator role, explicit
paths, one commit per job. No lock exception was taken: the conditional sanction
in JOB 4 was never reached, and `.claude/settings.json` is untouched.

**THIS SESSION COMPLETED TWO OF SIX JOBS AND STOPPED AT A JOB BOUNDARY**, which
is what the brief asked for: *"Jobs ordered heaviest first; stop honestly between
jobs, never inside one."* JOBs 3, 4, 5 and 6 were not started. What they will
need is in the handover below, and JOB 1 has already assembled most of JOB 3's
and JOB 4's evidence.

## JOB 1, ingest round three and the owner's session (`b40c476`)

All three round three reviews arrived inside one Desktop document,
`Stake Engine Approval ReportS.docx`, 66,110 bytes, SHA-256 `d7ef5d95...`. The
brief named no path, so the located path is recorded per convention (m).
Extracted with `pandoc -f docx -t gfm --wrap=none` (the round two tool and flags,
so the two rounds are comparable artefacts), split three ways at the document's
own heading lines, and the split proved lossless with `cat ... | cmp`, exit 0. A
`textutil` extraction agrees on all three boundaries and all three scores; per
(l.4) that is a check on the PARSER, not independent confirmation of content.

Scores: reviewer 1 **0.00**, reviewer 2 **1.33 / 3.00**, reviewer 3 **2.00 / 3.00**.

**The single most important fact about this round.** Reviewers 2 and 3 both name
`649993cca763650d2e9b0092a1a68987a73ffeee` and both quote file contents and line
numbers from it; reviewer 2 ran `verify_books_lookup_equality.py` itself and
recomputed all five lookup CSVs. **Reviewer 1 reached no commit at all.** Its own
text records the repository as "completely inaccessible" inside its container and
its remediation list opens with "Restore Audit Access". Its 0.00 is scored
against that inaccessibility. The three files are therefore not interchangeable
evidence and the tracker keeps them apart.

Eleven rows, TR-105 to TR-115. Reviewer 1's claims are disposed of on their
merits rather than on its environment:

- **TR-106, the 500,000-round claim. REFUTED.** The premise is wrong: cap
  obtainability here is not sampled, so no sample-size argument applies. The
  published lookup tables ARE the complete weighted outcome space. Read in closed
  form from `publish_files/lookUpTable_<mode>_0.csv`, the cap carries an exact
  weight in every mode: base `11258999000 / 1125899906813400` = **1e-5 exactly**,
  cruise 4e-6, antelite 1.25e-5, bonus 1e-3, super 4e-3. There is no estimator,
  so the review's Poisson calculation describes a measurement this project does
  not rely on. Independently, the platform's own compliance panel passes
  *"Maximum Win Achievability"* at **1 in 0.10M against its published 1-in-20M
  threshold**. And empirically, the cap was hit and paid live. The 10,000,000
  figure is a per-mode event CEILING in the format criteria, not a floor;
  reviewer 2's own checklist reads it that way.
- **TR-107, the uint64 misscale claim. REFUTED by the platform's own settlement.**
  The predicted failure was a live-deployment failure, so the live platform is
  the authority. `023040_frame.png` shows the platform's Bets ledger settling a
  base round at **`+EUR 5,000.00` at `x5000.00`** against a EUR 1.00 bet. Not
  x500,000, not rejected, on the exact files predicted to cause it.
- **TR-105 and TR-108** dispose of the environment failure and the "tracker
  entirely unreliable" verdict, the latter contradicted by both other reviewers,
  who actually performed the sampling: 8 + 3 rows and 11 + 4 rows respectively.
  **Both of their qualifications are kept as findings rather than as vindication**,
  because "MERGED does not always mean confirmed in production" is fair and
  TR-087 was exactly the row they meant.

Thirty-seven owner captures ingested to
`reports/screens/owner-session-2026-07-28/` with a catalogue in the analyst
pattern, what each frame SHOWS kept apart from what it PROVES. The already
ingested 07:17 to 08:59 portal set was deliberately not duplicated.

- **TR-057 CLOSED.** Six independent frames of the platform's own ledger print
  XGC at exactly two decimals with comma separators, on costs, wins and zero
  payouts alike. The interim position is confirmed by the only authority that
  could confirm it and **no code changes**.
- **TR-064 CLOSED, on a matched pair rather than one frame, which is what makes
  it conclusive.** `152145`: the `wallet` filter with Invert unchecked shows nine
  requests, every one named `play`, across eight consecutive settled zero-win
  rounds. `152225`: the identical filter forty seconds later shows **four
  `end-round` rows**, with a tooltip reading
  `https://rgsd.stake-engine.com/wallet/end-round` in full. So the filter can
  show `end-round`, and showed none on the zero-win run. The RGS returns
  `active: false` on zero-win rounds, the guideline is satisfied by the current
  gate, and **no code changes** - which is what the row's recorded warning was
  protecting.
- **TR-087 CLOSED**, re-observed live: the pod prints `350,000.00 GC` where it
  used to print `3750000.00`. The same frame revealed a second, different defect
  on that surface, filed as **TR-114** rather than folded into a fixed row.
- **TR-115** records the money display failing as one class in five places in one
  session, on five surfaces sharing no viewport, currency or component.

## JOB 2, localisation completion (`1494bdf`, plus two rule 10 repairs)

74 prose keys in a new third layer, `prose.ts`, translated into all sixteen
locales by a per-language pass: celebration tiers, five mode labels and blurbs,
paytable rules, the ways explanation, eight interface guide rows, the disclaimer
body, autoplay limits, replay status lines and eleven screen reader labels.
`fsModes.ts` carries `labelKey`/`blurbKey` instead of English, and its
`socialLabel`/`socialBlurb` fields are gone: they were a second social mechanism
beside `SOCIAL_OVERRIDES`, which is why those five strings were the only ones in
the game whose social variant did not come from the i18n layer AND were English
in all sixteen locales. Both facts had one cause.

The ALL-CAPS-only scan is replaced by `scripts/locale_prose_conformance.mjs`,
three parts because three different defects need three different instruments:
completeness; a resolver sweep over 184 keys x 15 locales; and a rendered-DOM
prose scan that loads every locale and harvests text plus the four attributes a
screen reader speaks. **1,335 strings harvested, zero English leaks.** Seeded per
convention (p), eight cases, including the German capture's own sentence as the
regression fixture, an attribute-only seed, an ALL-CAPS seed proving the replaced
gate loses no coverage, and three negative controls.

**A CORRECTION, recorded because the record is worth more than a quiet fix.**
This session first read `t()` returning English from the flat `SOCIAL_OVERRIDES`
as the root cause of the German prose gap, demonstrated it, and built per-locale
social tables for fifteen languages. **The specification says that behaviour is
correct.** Testing guideline item 46, quoted in `stores/socialLocale.ts`:
*"English is the only supported language in Social Mode"*, enforced before first
paint by `resolveLaunchLocale`, which checks social FIRST. So
`t(<non-en>, key, 'social')` is a call the running app cannot make. The fifteen
unreachable tables were deleted and the reasoning kept beside `SOCIAL_I18N`. This
is convention (l.2) exactly: the measurement disagreed with the specification and
the measurement was the broken one. The real defect the reviewers reported was
always the other one, sentence-case prose that never went through `t()` at all,
in REAL MONEY sessions; both frames they cite are real money, `lang=de` and
`lang=ar`.

The gate's own first run made the same mistake in the other direction, using
`language=` where the app reads `lang=` at `App.svelte:190`, and reported 1,412
leaks off a page that had never switched locale. Both errors are written into the
gate's header so the next reader does not repeat them.

One genuine leak found on the way and **fixed rather than allowlisted**:
`megaWin` still read `MEGA WIN!!!` in Indonesian and Vietnamese while both had
translated the tier word beside it.

## Verification

| Check | Result |
|---|---|
| `npm run check` | 0 errors, 36 warnings (baseline) |
| `typecheck_baseline.mjs` | PASS, 0 errors against a 0 baseline |
| production build | succeeds, 15,716,611 bytes |
| `locale_prose_conformance --self-test` | PASS 8/8 |
| `locale_prose_conformance` full | PASS, 15 locale pages, 1,335 strings, 0 leaks |
| `locale_completeness_check.mjs` | PASS |
| `dash_gate.mjs` | PASS, source and dist both clean |
| `paytable_card_fill_gate.mjs` | PASS, 16 locales, 22 runs, 374 cards |
| `fsModes.drift.test.ts` | PASS |
| `socialLocale.test.ts` | PASS, 65 assertions |
| `vocabulary.test.ts` | PASS |

## Rule 10, and two red runs that were both mine

**Run 30338984850 RED**, `browser: paytable card fill`, fourteen findings, all
"could not open the paytable", in every locale but `en` and `vi`. `vi` passing is
the tell: `openPaytable()` matched `aria-label === 'Menu'`, and Menu is the
Vietnamese word too. The gate had passed for four days only because the labels
WERE English in all sixteen locales, which is the defect JOB 2 fixed. The gate's
own comment eight lines lower already knew the rule and it had been applied to
the menu ITEM and not the menu BUTTON.

**Run 30339873058 RED, across every job**: `static gates` on 3 new type errors
and all ten browser legs at "production build". The repair for the first red run
added `data-testid="hud-menu"` to all four menu buttons and the mini HUD's button
already carried `data-testid="mini-menu"`; Svelte rejects duplicate attributes,
so the bundle would not compile. **The real mistake was the verification, not the
script**: `npm run check` had been run BEFORE that edit and I pushed on the
strength of it. A gate result is only evidence for the tree it was run against.

**Run 30340122159 GREEN**, all jobs success.
`https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30340122159`

## Rule 12

`npm run owner:preview` ran before this report:

`OWNER PREVIEW  |  v10 line, main  |  commit 83c7096  |  built 2026-07-28T17:52:58+10:00  |  started 2026-07-28T07:56:41.620Z  |  http://192.168.4.92:5173`

Curled rather than believed, per the rule's own warning: **HTTP 200, 1,256 bytes,
`<title>Future Spinner</title>`**.

## FOR THE NEXT SESSION

**Model and effort.** Opus 5, ultracode on, high effort. Three multi-agent
workflows: 10 agents to read 37 owner captures, 15 agents for the 129-string
localisation pass, and two 15-agent follow-ups for keys discovered mid-job. About
2.6M subagent tokens. No workflow reported partial failure, so convention (q) was
not engaged.

**Approach.** Scout inline, fan out only where the work is genuinely parallel
(one agent per image batch, one per language), and keep every edit, disposition
and commit in the main session. Every load-bearing frame was read personally
before it was cited: the wincap settlement, the zero-win network pair and the
replay ghost pod were not taken on an agent's word.

**Alternatives tried and rejected.**
- Adding 74 keys to each of the sixteen blocks in `translations.ts`. Rejected for
  a third layer mirroring the existing `featureI18n` precedent: no surgery on
  sixteen working blocks, and a generated file that cannot disagree with its own
  English source because English is not in it.
- Per-locale social tables. Built, then **deleted** on reading guideline 46. See
  the correction above.
- Widening `mini_player_proof.mjs` for TR-086. Rejected in the tracker in favour
  of JOB 3's shared mechanism, because TR-115 shows four more instances on
  surfaces that proof script never covered.
- Renaming `mini-menu` to `hud-menu`. Rejected; other scripts select by it, so
  the gate accepts either hook.

**Files touched.** `reports/briefs/FS_FINAL_MILE_Prompt.md`;
`docs/records/reviews/` sources plus README and `REVIEW_TRACKER.md`;
`reports/screens/owner-session-2026-07-28/` (37 frames plus catalogue);
`frontend/src/lib/i18n/` (`prose.ts`, `prose.locales.ts`, `translations.ts`,
`tr.ts`, `vocabulary.test.ts`); `frontend/src/lib/config/fsModes.ts`; eight
components; `frontend/scripts/locale_prose_conformance.mjs`;
`frontend/scripts/paytable_card_fill_gate.mjs`; `reports/qa/locale_prose_conformance.json`.

**Open threads, in the order the brief puts them.**

1. **JOB 3, money display as one class.** Not started. Its evidence is assembled:
   TR-115 lists five manifestations across five surfaces sharing no viewport,
   currency or component, and `160121_frame.png` is the clearest single argument,
   showing the SAME 449,400.00 GC rendered correctly by the win banner and
   ellipsised by the pod beside it. The brief wants one fit-or-abbreviate
   behaviour, proof sweeping a continuous width range against a magnitude ladder
   from cents to hundreds of millions GC, seeded per (p).
2. **JOB 4, TR-114 and TR-109.** Not started. The ghost pod is confirmed live at
   `155247_frame.png` and is a DIFFERENT defect from the closed TR-087.
   **TR-109 is deliberately not pre-judged**: the brief's conditional sanction
   turns on whether `rgsService.ts` really discards `minBet`/`maxBet`/`stepBet`
   before consumption, so the row records both reviewers' citations and rules
   nothing. Note reviewer 3 is explicit it found no CURRENT wrong display, so the
   claim is about an incomplete contract, not an observed defect.
3. **JOB 5, provenance.** Not started. **TR-110 and TR-111 are CONFIRMED and one
   part is already verified by direct read**: `build_diet_verify.mjs:47` defines
   `killPreview()` as `_server.close()` after the in-process migration while
   `:206` still calls `preview.kill()`, so the gate throws before reaching its
   assertion. That is a convention (p) failure of exactly the class (p) exists to
   catch, and the fourth on the named list in `CLAUDE.md`. The `BOOKS_MANIFEST`
   date contradiction is verified too: the current blob was introduced by
   `6757a6b`, authored 2026-07-25, while line 9 reads `Generated 2026-07-28`.
4. **JOB 6, kit V11 and close.** Not started. The Guidelines counter has not
   moved: nine frames today show `0/58`, and the tab is never opened in any of
   them, so this pack proves the count and nothing about the content.
5. **TR-112**, the shipping hygiene POLISH row, is recorded with the reviewer's
   figures attributed to the reviewer rather than adopted as ours, and is not
   scheduled by this brief.
