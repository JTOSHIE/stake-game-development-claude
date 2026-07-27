# QUALITY CHARTER

The document `CLAUDE.md`'s STANDING MANDATE points at, holding the mandate itself, the
benchmark it is measured against, and the machine-tell sweep list plus the gate that
enforces the sweepable subset of it.

Australian English, metric, no em dashes or en dashes.

**Created 2026-07-27** by the round-three prep session, executing the substance of the
prepared but never-run `track/quality-sweep` brief
(`docs/records/tracks/quality-sweep_BRIEF.md`, JOB A). Until this file existed,
`CLAUDE.md:502` cited a document that was not in the repository.

---

## 1. The standing mandate

Quoted verbatim from `CLAUDE.md:483` to `CLAUDE.md:487`, which records it as the owner's
order of 2026-07-26, binding to submission.

> this title is the studio's flagship and the template for every future build.
> Whatever is found gets fixed now, not later; before submission there is no
> minor-defer category, only fixed or explicitly owner-parked with reasons. The
> bar is that a player, a reviewer, or a rival studio inspecting any surface
> concludes this was made by a professional outfit adhering to industry
> conventions. Nothing player-visible may read as machine-generated.

**What it changes in practice**, restated from `CLAUDE.md:489` to `CLAUDE.md:493`:
"minor" is not a disposition. A finding is FIXED, or it is OWNER-PARKED with a written
reason. Severity decides ORDER, never whether something gets done. A tracker row cannot
be closed by arguing the defect is small.

---

## 2. The benchmark: Valkyrie-class layout and finish

The `quality-sweep` brief names "Valkyrie-class layout and finish" and requires it stated
"in checkable terms rather than as an adjective". This section does that.

### 2.1 Who Valkyrie is, and why the name is not decorative

Valkyrie is a real publisher on this platform, not a metaphor. It appears in our own
first-party capture of the platform's public FAIR catalogue:

- `docs/stake-engine-live/2026-07-28/fair-catalogue.md:49`, fetched 2026-07-28 from
  `https://fair.stake-engine.com/catalogue`, carries the verbatim record
  `"publisher":{"name":"Valkyrie","slug":"valkyrie"}` for the game `Lokis Vault`
  (slug `the-lokis-vault`).
- `docs/stake-engine-live/2026-07-26/published-tile-geometry.md:58` records that
  Lokis Vault's published tile renders `VALKYRIE` as letterspaced capital type.
- A second Valkyrie title, `Waylander's Forge`, is captured frame by frame at
  `docs/reference/competitor-demos/waylanders-forge/`, sixteen frames and eight video
  captures, summarised in that directory's `README.md` and referenced from
  `docs/FEATURE_RESEARCH_v1_1.md:11`.

So the benchmark is a studio whose shipped work we hold in the repository and can open.
That is the point: the bar is checkable against artefacts, not against an impression.

### 2.2 The benchmark stated in checkable terms

Each line below is a property that can be verified by opening a named artefact or running
a named command. Where the figure is ours, it is cited to the file it comes from.

