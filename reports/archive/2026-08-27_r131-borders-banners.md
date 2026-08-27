# R131 - THE FEATURE BORDER IS GONE, THE BANNER CARRIES ITS TIER, AND THE AMOUNT STOPPED DANCING

**2026-08-27.** Branch `claude/r131-borders-banners`, off `main` at `bb966e19`. PR #171, review
lane. Unattended. Three player-visible polish jobs, each measured before and after. No kit
packaging, no new hero flipbook, no idle sway or dissolve or glance revival, no audio, no asset
guard weakened, no WIP raster touched, and no raster altered at all.

## 1. Workstream 1: which border layers were removed

**One, and an exhaustive inventory says one is the whole list.** `.overdrive-perimeter` in
`App.svelte`: `ui/win/overdrive_perimeter.png` (1344x756, 461,912 B) drawn over the entire stage at
z41 under `mix-blend-mode: screen`, a lit tech border carrying eight tyre rosettes, held at opacity
0.50 with a 0.75 entry peak, mounted whenever Overdrive was active or settling.

**The owner's complaint is literally true, and more precise than "covers the hero."** Measured
offline from the raster at its rendered size:

| | measured |
|---|---:|
| ink covering the stage | 21.5% |
| hero's own opaque SILHOUETTE lit | **11.08%** |
| of which top third / middle third | **0.00% / 0.00%** |
| of which bottom third | **37.27%** |
| peak added luminance over the hero at the held 0.50 | 0.476 |

So it lit his **feet and lower legs and nothing above**, and it crossed the car across its whole
width. That is a real overlap and a narrower one than the phrase suggests, and both halves are worth
saying.

**Two independent methods converged.** A subagent decoded the raster with a pure-Node PNG decoder,
no image library and therefore no resampling contamination, and predicted a peak added luminance
over the hero of **109.6 / 255**. Driving the real feature with the perimeter present and absent and
differencing the composite over the hero's silhouette measured **max 109**, mean 2.833. The offline
prediction and the live measurement agree to within a unit.

**What still signals the feature**, all verified in a real bonus buy and independently quantified:

1. `.game-frame.overdrive-active` swings the reel frame from cyan to bright route green and pulses
   it. Removing that one class moves **130,998 px, 14.21% of the stage**, with **0 px of hero
   overlap**. It is the largest colour event on screen and it is the frame the player is already
   looking at.
2. The background crossfades to `bg_overdrive.jpg`, a whole-scene relight.
3. Eight FlameJets burn. **0 px of hero overlap**: their container spans the stage but carries no ink
   there, which is the rect-versus-ink distinction that also decides the perimeter question.
4. The instrument column shows OVERDRIVE FREE SPINS with a live count and the multiplier.

**The border was a second frame competing with the first.** Comparing the base and feature captures
side by side is the whole argument: base has no stage-edge border at all, and the feature added one
plus eight rosettes on top of an already-unmistakable green frame.

**Removed with it, because nothing else read them:** `overdriveSettling`, `overdriveSettleTimer` and
their reactive block; the `.overdrive-perimeter` rule, its `.settling` variant, both keyframes and
their reduced-motion block. The raster is **pruned from the bundle and kept on disk**, so restoring
the border is a revert rather than a re-render, and the matching `PRUNED_PREFIXES` entry makes any
request for it a hard CI failure.

**R118 had already dialled this element from 0.75 to 0.50 on measurement and the owner still called
the stage too busy.** When dialling a thing down twice does not satisfy, the question is whether it
should be there at all. That is R130's idle lesson arriving on a different element.

## 2. Workstream 2: what changed on the banners

### 2a. The amount was physically dancing, and a green gate could not see it

This is the find of the session and it was a subagent's, not mine.

`.c1-amount` declared the DISPLAY font token, which is **Orbitron**. The comment three lines below
it retires TR-089's per-digit fixed-width boxes on the stated premise that *"the owner's R071 ruling
moves every money and counting surface to Exo 2, which HAS a real tnum."* **That move never happened
for this element.** So the compensation was deleted and the condition it compensated for was left in
place.

Digit advance spread, measured on the shipped faces at 64px weight 900:

