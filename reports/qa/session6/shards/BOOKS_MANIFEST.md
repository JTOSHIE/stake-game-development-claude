# Shard: BOOKS_MANIFEST.md recount

**Document audited:** `/Users/jt/math-sdk/BOOKS_MANIFEST.md` (121 lines), at HEAD
`de2fa2341dfd48ba113d872d22da6eb1894d5108`, branch `main`, working tree clean at start.

Australian English. No em dashes and no en dashes in this shard.

## 1. How many claims were checked, and how they were chosen

**31 claims checked.** The brief called this the smallest document in the set and asked for
every claim, so selection was not sampling: I walked the document line by line and split it
into claims that a command can settle and claims that no command in this repository can
settle. Every claim in the first group was run. Every claim in the second group is listed in
section 4 as UNKNOWN rather than being waved through.

The checkable set was:

- the two artefact-set rows (file names, file counts, where they live);
- all five book byte sizes, all five MB figures, all five row counts, all five SHA-256 values;
- the total bytes and total rows line;
- the three cross-checks (lookup row counts, mode set against `index.json`, hashes against
  `SUBMISSION_DOSSIER.md` section 5c);
- the provenance paragraph, including the 2026-07-14 regeneration claim;
- the existence and content of `tools/verify_books_lookup_equality.py` and
  `reports/qa/books_lookup_equality_2026-07-25.json`;
- the 500,000 rounds / 4,455,829 assertions / 0 failures result;
- the "no third-party Python package" and "read-only" claims about the verifier;
- the 500,000 centibet cap claim;
- all five weighted wincap probabilities, all five "1 in" figures, and the 1.1259e15 total
  weight convention claim;
- the `COMPLIANCE_WATCH.md` status CLOSED reference;
- the document's claim about what it itself previously said.

## 2. STALE findings

One finding.

| Line | Claim, short | Command run | Result | Proposed correction |
|---|---|---|---|---|
| 69 | ``` `books_super.jsonl.zst` was the one regeneration, on 2026-07-14 ``` | `stat -f "%Sm %N" -t "%Y-%m-%d %H:%M:%S" games/future_spinner/library/publish_files/*` and `git log --format="%cd %h" --date=short --diff-filter=A -- games/future_spinner/library/publish_files/lookUpTable_cruise_0.csv` and `git show 63fa1c0:games/future_spinner/library/publish_files/index.json` | **THREE** books carry 2026-07-14 write times, not one: `books_cruise.jsonl.zst` 2026-07-14 13:51:32, `books_antelite.jsonl.zst` 13:52:01, `books_super.jsonl.zst` 13:53:36. `books_base.jsonl.zst` and `books_bonus.jsonl.zst` are 2026-07-03. The three lookup tables for those same modes plus `index.json` all carry an identical 2026-07-14 14:08:57 stamp, the signature of a single restore. `lookUpTable_cruise_0.csv` and `lookUpTable_antelite_0.csv` were added on 2026-07-07 in `63fa1c0` and have never changed since, and `index.json` at that commit already declared `books_cruise.jsonl.zst` and `books_antelite.jsonl.zst`, so those two book files predate the pass and were rewritten by it. `SUBMISSION_DOSSIER.md` section 5c states the same thing in words: "The tool's `target_modes` list regenerates cruise/antelite/super together". | Replace the sentence with a dated record of what the pass actually did, naming the three regenerated books, the byte-identical result, and the reverted incidental recomputation. Exact text in the returned object. |

**What the command measured, stated before the verdict, per the Head of Engineering note.**
`stat` measures the LAST WRITE TIME of a file, not "a regeneration". On its own it proves only
that three of the five books were last written inside a 125 second window on 2026-07-14. What
turns that into a contradiction of the claim is the second and third commands: the cruise and
antelite lookup tables were committed on 2026-07-07 and `index.json` at that same commit
already named the cruise and antelite books, so those two book files existed before the pass
and were therefore re-produced by it rather than created by it. The document's own sibling,
`SUBMISSION_DOSSIER.md` 5c, records the same three-mode regeneration explicitly. Two accounts
of one pass currently sit in two submission-adjacent documents and they do not agree.

**What is NOT being claimed.** The manifest's substance survives: `books_super.jsonl.zst` was
the only genuinely missing file, and it is the only artefact of that pass that was kept. This
finding is that the word "one" understates what was rewritten, not that the wrong thing was
kept. No diagnosis of cause is offered and no code change is proposed.

## 3. Everything that was checked and came back CORRECT

Recorded so the shard is not read as "one finding, nothing else looked at".

