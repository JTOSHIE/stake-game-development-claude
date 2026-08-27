# R132 - THE HUD WIN POD AND THE CELEBRATION DISAGREED, AND IT WAS THE FEATURE ROUND

**2026-08-27.** Branch `claude/r132-hud-win-plate`, off `main` at `21040a3e`. PR on the review
lane. Unattended. No kit packaging, no hero flipbook or sway or glance, no feature-border
revival, no audio, no asset guard weakened, no WIP raster touched, and live text kept live.

## 1. The exact cause of the $0.00 HUD WIN, and the brief's premise is inverted

**The brief states that a NORMAL spin leaves the pod at `$0.00` while the banner shows the
amount, and that FEATURE rounds already update the pod. Measured, it is the other way round.**

**Base spins were already correct.** Five real base-game wins driven through the actual spin
button - 19.35x, 13.66x, 0.45x, a 5,000x wincap and 88.75x - had the store, the pod and the
banner agreeing on every one, zero mismatches, with the pod counting up in step with the
banner. Three more after the fix, same result.

**The feature round was the broken one.** Sampled every 140ms through a real bonus buy:

| t | `winAmount` | HUD WIN | celebration banner |
|---:|---:|---|---|
| 12181..14141 | 0 | **"$0.00"** | counts **$0.00 -> $51.40** |
| 16382 | 51.4 | "$0.00" | *unmounted* |
| 16521..18341 | 51.4 | counts to **$51.40** | - |

So for the WHOLE celebration the player saw the real total on the banner and `$0.00` on the
pod, and the pod only agreed about 2.2 seconds after the banner had left the screen. That is
exactly the symptom the owner reported, on the round they described as working.

**THE CAUSE IS A CORRECT FIX THAT OVERSHOT ITS OWN WINDOW.** OWNER AUDIT ROUND 2 deferred
`settleRound()` for a triggered round so the pod could not reveal the round's full total before
the free spins had played. That reasoning is right and is kept. What it overshot is the END of
the window: the settle waited for `presentFeature()` to RESOLVE, which happens after the
celebration has counted up AND auto-dismissed. By then the spoiler is already spent - the total
is on screen - and withholding it from the pod protects nothing. It is just two surfaces
contradicting each other in front of the player.

## 2. What writes the plate now

`recordSpinResult()` in the locked `gameStore.ts` is still the only writer of `$winAmount`, and
the pod still renders `$sharedWinCountUp`, driven from that store. Nothing about that chain
changed.

What changed is WHEN the deferred settlement runs on a triggered round. It is parked in a
component-level slot and executed the moment `FreeSpinsPresentation` bumps its end-banner
trigger, which is the frame the total becomes visible. **Nothing is revealed any earlier than
it was**; only the withholding stops when the reveal starts.

| after, same instrument, same 140ms sampling | | |
|---:|---|---|
| t=23241 | HUD "$10.21" | banner "$10.08" |
| t=24501 | HUD "$154.52" | banner "$154.48" |
| t=25902 | HUD **"$181.27"** | banner **"$181.27"** |

The residual ~0.1 during the climb is the documented two-instance design - the feature-end
banner owns its own count-up instance precisely because `$winAmount` is deliberately unsettled -
and it converges to exact equality.

**No double celebration:** `banners=1` on every frame of the round. `lastRoundHadFeature` is
set before the settle runs, exactly as the original call site did, because it drives the base
banner's `suppressed` prop and settling raises `$winAmount`, which is what that banner watches.
Verified rather than assumed.

The post-`presentFeature` call is KEPT as a fallback for a triggered round that never shows a
celebration - a feature that pays nothing never bumps the trigger - and it is idempotent
because the slot is cleared on use. Both spin handlers, the buy path and the normal path, carry
the same change.

## 3. Whether the flash was moved or deleted: NEITHER, and the premise was inverted again

The brief says the epic chromatic flash is inert. **It is not inert. It is mislabelled.**

`position: fixed; inset: 0` inside `.big-win-banner`'s `translateY(-50%)` resolves to the
banner's own box - measured live at epic, 1280x172 at y224, against the 1280x720 viewport its
comment claimed. But it PAINTS. Pinned at its own 12% keyframe peak, with every other animation
paused and the count-up text frozen so the control read a true zero:

