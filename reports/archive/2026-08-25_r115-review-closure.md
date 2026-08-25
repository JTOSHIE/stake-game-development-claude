# R115: every tier has its own art, Overdrive has a perimeter, and two audio bugs are fixed

Date: 2026-08-25. Branch: `claude/r115-review-closure`. Review lane, unattended.

Brief saved verbatim: `reports/briefs/FS_FABLE_R115_REVIEW_CLOSURE_Prompt.md`. Branch:
`claude/r115-review-closure`, review lane.

## MORNING SUMMARY, read this and nothing else if you are short of time

**Shipped, all four visible on screen:**

1. **Every win tier now has its own art.** R113 had mega borrowing epic's bloom. Mega has its own.
2. **The max-win headline is more legible than at any point since R113 touched it**, and it now
   carries more art, not less: contrast **8.41 to 11.05**.
3. **Overdrive has a stage perimeter.** The edge energises while the feature runs and cools when it
   ends. One raster does both states.
4. **Two real audio bugs fixed**, both stuck-state, both confirmed by reading the call graph.

**Recovered 1.09 MB** by deleting the R111 rig path, which could never render.

**Refused, with measurements:** the kit's four full-stage tier frames, its feature entry splash,
and both hero reinforcement strips.

**Hard-blocked:** workstreams 5 and 6. The overnight marathon kit named in the brief is **not on
disk**, and no other kit carries anticipation, symbol-life or ambient art.

**The one thing to decide today:** WebP. It is still the largest single lever on this project and
it is still an owner call, not mine.

---

## WORKSTREAM 1: inventory and budget

The brief names three kits. **Two are present; `chatgpt-overnight-review-closure-marathon` does not
exist on disk.** That is what hard-blocks workstreams 5 and 6.

`chatgpt-textfree-celebration-hero-reinforce`, 53 files, **25.04 MB of runtime candidates against
1.92 MB of headroom on entry**. Budget, not taste, decided most of this session.

| Class | Assets |
|---|---|
| **READY, shipped** | mega support bloom, max headline-safe bloom, Overdrive active accent |
| **READY, refused on fit** | 4 tier primaries, 2 tier alternates, feature entry splash, surge pair |
| **READY, refused as duplicate** | Overdrive settle accent (see below) |
| **WEAK-VS-INCUMBENT** | both hero reinforcement strips |
| **READY, not reached** | 4 support accents, epic/mega side accents, alternates |

**Budget was recovered before it was spent**, in that order deliberately: the rig deletion freed
1.09 MB first, and the intake fitted inside what that bought.

**WebP was not adopted.** The brief permits it only if provably accepted infrastructure or isolated
behind a documented reversible decision. R114 measured the case (hero sheet 678 KB as WebP q90
against 3,492 KB as PNG) and found `previewServer.mjs:61` already serves it, but **there is still
not one `.webp` file in this project**, so it would be a first for a submission-bound bundle. Left
as the owner's decision, unchanged and unweakened.

---

## WORKSTREAM 2: text-free celebration surrounds

### The kit's claims verified, not trusted

All 22 assets declare `baked_text: false`, and the centre-band check confirms the value area is
genuinely clear: **max alpha 0** across the middle third for big, mega and epic, and 41 for max.
Locale-safe, amount-safe.

### The four full-stage tier frames are REFUSED

They are beautiful, genuinely text-free, and they do not fit this layout. Composited over a real
celebration at stage size, the epic frame's pillars land on **the tier label, the multiplier
readout, the BET window, the SPIN button and the hero**. Evidence: `r115_frame_test.png`.

**They are perimeter art for a layout with a clear border, and this stage has HUD in its border.**
That is the same conclusion R113 reached about the baked-text frames, arrived at from a different
direction.

### What shipped instead, and why it is the better answer anyway

| Change | Effect |
|---|---|
| `ui/win/bloom_mega.png`, new | **Mega finally has its own art.** A mechanical iris against the spiky bursts either side of it, so the three banner tiers read as three THINGS, not one thing growing. |
| `ui/win/max_bloom.png`, replaced | The purpose-built **headline-safe** bloom: a compact swirl instead of a full-frame burst. |

