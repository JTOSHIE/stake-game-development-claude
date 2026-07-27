# FEATURE RESUME: presentation-resume design

**Owner intent, 2026-07-28** (`reports/briefs/FS_PLAYER_EXPERIENCE_PASS_Prompt.md`, JOB 4):

> leave mid-spin or mid-bonus, come back, continue where you left off rather
> than being fast-settled.

Designed before built, per the brief. This document is the specification; the
implementation is judged against it rather than the other way round.

---

## 1. What is already true, and must not be broken

Three constraints come from the repository rather than from this design, and
every decision below is downstream of them.

**1.1 The RGS round is one determined round.** The outcome exists in full the
moment `play` returns. `round.state` carries the whole event sequence, and
`payoutMultiplier` is the settled figure. Nothing a player does after that can
change what the round pays. **Presentation is ours; the money is not.**

**1.2 Recovery already works, and it already replays.** `sessionRecovery.ts`
resumes an active round today: it extracts the events with the service's own
reader, interprets them through `roundInterpreter`, plays the presentation back
in full, THEN settles via `endRound`. It has no forfeit path, deliberately. Its
header records why playback comes before the settle: "A player who reloads
during a free-spins round is owed the round, not just its number."

So the thing the owner is asking for is **not** "recover the money" (done) and
not "replay the round" (done). It is narrower and it is the last mile:
**do not make them watch the whole feature again from spin one.**

**1.3 The canonical interpreter is the only reader.** `roundInterpreter.ts`
produces the `PresentationScript` that live play, Bet Replay and recovery all
present. A second reader is the TR-009 defect class. Resume must play forward
through the same script, not through a stored copy of one.

## 2. The design in one sentence

**Persist a presentation CURSOR, never presentation CONTENT**, keyed by `betID`;
on recovery of an active round whose `betID` matches, offer RESUME and play the
canonical script forward from that cursor.

Everything that makes this safe follows from the word *cursor*.

## 3. Why a cursor, and why that closes the money question

The brief requires "never diverging displayed totals from the round's true
figures". That is the whole risk of this feature: a stored figure that is stale,
wrong, or tampered with, shown to a player as their win.

**The cursor design makes divergence structurally impossible rather than
carefully avoided.** What is stored is an INDEX. Every number the player then
sees is read out of `script.freeSpins[i]`, freshly interpreted from the events
the RGS just sent in the recovery response. The accumulated win, the meter, the
spins remaining and the total are all derived, on this boot, from the authority.

Concretely, `FreeSpinsPresentation.nextSpin()` already reads every displayed
value from the script:

```
currentSpin        = script.freeSpins[spinIndex]
displayMeter       = currentSpin.meterBefore
runningTotalCentibets = currentSpin.runningTotalCentibets
spinsRemaining     = awardedTotal - spinIndex
```

So resuming is: set `spinIndex`, call `nextSpin()`. Nothing else is restored,
because nothing else needs to be.

**The stored accumulated win and spins-remaining are kept anyway, and used only
as a CHECKSUM.** If the persisted figures disagree with the script at that
index, the checkpoint is not trusted and the flow falls back to a full replay.
They are never rendered. A disagreement means the stored cursor describes a
different round than the one the RGS just handed us, and the correct response to
that is to distrust the cursor, not to display it.

This is the property that makes localStorage acceptable at all. Local storage is
attacker-controlled: a player can edit it. Under this design the worst a forged
checkpoint can do is **skip part of an animation of their own round**. It cannot
change a balance, a total, or a payout, because none of those is read from it.

## 4. What is stored

One record, one key, in `localStorage`.

```
key:   fs:presentation-checkpoint
value: {
  v:            1,              // schema version, so a shape change invalidates rather than misreads
  betID:        number,         // the official round identity
  phase:        'base' | 'free',
  freeSpinIndex: number,        // index into script.freeSpins of the LAST COMPLETED spin
  // checksum only, never rendered:
  seenTotalCentibets: number,
  seenSpinsRemaining: number,
  seenMeter:          number,
}
```

**Why `betID` and not a session id.** `betID` is the official round identity
(`OfficialRound.betID`, a number). It is what `authenticate` returns on the
active round and what recovery already reads. Keying on anything else would let
a checkpoint from round A be offered against round B, which is the mismatch case
the brief explicitly asks be handled.

**Why one record and not a queue.** A session has at most one active round. The
same reasoning `sessionRecovery.ts` gives for its banner being a boolean rather
than a queue applies exactly: a structure that can hold two invites a design
where it does.

**Why `v`.** A future change to `PresentationScript`'s shape would make an old
cursor point at something different. A version that does not match is discarded,
which is one line and removes a whole class of silent misread.

## 5. Safe checkpoints, and why those points

A checkpoint is written **only at a boundary where the presentation is between
spins and the numbers on screen are exactly the script's values for a completed
index.** Mid-animation is never a checkpoint, because "half way through spin 4"
is not a resumable position: the design resumes at spin boundaries only.

| Point | Written when | Cursor value |
|---|---|---|
| Feature entry accepted | the CLICK TO CONTINUE gate is passed | `freeSpinIndex: -1` |
| Each free spin completes | `nextSpin()` is about to advance | the index just finished |
| Feature ends | `toEnd()` | cleared, not written |
| Round settles | `finish()` / settle | **cleared** |

**The clear on settle is the important one.** A checkpoint that outlives its
round is a stale cursor waiting to be matched against a future round with a
recycled id. It is cleared on completion, on error, and on any recovery that
falls back to replay.