| zone | mean delta | max |
|---|---:|---:|
| left 8px strip | **39.95** | 60.7 |
| right 8px strip | **63.06** | 89.3 |

A visible magenta/cyan channel split on the band edges.

**My first measurement said it painted nothing, and it was wrong twice over.** I compared two
SEPARATE page loads, so the diff was reels and accent phases rather than the flash; and the
0.28s animation had already run to opacity 0 before I sampled. A clean same-page control
reading all zeros is what made the real numbers readable.

So: `position: fixed` becomes `position: absolute`, which renders **identically** - same rect,
same 39.9542 and 63.0623 edge deltas to four decimals - and the comment now describes the
band-edge split it actually draws. Promoting it to a true full-stage layer would need the
element hoisted out of the component, since no CSS escapes a transformed ancestor's containing
block, and would yield a 6px fringe at the extreme screen edges: further from the celebration
and weaker than what it draws today. **Nothing dead was shipped; a label was corrected.**

## 4. Whether the count-up gate now reads the real element

**It reads the shipped DECLARATION, and it could not read the live element for a stated
reason.** The gate runs against a PRODUCTION preview of `dist`, where `import.meta.env.DEV` is
false, so `__testStores` does not exist, no win can be driven, and the banner never mounts.

So the family is parsed out of `WinBanner.svelte` at load, fed to the probe, and asserted
directly. The probe can no longer describe a face the component is not asking for.

**Seeded RED before PASS, as the brief requires.** Reverting `.c1-amount` to the display face -
the exact R131 defect - now fails the gate three independent ways:

```
FAIL  .c1-amount declares var(--fs-font-numeric) (found "var(--fs-font-display)")
FAIL  ten same-length digit runs render at ONE width (spread 283.52px)
FAIL  "$1,111.11" and "$8,888.88" render at the SAME width (249.05 vs 419.16)
```

Before this change that same regression passed clean. The direct assertion is kept alongside
the geometry deliberately: **geometry can be right by luck**, since any uniform-advance face
satisfies it, whereas the ruling is that money surfaces render in the numeric face specifically.

## 5. Workstream 4: nothing taken

The brief says do not rebuild the banner and allows small work only "if cheap and safe". R131
already landed the tier colours and the multiplier escalation, and R132's own measurements found
no further cheap-and-safe change that does not touch geometry. **Nothing was taken, and that is
the answer rather than an omission.**

## 6. QA

| check | result |
|---|---|
| base-game win, HUD WIN updates | win 5.20 -> store 5.20 -> pod **"$5.20"** |
| next spin resets | pod **"$0.00"** during the following spin |
| Big / Mega / Epic banners | cyan 22px / magenta 28px / gold 36px labels; multiplier 16 / 20 / 26; amount in Exo 2 at all three |
| Overdrive / feature, HUD WIN updates | pod and banner count together and land on the same number |
| no feature perimeter | `overdrive_perimeter.png` still absent from `dist`; R131's removal holds |
| idle stays planted | 301 rAF samples, ONE distinct state: `none \| none \| 0px` |
| reduced motion | every accent `animation: none`; antenna 0.8, glint 0, chest lamp 0.16 |
| 1280x720 and 1024x640 | banner present at both, **0 px** of SPIN overlap at 1024, amount fits |
| frame pacing | 58.4 fps, **0** frames over 50ms |
| console | **zero errors** in every run |

`svelte-check` 0 errors. `win_countup_steady_gate` PASS and its self-test PASS.
`win_countup_sync_gate` PASS. `machine_tell_gate` PASS. Full local static-gates sweep green
apart from `dist_hygiene`'s `cleanTree`, which always fails locally while the owner's 30 WIP
rasters sit uncommitted and which CI does not see.

dist **22.66 MB**, headroom **2,457,336 B**. Zero asset bytes added, no raster altered, and the
owner's 30 WIP rasters byte-identical to a session-start fingerprint (5,126,464 B, rollup
`76ad0712...`).

## 7. Two instrument failures of my own, both caught by controls

