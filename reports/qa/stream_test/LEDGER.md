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

**READ THIS FIRST: NOTHING BELOW HAS BEEN VERIFIED.** The discovery wave
completed. The adversarial verification pass did not run. Every figure and every
claim below is a squad's own report of its own work, and no agent has yet been
asked to refute any of it. `docs/skills/FULL_AUDIT_METHOD.md` section 1.2 is
explicit that a finding which has only ever been asserted is not worth acting
on, and section 4 is explicit that a half verified list is worse than an
unverified one. This is an unverified list, labelled as one, and it is handed
over in that state deliberately rather than partly checked.

### PROVISIONAL sections, per FABLE RULING 4 (2026-07-29)

**The small-viewport sections of this ledger are PROVISIONAL and do not count as swept.**
Fable's ruling 4, transcribed at `reports/FABLE_COMMS.md` entry 022: the mobile ledger is
provisional pending the upscaled re-run. This session widened the scope on its own
evidence and records the reason here rather than in a commit message alone.

The discovery wave judged every frame at its NATIVE resolution. For the small viewports
that is thumbnail scale, and a lens cannot report what it cannot resolve:

| Session | Pixels | Approx image tokens | State |
|---|---|---|---|
| `popout-s` | 90,000 | ~120 | **PROVISIONAL**, re-run in progress |
| `mobile-s` | 181,760 | ~242 | **PROVISIONAL**, re-run in progress |
| `mobile-m` | 250,125 | ~334 | **PROVISIONAL**, re-run in progress |
| `mobile-l` | 345,100 | ~460 | **PROVISIONAL**, re-run in progress |
| `popout-l` | 360,000 | ~480 | left at native, stated rather than silent |
| `laptop` | 589,824 | ~786 | stands |
| `desktop` | 810,000 | ~1,080 | stands |
| `stretch` | 1,536,000 | ~1,365 capped | stands |

**`popout-s` is the worst affected frame set in the whole capture** at half the pixels of
`mobile-s` and one ninth of `desktop`, and it is not a mobile session, so ruling 4's plain
wording would have missed it. It is included.

**The re-run is not only additive.** Each re-run squad reconciles against its superseded
native shard and marks every prior finding CONFIRMED, REFINED or REFUTED, because a
thumbnail can make a correctly aligned element look wrong as easily as it can hide a real
defect. A native-resolution claim that does not survive at full resolution is a false
positive, and removing one is worth as much as adding a finding. Superseded shards are
retained at `shards/superseded/` rather than deleted.

### Coverage

46 shards, 43 of them written by this session's squads. Zero squads lost.

| Lens | Shards | Sessions covered | Findings |
|---|---|---|---|
| Composition (`STC`) | 16 | all eight en sessions, both halves | 236 |
| Typography (`STT`) | 16 | all eight en sessions, both halves | 163 |
| Motion residue (`STM`) | 8 | the 18 transition frames of every en session | 77 |
| Localisation (`STL`) | 4 | `de-desktop` and `ar-desktop`, both halves | 42 |
| Voice (`STV`) | 2 | desktop modals (trial session) plus desktop in-play surfaces | 22 |

**540 findings: 43 STREAM, 160 HIGH, 228 MEDIUM, 106 LOW.** Zero squads lost.

**Surfaces NOT swept, named explicitly per the closing checklist:** none of the
five lenses has a gap. Every one of the 519 frames is covered by at least one
lens, and the eight English sessions are covered by composition, typography and
motion residue in full. What is NOT covered is a lens this brief did not name:
the composition, typography and motion lenses were run over the English
sessions only, so `de-desktop` and `ar-desktop` are covered by the localisation
lens (which reads all five channels) and not by three dedicated single-lens
squads each. Audio, social-mode capture, accessibility and animation timing
remain never swept, per `docs/skills/FULL_AUDIT_METHOD.md` section 5.

### The five clusters, and why cross-squad agreement matters here

Verification did not run, but the squads were shared-nothing: none could see
another's shard, and each was given one lens and one half session. Where many of
them independently report the same defect, that is corroboration from genuinely
independent inputs in the sense convention (l.4) requires, and it is the
strongest signal this ledger carries. It is not a substitute for adversarial
verification, because agreement establishes that the thing was SEEN, not that
the diagnosis or the proposed fix is right.

