R085: SAVE POINT. Tags and release. Green lane. 2026-08-24.

SUPERSESSION (convention v): the un-pasted "R084 UNBLOCK PACK" from the
prior Fable chat is DEAD in whole. Its scope returns as R086. Exactly one
live brief exists and it is this one.

TIER: Sonnet. Specified mechanical work. Unattended execution. Save and
commit this brief verbatim per convention (c).

PRECONDITIONS
1. On main, clean tree, git pull. Record HEAD as BASELINE_SHA.
2. git ls-remote --tags origin. If a tag named submission-1 or
   arc2-baseline already exists: STOP, report, change nothing.
3. Locked paths untouched this session. No force operations anywhere.
   Tags are annotated, pushed once, and never moved.

TASK 1: ESTABLISH SUBMISSION_SHA FROM COMMITTED RECORDS ONLY
The submitted kit carries its source SHA in its kit README by our own
rule, and the kit manifest gate recorded name, bytes and sha256. Establish
the commit the reviewed kit was built from using, in priority order:
  a. SUBMISSION_DOSSIER.md staging and upload sections;
  b. the kit manifest records under reports/ (name, bytes, sha256);
  c. dated session reports and comms entries of 2026-08-19 to 2026-08-21;
  d. docs/records/reviews/REVIEW_TRACKER.md.
Evidence rule (convention m): the SHA must be stated explicitly by at
least one committed record. Quote that record verbatim, with its path, in
the session report. If no committed record states it unambiguously: STOP,
tag nothing, and report the candidate commits with their evidence.
Also verify the review-1 figures against REVIEW_TRACKER.md before
writing the tag message. The tracker's figures win over this brief.

TASK 2: TWO ANNOTATED TAGS
Tag A, at SUBMISSION_SHA:
  git tag -a submission-1 SUBMISSION_SHA -m "Future Spinner as submitted
  for Stake Engine review 1. Reviewed 2026-08-21: 4.33 of 9 (reviewers
  1.33, 1.33, 1.67) against the 6-of-9 publication bar. Zero compliance,
  functional, correctness, mathematical, RGS, localisation,
  responsible-gambling or accessibility findings. This commit is the
  source of the reviewed kit; the kit README carries this SHA."
  (Correct the figures from the tracker first if they differ.)
Tag B, at BASELINE_SHA:
  git tag -a arc2-baseline BASELINE_SHA -m "Arc-2 restore point before
  the production-values reskin (art, animation, audio). Engineering
  estate frozen-valid at review 1. AssetForge and the provider gate are
  landed; no reskin assets exist yet. Roll back here to recover the last
  pre-reskin state."
Push explicitly: git push origin submission-1 arc2-baseline

TASK 3: GITHUB RELEASE ON TAG submission-1
1. Search committed records for an archived ORIGINAL kit zip and its
   recorded sha256 (kit manifest records under reports/, dossier).
2. If an original artefact exists in the tree and its sha256 matches the
   recorded manifest value: attach that file. Label: original.
3. Else: git worktree add ../submission1 submission-1, clean install and
   build there, zip per the staging protocol, compute sha256. If it
   matches the recorded manifest value, label: original, reproduced. If
   it differs, attach anyway labelled: rebuild from tagged source, and
   state BOTH hashes (recorded original, this rebuild) in the notes.
   Never present a mismatched rebuild as the original.
4. gh release create submission-1 --title "Submission 1 (as reviewed
   2026-08-21)" --notes-file <notes> <kit.zip>
   Notes must state: what the tag marks, the review outcome, which label
   from step 2 or 3 applies, the artefact sha256, and the SUBMISSION_SHA.
5. If the build at the tag fails or gh cannot create the release: still
   push the tags, skip the asset, report the failure verbatim. Do not
   improvise fixes at the tagged commit.

TASK 4: RECORDS AND CLOSE
1. Append comms entry 083 to reports/FABLE_COMMS.md, newest-first, one
   entry, folded (convention t): tags created with their SHAs, release
   URL, artefact label and sha256, the verbatim evidence line for
   SUBMISSION_SHA, and any parks.
2. SESSION_REPORT.md plus dated archive copy per the loop-closure
   convention. Commit this brief verbatim alongside.
3. Explicit-path staging only (convention k). Records commit goes direct
   to main per the green lane. Standard close sequence applies, gates
   chained with && per convention (o), exit codes as direct operands.

FOR THE NEXT SESSION
R086 is expected from Fable on the owner's REISSUE: style register from
the ratified prompts, secret-scanning gate, Google Gemini terms capture,
SY-09 manifest transcription (holographic dash readout, not booster),
and the arc-2 living handover. Art generation remains blocked on the
owner's provider ruling. No generation of any kind this session.
