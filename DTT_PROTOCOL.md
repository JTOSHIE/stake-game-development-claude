# DTT_PROTOCOL.md: Developer Testing Tool session script

**For the owner, to run once on the Stake Engine portal against the staged build.**
Australian English, no em dashes or en dashes.

This is the operational form of the seven confirmations recorded in
`reports/SESSION_REPORT.md`'s FOR THE NEXT SESSION blocks. **Nothing here is new
substance.** It exists so the session is run from one document instead of from a list of
open questions scattered across a tracker.

**Run this alongside `SUBMISSION_DOSSIER.md` section 5 (STAGING PROTOCOL).** Section 5b is
the upload steps and 5d is the one-time versus per-update checklist; this document is what
you do once the build is up and reachable. Do 5b first, then this, then 5e.

---

## Why this session exists

Every item below is a place where the code makes an assumption about a payload shape it has
never actually seen. The wallet layer was rewritten to the pinned official client's types
(`stake-engine: github:StakeEngine/ts-client` at `df9e126d`), and those types are a good
source, but they are a source, not an observation. One live session converts seven
assumptions into seven facts.

**Each item below states three things**: the single observation to make, the value we
expect, and the exact **flip point**, the one place in the code that changes if the
observation disagrees. Every flip point is one line or one small block. None of them is a
redesign, and that is deliberate: the contract work was done so that being wrong here is
cheap.

## How to record it

Open the browser devtools **Network** tab before launching, and keep it open for the whole
session. Filter to `wallet` for items 1 to 4.

Screenshots go to `reports/screens/dtt-<date>/` using the filenames given per item, and the
group is added to `reports/screens/EVIDENCE_INVENTORY.md` as **DTT session** when the
captures are committed. Raw payloads: use devtools "Copy response" and paste each into
`reports/qa/dtt_payloads_<date>.json` under the item number. Those payloads are the
artefact everything else here is checked against, so capture them even for items that pass.

---

## 1. The authenticate payload

**Observe:** the response body of the first `POST .../wallet/authenticate`.

**Expect**, from `frontend/src/lib/services/rgsService.ts`'s transcribed types:

```
{
  balance: { amount: <integer micros>, currency: "USD" | "XSC" | ... },
  config: {
    minBet, maxBet, stepBet, defaultBetLevel, betLevels: [...],   // all integer micros
    jurisdiction: { socialCasino, disabledFullscreen, disabledTurbo,
                    disabledSuperTurbo, disabledAutoplay, disabledSlamstop,
                    disabledSpacebar, disabledBuyFeature, displayNetPosition,
                    displayRTP, displaySessionTimer, minimumRoundDuration }
  },
  round: null            // or an active round, see item 5
}
```

**Four separate observations, and record each:**

| # | Observation | Expected |
|---|---|---|
| 1a | Is `balance` an object with `amount` and `currency`, not a bare number? | object |
| 1b | Are `minBet`, `maxBet`, `stepBet`, `defaultBetLevel`, `betLevels` under `config`? | yes |
| 1c | Are the twelve flags under `config.jurisdiction`? | yes, all twelve present |
| 1d | Is `balance.amount` in integer micros, so 1.00 arrives as `1000000`? | micros |

**On 1d specifically**: cross-check the number against what the HUD shows. If the balance
reads `$100.00` and the payload says `100000000`, micros is confirmed.

**Flip points.** `rgsService.ts`: the `RawAuthenticateWire` interface for shape, and
`authenticate()`'s mapping block for the field paths. `CURRENCY_SCALE` in
`frontend/src/lib/utils/currency.ts` if the unit is not micros, which would be a much
larger change and is the one item here that is not cheap. The official helper defines
`API_MULTIPLIER = 1_000_000`, so this is expected to hold.

**Screenshot:** `01-authenticate-payload.png`, devtools response body expanded.

---

## 2. The `stepBet` versus `minStep` naming

**Observe:** in the same authenticate response, whether the bet-increment field is called
`stepBet` or `minStep`.

**Expect:** `stepBet`. The pinned client's `AuthenticateConfig` calls it `stepBet`; the docs
mirror prose says "authenticate/config/minStep"
(`docs/stake-engine-live/rgs-communication.md`). Those two first-party sources disagree, and
this settles it.

**Flip point:** one field name in `RawAuthenticateWire.config` and one in `authenticate()`.

**Screenshot:** covered by `01-authenticate-payload.png`.

---

## 3. The play payload, and where the events live

**Observe:** the response body of a `POST .../wallet/play` after one base spin.

**Expect:**

```
{ balance: { amount, currency },
  round: { betID, amount, payout, payoutMultiplier, active, mode, state } }
```

**Two observations:**

| # | Observation | Expected |
|---|---|---|
| 3a | Top level is `{balance, round}`, with no top-level `events` or `roundId` | yes |
| 3b | **Where are the round's events?** Expand `round.state`. | `round.state.events` is an array |

**3b is the most important single observation in this session.** `Round.state` is typed
`unknown` upstream, so the pin does not say where the events sit. We read `state.events`
first, by inference from the Bet Replay endpoint, which serves this same game's rounds with
the events at `state.events`. A bare array at `state` is also accepted.

