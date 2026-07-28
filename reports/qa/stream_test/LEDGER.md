# Stream test ledger

The single consolidation target for every Wave 2 discovery shard. Opened by the
recovery session (2026-07-28, `reports/briefs/FS_STREAM_TEST_RECOVERY_Prompt.md`
JOB 2) with the two findings the trial session caught mid-flight, before its
allowance ran out and before any squad shard existed to hold them.

JOB 4 consolidates the shards into this file. Until then this ledger holds only
the two entries below, and `shards/SHARD_INDEX.md` is the authority on what has
and has not been swept.

Australian English, no em dashes or en dashes.

## Severity scale

- **STREAM**: a watching audience would notice it. Reserved for exactly that.
- **HIGH**: a reviewer or streamer inspecting the surface would catch it.
- **MEDIUM**: visible on comparison or repeat viewing.
- **LOW**: detectable only with tooling or pixel inspection.

## Mid-flight findings, credited to the trial session

Both were found by the trial session (Fable 5) while reviewing the Wave 1
capture set, ahead of the Wave 2 squads. Credit for the FINDING is the trial
session's. The derivation, the codepoint check and the frame confirmation below
are the recovery session's, and are recorded separately so the two are not
conflated.

---

### MID-01 STREAM The banner count-up and the HUD WIN pod display different amounts at the same moment

- **Frames**: `reports/screens/stream-test-2026-07-28/013_desktop_transition_bigwin_countup_early.png` (banner `$10.29`, HUD WIN pod `$15.95`, on a win that settles at `$16.20`). Settled state for comparison: `015_desktop_bigwin_settled.png` (both `$16.20`). The same three-frame pattern exists in every session: `065`/`067` laptop, `117`/`119` popout-l, `169`/`171` popout-s, and siblings through `stretch`, `de-desktop` and `ar-desktop`.

- **Claim**: Two independent count-up implementations animate the same figure over different durations, so for most of a big win the game shows two different dollar amounts on screen at once.

  Derived from the specification first, per convention (l.1):

  | | Banner | HUD pod |
  |---|---|---|
  | Source | `frontend/src/lib/components/WinBanner.svelte:166` | `frontend/src/lib/components/HudOverlay.svelte:312-315` |
  | Duration | `TIER_COUNT_UP_MS[big]` = **1400 ms** (`WinBanner.svelte:79`) | `min(800, 400 + min(400, mult * 8))` = **528 ms** at 16x (`HudOverlay.svelte:302-303, 312-315`) |
  | Easing | `1 - (1 - p)^3` (`WinBanner.svelte:171`) | `1 - (1 - p)^3` (`HudOverlay.svelte:318`) |

  The easings are identical and the durations differ by a factor of **2.65**. The pod therefore settles at 528 ms and then sits on the final figure for a further **872 ms** while the banner is still counting.

  **The frame confirms the derivation to one cent.** Frame `013` shows the banner at `$10.29` of `$16.20`, which is 0.635 of the total, so `1 - (1 - p)^3 = 0.635`, giving `p = 0.2853` and `t = 0.2853 * 1400 = 399 ms`. At `t = 399 ms` the pod's own progress is `399 / 528 = 0.7557`, eased to `0.9854`, predicting a pod reading of `16.20 * 0.9854 = $15.96`. **The frame reads `$15.95`.** Measurement confirmed the derivation rather than discovering it, per convention (l.2).

  At that instant the two readouts disagree by **$5.66 on a $16.20 win**, and the HUD has already revealed the figure the celebration exists to reveal.

  `HudOverlay.svelte:296-297` names the duplication in its own comment (*the same rAF/cubic-ease approach `WinBanner.svelte` already uses*) and the two durations were never reconciled. This is the duplicated-concept lens, which `docs/skills/FULL_AUDIT_METHOD.md` section 1.1 records as the highest-yield lens on this title.

- **Where fixable**: `frontend/src/lib/components/HudOverlay.svelte:302-315` and `frontend/src/lib/components/WinBanner.svelte:79,166` (neither locked).

- **Proposed fix**: PARK(the reconciliation is an art call, not a mechanical one). Three options, for the owner: (a) hold the HUD pod at its pre-win value while a banner-tier win is celebrating and snap it on banner completion, so the celebration reveals the figure first; (b) drive both from one shared count-up clock so they track exactly; (c) accept the divergence and state it as intended. Option (a) is the genre convention. The choice affects what a viewer sees at the most-watched moment in the game, so it goes to the owner rather than being picked by the builder.

---

### MID-02 HIGH The win banner writes the multiplier with a letter `x`, and the row that enumerated this class missed it

- **Frames**: `reports/screens/stream-test-2026-07-28/013_desktop_transition_bigwin_countup_early.png`, `014_desktop_transition_bigwin_countup_late.png`, `015_desktop_bigwin_settled.png`, all rendering `16x BET`. **60 of the 519 frames** carry this surface (every session's big-win triple plus its max-win frames).

- **Claim**: `frontend/src/lib/components/WinBanner.svelte:205` builds the unit as ``` `${Math.round(shownMultiplier)}x` ```, where the `x` is ASCII U+0078, not the multiplication sign U+00D7 the rest of the game uses.

  The project's own convention is recorded, not inferred: `frontend/src/lib/components/MaxWinCelebration.svelte:151-155` carries a comment stating that *the paytable, the mode cards and the feature menu all write the multiplication sign `×` (U+00D7, which Orbitron carries)*, and that surface was changed to `×` under charter row **Q-12**. `FS_MAX_WIN_LABEL = '5,000×'` at `frontend/src/lib/config/fsModes.ts:139` is the same convention. Seventeen files under `frontend/src/lib/` use U+00D7.

  **The finding that matters more than the glyph**: charter row **Q-26** (`docs/QUALITY_CHARTER.md:198`) exists precisely to record that the Q-12 fix was not swept to the class, and it enumerates the survivors as *four more player-visible instances* in `fsModes.ts`. That enumeration is incomplete. `WinBanner.svelte:205` is a fifth, it is not in `fsModes.ts`, and it is on the most prominent surface in the game. A row written to catch an incomplete sweep was itself incompletely swept.

  This is the failure `docs/skills/FULL_AUDIT_METHOD.md` section 2.6 names: a parked list that calls itself complete and is not. The instrument that built Q-26's list evidently searched the config and prose layers and not the components.

- **Where fixable**: `frontend/src/lib/components/WinBanner.svelte:205` (not locked).

- **Proposed fix**: change the literal to `×` (`` `${Math.round(shownMultiplier)}×` ``), a one-character edit in unlocked component code, and widen Q-26's enumeration to the whole tree rather than the two files it searched. Re-proof from fresh frames, not from the old ledger, per audit method 2.2. Note for the marshal: `WinPod.svelte:6` renders the same quantity as ``` `${$winMultiplier.toFixed(1)}×` ```, so it disagrees with the banner on **precision** as well as glyph (one decimal against an integer); that component appears to be imported by nothing at HEAD and should be checked before it is either fixed or deleted.

---

## Consolidated shard findings

Not yet populated. JOB 4 consolidates `shards/*.md` into this section after the
JOB 3 discovery squads complete.
