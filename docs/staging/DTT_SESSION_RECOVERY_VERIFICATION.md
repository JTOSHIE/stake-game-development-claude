# Session recovery: live-path verification at the Developer Testing Tool

R11 / TR-017. Written 2026-07-25, to be executed at the DTT staging session.

## Why this document exists

`sessionRecovery.ts` is proven against an injected stub, which is the right tool for
the branches it covers: a `pending_end` round waiting to be credited cannot be produced
on demand against a live RGS, and the stub returns exactly the shapes `rgsService`'s own
interfaces declare.

What a stub cannot establish is **what the platform actually does**. Three things below
are assumptions until the DTT contradicts or confirms them, and they are listed as
questions rather than as steps to tick off.

## Preconditions

- A DTT session with a real `sessionID` and `rgs_url`.
- The production build, so the live guard (R2) is active and the mock is absent.
- Browser devtools open on the network tab; every `authenticate`, `play` and
  `end-round` call is to be captured.

## Step 1: no round in progress, the control case

1. Launch fresh, do not spin.
2. Reload.
3. **Expect** `authenticate` to return no `round` field, and `lastRecovery` to be
   `{ kind: 'none' }`.

Records what "normal" looks like, so the later cases are read against something.

## Step 2: `pending_end`, the money case

1. Spin until a **winning** round resolves.
2. Reload the page **after the win is decided but before the credit settles**. In
   practice: reload during the win presentation.
3. **Expect** `authenticate` to return `round.state === 'pending_end'`, recovery to call
   `end-round` for that exact `roundId`, and the balance on screen to become the
   authoritative post-credit figure.
4. **Capture** the balance before and after. The delta must equal the round's win.

This is the branch that is worth money. If it does not fire, a real player loses a real
credit on every mid-settlement reload.

## Step 3: `open`, the parked case

1. Buy a feature so a long free-spins presentation begins.
2. Reload **mid-feature**.
3. **Observe and record, do not assume:**
   - Does `authenticate` return `round.state === 'open'`?
   - Does the response carry the round's **events**, or only its id and state?
   - Does the platform expect the game to re-request the round, and by what call?
   - What happens on the RGS side if the game simply never resumes it?

The current build surfaces the open round and stops. It deliberately does **not**
settle it, because settling could forfeit a feature the player has not seen, and it does
not fabricate a presentation, because that would be inventing an outcome. Which of the
options in TR-017b is correct is decided by what step 3 observes.

## Step 4: hostile ordering

1. Reload **twice in quick succession** during a `pending_end` round.
2. **Expect** the second recovery to be harmless: `end-round` is idempotent on the round
   id, so a repeat for an already-settled round should return the same settled balance
   rather than crediting twice.
3. **Capture** both responses. If the balance moves twice, that is a platform-side
   double credit and a blocker, and it is the single most important negative result this
   document can produce.

## What to bring back

The captured `authenticate` payload for each of steps 1 to 3, the before/after balances
for step 2, the two responses from step 4, and a plain answer to the four questions in
step 3. That closes TR-017b and either ratifies or replaces the current behaviour.
