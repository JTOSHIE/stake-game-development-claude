# R117: the hero got two upgrades and a new behaviour, and the Overdrive feature stopped being silent

Date: 2026-08-26. Branch: `claude/r117-intake-audio`. Review lane, unattended.

Brief saved verbatim: `reports/briefs/FS_FABLE_R117_INTAKE_AUDIO_Prompt.md`. Branch:
`claude/r117-intake-audio`, review lane.

## MORNING SUMMARY

**Shipped, all verified by behaviour rather than by flags:**

1. **Two hero reactions replaced with measurably stronger ones**, and both are SMALLER than what
   they replaced. Net **-1,048 KB**.
2. **A new hero behaviour: the glance.** The hero now looks toward the reels on a slow cadence
   during dead time. This is the first thing that answers "he does the same thing through every dead
   spin".
3. **The Overdrive feature is no longer silent.** Reel landings now sound inside the feature:
   **6 cues on a base spin, 17 across a feature round.**
4. **The win loudness ladder was not a ladder and now is.** It was +5.46 dB, then +1.09, then +0.96.
   It is now **+2.20, +2.12, +2.17**.

**Full hero behaviour now live, from one feature round:**
`idle -> energy -> idle -> glance -> idle -> win -> idle`

**dist 22.85 -> 23.40 MB** of 25. **Three factory strips intaken from 799 candidates.** No bulk
import. 30 placeholders untouched. 16 gates green.

**Still requires external stems and cannot be faked:** feature entry sting, retrigger, feature end,
and max win. Those are the remaining "bad sound design" gap.

---

## WORKSTREAM 0: baselines

| | On entry |
|---|---|
| dist | 22.85 MB, **2.15 MB headroom** |
| hero sheets | idle 2038 KB, energy-up 1692 KB, win 2281 KB |
| win presentation | 6 assets, 3095 KB |
| dirty placeholders | 30 |

---

## WORKSTREAM 1 and 2: selective intake and the hero upgrade

### The budget insight that made this session possible

The R116 queue looked unaffordable against 2.15 MB. It is not, because **replacements are nearly
free and only additions cost**. Measured, packed at the 70% common scale, after sanitation:

| Candidate | Frames | Packed | Replaces | Net |
|---|---:|---:|---|---:|
| **03-feature-trigger-reaction** | 7 | 1461 KB | hero_energy_up_6f | **-231 KB** |
| **02-epic-win-reaction** | 8 | 1464 KB | hero_win_reaction_8f | **-817 KB** |
| **04-glance-to-reels** | 6 | 1616 KB | nothing, new behaviour | +1616 KB |
| 09-power-surge-settle | 8 | 1474 KB | nothing | +1474 KB |
| 08-short-approval-nod | 6 | 1070 KB | nothing | +1070 KB |
| 01-max-win-reaction | 8 | 1479 KB | nothing | +1479 KB |

**Both replacements are stronger AND smaller.** Taking them first funded the addition.

### Mandatory sanitation, and it was not a no-op

R116 found 53 of phase-07's 108 files carrying bright RGB under transparency. **The three strips I
took were among them**: 6 of 8, 5 of 7 and 4 of 6 frames had RGB p99 = 255 under alpha 0. Every
frame was zeroed **before** any resample, and the shipped sheets were re-measured afterwards:
**residual RGB under alpha 0 is now 0 on all three.**

The packed byte count barely moved, because PNG compresses a uniform bright field about as well as a
uniform black one. **That is why the fix has to be verified by measurement rather than by watching
the file size.**

### Acceptance tests, per strip

| Shipped sheet | Frames | Identity IoU vs LIVE rest | Opaque ground drift | f1 == fN |
|---|---:|---|---:|---|
| hero_win_reaction_8f.png | 8 | 0.9593-0.9930 | **0 px** | yes |
| hero_feature_trigger_7f.png | 7 | 0.9542-0.9930 | **0 px** | yes |
| hero_glance_6f.png | 6 | 0.9790-0.9930 | **0 px** | yes |