**If it is neither**, note the exact path (for example `state.round.events` or
`state.data`). The events are what the whole presentation reads; without them a live round
renders an empty board.

**Flip point:** `_extractRoundEvents()` in `rgsService.ts`. It is six lines and already
handles two shapes; a third is one more branch. Its behaviour on an unknown shape is to
return an empty array rather than throw, so a wrong guess degrades the presentation and
never loses the money.

**Also record:** `round.payout` should be micros and `round.payoutMultiplier` centibets
(a 3.90x win is `payout: 3900000` at a 1.00 bet, `payoutMultiplier: 390`).

**Screenshot:** `03-play-payload.png` with `round.state` expanded far enough to show the
first event's `type`.

---

## 4. The end-round payload

**Observe:** the request body and response body of `POST .../wallet/end-round`.

**Expect:**

- **request**: `{ sessionID }` and nothing else. We deliberately do NOT send `roundId`.
- **response**: `{ balance: { amount, currency } }` and nothing else. No round identity.

**Also observe:** does end-round succeed when the round is already settled? Call it twice if
you can provoke that safely. The retry logic assumes it is idempotent on a settled session,
and that assumption was rewritten during the wallet pass because the previous justification
rested on a `roundId` the request does not carry.

**Flip point:** `endRound()` in `rgsService.ts`, both the body it sends and the
`_withRetry` wrapper if it turns out not to be idempotent.

**Screenshot:** `04-endround-payload.png` showing request and response side by side.

---

## 5. Resume and settle against a real open round

**This is the item that cannot be simulated, and the one TR-035b has been waiting on.**

**Do:** start a spin and **reload the page mid-round**, before the round finishes
presenting. A free-spins round gives the widest window; a base spin works too.

**Expect, in this order:**

1. The game loads and the boot splash appears.
2. **After you dismiss the splash**, the interrupted round REPLAYS in front of you: the
   board fills, wins present, and a feature round plays its free spins.
3. The round then settles and the balance moves.
4. One plain banner appears: **"Your previous round has been completed and its result
   applied."** It is dismissible.

**Three things to confirm:**

| # | Confirmation |
|---|---|
| 5a | `authenticate.round` carried `active: true` **and** its events at `round.state` |
| 5b | The replay ran BEFORE the balance moved, not after |
| 5c | The final balance agrees with the platform's own wallet, checked in the portal |

**5c is the one that matters most.** A presentation that looks right and a wallet that
disagrees is worse than no recovery at all.

**Flip point:** `frontend/src/lib/stores/sessionRecovery.ts`. If the events are not at
`round.state`, item 3b's fix covers this too, since both use the same extractor.

**Screenshots:** `05a-mid-round-reload.png` (during the replay),
`05b-recovery-banner.png` (banner visible with the settled balance).

---

## 6. `currencyDisplay`: present or absent (TR-012c)

**Observe:** search the whole authenticate payload for any display-metadata field, whatever
it is called: `currencyDisplay`, `display`, `symbol`, `decimals`, `symbolAfter`.

**Expect: ABSENT.** The pinned contract has no such field. `Balance` is `{amount, currency}`
and nothing more, and the official client derives symbol, decimals and placement from its
own client-side table.

**This item is asking you to confirm a negative**, which is why it is worth doing carefully:
TR-012c has been open on the assumption that the platform sends metadata we drop.

- **If absent**, TR-012c closes as "the platform does not send this; the client-side table
  is the mechanism", and no code changes.
- **If present**, note its exact shape. The passthrough is already implemented and
  tolerant; the flip is the path it reads in `RawAuthenticateWire.config.currencyDisplay`.

**Screenshot:** covered by `01-authenticate-payload.png`.

---

## 7. XGC decimals as the platform displays them (TR-057)

**Observe:** launch or switch to a **Gold Coin (XGC)** session and read the balance in the
platform's own chrome, outside our game frame.

**Expect: two decimals**, for example `10.00 GC`.

**Why this is open.** Three first-party sources, and one disagrees with the other two. The
official client's `CurrencyMeta` code says `XGC: { decimals: 0 }`. Its own documentation
table in the same file says `10.00 GC`, and the docs mirror at
`docs/stake-engine-live/rgs-communication.md:82` says the same. We hold at 2, matching the
two prose sources, and this observation is the tiebreak.

**Flip point:** exactly one line,
`frontend/src/lib/utils/currency.ts:105`: `XGC: { symbol: 'GC', decimals: 2 }`.

**Screenshot:** `07-xgc-balance.png` showing the platform's own balance display and our
HUD's, in the same frame if possible.

---

## 8. Replay IDs, including the possible plus-one offset

**Observe:** open a Bet Replay URL for each of the five modes using the IDs in
`REPLAY_TEST_EVENTS.md`, and confirm each shows the round that table describes.

**Expect:** the described round. **But be ready for an offset of one.**

