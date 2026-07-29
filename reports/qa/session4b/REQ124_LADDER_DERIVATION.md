# REQ-124: WHICH BET LADDER DOES A PLAYER ACTUALLY SEE

**Session 4b, 2026-07-29.** `reports/briefs/FS_CURRENCY_SERIAL_Prompt.md`, JOB 3.

The brief granted a conditional lock sanction over one line of one locked file and
required the derivation FIRST: *"Only if the locked line is genuinely non-compliant AND
player-visible does the sanction apply."*

**The derivation says it is not player-visible. THE SANCTION WAS NOT EXERCISED. No deny
line was lifted, `.claude/settings.json` was never opened, and its `git diff` is empty.**

Australian English, no em dashes or en dashes.

---

## THE REQUIREMENT, QUOTED VERBATIM

Per convention (l.7), from `docs/stake-engine-live/2026-07-29/rgs.md:295`:

> New game submissions should incorporate small denomination bets, which are not yet
> industry standard, these are levels (in USD): [$0.01, $0.02, $0.05, $0.10, ....].
> Smaller denominations may require an additional floating-point representation when
> displaying wins. If the game has a minimum win of >= 0.1x, three points of precision
> are required: 0.1x * $0.01 = $0.001, while games with minimum wins <0.1x will require
> 4 points of precision.

And the sentence that sets the obligation strength, `rgs.md:286`:

> Although bet levels are not mandatory, bets must satisfy these conditions:

**The brief's framing correction is confirmed by the source.** The $0.01 is what the
platform ASKS FOR. It is not something observed live. There is no live-versus-config
contradiction in this repository, and none was looked for.

---

## THE CHAIN, DERIVED FROM THE REPOSITORY

Every link below was checked by direct read in this session. Per rule 16 and
`WAYS_OF_WORKING.md` 3.1, a prior session's narration is REPORTED, so
`reports/qa/session3/JOB4_CAUSE_REDERIVATION.md:207` was recounted rather than cited.

| Step | Evidence | What it establishes |
|---|---|---|
| The RGS returns a ladder | `frontend/src/lib/services/rgsService.ts:568` `betLevels: (config.betLevels ?? []).map(microsToDisplay)` | The authenticate response carries `betLevels` |
| It is published to a store | `frontend/src/lib/services/rgsService.ts:735` `rgsBetLevels.set(auth.betLevels)` | The platform's ladder reaches the frontend |
| The store is the model | `frontend/src/lib/stores/betLadder.ts:39-41` `$levels.length > 0 ? $levels : BET_LEVELS` | The authenticated ladder WINS; the built-in one is fallback only |
| The fallback is for dev | `frontend/src/lib/stores/betLadder.ts:36-38`, its own comment: "mock and dev runs" | Not a production surface |
| Proven in a browser | `frontend/scripts/bet_selector_gate.mjs:196-208` asserts the panel lists exactly the authenticate ladder and `contains NO value from the built-in ladder` | Wired evidence, not argument |

**So the ladder a player sees is the one the platform authenticates, per currency and per
jurisdiction. It is not `games/future_spinner/game_config.py:106`.**

### And the locked line is not merely invisible, it is not read at all

`grep -rn "bet_levels"` across the whole tree, excluding `node_modules` and `.git`,
returns exactly three kinds of hit: the declaration itself at
`games/future_spinner/game_config.py:106`; the comment at
`frontend/src/lib/stores/gameStore.ts:6` that says the frontend array "matches
game_config.py bet_levels"; and documents discussing it. **No code consumes it.**

The only denomination value in that file that reaches any artefact is
`min_denomination` at `game_config.py:105`, which `src/write_data/write_configs.py:322-323`
turns into `betDenomination` and `minDenomination`. That is line 105. **The sanction was
scoped to line 106.**

---

## WHY EDITING LINE 106 WOULD HAVE BEEN WORSE THAN LEAVING IT

What a platform reviewer actually reads is the published package, and it declares the
floor independently of `game_config.py`:

```
games/future_spinner/library/publish_files/game_metadata.json
  "betLevels": [0.1, 0.2, 0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 50.0, 100.0]
  "minBet":  0.1
  "maxBet":  100.0
  "stepBet": 0.1
```

