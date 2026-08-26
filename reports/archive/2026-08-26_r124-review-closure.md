# Session Report - R124 REVIEW-CRITICAL CLOSURE: the win unfold finally has both the gesture and the containment, and four of the five other categories are refused (2026-08-26)

**MORNING SUMMARY.**

1. **THE WIN REACTION IS THE ONE R123 ASKED FOR.** v3 clears the >5% floor at **5.03%** AND stays
   inside the canvas. Chest-band width **137 -> 193px (+56)** against R123's +3px.
2. **It cost 33,746 bytes** - a same-size drop-in replacement. dist 23.31 MB, headroom 1.69 MB.
3. **The Features glyph is refused on a semantic collision**: it is a LIGHTNING BOLT, which is
   already TURBO's mark and already appears three times in the same guide.
4. **All three banner bars are refused on geometry**: at the live banner's own width they cover
   **72% of the reels**; at stage width they cover the hero, SPIN, BET, BALANCE and the HUD panel.
5. **Both optional hero extras are refused as lighting-only** - 0.23% and 0.66%, weaker than the
   live glance.
6. **One asset intaken from a 42-file package.** That is the correct outcome, not a thin one.

---

## 1. WORKSTREAM 2 - THE V3 WIN UNFOLD

R123 refused v1 for severed limbs and shipped v2 knowing it had bought containment by shrinking the
gesture. The request was explicit: **v1's arm swing with v2's margins.** This is that.

| | mean Δ | path | XOR/rest | chest width | canvas margin |
|---|---|---|---|---|---|
| LIVE win before R123 (lighting) | 0.33% | 2.28% | 2.79% | 137 -> 138 (**+1px**) | - |
| v1 (R122, refused: severed) | 4.07% | 28.48% | 23.35% | 137 -> 205 (+68px) | **0px, cut** |
| v2 (R123, shipped: compact) | 3.25% | 22.76% | 16.73% | 137 -> 140 (+3px) | 36px |
| **v3 (R124, SHIPPED)** | **5.03%** | **35.18%** | **30.63%** | 137 -> **193** (**+56px**) | **20px** |

**Every gate passed first-hand:** zero pixels with alpha > 8 in column 0 or 679 on all eight frames,
smallest canvas margin 20px, identity IoU 0.9998, first frame equals last, ground drift 0px, residual
RGB under alpha 0 = 0 after packing.

**It fits the live hero box**, which R123 flagged as the next thing to check: widest rendered frame
193px against the 206px `.char-layer`, leaving 6px each side. Inspected at 2x, both the raised fist
and the open palm are fully drawn with visible background around them.

**The shipped curve, read off the sheet the game plays:**

| frame | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| chest width | 137 | 137 | 140 | **193** | **193** | 140 | 137 | 137 |
| ground line | 399 | 399 | 399 | 399 | 399 | 399 | 399 | 399 |

Crossed, wind-up, unfold, unfold, recross, crossed - and the ground line does not move by a single
pixel across the whole performance.

## 2. WORKSTREAM 4 - THE FEATURES GLYPH IS REFUSED, AND NOT FOR BEING UGLY

The glyph is genuinely better-looking than the ornate `feature_button.png` badge it would replace:
simple, 11.1% opaque, readable small, no baked text, and a much better fit for the operator shell.

**It is a lightning bolt, and the lightning bolt is already TURBO's mark in this game.**

- The live TURBO control draws `<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>` - a bolt.
- The interface guide already shows that bolt **three times**, as `btn_turbo`, `btn_turbo_2` and
  `btn_turbo_3`, because the speed control's whole design is that the bolt intensifies.
- Shipping this would put **the same mark on two different controls in the same list.**

**And it does not match the button the player will actually see.** The live FEATURES control is a
GRILLE - a rounded rect with three bars, `FeatureMenu.svelte:196-199` - which is the mark
`DESIGN_SYSTEM.md` sanctions for FEATURE. The guide's entire job is to show the player the control
they will meet.

**The right fix is not a hand-drawn glyph at all.** Every other row in that guide is a
screenshot-crop of the live control, produced by `regen_interface_guide_icons.mjs`. The Features row
should be too. It is the one row that is a painted raster, and that is why it is the one row that
mismatches.

## 3. WORKSTREAM 5 - ALL SIX BANNER-SUPPORT ASSETS REFUSED

**The three tier bars pass every content test and fail on geometry.** They are text-free, carry no
amounts or multipliers, and keep their centres clear (3.2% opaque in the centre band) so live text
can sit inside them. Then they are measured against the stage:

