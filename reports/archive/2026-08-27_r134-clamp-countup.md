# R134 - MONEY NEVER GOES NEGATIVE, AND THERE WERE TWO COUNT-UPS

Brief: `reports/briefs/FS_R134_ClampCountUp_Prompt.md`, saved verbatim before any work.
Branch `claude/r134-clamp-countup`, review lane, pull request #174.
Boot state: on main at 08b9688b (the PR #173 merge, so R133 was live), the owner's 30 WIP
rasters fingerprinted from the repo root with absolute paths before any file operation and
byte-identical to the R133 fingerprint, then re-verified at close.

This pass exists because R133 escalated a defect rather than fixing it out of scope. The
brief is that escalation coming back as its own job, which is the mechanism convention
(l.8) is for working correctly.

## 1. The exact function that leaked negative progress

VERIFIED at HEAD by direct read before any change, per rule 16, rather than carried forward
from my own R133 narration:

```
frontend/src/lib/stores/winCountUp.ts:155
      const progress = Math.min((now - startTime) / duration, 1)
```

`Math.min(x, 1)` bounds the TOP of the range and leaves the BOTTOM open. `startTime` is
captured with `performance.now()` at the moment the tween is built; `tick()` is handed the
requestAnimationFrame timestamp, which is the time the FRAME began. A tween created during a
long frame is therefore handed a `now` that PRECEDES its own start, elapsed goes negative,
and negative progress passes straight through the clamp.

`easeOutCubic` then makes it worse rather than better. It is cubic, so it AMPLIFIES a small
negative by about three times: a lead of roughly 24ms, one and a half frames at 60fps,
renders about -2.6% of the round total. **And because it is a fraction of the total, the harm
scales with the win.** R132 saw the 15x case at -$0.10, recorded it as a shared easing
artefact and did not pursue it. R133 measured -$21.35 on the HUD pod beside -$22.17 on the
banner at 830x, in six of seven bonus rounds. One defect, two orders of magnitude apart,
largest on exactly the rounds a player cares most about.

## 2. WS1: the inventory found the same defect written out TWICE

The brief said "fix the cause, not one label". The cause turned out to have two copies.

**Every rAF loop in `frontend/src`** was enumerated (6 files), then filtered to those that
write a figure a player reads as money. `GameGrid` animates reels, `autofitText` and
`fitMoney` size text without computing values, and `HudOverlay`'s only mention of
requestAnimationFrame is a COMMENT recording the MID-01 unification, not a loop. Every
`setInterval` was checked too: `WinBreakdown` cycles win GROUPS, `SessionPanel` ticks elapsed
time, and `App`'s interval is a dev demo. None tween money.

That leaves exactly two, and the second is the one that mattered more:

| # | file and function | what it feeds |
|---|---|---|
| 1 | `stores/winCountUp.ts`, `createWinCountUp().to()` | the HUD WIN pod (HudOverlay via `sharedWinCountUp`), the win banner and the feature-end banner (WinBanner via `displayAmount`) |
| 2 | `components/WinDisplay.svelte`, `startCountUp()` | **the Bet Replay end-of-round banner** |

**THE SECOND COPY IS THE FINDING OF THIS PASS.** `WinDisplay.startCountUp()` carried
`Math.min((now - start) / duration, 1)` and then `1 - Math.pow(1 - progress, 3)` written out
by hand: the same clamp and the same cubic, duplicated rather than shared. It is live,
mounted by `ReplayMode.svelte`, and **Bet Replay is mandatory under the compliance rules and
is a surface a platform reviewer opens on purpose.** Fixing only the instance R133 reported
would have left a negative money amount live on the review surface while this report claimed
the class was closed. Two implementations of one idea is how one bug becomes two.

**THE SHARED HELPER the brief asked me to name** is `createWinCountUp` in
`stores/winCountUp.ts`, and `sharedWinCountUp` is its single instance for `$winAmount`.
Before this pass it was shared by the HUD and the banner but NOT by WinDisplay, which is
precisely why WinDisplay drifted.

## 3. WS2: clamped at the source, and as a class

Two exported helpers, one definition each, both used by both count-ups:

- **`countUpProgress(elapsedMs, durationMs)`** clamps to [0,1]. Written with negated
  comparisons rather than `Math.max`/`Math.min` so that NaN lands on 0 rather than
  propagating, and returning 1 for a non-positive or non-finite duration so a caller cannot
  divide into an infinity.
- **`nonNegativeMoney(value)`** floors the emitted figure. NaN and -0 both fall to 0.

`WinDisplay` now imports the progress rule, the easing AND the floor from the store module,
so there is exactly one definition of each and the replay banner cannot drift from the HUD
and the banner again.

**THE TWO CLAMPS ARE DELIBERATELY NOT THE SAME GUARANTEE.** The progress clamp fixes the
cause that was found. The value clamp fixes the CLASS: whatever a future caller does to a
tween, no money surface reading through this module renders below zero. A single defect can
be closed at its cause; a guarantee has to hold against the next mistake too, and the two
together are what let this report claim a player never sees a negative win rather than that
one arithmetic bug was corrected. `snap()` and the non-browser early return are floored as
well, so the guarantee does not have a hole in the paths nobody was looking at.

## 4. WS2: the seeded gate, and the trap inside it

`frontend/scripts/countup_nonnegative_gate.mjs`, wired into the static job beside the
precision law gate, because it is the same subject from the other end: **precision governs
the number's SHAPE and this governs its SIGN.**

**TWO CHECKS, BECAUSE EITHER ALONE FAILS OPEN.** A behavioural check alone passes the day
somebody writes the raw form in a new component, because it only knows the functions it
imports. A source check alone passes the day somebody keeps the shape and breaks the
arithmetic. So the gate drives the LIVE exported functions with a `now` that precedes
`startTime`, at the three multipliers the brief names crossed with nine leads, AND asserts
that every money count-up routes its progress through `countUpProgress` and its emitted value
through `nonNegativeMoney`.

The self-test plants the pre-R134 arithmetic and the pre-R134 source form and requires both
to go red. **It reproduces R133's measured figures rather than merely asserting a sign**,
which is the difference between a test that proves the mechanism and one that proves an
inequality:

```
  caught  seeded: the pre-R134 arithmetic renders a negative (29 case(s))
            15x over 1400ms, 23.8ms lead: $-0.78
           830x over 2800ms, 23.8ms lead: $-21.35
          5000x over 2800ms, 23.8ms lead: $-128.59
  caught  seeded: the upper-only clamp restored in source (3 finding(s))
  ok    seeded: NEGATIVE CONTROL, the live arithmetic must pass
  ok    seeded: NEGATIVE CONTROL, the real source must pass
  caught  seeded: the fixed files DO quote the old form in prose, and stripping handles it
```

The -$21.35 at 830x is R133's own measured pod figure, reproduced from the arithmetic alone.
The 15x row differs from R132's -$0.10 because the lead differs, not the mechanism: -$0.10 at
15x corresponds to a lead of about 3ms and the gate runs 23.8ms.

**THE LAST LINE IS THE TRAP, AND IT IS `css_liveness_gate`'S LESSON IN REVERSE.** That gate
documents a scan that found a rule Svelte had commented out and reported PASS on the very
defect it existed to catch. Here the inverse applies: the FIXED files quote the defective
line inside the comment that explains the fix, so a source scan that did not strip comments
would go RED on the explanation of the repair, for ever. Comments are stripped before every
source assertion, and the self-test asserts that the fixed files really do still contain the
old form in prose, so the stripping is proved load-bearing rather than assumed.

## 5. WS4: proved LIVE, because intermittent means waiting is not evidence

The defect fires only when a tween is created during a long frame, so a run that sees nothing
proves nothing. Forcing it does: running `performance.now()` **45ms AHEAD of the rAF clock**
reproduces the exact race deterministically, on every round, because every tween's captured
start is then 45ms ahead of the timestamps its own ticks receive.

Two dev servers, one variable apart, each verified over HTTP before every run.

| round | BEFORE, forced | AFTER, forced |
|---|---|---|
| base 16.20x | 1 negative frame, pod `WIN $-1.07` beside banner `$-1.07` | **0** |
| super 2.30x, sub-10x feature | 3 negative frames, worst `$-0.22` | **0** |
| bonus 830x | 3 negative frames, pod `WIN $-30.16` beside banner `$-30.70` | **0** |
| unforced control, both servers | 0 | 0 |

The unforced row is the control that makes the rest meaningful: it is what "intermittent"
looks like, and it is why the forcing harness had to exist.

**AN INSTRUMENT PROBLEM I FOUND AND FIXED, WHICH ALSO EXPLAINS AN R133 CONFOUND.** The BEFORE
server initially served a `vite-error-overlay` that swallowed every click, and 403'd all 22
font files. The cause: the worktree's `node_modules` is a SYMLINK to the primary checkout, so
every dependency resolves OUTSIDE the vite root and `server.fs.allow` refuses to serve it. An
R133 verification agent hit exactly this and reported the font 403s as an unexplained
confound on my BEFORE server; this is the cause, and the fix is a throwaway config in the
gitignored worktree widening `server.fs.allow`. Both servers then served fonts 200.

## 6. WS3: R132 and R133 re-proved on the clamp

| round | pod reaches total | banner | lead | max divergence | negative frames |
|---|---|---|---|---|---|
| base 16.20x | 1317ms | 1317ms | **0ms** | **$0.0000** | 0 |
| feature-end 830.23x | 2765ms | 2765ms | **0ms** | $0.5300 | 0 |
| sub-10x feature 2.30x | 1237ms | 1237ms | **0ms** | $0.0100 | 0 |

Contrast, on the calibrated full-coverage instrument R133 built, against R133-as-merged:
tier label 11.81 to 11.65 (big), 4.82 to 4.82 (mega, identical), 7.46 to 7.36 (epic); amount
11.19 to 11.98, 11.86 to 11.86, 11.88 to 11.94. Zero failing pixels on either side. The
variation is round-to-round reel noise, and mega matching to two decimals is the sign the
instrument is stable.

R133's chrome is intact: the tier burst still paints INSIDE the band at 7,801px against
R133's own 7,487px, with drift 0 and a positive control of 117,718px. Not zero, which was the
pre-R133 state.

Reduced motion still reports 0 banner animations at all three tiers against 19 under
no-preference. Five widths from 1280 to 390 with no text clipping, the narrow gap still 4px,
frame rate 56.4 to 59.9 mean, and zero console errors anywhere.

## 7. Reported, not fixed

**`GameGrid.svelte` carries four progress clamps of the identical upper-only shape**, at lines
392, 471, 507 and 529. They animate reel velocity, strip travel and symbol scale rather than
money, so they sit outside a count-up-and-money fence and are not touched here. They are the
same defect class: a negative there would jump a reel rather than show a minus sign. Recorded
so the next person to open that file has the diagnosis already made.

## 8. FOR THE NEXT SESSION

**Model and effort:** Opus 5, high effort. No multi-agent workflow this time: the job was a
bounded inventory and a two-line arithmetic fix with a gate, and the expensive part was
PROVING it live rather than searching for it. Sizing the method to the job is the point.

**Approach:** verify the premise at HEAD before trusting it, even when the premise is your own
previous session's finding; enumerate the whole class before fixing the reported instance;
then force the intermittent condition rather than waiting for it.

**Alternatives tried and rejected:** waiting for the natural race, which produced zero
negatives on both servers and would have "proved" the fix worked on a tree where it was
absent; and hiding the sign at the formatter, which the brief forbade and which would have
left both tweens computing a negative that some other surface could still read.

**Files touched:** `frontend/src/lib/stores/winCountUp.ts`,
`frontend/src/lib/components/WinDisplay.svelte`,
`frontend/scripts/countup_nonnegative_gate.mjs` (new), `.github/workflows/checks.yml`, plus
the brief, this report and its archive.

**Open threads:** the four GameGrid clamps in section 7; and the overdrive-tinted banner,
still unreachable in real play since R133 and still unfixed, since it lives in
FreeSpinsPresentation rather than in any money surface.
