# Future Spinner: Audit Pack Index

Studio: We Roll Spinners.

**Refreshed 2026-07-26** (audit-prep pass, Fable ruling block of the same date).
Supersedes the 2026-07-14 edition, which had gone materially stale: it pointed at the
previous arc's handover, listed three long-merged PRs as unmerged blockers, and
predated the entire platform-delta and cleanup arc.

This is prep only. It points the external audit at current artefacts and lists what to
ignore. **The audit itself does not run until the owner's re-test verdict and any
round-4 items are resolved.**

## 0. Verification status of this index

Every repo-relative path referenced across the audit-defining documents
(`AUDIT_PACK_INDEX.md`, `HANDOVER_2026-07-25_Fable.md`,
`FS_Fable_ModelHandover_2026-07-25.md`, `CLAUDE.md`, `SUBMISSION_DOSSIER.md`,
`COMPLIANCE_WATCH.md`, `CLAUDE_PROJECT_INSTRUCTIONS_v6.md`, `reports/SESSION_REPORT.md`,
`reports/FABLE_COMMS.md`) was machine-checked on 2026-07-26:

**83 repo-relative paths verified present. Zero broken references.**

Everything that did not resolve was correctly a non-file reference: git branch names,
live-site URL paths, GitHub repo slugs, or partial-path prose shorthand. No auditor
following a pointer in these documents will hit a missing file.

## 1. Current artefacts (point the audit here)

**Working tree is clean and everything below is on `main`.** There are no open PRs and
no unmerged work. This is a change from the 2026-07-14 edition, which required the
auditor to pull three branches.

| Artefact | Path | Notes |
|---|---|---|
| Living handover | `HANDOVER_2026-07-25_Fable.md` | Current arc per convention (j). **Supersedes the 2026-07-07 document**, which the previous edition of this index pointed at. |
| Builder governance | `FS_Fable_ModelHandover_2026-07-25.md` | Roles, two-lane merge policy, dual independent verification (protocol 6), the nine-step map to submission. |
| Fable comms log | `reports/FABLE_COMMS.md` | Append-only, newest first. Current state of play and every open ruling. **Read this first for orientation.** |
| Session report | `reports/SESSION_REPORT.md` | Current, unarchived. Carries the platform-delta delta table. |
| Compliance evidence | `COMPLIANCE_WATCH.md` | Current posture plus the dated watch log. The **2026-07-25 section** carries the full automated bet-level constraint extraction, both star tiers, with definitions. |
| Live docs mirror | `docs/stake-engine-live/2026-07-25/` | Dated capture with `_manifest.json` (SHA-256 per page) and `DELTA_NOTES.md`. **The authoritative mirror.** |
| Bet-level maths compliance | `reports/qa/math_bet_level_compliance_2026-07-25.md` | Protocol 6 two-computer verification, 19 of 20 figures reconciled, the twentieth root-caused. Raw values in the sibling `.json`. |
| Currency and SC readiness | `reports/qa/currency_readiness_2026-07-25.md` | Includes section 6a, the applied Fable rulings (trailing SC, social wording). |
| Fresh-eyes review | `reports/qa/fresh_eyes_review_2026-07-26.md` | 14 findings: hygiene, approach audit, error archaeology, capability assessment. |
| Tool vetting | `docs/records/tooling/TOOL_VETTING_2026-07.md` | Five candidates, licences, gambling compatibility, verdicts. |
| Submission dossier | `SUBMISSION_DOSSIER.md` | Sections 3 blurb, 4 compliance map, 5 staging protocol. **5f** is the mandatory ACP Math Distribution and Summary gate; **5g** is the final docs-delta sweep gate. |
| Company and platform register | `WRS_MASTER_DOCUMENT.md` | Sections 2a (new platform rules with pass status), 2b (distribution targets), 2c (roadmap intel, marked unverified). |
| Storefront blurb | `PROMO_BLURB.md` | Canonical five-mode Overdrive text. |
| PAR sheet | `games/future_spinner/FUTURE_SPINNER_PAR_SHEET.md` | Locked package, five-mode FeatureMath v2. |
| Game facts | `GAME_FACTS.md` | Includes the audio-shipped bullet. |
| Math validation | `MATH_VALIDATION.md`, `scripts/validate_math.py` | CI-gated. Independent recomputation also at `scripts/qa/bet_level_compliance.py`. |
| RGS contract | `docs/RGS_CONTRACT_REFERENCE.md` | Client/wire alignment. |
| Replay event IDs | `REPLAY_TEST_EVENTS.md` | All five modes. |
| HUD coordinate spec | `docs/HUD_SPEC.md` | Locked table, machine-enforced by `frontend/scripts/hud_banner_spec_check.mjs`. |
| Statelessness proof | `scripts/review_events_stateless_scan.py`, `reports/qa/review_events_statelessness_2026-07-14.md` | Plus the `.json` results. |
| CI gates | `.github/workflows/checks.yml` | Six static gates on every PR: typecheck baseline, dead wiring, wallet floats, currency-scale drift, fsModes/index.json drift, currency static assertions. |
| Executed briefs | `FS_*_Prompt.md` (repo root) | Every brief saved verbatim per conventions (b)/(f); explains the provenance of each arc's changes. |

