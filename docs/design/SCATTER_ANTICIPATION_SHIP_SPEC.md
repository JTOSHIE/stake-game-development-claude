# Scatter anticipation: ship specification

Supersedes the open questions in `SCATTER_ANTICIPATION_PROPOSAL.md`. Built under Fable's
integrity ruling, 2026-07-25.

## 1. The integrity ruling, and why it dissolves the hard question

The ruling: **escalation from landed scatters plus still-moving reels only; no book
lookahead; uniform timing; no synthetic near-misses.**

The proposal's section 5 item 1 asked for a choice between two unattractive options:
accept builds that promise a 4th scatter the board never had, or soften the build when the
known board holds no more, which means reading the outcome. The ruling takes neither,
because it changes what the build is *saying*.

Escalation is a function of two things the player can see or verify:

- how many scatters have **visibly landed**, and
- whether reels are **still moving**.

A level-3 build therefore states: *"three are down and reels are still turning."* That is
true one hundred per cent of the time. It never claims a fourth is coming. There is no lie
to soften, so there is nothing to soften, and no reason to read the board.

**Consequence:** `_checkAnticipation(finalBoard)` is deleted. It inspected the final board
to fabricate a high-symbol near-miss, which is both a synthetic near-miss and a board read.
It was also `!isT` gated, so turbo removed it entirely, which the proposal separately
flagged as wrong.

## 2. Measured facts this design is built on

From 40,000 shipped `books_base` rounds, visible 5x4 window only (padding rows excluded).

| Fact | Value | Why it matters |
|---|---|---|
| Anticipation opens (2+ scatters) | **23.18%** of base rounds | Frequent enough to matter, rare enough not to wear out |
| Of those, reach 3 and trigger | **64.5%** | The build genuinely means something |
| Of those, die at 2 | **35.5%** | Honest tension, not a constant tease |
| Triggers going past 3 | **24.0%** | Escalating after the 3rd pays off about one time in four |
| 3rd scatter lands on the **final reel** | **46.2%** | Secured and resolve collide nearly half the time |
| 2nd scatter lands on reel 1 / 2 / 3 | 34.6 / 40.3 / 25.1% | There is **always** at least one reel of runway |
| Rounds with **2 scatters on one reel** | **0.5%** | The level can jump by two in a single stop |

The last row is the one that would have caused a bug. A ladder that advances one beat per
reel stop is wrong about one round in two hundred. Levels are therefore **computed from
state, never incremented.**

## 3. The escalation function

Pure, total, and dependent on nothing else:

```
escalationFor(scattersLanded, reelsRemaining):
  landed < 2                    -> 0   jets off
  landed = 2, reels remain      -> 1   anticipation open, jets still off
  landed = 2, no reels remain   -> 0   died at two, clear
  landed = 3, no reels remain   -> 2   SECURED (pulse), jets ignite low
  landed = 3, reels remain      -> 3   climbing
  landed = 4, no reels remain   -> 4   fourth landed (pulse), jets high
  landed = 4, reels remain      -> 5   near full
  landed >= 5                   -> 6   full eruption
```

Levels 2, 4 and 6 are **one-shot pulse** beats; 1, 3 and 5 are **sustained** states. Jets
are off below level 2 because the flame gauge reads "bonus secured and how good", not
"something might happen".

## 4. Timing

**Uniform per level, independent of outcome.** A level-3 hold is the same length whether or
not a fourth scatter is coming, because the game does not know and must not act as if it
does.

| Level | Sustained hold (normal) | Pulse (normal) |
|---|---|---|
| 1 | 900ms | - |
| 3 | 1000ms | 350ms (level 2) |
| 5 | 1100ms | 450ms (level 4) |
| - | - | 700ms (level 6) |

- **Turbo shortens, never skips.** Holds multiply by the existing `speedFactor`
  (Normal 1, Turbo 0.5, Super Turbo 0.16) with a **300ms floor**, preserving the existing
  gate. Pulses use a **180ms floor** so the secured beat always registers.
- **Slam still wins**, unchanged: every wait routes through `_sleepOrSlam()`.
- No beat is skipped at any speed. That is the whole point of a floor.

### The hold lengths are RULED, not provisional (owner, 2026-07-25)

The builder raised the level-3 hold as a possible drag: it runs for a fixed 1000ms whether
or not a fourth scatter is coming, and 76% of the time nothing more is coming. **Ruled to
stand, and the reasoning is the part that matters:**

> "If you're getting the bonus of three, you still want to see if you're getting the four
> or the five, because that's the increase multiplier, it's the increase spin, so people
> don't mind waiting that additional time... you're not going to get spins that often, so
> there's got to be that anticipation and buildup. The fact that you're getting spins,
> people are already locked in. That's already a time to focus and slow down. **It's when
> it's dead spins that people just want it to go quicker.**"

**The principle, stated generally: attention is earned by the round.** A round that has
secured something deserves time; a round that has produced nothing should get out of the
way. Anyone tempted to shorten these holds later should check that principle first, because
the ladder already implements it:

| Round state | Hold | Why |
|---|---|---|
| 0 or 1 scatter, a dead spin | **none at all** | full speed, nothing has been earned |
| 2 down, reels turning | 900ms | genuinely live, something is still possible |
| 3 or more, reels turning | 1000 to 1100ms | locked in, and the player wants to see 4 or 5 |

Note what this does NOT license: shortening a hold *because the outcome is known to be
disappointing*. That is the book lookahead the integrity ruling forbids. Dead spins are
fast because they never open the ladder at all, which is a property of visible state, not
of the outcome.

The pause between the sequence resolving and the free spins beginning was raised in the
same review and accepted as natural. No change.

## 5. Reduced motion

`prefers-reduced-motion` gets the same **information** without movement: no tremble, no
sparks, no flame animation. The escalation level drives a stepped **static glow intensity**
via a CSS custom property, so a player who cannot take motion still sees how good the round
has become. Holds still elapse, so pacing is unchanged.

## 6. Frame gate

The existing gate is hard: **avg fps >= 55 and zero frames over 100ms**. Under pressure the
drop order is, first to last: edge sparks, vignette, tremble, flame gauge, reel slowdown.
The gauge and the slowdown carry the information and are dropped last.

## 7. Deliberately not in scope

**Retriggers inside free spins.** The ruling is silent, the proposal's instinct was "no, or
heavily reduced", and the stakes genuinely differ once the bonus is secured. Parked as
TR-036 with options rather than decided here.