That file sits under the same locked prefix and is **outside the sanction's stated scope**,
which was `game_config.py:106` only, "Nothing else in the package". So the sanctioned edit
could not have made the submitted declaration compliant. It would only have moved
`game_config.py:106` out of agreement with the artefact that is actually submitted, and
falsified `gameStore.ts:6`'s comment at the same time. **A one-sided widening creates a
drift that nothing currently gates**, which is why this session built
`scripts/qa/bet_ladder_declaration_drift.mjs` instead of taking the sanction.

---

## THREE FURTHER REASONS TO PARK, EACH INDEPENDENTLY SUFFICIENT

**1. The obligation is a recommendation twice over.** `rgs.md:286` "Although bet levels
are not mandatory" and `rgs.md:295` "should incorporate". Neither is a mandate, and
REQ-124 is not a submission blocker on the platform's own wording.

**2. Shipping $0.01 alone would CREATE a player-money defect, which is worse than the
non-compliance it fixes.** The same paragraph requires four points of win precision for a
game whose minimum win is below 0.1x. This game's minimum way-win is **0.08x**
(`games/future_spinner/game_config.py:127`, `(3, "L3"): 0.08`, mirrored to the player at
`frontend/src/lib/components/PaytableModal.svelte:82`). At a $0.01 bet that is a true win
of **$0.0008**. `frontend/src/lib/utils/currency.ts` now renders every fiat code at the
platform's own published decimal count, which is 2 for USD, so that win would display as
**`$0.00`**: the player is told they won nothing when they won something. REQ-124 is
therefore coupled to REQ-125, REQ-126 and REQ-127 and cannot be taken alone.

**3. The brief's own stop line.** *"If the change implies any lookup table alteration,
STOP and park: that is a different sanction."* Making the submitted declaration true means
regenerating published package artefacts, and `CLAUDE.md` holds those as frozen truth
because the optimiser is not bit-reproducible.

---

## DISPOSITION

**REQ-124: PARKED, with the derivation recorded and the drift now guarded.** Not a budget
park and not a "minor" park, which the STANDING MANDATE does not permit as a category. It
is parked because the fix as scoped could not achieve the requirement, and the fix as
actually required is a coupled four-requirement change to a frozen published package.

**What it would take, so the next session does not re-derive this:**

1. An owner decision to ship a sub-dime ladder at all, taken together for REQ-124, 125,
   126 and 127, since the precision work is a precondition rather than a follow-up.
2. A currency-precision change so wins below one cent render exactly, per `rgs.md:295`.
   Note `rgs.md:297`: "The 'balance' value displaying the players bankroll does not need
   to display more than 2 points of precision at any time, and it is only a requirement
   that wins in-game show exact win amounts." So the change is to the WIN string, not the
   balance string, and `PLATFORM_CURRENCIES` decimals stay as published.
3. A sanction whose scope covers the PUBLISHED artefacts, not one config line, plus a
   ruling on regenerating them given the optimiser's non-reproducibility.

**The question for the owner and Fable**, per convention (l.8), stated as one line: given
the platform calls this a recommendation twice over and the compliant version requires
sub-cent win precision across four coupled requirements and a published-artefact
regeneration, is REQ-124 in scope before submission at all, or is it a v1.1 item?

---

## THE GUARD BUILT INSTEAD

`scripts/qa/bet_ladder_declaration_drift.mjs` asserts the three declarations agree:

- `games/future_spinner/game_config.py:106` `self.bet_levels`
- `games/future_spinner/library/publish_files/game_metadata.json` `betLevels`, `minBet`, `stepBet`
- `frontend/src/lib/stores/gameStore.ts:7` `BET_LEVELS`

It is READ-ONLY against the locked package, parsing both files as text exactly as
`frontend/scripts/currency_scale_drift.test.mjs` does, so it needs no sanction. It ships
with a seeded self-test per convention (p) that plants a one-sided widening, which is the
precise defect the sanction would have introduced, and proves the gate goes red on it.

Today it passes at a 0.10 floor. It goes red the moment anyone widens one of the three
without the other two, which is what makes this park safe to leave in place.
