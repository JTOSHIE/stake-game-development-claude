# JOB 3 SHARD: the localisation half, recounted against HEAD

Session 6, 2026-07-31, brief `reports/briefs/FS_RECORD_TRUTH_Prompt.md` JOB 3. Two agents,
both READ-ONLY: one confirming the reviewers' specific citations, one enumerating what English
literals genuinely survive. Neither proposed a cause or a fix, per
`docs/skills/FULL_AUDIT_METHOD.md` 2.7, which measures observations at 94 per cent and
diagnoses at 19 per cent.

**Everything below is an OBSERVATION.** Where something is still open, this shard says what
was seen and stops.

---

## 1. THE BRIEF'S OWN PREMISE WAS TOO OPTIMISTIC, and this is the headline

The brief states, as REPORTED rather than VERIFIED: *"Most of it is already fixed and the
tracker does not say so: `WinBanner.svelte`'s tier words and `PaytableModal.svelte`'s prose
are keyed at HEAD."*

**The first half holds. The second half does not.** `WinBanner.svelte` is closed.
`PaytableModal.svelte` is PARTLY closed, and two of the reviewer's own cited ranges still
contain unkeyed English. Protocol rule 16 is exactly why this was recounted instead of
accepted, and it earned its keep here.

## 2. The reviewers' citations, settled one at a time

The citations, quoted from the sources rather than from the tracker's summary of them.
`docs/records/reviews/sources/round3_review3.md:52` and `:54`; `round3_review2.md:51` files
this as **F2, MAJOR**, not as its blocker (its blocker F1 is the mini-strip balance, which is
money-path and out of scope for this session).

| Citation | Verdict at HEAD |
|---|---|
| (a) `WinBanner.svelte` tier words BIG WIN / MEGA WIN / EPIC WIN, and BET | **CLOSED** |
| (b) `PaytableModal.svelte`, five ranges | **PARTLY CLOSED**, two strings survive |
| (c) `fsModes.ts:59-115` mode descriptions | **PARTLY CLOSED**, `volatility` survives |
| (d) commit `1494bdf` keyed prose across sixteen locales | **RESOLVES**, with one correction |

### (a) WinBanner.svelte: CLOSED

`WinBanner.svelte:214` resolves the tier through
`t($locale, tier === 'epic' ? 'tierEpicWin' : ...)`, and `:235` resolves BET through
`t($locale, 'bet', ...)`. Keys confirmed present in English, German and Arabic. Closed by
`1494bdf` for the tier words and by `f7a853e` (2026-07-29) for BET, which landed a day later.

**The cited line range no longer points at the finding.** Lines 195 to 207 are now the
dismiss timer. A reviewer returning to check their own citation would find unrelated code,
which is a reason to record the closing commit rather than the line number.

### (b) PaytableModal.svelte: PARTLY CLOSED, two strings survive

Closed: the rules list, the disclaimer body, the ways heading and body, the diagram caption,
the symbol payout headings, the interface guide (via `nameKey`/`descKey`), the RTP and max-win
rows, and the mode cards. `1494bdf` did most of it; `ae40604` on 2026-07-30 closed three the
first pass left behind, including the `{$isSocial ? 'Play Modes' : 'Bet Modes'}` branch that
`1494bdf`'s own commit message claimed to have removed.

**STILL OPEN, both inside cited ranges:**

1. **`frontend/src/lib/components/PaytableModal.svelte:259`**: the trigger table header row is
   `<tr><th>Scatters</th><th>{$tr('colFreeSpins')}</th><th>{$tr('colInstantAward')}</th></tr>`.
   The two headings beside it are keyed and this one is not. No `colScatters` key exists in
   `prose.ts`. This is reviewer 3's cited line 261.
2. **`frontend/src/lib/components/PaytableModal.svelte:397-403`**: the responsible-play body
   paragraph, hardcoded English about autoplay stop conditions and the session summary. The
   heading directly above it at `:396` IS keyed as `$tr('responsiblePlayHeading')`.
   `git log -S` on the paragraph's opening words returns only `d4fff9b`, the commit that added
   it: **no commit has ever removed or keyed it.** No `responsiblePlayBody` key exists. This
   is the terminal line of reviewer 3's cited range 304 to 405.

### (c) fsModes.ts: PARTLY CLOSED, `volatility` survives

Closed: `label:` and `blurb:` English literals are gone, replaced by `labelKey`/`blurbKey`
resolved through `modeLabel()`/`modeBlurb()`. All ten mode keys confirmed in English, German
and Arabic. Closed by `1494bdf`.

**STILL OPEN, inside the cited range**: `volatility` is an English literal union at
`frontend/src/lib/config/fsModes.ts:50` with English values at `:74, :84, :94, :104, :114`,
rendered raw as `{m.volatility}` at `FeatureMenu.svelte:413` and `:473`. No key exists for it.

### (d) Commit 1494bdf: RESOLVES, with one correction to how it is described

`1494bdf874c7bdc71a9b3fdeb229bf32d9a8eeb6`, 2026-07-28,
*"feat(JOB 2): key every player-visible prose string across sixteen locales"*, an ancestor of
HEAD, 16 files changed, 2195 insertions.

**It did not touch sixteen locale files.** The sixteen LOCALES live in two FILES:
`prose.ts` (English plus social) and `prose.locales.ts` (the fifteen others). The sixteen
figure in the commit subject is the count of locales, and it happens to coincide with the
count of files changed, which is a coincidence worth naming because it invites the wrong
reading. Its own stated count of 74 prose keys is now 75 per non-English block.