| # | Property | Checkable statement | Our position, and where to check it |
|---|---|---|---|
| B1 | **Tile geometry** | The published tile is exactly 408x546, the geometry 93.1% of a 87-tile decoded sample uses (`docs/stake-engine-live/2026-07-26/published-tile-geometry.md`). | MET. `design-system/brand/tile/tile_composed_master.png` is exactly 408x546, byte-checked in that same document. |
| B2 | **Publisher name is set as type, not as a logo drop** | Lokis Vault renders `VALKYRIE` as letterspaced capitals on the tile (`published-tile-geometry.md:58`). A supplied logo image is used elsewhere, not composited into the tile. | MET. Recorded in `design-system/brand/provider_mark/PROVIDER_LOGO_DERIVATION.md`, which builds its size ladder from labelled anchors rather than an unobserved rendered size. |
| B3 | **Iteration depth is visible in the version number** | Lokis Vault is at `"version":746` with two versions active, 746 and 789 (`fair-catalogue.md:40,49`). A published Valkyrie title has been revised hundreds of times. | NOT MET, and correctly so: we are pre-submission at version 0. The checkable form of this line is that a first submission is not expected to look like a 746th revision, and the finish gap that remains is therefore the thing to close by inspection rather than by iteration count. |
| B4 | **Simulation depth per mode** | Valkyrie publishes 3,600,000 events for base and ante and 240,000 for bonus (`fair-catalogue.md:49`). | BELOW. Ours is 100,000 per mode (`CLAUDE.md:250`). Within the platform cap of 10,000,000 (`COMPLIANCE_WATCH.md`, 2026-07-25 section), and not a finish question, but it is the honest comparison and it is recorded rather than omitted. |
| B5 | **No machine-tell survives on any player-visible surface** | The sweep list in section 3 is the operational form of this. It is enforced by `frontend/scripts/machine_tell_gate.mjs` for the sweepable subset. | Section 4 is this pass's ledger. |
| B6 | **Iconography is one drawn family** | Every icon on a player-visible surface is a drawn vector in one geometric family, positioned by the layout rather than typeset in a text run. | Enforced by the gate's `glyph-iconography` class. Before this pass, 35 font glyphs and OS emoji were being typeset as icons; see section 4. |
| B7 | **The brand face carries every player-visible text run** | No player-visible text run resolves to an operating-system font. | Partly enforced. The gate catches glyphs outside the Orbitron subset; declared font stacks that name no brand face are listed in section 4 with their dispositions. |

### 2.3 The inspection test, restated

Before any surface is called done, ask what a rival studio's art director would conclude
from that surface alone (`CLAUDE.md:495`). The specific failure the mandate names is
machine-tells, and section 3 is the enumerated list.

**The test that decides an argument about a machine-tell**: would the same defect appear
if a person had made this surface deliberately? A scaffold package name in a browser tab,
an operating-system emoji beside a drawn icon, and one apostrophe form in one bullet and a
different one in the next are all things that only happen when nobody looked. That is what
"reads as machine-generated" means, and it is why severity does not enter into it.

---

## 3. The machine-tell sweep list

The nine classes named in `CLAUDE.md:496` to `CLAUDE.md:502`, each with the form it really
takes in this codebase, and whether the gate enforces it.

| Class | What it looks like here | Gated |
|---|---|---|
| **1. Dash typography** | Em dash or en dash in any string that can reach a player. Cost this project two shipped defects (TR-060, then TR-063 when the widened gate was still blind). | YES, `frontend/scripts/dash_gate.mjs`, source and dist, with a four-form seeded self-test. |
| **2. Straight versus curly quotes mixed in one view** | One locale using both `'` (U+0027) and `’` (U+2019) for the same apostrophe, in strings a player sees in one screen or across two. | YES, `machine_tell_gate.mjs`, class `mixed-apostrophe`, per locale block. |
| **3. Double spaces** | Two or more consecutive spaces inside player-visible prose. | YES, `machine_tell_gate.mjs`, class `double-space`. |
| **4. Capitalisation that changes between two screens showing the same word** | The same label ALL CAPS on one surface and sentence case on another. | PARTLY. The gate reports case-variant collisions in the locale tables; cross-surface casing needs the rendered DOM and stays a review item. |
| **5. Decimal or currency formats that disagree** | Player money rendered by `.toFixed()` or string concatenation instead of the canonical helper in `frontend/src/lib/utils/currency.ts`; a hardcoded currency symbol; the multiplication sign written `x` on one surface and `×` on another. | PARTLY. Hardcoded symbols and raw `.toFixed` on money are gated; the `x` versus `×` class is listed in section 4 and fixed at source. |
| **6. Placeholder strings that survived** | Scaffold defaults and authoring markers: `TODO`, `TBD`, `FIXME`, `Lorem`, and the Vite starter's own package name in `<title>`. | YES, `machine_tell_gate.mjs`, class `orphan-placeholder`, seeded with the exact scaffold title that shipped. |
| **7. Button casing that drifts** | Control labels not following one casing convention within one menu. | PARTLY, same limit as class 4. |
| **8. Iconography from two different families** | Operating-system colour emoji and text dingbats typeset inside text runs, beside drawn 24x24 SVG icons in the same menu. | YES, `machine_tell_gate.mjs`, class `glyph-iconography`, by codepoint block. |
| **9. The system default font leaking through where the brand face should be** | A declared stack naming no brand face; a stack naming one operating system's UI font; or a character outside the Orbitron subset, which silently falls back per character mid-word. | YES for the character case, which is the invisible one; declared stacks are reviewed and listed. |

