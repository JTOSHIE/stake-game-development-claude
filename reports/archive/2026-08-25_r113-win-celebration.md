# R113: four of nineteen assets shipped, and the seven best ones could not

Date: 2026-08-25. Branch: `claude/r113-win-celebration`. Review lane, unattended.

Brief saved verbatim: `reports/briefs/FS_FABLE_R113_WIN_CELEBRATION_Prompt.md`. Branch:
`claude/r113-win-celebration`, review lane. **Big, Mega, Epic and Max Win now carry painted
energy.** Four rasters intaken, two components wired.

## The shortest true summary

**The celebration band was a flat dark bar with a coloured rule.** Correct, tiered, and completely
inert. It now has painted tier energy behind it, and the max-win overlay is framed by corner
surges with a bloom behind the value.

**The package's seven strongest assets are unusable, and the reason is recorded project law.**
Every main frame bakes English tier copy: "BIG WIN", "EPIC WIN", "MAX WIN", "5000x". This game
renders those labels through `t(locale, ...)` in **sixteen languages**, and the manifest already
condemned an asset for precisely this.

**No gate could have caught it.** Every locale, prose, dash and machine-tell gate is a text scan
over source; none reads text inside an image. This refusal is a judgement call, so the evidence
for it is set out in full below.

---

## WORKSTREAM 1: package audit

19 runtime assets, plus 11 review sheets and 7 provenance sources. The package ships its own
`qa-inventory.json` declaring `baked_text` per file, which is unusually honest and made the audit
fast.

| Tier | Asset | Size | Baked text | Status |
|---|---|---|---|---|
| big | 01-big-win-main-frame | 1920x1080 | **BIG WIN** | **REFUSED, locale** |
| big | 02-big-win-dense-pulse-frame | 1920x1080 | **BIG WIN** | **REFUSED, locale** |
| big | 03-big-win-impact-burst | 1024x1024 | none | **SHIPPED** |
| big | 04-big-win-side-energy-accents | 1920x1080 | none | READY, not wired |
| epic | 01-epic-win-main-frame | 1920x1080 | **EPIC WIN** | **REFUSED, locale** |
| epic | 02-epic-win-hot-pulse-frame | 1920x1080 | **EPIC WIN** | **REFUSED, locale** |
| epic | 03-epic-win-energy-bloom | 1024x1024 | none | **SHIPPED** |
| epic | 04-epic-win-chrome-victory-accents | 1920x1080 | none | READY, not wired |
| max | 01-max-win-main-value-free | 1920x1080 | **MAX WIN** | **REFUSED, locale** |
| max | 02-max-win-ultimate-5000x-integrated | 1920x1080 | **MAX WIN + 5000x** | **REFUSED, locale + number** |
| max | 03-max-win-intense-centre-bloom | 1024x1024 | none | **SHIPPED** |
| max | 04-max-win-corner-side-surges | 1920x1080 | none | **SHIPPED** |
| max | 05-5000x-emblem-separate | 1024x512 | **5000x** | **REFUSED, number + glyph** |
| support | 01-soft-dark-vignette | 1920x1080 | none | READY, not needed (a scrim exists) |
| support | 02-centre-light-bloom | 1024x1024 | none | READY, not wired |
| support | 03-horizontal-win-banner-backing | 1400x360 | none | READY, not wired |
| support | 04-particle-spark-cluster | 512x512 | none | READY, not wired |
| support | 05-shock-impact-ring | 512x512 | none | READY, blocked, see residuals |
| support | 06-side-flare-pair | 1920x1080 | none | READY, not wired |

**Note the shape of that table: the seven refused assets are the seven best-looking ones.** The
main frames are genuinely premium: a chrome wordmark over a decorative surround with an empty
centre for the amount. They are also the only ones that cannot ship.

### Why the baked text is fatal here

1. **Sixteen locales.** `Locale = 'en' | 'ar' | 'de' | 'es' | 'fi' | 'fr' | 'hi' | 'id' | 'ja' |
   'ko' | 'pl' | 'pt' | 'ru' | 'tr' | 'vi' | 'zh'`. The tier label is a translated string, not a
   painted one: `MaxWinCelebration.svelte:150` renders
   `{t($locale, 'hudMaxWin', localeMode)}`, and `hudMaxWin` is `'MAX WIN'` in English and
   `'أقصى فوز'` in Arabic.
2. **The project has already condemned an asset for exactly this.** `docs/art/art_manifest_arc2.csv`
   row **UI-07**, `ui/panel_balance.png`, classification **DEAD**: "BAKES THE ENGLISH WORD
   'BALANCE' into the art, **which cannot survive sixteen locales or the social swap to COINS** ...
   Delete, do not redraw. **If a plate is ever wanted again it must be text-free.**"
