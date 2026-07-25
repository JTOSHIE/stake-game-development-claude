# Scatter anticipation: design proposal

**Status: DESIGN DRAFT. Nothing in this document is shipped.**
Owner Audit Round 4, item 7. For a three-way review (owner plays it, Fable reads the
captures) before any ship brief is issued.

Australian English, no em dashes or en dashes.

---

## 1. What exists today

The current behaviour is a single beat, not a sequence.
`GameGrid.svelte`'s `_spinSequence()` applies anticipation **only to the final reel**,
and only when two or more scatters have already landed:

```
if (r === REELS - 1) {
  const scatterAnticipate = scattersLanded >= 2
  const nearMiss = !isT && !scatterAnticipate && _checkAnticipation(finalBoard)
  if (!slamRequested && (scatterAnticipate || nearMiss)) {
    _scatterAnticipation(REELS - 1)
    playAnticipation()
    const holdMs = Math.max(300, (scatterAnticipate ? 900 : 600) * speedFactor)
    await _sleepOrSlam(holdMs)
  }
}
```

So a player who lands scatters on reels 1 and 2 gets **three ordinary reel stops and
then one held reel**, and a player who secures the bonus on reel 3 gets **no
acknowledgement of that at all** until the entry card. The moment the game should be
loudest is currently silent.

Existing parts this proposal reuses rather than invents: `_scatterAnticipation(reel)`
(dim, tremble, edge glow on a still-travelling reel), `_clearAnticipationFor(reel)`,
`playAnticipation()`, `_sleepOrSlam()` (turbo and slam already cancel cleanly), the
`charged` per-cell flag for landed scatters, and `FlameJets` with its three colourways.

## 2. The design, as directed

Fable's direction, with the owner's flame-jets-as-tension-gauge idea adopted:

- Scatters 1 and 2 land normally with their existing sting.
- With **2 on screen and reels remaining**, every remaining reel enters anticipation.
- The **3rd scatter is the bonus-secured beat**: a short celebratory pulse, and the
  flame jets **ignite low**.
- If reels remain after the 3rd, tension **escalates rather than resolves**, because
  the 4th is now live: deeper slowdown, flames climbing, riser intensity up.
- The **4th** beats harder and escalates again for the 5th.
- The **5th erupts fully** before the entry card.

The flame jets are the gauge: height and intensity track scatter count from the 3rd
onward. That is the single clearest idea in this design, because it gives the player a
persistent, glanceable readout of how good the round has already become, rather than a
series of unrelated flashes.

## 3. Choreography table

Durations are normal speed. Turbo halves every anticipation hold (see section 4).
"Escalation level" is the value the flame gauge and riser both read from.

| # | Beat | Trigger | Visual layers | Duration | Sound | Escalation |
|---|---|---|---|---|---|---|
| 0 | Ordinary stop | Scatter 1 lands | Existing scatter sting, `charged` glow on the cell | as today | existing scatter sting | 0 |
| 1 | Ordinary stop | Scatter 2 lands | Existing sting, `charged` glow | as today | existing sting | 0 |
| 2 | **Anticipation opens** | 2 scatters on screen AND reels remain | Every remaining reel: neighbour dim, tremble, edge sparks. Landed scatters hold their charge glow | 1.5s to 2.5s per remaining reel | `playAnticipation()` riser loop, base rate | 1 |
| 3 | **BONUS SECURED** | 3rd scatter lands | Short celebratory pulse on the grid, scatter cell flares, **flame jets IGNITE LOW** | 350ms pulse, then continue | riser ducks briefly for the pulse, then resumes one layer up | 2 |
| 4 | **Escalate, 4th is live** | Beat 3 completed AND reels remain | Deeper slowdown on remaining reels, flames climb, sparks denser | 2.0s to 2.5s per remaining reel | riser rate or layer up | 3 |
| 5 | **4th lands** | 4th scatter lands | Harder pulse, flames higher, brief white bloom on the cell | 450ms pulse | riser up again | 4 |
| 6 | **Escalate, 5th is live** | Beat 5 completed AND a reel remains | Deepest slowdown, flames near full, screen edge vignette pulses | 2.5s | riser at maximum sustain | 5 |
| 7 | **5th lands, full eruption** | 5th scatter lands | Flames full height, shockwave ring, grid flash | 700ms | full sting over the riser resolve | 6 |
| 8 | Resolve | Last reel committed | Anticipation cleared on all reels, flames hold at the level reached | 250ms | riser resolves | hold |
| 9 | Entry card | After beat 8 | Existing entry card, CLICK TO CONTINUE, existing colourway routing | as today | as today | hold |

Escalation level maps to the flame gauge as: 0 = jets off, 2 = low, 3 = climbing,
4 = high, 5 = near full, 6 = full. Beats 3, 5 and 7 are the only ones that may fire a
one-shot; everything else is a sustained state.

## 4. Constraints, as directed

- **Turbo shortens, never skips.** Every anticipation hold is multiplied by the
  existing `speedFactor`, and each of beats 3, 5 and 7 keeps its pulse at roughly half
  duration with a floor (suggest 180ms) so the 3-4-5 beats always register. Turbo must
  never take the `scattersLanded >= 2` branch out entirely, which is what today's
  `!isT` on the near-miss path does for the ordinary case.
