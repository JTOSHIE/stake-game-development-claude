# Font specimen, 2026-08-15

JOB B of `reports/briefs/FS_CONTROL_ROW_FONTS_2026-08-15_Prompt.md`. **Evidence for an
owner decision and nothing else. No shipped font changed**: `--fs-font-display` and
`--fs-font-numeric` are exactly as they were, and the specimen sets a face on its own
subtree only. Australian English, no em dashes or en dashes.

Captures beside this file: `<face>-<locale>.png` for seven faces at `en`, `ru` and `hi`,
21 frames. Raw digit measurements: `_digits.json`.

---

## 1. The specimen

`frontend/fontspecimen.html` plus `src/fontspecimen.ts` and `src/FontSpecimen.svelte`. It
renders, in whichever candidate face and locale the on-page controls select:

- the shipped paytable values, copied from `PaytableModal.svelte:73` unchanged;
- the money readouts at their widest, the ten-figure balance from R061 and the
  4,999,990.00 prize from R059, through the SHIPPED `formatBalance` and `formatWin`;
- a sub-cent win, the 0.0008 case `winFractionDigits` exists for;
- a live counting balance, so digit-width behaviour is visible in motion rather than
  described;
- the digit-advance table of section 3, measured live.

**It uses the existing dev-only mechanism**, the one `src/c1preview.ts` has used since R14:
`vite build` takes `index.html` as its single entry, so an html file nothing imports is not
in the build graph and neither are its imports. Section 5 is the proof.

---

## 2. The candidates, measured

Every figure below is read from the installed package, not from a website.

| Face | package | licence | subsets ACTUALLY shipped | 400 | 700 | 900 | latin woff2, the weights we ship |
|---|---|---|---|---|---|---|---|
| **Orbitron** (incumbent) | `@fontsource/orbitron` 5.2.8 | **OFL-1.1** | latin | 6,396 | 6,528 | 6,400 | **19,324 B** |
| Oxanium | `@fontsource/oxanium` 5.3.0 | **OFL-1.1** | latin, latin-ext | 8,816 | 8,776 | none | 17,592 B at 400+700 |
| Chakra Petch | `@fontsource/chakra-petch` 5.3.0 | **OFL-1.1** | latin, latin-ext, **thai**, **vietnamese** | 9,756 | 9,900 | none | 19,656 B at 400+700 |
| Saira | `@fontsource/saira` 5.3.0 | **OFL-1.1** | latin, latin-ext, **vietnamese** | 13,876 | 13,732 | 13,380 | **40,988 B** |
| Exo 2 | `@fontsource/exo-2` 5.3.0 | **OFL-1.1** | **cyrillic**, cyrillic-ext, latin, latin-ext, **vietnamese** | 16,720 | 17,220 | 16,576 | **50,516 B** |
| Rajdhani | `@fontsource/rajdhani` 5.3.0 | **OFL-1.1** | **devanagari**, latin, latin-ext | 14,976 | 15,688 | none | 30,664 B at 400+700 |
| Michroma | `@fontsource/michroma` 5.3.0 | **OFL-1.1** | latin, latin-ext | 17,908 | none | none | 17,908 B at 400 only |

**All seven are OFL-1.1.** The brief's licence premise holds; no candidate is Apache 2.0
and none needed to be.

**FOUR OF THE BRIEF'S COVERAGE CLAIMS DO NOT MATCH WHAT @FONTSOURCE ACTUALLY SHIPS**, and
they are recorded as measured rather than as described:

| Brief said | Package holds | Verdict |
|---|---|---|
| Oxanium: "Latin and Vietnamese" | latin, latin-ext only | **no Vietnamese** |
| Saira: "Latin and CYRILLIC" | latin, latin-ext, vietnamese | **no Cyrillic** |
| Exo 2: "Latin, CYRILLIC and Greek" | cyrillic, cyrillic-ext, latin, latin-ext, vietnamese | Cyrillic yes, **no Greek** |
| Chakra Petch: "Latin and Thai" | latin, latin-ext, thai, vietnamese | correct, and Vietnamese as well |

**AND THE WEIGHT RANGE IS THE OTHER SURPRISE.** The shipped HUD uses 400, 700 and 900.
**Three candidates have no 900 at all** (Oxanium, Chakra Petch, Rajdhani) and **Michroma
ships only 400**. Adopting any of those means either re-weighting the HUD or accepting
synthetic bold, which is a machine tell of exactly the kind the standing mandate names.

**On script coverage for our sixteen locales**: our locale set includes `ru` (Cyrillic),
`hi` (Devanagari), `ja`, `ko`, `zh`, `ar`, `vi` and `th`-adjacent Latin. **No single
candidate covers even Cyrillic and Devanagari together.** Exo 2 has Cyrillic and no
Devanagari; Rajdhani has Devanagari and no Cyrillic. The `ru` and `hi` captures show what
the browser does in each case, which is fall back to a system face for the uncovered
script. **That is the same failure mode as today**: Orbitron is latin-only, so every
non-Latin locale already renders in a fallback.