**Byte sizes, all five exact.** `ls -l` on `games/future_spinner/library/publish_files/`
returns 28,678,793 / 17,203,911 / 40,306,089 / 151,905,143 / 149,331,268 for base / cruise /
antelite / bonus / super. Every figure in the manifest table matches to the byte.

**SHA-256, all five exact.** `shasum -a 256 games/future_spinner/library/publish_files/books_*.jsonl.zst`
reproduces all five recorded digests byte for byte.

**Row counts, all five exact, measured directly rather than trusted.**
`zstd -dc books_<mode>.jsonl.zst | wc -l` returns 100,000 for every mode, so the 500,000 total
is real. This was measured against the compressed artefacts themselves, not read out of the
committed JSON report, so it is independent of that report per convention (l.4).

**Totals.** Summing the five sizes gives exactly 387,425,204 bytes. Divided by 1048576 that is
369.477, so the stated 369.5 is correct as MEBIBYTES (see HANDED FORWARD for the unit label).

**The repo-committed set really is seven files.**
`git ls-files games/future_spinner/library/publish_files/` returns exactly
`game_metadata.json`, `index.json` and the five `lookUpTable_<mode>_0.csv` files. No book is
tracked, so "not in this repository" is true at HEAD.

**Lookup row counts.** `wc -l` on each of the five CSVs returns 100,000. The cross-check claim
"every `lookUpTable_<mode>_0.csv` holds 100,000 rows" holds.

**Mode set matches `index.json`.** The committed `index.json` declares exactly `base`, `cruise`,
`antelite`, `bonus`, `super`, each with one `events` book filename and one `weights` CSV
filename, and every filename matches the manifest.

**Hashes match the dossier.** `grep -n` in `SUBMISSION_DOSSIER.md` finds section 5c at line 255
and all five book digests at lines 303 to 307, byte-identical to the manifest. The manifest's
third cross-check is true.

**Cap value.** Every lookup table's maximum payout is exactly 500000 centibets, computed across
all 500,000 rows, so "the declared payout is exactly 500,000 centibets" on a capped round holds.

**Weighted wincap table, all five rows exact.** Computed as
`sum(weight where payout == 500000) / sum(weight)` over each committed CSV:

| Mode | Computed P | Manifest P | Computed 1 in | Manifest 1 in |
|---|---|---|---|---|
| base | 0.0000100000 | 0.0000100000 | 100,000.0 | 100,000 |
| cruise | 0.0000040000 | 0.0000040000 | 250,000.0 | 250,000 |
| antelite | 0.0000125000 | 0.0000125000 | 80,000.0 | 80,000 |
| bonus | 0.0010000000 | 0.0010000000 | 1,000.0 | 1,000 |
| super | 0.0040000000 | 0.0040000000 | 250.0 | 250 |

**Total weight.** Per-mode totals are 1,125,899,906,813,400 (base), ...800,531 (cruise),
...776,843 (antelite), ...792,734 (bonus), ...792,496 (super). All five are 1.1259e15 to five
significant figures, so "every mode's total weight sits at 1.1259e15" holds.

**The FAIR catalogue convention claim is backed inside the repository**, which was not assumed.
`docs/stake-engine-live/2026-07-28/fair-catalogue.md` is a dated mirror whose computed
observation 1 reads that published games cluster around 1.1259e15 (2^50) and cites our own base
total 1,125,899,906,813,400. The manifest's sentence is a restatement of a dated capture rather
than an unsourced impression.

**The verification report exists and its totals match.**
`reports/qa/books_lookup_equality_2026-07-25.json` exists; its `totals` block reads
`rounds: 500000`, `assertions: 4455829`, `failures: 0`, and each mode records
`rounds: 100000`, `lookup_rows: 100000`, `failures: []`. The manifest's headline result is
exact.

**The A to E check table matches the tool.** The docstring of
`tools/verify_books_lookup_equality.py` lists the same five reconciliations in the same order
with the same meanings, and the JSON report carries an `A` to `E` counter block per mode.

**"No third-party Python package" and "read-only" hold.** The tool's imports are `argparse`,
`csv`, `json`, `io`, `subprocess`, `sys` and `pathlib`, all standard library, and it decodes by
spawning `["zstd", "-dc", path]`. `zstd` is present on this machine at
`/opt/homebrew/bin/zstd`, v1.5.7. I did NOT execute the verifier; this was read as text, per the
brief's preference.

**`COMPLIANCE_WATCH.md` status.** Line 386 reads "**Status: CLOSED 2026-07-28.** The owner
disabled the folder's sharing", so the parenthetical in the artefact-set table is accurate.