### 2.3 Legibility, re-measured rather than assumed

| Tier | R113 baseline | R113 shipped | **R115 final** |
|---|---:|---:|---:|
| big | 10.59 | 10.07 | 9.96 |
| **mega** | 6.20 | 6.40 | **8.96** |
| epic | 12.10 | 12.11 | 12.10 |
| **max headline** | 14.16 | 8.41 | **11.05** |

**R113 had to compromise its max bloom's position and opacity to claw the headline back from
4.73:1. R115 does not, because the asset is built for the job.** The bloom moved back up (58% to
54%, opacity 0.42 to 0.52) and the headline still gained 2.6 points of contrast.

---

## WORKSTREAM 3: feature / Overdrive presentation

### What shipped: a stage perimeter that energises and cools

`ui/win/overdrive_perimeter.png` at `App.svelte`, z41: above the global grade at z40, below the HUD
at z50, so **the controls always render over it**. It appears on Overdrive entry, holds for the
feature, and cools out over 1.6 s when the feature ends.

**One raster serves both states, and that was a measurement not a shortcut.** The kit also ships a
separate settle accent. Measured against the active one its **alpha silhouette IoU is 0.9932** and
it is the same frame at **64% brightness and 21% saturation**. A CSS filter reproduces it exactly,
saves **782 KB**, and guarantees the two states register perfectly because they are the same pixels.

**The entry splash is refused** for the same reason as the tier frames: a full-stage spiky arch
whose pillars land on the HUD.

### 3.3 Hero synergy, verified live

The probe records the sequence `-/idle` then **`ACTIVE/energy`** then `ACTIVE/idle`: the perimeter
lights at the same moment the hero plays its energy-up. They reinforce rather than fight, because
both key off the same `overdriveVisual` rising edge.

**Opacity was dialled 0.9 to 0.75 deliberately.** This is a STATE that persists for a dozen free
spins, not a beat, and the brief asks for restraint.

---

## WORKSTREAM 4: hero reaction reinforcement, REFUSED

The kit's two alternates are genuinely stronger in raw motion. They are refused anyway, because the
brief's bar is a **clear improvement across four criteria** and they clear one:

| Criterion | Live (R114) | Alt | Verdict |
|---|---:|---:|---|
| motion strength (peak vs rest) | 57.1% | **62.9%** | alt better |
| identity lock (IoU vs live rest) | 0.9932 | 0.9930 | same |
| rest-return (f1 == fN) | yes | yes | same |
| **readability under the banner** | 17.1% hidden / 60.8% chest | 17.2% / 59.6% | **alt slightly worse** |

**One better, one worse, two identical is not a clear improvement**, and replacing would spend
bytes to move sideways.

### 4.2 The banner occlusion problem, answered by measurement rather than by a fix

The brief offers four options and says to implement only a low-risk improvement. The measurement
says the problem is smaller than it reads:

**60.8% of the win reaction's motion already lives in the chest band, which is visible below the
banner.** Only 17.1% falls in the band the big-tier banner covers. The reaction already reads
"through chest lower mass", which is option three on the brief's own list, without new art.

A hero offset during the reaction was considered and rejected: it would move the feet, and planted
feet are the property R114 verified at 0 px of opaque-core drift. **No change made, and the reason
is a number rather than a shrug.**

### 4.3 Dead-spin / glance

No glance strip in this kit. R114 already refused the previous one at 31.9% peak against the win
reaction's 57.1%.

---

## WORKSTREAMS 5 and 6: HARD-BLOCKED, no art

`.scratch/art-review/chatgpt-overnight-review-closure-marathon/` **is not on disk.** Every other kit
was checked: none carries anticipation accents, near-miss flashes, per-symbol state art, reel-stop
tension, transition heat-up art, or ambient lamp/dust assets.

**Nothing was staged, faked or half-wired.** The brief's own instruction was to prefer one or two
high-visibility improvements over a broad half-wired system; with no art, the correct number is
zero.

