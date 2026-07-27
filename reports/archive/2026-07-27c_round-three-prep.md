# Session Report: ROUND-THREE PREP, the two unrun tracks executed on main (2026-07-27c)

Brief saved verbatim: `reports/briefs/FS_ROUND3_PREP_Prompt.md`. Fresh session on `main`,
integrator role, explicit paths, one commit per job, no lock exceptions taken and none
needed: no locked path was touched at any point.

**Multi-job justified per protocol rule 4.** Six jobs, and the brief named them as one
sequence because two of them are the substance of prepared track briefs that were never run.
The tracks existed precisely so this work could be parallelised, and it was not, so the
alternative to running them here was leaving them unrun for a fourth session.

## JOB 0: the analyst PR merged under standing conditions

PR #116 met both of Fable's standing approval conditions and was merged rather than left.
**Scope gate green**: `TRACK SCOPE: branch track/screenshot-analyst, 13 glob(s), 25 changed
file(s), 0 out of scope`, `DISJOINT: 3 manifest(s), 2810 tracked file(s), 0 file collision(s)`,
`LOCKED PATHS: PASS`, both CI jobs success on run 30218099265. **Ledger-only content**: 25
files, all under `docs/records/`, `reports/screens/`, `reports/qa/live_stats/`,
`reports/briefs/` and `reports/tracks/`. No source, no maths, no locked path.

## JOB 1a: the quality charter, the sweep, and the gate

`docs/QUALITY_CHARTER.md` did not exist. `CLAUDE.md:502` has cited that path since the
standing mandate was recorded, so the mandate has been pointing at a missing document.

**The Valkyrie benchmark is stated in seven checkable properties**, because the brief asked
for checkable terms rather than an adjective, and because Valkyrie turns out not to be a
metaphor: it is a real publisher in our own first-party capture of the platform's FAIR
catalogue (`docs/stake-engine-live/2026-07-28/fair-catalogue.md`), whose Lokis Vault is at
version 746 with 3,600,000 events per mode, and whose second title is captured frame by frame
under `docs/reference/competitor-demos/waylanders-forge/`.

**Derived before measured, per convention (l).** The Orbitron subset was read out of the
shipped woff files FIRST: 183 codepoints, carrying U+0027, U+2019 and U+00D7, and not
carrying U+2715, U+2192, U+2605, U+2713 or U+221E. Only then were strings judged against it.
That order is what made the icon findings provable rather than aesthetic.

**What was shipping, counted in `dist` rather than estimated:** 35 symbol glyphs, 31 of them
player-visible. A trophy emoji in `wincap` across all sixteen locales and the social
override; two emoji speakers at four layout profiles; `★★★` on the max-win crown; two `✕`
close controls; one `→`. An operating-system emoji is drawn by a different vendor on every
platform and can never carry the brand face; a dingbat outside the subset falls back for that
one character mid-line, and no stylesheet says so.

Twenty-two findings, all dispositioned, in `docs/QUALITY_CHARTER.md` 4.2. Also fixed: the
French locale using both apostrophe forms in one rules list and a French error banner with
the apostrophe absent entirely (`git log -S` shows it was never there); a hardcoded `$`
beside the autoplay loss limit at three profiles in a game whose owner plays it in euro; the
last money `.toFixed` in the tree; a letter `x` where every other surface writes `×`; the
Vite scaffold's own `:root` font stack naming no brand face; a `Segoe UI` declaration, which
is the Windows system face; two Courier New declarations, one on the first text a player
reads; and the Svelte starter logo, still committed.

**One item reviewed and KEPT with its reason recorded rather than the finding hidden:** the
infinity symbol. It labels the infinite-autoplay option in a button row whose other members
are the numerals 10, 25, 50 and 100. It is a member of a numeric series rather than an icon,
and a drawn lemniscate among numerals would read worse. Four instances remain in `dist` and
that is the whole of what the gate permits.

**One item PARKED and EXTRACTED per protocol rule 6, not deferred quietly.** The
player-visible English that is not routed through the translation function. Counted rather
than guessed: **27 static player-facing attributes and 48 markup text nodes**, reducing to
about 35 keys, about 560 values across sixteen locales, listed in full in the charter's 4.3
so the surgical pass needs no rediscovery. TR-059's estimate was right. Writing 560 values of
eleven languages in the margins of a six-job session is exactly the case rule 6 exists to
prevent, and a partial pass leaves `locale_completeness_check.mjs` red, which rule 10
forbids.

