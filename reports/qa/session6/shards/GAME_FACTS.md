# SHARD: GAME_FACTS.md read-and-recount

Audited **`/Users/jt/math-sdk/GAME_FACTS.md`** (404 lines) against the repository at HEAD
**`de2fa2341dfd48ba113d872d22da6eb1894d5108`**, branch `main`, on 2026-07-31.

---

## 1. How many claims were checked, and how they were chosen

**About 120 discrete assertions were checked, across roughly 40 commands.**

Selection rule, in order:

1. **Everything the briefing named as confidently checkable**: the five mode names and cost
   multipliers, the grid and ways figures, the scatter values, the free-spin counts, the max
   win cap.
2. **Every file path and config symbol the document names.** All 55 distinct backticked
   paths were extracted mechanically with `grep -oE` and tested for existence, plus the
   non-backticked asset paths in section 4.
3. **Every section citation** into the PAR sheet, `SUBMISSION_DOSSIER.md`,
   `COMPLIANCE_WATCH.md`, `design-system/DESIGN_SYSTEM.md` and
   `design-system/LAYOUT_SPEC.md`, checked by listing the target file's actual headings.
4. **Every number that a command could settle**: the paytable's 24 cells, the trigger
   distribution's 6 cells, the symbol lineup's 10 rows, the per-mode SD and wincap figures,
   the scatter-placement figures, the asset pixel dimensions, the locale count, the audio
   file count and model id, the fps and interpreter gate figures.

Everything derived from `games/future_spinner/game_config.py` and
`games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md` was read only. No file under
`games/future_spinner/` was written or proposed for edit.

**The overwhelming result is that this document is accurate.** The maths section is exact:
every paytable cell, every mode cost, the grid, the ways figure, the cap, the scatter table,
the free-spin awards, the retrigger, the per-mode SD and wincap frequencies all match the
specification byte for byte. The three findings below are all **citation drift into other
documents**, not maths errors.

---

## 2. STALE findings