| bar scaled to | what its opaque area covers |
|---|---|
| 522px, the live banner's own width | **reels 72%** |
| 640px | reels 70% |
| 800px | reels 64% |
| 1280px, stage width | **hero 53%, SPIN 77%, BET 46%, BALANCE 47%, HUD panel 78%, reels 56%** |

**There is no placement that frames the banner without burying something.** The live banner text
plate is only **522x28 at (379,488)** - far smaller than a 1920x240 rail implies - and it sits inside
the reels box, so a rail tall enough to frame it reaches up into the reels.

**The three 640x360 overlays are refused as filler rather than as defective.** They would replace
tier art that R113 and R115 measured and placed deliberately, so that the three banner tiers read as
three things rather than one growing thing, and whose contrast problem was already fixed - the max
headline went from 8.41:1 to 11.05:1. The candidates carry far less centre light than the incumbents
(strong-burst 0.0040 against `burst_big`'s 0.1684), which is safer for text but solves a problem that
does not exist, and less presence is a presentation regression. `quiet-settle` is 0.1% opaque and
effectively invisible.

## 4. WORKSTREAM 3 - BOTH OPTIONAL HERO EXTRAS REFUSED

| strip | mean Δ | path | XOR/rest | chest delta | verdict |
|---|---|---|---|---|---|
| approval-nod | **0.23%** | 1.17% | 1.33% | +0px | lighting-only |
| feature-active-ambient | **0.66%** | 3.29% | 2.13% | +0px | lighting-only |
| LIVE glance (for scale) | 0.34% | 1.71% | 1.66% | +0px | - |

**The approval nod moves less than the glance already shipping.** Both are the pre-R122 pattern:
lighting on a locked pose. The package's own QA reports max 1.316% and 2.110% with 1px chest deltas,
so this is not in dispute - the numbers agree, they simply are not enough.

The feature-active window is also already filled: the R122 weight-shift idle runs through it, and
adding a near-identical lighting loop would be noise without motion.

## 5. WORKSTREAM 8 - THE QA MATRIX

| state | observed | duration |
|---|---|---|
| idle / dead time | weight-shift + de-loop; glance at 21.3s | 1700ms |
| small win (< 10x) | no reaction | - |
| meaningful win (16.2x) | `idle -> win/big -> idle` | 1502ms |
| epic win (135.6x) | `idle -> win/epic -> idle` | 1906ms |
| feature entry | `idle -> energy -> idle` | 1303ms |
| feature active | the idle weight shift | - |
| paytable open | unchanged, `paytable_card_fill` green | - |
| reduced motion | `animation-name: none`, `transform: none` | - |

**60 fps, p95 16.8ms, worst 18.7ms, zero frames over 20ms across 194 samples. Zero console errors and
zero failed requests in every state.** **16 gates green**, including `asset_guard --self-test`,
`hud_banner_spec_check`, `paytable_card_fill` and `smallscreen_composition`.

## 6. WORKSTREAM 9 - REVIEW IMPACT

### Poor animations
- **First 10 seconds:** the hero does a planted-foot weight shift on a 6-frame loop, de-looped by a
  0.32deg counter-rotation, plus a glance toward the reels every 21s. Before R121 he moved 1.29px.
- **On a win:** he winds up, **swings both arms wide** - fist up, palm out, chest silhouette from 137
  to 193px - and recrosses. Before R123 that number was +1px.
- **On feature entry:** a bilateral fist brace, chest 137 to 184px.
- **Is pose change obvious at game distance?** Yes, and it is now measurable rather than arguable:
  the figure's own outline changes by 30.6% of its body pixels at the win peak.

### Low quality assets and presentation
- **The Features mismatch is NOT fixed**, and the offered fix was the wrong one. Named precisely in
  section 2 with the correct remedy.
- **Banner support was refused in full**, with the geometry that decides it.
- **Remaining presentation holes:** the Features guide row, and the max-win overlay.

### Still open
- **Audio stems.** Four moments still silent: feature entry, retrigger, feature end, max win. Owner
  supply, unchanged since R117.
- **Max win still covers the hero.** `MaxWinCelebration` is a full-screen modal, so no hero reaction
  can be seen during it. **Five sessions running.**
- **Nothing in CI measures hero animation.** Every number in R121-R124 came from session scripts.

## 7. WHAT I WOULD ASK FOR NEXT

1. **A Features guide icon produced the way every other row is** - a screenshot-crop of the live
   grille control - rather than a painted glyph. No new art needed.
2. **Banner support sized to the real banner**, if it is wanted at all: the target is 522x28 at
   (379,488), not 1920x240.
3. **Nothing further for the hero.** Idle, win and feature entry all now change pose, and the only
   remaining hero gap is max win, which is a layout decision rather than an art one.
