# SHARD: SUBMISSION_DOSSIER.md read and recount

**Document audited:** `SUBMISSION_DOSSIER.md` (793 lines) at HEAD
`de2fa2341dfd48ba113d872d22da6eb1894d5108`, branch `main`, working tree clean at start.
Recount performed 2026-07-31.

---

## 1. How many claims, and how they were chosen

**About 95 discrete claims checked by command.** Selection rule: every claim in the document
that a command can settle against the repository. That means, in order of sweep:

1. The two claims the brief named (section 5a's build-diet citation, and section 5a's
   "Current measured size").
2. Every **file and directory path** the document cites (about 45 of them), by `test -e`.
3. Every **hash** in the section 5c upload table (12 of 12, recomputed with `shasum -a 256`).
4. Every **count** (publish files, lookup tables, locales, dist files, index.json
   declarations, rounds, assertions, book rows).
5. Every **maths figure** that can be recomputed from the committed lookup tables (RTP per
   mode, max payout per mode, rows per mode, weighted wincap probability per mode).
6. Every **image measurement** in section 9c (dimensions, byte sizes, SHA-256 prefixes).
7. Every claim about **what CI enforces**, read as text out of `.github/workflows/checks.yml`
   and `.github/workflows/validate-math.yml`.

Nothing was run that writes to the repository. No build was run. `frontend/dist/` was read as
it already stood on disk and is reported as such, never as a HEAD build.

---

## 2. STALE findings

| Line | Claim, quoted short | Command run | Result | Proposed correction |
|---|---|---|---|---|
| **180 to 182** | *"The figure above is computed by `dist_hygiene_gate.mjs` on the build it describes and **written to `reports/qa/dist_hygiene_2026-07-26.json`**, so it is re-derivable"* | `python3 -c "import json; print(json.load(open('reports/qa/dist_hygiene_2026-07-26.json')))"` | That file records **`{"files": 108, "bytes": 15515148}`** and a `buildStamp` of commit **`a1ff78bbe5fcc85ee0d32278a1e63c880c46f5ed`, `cleanTree: false`**, built `2026-07-26T03:17:28Z`. The document's figure is **15,515,125** bytes from a **fresh clone at `7dd83e6a`, clean tree**. The cited re-derivation file is a **different build** and a **different number** (23 bytes apart), from a working machine rather than a clone. | Say plainly that the committed sample is not the described build, give its actual figures and stamp, and point the reader at `frontend/dist/build-info.json` for the current one. Full text in section 5 below. |
| **155 to 157** | *"**Current measured size**: **14.80MB** (108 files, 15,515,125 bytes)"* | `find frontend/dist -type f \| wc -l` and a byte sum over the same set; `cat frontend/dist/build-info.json` | The dist on this machine reads **110 files, 15,721,388 bytes (14.99MB)**, stamped `"version": "v10"`, `"commit": "b8d8012..."`, **`"cleanTree": false`**, built `2026-07-30T19:00:22Z`. **The dated 2026-07-26 record is not disproved by this**, and under convention (s) it should not be replaced with today's number either: the present-tense phrase **"Current measured size"** is the defect, because the value moves on every build. | Reframe as a dated record and route the current value to `frontend/dist/build-info.json`, matching what section 9e already rules for the same figure. Full text in section 5. |
| **153 to 154** | *"confirmed empty of pruned-path requests and under the 25MB budget by `build_diet_verify.mjs` - see JOB 4, `reports/qa/build-diet-network-log.json`"* | `grep -n "build_diet_verify" .github/workflows/checks.yml`; `git log -1 --date=short -- reports/qa/build-diet-network-log.json`; `git show b8d8012:frontend/scripts/build_diet_verify.mjs \| grep -n "preview.kill"` | The gate is now a **CI browser matrix leg**: `checks.yml:884-885` reads `- name: "browser: build diet network hygiene"` / `run: node scripts/build_diet_verify.mjs --self-test && node scripts/build_diet_verify.mjs`, in the `browser` job at line 814 gated `if: needs.changes.outputs.browser_needed == 'true'`. The cited log was **last committed at `7dd83e6`, 2026-07-26**. At **HEAD~1 (`b8d8012`)** the source read `} finally {` / `preview.kill()` at lines 205 to 206 while `killPreview()` at line 47 was `_server ? _server.close() : undefined`; at HEAD it reads `await killPreview()` at line 231. So the sentence describes a hand-run local script producing an undated committed log, and understates a real CI gate that only began to exist today. | Name the gate and its CI leg (a name that does not move), and date the committed log as a sample rather than a current confirmation. Full text in section 5. |
| **212** | *"which is `OWNER_CHECKLIST.md` **item 3b**"* | `grep -n "3b" OWNER_CHECKLIST.md` returns **nothing**; `grep -n "^## " OWNER_CHECKLIST.md` returns sections 0, 1, 2, 3, 4, 5 only | There is **no item 3b** in `OWNER_CHECKLIST.md`. The deletion-once-cooldown item is **section 5**, `## 5. Delete the superseded portal entries, once the cooldown allows` (line 160). A reviewer or the owner following this cross-reference lands nowhere. | Replace `item 3b` with the section 5 title, and date the check. |
| **792** | *"Dated mirrors now exist at `2026-07-25/`, `2026-07-25b/`, `2026-07-26/` and `2026-07-28/`."* | `ls -1 docs/stake-engine-live/` | Five dated mirrors exist, not four: **`2026-07-29/` is also present**, introduced by `9fe3c48` on 2026-07-29 and carrying `payments.md`, a `_manifest.json` and `DELTA_NOTES.md`. The list is written as complete and is now incomplete. | Date the row rather than chase the list, since a mirror set grows at every 5g sweep. |