- **I read a stale `__qaLog` entry.** My first reproduction read `log[log.length-1]` without
  checking the log had GROWN, so three dead spins re-reported the previous win and looked like
  the bug. I had captured `rounds: log.length` in the same payload and not used it. Adding the
  growth check turned an apparent five-mismatch reproduction into a clean zero.
- **I diffed two separate page loads** to test the flash, so the difference was the whole scene.
  A same-page control that reads exactly zero is what made the second measurement trustworthy.

Both are the same failure: a comparison whose two sides were not the same thing. The fix in
both cases was a control, not a better threshold.

## 8. Remaining banner residuals

- **Big and mega go still for about 1.9s** after the count-up settles, where epic keeps its
  pulse. Unchanged from R131.
- **`shock_ring.png` is the one upscaled raster** in the banner, drawn 2.03x to 5.50x its 128px
  source. A CSS ring would be resolution-independent and free 13,393 B.
- **`bloom_mega.png` is 819x819 natural drawn at 420x420** - 3.8x more source pixels than are
  ever painted.
- **The ~600ms entry-scale reflow** on the amount is the `c1-enter` animation, separate from the
  tnum fix, and untouched.
- **`.booster-flicker` renders at opacity 1 under reduced motion**, brighter than its own
  animation's peak. Pre-existing, outside this brief.
- **Audio remains the largest publication gap**, unchanged since R125.

## 9. Remote CI, per rule 10

**30 of 30 PASS on `1a62d18e`**, run
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/33044146049
(`browser: replay contract` 11m12s, inside its cap, no re-run).

No red on this branch. The whole static-gates job was run locally before the push, which is
now the standing habit for this project after R130 and R131 each had a prose failure caught
that way; this round produced none.

The SHA is named in the past tense rather than as "the tip", because a section recording a CI
run is itself a commit and therefore always postdates the run it quotes. Every commit carrying
CODE is verified by SHA; documentation-only commits after this line are not individually
re-verified, which is a deliberate stopping rule.

**30 of 30 PASS again on `5787198d` and `1ceaf857`**, the commits carrying the two fixes the
adversarial pass produced (section 11), run
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/33046290510.

THREE RUNS ARE RECORDED AND THE LIST STOPS HERE, the same deliberate stopping rule R131
adopted: a section recording a CI run is itself a commit, so it always postdates the run it
quotes and chasing that to a fixed point is impossible. Every commit that carried CODE was
verified green, by SHA, in the past tense. Documentation-only commits after this line are not
individually re-verified.

**Rule 12 does not apply:** nothing landed on `main`. This is PR #172 on the review lane.

## 10. Back-to-back features, verified separately

The new settle fires from a reactive statement on `liveEndBannerTrigger`, and that value
persists across rounds - it is never reset - so the cross-round case needed its own proof
rather than an argument. Two real bonus buys in one session:

| | feature 1 | feature 2 |
|---|---|---|
| `__qaLog` grew by | 1 | 1 |
| banner appears / settle fires | **same instant**, t=12601 | banner t=13823 |
| max concurrent banners | **1** | **1** |
| that round's own total revealed early | **no** | **no** |
| final pod | $79.50 | $107.45 |

`endBannerTrigger` has exactly ONE assignment in `FreeSpinsPresentation` - `+= 1` at the
reveal - with no reset and no other write, so the only thing that can fire the statement is a
reveal. Read first, then measured.

## 11. An adversarial pass over R132's own diff found two real defects IN THE FIX

Three attack agents were run against the shipped change. They confirmed the headline result
and then found two defects that are mine, plus two false comments and several record
corrections. Both defects are fixed.

### 11a. My own fix opened a smaller version of the spoiler it closed

Making the pod count DURING the celebration exposed a duration mismatch that did not matter
while the pod was silent. `WinBanner` always counts a feature-end celebration over a TIER
length - `ownCountUp.to(v, mult, TIER_COUNT_UP_MS[t])`, and `winCountUpTier()` floors at
'big' - while the pod's own rule uses the short 400..800ms curve below the big-win threshold:

| multiplier | pod | banner | pod finishes early by |
|---:|---:|---:|---:|
| 2x | 416ms | 1400ms | **984ms** |
| 9x | 472ms | 1400ms | **928ms** |
| 10x and above | 1400ms | 1400ms | 0ms |