3. **The number is wrong too, in twelve locales.** The game writes the cap as
   `` `${FS_MAX_WIN.toLocaleString(locale)}×` `` (`fsModes.ts:189`), so it is locale-formatted with
   each locale's own separator. The raster bakes `5000x`: no separator at all.
4. **And the glyph is banned by a gate.** `multiplication_sign_gate.mjs` exists to enforce
   "player-visible prose uses U+00D7, never letter x", closed as charter row Q-26 after 51
   instances of drift. The emblem bakes a lowercase **x** while the live overlay renders **×**
   three lines above it.

**One correction to a claim I was given.** A reconnaissance pass reported that baked text is
forbidden by the art law in writing. Read first-hand, `CLAUDE.md:425` says "front-facing
**symbols** carry no baked-in text" — that is scoped to symbols, not to all art. **The refusal
does not rest on that sentence.** It rests on the sixteen locales, the UI-07 precedent, and the
multiplication-sign gate, each verified directly.

---

## WORKSTREAM 2: the live win flow

**There are FOUR celebration tiers, and the package supplies THREE.**

| Live tier | Trigger | Surface |
|---|---|---|
| `big` | multiplier >= 10 | `WinBanner`, full-width band |
| `mega` | multiplier >= 30 | `WinBanner` |
| `epic` | multiplier >= 100 | `WinBanner` |
| **MAX** | `$isWincap` (5000x) | `MaxWinCelebration`, full-screen modal |

`WinTier = 'big' | 'mega' | 'epic'` at `winCountUp.ts:61-65`. **The package has no `mega` art at
all**, so the ladder had to be built from what exists rather than mapped one to one.

**The band is a deliberate decision, not an accident.** `WinBanner.svelte:4-8` records it as an
owner audit outcome: "a full-width neon band spanning the stage edge to edge ... reels visible
above and below (replaces the prior centred box that blocked the grid)". **So the package's
1920x1080 full-screen frames are not merely un-shippable for their text: adopting them would
reverse an owner ruling.** The bursts go behind the band instead.

Existing behaviour found and preserved: a shockwave (`ui/particles/shock_ring.png`), an
epic-tier coin fountain, a CSS particle layer, and an epic chromatic flash.

---

## WORKSTREAM 3 and 4: intake and wiring

**Four text-free rasters, downscaled to 65% Lanczos, 2.21 MB total.**

| Shipped as | From | Size | Bytes |
|---|---|---|---|
| `ui/win/burst_big.png` | big impact burst | 665x665 | 286 KB |
| `ui/win/burst_epic.png` | epic energy bloom | 665x665 | 757 KB |
| `ui/win/max_bloom.png` | max centre bloom | 665x665 | 597 KB |
| `ui/win/max_surges.png` | max corner surges | 1248x702 | 624 KB |

**The downscale was verified not to dim them**: mean light per alpha pixel is recorded per file in
`docs/art/win_celebration.provenance.json` and moves by less than 0.4 in every case
(142.5 to 142.2, 140.9 to 140.5, 147.4 to 147.1, 97.5 to 97.4). At full resolution the four would
have been 4.65 MB against 6.67 MB of remaining budget, which is not a responsible share for art
that appears occasionally.

**The ladder, built from three assets across four tiers:**

| Tier | Art | Size | Opacity |
|---|---|---|---|
| big | `burst_big` | 430px | 0.90 |
| mega | `burst_epic` | 400px | 0.62 |
| epic | `burst_epic` | 540px | 0.88 |
| MAX | `max_bloom` + `max_surges` | bloom 66%, surges full-bleed | 0.42 / 0.85 |

Mega and epic share one asset at two strengths. That is deliberate: the existing plate glow, type
scale and signature colour already carry a lot of the tier signal, so the burst only has to add
the step, not be the whole step.

**Wiring is two additive layers and nothing else.** `.c1-tier-burst` is the first child of
`.c1-plate-wrap` at `z-index: 0`, so it paints under the band while the existing shockwave at
`z-index: 1` still bursts over the top. `.c1-max-surges` and `.c1-max-bloom` sit below the halo
and the particle field in `MaxWinCelebration`. Both use `mix-blend-mode: screen`, so they add
light and can never darken what is read against them. **No threshold, no string, no layout and no
existing behaviour was changed.**

---

## WORKSTREAM 5: visual QA, measured

Every tier driven by a real round from the shipped 89-entry sample book, played through a stubbed
RGS, screenshot at 2x.

**One honesty note on method.** The book contains **no non-feature base win at or above 30x**:
every base round over 30x carries `freeSpinTrigger`, so its banner is the feature-end one and a
whole feature plays first. Mega and epic were therefore captured by driving a real base round's
events with an overridden multiplier. Tier is a pure function of that multiplier, so the screenshot
is what a player sees at that tier. **big and max are wholly real, wincap included.**

