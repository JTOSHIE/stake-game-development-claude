# R116: real art, honestly counted, mostly without a home

Date: 2026-08-25. Branch: `claude/r116-factory-audit`. Review lane, unattended. Audit only.

Brief saved verbatim: `reports/briefs/FS_FABLE_R116_FACTORY_AUDIT_Prompt.md`. Branch:
`claude/r116-factory-audit`, review lane. **Audit only: nothing wired, no factory raster committed,
the working tree carries no speculative intake and the 30 placeholders are untouched.**

## THE ANSWER TO THE ONE QUESTION

**It is NOT bulk derivative filler, and it is not mostly usable either. It is real art without
consumers.**

- **90.5% of the files are individual single-subject sprites.** Not atlas cutouts. Every candidate
  I sampled for sheet-dependency turned out to be dedicated art or a legitimate animation strip.
- **The headline count is honest.** The doc claims 798 runtime candidates; I measured **799**.
- **The filename/dimension claim is exactly true.** 841 files carry a WxH in the name; **zero
  mismatches**.
- **But 710 of 799 have no consumer in the game**, and the runtime set is **348 MB against roughly
  2.1 MB of dist headroom**. Nothing here ships in bulk at any quality.

**The usable core is small, specific and genuinely good: the hero strips.**

---

## TASK 1 and 2: structure

866 files: **846 PNG**, 20 JSON/Markdown, zero unreadable.

| Structure, by content clusters separated by fully-empty bands | Count |
|---|---:|
| **single subject** | **766 (90.5%)** |
| horizontal strip (animation frames) | 45 |
| grid-like | 35 |

**The 35 grid-like files are a false positive of my own heuristic, and I checked rather than
reporting it.** Rendered, they are: a legitimate 6-frame animation strip, scattered atmospheric dust
(which naturally forms many clusters), and single bursts. **None is a contact sheet.**

**47 files are review/QA material** — identity overlays, ground-line checks, frame grids, and the
five phase-13 files, which are the only RGB-mode files in the dump and correctly carry no alpha
because they are review sheets. They are properly separated from the runtime set, exactly as the
factory's own doc says.

---

## TASK 3: size, alpha, edge

| Claim | Result |
|---|---|
| "Dimension/filename mismatches: 0" | **TRUE.** 841 named files, zero mismatches |
| Runtime candidates = 798 | **799 measured.** Honest to within one |
| Alpha cleanliness | **80.1% clean**, 11.5% mild fringe, **8.4% severe** |
| Near-empty (<2% coverage) | 51 files, of which **39 are faint but real art** and **12 are genuinely blank** |

### The edge finding, and the instrument that was blind

**434 of 846 files (51.3%) carry non-zero RGB under fully transparent pixels**, against the
project's own standard ("all transparent pixels have zeroed RGB for clean downstream compositing").
Severity splits sharply: median p99 is 1.0, essentially black and harmless, but **71 files are
severe, and 53 of those are in phase-07 hero-performance — 49% of that phase.**

I then tried to prove whether it manifests, by downscaling a worst offender and comparing against
the same file with its hidden RGB zeroed. The answer came back **0.00 difference at every scale**,
which would have been a reassuring result.

**It was a broken test.** I seeded a control — white deliberately hidden under transparency beside a
red disc, the exact defect — and my method reported **0.00 there too**. Pillow's resize() is
alpha-aware and premultiplies internally, so it can never bleed and my test could never detect
anything.

**So the honest position is: the fringing is a real deviation from the project's stated standard,
and whether it manifests in a BROWSER is untested**, because the only way to test it is to wire an
asset and look, and this session forbids wiring. It is cheap to fix at intake by zeroing RGB where
alpha is zero, so it need not block anything — but it must be done deliberately, not assumed away.

### The 12 blank frames

All are the first or last frame of a fade sequence, so being empty is **correct behaviour**. What is
not correct is their size: they carry full RGB under zero alpha and cost **6.67 MB as delivered
against 0.07 MB if they were actually empty. 6.6 MB of invisible data.**

---

## TASK 4: incumbent comparison

Where the game has an incumbent, the factory candidate was measured against it rather than judged.

| Factory hero strip | Peak change vs rest | Incumbent | Verdict |
|---|---:|---|---|
| 01-max-win-reaction | **63.5%** | win 57.2% | **STRONGER** |
| 02-epic-win-reaction | **61.5%** | win 57.2% | **STRONGER** |
| 03-feature-trigger-reaction | **62.6%** | energy 56.5% | **STRONGER** |
| 09-power-surge-settle | **62.9%** | energy 56.5% | **STRONGER** |
| 04-glance-to-reels | 37.4% | none | **fills a gap** |
| 08-short-approval-nod | 36.7% | none | **fills a gap** |
| 06-second-idle | 39.7% | idle 60.0% | weaker |
| 08/05-dead-spin-settle | 34.5% | idle 60.0% | weaker |
| 07-third-idle | 31.6% | idle 60.0% | weaker |
| 10-overdrive-active-life | 47.8% | idle 60.0% | weaker |

