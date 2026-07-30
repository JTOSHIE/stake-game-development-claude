# SHARD: docs/QUALITY_CHARTER.md

**Document audited:** `docs/QUALITY_CHARTER.md` (530 lines) at HEAD
`de2fa2341dfd48ba113d872d22da6eb1894d5108`, branch `main`, working tree clean at start.

**Status: PARTIAL.** Every section was read. Section 4.1's dated dist glyph counts, section
4.3's dated attribute and text-node inventory, and section 3.1's Orbitron codepoint figures
were NOT recounted, for the reasons in COVERAGE.

---

## 1. How many claims, and how they were chosen

**Claims checked with a command: 58.** Chosen by walking the document top to bottom and
keeping every claim of one of these five shapes, which are the shapes a command can settle:

1. a `file:line` citation into another repository file (25 of these);
2. a named script or gate, checked in three separate directions: does the file exist, does
   it carry a seeded self-test, and is it named in `.github/workflows/checks.yml` (12 gates);
3. a Q-nn disposition asserting a state at HEAD, OPEN or FIXED or NOT A DEFECT (all 34 rows
   were read; 21 were settleable by command);
4. a count, a dimension or a file inventory (7);
5. an assertion that a class is or is not gated (5).

Everything else in the document is reasoning, quotation of the owner's mandate, or a dated
historical record, and none of those can go stale by construction.

**Q-01 was recounted first and separately**, per the briefing. Result below.

---

## 2. Q-01, recounted specifically

The briefing records that the Q-01 `index.html` title severity claim was an over-claim that
reached this document because its verifier died mid-run. **The row's correction is sound and
the substance holds. Two sub-claims inside the corrected row are still wrong, and one of
them was wrong on the day it was written.**

What holds, verified by direct read:

- `frontend/index.html:19` now reads `<title>Future Spinner</title>`. The scaffold name
  `future-spinner-frontend` is gone, so the FIXED disposition is correct.
- `frontend/dist/index.html` carries `<title>Future Spinner</title>` as well.
- The correction itself is right: the title IS set through `<svelte:head>` and NOT through
  `document.title`, so the original grep was indeed the wrong instrument, and the scaffold
  name was indeed the pre-hydration title only.

What is wrong:

- The row cites `App.svelte:1507`. At HEAD the `<svelte:head>` block is at
  `App.svelte:1646` and the `<title>` at `:1647`. The citation was correct at HEAD
  `3f0d686` (`git show 3f0d686:frontend/src/App.svelte | sed -n '1505,1510p'` puts
  `<svelte:head>` at 1506), so this is line drift in a record that was never dated.
- The row says the tab then "correctly reads `Future Spinner - We Roll Spinners`". It does
  not. `App.svelte:1647` is `<title>{$activeTheme.name} - We Roll Spinners</title>`;
  `themes.ts:117` sets `DEFAULT_THEME_ID = 'future-spinner'`; that theme's `name` at
  `themes.ts:25` is `'FUTURE SPINNER'`, in capitals. So the tab reads
  `FUTURE SPINNER - We Roll Spinners`. **`git show 3f0d686:frontend/src/lib/config/themes.ts
  | grep "name: 'FUTURE"` returns line 25 with the same capitals, so this sub-claim was
  already wrong when the row was written.** It is small, but it is the same shape as the
  original over-claim: a statement about what a player sees, asserted rather than read.

---

## 3. STALE findings

