# SHARD: COMPLIANCE_WATCH.md read and recount

**Document audited:** `/Users/jt/math-sdk/COMPLIANCE_WATCH.md` (720 lines), at HEAD
`de2fa2341dfd48ba113d872d22da6eb1894d5108` on branch `main`.

Australian English. No em dashes and no en dashes in this shard, except inside text quoted
byte-exact from the document or from a platform mirror.

---

## 1. How many claims were checked, and how they were chosen

**37 claims checked by command.** Selection was not a sweep of every sentence. The briefing
named the hunt, so the claims were chosen in this order:

1. **Every "mirrored" / "not yet mirrored" claim in the file.** `grep -n -i "mirror"` returns
   eight lines (42, 46, 221, 353, 452, 453, 455, 475). All eight were checked against what
   actually exists under `docs/stake-engine-live/` at HEAD, with `ls`, `git ls-tree` and
   `git log`.
2. **Every path the document names as existing.** 15 paths tested with `test -e`.
3. **Every present-tense claim about a value that moves** (page counts, file sizes, row
   counts, published limits, the published events field), measured against the repository.
4. **Every pair of entries where a later one appears to supersede an earlier one**, looking
   specifically for the earlier one never being struck.
5. **Every verbatim platform quotation**, checked byte-exact against its named mirror or
   source file, per convention (l.7). 12 quotations checked, **all 12 verify byte-exact**.

**Claims deliberately NOT selected:** anything on the money path or player money display
(scope ban). See COVERAGE, section 6.

---

## 2. STALE findings

Seven. Ordered most severe first.