Motion strength against the incumbents they replace: win **61.5% vs 57.2%**, feature-trigger
**62.6% vs 56.5%**.

### Refused

- **09-power-surge-settle, 08-short-approval-nod:** good, and additions the budget could not carry
  alongside the glance. The glance was chosen over both because dead time dominates a review
  session, and dead time was the gap.
- **01-max-win-reaction:** the strongest strip in the factory at 63.5%, refused for the third
  session running for the same structural reason. `MaxWinCelebration` is a full-screen modal that
  covers the hero. **A stronger reaction behind an opaque panel is not a stronger reaction.**

### 2.5 Banner occlusion

Not re-litigated: R115 measured that **60.8% of a win reaction's motion sits in the visible chest
band** and only 17.1% falls where the big-tier banner covers. The replacement strip is the same
construction and the same family, so the conclusion carries. **No hero offset was attempted**,
because it would move the feet, and planted feet are the property verified at 0 px drift above.

---

## WORKSTREAM 3 and 4: feature and celebration

**Nothing new shipped, deliberately.** R115 already built the Overdrive perimeter, and the factory's
feature and celebration art is the same shape of problem R115 and R116 both refused: full-stage
frames whose pillars land on the HUD. **The synchronisation the brief asks for already exists**, and
this session's QA re-proved it: the hero's energy-up fires on the same `overdriveVisual` rising edge
that lights the perimeter.

## WORKSTREAM 5: anticipation and symbol life

**Refused on architecture cost, as R116 predicted.** The factory carries 85 anticipation files and
133 symbol-state files, and both need a consumer system that does not exist. The brief forbids a
half-wired system with no review payoff, and building either properly is a session of its own.

---

## WORKSTREAM 6: audio, the highest non-art priority

### 6.3 What was fixed, with evidence

**1. The win loudness ladder was not a ladder.** `BASE` declared 0.65 / 0.75 / 0.85 / 0.95, but
`playWin()` hardcoded `playClone(sounds.winSmall, 0.4)` and bypassed the table. What a player
actually heard:

| Step | Before | After |
|---|---:|---:|
| small to medium | **+5.46 dB** | **+2.20 dB** |
| medium to big | **+1.09 dB** | **+2.12 dB** |
| big to epic | **+0.96 dB** | **+2.17 dB** |

A +1 dB step is below what most listeners reliably notice, so **three tiers sounded like two**. The
table is now an even x1.284 ladder and the bypass is gone, so `BASE` is once again the single place
win loudness is decided.

**2. The audio thresholds were a fifth independent declaration.** `playWin()` compared against
literal 100 / 30 / 10. They happened to match the celebration table, but nothing kept them matched.
They are now **imported** from `winCountUp.ts`, so audio tracks the visual tiers by construction.

### 6.4 What was wired, and why it is not faking

**`FreeSpinsPresentation` imported no audio at all**, which is why the whole Overdrive feature was
silent apart from the music bed swapping underneath it. Two hooks were added, both playing the
**same cue the base game already plays for the same event**:

- **Ordinary free spins** reveal the whole board at once, so each gets **one** landing cue.
- **Retriggering spins** are the only ones that reveal reel by reel, so each reel commits audibly,
  exactly as in the base game.

The two paths are mutually exclusive by construction: without the guard a retrigger would fire six
cues for five reels.

**This is a reel landing sounding like a reel landing. No new stem was invented and no unrelated
sound was borrowed to paper over a gap.**

### The verification, and the two things it caught

Cue firings were counted by instrumenting `HTMLAudioElement.prototype.play` before app code ran,
which counts calls at a boundary rather than inferring from state.

**It first said the wiring did not work.** `reel_stop` sat at 5 for 108 seconds with the feature
overlay on screen. Two diagnoses followed, both worth recording:

1. The `.fs-overlay` my probe found was the **hidden warm-mount instance** that lives for the whole
   session and carries the same testids. It was never a running feature.
2. The real feature was **stalled on a "TAP TO CONTINUE" button** that my harness never pressed. The
   free-spin counter sat frozen at 12 for 54 seconds, which is what proved it.

