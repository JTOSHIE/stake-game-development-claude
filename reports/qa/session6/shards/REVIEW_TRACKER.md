# Shard: REVIEW_TRACKER.md

Audited `docs/records/reviews/REVIEW_TRACKER.md` at HEAD `de2fa2341dfd48ba113d872d22da6eb1894d5108`
(short `de2fa23`), branch `main`, on 2026-07-31.

## 1. What was audited and how claims were chosen

The document is 370 lines and 278,754 bytes. Rows are single lines of up to 11.9 kB, so the
document was read by targeted extraction rather than end to end.

**Claims checked: 41.** Chosen in this order:

1. **TR-059 first**, as briefed, in both of its rows (line 199 and line 312).
2. **Every row's Status cell**, extracted mechanically with `awk -F'|'` so that no OPEN row
   could be missed. 132 rows carry a status; 20 distinct rows read OPEN, PARKED or RULED.
   Each OPEN row was then read and its checkable assertions run against HEAD.
3. **Every `file.ext:NNN` citation in the document** (42 unique), extracted by regex and
   checked against HEAD where the row was in scope.
4. **Every backticked path** (280 unique tokens), tested for existence at HEAD.
5. **The four header sections** (source ingest rounds one, two and three; disposition
   vocabulary), whose file names, line counts, SHA-256 prefixes and reviewed commits are
   all checkable.

Out of scope by instruction and therefore not measured: TR-086, TR-109, TR-115, TR-116,
TR-114 and any other money-display question; TR-111, already closed by this session.

## 2. STALE findings