| # | Line | Claim, quoted short | Command run | Result | Proposed correction |
|---|---|---|---|---|---|
| 1 | 453 | "The page was mirrored to `docs/stake-engine-live/2026-07-25/payments.md` in commit `b440145` at 17:22 on 2026-07-25, **thirty four minutes after** commit `d1b5b83`" | `git log --follow --format="%h %cd" --date=iso -- docs/stake-engine-live/2026-07-25/payments.md` and `git ls-tree d1b5b83 -- docs/stake-engine-live/2026-07-25/payments.md` and `git show 25bc4d5 --numstat -- <path>` | The file has exactly TWO commits: `25bc4d5` at **2026-07-25 06:46:14 +1000** (80 lines, file CREATED) and `b440145` at 17:22:29 (45 insertions, 61 deletions, file REWRITTEN). `git ls-tree d1b5b83` shows blob `b0f9609` already present at 16:48. The original blob carries `looks_real: true` and `first_capture: yes` and is a full 80 line, 4,043 character capture of the payments page. So the mirror predated the "NOT YET MIRRORED" line by about **ten hours**, not by minus thirty four minutes. | Rewrite with the creating commit and a recount note. Full text below. |
| 2 | 36 | "**Upcoming platform features to track:** provably fair, and stateful games. Neither is required for our current stateless submission; note for future roadmap only." | `grep -in "provabl" docs/stake-engine-live/2026-07-28/fair-api.md` | Line 12 `# Provably Fair API`; line 78 quotes the platform: *"Stake has now implemented Provably Fair across all stateless games built on Stake Engine"*. The same document's own 2026-07-28 Watch log entry (lines 329 to 370) records the FAIR API as live, public and unauthenticated, with the contract mirrored. Provably fair is not upcoming and is not roadmap-only; it applies to our stateless game today. The earlier bullet was never struck. | Restate as a record of what is live, keeping the platform quotation byte-exact. Full text below. |
| 3 | 665 | "it arrives beside a file size cap the project had no record of at all" | `grep -n "4\.2GB" COMPLIANCE_WATCH.md` and `grep -n "4.2GB" docs/stake-engine-live/2026-07-25/math-verification.md` and `git log -1 --date=iso -- <that mirror>` | `COMPLIANCE_WATCH.md:315` already recorded the 4.2GB cap in the **2026-07-25** entry, four days earlier. `docs/stake-engine-live/2026-07-25/math-verification.md:19` carries the upstream line, committed in `25bc4d5` on 2026-07-25 06:46. The project had a record of it in this very file. | Replace the "no record of at all" clause with the dated prior record. Full text below. |
| 4 | 347 to 348 | "Others run 1,000,000 to 10,000,000 (Obey The Reptillians sits at exactly 10,000,000, the cap). We remain inside the platform minimum of 100,000" | `python3` regex extract of `"events":(\d+)` from `docs/stake-engine-live/2026-07-28/fair-catalogue.md`, plus `sed -n '66,70p'` of the same file | The captured excerpt holds 19 modes: 100000 x2, 200000, 240000, 600000 x2, 1000000 x5, 1410986 x3, 3600000 x2, 8000000, 10000000 x2. **Four modes sit between 100,000 and 1,000,000, and two sit at exactly 100,000, the same as ours.** The mirror's own prose (line 68) reads "values run from 6,514 (Drop The Boss) through 100,000 (Golden Boy, Krakens Curse) to 1,410,986, 3,600,000 and 10,000,000", so at least one published game is BELOW our count. "Others run 1,000,000 to 10,000,000" is false, and "inside the platform minimum" should be "on" it, which is what the source says. | Restate the range from the source. Full text below. |
| 5 | 284 | "#### OPEN QUESTION, CVaR definition. Recorded verbatim, resolution path attached." | `grep -n "205.710" COMPLIANCE_WATCH.md` and `sed -n '376,412p' SUBMISSION_DOSSIER.md` | The heading is still open at line 284 while the same file records at lines 556 to 576 that **the gate has been run**: the ACP screen displayed `Risk Limit (CVaR)    205.710` against 2 Star 700.000 and 3 Star 800.000, evidenced at `reports/qa/dtt_live_session_2026-07-26.md`. `SUBMISSION_DOSSIER.md` 5f step 5 explicitly instructs updating "`COMPLIANCE_WATCH.md`'s 2026-07-25 open-question entry with the resolved answer"; that was never done. 272 lines separate the open heading from its resolution, against the thirteen lines that produced the payments failure. | Add a dated strike line under the heading. Full text below. |
| 6 | 667 | "**3-star Maximum Exposure moved from `$25,000,000` to `$50,000,000`.**" | `grep -n "Maximum Exposure" docs/stake-engine-live/math-verification.md docs/stake-engine-live/2026-07-25/math-verification.md` | 2026-07-04 mirror: 2-star `$10,000,000`, 3-star `$25,000,000`. **2026-07-25 mirror: 3-star already `$50,000,000`.** The move is real but it was captured on 2026-07-25, and this file's own constraint table at line 233 already carries `$50,000,000`. Presented under a 2026-07-29 heading reading "two real deltas", it reads as new when it is four days old. The baseline (`docs/stake-engine-live/2026-07-29/DELTA_NOTES.md` declares it as the 2026-07-04 capture) is stated in the delta note but not in this file. | Date the baseline and name the prior capture. Full text below. |
| 7 | 660 | "\| Single events file \| 4.2GB \| **146MB**, largest of the five \| about 29x under \|" | `du -h games/future_spinner/library/publish_files/books_*.zst` and `ls -la` and `grep -n "144" BOOKS_MANIFEST.md` | Largest is `books_bonus.jsonl.zst` at 151,905,143 bytes. `du -h` reports **145M**; `BOOKS_MANIFEST.md:24` records **144.9 MB**; the decimal reading is 151.9 MB. **146MB is none of the three.** The margin conclusion is unaffected. | Use the manifest's own figure and cite it. Full text below. |

### Proposed replacement text, in full

**Finding 1.** Replace lines 453 to 456:

> The page was mirrored to `docs/stake-engine-live/2026-07-25/payments.md` in commit `25bc4d5`
> at 06:46 on 2026-07-25, **about ten hours before** commit `d1b5b83` wrote this line at
> 16:48 the same day. `b440145` at 17:22 REWROTE that already committed mirror rather than
> creating it. **RECOUNTED 2026-07-31** by `git log --follow` on the file, which returns those
> two commits and no other, and by `git ls-tree d1b5b83`, which shows the file already present
> at 16:48. The earlier correction named `b440145` and "thirty four minutes", which is what
> `git log -1` on a file returns: the LAST commit to touch it, not the one that created it.
> The conclusion is unchanged and is stronger, since the stale line was false by ten hours
> rather than by thirty four minutes. Entry 7 below records the mirror correctly. The two
> entries then sat thirteen lines apart contradicting each other for four days.

