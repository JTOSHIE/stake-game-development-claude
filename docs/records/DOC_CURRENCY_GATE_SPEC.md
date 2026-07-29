# SPEC: the document currency gate

**A gate that fails when a committed document makes a claim that is no longer true of HEAD.**

Specified 2026-07-29 by the Head of Engineering after Session 2. Not yet built. Sized and
staged so a session can pick it up without re-deriving the design.

Australian English, no em dashes or en dashes.

---

## 1. Why, and the chain is the argument

Session 2 found **63 stale document claims, 36 cross-file contradictions and 10 dead
references** by sampling with agents. That is expensive, non-repeatable, and it only ran
because a brief happened to order it.

**One of those stale lines had already corrupted a work order before anyone found it.**
The chain, recorded because every link is a different reader trusting the same document:

1. `COMPLIANCE_WATCH.md:434` recorded the platform payments page as **NOT YET MIRRORED**.
2. `COMPLIANCE_WATCH.md:447` recorded it as **MIRRORED**, written **34 minutes later** the
   same day. Entry 5 was never struck.
3. The stale line survived four days.
4. **The Head of Engineering read line 434 while reviewing a brief, treated it as evidence,
   and cited it** as proof the requirements corpus was incomplete.
5. It was written into the Session 2 brief as an instruction: *name what the corpus is
   known to be missing, the unmirrored payments page included.*
6. It reached Session 2's boot as a **VERIFIED premise**.

Session 2 caught it only by checking commit timestamps against the file's own claim.
**Three consecutive readers trusted the document and the document was wrong.** No amount of
care at step 4 or 6 would reliably catch this, because a reader has no cheap way to know a
prose line is stale. A machine does.

The same session found the docs mirror's newest content dated **2026-07-04** while the live
site carried **64 pages** against the repository's **8**. Drift is not an occasional event
here; it is the steady state of any document nobody re-reads.

---

## 2. The design insight that decides the structure

**A currency gate can only check a claim that is written in a checkable form.** So this is
two things, not one, and the second is the harder half:

- **The checker**, a script.
- **A documentation convention** that makes claims checkable in the first place.

Building only the checker gets a useful but partial gate. Building only the convention gets
nothing, because nobody enforces it. Ship them together, staged.

---

## 3. Phase 1: what is checkable TODAY, with no convention change

These classes need no change to how documents are written, and they are the ones that fail
silently and often. **Build this first; it is most of the value for a fraction of the cost.**

| Class | Pattern in prose | Check |
|---|---|---|
| **Dead path reference** | A backticked path | Does the path exist at HEAD |
| **Stale line citation** | A backticked file with a line or line range after a colon | Does the file exist AND have at least that many lines |
| **Dead symbol citation** | A backticked identifier with a file and line beside it | Does that identifier still appear in that file |
| **Dead commit reference** | A 7 to 40 character hex SHA | Does `git cat-file -e` resolve it |
| **Dead cross-document reference** | A backticked markdown path, or a document and section number | Does the file exist, and the heading if named |

**THE EXAMPLES IN THIS TABLE ARE DESCRIBED RATHER THAN SHOWN, on purpose, and the reason is
the gate itself.** Every cell above once carried a specimen in backticks, and the gate
correctly read all five as live citations to files that do not exist, because that is exactly
what they look like. A specification of a path-checker cannot show specimen paths in the form
the checker hunts, in a document the checker scans. Fenced blocks are excluded and remain the
right home for a worked example; a table cell is not, so the cells describe the shape in words.
Corrected in Session 3's JOB 5, and it is a fix rather than a workaround: the form now matches
the meaning, which is the same reasoning `docs/records/WAYS_OF_WORKING.md` 3.1 applies to a
dead filename it deliberately leaves unbackticked.

Session 2's own numbers say Phase 1 alone would have caught **at least the 10 DEAD_REFERENCE
findings** and a share of the 26 STALE_NUMBER ones, mechanically and on every push.

