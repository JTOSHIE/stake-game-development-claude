# Future Spinner: Audit Pack Index

Studio: We Roll Spinners. Prepared: 2026-07-14, JOB 6 of the 2026-07-13 consolidated
work order ("External audit refresh prep"). This is prep only: it points the next
external audit at current artefacts and lists what to ignore. The audit itself is a
separate, later session, run after Fable's next check-in, not part of this pass.

## 1. Current artefacts (point the audit here)

| Artefact | Path | Notes |
|---|---|---|
| Living handover | `HANDOVER_2026-07-07_Fable.md` | The one living document for this arc per CLAUDE.md convention (j); extended with dated appended sections, not replaced. |
| Compliance evidence | `COMPLIANCE_WATCH.md` | Re-validated fresh 2026-07-13 (JOB 3 of this work order); ignore its own internal 2026-07-07 sub-entry marked SUPERSEDED. |
| Submission dossier | `SUBMISSION_DOSSIER.md` | Section 3 blurb, section 4 compliance map, section 5 staging protocol (rewritten JOB 5); currently on unmerged branch `claude/dossier-copy-job5` (PR #60), not yet on main. |
| Storefront blurb | `PROMO_BLURB.md` | Canonical short-form blurb, five-mode Overdrive text; supersedes `SUBMISSION_BLURB.md` (see section 2). |
| PAR sheet | `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md` | Locked package, five-mode FeatureMath v2 documented. |
| Game facts | `GAME_FACTS.md` | Includes the 2026-07-13 "Audio: shipped" bullet (JOB 5), currently on unmerged branch `claude/dossier-copy-job5`. |
| Math validation | `MATH_VALIDATION.md`, `scripts/validate_math.py` | CI-gated, independently re-run 2026-07-07 and again 2026-07-13. |
| RGS contract | `docs/RGS_CONTRACT_REFERENCE.md` | Client/wire alignment. |
| Replay event IDs | `REPLAY_TEST_EVENTS.md` | All five modes present since 2026-07-08. |
| QA logs, current | `reports/qa/wiring_integrity_audit_2026-07-07.md`, `reports/qa/review_events_statelessness_2026-07-08.md` + its `.json` | On main today. |
| QA logs, JOB 1/2 (this work order) | `reports/qa/audio_verify_2026-07-13.json`, `reports/qa/frame-gate-attribution-2026-07-13.json`, plus the refreshed soak/session/cost-gate JSONs | Not yet on main; live on unmerged branches `claude/audio-integration-job1` (PR #56) and `claude/qa-resoak-job2` (PR #57). Audit must pull these branches or wait for merge. |
| This work order | `FS_ConsolidatedWorkOrder_2026-07-13_Prompt.md` | Saved verbatim per convention (b)/(f); explains the provenance of Jobs 1-6's changes. |

## 2. Superseded — an auditor must ignore these

- **`SUBMISSION_BLURB.md`** (repo root). Pre-Overdrive, single-mode text ("no bonus
  rounds or held state", scatter-only 1x/3x/10x). Directly contradicts the shipped
  five-mode Overdrive Free Spins game. Superseded by `PROMO_BLURB.md` and
  `SUBMISSION_DOSSIER.md` section 3. Found during this pass; not previously flagged
  anywhere. Not deleted (out of scope for a prep-only job), flagged here instead.
- **`HANDOVER.md`** (repo root, undated legacy) and **`HANDOVER_2026-07-06_Fable.md`**.
  Both superseded by `HANDOVER_2026-07-07_Fable.md` per convention (j).
- **Everything under `reports/archive/`** (43 dated `.md` files plus the `prompts/` and
  `qa-2026-07-04/` subdirectories as of this pass). Historical record only; none of it
  is current state. Includes the archived copies of this same work order's own Job
  1-6 session reports.
- **`~/Desktop/FS_AuditPack/` and `~/Desktop/FS_AuditPack.zip`** (dated 2026-07-04).
  Predates FeatureMath v2 (three extra modes, shipped 2026-07-07), predates audio
  (JOB 1, this work order), predates the JOB 5 dossier/copy rewrite, predates JOB 3's
  compliance re-validation. Do not hand this pack to an auditor; regenerate fresh from
  section 1 above once Jobs 1-5's PRs (#56, #57, #58, #59, #60) are merged.
- **`COMPLIANCE_WATCH.md`'s own internal 2026-07-07 sub-entry marked SUPERSEDED**
  (inside an otherwise-current document — read the whole file, not just the top).
- **`SUBMISSION_CHECKLIST.md`** — does not exist in this checkout; already noted as
  superseded by `SUBMISSION_DOSSIER.md` section 1's own header. Listed here only so an
  auditor who finds a reference to it elsewhere knows not to search for it.

## 3. Known gaps at time of writing (carried from Jobs 3-5, not resolved here)

- `books_super.jsonl.zst` is absent from the local `library/publish_files/` checkout
  (gitignored path); `index.json` requires it. Last-recorded hash is in the PAR sheet.
  Needs regeneration under a sanctioned `games/future_spinner/**` lock exception before
  staging (JOB 5 finding, `reports/archive/2026-07-13_job5-dossier-copy.md`).
- Seven orphaned, unreferenced `books_*.jsonl.zst` files sit alongside the referenced
  ones in the same directory (JOB 5 finding). Not deleted (locked path); flag for a
  future sanctioned cleanup pass.
- `WRS_MASTER_DOCUMENT.md` referenced by an earlier brief does not exist anywhere in
  this repo (confirmed by thorough search); owner chose to skip resolving this pointer
  for now.
- `frontend/scripts/build_diet_verify.mjs` has two divergent unmerged versions (JOB 2's
  reduced-motion/reel-toggle checks on PR #57, JOB 4's dist-budget gate on PR #59) that
  will conflict when both are merged; whoever merges both must reconcile them before an
  audit session runs against main.

## 4. Not done in this pass

This is prep only. No audit was run, no findings were adjudicated, and the Desktop
pack was not regenerated. The next step is a separate fresh session, after Fable's
check-in, using the pointers in section 1 once PRs #56-#60 are merged to main.
