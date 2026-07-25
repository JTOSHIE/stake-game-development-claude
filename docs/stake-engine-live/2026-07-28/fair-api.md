<!-- Stake Engine Provably Fair API snapshot -->
- topic: fair-api
- resolved_url: https://stake-engine.com/fair/api
- fetched: 2026-07-28
- rendered_via: headless Chrome (Claude Browser pane)
- looks_real: true
- source_note: URL obtained from the owner's dashboard capture
  (`Steak Engine Dashboard.docx`). It closes comms finding 32, which recorded the
  outcome endpoint as a named missing input rather than guessing a URL pattern.
- capture_note: body below is a VERBATIM upstream capture, upstream punctuation preserved.

# Provably Fair API

**Four public endpoints, served from `fair.stake-engine.com`, requiring NO
authentication.**

Quoted: "Every game outcome on Stake Engine is deterministic and reproducible. Four
public endpoints are available for developers building their own verification tools.
All endpoints are served from fair.stake-engine.com and require no authentication."

## 1. Game Catalogue

`GET https://fair.stake-engine.com/catalogue`

Returns every published game with versions, modes, RTP, event count and total weight
range. Captured separately at `fair-catalogue.md`.

## 2. Outcome Verification

`POST https://fair.stake-engine.com/outcome/{team}/{game}/{version}/{mode}`

Path: `team` (publisher slug), `game` (game slug), `version` (published math version),
`mode` (mode name).
Body: `clientSeed`, `serverSeed` (unhashed, revealed after rotation), `nonceStart`,
`nonceEnd` (exclusive).
Response per nonce: `nonce`, `roll` (raw 64-bit, `rand128 % weightSum`), `payout` (in
cents, divide by 100 for the multiplier).

## 3. Event Table

`GET https://fair.stake-engine.com/event/{team}/{game}/{version}/{mode}`

Quoted: "Returns the ordered list of **every possible payout outcome and its
corresponding probability weight range** for a specific game, version, and mode."

Optional `from` / `to` query parameters; by default all events are returned.
Response per event: `event` (index), `start` (cumulative weight, inclusive), `end`
(exclusive), `payout` (cents).

## 4. Peek (Rich Verification)

`POST https://fair.stake-engine.com/peek`

Body: `team`, `game`, `version`, `mode`, `clientSeed`, `serverSeed` required;
`nonceStart` (default 1), `nonceEnd` (default 1000, **max range 10,000**),
`findTarget` (nonces at or above a multiplier), `findMax` (nonces hitting max payout).
Response: publisher, game metadata (mode cost multiplier, max payout, expected RTP),
`payouts[]`, `runningBalance[]`, `targetNonces[]`, `maxNonces[]`.

## How outcomes are determined (verbatim)

```
STEP 1  entropy = HMAC-SHA256(key = serverSeed, message = clientSeed + ":" + nonce)
STEP 2  rand128 = uint128_from_big_endian(entropy[0..16])
STEP 3  roll  = rand128 % weightSum
        event = binary_search(weightTable, roll)   // first event where cumulativeWeight[event+1] > roll
        payout = payoutTable[event]
```

Quoted: "Because the weight and payout tables are **published and immutable** for each
game version, and HMAC-SHA256 is deterministic, anyone who knows the server seed, client
seed, and nonce can independently reproduce the exact same outcome."

## What this means for us, precisely

**No additional build work is owed.** Provably Fair operates on the maths package the
ACP already holds. Our game is stateless, which is the stated precondition ("Stake has
now implemented Provably Fair across all stateless games built on Stake Engine").

**It materially refines the books-privacy position, and the distinction matters.**

- The **lookup tables** (event index, cumulative weight range, payout) become
  **publicly readable, unauthenticated**, via endpoint 3 once the game is published.
  That is precisely the content of our `lookUpTable_<mode>_0.csv` files, which we
  already commit to the repository. Post-publication, their secrecy is zero by platform
  design.
- The **event books** are NOT published by this API. The FAIR endpoints expose the
  payout distribution and its weights, not the per-round event streams (board reveals,
  win breakdowns, feature choreography) that the books carry.

So the ruling of 2026-07-28 stands on its narrow ground: the books hold more than FAIR
publishes. But the phrase "the complete outcome distribution" needs correcting in one
direction: **the outcome distribution itself is published by the platform after
release.** What stays private in the books is the event choreography, and the whole
distribution's pre-release confidentiality.

## Verification capability this gives us

Endpoint 3 plus endpoint 2 together let **anyone**, including Fable and any reviewer,
independently reproduce our published outcomes without possessing our books. That is
the strongest possible answer to review 1's complaint that book-to-lookup equality could
not be verified: **after publication it becomes verifiable by a third party against the
platform's own copy.** Before publication it remains R3's job.