### Severity notes on the above

- The `dist_hygiene_2026-07-26.json` finding is the **highest-consequence one in this
  document**. It is the sentence that makes the bundle figure auditable, and the file it
  names does not carry the figure. An external reviewer who opens the JSON to check the
  number finds a different number and a dirty-tree stamp, which reads as a fabricated
  reproducibility claim rather than as two different builds. It is not fabricated, but the
  document does not currently let a reviewer tell.
- Three different byte totals for what the document treats as one 2026-07-26 108-file build
  now sit in the repository: **15,515,001** in `reports/qa/build-diet-network-log.json`,
  **15,515,148** in `reports/qa/dist_hygiene_2026-07-26.json`, and **15,515,125** asserted in
  the dossier. All three scripts measure the same thing (`build_diet_verify.mjs:234`
  `getDirSizeBytes(DIST_DIR)`; `dist_hygiene_gate.mjs:90` a sum over `walk(DIST)`), so these
  are three builds, not three methods. Recorded here as an observation; **no correction is
  proposed for the other two files, which are not this document.**

---

## 3. UNKNOWN, and exactly why each could not be settled

1. **Section 5b0: "THE SUBMISSION ENTRY IS `future-spinner-2` (owner's ruling, 2026-07-28)"
   and "Everything in 5b onward targets the game entry `future-spinner-2`."**
   `OWNER_CHECKLIST.md:206` reads, dated later: *"Your ruling that day: `future-spinner-2`.
   Recorded in `SUBMISSION_DOSSIER.md` section 5b0. **Superseded 2026-07-30**: you have since
   confirmed the numbered entries are interchangeable working handles, so no document names
   one and the choice is yours at upload time."* Two things follow and neither is settleable
   from the repository. The owner's intent is not a repository fact, and per protocol rule 16
   `OWNER_CHECKLIST.md` is a **claim**, not evidence, so it cannot make section 5b0 stale on
   its own. What IS command-provable is that the two documents disagree, and that
   `OWNER_CHECKLIST.md`'s own words *"no document names one"* are falsified by section 5b0,
   which names one in bold. **Escalated, not corrected.** If the 2026-07-30 supersession is
   real, section 5b0 is a moving value written into an instruction, which convention (s)
   forbids, and it is a bolded instruction sitting at the head of the upload steps.