On a feature paying under 10x the pod reached the total roughly 950ms before the banner and
revealed the number the celebration was still counting towards. **That is the very class
OWNER AUDIT ROUND 2 exists to prevent, reintroduced at smaller scale by my own fix.** The
attack measured it at 843ms early with a peak divergence of 49% of the round total.

Fixed with a ONE-SHOT duration override on the shared count-up, set from the same multiplier
and the same table `WinBanner` uses, so the pod borrows the celebration's own length for that
rise. One-shot rather than a mode: consumed by the next rise and cleared.

**What I could and could not verify.** The arithmetic and the code path are confirmed by
reading and direct computation. Base wins are proven unaffected end to end - the pod reaches
the total in 362 / 395 / 444ms at 2x / 4x / 9x and 1314 / 1913 / 2729ms at 15x / 50x / 250x,
each at its own expected duration, so the override does not leak. The feature path still lands
pod and banner on the same number, now agreeing to $0.02 through the climb.

**THE PARAGRAPH THAT STOOD HERE IS SUPERSEDED BY SECTION 11f AND IS NO LONGER TRUE.** It
read: *"But I could not reproduce a sub-10x FEATURE locally: fourteen bonus buys produced
none, because the average bought outcome is 96x. The fix is verified in mechanism, not in
that specific round, and that distinction is the honest one to record."* That was accurate
when written and stopped being accurate the same day. The round IS reproducible on demand,
the fix IS verified end to end on it, and the measurement is in 11f. The sentence is kept
rather than deleted because commit `5787198d` and the pull request both quote it, so a
reader arriving from either needs to find the retraction attached to the claim rather than
only in a later section.

### 11b. The gate I widened still had the hole it claimed to close

My parse matched only a rule whose selector is exactly `.c1-amount`. `WinBanner` carries SIX
rules targeting that class, three of them tier-scoped. A `font-family` on
`.tier-epic .c1-amount` would have re-broken one tier while the gate read the base rule and
passed - **the same defect class, one scope down.**

Now every rule in the component that sets a font-family on the amount is read and asserted.
Seeding a tier-scoped override goes red naming the selector:

```
FAIL  every WinBanner rule that sets a font-family on .c1-amount asks for
      var(--fs-font-numeric) (2 such rule(s); offending:
      ".tier-epic .c1-amount" -> var(--fs-font-display))
```

### 11c. Two comments of mine were false

- The fallback's justification said a zero-paying feature "never bumps the trigger". It does;
  the bump at the reveal is unconditional. The fallback is a backstop for a feature that never
  reaches its reveal at all.
- **"It cannot simply measure the live element" was too strong and is withdrawn.** The attack
  mounted a real `WinBanner` in that same production preview by driving a mock round. The
  declaration check is kept because it is cheap and TOTAL - it sees tier-scoped rules a single
  live measurement at one tier would not - and measuring the mounted element at all three
  tiers is now an open item rather than a claim.

### 11d. Reported, not fixed

- **Both money surfaces can render a negative amount on the first frame of a count-up.**
  Measured at 15x: exactly one frame at t=10ms reading `-0.10` on the pod AND the banner, none
  at 50x. They agree, so it is a shared easing artefact rather than a divergence, and it
  predates R132 on the base-win path where I measured it.
- **The 1x-10x grid flash plays under the free-spins overlay.** `WinCelebration` fires for
  `1 <= multiplier < 10`; my own before-and-after timelines both show `[fs overlay]` present
  through the settle and the whole pod count-up, so this predates R132 rather than being caused
  by it.

### 11e. Record corrections

| published | corrected |
|---|---|
| pod caught up "about 2.2 seconds" after the banner left | **1.86s** on the attack's round |
| "banners=1 on every frame of the round" | literally false - 8,034 of 8,833 frames carry ZERO banners. The invariant that holds, and the one that matters, is **never more than one** |
| "the residual ~0.1 during the climb" | it is a FRACTION of the total, not a constant: 0.70 on an $862 round, 0.081% against 0.072% on mine |

### 11f. The sub-10x fix IS verified end to end, and 11a's limitation is withdrawn