| # | Line | Claim, quoted short | Command run | Result | Proposed correction |
|---|---|---|---|---|---|
| S1 | 230 | `**It is 14 render sites of genuine player-visible hardcoded English.**` | `grep -rn "GET FEATURES\|BET MODES\|PLAY MODES" frontend/src/`; `grep -rn "HUD_LABEL_FREE_SPINS" frontend/src/`; `grep -rn "SYMBOL_LABELS" frontend/src/`; `git log --oneline -5 -- frontend/scripts/locale_completeness_check.mjs` | Every named literal is now a locale key in `translations.ts`. `fsModes.ts:191` reads `// REMOVED 2026-07-28 (TR-091): HUD_LABEL_FREE_SPINS and HUD_LABEL_TOTAL_WIN.` `SYMBOL_LABELS` returns nothing. The gate's own frozen-debt list at `locale_completeness_check.mjs:118` reads `// EMPTY. Every entry frozen on 2026-07-27 has been burned by the ratchet`. | Put the count in the past tense and date it to 2026-07-27 |
| S2 | 251 | ``German player in real-money mode reads `BET MODES`.`` | `grep -n "betModesHeading" frontend/src/lib/i18n/translations.ts` | 17 hits. German is `betModesHeading: 'EINSATZMODI',` at `:442`. Arabic, Japanese, Korean, Russian, Turkish and the rest all carry values. The English default is `:276` and the social override `:1974`. | Rewrite as a dated record of what was true on 2026-07-27, naming TR-091's ratchet commits |
| S3 | 207 | `**The gate blind spot itself is OPEN**: a literal adjacent to an interpolation is still invisible to it` | `grep -n "interpolation" frontend/scripts/locale_completeness_check.mjs` | The gate was WIDENED on 2026-07-27 by `37e43a5`. Line 178 reads `WIDENED 2026-07-27 (TR-091)`, line 240 `Split markup into text nodes, keeping interpolations as separators`, lines 382 to 386 scan both form (A), a literal sharing a node with an interpolation, and form (B), a literal inside one. | Mark the blind spot CLOSED, dated, with the commit |
| S4 | 292 | `**OPEN.** It is a one-property fix in either direction` (Q-34) | `grep -rn "text-transform: uppercase" frontend/src/lib/components/HudOverlay.svelte` | The three mode-badge rules at `:1313`, `:1963` and `:2284` each carry `text-transform: uppercase REMOVED 2026-07-28 (TR-092)`. `git log -S "TR-092"` gives `6305bc2 fix(TR-092): the HUD stops shouting the mode name, and class 4 gets its first gate`, dated 2026-07-28. | Mark FIXED, dated, keeping the reasoning as the record of why |
| S5 | 289 | `and **no gate covers it**:` (Q-34) | `grep -n "cross-surface-casing" frontend/scripts/machine_tell_gate.mjs` | Hit at `:443`, `klass: 'cross-surface-casing'`, with a `mode-badge-casing.svelte` seed at `:641`. Added by the same commit `6305bc2`. | Qualify to "no gate covered it when this row was written", naming the class that does now |
| S6 | 196 | `**OPEN**, raised as **TR-089**.` (Q-24) | `git log -1 --format="%h %cd %s" --date=short 0ff5022` | `0ff5022 2026-07-28 fix(TR-089): the win count-up stops dancing, measured at the shipped font's real advances`. The commit records per-digit fixed-width boxes at 0.834em on the amount, `win_countup_steady_gate.mjs` as the proof, and the remaining declarations as ACCEPTED by ruling. `grep -c "win_countup_steady_gate" .github/workflows/checks.yml` returns 1. | Mark FIXED 2026-07-28, preserving the original OPEN reasoning as the record |
| S7 | 264 | ``**`aria-label="Menu"` at four layout branches of `HudOverlay`**`` (Q-33) | `grep -n 'aria-label="Menu"' frontend/src/lib/components/HudOverlay.svelte` | Returns NOTHING. The four branches now read `aria-label={$tr('a11yMenu')}` at `:380`, `:498`, `:607` and `:769`. **The other half of Q-33 still stands**: `grep -n 'title={$speedTier' ...` returns `:420`, `:517`, `:674`, `:751`, all four still hardcoded English. | Annotate the first bullet as FIXED, dated; leave the second bullet alone |
| S8 | 424 | `So every seed in this gate's self-test is a string that was actually in the repository at` HEAD `3f0d686` | `grep -n "name: '" frontend/scripts/machine_tell_gate.mjs` | Fifteen positive seeds, not the nine the table lists. The five not in the table are `mode-badge-casing.svelte`, `variant-stack.svelte`, `bare-courier.svelte`, `third-token.css`, `pixi-fontfamily.ts`. `mode-badge-casing.svelte` reproduces a rule removed on 2026-07-28, so it cannot have been present at `3f0d686`. | Date the table to 2026-07-27 and say the seed set has grown |
| S9 | 451 | `- **It does not decide cross-surface capitalisation or button casing** (classes 4 and 7).` | `grep -n "cross-surface-casing" frontend/scripts/machine_tell_gate.mjs` | The gate does decide one static instance of class 4, at `:443`. | Qualify with the one exception and why it is checkable statically |
| S10 | 472 | ``` `reel_v3_proof.mjs` gates frame RATE ``` | `grep -c "reel_v3_proof" .github/workflows/checks.yml` | Returns **0**. The file exists at `frontend/scripts/reel_v3_proof.mjs` but nothing in CI runs it, so it gates nothing. | "measures frame RATE, and is not wired into CI, so it gates nothing" |
| S11 | 18 | ``Quoted verbatim from `CLAUDE.md:483` to `CLAUDE.md:487` `` | `grep -n "this title is the studio" CLAUDE.md` | The quote now runs `CLAUDE.md:538` to `:543`. At `3f0d686` it ran 482 to 487, so the citation was off by one at the start even then. | Cite the section by name, per convention (s) |
| S12 | 28 | ``restated from `CLAUDE.md:489` to `CLAUDE.md:493` `` | `sed -n '545,549p' CLAUDE.md` | The "What this changes in practice" paragraph is now `:545` to `:549`. | Cite the paragraph by name |
| S13 | 90 | ``The nine classes named in `CLAUDE.md:496` to `CLAUDE.md:502` `` | `sed -n '551,558p' CLAUDE.md` | The inspection-test paragraph naming the nine classes is now `:551` to `:558`. | Cite by name |
| S14 | 12 | ``Until this file existed, `CLAUDE.md:502` cited a document that was not in the repository.`` | `grep -n "sweep list and the repeatable gate live" CLAUDE.md` | That sentence is now `CLAUDE.md:558`. | Cite by name |
| S15 | 76 | ``(`CLAUDE.md:495`)`` | `grep -n "The inspection test" CLAUDE.md` | Now `:551`. | Cite by name |
| S16 | 419 | ``` `CLAUDE.md:470` states the requirement exactly ``` | `grep -n "plant the exact" CLAUDE.md` | The quoted sentence is at `:525`; convention (p) opens at `:508`. Line 470 is now inside convention (h.1). | Cite convention (p) by letter |
| S17 | 309 | ``` `CLAUDE.md:540` says it plainly ``` | `grep -n "^\*\*6\." CLAUDE.md` | Multi-track rule 6 is at `:611`. Line 540 is now inside the owner's mandate quotation. | Cite rule 6 by number |
| S18 | 69 | ``(`CLAUDE.md:250`)`` for 100,000 rounds per mode | `grep -n "100,000 rounds per mode" CLAUDE.md` | Now `:303`. Line 250 is now a BRANCHES heading. | Cite "True game facts" by name |
| S19 | 181 | ``(`CLAUDE.md:345`)`` for the theme selector being dev-only | `grep -n "## Theme selector" CLAUDE.md` | Now `:396`. Line 345 is now inside the Assets amendment. The substance holds: `:398` still says the selector is dev-only. | Cite "Theme selector" by name |
| S20 | 456 | ``LOCKED_FILE_DEBTS (`CLAUDE.md:181`)`` | `grep -n "carries four em dashes" CLAUDE.md` | Now `:193`. | Cite the section by name |
| S21 | 52 | `sixteen frames and eight video captures` | `ls docs/reference/competitor-demos/waylanders-forge/frames \| wc -l` | **20** frames, and 8 `.mp4` captures. The frame count grew; the video count is right. | Drop the counts, per convention (s), and let the directory's README carry them |
| S22 | 163 | ``` `App.svelte:1507` sets the title through `<svelte:head>` ``` | `grep -n "svelte:head" frontend/src/App.svelte` | `:1646`. Correct at `3f0d686`, drifted since. | Name the block rather than the line |
| S23 | 163 | ``the tab correctly reads `Future Spinner - We Roll Spinners` `` | `grep -n "DEFAULT_THEME_ID\|name: 'FUTURE" frontend/src/lib/config/themes.ts` | `DEFAULT_THEME_ID = 'future-spinner'` at `:117`; that theme's `name` is `'FUTURE SPINNER'` at `:25`. The tab reads `FUTURE SPINNER - We Roll Spinners`. Same at `3f0d686`. | Correct the casing and say where it comes from |
| S24 | 180 | ``` `frontend/src/lib/config/fsModes.ts:67,78,89,101,112` ``` | `grep -n "available:" frontend/src/lib/config/fsModes.ts` | The five `available: true` entries are at `:76, :86, :96, :106, :116`. The substance holds, all five are still true. | Drop the line numbers |
| S25 | 401 | ``` `src/lib/utils/currency.ts:223` calls `amount.toFixed(decimals)` ``` | `grep -n "toFixed" frontend/src/lib/utils/currency.ts` | The only `amount.toFixed(decimals)` is at `:387`, in the unknown-currency fallback. Line 223 no longer contains it. | Drop the line number |
| S26 | 169 | ``` `HudOverlay.svelte:94` ``` for the infinity glyph | `grep -rn "∞" frontend/src/` | The formatter is at `:105`, the three buttons at `:475`, `:711`, `:917`. The substance holds. | Name the formatter rather than the line |

