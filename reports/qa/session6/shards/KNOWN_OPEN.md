# Shard: read and recount of `reports/qa/stream_test/KNOWN_OPEN.md`

Audited `reports/qa/stream_test/KNOWN_OPEN.md` at HEAD `de2fa2341dfd48ba113d872d22da6eb1894d5108`
(`de2fa23`, branch `main`).

Australian English. No em dashes or en dashes.

## How many claims, and how they were chosen

**39 claims checked.** Selection rule: every claim in the document that names a repository
artefact (a file path, a line number, a commit SHA, a count, a grep result, a directory, a
gate script, a tracker or charter disposition) and can therefore be settled by running one
command against HEAD. Prose about method, reasoning and lessons was read but not treated as
checkable, since it asserts nothing about the repository's current state.

**Excluded by the scope ban:** the `TR-115 / TR-086` row (line 16) was NOT measured,
analysed or proposed on, because it is a money-display row and money-path work is out of
scope for this pass. The row is reported here as untouched, not as verified.

## STALE findings

| Line | Claim, quoted short | Command run | Result | Proposed correction |
|---|---|---|---|---|
| 21 | Q-27: *"`app.css:160-162` styles `button:focus` with Chrome's own `-webkit-focus-ring-color` `rgb(0, 95, 204)`, so a stock browser blue ring sits on the last-touched control"* | `grep -n "webkit-focus-ring-color\|005fcc\|0, 95, 204" frontend/src/app.css` then `sed -n '145,180p' frontend/src/app.css` then `git log -1 --format='%h %cd %s' --date=short 4e8cfb5` | The ONLY hit for `rgb(0, 95, 204)` in the file is at **line 183, inside a comment** that reads *"THE RECORDED CAUSE WAS WRONG AND IS CORRECTED HERE"*. There is no `button:focus` rule. `app.css:160` is now `text-align: center;` inside the `#app` block. The commit is `4e8cfb5 2026-07-30 fix(a11y): S2-C017, the focus ring fired on mouse focus across roughly ninety buttons`. `docs/QUALITY_CHARTER.md:199` independently records the same closure. | Restate as a dated PAST-TENSE closure naming the commit and row, and keep the residue that really is still open. Full replacement text below. |
| 21 | Q-27: *"Also still open: ... scaffold body centring"* | `grep -n "place-items\|display: flex" frontend/src/app.css` then `git log -1 --format='%h %cd %s' --date=short 3047c61` | `place-items` survives only as the text of a comment at `app.css:125` reading *"`place-items: center` was here, from the create-vite scaffold (31fdbcf, 2026-02-20) ... Removed 2026-07-31"*. The declaration is gone. Commit: `3047c61 2026-07-31 fix(replay): the replay page could not scroll, so something was always off screen`. | Same replacement; move body centring out of the still-open list and into the dated closure, naming `3047c61`. |
| 27 | MID-01b: *"`App.svelte:1689` and `:1716` are mutually exclusive branches of one `{#if isReplay}`, and `WinDisplay` is mounted only by `ReplayMode.svelte:309`"* | `awk 'NR>=1690 && NR<=1760 && (/{#if isReplay}/ \|\| /{:else}/ \|\| /{\/if}/) {print NR": "$0}' frontend/src/App.svelte` and `grep -rn "WinDisplay" frontend/src` | `{#if isReplay}` is at **`App.svelte:1697`** and its `{:else}` at **`:1700`**, not 1689 and 1716. `<WinDisplay />` is at **`ReplayMode.svelte:324`**, not 309. Both files moved under `3047c61` and `d1cd0c3`. | Per convention (s), name the CONSTRUCT rather than the moving line numbers, and record the drift with its date. Full replacement text below. |

### What each command actually measured, stated before the verdict

- The Q-27 focus-ring command measured **whether the literal `rgb(0, 95, 204)` and a
  `button:focus` rule exist in `frontend/src/app.css` at HEAD**. That is the same question
  the claim makes, because the claim is specifically about that file and that rule. It does
  NOT measure whether a browser default focus ring is visible to a player, which is a
  different question and was not asked.
- The `place-items` command measured **whether the declaration exists in `app.css` at
  HEAD**. It does not measure whether anything else centres the body.
- The MID-01b command measured **which line numbers those constructs sit on at HEAD**. It
  does not re-litigate the row's reasoning, which still holds: `WinDisplay` is still mounted
  only from `ReplayMode.svelte`, and `App.svelte` still has exactly one `{#if isReplay}` with
  an `{:else}`, so the row's conclusion ("no player sees two figures disagree") is unchanged.
  Only the citations drifted.

### Proposed replacement text, in full

**Line 21, Q-27.** Replace:

> `**OPEN and WIDER than recorded.** Session 1 added a player-visible instance the row did not have: `app.css:160-162` styles `button:focus` with Chrome's own `-webkit-focus-ring-color` `rgb(0, 95, 204)`, so a stock browser blue ring sits on the last-touched control through spin, win and COLLECT on a cyan and magenta game. Also still open: stock indigo link colours, `background-color: #242424`, scaffold body centring, and`