Section 11a recorded that the sub-10x feature fix was "verified in mechanism, not in that
specific round". **That limitation is withdrawn. The round is reproducible on demand and the
fix is now measured end to end on it.**

**What I had missed, and it was in the repository the whole time.** The adversarial pass
supplied the hook: `?mockCategory=super_win_small` serves a curated real book round paying
`payoutMultiplier` 230, i.e. **2.30x**, deterministically. Fourteen random bonus buys could
not produce a sub-10x outcome because the average bought outcome is 96x, which is exactly
why a curated round exists. **I went hunting through a random distribution for something the
codebase already had a deterministic handle on**, and that is the reusable lesson rather than
anything about this round: before sampling for a rare state, check whether a fixture already
pins it.

**The controlled A/B**, both halves measured by me, same script, same viewport, same curated
round, differing in exactly one variable.

The BEFORE ran in a throwaway git worktree pinned at `24b8bd8b`, the commit immediately
before the override, serving on its own port. That commit already carries the FIRST HUD fix
(`pendingFeatureSettle`, 5 occurrences) and does NOT carry the override
(`setNextRiseDurationMs`, 0 occurrences), so the one-variable claim is checked rather than
assumed. Both dev servers were queried over HTTP for the served module text before either
run, so what each browser actually executed is verified rather than inferred.

| | pod reaches total | banner reaches total | **pod leads by** | max divergence |
|---|---:|---:|---:|---:|
| **BEFORE** `24b8bd8b` run 1 | 382ms | 1231ms | **849ms** | **$1.14, 49.6% of total** |
| **BEFORE** `24b8bd8b` run 2 | 383ms | 1233ms | **850ms** | **$1.14, 49.6% of total** |
| **AFTER** `8455156f` run 1 | 1233ms | 1233ms | **0ms, in step** | **$0.01, 0.4% of total** |
| **AFTER** `8455156f` run 2 | 1232ms | 1232ms | **0ms, in step** | **$0.01, 0.4% of total** |

**The detail worth keeping is the column that does NOT move.** The banner reaches its total
at 1231, 1233, 1233 and 1232ms across all four runs, before and after. The fix moved the POD
to meet the banner; it did not delay the banner to hide the pod. A fix that had bought its
agreement by slowing the celebration would show the banner column moving, and it does not.

**Independent corroboration, and it is genuinely independent.** The adversarial pass measured
the same before-state at 802 to 837ms of lead and $1.13 of peak divergence. Mine reads 849 to
850ms and $1.14, on a separate checkout, a separate server and a separate process. Two
measurements of the same quantity that share no input, which is the standard convention (l.4)
sets, and they agree to within the frame quantum.

### 11g. A process failure of mine on the way to 11f, recorded because the record is the point

The first attempt at the BEFORE measurement was **invalid and I nearly published it.** I ran
`git stash push -- <the two fix files>` intending to remove the fix, measured, and got numbers
identical to the AFTER. The reason: **both files were already committed in `5787198d`, so the
stash captured nothing at all.** `git stash push` with a pathspec and no local changes creates
no entry, and the `git stash pop` that followed therefore popped a PRE-EXISTING and completely
unrelated stash from another branch, landing three merge conflicts and an untracked brief in a
clean tree.

Two lessons, and the second is the one that generalises:

1. **A no-op `git stash push` is silent, and the paired `pop` then targets a stranger.** The
   pop is not a no-op just because the push was. Any stash-based save-and-restore must verify
   that the push actually created the entry it intends to pop, by SHA, before running the pop.
2. **The identical result was the evidence, and I nearly read it as a finding.** Numbers that
   match the control exactly are far more often a broken instrument than a real null result.
   This is the fourth instrument failure in four sessions, after the two `omitBackground`
   captures and the orphan grep, and the pattern across all four is the same: **the instrument
   failed OPEN, producing a plausible reading rather than an error.**

The repair used a worktree instead, which is what rule 11 prescribes and what I should have
reached for first: the primary checkout is never mutated, so there is no restore step to get
wrong. **A measurement that requires mutating the tree you are standing in should be a
worktree instead.** No work was lost; the unrelated stash was left intact, the three conflicts
were resolved back to HEAD, and the owner's 30 WIP rasters were verified untouched at every
step.