**Note for the next kit:** the feature-flow trace found that an `inset: 0` layer placed inside
`FreeSpinsPresentation` resolves against `.grid-scale`, a 616x412 box scaled 0.847, so it covers the
reels only and **not** the stage. True full-screen work has exactly two insertion points, inside
`.canvas-inner` and inside `.bg-layer`. That is the trap to avoid next time.

---

## WORKSTREAM 7: dead weight and consistency

### 7.1 The R111 rig is gone: 1,091,408 bytes recovered

Verified first-hand before deleting: **exactly one mount exists in the entire repository**,
`App.svelte:2159` `<SceneGroup haze={hazeLevel} />`, and it does not pass `heroMode`. No test,
preview or harness mounts SceneGroup at all. The `'rig'` branch could only ever have been reached by
editing source, while its eleven rasters shipped to every player.

Removed: RobotRig.svelte, eleven part rasters, and the now-dead `.char-rigged` CSS.
**`'static'` was kept**: it is 791 KB and it is the one-line escape hatch for the game's hero.

### 7.2 A player-visible tier contradiction, fixed

`WinDisplay.svelte` put its mega boundary at **50** while `WinBanner` has always celebrated MEGA at
**30**. So **a win between 30x and 50x showed "MEGA WIN" on the banner and "BIG WIN" in the HUD
readout at the same time, on the same screen.**

Git history shows the 50 came from the initial scaffold and was never a decision; the deliberate
tier table arrived later. Both boundaries now import from `winCountUp.ts`, so this stops being an
independent declaration that can drift again.

**Left alone deliberately:** `WinDisplay`'s `gold` and `green` bands are its own colour treatment
for ordinary wins, contradict nothing, and are not celebration tiers. Telemetry's `max` at 5000 is
deliberate and documented.

**Recorded, not fixed:** the sound service plays `win_big.mp3` at the MEGA tier and
`win_medium.mp3` at the BIG tier. **The numbers agree exactly (10/30/100); only the file names are
skewed one slot.** Nothing in the repo records whether that was intended, so it is not something to
guess at.

---

## WORKSTREAM 8: audio

### Two real bugs, found by call-graph reading and fixed

**1. A muted player never got music again, for the whole session.** `playBGM()` has exactly one
caller, `App.svelte:1402`, and it returns early when muted **without setting `bgmStarted`**. Nothing
called it a second time, and `setMuted(false)` only restored volumes. A player whose mute preference
was restored from a previous session and who then unmuted heard silence until they reloaded.

**2. Muting during the anticipation build left a riser looping and the music bed ducked to 27%
permanently.** `stopAnticipation()` has exactly one caller, `playReelStop()`, and that function
returns early while muted. A muted `<audio>` still plays, it is only silent, so the riser kept
running and `bgmDuck` stayed pinned at `BGM_DUCK_ANTICIPATION`. On unmute the player heard a riser
with no reels moving, over a permanently quiet bed.

Both fixed in `setMuted()`, which is the one place that always runs when sound changes state.
`playBGM()` is idempotent through `bgmStarted`, so the retry is a no-op when music is already
running. **`soundService.ts` is not a locked path**, confirmed against `locked_paths_gate`, which
passes.

### The state of the sound design, honestly

- **Architecture:** twelve hand-rolled `HTMLAudioElement` objects built once at module load. No Web
  Audio, no sprite sheet, no pooling. Voicing is `cloneNode` per one-shot.
- **The entire Overdrive feature is silent** apart from the music-bed crossfade.
  `FreeSpinsPresentation` renders its own board and its own reel-by-reel reveal and imports zero
  audio. **This is the single largest audio gap in the game.**
- **Nine moments have no cue at all:** spin-button press, slam-stop, feature trigger, feature entry,
  per-free-spin reel stops, retrigger, feature end, max-win, and the hero reactions.
- **The win-tier loudness ladder is uneven:** small to medium is a 5.9 dB jump while medium to big
  and big to epic are each under 2 dB, because one call site hardcodes a volume that bypasses the
  base table.

### Audio implementation checklist for the next session

1. **Feature audio, highest value.** Entry sting, per-free-spin reel stop, retrigger, feature end.
   `FreeSpinsPresentation` currently imports no audio at all, so this is new wiring, not repair.
