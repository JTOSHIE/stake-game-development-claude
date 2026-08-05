# V7 RECONCILIATION: the audit-to-shipped ledger

**What kit V7 can show, and what it cannot.** Every finding from the audit arc reconciled
against the shipped V7 bundle by evidence rather than by memory. Built 2026-07-28 by the
player-experience pass, JOB 1, from `reports/briefs/FS_PLAYER_EXPERIENCE_PASS_Prompt.md`.

This document exists because five kits were built across four sessions and the repository had
been inferring which fixes the owner is actually holding. It stops inferring. Sixty six
findings, each with its fixing commit, each tested for ancestry against the V7 build SHA, and
each confirmed at the V7 TREE rather than by ancestry alone.

---

## 1. THE OWNER SECTION: what V7 cannot show

Read this section and stop. Everything not listed here is in the kit on your desktop.

### The one sentence that matters

**CORRECTED 2026-08-05, and the correction is the more useful record.** This sentence was
written against a MOVING range, `6e9e4739..HEAD`, so it began decaying the moment it landed
and both of its halves are now false: run today the range returns 1,169 files, 84 of them
under `frontend/`. That is convention (s) in its purest form, and it matters more here than
in most places, because the claim is submission-adjacent.

**What was true, stated as a dated record so it cannot go stale.** As at `7d1c6b1` on
2026-07-28, the commit that wrote this ledger, `git diff --name-only 6e9e4739..7d1c6b1`
returned **18 files, none of them under `frontend/`**. The count in the original sentence
read fifteen and was wrong even then; the load-bearing half, that nothing under `frontend/`
had moved, did hold.

**Nothing player-facing had changed since V7 was built, as at that pinned commit.** So every
player-visible fix this repository knew about then was in the kit you were holding, and the
"fixed since V7" column has
exactly one entry, which is a developer utility that no player and no reviewer ever sees.

### FIXED POST-V7, ships in the next kit: one item

| # | What it is | What it means for you |
|---|---|---|
| **TR-088b** | Six developer utilities under `utils/` whose example defaults still named the nine sample maths packages that TR-088a deleted. Fixed at `6167b4c`, which is not an ancestor of V7. | **Nothing player-facing.** V7 ships four utility scripts whose example defaults fail on first run (`decompress_zstd.py`, `analysis/challenge_sheets.py`, `search_tool/forcetool_example.py`, `merge_luts/merge_lookups.py`) plus two stale doc references. These are developer tools in the repository, not in the game and not in the maths upload. No action. |

### OPEN: eleven items

None of these is a regression, and none was introduced by V7. Ten were already on the record
before V7 was built and simply stayed open. The eleventh, Q-29, is new: the row itself existed
and is in V7, but this pass found that its disposition claims an edit that was never made.

Five carry player-visible consequences (TR-086, Q-25, Q-26, Q-27, Q-28), two are owner-parked
decisions rather than builder work (Q-16, Q-21), two are tooling and evidence integrity
(Q-31, TR-090), and two are documentation accuracy (Q-33, Q-29).

| # | What it is | Why it is still open |
|---|---|---|
| **TR-086** | The Popout S balance strip clips a large balance with no ellipsis below about 390 css px: EUR 479,710.00 shows as a truncated compact form. | **The one with real player impact.** Player money display, escalated per convention (l.8). Awaiting a ruling between widening the fit ladder, a shorter compact form, or accepting it and sweeping the proof across a range of widths rather than one. |
| **Q-25** | The WinPod money fix corrected the format and made the overflow worse: routing through `formatBalance()` adds a symbol and separators, so the string got longer inside a 99px box that still has `white-space: nowrap` and, verified this pass, no `overflow` or `text-overflow` either. | Bet Replay is a mandatory approval surface. The tracker reads more closed than the code is: TR-087 says FIXED for the formatting half while this half was never addressed. |
| **Q-26** | The `x` versus multiplication sign fix was not swept to the class. Six occurrences on four lines in `fsModes.ts`, both the `blurb` and the `socialBlurb` branch, all rendered through `modeBlurb()`. | Small and mechanical. The charter says four; the tree says six, because each blurb has a social twin. |
| **Q-27** | The Vite scaffold block in `app.css` lost only its font line. Still present: `color-scheme: light dark`, `background-color: #242424`, the stock indigo `#646cff` link colours, `#535bf2` on hover, a third `#646cff` on `button:hover`, the scaffold focus ring, and `body { display: flex; place-items: center }`. | Stock indigo in a cyan and magenta game is the sharpest of these. |
| **Q-28** | The explanatory HTML comments in `frontend/index.html` ship into `dist/index.html`. Confirmed directly in the kit file on disk, not inferred. | Mildly ironic given `dist_hygiene_gate.mjs` exists to stop documentation shipping. If you unpack the kit and find `future-spinner-frontend` in a comment, that is this row, NOT the Q-01 scaffold title coming back. |
| **Q-16** | Player-visible English not routed through the translation layer: 27 static attributes and 48 markup text nodes. | **OWNER-PARKED and extracted** per multi-track rule 6. It is a surgical brief of its own, not a margin fix. |
| **Q-21** | The `locationRestricted` key exists in all sixteen locales and is rendered by nothing. | **OWNER-PARKED.** A jurisdiction-behaviour question: wire it to the flags `rgsService` already publishes, or delete all sixteen values. Not the builder's call. |
| **Q-33** | The Q-16 park is not complete, so section 4.3's claim to be is wrong. `aria-label="Menu"` at four HudOverlay layout branches and the speed-tier `title` interpolation at four branches are absent from it. Both confirmed live at HEAD this pass. | Rides with the Q-16 surgical brief. |
| **Q-31 / TR-090** | Two proof scripts write straight into committed evidence directories and neither imports `lib/evidencePaths.mjs`, so a casual re-run silently rewrites committed evidence. The committed evidence is also stale: it records a paytable reading `MAX WIN 5,000x base bet`, and the shipped build dropped those words. | The last unruled item from the audit arc, and a one-pass fix. Evidence a casual run can overwrite is not evidence. |
| **Q-29** | The charter's own accuracy row claims it qualified section 5.1's sentence that every gate seed "was actually in this repository". **The sentence is not qualified.** It stands unchanged at `docs/QUALITY_CHARTER.md:424`. | **Found by this pass, and it is the finding Q-29 itself names in Q-20: a disposition that describes a state as if it were an action.** Raised as **TR-093**. The gate is unaffected; only the sentence is. |

### What this pass did NOT find

No regression. No finding recorded as fixed that the V7 tree contradicts. Forty seven of the
sixty six are confirmed present in the V7 bundle at the tree, seven were never defects, and the
remaining twelve are the two tables above.

---

## 2. The V7 build SHA, and where it was read

```
6e9e47392e009337aabded6ca3f19d198e1a9241
```

Read from the shipped artefact's own provenance file,
`~/Desktop/FS_UPLOAD_KIT_V7/02_frontend_upload/build-info.json`:

| Field | Value |
|---|---|
| `commit` | `6e9e47392e009337aabded6ca3f19d198e1a9241` |
| `cleanTree` | `true` |
| `builtAt` | `2026-07-27T15:23:11.448Z` |
| `bundleFilesExcludingThisFile` | 109 |
| `bundleBytesExcludingThisFile` | 15,612,072 |

**Corroborated by an independent input**, per convention (l.4). `reports/SESSION_REPORT.md:5316`
records kit V7 as built from a fresh clone at `6e9e4739`, "110 files, 15,612,453 bytes". The two
statements reconcile exactly once `build-info.json` is counted, which it excludes from its own
figures: measured on disk, the kit holds **110 files totalling 15,612,453 bytes** and
`build-info.json` is **381 bytes**. So 109 + 1 = 110 and 15,612,072 + 381 = 15,612,453. The
artefact and the record of building it agree to the byte.

## 3. The finding set, and where each came from

| Source | Findings |
|---|---|
| `docs/QUALITY_CHARTER.md` sections 4.2, 4.2b, 4.2c, 4.2d | Q-01 to Q-34 |
| `docs/records/reviews/REVIEW_TRACKER.md` | TR-086 to TR-092, TR-088 split in two |
| The formerly frozen locale entries | FROZEN-01 to FROZEN-19 |
| `reports/SESSION_REPORT.md` from line 4319, the visual fixpack | FIXPACK-1 to FIXPACK-5 |
| | **66 total** |

**On the count of nineteen frozen entries, because three documents give three numbers.** The
`KNOWN_DEBT` set committed at `37e43a5` holds **eighteen** entries; its sibling `DEV_ONLY` set in
the same file holds **one** more, `ThemeSelector.svelte|FUTURE SPINNER`; eighteen plus one is the
nineteen the brief and TR-091 both name. The comment introducing the set says "the 20 the widened
reading found on its first run", and the list beneath it has eighteen. That comment does not
describe the list it introduces. It is scheduled for deletion with the set, which is why it is
recorded here rather than raised as a row of its own.

## 4. Method, and the two things it refuses to do

For each finding: identify the concrete code change the fix consisted of, locate the fixing
commit with `git log -S` on the fixed form, test ancestry with
`git merge-base --is-ancestor <commit> 6e9e4739`, then **confirm at the V7 tree** with
`git show 6e9e4739:<path>`.

1. **Ancestry alone never earns a SHIPPED IN V7 verdict.** The fixed form must be present in the
   V7 tree and the defective form absent. Where ancestry and the tree disagreed, the tree won.
   FROZEN-19 is the worked case: ancestry said the commit was in, the tree showed the flagged
   string still there, and the verdict became NOT A DEFECT rather than SHIPPED.
2. **Every verdict was adversarially re-checked** by a second agent instructed to refute it, not
   to agree with it. That layer earned its place: it changed FROZEN-19's verdict, corrected line
   numbers and quoted strings in a dozen rows, and caught that the Q-02 evidence had transcribed a
   multiplication sign as a letter `x`.

**Read-only discipline.** Every agent ran git and grep only, ran no project script, and reported
`git status --porcelain` in its own output schema. All sixteen reported clean. That guardrail
exists because of TR-090, where a read-only agent pass dirtied five committed evidence files by
running a project script rather than by using an editing tool.

**One disagreement was settled by the integrator rather than by vote.** Two adversarial runs
reached opposite verdicts on Q-29. It was resolved by reading `docs/QUALITY_CHARTER.md:424`
directly: the sentence Q-29 says it qualified is unqualified there, and the file is unchanged
since V7, so HEAD's state is V7's state. Recorded OPEN. Both readings are given in the appendix.

---

## 5. The ledger

Verdicts: **SHIPPED IN V7** (in the bundle, confirmed at the tree), **FIXED POST-V7** (on main,
not an ancestor of V7), **OPEN** (no fix on main; includes owner-parked, which is open work by
another name), **NOT A DEFECT** (the source row itself concludes there was nothing to fix).

Totals across 66 findings: **47 SHIPPED IN V7, 1 FIXED POST-V7, 11 OPEN, 7 NOT A DEFECT.**

### 5a. The quality charter, sections 4.2, 4.2b, 4.2c and 4.2d

| # | Finding | Fixing commit | Ancestor of V7 | Verdict |
|---|---|---|---|---|
| Q-01 | frontend/index.html carried the Vite scaffold title future-spinner-frontend as the pre-hydration tab title. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-02 | Trophy emoji typeset inside the wincap string in all sixteen locales plus the social override, rendered by WinDisplay. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-03 | Speaker and mute emoji in the audio menu item across the four HudOverlay layout profiles. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-04 | Three U+2605 star dingbats formed the max win crown, falling out of the Orbitron subset into a system font. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-05 | U+2715 multiply cross used as the close control on PaytableModal and FeatureMenu, absent from the Orbitron subset. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-06 | U+2192 arrow in the PaytableModal ways diagram, absent from the Orbitron subset. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-07 | U+221E infinity labels the infinite autoplay option and does fall back out of the Orbitron subset; the row reviewed it and kept it deliberately. | NONE | n/a | **NOT A DEFECT** |
| Q-08 | French locale mixed U+2019 and U+0027 apostrophes in one rules list (translations.ts). | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-09 | French error banner read 'Votre session n a pas pu etre verifiee' with the apostrophe absent entirely. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-10 | Hardcoded `$` beside the autoplay loss-limit input at three HudOverlay layout profiles, in a game that runs EUR/XEC/SC. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-11 | WinPod.svelte rendered player money as $winAmount.toFixed(2), the last money .toFixed in frontend/src. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-12 | MaxWinCelebration rendered a letter `x` after 5,000 while the paytable and mode cards use the multiplication sign. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-13 | frontend/src/app.css :root carried the Vite scaffold font stack, naming no brand face. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-14 | App.svelte declared font-family: 'Segoe UI', system-ui, sans-serif, the Windows system face. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-15 | 'Courier New', monospace led the stack on the boot progress label and the logo text. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-16 | Player-visible English not routed through the translation layer: 27 static attributes and 48 markup text nodes, counted and listed in charter 4.3. | NONE | n/a | **OPEN** |
| Q-17 | frontend/src/assets/svelte.svg, the Vite starter Svelte logo, was committed scaffold residue imported by nothing. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-18 | PaytableModal renders the literal 'coming soon' for any mode with available: false; all five modes are available: true so the branch is unreachable. | NONE | n/a | **NOT A DEFECT** |
| Q-19 | ThemeSelector renders 'COMING SOON'; the theme selector is dev-only and not rendered in production. | NONE | n/a | **NOT A DEFECT** |
| Q-20 | vocabulary.ts:73 carries U+2019 inside a prohibited-phrase entry; the phrase is the platform's own wording and is quoted verbatim by convention. | NONE | n/a | **NOT A DEFECT** |
| Q-21 | translations.ts key locationRestricted exists in all sixteen locales and is rendered by no component; dead bundle weight, live defect if a region gate is ever wired to it. | NONE | n/a | **OPEN** |
| Q-22 | Four DEV-gated glyphs (paint palette, down arrow, up-down arrow, check mark) survived tree-shaking into the production bundle as string literals. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| Q-23 | The Q-15 font fix regressed the boot progress label: Orbitron leads, the monospace fallback never participates, and tabular-nums is inert against Orbitron, so the 0 to 100 percentage shifted as it cou... | 7acc319 docs(verify): the last four verifications, the blind spot counted, and Q... | yes | **SHIPPED IN V7** |
| Q-24 | Every font-variant-numeric: tabular-nums declaration is inert because Orbitron ships no GSUB features and therefore no tnum, including .fs-num on the win count-up. Raised as TR-089. | 0ff5022 fix(TR-089): the win count-up stops dancing, measured at the shipped fon... | yes | **SHIPPED IN V7** |
| Q-25 | The Q-11 WinPod fix routed player money through formatBalance(), correct for format but it adds a currency symbol and separators, so the string got longer inside a box that is still 99px with white-sp... | NONE | n/a | **OPEN** |
| Q-26 | The Q-12 letter-x versus multiplication-sign fix was not swept to the class: player-visible x instances survive in fsModes.ts blurbs and social blurbs. | NONE | n/a | **OPEN** |
| Q-27 | The Q-13 fix removed only the font-family line from the Vite scaffold block in app.css and left the rest: color-scheme, the #242424 background, the stock indigo link colours and the flex/place-items b... | NONE | n/a | **OPEN** |
| Q-28 | The explanatory HTML comments added to frontend/index.html ship into dist/index.html because Vite does not strip comments from the entry template. | NONE | n/a | **OPEN** |
| Q-29 | Three of the charter's own claims were found loose: the Q-20 row describes a state as if it were an action, Q-08 cites a French string that Q-21 records as dead, and section 5.1's every-seed-was-real... | dad9834 (the Q-29 ROW landed; the 5.1 edit it describes did not) | yes | **OPEN** |
| Q-30 | LOADING CYBERNETICS rendered untranslated on the boot screen in every locale, and locale_completeness_check.mjs printed PASS over it because the literal shared its line with an interpolation. | 8f1e5ce fix(rule 10): the boot flavour line is translated, clearing the red on m... | yes | **SHIPPED IN V7** |
| Q-31 | A read-only research pass dirtied five committed evidence files because social_string_conformance.mjs and social_dom_conformance.mjs write straight into committed evidence directories; recorded as TR-... | NONE | n/a | **OPEN** |
| Q-32 | The locale gate blind spot counted at 14 render sites of player-visible hardcoded English, including the six stake.us prohibited-term strings hidden inside ternary interpolations. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY | yes | **SHIPPED IN V7** |
| Q-33 | The Q-16 park is incomplete: aria-label="Menu" at four HudOverlay layout branches and the speed-tier title interpolation at four branches are missing from 4.3's self-described complete list. | NONE | n/a | **OPEN** |
| Q-34 | CSS text-transform: uppercase on the HUD mode badge made the same mode read Cruise on three surfaces and CRUISE on a fourth; the sibling fsModes casing finding was refuted as never a defect. | 6305bc2 fix(TR-092): the HUD stops shouting the mode name, and class 4 gets its... | yes | **SHIPPED IN V7** |