**Explicit non-goal for Phase 1:** it does not check whether the prose AROUND a citation is
true. `WinBanner.svelte:205 renders an ASCII x` is only checked for whether line 205 exists,
not for what it says. That is Phase 2.

---

## 4. Phase 2: the annotation convention, for claims a machine cannot infer

Some claims are not checkable from their own text. `NOT YET MIRRORED`, `519 frames`,
`this is deleted`, `no gate covers this`. These need the document to say how to check them.

Proposed inline form, chosen because it is invisible in rendered markdown and greppable:

```markdown
The payments page is not yet mirrored. <!--CHECK: !exists docs/stake-engine-live/*/payments.md-->

The capture set holds 519 frames. <!--CHECK: count=519 reports/screens/stream-test-2026-07-28/*.png-->

The four dead stores are unreferenced. <!--CHECK: !grep -r "betIndex" frontend/src-->
```

Four predicates cover nearly everything observed: `exists`, `!exists`, `count=N`, `grep` and
`!grep`. **Keep the vocabulary this small.** A richer language will not be used, and a
predicate nobody writes checks nothing.

**The convention half is only worth adopting where a stale claim would cost something.** The
candidates, from Session 2's evidence: `COMPLIANCE_WATCH.md`, `SUBMISSION_DOSSIER.md`,
`KNOWN_OPEN.md`, `CLAUDE.md`'s LOCKED_FILE_DEBTS, and any tracker row asserting a status.
Do not annotate session reports or archives: they are dated records of what was true then,
and re-checking them against a moved HEAD is exactly the epoch trap
(`FULL_AUDIT_METHOD.md` 2.2).

---

## 5. The seeded self-test, per convention (p)

**Non-negotiable, and seed the form that actually shipped.** A gate that has never been seen
to fail is a script that prints PASS.

Seeds, each planted in a throwaway copy and each required to go RED:

1. **The real one.** A line reading `NOT YET MIRRORED` about a path that exists. This is the
   defect that actually cost this project a corrupted work order, and it is the seed that
   matters most.
2. A line citation pointing past the end of a 200 line file.
3. A backticked path that was deleted.
4. A commit SHA that does not resolve.
5. A count predicate asserting 519 against a directory holding 518.

Plus **negative controls**: the repository as it stands must pass, and a document
legitimately describing a past state inside a dated archive must not be flagged.

**Expect the first real run to correct the gate.** Both previous gates in this project
produced false positives on their first run and both were design flaws rather than
exceptions. Do not allowlist a false positive that can be fixed structurally.

---

## 6. Scope, wiring and the ratchet