2. **Section 2 item 4 versus section 3 versus section 8a: blurb approval status.** Item 4 says
   the soundtrack sentence is *"PENDING OWNER APPROVAL"*; section 3's header says the same;
   section 8a says *"Blurb B is recorded as final"*. Whether "blurb B" is the section 3 text,
   and whether the owner has since approved the soundtrack sentence, are owner facts with no
   repository representation. No command settles it.
3. **Section 5b0's live-portal evidence**: *"frame `071805`, whose boot line reads build
   `e0c30611`, the kit V8 commit, and whose bundle hash `index-pDIjyKAp.js` matches"*. The
   frame exists (`reports/screens/live-portal-2026-07-28/071805_frame.png`) and `e0c30611` is
   a real commit (`git cat-file -t` returns `commit`). **The boot line inside the PNG was not
   read**, because that needs OCR and this pass did not run any. Whether that commit was
   "the kit V8 commit" is likewise not settled: `VERSION` reads `10` today and its history
   shows only the v9 and v10 bumps.
4. **Section 8f's measured anticipation figures** (*"40,000 shipped rounds, anticipation
   opening in 23.18% of base rounds with 64.5% converting, and 0.5% of rounds landing two
   scatters on one reel"*). `GAME_FACTS.md:376-377` and
   `docs/design/SCATTER_ANTICIPATION_SHIP_SPEC.md:36-37` carry the same 23.18% and 64.5%.
   **That is two documents agreeing, not a recount**, and per convention (l.4) shared inputs
   are not corroboration. Recomputing from the books was not attempted in this pass. UNKNOWN.
5. **Section 9a's ACP figures** (*"Max Payout Multiplier 5,000.0 against 100,000.0; Cost
   Multiplier 400.0 against 1,500.0; Base Volatility 17.3 inside 0.6 to 60.0; Tail Probability
   at 5,000x 0.003 against 0.010; Risk Limit (CVaR) 205.710 against 700.000 and 800.000;
   ETL(Sum) 0.641 against 1.500"*). These are transcriptions of a platform screen. The frames
   `15_` through `19_` exist under `reports/screens/dtt-live-2026-07-26/` with filenames
   matching the described content, but their pixels were not read. UNKNOWN by design: the
   platform's own display is the authority and this repository is not it.
6. **Section 9a consequence 3, the 2-star Maximum Exposure disagreement.**
   `COMPLIANCE_WATCH.md:584-585` does carry both figures exactly as the dossier says
   (`$10,000,000` published, `15,000,000.0` on the ACP screen), so the dossier reports the
   disagreement faithfully. **Which figure is correct is not a repository question.**

---

## 4. HANDED FORWARD (real, out of this shard's scope, no edits proposed)

1. **Four scripts the dossier leans on are not run by anything under `.github/`.** Verified by
   `grep -rn "<name>" .github/`, which returns nothing for each:
   - `frontend/scripts/replay_blocker_proof.mjs`, cited in section 9a row 1 as **"Gate:
     ... 7 of 7"** on the **mandatory** Bet Replay requirement;
   - `frontend/scripts/live_shape_conformance.mjs`, cited in section 9a row 4 (its committed
     result `reports/qa/live_shape_conformance_2026-07-26.json` does hold 9 checks, all
     `"pass": true`, verified);
   - `frontend/scripts/audio_verify.mjs`, cited in section 4 as *"ALL CHECKS PASS"*;
   - `frontend/scripts/mock_containment_check.mjs`, which is the bundle half of the gate
     section 8g describes as *"A bundle gate asserts no mock marker reaches production"*.
     `checks.yml:490-493` says that half *"runs in the closing suite"*, and no closing suite
     invokes it: it appears in no `run:` line and in no `frontend/package.json` script.
   **None of these is a false statement by the dossier**, which never calls them CI gates. It
   is an observation about where the evidence rests, and it is the same class TR-111 just
   closed for `build_diet_verify.mjs`.