### 5b. The tracker rows

| # | Finding | Fixing commit | Ancestor of V7 | Verdict |
|---|---|---|---|---|
| TR-086 | The mini strip clips the BALANCE with no ellipsis below about 390 css px, so EUR 479,710.00 renders as a truncated compact form. | NONE | n/a | **OPEN** |
| TR-087 | Replay win pod rendered player money with .toFixed(2), no separators and no currency symbol, in a fixed 99px zone. | 3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate... | yes | **SHIPPED IN V7** |
| TR-088a | Part 1 of 2, the deletion itself: nine non-shipping upstream sample packages removed from games/, plus the Makefile test_run target and a new games/README.md. | 1e5f903 chore(JOB 1): the SDK samples leave games/, and the COST-column decline... | yes | **SHIPPED IN V7** |
| TR-088b | Part 2 of 2, the follow-up correction: six developer utilities under utils/ whose example defaults still named the packages part 1 deleted. | 6167b4c fix(TR-088): six utils repointed off the deleted samples, and the miss t... | no | **FIXED POST-V7** |
| TR-089 | Every font-variant-numeric: tabular-nums declaration is inert against the shipped Orbitron, including the one on the win count-up. | 0ff5022 fix(TR-089): the win count-up stops dancing, measured at the shipped fon... | yes | **SHIPPED IN V7** |
| TR-090 | Two proof scripts write straight into committed evidence directories, and a read-only agent pass tripped one by running it. | NONE | n/a | **OPEN** |
| TR-091 | The locale gate could not see player-visible English inside an interpolation, hiding 14 render sites including six stake.us prohibited-term strings. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY... | yes | **SHIPPED IN V7** |
| TR-092 | The mode badge rendered CRUISE on the HUD while three other surfaces rendered Cruise from the same modeLabel() source, driven by CSS text-transform. | 6305bc2 fix(TR-092): the HUD stops shouting the mode name, and class 4 gets its... | yes | **SHIPPED IN V7** |

### 5c. The nineteen formerly frozen locale entries