---

## 4. UNKNOWN, and why each could not be settled

**U1. Section 5.3, "Audio ... Twelve shipped rows."** `find frontend -iname "*.mp3"` returns
14 files under `frontend/public/assets/sounds/` plus further copies under
`frontend/public/assets/themes/*/sounds/`. I could not settle what the charter means by a
"row": it may be an audio stem, a layer in an audio specification, or a file. The claim is
NOT contradicted, it is unmeasurable without knowing which of those a row is. **Verdict
UNKNOWN. No correction proposed.**

**U2. Section 5.3, "Social mode ... NEVER CAPTURED ... Absent from the 91-frame polish
set."** `ls reports/screens/` shows `social-dom-conformance/` and `social-strings-item-c/`,
which are captures of social-mode surfaces. Whether those constitute the "committed proof
set" the charter says does not exist depends on what counts as one, and the 91-frame polish
set is not a path I could identify unambiguously. **Verdict UNKNOWN.**

**U3. Section 3.1, the Orbitron figures.** The charter names
`frontend/dist/assets/orbitron-latin-400-normal-DBk4Dmer.woff` and 183 codepoints. That
file DOES exist in the local `frontend/dist/`, but `frontend/dist/` is untracked
(`git ls-files frontend/dist` is empty) and its `build-info.json` records commit
`b8d8012b9be97ccaa7ca3abee2e08ecdef7bdeef`, which is an ancestor of HEAD and not HEAD. I
did not build, per the brief. So I cannot say whether that content hash is the hash a build
of HEAD would produce, and I did not recount the codepoints. **Verdict UNKNOWN.** See
HANDED FORWARD for the design observation underneath it.