2. **`tools/verify_books_lookup_equality.py` runs only `--self-test` in CI.** The real run
   cannot run there, because the books are deliberately not committed. Section 8b's PASS is
   therefore a dated local record, correctly so, but nothing in CI can catch it going stale.
3. **Section 2 item 10 and section 4 cite `reports/archive/superseded/MATH_VALIDATION.md`** as
   compliance evidence. The file exists, but it is under `reports/archive/superseded/`, and a
   submission dossier citing a path whose own directory name says "superseded" invites the
   reviewer question it is trying to avoid. Not corrected: the file is real and the citation
   resolves.
4. **`SUBMISSION_CHECKLIST.md` does not exist anywhere in the tree.** The document's header
   says *"It supersedes SUBMISSION_CHECKLIST.md"*, and `git log -- SUBMISSION_CHECKLIST.md`
   shows it retired by `271a2b0`, the same commit that created the dossier. The sentence is
   historically true, so no edit is proposed, but a reviewer cloning the repository cannot
   open the superseded document.
5. **Section 5f's filing gap remains open exactly as the dossier states it.**
   `reports/screens/acp-math-summary/` does not exist. The document already says so in
   section 9a consequence 1, so this is a confirmation rather than a finding.

---

## 5. PROPOSED REPLACEMENT TEXT, in full

### 5.1 Lines 153 to 154

REPLACE:

```
(confirmed empty of pruned-path requests and under the 25MB budget by
`frontend/scripts/build_diet_verify.mjs` - see JOB 4, `reports/qa/build-diet-network-log.json`).
```

WITH:

```
. `frontend/scripts/build_diet_verify.mjs` asserts that the served bundle makes no
pruned-path request and sits under the 25MB budget, and **since 2026-07-31 (TR-111, commit
`de2fa23`) it is a BROWSER matrix leg of `.github/workflows/checks.yml`, run behind its own
seeded-violation self-test**, so the property is enforced on every push that reaches the
browser matrix rather than confirmed by hand. `reports/qa/build-diet-network-log.json` is a
DATED sample of the JOB 4 run of 2026-07-26, not a statement about the current build: read
the current verdict from the CI leg.
```

### 5.2 Lines 155 to 157

REPLACE:

```
Current measured size: **14.80MB** (108 files, 15,515,125 bytes) against the 25MB budget,
measured on the artefact that ships: the JOB 5 kit V3 build, from a fresh clone at commit
`7dd83e6a`, clean tree, 2026-07-26.
```

WITH:

```
**Measured at 14.80MB (108 files, 15,515,125 bytes) against the 25MB budget on 2026-07-26**,
on the artefact that shipped then: the JOB 5 kit V3 build, from a fresh clone at commit
`7dd83e6a`, clean tree. That is a dated record and not a current figure, because the byte
total and the file count move on every build: **read the current size from
`frontend/dist/build-info.json`, which stamps the version, the commit and the byte count on
every build**, exactly as section 9e already directs. A figure built on a working machine is
not the same claim as one built from a fresh clone (convention (o)), so any figure recorded
here states which it was.
```

### 5.3 Lines 180 to 182

REPLACE:

```
The figure above is computed by `frontend/scripts/dist_hygiene_gate.mjs` on the build it
describes and written to `reports/qa/dist_hygiene_2026-07-26.json`, so it is re-derivable
rather than carried forward.
```

WITH:

```
`frontend/scripts/dist_hygiene_gate.mjs` recomputes this figure on whatever build is in front
of it, so it is re-derivable rather than carried forward. **The committed sample at
`reports/qa/dist_hygiene_2026-07-26.json` is NOT the build described above**: read on
2026-07-31 it records 108 files and 15,515,148 bytes, with a build stamp naming commit
`a1ff78bb` and `cleanTree: false`, so it is a working-machine run of the same date rather
than the fresh-clone kit V3 build. Per convention (o) those are two different claims and
neither substitutes for the other.
```

### 5.4 Line 212

REPLACE: `` `OWNER_CHECKLIST.md` item 3b ``