| Line | Claim, short | Command run | Result | Proposed correction |
|---|---|---|---|---|
| 312 | TR-059 status `**OPEN, mapped to JOB 2**` | `git merge-base --is-ancestor 1494bdf HEAD` ; `git log -1 --format=%cd --date=short 1494bdf` ; `git show --stat 1494bdf` | `1494bdf` **IS** an ancestor of HEAD, dated **2026-07-28**, subject `feat(JOB 2): key every player-visible prose string across sixteen locales`, touching 15 files including `prose.ts` (+213), `prose.locales.ts` (+1174) and `locale_prose_conformance.mjs` (+436). It sits 131 commits behind HEAD. | Status cell becomes `**CLOSED IN PART 2026-07-28 by JOB 2 (\`1494bdf\`): the keys landed, the replacement gate is not yet a CI leg**` |
| 312 | `JOB 2 does both: the keys and the replacement gate.` (future tense) | `grep -n "BIG WIN\|MEGA WIN\|EPIC WIN" WinBanner.svelte` ; `grep -n "label\|blurb" fsModes.ts` ; `sed -n '47,53p' PaytableModal.svelte` ; `grep -n "^  [a-z]*: {" prose.locales.ts` ; `grep -rn "locale_prose_conformance" .github/workflows/` | WinBanner holds **no** tier literal (only a comment at `:211` recording that it used to). `fsModes.ts` carries `labelKey`/`blurbKey` of type `ProseKey`, resolved by `t()`. `PaytableModal.svelte`'s `rulesList` is six `$tr()` calls. `prose.locales.ts` holds **15** non-English tables (ar de es fi fr hi id ja ko pl pt ru tr vi zh) beside the `en` base in `prose.ts`, i.e. sixteen locales. **But** `grep` for `locale_prose_conformance` in `.github/workflows/` returns **zero hits**, while `checks.yml:356` still runs `node scripts/locale_completeness_check.mjs`. | Replace with a dated past-tense sentence that names what landed and qualifies the gate half as a script rather than a CI leg (full text in the returned object). |
| 271 | TR-096: the render gate `` at `HudOverlay.svelte:517` and `:753` `` | `grep -n "rgInfiniteAutoplayAllowed" frontend/src/lib/components/HudOverlay.svelte` at HEAD, and the same on `83c7096` (the file's last commit before 2026-07-29) | On `83c7096` the three `{#if}` gates were at **517, 753, 959**, so the row was accurate when written. At HEAD they are at **474, 710, 916**. HEAD line 517 is a `title=` speed-tier ternary and 753 is `<span class="fs-face">`. | Date the citation instead of substituting today's numbers (text in the returned object). |
| 268 | TR-093: `` `frontend/scripts/machine_tell_gate.mjs:540` seeds `` | `grep -n "Jeu indisponible" frontend/scripts/machine_tell_gate.mjs` ; `sed -n '540p'` | The seed is at line **623** at HEAD. Line 540 is **blank**. The file has grown to 858 lines; last touched by `eb357d9`. The seed string itself is unchanged. | Name the seed by its identifier (`errSessionUnavailable`) and date the line number. |
| 273 | TR-098: `` `layout_fit_gate.mjs:199` picks what it calls the deepest text-bearing node `` | `grep -n "querySelector('.m-stat-val" frontend/scripts/layout_fit_gate.mjs` ; `sed -n '199p'` | The selector `el.querySelector('.m-stat-val, .stat-value, span, div') \|\| el` is at line **194**. Line 199 is `return { vw, vh, fits, controls, readouts }`. The `\|\| el` fallback the row describes is still present and still unfixed, so only the line number moved. | Date the line number; leave the substance untouched. |
| 266 | TR-091: `` `frontend/scripts/locale_completeness_check.mjs:133` is `/>\s*(...)/g` `` | `grep -n "LITERAL_RE" frontend/scripts/locale_completeness_check.mjs` ; `sed -n '133p'` | `LITERAL_RE` is at line **175** and its body is byte-identical to the quoted regex. Line 133 is a comment fragment (`* ALLOW above. It sits here rather than in ALLOW only because it is scoped to`). | Date the line number only. The regex text quoted is still exactly right. |

### Notes on the proposed corrections

Per convention (s) every proposed replacement **dates** the moving value rather than
substituting today's one. Line numbers move on the next commit, so none of the five
line-reference corrections writes a bare new number into a present-tense sentence; each
gives both the value as at the row's own date and the value at a named SHA.

**TR-059 line 199 is deliberately NOT proposed for edit.** The document's own rule, stated
above the `Live round three rows` table at line 302, is that a settled row is re-stated in a
later section "rather than edited above, so the change of mind is visible in the document
instead of being silently overwritten". Line 199's `**OPEN**` is superseded by line 312, and
editing it would break the document's convention. The same reasoning covers TR-057 (line 175
PARKED, line 257 OPEN, line 308 CLOSED), TR-087 (line 262 awaiting re-capture, line 310
CLOSED) and TR-081 (lines 250 and 280).

## 3. UNKNOWN

**U-1. TR-096, "this suite is not one of the nine jobs `checks.yml` runs" (line 271).**
The substance is CONFIRMED true: `grep -rn "portrait_layout_conformance" .github/workflows/`
returns only a comment at `checks.yml:18`, never an invocation. But the number **nine** cannot
be settled. At HEAD `checks.yml` defines **three** top-level jobs (`changes`, `static`,
`browser`) and the `browser` job is a matrix of **thirteen** gates. On `00620bf`, the file's
state at 2026-07-28 when the row was written, the matrix held **ten**. Nine matches none of
the three readings, so I cannot tell what the author counted and will not guess a
replacement. Recorded, not corrected.

**U-2. TR-091, "`:142` separately discards any text node containing `{`" (line 266).**
At HEAD there is no `text.includes('{')` discard. A comment at
`locale_completeness_check.mjs:187` calls it "the old `text.includes('{')` line", and the
brace handling now lives in a splitter at `:252` that pushes segments rather than discarding
them. Whether the row's sentence is describing the pre-fix state it found (legitimate, and
merely mis-tensed) or asserting HEAD (wrong) cannot be settled from the row's wording. I
have deliberately kept my proposed edit to the `:133` half of that sentence and left `:142`
alone rather than risk rewriting a correct historical observation.