---

## 3. Tabular figures, measured rather than assumed

The ten digits were each rendered alone at 100px, weight 400, and their advance widths
compared, first as the face draws them and then with `font-variant-numeric: tabular-nums`
asked for. A face whose digits share one width is tabular BY DRAWING; a face whose widths
CHANGE when `tnum` is asked for carries a real OpenType feature.

| Face | spread across the ten digits | tabular by drawing | does `tnum` move it | spread with `tnum` |
|---|---|---|---|---|
| **Orbitron** | **44.30** | **NO** | **NO** | 44.30 |
| **Oxanium** | **0.00** | **YES** | no, already uniform | 0.00 |
| Chakra Petch | 27.00 | NO | NO | 27.00 |
| **Saira** | 30.70 | NO | **YES** | **0.00** |
| **Exo 2** | 21.69 | NO | **YES** | 0.50 |
| Rajdhani | 20.30 | NO | NO | 20.30 |
| Michroma | 4.88 | NO | NO | 4.88 |

**THREE FACES CAN GIVE A NON-WOBBLING COUNTER**: Oxanium by drawing, Saira through a real
`tnum` that lands exactly 0.00, and Exo 2 through `tnum` with a 0.50 residual at 100px.
Orbitron, Chakra Petch, Rajdhani and Michroma cannot, by either route.

### The Orbitron question the brief asked, answered

**Orbitron's digits are NOT uniform width by drawing, and it has no `tnum` to fix them.**
Measured at 100px: `0` is 83.4 and `1` is 39.1, a spread of 44.30, and asking for
`tabular-nums` changes nothing.

**The measurement reproduces TR-089's recorded advances digit for digit.** That row
recorded the per-1000-em table `834 391 830 826 730 830 820 660 834 828`; at 100px this
pass measured `83.4 39.1 83.0 82.6 73.0 83.0 82.0 66.0 83.4 82.8`. Two independent methods,
four days apart, on the same face.

**So yes, an uncompensated Orbitron money counter changes width as it counts.** TR-089
already fixed that at the win banner with per-digit fixed-width boxes, so the counter that
was found wobbling is held. **What this measurement adds is that the cause is the face
itself and the compensation is per-site**, so any money readout that counts and does NOT
carry the per-digit treatment inherits the wobble. Enumerating which readouts those are is
a separate pass and is NOT done here, per the stop line.

---

## 4. The captures

21 frames, `<face>-<locale>.png`, at 1280x900 and deviceScaleFactor 2. Each shows the
paytable, the widest money readouts, the sub-cent win, the live counter mid-count and the
digit table, in that face and locale.

**A measurement trap worth keeping, because the first two runs of this page were wrong.**
The first run returned exactly 50.000px for all ten digits of all seven faces, which is
seven different faces agreeing to three decimal places: the probe was measuring in the
fallback because the webfonts had not loaded. Waiting on `document.fonts.ready` fixed
Orbitron and left the other six at 50.000, because `fonts.ready` only waits for faces the
page is ALREADY USING and an unselected candidate is not used. The fix is to force each
face with `document.fonts.load()` before measuring it. Both wrong runs are recorded in the
component's own comments so the next reader does not repeat them.

---

## 5. THE SPECIMEN DOES NOT SHIP, proven three ways

Built from this tree with the specimen and all six candidate packages installed:

| Check | Result |
|---|---|
| `dist` file count | **77**, the same as `main` |
| `dist` bytes | **12,337,183** against 12,336,028 on `main`, **+1,155** |
| the +1,155 bytes | the JOB A token block in `HudOverlay.svelte`, its comments and its `calc()` chain. **Not fonts** |
| candidate font files in `dist` | **zero**. `grep -ril "oxanium\|chakra\|saira\|exo-2\|rajdhani\|michroma" dist/` returns nothing |
| woff2 files in `dist` | **three**, all Orbitron: 400, 700, 900 |
| `dist/fontspecimen.html` | **absent** |

**Same-origin request sweep on the built app**, loaded from a static server and driven for
four seconds after `networkidle`:

```
total requests 51
origins        http://localhost:<port>  49
               https://rgs.origin-sweep.invalid  2   (the stubbed wallet, not a font host)
font requests  orbitron-latin-400-normal-U6xZUhur.woff2
               orbitron-latin-700-normal-4jsRXGGJ.woff2
               orbitron-latin-900-normal-DrIi7unX.woff2
```

**Zero external origins, zero candidate faces, three Orbitron files.** The compliance rule
that fonts are self-hosted via `@fontsource` only, with no font CDN, is unchanged by this
pass. The six candidate packages are `devDependencies`.

---

## 6. What this document does NOT do

It does not recommend a face. It does not rank them. It does not touch
`--fs-font-display` or `--fs-font-numeric`. **The decision is the owner's, on the captures
and the tables above**, and the stop line in the brief says nothing here is acted on.