| face | spread |
|---|---:|
| Orbitron with `tabular-nums` | **28.36 px** - byte-identical to `normal`, so the feature is INERT |
| Orbitron normal | 28.36 px |
| **Exo 2 with `tabular-nums`** | **0.000 px** - every digit exactly 41.688 px |
| Exo 2 normal | 12.36 px |

Post-entry glyph width swing at a FIXED character count, so none of it is the number legitimately
getting longer:

| | before | after |
|---|---:|---:|
| big / mega, cold mount | 45.87 px | **0.00 px** |
| big / mega, warm | 48.06 px | **0.00 px** |
| epic | 126.06 px | **9.91 px** |

Epic's residual is the deliberate `c1-pulse` scale that runs forever on that tier, not text
movement; it was there before too, buried under 126 px of glyph dance.

**One hypothesis of mine was wrong on the way.** The first ~600 ms of every banner also varies, and I
attributed it to font loading. A warm-font control refuted that: a second banner on the same page,
fonts fully loaded, showed the same 39.77 px early swing. It is the `c1-enter` entry scale, and my
Range-based measurement reads the visually transformed box. Isolating post-entry samples is what
made the before-and-after comparison honest.

**And the gate could not catch it.** `win_countup_steady_gate` builds its OWN probe element rather
than reading this one, and that probe asks for the numeric token while its deliberately-failing SEED
asks for the display token. So it proved Exo 2 is steady and Orbitron is not, and passed, while the
element it speaks for rendered in Orbitron. Its own header claims it measures *"the face the money
surfaces actually render in"*; for this surface that was false. **A gate that reconstructs the thing
it guards can be green over a live defect**, and this project has now recorded that shape more than
once.

### 2b. The tier label now carries the tier colour

It used the banner's fixed house accent, cyan, while `.band-edge`, the `.fs-plate` glow and the
`.fs-face` inner tint all use `--sig`, set per tier to cyan / pink / gold. The one element whose job
is to NAME the tier was the one not coloured by it: "MEGA WIN" rendered cyan inside magenta rules,
"EPIC WIN" cyan inside gold ones. `--sig` is set on `.fs-plate` and the label is inside it, so this
is a token swap rather than new plumbing.

### 2c. The multiplier now escalates

It was a flat 16px at every tier while the band grew 111 -> 140 -> 172 px, the label 22 -> 28 -> 36
and the amount 50 -> 64 -> 80. At epic that put a 16px "250x BET" beside an 80px amount. Now
16 -> 20 -> 26, tracking the label's own 1.00 / 1.27 / 1.64 ladder. It stays GOLD rather than taking
`--sig`, because gold is this game's constant value colour; at epic the two coincide anyway.

### 2d. Contrast: measured, and deliberately not "fixed"

Sampled on real composited pixels, all three tiers, at entry and settled. **The amount is 18.3:1
everywhere and is UNCHANGED** - it was never the weak point, so it was left alone. The mega label
moves 14.02 -> **5.48**, because magenta is far darker than cyan. At 28px weight 900 that is large
text, so it clears both the 3:1 large-text bar and the 4.5:1 normal-text one. It is now the weakest
text in the banner and that is stated rather than buried.

### 2e. A hypothesis of mine that measurement killed

I read mega's burst as a tier-escalation inversion, since it is drawn 420 px at opacity 0.78 against
big's 430 px at 0.9 - both smaller and fainter. Measured as DELIVERED LIGHT at drawn size,
`bloom_mega.png` carries about twice the ink and totals **22,729 against big's 12,298**, so
escalation is monotonic in what the player actually sees and the smaller box compensates for denser
art. Deliberate tuning, not a defect. **Judge art at the size it is drawn** - this project's own
rule, and I nearly broke working art by reading declared numbers instead of measuring.

## 3. Workstream 3: whether any hero micro-life changed

**Yes: one chest-lamp pulse was added, and it is the quietest accent on the figure.**

The brief permits tiny idle life only if it stays quieter than the old tick. The tick was measured
through the REAL renderer, not an offline composite: worst step **48.872** per-sample RGB over the
hero's 28,804-pixel silhouette, reproducible to 0.006% across two independent runs, with 18.75% of
the silhouette moving in a single frame held 733 ms.

Isolated contributions over that same mask, 110 ms sampling across 9 s:

