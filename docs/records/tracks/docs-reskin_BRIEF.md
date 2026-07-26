# track/docs-reskin: the brief

Paste the fenced block below into a **fresh session**. It is complete: it names
its own boot list, its manifest and its limits.

**Suggested model: Opus at High.** This is judgement work. It writes a
boundary document that a future reskin will be planned from, and it decides what
is honestly a gap versus what merely looks like one.

**This brief is already committed at this path.** Convention (f) is satisfied by
the file you are reading, so the session does NOT re-save it to
`reports/briefs/`, which is outside its manifest and would fail the scope gate.

---

```
track/docs-reskin. You are Claude Code, working ONE TRACK of a multi-track
programme for We Roll Spinners' Future Spinner, in a FRESH context.

BOOT by reading, in order:
  1. CLAUDE.md in full. Pay particular attention to THE STANDING MANDATE, THE
     MULTI-TRACK PROTOCOL immediately below it, convention (l) DERIVE BEFORE
     MEASURING, convention (p) seeded self-tests, and the locked files section.
  2. reports/SESSION_REPORT.md, at least the last three dated sections.
  3. reports/briefs/FS_V3_CONSOLIDATED_Prompt.md and
     reports/briefs/FS_V3_CONTINUATION_Prompt.md. These are the LIVE PARENT
     briefs. Your work is JOB 6 and JOB 10 of that set, and nothing in this
     brief supersedes them.
  4. docs/records/tracks/docs-reskin.manifest, which is your scope.
  5. docs/records/reviews/REVIEW_TRACKER.md, the rows referenced below.

YOU ARE NOT THE INTEGRATOR. main is single-writer and you do not hold that role.

  - Work on a branch named exactly `track/docs-reskin`, created from main.
  - NEVER push main. NEVER merge to main. Deliver by pull request only.
  - Every path you touch must match a glob in
    docs/records/tracks/docs-reskin.manifest. CI fails otherwise, and the
    manifest is deliberately narrow. If you believe it needs widening, say so in
    the PR and STOP rather than widening it yourself: it was proved disjoint
    against track/quality-sweep's manifest, and widening it can silently end
    that property.
  - No lock exceptions. Nothing you need is inside a locked path.
  - Explicit paths on every commit, never `git add -A`. No em or en dashes.

YOUR SCOPE, exactly:
  docs/RESKIN_BOUNDARY.md
  docs/records/reviews/FIX_LIST_2026-07-26.md
  SUBMISSION_DOSSIER.md
  GAME_FACTS.md
  COMPLIANCE_WATCH.md
  WRS_MASTER_DOCUMENT.md
  docs/records/tracks/docs-reskin.manifest
  reports/tracks/docs-reskin/

JOB A, THE FIX LIST. Bring docs/records/reviews/FIX_LIST_2026-07-26.md up to
date so every row carries its disposition AND its commit. It has not been
touched since it was written and does not reflect commits e4bfbc5 through
a1ff78b. Read those commits and the tracker rows they closed (TR-062, TR-066,
TR-067, TR-068, TR-070, TR-072) rather than the session report's summary of
them, because the report is a summary and the row is the record. A row whose fix
landed under a different number than the fix list expected is worth saying so
about rather than quietly renumbering.

JOB B, JOB 6 OF THE LIVE PARENT, DOCUMENTATION. Four things:

  1. SUBMISSION_DOSSIER.md gains an evidence section recording the platform's
     own INDEPENDENT maths corroboration: RTP 96.3500, SD 17.2841, 100000
     simulations, 5000x max win, 0.00% variance, and all constraints green at
     both star tiers. Point at the captures rather than restating them:
     reports/screens/dtt-live-2026-07-26/15_maths_overall_bet_level_compliance_all_pass.png,
     16_maths_all_five_modes_compliant.png,
     17_maths_base_detailed_metrics_and_6of6.png,
     18_maths_base_hit_rate_distribution.png and
     19_maths_base_property_table_rtp_963500_sd_172841.png.
     The point of this section is that these are the PLATFORM'S numbers, computed
     by the platform from our uploaded tables, agreeing with ours. Say what each
     side computed from, per convention (l.4): agreement is worth nothing if the
     two shared an input, and here they did not.
  2. The production money-path proof: the four to-the-cent HUD reconciliations
     across base, 100x and 400x, and Event 63's 400x debit. These currently exist
     ONLY inside TR-068's tracker row. Lift them into the dossier with their
     timestamps and figures so a reviewer does not have to read a tracker row to
     find the strongest evidence we have that the money path is correct.
  3. The item 12 conflict recorded as OBSERVATION-PENDING with BOTH first-party
     citations. TR-064 has it: the official client's end-round rule and the
     platform's own testing guideline give opposite instructions for zero-win
     rounds. Quote both verbatim with their dates per convention (l.7). Do not
     resolve it. The owner's second visit observes it.
  4. GAME_FACTS.md gains the 5.00% wincap RTP band fact, and COMPLIANCE_WATCH.md
     gains the platform-stated 96.70% ceiling with its capture reference. Both
     figures must be cited to a source a reader can open.

JOB C, JOB 10 OF THE LIVE PARENT, THE RESKIN BOUNDARY. Write
docs/RESKIN_BOUNDARY.md: the definitive engine-versus-skin inventory, directory
by directory.

  ENGINE: mode logic, wallet layer, interpreters, stores, gates, conformance
  suites, maths pipeline.

  SKIN: symbol art and masters, palette tokens, vocabulary and locale strings,
  audio rows, splash and celebration assets, layout theme constants, brand
  marks, tile layers.

  For each SKIN element state: where it lives, format and dimensions, the
  generation pipeline and seed convention, and WHICH GATES RE-RUN after swapping
  it. That last one is the part that makes the document useful rather than
  decorative.

  Close with the honest gaps: everything currently hard-coupled that a clean
  reskin would need decoupled, RANKED, explicitly for post-submission work.
  REFACTOR NOTHING NOW. A gap named accurately is the deliverable; a gap quietly
  fixed while writing the document is scope you did not have.

  Cross-reference WRS_MASTER_DOCUMENT.md's LUMEN next-title template section so
  the two documents tell one story rather than two.

DERIVE BEFORE MEASURING applies throughout. Every figure carries a file:line or
a capture path. If a number cannot be cited it is not known, and "not known" is
the honest entry.

CLOSE. Write reports/tracks/docs-reskin/SESSION_REPORT.md as a section that is
BOTH dated AND track-tagged, per protocol rule 8. Do NOT write to
reports/SESSION_REPORT.md: the integrator concatenates track reports into it,
and that file is outside your manifest. End with a FOR THE NEXT SESSION block
per convention (i). Then open a pull request from track/docs-reskin and STOP.
Fable verifies before merge; the integrator merges.
```