WITH: `` `OWNER_CHECKLIST.md` section 5, "Delete the superseded portal entries, once the cooldown allows" (checked 2026-07-31; that file carries no item 3b) ``

### 5.5 Line 792

REPLACE:

```
Dated mirrors now exist at `docs/stake-engine-live/2026-07-25/`, `2026-07-25b/`, `2026-07-26/` and `2026-07-28/`.
```

WITH:

```
Dated mirrors exist under `docs/stake-engine-live/`, five of them as at 2026-07-31 (`2026-07-25/`, `2026-07-25b/`, `2026-07-26/`, `2026-07-28/`, `2026-07-29/`), and the 5g sweep adds one each time it runs, so read the directory rather than this list.
```

---

## 6. What the document got RIGHT, recounted rather than assumed

Recorded because a shard listing only defects would misrepresent the document. Every item
below was recomputed from the repository this pass.

- **All twelve SHA-256 hashes in the section 5c table are exact.** The seven repo-committed
  files were rehashed with `shasum -a 256` and match character for character; the five
  `books_*.jsonl.zst` present on this machine also match. Section 9e's row *"Verified NOT
  stale"* still holds at HEAD.
- **The set counts are exact.** `git ls-files games/future_spinner/library/publish_files/`
  returns **7**; `ls` returns **12**; five of them are `lookUpTable_*_0.csv`. The two
  `<!--CHECK: count=...-->` annotations at lines 274 and 275 are correct, and
  `scripts/qa/doc_currency_gate.mjs:592-596` really does implement `count=N` and really is a
  static-job CI step (`checks.yml:291`), so section 5c's *"machine-checked on every CI run"*
  is true and the static job is never gated out.
- **`index.json` declares exactly ten files** (five books, five lookup tables), which is what
  section 5c's arithmetic paragraph says, and its five modes carry costs
  1.0 / 1.0 / 1.25 / 100.0 / 400.0, matching the five-mode table at lines 95 to 101.
- **RTP recomputed from the committed lookup tables is 96.350000% in all five modes**, with
  100,000 rows and a maximum payout of exactly 5,000.0x in each. Section 4, section 8c and
  the five-mode table all hold.
- **Section 8b's weighted wincap table is exact.** Recomputed as weight-weighted probability
  of a 500,000-centibet row: base 1 in 100,000, cruise 1 in 250,000, antelite 1 in 80,000,
  bonus 1 in 1,000, super 1 in 250. Identical to the published table and to section 4.
- **Section 8b's headline numbers are exact.** `reports/qa/books_lookup_equality_2026-07-25.json`
  totals **500,000 rounds, 4,455,829 assertions, 0 failures**, summed independently across
  the five modes' own `checked` maps rather than read off the `totals` block.
- **Section 5c's "two of them also exceed GitHub's hard 100 MB per-file limit" is exact**:
  `books_bonus.jsonl.zst` is 151,905,143 bytes and `books_super.jsonl.zst` is 149,331,268;
  the other three are 40MB or under.
- **No orphaned books remain.** The seven files section 5c says were deleted are absent; the
  directory holds exactly the five referenced books.
- **Every figure in the section 9c art table is exact**, measured this pass: `bg_base.jpg`
  1920x1080 at 273,173 bytes with SHA-256 beginning `c7ecfa15dde8db42`; `bg_overdrive.jpg`
  269,186 bytes beginning `909dbeefd304b10b`; the composed tile 408x546 at 476,178 bytes
  beginning `741e77face74f7e9` and **byte-identical between
  `design-system/brand/tile/tile_composed_master.png` and its delivery copy**;
  `scene_character.png` 680x1344 at 629,245 bytes beginning `1acbd781ce1c7b79`;
  `scene_car.png` 2840x1000 at 1,036,271 bytes beginning `627c6920c26e5be2`. The claim that
  BG and FG are landscape is also exact: delivery BG is 2048x1152 and FG is 4159x1875.