**The gate**, `frontend/scripts/machine_tell_gate.mjs`, in the static CI job before and after
the build. Convention (p) is met the way `CLAUDE.md:470` demands: **all ten seeds are strings
that were really in this repository at HEAD `3f0d686`**, in the file shape they were found
in, including the two forms a plain string scan cannot see (a locale table value and a Svelte
interpolation). Eight negative controls.

**The gate's own first real run corrected it twice, and both corrections are pinned.** It
flagged a sentence inside `sessionRecovery.test.ts`: a test asserts on malformed prose by
design, so test files are excluded. And it flagged `currency.ts` calling `toFixed` inside
`formatBalance`, which is what that function is FOR: the canonical formatter is the one
exempt file. The control for the second is written at a path that really ends in
`src/lib/utils/currency.ts`, so it exercises the shipped predicate rather than a restatement
of it.

## JOB 1b: the reskin boundary

`docs/RESKIN_BOUNDARY.md`. Section 7b of `WRS_MASTER_DOCUMENT.md` owns the ORDER of a next
title; this owns the CONTENT of its fourth link, the only one whose inputs are art. Both
documents now say so from their own side.

Nine-family skin register answering, per element, where it lives, its measured format and
dimensions, its pipeline and seed convention, and **which gates must re-run after a swap**.
Twelve honest gaps ranked hardest first, named and not solved.

**Three corrections to section 7b's own shorthand**, now cross-referenced from it. It says
"new seeds/prompts"; exactly one family has a seed (AudioForge, `BASE_SEED = 20260707`),
AssetForge is deterministic by construction with none, and the brand emblem has no recorded
seed, model version or date at all. It says "all scripts are reusable"; broadly true, and
Part 3 names the six whose assertions are title-specific.

The inventory came from a research pass and its load-bearing claims were re-verified
first-hand rather than taken on trust: `bg-1.jpg` really is a PNG carrying a `.jpg` name, the
audio seed really is at that line, and `logo.png` and `frame-2.png` really are byte-identical
to legacy-root files, checked by `shasum` on both pairs.

## JOB 2: the three root documents to HEAD

`SUBMISSION_DOSSIER.md` gains section 9 as the current state; section 8 stays the
2026-07-25 snapshot it is, with a correction table rather than an edit. Four live
confirmations with their capture paths, the payload shapes quoted from the wire, all four art
adoptions with hashes and measurements (only one was recorded before), and the display
convention.

A fifth confirmation the brief did not name: **the ACP maths screen has been read live and
every constraint passes at both star tiers**. Three consequences recorded as OPEN: section 5f
reads un-run when it has substantially been run; the CVaR question has an answer on file; and
**two first-party sources disagree on the 2-star Maximum Exposure limit**, 10,000,000
published against 15,000,000 on the platform's own screen. Raised, not silently corrected.

`GAME_FACTS.md` carried the most serious single line in the three documents. "No externally
sourced or AI-generated stock art" was true when written and has not been true since
2026-07-25. It is now a table of four assets with class, measurement and permitting clause,
and it states that every symbol, frame, particle and animated element still comes from the
in-house masters, because that is the line the rule actually draws and it is unbroken. Six em
dashes removed from the same file, which is a machine-tell in a document compiled for
external audit.

`FIX_LIST_2026-07-26.md`: all eighteen rows re-dispositioned against HEAD, seven stale and
three stale in part. Originals untouched. **Three tracker Status cells corrected** (TR-061,
TR-065, TR-063), each reading OPEN while the same row's own fix evidence recorded the fix.
**Two ledger rows promoted** to TR-086 and TR-087, which is the integrator's job under the
analyst track's own brief; both were HIGH and neither had a row.

## JOB 3: the owner checklist

`OWNER_CHECKLIST.md` at the repository root. Seven items, phone-readable, each with its why,
what to send and a DONE-when naming specific fields.

**Three of the brief's own premises turned out to be wrong** and the document says so up
front. The Guidelines list has seven owner rows, not nine (three numbers are in the
repository: 9 in the walkthrough, 8 in the document's summary, 7 rows actually bearing the
token). The USPTO claim is refuted as stated: a confirmation IS recorded, the owner's
attestation of 2026-07-23; what is missing is the evidence behind it. ABN, GST and the
accountant are one register row, not three, and two facts inside it are gaps rather than
statuses.

