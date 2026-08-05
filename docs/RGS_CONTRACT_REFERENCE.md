# Stake Engine RGS wire-contract reference

An on-file reference for the Stake Engine RGS contract. `rgsService.ts` is a locked file;
this document is reference and verification only, no code change. Australian English, no em
dashes or en dashes.

**HEADER REWRITTEN 2026-08-05, S2-C053, because it inverted its own provenance.** It used to
open by saying this reference was extracted from the community **stake-dev-tool** source,
called that "the closest available spec of the wire protocol", and claimed our setup
"provably aligns". All three were wrong or overstated by the time anyone read them.

**THE AUTHORITY IS THE FIRST-PARTY CAPTURE, and it is in this repository.** The platform's
own RGS documentation is mirrored at `docs/stake-engine-live/2026-07-29/rgs.md`, with the
same material at `docs/stake-engine-live/2026-07-29/approval_guidelines_rgs_communication.md`.
Where this document and those captures disagree, **the captures win** and this document is
the thing that is wrong.
<!--CHECK: exists docs/stake-engine-live/2026-07-29/rgs.md-->
<!--CHECK: exists docs/stake-engine-live/2026-07-29/approval_guidelines_rgs_communication.md-->

**stake-dev-tool is a CORROBORATING COMMUNITY IMPLEMENTATION, not a spec.**
`github.com/simnJS/stake-dev-tool`, `crates/lgs/src/{routes,types,replay,math_engine}.rs`.
It implements the contract in Rust and serves real math-sdk output, which makes it useful
evidence about how the contract behaves in practice and makes it worth keeping. It is not
first-party and does not bind us. Per convention (l.4) it is a genuinely independent input
from the platform's own text, which is exactly why it is worth citing beside them rather
than instead of them.

**"PROVABLY ALIGNS" IS REPLACED BY THE THING THAT ACTUALLY CHECKS.** The alignment that
exists is a CI job named **`rgs parse alignment`** in `.github/workflows/checks.yml`, running
`frontend/src/lib/services/rgsService.parse.test.ts` against real decoded book rows. That is
a test on every push, not a proof, and it covers the PARSER rather than the whole contract.
Named rather than line-cited, per convention (s): the row that produced this correction cited
its line number and the number had already drifted.
<!--CHECK: grep "rgs parse alignment" .github/workflows/checks.yml-->

**PROVENANCE OF THE BODY BELOW, per protocol rule 16: REPORTED, not VERIFIED.** It was
verified on **2026-07-04** against `frontend/src/lib/services/rgsService.ts`. **That file has
changed three times since**, and one of those changes is not incidental: `e2b84a5` and
`da4826f` on 2026-07-25, the sanctioned locked pass of PR #103, whose own message reads
"rewrite the wallet layer to the pinned official contract", and `6ef8a89` on 2026-07-26.

**So the 2026-07-04 date predates a rewrite of the very file it was checked against**, and
nothing below has been re-checked at this correction's date. Treat every statement in this
document as REPORTED as at 2026-07-04 until someone re-derives it. **This note is not a
re-verification and must not be read as one.**

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

Our published bundle matches this schema exactly (see `scripts/validate_math.py`, and the
semantic equality proof in `SUBMISSION_DOSSIER.md` section 8b), so a real RGS (or the stake-dev-tool mock) can serve our
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