**Finding 2.** Replace lines 36 to 37:

> - **Platform features to track:** stateful games remain deferred by the platform and are not
>   required for our stateless submission. **Provably fair is no longer upcoming:** the
>   2026-07-28 Watch log entry below records the FAIR API as live, public and unauthenticated,
>   and the mirror at `docs/stake-engine-live/2026-07-28/fair-api.md` quotes the platform as
>   having "now implemented Provably Fair across all stateless games built on Stake Engine".
>   That entry records that no build work is owed.

**Finding 3.** Replace the tail of line 665:

> **documentation**, and that it appears beside a file size cap this file had already recorded:
> the 4.2GB limit was mirrored to `docs/stake-engine-live/2026-07-25/math-verification.md` in
> commit `25bc4d5` on 2026-07-25 and written into the 2026-07-25 entry above the same day.

**Finding 4.** Replace lines 347 to 348 (from "1,000,000 to"):

> from 6,514 (Drop The Boss) up to 10,000,000 (Obey The Reptillians, exactly at the cap),
> with Golden Boy and Krakens Curse also at 100,000 and several modes between 200,000 and
> 600,000, per `docs/stake-engine-live/2026-07-28/fair-catalogue.md` captured 2026-07-28.
> We sit ON the platform's stated 100,000 minimum and two orders below the 10,000,000

**Finding 5.** Append under line 284:

> **RESOLVED IN PRACTICE 2026-07-26, and struck here so this heading is not read as still
> open.** The ACP Math Distribution and Summary screen was read live and displayed
> `Risk Limit (CVaR)    205.710`, passing both the 2 Star 700.000 and the 3 Star 800.000
> limit. See LIVE OBSERVATION DELTA section 2 below for the frames and the reconciliation.
> The three definitional unknowns recorded below are kept as the record of what was ambiguous
> at the time, not as open work.

**Finding 6.** Replace line 667:

> **3-star Maximum Exposure had moved from `$25,000,000` to `$50,000,000`**, measured against
> the 2026-07-04 mirror, which is the baseline `docs/stake-engine-live/2026-07-29/DELTA_NOTES.md`
> declares. It was not new at this capture: `docs/stake-engine-live/2026-07-25/math-verification.md`
> already read `$50,000,000` on 2026-07-25, and the constraint table in the 2026-07-25 entry
> above already carries that figure.

**Finding 7.** Replace line 660:

> | Single events file | 4.2GB | **144.9MB**, largest of the five (`books_bonus.jsonl.zst`, per `BOOKS_MANIFEST.md`) | about 29x under |

---

## 3. UNKNOWN, what could not be settled and why

- **"The 35 maths SDK pages are captured but OUT OF SCOPE" (line 715), and "161 of the
  corpus's 466 candidate normative statements" (line 716).** `ls docs/stake-engine-live/2026-07-29/math*.md | wc -l`
  returns **36**, and the tier table in `docs/stake-engine-live/2026-07-29/DELTA_NOTES.md:164`
  says `MATHS_SDK | 35 | 161`. The tiers sum to 64, which is the page count, so one
  math-prefixed page is tiered somewhere other than MATHS_SDK. **My command measured a
  filename prefix; the claim is about a tier assignment in a requirements register.** Those
  are not the same question and the register itself is not in the repository at a path I
  could find. UNKNOWN, and not proposed as a correction. The 466 total does not appear in
  the delta notes at all and could not be sourced.

- **"The repository previously held four PARTIAL captures totalling 603 prose lines across 8
  files with newest content dated 2026-07-04" (line 634).** This is a past-state claim about
  the tree BEFORE the 2026-07-29 commit. Settling it needs a line count against a specific
  parent commit, and "prose lines" is not defined (headers included or not, manifest included
  or not). I did not guess a definition. UNKNOWN.

- **"146MB" versus the true byte count, unit convention.** Recorded as STALE finding 7 on the
  narrow ground that 146 matches no reading, but which convention the document intends (MB
  decimal or MiB) is UNKNOWN, so the proposed replacement cites `BOOKS_MANIFEST.md` rather
  than asserting a unit.