with:

> `**PARTLY CLOSED since this row was written.** Session 1 added a player-visible instance the row did not have: a `button:focus` rule in `app.css` carrying Chrome's own `-webkit-focus-ring-color` `rgb(0, 95, 204)`. That instance was **CLOSED 2026-07-30 by commit `4e8cfb5` (S2-C017)**, which stopped matching plain `:focus` rather than recolouring it, because `outline-style: auto` makes a declared colour inert; and **scaffold body centring was removed 2026-07-31 by commit `3047c61`**, as part of letting the replay route scroll. As at 2026-07-31 the residue `docs/QUALITY_CHARTER.md` Q-27 still records open is: stock indigo link colours, `color-scheme: light dark`, `background-color: #242424`, and`

The sentence then runs on into the document's existing `` `#app { text-align: center }` which
strands paytable bullet markers `` clause, which was re-verified and is UNCHANGED:
`text-align: center` is live at `app.css:160`, and cluster C-07 is defined at
`CLUSTERS.md:59`.

**Line 27, MID-01b.** Replace:

> `` `App.svelte:1689` and `:1716` are mutually exclusive branches of one `{#if isReplay}`, and `WinDisplay` is mounted only by `ReplayMode.svelte:309` ``

with:

> `` `App.svelte`'s single `{#if isReplay}` and its `{:else}` are mutually exclusive branches, and `WinDisplay` is mounted only from `ReplayMode.svelte` (line citations dropped 2026-07-31 per convention (s): the `App.svelte:1689`/`:1716` and `ReplayMode.svelte:309` written here had drifted to `:1697`/`:1700` and `:324` by HEAD `de2fa23`) ``

## UNKNOWN

- **Q-16 park, the sizing "about 35 keys, about 560 translated values" (line 19).** Not
  settled. A sample of the named strings was checked and every one is still present as an
  English literal: `Stop on win`, `Loss limit`, `Symbol Payouts`, `Interface Guide`,
  `Responsible Play` and `Press COLLECT` in `frontend/src/lib/i18n/prose.ts` (with
  `Symbol Payouts` and `Interface Guide` also in `PaytableModal.svelte`), and `Unmute` in
  `HudOverlay.svelte`. But the document's own count is hedged ("about"), and
  `docs/QUALITY_CHARTER.md:178` states the Q-16 class as **27 attributes plus 48 markup
  text nodes**, while charter row Q-33 records that the 4.3 enumeration is INCOMPLETE and
  names two further classes it missed. Three figures that do not reconcile, and no command
  I ran settles which is the intended denominator. Left UNKNOWN rather than guessed.
- **Q-28, whether the comments still ship in `dist/index.html` (line 22).**
  `git ls-files frontend/dist/index.html` returns nothing, so `dist/` is not tracked and the
  working copy present on this machine (`1454` bytes, mtime 31 Jul 05:00) is a local build
  artefact, not repository state. `frontend/index.html` does carry 2 HTML comments and the
  local `dist/index.html` carries 2, which is consistent with the claim, but a local build is
  not evidence about HEAD and I did not run a build. UNKNOWN, and the charter row at
  `docs/QUALITY_CHARTER.md:200` still reads OPEN.
- **TR-104's closure DATE (line 15).** The document says *"CLOSED 2026-07-29 by TR-117"*.
  `REVIEW_TRACKER.md:279` says TR-104 is *"CLOSED 2026-07-30"* while `:298` says TR-117 is
  *"FIXED 2026-07-29"*. Both readings are defensible (fix date versus row-close date) and no
  command distinguishes which the sentence means. Not proposed as a correction.
- **Line 16, TR-115 / TR-086.** Deliberately not checked. Money path, out of scope.

## Claims re-verified as still TRUE (recorded so nobody re-checks them)

- Header `at HEAD d9bdf22`: that SHA resolves, `2026-07-28 docs(brief): FS_STREAM_TEST saved
  verbatim per convention (f)`. Historical record, correct.
- TR-104 (line 15): `WinBanner.svelte:214` is `$: tierLabel = t($locale, ...)` and `:235` is
  `$: multUnitLabel = t($locale, 'bet', $isSocial ? 'social' : 'real')`.
  `reports/screens/winbanner-fix-2026-07-29/` exists.
- TR-114 (line 17) and TR-112 (line 18) are still **OPEN** in `REVIEW_TRACKER.md:295` and
  `:293`.
- Q-26 (line 20): `frontend/scripts/multiplication_sign_gate.mjs` EXISTS;
  `grep -coE "[0-9](\.[0-9]+)?,?[0-9]*x"` returns **0** for both `prose.ts` and
  `prose.locales.ts`; the U+00D7 count **was exactly 167 at `fec8d61`** (17 + 150), which is
  what the document claims, so the past-tense figure is correct even though the live count is
  now 169 after `d459c42` and `ae40604`; `fec8d61` is
  `2026-07-30 fix(Q-26): the multiplication sign is U+00D7 in all 51 player-visible instances`;
  `reports/qa/session4b/social_string_conformance_2026-07-30_q26_reproof.json` EXISTS.