**U4. Q-16's park size, "27 static player-facing attributes and 48 markup text nodes".** The
TR-091 ratchet converted an unknown number of these to locale keys between 2026-07-27 and
2026-07-28. Recounting the set requires reproducing the sweep scanner's own definition of a
player-facing attribute, which is not committed as a script. The figures are presented in
4.3 as "The list as it stood on 2026-07-27", which is a dated record and therefore cannot go
stale, so I did not attempt the recount. **Verdict UNKNOWN, and arguably not a defect.**

**U5. Section 3, sweep-class rows 4 and 7, "PARTLY".** Whether "PARTLY" is still the right
word after the `cross-surface-casing` class landed is a judgement about degree, not a fact a
command settles. I proposed no edit to those two rows and corrected only section 5.2, which
states the limit as an absolute.

---

## 5. Claims checked and CONFIRMED still true

Recorded so nobody re-does them.

- Q-07, the infinity glyph: three autoplay buttons plus the formatter, still present.
- Q-11 fixed: `WinPod.svelte:7` records the removal of `$winAmount.toFixed(2)` in a comment
  and no money `.toFixed` remains in that file.
- Q-13 partly, Q-27 STILL OPEN: `frontend/src/app.css` still carries `color-scheme: light dark`
  (`:103`), `background-color: #242424` (`:105`), `#646cff` (`:115`, `:175`), `#535bf2`
  (`:119`), and `#app`'s `max-width: 1280px` (`:157`), `padding: 2rem` (`:159`) and
  `text-align: center` (`:160`). `place-items: center` is gone, with a comment at `:125`
  recording its removal, exactly as Q-27 says.