**A hypothesis I raised and killed.** Looking at thumbnails I suspected phase-11's 100
denser/quieter variants were near-duplicates of their parents. Measured against the actual parent
asset: **median 94.9% of pixels differ, zero variants under 10%, and the integrated-light ratio
spans 0.48x to 2.22x.** They are genuine alternates. My visual impression was wrong because the
subjects are faint at thumbnail size.

**And the "stock" folder is not what the word suggests.** Phase-06 has 60 files under stock/, and
the brief asks specifically about weak generic stock FX. Rendered, they are on-palette cyan/magenta
blooms, spark rains and gold coins that match the shipped coin.png. **"Stock" here means a library
of reusable pieces, not stock imagery.** Quality is good.

---

## TASK 5: hero identity gate, the strongest result in the audit

All ten strips measured against the **live** crossed-arms rest frame, not against the factory's own
reference:

| Check | Result |
|---|---|
| Silhouette IoU vs the live rest | **0.9488 to 0.9938** across every frame of all ten strips |
| Returns to exact rest (f1 == fN, pixel-identical) | **10 of 10** |
| Opaque-core ground drift (alpha >= 250) | **0 px on all ten** |

For reference, R114's accepted package sat at IoU 0.9695 to 0.9932 with 0 px drift. **These are the
same figure, the same stance, and the same discipline.** The factory's claim that every strip begins
and ends on the byte-identical rest master **verifies**.

**Usefulness under banner occlusion:** R115 measured that 60.8% of a win reaction's motion already
lives in the visible chest band and only 17.1% is hidden at big tier. These strips share that
construction, so the same conclusion carries: the occlusion is real and it is not disqualifying.

---

## TASK 6: classification

Of **799 runtime candidates**:

| Class | Count | Meaning |
|---|---:|---|
| **READY** | **49** | The six hero strips that pass the identity gate AND either beat their incumbent or fill a gap that has no art at all |
| **WEAK** | 28 | The four hero idle variants measurably weaker than the shipped idle (31.6-47.8% against 60.0%) |
| **WRONG-SPEC** | 12 | Fully blank frames shipped at full byte cost |
| **HOMELESS** | **710** | Good, identity-clean, on-brand art for systems this game does not have |
| **SHEET-ONLY** | 47 | Review/QA/overlay sheets, correctly excluded by the factory itself |
| **DUPLICATE** | **0** | Nothing was found to be a no-value copy of live art. The variant hypothesis was tested and refuted |

**The HOMELESS 710 is the real story, and it is not a criticism of the art.** It breaks down as:
133 symbol-state files needing a per-symbol state machine that does not exist; 85 anticipation files
needing an anticipation system; 76 transition files; 82 celebration-density pieces; 100 intensity
variants; 40 ambient; 40 paytable/meter; 30 boot/brand. **Every one of those needs a consumer built
before a single file is worth shipping.**

---

## TASK 7: next-session intake queue

Ranked by review impact. **Nothing was wired this session.**

1. **03-feature-trigger-reaction** (7f) and **09-power-surge-settle** (8f). Both beat the live
   energy-up by ~6 points, and R115 just built the Overdrive perimeter they would land alongside.
   **Highest impact per byte in the whole factory.**
2. **02-epic-win-reaction** (8f). Beats the live win reaction and gives the epic tier its own hero
   beat, which pairs with the tier art R115 shipped.
3. **04-glance-to-reels** (6f). Fills a real gap. R114 and R115 both refused weaker glance strips;
   this one is the same family and finally has a purpose: idle attract.
4. **08-short-approval-nod** (6f). Fills a gap; a cheap small-win acknowledgement below the
   celebration threshold.
5. **01-max-win-reaction** (8f). Strongest of all at 63.5%, ranked last **on purpose**:
   `MaxWinCelebration` is a full-screen modal that covers the hero, so R114 already established that
   a stronger max hero beat renders behind an opaque overlay. **Worth taking only if the modal is
   restaged to leave the hero visible.**

**Intake conditions for any of these**, both mandatory:
- **Zero the RGB where alpha is zero.** 53 of phase-07's files carry bright RGB under transparency.
- **Budget.** Six strips at 680x1344 are far beyond 2.1 MB of headroom. They need the same 70%
  common-scale treatment R114 used, or WebP, which remains the owner's outstanding decision.

---

## Verdict

**Mostly usable? No. Mostly bulk derivative filler? Also no.**

The factory is **honest, individually rendered, on-brand art whose counts and claims verify under
measurement** — and whose value is gated almost entirely on systems the game has not built and a
byte budget that is 99% spent. **The hero strips are the exception and they are genuinely good: six
of them are worth taking, four of them beat what ships today.**