**Mid-ordinary-spin is deliberately NOT checkpointed.** The brief says so
directly: "Mid-spin exit on an ordinary round keeps the existing
resume-and-settle." A base spin is a single reveal, roughly two seconds; there
is no "where you left off" to return to, and the existing flow already replays
and settles it correctly. Writing a cursor there would add a code path with no
player-visible benefit, which is the dead-wiring shape this project gates
against.

## 6. The flow

```
boot
 └─ recoverSession()
     ├─ authenticate -> round
     ├─ round absent or round.active !== true  ──────────────► nothing to do
     └─ active round
         ├─ extract events (service's own reader)
         ├─ interpret  -> script            ◄── the authority, this boot
         ├─ read checkpoint
         │   ├─ absent                      ──► REPLAY IN FULL (today's flow)
         │   ├─ v mismatch                  ──► clear, REPLAY IN FULL
         │   ├─ betID mismatch              ──► clear, REPLAY IN FULL
         │   ├─ index out of range for script ─► clear, REPLAY IN FULL
         │   ├─ checksum disagrees with script ► clear, REPLAY IN FULL
         │   └─ valid                       ──► OFFER RESUME
         │        ├─ player takes RESUME    ──► play forward from cursor
         │        └─ player declines        ──► REPLAY IN FULL
         └─ settle via endRound, adopt its balance, banner   (unchanged)
```

**Every failure is the same failure.** Absent, stale, corrupt, forged, wrong
round, unreadable storage: all of them fall to the existing replay-then-settle
path. There is exactly one fallback, it is the flow that ships today, and it is
already proven. That is deliberate: a recovery feature with several failure
modes has several ways to be wrong.

**Storage failure degrades silently.** Every read and write is wrapped. A
private-mode browser, a full quota, a disabled storage API or a `SecurityError`
all resolve to "no checkpoint", which is the absent case, which replays. The
player is never shown an error about storage, because storage is not their
problem and the round is recoverable without it.

**Settlement is untouched.** `endRound` still runs after the presentation, and
the balance still comes from its response. Resume changes where the animation
starts and nothing else.

## 7. The offer, not the assumption

RESUME is **offered**, not applied. Two reasons, and the second is the one that
matters.

1. A player who left ten minutes ago may not remember where they were.
2. **A player who left because something looked wrong needs a way to see the
   whole round.** Auto-resuming would remove the only route to the full replay
   at exactly the moment a player most wants it.

The offer names the position in the player's terms ("continue from free spin 7
of 12"), and declining is a first-class choice that plays the round from the
start. Both branches settle identically.

## 8. What could go wrong, and what stops it

| Risk | What stops it |
|---|---|
| Stored total shown to the player and it is stale | Totals are never read from storage. Cursor only. |
| Forged localStorage inflates a win | Same. The worst a forged cursor does is skip animation. |
| Cursor points past the end of a shorter script | Range-checked against `script.freeSpins.length`, falls back. |
| Checkpoint from a previous round matched to this one | Keyed by `betID`, and cleared on settle. |
| Two tabs, two checkpoints | Single key, last write wins, and `betID` gates the match. Worst case is a fallback to replay. |
| Storage throws | Wrapped; resolves to "no checkpoint". |
| A future script shape change | `v` mismatch discards. |
| Resume path drifts from live play | It calls the SAME component method the live path uses, with a start index. There is no second presentation implementation. |

## 9. Test matrix (the brief's, plus the two the design adds)

All through official-shaped fixtures: an `authenticate` response carrying an
active round whose `state.events` is a real round out of the shipped book.

| # | Case | Expected |
|---|---|---|
| 1 | Reload mid-feature, checkpoint at free spin 1 | RESUME offered; forward from spin 2; totals match the script |
| 2 | Reload mid-feature, checkpoint mid-way | as above |
| 3 | Reload mid-feature, checkpoint at the last spin | as above, ends on the summary |
| 4 | Reload mid-ordinary-spin | no checkpoint written; existing resume-and-settle, unchanged |
| 5 | Checkpoint for a DIFFERENT betID | ignored and cleared; full replay |
| 6 | Storage unavailable (throws on read and on write) | silent; full replay; no error surfaced |
| 7 | *added:* checksum disagrees with the script | ignored and cleared; full replay |
| 8 | *added:* cursor index beyond the script's length | ignored and cleared; full replay |

Cases 7 and 8 are the ones that make the safety claim testable rather than
asserted. A design whose safety rests on "we validate the checkpoint" should be
made to prove the validation fires.

## 10. What this design does NOT do

- **It does not resume mid-animation.** Spin boundaries only.
- **It does not persist anything on an ordinary round.** Per the brief.
- **It does not touch the settle path, the wallet, or any locked file.**
  `sessionRecovery.ts`, `FreeSpinsPresentation.svelte` and a new non-locked
  store are the whole surface.
- **It does not survive a cleared browser store**, and does not try to. A
  server-side cursor would, and is not ours to build: the platform's round is
  the durable record and it already recovers.

## 11. Live confirmation is an owner item

Per the brief: **live confirmation at the portal is the owner's next-visit
item.** Everything here is proven against official-SHAPED fixtures, which is
inference from the pinned client's types and the Bet Replay payload, not an
observation of a live active round. `DTT_PROTOCOL.md` item 5 is the existing
slot for that observation. The one thing to check is that a real active round
carries its events at `round.state.events`, which recovery already assumes today
and which this design inherits rather than introduces.