- **Whether the document's two stated policies for superseded entries can both stand.** Lines
  536 to 538 say "the earlier section is left in place and the correction is recorded here, so
  the history stays honest". Lines 463 to 465 say "**When adding an entry that resolves an
  earlier one, strike the earlier one in the same edit.**" Both are in force in the same file,
  written two days apart, and they give opposite instructions to the next writer. I did not
  propose a correction because this is a ruling, not an observation. See HANDED FORWARD.

---

## 4. HANDED FORWARD, real but out of scope

- **The two supersession policies contradict each other** (lines 536 to 538 versus 463 to
  465). The later one (2026-07-29) is the one the payments failure earned. Somebody with
  authority should rule which governs, because findings 2 and 5 above exist precisely in the
  gap between them. No tracker row proposed.

- **The books `.jsonl.zst` files are NOT tracked in git.** `git ls-files games/future_spinner/library/publish_files/`
  returns only the five `lookUpTable_*.csv`, `game_metadata.json` and `index.json`. Every claim
  in the document about book file SIZES therefore rests on one machine's working tree, not on
  anything at HEAD. `BOOKS_MANIFEST.md` is the custody record and does carry the hashes. Worth
  knowing before anyone treats a size figure as reproducible from a clone.

- **`docs/stake-engine-live/changelog.md` still sits at the top level of the mirror** while the
  2026-07-29 entry (lines 706 to 709) records the slug as gone from the live navigation. The
  document does not claim the file was deleted, so this is not a document error, but a reader
  doing `ls docs/stake-engine-live/` sees a live-looking page for a slug that no longer exists
  upstream.

- **`docs/stake-engine-live/2026-07-28/fair-catalogue.md` says the outcome endpoint is "not
  captured"** while `COMPLIANCE_WATCH.md:352` records it as CAPTURED the same day, with
  `fair-api.md` present. The document handles this correctly (the later capture supersedes),
  but the MIRROR file still carries the superseded "named and waited for rather than inferred"
  paragraph. Mirrors are captures and should probably not be edited; flagging it only so the
  next reader of that mirror is not misled.

---

## 5. What I did check and found SOUND, so this shard is not read as all-negative

- All 15 named paths exist (`docs/REVIEW_EVENTS_PLAN.md`, `SUBMISSION_DOSSIER.md`,
  `docs/RGS_CONTRACT_REFERENCE.md`, `reports/archive/superseded/PROMO_BLURB.md`,
  `scripts/validate_math.py`, `reports/archive/handovers/HANDOVER_2026-07-07_Fable.md`,
  `docs/QUALITY_CHARTER.md`, `docs/skills/FULL_AUDIT_METHOD.md`, `reports/FABLE_COMMS.md`,
  `reports/briefs/FS_PlatformDiscordDump_2026-07-25.md`,
  `reports/qa/math_bet_level_compliance_2026-07-25.md`,
  `reports/qa/dtt_live_session_2026-07-26.md`, `REPLAY_TEST_EVENTS.md`,
  `docs/records/BRANCH_HYGIENE_2026-07-28.md`, `BOOKS_MANIFEST.md`).
- The named screenshot `reports/screens/dtt-live-2026-07-26/15_maths_overall_bet_level_compliance_all_pass.png`
  exists; that directory holds 49 files.
- "**64 pages, all 64 rendered**" (line 632): `ls docs/stake-engine-live/2026-07-29/*.md | wc -l`
  returns 65, of which one is `DELTA_NOTES.md`. **64 captures. Correct.**
- "now 11 pages mirrored" (line 46): `docs/stake-engine-live/_manifest.json` reads
  `"fetched": "2026-07-04", "pages": 11`, and 11 `.md` files sit at that level. Correct.
- The published constraint table (lines 231 to 243) matches
  `docs/stake-engine-live/2026-07-25/math-verification.md` line for line on all eleven rows.
- "the maximum bet size accepted by the RGS is **$500,000 USD**. Anything above returns HTTP
  400 with 'invalid bet amount'" (lines 245 to 246): mirror line 67 confirms.
- "**100,000 rows in every one of the five modes**" (line 435) and "**100,000 rows**, every
  mode" (line 661): `wc -l` on all five `lookUpTable_*.csv` returns exactly 100000 each.
  Correct.