### 3.1 Why the font class is a character question and not only a CSS question

The shipped Orbitron subset covers **183 codepoints**. Verified directly against the
shipped font files:

```
frontend/dist/assets/orbitron-latin-400-normal-DBk4Dmer.woff, 183 codepoints
  U+0027 straight apostrophe  present
  U+2019 curly apostrophe     present
  U+00D7 multiplication sign  present
  U+2715 multiplication X     ABSENT
  U+2192 rightwards arrow     ABSENT
  U+2605 black star           ABSENT
  U+2713 check mark           ABSENT
  U+221E infinity             ABSENT
```

A character the brand face does not carry does not fail loudly. The browser falls back for
that character alone, so a close button reads in Helvetica or Segoe UI in the middle of an
Orbitron interface, and no stylesheet says so. That is why class 9 is enforced by codepoint
rather than by reading font stacks, and it is why class 8 and class 9 catch the same
defects from two directions.

---

## 4. The 2026-07-27 sweep: findings ledger

Run across every player-visible string and committed surface, source and dist, per the
brief. Dispositions are FIXED or OWNER-PARKED, per the mandate. Nothing is "minor".

Method: derived first, then measured, per convention (l). The Orbitron coverage above was
read from the shipped font files before any string was judged, and the dist counts below
were taken from the production build of HEAD `3f0d686` rather than from the source.

### 4.1 What was shipping, counted in dist

Every symbol codepoint present in `frontend/dist/assets/*.js`, `dist/index.html` and
`dist/assets/*.css` at HEAD `3f0d686`, counted rather than estimated:

| Glyph | Count | Where | Player-visible |
|---|---|---|---|
| `🏆` | 17 | `wincap` in all sixteen locales plus the social override | YES, via `WinDisplay.svelte:79` |
| `🔊` | 4 | audio menu, four layout profiles | YES |
| `🔇` | 4 | audio menu, four layout profiles | YES |
| `★` | 3 | `MaxWinCelebration.svelte:98` crown | YES |
| `✕` | 2 | `PaytableModal.svelte:178`, `FeatureMenu.svelte:322` close buttons | YES |
| `→` | 1 | `PaytableModal.svelte:208` ways diagram | YES |
| `🎨` | 1 | dev panel | No, `import.meta.env.DEV` gated |
| `⬇` | 1 | dev reel-mode toggle | No, DEV gated |
| `⇅` | 1 | dev reel-mode toggle | No, DEV gated |
| `✓` | 1 | `ThemeSelector.svelte:51` | No, theme selector is dev-only |

**35 glyphs shipping, 31 of them on player-visible surfaces.**

### 4.2 The ledger

