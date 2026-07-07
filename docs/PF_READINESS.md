# FUTURE SPINNER: PROVABLY-FAIR READINESS

Australian English, no em/en dashes. The cheapest-now / most-expensive-later template item.
Stake moved to provably-fair (PF) across its slot catalogue in 2026. Stake Engine's data-format
docs do not yet expose seeds/nonces, so PF is an ARCHITECTURAL POSTURE we reserve for, not an
API we fill today. Our pre-computed books model is already PF-friendly; the goal is to NOT break it.

---

## The PF model (for reference)

Provably-fair for slots: a server seed (its SHA-256 hash committed/published beforehand) + a
client seed + a per-bet nonce. The outcome derives from `HMAC-SHA256(server_seed, client_seed:nonce)`
and is re-derivable by anyone after the server seed is revealed. For a pre-computed-books game the
only entropy needed is the WEIGHTED SELECTION of a simulation index from the lookup table; that
selection is where a seed/nonce would plug in.

## Why we are already ~80% there

- **Outcomes are pre-computed and deterministic.** Each round is a `Book` (a fixed sequence of
  events) chosen from `lookUpTable_<mode>_0.csv` by weight. Given the selected simulation id, the
  round is fully determined - there is no client-side randomness generating the result.
- **The RGS is the sole entropy source.** The wallet `play` call returns the selected book; the
  client only PRESENTS it. `roundInterpreter.ts` is a pure function (book events -> presentation
  script) with no `Math.random`/`Date` in the outcome path.
- **Bet replay already reconstructs a round from its id.** The public `/bet/replay/` endpoint
  replays a completed round purely from its event id - this is, in effect, PF reconstruction, and
  it is mandatory and implemented.
- **Integer micros, no floats** in the money path (deterministic arithmetic).

## The invariant (do NOT break these)

1. **No hidden client state decides outcomes.** The shown round must be derivable entirely from
   what the RGS returned. The client never rolls, re-rolls, or biases the result.
2. **Every round is reconstructable from (simulation id / seed + nonce).** Same book id -> same
   presentation, always. The interpreter and presentation must stay pure and deterministic.
3. **RGS weighted selection is the only entropy source.** All randomness lives server-side in the
   lookup-table selection; the client and the maths pipeline add none at outcome time.
4. **Mock/dev randomness stays OUT of production.** The dev mock (`roundProvider`) may pick sample
   rounds, but production reads the server book. Keep the mock strictly dev-gated (it is).
5. **No `Math.random` / `Date.now` in the outcome or replay path.** (The maths pipeline already
   bans these in scripts; keep the frontend outcome path equally pure.)

## What to reserve (cheap now)

- A place for a per-round identifier (simulation id / seed + nonce) to travel with the round, so a
  future PF layer can attach the commit/verify without reshaping the client.
- Keep `lastRoundEvents` (the raw round events passthrough) as the canonical round record - it is
  the reconstruction hook.

## Recommended next step: a round-reconstruction test

Add a determinism test (vitest) asserting: for a fixed book (from `sample_rounds.json`),
`scriptFromEvents(book.events)` is byte-identical across repeated runs and independent of wall
clock / RNG. This locks invariant 2 into CI. (Companion to the existing `roundInterpreter.test.ts`.)

## Not required today

Stake Engine does not yet require seeds/nonces in the math data format, and there is no PF API to
implement. This document is the standing posture so that when PF becomes a hard gate for stateless
games, we attach it without a rewrite. Do not add client-side entropy in the meantime.