| accent | mean | max |
|---|---:|---:|
| **chest lamp (new)** | **0.0081** | **0.0166** |
| antenna blink | 0.0350 | 0.1346 |
| visor glint | 0.0773 | 1.1047 |
| hero alone, all hidden | **0.0000** | **0.0000** |

The last row is the instrument proof and the parts add up: 0.0081 + 0.0350 + 0.0773 = 0.1204 against
a combined 0.1118 to 0.1269 across two runs.

The new lamp is the **quietest of the three** - 4.3x below the antenna, 9.5x below the glint, and
**6,000x below the tick on mean**. It also cannot tick structurally, which matters more than the
magnitude: a continuous eased ramp with no discrete step, no transform so silhouette change is
exactly zero, and a 7.4 s period deliberately non-harmonic with the existing 2.8 s and 6.0 s so the
three never land together.

**It is a SIBLING of `<HeroIdle>`, not a child of `.hero-body`.** `.hero-body` carries
`filter: drop-shadow()` computed from its whole subtree, so a glow child would have made the hero's
SHADOW pulse with it - R129's defect arriving by a new route, and the reason HeroIdle carries a
comment forbidding exactly that. Out there it also inherits the reduced-motion reset for free.

**A subagent corrected my geometry.** I measured four bright bars; there are **three**, and the
fourth was the housing bezel's right shoulder. Core hull x85..103 / y179..185 in the 206x407 box.
Every pixel within 8 px of that hull is alpha 255, and the shipped glow box sits at x77..112 /
y171..194 - 8 to 9 px of fully opaque sprite on every side, so it cannot reach the silhouette edge.
Verified visually at 6x magnification as well as numerically.

## 4. Workstream 4: QA

| check | result |
|---|---|
| base idle planted | **PLANTED** - 361 rAF samples over 6 s: transform `none`, animation `none`, background-position-x `0px`, one distinct value each |
| Overdrive entry | perimeter **absent**, `.overdrive-active` set, `frame-pulse-overdrive` running, free-spin copy present |
| hero and car during the feature | fully visible, no ring, confirmed in the capture |
| win banner big / mega / epic | cyan 16px / magenta 20px / gold 26px, amount in Exo 2 at all three |
| 1280x720 and 1024x640 | banner present at both, **0 px** of SPIN-button overlap at 1024, amount fits with no overflow |
| reduced motion | every accent `animation: none`; antenna 0.8, glint 0, chest lamp 0.16, hero body and sheet `none` |
| frame pacing | 58.4 fps through an epic win, 5 frames over 32 ms, **0 over 50 ms** |
| console | **zero errors** in every run, landscape and narrow |

`svelte-check` 0 errors. `build_diet_verify` ALL CHECKS PASS. `doc_currency_gate` PASS with 0 new.
`machine_tell_gate` PASS on source and dist.

## 5. Budget

| | R130 close | R131 |
|---|---:|---:|
| dist | 24,218,665 B (23.10 MB) | **23,756,186 B (22.66 MB)** |
| headroom against the 25 MB cap | 1,995,735 B | **2,458,214 B** |

Reclaimed 462,479 B, almost all of it the pruned perimeter raster. **Zero asset bytes added and no
raster altered.** The owner's 30 WIP rasters are byte-identical to a session-start fingerprint
(5,126,464 B, rollup `76ad0712...`) and were never staged.

## 6. Two gates caught my own edits before CI did

Running the whole static-gates job locally first is R130's lesson and it paid twice. Both failures
were in PROSE rather than behaviour.

- **`doc_currency_gate`, DEAD_SYMBOL.** `reports/OUTSTANDING_LEDGER_2026-08-25.md:810` cited a
  symbol this session deleted with the perimeter. The gate's own message is the right instruction,
  *"fix the document, or fix the thing it describes"*, and it says explicitly that adding a baseline
  entry is not a fix. The ledger section is now marked CLOSED BY R131, with its tuning history kept
  below that marker as a dated record because it is the evidence for why deletion was the answer.
- **`machine_tell_gate`, third-font-stack.** My new comment wrote a font declaration followed by a
  token name in prose, and the gate reads that as a literal font stack in ANY text, comments
  included. This is the same class of trip R130 hit by quoting a capitalised word inside the
  400-character window after a rendered constant: **a text gate cannot tell prose from code, and a
  comment explaining a font rule is the most likely thing to look like one.**