| # | Class | Finding, with its citation | Disposition |
|---|---|---|---|
| Q-01 | placeholder | `frontend/index.html:9` set `<title>future-spinner-frontend</title>`, the Vite starter's npm package name, and it shipped verbatim to `dist/index.html`. **CORRECTED during this same pass, and the correction is recorded rather than the first claim quietly edited away.** The first assessment said nothing overwrote it at runtime, on the strength of `grep -rn "document.title" frontend/src` returning nothing. That grep was the wrong instrument: `App.svelte:1507` sets the title through `<svelte:head>`, which never mentions `document.title`, and it reaches dist. So the scaffold name is the **pre-hydration** title only, from first paint until Svelte mounts, after which the tab correctly reads `Future Spinner - We Roll Spinners`. Still a real defect and still worth fixing, because that window is longest on exactly the slow connection where a player looks at the tab, and because the shipped `index.html` is a committed surface a reviewer can open. But it is transient, not permanent, and the severity claim in the first draft of this row was wrong. | **FIXED**, and the assessment corrected |
| Q-02 | icon-family | `🏆` typeset inside the `wincap` string in all sixteen locales and the social override (`translations.ts:225` and fifteen siblings, plus `:1721`). Rendered by `WinDisplay.svelte:79`. An operating-system colour emoji, drawn by a different vendor on every platform, inside an Orbitron text run. | **FIXED** |
| Q-03 | icon-family | `🔇` and `🔊` in the audio menu item at `HudOverlay.svelte:382`, `:517`, `:593`, `:747`, sitting in the same menu as drawn 24x24 SVG icons (for example `HudOverlay.svelte:407`). | **FIXED** |
| Q-04 | icon-family, font-leak | `★ ★ ★` at `MaxWinCelebration.svelte:98`. U+2605 is absent from the Orbitron subset, so the max-win celebration's crown renders in a system font. | **FIXED** |
| Q-05 | icon-family, font-leak | `✕` at `PaytableModal.svelte:178` and `FeatureMenu.svelte:322`. U+2715 absent from the subset. | **FIXED** |
| Q-06 | icon-family, font-leak | `→` at `PaytableModal.svelte:208`. U+2192 absent from the subset. | **FIXED** |
| Q-07 | font-leak | `∞` at `HudOverlay.svelte:94` and the three infinite-autoplay buttons. U+221E is absent from the subset, so it does fall back. | **REVIEWED AND KEPT**, with the reason in the gate's allowlist. It labels the infinite option in a button row whose other members are the numerals 10, 25, 50 and 100. It is a member of a numeric series rather than an icon, and a drawn lemniscate among numerals would read worse than the conventional symbol. One glyph falls back and that is recorded here rather than hidden. Four instances remain in dist, which is the whole of what the gate now permits. |
| Q-08 | mixed-apostrophe | French uses both forms. `translations.ts:1419` has `l’Achat` (U+2019) while `:1407` has `d\'un` and `l\'entrée` (U+0027), and `PaytableModal` renders both bullets in one rules list. `:580` and `:574` add two more straight-apostrophe French strings. Only French is affected: no other locale mixes. | **FIXED** |
| Q-09 | apostrophe-dropped | `translations.ts:570` reads `Votre session n a pas pu être vérifiée`. Correct French is `n'a pas`. The apostrophe is absent, not merely the wrong form, so this is a grammar defect in an error banner, and `git log -S` shows it was never present. Same root cause as Q-08: an author dodging the escape inside a single-quoted literal. | **FIXED** |
| Q-10 | currency-format | `HudOverlay.svelte:453`, `:673`, `:871` render a hardcoded `$` beside the autoplay loss-limit input. The game runs in EUR, XEC and SC among others, and the owner's own live sessions were EUR. This is the same class as the shipped `XSC` leak that PR #89 fixed. Player money display, so escalated per convention (l.8) as well as fixed. | **FIXED**, and raised as a numbered comms item |
| Q-11 | currency-format | `WinPod.svelte:6` renders player money as `$winAmount.toFixed(2)`, the only money `.toFixed` left in `frontend/src`. Already carried as ledger row SA-022 from the analyst track. | **FIXED** |
| Q-12 | currency-format | The multiplication sign disagrees across surfaces: `MaxWinCelebration.svelte:103` renders a letter `x` after `5,000`, while `PaytableModal` and the mode cards use `×` (U+00D7). Same concept, two glyphs, two screens. | **FIXED** |
| Q-13 | font-leak | `frontend/src/app.css:74` sets `:root { font-family: system-ui, Avenir, Helvetica, Arial, sans-serif; }`. That is the Vite scaffold's own stack and it names no brand face, so every surface that does not declare one inherits the operating system font. | **FIXED** |
| Q-14 | font-leak | `frontend/src/App.svelte:2002` declares `font-family: 'Segoe UI', system-ui, sans-serif`. Segoe UI is the Windows system face; on macOS, Android and iOS this resolves to something else, so the surface is deliberately styled for one operating system and accidental everywhere else. | **FIXED** |
| Q-15 | font-leak | `'Courier New', monospace` at `LoadingScreen.svelte:195` (the boot progress label) and `App.svelte:2324` (the logo text). Courier New is not the brand face, and the loading screen is the first surface a player sees. | **FIXED** |
| Q-16 | hardcoded-string | Player-visible English not routed through the translation function, invisible to `locale_completeness_check.mjs` because that gate scans ALL-CAPS literals only. Counted rather than estimated: **27 static player-facing attributes and 48 markup text nodes**, listed in full in 4.3. TR-059 estimated "roughly thirty keys times sixteen locales"; the count confirms it. | **OWNER-PARKED, EXTRACTED**, per protocol rule 6. See 4.3 for the reasoning and the full list. |
| Q-17 | scaffold-residue | `frontend/src/assets/svelte.svg` is the Vite starter's Svelte logo, dated to the scaffold commit, imported by nothing (`grep -rn "svelte.svg" frontend/src frontend/index.html` returns nothing) and absent from dist. Committed surface, not player-visible. | **FIXED**, deleted |
| Q-18 | placeholder | `PaytableModal.svelte:309` renders the string `coming soon` for any mode with `available: false`. **NOT A DEFECT today**: all five modes are `available: true` (`frontend/src/lib/config/fsModes.ts:67,78,89,101,112`), so the branch is unreachable and no player can see it. Recorded rather than silently passed, per the brief. | **NOT A DEFECT**, reasoning recorded; string routed through a locale key anyway so it cannot ship untranslated if a mode is ever gated |
| Q-19 | placeholder | `ThemeSelector.svelte:48` renders `COMING SOON`. **NOT A DEFECT**: the theme selector is dev-only and not rendered in production (`CLAUDE.md:345`). | **NOT A DEFECT**, reasoning recorded |
| Q-20 | mixed-apostrophe | `frontend/src/lib/i18n/vocabulary.ts:73` carries `’` inside a prohibited-phrase entry. **NOT A DEFECT on the phrase side**: convention (l.7) requires compliance text quoted verbatim, and the phrase is the platform's own wording. The replacement side is ours and is normalised with it. | **NOT A DEFECT** for the quoted phrase; replacement normalised |
| Q-21 | dead-key | `translations.ts` `locationRestricted` exists in all sixteen locales and is rendered by no component. Dead weight in the bundle today; a live defect the moment a region gate is wired to it. Out of this pass's scope to decide which. | **OWNER-PARKED**: recorded here and raised as a comms item. Options are (a) wire it to the jurisdiction flags already published by `rgsService`, or (b) delete all sixteen values. Not the builder's call, because it is a jurisdiction-behaviour question. |
| Q-22 | dev-residue-in-bundle | The four DEV-gated glyphs in 4.1 (`🎨`, `⬇`, `⇅`, `✓`) survive tree-shaking into the production bundle as string literals. Not player-visible: the render is `import.meta.env.DEV` gated and that is statically false in production. In scope because "committed surface" is, and because a reviewer unpacking dist would find dev tooling. | **FIXED**. `⬇`/`⇅` deleted (the adjacent `{$reelMode}` label already says which mode it is), `🎨` replaced by the word THEME, `✓` replaced by a drawn tick. Cheaper than the restructuring first assumed, so it was done rather than parked. |