**Cluster 1. The reel window goes transparent mid-spin and the scene shows
through the board. Eleven squads, two different lenses, seven viewports.**
`STC-DESKTOP-A-01`, `STC-LAPTOP-A-02`, `STC-MOBILEL-A-01`, `STC-MOBILES-A-01`,
`STC-STRETCH-A-01`, `STM-DESKTOP-01`, `STM-LAPTOP-01`, `STM-MOBILEL-01`,
`STM-MOBILES-01`, `STM-POPOUTL-01`, `STM-STRETCH-01`. This is the most heavily
corroborated finding in the set and it is on the surface a viewer watches for
the whole session.

**Cluster 2. The buy confirm dialog presents a price with no reachable CONFIRM
or CANCEL. Six squads, two lenses, four viewports.** `STC-LAPTOP-B-01`,
`STC-MOBILES-B-01`, `STC-POPOUTL-B-01`, `STC-POPOUTS-B-01`, `STT-LAPTOP-B-01`,
`STT-POPOUTS-B-01`. Several squads note the same mechanism: a sticky stats strip
consuming the scroll box and pushing the action row below the fold.

**Cluster 3. Scrolling panels slice text through the middle of its glyphs with
no scroll affordance, and nothing in the tree has a mask.** `STC-POPOUTS-A-02`,
`STC-POPOUTL-B-02`, `STC-MOBILEL-B-05`, `STT-POPOUTS-B-01` and siblings.
`STC-MOBILEL-B-05` records that `grep -rn "mask-image" frontend/src/` returns
nothing, so this is a class rather than an instance.

**Cluster 4. The max win collect leaves residue on the board.** `STM-DESKTOP-02`,
`STM-POPOUTL-02`, `STM-POPOUTS-02`: win lines and celebration glow still painted
over an emptied or partly faded reel window after COLLECT.

**Cluster 5. The intro rules `Continue` button is drawn over its own body copy.**
`STC-POPOUTS-A-01`, `STM-POPOUTS-01`, `STT-POPOUTS-A-01`. Three lenses, one
viewport, the first interactive screen of the game.

### The localisation shards, which no English session could produce

Four findings that only a localised session can see, all STREAM:

- `STL-DE-B-01`: the entire Responsible Play paragraph renders in **English under
  a German heading** on the German paytable.
- `STL-DE-A-01`: the German paytable states the max win twice in one view with
  two different thousands separators, so one line reads as `5` and the other as
  `5000`.
- `STL-DE-B-02`: `5,000×EINSATZ` on the max win hero, unit collided with
  multiplier, no separating space.
- `STL-AR-B-01`: the Arabic max win overlay prints multiplier and unit in LTR
  order, so the biggest moment in the game reads backwards.

`STL-AR-A-01` additionally reports the win-line detail strip rendering the
English word `ways`, a raw internal symbol code and an ASCII `x` under the reels
for the whole of every win, which independently reaches the same surface as
`STV-01` and `MID-02` from a different direction.

### Disposition

**None.** Every finding here is awaiting the verification pass. No fix was
applied by this session, deliberately: applying fixes would have moved the tree
epoch under an unverified list, which is the trap
`docs/skills/FULL_AUDIT_METHOD.md` section 2.2 exists to name, and the brief's
own JOB 4 requires re-proof from fresh frames that this session had no allowance
left to capture.

One item is fix-ready and verified first-hand by this session rather than by an
agent, and it is recorded here so the next session does not re-derive it:
**KNOWN_OPEN's TR-104 is half fixed and its remaining half is a one-line
change.** The tier label is already locale routed, proven by frame
`430_de-desktop_bigwin_settled.png` reading `GROSSER GEWINN` and
`482_ar-desktop_bigwin_settled.png` reading Arabic. Only the unit is still
hardcoded, at `frontend/src/lib/components/WinBanner.svelte:210`,
`sv('BET', $isSocial)`. The fix is `t($locale, 'bet', $isSocial ? 'social' :
'real')`: the `bet` key already exists in all sixteen locales in the correct
ALL-CAPS shape (`EINSATZ`, `رهان`, `ベット`, `投注`, and the rest) plus the social
override `PLAY`, and `MaxWinCelebration.svelte:159` already makes exactly that
call for exactly that word under TR-091. KNOWN_OPEN sizes TR-104 as "larger than
small, sized like TR-091"; on this evidence the remaining half is neither.