## 7. A near-miss in my own tooling, recorded because the fix is a habit

To capture a true "before" I stashed only my own source files and chained
`stash && capture && stash pop`. The capture failed because the dev server had died, `&&`
short-circuited, and **the restore never ran** - my changes sat in a stash while the tree looked
reverted. Caught immediately by reading the output rather than assuming.

**A restore step must never be gated behind the operation it protects against.** The second attempt
used `;` so the pop ran regardless of the capture's exit code, and it did. This is the mirror image
of convention (u.1), which exists because a gate chained with `;` cannot block a push: the operator
that is right for a GATE is wrong for a RESTORE.

## 8. Remaining polish gaps

- **Big and mega go still for about 1.9 s** after the count-up settles, where epic keeps its pulse.
- **The epic chromatic flash is inert.** It is `position: fixed; inset: 0` inside `.big-win-banner`,
  which sets `transform: translateY(-50%)` and therefore becomes the containing block for fixed
  descendants, so the intended full-stage flash renders as the banner's own 1280x172 box.
- **`shock_ring.png` is the one upscaled raster in the banner**, drawn 2.03x to 5.50x its 128 px
  source. A CSS ring would be resolution-independent and free 13,393 B.
- **`bloom_mega.png` is 819x819 natural drawn at 420x420** - 3.8x more source pixels than are ever
  painted.
- **The ~600 ms entry-scale reflow** on the amount is separate from the tnum fix and untouched.
- **Audio remains the only large publication gap**, unchanged from R130: four R125 stems absent,
  hooks wired and silent, blocker is the Stability licence decision.
- **Still nothing in CI measures hero animation, banner smoothness or reduced-motion conformance**,
  and `data-testid="hero-idle"` still has zero consumers. Every number in this report came from a
  harness written this session and thrown away with it.

## 9. FOR THE NEXT SESSION

**Model and effort.** Opus 5, high effort, ultracode on. One four-reader measurement workflow with a
four-claim adversarial verify phase; the two readers that finished first drove the banner and
micro-life work, and the two that finished last independently confirmed the border removal was
complete and correctly scoped.

**Approach.** Measure first, then change, then re-measure with the same instrument. Every claim in
this report has a before and an after taken the same way, and three of my own hypotheses were killed
by measurement (the mega burst inversion, the font-loading explanation for the entry swing, and a
four-bar chest lamp that is three).

**Alternatives tried and rejected.**
- *Dimming the perimeter further rather than removing it.* Rejected on the owner's ruling and on
  R118's record: it had already been dimmed once on measurement and had not satisfied.
- *Restoring TR-089's per-digit boxes* to fix the dancing amount. Rejected: the token swap is one
  line, and it completes the R071 ruling the retiring comment already assumed had happened.
- *Giving the multiplier the tier colour.* Rejected: gold is the constant value colour, and at epic
  `--sig` is gold anyway so it would change nothing there.
- *Putting the chest lamp inside `.hero-body`.* Rejected on the drop-shadow subtree, which is why it
  is a sibling.
- *Strengthening the antenna blink.* Not done: of the three accents it is the one with a scale pop,
  so it is the one closest in character to a tick, and the brief says refuse anything describable
  that way.

**Files touched.** `frontend/src/App.svelte`, `frontend/src/lib/components/WinBanner.svelte`,
`frontend/src/lib/components/SceneGroup.svelte`, `frontend/vite.config.ts`,
`frontend/scripts/build_diet_verify.mjs`, `reports/OUTSTANDING_LEDGER_2026-08-25.md`,
`reports/briefs/FS_R131_BordersBanners_Prompt.md`, `reports/screens/r131-borders-banners/`.

**Open threads, in the order I would take them.**
1. **The epic chromatic flash** is dead code that looks alive - either make it escape the banner's
   containing block or delete it and its keyframe.
2. **`win_countup_steady_gate` should read the real element** rather than reconstructing it. Until it
   does, its PASS means less than it appears to.
3. **The banner's dead tail** at big and mega.
4. **Audio**, still the largest publication gap.
5. **A CI gate that measures the hero and the banner at all.** R128 through R131 have each found a
   real player-visible defect that no gate could have caught.