### 4.3 The hardcoded-string set: why it is PARKED and not half-done

**This is the one item in the sweep that is not closed, and the reason is protocol rule 6,
not convenience.** `CLAUDE.md:540` says it plainly: "When a job turns out to contain a
genuinely hard bounded problem, it is written up as its own surgical brief and handed back,
rather than absorbed into the session that found it. A hard problem solved in the margins
of another job gets the attention that was left over."

**The size, measured rather than guessed.** 27 static player-facing attributes plus 48
markup text nodes reduce to roughly 35 distinct keys. At sixteen locales that is about
**560 translated values**, on surfaces including the autoplay panel, which is a mandatory
approval surface, and the paytable, which is a mandatory information surface.

**Why doing it here would have been the wrong call**, stated so the decision is auditable:

1. **It is translation work, not sweep work.** 560 values of French, Arabic, Hindi,
   Japanese, Korean, Polish, Portuguese, Russian, Turkish, Vietnamese and Chinese written
   in the margins of a six-job session is exactly the "attention that was left over" case
   rule 6 names. An error in a Japanese autoplay stop-condition is a compliance defect that
   nobody in this project can read back.
2. **It is all-or-nothing per key.** Adding a key to the `Translations` interface without
   filling all sixteen locales makes `locale_completeness_check.mjs` fail, correctly. A
   half-finished pass leaves `main` red, which rule 10 forbids.
3. **Convention (l.6) is explicit**: "Unsolved beats wrongly solved. Where certainty is not
   reachable, PARK the item with its options and their trade-offs and move on."