- Q-34 (line 23) is still **OPEN** at `docs/QUALITY_CHARTER.md:273` onward, with the
  direction still recorded as an art call.
- Q-07 (line 24): the allowlist entry is live at `frontend/scripts/machine_tell_gate.mjs:86`.
- TR-089 (line 25): `frontend/scripts/win_countup_steady_gate.mjs` EXISTS.
- MID-01 (line 26): `frontend/src/lib/stores/winCountUp.ts` and
  `frontend/scripts/win_countup_sync_gate.mjs` EXIST;
  `reports/screens/mid01-countup-sync-2026-07-30/` EXISTS; `9ac424b` is
  `2026-07-30 fix(MID-01): the banner and the WIN pod now count up on one clock`.
- MID-01b (line 27): `WinDisplay.svelte:50` is exactly `const duration = 600`. The line
  reference in the "What the squads will see" column is correct; only the State column's
  references drifted.
- RTL (line 28): `grep -rn 'dir="' frontend/src` returns NOTHING; a grep for
  `margin-inline`, `padding-inline`, `inset-inline` and `text-align: start|end` across
  `frontend/src` returns NOTHING; `frontend/index.html:2` is `<html lang="en">`. All three
  halves of the claim hold.
- Gate blind spot (lines 32 to 34): `locale_completeness_check.mjs` still strips the script
  block (its own comment at `:350` says so) and has not been touched since `bac74d8`, which
  predates TR-104. The blind spot claim stands.
- Shard corpus (lines 43 to 46): `ls -1 reports/qa/stream_test/shards/*.md | grep -v
  SHARD_INDEX | wc -l` returns **54**. `CLUSTERS.md:13` reads
  *"566 active findings: 60 STREAM, 183 HIGH, 242 MEDIUM, 81 LOW"*, and 60 + 506 = 566.
- Cluster dispositions (lines 62 to 71): `CLUSTERS.md:243` carries
  `| **UNDISPOSITIONED** | **1** | **C-12** |`, and C-12 is defined at `CLUSTERS.md:64`
  exactly as quoted.
- C-01 (line 74): `frontend/src/lib/components/GameGrid.svelte:499` is
  `const DROP_H = 520`.
- `vocabulary.test.ts` (line 84): exists at `frontend/src/lib/i18n/vocabulary.test.ts`.

## HANDED FORWARD (real, out of scope for this document)

1. **`docs/QUALITY_CHARTER.md` Q-27 records the same partial closure that this document does
   not, and the two disagree on one item.** The charter (`:199`) lists `#app`'s `max-width`,
   `padding` and `text-align` as still open and does NOT mention the paytable bullet-marker
   consequence (cluster C-07) that `KNOWN_OPEN.md` attaches to `text-align: center`. Neither
   document is wrong; they are two partial views. Somebody with a ruling should decide which
   is the register of record for Q-27. No tracker row proposed here.
2. **Q-26's live U+00D7 count has moved past its recorded figure**, 167 at `fec8d61` to 169
   at HEAD, via `d459c42` and `ae40604`. The document's sentence is past tense and therefore
   still correct, so this is NOT a finding against it. Flagged only because any future
   instruction phrased against "167" would go stale immediately, which is convention (s)'s
   exact failure mode.
3. **`frontend/dist/` is present in the working tree but untracked.** That is why the Q-28
   claim could not be settled from HEAD. Not proposed as a change to anything.

## COVERAGE: what this shard did NOT check

Read this as partial. Specifically NOT checked:

- **The entire TR-115 / TR-086 row (line 16).** Money path, banned by the brief. No command
  was run against it.
- **Whether any listed item is actually FIXED IN THE RENDERED PRODUCT.** Everything here was
  settled by reading source, git history, and the tracker and charter. No browser was opened,
  no gate was executed, no build was run, no screenshot was compared. A source-level closure
  is not proof of a player-visible closure.
- **No gate was run**, per the brief's instruction to prefer reading gates as text. So claims
  that a gate PASSES or FAILS today are unverified; only the gates' EXISTENCE and their own
  comments were read.
- **The 54 shards themselves were counted, not read.** The claim that they contain 566
  findings was checked only against `CLUSTERS.md`'s own arithmetic, which is the same source
  the document cites. That is NOT independent corroboration, per convention (l.4), and it is
  recorded as such rather than presented as a recount.
- **Q-16's key and value counts** were sampled, not enumerated. See UNKNOWN.
- **The document's prose about method and lessons** (lines 77 to 86, the two instrument
  failures) was read but not audited claim by claim.
- **Nothing was checked against remote CI.** `gh run list` was not run.

## Working-tree check

`git status --porcelain` at close reported exactly one new path,
`reports/qa/session6/shards/KNOWN_OPEN.md`, this shard. Nothing else was created, edited or
deleted. The audited document was not touched.