| # | Finding | Fixing commit | Ancestor of V7 | Verdict |
|---|---|---|---|---|
| FROZEN-01 | src/lib/components/FeatureMenu.svelte\|BUY FEATURES: the real-money branch of a hand-rolled social ternary, hardcoded English in all sixteen locales. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY | yes | **SHIPPED IN V7** |
| FROZEN-02 | src/lib/components/FeatureMenu.svelte\|GET FEATURES: the social branch of the same ternary, also hardcoded English in all sixteen locales. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY | yes | **SHIPPED IN V7** |
| FROZEN-03 | src/lib/components/FeatureMenu.svelte\|BET MODES: the real-money branch of the footer button ternary, hardcoded English in all sixteen locales. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY | yes | **SHIPPED IN V7** |
| FROZEN-04 | src/lib/components/FeatureMenu.svelte\|PLAY MODES: the social branch of the same footer button ternary. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY | yes | **SHIPPED IN V7** |
| FROZEN-05 | src/lib/components/FeatureMenu.svelte\|BET: the bet label ternary {$isSocial ? 'PLAY' : 'BET'}, a hand-rolled copy of SOCIAL_OVERRIDES that dropped the locale swap. | e1dc213 fix(TR-091 ratchet 1/4): the BET and PLAY ternaries become the tr layer,... | yes | **SHIPPED IN V7** |
| FROZEN-06 | src/lib/components/FeatureMenu.svelte\|PLAY: the social branch of the same bet label ternary. | e1dc213 fix(TR-091 ratchet 1/4): the BET and PLAY ternaries become the tr layer,... | yes | **SHIPPED IN V7** |
| FROZEN-07 | src/lib/components/MaxWinCelebration.svelte\|BET: the same {$isSocial ? 'PLAY' : 'BET'} duplicated layer on the max win screen. | e1dc213 fix(TR-091 ratchet 1/4): the BET and PLAY ternaries become the tr layer,... | yes | **SHIPPED IN V7** |
| FROZEN-08 | src/lib/components/MaxWinCelebration.svelte\|PLAY: the social branch of that same max win ternary. | e1dc213 fix(TR-091 ratchet 1/4): the BET and PLAY ternaries become the tr layer,... | yes | **SHIPPED IN V7** |
| FROZEN-09 | src/lib/components/WinCelebration.svelte\|WIN!: the small win flash {$isSocial ? 'PRIZE!' : 'WIN!'}, hardcoded English in all sixteen locales. | d81feb1 fix(TR-091 ratchet 2/4): the win flash becomes a translated key, 15 to 1... | yes | **SHIPPED IN V7** |
| FROZEN-10 | src/lib/components/WinCelebration.svelte\|PRIZE!: the social branch of the same win flash ternary. | d81feb1 fix(TR-091 ratchet 2/4): the win flash becomes a translated key, 15 to 1... | yes | **SHIPPED IN V7** |
| FROZEN-11 | src/lib/components/FeatureMenu.svelte\|OFF: the enhancer toggle state {enhOn ? 'ON' : 'OFF'}, hardcoded English in all sixteen locales. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY | yes | **SHIPPED IN V7** |
| FROZEN-12 | src/lib/components/SessionPanel.svelte\|NET: the responsible-gambling session overlay rendering <span>NET {coinsWord}</span>. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY | yes | **SHIPPED IN V7** |
| FROZEN-13 | src/lib/components/BonusInstrumentColumn.svelte\|OVERDRIVE FREE SPINS: rendered from HUD_LABEL_FREE_SPINS in fsModes.ts, a second copy of a string already translated in all sixteen locales. | 1b98cf8 fix(TR-091 ratchet 3/4): the duplicated HUD constants are deleted, 13 to... | yes | **SHIPPED IN V7** |
| FROZEN-14 | src/lib/components/BonusInstrumentColumn.svelte\|TOTAL WIN: rendered from HUD_LABEL_TOTAL_WIN in fsModes.ts, likewise a second copy of an already translated string. | 1b98cf8 fix(TR-091 ratchet 3/4): the duplicated HUD constants are deleted, 13 to... | yes | **SHIPPED IN V7** |
| FROZEN-15 | src/lib/components/WinBreakdown.svelte\|WILD: the symbol label record SYMBOL_LABELS held W: 'WILD' as hardcoded English. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY | yes | **SHIPPED IN V7** |
| FROZEN-16 | src/lib/components/WinBreakdown.svelte\|SCATTER: the same record held S: 'SCATTER' as hardcoded English. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY | yes | **SHIPPED IN V7** |
| FROZEN-17 | src/lib/components/PaytableModal.svelte\|WILD: flagged from {:else if sym.name === 'WILD'}, a Svelte block condition comparing against data. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY | yes | **NOT A DEFECT** |
| FROZEN-18 | src/lib/components/PaytableModal.svelte\|SCAT: flagged from {#if sym.name === 'SCAT'}, the matching Svelte block condition. | bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY | yes | **NOT A DEFECT** |
| FROZEN-19 | src/lib/components/ThemeSelector.svelte\|FUTURE SPINNER: the theme name imported from config/themes.ts and rendered in the dev theme picker. | 37e43a5 feat(TR-091): the locale gate can see inside an interpolation, and the 1... | yes | **NOT A DEFECT** |

### 5d. The visual fixpack

| # | Finding | Fixing commit | Ancestor of V7 | Verdict |
|---|---|---|---|---|
| FIXPACK-1 | The load screen's WRS brand mark rotated and its bounding box swung up to 97.66px, because a logo canonicalisation swap left `animation: brand-spin 2.6s linear infinite` sitting on the single replacem... | 03672d9 fix(JOB 1): the load screen's WRS logo stops spinning, and the boot goes... | yes | **SHIPPED IN V7** |
| FIXPACK-2 | The speed control carried a 0.5rem 1x/2x/4x numeral caption and lit on a single `.engaged` boolean, so Turbo and Super Turbo were styled identically and the numeral was the only thing separating them. | f8fc733 feat(JOB 2): the speed control is the bolt alone, and the three speeds a... | yes | **SHIPPED IN V7** |
| FIXPACK-3 | The `.fs-plate` card frame was a block container, so its `.fs-face` fill was only as tall as its own content and left 23.14px of chrome exposed on WILD, 36.89px on SCAT and 15.42px on the unreported m... | ee6eb60 fix(JOB 3): a paytable card's fill follows its frame, so nothing shows t... | yes | **SHIPPED IN V7** |
| FIXPACK-4 | Ten hand-rolled dialog scrims used `position: fixed; inset: 0` inside `.game-wrapper`, whose `transform: scale()` makes it the containing block for fixed descendants, so every scrim covered the 1280x7... | f332d52 fix(JOB 4): ten hand-rolled scrims become one, and it covers the whole s... | yes | **SHIPPED IN V7** |
| FIXPACK-5 | KIT V6 was built from a fresh clone, PART 9e was added to the walkthrough with PART 9d marked superseded, and the walkthrough stopped asserting a file count that goes stale, including an 'if it reads... | 7d5d4e4 docs(JOB 5): the V6 walkthrough, and the kit README points at it; 14b650... | yes | **SHIPPED IN V7** |

**A note on the three NOT A DEFECT rows that carry a fixing commit.** FROZEN-17, FROZEN-18 and
FROZEN-19 show a commit because that commit DISPOSITIONED them, it did not fix them. `bac74d8`
taught the gate to skip Svelte block tags, so `{#if sym.name === 'SCAT'}` stopped being read as
player text; `37e43a5` placed the ThemeSelector string on the dev-only allowlist on its merits.
Nothing player-visible changed in either case, which is exactly why the verdict is NOT A DEFECT
rather than SHIPPED IN V7.

---

## 6. Deviations from the brief, recorded rather than quietly taken

1. **The brief scoped Q-01 through Q-29. This ledger carries Q-01 through Q-34.** Sections 4.2c
   and 4.2d of the charter carry five further findings in the same numbering. Dropping five real
   findings to make the set match a stated range would be precisely the tidy-looking
   incompleteness that Q-29 and Q-33 exist to correct. Two of the five, Q-31 and Q-33, are OPEN
   and appear in the owner section above, so the deviation is load-bearing rather than cosmetic.

2. **The brief names three verdicts. A fourth was needed.** Seven rows are ones where the source
   document itself concludes there was nothing to fix (Q-07, Q-18, Q-19, Q-20, FROZEN-17,
   FROZEN-18, FROZEN-19). Forcing them into OPEN would invent work the owner does not owe;
   forcing them into SHIPPED IN V7 would claim a fix that never existed. They are marked
   **NOT A DEFECT** and are excluded from the owner section, because nothing is pending on them.

3. **TR-088 is split into TR-088a and TR-088b.** Its work spans `1e5f903` and `6167b4c`, and those
   two commits fall on opposite sides of the V7 SHA. Reported as one row it would have to be
   called either shipped or not shipped, and both would be false. This is the only row in the set
   whose halves separate, and it is the only reason the FIXED POST-V7 column is not empty.

## 7. New tracker row raised by this pass

Per the brief: any finding whose fix is not on main at all becomes a tracker row on the spot.
Exactly one qualified.

**TR-093** is raised in `docs/records/reviews/REVIEW_TRACKER.md` for Q-29: section 5.1 of the
quality charter still asserts, unqualified, that every gate seed "is a string that was actually
in the repository", while the Q-29 row states that sentence was qualified. It was not. The gate
itself is sound, because its detector is the elision pattern rather than the accents; the
defect is entirely in the sentence.

## 8. What this ledger does not settle

**Liveness.** This document proves what is in the V7 BUNDLE. It does not prove what is running on
the Stake Engine portal, because the last confirmed publish is Front V2 and five kits have been
built since. `OWNER_CHECKLIST.md` item 1b remains the highest-value single action: publish, then
read the build commit SHA off the console boot line or `build-info.json` and screenshot it. Any
SHA closes it. The value is not matching a particular build, it is that the repository stops
inferring which one is live.

---

## Appendix: the evidence, row by row

Every row's fixing commit, ancestry result and tree confirmation, as the reconciling agent
returned it and the adversarial verifier left it. Notes prefixed `VERIFIER` record what the
refutation pass changed; the note on Q-29 is the integrator's, and says so.

**Q-01, SHIPPED IN V7.** frontend/index.html carried the Vite scaffold title future-spinner-frontend as the pre-hydration tab title.

*Evidence.* git log --oneline -S'<title>Future Spinner</title>' -- frontend/index.html => '3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate that holds it' (sole hit). git merge-base --is-ancestor 3e676a1 6e9e4739 => exit 0. TREE, re-run by me: git show 6e9e4739:frontend/index.html | grep -n 'title|future-spinner-frontend' => '15: It read `future-spinner-frontend`, the Vite starter's own npm package' and '19: <title>Future Spinner</title>'. Fixed form present at line 19, defective form absent from the title element, sole surviving occurrence of the scaffold name is the comment at line 15. Shipped kit: python re.findall over ~/Desktop/FS_UPLOAD_KIT_V7/02_frontend_upload/index.html => TITLE: ['<title>Future Spinner</title>'].

*Note.* VERIFIER: kept, verdict and evidence reproduce exactly. Two additions. First, I independently confirmed the row's dist caveat: git ls-files frontend/dist => 0 tracked files, and git show 6e9e4739:frontend/.gitignore shows 'dist' at line 11, so there is no committed dist path to check and the kit file is the only available surface. Second, the shipped kit index.html still contains 1 occurrence of [...]

**Q-02, SHIPPED IN V7.** Trophy emoji typeset inside the wincap string in all sixteen locales plus the social override, rendered by WinDisplay.

*Evidence.* git log --oneline -S<U+1F3C6> -- frontend/src/lib/i18n/translations.ts => '3e676a1 ...' then '805e91e', '2dfc061', '31fdbcf'. git merge-base --is-ancestor 3e676a1 6e9e4739 => exit 0. TREE, re-run by me with a python codepoint scan over 'git show 6e9e4739:frontend/src/lib/i18n/translations.ts' rather than grep, because zsh cannot express the astral literal: every codepoint above U+2000 enumerated, ZERO in the emoji planes, so U+1F3C6 absent. Fixed form present: grep -n 'wincap' on the same V7 blob returns 17 values, 244 through 1399 for the sixteen locales plus 1888 for the social override, for example "244: wincap: 'MAXIMUM WIN, 5,000x!'". WinDisplay.svelte at V7 scans clean of all seven target codepoints. Shipped kit scan of all 7 text files, 0 [...]

*Note.* VERIFIER: verdict kept. One correction to the prior evidence text. It quoted V7 line 244 as "MAXIMUM WIN, 5,000x!" with a plain letter x. The actual byte at V7 is U+00D7 MULTIPLICATION SIGN, so the string reads 5,000 then U+00D7. This does not change the verdict, the trophy is genuinely gone, but 'all glyph free' overstates it: the wincap values still carry a non-ASCII U+00D7. That is deliberate and is a different [...]

**Q-03, SHIPPED IN V7.** Speaker and mute emoji in the audio menu item across the four HudOverlay layout profiles.

*Evidence.* git log --oneline -S'audio-mute-icon' -- frontend/src/lib/components/HudOverlay.svelte => '3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate that holds it' (sole hit). git merge-base --is-ancestor 3e676a1 6e9e4739 => exit 0. TREE, re-run by me: python codepoint scan of 'git show 6e9e4739:.../HudOverlay.svelte' for U+1F507 and U+1F50A => zero occurrences of either, the only flagged codepoint in the whole file is U+221E. Fixed form present: grep -n 'audio-mute-icon' => 395, 538, 622, 784 each '<svg class="audio-mute-icon" viewBox="0 0 24 24" aria-hidden="true">', plus the CSS at 1546 to 1554. Four profiles, matching the four call sites the charter row named.

*Note.* VERIFIER: verdict kept. One factual correction to the prior evidence: it placed the fourth profile at line 782. At V7 the fourth svg is at line 784, not 782. Lines 395, 538 and 622 are correct as stated. Count and verdict unaffected.

**Q-04, SHIPPED IN V7.** Three U+2605 star dingbats formed the max win crown, falling out of the Orbitron subset into a system font.

*Evidence.* git log --oneline -S'c1-crown-star' -- frontend/src/lib/components/MaxWinCelebration.svelte => '3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate that holds it' (sole hit). git merge-base --is-ancestor 3e676a1 6e9e4739 => exit 0. TREE, re-run by me: codepoint scan of the V7 blob for U+2605 => exactly one line, '98: <!-- Three drawn stars. This was `<U+2605> <U+2605> <U+2605>`, U+2605, which the shipped', a comment. Fixed form present: '104: {#each [0, 1, 2] as i}' and '105: <svg class="c1-crown-star" viewBox="0 0 24 24" style="--i:{i}">', with CSS at 234 and 239. Shipped kit scan => 0 U+2605.

*Note.* VERIFIER: kept. Minor quoting drift only: the prior evidence rendered the svg open tag without the style attribute, the actual V7 line is '<svg class="c1-crown-star" viewBox="0 0 24 24" style="--i:{i}">'. Substance unchanged, the rendered markup is glyph free.

**Q-05, SHIPPED IN V7.** U+2715 multiply cross used as the close control on PaytableModal and FeatureMenu, absent from the Orbitron subset.

*Evidence.* git log --oneline -S'fs-close-glyph' -- frontend/src/lib/components/PaytableModal.svelte => '3e676a1 ...' (sole hit); git log --oneline -S'fm-close-glyph' -- frontend/src/lib/components/FeatureMenu.svelte => '3e676a1 ...' (sole hit). git merge-base --is-ancestor 3e676a1 6e9e4739 => exit 0. TREE, re-run by me: U+2715 scan of the V7 blobs => PaytableModal exactly one hit, line 178, a comment 'Was `<U+2715>`, U+2715, which the Orbitron subset does not carry, so the'; FeatureMenu exactly one hit, line 322, a comment. Fixed form present: PaytableModal 181 '<span class="fs-face"><svg class="fs-close-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg></span>'; FeatureMenu 324 the identical path under fm-close-glyph. [...]

*Note.* VERIFIER: kept unchanged. Both call sites independently confirmed at the V7 tree, same path data 'M6 6l12 12M18 6L6 18' and same 1.05em sizing rules at PaytableModal 591 to 592 and FeatureMenu 839 to 840, so the two close controls do agree as the row claimed.

**Q-06, SHIPPED IN V7.** U+2192 arrow in the PaytableModal ways diagram, absent from the Orbitron subset.

*Evidence.* git log --oneline -S'fs-way-arrow' -- frontend/src/lib/components/PaytableModal.svelte => '3e676a1 feat(JOB 1a) ...', then 'd987760', then 'ec5d017'; 3e676a1 is the last touching commit and the one that made the change. git merge-base --is-ancestor 3e676a1 6e9e4739 => exit 0. TREE, re-run by me: U+2192 scan of the V7 blob => exactly one hit, line 643, a CSS comment 'The arrow was `<U+2192>`, U+2192, absent from the Orbitron subset. Drawn now, and'. Fixed form present at 211: '<span class="fs-way-arrow" class:matched={i < 2}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h14M13 7l5 5-5 5" /></svg></span>'. Secondary claim confirmed at 648: '.fs-way-arrow.matched { color: var(--acc); filter: drop-shadow(0 0 8px var(--acc)); }'. Shipped kit [...]

*Note.* VERIFIER: verdict kept. One method correction. The prior row used the handle -S'fs-way-arrow svg', which is a fixed-form-only handle and hides history. The honest handle -S'fs-way-arrow' returns three commits, because the class predates the fix and previously wrapped a text arrow; 3e676a1 is still the right answer, but the row should not read as if the class were new. Separately, at both V7 and HEAD [...]

**Q-07, NOT A DEFECT.** U+221E infinity labels the infinite autoplay option and does fall back out of the Orbitron subset; the row reviewed it and kept it deliberately.

*Evidence.* SOURCE, checked by me rather than inferred: docs/QUALITY_CHARTER.md line 169 verdicts Q-07 as 'REVIEWED AND KEPT, with the reason in the gate's allowlist ... It is a member of a numeric series rather than an icon ... Four instances remain in dist, which is the whole of what the gate now permits.' TREE: codepoint scan of git show 6e9e4739:frontend/src/lib/components/HudOverlay.svelte => exactly 4 U+221E, line 102 "return n === Infinity ? '<U+221E>' : String(n)" and the three auto-menu buttons at 480, 716, 922, each data-testid="auto-infinite". Gate: git show 6e9e4739:frontend/scripts/machine_tell_gate.mjs => '85:const ALLOWED_CODEPOINTS = new Map([' and '86: [0x221e, 'U+221E INFINITY. Reviewed and kept, 2026-07-27 sweep. ...' closing with the [...]

*Note.* VERIFIER: kept. The NOT A DEFECT verdict is genuinely reached by the source document, not inferred by the prior agent: line 169 of docs/QUALITY_CHARTER.md verdicts it REVIEWED AND KEPT with the design reasoning stated, which is a decision that nothing needs fixing, not a park. I also checked the surrounding gate for the claim that a fifth instance would fail: SYMBOL_BLOCKS at V7 lines 70 to 80 include [0x2190, [...]

**Q-08, SHIPPED IN V7.** French locale mixed U+2019 and U+0027 apostrophes in one rules list (translations.ts).

*Evidence.* Fixing commit re-located: `git log --oneline -S"n a pas pu etre verifiee" -- frontend/src/lib/i18n/translations.ts` -> `3e676a1 ...` and `6c2858b fix(R2/TR-010)...`. Diff of 3e676a1 on that file shows the four French conversions: `- locationRestricted: "Ce jeu n'est pas disponible dans votre region.",` / `+ locationRestricted: 'Ce jeu n[U+2019]est pas ...',`; `- replayDisclaimer: "Ceci est la relecture d'une mise ... Aucun fonds n'est mise ..."` / `+ ... d[U+2019]une ... n[U+2019]est ...`; `- rulesOverdriveRetriggerBuild: '... lors d\'un redeclenchement que lors de l\'entree ...'` / `+ ... lors d[U+2019]un ... l[U+2019]entree ...`. `git merge-base --is-ancestor 3e676a1 6e9e4739` -> exit=0. TREE, run by me: `git show [...]

*Note.* VERIFIER: verdict SURVIVES, re-confirmed at the tree and not on ancestry alone. Two evidence corrections. First, the original row says "curly count in the fr block is 3"; that is right for the featureI18n fr block only, the fr Translations block carries 4 (line 651 has two). Second, the original row cites the pre-fix line numbers loosely; I checked 3e676a1^ and they match the charter exactly, `570` [...]

**Q-09, SHIPPED IN V7.** French error banner read 'Votre session n a pas pu etre verifiee' with the apostrophe absent entirely.

*Evidence.* `git log --oneline -S"n a pas pu etre verifiee" -- frontend/src/lib/i18n/translations.ts` -> `3e676a1 feat(JOB 1a)...` and `6c2858b fix(R2/TR-010): production cannot reach the mock, and a dead session says so`. Commit diff: `- errSessionUnavailable: 'Jeu indisponible. Votre session n a pas pu etre verifiee. Veuillez recharger ou contacter le support.',` / `+ errSessionUnavailable: 'Jeu indisponible. Votre session n[U+2019]a pas pu etre verifiee. ...',`. `git merge-base --is-ancestor 3e676a1 6e9e4739` -> exit=0. TREE, re-run by me: `git show 6e9e4739:frontend/src/lib/i18n/translations.ts | grep -n "session n a pas"` -> `exit=1`, defective form absent; the character dump gives `634: errSessionUnavailable: 'Jeu indisponible. Votre session n[U+2019]a [...]

*Note.* VERIFIER: verdict SURVIVES unchanged. I added an independent confirmation the original row did not have: the shipped V7 bundle itself carries the curly form and not the dropped-apostrophe form, so this is confirmed at the tree and in the artefact. The original note about the charter section 5.1 seed being a de-accented approximation is accurate; charter line 201, Q-29, records it.

**Q-10, SHIPPED IN V7.** Hardcoded `$` beside the autoplay loss-limit input at three HudOverlay layout profiles, in a game that runs EUR/XEC/SC.

*Evidence.* `git log --oneline -S'lossLimitSymbol' -- frontend/src/lib/components/HudOverlay.svelte` -> `3e676a1 feat(JOB 1a)...`, single hit. `git merge-base --is-ancestor 3e676a1 6e9e4739` -> exit=0. TREE, re-run by me: `git show 6e9e4739:frontend/src/lib/components/HudOverlay.svelte | grep -n 'lossLimitSymbol\|lossLimitTrailing\|loss-limit-input\|currencySymbolFor'` -> `33: currencySymbolFor, isVirtualCurrency, VIRTUAL_SYMBOL_TRAILING,`, `266: $: lossLimitSymbol = currencySymbolFor($currencyCode || 'USD')`, `267: $: lossLimitTrailing = isVirtualCurrency($currencyCode || 'USD') && VIRTUAL_SYMBOL_TRAILING`, and the fixed label at `473`, `709`, `915`, all three reading `<label class="auto-menu-amount">{#if !lossLimitTrailing}{lossLimitSymbol}{/if}<input ... [...]

*Note.* VERIFIER: verdict SURVIVES unchanged. I strengthened the defective-form check from the original row's two narrow greps to an exhaustive literal-dollar sweep of the V7 blob, and added two things the original row asserted but never proved: that `currencySymbolFor`, `isVirtualCurrency` and `VIRTUAL_SYMBOL_TRAILING` are actually exported at V7, so the fix is not referencing a symbol the bundle lacks, and that all three [...]

**Q-11, SHIPPED IN V7.** WinPod.svelte rendered player money as $winAmount.toFixed(2), the last money .toFixed in frontend/src.

*Evidence.* `git log --oneline -S'formatBalance' -- frontend/src/lib/components/WinPod.svelte` -> `3e676a1 feat(JOB 1a)...`, single hit. `git merge-base --is-ancestor 3e676a1 6e9e4739` -> exit=0. TREE, re-run by me: `git show 6e9e4739:frontend/src/lib/components/WinPod.svelte | grep -n 'toFixed\|formatBalance\|CURRENCY_SCALE'` -> `3: import { formatBalance, CURRENCY_SCALE } from '../utils/currency'`, `6: $: multText = $winMultiplier > 0 ? \`${$winMultiplier.toFixed(1)}x\` : ''`, `7: // Was \`$winAmount.toFixed(2)\`, the last money \`.toFixed\` in frontend/src and the`, `14: $: amtText = $winAmount > 0`, `15: ? formatBalance(Math.round($winAmount * CURRENCY_SCALE), $currencyCode || 'USD')`. Line 6 is a multiplier and line 7 is a comment, so no money toFixed [...]

*Note.* VERIFIER: verdict SURVIVES unchanged, and the partial-at-class-level caveat is confirmed at HEAD, not merely repeated from the charter. One factual correction to the summary wording, carried from the charter: at V7 a money `.toFixed` DOES still exist in frontend/src, at `frontend/src/lib/utils/currency.ts:223`, `return \`${code} ${amount.toFixed(decimals)}\`` in formatBalance's own unknown-currency catch fallback. [...]

**Q-12, SHIPPED IN V7.** MaxWinCelebration rendered a letter `x` after 5,000 while the paytable and mode cards use the multiplication sign.

*Evidence.* `git log --oneline -S'c1-max-x">[U+00D7]' -- frontend/src/lib/components/MaxWinCelebration.svelte` -> `3e676a1 feat(JOB 1a)...`, single hit. `git merge-base --is-ancestor 3e676a1 6e9e4739` -> exit=0. TREE, re-run by me: the V7 blob dumped per line gives `118: <span class="c1-max-mult fs-num">5,000</span><span class="c1-max-x">[U+00D7]</span>`. Defective form: `git show 6e9e4739:frontend/src/lib/components/MaxWinCelebration.svelte | grep -n 'c1-max-x">x<'` -> `exit=1`, absent. BUNDLE: in the shipped kit, `assets/index-CrpkyMd9.js` contains `c1-max-mult fs-num svelte-1gdr3aw">5,000</span><span class="c1-max-x svelte-1gdr3aw">[U+00D7]</span>`. Class-level incompleteness re-checked at HEAD: `grep -nE '[0-9]x\b' frontend/src/lib/config/fsModes.ts` -> [...]

*Note.* VERIFIER: verdict SURVIVES unchanged. Re-confirmed at the tree and additionally in the built artefact, so this is not resting on ancestry. The Q-26 siblings are genuinely still present at HEAD, exactly the four the original note lists; note that `fsModes.ts` lines 141, 142, 148 and 159 also contain `100x`, `400x` and `5,000x` but those are inside a source comment recording a naming ruling, not player-visible [...]

**Q-13, SHIPPED IN V7.** frontend/src/app.css :root carried the Vite scaffold font stack, naming no brand face.

*Evidence.* `git log --oneline -S"'Orbitron', system-ui, Avenir" -- frontend/src/app.css` -> `3e676a1 feat(JOB 1a)...`, single hit. Pre-fix baseline `git show 3e676a1^:frontend/src/app.css | grep -n font-family` -> `74: font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;` and `127: font-family: inherit;`, matching the charter citation of `app.css:74`. `git merge-base --is-ancestor 3e676a1 6e9e4739` -> exit=0. TREE, re-run by me: `git show 6e9e4739:frontend/src/app.css | grep -n 'font-family'` returns exactly two lines, `82: font-family: 'Orbitron', system-ui, Avenir, Helvetica, Arial, sans-serif;` and `135: font-family: inherit;`, so the defective declaration is absent and the fixed one present; lines 74 to 81 are the replacement comment, with `75: [...]

*Note.* VERIFIER: verdict SURVIVES unchanged. The original row's claim that line 75 is the comment quoting the old value is correct, I read lines 70 to 90 of the V7 blob to check rather than taking it. I added the pre-fix baseline the original row omitted, and the bundle confirmation. The Q-27 residue is real at HEAD and the built V7 CSS also carries the scaffold's light-mode block, [...]

**Q-14, SHIPPED IN V7.** App.svelte declared font-family: 'Segoe UI', system-ui, sans-serif, the Windows system face.

*Evidence.* Commit confirmed by diff, not by -S: `git show 3e676a1 -- frontend/src/App.svelte | grep -nE "^[+-].*font-family|^@@"` -> hunk `@@ -1999,7 +1999,12 @@` with `- font-family: 'Segoe UI', system-ui, sans-serif;` and `+ font-family: 'Orbitron', system-ui, sans-serif;`. Pre-fix baseline `git show 3e676a1^:frontend/src/App.svelte | grep -n 'Segoe UI'` -> `2002: font-family: 'Segoe UI', system-ui, sans-serif;`, matching the charter citation of `App.svelte:2002` exactly. `git merge-base --is-ancestor 3e676a1 6e9e4739` -> exit=0. TREE, re-run by me: `git show 6e9e4739:frontend/src/App.svelte | grep -n "Segoe UI"` -> one hit, `2002: /* Read \`'Segoe UI', system-ui, sans-serif\` until 2026-07-27. Segoe UI is the`, and I read lines 1996 to 2010 to confirm it is [...]

*Note.* VERIFIER: verdict SURVIVES unchanged, but the original row's method would have failed here and I am recording the trap. `git log --oneline -S"'Segoe UI', system-ui, sans-serif" -- frontend/src/App.svelte` returns ONLY `31fdbcf feat(frontend): scaffold Svelte 5 Vite project`, not 3e676a1, because 3e676a1 preserved the string inside the explanatory comment so the pickaxe occurrence count never changed. Anyone [...]

**Q-15, SHIPPED IN V7.** 'Courier New', monospace led the stack on the boot progress label and the logo text.

*Evidence.* `git log --oneline -S"'Orbitron', 'Courier New', monospace" -- frontend/src/lib/components/LoadingScreen.svelte` -> `3e676a1 feat(JOB 1a)...` and `df927e9 feat(motion): Motion Polish v2 ...`; the App.svelte half is in the same 3e676a1 diff, hunk `@@ -2321,7 +2326,9 @@` with `- font-family: 'Courier New', monospace;` / `+ font-family: 'Orbitron', 'Courier New', monospace;`. Pre-fix baseline: `git show 3e676a1^:...LoadingScreen.svelte | grep -n 'Courier New'` -> `128: 'Orbitron', 'Courier New', monospace;` and `195: font-family: 'Courier New', monospace;`; `git show 3e676a1^:frontend/src/App.svelte | grep -n 'Courier New'` -> `2324: font-family: 'Courier New', monospace;` and `2523: 'Orbitron', 'Courier New', monospace;`. These match the charter's [...]

*Note.* VERIFIER: verdict SURVIVES, but the original row's "defective form absent" claim is FILE SCOPED and must not be read as tree wide. Repo wide at V7, `git grep -n "font-family: 'Courier New', monospace" 6e9e4739 -- frontend/src` returns SEVEN surviving declarations, all in `frontend/src/lib/components/ThemeSelector.svelte` at lines 92, 98, 137, 152, 156, 163 and 171, identical at HEAD. That CSS is genuinely SHIPPED in [...]

**Q-16, OPEN.** Player-visible English not routed through the translation layer: 27 static attributes and 48 markup text nodes, counted and listed in charter 4.3.

*Evidence.* git log --oneline -S'Stop on win' -- frontend/src/lib/components/HudOverlay.svelte -> '97c0441', 'd987760', '3f957f9', all introducing commits, no fix. git log --oneline --grep='Q-16' -> empty. git log --oneline --grep='hardcoded-string' -> empty. TREE AT HEAD, git show HEAD:frontend/src/lib/components/HudOverlay.svelte | grep -n -> '385: aria-label="Menu"', '406: aria-label="Music volume"', '465: ... Stop on win</label>', '471: ... Loss limit</label>', plus 503, 612, 774 (Menu), 633, 800 (Music volume), 701, 907 (Stop on win), 707, 913 (Loss limit). TREE AT V7, same command against 6e9e4739 -> byte-identical line numbers and text. git show HEAD:frontend/src/lib/components/FeatureMenu.svelte | grep -n -> '302: aria-label="Features"' and '321: [...]

*Note.* VERIFIER: verdict OPEN survives unchanged. I re-ran every check the row claimed and reproduced it exactly. One methodological correction to the row's evidence, no change to the verdict: the row's 'Identical at V7' was asserted, not shown, so I ran the grep against 6e9e4739 separately for both files and the output matches HEAD line for line. The Q-33 cross-reference in the row's note is real and I read it: [...]

**Q-17, SHIPPED IN V7.** frontend/src/assets/svelte.svg, the Vite starter Svelte logo, was committed scaffold residue imported by nothing.

*Evidence.* git log --oneline --diff-filter=D -- frontend/src/assets/svelte.svg -> '3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate that holds it'. git log --oneline --all -- frontend/src/assets/svelte.svg -> only 3e676a1 plus '31fdbcf feat(frontend): scaffold Svelte 5 Vite project'. git merge-base --is-ancestor 3e676a1 6e9e47392e009337aabded6ca3f19d198e1a9241 -> exit=0. TREE AT V7: git show 6e9e4739:frontend/src/assets/svelte.svg -> "fatal: path 'frontend/src/assets/svelte.svg' does not exist in '6e9e4739'". git ls-tree -r --name-only 6e9e4739 -- frontend/src/assets/ -> empty. RENAME CHECK, git show --stat --find-renames 3e676a1 -- frontend/src/assets/svelte.svg -> ' frontend/src/assets/svelte.svg | 1 -' and '1 file changed, 1 [...]

*Note.* VERIFIER: verdict SHIPPED IN V7 survives unchanged. I added the one check the row did not run, --find-renames, because a deletion verdict is refutable if the file was merely moved. It was not moved: the commit is a single-line pure delete and no .svg exists under frontend/src at V7 at all. Charter row at docs/QUALITY_CHARTER.md:179 confirms disposition 'FIXED, deleted'.

**Q-18, NOT A DEFECT.** PaytableModal renders the literal 'coming soon' for any mode with available: false; all five modes are available: true so the branch is unreachable.

*Evidence.* SOURCE CONCLUSION CONFIRMED, not inferred: docs/QUALITY_CHARTER.md:180 reads 'NOT A DEFECT today: all five modes are available: true ... so the branch is unreachable and no player can see it' with disposition 'NOT A DEFECT, reasoning recorded'. UNREACHABILITY AT V7: git show 6e9e4739:frontend/src/lib/config/fsModes.ts | grep -n 'available' -> '67: available: true,', '78:', '89:', '101:', '112:' all true; identical at HEAD. RENDER SITE AT V7: git show 6e9e4739:frontend/src/lib/components/PaytableModal.svelte | sed -n '303,316p' -> '311: {#if !m.available}' then '312: <span class="fs-mode-soon">coming soon</span>', a bare literal with no $tr wrapper; identical at HEAD. NO LOCALE KEY: git show 6e9e4739:frontend/src/lib/i18n/translations.ts | grep -n [...]

*Note.* VERIFIER: verdict NOT A DEFECT survives unchanged, and the row's contradiction of the disposition tail survives too. I reproduced it: the charter's disposition claims the string was 'routed through a locale key anyway so it cannot ship untranslated if a mode is ever gated', and at both V7 and HEAD it is a bare literal with no comingSoon key in any of the sixteen locales. One correction to the row's underlying source [...]

**Q-19, NOT A DEFECT.** ThemeSelector renders 'COMING SOON'; the theme selector is dev-only and not rendered in production.

*Evidence.* SOURCE CONCLUSION CONFIRMED, not inferred: docs/QUALITY_CHARTER.md:181 reads 'NOT A DEFECT: the theme selector is dev-only and not rendered in production (CLAUDE.md:345)' with disposition 'NOT A DEFECT, reasoning recorded'. STRING AT V7: git show 6e9e4739:frontend/src/lib/components/ThemeSelector.svelte | grep -n 'COMING SOON' -> '48: <span class="badge">COMING SOON</span>'; identical at HEAD. DEV GATE AT V7: git show 6e9e4739:frontend/src/App.svelte | grep -n 'ThemeSelector' -> '1945: {#if import.meta.env.DEV && showThemeSelector}' and '1946: <ThemeSelector on:close={() => showThemeSelector = false} />'. MOUNT SITES SCANNED AT THE TREE, all 86 files of git ls-tree -r --name-only 6e9e4739 -- frontend/src -> the only <ThemeSelector .../> mount is [...]

*Note.* VERIFIER: verdict NOT A DEFECT survives unchanged. Correction to method, not to verdict: the row proved the single-mount-site claim with a working-tree 'grep -rn frontend/src', which is not a tree check and would have been grounds to reject the row. I redid it as an exhaustive scan of every blob under frontend/src at 6e9e4739 and again at HEAD, and the claim holds at both. CLAUDE.md was also re-read from the V7 blob [...]

**Q-20, NOT A DEFECT.** vocabulary.ts:73 carries U+2019 inside a prohibited-phrase entry; the phrase is the platform's own wording and is quoted verbatim by convention.

*Evidence.* SOURCE CONCLUSION CONFIRMED, not inferred: docs/QUALITY_CHARTER.md:182 disposition reads 'NOT A DEFECT for the quoted phrase; replacement normalised'. TREE AT V7: git show 6e9e4739:frontend/src/lib/i18n/vocabulary.ts | sed -n '73p' -> " { phrase: 'be awarded to player’s accounts', replacement: 'appear in player’s accounts' },", both sides already U+2019. git log --oneline -- frontend/src/lib/i18n/vocabulary.ts -> exactly one commit, 'ffe0ca8 fix(R2R JOB 6): one social vocabulary layer, and a scan that actually scans'. git merge-base --is-ancestor ffe0ca8 6e9e4739 -> exit=0. STRAIGHT-APOSTROPHE FORM AT V7: git show 6e9e4739:frontend/src/lib/i18n/vocabulary.ts | sed -n '38,44p' -> the only straight-quote occurrence is inside the file header comment, [...]

*Note.* VERIFIER: verdict NOT A DEFECT survives unchanged, and the row's secondary observation survives too. Both were re-derived rather than accepted: the single-commit file history plus the ancestry exit code plus the V7 blob at line 73 together mean the 'replacement normalised' clause describes a state, not an action. Q-29 at charter line 201 already says exactly that, so this is confirmation of an acknowledged [...]

**Q-21, OPEN.** translations.ts key locationRestricted exists in all sixteen locales and is rendered by no component; dead bundle weight, live defect if a region gate is ever wired to it.

*Evidence.* git log --oneline -S'locationRestricted' -- frontend/src/lib/i18n/translations.ts -> only '2dfc061 feat(frontend): implement 16 languages and 43 currency formatters', the introducing commit; no deletion and no wiring commit. STILL OPEN AT HEAD: git show HEAD:frontend/src/lib/i18n/translations.ts | grep -c 'locationRestricted' -> 17, and the same count at 6e9e4739 -> 17 (interface declaration at :94 plus sixteen locale values at :253, 330, 407, 484, 561, 638, 715, 792, 869, 946, 1023, 1100, 1177, 1254, 1331, 1408). NO RENDER SITE: exhaustive scan of every blob under frontend/src at 6e9e4739 and again at HEAD -> the single hit at both revisions is frontend/src/lib/i18n/translations.ts itself. git grep -n 'locationRestricted' HEAD across the whole [...]

*Note.* VERIFIER: verdict OPEN survives unchanged. Correction to method: the row proved 'no .ts module references it either' with a working-tree grep, which I replaced with a per-blob scan of all 86 frontend/src files at both 6e9e4739 and HEAD. I also widened to the whole repository, which the row did not do; the two extra hits are the charter row and an archived prompt, neither a render site, so the finding is not [...]

**Q-22, SHIPPED IN V7.** Four DEV-gated glyphs (paint palette, down arrow, up-down arrow, check mark) survived tree-shaking into the production bundle as string literals.

*Evidence.* DEFECTIVE FORM BEFORE: git show 3e676a1^:frontend/src/App.svelte | sed -n '1910,1930p' -> line 1917 ' >\U0001F3A8</button>' and line 1927 " >{$reelMode === 'drop' ? '⬇' : '⇅'}<span class=\"reel-mode-label\">{$reelMode}</span></button>". FIXED FORM AT V7: same range at 6e9e4739 -> line 1917 ' >THEME</button>' and line 1927 ' ><span class=\"reel-mode-label\">{$reelMode}</span></button>'. git show 6e9e4739:frontend/src/lib/components/ThemeSelector.svelte | sed -n '40,70p' -> line 54 '<span class="check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13l4.5 4.5L19 7" /></svg></span>'. DEFECTIVE FORM ABSENT: exhaustive codepoint scan of all 86 blobs under frontend/src at 6e9e4739 for U+1F3A8, U+2B07, U+21C5 and U+2713 -> exactly one hit, [...]

*Note.* VERIFIER: verdict SHIPPED IN V7 survives unchanged. This was the row most worth attacking and it holds. I did not reuse the row's scan; I re-ran the four-codepoint sweep over every blob in the V7 frontend/src tree myself and got the same single residual, and it really is inside a Svelte markup comment, not a rendered node. Two caveats I confirmed rather than took on trust: svelte.config.js at V7 sets no [...]

**Q-23, SHIPPED IN V7.** The Q-15 font fix regressed the boot progress label: Orbitron leads, the monospace fallback never participates, and tabular-nums is inert against Orbitron, so the 0 to 100 percentage shifted as it counted.

*Evidence.* REPRODUCED INDEPENDENTLY. git log --oneline -S'min-width: 3ch' -- frontend/src/lib/components/LoadingScreen.svelte => '9cea6b2 fix(verify): the boot percentage stops jittering, a regression this session introduced'. git log --oneline -S'calc(3ch + 0.6em)' -- same path => '7acc319 docs(verify): the last four verifications, the blind spot counted, and Q-23 corrected again'. git merge-base --is-ancestor 9cea6b2 6e9e47392e009337aabded6ca3f19d198e1a9241 => exit 0; same for 7acc319 => exit 0. TREE AT V7, git show 6e9e4739:frontend/src/lib/components/LoadingScreen.svelte => '117: <p class="progress-label">{$tr('loadingDetail')} <span class="progress-pct">{$assetLoadProgress}</span>%</p>', '243: .progress-pct {', '244: display: inline-block;', '245: [...]

*Note.* VERIFIER: row SURVIVES UNCHANGED, verdict and fixing commits confirmed by my own tree inspection, not accepted on ancestry. Both corrections are in the V7 bundle. Also confirmed: the misleading font-family comment was corrected in place (V7 lines 214 to 223 carry the replacement text), and the inert font-variant-numeric: tabular-nums is deliberately left on .progress-label at V7 line 228 under a comment at 218 [...]

**Q-24, SHIPPED IN V7.** Every font-variant-numeric: tabular-nums declaration is inert because Orbitron ships no GSUB features and therefore no tnum, including .fs-num on the win count-up. Raised as TR-089.

*Evidence.* REPRODUCED INDEPENDENTLY. git merge-base --is-ancestor 0ff5022 6e9e47392e009337aabded6ca3f19d198e1a9241 => exit 0. git log --format='%h %ad %s' --date=iso -1 0ff5022 => '0ff5022 2026-07-28 00:54:48 +1000'; same for 6e9e4739 => '6e9e473 2026-07-28 01:20:39 +1000', so the boxing landed 26 minutes before the build sha. TREE AT V7, git show 6e9e4739:frontend/src/lib/components/WinBanner.svelte => '198: $: amountLabel = formatBalance(Math.round(displayAmount * CURRENCY_SCALE), $currencyCode || 'USD')', '201: $: amountChars = [...amountLabel].map((c) => ({ c, digit: c >= '0' && c <= '9' }))', '299: {#each amountChars as ch}<span class="c1-ch" class:c1-digit={ch.digit}>{ch.c}</span>{/each}', '411: .c1-amount .c1-digit { display: inline-block; width: [...]

*Note.* VERIFIER: verdict SHIPPED IN V7 SURVIVES, and I re-ran the tree check rather than trusting ancestry. CORRECTED the prior note on one point: it asserted 'eighteen is right'. It is not. Eighteen is a grep artifact. Sixteen spaced matches plus two minified matches equals eighteen, but one spaced match is the explanatory comment at LoadingScreen.svelte:114, so there are SEVENTEEN live declarations. It follows that the [...]

**Q-25, OPEN.** The Q-11 WinPod fix routed player money through formatBalance(), correct for format but it adds a currency symbol and separators, so the string got longer inside a box that is still 99px with white-space: nowrap and no fit action.

*Evidence.* REPRODUCED INDEPENDENTLY. HEAD, grep -n on frontend/src/lib/components/WinPod.svelte => '3: import { formatBalance, CURRENCY_SCALE } from '../utils/currency'', '15: ? formatBalance(Math.round($winAmount * CURRENCY_SCALE), $currencyCode || 'USD')', '82: width: 99px;', '93: white-space: nowrap;', '102: width: 99px;', '113: white-space: nowrap;'. The only other hit for autofit|clamp|overflow is '12: // is exactly the input that overflows. Now the one canonical formatter, like', a prose comment, so no fit action exists. V7 IDENTICAL: git show 6e9e4739:frontend/src/lib/components/WinPod.svelte returns the same six lines at the same numbers. git log --oneline -- frontend/src/lib/components/WinPod.svelte => newest is '3e676a1 feat(JOB 1a): the quality [...]

*Note.* VERIFIER: row SURVIVES UNCHANGED. Confirmed still open at HEAD by tree inspection, and identical at V7, so nothing about it can be blamed on the bundle. The tracker reads more closed than the code is: TR-087's status cell says 'FIXED, awaiting live re-capture' but its own finding text names the 99px overflow, and only the formatting half was done. The live re-capture it waits on is precisely the thing that would [...]

**Q-26, OPEN.** The Q-12 letter-x versus multiplication-sign fix was not swept to the class: player-visible x instances survive in fsModes.ts blurbs and social blurbs.

*Evidence.* REPRODUCED INDEPENDENTLY. HEAD, grep -n on frontend/src/lib/config/fsModes.ts => "87: blurb: 'Double-chance: about 1.6x the feature trigger rate. Debits 1.25x every spin while ON.',", "88: socialBlurb: 'Double-chance: about 1.6x the feature trigger rate. Costs 1.25x every spin while ON.',", "110: blurb: 'Buy a rich entry with the Overdrive meter pre-revved to 5x.',", "111: socialBlurb: 'Get a rich entry with the Overdrive meter pre-revved to 5x.',". V7 IDENTICAL: git show 6e9e4739:frontend/src/lib/config/fsModes.ts returns the same four lines at the same numbers. Both trees also show the correct glyph in use in the same file, '135:export const FS_MAX_WIN_LABEL = '5,000×'' and '154: return social ? `${FS_MAX_WIN_LABEL} base play` : [...]

*Note.* VERIFIER: row SURVIVES UNCHANGED, and I confirm the undercount it raises. The charter says 'Four more player-visible instances: 1.6x, 1.25x twice, and 5x'. The tree shows SIX occurrences on four lines, because each blurb has a socialBlurb twin carrying the same glyph: 1.6x twice, 1.25x twice, 5x twice. A sweep that fixes four strings leaves two behind.

**Q-27, OPEN.** The Q-13 fix removed only the font-family line from the Vite scaffold block in app.css and left the rest: color-scheme, the #242424 background, the stock indigo link colours and the flex/place-items body centring.

*Evidence.* REPRODUCED INDEPENDENTLY. HEAD, grep -n on frontend/src/app.css => '82: font-family: 'Orbitron', system-ui, Avenir, Helvetica, Arial, sans-serif;' (the Q-13 fix), '86: color-scheme: light dark;', '88: background-color: #242424;', '98: color: #646cff;', '102: color: #535bf2;', '107: display: flex;', '108: place-items: center;', '141: border-color: #646cff;', '148:@media (prefers-color-scheme: light) {'. V7 IDENTICAL: git show 6e9e4739:frontend/src/app.css returns the same nine lines at the same numbers. git log --oneline -S'#646cff' -- frontend/src/app.css => '31fdbcf feat(frontend): scaffold Svelte 5 Vite project', the scaffold commit itself, and nothing since.

*Note.* VERIFIER: row SURVIVES UNCHANGED. Confirmed open at HEAD and identical at V7. I also confirm the two extras the prior row flagged and the charter does not name: 'border-color: #646cff' at line 141, a third instance of the stock indigo, and the whole '@media (prefers-color-scheme: light)' block opening at line 148, the scaffold's light-theme override. So the residue is larger than the five items Q-27 enumerates.

**Q-28, OPEN.** The explanatory HTML comments added to frontend/index.html ship into dist/index.html because Vite does not strip comments from the entry template.

*Evidence.* REPRODUCED INDEPENDENTLY. HEAD, grep -n '<!--' frontend/index.html => '5: <!-- R12: the Vite starter favicon is replaced by the studio hero icon' and '9: <!-- The PRE-HYDRATION tab title: what a player's browser tab reads from'. V7 IDENTICAL: git show 6e9e4739:frontend/index.html returns the same two comments at lines 5 and 9. Origin: git log --oneline -S'PRE-HYDRATION' -- frontend/index.html => '4345b9e docs(JOB 2): the three root documents brought to HEAD, and every fix-list row dispositioned'; git log --oneline -S'R12: the Vite starter favicon' -- frontend/index.html => '3128e6e fix(R12): evidence hygiene - splash on cold load, hero favicon, disclosure sticky, audio parked'. Neither has been removed since. dist is not tracked: git ls-files [...]

*Note.* VERIFIER: row SURVIVES UNCHANGED. Confirmed at the SOURCE template, which is the only place it can be confirmed, since frontend/dist is untracked and cannot be inspected at a sha. Vite copies entry-template comments through unconditionally, so source presence at V7 means dist presence in the V7 bundle. Flagging the one soft edge honestly: this is the single row in the group whose defect is inferred from a build-tool [...]

**Q-29, OPEN.** Three of the charter's own claims were found loose: the Q-20 row describes a state as if it were an action, Q-08 cites a French string that Q-21 records as dead, and section 5.1's every-seed-was-real claim is not exactly true of the dropped-apostrophe seed.

*Evidence.* INTEGRATOR RESOLUTION, the two adversarial verifier runs disagreed on this row and it was settled by reading the source rather than by vote. docs/QUALITY_CHARTER.md:424 at HEAD still reads 'So every seed in this gate's self-test is a string that was actually in the repository at HEAD 3f0d686 before this pass fixed it', with no qualification. Q-29's own disposition at :201 says 'the sentence is what is qualified'. The sentence is not qualified. git diff --name-only 6e9e4739..HEAD -- docs/QUALITY_CHARTER.md returns 0, so the HEAD state is the V7 state. The seed is confirmed de-accented at frontend/scripts/machine_tell_gate.mjs:540, 'Votre session n a pas pu etre verifiee.'

*Note.* INTEGRATOR: verdict set to OPEN. Q-29 reproduces the exact defect it names in Q-20, a disposition that describes a state as if it were an action. Two readings exist and both are given: on the generous reading the table row IS the correction and it shipped; on the row's own words the 5.1 sentence was qualified, and it was not. Recorded OPEN because the narrower claim is the one the row makes. Raised as a new tracker [...]

**Q-30, SHIPPED IN V7.** LOADING CYBERNETICS rendered untranslated on the boot screen in every locale, and locale_completeness_check.mjs printed PASS over it because the literal shared its line with an interpolation.

*Evidence.* Fixing commit confirmed by string search, not by trusting the row: git log --oneline -S'loadingDetail' -- frontend/src/lib/components/LoadingScreen.svelte frontend/src/lib/i18n/translations.ts -> exactly one commit, "8f1e5ce fix(rule 10): the boot flavour line is translated, clearing the red on main". Ancestry re-run: git merge-base --is-ancestor 8f1e5ce 6e9e4739 -> exit 0 ("8f1e5ce ANCESTOR-OF-V7 yes"). TREE RE-RUN AT V7, fixed form PRESENT: git show 6e9e4739:frontend/src/lib/components/LoadingScreen.svelte | grep -n 'loadingDetail' -> "117: <p class=\"progress-label\">{$tr('loadingDetail')} <span class=\"progress-pct\">{$assetLoadProgress}</span>%</p>". Defective form ABSENT, checked repo-wide not just in the component: git grep -n 'LOADING [...]

*Note.* VERIFIER: row SURVIVES UNCHANGED. Every claim reproduced. The note's correction to the charter also holds: git merge-base --is-ancestor 37e43a5 6e9e4739 -> exit 0 ("37e43a5 ancestor YES", subject "feat(TR-091): the locale gate can see inside an interpolation, and the 19 it found are frozen"), and at V7 git show 6e9e4739:frontend/scripts/locale_completeness_check.mjs | grep -n 'inside an [...]

**Q-31, OPEN.** A read-only research pass dirtied five committed evidence files because social_string_conformance.mjs and social_dom_conformance.mjs write straight into committed evidence directories; recorded as TR-090.

*Evidence.* No fix exists on main. Searched four ways: git log --oneline --grep='TR-090' -> only the two recording commits 7acc319 and c2fba83, neither touching the scripts; git log --oneline --grep='Q-31' -> only c2fba83; git log --oneline -S'evidenceDir' -- frontend/scripts/social_string_conformance.mjs frontend/scripts/social_dom_conformance.mjs -> EMPTY; full file history is 906d96c, 54544e4, c5acf65 for the string script and ffe0ca8 for the dom script, all predating the finding. Defect present at V7: git show 6e9e4739:frontend/scripts/social_string_conformance.mjs -> "22:const OUT_DIR = join(__dirname, '..', '..', 'reports', 'qa')", "23:const SCREENS_DIR = join(__dirname, '..', '..', 'reports', 'screens', 'social-strings-item-c')", "161: const outPath = [...]

*Note.* VERIFIER: verdict OPEN SURVIVES, evidence CORRECTED on one point. The row wrote "At HEAD (6167b4c) both are unchanged and additionally write screenshots", which reads as though the screenshot writes are a post-V7 addition. They are not. SCREENS_DIR is already at V7 in both scripts (string script :23, :25, :113, :119; dom script :57, :59 and five page.screenshot calls), and git diff --stat between V7 and HEAD for [...]

**Q-32, SHIPPED IN V7.** The locale gate blind spot counted at 14 render sites of player-visible hardcoded English, including the six stake.us prohibited-term strings hidden inside ternary interpolations.

*Evidence.* Ancestry re-run for the whole chain, each returning exit 0: "37e43a5 ancestor YES", "e1dc213 ancestor YES" (ratchet 1/4, BET and PLAY ternaries), "d81feb1 ancestor YES" (2/4, win flash), "1b98cf8 ancestor YES" (3/4, duplicated HUD constants deleted), "bac74d8 ancestor YES" (4/4). TREE RE-RUN AT V7, all four shapes. Defective form ABSENT: git show 6e9e4739:frontend/src/lib/components/FeatureMenu.svelte | grep -nE "'GET FEATURES'|'BUY FEATURES'|'PLAY MODES'|'BET MODES'" -> no literal hits; the only matches are the fixed form, "459: <div class=\"fm-section-label\">{$tr('buyFeaturesHeading')}</div>" and "509: <button class=\"fm-info-btn\" ... >{$tr('betModesHeading')}</button>". Keys exist: translations.ts at V7 ":105 buyFeaturesHeading: string", ":260 [...]

*Note.* VERIFIER: row SURVIVES UNCHANGED, including its PARTIAL note, which I independently reproduced and which the owner should read as the operative caveat. Twelve of the fourteen are burned and in V7. The two the charter's own table row calls "Uppercase amid lowercase prose | 2 | Already carried in the parked Q-16 list" are still hardcoded English at BOTH trees: git show [...]

**Q-33, OPEN.** The Q-16 park is incomplete: aria-label="Menu" at four HudOverlay layout branches and the speed-tier title interpolation at four branches are missing from 4.3's self-described complete list.

*Evidence.* Still open at HEAD, confirmed by direct tree inspection. git diff --stat 6e9e4739 HEAD -- frontend/src/lib/components/HudOverlay.svelte -> EMPTY, so V7 and HEAD are byte identical here. Defective form PRESENT at both: git show HEAD:frontend/src/lib/components/HudOverlay.svelte | grep -n 'aria-label="Menu"' -> "385: ... class=\"p-round-btn\" ... aria-label=\"Menu\"", "503: ... m-round-btn ... data-testid=\"mini-menu\"", "612: ... c-round-btn ...", "774: ... class=\"fs-menu\" ...", and the same four line numbers at 6e9e4739. Speed tier: grep -n 'title=' at HEAD -> lines 425, 522, 679, 756, each "title={$speedTier === 'normal' ? 'Normal speed' : $speedTier === 'turbo' ? 'Turbo' : 'Super Turbo'}", with data-speed={$speedTier} on the preceding element [...]

*Note.* VERIFIER: verdict OPEN SURVIVES. One evidence transcription CORRECTED. The row quotes the gate's scope regex as /^[A-Z][A-Z0-9 &'.,!?:%x+-]*$/ with a plain letter x. The actual character at V7 is the multiplication sign: git show 6e9e4739:frontend/scripts/locale_completeness_check.mjs | sed -n '214,221p' -> "if (!/^[A-Z][A-Z0-9 &'.,!?:%×+-]*$/.test(t)) return false // caps, digits, punctuation only". The substantive [...]

**Q-34, SHIPPED IN V7.** CSS text-transform: uppercase on the HUD mode badge made the same mode read Cruise on three surfaces and CRUISE on a fourth; the sibling fsModes casing finding was refuted as never a defect.

*Evidence.* Ancestry re-run: git merge-base --is-ancestor 6305bc2 6e9e4739 -> exit 0 ("6305bc2 ANCESTOR-OF-V7 yes"). The commit's own diff removes exactly three declarations, "- letter-spacing:.1em; text-transform:uppercase; white-space:nowrap;" plus two "- text-transform: uppercase;", replacing each with the TR-092 comment. TREE RE-RUN AT V7, defective form ABSENT from all three rules and fixed form PRESENT. git show 6e9e4739:frontend/src/lib/components/HudOverlay.svelte | sed -n '1223,1233p' -> .fs-mode-badge body carries "letter-spacing:.1em; white-space:nowrap;" then "/* text-transform: uppercase REMOVED 2026-07-28 (TR-092) ... */" and no text-transform. Same at .p-mode-badge (rule opens :1869, comment :1876, no text-transform through :1885) and [...]

*Note.* VERIFIER: row SURVIVES UNCHANGED. Both halves of the note independently confirmed. The charter is stale as claimed: docs/QUALITY_CHARTER.md at HEAD still ends the Q-34 section with "**OPEN.** It is a one-property fix in either direction, but which direction is an art call". The closing commit exists and is in the bundle: "7e9dac2 docs: session report and archive copy, TR-091 and TR-092 closed", git merge-base [...]

**TR-086, OPEN.** The mini strip clips the BALANCE with no ellipsis below about 390 css px, so EUR 479,710.00 renders as a truncated compact form.

*Evidence.* git log --oneline --all --grep='TR-086' returns ONE commit only: '4345b9e docs(JOB 2): the three root documents brought to HEAD, and every fix-list row dispositioned'. git diff --stat 6e9e4739 HEAD lists no frontend/ path (only checks.yml, CLAUDE.md, OWNER_CHECKLIST.md, WRS_MASTER_DOCUMENT.md, docs/, games/README.md, reports/, utils/), and git diff --stat 6e9e4739 HEAD -- frontend/ is empty, so V7 and HEAD are byte identical here. Tree at V7, frontend/src/lib/actions/fitMoney.ts: ':51 export const MINI_LEGIBLE_FLOOR_PX = 9' and \":113 let mode: 'full' | 'compact' = 'full'\" with ':120 mode = compact' the last rung. grep for 'ellipsis' in that file returns nothing at V7 or HEAD; HudOverlay.svelte:1028 at HEAD reads '/* NO text-overflow: ellipsis. The [...]

*Note.* VERIFIER: verdict OPEN survives and I reproduced every tree check. One evidence correction: the prior row claimed the TR-086 grep returns two doc commits including 0697097. It does not. 0697097 exists but is 'docs(round 3): the bet size question, answered from the platform's own payload' and git show 0697097 | grep -c 'TR-086' returns 0, so it is not a TR-086 commit at all. Substance unchanged: no fix on main, open [...]

**TR-087, SHIPPED IN V7.** Replay win pod rendered player money with .toFixed(2), no separators and no currency symbol, in a fixed 99px zone.

*Evidence.* git log --oneline -S'formatBalance' -- frontend/src/lib/components/WinPod.svelte returns exactly '3e676a1 feat(JOB 1a): the quality charter, the machine-tell sweep, and the gate that holds it'. git merge-base --is-ancestor 3e676a1 6e9e4739 exits 0 (3e676a1 ANCESTOR-OF-V7). Tree at V7, git show 6e9e4739:frontend/src/lib/components/WinPod.svelte: \":3 import { formatBalance, CURRENCY_SCALE } from '../utils/currency'\" and \":15 ? formatBalance(Math.round($winAmount * CURRENCY_SCALE), $currencyCode || 'USD')\". The defective money form is ABSENT as code: ':7 // Was `$winAmount.toFixed(2)`' is a comment. Gate at V7: machine_tell_gate.mjs:394 \"klass: 'money-tofixed'\", :552 \"name: 'money-tofixed.svelte'\", :27 the class docstring. Charter at V7: [...]

*Note.* VERIFIER: verdict SHIPPED IN V7 survives, tree check reproduced independently. One evidence correction: the prior row said the toFixed form survives 'never as code'. A .toFixed DOES remain as live code at WinPod.svelte:6, '$: multText = $winMultiplier > 0 ? `${$winMultiplier.toFixed(1)}x` : \"\"'. It is a MULTIPLIER, not money, and it is exactly the machine_tell_gate negative control, so it is not the defect; but [...]

**TR-088a, SHIPPED IN V7.** Part 1 of 2, the deletion itself: nine non-shipping upstream sample packages removed from games/, plus the Makefile test_run target and a new games/README.md.

*Evidence.* git merge-base --is-ancestor 1e5f903 6e9e4739 exits 0 (1e5f903 ANCESTOR-OF-V7). git show 1e5f903 --stat ends '93 files changed, 89 insertions(+), 8779 deletions(-)'. Tree at V7: git ls-tree --name-only 6e9e4739:games/ returns exactly two entries, 'README.md' and 'future_spinner'. git show 6e9e4739:games/README.md line 3 reads '**`future_spinner/` is the shipping maths package. It is the only one, and it is locked.**'. git show 6e9e4739:Makefile | grep -n test_run returns only ':44 # test_run REMOVED 2026-07-28 (TR-088). It iterated TEST_NAMES, the six upstream' and ':47', both comment lines, so no live target remains.

*Note.* VERIFIER: unchanged. Every check reproduced, including the two-entry ls-tree and the commented-out Makefile target. This is the half a reviewer of the V7 kit actually sees and it is complete and correct at the V7 tree.

**TR-088b, FIXED POST-V7.** Part 2 of 2, the follow-up correction: six developer utilities under utils/ whose example defaults still named the packages part 1 deleted.

*Evidence.* git merge-base --is-ancestor 6167b4c 6e9e4739 exits NON-ZERO (6167b4c NOT-ancestor); 6167b4c is HEAD of main, seven commits after V7. Every dangling default confirmed present at the V7 tree by me: utils/analysis/challenge_sheets.py:191 'default=\"0_0_lines\"'; utils/decompress_zstd.py:36 'games/0_0_lines/library/publish_files/books_base.jsonl.zst'; utils/get_file_hash.py:6 and :11 '../games/0_0_ways/library/...'; utils/merge_luts/merge_lookups.py:63 'GAME_ID = \"0_0_lines_feature_match\"'; utils/search_tool/forcetool_example.py:32 'game_id = \"0_0_lines\"'; utils/analysis/plot_distribution.py:59 '# run(\"0_0_scatter\", \"bonus\", [1, 2])'. Fix IS present at HEAD: the same six read future_spinner (challenge_sheets.py:191, decompress_zstd.py:38, [...]

*Note.* VERIFIER: unchanged, and this is the split the brief warned about. Confirmed both directions: non-ancestor by merge-base, defect present at V7, fix present at HEAD. V7 therefore ships four executable utility defaults that fail on first run (decompress_zstd.py, analysis/challenge_sheets.py, search_tool/forcetool_example.py, merge_luts/merge_lookups.py) plus two stale doc references. Nothing player-facing: upstream [...]

**TR-089, SHIPPED IN V7.** Every font-variant-numeric: tabular-nums declaration is inert against the shipped Orbitron, including the one on the win count-up.

*Evidence.* git log --oneline --grep='TR-089' returns '0ff5022 fix(TR-089): the win count-up stops dancing, measured at the shipped font's real advances' plus two docs commits. git merge-base --is-ancestor 0ff5022 6e9e4739 exits 0 (0ff5022 ANCESTOR-OF-V7). Tree at V7, git show 6e9e4739:frontend/src/lib/components/WinBanner.svelte:411 '.c1-amount .c1-digit { display: inline-block; width: 0.834em; text-align: center; }', derivation comment at :406, and the markup that uses it at :299 '{#each amountChars as ch}<span class=\"c1-ch\" class:c1-digit={ch.digit}>{ch.c}</span>{/each}'. Gate at V7: git show 6e9e4739:frontend/scripts/win_countup_steady_gate.mjs opens 'win_countup_steady_gate.mjs: the win count-up does not dance as it rolls.' and V7 [...]

*Note.* VERIFIER: unchanged, and I checked the arithmetic the prior row took on trust. Counting occurrences of 'font-variant-numeric: tabular-nums' across every file under frontend/src at the V7 tree gives 18, so 'seventeen others remain inert' is exactly right once the count-up's own declaration is subtracted. They are spread over ten components (BonusInstrumentColumn, BuyBonus, FeatureMenu, HudOverlay x4, LoadingScreen [...]

**TR-090, OPEN.** Two proof scripts write straight into committed evidence directories, and a read-only agent pass tripped one by running it.

*Evidence.* git log --oneline --all --grep='TR-090' returns only the two recording commits, 7acc319 docs(verify) and c2fba83 docs(verify), no fix. Tree at V7: git show 6e9e4739:frontend/scripts/social_string_conformance.mjs | grep -c evidencePaths returns 0, same for social_dom_conformance.mjs. At HEAD, grep -c evidencePaths on both returns 0. git diff --stat 6e9e4739 HEAD -- frontend/scripts/social_string_conformance.mjs frontend/scripts/social_dom_conformance.mjs is EMPTY, so V7 and HEAD are the same files. At HEAD social_string_conformance.mjs:22 'const OUT_DIR = join(__dirname, \"..\", \"..\", \"reports\", \"qa\")', :23 SCREENS_DIR reports/screens/social-strings-item-c, :24 and :25 mkdirSync on both, writing at :113, :119 and :162. Contrast: grep -ln [...]

*Note.* VERIFIER: verdict OPEN survives at V7 and at HEAD. One evidence correction: the prior row said social_dom_conformance.mjs 'writes the same tree'. It shares reports/qa (:56) but its screens directory is reports/screens/social-dom-conformance (:57), not social-strings-item-c, and it writes at :162, :170, :194, :217, :235 and :341. Same class, different tree. Second open half confirmed rather than taken on trust: the [...]

**TR-091, SHIPPED IN V7.** The locale gate could not see player-visible English inside an interpolation, hiding 14 render sites including six stake.us prohibited-term strings.

*Evidence.* git log --oneline --grep='TR-091' returns five fix commits: 37e43a5 feat, then ratchets e1dc213, d81feb1, 1b98cf8, bac74d8. git merge-base --is-ancestor exits 0 for all five against 6e9e4739. Tree at V7: locale_completeness_check.mjs:117 'const KNOWN_DEBT = new Set([' with :118 '// EMPTY. Every entry frozen on 2026-07-27 has been burned by the ratchet:'; the widened reader at :262 'function interpolatedStrings(markup)' and :385 '// (B) literals written inside an interpolation, including player attributes'; block tags excluded at :267 '// SVELTE BLOCK TAGS ARE LOGIC, NOT TEXT.' with the control string at :509. Defective forms ABSENT at V7: FeatureMenu.svelte has no quoted 'GET FEATURES', 'BUY FEATURES', 'PLAY MODES' or 'BET MODES' literal; [...]

*Note.* VERIFIER: verdict SHIPPED IN V7 survives, all five ancestries and every tree check reproduced. Two citation corrections. (1) The prior row wrote 'fsModes.ts:195' with no path; the file is frontend/src/lib/config/fsModes.ts, and there is no frontend/src/lib/stores/fsModes.ts at V7, so a reader following that path gets 'fatal: path does not exist'. Line 195 is correct at the real path. (2) The residual FeatureMenu [...]

**TR-092, SHIPPED IN V7.** The mode badge rendered CRUISE on the HUD while three other surfaces rendered Cruise from the same modeLabel() source, driven by CSS text-transform.

*Evidence.* git log --oneline --grep='TR-092' returns '6305bc2 fix(TR-092): the HUD stops shouting the mode name, and class 4 gets its first gate' plus one docs commit. git merge-base --is-ancestor 6305bc2 6e9e4739 exits 0 (6305bc2 ANCESTOR-OF-V7). Tree at V7, git show 6e9e4739:frontend/src/lib/components/HudOverlay.svelte | grep -n text-transform returns eight lines: 1000, 1198, 1226, 1716, 1793, 1876, 2126, 2197. I then read the enclosing selector for each. The three inside mode-badge rules are all the comment '/* text-transform: uppercase REMOVED 2026-07-28 (TR-092)': :1226 under '.fs-mode-badge{' at :1223, :1876 under '.p-mode-badge {' at :1869, :2197 under '.c-mode-badge {' at :2190. The five live declarations sit on other selectors: :1000 .m-stat-label, [...]

*Note.* VERIFIER: unchanged. The prior row asserted the five surviving declarations are on other selectors without showing it; I read the enclosing rule for all eight lines and confirm it. Clean close: the transform was dropped so the HUD matches the specification spelling Cruise, held by the new cross-surface-casing class in the static job. The NOT A DEFECT sub-claim is the source's own conclusion, not an inference: [...]

**FROZEN-01, SHIPPED IN V7.** src/lib/components/FeatureMenu.svelte|BUY FEATURES: the real-money branch of a hand-rolled social ternary, hardcoded English in all sixteen locales.

*Evidence.* Reproduced independently. git log --oneline -S'buyFeaturesHeading' -- frontend/src/lib/components/FeatureMenu.svelte -> 'bac74d8 fix(TR-091 ratchet 4/4): the last eight burned, the frozen list is EMPTY'. git merge-base --is-ancestor bac74d8 6e9e4739 -> rc=0. Tree at V7: git show 6e9e4739:frontend/src/lib/components/FeatureMenu.svelte | grep -n 'buyFeaturesHeading' -> "459: <div class=\"fm-section-label\">{$tr('buyFeaturesHeading')}</div>". Defective form: grep -n "isSocial ?" on the same V7 file returns only 335 (an HTML comment), 372 and 427 (the lowercase 'per spin' / 'bet' cost suffix); no GET FEATURES or BUY FEATURES ternary. bac74d8 diff: "- <div class=\"fm-section-label\">{$isSocial ? 'GET FEATURES' : 'BUY FEATURES'}</div>" replaced by the tr [...]

*Note.* Burn type: routed through the tr layer with a NEW key buyFeaturesHeading, confirmed at V7 translations.ts as 18 occurrences (1 interface field at line 105, 16 locales, 1 SOCIAL_OVERRIDES entry at line 1868 reading 'GET FEATURES'). VERIFIER: row kept, verdict unchanged, evidence reproduced at the tree. One disclosure the original row omitted: the literal 'BUY FEATURES' still appears at V7 in FeatureMenu.svelte lines [...]

**FROZEN-02, SHIPPED IN V7.** src/lib/components/FeatureMenu.svelte|GET FEATURES: the social branch of the same ternary, also hardcoded English in all sixteen locales.

*Evidence.* Reproduced. git show bac74d8 -- frontend/src/lib/components/FeatureMenu.svelte shows exactly "- <div class=\"fm-section-label\">{$isSocial ? 'GET FEATURES' : 'BUY FEATURES'}</div>" and "+ <div class=\"fm-section-label\">{$tr('buyFeaturesHeading')}</div>". git merge-base --is-ancestor bac74d8 6e9e4739 -> rc=0. V7 tree: grep -n 'GET FEATURES' on git show 6e9e4739:frontend/src/lib/components/FeatureMenu.svelte -> no output. The social wording now lives at V7 translations.ts line 1868, "buyFeaturesHeading: 'GET FEATURES'," inside SOCIAL_OVERRIDES (declared line 1860).

*Note.* One ternary carried both FROZEN-01 and FROZEN-02. VERIFIER: row kept unchanged; I confirmed the social branch survives only as a SOCIAL_OVERRIDES value, not as component markup.

**FROZEN-03, SHIPPED IN V7.** src/lib/components/FeatureMenu.svelte|BET MODES: the real-money branch of the footer button ternary, hardcoded English in all sixteen locales.

*Evidence.* Reproduced. git log --oneline -S'betModesHeading' -- frontend/src/lib/components/FeatureMenu.svelte -> 'bac74d8 ...'. merge-base --is-ancestor bac74d8 6e9e4739 -> rc=0. V7 tree grep: "509: <button class=\"fm-info-btn\" on:click={openBetModesInfo} data-testid=\"open-bet-modes-info\">{$tr('betModesHeading')}</button>". Defective form absent: no 'PLAY MODES' hit at all, and the only 'BET MODES' hits are 724 and 735, which sed shows sitting inside a /* */ CSS comment block. bac74d8 diff confirms the removed line was the ternary form of line 509.

*Note.* New translated key betModesHeading, 18 occurrences at V7 translations.ts (interface, 16 locales, 1 social override). VERIFIER: row kept unchanged; the lines 724 and 735 comment claim checks out, I read the surrounding block.

**FROZEN-04, SHIPPED IN V7.** src/lib/components/FeatureMenu.svelte|PLAY MODES: the social branch of the same footer button ternary.

*Evidence.* Reproduced. git show bac74d8 -- frontend/src/lib/components/FeatureMenu.svelte: "-...data-testid=\"open-bet-modes-info\">{$isSocial ? 'PLAY MODES' : 'BET MODES'}</button>" replaced by "+...>{$tr('betModesHeading')}</button>". merge-base --is-ancestor bac74d8 6e9e4739 -> rc=0. V7 tree: grep -n 'PLAY MODES' on the V7 FeatureMenu.svelte -> no output; line 509 carries the tr call.

*Note.* Same ternary as FROZEN-03. VERIFIER: row kept unchanged, diff and tree both reproduced.

**FROZEN-05, SHIPPED IN V7.** src/lib/components/FeatureMenu.svelte|BET: the bet label ternary {$isSocial ? 'PLAY' : 'BET'}, a hand-rolled copy of SOCIAL_OVERRIDES that dropped the locale swap.

*Evidence.* Reproduced. git show e1dc213 -- frontend/src/lib/components/FeatureMenu.svelte: "- <span class=\"fm-betlabel\">{$isSocial ? 'PLAY' : 'BET'}</span>" replaced by a five line explanatory comment plus "+ <span class=\"fm-betlabel\">{$tr('bet')}</span>". merge-base --is-ancestor e1dc213 6e9e4739 -> rc=0. V7 tree: grep -n on git show 6e9e4739:frontend/src/lib/components/FeatureMenu.svelte -> "340: <span class=\"fm-betlabel\">{$tr('bet')}</span>" and the only surviving ternary text at "335: <!-- Was `{$isSocial ? 'PLAY' : 'BET'}`, a hand-rolled copy of a layer".

*Note.* Routed through the existing tr layer reusing key bet. VERIFIER: row kept unchanged; line numbers 335 and 340 both confirmed at the V7 tree, and the surviving occurrence really is inside an HTML comment.

**FROZEN-06, SHIPPED IN V7.** src/lib/components/FeatureMenu.svelte|PLAY: the social branch of the same bet label ternary.

*Evidence.* Same commit and line as FROZEN-05, reproduced. merge-base --is-ancestor e1dc213 6e9e4739 -> rc=0. V7 tree FeatureMenu.svelte line 340 is {$tr('bet')}; grep for "'PLAY'" in that file at V7 returns only line 335, the comment. The e1dc213 message states the four entries burned were FeatureMenu.svelte:335 and MaxWinCelebration.svelte:119 in both branches.

*Note.* SOCIAL_OVERRIDES already maps bet to PLAY, so one tr call does the social swap and adds the fifteen missing locales. VERIFIER: row kept unchanged.

**FROZEN-07, SHIPPED IN V7.** src/lib/components/MaxWinCelebration.svelte|BET: the same {$isSocial ? 'PLAY' : 'BET'} duplicated layer on the max win screen.

*Evidence.* Confirmed by direct diff rather than by the row's -S handle. git show e1dc213 -- frontend/src/lib/components/MaxWinCelebration.svelte: "- <span class=\"c1-max-betlabel\">{$isSocial ? 'PLAY' : 'BET'}</span>" replaced by "+ <span class=\"c1-max-betlabel\">{t($locale, 'bet', localeMode)}</span>". merge-base --is-ancestor e1dc213 6e9e4739 -> rc=0. V7 tree: git show 6e9e4739:frontend/src/lib/components/MaxWinCelebration.svelte | grep -n -> "122: <span class=\"c1-max-betlabel\">{t($locale, 'bet', localeMode)}</span>" and the ternary only at "119: <!-- Was `{$isSocial ? 'PLAY' : 'BET'}`. Same duplicated layer as".

*Note.* Routed through the tr layer via t($locale, 'bet', localeMode), which consults SOCIAL_OVERRIDES first; localeMode is derived at line 17 from $isSocial. VERIFIER: verdict kept, evidence corrected. The row's search handle, git log -S"c1-max-betlabel\">{t($locale, 'bet'", is not a search I could reproduce as written; the broader git log --oneline -S'c1-max-betlabel' -- [...]

**FROZEN-08, SHIPPED IN V7.** src/lib/components/MaxWinCelebration.svelte|PLAY: the social branch of that same max win ternary.

*Evidence.* Same commit and line as FROZEN-07. merge-base --is-ancestor e1dc213 6e9e4739 -> rc=0. V7 tree: grep -n "'PLAY'" on git show 6e9e4739:frontend/src/lib/components/MaxWinCelebration.svelte returns only line 119, the explanatory HTML comment; line 122 is the t() call. The only other isSocial use in that file at V7 is line 125, aria-label={$isSocial ? 'Collect max prize' : 'Collect max win'}, which is sentence case and outside this gate's uppercase scope.

*Note.* Same ternary as FROZEN-07. VERIFIER: verdict kept. Same caveat as FROZEN-07 about the row's -S handle; attribution proved by the diff instead.

**FROZEN-09, SHIPPED IN V7.** src/lib/components/WinCelebration.svelte|WIN!: the small win flash {$isSocial ? 'PRIZE!' : 'WIN!'}, hardcoded English in all sixteen locales.

*Evidence.* Reproduced. git log --oneline -S'winFlash' -- frontend/src/lib/components/WinCelebration.svelte -> 'd81feb1 fix(TR-091 ratchet 2/4): the win flash becomes a translated key, 15 to 13'. merge-base --is-ancestor d81feb1 6e9e4739 -> rc=0. V7 tree: git show 6e9e4739:frontend/src/lib/components/WinCelebration.svelte | grep -n 'winFlash' -> "35: <div class=\"small-win-flash\">{$tr('winFlash')}</div>". Defective form: the same file piped to grep -n 'WIN!|PRIZE!' returns nothing, rc=1.

*Note.* New key winFlash rather than win plus punctuation, because the mark is not portable. VERIFIER: row kept unchanged, and the count claim checks out exactly. grep -o on the V7 translations.ts gives 18 occurrences of winFlash: interface field at line 40, sixteen locale tables (line 208 en 'WIN!' through line 1363 zh), and the SOCIAL_OVERRIDES entry at line 1864, "winFlash: 'PRIZE!',".

**FROZEN-10, SHIPPED IN V7.** src/lib/components/WinCelebration.svelte|PRIZE!: the social branch of the same win flash ternary.

*Evidence.* Reproduced. git show d81feb1 -- frontend/src/lib/components/WinCelebration.svelte: "- <div class=\"small-win-flash\">{$isSocial ? 'PRIZE!' : 'WIN!'}</div>" replaced by "+ <div class=\"small-win-flash\">{$tr('winFlash')}</div>", and "- import { isSocial } from '../stores/socialMode'" replaced by "+ import { tr } from '../i18n/tr'". merge-base --is-ancestor d81feb1 6e9e4739 -> rc=0. V7 tree line 35 carries the tr call and both literals are gone (grep rc=1).

*Note.* Same ternary as FROZEN-09; the isSocial import was dropped in favour of tr. VERIFIER: row kept unchanged, import swap confirmed in the diff and at the V7 tree (the V7 file imports only onDestroy and tr).

**FROZEN-11, SHIPPED IN V7.** src/lib/components/FeatureMenu.svelte|OFF: the enhancer toggle state {enhOn ? 'ON' : 'OFF'}, hardcoded English in all sixteen locales.

*Evidence.* Reproduced. git log --oneline -S'stateOff' -- frontend/src/lib/components/FeatureMenu.svelte -> 'bac74d8 ...'. Diff: "- >{enhOn ? 'ON' : 'OFF'}</button>" replaced by "+ >{enhOn ? $tr('stateOn') : $tr('stateOff')}</button>". merge-base --is-ancestor bac74d8 6e9e4739 -> rc=0. V7 tree: grep -n on the V7 FeatureMenu.svelte -> "451: >{enhOn ? $tr('stateOn') : $tr('stateOff')}</button>", and no hit for "enhOn ? 'ON'".

*Note.* Two new keys stateOn and stateOff. VERIFIER: row kept unchanged and the count claim verified: grep -o on V7 translations.ts gives 17 each, being the interface field (stateOn at line 103) plus sixteen locale tables, with no social override, which is right because ON and OFF are not prohibited terms.

**FROZEN-12, SHIPPED IN V7.** src/lib/components/SessionPanel.svelte|NET: the responsible-gambling session overlay rendering <span>NET {coinsWord}</span>.

*Evidence.* Reproduced. git log --oneline -S'sessionNet' -- frontend/src/lib/components/SessionPanel.svelte -> 'bac74d8 ...'. merge-base --is-ancestor bac74d8 6e9e4739 -> rc=0. V7 tree: git show 6e9e4739:frontend/src/lib/components/SessionPanel.svelte | grep -n 'NET' -> "86: <div class=\"sp-row\"><span>{$tr('sessionNet')} {coinsWord}</span>..." plus only comment hits at lines 6 and 111; no '>NET ' markup. Line 75 reads " $: coinsWord = $isSocial ? $tr('balance') : ''" with the explanatory comment at 71 to 73.

*Note.* New key sessionNet, 17 occurrences at V7 translations.ts (interface line 107 plus sixteen locales). The same commit fixed a second, unfrozen instance in the SCRIPT block, coinsWord, which a markup-only gate could never see. VERIFIER: row kept unchanged; both the markup fix and the script-block fix confirmed at the V7 tree.

**FROZEN-13, SHIPPED IN V7.** src/lib/components/BonusInstrumentColumn.svelte|OVERDRIVE FREE SPINS: rendered from HUD_LABEL_FREE_SPINS in fsModes.ts, a second copy of a string already translated in all sixteen locales.

*Evidence.* Reproduced. git log --oneline -S'overdriveFreeSpins' -- frontend/src/lib/components/BonusInstrumentColumn.svelte -> '1b98cf8 fix(TR-091 ratchet 3/4): the duplicated HUD constants are deleted, 13 to 10'. merge-base --is-ancestor 1b98cf8 6e9e4739 -> rc=0. V7 tree: git show 6e9e4739:frontend/src/lib/components/BonusInstrumentColumn.svelte | grep -n -> "68: <span class=\"pm-label\">{$tr('overdriveFreeSpins')}</span>" and "94: <span class=\"plate-label\">{$tr('overdriveFreeSpins')}</span>". Defective form: git grep -n 'HUD_LABEL_' 6e9e4739 -- frontend/src returns exactly one line, "frontend/src/lib/config/fsModes.ts:195:// REMOVED 2026-07-28 (TR-091): HUD_LABEL_FREE_SPINS and HUD_LABEL_TOTAL_WIN."

*Note.* The duplicate constant was deleted and both render sites, portrait and landscape, repointed at the existing key. VERIFIER: row kept unchanged; the line 1429 claim checks out, V7 translations.ts line 1429 reads " overdrive: 'OVERDRIVE', overdriveFreeSpins: 'OVERDRIVE FREE SPINS', freeSpins: 'FREE SPINS'," inside the en block of featureI18n.

**FROZEN-14, SHIPPED IN V7.** src/lib/components/BonusInstrumentColumn.svelte|TOTAL WIN: rendered from HUD_LABEL_TOTAL_WIN in fsModes.ts, likewise a second copy of an already translated string.

*Evidence.* Reproduced. git log --oneline -S"totalWin')" -- frontend/src/lib/components/BonusInstrumentColumn.svelte -> '1b98cf8 ...'. merge-base --is-ancestor 1b98cf8 6e9e4739 -> rc=0. V7 tree: grep -n on the V7 BonusInstrumentColumn.svelte -> "72: <span class=\"pm-label\">{$tr('totalWin')}</span>" and "99: <span class=\"plate-label\">{$tr('totalWin')}</span>". HUD_LABEL_TOTAL_WIN is absent under frontend/src at V7 except the removal note at fsModes.ts:195.

*Note.* VERIFIER: verdict SHIPPED IN V7 survives, but the row's count claim is WRONG and is corrected here. The row said totalWin appears 17 times in V7 translations.ts. grep -o '\\btotalWin\\b' on git show 6e9e4739:frontend/src/lib/i18n/translations.ts returns 19, and grep -n lists them: line 117 an optional field on the Translations interface, line 183 the FeatureStrings key union, sixteen locale tables at 1430 through [...]

**FROZEN-15, SHIPPED IN V7.** src/lib/components/WinBreakdown.svelte|WILD: the symbol label record SYMBOL_LABELS held W: 'WILD' as hardcoded English.

*Evidence.* Reproduced. git log --oneline -S'symbolWild' -- frontend/src/lib/components/WinBreakdown.svelte -> 'bac74d8 ...'. merge-base --is-ancestor bac74d8 6e9e4739 -> rc=0. V7 tree: git show 6e9e4739:frontend/src/lib/components/WinBreakdown.svelte shows "15: const SYMBOL_IDS: Record<string, string> = {", "21: if (id === 'W') return t('symbolWild')" and "74: <span class=\"wb-symbol\">{symbolLabel(current.symbol, $tr)}</span>". Defective form: grep -n "SYMBOL_LABELS\|W: 'WILD'" on the V7 file returns nothing, rc=1. bac74d8 diff: "- L1: 'L1', L2: 'L2', L3: 'L3', W: 'WILD', S: 'SCATTER'," replaced by "+ L1: 'L1', L2: 'L2', L3: 'L3',".

*Note.* New key symbolWild. VERIFIER: row kept unchanged and the count verified: 17 occurrences at V7 translations.ts, interface line 108 plus sixteen locales, no social override. Worth knowing for anyone spot-checking: several locales legitimately keep the English word (line 1341 reads symbolWild: 'WILD'), which is a translation decision, not a missed key.

**FROZEN-16, SHIPPED IN V7.** src/lib/components/WinBreakdown.svelte|SCATTER: the same record held S: 'SCATTER' as hardcoded English.

*Evidence.* Reproduced. git log --oneline -S'symbolScatter' -- frontend/src/lib/components/WinBreakdown.svelte -> 'bac74d8 ...'. merge-base --is-ancestor bac74d8 6e9e4739 -> rc=0. V7 tree: "22: if (id === 'S') return t('symbolScatter')"; grep for "S: 'SCATTER'" at V7 returns nothing. The bac74d8 diff also replaced the render site "- <span class=\"wb-symbol\">{SYMBOL_LABELS[current.symbol.toUpperCase()] ?? current.symbol}</span>" with the symbolLabel call.

*Note.* New key symbolScatter, 17 occurrences at V7 translations.ts. VERIFIER: row kept unchanged.

**FROZEN-17, NOT A DEFECT.** src/lib/components/PaytableModal.svelte|WILD: flagged from {:else if sym.name === 'WILD'}, a Svelte block condition comparing against data.

*Evidence.* The source genuinely reaches this conclusion; it is not the reconciling agent's inference. git log -1 --format=%B bac74d8 contains verbatim: "TWO ENTRIES WERE REMOVED AS NOT A DEFECT, and the ratchet caught that itself. `{#if sym.name === 'SCAT'}` and `{:else if sym.name === 'WILD'}` in PaytableModal are Svelte block CONDITIONS comparing against data; they render nothing." merge-base --is-ancestor bac74d8 6e9e4739 -> rc=0. V7 gate: git show 6e9e4739:frontend/scripts/locale_completeness_check.mjs | grep -n -> "267: // SVELTE BLOCK TAGS ARE LOGIC, NOT TEXT. `{#if sym.name === 'SCAT'}` and" and "273: if (/^\\s*[#:/@]/.test(inner)) continue". V7 component unchanged: sed -n '229,231p' -> " {#if sym.name === 'SCAT'}" ... " {:else if sym.name === 'WILD'}". [...]

*Note.* The gate was reading branch logic as player-visible text. The entry was removed and block tags excluded, with a negative control pinning it; nothing in the component needed changing and nothing was changed. VERIFIER: row kept unchanged. I read the full bac74d8 message rather than trusting the quotation, and the NOT A DEFECT wording is the committer's own.

**FROZEN-18, NOT A DEFECT.** src/lib/components/PaytableModal.svelte|SCAT: flagged from {#if sym.name === 'SCAT'}, the matching Svelte block condition.

*Evidence.* Same source conclusion as FROZEN-17, read in full from git log -1 --format=%B bac74d8. merge-base --is-ancestor bac74d8 6e9e4739 -> rc=0. V7 gate KNOWN_DEBT is empty and says so: git show 6e9e4739:frontend/scripts/locale_completeness_check.mjs lines 117 to 127 read "const KNOWN_DEBT = new Set([" then " // EMPTY. Every entry frozen on 2026-07-27 has been burned by the ratchet:" ... " // two removed as NOT A DEFECT (Svelte block conditions comparing against" ... "])". The stale-entry check at line 432, const debtStale, still runs against it.

*Note.* VERIFIER: row kept unchanged, including its side flag. I reconfirmed that side flag at the V7 tree: PaytableModal.svelte does still carry sentence-case English prose at lines 49, 50, 61, 62 and 232, for example "'WILD substitutes for all symbols except SCATTER.'," and line 232 "<span class=\"fs-sym-note\">Substitutes for all symbols except SCATTER</span>". That is outside this gate's uppercase scope and is not one [...]

**FROZEN-19, NOT A DEFECT.** src/lib/components/ThemeSelector.svelte|FUTURE SPINNER: the theme name imported from config/themes.ts and rendered in the dev theme picker.

*Evidence.* Every fact in the original row reproduces, but the tree refutes its verdict. git log --oneline -S'ThemeSelector.svelte|FUTURE SPINNER' -- frontend/scripts/locale_completeness_check.mjs -> '37e43a5 feat(TR-091): ...' only. merge-base --is-ancestor 37e43a5 6e9e4739 -> rc=0. Gate side at V7 IS fixed: git show 6e9e4739:frontend/scripts/locale_completeness_check.mjs -> "136:const DEV_ONLY = new Set([", "137: 'src/lib/components/ThemeSelector.svelte|FUTURE SPINNER',", "373: if (DEV_ONLY.has(scoped)) return". But the flagged literal itself is UNCHANGED at V7: git show 6e9e4739:frontend/src/lib/config/themes.ts | grep -n 'FUTURE SPINNER' -> "25: name: 'FUTURE SPINNER',", and git diff --stat 6e9e4739..HEAD touches no file under frontend/src, so it is equally [...]

*Note.* VERIFIER: verdict CHANGED from SHIPPED IN V7 to NOT A DEFECT. The method's tree rule is explicit that for SHIPPED IN V7 the defective form must be ABSENT at V7 and that the tree wins over ancestry; here the flagged string is still in the V7 tree, and the row itself concedes the burn was an exemption rather than a code change. The source reaches the no-defect conclusion in its own words: the V7 gate comment above [...]

**FIXPACK-1, SHIPPED IN V7.** The load screen's WRS brand mark rotated and its bounding box swung up to 97.66px, because a logo canonicalisation swap left `animation: brand-spin 2.6s linear infinite` sitting on the single replacement image.

*Evidence.* git log --oneline -1 03672d9 -> '03672d9 fix(JOB 1): the load screen's WRS logo stops spinning, and the boot goes calm'. git merge-base --is-ancestor 03672d9 6e9e4739 -> ANCESTOR_EXIT=0. TREE re-run by verifier at frontend/src/lib/components/LoadingScreen.svelte: '73: <RainLayer count={10} opacity={0.55} variant="splash" />', '89: <img class="brand-still" src="{$themeAssets.assetBase}/ui/hero_icon_96.png"', '157: animation: brand-glow-pulse 3.2s ease-in-out infinite;', '169: @keyframes brand-glow-pulse {'. Defective form grep -nE 'brand-spin|translateY\(-8px\)|keyframes brand-spin' -> 17, 47, 87 only, all inside comment prose. grep -n 'translate|transform|scale(' -> 40, 47, 58, 166, 249 only, all comments: no live transform anywhere in the file. [...]

*Note.* VERIFIER: verdict SURVIVES, two corrections to the evidence text. (1) The path in the original evidence was written bare; the real path is frontend/src/lib/components/LoadingScreen.svelte, and frontend/src/components/LoadingScreen.svelte does not exist at V7, so the original row's tree check is not reproducible exactly as written. (2) The defective-form grep returns THREE comment lines, 17, 47 and 87, not the two [...]

**FIXPACK-2, SHIPPED IN V7.** The speed control carried a 0.5rem 1x/2x/4x numeral caption and lit on a single `.engaged` boolean, so Turbo and Super Turbo were styled identically and the numeral was the only thing separating them.

*Evidence.* git log --oneline -1 f8fc733 -> 'f8fc733 feat(JOB 2): the speed control is the bolt alone, and the three speeds are measured'. git merge-base --is-ancestor f8fc733 6e9e4739 -> ANCESTOR_EXIT=0. TREE re-run at frontend/src/lib/components/HudOverlay.svelte: grep -c 'data-speed={$speedTier}' -> 4. Super-tier rules present at 1362, 1365, 1366, 1523, 1528, 1529, 1954, 1960, 2088, 2094. Defective forms grep -nE "'1x'|'2x'|'4x'|keyframes fs-flame|animation: ?fs-flame|class:engaged" -> exit 1, nothing. Broader grep -nE 'engaged|fs-flame|flame' -> 1312, 1320, 1334, 1335, 1445, 1935 only, every one inside comment prose recording what was removed. p-tier at 458 and c-tier at 694 are formatAutoCount($autoPlayCount). PaytableModal.svelte at V7 line 136 carries [...]

*Note.* VERIFIER: verdict SURVIVES unchanged. The original row rested on a narrow defective-form grep, so I widened it to bare 'engaged' and 'flame' and confirmed every remaining hit is comment prose, not live code. Gate re-confirmed: git cat-file -e 6e9e4739:frontend/scripts/turbo_intensity_gate.mjs succeeds, V7 checks.yml lines 625 and 629, reports/qa/turbo_intensity_gate_2026-07-27.json present at V7. Shipped bundle [...]

**FIXPACK-3, SHIPPED IN V7.** The `.fs-plate` card frame was a block container, so its `.fs-face` fill was only as tall as its own content and left 23.14px of chrome exposed on WILD, 36.89px on SCAT and 15.42px on the unreported mode cards inside the stretching grid.

*Evidence.* git log --oneline -1 ee6eb60 -> 'ee6eb60 fix(JOB 3): a paytable card's fill follows its frame, so nothing shows through'. git merge-base --is-ancestor ee6eb60 6e9e4739 -> ANCESTOR_EXIT=0. TREE re-run at frontend/src/lib/components/PaytableModal.svelte, line numbers confirmed exactly: '487: .fs-plate {', '489: display: flex;', '499: .fs-plate > .fs-face {', '503: flex: 1 1 auto;', '504: min-width: 0;'. The defective form, a block .fs-plate with a non-stretching .fs-face, is absent from this component. Source numbers checked against reports/archive/2026-07-27b_visual-fixpack.md lines 171 to 173: WILD 23.14px, SCAT 36.89px, mode cards 15.42px, so the summary is the source's own table.

*Note.* VERIFIER: verdict SURVIVES unchanged, and the partial-fix note is now measured rather than quoted. I opened all four copies of the primitive at V7. PaytableModal 487 has display:flex. FeatureMenu 558, WinBreakdown 105 and WinBanner 354 each still open with 'position: relative; --sig: var(--sig-cyan)' and NO display:flex on the frame, so the three duplicates genuinely still carry the defective form at V7 exactly as [...]

**FIXPACK-4, SHIPPED IN V7.** Ten hand-rolled dialog scrims used `position: fixed; inset: 0` inside `.game-wrapper`, whose `transform: scale()` makes it the containing block for fixed descendants, so every scrim covered the 1280x720 stage rather than the viewport and left the letterbox [...]

*Evidence.* git log --oneline -1 f332d52 -> 'f332d52 fix(JOB 4): ten hand-rolled scrims become one, and it covers the whole screen'. git merge-base --is-ancestor f332d52 6e9e4739 -> ANCESTOR_EXIT=0. TREE re-run at frontend/src/app.css, line numbers confirmed exactly: '64:.fs-scrim {' '65: position: fixed;' '66: left: 50%;' '67: top: 50%;' '68: width: calc(100vw / var(--scrim-scale, 1));' '69: height: calc(100dvh / var(--scrim-scale, 1));' '70: transform: translate(-50%, -50%);'. App.svelte '1032: $: scrimScale = ...' and '1575: --scrim-scale: {scrimScale};'. All ten consumers re-listed by grep: BuyBonus 90, FeatureMenu 299, HeroSplash 54, IntroSplash 23, LoadingScreen 72, MaxWinCelebration 69, PaytableModal 162, SessionPanel 97 and 122, ThemeSelector 22. [...]

*Note.* VERIFIER: verdict SURVIVES unchanged. Beyond re-running the row's own checks I swept EVERY component at V7 for a surviving 'position: fixed' with a full inset, which the row did not do. One hit the row does not mention: WinBanner.svelte line 481, '.c1-chromatic-flash { position: fixed; inset: 0; z-index: 200; pointer-events: none; }'. It is NOT one of the ten dialog scrims and it is not a coverage defect: it is a [...]

**FIXPACK-5, SHIPPED IN V7.** KIT V6 was built from a fresh clone, PART 9e was added to the walkthrough with PART 9d marked superseded, and the walkthrough stopped asserting a file count that goes stale, including an 'if it reads fewer than 108, stop' instruction that would have had the [...]

*Evidence.* git merge-base --is-ancestor 7d5d4e4 6e9e4739 -> ANCESTOR_EXIT=0; git merge-base --is-ancestor 14b6506 6e9e4739 -> ANCESTOR_EXIT=0. TREE re-run at docs/records/upload-kit/00_READ_ME_FIRST.md: '386:# PART 9: THE V3 VISIT (SUPERSEDED, DO NOT RUN)', '401:# PART 9c: THE V4 VISIT (SUPERSEDED, DO NOT RUN)', '557:# PART 9d: THE V5 VISIT (SUPERSEDED, DO NOT RUN)', '692:# PART 9e: THE V6 VISIT'. Defective form gone: grep -nE '108 files|fewer than 108' -> nothing; the only '108' left is line 117, 'this page carried a stale 108 into a 110-file kit', the explanatory note. scripts/kit_build.mjs at V7: '258:**Follow `00_READ_ME_FIRST_SECOND_VISIT.md` in this folder, PART 9e.**', '268:Three things PART 9e says you do NOT need to do'. git log --oneline [...]

*Note.* VERIFIER: verdict SURVIVES unchanged, and the row's most important note is independently confirmed rather than accepted. git merge-base --is-ancestor 321dce8 6e9e4739 -> ANCESTOR_EXIT=1, so PART 9f is NOT in V7. On main today the walkthrough runs to '830:# PART 9f: THE CLEAN-BASELINE VISIT (V7)' and PART 9e is now marked '(SUPERSEDED, DO NOT RUN)', but the bundle on the Desktop stops at PART 9e with 9e unmarked, and [...]