| Line | Claim, quoted short | Command run | Result | Proposed correction |
|---|---|---|---|---|
| 22 | ``| Version | v1.2.0 (FeatureMath v2, five modes) | `FUTURE_SPINNER_PAR_SHEET.md` §12 footer |`` | `grep -n "^## " games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md` | The PAR sheet's headings at HEAD are 1, 2, 3, 4, 5, 6, 6a, 6b, 6c, 7, 8, 9, 10, 11. **There is no section 12.** `git log -p` on the file shows `## 12. REGULATORY COMPLIANCE NOTES` was renumbered to `## 11.` when FeatureMath v2 landed (commit `63fa1c0`), and the citation was never followed. The footer itself is real, at line 378. | Replace ``` `FUTURE_SPINNER_PAR_SHEET.md` §12 footer |``` with ``` `FUTURE_SPINNER_PAR_SHEET.md` closing footer line |```. A named footer cannot drift when sections are renumbered again, which is convention (s) applied to a citation. **The version VALUE on the same line is deliberately left alone; see UNKNOWN 1.** |
| 268 | ``(`design-system/LAYOUT_SPEC.md` "Reel feel requirements"; implemented in`` | `grep -rn "Reel feel requirements" . --include="*.md"` | Three hits, and **none is in `LAYOUT_SPEC.md`**: `GAME_FACTS.md:268` itself, `design-system/DESIGN_SYSTEM.md:157` (`### Reel feel requirements (Motion Polish v2 scope)`), and an archived prompt. `grep -in "reel feel" design-system/LAYOUT_SPEC.md` returns nothing. The three tiers ARE named in `LAYOUT_SPEC.md` at line 22 ("Speed tiers Normal, Turbo, Super Turbo"), so the underlying claim is true; only the attribution is wrong. | Replace with ``(`design-system/DESIGN_SYSTEM.md` "Reel feel requirements"; the same three tiers are named in `design-system/LAYOUT_SPEC.md` v3.1; implemented in`` |
| 273 | ``(`design-system/LAYOUT_SPEC.md` v3.1 onward, amended through v3.4 for the fixed-field HUD`` (continuing "and Overdrive flame jets).") | `grep -n "^# AMENDMENT" design-system/LAYOUT_SPEC.md` | Returns **v3.2, v3.3, v3.4, v3.5, v3.6 and v3.7**. The spec is amended through **v3.7** at HEAD, not v3.4. v3.5 is "audit remediation: MAX touch target, jet scale", v3.6 "MAX chip relocated away from SPIN", v3.7 "framed HUD, instrument plates, bonus board, feature story". | Replace with text that stops tracking a moving number: ``(`design-system/LAYOUT_SPEC.md`, the v3.1 base spec plus its amendment series; v3.2 introduced the fixed-field HUD and v3.4 the Overdrive flame jets. Read the file's own amendment headings for the current level rather than a number quoted here).`` The v3.2 and v3.4 attributions were verified against the amendment headings and are historical, so they cannot go stale. |

### What the commands for these three actually measured, stated plainly

- Finding 1 measured **which `##` headings exist in the PAR sheet at HEAD**. It does not
  measure whether the version figure is right.
- Finding 2 measured **which files contain the exact string "Reel feel requirements"**. It
  does not measure whether there are three speed tiers; that was checked separately against
  `frontend/src/lib/stores/speedMode.ts:15`, which declares
  `export type SpeedTier = 'normal' | 'turbo' | 'super'`, and the claim of three is correct.
- Finding 3 measured **the set of amendment headings in `LAYOUT_SPEC.md`**. It does not
  measure whether the 1280x720 single-factor scaling claim is right; that was not
  independently verified and is listed under COVERAGE.

---

## 3. UNKNOWN

### UNKNOWN 1. The version string, `v1.2.0` against the PAR sheet's `v1.2`

`GAME_FACTS.md:22` states the version as **`v1.2.0`** and sources it to the PAR sheet footer.
The PAR sheet footer at HEAD, line 378, reads:

> *Generated by Stake Engine Math SDK | We Roll Spinners | Future Spinner v1.2 (Overdrive
> Free Spins, FeatureMath v2)*

So the source says **v1.2** and the document says **v1.2.0**. `grep -rn "v1\.2\.0"` finds the
string nowhere in the repository except this one line of `GAME_FACTS.md`.

**Verdict UNKNOWN, and NO replacement text is proposed.** The PAR sheet is inside the locked
maths package, and the document-specific briefing plus convention (l.8) both say a
disagreement over a figure sourced from that package escalates to the owner rather than being
ruled on by the builder. Both values are stated above with their sources. This is deliberately
kept separate from the STALE finding on the same line: **only the `§12` citation is proposed
for change; the version cell is left untouched**, so applying finding 1 does not silently
decide this question.

Note the root `VERSION` file contains `10`, which is the upload-kit version and is a different
thing entirely (see CLAUDE.md convention (s)); it is not evidence about the game version and
was not treated as such.

### UNKNOWN 2. "Book-to-lookup equality is proven", line 358

The figures are corroborated: `500,000` rounds and `4,455,829` assertions appear identically
in `BOOKS_MANIFEST.md:94`, `SUBMISSION_DOSSIER.md:508`, `README.md:81` and
`docs/records/reviews/REVIEW_TRACKER.md:98`. **The numbers are not stale.**

What I could not settle is the word **"proven"**. `REVIEW_TRACKER.md:291` carries **TR-110,
OPEN**, which argues this exact result "is not approval-grade provenance". That is a live
dispute about the strength of a claim, not a measurable contradiction, and TR-110 has not been
ruled on. I have no command that settles it, so no correction is proposed.

---

## 4. HANDED FORWARD (real, but out of my scope)

1. **A maths-package internal comment disagrees with the maths-package PAR sheet on the
   scatter maximum.** `games/future_spinner/game_config.py:151-153` reads "free-spin draws
   are natural and scatters can stack, giving 6+ on a 5x4 grid, so every count from 3 up to
   the 20-cell maximum is mapped (6+ awards the 5-scatter amount)". The PAR sheet at line 88,
   corrected under sanctioned lock exception by commit `d9a6d37` (TR-047), reads "FIVE
   scatters is the maximum on the visible 5x4 board". `GAME_FACTS.md:383` agrees with the PAR
   sheet, so **GAME_FACTS is not wrong** and needs no edit. But the two halves of the locked
   package now read differently, and the config comment is the same six-row-padding
   misreading that produced convention (l)'s worked example. **Both paths are locked. This is
   an owner question, not a builder fix.** No tracker row is proposed.

2. **`docs/QUALITY_CHARTER.md` Q-25 is OPEN and directly qualifies the Q-11 fix that
   `GAME_FACTS.md:309-311` cites.** I did not analyse it, propose anything about it, or verify
   any part of it, because it is a player-money-display question and therefore inside my
   absolute scope ban. Recorded here only so the next reader knows the citation was seen and
   deliberately left alone.

---

## 5. COVERAGE: what I did NOT check

**This shard is not exhaustive. Read it as a partial audit.**

Not checked at all:

- **The whole of section 3a, lines 144 to 224**, "PLATFORM DISPLAY CONVENTION, and what our
  own surfaces show". Every claim in it concerns player money display, which my brief bans
  absolutely. Its cited file paths were confirmed to exist and nothing else about it was
  examined. The bet-level figures, the reconciliation residuals, the per-mode "proven live"
  column and the MULT column arithmetic are all unaudited by me.
- **The SA-022 bullet at lines 305 to 311**, same reason.
- **The four externally sourced art measurements** at lines 252 to 255: Pearson r 0.3850, the
  0.9966 enhancement control, "58.2% of cells moved", "0.7%" bounding-box match, "2729x914",
  "40.7% transparent". I confirmed the four assets exist at the stated pixel dimensions
  (1920x1080, 1920x1080, 408x546, 680x1344, 2840x1000, all via `sips`) and that both
  provenance records and both JSON files exist. **I did not open the JSON to check the
  correlation figures themselves.**
- **The 1280x720 single-factor layout claim** at line 271. Not verified.
- **`frontend/scripts/audio_verify.mjs` "ALL CHECKS PASS"** at line 286. The script exists; I
  did not run it, per the standing preference for reading gates as text.
- **CI reality.** No `gh run list` was run, so no claim here is checked against remote CI.
- **Books, lookup tables and the SHA-256 manifest.** Not decoded, not hashed, not sampled.
  Every maths figure in section 2 was checked against the PAR sheet and `game_config.py` as
  the SPECIFICATION, per convention (l.1), and NOT against the generated artefacts.
- **Prose accuracy of the narrative paragraphs** in sections 4 and 5 beyond their file paths
  and named figures.

Checked and found correct, so nobody re-does the work:

- Grid `num_reels = 5`, `num_rows = [4] * 5` (`game_config.py:111-112`); 1,024 ways; 20 cells.
- `_WINCAP = 5000.0` (`game_config.py:52`) and 5,000x on every mode.
- All five `BetMode` costs in `game_config.py`: base 1.0, bonus 100.0, cruise 1.0,
  antelite 1.25, super 400.0, matching `FS_MODES` in `frontend/src/lib/config/fsModes.ts`
  exactly, including the `serverMode` ids.
- All 24 paytable cells against `game_config.py:120-128`.
- Scatter table 1x/3x/10x (`game_config.py:142-145`); free spins 8/12/16
  (`game_config.py:157`); retrigger flat +5 (`game_config.py:162`).
- Every base-mode and bonus-mode metric against PAR sections 5 and 6, and the trigger
  distribution tables, cell by cell.
- Cruise/antelite/super SD 11.29x/20.32x/539.16x and wincap 1-in-250,000 / 1-in-80,000 /
  1-in-250 against PAR 6a, 6b, 6c.
- All ten symbol-lineup rows against `design-system/DESIGN_SYSTEM.md:40-49` and PAR section 4.
- 16 locales (`frontend/src/lib/i18n/translations.ts:8-11`).
- The six viewport dimensions against the presets in `layout_fit_gate.mjs`.
- 59.93 fps against a >=55 gate, and PASS 58/58, in the two archived reports cited.
- Twelve sound files, two beds plus ten SFX, 100 and 140 BPM, model
  `stabilityai/stable-audio-3-medium`.
- Scatter-placement figures 23.18 / 64.5 / 24.0 / 46.2 / 0.5 per cent, corroborated by
  `REVIEW_TRACKER.md:122` (TR-033) and `docs/design/SCATTER_ANTICIPATION_SHIP_SPEC.md:36`.
- Platform cap 10,000,000 (`docs/stake-engine-live/2026-07-25/math-verification.md:20`).
- XGC to GC, XSC to SC, XEC to SC (`frontend/src/lib/utils/currency.ts:110,127,243,245`).
- All 55 backticked paths and all five asset paths resolve.

---

## 6. Write discipline

`git status --porcelain` at close reports two untracked paths:

```
?? reports/qa/session6/shards/GAME_FACTS.md
?? reports/qa/session6/shards/KNOWN_OPEN.md
```

**The first is my shard, the only file I wrote.** The second, `KNOWN_OPEN.md`, was **already
present before I wrote anything** and is another agent's shard from this same session's
fan-out. I did not create, edit or read it. Nothing else in the tree changed: no tracked file
is modified, nothing was deleted, and no file under `games/future_spinner/`,
`frontend/src/lib/services/rgsService.ts` or `frontend/src/lib/stores/gameStore.ts` was
touched in any way. Port 5173 was never contacted.
