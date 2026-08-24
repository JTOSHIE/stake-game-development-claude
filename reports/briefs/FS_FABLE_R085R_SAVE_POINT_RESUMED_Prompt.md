R085-R: SAVE POINT RESUMED. Supersedes R085 in whole per convention (v);
R085 is DEAD and this is the sole live brief. Green lane. Sonnet.
Unattended. Save and commit this brief verbatim per convention (c).

PRECONDITIONS
1. On main, clean tracked tree, git pull. Record HEAD as BASELINE_SHA.
2. git ls-remote --tags origin still shows neither submission-1 nor
   arc2-baseline. If either exists: STOP and report.
3. Locked paths untouched. No force operations. No generation, no API
   calls, no network beyond git and gh. output/imagegen is READ-ONLY
   this session: nothing in it is moved, edited, deleted or committed.

TASK 1: THE RESTORE POINT, NOW
Create and push one annotated tag at BASELINE_SHA:
  git tag -a arc2-baseline BASELINE_SHA -m "Arc-2 restore point before
  the production-values reskin (art, animation, audio). Engineering
  estate frozen-valid at review 1: platform-quoted 4.3 of 9, recomputed
  sum 4.33 (1.33 + 1.33 + 1.67, average 1.44), zero compliance,
  functional, correctness, mathematical, RGS, localisation,
  responsible-gambling or accessibility findings (TR-181). AssetForge
  and the provider gate are landed; no reskin assets exist in the tree.
  Roll back here to recover the last pre-reskin state. The submission-1
  build question was open at tagging time; see comms 083."
  git push origin arc2-baseline

TASK 2: SUBMISSION-1 AND ITS RELEASE STAY HELD
Definition of ready, and nothing less: an owner-supplied artefact that
states the built SHA verbatim, meaning the kit README line or the
build-info.json from the zip actually uploaded, or a portal capture
showing the uploaded package identity. Owner memory does not qualify.
When it lands in a future session: tag submission-1 at that SHA quoting
the artefact verbatim in the message, using the two-figure score form
above, then build the release per R085 TASK 3 semantics unchanged,
including the original-versus-rebuild labelling and the never-present-a-
mismatched-rebuild-as-original rule.

TASK 3: READ-ONLY INVENTORY OF output/imagegen
Report, touching nothing: the directory tree to one level with file
counts per folder; total bytes; the date range of file mtimes; and the
VERBATIM contents of every ledger, prompt record or provenance file
found there, specifically any provider, model, endpoint, seed, cost,
request-id or key-name fields. If a style register or config sits in or
beside it, quote that too. Draw no conclusions in the report; the
provider ruling is the owner's and Fable's. Do not open image files
beyond reading headers for dimensions.

TASK 4: RECORDS AND CLOSE
Comms entry 084, folded, newest-first (convention t): tag name and SHA,
the held state of submission-1 with its definition of ready, and the
inventory findings in brief. SESSION_REPORT.md plus dated archive copy.
Explicit-path staging only (k). Close sequence gates chained with &&,
exit codes as direct operands (o).

FOR THE NEXT SESSION
submission-1 unlocks only on the owner artefact. R086 arrives from
Fable on the owner's REISSUE: style register, secret-scanning gate,
Gemini terms capture, SY-09 transcription, arc-2 living handover, and
the submission-record convention text if the owner ratifies. All
generation remains blocked on the owner's provider ruling.