- **Scan**: all tracked `.md` outside the epoch-trapped classes below.

  **AMENDED 2026-07-29, after the build session raised the contradiction this spec
  contained.** Section 4 above says dated records are not to be kept current, because
  re-checking them against a moved HEAD is the epoch trap. This line originally excluded
  only two paths, which did not carry that reasoning through. **Section 4 is the one that
  is right.** Five exclusions, and the reason each one is not optional:

  | Excluded | Why |
  |---|---|
  | `reports/archive/` | Dated records of what was true then |
  | `docs/stake-engine-live/` | Verbatim third-party captures, not ours to keep current |
  | `reports/briefs/` | **Convention (f) forbids editing a brief.** A finding here is FORBIDDEN TO FIX, and a gate demanding an impossible action is broken, not strict |
  | `reports/SESSION_REPORT.md` | `reports/archive/` holds per-session EXTRACTS of this file, so the same sentences were excluded in one path and scanned in another |
  | any path segment `shards` (see the gate's OUT_OF_SCOPE_SEGMENTS) | Dated signed squad evidence. Was being flagged FOR CORRECTLY REPORTING a dead path |

  **Still scanned, deliberately**: ledgers, dispositions, trackers, `CLAUDE.md`, the specs,
  every live working document. A stale citation there misleads someone about to act, which
  is the whole point. 341 of the original 492 frozen claims are in this class and all are
  held. Implemented at `scripts/qa/doc_currency_gate.mjs`, seeded with three controls plus
  a paired positive seed proving the exclusions are a narrowing and not a retreat.
- **Wire**: a static-gate step in `checks.yml`, after `locked_paths_gate.mjs`.
- **Expect a large first count.** Session 2 found 63 stale claims in a sample, so the true
  figure across every document will be higher. **Use the frozen-debt ratchet**
  (`FULL_AUDIT_METHOD.md` 3.1): freeze the existing findings keyed by **file AND text**, let
  the gate go live so new drift fails immediately, print the frozen count on every run, and
  check the list in both directions so an entry matching nothing fails too. Burn entries in
  the same commit as their fix.

---

## 7. Sizing

Phase 1 is a main-loop job, not an agent job. It is deterministic classification over about
3,600 tracked files, which is exactly the work Session 2 did for near-zero cost with a
one-off census script rather than with ten squads. (That script was written to scratch and
never committed, so it exists nowhere in the tree and is deliberately not named in backticks
here. Naming a dead file as though it were live is the provenance failure recorded at
`docs/records/WAYS_OF_WORKING.md` 3.1, and this document is where the currency gate found it.)

| Item | Estimate |
|---|---|
| Phase 1 checker plus seeded self-test | main loop, about 0.4M |
| First real run, triage and the frozen baseline | main loop, about 0.3M |
| Phase 2 convention plus annotating the five named documents | main loop, about 0.5M |
| **Total** | **about 1.2M, no agents** |

Against the cost of not having it: Session 2 spent roughly **2.3M of agent budget** on the
census and currency sweep that found this class by hand, and that sweep is a snapshot which
starts going stale the moment it lands.

---

## 8. What this does NOT solve

Stated so the gate is not oversold, per the standing habit of naming what is not covered.

- **It cannot check a claim nobody wrote a predicate for.** Phase 2 is opt-in by definition.
- **It cannot detect a contradiction between two prose lines** that are each internally
  checkable but disagree with each other, unless both carry predicates. The payments case is
  caught because one side is checkable against a path, not because the gate understands the
  disagreement.
- **It reads a citation, never the sentence around it.** A live document that REPORTS a
  dead reference, in the form "component-name dot svelte no longer exists", is flagged as
  though it CLAIMED the path exists. Found the honest way: writing up a provenance failure in `WAYS_OF_WORKING.md`
  made the gate fail on its own author. **This is not a small class.**
  `docs/records/reviews/REVIEW_TRACKER.md` is the largest baseline contributor at **58**
  entries and carries 44 negation phrases. **CORRECTED 2026-07-29 by the boot-set audit: this
  read 59 and was right when written.** One `DEAD_SYMBOL` entry, `CurrencyMeta @
  frontend/src/lib/utils/currency.ts`, was burned on 2026-07-29 when the currency-table
  session named that symbol in a comment and the finding stopped firing. The entry went, the
  sentence did not, and the number was stale inside a day. **That is this document describing
  its own subject matter**, so it is corrected in place rather than quietly, and the
  provenance is kept: a count in prose is a claim with no predicate holding it, which is the
  argument for section 4's annotation convention stated against this page's own text. The
  structural fix is a negation-aware check,
  treating a report of absence as distinct from a claim of presence, and it is Session 3
  follow-up rather than something to bolt onto a gate that runs first in CI.
- **A backticked GLOB reads as a path.** Found while amending this very section: a pattern
  in a table cell was reported dead because no literal file is named that. Globs inside
  fenced blocks are safe, since fences are excluded, so this only bites in running prose
  and tables. Same root as the item above, and the same fix: judge the token by what the
  document is DOING with it, not by its shape alone.
- **It does not judge whether a document should exist.** That is the file census.
- **It does not make the docs mirror current.** That is convention (d), and Session 2 showed
  the live site is only reachable under headless chromium, never plain fetch.