- Q-14 and Q-15 fixed: `grep -rn "Segoe UI" frontend/src/` returns only a comment at
  `App.svelte:2166` recording the removal; the same for Courier New.
- Q-17 fixed: `frontend/src/assets/` does not exist and `git ls-files frontend/src/assets/`
  is empty.
- Q-21 still OPEN: `locationRestricted` appears 17 times in `translations.ts` and nowhere
  else in `frontend/src/`.
- Q-22 fixed: none of the four dev glyphs survives in `frontend/src/` except inside a
  comment at `ThemeSelector.svelte:51` recording the change.
- Q-26 FIXED as the row says: `grep -c "1\.6x\|1\.25x\|5x"` returns **0** in both
  `prose.ts` and `prose.locales.ts`. `multiplication_sign_gate.mjs` exists, carries
  `--self-test`, and is wired into `checks.yml` twice.
- Q-28 still OPEN: `frontend/index.html` carries two HTML comments and the built
  `dist/index.html` carries two. `git log b8d8012..HEAD -- frontend/index.html` is empty, so
  the built artefact is current for this file even though the build is not at HEAD.
- Q-29's seed claim: `machine_tell_gate.mjs:623` still seeds
  `Votre session n a pas pu etre verifiee`, de-accented, as the row says.
- Q-30 fixed: `loadingDetail` appears 17 times in `translations.ts` and is rendered through
  `$tr` at `LoadingScreen.svelte:117`.
- Q-31 still OPEN: neither `social_string_conformance.mjs` nor `social_dom_conformance.mjs`
  imports `lib/evidencePaths.mjs`, though that module exists at `frontend/scripts/lib/`.
- Q-32's quoted regex is exact: `locale_completeness_check.mjs:175` is
  `const LITERAL_RE = />\s*([A-Z][A-Z0-9 &'.,!?:-]{2,})\s*</g`.
- B1: `design-system/brand/tile/tile_composed_master.png` is `408 x 546` per `file`.
- Section 2.1's three citations resolve: `fair-catalogue.md:49` carries the Valkyrie
  publisher record for Lokis Vault, `published-tile-geometry.md:58` carries the VALKYRIE
  type observation, `FEATURE_RESEARCH_v1_1.md:11` names Waylander's Forge.
- Section 5.3's `games/` correction: `git ls-files games/ | cut -d/ -f2 | sort -u` returns
  exactly `README.md` and `future_spinner`. The RESOLVED note is accurate. (The working
  tree also holds five untracked directories, which the pre-fix paragraph already names as
  untracked and unable to reach a clone.)
- Section 5 and section 6: `machine_tell_gate.mjs` exists, carries `--self-test` and
  `--source` (`:802`), and is named three times in `checks.yml`, in the `static gates` job,
  for the self-test, the source scan and the dist scan.
- Section 3's gate column: `dash_gate.mjs` exists, is wired three times, and its self-test
  prints `4 seeded violations caught`, matching "a four-form seeded self-test".

---

## 6. HANDED FORWARD, out of scope for this document

1. **`docs/records/V7_RECONCILIATION.md` is stale in the opposite direction.** Its row at
   `:169` records Q-26 as **OPEN** and its row at `:176` records Q-33 as **OPEN**. This
   charter records Q-26 as FIXED on 2026-07-30 by `fec8d61`, and my own grep confirms zero
   lowercase-x instances at HEAD; and the `aria-label="Menu"` half of Q-33 is fixed. That
   document, not this one, is the one carrying those two stale cells. **No tracker row
   proposed; recorded here only.**