**U-3. TR-059 line 199, "`locale_completeness_check.mjs`'s hardcoded-literal scan matches
`>([A-Z][A-Z0-9 &'.-]{2,})<`".** That is the PRE-TR-072 regex; the file's own comment at
`:151` says "REPAIRED 2026-07-26 (TR-072). This was `/>([A-Z][A-Z0-9 &'.-]{2,})</g`". The
row is dated 2026-07-26, so it may be an accurate record of that date. Not proposed for edit,
because line 199 is a superseded row under the restatement convention.

**U-4. TR-112 (line 293).** Its figures (1.865 MiB of unreferenced sounds, 886 KB `bg-1.jpg`,
36 `npm run check` warnings, one moderate `qs` advisory) are attributed to the reviewer and
explicitly "not yet independently measured". Verifying them needs `npm run check` and an
`npm audit`, which I did not run. The row's own hedging is accurate, so there is nothing to
correct; it is listed here so nobody reads its absence as a pass.

## 4. HANDED FORWARD

**HF-1. The JOB 2 replacement gate exists but CI does not run it.**
`frontend/scripts/locale_prose_conformance.mjs` (436 lines, three parts, a `--self-test`
flag per convention (p)) is on disk at HEAD. `grep -rn "locale_prose_conformance"
.github/workflows/` returns nothing. `checks.yml:356` still runs the older
`locale_completeness_check.mjs`, the very scan TR-059 records as blind to sentence-case
prose. This is a real observation about the repository, not the document, and it is why my
proposed TR-059 status reads CLOSED IN PART rather than CLOSED. No new tracker row proposed.

**HF-2. Four proof scripts still write into committed evidence.**
TR-090 and TR-097 both remain accurate at HEAD: `grep -c evidencePaths` returns **0** for all
four of `social_string_conformance.mjs`, `social_dom_conformance.mjs`, `popout_conformance.mjs`
and `portrait_layout_conformance.mjs`. Nothing to correct in the document; noted because the
two rows are the oldest OPEN evidence-integrity items and both still reproduce.

**HF-3. TR-093 still reproduces at HEAD.** `docs/QUALITY_CHARTER.md:424` still reads the
unqualified sentence the row quotes, verbatim. The row is correct and correctly OPEN.

## 5. COVERAGE, what I did NOT check

- **Not read in full.** Rows at lines 204, 130, 276, 209, 269, 274, 270, 205, 207, 164, 206
  are between 4.5 kB and 11.9 kB each; I read the OPEN ones and sampled the CLOSED ones for
  their file:line citations only. Their prose bodies were not audited sentence by sentence.
- **Money path untouched by instruction.** TR-086, TR-087, TR-109, TR-114, TR-115, TR-116,
  TR-057 and TR-068 were not measured or analysed at all.
- **Not executed.** No gate, proof script or test was run. `npm run check`, `npm audit`,
  `gh run list` and every `*_conformance.mjs` were read as text or left alone. No dev server
  was started, probed or touched; port 5173 was never contacted.
- **Numeric and statistical claims not recomputed.** TR-003's `4.000000e-03`, TR-106's and
  TR-107's simulation arithmetic, TR-110's 4,455,829 assertions and every RTP or wincap
  figure were taken as recorded. I confirmed the cited artefacts exist
  (`reports/qa/bet_level_compliance_raw_2026-07-25.json`, `scripts/qa/bet_level_compliance.py`)
  and stopped there.
- **Screenshot evidence not opened.** Frame paths were tested for existence only; no image
  was viewed, so no claim about what a frame shows was verified.
- **Round-one, round-two and round-three CLOSED rows** were checked for path and line-number
  drift, not for whether their dispositions still hold.
- **The `Parked rows` table (lines 316 onward) and everything after line 325** were not
  audited.

This shard is a sample, not an exhaustive audit. Status: **PARTIAL**.

## 6. Working-tree check

`git status --porcelain` after the audit reports one new untracked path only:
`reports/qa/session6/shards/`, which contains this shard. Nothing else was created, edited
or deleted. See the returned notes for the verbatim output.