`REPLAY_TEST_EVENTS.md` records the reason: "`sim_id` is 0-based; math-sdk writes
`library[sim+1] = Book(sim)`, so the deployed RGS event ID may be offset by 1. Verify each
ID against the staging build and adjust if the replay 404s or shows a different round."

**So for each ID: try it; if it 404s or shows the wrong round, try ID+1 and record which
worked.** That is a real answer either way, and it is a documentation fix rather than a code
fix.

**Cover at minimum** (from `REPLAY_TEST_EVENTS.md`):

| Scenario | base | cruise | antelite | bonus | super |
|---|---|---|---|---|---|
| Normal win | 0 | 0 | 0 | 130 | 1484 |
| Big win | 1 | 11 | 1 | 0 | 0 |
| Win cap | 1020 | 1875 | 1020 | 124 | 11 |
| Loss | 5 | 1 | 7 | none | none |
| Feature trigger | see method | 11 | 1 | n/a | n/a |

**Also confirm** an ordinary win replays with a real board and real wins, not an empty grid.
That path was a round-two blocker and is fixed, but this is the first time it runs against
the platform's own replay endpoint rather than our fixtures.

**Flip point:** the table in `REPLAY_TEST_EVENTS.md`. No code changes for an offset.

**Screenshots:** `08-replay-<mode>-<scenario>.png`, at least one per mode.

---

## 9. Spacebar and the jurisdiction flags, live

**Observe:** with whatever flags the staging jurisdiction actually sets, confirm the
controls agree with them.

| Flag | If the platform sets it true, expect |
|---|---|
| `disabledSpacebar` | the spacebar does NOT spin; the spin BUTTON still works |
| `disabledTurbo` | the speed control cannot leave 1x |
| `disabledSuperTurbo` | the cycle reaches 2x and skips 4x |
| `disabledAutoplay` | the autoplay control is unavailable |
| `disabledSlamstop` | tapping during a spin does not slam the reels to a stop |
| `disabledBuyFeature` | the bonus buy is hidden entirely |
| `minimumRoundDuration` | a spin takes at least that long, and turbo is off |
| `socialCasino` | social wording throughout, no "bet" or "buy" in player text |

**If staging sets none of them**, that is itself the observation: record which flags arrived
`false` so we know the defaults were exercised rather than the enforcement.

**Note on why this item exists in this form.** Three of these flags were derived correctly
and read by nobody until 2026-07-26, which is the same defect R7/TR-015 found in
`disabledTurbo`. They now have readers and unit assertions, and this is the first time they
meet a real jurisdiction payload.

**Flip points:** `frontend/src/lib/stores/responsibleGambling.ts` for the mapping,
`App.svelte`'s key and slam handlers and `stores/speedMode.ts` for the enforcement.

**Screenshot:** `09-jurisdiction-flags.png` of the authenticate `config.jurisdiction` block,
plus a capture of any control the flags actually changed.

---

## 10. The mini-player HUD in the real popout

**Observe:** open the game in the platform's own **mini-player popout** and check the HUD.

**Expect**, from the dedicated 400x225 profile:

- one row, roughly 44px tall, carrying: FEATURES, menu, BAL, WIN, bet steppers, SPIN;
- turbo, AUTO and MAX inside the menu rather than in the row;
- **no overlapping fields and no truncated balance**;
- every control tappable.

**This was measured locally** against the exact 400x225 viewport
(`reports/qa/mini_player_proof_2026-07-26.json`), so what this item adds is the platform's
real popout chrome, which may not be exactly 400x225.

**If the real popout is a different size**, record it. The profile triggers at width <= 480
AND height <= 300, so a slightly different size is already covered; something much larger
would fall back to the compact-landscape strip, which is what the round-two finding was
about.

**Flip point:** `MINI_WIDTH_BREAKPOINT` and `MINI_HEIGHT_BREAKPOINT` in `App.svelte`.

**Screenshot:** `10-real-popout.png`, the platform's popout with the game idle, and
`10b-real-popout-spinning.png` mid-spin.

---

## Closing the session

1. Commit the screenshots to `reports/screens/dtt-<date>/` and the payloads to
   `reports/qa/dtt_payloads_<date>.json`.
2. Add the capture group to `reports/screens/EVIDENCE_INVENTORY.md`.
3. For each of the ten items, record **confirmed** or **the observed value**, in the session
   report.
4. Apply any flip points that turned out to be needed. Every one is a single line or a
   single small block; none is a redesign.
5. Then, and only then, **external review round three**. Sending reviewers in before this
   would ask them to check our reasoning about a contract rather than to check the game, and
   round two already showed that reviewers cannot verify what they cannot run.

## Owner actions that are not observations

These are uploads, not tests, and they are yours because they cannot be done from the
repository. `SUBMISSION_DOSSIER.md` section 5d is the fuller checklist.

- **Provider logo**: upload `design-system/archive/delivery/WeRollSpinners-Logo.png` in Team
  Settings Branding. One time.
- **Tile layers**: upload `design-system/archive/delivery/FutureSpinner-BG.jpg` and
  `FutureSpinner-FG.png` in the Tile Editor. One time.
