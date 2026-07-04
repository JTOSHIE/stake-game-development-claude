# Stake Engine RGS wire-contract reference

An on-file reference for the Stake Engine RGS contract, extracted from the community
**stake-dev-tool** source (the closest available spec of the wire protocol - it implements
the contract in Rust and serves real math-sdk output), and **cross-checked against our own
`rgsService.ts`** so our development setup provably aligns. `rgsService.ts` is a locked file;
this document is reference/verification only, no code change. Australian English, no em
dashes or en dashes.

Reference source: `github.com/simnJS/stake-dev-tool` (`crates/lgs/src/{routes,types,replay,math_engine}.rs`).
Verified 2026-07-04 against `frontend/src/lib/services/rgsService.ts`.

## Endpoints

All wallet calls are `POST` to `{rgs_url}/wallet/...`; replay is a public `GET`. `:game` is
the game slug in the RGS URL path.

| Endpoint | Method | Request | Response |
|---|---|---|---|
| `/wallet/authenticate` | POST | `{ sessionID, language? }` | `{ balance, round, config, meta }` |
| `/wallet/balance` | POST | `{ sessionID }` | `{ balance }` |
| `/wallet/play` | POST | `{ sessionID, mode, amount }` | `{ balance, round }` |
| `/wallet/end-round` | POST | `{ sessionID, roundId }` | `{ balance, round: null, config, meta }` |
| `/bet/event` | POST | `{ sessionID, event }` | `{ event }` (echo) |
| `/bet/replay/:game/:version/:mode/:event` | GET | (public, no session) | `{ payoutMultiplier, costMultiplier, state }` |

**Our alignment:** `rgsService.ts` posts to `/wallet/authenticate`, `/wallet/play`
(`{ sessionID, amount, mode }`) and `/wallet/end-round` (`{ sessionID, roundId }`); replay uses
`GET {rgs_url}/bet/replay/{game}/{version}/{mode}/{event}` in `replayService.ts`. Match.

## Money and multipliers

- **All money is integer micro-units:** 1 unit = `1_000_000` micros. Never use float money.
  - Our `rgsService.ts`: `CURRENCY_SCALE = 1_000_000`, all bet/balance/win fields in micros,
    converted to dollars only for display. Match.
- **`payoutMultiplier` is a float = basis-points / 100** (e.g. lookup payout `550` -> `5.50`).
  Same encoding as the lookup-table `payout` column (multiplier x100).
- `costMultiplier` = the mode `cost` (1.0 base, 100.0 bonus buy). Replay payout cost =
  `amount * costMultiplier`.
- `amount` in the `Round`/play reflects the player's **base** stake, not the bonus-buy-inflated
  charged amount.

## Round lifecycle (critical timing)

`/play` deducts the bet and stashes the outcome on the active round; **the payout is credited
at `/end-round`, not at `/play`.** This models the spin -> settle animation window. A mock that
pays at `/play` hides balance/settlement-ordering bugs.

- Double-`/play` safety: if a prior round is still active, its payout is credited before the new
  bet is taken.
- `/authenticate` resumes an `active_round` if one exists.

**Our alignment:** `rgsService._rgsSpinReal` calls `play()` then `endRound(params, roundId)`, and
sets `newBalance` only after `endRound` completes (rgsService.ts:473, 536). So we credit the
balance at end-round, matching the contract. Match.

## `Round` object

```
{ betID: u64, amount: u64, payout: u64, payoutMultiplier: f64,
  active: bool, mode: string, event: "string", state: <raw event book JSON> }
```
`state` is the round's event book payload (the frontend animates from it).

## AuthConfig (from `/authenticate`)

`{ gameID, minBet, maxBet, stepBet, defaultBetLevel, betLevels[], betModes, jurisdiction{...} }`
- Money fields in micros; `betLevels` is a micros array.
- `jurisdiction` flags gate UI (e.g. a `disabledBuyFeature`/social flag hides the bonus buy).
  Our `initRGS`/`authenticate` surface jurisdiction flags to `jurisdictionFlags` (per the locked
  rgsService canonical surface).

## Math files the RGS reads (math-sdk `publish_files`)

Discovered through `index.json` (filenames are not hardcoded):

- **`index.json`** - `{ modes: [ { name, cost, events, weights } ] }`. `cost` is the mode bet
  multiplier (bonus buys > 1).
- **weights CSV** (`lookUpTable_<mode>_0.csv`) - headerless `sim_id,weight,payout` where `payout`
  is multiplier x100 and `weight` is a uint64 driving the weighted RNG.
- **event books** (`books_<mode>.jsonl.zst`) - zstd-compressed JSONL, one book per line
  `{"id":N,"events":[...]}`. On a spin the round `state` is the book's inner `events` array.
- **Critical mapping quirk:** math-sdk writes `library[sim+1] = Book(sim)`, so books are addressed
  by the `"id"` field, not the line index. This is the likely +1 offset between a lookup-table
  `sim_id` and the deployed replay `event` id (flagged in `REPLAY_TEST_EVENTS.md`).

Our published bundle matches this schema exactly (see `MATH_VALIDATION.md` /
`scripts/validate_math.py`), so a real RGS (or the stake-dev-tool mock) can serve our
`games/future_spinner/library/publish_files` unchanged.

## Alignment summary

| Contract point | Our implementation | Status |
|---|---|---|
| authenticate / play / end-round endpoints | `rgsService.ts` | aligned |
| replay GET endpoint + params | `replayService.ts` / `ReplayMode.svelte` | aligned |
| integer micro-units (1e6) | `CURRENCY_SCALE` | aligned |
| payoutMultiplier = bp/100 | play/replay parsing | aligned |
| payout credited at end-round | `_rgsSpinReal` play -> endRound -> balance | aligned |
| jurisdiction flags gate the buy | `initRGS` -> `jurisdictionFlags` | aligned |
| math `publish_files` schema | our `library/publish_files` | aligned (validated) |

No misalignments found. The only operational item is the `sim_id` vs `event` +1 offset - verify
on staging when capturing replay event IDs.