## 2. Superseded, an auditor must ignore these

- **`HANDOVER.md`** (undated legacy), **`HANDOVER_2026-07-06_Fable.md`**, and
  **`HANDOVER_2026-07-07_Fable.md`**. All superseded by `HANDOVER_2026-07-25_Fable.md`
  per convention (j). The 2026-07-07 document carries a pointer note to its successor.
  **This changed since the previous edition of this index, which listed the 2026-07-07
  document as current.**
- **`reports/archive/SUBMISSION_BLURB_superseded.md`** (moved from the repo root
  2026-07-14). Pre-Overdrive single-mode text that directly contradicts the shipped
  five-mode game. Carries its own SUPERSEDED header. Superseded by `PROMO_BLURB.md` and
  `SUBMISSION_DOSSIER.md` section 3.
- **Everything under `reports/archive/`** (**79** dated `.md` files as of this refresh,
  up from 43 at the previous edition, plus the `prompts/` and `qa-2026-07-04/`
  subdirectories). Historical record only. None of it is current state.
- **`docs/stake-engine-live/*.md` at the top level** (the 2026-07-04 capture set).
  Superseded by `docs/stake-engine-live/2026-07-25/`. The old set still shows the
  3-star Maximum Exposure as $25,000,000; the current figure is **$50,000,000**.
- **The public `StakeEngine/docs` GitHub repository.** Not superseded by us, but
  **actively misleading**: commit `fefadc7` (2026-03-17) is four months stale and
  structurally diverged from the deployed site. It still advertises a 90.0 to 98.0 RTP
  range and carries none of the automated bet-level risk limits. Compliance questions
  are answered from the live site or our dated mirror, never from that repository. See
  `docs/stake-engine-live/2026-07-25/DELTA_NOTES.md`.
- **`design-system/brand/archive/vector_mark/`** (v2 and v3 mark track, retired
  2026-07-25, carries its own `SUPERSEDED.md`). The sole mark is the hero emblem.
- **`COMPLIANCE_WATCH.md`'s own internal 2026-07-07 sub-entry marked SUPERSEDED**
  (inside an otherwise-current document; read the whole file, not just the top).
- **`SUBMISSION_CHECKLIST.md`** does not exist in this checkout. Superseded by
  `SUBMISSION_DOSSIER.md`. Listed only so an auditor who finds a reference elsewhere
  knows not to search for it.
- **`~/Desktop/FS_AuditPack/` and `~/Desktop/FS_AuditPack.zip`** (dated 2026-07-04).
  Predates FeatureMath v2, audio, both layout rebuilds, the identity lock and this
  entire arc. **Do not hand this pack to an auditor.** Regenerate fresh from section 1.