- **Slam still wins.** Every wait already routes through `_sleepOrSlam()`, so a player
  who slams gets an immediate resolve. That behaviour is preserved untouched.
- **Autoplay** pauses naturally at the entry gate, as already shipped. No change.
- **Reduced motion** gets static glow escalation instead of motion: no tremble, no
  sparks, no flame animation. The escalation level instead drives a step change in a
  static glow intensity, so the information is still conveyed without movement.
- **Audio reuses the existing anticipation loop.** Per-stage layering or playback-rate
  escalation only. **Nothing is generated for this draft.** The round-two audio slots
  that would genuinely improve it, noted rather than actioned: `bonus_trigger` (would
  give beat 3 its own identity instead of ducking the riser) and `win_max` (beat 7's
  full eruption currently has to borrow). If the owner wants those, they are a
  round-two AudioForge request, not part of this pass.
- **Frame gate.** The whole sequence respects the existing frame gate. Sparks and the
  vignette are the first things dropped under pressure; the flame gauge and the reel
  slowdown are the last, because they carry the information.

## 5. Honest note on timings the maths makes awkward

This is the part worth reading before approving anything.

**The outcome is already known when the animation starts.** The frontend receives the
full final board before the reels move. Anticipation is therefore theatre over a
decided result. That is normal for the genre and not a compliance problem, but it
shapes two real awkwardnesses:

1. **Escalation can promise a 4th or 5th that the board never had.** Beat 4 escalates
   "because the 4th is now live". If the final board holds exactly 3 scatters, the
   player gets a deep, expensive build to a stop that adds nothing. Repeated often,
   that build reads as a lie and becomes annoying rather than exciting. **Two honest
   options:** either accept it as genre-standard tension (most slots do exactly this),
   or soften beats 4 and 6 when the known board has no further scatter, which is
   invisible to the player in a single round but detectable across a session by an
   attentive one. **This needs an explicit ruling.** I recommend accepting it, and
   capping the escalation duration so a dead build is short.

2. **Scatter placement does not always leave room for the sequence.** The design
   assumes scatters arrive early enough to leave reels for anticipation. When the 2nd
   scatter lands on reel 4, there is exactly one reel left, so beats 2 through 7 must
   all compress into a single reel stop. When the 3rd lands on reel 5, the
   bonus-secured beat and the full-eruption beat collide on the same frame. The
   sequence must therefore be written as **state driven by scatter count, not a fixed
   timeline**, and every beat must be safe to fire back to back with zero gap. A
   timeline-based implementation will look correct in a curated demo round and break
   on real books.

3. **A retrigger inside the feature reuses the same scatter symbol.** The proposal
   above is written for the base-game trigger. Whether the same escalation runs during
   free spins for a retrigger is an open design question, not covered by this draft.
   My instinct is no, or heavily reduced, because the bonus is already secured and the
   stakes are different.

I have **not** measured per-reel scatter placement frequency from the shipped books.
Doing so is a small piece of work against the same tables
`scripts/qa/bet_level_compliance.py` already parses, and it would turn item 1 above
from a judgement call into a number. Worth doing before the ship brief, not before
this review.

## 6. Prototype status. NOT BUILT this pass, deliberately.

The brief asks for a working prototype behind `?anticipationProto=1`. **It is not in
this PR, and that is a considered decision rather than an omission.**

The sequence lives inside `GameGrid.svelte`'s `_spinSequence()`, which is the reel
timing loop: the most timing-sensitive code in the game, in the largest component
(1,447 lines), and the one every conformance script drives. Even behind a dev flag,
prototyping there means editing the live spin loop, and it needs the escalation level
plumbed out to `FlameJets` through a new store.

Round 4 is a seven-item PR going in immediately before an external audit. Adding a
speculative rewrite of the spin loop to it is exactly the risk the standing bar warns
against, and a prototype rushed to ride along would be judged on its bugs rather than
its design.

**Recommended instead:** the prototype gets its own short branch and its own review,
after Round 4 merges, scoped as:

1. A `scatterEscalation` store (0 to 6), written by `GameGrid`, read by `FlameJets`.
2. `_spinSequence()`'s final-reel-only block generalised to a per-remaining-reel loop
   driven by `scattersLanded`, gated entirely behind the `?anticipationProto=1` flag so
   the shipped path is byte-identical when the flag is absent.
3. Captures at desktop and portrait for a 3-scatter, a 4-scatter and a 5-scatter round,
   using the existing `trigger_3` / `trigger_4` / `trigger_5` mock categories, which
   already exist and give deterministic coverage of exactly the three cases that
   matter.

That is roughly a session's work and it is genuinely reviewable. Say the word and it
is the next thing after Round 4 lands.

## 7. What this proposal needs from the review

1. **Ruling on section 5 item 1**: accept dead builds as genre-standard, or soften when
   the board holds no further scatter.
2. **Ruling on retriggers**: does the escalation run inside free spins?
3. **Confirmation of the escalation-to-flame-height mapping** in section 3, which is
   the owner's idea and should be the owner's call on feel.
4. **Whether to measure scatter placement from the books** before the ship brief.
5. **Approval to build the prototype** on its own branch as scoped in section 6.
