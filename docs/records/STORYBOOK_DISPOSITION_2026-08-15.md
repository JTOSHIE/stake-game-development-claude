# The Storybook disposition, and the coverage that replaces it

Written 2026-08-15 as TASK 3 of `reports/briefs/FS_FABLE_R070_DOCS_MIRROR_Prompt.md`,
so the answer exists in writing before a reviewer ever asks it. Tracker row TR-147.

Australian English, no em dashes or en dashes. Upstream quotations carry whatever
punctuation upstream used, per convention (l.7).

---

## 1. The disposition, stated plainly

**The official Stake Engine front-end template was not used, and neither was its
Storybook. Future Spinner is a from-scratch build.** This was a deliberate route, taken
early, and nothing on the platform's docs site requires the template: the front-end
sub-tree describes a sample repository rather than a submission requirement.

VERIFIED 2026-08-15 by reading all ten front-end pages of the live capture at
`docs/stake-engine-live/2026-08-15/` in full: **none of them states a requirement.** No
"must", no "required", no limit, no endpoint, no field the platform validates. The one
contract-shaped content in that sub-tree is the book and bookEvent JSON shape on
`docs/stake-engine-live/2026-08-15/front_end_flowchart.md`, and our reader matches it:
`frontend/src/lib/services/roundInterpreter.ts` declares `BookRound` with `id`,
`payoutMultiplier`, `events`, `criteria`, `baseGameWins` and `freeGameWins`, exactly as
the page's own example shows.

VERIFIED the same day by direct listing: there is no TurboRepo config file, no pnpm
workspace file, no apps or packages tree, and no Storybook dependency in
`frontend/package.json`. Those four names are deliberately left unbackticked, because a
backticked path that does not exist is a dead-path claim to the document currency gate,
and their ABSENCE is the finding. We do not half-use the template; we do not use it.

---

## 2. The docs page's own definition of done, quoted

`docs/stake-engine-live/2026-08-15/front_end_storybook.md` ends with its own test for
completion:

> With all the stories above and the stories that created and customised by yourself, we
> are able to test the whole game, intermediate components and atomic components.
>
> We are also able to test our game with a book, a sequence of bookEvents and a single
> bookEvent.
> If each bookEvent is implemented well with emitterEvents and its story is resolved
> properly, the game is technically finished.

That is the standard this mapping answers, clause by clause, rather than an argument
about tooling.

---

## 3. The mapping: their story classes, our instruments

Every instrument named here runs in CI on `.github/workflows/checks.yml`. Read the leg
count from that matrix rather than from this page, per convention (s); as a dated record,
the run at the R068 close carried 29 jobs, all green.

| The docs page's story | What it proves | Our instrument, and where it runs |
|---|---|---|
| `COMPONENTS/<Game>/component`, "it doesn't skip the loading screen" | The boot path renders and behaves | `browser: splash calm` (`frontend/scripts/splash_calm_gate.mjs`) asserts the boot screen is calm and that only the intended element animates; `browser: scrim coverage` (`frontend/scripts/scrim_coverage_gate.mjs`) asserts the full-screen scrim covers the viewport at every aspect ratio, which is where the letterboxed stage broke it |
| `COMPONENTS/<Game>/preSpin` | The pre-spin surface | `browser: bet selector` (`frontend/scripts/bet_selector_gate.mjs`); static `bet ladder model` (`frontend/src/lib/stores/betLadder.test.ts`) against the authenticated ladder; `modal guard and buy affordability` (`frontend/src/lib/stores/modalGuard.test.ts`) per tier; `browser: autoplay confirm gate` and `browser: autoplay two-step proof` |
| `COMPONENTS/<Game>/emitterEvent`, for example "boardHide" | A SINGLE event, in isolation | `browser: retrigger moment` (`frontend/scripts/r062_retrigger_proof.mjs`) fires exactly once on the settled retrigger event and zero times on the non-retrigger fixture; `scatter anticipation`; `browser: win count-up steady` and `browser: win count-up sync`; `browser: max-win hold` |
| `COMPONENTS/<Symbol>/component` with state controls, and `COMPONENTS/<Symbol>/symbols`, all symbols and all states | The atomic components | `browser: paytable card fill` (`frontend/scripts/paytable_card_fill_gate.mjs`) measures EVERY card at ALL sixteen shipped locales, with the locale list derived from what ships rather than hardcoded; `browser: contrast` and `browser: layout fit`; and `paytable parity against the shipped maths` (`frontend/src/lib/config/paytable_parity.test.ts`) pins every paid combination, both scatter awards and the max win figure to `games/future_spinner/game_config.py` and the lookup tables |
| `MODE_BASE/book/random` and `MODE_BONUS/book/random`, a whole book | The whole game, end to end, per mode | REAL book rounds, copied verbatim out of the shipped `books_<mode>.jsonl.zst` by `frontend/scripts/extract_replay_fixtures.mjs` into `frontend/src/lib/services/__fixtures__/replay_rounds.json`: five modes, the categories loss, win, bigWin, cap and feature in every mode where the category exists. They drive `browser: replay contract`, `browser: replay fit`, `browser: money fit`, `browser: direction parity` and `browser: retrigger moment`, and are asserted statically by `frontend/src/lib/services/replayRounds.test.ts` |
| `MODE_BASE/bookEvent/reveal`, "It will spin the reels" | The reveal path | The same real rounds run through `frontend/src/lib/services/roundInterpreter.ts`, the single canonical reader; `browser: turbo intensity` asserts the spin at speed and `browser: win count-up steady` asserts the settle |
| "a book, a sequence of bookEvents and a single bookEvent" | The three granularities | Book: the fixtures above. Sequence: `browser: replay contract` drives whole rounds including feature settlement at three sizes against the real captured platform payload. Single: the per-event proofs above |
| "the game is technically finished" | The completion test itself | Every leg green on the REMOTE run, verified per multi-track rule 10 before any session closes, over a production build made from the committed tree |

---

## 4. Why this is equivalent AND stronger, stated as checkable properties rather than as a claim

1. **Our instruments have been proven able to fail.** Convention (p): every gate that
   claims a class is closed ships a self-test that plants the defect in the form it
   really occurs and must go red on it before its pass counts, and those self-tests run
   in CI beside the gate. **A Storybook story cannot fail by itself**; it renders a state
   and waits for a human eye. This project has four recorded instances of a green gate
   sitting over a live defect, which is exactly why the rule exists.
2. **The books are real, not random.** The docs page's own class is `book/random`. Our
   fixtures are extracted verbatim from the shipped, frozen, published books, so a round
   under test is a round a player can actually be dealt.
3. **It runs on every push, not on demand.** A story is run by whoever remembers to open
   it. The matrix runs on every push and pull request, and a red leg names the gate that
   failed without anyone opening a log.
4. **It covers surfaces Storybook does not reach**: sixteen locales, the full currency
   table against the platform mirror, social and gold-coin mode, right-to-left direction
   parity, the replay contract against the real captured platform payload, sub-cent
   display, network hygiene and build diet, and the shipped `dist` scanned for machine
   tells and brand tokens.

---

## 5. What Storybook would give us that we do not have, recorded honestly

**An interactive, browsable catalogue of every symbol in every state, side by side.** We
assert symbol values statically and measure every rendered paytable card in every locale,
which is the compliance-relevant half; we do not have a developer-facing surface for ad
hoc visual exploration of one component in isolation.

That is a development convenience rather than a submission requirement, and adopting it
now would mean adopting the template's monorepo shape, which is the one change nobody
should make between here and submission. Recorded so the gap is a stated choice rather
than an unexamined absence.