**Two items restored that had quietly fallen off**: the zero-win end-round observation, which
the project calls its highest-value single observation left and which no current walkthrough
section asks of anyone; and the full scrolled Language list that TR-059 is parked on.

## JOB 4: the polish review pack

`reports/screens/polish-review-2026-07-27/`, 91 frames at the seven platform presets from the
**production build**, plus `MANIFEST.json` and a README index.

The harness was committed FIRST, in its own commit, specifically so the build these were
taken from had a clean tree: build commit `2745b4d8`, `cleanTree: true`, 109 files,
15,607,103 bytes. Eight real rounds went through the intercepted wallet.

**Two failures during development, both caught by the harness's own guard rather than by
inspection.** With `cap` third and `feature` fourth, the feature round never reached the
wallet; swapping them moved the failure rather than fixing it. The common factor was that a
fourth spin cannot start inside the settle window after three presentations have run. The
guard reported `walletCalls.play === before` and SKIPPED the shot both times rather than
photographing a stale screen under an informative filename, which is the failure this
repository has shipped before. The fix is a fresh browser context for the cap round, not a
looser guard.

## JOB 5: the round-three reviewer prompt, DRAFT

`docs/records/reviews/round3_reviewer_prompt_DRAFT.md`, marked DRAFT FOR FABLE'S
RATIFICATION on its first two lines.

**The round-two reviewer prompt does not exist in this repository**, and per convention (m)
it is named as a missing input rather than reconstructed. Searched directly: every file under
the reviews tree, both brief directories, the full git history of additions there, and a
content search for the round-one prompt's distinctive phrases.

So the draft states what it IS built from: the round-ONE prompt, which survives verbatim
because one reviewer's export echoed its own instructions; plus the round-two deliverable's
eighth section, REMEDIATION VERIFICATION, carried forward on OBSERVED evidence (all three
round-two reviews return it) rather than recovered text. That inference is flagged for Fable
as one of five decisions that are his.

## Self-audit before reporting, per convention (l.5) and facts-discipline item 4

Re-deriving this session's own claims found one wrong, and it is recorded rather than edited
away. **QUALITY_CHARTER Q-01 claimed the Vite scaffold package name was the browser tab title
permanently**, on the strength of `grep -rn "document.title"` returning nothing. That grep was
the wrong instrument: `App.svelte:1507` sets the title through `<svelte:head>`, which never
mentions `document.title`, and it reaches `dist`. The scaffold name is the PRE-HYDRATION
title only. The fix stands and is still worth having; the severity claim was wrong, and Q-01,
the gate comment, the workflow comment and the master-document row all now say so.

Locked paths: none touched, verified by `git diff --cached --name-only` against the four
locked paths on every commit. `.claude/settings.json` never edited. No lock exception taken.

## Gates

Local, at the end of the session: machine tell gate self-test PASS (10 seeded caught, 8
controls clean), source and dist PASS; dash gate source and dist PASS; locale completeness
PASS; dead wiring PASS; `npm run check` 0 errors and the committed 36-warning baseline.
Browser gates re-run rather than assumed after JOB 1a, because a root font change moves text
metrics on every surface: layout fit PASS at all seven presets, contrast PASS, paytable card
fill PASS across 374 cards in sixteen locales, splash calm PASS, scrim coverage PASS, turbo
intensity PASS.

### FOR THE NEXT SESSION

**Model and effort.** Opus 5 at high effort, integrator role on `main`.

**Approach.** Derive before measuring throughout. The single decision that made JOB 1a
provable rather than aesthetic was reading the Orbitron subset out of the shipped font files
BEFORE judging any string: it turned "these icons look inconsistent" into "these five
codepoints are absent from the brand face, so they fall back per character, here is the
list". Everything else followed from that one measurement.

**Alternatives tried and rejected.**

- *Writing the 560 locale values in this session.* Rejected under protocol rule 6 and
  convention (l.6). It is the tempting wrong answer because the strings are enumerated and
  the work looks mechanical; it is not, because a wrong Japanese autoplay stop-condition is a
  compliance defect nobody on this project can read back, and a partial pass leaves the locale
  gate red.
- *Replacing the infinity symbol with a drawn lemniscate.* Written, then rejected on looking
  at the control: it sits among the numerals 10, 25, 50 and 100, and an icon among numerals
  reads worse than the conventional symbol. Allowlisted with the reason instead.
