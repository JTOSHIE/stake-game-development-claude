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