## 3. THE GATE DISTINCTION, and why this session did not wire it

**`frontend/scripts/locale_prose_conformance.mjs` is NOT wired into CI, and this session did
not wire it.** `grep -n locale_prose_conformance .github/workflows/checks.yml` returns
nothing at all, not even a comment. The neighbouring `locale_completeness_check.mjs` IS
wired, at `checks.yml:354-356`.

**It detects a LEAK, not an ABSENCE, and the code settles it.** Both of its detectors compare
against the English corpus by identity:

- `findResolverLeaks` at `:144`: `if (v === en) leaks.push(...)`, iterating keys that already
  exist. A literal that was never keyed has no key to iterate, so this part cannot see it by
  construction.
- `findRenderedLeaks` at `:168`: `if (englishStrings.set.has(text)) hits.push(...)`, where the
  set is built at `:175-185` from `locales.en`, `featureI18n.en`, `proseEn`,
  `SOCIAL_OVERRIDES` and `PROSE_SOCIAL`, all of them **keyed** values.

**So a rendered string is flagged only when it is byte-identical to an existing English keyed
value.** None of the three surviving strings in section 2 is a value of any key, so none is a
member of that set, and **wiring this gate would not have caught any of them.**

That is the whole reason the brief forbade wiring it and the reason that instruction was
correct: wiring it as the answer to the reviewers' ask would ship false assurance against a
requirement it does not test. **The decision is left to a ruling.** Nothing here recommends
what that ruling should be.

Two further facts about the script, recorded because they bear on any future wiring decision:

- It writes `reports/qa/locale_prose_conformance.json` directly, via
  `OUT_DIR = join(__dirname,'..','..','reports','qa')` at `:63-64` and `writeFileSync` at
  `:429`. **It does not use the `evidenceDir` helper**, so it does not honour convention
  (h.1)'s scratch default and a plain run dirties committed evidence. Its `mkdirSync` runs at
  module load, on every invocation including `--self-test`.
- Its PART 3 harvest clicks a menu button and harvests the DOM, but contains no step that
  opens the paytable modal, which is where two of the three surviving strings live.

## 4. The wider census of surviving player-visible English

The second agent swept `frontend/src/` by four independent passes (markup text nodes, text
after brace expressions, attribute and brace-expression literals, and `.ts` literals traced
forward to a render site). It excluded, and said so, everything gated behind
`import.meta.env.DEV` (the theme selector and reel-mode toggle do not ship), test files,
scripts, `data-testid` values, CSS class names, console messages and comments.

**Findings are OBSERVATIONS with `file:line`, and no cause or fix is proposed for any of
them.** The full table is in the agent's return and the material clusters are:

- **`rgsService.ts:364-371`, eight player-facing error strings** (invalid bet, insufficient
  balance, session expired, authentication failed, game error, region blocked, temporary
  error, maintenance). These reach the player through `App.svelte:1829`. **This file is a
  LOCKED path and this session proposed and changed nothing in it.** Recorded here only.
- **`replayService.ts:69` and `:135`**, two error strings that reach the replay error detail.
- **`FeatureMenu.svelte`**: `per spin`, `bet`, `× per spin while ON ·` at `:422`, and
  `All modes · RTP` at `:508`.
- **`HudOverlay.svelte`**: `Session` at four HUD variants, `Unmute`/`Mute`,
  `Normal speed`/`Turbo`/`Super Turbo` tooltips, and `Spins` in the autoplay menu.
- **`ReplayMode.svelte`**: `Mode:`, `Play`/`Bet`, `cost =`, `Token`/`Currency`.
- **`App.svelte:1647`**, the document title suffix ` - We Roll Spinners`, and `:141-146`, the
  social-mode error banner vocabulary.
- **Brand and acronym literals** deliberately not keyed elsewhere: `RTP`, `We Roll Spinners`,
  `NITRO OVERDRIVE`, `Overdrive Free Spins`. `FreeSpinsPresentation.svelte:117-119` carries a
  comment saying the mode name is treated as brand styling on purpose.
  `locale_prose_conformance.mjs:76-80` lists exactly these in its `PROPER_NOUNS`. Whether they
  ought to be translated is **not** an observation this shard makes.

**COVERAGE, so nobody reads this as exhaustive.** No app was run and no screen was looked at:
every entry is source observation, and the surface named for each is inferred from mount
sites found by grep. Scope was `frontend/src/` only, so `frontend/index.html`,
`frontend/public/` and the wider repository were not swept. **Rendered image text was not
examined at all**, so wordmarks and UI PNGs under `assets/themes/**` may carry baked-in
English that no source sweep can see. Whether any listed literal is nonetheless covered by a
different gate was not checked. `translations.ts` (121kB) and `prose.locales.ts` (88kB) were
not read in full.

## 5. HANDED FORWARD, not acted on

- The three surviving cited strings in section 2. TR-059 has been narrowed to name them
  rather than closed. **No new tracker rows were added**, per the brief.
- The wiring decision for `locale_prose_conformance.mjs`, with the LEAK versus ABSENCE
  distinction recorded above as the material fact for whoever rules on it.
- That script's non-use of `evidenceDir`, which is a live instance of the convention (h.1)
  class that `CLAUDE.md` already records as open work.
- The eight `rgsService.ts` error strings, which are inside a LOCKED path and would need a
  sanction before anything could be done about them.