- **Dossier inventory item 7 is exact**: `WeRollSpinners-Logo.png` is 1024x1024, PNG colour
  type 6 (RGBA), 40,314 bytes, which is the "39KB" claimed.
- **"Sixteen locales" is exact**: `frontend/src/lib/i18n/translations.ts:8-11` declares
  sixteen `Locale` members.
- **Section 5a's own arithmetic is internally exact**: 15,514,744 plus 381 is 15,515,125, and
  `dist_hygiene_gate.mjs:129-132` does assert precisely that stamp-plus-itself reconciliation,
  alongside the 25MB budget (line 101) and the no-documentation assertion (line 89).
- **The sounds README claim survives a closer look and is NOT a finding.**
  `frontend/public/assets/themes/future-spinner/sounds/README.md` still exists and is still
  git-tracked, which looks at first like a contradiction of *"JOB 3(i) removed one file"*.
  It is not: the claim is about the shipped bundle, and `find frontend/dist -name "*.md"`
  returns nothing. The source file is pruned at `closeBundle`. **Recorded because the
  careless version of this check produces a confident wrong finding.**
- **`scripts/validate_math.py` is genuinely CI-gated**, by its own workflow
  `.github/workflows/validate-math.yml`, path-filtered to `index.json`, the lookup tables and
  the script itself.
- **`reports/screens/acp-math-summary/` is absent**, exactly as section 9a consequence 1
  states, and every other cited screenshot path and directory resolves, including the five
  named frames and `reports/screens/live-portal-2026-07-28/071805_frame.png`.
- **Section 9e's kit version row is currently true**: the root `VERSION` file reads `10`.

---

## 7. COVERAGE: what this shard did NOT check

Read this section before treating anything above as exhaustive.

- **Sections 9d and the whole money-display surface were NOT examined at all.** The brief bans
  money-path work outright (TR-086, TR-109, TR-115 and any money-display question), so section
  9d's table, its four-stage proof, its MULT column worked example and
  `docs/records/MONEY_DISPLAY_EXPLAINED.md` were left untouched beyond confirming the file
  path resolves. **No claim in section 9d is endorsed by this shard.**
- **No screenshot pixels were read.** Every claim resting on what a frame shows (section 5b0's
  boot line, section 9a's ACP figures, the MAX WIN overlay, the replay captures) is unchecked
  beyond the filename existing. No OCR was run.
- **No gate was executed.** Gates were read as source and as CI configuration only, per the
  brief. So "the gate asserts X" was verified by reading the assertion, and "the gate passes"
  was not verified anywhere.
- **No build was run**, so `frontend/dist/` is the build that was already on disk: commit
  `b8d8012` (HEAD~1), `cleanTree: false`, built 2026-07-30. **It is not a HEAD build and it is
  not a fresh-clone build**, and nothing in this shard treats it as either.
- **Sections 1, 6 and 7, and dossier inventory items 11, 12 and 13** are owner and platform
  status rather than repository facts, and were not checkable. Section 1's summary of the live
  approval guidelines was not diffed against the `docs/stake-engine-live/` mirrors.
- **The blurb text itself (section 3) was not checked** for social-mode prohibited terms,
  paytable agreement or locale coverage.
- **Sections 8d, 8e, 8g and 8i were checked only for the paths and gates they name**, not for
  the behavioural claims they make. The `XEC == XSC` assertion, the 17 session-recovery
  assertions, the scatter-escalation signature claim and the bounding-box measurements in 8i
  were not re-derived.
- **Section 5g's eleven-page list was not diffed** against any mirror manifest, and no live
  page was fetched.
- **`reports/qa/build-diet-network-log.json` and `reports/qa/dist_hygiene_2026-07-26.json`
  were read but no correction is proposed for either.** They are not this document.
- **Only `SUBMISSION_DOSSIER.md` is in scope.** Where a contradiction was found between it and
  `OWNER_CHECKLIST.md` (section 3 item 1 above), no edit is proposed to either document.

---

## 8. Write-safety confirmation

`git status --porcelain` was run at the close of this pass. The result is recorded in the
return object's notes.