**What is therefore true today, stated without softening**: these strings render English in
all sixteen locales. They did before this session and they still do. Nothing regressed and
nothing was hidden; what changed is that the set is now counted, listed and gated for
growth rather than being an unbounded estimate in a tracker row.

**The complete list, so the surgical brief needs no rediscovery.**

*Markup text nodes, player-visible (deduplicated):*

| String | Sites |
|---|---|
| `Session` | `HudOverlay.svelte:379, 489, 590, 744` |
| `Stop on win` | `HudOverlay.svelte:445, 665, 863` |
| `Single win limit` | `HudOverlay.svelte:446, 666, 864` |
| `Stop on feature` | `HudOverlay.svelte:450, 670, 868` |
| `Loss limit` | `HudOverlay.svelte:451, 671, 869` |
| `Spins` | `HudOverlay.svelte:455, 675, 873` |
| `Mute` / `Unmute` | `HudOverlay.svelte:382, 517, 593, 747` |
| `Press COLLECT or hit Enter to continue` | `MaxWinCelebration.svelte:111`, the string TR-059 named by name |
| `Match symbols on adjacent reels starting from reel 1 (left to right).` | `PaytableModal.svelte:188` |
| `All matching symbol positions count, with no fixed paylines.` | `PaytableModal.svelte:189`, the string TR-060 found an em dash in |
| `Reels 1, 2 and 3 hold the same symbol (highlighted)...` | `PaytableModal.svelte:214` |
| `Symbol Payouts`, `Cost`, `Interface Guide`, `RTP (All 5 Modes)`, `Max Win`, `Responsible Play`, `Disclaimer` | `PaytableModal.svelte:219, 314, 351, 387, 388, 395, 407` |
| `3 / 4 / 5 = 1× / 3× / 10× + 8 / 12 / 16 free spins` | `PaytableModal.svelte:227` |
| `Substitutes for all symbols except SCATTER` | `PaytableModal.svelte:229` |
| `Scatters`, `Free Spins`, `Instant Award` | `PaytableModal.svelte:258`, the Overdrive trigger table headers |
| `coming soon` | `PaytableModal.svelte:309`, unreachable today per Q-18 |
| `Loading replay…`, `Replay failed to load`, `Mode:`, `Replaying round…` | `ReplayMode.svelte:269, 272, 299, 309`, a mandatory surface |

*Static player-facing attributes, player-visible:*

| Attribute | Sites |
|---|---|
| `aria-label="Close"` | `FeatureMenu.svelte:321`, `SessionPanel.svelte:97`. Note `PaytableModal` uses `aria-label={$tr('close')}` for the same control, so two members of one modal family disagree; that is itself the casing and consistency class. |
| `aria-label="Features"` | `FeatureMenu.svelte:302` |
| `aria-label="Overdrive Free Spins"` | `FreeSpinsPresentation.svelte:362` |
| `aria-label="Music volume"` | `HudOverlay.svelte:386, 597, 756` |
| `aria-label="Sound effects volume"` | `HudOverlay.svelte:391, 602, 767` |
| `aria-label="Cycle speed (Normal / Turbo / Super Turbo)"` | `HudOverlay.svelte:404, 642, 719` |
| `aria-label="Max Win reached"` | `MaxWinCelebration.svelte:69` |
| `aria-label="Collect max prize"` / `"Collect max win"` | `MaxWinCelebration.svelte` collect button |
| `aria-label="A matching way reads left to right..."` | `PaytableModal.svelte:202` |
| `aria-label="Overdrive trigger table"` | `PaytableModal.svelte:256` |

Screen-reader text is player-facing text: that is the R4/TR-012 lesson recorded at
`.github/workflows/checks.yml`'s gate 6a, where 14 control labels shipped carrying a
restricted phrase because the visible-text sweep never read `aria-label`. The attributes
above are the untranslated half of the same surface.

*Not in the set, with reasons:* `LoadingScreen.svelte:72` `WE ROLL SPINNERS` is the studio
brand name and is never translated (already allowlisted). `ThemeSelector`'s four strings are
dev-only. `App.svelte`'s eight are the DEV panel.

**The rule for the surgical pass**: where a string is already correct in one place and
hardcoded in another, reuse the existing key rather than create a second one, so the two
surfaces cannot drift apart. Two implementations of one concept is the defect; the drifted
copy is only the symptom. That is the lesson of the currency-table fix in
`reports/FABLE_COMMS.md` entry 001 and of the twenty-two drifted `dismissIntro` copies.