**Every earlier session's "feature" probe had the same blind spot** and only ever observed the entry
moment. With the tap added, the count moves **5 -> 10 -> 13 -> 17**: twelve free spins, twelve
landings.

### 6.6 Review impact, honestly

**What moved:** the feature has audio for the first time, and the win tiers are now audibly
distinct instead of three sounds separated by 1 dB.

**What did not, and cannot without stems:** there is still **no feature-entry sting, no retrigger
cue, no feature-end cue and no max-win cue**. Those moments have no file to play. The slot list in
`themeStore` has twelve entries and none of them is any of those four.

### Acquisition list for the next daytime session

Four stems, in priority order, at assets/themes/future-spinner/sounds/, following the existing
snake_case.mp3 convention, each needing a matching key in `themeStore`'s sound map and a `BASE`
volume entry:

1. feature_enter.mp3 — the entry sting. The single most conspicuous silence in the game.
2. win_max.mp3 — the max-win overlay is the most photographed screen and it is silent.
3. feature_end.mp3 — the return to base has no punctuation.
4. retrigger.mp3 — currently indistinguishable from an ordinary spin.

---

## WORKSTREAM 8: QA matrix

Every row driven by a real round from the shipped sample book, hero state sampled from the DOM and
cue firings counted at the `play()` boundary.

| State | Hero | Reel-stop cues | Win cue | Errors | 404s |
|---|---|---:|---|---:|---:|
| losing spin | idle | 6 | none | 0 | 0 |
| small win (2x) | **idle, no reaction** | 6 | `win_small` | 0 | 0 |
| big win (13.66x) | `idle -> win -> idle` | 6 | `win_medium` | 0 | 0 |
| **feature round** | **`idle -> energy -> idle -> glance -> idle -> win -> idle`** | **17** | `win_epic` | 0 | 0 |
| reduced motion | **idle, reactions skipped** | 6 | `win_medium` | 0 | 0 |

The glance was separately verified over 60 seconds of pure idle: it fires on its 24 s cadence and
returns to idle cleanly each time, twice, with zero errors.

**Reduced motion suppresses the hero's reactions and leaves audio alone**, which is correct: that
setting is about motion, not sound.

**Gates:** 16 green, including `locked_paths`, `asset_guard` self-test, `build_diet_verify`,
`locale_completeness`, `max_win_hold`, `win_countup_steady`, `money_fit`, `layout_fit`.

---

## WORKSTREAM 9: review-score assessment

**"Low quality assets" — strong, and no longer the problem.** Every win tier has purpose-built art,
the hero has four distinct animation states, and the Overdrive state is dressed.

**"Poor animations" — this is now genuinely good.** In the first ten seconds a reviewer sees a
crossed-arms pilot breathing, and within half a minute they see him glance at the reels
unprompted. On a meaningful win he straightens and his visor powers up, 7% more strongly than
yesterday. On feature entry he surges while the stage perimeter lights with him. **Four states,
all triggered by real game events, all returning cleanly to rest.**

**"Bad sound design" — moved, but still last.** The feature has audio and the tiers are audibly
separated. But four significant moments are still silent and **no amount of code will fix that**:
they need files that do not exist.

**Ranked by remaining score impact:**
1. **Four audio stems.** Nothing else in the programme is blocked purely on an external deliverable.
2. **Anticipation art with a consumer** — the reels have no tension build.
3. **The max-win modal restaging**, which would unlock the strongest hero strip in the factory.

---

## WORKSTREAM 10: handoff

**Files changed:** `HeroIdle.svelte` (glance state, new sheets), `soundService.ts` (ladder,
imported thresholds), `FreeSpinsPresentation.svelte` (two cue hooks), three hero sheets in,
hero_energy_up_6f.png out, provenance recorded.

**Next daytime actions, in order:**
1. Commission the four stems above.
2. Decide WebP. dist is at 93.6% and every future intake is gated on it.
3. Decide whether the max-win modal can leave the hero visible.

**Materially closer to publication on presentation grounds? On animation and assets, yes and
decisively. Overall, still gated on four sound files.**