2. **Three scripts the charter names or relies on are not wired into CI at all:**
   `reel_v3_proof.mjs` (0 hits in `checks.yml`), `hud_naming_uniformity_check.mjs` (0), and
   `social_string_conformance.mjs` (0). Existing and being wired are different questions and
   only the first was ever asserted for two of them.

3. **Convention (p) observation, reported as an OBSERVATION and with no fix proposed to any
   gate.** Of the gates this charter leans on to call a class closed:
   - carry a seeded self-test AND a `--self-test` flag: `machine_tell_gate.mjs`,
     `dash_gate.mjs`, `multiplication_sign_gate.mjs`;
   - carry seed logic that runs inline on every invocation, with no separate flag:
     `locale_completeness_check.mjs` (seeds at `:444` to `:519`, failing the run if any is
     missed), `dist_hygiene_gate.mjs` (26 mentions of "seed"), `contrast_gate.mjs` (10);
   - contain no occurrence of "seed" at all: `a11y_social_terms_check.mjs`,
     `layout_fit_gate.mjs`, `hud_naming_uniformity_check.mjs`. The first two ARE wired into
     `checks.yml`. Under convention (p) those two are printing a PASS that has never been
     seen to fail.

4. **A convention (s) design observation about section 3.1.** The charter writes a Vite
   content hash, `orbitron-latin-400-normal-DBk4Dmer.woff`, into a present-tense sentence.
   That name changes whenever the font asset changes, so the sentence is built to go stale.
   The stable form is the source name plus the codepoint count as a dated measurement. I
   propose no edit, because I could not verify the current hash without a build.

5. **The local `frontend/dist/` was built from `b8d8012`, not from HEAD.** Anyone reading a
   dist-based figure on this machine should know that before quoting it.

6. **Two other shard files were already present and untracked** under
   `reports/qa/session6/shards/` before I wrote mine: `BOOKS_MANIFEST.md` and
   `KNOWN_OPEN.md`. They are sibling agents' work, not mine, and I did not touch them.

---

## 7. COVERAGE: what I did NOT check

**Read this before treating anything above as exhaustive.**

- **Section 4.1's dist glyph table was not recounted.** It is explicitly dated to HEAD
  `3f0d686` and is a historical record, so it cannot go stale, and recounting it would have
  required decompressing a build of a four-day-old commit.
- **Section 3.1's 183-codepoint figure and the per-codepoint present/absent list were not
  re-measured.** See U3.
- **Section 4.3's two inventories, 27 attributes and 48 text nodes, were not recounted.**
  See U4. I checked a sample of its rows and found that several of the listed hardcoded
  attributes have since become `$tr` calls, which is expected given TR-091 and does not
  make a dated list wrong.
- **I did not run any gate.** Every gate claim above was settled by reading the gate's
  source and `checks.yml` as text, per the brief's rule 4. So "wired into CI" means "named
  in `checks.yml`", not "observed green on a run". I did not query `gh run list`.
- **I did not build the frontend**, so every dist claim rests on a build of `b8d8012`.
- **Nothing in this shard touches the money path.** TR-086, TR-109, TR-115 and player money
  display were not measured, analysed or proposed on. Q-10, Q-11 and Q-25 were read only far
  enough to record whether the disposition cell matched the tree, and Q-25 was left alone.
- **Sections 1 and 2.3's reasoning, the mandate quotation, and section 4.2's per-row prose
  were not fact-checked line by line**, only their citations and dispositions.
- **The three banned paths were not read or proposed on**: `rgsService.ts`, `gameStore.ts`,
  and anything under `games/future_spinner/`.
- **I proposed no new tracker rows.** Everything new is in HANDED FORWARD above.

**`git status --porcelain` at close** returned only the three untracked shard files under
`reports/qa/session6/shards/`, two of which (`BOOKS_MANIFEST.md`, `KNOWN_OPEN.md`) were
already there when I started and are not mine. No tracked file was modified. No file outside
my shard path was written by me.