- The five mode cost multipliers (line 9): `frontend/src/lib/config/fsModes.ts` gives
  1.0, 1.0, 1.25, 100, 400. Correct.
- "`scripts/validate_math.py` was tightened to this real cap" and "Added these as gates"
  (lines 51 and 55): the file carries `RTP_MIN, RTP_MAX = 0.90, 0.9670`, `MAX_COST_MULT = 1_500`,
  `BASE_SD_MIN, BASE_SD_MAX = 0.6, 60.0` and `P_BIGWIN_MAX = 1e-2` with a cost-scaling
  function. Correct.
- "`SUBMISSION_DOSSIER.md` section 5f step 6 says the platform's figures are definitive"
  (line 590): 5f step 6 reads "**Where our figures and the platform's disagree, the platform's
  are definitive.**" Correct.
- **All 12 verbatim quotations verify byte-exact** against their named source: the seven
  Discord quotations against `reports/briefs/FS_PlatformDiscordDump_2026-07-25.md` (including
  the platform's own em dash in "90.0% —> 96.70%"), the two payments quotations against
  `docs/stake-engine-live/2026-07-25/payments.md` (including the upstream minus sign in
  "GGR = Total Bets − Total Wins Paid to Players"), the RTP band quotation against
  `docs/stake-engine-live/2026-07-29/approval_guidelines_math_verification.md:30` (including
  the platform's en dash), the FAIR event-table quotation against
  `docs/stake-engine-live/2026-07-28/fair-api.md:43` (identical apart from bold markers the
  mirror added), and the file size restriction block at lines 649 to 654 against the same
  mirror. Convention (l.7) is being honoured in this document.
- `weight_range` clustering (line 344): 14 of 19 captured values are at 1e15 and 11 fall in
  1.0e15 to 1.3e15. Correct as stated.
- The 2026-07-07 entry DOES strike its two predecessors explicitly (line 119 to 120), and the
  2026-07-13 entry DOES record its own correction of the posture summary. Those supersessions
  are handled properly and are the pattern the other entries should have followed.

---

## 6. COVERAGE, stated plainly so this shard is not read as exhaustive

**This is a partial audit. 37 claims of a 720 line document.**

**NOT checked, by scope ban:**
- Every player money display claim. Specifically: the Bet Replay posture bullet (lines 27 to
  30) and its buy-tier cost display, the buy-feature disclosure bullet (lines 25 to 26), the
  SA-022 `.toFixed(2)` finding (lines 550 to 554), platform delta section 2 on SC display
  format (lines 420 to 430), and Delta 2 on XSC/XEC placement (lines 671 to 694). Not
  measured, not analysed, not proposed on. Note that lines 29 to 30 name only the 100x cost
  multiplier while line 129 extends the requirement to both buy tiers; I am naming that the
  two lines differ and going no further, because settling it is a money-display question.
- Nothing under `games/future_spinner/` was proposed on. Files there were READ only
  (row counts and byte sizes) to check the document against them.

**NOT checked, by choice or by cost:**
- The whole 2026-07-13 JOB 3 entry (lines 132 to 215) was NOT re-verified by re-running its
  tests. It is a dated past-tense record and convention (s) says a dated record cannot become
  false. I did not re-run the determinism test, the telemetry bundle grep, the RGS failure
  path exercises or the `isAutoPlay.set(true)` recount. **If anyone needs those to be current
  rather than historical, they are unchecked.**
- No sha256 was recomputed. The "eight of ten overlapping pages byte identical" claim
  (lines 698 to 701) is UNVERIFIED by me.
- The bet-level constraint table at lines 609 to 621 (the platform's own displayed figures)
  was not reconciled against the maths package. Only the published-limit columns were checked
  against the mirrors.
- The 2026-07-28 books-privacy and Drive exposure entries (lines 372 to 392) were not checked;
  they concern an off-repo artefact I cannot see and should not look for.
- The branch, CI and locked-file claims that live in `CLAUDE.md` rather than in this document
  were out of my document's scope entirely.
- No gate was executed. No script was run. No port was touched.

**Working tree check:** `git status --porcelain` was run at close. Result recorded in the
return object.