2. **Max win has no cue.** The most photographed screen in the game is silent.
3. **Fix the loudness ladder** by removing the hardcoded volume at the one call site that bypasses
   `BASE`, then re-balance the four win tiers on measured dB rather than by ear.
4. **Decide the `win_big` / `win_medium` name skew**: either rename the files to match the tiers
   they play at, or record why the skew is intended.
5. **Hero reaction accents.** R114 gave the hero two reactions with exact trigger points; both are
   silent.
6. Only then consider Web Audio, and only if pooling or true crossfades are needed.

---

## WORKSTREAM 9: QA

| Check | Result |
|---|---|
| big / mega / epic / max celebrations | all fire, correct amounts, **zero console errors** |
| ordinary win (0.2x) and losing spin | **nothing raised** |
| hero: small win / big win / feature / reduced motion | `idle` / `idle→win→idle` / `idle→energy→idle` / `idle` |
| Overdrive perimeter | `-` then `ACTIVE` alongside the hero energy-up |
| reduced motion | every reaction skipped, every burst present with **0 animations** |
| contrast, all four tiers | **all pass WCAG AA**, two improved |
| dist | **22.85 MB against 25 MB** (was 23.08 on entry, after adding three assets) |
| locale | `locale_completeness` passes; **nothing shipped carries baked text, a baked amount or a letter-x** |
| Gates | 16 green, including `max_win_hold`, `win_countup_steady`, `money_fit`, `layout_fit` |

### Score-oriented assessment

**"Low quality assets": materially improved.** Every win tier now has purpose-built art rather than
a borrowed asset, and the Overdrive state is dressed for the first time.

**"Poor animations": improved, and this is now the strongest of the three.** Across R112 to R115 the
hero went from a static sprite to breathing, then reacting, and the feature now has a visual state
change of its own.

**"Bad sound design": barely moved, and it is now clearly the weakest.** Two genuine bugs are fixed
and the map is complete, but the feature is still silent and nine moments still have no cue. **This
is the gap that most needs the next session.**

---

## WORKSTREAM 10: programme state

### Shipped

| File | Nature |
|---|---|
| `ui/win/bloom_mega.png` | new, mega gets its own art |
| `ui/win/max_bloom.png` | replaced with the headline-safe bloom |
| `ui/win/overdrive_perimeter.png` | new, Overdrive stage perimeter |
| `WinBanner.svelte`, `MaxWinCelebration.svelte`, `App.svelte` | wiring |
| `WinDisplay.svelte` | tier boundary aligned to the shared table |
| `soundService.ts` | two stuck-state bugs fixed |
| `SceneGroup.svelte`, RobotRig.svelte + 11 rasters | rig path removed |

### Residuals blocked on ART

- **Anticipation, symbol life, ambient, transitions.** No art exists. The marathon kit is not on
  disk.
- **A feature-entry splash that fits a HUD-bearing border**, rather than a full-stage arch.
- **Tier frames redrawn as thin perimeters**, if the framed look is still wanted.

### Residuals blocked on OWNER DECISIONS

1. **WebP.** Still the biggest lever: ~5x on the hero sheets, and dist is at 91% of budget.
2. **The `win_big` / `win_medium` name skew.** Numbers agree; names do not. Nobody recorded why.
3. **`scene_character.png`, 791 KB**, ships and cannot render: the `'static'` branch is unreachable
   by the same mechanism the rig was. Kept as a deliberate escape hatch. Delete it and the hero has
   no fallback.

### Next daytime session

**Audio, and specifically the feature.** It is the weakest of the three review tags, the gap is
fully mapped above, and `FreeSpinsPresentation` needs new wiring rather than repair.

### Is the game materially closer to a 6/9 presentation standard?

**On presentation and animation, yes and measurably.** Four celebration tiers with distinct art and
improved legibility, a dressed feature state, and a hero that idles, reacts to wins and powers up on
the feature.

**Overall, not yet, and the reason is one-third of the score.** Sound remains close to where it
started. **Two of the three original tags have moved a long way; the third has not, and no amount of
further art will move it.**