- **Two untracked working-tree directories**, `games/future_spinner_super/` and
  `sideproject/`. Both verified safe and content-duplicated elsewhere (see the
  2026-07-25 FINAL MERGE close-out sweep). Not part of the audit surface.

## 3. Known gaps at the time of this refresh

Every gap listed in the previous edition has been closed (the `books_super.jsonl.zst`
absence, the orphaned books files, the missing `WRS_MASTER_DOCUMENT.md`, and the
divergent `build_diet_verify.mjs`). These are the current ones.

- **Two named external-audit gates, neither yet satisfied.** `qa_soak.mjs`'s full
  24-cell locale x social x speedTier matrix and `portrait_layout_conformance.mjs`'s
  full run must **each complete clean in the audit's own fresh environment**. Previous
  sessions reached 8 of 24 cells and a killed run respectively. Neither partial result
  counts. These are the audit's headline deliverables.
- **Popout-viewport overflow, real product finding, unfixed.** `IntroSplash.svelte`'s
  Continue button can render fully outside the visible viewport at Stake's 400x225
  mini-player size. Requires a first-ever session opened directly in mini-player mode.
  Needs its own responsive pass.
- **Audio loop-seam decode gap, unconfirmed either way.** `audio_verify.mjs`'s seam-RMS
  gate fails to decode all three shipped bed tracks in headless Chromium. A uniform
  failure across every file reads more like a headless codec limitation than six
  corrupted masters, but this has not been confirmed. Needs a real-browser re-check.
- **Six scripts still carry private overlay handling**, outside
  `frontend/scripts/lib/dismissOverlays.mjs`: `layout_v1_audit`, `motion_v2_proof`,
  `reel_v3_proof`, `scene_proof`, `ux_v1_audit` (all via `dismissIntroIfPresent`) and
  `animation_uplift_proof` (inline, under a different name, which is why earlier sweeps
  counted five). **None is in the mandatory conformance gate**, so this does not block
  the audit. Ruled low priority (Fable ruling 7, R2).
- **svelte-check baseline is 11 errors, not zero.** All 11 enumerated and classified in
  `reports/FABLE_COMMS.md` entry 004; none is compliance-bearing. CI enforces
  no-regression against the baseline rather than zero.
- **XEC unverified.** Stake EU remains a contingent distribution target. Resolution is
  empirical, via currency toggling in the Developer Testing Tool staging session.

## 4. What the audit is expected to carry

Per `HANDOVER_2026-07-25_Fable.md` item 4 and the model-handover map item (4):

1. Both heavy suites to completion, clean, in a fresh environment.
2. The reviewer-tag rubric: inconsistent art style, poor animations, poor mobile
   experience, elements overlapping the board.
3. The `dismissOverlays` rider. **Already implemented and verified present**: the
   shared helper handles the MaxWinCelebration wincap gate both by its COLLECT testid
   and by the `.max-win-overlay` container's own presence, exported as
   `clickAnyPendingGate` (Round 3 FINAL MERGE rider (a), re-verified 2026-07-26).
4. A star prediction.
5. **One manual type check the tooling cannot do.** `svelte-check` fails to parse
   `frontend/src/lib/components/RainLayer.svelte` (it reports `<script> was left open`
   although the file is structurally sound and compiles and ships correctly), which
   means **that component's props are not type-checked at all**. Manually verify its
   two props, `count` and `opacity` (plus the cosmetic `variant`), against both callers,
   `App.svelte` and `HeroSplash.svelte`: confirm the values passed are numbers in
   sensible ranges and that no caller passes a prop the component does not declare.
   This closes the only known unchecked-props hole in the tree (Fable ruling,
   2026-07-26b).

## 5. Not done in this pass

Prep only. No audit was run, no findings adjudicated, no Desktop pack regenerated, and
no game behaviour was changed. The audit is a separate fresh session, gated on the
owner's re-test verdict and any round-4 items.