**The document's claim about its own past is true.** `git show 4931177:BOOKS_MANIFEST.md` line
81 contains "this manifest establishes **identity and integrity**", so "this manifest previously
said plainly that it established identity and integrity but not semantic equivalence" is a
correct self-reference.

**The 22-failures history is corroborated.** `docs/records/reviews/REVIEW_TRACKER.md` line 98
(TR-011) records the same account: first draft asserted plain equality, 22 failures across 2,500
rounds, every one at exactly 500,000 centibets. Past tense, consistent, not stale.

**Referenced paths all exist:** `tools/verify_books_lookup_equality.py`,
`reports/qa/books_lookup_equality_2026-07-25.json`, `games/future_spinner/run.py`,
`COMPLIANCE_WATCH.md`, `SUBMISSION_DOSSIER.md`.

**The 12-file arithmetic is right.** 7 plus 5 is 12, and `SUBMISSION_DOSSIER.md` line 236 and
its 5c table both say TWELVE. The 11 that used to sit there was corrected on 2026-07-30 in
`0c397e1`; the current text is correct.

## 4. UNKNOWN, and exactly why each could not be settled

1. **"Git LFS on a public repository burns quota on every clone, including the daily
   verification clones Fable performs."** Nothing in the repository measures LFS quota or
   records a clone cadence. This is a statement about GitHub billing and about an external
   party's habits, and no command here reaches either. UNKNOWN.
2. **"The platform receives books by ACP upload, not via GitHub."** The live-docs mirror under
   `docs/stake-engine-live/` mentions ACP in several captures, but I did not find a mirrored
   page that states the submission channel in the form this sentence asserts, and per convention
   (l.7) compliance text is quoted rather than inferred. Settling it needs a dated mirror of the
   relevant platform page read verbatim. UNKNOWN. It is not contradicted by anything I ran.
3. **"GitHub's hard 100 MB per-file limit."** External platform fact. The arithmetic that
   depends on it is sound (144.9 and 142.4 both exceed 100), but the limit itself is not
   repository-checkable. UNKNOWN.
4. **"an owner-held private Google Drive copy of the full `games` directory taken 2026-07-28."**
   Off-machine custody. `COMPLIANCE_WATCH.md` corroborates the sharing being disabled on that
   date and that no link is recorded here, which is as far as any command reaches. The existence
   and completeness of the Drive copy is UNKNOWN.
5. **"Generated by `games/future_spinner/run.py` from the frozen, owner-sanctioned simulation
   pass."** `run.py` exists at that path. That the five books on disk are its output cannot be
   settled without executing the maths package, which is locked and out of scope here. UNKNOWN.
   Note that the CLAUDE.md determinism claim the sentence leans on ("the raw simulation stage is
   deterministic and seeded") IS present in CLAUDE.md, so the citation is accurate even though
   the generation itself is unverified by me.
6. **"the convention the FAIR catalogue shows as most common across published games."** The
   dated mirror supports "clusters around 1.1259e15" and shows other magnitudes in use. Whether
   1.1259e15 is the single MOST COMMON value would need a count over the full catalogue payload,
   and the mirror deliberately captures a representative excerpt rather than the full list
   (stated in its own capture note). The direction is supported; the superlative is UNKNOWN.
7. **"Review 1 named it as the thing it could not verify."** The verifier's own docstring says
   the same sentence, and `docs/records/reviews/sources/` holds the review files, but the two
   agreeing is not independent corroboration when one was plainly written from the other. I did
   not locate the originating line in a round-1 review source. UNKNOWN, and low stakes: it is a
   historical attribution, not a live number.
8. **The `books_super.jsonl.zst` byte-identity claim implicit in the dossier's account** (that
   the three regenerated books hashed identical to their pre-existing values) could not be
   re-derived by me, because the pre-2026-07-14 bytes no longer exist anywhere I can read. The
   proposed correction therefore attributes that statement to `SUBMISSION_DOSSIER.md` 5c rather
   than asserting it fresh.

## 5. HANDED FORWARD, out of scope for an edit here

1. **The books are gitignored by a rule that also covers the seven committed files.**
   `git check-ignore -v games/future_spinner/library/publish_files/books_base.jsonl.zst` returns
   `.gitignore:9: **/library/**`. The seven repo-committed files are tracked, so the ignore does
   not affect them today, but the rule that keeps the books out is a whole-directory rule rather
   than a books-specific one. A future `git add` of a replacement `index.json` or lookup table
   at that path would be silently ignored unless forced. The manifest does not mention the
   ignore rule at all. This is an observation about the repository, not a stale claim in the
   document, so nothing is proposed. `tools/verify_books_lookup_equality.py`'s own header
   already records the same `.gitignore:9` fact, so the knowledge exists but is not in this
   document.