### 4.4 What the gate's own first run corrected in the gate

Recorded because a gate that has never been wrong about anything has probably never run.
Its first scan of the real tree produced two findings that were not defects, and both were
fixed in the gate rather than allowlisted line by line:

1. **Test files were being scanned.** `sessionRecovery.test.ts:185` was reported for a
   double space inside a fixture. A test asserts on malformed prose by design. Test and
   spec files are now excluded, and a negative control pins that.
2. **The canonical formatter was being reported for doing its job.**
   `src/lib/utils/currency.ts:223` calls `amount.toFixed(decimals)` inside `formatBalance`,
   which is what that function is FOR. The class this gate enforces is money formatted
   anywhere OTHER than there, so the one canonical module is exempt, and a negative control
   written at a path that really ends in `src/lib/utils/currency.ts` exercises the shipped
   predicate rather than a restatement of it.

---

## 5. The gate

`frontend/scripts/machine_tell_gate.mjs`, wired into the `static gates` CI job.

It scans **source and dist**, dist being the authority for the same reason
`dash_gate.mjs` gives: dist is what reaches a player and it is agnostic to how a string was
authored.

### 5.1 Convention (p) is satisfied by seeding the forms that really shipped

`CLAUDE.md:470` states the requirement exactly: "plant the exact defect the gate exists to
catch, in the form it really occurs, and prove the gate goes red." A seed in a form the
gate happens to handle, while the real defect occurs in another form, teaches nothing.
That is how `player_string_dash_check.mjs` passed twice while blind.

So every seed in this gate's self-test is a string that was actually in the repository at
HEAD `3f0d686` before this pass fixed it:

| Seed | The real form it reproduces |
|---|---|
| `<title>future-spinner-frontend</title>` | Q-01, the scaffold title, in markup rather than in a JavaScript literal |
| `wincap: '🏆 MAXIMUM WIN, 5,000×!'` | Q-02, an emoji inside a locale table value |
| `{$isMuted ? 'Unmute' : 'Mute'} {$isMuted ? '🔇' : '🔊'}` | Q-03, emoji inside a Svelte interpolation, which no plain string scan sees |
| `<div class="c1-crown crown" aria-hidden="true">★ ★ ★</div>` | Q-04, a dingbat as markup prose between tags |
| `<span class="fs-face">✕</span>` | Q-05, a dingbat inside a nested element |
| one locale block carrying both `'` and `’` | Q-08, the mix that must be detected per locale, not per file |
| `Votre session n a pas` | Q-09, a dropped apostrophe, which is not a mixed-form defect and needs its own detector |
| `<label>$<input ...></label>` | Q-10, a hardcoded currency symbol adjacent to an input |
| double space inside markup prose | class 3 |
| **negative control**: a clean file of each kind | a gate that fails on clean input is useless in a different way |

The gate is red on every seed and clean on every control, or it exits non-zero and its
PASS means nothing.

### 5.2 What the gate deliberately does NOT do

Stated so a future reader does not mistake silence for coverage.

- **It does not judge non-Latin scripts.** Orbitron is Latin-only, so Arabic, Hindi,
  Japanese, Korean, Russian, Thai, Vietnamese and Chinese text falls back to a system face
  by design and always will. The gate flags symbol and pictograph blocks, which are
  locale-independent interface furniture, not the locale scripts themselves.
- **It does not decide cross-surface capitalisation or button casing** (classes 4 and 7).
  Those need the rendered DOM at a given viewport, which is a browser gate's job. They stay
  review items and are named as such rather than being quietly claimed.
- **It does not read locked files as authority.** `gameStore.ts` carries four em dashes in
  comments, recorded under LOCKED_FILE_DEBTS (`CLAUDE.md:181`). They are comments, they
  never reach dist, and they are not this gate's to fix.

---

## 6. How to run it

From `frontend/`:

```bash
node scripts/machine_tell_gate.mjs --self-test
```

```bash
node scripts/machine_tell_gate.mjs --source
```

```bash
node scripts/machine_tell_gate.mjs
```

The third form scans dist and needs `npm run build` to have run first, exactly like
`dash_gate.mjs`.