- *Allowlisting the two false positives the gate's first run produced.* Rejected. Both were
  gate design flaws, not exceptions: test files are not a player surface, and the canonical
  formatter must call `toFixed`. Fixed in the gate with negative controls pinning both.
- *A looser guard on the fourth capture round.* Rejected twice. The guard was right both
  times; the harness was wrong. Fresh browser context instead.
- *Reconstructing the round-two reviewer prompt from its outputs.* Rejected under convention
  (m). The round-three draft says what it is built from and flags the inferred section.
- *Editing the original fix-list rows in place.* Rejected: it would destroy the record of what
  was believed on the day. Re-dispositioned in a new section instead.

**Files touched.** `docs/QUALITY_CHARTER.md` (new), `docs/RESKIN_BOUNDARY.md` (new),
`OWNER_CHECKLIST.md` (new), `docs/records/reviews/round3_reviewer_prompt_DRAFT.md` (new),
`frontend/scripts/machine_tell_gate.mjs` (new),
`frontend/scripts/polish_review_capture.mjs` (new),
`reports/screens/polish-review-2026-07-27/` (new, 91 frames plus README and MANIFEST),
`reports/briefs/FS_ROUND3_PREP_Prompt.md` (new), `SUBMISSION_DOSSIER.md`, `GAME_FACTS.md`,
`COMPLIANCE_WATCH.md`, `WRS_MASTER_DOCUMENT.md`, `docs/records/reviews/FIX_LIST_2026-07-26.md`,
`docs/records/reviews/REVIEW_TRACKER.md`, `reports/FABLE_COMMS.md`,
`.github/workflows/checks.yml`, `frontend/scripts/locale_completeness_check.mjs`,
`frontend/index.html`, `frontend/src/app.css`, `frontend/src/App.svelte`,
`frontend/src/lib/i18n/translations.ts`, eight components under
`frontend/src/lib/components/`, and `frontend/src/assets/svelte.svg` (deleted). This report
and its archive copy.

**Open threads.**

1. **The kit version live on the portal is not known**, and it is the most consequential open
   item in the project. The last frontend version confirmed published anywhere in the
   repository is Front V2; four kits have been built since. Every fix in this session and the
   two before it is therefore of unknown liveness.
2. **The 560-value locale pass** wants its own surgical brief. Everything it needs is
   enumerated in `docs/QUALITY_CHARTER.md` 4.3.
3. **The 2-star Maximum Exposure disagreement** between two first-party sources, raised and
   not resolved.
4. **The COST-column question** (SA-002, SA-007), waiting on a ruling since 2026-07-26.
5. **TR-086**, the mini strip cutting a balance below about 390 css px, promoted this session
   and open. **TR-087** is fixed at source and awaits a live re-capture before it closes.
6. **The round-three reviewer prompt** is a draft and must not be run until Fable rules on the
   five decisions listed in its section E.
7. **Cross-surface capitalisation and button casing** (sweep classes 4 and 7) are review items
   rather than gated ones, and the charter says so rather than implying coverage.

---

## Rule 10 closing

**Final push `0c02cbf`, run 30231843095, GREEN on both jobs.**
https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30231843095

The run that matters more is **30231530987** on `49474c1`, GREEN on both jobs, because it is
the first run to carry every code change this session made through the REMOTE runner: the new
`machine_tell_gate.mjs` self-test and both its scans, the locale gate with its new allowlist
entry, and all six browser gates against a build whose root font stack changed. The closing
run is documentation only.

https://github.com/JTOSHIE/stake-game-development-claude/actions/runs/30231530987

**Three earlier runs on `main` this session, all accounted for.** 30229993768 on `3e676a1`
(JOB 1a) green both jobs. 30230730422 on `bea7242` (JOB 5) green both jobs, and it carries
JOB 2's content since `bea7242` is a descendant of `4345b9e`. 30230552617 on `4345b9e` shows
**cancelled**, and it is not a red: `concurrency: cancel-in-progress` in `checks.yml` cancels
a run when a newer commit lands on the same ref, which is what the JOB 5 push did seconds
later. Named here rather than left for a reader to work out, because rule 9 says an
unexplained non-green is treated as real and the way to keep that worth something is to
explain the explainable ones by name.

**And the PR that opened the session:** run 30218099265 on PR #116, green both jobs, which is
half of the standing approval condition under which it was merged.