2. **MB is used where MiB is meant, consistently, throughout the document.** 28,678,793 bytes is
   27.4 MiB and 28.7 MB; the table says 27.4 MB. Same for all five and for the 369.5 total. The
   convention is internally consistent and matches how the sizes were measured, so no figure is
   wrong, but a reviewer converting decimal megabytes will not reproduce the column. Not
   proposed as an edit because it is a labelling convention decision, not a drifted value, and
   changing it touches six numbers.
3. **The header says "Generated 2026-07-28" but the file was last changed 2026-07-30** in
   `0c397e1` ("docs: five stale claims corrected"), which altered the artefact-set table from 11
   files to 12. The header is a generation record and remains true as such; whether it should
   also carry a last-amended date is an editorial decision for the marshal, not a measurable
   staleness, so no edit is proposed.
4. **`SUBMISSION_DOSSIER.md` section 5c and this manifest are two accounts of the same
   2026-07-14 pass and currently differ in scope.** The correction proposed above brings the
   manifest into line with the dossier. Nobody should read that as a ruling that the dossier is
   right and the manifest is wrong on the merits: the filesystem agrees with the dossier, which
   is why the manifest is the one being corrected. If the marshal would rather both documents
   point at one record instead of restating it, that is a structural change beyond a recount.

## 6. COVERAGE, stated plainly so this shard is not read as exhaustive

**What I did NOT check:**

- I did not execute `tools/verify_books_lookup_equality.py`, not even its `--self-test`. The
  A to E result in the manifest is confirmed only against the committed JSON report and the
  tool's source read as text. If that report were itself wrong, this shard would not have
  caught it. Re-running the verifier is the check that would close that, and it was not run.
- I did not decode any book CONTENT. Row counts were measured by line count after
  decompression; no `payoutMultiplier`, `finalWin`, `setTotalWin` or `winInfo` value was read
  by me. Every semantic-equivalence claim in the document rests on the committed report, not on
  my own reading of the data.
- I did not verify `game_metadata.json` or `index.json` hashes against section 5c. The manifest
  states hashes for the five books only, so those two were out of its own claim set; the dossier
  carries them and I did not recompute them.
- I did not check the RTP, hit rate, volatility or trigger-rate figures, because this document
  states none of them.
- I did not verify anything about how the ACP upload works, what the platform requires, or what
  Fable does, beyond what is mirrored in the repository.
- I did not look at `reports/archive/`, per the brief's warning, so nothing in this shard is
  based on a superseded copy.
- No money-path or player-money-display question was measured, analysed or proposed. TR-086,
  TR-109 and TR-115 were not opened.
- I read `games/future_spinner/` and its artefacts and I wrote nothing there.

**Files written by me: exactly one**, this shard, at
`reports/qa/session6/shards/BOOKS_MANIFEST.md`. `git status --porcelain` was run at the start
(clean) and at the end.

## 7. TWO THINGS TO SAY LOUDLY ABOUT THE TREE

**HEAD MOVED WHILE I WORKED, and it does not invalidate this shard, but say it out loud.**
I recorded `de2fa2341dfd48ba113d872d22da6eb1894d5108` at boot. At close,
`git rev-parse HEAD` returned `ba4ce6794da8f8418a4a86dfdc6c45b1e5d87288`. The one commit
between them is `ba4ce67 docs(session6): bring the resume record current before the JOB 2 wave
returns`, and `git diff --name-only` between the two SHAs returns exactly one path,
`reports/qa/session6/RESUME.md`. `git diff --stat` between them over `BOOKS_MANIFEST.md`,
`games/future_spinner/library/publish_files/` and `SUBMISSION_DOSSIER.md` is EMPTY, so the
document I audited and every artefact I measured are byte-identical at both SHAs and every
finding above holds at `ba4ce679`. This is recorded rather than smoothed over because a moving
tree is the epoch problem convention (q) names, and a later reader should not have to infer
that the two SHAs were reconciled.

**A SECOND UNTRACKED SHARD APPEARED THAT IS NOT MINE.** The final
`git status --porcelain` returns two untracked paths, not one:
`?? reports/qa/session6/shards/BOOKS_MANIFEST.md` (mine) and
`?? reports/qa/session6/shards/KNOWN_OPEN.md` (not mine). I did not create, edit or read it.
The `shards/` directory already existed when I first listed `reports/qa/session6/`, so the most
likely explanation is a sibling agent in the same wave, but that is an inference and not
something I measured. Nothing else in the tree changed. No file other than my own shard was
written by me.