### Contrast, the thing most at risk

Measured as WCAG relative-luminance ratio over the amount region, before and after:

| Tier | Before | After first pass | After rebalance |
|---|---:|---:|---:|
| big | 10.59 | 10.52 | **10.07** |
| mega | 6.20 | 6.38 | **6.40** |
| epic | 12.10 | 12.11 | **12.11** |
| **max headline** | 14.16 | **4.73** | **8.41** |

**The first pass measurably damaged the max headline** and I would not have seen it by eye: the
bloom's core sat directly behind "MAX WIN REACHED!" and took its contrast from 14.2:1 to 4.7:1.
That is still a WCAG AA pass for large type, and it is still the wrong trade on the single most
photographed screen in the game. The bloom was moved from 44% to 58%, narrowed and dimmed to 0.42,
so its core now sits below the headline and the corner surges carry the drama out at the edges
where there is no text. **Recovered to 8.41:1.**

### Everything else

| Check | Result |
|---|---|
| Ascending tiers | big sparse cyan, mega moderate, epic large, max fully framed |
| Ordinary sub-10x win (0.2x) | **no banner, no burst** |
| Losing spin | **nothing raised** |
| Console errors / failed requests | **none, all four tiers** |
| Reduced motion, epic | burst present and loaded, **0 animations** |
| Reduced motion, max | bloom and surges present, **0 animations each** |
| dist | **20.54 MB against a 25 MB budget** |

Reduced motion keeps the art and drops only the movement. The art IS the tier identity; removing
it would strip the signal rather than calm it.

**Gates green:** build, `locked_paths`, `doc_currency`, `asset_guard` self-test, `asset_reference`,
`build_diet_verify`, `dead_wiring`, `dash`, `multiplication_sign`, `machine_tell`,
`evidence_hygiene`, `supply_chain`, `layout_fit`, `smallscreen_composition`,
**`max_win_hold_gate`**, **`win_countup_steady_gate`**, **`money_fit_gate`**.

---

## WORKSTREAM 6: report

**Does this materially improve presentation review risk? On the celebration surface, yes.** The
before and after is the difference between a flat information bar and a painted celebration. The
max-win overlay in particular went from a purple gradient with dots to a framed, energised
moment.

**What is still homeless: fifteen of the nineteen assets.** Seven are refused permanently unless
redrawn text-free. Eight are READY and simply not wired, because wiring them was not the smallest
safe change: the side accents, chrome accents, banner backing, spark cluster, side flares, centre
bloom and vignette all need placement decisions the brief did not call for.

### Residuals, precise

1. **The better shock ring is blocked by a third consumer.** `support/05-shock-impact-ring` is
   clearly better art than the shipped `ui/particles/shock_ring.png` (a blocky flat cyan ring at
   128x128, against a 512x512 cyan-to-magenta energy ring). But that file has **three** consumers:
   `WinBanner`, `FreeSpinsPresentation` entry, and `HeroSplash`, where the manifest warns it is "a
   STEADY presence at 42% opacity in screen blend over the emblem". Swapping it changes the boot
   splash. The safe form is a new win-only asset pointed at by `WinBanner` alone, roughly 112 KB.
2. **The art the package should have shipped:** the same main frames **with the wordmark region
   left empty**. The decorative surround is excellent and the empty centre is already the right
   shape; only the painted words make them unusable. A text-free frame set would let the
   translated label sit inside real art rather than on a plain band.

### Found while tracing, out of scope, recorded not fixed

- **The tier numbers are declared in four places and one set disagrees.** `winCountUp.ts` is
  10/30/100, and `WinDisplay.svelte:38-45` uses **mega at 50** with no epic band at all
  (verified first-hand). `soundService.ts` re-declares 10/30/100 as bare literals **with the names
  offset one step**, so `>= 30` plays `winBig` while the celebration calls 30 `mega`.
- **The multiplier is base bet, not total bet**, though the source comments say total: the divisor
  is `betAmount` and is never scaled by `MODE_COST`, so under OVERBOOST (1.25x) a win of 10x base
  bet is 8x total bet and still fires BIG.
- The brief says not to rebuild win tiers, so none of this was touched.

### Recommended next step after the hero animation lands

**A win reaction on the hero.** R112 closed with the hero breathing identically through a dead
spin and a big win, and this session has now built the tier signal the reaction would key off:
`WinBanner` already knows the tier and the max overlay already knows the cap. The missing piece is
still art, and the specification is unchanged from R112: family A, crossed arms and crossed legs,
680x1344, ground line y1322, starting and ending on frame 01 of the idle.
